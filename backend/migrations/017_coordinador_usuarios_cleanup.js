const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');

const ITERATIONS = 120000;
const GENERIC_PASSWORD = 'mas2026';

function clean(value) {
  if (value === undefined || value === null) return '';
  return String(value).trim();
}

function key(value) {
  return clean(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '');
}

function hashPassword(password, salt) {
  return crypto.pbkdf2Sync(String(password || ''), salt, ITERATIONS, 32, 'sha256').toString('hex');
}

function hasColumn(db, table, column) {
  return db.prepare(`PRAGMA table_info('${table}')`).all().some(col => col.name === column);
}

function ensureUsernameColumn(db) {
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
}

function ensureUser(db, { nombre, username, rol }) {
  const normalized = key(username).replace(/_/g, '').slice(0, 40);
  const salt = `facturapp-${normalized}-mas2026`;
  const passwordHash = hashPassword(GENERIC_PASSWORD, salt);
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

function deleteCoordinator(db, coordinatorId) {
  db.prepare('UPDATE cliente SET coordinador_id = NULL WHERE coordinador_id = ?').run(coordinatorId);
  db.prepare('UPDATE solicitud_factura SET coordinador_id = NULL WHERE coordinador_id = ?').run(coordinatorId);
  db.prepare('DELETE FROM cliente_coordinador WHERE coordinador_id = ?').run(coordinatorId);
  db.prepare('DELETE FROM coordinador WHERE id = ?').run(coordinatorId);
}

function removeCoordinatorUsers(db) {
  const usernames = ['mquijada', 'maxquijada', 'dgarcia', 'danielagarcia'];
  const rows = db.prepare(`
    SELECT id
    FROM app_user
    WHERE lower(COALESCE(username, email)) IN (${usernames.map(() => '?').join(',')})
       OR lower(email) IN (${usernames.map(() => '?').join(',')})
  `).all(...usernames, ...usernames);

  rows.forEach(row => {
    db.prepare('DELETE FROM app_session WHERE user_id = ?').run(row.id);
    db.prepare('DELETE FROM app_user WHERE id = ?').run(row.id);
  });
}

module.exports = function migration(db) {
  ensureUsernameColumn(db);

  const removeNames = new Set(['max_quijada', 'daniela_garcia']);
  db.prepare('SELECT id, nombre FROM coordinador').all().forEach(row => {
    if (removeNames.has(key(row.nombre))) deleteCoordinator(db, row.id);
  });
  removeCoordinatorUsers(db);

  const users = new Map([
    ['constanza_gaete', { nombre: 'Constanza Gaete', username: 'cgaete', rol: 'admin' }],
    ['daniel_llanes', { nombre: 'Daniel Llanes', username: 'dllanes', rol: 'usuario' }],
    ['macarena_abasolo', { nombre: 'Macarena Abasolo', username: 'mabasolo', rol: 'usuario' }],
    ['monica_da_rocha', { nombre: 'Monica Da Rocha', username: 'mdarocha', rol: 'usuario' }],
    ['mas_finanzas', { nombre: 'MAS Finanzas', username: 'masfinanzas', rol: 'usuario' }]
  ]);

  db.prepare('SELECT nombre FROM coordinador WHERE activo = 1').all().forEach(row => {
    const mapped = users.get(key(row.nombre));
    if (mapped && process.env.NODE_ENV !== 'production') ensureUser(db, mapped);
  });

  if (process.env.NODE_ENV === 'production') return;

  ensureUser(db, users.get('constanza_gaete'));
  ensureUser(db, users.get('daniel_llanes'));
  ensureUser(db, users.get('macarena_abasolo'));
  ensureUser(db, users.get('monica_da_rocha'));
};
