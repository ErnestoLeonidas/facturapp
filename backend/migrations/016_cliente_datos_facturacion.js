const { v4: uuidv4 } = require('uuid');

module.exports = function migration(db) {
  db.exec(`
CREATE TABLE IF NOT EXISTS cliente_facturacion (
  id TEXT PRIMARY KEY,
  cliente_id TEXT NOT NULL REFERENCES cliente(id) ON DELETE CASCADE,
  etiqueta TEXT,
  razon_social TEXT NOT NULL,
  rut TEXT,
  giro TEXT,
  direccion TEXT,
  activo INTEGER NOT NULL DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_cliente_facturacion_cliente ON cliente_facturacion(cliente_id, activo);
`);

  const solicitudCols = db.prepare("PRAGMA table_info('solicitud_factura')").all().map(col => col.name);
  if (!solicitudCols.includes('cliente_facturacion_id')) {
    db.exec('ALTER TABLE solicitud_factura ADD COLUMN cliente_facturacion_id TEXT;');
  }

  const aristia = db.prepare(`
    SELECT id FROM cliente
    WHERE upper(nombre_corto) LIKE '%ARIZT%'
       OR upper(nombre_corto) LIKE '%ARIST%'
    LIMIT 1
  `).get();

  if (aristia) {
    const existing = db.prepare(`
      SELECT id FROM cliente_facturacion
      WHERE cliente_id = ?
        AND rut = ?
      LIMIT 1
    `).get(aristia.id, '78.098.060-5');

    if (!existing) {
      db.prepare(`
        INSERT INTO cliente_facturacion
          (id, cliente_id, etiqueta, razon_social, rut, giro, direccion, activo)
        VALUES (?, ?, ?, ?, ?, ?, ?, 1)
      `).run(
        uuidv4(),
        aristia.id,
        'Datos cliente 2',
        'SERVICIOS EMPRESARIALES PUANGUE',
        '78.098.060-5',
        'Inversiones y Servicios de apoyo a las empresas.',
        'Los Carreras 444, melipilla.'
      );
    }
  }
};
