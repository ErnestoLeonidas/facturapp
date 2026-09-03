require('./config/env');

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const { DatabaseSync } = require('node:sqlite');
const env = require('./config/env');
const { createPostgresClient } = require('./postgres');

const BACKUP_PREFIX = 'postgres-pre-sqlite-migration';
const MAX_SAMPLE_ROWS = 10;

const TABLE_PLAN = [
  { table: 'empresa_emisora', label: 'empresa_emisora' },
  { table: 'coordinador', label: 'coordinadores' },
  { table: 'cliente', label: 'clientes' },
  { table: 'producto', label: 'productos' },
  { table: 'cp', label: 'cp' },
  { table: 'cliente_facturacion', label: 'cliente_facturacion' },
  { table: 'cliente_producto', label: 'cliente_producto' },
  { table: 'cliente_coordinador', label: 'cliente_coordinador' },
  { table: 'receptor', label: 'receptores' },
  { table: 'uf_cache', label: 'uf_cache' },
  { table: 'proyeccion_uf', label: 'proyeccion_uf' },
  { table: 'solicitud_factura', label: 'solicitudes' },
  { table: 'solicitud_cp', label: 'solicitud_cp' },
  { table: 'solicitud_item', label: 'solicitud_item' },
  { table: 'solicitud_receptor', label: 'solicitud_receptor' },
  { table: 'historial_estado', label: 'historial' },
  { table: 'documento_exportado', label: 'documento_exportado' },
  { table: 'proyeccion', label: 'proyeccion_legacy' },
  { table: 'proyeccion_auxiliar', label: 'proyeccion_auxiliar' },
  { table: 'proyeccion_version', label: 'proyeccion_version' },
  { table: 'proyeccion_item', label: 'proyeccion_item' },
  { table: 'proyeccion_mensual', label: 'proyeccion_mensual' }
];

const EXCLUDED_TABLES = new Set([
  'app_config',
  'app_session',
  'app_user',
  'audit_log',
  'bitacora_integracion',
  'catalogo_estado_solicitud',
  'catalogo_tipo_cp',
  'catalogo_tipo_impuesto',
  'schema_migrations',
  'slack_notificacion_log'
]);

const NATURAL_KEY_CHECKS = [
  { table: 'empresa_emisora', key: ['codigo'], pk: ['codigo'] },
  { table: 'cliente', key: ['nombre_corto'], pk: ['id'] },
  { table: 'producto', key: ['codigo'], pk: ['id'] },
  { table: 'cp', key: ['codigo'], pk: ['id'] },
  { table: 'uf_cache', key: ['fecha'], pk: ['fecha'] },
  { table: 'proyeccion_uf', key: ['anio', 'mes'], pk: ['id'] },
  { table: 'solicitud_factura', key: ['folio'], pk: ['id'] },
  { table: 'solicitud_cp', key: ['solicitud_id', 'cp_id'], pk: ['id'] },
  { table: 'solicitud_receptor', key: ['solicitud_id', 'receptor_id'], pk: ['solicitud_id', 'receptor_id'] },
  { table: 'proyeccion_version', key: ['anio', 'numero'], pk: ['id'] },
  { table: 'proyeccion_mensual', key: ['item_id', 'mes'], pk: ['id'] }
];

