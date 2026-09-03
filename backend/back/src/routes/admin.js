const crypto = require('crypto');
const ExcelJS = require('exceljs');
const db = require('../db-async');
const { v4: uuidv4 } = require('uuid');
const { ok, fail } = require('../middleware/envelope');
const { requireRole } = require('../services/auth');
const audit = require('../services/audit');

const r = require('express').Router();
const PASSWORD_ITERATIONS = 120000;

r.use(requireRole('admin'));
r.use('/proyecciones', require('./admin-proyecciones'));
r.use('/slack', require('./admin-slack'));

function clean(value) {
  if (value === undefined || value === null) return '';
  return String(value).trim();
}

function key(value) {
  return clean(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '');
}

function normalizeUsername(value) {
  return key(value).replace(/_/g, '').slice(0, 40);
}

function hashPassword(password, salt) {
  return crypto.pbkdf2Sync(String(password || ''), salt, PASSWORD_ITERATIONS, 32, 'sha256').toString('hex');
}

function periodoActual(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Santiago',
    year: 'numeric',
    month: '2-digit'
  }).formatToParts(date);
  const year = parts.find(p => p.type === 'year').value;
  const month = parts.find(p => p.type === 'month').value;
  return `${year}-${month}`;
}

function nombreMes(periodo) {
  const [year, month] = String(periodo || '').split('-').map(Number);
  if (!year || !month) return periodo || '';
  return new Intl.DateTimeFormat('es-CL', {
    timeZone: 'America/Santiago',
    month: 'long',
    year: 'numeric'
  }).format(new Date(Date.UTC(year, month - 1, 15, 12)));
}

async function pendientesOCMes(periodo) {
  return db.all(`
    SELECT
      c.nombre_corto AS cliente,
      cp.codigo AS cp,
      cp.nombre AS cp_nombre,
      cp.tipo_cp AS tipo_cp,
      sf.periodo,
      sc.monto_uf AS cantidad_uf
    FROM solicitud_factura sf
    JOIN cliente c ON c.id = sf.cliente_id
    JOIN solicitud_cp sc ON sc.solicitud_id = sf.id
    JOIN cp ON cp.id = sc.cp_id
    WHERE sf.is_delete = 0
      AND sf.estado = 'PENDIENTE OC / HES'
      AND sf.periodo = ?
    ORDER BY c.nombre_corto, cp.codigo, sf.folio
  `, [periodo]);
}

async function exportPendientesOCMes(periodo) {
  const rows = await pendientesOCMes(periodo);
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'FactuFlow';
  workbook.created = new Date();
  const ws = workbook.addWorksheet('Pendientes OC');

  ws.columns = [
    { header: 'Cliente', key: 'cliente', width: 28 },
    { header: 'CP', key: 'cp', width: 14 },
    { header: 'Nombre CP', key: 'cp_nombre', width: 34 },
    { header: 'Tipo de CP', key: 'tipo_cp', width: 30 },
    { header: 'Mes', key: 'mes', width: 18 },
    { header: 'Cantidad de UF', key: 'cantidad_uf', width: 16 }
  ];

  ws.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  ws.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF17963A' } };
  ws.getRow(1).alignment = { vertical: 'middle' };

  const mes = nombreMes(periodo);
  rows.forEach(row => {
    const cantidadUF = Number(row.cantidad_uf);
    ws.addRow({
      cliente: row.cliente || '',
      cp: row.cp || '',
      cp_nombre: row.cp_nombre || '',
      tipo_cp: row.tipo_cp || '',
      mes,
      cantidad_uf: Number.isFinite(cantidadUF) && cantidadUF > 0 ? cantidadUF : null
    });
  });

  ws.getColumn('cantidad_uf').numFmt = '#,##0.00';
  ws.eachRow(row => {
    row.eachCell(cell => {
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFE2E6EA' } },
        left: { style: 'thin', color: { argb: 'FFE2E6EA' } },
        bottom: { style: 'thin', color: { argb: 'FFE2E6EA' } },
        right: { style: 'thin', color: { argb: 'FFE2E6EA' } }
      };
    });
  });

  ws.autoFilter = 'A1:F1';
  ws.views = [{ state: 'frozen', ySplit: 1 }];
  return workbook.xlsx.writeBuffer();
}

function passwordFields(username, password) {
  const salt = `facturapp-${normalizeUsername(username)}-${crypto.randomBytes(8).toString('hex')}`;
  return { salt, hash: hashPassword(password, salt) };
}

r.get('/usuarios', async (req, res, next) => {
  try {
    ok(res, await db.all('SELECT id, nombre, username, email, rol, activo, created_at FROM app_user ORDER BY rol, username, email'));
  } catch (error) {
    next(error);
  }
});

