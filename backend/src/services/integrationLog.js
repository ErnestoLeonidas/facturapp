const db = require('../db');
const { v4: uuidv4 } = require('uuid');

function start(integracion, dataset) {
  const id = uuidv4();
  db.prepare(`
    INSERT INTO bitacora_integracion (id, integracion, dataset, estado)
    VALUES (?, ?, ?, ?)
  `).run(id, integracion, dataset, 'EnProceso');
  return id;
}

function finish(id, estado, payload = {}) {
  db.prepare(`
    UPDATE bitacora_integracion
    SET estado = ?,
        mensaje = ?,
        filas_leidas = ?,
        filas_procesadas = ?,
        detalles = ?,
        finalizado_at = datetime('now')
    WHERE id = ?
  `).run(
    estado,
    payload.mensaje || null,
    payload.filas_leidas || 0,
    payload.filas_procesadas || 0,
    payload.detalles ? JSON.stringify(payload.detalles) : null,
    id
  );
}

function latest(limit = 20) {
  return db.prepare(`
    SELECT * FROM bitacora_integracion
    ORDER BY iniciado_at DESC
    LIMIT ?
  `).all(limit);
}

module.exports = { start, finish, latest };
