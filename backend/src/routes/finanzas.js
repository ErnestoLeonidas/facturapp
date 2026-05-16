const r = require('express').Router();
const db = require('../db');
const { ok } = require('../middleware/envelope');

const MESES = {
  ENERO: 1,
  FEBRERO: 2,
  MARZO: 3,
  ABRIL: 4,
  MAYO: 5,
  JUNIO: 6,
  JULIO: 7,
  AGOSTO: 8,
  SEPTIEMBRE: 9,
  OCTUBRE: 10,
  NOVIEMBRE: 11,
  DICIEMBRE: 12
};

const TIPOS_IMPUESTO_FLUJO = new Set(['AFECTO_IVA', 'EXENTO_IVA', 'SIN DEFINIR']);

function normalizarTexto(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toUpperCase();
}

function normalizarMes(value) {
  const n = Number(value);
  if (Number.isInteger(n) && n >= 1 && n <= 12) return n;
  return MESES[normalizarTexto(value)] || null;
}

function normalizarTipoImpuesto(value) {
  const tipo = normalizarTexto(value);
  return tipo || 'SIN DEFINIR';
}

function normalizarEstado(value) {
  const estado = normalizarTexto(value);
  return estado || 'SIN ESTADO';
}

function montoUF(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function estadoBucket(estado) {
  const e = normalizarEstado(estado);
  if (e.includes('PAGAD')) return 'pagado';
  if (e.includes('SOLICITAD')) return 'solicitado';
  if (e.includes('PENDIENT')) return 'pendiente';
  return 'pendiente';
}

function addTotals(target, row) {
  const uf = montoUF(row.monto_uf);
  const tipo = normalizarTipoImpuesto(row.tipo_impuesto);
  const bucket = estadoBucket(row.estado);

  target.total_uf += uf;
  if (tipo === 'AFECTO_IVA') target.total_afecto_uf += uf;
  else if (tipo === 'EXENTO_IVA') target.total_exento_uf += uf;

  if (bucket === 'pendiente') target.total_pendiente_uf += uf;
  if (bucket === 'solicitado') target.total_solicitado_uf += uf;
  if (bucket === 'facturado') target.total_facturado_uf += uf;
  if (bucket === 'pagado') target.total_pagado_uf += uf;
}

function emptyFlujoGroup({ anio, mes, tipo_impuesto, estado }) {
  return {
    anio,
    mes,
    tipo_impuesto,
    estado,
    total_uf: 0,
    total_afecto_uf: 0,
    total_exento_uf: 0,
    total_pendiente_uf: 0,
    total_solicitado_uf: 0,
    total_facturado_uf: 0,
    total_pagado_uf: 0,
    filas: 0,
    filas_sin_monto: 0
  };
}

function proyecciones() {
  return db.prepare(`
    SELECT
      pf.id,
      pf.cliente_id,
      COALESCE(pf.cliente, c.nombre_corto) AS cliente,
      pf.codigo AS ms,
      pf.nombre AS producto,
      pf.tipo_cp,
      pf.tipo_impuesto,
      pf.mes,
      pf.anio,
      pf.monto_uf,
      pf.moneda,
      pf.estado,
      pf.observaciones,
      pf.fecha_estimada_facturacion
    FROM proyeccion_facturacion pf
    LEFT JOIN cliente c ON c.id = pf.cliente_id
  `).all();
}

function separarCompletitud(rows) {
  const completas = [];
  const incompletas = [];
  rows.forEach(row => {
    const mes = normalizarMes(row.mes);
    const anio = Number(row.anio);
    const out = {
      ...row,
      mes_normalizado: mes,
      anio_normalizado: Number.isInteger(anio) ? anio : null,
      tipo_impuesto: normalizarTipoImpuesto(row.tipo_impuesto),
      estado: normalizarEstado(row.estado),
      monto_uf: montoUF(row.monto_uf),
      monto_uf_faltante: row.monto_uf === null || row.monto_uf === undefined || row.monto_uf === ''
    };
    if (!out.mes_normalizado || !out.anio_normalizado) incompletas.push(out);
    else completas.push(out);
  });
  return { completas, incompletas };
}

r.get('/flujo-caja', (req, res) => {
  const { completas, incompletas } = separarCompletitud(proyecciones());
  const mesFiltro = normalizarMes(req.query.mes);
  const anioFiltro = req.query.anio ? Number(req.query.anio) : null;
  const groups = new Map();

  completas
    .filter(row => TIPOS_IMPUESTO_FLUJO.has(row.tipo_impuesto))
    .filter(row => !mesFiltro || row.mes_normalizado === mesFiltro)
    .filter(row => !Number.isInteger(anioFiltro) || row.anio_normalizado === anioFiltro)
    .forEach(row => {
      const key = [row.anio_normalizado, row.mes_normalizado, row.tipo_impuesto, row.estado].join('|');
      if (!groups.has(key)) {
        groups.set(key, emptyFlujoGroup({
          anio: row.anio_normalizado,
          mes: row.mes_normalizado,
          tipo_impuesto: row.tipo_impuesto,
          estado: row.estado
        }));
      }
      const group = groups.get(key);
      addTotals(group, row);
      group.filas += 1;
      if (row.monto_uf_faltante) group.filas_sin_monto += 1;
    });

  const rows = Array.from(groups.values()).sort((a, b) => (
    a.anio - b.anio || a.mes - b.mes || a.tipo_impuesto.localeCompare(b.tipo_impuesto, 'es') || a.estado.localeCompare(b.estado, 'es')
  ));
  const resumen = emptyFlujoGroup({ anio: null, mes: null, tipo_impuesto: 'TOTAL', estado: 'TOTAL' });
  rows.forEach(row => {
    Object.keys(resumen).forEach(key => {
      if (key.startsWith('total_') || key === 'filas' || key === 'filas_sin_monto') resumen[key] += row[key] || 0;
    });
  });

  ok(res, {
    resumen,
    rows,
    filtros: {
      mes: mesFiltro,
      anio: Number.isInteger(anioFiltro) ? anioFiltro : null
    },
    incompletos: incompletas
      .filter(row => TIPOS_IMPUESTO_FLUJO.has(row.tipo_impuesto))
      .filter(row => !mesFiltro || row.mes_normalizado === mesFiltro)
      .filter(row => !Number.isInteger(anioFiltro) || row.anio_normalizado === anioFiltro)
  });
});

function estadoGeneral(estados) {
  const unique = Array.from(new Set(estados.map(normalizarEstado)));
  if (!unique.length) return 'SIN ESTADO';
  if (unique.every(e => e.includes('PAGAD'))) return 'PAGADO';
  if (unique.some(e => e.includes('SOLICITAD'))) return 'FACTURA SOLICITADA';
  if (unique.some(e => e.includes('PENDIENT'))) return 'PENDIENTE';
  return unique.length === 1 ? unique[0] : 'VARIOS';
}

r.get('/rentabilidad-cp', (req, res) => {
  const { completas, incompletas } = separarCompletitud(proyecciones());
  const groups = new Map();

  completas.forEach(row => {
    const key = [
      row.cliente_id || '',
      row.cliente || '',
      row.ms || '',
      row.producto || '',
      row.tipo_cp || '',
      row.tipo_impuesto
    ].join('|');
    if (!groups.has(key)) {
      groups.set(key, {
        cliente_id: row.cliente_id || null,
        cliente: row.cliente || '',
        ms: row.ms || '',
        producto: row.producto || '',
        tipo_cp: row.tipo_cp || '',
        tipo_impuesto: row.tipo_impuesto,
        total_uf: 0,
        cantidad_meses: 0,
        meses_asociados: '',
        estado_general: '',
        filas: 0,
        filas_sin_monto: 0,
        _meses: new Set(),
        _estados: []
      });
    }
    const group = groups.get(key);
    group.total_uf += montoUF(row.monto_uf);
    group._meses.add(`${row.anio_normalizado}-${String(row.mes_normalizado).padStart(2, '0')}`);
    group._estados.push(row.estado);
    group.filas += 1;
    if (row.monto_uf_faltante) group.filas_sin_monto += 1;
  });

  const rows = Array.from(groups.values()).map(group => {
    const meses = Array.from(group._meses).sort();
    return {
      cliente_id: group.cliente_id,
      cliente: group.cliente,
      ms: group.ms,
      producto: group.producto,
      tipo_cp: group.tipo_cp,
      tipo_impuesto: group.tipo_impuesto,
      total_uf: group.total_uf,
      cantidad_meses: meses.length,
      meses_asociados: meses.join(', '),
      estado_general: estadoGeneral(group._estados),
      filas: group.filas,
      filas_sin_monto: group.filas_sin_monto
    };
  }).sort((a, b) => (
    a.cliente.localeCompare(b.cliente, 'es') || a.ms.localeCompare(b.ms, 'es') || a.producto.localeCompare(b.producto, 'es')
  ));

  ok(res, {
    resumen: {
      total_uf: rows.reduce((sum, row) => sum + row.total_uf, 0),
      total_ms: rows.length,
      filas_sin_monto: rows.reduce((sum, row) => sum + row.filas_sin_monto, 0)
    },
    rows,
    incompletos: incompletas
  });
});

module.exports = r;
