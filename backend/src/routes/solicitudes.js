const r = require('express').Router();
const db = require('../db');
const { v4: uuidv4 } = require('uuid');
const { ok, fail, notFound } = require('../middleware/envelope');
const { cambiarEstado, puedeEditar } = require('../services/estados');
const { generarFolio } = require('../utils/folio');

function hydrateOne(sol) {
  if (!sol) return null;
  sol.items = db.prepare('SELECT * FROM solicitud_item WHERE solicitud_id = ? ORDER BY orden').all(sol.id);
  sol.cps = db.prepare(`SELECT sc.*, cp.codigo, cp.nombre as cp_nombre, cp.area
    FROM solicitud_cp sc JOIN cp ON cp.id = sc.cp_id WHERE sc.solicitud_id = ? ORDER BY sc.orden`).all(sol.id);
  sol.receptores = db.prepare(`SELECT r.* FROM receptor r JOIN solicitud_receptor sr ON sr.receptor_id = r.id WHERE sr.solicitud_id = ?`).all(sol.id);
  sol.cliente = db.prepare('SELECT * FROM cliente WHERE id = ?').get(sol.cliente_id);
  if (sol.cliente) {
    sol.cliente.receptores = receptoresActivosCliente(sol.cliente_id);
    sol.cliente.cps = db.prepare('SELECT * FROM cp WHERE cliente_id = ? AND activo = 1 ORDER BY codigo').all(sol.cliente_id);
  }
  if (!sol.coordinador_id) {
    const sugerido = coordinadorSugeridoSolicitud(sol.id, sol.cliente_id);
    if (sugerido) sol.coordinador_id = sugerido.id;
  }
  sol.coordinador = sol.coordinador_id ? db.prepare('SELECT id, nombre, email FROM coordinador WHERE id = ?').get(sol.coordinador_id) : null;
  sol.empresa = db.prepare('SELECT * FROM empresa_emisora WHERE codigo = ?').get(sol.empresa_emisora);
  sol.historial = db.prepare('SELECT * FROM historial_estado WHERE solicitud_id = ? ORDER BY fecha DESC').all(sol.id);
  return sol;
}

function receptoresActivosCliente(clienteId) {
  return db.prepare('SELECT * FROM receptor WHERE cliente_id = ? AND activo = 1 ORDER BY nombre').all(clienteId);
}

function receptoresPayloadODefecto(receptores, clienteId) {
  if (receptores && receptores.length) return receptores;
  return receptoresActivosCliente(clienteId).map(r => ({ receptor_id: r.id }));
}

function insertarReceptoresSolicitud(solicitudId, receptores) {
  (receptores || []).forEach(rec => {
    const recId = rec.receptor_id || rec.id;
    if (recId) {
      db.prepare('INSERT OR IGNORE INTO solicitud_receptor (solicitud_id, receptor_id) VALUES (?,?)')
        .run(solicitudId, recId);
    }
  });
}

function coordinadorPorClienteYCPNombre(clienteId, cpNombre) {
  const nombre = String(cpNombre || '').trim();
  if (nombre) {
    const exacto = db.prepare(`
      SELECT co.id, co.nombre, co.email
      FROM cliente_coordinador cc
      JOIN coordinador co ON co.id = cc.coordinador_id
      WHERE cc.cliente_id = ?
        AND cc.cp_nombre = ?
        AND cc.activo = 1
        AND co.activo = 1
      ORDER BY lower(trim(co.nombre))
      LIMIT 1
    `).get(clienteId, nombre);
    if (exacto) return exacto;
  }

  return db.prepare(`
    SELECT co.id, co.nombre, co.email
    FROM cliente_coordinador cc
    JOIN coordinador co ON co.id = cc.coordinador_id
    WHERE cc.cliente_id = ?
      AND (cc.cp_nombre IS NULL OR cc.cp_nombre = '')
      AND cc.activo = 1
      AND co.activo = 1
    ORDER BY lower(trim(co.nombre))
    LIMIT 1
  `).get(clienteId);
}

function coordinadorSugeridoSolicitud(solicitudId, clienteId) {
  const cps = db.prepare(`
    SELECT DISTINCT cp.nombre
    FROM solicitud_cp sc
    JOIN cp ON cp.id = sc.cp_id
    WHERE sc.solicitud_id = ?
    ORDER BY cp.nombre
  `).all(solicitudId);

  for (const cp of cps) {
    const coord = coordinadorPorClienteYCPNombre(clienteId, cp.nombre);
    if (coord) return coord;
  }
  return coordinadorPorClienteYCPNombre(clienteId, null);
}

function aplicarCoordinadorSugerido(row) {
  if (!row || row.coordinador_id) return row;
  const coord = coordinadorSugeridoSolicitud(row.id, row.cliente_id);
  if (coord) {
    row.coordinador_id = coord.id;
    row.coordinador_nombre = coord.nombre;
  }
  return row;
}

