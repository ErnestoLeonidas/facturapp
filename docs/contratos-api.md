# Contratos API

API JSON propia. Todos los endpoints viven bajo `/api/`.

## Convenciones generales

- **Versionado**: prefijo opcional `/api/v1/`. Por simplicidad fase 1 no versiona.
- **Content-Type**: `application/json; charset=utf-8`.
- **Autenticación**: header `Authorization: Bearer <token>` desde fase 2.
- **IDs**: UUID v4 como string.
- **Fechas**: ISO 8601 (`YYYY-MM-DD` o `YYYY-MM-DDTHH:mm:ssZ`).
- **Montos**: enteros o decimales en CLP / UF según contexto. Sin separador de miles.

## Envelope unificado

### Éxito

```json
{
  "ok": true,
  "data": { },
  "meta": {
    "requestId": "req_20260503_001",
    "cached": false,
    "generatedAt": "2026-05-03T19:00:00-04:00"
  },
  "error": null
}
```

### Error

```json
{
  "ok": false,
  "data": null,
  "meta": { "requestId": "req_20260503_002" },
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Faltan campos obligatorios para enviar a revisión.",
    "details": { "campos": ["receptores", "oc_numero"] }
  }
}
```

## Códigos de error tipificados

| Código | Significado |
|---|---|
| `VALIDATION_ERROR` | Datos incompletos o inválidos |
| `NOT_FOUND` | Recurso no existe |
| `STATE_TRANSITION_INVALID` | Transición de estado no permitida |
| `UF_UNAVAILABLE` | No se obtuvo UF para la fecha |
| `SHEETS_SYNC_FAILED` | Falló sincronización con Google Sheets |
| `EXPORT_TEMPLATE_MISSING` | Plantilla de exportación no disponible |
| `TIME_ENTRY_FORBIDDEN` | Tiempo no se puede cargar a esa solicitud |
| `UNAUTHORIZED` | Sin autenticación válida |
| `FORBIDDEN` | Sin permisos para la acción |
| `INTERNAL_ERROR` | Error no controlado |

## Endpoints

### Clientes

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/api/clientes?q=&estado=&frecuencia=` | Listar con filtros |
| POST | `/api/clientes` | Crear |
| GET | `/api/clientes/{id}` | Detalle |
| PATCH | `/api/clientes/{id}` | Editar |
| DELETE | `/api/clientes/{id}` | Desactivar (soft) |
| GET | `/api/clientes/{id}/productos` | Productos asociados |
| PUT | `/api/clientes/{id}/productos` | Reemplazar lista |

### Receptores

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/api/receptores?clienteId=` | Listar por cliente |
| POST | `/api/receptores` | Crear |
| PATCH | `/api/receptores/{id}` | Editar |
| DELETE | `/api/receptores/{id}` | Desactivar |

### Coordinadores

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/api/coordinadores` | Listar |
| POST | `/api/coordinadores` | Crear |
| PATCH | `/api/coordinadores/{id}` | Editar |

### Productos / CP

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/api/productos` | Catálogo |
| POST | `/api/productos` | Crear |
| GET | `/api/cp` | Catálogo de centros de proyecto |
| POST | `/api/cp` | Crear CP |
| PATCH | `/api/cp/{id}` | Editar CP |

### Desarrolladores

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/api/desarrolladores` | Listar |
| POST | `/api/desarrolladores` | Crear |
| PATCH | `/api/desarrolladores/{id}` | Editar |

### Solicitudes de factura

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/api/solicitudes?clienteId=&estado=&periodo=&tipo=&q=` | Historial con filtros |
| POST | `/api/solicitudes` | Crear (ver payload abajo) |
| GET | `/api/solicitudes/{id}` | Detalle |
| PATCH | `/api/solicitudes/{id}` | Editar (solo si estado lo permite) |
| POST | `/api/solicitudes/{id}/estado` | Transición de estado |
| POST | `/api/solicitudes/{id}/duplicar` | Duplicar como nueva |
| GET | `/api/solicitudes/{id}/historial` | Línea de tiempo de estados |

