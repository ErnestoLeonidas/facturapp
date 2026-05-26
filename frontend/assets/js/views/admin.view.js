window.AdminView = {
  render() {
    if (!AuthService.isAdmin()) {
      UI.setTitle('Admin');
      $('#view-root').html('<div class="alert alert-warning">Debes iniciar sesión como admin para acceder.</div>');
      return;
    }

    UI.setTitle('Admin');
    $('#view-root').html(`
      <div class="row g-3">
        <div class="col-lg-5">
          <div class="card">
            <div class="card-header"><strong>Usuarios</strong></div>
            <div class="card-body border-bottom">
              <div class="row g-2 align-items-end">
                <div class="col-md-4">
                  <label class="form-label">Nombre</label>
                  <input class="form-control form-control-sm" id="admin-user-nombre" placeholder="Nombre Apellido">
                </div>
                <div class="col-md-3">
                  <label class="form-label">Usuario</label>
                  <input class="form-control form-control-sm" id="admin-user-username" placeholder="nomsur">
                </div>
                <div class="col-md-2">
                  <label class="form-label">Rol</label>
                  <select class="form-select form-select-sm" id="admin-user-rol">
                    <option value="usuario">Usuario</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div class="col-md-3">
                  <label class="form-label">Password</label>
                  <input class="form-control form-control-sm" id="admin-user-password" type="password" placeholder="Min. 6 caracteres">
                </div>
                <div class="col-12">
                  <button class="btn btn-sm btn-primary" id="btn-admin-create-user" type="button"><i class="bi bi-person-plus"></i> Crear usuario</button>
                </div>
              </div>
              <div id="admin-user-result" class="mt-2"></div>
            </div>
            <div class="card-body p-0">
              <table class="table table-sm mb-0">
                <thead><tr><th>Nombre</th><th>Usuario</th><th>Rol</th><th>Estado</th><th class="text-end">Acciones</th></tr></thead>
                <tbody id="admin-users"><tr><td colspan="5" class="text-muted text-center py-3">Cargando...</td></tr></tbody>
              </table>
            </div>
          </div>

          <div class="card mt-3">
            <div class="card-header"><strong>Reportes</strong></div>
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center gap-3">
                <div>
                  <div class="fw-semibold">Pendientes OC del mes actual</div>
                  <div class="text-muted small">Cliente, CP, tipo de CP, mes y UF.</div>
                </div>
                <button class="btn btn-sm btn-outline-primary" id="btn-export-pendientes-oc" type="button">
                  <i class="bi bi-file-earmark-excel"></i> Exportar
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="col-lg-7">
          <div class="card">
            <div class="card-header d-flex justify-content-between align-items-center">
              <strong>Historial de cambios BD</strong>
              <button class="btn btn-sm btn-outline-secondary" id="btn-refresh-audit"><i class="bi bi-arrow-clockwise"></i></button>
            </div>
            <div class="card-body p-0">
              <div class="table-responsive">
                <table class="table table-sm align-middle mb-0">
                  <thead><tr><th>Fecha</th><th>Usuario</th><th>Acción</th><th>Entidad</th><th>Detalle</th></tr></thead>
                  <tbody id="admin-audit"><tr><td colspan="5" class="text-muted text-center py-3">Cargando...</td></tr></tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    `);

    $('#btn-admin-create-user').on('click', () => AdminView._crearUsuario());
    $('#btn-refresh-audit').on('click', () => AdminView._loadAudit());
    $('#btn-export-pendientes-oc').on('click', () => AdminView._exportarPendientesOC());
    AdminView._loadUsers();
    AdminView._loadAudit();
  },

  _loadUsers() {
    AdminService.usuarios().then(rows => {
      $('#admin-users').html(rows.map(u => `
        <tr>
          <td>${AdminView._esc(u.nombre)}</td>
          <td><code>${AdminView._esc(u.username || u.email)}</code></td>
          <td>${AdminView._esc(u.rol)}</td>
          <td>${u.activo ? '<span class="badge text-bg-success">Activo</span>' : '<span class="badge text-bg-secondary">Inactivo</span>'}</td>
          <td class="text-end">
            <button class="btn btn-sm btn-outline-secondary btn-admin-pass" data-id="${u.id}" data-user="${AdminView._esc(u.username || u.email)}" type="button"><i class="bi bi-key"></i></button>
            <button class="btn btn-sm btn-outline-danger btn-admin-delete-user" data-id="${u.id}" data-user="${AdminView._esc(u.username || u.email)}" type="button" ${!u.activo ? 'disabled' : ''}><i class="bi bi-trash"></i></button>
          </td>
        </tr>
      `).join(''));
      $('.btn-admin-pass').on('click', function () {
        AdminView._cambiarPassword($(this).data('id'), $(this).data('user'));
      });
      $('.btn-admin-delete-user').on('click', function () {
        AdminView._eliminarUsuario($(this).data('id'), $(this).data('user'));
      });
    }).fail(e => $('#admin-users').html(`<tr><td colspan="5" class="text-danger text-center py-3">${e.message || 'No disponible'}</td></tr>`));
  },

  _crearUsuario() {
    const payload = {
      nombre: $('#admin-user-nombre').val().trim(),
      username: $('#admin-user-username').val().trim(),
      rol: $('#admin-user-rol').val(),
      password: $('#admin-user-password').val()
    };
    $('#admin-user-result').html('<div class="text-muted small">Guardando...</div>');
    AdminService.crearUsuario(payload).then(() => {
      $('#admin-user-nombre,#admin-user-username,#admin-user-password').val('');
      $('#admin-user-result').html('<div class="alert alert-success py-2 mb-0">Usuario guardado.</div>');
      AdminView._loadUsers();
      AdminView._loadAudit();
    }).fail(e => {
      $('#admin-user-result').html(`<div class="alert alert-danger py-2 mb-0">${AdminView._esc(e.message || 'No se pudo guardar el usuario')}</div>`);
    });
  },

  _cambiarPassword(id, username) {
    const password = prompt(`Nuevo password para ${username}:`);
    if (!password) return;
    AdminService.cambiarPasswordUsuario(id, password).then(() => {
      UI.toast('Password actualizado', 'success');
      AdminView._loadAudit();
    }).fail(e => UI.toast(e.message || 'No se pudo cambiar el password', 'danger'));
  },

  _eliminarUsuario(id, username) {
    if (!confirm(`Eliminar usuario ${username}?`)) return;
    AdminService.eliminarUsuario(id).then(() => {
      UI.toast('Usuario eliminado', 'success');
      AdminView._loadUsers();
      AdminView._loadAudit();
    }).fail(e => UI.toast(e.message || 'No se pudo eliminar el usuario', 'danger'));
  },

  _loadAudit() {
    AdminService.audit(80).then(rows => {
      if (!rows.length) {
        $('#admin-audit').html('<tr><td colspan="5" class="text-muted text-center py-3">Sin eventos</td></tr>');
        return;
      }
      $('#admin-audit').html(rows.map(row => `
        <tr>
          <td><small>${row.created_at || ''}</small></td>
          <td><small>${row.usuario_email || 'sistema'}</small></td>
          <td>${row.accion}</td>
          <td><small>${row.entidad}${row.entidad_id ? '<br><code>' + row.entidad_id + '</code>' : ''}</small></td>
          <td><small>${AdminView._detalle(row.detalle)}</small></td>
        </tr>
      `).join(''));
    }).fail(e => $('#admin-audit').html(`<tr><td colspan="5" class="text-danger text-center py-3">${e.message || 'No disponible'}</td></tr>`));
  },

  _exportarPendientesOC() {
    const $button = $('#btn-export-pendientes-oc');
    $button.prop('disabled', true).html('<span class="spinner-border spinner-border-sm"></span> Exportando');
    AdminService.exportarPendientesOCMes()
      .then(() => UI.toast('Reporte exportado', 'success'))
      .catch(e => UI.toast(e.message || 'No se pudo exportar el reporte', 'danger'))
      .finally(() => {
        $button.prop('disabled', false).html('<i class="bi bi-file-earmark-excel"></i> Exportar');
      });
  },

  _detalle(value) {
    if (!value) return '';
    try {
      return JSON.stringify(JSON.parse(value));
    } catch (_) {
      return value;
    }
  },

  _esc(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
};
