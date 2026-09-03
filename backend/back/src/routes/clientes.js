const r = require('express').Router();
const db = require('../db-async');
const { v4: uuidv4 } = require('uuid');
const { ok, fail, notFound } = require('../middleware/envelope');
const { upperName } = require('../db-normalize-names');

async function datosFacturacionCliente(cliente) {
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

async function coordinadoresCliente(clienteId) {
  return db.all(`
    SELECT
      cc.id,
      cc.cliente_id,
      cc.coordinador_id,
      cc.cp_id,
      cc.cp_nombre,
      co.nombre,
      co.email,
      cp.codigo AS cp_codigo,
      cp.nombre AS cp_nombre_catalogo
    FROM cliente_coordinador cc
    JOIN coordinador co ON co.id = cc.coordinador_id
    LEFT JOIN cp ON cp.id = cc.cp_id
    WHERE cc.cliente_id = ?
      AND cc.activo = 1
      AND co.activo = 1
    ORDER BY cc.cp_nombre IS NOT NULL, cc.cp_nombre, lower(trim(co.nombre))
  `, [clienteId]);
}

async function hydrate(row) {
  if (!row) return null;
  row.requiere_hes = !!row.requiere_hes;
  row.receptores = await db.all('SELECT * FROM receptor WHERE cliente_id = ? AND activo = 1 ORDER BY nombre', [row.id]);
  row.cps = await db.all('SELECT * FROM cp WHERE cliente_id = ? AND activo = 1 ORDER BY codigo', [row.id]);
  row.datos_facturacion = await datosFacturacionCliente(row);
  if (row.coordinador_id) {
    row.coordinador = await db.get('SELECT id, nombre, email, slack_user_id FROM coordinador WHERE id = ?', [row.coordinador_id]);
  }
  row.coordinadores = await coordinadoresCliente(row.id);
  return row;
}

r.get('/', async (req, res, next) => {
  try {
    const { q, estado, frecuencia } = req.query;
    let sql = 'SELECT c.*, co.nombre as coordinador_nombre FROM cliente c LEFT JOIN coordinador co ON co.id = c.coordinador_id WHERE 1=1';
    const vals = [];
    if (q) {
      const like = `%${String(q).trim()}%`;
      sql += ' AND (c.nombre_corto LIKE ? OR c.razon_social LIKE ? OR c.rut LIKE ? OR co.nombre LIKE ?)';
      vals.push(like, like, like, like);
    }
    if (estado)     { sql += ' AND c.estado = ?'; vals.push(estado); }
    if (frecuencia) { sql += ' AND c.frecuencia = ?'; vals.push(frecuencia); }
    sql += ' ORDER BY c.nombre_corto';
    ok(res, await db.all(sql, vals));
  } catch (error) {
    next(error);
  }
});

r.post('/', async (req, res, next) => {
  try {
    const { nombre_corto, razon_social, rut, giro, direccion, coordinador_id,
      frecuencia, dia_facturacion, mes_inicio, requiere_hes, estado, notas } = req.body;
    if (!nombre_corto) return fail(res, 'VALIDATION_ERROR', 'nombre_corto es requerido');
    const id = uuidv4();
    await db.run(`INSERT INTO cliente (id, nombre_corto, razon_social, rut, giro, direccion, coordinador_id,
      frecuencia, dia_facturacion, mes_inicio, requiere_hes, estado, notas) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`, [
      id,
      upperName(nombre_corto),
      upperName(razon_social) || null,
      rut || null,
      giro || null,
      direccion || null,
      coordinador_id || null,
      frecuencia || 'Mensual',
      dia_facturacion || null,
      mes_inicio || null,
      requiere_hes ? 1 : 0,
      estado || 'Activo',
      notas || null
    ]);
    ok(res, await hydrate(await db.get('SELECT * FROM cliente WHERE id = ?', [id])), 201);
  } catch (error) {
    next(error);
  }
});

r.get('/:id', async (req, res, next) => {
  try {
    const row = await db.get('SELECT * FROM cliente WHERE id = ?', [req.params.id]);
    if (!row) return notFound(res);
    ok(res, await hydrate(row));
  } catch (error) {
    next(error);
  }
});

r.patch('/:id', async (req, res, next) => {
  try {
    const row = await db.get('SELECT id FROM cliente WHERE id = ?', [req.params.id]);
    if (!row) return notFound(res);
    const fields = ['nombre_corto','razon_social','rut','giro','direccion','coordinador_id',
      'frecuencia','dia_facturacion','mes_inicio','requiere_hes','estado','notas'];
    const sets = []; const vals = [];
    fields.forEach(f => {
      if (req.body[f] !== undefined) {
        sets.push(`${f}=?`);
        vals.push(f === 'requiere_hes'
          ? (req.body[f] ? 1 : 0)
          : ['nombre_corto', 'razon_social'].includes(f) ? upperName(req.body[f]) : req.body[f]);
      }
    });
    if (sets.length) {
      sets.push('updated_at=?');
      vals.push(db.nowText());
      vals.push(req.params.id);
      await db.run(`UPDATE cliente SET ${sets.join(',')} WHERE id=?`, vals);
    }
    ok(res, await hydrate(await db.get('SELECT * FROM cliente WHERE id = ?', [req.params.id])));
  } catch (error) {
    next(error);
  }
});

r.delete('/:id', async (req, res, next) => {
  try {
    const row = await db.get('SELECT id FROM cliente WHERE id = ?', [req.params.id]);
    if (!row) return notFound(res);
    await db.run("UPDATE cliente SET estado='Inactivo', updated_at=? WHERE id=?", [db.nowText(), req.params.id]);
    ok(res, { id: req.params.id, estado: 'Inactivo' });
  } catch (error) {
    next(error);
  }
});

r.get('/:id/productos', async (req, res, next) => {
  try {
    ok(res, await db.all('SELECT p.* FROM producto p JOIN cliente_producto cp ON cp.producto_id=p.id WHERE cp.cliente_id=?', [req.params.id]));
  } catch (error) {
    next(error);
  }
});

r.get('/:id/coordinadores', async (req, res, next) => {
  try {
    const row = await db.get('SELECT id FROM cliente WHERE id = ?', [req.params.id]);
    if (!row) return notFound(res);
    ok(res, await coordinadoresCliente(req.params.id));
  } catch (error) {
    next(error);
  }
});

r.post('/:id/coordinadores', async (req, res, next) => {
  try {
    const row = await db.get('SELECT id FROM cliente WHERE id = ?', [req.params.id]);
    if (!row) return notFound(res);
    const { coordinador_id, cp_id } = req.body;
    const cpNombre = String(req.body.cp_nombre || '').trim() || null;
    if (!coordinador_id) return fail(res, 'VALIDATION_ERROR', 'responsable es requerido');
    const coord = await db.get('SELECT id FROM coordinador WHERE id = ? AND activo = 1', [coordinador_id]);
    if (!coord) return fail(res, 'VALIDATION_ERROR', 'Responsable no existe o esta inactivo');
    if (cpNombre) {
      const cp = await db.get('SELECT id FROM cp WHERE cliente_id = ? AND nombre = ? AND activo = 1 LIMIT 1', [req.params.id, cpNombre]);
      if (!cp) return fail(res, 'VALIDATION_ERROR', 'Nombre de CP no pertenece al cliente');
    } else if (cp_id) {
      const cp = await db.get('SELECT nombre FROM cp WHERE id = ? AND cliente_id = ? AND activo = 1', [cp_id, req.params.id]);
      if (!cp) return fail(res, 'VALIDATION_ERROR', 'CP no pertenece al cliente');
    }
    const existing = cpNombre
      ? await db.get('SELECT id FROM cliente_coordinador WHERE cliente_id = ? AND coordinador_id = ? AND cp_nombre = ?', [req.params.id, coordinador_id, cpNombre])
      : await db.get('SELECT id FROM cliente_coordinador WHERE cliente_id = ? AND coordinador_id = ? AND cp_nombre IS NULL', [req.params.id, coordinador_id]);
    if (existing) {
      await db.run('UPDATE cliente_coordinador SET activo = 1 WHERE id = ?', [existing.id]);
      return ok(res, await coordinadoresCliente(req.params.id), 201);
    }
    const id = uuidv4();
    await db.run('INSERT INTO cliente_coordinador (id, cliente_id, coordinador_id, cp_id, cp_nombre) VALUES (?, ?, ?, ?, ?)', [
      id,
      req.params.id,
      coordinador_id,
      null,
      cpNombre
    ]);
    ok(res, await coordinadoresCliente(req.params.id), 201);
  } catch (error) {
    next(error);
  }
});

r.delete('/:id/coordinadores/:asignacionId', async (req, res, next) => {
  try {
    const row = await db.get('SELECT id FROM cliente WHERE id = ?', [req.params.id]);
    if (!row) return notFound(res);
    await db.run('UPDATE cliente_coordinador SET activo = 0 WHERE id = ? AND cliente_id = ?', [req.params.asignacionId, req.params.id]);
    ok(res, { id: req.params.asignacionId, activo: 0 });
  } catch (error) {
    next(error);
  }
});

r.post('/:id/datos-facturacion', async (req, res, next) => {
  try {
    const cliente = await db.get('SELECT * FROM cliente WHERE id = ?', [req.params.id]);
    if (!cliente) return notFound(res);
    const { etiqueta, razon_social, rut, giro, direccion } = req.body;
    if (!razon_social) return fail(res, 'VALIDATION_ERROR', 'razon_social es requerido');

    const id = uuidv4();
    await db.run(`
      INSERT INTO cliente_facturacion
        (id, cliente_id, etiqueta, razon_social, rut, giro, direccion)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      id,
      req.params.id,
      etiqueta || null,
      upperName(razon_social),
      rut || null,
      giro || null,
      direccion || null
    ]);
    ok(res, await hydrate(await db.get('SELECT * FROM cliente WHERE id = ?', [req.params.id])), 201);
  } catch (error) {
    next(error);
  }
});

module.exports = r;
