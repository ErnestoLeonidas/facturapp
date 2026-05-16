# PLAN — FacturApp Grupo MAS

Plan ejecutable para construir una **web única** de gestión de solicitudes de
facturación para Grupo MAS (MAS Consultores S.A. + Más Capacitación).

Basado en `deep-research-report.md` y los archivos fuente reales en `archivos/`
(plantilla "Solicitud de Factura Grupo MAS", base de datos del bot,
documento de inducción, formato de OC).

---

## 1. Decisiones arquitectónicas firmes

| Tema | Decisión |
|---|---|
| Front | SPA ligera de un solo `index.html` + Bootstrap 5 + jQuery + JS modular por vistas (hash routing) |
| Backend | API JSON propia. Stack recomendado: **Node.js + Express** (homogéneo con front) |
| Persistencia | Postgres (recomendado) o SQLite para fase 1 si no hay infraestructura. Migraciones versionadas |
| Auth | Fase 1: clave única interna. Fase 2: roles (Admin / Coordinador / Desarrollador / Consulta) |
| Integraciones | UF vía proxy `/api/uf` (fuente: mindicador.cl, con cache por fecha). Google Sheets/Drive con Service Account vivendo solo en backend |
| Exportación | Generar XLSX réplica de la plantilla "Solicitud de Factura Grupo MAS" usando `exceljs` |
| Despliegue | Cualquier hosting Node.js (Render, Railway, VPS). Front servido como estáticos por el mismo backend |

**Reglas no negociables:**

- Las credenciales (Service Account JSON, claves API, secret de auth) **nunca** salen del backend.
- Toda solicitud emitida debe persistir el `uf_valor` y `uf_fecha` efectivamente usados.
- La plantilla exportada debe ser **idéntica en estructura, campos y orden** al archivo `archivos/Solicitud factura Desempeño  2025 - noviembre.xls`.
- Cada exportación queda asociada a una `version_plantilla` para que cambios futuros no alteren documentos antiguos.

---

## 2. Plantilla canónica a replicar

Fuente: `archivos/Solicitud factura Desempeño  2025 - noviembre.xls`.

Estructura exacta de campos (en orden):

1. `Facturar Por` → `MAS CONSULTORES S.A.` o `MAS CAPACITACIÓN` (selector según afecto/exento)
2. `Cliente` (nombre corto)
3. **INFORMACIÓN CLIENTE**
   - Razón Social
   - RUT
   - Giro
   - Dirección
4. `Orden de Compra / Nota de Pedido`
5. `HES` (puede ser N/A)
6. `Glosa`
7. `Neto`
8. `IVA` (calculado automático si afecto)
9. `Total`
10. `Receptor de Documento` (multi-línea: nombre + email, varios receptores)
11. **Información Interna**
    - Fecha de Solicitud
    - Centro de Proyecto (lista — múltiples CPs, cada uno con monto)
    - Área
    - Encargado de Solicitud (Coordinador)
    - Observaciones (incluye UF y fecha UF si aplica)

Detalle del mapeo campo → entidad → JSON está en `docs/plantilla-solicitud-factura.md`.

---

## 3. Datos semilla disponibles

De `archivos/Base de Datos Bot Facturación.xlsx`:

- **19 clientes** identificados: Hábitat, Ariztía, Arcor, Aza, Banco Internacional, Beco, Bex, Carozzi, Copec, Emin, Enaex, Flesan, Magotteaux, Resiter, Salmones Austral, Sigdo Koppers, Soprole, Transelect.
- **Coordinadores con ID Slack**: Macarena Abásolo (`U07AKJLQCTY`), Monica Da Rocha (`U09T7NL350T`), Daniel Llanes (`U07AKJLT4G6`), Constanza Gaete (`U0AR2F4G4F8`).
- **Frecuencias**: Mensual, Bimensual, Trimestral.
- Por cliente: día de facturación, mes de inicio, estado, notas operativas.

Estos datos alimentan el seeder inicial de la base de datos (`backend/seed/`).

---

## 4. Fases de ejecución

### Fase 0 — Definición y bases (esta etapa, sin código de aplicación)

Ya cubierto por este repo:

- [x] `PLAN.md` — este documento.
- [x] `docs/dominio.md` — modelo conceptual.
- [x] `docs/modelo-datos.md` — entidades, atributos, relaciones, DDL inicial.
- [x] `docs/plantilla-solicitud-factura.md` — mapeo campo a campo.
- [x] `docs/contratos-api.md` — endpoints, envelopes, ejemplos request/response.
- [x] `docs/estados.md` — máquina de estados de la solicitud.
- [x] `docs/integraciones.md` — UF, Google Sheets/Drive.
- [x] `docs/pantallas.md` — mapa de vistas, wireframes y flujos.
- [x] Esqueleto de carpetas (`frontend/`, `backend/`).

