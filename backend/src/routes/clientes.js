const r = require('express').Router();
const db = require('../db');
const { v4: uuidv4 } = require('uuid');
const { ok, fail, notFound } = require('../middleware/envelope');

function hydrate(row) {
  if (!row) return null;
  row.requiere_hes = !!row.requiere_hes;
  row.receptores = db.prepare('SELECT * FROM receptor WHERE cliente_id = ? AND activo = 1 ORDER BY nombre').all(row.id);
  row.cps = db.prepare('SELECT * FROM cp WHERE cliente_id = ? AND activo = 1 ORDER BY codigo').all(row.id);
  if (row.coordinador_id) row.coordinador = db.prepare('SELECT id, nombre, email, slack_user_id FROM coordinador WHERE id = ?').get(row.coordinador_id);
  return row;
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
    .run(id, nombre_corto, razon_social||null, rut||null, giro||null, direccion||null, coordinador_id||null,
      frecuencia||'Mensual', dia_facturacion||null, mes_inicio||null, requiere_hes ? 1 : 0, estado||'Activo', notas||null);
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
      vals.push(f === 'requiere_hes' ? (req.body[f] ? 1 : 0) : req.body[f]);
    }
  });
  if (sets.length) {
    sets.push("updated_at=datetime('now')");
    vals.push(req.params.id);
    db.prepare(`UPDATE cliente SET ${sets.join(',')} WHERE id=?`).run(...vals);
  }
  ok(res, hydrate(db.prepare('SELECT * FROM cliente WHERE id = ?').get(req.params.id)));
});

r.delete('/:id', (req, res) => {
  const row = db.prepare('SELECT id FROM cliente WHERE id = ?').get(req.params.id);
  if (!row) return notFound(res);
  db.prepare("UPDATE cliente SET estado='Inactivo', updated_at=datetime('now') WHERE id=?").run(req.params.id);
  ok(res, { id: req.params.id, estado: 'Inactivo' });
});

r.get('/:id/productos', (req, res) => {
  ok(res, db.prepare('SELECT p.* FROM producto p JOIN cliente_producto cp ON cp.producto_id=p.id WHERE cp.cliente_id=?').all(req.params.id));
});

module.exports = r;
