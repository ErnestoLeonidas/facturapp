# CONTINUAR_DESDE_AQUI

## Fase actual

Fase final de configuracion de despliegue con endurecimiento de seguridad en curso: dominio real definido, `CORS_ORIGIN` y `APP_PUBLIC_URL` apuntan a `https://factuflow.sirdar.cl`. Las migraciones ya no deben crear usuarios productivos con passwords conocidas, y `db:check`/`prod:check` bloquean usuarios activos con passwords conocidas. Slack bot queda postergado para una etapa posterior.

## Ya modificado

- Variables de entorno seguras:
  - `backend/.env.example`
  - `backend/.env.production.example`
- Carga de entorno:
  - `backend/src/config/env.js`
- Seguridad basica:
  - CORS configurable en `backend/src/server.js`
  - errores internos ocultos en produccion en `backend/src/middleware/errors.js`
  - `SESSION_SECRET` obligatorio en produccion
  - Docker local puede seguir usando SQLite con `SQLITE_PATH=/app/data/facturapp.sqlite`
  - Runtime backend ya puede arrancar con `DATABASE_URL` si migraciones/checks PostgreSQL pasan
  - Slack bot no es requisito de esta salida; `SLACK_BOT_TOKEN` puede quedar vacio
  - UI Slack queda oculta por defecto con `AppConfig.features.slackBot=false`
- Checks:
  - `backend/src/db-check.js`
  - `backend/src/prod-check.js`
  - `backend/src/prod-check.js` soporta `REQUIRE_DEPLOYMENT_CONFIG=1` para exigir `DATABASE_URL` PostgreSQL, `CORS_ORIGIN` y `APP_PUBLIC_URL` reales
  - `db:check` y `prod:check` fallan si hay usuarios activos con passwords conocidas.
  - En `NODE_ENV=production`, `db:check` y `prod:check` fallan si `ALLOW_EMPTY_DB_CHECK=1`.
- Seguridad passwords:
  - `backend/src/security/password-audit.js`
  - `backend/src/rotate-passwords.js`
  - `npm run rotate:passwords` rota usuarios activos con passwords conocidas sin imprimir passwords.
  - `ADMIN_BOOTSTRAP_USER`, `ADMIN_BOOTSTRAP_EMAIL` y `ADMIN_BOOTSTRAP_PASSWORD` permiten crear/asegurar un admin inicial seguro para primera instalacion o recuperacion.
- Docker:
  - `backend/Dockerfile`
  - `docker-compose.yml`
  - `.dockerignore`
  - SQLite persistente en volumen Docker `factuflow_sqlite`
  - `docker-compose.yml` ahora levanta `postgres` junto con `backend` para produccion PostgreSQL
- Backup/restore PostgreSQL:
  - `scripts/backup-postgres.sh`
  - `scripts/restore-postgres.sh`
  - `scripts/backup-postgres.ps1`
  - `scripts/restore-postgres.ps1`
  - Backups usan `pg_dump --clean --if-exists --no-owner --no-privileges`; restores usan `psql -v ON_ERROR_STOP=1`
  - Scripts apuntan por defecto a `docker-compose.postgres.yml` y servicio `postgres`; se puede sobreescribir con `COMPOSE_FILE`, `POSTGRES_SERVICE` y `BACKUP_DIR`
- Scripts legacy SQLite:
  - `npm run seed`, `npm run import:proyecciones-uf` y `npm run db:clean-clientes` quedan definidos como herramientas locales/SQLite.
  - No se usan como operacion PostgreSQL de produccion; el guard de `backend/src/db.js` bloquea su ejecucion accidental con `DATABASE_URL`.
- PostgreSQL operacional:
  - `backend/src/postgres.js`
  - `backend/src/postgres-migrations.js`
  - `backend/src/migrate.js` ahora usa PostgreSQL si `DATABASE_URL` existe
  - `backend/src/db-check.js` ahora valida SQLite o PostgreSQL segun `DATABASE_URL`
  - `backend/src/prod-check.js` valida PostgreSQL sin bloqueo de runtime pendiente
  - `backend/src/postgres-migrations.js` agrega `cliente_coordinador.cp_nombre` para mantener paridad con SQLite
  - `docker-compose.postgres.yml` levanta solo PostgreSQL para pruebas de migraciones/checks y soporta `POSTGRES_PORT`
