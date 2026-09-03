require('./config/env');

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const { DatabaseSync } = require('node:sqlite');
const env = require('./config/env');
const { createPostgresClient } = require('./postgres');

const MAX_SAMPLE_ROWS = Number(process.env.BACKFILL_SAMPLE_ROWS || 10);
const BACKUP_PREFIX = 'rds-backfill-pre-apply';

const TABLE_PLAN = [
  'empresa_emisora',
  'coordinador',
  'producto',
  'cliente',
  'cliente_facturacion',
  'cliente_producto',
  'cliente_coordinador',
  'receptor',
  'cp',
  'uf_cache',
  'proyeccion_uf',
  'solicitud_factura',
  'solicitud_cp',
  'solicitud_item',
  'solicitud_receptor',
  'historial_estado',
  'documento_exportado',
  'proyeccion_version',
  'proyeccion_item',
  'proyeccion_mensual',
  'proyeccion',
  'proyeccion_auxiliar'
];

const NEVER_TOUCH_TABLES = [
  'app_user',
  'app_session',
  'audit_log',
  'slack_notificacion_log',
  'app_config',
  'schema_migrations',
  'catalogo_estado_solicitud',
  'catalogo_tipo_cp',
  'catalogo_tipo_impuesto',
  'bitacora_integracion'
];

const NATURAL_KEYS = [
  { table: 'empresa_emisora', key: ['codigo'], pk: ['codigo'] },
  { table: 'coordinador', key: ['email'], pk: ['id'] },
  { table: 'producto', key: ['codigo'], pk: ['id'] },
  { table: 'cliente', key: ['nombre_corto'], pk: ['id'] },
  { table: 'cliente_facturacion', key: ['cliente_id', 'rut'], pk: ['id'] },
  { table: 'cliente_producto', key: ['cliente_id', 'producto_id'], pk: ['id'] },
  { table: 'cliente_coordinador', key: ['cliente_id', 'coordinador_id', 'cp_id'], pk: ['id'] },
  { table: 'receptor', key: ['cliente_id', 'email'], pk: ['id'], lower: ['email'] },
  { table: 'cp', key: ['codigo'], pk: ['id'] },
  { table: 'uf_cache', key: ['fecha'], pk: ['fecha'] },
  { table: 'proyeccion_uf', key: ['anio', 'mes'], pk: ['id'] },
  { table: 'solicitud_factura', key: ['folio'], pk: ['id'] },
  { table: 'solicitud_cp', key: ['solicitud_id', 'cp_id'], pk: ['id'] },
  { table: 'solicitud_receptor', key: ['solicitud_id', 'receptor_id'], pk: ['solicitud_id', 'receptor_id'] },
  { table: 'proyeccion', key: ['anio', 'mes', 'ms', 'cliente', 'proyecto', 'producto', 'tipo_cp', 'cp'], pk: ['id'], nullAsEmpty: true },
  { table: 'proyeccion_version', key: ['anio', 'numero'], pk: ['id'] },
  { table: 'proyeccion_mensual', key: ['item_id', 'mes'], pk: ['id'] },
  { table: 'proyeccion_auxiliar', key: ['anio', 'hoja', 'fila'], pk: ['id'] }
];

