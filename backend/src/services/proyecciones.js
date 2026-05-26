const fs = require('fs');
const path = require('path');
const ExcelJS = require('exceljs');
const { v4: uuidv4 } = require('uuid');
const db = require('../db');

const MESES = [
  'ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO',
  'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'
];

const COLUMNAS_EXPORT = [
  'IVA', 'MS', 'PROYECTO', 'CLIENTE', 'DP', 'CP', 'PRODUCTO', 'TIPO DE CP', 'VENTA',
  ...MESES
];

function clean(value) {
  if (value === undefined || value === null) return '';
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value.toISOString().slice(0, 10);
  if (value.text) return clean(value.text);
  if (value.result !== undefined) return clean(value.result);
  if (value.richText) return clean(value.richText.map(part => part.text).join(''));
  return String(value)
    .replace(/[\u00a0\u200b-\u200d\ufeff]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function key(value) {
  return clean(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function parseNumber(value) {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (value && typeof value.result === 'number') return Number.isFinite(value.result) ? value.result : null;
  const s = clean(value);
  if (!s) return null;
  let numeric = s.replace(/[^\d,.-]/g, '');
  const hasComma = numeric.includes(',');
  const hasDot = numeric.includes('.');
  if (hasComma && hasDot) {
    numeric = numeric.replace(/\./g, '').replace(',', '.');
  } else if (hasComma) {
    numeric = numeric.replace(',', '.');
  } else if (hasDot) {
    const parts = numeric.split('.');
    const decimalLike = parts.length === 2 && parts[1].length > 0 && parts[1].length <= 6;
    numeric = decimalLike ? numeric : numeric.replace(/\./g, '');
  }
  const normalized = numeric;
  const n = Number(normalized);
  return Number.isFinite(n) ? n : null;
}

function roundClpUf(value) {
  const n = parseNumber(value);
  return n == null ? null : Math.round(n);
}

function formulaText(value) {
  if (!value || typeof value !== 'object') return '';
  return clean(value.formula || value.sharedFormula || '');
}

function projectedUfFromCell(value) {
  const formula = formulaText(value);
  if (!formula) return null;
  const candidates = formula
    .match(/\d+(?:[.,]\d+)?/g)
    ?.map(parseNumber)
    .filter(n => n && n >= 30000 && n <= 60000) || [];
  if (!candidates.length) return null;
  return candidates.reduce((sum, n) => sum + n, 0) / candidates.length;
}

function upsertProjectedUf(anio, mes, values) {
  const nums = values.filter(n => n && Number.isFinite(n));
  if (!nums.length) return;
  const uf = roundClpUf(nums.reduce((sum, n) => sum + n, 0) / nums.length);
  const existing = db.prepare('SELECT id, origen_valor FROM proyeccion_uf WHERE anio = ? AND mes = ?').get(anio, mes);
  if (existing) {
    db.prepare(`
      UPDATE proyeccion_uf
      SET uf_proyectada = ?, updated_at = datetime('now')
      WHERE id = ? AND origen_valor <> 'MANUAL'
    `).run(uf, existing.id);
    return;
  }
  db.prepare(`
    INSERT INTO proyeccion_uf (id, anio, mes, uf_proyectada, origen_valor)
    VALUES (?, ?, ?, ?, 'PROYECTADA')
  `).run(uuidv4(), anio, mes, uf);
}

function normalizeMs(value) {
  const s = clean(value).toUpperCase().replace(/\s+/g, '');
  const match = s.match(/MS[-_]?(\d+)/);
  return match ? `MS${match[1]}` : s;
}

function normalizeCliente(value) {
  return clean(value).toUpperCase();
}

function normalizeIva(value) {
  const v = key(value);
  if (v === 'AFECTO' || v === 'AFECTO_IVA') return 'AFECTO_IVA';
  if (v === 'EXENTO' || v === 'EXENTO_IVA') return 'EXENTO_IVA';
  if (v === 'MIXTO') return 'MIXTO';
  return v || '';
}

function isSummaryRow(base) {
  const text = [base.cliente, base.proyecto, base.ms, base.producto, base.tipo_cp]
    .map(key)
    .join(' ');
  return /\bTOTAL_PLATAFORMAS\b|\bMETA\b|\bDIFERENCIA\b/.test(text);
}

function summaryRowAmount(row) {
  const values = [];
  row.eachCell({ includeEmpty: false }, cell => {
    const value = parseNumber(cell.value);
    if (value != null && value > 0) values.push(value);
  });
  return values.length ? values.reduce((sum, value) => sum + value, 0) : null;
}

function validMs(value) {
  return /^MS\d+/i.test(normalizeMs(value || ''));
}

function versionMetaFromSource(source, fallbackAnio) {
  const base = path.basename(clean(source || ''), path.extname(clean(source || '')));
  const match = base.match(/^\s*(\d+)\.\s*Proyecciones\s+Plataformas\s+(\d{1,2})[.-](\d{1,2})[.-](20\d{2})\s*$/i);
  if (!match) return null;
  const numero = Number(match[1]);
  const dd = String(Number(match[2])).padStart(2, '0');
  const mm = String(Number(match[3])).padStart(2, '0');
  const yyyy = Number(match[4]);
  return {
    numero,
    nombre: `${numero}. Proyecciones Plataformas ${dd}.${mm}.${yyyy}`,
    fecha_version: `${yyyy}-${mm}-${dd}`,
    anio: yyyy || fallbackAnio
  };
}

function inferAnio(filePath, explicitAnio, worksheetName) {
  const explicit = Number(explicitAnio);
  if (Number.isInteger(explicit) && explicit >= 2000) return explicit;
  const text = `${worksheetName || ''} ${path.basename(filePath || '')}`;
  const match = text.match(/\b(20\d{2})\b/);
  return match ? Number(match[1]) : new Date().getFullYear();
}

function findClienteId(cliente) {
  if (!cliente) return null;
  const row = db.prepare(`
    SELECT id FROM cliente
    WHERE estado = 'Activo'
      AND upper(nombre_corto) = upper(?)
    LIMIT 1
  `).get(cliente);
  return row && row.id;
}

function findMainWorksheet(workbook, preferredName) {
  if (preferredName) {
    const requested = workbook.getWorksheet(preferredName);
    if (requested) return requested;
  }
  return workbook.worksheets.find(ws => key(ws.name).includes('VENTA_PLATAFORMAS')) || workbook.worksheets[0];
}

function findHeaderRow(ws) {
  for (let rowNumber = 1; rowNumber <= Math.min(ws.rowCount, 20); rowNumber += 1) {
    const row = ws.getRow(rowNumber);
    const headers = [];
    for (let col = 1; col <= ws.columnCount; col += 1) headers.push(key(row.getCell(col).value));
    if (headers.includes('IVA') && headers.includes('ENERO') && headers.includes('CLIENTE')) {
      return rowNumber;
    }
  }
  return 1;
}

function headerMap(ws, rowNumber) {
  const row = ws.getRow(rowNumber);
  const map = {};
  for (let col = 1; col <= ws.columnCount; col += 1) {
    const header = key(row.getCell(col).value);
    if (header) map[header] = col;
  }
  return map;
}

function getByHeader(row, headers, name) {
  const col = headers[key(name)];
  return col ? row.getCell(col).value : null;
}

function readAuxiliaryRows(ws) {
  const rows = [];
  for (let rowNumber = 1; rowNumber <= ws.rowCount; rowNumber += 1) {
    const row = ws.getRow(rowNumber);
    const values = [];
    for (let col = 1; col <= ws.columnCount; col += 1) values.push(clean(row.getCell(col).value));
    if (values.some(Boolean)) rows.push({ fila: rowNumber, values });
  }
  return rows;
}

function rowBase(row, headers, anio, source, rowNumber) {
  const cliente = normalizeCliente(getByHeader(row, headers, 'CLIENTE'));
  return {
    anio,
    iva: normalizeIva(getByHeader(row, headers, 'IVA')),
    ms: normalizeMs(getByHeader(row, headers, 'MS')),
    proyecto: clean(getByHeader(row, headers, 'PROYECTO')),
    cliente_id: findClienteId(cliente),
    cliente,
    dp: clean(getByHeader(row, headers, 'DP')),
    cp: clean(getByHeader(row, headers, 'CP')),
    producto: clean(getByHeader(row, headers, 'PRODUCTO')),
    tipo_cp: clean(getByHeader(row, headers, 'TIPO DE CP')),
    venta: parseNumber(getByHeader(row, headers, 'VENTA')),
    source,
    source_row: rowNumber,
    orden_fila: rowNumber
  };
}

function upsertProjection(row) {
  const existing = db.prepare(`
    SELECT id FROM proyeccion
    WHERE anio = ? AND mes = ?
      AND ifnull(ms, '') = ifnull(?, '')
      AND ifnull(cliente, '') = ifnull(?, '')
      AND ifnull(proyecto, '') = ifnull(?, '')
      AND ifnull(producto, '') = ifnull(?, '')
      AND ifnull(tipo_cp, '') = ifnull(?, '')
      AND ifnull(cp, '') = ifnull(?, '')
    LIMIT 1
  `).get(row.anio, row.mes, row.ms, row.cliente, row.proyecto, row.producto, row.tipo_cp, row.cp);

  if (existing) {
    db.prepare(`
      UPDATE proyeccion
      SET iva=?, cliente_id=?, dp=?, venta=?, monto=?, monto_uf=?, monto_clp_referencia=?,
          estado=COALESCE(?, estado), source=?, source_row=?, updated_at=datetime('now')
      WHERE id=?
    `).run(row.iva, row.cliente_id, row.dp, row.venta, row.monto, row.monto_uf,
      row.monto_clp_referencia, row.estado, row.source, row.source_row, existing.id);
    return 'actualizadas';
  }

  db.prepare(`
    INSERT INTO proyeccion (
      id, anio, iva, ms, proyecto, cliente_id, cliente, dp, cp, producto, tipo_cp,
      venta, mes, monto, monto_uf, monto_clp_referencia, estado, source, source_row
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(uuidv4(), row.anio, row.iva, row.ms, row.proyecto, row.cliente_id, row.cliente,
    row.dp, row.cp, row.producto, row.tipo_cp, row.venta, row.mes, row.monto,
    row.monto_uf, row.monto_clp_referencia, row.estado, row.source, row.source_row);
  return 'creadas';
}

async function importFromExcel({ filePath, fileBuffer, fileName, anio, sheet }) {
  if (!filePath && !fileBuffer) throw new Error('Debes adjuntar un Excel');
  const resolved = filePath ? path.resolve(filePath) : clean(fileName || 'archivo-subido.xlsx');
  if (filePath && !fs.existsSync(resolved)) throw new Error('El archivo no existe');
  const workbook = new ExcelJS.Workbook();
  if (fileBuffer) await workbook.xlsx.load(fileBuffer);
  else await workbook.xlsx.readFile(resolved);
  const ws = findMainWorksheet(workbook, sheet);
  if (!ws) throw new Error('No se encontro hoja principal');

  const detectedAnio = inferAnio(resolved, anio, ws.name);
  const headerRow = findHeaderRow(ws);
  const headers = headerMap(ws, headerRow);
  const stats = { filas_leidas: 0, creadas: 0, actualizadas: 0, omitidas: [], auxiliares: 0 };
  const projectedUfByMonth = Array.from({ length: 12 }, () => []);

  const tx = db.transaction(() => {
    for (let rowNumber = headerRow + 1; rowNumber <= ws.rowCount; rowNumber += 1) {
      const row = ws.getRow(rowNumber);
      const base = rowBase(row, headers, detectedAnio, resolved, rowNumber);
      if (!base.ms && !base.cliente && !base.proyecto) continue;
      stats.filas_leidas += 1;

      let hadMonth = false;
      MESES.forEach((mesNombre, index) => {
        const cellValue = getByHeader(row, headers, mesNombre);
        const monto = parseNumber(cellValue);
        if (monto === null) return;
        hadMonth = true;
        const ufProyectada = projectedUfFromCell(cellValue);
        if (ufProyectada) projectedUfByMonth[index].push(ufProyectada);
        const result = upsertProjection({
          ...base,
          mes: index + 1,
          monto,
          monto_clp_referencia: monto,
          monto_uf: ufProyectada ? monto / ufProyectada : null,
          estado: clean(getByHeader(row, headers, 'ESTADO')) || null
        });
        stats[result] += 1;
      });

      if (!hadMonth) stats.omitidas.push({ fila: rowNumber, motivo: 'Sin montos mensuales' });
      if (!base.iva) stats.omitidas.push({ fila: rowNumber, motivo: 'Sin tipo de IVA definido' });
    }

    db.prepare('DELETE FROM proyeccion_auxiliar WHERE anio = ? AND source = ?').run(detectedAnio, resolved);
    workbook.worksheets
      .filter(aux => ['HOJA1', 'HOJA2'].includes(key(aux.name)))
      .forEach(aux => {
        readAuxiliaryRows(aux).forEach(auxRow => {
          db.prepare(`
            INSERT INTO proyeccion_auxiliar (id, anio, hoja, fila, data_json, source)
            VALUES (?, ?, ?, ?, ?, ?)
          `).run(uuidv4(), detectedAnio, aux.name, auxRow.fila, JSON.stringify(auxRow.values), resolved);
          stats.auxiliares += 1;
        });
      });

    projectedUfByMonth.forEach((values, index) => upsertProjectedUf(detectedAnio, index + 1, values));
  });
  tx();

  return { anio: detectedAnio, hoja: ws.name, header_row: headerRow, source: resolved, stats };
}

function filtersWhere(query) {
  const where = [];
  const params = {};
  const fields = ['anio', 'cliente', 'ms', 'producto', 'tipo_cp', 'iva', 'mes', 'estado'];
  fields.forEach(field => {
    if (query[field] !== undefined && query[field] !== '') {
      where.push(`${field} = @${field}`);
      params[field] = query[field];
    }
  });
  if (query.clienteId) {
    where.push('cliente_id = @clienteId');
    params.clienteId = query.clienteId;
  }
  return { sql: where.length ? `WHERE ${where.join(' AND ')}` : '', params };
}

function listProyecciones(query = {}) {
  const { sql, params } = filtersWhere(query);
  const limit = Math.min(Number(query.limit) || 250, 1000);
  const rows = db.prepare(`
    SELECT * FROM proyeccion
    ${sql}
    ORDER BY cliente, ms, proyecto, mes
    LIMIT ${limit}
  `).all(params);

  return {
    items: rows,
    total: db.prepare(`SELECT COUNT(*) total FROM proyeccion ${sql}`).get(params).total,
    filtros: {
      anios: db.prepare('SELECT DISTINCT anio FROM proyeccion ORDER BY anio DESC').all().map(r => r.anio),
      clientes: db.prepare("SELECT DISTINCT cliente, cliente_id FROM proyeccion WHERE cliente IS NOT NULL AND cliente <> '' ORDER BY cliente").all(),
      ms: db.prepare("SELECT DISTINCT ms FROM proyeccion WHERE ms IS NOT NULL AND ms <> '' ORDER BY ms").all().map(r => r.ms),
      productos: db.prepare("SELECT DISTINCT producto FROM proyeccion WHERE producto IS NOT NULL AND producto <> '' ORDER BY producto").all().map(r => r.producto),
      tiposCp: db.prepare("SELECT DISTINCT tipo_cp FROM proyeccion WHERE tipo_cp IS NOT NULL AND tipo_cp <> '' ORDER BY tipo_cp").all().map(r => r.tipo_cp),
      estados: db.prepare("SELECT DISTINCT estado FROM proyeccion WHERE estado IS NOT NULL AND estado <> '' ORDER BY estado").all().map(r => r.estado)
    }
  };
}

function clientes() {
  return db.prepare(`
    SELECT
      COALESCE(cliente_id, cliente) id,
      cliente_id,
      cliente,
      COUNT(DISTINCT ms) ms_count,
      COUNT(DISTINCT CASE WHEN iva = 'AFECTO_IVA' THEN ms END) afecto_ms_count,
      SUM(COALESCE(monto, 0)) total
    FROM proyeccion
    WHERE cliente IS NOT NULL AND cliente <> ''
    GROUP BY COALESCE(cliente_id, cliente), cliente_id, cliente
    ORDER BY cliente
  `).all();
}

function msPorCliente(clienteId) {
  return db.prepare(`
    SELECT ms, COUNT(*) registros, SUM(COALESCE(monto, 0)) total
    FROM proyeccion
    WHERE (cliente_id = ? OR cliente = ?)
      AND ms IS NOT NULL AND ms <> ''
    GROUP BY ms
    ORDER BY ms
  `).all(clienteId, clienteId);
}

function configuredUfFija(anio, options = {}) {
  const msValues = String(options.ms || '').split(',').map(normalizeMs).filter(Boolean);
  const where = ['anio = @anio', 'uf_fija_default IS NOT NULL'];
  const params = { anio };
  if (options.clienteId) {
    where.push("(cliente_id = @clienteId OR cliente_id IS NULL OR cliente_id = '')");
    params.clienteId = options.clienteId;
  }
  if (msValues.length) {
    where.push(`(ms IN (${msValues.map((_, i) => `@ms${i}`).join(',')}) OR ms IS NULL OR ms = '')`);
    msValues.forEach((value, i) => { params[`ms${i}`] = value; });
  }
  const row = db.prepare(`
    SELECT uf_fija_default
    FROM proyeccion_configuracion
    WHERE ${where.join(' AND ')}
    ORDER BY
      CASE WHEN cliente_id IS NOT NULL AND cliente_id <> '' THEN 0 ELSE 1 END,
      CASE WHEN ms IS NOT NULL AND ms <> '' THEN 0 ELSE 1 END
    LIMIT 1
  `).get(params);
  return row ? row.uf_fija_default : null;
}

function ufRows(anio, options = {}) {
  const byMonth = new Map(db.prepare('SELECT * FROM proyeccion_uf WHERE anio = ?').all(anio).map(row => [row.mes, row]));
  const ufFijaDefault = configuredUfFija(anio, options);
  return MESES.map((nombre, index) => byMonth.get(index + 1) || {
    anio, mes: index + 1, mes_nombre: nombre, uf_fija: null, uf_proyectada: null, uf_manual: null, origen_valor: 'PROYECTADA'
  }).map(row => ({
    ...row,
    uf_fija: row.uf_fija || ufFijaDefault,
    uf_proyectada: roundClpUf(row.uf_proyectada),
    mes_nombre: MESES[row.mes - 1]
  }));
}

function grafico(query = {}) {
  const anio = Number(query.anio) || new Date().getFullYear();
  const msValues = String(query.ms || '').split(',').map(normalizeMs).filter(Boolean);
  const where = ['anio = @anio'];
  const params = { anio };
  if (query.clienteId) {
    where.push('(cliente_id = @clienteId OR cliente = @clienteId)');
    params.clienteId = query.clienteId;
  }
  if (query.iva) {
    where.push('iva = @iva');
    params.iva = query.iva;
  }
  if (msValues.length) {
    where.push(`ms IN (${msValues.map((_, i) => `@ms${i}`).join(',')})`);
    msValues.forEach((value, i) => { params[`ms${i}`] = value; });
  }

  const montos = db.prepare(`
    SELECT mes, SUM(COALESCE(monto_uf, 0)) monto_uf, SUM(COALESCE(monto, 0)) monto_clp
    FROM proyeccion
    WHERE ${where.join(' AND ')}
    GROUP BY mes
  `).all(params).reduce((map, row) => {
    map[row.mes] = row;
    return map;
  }, {});

  return ufRows(anio, query).map(row => {
    const monto = montos[row.mes] || { monto_uf: 0, monto_clp: 0 };
    const ufBase = row.uf_proyectada || row.uf_fija || null;
    const montoUf = Number(monto.monto_uf) || (ufBase ? Number(monto.monto_clp || 0) / ufBase : 0);
    return {
      mes: row.mes,
      mes_nombre: row.mes_nombre,
      uf_fija: row.uf_fija,
      uf_proyectada: row.uf_proyectada,
      uf_manual: row.uf_manual,
      origen_valor: row.origen_valor,
      monto_uf: montoUf,
      monto_clp_fija: row.uf_fija ? montoUf * row.uf_fija : null,
      monto_clp_proyectada: row.uf_proyectada ? montoUf * row.uf_proyectada : null
    };
  });
}

function upsertUf(rows) {
  const tx = db.transaction(() => {
    rows.forEach(input => {
      const anio = Number(input.anio);
      const mes = Number(input.mes);
      if (!anio || mes < 1 || mes > 12) return;
      const existing = db.prepare('SELECT id FROM proyeccion_uf WHERE anio = ? AND mes = ?').get(anio, mes);
      const origen = input.uf_manual !== undefined && input.uf_manual !== null && input.uf_manual !== '' ? 'MANUAL' : (input.origen_valor || 'PROYECTADA');
      if (existing) {
        db.prepare(`
          UPDATE proyeccion_uf
          SET uf_fija=?, uf_proyectada=?, uf_manual=?, origen_valor=?, observaciones=?, updated_at=datetime('now')
          WHERE id=?
        `).run(parseNumber(input.uf_fija), roundClpUf(input.uf_proyectada), parseNumber(input.uf_manual),
          origen, clean(input.observaciones), existing.id);
      } else {
        db.prepare(`
          INSERT INTO proyeccion_uf (id, anio, mes, uf_fija, uf_proyectada, uf_manual, origen_valor, observaciones)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).run(uuidv4(), anio, mes, parseNumber(input.uf_fija), roundClpUf(input.uf_proyectada),
          parseNumber(input.uf_manual), origen, clean(input.observaciones));
      }
    });
  });
  tx();
  return ufRows(Number(rows[0] && rows[0].anio) || new Date().getFullYear());
}

