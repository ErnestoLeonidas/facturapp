# Checklist de Produccion

## Configuracion

- [x] `backend/.env.production` creado desde `backend/.env.production.example`.
- [x] `SESSION_SECRET` definido con un valor largo y secreto.
- [x] Validacion Docker SQLite completada antes de activar `DATABASE_URL`.
- [x] Para produccion PostgreSQL: `DATABASE_URL` apunta a PostgreSQL.
- [x] `CORS_ORIGIN` apunta al dominio real.
- [x] `APP_PUBLIC_URL` apunta al dominio real.
- [ ] `REQUIRE_DEPLOYMENT_CONFIG=1 npm run prod:check` OK con dominio real, passwords rotadas y datos reales.
- [ ] Admin bootstrap seguro creado con `ADMIN_BOOTSTRAP_USER`, `ADMIN_BOOTSTRAP_EMAIL` y `ADMIN_BOOTSTRAP_PASSWORD`.
- [ ] `npm run rotate:passwords` ejecutado antes de publicar.
- [ ] `db:check` confirma cero usuarios activos con passwords conocidas.
- [x] `ALLOW_EMPTY_DB_CHECK` desactivado para produccion.
- [x] Slack bot postergado para etapa posterior; `SLACK_BOT_TOKEN` puede quedar vacio en esta salida.
- [x] No hay secretos reales en archivos versionados.

## Docker y DB

- [x] `docker compose up -d --build` levanta backend.
- [x] `docker compose up -d --build` levanta backend + PostgreSQL.
- [x] SQLite persistente en volumen Docker `factuflow_sqlite` validado como fallback/local.
- [x] `docker compose -f docker-compose.postgres.yml up -d` levanta PostgreSQL de prueba (validado con `POSTGRES_PORT=55432`).
- [x] Backend levanta sin errores.
- [x] Migraciones SQLite corren.
- [x] `npm run db:check` OK con SQLite.
- [x] Migraciones PostgreSQL corren con `DATABASE_URL` real/temporal.
- [ ] `npm run db:check` OK con PostgreSQL despues de rotar passwords y cargar datos reales.
- [ ] `npm run prod:check` OK despues de rotar passwords y cargar datos reales.
- [x] Docker reinicia sin perder datos.

## Accesos

- [x] Login admin OK.
- [x] Login usuario OK.
- [x] Usuario normal no ve rutas/admin.
- [x] Usuario normal no puede llamar endpoints admin.

## Flujos principales

- [x] Solicitudes listan.
- [x] Solicitud crea.
- [x] Solicitud edita.
- [x] Solicitud exporta.
- [x] Historial UF consulta.
- [x] Proyecciones cargan.
- [x] Grilla de proyecciones carga.
- [x] Versiones de proyecciones cargan.
- [x] Gestion de usuarios funciona.

## Slack bot (etapa posterior)

- [ ] Definir si el bot Slack queda habilitado.
- [ ] Configurar `SLACK_BOT_TOKEN` si se habilita.
- [ ] Configurar `SLACK_CHANNEL_ID` si se habilita.
- [x] UI Slack oculta por defecto con `AppConfig.features.slackBot=false`.
- [x] Preview Slack ya fue probado sin exponer token.

## Backup y restore

- [x] `scripts/backup-postgres.sh` probado.
- [x] `scripts/backup-postgres.ps1` probado en Windows.
- [x] Restore documentado y probado en entorno no productivo.

## Bloqueos antes de produccion real

- [x] Probar migraciones/checks PostgreSQL con una base real/temporal.
- [x] Crear adapter runtime async dual SQLite/PostgreSQL.
- [x] Migrar auth/audit, admin basico, Slack, calendario, UF, clientes, solicitudes, exportaciones, proyecciones, solicitudes programadas y catalogos simples (`empresas`, `coordinadores`, `cp`, `receptores`) a `db-async`.
- [x] Migrar rutas/servicios restantes de SQLite sincrono a `db-async`.
- [x] Confirmar cero `db.prepare`, `db.exec` o `require('../db')` directos en runtime (`routes`, `services`, `utils`).
- [x] Ejecutar prueba completa de la app con navegador y `DATABASE_URL` real/persistente.