const RELATIONSHIP_CHECKS = [
  ['cliente.coordinador_id -> coordinador.id', {
    cliente: ['id', 'coordinador_id'],
    coordinador: ['id']
  }, `
    SELECT c.id AS cliente_id, c.coordinador_id
    FROM cliente c
    LEFT JOIN coordinador co ON co.id = c.coordinador_id
    WHERE c.coordinador_id IS NOT NULL
      AND trim(c.coordinador_id) <> ''
      AND co.id IS NULL
  `],
  ['cliente_facturacion.cliente_id -> cliente.id', {
    cliente_facturacion: ['id', 'cliente_id'],
    cliente: ['id']
  }, `
    SELECT cf.id, cf.cliente_id
    FROM cliente_facturacion cf
    LEFT JOIN cliente c ON c.id = cf.cliente_id
    WHERE c.id IS NULL
  `],
  ['cliente_producto.cliente_id -> cliente.id', {
    cliente_producto: ['id', 'cliente_id'],
    cliente: ['id']
  }, `
    SELECT cp.id, cp.cliente_id
    FROM cliente_producto cp
    LEFT JOIN cliente c ON c.id = cp.cliente_id
    WHERE c.id IS NULL
  `],
  ['cliente_producto.producto_id -> producto.id', {
    cliente_producto: ['id', 'producto_id'],
    producto: ['id']
  }, `
    SELECT cp.id, cp.producto_id
    FROM cliente_producto cp
    LEFT JOIN producto p ON p.id = cp.producto_id
    WHERE p.id IS NULL
  `],
  ['cliente_coordinador.cliente_id -> cliente.id', {
    cliente_coordinador: ['id', 'cliente_id'],
    cliente: ['id']
  }, `
    SELECT cc.id, cc.cliente_id
    FROM cliente_coordinador cc
    LEFT JOIN cliente c ON c.id = cc.cliente_id
    WHERE c.id IS NULL
  `],
  ['cliente_coordinador.coordinador_id -> coordinador.id', {
    cliente_coordinador: ['id', 'coordinador_id'],
    coordinador: ['id']
  }, `
    SELECT cc.id, cc.coordinador_id
    FROM cliente_coordinador cc
    LEFT JOIN coordinador co ON co.id = cc.coordinador_id
    WHERE co.id IS NULL
  `],
  ['cliente_coordinador.cp_id -> cp.id', {
    cliente_coordinador: ['id', 'cp_id'],
    cp: ['id']
  }, `
    SELECT cc.id, cc.cp_id
    FROM cliente_coordinador cc
    LEFT JOIN cp ON cp.id = cc.cp_id
    WHERE cc.cp_id IS NOT NULL
      AND trim(cc.cp_id) <> ''
      AND cp.id IS NULL
  `],
  ['receptor.cliente_id -> cliente.id', {
    receptor: ['id', 'cliente_id'],
    cliente: ['id']
  }, `
    SELECT r.id, r.cliente_id
    FROM receptor r
    LEFT JOIN cliente c ON c.id = r.cliente_id
    WHERE c.id IS NULL
  `],
  ['cp.cliente_id -> cliente.id', {
    cp: ['id', 'cliente_id'],
    cliente: ['id']
  }, `
    SELECT cp.id, cp.cliente_id
    FROM cp
    LEFT JOIN cliente c ON c.id = cp.cliente_id
    WHERE cp.cliente_id IS NOT NULL
      AND trim(cp.cliente_id) <> ''
      AND c.id IS NULL
  `],
  ['solicitud_factura.cliente_id -> cliente.id', {
    solicitud_factura: ['id', 'cliente_id'],
    cliente: ['id']
  }, `
    SELECT sf.id, sf.cliente_id
    FROM solicitud_factura sf
    LEFT JOIN cliente c ON c.id = sf.cliente_id
    WHERE c.id IS NULL
  `],
  ['solicitud_factura.coordinador_id -> coordinador.id', {
    solicitud_factura: ['id', 'coordinador_id'],
    coordinador: ['id']
  }, `
    SELECT sf.id, sf.coordinador_id
    FROM solicitud_factura sf
    LEFT JOIN coordinador co ON co.id = sf.coordinador_id
    WHERE sf.coordinador_id IS NOT NULL
      AND trim(sf.coordinador_id) <> ''
      AND co.id IS NULL
  `],
  ['solicitud_factura.empresa_emisora -> empresa_emisora.codigo', {
    solicitud_factura: ['id', 'empresa_emisora'],
    empresa_emisora: ['codigo']
  }, `
    SELECT sf.id, sf.empresa_emisora
    FROM solicitud_factura sf
    LEFT JOIN empresa_emisora ee ON ee.codigo = sf.empresa_emisora
    WHERE ee.codigo IS NULL
  `],
  ['solicitud_factura.cliente_facturacion_id -> cliente_facturacion.id', {
    solicitud_factura: ['id', 'cliente_facturacion_id'],
    cliente_facturacion: ['id']
  }, `
    SELECT sf.id, sf.cliente_facturacion_id
    FROM solicitud_factura sf
    LEFT JOIN cliente_facturacion cf ON cf.id = sf.cliente_facturacion_id
    WHERE sf.cliente_facturacion_id IS NOT NULL
      AND trim(sf.cliente_facturacion_id) <> ''
      AND cf.id IS NULL
  `],
  ['solicitud_cp.solicitud_id -> solicitud_factura.id', {
    solicitud_cp: ['id', 'solicitud_id'],
    solicitud_factura: ['id']
  }, `
    SELECT sc.id, sc.solicitud_id
    FROM solicitud_cp sc
    LEFT JOIN solicitud_factura sf ON sf.id = sc.solicitud_id
    WHERE sf.id IS NULL
  `],
  ['solicitud_cp.cp_id -> cp.id', {
    solicitud_cp: ['id', 'cp_id'],
    cp: ['id']
  }, `
    SELECT sc.id, sc.cp_id
    FROM solicitud_cp sc
    LEFT JOIN cp ON cp.id = sc.cp_id
    WHERE cp.id IS NULL
  `],
  ['solicitud_cp cliente consistente', {
    solicitud_cp: ['id', 'solicitud_id', 'cp_id'],
    solicitud_factura: ['id', 'cliente_id'],
    cp: ['id', 'cliente_id']
  }, `
    SELECT sc.id, sc.solicitud_id, sc.cp_id, sf.cliente_id AS solicitud_cliente_id, cp.cliente_id AS cp_cliente_id
    FROM solicitud_cp sc
    JOIN solicitud_factura sf ON sf.id = sc.solicitud_id
    JOIN cp ON cp.id = sc.cp_id
    WHERE sf.cliente_id <> cp.cliente_id
  `],
  ['solicitud_item.solicitud_id -> solicitud_factura.id', {
    solicitud_item: ['id', 'solicitud_id'],
    solicitud_factura: ['id']
  }, `
    SELECT si.id, si.solicitud_id
    FROM solicitud_item si
    LEFT JOIN solicitud_factura sf ON sf.id = si.solicitud_id
    WHERE sf.id IS NULL
  `],
  ['solicitud_item.producto_id -> producto.id', {
    solicitud_item: ['id', 'producto_id'],
    producto: ['id']
  }, `
    SELECT si.id, si.producto_id
    FROM solicitud_item si
    LEFT JOIN producto p ON p.id = si.producto_id
    WHERE si.producto_id IS NOT NULL
      AND trim(si.producto_id) <> ''
      AND p.id IS NULL
  `],
  ['solicitud_receptor.solicitud_id -> solicitud_factura.id', {
    solicitud_receptor: ['solicitud_id', 'receptor_id'],
    solicitud_factura: ['id']
  }, `
    SELECT sr.solicitud_id, sr.receptor_id
    FROM solicitud_receptor sr
    LEFT JOIN solicitud_factura sf ON sf.id = sr.solicitud_id
    WHERE sf.id IS NULL
  `],
  ['solicitud_receptor.receptor_id -> receptor.id', {
    solicitud_receptor: ['solicitud_id', 'receptor_id'],
    receptor: ['id']
  }, `
    SELECT sr.solicitud_id, sr.receptor_id
    FROM solicitud_receptor sr
    LEFT JOIN receptor r ON r.id = sr.receptor_id
    WHERE r.id IS NULL
  `],
  ['solicitud_receptor cliente consistente', {
    solicitud_receptor: ['solicitud_id', 'receptor_id'],
    solicitud_factura: ['id', 'cliente_id'],
    receptor: ['id', 'cliente_id']
  }, `
    SELECT sr.solicitud_id, sr.receptor_id, sf.cliente_id AS solicitud_cliente_id, r.cliente_id AS receptor_cliente_id
    FROM solicitud_receptor sr
    JOIN solicitud_factura sf ON sf.id = sr.solicitud_id
    JOIN receptor r ON r.id = sr.receptor_id
    WHERE sf.cliente_id <> r.cliente_id
  `],
  ['historial_estado.solicitud_id -> solicitud_factura.id', {
    historial_estado: ['id', 'solicitud_id'],
    solicitud_factura: ['id']
  }, `
    SELECT he.id, he.solicitud_id
    FROM historial_estado he
    LEFT JOIN solicitud_factura sf ON sf.id = he.solicitud_id
    WHERE sf.id IS NULL
  `],
  ['documento_exportado.solicitud_id -> solicitud_factura.id', {
    documento_exportado: ['id', 'solicitud_id'],
    solicitud_factura: ['id']
  }, `
    SELECT de.id, de.solicitud_id
    FROM documento_exportado de
    LEFT JOIN solicitud_factura sf ON sf.id = de.solicitud_id
    WHERE sf.id IS NULL
  `],
  ['proyeccion.cliente_id -> cliente.id', {
    proyeccion: ['id', 'cliente_id'],
    cliente: ['id']
  }, `
    SELECT p.id, p.cliente_id
    FROM proyeccion p
    LEFT JOIN cliente c ON c.id = p.cliente_id
    WHERE p.cliente_id IS NOT NULL
      AND trim(p.cliente_id) <> ''
      AND c.id IS NULL
  `],
  ['proyeccion_item.version_id -> proyeccion_version.id', {
    proyeccion_item: ['id', 'version_id'],
    proyeccion_version: ['id']
  }, `
    SELECT pi.id, pi.version_id
    FROM proyeccion_item pi
    LEFT JOIN proyeccion_version pv ON pv.id = pi.version_id
    WHERE pv.id IS NULL
  `],
  ['proyeccion_item.cliente_id -> cliente.id', {
    proyeccion_item: ['id', 'cliente_id'],
    cliente: ['id']
  }, `
    SELECT pi.id, pi.cliente_id
    FROM proyeccion_item pi
    LEFT JOIN cliente c ON c.id = pi.cliente_id
    WHERE pi.cliente_id IS NOT NULL
      AND trim(pi.cliente_id) <> ''
      AND c.id IS NULL
  `],
  ['proyeccion_mensual.item_id -> proyeccion_item.id', {
    proyeccion_mensual: ['id', 'item_id'],
    proyeccion_item: ['id']
  }, `
    SELECT pm.id, pm.item_id
    FROM proyeccion_mensual pm
    LEFT JOIN proyeccion_item pi ON pi.id = pm.item_id
    WHERE pi.id IS NULL
  `]
];

