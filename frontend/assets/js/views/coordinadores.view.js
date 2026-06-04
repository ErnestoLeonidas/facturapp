window.CoordinadoresView = {
  list() {
    UI.setTitle('Coordinadores');
    $('#view-root').html(`
      <div class="card mb-3"><div class="card-header d-flex justify-content-between align-items-center">
        <span>Coordinadores</span>
        <button class="btn btn-sm btn-primary" id="btn-nuevo-coord">+ Nuevo</button>
      </div></div>
      <div class="card">
        <div class="table-responsive">
          <table class="table mb-0 align-middle table-hover">
            <thead><tr><th>Nombre</th><th>Email</th><th>Estado</th><th class="text-end">Acciones</th></tr></thead>
            <tbody id="tbl-coordinadores">
              <tr><td colspan="4" class="text-center py-3"><div class="spinner-border spinner-border-sm"></div></td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="modal fade" id="modalAsignarClienteCoord" tabindex="-1">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="modalAsignarClienteTitulo">Asignar cliente</h5>
              <button class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
              <div class="mb-3">
                <label class="form-label">Cliente *</label>
                <select class="form-select" name="coord_cliente_id">
                  <option value="">Seleccionar cliente</option>
                </select>
              </div>
              <div>
                <label class="form-label">Nombre CP asociado</label>
                <select class="form-select" name="coord_cliente_cp_nombre" disabled>
                  <option value="">General del cliente</option>
                </select>
              </div>
              <div id="coord-cliente-result" class="mt-3"></div>
            </div>
            <div class="modal-footer">
              <button class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
              <button class="btn btn-primary" id="btn-guardar-cliente-coord">Guardar</button>
            </div>
          </div>
        </div>
      </div>

      <div class="modal fade" id="modalCoordinador" tabindex="-1">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="modalCoordTitulo">Nuevo coordinador</h5>
              <button class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
              <div class="row g-3">
                <div class="col-12">
                  <label class="form-label">Nombre *</label>
                  <input class="form-control" name="coord_nombre">
                </div>
                <div class="col-12">
                  <label class="form-label">Email</label>
                  <input class="form-control" type="email" name="coord_email">
                </div>
                <div class="col-12">
                  <label class="form-label">Estado</label>
                  <select class="form-select" name="coord_activo">
                    <option value="1">Activo</option>
                    <option value="0">Inactivo</option>
                  </select>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
              <button class="btn btn-primary" id="btn-guardar-coord">Guardar</button>
            </div>
          </div>
        </div>
      </div>
    `);

    const modal = new bootstrap.Modal('#modalCoordinador');
    const modalAsignarCliente = new bootstrap.Modal('#modalAsignarClienteCoord');

    const cargar = () => {
      CoordinadoresService.list().then(coords => {
        $('#tbl-coordinadores').html(coords.map(c => `
          <tr>
            <td>${c.nombre}</td>
            <td>${c.email || '—'}</td>
            <td><span class="badge ${c.activo ? 'bg-success' : 'bg-secondary'}">${c.activo ? 'Activo' : 'Inactivo'}</span></td>
            <td class="text-end">
              <button class="btn btn-sm btn-outline-primary" data-assign-client-id="${c.id}" ${c.activo ? '' : 'disabled'}>Asignar cliente</button>
              <button class="btn btn-sm btn-outline-secondary" data-edit-id="${c.id}">Editar</button>
              <button class="btn btn-sm btn-outline-danger ms-1" data-delete-id="${c.id}">Eliminar</button>
            </td>
          </tr>`).join('') || '<tr><td colspan="4" class="text-muted text-center py-3">Sin coordinadores</td></tr>');
        CoordinadoresView._items = coords;
      }).fail(e => UI.error('#tbl-coordinadores', e));
    };

    const abrirForm = (coord) => {
      CoordinadoresView._editingId = coord ? coord.id : null;
      $('#modalCoordTitulo').text(coord ? 'Editar coordinador' : 'Nuevo coordinador');
      $('[name=coord_nombre]').val(coord ? coord.nombre : '');
      $('[name=coord_email]').val(coord ? coord.email || '' : '');
      $('[name=coord_activo]').val(coord && !coord.activo ? '0' : '1');
      modal.show();
    };

    cargar();

    $('#btn-nuevo-coord').on('click', () => abrirForm(null));

    $('#tbl-coordinadores').on('click', '[data-edit-id]', function() {
      const coord = CoordinadoresView._items.find(c => c.id === $(this).data('edit-id'));
      if (coord) abrirForm(coord);
    });

    $('#tbl-coordinadores').on('click', '[data-assign-client-id]', function() {
      const coord = CoordinadoresView._items.find(c => c.id === $(this).data('assign-client-id'));
      if (coord) CoordinadoresView._abrirAsignarCliente(coord, modalAsignarCliente);
    });

    $('[name=coord_cliente_id]').on('change', function() {
      CoordinadoresView._cargarCPCliente($(this).val());
    });

    $('#tbl-coordinadores').on('click', '[data-delete-id]', function(e) {
      e.preventDefault();
      e.stopPropagation();
      const id = $(this).data('delete-id');
      UI.confirm('¿Seguro que deseas eliminar este coordinador?', 'Eliminar coordinador').then(ok => {
        if (!ok) return;
        CoordinadoresService.delete(id).then(() => {
          UI.toast('Coordinador eliminado', 'success');
          cargar();
        }).fail(e => UI.toast(e.message || 'Error al eliminar', 'danger'));
      });
    });

    $('#btn-guardar-coord').on('click', () => {
      const payload = {
        nombre: $('[name=coord_nombre]').val(),
        email: $('[name=coord_email]').val() || null,
        activo: $('[name=coord_activo]').val() === '1'
      };
      const req = CoordinadoresView._editingId
        ? CoordinadoresService.update(CoordinadoresView._editingId, payload)
        : CoordinadoresService.create(payload);
      req.then(() => {
        modal.hide();
        UI.toast('Coordinador guardado', 'success');
        cargar();
      }).fail(e => UI.toast(e.message || 'Error al guardar', 'danger'));
    });

    $('#btn-guardar-cliente-coord').on('click', () => {
      CoordinadoresView._guardarAsignacionCliente(modalAsignarCliente);
    });
  },

  _abrirAsignarCliente(coord, modal) {
    CoordinadoresView._assigningCoord = coord;
    $('#modalAsignarClienteTitulo').text('Asignar cliente a ' + coord.nombre);
    $('#coord-cliente-result').empty();
    $('[name=coord_cliente_id]').val('');
    $('[name=coord_cliente_cp_nombre]')
      .html('<option value="">General del cliente</option>')
      .prop('disabled', true);

    ClientesService.list({ estado: 'Activo' }).then(clientes => {
      $('[name=coord_cliente_id]').html(
        '<option value="">Seleccionar cliente</option>' +
        (clientes || []).map(cliente => `<option value="${cliente.id}">${cliente.nombre_corto}</option>`).join('')
      );
    }).fail(e => {
      $('#coord-cliente-result').html(`<div class="alert alert-danger py-2 mb-0">${e.message || 'No se pudieron cargar clientes'}</div>`);
    });
    modal.show();
  },

  _cargarCPCliente(clienteId) {
    const $select = $('[name=coord_cliente_cp_nombre]');
    $select.html('<option value="">General del cliente</option>').prop('disabled', true);
    if (!clienteId) return;
    ClientesService.get(clienteId).then(cliente => {
      const nombres = [...new Set((cliente.cps || []).map(cp => cp.nombre).filter(Boolean))]
        .sort((a, b) => a.localeCompare(b, 'es'));
      $select.html(
        '<option value="">General del cliente</option>' +
        nombres.map(nombre => `<option value="${CoordinadoresView._esc(nombre)}">${CoordinadoresView._esc(nombre)}</option>`).join('')
      ).prop('disabled', false);
    }).fail(e => {
      $('#coord-cliente-result').html(`<div class="alert alert-danger py-2 mb-0">${e.message || 'No se pudieron cargar CP del cliente'}</div>`);
    });
  },

  _guardarAsignacionCliente(modal) {
    const coord = CoordinadoresView._assigningCoord;
    const clienteId = $('[name=coord_cliente_id]').val();
    if (!coord || !coord.id || !clienteId) {
      $('#coord-cliente-result').html('<div class="alert alert-warning py-2 mb-0">Selecciona un cliente.</div>');
      return;
    }
    const payload = {
      coordinador_id: coord.id,
      cp_nombre: $('[name=coord_cliente_cp_nombre]').val() || null
    };
    const $button = $('#btn-guardar-cliente-coord');
    $button.prop('disabled', true).html('<span class="spinner-border spinner-border-sm"></span> Guardando');
    ClientesService.addCoordinador(clienteId, payload).then(() => {
      modal.hide();
      UI.toast('Cliente asignado al coordinador', 'success');
    }).fail(e => {
      $('#coord-cliente-result').html(`<div class="alert alert-danger py-2 mb-0">${e.message || 'Error al asignar cliente'}</div>`);
    }).always(() => {
      $button.prop('disabled', false).text('Guardar');
    });
  },

  _esc(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  },

  _items: [],
  _editingId: null,
  _assigningCoord: null
};
