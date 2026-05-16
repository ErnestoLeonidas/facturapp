const path = require('path');
const ExcelJS = require('exceljs');
const db = require('../db');
const { v4: uuidv4 } = require('uuid');
const { ok, fail } = require('../middleware/envelope');
const { requireRole } = require('../services/auth');
const audit = require('../services/audit');
const { generarFolio } = require('../utils/folio');

const r = require('express').Router();
const EMPRESA = 'MAS_CONSULTORES';

r.use(requireRole('admin'));

function clean(value) {
  if (value === undefined || value === null) return '';
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value.toISOString().slice(0, 10);
  if (value.text) return clean(value.text);
  if (value.result !== undefined) return clean(value.result);
  if (value.richText) return clean(value.richText.map(part => part.text).join(''));
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

function parseNumber(value) {
  const s = clean(value);
  if (!s) return null;
  const normalized = s.replace(/[^\d,.-]/g, '').replace(/\./g, '').replace(',', '.');
  const n = Number(normalized);
  return Number.isFinite(n) ? n : null;
}

const MESES = [
  'ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO',
  'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'
];

function mesNumero(value) {
  const n = Number(value);
  if (Number.isInteger(n) && n >= 1 && n <= 12) return n;
  const dateMatch = clean(value).match(/^\d{4}-(\d{1,2})-\d{1,2}/);
  if (dateMatch) return Number(dateMatch[1]);
  const normalized = key(value).toUpperCase();
  const idx = MESES.findIndex(m => key(m).toUpperCase() === normalized);
  return idx >= 0 ? idx + 1 : null;
}

function periodo(row, anioDefault) {
  const fecha = clean(row.fecha_estimada_facturacion || row.fecha_solicitud);
  const dateMatch = fecha.match(/^(\d{4})-(\d{1,2})-\d{1,2}/);
  const anio = Number(clean(row.anio)) || (dateMatch && Number(dateMatch[1])) || Number(anioDefault) || new Date().getFullYear();
  const mes = mesNumero(row.mes || row.fecha_estimada_facturacion || row.fecha_solicitud);
  if (!anio || !mes) return null;
  return `${anio}-${String(mes).padStart(2, '0')}`;
}

function rowsFromWorksheet(ws) {
  const headerRow = ws.getRow(1);
  const headers = [];
  for (let c = 1; c <= ws.columnCount; c += 1) headers.push(key(headerRow.getCell(c).value));

  return Array.from({ length: ws.rowCount - 1 }, (_, i) => i + 2)
    .map(rowNumber => {
      const row = ws.getRow(rowNumber);
      const out = { fila: rowNumber };
      headers.forEach((header, idx) => {
        if (header) out[header] = clean(row.getCell(idx + 1).value);
      });
      return out;
    })
    .filter(row => Object.entries(row).some(([name, value]) => name !== 'fila' && value));
}

function clienteId(row) {
  const id = clean(row.cliente_id);
  if (id && db.prepare('SELECT id FROM cliente WHERE id = ? AND estado = ?').get(id, 'Activo')) return id;

  const nombre = clean(row.cliente || row.nombre_cliente || row.cliente_nombre);
  if (!nombre) return null;
  const found = db.prepare(`
    SELECT id FROM cliente
    WHERE estado = 'Activo'
      AND upper(nombre_corto) = upper(?)
    LIMIT 1
  `).get(nombre);
  return found && found.id;
}

function cpDeCliente(row, cliId) {
  const ref = clean(row.cp_id || row.codigo || row.codigo_cp);
  if (!ref || !cliId) return null;
  return db.prepare(`
    SELECT id, codigo, nombre
    FROM cp
    WHERE cliente_id = ?
      AND activo = 1
      AND (id = ? OR codigo = ?)
    LIMIT 1
  `).get(cliId, ref, ref);
}

function coordinadorSugerido(clienteId, cpNombre) {
  if (cpNombre) {
    const exacto = db.prepare(`
      SELECT co.id
      FROM cliente_coordinador cc
      JOIN coordinador co ON co.id = cc.coordinador_id
      WHERE cc.cliente_id = ?
        AND cc.cp_nombre = ?
        AND cc.activo = 1
        AND co.activo = 1
      LIMIT 1
    `).get(clienteId, cpNombre);
    if (exacto) return exacto.id;
  }
  const general = db.prepare(`
    SELECT co.id
    FROM cliente_coordinador cc
    JOIN coordinador co ON co.id = cc.coordinador_id
    WHERE cc.cliente_id = ?
      AND (cc.cp_nombre IS NULL OR cc.cp_nombre = '')
      AND cc.activo = 1
      AND co.activo = 1
    LIMIT 1
  `).get(clienteId);
  return general && general.id;
}

function receptoresCliente(clienteId) {
  return db.prepare('SELECT id FROM receptor WHERE cliente_id = ? AND activo = 1').all(clienteId);
}

r.get('/usuarios', (req, res) => {
  ok(res, db.prepare('SELECT id, nombre, email, rol, activo, created_at FROM app_user ORDER BY rol, email').all());
});

r.get('/audit', (req, res) => {
  ok(res, audit.latest(Number(req.query.limit) || 80));
});

r.post('/carga-anual', async (req, res) => {
  const filePath = req.body && req.body.path;
  const anio = Number(req.body && req.body.anio) || new Date().getFullYear();
  if (!filePath) return fail(res, 'VALIDATION_ERROR', 'Debes indicar path del Excel en el servidor');

  const resolved = path.resolve(filePath);
  const wb = new ExcelJS.Workbook();
  try {
    await wb.xlsx.readFile(resolved);
  } catch (e) {
    return fail(res, 'EXCEL_READ_FAILED', 'No se pudo leer el Excel: ' + e.message);
  }

  const ws = wb.getWorksheet(req.body.sheet || 1);
  if (!ws) return fail(res, 'VALIDATION_ERROR', 'No se encontro la hoja indicada');

  const rows = rowsFromWorksheet(ws);
  const batchId = uuidv4();
  const stats = { filas_leidas: rows.length, creadas: 0, omitidas: [] };

  const tx = db.transaction(() => {
    rows.forEach(row => {
      const tipo = key(row.tipo_impuesto || 'AFECTO_IVA').toUpperCase();
      if (tipo && tipo !== 'AFECTO_IVA') {
        stats.omitidas.push({ fila: row.fila, motivo: 'Solo se carga AFECTO_IVA' });
        return;
      }

      const cliId = clienteId(row);
      const cp = cpDeCliente(row, cliId);
      const per = periodo(row, anio);
      if (!cliId || !cp || !per) {
        stats.omitidas.push({ fila: row.fila, motivo: 'Falta cliente, CP o periodo valido' });
        return;
      }

      const exists = db.prepare(`
        SELECT sf.id
        FROM solicitud_factura sf
        JOIN solicitud_cp sc ON sc.solicitud_id = sf.id
        WHERE sf.is_delete = 0
          AND sf.empresa_emisora = ?
          AND sf.cliente_id = ?
          AND sf.periodo = ?
          AND sc.cp_id = ?
        LIMIT 1
      `).get(EMPRESA, cliId, per, cp.id);
      if (exists) {
        stats.omitidas.push({ fila: row.fila, motivo: 'Ya existe solicitud activa para cliente/periodo/CP' });
        return;
      }

      const montoUf = parseNumber(row.monto_uf);
      const id = uuidv4();
      const folio = generarFolio();
      const glosa = clean(row.glosa || row.nombre || row.producto || cp.nombre || 'Solicitud anual');
      const coordId = coordinadorSugerido(cliId, cp.nombre);
      const fechaSolicitud = clean(row.fecha_solicitud || row.fecha_estimada_facturacion) || `${per}-01`;
      const observaciones = [
        clean(row.observaciones),
        `Carga anual admin ${anio}`,
        `CP ${cp.codigo}`
      ].filter(Boolean).join('\n');

      db.prepare(`
        INSERT INTO solicitud_factura (
          id, folio, tipo, cliente_id, coordinador_id, empresa_emisora, periodo, fecha_solicitud,
          glosa, moneda_base, monto_neto_clp, monto_iva_clp, monto_total_clp, observaciones,
          estado, admin_batch_id, origen_admin
        )
        VALUES (?, ?, 'mensual', ?, ?, ?, ?, ?, ?, 'UF', 0, 0, 0, ?, 'PENDIENTE OC / HES', ?, ?)
      `).run(id, folio, cliId, coordId || null, EMPRESA, per, fechaSolicitud, glosa, observaciones, batchId, resolved);

      db.prepare('INSERT INTO solicitud_cp (id, solicitud_id, cp_id, monto_uf, monto_clp, orden) VALUES (?, ?, ?, ?, 0, 0)')
        .run(uuidv4(), id, cp.id, montoUf);

      receptoresCliente(cliId).forEach(rec => {
        db.prepare('INSERT OR IGNORE INTO solicitud_receptor (solicitud_id, receptor_id) VALUES (?, ?)')
          .run(id, rec.id);
      });

      db.prepare('INSERT INTO historial_estado (id, solicitud_id, estado_desde, estado_hacia, usuario, comentario) VALUES (?, ?, ?, ?, ?, ?)')
        .run(uuidv4(), id, null, 'PENDIENTE OC / HES', req.user.email, `Creada por carga anual admin ${batchId}`);

      stats.creadas += 1;
    });
  });
  tx();

  audit.log(req, 'carga_anual_excel', 'solicitud_factura', batchId, {
    path: resolved,
    anio,
    ...stats
  });
  ok(res, { batch_id: batchId, anio, source: resolved, stats }, 201);
});

module.exports = r;