function calcularTotales(items, empresaCodigo, monedaBase, ufValor) {
  const empresa = db.prepare('SELECT * FROM empresa_emisora WHERE codigo = ?').get(empresaCodigo);
  const afectoIva = empresa && empresa.afecto_iva;
  const ivaPct = (empresa && empresa.iva_pct) || 0.19;

  let netoCLP = 0;
  const itemsCalc = (items || []).map(item => {
    let subtotal = 0;
    if (monedaBase === 'UF' && item.uf_unitaria && ufValor) {
      subtotal = Math.round(item.uf_unitaria * (item.cantidad || 1) * ufValor);
    } else {
      subtotal = Math.round((item.clp_unitario || 0) * (item.cantidad || 1));
    }
    netoCLP += subtotal;
    return { ...item, subtotal_clp: subtotal };
  });

  const ivaCLP = afectoIva ? redondearIvaCLP(netoCLP * ivaPct) : 0;
  const totalCLP = netoCLP + ivaCLP;
  return { items: itemsCalc, monto_neto_clp: netoCLP, monto_iva_clp: ivaCLP, monto_total_clp: totalCLP };
}

function redondearIvaCLP(valor) {
  return Math.ceil((Number(valor) || 0) / 10) * 10;
}

function montoClpDesdeCP(cp, ufValor) {
  const montoUF = Number(cp.monto_uf);
  if (!Number.isNaN(montoUF) && montoUF > 0 && ufValor) return Math.round(montoUF * Number(ufValor));
  return Math.round(Number(cp.monto_clp) || 0);
}

function calcularTotalesDesdeCPs(cps, empresaCodigo, ufValor) {
  const empresa = db.prepare('SELECT * FROM empresa_emisora WHERE codigo = ?').get(empresaCodigo);
  const afectoIva = empresa && empresa.afecto_iva;
  const ivaPct = (empresa && empresa.iva_pct) || 0.19;
  const netoCLP = (cps || []).reduce((sum, cp) => sum + montoClpDesdeCP(cp, ufValor), 0);
  const ivaCLP = afectoIva ? redondearIvaCLP(netoCLP * ivaPct) : 0;
  return { monto_neto_clp: netoCLP, monto_iva_clp: ivaCLP, monto_total_clp: netoCLP + ivaCLP };
}

function resolverCPDeCliente(cpRef, clienteId) {
  if (!cpRef) return null;
  return db.prepare(`
    SELECT id FROM cp
    WHERE activo = 1
      AND cliente_id = ?
      AND (id = ? OR codigo = ?)
  `).get(clienteId, cpRef, cpRef);
}

function normalizarCPsDeCliente(cps, clienteId, ufValor) {
  return (cps || []).map((c, i) => {
    const cpRow = resolverCPDeCliente(c.cp_id || c.cp_codigo, clienteId);
    if (!cpRow) {
      throw Object.assign(new Error('CP no pertenece al cliente seleccionado'), { code: 'VALIDATION_ERROR' });
    }
    const montoUFInput = c.monto_uf !== undefined && c.monto_uf !== null && c.monto_uf !== '' ? Number(c.monto_uf) : null;
    const montoUF = Number.isFinite(montoUFInput) ? montoUFInput : null;
    return { cp_id: cpRow.id, monto_uf: montoUF, monto_clp: montoClpDesdeCP({ ...c, monto_uf: montoUF }, ufValor), orden: i };
  });
}

const ESTADOS_SOLICITUD_VALIDOS = [
  'PENDIENTE OC / HES', 'FACTURA SOLICITADA', 'FACTURADO',
  'Borrador', 'PendienteDatos', 'EnRevision', 'Aprobada', 'Rechazada',
  'Emitida', 'Facturada', 'Anulada', 'Cerrada'
];
const ESTADOS_REQUIEREN_DATOS_COMPLETOS = ['FACTURA SOLICITADA', 'FACTURADO'];

function normalizarEstadoSolicitud(estado) {
  const valor = estado || 'PENDIENTE OC / HES';
  if (!ESTADOS_SOLICITUD_VALIDOS.includes(valor)) {
    throw Object.assign(new Error(`Estado de solicitud invalido: ${valor}`), { code: 'VALIDATION_ERROR' });
  }
  return valor;
}

function coordinadorActivo(id) {
  if (!id) return null;
  return db.prepare('SELECT id FROM coordinador WHERE id = ? AND activo = 1').get(id);
}

