const crypto = require('crypto');
const db = require('../db-async');

const ITERATIONS = 120000;

function hashPassword(password, salt) {
  return crypto.pbkdf2Sync(String(password || ''), salt, ITERATIONS, 32, 'sha256').toString('hex');
}

async function publicUser(user) {
  if (!user) return null;
  const coordinador = user.coordinador_id
    ? await db.get('SELECT id, nombre FROM coordinador WHERE id = ?', [user.coordinador_id])
    : null;
  return {
    id: user.id,
    nombre: user.nombre,
    username: user.username || user.email,
    email: user.email,
    rol: user.rol,
    coordinador_id: user.coordinador_id || null,
    coordinador_nombre: coordinador ? coordinador.nombre : null
  };
}

function verifyPassword(user, password) {
  if (!user || !password) return false;
  const attempted = hashPassword(password, user.password_salt);
  return crypto.timingSafeEqual(Buffer.from(attempted, 'hex'), Buffer.from(user.password_hash, 'hex'));
}

async function createSession(userId) {
  const token = crypto.randomBytes(32).toString('hex');
  await db.run(`
    INSERT INTO app_session (token, user_id, expires_at)
    VALUES (?, ?, ?)
  `, [token, userId, db.addHoursText(12)]);
  return token;
}

async function authenticate(identifier, password) {
  const user = await db.get(`
    SELECT *
    FROM app_user
    WHERE activo = 1
      AND (
        lower(COALESCE(username, email)) = lower(?)
        OR lower(email) = lower(?)
      )
    LIMIT 1
  `, [identifier, identifier]);
  if (!verifyPassword(user, password)) return null;
  const token = await createSession(user.id);
  return { token, user: await publicUser(user) };
}

async function userFromToken(token) {
  if (!token) return null;
  const row = await db.get(`
    SELECT u.*
    FROM app_session s
    JOIN app_user u ON u.id = s.user_id
    WHERE s.token = ?
      AND s.revoked_at IS NULL
      AND u.activo = 1
      AND (s.expires_at IS NULL OR s.expires_at > ?)
  `, [token, db.nowText()]);
  return row || null;
}

function tokenFromReq(req) {
  const header = req.get('authorization') || '';
  const bearer = header.match(/^Bearer\s+(.+)$/i);
  return bearer ? bearer[1] : req.get('x-auth-token');
}

async function attachUser(req, res, next) {
  try {
    req.user = await userFromToken(tokenFromReq(req));
    next();
  } catch (error) {
    next(error);
  }
}

function requireAuth(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ ok: false, error: { code: 'AUTH_REQUIRED', message: 'Debes iniciar sesión' } });
  }
  next();
}

function requireRole(role) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ ok: false, error: { code: 'AUTH_REQUIRED', message: 'Debes iniciar sesión' } });
    }
    if (req.user.rol !== role) {
      return res.status(403).json({ ok: false, error: { code: 'FORBIDDEN', message: 'No tienes permisos para esta accion' } });
    }
    next();
  };
}

async function logout(token) {
  if (!token) return;
  await db.run('UPDATE app_session SET revoked_at = ? WHERE token = ?', [db.nowText(), token]);
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
