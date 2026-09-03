require('./config/env');

const { v4: uuidv4 } = require('uuid');
const db = require('./db-async');
const { passwordFields } = require('./security/password-audit');

function clean(value, fallback = '') {
  if (value === undefined || value === null) return fallback;
  const text = String(value).trim();
  return text || fallback;
}

function truthy(value) {
  return ['1', 'true', 'yes', 'si'].includes(clean(value).toLowerCase());
}

function validateUsername(username) {
  if (!/^[a-z0-9._-]{3,64}$/.test(username)) {
    throw new Error('TEST_ADMIN_USER debe usar 3 a 64 caracteres: letras, numeros, punto, guion o guion bajo');
  }
}

function validateEmail(email) {
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    throw new Error('TEST_ADMIN_EMAIL debe ser un email valido');
  }
}

async function ensureTestAdmin() {
  const username = clean(process.env.TEST_ADMIN_USER, 'admin').toLowerCase();
  const email = clean(process.env.TEST_ADMIN_EMAIL, 'admin@facturapp.local').toLowerCase();

  if (!truthy(process.env.ENABLE_TEST_ADMIN)) {
    if (username === 'admin') {
      console.log('Admin oficial gestionado por ensure:platform-users; no se desactiva en el arranque.');
      return;
    }

    if (truthy(process.env.DISABLE_TEST_ADMIN_ON_START)) {
      await db.run(`
        UPDATE app_user
        SET activo = 0,
            updated_at = ?
        WHERE lower(COALESCE(username, email)) = lower(?)
           OR lower(email) = lower(?)
      `, [db.nowText(), username, email]);
      await db.run(`
        UPDATE app_session
        SET revoked_at = ?
        WHERE user_id IN (
          SELECT id
          FROM app_user
          WHERE lower(COALESCE(username, email)) = lower(?)
             OR lower(email) = lower(?)
        )
          AND revoked_at IS NULL
      `, [db.nowText(), username, email]);
      console.log(`Admin de pruebas desactivado si existia: ${username}`);
      return;
    }

    console.log('Admin de pruebas omitido: ENABLE_TEST_ADMIN no esta activo.');
    return;
  }

  const nombre = clean(process.env.TEST_ADMIN_NAME, 'Administrador Pruebas');
  const password = clean(process.env.TEST_ADMIN_PASSWORD);

  validateUsername(username);
  validateEmail(email);
  if (!password) throw new Error('TEST_ADMIN_PASSWORD debe estar configurada');
  if (password !== 'mas2026' && password.length < 8) throw new Error('TEST_ADMIN_PASSWORD debe tener al menos 8 caracteres');

  const credentials = passwordFields(password);
  const existing = await db.get(`
    SELECT id
    FROM app_user
    WHERE lower(COALESCE(username, email)) = lower(?)
       OR lower(email) = lower(?)
    LIMIT 1
  `, [username, email]);

  if (existing) {
    await db.run(`
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
    `, [nombre, username, email, credentials.hash, credentials.salt, db.nowText(), existing.id]);
  } else {
    await db.run(`
      INSERT INTO app_user (id, nombre, username, email, rol, password_hash, password_salt, activo)
      VALUES (?, ?, ?, ?, 'admin', ?, ?, 1)
    `, [uuidv4(), nombre, username, email, credentials.hash, credentials.salt]);
  }

  console.log(`Admin de pruebas asegurado: ${username}`);
}

ensureTestAdmin()
  .catch(error => {
    console.error(`ERROR ${error.message || error}`);
    process.exitCode = 1;
  })
  .finally(() => db.close());
