require('./config/env');
const { withPostgresClient } = require('./postgres');
const {
  postgresActiveUsersWithKnownPasswords,
  sqliteActiveUsersWithKnownPasswords
} = require('./security/password-audit');

const ALLOW_EMPTY_DB_CHECK = process.env.ALLOW_EMPTY_DB_CHECK === '1';
const NAME_CHECK_IGNORED_TABLES = new Set([
  'catalogo_estado_solicitud',
  'catalogo_tipo_cp',
  'catalogo_tipo_impuesto',
  'empresa_emisora'
]);
const NAME_COLUMNS = [
  ['catalogo_estado_solicitud', 'nombre'],
  ['catalogo_tipo_cp', 'nombre'],
  ['catalogo_tipo_impuesto', 'nombre'],
  ['cliente', 'nombre_corto'],
  ['cliente', 'razon_social'],
  ['cliente_coordinador', 'cp_nombre'],
  ['coordinador', 'nombre'],
  ['cp', 'nombre'],
  ['desarrollador', 'nombre'],
  ['empresa_emisora', 'razon_social'],
  ['producto', 'nombre'],
  ['proyeccion_facturacion', 'cliente'],
  ['proyeccion_facturacion', 'nombre'],
  ['receptor', 'nombre'],
  ['solicitud_programada', 'nombre']
];

const checks = [
  {
    name: 'clientes',
    description: 'Conteo de clientes',
    sql: 'SELECT COUNT(*) AS total FROM cliente',
    type: 'count',
    failWhen: rows => !ALLOW_EMPTY_DB_CHECK && Number(rows[0]?.total || 0) === 0
  },
  {
    name: 'usuarios_activos',
    description: 'Usuarios activos',
    sql: 'SELECT COUNT(*) AS total FROM app_user WHERE activo = 1',
    type: 'count',
    failWhen: rows => Number(rows[0]?.total || 0) === 0
  },
  {
    name: 'cps_sin_cliente',
    description: 'CPs sin cliente asociado o con cliente inexistente',
    sql: `
      SELECT id, codigo, nombre, cliente_id
      FROM cp
      WHERE cliente_id IS NULL
         OR cliente_id NOT IN (SELECT id FROM cliente)
    `
  },
  {
    name: 'solicitudes_sin_cp',
    description: 'Solicitudes activas sin CP asociado',
    sql: `
      SELECT sf.id, sf.folio, sf.cliente_id, sf.estado
      FROM solicitud_factura sf
      WHERE COALESCE(sf.is_delete, 0) = 0
        AND NOT EXISTS (
          SELECT 1 FROM solicitud_cp scp WHERE scp.solicitud_id = sf.id
        )
    `
  },
  {
    name: 'proyecciones_sin_periodo',
    description: 'Proyecciones sin mes o anio',
    sql: `
      SELECT id, cliente_id, cliente, codigo, nombre, mes, anio
      FROM proyeccion_facturacion
      WHERE mes IS NULL
         OR trim(CAST(mes AS TEXT)) = ''
         OR anio IS NULL
    `
  },
  {
    name: 'folios_duplicados',
    description: 'Solicitudes con folio duplicado',
    sql: `
      SELECT folio, COUNT(*) AS total
      FROM solicitud_factura
      WHERE folio IS NOT NULL
      GROUP BY folio
      HAVING COUNT(*) > 1
    `
  },
  {
    name: 'solicitudes_montos_invalidos',
    description: 'Solicitudes activas con montos invalidos',
    sql: `
      SELECT id, folio, monto_neto_clp, monto_iva_clp, monto_total_clp
      FROM solicitud_factura
      WHERE COALESCE(is_delete, 0) = 0
        AND (
          COALESCE(monto_neto_clp, 0) < 0
          OR COALESCE(monto_iva_clp, 0) < 0
          OR COALESCE(monto_total_clp, 0) < 0
          OR COALESCE(monto_total_clp, 0) < COALESCE(monto_neto_clp, 0)
        )
    `
  },
  {
    name: 'proyeccion_version_activa',
    description: 'Versiones activas de proyecciones',
    sql: 'SELECT COUNT(*) AS total FROM proyeccion_version WHERE activa = 1',
    type: 'count',
    failWhen: rows => !ALLOW_EMPTY_DB_CHECK && Number(rows[0]?.total || 0) === 0
  },
  {
    name: 'proyeccion_version_activa_duplicada',
    description: 'Anios con mas de una version activa de proyecciones',
    sql: `
      SELECT anio, COUNT(*) AS total
      FROM proyeccion_version
      WHERE activa = 1
      GROUP BY anio
      HAVING COUNT(*) > 1
    `
  },
  {
    name: 'slack_token_en_bd',
    description: 'Slack config no expone token en BD',
    sql: `
      SELECT key
      FROM app_config
      WHERE lower(key) LIKE '%token%'
         OR lower(COALESCE(value, '')) LIKE 'xox%'
    `
  }
];

