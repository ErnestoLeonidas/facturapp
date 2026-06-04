const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

function checksum(content) {
  let hash = 0;
  for (let i = 0; i < content.length; i += 1) {
    hash = ((hash << 5) - hash + content.charCodeAt(i)) | 0;
  }
  return String(hash >>> 0);
}

function syncHistoricalMigrationChecksums(db) {
  const canonicalVersions = ['005'];
  canonicalVersions.forEach(version => {
    const file = path.join(__dirname, `${version}_operational_catalogs.js`);
    if (!fs.existsSync(file)) return;
    db.prepare('UPDATE schema_migrations SET checksum = ? WHERE version = ?')
      .run(checksum(fs.readFileSync(file, 'utf8')), version);
  });
}

function tableHasColumn(db, table, column) {
  return db.prepare(`PRAGMA table_info('${table}')`).all().some(col => col.name === column);
}

function deactivateDuplicateReceptors(db) {
  const duplicates = db.prepare(`
    SELECT cliente_id, lower(trim(email)) AS email_key
    FROM receptor
    WHERE activo = 1
    GROUP BY cliente_id, lower(trim(email))
    HAVING COUNT(*) > 1
  `).all();

  duplicates.forEach(group => {
    const rows = db.prepare(`
      SELECT id
      FROM receptor
      WHERE cliente_id = ?
        AND lower(trim(email)) = ?
        AND activo = 1
      ORDER BY created_at, id
    `).all(group.cliente_id, group.email_key);
    const keep = rows[0] && rows[0].id;
    rows.slice(1).forEach(row => {
      db.prepare(`
        INSERT OR IGNORE INTO solicitud_receptor (solicitud_id, receptor_id)
        SELECT solicitud_id, ?
        FROM solicitud_receptor
        WHERE receptor_id = ?
      `).run(keep, row.id);
      db.prepare('DELETE FROM solicitud_receptor WHERE receptor_id = ?').run(row.id);
      db.prepare('UPDATE receptor SET activo = 0 WHERE id = ?').run(row.id);
    });
  });
}

