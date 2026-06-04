window.IntegracionesService = {
  uf(fecha) { return Api.get('/uf?fecha=' + encodeURIComponent(fecha)); },
  slackConfig() { return Api.get('/admin/slack/config'); },
  slackGuardarConfig(payload) { return Api.put('/admin/slack/config', payload); },
  slackPreview() { return Api.get('/admin/slack/preview'); },
  slackTest() { return Api.post('/admin/slack/test', {}); },
  slackEnviar() { return Api.post('/admin/slack/send', {}); }
};