const RELATIONSHIP_CHECKS = [
  {
    name: 'cliente.coordinador_id -> coordinador.id',
    required: { cliente: ['id', 'coordinador_id'], coordinador: ['id'] },
    sql: `
      SELECT c.id AS cliente_id, c.coordinador_id
      FROM cliente c
      LEFT JOIN coordinador co ON co.id = c.coordinador_id
      WHERE c.coordinador_id IS NOT NULL
        AND trim(c.coordinador_id) <> ''
        AND co.id IS NULL
    `
  },
  {
    name: 'cp.cliente_id -> cliente.id',
    required: { cp: ['id', 'cliente_id'], cliente: ['id'] },
    sql: `
      SELECT cp.id AS cp_id, cp.cliente_id
      FROM cp
      LEFT JOIN cliente c ON c.id = cp.cliente_id
      WHERE cp.cliente_id IS NOT NULL
        AND trim(cp.cliente_id) <> ''
        AND c.id IS NULL
    `
  },
  {
    name: 'cliente_coordinador.cliente_id -> cliente.id',
    required: { cliente_coordinador: ['id', 'cliente_id'], cliente: ['id'] },
    sql: `
      SELECT cc.id, cc.cliente_id
      FROM cliente_coordinador cc
      LEFT JOIN cliente c ON c.id = cc.cliente_id
      WHERE c.id IS NULL
    `
  },
  {
    name: 'cliente_coordinador.coordinador_id -> coordinador.id',
    required: { cliente_coordinador: ['id', 'coordinador_id'], coordinador: ['id'] },
    sql: `
      SELECT cc.id, cc.coordinador_id
      FROM cliente_coordinador cc
      LEFT JOIN coordinador co ON co.id = cc.coordinador_id
      WHERE co.id IS NULL
    `
  },
  {
    name: 'cliente_coordinador.cp_id -> cp.id',
    required: { cliente_coordinador: ['id', 'cp_id'], cp: ['id'] },
    sql: `
      SELECT cc.id, cc.cp_id
      FROM cliente_coordinador cc
      LEFT JOIN cp ON cp.id = cc.cp_id
      WHERE cc.cp_id IS NOT NULL
        AND trim(cc.cp_id) <> ''
        AND cp.id IS NULL
    `
  },
  {
    name: 'cliente_facturacion.cliente_id -> cliente.id',
    required: { cliente_facturacion: ['id', 'cliente_id'], cliente: ['id'] },
    sql: `
      SELECT cf.id, cf.cliente_id
      FROM cliente_facturacion cf
      LEFT JOIN cliente c ON c.id = cf.cliente_id
      WHERE c.id IS NULL
    `
  },
  {
    name: 'cliente_producto.cliente_id -> cliente.id',
    required: { cliente_producto: ['id', 'cliente_id'], cliente: ['id'] },
    sql: `
      SELECT cp.id, cp.cliente_id
      FROM cliente_producto cp
      LEFT JOIN cliente c ON c.id = cp.cliente_id
      WHERE c.id IS NULL
    `
  },
  {
    name: 'cliente_producto.producto_id -> producto.id',
    required: { cliente_producto: ['id', 'producto_id'], producto: ['id'] },
    sql: `
      SELECT cp.id, cp.producto_id
      FROM cliente_producto cp
      LEFT JOIN producto p ON p.id = cp.producto_id
      WHERE p.id IS NULL
    `
  },
  {
    name: 'receptor.cliente_id -> cliente.id',
    required: { receptor: ['id', 'cliente_id'], cliente: ['id'] },
    sql: `
      SELECT r.id AS receptor_id, r.cliente_id
      FROM receptor r
      LEFT JOIN cliente c ON c.id = r.cliente_id
      WHERE c.id IS NULL
    `
  },
  {
    name: 'solicitud_factura.cliente_id -> cliente.id',
    required: { solicitud_factura: ['id', 'cliente_id'], cliente: ['id'] },
    sql: `
      SELECT sf.id AS solicitud_id, sf.cliente_id
      FROM solicitud_factura sf
      LEFT JOIN cliente c ON c.id = sf.cliente_id
      WHERE c.id IS NULL
    `
  },
  {
    name: 'solicitud_factura.coordinador_id -> coordinador.id',
    required: { solicitud_factura: ['id', 'coordinador_id'], coordinador: ['id'] },
    sql: `
      SELECT sf.id AS solicitud_id, sf.coordinador_id
      FROM solicitud_factura sf
      LEFT JOIN coordinador co ON co.id = sf.coordinador_id
      WHERE sf.coordinador_id IS NOT NULL
        AND trim(sf.coordinador_id) <> ''
        AND co.id IS NULL
    `
  },
  {
    name: 'solicitud_factura.empresa_emisora -> empresa_emisora.codigo',
    required: { solicitud_factura: ['id', 'empresa_emisora'], empresa_emisora: ['codigo'] },
    sql: `
      SELECT sf.id AS solicitud_id, sf.empresa_emisora
      FROM solicitud_factura sf
      LEFT JOIN empresa_emisora ee ON ee.codigo = sf.empresa_emisora
      WHERE ee.codigo IS NULL
    `
  },
  {
    name: 'solicitud_factura.cliente_facturacion_id -> cliente_facturacion.id',
    required: { solicitud_factura: ['id', 'cliente_facturacion_id'], cliente_facturacion: ['id'] },
    sql: `
      SELECT sf.id AS solicitud_id, sf.cliente_facturacion_id
      FROM solicitud_factura sf
      LEFT JOIN cliente_facturacion cf ON cf.id = sf.cliente_facturacion_id
      WHERE sf.cliente_facturacion_id IS NOT NULL
        AND trim(sf.cliente_facturacion_id) <> ''
        AND cf.id IS NULL
    `
  },
  {
    name: 'solicitud_cp.solicitud_id -> solicitud_factura.id',
    required: { solicitud_cp: ['id', 'solicitud_id'], solicitud_factura: ['id'] },
    sql: `
      SELECT sc.id, sc.solicitud_id
      FROM solicitud_cp sc
      LEFT JOIN solicitud_factura sf ON sf.id = sc.solicitud_id
      WHERE sf.id IS NULL
    `
  },
  {
    name: 'solicitud_cp.cp_id -> cp.id',
    required: { solicitud_cp: ['id', 'cp_id'], cp: ['id'] },
    sql: `
      SELECT sc.id, sc.cp_id
      FROM solicitud_cp sc
      LEFT JOIN cp ON cp.id = sc.cp_id
      WHERE cp.id IS NULL
    `
  },
  {
    name: 'solicitud_cp cliente consistente',
    required: { solicitud_cp: ['id', 'solicitud_id', 'cp_id'], solicitud_factura: ['id', 'cliente_id'], cp: ['id', 'cliente_id'] },
    sql: `
      SELECT sc.id, sc.solicitud_id, sc.cp_id, sf.cliente_id AS solicitud_cliente_id, cp.cliente_id AS cp_cliente_id
      FROM solicitud_cp sc
      JOIN solicitud_factura sf ON sf.id = sc.solicitud_id
      JOIN cp ON cp.id = sc.cp_id
      WHERE sf.cliente_id <> cp.cliente_id
    `
  },
  {
    name: 'solicitud_item.solicitud_id -> solicitud_factura.id',
    required: { solicitud_item: ['id', 'solicitud_id'], solicitud_factura: ['id'] },
    sql: `
      SELECT si.id, si.solicitud_id
      FROM solicitud_item si
      LEFT JOIN solicitud_factura sf ON sf.id = si.solicitud_id
      WHERE sf.id IS NULL
    `
  },
  {
    name: 'solicitud_item.producto_id -> producto.id',
    required: { solicitud_item: ['id', 'producto_id'], producto: ['id'] },
    sql: `
      SELECT si.id, si.producto_id
      FROM solicitud_item si
      LEFT JOIN producto p ON p.id = si.producto_id
      WHERE si.producto_id IS NOT NULL
        AND trim(si.producto_id) <> ''
        AND p.id IS NULL
    `
  },
  {
    name: 'solicitud_receptor.solicitud_id -> solicitud_factura.id',
    required: { solicitud_receptor: ['solicitud_id', 'receptor_id'], solicitud_factura: ['id'] },
    sql: `
      SELECT sr.solicitud_id, sr.receptor_id
      FROM solicitud_receptor sr
      LEFT JOIN solicitud_factura sf ON sf.id = sr.solicitud_id
      WHERE sf.id IS NULL
    `
  },
  {
    name: 'solicitud_receptor.receptor_id -> receptor.id',
    required: { solicitud_receptor: ['solicitud_id', 'receptor_id'], receptor: ['id'] },
    sql: `
      SELECT sr.solicitud_id, sr.receptor_id
      FROM solicitud_receptor sr
      LEFT JOIN receptor r ON r.id = sr.receptor_id
      WHERE r.id IS NULL
    `
  },
  {
    name: 'solicitud_receptor cliente consistente',
    required: { solicitud_receptor: ['solicitud_id', 'receptor_id'], solicitud_factura: ['id', 'cliente_id'], receptor: ['id', 'cliente_id'] },
    sql: `
      SELECT sr.solicitud_id, sr.receptor_id, sf.cliente_id AS solicitud_cliente_id, r.cliente_id AS receptor_cliente_id
      FROM solicitud_receptor sr
      JOIN solicitud_factura sf ON sf.id = sr.solicitud_id
      JOIN receptor r ON r.id = sr.receptor_id
      WHERE sf.cliente_id <> r.cliente_id
    `
  },
  {
    name: 'historial_estado.solicitud_id -> solicitud_factura.id',
    required: { historial_estado: ['id', 'solicitud_id'], solicitud_factura: ['id'] },
    sql: `
      SELECT he.id, he.solicitud_id
      FROM historial_estado he
      LEFT JOIN solicitud_factura sf ON sf.id = he.solicitud_id
      WHERE sf.id IS NULL
    `
  },
  {
    name: 'documento_exportado.solicitud_id -> solicitud_factura.id',
    required: { documento_exportado: ['id', 'solicitud_id'], solicitud_factura: ['id'] },
    sql: `
      SELECT de.id, de.solicitud_id
      FROM documento_exportado de
      LEFT JOIN solicitud_factura sf ON sf.id = de.solicitud_id
      WHERE sf.id IS NULL
    `
  },
  {
    name: 'proyeccion.cliente_id -> cliente.id',
    required: { proyeccion: ['id', 'cliente_id'], cliente: ['id'] },
    sql: `
      SELECT p.id, p.cliente_id
      FROM proyeccion p
      LEFT JOIN cliente c ON c.id = p.cliente_id
      WHERE p.cliente_id IS NOT NULL
        AND trim(p.cliente_id) <> ''
        AND c.id IS NULL
    `
  },
  {
    name: 'proyeccion_item.version_id -> proyeccion_version.id',
    required: { proyeccion_item: ['id', 'version_id'], proyeccion_version: ['id'] },
    sql: `
      SELECT pi.id, pi.version_id
      FROM proyeccion_item pi
      LEFT JOIN proyeccion_version pv ON pv.id = pi.version_id
      WHERE pv.id IS NULL
    `
  },
  {
    name: 'proyeccion_item.cliente_id -> cliente.id',
    required: { proyeccion_item: ['id', 'cliente_id'], cliente: ['id'] },
    sql: `
      SELECT pi.id, pi.cliente_id
      FROM proyeccion_item pi
      LEFT JOIN cliente c ON c.id = pi.cliente_id
      WHERE pi.cliente_id IS NOT NULL
        AND trim(pi.cliente_id) <> ''
        AND c.id IS NULL
    `
  },
  {
    name: 'proyeccion_mensual.item_id -> proyeccion_item.id',
    required: { proyeccion_mensual: ['id', 'item_id'], proyeccion_item: ['id'] },
    sql: `
      SELECT pm.id, pm.item_id
      FROM proyeccion_mensual pm
      LEFT JOIN proyeccion_item pi ON pi.id = pm.item_id
      WHERE pi.id IS NULL
    `
  }
];

