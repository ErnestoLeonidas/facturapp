const r = require('express').Router();
const db = require('../db');
const { v4: uuidv4 } = require('uuid');
const { ok, fail, notFound } = require('../middleware/envelope');

r.get('/', (req, res) => {
  ok(res, db.prepare('SELECT * FROM coordinador ORDER BY nombre').all());
});

r.post('/', (req, res) => {
  const { nombre, email, slack_user_id } = req.body;
  if (!nombre) return fail(res, 'VALIDATION_ERROR', 'nombre es requerido');
  const id = uuidv4();
  db.prepare('INSERT INTO coordinador (id, nombre, email, slack_user_id) VALUES (?, ?, ?, ?)').run(id, nombre, email || null, slack_user_id || null);
  ok(res, db.prepare('SELECT * FROM coordinador WHERE id = ?').get(id), 201);
});

r.patch('/:id', (req, res) => {
  const row = db.prepare('SELECT id FROM coordinador WHERE id = ?').get(req.params.id);
  if (!row) return notFound(res);
  const { nombre, email, slack_user_id, activo } = req.body;
  const sets = []; const vals = [];
  if (nombre !== undefined)        { sets.push('nombre=?'); vals.push(nombre); }
  if (email !== undefined)         { sets.push('email=?'); vals.push(email); }
  if (slack_user_id !== undefined) { sets.push('slack_user_id=?'); vals.push(slack_user_id); }
  if (activo !== undefined)        { sets.push('activo=?'); vals.push(activo ? 1 : 0); }
  if (sets.length) { vals.push(req.params.id); db.prepare(`UPDATE coordinador SET ${sets.join(',')} WHERE id=?`).run(...vals); }
  ok(res, db.prepare('SELECT * FROM coordinador WHERE id = ?').get(req.params.id));
});

module.exports = r;
