function columns(db, table) {
  return db.prepare(`PRAGMA table_info('${table}')`).all().map(col => col.name);
}

function addColumn(db, table, column, definition) {
  if (!columns(db, table).includes(column)) {
    db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition};`);
  }
}

module.exports = function migrate(db) {
  addColumn(db, 'proyeccion_facturacion', 'tipo_impuesto', 'TEXT');
  addColumn(db, 'proyeccion_facturacion', 'codigo_facturacion', 'TEXT');
  addColumn(db, 'proyeccion_facturacion', 'monto_uf', 'REAL');

  addColumn(db, 'solicitud_factura', 'uf_fecha', 'TEXT');
  addColumn(db, 'solicitud_factura', 'uf_valor', 'REAL');
  addColumn(db, 'solicitud_factura', 'version_plantilla', "TEXT DEFAULT 'v1'");
  addColumn(db, 'solicitud_factura', 'is_delete', 'INTEGER NOT NULL DEFAULT 0');

  addColumn(db, 'solicitud_cp', 'monto_uf', 'REAL');
  addColumn(db, 'documento_exportado', 'version_plantilla', 'TEXT');

  db.exec('CREATE INDEX IF NOT EXISTS idx_sol_is_delete ON solicitud_factura(is_delete);');
  db.exec('CREATE INDEX IF NOT EXISTS idx_doc_version ON documento_exportado(version_plantilla);');
  db.exec('CREATE INDEX IF NOT EXISTS idx_proy_tipo_facturacion ON proyeccion_facturacion(tipo_impuesto, codigo_facturacion);');
};