### Fase 1 — Núcleo operativo ✅ COMPLETADO

**Backend:**
- [x] Node.js + Express + `node:sqlite` (sin compilación nativa).
- [x] Schema completo (14 tablas) con índices, FK, auto-init en arranque.
- [x] Seeder con 19 clientes, 4 coordinadores, empresa MAS Consultores reales.
- [x] CRUD completo de clientes, receptores, CP, productos, desarrolladores, coordinadores.
- [x] CRUD de solicitudes con cálculo automático Neto/IVA/Total.
- [x] Máquina de estados con `historial_estado` (Borrador → ... → Cerrada).
- [x] Endpoint `/api/uf` con cache persistente (mindicador.cl).
- [x] Endpoint duplicar solicitud.
- [x] Solicitudes programadas (recurrentes) con generador de instancia por período.
- [x] Asignación de desarrolladores y registro de tiempos.
- [x] Exportación XLSX réplica exacta de la plantilla (exceljs).
- [x] Reportes por cliente (serie temporal, mix recurrente/adicional) y gastos globales.
- [x] Frontend servido como estáticos desde el mismo proceso.

**Frontend:**
- [x] Shell `index.html` con sidebar, hash router, Bootstrap 5 + jQuery.
- [x] Dashboard con KPIs reales y solicitudes recientes.
- [x] Solicitudes: lista filtrable, formulario completo (ítems, CPs, receptores, UF/IVA), flujo de estados, duplicar, exportar.
- [x] Clientes: lista filtrable, ficha completa con receptores/CPs, historial de solicitudes.
- [x] Desarrolladores: lista, ficha con registro de tiempos.
- [x] Mensuales (recurrentes): lista de plantillas, generar período.
- [x] Reportes: gastos por período, ranking por cliente, serie temporal.
- [x] Configuración: test UF, estado Sheets.

**Cómo arrancar:**
```bash
cd backend
npm install
node src/seed.js   # solo primera vez
npm start          # http://localhost:3000
```

### Fase 2 — Integraciones y reportes (3 a 4 semanas)

- [ ] Service Account Google + integración Sheets (sync clientes/CPs/proyecciones, lectura por `batchGet`).
- [ ] Integración Drive (`files.list`, `files.get`/`files.export`) para gestionar plantilla viva.
- [ ] Exportación XLSX de la solicitud (réplica exacta) con `exceljs` y `version_plantilla`.
- [ ] Dashboard con KPIs reales.
- [ ] Reporte por cliente: serie temporal, recurrente vs adicional, gasto por CP/producto, horas dev.
- [ ] Reporte por desarrollador.
- [ ] Bitácora de integración (`uf_cache`, sync logs).
- [ ] Filtros guardados por usuario.

**Implementacion BD SQLite (pasos a seguir):**
- [x] Definir `DB_PATH` por ambiente (`backend/storage/facturapp.sqlite` en local, volumen persistente en produccion).
- [x] Separar el schema actual de `backend/src/db.js` en migraciones versionadas dentro de `backend/migrations/`.
- [x] Crear tabla de control `schema_migrations` con `version`, `name`, `applied_at` y checksum opcional.
- [x] Implementar runner de migraciones idempotente (`npm run migrate`) que ejecute solo migraciones pendientes y falle con mensaje claro.
- [x] Mantener `node:sqlite` como driver principal para evitar dependencias nativas y conservar compatibilidad actual.
- [x] Revisar y formalizar constraints/indices para tablas criticas: `solicitud_factura`, `solicitud_cp`, `proyeccion_facturacion`, `cliente`, `cp`, `historial_estado`, `documento_exportado`, `bitacora_integracion`.
- [x] Crear migraciones para campos ya usados por integraciones y finanzas: `tipo_impuesto`, `codigo_facturacion`, `monto_uf`, `uf_fecha`, `uf_valor`, `version_plantilla`, `is_delete`.
- [x] Normalizar catalogos operativos en SQLite: estados de solicitud, empresas emisoras, tipos de impuesto (`AFECTO_IVA`, `EXENTO_IVA`) y tipos de CP.
- [x] Agregar script de backup local (`npm run db:backup`) que copie la base a `backend/backups/` con timestamp antes de syncs o migraciones.
- [x] Agregar script de restore documentado para recuperar una copia de seguridad en ambiente local/controlado.
- [x] Ajustar seed para que sea idempotente: upsert de clientes, coordinadores, empresas, CPs y datos base sin duplicar.
- [x] Documentar procedimiento operativo en `backend/README.md`: crear BD, migrar, seed, backup, restore y variables requeridas.
- [x] Validar integridad con consultas de humo: conteo de clientes, CPs sin cliente, solicitudes sin CP, proyecciones sin mes/anio, solicitudes con folio duplicado.
- [ ] Preparar criterio de evolucion futura a Postgres: mantener SQL simple, evitar funciones SQLite no portables salvo en migraciones encapsuladas.

