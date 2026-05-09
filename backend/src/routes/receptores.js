const r = require('express').Router();
const db = require('../db');
const { v4: uuidv4 } = require('uuid');
const { ok, fail, notFound } = require('../middleware/envelope');
const { pushMasterAsync } = require('../services/masterAutoSync');

r.get('/', (req, res) => {
  const { clienteId } = req.query;
  if (!clienteId) return fail(res, 'VALIDATION_ERROR', 'Se requiere clienteId');
  ok(res, db.prepare('SELECT * FROM receptor WHERE cliente_id = ? AND activo = 1 ORDER BY nombre').all(clienteId));
});

r.post('/', (req, res) => {
  const { cliente_id, nombre, email, cargo } = req.body;
  if (!cliente_id || !nombre || !email) return fail(res, 'VALIDATION_ERROR', 'cliente_id, nombre y email son requeridos');
  const id = uuidv4();
  db.prepare('INSERT INTO receptor (id, cliente_id, nombre, email, cargo) VALUES (?, ?, ?, ?, ?)').run(id, cliente_id, nombre, email, cargo || null);
  pushMasterAsync('receptor creado');
  ok(res, db.prepare('SELECT * FROM receptor WHERE id = ?').get(id), 201);
});

r.patch('/:id', (req, res) => {
  const row = db.prepare('SELECT id FROM receptor WHERE id = ?').get(req.params.id);
  if (!row) return notFound(res);
  const { nombre, email, cargo, activo } = req.body;
  const sets = []; const vals = [];
  if (nombre !== undefined)  { sets.push('nombre=?'); vals.push(nombre); }
  if (email !== undefined)   { sets.push('email=?'); vals.push(email); }
  if (cargo !== undefined)   { sets.push('cargo=?'); vals.push(cargo); }
  if (activo !== undefined)  { sets.push('activo=?'); vals.push(activo ? 1 : 0); }
  if (sets.length) {
    vals.push(req.params.id);
    db.prepare(`UPDATE receptor SET ${sets.join(',')} WHERE id=?`).run(...vals);
    pushMasterAsync('receptor actualizado');
  }
  ok(res, db.prepare('SELECT * FROM receptor WHERE id = ?').get(req.params.id));
});

r.delete('/:id', (req, res) => {
  const row = db.prepare('SELECT id FROM receptor WHERE id = ?').get(req.params.id);
  if (!row) return notFound(res);
  db.prepare('UPDATE receptor SET activo = 0 WHERE id = ?').run(req.params.id);
  pushMasterAsync('receptor desactivado');
  ok(res, { id: req.params.id, activo: false });
});

module.exports = r;
