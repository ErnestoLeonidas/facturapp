const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const db = require('../db-async');

const CONFIG_DEFAULTS = {
  slack_habilitado: '0',
  slack_channel_id: process.env.SLACK_CHANNEL_ID || '',
  slack_dias_anticipacion: '5',
  slack_base_url: process.env.APP_PUBLIC_URL || '',
  slack_mensaje_intro: 'es momento de revisar esta solicitud de factura.',
  slack_mensaje_pie: 'Actualiza el estado directamente en FactuFlow.'
};

const ESTADOS_RECORDATORIO = ['Borrador', 'PENDIENTE OC / HES'];

function clean(value) {
  if (value === undefined || value === null) return '';
  return String(value).trim();
}

async function getConfigValue(key) {
  const row = await db.get('SELECT value FROM app_config WHERE key = ?', [key]);
  return row && row.value !== null && row.value !== undefined ? row.value : CONFIG_DEFAULTS[key];
}

async function config() {
  const [
    slackHabilitado,
    slackChannelId,
    slackDiasAnticipacion,
    slackBaseUrl,
    slackMensajeIntro,
    slackMensajePie
  ] = await Promise.all([
    getConfigValue('slack_habilitado'),
    getConfigValue('slack_channel_id'),
    getConfigValue('slack_dias_anticipacion'),
    getConfigValue('slack_base_url'),
    getConfigValue('slack_mensaje_intro'),
    getConfigValue('slack_mensaje_pie')
  ]);
  const dias = Number(slackDiasAnticipacion) || 5;
  return {
    habilitado: slackHabilitado === '1',
    channel_id: clean(slackChannelId),
    dias_anticipacion: Math.max(0, Math.min(30, dias)),
    base_url: clean(slackBaseUrl),
    mensaje_intro: clean(slackMensajeIntro) || CONFIG_DEFAULTS.slack_mensaje_intro,
    mensaje_pie: clean(slackMensajePie),
    token_configurado: !!clean(process.env.SLACK_BOT_TOKEN)
  };
}

async function saveConfig(input = {}) {
  const rows = {
    slack_habilitado: input.habilitado ? '1' : '0',
    slack_channel_id: clean(input.channel_id),
    slack_dias_anticipacion: String(Math.max(0, Math.min(30, Number(input.dias_anticipacion) || 5))),
    slack_base_url: clean(input.base_url),
    slack_mensaje_intro: clean(input.mensaje_intro) || CONFIG_DEFAULTS.slack_mensaje_intro,
    slack_mensaje_pie: clean(input.mensaje_pie)
  };

  for (const [key, value] of Object.entries(rows)) {
    await db.run(`
      INSERT INTO app_config (key, value, updated_at)
      VALUES (?, ?, ?)
      ON CONFLICT(key) DO UPDATE SET
        value = excluded.value,
        updated_at = excluded.updated_at
    `, [key, value, db.nowText()]);
  }

  return config();
}

function chileTodayISO(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Santiago',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(date);
  const year = parts.find(p => p.type === 'year').value;
  const month = parts.find(p => p.type === 'month').value;
  const day = parts.find(p => p.type === 'day').value;
  return `${year}-${month}-${day}`;
}

function dateUTC(iso) {
  const match = String(iso || '').match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return null;
  return Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
}

function diffDays(fromISO, toISO) {
  const from = dateUTC(fromISO);
  const to = dateUTC(toISO);
  if (from === null || to === null) return null;
  return Math.round((to - from) / 86400000);
}

