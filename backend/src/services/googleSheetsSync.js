const db = require('../db');
const { v4: uuidv4 } = require('uuid');
const { getClients } = require('./google');

const DEFAULT_BASE_RANGE = 'A:N';

function clean(value) {
  if (value === undefined || value === null) return null;
  const s = String(value).trim();
  return s === '' ? null : s;
}

function key(value) {
  return clean(value)
    ?.normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '');
}

function parseNumber(value) {
  const s = clean(value);
  if (!s) return null;
  const normalized = s.replace(/\./g, '').replace(',', '.').replace(/[^\d.-]/g, '');
  const n = Number(normalized);
  return Number.isFinite(n) ? n : null;
}

function rowToObject(headers, row) {
  const obj = {};
  headers.forEach((h, i) => {
    obj[h] = clean(row[i]);
  });
  return obj;
}

function rowsFromValues(values) {
  if (!values || values.length < 2) return [];
  const headers = values[0].map(key);
  return values.slice(1)
    .map(row => rowToObject(headers, row))
    .filter(row => Object.values(row).some(Boolean));
}

function getBaseConfig() {
  return {
    spreadsheetId: process.env.GOOGLE_SHEETS_BASE_FACTURACION_ID || '1YFn9QfyIympuqS7zeF2jtfSjOTwBI184CP4mkRUB4V0',
    range: process.env.GOOGLE_SHEETS_BASE_FACTURACION_RANGE || DEFAULT_BASE_RANGE
  };
}

function getProyeccionesConfig() {
  return {
    spreadsheetId: process.env.GOOGLE_SHEETS_PROYECCIONES_ID,
    range: process.env.GOOGLE_SHEETS_PROYECCIONES_RANGE || 'A:Z'
  };
}

async function batchGet(spreadsheetId, ranges) {
  const { sheets } = await getClients();
  const response = await sheets.spreadsheets.values.batchGet({
    spreadsheetId,
    ranges,
    majorDimension: 'ROWS'
  });
  return response.data.valueRanges || [];
}

function upsertCliente(row) {
  const nombre = clean(row.cliente);
  if (!nombre) return null;

  const externalId = clean(row.cliente_id);
  const existing = (externalId && db.prepare('SELECT * FROM cliente WHERE id = ?').get(externalId))
    || db.prepare('SELECT * FROM cliente WHERE nombre_corto = ?').get(nombre);

  if (existing) {
    db.prepare(`
      UPDATE cliente
      SET nombre_corto = ?,
          estado = CASE WHEN estado IS NULL OR estado = '' THEN 'Activo' ELSE estado END,
          updated_at = datetime('now')
      WHERE id = ?
    `).run(nombre, existing.id);
    return existing.id;
  }

  const id = externalId || uuidv4();
  db.prepare(`
    INSERT INTO cliente (id, nombre_corto, frecuencia, estado)
    VALUES (?, ?, ?, ?)
  `).run(id, nombre, 'Mensual', 'Activo');
  return id;
}

function upsertProducto(nombre) {
  const productName = clean(nombre);
  if (!productName) return null;
  const existing = db.prepare('SELECT id FROM producto WHERE nombre = ? AND activo = 1').get(productName);
  if (existing) return existing.id;

  const id = uuidv4();
  db.prepare('INSERT INTO producto (id, nombre) VALUES (?, ?)').run(id, productName);
  return id;
}

function linkClienteProducto(clienteId, productoId, row) {
  if (!clienteId || !productoId) return;
  db.prepare(`
    INSERT INTO cliente_producto (id, cliente_id, producto_id, condiciones)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(cliente_id, producto_id) DO UPDATE SET
      activo = 1,
      condiciones = excluded.condiciones
  `).run(uuidv4(), clienteId, productoId, JSON.stringify({
    source: clean(row.source) || 'google_sheets_base_facturacion',
    tipo_impuesto: clean(row.tipo_impuesto),
    moneda: clean(row.moneda),
    monto_uf: parseNumber(row.monto_uf),
    estado: clean(row.estado),
    observaciones: clean(row.observaciones),
    fecha_estimada_facturacion: clean(row.fecha_estimada_facturacion),
    anio: clean(row.anio),
    mes: clean(row.mes)
  }));
}

