module.exports = function migrate(db) {
  db.exec(`
CREATE TABLE IF NOT EXISTS catalogo_estado_solicitud (
  codigo TEXT PRIMARY KEY,
  nombre TEXT NOT NULL,
  grupo TEXT,
  orden INTEGER DEFAULT 0,
  activo INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS catalogo_tipo_impuesto (
  codigo TEXT PRIMARY KEY,
  nombre TEXT NOT NULL,
  afecto_iva INTEGER NOT NULL DEFAULT 0,
  activo INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS catalogo_tipo_cp (
  codigo TEXT PRIMARY KEY,
  nombre TEXT NOT NULL UNIQUE,
  activo INTEGER NOT NULL DEFAULT 1
);
`);

  const estados = [
    ['PENDIENTE OC / HES', 'Pendiente OC / HES', 'proyeccion', 10],
    ['FACTURA SOLICITADA', 'Factura solicitada', 'proyeccion', 20],
    ['Borrador', 'Borrador', 'solicitud', 40],
    ['PendienteDatos', 'Pendiente de datos', 'solicitud', 50],
    ['EnRevision', 'En revisión', 'solicitud', 60],
    ['Aprobada', 'Aprobada', 'solicitud', 70],
    ['Rechazada', 'Rechazada', 'solicitud', 80],
    ['Emitida', 'Emitida', 'solicitud', 90],
    ['Facturada', 'Facturada', 'solicitud', 100],
    ['Anulada', 'Anulada', 'solicitud', 110],
    ['Cerrada', 'Cerrada', 'solicitud', 120]
  ];
  const upsertEstado = db.prepare(`
    INSERT INTO catalogo_estado_solicitud (codigo, nombre, grupo, orden, activo)
    VALUES (?, ?, ?, ?, 1)
    ON CONFLICT(codigo) DO UPDATE SET
      nombre = excluded.nombre,
      grupo = excluded.grupo,
      orden = excluded.orden,
      activo = 1
  `);
  estados.forEach(row => upsertEstado.run(...row));

  const tiposImpuesto = [
    ['AFECTO_IVA', 'Afecto IVA', 1],
    ['EXENTO_IVA', 'Exento IVA', 0]
  ];
  const upsertTipoImpuesto = db.prepare(`
    INSERT INTO catalogo_tipo_impuesto (codigo, nombre, afecto_iva, activo)
    VALUES (?, ?, ?, 1)
    ON CONFLICT(codigo) DO UPDATE SET
      nombre = excluded.nombre,
      afecto_iva = excluded.afecto_iva,
      activo = 1
  `);
  tiposImpuesto.forEach(row => upsertTipoImpuesto.run(...row));

  const tiposCP = [
    ['ADMIN_OPERACION', 'Administración y Operación'],
    ['CONSTRUCCION', 'Construcción'],
    ['HORAS_DESARROLLO', 'Horas de Desarrollo']
  ];
  const upsertTipoCP = db.prepare(`
    INSERT INTO catalogo_tipo_cp (codigo, nombre, activo)
    VALUES (?, ?, 1)
    ON CONFLICT(codigo) DO UPDATE SET
      nombre = excluded.nombre,
      activo = 1
  `);
  tiposCP.forEach(row => upsertTipoCP.run(...row));

  const upsertEmpresa = db.prepare(`
    INSERT INTO empresa_emisora (codigo, razon_social, afecto_iva, iva_pct)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(codigo) DO UPDATE SET
      razon_social = excluded.razon_social,
      afecto_iva = excluded.afecto_iva,
      iva_pct = excluded.iva_pct
  `);
  upsertEmpresa.run('MAS_CONSULTORES', 'MAS CONSULTORES S.A', 1, 0.19);
  upsertEmpresa.run('MAS_CAPACITACION', 'MAS Capacitación', 0, 0);

  const legacy = db.prepare("SELECT codigo FROM empresa_emisora WHERE codigo = 'MAS_CAPACITACIONES'").get();
  if (legacy) {
    db.prepare("UPDATE empresa_emisora SET afecto_iva = 0, iva_pct = 0 WHERE codigo = 'MAS_CAPACITACIONES'").run();
  }

  db.exec('CREATE INDEX IF NOT EXISTS idx_catalogo_estado_grupo ON catalogo_estado_solicitud(grupo, activo, orden);');
  db.exec('CREATE INDEX IF NOT EXISTS idx_catalogo_tipo_cp_activo ON catalogo_tipo_cp(activo, nombre);');
  db.exec('CREATE INDEX IF NOT EXISTS idx_catalogo_tipo_impuesto_activo ON catalogo_tipo_impuesto(activo, afecto_iva);');
};