function saveConfiguracion(input) {
  const anio = Number(input.anio);
  const clienteId = clean(input.cliente_id);
  const ms = normalizeMs(input.ms);
  const modo = key(input.modo_uf || 'PROYECTADA');
  const ufFija = parseNumber(input.uf_fija_default);
  const existing = db.prepare(`
    SELECT id FROM proyeccion_configuracion
    WHERE ifnull(cliente_id, '') = ifnull(?, '')
      AND ifnull(ms, '') = ifnull(?, '')
      AND anio = ?
  `).get(clienteId, ms, anio);
  if (existing) {
    db.prepare("UPDATE proyeccion_configuracion SET modo_uf=?, uf_fija_default=?, updated_at=datetime('now') WHERE id=?")
      .run(modo, ufFija, existing.id);
  } else {
    db.prepare('INSERT INTO proyeccion_configuracion (id, cliente_id, ms, anio, modo_uf, uf_fija_default) VALUES (?, ?, ?, ?, ?, ?)')
      .run(uuidv4(), clienteId || null, ms || null, anio, modo, ufFija);
  }
  return db.prepare('SELECT * FROM proyeccion_configuracion WHERE anio = ? ORDER BY cliente_id, ms').all(anio);
}

function recomendaciones(query = {}) {
  const anio = Number(query.anio) || new Date().getFullYear();
  const recs = [];
  const missingUf = db.prepare('SELECT COUNT(*) total FROM proyeccion_uf WHERE anio = ? AND uf_proyectada IS NOT NULL').get(anio).total;
  if (missingUf < 12) recs.push('Hay meses sin UF proyectada.');
  const sinMonto = db.prepare('SELECT COUNT(*) total FROM proyeccion WHERE anio = ? AND (monto IS NULL OR monto = 0)').get(anio).total;
  if (sinMonto) recs.push('Hay filas sin monto en meses.');
  const sinIva = db.prepare("SELECT COUNT(*) total FROM proyeccion WHERE anio = ? AND (iva IS NULL OR iva = '')").get(anio).total;
  if (sinIva) recs.push('Hay registros sin tipo de IVA definido.');
  const topCliente = db.prepare(`
    SELECT cliente, SUM(COALESCE(monto, 0)) total
    FROM proyeccion WHERE anio = ?
    GROUP BY cliente ORDER BY total DESC LIMIT 1
  `).get(anio);
  if (topCliente && topCliente.total > 0) recs.push(`Este cliente concentra alto monto proyectado: ${topCliente.cliente}.`);
  const diffs = grafico({ anio });
  if (diffs.some(row => row.uf_fija && row.uf_proyectada && Math.abs(row.uf_fija - row.uf_proyectada) >= 500)) {
    recs.push('Este MS o cliente tiene alta diferencia entre UF fija y proyectada.');
  }
  recs.push('Revisar valores futuros porque la UF proyectada es estimativa.');
  return recs;
}

