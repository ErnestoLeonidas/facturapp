const r = require('express').Router();
const db = require('../db-async');
const { v4: uuidv4 } = require('uuid');
const { ok, fail, notFound } = require('../middleware/envelope');
const { cambiarEstado, puedeEditar } = require('../services/estados');
const { generarFolio } = require('../utils/folio');
const audit = require('../services/audit');
const { coordinadorScope } = require('../services/access');

const EMPRESA_EMISORA_DEFAULT = 'MAS_CONSULTORES';
const EMPRESAS_EMISORAS_SOLICITUD = ['MAS_CONSULTORES', 'INSTITUTO_ROI'];
const TIPO_IMPUESTO_UNICO = 'AFECTO_IVA';

function aplicarScope(sql, vals, req, alias = 'sf') {
  const coordinatorId = coordinadorScope(req);
  if (!coordinatorId) return sql;
  vals.push(coordinatorId === '__none__' ? '__sin_coordinador__' : coordinatorId);
  return `${sql} AND ${alias}.coordinador_id = ?`;
}

function puedeVerSolicitud(req, sol) {
  const coordinatorId = coordinadorScope(req);
  if (!coordinatorId) return true;
  return coordinatorId !== '__none__' && sol && sol.coordinador_id === coordinatorId;
}

async function datosFacturacionCliente(cliente) {
  if (!cliente) return [];
  const original = {
    id: '',
    cliente_id: cliente.id,
    etiqueta: 'Datos cliente 1',
    razon_social: cliente.razon_social,
    rut: cliente.rut,
    giro: cliente.giro,
    direccion: cliente.direccion,
    es_original: 1
  };
  const extras = await db.all(`
    SELECT id, cliente_id, etiqueta, razon_social, rut, giro, direccion, 0 AS es_original
    FROM cliente_facturacion
    WHERE cliente_id = ?
      AND activo = 1
    ORDER BY created_at, razon_social
  `, [cliente.id]);
  return [original, ...extras];
}

async function datosFacturacionSolicitud(sol) {
  if (!sol || !sol.cliente) return null;
  if (!sol.cliente_facturacion_id) return (await datosFacturacionCliente(sol.cliente))[0] || null;
  return await db.get(`
    SELECT id, cliente_id, etiqueta, razon_social, rut, giro, direccion, 0 AS es_original
    FROM cliente_facturacion
    WHERE id = ?
      AND cliente_id = ?
      AND activo = 1
  `, [sol.cliente_facturacion_id, sol.cliente_id]) || (await datosFacturacionCliente(sol.cliente))[0] || null;
}

async function receptoresActivosCliente(clienteId) {
  return db.all('SELECT * FROM receptor WHERE cliente_id = ? AND activo = 1 ORDER BY nombre', [clienteId]);
}

async function receptoresPayloadODefecto(receptores, clienteId) {
  if (receptores && receptores.length) return receptores;
  return (await receptoresActivosCliente(clienteId)).map(row => ({ receptor_id: row.id }));
}

async function coordinadorPorClienteYCPNombre(clienteId, cpNombre) {
  const nombre = String(cpNombre || '').trim();
  if (nombre) {
    const exacto = await db.get(`
      SELECT co.id, co.nombre, co.email
      FROM cliente_coordinador cc
      JOIN coordinador co ON co.id = cc.coordinador_id
      WHERE cc.cliente_id = ?
        AND cc.cp_nombre = ?
        AND cc.activo = 1
        AND co.activo = 1
      ORDER BY lower(trim(co.nombre))
      LIMIT 1
    `, [clienteId, nombre]);
    if (exacto) return exacto;
  }

  return db.get(`
    SELECT co.id, co.nombre, co.email
    FROM cliente_coordinador cc
    JOIN coordinador co ON co.id = cc.coordinador_id
    WHERE cc.cliente_id = ?
      AND (cc.cp_nombre IS NULL OR cc.cp_nombre = '')
      AND cc.activo = 1
      AND co.activo = 1
    ORDER BY lower(trim(co.nombre))
    LIMIT 1
  `, [clienteId]);
}

async function coordinadorSugeridoSolicitud(solicitudId, clienteId) {
  const cps = await db.all(`
    SELECT DISTINCT cp.nombre
    FROM solicitud_cp sc
    JOIN cp ON cp.id = sc.cp_id
    WHERE sc.solicitud_id = ?
    ORDER BY cp.nombre
  `, [solicitudId]);

  for (const cp of cps) {
    const coord = await coordinadorPorClienteYCPNombre(clienteId, cp.nombre);
    if (coord) return coord;
  }
  return coordinadorPorClienteYCPNombre(clienteId, null);
}

async function aplicarCoordinadorSugerido(row) {
  if (!row || row.coordinador_id) return row;
  const coord = await coordinadorSugeridoSolicitud(row.id, row.cliente_id);
  if (coord) {
    row.coordinador_id = coord.id;
    row.coordinador_nombre = coord.nombre;
  }
  return row;
}

