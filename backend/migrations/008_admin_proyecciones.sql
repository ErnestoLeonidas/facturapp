CREATE TABLE IF NOT EXISTS proyeccion (
  id TEXT PRIMARY KEY,
  anio INTEGER NOT NULL,
  iva TEXT,
  ms TEXT,
  proyecto TEXT,
  cliente_id TEXT REFERENCES cliente(id),
  cliente TEXT,
  dp TEXT,
  cp TEXT,
  producto TEXT,
  tipo_cp TEXT,
  venta REAL,
  mes INTEGER NOT NULL,
  monto REAL,
  monto_uf REAL,
  monto_clp_referencia REAL,
  estado TEXT,
  source TEXT,
  source_row INTEGER,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_proyeccion_admin_natural
  ON proyeccion(anio, mes, ifnull(ms, ''), ifnull(cliente, ''), ifnull(proyecto, ''), ifnull(producto, ''), ifnull(tipo_cp, ''), ifnull(cp, ''));

CREATE INDEX IF NOT EXISTS idx_proyeccion_admin_filtros
  ON proyeccion(anio, cliente, ms, producto, tipo_cp, iva, estado);

CREATE INDEX IF NOT EXISTS idx_proyeccion_admin_cliente_id
  ON proyeccion(cliente_id, anio, ms);

CREATE TABLE IF NOT EXISTS proyeccion_uf (
  id TEXT PRIMARY KEY,
  anio INTEGER NOT NULL,
  mes INTEGER NOT NULL,
  uf_fija REAL,
  uf_proyectada REAL,
  uf_manual REAL,
  origen_valor TEXT NOT NULL DEFAULT 'PROYECTADA',
  observaciones TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  UNIQUE(anio, mes)
);

CREATE TABLE IF NOT EXISTS proyeccion_configuracion (
  id TEXT PRIMARY KEY,
  cliente_id TEXT REFERENCES cliente(id),
  ms TEXT,
  anio INTEGER NOT NULL,
  modo_uf TEXT NOT NULL DEFAULT 'PROYECTADA',
  uf_fija_default REAL,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_proyeccion_configuracion_natural
  ON proyeccion_configuracion(ifnull(cliente_id, ''), ifnull(ms, ''), anio);

CREATE TABLE IF NOT EXISTS proyeccion_auxiliar (
  id TEXT PRIMARY KEY,
  anio INTEGER NOT NULL,
  hoja TEXT NOT NULL,
  fila INTEGER NOT NULL,
  data_json TEXT NOT NULL,
  source TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_proyeccion_auxiliar_anio_hoja
  ON proyeccion_auxiliar(anio, hoja, fila);
