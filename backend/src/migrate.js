require('dotenv').config();
const { DatabaseSync } = require('node:sqlite');
const path = require('path');
const fs = require('fs');
const { runMigrations } = require('./migrations');
const { backupDatabase } = require('./db-backup');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '..', 'storage', 'facturapp.sqlite');
const storageDir = path.dirname(DB_PATH);
if (!fs.existsSync(storageDir)) fs.mkdirSync(storageDir, { recursive: true });

const db = new DatabaseSync(DB_PATH);
db.exec("PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON;");

try {
  const backup = backupDatabase('pre-migrate');
  if (!backup.skipped) console.log(`Backup previo: ${backup.db}`);
  else console.log(`Backup previo omitido: ${backup.reason}`);

  const result = runMigrations(db, { log: message => console.log(message) });
  if (result.applied === 0) {
    console.log(`Sin migraciones pendientes. Base: ${DB_PATH}`);
  } else {
    console.log(`Migraciones aplicadas: ${result.applied}. Base: ${DB_PATH}`);
  }
} catch (e) {
  console.error(e.message || e);
  process.exitCode = 1;
}
