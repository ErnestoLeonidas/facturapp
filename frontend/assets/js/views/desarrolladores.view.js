window.DesarrolladoresView = {
  list() {
    UI.setTitle('Desarrolladores');
    $('#view-root').html(`
      <div class="card mb-3"><div class="card-header d-flex justify-content-between">
        <span>Desarrolladores</span>
        <button class="btn btn-sm btn-primary" id="btn-nuevo-dev">+ Nuevo</button>
      </div></div>
      <div class="card">
        <div class="table-responsive">
          <table class="table mb-0 align-middle table-hover">
            <thead><tr><th>Nombre</th><th>Email</th><th>Equipo</th><th>Estado</th><th></th></tr></thead>
            <tbody id="tbl-devs"><tr><td colspan="5" class="text-center py-3"><div class="spinner-border spinner-border-sm"></div></td></tr></tbody>
          </table>
        </div>
      </div>
    `);

    const cargar = () => {
      Api.get('/desarrolladores').then(devs => {
        $('#tbl-devs').html(devs.map(d => `
          <tr>
            <td>${d.nombre}</td>
            <td>${d.email||'—'}</td>
            <td>${d.equipo||'—'}</td>
            <td><span class="badge ${d.activo?'bg-success':'bg-secondary'}">${d.activo?'Activo':'Inactivo'}</span></td>
            <td><a class="btn btn-sm btn-outline-secondary" href="#/desarrolladores/${d.id}">Ver tiempos</a></td>
          </tr>`).join('') || '<tr><td colspan="5" class="text-muted text-center py-3">Sin desarrolladores</td></tr>');
      }).fail(e => UI.error('#tbl-devs', e));
    };

    cargar();
    $('#btn-nuevo-dev').on('click', () => {
      const nombre = prompt('Nombre:');
      const email = prompt('Email:');
      const equipo = prompt('Equipo (opcional):');
      if (!nombre) return;
      Api.post('/desarrolladores', { nombre, email: email||null, equipo: equipo||null })
        .then(() => { UI.toast('Creado', 'success'); cargar(); })
        .fail(e => UI.toast(e.message, 'danger'));
    });
  },

  detalle(params) {
    UI.loading();
    Api.get('/desarrolladores').then(devs => {
      const dev = devs.find(d => d.id === params.id);
      if (!dev) return UI.error('#view-root', { message: 'Desarrollador no encontrado' });
      UI.setTitle(dev.nombre);

      const hoy = new Date().toISOString().slice(0,10);
      const mesInicio = hoy.slice(0,7) + '-01';

      $('#view-root').html(`
        <div class="row g-3">
          <div class="col-md-4">
            <div class="card">
              <div class="card-header">Perfil</div>
              <div class="card-body">
                <p><strong>${dev.nombre}</strong></p>
                <p class="text-muted">${dev.email||'—'}</p>
                <p>Equipo: ${dev.equipo||'—'}</p>
              </div>
            </div>
          </div>
          <div class="col-md-8">
            <div class="card">
              <div class="card-header d-flex justify-content-between">
                <span>Tiempos registrados</span>
                <button class="btn btn-sm btn-primary" id="btn-reg-tiempo">+ Registrar tiempo</button>
              </div>
              <div id="div-tiempos" class="card-body text-muted">Cargando…</div>
            </div>
          </div>
        </div>
      `);

      const cargarTiempos = () => {
        TiemposService.porDesarrollador(dev.id).then(t => {
          const totalMin = t.reduce((a, x) => a + x.minutos, 0);
          const html = t.length ? `
            <div class="mb-2 text-end text-muted small">Total: <strong>${(totalMin/60).toFixed(1)} h (${totalMin} min)</strong></div>
            <div class="table-responsive"><table class="table table-sm align-middle">
              <thead><tr><th>Fecha</th><th>Solicitud</th><th>Min</th><th>Descripción</th><th>Aprobado</th></tr></thead>
              <tbody>${t.map(x => `
                <tr>
                  <td>${Format.fecha(x.fecha)}</td>
                  <td><a href="#/solicitudes/${x.solicitud_id}"><code>${x.folio||'—'}</code></a> <small>${x.cliente||''}</small></td>
                  <td>${x.minutos}</td>
                  <td>${x.descripcion||'—'}</td>
                  <td>${x.aprobado?'<span class="badge bg-success">Sí</span>':'<span class="badge bg-secondary">No</span>'}</td>
                </tr>`).join('')}
              </tbody>
            </table></div>` : '<em>Sin registros de tiempo</em>';
          $('#div-tiempos').html(html);
        }).fail(e => UI.error('#div-tiempos', e));
      };

      cargarTiempos();

      $('#btn-reg-tiempo').on('click', () => {
        const solicitudId = prompt('ID o folio de la solicitud:');
        if (!solicitudId) return;
        const fecha = prompt('Fecha (YYYY-MM-DD):', hoy);
        const minutos = Number(prompt('Minutos trabajados:'));
        const descripcion = prompt('Descripción:');
        if (!fecha || !minutos || minutos <= 0) return UI.toast('Datos inválidos', 'warning');

        // Buscar solicitud por folio
        SolicitudesService.get(solicitudId).then(sol => {
          TiemposService.registrar(sol.id, { desarrollador_id: dev.id, fecha, minutos, descripcion })
            .then(() => { UI.toast('Tiempo registrado', 'success'); cargarTiempos(); })
            .fail(e => UI.toast(e.message, 'danger'));
        }).fail(() => UI.toast('Solicitud no encontrada', 'danger'));
      });
    }).fail(e => UI.error('#view-root', e));
  }
};
