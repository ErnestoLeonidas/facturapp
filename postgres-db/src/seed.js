const crypto = require('crypto');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const seedData = require('../seed/seed.json');
const { withPostgresClient } = require('./postgres');

function clean(value, fallback = null) {
  if (value === undefined || value === null || value === '' || value === 'TBD') return fallback;
  return String(value).trim();
}

function slug(value, fallback = 'item') {
  const result = clean(value, fallback)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '')
    .slice(0, 50);
  return result || fallback;
}

function stableId(prefix, value) {
  const hash = crypto.createHash('sha1').update(String(value || '')).digest('hex').slice(0, 10);
  return `${prefix}_${slug(value, hash)}_${hash}`.slice(0, 90);
}

function activeFlag(value) {
  return value === false ? 0 : 1;
}

function toNumber(value, fallback = null) {
  if (value === undefined || value === null || value === '') return fallback;
  if (typeof value === 'number') return Number.isFinite(value) ? value : fallback;
  const cleaned = String(value).replace(/\$/g, '').replace(/\s/g, '').replace(/\./g, '').replace(',', '.');
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : fallback;
}

async function upsertEmpresas(client) {
  for (const empresa of seedData.empresas_emisoras || []) {
    if (!empresa.codigo || !empresa.razon_social) continue;
    await client.query(`
      INSERT INTO empresa_emisora (codigo, razon_social, rut, giro, direccion, telefono, afecto_iva, iva_pct)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (codigo) DO UPDATE SET
        razon_social = EXCLUDED.razon_social,
        rut = COALESCE(EXCLUDED.rut, empresa_emisora.rut),
        giro = COALESCE(EXCLUDED.giro, empresa_emisora.giro),
        direccion = COALESCE(EXCLUDED.direccion, empresa_emisora.direccion),
        telefono = COALESCE(EXCLUDED.telefono, empresa_emisora.telefono),
        afecto_iva = EXCLUDED.afecto_iva,
        iva_pct = EXCLUDED.iva_pct
    `, [
      empresa.codigo,
      clean(empresa.razon_social),
      clean(empresa.rut),
      clean(empresa.giro),
      clean(empresa.direccion),
      clean(empresa.telefono),
      empresa.afecto_iva ? 1 : 0,
      empresa.afecto_iva ? 0.19 : 0
    ]);
  }
}

async function upsertCoordinadores(client) {
  const coordMap = new Map();

  for (const coordinador of seedData.coordinadores || []) {
    if (!coordinador.nombre) continue;
    const id = stableId('coor', coordinador.slack_user_id || coordinador.nombre);
    if (coordinador.slack_user_id) coordMap.set(coordinador.slack_user_id, id);
    coordMap.set(coordinador.nombre, id);

    await client.query(`
      INSERT INTO coordinador (id, nombre, email, slack_user_id, activo)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (id) DO UPDATE SET
        nombre = EXCLUDED.nombre,
        email = COALESCE(EXCLUDED.email, coordinador.email),
        slack_user_id = COALESCE(EXCLUDED.slack_user_id, coordinador.slack_user_id),
        activo = EXCLUDED.activo
    `, [
      id,
      clean(coordinador.nombre),
      clean(coordinador.email),
      clean(coordinador.slack_user_id),
      activeFlag(coordinador.activo)
    ]);
  }

  return coordMap;
}

