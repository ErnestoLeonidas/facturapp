# Backend - FacturApp

API JSON para la gestion de solicitudes de facturacion de Grupo MAS.

## Stack

- Node.js >= 20
- Express
- PostgreSQL con `pg`
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
- `npm run migrate`: aplica migraciones PostgreSQL pendientes.
- `npm run seed`: carga datos base en PostgreSQL de forma idempotente.
- `npm run db:check`: ejecuta validaciones de integridad sobre PostgreSQL.

## Variables Requeridas

Ver `.env.example` para valores de referencia.

- `PORT`: puerto HTTP del backend. Por defecto `3000`.
- `NODE_ENV`: ambiente de ejecucion.
- `SESSION_SECRET`: secreto interno para sesiones/autenticacion cuando aplique.
- `DATABASE_URL`: URL de conexion PostgreSQL.
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

## PostgreSQL Por Ambiente

El backend usa `pg` y requiere `DATABASE_URL`.

- Desarrollo local: `DATABASE_URL=postgresql://factuflow:<password>@localhost:5432/factuflow`.
- Produccion Docker: `DATABASE_URL=postgresql://factuflow:<password>@postgres:5432/factuflow`.

Si `DATABASE_URL` no se define, los comandos de base de datos abortan. No hay fallback SQLite.

## Procedimiento Operativo PostgreSQL

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

- `npm run migrate` aplica solo migraciones PostgreSQL pendientes.
- `npm run seed` se puede repetir; hace upsert de datos base y consolida duplicados conocidos sin romper referencias.
- `npm run db:check` debe quedar en OK antes de sincronizar datos o levantar una demo.

## Migraciones PostgreSQL

El schema operativo vive en `backend/src/postgres-migrations.js`.
`src/migrate.js` crea `schema_migrations` si no existe y aplica las migraciones pendientes en orden.
La tabla de control guarda `version`, `name`, `checksum` y `applied_at`.

Tambien se puede ejecutar manualmente:

```bash
npm run migrate
```

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