**Avance integraciones Google:**
- [x] Dependencia `googleapis` instalada en backend.
- [x] Cliente Service Account backend-only para Sheets y Drive.
- [x] Sync `base_facturacion` por `batchGet` desde Google Sheets.
- [x] Upsert de clientes, CPs asociados a cliente, productos y `cliente_producto`.
- [x] Bitácora `bitacora_integracion` con estado, filas leídas/procesadas y detalles.
- [x] Endpoints Drive para listar plantilla, leer metadata y exportar/descargar plantilla viva.
- [x] `BASE_FACTURACION_MASTER` configurada para refresh/push con `GOOGLE_SHEETS_MASTER_FACTURACION_ID=1es6Jk8hmqwz7gcrz84jI_u8dDvfO2l9W5W5g9sf-wF4`.
- [ ] Configurar `GOOGLE_SA_JSON_PATH` real y compartir la planilla/plantilla con el `client_email`.
- [ ] Definir/confirmar columnas de `proyecciones` para mapearlas a reportes.

### Fase 3 — Hardening y producción (1 a 2 semanas)

- [ ] Auth con roles.
- [ ] Logging estructurado y `requestId`.
- [ ] Backups y monitoreo de cuotas Google.
- [ ] Documentación operativa (`docs/operacion.md`).
- [ ] Checklist de despliegue.
- [ ] Pruebas E2E del happy path: crear → revisar → emitir → exportar → marcar facturada.

---

## 5. Criterios de aceptación globales

Una entrega se considera apta para producción cuando:

1. Se puede crear una solicitud para cualquiera de los 19 clientes existentes y exportar un XLSX visualmente indistinguible del archivo Soprole de noviembre 2025.
2. Se pueden generar las solicitudes mensuales recurrentes para el período en curso con un solo clic por plantilla, o automáticamente según `dia_emision`.
3. El valor UF persistido en la solicitud emitida coincide con el valor de mindicador.cl para la `uf_fecha` registrada.
4. El historial muestra todos los cambios de estado con autor, timestamp y comentario.
5. Cualquier exportación realizada antes de un cambio de plantilla mantiene su formato original al re-descargar (versionado funciona).
6. Los reportes por cliente cuadran con la suma de solicitudes facturadas en el rango.

---

## 6. Riesgos y mitigaciones

| Riesgo | Mitigación |
|---|---|
| Plantilla XLSX cambia y rompe exportaciones antiguas | `version_plantilla` por documento exportado, almacenamiento del XLSX generado |
| API UF caída en cierre de mes | Cache persistente + fallback manual editable con marca de auditoría |
| Cuotas Google Sheets (429) | Sincronizar por lote con backoff exponencial; nunca leer por fila desde el front |
| Credenciales Service Account expuestas | Backend-only; variables de entorno; NO subir el JSON al repo |
| Datos de la base actual con errores | Validación al importar y panel de "clientes con alertas" en dashboard |
| Coordinador olvida facturar | Recordatorio automático desde día 15 por Slack (usa los IDs ya disponibles) |

---

## 7. Cómo ejecutar el plan

1. Revisar y aprobar `docs/plantilla-solicitud-factura.md` con el negocio (Macarena Ayala / Macarena Abásolo).
2. Confirmar stack del backend (Node + Postgres es la recomendación).
3. Crear repos / branches: `main` + `develop`.
4. Iniciar Fase 1 backend en paralelo con Fase 1 frontend (los contratos en `docs/contratos-api.md` permiten trabajo paralelo).
5. Demo al final de cada fase contra los criterios de la sección 5.

---

## 8. Estructura de este repositorio

```
facturapp/
├── PLAN.md                          ← este archivo
├── README.md                        ← visión y cómo arrancar
├── archivos/                        ← fuentes originales (xlsx, docx)
├── deep-research-report.md          ← propuesta técnica original
├── docs/
│   ├── dominio.md
│   ├── modelo-datos.md
│   ├── plantilla-solicitud-factura.md
│   ├── contratos-api.md
│   ├── estados.md
│   ├── integraciones.md
│   ├── pantallas.md
│   └── seed-data.md
├── frontend/
│   ├── index.html
│   ├── assets/
│   │   ├── css/app.css
│   │   ├── js/                      ← app.js, router.js, api.js, services/, views/, utils/
│   │   └── templates/               ← parciales html
├── backend/
│   ├── README.md
│   ├── package.json                 ← stub
│   ├── src/                         ← (vacío en fase 0)
│   ├── migrations/                  ← (vacío en fase 0)
│   └── seed/
│       └── seed.json                ← datos iniciales extraídos de archivos/
└── .gitignore
```
