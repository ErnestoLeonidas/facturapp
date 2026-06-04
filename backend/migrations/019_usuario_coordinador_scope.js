function hasColumn(db, table, column) {
  return db.prepare(`PRAGMA table_info('${table}')`).all().some(col => col.name === column);
}

function setUserCoordinator(db, username, coordinatorName) {
  const coordinator = db.prepare(`
    SELECT id
    FROM coordinador
    WHERE lower(nombre) = lower(?)
    LIMIT 1
  `).get(coordinatorName);
  if (!coordinator) return;

  db.prepare(`
    UPDATE app_user
    SET coordinador_id = ?,
        updated_at = datetime('now')
    WHERE lower(COALESCE(username, email)) = lower(?)
       OR lower(email) = lower(?)
  `).run(coordinator.id, username, username);
}

function coordinatorForRequest(db, solicitudId, clienteId) {
  const cps = db.prepare(`
    SELECT DISTINCT cp.nombre
    FROM solicitud_cp sc
    JOIN cp ON cp.id = sc.cp_id
    WHERE sc.solicitud_id = ?
    ORDER BY sc.orden, cp.nombre
  `).all(solicitudId);

  for (const cp of cps) {
    const exact = db.prepare(`
      SELECT cc.coordinador_id
      FROM cliente_coordinador cc
      JOIN coordinador co ON co.id = cc.coordinador_id
      WHERE cc.cliente_id = ?
        AND cc.cp_nombre = ?
        AND cc.activo = 1
        AND co.activo = 1
      ORDER BY lower(co.nombre)
      LIMIT 1
    `).get(clienteId, cp.nombre || '');
    if (exact) return exact.coordinador_id;
  }

  const fallback = db.prepare(`
    SELECT cc.coordinador_id
    FROM cliente_coordinador cc
    JOIN coordinador co ON co.id = cc.coordinador_id
    WHERE cc.cliente_id = ?
      AND (cc.cp_nombre IS NULL OR cc.cp_nombre = '')
      AND cc.activo = 1
      AND co.activo = 1
    ORDER BY lower(co.nombre)
    LIMIT 1
  `).get(clienteId);

  return fallback ? fallback.coordinador_id : null;
}

module.exports = function migration(db) {
  if (!hasColumn(db, 'app_user', 'coordinador_id')) {
    db.exec('ALTER TABLE app_user ADD COLUMN coordinador_id TEXT REFERENCES coordinador(id);');
  }

  [
    ['cgaete', 'CONSTANZA GAETE'],
    ['dllanes', 'DANIEL LLANES'],
    ['mabasolo', 'MACARENA ABÁSOLO'],
    ['mdarocha', 'MONICA DA ROCHA'],
    ['masfinanzas', 'MAS FINANZAS']
  ].forEach(([username, coordinatorName]) => setUserCoordinator(db, username, coordinatorName));

  db.prepare(`
    SELECT id, cliente_id
    FROM solicitud_factura
    WHERE is_delete = 0
      AND coordinador_id IS NULL
  `).all().forEach(row => {
    const coordinatorId = coordinatorForRequest(db, row.id, row.cliente_id);
    if (coordinatorId) {
      db.prepare(`
        UPDATE solicitud_factura
        SET coordinador_id = ?,
            updated_at = datetime('now')
        WHERE id = ?
      `).run(coordinatorId, row.id);
    }
  });
};
