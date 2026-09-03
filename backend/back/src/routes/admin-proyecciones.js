const r = require('express').Router();
const { ok, fail } = require('../middleware/envelope');
const { requireRole } = require('../services/auth');
const audit = require('../services/audit');
const proyecciones = require('../services/proyecciones');

r.use(requireRole('admin'));

r.get('/', async (req, res, next) => {
  try {
    ok(res, await proyecciones.listProyecciones(req.query || {}));
  } catch (error) {
    next(error);
  }
});

r.get('/resumen', async (req, res, next) => {
  try {
    ok(res, await proyecciones.resumen(req.query || {}));
  } catch (error) {
    next(error);
  }
});

r.get('/versiones', async (req, res, next) => {
  try {
    ok(res, await proyecciones.versiones(req.query && req.query.anio));
  } catch (error) {
    next(error);
  }
});

r.post('/versiones', async (req, res) => {
  try {
    const version = await proyecciones.crearVersionDesdeActiva(req.body || {}, req.user && (req.user.username || req.user.email));
    await audit.log(req, 'crear_version_proyeccion', 'proyeccion_version', version.id, version);
    ok(res, version, 201);
  } catch (error) {
    fail(res, 'PROYECCION_VERSION_ERROR', error.message || 'No se pudo crear version');
  }
});

r.put('/versiones/:id/activar', async (req, res) => {
  try {
    const version = await proyecciones.activarVersion(req.params.id);
    await audit.log(req, 'activar_version_proyeccion', 'proyeccion_version', version.id, version);
    ok(res, version);
  } catch (error) {
    fail(res, 'PROYECCION_VERSION_ERROR', error.message || 'No se pudo activar version');
  }
});

r.post('/versiones/:id/duplicar', async (req, res) => {
  try {
    const version = await proyecciones.duplicarVersion(req.params.id, req.user && (req.user.username || req.user.email));
    await audit.log(req, 'duplicar_version_proyeccion', 'proyeccion_version', version.id, { source: req.params.id, version });
    ok(res, version, 201);
  } catch (error) {
    fail(res, 'PROYECCION_VERSION_ERROR', error.message || 'No se pudo duplicar version');
  }
});

r.put('/versiones/:id', async (req, res) => {
  try {
    const version = await proyecciones.renombrarVersion(req.params.id, req.body || {});
    await audit.log(req, 'renombrar_version_proyeccion', 'proyeccion_version', version.id, version);
    ok(res, version);
  } catch (error) {
    fail(res, 'PROYECCION_VERSION_ERROR', error.message || 'No se pudo renombrar version');
  }
});

r.get('/grilla', async (req, res, next) => {
  try {
    ok(res, await proyecciones.grilla(req.query || {}));
  } catch (error) {
    next(error);
  }
});

r.put('/mensual/:id', async (req, res) => {
  try {
    const row = await proyecciones.actualizarMensual(req.params.id, req.body || {});
    await audit.log(req, 'actualizar_proyeccion_mensual', 'proyeccion_mensual', req.params.id, req.body || {});
    ok(res, row);
  } catch (error) {
    fail(res, 'PROYECCION_UPDATE_ERROR', error.message || 'No se pudo actualizar proyeccion mensual');
  }
});

r.post('/recalcular', async (req, res) => {
  try {
    const result = await proyecciones.recalcular(req.body || {});
    await audit.log(req, req.body && req.body.confirm ? 'recalcular_proyeccion' : 'preview_recalcular_proyeccion', 'proyeccion', null, result);
    ok(res, result);
  } catch (error) {
    fail(res, 'PROYECCION_RECALC_ERROR', error.message || 'No se pudo recalcular');
  }
});

r.get('/comparar-versiones', async (req, res) => {
  try {
    ok(res, await proyecciones.compararVersiones(req.query || {}));
  } catch (error) {
    fail(res, 'PROYECCION_COMPARE_ERROR', error.message || 'No se pudieron comparar versiones');
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
    await audit.log(req, 'importar_proyecciones', 'proyeccion', result.source, result);
    ok(res, result, 201);
  } catch (error) {
    fail(res, 'PROYECCION_IMPORT_ERROR', error.message || 'No se pudo importar el Excel');
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
  } catch (error) {
    fail(res, 'PROYECCION_IMPORT_PREVIEW_ERROR', error.message || 'No se pudo previsualizar el Excel');
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
    await audit.log(req, 'confirmar_import_proyeccion', 'proyeccion_version', result.version.id, result);
    ok(res, result, 201);
  } catch (error) {
    fail(res, 'PROYECCION_IMPORT_CONFIRM_ERROR', error.message || 'No se pudo confirmar la importacion');
  }
});

r.get('/export', async (req, res, next) => {
  try {
    const anio = Number(req.query.anio) || new Date().getFullYear();
    const buffer = await proyecciones.exportWorkbook(req.query || {});
    const filename = `Proyecciones_Plataformas_${anio}.xlsx`;
    await audit.log(req, 'exportar_proyecciones', 'proyeccion', String(anio), req.query);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(Buffer.from(buffer));
  } catch (error) {
    next(error);
  }
});

r.get('/clientes', async (req, res, next) => {
  try {
    ok(res, await proyecciones.clientes());
  } catch (error) {
    next(error);
  }
});

r.get('/clientes/:clienteId/ms', async (req, res, next) => {
  try {
    ok(res, await proyecciones.msPorCliente(req.params.clienteId));
  } catch (error) {
    next(error);
  }
});

r.get('/grafico', async (req, res, next) => {
  try {
    ok(res, await proyecciones.grafico(req.query || {}));
  } catch (error) {
    next(error);
  }
});

r.get('/uf', async (req, res, next) => {
  try {
    ok(res, await proyecciones.ufRows(Number(req.query.anio) || new Date().getFullYear(), req.query || {}));
  } catch (error) {
    next(error);
  }
});

r.put('/uf', async (req, res, next) => {
  const rows = Array.isArray(req.body && req.body.rows) ? req.body.rows : [];
  if (!rows.length) return fail(res, 'VALIDATION_ERROR', 'Debes enviar filas de UF');
  try {
    ok(res, await proyecciones.upsertUf(rows));
  } catch (error) {
    next(error);
  }
});

r.put('/configuracion', async (req, res, next) => {
  try {
    ok(res, await proyecciones.saveConfiguracion(req.body || {}));
  } catch (error) {
    next(error);
  }
});

r.get('/recomendaciones', async (req, res, next) => {
  try {
    ok(res, await proyecciones.recomendaciones(req.query || {}));
  } catch (error) {
    next(error);
  }
});

module.exports = r;
