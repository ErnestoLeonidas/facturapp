const r = require('express').Router();
const db = require('../db');
const { v4: uuidv4 } = require('uuid');
const { ok, fail, notFound } = require('../middleware/envelope');

r.get('/', (req, res) => {
  ok(res, db.prepare('SELECT * FROM desarrollador ORDER BY nombre').all());
});

r.post('/', (req, res) => {
  const { nombre, email, equipo } = req.body;
  if (!nombre) return fail(res, 'VALIDATION_ERROR', 'nombre es requerido');
  const id = uuidv4();
  db.prepare('INSERT INTO desarrollador (id, nombre, email, equipo) VALUES (?, ?, ?, ?)').run(id, nombre, email || null, equipo || null);
  ok(res, db.prepare('SELECT * FROM desarrollador WHERE id = ?').get(id), 201);
});

r.patch('/:id', (req, res) => {
  const row = db.prepare('SELECT id FROM desarrollador WHERE id = ?').get(req.params.id);
  if (!row) return notFound(res);
  const { nombre, email, equipo, activo } = req.body;
  const sets = []; const vals = [];
  if (nombre !== undefined)  { sets.push('nombre=?'); vals.push(nombre); }
  if (email !== undefined)   { sets.push('email=?'); vals.push(email); }
  if (equipo !== undefined)  { sets.push('equipo=?'); vals.push(equipo); }
  if (activo !== undefined)  { sets.push('activo=?'); vals.push(activo ? 1 : 0); }
  if (sets.length) { vals.push(req.params.id); db.prepare(`UPDATE desarrollador SET ${sets.join(',')} WHERE id=?`).run(...vals); }
  ok(res, db.prepare('SELECT * FROM desarrollador WHERE id = ?').get(req.params.id));
});

r.get('/:id/tiempos', (req, res) => {
  const { desde, hasta } = req.query;
  let sql = `SELECT rt.*, sf.folio, sf.glosa, c.nombre_corto as cliente_nombre
    FROM registro_tiempo rt
    JOIN solicitud_factura sf ON sf.id = rt.solicitud_id
    JOIN cliente c ON c.id = sf.cliente_id
    WHERE rt.desarrollador_id = ?`;
  const vals = [req.params.id];
  if (desde) { sql += ' AND rt.fecha >= ?'; vals.push(desde); }
  if (hasta) { sql += ' AND rt.fecha <= ?'; vals.push(hasta); }
  sql += ' ORDER BY rt.fecha DESC';
  ok(res, db.prepare(sql).all(...vals));
});

module.exports = r;
