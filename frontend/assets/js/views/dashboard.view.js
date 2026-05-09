window.DashboardView = {
  render() {
    UI.setTitle('Dashboard');
    $('#view-root').html(`
      <section class="kpi-grid mb-4">
        <article class="card-kpi"><small class="text-muted">Pendientes revisión</small><h3 data-kpi="revision">—</h3></article>
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
              <thead><tr><th>Folio</th><th>Cliente</th><th>Período</th><th class="text-end">Total</th><th>Estado</th></tr></thead>
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
      const rev   = rows.filter(s => ['PENDIENTE OC / HES','EnRevision'].includes(s.estado)).length;
      const emit  = rows.filter(s => ['FACTURA SOLICITADA','FACTURADO','Aprobada','Emitida','Facturada'].includes(s.estado)).length;
      const adic  = rows.filter(s => s.tipo === 'adicional' && !['FACTURADO','Cerrada','Anulada'].includes(s.estado)).length;
      $('[data-kpi=revision]').text(rev);
      $('[data-kpi=emitidas]').text(emit);
      $('[data-kpi=adicionales]').text(adic);
      $('[data-kpi=total]').text(rows.length);

      $('#dash-recientes').html(rows.slice(0,8).map(s => `
        <tr style="cursor:pointer" onclick="location.hash='#/solicitudes/${s.id}'">
          <td><code>${s.folio}</code></td>
          <td>${s.cliente_nombre || ''}</td>
          <td>${s.periodo}</td>
          <td class="text-end">${Format.clp(s.monto_total_clp)}</td>
          <td>${UI.estadoChip(s.estado)}</td>
        </tr>`).join('') || '<tr><td colspan="5" class="text-center text-muted py-3">Sin solicitudes</td></tr>');

      const estadoMap = {};
      rows.forEach(s => { estadoMap[s.estado] = (estadoMap[s.estado]||0) + 1; });
      $('#dash-estados').html(Object.entries(estadoMap).map(([e, n]) =>
        `<div class="d-flex justify-content-between align-items-center mb-2">${UI.estadoChip(e)}<strong>${n}</strong></div>`
      ).join('') || '<em class="text-muted small">Sin datos</em>');
    }).fail(e => UI.error('#dash-recientes', e));
  }
};