function parseArgs(argv) {
  const opts = { mode: null, sourcePath: null };
  const args = [...argv];
  while (args.length) {
    const arg = args.shift();
    if (arg === '--preview') opts.mode = opts.mode ? 'invalid' : 'preview';
    else if (arg === '--apply') opts.mode = opts.mode ? 'invalid' : 'apply';
    else if (arg === '--source' || arg === '--sqlite') opts.sourcePath = args.shift();
    else if (arg.startsWith('--source=')) opts.sourcePath = arg.slice('--source='.length);
    else if (arg.startsWith('--sqlite=')) opts.sourcePath = arg.slice('--sqlite='.length);
    else if (arg === '--help' || arg === '-h') opts.help = true;
    else opts.unknown = arg;
  }
  return opts;
}

function usage() {
  console.log(`
Uso:
  npm run backfill:rds-from-source -- --preview
  npm run backfill:rds-from-source -- --apply

Variables:
  SOURCE_SQLITE_PATH=backend/storage/facturapp.sqlite
  DATABASE_URL=postgresql://usuario:password@host-rds:5432/bd
  PGSSLMODE=require
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
  const explicit = opts.sourcePath || process.env.SOURCE_SQLITE_PATH || process.env.SQLITE_SOURCE_PATH;
  if (explicit) return resolveCandidate(explicit);
  return path.join(env.BACKEND_ROOT, 'storage', 'facturapp.sqlite');
}

function openSqlite(sourcePath) {
  if (!fs.existsSync(sourcePath)) throw new Error(`SQLite origen no encontrada: ${sourcePath}`);
  const db = new DatabaseSync(sourcePath, { readOnly: true });
  db.exec('PRAGMA foreign_keys=ON');
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
  return db.prepare(`PRAGMA table_info(${quoteIdent(table)})`).all().map(row => ({
    name: row.name,
    notNull: Boolean(row.notnull),
    pkPosition: Number(row.pk || 0)
  }));
}

function sqliteColumnNames(db, table) {
  return sqliteColumns(db, table).map(column => column.name);
}

function sqliteCount(db, table) {
  return Number(db.prepare(`SELECT COUNT(*) AS total FROM ${quoteIdent(table)}`).get().total || 0);
}

function sqliteRows(db, table, columns) {
  const select = columns.map(quoteIdent).join(', ');
  return db.prepare(`SELECT ${select} FROM ${quoteIdent(table)}`).all();
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
    SELECT
      column_name AS name,
      is_nullable AS nullable,
      column_default AS default_value,
      data_type AS data_type
    FROM information_schema.columns
    WHERE table_schema = current_schema()
      AND table_name = $1
    ORDER BY ordinal_position
  `, [table]);
  return result.rows.map(row => ({
    name: row.name,
    nullable: row.nullable === 'YES',
    defaultValue: row.default_value,
    dataType: row.data_type
  }));
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

function normalizedValue(value, lower) {
  if (value === null || value === undefined) return null;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return null;
    return lower ? trimmed.toLowerCase() : trimmed;
  }
  return String(value);
}