r.post('/usuarios', async (req, res, next) => {
  try {
    const nombre = clean(req.body && req.body.nombre);
    const username = normalizeUsername(req.body && req.body.username);
    const rol = clean(req.body && req.body.rol) || 'usuario';
    const password = clean(req.body && req.body.password);
    if (!nombre || !username || !password) return fail(res, 'VALIDATION_ERROR', 'Nombre, usuario y password son requeridos');
    if (!['admin', 'usuario'].includes(rol)) return fail(res, 'VALIDATION_ERROR', 'Rol no valido');
    if (password.length < 6) return fail(res, 'VALIDATION_ERROR', 'El password debe tener al menos 6 caracteres');

    const passwordData = passwordFields(username, password);
    const existing = await db.get(`
      SELECT id FROM app_user
      WHERE lower(COALESCE(username, email)) = lower(?) OR lower(email) = lower(?)
      LIMIT 1
    `, [username, username]);

    if (existing) {
      await db.run(`
        UPDATE app_user
        SET nombre = ?, username = ?, email = ?, rol = ?, password_hash = ?, password_salt = ?, activo = 1, updated_at = ?
        WHERE id = ?
      `, [nombre, username, username, rol, passwordData.hash, passwordData.salt, db.nowText(), existing.id]);
    } else {
      await db.run(`
        INSERT INTO app_user (id, nombre, username, email, rol, password_hash, password_salt, activo)
        VALUES (?, ?, ?, ?, ?, ?, ?, 1)
      `, [uuidv4(), nombre, username, username, rol, passwordData.hash, passwordData.salt]);
    }

    const user = await db.get('SELECT id, nombre, username, email, rol, activo, created_at FROM app_user WHERE lower(username) = lower(?) LIMIT 1', [username]);
    audit.log(req, 'crear_usuario', 'app_user', user.id, { username, rol });
    ok(res, user, 201);
  } catch (error) {
    next(error);
  }
});

r.put('/usuarios/:id/password', async (req, res, next) => {
  try {
    const user = await db.get('SELECT id, username, email FROM app_user WHERE id = ?', [req.params.id]);
    if (!user) return fail(res, 'NOT_FOUND', 'Usuario no encontrado', null, 404);
    const password = clean(req.body && req.body.password);
    if (password.length < 6) return fail(res, 'VALIDATION_ERROR', 'El password debe tener al menos 6 caracteres');
    const passwordData = passwordFields(user.username || user.email, password);
    await db.run(`
      UPDATE app_user
      SET password_hash = ?, password_salt = ?, updated_at = ?
      WHERE id = ?
    `, [passwordData.hash, passwordData.salt, db.nowText(), user.id]);
    await db.run('UPDATE app_session SET revoked_at = ? WHERE user_id = ?', [db.nowText(), user.id]);
    audit.log(req, 'cambiar_password_usuario', 'app_user', user.id, { username: user.username || user.email });
    ok(res, { changed: true });
  } catch (error) {
    next(error);
  }
});

r.delete('/usuarios/:id', async (req, res, next) => {
  try {
    const user = await db.get('SELECT id, username, email FROM app_user WHERE id = ?', [req.params.id]);
    if (!user) return fail(res, 'NOT_FOUND', 'Usuario no encontrado', null, 404);
    if (req.user && req.user.id === user.id) return fail(res, 'VALIDATION_ERROR', 'No puedes eliminar tu propio usuario activo');
    await db.run('UPDATE app_user SET activo = 0, updated_at = ? WHERE id = ?', [db.nowText(), user.id]);
    await db.run('UPDATE app_session SET revoked_at = ? WHERE user_id = ?', [db.nowText(), user.id]);
    audit.log(req, 'eliminar_usuario', 'app_user', user.id, { username: user.username || user.email });
    ok(res, { deleted: true });
  } catch (error) {
    next(error);
  }
});

r.get('/audit', async (req, res, next) => {
  try {
    ok(res, await audit.latest(Number(req.query.limit) || 8));
  } catch (error) {
    next(error);
  }
});

r.get('/reportes/pendientes-oc-mes/export', async (req, res, next) => {
  try {
    const periodo = periodoActual();
    const buffer = await exportPendientesOCMes(periodo);
    audit.log(req, 'exportar_pendientes_oc_mes', 'solicitud_factura', periodo, { periodo });
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="Pendientes_OC_${periodo}.xlsx"`);
    res.send(Buffer.from(buffer));
  } catch (e) {
    next(e);
  }
});

module.exports = r;