function normalizeRequestsWithoutReceptors(db) {
  const rows = db.prepare(`
    SELECT id, folio, cliente_id, estado
    FROM solicitud_factura
    WHERE is_delete = 0
      AND NOT EXISTS (
        SELECT 1 FROM solicitud_receptor sr WHERE sr.solicitud_id = solicitud_factura.id
      )
  `).all();

  rows.forEach(row => {
    const receptors = db.prepare('SELECT id FROM receptor WHERE cliente_id = ? AND activo = 1 ORDER BY nombre, id').all(row.cliente_id);
    if (receptors.length) {
      receptors.forEach(rec => {
        db.prepare('INSERT OR IGNORE INTO solicitud_receptor (solicitud_id, receptor_id) VALUES (?, ?)').run(row.id, rec.id);
      });
      db.prepare(`
        INSERT INTO historial_estado (id, solicitud_id, estado_desde, estado_hacia, usuario, comentario)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(uuidv4(), row.id, row.estado, row.estado, 'migration-022', 'Receptores activos del cliente asociados por normalizacion de BD');
      return;
    }

    db.prepare(`
      UPDATE solicitud_factura
      SET is_delete = 1,
          updated_at = datetime('now'),
          observaciones = trim(COALESCE(observaciones, '') || char(10) || ?)
      WHERE id = ?
    `).run('Inactivada por normalizacion de BD: cliente sin receptores activos.', row.id);
    db.prepare(`
      INSERT INTO historial_estado (id, solicitud_id, estado_desde, estado_hacia, usuario, comentario)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(uuidv4(), row.id, row.estado, row.estado, 'migration-022', 'Solicitud inactivada: no tenia receptores y el cliente no tiene receptores activos');
  });
}

function seedMissingProjectedUf(db) {
  const missing = db.prepare(`
    WITH months(m) AS (VALUES (1),(2),(3),(4),(5),(6),(7),(8),(9),(10),(11),(12))
    SELECT m AS mes
    FROM months
    WHERE NOT EXISTS (
      SELECT 1
      FROM proyeccion_uf
      WHERE anio = 2026
        AND mes = m
        AND (uf_manual IS NOT NULL OR uf_proyectada IS NOT NULL OR uf_fija IS NOT NULL)
    )
  `).all();

  missing.forEach(row => {
    const fallback = db.prepare(`
      SELECT COALESCE(uf_manual, uf_proyectada, uf_fija) AS uf
      FROM proyeccion_uf
      WHERE anio = 2026
        AND COALESCE(uf_manual, uf_proyectada, uf_fija) IS NOT NULL
      ORDER BY ABS(mes - ?), CASE WHEN mes <= ? THEN 0 ELSE 1 END, mes DESC
      LIMIT 1
    `).get(row.mes, row.mes);
    if (!fallback || !fallback.uf) return;
    db.prepare(`
      INSERT INTO proyeccion_uf (id, anio, mes, uf_proyectada, origen_valor, observaciones)
      VALUES (?, 2026, ?, ?, 'PROYECTADA', ?)
    `).run(uuidv4(), row.mes, Math.round(Number(fallback.uf)), 'Completada por normalizacion de BD usando UF proyectada cercana.');
  });
}

function deactivateEmptyProjectionVersions(db) {
  db.prepare(`
    UPDATE proyeccion_version
    SET activa = 0
    WHERE activa = 1
      AND NOT EXISTS (
        SELECT 1 FROM proyeccion_item pi WHERE pi.version_id = proyeccion_version.id
      )
  `).run();
}

function closeExpiredSessions(db) {
  db.prepare(`
    UPDATE app_session
    SET revoked_at = datetime('now')
    WHERE revoked_at IS NULL
      AND expires_at IS NOT NULL
      AND expires_at <= datetime('now')
  `).run();
}

function createIndexesAndTriggers(db) {
  db.exec(`
    CREATE UNIQUE INDEX IF NOT EXISTS uq_receptor_cliente_email_activo
      ON receptor(cliente_id, lower(trim(email)))
      WHERE activo = 1;

    CREATE UNIQUE INDEX IF NOT EXISTS uq_proyeccion_uf_anio_mes
      ON proyeccion_uf(anio, mes);

    CREATE UNIQUE INDEX IF NOT EXISTS uq_proyeccion_version_activa_anio
      ON proyeccion_version(anio)
      WHERE activa = 1;

    CREATE INDEX IF NOT EXISTS idx_sol_cliente_facturacion
      ON solicitud_factura(cliente_facturacion_id);

    CREATE INDEX IF NOT EXISTS idx_sol_programada
      ON solicitud_factura(programada_id);

    DROP TRIGGER IF EXISTS trg_solicitud_receptor_cliente_insert;
    CREATE TRIGGER trg_solicitud_receptor_cliente_insert
    BEFORE INSERT ON solicitud_receptor
    FOR EACH ROW
    WHEN (
      SELECT r.cliente_id
      FROM receptor r
      WHERE r.id = NEW.receptor_id
    ) <> (
      SELECT sf.cliente_id
      FROM solicitud_factura sf
      WHERE sf.id = NEW.solicitud_id
    )
    BEGIN
      SELECT RAISE(ABORT, 'Receptor no pertenece al cliente de la solicitud');
    END;

    DROP TRIGGER IF EXISTS trg_solicitud_receptor_cliente_update;
    CREATE TRIGGER trg_solicitud_receptor_cliente_update
    BEFORE UPDATE ON solicitud_receptor
    FOR EACH ROW
    WHEN (
      SELECT r.cliente_id
      FROM receptor r
      WHERE r.id = NEW.receptor_id
    ) <> (
      SELECT sf.cliente_id
      FROM solicitud_factura sf
      WHERE sf.id = NEW.solicitud_id
    )
    BEGIN
      SELECT RAISE(ABORT, 'Receptor no pertenece al cliente de la solicitud');
    END;

    DROP TRIGGER IF EXISTS trg_solicitud_cp_cliente_insert;
    CREATE TRIGGER trg_solicitud_cp_cliente_insert
    BEFORE INSERT ON solicitud_cp
    FOR EACH ROW
    WHEN (
      SELECT cp.cliente_id
      FROM cp
      WHERE cp.id = NEW.cp_id
    ) <> (
      SELECT sf.cliente_id
      FROM solicitud_factura sf
      WHERE sf.id = NEW.solicitud_id
    )
    BEGIN
      SELECT RAISE(ABORT, 'CP no pertenece al cliente de la solicitud');
    END;

    DROP TRIGGER IF EXISTS trg_solicitud_cp_cliente_update;
    CREATE TRIGGER trg_solicitud_cp_cliente_update
    BEFORE UPDATE ON solicitud_cp
    FOR EACH ROW
    WHEN (
      SELECT cp.cliente_id
      FROM cp
      WHERE cp.id = NEW.cp_id
    ) <> (
      SELECT sf.cliente_id
      FROM solicitud_factura sf
      WHERE sf.id = NEW.solicitud_id
    )
    BEGIN
      SELECT RAISE(ABORT, 'CP no pertenece al cliente de la solicitud');
    END;

    DROP TRIGGER IF EXISTS trg_solicitud_cliente_facturacion_insert;
    CREATE TRIGGER trg_solicitud_cliente_facturacion_insert
    BEFORE INSERT ON solicitud_factura
    FOR EACH ROW
    WHEN NEW.cliente_facturacion_id IS NOT NULL
      AND NOT EXISTS (
        SELECT 1
        FROM cliente_facturacion cf
        WHERE cf.id = NEW.cliente_facturacion_id
          AND cf.cliente_id = NEW.cliente_id
          AND cf.activo = 1
      )
    BEGIN
      SELECT RAISE(ABORT, 'Datos de facturacion no pertenecen al cliente de la solicitud');
    END;

    DROP TRIGGER IF EXISTS trg_solicitud_cliente_facturacion_update;
    CREATE TRIGGER trg_solicitud_cliente_facturacion_update
    BEFORE UPDATE OF cliente_id, cliente_facturacion_id ON solicitud_factura
    FOR EACH ROW
    WHEN NEW.cliente_facturacion_id IS NOT NULL
      AND NOT EXISTS (
        SELECT 1
        FROM cliente_facturacion cf
        WHERE cf.id = NEW.cliente_facturacion_id
          AND cf.cliente_id = NEW.cliente_id
          AND cf.activo = 1
      )
    BEGIN
      SELECT RAISE(ABORT, 'Datos de facturacion no pertenecen al cliente de la solicitud');
    END;

    DROP TRIGGER IF EXISTS trg_solicitud_programada_cliente_insert;
    CREATE TRIGGER trg_solicitud_programada_cliente_insert
    BEFORE INSERT ON solicitud_factura
    FOR EACH ROW
    WHEN NEW.programada_id IS NOT NULL
      AND NOT EXISTS (
        SELECT 1
        FROM solicitud_programada sp
        WHERE sp.id = NEW.programada_id
          AND sp.cliente_id = NEW.cliente_id
      )
    BEGIN
      SELECT RAISE(ABORT, 'Solicitud programada no pertenece al cliente de la solicitud');
    END;

    DROP TRIGGER IF EXISTS trg_solicitud_programada_cliente_update;
    CREATE TRIGGER trg_solicitud_programada_cliente_update
    BEFORE UPDATE OF cliente_id, programada_id ON solicitud_factura
    FOR EACH ROW
    WHEN NEW.programada_id IS NOT NULL
      AND NOT EXISTS (
        SELECT 1
        FROM solicitud_programada sp
        WHERE sp.id = NEW.programada_id
          AND sp.cliente_id = NEW.cliente_id
      )
    BEGIN
      SELECT RAISE(ABORT, 'Solicitud programada no pertenece al cliente de la solicitud');
    END;
  `);

  if (tableHasColumn(db, 'app_user', 'coordinador_id')) {
    db.exec('CREATE INDEX IF NOT EXISTS idx_app_user_coordinador ON app_user(coordinador_id);');
  }
}

module.exports = function migration(db) {
  syncHistoricalMigrationChecksums(db);
  closeExpiredSessions(db);
  deactivateDuplicateReceptors(db);
  normalizeRequestsWithoutReceptors(db);
  seedMissingProjectedUf(db);
  deactivateEmptyProjectionVersions(db);
  createIndexesAndTriggers(db);
};
