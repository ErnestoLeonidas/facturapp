require('./config/env');

const { spawnSync } = require('child_process');
const { v4: uuidv4 } = require('uuid');
const env = require('./config/env');
const {
  generateTemporaryPassword,
  passwordFields,
  postgresActiveUsersWithKnownPasswords,
  sqliteActiveUsersWithKnownPasswords,
  userSummary,
  validateBootstrapPassword,
  validateInitialPassword
} = require('./security/password-audit');
const { withPostgresClient } = require('./postgres');

function clean(value) {
  if (value === undefined || value === null) return '';
  return String(value).trim();
}

function parseArgs(argv) {
  const opts = { users: [] };
  const args = [...argv];

  while (args.length) {
    const arg = args.shift();
    if (arg === '--user') {
      opts.users.push(clean(args.shift()).toLowerCase());
    } else if (arg.startsWith('--user=')) {
      opts.users.push(clean(arg.slice('--user='.length)).toLowerCase());
    } else if (arg === '--users') {
      opts.users.push(...clean(args.shift()).split(',').map(value => clean(value).toLowerCase()));
    } else if (arg.startsWith('--users=')) {
      opts.users.push(...clean(arg.slice('--users='.length)).split(',').map(value => clean(value).toLowerCase()));
    } else {
      opts.unknown = arg;
    }
  }

  opts.users = Array.from(new Set(opts.users.filter(Boolean)));
  return opts;
}

function usage() {
  console.log(`
Uso:
  npm run rotate:passwords
  NEW_PASSWORD="password-inicial" npm run rotate:passwords -- --user username
  NEW_PASSWORD="password-inicial" npm run rotate:passwords -- --users username1,username2
`);
}

function bootstrapConfig() {
  const username = clean(process.env.ADMIN_BOOTSTRAP_USER).toLowerCase();
  const password = clean(process.env.ADMIN_BOOTSTRAP_PASSWORD);
  const email = clean(process.env.ADMIN_BOOTSTRAP_EMAIL).toLowerCase();
  const provided = [username, password, email].some(Boolean);
  if (!provided) return null;

  if (!username || !password || !email) {
    throw new Error('ADMIN_BOOTSTRAP_USER, ADMIN_BOOTSTRAP_PASSWORD y ADMIN_BOOTSTRAP_EMAIL deben configurarse juntos');
  }
  if (!/^[a-z0-9._-]{3,64}$/.test(username)) {
    throw new Error('ADMIN_BOOTSTRAP_USER debe usar 3 a 64 caracteres: letras, numeros, punto, guion o guion bajo');
  }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    throw new Error('ADMIN_BOOTSTRAP_EMAIL debe ser un email valido');
  }
  validateBootstrapPassword(password);

  return {
    username,
    password,
    email,
    nombre: clean(process.env.ADMIN_BOOTSTRAP_NAME) || username
  };
}

function printUsers(title, users) {
  console.log(`${title}: ${users.length}`);
  users.forEach(user => {
    console.log(`- ${user.username || user.email || user.id} (${user.rol})`);
  });
}

function printUpdatedUser(user) {
  console.log(`usuario actualizado: ${user.username}`);
  console.log(`rol: ${user.rol}`);
  console.log(`estado: ${Number(user.activo) === 1 ? 'activo' : 'inactivo'}`);
}

function sqliteNow() {
  return new Date().toISOString().replace('T', ' ').replace(/\.\d+Z$/, '');
}

function newPasswordFromEnv() {
  const password = process.env.NEW_PASSWORD;
  if (!password || !clean(password)) {
    throw new Error('NEW_PASSWORD debe estar configurada');
  }
  validateInitialPassword(password, 'NEW_PASSWORD');
  return password;
}

function runDbCheck() {
  console.log('Ejecutando npm run db:check...');
  const childEnv = { ...process.env };
  delete childEnv.NEW_PASSWORD;
  const result = spawnSync(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['run', 'db:check'], {
    cwd: env.BACKEND_ROOT,
    env: childEnv,
    stdio: 'inherit'
  });

  if (result.error) throw result.error;
  if (result.status === 0) {
    console.log('db:check OK. Ya puede ejecutarse REQUIRE_DEPLOYMENT_CONFIG=1 npm run prod:check.');
    return;
  }

  throw new Error('db:check fallo. Revisa la salida anterior antes de ejecutar prod:check estricto.');
}

