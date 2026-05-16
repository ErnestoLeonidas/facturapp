require('dotenv').config();
const db = require('./db');
const { backupDatabase } = require('./db-backup');

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

function tableHasColumn(table, column) {
  return db.prepare(`PRAGMA table_info('${table}')`).all().some(col => col.name === column);
}

function mergeNullableFields(fromId, toId) {
  const fields = ['razon_social', 'rut', 'giro', 'direccion', 'coordinador_id', 'frecuencia', 'dia_facturacion', 'mes_inicio', 'notas'];
  const from = db.prepare('SELECT * FROM cliente WHERE id = ?').get(fromId);
  const to = db.prepare('SELECT * FROM cliente WHERE id = ?').get(toId);
  if (!from || !to) return;

  fields.forEach(field => {
    if ((to[field] === null || to[field] === undefined || to[field] === '') && from[field]) {
      db.prepare(`UPDATE cliente SET ${field} = ? WHERE id = ?`).run(from[field], toId);
    }
  });

  if (!to.requiere_hes && from.requiere_hes) {
    db.prepare('UPDATE cliente SET requiere_hes = 1 WHERE id = ?').run(toId);
  }
}

function updateSimpleRefs(fromId, toId) {
  [
    'receptor',
    'cp',
    'proyeccion_facturacion',
    'solicitud_factura',
    'solicitud_programada'
  ].forEach(table => {
    if (tableHasColumn(table, 'cliente_id')) {
      db.prepare(`UPDATE ${table} SET cliente_id = ? WHERE cliente_id = ?`).run(toId, fromId);
    }
  });
}

function updateClienteProducto(fromId, toId) {
  db.prepare('SELECT id, producto_id FROM cliente_producto WHERE cliente_id = ?').all(fromId).forEach(link => {
    const exists = db.prepare('SELECT id FROM cliente_producto WHERE cliente_id = ? AND producto_id = ? LIMIT 1').get(toId, link.producto_id);
    if (exists) db.prepare('DELETE FROM cliente_producto WHERE id = ?').run(link.id);
    else db.prepare('UPDATE cliente_producto SET cliente_id = ? WHERE id = ?').run(toId, link.id);
  });
}

function updateClienteCoordinador(fromId, toId) {
  db.prepare('SELECT id, coordinador_id, cp_id, cp_nombre FROM cliente_coordinador WHERE cliente_id = ?').all(fromId).forEach(link => {
    const exists = link.cp_id
      ? db.prepare('SELECT id FROM cliente_coordinador WHERE cliente_id = ? AND coordinador_id = ? AND cp_id = ? LIMIT 1').get(toId, link.coordinador_id, link.cp_id)
      : db.prepare(`
          SELECT id FROM cliente_coordinador
          WHERE cliente_id = ? AND coordinador_id = ?
            AND COALESCE(cp_nombre, '') = COALESCE(?, '')
          LIMIT 1
        `).get(toId, link.coordinador_id, link.cp_nombre);
    if (exists) db.prepare('DELETE FROM cliente_coordinador WHERE id = ?').run(link.id);
    else db.prepare('UPDATE cliente_coordinador SET cliente_id = ? WHERE id = ?').run(toId, link.id);
  });
}

function canonicalClient(rows) {
  return rows
    .slice()
    .sort((a, b) => {
      const aScore = a.id.startsWith('cli_') ? 0 : 1;
      const bScore = b.id.startsWith('cli_') ? 0 : 1;
      return aScore - bScore
        || Number(!b.razon_social) - Number(!a.razon_social)
        || String(a.created_at || '').localeCompare(String(b.created_at || ''))
        || a.id.localeCompare(b.id);
    })[0];
}

function duplicateGroups() {
  const groups = new Map();
  db.prepare('SELECT * FROM cliente ORDER BY nombre_corto').all().forEach(row => {
    const key = clientKey(row.nombre_corto);
    if (!key) return;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(row);
  });
  return Array.from(groups.entries()).filter(([, rows]) => rows.length > 1);
}

function consolidateClientDuplicates({ backup = false } = {}) {
  if (backup) {
    const result = backupDatabase('pre-clean-clientes');
    if (!result.skipped) console.log(`Backup previo: ${result.db}`);
    else console.log(`Backup previo omitido: ${result.reason}`);
  }

  const stats = { grupos: 0, eliminados: 0, detalles: [] };
  const tx = db.transaction(() => {
    duplicateGroups().forEach(([key, rows]) => {
      const canonical = canonicalClient(rows);
      stats.grupos += 1;

      rows.filter(row => row.id !== canonical.id).forEach(row => {
        mergeNullableFields(row.id, canonical.id);
        updateClienteProducto(row.id, canonical.id);
        updateClienteCoordinador(row.id, canonical.id);
        updateSimpleRefs(row.id, canonical.id);
        db.prepare('DELETE FROM cliente WHERE id = ?').run(row.id);
        stats.eliminados += 1;
        stats.detalles.push({ key, from: row.id, from_nombre: row.nombre_corto, to: canonical.id, to_nombre: canonical.nombre_corto });
      });

      db.prepare("UPDATE cliente SET updated_at = datetime('now') WHERE id = ?").run(canonical.id);
    });
  });
  tx();
  return stats;
}

if (require.main === module) {
  try {
    const stats = consolidateClientDuplicates({ backup: true });
    console.log(JSON.stringify(stats, null, 2));
  } catch (e) {
    console.error(e.message || e);
    if (process.env.NODE_ENV === 'development') console.error(e.stack);
    process.exitCode = 1;
  }
}

module.exports = { clientKey, consolidateClientDuplicates };
