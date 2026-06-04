require('./config/env');
const { Pool } = require('pg');
const { sslConfig } = require('./postgres');

const isPostgres = Boolean(process.env.DATABASE_URL);
let pool = null;
let sqliteDb = null;

function sqlite() {
  if (!sqliteDb) sqliteDb = require('./db');
  return sqliteDb;
}

function postgresPool() {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: sslConfig()
    });
  }
  return pool;
}

function sqliteArgs(params) {
  if (params === undefined || params === null) return [];
  if (Array.isArray(params)) return params;
  if (typeof params === 'object') return [params];
  return [params];
}

function toPostgresQuery(sql, params = []) {
  if (params && typeof params === 'object' && !Array.isArray(params)) {
    const values = [];
    const indexes = new Map();
    const text = String(sql).replace(/@([A-Za-z_][A-Za-z0-9_]*)/g, (_, name) => {
      if (!indexes.has(name)) {
        values.push(params[name]);
        indexes.set(name, values.length);
      }
      return `$${indexes.get(name)}`;
    });
    return { sql: text, params: values };
  }

  const values = sqliteArgs(params);
  let index = 0;
  return {
    sql: String(sql).replace(/\?/g, () => `$${++index}`),
    params: values
  };
}

function nowText(date = new Date()) {
  return date.toISOString().slice(0, 19).replace('T', ' ');
}

function addHoursText(hours, date = new Date()) {
  return nowText(new Date(date.getTime() + hours * 60 * 60 * 1000));
}

async function all(sql, params = []) {
  if (!isPostgres) return sqlite().prepare(sql).all(...sqliteArgs(params));
  const query = toPostgresQuery(sql, params);
  const result = await postgresPool().query(query.sql, query.params);
  return result.rows;
}

async function get(sql, params = []) {
  if (!isPostgres) return sqlite().prepare(sql).get(...sqliteArgs(params));
  const query = toPostgresQuery(sql, params);
  const result = await postgresPool().query(query.sql, query.params);
  return result.rows[0] || null;
}

async function run(sql, params = []) {
  if (!isPostgres) return sqlite().prepare(sql).run(...sqliteArgs(params));
  const query = toPostgresQuery(sql, params);
  return postgresPool().query(query.sql, query.params);
}

async function exec(sql) {
  if (!isPostgres) return sqlite().exec(sql);
  return postgresPool().query(sql);
}

async function transaction(fn) {
  if (!isPostgres) {
    const db = sqlite();
    const scoped = {
      all: async (sql, params = []) => db.prepare(sql).all(...sqliteArgs(params)),
      get: async (sql, params = []) => db.prepare(sql).get(...sqliteArgs(params)),
      run: async (sql, params = []) => db.prepare(sql).run(...sqliteArgs(params)),
      exec: async sql => db.exec(sql)
    };

    db.exec('BEGIN');
    try {
      const result = await fn(scoped);
      db.exec('COMMIT');
      return result;
    } catch (error) {
      db.exec('ROLLBACK');
      throw error;
    }
  }

  const client = await postgresPool().connect();
  const scoped = {
    all: async (sql, params = []) => {
      const query = toPostgresQuery(sql, params);
      return (await client.query(query.sql, query.params)).rows;
    },
    get: async (sql, params = []) => {
      const query = toPostgresQuery(sql, params);
      const result = await client.query(query.sql, query.params);
      return result.rows[0] || null;
    },
    run: async (sql, params = []) => {
      const query = toPostgresQuery(sql, params);
      return client.query(query.sql, query.params);
    },
    exec: async sql => client.query(sql)
  };

  try {
    await client.query('BEGIN');
    const result = await fn(scoped);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

async function close() {
  if (pool) {
    await pool.end();
    pool = null;
  }
}

module.exports = {
  addHoursText,
  all,
  close,
  exec,
  get,
  isPostgres,
  nowText,
  run,
  transaction
};
