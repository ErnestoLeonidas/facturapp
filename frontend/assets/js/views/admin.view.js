window.AdminView = {
  render() {
    if (!AuthService.isAdmin()) {
      UI.setTitle('Admin');
      $('#view-root').html('<div class="alert alert-warning">Debes iniciar sesion como admin para acceder.</div>');
      return;
    }

    const anio = new Date().getFullYear();
    UI.setTitle('Admin');
    $('#view-root').html(`
      <div class="row g-3">
        <div class="col-lg-5">
          <div class="card">
            <div class="card-header"><strong>Carga anual de solicitudes</strong></div>
            <div class="card-body">
              <div class="mb-2">
                <label class="form-label">Ruta del Excel en este equipo</label>
                <input class="form-control" id="admin-excel-path" placeholder="C:\\ruta\\proyecciones.xlsx">
              </div>
              <div class="mb-2">
                <label class="form-label">Año</label>
                <input class="form-control" id="admin-anio" type="number" value="${anio}" min="2026" max="2100">
              </div>
              <div class="mb-3">
                <label class="form-label">Hoja</label>
                <input class="form-control" id="admin-sheet" value="1">
              </div>
              <button class="btn btn-primary" id="btn-carga-anual"><i class="bi bi-upload"></i> Cargar solicitudes</button>
              <div class="small text-muted mt-3">
                Se crearán solicitudes reales en estado PENDIENTE OC / HES solo para filas AFECTO_IVA. Usuarios no admin podrán editarlas o eliminarlas.
              </div>
              <div id="admin-carga-resultado" class="mt-3"></div>
            </div>
          </div>

          <div class="card mt-3">
            <div class="card-header"><strong>Usuarios de prueba</strong></div>
            <div class="card-body p-0">
              <table class="table table-sm mb-0">
                <thead><tr><th>Nombre</th><th>Email</th><th>Rol</th></tr></thead>
                <tbody id="admin-users"><tr><td colspan="3" class="text-muted text-center py-3">Cargando...</td></tr></tbody>
              </table>
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
                  <thead><tr><th>Fecha</th><th>Usuario</th><th>Accion</th><th>Entidad</th><th>Detalle</th></tr></thead>
                  <tbody id="admin-audit"><tr><td colspan="5" class="text-muted text-center py-3">Cargando...</td></tr></tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    `);

    $('#btn-carga-anual').on('click', () => AdminView._cargarExcel());
    $('#btn-refresh-audit').on('click', () => AdminView._loadAudit());
    AdminView._loadUsers();
    AdminView._loadAudit();
  },

  _cargarExcel() {
    const payload = {
      path: $('#admin-excel-path').val(),
      anio: Number($('#admin-anio').val()) || new Date().getFullYear(),
      sheet: $('#admin-sheet').val() || 1
    };
    $('#admin-carga-resultado').html('<div class="text-muted small">Procesando...</div>');
    AdminService.cargaAnual(payload).then(result => {
      const stats = result.stats || {};
      $('#admin-carga-resultado').html(`
        <div class="alert alert-success mb-2">
          Carga completada: ${stats.creadas || 0} solicitudes creadas de ${stats.filas_leidas || 0} filas.
        </div>
        ${stats.omitidas && stats.omitidas.length ? `<details class="small"><summary>Filas omitidas (${stats.omitidas.length})</summary><pre class="mt-2 mb-0">${JSON.stringify(stats.omitidas, null, 2)}</pre></details>` : ''}
      `);
      AdminView._loadAudit();
    }).fail(e => {
      $('#admin-carga-resultado').html(`<div class="alert alert-danger">${e.message || 'No se pudo cargar el Excel'}</div>`);
    });
  },

  _loadUsers() {
    AdminService.usuarios().then(rows => {
      $('#admin-users').html(rows.map(u => `
        <tr><td>${u.nombre}</td><td><code>${u.email}</code></td><td>${u.rol}</td></tr>
      `).join(''));
    }).fail(e => $('#admin-users').html(`<tr><td colspan="3" class="text-danger text-center py-3">${e.message || 'No disponible'}</td></tr>`));
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

  _detalle(value) {
    if (!value) return '';
    try {
      const data = JSON.parse(value);
      if (data.path) return `${data.path} · creadas: ${data.creadas || 0}`;
      return JSON.stringify(data);
    } catch (_) {
      return value;
    }
  }
};