function parseArgs(argv) {
  const args = [...argv];
  const opts = { mode: null, sourcePath: null };

  while (args.length) {
    const arg = args.shift();
    if (arg === '--preview') {
      opts.mode = opts.mode ? 'invalid' : 'preview';
    } else if (arg === '--apply') {
      opts.mode = opts.mode ? 'invalid' : 'apply';
    } else if (arg === '--source' || arg === '--sqlite') {
      opts.sourcePath = args.shift();
    } else if (arg.startsWith('--source=')) {
      opts.sourcePath = arg.slice('--source='.length);
    } else if (arg.startsWith('--sqlite=')) {
      opts.sourcePath = arg.slice('--sqlite='.length);
    } else {
      opts.unknown = arg;
    }
  }

  return opts;
}

function usage() {
  console.log(`
Uso:
  npm run migrate:data:sqlite-to-postgres -- --preview
  npm run migrate:data:sqlite-to-postgres -- --apply

Opcional:
  SQLITE_SOURCE_PATH=/ruta/facturapp.sqlite npm run migrate:data:sqlite-to-postgres -- --preview
  npm run migrate:data:sqlite-to-postgres -- --preview --source /ruta/facturapp.sqlite
`);
}

function timestamp() {
  return new Date().toISOString().replace(/[-:]/g, '').replace(/\..+/, '').replace('T', '-');
}

