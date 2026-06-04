# Integraciones externas

Todas las integraciones viven en el backend. El frontend nunca consume APIs
externas directamente; solo `/api/*` propios.

## 1. UF - mindicador.cl

### Fuente

- Endpoint publico: `https://mindicador.cl/api/uf/{dd-mm-yyyy}`
- Respuesta: JSON con `serie[0].valor`.
- Sin autenticacion.

### Proxy propio

`GET /api/uf?fecha=YYYY-MM-DD`

### Politica de cache

| Caso | Politica |
|---|---|
| Fecha pasada (cerrada) | Cache permanente en `uf_cache` |
| Fecha actual / futura cercana | TTL corto (15 min) y revalidar |
| Error temporal del proveedor | Reintentar (3 intentos, backoff 500ms / 2s / 5s); si hay valor cacheado valido, devolverlo con `cached: true` y `error.code = "UF_STALE"` (warning) |
| Error definitivo | Devolver `error.code = "UF_UNAVAILABLE"` y permitir override manual desde UI con justificacion auditada |

### Persistencia en solicitud

Al transicionar a `Emitida`, copiar `uf_fecha` y `uf_valor` a la fila de
`solicitud_factura`. A partir de ahi, ese valor es **inmutable** aunque el
cache cambie.

## 2. Google Sheets

### Auth

- **Service Account** con archivo JSON en variable de entorno `GOOGLE_SA_JSON_PATH`.
- Compartir cada sheet con el `client_email` del service account, incluso si el
  link esta como lector.
- Scopes: `https://www.googleapis.com/auth/spreadsheets.readonly` (lectura),
  `https://www.googleapis.com/auth/spreadsheets` (escritura, solo si negocio lo pide).

### Datasets a sincronizar (lectura)

| Dataset | Origen | Operacion recomendada | Frecuencia |
|---|---|---|---|
| Base facturacion | Google Sheet `1YFn9QfyIympuqS7zeF2jtfSjOTwBI184CP4mkRUB4V0` | `spreadsheets.values.get` sobre la pestana principal con rango `A:O` | Diaria + a demanda |
| Clientes / CPs / servicios | Derivados de `base_facturacion` | Normalizar filas por `cliente_id`, `codigo` y `nombre` | Diaria + a demanda |
| CPs / Areas | Hoja "Proyecciones" (a definir SpreadsheetId con negocio) | `batchGet` | Diaria |
| Plantilla solicitud | Drive (`files.export` a `xlsx`) si vive como Google Sheet | A demanda | Manual |

### Base facturacion

Fuente actual compartida como lector:

`https://docs.google.com/spreadsheets/d/1YFn9QfyIympuqS7zeF2jtfSjOTwBI184CP4mkRUB4V0/edit?usp=sharing`

Columnas esperadas, en este orden:

| Columna | Uso en la app | Requerida |
|---|---|---|
| `id` | Identificador externo de la fila importada | Si |
| `cliente_id` | Llave externa/canonica del cliente | Si |
| `cliente` | Nombre visible del cliente | Si |
| `codigo` | Codigo CP / MS asociado a la fila | Si |
| `nombre` | Nombre del CP, proyecto o servicio facturable | Si |
| `tipo_cp` | Clasificacion del CP | Si |
| `tipo_impuesto` | Regla tributaria para IVA/exento | Si |
| `mes` | Mes de facturacion/proyeccion | No |
| `anio` | Anio de facturacion/proyeccion | Si |
| `monto_uf` | Monto base en UF | No |
| `moneda` | Moneda declarada (`UF`/`CLP`) | Si |
| `estado` | Estado operativo de la fila/solicitud | No |
| `observaciones` | Notas de negocio | No |
| `fecha_estimada_facturacion` | Fecha esperada de facturacion | No |

Campos que pueden venir vacios desde la planilla y deben aceptarse como
`null`: `mes`, `monto_uf`, `estado`, `observaciones` y
`fecha_estimada_facturacion`.

La planilla no trae columna `area` para cada CP/empresa. En la importacion,
`cp.area` debe quedar `null` o completarse desde un catalogo interno posterior;
no debe bloquear la sincronizacion de `base_facturacion`.

Reglas de importacion:

- No fallar la sincronizacion por filas incompletas si los campos vacios son
  opcionales.
- Mantener `id` como identificador externo para detectar actualizaciones.
- Usar `codigo` como codigo canonico del CP/MS y `nombre` como descripcion
  visible del CP, proyecto o servicio.
- Construir `periodo` solo cuando existan `anio` y `mes`; si falta `mes`, dejar
  la fila como dato maestro/proyeccion pendiente.
- Si `monto_uf` esta vacio, crear la solicitud/programacion sin monto y marcarla
  como pendiente de completar antes de emitir.
- Si `estado` esta vacio, usar estado interno inicial `Borrador` o `Pendiente`
  segun el flujo donde se importe.

### Configuracion

`backend/config/sheets.json` (en produccion usar variables de entorno):

```json
{
  "spreadsheets": {
    "base_facturacion": {
      "id": "1YFn9QfyIympuqS7zeF2jtfSjOTwBI184CP4mkRUB4V0",
      "rango_facturacion": "A:O"
    },
    "proyecciones": { "id": "<SHEET_ID>" }
  }
}
```

### Tolerancia a fallos

- Reintentos con backoff exponencial truncado en errores 429 / 5xx.
- Sync por lote (`batchGet`), nunca por celda.
- Si falla, mantener ultimo snapshot valido y registrar incidente en
  `bitacora_integracion` (a crear si negocio quiere panel).

### Endpoints expuestos

- `POST /api/integraciones/google-sheets/sync?dataset=base_facturacion`
- `POST /api/integraciones/google-sheets/sync?dataset=clientes`
- `POST /api/integraciones/google-sheets/sync?dataset=proyecciones`
- `GET  /api/integraciones/google-sheets/estado` -> ultima sync por dataset.

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
3. Cuando negocio actualiza la plantilla, dispara `POST /api/version-plantilla/sync` que crea una nueva version sin afectar las anteriores.

## 4. Slack (recordatorios - Fase 2/3)

La base de datos del bot ya trae `id_coordinador` (Slack user ID).
Aprovechable para:

- Recordatorio el dia 15 de cada mes a cada coordinador con sus solicitudes pendientes.
- Notificacion al cambiar a `EnRevision`, `Aprobada`, `Rechazada`.

Implementacion: cron diario + Slack Web API (`chat.postMessage`), con bot
token en variable de entorno.

## 5. SII (futuro - fuera de alcance MVP)

La emision real de la factura tributaria se sigue haciendo manualmente por
Administracion. La app produce la **solicitud**, no el DTE. Una integracion
SII con ldoc / Bsale / facturacion.cl es posible pero queda explicitamente
fuera del MVP.

## Variables de entorno

```
PORT=3000
DATABASE_URL=postgres://user:pass@host:5432/facturapp
SESSION_SECRET=...

# Google
GOOGLE_SA_JSON_PATH=./service-account.json
GOOGLE_SHEETS_BASE_FACTURACION_ID=sheet-id
GOOGLE_SHEETS_PROYECCIONES_ID=...
GOOGLE_DRIVE_PLANTILLA_FILE_ID=...

# Slack (Fase 2/3)
SLACK_BOT_TOKEN=replace-with-slack-token

# UF
UF_API_BASE=https://mindicador.cl/api/uf
UF_CACHE_TTL_HOURS=24
```