function keyFor(row, columns, lowerColumns = [], nullAsEmpty = false) {
  const values = columns.map(column => {
    const value = normalizedValue(row[column], lowerColumns.includes(column));
    return value === null && nullAsEmpty ? '' : value;
  });
  if (values.some(value => value === null)) return null;
  return values.join('\u001f');
}

function labelForPk(row, pk) {
  return pk.map(column => `${column}=${normalizedValue(row[column], false) || ''}`).join(',');
}

function valuesDiffer(a, b) {
  if (a === null || a === undefined || b === null || b === undefined) return false;
  return String(a) !== String(b);
}

function valuePresent(value) {
  return value !== null && value !== undefined;
}

function truncateRow(row, columns) {
  const out = {};
  columns.forEach(column => {
    if (Object.prototype.hasOwnProperty.call(row, column)) out[column] = row[column];
  });
  return out;
}

async function collectMetadata(sqlite, client) {
  const sourceTables = new Set(sqliteTables(sqlite));
  const targetTables = new Set(await postgresTables(client));
  const tableMeta = new Map();
  const counts = [];
  const missingTables = [];
  const neverTouchCounts = [];

  for (const table of TABLE_PLAN) {
    const hasSource = sourceTables.has(table);
    const hasTarget = targetTables.has(table);
    const row = {
      table,
      source: hasSource ? sqliteCount(sqlite, table) : null,
      target: hasTarget ? await postgresCount(client, table) : null
    };
    counts.push(row);
    if (!hasSource || !hasTarget) {
      missingTables.push({ table, source: hasSource, target: hasTarget });
      continue;
    }

    const sourceColumns = sqliteColumns(sqlite, table);
    const targetColumns = await postgresColumns(client, table);
    const primaryKey = await postgresPrimaryKey(client, table);
    const sourceColumnNames = sourceColumns.map(column => column.name);
    const targetColumnNames = targetColumns.map(column => column.name);
    const commonColumns = sourceColumnNames.filter(column => targetColumnNames.includes(column));
    const missingRequiredTargetColumns = targetColumns
      .filter(column => !commonColumns.includes(column.name))
      .filter(column => !column.nullable && !column.defaultValue)
      .map(column => column.name);

    tableMeta.set(table, {
      table,
      sourceColumns,
      targetColumns,
      sourceColumnNames,
      targetColumnNames,
      commonColumns,
      primaryKey,
      missingRequiredTargetColumns
    });
  }

  for (const table of NEVER_TOUCH_TABLES) {
    if (sourceTables.has(table)) {
      neverTouchCounts.push({ table, source: sqliteCount(sqlite, table), target: targetTables.has(table) ? await postgresCount(client, table) : null });
    }
  }

  return {
    counts,
    missingTables,
    neverTouchCounts,
    sourceTables: Array.from(sourceTables).sort(),
    targetTables: Array.from(targetTables).sort(),
    tableMeta
  };
}