function groupedRows(query = {}) {
  const { sql, params } = filtersWhere(query);
  const rows = db.prepare(`SELECT * FROM proyeccion ${sql} ORDER BY cliente, ms, proyecto, producto, tipo_cp, mes`).all(params);
  const map = new Map();
  rows.forEach(row => {
    const keyRow = [row.iva, row.ms, row.proyecto, row.cliente, row.dp, row.cp, row.producto, row.tipo_cp, row.venta].join('|');
    if (!map.has(keyRow)) {
      map.set(keyRow, { ...row, meses: Array(12).fill(null), total_anual: 0 });
    }
    const item = map.get(keyRow);
    item.meses[row.mes - 1] = row;
    item.total_anual += Number(row.monto || 0);
  });
  return Array.from(map.values());
}

function amountForExport(monthRow, ufByMonth, moneda, modoUf) {
  if (!monthRow) return null;
  const uf = ufByMonth[monthRow.mes] || {};
  const selectedUf = modoUf === 'FIJA' ? uf.uf_fija : modoUf === 'PROYECTADA' ? uf.uf_proyectada : (uf.uf_manual || uf.uf_proyectada || uf.uf_fija);
  const monto = Number(monthRow.monto || 0);
  const montoUf = Number(monthRow.monto_uf || 0);
  if (moneda === 'UF') {
    if (montoUf) return montoUf;
    return selectedUf ? monto / selectedUf : null;
  }
  if (moneda === 'CLP_UF_FIJA' || modoUf === 'FIJA') return montoUf && uf.uf_fija ? montoUf * uf.uf_fija : monto;
  if (moneda === 'CLP_UF_PROYECTADA' || modoUf === 'PROYECTADA') return montoUf && uf.uf_proyectada ? montoUf * uf.uf_proyectada : monto;
  return monto;
}

