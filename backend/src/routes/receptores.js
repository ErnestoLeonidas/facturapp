const r = require('express').Router();
const db = require('../db-async');
const { v4: uuidv4 } = require('uuid');
const { ok, fail, notFound } = require('../middleware/envelope');
const { upperName } = require('../db-normalize-names');

function clean(value) {
  return String(value || '').trim();
}

function normalizeEmail(value) {
  return clean(value).toLowerCase();
}

async function clienteActivo(clienteId) {
  return db.get("SELECT id FROM cliente WHERE id = ? AND estado <> 'Inactivo'", [clienteId]);
}

async function receptorDuplicado(clienteId, email, excludeId) {
  const vals = [clienteId, email];
  let sql = `
    SELECT id
    FROM receptor
    WHERE cliente_id = ?
      AND lower(trim(email)) = lower(trim(?))
      AND activo = 1
  `;
  if (excludeId) {
    sql += ' AND id <> ?';
    vals.push(excludeId);
  }
  sql += ' LIMIT 1';
  return db.get(sql, vals);
}

r.get('/', async (req, res, next) => {
  try {
    const { clienteId } = req.query;
    if (!clienteId) return fail(res, 'VALIDATION_ERROR', 'Se requiere clienteId');
    ok(res, await db.all('SELECT * FROM receptor WHERE cliente_id = ? AND activo = 1 ORDER BY nombre', [clienteId]));
  } catch (error) {
    next(error);
  }
});

r.post('/', async (req, res, next) => {
  try {
    const { cliente_id, nombre, email, cargo } = req.body;
    if (!cliente_id || !nombre || !email) return fail(res, 'VALIDATION_ERROR', 'cliente_id, nombre y email son requeridos');
    if (!(await clienteActivo(cliente_id))) return fail(res, 'VALIDATION_ERROR', 'Cliente no existe o esta inactivo');
    const emailNormalizado = normalizeEmail(email);
    if (await receptorDuplicado(cliente_id, emailNormalizado)) {
      return fail(res, 'VALIDATION_ERROR', 'Ya existe un receptor activo con ese email para este cliente');
    }
    const id = uuidv4();
    await db.run(
      'INSERT INTO receptor (id, cliente_id, nombre, email, cargo) VALUES (?, ?, ?, ?, ?)',
      [id, cliente_id, upperName(nombre), emailNormalizado, cargo || null]
    );
    ok(res, await db.get('SELECT * FROM receptor WHERE id = ?', [id]), 201);
  } catch (error) {
    next(error);
  }
});

r.patch('/:id', async (req, res, next) => {
  try {
    const row = await db.get('SELECT id, cliente_id, email FROM receptor WHERE id = ?', [req.params.id]);
    if (!row) return notFound(res);
    const { nombre, email, cargo, activo } = req.body;
    const sets = []; const vals = [];
    if (nombre !== undefined)  { sets.push('nombre=?'); vals.push(upperName(nombre)); }
    if (email !== undefined)   {
      const emailNormalizado = normalizeEmail(email);
      if (!emailNormalizado) return fail(res, 'VALIDATION_ERROR', 'email es requerido');
      if ((activo === undefined || activo) && await receptorDuplicado(row.cliente_id, emailNormalizado, row.id)) {
        return fail(res, 'VALIDATION_ERROR', 'Ya existe un receptor activo con ese email para este cliente');
      }
      sets.push('email=?'); vals.push(emailNormalizado);
    }
    if (activo && await receptorDuplicado(row.cliente_id, email !== undefined ? normalizeEmail(email) : row.email, row.id)) {
      return fail(res, 'VALIDATION_ERROR', 'Ya existe un receptor activo con ese email para este cliente');
    }
    if (cargo !== undefined)   { sets.push('cargo=?'); vals.push(cargo); }
    if (activo !== undefined)  { sets.push('activo=?'); vals.push(activo ? 1 : 0); }
    if (sets.length) {
      vals.push(req.params.id);
      await db.run(`UPDATE receptor SET ${sets.join(',')} WHERE id=?`, vals);
    }
    ok(res, await db.get('SELECT * FROM receptor WHERE id = ?', [req.params.id]));
  } catch (error) {
    next(error);
  }
});

r.delete('/:id', async (req, res, next) => {
  try {
    const row = await db.get('SELECT id FROM receptor WHERE id = ?', [req.params.id]);
    if (!row) return notFound(res);
    await db.run('UPDATE receptor SET activo = 0 WHERE id = ?', [req.params.id]);
    ok(res, { id: req.params.id, activo: false });
  } catch (error) {
    next(error);
  }
});

module.exports = r;
