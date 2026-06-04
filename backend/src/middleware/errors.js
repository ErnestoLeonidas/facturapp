const { fail } = require('./envelope');

module.exports = function errorHandler(err, req, res, next) {
  const isProduction = process.env.NODE_ENV === 'production';
  if (isProduction) {
    console.error('[ERROR]', err.message);
    return fail(res, 'INTERNAL_ERROR', 'Error interno del servidor', null, 500);
  }
  console.error('[ERROR]', err.message, err.stack);
  fail(res, 'INTERNAL_ERROR', err.message || 'Error interno del servidor', null, 500);
};
