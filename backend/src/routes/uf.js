const r = require('express').Router();
const { getUF, getHistorialUF } = require('../services/uf');
const { ok, fail } = require('../middleware/envelope');

r.get('/historial', async (req, res, next) => {
  const anio = Number(req.query.anio);
  const mes = Number(req.query.mes);

  if (anio !== 2026) {
    return fail(res, 'VALIDATION_ERROR', 'Por ahora el historial UF solo esta disponible para 2026');
  }
  if (!Number.isInteger(mes) || mes < 1 || mes > 12) {
    return fail(res, 'VALIDATION_ERROR', 'mes debe ser un numero entre 1 y 12');
  }

  try {
    ok(res, await getHistorialUF(anio, mes));
  } catch (e) {
    if (e.code === 'UF_UNAVAILABLE') return fail(res, 'UF_UNAVAILABLE', e.message, e.details || null, 503);
    next(e);
  }
});

r.get('/', async (req, res, next) => {
  const { fecha } = req.query;
  if (!fecha || !/^\d{4}-\d{2}-\d{2}$/.test(fecha))
    return fail(res, 'VALIDATION_ERROR', 'fecha debe ser YYYY-MM-DD');
  try {
    ok(res, await getUF(fecha));
  } catch (e) {
    if (e.code === 'UF_UNAVAILABLE') return fail(res, 'UF_UNAVAILABLE', e.message, null, 503);
    next(e);
  }
});

module.exports = r;
