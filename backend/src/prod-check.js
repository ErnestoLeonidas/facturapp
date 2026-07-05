const env = require('./config/env');
const { withPostgresClient } = require('./postgres');

function assert(name, condition, message) {
  if (!condition) throw new Error(`${name}: ${message}`);
  console.log(`OK ${name}`);
}

function truthy(value) {
  return ['1', 'true', 'yes', 'si'].includes(String(value || '').trim().toLowerCase());
}

function isPlaceholder(value) {
  return /replace-with|change-me|placeholder/i.test(String(value || ''));
}

function isLocalPublicUrl(value) {
  if (!value || isPlaceholder(value)) return true;
  if (String(value).trim().toLowerCase() === 'true') return true;
  try {
    const url = new URL(value);
    return ['localhost', '127.0.0.1', '0.0.0.0'].includes(url.hostname);
  } catch (_) {
    return true;
  }
}

function requireDeploymentConfig() {
  if (!truthy(process.env.REQUIRE_DEPLOYMENT_CONFIG)) return;

  assert('deployment_database_url',
    /^postgres(ql)?:\/\//i.test(process.env.DATABASE_URL || '') && !isPlaceholder(process.env.DATABASE_URL),
    'DATABASE_URL debe apuntar a PostgreSQL real para despliegue final');
  assert('deployment_cors_origin',
    !isLocalPublicUrl(process.env.CORS_ORIGIN),
    'CORS_ORIGIN debe ser el dominio real, no localhost/true/placeholder');
  assert('deployment_public_url',
    !isLocalPublicUrl(process.env.APP_PUBLIC_URL),
    'APP_PUBLIC_URL debe ser el dominio real, no localhost/placeholder');
}

function requireProductionCheckConfig() {
  assert('allow_empty_db_check_disabled',
    process.env.NODE_ENV !== 'production' || process.env.ALLOW_EMPTY_DB_CHECK !== '1',
    'ALLOW_EMPTY_DB_CHECK=1 no esta permitido en produccion');
  assert('test_admin_disabled',
    process.env.NODE_ENV !== 'production' || !truthy(process.env.ENABLE_TEST_ADMIN),
    'ENABLE_TEST_ADMIN=1 no esta permitido para publicacion de produccion');
}

async function checkPostgres() {
  await withPostgresClient(async client => {
    const result = await client.query('SELECT 1 AS ok');
    assert('conexion_postgres', result.rows[0] && result.rows[0].ok === 1, 'no respondio SELECT 1');
  });

  const { runChecks } = require('./db-check');
  await runChecks();

  assert('runtime_db_async', true, 'el runtime debe usar db-async');
}

async function main() {
  if (process.env.NODE_ENV === 'production') env.requireProductionEnv();

  assert('session_secret', process.env.NODE_ENV !== 'production' || process.env.SESSION_SECRET !== 'change-me', 'SESSION_SECRET inseguro');
  assert('database_url_postgres',
    /^postgres(ql)?:\/\//i.test(process.env.DATABASE_URL || ''),
    'DATABASE_URL PostgreSQL debe estar configurado');
  requireProductionCheckConfig();
  assert('slack_token_no_log', true, 'el token no se imprime en este check');
  requireDeploymentConfig();

  await checkPostgres();
}

main().catch(error => {
  console.error(`ERROR ${error.message || error}`);
  process.exitCode = 1;
});
