require('./config/env');

const { v4: uuidv4 } = require('uuid');
const db = require('./db-async');
const {
  passwordFields,
  validateInitialPassword
} = require('./security/password-audit');

const ACTIVE_USERS = new Set(['cgaete', 'valgian', 'admin', 'plataformas']);
const LEGACY_USERS = new Set(['dllanes', 'mabasolo', 'mdarocha', 'usuario']);

function clean(value) {
  return String(value == null ? '' : value).trim();
}

function key(value) {
  return clean(value).toLowerCase();
}

function credentials(password) {
  const fields = passwordFields(password);
  return { hash: fields.hash, salt: fields.salt };
}

async function findUser(identifier) {
  return db.get(`
    SELECT *
    FROM app_user
    WHERE lower(COALESCE(username, email)) = lower(?)
       OR lower(email) = lower(?)
    LIMIT 1
  `, [identifier, identifier]);
}

async function ensureUser({ username, nombre, rol, password, preservePassword = true, email }) {
  const existing = await findUser(username);
  const fields = [];
  const vals = [];
  const nextEmail = email || (existing && existing.email) || username;

  if (existing) {
    fields.push('nombre = ?', 'username = ?', 'email = ?', 'rol = ?', 'activo = 1', 'updated_at = ?');
    vals.push(nombre, username, nextEmail, rol, db.nowText());

    if (password || !preservePassword) {
      const next = credentials(password);
      fields.push('password_hash = ?', 'password_salt = ?');
      vals.push(next.hash, next.salt);
      await db.run('UPDATE app_session SET revoked_at = ? WHERE user_id = ? AND revoked_at IS NULL', [db.nowText(), existing.id]);
    }

    vals.push(existing.id);
    await db.run(`UPDATE app_user SET ${fields.join(', ')} WHERE id = ?`, vals);
    return existing.id;
  }

  if (!password) {
    throw new Error(`No existe ${username} y se requiere NEW_PASSWORD para crearla`);
  }

  const next = credentials(password);
  const id = uuidv4();
  await db.run(`
    INSERT INTO app_user (id, nombre, username, email, rol, password_hash, password_salt, activo)
    VALUES (?, ?, ?, ?, ?, ?, ?, 1)
  `, [id, nombre, username, nextEmail, rol, next.hash, next.salt]);
  return id;
}

async function normalizeValgian() {
  const valgian = await findUser('valgian');
  const vgianna = await findUser('vgianna');

  if (valgian && vgianna && valgian.id !== vgianna.id) {
    throw new Error('Existen usuarios separados valgian y vgianna. Resolver manualmente antes de normalizar.');
  }

  const target = valgian || vgianna;
  if (!target) return null;

  await db.run(`
    UPDATE app_user
    SET nombre = 'Valeria Giannattasio',
        username = 'valgian',
        email = 'valgian',
        rol = 'admin',
        activo = 1,
        updated_at = ?
    WHERE id = ?
  `, [db.nowText(), target.id]);
  return target.id;
}

async function deactivateLegacyUsers() {
  const rows = await db.all(`
    SELECT id, username, email, rol, coordinador_id
    FROM app_user
  `);
  const ids = rows
    .filter(row => {
      const username = key(row.username || row.email);
      if (ACTIVE_USERS.has(username)) return false;
      if (LEGACY_USERS.has(username)) return true;
      return row.rol === 'usuario' || !!row.coordinador_id;
    })
    .map(row => row.id);

  if (!ids.length) return 0;

  for (const id of ids) {
    await db.run('UPDATE app_user SET activo = 0, updated_at = ? WHERE id = ?', [db.nowText(), id]);
    await db.run('UPDATE app_session SET revoked_at = ? WHERE user_id = ? AND revoked_at IS NULL', [db.nowText(), id]);
  }
  return ids.length;
}

async function run() {
  const newPassword = clean(process.env.NEW_PASSWORD);
  validateInitialPassword(newPassword, 'NEW_PASSWORD');
  const adminPassword = clean(process.env.ADMIN_PASSWORD) || newPassword;

  await normalizeValgian();
  await ensureUser({ username: 'cgaete', nombre: 'Constanza Gaete', rol: 'admin' });
  await ensureUser({ username: 'valgian', nombre: 'Valeria Giannattasio', rol: 'admin' });
  await ensureUser({ username: 'admin', nombre: 'Administrador', rol: 'admin', password: adminPassword });
  await ensureUser({ username: 'plataformas', nombre: 'Usuario Plataforma', rol: 'usuario', password: newPassword, preservePassword: false });
  await deactivateLegacyUsers();

  const active = await db.all(`
    SELECT username, nombre, rol, activo
    FROM app_user
    WHERE activo = 1
    ORDER BY lower(username)
  `);
  console.log('Usuarios activos finales:');
  active.forEach(user => console.log(`- ${user.username} (${user.rol})`));
}

run()
  .catch(error => {
    console.error(`ERROR ${error.message || error}`);
    process.exitCode = 1;
  })
  .finally(() => db.close());
