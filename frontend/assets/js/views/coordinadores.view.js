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

    const cargar = () => {
      CoordinadoresService.list().then(coords => {
        $('#tbl-coordinadores').html(coords.map(c => `
          <tr>
            <td>${c.nombre}</td>
            <td>${c.email || '—'}</td>
            <td><span class="badge ${c.activo ? 'bg-success' : 'bg-secondary'}">${c.activo ? 'Activo' : 'Inactivo'}</span></td>
            <td class="text-end">
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

    $('#tbl-coordinadores').on('click', '[data-delete-id]', function() {
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
  },

  _items: [],
  _editingId: null
};
