const r = require('express').Router();
const db = require('../db-async');
const { v4: uuidv4 } = require('uuid');
const { ok, fail, notFound } = require('../middleware/envelope');

function coordinadorScope(req) {
  if (!req.user || req.user.rol === 'admin') return null;
  return req.user.coordinador_id || '__none__';
}

function parsePayload(row) {
  return { ...row, payload_base: row.payload_base ? JSON.parse(row.payload_base) : null };
}

async function generarFolio(tx) {
  const year = new Date().getFullYear();
  const rows = await tx.all(
    'SELECT folio FROM solicitud_factura WHERE folio LIKE ?',
    [`SF-${year}-%`]
  );

  const ultimo = rows.reduce((max, row) => {
    const match = String(row.folio || '').match(new RegExp(`^SF-${year}-(\\d+)$`));
    if (!match) return max;
    return Math.max(max, Number(match[1]) || 0);
  }, 0);
  const n = ultimo + 1;

  return `SF-${year}-${String(n).padStart(5, '0')}`;
}

r.get('/', async (req, res, next) => {
  try {
    const rows = await db.all(`SELECT sp.*, c.nombre_corto as cliente_nombre
      FROM solicitud_programada sp JOIN cliente c ON c.id=sp.cliente_id
      WHERE sp.activa = 1 ORDER BY c.nombre_corto`);
    const coordinatorId = coordinadorScope(req);
    const parsed = rows.map(parsePayload).filter(row => {
      if (!coordinatorId) return true;
      return coordinatorId !== '__none__' && row.payload_base && row.payload_base.coordinador_id === coordinatorId;
    });
    ok(res, parsed);
  } catch (error) {
    next(error);
  }
});

r.post('/', async (req, res, next) => {
  try {
    const { cliente_id, nombre, dia_emision, frecuencia, mes_inicio } = req.body;
    const payload_base = { ...(req.body.payload_base || {}) };
    const coordinatorId = coordinadorScope(req);
    if (coordinatorId === '__none__') return fail(res, 'FORBIDDEN', 'Tu usuario no tiene coordinador asociado', null, 403);
    if (coordinatorId) payload_base.coordinador_id = coordinatorId;
    if (!cliente_id || !nombre) return fail(res, 'VALIDATION_ERROR', 'cliente_id y nombre son requeridos');
    const id = uuidv4();
    await db.run(`INSERT INTO solicitud_programada (id, cliente_id, nombre, dia_emision, frecuencia, mes_inicio, payload_base)
      VALUES (?,?,?,?,?,?,?)`, [
      id,
      cliente_id,
      nombre,
      dia_emision || null,
      frecuencia || 'Mensual',
      mes_inicio || null,
      Object.keys(payload_base).length ? JSON.stringify(payload_base) : null
    ]);
    const row = await db.get('SELECT * FROM solicitud_programada WHERE id=?', [id]);
    ok(res, parsePayload(row), 201);
  } catch (error) {
    next(error);
  }
});

r.patch('/:id', async (req, res, next) => {
  try {
    const row = await db.get('SELECT * FROM solicitud_programada WHERE id=?', [req.params.id]);
    if (!row) return notFound(res);
    const coordinatorId = coordinadorScope(req);
    const currentPayload = row.payload_base ? JSON.parse(row.payload_base) : {};
    if (coordinatorId === '__none__') return fail(res, 'FORBIDDEN', 'Tu usuario no tiene coordinador asociado', null, 403);
    if (coordinatorId && currentPayload.coordinador_id !== coordinatorId) return notFound(res);
    const { nombre, dia_emision, frecuencia, mes_inicio, activa, payload_base } = req.body;
    const sets = ['updated_at=?']; const vals = [db.nowText()];
    if (nombre !== undefined)       { sets.push('nombre=?'); vals.push(nombre); }
    if (dia_emision !== undefined)  { sets.push('dia_emision=?'); vals.push(dia_emision); }
    if (frecuencia !== undefined)   { sets.push('frecuencia=?'); vals.push(frecuencia); }
    if (mes_inicio !== undefined)   { sets.push('mes_inicio=?'); vals.push(mes_inicio); }
    if (activa !== undefined)       { sets.push('activa=?'); vals.push(activa ? 1 : 0); }
    if (payload_base !== undefined) {
      const nextPayload = { ...payload_base };
      if (coordinatorId) nextPayload.coordinador_id = coordinatorId;
      sets.push('payload_base=?');
      vals.push(JSON.stringify(nextPayload));
    }
    vals.push(req.params.id);
    await db.run(`UPDATE solicitud_programada SET ${sets.join(',')} WHERE id=?`, vals);
    const updated = await db.get('SELECT * FROM solicitud_programada WHERE id=?', [req.params.id]);
    ok(res, parsePayload(updated));
  } catch (error) {
    next(error);
  }
});