function quoteIdent(value) {
  if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(value)) {
    throw new Error(`Identificador SQL invalido: ${value}`);
  }
  return `"${value}"`;
}

function formatCount(value) {
  if (value === null || value === undefined) return 'no existe';
  return String(value);
}

function resolveCandidate(raw) {
  if (!raw) return null;
  if (path.isAbsolute(raw)) return path.resolve(raw);

  const candidates = [
    path.resolve(process.cwd(), raw),
    path.resolve(env.REPO_ROOT, raw),
    path.resolve(env.BACKEND_ROOT, raw)
  ];

  return candidates.find(candidate => fs.existsSync(candidate)) || candidates[0];
}

function resolveSqliteSource(opts) {
  const explicit = opts.sourcePath || process.env.SQLITE_SOURCE_PATH || process.env.SQLITE_MIGRATION_SOURCE;
  if (explicit) return resolveCandidate(explicit);
  return path.join(env.BACKEND_ROOT, 'storage', 'facturapp.sqlite');
}

function openSqlite(sourcePath) {
  if (!fs.existsSync(sourcePath)) {
    throw new Error(`SQLite origen no encontrada: ${sourcePath}`);
  }

  const db = new DatabaseSync(sourcePath, { readOnly: true });
  db.exec('PRAGMA foreign_keys=ON;');
  return db;
}

