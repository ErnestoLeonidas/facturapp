const r = require('express').Router();
const db = require('../db-async');
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

function coordinadorScope(req) {
  if (!req.user || req.user.rol === 'admin') return null;
  return req.user.coordinador_id || '__none__';
}

r.get('/', async (req, res, next) => {
  try {
    const anio = Number(req.query.anio) || new Date().getFullYear();
    const mesFiltro = normalizarMes(req.query.mes);
    const clienteId = req.query.cliente_id || req.query.clienteId || null;
    const q = normalizarTexto(req.query.q);

    if (req.query.mes && !mesFiltro) {
      return fail(res, 'VALIDATION_ERROR', 'Mes invalido. Usa un numero entre 1 y 12 o el nombre del mes.');
    }

    let sql = `
      SELECT
        sf.id AS solicitud_id,
        sf.folio AS folio,
        sf.periodo AS periodo,
        sf.estado AS estado,
        co.nombre AS coordinador_nombre,
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
      LEFT JOIN coordinador co ON co.id = sf.coordinador_id
      JOIN solicitud_cp sc ON sc.solicitud_id = sf.id
      JOIN cp ON cp.id = sc.cp_id
      WHERE sf.is_delete = 0
        AND sf.estado IN ('PENDIENTE OC / HES', 'FACTURA SOLICITADA')
        AND sf.empresa_emisora = 'MAS_CONSULTORES'
        AND c.estado = 'Activo'
    `;
    const vals = [];
    const coordinatorId = coordinadorScope(req);
    if (coordinatorId) {
      sql += ' AND sf.coordinador_id = ?';
      vals.push(coordinatorId === '__none__' ? '__sin_coordinador__' : coordinatorId);
    }
    sql += ' ORDER BY sf.periodo, c.nombre_corto, cp.codigo';

    const rowsSolicitudDb = await db.all(sql, vals);

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
          coordinador_nombre: row.coordinador_nombre || '',
          origen: 'solicitud'
        };
      })
      .filter(row => row.anio === anio && row.mes);

    const rowsAnio = rowsSolicitud
      .filter(row => !clienteId || row.cliente_id === clienteId)
      .filter(row => {
        if (!q) return true;
        return [row.cliente, row.codigo, row.nombre, row.tipo_cp, row.tipo_impuesto, row.coordinador_nombre]
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
  } catch (error) {
    next(error);
  }
});

module.exports = r;
