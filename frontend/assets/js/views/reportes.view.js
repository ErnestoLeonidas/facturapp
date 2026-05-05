window.ReportesView = {
  index() {
    UI.setTitle('Reportes');
    $('#view-root').html(`
      <div class="row g-3 mb-3">
        <div class="col-md-4">
          <div class="card"><div class="card-header">Filtros</div><div class="card-body">
            <label class="form-label small">Período desde</label>
            <input class="form-control form-control-sm mb-2" id="rep-desde" placeholder="2026-01">
            <label class="form-label small">Período hasta</label>
            <input class="form-control form-control-sm mb-3" id="rep-hasta" placeholder="2026-12">
            <button class="btn btn-sm btn-primary w-100" id="btn-rep-cargar">Cargar</button>
          </div></div>
        </div>
        <div class="col-md-8">
          <div class="card"><div class="card-header">Gastos por período</div>
            <div class="table-responsive"><table class="table table-sm mb-0 align-middle">
              <thead><tr><th>Período</th><th class="text-end">Neto</th><th class="text-end">IVA</th><th class="text-end">Solicitudes</th></tr></thead>
              <tbody id="tbl-gastos"><tr><td colspan="4" class="text-muted text-center py-3">Presiona "Cargar"</td></tr></tbody>
            </table></div>
          </div>
        </div>
      </div>
      <div class="card">
        <div class="card-header">Por cliente</div>
        <div class="table-responsive"><table class="table table-sm mb-0 align-middle">
          <thead><tr><th>Cliente</th><th class="text-end">Facturado</th><th class="text-end">Recurrente</th><th class="text-end">Adicional</th><th class="text-end">Solicitudes</th><th></th></tr></thead>
          <tbody id="tbl-rep-cli"><tr><td colspan="6" class="text-muted text-center py-3">Presiona "Cargar"</td></tr></tbody>
        </table></div>
      </div>
    `);

    $('#btn-rep-cargar').on('click', () => {
      const desde = $('#rep-desde').val();
      const hasta = $('#rep-hasta').val();

      ReportesService.gastos({ desde, hasta }).then(data => {
        $('#tbl-gastos').html(data.map(g => `
          <tr>
            <td><strong>${g.periodo}</strong></td>
            <td class="text-end">${Format.clp(g.neto)}</td>
            <td class="text-end">${Format.clp(g.iva)}</td>
            <td class="text-end">${g.solicitudes}</td>
          </tr>`).join('') || '<tr><td colspan="4" class="text-muted text-center">Sin datos</td></tr>');
      }).fail(e => UI.error('#tbl-gastos', e));

      ReportesService.clientes({ desde, hasta }).then(data => {
        $('#tbl-rep-cli').html(data.map(c => `
          <tr>
            <td><a href="#/reportes/cliente/${c.id}">${c.nombre_corto}</a></td>
            <td class="text-end">${Format.clp(c.facturado_clp)}</td>
            <td class="text-end">${Format.clp(c.recurrente_clp)}</td>
            <td class="text-end">${Format.clp(c.adicional_clp)}</td>
            <td class="text-end">${c.total_solicitudes}</td>
            <td><a class="btn btn-sm btn-outline-secondary" href="#/reportes/cliente/${c.id}">Detalle</a></td>
          </tr>`).join('') || '<tr><td colspan="6" class="text-muted text-center">Sin datos</td></tr>');
      }).fail(e => UI.error('#tbl-rep-cli', e));
    });
  },

  cliente(params) {
    UI.loading();
    const hoy = new Date().toISOString().slice(0,7);
    ReportesService.cliente(params.id, { periodoDesde: '2025-01', periodoHasta: hoy }).then(data => {
      UI.setTitle('Reporte: ' + (data.cliente ? data.cliente.nombre_corto : params.id));
      const totalNeto = data.serie.reduce((a, s) => a + s.neto, 0);
      $('#view-root').html(`
        <div class="mb-3">
          <h5>${data.cliente ? data.cliente.nombre_corto : params.id}</h5>
          <p class="text-muted">Total facturado: <strong>${Format.clp(totalNeto)}</strong></p>
          <a href="#/clientes/${params.id}" class="btn btn-sm btn-outline-secondary">Ver ficha cliente</a>
        </div>
        <div class="card">
          <div class="card-header">Serie mensual</div>
          <div class="table-responsive"><table class="table table-sm mb-0 align-middle">
            <thead><tr>
              <th>Período</th>
              <th class="text-end">Neto</th><th class="text-end">IVA</th><th class="text-end">Total</th>
              <th class="text-end">Recurrente</th><th class="text-end">Adicional</th>
              <th class="text-end">Solicitudes</th>
            </tr></thead>
            <tbody>
              ${data.serie.map(s => `
                <tr>
                  <td><strong>${s.periodo}</strong></td>
                  <td class="text-end">${Format.clp(s.neto)}</td>
                  <td class="text-end">${Format.clp(s.iva)}</td>
                  <td class="text-end fw-bold">${Format.clp(s.total)}</td>
                  <td class="text-end"><small>${Format.clp(s.recurrente)}</small></td>
                  <td class="text-end"><small>${Format.clp(s.adicional)}</small></td>
                  <td class="text-end">${s.solicitudes}</td>
                </tr>`).join('') || '<tr><td colspan="7" class="text-muted text-center py-3">Sin datos</td></tr>'}
            </tbody>
          </table></div>
        </div>
      `);
    }).fail(e => UI.error('#view-root', e));
  }
};

