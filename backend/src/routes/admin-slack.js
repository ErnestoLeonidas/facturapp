const r = require('express').Router();
const { ok, fail } = require('../middleware/envelope');
const audit = require('../services/audit');
const slack = require('../services/slack-bot');

r.get('/config', async (req, res, next) => {
  try {
    ok(res, await slack.config());
  } catch (error) {
    next(error);
  }
});

r.put('/config', async (req, res, next) => {
  try {
    const cfg = await slack.saveConfig(req.body || {});
    audit.log(req, 'guardar_config_slack', 'app_config', 'slack', {
      channel_id: cfg.channel_id,
      dias_anticipacion: cfg.dias_anticipacion,
      habilitado: cfg.habilitado
    });
    ok(res, cfg);
  } catch (error) {
    next(error);
  }
});

r.get('/preview', async (req, res, next) => {
  try {
    const cfg = await slack.config();
    ok(res, {
      config: cfg,
      rows: await slack.candidatos(cfg)
    });
  } catch (error) {
    next(error);
  }
});

r.post('/test', async (req, res) => {
  try {
    const result = await slack.test();
    audit.log(req, 'probar_slack', 'app_config', 'slack', { team: result.team, user: result.user });
    ok(res, {
      ok: true,
      team: result.team,
      user: result.user,
      bot_id: result.bot_id || null
    });
  } catch (e) {
    fail(res, e.code || 'SLACK_ERROR', e.message, null, e.code === 'SLACK_TOKEN_MISSING' ? 400 : 502);
  }
});

r.post('/send', async (req, res) => {
  try {
    const result = await slack.enviarRecordatorios();
    audit.log(req, 'enviar_recordatorios_slack', 'slack_notificacion_log', 'batch', {
      enviados: result.enviados.length,
      errores: result.errores.length,
      total_candidatos: result.total_candidatos
    });
    ok(res, result);
  } catch (e) {
    const validationCodes = ['SLACK_TOKEN_MISSING', 'SLACK_CHANNEL_MISSING', 'SLACK_DISABLED'];
    fail(res, e.code || 'SLACK_ERROR', e.message, null, validationCodes.includes(e.code) ? 400 : 502);
  }
});

module.exports = r;