function clientKey(value) {
  let s = String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');

  if (s === 'AFP HABITAT') s = 'HABITAT';
  if (s === 'BANCO ESTADO EXPRESS') s = 'BEX';
  if (s === 'TRANSELEC') s = 'TRANSELECT';
  return s;
}

function upperName(value) {
  if (value === undefined || value === null) return value;
  const text = String(value).trim().replace(/\s+/g, ' ');
  return text ? text.toLocaleUpperCase('es-CL') : value;
}

function quoteIdent(value) {
  if (!/^[a-z_][a-z0-9_]*$/i.test(value)) {
    throw new Error(`Identificador SQL invalido: ${value}`);
  }
  return `"${value}"`;
}

function printRows(rows) {
  rows.slice(0, 20).forEach(row => console.log(`    ${JSON.stringify(row)}`));
  if (rows.length > 20) console.log(`    ... ${rows.length - 20} filas adicionales`);
}

function printCheckResult(check, rows) {
  if (check.type === 'count') {
    const total = Number(rows[0]?.total || 0);
    const hasFailed = check.failWhen ? check.failWhen(rows) : false;
    console.log(`${hasFailed ? 'ERROR' : 'OK'} ${check.description}: ${total}`);
    return hasFailed;
  }

  if (rows.length) {
    console.log(`ERROR ${check.description}: ${rows.length}`);
    printRows(rows);
    return true;
  }

  console.log(`OK ${check.description}: 0`);
  return false;
}

function tableHasColumnSqlite(db, table, column) {
  return db.prepare(`PRAGMA table_info('${table}')`).all().some(col => col.name === column);
}

function sqliteDuplicateClientRows(db) {
  const groups = new Map();
  db.prepare('SELECT id, nombre_corto, estado FROM cliente').all().forEach(row => {
    const key = clientKey(row.nombre_corto);
    if (!key) return;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(row);
  });
  return Array.from(groups.entries())
    .filter(([, rows]) => rows.length > 1)
    .map(([key, rows]) => ({ key, clientes: rows }));
}

function sqliteNonUppercaseNames(db) {
  const issues = [];
  NAME_COLUMNS.forEach(([table, column]) => {
    if (!tableHasColumnSqlite(db, table, column)) return;
    const rows = db.prepare(`SELECT rowid, ${column} AS value FROM ${table} WHERE ${column} IS NOT NULL AND trim(${column}) <> ''`).all();
    rows.forEach(row => {
      if (upperName(row.value) !== row.value) issues.push({ table, column, rowid: row.rowid, value: row.value });
    });
  });
  return issues;
}

async function tableHasColumnPostgres(client, table, column) {
  const result = await client.query(`
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = current_schema()
      AND table_name = $1
      AND column_name = $2
    LIMIT 1
  `, [table, column]);
  return result.rowCount > 0;
}

async function postgresDuplicateClientRows(client) {
  const result = await client.query('SELECT id, nombre_corto, estado FROM cliente');
  const groups = new Map();
  result.rows.forEach(row => {
    const key = clientKey(row.nombre_corto);
    if (!key) return;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(row);
  });
  return Array.from(groups.entries())
    .filter(([, rows]) => rows.length > 1)
    .map(([key, rows]) => ({ key, clientes: rows }));
}

