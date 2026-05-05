const r = require('express').Router();
const db = require('../db');
const { v4: uuidv4 } = require('uuid');
const { ok, fail, notFound } = require('../middleware/envelope');
const { generarFolio } = require('../utils/folio');

r.get('/', (req, res) => {
  const rows = db.prepare(`SELECT sp.*, c.nombre_corto as cliente_nombre
    FROM solicitud_programada sp JOIN cliente c ON c.id=sp.cliente_id
    WHERE sp.activa = 1 ORDER BY c.nombre_corto`).all();
  ok(res, rows.map(r => ({ ...r, payload_base: r.payload_base ? JSON.parse(r.payload_base) : null })));
});

r.post('/', (req, res) => {
  const { cliente_id, nombre, dia_emision, frecuencia, mes_inicio, payload_base } = req.body;
  if (!cliente_id || !nombre) return fail(res, 'VALIDATION_ERROR', 'cliente_id y nombre son requeridos');
  const id = uuidv4();
  db.prepare(`INSERT INTO solicitud_programada (id, cliente_id, nombre, dia_emision, frecuencia, mes_inicio, payload_base)
    VALUES (?,?,?,?,?,?,?)`)
    .run(id, cliente_id, nombre, dia_emision||null, frecuencia||'Mensual', mes_inicio||null,
      payload_base ? JSON.stringify(payload_base) : null);
  const row = db.prepare('SELECT * FROM solicitud_programada WHERE id=?').get(id);
  ok(res, { ...row, payload_base: row.payload_base ? JSON.parse(row.payload_base) : null }, 201);
});

r.patch('/:id', (req, res) => {
  const row = db.prepare('SELECT id FROM solicitud_programada WHERE id=?').get(req.params.id);
  if (!row) return notFound(res);
  const { nombre, dia_emision, frecuencia, mes_inicio, activa, payload_base } = req.body;
  const sets = ["updated_at=datetime('now')"]; const vals = [];
  if (nombre !== undefined)       { sets.push('nombre=?'); vals.push(nombre); }
  if (dia_emision !== undefined)  { sets.push('dia_emision=?'); vals.push(dia_emision); }
  if (frecuencia !== undefined)   { sets.push('frecuencia=?'); vals.push(frecuencia); }
  if (mes_inicio !== undefined)   { sets.push('mes_inicio=?'); vals.push(mes_inicio); }
  if (activa !== undefined)       { sets.push('activa=?'); vals.push(activa ? 1 : 0); }
  if (payload_base !== undefined) { sets.push('payload_base=?'); vals.push(JSON.stringify(payload_base)); }
  vals.push(req.params.id);
  db.prepare(`UPDATE solicitud_programada SET ${sets.join(',')} WHERE id=?`).run(...vals);
  const updated = db.prepare('SELECT * FROM solicitud_programada WHERE id=?').get(req.params.id);
  ok(res, { ...updated, payload_base: updated.payload_base ? JSON.parse(updated.payload_base) : null });
});

r.post('/:id/generar', (req, res) => {
  const prog = db.prepare('SELECT * FROM solicitud_programada WHERE id=?').get(req.params.id);
  if (!prog) return notFound(res);
  const periodo = req.query.periodo || req.body.periodo;
  if (!periodo || !/^\d{4}-\d{2}$/.test(periodo)) return fail(res, 'VALIDATION_ERROR', 'periodo debe ser YYYY-MM');

  const existente = db.prepare('SELECT id FROM solicitud_factura WHERE programada_id=? AND periodo=? AND is_delete = 0').get(prog.id, periodo);
  if (existente) return fail(res, 'VALIDATION_ERROR', `Ya existe solicitud para ${periodo} de esta plantilla`);

  const payload = prog.payload_base ? JSON.parse(prog.payload_base) : {};
  const newId = uuidv4();
  const folio = generarFolio();
  const [y, m] = periodo.split('-');
  const fechaSol = `${y}-${m}-${String(prog.dia_emision||1).padStart(2,'0')}`;

  db.prepare(`INSERT INTO solicitud_factura
    (id, folio, tipo, cliente_id, coordinador_id, empresa_emisora, periodo, fecha_solicitud,
     glosa, area, moneda_base, observaciones, estado, programada_id, version_plantilla)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`)
    .run(newId, folio, 'mensual', prog.cliente_id,
      payload.coordinador_id||null, payload.empresa_emisora||'MAS_CONSULTORES',
      periodo, fechaSol,
      payload.glosa || prog.nombre, payload.area||null, payload.moneda_base||'CLP',
      payload.observaciones||null, 'Borrador', prog.id, payload.version_plantilla||'v1');

  (payload.items||[]).forEach((item, i) => {
    db.prepare(`INSERT INTO solicitud_item (id, solicitud_id, descripcion, codigo_ref, cantidad, uf_unitaria, clp_unitario, subtotal_clp, orden)
      VALUES (?,?,?,?,?,?,?,?,?)`)
      .run(uuidv4(), newId, item.descripcion||'', item.codigo_ref||null, item.cantidad||1, item.uf_unitaria||null, item.clp_unitario||null, 0, i);
  });

  (payload.cps||[]).forEach((c, i) => {
    const cpRow = db.prepare('SELECT id FROM cp WHERE codigo=?').get(c.cp_codigo||c.cp_id);
    if (cpRow) db.prepare('INSERT INTO solicitud_cp (id, solicitud_id, cp_id, monto_clp, orden) VALUES (?,?,?,?,?)').run(uuidv4(), newId, cpRow.id, c.monto_clp||0, i);
  });

  (payload.receptores||[]).forEach(rec => {
    const recId = rec.receptor_id || rec.id;
    if (recId) db.prepare('INSERT OR IGNORE INTO solicitud_receptor (solicitud_id, receptor_id) VALUES (?,?)').run(newId, recId);
  });

  db.prepare('INSERT INTO historial_estado (id, solicitud_id, estado_desde, estado_hacia, usuario, comentario) VALUES (?,?,?,?,?,?)')
    .run(uuidv4(), newId, null, 'Borrador', 'sistema', `Generada desde plantilla "${prog.nombre}" para ${periodo}`);

  ok(res, db.prepare('SELECT * FROM solicitud_factura WHERE id=?').get(newId), 201);
});

module.exports = r;
