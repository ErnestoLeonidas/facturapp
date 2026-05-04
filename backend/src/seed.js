require('dotenv').config();
const db = require('./db');
const { v4: uuidv4 } = require('uuid');
const seedData = require('../seed/seed.json');

console.log('Seeding database...');

// Empresas
const insEmpresa = db.prepare(`INSERT OR IGNORE INTO empresa_emisora (codigo, razon_social, rut, giro, direccion, telefono, afecto_iva, iva_pct) VALUES (?,?,?,?,?,?,?,?)`);
(seedData.empresas_emisoras || []).forEach(e => {
  if (!e.rut || e.rut === 'TBD') return;
  insEmpresa.run(e.codigo, e.razon_social, e.rut, e.giro||null, e.direccion||null, e.telefono||null, e.afecto_iva ? 1 : 0, 0.19);
  console.log(' empresa:', e.codigo);
});

// Coordinadores
const insCoor = db.prepare(`INSERT OR IGNORE INTO coordinador (id, nombre, email, slack_user_id) VALUES (?,?,?,?)`);
const findCoor = db.prepare(`SELECT id FROM coordinador WHERE slack_user_id = ? LIMIT 1`);
const coordMap = {};
(seedData.coordinadores || []).forEach(c => {
  const existing = c.slack_user_id ? findCoor.get(c.slack_user_id) : null;
  const id = existing ? existing.id : uuidv4();
  coordMap[c.slack_user_id] = id;
  if (!existing) {
    insCoor.run(id, c.nombre, c.email && c.email !== 'TBD' ? c.email : null, c.slack_user_id);
  }
  console.log(' coordinador:', c.nombre);
});

// Clientes
const insCli = db.prepare(`INSERT OR IGNORE INTO cliente (id, nombre_corto, razon_social, rut, giro, direccion, coordinador_id, frecuencia, requiere_hes, estado) VALUES (?,?,?,?,?,?,?,?,?,?)`);
const insRec = db.prepare(`INSERT OR IGNORE INTO receptor (id, cliente_id, nombre, email) VALUES (?,?,?,?)`);
const insCP  = db.prepare(`INSERT OR IGNORE INTO cp (id, codigo, nombre, area, cliente_id) VALUES (?,?,?,?,?)`);
const findCli = db.prepare(`SELECT id FROM cliente WHERE nombre_corto = ? LIMIT 1`);
const findRec = db.prepare(`SELECT id FROM receptor WHERE cliente_id = ? AND email = ? LIMIT 1`);

const clienteMap = {};
(seedData.clientes || []).forEach(c => {
  const existing = findCli.get(c.nombre_corto);
  const id = existing ? existing.id : uuidv4();
  clienteMap[c.nombre_corto] = id;
  const coordId = c.coordinador_slack ? coordMap[c.coordinador_slack] || null : null;
  insCli.run(id, c.nombre_corto,
    c.razon_social && c.razon_social !== 'TBD' ? c.razon_social : null,
    c.rut && c.rut !== 'TBD' ? c.rut : null,
    c.giro && c.giro !== 'TBD' ? c.giro : null,
    c.direccion && c.direccion !== 'TBD' ? c.direccion : null,
    coordId,
    c.frecuencia && c.frecuencia !== 'TBD' ? c.frecuencia : 'Mensual',
    c.requiere_hes ? 1 : 0,
    c.estado && c.estado !== 'TBD' ? c.estado : 'Activo'
  );
  console.log(' cliente:', c.nombre_corto);

  (c.receptores || []).forEach(rec => {
    if (!findRec.get(id, rec.email)) {
      insRec.run(uuidv4(), id, rec.nombre, rec.email);
    }
  });

  (c.cps || []).forEach(cp => {
    insCP.run(uuidv4(), cp.codigo, cp.nombre||null, cp.area||null, id);
  });
});

console.log('Seed completado.');
