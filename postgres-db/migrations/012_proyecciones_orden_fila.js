function hasColumn(db, table, column) {
  return db.prepare(`PRAGMA table_info('${table}')`).all().some(col => col.name === column);
}

module.exports = function migration(db) {
  if (!hasColumn(db, 'proyeccion_item', 'orden_fila')) {
    db.exec('ALTER TABLE proyeccion_item ADD COLUMN orden_fila INTEGER');
  }

  db.exec(`
    WITH ordered AS (
      SELECT
        id,
        ROW_NUMBER() OVER (
          PARTITION BY version_id
          ORDER BY created_at, cliente, ms, proyecto, producto, tipo_cp, id
        ) AS rn
      FROM proyeccion_item
      WHERE orden_fila IS NULL
    )
    UPDATE proyeccion_item
    SET orden_fila = (SELECT rn FROM ordered WHERE ordered.id = proyeccion_item.id)
    WHERE orden_fila IS NULL;

    CREATE INDEX IF NOT EXISTS idx_proyeccion_item_orden_fila
      ON proyeccion_item(version_id, orden_fila, id);
  `);
};
