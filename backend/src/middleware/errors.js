const { fail } = require('./envelope');

module.exports = function errorHandler(err, req, res, next) {
  console.error('[ERROR]', err.message, err.stack);
  fail(res, 'INTERNAL_ERROR', err.message || 'Error interno del servidor', null, 500);
};
