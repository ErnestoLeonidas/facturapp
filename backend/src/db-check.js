require('dotenv').config();
const db = require('./db');
const { clientKey } = require('./db-clean-clients');
const { nonUppercaseNames } = require('./db-normalize-names');

const checks = [
  {
    name: 'clientes',
    description: 'Conteo de clientes',
    sql: 'SELECT COUNT(*) AS total FROM cliente',
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
  }
];

function duplicateClientRows() {
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

function printRows(rows) {
  rows.slice(0, 20).forEach(row => console.log(`    ${JSON.stringify(row)}`));
  if (rows.length > 20) console.log(`    ... ${rows.length - 20} filas adicionales`);
}

function runChecks() {
  let failed = false;

  console.log('Validando integridad SQLite...');
  checks.forEach(check => {
    const rows = db.prepare(check.sql).all();

    if (check.type === 'count') {
      const total = Number(rows[0]?.total || 0);
      const hasFailed = check.failWhen ? check.failWhen(rows) : false;
      console.log(`${hasFailed ? 'ERROR' : 'OK'} ${check.description}: ${total}`);
      failed = failed || hasFailed;
      return;
    }

    if (rows.length) {
      failed = true;
      console.log(`ERROR ${check.description}: ${rows.length}`);
      printRows(rows);
    } else {
      console.log(`OK ${check.description}: 0`);
    }
  });

  const duplicatedClients = duplicateClientRows();
  if (duplicatedClients.length) {
    failed = true;
    console.log(`ERROR Clientes duplicados por clave operativa: ${duplicatedClients.length}`);
    printRows(duplicatedClients);
  } else {
    console.log('OK Clientes duplicados por clave operativa: 0');
  }

  const lowercaseNames = nonUppercaseNames();
  if (lowercaseNames.length) {
    failed = true;
    console.log(`ERROR Nombres no estandarizados en mayuscula: ${lowercaseNames.length}`);
    printRows(lowercaseNames);
  } else {
    console.log('OK Nombres estandarizados en mayuscula: 0 inconsistencias');
  }

  if (failed) {
    throw new Error('Validacion de integridad fallo. Revisa las filas listadas arriba.');
  }

  console.log('Validacion de integridad completada sin errores.');
}

if (require.main === module) {
  try {
    runChecks();
  } catch (e) {
    console.error(e.message || e);
    process.exitCode = 1;
  }
}

module.exports = { runChecks };
