require('dotenv').config();
require('./db');
const fs = require('fs');
const path = require('path');
const ExcelJS = require('exceljs');
const db = require('./db');
const { v4: uuidv4 } = require('uuid');
const { backupDatabase } = require('./db-backup');
const { clientKey } = require('./db-clean-clients');
const { upperName } = require('./db-normalize-names');

const DEFAULT_FILE = 'C:/Users/gcons/Downloads/proyecciones_limpias_uf.xlsx';
const SOURCE = 'proyecciones_limpias_uf';
const TIPOS_IMPUESTO = new Set(['AFECTO_IVA']);

function clean(value) {
  if (value === undefined || value === null) return null;
  if (value.text) return clean(value.text);
  if (value.result !== undefined) return clean(value.result);
  if (value.richText) return clean(value.richText.map(part => part.text).join(''));
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

function slug(value) {
  return key(value) || uuidv4();
}

function parseNumber(value) {
  const s = clean(value);
  if (!s) return null;
  const onlyNumber = s.replace(/[^\d,.-]/g, '');
  const normalized = onlyNumber.includes(',')
    ? onlyNumber.replace(/\./g, '').replace(',', '.')
    : onlyNumber;
  const n = Number(normalized);
  return Number.isFinite(n) ? n : null;
}

function parseArgs(argv) {
  const args = { file: null, anio: new Date().getFullYear() };
  argv.forEach(arg => {
    if (arg.startsWith('--anio=')) args.anio = Number(arg.slice('--anio='.length));
    else if (!arg.startsWith('--')) args.file = arg;
  });
  if (!Number.isInteger(args.anio)) throw new Error('El parametro --anio debe ser numerico.');
  return args;
}

function cellValue(row, columnNumber) {
  return clean(row.getCell(columnNumber).value);
}

function rowsFromWorksheet(ws) {
  const headers = [];
  const headerRow = ws.getRow(1);
  for (let c = 1; c <= ws.columnCount; c += 1) headers.push(key(headerRow.getCell(c).value));
  const indexes = Object.fromEntries(headers.map((header, i) => [header, i + 1]));

  return Array.from({ length: ws.rowCount - 1 }, (_, i) => i + 2)
    .map(rowNumber => {
      const row = ws.getRow(rowNumber);
      const out = { fila: rowNumber };
      Object.entries(indexes).forEach(([header, columnNumber]) => {
        out[header] = cellValue(row, columnNumber);
      });
      return out;
    })
    .filter(row => Object.entries(row).some(([name, value]) => name !== 'fila' && value));
}

function clienteIdFor(nombre) {
  const normalized = clientKey(nombre);
  const existing = db.prepare('SELECT id, nombre_corto FROM cliente ORDER BY CASE WHEN id LIKE \'cli_%\' THEN 0 ELSE 1 END, created_at, id')
    .all()
    .find(cliente => clientKey(cliente.nombre_corto) === normalized);

  if (existing) return existing.id;

  const id = `cli_${normalized}`;
  db.prepare(`
    INSERT INTO cliente (id, nombre_corto, frecuencia, estado)
    VALUES (?, ?, 'Mensual', 'Activo')
    ON CONFLICT(id) DO UPDATE SET
      nombre_corto = excluded.nombre_corto,
      estado = CASE WHEN cliente.estado IS NULL OR cliente.estado = '' THEN 'Activo' ELSE cliente.estado END,
      updated_at = datetime('now')
  `).run(id, upperName(nombre));
  return id;
}

function upsertProducto(nombre) {
  const productName = upperName(clean(nombre));
  if (!productName) return null;
  const existing = db.prepare('SELECT id FROM producto WHERE nombre = ? AND activo = 1').get(productName);
  if (existing) return existing.id;

  const id = uuidv4();
  db.prepare('INSERT INTO producto (id, nombre) VALUES (?, ?)').run(id, productName);
  return id;
}

function upsertCP({ codigo, producto, clienteId }) {
  const existing = db.prepare('SELECT id, tipo_cp FROM cp WHERE codigo = ?').get(codigo);
  if (existing) {
    db.prepare(`
      UPDATE cp
      SET nombre = COALESCE(?, nombre),
          cliente_id = ?,
          activo = 1
      WHERE id = ?
    `).run(upperName(producto), clienteId, existing.id);
    return existing;
  }

  const id = uuidv4();
  db.prepare(`
    INSERT INTO cp (id, codigo, nombre, cliente_id)
    VALUES (?, ?, ?, ?)
  `).run(id, codigo, upperName(producto), clienteId);
  return { id, tipo_cp: null };
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
    source: SOURCE,
    codigo: clean(row.codigo),
    producto: upperName(clean(row.producto)),
    tipo_impuesto: clean(row.tipo_impuesto),
    mes: clean(row.mes),
    estado: clean(row.estado),
    monto_uf: parseNumber(row.monto_uf),
    monto_clp: parseNumber(row.monto_clp)
  }));
}

