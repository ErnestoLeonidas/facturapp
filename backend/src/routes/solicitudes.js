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
  sol.coordinador = sol.coordinador_id ? db.prepare('SELECT id, nombre, email FROM coordinador WHERE id = ?').get(sol.coordinador_id) : null;
  sol.empresa = db.prepare('SELECT * FROM empresa_emisora WHERE codigo = ?').get(sol.empresa_emisora);
  sol.historial = db.prepare('SELECT * FROM historial_estado WHERE solicitud_id = ? ORDER BY fecha DESC').all(sol.id);
  return sol;
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

  const ivaCLP = afectoIva ? Math.round(netoCLP * ivaPct) : 0;
  const totalCLP = netoCLP + ivaCLP;
  return { items: itemsCalc, monto_neto_clp: netoCLP, monto_iva_clp: ivaCLP, monto_total_clp: totalCLP };
}

function calcularTotalesDesdeCPs(cps, empresaCodigo) {
  const empresa = db.prepare('SELECT * FROM empresa_emisora WHERE codigo = ?').get(empresaCodigo);
  const afectoIva = empresa && empresa.afecto_iva;
  const ivaPct = (empresa && empresa.iva_pct) || 0.19;
  const netoCLP = (cps || []).reduce((sum, cp) => sum + (Number(cp.monto_clp) || 0), 0);
  const ivaCLP = afectoIva ? Math.round(netoCLP * ivaPct) : 0;
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

function normalizarCPsDeCliente(cps, clienteId) {
  return (cps || []).map((c, i) => {
    const cpRow = resolverCPDeCliente(c.cp_id || c.cp_codigo, clienteId);
    if (!cpRow) {
      throw Object.assign(new Error('CP no pertenece al cliente seleccionado'), { code: 'VALIDATION_ERROR' });
    }
    return { cp_id: cpRow.id, monto_clp: c.monto_clp || 0, orden: i };
  });
}

r.get('/', (req, res) => {
  const { clienteId, estado, periodo, tipo, q } = req.query;
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
  ok(res, db.prepare(sql).all(...vals));
});

r.post('/', (req, res) => {
  const b = req.body;
  if (!b.cliente_id || !b.glosa || !b.empresa_emisora || !b.periodo)
    return fail(res, 'VALIDATION_ERROR', 'Faltan campos obligatorios: cliente_id, glosa, empresa_emisora, periodo');

  const id = uuidv4();
  const folio = generarFolio();
  const itemsPayload = b.items || [];
  const totals = itemsPayload.length
    ? calcularTotales(itemsPayload, b.empresa_emisora, b.moneda_base, b.uf_valor)
    : { items: [], ...calcularTotalesDesdeCPs(b.cps, b.empresa_emisora) };
  const { items, monto_neto_clp, monto_iva_clp, monto_total_clp } = totals;
  let cpsNormalizados = [];
  try {
    cpsNormalizados = normalizarCPsDeCliente(b.cps, b.cliente_id);
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
        b.glosa, b.area||null, b.moneda_base||'CLP', b.uf_fecha||null, b.uf_valor||null,
        monto_neto_clp, monto_iva_clp, monto_total_clp, b.observaciones||null, 'Borrador', b.programada_id||null);

    (items || []).forEach((item, i) => {
      db.prepare(`INSERT INTO solicitud_item (id, solicitud_id, producto_id, descripcion, codigo_ref, cantidad, uf_unitaria, clp_unitario, subtotal_clp, orden)
        VALUES (?,?,?,?,?,?,?,?,?,?)`)
        .run(uuidv4(), id, item.producto_id||null, item.descripcion||'', item.codigo_ref||null,
          item.cantidad||1, item.uf_unitaria||null, item.clp_unitario||null, item.subtotal_clp||0, i);
    });

    cpsNormalizados.forEach(c => {
      db.prepare('INSERT INTO solicitud_cp (id, solicitud_id, cp_id, monto_clp, orden) VALUES (?,?,?,?,?)')
        .run(uuidv4(), id, c.cp_id, c.monto_clp, c.orden);
    });

    (b.receptores || []).forEach(rec => {
      const recId = rec.receptor_id || rec.id;
      if (recId) db.prepare('INSERT OR IGNORE INTO solicitud_receptor (solicitud_id, receptor_id) VALUES (?,?)').run(id, recId);
    });

    db.prepare('INSERT INTO historial_estado (id, solicitud_id, estado_desde, estado_hacia, usuario, comentario) VALUES (?,?,?,?,?,?)')
      .run(uuidv4(), id, null, 'Borrador', b._usuario||'sistema', 'Solicitud creada');
  });
  ins();

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
  const cpsParaTotales = b.cps !== undefined
    ? b.cps
    : db.prepare('SELECT monto_clp FROM solicitud_cp WHERE solicitud_id=?').all(sol.id);
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
    : { items: [], ...calcularTotalesDesdeCPs(cpsParaTotales, b.empresa_emisora || sol.empresa_emisora) };
  const { items, monto_neto_clp, monto_iva_clp, monto_total_clp } = totals;
  let cpsNormalizados = [];
  if (b.cps !== undefined) {
    try {
      cpsNormalizados = normalizarCPsDeCliente(b.cps, sol.cliente_id);
    } catch (e) {
      return fail(res, e.code || 'VALIDATION_ERROR', e.message);
    }
  }

  const fields = ['tipo','coordinador_id','empresa_emisora','periodo','fecha_solicitud','oc_numero',
    'contrato_numero','hes_numero','glosa','area','moneda_base','uf_fecha','uf_valor','observaciones'];
  const sets = ["monto_neto_clp=?", "monto_iva_clp=?", "monto_total_clp=?", "updated_at=datetime('now')"];
  const vals = [monto_neto_clp, monto_iva_clp, monto_total_clp];
  fields.forEach(f => { if (b[f] !== undefined) { sets.push(`${f}=?`); vals.push(b[f]); } });
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
      db.prepare('INSERT INTO solicitud_cp (id, solicitud_id, cp_id, monto_clp, orden) VALUES (?,?,?,?,?)')
        .run(uuidv4(), req.params.id, c.cp_id, c.monto_clp, c.orden);
    });
  }
  if (b.receptores !== undefined) {
    db.prepare('DELETE FROM solicitud_receptor WHERE solicitud_id = ?').run(req.params.id);
    b.receptores.forEach(rec => {
      const recId = rec.receptor_id || rec.id;
      if (recId) db.prepare('INSERT OR IGNORE INTO solicitud_receptor (solicitud_id, receptor_id) VALUES (?,?)').run(req.params.id, recId);
    });
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
        orig.moneda_base, orig.observaciones, 'Borrador', orig.version_plantilla);

    db.prepare('SELECT * FROM solicitud_item WHERE solicitud_id = ?').all(orig.id).forEach(item => {
      db.prepare(`INSERT INTO solicitud_item (id, solicitud_id, producto_id, descripcion, codigo_ref, cantidad, uf_unitaria, clp_unitario, subtotal_clp, orden)
        VALUES (?,?,?,?,?,?,?,?,?,?)`)
        .run(uuidv4(), newId, item.producto_id, item.descripcion, item.codigo_ref, item.cantidad, item.uf_unitaria, item.clp_unitario, item.subtotal_clp, item.orden);
    });

    db.prepare('SELECT * FROM solicitud_cp WHERE solicitud_id = ?').all(orig.id).forEach(cp => {
      db.prepare('INSERT INTO solicitud_cp (id, solicitud_id, cp_id, monto_clp, orden) VALUES (?,?,?,?,?)').run(uuidv4(), newId, cp.cp_id, cp.monto_clp, cp.orden);
    });

    db.prepare('SELECT receptor_id FROM solicitud_receptor WHERE solicitud_id = ?').all(orig.id).forEach(({ receptor_id }) => {
      db.prepare('INSERT OR IGNORE INTO solicitud_receptor (solicitud_id, receptor_id) VALUES (?,?)').run(newId, receptor_id);
    });

    db.prepare('INSERT INTO historial_estado (id, solicitud_id, estado_desde, estado_hacia, usuario, comentario) VALUES (?,?,?,?,?,?)')
      .run(uuidv4(), newId, null, 'Borrador', 'sistema', `Duplicada desde ${orig.folio}`);
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
