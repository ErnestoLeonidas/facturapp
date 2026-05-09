const db = require('../db');
const { getClients } = require('./google');
const { rowsFromValues } = require('./googleSheetsSync');
const { applyMasterRows } = require('./excelMasterFacturacion');

const DEFAULT_MASTER_ID = '1es6Jk8hmqwz7gcrz84jI_u8dDvfO2l9W5W5g9sf-wF4';

const SHEETS = {
  Facturacion: {
    range: 'Facturacion!A:E',
    headers: ['cliente_id', 'razon_social', 'rut', 'giro', 'direccion']
  },
  Receptores: {
    range: 'Receptores!A:E',
    headers: ['receptor_id', 'cliente_id', 'nombre', 'email', 'cargo']
  },
  Coordinadores: {
    range: 'Coordinadores!A:C',
    headers: ['coordinador_id', 'nombre', 'email']
  },
  Empresa_emisora: {
    range: 'Empresa_emisora!A:D',
    headers: ['codigo', 'razon_social', 'rut', 'giro']
  }
};

function spreadsheetId() {
  return process.env.GOOGLE_SHEETS_MASTER_FACTURACION_ID || DEFAULT_MASTER_ID;
}

function rowsWithHeaders(headers, rows) {
  return [headers, ...rows.map(row => headers.map(header => row[header] ?? ''))];
}

async function pullMasterFacturacion() {
  const { sheets } = await getClients();
  const id = spreadsheetId();
  const response = await sheets.spreadsheets.values.batchGet({
    spreadsheetId: id,
    ranges: Object.values(SHEETS).map(sheet => sheet.range),
    majorDimension: 'ROWS'
  });

  const valueRanges = response.data.valueRanges || [];
  const datasets = {
    clientes: rowsFromValues(valueRanges[0]?.values || []),
    receptores: rowsFromValues(valueRanges[1]?.values || []),
    coordinadores: rowsFromValues(valueRanges[2]?.values || []),
    empresas: rowsFromValues(valueRanges[3]?.values || [])
  };
  const stats = applyMasterRows(datasets);
  const filasLeidas = Object.values(datasets).reduce((sum, rows) => sum + rows.length, 0);

  return {
    dataset: 'base_facturacion_master',
    direction: 'pull',
    spreadsheetId: id,
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

function masterRowsFromDb() {
  return {
    Facturacion: db.prepare(`
      SELECT id as cliente_id, razon_social, rut, giro, direccion
      FROM cliente
      WHERE estado = 'Activo'
      ORDER BY id
    `).all(),
    Receptores: db.prepare(`
      SELECT id as receptor_id, cliente_id, nombre, email, cargo
      FROM receptor
      WHERE activo = 1
      ORDER BY cliente_id, nombre
    `).all(),
    Coordinadores: db.prepare(`
      SELECT id as coordinador_id, nombre, email
      FROM coordinador
      WHERE activo = 1
      ORDER BY lower(trim(nombre))
    `).all(),
    Empresa_emisora: db.prepare(`
      SELECT codigo, razon_social, rut, giro
      FROM empresa_emisora
      ORDER BY codigo
    `).all()
  };
}

async function replaceSheetValues(sheets, id, sheetName, rows) {
  const sheet = SHEETS[sheetName];
  await sheets.spreadsheets.values.clear({
    spreadsheetId: id,
    range: sheet.range
  });
  await sheets.spreadsheets.values.update({
    spreadsheetId: id,
    range: sheet.range,
    valueInputOption: 'RAW',
    requestBody: {
      values: rowsWithHeaders(sheet.headers, rows)
    }
  });
}

async function pushMasterFacturacion() {
  const { sheets } = await getClients();
  const id = spreadsheetId();
  const data = masterRowsFromDb();

  for (const sheetName of Object.keys(SHEETS)) {
    await replaceSheetValues(sheets, id, sheetName, data[sheetName]);
  }

  const filasProcesadas = Object.values(data).reduce((sum, rows) => sum + rows.length, 0);
  return {
    dataset: 'base_facturacion_master',
    direction: 'push',
    spreadsheetId: id,
    sheets: Object.fromEntries(Object.entries(data).map(([name, rows]) => [name, rows.length])),
    filas_leidas: filasProcesadas,
    filas_procesadas: filasProcesadas,
    stats: {
      clientes: data.Facturacion.length,
      receptores: data.Receptores.length,
      coordinadores: data.Coordinadores.length,
      empresas_emisoras: data.Empresa_emisora.length
    }
  };
}

module.exports = {
  pullMasterFacturacion,
  pushMasterFacturacion
};