- Runtime async incremental:
  - `backend/src/db-async.js` implementa API async dual SQLite/PostgreSQL (`all`, `get`, `run`, `exec`, `transaction`)
  - `backend/src/services/auth.js` migrado a `async/await`
  - `backend/src/routes/auth.js` migrado a handlers async
  - `backend/src/services/audit.js` usa `db-async` para escritura/lectura de auditoria
  - `backend/src/routes/index.js` migro `/api/empresas` a `db-async`
  - `backend/src/routes/admin.js` migro `/admin/audit` a lectura async
  - `backend/src/db-normalize-names.js` ahora carga SQLite de forma diferida; importar `upperName` ya no activa `db.js`
  - `backend/src/routes/coordinadores.js` migrado a `db-async`
  - `backend/src/routes/cp.js` migrado a `db-async`
  - `backend/src/routes/receptores.js` migrado a `db-async`
  - `backend/src/routes/receptores.js` evita parametros `NULL` ambiguos en PostgreSQL al validar duplicados
  - `backend/src/routes/calendario.js` migrado a `db-async`
  - `backend/src/services/uf.js` migrado a `db-async` con UPSERT compatible SQLite/PostgreSQL
  - `backend/src/routes/admin.js` migro usuarios, auditoria y export pendientes OC a `db-async`
  - `backend/src/routes/clientes.js` migrado a `db-async`
  - `backend/src/routes/solicitudes-programadas.js` migrado a `db-async` con generacion transaccional async
  - `backend/src/services/estados.js` migrado a `db-async`
  - `backend/src/utils/folio.js` migrado a `db-async`
  - `backend/src/routes/solicitudes.js` migrado a `db-async` con creacion, edicion, cambio de estado, duplicacion e historial async
  - `backend/src/services/exportador.js` migrado a `db-async`
  - `backend/src/routes/exportaciones.js` migrado a handlers async con descarga protegida
  - `backend/src/services/proyecciones.js` migrado a `db-async`
  - `backend/src/routes/admin-proyecciones.js` migrado a handlers async
  - `backend/src/db-async.js` soporta parametros posicionales `?` y parametros nombrados `@campo`
  - `backend/src/prod-check.js` ya no falla por runtime pendiente despues de validar PostgreSQL
  - `backend/src/services/slack-bot.js` migrado a `db-async`
  - `backend/src/routes/admin-slack.js` migrado a handlers async
- Documentacion:
  - `docs/produccion-docker.md`
  - `docs/checklist-produccion.md`

## Pendiente critico

Las rutas/servicios/utils del runtime ya no tienen `require('../db')`, `db.prepare` ni `db.exec` directos. El fallback SQLite vive en `db-async` y los usos sincronos restantes estan en scripts operacionales/legacy (`seed`, limpieza, importadores, migraciones/checks SQLite).

Pendiente:

1. Ejecutar `npm run rotate:passwords` con `ADMIN_BOOTSTRAP_USER`, `ADMIN_BOOTSTRAP_EMAIL` y `ADMIN_BOOTSTRAP_PASSWORD` definidos por infraestructura o la responsable del sistema.
2. Verificar `npm run db:check` hasta obtener `OK Usuarios activos con passwords conocidas: 0`.
3. Cargar o validar datos reales; `ALLOW_EMPTY_DB_CHECK=1` no debe usarse en produccion.
4. Publicar el contenedor detras del Proxy Manager corporativo con HTTPS para `https://factuflow.sirdar.cl`.
5. Configurar DNS/proxy externo para enrutar el dominio al host donde corre Docker.
6. Ejecutar smoke final desde navegador usando el dominio publico una vez publicado.

## Validado en esta etapa