function sqliteTables(db) {
  return db.prepare(`
    SELECT name
    FROM sqlite_master
    WHERE type = 'table'
      AND name NOT LIKE 'sqlite_%'
    ORDER BY name
  `).all().map(row => row.name);
}

function sqliteColumns(db, table) {
  return db.prepare(`PRAGMA table_info(${quoteIdent(table)})`).all().map(row => row.name);
}

function sqliteCount(db, table) {
  return Number(db.prepare(`SELECT COUNT(*) AS total FROM ${quoteIdent(table)}`).get().total || 0);
}

function sqliteRows(db, table, columns) {
  const select = columns.map(quoteIdent).join(', ');
  return db.prepare(`SELECT ${select} FROM ${quoteIdent(table)}`).all();
}

function sqliteHasColumns(columnCache, table, columns) {
  const tableColumns = columnCache.get(table);
  if (!tableColumns) return false;
  return columns.every(column => tableColumns.has(column));
}

async function postgresTables(client) {
  const result = await client.query(`
    SELECT tablename AS name
    FROM pg_tables
    WHERE schemaname = current_schema()
    ORDER BY tablename
  `);
  return result.rows.map(row => row.name);
}

async function postgresColumns(client, table) {
  const result = await client.query(`
    SELECT column_name AS name
    FROM information_schema.columns
    WHERE table_schema = current_schema()
      AND table_name = $1
    ORDER BY ordinal_position
  `, [table]);
  return result.rows.map(row => row.name);
}

async function postgresPrimaryKey(client, table) {
  const result = await client.query(`
    SELECT kcu.column_name AS name
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu
      ON tc.constraint_name = kcu.constraint_name
     AND tc.table_schema = kcu.table_schema
     AND tc.table_name = kcu.table_name
    WHERE tc.table_schema = current_schema()
      AND tc.table_name = $1
      AND tc.constraint_type = 'PRIMARY KEY'
    ORDER BY kcu.ordinal_position
  `, [table]);
  return result.rows.map(row => row.name);
}

async function postgresCount(client, table) {
  const result = await client.query(`SELECT COUNT(*) AS total FROM ${quoteIdent(table)}`);
  return Number(result.rows[0]?.total || 0);
}

async function postgresRows(client, table, columns) {
  const select = columns.map(quoteIdent).join(', ');
  const result = await client.query(`SELECT ${select} FROM ${quoteIdent(table)}`);
  return result.rows;
}

async function collectMetadata(sqlite, client) {
  const sourceTables = new Set(sqliteTables(sqlite));
  const targetTables = new Set(await postgresTables(client));
  const sqliteColumnCache = new Map();
  const postgresColumnCache = new Map();
  const primaryKeys = new Map();
  const counts = [];
  const missing = [];

  for (const name of sourceTables) {
    sqliteColumnCache.set(name, new Set(sqliteColumns(sqlite, name)));
  }

  for (const { table } of TABLE_PLAN) {
    const hasSource = sourceTables.has(table);
    const hasTarget = targetTables.has(table);
    if (!hasSource || !hasTarget) {
      missing.push({ table, source: hasSource, target: hasTarget });
      counts.push({ table, source: hasSource ? sqliteCount(sqlite, table) : null, target: hasTarget ? await postgresCount(client, table) : null });
      continue;
    }

    const pgColumns = await postgresColumns(client, table);
    postgresColumnCache.set(table, new Set(pgColumns));
    primaryKeys.set(table, await postgresPrimaryKey(client, table));
    counts.push({ table, source: sqliteCount(sqlite, table), target: await postgresCount(client, table) });
  }

  const excludedNonEmpty = [];
  for (const table of sourceTables) {
    if (EXCLUDED_TABLES.has(table)) {
      const total = sqliteCount(sqlite, table);
      if (total > 0) excludedNonEmpty.push({ table, total });
    }
  }

  return {
    counts,
    excludedNonEmpty,
    missing,
    postgresColumnCache,
    primaryKeys,
    sourceTables: Array.from(sourceTables).sort(),
    sqliteColumnCache,
    targetTables: Array.from(targetTables).sort()
  };
}

function countRelationshipIssues(sqlite, check) {
  const total = sqlite.prepare(`SELECT COUNT(*) AS total FROM (${check.sql}) AS rel_check`).get().total;
  const sample = Number(total) > 0
    ? sqlite.prepare(`${check.sql} LIMIT ${MAX_SAMPLE_ROWS}`).all()
    : [];
  return { total: Number(total || 0), sample };
}

