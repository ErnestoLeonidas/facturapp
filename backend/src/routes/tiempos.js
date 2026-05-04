const r = require('express').Router();
const db = require('../db');
const { ok, notFound } = require('../middleware/envelope');

r.patch('/:id', (req, res) => {
  const row = db.prepare('SELECT id FROM registro_tiempo WHERE id=?').get(req.params.id);
  if (!row) return notFound(res);
  const { fecha, minutos, descripcion, aprobado } = req.body;
  const sets = []; const vals = [];
  if (fecha !== undefined)      { sets.push('fecha=?'); vals.push(fecha); }
  if (minutos !== undefined)    { sets.push('minutos=?'); vals.push(minutos); }
  if (descripcion !== undefined){ sets.push('descripcion=?'); vals.push(descripcion); }
  if (aprobado !== undefined)   { sets.push('aprobado=?'); vals.push(aprobado ? 1 : 0); }
  if (sets.length) { vals.push(req.params.id); db.prepare(`UPDATE registro_tiempo SET ${sets.join(',')} WHERE id=?`).run(...vals); }
  ok(res, db.prepare('SELECT * FROM registro_tiempo WHERE id=?').get(req.params.id));
});

module.exports = r;