- `node --check` OK para `db-async`, auth/audit/rutas tocadas.
- Smoke test directo de auth SQLite OK: login admin de prueba, token, logout.
- Smoke test HTTP SQLite OK en `PORT=3100`: `/api/auth/login`, `/api/empresas`, `/api/auth/logout`.
- Smoke test HTTP SQLite OK para GET de `/api/coordinadores`, `/api/cp`, `/api/receptores?clienteId=...`.
- Smoke test HTTP SQLite OK para crear/editar/desactivar coordinador, CP y receptor temporales; los IDs temporales fueron limpiados de SQLite al final.
- Smoke test HTTP SQLite OK para `/api/calendario`, `/api/uf`, `/api/uf/historial`.
- Smoke test HTTP SQLite OK para `/api/admin/usuarios`, `/api/admin/audit`, crear/cambiar password/desactivar usuario temporal; el usuario temporal fue limpiado.
- Smoke test HTTP SQLite OK para `/api/admin/reportes/pendientes-oc-mes/export` generando XLSX temporal.
- Smoke test HTTP SQLite OK para `/api/clientes` incluyendo detalle, productos, coordinadores, crear/editar/desactivar cliente temporal, asignacion de coordinador y datos de facturacion; temporales limpiados.
- Smoke test HTTP SQLite OK para `/api/solicitudes-programadas`: crear/editar plantilla temporal y generar solicitud temporal transaccional; temporales limpiados.
- Smoke test HTTP SQLite OK para `/api/solicitudes`: crear solicitud temporal con CP/receptor, listar por folio, ver detalle, editar CP manual, cambiar estado a `Borrador`, duplicar, consultar historial; temporales limpiados.
- Smoke test HTTP SQLite OK para `/api/exportaciones`: crear solicitud temporal exportable, generar XLSX, descargar XLSX autenticado y limpiar documento/archivo/solicitud temporal.
- Smoke test directo de `services/proyecciones` OK: versiones, listado, resumen, grilla, clientes, grafico, UF y recomendaciones.
- Smoke test HTTP SQLite OK para `/api/admin/proyecciones`: versiones, listado, resumen, grilla, clientes, grafico, UF, recomendaciones, recalculo preview y export XLSX.
- Smoke test HTTP SQLite OK para `/api/admin/slack/config` y `/api/admin/slack/preview` sin llamar Slack externo.
- `rg "db.prepare|db.exec|require('../db')"` en `backend/src/routes backend/src/services backend/src/utils` sin resultados.
- Import graph OK con `DATABASE_URL` ficticio: `require('./backend/src/routes/index')` carga sin disparar el guard de `backend/src/db.js`.
- PostgreSQL temporal Docker en `127.0.0.1:55432` OK:
  - `npm run migrate` aplico 23 migraciones PostgreSQL desde cero.
  - `npm run db:check` OK con `DATABASE_URL`.
  - `npm run prod:check` OK con `DATABASE_URL`, incluyendo `conexion_postgres` y `runtime_db_async`.
  - Backend `NODE_ENV=production` levanto con `DATABASE_URL`.
  - Smoke HTTP PostgreSQL OK: login admin, `/api/empresas`, crear coordinador/cliente/CP/receptor, crear solicitud `FACTURA SOLICITADA`, exportar y descargar XLSX, consultar proyecciones/resumen/grilla/UF.
- PostgreSQL Compose en `127.0.0.1:55432` OK:
  - `docker compose -f docker-compose.postgres.yml up -d` levanto `postgres` con `POSTGRES_PORT=55432`.
  - `npm run migrate` aplico 23 migraciones PostgreSQL.
  - `npm run db:check` OK con `DATABASE_URL`.
  - `npm run prod:check` OK con `DATABASE_URL`, `conexion_postgres` y `runtime_db_async`.
  - `scripts/backup-postgres.ps1` creo dump SQL con `--clean --if-exists`.
  - `scripts/restore-postgres.ps1` restauro el dump; prueba con fila temporal en `app_user` volvio de 8 a 7 y elimino la marca.
  - `scripts/backup-postgres.sh` probado con Git Bash en Windows.
  - `scripts/restore-postgres.sh` restauro el dump; `npm run db:check` OK post-restore.
  - `docker compose down/up` sin `-v` conservo datos: `app_user=7`, `schema_migrations=23`; `npm run db:check` OK post-reinicio.
- Smoke navegador PostgreSQL persistente en `http://127.0.0.1:3101` OK:
  - Backend local `NODE_ENV=production` levanto con `DATABASE_URL=postgres://...@127.0.0.1:55432/factuflow`.
  - Playwright/Chromium headless cargo login, dashboard y admin.
  - Admin de prueba ve menu Gestion y carga tabla de usuarios.
  - Usuario de prueba entra al dashboard, no ve Gestion y `#/admin` redirige a dashboard.
  - API confirma usuario normal recibe `403` en `/api/admin/usuarios`.
- Smoke funcional PostgreSQL con cleanup OK:
  - Creo coordinador, cliente, CP, receptor y solicitud temporales.
  - Edito solicitud y confirmo `monto_neto_clp=150000`.
  - `/api/solicitudes/:id/historial` devuelve historial.
  - `/api/uf/historial?anio=2026&mes=6` devuelve datos.
  - Admin crea usuario temporal, cambia password, login con nueva password OK y desactiva usuario.
  - Slack preview devuelve candidato y no expone token; solo `token_configurado`.
  - Cleanup SQL dejo `pgfull* = 0`; `npm run db:check` OK post-cleanup.
