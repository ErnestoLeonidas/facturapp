const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const { withPostgresClient } = require('./postgres');
const { runPostgresMigrations } = require('./postgres-migrations');

function safeUrl(raw) {
  if (!raw) return '';
  try {
    const parsed = new URL(raw);
    if (parsed.password) parsed.password = '***';
    return parsed.toString();
  } catch (_) {
    return raw.replace(/:\/\/([^:]+):([^@]+)@/, '://$1:***@');
  }
}

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL no esta configurado. Copia .env.example a .env y ajusta la clave.');
  }

  await withPostgresClient(async client => {
    const result = await runPostgresMigrations(client, {
      log: message => console.log(message)
    });

    if (result.applied === 0) {
      console.log(`Sin migraciones pendientes. Base: ${safeUrl(process.env.DATABASE_URL)}`);
      return;
    }

    console.log(`Migraciones aplicadas: ${result.applied}/${result.total}. Base: ${safeUrl(process.env.DATABASE_URL)}`);
  });
}

main().catch(error => {
  console.error(error.message || error);
  process.exitCode = 1;
});
