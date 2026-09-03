window.SolicitudesView = {
  list(initialParams = {}) {
    UI.setTitle('Solicitudes');
    const isPlatform = SolicitudesView._isPlatformUser();
    const periodoActual = SolicitudesView._periodoActual();
    const periodoInicial = initialParams.periodo || (!initialParams.q && !initialParams.clienteId && !initialParams.estado ? periodoActual : '');
    const [anioActual, mesActual] = periodoInicial ? periodoInicial.split('-') : ['', ''];
    const initialQ = SolicitudesView._esc(initialParams.q || '');
    const estadoFiltro = isPlatform ? '' : `
          <div class="col-md-2">
            <select class="form-select form-select-sm" name="estado">
              <option value="">Estado</option>
              ${(AppConfig.estadosProyecciones || []).map(e=>`<option>${e}</option>`).join('')}
            </select>
          </div>`;
    const estadoHeader = isPlatform ? '' : '<th>Estado</th>';
    const estadoColspan = isPlatform ? 8 : 9;
    $('#view-root').html(`
      <div class="card mb-3"><div class="card-body py-2">
        <form class="row g-2" id="form-filtros">
          <div class="col-md-3"><input class="form-control form-control-sm" name="q" placeholder="Buscar por cliente, folio u OC" value="${initialQ}"></div>
          <div class="col-md-2">
            <select class="form-select form-select-sm" name="clienteId" id="filtro-cliente">
              <option value="">Cliente</option>
            </select>
          </div>
          ${estadoFiltro}
          <div class="col-md-2">
            <select class="form-select form-select-sm" name="mes">
              <option value="" ${!mesActual ? 'selected' : ''}>Todos</option>
              ${SolicitudesView._meses.map((nombre, i) => `<option value="${String(i + 1).padStart(2, '0')}" ${String(i + 1).padStart(2, '0') === mesActual ? 'selected' : ''}>${nombre}</option>`).join('')}
            </select>
          </div>
          <div class="col-md-1">
            <select class="form-select form-select-sm" name="anio">
              <option value="" ${!anioActual ? 'selected' : ''}>Todos</option>
              <option value="2026" ${anioActual === '2026' ? 'selected' : ''}>2026</option>
            </select>
          </div>
          <div class="col-md-2 d-flex gap-1">
            <button class="btn btn-sm btn-outline-primary flex-grow-1" type="submit">Filtrar</button>
            <button class="btn btn-sm btn-outline-secondary" type="button" id="btn-limpiar-filtros">Limpiar filtros</button>
          </div>
        </form>
      </div></div>
      <div class="card">
        <div class="table-responsive solicitudes-table-wrap d-none d-md-block">
          <table class="table mb-0 align-middle table-hover">
            <thead><tr>
              <th>Cliente</th><th>Período</th>
              <th>Empresa</th><th>Responsable</th><th class="text-end">UF</th><th class="text-end">Neto</th><th class="text-end">Total</th>
              ${estadoHeader}<th></th>
            </tr></thead>
            <tbody id="tbl-solicitudes"><tr><td colspan="${estadoColspan}" class="text-center py-4">
              <div class="spinner-border spinner-border-sm"></div>
            </td></tr></tbody>
          </table>
        </div>
        <div id="solicitudes-mobile-list" class="solicitudes-mobile-list d-md-none">
          <div class="text-center py-4"><div class="spinner-border spinner-border-sm"></div></div>
        </div>
      </div>
    `);

    let filtrosActuales = {};
    const cargar = (params = {}) => {
      params = { ...params };
      if (isPlatform) delete params.estado;
      if (!params.periodo && !params.q && !params.clienteId && !params.estado) params.periodo = periodoActual;
      filtrosActuales = params;
      SolicitudesService.list(params).then(data => {
        if (!data.length) {
          SolicitudesView._renderSinResultados();
          return;
        }
        $('#tbl-solicitudes').html(data.map(s => {
          const empresa = SolicitudesView._empresaNombre(s.empresa_emisora || (s.empresa && s.empresa.codigo));
          return `<tr style="cursor:pointer" data-solicitud-id="${s.id}">
            <td>${s.cliente_nombre||''}</td>
            <td>${s.periodo}</td>
            <td><small>${empresa}</small></td>
            <td>${s.coordinador_nombre || '—'}</td>
            <td class="text-end"><small>${SolicitudesView._formatUFLista(s.monto_uf)}</small></td>
            <td class="text-end"><small>${Format.clp(s.monto_neto_clp)}</small></td>
            <td class="text-end">${Format.clp(s.monto_total_clp)}</td>
            ${isPlatform ? '' : `<td>${UI.estadoChip(s.estado)}</td>`}
            <td>
              <button class="btn btn-sm btn-outline-secondary" data-open-id="${s.id}" type="button">Ver</button>
              <button class="btn btn-sm btn-outline-danger ms-1" data-delete-id="${s.id}" type="button">
                <i class="bi bi-trash"></i> ${isPlatform ? 'Descartar' : 'Eliminar'}
              </button>
            </td>
          </tr>`;
        }).join(''));
        $('#solicitudes-mobile-list').html(data.map(s => SolicitudesView._renderSolicitudCard(s)).join(''));
      }).fail(e => UI.error('#tbl-solicitudes', e));
    };

    ClientesService.list({ estado: 'Activo' }).then(clientes => {
      $('#filtro-cliente').append(clientes.map(c => `<option value="${c.id}" ${c.id === initialParams.clienteId ? 'selected' : ''}>${c.nombre_corto}</option>`).join(''));
    });

    $('[name=estado]').val(initialParams.estado || '');

    cargar(initialParams);
    $('#form-filtros').on('submit', e => {
      e.preventDefault();
      const d = Object.fromEntries(new FormData(e.target).entries());
      if (d.anio && d.mes) d.periodo = `${d.anio}-${d.mes}`;
      delete d.anio;
      delete d.mes;
      Object.keys(d).forEach(k => !d[k] && delete d[k]);
      cargar(d);
    });

    $('#btn-limpiar-filtros').on('click', () => {
      if (location.hash !== '#/solicitudes') location.hash = '#/solicitudes';
      else {
        $('#form-filtros')[0].reset();
        cargar({});
      }
    });

    $('#view-root').on('click', '[data-clear-solicitudes-search]', () => {
      if (location.hash !== '#/solicitudes') location.hash = '#/solicitudes';
      else {
        $('#form-filtros')[0].reset();
        cargar({});
      }
    });

    $('#tbl-solicitudes').on('click', '[data-open-id]', function(e) {
      e.preventDefault();
      e.stopPropagation();
      location.hash = '#/solicitudes/' + $(this).data('open-id');
    });

    $('#tbl-solicitudes').on('click', '[data-solicitud-id]', function(e) {
      if ($(e.target).closest('button, a').length) return;
      location.hash = '#/solicitudes/' + $(this).data('solicitud-id');
    });

    $('#tbl-solicitudes').on('click', '[data-delete-id]', function(e) {
      e.preventDefault();
      e.stopPropagation();
      const id = $(this).data('delete-id');
      SolicitudesView._confirmDelete(id).then(deleted => {
        if (!deleted) return;
        cargar(filtrosActuales);
      });
    });
  },

  _periodoActual() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  },

  _isPlatformUser() {
    return !!(AuthService.isPlatformUser && AuthService.isPlatformUser());
  },

  _meses: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],

  _renderSinResultados() {
    const isPlatform = SolicitudesView._isPlatformUser();
    const empty = `
      <div class="text-center text-muted py-4">
        <strong class="d-block mb-1">No encontramos solicitudes con esos filtros</strong>
        <span class="d-block mb-3">Prueba con otro cliente, folio, OC${isPlatform ? '' : ', estado'} o periodo.</span>
        <button class="btn btn-sm btn-outline-secondary" type="button" data-clear-solicitudes-search>Limpiar busqueda</button>
      </div>
    `;
    $('#tbl-solicitudes').html(`<tr><td colspan="${isPlatform ? 8 : 9}">${empty}</td></tr>`);
    $('#solicitudes-mobile-list').html(empty);
  },

  _renderSolicitudCard(s) {
    const empresa = SolicitudesView._empresaNombre(s.empresa_emisora || (s.empresa && s.empresa.codigo));
    const estado = SolicitudesView._isPlatformUser() ? '' : UI.estadoChip(s.estado);
    return `
      <article class="solicitud-mobile-card" data-solicitud-id="${SolicitudesView._esc(s.id)}">
        <div class="d-flex justify-content-between gap-2">
          <div class="min-w-0">
            <strong>${SolicitudesView._esc(s.folio || 'Sin folio')}</strong>
            <span class="d-block">${SolicitudesView._esc(s.cliente_nombre || 'Sin cliente')}</span>
          </div>
          ${estado}
        </div>
        <div class="solicitud-mobile-meta">
          <span>${SolicitudesView._esc(s.periodo || '')}</span>
          <span>${SolicitudesView._esc(empresa || '')}</span>
          <span>${SolicitudesView._esc(s.coordinador_nombre || 'Sin responsable')}</span>
        </div>
        <div class="d-flex justify-content-between align-items-center gap-2 mt-2">
          <strong>${Format.clp(s.monto_total_clp)}</strong>
          <a class="btn btn-sm btn-outline-primary" href="#/solicitudes/${encodeURIComponent(s.id)}">Ver</a>
        </div>
      </article>
    `;
  },

  _formatUFLista(valor) {
    const uf = Number(valor) || 0;
    if (!uf) return '0';
    return uf.toLocaleString('es-CL', { maximumFractionDigits: 2 });
  },

  _empresaNombre(codigo) {
    const empresa = (AppConfig.empresasEmisoras || []).find(e => e.codigo === codigo);
    if (!empresa) return codigo || '';
    return empresa.nombre || empresa.razon_social || empresa.codigo;
  },

  _hoyISO() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  },

  nueva(params = {}) {
    UI.setTitle('Nueva solicitud de factura');
    if (params.duplicar) {
      UI.loading();
      SolicitudesService.get(params.duplicar).then(s => {
        SolicitudesView._renderFormView(null, SolicitudesView._buildDuplicateDraft(s));
      }).fail(e => UI.error('#view-root', e));
      return;
    }
    const clienteIdPrefill = params.clienteId || '';
    SolicitudesView._renderFormView(null, { cliente_id: clienteIdPrefill });
  },

  _buildDuplicateDraft(s) {
    const draft = {
      ...s,
      id: null,
      folio: null,
      estado: 'PENDIENTE OC / HES',
      fecha_solicitud: SolicitudesView._hoyISO(),
      cliente_id: s.cliente_id || (s.cliente && s.cliente.id) || '',
      cliente_nombre: (s.cliente && s.cliente.nombre_corto) || s.cliente_nombre || '',
      cliente: s.cliente || null,
      coordinador_id: s.coordinador_id || (s.coordinador && s.coordinador.id) || '',
      cps: (s.cps || []).map(cp => ({
        ...cp,
        id: null,
        solicitud_id: null,
        cp_id: cp.cp_id || cp.id || null,
        cp_codigo: cp.cp_codigo || cp.codigo || '',
        cp_nombre: cp.cp_nombre || cp.nombre || '',
        monto_uf: cp.monto_uf,
        monto_clp: cp.monto_clp,
        monto_clp_manual: cp.monto_clp_manual,
        monto_clp_es_manual: cp.monto_clp_es_manual
      })),
      receptores: (s.receptores || []).map(r => ({ ...r })),
      historial: [],
      _duplicado_desde: s.id
    };
    delete draft.id;
    delete draft.folio;
    delete draft.created_at;
    delete draft.updated_at;
    return draft;
  },

  detalle(params) {
    UI.loading();
    SolicitudesService.get(params.id).then(s => {
      SolicitudesView._renderFormView(s, s);
    }).fail(e => UI.error('#view-root', e));
  },

  _renderFormView(sol, prefill) {
    const isNew = !sol;
    const isPlatform = SolicitudesView._isPlatformUser();
    prefill = { ...(prefill || {}) };
    if (isNew && isPlatform && !prefill.periodo) prefill.periodo = SolicitudesView._periodoActual();
    const readonly = sol && !['PENDIENTE OC / HES','FACTURA SOLICITADA','Borrador','PendienteDatos'].includes(SolicitudesView._estadoSolicitudVisible(sol.estado));
    UI.setTitle(isNew ? 'Nueva solicitud' : 'Solicitudes');

    const estadoActual = SolicitudesView._estadoSolicitudVisible(prefill.estado || 'PENDIENTE OC / HES');
    const estadoOpts = (AppConfig.estadosProyecciones || AppConfig.estadosSolicitud).map(e =>
      `<option value="${e}" ${estadoActual===e?'selected':''}>${e}</option>`).join('');
    const estadoField = isPlatform
      ? `<input type="hidden" name="estado" value="${SolicitudesView._esc(estadoActual)}">`
      : `<div class="col-md-3">
                  <label class="form-label">Estado *</label>
                  <select class="form-select" name="estado" ${readonly?'disabled':''}>${estadoOpts}</select>
                </div>`;
    const estadoBadge = sol && !isPlatform ? ` &nbsp; ${UI.estadoChip(sol.estado)}` : '';
    const temporalStatus = isPlatform && !readonly ? `
                <div class="autosave-status is-idle" id="autosave-status" aria-live="polite">
                  <span class="autosave-dot"></span>
                  <span>Solicitud temporal. Se guardara al exportar Excel.</span>
                </div>` : '';
    const cpEditable = !readonly || SolicitudesView._esPendienteOcHes(estadoActual);
    const ufFecha = prefill.uf_fecha || SolicitudesView._hoyISO();
    const areaPlataforma = /plataforma/i.test(prefill.area || '');
    const hesValor = prefill.hes_numero || 'N/A';
    const tieneHes = String(hesValor || '').trim().toUpperCase() !== 'N/A';
    const netoManual = prefill.monto_neto_clp_manual !== null && prefill.monto_neto_clp_manual !== undefined && prefill.monto_neto_clp_manual !== '';
    const empresaActual = prefill.empresa_emisora || 'MAS_CONSULTORES';
    const empresaOpts = (AppConfig.empresasEmisoras || []).map(e =>
      `<option value="${e.codigo}" ${empresaActual === e.codigo ? 'selected' : ''}>${e.nombre}</option>`
    ).join('');
    const clienteActualId = prefill.cliente_id || (prefill.cliente && prefill.cliente.id) || '';
    const clienteNombre = (prefill.cliente && prefill.cliente.nombre_corto) || prefill.cliente_nombre || '';
    const clienteField = isPlatform
      ? `<div class="col-md-6">
                  <label class="form-label">Cliente *</label>
                  <div class="cliente-autocomplete">
                    <div class="input-group">
                      <input class="form-control" id="cliente-autocomplete-input" autocomplete="off" placeholder="Escribe nombre, razon social o RUT" value="${SolicitudesView._esc(clienteNombre)}" ${readonly?'readonly':''}>
                      <button class="btn btn-outline-secondary" type="button" id="btn-clear-cliente" title="Limpiar cliente" ${readonly?'disabled':''}>
                        <i class="bi bi-x-lg"></i>
                      </button>
                    </div>
                    <input type="hidden" name="cliente_id" id="sel-cliente" value="${SolicitudesView._esc(clienteActualId)}">
                    <div class="cliente-suggestions d-none" id="cliente-suggestions"></div>
                  </div>
                  <div class="invalid-feedback d-block" data-error-for="cliente_id"></div>
                </div>`
      : `<div class="col-md-6">
                  <label class="form-label">Cliente *</label>
                  <select class="form-select" name="cliente_id" id="sel-cliente" ${readonly?'disabled':''}>
                    <option value="">seleccionar</option>
                  </select>
                  <div class="invalid-feedback" data-error-for="cliente_id"></div>
                </div>`;
    const areaField = isPlatform
      ? '<input type="hidden" name="area_plataforma" value="1">'
      : `<div class="col-md-6">
                  <label class="form-label">Ãrea</label>
                  <div class="form-check">
                    <input class="form-check-input" type="checkbox" name="area_plataforma" id="area-plataforma" ${areaPlataforma?'checked':''} ${readonly?'disabled':''}>
                    <label class="form-check-label" for="area-plataforma">Plataforma</label>
                  </div>
                </div>`;
    const ufButton = isPlatform ? '' : '<button type="button" class="btn btn-sm btn-outline-secondary" id="btn-uf">Buscar UF</button>';

    $('#view-root').html(`
      <div class="row g-3">
        <div class="col-lg-8">
          <div class="card">
            <div class="card-header"><strong>Solicitud de Factura</strong>
              ${estadoBadge}
            </div>
            <div class="card-body">
              <div class="alert alert-warning d-none" id="solicitud-errors"></div>
              ${temporalStatus}
              <h5 class="solicitud-section-title">Datos principales</h5>
              <div class="row g-3">
                <div class="col-md-3">
                  <label class="form-label">Período *</label>
                  <input class="form-control" name="periodo" placeholder="2026-05" value="${prefill.periodo||''}" ${readonly?'readonly':''}>
                  <div class="invalid-feedback" data-error-for="periodo"></div>
                </div>

                ${estadoField}

                ${clienteField}
                <!-- legacy cliente select removed
                    <option value="">— seleccionar —</option>
                -->
                <div class="col-md-6">
                  <label class="form-label">Razón social *</label>
                  <select class="form-select" name="cliente_facturacion_id" id="sel-cliente-facturacion" ${readonly?'disabled':''}>
                    <option value="">Datos cliente 1</option>
                  </select>
                  <small class="text-muted d-block mt-1" id="cliente-facturacion-preview"></small>
                </div>
                <div class="col-md-3">
                  <label class="form-label">Responsable *</label>
                  <select class="form-select" name="coordinador_id" id="sel-coordinador" data-readonly="${readonly ? '1' : '0'}" ${readonly?'disabled':''}>
                    <option value="">Seleccionar responsable</option>
                  </select>
                  <div class="invalid-feedback" data-error-for="coordinador_id"></div>
                </div>
                <div class="col-md-3" id="field-oc">
                  <label class="form-label">OC / Nota de Pedido</label>
                  <input class="form-control" name="oc_numero" value="${prefill.oc_numero||''}" ${readonly?'readonly':''}>
                  ${isPlatform ? '<small class="text-muted d-block mt-1">Puedes dejarlo vacio si aun no lo tienes.</small>' : ''}
                </div>
                <div class="col-md-3 d-none" id="field-contrato">
                  <label class="form-label">N° contrato</label>
                  <input class="form-control" name="contrato_numero" value="${prefill.contrato_numero||''}" ${readonly?'readonly':''}>
                  ${isPlatform ? '<small class="text-muted d-block mt-1">Puedes dejarlo vacio si aun no lo tienes.</small>' : ''}
                </div>
                <div class="col-md-3">
                  <div class="d-flex justify-content-between align-items-center">
                    <label class="form-label mb-0" for="hes-numero">HES</label>
                    <div class="form-check form-check-sm">
                      <input class="form-check-input" type="checkbox" id="hes-tiene" name="hes_tiene" ${tieneHes?'checked':''} ${readonly?'disabled':''}>
                      <label class="form-check-label small" for="hes-tiene">Lleva</label>
                    </div>
                  </div>
                  <input class="form-control" id="hes-numero" name="hes_numero" placeholder="N/A" value="${tieneHes ? hesValor : 'N/A'}" ${(!tieneHes || readonly)?'readonly':''}>
                  ${isPlatform ? '<small class="text-muted d-block mt-1">Si no aplica o aun no tienes HES, dejalo como N/A.</small>' : ''}
                </div>

                <div class="col-12">
                  <label class="form-label">Glosa *</label>
                  <textarea class="form-control" name="glosa" rows="2" ${readonly?'readonly':''}>${prefill.glosa||''}</textarea>
                  <div class="invalid-feedback" data-error-for="glosa"></div>
                </div>
                ${areaField}
                <!-- legacy area selector removed
                <div class="col-md-6">
                  <label class="form-label">Área</label>
                  <div class="form-check">
                    <input class="form-check-input" type="checkbox" name="area_plataforma" id="area-plataforma" ${areaPlataforma?'checked':''} ${readonly?'disabled':''}>
                    <label class="form-check-label" for="area-plataforma">Plataforma</label>
                  </div>
                </div>
                -->
              </div>

              <hr>
              <h5 class="solicitud-section-title">Detalle y monto</h5>

              <div class="d-flex justify-content-between align-items-center mb-2">
                <h6 class="mb-0">Centros de Proyecto (CP)</h6>
                ${!readonly?'<button type="button" class="btn btn-sm btn-outline-secondary" id="btn-add-cp">+ CP</button>':''}
              </div>
              <div id="div-cps">
                <table class="table table-sm align-middle">
                  <thead><tr><th>CP del cliente</th><th class="text-end">Monto UF</th><th class="text-end">Monto CLP</th>${cpEditable?'<th></th>':''}</tr></thead>
                  <tbody id="tbody-cps"></tbody>
                </table>
                <div class="invalid-feedback d-block" data-error-for="cps"></div>
                <small class="text-muted" id="cp-alerta"></small>
              </div>

              <hr>

              <div class="d-flex justify-content-between align-items-center mb-2">
                <h6 class="mb-0">Receptores</h6>
                ${!readonly?'<button type="button" class="btn btn-sm btn-outline-secondary" id="btn-add-rec">+ Receptor</button>':''}
              </div>
              <ul class="list-group mb-3" id="lst-receptores"></ul>

              <label class="form-label">Observaciones</label>
              <textarea class="form-control" name="observaciones" rows="2" ${readonly?'readonly':''}>${prefill.observaciones||''}</textarea>
            </div>
          </div>

          ${sol && !isPlatform ? `
          <div class="card mt-3">
            <div class="card-header">Historial</div>
            <ul class="list-group list-group-flush">
              ${(sol.historial||[]).map(h => `
                <li class="list-group-item">
                  <div class="d-flex justify-content-between">
                    <span>${h.estado_desde?h.estado_desde+' → ':''}<strong>${h.estado_hacia}</strong></span>
                    <small class="text-muted">${Format.fecha(h.fecha ? h.fecha.slice(0,10) : '')}</small>
                  </div>
                  ${h.comentario?`<small class="text-muted">${h.comentario}</small>`:''}
                </li>`).join('') || '<li class="list-group-item text-muted">Sin historial</li>'}
            </ul>
          </div>` : ''}
        </div>

        <aside class="col-lg-4">
          <div class="card sticky-top solicitud-summary-card" style="top:1rem">
            <div class="card-header">Resumen</div>
            <div class="card-body">
              <div class="row g-2 mb-3">
                <div class="col-12">
                  <label class="form-label small">Facturar Por</label>
                  <select class="form-select form-select-sm" name="empresa_emisora" ${readonly?'disabled':''}>
                    ${empresaOpts}
                  </select>
                </div>
                <div class="col-6">
                  <label class="form-label small">Moneda</label>
                  <select class="form-select form-select-sm" name="moneda_base" ${readonly?'disabled':''}>
                    <option value="UF" ${(prefill.moneda_base||'UF')==='UF'?'selected':''}>UF</option>
                    <option value="CLP" ${prefill.moneda_base==='CLP'?'selected':''}>CLP / Pesos</option>
                  </select>
                </div>
                <div class="col-6">
                  <label class="form-label small">UF fecha</label>
                  <input class="form-control form-control-sm" type="date" name="uf_fecha" value="${ufFecha}">
                </div>
                <div class="col-12 d-flex gap-1">
                  <input class="form-control form-control-sm" name="uf_valor" placeholder="Valor UF" value="${prefill.uf_valor||''}" ${readonly?'readonly':''}>
                  ${ufButton}
                </div>
                <div class="col-12">
                  <small class="text-muted" id="uf-cp-help">${isPlatform ? 'La UF se actualiza al cambiar fecha o periodo.' : 'Al buscar UF se actualiza el Monto CLP del CP activo.'}</small>
                  <div class="invalid-feedback d-block" data-error-for="uf_valor"></div>
                </div>
              </div>
              <hr>
              <table class="table table-sm mb-3 resumen-table">
                <tr>
                  <td class="align-middle">
                    <div class="d-flex align-items-center gap-2">
                      <span>Neto</span>
                      <div class="form-check m-0">
                        <input class="form-check-input" type="checkbox" id="resumen-neto-manual" ${netoManual?'checked':''} ${readonly?'disabled':''}>
                        <label class="form-check-label small" for="resumen-neto-manual">Manual</label>
                      </div>
                    </div>
                  </td>
                  <td class="text-end align-middle resumen-value">
                    <input class="form-control form-control-sm text-end fw-bold" name="monto_neto_clp_manual" type="number" step="1" value="${netoManual ? prefill.monto_neto_clp_manual : (prefill.monto_neto_clp||0)}" ${(!netoManual || readonly)?'readonly':''}>
                    <div class="invalid-feedback d-block" data-error-for="monto"></div>
                  </td>
                </tr>
                <tr><td>IVA</td><td class="text-end resumen-value" id="resumen-iva">${Format.clp(prefill.monto_iva_clp||0)}</td></tr>
                <tr class="table-active"><td>Total</td><td class="text-end fw-bold resumen-value" id="resumen-total">${Format.clp(prefill.monto_total_clp||0)}</td></tr>
              </table>

              <div class="d-grid gap-2" id="botones-estado">
                <!-- se renderizan dinámicamente según estado -->
              </div>
            </div>
          </div>
        </aside>
      </div>
    `);

    // Cargar responsable de la solicitud
    const $selCoord = $('#sel-coordinador');
    const coordActual = prefill.coordinador_id || (prefill.coordinador && prefill.coordinador.id) || '';
    CoordinadoresService.list().then(coords => {
      const activos = (coords || []).filter(c => c.activo !== 0);
      SolicitudesView._allCoordinadores = activos;
      SolicitudesView._renderCoordinadoresSolicitud(coordActual);
    }).fail(() => {
      $selCoord.append('<option value="" disabled>No se pudieron cargar responsables</option>');
    });

    // Cargar clientes
    const $selCli = $('#sel-cliente');
    ClientesService.list({ estado: 'Activo' }).then(clientes => {
      SolicitudesView._clientesCache = clientes || [];
      if (isPlatform) {
        SolicitudesView._initClienteAutocomplete();
      } else {
        clientes.forEach(c => {
          const opt = $('<option>').val(c.id).text(c.nombre_corto).data('obj', c);
          if (c.id === (prefill.cliente_id || (prefill.cliente && prefill.cliente.id))) opt.prop('selected', true);
          $selCli.append(opt);
        });
      }
      const clienteActual = (prefill && prefill.cliente) || (sol && sol.cliente) || null;
      const selectedId = $selCli.val();
      if (clienteActual) {
        SolicitudesView._onClienteSeleccionado(clienteActual, prefill && prefill.receptores, prefill && prefill.cps, { preserve: true });
      } else if (selectedId) {
        ClientesService.get(selectedId).then(c => SolicitudesView._onClienteSeleccionado(c, prefill && prefill.receptores, prefill && prefill.cps, { preserve: !!(prefill && (prefill.cps || prefill.receptores)) }));
      }
    });

    $selCli.on('change', function() {
      if (isPlatform) return;
      const id = $(this).val();
      if (!id) return;
      ClientesService.get(id).then(c => SolicitudesView._onClienteSeleccionado(c, [], null, { resetDependientes: true }));
    });

    // Estado inicial
    SolicitudesView._state = {
      sol, readonly, prefill, isPlatform,
      cps: sol ? sol.cps : (prefill.cps || []),
      receptores: sol ? sol.receptores : (prefill.receptores || []),
      clienteActual: sol ? sol.cliente : (prefill.cliente || null),
      cpsDisponibles: [],
      coordinadorActual: coordActual,
      responsableSugerido: null,
      activeCpIndex: ((sol && sol.cps && sol.cps.length) || (prefill.cps && prefill.cps.length)) ? 0 : null
    };
    SolicitudesView._renderCPs();
    SolicitudesView._renderReceptores();
    SolicitudesView._renderBotones();
    SolicitudesView._syncHESField();
    SolicitudesView._syncCPsConNetoManual();
    SolicitudesView._recalcular();
    SolicitudesView._initAutosave();

    // Eventos
    $('#view-root').on('input change', 'input, select, textarea', () => SolicitudesView._clearFieldErrors());
    $('#hes-tiene').on('change', () => SolicitudesView._syncHESField());
    $('#sel-cliente-facturacion').on('change', () => SolicitudesView._mostrarDatosFacturacionSeleccionados());
    $('[name=empresa_emisora]').on('change', () => SolicitudesView._recalcular());

    $('#resumen-neto-manual').on('change', function() {
      const checked = $(this).is(':checked');
      const $manual = $('[name=monto_neto_clp_manual]');
      $manual.prop('readonly', !checked || SolicitudesView._state.readonly);
      if (!checked) $manual.val(SolicitudesView._lastNetoAutomatico || 0);
      else if (!$manual.val()) $manual.val(SolicitudesView._lastNetoAutomatico || 0);
      SolicitudesView._syncCPsConNetoManual();
      SolicitudesView._recalcular();
    });

    $('[name=monto_neto_clp_manual]').on('input change', () => {
      SolicitudesView._syncCPsConNetoManual();
      SolicitudesView._recalcular();
    });

    $('#btn-uf').on('click', () => {
      const fecha = $('[name=uf_fecha]').val();
      if (!fecha) return UI.toast('Selecciona una fecha UF', 'warning');
      SolicitudesView._consultarUF(fecha, true);
    });

    $('#btn-add-cp').on('click', () => {
      const disponibles = SolicitudesView._state.cpsDisponibles || [];
      if (!SolicitudesView._state.clienteActual) return UI.toast('Selecciona primero un cliente', 'warning');
      if (!disponibles.length) return UI.toast('El cliente no tiene CPs asociados', 'warning');
      SolicitudesView._state.cps.push({ cp_id: '', cp_codigo: '', monto_uf: 0, monto_clp: 0 });
      SolicitudesView._state.activeCpIndex = SolicitudesView._state.cps.length - 1;
      SolicitudesView._renderCPs();
      SolicitudesView._markAutosaveTouched();
      SolicitudesView._scheduleAutosave();
    });

    $('#btn-add-rec').on('click', () => {
      const cliente = SolicitudesView._state.clienteActual;
      if (!cliente) return UI.toast('Selecciona primero un cliente', 'warning');
      ClientesService.receptores(cliente.id).then(recs => {
        const yaIds = SolicitudesView._state.receptores.map(r => r.id);
        const disponibles = recs.filter(r => !yaIds.includes(r.id));
        if (!disponibles.length) return UI.toast('Todos los receptores ya están agregados', 'info');
        const opts = disponibles.map((r,i) => `${i+1}. ${r.nombre} (${r.email})`).join('\n');
        const idx = prompt('Selecciona receptor:\n' + opts);
        if (!idx) return;
        const rec = disponibles[Number(idx)-1];
        if (rec) {
          SolicitudesView._state.receptores.push(rec);
          SolicitudesView._renderReceptores();
          SolicitudesView._markAutosaveTouched();
          SolicitudesView._scheduleAutosave();
        }
      });
    });

    $('[name=moneda_base], [name=uf_valor], [name=uf_fecha]').on('change input', () => { SolicitudesView._aplicarUFEnCPActivo(); SolicitudesView._actualizarObservacionUF(); SolicitudesView._renderCPs(); SolicitudesView._recalcular(); });
    if (isPlatform) {
      $('[name=uf_fecha]').on('change', function() {
        SolicitudesView._scheduleUfFetch($(this).val());
      });
      $('[name=periodo]').on('change input', function() {
        const fecha = SolicitudesView._fechaUfDesdePeriodo($(this).val());
        if (!fecha) return;
        $('[name=uf_fecha]').val(fecha);
        SolicitudesView._scheduleUfFetch(fecha);
      });
      if (ufFecha && !prefill.uf_valor) SolicitudesView._scheduleUfFetch(ufFecha, 150);
    }
  },

  _normalizarBusquedaCliente(value) {
    return String(value || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  },

  _initClienteAutocomplete() {
    const $input = $('#cliente-autocomplete-input');
    const $hidden = $('#sel-cliente');
    const $clear = $('#btn-clear-cliente');
    if (!$input.length) return;

    const render = (query) => {
      const q = SolicitudesView._normalizarBusquedaCliente(query);
      const $box = $('#cliente-suggestions');
      if (!q) {
        $box.addClass('d-none').empty();
        return;
      }
      const rows = (SolicitudesView._clientesCache || []).filter(c => {
        const haystack = SolicitudesView._normalizarBusquedaCliente([
          c.nombre_corto,
          c.razon_social,
          c.rut
        ].filter(Boolean).join(' '));
        return haystack.includes(q);
      }).slice(0, 8);
      if (!rows.length) {
        $box.removeClass('d-none').html('<div class="cliente-suggestion-empty">No encontramos ese cliente</div>');
        return;
      }
      $box.removeClass('d-none').html(rows.map(c => `
        <button type="button" class="cliente-suggestion" data-cliente-id="${SolicitudesView._esc(c.id)}">
          <strong>${SolicitudesView._esc(c.nombre_corto || '')}</strong>
          <span>${SolicitudesView._esc(c.razon_social || '')}</span>
          <small>${SolicitudesView._esc(c.rut || '')}</small>
        </button>
      `).join(''));
    };

    $input.on('input', function() {
      $hidden.val('');
      render($(this).val());
    });
    $input.on('focus', function() { render($(this).val()); });
    $('#cliente-suggestions').on('click', '[data-cliente-id]', function() {
      const id = $(this).data('cliente-id');
      const basic = (SolicitudesView._clientesCache || []).find(c => c.id === id);
      $hidden.val(id);
      $input.val((basic && basic.nombre_corto) || '');
      $('#cliente-suggestions').addClass('d-none').empty();
      ClientesService.get(id).then(c => SolicitudesView._onClienteSeleccionado(c, [], null, { resetDependientes: true }));
    });
    $clear.on('click', () => SolicitudesView._limpiarClienteSeleccionado());
    $(document).off('click.clienteAutocomplete').on('click.clienteAutocomplete', e => {
      if (!$(e.target).closest('.cliente-autocomplete').length) $('#cliente-suggestions').addClass('d-none');
    });
  },

  _limpiarClienteSeleccionado() {
    $('#cliente-autocomplete-input').val('');
    $('#sel-cliente').val('');
    $('#cliente-suggestions').addClass('d-none').empty();
    $('#cliente-facturacion-preview').text('');
    $('#sel-cliente-facturacion').empty().append('<option value="">Datos cliente 1</option>');
    SolicitudesView._state.clienteActual = null;
    SolicitudesView._state.cps = [];
    SolicitudesView._state.receptores = [];
    SolicitudesView._state.cpsDisponibles = [];
    SolicitudesView._renderCPs();
    SolicitudesView._renderReceptores();
    SolicitudesView._renderCoordinadoresSolicitud($('[name=coordinador_id]').val());
    SolicitudesView._recalcular();
  },

  _responsableBaseCliente(cliente) {
    return (cliente && (cliente.coordinador_id || (cliente.coordinador && cliente.coordinador.id))) || '';
  },

  _sugerirResponsableCliente(cliente, options = {}) {
    const $sel = $('#sel-coordinador');
    if (!$sel.length) return;
    const base = SolicitudesView._responsableBaseCliente(cliente);
    const actual = $sel.val() || '';
    const state = SolicitudesView._state || {};
    const fueSugerido = actual && state.responsableSugerido && actual === state.responsableSugerido;
    const debeSugerir = !!base && (!actual || options.resetDependientes || fueSugerido);
    const siguiente = debeSugerir ? base : actual;
    if (SolicitudesView._state) SolicitudesView._state.responsableSugerido = debeSugerir ? base : null;
    SolicitudesView._renderCoordinadoresSolicitud(siguiente);
  },

  _onClienteSeleccionado(c, receptoresActuales, cpsActuales, options = {}) {
    const preserve = !!options.preserve;
    SolicitudesView._state.clienteActual = c;
    $('#sel-cliente').val(c.id || '');
    if ($('#cliente-autocomplete-input').length) $('#cliente-autocomplete-input').val(c.nombre_corto || '');
    SolicitudesView._toggleContratoHabitat(c);
    SolicitudesView._renderDatosFacturacionSolicitud(preserve ? ((SolicitudesView._state.prefill && SolicitudesView._state.prefill.cliente_facturacion_id) || '') : '');
    SolicitudesView._sugerirResponsableCliente(c, options);
    if (preserve && receptoresActuales && receptoresActuales.length) {
      SolicitudesView._state.receptores = [...receptoresActuales];
    } else {
      SolicitudesView._state.receptores = [...(c.receptores || [])];
    }
    SolicitudesView._renderReceptores();
    ClientesService.cps(c.id).then(cps => {
      SolicitudesView._state.cpsDisponibles = cps || [];
      SolicitudesView._state.cps = (preserve && cpsActuales) ? [...cpsActuales] : [];
      SolicitudesView._renderCPs();
      SolicitudesView._renderCoordinadoresSolicitud($('[name=coordinador_id]').val());
      SolicitudesView._scheduleAutosave();
    }).fail(e => UI.toast(e.message || 'No se pudieron cargar los CPs del cliente', 'danger'));
    if (c.requiere_hes && String($('[name=hes_numero]').val() || '').trim().toUpperCase() === 'N/A') {
      $('#hes-tiene').prop('checked', true);
      $('[name=hes_numero]').val('');
      SolicitudesView._syncHESField();
    }
  },

  _esHabitat(cliente) {
    return String((cliente && cliente.nombre_corto) || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toUpperCase()
      .includes('HABITAT');
  },

  _toggleContratoHabitat(cliente) {
    const esHabitat = SolicitudesView._esHabitat(cliente);
    $('#field-contrato').toggleClass('d-none', !esHabitat);
    $('#field-oc').removeClass('d-none');
    if (!esHabitat) $('[name=contrato_numero]').val('');
  },

  _syncHESField() {
    const checked = $('#hes-tiene').is(':checked');
    const readonly = SolicitudesView._state && SolicitudesView._state.readonly;
    const $hes = $('[name=hes_numero]');
    if (!$hes.length) return;
    if (!checked) {
      $hes.val('N/A').prop('readonly', true);
      return;
    }
    $hes.prop('readonly', !!readonly);
    if (String($hes.val() || '').trim().toUpperCase() === 'N/A') $hes.val('');
  },

  _renderDatosFacturacionSolicitud(selectedId) {
    const $sel = $('#sel-cliente-facturacion');
    if (!$sel.length) return;
    const cliente = SolicitudesView._state && SolicitudesView._state.clienteActual;
    const datos = (cliente && cliente.datos_facturacion) || [];
    $sel.empty();
    if (!datos.length) {
      $sel.append('<option value="">Datos cliente 1</option>');
      return;
    }
    datos.forEach((dato, i) => {
      const id = dato.es_original ? '' : dato.id;
      const label = `${dato.etiqueta || `Datos cliente ${i + 1}`} - ${dato.razon_social || cliente.nombre_corto || ''}`;
      $sel.append($('<option>').val(id).text(label).prop('selected', String(id) === String(selectedId || '')));
    });
    if (selectedId && !$sel.find(`option[value="${selectedId}"]`).length) $sel.val('');
    SolicitudesView._mostrarDatosFacturacionSeleccionados();
  },

  _mostrarDatosFacturacionSeleccionados() {
    const cliente = SolicitudesView._state && SolicitudesView._state.clienteActual;
    const datos = (cliente && cliente.datos_facturacion) || [];
    const selectedId = $('#sel-cliente-facturacion').val() || '';
    const dato = datos.find(item => String(item.es_original ? '' : item.id) === String(selectedId)) || datos[0];
    if (!dato) {
      $('#cliente-facturacion-preview').text('');
      return;
    }
    $('#cliente-facturacion-preview').text([
      dato.rut ? `RUT ${dato.rut}` : '',
      dato.giro || '',
      dato.direccion || ''
    ].filter(Boolean).join(' · '));
  },

  _renderCPs() {
    const { cps, readonly, cpsDisponibles } = SolicitudesView._state;
    const cpEditable = SolicitudesView._puedeEditarCP();
    const colspan = cpEditable ? 4 : 3;
    const ufValor = Number($('[name=uf_valor]').val()) || 0;
    if (!cps.length) { $('#tbody-cps').html(`<tr><td colspan="${colspan}" class="text-center text-muted">Sin CPs</td></tr>`); return; }
    $('#tbody-cps').html(cps.map((cp, i) => `
      <tr class="${SolicitudesView._state.activeCpIndex === i ? 'table-active' : ''}">
        <td>
          ${!cpEditable ? `<code>${cp.cp_codigo||cp.codigo||''}</code> <small class="text-muted">${cp.cp_nombre||''}</small>` : `
            <select class="form-select form-select-sm" data-cp="${i}" data-field="cp_id">
              <option value="">Seleccionar CP</option>
              ${(cpsDisponibles || []).map(opt => {
                const selected = (cp.cp_id === opt.id || cp.cp_codigo === opt.codigo || cp.codigo === opt.codigo) ? 'selected' : '';
                return `<option value="${opt.id}" data-codigo="${opt.codigo}" data-nombre="${opt.nombre || ''}" ${selected}>${opt.codigo} - ${opt.nombre || ''}</option>`;
              }).join('')}
            </select>
          `}
        </td>
        <td><input class="form-control form-control-sm text-end" ${readonly?'readonly':''} type="number" step="0.01" value="${cp.monto_uf||''}" data-cp="${i}" data-field="monto_uf"></td>
        <td>
          <div class="d-flex align-items-center justify-content-end gap-2">
            <input class="form-control form-control-sm text-end" style="max-width: 170px;" readonly type="number" step="1" value="${SolicitudesView._cpMontoCLP(cp, ufValor)}" data-cp="${i}" data-field="monto_clp">
          </div>
        </td>
        ${cpEditable?`<td>${!readonly ? `<button class="btn btn-sm btn-outline-danger" onclick="SolicitudesView._removeCP(${i})">×</button>` : ''}</td>`:''}
      </tr>`).join(''));
    $('#tbody-cps input, #tbody-cps select').on('focus', function() {
      SolicitudesView._state.activeCpIndex = Number($(this).data('cp'));
      $('#tbody-cps tr').removeClass('table-active');
      $(this).closest('tr').addClass('table-active');
    });
    $('#tbody-cps input, #tbody-cps select').on('change input', function() {
      const i = Number($(this).data('cp'));
      const field = $(this).data('field');
      SolicitudesView._state.activeCpIndex = i;
      SolicitudesView._state.cps[i][field] = $(this).val();
      if (field === 'cp_id') {
        SolicitudesView._state.cps[i].cp_codigo = $(this).find(':selected').data('codigo') || '';
        SolicitudesView._state.cps[i].cp_nombre = $(this).find(':selected').data('nombre') || '';
      }
      SolicitudesView._renderCoordinadoresSolicitud($('[name=coordinador_id]').val());
      const ufValor = Number($('[name=uf_valor]').val()) || 0;
      if (!SolicitudesView._cpEsManual(SolicitudesView._state.cps[i])) {
        SolicitudesView._state.cps[i].monto_clp = SolicitudesView._cpMontoCLP(SolicitudesView._state.cps[i], ufValor);
        $(`[data-cp="${i}"][data-field="monto_clp"]`).val(SolicitudesView._state.cps[i].monto_clp);
      }
      SolicitudesView._syncCPsConNetoManual();
      SolicitudesView._recalcular();
      SolicitudesView._markAutosaveTouched();
      SolicitudesView._scheduleAutosave();
    });
    SolicitudesView._recalcular();
  },

  _removeCP(i) {
    SolicitudesView._state.cps.splice(i, 1);
    SolicitudesView._renderCPs();
    SolicitudesView._checkCPBalance();
    SolicitudesView._markAutosaveTouched();
    SolicitudesView._scheduleAutosave();
  },

  _renderCoordinadoresSolicitud(selectedId) {
    const $sel = $('#sel-coordinador');
    if (!$sel.length) return;
    const all = SolicitudesView._allCoordinadores || [];
    const user = AuthService.user && AuthService.user();
    const isPlatform = AuthService.isPlatformUser && AuthService.isPlatformUser();
    const coordFijo = user && user.rol !== 'admin' && !isPlatform ? user.coordinador_id : null;

    let coords = all;
    if (coordFijo) {
      coords = all.filter(c => c.id === coordFijo);
    }

    const actual = coordFijo || selectedId || $sel.val() || '';
    $sel.empty().append('<option value="">Seleccionar responsable</option>');
    coords.forEach(c => $sel.append($('<option>').val(c.id).text(c.nombre).prop('selected', c.id === actual)));
    if (actual && !coords.some(c => c.id === actual)) {
      const extra = all.find(c => c.id === actual);
      if (extra) $sel.append($('<option>').val(extra.id).text(extra.nombre).prop('selected', true));
    }
    const isReadonly = $sel.data('readonly') === 1 || $sel.data('readonly') === '1';
    $sel.prop('disabled', isReadonly || !!coordFijo);
  },

  _cpMontoCLP(cp, ufValor) {
    if (SolicitudesView._cpEsManual(cp)) {
      const manual = cp.monto_clp_manual !== null && cp.monto_clp_manual !== undefined && cp.monto_clp_manual !== ''
        ? Number(cp.monto_clp_manual)
        : Number(cp.monto_clp);
      return Math.round(Number.isFinite(manual) ? manual : 0);
    }
    const montoUF = Number(cp.monto_uf);
    if (!Number.isNaN(montoUF) && montoUF > 0 && ufValor) return Math.round(montoUF * ufValor);
    return Math.round(Number(cp.monto_clp) || 0);
  },

  _cpMontoAutomatico(cp, ufValor) {
    const montoUF = Number(cp.monto_uf);
    if (!Number.isNaN(montoUF) && montoUF > 0 && ufValor) return Math.round(montoUF * ufValor);
    return Math.round(Number(cp.monto_clp) || 0);
  },

  _cpEsManual(cp) {
    return cp && (cp.monto_clp_es_manual === true || cp.monto_clp_es_manual === 1 || cp.monto_clp_es_manual === '1' || cp.monto_clp_es_manual === 'true');
  },

  _syncCPsConNetoManual() {
    const state = SolicitudesView._state || {};
    const cps = state.cps || [];
    if (!cps.length) return;

    const ufValor = Number($('[name=uf_valor]').val()) || 0;
    if (!SolicitudesView._netoManualActivo()) {
      cps.forEach((cp, i) => {
        cp.monto_clp_manual = null;
        cp.monto_clp_es_manual = 0;
        cp.monto_clp = SolicitudesView._cpMontoAutomatico(cp, ufValor);
        $(`[data-cp="${i}"][data-field="monto_clp"]`).val(cp.monto_clp);
      });
      return;
    }

    const netoManual = Math.round(Number($('[name=monto_neto_clp_manual]').val()) || 0);
    const bases = cps.map(cp => SolicitudesView._cpMontoAutomatico(cp, ufValor));
    const totalBase = bases.reduce((sum, value) => sum + value, 0);
    let asignado = 0;

    cps.forEach((cp, i) => {
      const monto = i === cps.length - 1
        ? netoManual - asignado
        : Math.round(netoManual * (totalBase > 0 ? bases[i] / totalBase : 1 / cps.length));
      asignado += monto;
      cp.monto_clp = monto;
      cp.monto_clp_manual = monto;
      cp.monto_clp_es_manual = 1;
      $(`[data-cp="${i}"][data-field="monto_clp"]`).val(monto);
    });
  },

  _aplicarUFEnCPActivo() {
    const state = SolicitudesView._state || {};
    const cps = state.cps || [];
    if (!cps.length) return;
    const ufValor = Number($('[name=uf_valor]').val()) || 0;
    if (!ufValor) return;
    const active = Number.isInteger(state.activeCpIndex) && cps[state.activeCpIndex]
      ? state.activeCpIndex
      : (cps.length === 1 ? 0 : null);
    const indices = active === null ? cps.map((_, i) => i) : [active];
    indices.forEach(i => {
      if (SolicitudesView._cpEsManual(cps[i])) return;
      cps[i].monto_clp = SolicitudesView._cpMontoCLP(cps[i], ufValor);
      $(`[data-cp="${i}"][data-field="monto_clp"]`).val(cps[i].monto_clp);
    });
  },

  _redondearIVA(valor) {
    return Math.ceil((Number(valor) || 0) / 10) * 10;
  },

  _checkCPBalance() {
    const neto = SolicitudesView._lastNeto || 0;
    const netoManual = SolicitudesView._netoManualActivo();
    const ufValor = Number($('[name=uf_valor]').val()) || 0;
    const sumUF = SolicitudesView._state.cps.reduce((a, c) => a + (Number(c.monto_uf)||0), 0);
    const sumCP = SolicitudesView._state.cps.reduce((a, c) => a + SolicitudesView._cpMontoCLP(c, ufValor), 0);
    const diff = Math.abs(sumCP - neto);
    if (sumUF > 0 && !ufValor) {
      $('#cp-alerta').html('<span class="text-warning">Ingresa o busca el valor UF para calcular el monto en pesos.</span>');
      return;
    }
    if (netoManual) {
      $('#cp-alerta').html(`<span class="text-muted">Neto manual aplicado. Total CP calculado: ${Format.clp(sumCP)}</span>`);
      return;
    }
    if (neto > 0 && diff > 1) {
      $('#cp-alerta').html(`<span class="text-danger">⚠ Suma CPs (${Format.clp(sumCP)}) ≠ Neto (${Format.clp(neto)})</span>`);
    } else {
      $('#cp-alerta').text(sumUF > 0 ? `Total CP: ${Format.uf(sumUF)} / ${Format.clp(sumCP)}` : '');
    }
  },

  _renderReceptores() {
    const { receptores, readonly } = SolicitudesView._state;
    if (!receptores.length) { $('#lst-receptores').html('<li class="list-group-item text-muted">Sin receptores</li>'); return; }
    $('#lst-receptores').html(receptores.map((r, i) => `
      <li class="list-group-item d-flex justify-content-between align-items-center">
        <span>${r.nombre}<br><small class="text-muted">${r.email||''}</small></span>
        ${!readonly?`<button class="btn btn-sm btn-outline-danger" onclick="SolicitudesView._removeRec(${i})">×</button>`:''}
      </li>`).join(''));
  },

  _removeRec(i) {
    SolicitudesView._state.receptores.splice(i, 1);
    SolicitudesView._renderReceptores();
    SolicitudesView._markAutosaveTouched();
    SolicitudesView._scheduleAutosave();
  },

  _recalcular() {
    const { cps } = SolicitudesView._state;
    const empresaCod = $('[name=empresa_emisora]').val() || 'MAS_CONSULTORES';
    const empresa = AppConfig.empresasEmisoras.find(e => e.codigo === empresaCod) || AppConfig.empresasEmisoras[0];

    const ufValor = Number($('[name=uf_valor]').val()) || 0;
    const netoAutomatico = (cps || []).reduce((sum, cp) => sum + SolicitudesView._cpMontoAutomatico(cp, ufValor), 0);
    SolicitudesView._lastNetoAutomatico = netoAutomatico;
    if (!SolicitudesView._netoManualActivo()) $('[name=monto_neto_clp_manual]').val(netoAutomatico);
    const manual = SolicitudesView._netoManualActivo() ? Number($('[name=monto_neto_clp_manual]').val()) : null;
    const netoCLP = manual !== null && Number.isFinite(manual) ? Math.round(manual) : netoAutomatico;
    const ivaCLP = empresa.afectoIva ? SolicitudesView._redondearIVA(netoCLP * (empresa.ivaPct || 0.19)) : 0;
    const totalCLP = netoCLP + ivaCLP;
    SolicitudesView._lastNeto = netoCLP;

    $('#resumen-iva').text(empresa.afectoIva ? Format.clp(ivaCLP) : 'Exento');
    $('#resumen-total').text(Format.clp(totalCLP));
    SolicitudesView._checkCPBalance();
  },

  _netoManualActivo() {
    return $('#resumen-neto-manual').is(':checked');
  },

  _clearFieldErrors() {
    $('#solicitud-errors').addClass('d-none').empty();
    $('#view-root .is-invalid').removeClass('is-invalid');
    $('#view-root [data-error-for]').text('');
    $('#div-cps').removeClass('is-invalid');
  },

  _setFieldError(field, message) {
    const selectors = {
      cliente_id: '#sel-cliente',
      coordinador_id: '#sel-coordinador',
      periodo: '[name=periodo]',
      glosa: '[name=glosa]',
      uf_valor: '[name=uf_valor]',
      monto: '[name=monto_neto_clp_manual]',
      cps: '#div-cps'
    };
    const selector = selectors[field];
    if (selector) $(selector).addClass('is-invalid');
    $(`[data-error-for="${field}"]`).text(message);
  },

  _validarFormularioBasico(payload) {
    SolicitudesView._clearFieldErrors();
    const errores = [];
    const add = (field, message) => {
      errores.push(message);
      SolicitudesView._setFieldError(field, message);
    };

    if (!payload.cliente_id) add('cliente_id', 'Selecciona un cliente.');
    if (!payload.coordinador_id) add('coordinador_id', 'Selecciona un responsable.');
    if (!payload.periodo) add('periodo', 'Ingresa el periodo de facturacion.');
    if (!payload.glosa) add('glosa', 'Ingresa una glosa para la solicitud.');
    if (!payload.cps || !payload.cps.length) {
      add('cps', 'Agrega al menos un CP.');
    } else {
      const tieneMonto = payload.cps.some(cp => (Number(cp.monto_uf) || 0) > 0 || (Number(cp.monto_clp) || 0) > 0);
      const requiereUf = payload.cps.some(cp => (Number(cp.monto_uf) || 0) > 0) && !payload.uf_valor;
      if (!tieneMonto) add('monto', 'Ingresa un monto para el CP.');
      if (requiereUf) add('uf_valor', 'Busca o ingresa el valor UF para calcular el monto.');
    }

    if (errores.length) {
      $('#solicitud-errors')
        .removeClass('d-none')
        .html('<strong>Revisa estos campos:</strong><br>' + errores.map(SolicitudesView._esc).join('<br>'));
      SolicitudesView._scrollToFirstError();
    }
    return errores;
  },

  _scrollToFirstError() {
    const $first = $('#view-root .is-invalid:first');
    if ($first.length) $first[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
  },

  _initAutosave() {
    clearTimeout(SolicitudesView._autosaveTimer);
    SolicitudesView._autosaveTouched = false;
    SolicitudesView._autosaveSaving = false;
    SolicitudesView._autosaveQueued = false;
    SolicitudesView._autosaveLastPayload = '';
    $('#view-root').off('.autosave');

    const state = SolicitudesView._state || {};
    if (state.isPlatform) {
      SolicitudesView._setAutosaveStatus('idle', 'Solicitud temporal. Se guardara al exportar Excel.');
      return;
    }
    if (state.readonly) return;

    $('#view-root').on('input.autosave change.autosave', 'input, select, textarea', function() {
      SolicitudesView._markAutosaveTouched();
      SolicitudesView._scheduleAutosave();
    });
  },

  _markAutosaveTouched() {
    SolicitudesView._autosaveTouched = true;
  },

  _setAutosaveStatus(kind, message) {
    const $status = $('#autosave-status');
    if (!$status.length) return;
    $status
      .removeClass('is-idle is-saving is-saved is-error')
      .addClass('is-' + kind)
      .find('span:last')
      .text(message);
  },

  _autosaveReady(payload) {
    return !!(payload && payload.cliente_id && payload.periodo && payload.empresa_emisora);
  },

  _scheduleAutosave(delay = 1000) {
    const state = SolicitudesView._state || {};
    if (state.isPlatform) {
      SolicitudesView._setAutosaveStatus('idle', 'Solicitud temporal. Se guardara al exportar Excel.');
      return;
    }
    if (!state.isPlatform || state.readonly || !SolicitudesView._autosaveTouched) return;
    clearTimeout(SolicitudesView._autosaveTimer);

    const payload = SolicitudesView._collectForm();
    if (!SolicitudesView._autosaveReady(payload)) {
      SolicitudesView._setAutosaveStatus('idle', 'Selecciona cliente y periodo para iniciar autoguardado');
      return;
    }

    SolicitudesView._setAutosaveStatus('saving', 'Guardando...');
    SolicitudesView._autosaveTimer = setTimeout(() => SolicitudesView._autosaveNow(), delay);
  },

  _autosaveNow() {
    const state = SolicitudesView._state || {};
    if (state.isPlatform) return;
    if (!state.isPlatform || state.readonly) return;

    const payload = SolicitudesView._collectForm();
    if (!SolicitudesView._autosaveReady(payload)) {
      SolicitudesView._setAutosaveStatus('idle', 'Selecciona cliente y periodo para iniciar autoguardado');
      return;
    }

    const serialized = JSON.stringify(payload);
    if (serialized === SolicitudesView._autosaveLastPayload && state.sol) {
      SolicitudesView._setAutosaveStatus('saved', 'Cambios guardados');
      return;
    }

    if (SolicitudesView._autosaveSaving) {
      SolicitudesView._autosaveQueued = true;
      return;
    }

    SolicitudesView._autosaveSaving = true;
    SolicitudesView._setAutosaveStatus('saving', 'Guardando...');

    const hadSol = !!state.sol;
    const req = hadSol
      ? SolicitudesService.update(state.sol.id, payload)
      : SolicitudesService.create(payload);

    req.then(s => {
      if (s) {
        SolicitudesView._state.sol = s;
        SolicitudesView._state.prefill = { ...SolicitudesView._state.prefill, ...s };
        SolicitudesView._autosaveLastPayload = serialized;
        if (!hadSol && window.history && window.history.replaceState) {
          window.history.replaceState(null, '', '#/solicitudes/' + encodeURIComponent(s.id));
        }
        SolicitudesView._renderBotones();
      }
      SolicitudesView._setAutosaveStatus('saved', 'Cambios guardados');
    }).fail(e => {
      SolicitudesView._setAutosaveStatus('error', 'Error al guardar');
      UI.toast((e && e.message) || 'Error al guardar cambios', 'danger');
    }).always(() => {
      SolicitudesView._autosaveSaving = false;
      if (SolicitudesView._autosaveQueued) {
        SolicitudesView._autosaveQueued = false;
        SolicitudesView._scheduleAutosave(300);
      }
    });
  },

  _renderBotones() {
    const { sol, readonly } = SolicitudesView._state;
    const estado = sol ? SolicitudesView._estadoSolicitudVisible(sol.estado) : 'PENDIENTE OC / HES';
    const estadosProyecciones = AppConfig.estadosProyecciones || [];
    let btns = '';

    if (SolicitudesView._state.isPlatform) {
      if (!readonly || sol) {
        btns += '<button class="btn btn-success btn-lg" id="btn-exportar"><i class="bi bi-file-earmark-excel"></i> Exportar Excel y guardar solicitud</button>';
      }
      if (!readonly || sol) {
        btns += '<button class="btn btn-outline-danger" id="btn-eliminar-solicitud"><i class="bi bi-trash"></i> Descartar solicitud</button>';
      }
      $('#botones-estado').html(btns);
      SolicitudesView._wireButtons();
      return;
    }

    if (!readonly) {
      btns += '<button class="btn btn-primary btn-lg" id="btn-guardar"><i class="bi bi-save"></i> Guardar solicitud</button>';
      if (!estadosProyecciones.includes(estado)) {
        btns += '<button class="btn btn-outline-secondary" id="btn-revision">Enviar a revisión</button>';
      }
    }
    if (estado === 'EnRevision') btns += '<button class="btn btn-success" id="btn-aprobar">Aprobar</button><button class="btn btn-danger" id="btn-rechazar">Rechazar</button>';
    if (estado === 'Aprobada') btns += '<button class="btn btn-info text-white" id="btn-emitir">Marcar Emitida</button>';
    if (estado === 'Emitida') btns += '<button class="btn btn-success" id="btn-facturada">Marcar Facturada</button><button class="btn btn-danger" id="btn-anular">Anular</button>';
    if (['Facturada','Cerrada','Emitida'].includes(estado)) btns += '';
    if (sol) btns += '<button class="btn btn-outline-success" id="btn-exportar"><i class="bi bi-file-earmark-excel"></i> Exportar Excel</button>';
    if (sol) btns += '<button class="btn btn-outline-secondary" id="btn-duplicar"><i class="bi bi-files"></i> Duplicar</button>';
    if (sol) btns += '<button class="btn btn-outline-danger" id="btn-eliminar-solicitud"><i class="bi bi-trash"></i> Eliminar solicitud</button>';

    $('#botones-estado').html(btns);
    SolicitudesView._wireButtons();
  },

  _mostrarErrorExportacion(errores) {
    const lista = (errores || []).filter(Boolean);
    const msg = lista.length
      ? 'No se puede exportar todavia. ' + lista.join(' ')
      : 'No se puede exportar todavia. Revisa los campos marcados.';
    $('#solicitud-errors')
      .removeClass('d-none')
      .html('<strong>No se puede exportar todavia.</strong><br>' + lista.map(SolicitudesView._esc).join('<br>'));
    UI.toast(msg, 'warning');
  },

  _descargarExcelSolicitud(id, successMessage) {
    UI.toast('Generando XLSX...', 'info');
    return SolicitudesService.exportar(id).then(exp => {
      return SolicitudesService.descargarExportacion(exp.exportId).then(() => {
        UI.toast(successMessage || 'XLSX descargado', 'success');
      });
    });
  },

  _exportarPlataformas() {
    const payload = { ...SolicitudesView._collectForm(), estado: 'FACTURA SOLICITADA' };

    const erroresBasicos = SolicitudesView._validarFormularioBasico(payload);
    const erroresEnvio = Validators.paraEnviarRevision(payload);
    const errores = [...new Set([...erroresBasicos, ...erroresEnvio])];
    if (errores.length) {
      SolicitudesView._mostrarErrorExportacion(errores);
      return;
    }

    const state = SolicitudesView._state || {};
    const current = state.sol;
    const req = current
      ? SolicitudesService.update(current.id, payload)
      : SolicitudesService.create(payload);

    $('[name=estado]').val('FACTURA SOLICITADA');
    SolicitudesView._setAutosaveStatus('saving', 'Guardando para exportar...');
    req.then(s => {
      if (s) {
        SolicitudesView._state.sol = s;
        SolicitudesView._state.prefill = { ...SolicitudesView._state.prefill, ...s };
        SolicitudesView._autosaveLastPayload = JSON.stringify(payload);
        if (window.history && window.history.replaceState) {
          window.history.replaceState(null, '', '#/solicitudes/' + encodeURIComponent(s.id));
        }
        SolicitudesView._renderBotones();
      }
      SolicitudesView._setAutosaveStatus('saved', 'Solicitud guardada y Excel exportado');
      return SolicitudesView._descargarExcelSolicitud((s && s.id) || (current && current.id), 'Solicitud guardada y Excel exportado');
    }).fail(e => {
      $('[name=estado]').val((current && current.estado) || 'PENDIENTE OC / HES');
      SolicitudesView._setAutosaveStatus('error', 'Error al guardar');
      SolicitudesView._mostrarErrorExportacion([e.message || 'No se pudo guardar antes de exportar.']);
    });
  },

  _wireButtons() {
    const { sol } = SolicitudesView._state;

    const _guardar = (hacia, cb) => {
      const payload = SolicitudesView._collectForm();
      const erroresBasicos = SolicitudesView._validarFormularioBasico(payload);
      if (erroresBasicos.length) return UI.toast('Revisa los campos marcados', 'warning');
      const errs = Validators.paraEnviarRevision(payload);
      if (errs.length) return UI.toast(errs.join(' | '), 'warning');
      const req = sol ? SolicitudesService.update(sol.id, payload) : SolicitudesService.create(payload);
      req.then(s => {
        if (hacia && s) {
          SolicitudesService.cambiarEstado(s.id, hacia, '').then(s2 => {
            UI.toast('Guardado y enviado', 'success');
            location.hash = '#/solicitudes/' + s2.id;
          }).fail(e => UI.toast(e.message, 'danger'));
        } else if (s) {
          UI.toast('Guardado', 'success');
          location.hash = '#/solicitudes/' + s.id;
        }
        if (cb) cb(s);
      }).fail(e => UI.toast(e.message || 'Error al guardar', 'danger'));
    };

    $('#btn-guardar').on('click', () => _guardar(null));
    $('#btn-revision').on('click', () => {
      const payload = SolicitudesView._collectForm();
      const errs = Validators.paraEnviarRevision(payload);
      if (errs.length) return UI.toast(errs.join(' | '), 'warning');
      _guardar('EnRevision');
    });

    $('#btn-aprobar').on('click', () => {
      const comentario = prompt('Comentario de aprobación (opcional):') || '';
      SolicitudesService.cambiarEstado(sol.id, 'Aprobada', comentario).then(s => {
        UI.toast('Aprobada', 'success'); location.hash = '#/solicitudes/' + s.id;
      }).fail(e => UI.toast(e.message, 'danger'));
    });

    $('#btn-rechazar').on('click', () => {
      const comentario = prompt('Motivo del rechazo (requerido):') || '';
      if (!comentario) return;
      SolicitudesService.cambiarEstado(sol.id, 'Rechazada', comentario).then(s => {
        UI.toast('Rechazada', 'warning'); location.hash = '#/solicitudes/' + s.id;
      }).fail(e => UI.toast(e.message, 'danger'));
    });

    $('#btn-emitir').on('click', () => {
      SolicitudesService.cambiarEstado(sol.id, 'Emitida', '').then(s => {
        UI.toast('Marcada como Emitida', 'success'); location.hash = '#/solicitudes/' + s.id;
      }).fail(e => UI.toast(e.message, 'danger'));
    });

    $('#btn-facturada').on('click', () => {
      const fecha = prompt('Fecha de facturación (YYYY-MM-DD):') || SolicitudesView._hoyISO();
      SolicitudesService.cambiarEstado(sol.id, 'Facturada', fecha).then(s => {
        UI.toast('Facturada', 'success'); location.hash = '#/solicitudes/' + s.id;
      }).fail(e => UI.toast(e.message, 'danger'));
    });

    $('#btn-anular').on('click', () => {
      const motivo = prompt('Motivo de anulación:') || '';
      if (!motivo) return;
      SolicitudesService.cambiarEstado(sol.id, 'Anulada', motivo).then(s => {
        UI.toast('Anulada', 'warning'); location.hash = '#/solicitudes/' + s.id;
      }).fail(e => UI.toast(e.message, 'danger'));
    });

    $('#btn-exportar').on('click', () => {
      if (SolicitudesView._state.isPlatform) {
        SolicitudesView._exportarPlataformas();
        return;
      }
      const preparar = SolicitudesView._state.readonly
        ? $.Deferred().resolve(sol).promise()
        : SolicitudesService.update(sol.id, SolicitudesView._collectForm());

      preparar.then(s => {
        const id = (s && s.id) || sol.id;
        SolicitudesView._descargarExcelSolicitud(id).fail(e => UI.toast(e.message, 'danger'));
      }).fail(e => UI.toast(e.message || 'Error al guardar antes de exportar', 'danger'));
    });

    $('#btn-duplicar').on('click', () => {
      SolicitudesService.duplicar(sol.id).then(s => {
        UI.toast('Duplicada como ' + s.folio, 'success');
        location.hash = '#/solicitudes/' + s.id;
      }).fail(e => UI.toast(e.message, 'danger'));
    });

    $('#btn-eliminar-solicitud').on('click', () => {
      const current = SolicitudesView._state.sol || sol;
      if (!current) {
        UI.confirm('Descartar este borrador y empezar de nuevo?', 'Descartar solicitud', 'Descartar').then(ok => {
          if (ok) location.hash = '#/solicitudes/nueva';
        });
        return;
      }
      SolicitudesView._confirmDelete(current.id).then(deleted => {
        if (deleted) location.hash = '#/solicitudes';
      });
    });
  },

  _confirmDelete(id) {
    const isPlatform = SolicitudesView._isPlatformUser();
    const message = isPlatform
      ? 'Seguro que deseas descartar esta solicitud? Esta accion no se puede deshacer.'
      : '¿Seguro que deseas eliminar esta solicitud?';
    const title = isPlatform ? 'Descartar solicitud' : 'Eliminar solicitud';
    const okLabel = isPlatform ? 'Descartar' : 'Eliminar';
    return UI.confirm(message, title, okLabel).then(ok => {
      if (!ok) return false;
      return SolicitudesService.delete(id).then(() => {
        UI.toast(isPlatform ? 'Solicitud descartada correctamente' : 'Solicitud eliminada correctamente', 'success');
        return true;
      }, e => {
        UI.toast(e.message || (isPlatform ? 'Error al descartar solicitud' : 'Error al eliminar solicitud'), 'danger');
        return false;
      });
    });
  },

  _lineaObservacionUF(fecha, valor) {
    if (!fecha || !valor) return '';
    const uf = Number(valor);
    if (!Number.isFinite(uf) || uf <= 0) return '';
    return `Valor UF ${fecha}: ${uf.toLocaleString('es-CL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  },

  _observacionesConUF(texto, fecha, valor) {
    const base = String(texto || '')
      .split(/\r?\n/)
      .filter(line => !/^Valor UF \d{4}-\d{2}-\d{2}:/i.test(line.trim()))
      .join('\n')
      .trim();
    const linea = SolicitudesView._lineaObservacionUF(fecha, valor);
    return [base, linea].filter(Boolean).join('\n') || null;
  },

  _actualizarObservacionUF() {
    const $obs = $('[name=observaciones]');
    if (!$obs.length || $obs.prop('readonly')) return;
    const texto = SolicitudesView._observacionesConUF($obs.val(), $('[name=uf_fecha]').val(), $('[name=uf_valor]').val());
    if (texto !== null) $obs.val(texto);
  },

  _fechaUfDesdePeriodo(periodo) {
    const match = String(periodo || '').match(/^(\d{4})-(\d{2})$/);
    if (!match) return '';
    const year = Number(match[1]);
    const month = Number(match[2]);
    if (!year || month < 1 || month > 12) return '';
    const last = new Date(year, month, 0);
    return `${last.getFullYear()}-${String(last.getMonth() + 1).padStart(2, '0')}-${String(last.getDate()).padStart(2, '0')}`;
  },

  _scheduleUfFetch(fecha, delay = 500) {
    clearTimeout(SolicitudesView._ufTimer);
    if (!fecha) return;
    $('#uf-cp-help').text('Consultando UF...');
    SolicitudesView._ufTimer = setTimeout(() => SolicitudesView._consultarUF(fecha), delay);
  },

  _consultarUF(fecha, toastResult = false) {
    if (!fecha) return $.Deferred().reject(new Error('Fecha UF requerida')).promise();
    $('#uf-cp-help').text('Consultando UF...');
    return IntegracionesService.uf(fecha).then(d => {
      $('[name=uf_valor]').val(d.valor);
      SolicitudesView._aplicarUFEnCPActivo();
      SolicitudesView._actualizarObservacionUF();
      SolicitudesView._renderCPs();
      SolicitudesView._recalcular();
      $('#uf-cp-help').text('UF actualizada');
      if (toastResult) UI.toast('UF ' + d.fecha + ': $' + d.valor, 'info');
      return d;
    }).fail(e => {
      $('#uf-cp-help').text('No se pudo obtener UF');
      if (toastResult) UI.toast(e.message || 'Error UF', 'danger');
    });
  },

  _collectForm() {
    const val = n => $(`[name=${n}]`).val();
    const { cps, receptores } = SolicitudesView._state;
    const ufFecha = val('uf_fecha') || null;
    const ufValor = val('uf_valor') ? Number(val('uf_valor')) : null;
    const netoManualActivo = SolicitudesView._netoManualActivo();
    const netoManual = netoManualActivo ? Number(val('monto_neto_clp_manual')) || 0 : null;
    const hesNumero = $('#hes-tiene').is(':checked') ? (val('hes_numero') || null) : 'N/A';

    return {
      empresa_emisora: val('empresa_emisora') || 'MAS_CONSULTORES',
      tipo: 'mensual',
      estado: val('estado') || 'PENDIENTE OC / HES',
      periodo: val('periodo'),
      fecha_solicitud: ufFecha || SolicitudesView._hoyISO(),
      cliente_id: val('cliente_id') || $('#sel-cliente').val(),
      cliente_facturacion_id: val('cliente_facturacion_id') || null,
      coordinador_id: val('coordinador_id') || null,
      oc_numero: val('oc_numero') || null,
      contrato_numero: val('contrato_numero') || null,
      hes_numero: hesNumero,
      glosa: val('glosa'),
      area: SolicitudesView._isPlatformUser() ? 'Plataforma' : ($('[name=area_plataforma]').is(':checked') ? 'Plataforma' : null),
      moneda_base: val('moneda_base') || 'CLP',
      uf_fecha: ufFecha,
      uf_valor: ufValor,
      monto_neto_clp_manual: netoManual,
      monto_neto_clp: netoManualActivo ? netoManual : SolicitudesView._lastNetoAutomatico,
      observaciones: SolicitudesView._observacionesConUF(val('observaciones'), ufFecha, ufValor),
      cps: cps.map(cp => ({
        cp_id: cp.cp_id || null,
        cp_codigo: cp.cp_codigo || cp.codigo || '',
        monto_uf: Number(cp.monto_uf) || null,
        monto_clp: SolicitudesView._cpMontoCLP(cp, Number(val('uf_valor')) || 0),
        monto_clp_manual: SolicitudesView._cpEsManual(cp) ? SolicitudesView._cpMontoCLP(cp, Number(val('uf_valor')) || 0) : null,
        monto_clp_es_manual: SolicitudesView._cpEsManual(cp) ? 1 : 0
      })).filter(cp => cp.cp_id || cp.cp_codigo),
      receptores: receptores.map(r => ({ receptor_id: r.id || r.receptor_id })).filter(r => r.receptor_id)
    };
  },

  _estadoSolicitudVisible(estado) {
    return estado === 'FACTURADO' ? 'FACTURA SOLICITADA' : estado;
  },

  _puedeEditarCP() {
    const state = SolicitudesView._state || {};
    const estado = SolicitudesView._estadoSolicitudVisible(
      (state.sol && state.sol.estado) || (state.prefill && state.prefill.estado) || 'PENDIENTE OC / HES'
    );
    return !state.readonly || SolicitudesView._esPendienteOcHes(estado);
  },

  _esPendienteOcHes(estado) {
    return String(SolicitudesView._estadoSolicitudVisible(estado) || '')
      .trim()
      .toUpperCase() === 'PENDIENTE OC / HES';
  },

  _esc(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  },

  _state: { sol: null, readonly: false, isPlatform: false, cps: [], receptores: [], clienteActual: null, cpsDisponibles: [], activeCpIndex: null },
  _lastNeto: 0,
  _lastNetoAutomatico: 0
};
