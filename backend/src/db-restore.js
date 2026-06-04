const fs = require('fs');
const path = require('path');
const { backupDatabase } = require('./db-backup');
const env = require('./config/env');

const DB_PATH = env.sqlitePath();

function restoreDatabase(source, options = {}) {
  if (!source) throw new Error('Debes indicar la ruta del backup a restaurar.');
  const sourcePath = path.resolve(source);
  if (!fs.existsSync(sourcePath)) throw new Error(`No existe el backup: ${sourcePath}`);
  if (!options.yes) throw new Error('Restore detenido. Ejecuta con --yes para confirmar.');

  const currentBackup = backupDatabase('pre-restore');
  const storageDir = path.dirname(DB_PATH);
  fs.mkdirSync(storageDir, { recursive: true });

  fs.copyFileSync(sourcePath, DB_PATH);

  const sourceWal = `${sourcePath}-wal`;
  const sourceShm = `${sourcePath}-shm`;
  const targetWal = `${DB_PATH}-wal`;
  const targetShm = `${DB_PATH}-shm`;

  if (fs.existsSync(sourceWal)) fs.copyFileSync(sourceWal, targetWal);
  else if (fs.existsSync(targetWal)) fs.rmSync(targetWal);

  if (fs.existsSync(sourceShm)) fs.copyFileSync(sourceShm, targetShm);
  else if (fs.existsSync(targetShm)) fs.rmSync(targetShm);

  return { restored_from: sourcePath, restored_to: DB_PATH, backup_before_restore: currentBackup };
}

if (require.main === module) {
  try {
    const args = process.argv.slice(2);
    const source = args.find(arg => arg !== '--yes');
    const result = restoreDatabase(source, { yes: args.includes('--yes') });
    console.log(`Base restaurada desde: ${result.restored_from}`);
    console.log(`Destino: ${result.restored_to}`);
    if (!result.backup_before_restore.skipped) {
      console.log(`Backup previo al restore: ${result.backup_before_restore.db}`);
    }
  } catch (e) {
    console.error(e.message || e);
    process.exitCode = 1;
  }
}

module.exports = { restoreDatabase };
