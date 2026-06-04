require('./config/env');

const { spawnSync } = require('child_process');
const env = require('./config/env');
const { createPostgresClient } = require('./postgres');

function parseArgs(argv) {
  const opts = { mode: null };
  for (const arg of argv) {
    if (arg === '--preview') opts.mode = opts.mode ? 'invalid' : 'preview';
    else if (arg === '--apply') opts.mode = opts.mode ? 'invalid' : 'apply';
    else opts.unknown = arg;
  }
  return opts;
}

function usage() {
  console.log(`
Uso:
  npm run repair:user-coordinador-links -- --preview
  npm run repair:user-coordinador-links -- --apply
`);
}

function normalize(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

function normalizeEmail(value) {
  return String(value || '').trim().toLowerCase();
}

function hasRealEmail(value) {
  return normalizeEmail(value).includes('@');
}

function isGenericUser(user) {
  return normalizeEmail(user.username) === 'usuario' || normalize(user.nombre) === 'USUARIO GENERAL';
}

async function loadUsers(client) {
  const result = await client.query(`
    SELECT u.id, u.username, u.nombre, u.email, u.rol, u.activo, u.coordinador_id, co.nombre AS coordinador_actual
    FROM app_user u
    LEFT JOIN coordinador co ON co.id = u.coordinador_id
    WHERE u.activo = 1
    ORDER BY u.rol, u.username
  `);
  return result.rows;
}

async function loadCoordinadores(client) {
  const result = await client.query(`
    SELECT id, nombre, email, activo
    FROM coordinador
    WHERE activo = 1
    ORDER BY nombre
  `);
  return result.rows;
}

async function countSolicitudes(client, coordinadorId) {
  if (!coordinadorId) return 0;
  const result = await client.query(`
    SELECT COUNT(*) AS total
    FROM solicitud_factura
    WHERE coordinador_id = $1
      AND COALESCE(is_delete, 0) = 0
  `, [coordinadorId]);
  return Number(result.rows[0]?.total || 0);
}

function matchByEmail(user, coordinadores) {
  if (!hasRealEmail(user.email)) return null;
  const userEmail = normalizeEmail(user.email);
  const matches = coordinadores.filter(co => hasRealEmail(co.email) && normalizeEmail(co.email) === userEmail);
  return matches.length === 1 ? matches[0] : null;
}

function matchByName(user, coordinadores) {
  const userName = normalize(user.nombre);
  if (!userName) return null;
  const matches = coordinadores.filter(co => normalize(co.nombre) === userName);
  return matches.length === 1 ? matches[0] : null;
}

function proposedAction(user, match) {
  if (!match) return 'sin accion';
  if (user.coordinador_id && user.coordinador_id !== match.id) {
    return 'advertencia: coordinador existente distinto; no se sobrescribe';
  }
  if (user.coordinador_id === match.id) return 'sin cambios';
  return 'actualizar app_user.coordinador_id';
}

async function buildPlan(client) {
  const users = await loadUsers(client);
  const coordinadores = await loadCoordinadores(client);
  const rows = [];

  for (const user of users) {
    let match = null;
    let method = 'sin match';

    if (!isGenericUser(user)) {
      match = matchByEmail(user, coordinadores);
      if (match) method = 'email';
      if (!match) {
        match = matchByName(user, coordinadores);
        if (match) method = 'nombre';
      }
    }

    rows.push({
      user,
      match,
      method,
      solicitudes: await countSolicitudes(client, match && match.id),
      action: proposedAction(user, match)
    });
  }

  return rows;
}

function printPlan(rows) {
  console.log('Usuarios activos y asociacion propuesta:');
  rows.forEach(row => {
    const coordinador = row.match ? `${row.match.nombre} (${row.match.id})` : 'sin match';
    console.log(`  username=${row.user.username || ''}`);
    console.log(`    usuario_nombre=${row.user.nombre || ''}`);
    console.log(`    rol=${row.user.rol}`);
    console.log(`    coordinador_encontrado=${coordinador}`);
    console.log(`    metodo_match=${row.method}`);
    console.log(`    solicitudes_que_recuperaria=${row.solicitudes}`);
    console.log(`    accion=${row.action}`);
  });
}

function rowsToApply(rows) {
  return rows.filter(row =>
    row.match &&
    row.action === 'actualizar app_user.coordinador_id'
  );
}

function warningRows(rows) {
  return rows.filter(row => row.action.startsWith('advertencia'));
}

async function applyPlan(client, rows) {
  const updates = rowsToApply(rows);
  await client.query('BEGIN');
  try {
    for (const row of updates) {
      await client.query(`
        UPDATE app_user
        SET coordinador_id = $1,
            updated_at = CURRENT_TIMESTAMP::text
        WHERE id = $2
          AND activo = 1
          AND (coordinador_id IS NULL OR coordinador_id = '')
      `, [row.match.id, row.user.id]);
    }
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  }
  return updates;
}

function runDbCheck() {
  console.log('Ejecutando npm run db:check...');
  const result = spawnSync(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['run', 'db:check'], {
    cwd: env.BACKEND_ROOT,
    env: process.env,
    stdio: 'inherit'
  });
  if (result.error) throw result.error;
  return result.status === 0;
}

async function printVisibleSolicitudes(client) {
  const users = await loadUsers(client);
  console.log('Solicitudes visibles por usuario despues del estado actual:');
  for (const user of users) {
    let total = 0;
    if (user.rol === 'admin') {
      const result = await client.query('SELECT COUNT(*) AS total FROM solicitud_factura WHERE COALESCE(is_delete, 0) = 0');
      total = Number(result.rows[0]?.total || 0);
    } else if (user.coordinador_id) {
      total = await countSolicitudes(client, user.coordinador_id);
    }
    console.log(`  ${user.username}: ${total}`);
  }
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  if (!opts.mode || opts.mode === 'invalid' || opts.unknown) {
    usage();
    if (opts.unknown) console.error(`Argumento no reconocido: ${opts.unknown}`);
    process.exitCode = 1;
    return;
  }
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL PostgreSQL no esta configurado.');

  const client = createPostgresClient();
  await client.connect();
  try {
    console.log(`PostgreSQL: ${env.safeUrl(process.env.DATABASE_URL)}`);
    console.log(`Modo: ${opts.mode}`);
    const plan = await buildPlan(client);
    printPlan(plan);

    const warnings = warningRows(plan);
    if (warnings.length) {
      console.log(`Advertencias: ${warnings.length}. No se sobrescribiran coordinador_id existentes distintos.`);
    }

    if (opts.mode === 'preview') return;

    const applied = await applyPlan(client, plan);
    console.log('Resumen apply:');
    console.log(`  usuarios actualizados: ${applied.length}`);
    applied.forEach(row => console.log(`  ${row.user.username} -> ${row.match.nombre} (${row.match.id})`));
    await printVisibleSolicitudes(client);
  } finally {
    await client.end();
  }

  const ok = runDbCheck();
  if (!ok) {
    console.log('db:check fallo. Revisa la salida anterior antes de cerrar produccion.');
    process.exitCode = 1;
  }
}

if (require.main === module) {
  main().catch(error => {
    console.error(error.message || error);
    process.exitCode = 1;
  });
}
