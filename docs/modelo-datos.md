# Modelo de datos

Diseñado para Postgres. Compatible con SQLite si se usan tipos básicos (`TEXT`,
`INTEGER`, `REAL`).

## Tablas

### `coordinador`
Personas internas responsables del cliente. Datos extraídos del bot de Slack.

| Columna | Tipo | Notas |
|---|---|---|
| `id` | uuid PK | |
| `nombre` | text NOT NULL | |
| `email` | text | |
| `slack_user_id` | text | ej. `U07AKJLQCTY` |
| `activo` | boolean DEFAULT true | |
| `created_at` | timestamptz | |

### `cliente`
Maestro comercial.

| Columna | Tipo | Notas |
|---|---|---|
| `id` | uuid PK | |
| `nombre_corto` | text NOT NULL UNIQUE | "Soprole" |
| `razon_social` | text | "Soprole S.A." |
| `rut` | text | "76.101.812-4" |
| `giro` | text | |
| `direccion` | text | |
| `coordinador_id` | uuid FK → coordinador | |
| `frecuencia` | text CHECK in (Mensual, Bimensual, Trimestral, Anual, Adicional) | |
| `dia_facturacion` | int | 1..31 |
| `mes_inicio` | int | 1..12 (para bimensual/trimestral) |
| `requiere_hes` | boolean DEFAULT false | true para Transelect |
| `estado` | text | Activo, En espera, Inactivo |
| `notas` | text | |
| `created_at` / `updated_at` | timestamptz | |

### `receptor`
Personas del cliente que reciben el documento.

| Columna | Tipo | Notas |
|---|---|---|
| `id` | uuid PK | |
| `cliente_id` | uuid FK → cliente | |
| `nombre` | text NOT NULL | |
| `email` | text NOT NULL | |
| `cargo` | text | |
| `activo` | boolean DEFAULT true | |

### `cp` (Centro de Proyecto)

| Columna | Tipo | Notas |
|---|---|---|
| `id` | uuid PK | |
| `codigo` | text NOT NULL UNIQUE | "MS25008" |
| `nombre` | text | "Plataforma Nutrir Soprole" |
| `tipo_cp` | text CHECK (`Administración y Operación`, `Construcción`, `Horas de Desarrollo`) | clasificación del CP |
| `area` | text | "MAS Plataformas" |
| `cliente_id` | uuid FK → cliente (nullable) | |
| `activo` | boolean DEFAULT true | |

### `producto`
Catálogo de servicios.

| Columna | Tipo | Notas |
|---|---|---|
| `id` | uuid PK | |
| `codigo` | text UNIQUE | |
| `nombre` | text NOT NULL | |
| `categoria` | text | |
| `activo` | boolean DEFAULT true | |

### `cliente_producto`
Productos contratados por cliente con vigencia.

| Columna | Tipo | Notas |
|---|---|---|
| `id` | uuid PK | |
| `cliente_id` | uuid FK | |
| `producto_id` | uuid FK | |
| `vigencia_desde` | date | |
| `vigencia_hasta` | date | |
| `condiciones` | jsonb | |

### `desarrollador`

| Columna | Tipo | Notas |
|---|---|---|
| `id` | uuid PK | |
| `nombre` | text | |
| `email` | text | |
| `equipo` | text | |
| `activo` | boolean DEFAULT true | |

### `solicitud_factura`
Núcleo del sistema.