function runRelationshipValidation(sqlite, metadata) {
  return RELATIONSHIP_CHECKS.map(check => {
    for (const [table, columns] of Object.entries(check.required)) {
      if (!sqliteHasColumns(metadata.sqliteColumnCache, table, columns)) {
        return { name: check.name, skipped: true, reason: `faltan columnas en ${table}` };
      }
    }

    const result = countRelationshipIssues(sqlite, check);
    return { name: check.name, ...result };
  });
}

function normalizeKeyValue(value) {
  if (value === null || value === undefined) return null;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed ? trimmed : null;
  }
  return String(value);
}

function keyFor(row, columns) {
  const values = columns.map(column => normalizeKeyValue(row[column]));
  if (values.some(value => value === null)) return null;
  return values.join('\u001f');
}

function pkFor(row, columns) {
  return columns.map(column => normalizeKeyValue(row[column]) || '').join('\u001f');
}

function detectDuplicateNaturalKeys(rows, keyColumns, pkColumns, table) {
  const seen = new Map();
  const issues = [];
  for (const row of rows) {
    const key = keyFor(row, keyColumns);
    if (!key) continue;

    const pk = pkFor(row, pkColumns);
    if (!seen.has(key)) {
      seen.set(key, { pk, row });
      continue;
    }

    if (seen.get(key).pk !== pk) {
      issues.push({ table, key: keyColumns, first: seen.get(key).row, duplicate: row });
    }
  }

  return issues;
}

async function runNaturalKeyValidation(sqlite, client, metadata) {
  const issues = [];
  for (const check of NATURAL_KEY_CHECKS) {
    const needed = Array.from(new Set([...check.key, ...check.pk]));
    if (!sqliteHasColumns(metadata.sqliteColumnCache, check.table, needed)) continue;
    if (!metadata.postgresColumnCache.has(check.table)) continue;

    const sourceRows = sqliteRows(sqlite, check.table, needed);
    const targetRows = await postgresRows(client, check.table, needed);
    issues.push(...detectDuplicateNaturalKeys(sourceRows, check.key, check.pk, check.table));

    const targetByKey = new Map();
    targetRows.forEach(row => {
      const key = keyFor(row, check.key);
      if (key) targetByKey.set(key, row);
    });

    sourceRows.forEach(sourceRow => {
      const key = keyFor(sourceRow, check.key);
      if (!key || !targetByKey.has(key)) return;

      const targetRow = targetByKey.get(key);
      if (pkFor(sourceRow, check.pk) !== pkFor(targetRow, check.pk)) {
        issues.push({
          table: check.table,
          key: check.key,
          source: sourceRow,
          target: targetRow,
          type: 'conflicto destino con PK distinta'
        });
      }
    });
  }

  return issues;
}

function printCounts(counts) {
  console.log('Conteos:');
  counts.forEach(row => {
    const diff = row.source === null || row.target === null ? 'n/a' : String(row.source - row.target);
    console.log(`  ${row.table}: SQLite=${formatCount(row.source)} PostgreSQL=${formatCount(row.target)} diferencia=${diff}`);
  });
}

function printValidationResults(relationships, naturalKeyIssues, missing) {
  const relationIssues = relationships.filter(row => !row.skipped && row.total > 0);
  const skipped = relationships.filter(row => row.skipped);

  if (missing.length) {
    console.log('ERROR Tablas faltantes en el plan:');
    missing.forEach(row => console.log(`  ${row.table}: SQLite=${row.source ? 'OK' : 'falta'} PostgreSQL=${row.target ? 'OK' : 'falta'}`));
  } else {
    console.log('OK Tablas requeridas: presentes en SQLite y PostgreSQL');
  }

  if (relationIssues.length) {
    console.log('ERROR Validacion de relaciones:');
    relationIssues.forEach(issue => {
      console.log(`  ${issue.name}: ${issue.total}`);
      issue.sample.forEach(row => console.log(`    ${JSON.stringify(row)}`));
    });
  } else {
    console.log('OK Validacion de relaciones: 0 inconsistencias');
  }

  if (skipped.length) {
    console.log('Aviso Validaciones omitidas por columnas ausentes:');
    skipped.forEach(row => console.log(`  ${row.name}: ${row.reason}`));
  }

  if (naturalKeyIssues.length) {
    console.log('ERROR Conflictos de claves naturales:');
    naturalKeyIssues.slice(0, MAX_SAMPLE_ROWS).forEach(issue => console.log(`  ${JSON.stringify(issue)}`));
    if (naturalKeyIssues.length > MAX_SAMPLE_ROWS) {
      console.log(`  ... ${naturalKeyIssues.length - MAX_SAMPLE_ROWS} conflictos adicionales`);
    }
  } else {
    console.log('OK Conflictos de claves naturales: 0');
  }
}