async function ensureBootstrapPostgres(client, bootstrap) {
  if (!bootstrap) return null;
  const credentials = passwordFields(bootstrap.password);
  const existing = await client.query(`
    SELECT id
    FROM app_user
    WHERE lower(COALESCE(username, email)) = lower($1)
       OR lower(email) = lower($2)
    LIMIT 1
  `, [bootstrap.username, bootstrap.email]);

  if (existing.rowCount) {
    await client.query(`
      UPDATE app_user
      SET nombre = $1,
          username = $2,
          email = $3,
          rol = 'admin',
          password_hash = $4,
          password_salt = $5,
          activo = 1,
          updated_at = CURRENT_TIMESTAMP::text
      WHERE id = $6
    `, [bootstrap.nombre, bootstrap.username, bootstrap.email, credentials.hash, credentials.salt, existing.rows[0].id]);
  } else {
    await client.query(`
      INSERT INTO app_user (id, nombre, username, email, rol, password_hash, password_salt, activo)
      VALUES (gen_random_uuid()::text, $1, $2, $3, 'admin', $4, $5, 1)
    `, [bootstrap.nombre, bootstrap.username, bootstrap.email, credentials.hash, credentials.salt]);
  }

  return { username: bootstrap.username, email: bootstrap.email, rol: 'admin' };
}

function ensureBootstrapSqlite(db, bootstrap) {
  if (!bootstrap) return null;
  const credentials = passwordFields(bootstrap.password);
  const existing = db.prepare(`
    SELECT id
    FROM app_user
    WHERE lower(COALESCE(username, email)) = lower(?)
       OR lower(email) = lower(?)
    LIMIT 1
  `).get(bootstrap.username, bootstrap.email);

  if (existing) {
    db.prepare(`
      UPDATE app_user
      SET nombre = ?,
          username = ?,
          email = ?,
          rol = 'admin',
          password_hash = ?,
          password_salt = ?,
          activo = 1,
          updated_at = ?
      WHERE id = ?
    `).run(bootstrap.nombre, bootstrap.username, bootstrap.email, credentials.hash, credentials.salt, sqliteNow(), existing.id);
  } else {
    db.prepare(`
      INSERT INTO app_user (id, nombre, username, email, rol, password_hash, password_salt, activo)
      VALUES (?, ?, ?, ?, 'admin', ?, ?, 1)
    `).run(uuidv4(), bootstrap.nombre, bootstrap.username, bootstrap.email, credentials.hash, credentials.salt);
  }

  return { username: bootstrap.username, email: bootstrap.email, rol: 'admin' };
}

async function activeAdminsPostgres(client) {
  const result = await client.query(`
    SELECT id, nombre, username, email, rol
    FROM app_user
    WHERE activo = 1 AND rol = 'admin'
  `);
  return result.rows.map(userSummary);
}

function activeAdminsSqlite(db) {
  return db.prepare(`
    SELECT id, nombre, username, email, rol
    FROM app_user
    WHERE activo = 1 AND rol = 'admin'
  `).all().map(userSummary);
}

function assertSafeAdminRemains(activeAdmins, affectedUsers) {
  const affectedAdminIds = new Set(affectedUsers.filter(user => user.rol === 'admin').map(user => user.id));
  const safeAdmin = activeAdmins.find(user => !affectedAdminIds.has(user.id));
  if (!safeAdmin) {
    throw new Error('No hay admin activo con password segura. Define ADMIN_BOOTSTRAP_USER, ADMIN_BOOTSTRAP_PASSWORD y ADMIN_BOOTSTRAP_EMAIL antes de rotar.');
  }
}

async function rotatePostgresUsers(client, users) {
  for (const user of users) {
    const credentials = passwordFields(generateTemporaryPassword());
    await client.query(`
      UPDATE app_user
      SET password_hash = $1,
          password_salt = $2,
          updated_at = CURRENT_TIMESTAMP::text
      WHERE id = $3
    `, [credentials.hash, credentials.salt, user.id]);
  }
}

function rotateSqliteUsers(db, users) {
  const update = db.prepare(`
    UPDATE app_user
    SET password_hash = ?,
        password_salt = ?,
        updated_at = ?
    WHERE id = ?
  `);

  users.forEach(user => {
    const credentials = passwordFields(generateTemporaryPassword());
    update.run(credentials.hash, credentials.salt, sqliteNow(), user.id);
  });
}

