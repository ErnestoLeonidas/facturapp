const fs = require('fs');
const path = require('path');
const env = require('./config/env');

const DB_PATH = env.sqlitePath();
const BACKUP_DIR = env.backupDir();

function timestamp() {
  const d = new Date();
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, '0'),
    String(d.getDate()).padStart(2, '0'),
    String(d.getHours()).padStart(2, '0'),
    String(d.getMinutes()).padStart(2, '0'),
    String(d.getSeconds()).padStart(2, '0')
  ].join('');
}

function copyIfExists(source, target) {
  if (!fs.existsSync(source)) return false;
  fs.copyFileSync(source, target);
  return true;
}

function backupDatabase(label = 'manual') {
  if (!fs.existsSync(DB_PATH)) {
    return { skipped: true, reason: `No existe la base ${DB_PATH}` };
  }

  fs.mkdirSync(BACKUP_DIR, { recursive: true });
  const ext = path.extname(DB_PATH) || '.sqlite';
  const base = `${timestamp()}-${label}`;
  const dbTarget = path.join(BACKUP_DIR, `${base}${ext}`);
  const walTarget = path.join(BACKUP_DIR, `${base}${ext}-wal`);
  const shmTarget = path.join(BACKUP_DIR, `${base}${ext}-shm`);

  copyIfExists(DB_PATH, dbTarget);
  const walCopied = copyIfExists(`${DB_PATH}-wal`, walTarget);
  const shmCopied = copyIfExists(`${DB_PATH}-shm`, shmTarget);

  return {
    skipped: false,
    db: dbTarget,
    wal: walCopied ? walTarget : null,
    shm: shmCopied ? shmTarget : null
  };
}

if (require.main === module) {
  const label = process.argv[2] || 'manual';
  const result = backupDatabase(label);
  if (result.skipped) {
    console.log(`Backup omitido: ${result.reason}`);
  } else {
    console.log(`Backup creado: ${result.db}`);
    if (result.wal) console.log(`WAL copiado: ${result.wal}`);
    if (result.shm) console.log(`SHM copiado: ${result.shm}`);
  }
}

module.exports = { backupDatabase };
