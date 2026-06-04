const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');

const ITERATIONS = 120000;

function hashPassword(password, salt) {
  return crypto.pbkdf2Sync(String(password || ''), salt, ITERATIONS, 32, 'sha256').toString('hex');
}

module.exports = function migration(db) {
  if (process.env.NODE_ENV === 'production') return;

  const username = 'usuario';
  const password = 'usuario2026';
  const salt = `facturapp-${username}-2026`;
  const passwordHash = hashPassword(password, salt);
  const existing = db.prepare(`
    SELECT id
    FROM app_user
    WHERE lower(COALESCE(username, email)) = lower(?)
       OR lower(email) = lower(?)
    LIMIT 1
  `).get(username, username);

  if (existing) {
    db.prepare(`
      UPDATE app_user
      SET nombre = ?,
          username = ?,
          email = ?,
          rol = 'usuario',
          password_hash = ?,
          password_salt = ?,
          activo = 1,
          updated_at = datetime('now')
      WHERE id = ?
    `).run('Usuario General', username, username, passwordHash, salt, existing.id);
    return;
  }

  db.prepare(`
    INSERT INTO app_user (id, nombre, username, email, rol, password_hash, password_salt, activo)
    VALUES (?, ?, ?, ?, 'usuario', ?, ?, 1)
  `).run(uuidv4(), 'Usuario General', username, username, passwordHash, salt);
};
