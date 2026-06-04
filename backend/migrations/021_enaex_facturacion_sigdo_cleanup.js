const { v4: uuidv4 } = require('uuid');

function findCliente(db, nombre) {
  return db.prepare(`
    SELECT *
    FROM cliente
    WHERE upper(trim(nombre_corto)) = upper(trim(?))
    LIMIT 1
  `).get(nombre);
}

function mergeClienteReferences(db, fromId, toId) {
  if (!fromId || !toId || fromId === toId) return;

  db.prepare('UPDATE solicitud_factura SET cliente_id = ? WHERE cliente_id = ?').run(toId, fromId);
  db.prepare('UPDATE cp SET cliente_id = ? WHERE cliente_id = ?').run(toId, fromId);
  db.prepare('UPDATE proyeccion_facturacion SET cliente_id = ? WHERE cliente_id = ?').run(toId, fromId);
  db.prepare('UPDATE solicitud_programada SET cliente_id = ? WHERE cliente_id = ?').run(toId, fromId);

  db.prepare('SELECT id, producto_id FROM cliente_producto WHERE cliente_id = ?').all(fromId).forEach(link => {
    const exists = db.prepare('SELECT id FROM cliente_producto WHERE cliente_id = ? AND producto_id = ? LIMIT 1').get(toId, link.producto_id);
    if (exists) db.prepare('DELETE FROM cliente_producto WHERE id = ?').run(link.id);
    else db.prepare('UPDATE cliente_producto SET cliente_id = ? WHERE id = ?').run(toId, link.id);
  });

  db.prepare('SELECT id, coordinador_id, cp_id, cp_nombre FROM cliente_coordinador WHERE cliente_id = ?').all(fromId).forEach(link => {
    const exists = link.cp_nombre
      ? db.prepare('SELECT id FROM cliente_coordinador WHERE cliente_id = ? AND coordinador_id = ? AND cp_nombre = ? LIMIT 1').get(toId, link.coordinador_id, link.cp_nombre)
      : db.prepare('SELECT id FROM cliente_coordinador WHERE cliente_id = ? AND coordinador_id = ? AND cp_nombre IS NULL LIMIT 1').get(toId, link.coordinador_id);
    if (exists) db.prepare('DELETE FROM cliente_coordinador WHERE id = ?').run(link.id);
    else db.prepare('UPDATE cliente_coordinador SET cliente_id = ? WHERE id = ?').run(toId, link.id);
  });

  db.prepare('UPDATE receptor SET cliente_id = ? WHERE cliente_id = ?').run(toId, fromId);
}

function deleteCliente(db, clienteId) {
  if (!clienteId) return;
  db.prepare('DELETE FROM cliente_facturacion WHERE cliente_id = ?').run(clienteId);
  db.prepare('DELETE FROM receptor WHERE cliente_id = ?').run(clienteId);
  db.prepare('DELETE FROM cliente_coordinador WHERE cliente_id = ?').run(clienteId);
  db.prepare('DELETE FROM cliente_producto WHERE cliente_id = ?').run(clienteId);
  db.prepare('DELETE FROM cp WHERE cliente_id = ?').run(clienteId);
  db.prepare('DELETE FROM proyeccion_facturacion WHERE cliente_id = ?').run(clienteId);
  db.prepare('DELETE FROM solicitud_programada WHERE cliente_id = ?').run(clienteId);
  db.prepare('DELETE FROM cliente WHERE id = ?').run(clienteId);
}

module.exports = function migration(db) {
  const enaex = findCliente(db, 'ENAEX');
  const enaexServicios = findCliente(db, 'ENAEX SERVICIOS SA');

  if (enaex && enaexServicios) {
    const existing = db.prepare(`
      SELECT id
      FROM cliente_facturacion
      WHERE cliente_id = ?
        AND rut = ?
      LIMIT 1
    `).get(enaex.id, enaexServicios.rut);

    if (!existing) {
      db.prepare(`
        INSERT INTO cliente_facturacion
          (id, cliente_id, etiqueta, razon_social, rut, giro, direccion, activo)
        VALUES (?, ?, ?, ?, ?, ?, ?, 1)
      `).run(
        uuidv4(),
        enaex.id,
        'Datos cliente 2',
        enaexServicios.razon_social || enaexServicios.nombre_corto,
        enaexServicios.rut,
        enaexServicios.giro,
        enaexServicios.direccion
      );
    }

    mergeClienteReferences(db, enaexServicios.id, enaex.id);
    deleteCliente(db, enaexServicios.id);
  }

  const sigdo = findCliente(db, 'SIGDO KOPPERS');
  if (sigdo) deleteCliente(db, sigdo.id);
};