async function hydrateOne(sol) {
  if (!sol) return null;
  sol.items = await db.all('SELECT * FROM solicitud_item WHERE solicitud_id = ? ORDER BY orden', [sol.id]);
  sol.cps = await db.all(`SELECT sc.*, cp.codigo, cp.nombre as cp_nombre, cp.area
    FROM solicitud_cp sc JOIN cp ON cp.id = sc.cp_id WHERE sc.solicitud_id = ? ORDER BY sc.orden`, [sol.id]);
  sol.receptores = await db.all(`SELECT r.* FROM receptor r JOIN solicitud_receptor sr ON sr.receptor_id = r.id WHERE sr.solicitud_id = ?`, [sol.id]);
  sol.cliente = await db.get('SELECT * FROM cliente WHERE id = ?', [sol.cliente_id]);
  if (sol.cliente) {
    sol.cliente.receptores = await receptoresActivosCliente(sol.cliente_id);
    sol.cliente.cps = await db.all('SELECT * FROM cp WHERE cliente_id = ? AND activo = 1 ORDER BY codigo', [sol.cliente_id]);
    sol.cliente.datos_facturacion = await datosFacturacionCliente(sol.cliente);
  }
  sol.datos_facturacion = await datosFacturacionSolicitud(sol);
  if (!sol.coordinador_id) {
    const sugerido = await coordinadorSugeridoSolicitud(sol.id, sol.cliente_id);
    if (sugerido) sol.coordinador_id = sugerido.id;
  }
  sol.coordinador = sol.coordinador_id ? await db.get('SELECT id, nombre, email FROM coordinador WHERE id = ?', [sol.coordinador_id]) : null;
  sol.empresa = await db.get('SELECT * FROM empresa_emisora WHERE codigo = ?', [sol.empresa_emisora]);
  sol.historial = await db.all('SELECT * FROM historial_estado WHERE solicitud_id = ? ORDER BY fecha DESC', [sol.id]);
  return sol;
}

async function validarClienteFacturacion(clienteId, datoId) {
  if (!datoId) return null;
  const row = await db.get(`
    SELECT id FROM cliente_facturacion
    WHERE id = ?
      AND cliente_id = ?
      AND activo = 1
  `, [datoId, clienteId]);
  if (!row) {
    throw Object.assign(new Error('Datos de facturacion no pertenecen al cliente seleccionado'), { code: 'VALIDATION_ERROR' });
  }
  return row.id;
}

async function insertarReceptoresSolicitud(conn, solicitudId, receptores) {
  for (const rec of (receptores || [])) {
    const recId = rec.receptor_id || rec.id;
    if (recId) {
      await conn.run('INSERT INTO solicitud_receptor (solicitud_id, receptor_id) VALUES (?,?) ON CONFLICT DO NOTHING', [solicitudId, recId]);
    }
  }
}

function redondearIvaCLP(valor) {
  return Math.ceil((Number(valor) || 0) / 10) * 10;
}

function parseNumero(value) {
  if (value === undefined || value === null || value === '') return null;
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  const limpio = String(value)
    .replace(/\$/g, '')
    .replace(/\s/g, '')
    .replace(/\./g, '')
    .replace(',', '.');
  const numero = Number(limpio);
  return Number.isFinite(numero) ? numero : null;
}

function flagManual(value) {
  return value === true || value === 1 || value === '1' || value === 'true' || value === 'on';
}

function montoClpManual(cp) {
  if (!flagManual(cp.monto_clp_es_manual)) return null;
  const manual = parseNumero(cp.monto_clp_manual !== undefined ? cp.monto_clp_manual : cp.monto_clp);
  return manual === null ? null : Math.round(manual);
}

function montoClpDesdeCP(cp, ufValor) {
  const manual = montoClpManual(cp);
  if (manual !== null) return manual;
  const montoUF = Number(cp.monto_uf);
  if (!Number.isNaN(montoUF) && montoUF > 0 && ufValor) return Math.round(montoUF * Number(ufValor));
  return Math.round(Number(cp.monto_clp) || 0);
}