function runRelationshipValidation(sqlite, metadata) {
  const sourceColumnCache = new Map();
  for (const table of metadata.sourceTables) {
    sourceColumnCache.set(table, new Set(sqliteColumnNames(sqlite, table)));
  }

  return RELATIONSHIP_CHECKS.map(([name, required, sql]) => {
    for (const [table, columns] of Object.entries(required)) {
      const tableColumns = sourceColumnCache.get(table);
      if (!tableColumns || !columns.every(column => tableColumns.has(column))) {
        return { name, skipped: true, reason: `faltan columnas en fuente: ${table}` };
      }
    }
    const total = Number(sqlite.prepare(`SELECT COUNT(*) AS total FROM (${sql}) AS rel_check`).get().total || 0);
    const sample = total ? sqlite.prepare(`${sql} LIMIT ${MAX_SAMPLE_ROWS}`).all() : [];
    return { name, total, sample };
  });
}

async function analyzeTable(sqlite, client, meta) {
  const table = meta.table;
  const pk = meta.primaryKey;
  const columns = meta.commonColumns;
  if (!pk.length) return { table, error: 'sin primary key en PostgreSQL' };
  if (!pk.every(column => columns.includes(column))) return { table, error: `primary key no disponible en fuente: ${pk.join(', ')}` };
  if (meta.missingRequiredTargetColumns.length) {
    return { table, error: `columnas NOT NULL sin default ausentes en fuente: ${meta.missingRequiredTargetColumns.join(', ')}` };
  }

  const sourceRows = sqliteRows(sqlite, table, columns);
  const targetRows = await postgresRows(client, table, columns);
  const targetByPk = new Map(targetRows.map(row => [keyFor(row, pk), row]));
  const insertRows = [];
  const updateRows = [];
  const conflictsById = [];

  for (const sourceRow of sourceRows) {
    const pkKey = keyFor(sourceRow, pk);
    const targetRow = targetByPk.get(pkKey);
    if (!targetRow) {
      insertRows.push(sourceRow);
      continue;
    }

    const fillableColumns = [];
    const conflictingColumns = [];
    for (const column of columns) {
      if (pk.includes(column)) continue;
      const sourceValue = sourceRow[column];
      const targetValue = targetRow[column];
      if (!valuePresent(sourceValue)) continue;
      if (!valuePresent(targetValue)) fillableColumns.push(column);
      else if (valuesDiffer(sourceValue, targetValue)) conflictingColumns.push(column);
    }

    if (fillableColumns.length) updateRows.push({ row: sourceRow, columns: fillableColumns });
    if (conflictingColumns.length) {
      conflictsById.push({
        pk: labelForPk(sourceRow, pk),
        columns: conflictingColumns,
        source: truncateRow(sourceRow, pk.concat(conflictingColumns)),
        target: truncateRow(targetRow, pk.concat(conflictingColumns))
      });
    }
  }

  return {
    table,
    sourceRows: sourceRows.length,
    targetRows: targetRows.length,
    insertRows,
    updateRows,
    conflictsById,
    commonColumns: columns,
    primaryKey: pk
  };
}

