const r = require('express').Router();
const { getUF } = require('../services/uf');
const { ok, fail } = require('../middleware/envelope');

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
