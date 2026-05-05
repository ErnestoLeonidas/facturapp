const r = require('express').Router();
const db = require('../db');
const { v4: uuidv4 } = require('uuid');
const { ok, fail, notFound } = require('../middleware/envelope');

function normalizarNombre(nombre) {
  return String(nombre || '').trim().toLocaleLowerCase('es-CL');
}

function deduplicarCoordinadores(rows) {
  const vistos = new Set();
  return rows.filter(row => {
    const key = normalizarNombre(row.nombre);
    if (vistos.has(key)) return false;
    vistos.add(key);
    return true;
  });
}

function existeDuplicadoNombre(nombre, excludeId) {
  const rows = db.prepare('SELECT id, nombre FROM coordinador').all();
  const nombreNormalizado = normalizarNombre(nombre);
  return rows.some(row => row.id !== excludeId && normalizarNombre(row.nombre) === nombreNormalizado);
}

r.get('/', (req, res) => {
  const rows = db.prepare(`
    SELECT * FROM coordinador
    ORDER BY lower(trim(nombre)), activo DESC, created_at DESC
  `).all();
  ok(res, deduplicarCoordinadores(rows));
});

r.post('/', (req, res) => {
  const { nombre, email, slack_user_id } = req.body;
  if (!nombre) return fail(res, 'VALIDATION_ERROR', 'nombre es requerido');
  if (existeDuplicadoNombre(nombre)) return fail(res, 'VALIDATION_ERROR', 'Ya existe un coordinador con ese nombre');
  const id = uuidv4();
  db.prepare('INSERT INTO coordinador (id, nombre, email, slack_user_id) VALUES (?, ?, ?, ?)').run(id, nombre, email || null, slack_user_id || null);
  ok(res, db.prepare('SELECT * FROM coordinador WHERE id = ?').get(id), 201);
});

r.patch('/:id', (req, res) => {
  const row = db.prepare('SELECT id FROM coordinador WHERE id = ?').get(req.params.id);
  if (!row) return notFound(res);
  const { nombre, email, slack_user_id, activo } = req.body;
  const sets = []; const vals = [];
  if (nombre !== undefined)        {
    if (!nombre) return fail(res, 'VALIDATION_ERROR', 'nombre es requerido');
    if (existeDuplicadoNombre(nombre, req.params.id)) return fail(res, 'VALIDATION_ERROR', 'Ya existe un coordinador con ese nombre');
    sets.push('nombre=?'); vals.push(nombre);
  }
  if (email !== undefined)         { sets.push('email=?'); vals.push(email); }
  if (slack_user_id !== undefined) { sets.push('slack_user_id=?'); vals.push(slack_user_id); }
  if (activo !== undefined)        { sets.push('activo=?'); vals.push(activo ? 1 : 0); }
  if (sets.length) { vals.push(req.params.id); db.prepare(`UPDATE coordinador SET ${sets.join(',')} WHERE id=?`).run(...vals); }
  ok(res, db.prepare('SELECT * FROM coordinador WHERE id = ?').get(req.params.id));
});

r.delete('/:id', (req, res) => {
  const row = db.prepare('SELECT id FROM coordinador WHERE id = ?').get(req.params.id);
  if (!row) return notFound(res);
  db.prepare('UPDATE coordinador SET activo = 0 WHERE id = ?').run(req.params.id);
  ok(res, { id: req.params.id, activo: 0 });
});

module.exports = r;
