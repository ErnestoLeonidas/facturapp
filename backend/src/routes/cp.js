const r = require('express').Router();
const db = require('../db');
const { v4: uuidv4 } = require('uuid');
const { ok, fail, notFound } = require('../middleware/envelope');
const { upperName } = require('../db-normalize-names');

function validarTipoCP(tipoCp) {
  return !!db.prepare(`
    SELECT codigo
    FROM catalogo_tipo_cp
    WHERE activo = 1
      AND (codigo = ? OR nombre = ?)
    LIMIT 1
  `).get(tipoCp, tipoCp);
}

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
  const { codigo, nombre, tipo_cp, area, cliente_id } = req.body;
  if (!codigo) return fail(res, 'VALIDATION_ERROR', 'codigo es requerido');
  if (!nombre) return fail(res, 'VALIDATION_ERROR', 'nombre es requerido');
  if (!tipo_cp) return fail(res, 'VALIDATION_ERROR', 'tipo_cp es requerido');
  if (!validarTipoCP(tipo_cp)) return fail(res, 'VALIDATION_ERROR', 'tipo_cp inválido');
  if (!cliente_id) return fail(res, 'VALIDATION_ERROR', 'cliente_id es requerido');
  const id = uuidv4();
  db.prepare('INSERT INTO cp (id, codigo, nombre, tipo_cp, area, cliente_id) VALUES (?, ?, ?, ?, ?, ?)').run(id, codigo, upperName(nombre) || null, tipo_cp, area || null, cliente_id || null);
  ok(res, db.prepare('SELECT * FROM cp WHERE id = ?').get(id), 201);
});

r.patch('/:id', (req, res) => {
  const row = db.prepare('SELECT id FROM cp WHERE id = ?').get(req.params.id);
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
    if (!validarTipoCP(tipo_cp)) return fail(res, 'VALIDATION_ERROR', 'tipo_cp inválido');
    sets.push('tipo_cp=?'); vals.push(tipo_cp);
  }
  if (area !== undefined)      { sets.push('area=?'); vals.push(area); }
  if (cliente_id !== undefined){
    if (!cliente_id) return fail(res, 'VALIDATION_ERROR', 'cliente_id es requerido');
    sets.push('cliente_id=?'); vals.push(cliente_id);
  }
  if (activo !== undefined)    { sets.push('activo=?'); vals.push(activo ? 1 : 0); }
  if (sets.length) { vals.push(req.params.id); db.prepare(`UPDATE cp SET ${sets.join(',')} WHERE id=?`).run(...vals); }
  ok(res, db.prepare('SELECT * FROM cp WHERE id = ?').get(req.params.id));
});

r.delete('/:id', (req, res) => {
  const row = db.prepare('SELECT id FROM cp WHERE id = ?').get(req.params.id);
  if (!row) return notFound(res);
  db.prepare('UPDATE cp SET activo = 0 WHERE id = ?').run(req.params.id);
  ok(res, { id: req.params.id, activo: 0 });
});

module.exports = r;
