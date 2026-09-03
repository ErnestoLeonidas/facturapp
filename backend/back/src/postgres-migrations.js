const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { checksum } = require('./migrations');

const MIGRATIONS_DIR = path.join(__dirname, '..', 'migrations');
const ITERATIONS = 120000;
const INITIAL_USER_PASSWORD = 'mas2026';

function quoteIdent(value) {
  if (!/^[a-z_][a-z0-9_]*$/i.test(value)) {
    throw new Error(`Identificador SQL invalido: ${value}`);
  }
  return `"${value}"`;
}

function migrationChecksum(name, fallback = '') {
  const fullPath = path.join(MIGRATIONS_DIR, name);
  if (fs.existsSync(fullPath)) return checksum(fs.readFileSync(fullPath, 'utf8'));
  return checksum(fallback);
}

function hashPassword(password, salt) {
  return crypto.pbkdf2Sync(String(password || ''), salt, ITERATIONS, 32, 'sha256').toString('hex');
}

function clean(value) {
  if (value === undefined || value === null) return '';
  return String(value).trim();
}

function key(value) {
  return clean(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '');
}

async function tableHasColumn(client, table, column) {
  const result = await client.query(`
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = current_schema()
      AND table_name = $1
      AND column_name = $2
    LIMIT 1
  `, [table, column]);
  return result.rowCount > 0;
}

async function addColumnIfMissing(client, table, column, definition) {
  await client.query(`ALTER TABLE ${quoteIdent(table)} ADD COLUMN IF NOT EXISTS ${quoteIdent(column)} ${definition}`);
}

async function ensureAuthUser(client, { nombre, username, password, rol }) {
  const normalized = username.toLowerCase();
  const salt = `facturapp-${normalized}-2026`;
  const passwordHash = hashPassword(password || INITIAL_USER_PASSWORD, salt);
  const existing = await client.query(`
    SELECT id
    FROM app_user
    WHERE lower(COALESCE(username, email)) = lower($1)
       OR lower(email) = lower($2)
    LIMIT 1
  `, [normalized, normalized]);

  if (existing.rowCount) {
    await client.query(`
      UPDATE app_user
      SET nombre = $1,
          username = $2,
          email = $3,
          rol = $4,
          password_hash = $5,
          password_salt = $6,
          activo = 1,
          updated_at = CURRENT_TIMESTAMP::text
      WHERE id = $7
    `, [nombre, normalized, normalized, rol, passwordHash, salt, existing.rows[0].id]);
    return;
  }

  await client.query(`
    INSERT INTO app_user (id, nombre, username, email, rol, password_hash, password_salt, activo)
    VALUES (gen_random_uuid()::text, $1, $2, $3, $4, $5, $6, 1)
  `, [nombre, normalized, normalized, rol, passwordHash, salt]);
}

async function ensureMappedUser(client, { nombre, username, rol }) {
  const normalized = key(username).replace(/_/g, '').slice(0, 40);
  const salt = `facturapp-${normalized}-mas2026`;
  const passwordHash = hashPassword(INITIAL_USER_PASSWORD, salt);
  const existing = await client.query(`
    SELECT id
    FROM app_user
    WHERE lower(COALESCE(username, email)) = lower($1)
       OR lower(email) = lower($2)
    LIMIT 1
  `, [normalized, normalized]);

  if (existing.rowCount) {
    await client.query(`
      UPDATE app_user
      SET nombre = $1,
          username = $2,
          email = $3,
          rol = $4,
          password_hash = $5,
          password_salt = $6,
          activo = 1,
          updated_at = CURRENT_TIMESTAMP::text
      WHERE id = $7
    `, [nombre, normalized, normalized, rol, passwordHash, salt, existing.rows[0].id]);
    return;
  }

  await client.query(`
    INSERT INTO app_user (id, nombre, username, email, rol, password_hash, password_salt, activo)
    VALUES (gen_random_uuid()::text, $1, $2, $3, $4, $5, $6, 1)
  `, [nombre, normalized, normalized, rol, passwordHash, salt]);
}

function sqlMigration(version, name, sql) {
  return {
    version,
    name,
    checksum: migrationChecksum(name, sql),
    up: client => client.query(sql)
  };
}

function jsMigration(version, name, up) {
  return {
    version,
    name,
    checksum: migrationChecksum(name, up.toString()),
    up
  };
}

