const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');

const ITERATIONS = 120000;

function hashPassword(password, salt) {
  return crypto.pbkdf2Sync(String(password || ''), salt, ITERATIONS, 32, 'sha256').toString('hex');
}

function hasColumn(db, table, column) {
  return db.prepare(`PRAGMA table_info('${table}')`).all().some(col => col.name === column);
}

function ensureUser(db, { nombre, username, password, rol }) {
  const normalized = username.toLowerCase();
  const salt = `facturapp-${normalized}-2026`;
  const passwordHash = hashPassword(password, salt);
  const existing = db.prepare(`
    SELECT id
    FROM app_user
    WHERE lower(COALESCE(username, email)) = lower(?)
       OR lower(email) = lower(?)
    LIMIT 1
  `).get(normalized, normalized);

  if (existing) {
    db.prepare(`
      UPDATE app_user
      SET nombre = ?,
          username = ?,
          email = ?,
          rol = ?,
          password_hash = ?,
          password_salt = ?,
          activo = 1,
          updated_at = datetime('now')
      WHERE id = ?
    `).run(nombre, normalized, normalized, rol, passwordHash, salt, existing.id);
    return;
  }

  db.prepare(`
    INSERT INTO app_user (id, nombre, username, email, rol, password_hash, password_salt, activo)
    VALUES (?, ?, ?, ?, ?, ?, ?, 1)
  `).run(uuidv4(), nombre, normalized, normalized, rol, passwordHash, salt);
}

module.exports = function migration(db) {
  if (!hasColumn(db, 'app_user', 'username')) {
    db.exec('ALTER TABLE app_user ADD COLUMN username TEXT;');
  }

  db.exec(`
    UPDATE app_user
    SET username = lower(
      CASE
        WHEN instr(email, '@') > 0 THEN substr(email, 1, instr(email, '@') - 1)
        ELSE email
      END
    )
    WHERE username IS NULL OR username = '';

    CREATE UNIQUE INDEX IF NOT EXISTS idx_app_user_username_unique
      ON app_user(lower(username))
      WHERE username IS NOT NULL AND username <> '';
  `);

  ensureUser(db, {
    nombre: 'Administrador Valgian',
    username: 'valgian',
    password: 'valgian2026',
    rol: 'admin'
  });

  ensureUser(db, {
    nombre: 'Constanza Gaete',
    username: 'cgaete',
    password: 'cgaete2026',
    rol: 'admin'
  });

  db.prepare(`
    UPDATE app_user
    SET activo = 0,
        updated_at = datetime('now')
    WHERE lower(email) IN ('admin@facturapp.local', 'usuario@facturapp.local')
  `).run();
};