function upsertProyeccion({ row, clienteId, tipoCp, anio }) {
  const id = clean(row.id) || [
    clienteId,
    clean(row.codigo),
    clean(row.producto),
    clean(row.tipo_impuesto),
    anio,
    clean(row.mes)
  ].filter(Boolean).join('|');

  db.prepare(`
    INSERT INTO proyeccion_facturacion (
      id, cliente_id, cliente, codigo, nombre, tipo_cp, tipo_impuesto, mes, anio,
      monto_uf, moneda, estado, observaciones, codigo_facturacion, source, updated_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    ON CONFLICT(id) DO UPDATE SET
      cliente_id = excluded.cliente_id,
      cliente = excluded.cliente,
      codigo = excluded.codigo,
      nombre = excluded.nombre,
      tipo_cp = COALESCE(excluded.tipo_cp, proyeccion_facturacion.tipo_cp),
      tipo_impuesto = excluded.tipo_impuesto,
      mes = excluded.mes,
      anio = excluded.anio,
      monto_uf = excluded.monto_uf,
      moneda = excluded.moneda,
      estado = excluded.estado,
      observaciones = excluded.observaciones,
      codigo_facturacion = excluded.codigo_facturacion,
      source = excluded.source,
      updated_at = datetime('now')
  `).run(
    id,
    clienteId,
    upperName(clean(row.cliente)),
    clean(row.codigo),
    upperName(clean(row.producto)),
    tipoCp || null,
    clean(row.tipo_impuesto),
    clean(row.mes),
    anio,
    parseNumber(row.monto_uf),
    'UF',
    clean(row.estado),
    parseNumber(row.monto_clp) === null ? null : `monto_clp=${parseNumber(row.monto_clp)}`,
    null,
    SOURCE
  );
}

async function importProyeccionesUf(filePath, options = {}) {
  const resolved = path.resolve(filePath || DEFAULT_FILE);
  if (!fs.existsSync(resolved)) throw new Error(`Archivo no encontrado: ${resolved}`);

  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(resolved);
  const ws = wb.getWorksheet(options.sheet || 1);
  if (!ws) throw new Error('No se encontro la hoja de proyecciones.');

  const rows = rowsFromWorksheet(ws);
  const stats = {
    filas_leidas: rows.length,
    filas_procesadas: 0,
    clientes_upsert: 0,
    cps_upsert: 0,
    productos_upsert: 0,
    proyecciones_upsert: 0,
    omitidas: []
  };

  const tx = db.transaction(() => {
    rows.forEach(row => {
      const missing = [];
      if (!clean(row.cliente)) missing.push('cliente');
      if (!clean(row.codigo)) missing.push('codigo');
      if (!clean(row.producto)) missing.push('producto');
      if (!TIPOS_IMPUESTO.has(clean(row.tipo_impuesto))) missing.push('tipo_impuesto debe ser AFECTO_IVA');
      if (!clean(row.mes)) missing.push('mes');
      if (missing.length) {
        stats.omitidas.push({ fila: row.fila, missing });
        return;
      }

      const clienteId = clienteIdFor(row.cliente);
      stats.clientes_upsert += 1;

      const cp = upsertCP({ codigo: clean(row.codigo), producto: clean(row.producto), clienteId });
      stats.cps_upsert += 1;

      const productoId = upsertProducto(row.producto);
      if (productoId) {
        stats.productos_upsert += 1;
        linkClienteProducto(clienteId, productoId, row);
      }

      upsertProyeccion({ row, clienteId, tipoCp: cp.tipo_cp, anio: options.anio });
      stats.proyecciones_upsert += 1;
      stats.filas_procesadas += 1;
    });
  });
  tx();

  return {
    dataset: SOURCE,
    source: resolved,
    sheet: ws.name,
    anio: options.anio,
    stats
  };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const backup = backupDatabase('pre-import-proyecciones-uf');
  if (!backup.skipped) console.log(`Backup previo: ${backup.db}`);
  else console.log(`Backup previo omitido: ${backup.reason}`);

  const result = await importProyeccionesUf(args.file || DEFAULT_FILE, { anio: args.anio });
  console.log(JSON.stringify(result, null, 2));
}

if (require.main === module) {
  main().catch(error => {
    console.error(error.message || error);
    if (process.env.NODE_ENV === 'development') console.error(error.stack);
    process.exit(1);
  });
}

module.exports = { importProyeccionesUf };
