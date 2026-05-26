function hasColumn(db, table, column) {
  return db.prepare(`PRAGMA table_info('${table}')`).all().some(col => col.name === column);
}

module.exports = function migration(db) {
  if (!hasColumn(db, 'proyeccion_version', 'meta_anual')) {
    db.exec('ALTER TABLE proyeccion_version ADD COLUMN meta_anual REAL');
  }

  db.prepare(`
    UPDATE proyeccion_version
    SET meta_anual = 725000000
    WHERE anio = 2026
      AND meta_anual IS NULL
  `).run();
};