async function rotatePostgresSelectedUsers(usernames, password) {
  await withPostgresClient(async client => {
    await client.query('BEGIN');
    try {
      const result = await client.query(`
        SELECT id, username, rol, activo
        FROM app_user
        WHERE lower(username) = ANY($1::text[])
        ORDER BY username
      `, [usernames.map(username => username.toLowerCase())]);
      const byUsername = new Map(result.rows.map(user => [String(user.username || '').toLowerCase(), user]));

      for (const username of usernames) {
        if (!byUsername.has(username)) throw new Error(`Usuario no existe: ${username}`);
      }

      const users = usernames.map(username => byUsername.get(username));
      const inactive = users.find(user => Number(user.activo) !== 1);
      if (inactive) throw new Error(`Usuario inactivo: ${inactive.username}`);

      for (const user of users) {
        const credentials = passwordFields(password);
        await client.query(`
          UPDATE app_user
          SET password_hash = $1,
              password_salt = $2,
              updated_at = CURRENT_TIMESTAMP::text
          WHERE id = $3
        `, [credentials.hash, credentials.salt, user.id]);
      }

      await client.query('COMMIT');
      users.forEach(printUpdatedUser);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    }
  });

  runDbCheck();
}

function rotateSqliteSelectedUsers(usernames, password) {
  const db = require('./db');
  const run = db.transaction(() => {
    const find = db.prepare(`
      SELECT id, username, rol, activo
      FROM app_user
      WHERE lower(username) = lower(?)
      LIMIT 1
    `);
    const users = usernames.map(username => {
      const user = find.get(username);
      if (!user) throw new Error(`Usuario no existe: ${username}`);
      if (Number(user.activo) !== 1) throw new Error(`Usuario inactivo: ${username}`);
      return user;
    });

    const update = db.prepare(`
      UPDATE app_user
      SET password_hash = ?,
          password_salt = ?,
          updated_at = ?
      WHERE id = ?
    `);
    users.forEach(user => {
      const credentials = passwordFields(password);
      update.run(credentials.hash, credentials.salt, sqliteNow(), user.id);
    });
    return users;
  });

  run().forEach(printUpdatedUser);
  runDbCheck();
}

async function rotatePostgres(bootstrap) {
  await withPostgresClient(async client => {
    await client.query('BEGIN');
    try {
      const bootstrapped = await ensureBootstrapPostgres(client, bootstrap);
      let affected = await postgresActiveUsersWithKnownPasswords(client);
      const admins = await activeAdminsPostgres(client);
      assertSafeAdminRemains(admins, affected);

      if (affected.length) {
        await rotatePostgresUsers(client, affected);
      }
      await client.query('COMMIT');

      if (bootstrapped) printUsers('Admin bootstrap asegurado', [bootstrapped]);
      printUsers('Usuarios rotados por password conocida', affected);
      console.log('Rotacion completada. No se imprimieron passwords temporales.');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    }
  });
}

function rotateSqlite(bootstrap) {
  const db = require('./db');
  const run = db.transaction(() => {
    const bootstrapped = ensureBootstrapSqlite(db, bootstrap);
    const affected = sqliteActiveUsersWithKnownPasswords(db);
    const admins = activeAdminsSqlite(db);
    assertSafeAdminRemains(admins, affected);

    if (affected.length) {
      rotateSqliteUsers(db, affected);
    }

    return { bootstrapped, affected };
  });

  const result = run();
  if (result.bootstrapped) printUsers('Admin bootstrap asegurado', [result.bootstrapped]);
  printUsers('Usuarios rotados por password conocida', result.affected);
  console.log('Rotacion completada. No se imprimieron passwords temporales.');
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.unknown) {
    usage();
    if (args.unknown) console.error(`ERROR Argumento no reconocido: ${args.unknown}`);
    process.exitCode = 1;
    return;
  }
  if (args.users.length) {
    const password = newPasswordFromEnv();
    if (process.env.DATABASE_URL) {
      await rotatePostgresSelectedUsers(args.users, password);
      return;
    }
    throw new Error('DATABASE_URL PostgreSQL no esta configurado.');
  }

  const bootstrap = bootstrapConfig();
  if (process.env.DATABASE_URL) {
    await rotatePostgres(bootstrap);
    return;
  }
  throw new Error('DATABASE_URL PostgreSQL no esta configurado.');
}

main().catch(error => {
  console.error(`ERROR ${error.message || error}`);
  process.exitCode = 1;
});
