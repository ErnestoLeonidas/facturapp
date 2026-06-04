window.DashboardView = {
  render() {
    UI.setTitle('Dashboard');
    const user = AuthService.user && AuthService.user();
    const nombre = DashboardView._esc(DashboardView._primerNombre((user && (user.nombre || user.username)) || 'usuario'));
    const periodoActual = DashboardView._periodoActual();
    const anioActual = new Date().getFullYear();
    const mesActual = DashboardView._nombreMesActual();

    $('#view-root').html(`
      <section class="dashboard-welcome mb-3">
        <div>
          <h4 class="mb-1">Hola ${nombre} !</h4>
          <p class="text-muted mb-0">Tu tablero de solicitudes esta listo para avanzar.</p>
        </div>
        <a href="#/solicitudes/nueva" class="btn btn-primary btn-sm">
          <i class="bi bi-plus-lg me-1"></i>Nueva solicitud
        </a>
      </section>

      <section class="dashboard-progress mb-3">
        <div class="dashboard-progress-head">
          <div>
            <small class="text-muted">Progreso de solicitudes</small>
            <h5 class="mb-0" id="dash-progress-title">Avance anual ${anioActual}</h5>
          </div>
          <strong id="dash-progress-percent">0%</strong>
        </div>
        <div class="progress dashboard-progress-bar" role="progressbar" aria-label="Progreso de solicitudes" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">
          <div class="progress-bar" id="dash-progress-fill" style="width:0%"></div>
        </div>
        <div class="dashboard-progress-foot">
          <span id="dash-progress-copy">Revisando solicitudes anuales...</span>
          <span id="dash-progress-count">0 de 0</span>
        </div>
      </section>

      <section class="kpi-grid dashboard-kpis mb-4">
        <article class="card-kpi kpi-pending">
          <div class="kpi-icon"><i class="bi bi-hourglass-split"></i></div>
          <small class="text-muted">Pendientes ${mesActual}</small>
          <h3 data-kpi="revision">-</h3>
        </article>
        <article class="card-kpi kpi-ready">
          <div class="kpi-icon"><i class="bi bi-check2-circle"></i></div>
          <small class="text-muted">Gestionadas anual</small>
          <h3 data-kpi="emitidas">-</h3>
        </article>
        <article class="card-kpi kpi-extra">
          <div class="kpi-icon"><i class="bi bi-stars"></i></div>
          <small class="text-muted">Adicionales activas</small>
          <h3 data-kpi="adicionales">-</h3>
        </article>
        <article class="card-kpi kpi-total">
          <div class="kpi-icon"><i class="bi bi-folder2-open"></i></div>
          <small class="text-muted">Total anual</small>
          <h3 data-kpi="total">-</h3>
        </article>
      </section>

      <div class="row g-3">
        <div class="col-lg-6">
          <div class="card dashboard-panel h-100">
            <div class="card-header d-flex justify-content-between align-items-center">
              <span>Solicitudes por cliente</span>
              <small class="text-muted" id="dash-client-count">Anual ${anioActual}</small>
            </div>
            <div class="card-body">
              <div id="dash-clientes-solicitudes" class="dashboard-donut-wrap"></div>
            </div>
          </div>
        </div>
        <div class="col-lg-6">
          <div class="card dashboard-panel h-100">
            <div class="card-header d-flex justify-content-between align-items-center">
              <span>Monto por cliente</span>
              <small class="text-muted">CLP total</small>
            </div>
            <div class="card-body">
              <div id="dash-clientes-montos" class="dashboard-chart-list"></div>
            </div>
          </div>
        </div>
        <div class="col-12">
          <div class="card dashboard-panel">
            <div class="card-header">Por estado</div>
            <div class="card-body" id="dash-estados"><em class="text-muted small">Cargando...</em></div>
          </div>
        </div>
      </div>
    `);

    SolicitudesService.list({ limit: 200 }).then(data => {
      const rows = Array.isArray(data) ? data : (data.items || data);
      const rowsAnio = rows.filter(s => String(s.periodo || '').startsWith(String(anioActual)));
      const rowsMes = rowsAnio.filter(s => s.periodo === periodoActual);
      const rev = rowsMes.filter(s => ['PENDIENTE OC / HES', 'EnRevision'].includes(s.estado)).length;
      const emit = rowsAnio.filter(s => DashboardView._estadosGestionados().includes(s.estado)).length;
      const adic = rowsAnio.filter(s => s.tipo === 'adicional' && !['Cerrada', 'Anulada'].includes(s.estado)).length;

      DashboardView._renderProgreso(rowsAnio, anioActual);
      DashboardView._renderClienteCharts(rowsAnio);
      DashboardView._renderEstados(rowsAnio);
      $('[data-kpi=revision]').text(rev);
      $('[data-kpi=emitidas]').text(emit);
      $('[data-kpi=adicionales]').text(adic);
      $('[data-kpi=total]').text(rowsAnio.length);
    }).fail(e => {
      const msg = DashboardView._esc(e.message || 'No se pudo cargar dashboard');
      $('#dash-clientes-solicitudes').html(`<div class="text-danger small">${msg}</div>`);
      $('#dash-clientes-montos').html(`<div class="text-danger small">${msg}</div>`);
      $('#dash-estados').html(`<div class="text-danger small">${msg}</div>`);
    });
  },

  _renderProgreso(rows, anio) {
    const total = rows.length;
    const listos = rows.filter(s => DashboardView._estadosGestionados().includes(s.estado)).length;
    const porcentaje = total ? Math.round((listos / total) * 100) : 0;
    const copy = total ? DashboardView._mensajeProgreso(porcentaje) : 'Sin solicitudes anuales para medir por ahora.';

    $('#dash-progress-title').text(`Avance anual ${anio}`);
    $('#dash-progress-percent').text(`${porcentaje}%`);
    $('#dash-progress-fill').css('width', `${porcentaje}%`);
    $('.dashboard-progress-bar').attr('aria-valuenow', porcentaje);
    $('#dash-progress-copy').text(copy);
    $('#dash-progress-count').text(`${listos} de ${total} gestionadas`);
  },

  _renderClienteCharts(rows) {
    const porCliente = new Map();
    rows.forEach(row => {
      const cliente = row.cliente_nombre || 'Sin cliente';
      const current = porCliente.get(cliente) || { cliente, cantidad: 0, monto: 0 };
      current.cantidad += 1;
      current.monto += Number(row.monto_total_clp) || 0;
      porCliente.set(cliente, current);
    });

    const data = Array.from(porCliente.values());
    const porCantidad = data.slice().sort((a, b) => b.cantidad - a.cantidad || a.cliente.localeCompare(b.cliente, 'es')).slice(0, 10);
    const porMonto = data.slice().sort((a, b) => b.monto - a.monto || a.cliente.localeCompare(b.cliente, 'es')).slice(0, 10);

    $('#dash-clientes-solicitudes').html(DashboardView._donut(porCantidad));
    $('#dash-clientes-montos').html(DashboardView._bars(
      porMonto,
      'monto',
      item => Format.clp(item.monto)
    ));
  },

  _donut(rows) {
    if (!rows.length) return '<div class="text-center text-muted py-3">Sin datos para graficar.</div>';
    const total = rows.reduce((sum, row) => sum + row.cantidad, 0);
    const colors = [
      'var(--brand-green)',
      'var(--brand-blue)',
      'var(--brand-yellow)',
      'var(--brand-purple)',
      '#14b8a6',
      '#ef4444',
      '#64748b',
      '#f97316',
      '#0ea5e9',
      '#84cc16'
    ];
    let start = 0;
    const segments = rows.map((row, i) => {
      const end = start + (row.cantidad / total) * 100;
      const part = `${colors[i % colors.length]} ${start}% ${end}%`;
      start = end;
      return part;
    }).join(', ');

    return `
      <div class="dashboard-donut-layout">
        <div class="dashboard-donut" style="background: conic-gradient(${segments})">
          <div class="dashboard-donut-hole">
            <strong>${total}</strong>
            <span>solicitudes</span>
          </div>
        </div>
        <div class="dashboard-donut-legend">
          ${rows.map((row, i) => `
            <a class="dashboard-donut-item" href="#/solicitudes">
              <span class="dashboard-donut-swatch" style="background:${colors[i % colors.length]}"></span>
              <span>${DashboardView._esc(row.cliente)}</span>
              <strong>${row.cantidad}</strong>
            </a>
          `).join('')}
        </div>
      </div>
    `;
  },

  _bars(rows, field, formatter) {
    if (!rows.length) return '<div class="text-center text-muted py-3">Sin datos para graficar.</div>';
    const max = Math.max(...rows.map(row => Number(row[field]) || 0), 1);
    return rows.map((row, i) => {
      const value = Number(row[field]) || 0;
      const width = Math.max(3, Math.round((value / max) * 100));
      return `
        <a class="dashboard-bar-row" href="#/solicitudes">
          <div class="dashboard-bar-label">
            <span>${DashboardView._esc(row.cliente)}</span>
            <strong>${DashboardView._esc(formatter(row))}</strong>
          </div>
          <div class="dashboard-bar-track">
            <div class="dashboard-bar-fill dashboard-bar-fill-${(i % 4) + 1}" style="width:${width}%"></div>
          </div>
        </a>
      `;
    }).join('');
  },

  _renderEstados(rows) {
    const estadoMap = {};
    rows.forEach(s => { estadoMap[s.estado] = (estadoMap[s.estado] || 0) + 1; });
    $('#dash-estados').html(Object.entries(estadoMap).map(([e, n]) =>
      `<div class="dashboard-state-row">${UI.estadoChip(e)}<strong>${n}</strong></div>`
    ).join('') || '<em class="text-muted small">Sin datos</em>');
  },

  _estadosGestionados() {
    return ['FACTURA SOLICITADA', 'Aprobada', 'Emitida', 'Facturada', 'Cerrada'];
  },

  _mensajeProgreso(porcentaje) {
    if (porcentaje >= 100) return 'Todo al dia. Excelente cierre.';
    if (porcentaje >= 75) return 'Muy buen ritmo, queda poco por cerrar.';
    if (porcentaje >= 45) return 'Buen avance, sigamos empujando.';
    if (porcentaje > 0) return 'Ya hay movimiento, paso a paso.';
    return 'Aun estamos a tiempo de partir con fuerza.';
  },

  _primerNombre(nombre) {
    return String(nombre || 'usuario').trim().split(/\s+/)[0] || 'usuario';
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
