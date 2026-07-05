window.ConfiguracionView = {
  _slackRows: [],

  render() {
    UI.setTitle('Configuracion');
    const hoy = new Date().toISOString().slice(0, 10);
    const slackBotEnabled = !!(AppConfig.features && AppConfig.features.slackBot);
    $('#view-root').html(`
      <div class="row g-3">
        <div class="col-lg-5 config-uf-section">
          <div class="card h-100">
            <div class="card-header">UF</div>
            <div class="card-body">
              <p class="small text-muted">Fuente: SII con cache local y fallback externo.</p>
              <div class="input-group input-group-sm mb-2">
                <input class="form-control" type="date" id="uf-test-fecha" value="${hoy}">
                <button class="btn btn-outline-primary" id="btn-test-uf">Consultar</button>
              </div>
              <div id="uf-result"></div>
            </div>
          </div>
        </div>

        <div class="col-lg-7 config-slack-section">
          <div class="card h-100">
            <div class="card-header d-flex justify-content-between align-items-center">
              <span>Bot de Slack</span>
              <span id="slack-token-status" class="badge text-bg-secondary">Revisando</span>
            </div>
            <div class="card-body">
              <div class="row g-2">
                <div class="col-md-4">
                  <label class="form-label small">Bot activo</label>
                  <select class="form-select form-select-sm" id="slack-habilitado">
                    <option value="0">Deshabilitado</option>
                    <option value="1">Habilitado</option>
                  </select>
                </div>
                <div class="col-md-4">
                  <label class="form-label small">Canal Slack</label>
                  <input class="form-control form-control-sm" id="slack-channel" placeholder="C09...">
                </div>
                <div class="col-md-4">
                  <label class="form-label small">Dias antes fin de mes</label>
                  <input class="form-control form-control-sm" type="number" min="0" max="30" id="slack-dias" value="5">
                </div>
                <div class="col-12">
                  <label class="form-label small">URL plataforma</label>
                  <input class="form-control form-control-sm" id="slack-base-url" placeholder="https://facturapp...">
                </div>
                <div class="col-12">
                  <label class="form-label small">Texto principal</label>
                  <input class="form-control form-control-sm" id="slack-intro" placeholder="es momento de revisar esta solicitud de factura.">
                </div>
                <div class="col-12">
                  <label class="form-label small">Texto cierre</label>
                  <input class="form-control form-control-sm" id="slack-pie" placeholder="Actualiza el estado directamente en FactuFlow.">
                </div>
              </div>

              <div class="d-flex flex-wrap gap-2 mt-3">
                <button class="btn btn-primary btn-sm" id="btn-slack-save"><i class="bi bi-save"></i> Guardar</button>
                <button class="btn btn-outline-secondary btn-sm" id="btn-slack-test"><i class="bi bi-plug"></i> Probar token</button>
                <button class="btn btn-outline-primary btn-sm" id="btn-slack-preview"><i class="bi bi-eye"></i> Vista previa</button>
                <button class="btn btn-outline-success btn-sm" id="btn-slack-send"><i class="bi bi-send"></i> Enviar recordatorios</button>
              </div>
              <div id="slack-result" class="mt-3"></div>
            </div>
          </div>
        </div>

        <div class="col-12 config-slack-section">
          <div class="card">
            <div class="card-header d-flex justify-content-between align-items-center">
              <span>Recordatorios detectados</span>
              <small class="text-muted" id="slack-preview-count">Sin previsualizar</small>
            </div>
            <div class="table-responsive">
              <table class="table table-sm align-middle mb-0">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Cliente</th>
                    <th>Solicitud</th>
                    <th>Responsable</th>
                    <th>Dias</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody id="slack-preview-rows">
                  <tr><td colspan="6" class="text-center text-muted py-3">Usa Vista previa para revisar antes de enviar.</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    `);

    $('#btn-test-uf').on('click', () => ConfiguracionView._testUF());
    if (!slackBotEnabled) {
      $('.config-slack-section').remove();
      $('.config-uf-section').removeClass('col-lg-5').addClass('col-lg-6');
      return;
    }

    $('#btn-slack-save').on('click', () => ConfiguracionView._guardarSlack());
    $('#btn-slack-test').on('click', () => ConfiguracionView._testSlack());
    $('#btn-slack-preview').on('click', () => ConfiguracionView._previewSlack());
    $('#btn-slack-send').on('click', () => ConfiguracionView._enviarSlack());
    ConfiguracionView._cargarSlack();
  },

  _testUF() {
    const f = $('#uf-test-fecha').val();
    IntegracionesService.uf(f).then(d => {
      $('#uf-result').html(`<span class="badge bg-success">UF ${d.fecha}: $${d.valor.toLocaleString('es-CL')}</span>
        <small class="text-muted d-block">${d.cached ? 'Desde cache' : 'Obtenida ahora'} - ${d.source || ''}</small>`);
    }).fail(e => $('#uf-result').html(`<span class="badge bg-danger">${ConfiguracionView._esc(e.message)}</span>`));
  },

  _cargarSlack() {
    IntegracionesService.slackConfig().then(cfg => {
      ConfiguracionView._pintarSlackConfig(cfg);
    }).fail(e => {
      $('#slack-result').html(`<div class="alert alert-danger py-2 mb-0">${ConfiguracionView._esc(e.message || 'No se pudo cargar Slack')}</div>`);
    });
  },

  _pintarSlackConfig(cfg) {
    $('#slack-habilitado').val(cfg.habilitado ? '1' : '0');
    $('#slack-channel').val(cfg.channel_id || '');
    $('#slack-dias').val(cfg.dias_anticipacion || 5);
    $('#slack-base-url').val(cfg.base_url || '');
    $('#slack-intro').val(cfg.mensaje_intro || '');
    $('#slack-pie').val(cfg.mensaje_pie || '');
    $('#slack-token-status')
      .toggleClass('text-bg-success', !!cfg.token_configurado)
      .toggleClass('text-bg-warning', !cfg.token_configurado)
      .removeClass('text-bg-secondary')
      .text(cfg.token_configurado ? 'Token configurado' : 'Falta token');
  },

  _payloadSlack() {
    return {
      habilitado: $('#slack-habilitado').val() === '1',
      channel_id: $('#slack-channel').val().trim(),
      dias_anticipacion: Number($('#slack-dias').val()) || 5,
      base_url: $('#slack-base-url').val().trim(),
      mensaje_intro: $('#slack-intro').val().trim(),
      mensaje_pie: $('#slack-pie').val().trim()
    };
  },

  _guardarSlack() {
    $('#slack-result').html('<div class="text-muted small">Guardando configuracion...</div>');
    IntegracionesService.slackGuardarConfig(ConfiguracionView._payloadSlack()).then(cfg => {
      ConfiguracionView._pintarSlackConfig(cfg);
      $('#slack-result').html('<div class="alert alert-success py-2 mb-0">Configuracion Slack guardada.</div>');
    }).fail(e => {
      $('#slack-result').html(`<div class="alert alert-danger py-2 mb-0">${ConfiguracionView._esc(e.message || 'No se pudo guardar')}</div>`);
    });
  },

  _testSlack() {
    $('#slack-result').html('<div class="text-muted small">Probando token...</div>');
    IntegracionesService.slackTest().then(result => {
      $('#slack-result').html(`<div class="alert alert-success py-2 mb-0">Slack conectado: ${ConfiguracionView._esc(result.team || '')} / ${ConfiguracionView._esc(result.user || '')}</div>`);
      ConfiguracionView._cargarSlack();
    }).fail(e => {
      $('#slack-result').html(`<div class="alert alert-danger py-2 mb-0">${ConfiguracionView._esc(e.message || 'No se pudo conectar con Slack')}</div>`);
    });
  },

  _previewSlack() {
    $('#slack-preview-rows').html('<tr><td colspan="6" class="text-center text-muted py-3">Cargando...</td></tr>');
    IntegracionesService.slackPreview().then(data => {
      ConfiguracionView._pintarSlackConfig(data.config || {});
      ConfiguracionView._renderSlackRows(data.rows || []);
    }).fail(e => {
      $('#slack-preview-rows').html(`<tr><td colspan="6" class="text-center text-danger py-3">${ConfiguracionView._esc(e.message || 'No se pudo previsualizar')}</td></tr>`);
    });
  },

  _renderSlackRows(rows) {
    ConfiguracionView._slackRows = rows;
    $('#slack-preview-count').text(`${rows.length} recordatorio${rows.length === 1 ? '' : 's'}`);
    if (!rows.length) {
      $('#slack-preview-rows').html('<tr><td colspan="6" class="text-center text-muted py-3">No hay solicitudes dentro de la ventana configurada.</td></tr>');
      return;
    }
    $('#slack-preview-rows').html(rows.map(row => `
      <tr>
        <td>${ConfiguracionView._esc(row.fecha_objetivo || '')}</td>
        <td><strong>${ConfiguracionView._esc(row.cliente_nombre || '')}</strong></td>
        <td><a href="#/solicitudes/${row.id}">${ConfiguracionView._esc(row.folio || '')}</a></td>
        <td>
          ${ConfiguracionView._esc(row.coordinador_nombre || 'Sin responsable')}
          ${row.slack_user_id ? `<small class="text-muted d-block">${ConfiguracionView._esc(row.slack_user_id)}</small>` : '<small class="text-warning d-block">Sin Slack ID</small>'}
        </td>
        <td>${row.dias_restantes === 0 ? 'Hoy' : row.dias_restantes}</td>
        <td>${UI.estadoChip(row.estado)}</td>
      </tr>
    `).join(''));
  },

  _enviarSlack() {
    const total = ConfiguracionView._slackRows.length;
    const msg = total
      ? `Enviar ${total} recordatorio${total === 1 ? '' : 's'} por Slack?`
      : 'No has previsualizado recordatorios. Enviar de todos modos si existen candidatos?';
    if (!confirm(msg)) return;

    $('#slack-result').html('<div class="text-muted small">Enviando recordatorios...</div>');
    IntegracionesService.slackEnviar().then(result => {
      const errores = result.errores || [];
      const enviados = result.enviados || [];
      const detail = errores.length ? `
        <div class="mt-2 small">
          ${errores.slice(0, 8).map(e => `
            <div><strong>${ConfiguracionView._esc(e.folio || 'Solicitud')}:</strong> ${ConfiguracionView._esc(e.error || 'Error Slack')}</div>
          `).join('')}
        </div>
      ` : '';
      $('#slack-result').html(`
        <div class="alert ${errores.length ? 'alert-warning' : 'alert-success'} py-2 mb-0">
          Enviados: ${enviados.length}. Errores: ${errores.length}.
          ${detail}
        </div>
      `);
      ConfiguracionView._previewSlack();
    }).fail(e => {
      $('#slack-result').html(`<div class="alert alert-danger py-2 mb-0">${ConfiguracionView._esc(e.message || 'No se pudo enviar')}</div>`);
    });
  },

  _esc(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
};
