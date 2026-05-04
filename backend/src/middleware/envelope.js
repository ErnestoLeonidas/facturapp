const { v4: uuidv4 } = require('uuid');

function ok(res, data, status = 200) {
  res.status(status).json({
    ok: true,
    data,
    meta: { requestId: uuidv4(), generatedAt: new Date().toISOString() },
    error: null
  });
}

function fail(res, code, message, details = null, status = 400) {
  res.status(status).json({
    ok: false,
    data: null,
    meta: { requestId: uuidv4() },
    error: { code, message, details }
  });
}

function notFound(res, msg = 'No encontrado') {
  fail(res, 'NOT_FOUND', msg, null, 404);
}

module.exports = { ok, fail, notFound };
