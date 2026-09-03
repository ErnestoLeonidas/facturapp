const { Client } = require('pg');

function sslConfig() {
  const mode = String(process.env.PGSSLMODE || '').toLowerCase();
  if (!mode || mode === 'disable') return undefined;
  if (mode === 'no-verify') return { rejectUnauthorized: false };
  return { rejectUnauthorized: mode !== 'require' };
}

function createPostgresClient() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL no esta configurado');
  }

  return new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: sslConfig()
  });
}

async function withPostgresClient(fn) {
  const client = createPostgresClient();
  await client.connect();
  try {
    return await fn(client);
  } finally {
    await client.end();
  }
}

module.exports = { createPostgresClient, sslConfig, withPostgresClient };
