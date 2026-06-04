const r = require('express').Router();
const db = require('../db-async');
const { v4: uuidv4 } = require('uuid');
const { ok, fail, notFound } = require('../middleware/envelope');
const { upperName } = require('../db-normalize-names');

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

async function existeDuplicadoNombre(nombre, excludeId) {
  const rows = await db.all('SELECT id, nombre FROM coordinador');
  const nombreNormalizado = normalizarNombre(nombre);
  return rows.some(row => row.id !== excludeId && normalizarNombre(row.nombre) === nombreNormalizado);
}

r.get('/', async (req, res, next) => {
  try {
    const rows = await db.all(`
      SELECT * FROM coordinador
      ORDER BY lower(trim(nombre)), activo DESC, created_at DESC
    `);
    ok(res, deduplicarCoordinadores(rows));
  } catch (error) {
    next(error);
  }
});

r.post('/', async (req, res, next) => {
  try {
    const { nombre, email, slack_user_id } = req.body;
    if (!nombre) return fail(res, 'VALIDATION_ERROR', 'nombre es requerido');
    if (await existeDuplicadoNombre(nombre)) return fail(res, 'VALIDATION_ERROR', 'Ya existe un coordinador con ese nombre');
    const id = uuidv4();
    await db.run('INSERT INTO coordinador (id, nombre, email, slack_user_id) VALUES (?, ?, ?, ?)', [id, upperName(nombre), email || null, slack_user_id || null]);
    ok(res, await db.get('SELECT * FROM coordinador WHERE id = ?', [id]), 201);
  } catch (error) {
    next(error);
  }
});

r.patch('/:id', async (req, res, next) => {
  try {
    const row = await db.get('SELECT id FROM coordinador WHERE id = ?', [req.params.id]);
    if (!row) return notFound(res);
    const { nombre, email, slack_user_id, activo } = req.body;
    const sets = []; const vals = [];
    if (nombre !== undefined)        {
      if (!nombre) return fail(res, 'VALIDATION_ERROR', 'nombre es requerido');
      if (await existeDuplicadoNombre(nombre, req.params.id)) return fail(res, 'VALIDATION_ERROR', 'Ya existe un coordinador con ese nombre');
      sets.push('nombre=?'); vals.push(upperName(nombre));
    }
    if (email !== undefined)         { sets.push('email=?'); vals.push(email); }
    if (slack_user_id !== undefined) { sets.push('slack_user_id=?'); vals.push(slack_user_id); }
    if (activo !== undefined)        { sets.push('activo=?'); vals.push(activo ? 1 : 0); }
    if (sets.length) {
      vals.push(req.params.id);
      await db.run(`UPDATE coordinador SET ${sets.join(',')} WHERE id=?`, vals);
    }
    ok(res, await db.get('SELECT * FROM coordinador WHERE id = ?', [req.params.id]));
  } catch (error) {
    next(error);
  }
});

r.delete('/:id', async (req, res, next) => {
  try {
    const row = await db.get('SELECT id FROM coordinador WHERE id = ?', [req.params.id]);
    if (!row) return notFound(res);
    await db.run('UPDATE coordinador SET activo = 0 WHERE id = ?', [req.params.id]);
    ok(res, { id: req.params.id, activo: 0 });
  } catch (error) {
    next(error);
  }
});

module.exports = r;
