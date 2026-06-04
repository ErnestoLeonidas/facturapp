const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

const BACKEND_ROOT = path.join(__dirname, '..', '..');
const REPO_ROOT = path.join(BACKEND_ROOT, '..');

function loadEnv() {
  const candidates = [
    process.env.ENV_FILE,
    path.join(process.cwd(), '.env'),
    path.join(BACKEND_ROOT, '.env'),
    path.join(REPO_ROOT, '.env')
  ].filter(Boolean);

  const loaded = new Set();
  candidates.forEach(file => {
    const resolved = path.resolve(file);
    if (loaded.has(resolved) || !fs.existsSync(resolved)) return;
    dotenv.config({ path: resolved, override: false });
    loaded.add(resolved);
  });
}

function resolveFromBackend(value, fallback) {
  const raw = value || fallback;
  return path.isAbsolute(raw) ? raw : path.join(BACKEND_ROOT, raw);
}

function sqlitePath() {
  return resolveFromBackend(
    process.env.SQLITE_PATH || process.env.DB_PATH,
    path.join('storage', 'facturapp.sqlite')
  );
}

function backupDir() {
  return resolveFromBackend(process.env.DB_BACKUP_DIR, 'backups');
}

function requireProductionEnv() {
  if (process.env.NODE_ENV !== 'production') return;
  const missing = [];
  if (!process.env.SESSION_SECRET || process.env.SESSION_SECRET === 'change-me') missing.push('SESSION_SECRET');
  if (!process.env.DATABASE_URL && !process.env.SQLITE_PATH && !process.env.DB_PATH) missing.push('DATABASE_URL o SQLITE_PATH');
  if (missing.length) {
    throw new Error(`Variables obligatorias faltantes para produccion: ${missing.join(', ')}`);
  }
}

function safeUrl(value) {
  if (!value) return '';
  try {
    const url = new URL(value);
    if (url.password) url.password = '***';
    return url.toString();
  } catch (_) {
    return '[configurada]';
  }
}

loadEnv();

module.exports = {
  BACKEND_ROOT,
  REPO_ROOT,
  backupDir,
  loadEnv,
  requireProductionEnv,
  safeUrl,
  sqlitePath
};