window.RecurrentesView = {
  list() {
    UI.setTitle('Solicitudes recurrentes (mensuales)');
    $('#view-root').html(`
      <div class="card mb-3"><div class="card-header d-flex justify-content-between">
        <span>Plantillas activas</span>
        <button class="btn btn-sm btn-primary" id="btn-nueva-programada">+ Nueva plantilla</button>
      </div></div>
      <div class="card">
        <div class="table-responsive">
          <table class="table mb-0 align-middle table-hover">
            <thead><tr><th>Nombre</th><th>Cliente</th><th>Frecuencia</th><th>Día emisión</th><th></th></tr></thead>
            <tbody id="tbl-programadas"><tr><td colspan="5" class="text-center py-3"><div class="spinner-border spinner-border-sm"></div></td></tr></tbody>
          </table>
        </div>
      </div>
    `);

    const cargar = () => {
      SolicitudesService.recurrentes().then(data => {
        if (!data.length) { $('#tbl-programadas').html('<tr><td colspan="5" class="text-muted text-center py-3">Sin plantillas</td></tr>'); return; }
        $('#tbl-programadas').html(data.map(p => `
          <tr>
            <td>${p.nombre}</td>
            <td>${p.cliente_nombre||'—'}</td>
            <td>${p.frecuencia}</td>
            <td>Día ${p.dia_emision||'—'}</td>
            <td>
              <button class="btn btn-sm btn-outline-primary" onclick="RecurrentesView._generar('${p.id}')">Generar período</button>
              <button class="btn btn-sm btn-outline-secondary ms-1" onclick="RecurrentesView._editar('${p.id}')">Editar</button>
            </td>
          </tr>`).join(''));
      }).fail(e => UI.error('#tbl-programadas', e));
    };

    cargar();

    $('#btn-nueva-programada').on('click', () => {
      ClientesService.list({ estado: 'Activo' }).then(clientes => {
        const nombre = prompt('Nombre de la plantilla:');
        if (!nombre) return;
        const cliOpts = clientes.map((c, i) => `${i+1}. ${c.nombre_corto}`).join('\n');
        const idx = prompt('Seleccionar cliente:\n' + cliOpts);
        const cliente = clientes[Number(idx)-1];
        if (!cliente) return;
        const dia = Number(prompt('Día de emisión (1-28):', '1'));
        SolicitudesService.recurrenteCrear({ cliente_id: cliente.id, nombre, dia_emision: dia, frecuencia: 'Mensual' })
          .then(() => { UI.toast('Plantilla creada', 'success'); cargar(); })
          .fail(e => UI.toast(e.message, 'danger'));
      });
    });
  },

  _generar(id) {
    const periodo = prompt('Período a generar (YYYY-MM):', new Date().toISOString().slice(0,7));
    if (!periodo) return;
    SolicitudesService.recurrenteGenerar(id, periodo).then(s => {
      UI.toast('Generada: ' + s.folio, 'success');
      location.hash = '#/solicitudes/' + s.id;
    }).fail(e => UI.toast(e.message, 'danger'));
  },

  _editar(id) {
    const dia = Number(prompt('Nuevo día de emisión:'));
    if (!dia) return;
    SolicitudesService.recurrenteEditar(id, { dia_emision: dia })
      .then(() => { UI.toast('Actualizado', 'success'); RecurrentesView.list(); })
      .fail(e => UI.toast(e.message, 'danger'));
  }
};

