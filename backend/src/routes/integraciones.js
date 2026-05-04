const r = require('express').Router();
const db = require('../db');
const { ok, fail } = require('../middleware/envelope');

r.get('/google-sheets/estado', (req, res) => {
  ok(res, { message: 'Google Sheets no configurado aún. Configurar GOOGLE_SA_JSON_PATH en .env para activar.' });
});

r.post('/google-sheets/sync', (req, res) => {
  const { dataset } = req.query;
  if (!process.env.GOOGLE_SA_JSON_PATH)
    return fail(res, 'SHEETS_SYNC_FAILED', 'Service Account no configurada. Ver docs/integraciones.md', null, 503);
  fail(res, 'SHEETS_SYNC_FAILED', `Integración Google Sheets pendiente de configuración (dataset: ${dataset})`, null, 503);
});

module.exports = r;
