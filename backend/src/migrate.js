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

async function main() {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL PostgreSQL no esta configurado.');
  await migratePostgres();
}

main().catch(e => {
  console.error(e.message || e);
  process.exitCode = 1;
});
