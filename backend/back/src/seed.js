require('./config/env');

const { withPostgresClient } = require('./postgres');
const seedData = require('../seed/seed.json');
const crypto = require('crypto');

function clean(value, fallback = null) {
  if (value === undefined || value === null || value === '' || value === 'TBD') return fallback;
  return value;
}

function upperName(value) {
  if (value === undefined || value === null) return value;
  const text = String(value).trim().replace(/\s+/g, ' ');
  return text ? text.toLocaleUpperCase('es-CL') : value;
}

function clientKey(value) {
  let s = String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');

  if (s === 'AFP HABITAT') s = 'HABITAT';
  if (s === 'BANCO ESTADO EXPRESS') s = 'BEX';
  if (s === 'TRANSELEC') s = 'TRANSELECT';
  return s;
}

function stableId(prefix, value) {
  const key = String(value || prefix)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '')
    .slice(0, 42) || prefix;
  const hash = crypto.createHash('sha1').update(String(value || '')).digest('hex').slice(0, 10);
  return `${prefix}_${key}_${hash}`.slice(0, 90);
}

function toNumber(value, fallback = null) {
  if (value === undefined || value === null || value === '') return fallback;
  if (typeof value === 'number') return Number.isFinite(value) ? value : fallback;
  const cleaned = String(value).replace(/\$/g, '').replace(/\s/g, '').replace(/\./g, '').replace(',', '.');
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : fallback;
}

