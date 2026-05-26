# Backend - FacturApp

API JSON para la gestion de solicitudes de facturacion de Grupo MAS.

## Stack

- Node.js >= 20
- Express
- SQLite con `node:sqlite`
- `exceljs` para exportacion XLSX
- `googleapis` para integraciones Sheets/Drive
- `axios` para UF via SII con fallback externo

## Comandos Operativos

```bash
npm install
cp .env.example .env
npm run migrate
npm run seed
npm run db:check
npm run dev
```

Scripts disponibles:

- `npm start`: levanta el servidor con `node src/server.js`.
- `npm run dev`: levanta el servidor con `nodemon`.
- `npm run migrate`: aplica migraciones SQLite pendientes.
- `npm run seed`: carga datos base de forma idempotente.
- `npm run db:check`: ejecuta consultas de humo de integridad.
- `npm run db:backup`: copia la base a `backend/backups/` con timestamp.
- `npm run db:restore -- <backup.sqlite> --yes`: restaura una copia local/controlada.
- `npm run import:proyecciones-uf -- <archivo.xlsx> --anio=2026`: importa proyecciones con montos UF.

## Variables Requeridas

Ver `.env.example` para valores de referencia.

- `PORT`: puerto HTTP del backend. Por defecto `3000`.
- `NODE_ENV`: ambiente de ejecucion.
- `SESSION_SECRET`: secreto interno para sesiones/autenticacion cuando aplique.
- `DB_PATH`: ruta de la base SQLite.
- `UF_API_BASE`: endpoint base de UF.
- `UF_SII_BASE`: URL base de la tabla UF oficial del SII.
- `UF_CACHE_TTL_HOURS`: vigencia del cache UF.
- `GOOGLE_SA_JSON_PATH`: ruta local del JSON de Service Account. No commitear este archivo.
- `GOOGLE_SHEETS_BASE_FACTURACION_ID`: planilla fuente de base de facturacion.
- `GOOGLE_SHEETS_BASE_FACTURACION_RANGE`: rango de lectura de base de facturacion.
- `GOOGLE_SHEETS_MASTER_FACTURACION_ID`: planilla master para refresh/push.
- `GOOGLE_MASTER_AUTOPUSH`: activa push automatico al master cuando corresponde.
- `GOOGLE_SHEETS_PROYECCIONES_ID`: planilla de proyecciones.
- `GOOGLE_SHEETS_PROYECCIONES_RANGE`: rango de lectura de proyecciones.
- `GOOGLE_DRIVE_PLANTILLA_FILE_ID`: archivo plantilla en Drive.
- `SLACK_BOT_TOKEN`: token Slack para futuras automatizaciones.
- `AUTH_MODE` y `ADMIN_EMAILS`: configuracion de autenticacion futura.

## SQLite Por Ambiente

El backend usa `node:sqlite` y lee la ruta de la base desde `DB_PATH`.

- Desarrollo local: `DB_PATH=./storage/facturapp.sqlite`.
- Produccion: usar una ruta en volumen persistente, por ejemplo `/var/lib/facturapp/facturapp.sqlite`.

Si `DB_PATH` no se define, `src/db.js` usa `backend/storage/facturapp.sqlite` como valor por defecto y crea la carpeta automaticamente.

## Procedimiento Operativo SQLite

Para crear o actualizar una base local:

```bash
cd backend
npm install
cp .env.example .env
npm run migrate
npm run seed
npm run db:check
npm run dev
```

Notas:

- `npm run migrate` crea el archivo definido por `DB_PATH` si no existe y aplica solo migraciones pendientes.
- `npm run seed` se puede repetir; hace upsert de datos base y consolida duplicados conocidos sin romper referencias.
- `npm run db:check` debe quedar en OK antes de sincronizar datos o levantar una demo.
- Antes de imports, migraciones sensibles o restore, crear un backup manual con `npm run db:backup`.
- Para restore, detener primero el servidor y usar `npm run db:restore -- <backup.sqlite> --yes`.

## Migraciones SQLite

El schema base vive en `backend/migrations/001_initial_schema.sql`.
Al iniciar, `src/db.js` crea `schema_migrations` si no existe y aplica las migraciones pendientes en orden.
La tabla de control guarda `version`, `name`, `checksum` y `applied_at`.

Tambien se puede ejecutar manualmente:

```bash
npm run migrate
```

Las migraciones pueden ser `.sql` o `.js`. Usar `.js` cuando SQLite requiera logica condicional, por ejemplo `ALTER TABLE` solo si una columna no existe.

## Backups Locales

Ejecutar:

```bash
npm run db:backup
```

Los archivos quedan en `backend/backups/` con timestamp. Si existen archivos WAL/SHM de SQLite, tambien se copian junto a la base.

## Restore Local/Controlado

Detener primero el servidor o cualquier proceso que este usando la base. Luego ejecutar:

```bash
npm run db:restore -- ./backups/20260511-120000-manual.sqlite --yes
```

El restore exige `--yes` para evitar reemplazos accidentales. Antes de copiar el respaldo sobre `DB_PATH`, el script genera automaticamente un backup `pre-restore` de la base actual.
Si el respaldo incluye archivos `.sqlite-wal` o `.sqlite-shm`, tambien se restauran; si no existen en el respaldo, se eliminan de la base destino para evitar residuos de SQLite.

## Seed Idempotente

Ejecutar:

```bash
npm run seed
```

El proceso hace upsert de empresas emisoras, coordinadores, clientes, receptores y CPs. Tambien consolida duplicados conocidos por claves operativas como cliente, Slack ID, codigo CP y receptor por cliente/email.

## Validacion De Integridad

Ejecutar:

```bash
npm run db:check
```

El chequeo revisa:

- Conteo de clientes.
- CPs sin cliente o con cliente inexistente.
- Solicitudes activas sin CP asociado.
- Proyecciones sin `mes` o `anio`.
- Folios duplicados en solicitudes.

Si encuentra inconsistencias, lista hasta 20 filas por chequeo y termina con codigo de error.

## Endpoints Implementados

Ver [docs/contratos-api.md](../docs/contratos-api.md).
