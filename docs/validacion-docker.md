# Validacion Docker con SQLite

Este flujo valida FactuFlow en Docker local usando SQLite persistente. No activa PostgreSQL.

## Ejecutar desde la raiz

Todos los comandos se ejecutan desde la raiz del proyecto:

```bash
cd facturapp
```

## Crear `backend/.env.production`

El archivo `backend/.env.production` es local y no debe versionarse. Esta ignorado por `.gitignore`.

Crear desde el ejemplo:

```bash
cp backend/.env.production.example backend/.env.production
```

En Windows PowerShell:

```powershell
Copy-Item backend/.env.production.example backend/.env.production
```

## Variables minimas para SQLite

Para esta validacion, usar:

```env
PORT=3000
NODE_ENV=production
CORS_ORIGIN=http://localhost:3000
APP_PUBLIC_URL=http://localhost:3000
SESSION_SECRET=dev-docker-secret-change-me
DATABASE_URL=
SQLITE_PATH=/app/data/facturapp.sqlite
DB_BACKUP_DIR=/app/data/backups
ALLOW_EMPTY_DB_CHECK=1
UF_API_BASE=https://mindicador.cl/api/uf
UF_SII_BASE=https://www.sii.cl/valores_y_fechas/uf
UF_CACHE_TTL_HOURS=24
UF_CACHE_FROM_YEAR=2026
UF_CACHE_TO_YEAR=2026
SLACK_BOT_TOKEN=
SLACK_CHANNEL_ID=
```

Importante: `DATABASE_URL` debe quedar vacio. PostgreSQL no se usa en esta validacion.

`ALLOW_EMPTY_DB_CHECK=1` permite que `db:check` pase en una SQLite recien creada sin clientes/proyecciones cargadas. Para validar una base productiva con datos reales, quitar esa variable o dejarla en `0`.

## Persistencia SQLite

`docker-compose.yml` monta el volumen Docker `factuflow_sqlite` en:

```text
/app/data
```

La base queda en:

```text
/app/data/facturapp.sqlite
```

## Levantar Docker

```bash
docker compose up -d --build
```

## Revisar servicios

```bash
docker compose ps
```

## Revisar logs

```bash
docker compose logs -f backend
```

## Ejecutar migraciones

```bash
docker compose exec backend npm run migrate
```

## Revisar DB

```bash
docker compose exec backend npm run db:check
```

## Apagar Docker

```bash
docker compose down
```

Esto detiene contenedores, pero conserva el volumen `factuflow_sqlite`.

## Reiniciar Docker

```bash
docker compose restart
```

## Actualizar app

```bash
git pull
docker compose up -d --build
docker compose exec backend npm run migrate
docker compose exec backend npm run db:check
```

## Borrar datos locales de prueba

Solo para pruebas locales, si necesitas resetear la SQLite persistente:

```bash
docker compose down -v
```

Esto elimina el volumen `factuflow_sqlite`.
