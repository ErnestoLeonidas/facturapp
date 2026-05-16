const fs = require('fs');
const path = require('path');

const MIGRATIONS_DIR = path.join(__dirname, '..', 'migrations');

function checksum(content) {
  let hash = 0;
  for (let i = 0; i < content.length; i += 1) {
    hash = ((hash << 5) - hash + content.charCodeAt(i)) | 0;
  }
  return String(hash >>> 0);
}

function ensureMigrationsTable(db) {
  db.exec(`
CREATE TABLE IF NOT EXISTS schema_migrations (
  version TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  checksum TEXT,
  applied_at TEXT DEFAULT (datetime('now'))
);
`);
}

function listMigrationFiles(migrationsDir = MIGRATIONS_DIR) {
  if (!fs.existsSync(migrationsDir)) return [];
  return fs.readdirSync(migrationsDir)
    .filter(file => /^\d+_.+\.(sql|js)$/.test(file))
    .sort();
}

function applyMigration(db, fullPath, file) {
  if (file.endsWith('.sql')) {
    db.exec(fs.readFileSync(fullPath, 'utf8'));
    return;
  }

  delete require.cache[require.resolve(fullPath)];
  const migration = require(fullPath);
  if (typeof migration !== 'function') {
    throw new Error('La migracion JS debe exportar una funcion');
  }
  migration(db);
}

function runMigrations(db, options = {}) {
  const migrationsDir = options.migrationsDir || MIGRATIONS_DIR;
  const log = options.log || (() => {});
  ensureMigrationsTable(db);

  const files = listMigrationFiles(migrationsDir);
  let applied = 0;

  files.forEach(file => {
    const version = file.split('_')[0];
    const existing = db.prepare('SELECT version, checksum FROM schema_migrations WHERE version = ?').get(version);
    if (existing) return;

    const fullPath = path.join(migrationsDir, file);
    const content = fs.readFileSync(fullPath, 'utf8');
    db.exec('BEGIN');
    try {
      applyMigration(db, fullPath, file);
      db.prepare('INSERT INTO schema_migrations (version, name, checksum) VALUES (?, ?, ?)')
        .run(version, file, checksum(content));
      db.exec('COMMIT');
      applied += 1;
      log(`Aplicada migracion ${file}`);
    } catch (e) {
      db.exec('ROLLBACK');
      e.message = `Error aplicando migracion ${file}: ${e.message}`;
      throw e;
    }
  });

  return { applied, total: files.length };
}

module.exports = {
  MIGRATIONS_DIR,
  checksum,
  ensureMigrationsTable,
  listMigrationFiles,
  runMigrations
};
