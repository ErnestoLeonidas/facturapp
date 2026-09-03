const fs = require('fs');
const path = require('path');
const ExcelJS = require('exceljs');
const { v4: uuidv4 } = require('uuid');
const db = require('../db-async');

const MESES = [
  'ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO',
  'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'
];

const COLUMNAS_EXPORT = [
  'IVA', 'PROYECTO', 'MS', 'CLIENTE', 'DP', 'CP', 'PRODUCTO', 'TIPO DE CP', 'VENTA',
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

async function upsertProjectedUf(anio, mes, values, conn = db) {
  const nums = values.filter(n => n && Number.isFinite(n));
  if (!nums.length) return;
  const uf = roundClpUf(nums.reduce((sum, n) => sum + n, 0) / nums.length);
  const existing = await conn.get('SELECT id, origen_valor FROM proyeccion_uf WHERE anio = ? AND mes = ?', [anio, mes]);
  if (existing) {
    await conn.run(`
      UPDATE proyeccion_uf
      SET uf_proyectada = ?, updated_at = ?
      WHERE id = ? AND origen_valor <> 'MANUAL'
    `, [uf, db.nowText(), existing.id]);
    return;
  }
  await conn.run(`
    INSERT INTO proyeccion_uf (id, anio, mes, uf_proyectada, origen_valor)
    VALUES (?, ?, ?, ?, 'PROYECTADA')
  `, [uuidv4(), anio, mes, uf]);
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

async function findClienteId(cliente, conn = db) {
  if (!cliente) return null;
  const row = await conn.get(`
    SELECT id FROM cliente
    WHERE estado = 'Activo'
      AND upper(nombre_corto) = upper(?)
    LIMIT 1
  `, [cliente]);
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

function auxiliaryRowsFromWorkbook(workbook, anio, source) {
  const rows = [];
  workbook.worksheets
    .filter(aux => ['HOJA1', 'HOJA2'].includes(key(aux.name)))
    .forEach(aux => {
      readAuxiliaryRows(aux).forEach(auxRow => {
        rows.push({
          anio,
          hoja: aux.name,
          fila: auxRow.fila,
          values: auxRow.values,
          source
        });
      });
    });
  return rows;
}

async function rowBase(row, headers, anio, source, rowNumber, conn = db) {
  const cliente = normalizeCliente(getByHeader(row, headers, 'CLIENTE'));
  return {
    anio,
    iva: normalizeIva(getByHeader(row, headers, 'IVA')),
    ms: normalizeMs(getByHeader(row, headers, 'MS')),
    proyecto: clean(getByHeader(row, headers, 'PROYECTO')),
    cliente_id: await findClienteId(cliente, conn),
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

async function upsertProjection(row, conn = db) {
  const existing = await conn.get(`
    SELECT id FROM proyeccion
    WHERE anio = ? AND mes = ?
      AND COALESCE(ms, '') = COALESCE(?, '')
      AND COALESCE(cliente, '') = COALESCE(?, '')
      AND COALESCE(proyecto, '') = COALESCE(?, '')
      AND COALESCE(producto, '') = COALESCE(?, '')
      AND COALESCE(tipo_cp, '') = COALESCE(?, '')
      AND COALESCE(cp, '') = COALESCE(?, '')
    LIMIT 1
  `, [row.anio, row.mes, row.ms, row.cliente, row.proyecto, row.producto, row.tipo_cp, row.cp]);

  if (existing) {
    await conn.run(`
      UPDATE proyeccion
      SET iva=?, cliente_id=?, dp=?, venta=?, monto=?, monto_uf=?, monto_clp_referencia=?,
          estado=COALESCE(?, estado), source=?, source_row=?, updated_at=?
      WHERE id=?
    `, [row.iva, row.cliente_id, row.dp, row.venta, row.monto, row.monto_uf,
      row.monto_clp_referencia, row.estado, row.source, row.source_row, db.nowText(), existing.id]);
    return 'actualizadas';
  }

  await conn.run(`
    INSERT INTO proyeccion (
      id, anio, iva, ms, proyecto, cliente_id, cliente, dp, cp, producto, tipo_cp,
      venta, mes, monto, monto_uf, monto_clp_referencia, estado, source, source_row
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [uuidv4(), row.anio, row.iva, row.ms, row.proyecto, row.cliente_id, row.cliente,
    row.dp, row.cp, row.producto, row.tipo_cp, row.venta, row.mes, row.monto,
    row.monto_uf, row.monto_clp_referencia, row.estado, row.source, row.source_row]);
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

  await db.transaction(async tx => {
    for (let rowNumber = headerRow + 1; rowNumber <= ws.rowCount; rowNumber += 1) {
      const row = ws.getRow(rowNumber);
      const base = await rowBase(row, headers, detectedAnio, resolved, rowNumber, tx);
      if (!base.ms && !base.cliente && !base.proyecto) continue;
      stats.filas_leidas += 1;

      let hadMonth = false;
      for (const [index, mesNombre] of MESES.entries()) {
        const cellValue = getByHeader(row, headers, mesNombre);
        const monto = parseNumber(cellValue);
        if (monto === null) continue;
        hadMonth = true;
        const ufProyectada = projectedUfFromCell(cellValue);
        if (ufProyectada) projectedUfByMonth[index].push(ufProyectada);
        const result = await upsertProjection({
          ...base,
          mes: index + 1,
          monto,
          monto_clp_referencia: monto,
          monto_uf: ufProyectada ? monto / ufProyectada : null,
          estado: clean(getByHeader(row, headers, 'ESTADO')) || null
        }, tx);
        stats[result] += 1;
      }

      if (!hadMonth) stats.omitidas.push({ fila: rowNumber, motivo: 'Sin montos mensuales' });
      if (!base.iva) stats.omitidas.push({ fila: rowNumber, motivo: 'Sin tipo de IVA definido' });
    }

    await tx.run('DELETE FROM proyeccion_auxiliar WHERE anio = ? AND source = ?', [detectedAnio, resolved]);
    for (const aux of workbook.worksheets.filter(sheet => ['HOJA1', 'HOJA2'].includes(key(sheet.name)))) {
      for (const auxRow of readAuxiliaryRows(aux)) {
        await tx.run(`
          INSERT INTO proyeccion_auxiliar (id, anio, hoja, fila, data_json, source)
          VALUES (?, ?, ?, ?, ?, ?)
        `, [uuidv4(), detectedAnio, aux.name, auxRow.fila, JSON.stringify(auxRow.values), resolved]);
        stats.auxiliares += 1;
      }
    }

    for (const [index, values] of projectedUfByMonth.entries()) {
      await upsertProjectedUf(detectedAnio, index + 1, values, tx);
    }
  });

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

async function listProyecciones(query = {}) {
  const { sql, params } = filtersWhere(query);
  const limit = Math.min(Number(query.limit) || 250, 1000);
  const rows = await db.all(`
    SELECT * FROM proyeccion
    ${sql}
    ORDER BY cliente, ms, proyecto, mes
    LIMIT ${limit}
  `, params);

  return {
    items: rows,
    total: (await db.get(`SELECT COUNT(*) total FROM proyeccion ${sql}`, params)).total,
    filtros: {
      anios: (await db.all('SELECT DISTINCT anio FROM proyeccion ORDER BY anio DESC')).map(r => r.anio),
      clientes: await db.all("SELECT DISTINCT cliente, cliente_id FROM proyeccion WHERE cliente IS NOT NULL AND cliente <> '' ORDER BY cliente"),
      ms: (await db.all("SELECT DISTINCT ms FROM proyeccion WHERE ms IS NOT NULL AND ms <> '' ORDER BY ms")).map(r => r.ms),
      productos: (await db.all("SELECT DISTINCT producto FROM proyeccion WHERE producto IS NOT NULL AND producto <> '' ORDER BY producto")).map(r => r.producto),
      tiposCp: (await db.all("SELECT DISTINCT tipo_cp FROM proyeccion WHERE tipo_cp IS NOT NULL AND tipo_cp <> '' ORDER BY tipo_cp")).map(r => r.tipo_cp),
      estados: (await db.all("SELECT DISTINCT estado FROM proyeccion WHERE estado IS NOT NULL AND estado <> '' ORDER BY estado")).map(r => r.estado)
    }
  };
}

async function clientes() {
  return db.all(`
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
  `);
}

async function msPorCliente(clienteId) {
  return db.all(`
    SELECT ms, COUNT(*) registros, SUM(COALESCE(monto, 0)) total
    FROM proyeccion
    WHERE (cliente_id = ? OR cliente = ?)
      AND ms IS NOT NULL AND ms <> ''
    GROUP BY ms
    ORDER BY ms
  `, [clienteId, clienteId]);
}

async function configuredUfFija(anio, options = {}) {
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
  const row = await db.get(`
    SELECT uf_fija_default
    FROM proyeccion_configuracion
    WHERE ${where.join(' AND ')}
    ORDER BY
      CASE WHEN cliente_id IS NOT NULL AND cliente_id <> '' THEN 0 ELSE 1 END,
      CASE WHEN ms IS NOT NULL AND ms <> '' THEN 0 ELSE 1 END
    LIMIT 1
  `, params);
  return row ? row.uf_fija_default : null;
}

async function ufRows(anio, options = {}) {
  const existingRows = await db.all('SELECT * FROM proyeccion_uf WHERE anio = ?', [anio]);
  const byMonth = new Map(existingRows.map(row => [row.mes, row]));
  const ufFijaDefault = await configuredUfFija(anio, options);
  const nearestProjectedUf = month => {
    for (let distance = 1; distance <= 11; distance += 1) {
      const prev = byMonth.get(month - distance);
      const prevValue = prev && (parseNumber(prev.uf_manual) ?? roundClpUf(prev.uf_proyectada) ?? parseNumber(prev.uf_fija));
      if (prevValue) return prevValue;
      const next = byMonth.get(month + distance);
      const nextValue = next && (parseNumber(next.uf_manual) ?? roundClpUf(next.uf_proyectada) ?? parseNumber(next.uf_fija));
      if (nextValue) return nextValue;
    }
    return null;
  };
  return MESES.map((nombre, index) => byMonth.get(index + 1) || {
    anio, mes: index + 1, mes_nombre: nombre, uf_fija: null, uf_proyectada: null, uf_manual: null, origen_valor: 'PROYECTADA'
  }).map(row => ({
    ...row,
    uf_fija: row.uf_fija || ufFijaDefault,
    uf_proyectada: roundClpUf(row.uf_proyectada) ?? nearestProjectedUf(row.mes),
    mes_nombre: MESES[row.mes - 1]
  }));
}

async function grafico(query = {}) {
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

  const montos = (await db.all(`
    SELECT mes, SUM(COALESCE(monto_uf, 0)) monto_uf, SUM(COALESCE(monto, 0)) monto_clp
    FROM proyeccion
    WHERE ${where.join(' AND ')}
    GROUP BY mes
  `, params)).reduce((map, row) => {
    map[row.mes] = row;
    return map;
  }, {});

  return (await ufRows(anio, query)).map(row => {
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

async function upsertUf(rows) {
  await db.transaction(async tx => {
    for (const input of rows) {
      const anio = Number(input.anio);
      const mes = Number(input.mes);
      if (!anio || mes < 1 || mes > 12) continue;
      const existing = await tx.get('SELECT id FROM proyeccion_uf WHERE anio = ? AND mes = ?', [anio, mes]);
      const origen = input.uf_manual !== undefined && input.uf_manual !== null && input.uf_manual !== '' ? 'MANUAL' : (input.origen_valor || 'PROYECTADA');
      if (existing) {
        await tx.run(`
          UPDATE proyeccion_uf
          SET uf_fija=?, uf_proyectada=?, uf_manual=?, origen_valor=?, observaciones=?, updated_at=?
          WHERE id=?
        `, [parseNumber(input.uf_fija), roundClpUf(input.uf_proyectada), parseNumber(input.uf_manual),
          origen, clean(input.observaciones), db.nowText(), existing.id]);
      } else {
        await tx.run(`
          INSERT INTO proyeccion_uf (id, anio, mes, uf_fija, uf_proyectada, uf_manual, origen_valor, observaciones)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [uuidv4(), anio, mes, parseNumber(input.uf_fija), roundClpUf(input.uf_proyectada),
          parseNumber(input.uf_manual), origen, clean(input.observaciones)]);
      }
    }
  });
  return ufRows(Number(rows[0] && rows[0].anio) || new Date().getFullYear());
}

async function saveConfiguracion(input) {
  const anio = Number(input.anio);
  const clienteId = clean(input.cliente_id);
  const ms = normalizeMs(input.ms);
  const modo = key(input.modo_uf || 'PROYECTADA');
  const ufFija = parseNumber(input.uf_fija_default);
  const existing = await db.get(`
    SELECT id FROM proyeccion_configuracion
    WHERE COALESCE(cliente_id, '') = COALESCE(?, '')
      AND COALESCE(ms, '') = COALESCE(?, '')
      AND anio = ?
  `, [clienteId, ms, anio]);
  if (existing) {
    await db.run('UPDATE proyeccion_configuracion SET modo_uf = ?, uf_fija_default = ?, updated_at = ? WHERE id = ?',
      [modo, ufFija, db.nowText(), existing.id]);
  } else {
    await db.run('INSERT INTO proyeccion_configuracion (id, cliente_id, ms, anio, modo_uf, uf_fija_default) VALUES (?, ?, ?, ?, ?, ?)',
      [uuidv4(), clienteId || null, ms || null, anio, modo, ufFija]);
  }
  return db.all('SELECT * FROM proyeccion_configuracion WHERE anio = ? ORDER BY cliente_id, ms', [anio]);
}

async function recomendaciones(query = {}) {
  const anio = Number(query.anio) || new Date().getFullYear();
  const recs = [];
  const missingUf = (await db.get('SELECT COUNT(*) total FROM proyeccion_uf WHERE anio = ? AND uf_proyectada IS NOT NULL', [anio])).total;
  if (missingUf < 12) recs.push('Hay meses sin UF proyectada.');
  const sinMonto = (await db.get('SELECT COUNT(*) total FROM proyeccion WHERE anio = ? AND (monto IS NULL OR monto = 0)', [anio])).total;
  if (sinMonto) recs.push('Hay filas sin monto en meses.');
  const sinIva = (await db.get("SELECT COUNT(*) total FROM proyeccion WHERE anio = ? AND (iva IS NULL OR iva = '')", [anio])).total;
  if (sinIva) recs.push('Hay registros sin tipo de IVA definido.');
  const topCliente = await db.get(`
    SELECT cliente, SUM(COALESCE(monto, 0)) total
    FROM proyeccion WHERE anio = ?
    GROUP BY cliente ORDER BY total DESC LIMIT 1
  `, [anio]);
  if (topCliente && topCliente.total > 0) recs.push(`Este cliente concentra alto monto proyectado: ${topCliente.cliente}.`);
  const diffs = await grafico({ anio });
  if (diffs.some(row => row.uf_fija && row.uf_proyectada && Math.abs(row.uf_fija - row.uf_proyectada) >= 500)) {
    recs.push('Este MS o cliente tiene alta diferencia entre UF fija y proyectada.');
  }
  recs.push('Revisar valores futuros porque la UF proyectada es estimativa.');
  return recs;
}

async function groupedRows(query = {}) {
  const { sql, params } = filtersWhere(query);
  const rows = await db.all(`SELECT * FROM proyeccion ${sql} ORDER BY cliente, ms, proyecto, producto, tipo_cp, mes`, params);
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

async function versionedRowsForExport(query = {}) {
  const version = await resolveVersion(query);
  await ensureMonthlyRows(version.id);
  const { where, params } = gridWhere(query, version);
  const items = await db.all(`
    SELECT pi.*
    FROM proyeccion_item pi
    WHERE ${where.join(' AND ')}
    ORDER BY COALESCE(pi.orden_fila, 999999), pi.id
  `, params);
  const ids = items.map(item => item.id);
  const mensual = ids.length
    ? await db.all(`
        SELECT pm.*
        FROM proyeccion_mensual pm
        WHERE pm.item_id IN (${ids.map((_, i) => `@id${i}`).join(',')})
        ORDER BY pm.item_id, pm.mes
      `, ids.reduce((acc, id, i) => ({ ...acc, [`id${i}`]: id }), {}))
    : [];
  const byItem = mensual.reduce((map, row) => {
    if (!map.has(row.item_id)) map.set(row.item_id, Array(12).fill(null));
    map.get(row.item_id)[row.mes - 1] = row;
    return map;
  }, new Map());
  return {
    version,
    rows: items.map(item => ({ ...item, meses: byItem.get(item.id) || Array(12).fill(null) }))
  };
}

function amountForVersionedExport(monthRow, ufByMonth, moneda, modoUf) {
  if (!monthRow) return null;
  const hasValue = monthRow.monto_clp != null || monthRow.cantidad_uf != null || monthRow.monto_clp_manual != null;
  if (!hasValue) return null;
  const uf = ufByMonth[monthRow.mes] || {};
  const selectedUf = modoUf === 'FIJA' ? uf.uf_fija : modoUf === 'PROYECTADA' ? uf.uf_proyectada : (uf.uf_manual || uf.uf_proyectada || uf.uf_fija);
  const monto = Number(monthRow.monto_clp || 0);
  const cantidadUf = Number(monthRow.cantidad_uf || 0);
  if (moneda === 'UF') {
    if (cantidadUf) return Math.round(cantidadUf);
    return selectedUf ? Math.round(monto / selectedUf) : null;
  }
  if (moneda === 'CLP_UF_FIJA' || modoUf === 'FIJA') return cantidadUf && uf.uf_fija ? Math.round(cantidadUf * uf.uf_fija) : monto;
  if (moneda === 'CLP_UF_PROYECTADA' || modoUf === 'PROYECTADA') return cantidadUf && uf.uf_proyectada ? Math.round(cantidadUf * uf.uf_proyectada) : monto;
  return Math.round(monto);
}

function normalizeAuxValue(value) {
  const s = clean(value);
  if (!s) return '';
  if (/^-?\d+(?:\.\d+)?$/.test(s)) return Math.round(Number(s));
  if (/^-?\d+(?:,\d+)?$/.test(s)) return Math.round(Number(s.replace(',', '.')));
  const n = parseNumber(s);
  return n == null || !s.match(/^-?[\d.,]+$/) ? s : Math.round(n);
}

function normalizedAuxRows(rows) {
  const seen = new Set();
  return rows.reduce((acc, row) => {
    const values = JSON.parse(row.data_json).map(normalizeAuxValue);
    const signature = values.map(value => key(value)).join('|');
    if (!signature || seen.has(signature)) return acc;
    seen.add(signature);
    acc.push(values);
    return acc;
  }, []);
}

function sourceFromVersion(version) {
  const match = clean(version && version.descripcion).match(/^Importado desde\s+(.+)$/);
  return match ? match[1] : '';
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

async function activeVersion(anio, conn = db) {
  return conn.get('SELECT * FROM proyeccion_version WHERE anio = ? AND activa = 1 LIMIT 1', [anio]);
}

async function nextVersionNumber(anio, conn = db) {
  const row = await conn.get('SELECT COALESCE(MAX(numero), 0) + 1 AS next FROM proyeccion_version WHERE anio = ?', [anio]);
  return row.next || 1;
}

async function createEmptyVersion({ anio, descripcion, origen = 'APP', createdBy = 'sistema', activa = 0 }, conn = db) {
  const numero = await nextVersionNumber(anio, conn);
  const fecha = todayDots();
  const id = uuidv4();
  await conn.run(`
    INSERT INTO proyeccion_version (id, numero, nombre, fecha_version, anio, descripcion, activa, origen, created_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [id, numero, versionName(numero, fecha), fecha.split('.').reverse().join('-'), anio, clean(descripcion), activa ? 1 : 0, origen, createdBy]);
  return conn.get('SELECT * FROM proyeccion_version WHERE id = ?', [id]);
}

async function createVersion(input, conn = db) {
  const anio = Number(input.anio) || new Date().getFullYear();
  const numero = Number(input.numero) || await nextVersionNumber(anio, conn);
  const fechaVersion = clean(input.fecha_version) || new Date().toISOString().slice(0, 10);
  const fechaDots = fechaVersion.split('-').reverse().join('.');
  const id = uuidv4();
  const nombre = clean(input.nombre) || versionName(numero, fechaDots);
  await conn.run(`
    INSERT INTO proyeccion_version (id, numero, nombre, fecha_version, anio, descripcion, activa, origen, created_by, meta_anual)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [id, numero, nombre, fechaVersion, anio, clean(input.descripcion), input.activa ? 1 : 0, clean(input.origen || 'APP'), clean(input.createdBy || 'sistema'), parseNumber(input.meta_anual)]);
  return conn.get('SELECT * FROM proyeccion_version WHERE id = ?', [id]);
}

async function ensureVersion(anio, conn = db) {
  const existing = await activeVersion(anio, conn);
  if (existing) return existing;
  if (conn !== db) return createEmptyVersion({ anio, descripcion: 'Version inicial', activa: 1 }, conn);
  return db.transaction(tx => createEmptyVersion({ anio, descripcion: 'Version inicial', activa: 1 }, tx));
}

async function versionById(id, conn = db) {
  return conn.get('SELECT * FROM proyeccion_version WHERE id = ?', [id]);
}

async function resolveVersion(query = {}, conn = db) {
  if (query.versionId) {
    const version = await versionById(query.versionId, conn);
    if (version) return version;
  }
  return ensureVersion(Number(query.anio) || new Date().getFullYear(), conn);
}

async function ensureMonthlyRows(versionId, conn = db) {
  const items = await conn.all('SELECT id FROM proyeccion_item WHERE version_id = ?', [versionId]);
  const insertSql = `
    INSERT INTO proyeccion_mensual (id, item_id, mes, modo_calculo, origen_valor)
    VALUES (?, ?, ?, 'UF_PROYECTADA', 'APP')
    ON CONFLICT(item_id, mes) DO NOTHING
  `;
  const runner = async tx => {
    for (const item of items) {
      for (let mes = 1; mes <= 12; mes += 1) {
        await tx.run(insertSql, [uuidv4(), item.id, mes]);
      }
    }
  };
  if (conn !== db) return runner(conn);
  return db.transaction(runner);
}

async function versiones(anio) {
  const params = {};
  const where = anio ? 'WHERE anio = @anio' : '';
  if (anio) params.anio = Number(anio);
  return db.all(`
    SELECT
      v.*,
      (SELECT COUNT(*) FROM proyeccion_item pi WHERE pi.version_id = v.id) AS items,
      (SELECT COUNT(*) FROM proyeccion_mensual pm JOIN proyeccion_item pi ON pi.id = pm.item_id WHERE pi.version_id = v.id AND pm.monto_clp IS NOT NULL) AS celdas_con_valor
    FROM proyeccion_version v
    ${where}
    ORDER BY anio DESC, numero DESC
  `, params);
}

async function activarVersion(id) {
  const version = await versionById(id);
  if (!version) throw new Error('Versión no encontrada');
  await db.transaction(async tx => {
    await tx.run('UPDATE proyeccion_version SET activa = 0 WHERE anio = ?', [version.anio]);
    await tx.run('UPDATE proyeccion_version SET activa = 1 WHERE id = ?', [id]);
  });
  return versionById(id);
}

async function duplicarVersion(id, user = 'sistema') {
  const source = await versionById(id);
  if (!source) throw new Error('Version no encontrada');
  return db.transaction(async tx => {
    const target = await createEmptyVersion({
      anio: source.anio,
      descripcion: `Duplicada desde ${source.nombre}`,
      origen: 'APP',
      createdBy: user,
      activa: 0
    }, tx);
    const itemMap = new Map();
    const sourceItems = await tx.all('SELECT * FROM proyeccion_item WHERE version_id = ? ORDER BY COALESCE(orden_fila, 999999), id', [source.id]);
    for (const item of sourceItems) {
      const newId = uuidv4();
      itemMap.set(item.id, newId);
      await tx.run(`
        INSERT INTO proyeccion_item (id, version_id, iva, proyecto, ms, cliente_id, cliente, dp, cp, producto, tipo_cp, venta, orden_fila)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [newId, target.id, item.iva, item.proyecto, item.ms, item.cliente_id, item.cliente, item.dp, item.cp, item.producto, item.tipo_cp, item.venta, item.orden_fila]);
    }
    const monthlyRows = await tx.all(`
      SELECT pm.*
      FROM proyeccion_mensual pm
      JOIN proyeccion_item pi ON pi.id = pm.item_id
      WHERE pi.version_id = ?
    `, [source.id]);
    for (const row of monthlyRows) {
      await tx.run(`
        INSERT INTO proyeccion_mensual (
          id, item_id, mes, cantidad_uf, uf_fija, uf_proyectada, uf_manual, monto_clp, monto_clp_manual,
          modo_calculo, submodo_uf, origen_valor, es_manual, observacion
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [uuidv4(), itemMap.get(row.item_id), row.mes, row.cantidad_uf, row.uf_fija, row.uf_proyectada, row.uf_manual,
        row.monto_clp, row.monto_clp_manual, row.modo_calculo, row.submodo_uf, row.origen_valor, row.es_manual, row.observacion]);
    }
    return target;
  });
}

async function crearVersionDesdeActiva(input = {}, user = 'sistema') {
  const anio = Number(input.anio) || new Date().getFullYear();
  const source = input.sourceVersionId ? await versionById(input.sourceVersionId) : await activeVersion(anio);
  if (source) return duplicarVersion(source.id, user);
  return createEmptyVersion({ anio, descripcion: input.descripcion, createdBy: user, activa: 1 });
}

async function renombrarVersion(id, input = {}) {
  const version = await versionById(id);
  if (!version) throw new Error('Versión no encontrada');
  const nombre = clean(input.nombre) || version.nombre;
  await db.run('UPDATE proyeccion_version SET nombre = ?, descripcion = ? WHERE id = ?',
    [nombre, clean(input.descripcion || version.descripcion), id]);
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

async function grilla(query = {}) {
  const version = await resolveVersion(query);
  await ensureMonthlyRows(version.id);
  const { where, params } = gridWhere(query, version);
  const limit = Math.min(Number(query.limit) || 400, 1000);
  const items = await db.all(`
    SELECT pi.*
    FROM proyeccion_item pi
    WHERE ${where.join(' AND ')}
    ORDER BY COALESCE(pi.orden_fila, 999999), pi.id
    LIMIT ${limit}
  `, params);
  const ids = items.map(item => item.id);
  const mensual = ids.length
    ? await db.all(`
        SELECT pm.*
        FROM proyeccion_mensual pm
        WHERE pm.item_id IN (${ids.map((_, i) => `@id${i}`).join(',')})
        ORDER BY pm.item_id, pm.mes
      `, ids.reduce((acc, id, i) => ({ ...acc, [`id${i}`]: id }), {}))
    : [];
  const byItem = mensual.reduce((map, row) => {
    if (!map.has(row.item_id)) map.set(row.item_id, []);
    map.get(row.item_id)[row.mes - 1] = row;
    return map;
  }, new Map());

  return {
    version,
    items: items.map(item => ({ ...item, meses: byItem.get(item.id) || [] })),
    total: (await db.get(`SELECT COUNT(*) AS total FROM proyeccion_item pi WHERE ${where.join(' AND ')}`, params)).total,
    filtros: {
      versiones: await versiones(version.anio),
      clientes: await db.all("SELECT DISTINCT cliente, cliente_id FROM proyeccion_item WHERE version_id = ? AND cliente IS NOT NULL AND cliente <> '' ORDER BY cliente", [version.id]),
      productos: (await db.all("SELECT DISTINCT producto FROM proyeccion_item WHERE version_id = ? AND producto IS NOT NULL AND producto <> '' ORDER BY producto", [version.id])).map(r => r.producto),
      tiposCp: (await db.all("SELECT DISTINCT tipo_cp FROM proyeccion_item WHERE version_id = ? AND tipo_cp IS NOT NULL AND tipo_cp <> '' ORDER BY tipo_cp", [version.id])).map(r => r.tipo_cp),
      iva: (await db.all("SELECT DISTINCT iva FROM proyeccion_item WHERE version_id = ? AND iva IS NOT NULL AND iva <> '' ORDER BY iva", [version.id])).map(r => r.iva),
      ms: (await db.all("SELECT DISTINCT ms FROM proyeccion_item WHERE version_id = ? AND ms IS NOT NULL AND ms <> '' ORDER BY ms", [version.id])).map(r => r.ms)
    }
  };
}

async function monthlySummaryForVersion(query = {}) {
  const version = await resolveVersion(query);
  await ensureMonthlyRows(version.id);
  const { where, params } = gridWhere(query, version);
  const ufByMonth = (await ufRows(version.anio, query)).reduce((acc, row) => {
    acc[row.mes] = row;
    return acc;
  }, {});
  const rows = await db.all(`
    SELECT pm.mes, pm.cantidad_uf, pm.uf_fija, pm.uf_proyectada, pm.monto_clp
    FROM proyeccion_mensual pm
    JOIN proyeccion_item pi ON pi.id = pm.item_id
    WHERE ${where.join(' AND ')}
    ORDER BY pm.mes
  `, params);
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
    const ufMes = ufByMonth[Number(row.mes)] || {};
    const ufBase = Number(row.uf_proyectada || row.uf_fija || ufMes.uf_manual || ufMes.uf_proyectada || ufMes.uf_fija || 0);
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

async function existingItem(versionId, item, conn = db) {
  return conn.get(`
    SELECT *
    FROM proyeccion_item
    WHERE version_id = ?
      AND COALESCE(iva, '') = COALESCE(?, '')
      AND COALESCE(proyecto, '') = COALESCE(?, '')
      AND COALESCE(ms, '') = COALESCE(?, '')
      AND COALESCE(cliente, '') = COALESCE(?, '')
      AND COALESCE(dp, '') = COALESCE(?, '')
      AND COALESCE(cp, '') = COALESCE(?, '')
      AND COALESCE(producto, '') = COALESCE(?, '')
      AND COALESCE(tipo_cp, '') = COALESCE(?, '')
    LIMIT 1
  `, [versionId, item.iva, item.proyecto, item.ms, item.cliente, item.dp, item.cp, item.producto, item.tipo_cp]);
}

async function upsertVersionItem(versionId, item, options = {}, conn = db) {
  const existing = await existingItem(versionId, item, conn);
  if (existing) {
    await conn.run(`
      UPDATE proyeccion_item
      SET cliente_id=?, venta=?, orden_fila=?, updated_at=?
      WHERE id=?
    `, [item.cliente_id, item.venta, item.orden_fila, db.nowText(), existing.id]);
    return { id: existing.id, action: 'actualizar' };
  }

  const itemId = uuidv4();
  await conn.run(`
    INSERT INTO proyeccion_item (id, version_id, iva, proyecto, ms, cliente_id, cliente, dp, cp, producto, tipo_cp, venta, orden_fila)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [itemId, versionId, item.iva, item.proyecto, item.ms, item.cliente_id, item.cliente, item.dp, item.cp, item.producto, item.tipo_cp, item.venta, item.orden_fila]);
  return { id: itemId, action: options.action || 'crear' };
}

async function upsertImportedMonth(itemId, mes, conn = db) {
  const existing = await conn.get('SELECT * FROM proyeccion_mensual WHERE item_id = ? AND mes = ?', [itemId, Number(mes.mes)]);
  const montoRaw = parseNumber(mes.monto_clp);
  const monto = montoRaw == null ? null : Math.round(montoRaw);
  if (existing) {
    const isManualProtected = existing.es_manual && existing.origen_valor !== 'EXCEL_IMPORTADO';
    if (isManualProtected) return { action: 'respetar_manual' };
    await conn.run(`
      UPDATE proyeccion_mensual
      SET monto_clp=?, monto_clp_manual=?, modo_calculo='MANUAL_CLP', origen_valor='EXCEL_IMPORTADO',
          es_manual=1, updated_at=?
      WHERE id=?
    `, [monto, monto, db.nowText(), existing.id]);
    return { action: 'actualizar' };
  }
  await conn.run(`
    INSERT INTO proyeccion_mensual (
      id, item_id, mes, monto_clp, monto_clp_manual, modo_calculo, origen_valor, es_manual, observacion
    )
    VALUES (?, ?, ?, ?, ?, 'MANUAL_CLP', 'EXCEL_IMPORTADO', 1, ?)
  `, [uuidv4(), itemId, Number(mes.mes), monto, monto, 'Importado desde Excel']);
  return { action: 'crear' };
}

async function monthlyContext(id) {
  return db.get(`
    SELECT pm.*, pi.iva, pi.proyecto, pi.ms, pi.cliente, pi.cliente_id, pi.dp, pi.cp, pi.producto, pi.tipo_cp, pi.venta, pv.anio
    FROM proyeccion_mensual pm
    JOIN proyeccion_item pi ON pi.id = pm.item_id
    JOIN proyeccion_version pv ON pv.id = pi.version_id
    WHERE pm.id = ?
  `, [id]);
}

async function ufForMonth(anio, mes) {
  return await db.get('SELECT * FROM proyeccion_uf WHERE anio = ? AND mes = ?', [anio, mes]) || {};
}

async function calcularMensual(input, ctx) {
  const modo = clean(input.modo_calculo || ctx.modo_calculo || 'UF_PROYECTADA');
  const submodo = clean(input.submodo_uf || ctx.submodo_uf || 'UF_PROYECTADA') || null;
  const ufMes = await ufForMonth(ctx.anio, ctx.mes);
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

async function actualizarMensual(id, input = {}) {
  const ctx = await monthlyContext(id);
  if (!ctx) throw new Error('Proyeccion mensual no encontrada');
  const data = await calcularMensual(input, ctx);
  await db.run(`
    UPDATE proyeccion_mensual
    SET cantidad_uf=?, uf_fija=?, uf_proyectada=?, uf_manual=?, monto_clp=?, monto_clp_manual=?,
        modo_calculo=?, submodo_uf=?, origen_valor=?, es_manual=?, observacion=?, updated_at=?
    WHERE id=?
  `, [data.cantidad_uf, data.uf_fija, data.uf_proyectada, data.uf_manual, data.monto_clp, data.monto_clp_manual,
    data.modo_calculo, data.submodo_uf, data.origen_valor, data.es_manual, data.observacion, db.nowText(), id]);
  return monthlyContext(id);
}

async function recalcular(input = {}) {
  const version = await resolveVersion(input);
  const { where, params } = gridWhere(input, version);
  const rows = await db.all(`
    SELECT pm.id, pm.modo_calculo, pm.submodo_uf, pm.uf_manual, pm.cantidad_uf, pm.monto_clp, pi.version_id
    FROM proyeccion_mensual pm
    JOIN proyeccion_item pi ON pi.id = pm.item_id
    WHERE ${where.join(' AND ')}
  `, params);
  const stats = { recalculadas: 0, manuales_respetadas: 0, advertencias: 0, cambios: [] };
  const apply = !!input.confirm;
  for (const row of rows) {
    if (row.modo_calculo === 'MANUAL_CLP') {
      stats.manuales_respetadas += 1;
      continue;
    }
    const ctx = await monthlyContext(row.id);
    const data = await calcularMensual({
      modo_calculo: row.modo_calculo,
      submodo_uf: row.submodo_uf,
      cantidad_uf: row.cantidad_uf,
      uf_manual: row.uf_manual,
      observacion: ctx.observacion
    }, ctx);
    if (data.monto_clp == null) {
      stats.advertencias += 1;
      continue;
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
      if (apply) await actualizarMensual(row.id, data);
    }
  }
  return stats;
}

async function monthlyTotals(versionId) {
  return (await db.all(`
    SELECT pm.mes, SUM(COALESCE(pm.monto_clp, 0)) AS total
    FROM proyeccion_mensual pm
    JOIN proyeccion_item pi ON pi.id = pm.item_id
    WHERE pi.version_id = ?
    GROUP BY pm.mes
  `, [versionId])).reduce((acc, row) => {
    acc[row.mes] = row.total;
    return acc;
  }, {});
}

async function compararVersiones(query = {}) {
  const base = await versionById(query.baseVersionId);
  const compare = await versionById(query.compareVersionId);
  if (!base || !compare) throw new Error('Debes indicar dos versiones válidas');
  const a = await monthlyTotals(base.id);
  const b = await monthlyTotals(compare.id);
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
    const base = await rowBase(row, headers, detectedAnio, resolved, rowNumber);
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

  return {
    anio: meta?.anio || detectedAnio,
    meta,
    meta_anual: metaAnual,
    source: resolved,
    hoja: ws.name,
    header_row: headerRow,
    items,
    omitidas,
    auxiliares: auxiliaryRowsFromWorkbook(workbook, meta?.anio || detectedAnio, resolved)
  };
}

function roundedComparable(value) {
  const n = parseNumber(value);
  return n == null ? null : Math.round(n);
}

function firstImportedAmount(item) {
  const month = (item.meses || []).find(m => m.monto_clp != null);
  return month ? roundedComparable(month.monto_clp) : null;
}

function previewChange(action, item, change = {}) {
  return {
    accion: action,
    orden_fila: item.orden_fila,
    cliente: item.cliente,
    ms: item.ms,
    proyecto: item.proyecto,
    columna: change.columna || '',
    valor_excel: change.valor_excel ?? firstImportedAmount(item),
    valor_actual: change.valor_actual ?? null,
    motivo: change.motivo || item.advertencia || ''
  };
}

async function compareImportAgainstActive(parsed) {
  const current = await activeVersion(parsed.anio);
  const stats = {
    version_actual: current,
    filas_nuevas: 0,
    filas_actualizadas: 0,
    filas_sin_cambios: 0,
    celdas_actualizadas: 0,
    total_cambios: 0,
    sin_cambios: false
  };
  const changes = [];
  const unchanged = [];

  if (!current) {
    stats.filas_nuevas = parsed.items.length;
    stats.total_cambios = parsed.items.length;
    return {
      ...stats,
      preview: parsed.items.slice(0, 20).map(item => previewChange('crear_fila', item, { columna: 'Fila', motivo: 'No hay version activa para comparar' }))
    };
  }

  for (const item of parsed.items) {
    const existing = await existingItem(current.id, item);
    if (!existing) {
      stats.filas_nuevas += 1;
      stats.total_cambios += 1;
      changes.push(previewChange('crear_fila', item, { columna: 'Fila', motivo: 'Fila nueva en el Excel' }));
      continue;
    }

    const monthly = (await db.all('SELECT mes, monto_clp FROM proyeccion_mensual WHERE item_id = ?', [existing.id]))
      .reduce((acc, row) => {
        acc[Number(row.mes)] = roundedComparable(row.monto_clp);
        return acc;
      }, {});
    let itemChanged = false;

    const ventaExcel = roundedComparable(item.venta);
    const ventaActual = roundedComparable(existing.venta);
    if (ventaExcel !== ventaActual) {
      itemChanged = true;
      stats.celdas_actualizadas += 1;
      changes.push(previewChange('actualizar', item, {
        columna: 'VENTA',
        valor_excel: ventaExcel,
        valor_actual: ventaActual,
        motivo: 'Venta distinta'
      }));
    }

    (item.meses || []).forEach(month => {
      const excelValue = roundedComparable(month.monto_clp);
      if (excelValue == null) return;
      const actualValue = monthly[Number(month.mes)] ?? null;
      if (excelValue === actualValue) return;
      itemChanged = true;
      stats.celdas_actualizadas += 1;
      changes.push(previewChange('actualizar', item, {
        columna: MESES[Number(month.mes) - 1] || `Mes ${month.mes}`,
        valor_excel: excelValue,
        valor_actual: actualValue,
        motivo: 'Valor mensual distinto'
      }));
    });

    if (itemChanged) {
      stats.filas_actualizadas += 1;
    } else {
      stats.filas_sin_cambios += 1;
      unchanged.push(previewChange('sin_cambios', item, {
        columna: 'Fila',
        valor_excel: firstImportedAmount(item),
        valor_actual: firstImportedAmount(item),
        motivo: 'Sin cambios respecto a la version activa'
      }));
    }
  }

  stats.total_cambios = stats.filas_nuevas + stats.celdas_actualizadas;
  stats.sin_cambios = stats.total_cambios === 0;
  return {
    ...stats,
    preview: (stats.sin_cambios ? unchanged : changes).slice(0, 20)
  };
}

async function importPreview(input = {}) {
  const parsed = await parseExcelVersionRows(input);
  const comparison = await compareImportAgainstActive(parsed);
  return {
    anio: parsed.anio,
    version: parsed.meta,
    meta_anual: parsed.meta_anual,
    source: parsed.source,
    hoja: parsed.hoja,
    header_row: parsed.header_row,
    total_items: parsed.items.length,
    omitidas: parsed.omitidas,
    resumen_cambios: {
      version_actual: comparison.version_actual,
      filas_nuevas: comparison.filas_nuevas,
      filas_actualizadas: comparison.filas_actualizadas,
      filas_sin_cambios: comparison.filas_sin_cambios,
      celdas_actualizadas: comparison.celdas_actualizadas,
      total_cambios: comparison.total_cambios,
      sin_cambios: comparison.sin_cambios
    },
    preview: comparison.preview
  };
}

async function importConfirm(input = {}, user = 'sistema') {
  const parsed = input.items ? {
    anio: Number(input.anio) || new Date().getFullYear(),
    source: clean(input.source || 'preview'),
    items: input.items
  } : await parseExcelVersionRows(input);

  return db.transaction(async tx => {
    const meta = parsed.meta || versionMetaFromSource(parsed.source, parsed.anio);
    const fallbackMetaAnual = parsed.meta_anual ?? (await activeVersion(parsed.anio, tx) || {}).meta_anual ?? null;
    let version = null;
    if (meta) {
      version = await tx.get('SELECT * FROM proyeccion_version WHERE anio = ? AND numero = ?', [meta.anio, meta.numero]);
    }
    if (!version) {
      version = meta
        ? await createVersion({ ...meta, meta_anual: fallbackMetaAnual, descripcion: `Importado desde ${parsed.source}`, origen: 'EXCEL_IMPORTADO', createdBy: user, activa: 0 }, tx)
        : await createEmptyVersion({ anio: parsed.anio, descripcion: `Importado desde ${parsed.source}`, origen: 'EXCEL_IMPORTADO', createdBy: user, activa: 0 }, tx);
    } else {
      await tx.run('UPDATE proyeccion_version SET nombre=?, fecha_version=?, origen=?, descripcion=?, meta_anual=COALESCE(?, meta_anual) WHERE id=?',
        [meta.nombre, meta.fecha_version, 'EXCEL_IMPORTADO', `Reimportado desde ${parsed.source}`, parsed.meta_anual, version.id]);
      version = await versionById(version.id, tx);
    }
    let itemsCreados = 0;
    let itemsActualizados = 0;
    let celdasCreadas = 0;
    let manualesRespetadas = 0;
    for (const item of parsed.items) {
      const upsert = await upsertVersionItem(version.id, item, {}, tx);
      const itemId = upsert.id;
      if (upsert.action === 'crear') itemsCreados += 1;
      else itemsActualizados += 1;
      for (const mes of (item.meses || [])) {
        if (mes.monto_clp == null) continue;
        const result = await upsertImportedMonth(itemId, mes, tx);
        if (result.action === 'respetar_manual') manualesRespetadas += 1;
        else celdasCreadas += 1;
      }
    }
    if (parsed.auxiliares && parsed.auxiliares.length) {
      await tx.run('DELETE FROM proyeccion_auxiliar WHERE anio = ? AND source = ?', [parsed.anio, parsed.source]);
      for (const row of parsed.auxiliares) {
        await tx.run(`
          INSERT INTO proyeccion_auxiliar (id, anio, hoja, fila, data_json, source)
          VALUES (?, ?, ?, ?, ?, ?)
        `, [uuidv4(), row.anio, row.hoja, row.fila, JSON.stringify(row.values), row.source]);
      }
    }
    return {
      version,
      stats: {
        items_creados: itemsCreados,
        items_actualizados: itemsActualizados,
        celdas_creadas: celdasCreadas,
        manuales_respetadas: manualesRespetadas,
        auxiliares: (parsed.auxiliares || []).length,
        omitidas: parsed.omitidas || []
      }
    };
  });
}

async function resumen(query = {}) {
  const anio = Number(query.anio) || new Date().getFullYear();
  const resumenVersion = await monthlySummaryForVersion({ ...query, anio });
  const vistaGeneral = await grilla({ ...query, anio, limit: 1 });
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
      filtros: vistaGeneral.filtros
    }
  };
}

async function exportWorkbook(query = {}) {
  const anio = Number(query.anio) || new Date().getFullYear();
  const moneda = key(query.moneda || 'CLP');
  const modoUf = key(query.modoUf || 'PROYECTADA');
  const wb = new ExcelJS.Workbook();
  const { version, rows } = await versionedRowsForExport({ ...query, anio });
  wb.creator = 'FactuFlow';
  wb.created = new Date();
  const ws = wb.addWorksheet(`Venta Plataformas ${anio}`);
  ws.addRow([]);
  ws.addRow(COLUMNAS_EXPORT);
  ws.getRow(2).font = { bold: true };

  const ufByMonth = (await ufRows(anio)).reduce((acc, row) => {
    acc[row.mes] = row;
    return acc;
  }, {});

  rows.forEach(row => {
    ws.addRow([
      row.iva === 'AFECTO_IVA' ? 'AFECTO' : row.iva === 'EXENTO_IVA' ? 'EXENTO' : row.iva,
      row.proyecto,
      row.ms,
      row.cliente,
      row.dp,
      row.cp,
      row.producto,
      row.tipo_cp,
      row.venta == null ? null : Math.round(Number(row.venta || 0)),
      ...row.meses.map(monthRow => amountForVersionedExport(monthRow, ufByMonth, moneda, modoUf))
    ]);
  });

  ws.columns.forEach(col => { col.width = 16; });
  ws.getColumn(2).width = 34;
  ws.getColumn(4).width = 26;
  ws.getColumn(8).width = 26;
  ws.autoFilter = 'A2:U2';
  ws.views = [{ state: 'frozen', ySplit: 2 }];
  ws.getCell('A1').value = version ? `Version: ${version.nombre}` : '';

  const source = sourceFromVersion(version);
  let auxRows = source
    ? await db.all('SELECT hoja, fila, data_json FROM proyeccion_auxiliar WHERE anio = ? AND source = ? ORDER BY hoja, fila', [anio, source])
    : [];
  if (!auxRows.length) {
    auxRows = await db.all('SELECT hoja, fila, data_json FROM proyeccion_auxiliar WHERE anio = ? ORDER BY hoja, fila', [anio]);
  }
  ['Hoja1', 'Hoja2'].forEach(hoja => {
    const rows = auxRows.filter(row => key(row.hoja) === key(hoja));
    if (!rows.length) return;
    const aux = wb.addWorksheet(hoja === 'Hoja1' ? 'Proyecciones' : hoja);
    normalizedAuxRows(rows).forEach(values => aux.addRow(values));
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
