const { v4: uuidv4 } = require('uuid');

function upsertConfig(db, key, value) {
  db.prepare(`
    INSERT INTO app_config (key, value)
    VALUES (?, ?)
    ON CONFLICT(key) DO NOTHING
  `).run(key, value);
}

module.exports = function migration(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS app_config (
      key TEXT PRIMARY KEY,
      value TEXT,
      updated_at TEXT DEFAULT (datetime('now'))
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
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_slack_log_solicitud
      ON slack_notificacion_log(solicitud_id, created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_slack_log_status
      ON slack_notificacion_log(status, created_at DESC);
  `);

  upsertConfig(db, 'slack_habilitado', '0');
  upsertConfig(db, 'slack_channel_id', process.env.SLACK_CHANNEL_ID || 'C09P7PNF7GA');
  upsertConfig(db, 'slack_dias_anticipacion', '5');
  upsertConfig(db, 'slack_base_url', process.env.APP_PUBLIC_URL || '');
  upsertConfig(db, 'slack_mensaje_intro', 'es momento de revisar esta solicitud de factura.');
  upsertConfig(db, 'slack_mensaje_pie', 'Actualiza el estado directamente en FactuFlow.');
  upsertConfig(db, 'slack_version_config', uuidv4());
};