async function postgresNonUppercaseNames(client) {
  const issues = [];
  for (const [table, column] of NAME_COLUMNS) {
    if (!(await tableHasColumnPostgres(client, table, column))) continue;
    const tableName = quoteIdent(table);
    const columnName = quoteIdent(column);
    const result = await client.query(`
      SELECT ctid::text AS rowid, ${columnName} AS value
      FROM ${tableName}
      WHERE ${columnName} IS NOT NULL
        AND trim(${columnName}) <> ''
    `);
    result.rows.forEach(row => {
      if (upperName(row.value) !== row.value) issues.push({ table, column, rowid: row.rowid, value: row.value });
    });
  }
  return issues;
}

function finishChecks(failed) {
  if (failed) {
    throw new Error('Validacion de integridad fallo. Revisa las filas listadas arriba.');
  }

  console.log('Validacion de integridad completada sin errores.');
}

function assertDbCheckConfig() {
  if (process.env.NODE_ENV === 'production' && ALLOW_EMPTY_DB_CHECK) {
    throw new Error('ALLOW_EMPTY_DB_CHECK=1 no esta permitido en NODE_ENV=production');
  }
}

function runSqliteChecks() {
  const db = require('./db');
  let failed = false;

  console.log('Validando integridad SQLite...');
  checks.forEach(check => {
    const rows = db.prepare(check.sql).all();
    failed = printCheckResult(check, rows) || failed;
  });

  const duplicatedClients = sqliteDuplicateClientRows(db);
  if (duplicatedClients.length) {
    failed = true;
    console.log(`ERROR Clientes duplicados por clave operativa: ${duplicatedClients.length}`);
    printRows(duplicatedClients);
  } else {
    console.log('OK Clientes duplicados por clave operativa: 0');
  }

  const lowercaseNames = sqliteNonUppercaseNames(db)
    .filter(row => !NAME_CHECK_IGNORED_TABLES.has(row.table));
  if (lowercaseNames.length) {
    failed = true;
    console.log(`ERROR Nombres no estandarizados en mayuscula: ${lowercaseNames.length}`);
    printRows(lowercaseNames);
  } else {
    console.log('OK Nombres estandarizados en mayuscula: 0 inconsistencias');
  }

  const knownPasswordUsers = sqliteActiveUsersWithKnownPasswords(db);
  if (knownPasswordUsers.length) {
    failed = true;
    console.log(`ERROR Usuarios activos con passwords conocidas: ${knownPasswordUsers.length}`);
    printRows(knownPasswordUsers);
  } else {
    console.log('OK Usuarios activos con passwords conocidas: 0');
  }

  finishChecks(failed);
}

async function runPostgresChecks() {
  await withPostgresClient(async client => {
    let failed = false;

    console.log('Validando integridad PostgreSQL...');
    for (const check of checks) {
      const result = await client.query(check.sql);
      failed = printCheckResult(check, result.rows) || failed;
    }

    const duplicatedClients = await postgresDuplicateClientRows(client);
    if (duplicatedClients.length) {
      failed = true;
      console.log(`ERROR Clientes duplicados por clave operativa: ${duplicatedClients.length}`);
      printRows(duplicatedClients);
    } else {
      console.log('OK Clientes duplicados por clave operativa: 0');
    }

    const lowercaseNames = (await postgresNonUppercaseNames(client))
      .filter(row => !NAME_CHECK_IGNORED_TABLES.has(row.table));
    if (lowercaseNames.length) {
      failed = true;
      console.log(`ERROR Nombres no estandarizados en mayuscula: ${lowercaseNames.length}`);
      printRows(lowercaseNames);
    } else {
      console.log('OK Nombres estandarizados en mayuscula: 0 inconsistencias');
    }

    const knownPasswordUsers = await postgresActiveUsersWithKnownPasswords(client);
    if (knownPasswordUsers.length) {
      failed = true;
      console.log(`ERROR Usuarios activos con passwords conocidas: ${knownPasswordUsers.length}`);
      printRows(knownPasswordUsers);
    } else {
      console.log('OK Usuarios activos con passwords conocidas: 0');
    }

    finishChecks(failed);
  });
}

async function runChecks() {
  assertDbCheckConfig();
  if (process.env.DATABASE_URL) {
    await runPostgresChecks();
    return;
  }

  runSqliteChecks();
}

if (require.main === module) {
  runChecks().catch(e => {
    console.error(e.message || e);
    process.exitCode = 1;
  });
}

module.exports = { runChecks };