- Slack bot postergado:
  - No se requiere `SLACK_BOT_TOKEN` ni `SLACK_CHANNEL_ID` para esta salida.
  - El preview queda como prueba tecnica ya realizada, pero el envio real se movera a otra etapa.
  - Frontend oculta controles Slack con `AppConfig.features.slackBot=false`.
- Configuracion local de produccion OK:
  - `backend/.env.production` existe y esta ignorado por Git.
  - `SESSION_SECRET` esta definido.
  - `DATABASE_URL` PostgreSQL definitivo quedo definido apuntando a `postgres:5432` dentro de Docker.
  - `POSTGRES_PASSWORD` quedo generado y sincronizado con el rol PostgreSQL local sin imprimir el secreto.
  - `SLACK_BOT_TOKEN` y `SLACK_CHANNEL_ID` quedan vacios por decision de etapa posterior.
  - Scan de secretos versionados solo encontro placeholders/documentacion, no tokens reales.
  - `prod:check` estricto con `REQUIRE_DEPLOYMENT_CONFIG=1` valida `DATABASE_URL`, `CORS_ORIGIN` y `APP_PUBLIC_URL` con dominio real.
- Docker PostgreSQL definitivo antes del endurecimiento de passwords:
  - `docker compose up -d --build` levanto `backend` y `postgres`.
  - PostgreSQL no queda expuesto al host en el Compose base; backend conecta por `postgres:5432`.
  - `npm run migrate`, `npm run db:check` y `npm run prod:check` estaban OK antes de activar bloqueo por passwords conocidas/base vacia.
  - `REQUIRE_DEPLOYMENT_CONFIG=1 npm run prod:check` validaba `deployment_database_url`, `deployment_cors_origin` y `deployment_public_url`; debe repetirse despues de rotar passwords y cargar datos reales.
  - Smoke HTTP Docker OK: `/` responde `200`, login admin OK y `/api/empresas` devuelve 2 empresas.
- Docker SQLite persistente OK:
  - `docker compose up -d --build` reconstruyo y levanto `backend` en `3000`.
  - Contenedor con `DATABASE_URL` vacio y `SQLITE_PATH=/app/data/facturapp.sqlite`.
  - `npm run migrate` OK dentro del contenedor; sin migraciones pendientes.
  - `npm run db:check` y `npm run prod:check` OK con SQLite.
  - `docker compose restart backend` conservo `/app/data/facturapp.sqlite`; HTTP `/` responde `200` y `db:check` OK post-restart.
- Decision de scripts legacy cerrada:
  - `seed`, `import-proyecciones-uf` y `db-clean-clientes` quedan como herramientas SQLite locales/desarrollo.
  - Para PostgreSQL produccion se usan `migrate`, `db:check`, `prod:check`, `backup-postgres` y `restore-postgres`.
- `npm run db:check` queda pendiente despues de rotar passwords y cargar datos reales.
- `npm run prod:check` queda pendiente despues de rotar passwords y cargar datos reales.
- [x] `APP_PUBLIC_URL` apunta al dominio real.
- [x] `CORS_ORIGIN` apunta al dominio real.
- [ ] `REQUIRE_DEPLOYMENT_CONFIG=1 npm run prod:check` OK despues de rotar passwords y desactivar base vacia.
- Dominio final `https://factuflow.sirdar.cl` configurado en `backend/.env.production`.
- `docker compose up -d --build` OK con backend + PostgreSQL.
- `docker compose exec backend npm run migrate` OK; sin migraciones PostgreSQL pendientes.
- `docker compose exec backend npm run db:check` debe repetirse despues de rotar passwords y cargar datos reales.
- `docker compose exec backend npm run prod:check` debe repetirse despues de rotar passwords y cargar datos reales.
- `docker compose exec backend sh -c "REQUIRE_DEPLOYMENT_CONFIG=1 npm run prod:check"` debe repetirse despues de rotar passwords y cargar datos reales.

## Riesgo

No pasar a produccion real sin una prueba con PostgreSQL persistente y datos reales o migrados. El guard de `backend/src/db.js` sigue protegiendo scripts SQLite legacy si se ejecutan con `DATABASE_URL`; el runtime normal entra por `db-async`.
