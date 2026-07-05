# PostgreSQL FacturApp

Carpeta separada para levantar solo la base de datos PostgreSQL de FacturApp.

## Uso rapido

```powershell
cd postgres-db
Copy-Item .env.example .env
npm install
npm run docker:up
npm run migrate
npm run seed
```

Atajo equivalente:

```powershell
cd postgres-db
npm run setup
```

## Conexion

Por defecto queda disponible en:

```text
postgresql://factuflow:cambia-esta-clave@localhost:5432/factuflow
```

Para usar otra clave o puerto, edita `.env` antes de levantar Docker.

## Archivos importantes

- `docker-compose.yml`: contenedor PostgreSQL 16.
- `migrations/`: copia de las migraciones actuales del backend.
- `src/migrate.js`: aplica las migraciones PostgreSQL.
- `seed/seed.json`: datos semilla.
- `src/seed.js`: carga empresas, coordinadores, clientes, receptores y CPs en PostgreSQL.
- `scripts/backup.ps1`: genera backup SQL en `backups/`.
- `scripts/restore.ps1`: restaura un backup SQL.

## Backup y restore

```powershell
npm run backup
npm run restore -- .\backups\YYYYMMDDHHMMSS-factuflow-postgres.sql
```

## DATABASE_URL

Esta carpeta usa `DATABASE_URL` para migrar y cargar seed en PostgreSQL:

```text
DATABASE_URL=postgresql://factuflow:cambia-esta-clave@localhost:5432/factuflow
PGSSLMODE=disable
```

Nota: el runtime actual del backend conserva una proteccion que bloquea `DATABASE_URL`
mientras no este completa la adaptacion asincrona a PostgreSQL. Usa esta carpeta para
tener la BD PostgreSQL separada y lista; conecta el backend cuando esa capa este activa.
