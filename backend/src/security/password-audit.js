const crypto = require('crypto');

const ITERATIONS = 120000;
const KNOWN_PASSWORDS = Object.freeze([
  'mas2026',
  'usuario2026',
  'cgaete2026',
  'valgian2026',
  'usuario',
  'admin',
  'admin123',
  '123456',
  '1234',
  'password',
  'qwerty',
  'factuflow',
  'change-me',
  'change-me-local-only'
]);

function clean(value) {
  if (value === undefined || value === null) return '';
  return String(value).trim();
}

function hashPassword(password, salt) {
  return crypto.pbkdf2Sync(String(password || ''), salt, ITERATIONS, 32, 'sha256').toString('hex');
}

function randomSalt(prefix = 'factuflow-password') {
  return `${prefix}-${crypto.randomBytes(16).toString('base64url')}`;
}

function passwordFields(password, salt = randomSalt()) {
  return {
    hash: hashPassword(password, salt),
    salt
  };
}

function generateTemporaryPassword() {
  return crypto.randomBytes(32).toString('base64url');
}

function isKnownPassword(password) {
  const normalized = clean(password).toLowerCase();
  return KNOWN_PASSWORDS.some(value => value.toLowerCase() === normalized);
}

function userHasKnownPassword(user) {
  if (!user || !user.password_hash || !user.password_salt) return false;
  return KNOWN_PASSWORDS.some(password => hashPassword(password, user.password_salt) === user.password_hash);
}

function userSummary(user) {
  return {
    id: user.id,
    username: user.username || user.email || '',
    email: user.email || '',
    nombre: user.nombre || '',
    rol: user.rol || ''
  };
}

function activeUsersWithKnownPasswords(rows) {
  return rows.filter(userHasKnownPassword).map(userSummary);
}

async function postgresActiveUsersWithKnownPasswords(client) {
  const result = await client.query(`
    SELECT id, nombre, username, email, rol, password_hash, password_salt
    FROM app_user
    WHERE activo = 1
  `);
  return activeUsersWithKnownPasswords(result.rows);
}

function sqliteActiveUsersWithKnownPasswords(db) {
  const rows = db.prepare(`
    SELECT id, nombre, username, email, rol, password_hash, password_salt
    FROM app_user
    WHERE activo = 1
  `).all();
  return activeUsersWithKnownPasswords(rows);
}

function validateStrongPassword(password, label = 'PASSWORD') {
  const value = clean(password);
  if (value.length < 16) {
    throw new Error(`${label} debe tener al menos 16 caracteres`);
  }
  if (isKnownPassword(value)) {
    throw new Error(`${label} no puede ser una password conocida de desarrollo`);
  }

  const categories = [
    /[a-z]/.test(value),
    /[A-Z]/.test(value),
    /[0-9]/.test(value),
    /[^A-Za-z0-9]/.test(value)
  ].filter(Boolean).length;
  if (categories < 3) {
    throw new Error(`${label} debe combinar al menos 3 tipos: minusculas, mayusculas, numeros o simbolos`);
  }
}

function validateBootstrapPassword(password) {
  validateStrongPassword(password, 'ADMIN_BOOTSTRAP_PASSWORD');
}

function validateInitialPassword(password, label = 'NEW_PASSWORD') {
  const value = clean(password);
  if (!value) {
    throw new Error(`${label} no puede estar vacia`);
  }
  if (value.length < 8) {
    throw new Error(`${label} debe tener al menos 8 caracteres`);
  }
  if (isKnownPassword(value)) {
    throw new Error(`${label} no puede ser una password conocida de desarrollo`);
  }
}

module.exports = {
  activeUsersWithKnownPasswords,
  generateTemporaryPassword,
  hashPassword,
  isKnownPassword,
  passwordFields,
  postgresActiveUsersWithKnownPasswords,
  sqliteActiveUsersWithKnownPasswords,
  userHasKnownPassword,
  userSummary,
  validateBootstrapPassword,
  validateInitialPassword,
  validateStrongPassword
};
