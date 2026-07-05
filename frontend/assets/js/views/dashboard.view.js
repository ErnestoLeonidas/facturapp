window.DashboardView = {
  render() {
    $('#page-title').empty();

    $('#view-root').html(`
      <section class="home-hero mb-3">
        <div class="home-hero-copy">
          <small class="text-muted">FactuFlow</small>
          <h3 class="mb-1">Bienvenido Masit@</h3>
          <p class="text-muted mb-0">¿Qué deseas hacer hoy?</p>
        </div>
        <div class="home-hero-actions">
          <a href="#/solicitudes/nueva" class="btn btn-primary btn-lg home-main-action">
            <i class="bi bi-plus-lg"></i>
            <span>Crear solicitud</span>
          </a>
          <button type="button" class="btn btn-outline-secondary btn-lg" id="home-duplicate-btn">
            <i class="bi bi-files"></i>
            <span>Duplicar solicitud anterior</span>
          </button>
        </div>
      </section>

      <section class="home-grid mb-3">
        <div class="card home-search-card">
          <div class="card-body">
            <form id="home-search-form" class="home-search-form">
              <label class="form-label fw-semibold" for="home-search-input">Busqueda rapida</label>
              <div class="input-group input-group-lg">
                <span class="input-group-text"><i class="bi bi-search"></i></span>
                <input class="form-control" id="home-search-input" name="q" placeholder="Buscar por cliente, folio u OC" autocomplete="off">
                <button class="btn btn-primary" type="submit">Buscar</button>
              </div>
              <div id="home-search-suggestions" class="home-search-suggestions d-none" aria-live="polite" aria-hidden="true"></div>
            </form>
          </div>
        </div>

        <div class="home-access-grid" aria-label="Accesos utiles">
          <a class="home-access-card" href="#/solicitudes">
            <span class="home-access-icon"><i class="bi bi-file-earmark-text"></i></span>
            <span>
              <strong>Solicitudes</strong>
              <small>Buscar y revisar</small>
            </span>
          </a>
          <a class="home-access-card" href="#/clientes">
            <span class="home-access-icon"><i class="bi bi-building"></i></span>
            <span>
              <strong>Clientes</strong>
              <small>Datos y receptores</small>
            </span>
          </a>
          <a class="home-access-card" href="#/historial-uf">
            <span class="home-access-icon"><i class="bi bi-graph-up"></i></span>
            <span>
              <strong>Historial UF</strong>
              <small>Valores disponibles</small>
            </span>
          </a>
        </div>
      </section>

      <section class="card home-recent-card">
        <div class="card-header d-flex justify-content-between align-items-center">
          <span>Solicitudes recientes</span>
          <a href="#/solicitudes" class="btn btn-sm btn-outline-secondary">Ver todas</a>
        </div>
        <div class="card-body p-0">
          <div id="home-recent-list" class="home-recent-list">
            <div class="text-center py-4">
              <div class="spinner-border spinner-border-sm" role="status"></div>
            </div>
          </div>
        </div>
      </section>

      <div class="modal fade" id="home-duplicate-modal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-lg modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Duplicar solicitud anterior</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
            </div>
            <div class="modal-body">
              <label class="form-label fw-semibold" for="home-duplicate-client-input">Cliente</label>
              <div class="cliente-autocomplete">
                <div class="input-group">
                  <span class="input-group-text"><i class="bi bi-search"></i></span>
                  <input class="form-control" id="home-duplicate-client-input" placeholder="Escribe nombre, razon social o RUT" autocomplete="off">
                  <button class="btn btn-outline-secondary" type="button" id="home-duplicate-client-clear" title="Limpiar cliente">
                    <i class="bi bi-x-lg"></i>
                  </button>
                </div>
                <input type="hidden" id="home-duplicate-client" value="">
                <div class="cliente-suggestions d-none" id="home-duplicate-client-suggestions"></div>
              </div>
              <div id="home-duplicate-results" class="home-duplicate-results mt-3">
                <div class="text-muted small">Busca un cliente para ver sus ultimas solicitudes.</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `);

    $('#home-search-form').on('submit', e => {
      e.preventDefault();
      const q = String($('#home-search-input').val() || '').trim();
      location.hash = q ? '#/solicitudes?q=' + encodeURIComponent(q) : '#/solicitudes';
    });

    DashboardView._initHomeSearch();
    DashboardView._initDuplicarModal();

    SolicitudesService.list({ limit: 12 }).then(data => {
      const rows = DashboardView._normalizarLista(data)
        .sort((a, b) => DashboardView._fechaComparable(b) - DashboardView._fechaComparable(a))
        .slice(0, 6);
      DashboardView._renderRecientes(rows);
    }).fail(e => {
      const msg = DashboardView._esc(e.message || 'No se pudieron cargar las solicitudes recientes');
      $('#home-recent-list').html(`<div class="text-danger small p-3">${msg}</div>`);
    });
  },

  _initDuplicarModal() {
    const $modal = $('#home-duplicate-modal');
    const modal = new bootstrap.Modal($modal[0]);
    const $client = $('#home-duplicate-client');
    const $input = $('#home-duplicate-client-input');
    const $suggestions = $('#home-duplicate-client-suggestions');
    const $clear = $('#home-duplicate-client-clear');
    const $results = $('#home-duplicate-results');

    $('#home-duplicate-btn').on('click', () => {
      modal.show();
      DashboardView._ensureClientes().then(() => {
        setTimeout(() => $input.trigger('focus'), 180);
      }).fail(e => {
        $results.html(`<div class="alert alert-danger py-2 mb-0">${DashboardView._esc(e.message || 'No se pudieron cargar los clientes')}</div>`);
      });
    });

    const renderClientSuggestions = () => {
      const q = $input.val();
      const rows = DashboardView._clientesFiltrados(q, 8);
      if (!String(q || '').trim()) {
        $suggestions.addClass('d-none').empty();
        return;
      }
      if (!rows.length) {
        $suggestions.removeClass('d-none').html('<div class="cliente-suggestion-empty">No encontramos ese cliente</div>');
        return;
      }
      $suggestions.removeClass('d-none').html(rows.map(c => DashboardView._renderClienteSuggestion(c, 'duplicate')).join(''));
    };

    $input.on('input focus', () => {
      $client.val('');
      renderClientSuggestions();
      if (!String($input.val() || '').trim()) {
        $results.html('<div class="text-muted small">Busca un cliente para ver sus ultimas solicitudes.</div>');
      }
    });

    $clear.on('click', () => {
      $input.val('');
      $client.val('');
      $suggestions.addClass('d-none').empty();
      $results.html('<div class="text-muted small">Busca un cliente para ver sus ultimas solicitudes.</div>');
      $input.trigger('focus');
    });

    $suggestions.on('click', '[data-home-select-client]', function() {
      const clienteId = $(this).data('home-select-client');
      const cliente = DashboardView._clienteById(clienteId);
      $client.val(clienteId);
      $input.val((cliente && cliente.nombre_corto) || '');
      $suggestions.addClass('d-none').empty();
      DashboardView._loadDuplicarSolicitudes(clienteId);
    });

    $results.on('click', '[data-duplicate-solicitud]', function() {
      const id = $(this).data('duplicate-solicitud');
      const $btn = $(this);
      $btn.prop('disabled', true).html('<span class="spinner-border spinner-border-sm"></span> Duplicando');
      if (AuthService.isPlatformUser && AuthService.isPlatformUser()) {
        modal.hide();
        location.hash = '#/solicitudes/nueva?duplicar=' + encodeURIComponent(id);
        $btn.prop('disabled', false).text('Duplicar');
        return;
      }
      SolicitudesService.duplicar(id).then(s => {
        modal.hide();
        UI.toast('Solicitud duplicada', 'success');
        location.hash = '#/solicitudes/' + encodeURIComponent(s.id);
      }).fail(e => {
        UI.toast(e.message || 'No se pudo duplicar', 'danger');
      }).always(() => {
        $btn.prop('disabled', false).text('Duplicar');
      });
    });

    $(document).off('click.homeDuplicateClient').on('click.homeDuplicateClient', e => {
      if (!$(e.target).closest('#home-duplicate-modal .cliente-autocomplete').length) {
        $suggestions.addClass('d-none');
      }
    });
  },

  _initHomeSearch() {
    const $input = $('#home-search-input');
    const $box = $('#home-search-suggestions');
    if (!$input.length) return;

    let timer = null;
    let seq = 0;

    const closeSuggestions = (clearContent = false) => {
      clearTimeout(timer);
      seq += 1;
      $box.addClass('d-none').attr('aria-hidden', 'true');
      if (clearContent) $box.empty();
    };

    const run = () => {
      const q = String($input.val() || '').trim();
      const token = ++seq;
      clearTimeout(timer);
      if (!q) {
        closeSuggestions(true);
        return;
      }
      timer = setTimeout(() => {
        $box.removeClass('d-none').attr('aria-hidden', 'false').html('<div class="home-suggestion-loading"><span class="spinner-border spinner-border-sm"></span> Buscando...</div>');
        DashboardView._ensureClientes().then(clientes => {
          const clientesRows = DashboardView._clientesFiltrados(q, 5, clientes);
          SolicitudesService.list({ q }).then(data => {
            if (token !== seq) return;
            const solicitudes = DashboardView._normalizarLista(data)
              .sort((a, b) => DashboardView._fechaComparable(b) - DashboardView._fechaComparable(a))
              .slice(0, 6);
            DashboardView._renderHomeSearchResults(q, clientesRows, solicitudes);
          }).fail(e => {
            if (token !== seq) return;
            DashboardView._renderHomeSearchResults(q, clientesRows, [], e.message || 'No se pudieron buscar solicitudes');
          });
        }).fail(e => {
          if (token !== seq) return;
          $box.removeClass('d-none').attr('aria-hidden', 'false').html(`<div class="cliente-suggestion-empty">No se pudieron cargar clientes: ${DashboardView._esc(e.message || '')}</div>`);
        });
      }, 220);
    };

    $input.on('input focus', run);
    $input.on('keydown', e => {
      if (e.key === 'Escape') {
        e.preventDefault();
        closeSuggestions();
        $input.trigger('blur');
      }
    });

    $box.on('click', '[data-home-create-client]', function(e) {
      e.preventDefault();
      closeSuggestions();
      location.hash = '#/solicitudes/nueva?clienteId=' + encodeURIComponent($(this).data('home-create-client'));
    });
    $box.on('click', '[data-home-view-client]', function(e) {
      e.preventDefault();
      closeSuggestions();
      location.hash = '#/solicitudes?clienteId=' + encodeURIComponent($(this).data('home-view-client'));
    });
    $box.on('click', '[data-home-duplicate-client]', function(e) {
      e.preventDefault();
      closeSuggestions();
      DashboardView._duplicarUltimaCliente($(this).data('home-duplicate-client'), $(this));
    });
    $box.on('click', '[data-home-open-solicitud]', function(e) {
      e.preventDefault();
      closeSuggestions();
      location.hash = '#/solicitudes/' + encodeURIComponent($(this).data('home-open-solicitud'));
    });

    $(document).off('click.homeSearch').on('click.homeSearch', e => {
      if (!$(e.target).closest('.home-search-card').length) closeSuggestions();
    });
    $(document).off('keydown.homeSearch').on('keydown.homeSearch', e => {
      if (e.key === 'Escape' && !$box.hasClass('d-none')) {
        e.preventDefault();
        closeSuggestions();
        $input.trigger('focus');
      }
    });
  },

  _renderHomeSearchResults(q, clientes, solicitudes, errorMessage) {
    const $box = $('#home-search-suggestions');
    const clienteHtml = (clientes || []).map(c => `
      <article class="home-suggestion-item home-suggestion-client">
        <div class="home-suggestion-main">
          <small class="home-suggestion-kind">Cliente</small>
          <strong>${DashboardView._esc(c.nombre_corto || '')}</strong>
          <span>${DashboardView._esc(c.razon_social || '')}</span>
          <small class="text-muted">${DashboardView._esc(c.rut || '')}</small>
        </div>
        <div class="home-suggestion-actions">
          <button class="btn btn-sm btn-primary" type="button" data-home-create-client="${DashboardView._esc(c.id)}">Crear solicitud</button>
          <button class="btn btn-sm btn-outline-secondary" type="button" data-home-view-client="${DashboardView._esc(c.id)}">Ver solicitudes</button>
          <button class="btn btn-sm btn-outline-success" type="button" data-home-duplicate-client="${DashboardView._esc(c.id)}">Duplicar ultima</button>
        </div>
      </article>
    `).join('');

    const solicitudHtml = (solicitudes || []).map(s => {
      const fecha = s.fecha_solicitud || (s.created_at && String(s.created_at).slice(0, 10)) || '';
      return `
        <article class="home-suggestion-item">
          <div class="home-suggestion-main">
            <small class="home-suggestion-kind">Solicitud</small>
            <strong>${DashboardView._esc(s.folio || 'Sin folio')}</strong>
            <span>${DashboardView._esc(s.cliente_nombre || 'Sin cliente')}</span>
            <small class="text-muted">${DashboardView._esc(Format.fecha(fecha) || fecha || 'Sin fecha')}${s.estado ? ' - ' + DashboardView._esc(s.estado) : ''}</small>
          </div>
          <div class="home-suggestion-actions">
            <button class="btn btn-sm btn-outline-primary" type="button" data-home-open-solicitud="${DashboardView._esc(s.id)}">Ver</button>
          </div>
        </article>
      `;
    }).join('');

    if (!clienteHtml && !solicitudHtml) {
      $box.removeClass('d-none').attr('aria-hidden', 'false').html('<div class="cliente-suggestion-empty">No encontramos resultados para esta busqueda</div>');
      return;
    }

    $box.removeClass('d-none').attr('aria-hidden', 'false').html(`
      ${errorMessage ? `<div class="alert alert-warning py-2 mb-2">${DashboardView._esc(errorMessage)}</div>` : ''}
      ${clienteHtml ? `<div class="home-suggestion-section"><div class="home-suggestion-heading">Clientes encontrados</div>${clienteHtml}</div>` : ''}
      ${solicitudHtml ? `<div class="home-suggestion-section"><div class="home-suggestion-heading">Solicitudes encontradas</div>${solicitudHtml}</div>` : ''}
    `);
  },

  _loadDuplicarSolicitudes(clienteId) {
    const $results = $('#home-duplicate-results');
    if (!clienteId) {
      $results.html('<div class="text-muted small">Busca un cliente para ver sus ultimas solicitudes.</div>');
      return;
    }
    $results.html('<div class="text-center py-3"><div class="spinner-border spinner-border-sm"></div></div>');
    SolicitudesService.list({ clienteId }).then(data => {
      const rows = DashboardView._normalizarLista(data)
        .sort((a, b) => DashboardView._fechaComparable(b) - DashboardView._fechaComparable(a))
        .slice(0, 8);
      DashboardView._renderDuplicarResultados(rows);
    }).fail(e => {
      $results.html(`<div class="alert alert-danger py-2 mb-0">${DashboardView._esc(e.message || 'No se pudieron cargar solicitudes')}</div>`);
    });
  },

  _duplicarUltimaCliente(clienteId, $btn) {
    const originalText = $btn && $btn.text ? $btn.text() : '';
    if ($btn && $btn.prop) $btn.prop('disabled', true).text('Buscando...');
    return SolicitudesService.list({ clienteId }).then(data => {
      const rows = DashboardView._normalizarLista(data)
        .sort((a, b) => DashboardView._fechaComparable(b) - DashboardView._fechaComparable(a));
      if (!rows.length) {
        UI.toast('Este cliente no tiene solicitudes anteriores para duplicar', 'info');
        return;
      }
      location.hash = '#/solicitudes/nueva?duplicar=' + encodeURIComponent(rows[0].id);
    }).fail(e => {
      UI.toast(e.message || 'No se pudo buscar la ultima solicitud', 'danger');
    }).always(() => {
      if ($btn && $btn.prop) $btn.prop('disabled', false).text(originalText || 'Duplicar ultima');
    });
  },

  _ensureClientes() {
    if (DashboardView._clientesCache) return $.Deferred().resolve(DashboardView._clientesCache).promise();
    if (DashboardView._clientesLoading) return DashboardView._clientesLoading;
    DashboardView._clientesLoading = ClientesService.list({ estado: 'Activo' }).then(clientes => {
      DashboardView._clientesCache = clientes || [];
      return DashboardView._clientesCache;
    }).always(() => {
      DashboardView._clientesLoading = null;
    });
    return DashboardView._clientesLoading;
  },

  _clientesFiltrados(query, limit = 8, clientes) {
    const q = DashboardView._normalizarTexto(query);
    if (!q) return [];
    return (clientes || DashboardView._clientesCache || [])
      .filter(c => DashboardView._clienteHaystack(c).includes(q))
      .slice(0, limit);
  },

  _clienteHaystack(cliente) {
    return DashboardView._normalizarTexto([
      cliente && cliente.nombre_corto,
      cliente && cliente.razon_social,
      cliente && cliente.rut
    ].filter(Boolean).join(' '));
  },

  _clienteById(id) {
    return (DashboardView._clientesCache || []).find(c => String(c.id) === String(id));
  },

  _renderClienteSuggestion(c, context) {
    const attr = context === 'duplicate' ? 'data-home-select-client' : 'data-home-client';
    return `
      <button type="button" class="cliente-suggestion" ${attr}="${DashboardView._esc(c.id)}">
        <strong>${DashboardView._esc(c.nombre_corto || '')}</strong>
        <span>${DashboardView._esc(c.razon_social || '')}</span>
        <small>${DashboardView._esc(c.rut || '')}</small>
      </button>
    `;
  },

  _renderDuplicarResultados(rows) {
    const $results = $('#home-duplicate-results');
    if (!rows.length) {
      $results.html('<div class="alert alert-info mb-0">Este cliente no tiene solicitudes anteriores para duplicar.</div>');
      return;
    }
    const showEstado = !(AuthService.isPlatformUser && AuthService.isPlatformUser());
    $results.html(rows.map(s => {
      const fecha = s.fecha_solicitud || (s.created_at && String(s.created_at).slice(0, 10)) || '';
      const total = Number(s.monto_total_clp) > 0 ? Format.clp(s.monto_total_clp) : '';
      return `
        <article class="home-duplicate-item">
          <div>
            <strong>${DashboardView._esc(s.folio || 'Sin folio')}</strong>
            <span>${DashboardView._esc(s.periodo || '')}</span>
            <small class="text-muted">${DashboardView._esc(Format.fecha(fecha) || fecha || 'Sin fecha')}</small>
          </div>
          <div class="home-duplicate-meta">
            ${showEstado ? UI.estadoChip(s.estado || '') : ''}
            ${total ? `<strong>${DashboardView._esc(total)}</strong>` : ''}
            <button class="btn btn-sm btn-primary" type="button" data-duplicate-solicitud="${DashboardView._esc(s.id)}">Duplicar</button>
          </div>
        </article>
      `;
    }).join(''));
  },

  _renderRecientes(rows) {
    if (!rows.length) {
      $('#home-recent-list').html(`
        <div class="text-center text-muted py-4">
          Aun no hay solicitudes para mostrar.
        </div>
      `);
      return;
    }

    const showEstado = !(AuthService.isPlatformUser && AuthService.isPlatformUser());
    $('#home-recent-list').html(rows.map(s => {
      const fecha = s.fecha_solicitud || (s.created_at && String(s.created_at).slice(0, 10)) || '';
      const total = Number(s.monto_total_clp) > 0 ? Format.clp(s.monto_total_clp) : '';
      return `
        <article class="home-recent-item">
          <div class="home-recent-main">
            <strong>${DashboardView._esc(s.folio || 'Sin folio')}</strong>
            <span>${DashboardView._esc(s.cliente_nombre || 'Sin cliente')}</span>
            <small class="text-muted">${DashboardView._esc(Format.fecha(fecha) || fecha || 'Sin fecha')}</small>
          </div>
          <div class="home-recent-meta">
            ${showEstado ? UI.estadoChip(s.estado || '') : ''}
            ${total ? `<strong>${DashboardView._esc(total)}</strong>` : ''}
            <a class="btn btn-sm btn-outline-primary" href="#/solicitudes/${encodeURIComponent(s.id)}">Ver</a>
          </div>
        </article>
      `;
    }).join(''));
  },

  _normalizarLista(data) {
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.items)) return data.items;
    return [];
  },

  _fechaComparable(row) {
    const raw = row && (row.created_at || row.fecha_solicitud || row.updated_at);
    const time = raw ? new Date(raw).getTime() : 0;
    return Number.isFinite(time) ? time : 0;
  },

  _normalizarTexto(value) {
    return String(value || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  },

  _esc(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
};
