require('dotenv').config();
const db = require('./db');
const { backupDatabase } = require('./db-backup');

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

function upperName(value) {
  if (value === undefined || value === null) return value;
  const text = String(value).trim().replace(/\s+/g, ' ');
  return text ? text.toLocaleUpperCase('es-CL') : value;
}

function tableHasColumn(table, column) {
  return db.prepare(`PRAGMA table_info('${table}')`).all().some(col => col.name === column);
}

function normalizeNames({ backup = false } = {}) {
  if (backup) {
    const result = backupDatabase('pre-normalize-names');
    if (!result.skipped) console.log(`Backup previo: ${result.db}`);
    else console.log(`Backup previo omitido: ${result.reason}`);
  }

  const stats = [];
  const tx = db.transaction(() => {
    NAME_COLUMNS.forEach(([table, column]) => {
      if (!tableHasColumn(table, column)) return;
      const rows = db.prepare(`SELECT rowid, ${column} AS value FROM ${table} WHERE ${column} IS NOT NULL AND trim(${column}) <> ''`).all();
      let updated = 0;

      rows.forEach(row => {
        const normalized = upperName(row.value);
        if (normalized !== row.value) {
          db.prepare(`UPDATE ${table} SET ${column} = ? WHERE rowid = ?`).run(normalized, row.rowid);
          updated += 1;
        }
      });

      stats.push({ table, column, reviewed: rows.length, updated });
    });
  });
  tx();

  return stats;
}

function nonUppercaseNames() {
  const issues = [];
  NAME_COLUMNS.forEach(([table, column]) => {
    if (!tableHasColumn(table, column)) return;
    const rows = db.prepare(`SELECT rowid, ${column} AS value FROM ${table} WHERE ${column} IS NOT NULL AND trim(${column}) <> ''`).all();
    rows.forEach(row => {
      if (upperName(row.value) !== row.value) issues.push({ table, column, rowid: row.rowid, value: row.value });
    });
  });
  return issues;
}

if (require.main === module) {
  try {
    const stats = normalizeNames({ backup: true });
    console.log(JSON.stringify(stats, null, 2));
  } catch (e) {
    console.error(e.message || e);
    if (process.env.NODE_ENV === 'development') console.error(e.stack);
    process.exitCode = 1;
  }
}

module.exports = { NAME_COLUMNS, upperName, normalizeNames, nonUppercaseNames };
