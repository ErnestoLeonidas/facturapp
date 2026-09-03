window.ClientesView = {
  list() {
    UI.setTitle('Clientes');
    $('#view-root').html(`
      <div class="card mb-3"><div class="card-body py-2">
        <div class="row g-2 align-items-center">
          <div class="col">
            <input class="form-control form-control-sm" id="cli-q" placeholder="Buscar por cliente o RUT" autocomplete="off">
          </div>
          <div class="col-auto">
            <button class="btn btn-sm btn-primary" id="cli-nuevo" type="button">+</button>
          </div>
        </div>
      </div></div>
      <div class="card">
        <div class="table-responsive clientes-table-wrap d-none d-md-block">
          <table class="table mb-0 align-middle table-hover">
            <thead><tr>
              <th>Cliente</th><th>RUT</th><th>Estado</th><th></th>
            </tr></thead>
            <tbody id="tbl-clientes"><tr><td colspan="4" class="text-center py-4">
              <div class="spinner-border spinner-border-sm"></div>
            </td></tr></tbody>
          </table>
        </div>
        <div id="clientes-mobile-list" class="clientes-mobile-list d-md-none">
          <div class="text-center py-4"><div class="spinner-border spinner-border-sm"></div></div>
        </div>
      </div>
      <!-- Modal nuevo cliente -->
      <div class="modal fade" id="modalCliente" tabindex="-1">
        <div class="modal-dialog modal-lg">
          <div class="modal-content">
            <div class="modal-header"><h5 class="modal-title" id="modalCliTitulo">Nuevo cliente</h5>
              <button class="btn-close" data-bs-dismiss="modal"></button></div>
            <div class="modal-body" id="modalCliBody"></div>
            <div class="modal-footer">
              <button class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
              <button class="btn btn-primary" id="btnGuardarCliente">Guardar</button>
            </div>
          </div>
        </div>
      </div>
    `);

    let searchTimer = null;
    const cargar = () => {
      const q = String($('#cli-q').val() || '').trim();
      const params = q ? { q } : {};
      ClientesService.list(params).then(data => {
        if (!data.length) {
          const empty = '<div class="text-center text-muted py-3">Sin resultados</div>';
          $('#tbl-clientes').html('<tr><td colspan="4">' + empty + '</td></tr>');
          $('#clientes-mobile-list').html(empty);
          return;
        }
        $('#tbl-clientes').html(data.map(c => `
          <tr style="cursor:pointer" onclick="ClientesView.detalle_inline('${c.id}')">
            <td><strong>${c.nombre_corto}</strong>${c.razon_social ? '<br><small class="text-muted">'+c.razon_social+'</small>' : ''}</td>
            <td>${c.rut || '—'}</td>
            <td><span class="badge ${c.estado==='Activo'?'bg-success':'bg-secondary'}">${c.estado}</span></td>
            <td><a class="btn btn-sm btn-outline-secondary" href="#/clientes/${c.id}">Ver</a></td>
          </tr>`).join(''));
        $('#clientes-mobile-list').html(data.map(c => `
          <article class="cliente-mobile-card" onclick="ClientesView.detalle_inline('${c.id}')">
            <div class="min-w-0">
              <strong>${c.nombre_corto}</strong>
              ${c.razon_social ? '<span>'+c.razon_social+'</span>' : ''}
              <small>${c.rut || 'Sin RUT'}</small>
            </div>
            <div class="cliente-mobile-actions">
              <span class="badge ${c.estado==='Activo'?'bg-success':'bg-secondary'}">${c.estado}</span>
              <a class="btn btn-sm btn-outline-secondary" href="#/clientes/${c.id}" onclick="event.stopPropagation()">Ver</a>
            </div>
          </article>
        `).join(''));
      }).fail(e => UI.error('#tbl-clientes', e));
    };

    cargar();
    $('#cli-q').on('input', () => {
      clearTimeout(searchTimer);
      searchTimer = setTimeout(cargar, 180);
    });

    $('#cli-nuevo').on('click', () => {
      $('#modalCliTitulo').text('Nuevo cliente');
      ClientesView._renderForm('#modalCliBody', {});
      ClientesView._editingId = null;
      new bootstrap.Modal('#modalCliente').show();
    });

    $('#btnGuardarCliente').on('click', () => {
      const payload = ClientesView._collectForm('#modalCliBody');
      const req = ClientesView._editingId
        ? ClientesService.update(ClientesView._editingId, payload)
        : ClientesService.create(payload);
      req.then(() => {
        bootstrap.Modal.getInstance('#modalCliente').hide();
        UI.toast('Cliente guardado', 'success');
        cargar();
      }).fail(e => UI.toast(e.message || 'Error', 'danger'));
    });
  },

  detalle_inline(id) { location.hash = '#/clientes/' + id; },

  detalle(params) {
    UI.loading();
    ClientesService.get(params.id).then(c => {
      UI.setTitle(c.nombre_corto);
      $('#view-root').html(`
        <div class="row g-3">
          <div class="col-md-5">
            <div class="card">
              <div class="card-header d-flex justify-content-between">
                <span>Datos del cliente</span>
                <button class="btn btn-sm btn-outline-secondary" id="btn-editar-cli">Editar</button>
              </div>
              <div class="card-body">
                <p><strong>Razón social:</strong> ${c.razon_social||'—'}</p>
                <p><strong>RUT:</strong> ${c.rut||'—'}</p>
                <p><strong>Giro:</strong> ${c.giro||'—'}</p>
                <p><strong>Dirección:</strong> ${c.direccion||'—'}</p>
                <p><strong>Requiere HES:</strong> ${c.requiere_hes?'<span class="badge bg-warning text-dark">Sí</span>':'No'}</p>
                <p><strong>Responsable base:</strong> ${c.coordinador?c.coordinador.nombre:'—'}</p>
                <p><strong>Estado:</strong> <span class="badge ${c.estado==='Activo'?'bg-success':'bg-secondary'}">${c.estado}</span></p>
                ${c.notas?`<p><strong>Notas:</strong> ${c.notas}</p>`:''}
              </div>
            </div>
            <div class="card mt-3">
              <div class="card-header d-flex justify-content-between align-items-center">
                <span>Datos de facturación</span>
                <button class="btn btn-sm btn-outline-primary" id="btn-add-dato-fact">+ Datos</button>
              </div>
              <div class="list-group list-group-flush">
                ${(c.datos_facturacion || []).map((dato, i) => `
                  <div class="list-group-item">
                    <div class="d-flex justify-content-between gap-2">
                      <strong>${dato.etiqueta || `Datos cliente ${i + 1}`}</strong>
                      ${dato.es_original ? '<span class="badge bg-secondary">Original</span>' : ''}
                    </div>
                    <div>${dato.razon_social || '—'}</div>
                    <small class="text-muted d-block">${dato.rut || 'Sin RUT'}</small>
                    <small class="text-muted d-block">${dato.giro || 'Sin giro'}</small>
                    <small class="text-muted d-block">${dato.direccion || 'Sin dirección'}</small>
                  </div>
                `).join('') || '<div class="list-group-item text-muted">Sin datos de facturación</div>'}
              </div>
            </div>
          </div>
          <div class="col-md-7">
            <div class="card mb-3">
              <div class="card-header d-flex justify-content-between">
                Responsables
                <button class="btn btn-sm btn-outline-primary" id="btn-add-coord-cli">+ Responsable</button>
              </div>
              <ul class="list-group list-group-flush" id="lst-coord-cli">
                ${(c.coordinadores||[]).map(a => `
                  <li class="list-group-item d-flex justify-content-between align-items-center">
                    <span>${a.nombre}<br><small class="text-muted">${a.cp_nombre || 'General del cliente'}</small></span>
                    <button class="btn btn-sm btn-outline-danger" data-delete-coord-cli="${a.id}">Eliminar</button>
                  </li>`).join('') || '<li class="list-group-item text-muted">Sin responsables asignados</li>'}
              </ul>
            </div>
            <div class="card mb-3">
              <div class="card-header d-flex justify-content-between">
                Receptores
                <button class="btn btn-sm btn-outline-primary" id="btn-add-rec">+ Receptor</button>
              </div>
              <ul class="list-group list-group-flush" id="lst-rec">
                ${(c.receptores||[]).map(r => `
                  <li class="list-group-item d-flex justify-content-between">
                    <span>${r.nombre}<br><small class="text-muted">${r.email}</small></span>
                  </li>`).join('') || '<li class="list-group-item text-muted">Sin receptores</li>'}
              </ul>
            </div>
            <div class="card">
              <div class="card-header d-flex justify-content-between">
                Centros de Proyecto
                <button class="btn btn-sm btn-outline-primary" id="btn-add-cp">+ CP</button>
              </div>
              <div class="table-responsive">
                <table class="table table-sm mb-0 align-middle cliente-cp-table">
                  <thead><tr><th>Código</th><th>Nombre</th><th>Tipo CP</th><th class="text-end"></th></tr></thead>
                  <tbody>
                    ${(c.cps||[]).map(cp => `
                      <tr>
                        <td><code>${cp.codigo}</code></td>
                        <td>${cp.nombre||'—'}</td>
                        <td>${cp.tipo_cp||'—'}</td>
                        <td class="text-end">
                          <button class="btn btn-sm btn-outline-secondary" data-edit-cp="${cp.id}">Editar</button>
                          <button class="btn btn-sm btn-outline-danger ms-1" data-delete-cp="${cp.id}">Eliminar</button>
                        </td>
                      </tr>`).join('') || '<tr><td colspan="4" class="text-muted text-center py-3">Sin CPs</td></tr>'}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
        <div class="mt-3">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <h6>Solicitudes recientes</h6>
            <a class="btn btn-sm btn-primary" href="#/solicitudes/nueva?clienteId=${c.id}">+ Nueva solicitud</a>
          </div>
          <div class="card"><div class="table-responsive">
            <table class="table mb-0 align-middle">
              <thead><tr><th>Período</th><th class="text-end">Total</th><th>Estado</th></tr></thead>
              <tbody id="tbl-cli-solic"></tbody>
            </table>
          </div></div>
        </div>
      `);

      SolicitudesService.list({ clienteId: params.id }).then(sols => {
        $('#tbl-cli-solic').html(sols.slice(0,10).map(s => `
          <tr style="cursor:pointer" onclick="location.hash='#/solicitudes/${s.id}'">
            <td>${s.periodo}</td>
            <td class="text-end">${Format.clp(s.monto_total_clp)}</td>
            <td>${UI.estadoChip(s.estado)}</td>
          </tr>`).join('') || '<tr><td colspan="3" class="text-muted text-center py-3">Sin solicitudes</td></tr>');
      });

      $('#btn-editar-cli').on('click', () => {
        const $modal = $(`<div class="modal fade" tabindex="-1"><div class="modal-dialog modal-lg"><div class="modal-content">
          <div class="modal-header"><h5>Editar ${c.nombre_corto}</h5><button class="btn-close" data-bs-dismiss="modal"></button></div>
          <div class="modal-body" id="editCliBody"></div>
          <div class="modal-footer"><button class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
          <button class="btn btn-primary" id="btnSaveEdit">Guardar</button></div>
        </div></div></div>`);
        $('body').append($modal);
        ClientesView._renderForm('#editCliBody', c);
        const modal = new bootstrap.Modal($modal[0]);
        modal.show();
        $('#btnSaveEdit').on('click', () => {
          ClientesService.update(c.id, ClientesView._collectForm('#editCliBody')).then(() => {
            modal.hide(); $modal.remove(); UI.toast('Guardado', 'success'); ClientesView.detalle(params);
          }).fail(e => UI.toast(e.message,'danger'));
        });
        $modal.on('hidden.bs.modal', () => $modal.remove());
      });

      $('#btn-add-rec').on('click', () => {
        const nombre = prompt('Nombre del receptor:');
        const email = prompt('Email:');
        if (nombre && email) {
          Api.post('/receptores', { cliente_id: c.id, nombre, email })
            .then(() => { UI.toast('Receptor agregado','success'); ClientesView.detalle(params); })
            .fail(e => UI.toast(e.message,'danger'));
        }
      });

      $('#btn-add-coord-cli').on('click', () => ClientesView._abrirModalCoordinadorCliente(params, c));
      $('#btn-add-dato-fact').on('click', () => ClientesView._abrirModalDatoFacturacion(params, c));

      $('[data-delete-coord-cli]').on('click', function() {
        const asignacionId = $(this).data('delete-coord-cli');
        ClientesService.deleteCoordinador(c.id, asignacionId)
          .then(() => { UI.toast('Responsable quitado', 'success'); ClientesView.detalle(params); })
          .fail(e => UI.toast(e.message || 'Error al quitar responsable', 'danger'));
      });

      $('#btn-add-cp').on('click', () => ClientesView._abrirModalCP(params, c, null));

      $('[data-edit-cp]').on('click', function() {
        const cp = (c.cps || []).find(x => x.id === $(this).data('edit-cp'));
        if (cp) ClientesView._abrirModalCP(params, c, cp);
      });

      $('[data-delete-cp]').on('click', function() {
        const cpId = $(this).data('delete-cp');
        UI.confirm('¿Seguro que deseas eliminar este CP?', 'Eliminar CP').then(ok => {
          if (!ok) return;
          Api.del('/cp/' + cpId)
            .then(() => { UI.toast('CP eliminado', 'success'); ClientesView.detalle(params); })
            .fail(e => UI.toast(e.message || 'Error al eliminar CP', 'danger'));
        });
      });
    }).fail(e => UI.error('#view-root', e));
  },

  _abrirModalCoordinadorCliente(params, cliente) {
    const $modal = $(`<div class="modal fade" tabindex="-1"><div class="modal-dialog"><div class="modal-content">
      <div class="modal-header">
        <h5>Asignar responsable</h5>
        <button class="btn-close" data-bs-dismiss="modal"></button>
      </div>
      <div class="modal-body">
        <div class="mb-3">
          <label class="form-label">Responsable *</label>
          <select class="form-select" name="coord_id"><option value="">Seleccionar</option></select>
        </div>
        <div>
          <label class="form-label">Nombre CP asociado</label>
          <select class="form-select" name="coord_cp_nombre">
            <option value="">General del cliente</option>
            ${[...new Set((cliente.cps || []).map(cp => cp.nombre).filter(Boolean))]
              .sort((a, b) => a.localeCompare(b, 'es'))
              .map(nombre => `<option value="${nombre}">${nombre}</option>`).join('')}
          </select>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
        <button class="btn btn-primary" id="btnSaveCoordCli">Guardar</button>
      </div>
    </div></div></div>`);
    $('body').append($modal);
    const modal = new bootstrap.Modal($modal[0]);
    CoordinadoresService.list().then(coords => {
      $modal.find('[name=coord_id]').append((coords || [])
        .filter(coord => coord.activo !== 0)
        .map(coord => `<option value="${coord.id}">${coord.nombre}</option>`)
        .join(''));
    });
    modal.show();
    $modal.find('#btnSaveCoordCli').on('click', () => {
      const payload = {
        coordinador_id: $modal.find('[name=coord_id]').val(),
        cp_nombre: $modal.find('[name=coord_cp_nombre]').val() || null
      };
      ClientesService.addCoordinador(cliente.id, payload).then(() => {
        modal.hide();
        UI.toast('Responsable asignado', 'success');
        ClientesView.detalle(params);
      }).fail(e => UI.toast(e.message || 'Error al asignar responsable', 'danger'));
    });
    $modal.on('hidden.bs.modal', () => $modal.remove());
  },

  _abrirModalDatoFacturacion(params, cliente) {
    const next = (cliente.datos_facturacion || []).length + 1;
    const $modal = $(`<div class="modal fade" tabindex="-1"><div class="modal-dialog modal-lg"><div class="modal-content">
      <div class="modal-header">
        <h5>Agregar datos de facturación</h5>
        <button class="btn-close" data-bs-dismiss="modal"></button>
      </div>
      <div class="modal-body">
        <div class="row g-3">
          <div class="col-md-4"><label class="form-label">Etiqueta</label><input class="form-control" name="fact_etiqueta" value="Datos cliente ${next}"></div>
          <div class="col-md-8"><label class="form-label">Razón social *</label><input class="form-control" name="fact_razon_social"></div>
          <div class="col-md-4"><label class="form-label">RUT</label><input class="form-control" name="fact_rut"></div>
          <div class="col-md-8"><label class="form-label">Giro</label><input class="form-control" name="fact_giro"></div>
          <div class="col-12"><label class="form-label">Dirección</label><input class="form-control" name="fact_direccion"></div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
        <button class="btn btn-primary" id="btnSaveDatoFact">Guardar</button>
      </div>
    </div></div></div>`);
    $('body').append($modal);
    const modal = new bootstrap.Modal($modal[0]);
    modal.show();
    $modal.find('#btnSaveDatoFact').on('click', () => {
      const payload = {
        etiqueta: $modal.find('[name=fact_etiqueta]').val() || null,
        razon_social: $modal.find('[name=fact_razon_social]').val(),
        rut: $modal.find('[name=fact_rut]').val() || null,
        giro: $modal.find('[name=fact_giro]').val() || null,
        direccion: $modal.find('[name=fact_direccion]').val() || null
      };
      ClientesService.addDatosFacturacion(cliente.id, payload).then(() => {
        modal.hide();
        UI.toast('Datos de facturación agregados', 'success');
        ClientesView.detalle(params);
      }).fail(e => UI.toast(e.message || 'Error al guardar datos de facturación', 'danger'));
    });
    $modal.on('hidden.bs.modal', () => $modal.remove());
  },

  _abrirModalCP(params, cliente, cp) {
    const tipos = ['Administración y Operación', 'Construcción', 'Horas de Desarrollo'];
    const isEdit = !!cp;
    const tipoActual = (cp && cp.tipo_cp) || tipos[0];
    const $modal = $(`<div class="modal fade" tabindex="-1"><div class="modal-dialog"><div class="modal-content">
      <div class="modal-header">
        <h5>${isEdit ? 'Editar CP' : 'Nuevo CP'}</h5>
        <button class="btn-close" data-bs-dismiss="modal"></button>
      </div>
      <div class="modal-body">
        <div class="row g-3">
          <div class="col-md-5">
            <label class="form-label">Código *</label>
            <input class="form-control" name="cp_codigo" value="${cp ? cp.codigo || '' : ''}" placeholder="MS25010">
          </div>
          <div class="col-md-7">
            <label class="form-label">Nombre *</label>
            <input class="form-control" name="cp_nombre" value="${cp ? cp.nombre || '' : ''}">
          </div>
          <div class="col-12">
            <label class="form-label">Tipo CP *</label>
            <select class="form-select" name="cp_tipo">
              ${tipos.map(t => `<option value="${t}" ${t === tipoActual ? 'selected' : ''}>${t}</option>`).join('')}
            </select>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
        <button class="btn btn-primary" id="btnSaveCP">Guardar</button>
      </div>
    </div></div></div>`);
    $('body').append($modal);
    const modal = new bootstrap.Modal($modal[0]);
    modal.show();

    $modal.find('#btnSaveCP').on('click', () => {
      const payload = {
        codigo: $modal.find('[name=cp_codigo]').val(),
        nombre: $modal.find('[name=cp_nombre]').val(),
        tipo_cp: $modal.find('[name=cp_tipo]').val(),
        cliente_id: cliente.id
      };
      const req = isEdit ? Api.patch('/cp/' + cp.id, payload) : Api.post('/cp', payload);
      req.then(() => {
        modal.hide();
        UI.toast('CP guardado', 'success');
        ClientesView.detalle(params);
      }).fail(e => UI.toast(e.message || 'Error al guardar CP', 'danger'));
    });
    $modal.on('hidden.bs.modal', () => $modal.remove());
  },

  _renderForm(target, c) {
    $(target).html(`
      <div class="row g-3">
        <div class="col-md-6"><label class="form-label">Nombre corto *</label><input class="form-control" name="nombre_corto" value="${c.nombre_corto||''}"></div>
        <div class="col-md-6"><label class="form-label">Razón social</label><input class="form-control" name="razon_social" value="${c.razon_social||''}"></div>
        <div class="col-md-4"><label class="form-label">RUT</label><input class="form-control" name="rut" value="${c.rut||''}"></div>
        <div class="col-md-8"><label class="form-label">Giro</label><input class="form-control" name="giro" value="${c.giro||''}"></div>
        <div class="col-12"><label class="form-label">Dirección</label><input class="form-control" name="direccion" value="${c.direccion||''}"></div>
        <div class="col-md-4">
          <label class="form-label">Estado</label>
          <select class="form-select" name="estado">
            ${['Activo','En espera','Inactivo'].map(e=>`<option ${c.estado===e?'selected':''}>${e}</option>`).join('')}
          </select>
        </div>
        <div class="col-md-6">
          <label class="form-label">Responsable</label>
          <select class="form-select" name="coordinador_id">
            <option value="">Seleccionar responsable</option>
          </select>
        </div>
        <div class="col-12">
          <div class="form-check">
            <input class="form-check-input" type="checkbox" name="requiere_hes" id="chkHes" ${c.requiere_hes?'checked':''}>
            <label class="form-check-label" for="chkHes">Requiere HES (ej. Transelect)</label>
          </div>
        </div>
        <div class="col-12"><label class="form-label">Notas</label><textarea class="form-control" name="notas" rows="2">${c.notas||''}</textarea></div>
      </div>
    `);

    const selectedCoord = c.coordinador_id || (c.coordinador && c.coordinador.id) || '';
    CoordinadoresService.list().then(coords => {
      const options = coords
        .filter(coord => coord.activo || coord.id === selectedCoord)
        .map(coord => `<option value="${coord.id}" ${coord.id === selectedCoord ? 'selected' : ''}>${coord.nombre}${coord.activo ? '' : ' (Inactivo)'}</option>`)
        .join('');
      $(target).find('[name=coordinador_id]').append(options);
    }).fail(() => {
      $(target).find('[name=coordinador_id]').append('<option value="" disabled>No se pudieron cargar responsables</option>');
    });
  },

  _collectForm(target) {
    const $f = $(target);
    const val = n => $f.find(`[name=${n}]`).val();
    return {
      nombre_corto: val('nombre_corto'),
      razon_social: val('razon_social') || null,
      rut: val('rut') || null,
      giro: val('giro') || null,
      direccion: val('direccion') || null,
      estado: val('estado'),
      coordinador_id: val('coordinador_id') || null,
      requiere_hes: $f.find('[name=requiere_hes]').is(':checked'),
      notas: val('notas') || null
    };
  },
  _editingId: null
};