async function upsertClientes(client, coordMap) {
  const clientMap = new Map();

  for (const cliente of seedData.clientes || []) {
    if (!cliente.nombre_corto) continue;

    const clienteId = stableId('cli', cliente.nombre_corto);
    clientMap.set(slug(cliente.nombre_corto), clienteId);
    const coordinadorId = cliente.coordinador_slack ? coordMap.get(cliente.coordinador_slack) || null : null;

    await client.query(`
      INSERT INTO cliente (
        id, nombre_corto, razon_social, rut, giro, direccion, coordinador_id,
        frecuencia, dia_facturacion, mes_inicio, requiere_hes, estado, notas
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      ON CONFLICT (id) DO UPDATE SET
        nombre_corto = EXCLUDED.nombre_corto,
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
      clienteId,
      clean(cliente.nombre_corto),
      clean(cliente.razon_social),
      clean(cliente.rut),
      clean(cliente.giro),
      clean(cliente.direccion),
      coordinadorId,
      clean(cliente.frecuencia),
      toNumber(cliente.dia_facturacion),
      toNumber(cliente.mes_inicio),
      cliente.requiere_hes ? 1 : 0,
      clean(cliente.estado, 'Activo'),
      clean(cliente.notas)
    ]);

    if (coordinadorId) {
      await client.query(`
        INSERT INTO cliente_coordinador (id, cliente_id, coordinador_id, activo)
        VALUES ($1, $2, $3, 1)
        ON CONFLICT (id) DO UPDATE SET activo = 1
      `, [stableId('cc', `${clienteId}:${coordinadorId}`), clienteId, coordinadorId]);
    }

    for (const receptor of cliente.receptores || []) {
      if (!receptor.email) continue;
      await client.query(`
        INSERT INTO receptor (id, cliente_id, nombre, email, activo)
        VALUES ($1, $2, $3, $4, 1)
        ON CONFLICT (id) DO UPDATE SET
          cliente_id = EXCLUDED.cliente_id,
          nombre = EXCLUDED.nombre,
          email = EXCLUDED.email,
          activo = 1
      `, [
        stableId('recep', `${clienteId}:${receptor.email}`),
        clienteId,
        clean(receptor.nombre, receptor.email),
        clean(receptor.email)
      ]);
    }

    for (const cp of cliente.cps || []) {
      if (!cp.codigo) continue;
      await client.query(`
        INSERT INTO cp (id, codigo, nombre, area, cliente_id, activo)
        VALUES ($1, $2, $3, $4, $5, 1)
        ON CONFLICT (codigo) DO UPDATE SET
          nombre = COALESCE(EXCLUDED.nombre, cp.nombre),
          area = COALESCE(EXCLUDED.area, cp.area),
          cliente_id = COALESCE(EXCLUDED.cliente_id, cp.cliente_id),
          activo = 1
      `, [
        stableId('cp', cp.codigo),
        clean(cp.codigo),
        clean(cp.nombre),
        clean(cp.area),
        clienteId
      ]);
    }

    for (const dato of cliente.datos_facturacion || []) {
      if (!dato.razon_social) continue;
      await client.query(`
        INSERT INTO cliente_facturacion (id, cliente_id, etiqueta, razon_social, rut, giro, direccion, activo)
        VALUES ($1, $2, $3, $4, $5, $6, $7, 1)
        ON CONFLICT (id) DO UPDATE SET
          etiqueta = COALESCE(EXCLUDED.etiqueta, cliente_facturacion.etiqueta),
          razon_social = EXCLUDED.razon_social,
          rut = COALESCE(EXCLUDED.rut, cliente_facturacion.rut),
          giro = COALESCE(EXCLUDED.giro, cliente_facturacion.giro),
          direccion = COALESCE(EXCLUDED.direccion, cliente_facturacion.direccion),
          activo = 1,
          updated_at = CURRENT_TIMESTAMP::text
      `, [
        stableId('cf', `${clienteId}:${dato.rut || dato.razon_social}`),
        clienteId,
        clean(dato.etiqueta),
        clean(dato.razon_social),
        clean(dato.rut),
        clean(dato.giro),
        clean(dato.direccion)
      ]);
    }
  }

  return clientMap;
}

async function upsertSolicitudes(client, coordMap, clientMap) {
  const coordNameMap = new Map();
  for (const coordinador of seedData.coordinadores || []) {
    if (!coordinador.nombre) continue;
    const id = coordMap.get(coordinador.slack_user_id) || coordMap.get(coordinador.nombre);
    if (id) coordNameMap.set(slug(coordinador.nombre), id);
  }

  for (const solicitud of seedData.solicitudes || []) {
    if (!solicitud.folio || !solicitud.cliente || !solicitud.periodo || !solicitud.fecha_solicitud) continue;
    const clienteId = clientMap.get(slug(solicitud.cliente)) || stableId('cli', solicitud.cliente);
    const coordinadorId = solicitud.coordinador_slack
      ? coordMap.get(solicitud.coordinador_slack) || null
      : coordNameMap.get(slug(solicitud.coordinador)) || null;
    const solicitudId = stableId('sol', solicitud.folio);
    const montoNeto = Math.round(toNumber(solicitud.monto_neto_clp, 0) || 0);
    const montoIva = Math.round(toNumber(solicitud.monto_iva_clp, 0) || 0);
    const montoTotal = Math.round(toNumber(solicitud.monto_total_clp, montoNeto + montoIva) || 0);
    let clienteFacturacionId = null;

    if (solicitud.cliente_facturacion_rut) {
      const fact = await client.query(`
        SELECT id
        FROM cliente_facturacion
        WHERE cliente_id = $1
          AND rut = $2
          AND activo = 1
        ORDER BY created_at, id
        LIMIT 1
      `, [clienteId, solicitud.cliente_facturacion_rut]);
      clienteFacturacionId = fact.rows[0]?.id || null;
    }

    await client.query(`
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
      ON CONFLICT (folio) DO UPDATE SET
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
      solicitud.folio,
      clean(solicitud.tipo, 'mensual'),
      clienteId,
      coordinadorId,
      clean(solicitud.empresa_emisora, 'MAS_CONSULTORES'),
      solicitud.periodo,
      solicitud.fecha_solicitud,
      clean(solicitud.fecha_facturacion),
      clean(solicitud.oc_numero),
      clean(solicitud.contrato_numero),
      clean(solicitud.hes_numero),
      clean(solicitud.glosa, 'Solicitud de factura'),
      clean(solicitud.area),
      clean(solicitud.moneda_base, 'CLP'),
      clean(solicitud.uf_fecha),
      toNumber(solicitud.uf_valor),
      montoNeto,
      montoIva,
      montoTotal,
      montoNeto,
      clienteFacturacionId,
      clean(solicitud.observaciones),
      clean(solicitud.estado, 'FACTURA SOLICITADA')
    ]);

    await client.query('DELETE FROM solicitud_cp WHERE solicitud_id = $1', [solicitudId]);
    for (const [index, cp] of (solicitud.cps || []).entries()) {
      const cpRow = await client.query(`
        SELECT id
        FROM cp
        WHERE cliente_id = $1
          AND codigo = $2
          AND activo = 1
        LIMIT 1
      `, [clienteId, clean(cp.codigo)]);
      if (!cpRow.rowCount) continue;
      const montoClp = Math.round(toNumber(cp.monto_clp, 0) || 0);
      await client.query(`
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

    await client.query('DELETE FROM solicitud_receptor WHERE solicitud_id = $1', [solicitudId]);
    for (const receptor of solicitud.receptores || []) {
      if (!receptor.email) continue;
      const receptorId = stableId('recep', `${clienteId}:${receptor.email}`);
      await client.query(`
        INSERT INTO receptor (id, cliente_id, nombre, email, activo)
        VALUES ($1, $2, $3, $4, 1)
        ON CONFLICT (id) DO UPDATE SET
          cliente_id = EXCLUDED.cliente_id,
          nombre = EXCLUDED.nombre,
          email = EXCLUDED.email,
          activo = 1
      `, [receptorId, clienteId, clean(receptor.nombre, receptor.email), clean(receptor.email)]);
      await client.query(`
        INSERT INTO solicitud_receptor (solicitud_id, receptor_id)
        VALUES ($1, $2)
        ON CONFLICT DO NOTHING
      `, [solicitudId, receptorId]);
    }

    await client.query(`
      INSERT INTO historial_estado (id, solicitud_id, estado_desde, estado_hacia, usuario, comentario)
      VALUES ($1, $2, NULL, $3, $4, $5)
      ON CONFLICT (id) DO NOTHING
    `, [
      stableId('hist', `${solicitudId}:seed`),
      solicitudId,
      clean(solicitud.estado, 'FACTURA SOLICITADA'),
      'seed',
      'Solicitud historica cargada desde seed PostgreSQL'
    ]);
  }
}

async function printSummary(client) {
  const tables = ['empresa_emisora', 'coordinador', 'cliente', 'receptor', 'cp'];
  for (const table of tables) {
    const result = await client.query(`SELECT COUNT(*) AS total FROM ${table}`);
    console.log(`${table}: ${result.rows[0].total}`);
  }
}

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL no esta configurado. Copia .env.example a .env y ajusta la clave.');
  }

  await withPostgresClient(async client => {
    await client.query('BEGIN');
    try {
      await upsertEmpresas(client);
      const coordMap = await upsertCoordinadores(client);
      const clientMap = await upsertClientes(client, coordMap);
      await upsertSolicitudes(client, coordMap, clientMap);
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    }

    console.log('Seed PostgreSQL completado.');
    await printSummary(client);
  });
}

main().catch(error => {
  console.error(error.message || error);
  process.exitCode = 1;
});
