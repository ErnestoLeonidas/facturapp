# Produccion con Docker

Esta guia prepara FactuFlow para despliegue con Docker. El Compose base levanta backend + PostgreSQL. SQLite queda como fallback/local ya validado.

## Requisitos

- Docker Desktop o Docker Engine con Docker Compose.
- Git.
- Node.js solo para desarrollo local.

## Variables de entorno

Copiar el ejemplo:

```bash
cp backend/.env.production.example backend/.env.production
```

Editar `backend/.env.production`:

- `NODE_ENV=production`
- `SESSION_SECRET`: valor largo y secreto.
- `ADMIN_BOOTSTRAP_USER`, `ADMIN_BOOTSTRAP_EMAIL`, `ADMIN_BOOTSTRAP_PASSWORD`: usar solo para crear o asegurar el admin inicial antes de publicar. No versionar secretos.
- `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`: credenciales de PostgreSQL.
- `DATABASE_URL`: apuntar al servicio PostgreSQL interno, por ejemplo `postgresql://factuflow:<password>@postgres:5432/factuflow`.
- `SQLITE_PATH`: `/app/data/facturapp.sqlite` queda como fallback/local.
- `APP_PUBLIC_URL`: `https://factuflow.sirdar.cl`.
- `CORS_ORIGIN`: `https://factuflow.sirdar.cl`.
- `SLACK_BOT_TOKEN` y `SLACK_CHANNEL_ID`: dejar vacios mientras el bot Slack este postergado; configurarlos solo cuando se habilite esa etapa.

No versionar `backend/.env.production`.

## Levantar produccion

```bash
docker compose up -d --build
```

El backend espera a que PostgreSQL este healthy, ejecuta `npm run migrate` y despues arranca la app. El healthcheck HTTP del backend usa `/api/health`.

## Ver logs

```bash
docker compose logs -f backend
```

## Ejecutar migraciones

```bash
docker compose exec backend npm run migrate
```

Nota: con la configuracion de produccion actual, este comando aplica migraciones PostgreSQL usando `DATABASE_URL`.

## Crear admin inicial seguro

Las migraciones de produccion no deben crear usuarios con passwords conocidas. Para primera instalacion o recuperacion segura, definir un admin bootstrap con una password fuerte y ejecutar la rotacion. La password debe guardarse en un gestor seguro; el script no la imprime.

Bash:

```bash
docker compose exec \
  -e ADMIN_BOOTSTRAP_USER=cgaete \
  -e ADMIN_BOOTSTRAP_EMAIL=constanza.gaete@example.com \
  -e ADMIN_BOOTSTRAP_PASSWORD='usar-una-password-larga-y-segura' \
  backend npm run rotate:passwords
```

PowerShell:

```powershell
docker compose exec `
  -e ADMIN_BOOTSTRAP_USER=cgaete `
  -e ADMIN_BOOTSTRAP_EMAIL=constanza.gaete@example.com `
  -e ADMIN_BOOTSTRAP_PASSWORD='usar-una-password-larga-y-segura' `
  backend npm run rotate:passwords
```

El script muestra solo usuarios afectados y nunca imprime passwords completas. Si no existe ningun admin activo con password segura y no se entrega bootstrap, aborta sin rotar.

Con `DATABASE_URL` configurado, el script rota PostgreSQL. Si `DATABASE_URL` esta vacio, usa la SQLite local configurada por `SQLITE_PATH`.

Si ya existe un admin activo con password segura, el script puede ejecutarse sin `ADMIN_BOOTSTRAP_*`; en ese caso debe informar `Usuarios rotados por password conocida: 0`.

Despues de crear el admin, entrar a Gestion y definir passwords definitivas para los usuarios que correspondan.

## Validar migraciones PostgreSQL

Levantar solo PostgreSQL:

```bash
docker compose --env-file backend/.env.production -f docker-compose.postgres.yml up -d
```

Si el puerto local `5432` ya esta ocupado, usar otro puerto:

```bash
POSTGRES_PORT=55432 docker compose --env-file backend/.env.production -f docker-compose.postgres.yml up -d
```

Ejecutar migraciones y checks desde la maquina local, con `DATABASE_URL` apuntando al PostgreSQL de prueba:

```bash
DATABASE_URL=postgresql://factuflow:replace-with-a-secure-postgres-password@localhost:5432/factuflow \
ALLOW_EMPTY_DB_CHECK=1 \
npm --prefix backend run migrate

DATABASE_URL=postgresql://factuflow:replace-with-a-secure-postgres-password@localhost:5432/factuflow \
ALLOW_EMPTY_DB_CHECK=1 \
npm --prefix backend run db:check
```

En Windows PowerShell:

```powershell
$env:DATABASE_URL='postgresql://factuflow:replace-with-a-secure-postgres-password@localhost:5432/factuflow'
$env:ALLOW_EMPTY_DB_CHECK='1'
npm --prefix backend run migrate
npm --prefix backend run db:check
Remove-Item Env:\DATABASE_URL
Remove-Item Env:\ALLOW_EMPTY_DB_CHECK
```

Antes de arrancar el backend con ese `DATABASE_URL`, ejecutar `migrate`, `db:check` y `prod:check`.

Para el despliegue final con dominio y PostgreSQL reales, activar el check estricto:

```bash
REQUIRE_DEPLOYMENT_CONFIG=1 npm --prefix backend run prod:check
```

