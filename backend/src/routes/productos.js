const r = require('express').Router();
const db = require('../db');
const { v4: uuidv4 } = require('uuid');
const { ok, fail, notFound } = require('../middleware/envelope');
const { upperName } = require('../db-normalize-names');

r.get('/', (req, res) => {
  const { q } = req.query;
  let sql = 'SELECT * FROM producto WHERE activo=1';
  const vals = [];
  if (q) { sql += ' AND (codigo LIKE ? OR nombre LIKE ?)'; vals.push(`%${q}%`,`%${q}%`); }
  sql += ' ORDER BY nombre';
  ok(res, db.prepare(sql).all(...vals));
});

r.post('/', (req, res) => {
  const { codigo, nombre, categoria } = req.body;
  if (!nombre) return fail(res, 'VALIDATION_ERROR', 'nombre es requerido');
  const id = uuidv4();
  db.prepare('INSERT INTO producto (id, codigo, nombre, categoria) VALUES (?,?,?,?)').run(id, codigo||null, upperName(nombre), categoria||null);
  ok(res, db.prepare('SELECT * FROM producto WHERE id=?').get(id), 201);
});

r.patch('/:id', (req, res) => {
  const row = db.prepare('SELECT id FROM producto WHERE id=?').get(req.params.id);
  if (!row) return notFound(res);
  const { codigo, nombre, categoria, activo } = req.body;
  const sets=[]; const vals=[];
  if (codigo!==undefined)   { sets.push('codigo=?'); vals.push(codigo); }
  if (nombre!==undefined)   { sets.push('nombre=?'); vals.push(upperName(nombre)); }
  if (categoria!==undefined){ sets.push('categoria=?'); vals.push(categoria); }
  if (activo!==undefined)   { sets.push('activo=?'); vals.push(activo?1:0); }
  if (sets.length) { vals.push(req.params.id); db.prepare(`UPDATE producto SET ${sets.join(',')} WHERE id=?`).run(...vals); }
  ok(res, db.prepare('SELECT * FROM producto WHERE id=?').get(req.params.id));
});

module.exports = r;