async function seed(client) {
  const query = (sql, params = []) => client.query(sql, params);
  const seededClientIds = new Map();
  const seededCoordinatorIds = new Map();

  const reassignCoordinatorReferences = async (fromId, toId) => {
    if (!fromId || !toId || fromId === toId) return;
    await query('UPDATE cliente SET coordinador_id = $1 WHERE coordinador_id = $2', [toId, fromId]);
    await query('UPDATE solicitud_factura SET coordinador_id = $1 WHERE coordinador_id = $2', [toId, fromId]);

    const links = await query('SELECT id, cliente_id, cp_id FROM cliente_coordinador WHERE coordinador_id = $1', [fromId]);
    for (const link of links.rows) {
      const exists = link.cp_id
        ? await query('SELECT id FROM cliente_coordinador WHERE cliente_id = $1 AND coordinador_id = $2 AND cp_id = $3 LIMIT 1', [link.cliente_id, toId, link.cp_id])
        : await query('SELECT id FROM cliente_coordinador WHERE cliente_id = $1 AND coordinador_id = $2 AND cp_id IS NULL LIMIT 1', [link.cliente_id, toId]);
      if (exists.rowCount) await query('DELETE FROM cliente_coordinador WHERE id = $1', [link.id]);
      else await query('UPDATE cliente_coordinador SET coordinador_id = $1 WHERE id = $2', [toId, link.id]);
    }

    await query('DELETE FROM coordinador WHERE id = $1', [fromId]);
  };

  const canonicalCoordinatorId = async coordinador => {
    const rows = coordinador.slack_user_id
      ? await query(`
          SELECT id
          FROM coordinador
          WHERE nombre = $1 OR slack_user_id = $2
          ORDER BY CASE WHEN id LIKE 'coor_%' THEN 0 ELSE 1 END, created_at, id
        `, [coordinador.nombre, coordinador.slack_user_id])
      : await query(`
          SELECT id
          FROM coordinador
          WHERE nombre = $1
          ORDER BY CASE WHEN id LIKE 'coor_%' THEN 0 ELSE 1 END, created_at, id
        `, [coordinador.nombre]);

    const canonicalId = rows.rows[0]?.id || cryptoRandomId();
    for (const row of rows.rows.slice(1)) await reassignCoordinatorReferences(row.id, canonicalId);
    return canonicalId;
  };

  const canonicalReceptorId = async (clienteId, email) => {
    const rows = await query(`
      SELECT id
      FROM receptor
      WHERE cliente_id = $1 AND lower(email) = lower($2)
      ORDER BY CASE WHEN id LIKE 'recep_%' THEN 0 ELSE 1 END, created_at, id
    `, [clienteId, email]);
    const canonicalId = rows.rows[0]?.id || cryptoRandomId();

    for (const row of rows.rows.slice(1)) {
      await query(`
        INSERT INTO solicitud_receptor (solicitud_id, receptor_id)
        SELECT solicitud_id, $1 FROM solicitud_receptor WHERE receptor_id = $2
        ON CONFLICT DO NOTHING
      `, [canonicalId, row.id]);
      await query('DELETE FROM solicitud_receptor WHERE receptor_id = $1', [row.id]);
      await query('DELETE FROM receptor WHERE id = $1', [row.id]);
    }

    return canonicalId;
  };

  const reassignClientReferences = async (fromId, toId) => {
    if (!fromId || !toId || fromId === toId) return;
    await query('UPDATE receptor SET cliente_id = $1 WHERE cliente_id = $2', [toId, fromId]);
    await query('UPDATE cp SET cliente_id = $1 WHERE cliente_id = $2', [toId, fromId]);
    await query('UPDATE proyeccion_facturacion SET cliente_id = $1 WHERE cliente_id = $2', [toId, fromId]);
    await query('UPDATE solicitud_factura SET cliente_id = $1 WHERE cliente_id = $2', [toId, fromId]);
    await query('UPDATE solicitud_programada SET cliente_id = $1 WHERE cliente_id = $2', [toId, fromId]);

    const products = await query('SELECT id, producto_id FROM cliente_producto WHERE cliente_id = $1', [fromId]);
    for (const link of products.rows) {
      const exists = await query('SELECT id FROM cliente_producto WHERE cliente_id = $1 AND producto_id = $2 LIMIT 1', [toId, link.producto_id]);
      if (exists.rowCount) await query('DELETE FROM cliente_producto WHERE id = $1', [link.id]);
      else await query('UPDATE cliente_producto SET cliente_id = $1 WHERE id = $2', [toId, link.id]);
    }

    const coordinators = await query('SELECT id, coordinador_id, cp_id FROM cliente_coordinador WHERE cliente_id = $1', [fromId]);
    for (const link of coordinators.rows) {
      const exists = link.cp_id
        ? await query('SELECT id FROM cliente_coordinador WHERE cliente_id = $1 AND coordinador_id = $2 AND cp_id = $3 LIMIT 1', [toId, link.coordinador_id, link.cp_id])
        : await query('SELECT id FROM cliente_coordinador WHERE cliente_id = $1 AND coordinador_id = $2 AND cp_id IS NULL LIMIT 1', [toId, link.coordinador_id]);
      if (exists.rowCount) await query('DELETE FROM cliente_coordinador WHERE id = $1', [link.id]);
      else await query('UPDATE cliente_coordinador SET cliente_id = $1 WHERE id = $2', [toId, link.id]);
    }

    await query('DELETE FROM cliente WHERE id = $1', [fromId]);
  };

  const canonicalClientId = async nombreCorto => {
    const rows = await query(`
      SELECT id, nombre_corto
      FROM cliente
      ORDER BY CASE WHEN id LIKE 'cli_%' THEN 0 ELSE 1 END, created_at, id
    `);
    const matches = rows.rows.filter(row => clientKey(row.nombre_corto) === clientKey(nombreCorto));
    const canonicalId = matches[0]?.id || cryptoRandomId();
    for (const row of matches.slice(1)) await reassignClientReferences(row.id, canonicalId);
    return canonicalId;
  };

  const duplicateReceptors = await query(`
    SELECT cliente_id, lower(email) AS email
    FROM receptor
    WHERE email IS NOT NULL
    GROUP BY cliente_id, lower(email)
    HAVING COUNT(*) > 1
  `);
  for (const row of duplicateReceptors.rows) await canonicalReceptorId(row.cliente_id, row.email);

  for (const e of seedData.empresas_emisoras || []) {
    if (!e.codigo || !e.razon_social) continue;
    await query(`
      INSERT INTO empresa_emisora (codigo, razon_social, rut, giro, direccion, telefono, afecto_iva, iva_pct)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT(codigo) DO UPDATE SET
        razon_social = EXCLUDED.razon_social,
        rut = COALESCE(EXCLUDED.rut, empresa_emisora.rut),
        giro = COALESCE(EXCLUDED.giro, empresa_emisora.giro),
        direccion = COALESCE(EXCLUDED.direccion, empresa_emisora.direccion),
        telefono = COALESCE(EXCLUDED.telefono, empresa_emisora.telefono),
        afecto_iva = EXCLUDED.afecto_iva,
        iva_pct = EXCLUDED.iva_pct
    `, [
      e.codigo,
      upperName(e.razon_social),
      clean(e.rut),
      clean(e.giro),
      clean(e.direccion),
      clean(e.telefono),
      e.afecto_iva ? 1 : 0,
      e.afecto_iva ? 0.19 : 0
    ]);
    console.log(' empresa:', e.codigo);
  }

  const coordMap = {};
  for (const c of seedData.coordinadores || []) {
    const id = await canonicalCoordinatorId(c);
    if (c.slack_user_id) coordMap[c.slack_user_id] = id;
    seededCoordinatorIds.set(clientKey(c.nombre), id);
    await query(`
      INSERT INTO coordinador (id, nombre, email, slack_user_id, activo)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT(id) DO UPDATE SET
        nombre = EXCLUDED.nombre,
        email = COALESCE(EXCLUDED.email, coordinador.email),
        slack_user_id = COALESCE(EXCLUDED.slack_user_id, coordinador.slack_user_id),
        activo = EXCLUDED.activo
    `, [id, upperName(c.nombre), clean(c.email), clean(c.slack_user_id), c.activo === false ? 0 : 1]);
    console.log(' coordinador:', c.nombre);
  }

  for (const c of seedData.clientes || []) {
    const id = await canonicalClientId(c.nombre_corto);
    seededClientIds.set(clientKey(c.nombre_corto), id);
    const coordId = c.coordinador_slack ? coordMap[c.coordinador_slack] || null : null;
    await query(`
      INSERT INTO cliente (
        id, nombre_corto, razon_social, rut, giro, direccion, coordinador_id,
        frecuencia, dia_facturacion, mes_inicio, requiere_hes, estado, notas
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      ON CONFLICT(id) DO UPDATE SET
        nombre_corto = CASE
          WHEN cliente.razon_social IS NULL OR cliente.razon_social = '' THEN EXCLUDED.nombre_corto
          ELSE cliente.nombre_corto
        END,
        razon_social = COALESCE(EXCLUDED.razon_social, cliente.razon_social),
        rut = COALESCE(EXCLUDED.rut, cliente.rut),
        giro = COALESCE(EXCLUDED.giro, cliente.giro),
        direccion = COALESCE(EXCLUDED.direccion, cliente.direccion),
        coordinador_id = COALESCE(EXCLUDED.coordinador_id, cliente.coordinador_id),
        frecuencia = COALESCE(EXCLUDED.frecuencia, cliente.frecuencia),
        dia_facturacion = COALESCE(EXCLUDED.dia_facturacion, cliente.dia_facturacion),
        mes_inicio = COALESCE(EXCLUDED.mes_inicio, cliente.mes_inicio),
        requiere_hes = EXCLUDED.requiere_hes,
        estado = COALESCE(EXCLUDED.estado, cliente.estado),
        notas = COALESCE(EXCLUDED.notas, cliente.notas),
        updated_at = CURRENT_TIMESTAMP::text
    `, [
      id,
      upperName(c.nombre_corto),
      upperName(clean(c.razon_social)),
      clean(c.rut),
      clean(c.giro),
      clean(c.direccion),
      coordId,
      clean(c.frecuencia),
      toNumber(c.dia_facturacion),
      toNumber(c.mes_inicio),
      c.requiere_hes ? 1 : 0,
      clean(c.estado, 'Activo'),
      clean(c.notas)
    ]);
    console.log(' cliente:', c.nombre_corto);

    if (coordId) {
      await query(`
        INSERT INTO cliente_coordinador (id, cliente_id, coordinador_id, activo)
        VALUES ($1, $2, $3, 1)
        ON CONFLICT(id) DO UPDATE SET activo = 1
      `, [stableId('cc', `${id}:${coordId}:default`), id, coordId]);
    }

    for (const rec of c.receptores || []) {
      if (!rec.email) continue;
      await query(`
        INSERT INTO receptor (id, cliente_id, nombre, email, activo)
        VALUES ($1, $2, $3, $4, 1)
        ON CONFLICT(id) DO UPDATE SET
          nombre = EXCLUDED.nombre,
          email = EXCLUDED.email,
          activo = 1
      `, [await canonicalReceptorId(id, rec.email), id, upperName(rec.nombre || rec.email), rec.email]);
    }

    for (const cp of c.cps || []) {
      if (!cp.codigo) continue;
      await query(`
        INSERT INTO cp (id, codigo, nombre, area, cliente_id, activo)
        VALUES ($1, $2, $3, $4, $5, 1)
        ON CONFLICT(codigo) DO UPDATE SET
          nombre = COALESCE(EXCLUDED.nombre, cp.nombre),
          area = COALESCE(EXCLUDED.area, cp.area),
          cliente_id = COALESCE(EXCLUDED.cliente_id, cp.cliente_id),
          activo = 1
      `, [cryptoRandomId(), cp.codigo, upperName(clean(cp.nombre)), clean(cp.area), id]);
    }

    for (const dato of c.datos_facturacion || []) {
      if (!dato.razon_social) continue;
      const factId = stableId('cf', `${id}:${dato.rut || dato.razon_social}`);
      await query(`
        INSERT INTO cliente_facturacion (id, cliente_id, etiqueta, razon_social, rut, giro, direccion, activo)
        VALUES ($1, $2, $3, $4, $5, $6, $7, 1)
        ON CONFLICT(id) DO UPDATE SET
          etiqueta = COALESCE(EXCLUDED.etiqueta, cliente_facturacion.etiqueta),
          razon_social = EXCLUDED.razon_social,
          rut = COALESCE(EXCLUDED.rut, cliente_facturacion.rut),
          giro = COALESCE(EXCLUDED.giro, cliente_facturacion.giro),
          direccion = COALESCE(EXCLUDED.direccion, cliente_facturacion.direccion),
          activo = 1,
          updated_at = CURRENT_TIMESTAMP::text
      `, [
        factId,
        id,
        clean(dato.etiqueta),
        upperName(dato.razon_social),
        clean(dato.rut),
        clean(dato.giro),
        clean(dato.direccion)
      ]);
    }
  }

  for (const s of seedData.solicitudes || []) {
    if (!s.folio || !s.cliente || !s.periodo || !s.fecha_solicitud) continue;

    const clienteId = seededClientIds.get(clientKey(s.cliente)) || (await canonicalClientId(s.cliente));
    const coordId = s.coordinador_slack
      ? coordMap[s.coordinador_slack] || null
      : seededCoordinatorIds.get(clientKey(s.coordinador)) || null;
    const solicitudId = stableId('sol', s.folio);
    const montoNeto = Math.round(toNumber(s.monto_neto_clp, 0) || 0);
    const montoIva = Math.round(toNumber(s.monto_iva_clp, 0) || 0);
    const montoTotal = Math.round(toNumber(s.monto_total_clp, montoNeto + montoIva) || 0);
    let clienteFacturacionId = null;

    if (s.cliente_facturacion_rut) {
      const fact = await query(`
        SELECT id
        FROM cliente_facturacion
        WHERE cliente_id = $1
          AND rut = $2
          AND activo = 1
        ORDER BY created_at, id
        LIMIT 1
      `, [clienteId, s.cliente_facturacion_rut]);
      clienteFacturacionId = fact.rows[0]?.id || null;
    }

    await query(`
      INSERT INTO solicitud_factura (
        id, folio, tipo, cliente_id, coordinador_id, empresa_emisora, periodo,
        fecha_solicitud, fecha_facturacion, oc_numero, contrato_numero, hes_numero,
        glosa, area, moneda_base, uf_fecha, uf_valor, monto_neto_clp, monto_iva_clp,
        monto_total_clp, monto_neto_clp_manual, cliente_facturacion_id, observaciones, estado
      )
      VALUES (
        $1, $2, $3, $4, $5, $6, $7,
        $8, $9, $10, $11, $12,
        $13, $14, $15, $16, $17, $18, $19,
        $20, $21, $22, $23, $24
      )
      ON CONFLICT(folio) DO UPDATE SET
        tipo = EXCLUDED.tipo,
        cliente_id = EXCLUDED.cliente_id,
        coordinador_id = COALESCE(EXCLUDED.coordinador_id, solicitud_factura.coordinador_id),
        empresa_emisora = EXCLUDED.empresa_emisora,
        periodo = EXCLUDED.periodo,
        fecha_solicitud = EXCLUDED.fecha_solicitud,
        fecha_facturacion = COALESCE(EXCLUDED.fecha_facturacion, solicitud_factura.fecha_facturacion),
        oc_numero = COALESCE(EXCLUDED.oc_numero, solicitud_factura.oc_numero),
        contrato_numero = COALESCE(EXCLUDED.contrato_numero, solicitud_factura.contrato_numero),
        hes_numero = COALESCE(EXCLUDED.hes_numero, solicitud_factura.hes_numero),
        glosa = EXCLUDED.glosa,
        area = COALESCE(EXCLUDED.area, solicitud_factura.area),
        moneda_base = EXCLUDED.moneda_base,
        uf_fecha = COALESCE(EXCLUDED.uf_fecha, solicitud_factura.uf_fecha),
        uf_valor = COALESCE(EXCLUDED.uf_valor, solicitud_factura.uf_valor),
        monto_neto_clp = EXCLUDED.monto_neto_clp,
        monto_iva_clp = EXCLUDED.monto_iva_clp,
        monto_total_clp = EXCLUDED.monto_total_clp,
        monto_neto_clp_manual = EXCLUDED.monto_neto_clp_manual,
        cliente_facturacion_id = COALESCE(EXCLUDED.cliente_facturacion_id, solicitud_factura.cliente_facturacion_id),
        observaciones = COALESCE(EXCLUDED.observaciones, solicitud_factura.observaciones),
        estado = EXCLUDED.estado,
        is_delete = 0,
        updated_at = CURRENT_TIMESTAMP::text
    `, [
      solicitudId,
      s.folio,
      clean(s.tipo, 'mensual'),
      clienteId,
      coordId,
      clean(s.empresa_emisora, 'MAS_CONSULTORES'),
      s.periodo,
      s.fecha_solicitud,
      clean(s.fecha_facturacion),
      clean(s.oc_numero),
      clean(s.contrato_numero),
      clean(s.hes_numero),
      clean(s.glosa, 'Solicitud de factura'),
      clean(s.area),
      clean(s.moneda_base, 'CLP'),
      clean(s.uf_fecha),
      toNumber(s.uf_valor),
      montoNeto,
      montoIva,
      montoTotal,
      montoNeto,
      clienteFacturacionId,
      clean(s.observaciones),
      clean(s.estado, 'FACTURA SOLICITADA')
    ]);

    await query('DELETE FROM solicitud_cp WHERE solicitud_id = $1', [solicitudId]);
    for (const [index, cp] of (s.cps || []).entries()) {
      const cpRow = await query(`
        SELECT id
        FROM cp
        WHERE cliente_id = $1
          AND codigo = $2
          AND activo = 1
        LIMIT 1
      `, [clienteId, clean(cp.codigo)]);
      if (!cpRow.rowCount) continue;

      const montoClp = Math.round(toNumber(cp.monto_clp, 0) || 0);
      await query(`
        INSERT INTO solicitud_cp (id, solicitud_id, cp_id, monto_uf, monto_clp, monto_clp_manual, monto_clp_es_manual, orden)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `, [
        stableId('scp', `${solicitudId}:${cp.codigo}`),
        solicitudId,
        cpRow.rows[0].id,
        toNumber(cp.monto_uf),
        montoClp,
        montoClp,
        1,
        index
      ]);
    }

    await query('DELETE FROM solicitud_receptor WHERE solicitud_id = $1', [solicitudId]);
    for (const rec of s.receptores || []) {
      if (!rec.email) continue;
      const recId = await canonicalReceptorId(clienteId, rec.email);
      await query(`
        INSERT INTO receptor (id, cliente_id, nombre, email, activo)
        VALUES ($1, $2, $3, $4, 1)
        ON CONFLICT(id) DO UPDATE SET
          cliente_id = EXCLUDED.cliente_id,
          nombre = EXCLUDED.nombre,
          email = EXCLUDED.email,
          activo = 1
      `, [recId, clienteId, upperName(rec.nombre || rec.email), rec.email]);
      await query(`
        INSERT INTO solicitud_receptor (solicitud_id, receptor_id)
        VALUES ($1, $2)
        ON CONFLICT DO NOTHING
      `, [solicitudId, recId]);
    }

    await query(`
      INSERT INTO historial_estado (id, solicitud_id, estado_desde, estado_hacia, usuario, comentario)
      VALUES ($1, $2, NULL, $3, $4, $5)
      ON CONFLICT(id) DO NOTHING
    `, [
      stableId('hist', `${solicitudId}:seed`),
      solicitudId,
      clean(s.estado, 'FACTURA SOLICITADA'),
      'seed',
      'Solicitud historica cargada desde seed PostgreSQL'
    ]);
    console.log(' solicitud:', s.folio);
  }
}

function cryptoRandomId() {
  return require('crypto').randomUUID();
}

async function main() {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL PostgreSQL no esta configurado.');

  console.log('Seeding PostgreSQL database...');
  await withPostgresClient(async client => {
    await client.query('BEGIN');
    try {
      await seed(client);
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    }
  });
  console.log('Seed PostgreSQL completado.');
}

main().catch(error => {
  console.error(`ERROR ${error.message || error}`);
  process.exitCode = 1;
});