function printExcluded(excludedNonEmpty) {
  if (!excludedNonEmpty.length) return;
  console.log('Tablas con registros que no se migran por diseno:');
  excludedNonEmpty.forEach(row => console.log(`  ${row.table}: ${row.total}`));
}

function assertReadyForApply(metadata, relationships, naturalKeyIssues) {
  const relationIssues = relationships.filter(row => !row.skipped && row.total > 0);
  const skipped = relationships.filter(row => row.skipped);

  if (metadata.missing.length) {
    throw new Error('No se puede aplicar: hay tablas requeridas faltantes.');
  }
  if (relationIssues.length) {
    throw new Error('No se puede aplicar: hay relaciones inconsistentes en SQLite.');
  }
  if (skipped.length) {
    throw new Error('No se puede aplicar: hay validaciones omitidas por columnas ausentes.');
  }
  if (naturalKeyIssues.length) {
    throw new Error('No se puede aplicar: hay conflictos de claves naturales con PostgreSQL.');
  }
}

async function createPostgresBackup(client) {
  const backupDirectory = env.backupDir();
  fs.mkdirSync(backupDirectory, { recursive: true });
  const filePath = path.join(backupDirectory, `${BACKUP_PREFIX}-${timestamp()}.json`);
  const tables = await postgresTables(client);
  const payload = {
    createdAt: new Date().toISOString(),
    databaseUrl: env.safeUrl(process.env.DATABASE_URL),
    tables: {}
  };

  for (const table of tables) {
    const rows = await postgresRows(client, table, await postgresColumns(client, table));
    payload.tables[table] = {
      count: rows.length,
      rows
    };
  }

  fs.writeFileSync(filePath, JSON.stringify(payload, null, 2));
  return filePath;
}

function normalizeValue(value) {
  return value === undefined ? null : value;
}

async function migrateTable(sqlite, client, metadata, table) {
  const sourceColumns = sqliteColumns(sqlite, table);
  const targetColumns = Array.from(metadata.postgresColumnCache.get(table) || []);
  const commonColumns = sourceColumns.filter(column => targetColumns.includes(column));
  const primaryKey = metadata.primaryKeys.get(table) || [];

  if (!primaryKey.length) {
    throw new Error(`La tabla ${table} no tiene primary key en PostgreSQL.`);
  }
  if (!primaryKey.every(column => commonColumns.includes(column))) {
    throw new Error(`La tabla ${table} no puede preservar primary key: ${primaryKey.join(', ')}`);
  }
  if (!commonColumns.length) {
    return { table, selected: 0, affected: 0 };
  }

  const rows = sqliteRows(sqlite, table, commonColumns);
  if (!rows.length) {
    return { table, selected: 0, affected: 0 };
  }

  const columnsSql = commonColumns.map(quoteIdent).join(', ');
  const placeholders = commonColumns.map((_, index) => `$${index + 1}`).join(', ');
  const conflictSql = primaryKey.map(quoteIdent).join(', ');
  const updateColumns = commonColumns.filter(column => !primaryKey.includes(column));
  const onConflict = updateColumns.length
    ? `DO UPDATE SET ${updateColumns.map(column => `${quoteIdent(column)} = EXCLUDED.${quoteIdent(column)}`).join(', ')}`
    : 'DO NOTHING';
  const sql = `
    INSERT INTO ${quoteIdent(table)} (${columnsSql})
    VALUES (${placeholders})
    ON CONFLICT (${conflictSql}) ${onConflict}
  `;

  let affected = 0;
  for (const row of rows) {
    const values = commonColumns.map(column => normalizeValue(row[column]));
    const result = await client.query(sql, values);
    affected += result.rowCount || 0;
  }

  return { table, selected: rows.length, affected };
}

async function finalCounts(client) {
  const tables = ['cliente', 'cp', 'receptor', 'solicitud_factura', 'proyeccion_version', 'proyeccion_item', 'proyeccion_mensual'];
  const counts = {};
  for (const table of tables) {
    counts[table] = await postgresCount(client, table);
  }
  return counts;
}

