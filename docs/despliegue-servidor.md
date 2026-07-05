# Despliegue en servidor

Esta guia asume despliegue con Docker Compose usando una imagen ya publicada en
un registry. El backend incluye el frontend estatico; PostgreSQL corre como
servicio separado.

## Archivos que van al servidor

- `docker-compose.images.yml`
- `.env` creado desde `.env.compose.example`
- `backend/.env.production` creado desde `backend/.env.production.example`

Si el servidor construye la imagen en vez de bajarla desde registry, usar
`docker-compose.yml` en lugar de `docker-compose.images.yml`.

## Lineas/variables que debes cambiar

En `.env`:

```env
APP_IMAGE=registry.example.com/facturapp-backend:prod-postgresql-20260610
APP_PORT=3000
```

En `backend/.env.production`:

```env
CORS_ORIGIN=https://tu-dominio.cl
APP_PUBLIC_URL=https://tu-dominio.cl
SESSION_SECRET=un-secreto-largo-y-aleatorio
DATABASE_URL=postgresql://factuflow:la-misma-clave-de-postgres@postgres:5432/factuflow
POSTGRES_DB=factuflow
POSTGRES_USER=factuflow
POSTGRES_PASSWORD=la-misma-clave-de-postgres
ENABLE_TEST_ADMIN=0
DISABLE_TEST_ADMIN_ON_START=1
```

Opcional:

```env
SLACK_BOT_TOKEN=
SLACK_CHANNEL_ID=
```

Para pruebas controladas antes de publicar, puedes activar temporalmente:

```env
ENABLE_TEST_ADMIN=1
TEST_ADMIN_USER=admin
TEST_ADMIN_PASSWORD=mas2026
```

Antes de exponer la app publicamente, volver a `ENABLE_TEST_ADMIN=0`.
Las migraciones dejan los usuarios activos con la contraseña inicial `mas2026`,
incluyendo administradores.

## Comandos de imagen

Crear y subir la imagen:

```bash
docker build -t registry.example.com/facturapp-backend:prod-postgresql-20260610 -f backend/Dockerfile .
docker push registry.example.com/facturapp-backend:prod-postgresql-20260610
```

En el servidor:

```bash
cp .env.compose.example .env
cp backend/.env.production.example backend/.env.production
# editar .env y backend/.env.production
docker compose -f docker-compose.images.yml pull
docker compose -f docker-compose.images.yml up -d
docker compose -f docker-compose.images.yml exec -T backend npm run prod:check
docker compose -f docker-compose.images.yml exec -T backend sh -c "REQUIRE_DEPLOYMENT_CONFIG=1 npm run prod:check"
```

## Donde esta PostgreSQL

PostgreSQL esta en el servicio `postgres` de Docker Compose:

- Imagen: `postgres:16-alpine`
- Host interno Docker: `postgres`
- Puerto interno: `5432`
- Base: valor de `POSTGRES_DB`, por defecto `factuflow`
- Usuario: valor de `POSTGRES_USER`, por defecto `factuflow`
- URL interna del backend: `DATABASE_URL`
- Datos fisicos dentro del contenedor: `/var/lib/postgresql/data`
- Volumen Docker declarado: `postgres_data`
- Nombre real usual del volumen: `<carpeta>_postgres_data`, por ejemplo `facturapp_postgres_data`

En `docker-compose.images.yml` PostgreSQL no publica puerto al host; solo el
backend accede a la BD por la red interna de Compose. Esto es lo recomendado
para produccion.

Comandos utiles:

```bash
docker compose -f docker-compose.images.yml ps
docker compose -f docker-compose.images.yml exec postgres psql -U factuflow -d factuflow
docker volume ls | grep postgres_data
```

## Modelo de datos PostgreSQL

El esquema real se crea con `backend/src/postgres-migrations.js`. Las tablas
principales quedan en el schema `public`.

### Maestros comerciales

- `empresa_emisora`: empresas que emiten facturas.
- `cliente`: maestro de clientes.
- `cliente_facturacion`: datos de facturacion alternativos por cliente.
- `coordinador`: responsables internos.
- `cliente_coordinador`: relacion cliente/coordinador, opcionalmente por CP.
- `receptor`: contactos receptores del cliente.
- `cp`: centros de proyecto/codigos MS.
- `producto`: catalogo de servicios.
- `cliente_producto`: productos contratados por cliente.

Relaciones clave: `cliente.coordinador_id -> coordinador.id`;
`receptor.cliente_id`, `cp.cliente_id`, `cliente_facturacion.cliente_id` y
`cliente_producto.cliente_id -> cliente.id`.

### Solicitudes de facturacion

- `solicitud_factura`: cabecera principal de cada solicitud.
- `solicitud_item`: detalle de productos/items.
- `solicitud_cp`: reparto por centro de proyecto.
- `solicitud_receptor`: puente solicitud/receptor.
- `solicitud_programada`: solicitudes recurrentes.
- `historial_estado`: cambios de estado.
- `documento_exportado`: archivos exportados.

Relaciones clave: `solicitud_factura.cliente_id -> cliente.id`;
`solicitud_factura.empresa_emisora -> empresa_emisora.codigo`;
`solicitud_item.solicitud_id`, `solicitud_cp.solicitud_id`,
`solicitud_receptor.solicitud_id` e `historial_estado.solicitud_id ->
solicitud_factura.id`.

### Proyecciones

- `proyeccion_version`: version anual activa de proyecciones.
- `proyeccion_item`: filas/proyectos de una version.
- `proyeccion_mensual`: valores mensuales por item.
- `proyeccion_uf`: UF fija/proyectada/manual por mes.
- `proyeccion_configuracion`: configuracion UF por cliente/MS/anio.
- `proyeccion_auxiliar`: datos auxiliares importados.
- `proyeccion`: tabla legacy/admin de proyecciones.
- `proyeccion_facturacion`: proyecciones base por cliente/codigo/periodo.

Relacion clave: `proyeccion_mensual.item_id -> proyeccion_item.id` y
`proyeccion_item.version_id -> proyeccion_version.id`.

### Usuarios, auditoria e integraciones

- `app_user`: usuarios de la app.
- `app_session`: sesiones activas/revocadas.
- `audit_log`: auditoria de acciones.
- `app_config`: configuracion simple key/value.
- `slack_notificacion_log`: trazabilidad de notificaciones Slack.
- `uf_cache`: cache de UF.
- `bitacora_integracion`: bitacora de importaciones/integraciones.

Relacion clave: `app_session.user_id -> app_user.id`.

### Catalogos y tablas de soporte

- `catalogo_estado_solicitud`
- `catalogo_tipo_cp`
- `catalogo_tipo_impuesto`
- `desarrollador`
- `asignacion_solicitud`
- `registro_tiempo`
- `version_plantilla`
- `schema_migrations`

`schema_migrations` controla que cada migracion se ejecute una sola vez.
