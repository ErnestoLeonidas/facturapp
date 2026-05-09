# Pantallas y flujos

SPA ligera con shell fijo y vistas dinámicas por hash routing.
Bootstrap 5 + jQuery.

## Mapa de navegación

```
#/dashboard
#/solicitudes              (lista con filtros)
#/solicitudes/nueva
#/solicitudes/{id}         (detalle / edición)
#/recurrentes              (plantillas mensuales)
#/recurrentes/{id}
#/clientes                 (lista)
#/clientes/{id}            (ficha)
#/desarrolladores
#/desarrolladores/{id}     (mis solicitudes y tiempos)
#/reportes
#/reportes/cliente/{id}
#/configuracion            (integraciones, UF, plantilla)
```

## 1. Shell

- Sidebar fijo con: Dashboard, Solicitudes, Mensuales, Clientes, Desarrolladores, Reportes, Configuración.
- Barra superior con búsqueda global, badge de notificaciones (sync errors), botón "Nueva solicitud".

## 2. Dashboard

KPIs:
- Solicitudes pendientes por estado (badges).
- Emitidas en el período actual.
- Adicionales activas.
- Clientes con alertas (datos faltantes).

Listas:
- Próximas solicitudes recurrentes a generar.
- Últimas exportaciones.
- Bitácora de integraciones (errores UF / Sheets recientes).

## 3. Solicitudes — lista

Tabla con: folio, cliente, tipo, período, monto total, estado, encargado, acciones.

Filtros: cliente, estado, período, tipo (mensual/adicional), encargado, empresa emisora.
"Filtros guardados" por usuario.

Acciones por fila: ver, duplicar, exportar (si aplica), cambiar estado.

## 4. Solicitud — formulario (replica plantilla canónica)

Se divide visualmente en 4 bloques:

**a) Cabecera**
- Facturar Por: select MAS Consultores S.A. / Más Capacitación.
- Cliente: autocompletar.
- Tipo: Mensual / Adicional.
- Período: selector mes-año.
- Estado: chip de solo lectura.

**b) Información cliente** (autocompleta al elegir cliente)
- Razón social, RUT, giro, dirección.
- Edición rápida → enlace a `#/clientes/{id}`.

**c) Datos solicitud**
- OC, HES (con flag `requiere_hes`), Glosa.
- Receptores: multi-select del catálogo del cliente + acción "agregar nuevo".
- Items (tabla editable): producto/descripcion, cantidad, UF unitaria o CLP unitario, subtotal.
- CPs (tabla editable): código CP, monto UF y monto CLP calculado.
- Validación visual: la suma de CPs debe igualar el neto.

**d) Aside resumen**
- Moneda base (UF/CLP).
- UF fecha + valor (botón "buscar UF" → `/api/uf`).
- Neto, IVA (auto si afecto), Total.
- Estado actual + botones de acción según estado.
- Si tipo = Adicional: subpestaña con asignación de desarrolladores y horas estimadas.

**Acciones**: Guardar borrador, Enviar a revisión, Aprobar, Rechazar, Emitir, Marcar facturada, Anular, Duplicar, Exportar XLSX.

## 5. Solicitudes recurrentes (mensuales)

- Lista de plantillas activas con próxima fecha de generación.
- Calendario mensual visual con marcadores por cliente.
- Crear plantilla = formulario equivalente al de solicitud, marcando como base.
- Botón "Generar período YYYY-MM" que crea instancias borrador.
- Job automático recomendado: generar en el `dia_emision` de cada cliente.

## 6. Clientes

**Lista**: tabla con cliente, frecuencia, día facturación, coordinador, estado, último periodo facturado.

**Ficha**:
- Datos maestros editables.
- Receptores asociados (CRUD inline).
- Productos / CPs asociados.
- Resumen financiero: solicitudes últimos 12 meses, gasto acumulado, mix recurrente vs adicional.
- Historial de solicitudes recientes.
- Notas operativas (texto libre, visible en dashboard si tiene alertas).

## 7. Desarrolladores

**Lista**: nombre, equipo, asignaciones activas, horas mes actual.

**Ficha personal** (también accesible para el propio desarrollador en fase 2):
- Solicitudes adicionales asignadas.
- Calendario de carga de tiempo.
- Formulario rápido: solicitud + fecha + minutos + descripción.
- Indicador de desviación horas estimadas vs reales.

## 8. Reportes

**Resumen general**: ranking de clientes por gasto en el período, mix recurrente vs adicional, top productos / CPs.

**Por cliente**: serie temporal mensual, desglose por CP y producto, horas dev asociadas, comparativo año actual vs anterior.

**Por desarrollador**: productividad por solicitud, distribución por cliente, desviación.

**Exportable**: cada vista permite descargar XLSX.

## 9. Configuración e integraciones

- Estado UF: último valor obtenido, errores recientes, botón "refrescar hoy".
- Google Sheets: última sincronización por dataset, errores, botón "sincronizar ahora".
- Plantilla: versión vigente, fecha, opción de ver versiones anteriores.
- Datos del Service Account (solo lectura: client_email, scopes).

## Wireframes referenciales

Ver `deep-research-report.md` (secciones del wireframe shell y solicitud) — el diseño aprobado es el ahí descrito, ajustado a:
- Selector "Facturar Por" en cabecera.
- Sección de **CPs** (no estaba en el wireframe original, sí en la plantilla real).
- Receptores multi-selección (uno por línea en la exportación).

## Flujo crítico — emisión mensual happy path

1. Día `dia_emision` del cliente → job genera solicitud `Borrador` desde la plantilla recurrente.
2. Coordinador revisa, completa OC/HES si corresponde, ajusta CPs.
3. Coordinador → "Enviar a revisión".
4. Admin/Facturación → "Aprobar".
5. Coordinador → "Emitir" → app obtiene UF del día, persiste valores, exporta XLSX.
6. XLSX se envía manualmente a Administración (o automático vía email, fase 2).
7. Cuando se confirma SII → Admin marca "Facturada" con número.
8. Reporte por cliente actualiza serie temporal automáticamente.