async function calcularTotales(items, empresaCodigo, monedaBase, ufValor) {
  const empresa = await db.get('SELECT * FROM empresa_emisora WHERE codigo = ?', [empresaCodigo]);
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

async function calcularTotalesDesdeCPs(cps, empresaCodigo, ufValor, montoNetoManual) {
  const empresa = await db.get('SELECT * FROM empresa_emisora WHERE codigo = ?', [empresaCodigo]);
  const afectoIva = empresa && empresa.afecto_iva;
  const ivaPct = (empresa && empresa.iva_pct) || 0.19;
  const netoAutomatico = (cps || []).reduce((sum, cp) => sum + montoClpDesdeCP(cp, ufValor), 0);
  const netoCLP = montoNetoManual !== null && montoNetoManual !== undefined
    ? Math.round(montoNetoManual)
    : netoAutomatico;
  const ivaCLP = afectoIva ? redondearIvaCLP(netoCLP * ivaPct) : 0;
  return { monto_neto_clp: netoCLP, monto_iva_clp: ivaCLP, monto_total_clp: netoCLP + ivaCLP };
}

async function resolverCPDeCliente(cpRef, clienteId) {
  if (!cpRef) return null;
  return db.get(`
    SELECT id FROM cp
    WHERE activo = 1
      AND cliente_id = ?
      AND (id = ? OR codigo = ?)
  `, [clienteId, cpRef, cpRef]);
}

async function normalizarCPsDeCliente(cps, clienteId, ufValor) {
  const normalizados = [];
  for (const [i, c] of (cps || []).entries()) {
    const cpRow = await resolverCPDeCliente(c.cp_id || c.cp_codigo, clienteId);
    if (!cpRow) {
      throw Object.assign(new Error('CP no pertenece al cliente seleccionado'), { code: 'VALIDATION_ERROR' });
    }
    const montoUFInput = c.monto_uf !== undefined && c.monto_uf !== null && c.monto_uf !== '' ? Number(c.monto_uf) : null;
    const montoUF = Number.isFinite(montoUFInput) ? montoUFInput : null;
    const manual = montoClpManual(c);
    normalizados.push({
      cp_id: cpRow.id,
      monto_uf: montoUF,
      monto_clp: montoClpDesdeCP({ ...c, monto_uf: montoUF }, ufValor),
      monto_clp_manual: manual,
      monto_clp_es_manual: manual !== null ? 1 : 0,
      orden: i
    });
  }
  return normalizados;
}

const ESTADOS_SOLICITUD_VALIDOS = [
  'PENDIENTE OC / HES', 'FACTURA SOLICITADA'
];
const ESTADOS_REQUIEREN_DATOS_COMPLETOS = ['FACTURA SOLICITADA'];

function normalizarEstadoSolicitud(estado) {
  const valor = estado === 'FACTURADO' ? 'FACTURA SOLICITADA' : (estado || 'PENDIENTE OC / HES');
  if (!ESTADOS_SOLICITUD_VALIDOS.includes(valor)) {
    throw Object.assign(new Error(`Estado de solicitud invalido: ${valor}`), { code: 'VALIDATION_ERROR' });
  }
  return valor;
}

async function coordinadorActivo(id) {
  if (!id) return null;
  return db.get('SELECT id FROM coordinador WHERE id = ? AND activo = 1', [id]);
}

async function clienteActivo(id) {
  if (!id) return null;
  return db.get("SELECT id, coordinador_id FROM cliente WHERE id = ? AND estado <> 'Inactivo'", [id]);
}

async function clienteAsignadoAlCoordinador(clienteId, coordinadorId) {
  if (!clienteId || !coordinadorId) return false;
  const cliente = await clienteActivo(clienteId);
  if (!cliente) return false;
  if (cliente.coordinador_id === coordinadorId) return true;
  return !!(await db.get(`
    SELECT id
    FROM cliente_coordinador
    WHERE cliente_id = ?
      AND coordinador_id = ?
      AND activo = 1
    LIMIT 1
  `, [clienteId, coordinadorId]));
}

async function normalizarReceptoresDeCliente(receptores, clienteId) {
  const payload = await receptoresPayloadODefecto(receptores, clienteId);
  if (!payload.length) {
    throw Object.assign(new Error('El cliente seleccionado no tiene receptores activos'), { code: 'VALIDATION_ERROR' });
  }
  const vistos = new Set();
  const normalizados = [];
  for (const rec of payload) {
    const recId = rec.receptor_id || rec.id;
    if (!recId) continue;
    const row = await db.get(`
      SELECT id
      FROM receptor
      WHERE id = ?
        AND cliente_id = ?
        AND activo = 1
    `, [recId, clienteId]);
    if (!row) {
      throw Object.assign(new Error('Receptor no pertenece al cliente seleccionado o esta inactivo'), { code: 'VALIDATION_ERROR' });
    }
    if (!vistos.has(row.id)) {
      vistos.add(row.id);
      normalizados.push({ receptor_id: row.id });
    }
  }
  return normalizados;
}

function validarDatosPorEstado(s, netoCLP) {
  const errs = [];
  if (!s.cliente_id) errs.push('cliente_id');
  if (!s.empresa_emisora) errs.push('empresa_emisora');
  if (!s.periodo) errs.push('periodo');

  if (ESTADOS_REQUIEREN_DATOS_COMPLETOS.includes(s.estado)) {
    if (!s.coordinador_id) errs.push('coordinador_id');
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
    const labels = { coordinador_id: 'responsable' };
    const visibles = errs.map(field => labels[field] || field);
    const err = new Error('Faltan datos obligatorios para el estado seleccionado: ' + visibles.join(', '));
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

function normalizarTexto(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toUpperCase();
}

function normalizarEmpresaEmisora(empresa) {
  const codigo = normalizarTexto(empresa || EMPRESA_EMISORA_DEFAULT);
  if (codigo === 'INSTITUTO_ROY') return 'INSTITUTO_ROI';
  return codigo;
}

function empresaEmisoraValida(empresa) {
  return EMPRESAS_EMISORAS_SOLICITUD.includes(normalizarEmpresaEmisora(empresa));
}

function empresaEmisoraSolicitud(empresa) {
  const codigo = normalizarEmpresaEmisora(empresa);
  return empresaEmisoraValida(codigo) ? codigo : null;
}

function filtroEmpresasSolicitud(sql, vals, alias = 'sf') {
  vals.push(...EMPRESAS_EMISORAS_SOLICITUD);
  return `${sql} AND ${alias}.empresa_emisora IN (${EMPRESAS_EMISORAS_SOLICITUD.map(() => '?').join(',')})`;
}

function estadoPrioridadSolicitud(estado) {
  if (estado === 'PENDIENTE OC / HES') return 1;
  if (estado === 'FACTURA SOLICITADA') return 2;
  return 3;
}

r.get('/', async (req, res, next) => {
  try {
    const { clienteId, estado, periodo, tipo, q } = req.query;
    let sql = `SELECT sf.*, c.nombre_corto as cliente_nombre, co.nombre as coordinador_nombre,
        COALESCE((
          SELECT SUM(COALESCE(sc.monto_uf, 0))
          FROM solicitud_cp sc
          WHERE sc.solicitud_id = sf.id
        ), 0) as monto_uf
      FROM solicitud_factura sf
      JOIN cliente c ON c.id = sf.cliente_id
      LEFT JOIN coordinador co ON co.id = sf.coordinador_id
      WHERE sf.is_delete = 0`;
    const vals = [];
    sql = filtroEmpresasSolicitud(sql, vals);
    sql = aplicarScope(sql, vals, req);
    if (clienteId) { sql += ' AND sf.cliente_id = ?'; vals.push(clienteId); }
    if (estado)    { sql += ' AND sf.estado = ?'; vals.push(normalizarEstadoSolicitud(estado)); }
    if (periodo)   { sql += ' AND sf.periodo = ?'; vals.push(periodo); }
    if (tipo)      { sql += ' AND sf.tipo = ?'; vals.push(tipo); }
    if (q) {
      sql += ` AND (
        LOWER(COALESCE(sf.folio, '')) LIKE LOWER(?)
        OR LOWER(COALESCE(sf.glosa, '')) LIKE LOWER(?)
        OR LOWER(COALESCE(sf.oc_numero, '')) LIKE LOWER(?)
        OR LOWER(COALESCE(sf.contrato_numero, '')) LIKE LOWER(?)
        OR LOWER(COALESCE(c.nombre_corto, '')) LIKE LOWER(?)
        OR LOWER(COALESCE(c.razon_social, '')) LIKE LOWER(?)
        OR LOWER(COALESCE(c.rut, '')) LIKE LOWER(?)
      )`;
      vals.push(`%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`);
    }
    sql += ' ORDER BY sf.created_at DESC LIMIT 200';
    const reales = [];
    for (const row of await db.all(sql, vals)) {
      reales.push(await aplicarCoordinadorSugerido(row));
    }

    ok(res, reales.sort((a, b) => {
      const estadoA = estadoPrioridadSolicitud(a.estado);
      const estadoB = estadoPrioridadSolicitud(b.estado);
      return estadoA - estadoB || String(a.cliente_nombre || '').localeCompare(String(b.cliente_nombre || ''), 'es');
    }));
  } catch (error) {
    next(error);
  }
});

r.post('/', async (req, res, next) => {
  try {
    const b = req.body || {};
    const coordinatorId = coordinadorScope(req);
    if (coordinatorId === '__none__') return fail(res, 'FORBIDDEN', 'Tu usuario no tiene responsable asociado', null, 403);
    if (coordinatorId) b.coordinador_id = coordinatorId;
    b.empresa_emisora = empresaEmisoraSolicitud(b.empresa_emisora || EMPRESA_EMISORA_DEFAULT);
    if (!b.cliente_id || !b.empresa_emisora || !b.periodo)
      return fail(res, 'VALIDATION_ERROR', 'Faltan campos obligatorios: cliente_id, empresa_emisora, periodo');
    if (!(await clienteActivo(b.cliente_id)))
      return fail(res, 'VALIDATION_ERROR', 'Cliente no existe o esta inactivo');
    if (coordinatorId && !(await clienteAsignadoAlCoordinador(b.cliente_id, coordinatorId)))
      return fail(res, 'FORBIDDEN', 'El cliente no esta asignado a tu responsable', null, 403);
    if (!empresaEmisoraValida(b.empresa_emisora))
      return fail(res, 'VALIDATION_ERROR', 'Facturar Por no es valido');
    if (b.coordinador_id && !(await coordinadorActivo(b.coordinador_id)))
      return fail(res, 'VALIDATION_ERROR', 'Responsable no existe o esta inactivo');

    const id = uuidv4();
    let clienteFacturacionId = null;
    try {
      clienteFacturacionId = await validarClienteFacturacion(b.cliente_id, b.cliente_facturacion_id);
    } catch (e) {
      return fail(res, e.code || 'VALIDATION_ERROR', e.message);
    }
    const montoNetoManual = parseNumero(b.monto_neto_clp_manual);
    const itemsPayload = b.items || [];
    const totals = itemsPayload.length
      ? await calcularTotales(itemsPayload, b.empresa_emisora, b.moneda_base, b.uf_valor)
      : { items: [], ...(await calcularTotalesDesdeCPs(b.cps, b.empresa_emisora, b.uf_valor, montoNetoManual)) };
    const { items, monto_neto_clp, monto_iva_clp, monto_total_clp } = totals;
    let cpsNormalizados = [];
    try {
      cpsNormalizados = await normalizarCPsDeCliente(b.cps, b.cliente_id, b.uf_valor);
    } catch (e) {
      return fail(res, e.code || 'VALIDATION_ERROR', e.message);
    }
    let estadoInicial;
    let receptoresIniciales = [];
    const observacionesIniciales = observacionesConUF(b.observaciones, b.uf_fecha, b.uf_valor);
    try {
      receptoresIniciales = await normalizarReceptoresDeCliente(b.receptores, b.cliente_id);
      estadoInicial = normalizarEstadoSolicitud(b.estado);
      validarDatosPorEstado({ ...b, observaciones: observacionesIniciales, estado: estadoInicial, cps: b.cps || [], receptores: receptoresIniciales }, monto_neto_clp);
    } catch (e) {
      return fail(res, e.code || 'VALIDATION_ERROR', e.message);
    }

    const folio = await db.transaction(async tx => {
      const nextFolio = await generarFolio(tx);
      await tx.run(`INSERT INTO solicitud_factura
        (id, folio, tipo, cliente_id, coordinador_id, empresa_emisora, periodo, fecha_solicitud,
         oc_numero, contrato_numero, hes_numero, glosa, area, moneda_base, uf_fecha, uf_valor,
         monto_neto_clp, monto_iva_clp, monto_total_clp, monto_neto_clp_manual, cliente_facturacion_id, observaciones, estado, programada_id)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`, [
        id, nextFolio, b.tipo || 'mensual', b.cliente_id, b.coordinador_id || null, b.empresa_emisora,
        b.periodo, b.fecha_solicitud || new Date().toISOString().slice(0,10),
        b.oc_numero || null, b.contrato_numero || null, b.hes_numero || null,
        b.glosa || '', b.area || null, b.moneda_base || 'CLP', b.uf_fecha || null, b.uf_valor || null,
        monto_neto_clp, monto_iva_clp, monto_total_clp, montoNetoManual, clienteFacturacionId, observacionesIniciales, estadoInicial, b.programada_id || null
      ]);

      for (const [i, item] of (items || []).entries()) {
        await tx.run(`INSERT INTO solicitud_item (id, solicitud_id, producto_id, descripcion, codigo_ref, cantidad, uf_unitaria, clp_unitario, subtotal_clp, orden)
          VALUES (?,?,?,?,?,?,?,?,?,?)`, [
          uuidv4(), id, item.producto_id || null, item.descripcion || '', item.codigo_ref || null,
          item.cantidad || 1, item.uf_unitaria || null, item.clp_unitario || null, item.subtotal_clp || 0, i
        ]);
      }

      for (const c of cpsNormalizados) {
        await tx.run('INSERT INTO solicitud_cp (id, solicitud_id, cp_id, monto_uf, monto_clp, monto_clp_manual, monto_clp_es_manual, orden) VALUES (?,?,?,?,?,?,?,?)', [
          uuidv4(), id, c.cp_id, c.monto_uf, c.monto_clp, c.monto_clp_manual, c.monto_clp_es_manual, c.orden
        ]);
      }

      await insertarReceptoresSolicitud(tx, id, receptoresIniciales);

      await tx.run('INSERT INTO historial_estado (id, solicitud_id, estado_desde, estado_hacia, usuario, comentario) VALUES (?,?,?,?,?,?)', [
        uuidv4(), id, null, estadoInicial, b._usuario || 'sistema', 'Solicitud creada'
      ]);
      return nextFolio;
    });

    audit.log(req, 'crear', 'solicitud_factura', id, { folio, periodo: b.periodo, cliente_id: b.cliente_id });
    ok(res, await hydrateOne(await db.get('SELECT * FROM solicitud_factura WHERE id = ? AND is_delete = 0', [id])), 201);
  } catch (error) {
    next(error);
  }
});

r.post('/proyecciones/:id/materializar', (req, res) => {
  return fail(res, 'PROYECCIONES_DISABLED', 'Las proyecciones no se utilizan en este proyecto', null, 410);
});

r.get('/:id', async (req, res, next) => {
  try {
    const row = await db.get(`
      SELECT * FROM solicitud_factura
      WHERE (id = ? OR folio = ?)
        AND is_delete = 0
        AND empresa_emisora IN (${EMPRESAS_EMISORAS_SOLICITUD.map(() => '?').join(',')})
    `, [req.params.id, req.params.id, ...EMPRESAS_EMISORAS_SOLICITUD]);
    if (!row) return notFound(res);
    if (!puedeVerSolicitud(req, row)) return notFound(res);
    ok(res, await hydrateOne(row));
  } catch (error) {
    next(error);
  }
});

r.patch('/:id', async (req, res, next) => {
  try {
    const sol = await db.get(`
      SELECT *
      FROM solicitud_factura
      WHERE id = ?
        AND is_delete = 0
        AND empresa_emisora IN (${EMPRESAS_EMISORAS_SOLICITUD.map(() => '?').join(',')})
    `, [req.params.id, ...EMPRESAS_EMISORAS_SOLICITUD]);
    if (!sol) return notFound(res);
    if (!puedeVerSolicitud(req, sol)) return notFound(res);
    if (!puedeEditar(sol.estado))
      return fail(res, 'STATE_TRANSITION_INVALID', `No se puede editar una solicitud en estado "${sol.estado}"`);

    const b = req.body || {};
    const coordinatorId = coordinadorScope(req);
    if (coordinatorId === '__none__') return fail(res, 'FORBIDDEN', 'Tu usuario no tiene responsable asociado', null, 403);
    if (coordinatorId) {
      if (b.coordinador_id !== undefined && b.coordinador_id !== coordinatorId) {
        return fail(res, 'FORBIDDEN', 'Solo un admin puede cambiar el responsable de una solicitud', null, 403);
      }
      b.coordinador_id = coordinatorId;
    }
    if (b.empresa_emisora !== undefined) {
      b.empresa_emisora = empresaEmisoraSolicitud(b.empresa_emisora);
      if (!b.empresa_emisora) return fail(res, 'VALIDATION_ERROR', 'Facturar Por no es valido');
    }
    let clienteIdEfectivo = sol.cliente_id;
    if (b.cliente_id !== undefined) {
      if (!b.cliente_id) return fail(res, 'VALIDATION_ERROR', 'cliente_id es requerido');
      if (!(await clienteActivo(b.cliente_id)))
        return fail(res, 'VALIDATION_ERROR', 'Cliente no existe o esta inactivo');
      if (coordinatorId && !(await clienteAsignadoAlCoordinador(b.cliente_id, coordinatorId)))
        return fail(res, 'FORBIDDEN', 'El cliente no esta asignado a tu responsable', null, 403);
      clienteIdEfectivo = b.cliente_id;
    }
    if (b.coordinador_id && !(await coordinadorActivo(b.coordinador_id)))
      return fail(res, 'VALIDATION_ERROR', 'Responsable no existe o esta inactivo');
    let clienteFacturacionId = sol.cliente_facturacion_id || null;
    if (b.cliente_facturacion_id !== undefined) {
      try {
        clienteFacturacionId = await validarClienteFacturacion(clienteIdEfectivo, b.cliente_facturacion_id);
      } catch (e) {
        return fail(res, e.code || 'VALIDATION_ERROR', e.message);
      }
    }
    const cpsParaTotales = b.cps !== undefined
      ? b.cps
      : await db.all('SELECT monto_uf, monto_clp, monto_clp_manual, monto_clp_es_manual FROM solicitud_cp WHERE solicitud_id=?', [sol.id]);
    const itemsParaTotales = b.items !== undefined
      ? b.items
      : (b.cps !== undefined ? [] : await db.all('SELECT * FROM solicitud_item WHERE solicitud_id=?', [sol.id]));
    const montoNetoManual = b.monto_neto_clp_manual !== undefined
      ? parseNumero(b.monto_neto_clp_manual)
      : parseNumero(sol.monto_neto_clp_manual);
    const totals = itemsParaTotales.length
      ? await calcularTotales(
        itemsParaTotales,
        b.empresa_emisora || sol.empresa_emisora,
        b.moneda_base || sol.moneda_base,
        b.uf_valor !== undefined ? b.uf_valor : sol.uf_valor
      )
      : { items: [], ...(await calcularTotalesDesdeCPs(cpsParaTotales, b.empresa_emisora || sol.empresa_emisora, b.uf_valor !== undefined ? b.uf_valor : sol.uf_valor, montoNetoManual)) };
    const { items, monto_neto_clp, monto_iva_clp, monto_total_clp } = totals;
    let cpsNormalizados = [];
    if (b.cps !== undefined) {
      try {
        cpsNormalizados = await normalizarCPsDeCliente(b.cps, clienteIdEfectivo, b.uf_valor !== undefined ? b.uf_valor : sol.uf_valor);
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
    let receptoresEfectivos = await db.all('SELECT receptor_id FROM solicitud_receptor WHERE solicitud_id=?', [sol.id]);
    const cpsEfectivos = b.cps !== undefined ? b.cps : cpsParaTotales;
    const ufFechaEfectiva = b.uf_fecha !== undefined ? b.uf_fecha : sol.uf_fecha;
    const ufValorEfectivo = b.uf_valor !== undefined ? b.uf_valor : sol.uf_valor;
    const observacionesEfectivas = observacionesConUF(
      b.observaciones !== undefined ? b.observaciones : sol.observaciones,
      ufFechaEfectiva,
      ufValorEfectivo
    );
    try {
      if (b.receptores !== undefined) {
        receptoresEfectivos = await normalizarReceptoresDeCliente(b.receptores, clienteIdEfectivo);
      }
      validarDatosPorEstado({
        ...sol,
        ...b,
        cliente_id: clienteIdEfectivo,
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

    await db.transaction(async tx => {
      const fields = ['tipo','cliente_id','coordinador_id','empresa_emisora','periodo','fecha_solicitud','oc_numero',
        'contrato_numero','hes_numero','glosa','area','moneda_base','uf_fecha','uf_valor'];
      const sets = ['monto_neto_clp=?', 'monto_iva_clp=?', 'monto_total_clp=?', 'monto_neto_clp_manual=?', 'updated_at=?'];
      const vals = [monto_neto_clp, monto_iva_clp, monto_total_clp, montoNetoManual, db.nowText()];
      fields.forEach(f => { if (b[f] !== undefined) { sets.push(`${f}=?`); vals.push(b[f]); } });
      if (b.observaciones !== undefined || b.uf_fecha !== undefined || b.uf_valor !== undefined) {
        sets.push('observaciones=?');
        vals.push(observacionesEfectivas);
      }
      if (estadoNuevo !== undefined) { sets.push('estado=?'); vals.push(estadoNuevo); }
      if (b.cliente_facturacion_id !== undefined) { sets.push('cliente_facturacion_id=?'); vals.push(clienteFacturacionId); }
      vals.push(req.params.id);
      await tx.run(`UPDATE solicitud_factura SET ${sets.join(',')} WHERE id=?`, vals);

      if (b.items !== undefined || b.cps !== undefined) {
        await tx.run('DELETE FROM solicitud_item WHERE solicitud_id = ?', [req.params.id]);
      }
      if (b.items !== undefined) {
        for (const [i, item] of items.entries()) {
          await tx.run(`INSERT INTO solicitud_item (id, solicitud_id, producto_id, descripcion, codigo_ref, cantidad, uf_unitaria, clp_unitario, subtotal_clp, orden)
            VALUES (?,?,?,?,?,?,?,?,?,?)`, [
            uuidv4(), req.params.id, item.producto_id || null, item.descripcion || '', item.codigo_ref || null,
            item.cantidad || 1, item.uf_unitaria || null, item.clp_unitario || null, item.subtotal_clp || 0, i
          ]);
        }
      }
      if (b.cps !== undefined) {
        await tx.run('DELETE FROM solicitud_cp WHERE solicitud_id = ?', [req.params.id]);
        for (const c of cpsNormalizados) {
          await tx.run('INSERT INTO solicitud_cp (id, solicitud_id, cp_id, monto_uf, monto_clp, monto_clp_manual, monto_clp_es_manual, orden) VALUES (?,?,?,?,?,?,?,?)', [
            uuidv4(), req.params.id, c.cp_id, c.monto_uf, c.monto_clp, c.monto_clp_manual, c.monto_clp_es_manual, c.orden
          ]);
        }
      }
      if (b.receptores !== undefined) {
        await tx.run('DELETE FROM solicitud_receptor WHERE solicitud_id = ?', [req.params.id]);
        await insertarReceptoresSolicitud(tx, req.params.id, receptoresEfectivos);
      }
      if (estadoNuevo !== undefined && estadoNuevo !== sol.estado) {
        await tx.run('INSERT INTO historial_estado (id, solicitud_id, estado_desde, estado_hacia, usuario, comentario) VALUES (?,?,?,?,?,?)', [
          uuidv4(), req.params.id, sol.estado, estadoNuevo, b._usuario || 'sistema', 'Estado actualizado desde formulario'
        ]);
      }
    });

    audit.log(req, 'editar', 'solicitud_factura', req.params.id, {
      folio: sol.folio,
      fields: Object.keys(b).filter(k => k !== '_usuario')
    });

    ok(res, await hydrateOne(await db.get('SELECT * FROM solicitud_factura WHERE id = ? AND is_delete = 0', [req.params.id])));
  } catch (error) {
    next(error);
  }
});

r.delete('/:id', async (req, res, next) => {
  try {
    const sol = await db.get(`
      SELECT id, folio, coordinador_id
      FROM solicitud_factura
      WHERE id = ?
        AND is_delete = 0
        AND empresa_emisora IN (${EMPRESAS_EMISORAS_SOLICITUD.map(() => '?').join(',')})
    `, [req.params.id, ...EMPRESAS_EMISORAS_SOLICITUD]);
    if (!sol) return notFound(res);
    if (!puedeVerSolicitud(req, sol)) return notFound(res);
    await db.run('UPDATE solicitud_factura SET is_delete = 1, updated_at = ? WHERE id = ?', [db.nowText(), req.params.id]);
    audit.log(req, 'eliminar', 'solicitud_factura', req.params.id, { folio: sol.folio });
    ok(res, { id: sol.id, folio: sol.folio });
  } catch (error) {
    next(error);
  }
});

r.post('/:id/estado', async (req, res, next) => {
  try {
    const { hacia, comentario } = req.body || {};
    if (!hacia) return fail(res, 'VALIDATION_ERROR', '"hacia" es requerido');
    const row = await db.get(`
      SELECT id, coordinador_id
      FROM solicitud_factura
      WHERE id = ?
        AND is_delete = 0
        AND empresa_emisora IN (${EMPRESAS_EMISORAS_SOLICITUD.map(() => '?').join(',')})
    `, [req.params.id, ...EMPRESAS_EMISORAS_SOLICITUD]);
    if (!row) return notFound(res);
    if (!puedeVerSolicitud(req, row)) return notFound(res);
    try {
      await cambiarEstado(req.params.id, hacia, req.body._usuario || 'usuario', comentario);
      audit.log(req, 'cambiar_estado', 'solicitud_factura', req.params.id, { hacia, comentario });
      ok(res, await hydrateOne(await db.get(`
        SELECT *
        FROM solicitud_factura
        WHERE id = ?
          AND is_delete = 0
          AND empresa_emisora IN (${EMPRESAS_EMISORAS_SOLICITUD.map(() => '?').join(',')})
      `, [req.params.id, ...EMPRESAS_EMISORAS_SOLICITUD])));
    } catch (e) {
      fail(res, e.code || 'ERROR', e.message);
    }
  } catch (error) {
    next(error);
  }
});

r.post('/:id/duplicar', async (req, res, next) => {
  try {
    const orig = await db.get(`
      SELECT *
      FROM solicitud_factura
      WHERE id = ?
        AND is_delete = 0
        AND empresa_emisora IN (${EMPRESAS_EMISORAS_SOLICITUD.map(() => '?').join(',')})
    `, [req.params.id, ...EMPRESAS_EMISORAS_SOLICITUD]);
    if (!orig) return notFound(res);
    if (!puedeVerSolicitud(req, orig)) return notFound(res);
    const newId = uuidv4();

    const newFolio = await db.transaction(async tx => {
      const nextFolio = await generarFolio(tx);
      await tx.run(`INSERT INTO solicitud_factura
        (id, folio, tipo, cliente_id, coordinador_id, empresa_emisora, periodo, fecha_solicitud,
         oc_numero, contrato_numero, hes_numero, glosa, area, moneda_base, monto_neto_clp_manual, cliente_facturacion_id, observaciones, estado, version_plantilla)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`, [
        newId, nextFolio, orig.tipo, orig.cliente_id, orig.coordinador_id, orig.empresa_emisora,
        orig.periodo, new Date().toISOString().slice(0,10),
        orig.oc_numero, orig.contrato_numero, orig.hes_numero, orig.glosa, orig.area,
        orig.moneda_base, orig.monto_neto_clp_manual, orig.cliente_facturacion_id, orig.observaciones, 'PENDIENTE OC / HES', orig.version_plantilla
      ]);

      const items = await tx.all('SELECT * FROM solicitud_item WHERE solicitud_id = ?', [orig.id]);
      for (const item of items) {
        await tx.run(`INSERT INTO solicitud_item (id, solicitud_id, producto_id, descripcion, codigo_ref, cantidad, uf_unitaria, clp_unitario, subtotal_clp, orden)
          VALUES (?,?,?,?,?,?,?,?,?,?)`, [
          uuidv4(), newId, item.producto_id, item.descripcion, item.codigo_ref, item.cantidad, item.uf_unitaria, item.clp_unitario, item.subtotal_clp, item.orden
        ]);
      }

      const cps = await tx.all('SELECT * FROM solicitud_cp WHERE solicitud_id = ?', [orig.id]);
      for (const cp of cps) {
        await tx.run('INSERT INTO solicitud_cp (id, solicitud_id, cp_id, monto_uf, monto_clp, monto_clp_manual, monto_clp_es_manual, orden) VALUES (?,?,?,?,?,?,?,?)', [
          uuidv4(), newId, cp.cp_id, cp.monto_uf, cp.monto_clp, cp.monto_clp_manual, cp.monto_clp_es_manual || 0, cp.orden
        ]);
      }

      const receptores = await tx.all('SELECT receptor_id FROM solicitud_receptor WHERE solicitud_id = ?', [orig.id]);
      await insertarReceptoresSolicitud(tx, newId, receptores);

      await tx.run('INSERT INTO historial_estado (id, solicitud_id, estado_desde, estado_hacia, usuario, comentario) VALUES (?,?,?,?,?,?)', [
        uuidv4(), newId, null, 'PENDIENTE OC / HES', 'sistema', `Duplicada desde ${orig.folio}`
      ]);
      return nextFolio;
    });

    audit.log(req, 'duplicar', 'solicitud_factura', newId, { desde: orig.id, folio_origen: orig.folio, folio: newFolio });
    ok(res, await hydrateOne(await db.get('SELECT * FROM solicitud_factura WHERE id = ? AND is_delete = 0', [newId])), 201);
  } catch (error) {
    next(error);
  }
});

r.get('/:id/historial', async (req, res, next) => {
  try {
    const row = await db.get(`
      SELECT id, coordinador_id
      FROM solicitud_factura
      WHERE id = ?
        AND is_delete = 0
        AND empresa_emisora IN (${EMPRESAS_EMISORAS_SOLICITUD.map(() => '?').join(',')})
    `, [req.params.id, ...EMPRESAS_EMISORAS_SOLICITUD]);
    if (!row) return notFound(res);
    if (!puedeVerSolicitud(req, row)) return notFound(res);
    ok(res, await db.all('SELECT * FROM historial_estado WHERE solicitud_id = ? ORDER BY fecha DESC', [req.params.id]));
  } catch (error) {
    next(error);
  }
});

module.exports = r;