function todayDots() {
  const now = new Date();
  return [
    String(now.getDate()).padStart(2, '0'),
    String(now.getMonth() + 1).padStart(2, '0'),
    now.getFullYear()
  ].join('.');
}

function versionName(numero, fecha = todayDots()) {
  return `${numero}. Proyecciones Plataformas ${fecha}`;
}

function activeVersion(anio) {
  return db.prepare('SELECT * FROM proyeccion_version WHERE anio = ? AND activa = 1 LIMIT 1').get(anio);
}

function nextVersionNumber(anio) {
  const row = db.prepare('SELECT COALESCE(MAX(numero), 0) + 1 AS next FROM proyeccion_version WHERE anio = ?').get(anio);
  return row.next || 1;
}

function createEmptyVersion({ anio, descripcion, origen = 'APP', createdBy = 'sistema', activa = 0 }) {
  const numero = nextVersionNumber(anio);
  const fecha = todayDots();
  const id = uuidv4();
  db.prepare(`
    INSERT INTO proyeccion_version (id, numero, nombre, fecha_version, anio, descripcion, activa, origen, created_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, numero, versionName(numero, fecha), fecha.split('.').reverse().join('-'), anio, clean(descripcion), activa ? 1 : 0, origen, createdBy);
  return db.prepare('SELECT * FROM proyeccion_version WHERE id = ?').get(id);
}

function createVersion(input) {
  const anio = Number(input.anio) || new Date().getFullYear();
  const numero = Number(input.numero) || nextVersionNumber(anio);
  const fechaVersion = clean(input.fecha_version) || new Date().toISOString().slice(0, 10);
  const fechaDots = fechaVersion.split('-').reverse().join('.');
  const id = uuidv4();
  const nombre = clean(input.nombre) || versionName(numero, fechaDots);
  db.prepare(`
    INSERT INTO proyeccion_version (id, numero, nombre, fecha_version, anio, descripcion, activa, origen, created_by, meta_anual)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, numero, nombre, fechaVersion, anio, clean(input.descripcion), input.activa ? 1 : 0, clean(input.origen || 'APP'), clean(input.createdBy || 'sistema'), parseNumber(input.meta_anual));
  return db.prepare('SELECT * FROM proyeccion_version WHERE id = ?').get(id);
}

