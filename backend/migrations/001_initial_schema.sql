CREATE TABLE IF NOT EXISTS empresa_emisora (
  codigo TEXT PRIMARY KEY,
  razon_social TEXT NOT NULL,
  rut TEXT,
  giro TEXT,
  direccion TEXT,
  telefono TEXT,
  afecto_iva INTEGER NOT NULL DEFAULT 1,
  iva_pct REAL NOT NULL DEFAULT 0.19
);

CREATE TABLE IF NOT EXISTS coordinador (
  id TEXT PRIMARY KEY,
  nombre TEXT NOT NULL,
  email TEXT,
  slack_user_id TEXT,
  activo INTEGER NOT NULL DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS cliente (
  id TEXT PRIMARY KEY,
  nombre_corto TEXT NOT NULL UNIQUE,
  razon_social TEXT,
  rut TEXT,
  giro TEXT,
  direccion TEXT,
  coordinador_id TEXT REFERENCES coordinador(id),
  frecuencia TEXT DEFAULT 'Mensual',
  dia_facturacion INTEGER,
  mes_inicio INTEGER,
  requiere_hes INTEGER NOT NULL DEFAULT 0,
  estado TEXT NOT NULL DEFAULT 'Activo',
  notas TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS receptor (
  id TEXT PRIMARY KEY,
  cliente_id TEXT NOT NULL REFERENCES cliente(id),
  nombre TEXT NOT NULL,
  email TEXT NOT NULL,
  cargo TEXT,
  activo INTEGER NOT NULL DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS cp (
  id TEXT PRIMARY KEY,
  codigo TEXT NOT NULL UNIQUE,
  nombre TEXT,
  tipo_cp TEXT,
  area TEXT,
  cliente_id TEXT REFERENCES cliente(id),
  activo INTEGER NOT NULL DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS producto (
  id TEXT PRIMARY KEY,
  codigo TEXT UNIQUE,
  nombre TEXT NOT NULL,
  categoria TEXT,
  activo INTEGER NOT NULL DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS cliente_producto (
  id TEXT PRIMARY KEY,
  cliente_id TEXT NOT NULL REFERENCES cliente(id),
  producto_id TEXT NOT NULL REFERENCES producto(id),
  vigencia_desde TEXT,
  vigencia_hasta TEXT,
  condiciones TEXT,
  activo INTEGER NOT NULL DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now')),
  UNIQUE(cliente_id, producto_id)
);

CREATE TABLE IF NOT EXISTS cliente_coordinador (
  id TEXT PRIMARY KEY,
  cliente_id TEXT NOT NULL REFERENCES cliente(id),
  coordinador_id TEXT NOT NULL REFERENCES coordinador(id),
  cp_id TEXT REFERENCES cp(id),
  activo INTEGER NOT NULL DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now')),
  UNIQUE(cliente_id, coordinador_id, cp_id)
);

CREATE TABLE IF NOT EXISTS proyeccion_facturacion (
  id TEXT PRIMARY KEY,
  cliente_id TEXT NOT NULL REFERENCES cliente(id),
  cliente TEXT,
  codigo TEXT,
  nombre TEXT,
  tipo_cp TEXT,
  tipo_impuesto TEXT,
  mes TEXT,
  anio INTEGER,
  monto_uf REAL,
  moneda TEXT,
  estado TEXT,
  observaciones TEXT,
  fecha_estimada_facturacion TEXT,
  codigo_facturacion TEXT,
  source TEXT,
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS desarrollador (
  id TEXT PRIMARY KEY,
  nombre TEXT NOT NULL,
  email TEXT,
  equipo TEXT,
  activo INTEGER NOT NULL DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS solicitud_factura (
  id TEXT PRIMARY KEY,
  folio TEXT NOT NULL UNIQUE,
  tipo TEXT NOT NULL DEFAULT 'mensual',
  cliente_id TEXT NOT NULL REFERENCES cliente(id),
  coordinador_id TEXT REFERENCES coordinador(id),
  empresa_emisora TEXT NOT NULL REFERENCES empresa_emisora(codigo),
  periodo TEXT NOT NULL,
  fecha_solicitud TEXT NOT NULL,
  fecha_facturacion TEXT,
  oc_numero TEXT,
  contrato_numero TEXT,
  hes_numero TEXT,
  glosa TEXT NOT NULL,
  area TEXT,
  moneda_base TEXT NOT NULL DEFAULT 'CLP',
  uf_fecha TEXT,
  uf_valor REAL,
  monto_neto_clp REAL DEFAULT 0,
  monto_iva_clp REAL DEFAULT 0,
  monto_total_clp REAL DEFAULT 0,
  observaciones TEXT,
  estado TEXT NOT NULL DEFAULT 'Borrador',
  is_delete INTEGER NOT NULL DEFAULT 0,
  version_plantilla TEXT DEFAULT 'v1',
  programada_id TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS solicitud_item (
  id TEXT PRIMARY KEY,
  solicitud_id TEXT NOT NULL REFERENCES solicitud_factura(id) ON DELETE CASCADE,
  producto_id TEXT REFERENCES producto(id),
  descripcion TEXT NOT NULL,
  codigo_ref TEXT,
  cantidad REAL DEFAULT 1,
  uf_unitaria REAL,
  clp_unitario REAL,
  subtotal_clp REAL DEFAULT 0,
  orden INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS solicitud_cp (
  id TEXT PRIMARY KEY,
  solicitud_id TEXT NOT NULL REFERENCES solicitud_factura(id) ON DELETE CASCADE,
  cp_id TEXT NOT NULL REFERENCES cp(id),
  monto_uf REAL,
  monto_clp REAL NOT NULL,
  orden INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS solicitud_receptor (
  solicitud_id TEXT NOT NULL REFERENCES solicitud_factura(id) ON DELETE CASCADE,
  receptor_id TEXT NOT NULL REFERENCES receptor(id),
  PRIMARY KEY (solicitud_id, receptor_id)
);

CREATE TABLE IF NOT EXISTS historial_estado (
  id TEXT PRIMARY KEY,
  solicitud_id TEXT NOT NULL REFERENCES solicitud_factura(id),
  estado_desde TEXT,
  estado_hacia TEXT NOT NULL,
  fecha TEXT DEFAULT (datetime('now')),
  usuario TEXT,
  comentario TEXT
);

CREATE TABLE IF NOT EXISTS solicitud_programada (
  id TEXT PRIMARY KEY,
  cliente_id TEXT NOT NULL REFERENCES cliente(id),
  nombre TEXT NOT NULL,
  dia_emision INTEGER,
  frecuencia TEXT DEFAULT 'Mensual',
  mes_inicio INTEGER,
  activa INTEGER NOT NULL DEFAULT 1,
  payload_base TEXT,
  proxima_generacion TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS asignacion_solicitud (
  id TEXT PRIMARY KEY,
  solicitud_id TEXT NOT NULL REFERENCES solicitud_factura(id),
  desarrollador_id TEXT NOT NULL REFERENCES desarrollador(id),
  rol TEXT,
  horas_estimadas REAL,
  activo INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS registro_tiempo (
  id TEXT PRIMARY KEY,
  solicitud_id TEXT NOT NULL REFERENCES solicitud_factura(id),
  desarrollador_id TEXT NOT NULL REFERENCES desarrollador(id),
  fecha TEXT NOT NULL,
  minutos INTEGER NOT NULL CHECK(minutos > 0),
  descripcion TEXT,
  aprobado INTEGER NOT NULL DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS documento_exportado (
  id TEXT PRIMARY KEY,
  solicitud_id TEXT NOT NULL REFERENCES solicitud_factura(id),
  tipo TEXT DEFAULT 'solicitud_factura_xlsx',
  formato TEXT DEFAULT 'xlsx',
  version_plantilla TEXT,
  ruta TEXT,
  checksum TEXT,
  generado_at TEXT DEFAULT (datetime('now')),
  generado_por TEXT
);

CREATE TABLE IF NOT EXISTS version_plantilla (
  id TEXT PRIMARY KEY,
  descripcion TEXT,
  definicion_layout TEXT,
  ruta TEXT,
  vigente_desde TEXT,
  vigente_hasta TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS uf_cache (
  fecha TEXT PRIMARY KEY,
  valor REAL NOT NULL,
  source TEXT DEFAULT 'mindicador.cl',
  obtenido_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS bitacora_integracion (
  id TEXT PRIMARY KEY,
  integracion TEXT NOT NULL,
  dataset TEXT NOT NULL,
  estado TEXT NOT NULL,
  mensaje TEXT,
  filas_leidas INTEGER DEFAULT 0,
  filas_procesadas INTEGER DEFAULT 0,
  detalles TEXT,
  iniciado_at TEXT DEFAULT (datetime('now')),
  finalizado_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_sol_cliente ON solicitud_factura(cliente_id, periodo);
CREATE INDEX IF NOT EXISTS idx_sol_estado ON solicitud_factura(estado);
CREATE INDEX IF NOT EXISTS idx_sol_fecha ON solicitud_factura(fecha_solicitud DESC);
CREATE INDEX IF NOT EXISTS idx_hist_sol ON historial_estado(solicitud_id, fecha DESC);
CREATE INDEX IF NOT EXISTS idx_receptor_cli ON receptor(cliente_id);
CREATE INDEX IF NOT EXISTS idx_cp_cli ON cp(cliente_id);
CREATE INDEX IF NOT EXISTS idx_cliente_coord_cliente ON cliente_coordinador(cliente_id, activo);
CREATE INDEX IF NOT EXISTS idx_cliente_coord_cp ON cliente_coordinador(cp_id, activo);
CREATE INDEX IF NOT EXISTS idx_proy_cliente_periodo ON proyeccion_facturacion(cliente_id, anio, mes);
CREATE INDEX IF NOT EXISTS idx_proy_codigo ON proyeccion_facturacion(codigo);
CREATE INDEX IF NOT EXISTS idx_bitacora_integracion ON bitacora_integracion(integracion, dataset, iniciado_at DESC);