function printApplySummary(results, counts) {
  console.log('Migracion aplicada:');
  results.forEach(row => console.log(`  ${row.table}: seleccionados=${row.selected} afectados=${row.affected}`));
  console.log('Resumen operativo PostgreSQL:');
  console.log(`  clientes migrados: ${counts.cliente}`);
  console.log(`  cp migrados: ${counts.cp}`);
  console.log(`  receptores migrados: ${counts.receptor}`);
  console.log(`  solicitudes migradas: ${counts.solicitud_factura}`);
  console.log(`  proyecciones migradas: versiones=${counts.proyeccion_version} items=${counts.proyeccion_item} mensuales=${counts.proyeccion_mensual}`);
}

function runDbCheck() {
  console.log('Ejecutando npm run db:check...');
  const result = spawnSync(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['run', 'db:check'], {
    cwd: env.BACKEND_ROOT,
    env: process.env,
    stdio: 'inherit'
  });

  if (result.error) {
    throw result.error;
  }

  if (result.status === 0) {
    console.log('db:check OK. Ya se puede ejecutar REQUIRE_DEPLOYMENT_CONFIG=1 npm run prod:check.');
    return true;
  }

  console.log('db:check fallo. No ejecutar REQUIRE_DEPLOYMENT_CONFIG=1 npm run prod:check hasta corregirlo.');
  process.exitCode = result.status || 1;
  return false;
}

async function analyze(sqlite, client) {
  const metadata = await collectMetadata(sqlite, client);
  const relationships = runRelationshipValidation(sqlite, metadata);
  const naturalKeyIssues = await runNaturalKeyValidation(sqlite, client, metadata);
  return { metadata, naturalKeyIssues, relationships };
}

async function runPreview(sourcePath) {
  const sqlite = openSqlite(sourcePath);
  const client = createPostgresClient();
  await client.connect();

  try {
    const { metadata, naturalKeyIssues, relationships } = await analyze(sqlite, client);
    console.log('Modo: preview (sin escritura)');
    console.log(`SQLite origen: ${sourcePath}`);
    console.log(`PostgreSQL destino: ${env.safeUrl(process.env.DATABASE_URL)}`);
    console.log(`Tablas SQLite detectadas: ${metadata.sourceTables.length}`);
    console.log(`Tablas PostgreSQL detectadas: ${metadata.targetTables.length}`);
    console.log(`Tablas planificadas: ${TABLE_PLAN.map(row => row.table).join(', ')}`);
    printCounts(metadata.counts);
    printValidationResults(relationships, naturalKeyIssues, metadata.missing);
    printExcluded(metadata.excludedNonEmpty);

    if (metadata.missing.length || naturalKeyIssues.length || relationships.some(row => !row.skipped && row.total > 0)) {
      process.exitCode = 1;
    }
  } finally {
    await client.end();
    sqlite.close();
  }
}

async function runApply(sourcePath) {
  const sqlite = openSqlite(sourcePath);
  const client = createPostgresClient();
  await client.connect();

  try {
    const { metadata, naturalKeyIssues, relationships } = await analyze(sqlite, client);
    console.log('Modo: apply');
    console.log(`SQLite origen: ${sourcePath}`);
    console.log(`PostgreSQL destino: ${env.safeUrl(process.env.DATABASE_URL)}`);
    printCounts(metadata.counts);
    printValidationResults(relationships, naturalKeyIssues, metadata.missing);
    printExcluded(metadata.excludedNonEmpty);
    assertReadyForApply(metadata, relationships, naturalKeyIssues);

    const backupPath = await createPostgresBackup(client);
    console.log(`Backup PostgreSQL creado: ${backupPath}`);

    const results = [];
    await client.query('BEGIN');
    try {
      for (const { table } of TABLE_PLAN) {
        results.push(await migrateTable(sqlite, client, metadata, table));
      }
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    }

    const counts = await finalCounts(client);
    printApplySummary(results, counts);
  } finally {
    await client.end();
    sqlite.close();
  }

  runDbCheck();
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  if (!opts.mode || opts.mode === 'invalid' || opts.unknown) {
    usage();
    if (opts.unknown) console.error(`Argumento no reconocido: ${opts.unknown}`);
    process.exitCode = 1;
    return;
  }
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL PostgreSQL no esta configurado.');
  }

  const sourcePath = resolveSqliteSource(opts);
  if (opts.mode === 'preview') {
    await runPreview(sourcePath);
    return;
  }

  await runApply(sourcePath);
}

if (require.main === module) {
  main().catch(error => {
    console.error(error.message || error);
    process.exitCode = 1;
  });
}
