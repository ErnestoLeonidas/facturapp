const axios = require('axios');
const ExcelJS = require('exceljs');
const db = require('../db');
const { rowsFromValues } = require('./googleSheetsSync');
const { upperName } = require('../db-normalize-names');

const DEFAULT_MASTER_ID = '1es6Jk8hmqwz7gcrz84jI_u8dDvfO2l9W5W5g9sf-wF4';

function clean(value) {
  if (value === undefined || value === null) return null;
  const s = String(value).trim();
  return s === '' ? null : s;
}

function nombreDesdeClienteId(clienteId) {
  return clean(clienteId)
    ?.replace(/^cli[_-]?/i, '')
    .replace(/[_-]+/g, ' ')
    .toUpperCase();
}

function normalizarContacto(nombreRaw, emailRaw) {
  let nombre = clean(nombreRaw);
  let email = clean(emailRaw);

  if (email && email.includes(':')) {
    const [possibleName, possibleEmail] = email.split(':');
    if (!nombre) nombre = clean(possibleName);
    email = clean(possibleEmail);
  }

  if (!nombre && email) nombre = email.split('@')[0].replace(/[._-]+/g, ' ');
  return { nombre: upperName(nombre), email };
}

function cellValue(cell) {
  const value = cell.value;
  if (value === null || value === undefined) return null;
  if (value.text) return value.text;
  if (value.result !== undefined) return value.result;
  if (value.richText) return value.richText.map(part => part.text).join('');
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return value;
}

function worksheetValues(ws) {
  const values = [];
  ws.eachRow({ includeEmpty: false }, row => {
    const rowValues = [];
    for (let i = 1; i <= ws.columnCount; i += 1) rowValues.push(cellValue(row.getCell(i)));
    values.push(rowValues);
  });
  return values;
}

async function workbookFromPublicGoogleSheet(spreadsheetId) {
  const id = spreadsheetId || process.env.GOOGLE_SHEETS_MASTER_FACTURACION_ID || DEFAULT_MASTER_ID;
  const url = `https://docs.google.com/spreadsheets/d/${id}/export?format=xlsx`;
  const response = await axios.get(url, { responseType: 'arraybuffer' });
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.load(Buffer.from(response.data));
  return { wb, source: url, spreadsheetId: id };
}

function getRows(wb, sheetName) {
  const ws = wb.getWorksheet(sheetName);
  if (!ws) {
    const err = new Error(`Hoja requerida no encontrada: ${sheetName}`);
    err.code = 'MASTER_SHEET_NOT_FOUND';
    throw err;
  }
  return rowsFromValues(worksheetValues(ws));
}

