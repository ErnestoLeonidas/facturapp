const fs = require('fs');
const path = require('path');
const axios = require('axios');
const ExcelJS = require('exceljs');
const { rowsFromValues, applyBaseFacturacionRows } = require('./googleSheetsSync');

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
    for (let i = 1; i <= ws.columnCount; i += 1) {
      rowValues.push(cellValue(row.getCell(i)));
    }
    values.push(rowValues);
  });
  return values;
}

async function workbookFromFile(filePath) {
  const resolved = path.isAbsolute(filePath) ? filePath : path.resolve(process.cwd(), filePath);
  if (!fs.existsSync(resolved)) {
    const err = new Error(`Archivo Excel no encontrado: ${resolved}`);
    err.code = 'EXCEL_FILE_NOT_FOUND';
    throw err;
  }
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(resolved);
  return { wb, source: resolved };
}

async function workbookFromPublicGoogleSheet(spreadsheetId) {
  const id = spreadsheetId || process.env.GOOGLE_SHEETS_BASE_FACTURACION_ID;
  if (!id) {
    const err = new Error('GOOGLE_SHEETS_BASE_FACTURACION_ID no configurado.');
    err.code = 'EXCEL_CONFIG_MISSING';
    throw err;
  }

  const url = `https://docs.google.com/spreadsheets/d/${id}/export?format=xlsx`;
  const response = await axios.get(url, { responseType: 'arraybuffer' });
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.load(Buffer.from(response.data));
  return { wb, source: url };
}

function selectWorksheet(wb, sheetName) {
  if (sheetName) {
    const ws = wb.getWorksheet(sheetName);
    if (!ws) {
      const err = new Error(`Hoja no encontrada en Excel: ${sheetName}`);
      err.code = 'EXCEL_SHEET_NOT_FOUND';
      throw err;
    }
    return ws;
  }
  return wb.worksheets[0];
}

async function importWorkbook(loader, options = {}) {
  const { wb, source } = await loader();
  const ws = selectWorksheet(wb, options.sheetName || process.env.BASE_FACTURACION_XLSX_SHEET);
  const values = worksheetValues(ws);
  const rows = rowsFromValues(values);
  const stats = applyBaseFacturacionRows(rows, options.source || source);
  return {
    dataset: 'base_facturacion_excel',
    source,
    sheet: ws.name,
    filas_leidas: rows.length,
    filas_procesadas: rows.length - stats.omitidas.length,
    stats
  };
}

function importFromFile(filePath, options = {}) {
  const configured = filePath || process.env.BASE_FACTURACION_XLSX_PATH || path.resolve(__dirname, '..', '..', '..', 'archivos', 'base-facturacion.xlsx');
  return importWorkbook(() => workbookFromFile(configured), options);
}

function importFromPublicGoogleSheet(spreadsheetId, options = {}) {
  return importWorkbook(() => workbookFromPublicGoogleSheet(spreadsheetId), options);
}

module.exports = { importFromFile, importFromPublicGoogleSheet };
