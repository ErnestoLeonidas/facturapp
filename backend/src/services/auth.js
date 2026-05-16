const crypto = require('crypto');
const db = require('../db');

const ITERATIONS = 120000;

function hashPassword(password, salt) {
  return crypto.pbkdf2Sync(String(password || ''), salt, ITERATIONS, 32, 'sha256').toString('hex');
}

function publicUser(user) {
  if (!user) return null;
  return {
    id: user.id,
    nombre: user.nombre,
    email: user.email,
    rol: user.rol
  };
}

function verifyPassword(user, password) {
  if (!user || !password) return false;
  const attempted = hashPassword(password, user.password_salt);
  return crypto.timingSafeEqual(Buffer.from(attempted, 'hex'), Buffer.from(user.password_hash, 'hex'));
}

function createSession(userId) {
  const token = crypto.randomBytes(32).toString('hex');
  db.prepare(`
    INSERT INTO app_session (token, user_id, expires_at)
    VALUES (?, ?, datetime('now', '+12 hours'))
  `).run(token, userId);
  return token;
}

function authenticate(email, password) {
  const user = db.prepare('SELECT * FROM app_user WHERE lower(email) = lower(?) AND activo = 1').get(email);
  if (!verifyPassword(user, password)) return null;
  const token = createSession(user.id);
  return { token, user: publicUser(user) };
}

function userFromToken(token) {
  if (!token) return null;
  const row = db.prepare(`
    SELECT u.*
    FROM app_session s
    JOIN app_user u ON u.id = s.user_id
    WHERE s.token = ?
      AND s.revoked_at IS NULL
      AND u.activo = 1
      AND (s.expires_at IS NULL OR s.expires_at > datetime('now'))
  `).get(token);
  return row || null;
}

function tokenFromReq(req) {
  const header = req.get('authorization') || '';
  const bearer = header.match(/^Bearer\s+(.+)$/i);
  return bearer ? bearer[1] : req.get('x-auth-token');
}

function attachUser(req, res, next) {
  req.user = userFromToken(tokenFromReq(req));
  next();
}

function requireAuth(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ ok: false, error: { code: 'AUTH_REQUIRED', message: 'Debes iniciar sesion' } });
  }
  next();
}

function requireRole(role) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ ok: false, error: { code: 'AUTH_REQUIRED', message: 'Debes iniciar sesion' } });
    }
    if (req.user.rol !== role) {
      return res.status(403).json({ ok: false, error: { code: 'FORBIDDEN', message: 'No tienes permisos para esta accion' } });
    }
    next();
  };
}

function logout(token) {
  if (!token) return;
  db.prepare("UPDATE app_session SET revoked_at = datetime('now') WHERE token = ?").run(token);
}

module.exports = {
  attachUser,
  authenticate,
  logout,
  publicUser,
  requireAuth,
  requireRole,
  tokenFromReq,
  userFromToken
};
