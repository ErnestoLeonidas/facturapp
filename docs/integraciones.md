# Integraciones externas

Todas las integraciones viven en el backend. El frontend nunca consume APIs
externas directamente — solo `/api/*` propios.

## 1. UF — mindicador.cl

### Fuente

- Endpoint público: `https://mindicador.cl/api/uf/{dd-mm-yyyy}`
- Respuesta: JSON con `serie[0].valor`.
- Sin autenticación.

### Proxy propio

`GET /api/uf?fecha=YYYY-MM-DD`

### Política de cache

| Caso | Política |
|---|---|
| Fecha pasada (cerrada) | Cache permanente en `uf_cache` |
| Fecha actual / futura cercana | TTL corto (15 min) y revalidar |
| Error temporal del proveedor | Reintentar (3 intentos, backoff 500ms / 2s / 5s); si hay valor cacheado válido, devolverlo con `cached: true` y `error.code = "UF_STALE"` (warning) |
| Error definitivo | Devolver `error.code = "UF_UNAVAILABLE"` y permitir override manual desde UI con justificación auditada |

### Persistencia en solicitud

Al transicionar a `Emitida`, copiar `uf_fecha` y `uf_valor` a la fila de
`solicitud_factura`. A partir de ahí, ese valor es **inmutable** aunque el
cache cambie.

## 2. Google Sheets

### Auth

- **Service Account** con archivo JSON en variable de entorno `GOOGLE_SA_JSON_PATH`.
- Compartir cada sheet con el `client_email` del service account.
- Scopes: `https://www.googleapis.com/auth/spreadsheets.readonly` (lectura),
  `https://www.googleapis.com/auth/spreadsheets` (escritura, solo si negocio lo pide).

### Datasets a sincronizar (lectura)

| Dataset | Origen | Operación recomendada | Frecuencia |
|---|---|---|---|
| Clientes | Hoja "Base de Datos Bot Facturación" → `Facturacion` | `spreadsheets.values.get` con rango `Facturacion!A1:G1000` | Diaria + a demanda |
| Coordinadores y frecuencias | Mismo libro → `Config` | `spreadsheets.values.batchGet` | Diaria |
| CPs / Áreas | Hoja "Proyecciones" (a definir SpreadsheetId con negocio) | `batchGet` | Diaria |
| Plantilla solicitud | Drive (`files.export` a `xlsx`) si vive como Google Sheet | A demanda | Manual |

### Configuración

`backend/config/sheets.json` (en producción usar variables de entorno):

```json
{
  "spreadsheets": {
    "base_facturacion": { "id": "<SHEET_ID>", "rango_facturacion": "Facturacion!A1:G2000", "rango_config": "Config!A1:F100" },
    "proyecciones": { "id": "<SHEET_ID>" }
  }
}
```

### Tolerancia a fallos

- Reintentos con backoff exponencial truncado en errores 429 / 5xx.
- Sync por lote (`batchGet`), nunca por celda.
- Si falla, mantener último snapshot válido y registrar incidente en
  `bitacora_integracion` (a crear si negocio quiere panel).

### Endpoints expuestos

- `POST /api/integraciones/google-sheets/sync?dataset=clientes`
- `POST /api/integraciones/google-sheets/sync?dataset=coordinadores`
- `POST /api/integraciones/google-sheets/sync?dataset=proyecciones`
- `GET  /api/integraciones/google-sheets/estado` → última sync por dataset.

## 3. Google Drive

Solo necesario si la plantilla XLSX vive en Drive (recomendado) o para
descargar adjuntos.

### Operaciones

| Caso | Endpoint Drive |
|---|---|
| Buscar plantilla por nombre | `files.list` con `q=name='plantilla-solicitud-factura' and mimeType='application/vnd.google-apps.spreadsheet'` |
| Descargar binario | `files.get` con `alt=media` |
| Exportar Sheet a XLSX | `files.export` con `mimeType=application/vnd.openxmlformats-officedocument.spreadsheetml.sheet` |

### Estrategia recomendada

1. Negocio mantiene la plantilla en Drive como fuente de verdad visual.
2. Backend exporta a XLSX al iniciar y guarda el blob en `version_plantilla.definicion_layout` (o como archivo en `backend/storage/plantillas/`).
3. Cuando negocio actualiza la plantilla, dispara `POST /api/version-plantilla/sync` que crea una nueva versión sin afectar las anteriores.

## 4. Slack (recordatorios — Fase 2/3)

La base de datos del bot ya trae `id_coordinador` (Slack user ID).
Aprovechable para:

- Recordatorio el día 15 de cada mes a cada coordinador con sus solicitudes pendientes.
- Notificación al cambiar a `EnRevision`, `Aprobada`, `Rechazada`.

Implementación: cron diario + Slack Web API (`chat.postMessage`), con bot
token en variable de entorno.

## 5. SII (futuro — fuera de alcance MVP)

La emisión real de la factura tributaria se sigue haciendo manualmente por
Administración. La app produce la **solicitud**, no el DTE. Una integración
SII con ldoc / Bsale / facturación.cl es posible pero queda explícitamente
fuera del MVP.

## Variables de entorno

```
PORT=3000
DATABASE_URL=postgres://user:pass@host:5432/facturapp
SESSION_SECRET=...

# Google
GOOGLE_SA_JSON_PATH=./service-account.json
GOOGLE_SHEETS_BASE_FACTURACION_ID=...
GOOGLE_SHEETS_PROYECCIONES_ID=...
GOOGLE_DRIVE_PLANTILLA_FILE_ID=...

# Slack (Fase 2/3)
SLACK_BOT_TOKEN=xoxb-...

# UF
UF_API_BASE=https://mindicador.cl/api/uf
UF_CACHE_TTL_HOURS=24
```