const migrations = [
  sqlMigration('001', '001_initial_schema.sql', `
CREATE EXTENSION IF NOT EXISTS pgcrypto;

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
  created_at TEXT DEFAULT (CURRENT_TIMESTAMP::text)
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
  created_at TEXT DEFAULT (CURRENT_TIMESTAMP::text),
  updated_at TEXT DEFAULT (CURRENT_TIMESTAMP::text)
);

CREATE TABLE IF NOT EXISTS receptor (
  id TEXT PRIMARY KEY,
  cliente_id TEXT NOT NULL REFERENCES cliente(id),
  nombre TEXT NOT NULL,
  email TEXT NOT NULL,
  cargo TEXT,
  activo INTEGER NOT NULL DEFAULT 1,
  created_at TEXT DEFAULT (CURRENT_TIMESTAMP::text)
);

CREATE TABLE IF NOT EXISTS cp (
  id TEXT PRIMARY KEY,
  codigo TEXT NOT NULL UNIQUE,
  nombre TEXT,
  tipo_cp TEXT,
  area TEXT,
  cliente_id TEXT REFERENCES cliente(id),
  activo INTEGER NOT NULL DEFAULT 1,
  created_at TEXT DEFAULT (CURRENT_TIMESTAMP::text)
);

CREATE TABLE IF NOT EXISTS producto (
  id TEXT PRIMARY KEY,
  codigo TEXT UNIQUE,
  nombre TEXT NOT NULL,
  categoria TEXT,
  activo INTEGER NOT NULL DEFAULT 1,
  created_at TEXT DEFAULT (CURRENT_TIMESTAMP::text)
);

CREATE TABLE IF NOT EXISTS cliente_producto (
  id TEXT PRIMARY KEY,
  cliente_id TEXT NOT NULL REFERENCES cliente(id),
  producto_id TEXT NOT NULL REFERENCES producto(id),
  vigencia_desde TEXT,
  vigencia_hasta TEXT,
  condiciones TEXT,
  activo INTEGER NOT NULL DEFAULT 1,
  created_at TEXT DEFAULT (CURRENT_TIMESTAMP::text),
  UNIQUE(cliente_id, producto_id)
);

CREATE TABLE IF NOT EXISTS cliente_coordinador (
  id TEXT PRIMARY KEY,
  cliente_id TEXT NOT NULL REFERENCES cliente(id),
  coordinador_id TEXT NOT NULL REFERENCES coordinador(id),
  cp_id TEXT REFERENCES cp(id),
  activo INTEGER NOT NULL DEFAULT 1,
  created_at TEXT DEFAULT (CURRENT_TIMESTAMP::text),
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
  updated_at TEXT DEFAULT (CURRENT_TIMESTAMP::text)
);

CREATE TABLE IF NOT EXISTS desarrollador (
  id TEXT PRIMARY KEY,
  nombre TEXT NOT NULL,
  email TEXT,
  equipo TEXT,
  activo INTEGER NOT NULL DEFAULT 1,
  created_at TEXT DEFAULT (CURRENT_TIMESTAMP::text)
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
  created_at TEXT DEFAULT (CURRENT_TIMESTAMP::text),
  updated_at TEXT DEFAULT (CURRENT_TIMESTAMP::text)
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
  fecha TEXT DEFAULT (CURRENT_TIMESTAMP::text),
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
  created_at TEXT DEFAULT (CURRENT_TIMESTAMP::text),
  updated_at TEXT DEFAULT (CURRENT_TIMESTAMP::text)
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
  created_at TEXT DEFAULT (CURRENT_TIMESTAMP::text)
);

CREATE TABLE IF NOT EXISTS documento_exportado (
  id TEXT PRIMARY KEY,
  solicitud_id TEXT NOT NULL REFERENCES solicitud_factura(id),
  tipo TEXT DEFAULT 'solicitud_factura_xlsx',
  formato TEXT DEFAULT 'xlsx',
  version_plantilla TEXT,
  ruta TEXT,
  checksum TEXT,
  generado_at TEXT DEFAULT (CURRENT_TIMESTAMP::text),
  generado_por TEXT
);

CREATE TABLE IF NOT EXISTS version_plantilla (
  id TEXT PRIMARY KEY,
  descripcion TEXT,
  definicion_layout TEXT,
  ruta TEXT,
  vigente_desde TEXT,
  vigente_hasta TEXT,
  created_at TEXT DEFAULT (CURRENT_TIMESTAMP::text)
);

CREATE TABLE IF NOT EXISTS uf_cache (
  fecha TEXT PRIMARY KEY,
  valor REAL NOT NULL,
  source TEXT DEFAULT 'mindicador.cl',
  obtenido_at TEXT DEFAULT (CURRENT_TIMESTAMP::text)
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
  iniciado_at TEXT DEFAULT (CURRENT_TIMESTAMP::text),
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
`),

  sqlMigration('002', '002_constraints_indexes.sql', `
CREATE INDEX IF NOT EXISTS idx_cliente_estado ON cliente(estado);
CREATE INDEX IF NOT EXISTS idx_cliente_coordinador ON cliente(coordinador_id);
CREATE INDEX IF NOT EXISTS idx_cp_cliente_codigo ON cp(cliente_id, codigo);
CREATE INDEX IF NOT EXISTS idx_cp_tipo ON cp(tipo_cp);
CREATE INDEX IF NOT EXISTS idx_sol_periodo_estado ON solicitud_factura(periodo, estado, is_delete);
CREATE INDEX IF NOT EXISTS idx_sol_empresa_periodo ON solicitud_factura(empresa_emisora, periodo, is_delete);
CREATE INDEX IF NOT EXISTS idx_sol_coordinador_periodo ON solicitud_factura(coordinador_id, periodo, is_delete);
CREATE INDEX IF NOT EXISTS idx_sol_programada_periodo ON solicitud_factura(programada_id, periodo, is_delete);
CREATE INDEX IF NOT EXISTS idx_sol_updated_at ON solicitud_factura(updated_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS uq_solicitud_cp_solicitud_cp ON solicitud_cp(solicitud_id, cp_id);
CREATE INDEX IF NOT EXISTS idx_solicitud_cp_cp ON solicitud_cp(cp_id);
CREATE INDEX IF NOT EXISTS idx_solicitud_cp_solicitud_orden ON solicitud_cp(solicitud_id, orden);
CREATE UNIQUE INDEX IF NOT EXISTS uq_proyeccion_natural
  ON proyeccion_facturacion(cliente_id, codigo, anio, mes, tipo_impuesto);
CREATE INDEX IF NOT EXISTS idx_proy_periodo_tipo_estado
  ON proyeccion_facturacion(anio, mes, tipo_impuesto, estado);
CREATE INDEX IF NOT EXISTS idx_proy_cliente_codigo_periodo
  ON proyeccion_facturacion(cliente_id, codigo, anio, mes);
CREATE INDEX IF NOT EXISTS idx_proy_estado ON proyeccion_facturacion(estado);
CREATE INDEX IF NOT EXISTS idx_proy_source_updated ON proyeccion_facturacion(source, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_hist_fecha ON historial_estado(fecha DESC);
CREATE INDEX IF NOT EXISTS idx_hist_estado_hacia ON historial_estado(estado_hacia);
CREATE INDEX IF NOT EXISTS idx_doc_solicitud ON documento_exportado(solicitud_id, generado_at DESC);
CREATE INDEX IF NOT EXISTS idx_doc_checksum ON documento_exportado(checksum);
CREATE INDEX IF NOT EXISTS idx_doc_version ON documento_exportado(version_plantilla);
CREATE INDEX IF NOT EXISTS idx_bitacora_estado ON bitacora_integracion(estado, iniciado_at DESC);
CREATE INDEX IF NOT EXISTS idx_bitacora_dataset ON bitacora_integracion(dataset, iniciado_at DESC);
`),

  sqlMigration('003', '003_adjust_proyeccion_unique_index.sql', `
DROP INDEX IF EXISTS uq_proyeccion_natural;
CREATE UNIQUE INDEX IF NOT EXISTS uq_proyeccion_natural
  ON proyeccion_facturacion(cliente_id, codigo, nombre, anio, mes, tipo_impuesto, codigo_facturacion);
`),

  jsMigration('004', '004_used_fields_integrations_finance.js', async client => {
    await addColumnIfMissing(client, 'proyeccion_facturacion', 'tipo_impuesto', 'TEXT');
    await addColumnIfMissing(client, 'proyeccion_facturacion', 'codigo_facturacion', 'TEXT');
    await addColumnIfMissing(client, 'proyeccion_facturacion', 'monto_uf', 'REAL');
    await addColumnIfMissing(client, 'solicitud_factura', 'uf_fecha', 'TEXT');
    await addColumnIfMissing(client, 'solicitud_factura', 'uf_valor', 'REAL');
    await addColumnIfMissing(client, 'solicitud_factura', 'version_plantilla', "TEXT DEFAULT 'v1'");
    await addColumnIfMissing(client, 'solicitud_factura', 'is_delete', 'INTEGER NOT NULL DEFAULT 0');
    await addColumnIfMissing(client, 'solicitud_cp', 'monto_uf', 'REAL');
    await addColumnIfMissing(client, 'documento_exportado', 'version_plantilla', 'TEXT');
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_sol_is_delete ON solicitud_factura(is_delete);
      CREATE INDEX IF NOT EXISTS idx_doc_version ON documento_exportado(version_plantilla);
      CREATE INDEX IF NOT EXISTS idx_proy_tipo_facturacion ON proyeccion_facturacion(tipo_impuesto, codigo_facturacion);
    `);
  }),

  sqlMigration('005', '005_operational_catalogs.js', `
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

INSERT INTO catalogo_estado_solicitud (codigo, nombre, grupo, orden, activo)
VALUES
  ('PENDIENTE OC / HES', 'Pendiente OC / HES', 'proyeccion', 10, 1),
  ('FACTURA SOLICITADA', 'Factura solicitada', 'proyeccion', 20, 1),
  ('Borrador', 'Borrador', 'solicitud', 40, 1),
  ('PendienteDatos', 'Pendiente de datos', 'solicitud', 50, 1),
  ('EnRevision', 'En revision', 'solicitud', 60, 1),
  ('Aprobada', 'Aprobada', 'solicitud', 70, 1),
  ('Rechazada', 'Rechazada', 'solicitud', 80, 1),
  ('Emitida', 'Emitida', 'solicitud', 90, 1),
  ('Facturada', 'Facturada', 'solicitud', 100, 1),
  ('Anulada', 'Anulada', 'solicitud', 110, 1),
  ('Cerrada', 'Cerrada', 'solicitud', 120, 1)
ON CONFLICT (codigo) DO UPDATE SET
  nombre = EXCLUDED.nombre,
  grupo = EXCLUDED.grupo,
  orden = EXCLUDED.orden,
  activo = 1;

INSERT INTO catalogo_tipo_impuesto (codigo, nombre, afecto_iva, activo)
VALUES
  ('AFECTO_IVA', 'Afecto IVA', 1, 1),
  ('EXENTO_IVA', 'Exento IVA', 0, 1)
ON CONFLICT (codigo) DO UPDATE SET
  nombre = EXCLUDED.nombre,
  afecto_iva = EXCLUDED.afecto_iva,
  activo = 1;

INSERT INTO catalogo_tipo_cp (codigo, nombre, activo)
VALUES
  ('ADMIN_OPERACION', 'Administracion y Operacion', 1),
  ('CONSTRUCCION', 'Construccion', 1),
  ('HORAS_DESARROLLO', 'Horas de Desarrollo', 1)
ON CONFLICT (codigo) DO UPDATE SET
  nombre = EXCLUDED.nombre,
  activo = 1;

INSERT INTO empresa_emisora (codigo, razon_social, afecto_iva, iva_pct)
VALUES
  ('MAS_CONSULTORES', 'MAS CONSULTORES S.A', 1, 0.19),
  ('MAS_CAPACITACION', 'MAS Capacitacion', 0, 0)
ON CONFLICT (codigo) DO UPDATE SET
  razon_social = EXCLUDED.razon_social,
  afecto_iva = EXCLUDED.afecto_iva,
  iva_pct = EXCLUDED.iva_pct;

UPDATE empresa_emisora
SET afecto_iva = 0,
    iva_pct = 0
WHERE codigo = 'MAS_CAPACITACIONES';

CREATE INDEX IF NOT EXISTS idx_catalogo_estado_grupo ON catalogo_estado_solicitud(grupo, activo, orden);
CREATE INDEX IF NOT EXISTS idx_catalogo_tipo_cp_activo ON catalogo_tipo_cp(activo, nombre);
CREATE INDEX IF NOT EXISTS idx_catalogo_tipo_impuesto_activo ON catalogo_tipo_impuesto(activo, afecto_iva);
`),

  sqlMigration('006', '006_remove_facturado_solicitudes.js', `
UPDATE solicitud_factura
SET estado = 'FACTURA SOLICITADA',
    updated_at = CURRENT_TIMESTAMP::text
WHERE estado = 'FACTURADO';

UPDATE proyeccion_facturacion
SET estado = 'FACTURA SOLICITADA',
    updated_at = CURRENT_TIMESTAMP::text
WHERE estado = 'FACTURADO';

UPDATE historial_estado
SET estado_desde = 'FACTURA SOLICITADA'
WHERE estado_desde = 'FACTURADO';

UPDATE historial_estado
SET estado_hacia = 'FACTURA SOLICITADA'
WHERE estado_hacia = 'FACTURADO';

UPDATE catalogo_estado_solicitud
SET activo = 0
WHERE codigo = 'FACTURADO';
`),

  sqlMigration('007', '007_auth_roles_admin.js', `
CREATE TABLE IF NOT EXISTS app_user (
  id TEXT PRIMARY KEY,
  nombre TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  rol TEXT NOT NULL CHECK (rol IN ('admin', 'usuario')),
  password_hash TEXT NOT NULL,
  password_salt TEXT NOT NULL,
  activo INTEGER NOT NULL DEFAULT 1,
  created_at TEXT DEFAULT (CURRENT_TIMESTAMP::text),
  updated_at TEXT DEFAULT (CURRENT_TIMESTAMP::text)
);

CREATE TABLE IF NOT EXISTS app_session (
  token TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES app_user(id),
  created_at TEXT DEFAULT (CURRENT_TIMESTAMP::text),
  expires_at TEXT,
  revoked_at TEXT
);

CREATE TABLE IF NOT EXISTS audit_log (
  id TEXT PRIMARY KEY,
  usuario_id TEXT,
  usuario_email TEXT,
  accion TEXT NOT NULL,
  entidad TEXT NOT NULL,
  entidad_id TEXT,
  detalle TEXT,
  created_at TEXT DEFAULT (CURRENT_TIMESTAMP::text)
);

CREATE INDEX IF NOT EXISTS idx_app_session_user ON app_session(user_id, revoked_at);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_entidad ON audit_log(entidad, entidad_id);

ALTER TABLE solicitud_factura ADD COLUMN IF NOT EXISTS admin_batch_id TEXT;
ALTER TABLE solicitud_factura ADD COLUMN IF NOT EXISTS origen_admin TEXT;

INSERT INTO app_user (id, nombre, email, rol, password_hash, password_salt, activo)
VALUES
  (
    gen_random_uuid()::text,
    'Admin FacturApp',
    'admin@facturapp.local',
    'admin',
    'ea78993fae6fb78eab1bf578a22d25426467ea61b3f4ff8fa1c490af96e03439',
    'facturapp-admin-2026',
    1
  ),
  (
    gen_random_uuid()::text,
    'Usuario FacturApp',
    'usuario@facturapp.local',
    'usuario',
    'd5a367c0f340091f42022637f81215ef6cce313fccb5bde0cb6ba4b75e62f77a',
    'facturapp-user-2026',
    1
  )
ON CONFLICT (email) DO UPDATE SET
  nombre = EXCLUDED.nombre,
  rol = EXCLUDED.rol,
  password_hash = EXCLUDED.password_hash,
  password_salt = EXCLUDED.password_salt,
  activo = 1,
  updated_at = CURRENT_TIMESTAMP::text;

`),

  sqlMigration('008', '008_admin_proyecciones.sql', `
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
  created_at TEXT DEFAULT (CURRENT_TIMESTAMP::text),
  updated_at TEXT DEFAULT (CURRENT_TIMESTAMP::text)
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_proyeccion_admin_natural
  ON proyeccion(anio, mes, (COALESCE(ms, '')), (COALESCE(cliente, '')), (COALESCE(proyecto, '')), (COALESCE(producto, '')), (COALESCE(tipo_cp, '')), (COALESCE(cp, '')));

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
  created_at TEXT DEFAULT (CURRENT_TIMESTAMP::text),
  updated_at TEXT DEFAULT (CURRENT_TIMESTAMP::text),
  UNIQUE(anio, mes)
);

CREATE TABLE IF NOT EXISTS proyeccion_configuracion (
  id TEXT PRIMARY KEY,
  cliente_id TEXT REFERENCES cliente(id),
  ms TEXT,
  anio INTEGER NOT NULL,
  modo_uf TEXT NOT NULL DEFAULT 'PROYECTADA',
  uf_fija_default REAL,
  created_at TEXT DEFAULT (CURRENT_TIMESTAMP::text),
  updated_at TEXT DEFAULT (CURRENT_TIMESTAMP::text)
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_proyeccion_configuracion_natural
  ON proyeccion_configuracion((COALESCE(cliente_id, '')), (COALESCE(ms, '')), anio);

CREATE TABLE IF NOT EXISTS proyeccion_auxiliar (
  id TEXT PRIMARY KEY,
  anio INTEGER NOT NULL,
  hoja TEXT NOT NULL,
  fila INTEGER NOT NULL,
  data_json TEXT NOT NULL,
  source TEXT,
  created_at TEXT DEFAULT (CURRENT_TIMESTAMP::text)
);

CREATE INDEX IF NOT EXISTS idx_proyeccion_auxiliar_anio_hoja
  ON proyeccion_auxiliar(anio, hoja, fila);
`),

  jsMigration('009', '009_admin_usernames.js', async client => {
    await addColumnIfMissing(client, 'app_user', 'username', 'TEXT');
    await client.query(`
      UPDATE app_user
      SET username = lower(
        CASE
          WHEN position('@' in email) > 0 THEN split_part(email, '@', 1)
          ELSE email
        END
      )
      WHERE username IS NULL OR username = '';

      CREATE UNIQUE INDEX IF NOT EXISTS idx_app_user_username_unique
        ON app_user(lower(username))
        WHERE username IS NOT NULL AND username <> '';
    `);

    await ensureAuthUser(client, {
      nombre: 'Administrador Valgian',
      username: 'valgian',
      password: INITIAL_USER_PASSWORD,
      rol: 'admin'
    });
    await ensureAuthUser(client, {
      nombre: 'Constanza Gaete',
      username: 'cgaete',
      password: INITIAL_USER_PASSWORD,
      rol: 'admin'
    });

    await client.query(`
      UPDATE app_user
      SET activo = 0,
          updated_at = CURRENT_TIMESTAMP::text
      WHERE lower(email) IN ('admin@facturapp.local', 'usuario@facturapp.local')
    `);
  }),

  sqlMigration('010', '010_round_projected_uf.sql', `
UPDATE proyeccion_uf
SET uf_proyectada = ROUND(uf_proyectada::numeric)::double precision,
    updated_at = CURRENT_TIMESTAMP::text
WHERE uf_proyectada IS NOT NULL;
`),

  sqlMigration('011', '011_proyecciones_versionadas.sql', `
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
  created_at TEXT DEFAULT (CURRENT_TIMESTAMP::text),
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
  created_at TEXT DEFAULT (CURRENT_TIMESTAMP::text),
  updated_at TEXT DEFAULT (CURRENT_TIMESTAMP::text)
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
  created_at TEXT DEFAULT (CURRENT_TIMESTAMP::text),
  updated_at TEXT DEFAULT (CURRENT_TIMESTAMP::text),
  UNIQUE(item_id, mes)
);

CREATE INDEX IF NOT EXISTS idx_proyeccion_mensual_item_mes
  ON proyeccion_mensual(item_id, mes);

INSERT INTO proyeccion_version (id, numero, nombre, fecha_version, anio, descripcion, activa, origen, created_by)
SELECT
  gen_random_uuid()::text,
  1,
  '1. Proyecciones Plataformas ' || to_char(CURRENT_DATE, 'DD.MM.YYYY'),
  CURRENT_DATE::text,
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
  gen_random_uuid()::text,
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
  gen_random_uuid()::text,
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
  AND COALESCE(pi.iva, '') = COALESCE(p.iva, '')
  AND COALESCE(pi.proyecto, '') = COALESCE(p.proyecto, '')
  AND COALESCE(pi.ms, '') = COALESCE(p.ms, '')
  AND COALESCE(pi.cliente, '') = COALESCE(p.cliente, '')
  AND COALESCE(pi.dp, '') = COALESCE(p.dp, '')
  AND COALESCE(pi.cp, '') = COALESCE(p.cp, '')
  AND COALESCE(pi.producto, '') = COALESCE(p.producto, '')
  AND COALESCE(pi.tipo_cp, '') = COALESCE(p.tipo_cp, '')
  AND COALESCE(pi.venta, -1) = COALESCE(p.venta, -1)
LEFT JOIN proyeccion_uf pu ON pu.anio = p.anio AND pu.mes = p.mes
WHERE NOT EXISTS (
  SELECT 1 FROM proyeccion_mensual pm WHERE pm.item_id = pi.id AND pm.mes = p.mes
);
`),

  sqlMigration('012', '012_proyecciones_orden_fila.js', `
ALTER TABLE proyeccion_item ADD COLUMN IF NOT EXISTS orden_fila INTEGER;

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
SET orden_fila = ordered.rn
FROM ordered
WHERE proyeccion_item.id = ordered.id
  AND proyeccion_item.orden_fila IS NULL;

CREATE INDEX IF NOT EXISTS idx_proyeccion_item_orden_fila
  ON proyeccion_item(version_id, orden_fila, id);
`),

  sqlMigration('013', '013_proyecciones_meta_anual.js', `
ALTER TABLE proyeccion_version ADD COLUMN IF NOT EXISTS meta_anual REAL;

UPDATE proyeccion_version
SET meta_anual = 725000000
WHERE anio = 2026
  AND meta_anual IS NULL;
`),

  jsMigration('014', '014_usuario_general.js', async client => {
    await ensureAuthUser(client, {
      nombre: 'Usuario General',
      username: 'usuario',
      password: INITIAL_USER_PASSWORD,
      rol: 'usuario'
    });
  }),

  jsMigration('015', '015_solicitud_montos_manual_hes.js', async client => {
    await addColumnIfMissing(client, 'solicitud_factura', 'monto_neto_clp_manual', 'REAL');
    await addColumnIfMissing(client, 'solicitud_cp', 'monto_clp_manual', 'REAL');
    await addColumnIfMissing(client, 'solicitud_cp', 'monto_clp_es_manual', 'INTEGER NOT NULL DEFAULT 0');
  }),

  sqlMigration('016', '016_cliente_datos_facturacion.js', `
CREATE TABLE IF NOT EXISTS cliente_facturacion (
  id TEXT PRIMARY KEY,
  cliente_id TEXT NOT NULL REFERENCES cliente(id) ON DELETE CASCADE,
  etiqueta TEXT,
  razon_social TEXT NOT NULL,
  rut TEXT,
  giro TEXT,
  direccion TEXT,
  activo INTEGER NOT NULL DEFAULT 1,
  created_at TEXT DEFAULT (CURRENT_TIMESTAMP::text),
  updated_at TEXT DEFAULT (CURRENT_TIMESTAMP::text)
);

CREATE INDEX IF NOT EXISTS idx_cliente_facturacion_cliente ON cliente_facturacion(cliente_id, activo);

ALTER TABLE solicitud_factura ADD COLUMN IF NOT EXISTS cliente_facturacion_id TEXT;

INSERT INTO cliente_facturacion
  (id, cliente_id, etiqueta, razon_social, rut, giro, direccion, activo)
SELECT
  gen_random_uuid()::text,
  aristia.id,
  'Datos cliente 2',
  'SERVICIOS EMPRESARIALES PUANGUE',
  '78.098.060-5',
  'Inversiones y Servicios de apoyo a las empresas.',
  'Los Carreras 444, melipilla.',
  1
FROM (
  SELECT id
  FROM cliente
  WHERE upper(nombre_corto) LIKE '%ARIZT%'
     OR upper(nombre_corto) LIKE '%ARIST%'
  LIMIT 1
) aristia
WHERE NOT EXISTS (
  SELECT 1
  FROM cliente_facturacion cf
  WHERE cf.cliente_id = aristia.id
    AND cf.rut = '78.098.060-5'
);
`),

  jsMigration('017', '017_coordinador_usuarios_cleanup.js', async client => {
    await addColumnIfMissing(client, 'app_user', 'username', 'TEXT');
    await client.query(`
      UPDATE app_user
      SET username = lower(
        CASE
          WHEN position('@' in email) > 0 THEN split_part(email, '@', 1)
          ELSE email
        END
      )
      WHERE username IS NULL OR username = '';

      CREATE UNIQUE INDEX IF NOT EXISTS idx_app_user_username_unique
        ON app_user(lower(username))
        WHERE username IS NOT NULL AND username <> '';
    `);

    const removeNames = new Set(['max_quijada', 'daniela_garcia']);
    const coordinadores = await client.query('SELECT id, nombre FROM coordinador');
    for (const row of coordinadores.rows) {
      if (!removeNames.has(key(row.nombre))) continue;
      await client.query('UPDATE cliente SET coordinador_id = NULL WHERE coordinador_id = $1', [row.id]);
      await client.query('UPDATE solicitud_factura SET coordinador_id = NULL WHERE coordinador_id = $1', [row.id]);
      await client.query('DELETE FROM cliente_coordinador WHERE coordinador_id = $1', [row.id]);
      await client.query('DELETE FROM coordinador WHERE id = $1', [row.id]);
    }

    const usernames = ['mquijada', 'maxquijada', 'dgarcia', 'danielagarcia'];
    await client.query(`
      DELETE FROM app_session
      WHERE user_id IN (
        SELECT id
        FROM app_user
        WHERE lower(COALESCE(username, email)) = ANY($1::text[])
           OR lower(email) = ANY($1::text[])
      )
    `, [usernames]);
    await client.query(`
      DELETE FROM app_user
      WHERE lower(COALESCE(username, email)) = ANY($1::text[])
         OR lower(email) = ANY($1::text[])
    `, [usernames]);

    const users = new Map([
      ['constanza_gaete', { nombre: 'Constanza Gaete', username: 'cgaete', rol: 'admin' }],
      ['daniel_llanes', { nombre: 'Daniel Llanes', username: 'dllanes', rol: 'usuario' }],
      ['macarena_abasolo', { nombre: 'Macarena Abasolo', username: 'mabasolo', rol: 'usuario' }],
      ['monica_da_rocha', { nombre: 'Monica Da Rocha', username: 'mdarocha', rol: 'usuario' }],
      ['mas_finanzas', { nombre: 'MAS Finanzas', username: 'masfinanzas', rol: 'usuario' }]
    ]);

    const activeCoordinadores = await client.query('SELECT nombre FROM coordinador WHERE activo = 1');
    for (const row of activeCoordinadores.rows) {
      const mapped = users.get(key(row.nombre));
      if (mapped) await ensureMappedUser(client, mapped);
    }

    await ensureMappedUser(client, users.get('constanza_gaete'));
    await ensureMappedUser(client, users.get('daniel_llanes'));
    await ensureMappedUser(client, users.get('macarena_abasolo'));
    await ensureMappedUser(client, users.get('monica_da_rocha'));
  }),

  sqlMigration('018', '018_renombrar_usuario_valeria.js', `
UPDATE app_user
SET nombre = 'Valeria Giannattasio',
    username = 'vgianna',
    email = 'vgianna',
    updated_at = CURRENT_TIMESTAMP::text
WHERE id = (
  SELECT id
  FROM app_user
  WHERE lower(COALESCE(username, email)) = 'valgian'
     OR lower(email) = 'valgian'
     OR nombre = 'Administrador Valgian'
  LIMIT 1
);
`),

  jsMigration('019', '019_usuario_coordinador_scope.js', async client => {
    await addColumnIfMissing(client, 'app_user', 'coordinador_id', 'TEXT REFERENCES coordinador(id)');
    await addColumnIfMissing(client, 'cliente_coordinador', 'cp_nombre', 'TEXT');
    await client.query('CREATE INDEX IF NOT EXISTS idx_cliente_coord_cp_nombre ON cliente_coordinador(cliente_id, cp_nombre, activo)');

    async function setUserCoordinator(username, coordinatorName) {
      const targetKey = key(coordinatorName);
      const coordinadores = await client.query('SELECT id, nombre FROM coordinador');
      const coordinator = coordinadores.rows.find(row => key(row.nombre) === targetKey);
      if (!coordinator) return;

      await client.query(`
        UPDATE app_user
        SET coordinador_id = $1,
            updated_at = CURRENT_TIMESTAMP::text
        WHERE lower(COALESCE(username, email)) = lower($2)
           OR lower(email) = lower($3)
      `, [coordinator.id, username, username]);
    }

    await setUserCoordinator('cgaete', 'CONSTANZA GAETE');
    await setUserCoordinator('dllanes', 'DANIEL LLANES');
    await setUserCoordinator('mabasolo', 'MACARENA ABASOLO');
    await setUserCoordinator('mdarocha', 'MONICA DA ROCHA');
    await setUserCoordinator('masfinanzas', 'MAS FINANZAS');

    const solicitudes = await client.query(`
      SELECT id, cliente_id
      FROM solicitud_factura
      WHERE is_delete = 0
        AND coordinador_id IS NULL
    `);

    for (const row of solicitudes.rows) {
      const cps = await client.query(`
        SELECT DISTINCT cp.nombre
        FROM solicitud_cp sc
        JOIN cp ON cp.id = sc.cp_id
        WHERE sc.solicitud_id = $1
        ORDER BY cp.nombre
      `, [row.id]);

      let coordinatorId = null;
      for (const cp of cps.rows) {
        const exact = await client.query(`
          SELECT cc.coordinador_id
          FROM cliente_coordinador cc
          JOIN coordinador co ON co.id = cc.coordinador_id
          WHERE cc.cliente_id = $1
            AND cc.cp_nombre = $2
            AND cc.activo = 1
            AND co.activo = 1
          ORDER BY lower(co.nombre)
          LIMIT 1
        `, [row.cliente_id, cp.nombre || '']);
        if (exact.rowCount) {
          coordinatorId = exact.rows[0].coordinador_id;
          break;
        }
      }

      if (!coordinatorId) {
        const fallback = await client.query(`
          SELECT cc.coordinador_id
          FROM cliente_coordinador cc
          JOIN coordinador co ON co.id = cc.coordinador_id
          WHERE cc.cliente_id = $1
            AND (cc.cp_nombre IS NULL OR cc.cp_nombre = '')
            AND cc.activo = 1
            AND co.activo = 1
          ORDER BY lower(co.nombre)
          LIMIT 1
        `, [row.cliente_id]);
        if (fallback.rowCount) coordinatorId = fallback.rows[0].coordinador_id;
      }

      if (coordinatorId) {
        await client.query(`
          UPDATE solicitud_factura
          SET coordinador_id = $1,
              updated_at = CURRENT_TIMESTAMP::text
          WHERE id = $2
        `, [coordinatorId, row.id]);
      }
    }
  }),

  jsMigration('020', '020_slack_bot_config.js', async client => {
    await client.query(`
      CREATE TABLE IF NOT EXISTS app_config (
        key TEXT PRIMARY KEY,
        value TEXT,
        updated_at TEXT DEFAULT (CURRENT_TIMESTAMP::text)
      );

      CREATE TABLE IF NOT EXISTS slack_notificacion_log (
        id TEXT PRIMARY KEY,
        solicitud_id TEXT REFERENCES solicitud_factura(id),
        channel_id TEXT,
        coordinador_id TEXT REFERENCES coordinador(id),
        slack_user_id TEXT,
        message_ts TEXT,
        status TEXT NOT NULL,
        error TEXT,
        texto TEXT,
        created_at TEXT DEFAULT (CURRENT_TIMESTAMP::text)
      );

      CREATE INDEX IF NOT EXISTS idx_slack_log_solicitud
        ON slack_notificacion_log(solicitud_id, created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_slack_log_status
        ON slack_notificacion_log(status, created_at DESC);
    `);

    const configs = [
      ['slack_habilitado', '0'],
      ['slack_channel_id', process.env.SLACK_CHANNEL_ID || 'C09P7PNF7GA'],
      ['slack_dias_anticipacion', '5'],
      ['slack_base_url', process.env.APP_PUBLIC_URL || ''],
      ['slack_mensaje_intro', 'es momento de revisar esta solicitud de factura.'],
      ['slack_mensaje_pie', 'Actualiza el estado directamente en FactuFlow.'],
      ['slack_version_config', crypto.randomUUID()]
    ];

    for (const [configKey, value] of configs) {
      await client.query(`
        INSERT INTO app_config (key, value)
        VALUES ($1, $2)
        ON CONFLICT (key) DO NOTHING
      `, [configKey, value]);
    }
  }),

  jsMigration('021', '021_enaex_facturacion_sigdo_cleanup.js', async client => {
    async function findCliente(nombre) {
      const result = await client.query(`
        SELECT *
        FROM cliente
        WHERE upper(trim(nombre_corto)) = upper(trim($1))
        LIMIT 1
      `, [nombre]);
      return result.rows[0] || null;
    }

    async function mergeClienteReferences(fromId, toId) {
      if (!fromId || !toId || fromId === toId) return;
      await client.query('UPDATE solicitud_factura SET cliente_id = $1 WHERE cliente_id = $2', [toId, fromId]);
      await client.query('UPDATE cp SET cliente_id = $1 WHERE cliente_id = $2', [toId, fromId]);
      await client.query('UPDATE proyeccion_facturacion SET cliente_id = $1 WHERE cliente_id = $2', [toId, fromId]);
      await client.query('UPDATE solicitud_programada SET cliente_id = $1 WHERE cliente_id = $2', [toId, fromId]);

      const productos = await client.query('SELECT id, producto_id FROM cliente_producto WHERE cliente_id = $1', [fromId]);
      for (const link of productos.rows) {
        const exists = await client.query('SELECT id FROM cliente_producto WHERE cliente_id = $1 AND producto_id = $2 LIMIT 1', [toId, link.producto_id]);
        if (exists.rowCount) await client.query('DELETE FROM cliente_producto WHERE id = $1', [link.id]);
        else await client.query('UPDATE cliente_producto SET cliente_id = $1 WHERE id = $2', [toId, link.id]);
      }

      const coordinadores = await client.query('SELECT id, coordinador_id, cp_id, cp_nombre FROM cliente_coordinador WHERE cliente_id = $1', [fromId]);
      for (const link of coordinadores.rows) {
        const exists = link.cp_nombre
          ? await client.query('SELECT id FROM cliente_coordinador WHERE cliente_id = $1 AND coordinador_id = $2 AND cp_nombre = $3 LIMIT 1', [toId, link.coordinador_id, link.cp_nombre])
          : await client.query('SELECT id FROM cliente_coordinador WHERE cliente_id = $1 AND coordinador_id = $2 AND cp_nombre IS NULL LIMIT 1', [toId, link.coordinador_id]);
        if (exists.rowCount) await client.query('DELETE FROM cliente_coordinador WHERE id = $1', [link.id]);
        else await client.query('UPDATE cliente_coordinador SET cliente_id = $1 WHERE id = $2', [toId, link.id]);
      }

      await client.query('UPDATE receptor SET cliente_id = $1 WHERE cliente_id = $2', [toId, fromId]);
    }

    async function deleteCliente(clienteId) {
      if (!clienteId) return;
      await client.query('DELETE FROM cliente_facturacion WHERE cliente_id = $1', [clienteId]);
      await client.query('DELETE FROM receptor WHERE cliente_id = $1', [clienteId]);
      await client.query('DELETE FROM cliente_coordinador WHERE cliente_id = $1', [clienteId]);
      await client.query('DELETE FROM cliente_producto WHERE cliente_id = $1', [clienteId]);
      await client.query('DELETE FROM cp WHERE cliente_id = $1', [clienteId]);
      await client.query('DELETE FROM proyeccion_facturacion WHERE cliente_id = $1', [clienteId]);
      await client.query('DELETE FROM solicitud_programada WHERE cliente_id = $1', [clienteId]);
      await client.query('DELETE FROM cliente WHERE id = $1', [clienteId]);
    }

    const enaex = await findCliente('ENAEX');
    const enaexServicios = await findCliente('ENAEX SERVICIOS SA');
    if (enaex && enaexServicios) {
      const existing = await client.query(`
        SELECT id
        FROM cliente_facturacion
        WHERE cliente_id = $1
          AND rut = $2
        LIMIT 1
      `, [enaex.id, enaexServicios.rut]);

      if (!existing.rowCount) {
        await client.query(`
          INSERT INTO cliente_facturacion
            (id, cliente_id, etiqueta, razon_social, rut, giro, direccion, activo)
          VALUES (gen_random_uuid()::text, $1, $2, $3, $4, $5, $6, 1)
        `, [
          enaex.id,
          'Datos cliente 2',
          enaexServicios.razon_social || enaexServicios.nombre_corto,
          enaexServicios.rut,
          enaexServicios.giro,
          enaexServicios.direccion
        ]);
      }

      await mergeClienteReferences(enaexServicios.id, enaex.id);
      await deleteCliente(enaexServicios.id);
    }

    const sigdo = await findCliente('SIGDO KOPPERS');
    if (sigdo) await deleteCliente(sigdo.id);
  }),

  jsMigration('022', '022_database_normalization_and_guards.js', async client => {
    await client.query(`
      UPDATE schema_migrations
      SET checksum = $1
      WHERE version = '005'
    `, [migrationChecksum('005_operational_catalogs.js')]);

    await client.query(`
      UPDATE app_session
      SET revoked_at = CURRENT_TIMESTAMP::text
      WHERE revoked_at IS NULL
        AND expires_at IS NOT NULL
        AND expires_at <= CURRENT_TIMESTAMP::text
    `);

    const duplicateGroups = await client.query(`
      SELECT cliente_id, lower(trim(email)) AS email_key
      FROM receptor
      WHERE activo = 1
      GROUP BY cliente_id, lower(trim(email))
      HAVING COUNT(*) > 1
    `);
    for (const group of duplicateGroups.rows) {
      const rows = await client.query(`
        SELECT id
        FROM receptor
        WHERE cliente_id = $1
          AND lower(trim(email)) = $2
          AND activo = 1
        ORDER BY created_at, id
      `, [group.cliente_id, group.email_key]);
      const keep = rows.rows[0] && rows.rows[0].id;
      for (const row of rows.rows.slice(1)) {
        await client.query(`
          INSERT INTO solicitud_receptor (solicitud_id, receptor_id)
          SELECT solicitud_id, $1
          FROM solicitud_receptor
          WHERE receptor_id = $2
          ON CONFLICT DO NOTHING
        `, [keep, row.id]);
        await client.query('DELETE FROM solicitud_receptor WHERE receptor_id = $1', [row.id]);
        await client.query('UPDATE receptor SET activo = 0 WHERE id = $1', [row.id]);
      }
    }

    const solicitudesSinReceptor = await client.query(`
      SELECT id, folio, cliente_id, estado
      FROM solicitud_factura
      WHERE is_delete = 0
        AND NOT EXISTS (
          SELECT 1 FROM solicitud_receptor sr WHERE sr.solicitud_id = solicitud_factura.id
        )
    `);
    for (const solicitud of solicitudesSinReceptor.rows) {
      const receptors = await client.query('SELECT id FROM receptor WHERE cliente_id = $1 AND activo = 1 ORDER BY nombre, id', [solicitud.cliente_id]);
      if (receptors.rowCount) {
        for (const receptor of receptors.rows) {
          await client.query(`
            INSERT INTO solicitud_receptor (solicitud_id, receptor_id)
            VALUES ($1, $2)
            ON CONFLICT DO NOTHING
          `, [solicitud.id, receptor.id]);
        }
        await client.query(`
          INSERT INTO historial_estado (id, solicitud_id, estado_desde, estado_hacia, usuario, comentario)
          VALUES (gen_random_uuid()::text, $1, $2, $3, $4, $5)
        `, [solicitud.id, solicitud.estado, solicitud.estado, 'migration-022', 'Receptores activos del cliente asociados por normalizacion de BD']);
        continue;
      }

      await client.query(`
        UPDATE solicitud_factura
        SET is_delete = 1,
            updated_at = CURRENT_TIMESTAMP::text,
            observaciones = trim(COALESCE(observaciones, '') || chr(10) || $1)
        WHERE id = $2
      `, ['Inactivada por normalizacion de BD: cliente sin receptores activos.', solicitud.id]);
      await client.query(`
        INSERT INTO historial_estado (id, solicitud_id, estado_desde, estado_hacia, usuario, comentario)
        VALUES (gen_random_uuid()::text, $1, $2, $3, $4, $5)
      `, [solicitud.id, solicitud.estado, solicitud.estado, 'migration-022', 'Solicitud inactivada: no tenia receptores y el cliente no tiene receptores activos']);
    }

    const missingUf = await client.query(`
      WITH months(m) AS (VALUES (1),(2),(3),(4),(5),(6),(7),(8),(9),(10),(11),(12))
      SELECT m AS mes
      FROM months
      WHERE NOT EXISTS (
        SELECT 1
        FROM proyeccion_uf
        WHERE anio = 2026
          AND mes = m
          AND (uf_manual IS NOT NULL OR uf_proyectada IS NOT NULL OR uf_fija IS NOT NULL)
      )
    `);
    for (const row of missingUf.rows) {
      const fallback = await client.query(`
        SELECT COALESCE(uf_manual, uf_proyectada, uf_fija) AS uf
        FROM proyeccion_uf
        WHERE anio = 2026
          AND COALESCE(uf_manual, uf_proyectada, uf_fija) IS NOT NULL
        ORDER BY ABS(mes - $1), CASE WHEN mes <= $2 THEN 0 ELSE 1 END, mes DESC
        LIMIT 1
      `, [row.mes, row.mes]);
      if (!fallback.rowCount || !fallback.rows[0].uf) continue;
      await client.query(`
        INSERT INTO proyeccion_uf (id, anio, mes, uf_proyectada, origen_valor, observaciones)
        VALUES (gen_random_uuid()::text, 2026, $1, $2, 'PROYECTADA', $3)
        ON CONFLICT (anio, mes) DO UPDATE SET
          uf_proyectada = EXCLUDED.uf_proyectada,
          origen_valor = EXCLUDED.origen_valor,
          observaciones = EXCLUDED.observaciones,
          updated_at = CURRENT_TIMESTAMP::text
        WHERE proyeccion_uf.uf_manual IS NULL
          AND proyeccion_uf.uf_proyectada IS NULL
          AND proyeccion_uf.uf_fija IS NULL
      `, [row.mes, Math.round(Number(fallback.rows[0].uf)), 'Completada por normalizacion de BD usando UF proyectada cercana.']);
    }

    await client.query(`
      UPDATE proyeccion_version
      SET activa = 0
      WHERE activa = 1
        AND NOT EXISTS (
          SELECT 1 FROM proyeccion_item pi WHERE pi.version_id = proyeccion_version.id
        )
    `);

    await client.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS uq_receptor_cliente_email_activo
        ON receptor(cliente_id, lower(trim(email)))
        WHERE activo = 1;

      CREATE UNIQUE INDEX IF NOT EXISTS uq_proyeccion_uf_anio_mes
        ON proyeccion_uf(anio, mes);

      CREATE UNIQUE INDEX IF NOT EXISTS uq_proyeccion_version_activa_anio
        ON proyeccion_version(anio)
        WHERE activa = 1;

      CREATE INDEX IF NOT EXISTS idx_sol_cliente_facturacion
        ON solicitud_factura(cliente_facturacion_id);

      CREATE INDEX IF NOT EXISTS idx_sol_programada
        ON solicitud_factura(programada_id);

      CREATE OR REPLACE FUNCTION enforce_solicitud_receptor_cliente()
      RETURNS trigger AS $$
      BEGIN
        IF (
          SELECT r.cliente_id
          FROM receptor r
          WHERE r.id = NEW.receptor_id
        ) IS DISTINCT FROM (
          SELECT sf.cliente_id
          FROM solicitud_factura sf
          WHERE sf.id = NEW.solicitud_id
        ) THEN
          RAISE EXCEPTION 'Receptor no pertenece al cliente de la solicitud';
        END IF;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;

      DROP TRIGGER IF EXISTS trg_solicitud_receptor_cliente_insert ON solicitud_receptor;
      CREATE TRIGGER trg_solicitud_receptor_cliente_insert
      BEFORE INSERT ON solicitud_receptor
      FOR EACH ROW
      EXECUTE FUNCTION enforce_solicitud_receptor_cliente();

      DROP TRIGGER IF EXISTS trg_solicitud_receptor_cliente_update ON solicitud_receptor;
      CREATE TRIGGER trg_solicitud_receptor_cliente_update
      BEFORE UPDATE ON solicitud_receptor
      FOR EACH ROW
      EXECUTE FUNCTION enforce_solicitud_receptor_cliente();

      CREATE OR REPLACE FUNCTION enforce_solicitud_cp_cliente()
      RETURNS trigger AS $$
      BEGIN
        IF (
          SELECT cp.cliente_id
          FROM cp
          WHERE cp.id = NEW.cp_id
        ) IS DISTINCT FROM (
          SELECT sf.cliente_id
          FROM solicitud_factura sf
          WHERE sf.id = NEW.solicitud_id
        ) THEN
          RAISE EXCEPTION 'CP no pertenece al cliente de la solicitud';
        END IF;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;

      DROP TRIGGER IF EXISTS trg_solicitud_cp_cliente_insert ON solicitud_cp;
      CREATE TRIGGER trg_solicitud_cp_cliente_insert
      BEFORE INSERT ON solicitud_cp
      FOR EACH ROW
      EXECUTE FUNCTION enforce_solicitud_cp_cliente();

      DROP TRIGGER IF EXISTS trg_solicitud_cp_cliente_update ON solicitud_cp;
      CREATE TRIGGER trg_solicitud_cp_cliente_update
      BEFORE UPDATE ON solicitud_cp
      FOR EACH ROW
      EXECUTE FUNCTION enforce_solicitud_cp_cliente();

      CREATE OR REPLACE FUNCTION enforce_solicitud_cliente_facturacion()
      RETURNS trigger AS $$
      BEGIN
        IF NEW.cliente_facturacion_id IS NOT NULL
          AND NOT EXISTS (
            SELECT 1
            FROM cliente_facturacion cf
            WHERE cf.id = NEW.cliente_facturacion_id
              AND cf.cliente_id = NEW.cliente_id
              AND cf.activo = 1
          ) THEN
          RAISE EXCEPTION 'Datos de facturacion no pertenecen al cliente de la solicitud';
        END IF;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;

      DROP TRIGGER IF EXISTS trg_solicitud_cliente_facturacion_insert ON solicitud_factura;
      CREATE TRIGGER trg_solicitud_cliente_facturacion_insert
      BEFORE INSERT ON solicitud_factura
      FOR EACH ROW
      EXECUTE FUNCTION enforce_solicitud_cliente_facturacion();

      DROP TRIGGER IF EXISTS trg_solicitud_cliente_facturacion_update ON solicitud_factura;
      CREATE TRIGGER trg_solicitud_cliente_facturacion_update
      BEFORE UPDATE OF cliente_id, cliente_facturacion_id ON solicitud_factura
      FOR EACH ROW
      EXECUTE FUNCTION enforce_solicitud_cliente_facturacion();

      CREATE OR REPLACE FUNCTION enforce_solicitud_programada_cliente()
      RETURNS trigger AS $$
      BEGIN
        IF NEW.programada_id IS NOT NULL
          AND NOT EXISTS (
            SELECT 1
            FROM solicitud_programada sp
            WHERE sp.id = NEW.programada_id
              AND sp.cliente_id = NEW.cliente_id
          ) THEN
          RAISE EXCEPTION 'Solicitud programada no pertenece al cliente de la solicitud';
        END IF;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;

      DROP TRIGGER IF EXISTS trg_solicitud_programada_cliente_insert ON solicitud_factura;
      CREATE TRIGGER trg_solicitud_programada_cliente_insert
      BEFORE INSERT ON solicitud_factura
      FOR EACH ROW
      EXECUTE FUNCTION enforce_solicitud_programada_cliente();

      DROP TRIGGER IF EXISTS trg_solicitud_programada_cliente_update ON solicitud_factura;
      CREATE TRIGGER trg_solicitud_programada_cliente_update
      BEFORE UPDATE OF cliente_id, programada_id ON solicitud_factura
      FOR EACH ROW
      EXECUTE FUNCTION enforce_solicitud_programada_cliente();
    `);

    if (await tableHasColumn(client, 'app_user', 'coordinador_id')) {
      await client.query('CREATE INDEX IF NOT EXISTS idx_app_user_coordinador ON app_user(coordinador_id)');
    }
  }),

  sqlMigration('023', '023_instituto_roi_empresa_emisora.js', `
INSERT INTO empresa_emisora (codigo, razon_social, rut, giro, direccion, telefono, afecto_iva, iva_pct)
VALUES (
  'INSTITUTO_ROI',
  'INSTITUTO ROI SPA',
  '76.455.718-2',
  'Servicios de Asesoria, Consultoria, Investigacion, Desarrollo y Publicaciones de Materias afines',
  NULL,
  NULL,
  1,
  0.19
)
ON CONFLICT (codigo) DO UPDATE SET
  razon_social = EXCLUDED.razon_social,
  rut = COALESCE(EXCLUDED.rut, empresa_emisora.rut),
  giro = COALESCE(EXCLUDED.giro, empresa_emisora.giro),
  direccion = COALESCE(EXCLUDED.direccion, empresa_emisora.direccion),
  telefono = COALESCE(EXCLUDED.telefono, empresa_emisora.telefono),
  afecto_iva = EXCLUDED.afecto_iva,
  iva_pct = EXCLUDED.iva_pct;

UPDATE solicitud_factura
SET empresa_emisora = 'INSTITUTO_ROI'
WHERE empresa_emisora = 'INSTITUTO_ROY';
`),

  jsMigration('024', '024_set_all_users_mas2026.js', async client => {
    const users = await client.query(`
      SELECT id, username, email
      FROM app_user
    `);

    for (const user of users.rows) {
      const identifier = clean(user.username || user.email || user.id).toLowerCase();
      const normalized = key(identifier).replace(/_/g, '').slice(0, 40) || user.id;
      const salt = `facturapp-${normalized}-mas2026`;
      const passwordHash = hashPassword(INITIAL_USER_PASSWORD, salt);
      await client.query(`
        UPDATE app_user
        SET password_hash = $1,
            password_salt = $2,
            updated_at = CURRENT_TIMESTAMP::text
        WHERE id = $3
      `, [passwordHash, salt, user.id]);
    }

    await client.query(`
      UPDATE app_session
      SET revoked_at = CURRENT_TIMESTAMP::text
      WHERE revoked_at IS NULL
    `);
  })
];

async function ensurePostgresMigrationsTable(client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      checksum TEXT,
      applied_at TEXT DEFAULT (CURRENT_TIMESTAMP::text)
    )
  `);
}

async function runPostgresMigrations(client, options = {}) {
  const log = options.log || (() => {});
  await ensurePostgresMigrationsTable(client);

  let applied = 0;
  for (const migration of migrations) {
    const existing = await client.query(
      'SELECT version, checksum FROM schema_migrations WHERE version = $1',
      [migration.version]
    );
    if (existing.rowCount) continue;

    await client.query('BEGIN');
    try {
      await migration.up(client);
      await client.query(
        'INSERT INTO schema_migrations (version, name, checksum) VALUES ($1, $2, $3)',
        [migration.version, migration.name, migration.checksum]
      );
      await client.query('COMMIT');
      applied += 1;
      log(`Aplicada migracion PostgreSQL ${migration.name}`);
    } catch (error) {
      await client.query('ROLLBACK');
      error.message = `Error aplicando migracion PostgreSQL ${migration.name}: ${error.message}`;
      throw error;
    }
  }

  return { applied, total: migrations.length };
}

module.exports = {
  ensurePostgresMigrationsTable,
  migrations,
  runPostgresMigrations
};