| Columna | Tipo | Notas |
|---|---|---|
| `id` | uuid PK | |
| `folio` | text UNIQUE | autogenerado tipo `SF-2026-00045` |
| `tipo` | text CHECK (`mensual`, `adicional`) | |
| `cliente_id` | uuid FK | |
| `coordinador_id` | uuid FK | encargado de la solicitud |
| `empresa_emisora` | text CHECK (`MAS_CONSULTORES`, `MAS_CAPACITACIONES`) | |
| `periodo` | text | "2026-05" |
| `fecha_solicitud` | date | |
| `fecha_facturacion` | date | nullable hasta facturar |
| `oc_numero` | text | |
| `hes_numero` | text | |
| `glosa` | text NOT NULL | |
| `area` | text | "MAS Plataformas" |
| `moneda_base` | text CHECK (`UF`, `CLP`) | |
| `uf_fecha` | date | |
| `uf_valor` | numeric(12,2) | persistido al emitir |
| `monto_neto_clp` | numeric(14,2) | |
| `monto_iva_clp` | numeric(14,2) | |
| `monto_total_clp` | numeric(14,2) | |
| `observaciones` | text | |
| `estado` | text | ver `docs/estados.md` |
| `version_plantilla` | text | "v1" |
| `programada_id` | uuid FK → solicitud_programada | si nació de una recurrente |
| `created_at` / `updated_at` | timestamptz | |

### `solicitud_item`
Detalle (productos / horas / hitos).

| Columna | Tipo | Notas |
|---|---|---|
| `id` | uuid PK | |
| `solicitud_id` | uuid FK | |
| `producto_id` | uuid FK (nullable) | |
| `descripcion` | text NOT NULL | |
| `codigo_ref` | text | "MS25078" |
| `cantidad` | numeric(12,2) DEFAULT 1 | |
| `uf_unitaria` | numeric(12,2) | |
| `clp_unitario` | numeric(14,2) | |
| `subtotal_clp` | numeric(14,2) | calculado |

### `solicitud_cp`
Reparto por Centro de Proyecto (la plantilla muestra ≥1 fila de CP con monto).

| Columna | Tipo | Notas |
|---|---|---|
| `id` | uuid PK | |
| `solicitud_id` | uuid FK | |
| `cp_id` | uuid FK → cp | |
| `monto_uf` | numeric(12,2) | monto ingresado por usuario |
| `monto_clp` | numeric(14,2) NOT NULL | calculado desde `monto_uf * uf_valor`; se recalcula al exportar |
| `orden` | int | para preservar el orden en la exportación |

### `solicitud_receptor`
Tabla puente: receptores incluidos en la solicitud.

| Columna | Tipo | Notas |
|---|---|---|
| `solicitud_id` | uuid FK | PK compuesta |
| `receptor_id` | uuid FK | PK compuesta |

### `solicitud_programada`
Plantilla recurrente.

| Columna | Tipo | Notas |
|---|---|---|
| `id` | uuid PK | |
| `cliente_id` | uuid FK | |
| `nombre` | text | "Soprole — Soporte mensual Nutrir" |
| `dia_emision` | int | día del mes para generar |
| `frecuencia` | text | (igual que `cliente.frecuencia`) |
| `mes_inicio` | int | |
| `activa` | boolean | |
| `payload_base` | jsonb | snapshot de la solicitud base (glosa, items, CP, receptores, montos, empresa_emisora) |
| `proxima_generacion` | date | |

### `asignacion_solicitud`
Vincula una solicitud adicional con desarrolladores.

| Columna | Tipo | Notas |
|---|---|---|
| `id` | uuid PK | |
| `solicitud_id` | uuid FK | |
| `desarrollador_id` | uuid FK | |
| `rol` | text | |
| `horas_estimadas` | numeric(8,2) | |
| `activo` | boolean | |

### `registro_tiempo`
Carga de tiempo del desarrollador sobre una solicitud adicional.

| Columna | Tipo | Notas |
|---|---|---|
| `id` | uuid PK | |
| `solicitud_id` | uuid FK | |
| `desarrollador_id` | uuid FK | |
| `fecha` | date | |
| `minutos` | int CHECK > 0 | |
| `descripcion` | text | |
| `aprobado` | boolean DEFAULT false | |

### `historial_estado`

| Columna | Tipo | Notas |
|---|---|---|
| `id` | uuid PK | |
| `solicitud_id` | uuid FK | |
| `estado_desde` | text | |
| `estado_hacia` | text NOT NULL | |
| `fecha` | timestamptz DEFAULT now() | |
| `usuario` | text | |
| `comentario` | text | |

### `documento_exportado`