async function analyzeNaturalKeys(sqlite, client, metadata) {
  const issues = [];
  for (const check of NATURAL_KEYS) {
    const meta = metadata.tableMeta.get(check.table);
    if (!meta) continue;
    const needed = Array.from(new Set(check.key.concat(check.pk)));
    if (!needed.every(column => meta.commonColumns.includes(column))) continue;

    const sourceRows = sqliteRows(sqlite, check.table, needed);
    const targetRows = await postgresRows(client, check.table, needed);
    const sourceByNatural = new Map();

    for (const row of sourceRows) {
      const natural = keyFor(row, check.key, check.lower || [], Boolean(check.nullAsEmpty));
      if (!natural) continue;
      const pk = keyFor(row, check.pk);
      if (sourceByNatural.has(natural) && sourceByNatural.get(natural).pk !== pk) {
        issues.push({ table: check.table, type: 'duplicado en fuente', key: check.key, first: sourceByNatural.get(natural).row, duplicate: row });
      } else {
        sourceByNatural.set(natural, { pk, row });
      }
    }

    const targetByNatural = new Map();
    for (const row of targetRows) {
      const natural = keyFor(row, check.key, check.lower || [], Boolean(check.nullAsEmpty));
      if (!natural) continue;
      const pk = keyFor(row, check.pk);
      if (!targetByNatural.has(natural)) targetByNatural.set(natural, { pk, row });
    }

    for (const row of sourceRows) {
      const natural = keyFor(row, check.key, check.lower || [], Boolean(check.nullAsEmpty));
      if (!natural || !targetByNatural.has(natural)) continue;
      const target = targetByNatural.get(natural);
      if (target.pk !== keyFor(row, check.pk)) {
        issues.push({ table: check.table, type: 'conflicto destino con PK distinta', key: check.key, source: row, target: target.row });
      }
    }
  }
  return issues;
}

async function analyze(sqlite, client) {
  const metadata = await collectMetadata(sqlite, client);
  const relationships = runRelationshipValidation(sqlite, metadata);
  const naturalKeyIssues = await analyzeNaturalKeys(sqlite, client, metadata);
  const tables = [];
  for (const table of TABLE_PLAN) {
    const meta = metadata.tableMeta.get(table);
    if (meta) tables.push(await analyzeTable(sqlite, client, meta));
  }
  return { metadata, relationships, naturalKeyIssues, tables };
}

function printCounts(counts) {
  console.log('Conteos por tabla:');
  for (const row of counts) {
    const diff = row.source === null || row.target === null ? 'n/a' : row.source - row.target;
    console.log(`  ${row.table}: fuente=${row.source ?? 'no existe'} rds=${row.target ?? 'no existe'} diferencia=${diff}`);
  }
}

function printTablePlan(tables) {
  console.log('Plan incremental por tabla:');
  for (const table of tables) {
    if (table.error) {
      console.log(`  ${table.table}: BLOQUEADO ${table.error}`);
      continue;
    }
    console.log(`  ${table.table}: insertar=${table.insertRows.length} actualizar_nulos=${table.updateRows.length} conflictos_id=${table.conflictsById.length}`);
    table.insertRows.slice(0, MAX_SAMPLE_ROWS).forEach(row => {
      console.log(`    insertaria ${labelForPk(row, table.primaryKey)}`);
    });
    table.updateRows.slice(0, MAX_SAMPLE_ROWS).forEach(entry => {
      console.log(`    actualizaria ${labelForPk(entry.row, table.primaryKey)} columnas=${entry.columns.join(',')}`);
    });
  }
}

