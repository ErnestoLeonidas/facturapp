const r = require('express').Router();
const db = require('../db');
const { ok, fail } = require('../middleware/envelope');

const MESES = [
  'ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO',
  'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'
];

function normalizarTexto(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toUpperCase();
}

function normalizarMes(value) {
  if (value === undefined || value === null || value === '') return null;
  const numero = Number(value);
  if (Number.isInteger(numero) && numero >= 1 && numero <= 12) return numero;
  const idx = MESES.findIndex(m => normalizarTexto(m) === normalizarTexto(value));
  return idx >= 0 ? idx + 1 : null;
}

function fechaParts(fecha) {
  const match = String(fecha || '').match(/^(\d{4})-(\d{1,2})-\d{1,2}/);
  if (!match) return {};
  return { anio: Number(match[1]), mes: Number(match[2]) };
}

function periodoParts(periodo) {
  const match = String(periodo || '').match(/^(\d{4})-(\d{1,2})$/);
  if (!match) return {};
  return { anio: Number(match[1]), mes: Number(match[2]) };
}

function rowKey(row) {
  return [row.cliente_id, row.cp_id || row.codigo || row.nombre, row.anio, row.mes].join('|');
}

function estadoPrioridad(estado) {
  if (estado === 'FACTURADO') return 3;
  if (estado === 'FACTURA SOLICITADA') return 2;
  if (estado === 'PENDIENTE OC / HES') return 1;
  return 0;
}

function mergeRows(baseRows, solicitudRows) {
  const merged = new Map();
  baseRows.forEach(row => merged.set(rowKey(row), row));

  solicitudRows.forEach(row => {
    const key = rowKey(row);
    const existente = merged.get(key);
    if (!existente || estadoPrioridad(row.estado) >= estadoPrioridad(existente.estado)) {
      merged.set(key, { ...(existente || {}), ...row, origen: existente ? 'proyeccion_solicitud' : 'solicitud' });
    }
  });

  return Array.from(merged.values());
}

function resumenPorMes(rows) {
  return MESES.map((nombre, i) => {
    const mes = i + 1;
    const rowsMes = rows.filter(row => row.mes === mes);
    const clientes = new Set(rowsMes.map(row => row.cliente_id));
    return {
      mes,
      nombre,
      total: rowsMes.length,
      clientes: clientes.size
    };
  });
}

r.get('/', (req, res) => {
  const anio = Number(req.query.anio) || new Date().getFullYear();
  const mesFiltro = normalizarMes(req.query.mes);
  const clienteId = req.query.cliente_id || req.query.clienteId || null;
  const q = normalizarTexto(req.query.q);

  if (req.query.mes && !mesFiltro) {
    return fail(res, 'VALIDATION_ERROR', 'Mes invalido. Usa un numero entre 1 y 12 o el nombre del mes.');
  }

  const rowsProyeccionDb = db.prepare(`
    SELECT
      pf.cliente_id AS cliente_id,
      COALESCE(pf.cliente, c.nombre_corto) AS cliente,
      cp.id AS cp_id,
      COALESCE(pf.codigo, cp.codigo) AS codigo,
      COALESCE(pf.nombre, cp.nombre) AS nombre,
      COALESCE(pf.tipo_cp, cp.tipo_cp) AS tipo_cp,
      pf.tipo_impuesto AS tipo_impuesto,
      pf.mes AS mes,
      pf.anio AS anio,
      pf.monto_uf AS monto_uf,
      pf.moneda AS moneda,
      pf.estado AS estado,
      pf.observaciones AS observaciones,
      pf.fecha_estimada_facturacion AS fecha_estimada_facturacion,
      pf.codigo_facturacion AS codigo_facturacion
    FROM proyeccion_facturacion pf
    JOIN cliente c ON c.id = pf.cliente_id
    LEFT JOIN cp ON cp.cliente_id = pf.cliente_id AND cp.codigo = pf.codigo AND cp.activo = 1
    WHERE 1 = 1
      AND c.estado = 'Activo'
    ORDER BY COALESCE(pf.cliente, c.nombre_corto), pf.codigo, pf.nombre
  `).all();

  const rowsSolicitudDb = db.prepare(`
    SELECT
      sf.id AS solicitud_id,
      sf.folio AS folio,
      sf.periodo AS periodo,
      sf.estado AS estado,
      c.id AS cliente_id,
      c.nombre_corto AS cliente,
      cp.id AS cp_id,
      cp.codigo AS codigo,
      cp.nombre AS nombre,
      cp.tipo_cp AS tipo_cp
    FROM solicitud_factura sf
    JOIN cliente c ON c.id = sf.cliente_id
    JOIN solicitud_cp sc ON sc.solicitud_id = sf.id
    JOIN cp ON cp.id = sc.cp_id
    WHERE sf.is_delete = 0
      AND sf.estado IN ('PENDIENTE OC / HES', 'FACTURA SOLICITADA', 'FACTURADO')
      AND c.estado = 'Activo'
    ORDER BY sf.periodo, c.nombre_corto, cp.codigo
  `).all();

  const rowsProyeccion = rowsProyeccionDb
    .map(row => {
      const fecha = fechaParts(row.fecha_estimada_facturacion);
      const mes = normalizarMes(row.mes) || fecha.mes;
      const anioRow = Number(row.anio) || fecha.anio;

      return {
        cliente_id: row.cliente_id,
        cliente: row.cliente,
        cp_id: row.cp_id,
        codigo: row.codigo || '',
        nombre: row.nombre || '',
        tipo_cp: row.tipo_cp || '',
        mes,
        mes_nombre: mes ? MESES[mes - 1] : '',
        anio: anioRow,
        estado: row.estado || '',
        monto_uf: row.monto_uf,
        moneda: row.moneda || '',
        fecha_estimada_facturacion: row.fecha_estimada_facturacion || '',
        observaciones: row.observaciones || '',
        codigo_facturacion: row.codigo_facturacion || '',
        tipo_impuesto: row.tipo_impuesto || '',
        origen: 'proyeccion'
      };
    })
    .filter(row => row.anio === anio && row.mes);

  const rowsSolicitud = rowsSolicitudDb
    .map(row => {
      const periodo = periodoParts(row.periodo);
      const mes = periodo.mes;
      return {
        solicitud_id: row.solicitud_id,
        folio: row.folio,
        cliente_id: row.cliente_id,
        cliente: row.cliente,
        cp_id: row.cp_id,
        codigo: row.codigo || '',
        nombre: row.nombre || '',
        tipo_cp: row.tipo_cp || '',
        mes,
        mes_nombre: mes ? MESES[mes - 1] : '',
        anio: periodo.anio,
        estado: row.estado || '',
        origen: 'solicitud'
      };
    })
    .filter(row => row.anio === anio && row.mes);

  const rowsAnio = mergeRows(rowsProyeccion, rowsSolicitud)
    .filter(row => !clienteId || row.cliente_id === clienteId)
    .filter(row => {
      if (!q) return true;
      return [row.cliente, row.codigo, row.nombre, row.tipo_cp, row.codigo_facturacion]
        .some(value => normalizarTexto(value).includes(q));
    })
    .sort((a, b) => (
      a.mes - b.mes
      || a.cliente.localeCompare(b.cliente, 'es')
      || a.codigo.localeCompare(b.codigo, 'es')
      || a.nombre.localeCompare(b.nombre, 'es')
    ));
  const rows = rowsAnio.filter(row => !mesFiltro || row.mes === mesFiltro);

  ok(res, {
    anio,
    mes: mesFiltro,
    rows,
    resumen: resumenPorMes(rowsAnio)
  });
});

module.exports = r;
