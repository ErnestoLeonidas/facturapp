const r = require('express').Router();
const db = require('../db');
const { ok, fail } = require('../middleware/envelope');
const sheetsSync = require('../services/googleSheetsSync');
const driveTemplates = require('../services/googleDriveTemplates');
const integrationLog = require('../services/integrationLog');
const { serviceAccountPath } = require('../services/google');
const excelBaseFacturacion = require('../services/excelBaseFacturacion');
const excelMasterFacturacion = require('../services/excelMasterFacturacion');

function googleConfigured() {
  return !!process.env.GOOGLE_SA_JSON_PATH;
}

function handleIntegrationError(res, error, fallbackCode) {
  const code = error.code || fallbackCode;
  const status = ['GOOGLE_AUTH_MISSING', 'SHEETS_CONFIG_MISSING', 'DRIVE_CONFIG_MISSING'].includes(code) ? 503 : 400;
  return fail(res, code, error.message, null, status);
}

r.get('/google-sheets/estado', (req, res) => {
  const logs = db.prepare(`
    SELECT *
    FROM bitacora_integracion
    WHERE integracion = 'google_sheets'
    ORDER BY iniciado_at DESC
    LIMIT 20
  `).all();

  ok(res, {
    configured: googleConfigured(),
    serviceAccountPath: serviceAccountPath(),
    baseFacturacionId: process.env.GOOGLE_SHEETS_BASE_FACTURACION_ID || '1YFn9QfyIympuqS7zeF2jtfSjOTwBI184CP4mkRUB4V0',
    baseFacturacionRange: process.env.GOOGLE_SHEETS_BASE_FACTURACION_RANGE || 'A:N',
    proyeccionesId: process.env.GOOGLE_SHEETS_PROYECCIONES_ID || null,
    logs
  });
});

r.post('/google-sheets/sync', async (req, res) => {
  const dataset = req.query.dataset || 'base_facturacion';
  const logId = integrationLog.start('google_sheets', dataset);

  try {
    const result = await sheetsSync.sync(dataset);
    integrationLog.finish(logId, 'OK', {
      mensaje: 'Sincronizacion completada',
      filas_leidas: result.filas_leidas,
      filas_procesadas: result.filas_procesadas,
      detalles: result
    });
    ok(res, result);
  } catch (e) {
    integrationLog.finish(logId, 'Error', {
      mensaje: e.message,
      detalles: { code: e.code, stack: process.env.NODE_ENV === 'development' ? e.stack : undefined }
    });
    handleIntegrationError(res, e, 'SHEETS_SYNC_FAILED');
  }
});

r.post('/excel/base-facturacion/import', async (req, res) => {
  const source = (req.query.source || req.body?.source || 'public-google-sheet').toString();
  const logId = integrationLog.start('excel', 'base_facturacion');

  try {
    const result = source === 'file'
      ? await excelBaseFacturacion.importFromFile(req.body?.path || req.query.path)
      : await excelBaseFacturacion.importFromPublicGoogleSheet(req.body?.spreadsheetId || req.query.spreadsheetId);

    integrationLog.finish(logId, 'OK', {
      mensaje: 'Importacion Excel completada',
      filas_leidas: result.filas_leidas,
      filas_procesadas: result.filas_procesadas,
      detalles: result
    });
    ok(res, result);
  } catch (e) {
    integrationLog.finish(logId, 'Error', {
      mensaje: e.message,
      detalles: { code: e.code, stack: process.env.NODE_ENV === 'development' ? e.stack : undefined }
    });
    handleIntegrationError(res, e, 'EXCEL_IMPORT_FAILED');
  }
});

r.post('/excel/master-facturacion/import', async (req, res) => {
  const logId = integrationLog.start('excel', 'base_facturacion_master');

  try {
    const result = await excelMasterFacturacion.importFromPublicGoogleSheet(req.body?.spreadsheetId || req.query.spreadsheetId);
    integrationLog.finish(logId, 'OK', {
      mensaje: 'Importacion master completada',
      filas_leidas: result.filas_leidas,
      filas_procesadas: result.filas_procesadas,
      detalles: result
    });
    ok(res, result);
  } catch (e) {
    integrationLog.finish(logId, 'Error', {
      mensaje: e.message,
      detalles: { code: e.code, stack: process.env.NODE_ENV === 'development' ? e.stack : undefined }
    });
    handleIntegrationError(res, e, 'MASTER_IMPORT_FAILED');
  }
});

r.get('/google-drive/plantillas', async (req, res) => {
  try {
    const files = await driveTemplates.listTemplates(req.query.q || 'plantilla solicitud factura');
    ok(res, files);
  } catch (e) {
    handleIntegrationError(res, e, 'DRIVE_LIST_FAILED');
  }
});

r.get('/google-drive/plantilla', async (req, res) => {
  try {
    const metadata = await driveTemplates.getMetadata(req.query.fileId);
    ok(res, metadata);
  } catch (e) {
    handleIntegrationError(res, e, 'DRIVE_TEMPLATE_FAILED');
  }
});

r.post('/google-drive/plantilla/sync', async (req, res) => {
  const logId = integrationLog.start('google_drive', 'plantilla');

  try {
    const result = await driveTemplates.downloadTemplate(req.body && req.body.fileId);
    integrationLog.finish(logId, 'OK', {
      mensaje: 'Plantilla sincronizada',
      filas_leidas: 1,
      filas_procesadas: 1,
      detalles: result
    });
    ok(res, result, 201);
  } catch (e) {
    integrationLog.finish(logId, 'Error', {
      mensaje: e.message,
      detalles: { code: e.code, stack: process.env.NODE_ENV === 'development' ? e.stack : undefined }
    });
    handleIntegrationError(res, e, 'DRIVE_TEMPLATE_SYNC_FAILED');
  }
});

r.get('/bitacora', (req, res) => {
  ok(res, integrationLog.latest(Number(req.query.limit) || 50));
});

module.exports = r;
