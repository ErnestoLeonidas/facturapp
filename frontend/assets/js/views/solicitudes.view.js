window.SolicitudesView = {
  list() {
    UI.setTitle('Solicitudes');
    $('#view-root').html(`
      <div class="card mb-3"><div class="card-body py-2">
        <form class="row g-2" id="form-filtros">
          <div class="col-md-3"><input class="form-control form-control-sm" name="q" placeholder="Folio, cliente, glosa…"></div>
          <div class="col-md-2">
            <select class="form-select form-select-sm" name="estado">
              <option value="">Estado</option>
              ${AppConfig.estadosSolicitud.map(e=>`<option>${e}</option>`).join('')}
            </select>
          </div>
          <div class="col-md-2"><input class="form-control form-control-sm" name="periodo" placeholder="2026-05"></div>
          <div class="col-md-2">
            <select class="form-select form-select-sm" name="tipo">
              <option value="">Tipo</option><option value="mensual">Mensual</option><option value="adicional">Adicional</option>
            </select>
          </div>
          <div class="col-md-3 d-flex gap-1">
            <button class="btn btn-sm btn-outline-primary flex-grow-1" type="submit">Filtrar</button>
            <a class="btn btn-sm btn-primary" href="#/solicitudes/nueva">+ Nueva</a>
          </div>
        </form>
      </div></div>
      <div class="card">
        <div class="table-responsive">
          <table class="table mb-0 align-middle table-hover">
            <thead><tr>
              <th>Folio</th><th>Cliente</th><th>Tipo</th><th>Período</th>
              <th>Empresa</th><th>Coordinador</th><th class="text-end">Neto</th><th class="text-end">Total</th>
              <th>Estado</th><th></th>
            </tr></thead>
            <tbody id="tbl-solicitudes"><tr><td colspan="10" class="text-center py-4">
              <div class="spinner-border spinner-border-sm"></div>
            </td></tr></tbody>
          </table>
        </div>
      </div>
    `);

    let filtrosActuales = {};
    const cargar = (params = {}) => {
      filtrosActuales = params;
      SolicitudesService.list(params).then(data => {
        if (!data.length) { $('#tbl-solicitudes').html('<tr><td colspan="10" class="text-center text-muted py-3">Sin resultados</td></tr>'); return; }
        $('#tbl-solicitudes').html(data.map(s => {
          const empresa = s.empresa_emisora === 'MAS_CONSULTORES' ? 'Consultores' : 'Capacitación';
          return `<tr style="cursor:pointer" onclick="location.hash='#/solicitudes/${s.id}'">
            <td><code>${s.folio}</code></td>
            <td>${s.cliente_nombre||''}</td>
            <td><span class="badge ${s.tipo==='mensual'?'bg-primary':'bg-warning text-dark'}">${s.tipo}</span></td>
            <td>${s.periodo}</td>
            <td><small>${empresa}</small></td>
            <td>${s.coordinador_nombre || '—'}</td>
            <td class="text-end"><small>${Format.clp(s.monto_neto_clp)}</small></td>
            <td class="text-end">${Format.clp(s.monto_total_clp)}</td>
            <td>${UI.estadoChip(s.estado)}</td>
            <td>
              <a class="btn btn-sm btn-outline-secondary" href="#/solicitudes/${s.id}">Ver</a>
              <button class="btn btn-sm btn-outline-danger ms-1" data-delete-id="${s.id}" type="button">
                <i class="bi bi-trash"></i> Eliminar
              </button>
            </td>
          </tr>`;
        }).join(''));
      }).fail(e => UI.error('#tbl-solicitudes', e));
    };

    cargar();
    $('#form-filtros').on('submit', e => {
      e.preventDefault();
      const d = Object.fromEntries(new FormData(e.target).entries());
      Object.keys(d).forEach(k => !d[k] && delete d[k]);
      cargar(d);
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

  nueva(params = {}) {
    UI.setTitle('Nueva solicitud de factura');
    const clienteIdPrefill = params.clienteId || '';
    SolicitudesView._renderFormView(null, { cliente_id: clienteIdPrefill });
  },

  detalle(params) {
    UI.loading();
    SolicitudesService.get(params.id).then(s => {
      SolicitudesView._renderFormView(s, s);
    }).fail(e => UI.error('#view-root', e));
  },

  _renderFormView(sol, prefill) {
    const isNew = !sol;
    const readonly = sol && !['Borrador','PendienteDatos'].includes(sol.estado);
    UI.setTitle(isNew ? 'Nueva solicitud' : sol.folio);

    const empresaOpts = AppConfig.empresasEmisoras.map(e =>
      `<option value="${e.codigo}" ${(prefill.empresa_emisora||'MAS_CONSULTORES')===e.codigo?'selected':''}>${e.nombre}</option>`).join('');

    $('#view-root').html(`
      <div class="row g-3">
        <div class="col-lg-8">
          <div class="card">
            <div class="card-header"><strong>Solicitud de Factura — Grupo MAS</strong>
              ${sol ? ` &nbsp; <code>${sol.folio}</code> &nbsp; ${UI.estadoChip(sol.estado)}` : ''}
            </div>
            <div class="card-body">
              <div class="row g-3">
                <div class="col-md-6">
                  <label class="form-label">Facturar Por *</label>
                  <select class="form-select" name="empresa_emisora" ${readonly?'disabled':''}>${empresaOpts}</select>
                </div>
                <div class="col-md-3">
                  <label class="form-label">Tipo</label>
                  <select class="form-select" name="tipo" ${readonly?'disabled':''}>
                    <option value="mensual" ${(prefill.tipo||'mensual')==='mensual'?'selected':''}>Mensual</option>
                    <option value="adicional" ${prefill.tipo==='adicional'?'selected':''}>Adicional</option>
                  </select>
                </div>
                <div class="col-md-3">
                  <label class="form-label">Período *</label>
                  <input class="form-control" name="periodo" placeholder="2026-05" value="${prefill.periodo||''}" ${readonly?'readonly':''}>
                </div>

                <div class="col-md-6">
                  <label class="form-label">Cliente *</label>
                  <select class="form-select" name="cliente_id" id="sel-cliente" ${readonly?'disabled':''}>
                    <option value="">— seleccionar —</option>
                  </select>
                </div>
                <div class="col-md-3" id="field-oc">
                  <label class="form-label">OC / Nota de Pedido</label>
                  <input class="form-control" name="oc_numero" value="${prefill.oc_numero||''}" ${readonly?'readonly':''}>
                </div>
                <div class="col-md-3 d-none" id="field-contrato">
                  <label class="form-label">N° contrato</label>
                  <input class="form-control" name="contrato_numero" value="${prefill.contrato_numero||''}" ${readonly?'readonly':''}>
                </div>
                <div class="col-md-3">
                  <label class="form-label">HES</label>
                  <input class="form-control" name="hes_numero" placeholder="N/A" value="${prefill.hes_numero||''}" ${readonly?'readonly':''}>
                </div>

                <div class="col-12">
                  <label class="form-label">Glosa *</label>
                  <textarea class="form-control" name="glosa" rows="2" ${readonly?'readonly':''}>${prefill.glosa||''}</textarea>
                </div>
                <div class="col-md-6">
                  <label class="form-label">Área</label>
                  <input class="form-control" name="area" value="${prefill.area||''}" ${readonly?'readonly':''}>
                </div>
              </div>

              <hr>

              <div class="d-flex justify-content-between align-items-center mb-2">
                <h6 class="mb-0">Centros de Proyecto (CP)</h6>
                ${!readonly?'<button type="button" class="btn btn-sm btn-outline-secondary" id="btn-add-cp">+ CP</button>':''}
              </div>
              <div id="div-cps">
                <table class="table table-sm align-middle">
                  <thead><tr><th>CP del cliente</th><th class="text-end">Monto CLP</th>${!readonly?'<th></th>':''}</tr></thead>
                  <tbody id="tbody-cps"></tbody>
                </table>
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

          ${sol ? `
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
          <div class="card sticky-top" style="top:1rem">
            <div class="card-header">Resumen</div>
            <div class="card-body">
              <div class="row g-2 mb-3">
                <div class="col-6">
                  <label class="form-label small">Moneda</label>
                  <select class="form-select form-select-sm" name="moneda_base" ${readonly?'disabled':''}>
                    <option value="CLP" ${(prefill.moneda_base||'CLP')==='CLP'?'selected':''}>CLP</option>
                    <option value="UF" ${prefill.moneda_base==='UF'?'selected':''}>UF</option>
                  </select>
                </div>
                <div class="col-6">
                  <label class="form-label small">UF fecha</label>
                  <input class="form-control form-control-sm" type="date" name="uf_fecha" value="${prefill.uf_fecha||''}">
                </div>
                <div class="col-12 d-flex gap-1">
                  <input class="form-control form-control-sm" name="uf_valor" placeholder="Valor UF" value="${prefill.uf_valor||''}" ${readonly?'readonly':''}>
                  <button type="button" class="btn btn-sm btn-outline-secondary" id="btn-uf">Buscar</button>
                </div>
              </div>
              <hr>
              <table class="table table-sm mb-3">
                <tr><td>Neto</td><td class="text-end fw-bold" id="resumen-neto">${Format.clp(prefill.monto_neto_clp||0)}</td></tr>
                <tr><td>IVA</td><td class="text-end" id="resumen-iva">${Format.clp(prefill.monto_iva_clp||0)}</td></tr>
                <tr class="table-active"><td>Total</td><td class="text-end fw-bold" id="resumen-total">${Format.clp(prefill.monto_total_clp||0)}</td></tr>
              </table>

              <div class="d-grid gap-2" id="botones-estado">
                <!-- se renderizan dinámicamente según estado -->
              </div>
            </div>
          </div>
        </aside>
      </div>
    `);

    // Cargar clientes en el select
    const $selCli = $('#sel-cliente');
    ClientesService.list({ estado: 'Activo' }).then(clientes => {
      clientes.forEach(c => {
        const opt = $('<option>').val(c.id).text(c.nombre_corto).data('obj', c);
        if (c.id === (prefill.cliente_id || (prefill.cliente && prefill.cliente.id))) opt.prop('selected', true);
        $selCli.append(opt);
      });
      // Si tiene cliente precargado, poblar info, receptores y CPs
      const clienteActual = sol && sol.cliente ? sol.cliente : null;
      const selectedId = $selCli.val();
      if (clienteActual) {
        SolicitudesView._onClienteSeleccionado(clienteActual, sol && sol.receptores, sol && sol.cps);
      } else if (selectedId) {
        ClientesService.get(selectedId).then(c => SolicitudesView._onClienteSeleccionado(c, []));
      }
    });

    $selCli.on('change', function() {
      const id = $(this).val();
      if (!id) return;
      ClientesService.get(id).then(c => SolicitudesView._onClienteSeleccionado(c, []));
    });

    // Estado inicial
    SolicitudesView._state = {
      sol, readonly, prefill,
      cps: sol ? sol.cps : [],
      receptores: sol ? sol.receptores : [],
      clienteActual: sol ? sol.cliente : null,
      cpsDisponibles: []
    };
    SolicitudesView._renderCPs();
    SolicitudesView._renderReceptores();
    SolicitudesView._renderBotones();

    // Eventos
    $('#btn-uf').on('click', () => {
      const fecha = $('[name=uf_fecha]').val();
      if (!fecha) return UI.toast('Selecciona una fecha UF', 'warning');
      IntegracionesService.uf(fecha).then(d => {
        $('[name=uf_valor]').val(d.valor);
        SolicitudesView._recalcular();
        UI.toast('UF ' + d.fecha + ': $' + d.valor, 'info');
      }).fail(e => UI.toast(e.message || 'Error UF', 'danger'));
    });

    $('#btn-add-cp').on('click', () => {
      const disponibles = SolicitudesView._state.cpsDisponibles || [];
      if (!SolicitudesView._state.clienteActual) return UI.toast('Selecciona primero un cliente', 'warning');
      if (!disponibles.length) return UI.toast('El cliente no tiene CPs asociados', 'warning');
      SolicitudesView._state.cps.push({ cp_id: '', cp_codigo: '', monto_clp: 0 });
      SolicitudesView._renderCPs();
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
        if (rec) { SolicitudesView._state.receptores.push(rec); SolicitudesView._renderReceptores(); }
      });
    });

    $('[name=moneda_base], [name=uf_valor]').on('change input', () => SolicitudesView._recalcular());
    $('[name=empresa_emisora]').on('change', () => SolicitudesView._recalcular());
  },

  _onClienteSeleccionado(c, receptoresActuales, cpsActuales) {
    SolicitudesView._state.clienteActual = c;
    SolicitudesView._toggleContratoHabitat(c);
    if (!receptoresActuales || !receptoresActuales.length) {
      SolicitudesView._state.receptores = [...(c.receptores || [])];
    }
    SolicitudesView._renderReceptores();
    ClientesService.cps(c.id).then(cps => {
      SolicitudesView._state.cpsDisponibles = cps || [];
      if (!cpsActuales) SolicitudesView._state.cps = [];
      SolicitudesView._renderCPs();
    }).fail(e => UI.toast(e.message || 'No se pudieron cargar los CPs del cliente', 'danger'));
    if (!$('[name=hes_numero]').val() && c.requiere_hes) $('[name=hes_numero]').val('');
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
    $('#field-oc').toggleClass('d-none', esHabitat);
    if (esHabitat) $('[name=oc_numero]').val('');
    else $('[name=contrato_numero]').val('');
  },

  _renderCPs() {
    const { cps, readonly, cpsDisponibles } = SolicitudesView._state;
    if (!cps.length) { $('#tbody-cps').html(`<tr><td colspan="${readonly?2:3}" class="text-center text-muted">Sin CPs</td></tr>`); return; }
    $('#tbody-cps').html(cps.map((cp, i) => `
      <tr>
        <td>
          ${readonly ? `<code>${cp.cp_codigo||cp.codigo||''}</code> <small class="text-muted">${cp.cp_nombre||''}</small>` : `
            <select class="form-select form-select-sm" data-cp="${i}" data-field="cp_id">
              <option value="">Seleccionar CP</option>
              ${(cpsDisponibles || []).map(opt => {
                const selected = (cp.cp_id === opt.id || cp.cp_codigo === opt.codigo || cp.codigo === opt.codigo) ? 'selected' : '';
                return `<option value="${opt.id}" data-codigo="${opt.codigo}" ${selected}>${opt.codigo} - ${opt.nombre || ''}</option>`;
              }).join('')}
            </select>
          `}
        </td>
        <td><input class="form-control form-control-sm text-end" ${readonly?'readonly':''} type="number" step="1" value="${cp.monto_clp||''}" data-cp="${i}" data-field="monto_clp"></td>
        ${!readonly?`<td><button class="btn btn-sm btn-outline-danger" onclick="SolicitudesView._removeCP(${i})">×</button></td>`:''}
      </tr>`).join(''));
    $('#tbody-cps input, #tbody-cps select').on('change input', function() {
      const i = Number($(this).data('cp'));
      const field = $(this).data('field');
      SolicitudesView._state.cps[i][field] = $(this).val();
      if (field === 'cp_id') {
        SolicitudesView._state.cps[i].cp_codigo = $(this).find(':selected').data('codigo') || '';
      }
      SolicitudesView._recalcular();
    });
    SolicitudesView._recalcular();
  },

  _removeCP(i) { SolicitudesView._state.cps.splice(i, 1); SolicitudesView._renderCPs(); SolicitudesView._checkCPBalance(); },

  _checkCPBalance() {
    const neto = SolicitudesView._lastNeto || 0;
    const sumCP = SolicitudesView._state.cps.reduce((a, c) => a + (Number(c.monto_clp)||0), 0);
    const diff = Math.abs(sumCP - neto);
    if (neto > 0 && diff > 1) {
      $('#cp-alerta').html(`<span class="text-danger">⚠ Suma CPs (${Format.clp(sumCP)}) ≠ Neto (${Format.clp(neto)})</span>`);
    } else {
      $('#cp-alerta').text('');
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

  _removeRec(i) { SolicitudesView._state.receptores.splice(i, 1); SolicitudesView._renderReceptores(); },

  _recalcular() {
    const { cps } = SolicitudesView._state;
    const empresaCod = $('[name=empresa_emisora]').val() || 'MAS_CONSULTORES';
    const empresa = AppConfig.empresasEmisoras.find(e => e.codigo === empresaCod) || AppConfig.empresasEmisoras[0];

    const netoCLP = (cps || []).reduce((sum, cp) => sum + (Number(cp.monto_clp) || 0), 0);
    const ivaCLP = empresa.afectoIva ? Math.round(netoCLP * (empresa.ivaPct || 0.19)) : 0;
    const totalCLP = netoCLP + ivaCLP;
    SolicitudesView._lastNeto = netoCLP;

    $('#resumen-neto').text(Format.clp(netoCLP));
    $('#resumen-iva').text(empresa.afectoIva ? Format.clp(ivaCLP) : 'Exento');
    $('#resumen-total').text(Format.clp(totalCLP));
    SolicitudesView._checkCPBalance();
  },

  _renderBotones() {
    const { sol, readonly } = SolicitudesView._state;
    const estado = sol ? sol.estado : 'Borrador';
    let btns = '';

    if (!readonly) {
      btns += '<button class="btn btn-outline-secondary" id="btn-guardar">Guardar borrador</button>';
      btns += '<button class="btn btn-primary" id="btn-revision">Enviar a revisión</button>';
    }
    if (estado === 'EnRevision') btns += '<button class="btn btn-success" id="btn-aprobar">Aprobar</button><button class="btn btn-danger" id="btn-rechazar">Rechazar</button>';
    if (estado === 'Aprobada') btns += '<button class="btn btn-info text-white" id="btn-emitir">Marcar Emitida</button><button class="btn btn-success" id="btn-exportar">Exportar XLSX</button>';
    if (estado === 'Emitida') btns += '<button class="btn btn-success" id="btn-facturada">Marcar Facturada</button><button class="btn btn-danger" id="btn-anular">Anular</button><button class="btn btn-outline-success" id="btn-exportar">Exportar XLSX</button>';
    if (['Facturada','Cerrada','Emitida'].includes(estado)) btns += '';
    if (sol) btns += '<button class="btn btn-outline-secondary" id="btn-duplicar">Duplicar</button>';
    if (sol) btns += '<button class="btn btn-outline-danger" id="btn-eliminar-solicitud"><i class="bi bi-trash"></i> Eliminar solicitud</button>';

    $('#botones-estado').html(btns);
    SolicitudesView._wireButtons();
  },

  _wireButtons() {
    const { sol } = SolicitudesView._state;

    const _guardar = (hacia, cb) => {
      const payload = SolicitudesView._collectForm();
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
      const fecha = prompt('Fecha de facturación (YYYY-MM-DD):') || new Date().toISOString().slice(0,10);
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
      UI.toast('Generando XLSX…', 'info');
      SolicitudesService.exportar(sol.id).then(exp => {
        window.open('/api/exportaciones/' + exp.exportId, '_blank');
        UI.toast('XLSX descargado', 'success');
      }).fail(e => UI.toast(e.message, 'danger'));
    });

    $('#btn-duplicar').on('click', () => {
      SolicitudesService.duplicar(sol.id).then(s => {
        UI.toast('Duplicada como ' + s.folio, 'success');
        location.hash = '#/solicitudes/' + s.id;
      }).fail(e => UI.toast(e.message, 'danger'));
    });

    $('#btn-eliminar-solicitud').on('click', () => {
      SolicitudesView._confirmDelete(sol.id).then(deleted => {
        if (deleted) location.hash = '#/solicitudes';
      });
    });
  },

  _confirmDelete(id) {
    return UI.confirm('¿Seguro que deseas eliminar esta solicitud?', 'Eliminar solicitud').then(ok => {
      if (!ok) return false;
      return SolicitudesService.delete(id).then(() => {
        UI.toast('Solicitud eliminada correctamente', 'success');
        return true;
      }, e => {
        UI.toast(e.message || 'Error al eliminar solicitud', 'danger');
        return false;
      });
    });
  },

  _collectForm() {
    const val = n => $(`[name=${n}]`).val();
    const { cps, receptores } = SolicitudesView._state;

    return {
      empresa_emisora: val('empresa_emisora') || 'MAS_CONSULTORES',
      tipo: val('tipo') || 'mensual',
      periodo: val('periodo'),
      cliente_id: val('cliente_id') || $('#sel-cliente').val(),
      oc_numero: val('oc_numero') || null,
      contrato_numero: val('contrato_numero') || null,
      hes_numero: val('hes_numero') || null,
      glosa: val('glosa'),
      area: val('area') || null,
      moneda_base: val('moneda_base') || 'CLP',
      uf_fecha: val('uf_fecha') || null,
      uf_valor: val('uf_valor') ? Number(val('uf_valor')) : null,
      observaciones: val('observaciones') || null,
      cps: cps.map(cp => ({
        cp_id: cp.cp_id || null,
        cp_codigo: cp.cp_codigo || cp.codigo || '',
        monto_clp: Number(cp.monto_clp) || 0
      })).filter(cp => cp.cp_id || cp.cp_codigo),
      receptores: receptores.map(r => ({ receptor_id: r.id || r.receptor_id })).filter(r => r.receptor_id)
    };
  },

  _state: { sol: null, readonly: false, cps: [], receptores: [], clienteActual: null, cpsDisponibles: [] },
  _lastNeto: 0
};
