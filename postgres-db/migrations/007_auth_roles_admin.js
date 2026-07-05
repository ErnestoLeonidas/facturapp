const { v4: uuidv4 } = require('uuid');

function addColumn(db, table, column, definition) {
  const columns = db.prepare(`PRAGMA table_info('${table}')`).all().map(col => col.name);
  if (!columns.includes(column)) db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
}

module.exports = function migration(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS app_user (
      id TEXT PRIMARY KEY,
      nombre TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      rol TEXT NOT NULL CHECK (rol IN ('admin', 'usuario')),
      password_hash TEXT NOT NULL,
      password_salt TEXT NOT NULL,
      activo INTEGER NOT NULL DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS app_session (
      token TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES app_user(id),
      created_at TEXT DEFAULT (datetime('now')),
      expires_at TEXT,
      revoked_at TEXT
    );

    CREATE TABLE IF NOT EXISTS audit_log (
      id TEXT PRIMARY KEY,
      usuario_id TEXT,
      usuario_email TEXT,
      accion TEXT NOT NULL,
      entidad TEXT NOT NULL,
      entidad_id TEXT,
      detalle TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_app_session_user ON app_session(user_id, revoked_at);
    CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_log(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_audit_entidad ON audit_log(entidad, entidad_id);
  `);

  addColumn(db, 'solicitud_factura', 'admin_batch_id', 'TEXT');
  addColumn(db, 'solicitud_factura', 'origen_admin', 'TEXT');

  if (process.env.NODE_ENV === 'production') return;

  const upsertUser = db.prepare(`
    INSERT INTO app_user (id, nombre, email, rol, password_hash, password_salt, activo)
    VALUES (?, ?, ?, ?, ?, ?, 1)
    ON CONFLICT(email) DO UPDATE SET
      nombre = excluded.nombre,
      rol = excluded.rol,
      password_hash = excluded.password_hash,
      password_salt = excluded.password_salt,
      activo = 1,
      updated_at = datetime('now')
  `);

  upsertUser.run(
    uuidv4(),
    'Admin FacturApp',
    'admin@facturapp.local',
    'admin',
    '4a0f3b2bab45d295daf47421731b75caad0b27ba2e7be9d2cebfefd14b3ca9ed',
    'facturapp-admin-2026'
  );
  upsertUser.run(
    uuidv4(),
    'Usuario FacturApp',
    'usuario@facturapp.local',
    'usuario',
    '812fe007556e92e4a5bb809a22e3cd490d8e2f0241226a66e867e65b4455466a',
    'facturapp-user-2026'
  );
};