function ensureVersion(anio) {
  const existing = activeVersion(anio);
  if (existing) return existing;
  return db.transaction(() => {
    const version = createEmptyVersion({ anio, descripcion: 'Version inicial', activa: 1 });
    return version;
  })();
}

function versionById(id) {
  return db.prepare('SELECT * FROM proyeccion_version WHERE id = ?').get(id);
}

function resolveVersion(query = {}) {
  if (query.versionId) {
    const version = versionById(query.versionId);
    if (version) return version;
  }
  return ensureVersion(Number(query.anio) || new Date().getFullYear());
}

function ensureMonthlyRows(versionId) {
  const items = db.prepare('SELECT id FROM proyeccion_item WHERE version_id = ?').all(versionId);
  const insert = db.prepare(`
    INSERT OR IGNORE INTO proyeccion_mensual (id, item_id, mes, modo_calculo, origen_valor)
    VALUES (?, ?, ?, 'UF_PROYECTADA', 'APP')
  `);
  const tx = db.transaction(() => {
    items.forEach(item => {
      for (let mes = 1; mes <= 12; mes += 1) insert.run(uuidv4(), item.id, mes);
    });
  });
  tx();
}

function versiones(anio) {
  const params = {};
  const where = anio ? 'WHERE anio = @anio' : '';
  if (anio) params.anio = Number(anio);
  return db.prepare(`
    SELECT
      v.*,
      (SELECT COUNT(*) FROM proyeccion_item pi WHERE pi.version_id = v.id) AS items,
      (SELECT COUNT(*) FROM proyeccion_mensual pm JOIN proyeccion_item pi ON pi.id = pm.item_id WHERE pi.version_id = v.id AND pm.monto_clp IS NOT NULL) AS celdas_con_valor
    FROM proyeccion_version v
    ${where}
    ORDER BY anio DESC, numero DESC
  `).all(params);
}

function activarVersion(id) {
  const version = versionById(id);
  if (!version) throw new Error('Versión no encontrada');
  const tx = db.transaction(() => {
    db.prepare('UPDATE proyeccion_version SET activa = 0 WHERE anio = ?').run(version.anio);
    db.prepare('UPDATE proyeccion_version SET activa = 1 WHERE id = ?').run(id);
  });
  tx();
  return versionById(id);
}