window.ConfiguracionView = {
  render() {
    UI.setTitle('Configuración e integraciones');
    const hoy = new Date().toISOString().slice(0,10);
    $('#view-root').html(`
      <div class="row g-3">
        <div class="col-md-4">
          <div class="card">
            <div class="card-header">UF</div>
            <div class="card-body">
              <p class="small text-muted">Fuente: mindicador.cl (caché por fecha)</p>
              <div class="input-group input-group-sm mb-2">
                <input class="form-control" type="date" id="uf-test-fecha" value="${hoy}">
                <button class="btn btn-outline-primary" id="btn-test-uf">Consultar</button>
              </div>
              <div id="uf-result"></div>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card">
            <div class="card-header">Google Sheets</div>
            <div class="card-body" id="sheets-estado">
              <em class="text-muted small">Cargando estado…</em>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card">
            <div class="card-header">Plantilla exportación</div>
            <div class="card-body">
              <p><strong>Versión:</strong> ${AppConfig.versionPlantilla}</p>
              <p class="text-muted small">Réplica de "Solicitud de Factura Grupo MAS" — archivo Soprole noviembre 2025.</p>
            </div>
          </div>
        </div>
      </div>
    `);

    IntegracionesService.estadoSheets().then(d => {
      $('#sheets-estado').html(`<p class="small">${d.message || JSON.stringify(d)}</p>
        <button class="btn btn-sm btn-outline-secondary" id="btn-sync">Sincronizar clientes</button>`);
      $('#btn-sync').on('click', () => {
        IntegracionesService.syncSheets('clientes')
          .then(d => UI.toast(d.message || 'Sync OK', 'success'))
          .fail(e => UI.toast(e.message, 'warning'));
      });
    }).fail(() => $('#sheets-estado').html('<small class="text-danger">No disponible</small>'));

    $('#btn-test-uf').on('click', () => {
      const f = $('#uf-test-fecha').val();
      IntegracionesService.uf(f).then(d => {
        $('#uf-result').html(`<span class="badge bg-success">UF ${d.fecha}: $${d.valor.toLocaleString('es-CL')}</span>
          <small class="text-muted d-block">${d.cached ? 'Desde caché' : 'Obtenida ahora'}</small>`);
      }).fail(e => $('#uf-result').html(`<span class="badge bg-danger">${e.message}</span>`));
    });
  }
};