### Solicitudes recurrentes

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/api/solicitudes-programadas` | Listar plantillas |
| POST | `/api/solicitudes-programadas` | Crear plantilla |
| PATCH | `/api/solicitudes-programadas/{id}` | Editar |
| POST | `/api/solicitudes-programadas/{id}/generar?periodo=YYYY-MM` | Generar instancia para un período |

### Asignaciones y tiempos

| Método | Endpoint | Descripción |
|---|---|---|
| POST | `/api/solicitudes/{id}/asignaciones` | Asignar desarrolladores |
| DELETE | `/api/solicitudes/{id}/asignaciones/{asigId}` | Quitar asignación |
| GET | `/api/solicitudes/{id}/tiempos` | Tiempos cargados |
| POST | `/api/solicitudes/{id}/tiempos` | Registrar tiempo |
| PATCH | `/api/tiempos/{id}` | Corregir tiempo |
| GET | `/api/desarrolladores/{id}/tiempos?desde=&hasta=` | Vista personal |

### Exportación

| Método | Endpoint | Descripción |
|---|---|---|
| POST | `/api/exportaciones/solicitud/{id}` | Genera XLSX y devuelve `{ exportId, url }` |
| GET | `/api/exportaciones/{id}` | Descarga el archivo (binary `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`) |

### Reportes

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/api/reportes/clientes` | Ranking y consolidado |
| GET | `/api/reportes/clientes/{id}?periodoDesde=&periodoHasta=` | Panel detallado |
| GET | `/api/reportes/gastos?desde=&hasta=` | Serie temporal |
| GET | `/api/reportes/desarrolladores/{id}?desde=&hasta=` | Productividad |

### Integraciones

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/api/uf?fecha=YYYY-MM-DD` | UF cacheada por fecha |
| POST | `/api/integraciones/google-sheets/sync?dataset=` | Sync manual de un dataset |
| GET | `/api/integraciones/google-sheets/estado` | Última sync de cada dataset |

## Ejemplos de payloads

### POST `/api/solicitudes` (crear borrador)

```json
{
  "tipo": "mensual",
  "cliente_id": "CLI-soprole",
  "coordinador_id": "COO-mabasolo",
  "empresa_emisora": "MAS_CONSULTORES",
  "periodo": "2026-05",
  "fecha_solicitud": "2026-05-03",
  "oc_numero": "1600236944",
  "hes_numero": null,
  "glosa": "Servicio de administración y soporte mensual Plataforma Nutrir MAS",
  "area": "MAS Plataformas",
  "moneda_base": "CLP",
  "uf_fecha": null,
  "items": [
    {
      "descripcion": "Soporte mensual",
      "cantidad": 1,
      "clp_unitario": 2775051
    }
  ],
  "cps": [
    { "cp_codigo": "MS25008", "monto_clp": 1387525 },
    { "cp_codigo": "MS25009", "monto_clp": 1387525 }
  ],
  "receptores": [
    { "receptor_id": "REC-jeannette" },
    { "receptor_id": "REC-pruedi" }
  ],
  "observaciones": ""
}
```

### POST `/api/solicitudes/{id}/estado`

```json
{
  "hacia": "EnRevision",
  "comentario": "Aprobado por cliente vía mail 2026-05-02"
}
```

### Respuesta GET `/api/uf?fecha=2026-05-03`

```json
{
  "ok": true,
  "data": {
    "fecha": "2026-05-03",
    "valor": 39850.12,
    "source": "mindicador.cl",
    "cached": true,
    "obtenido_at": "2026-05-03T08:01:14-04:00"
  },
  "meta": { "requestId": "req_uf_001" },
  "error": null
}
```

### Respuesta GET `/api/solicitudes/{id}` (detalle)

```json
{
  "ok": true,
  "data": {
    "id": "SF-2026-00045",
    "folio": "SF-2026-00045",
    "tipo": "mensual",
    "estado": "Emitida",
    "cliente": {
      "id": "CLI-soprole",
      "nombre_corto": "Soprole",
      "razon_social": "Soprole S.A.",
      "rut": "76.101.812-4",
      "giro": "Elaboradora de productos lácteos",
      "direccion": "Av. Vitacura 4465, Vitacura"
    },
    "coordinador": { "id": "COO-mabasolo", "nombre": "Macarena Abásolo" },
    "empresa_emisora": "MAS_CONSULTORES",
    "periodo": "2025-11",
    "fecha_solicitud": "2025-11-27",
    "fecha_facturacion": null,
    "oc_numero": "1600236944",
    "hes_numero": null,
    "glosa": "Servicio de administración y soporte mensual Plataforma Nutrir MAS",
    "area": "MAS Plataformas",
    "moneda_base": "CLP",
    "uf_fecha": "2025-11-27",
    "uf_valor": 39643.59,
    "monto_neto_clp": 2775051,
    "monto_iva_clp": 527260,
    "monto_total_clp": 3302311,
    "items": [ /* … */ ],
    "cps": [
      { "cp_codigo": "MS25008", "monto_clp": 1387525.65 },
      { "cp_codigo": "MS25009", "monto_clp": 1387525.65 }
    ],
    "receptores": [
      { "nombre": "Jeannette Nanjari", "email": "jeannette.nanjari@soprole.cl" },
      { "nombre": "Pablo Ruedi", "email": "pablo.ruedi@soprole.cl" }
    ],
    "observaciones": "UF 39.643,59 / 27-11-2025",
    "version_plantilla": "v1",
    "historial": [ /* … */ ]
  }
}
```