function upsertCP(row, clienteId) {
  const codigo = clean(row.codigo);
  if (!codigo || !clienteId) return null;

  const nombre = clean(row.nombre);
  const existing = db.prepare('SELECT id FROM cp WHERE codigo = ?').get(codigo);
  if (existing) {
    db.prepare(`
      UPDATE cp
      SET nombre = COALESCE(?, nombre),
          tipo_cp = COALESCE(?, tipo_cp),
          cliente_id = ?,
          activo = 1
      WHERE id = ?
    `).run(nombre, clean(row.tipo_cp), clienteId, existing.id);
    return existing.id;
  }

  const id = uuidv4();
  db.prepare(`
    INSERT INTO cp (id, codigo, nombre, tipo_cp, area, cliente_id)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(id, codigo, nombre, clean(row.tipo_cp), null, clienteId);
  return id;
}

function applyBaseFacturacionRows(rows, source = 'google_sheets_base_facturacion') {
  const stats = {
    clientes_creados_o_actualizados: 0,
    cps_creados_o_actualizados: 0,
    productos_creados_o_actualizados: 0,
    omitidas: []
  };

  const tx = db.transaction(() => {
    rows.forEach((row, index) => {
      const missing = [];
      if (!clean(row.cliente)) missing.push('cliente');
      if (!clean(row.codigo)) missing.push('codigo');
      if (!clean(row.nombre)) missing.push('nombre');
      if (missing.length) {
        stats.omitidas.push({ fila: index + 2, missing });
        return;
      }

      const clienteId = upsertCliente(row);
      if (!clienteId) return;
      stats.clientes_creados_o_actualizados += 1;

      const cpId = upsertCP(row, clienteId);
      if (cpId) stats.cps_creados_o_actualizados += 1;

      const productoId = upsertProducto(row.nombre);
      if (productoId) {
        stats.productos_creados_o_actualizados += 1;
        linkClienteProducto(clienteId, productoId, { ...row, source });
      }
    });
  });
  tx();
  return stats;
}

async function syncBaseFacturacion() {
  const { spreadsheetId, range } = getBaseConfig();
  const [valueRange] = await batchGet(spreadsheetId, [range]);
  const rows = rowsFromValues(valueRange.values || []);
  const stats = applyBaseFacturacionRows(rows);
  return {
    dataset: 'base_facturacion',
    spreadsheetId,
    range,
    filas_leidas: rows.length,
    filas_procesadas: rows.length - stats.omitidas.length,
    stats
  };
}

async function syncProyecciones() {
  const { spreadsheetId, range } = getProyeccionesConfig();
  if (!spreadsheetId) {
    const err = new Error('GOOGLE_SHEETS_PROYECCIONES_ID no configurado.');
    err.code = 'SHEETS_CONFIG_MISSING';
    throw err;
  }

  const [valueRange] = await batchGet(spreadsheetId, [range]);
  const rows = rowsFromValues(valueRange.values || []);
  return {
    dataset: 'proyecciones',
    spreadsheetId,
    range,
    filas_leidas: rows.length,
    filas_procesadas: 0,
    stats: {
      message: 'Lectura validada. Mapeo de proyecciones pendiente de definicion de columnas.'
    }
  };
}

async function sync(dataset) {
  if (!dataset || dataset === 'base_facturacion' || dataset === 'clientes' || dataset === 'cp') {
    return syncBaseFacturacion();
  }
  if (dataset === 'proyecciones') return syncProyecciones();

  const err = new Error(`Dataset no soportado: ${dataset}`);
  err.code = 'VALIDATION_ERROR';
  throw err;
}

module.exports = { sync, syncBaseFacturacion, syncProyecciones, rowsFromValues, applyBaseFacturacionRows };
