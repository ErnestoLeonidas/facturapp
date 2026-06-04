const { DatabaseSync } = require('node:sqlite');
const path = require('path');
const fs = require('fs');
const { runMigrations } = require('./migrations');
const env = require('./config/env');

if (process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL esta configurado, pero el runtime PostgreSQL aun no esta habilitado. Mantener SQLite sin DATABASE_URL o completar la fase de adaptacion DB asincrona.');
}

const DB_PATH = env.sqlitePath();
const storageDir = path.dirname(DB_PATH);
if (!fs.existsSync(storageDir)) fs.mkdirSync(storageDir, { recursive: true });

const db = new DatabaseSync(DB_PATH);
db.exec("PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON;");

runMigrations(db);

const clienteCoordColumns = db.prepare("PRAGMA table_info('cliente_coordinador')").all().map(col => col.name);
if (!clienteCoordColumns.includes('cp_nombre')) {
  db.exec("ALTER TABLE cliente_coordinador ADD COLUMN cp_nombre TEXT;");
}
db.exec("CREATE INDEX IF NOT EXISTS idx_cliente_coord_cp_nombre ON cliente_coordinador(cliente_id, cp_nombre, activo);");

// Helper: wrap a function in BEGIN/COMMIT/ROLLBACK
db.transaction = function(fn) {
  return function(...args) {
    db.exec('BEGIN');
    try {
      const result = fn(...args);
      db.exec('COMMIT');
      return result;
    } catch(e) {
      db.exec('ROLLBACK');
      throw e;
    }
  };
};

module.exports = db;