Este modo falla si `DATABASE_URL` no apunta a PostgreSQL o si `CORS_ORIGIN`/`APP_PUBLIC_URL` siguen en `localhost`, `true` o placeholders.

## Revisar DB

```bash
docker compose exec backend npm run db:check
docker compose exec backend npm run prod:check
docker compose exec backend sh -c "REQUIRE_DEPLOYMENT_CONFIG=1 npm run prod:check"
```

`db:check` y `prod:check` fallan si detectan usuarios activos con passwords conocidas de migracion. En `NODE_ENV=production`, tambien fallan si `ALLOW_EMPTY_DB_CHECK=1`.

## Healthcheck

```bash
curl http://localhost:3000/api/health
```

Debe responder `ok: true` y `database: postgres`. Si la base no esta disponible, responde `503`.

## Estado validado local

Validado el 2026-06-05 con `backend/.env.production` real/ignorado por Git:

- `docker compose up -d --build` reconstruye y levanta `postgres` + `backend`; ambos quedan `healthy`.
- `/api/health` responde `ok: true` y `database: postgres`.
- `docker compose exec -T backend npm run migrate` queda sin migraciones PostgreSQL pendientes.
- `docker compose exec -T backend npm run rotate:passwords` ejecuta sin imprimir credenciales; usuarios rotados por password conocida: `0`.
- `docker compose exec -T backend npm run db:check` OK: 20 clientes, 6 usuarios activos, 0 usuarios activos con passwords conocidas.
- `docker compose exec -T backend npm run prod:check` OK.
- `docker compose exec -T backend sh -c "REQUIRE_DEPLOYMENT_CONFIG=1 npm run prod:check"` OK con `DATABASE_URL`, `CORS_ORIGIN` y `APP_PUBLIC_URL` reales.

## Scripts legacy SQLite

`npm run seed`, `npm run import:proyecciones-uf` y `npm run db:clean-clientes` son herramientas locales/SQLite. No usarlas como operacion PostgreSQL de produccion. Con `DATABASE_URL` definido, el guard de `backend/src/db.js` evita que scripts SQLite sincronos se ejecuten accidentalmente contra el runtime PostgreSQL.

Para PostgreSQL de produccion usar:

```bash
npm --prefix backend run migrate
npm --prefix backend run db:check
npm --prefix backend run prod:check
```

## Backup PostgreSQL

Los scripts usan por defecto `docker-compose.postgres.yml` y el servicio `postgres`. Se puede sobreescribir con `COMPOSE_FILE`, `POSTGRES_SERVICE` y `BACKUP_DIR`.

El dump incluye `DROP ... IF EXISTS`, por lo que sirve para restaurar sobre una base existente. Probar siempre restore en un entorno no productivo antes de usarlo en produccion.

Bash:

```bash
scripts/backup-postgres.sh
```

PowerShell:

```powershell
.\scripts\backup-postgres.ps1
```

## Restore PostgreSQL

Bash:

```bash
scripts/restore-postgres.sh backups/archivo.sql
```

PowerShell:

```powershell
.\scripts\restore-postgres.ps1 backups\archivo.sql
```

## Actualizar app

```bash
git pull
docker compose up -d --build
docker compose exec backend npm run migrate
docker compose exec backend npm run db:check
```

## Apagar

```bash
docker compose down
```

## Reiniciar

```bash
docker compose restart
```

## Checklist antes de publicacion externa

- [x] `backend/.env.production` existe y no esta versionado.
- [x] `SESSION_SECRET` no usa placeholder.
- [x] `APP_PUBLIC_URL` apunta al dominio real.
- [x] `CORS_ORIGIN` apunta al dominio real.
- [x] `REQUIRE_DEPLOYMENT_CONFIG=1 npm run prod:check` OK con dominio real, PostgreSQL, datos cargados y passwords seguras.
- [x] `ALLOW_EMPTY_DB_CHECK` no esta activo en produccion.
- [x] `npm run rotate:passwords` ejecutado; no quedan usuarios activos con passwords conocidas.
- [x] `npm run db:check` confirma `OK Usuarios activos con passwords conocidas: 0`.
- [x] PostgreSQL levanta y conserva datos en el volumen `postgres_data`.
- [x] `npm run prod:check` no tiene bloqueos.
- [x] Migraciones PostgreSQL implementadas.
- [x] Login admin probado en entorno Docker/local.
- [x] Login usuario probado en entorno Docker/local.
- [x] Rutas admin bloqueadas para usuarios no admin.
- [x] Solicitudes listan, crean, editan y exportan.
- [x] Proyecciones cargan resumen, grilla y versiones.
- [x] Historial UF consulta.
- [x] Slack bot postergado; UI oculta por defecto y preview tecnico ya validado sin exponer token.
- [x] Backup y restore probados en entorno no productivo.
- [ ] Proxy/DNS/HTTPS configurado para `https://factuflow.sirdar.cl`.
- [ ] Smoke final probado desde navegador usando el dominio publico.

## Slack postergado

El bot Slack no es requisito para esta salida. Mantener `SLACK_BOT_TOKEN=` y `SLACK_CHANNEL_ID=` vacios hasta retomar la etapa Slack. El preview ya fue validado tecnicamente sin exponer token, pero el envio real debe probarse cuando existan token, canal y decision de habilitacion.

La UI del bot tambien queda oculta por defecto con `AppConfig.features.slackBot=false` en `frontend/assets/js/config.js`. Para retomar Slack, activar ese flag y repetir pruebas de config, preview, token y envio real en un entorno no productivo.
