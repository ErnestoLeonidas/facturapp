module.exports = function migration(db) {
  const columns = table => db.prepare(`PRAGMA table_info('${table}')`).all().map(col => col.name);

  const solicitudCols = columns('solicitud_factura');
  if (!solicitudCols.includes('monto_neto_clp_manual')) {
    db.exec('ALTER TABLE solicitud_factura ADD COLUMN monto_neto_clp_manual REAL;');
  }

  const cpCols = columns('solicitud_cp');
  if (!cpCols.includes('monto_clp_manual')) {
    db.exec('ALTER TABLE solicitud_cp ADD COLUMN monto_clp_manual REAL;');
  }
  if (!cpCols.includes('monto_clp_es_manual')) {
    db.exec('ALTER TABLE solicitud_cp ADD COLUMN monto_clp_es_manual INTEGER NOT NULL DEFAULT 0;');
  }
};
