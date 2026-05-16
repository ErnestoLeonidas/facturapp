require('dotenv').config();
const db = require('./db');
const { v4: uuidv4 } = require('uuid');
const seedData = require('../seed/seed.json');
const { clientKey } = require('./db-clean-clients');
const { upperName } = require('./db-normalize-names');

function clean(value, fallback = null) {
  if (value === undefined || value === null || value === '' || value === 'TBD') return fallback;
  return value;
}

console.log('Seeding database...');

const tx = db.transaction(() => {
  const reassignCoordinatorReferences = (fromId, toId) => {
    if (!fromId || !toId || fromId === toId) return;
    db.prepare('UPDATE cliente SET coordinador_id = ? WHERE coordinador_id = ?').run(toId, fromId);
    db.prepare('UPDATE solicitud_factura SET coordinador_id = ? WHERE coordinador_id = ?').run(toId, fromId);

    const links = db.prepare('SELECT id, cliente_id, cp_id FROM cliente_coordinador WHERE coordinador_id = ?').all(fromId);
    links.forEach(link => {
      const exists = link.cp_id
        ? db.prepare('SELECT id FROM cliente_coordinador WHERE cliente_id = ? AND coordinador_id = ? AND cp_id = ? LIMIT 1').get(link.cliente_id, toId, link.cp_id)
        : db.prepare('SELECT id FROM cliente_coordinador WHERE cliente_id = ? AND coordinador_id = ? AND cp_id IS NULL LIMIT 1').get(link.cliente_id, toId);
      if (exists) {
        db.prepare('DELETE FROM cliente_coordinador WHERE id = ?').run(link.id);
      } else {
        db.prepare('UPDATE cliente_coordinador SET coordinador_id = ? WHERE id = ?').run(toId, link.id);
      }
    });

    db.prepare('DELETE FROM coordinador WHERE id = ?').run(fromId);
  };

  const canonicalCoordinatorId = (coordinador) => {
    const rows = coordinador.slack_user_id
      ? db.prepare(`
          SELECT id
          FROM coordinador
          WHERE nombre = ? OR slack_user_id = ?
          ORDER BY CASE WHEN id LIKE 'coor_%' THEN 0 ELSE 1 END, created_at, id
        `).all(coordinador.nombre, coordinador.slack_user_id)
      : db.prepare(`
          SELECT id
          FROM coordinador
          WHERE nombre = ?
          ORDER BY CASE WHEN id LIKE 'coor_%' THEN 0 ELSE 1 END, created_at, id
        `).all(coordinador.nombre);
    const canonicalId = rows[0]?.id || uuidv4();
    rows.slice(1).forEach(row => reassignCoordinatorReferences(row.id, canonicalId));
    return canonicalId;
  };

  const canonicalReceptorId = (clienteId, email) => {
    const rows = db.prepare(`
      SELECT id
      FROM receptor
      WHERE cliente_id = ? AND lower(email) = lower(?)
      ORDER BY CASE WHEN id LIKE 'recep_%' THEN 0 ELSE 1 END, created_at, id
    `).all(clienteId, email);
    const canonicalId = rows[0]?.id || uuidv4();

    rows.slice(1).forEach(row => {
      db.prepare(`
        INSERT OR IGNORE INTO solicitud_receptor (solicitud_id, receptor_id)
        SELECT solicitud_id, ? FROM solicitud_receptor WHERE receptor_id = ?
      `).run(canonicalId, row.id);
      db.prepare('DELETE FROM solicitud_receptor WHERE receptor_id = ?').run(row.id);
      db.prepare('DELETE FROM receptor WHERE id = ?').run(row.id);
    });

    return canonicalId;
  };

  const reassignClientReferences = (fromId, toId) => {
    if (!fromId || !toId || fromId === toId) return;
    db.prepare('UPDATE receptor SET cliente_id = ? WHERE cliente_id = ?').run(toId, fromId);
    db.prepare('UPDATE cp SET cliente_id = ? WHERE cliente_id = ?').run(toId, fromId);
    db.prepare('UPDATE proyeccion_facturacion SET cliente_id = ? WHERE cliente_id = ?').run(toId, fromId);
    db.prepare('UPDATE solicitud_factura SET cliente_id = ? WHERE cliente_id = ?').run(toId, fromId);
    db.prepare('UPDATE solicitud_programada SET cliente_id = ? WHERE cliente_id = ?').run(toId, fromId);

    db.prepare('SELECT id, producto_id FROM cliente_producto WHERE cliente_id = ?').all(fromId).forEach(link => {
      const exists = db.prepare('SELECT id FROM cliente_producto WHERE cliente_id = ? AND producto_id = ? LIMIT 1').get(toId, link.producto_id);
      if (exists) {
        db.prepare('DELETE FROM cliente_producto WHERE id = ?').run(link.id);
      } else {
        db.prepare('UPDATE cliente_producto SET cliente_id = ? WHERE id = ?').run(toId, link.id);
      }
    });

    db.prepare('SELECT id, coordinador_id, cp_id FROM cliente_coordinador WHERE cliente_id = ?').all(fromId).forEach(link => {
      const exists = link.cp_id
        ? db.prepare('SELECT id FROM cliente_coordinador WHERE cliente_id = ? AND coordinador_id = ? AND cp_id = ? LIMIT 1').get(toId, link.coordinador_id, link.cp_id)
        : db.prepare('SELECT id FROM cliente_coordinador WHERE cliente_id = ? AND coordinador_id = ? AND cp_id IS NULL LIMIT 1').get(toId, link.coordinador_id);
      if (exists) {
        db.prepare('DELETE FROM cliente_coordinador WHERE id = ?').run(link.id);
      } else {
        db.prepare('UPDATE cliente_coordinador SET cliente_id = ? WHERE id = ?').run(toId, link.id);
      }
    });

    db.prepare('DELETE FROM cliente WHERE id = ?').run(fromId);
  };

  const canonicalClientId = (nombreCorto) => {
    const rows = db.prepare(`
      SELECT id, nombre_corto
      FROM cliente
      ORDER BY CASE WHEN id LIKE 'cli_%' THEN 0 ELSE 1 END, created_at, id
    `).all().filter(row => clientKey(row.nombre_corto) === clientKey(nombreCorto));
    const canonicalId = rows[0]?.id || uuidv4();
    rows.slice(1).forEach(row => reassignClientReferences(row.id, canonicalId));
    return canonicalId;
  };

  const consolidateDuplicateReceptors = () => {
    db.prepare(`
      SELECT cliente_id, lower(email) AS email
      FROM receptor
      WHERE email IS NOT NULL
      GROUP BY cliente_id, lower(email)
      HAVING COUNT(*) > 1
    `).all().forEach(row => canonicalReceptorId(row.cliente_id, row.email));
  };

  consolidateDuplicateReceptors();

  const upsertEmpresa = db.prepare(`
    INSERT INTO empresa_emisora (codigo, razon_social, rut, giro, direccion, telefono, afecto_iva, iva_pct)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(codigo) DO UPDATE SET
      razon_social = excluded.razon_social,
      rut = COALESCE(excluded.rut, empresa_emisora.rut),
      giro = COALESCE(excluded.giro, empresa_emisora.giro),
      direccion = COALESCE(excluded.direccion, empresa_emisora.direccion),
      telefono = COALESCE(excluded.telefono, empresa_emisora.telefono),
      afecto_iva = excluded.afecto_iva,
      iva_pct = excluded.iva_pct
  `);
  (seedData.empresas_emisoras || []).forEach(e => {
    if (!e.codigo || !e.razon_social) return;
    upsertEmpresa.run(
      e.codigo,
      upperName(e.razon_social),
      clean(e.rut),
      clean(e.giro),
      clean(e.direccion),
      clean(e.telefono),
      e.afecto_iva ? 1 : 0,
      e.afecto_iva ? 0.19 : 0
    );
    console.log(' empresa:', e.codigo);
  });

  const upsertCoor = db.prepare(`
    INSERT INTO coordinador (id, nombre, email, slack_user_id, activo)
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      nombre = excluded.nombre,
      email = COALESCE(excluded.email, coordinador.email),
      slack_user_id = COALESCE(excluded.slack_user_id, coordinador.slack_user_id),
      activo = excluded.activo
  `);
  const coordMap = {};

  (seedData.coordinadores || []).forEach(c => {
    const id = canonicalCoordinatorId(c);
    if (c.slack_user_id) coordMap[c.slack_user_id] = id;
    upsertCoor.run(id, upperName(c.nombre), clean(c.email), clean(c.slack_user_id), c.activo === false ? 0 : 1);
    console.log(' coordinador:', c.nombre);
  });

  const upsertCli = db.prepare(`
    INSERT INTO cliente (id, nombre_corto, razon_social, rut, giro, direccion, coordinador_id, frecuencia, requiere_hes, estado)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      nombre_corto = CASE
        WHEN cliente.razon_social IS NULL OR cliente.razon_social = '' THEN excluded.nombre_corto
        ELSE cliente.nombre_corto
      END,
      razon_social = COALESCE(excluded.razon_social, cliente.razon_social),
      rut = COALESCE(excluded.rut, cliente.rut),
      giro = COALESCE(excluded.giro, cliente.giro),
      direccion = COALESCE(excluded.direccion, cliente.direccion),
      coordinador_id = COALESCE(excluded.coordinador_id, cliente.coordinador_id),
      frecuencia = excluded.frecuencia,
      requiere_hes = excluded.requiere_hes,
      estado = excluded.estado,
      updated_at = datetime('now')
  `);
  const upsertRec = db.prepare(`
    INSERT INTO receptor (id, cliente_id, nombre, email, activo)
    VALUES (?, ?, ?, ?, 1)
    ON CONFLICT(id) DO UPDATE SET
      nombre = excluded.nombre,
      email = excluded.email,
      activo = 1
  `);
  const upsertCP = db.prepare(`
    INSERT INTO cp (id, codigo, nombre, area, cliente_id, activo)
    VALUES (?, ?, ?, ?, ?, 1)
    ON CONFLICT(codigo) DO UPDATE SET
      nombre = COALESCE(excluded.nombre, cp.nombre),
      area = COALESCE(excluded.area, cp.area),
      cliente_id = COALESCE(excluded.cliente_id, cp.cliente_id),
      activo = 1
  `);

  (seedData.clientes || []).forEach(c => {
    const id = canonicalClientId(c.nombre_corto);
    const coordId = c.coordinador_slack ? coordMap[c.coordinador_slack] || null : null;
    upsertCli.run(
      id,
      upperName(c.nombre_corto),
      upperName(clean(c.razon_social)),
      clean(c.rut),
      clean(c.giro),
      clean(c.direccion),
      coordId,
      clean(c.frecuencia, 'Mensual'),
      c.requiere_hes ? 1 : 0,
      clean(c.estado, 'Activo')
    );
    console.log(' cliente:', c.nombre_corto);

    (c.receptores || []).forEach(rec => {
      if (!rec.email) return;
      upsertRec.run(canonicalReceptorId(id, rec.email), id, upperName(rec.nombre || rec.email), rec.email);
    });

    (c.cps || []).forEach(cp => {
      if (!cp.codigo) return;
      upsertCP.run(uuidv4(), cp.codigo, upperName(clean(cp.nombre)), clean(cp.area), id);
    });
  });
});

tx();
console.log('Seed completado.');
