require('dotenv').config();
require('./db');
const { backupDatabase } = require('./db-backup');
const { importFromPublicGoogleSheet } = require('./services/excelMasterFacturacion');

async function main() {
  const backup = backupDatabase('pre-import-master-facturacion');
  if (!backup.skipped) console.log(`Backup previo: ${backup.db}`);
  else console.log(`Backup previo omitido: ${backup.reason}`);

  const result = await importFromPublicGoogleSheet(process.argv[2]);
  console.log(JSON.stringify(result, null, 2));
}

main().catch(error => {
  console.error(error.message);
  if (process.env.NODE_ENV === 'development') console.error(error.stack);
  process.exit(1);
});
