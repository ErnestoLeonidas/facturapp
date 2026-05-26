window.DashboardView = {
  render() {
    UI.setTitle('Dashboard');
    const user = AuthService.user && AuthService.user();
    const nombre = DashboardView._esc((user && (user.nombre || user.username)) || 'usuario');
    const periodoActual = DashboardView._periodoActual();
    const mesActual = DashboardView._nombreMesActual();
    $('#view-root').html(`
      <div class="mb-3">
        <h4 class="mb-1">Hola, ${nombre}</h4>
        <p class="text-muted mb-0">Este es el estado actual de las solicitudes de facturacion.</p>
      </div>
      <section class="kpi-grid mb-4">
        <article class="card-kpi"><small class="text-muted">Pendientes revision ${mesActual}</small><h3 data-kpi="revision">—</h3></article>
        <article class="card-kpi"><small class="text-muted">Aprobadas / Emitidas</small><h3 data-kpi="emitidas">—</h3></article>
        <article class="card-kpi"><small class="text-muted">Adicionales activas</small><h3 data-kpi="adicionales">—</h3></article>
        <article class="card-kpi"><small class="text-muted">Total solicitudes</small><h3 data-kpi="total">—</h3></article>
      </section>
      <div class="row g-3">
        <div class="col-md-8">
          <div class="card">
            <div class="card-header d-flex justify-content-between">
              <span>Solicitudes recientes</span>
              <a href="#/solicitudes" class="btn btn-sm btn-outline-primary">Ver todas</a>
            </div>
            <div class="table-responsive"><table class="table mb-0 align-middle table-hover">
              <thead><tr><th>Cliente</th><th>Período</th><th class="text-end">Total</th><th>Estado</th></tr></thead>
              <tbody id="dash-recientes"></tbody>
            </table></div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card">
            <div class="card-header">Por estado</div>
            <div class="card-body" id="dash-estados"><em class="text-muted small">Cargando…</em></div>
          </div>
        </div>
      </div>
    `);

    SolicitudesService.list({ limit: 10 }).then(data => {
      const rows = Array.isArray(data) ? data : (data.items || data);
      const rowsMes = rows.filter(s => s.periodo === periodoActual);
      const rev   = rowsMes.filter(s => ['PENDIENTE OC / HES','EnRevision'].includes(s.estado)).length;
      const emit  = rows.filter(s => ['FACTURA SOLICITADA','Aprobada','Emitida','Facturada'].includes(s.estado)).length;
      const adic  = rows.filter(s => s.tipo === 'adicional' && !['Cerrada','Anulada'].includes(s.estado)).length;
      $('[data-kpi=revision]').text(rev);
      $('[data-kpi=emitidas]').text(emit);
      $('[data-kpi=adicionales]').text(adic);
      $('[data-kpi=total]').text(rows.length);

      $('#dash-recientes').html(rows.slice(0,8).map(s => `
        <tr style="cursor:pointer" onclick="location.hash='#/solicitudes/${s.id}'">
          <td>${s.cliente_nombre || ''}</td>
          <td>${s.periodo}</td>
          <td class="text-end">${Format.clp(s.monto_total_clp)}</td>
          <td>${UI.estadoChip(s.estado)}</td>
        </tr>`).join('') || '<tr><td colspan="4" class="text-center text-muted py-3">Sin solicitudes</td></tr>');

      const estadoMap = {};
      rows.forEach(s => { estadoMap[s.estado] = (estadoMap[s.estado]||0) + 1; });
      $('#dash-estados').html(Object.entries(estadoMap).map(([e, n]) =>
        `<div class="d-flex justify-content-between align-items-center mb-2">${UI.estadoChip(e)}<strong>${n}</strong></div>`
      ).join('') || '<em class="text-muted small">Sin datos</em>');
    }).fail(e => UI.error('#dash-recientes', e));
  },

  _esc(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  },

  _periodoActual() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  },

  _nombreMesActual() {
    const meses = [
      'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
    ];
    return meses[new Date().getMonth()];
  }
};