function duplicarVersion(id, user = 'sistema') {
  const source = versionById(id);
  if (!source) throw new Error('Version no encontrada');
  return db.transaction(() => {
    const target = createEmptyVersion({
      anio: source.anio,
      descripcion: `Duplicada desde ${source.nombre}`,
      origen: 'APP',
      createdBy: user,
      activa: 0
    });
    const itemMap = new Map();
    db.prepare('SELECT * FROM proyeccion_item WHERE version_id = ? ORDER BY COALESCE(orden_fila, 999999), id').all(source.id).forEach(item => {
      const newId = uuidv4();
      itemMap.set(item.id, newId);
      db.prepare(`
        INSERT INTO proyeccion_item (id, version_id, iva, proyecto, ms, cliente_id, cliente, dp, cp, producto, tipo_cp, venta, orden_fila)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(newId, target.id, item.iva, item.proyecto, item.ms, item.cliente_id, item.cliente, item.dp, item.cp, item.producto, item.tipo_cp, item.venta, item.orden_fila);
    });
    db.prepare(`
      SELECT pm.*
      FROM proyeccion_mensual pm
      JOIN proyeccion_item pi ON pi.id = pm.item_id
      WHERE pi.version_id = ?
    `).all(source.id).forEach(row => {
      db.prepare(`
        INSERT INTO proyeccion_mensual (
          id, item_id, mes, cantidad_uf, uf_fija, uf_proyectada, uf_manual, monto_clp, monto_clp_manual,
          modo_calculo, submodo_uf, origen_valor, es_manual, observacion
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(uuidv4(), itemMap.get(row.item_id), row.mes, row.cantidad_uf, row.uf_fija, row.uf_proyectada, row.uf_manual,
        row.monto_clp, row.monto_clp_manual, row.modo_calculo, row.submodo_uf, row.origen_valor, row.es_manual, row.observacion);
    });
    return target;
  })();
}

function crearVersionDesdeActiva(input = {}, user = 'sistema') {
  const anio = Number(input.anio) || new Date().getFullYear();
  const source = input.sourceVersionId ? versionById(input.sourceVersionId) : activeVersion(anio);
  if (source) return duplicarVersion(source.id, user);
  return createEmptyVersion({ anio, descripcion: input.descripcion, createdBy: user, activa: 1 });
}

function renombrarVersion(id, input = {}) {
  const version = versionById(id);
  if (!version) throw new Error('Versión no encontrada');
  const nombre = clean(input.nombre) || version.nombre;
  db.prepare('UPDATE proyeccion_version SET nombre = ?, descripcion = ? WHERE id = ?')
    .run(nombre, clean(input.descripcion || version.descripcion), id);
  return versionById(id);
}

function gridWhere(query, version) {
  const where = ['pi.version_id = @versionId'];
  const params = { versionId: version.id };
  ['cliente', 'producto', 'tipo_cp', 'iva', 'ms'].forEach(field => {
    if (query[field]) {
      where.push(`pi.${field} = @${field}`);
      params[field] = query[field];
    }
  });
  if (query.clienteId) {
    where.push('(pi.cliente_id = @clienteId OR pi.cliente = @clienteId)');
    params.clienteId = query.clienteId;
  }
  return { where, params };
}

function grilla(query = {}) {
  const version = resolveVersion(query);
  ensureMonthlyRows(version.id);
  const { where, params } = gridWhere(query, version);
  const limit = Math.min(Number(query.limit) || 400, 1000);
  const items = db.prepare(`
    SELECT pi.*
    FROM proyeccion_item pi
    WHERE ${where.join(' AND ')}
    ORDER BY COALESCE(pi.orden_fila, 999999), pi.id
    LIMIT ${limit}
  `).all(params);
  const ids = items.map(item => item.id);
  const mensual = ids.length
    ? db.prepare(`
        SELECT pm.*
        FROM proyeccion_mensual pm
        WHERE pm.item_id IN (${ids.map((_, i) => `@id${i}`).join(',')})
        ORDER BY pm.item_id, pm.mes
      `).all(ids.reduce((acc, id, i) => ({ ...acc, [`id${i}`]: id }), {}))
    : [];
  const byItem = mensual.reduce((map, row) => {
    if (!map.has(row.item_id)) map.set(row.item_id, []);
    map.get(row.item_id)[row.mes - 1] = row;
    return map;
  }, new Map());

  return {
    version,
    items: items.map(item => ({ ...item, meses: byItem.get(item.id) || [] })),
    total: db.prepare(`SELECT COUNT(*) AS total FROM proyeccion_item pi WHERE ${where.join(' AND ')}`).get(params).total,
    filtros: {
      versiones: versiones(version.anio),
      clientes: db.prepare("SELECT DISTINCT cliente, cliente_id FROM proyeccion_item WHERE version_id = ? AND cliente IS NOT NULL AND cliente <> '' ORDER BY cliente").all(version.id),
      productos: db.prepare("SELECT DISTINCT producto FROM proyeccion_item WHERE version_id = ? AND producto IS NOT NULL AND producto <> '' ORDER BY producto").all(version.id).map(r => r.producto),
      tiposCp: db.prepare("SELECT DISTINCT tipo_cp FROM proyeccion_item WHERE version_id = ? AND tipo_cp IS NOT NULL AND tipo_cp <> '' ORDER BY tipo_cp").all(version.id).map(r => r.tipo_cp),
      iva: db.prepare("SELECT DISTINCT iva FROM proyeccion_item WHERE version_id = ? AND iva IS NOT NULL AND iva <> '' ORDER BY iva").all(version.id).map(r => r.iva),
      ms: db.prepare("SELECT DISTINCT ms FROM proyeccion_item WHERE version_id = ? AND ms IS NOT NULL AND ms <> '' ORDER BY ms").all(version.id).map(r => r.ms)
    }
  };
}

function monthlySummaryForVersion(query = {}) {
  const version = resolveVersion(query);
  ensureMonthlyRows(version.id);
  const { where, params } = gridWhere(query, version);
  const rows = db.prepare(`
    SELECT pm.mes, pm.cantidad_uf, pm.uf_fija, pm.uf_proyectada, pm.monto_clp
    FROM proyeccion_mensual pm
    JOIN proyeccion_item pi ON pi.id = pm.item_id
    WHERE ${where.join(' AND ')}
    ORDER BY pm.mes
  `).all(params);
  const meses = MESES.map((nombre, index) => ({
    mes: index + 1,
    mes_nombre: nombre,
    monto_uf: 0,
    monto_clp: 0
  }));
  rows.forEach(row => {
    const target = meses[Number(row.mes) - 1];
    if (!target) return;
    const montoClp = Number(row.monto_clp || 0);
    const ufBase = Number(row.uf_proyectada || row.uf_fija || 0);
    const cantidadUf = row.cantidad_uf != null ? Number(row.cantidad_uf) : (ufBase ? montoClp / ufBase : 0);
    target.monto_clp += montoClp;
    target.monto_uf += Number.isFinite(cantidadUf) ? cantidadUf : 0;
  });
  const totalClp = meses.reduce((sum, row) => sum + row.monto_clp, 0);
  const totalUf = meses.reduce((sum, row) => sum + row.monto_uf, 0);
  const metaAnual = Number(version.meta_anual || 0);
  return {
    version,
    meses: meses.map(row => ({
      ...row,
      monto_clp: Math.round(row.monto_clp),
      monto_uf: Math.round(row.monto_uf * 100) / 100
    })),
    total_clp: Math.round(totalClp),
    total_uf: Math.round(totalUf * 100) / 100,
    meta_anual: metaAnual ? Math.round(metaAnual) : null,
    avance_meta: metaAnual ? totalClp / metaAnual : null
  };
}

function existingItem(versionId, item) {
  return db.prepare(`
    SELECT *
    FROM proyeccion_item
    WHERE version_id = ?
      AND ifnull(iva, '') = ifnull(?, '')
      AND ifnull(proyecto, '') = ifnull(?, '')
      AND ifnull(ms, '') = ifnull(?, '')
      AND ifnull(cliente, '') = ifnull(?, '')
      AND ifnull(dp, '') = ifnull(?, '')
      AND ifnull(cp, '') = ifnull(?, '')
      AND ifnull(producto, '') = ifnull(?, '')
      AND ifnull(tipo_cp, '') = ifnull(?, '')
    LIMIT 1
  `).get(versionId, item.iva, item.proyecto, item.ms, item.cliente, item.dp, item.cp, item.producto, item.tipo_cp);
}

function upsertVersionItem(versionId, item, options = {}) {
  const existing = existingItem(versionId, item);
  if (existing) {
    db.prepare(`
      UPDATE proyeccion_item
      SET cliente_id=?, venta=?, orden_fila=?, updated_at=datetime('now')
      WHERE id=?
    `).run(item.cliente_id, item.venta, item.orden_fila, existing.id);
    return { id: existing.id, action: 'actualizar' };
  }

  const itemId = uuidv4();
  db.prepare(`
    INSERT INTO proyeccion_item (id, version_id, iva, proyecto, ms, cliente_id, cliente, dp, cp, producto, tipo_cp, venta, orden_fila)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(itemId, versionId, item.iva, item.proyecto, item.ms, item.cliente_id, item.cliente, item.dp, item.cp, item.producto, item.tipo_cp, item.venta, item.orden_fila);
  return { id: itemId, action: options.action || 'crear' };
}

function upsertImportedMonth(itemId, mes) {
  const existing = db.prepare('SELECT * FROM proyeccion_mensual WHERE item_id = ? AND mes = ?').get(itemId, Number(mes.mes));
  const montoRaw = parseNumber(mes.monto_clp);
  const monto = montoRaw == null ? null : Math.round(montoRaw);
  if (existing) {
    const isManualProtected = existing.es_manual && existing.origen_valor !== 'EXCEL_IMPORTADO';
    if (isManualProtected) return { action: 'respetar_manual' };
    db.prepare(`
      UPDATE proyeccion_mensual
      SET monto_clp=?, monto_clp_manual=?, modo_calculo='MANUAL_CLP', origen_valor='EXCEL_IMPORTADO',
          es_manual=1, updated_at=datetime('now')
      WHERE id=?
    `).run(monto, monto, existing.id);
    return { action: 'actualizar' };
  }
  db.prepare(`
    INSERT INTO proyeccion_mensual (
      id, item_id, mes, monto_clp, monto_clp_manual, modo_calculo, origen_valor, es_manual, observacion
    )
    VALUES (?, ?, ?, ?, ?, 'MANUAL_CLP', 'EXCEL_IMPORTADO', 1, ?)
  `).run(uuidv4(), itemId, Number(mes.mes), monto, monto, 'Importado desde Excel');
  return { action: 'crear' };
}

function monthlyContext(id) {
  return db.prepare(`
    SELECT pm.*, pi.iva, pi.proyecto, pi.ms, pi.cliente, pi.cliente_id, pi.dp, pi.cp, pi.producto, pi.tipo_cp, pi.venta, pv.anio
    FROM proyeccion_mensual pm
    JOIN proyeccion_item pi ON pi.id = pm.item_id
    JOIN proyeccion_version pv ON pv.id = pi.version_id
    WHERE pm.id = ?
  `).get(id);
}

function ufForMonth(anio, mes) {
  return db.prepare('SELECT * FROM proyeccion_uf WHERE anio = ? AND mes = ?').get(anio, mes) || {};
}

function calcularMensual(input, ctx) {
  const modo = clean(input.modo_calculo || ctx.modo_calculo || 'UF_PROYECTADA');
  const submodo = clean(input.submodo_uf || ctx.submodo_uf || 'UF_PROYECTADA') || null;
  const ufMes = ufForMonth(ctx.anio, ctx.mes);
  const cantidadUf = parseNumber(input.cantidad_uf);
  const ufFija = parseNumber(input.uf_fija) ?? parseNumber(ufMes.uf_fija);
  const ufProyectada = parseNumber(input.uf_proyectada) ?? parseNumber(ufMes.uf_proyectada);
  const ufManual = parseNumber(input.uf_manual);
  const montoManualRaw = parseNumber(input.monto_clp_manual);
  const montoManual = montoManualRaw == null ? null : Math.round(montoManualRaw);
  let monto = null;
  let origen = 'APP';
  let esManual = 0;

  if (modo === 'UF_PROYECTADA') {
    monto = cantidadUf != null && ufProyectada != null ? Math.round(cantidadUf * ufProyectada) : null;
    origen = 'RECALCULADO';
  } else if (modo === 'UF_FIJA') {
    monto = cantidadUf != null && ufFija != null ? Math.round(cantidadUf * ufFija) : null;
    origen = 'RECALCULADO';
  } else if (modo === 'MANUAL_UF') {
    const ufUsada = submodo === 'UF_FIJA' ? ufFija : ufProyectada;
    monto = ufManual != null && ufUsada != null ? Math.round(ufManual * ufUsada) : null;
    origen = 'MANUAL_UF';
    esManual = 1;
  } else if (modo === 'MANUAL_CLP') {
    monto = montoManual;
    origen = 'MANUAL_CLP';
    esManual = 1;
  } else {
    throw new Error('Modo de calculo no valido');
  }

  return {
    cantidad_uf: cantidadUf,
    uf_fija: ufFija,
    uf_proyectada: ufProyectada,
    uf_manual: ufManual,
    monto_clp: monto,
    monto_clp_manual: modo === 'MANUAL_CLP' ? montoManual : parseNumber(input.monto_clp_manual),
    modo_calculo: modo,
    submodo_uf: modo === 'MANUAL_UF' ? submodo : null,
    origen_valor: origen,
    es_manual: esManual,
    observacion: clean(input.observacion)
  };
}

function actualizarMensual(id, input = {}) {
  const ctx = monthlyContext(id);
  if (!ctx) throw new Error('Proyeccion mensual no encontrada');
  const data = calcularMensual(input, ctx);
  db.prepare(`
    UPDATE proyeccion_mensual
    SET cantidad_uf=?, uf_fija=?, uf_proyectada=?, uf_manual=?, monto_clp=?, monto_clp_manual=?,
        modo_calculo=?, submodo_uf=?, origen_valor=?, es_manual=?, observacion=?, updated_at=datetime('now')
    WHERE id=?
  `).run(data.cantidad_uf, data.uf_fija, data.uf_proyectada, data.uf_manual, data.monto_clp, data.monto_clp_manual,
    data.modo_calculo, data.submodo_uf, data.origen_valor, data.es_manual, data.observacion, id);
  return monthlyContext(id);
}

function recalcular(input = {}) {
  const version = resolveVersion(input);
  const { where, params } = gridWhere(input, version);
  const rows = db.prepare(`
    SELECT pm.id, pm.modo_calculo, pm.submodo_uf, pm.uf_manual, pm.cantidad_uf, pm.monto_clp, pi.version_id
    FROM proyeccion_mensual pm
    JOIN proyeccion_item pi ON pi.id = pm.item_id
    WHERE ${where.join(' AND ')}
  `).all(params);
  const stats = { recalculadas: 0, manuales_respetadas: 0, advertencias: 0, cambios: [] };
  const apply = !!input.confirm;
  rows.forEach(row => {
    if (row.modo_calculo === 'MANUAL_CLP') {
      stats.manuales_respetadas += 1;
      return;
    }
    const ctx = monthlyContext(row.id);
    const data = calcularMensual({
      modo_calculo: row.modo_calculo,
      submodo_uf: row.submodo_uf,
      cantidad_uf: row.cantidad_uf,
      uf_manual: row.uf_manual,
      observacion: ctx.observacion
    }, ctx);
    if (data.monto_clp == null) {
      stats.advertencias += 1;
      return;
    }
    if (Number(row.monto_clp || 0) !== Number(data.monto_clp || 0)) {
      stats.recalculadas += 1;
      stats.cambios.push({
        id: row.id,
        cliente: ctx.cliente,
        ms: ctx.ms,
        mes: ctx.mes,
        anterior: row.monto_clp,
        nuevo: data.monto_clp,
        modo: row.modo_calculo,
        accion: apply ? 'actualizado' : 'preview'
      });
      if (apply) actualizarMensual(row.id, data);
    }
  });
  return stats;
}

function monthlyTotals(versionId) {
  return db.prepare(`
    SELECT pm.mes, SUM(COALESCE(pm.monto_clp, 0)) AS total
    FROM proyeccion_mensual pm
    JOIN proyeccion_item pi ON pi.id = pm.item_id
    WHERE pi.version_id = ?
    GROUP BY pm.mes
  `).all(versionId).reduce((acc, row) => {
    acc[row.mes] = row.total;
    return acc;
  }, {});
}

function compararVersiones(query = {}) {
  const base = versionById(query.baseVersionId);
  const compare = versionById(query.compareVersionId);
  if (!base || !compare) throw new Error('Debes indicar dos versiones válidas');
  const a = monthlyTotals(base.id);
  const b = monthlyTotals(compare.id);
  const meses = MESES.map((nombre, index) => {
    const mes = index + 1;
    const baseTotal = Number(a[mes] || 0);
    const compareTotal = Number(b[mes] || 0);
    return {
      mes,
      mes_nombre: nombre,
      base: baseTotal,
      comparada: compareTotal,
      diferencia: compareTotal - baseTotal
    };
  });
  return {
    base,
    comparada: compare,
    meses,
    total_base: meses.reduce((sum, row) => sum + row.base, 0),
    total_comparada: meses.reduce((sum, row) => sum + row.comparada, 0),
    diferencia_total: meses.reduce((sum, row) => sum + row.diferencia, 0)
  };
}

async function parseExcelVersionRows({ filePath, fileBuffer, fileName, anio, sheet }) {
  if (!filePath && !fileBuffer) throw new Error('Debes adjuntar un Excel');
  const resolved = filePath ? path.resolve(filePath) : clean(fileName || 'archivo-subido.xlsx');
  if (filePath && !fs.existsSync(resolved)) throw new Error('El archivo no existe');
  const workbook = new ExcelJS.Workbook();
  if (fileBuffer) await workbook.xlsx.load(fileBuffer);
  else await workbook.xlsx.readFile(resolved);
  const ws = findMainWorksheet(workbook, sheet);
  if (!ws) throw new Error('No se encontro hoja principal');
  const detectedAnio = inferAnio(resolved, anio, ws.name);
  const meta = versionMetaFromSource(resolved, detectedAnio);
  const headerRow = findHeaderRow(ws);
  const headers = headerMap(ws, headerRow);
  const items = [];
  const omitidas = [];
  let metaAnual = null;

  for (let rowNumber = headerRow + 1; rowNumber <= ws.rowCount; rowNumber += 1) {
    const row = ws.getRow(rowNumber);
    const base = rowBase(row, headers, detectedAnio, resolved, rowNumber);
    if (!base.ms && !base.cliente && !base.proyecto) {
      omitidas.push({ fila: rowNumber, motivo: 'Fila vacia' });
      continue;
    }
    if (isSummaryRow(base)) {
      if (/\bMETA\b/.test([base.cliente, base.proyecto, base.ms, base.producto, base.tipo_cp].map(key).join(' '))) {
        metaAnual = summaryRowAmount(row) ?? metaAnual;
      }
      omitidas.push({ fila: rowNumber, cliente: base.cliente, ms: base.ms, motivo: 'Fila resumen/meta/diferencia' });
      continue;
    }
    if (!validMs(base.ms)) {
      omitidas.push({ fila: rowNumber, cliente: base.cliente, ms: base.ms, motivo: 'MS no valido' });
      continue;
    }
    if (base.iva === 'MIXTO') {
      base.advertencia = 'IVA MIXTO detectado';
    }
    const meses = MESES.map((mesNombre, index) => ({
      mes: index + 1,
      monto_clp: parseNumber(getByHeader(row, headers, mesNombre))
    }));
    if (meses.every(m => m.monto_clp == null)) continue;
    items.push({ ...base, meses });
  }

  return { anio: meta?.anio || detectedAnio, meta, meta_anual: metaAnual, source: resolved, hoja: ws.name, header_row: headerRow, items, omitidas };
}

async function importPreview(input = {}) {
  const parsed = await parseExcelVersionRows(input);
  return {
    anio: parsed.anio,
    version: parsed.meta,
    meta_anual: parsed.meta_anual,
    source: parsed.source,
    hoja: parsed.hoja,
    header_row: parsed.header_row,
    total_items: parsed.items.length,
    omitidas: parsed.omitidas,
    preview: parsed.items.slice(0, 20).map(item => ({
      accion: 'crear_version',
      orden_fila: item.orden_fila,
      cliente: item.cliente,
      ms: item.ms,
      proyecto: item.proyecto,
      valor_excel: item.meses.find(m => m.monto_clp != null)?.monto_clp ?? null,
      valor_actual: null,
      motivo: item.advertencia || 'Fila valida'
    }))
  };
}

async function importConfirm(input = {}, user = 'sistema') {
  const parsed = input.items ? {
    anio: Number(input.anio) || new Date().getFullYear(),
    source: clean(input.source || 'preview'),
    items: input.items
  } : await parseExcelVersionRows(input);

  return db.transaction(() => {
    const meta = parsed.meta || versionMetaFromSource(parsed.source, parsed.anio);
    let version = null;
    if (meta) {
      version = db.prepare('SELECT * FROM proyeccion_version WHERE anio = ? AND numero = ?').get(meta.anio, meta.numero);
    }
    if (!version) {
      version = meta
        ? createVersion({ ...meta, meta_anual: parsed.meta_anual, descripcion: `Importado desde ${parsed.source}`, origen: 'EXCEL_IMPORTADO', createdBy: user, activa: 0 })
        : createEmptyVersion({ anio: parsed.anio, descripcion: `Importado desde ${parsed.source}`, origen: 'EXCEL_IMPORTADO', createdBy: user, activa: 0 });
    } else {
      db.prepare('UPDATE proyeccion_version SET nombre=?, fecha_version=?, origen=?, descripcion=?, meta_anual=COALESCE(?, meta_anual) WHERE id=?')
        .run(meta.nombre, meta.fecha_version, 'EXCEL_IMPORTADO', `Reimportado desde ${parsed.source}`, parsed.meta_anual, version.id);
      version = versionById(version.id);
    }
    let itemsCreados = 0;
    let itemsActualizados = 0;
    let celdasCreadas = 0;
    let manualesRespetadas = 0;
    parsed.items.forEach(item => {
      const upsert = upsertVersionItem(version.id, item);
      const itemId = upsert.id;
      if (upsert.action === 'crear') itemsCreados += 1;
      else itemsActualizados += 1;
      (item.meses || []).forEach(mes => {
        if (mes.monto_clp == null) return;
        const result = upsertImportedMonth(itemId, mes);
        if (result.action === 'respetar_manual') manualesRespetadas += 1;
        else celdasCreadas += 1;
      });
    });
    return { version, stats: { items_creados: itemsCreados, items_actualizados: itemsActualizados, celdas_creadas: celdasCreadas, manuales_respetadas: manualesRespetadas, omitidas: parsed.omitidas || [] } };
  })();
}

function resumen(query = {}) {
  const anio = Number(query.anio) || new Date().getFullYear();
  const resumenVersion = monthlySummaryForVersion({ ...query, anio });
  return {
    anio,
    version: resumenVersion.version,
    totales_mensuales: resumenVersion.meses,
    total_clp: resumenVersion.total_clp,
    total_uf: resumenVersion.total_uf,
    meta_anual: resumenVersion.meta_anual,
    avance_meta: resumenVersion.avance_meta,
    vista_general: {
      items: [],
      total: resumenVersion.meses.length,
      filtros: grilla({ ...query, anio, limit: 1 }).filtros
    }
  };
}

async function exportWorkbook(query = {}) {
  const anio = Number(query.anio) || new Date().getFullYear();
  const moneda = key(query.moneda || 'CLP');
  const modoUf = key(query.modoUf || 'PROYECTADA');
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet(`Venta Plataformas ${anio}`);
  ws.addRow([]);
  ws.addRow(COLUMNAS_EXPORT);
  ws.getRow(2).font = { bold: true };

  const ufByMonth = ufRows(anio).reduce((acc, row) => {
    acc[row.mes] = row;
    return acc;
  }, {});

  groupedRows({ ...query, anio }).forEach(row => {
    ws.addRow([
      row.iva === 'AFECTO_IVA' ? 'AFECTO' : row.iva === 'EXENTO_IVA' ? 'EXENTO' : row.iva,
      row.ms,
      row.proyecto,
      row.cliente,
      row.dp,
      row.cp,
      row.producto,
      row.tipo_cp,
      row.venta,
      ...row.meses.map(monthRow => amountForExport(monthRow, ufByMonth, moneda, modoUf))
    ]);
  });

  ws.columns.forEach(col => { col.width = 16; });
  ws.getColumn(3).width = 34;
  ws.getColumn(4).width = 26;
  ws.getColumn(8).width = 26;

  const auxRows = db.prepare('SELECT hoja, fila, data_json FROM proyeccion_auxiliar WHERE anio = ? ORDER BY hoja, fila').all(anio);
  ['Hoja1', 'Hoja2'].forEach(hoja => {
    const rows = auxRows.filter(row => key(row.hoja) === key(hoja));
    if (!rows.length) return;
    const aux = wb.addWorksheet(hoja);
    rows.forEach(row => aux.addRow(JSON.parse(row.data_json)));
  });

  return wb.xlsx.writeBuffer();
}

module.exports = {
  MESES,
  importFromExcel,
  importPreview,
  importConfirm,
  listProyecciones,
  clientes,
  msPorCliente,
  grafico,
  ufRows,
  upsertUf,
  saveConfiguracion,
  recomendaciones,
  resumen,
  versiones,
  crearVersionDesdeActiva,
  activarVersion,
  duplicarVersion,
  renombrarVersion,
  grilla,
  actualizarMensual,
  recalcular,
  compararVersiones,
  exportWorkbook
};