function lastDay(year, month) {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

function fechaObjetivo(row) {
  const periodo = String(row.periodo || '');
  const match = periodo.match(/^(\d{4})-(\d{2})$/);
  if (match) {
    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = lastDay(year, month);
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }
  return clean(row.fecha_facturacion || row.fecha_solicitud).slice(0, 10);
}

function solicitudUrl(row, cfg) {
  const base = clean(cfg.base_url).replace(/\/+$/, '');
  if (!base) return '';
  return `${base}/#/solicitudes/${row.id}`;
}

function mensajeRecordatorio(row, cfg) {
  const dias = row.dias_restantes;
  const prefijo = dias === 0 ? '*Es hoy*' : `*En ${dias} dia${dias === 1 ? '' : 's'}*`;
  const persona = row.slack_user_id ? `<@${row.slack_user_id}>` : (row.coordinador_nombre || 'equipo');
  const url = solicitudUrl(row, cfg);
  const lines = [
    `${prefijo}`,
    `Hola ${persona}, ${cfg.mensaje_intro}`,
    `*Cliente:* ${row.cliente_nombre}`,
    `*Solicitud:* ${row.folio}`,
    `*Periodo:* ${row.periodo}`,
    `*Fecha objetivo:* ${row.fecha_objetivo}`,
    `*Estado:* \`${row.estado}\``
  ];
  if (row.observaciones) lines.push(`*Observaciones:* ${row.observaciones}`);
  if (url) lines.push(`*Abrir solicitud:* ${url}`);
  if (cfg.mensaje_pie) lines.push(cfg.mensaje_pie);
  return lines.join('\n');
}

async function candidatos(cfg, nowISO = chileTodayISO()) {
  const resolvedCfg = cfg || await config();
  const rows = await db.all(`
    SELECT
      sf.id,
      sf.folio,
      sf.periodo,
      sf.fecha_solicitud,
      sf.fecha_facturacion,
      sf.estado,
      sf.observaciones,
      c.nombre_corto AS cliente_nombre,
      c.dia_facturacion,
      co.id AS coordinador_id,
      co.nombre AS coordinador_nombre,
      co.slack_user_id
    FROM solicitud_factura sf
    JOIN cliente c ON c.id = sf.cliente_id
    LEFT JOIN coordinador co ON co.id = sf.coordinador_id
    WHERE sf.is_delete = 0
      AND sf.empresa_emisora = 'MAS_CONSULTORES'
      AND sf.estado IN (${ESTADOS_RECORDATORIO.map(() => '?').join(',')})
    ORDER BY sf.periodo, c.nombre_corto, sf.folio
  `, ESTADOS_RECORDATORIO);

  return rows
    .map(row => {
      const fecha = fechaObjetivo(row);
      const diasRestantes = diffDays(nowISO, fecha);
      return {
        ...row,
        fecha_objetivo: fecha,
        dias_restantes: diasRestantes
      };
    })
    .filter(row => row.fecha_objetivo && row.dias_restantes !== null)
    .filter(row => row.dias_restantes >= 0 && row.dias_restantes <= resolvedCfg.dias_anticipacion)
    .map(row => ({
      ...row,
      puede_enviar: !!(resolvedCfg.channel_id && row.slack_user_id),
      texto: mensajeRecordatorio(row, resolvedCfg)
    }));
}

async function slackPost(path, payload) {
  const token = clean(process.env.SLACK_BOT_TOKEN);
  if (!token) throw Object.assign(new Error('SLACK_BOT_TOKEN no esta configurado'), { code: 'SLACK_TOKEN_MISSING' });
  const { data } = await axios.post(`https://slack.com/api/${path}`, payload, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json; charset=utf-8'
    },
    timeout: 12000
  });
  if (!data || data.ok !== true) {
    const parts = [data && data.error ? data.error : 'Slack rechazo la solicitud'];
    if (data && data.needed) parts.push(`permiso requerido: ${data.needed}`);
    if (data && data.provided) parts.push(`permisos actuales: ${data.provided}`);
    throw Object.assign(new Error(parts.join(' | ')), { code: 'SLACK_API_ERROR', details: data });
  }
  return data;
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function test() {
  return slackPost('auth.test', {});
}

async function enviarRecordatorios(options = {}) {
  const cfg = await config();
  if (!cfg.habilitado && !options.force) {
    throw Object.assign(new Error('Bot de Slack deshabilitado. Activalo y guarda la configuracion antes de enviar.'), { code: 'SLACK_DISABLED' });
  }
  if (!cfg.channel_id) throw Object.assign(new Error('Configura un canal Slack antes de enviar'), { code: 'SLACK_CHANNEL_MISSING' });
  const rows = await candidatos(cfg, options.nowISO || chileTodayISO());
  const enviados = [];
  const errores = [];

  for (const row of rows) {
    if (!row.slack_user_id) {
      errores.push({ solicitud_id: row.id, folio: row.folio, error: 'Coordinador sin Slack ID' });
      continue;
    }
    try {
      const result = await slackPost('chat.postMessage', {
        channel: cfg.channel_id,
        text: row.texto,
        unfurl_links: false,
        unfurl_media: false
      });
      await db.run(`
        INSERT INTO slack_notificacion_log
          (id, solicitud_id, channel_id, coordinador_id, slack_user_id, message_ts, status, texto)
        VALUES (?, ?, ?, ?, ?, ?, 'sent', ?)
      `, [uuidv4(), row.id, cfg.channel_id, row.coordinador_id, row.slack_user_id, result.ts || null, row.texto]);
      enviados.push({ solicitud_id: row.id, folio: row.folio, cliente: row.cliente_nombre, ts: result.ts || null });
      await delay(1000);
    } catch (e) {
      await db.run(`
        INSERT INTO slack_notificacion_log
          (id, solicitud_id, channel_id, coordinador_id, slack_user_id, status, error, texto)
        VALUES (?, ?, ?, ?, ?, 'error', ?, ?)
      `, [uuidv4(), row.id, cfg.channel_id, row.coordinador_id, row.slack_user_id, e.message, row.texto]);
      errores.push({ solicitud_id: row.id, folio: row.folio, error: e.message });
    }
  }

  return { enviados, errores, total_candidatos: rows.length };
}

module.exports = {
  candidatos,
  config,
  enviarRecordatorios,
  saveConfig,
  test
};
