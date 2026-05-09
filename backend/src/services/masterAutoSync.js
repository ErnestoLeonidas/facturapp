const googleMasterFacturacion = require('./googleMasterFacturacion');
const integrationLog = require('./integrationLog');

function enabled() {
  return process.env.GOOGLE_MASTER_AUTOPUSH !== 'false' && !!process.env.GOOGLE_SA_JSON_PATH;
}

function pushMasterAsync(reason) {
  if (!enabled()) return;
  const logId = integrationLog.start('google_sheets', 'base_facturacion_master_autopush');
  googleMasterFacturacion.pushMasterFacturacion()
    .then(result => {
      integrationLog.finish(logId, 'OK', {
        mensaje: `Autopush master completado${reason ? ': ' + reason : ''}`,
        filas_leidas: result.filas_leidas,
        filas_procesadas: result.filas_procesadas,
        detalles: result
      });
    })
    .catch(error => {
      integrationLog.finish(logId, 'Error', {
        mensaje: error.message,
        detalles: { code: error.code }
      });
    });
}

module.exports = { pushMasterAsync };