window.ConfiguracionView = {
  render() {
    UI.setTitle('Configuracion e integraciones');
    const hoy = new Date().toISOString().slice(0,10);
    $('#view-root').html(`
      <div class="row g-3">
        <div class="col-md-4">
          <div class="card">
            <div class="card-header">UF</div>
            <div class="card-body">
              <p class="small text-muted">Fuente: mindicador.cl (cache por fecha)</p>
              <div class="input-group input-group-sm mb-2">
                <input class="form-control" type="date" id="uf-test-fecha" value="${hoy}">
                <button class="btn btn-outline-primary" id="btn-test-uf">Consultar</button>
              </div>
              <div id="uf-result"></div>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card">
            <div class="card-header">Google Sheets</div>
            <div class="card-body" id="sheets-estado">
              <em class="text-muted small">Cargando estado...</em>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card">
            <div class="card-header">Google Drive</div>
            <div class="card-body" id="drive-estado">
              <em class="text-muted small">Cargando plantilla...</em>
            </div>
          </div>
        </div>
        <div class="col-12">
          <div class="card">
            <div class="card-header">Bitacora de integraciones</div>
            <div class="card-body p-0">
              <div class="table-responsive">
                <table class="table table-sm mb-0 align-middle">
                  <thead><tr><th>Fecha</th><th>Integracion</th><th>Dataset</th><th>Estado</th><th>Filas</th><th>Mensaje</th></tr></thead>
                  <tbody id="tbl-bitacora"><tr><td colspan="6" class="text-muted text-center py-3">Cargando...</td></tr></tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    `);

    IntegracionesService.estadoSheets().then(d => {
      $('#sheets-estado').html(`
        <p class="small mb-1"><strong>Service Account:</strong> ${d.configured ? 'configurado' : 'pendiente'}</p>
        <p class="small text-muted mb-2">${d.baseFacturacionId}<br>${d.baseFacturacionRange}</p>
        <div class="d-grid gap-1">
          <button class="btn btn-sm btn-outline-primary" id="btn-sync-base">Sync base facturacion</button>
          <button class="btn btn-sm btn-outline-success" id="btn-import-base-excel">Importar Excel base</button>
          <button class="btn btn-sm btn-outline-success" id="btn-import-master-excel">Importar master</button>
          <button class="btn btn-sm btn-outline-secondary" id="btn-sync-proy">Sync proyecciones</button>
        </div>`);
      $('#btn-sync-base').on('click', () => ConfiguracionView._syncSheets('base_facturacion'));
      $('#btn-import-base-excel').on('click', () => ConfiguracionView._importBaseExcel());
      $('#btn-import-master-excel').on('click', () => ConfiguracionView._importMasterExcel());
      $('#btn-sync-proy').on('click', () => ConfiguracionView._syncSheets('proyecciones'));
    }).fail(() => $('#sheets-estado').html('<small class="text-danger">No disponible</small>'));

    IntegracionesService.plantillaDrive().then(d => {
      $('#drive-estado').html(`
        <p class="small mb-1"><strong>${d.name}</strong></p>
        <p class="small text-muted mb-2">${d.modifiedTime || ''}</p>
        <button class="btn btn-sm btn-outline-primary" id="btn-sync-drive">Sincronizar plantilla</button>`);
      $('#btn-sync-drive').on('click', () => {
        IntegracionesService.syncPlantillaDrive()
          .then(d => {
            UI.toast('Plantilla sincronizada', 'success');
            $('#drive-estado').append(`<small class="text-muted d-block mt-2">${d.ruta || 'OK'}</small>`);
            ConfiguracionView._cargarBitacora();
          })
          .fail(e => {
            UI.toast(e.message, 'warning');
            ConfiguracionView._cargarBitacora();
          });
      });
    }).fail(e => $('#drive-estado').html(`<small class="text-warning">${e.message}</small>`));

    ConfiguracionView._cargarBitacora();

    $('#btn-test-uf').on('click', () => {
      const f = $('#uf-test-fecha').val();
      IntegracionesService.uf(f).then(d => {
        $('#uf-result').html(`<span class="badge bg-success">UF ${d.fecha}: $${d.valor.toLocaleString('es-CL')}</span>
          <small class="text-muted d-block">${d.cached ? 'Desde cache' : 'Obtenida ahora'}</small>`);
      }).fail(e => $('#uf-result').html(`<span class="badge bg-danger">${e.message}</span>`));
    });
  },

  _syncSheets(dataset) {
    UI.toast('Sincronizando ' + dataset + '...', 'info');
    IntegracionesService.syncSheets(dataset)
      .then(d => {
        UI.toast(`Sync OK: ${d.filas_procesadas}/${d.filas_leidas} filas`, 'success');
        ConfiguracionView._cargarBitacora();
      })
      .fail(e => {
        UI.toast(e.message, 'warning');
        ConfiguracionView._cargarBitacora();
      });
  },

  _importBaseExcel() {
    UI.toast('Importando Excel base...', 'info');
    IntegracionesService.importBaseExcel('public-google-sheet')
      .then(d => {
        UI.toast(`Import OK: ${d.filas_procesadas}/${d.filas_leidas} filas`, 'success');
        ConfiguracionView._cargarBitacora();
      })
      .fail(e => {
        UI.toast(e.message, 'warning');
        ConfiguracionView._cargarBitacora();
      });
  },

  _importMasterExcel() {
    UI.toast('Importando master...', 'info');
    IntegracionesService.importMasterExcel()
      .then(d => {
        UI.toast(`Master OK: ${d.filas_procesadas}/${d.filas_leidas} filas`, 'success');
        ConfiguracionView._cargarBitacora();
      })
      .fail(e => {
        UI.toast(e.message, 'warning');
        ConfiguracionView._cargarBitacora();
      });
  },

  _cargarBitacora() {
    IntegracionesService.bitacora(20).then(rows => {
      if (!rows.length) {
        $('#tbl-bitacora').html('<tr><td colspan="6" class="text-muted text-center py-3">Sin eventos</td></tr>');
        return;
      }
      $('#tbl-bitacora').html(rows.map(r => `
        <tr>
          <td><small>${r.iniciado_at || ''}</small></td>
          <td>${r.integracion}</td>
          <td>${r.dataset}</td>
          <td><span class="badge ${r.estado === 'OK' ? 'bg-success' : r.estado === 'Error' ? 'bg-danger' : 'bg-secondary'}">${r.estado}</span></td>
          <td>${r.filas_procesadas || 0}/${r.filas_leidas || 0}</td>
          <td><small>${r.mensaje || ''}</small></td>
        </tr>`).join(''));
    }).fail(() => $('#tbl-bitacora').html('<tr><td colspan="6" class="text-danger text-center py-3">No disponible</td></tr>'));
  }
};
