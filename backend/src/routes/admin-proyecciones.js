const r = require('express').Router();
const { ok, fail } = require('../middleware/envelope');
const { requireRole } = require('../services/auth');
const audit = require('../services/audit');
const proyecciones = require('../services/proyecciones');

r.use(requireRole('admin'));

r.get('/', (req, res) => {
  ok(res, proyecciones.listProyecciones(req.query || {}));
});

r.get('/resumen', (req, res) => {
  ok(res, proyecciones.resumen(req.query || {}));
});

r.get('/versiones', (req, res) => {
  ok(res, proyecciones.versiones(req.query && req.query.anio));
});

r.post('/versiones', (req, res) => {
  try {
    const version = proyecciones.crearVersionDesdeActiva(req.body || {}, req.user && (req.user.username || req.user.email));
    audit.log(req, 'crear_version_proyeccion', 'proyeccion_version', version.id, version);
    ok(res, version, 201);
  } catch (e) {
    fail(res, 'PROYECCION_VERSION_ERROR', e.message || 'No se pudo crear versión');
  }
});

r.put('/versiones/:id/activar', (req, res) => {
  try {
    const version = proyecciones.activarVersion(req.params.id);
    audit.log(req, 'activar_version_proyeccion', 'proyeccion_version', version.id, version);
    ok(res, version);
  } catch (e) {
    fail(res, 'PROYECCION_VERSION_ERROR', e.message || 'No se pudo activar versión');
  }
});

r.post('/versiones/:id/duplicar', (req, res) => {
  try {
    const version = proyecciones.duplicarVersion(req.params.id, req.user && (req.user.username || req.user.email));
    audit.log(req, 'duplicar_version_proyeccion', 'proyeccion_version', version.id, { source: req.params.id, version });
    ok(res, version, 201);
  } catch (e) {
    fail(res, 'PROYECCION_VERSION_ERROR', e.message || 'No se pudo duplicar versión');
  }
});

r.put('/versiones/:id', (req, res) => {
  try {
    const version = proyecciones.renombrarVersion(req.params.id, req.body || {});
    audit.log(req, 'renombrar_version_proyeccion', 'proyeccion_version', version.id, version);
    ok(res, version);
  } catch (e) {
    fail(res, 'PROYECCION_VERSION_ERROR', e.message || 'No se pudo renombrar versión');
  }
});

r.get('/grilla', (req, res) => {
  ok(res, proyecciones.grilla(req.query || {}));
});

r.put('/mensual/:id', (req, res) => {
  try {
    const row = proyecciones.actualizarMensual(req.params.id, req.body || {});
    audit.log(req, 'actualizar_proyeccion_mensual', 'proyeccion_mensual', req.params.id, req.body || {});
    ok(res, row);
  } catch (e) {
    fail(res, 'PROYECCION_UPDATE_ERROR', e.message || 'No se pudo actualizar proyeccion mensual');
  }
});

r.post('/recalcular', (req, res) => {
  try {
    const result = proyecciones.recalcular(req.body || {});
    audit.log(req, req.body && req.body.confirm ? 'recalcular_proyeccion' : 'preview_recalcular_proyeccion', 'proyeccion', null, result);
    ok(res, result);
  } catch (e) {
    fail(res, 'PROYECCION_RECALC_ERROR', e.message || 'No se pudo recalcular');
  }
});

r.get('/comparar-versiones', (req, res) => {
  try {
    ok(res, proyecciones.compararVersiones(req.query || {}));
  } catch (e) {
    fail(res, 'PROYECCION_COMPARE_ERROR', e.message || 'No se pudieron comparar versiones');
  }
});

r.post('/import', async (req, res) => {
  try {
    const result = await proyecciones.importFromExcel({
      filePath: req.body && (req.body.path || req.body.filePath),
      fileBuffer: req.body && req.body.fileBase64 ? Buffer.from(req.body.fileBase64, 'base64') : null,
      fileName: req.body && req.body.fileName,
      anio: req.body && req.body.anio,
      sheet: req.body && req.body.sheet
    });
    audit.log(req, 'importar_proyecciones', 'proyeccion', result.source, result);
    ok(res, result, 201);
  } catch (e) {
    fail(res, 'PROYECCION_IMPORT_ERROR', e.message || 'No se pudo importar el Excel');
  }
});

r.post('/import/preview', async (req, res) => {
  try {
    const result = await proyecciones.importPreview({
      filePath: req.body && (req.body.path || req.body.filePath),
      fileBuffer: req.body && req.body.fileBase64 ? Buffer.from(req.body.fileBase64, 'base64') : null,
      fileName: req.body && req.body.fileName,
      anio: req.body && req.body.anio,
      sheet: req.body && req.body.sheet
    });
    ok(res, result);
  } catch (e) {
    fail(res, 'PROYECCION_IMPORT_PREVIEW_ERROR', e.message || 'No se pudo previsualizar el Excel');
  }
});

r.post('/import/confirm', async (req, res) => {
  try {
    const result = await proyecciones.importConfirm({
      filePath: req.body && (req.body.path || req.body.filePath),
      fileBuffer: req.body && req.body.fileBase64 ? Buffer.from(req.body.fileBase64, 'base64') : null,
      fileName: req.body && req.body.fileName,
      anio: req.body && req.body.anio,
      sheet: req.body && req.body.sheet,
      items: req.body && req.body.items,
      source: req.body && req.body.source
    }, req.user && (req.user.username || req.user.email));
    audit.log(req, 'confirmar_import_proyeccion', 'proyeccion_version', result.version.id, result);
    ok(res, result, 201);
  } catch (e) {
    fail(res, 'PROYECCION_IMPORT_CONFIRM_ERROR', e.message || 'No se pudo confirmar la importacion');
  }
});

r.get('/export', async (req, res, next) => {
  try {
    const anio = Number(req.query.anio) || new Date().getFullYear();
    const buffer = await proyecciones.exportWorkbook(req.query || {});
    const filename = `Proyecciones_Plataformas_${anio}.xlsx`;
    audit.log(req, 'exportar_proyecciones', 'proyeccion', String(anio), req.query);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(Buffer.from(buffer));
  } catch (e) {
    next(e);
  }
});

r.get('/clientes', (req, res) => {
  ok(res, proyecciones.clientes());
});

r.get('/clientes/:clienteId/ms', (req, res) => {
  ok(res, proyecciones.msPorCliente(req.params.clienteId));
});

r.get('/grafico', (req, res) => {
  ok(res, proyecciones.grafico(req.query || {}));
});

r.get('/uf', (req, res) => {
  ok(res, proyecciones.ufRows(Number(req.query.anio) || new Date().getFullYear(), req.query || {}));
});

r.put('/uf', (req, res) => {
  const rows = Array.isArray(req.body && req.body.rows) ? req.body.rows : [];
  if (!rows.length) return fail(res, 'VALIDATION_ERROR', 'Debes enviar filas de UF');
  ok(res, proyecciones.upsertUf(rows));
});

r.put('/configuracion', (req, res) => {
  ok(res, proyecciones.saveConfiguracion(req.body || {}));
});

r.get('/recomendaciones', (req, res) => {
  ok(res, proyecciones.recomendaciones(req.query || {}));
});

module.exports = r;
