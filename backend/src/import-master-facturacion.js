require('dotenv').config();
require('./db');
const { importFromPublicGoogleSheet } = require('./services/excelMasterFacturacion');

async function main() {
  const result = await importFromPublicGoogleSheet(process.argv[2]);
  console.log(JSON.stringify(result, null, 2));
}

main().catch(error => {
  console.error(error.message);
  if (process.env.NODE_ENV === 'development') console.error(error.stack);
  process.exit(1);
});