function printConflicts(tables, naturalKeyIssues, relationships, metadata) {
  const tableErrors = tables.filter(table => table.error);
  const idConflicts = tables.flatMap(table => (table.conflictsById || []).map(issue => ({ table: table.table, ...issue })));
  const relationIssues = relationships.filter(row => !row.skipped && row.total > 0);
  const skippedRelations = relationships.filter(row => row.skipped);

  if (metadata.missingTables.length) {
    console.log('Tablas requeridas faltantes:');
    metadata.missingTables.forEach(row => console.log(`  ${row.table}: fuente=${row.source ? 'OK' : 'falta'} rds=${row.target ? 'OK' : 'falta'}`));
  } else {
    console.log('Tablas requeridas: OK');
  }

  if (tableErrors.length) {
    console.log('Bloqueos por estructura:');
    tableErrors.forEach(row => console.log(`  ${row.table}: ${row.error}`));
  }

  if (naturalKeyIssues.length) {
    console.log('Conflictos por claves naturales:');
    naturalKeyIssues.slice(0, MAX_SAMPLE_ROWS).forEach(issue => console.log(`  ${JSON.stringify(issue)}`));
    if (naturalKeyIssues.length > MAX_SAMPLE_ROWS) console.log(`  ... ${naturalKeyIssues.length - MAX_SAMPLE_ROWS} adicionales`);
  } else {
    console.log('Conflictos por claves naturales: 0');
  }

  if (idConflicts.length) {
    console.log('Conflictos por ID (RDS no nulo difiere de fuente; no se sobrescribe):');
    idConflicts.slice(0, MAX_SAMPLE_ROWS).forEach(issue => console.log(`  ${JSON.stringify(issue)}`));
    if (idConflicts.length > MAX_SAMPLE_ROWS) console.log(`  ... ${idConflicts.length - MAX_SAMPLE_ROWS} adicionales`);
  } else {
    console.log('Conflictos por ID: 0');
  }

  if (relationIssues.length) {
    console.log('Relaciones rotas en fuente:');
    relationIssues.forEach(issue => {
      console.log(`  ${issue.name}: ${issue.total}`);
      issue.sample.forEach(row => console.log(`    ${JSON.stringify(row)}`));
    });
  } else {
    console.log('Relaciones rotas en fuente: 0');
  }

  if (skippedRelations.length) {
    console.log('Validaciones de relaciones omitidas:');
    skippedRelations.forEach(row => console.log(`  ${row.name}: ${row.reason}`));
  }
}

function printNeverTouch(metadata) {
  console.log('Tablas que NO se tocan:');
  metadata.neverTouchCounts.forEach(row => {
    console.log(`  ${row.table}: fuente=${row.source} rds=${row.target ?? 'no existe'}`);
  });
}

function assertReadyForApply(report) {
  const relationIssues = report.relationships.filter(row => !row.skipped && row.total > 0);
  const skippedRelations = report.relationships.filter(row => row.skipped);
  const tableErrors = report.tables.filter(table => table.error);
  if (report.metadata.missingTables.length) throw new Error('Apply bloqueado: hay tablas requeridas faltantes.');
  if (tableErrors.length) throw new Error('Apply bloqueado: hay problemas de estructura.');
  if (report.naturalKeyIssues.length) throw new Error('Apply bloqueado: hay conflictos por claves naturales.');
  if (relationIssues.length) throw new Error('Apply bloqueado: hay relaciones rotas en la fuente.');
  if (skippedRelations.length) throw new Error('Apply bloqueado: hay validaciones de relaciones omitidas.');
}

async function createLogicalBackup(client, metadata) {
  const backupDirectory = env.backupDir();
  fs.mkdirSync(backupDirectory, { recursive: true });
  const backupPath = path.join(backupDirectory, `${BACKUP_PREFIX}-${timestamp()}.json`);
  const payload = {
    createdAt: new Date().toISOString(),
    tables: {}
  };

  for (const table of TABLE_PLAN) {
    const meta = metadata.tableMeta.get(table);
    if (!meta) continue;
    const rows = await postgresRows(client, table, meta.targetColumnNames);
    payload.tables[table] = { count: rows.length, rows };
  }

  fs.writeFileSync(backupPath, JSON.stringify(payload, null, 2));
  return backupPath;
}

function buildUpsert(meta) {
  const columns = meta.commonColumns;
  const pk = meta.primaryKey;
  const insertColumns = columns.map(quoteIdent).join(', ');
  const placeholders = columns.map((_, index) => `$${index + 1}`).join(', ');
  const conflict = pk.map(quoteIdent).join(', ');
  const updateColumns = columns.filter(column => !pk.includes(column));

  if (!updateColumns.length) {
    return `
      INSERT INTO ${quoteIdent(meta.table)} (${insertColumns})
      VALUES (${placeholders})
      ON CONFLICT (${conflict}) DO NOTHING
    `;
  }

  const setSql = updateColumns
    .map(column => `${quoteIdent(column)} = COALESCE(${quoteIdent(meta.table)}.${quoteIdent(column)}, EXCLUDED.${quoteIdent(column)})`)
    .join(', ');
  const whereSql = updateColumns
    .map(column => `(${quoteIdent(meta.table)}.${quoteIdent(column)} IS NULL AND EXCLUDED.${quoteIdent(column)} IS NOT NULL)`)
    .join(' OR ');

  return `
    INSERT INTO ${quoteIdent(meta.table)} (${insertColumns})
    VALUES (${placeholders})
    ON CONFLICT (${conflict}) DO UPDATE SET
      ${setSql}
    WHERE ${whereSql}
  `;
}

