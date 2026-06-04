const path = require('path');
const fs = require('fs');
const { runMigrations } = require('./migrations');
const { backupDatabase } = require('./db-backup');
const env = require('./config/env');
const { withPostgresClient } = require('./postgres');
const { runPostgresMigrations } = require('./postgres-migrations');

async function migratePostgres() {
  await withPostgresClient(async client => {
    const result = await runPostgresMigrations(client, { log: message => console.log(message) });
    if (result.applied === 0) {
      console.log(`Sin migraciones PostgreSQL pendientes. Base: ${env.safeUrl(process.env.DATABASE_URL)}`);
    } else {
      console.log(`Migraciones PostgreSQL aplicadas: ${result.applied}. Base: ${env.safeUrl(process.env.DATABASE_URL)}`);
    }
  });
}

const DB_PATH = env.sqlitePath();

function migrateSqlite() {
  const { DatabaseSync } = require('node:sqlite');
  const storageDir = path.dirname(DB_PATH);
  if (!fs.existsSync(storageDir)) fs.mkdirSync(storageDir, { recursive: true });

  const db = new DatabaseSync(DB_PATH);
  db.exec("PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON;");

  const backup = backupDatabase('pre-migrate');
  if (!backup.skipped) console.log(`Backup previo: ${backup.db}`);
  else console.log(`Backup previo omitido: ${backup.reason}`);

  const result = runMigrations(db, { log: message => console.log(message) });
  if (result.applied === 0) {
    console.log(`Sin migraciones pendientes. Base: ${DB_PATH}`);
  } else {
    console.log(`Migraciones aplicadas: ${result.applied}. Base: ${DB_PATH}`);
  }
}

async function main() {
  if (process.env.DATABASE_URL) {
    await migratePostgres();
    return;
  }

  migrateSqlite();
}

main().catch(e => {
  console.error(e.message || e);
  process.exitCode = 1;
});
