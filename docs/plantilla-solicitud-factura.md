# Plantilla canónica — Solicitud de Factura Grupo MAS

Fuente original: `archivos/Solicitud factura Desempeño  2025 - noviembre.xls`
(ejemplo: solicitud Soprole de noviembre 2025).

La aplicación debe poder **exportar un XLSX visualmente indistinguible** de
esta plantilla. Cualquier desviación de etiquetas, orden o cálculos rompe el
criterio de "fidelidad".

## Layout original observado

| Sección | Etiqueta original | Ejemplo Soprole |
|---|---|---|
| Cabecera | `SOLICITUD DE FACTURA GRUPO MAS` | (título) |
| | `Facturar Por` | `MAS CONSULTORES S.A.` |
| | `Cliente` | `Soprole` |
| **INFORMACIÓN CLIENTE** | `Razón Social` | `Soprole S.A.` |
| | `RUT` | `76.101.812-4` |
| | `Giro` | `Elaboradora de productos lácteos` |
| | `Dirección` | `Av. Vitacura 4465, Vitacura` |
| | `Orden de Compra / Nota de Pedido` | `1600236944` |
| | `HES` | `N/A` |
| | `Glosa` | `Servicio de administración y soporte mensual Plataforma Nutrir MAS` |
| | `Neto` | `2.775.051,3` |
| | `Monto IVA` | `527.260` |
| | `Total` | `3.302.311,3` |
| | `Receptor de Documento` | `Jeannette del Carmen Nanjari Barrera / jeannette.nanjari@soprole.cl / Pablo Ruedi / pablo.ruedi@soprole.cl` |
| **Información Interna** | `Fecha de Solicitud` | `2025-11-27` (originalmente número Excel `45988`) |
| | `Centro de Proyecto` | `MS25008 — 1.387.525,65` y `MS25009 — 1.387.525,65` |
| | `Área` | `MAS Plataformas` |
| | `Encargado de Solicitud` | `Macarena Abásolo` |
| | `Observaciones` | `UF 39.643,59 / 27-11-2025` |
| Notas finales | (Texto fijo de la plantilla, ver abajo) | — |

### Texto fijo al pie del XLSX

```
NOTAS:
*Si la solicitud es exenta de IVA, solo completar el monto total.
*Si la factura es con IVA, solo debes agregar el monto neto y automáticamente
  dará el valor de IVA y bruto.
*Para efecto de las proyecciones del 2023, deberá agregarse una columna al lado
  de cada CP, indicando si el proyecto está afecto, exento de IVA o mixto.
*En las proyecciones debe incluirse el valor total de proyecto, incluyendo el IVA,
  si este está afecto a IVA, ya que ese es el valor que se facturará y corresponderá a la
  caja que se percibirá por el cobro de esa factura.
```

## Mapeo plantilla → modelo de datos

| Campo plantilla | Entidad / atributo |
|---|---|
| `Facturar Por` | `solicitud_factura.empresa_emisora` (`MAS_CONSULTORES` \| `MAS_CAPACITACION`) |
| `Cliente` | `cliente.nombre_corto` (FK desde `solicitud_factura.cliente_id`) |
| `Razón Social` | `cliente.razon_social` |
| `RUT` | `cliente.rut` |
| `Giro` | `cliente.giro` |
| `Dirección` | `cliente.direccion` |
| `Orden de Compra / Nota de Pedido` | `solicitud_factura.oc_numero` |
| `HES` | `solicitud_factura.hes_numero` (nullable, `N/A` si vacío) |
| `Glosa` | `solicitud_factura.glosa` |
| `Neto` | `solicitud_factura.monto_neto_clp` (calculado) |
| `Monto IVA` | `solicitud_factura.monto_iva_clp` (0 si exenta) |
| `Total` | `solicitud_factura.monto_total_clp` |
| `Receptor de Documento` | join con `solicitud_receptor` → `receptor` (nombre + email) |
| `Fecha de Solicitud` | `solicitud_factura.fecha_solicitud` |
| `Centro de Proyecto` (lista) | `solicitud_cp[]` (cada uno con `cp.codigo` y `monto`) |
| `Área` | `solicitud_factura.area` |
| `Encargado de Solicitud` | `coordinador.nombre` (vía `cliente.coordinador_id` o `solicitud.encargado_id`) |
| `Observaciones` | `solicitud_factura.observaciones` (incluye UF y fecha si UF aplica) |

## Reglas de cálculo

```
Si empresa_emisora = MAS_CONSULTORES → afecto IVA (19%):
    monto_iva_clp   = round(monto_neto_clp * 0.19)
    monto_total_clp = monto_neto_clp + monto_iva_clp

Si empresa_emisora = MAS_CAPACITACION → exento:
    monto_iva_clp   = 0
    monto_total_clp = monto_neto_clp

Si moneda_base = UF:
    monto_neto_clp = round(sum(items.uf_unitario * items.cantidad) * uf_valor)
    Persistir uf_valor y uf_fecha en la solicitud al momento de emitir.

Suma de solicitud_cp[].monto debe igualar monto_neto_clp (o monto_total_clp
según política — confirmar con negocio en Fase 1; ejemplo Soprole sugiere neto).
```

## Versionado

- Cada plantilla XLSX vive como blob en `documento_exportado.archivo` y queda asociado a `version_plantilla`.
- Cambios futuros al layout incrementan `version_plantilla` y no afectan documentos previos.
- La definición declarativa del layout vive en `backend/src/exportador/plantilla-v1.json` (a crear en Fase 1).

## Pendiente de validar con negocio

1. ¿La fila de `Centro de Proyecto` admite siempre dos columnas (CP y monto) o varía?
2. ¿`Área` es texto libre o catálogo (MAS Plataformas, MAS Capacitación, etc.)?
3. ¿La suma de CP debe ser sobre neto o sobre total?
4. ¿Existe una variante de plantilla para Más Capacitación (SENCE) distinta visualmente?
