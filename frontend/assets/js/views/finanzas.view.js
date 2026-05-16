window.FinanzasView = {
  _meses: [
    'ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO',
    'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'
  ],

  render(params = {}) {
    const tab = params.tab || 'flujo';
    UI.setTitle('Finanzas y Proyecciones');
    $('#view-root').html(`
      <div class="d-flex gap-2 mb-3">
        <a class="btn btn-sm ${tab === 'flujo' ? 'btn-primary' : 'btn-outline-secondary'}" href="#/finanzas?tab=flujo">
          Flujo de Caja Proyectado
        </a>
        <a class="btn btn-sm ${tab === 'rentabilidad' ? 'btn-primary' : 'btn-outline-secondary'}" href="#/finanzas?tab=rentabilidad">
          Rentabilidad por CP
        </a>
      </div>
      <div id="finanzas-root"></div>
    `);

    if (tab === 'rentabilidad') FinanzasView._rentabilidad();
    else FinanzasView._flujo(params);
  },

  _uf(value) {
    const n = Number(value) || 0;
    return n.toLocaleString('es-CL', { maximumFractionDigits: 2 }) + ' UF';
  },

  _estadoChip(estado) {
    return estado ? UI.estadoChip(estado) : '<span class="badge text-bg-light">SIN ESTADO</span>';
  },

  _tipoChip(tipo) {
    const value = tipo || 'SIN DEFINIR';
    const cls = value === 'AFECTO_IVA' ? 'text-bg-primary'
      : value === 'EXENTO_IVA' ? 'text-bg-info'
      : 'text-bg-secondary';
    return `<span class="badge ${cls}">${value}</span>`;
  },

  _alertasMonto(total) {
    if (!total) return '';
    return `<div class="alert alert-warning py-2 mb-3">
      <i class="bi bi-exclamation-triangle"></i>
      ${total} fila${total === 1 ? '' : 's'} sin monto UF fueron consideradas como 0.
    </div>`;
  },

  _datosIncompletos(rows) {
    if (!rows || !rows.length) return '';
    return `
      <div class="card mt-3">
        <div class="card-header">Datos incompletos</div>
        <div class="table-responsive">
          <table class="table table-sm mb-0 align-middle">
            <thead><tr><th>Cliente</th><th>MS</th><th>Producto</th><th>Mes</th><th>Año</th><th>Tipo impuesto</th><th class="text-end">UF</th></tr></thead>
            <tbody>${rows.map(row => `
              <tr>
                <td>${row.cliente || ''}</td>
                <td><code>${row.ms || row.codigo || ''}</code></td>
                <td>${row.producto || row.nombre || ''}</td>
                <td>${row.mes || '<span class="text-danger">Sin mes</span>'}</td>
                <td>${row.anio || '<span class="text-danger">Sin año</span>'}</td>
                <td>${FinanzasView._tipoChip(row.tipo_impuesto)}</td>
                <td class="text-end">${FinanzasView._uf(row.monto_uf)}</td>
              </tr>`).join('')}</tbody>
          </table>
        </div>
      </div>`;
  },

  _flujo(params = {}) {
    const hoy = new Date();
    const anio = Number(params.anio) || hoy.getFullYear();
    const mes = params.mes || '';
    $('#finanzas-root').html('<div class="text-center text-muted py-4">Cargando flujo proyectado...</div>');
    FinanzasService.flujoCaja({ anio, mes }).then(data => {
      const r = data.resumen || {};
      $('#finanzas-root').html(`
        <div class="d-flex flex-wrap gap-2 align-items-end mb-3">
          <div>
            <label class="form-label mb-1">Año</label>
            <input type="number" class="form-control" id="fin-flujo-anio" value="${anio}" min="2020" max="2100" style="width: 110px">
          </div>
          <div>
            <label class="form-label mb-1">Mes</label>
            <select class="form-select" id="fin-flujo-mes" style="min-width: 180px">
              <option value="">Todo el año</option>
              ${FinanzasView._meses.map((nombre, i) => `<option value="${i + 1}" ${String(mes) === String(i + 1) ? 'selected' : ''}>${nombre}</option>`).join('')}
            </select>
          </div>
          <button class="btn btn-primary" id="fin-flujo-aplicar"><i class="bi bi-search"></i> Filtrar</button>
        </div>
        ${FinanzasView._alertasMonto(r.filas_sin_monto || 0)}
        <div class="row g-3 mb-3">
          ${FinanzasView._card('Total proyectado', FinanzasView._uf(r.total_uf), 'bi-cash-stack')}
          ${FinanzasView._card('Afecto IVA', FinanzasView._uf(r.total_afecto_uf), 'bi-receipt')}
          ${FinanzasView._card('Exento IVA', FinanzasView._uf(r.total_exento_uf), 'bi-receipt-cutoff')}
          ${FinanzasView._card('Facturado', FinanzasView._uf(r.total_facturado_uf), 'bi-check-circle')}
        </div>
        <div class="card">
          <div class="card-header">Flujo de Caja Proyectado</div>
          <div class="table-responsive">
            <table class="table table-sm mb-0 align-middle">
              <thead><tr>
                <th>Año</th><th>Mes</th><th>Tipo impuesto</th><th>Estado</th>
                <th class="text-end">Total UF</th><th class="text-end">Afecto</th><th class="text-end">Exento</th>
                <th class="text-end">Pendiente</th><th class="text-end">Solicitado</th><th class="text-end">Facturado</th><th class="text-end">Pagado</th>
              </tr></thead>
              <tbody>${(data.rows || []).map(row => `
                <tr class="${row.filas_sin_monto ? 'table-warning' : ''}">
                  <td>${row.anio}</td>
                  <td>${String(row.mes).padStart(2, '0')}</td>
                  <td>${FinanzasView._tipoChip(row.tipo_impuesto)}</td>
                  <td>${FinanzasView._estadoChip(row.estado)}</td>
                  <td class="text-end fw-semibold">${FinanzasView._uf(row.total_uf)}</td>
                  <td class="text-end">${FinanzasView._uf(row.total_afecto_uf)}</td>
                  <td class="text-end">${FinanzasView._uf(row.total_exento_uf)}</td>
                  <td class="text-end">${FinanzasView._uf(row.total_pendiente_uf)}</td>
                  <td class="text-end">${FinanzasView._uf(row.total_solicitado_uf)}</td>
                  <td class="text-end">${FinanzasView._uf(row.total_facturado_uf)}</td>
                  <td class="text-end">${FinanzasView._uf(row.total_pagado_uf)}</td>
                </tr>`).join('') || '<tr><td colspan="11" class="text-center text-muted py-3">Sin datos</td></tr>'}</tbody>
            </table>
          </div>
        </div>
        ${FinanzasView._datosIncompletos(data.incompletos || [])}
      `);
      $('#fin-flujo-aplicar').on('click', () => FinanzasView._navegarFlujo());
      $('#fin-flujo-anio, #fin-flujo-mes').on('change', () => FinanzasView._navegarFlujo());
    }).fail(e => UI.error('#finanzas-root', e));
  },

  _navegarFlujo() {
    const filtros = {
      tab: 'flujo',
      anio: $('#fin-flujo-anio').val(),
      mes: $('#fin-flujo-mes').val()
    };
    const qs = $.param(Object.fromEntries(Object.entries(filtros).filter(([, value]) => value)));
    location.hash = '#/finanzas' + (qs ? '?' + qs : '');
  },

  _rentabilidad() {
    $('#finanzas-root').html('<div class="text-center text-muted py-4">Cargando rentabilidad...</div>');
    FinanzasService.rentabilidadCP().then(data => {
      const r = data.resumen || {};
      $('#finanzas-root').html(`
        ${FinanzasView._alertasMonto(r.filas_sin_monto || 0)}
        <div class="row g-3 mb-3">
          ${FinanzasView._card('Total UF', FinanzasView._uf(r.total_uf), 'bi-graph-up-arrow')}
          ${FinanzasView._card('MS / CP', r.total_ms || 0, 'bi-kanban')}
          ${FinanzasView._card('Sin monto UF', r.filas_sin_monto || 0, 'bi-exclamation-triangle')}
        </div>
        <div class="card">
          <div class="card-header">Rentabilidad por Centro de Proyecto / MS</div>
          <div class="table-responsive">
            <table class="table table-sm mb-0 align-middle">
              <thead><tr>
                <th>Cliente</th><th>MS</th><th>Producto</th><th>Tipo CP</th><th>Tipo impuesto</th>
                <th class="text-end">Total UF</th><th class="text-end">Meses</th><th>Meses asociados</th><th>Estado</th>
              </tr></thead>
              <tbody>${(data.rows || []).map(row => `
                <tr class="${row.filas_sin_monto ? 'table-warning' : ''}">
                  <td><strong>${row.cliente || ''}</strong></td>
                  <td><code>${row.ms || ''}</code></td>
                  <td>${row.producto || ''}</td>
                  <td>${row.tipo_cp || ''}</td>
                  <td>${FinanzasView._tipoChip(row.tipo_impuesto)}</td>
                  <td class="text-end fw-semibold">${FinanzasView._uf(row.total_uf)}</td>
                  <td class="text-end">${row.cantidad_meses}</td>
                  <td><small>${row.meses_asociados || ''}</small></td>
                  <td>${FinanzasView._estadoChip(row.estado_general)}</td>
                </tr>`).join('') || '<tr><td colspan="9" class="text-center text-muted py-3">Sin datos</td></tr>'}</tbody>
            </table>
          </div>
        </div>
        ${FinanzasView._datosIncompletos(data.incompletos || [])}
      `);
    }).fail(e => UI.error('#finanzas-root', e));
  },

  _card(label, value, icon) {
    return `
      <div class="col-md-3">
        <div class="card h-100">
          <div class="card-body py-3">
            <div class="d-flex justify-content-between align-items-start">
              <div>
                <div class="text-muted small">${label}</div>
                <div class="fs-5 fw-semibold">${value}</div>
              </div>
              <i class="bi ${icon} text-primary"></i>
            </div>
          </div>
        </div>
      </div>`;
  }
};

