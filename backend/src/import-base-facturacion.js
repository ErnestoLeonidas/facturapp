require('dotenv').config();
require('./db');
const { importFromFile, importFromPublicGoogleSheet } = require('./services/excelBaseFacturacion');

async function main() {
  const arg = process.argv[2];
  const mode = arg ? 'file' : 'public-google-sheet';
  const result = mode === 'file'
    ? await importFromFile(arg)
    : await importFromPublicGoogleSheet();

  console.log(JSON.stringify(result, null, 2));
}

main().catch(error => {
  console.error(error.message);
  if (process.env.NODE_ENV === 'development') console.error(error.stack);
  process.exit(1);
});