function validarDatosPorEstado(s, netoCLP) {
  const errs = [];
  if (!s.cliente_id) errs.push('cliente_id');
  if (!s.empresa_emisora) errs.push('empresa_emisora');
  if (!s.periodo) errs.push('periodo');

  if (ESTADOS_REQUIEREN_DATOS_COMPLETOS.includes(s.estado)) {
    if (!s.coordinador_id) errs.push('coordinador_id');
    else if (!coordinadorActivo(s.coordinador_id)) errs.push('coordinador_id activo');
    if (!s.glosa) errs.push('glosa');
    if (!s.observaciones) errs.push('observaciones');
    if (!s.hes_numero) errs.push('hes_numero');
    if (!s.oc_numero && !s.contrato_numero) errs.push('oc_numero o contrato_numero');
    if (!s.receptores || !s.receptores.length) errs.push('receptores');
    if (!s.cps || !s.cps.length) errs.push('cps');
    if ((s.cps || []).some(cp => Number(cp.monto_uf) > 0) && !s.uf_valor) errs.push('uf_valor');
    if ((Number(netoCLP) || 0) <= 0) errs.push('monto_neto_clp');
  }

  if (errs.length) {
    const err = new Error('Faltan datos obligatorios para el estado seleccionado: ' + errs.join(', '));
    err.code = 'VALIDATION_ERROR';
    throw err;
  }
}

