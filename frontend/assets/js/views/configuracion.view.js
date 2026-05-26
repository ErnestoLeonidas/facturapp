window.ConfiguracionView = {
  render() {
    UI.setTitle('Configuración');
    const hoy = new Date().toISOString().slice(0, 10);
    $('#view-root').html(`
      <div class="row g-3">
        <div class="col-lg-6">
          <div class="card h-100">
            <div class="card-header">UF</div>
            <div class="card-body">
              <p class="small text-muted">Fuente: SII con cache local y fallback externo.</p>
              <div class="input-group input-group-sm mb-2">
                <input class="form-control" type="date" id="uf-test-fecha" value="${hoy}">
                <button class="btn btn-outline-primary" id="btn-test-uf">Consultar</button>
              </div>
              <div id="uf-result"></div>
            </div>
          </div>
        </div>
        <div class="col-lg-6">
          <div class="card h-100">
            <div class="card-header">Bot de Slack</div>
            <div class="card-body">
              <div class="d-flex align-items-center gap-2 mb-2">
                <span class="badge bg-secondary">Pendiente</span>
                <span class="small text-muted">Configuración futura</span>
              </div>
              <p class="small text-muted mb-0">
                Este espacio queda reservado para conectar el bot de Slack y sus parámetros operativos.
              </p>
            </div>
          </div>
        </div>
      </div>
    `);

    $('#btn-test-uf').on('click', () => {
      const f = $('#uf-test-fecha').val();
      IntegracionesService.uf(f).then(d => {
        $('#uf-result').html(`<span class="badge bg-success">UF ${d.fecha}: $${d.valor.toLocaleString('es-CL')}</span>
          <small class="text-muted d-block">${d.cached ? 'Desde cache' : 'Obtenida ahora'} - ${d.source || ''}</small>`);
      }).fail(e => $('#uf-result').html(`<span class="badge bg-danger">${e.message}</span>`));
    });
  }
};