r.post('/:id/generar', async (req, res, next) => {
  try {
    const prog = await db.get('SELECT * FROM solicitud_programada WHERE id=?', [req.params.id]);
    if (!prog) return notFound(res);
    const coordinatorId = coordinadorScope(req);
    if (coordinatorId === '__none__') return fail(res, 'FORBIDDEN', 'Tu usuario no tiene coordinador asociado', null, 403);
    const periodo = req.query.periodo || req.body.periodo;
    if (!periodo || !/^\d{4}-\d{2}$/.test(periodo)) return fail(res, 'VALIDATION_ERROR', 'periodo debe ser YYYY-MM');

    const existente = await db.get('SELECT id FROM solicitud_factura WHERE programada_id=? AND periodo=? AND is_delete = 0', [prog.id, periodo]);
    if (existente) return fail(res, 'VALIDATION_ERROR', `Ya existe solicitud para ${periodo} de esta plantilla`);

    const payload = prog.payload_base ? JSON.parse(prog.payload_base) : {};
    if (coordinatorId && payload.coordinador_id !== coordinatorId) return notFound(res);

    const created = await db.transaction(async tx => {
      const newId = uuidv4();
      const folio = await generarFolio(tx);
      const [y, m] = periodo.split('-');
      const fechaSol = `${y}-${m}-${String(prog.dia_emision || 1).padStart(2,'0')}`;

      await tx.run(`INSERT INTO solicitud_factura
        (id, folio, tipo, cliente_id, coordinador_id, empresa_emisora, periodo, fecha_solicitud,
         glosa, area, moneda_base, observaciones, estado, programada_id, version_plantilla)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`, [
        newId,
        folio,
        'mensual',
        prog.cliente_id,
        payload.coordinador_id || null,
        payload.empresa_emisora || 'MAS_CONSULTORES',
        periodo,
        fechaSol,
        payload.glosa || prog.nombre,
        payload.area || null,
        payload.moneda_base || 'CLP',
        payload.observaciones || null,
        'Borrador',
        prog.id,
        payload.version_plantilla || 'v1'
      ]);

      for (const [i, item] of (payload.items || []).entries()) {
        await tx.run(`INSERT INTO solicitud_item (id, solicitud_id, descripcion, codigo_ref, cantidad, uf_unitaria, clp_unitario, subtotal_clp, orden)
          VALUES (?,?,?,?,?,?,?,?,?)`, [
          uuidv4(),
          newId,
          item.descripcion || '',
          item.codigo_ref || null,
          item.cantidad || 1,
          item.uf_unitaria || null,
          item.clp_unitario || null,
          0,
          i
        ]);
      }

      for (const [i, c] of (payload.cps || []).entries()) {
        const cpRow = await tx.get('SELECT id FROM cp WHERE codigo=?', [c.cp_codigo || c.cp_id]);
        if (cpRow) {
          await tx.run('INSERT INTO solicitud_cp (id, solicitud_id, cp_id, monto_uf, monto_clp, orden) VALUES (?,?,?,?,?,?)', [
            uuidv4(),
            newId,
            cpRow.id,
            c.monto_uf || null,
            c.monto_clp || 0,
            i
          ]);
        }
      }

      for (const rec of (payload.receptores || [])) {
        const recId = rec.receptor_id || rec.id;
        if (recId) {
          await tx.run('INSERT INTO solicitud_receptor (solicitud_id, receptor_id) VALUES (?,?) ON CONFLICT DO NOTHING', [newId, recId]);
        }
      }

      await tx.run('INSERT INTO historial_estado (id, solicitud_id, estado_desde, estado_hacia, usuario, comentario) VALUES (?,?,?,?,?,?)', [
        uuidv4(),
        newId,
        null,
        'Borrador',
        'sistema',
        `Generada desde plantilla "${prog.nombre}" para ${periodo}`
      ]);

      return tx.get('SELECT * FROM solicitud_factura WHERE id=?', [newId]);
    });

    ok(res, created, 201);
  } catch (error) {
    next(error);
  }
});

module.exports = r;
