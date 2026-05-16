const r = require('express').Router();
const db = require('../db');
const { v4: uuidv4 } = require('uuid');
const { ok, fail, notFound } = require('../middleware/envelope');
const { pushMasterAsync } = require('../services/masterAutoSync');
const { upperName } = require('../db-normalize-names');

function hydrate(row) {
  if (!row) return null;
  row.requiere_hes = !!row.requiere_hes;
  row.receptores = db.prepare('SELECT * FROM receptor WHERE cliente_id = ? AND activo = 1 ORDER BY nombre').all(row.id);
  row.cps = db.prepare('SELECT * FROM cp WHERE cliente_id = ? AND activo = 1 ORDER BY codigo').all(row.id);
  if (row.coordinador_id) row.coordinador = db.prepare('SELECT id, nombre, email, slack_user_id FROM coordinador WHERE id = ?').get(row.coordinador_id);
  row.coordinadores = coordinadoresCliente(row.id);
  return row;
}

function coordinadoresCliente(clienteId) {
  return db.prepare(`
    SELECT
      cc.id,
      cc.cliente_id,
      cc.coordinador_id,
      cc.cp_id,
      cc.cp_nombre,
      co.nombre,
      co.email,
      cp.codigo AS cp_codigo,
      cp.nombre AS cp_nombre
    FROM cliente_coordinador cc
    JOIN coordinador co ON co.id = cc.coordinador_id
    LEFT JOIN cp ON cp.id = cc.cp_id
    WHERE cc.cliente_id = ?
      AND cc.activo = 1
      AND co.activo = 1
    ORDER BY cc.cp_nombre IS NOT NULL, cc.cp_nombre, lower(trim(co.nombre))
  `).all(clienteId);
}

r.get('/', (req, res) => {
  const { q, estado, frecuencia } = req.query;
  let sql = 'SELECT c.*, co.nombre as coordinador_nombre FROM cliente c LEFT JOIN coordinador co ON co.id = c.coordinador_id WHERE 1=1';
  const vals = [];
  if (q)          { sql += ' AND (c.nombre_corto LIKE ? OR c.razon_social LIKE ?)'; vals.push(`%${q}%`, `%${q}%`); }
  if (estado)     { sql += ' AND c.estado = ?'; vals.push(estado); }
  if (frecuencia) { sql += ' AND c.frecuencia = ?'; vals.push(frecuencia); }
  sql += ' ORDER BY c.nombre_corto';
  ok(res, db.prepare(sql).all(...vals));
});

r.post('/', (req, res) => {
  const { nombre_corto, razon_social, rut, giro, direccion, coordinador_id,
    frecuencia, dia_facturacion, mes_inicio, requiere_hes, estado, notas } = req.body;
  if (!nombre_corto) return fail(res, 'VALIDATION_ERROR', 'nombre_corto es requerido');
  const id = uuidv4();
  db.prepare(`INSERT INTO cliente (id, nombre_corto, razon_social, rut, giro, direccion, coordinador_id,
    frecuencia, dia_facturacion, mes_inicio, requiere_hes, estado, notas) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`)
    .run(id, upperName(nombre_corto), upperName(razon_social)||null, rut||null, giro||null, direccion||null, coordinador_id||null,
      frecuencia||'Mensual', dia_facturacion||null, mes_inicio||null, requiere_hes ? 1 : 0, estado||'Activo', notas||null);
  pushMasterAsync('cliente creado');
  ok(res, hydrate(db.prepare('SELECT * FROM cliente WHERE id = ?').get(id)), 201);
});

r.get('/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM cliente WHERE id = ?').get(req.params.id);
  if (!row) return notFound(res);
  ok(res, hydrate(row));
});

