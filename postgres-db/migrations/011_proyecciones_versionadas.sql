CREATE TABLE IF NOT EXISTS proyeccion_version (
  id TEXT PRIMARY KEY,
  numero INTEGER NOT NULL,
  nombre TEXT NOT NULL,
  fecha_version TEXT NOT NULL,
  anio INTEGER NOT NULL,
  descripcion TEXT,
  activa INTEGER NOT NULL DEFAULT 0,
  origen TEXT NOT NULL DEFAULT 'APP',
  created_by TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  UNIQUE(anio, numero)
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_proyeccion_version_activa
  ON proyeccion_version(anio)
  WHERE activa = 1;

CREATE TABLE IF NOT EXISTS proyeccion_item (
  id TEXT PRIMARY KEY,
  version_id TEXT NOT NULL REFERENCES proyeccion_version(id),
  iva TEXT,
  proyecto TEXT,
  ms TEXT,
  cliente_id TEXT REFERENCES cliente(id),
  cliente TEXT,
  dp TEXT,
  cp TEXT,
  producto TEXT,
  tipo_cp TEXT,
  venta REAL,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_proyeccion_item_version
  ON proyeccion_item(version_id, cliente, ms, producto, tipo_cp, iva);

CREATE TABLE IF NOT EXISTS proyeccion_mensual (
  id TEXT PRIMARY KEY,
  item_id TEXT NOT NULL REFERENCES proyeccion_item(id),
  mes INTEGER NOT NULL CHECK (mes BETWEEN 1 AND 12),
  cantidad_uf REAL,
  uf_fija REAL,
  uf_proyectada REAL,
  uf_manual REAL,
  monto_clp REAL,
  monto_clp_manual REAL,
  modo_calculo TEXT NOT NULL DEFAULT 'MANUAL_CLP'
    CHECK (modo_calculo IN ('UF_PROYECTADA', 'UF_FIJA', 'MANUAL_UF', 'MANUAL_CLP')),
  submodo_uf TEXT CHECK (submodo_uf IS NULL OR submodo_uf IN ('UF_FIJA', 'UF_PROYECTADA')),
  origen_valor TEXT NOT NULL DEFAULT 'APP'
    CHECK (origen_valor IN ('APP', 'EXCEL_IMPORTADO', 'RECALCULADO', 'MANUAL_UF', 'MANUAL_CLP')),
  es_manual INTEGER NOT NULL DEFAULT 0,
  observacion TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  UNIQUE(item_id, mes)
);

CREATE INDEX IF NOT EXISTS idx_proyeccion_mensual_item_mes
  ON proyeccion_mensual(item_id, mes);

INSERT INTO proyeccion_version (id, numero, nombre, fecha_version, anio, descripcion, activa, origen, created_by)
SELECT
  lower(hex(randomblob(4)) || '-' || hex(randomblob(2)) || '-' || '4' || substr(hex(randomblob(2)), 2) || '-' || substr('89ab', abs(random()) % 4 + 1, 1) || substr(hex(randomblob(2)), 2) || '-' || hex(randomblob(6))),
  1,
  '1. Proyecciones Plataformas ' || strftime('%d.%m.%Y', 'now'),
  date('now'),
  p.anio,
  'Version inicial migrada desde proyeccion legacy',
  1,
  'MIGRACION_LEGACY',
  'sistema'
FROM (SELECT DISTINCT anio FROM proyeccion) p
WHERE NOT EXISTS (
  SELECT 1 FROM proyeccion_version pv WHERE pv.anio = p.anio
);

INSERT INTO proyeccion_item (
  id, version_id, iva, proyecto, ms, cliente_id, cliente, dp, cp, producto, tipo_cp, venta
)
SELECT
  lower(hex(randomblob(4)) || '-' || hex(randomblob(2)) || '-' || '4' || substr(hex(randomblob(2)), 2) || '-' || substr('89ab', abs(random()) % 4 + 1, 1) || substr(hex(randomblob(2)), 2) || '-' || hex(randomblob(6))),
  pv.id,
  p.iva,
  p.proyecto,
  p.ms,
  p.cliente_id,
  p.cliente,
  p.dp,
  p.cp,
  p.producto,
  p.tipo_cp,
  p.venta
FROM (
  SELECT DISTINCT anio, iva, proyecto, ms, cliente_id, cliente, dp, cp, producto, tipo_cp, venta
  FROM proyeccion
) p
JOIN proyeccion_version pv ON pv.anio = p.anio AND pv.activa = 1
WHERE NOT EXISTS (SELECT 1 FROM proyeccion_item pi WHERE pi.version_id = pv.id);

INSERT INTO proyeccion_mensual (
  id, item_id, mes, cantidad_uf, uf_proyectada, monto_clp, monto_clp_manual, modo_calculo, origen_valor, es_manual, observacion
)
SELECT
  lower(hex(randomblob(4)) || '-' || hex(randomblob(2)) || '-' || '4' || substr(hex(randomblob(2)), 2) || '-' || substr('89ab', abs(random()) % 4 + 1, 1) || substr(hex(randomblob(2)), 2) || '-' || hex(randomblob(6))),
  pi.id,
  p.mes,
  p.monto_uf,
  pu.uf_proyectada,
  p.monto,
  p.monto,
  'MANUAL_CLP',
  'EXCEL_IMPORTADO',
  1,
  'Migrado desde proyeccion legacy'
FROM proyeccion p
JOIN proyeccion_version pv ON pv.anio = p.anio AND pv.activa = 1
JOIN proyeccion_item pi ON pi.version_id = pv.id
  AND ifnull(pi.iva, '') = ifnull(p.iva, '')
  AND ifnull(pi.proyecto, '') = ifnull(p.proyecto, '')
  AND ifnull(pi.ms, '') = ifnull(p.ms, '')
  AND ifnull(pi.cliente, '') = ifnull(p.cliente, '')
  AND ifnull(pi.dp, '') = ifnull(p.dp, '')
  AND ifnull(pi.cp, '') = ifnull(p.cp, '')
  AND ifnull(pi.producto, '') = ifnull(p.producto, '')
  AND ifnull(pi.tipo_cp, '') = ifnull(p.tipo_cp, '')
  AND ifnull(pi.venta, -1) = ifnull(p.venta, -1)
LEFT JOIN proyeccion_uf pu ON pu.anio = p.anio AND pu.mes = p.mes
WHERE NOT EXISTS (
  SELECT 1 FROM proyeccion_mensual pm WHERE pm.item_id = pi.id AND pm.mes = p.mes
);