function upsertCliente(row) {
  const id = clean(row.cliente_id);
  if (!id) return false;

  const existing = db.prepare('SELECT id FROM cliente WHERE id = ?').get(id);
  if (existing) {
    db.prepare(`
      UPDATE cliente
      SET razon_social = COALESCE(?, razon_social),
          rut = COALESCE(?, rut),
          giro = COALESCE(?, giro),
          direccion = COALESCE(?, direccion),
          estado = CASE WHEN estado IS NULL OR estado = '' THEN 'Activo' ELSE estado END,
          updated_at = datetime('now')
      WHERE id = ?
    `).run(upperName(clean(row.razon_social)), clean(row.rut), clean(row.giro), clean(row.direccion), id);
    return true;
  }

  db.prepare(`
    INSERT INTO cliente (id, nombre_corto, razon_social, rut, giro, direccion, frecuencia, estado)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    upperName(clean(row.razon_social) || nombreDesdeClienteId(id) || id),
    upperName(clean(row.razon_social)),
    clean(row.rut),
    clean(row.giro),
    clean(row.direccion),
    'Mensual',
    'Activo'
  );
  return true;
}

function upsertReceptor(row) {
  const clienteId = clean(row.cliente_id);
  const { nombre, email } = normalizarContacto(row.nombre, row.email);
  if (!clienteId || !nombre || !email) return false;
  const cliente = db.prepare('SELECT id FROM cliente WHERE id = ?').get(clienteId);
  if (!cliente) return false;

  const receptorId = clean(row.receptor_id);
  const existing = receptorId
    ? db.prepare('SELECT id FROM receptor WHERE id = ?').get(receptorId)
    : db.prepare('SELECT id FROM receptor WHERE cliente_id = ? AND email = ?').get(clienteId, email);

  if (existing) {
    db.prepare(`
      UPDATE receptor
      SET cliente_id = ?,
          nombre = ?,
          email = ?,
          cargo = ?,
          activo = 1
      WHERE id = ?
    `).run(clienteId, nombre, email, clean(row.cargo), existing.id);
    return true;
  }

  db.prepare(`
    INSERT INTO receptor (id, cliente_id, nombre, email, cargo)
    VALUES (?, ?, ?, ?, ?)
  `).run(receptorId || require('uuid').v4(), clienteId, nombre, email, clean(row.cargo));
  return true;
}

function upsertCoordinador(row) {
  const id = clean(row.coordinador_id);
  const nombre = upperName(clean(row.nombre));
  if (!id || !nombre) return false;

  const existing = db.prepare('SELECT id FROM coordinador WHERE id = ?').get(id);
  if (existing) {
    db.prepare('UPDATE coordinador SET nombre = ?, email = COALESCE(?, email), activo = 1 WHERE id = ?')
      .run(nombre, clean(row.email), id);
    return true;
  }

  db.prepare('INSERT INTO coordinador (id, nombre, email) VALUES (?, ?, ?)')
    .run(id, nombre, clean(row.email));
  return true;
}

function upsertEmpresa(row) {
  const codigo = clean(row.codigo);
  const razonSocial = clean(row.razon_social);
  if (!codigo || !razonSocial) return false;

  const existing = db.prepare('SELECT codigo FROM empresa_emisora WHERE codigo = ?').get(codigo);
  if (existing) {
    db.prepare(`
      UPDATE empresa_emisora
      SET razon_social = ?,
          rut = COALESCE(?, rut),
          giro = COALESCE(?, giro)
      WHERE codigo = ?
    `).run(upperName(razonSocial), clean(row.rut), clean(row.giro), codigo);
    return true;
  }

  db.prepare(`
    INSERT INTO empresa_emisora (codigo, razon_social, rut, giro, afecto_iva, iva_pct)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(codigo, upperName(razonSocial), clean(row.rut), clean(row.giro), ['MAS_CAPACITACION', 'MAS_CAPACITACIONES'].includes(codigo) ? 0 : 1, 0.19);
  return true;
}

function applyMasterRows({ clientes, receptores, coordinadores, empresas }) {
  const stats = {
    clientes: 0,
    receptores: 0,
    coordinadores: 0,
    empresas_emisoras: 0
  };

  const tx = db.transaction(() => {
    clientes.forEach(row => { if (upsertCliente(row)) stats.clientes += 1; });
    coordinadores.forEach(row => { if (upsertCoordinador(row)) stats.coordinadores += 1; });
    empresas.forEach(row => { if (upsertEmpresa(row)) stats.empresas_emisoras += 1; });
    receptores.forEach(row => { if (upsertReceptor(row)) stats.receptores += 1; });
  });
  tx();
  return stats;
}

async function importFromPublicGoogleSheet(spreadsheetId) {
  const { wb, source, spreadsheetId: id } = await workbookFromPublicGoogleSheet(spreadsheetId);
  const datasets = {
    clientes: getRows(wb, 'Facturacion'),
    receptores: getRows(wb, 'Receptores'),
    coordinadores: getRows(wb, 'Coordinadores'),
    empresas: getRows(wb, 'Empresa_emisora')
  };
  const stats = applyMasterRows(datasets);
  const filasLeidas = Object.values(datasets).reduce((sum, rows) => sum + rows.length, 0);

  return {
    dataset: 'base_facturacion_master',
    spreadsheetId: id,
    source,
    sheets: {
      Facturacion: datasets.clientes.length,
      Receptores: datasets.receptores.length,
      Coordinadores: datasets.coordinadores.length,
      Empresa_emisora: datasets.empresas.length
    },
    filas_leidas: filasLeidas,
    filas_procesadas: Object.values(stats).reduce((sum, n) => sum + n, 0),
    stats
  };
}

module.exports = { importFromPublicGoogleSheet, applyMasterRows };
