const db = require('../db-async');
const { v4: uuidv4 } = require('uuid');

function log(req, accion, entidad, entidadId, detalle = {}) {
  const user = req && req.user;
  return db.run(`
    INSERT INTO audit_log (id, usuario_id, usuario_email, accion, entidad, entidad_id, detalle)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `, [
    uuidv4(),
    user ? user.id : null,
    user ? user.email : (req && req.body && req.body._usuario) || 'sistema',
    accion,
    entidad,
    entidadId || null,
    JSON.stringify(detalle || {})
  ]).catch(error => {
    console.warn('No se pudo registrar auditoria:', error.message);
  });
}

async function latest(limit = 50) {
  return db.all(`
    SELECT *
    FROM audit_log
    ORDER BY created_at DESC
    LIMIT ?
  `, [Math.min(Math.max(Number(limit) || 50, 1), 200)]);
}

module.exports = { log, latest };