| Columna | Tipo | Notas |
|---|---|---|
| `id` | uuid PK | |
| `solicitud_id` | uuid FK | |
| `tipo` | text | "solicitud_factura_xlsx" |
| `formato` | text | "xlsx" |
| `version_plantilla` | text | |
| `archivo` | bytea (o ruta) | |
| `checksum` | text | |
| `generado_at` | timestamptz | |
| `generado_por` | text | |

### `uf_cache`

| Columna | Tipo | Notas |
|---|---|---|
| `fecha` | date PK | |
| `valor` | numeric(12,2) NOT NULL | |
| `source` | text | "mindicador.cl" |
| `obtenido_at` | timestamptz | |

### `version_plantilla`

| Columna | Tipo | Notas |
|---|---|---|
| `id` | text PK | "v1", "v2", … |
| `descripcion` | text | |
| `definicion_layout` | jsonb | layout declarativo (celdas, estilos) |
| `vigente_desde` | date | |
| `vigente_hasta` | date | nullable |

## Importacion desde Google Sheets

La fuente `base_facturacion` viene desde:

`https://docs.google.com/spreadsheets/d/1YFn9QfyIympuqS7zeF2jtfSjOTwBI184CP4mkRUB4V0/edit?usp=sharing`

Columnas de entrada: `id`, `cliente_id`, `cliente`, `codigo`, `nombre`,
`tipo_cp`, `tipo_impuesto`, `mes`, `anio`, `monto_uf`, `moneda`, `estado`,
`observaciones`, `fecha_estimada_facturacion`.

Mapeo recomendado:

| Columna sheet | Destino | Nota |
|---|---|---|
| `id` | `solicitud_programada.payload_base.source_row_id` o tabla staging | Mantener para upsert/idempotencia |
| `cliente_id` | `cliente.id_externo` o `payload_base.cliente_id_externo` | Si no existe columna fisica, guardar en staging/payload |
| `cliente` | `cliente.nombre_corto` | Crear/actualizar maestro |
| `codigo` | `cp.codigo` y `solicitud_item.codigo_ref` | Codigo MS/CP asociado |
| `nombre` | `cp.nombre`, `producto.nombre` y `solicitud_item.descripcion` | Nombre del CP, proyecto o servicio facturable |
| `tipo_cp` | `cp.tipo_cp` | Normalizar valores antes de validar CHECK |
| `tipo_impuesto` | `solicitud_factura.empresa_emisora` / regla IVA en payload | Define afecto/exento; confirmar catalogo |
| `mes` + `anio` | `solicitud_factura.periodo` | Formato `YYYY-MM`; si falta `mes`, dejar `periodo = null` |
| `monto_uf` | `solicitud_item.uf_unitaria` | Nullable; requiere completar antes de emitir |
| `moneda` | `solicitud_factura.moneda_base` | Esperado `UF` o `CLP` |
| `estado` | `solicitud_factura.estado` | Nullable; usar default interno si viene vacio |
| `observaciones` | `solicitud_factura.observaciones` | Nullable |
| `fecha_estimada_facturacion` | `solicitud_programada.proxima_generacion` o campo staging | Nullable; no reemplaza `fecha_facturacion` real |

Los campos `mes`, `monto_uf`, `estado`, `observaciones` y
`fecha_estimada_facturacion` pueden venir vacios. La importacion debe aceptar
esas celdas como `null` y registrar alertas de completitud solo cuando bloqueen
la emision o exportacion.

La planilla no incluye area del CP por empresa. Para `cp.area`, usar `null`
en la importacion inicial o completar desde un catalogo interno cuando negocio
lo defina.

## Índices recomendados

- `solicitud_factura(cliente_id, periodo)`
- `solicitud_factura(estado)`
- `solicitud_factura(fecha_solicitud DESC)`
- `solicitud_cp(solicitud_id)`
- `registro_tiempo(desarrollador_id, fecha)`
- `historial_estado(solicitud_id, fecha DESC)`
- `uf_cache(fecha)`