async function applyTable(sqlite, client, meta) {
  const rows = sqliteRows(sqlite, meta.table, meta.commonColumns);
  const sql = buildUpsert(meta);
  let affected = 0;
  for (const row of rows) {
    const values = meta.commonColumns.map(column => row[column] === undefined ? null : row[column]);
    const result = await client.query(sql, values);
    affected += result.rowCount || 0;
  }
  return { table: meta.table, selected: rows.length, affected };
}

function runNpmScript(script, extraEnv = {}) {
  console.log(`Ejecutando npm run ${script}...`);
  const result = spawnSync(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['run', script], {
    cwd: env.BACKEND_ROOT,
    env: { ...process.env, ...extraEnv },
    stdio: 'inherit'
  });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`npm run ${script} fallo con codigo ${result.status}`);
}

function printValidationQueries() {
  console.log('Queries manuales de validacion:');
  [
    'select count(*) from cliente;',
    'select count(*) from solicitud_factura;',
    'select count(*) from cp;',
    'select count(*) from receptor;',
    'select count(*) from proyeccion_version;',
    'select count(*) from proyeccion_item;',
    'select count(*) from proyeccion_mensual;'
  ].forEach(sql => console.log(`  ${sql}`));
}

async function runPreview(sourcePath) {
  const sqlite = openSqlite(sourcePath);
  const client = createPostgresClient();
  await client.connect();
  try {
    const report = await analyze(sqlite, client);
    console.log('Modo: preview (sin escritura)');
    console.log(`Fuente SQLite: ${sourcePath}`);
    console.log(`Destino RDS: ${env.safeUrl(process.env.DATABASE_URL)}`);
    printCounts(report.metadata.counts);
    printTablePlan(report.tables);
    printConflicts(report.tables, report.naturalKeyIssues, report.relationships, report.metadata);
    printNeverTouch(report.metadata);
    printValidationQueries();
    if (
      report.metadata.missingTables.length ||
      report.tables.some(table => table.error) ||
      report.naturalKeyIssues.length ||
      report.relationships.some(row => !row.skipped && row.total > 0)
    ) {
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
    const report = await analyze(sqlite, client);
    console.log('Modo: apply');
    console.log(`Fuente SQLite: ${sourcePath}`);
    console.log(`Destino RDS: ${env.safeUrl(process.env.DATABASE_URL)}`);
    printCounts(report.metadata.counts);
    printTablePlan(report.tables);
    printConflicts(report.tables, report.naturalKeyIssues, report.relationships, report.metadata);
    printNeverTouch(report.metadata);
    assertReadyForApply(report);

    const backupPath = await createLogicalBackup(client, report.metadata);
    console.log(`Backup logico previo creado: ${backupPath}`);

    const results = [];
    await client.query('BEGIN');
    try {
      for (const table of TABLE_PLAN) {
        const meta = report.metadata.tableMeta.get(table);
        if (!meta) continue;
        results.push(await applyTable(sqlite, client, meta));
      }
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    }

    console.log('Resumen final por tabla:');
    results.forEach(row => console.log(`  ${row.table}: fuente=${row.selected} filas_afectadas=${row.affected}`));
    printValidationQueries();
  } finally {
    await client.end();
    sqlite.close();
  }

  runNpmScript('db:check');
  runNpmScript('prod:check', { REQUIRE_DEPLOYMENT_CONFIG: '1' });
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  if (opts.help || !opts.mode || opts.mode === 'invalid' || opts.unknown) {
    usage();
    if (opts.unknown) console.error(`Argumento no reconocido: ${opts.unknown}`);
    process.exitCode = opts.help ? 0 : 1;
    return;
  }
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL no esta configurada. No se ejecuta ningun cambio.');

  const sourcePath = resolveSqliteSource(opts);
  if (opts.mode === 'preview') await runPreview(sourcePath);
  else await runApply(sourcePath);
}

if (require.main === module) {
  main().catch(error => {
    console.error(error.message || error);
    process.exitCode = 1;
  });
}
