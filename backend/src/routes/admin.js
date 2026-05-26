const crypto = require('crypto');
const ExcelJS = require('exceljs');
const db = require('../db');
const { v4: uuidv4 } = require('uuid');
const { ok, fail } = require('../middleware/envelope');
const { requireRole } = require('../services/auth');
const audit = require('../services/audit');

const r = require('express').Router();
const PASSWORD_ITERATIONS = 120000;

r.use(requireRole('admin'));
r.use('/proyecciones', require('./admin-proyecciones'));

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

function pendientesOCMes(periodo) {
  return db.prepare(`
    SELECT
      c.nombre_corto AS cliente,
      cp.codigo AS cp,
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
  `).all(periodo);
}

async function exportPendientesOCMes(periodo) {
  const rows = pendientesOCMes(periodo);
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'FactuFlow';
  workbook.created = new Date();
  const ws = workbook.addWorksheet('Pendientes OC');

  ws.columns = [
    { header: 'Cliente', key: 'cliente', width: 28 },
    { header: 'CP', key: 'cp', width: 14 },
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

  ws.autoFilter = 'A1:E1';
  ws.views = [{ state: 'frozen', ySplit: 1 }];
  return workbook.xlsx.writeBuffer();
}

function passwordFields(username, password) {
  const salt = `facturapp-${normalizeUsername(username)}-${crypto.randomBytes(8).toString('hex')}`;
  return { salt, hash: hashPassword(password, salt) };
}

r.get('/usuarios', (req, res) => {
  ok(res, db.prepare('SELECT id, nombre, username, email, rol, activo, created_at FROM app_user ORDER BY rol, username, email').all());
});

r.post('/usuarios', (req, res) => {
  const nombre = clean(req.body && req.body.nombre);
  const username = normalizeUsername(req.body && req.body.username);
  const rol = clean(req.body && req.body.rol) || 'usuario';
  const password = clean(req.body && req.body.password);
  if (!nombre || !username || !password) return fail(res, 'VALIDATION_ERROR', 'Nombre, usuario y password son requeridos');
  if (!['admin', 'usuario'].includes(rol)) return fail(res, 'VALIDATION_ERROR', 'Rol no valido');
  if (password.length < 6) return fail(res, 'VALIDATION_ERROR', 'El password debe tener al menos 6 caracteres');

  const passwordData = passwordFields(username, password);
  const existing = db.prepare(`
    SELECT id FROM app_user
    WHERE lower(COALESCE(username, email)) = lower(?) OR lower(email) = lower(?)
    LIMIT 1
  `).get(username, username);

  if (existing) {
    db.prepare(`
      UPDATE app_user
      SET nombre = ?, username = ?, email = ?, rol = ?, password_hash = ?, password_salt = ?, activo = 1, updated_at = datetime('now')
      WHERE id = ?
    `).run(nombre, username, username, rol, passwordData.hash, passwordData.salt, existing.id);
  } else {
    db.prepare(`
      INSERT INTO app_user (id, nombre, username, email, rol, password_hash, password_salt, activo)
      VALUES (?, ?, ?, ?, ?, ?, ?, 1)
    `).run(uuidv4(), nombre, username, username, rol, passwordData.hash, passwordData.salt);
  }

  const user = db.prepare('SELECT id, nombre, username, email, rol, activo, created_at FROM app_user WHERE lower(username) = lower(?) LIMIT 1').get(username);
  audit.log(req, 'crear_usuario', 'app_user', user.id, { username, rol });
  ok(res, user, 201);
});

r.put('/usuarios/:id/password', (req, res) => {
  const user = db.prepare('SELECT id, username, email FROM app_user WHERE id = ?').get(req.params.id);
  if (!user) return fail(res, 'NOT_FOUND', 'Usuario no encontrado', null, 404);
  const password = clean(req.body && req.body.password);
  if (password.length < 6) return fail(res, 'VALIDATION_ERROR', 'El password debe tener al menos 6 caracteres');
  const passwordData = passwordFields(user.username || user.email, password);
  db.prepare(`
    UPDATE app_user
    SET password_hash = ?, password_salt = ?, updated_at = datetime('now')
    WHERE id = ?
  `).run(passwordData.hash, passwordData.salt, user.id);
  db.prepare("UPDATE app_session SET revoked_at = datetime('now') WHERE user_id = ?").run(user.id);
  audit.log(req, 'cambiar_password_usuario', 'app_user', user.id, { username: user.username || user.email });
  ok(res, { changed: true });
});

r.delete('/usuarios/:id', (req, res) => {
  const user = db.prepare('SELECT id, username, email FROM app_user WHERE id = ?').get(req.params.id);
  if (!user) return fail(res, 'NOT_FOUND', 'Usuario no encontrado', null, 404);
  if (req.user && req.user.id === user.id) return fail(res, 'VALIDATION_ERROR', 'No puedes eliminar tu propio usuario activo');
  db.prepare("UPDATE app_user SET activo = 0, updated_at = datetime('now') WHERE id = ?").run(user.id);
  db.prepare("UPDATE app_session SET revoked_at = datetime('now') WHERE user_id = ?").run(user.id);
  audit.log(req, 'eliminar_usuario', 'app_user', user.id, { username: user.username || user.email });
  ok(res, { deleted: true });
});

r.get('/audit', (req, res) => {
  ok(res, audit.latest(Number(req.query.limit) || 80));
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
