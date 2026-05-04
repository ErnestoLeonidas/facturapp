const r = require('express').Router();
const db = require('../db');
const { v4: uuidv4 } = require('uuid');
const { ok, fail, notFound } = require('../middleware/envelope');

r.get('/', (req, res) => {
  const { clienteId, q } = req.query;
  let sql = 'SELECT * FROM cp WHERE activo = 1';
  const vals = [];
  if (clienteId) { sql += ' AND cliente_id = ?'; vals.push(clienteId); }
  if (q) { sql += ' AND (codigo LIKE ? OR nombre LIKE ?)'; vals.push(`%${q}%`, `%${q}%`); }
  sql += ' ORDER BY codigo';
  ok(res, db.prepare(sql).all(...vals));
});

r.post('/', (req, res) => {
  const { codigo, nombre, area, cliente_id } = req.body;
  if (!codigo) return fail(res, 'VALIDATION_ERROR', 'codigo es requerido');
  const id = uuidv4();
  db.prepare('INSERT INTO cp (id, codigo, nombre, area, cliente_id) VALUES (?, ?, ?, ?, ?)').run(id, codigo, nombre || null, area || null, cliente_id || null);
  ok(res, db.prepare('SELECT * FROM cp WHERE id = ?').get(id), 201);
});

r.patch('/:id', (req, res) => {
  const row = db.prepare('SELECT id FROM cp WHERE id = ?').get(req.params.id);
  if (!row) return notFound(res);
  const { codigo, nombre, area, cliente_id, activo } = req.body;
  const sets = []; const vals = [];
  if (codigo !== undefined)    { sets.push('codigo=?'); vals.push(codigo); }
  if (nombre !== undefined)    { sets.push('nombre=?'); vals.push(nombre); }
  if (area !== undefined)      { sets.push('area=?'); vals.push(area); }
  if (cliente_id !== undefined){ sets.push('cliente_id=?'); vals.push(cliente_id); }
  if (activo !== undefined)    { sets.push('activo=?'); vals.push(activo ? 1 : 0); }
  if (sets.length) { vals.push(req.params.id); db.prepare(`UPDATE cp SET ${sets.join(',')} WHERE id=?`).run(...vals); }
  ok(res, db.prepare('SELECT * FROM cp WHERE id = ?').get(req.params.id));
});

module.exports = r;
