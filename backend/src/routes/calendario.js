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

function periodoParts(periodo) {
  const match = String(periodo || '').match(/^(\d{4})-(\d{1,2})$/);
  if (!match) return {};
  return { anio: Number(match[1]), mes: Number(match[2]) };
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
      cp.tipo_cp AS tipo_cp,
      'AFECTO_IVA' AS tipo_impuesto
    FROM solicitud_factura sf
    JOIN cliente c ON c.id = sf.cliente_id
    JOIN empresa_emisora e ON e.codigo = sf.empresa_emisora
    JOIN solicitud_cp sc ON sc.solicitud_id = sf.id
    JOIN cp ON cp.id = sc.cp_id
    WHERE sf.is_delete = 0
      AND sf.estado IN ('PENDIENTE OC / HES', 'FACTURA SOLICITADA')
      AND sf.empresa_emisora = 'MAS_CONSULTORES'
      AND c.estado = 'Activo'
    ORDER BY sf.periodo, c.nombre_corto, cp.codigo
  `).all();

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
        tipo_impuesto: row.tipo_impuesto || '',
        mes,
        mes_nombre: mes ? MESES[mes - 1] : '',
        anio: periodo.anio,
        estado: row.estado || '',
        origen: 'solicitud'
      };
    })
    .filter(row => row.anio === anio && row.mes);

  const rowsAnio = rowsSolicitud
    .filter(row => !clienteId || row.cliente_id === clienteId)
    .filter(row => {
      if (!q) return true;
      return [row.cliente, row.codigo, row.nombre, row.tipo_cp, row.tipo_impuesto, row.codigo_facturacion]
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