r.patch('/:id', (req, res) => {
  const row = db.prepare('SELECT id FROM cliente WHERE id = ?').get(req.params.id);
  if (!row) return notFound(res);
  const fields = ['nombre_corto','razon_social','rut','giro','direccion','coordinador_id',
    'frecuencia','dia_facturacion','mes_inicio','requiere_hes','estado','notas'];
  const sets = []; const vals = [];
  fields.forEach(f => {
    if (req.body[f] !== undefined) {
      sets.push(`${f}=?`);
      vals.push(f === 'requiere_hes'
        ? (req.body[f] ? 1 : 0)
        : ['nombre_corto', 'razon_social'].includes(f) ? upperName(req.body[f]) : req.body[f]);
    }
  });
  if (sets.length) {
    sets.push("updated_at=datetime('now')");
    vals.push(req.params.id);
    db.prepare(`UPDATE cliente SET ${sets.join(',')} WHERE id=?`).run(...vals);
    pushMasterAsync('cliente actualizado');
  }
  ok(res, hydrate(db.prepare('SELECT * FROM cliente WHERE id = ?').get(req.params.id)));
});

r.delete('/:id', (req, res) => {
  const row = db.prepare('SELECT id FROM cliente WHERE id = ?').get(req.params.id);
  if (!row) return notFound(res);
  db.prepare("UPDATE cliente SET estado='Inactivo', updated_at=datetime('now') WHERE id=?").run(req.params.id);
  pushMasterAsync('cliente desactivado');
  ok(res, { id: req.params.id, estado: 'Inactivo' });
});

r.get('/:id/productos', (req, res) => {
  ok(res, db.prepare('SELECT p.* FROM producto p JOIN cliente_producto cp ON cp.producto_id=p.id WHERE cp.cliente_id=?').all(req.params.id));
});

r.get('/:id/coordinadores', (req, res) => {
  const row = db.prepare('SELECT id FROM cliente WHERE id = ?').get(req.params.id);
  if (!row) return notFound(res);
  ok(res, coordinadoresCliente(req.params.id));
});

r.post('/:id/coordinadores', (req, res) => {
  const row = db.prepare('SELECT id FROM cliente WHERE id = ?').get(req.params.id);
  if (!row) return notFound(res);
  const { coordinador_id, cp_id } = req.body;
  const cpNombre = String(req.body.cp_nombre || '').trim() || null;
  if (!coordinador_id) return fail(res, 'VALIDATION_ERROR', 'coordinador_id es requerido');
  const coord = db.prepare('SELECT id FROM coordinador WHERE id = ? AND activo = 1').get(coordinador_id);
  if (!coord) return fail(res, 'VALIDATION_ERROR', 'Coordinador no existe o esta inactivo');
  if (cpNombre) {
    const cp = db.prepare('SELECT id FROM cp WHERE cliente_id = ? AND nombre = ? AND activo = 1 LIMIT 1').get(req.params.id, cpNombre);
    if (!cp) return fail(res, 'VALIDATION_ERROR', 'Nombre de CP no pertenece al cliente');
  } else if (cp_id) {
    const cp = db.prepare('SELECT nombre FROM cp WHERE id = ? AND cliente_id = ? AND activo = 1').get(cp_id, req.params.id);
    if (!cp) return fail(res, 'VALIDATION_ERROR', 'CP no pertenece al cliente');
  }
  const existing = cpNombre
    ? db.prepare('SELECT id FROM cliente_coordinador WHERE cliente_id = ? AND coordinador_id = ? AND cp_nombre = ?').get(req.params.id, coordinador_id, cpNombre)
    : db.prepare('SELECT id FROM cliente_coordinador WHERE cliente_id = ? AND coordinador_id = ? AND cp_nombre IS NULL').get(req.params.id, coordinador_id);
  if (existing) {
    db.prepare('UPDATE cliente_coordinador SET activo = 1 WHERE id = ?').run(existing.id);
    return ok(res, coordinadoresCliente(req.params.id), 201);
  }
  const id = uuidv4();
  db.prepare('INSERT INTO cliente_coordinador (id, cliente_id, coordinador_id, cp_id, cp_nombre) VALUES (?, ?, ?, ?, ?)')
    .run(id, req.params.id, coordinador_id, null, cpNombre);
  ok(res, coordinadoresCliente(req.params.id), 201);
});

r.delete('/:id/coordinadores/:asignacionId', (req, res) => {
  const row = db.prepare('SELECT id FROM cliente WHERE id = ?').get(req.params.id);
  if (!row) return notFound(res);
  db.prepare('UPDATE cliente_coordinador SET activo = 0 WHERE id = ? AND cliente_id = ?').run(req.params.asignacionId, req.params.id);
  ok(res, { id: req.params.asignacionId, activo: 0 });
});

module.exports = r;
