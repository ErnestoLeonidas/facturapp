const r = require('express').Router();
const db = require('../db-async');
const { v4: uuidv4 } = require('uuid');
const { ok, fail, notFound } = require('../middleware/envelope');
const { upperName } = require('../db-normalize-names');

async function validarTipoCP(tipoCp) {
  return !!(await db.get(`
    SELECT codigo
    FROM catalogo_tipo_cp
    WHERE activo = 1
      AND (codigo = ? OR nombre = ?)
    LIMIT 1
  `, [tipoCp, tipoCp]));
}

r.get('/', async (req, res, next) => {
  try {
    const { clienteId, q } = req.query;
    let sql = 'SELECT * FROM cp WHERE activo = 1';
    const vals = [];
    if (clienteId) { sql += ' AND cliente_id = ?'; vals.push(clienteId); }
    if (q) { sql += ' AND (codigo LIKE ? OR nombre LIKE ?)'; vals.push(`%${q}%`, `%${q}%`); }
    sql += ' ORDER BY codigo';
    ok(res, await db.all(sql, vals));
  } catch (error) {
    next(error);
  }
});

r.post('/', async (req, res, next) => {
  try {
    const { codigo, nombre, tipo_cp, area, cliente_id } = req.body;
    if (!codigo) return fail(res, 'VALIDATION_ERROR', 'codigo es requerido');
    if (!nombre) return fail(res, 'VALIDATION_ERROR', 'nombre es requerido');
    if (!tipo_cp) return fail(res, 'VALIDATION_ERROR', 'tipo_cp es requerido');
    if (!(await validarTipoCP(tipo_cp))) return fail(res, 'VALIDATION_ERROR', 'tipo_cp invalido');
    if (!cliente_id) return fail(res, 'VALIDATION_ERROR', 'cliente_id es requerido');
    const id = uuidv4();
    await db.run(
      'INSERT INTO cp (id, codigo, nombre, tipo_cp, area, cliente_id) VALUES (?, ?, ?, ?, ?, ?)',
      [id, codigo, upperName(nombre) || null, tipo_cp, area || null, cliente_id || null]
    );
    ok(res, await db.get('SELECT * FROM cp WHERE id = ?', [id]), 201);
  } catch (error) {
    next(error);
  }
});

r.patch('/:id', async (req, res, next) => {
  try {
    const row = await db.get('SELECT id FROM cp WHERE id = ?', [req.params.id]);
    if (!row) return notFound(res);
    const { codigo, nombre, tipo_cp, area, cliente_id, activo } = req.body;
    const sets = []; const vals = [];
    if (codigo !== undefined)    {
      if (!codigo) return fail(res, 'VALIDATION_ERROR', 'codigo es requerido');
      sets.push('codigo=?'); vals.push(codigo);
    }
    if (nombre !== undefined)    {
      if (!nombre) return fail(res, 'VALIDATION_ERROR', 'nombre es requerido');
      sets.push('nombre=?'); vals.push(upperName(nombre));
    }
    if (tipo_cp !== undefined)   {
      if (!tipo_cp) return fail(res, 'VALIDATION_ERROR', 'tipo_cp es requerido');
      if (!(await validarTipoCP(tipo_cp))) return fail(res, 'VALIDATION_ERROR', 'tipo_cp invalido');
      sets.push('tipo_cp=?'); vals.push(tipo_cp);
    }
    if (area !== undefined)      { sets.push('area=?'); vals.push(area); }
    if (cliente_id !== undefined){
      if (!cliente_id) return fail(res, 'VALIDATION_ERROR', 'cliente_id es requerido');
      sets.push('cliente_id=?'); vals.push(cliente_id);
    }
    if (activo !== undefined)    { sets.push('activo=?'); vals.push(activo ? 1 : 0); }
    if (sets.length) {
      vals.push(req.params.id);
      await db.run(`UPDATE cp SET ${sets.join(',')} WHERE id=?`, vals);
    }
    ok(res, await db.get('SELECT * FROM cp WHERE id = ?', [req.params.id]));
  } catch (error) {
    next(error);
  }
});

r.delete('/:id', async (req, res, next) => {
  try {
    const row = await db.get('SELECT id FROM cp WHERE id = ?', [req.params.id]);
    if (!row) return notFound(res);
    await db.run('UPDATE cp SET activo = 0 WHERE id = ?', [req.params.id]);
    ok(res, { id: req.params.id, activo: 0 });
  } catch (error) {
    next(error);
  }
});

module.exports = r;