function lineaObservacionUF(ufFecha, ufValor) {
  const valor = Number(ufValor);
  if (!ufFecha || !Number.isFinite(valor) || valor <= 0) return '';
  return `Valor UF ${ufFecha}: ${valor.toLocaleString('es-CL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function observacionesConUF(observaciones, ufFecha, ufValor) {
  const base = String(observaciones || '')
    .split(/\r?\n/)
    .filter(line => !/^Valor UF \d{4}-\d{2}-\d{2}:/i.test(line.trim()))
    .join('\n')
    .trim();
  const linea = lineaObservacionUF(ufFecha, ufValor);
  return [base, linea].filter(Boolean).join('\n') || null;
}

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

function mesNumero(value) {
  const n = Number(value);
  if (Number.isInteger(n) && n >= 1 && n <= 12) return n;
  const idx = MESES.findIndex(m => normalizarTexto(m) === normalizarTexto(value));
  return idx >= 0 ? idx + 1 : null;
}

function periodoDesdeProyeccion(row) {
  const mes = mesNumero(row.mes);
  if (!row.anio || !mes) return null;
  return `${row.anio}-${String(mes).padStart(2, '0')}`;
}

function empresaDesdeCodigoFacturacion(codigo) {
  const value = normalizarTexto(codigo);
  if (value === 'MAS_CAPACITACIONES' || value === 'MAS_CAPACITACION') {
    const plural = db.prepare("SELECT codigo FROM empresa_emisora WHERE codigo = 'MAS_CAPACITACIONES'").get();
    return plural ? 'MAS_CAPACITACIONES' : 'MAS_CAPACITACION';
  }
  if (value === 'MIXTO') return 'MAS_CONSULTORES';
  return value || 'MAS_CONSULTORES';
}

function proyeccionesParaSolicitudes({ clienteId, estado, periodo, q }) {
  if (!periodo) return [];
  const [anioRaw, mesRaw] = String(periodo).split('-');
  const anio = Number(anioRaw);
  const mes = mesNumero(mesRaw);
  if (!anio || !mes) return [];

  let sql = `
    SELECT
      pf.*,
      c.nombre_corto AS cliente_nombre,
      cp.id AS cp_id
    FROM proyeccion_facturacion pf
    JOIN cliente c ON c.id = pf.cliente_id
    LEFT JOIN cp ON cp.cliente_id = pf.cliente_id AND cp.codigo = pf.codigo AND cp.activo = 1
    WHERE c.estado = 'Activo'
      AND pf.anio = ?`;
  const vals = [anio];
  if (clienteId) { sql += ' AND pf.cliente_id = ?'; vals.push(clienteId); }
  if (estado) { sql += ' AND pf.estado = ?'; vals.push(estado); }
  if (q) {
    sql += ' AND (pf.cliente LIKE ? OR c.nombre_corto LIKE ? OR pf.codigo LIKE ? OR pf.nombre LIKE ? OR pf.tipo_cp LIKE ?)';
    vals.push(`%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`);
  }

  const rows = db.prepare(sql).all(...vals)
    .filter(row => mesNumero(row.mes) === mes)
    .filter(row => row.cp_id)
    .filter(row => {
      const existing = db.prepare(`
        SELECT sf.id
        FROM solicitud_factura sf
        JOIN solicitud_cp sc ON sc.solicitud_id = sf.id
        WHERE sf.is_delete = 0
          AND sf.cliente_id = ?
          AND sf.periodo = ?
          AND sc.cp_id = ?
        LIMIT 1
      `).get(row.cliente_id, periodo, row.cp_id);
      return !existing;
    });

  return rows.map(row => {
    const coord = coordinadorPorClienteYCPNombre(row.cliente_id, row.nombre);
    return {
    id: `proyeccion:${row.id}`,
    proyeccion_id: row.id,
    is_proyeccion: 1,
    folio: 'PROYECCION',
    tipo: 'mensual',
    cliente_id: row.cliente_id,
    cliente_nombre: row.cliente || row.cliente_nombre,
    coordinador_id: coord ? coord.id : null,
    coordinador_nombre: coord ? coord.nombre : null,
    empresa_emisora: empresaDesdeCodigoFacturacion(row.codigo_facturacion),
    periodo,
    glosa: row.nombre || '',
    monto_neto_clp: 0,
    monto_iva_clp: 0,
    monto_total_clp: 0,
    estado: row.estado || 'PENDIENTE OC / HES',
    cp_codigo: row.codigo,
    cp_nombre: row.nombre,
    tipo_cp: row.tipo_cp,
    codigo_facturacion: row.codigo_facturacion,
    created_at: row.updated_at
  };
  });
}

r.get('/', (req, res) => {
  const { clienteId, estado, periodo, tipo, q, includeProyecciones } = req.query;
  let sql = `SELECT sf.*, c.nombre_corto as cliente_nombre, co.nombre as coordinador_nombre
    FROM solicitud_factura sf
    JOIN cliente c ON c.id = sf.cliente_id
    LEFT JOIN coordinador co ON co.id = sf.coordinador_id
    WHERE sf.is_delete = 0`;
  const vals = [];
  if (clienteId) { sql += ' AND sf.cliente_id = ?'; vals.push(clienteId); }
  if (estado)    { sql += ' AND sf.estado = ?'; vals.push(estado); }
  if (periodo)   { sql += ' AND sf.periodo = ?'; vals.push(periodo); }
  if (tipo)      { sql += ' AND sf.tipo = ?'; vals.push(tipo); }
  if (q)         { sql += ' AND (sf.folio LIKE ? OR sf.glosa LIKE ? OR c.nombre_corto LIKE ?)'; vals.push(`%${q}%`, `%${q}%`, `%${q}%`); }
  sql += ' ORDER BY sf.created_at DESC LIMIT 200';
  const reales = db.prepare(sql).all(...vals).map(aplicarCoordinadorSugerido);
  const proyecciones = includeProyecciones === '1'
    ? proyeccionesParaSolicitudes({ clienteId, estado, periodo, q })
    : [];

  ok(res, [...reales, ...proyecciones].sort((a, b) => {
    const estadoA = estadoPrioridadSolicitud(a.estado);
    const estadoB = estadoPrioridadSolicitud(b.estado);
    return estadoA - estadoB || String(a.cliente_nombre || '').localeCompare(String(b.cliente_nombre || ''), 'es');
  }));
});

function estadoPrioridadSolicitud(estado) {
  if (estado === 'PENDIENTE OC / HES') return 1;
  if (estado === 'FACTURA SOLICITADA') return 2;
  if (estado === 'FACTURADO') return 3;
  return 4;
}

r.post('/', (req, res) => {
  const b = req.body;
  if (!b.cliente_id || !b.empresa_emisora || !b.periodo)
    return fail(res, 'VALIDATION_ERROR', 'Faltan campos obligatorios: cliente_id, empresa_emisora, periodo');
  if (b.coordinador_id && !coordinadorActivo(b.coordinador_id))
    return fail(res, 'VALIDATION_ERROR', 'Encargado de solicitud no existe o esta inactivo');

  const id = uuidv4();
  const folio = generarFolio();
  const itemsPayload = b.items || [];
  const totals = itemsPayload.length
    ? calcularTotales(itemsPayload, b.empresa_emisora, b.moneda_base, b.uf_valor)
    : { items: [], ...calcularTotalesDesdeCPs(b.cps, b.empresa_emisora, b.uf_valor) };
  const { items, monto_neto_clp, monto_iva_clp, monto_total_clp } = totals;
  let cpsNormalizados = [];
  try {
    cpsNormalizados = normalizarCPsDeCliente(b.cps, b.cliente_id, b.uf_valor);
  } catch (e) {
    return fail(res, e.code || 'VALIDATION_ERROR', e.message);
  }
  let estadoInicial;
  const receptoresIniciales = receptoresPayloadODefecto(b.receptores, b.cliente_id);
  const observacionesIniciales = observacionesConUF(b.observaciones, b.uf_fecha, b.uf_valor);
  try {
    estadoInicial = normalizarEstadoSolicitud(b.estado);
    validarDatosPorEstado({ ...b, observaciones: observacionesIniciales, estado: estadoInicial, cps: b.cps || [], receptores: receptoresIniciales }, monto_neto_clp);
  } catch (e) {
    return fail(res, e.code || 'VALIDATION_ERROR', e.message);
  }

  const ins = db.transaction(() => {
    db.prepare(`INSERT INTO solicitud_factura
      (id, folio, tipo, cliente_id, coordinador_id, empresa_emisora, periodo, fecha_solicitud,
       oc_numero, contrato_numero, hes_numero, glosa, area, moneda_base, uf_fecha, uf_valor,
       monto_neto_clp, monto_iva_clp, monto_total_clp, observaciones, estado, programada_id)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`)
      .run(id, folio, b.tipo||'mensual', b.cliente_id, b.coordinador_id||null, b.empresa_emisora,
        b.periodo, b.fecha_solicitud||new Date().toISOString().slice(0,10),
        b.oc_numero||null, b.contrato_numero||null, b.hes_numero||null,
        b.glosa||'', b.area||null, b.moneda_base||'CLP', b.uf_fecha||null, b.uf_valor||null,
        monto_neto_clp, monto_iva_clp, monto_total_clp, observacionesIniciales, estadoInicial, b.programada_id||null);

    (items || []).forEach((item, i) => {
      db.prepare(`INSERT INTO solicitud_item (id, solicitud_id, producto_id, descripcion, codigo_ref, cantidad, uf_unitaria, clp_unitario, subtotal_clp, orden)
        VALUES (?,?,?,?,?,?,?,?,?,?)`)
        .run(uuidv4(), id, item.producto_id||null, item.descripcion||'', item.codigo_ref||null,
          item.cantidad||1, item.uf_unitaria||null, item.clp_unitario||null, item.subtotal_clp||0, i);
    });

    cpsNormalizados.forEach(c => {
      db.prepare('INSERT INTO solicitud_cp (id, solicitud_id, cp_id, monto_uf, monto_clp, orden) VALUES (?,?,?,?,?,?)')
        .run(uuidv4(), id, c.cp_id, c.monto_uf, c.monto_clp, c.orden);
    });

    insertarReceptoresSolicitud(id, receptoresIniciales);

    db.prepare('INSERT INTO historial_estado (id, solicitud_id, estado_desde, estado_hacia, usuario, comentario) VALUES (?,?,?,?,?,?)')
      .run(uuidv4(), id, null, estadoInicial, b._usuario||'sistema', 'Solicitud creada');
  });
  ins();

  ok(res, hydrateOne(db.prepare('SELECT * FROM solicitud_factura WHERE id = ? AND is_delete = 0').get(id)), 201);
});

r.post('/proyecciones/:id/materializar', (req, res) => {
  const pf = db.prepare('SELECT * FROM proyeccion_facturacion WHERE id = ?').get(req.params.id);
  if (!pf) return notFound(res, 'Proyeccion no encontrada');

  const periodo = periodoDesdeProyeccion(pf);
  if (!periodo) return fail(res, 'VALIDATION_ERROR', 'La proyeccion no tiene mes/anio valido');

  const cp = db.prepare(`
    SELECT id
    FROM cp
    WHERE cliente_id = ?
      AND codigo = ?
      AND activo = 1
  `).get(pf.cliente_id, pf.codigo);
  if (!cp) return fail(res, 'VALIDATION_ERROR', 'La proyeccion no tiene un CP activo asociado');

  const existing = db.prepare(`
    SELECT sf.*
    FROM solicitud_factura sf
    JOIN solicitud_cp sc ON sc.solicitud_id = sf.id
    WHERE sf.is_delete = 0
      AND sf.cliente_id = ?
      AND sf.periodo = ?
      AND sc.cp_id = ?
    LIMIT 1
  `).get(pf.cliente_id, periodo, cp.id);
  if (existing) return ok(res, hydrateOne(existing));

  const id = uuidv4();
  const estado = normalizarEstadoSolicitud(pf.estado || 'PENDIENTE OC / HES');
  const empresa = empresaDesdeCodigoFacturacion(pf.codigo_facturacion);
  if (!db.prepare('SELECT codigo FROM empresa_emisora WHERE codigo = ?').get(empresa)) {
    return fail(res, 'VALIDATION_ERROR', `Empresa emisora no configurada: ${empresa}`);
  }
  const coord = coordinadorPorClienteYCPNombre(pf.cliente_id, pf.nombre);
  const folio = generarFolio();
  const montoUF = Number(pf.monto_uf) || null;

  const tx = db.transaction(() => {
    db.prepare(`INSERT INTO solicitud_factura
      (id, folio, tipo, cliente_id, coordinador_id, empresa_emisora, periodo, fecha_solicitud,
       glosa, moneda_base, monto_neto_clp, monto_iva_clp, monto_total_clp, observaciones, estado)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`)
      .run(id, folio, 'mensual', pf.cliente_id, coord ? coord.id : null, empresa, periodo, new Date().toISOString().slice(0,10),
        pf.nombre || '', 'UF', 0, 0, 0, pf.observaciones || null, estado);

    db.prepare('INSERT INTO solicitud_cp (id, solicitud_id, cp_id, monto_uf, monto_clp, orden) VALUES (?,?,?,?,?,?)')
      .run(uuidv4(), id, cp.id, montoUF, 0, 0);

    insertarReceptoresSolicitud(id, receptoresPayloadODefecto(req.body?.receptores, pf.cliente_id));

    db.prepare('INSERT INTO historial_estado (id, solicitud_id, estado_desde, estado_hacia, usuario, comentario) VALUES (?,?,?,?,?,?)')
      .run(uuidv4(), id, null, estado, req.body?._usuario || 'sistema', `Creada desde proyeccion ${pf.id}`);
  });
  tx();

  ok(res, hydrateOne(db.prepare('SELECT * FROM solicitud_factura WHERE id = ? AND is_delete = 0').get(id)), 201);
});

r.get('/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM solicitud_factura WHERE (id = ? OR folio = ?) AND is_delete = 0').get(req.params.id, req.params.id);
  if (!row) return notFound(res);
  ok(res, hydrateOne(row));
});

r.patch('/:id', (req, res) => {
  const sol = db.prepare('SELECT * FROM solicitud_factura WHERE id = ? AND is_delete = 0').get(req.params.id);
  if (!sol) return notFound(res);
  if (!puedeEditar(sol.estado))
    return fail(res, 'STATE_TRANSITION_INVALID', `No se puede editar una solicitud en estado "${sol.estado}"`);

  const b = req.body;
  if (b.coordinador_id && !coordinadorActivo(b.coordinador_id))
    return fail(res, 'VALIDATION_ERROR', 'Encargado de solicitud no existe o esta inactivo');
  const cpsParaTotales = b.cps !== undefined
    ? b.cps
    : db.prepare('SELECT monto_uf, monto_clp FROM solicitud_cp WHERE solicitud_id=?').all(sol.id);
  const itemsParaTotales = b.items !== undefined
    ? b.items
    : (b.cps !== undefined ? [] : db.prepare('SELECT * FROM solicitud_item WHERE solicitud_id=?').all(sol.id));
  const totals = itemsParaTotales.length
    ? calcularTotales(
      itemsParaTotales,
      b.empresa_emisora || sol.empresa_emisora,
      b.moneda_base || sol.moneda_base,
      b.uf_valor !== undefined ? b.uf_valor : sol.uf_valor
    )
    : { items: [], ...calcularTotalesDesdeCPs(cpsParaTotales, b.empresa_emisora || sol.empresa_emisora, b.uf_valor !== undefined ? b.uf_valor : sol.uf_valor) };
  const { items, monto_neto_clp, monto_iva_clp, monto_total_clp } = totals;
  let cpsNormalizados = [];
  if (b.cps !== undefined) {
    try {
      cpsNormalizados = normalizarCPsDeCliente(b.cps, sol.cliente_id, b.uf_valor !== undefined ? b.uf_valor : sol.uf_valor);
    } catch (e) {
      return fail(res, e.code || 'VALIDATION_ERROR', e.message);
    }
  }
  let estadoNuevo;
  if (b.estado !== undefined) {
    try {
      estadoNuevo = normalizarEstadoSolicitud(b.estado);
    } catch (e) {
      return fail(res, e.code || 'VALIDATION_ERROR', e.message);
    }
  }
  const estadoEfectivo = estadoNuevo !== undefined ? estadoNuevo : sol.estado;
  const receptoresEfectivos = b.receptores !== undefined
    ? b.receptores
    : db.prepare('SELECT receptor_id FROM solicitud_receptor WHERE solicitud_id=?').all(sol.id);
  const cpsEfectivos = b.cps !== undefined ? b.cps : cpsParaTotales;
  const ufFechaEfectiva = b.uf_fecha !== undefined ? b.uf_fecha : sol.uf_fecha;
  const ufValorEfectivo = b.uf_valor !== undefined ? b.uf_valor : sol.uf_valor;
  const observacionesEfectivas = observacionesConUF(
    b.observaciones !== undefined ? b.observaciones : sol.observaciones,
    ufFechaEfectiva,
    ufValorEfectivo
  );
  try {
    validarDatosPorEstado({
      ...sol,
      ...b,
      estado: estadoEfectivo,
      coordinador_id: b.coordinador_id !== undefined ? b.coordinador_id : sol.coordinador_id,
      glosa: b.glosa !== undefined ? b.glosa : sol.glosa,
      observaciones: observacionesEfectivas,
      hes_numero: b.hes_numero !== undefined ? b.hes_numero : sol.hes_numero,
      oc_numero: b.oc_numero !== undefined ? b.oc_numero : sol.oc_numero,
      contrato_numero: b.contrato_numero !== undefined ? b.contrato_numero : sol.contrato_numero,
      uf_valor: ufValorEfectivo,
      cps: cpsEfectivos,
      receptores: receptoresEfectivos
    }, monto_neto_clp);
  } catch (e) {
    return fail(res, e.code || 'VALIDATION_ERROR', e.message);
  }

  const fields = ['tipo','coordinador_id','empresa_emisora','periodo','fecha_solicitud','oc_numero',
    'contrato_numero','hes_numero','glosa','area','moneda_base','uf_fecha','uf_valor'];
  const sets = ["monto_neto_clp=?", "monto_iva_clp=?", "monto_total_clp=?", "updated_at=datetime('now')"];
  const vals = [monto_neto_clp, monto_iva_clp, monto_total_clp];
  fields.forEach(f => { if (b[f] !== undefined) { sets.push(`${f}=?`); vals.push(b[f]); } });
  if (b.observaciones !== undefined || b.uf_fecha !== undefined || b.uf_valor !== undefined) {
    sets.push('observaciones=?');
    vals.push(observacionesEfectivas);
  }
  if (estadoNuevo !== undefined) { sets.push('estado=?'); vals.push(estadoNuevo); }
  vals.push(req.params.id);
  db.prepare(`UPDATE solicitud_factura SET ${sets.join(',')} WHERE id=?`).run(...vals);

  if (b.items !== undefined || b.cps !== undefined) {
    db.prepare('DELETE FROM solicitud_item WHERE solicitud_id = ?').run(req.params.id);
  }
  if (b.items !== undefined) {
    items.forEach((item, i) => {
      db.prepare(`INSERT INTO solicitud_item (id, solicitud_id, producto_id, descripcion, codigo_ref, cantidad, uf_unitaria, clp_unitario, subtotal_clp, orden)
        VALUES (?,?,?,?,?,?,?,?,?,?)`)
        .run(uuidv4(), req.params.id, item.producto_id||null, item.descripcion||'', item.codigo_ref||null,
          item.cantidad||1, item.uf_unitaria||null, item.clp_unitario||null, item.subtotal_clp||0, i);
    });
  }
  if (b.cps !== undefined) {
    db.prepare('DELETE FROM solicitud_cp WHERE solicitud_id = ?').run(req.params.id);
    cpsNormalizados.forEach(c => {
      db.prepare('INSERT INTO solicitud_cp (id, solicitud_id, cp_id, monto_uf, monto_clp, orden) VALUES (?,?,?,?,?,?)')
        .run(uuidv4(), req.params.id, c.cp_id, c.monto_uf, c.monto_clp, c.orden);
    });
  }
  if (b.receptores !== undefined) {
    db.prepare('DELETE FROM solicitud_receptor WHERE solicitud_id = ?').run(req.params.id);
    b.receptores.forEach(rec => {
      const recId = rec.receptor_id || rec.id;
      if (recId) db.prepare('INSERT OR IGNORE INTO solicitud_receptor (solicitud_id, receptor_id) VALUES (?,?)').run(req.params.id, recId);
    });
  }
  if (estadoNuevo !== undefined && estadoNuevo !== sol.estado) {
    db.prepare('INSERT INTO historial_estado (id, solicitud_id, estado_desde, estado_hacia, usuario, comentario) VALUES (?,?,?,?,?,?)')
      .run(uuidv4(), req.params.id, sol.estado, estadoNuevo, b._usuario||'sistema', 'Estado actualizado desde formulario');
  }

  ok(res, hydrateOne(db.prepare('SELECT * FROM solicitud_factura WHERE id = ? AND is_delete = 0').get(req.params.id)));
});

r.delete('/:id', (req, res) => {
  const sol = db.prepare('SELECT id, folio FROM solicitud_factura WHERE id = ? AND is_delete = 0').get(req.params.id);
  if (!sol) return notFound(res);
  db.prepare("UPDATE solicitud_factura SET is_delete = 1, updated_at = datetime('now') WHERE id = ?").run(req.params.id);
  ok(res, { id: sol.id, folio: sol.folio });
});

r.post('/:id/estado', (req, res) => {
  const { hacia, comentario } = req.body;
  if (!hacia) return fail(res, 'VALIDATION_ERROR', '"hacia" es requerido');
  try {
    cambiarEstado(req.params.id, hacia, req.body._usuario || 'usuario', comentario);
    ok(res, hydrateOne(db.prepare('SELECT * FROM solicitud_factura WHERE id = ? AND is_delete = 0').get(req.params.id)));
  } catch (e) {
    fail(res, e.code || 'ERROR', e.message);
  }
});

r.post('/:id/duplicar', (req, res) => {
  const orig = db.prepare('SELECT * FROM solicitud_factura WHERE id = ? AND is_delete = 0').get(req.params.id);
  if (!orig) return notFound(res);
  const newId = uuidv4();
  const newFolio = generarFolio();

  const dup = db.transaction(() => {
    db.prepare(`INSERT INTO solicitud_factura
      (id, folio, tipo, cliente_id, coordinador_id, empresa_emisora, periodo, fecha_solicitud,
       oc_numero, contrato_numero, hes_numero, glosa, area, moneda_base, observaciones, estado, version_plantilla)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`)
      .run(newId, newFolio, orig.tipo, orig.cliente_id, orig.coordinador_id, orig.empresa_emisora,
        orig.periodo, new Date().toISOString().slice(0,10),
        orig.oc_numero, orig.contrato_numero, orig.hes_numero, orig.glosa, orig.area,
        orig.moneda_base, orig.observaciones, 'PENDIENTE OC / HES', orig.version_plantilla);

    db.prepare('SELECT * FROM solicitud_item WHERE solicitud_id = ?').all(orig.id).forEach(item => {
      db.prepare(`INSERT INTO solicitud_item (id, solicitud_id, producto_id, descripcion, codigo_ref, cantidad, uf_unitaria, clp_unitario, subtotal_clp, orden)
        VALUES (?,?,?,?,?,?,?,?,?,?)`)
        .run(uuidv4(), newId, item.producto_id, item.descripcion, item.codigo_ref, item.cantidad, item.uf_unitaria, item.clp_unitario, item.subtotal_clp, item.orden);
    });

    db.prepare('SELECT * FROM solicitud_cp WHERE solicitud_id = ?').all(orig.id).forEach(cp => {
      db.prepare('INSERT INTO solicitud_cp (id, solicitud_id, cp_id, monto_uf, monto_clp, orden) VALUES (?,?,?,?,?,?)').run(uuidv4(), newId, cp.cp_id, cp.monto_uf, cp.monto_clp, cp.orden);
    });

    db.prepare('SELECT receptor_id FROM solicitud_receptor WHERE solicitud_id = ?').all(orig.id).forEach(({ receptor_id }) => {
      db.prepare('INSERT OR IGNORE INTO solicitud_receptor (solicitud_id, receptor_id) VALUES (?,?)').run(newId, receptor_id);
    });

    db.prepare('INSERT INTO historial_estado (id, solicitud_id, estado_desde, estado_hacia, usuario, comentario) VALUES (?,?,?,?,?,?)')
      .run(uuidv4(), newId, null, 'PENDIENTE OC / HES', 'sistema', `Duplicada desde ${orig.folio}`);
  });
  dup();

  ok(res, hydrateOne(db.prepare('SELECT * FROM solicitud_factura WHERE id = ? AND is_delete = 0').get(newId)), 201);
});

r.get('/:id/historial', (req, res) => {
  const row = db.prepare('SELECT id FROM solicitud_factura WHERE id = ? AND is_delete = 0').get(req.params.id);
  if (!row) return notFound(res);
  ok(res, db.prepare('SELECT * FROM historial_estado WHERE solicitud_id = ? ORDER BY fecha DESC').all(req.params.id));
});

r.post('/:id/asignaciones', (req, res) => {
  const row = db.prepare('SELECT id FROM solicitud_factura WHERE id = ? AND is_delete = 0').get(req.params.id);
  if (!row) return notFound(res);
  const { desarrollador_id, rol, horas_estimadas } = req.body;
  if (!desarrollador_id) return fail(res, 'VALIDATION_ERROR', 'desarrollador_id requerido');
  const id = uuidv4();
  db.prepare('INSERT INTO asignacion_solicitud (id, solicitud_id, desarrollador_id, rol, horas_estimadas) VALUES (?,?,?,?,?)').run(id, req.params.id, desarrollador_id, rol||null, horas_estimadas||null);
  ok(res, db.prepare('SELECT a.*, d.nombre as dev_nombre FROM asignacion_solicitud a JOIN desarrollador d ON d.id=a.desarrollador_id WHERE a.id=?').get(id), 201);
});

r.delete('/:id/asignaciones/:asigId', (req, res) => {
  const row = db.prepare('SELECT id FROM solicitud_factura WHERE id = ? AND is_delete = 0').get(req.params.id);
  if (!row) return notFound(res);
  db.prepare('UPDATE asignacion_solicitud SET activo=0 WHERE id=? AND solicitud_id=?').run(req.params.asigId, req.params.id);
  ok(res, { id: req.params.asigId });
});

r.get('/:id/tiempos', (req, res) => {
  const row = db.prepare('SELECT id FROM solicitud_factura WHERE id = ? AND is_delete = 0').get(req.params.id);
  if (!row) return notFound(res);
  ok(res, db.prepare(`SELECT rt.*, d.nombre as dev_nombre FROM registro_tiempo rt JOIN desarrollador d ON d.id=rt.desarrollador_id WHERE rt.solicitud_id=? ORDER BY rt.fecha DESC`).all(req.params.id));
});

r.post('/:id/tiempos', (req, res) => {
  const row = db.prepare('SELECT id FROM solicitud_factura WHERE id = ? AND is_delete = 0').get(req.params.id);
  if (!row) return notFound(res);
  const { desarrollador_id, fecha, minutos, descripcion } = req.body;
  if (!desarrollador_id || !minutos || !fecha) return fail(res, 'VALIDATION_ERROR', 'desarrollador_id, fecha y minutos son requeridos');
  if (minutos <= 0) return fail(res, 'VALIDATION_ERROR', 'minutos debe ser > 0');
  const id = uuidv4();
  db.prepare('INSERT INTO registro_tiempo (id, solicitud_id, desarrollador_id, fecha, minutos, descripcion) VALUES (?,?,?,?,?,?)').run(id, req.params.id, desarrollador_id, fecha, minutos, descripcion||null);
  ok(res, db.prepare('SELECT * FROM registro_tiempo WHERE id=?').get(id), 201);
});

module.exports = r;
