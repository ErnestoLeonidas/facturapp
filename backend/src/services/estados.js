const db = require('../db');
const { v4: uuidv4 } = require('uuid');

const TRANSICIONES = {
  'PENDIENTE OC / HES': ['FACTURA SOLICITADA', 'Borrador'],
  'FACTURA SOLICITADA': ['FACTURADO', 'PENDIENTE OC / HES'],
  'FACTURADO': ['Cerrada'],
  Borrador:       ['PendienteDatos', 'EnRevision'],
  PendienteDatos: ['EnRevision', 'Borrador'],
  EnRevision:     ['Aprobada', 'Rechazada'],
  Aprobada:       ['Emitida'],
  Rechazada:      ['Borrador'],
  Emitida:        ['Facturada', 'Anulada'],
  Facturada:      ['Cerrada'],
  Anulada:        ['Cerrada'],
  Cerrada:        []
};

const ESTADO_EDITABLE = ['PENDIENTE OC / HES', 'FACTURA SOLICITADA', 'Borrador', 'PendienteDatos'];

function puedeEditar(estado) {
  return ESTADO_EDITABLE.includes(estado);
}

function transicionValida(desde, hacia) {
  return (TRANSICIONES[desde] || []).includes(hacia);
}

function cambiarEstado(solicitudId, hacia, usuario = 'sistema', comentario = '') {
  const sol = db.prepare('SELECT estado FROM solicitud_factura WHERE id = ? AND is_delete = 0').get(solicitudId);
  if (!sol) throw Object.assign(new Error('Solicitud no encontrada'), { code: 'NOT_FOUND' });

  const desde = sol.estado;
  if (!transicionValida(desde, hacia)) {
    const err = new Error(`No se puede pasar de "${desde}" a "${hacia}"`);
    err.code = 'STATE_TRANSITION_INVALID';
    throw err;
  }

  db.prepare('UPDATE solicitud_factura SET estado = ?, updated_at = datetime(\'now\') WHERE id = ?').run(hacia, solicitudId);
  db.prepare('INSERT INTO historial_estado (id, solicitud_id, estado_desde, estado_hacia, usuario, comentario) VALUES (?, ?, ?, ?, ?, ?)')
    .run(uuidv4(), solicitudId, desde, hacia, usuario, comentario || '');

  return hacia;
}

module.exports = { cambiarEstado, puedeEditar, transicionValida, TRANSICIONES };
