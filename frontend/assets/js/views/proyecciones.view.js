window.ProyeccionesView = {
  state: {
    tab: 'resumen',
    anio: new Date().getFullYear(),
    grilla: null,
    hiddenGridColumns: new Set(),
    pending: new Map(),
    editCell: null,
    importPayload: null
  },

  render() {
    if (!AuthService.isAdmin()) {
      UI.setTitle('Proyecciones');
      $('#view-root').html('<div class="alert alert-warning">No autorizado. Este modulo es solo para administradores.</div>');
      return;
    }

    document.body.classList.remove('auth-screen');
    UI.setTitle('Proyecciones');
    $('#view-root').html(`
      <div class="proy-tabs mb-3">
        <button class="btn btn-sm ${ProyeccionesView.state.tab === 'resumen' ? 'btn-primary' : 'btn-outline-secondary'}" data-proy-tab="resumen">Resumen</button>
        <button class="btn btn-sm ${ProyeccionesView.state.tab === 'grilla' ? 'btn-primary' : 'btn-outline-secondary'}" data-proy-tab="grilla">Grilla de Proyecciones</button>
        <button class="btn btn-sm ${ProyeccionesView.state.tab === 'versiones' ? 'btn-primary' : 'btn-outline-secondary'}" data-proy-tab="versiones">Versiones</button>
      </div>
      <div id="proy-tab-root"></div>
      ${ProyeccionesView._modalEdicion()}
      ${ProyeccionesView._modalImport()}
    `);

    $('[data-proy-tab]').on('click', function () {
      ProyeccionesView.state.tab = $(this).data('proy-tab');
      ProyeccionesView.state.pending.clear();
      ProyeccionesView.render();
    });

    if (ProyeccionesView.state.tab === 'grilla') ProyeccionesView._renderGrillaShell();
    else if (ProyeccionesView.state.tab === 'versiones') ProyeccionesView._renderVersionesShell();
    else ProyeccionesView._renderResumenShell();
  },

  _renderResumenShell() {
    $('#proy-tab-root').html(`
      <div class="proyecciones-toolbar mb-3">
        <div class="proy-filter-grid">
          <div class="proy-field proy-field-year">
            <label class="form-label">Año</label>
            <input class="form-control" id="proy-anio" type="number" value="${ProyeccionesView.state.anio}" min="2020" max="2100">
          </div>
          <div class="proy-field proy-field-wide">
            <label class="form-label">Cliente</label>
            <select class="form-select" id="proy-cliente"><option value="">Todos</option></select>
          </div>
          <div class="proy-field"><label class="form-label">Producto</label><select class="form-select" id="proy-producto"><option value="">Todos</option></select></div>
          <div class="proy-field"><label class="form-label">Tipo CP</label><select class="form-select" id="proy-tipo-cp"><option value="">Todos</option></select></div>
          <div class="proy-actions">
            <button class="btn btn-outline-secondary" id="btn-proy-recargar"><i class="bi bi-arrow-clockwise"></i> Recargar</button>
          </div>
        </div>
      </div>

      <div class="card mb-3">
        <div class="card-header d-flex justify-content-between align-items-center">
          <strong>Avance anual</strong>
          <span class="small text-muted" id="proy-version-label"></span>
        </div>
        <div class="card-body">
          <div id="proy-meta-chart"></div>
        </div>
      </div>

      <div class="card">
        <div class="card-header d-flex justify-content-between align-items-center"><strong>Vista general resumida</strong><span class="small text-muted" id="proy-total"></span></div>
        <div class="table-responsive proy-table-wrap">
          <table class="table table-sm table-hover align-middle mb-0 proy-summary-table">
            <thead id="proy-table-head"></thead>
            <tbody id="proy-table-body"><tr><td class="text-muted py-3">Cargando...</td></tr></tbody>
          </table>
        </div>
      </div>
    `);
    ProyeccionesView._bindResumen();
    ProyeccionesView._loadResumen();
  },

  _bindResumen() {
    $('#btn-proy-recargar').on('click', () => ProyeccionesView._loadResumen());
    $('#proy-anio,#proy-cliente,#proy-producto,#proy-tipo-cp').on('change', () => ProyeccionesView._loadResumen());
  },

  _loadResumen() {
    ProyeccionesView.state.anio = Number($('#proy-anio').val()) || new Date().getFullYear();
    UI.loading('#proy-table-body');
    AdminService.resumenProyecciones(ProyeccionesView._resumenParams()).then(resumen => {
      const vista = resumen.vista_general || {};
      ProyeccionesView._renderResumenFilters(vista.filtros || {});
      ProyeccionesView._renderMetaChart(resumen);
      ProyeccionesView._renderMonthlySummary(resumen.totales_mensuales || [], resumen);
    }).fail(e => UI.error('#proy-tab-root', e));
  },

  _resumenParams() {
    return {
      anio: Number($('#proy-anio').val()) || ProyeccionesView.state.anio,
      clienteId: $('#proy-cliente').val(),
      producto: $('#proy-producto').val(),
      tipo_cp: $('#proy-tipo-cp').val(),
      limit: 1000
    };
  },

  _renderGrillaShell() {
    $('#proy-tab-root').html(`
      <div class="proyecciones-toolbar mb-3">
        <div class="proy-filter-grid">
          <div class="proy-field proy-field-year"><label class="form-label">Año</label><input class="form-control" id="grid-anio" type="number" value="${ProyeccionesView.state.anio}" min="2020" max="2100"></div>
          <div class="proy-field proy-field-wide"><label class="form-label">Cliente</label><select class="form-select" id="grid-cliente"><option value="">Todos</option></select></div>
          <div class="proy-field"><label class="form-label">Producto</label><select class="form-select" id="grid-producto"><option value="">Todos</option></select></div>
          <div class="proy-field"><label class="form-label">Tipo CP</label><select class="form-select" id="grid-tipo-cp"><option value="">Todos</option></select></div>
          <div class="proy-field"><label class="form-label">IVA</label><select class="form-select" id="grid-iva"><option value="">Todos</option></select></div>
          <div class="proy-field"><label class="form-label">MS</label><select class="form-select" id="grid-ms"><option value="">Todos</option></select></div>
          <div class="proy-actions">
            <button class="btn btn-outline-secondary" id="btn-grid-reload"><i class="bi bi-arrow-clockwise"></i> Recalcular</button>
            <button class="btn btn-primary" id="btn-grid-save"><i class="bi bi-save"></i> Guardar cambios</button>
            <button class="btn btn-outline-primary" id="btn-grid-version"><i class="bi bi-layers"></i> Crear versión</button>
            <button class="btn btn-outline-secondary" id="btn-grid-import"><i class="bi bi-upload"></i> Importar Excel</button>
            <button class="btn btn-outline-primary" id="btn-grid-export"><i class="bi bi-download"></i> Exportar</button>
          </div>
        </div>
      </div>
      <div id="grid-pending"></div>
      <div class="card">
        <div class="card-header d-flex justify-content-between align-items-center gap-2 flex-wrap">
          <strong>Grilla de Proyecciones</strong>
          <div class="d-flex align-items-center gap-2 flex-wrap">
            <button class="btn btn-sm btn-outline-secondary" id="btn-grid-hide-columns"><i class="bi bi-eye-slash"></i> Ocultar</button>
            <button class="btn btn-sm btn-outline-secondary" id="btn-grid-reset-columns"><i class="bi bi-arrow-counterclockwise"></i> Revertir grilla</button>
            <span class="small text-muted" id="grid-total"></span>
          </div>
        </div>
        <div class="proy-grid-scroll-top" id="grid-scroll-top"><div></div></div>
        <div class="table-responsive proy-grid-wrap">
          <table class="table table-sm table-hover align-middle mb-0 proy-grid-table">
            <colgroup id="grid-colgroup"></colgroup>
            <thead id="grid-head"></thead>
            <tbody id="grid-body"><tr><td class="text-muted py-3">Cargando...</td></tr></tbody>
          </table>
        </div>
      </div>
    `);
    $('#grid-anio,#grid-cliente,#grid-producto,#grid-tipo-cp,#grid-iva,#grid-ms').on('change', () => ProyeccionesView._loadGrilla());
    $('#btn-grid-reload').on('click', () => ProyeccionesView._recalcularGrilla());
    $('#btn-grid-save').on('click', () => ProyeccionesView._guardarPendientes());
    $('#btn-grid-version').on('click', () => ProyeccionesView._crearVersion());
    $('#btn-grid-import').on('click', () => ProyeccionesView._openImport({
      source: 'grilla',
      anio: Number($('#grid-anio').val()) || ProyeccionesView.state.anio
    }));
    $('#btn-grid-export').on('click', () => ProyeccionesView._exportarGrilla());
    $('#btn-grid-hide-columns').on('click', () => ProyeccionesView._openColumnModal());
    $('#btn-grid-reset-columns').on('click', () => ProyeccionesView._resetGridColumns());
    ProyeccionesView._loadGrilla();
  },

  _gridParams() {
    return {
      anio: Number($('#grid-anio').val()) || ProyeccionesView.state.anio,
      clienteId: $('#grid-cliente').val(),
      producto: $('#grid-producto').val(),
      tipo_cp: $('#grid-tipo-cp').val(),
      iva: $('#grid-iva').val(),
      ms: $('#grid-ms').val(),
      limit: 500
    };
  },

  _loadGrilla() {
    ProyeccionesView.state.anio = Number($('#grid-anio').val()) || ProyeccionesView.state.anio;
    UI.loading('#grid-body');
    AdminService.grillaProyecciones(ProyeccionesView._gridParams()).then(data => {
      ProyeccionesView.state.grilla = data;
      ProyeccionesView._renderGridFilters(data.filtros || {}, data.version);
      ProyeccionesView._renderGrid(data.items || [], data.total || 0);
      ProyeccionesView._renderPending();
    }).fail(e => UI.error('#proy-tab-root', e));
  },

  _renderGridFilters(filtros, version) {
    ProyeccionesView._fillSelect('#grid-cliente', (filtros.clientes || []).map(c => ({ value: c.cliente_id || c.cliente, label: c.cliente })), 'Todos');
    ProyeccionesView._fillSelect('#grid-producto', (filtros.productos || []).map(v => ({ value: v, label: v })), 'Todos');
    ProyeccionesView._fillSelect('#grid-tipo-cp', (filtros.tiposCp || []).map(v => ({ value: v, label: v })), 'Todos');
    ProyeccionesView._fillSelect('#grid-iva', (filtros.iva || []).map(v => ({ value: v, label: ProyeccionesView._iva(v) })), 'Todos');
    ProyeccionesView._fillSelect('#grid-ms', (filtros.ms || []).map(v => ({ value: v, label: v })), 'Todos');
  },

  _gridColumns() {
    const base = [
      ['iva', 'IVA', 96], ['proyecto', 'PROYECTO', 230], ['ms', 'MS', 92], ['cliente', 'CLIENTE', 180], ['dp', 'DP', 70], ['cp', 'CP', 76],
      ['producto', 'PRODUCTO', 160], ['tipo_cp', 'TIPO DE CP', 190], ['venta', 'VENTA', 118]
    ];
    return base.concat(ProyeccionesView._meses().map((label, index) => [`mes_${index + 1}`, label, 118]))
      .map(([key, label, width]) => ({ key, label, width, hidden: ProyeccionesView.state.hiddenGridColumns.has(key) }));
  },

  _gridColgroup(columns) {
    return columns.map(col => `<col style="width:${col.width}px">`).join('');
  },

  _gridHeaderCell(col) {
    return `<th><div class="proy-col-head"><span>${col.label}</span></div></th>`;
  },

  _gridValueCell(col, item) {
    if (col.key === 'iva') return `<td>${ProyeccionesView._iva(item.iva)}</td>`;
    if (col.key === 'proyecto') return `<td>${ProyeccionesView._esc(item.proyecto)}</td>`;
    if (col.key === 'ms') return `<td><code>${ProyeccionesView._esc(item.ms)}</code></td>`;
    if (col.key === 'cliente') return `<td>${ProyeccionesView._esc(item.cliente)}</td>`;
    if (col.key === 'dp') return `<td>${ProyeccionesView._esc(item.dp)}</td>`;
    if (col.key === 'cp') return `<td>${ProyeccionesView._esc(item.cp)}</td>`;
    if (col.key === 'producto') return `<td>${ProyeccionesView._esc(item.producto)}</td>`;
    if (col.key === 'tipo_cp') return `<td>${ProyeccionesView._esc(item.tipo_cp)}</td>`;
    if (col.key === 'venta') return `<td class="text-end">${ProyeccionesView._clp(item.venta)}</td>`;
    const mes = Number(col.key.replace('mes_', ''));
    return ProyeccionesView._gridCell(item, item.meses[mes - 1], mes, col.hidden);
  },

  _gridTotalCell(col, totals) {
    if (col.key === 'iva') return '<td>Totales</td>';
    if (['proyecto', 'ms', 'cliente', 'dp', 'cp', 'producto', 'tipo_cp'].includes(col.key)) return '<td></td>';
    if (col.key === 'venta') return `<td class="text-end">${ProyeccionesView._clp(totals.venta)}</td>`;
    const mes = Number(col.key.replace('mes_', ''));
    return `<td class="text-end">${ProyeccionesView._clp(totals.meses[mes - 1])}</td>`;
  },

  _renderGrid(items, total) {
    const columns = ProyeccionesView._gridColumns().filter(col => !col.hidden);
    $('#grid-total').text(`${total} filas - ${ProyeccionesView.state.grilla?.version?.nombre || ''}`);
    $('#grid-colgroup').html(ProyeccionesView._gridColgroup(columns));
    $('#grid-head').html(`<tr>${columns.map(col => ProyeccionesView._gridHeaderCell(col)).join('')}</tr>`);
    if (!columns.length) {
      $('#grid-body').html('<tr><td class="text-muted text-center py-3">Sin columnas visibles</td></tr>');
      ProyeccionesView._syncGridScrollbars();
      return;
    }
    const totals = items.reduce((acc, item) => {
      acc.venta += Number(item.venta || 0);
      Array.from({ length: 12 }, (_, i) => item.meses[i]).forEach((cell, index) => {
        acc.meses[index] += Number(cell?.monto_clp || 0);
      });
      return acc;
    }, { venta: 0, meses: Array(12).fill(0) });
    const totalRow = items.length ? `<tr class="table-light fw-semibold proy-grid-total-row">${columns.map(col => ProyeccionesView._gridTotalCell(col, totals)).join('')}</tr>` : '';
    $('#grid-body').html(items.map(item => `<tr>${columns.map(col => ProyeccionesView._gridValueCell(col, item)).join('')}</tr>`).join('') + totalRow || `<tr><td colspan="${Math.max(columns.length, 1)}" class="text-muted text-center py-3">Sin proyecciones</td></tr>`);
    $('.proy-month-cell').on('click', function () {
      const id = $(this).data('id');
      if (!id) return;
      ProyeccionesView._openEdit(id);
    });
    ProyeccionesView._syncGridScrollbars();
  },

  _openColumnModal() {
    const columns = ProyeccionesView._gridColumns();
    $('#proy-columns-modal').remove();
    $('body').append(`
      <div class="modal fade" id="proy-columns-modal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-dialog-scrollable">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Ocultar</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
            </div>
            <div class="modal-body">
              <div class="form-check mb-2 pb-2 border-bottom">
                <input class="form-check-input" type="checkbox" id="grid-cols-select-all">
                <label class="form-check-label fw-semibold" for="grid-cols-select-all">Seleccionar todo</label>
              </div>
              <div class="proy-column-list">
                ${columns.map(col => `
                  <div class="form-check">
                    <input class="form-check-input grid-column-check" type="checkbox" id="grid-col-${ProyeccionesView._esc(col.key)}" value="${ProyeccionesView._esc(col.key)}" ${col.hidden ? '' : 'checked'}>
                    <label class="form-check-label" for="grid-col-${ProyeccionesView._esc(col.key)}">${ProyeccionesView._esc(col.label)}</label>
                  </div>
                `).join('')}
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Cancelar</button>
              <button type="button" class="btn btn-primary" id="btn-grid-apply-columns">Aplicar</button>
            </div>
          </div>
        </div>
      </div>
    `);

    const syncSelectAll = () => {
      const checks = $('.grid-column-check');
      const checked = $('.grid-column-check:checked').length;
      $('#grid-cols-select-all').prop('checked', checked === checks.length).prop('indeterminate', checked > 0 && checked < checks.length);
    };
    syncSelectAll();
    $('#grid-cols-select-all').on('change', function () {
      $('.grid-column-check').prop('checked', $(this).is(':checked'));
      syncSelectAll();
    });
    $('.grid-column-check').on('change', syncSelectAll);
    $('#btn-grid-apply-columns').on('click', () => {
      const visible = new Set($('.grid-column-check:checked').map((_, el) => el.value).get());
      ProyeccionesView.state.hiddenGridColumns = new Set(columns.filter(col => !visible.has(col.key)).map(col => col.key));
      bootstrap.Modal.getInstance($('#proy-columns-modal')[0]).hide();
      ProyeccionesView._renderGrid(ProyeccionesView.state.grilla.items || [], ProyeccionesView.state.grilla.total || 0);
    });
    $('#proy-columns-modal').on('hidden.bs.modal', function () { $(this).remove(); });
    new bootstrap.Modal($('#proy-columns-modal')[0]).show();
  },

  _resetGridColumns() {
    ProyeccionesView.state.hiddenGridColumns.clear();
    ProyeccionesView._renderGrid(ProyeccionesView.state.grilla?.items || [], ProyeccionesView.state.grilla?.total || 0);
  },

  _syncGridScrollbars() {
    const top = document.getElementById('grid-scroll-top');
    const wrap = document.querySelector('.proy-grid-wrap');
    const table = document.querySelector('.proy-grid-table');
    if (!top || !wrap || !table || !top.firstElementChild) return;
    top.firstElementChild.style.width = `${table.scrollWidth}px`;
    top.onscroll = () => { if (wrap.scrollLeft !== top.scrollLeft) wrap.scrollLeft = top.scrollLeft; };
    wrap.onscroll = () => { if (top.scrollLeft !== wrap.scrollLeft) top.scrollLeft = wrap.scrollLeft; };
  },

  _gridCell(item, cell, mes) {
    const value = cell && cell.monto_clp != null ? ProyeccionesView._clp(cell.monto_clp) : '';
    const mode = cell ? cell.modo_calculo : 'SIN_DATOS';
    const title = cell ? [
      `Modo: ${mode}`,
      `UF usada: ${cell.submodo_uf || mode}`,
      `Cantidad UF: ${cell.cantidad_uf || ''}`,
      `Monto CLP: ${ProyeccionesView._clp(cell.monto_clp) || ''}`,
      `Obs: ${cell.observacion || ''}`
    ].join('\n') : 'Sin datos';
    const pending = cell && ProyeccionesView.state.pending.has(cell.id) ? ' is-pending' : '';
    return `<td class="text-end proy-month-cell mode-${mode}${pending}" data-id="${cell ? cell.id : ''}" data-mes="${mes}" title="${ProyeccionesView._esc(title)}">${value || '<span class="text-muted">-</span>'}</td>`;
  },

  _openEdit(id) {
    const item = (ProyeccionesView.state.grilla.items || []).find(row => (row.meses || []).some(m => m && m.id === id));
    const cell = item && item.meses.find(m => m && m.id === id);
    if (!item || !cell) return;
    const pending = ProyeccionesView.state.pending.get(id);
    const data = pending ? { ...cell, ...pending.payload } : cell;
    ProyeccionesView.state.editCell = { item, cell };
    $('#edit-title').text(`${item.cliente || ''} · ${item.ms || ''} · ${ProyeccionesView._meses()[cell.mes - 1]}`);
    $('#edit-context').html(`
      <div><strong>Cliente:</strong> ${ProyeccionesView._esc(item.cliente)}</div>
      <div><strong>Proyecto:</strong> ${ProyeccionesView._esc(item.proyecto)}</div>
      <div><strong>MS:</strong> ${ProyeccionesView._esc(item.ms)}</div>
      <div><strong>Producto:</strong> ${ProyeccionesView._esc(item.producto)}</div>
      <div><strong>Tipo CP:</strong> ${ProyeccionesView._esc(item.tipo_cp)}</div>
      <div><strong>Mes/Año:</strong> ${ProyeccionesView._meses()[cell.mes - 1]} ${ProyeccionesView.state.grilla.version.anio}</div>
      <div><strong>IVA:</strong> ${ProyeccionesView._iva(item.iva)}</div>
    `);
    $('#edit-cantidad-uf').val(data.cantidad_uf || '');
    $('#edit-uf-proyectada').val(data.uf_proyectada || '');
    $('#edit-clp-manual').val(ProyeccionesView._roundInput(data.monto_clp_manual ?? data.monto_clp));
    $('#edit-observacion').val(data.observacion || '');
    ProyeccionesView._refreshEditCalc();
    $('.proy-edit-input').off('input change').on('input change', () => ProyeccionesView._refreshEditCalc());
    $('#btn-edit-project-uf').off('click').on('click', () => ProyeccionesView._projectUfEdit());
    new bootstrap.Modal($('#proy-edit-modal')[0]).show();
  },

  _refreshEditCalc() {
    const data = ProyeccionesView._editPayload();
    $('#edit-clp-calculado').val(ProyeccionesView._clp(ProyeccionesView._projectUfValue(data)));
  },

  _editPayload() {
    return {
      modo_calculo: 'MANUAL_CLP',
      submodo_uf: null,
      cantidad_uf: $('#edit-cantidad-uf').val(),
      uf_fija: '',
      uf_proyectada: $('#edit-uf-proyectada').val(),
      uf_manual: '',
      monto_clp_manual: $('#edit-clp-manual').val(),
      observacion: $('#edit-observacion').val()
    };
  },

  _projectUfEdit() {
    const projected = ProyeccionesView._projectUfValue(ProyeccionesView._editPayload());
    if (projected != null) $('#edit-clp-manual').val(projected);
    ProyeccionesView._refreshEditCalc();
  },

  _projectUfValue(data) {
    const n = v => v === '' || v == null ? null : Number(v);
    return n(data.cantidad_uf) != null && n(data.uf_proyectada) != null ? Math.round(n(data.cantidad_uf) * n(data.uf_proyectada)) : null;
  },

  _calcPayload(data) {
    const n = v => v === '' || v == null ? null : Number(v);
    const manual = n(data.monto_clp_manual);
    return manual == null ? ProyeccionesView._projectUfValue(data) : Math.round(manual);
  },

  _applyEditPending() {
    const current = ProyeccionesView.state.editCell;
    if (!current) return;
    const payload = ProyeccionesView._editPayload();
    const nuevo = ProyeccionesView._calcPayload(payload);
    ProyeccionesView.state.pending.set(current.cell.id, {
      id: current.cell.id,
      item: current.item,
      cell: current.cell,
      payload,
      nuevo
    });
    bootstrap.Modal.getInstance($('#proy-edit-modal')[0]).hide();
    ProyeccionesView._renderGrid(ProyeccionesView.state.grilla.items, ProyeccionesView.state.grilla.total);
    ProyeccionesView._renderPending();
  },

  _renderPending() {
    const rows = Array.from(ProyeccionesView.state.pending.values());
    if (!rows.length) {
      $('#grid-pending').empty();
      return;
    }
    $('#grid-pending').html(`
      <div class="card mb-3 border-warning">
        <div class="card-header d-flex justify-content-between align-items-center"><strong>Cambios pendientes</strong><button class="btn btn-sm btn-outline-secondary" id="btn-grid-discard">Descartar</button></div>
        <div class="table-responsive">
          <table class="table table-sm mb-0">
            <thead><tr><th>Cliente</th><th>MS</th><th>Mes</th><th>Valor anterior</th><th>Valor nuevo</th><th>Modo</th><th>Acción</th></tr></thead>
            <tbody>${rows.map(row => `<tr><td>${ProyeccionesView._esc(row.item.cliente)}</td><td>${ProyeccionesView._esc(row.item.ms)}</td><td>${ProyeccionesView._meses()[row.cell.mes - 1]}</td><td>${ProyeccionesView._clp(row.cell.monto_clp)}</td><td>${ProyeccionesView._clp(row.nuevo)}</td><td>Proyectar UF</td><td>Actualizar</td></tr>`).join('')}</tbody>
          </table>
        </div>
      </div>
    `);
    $('#btn-grid-discard').on('click', () => {
      ProyeccionesView.state.pending.clear();
      ProyeccionesView._renderGrid(ProyeccionesView.state.grilla.items, ProyeccionesView.state.grilla.total);
      ProyeccionesView._renderPending();
    });
  },

  _guardarPendientes() {
    const rows = Array.from(ProyeccionesView.state.pending.values());
    if (!rows.length) return UI.toast('No hay cambios pendientes', 'info');
    Promise.all(rows.map(row => AdminService.actualizarMensualProyeccion(row.id, row.payload)))
      .then(() => {
        ProyeccionesView.state.pending.clear();
        UI.toast('Cambios guardados', 'success');
        ProyeccionesView._loadGrilla();
      })
      .catch(e => UI.toast(e.message || 'No se pudieron guardar los cambios', 'danger'));
  },

  _exportarGrilla() {
    const params = ProyeccionesView._gridParams();
    const $button = $('#btn-grid-export');
    $button.prop('disabled', true).html('<span class="spinner-border spinner-border-sm"></span> Exportando');
    AdminService.exportarProyecciones(params)
      .then(() => UI.toast('Grilla exportada', 'success'))
      .catch(e => UI.toast(e.message || 'No se pudo exportar la grilla', 'danger'))
      .finally(() => {
        $button.prop('disabled', false).html('<i class="bi bi-download"></i> Exportar');
      });
  },

  _recalcularGrilla() {
    const payload = ProyeccionesView._gridParams();
    AdminService.recalcularProyecciones(payload).then(preview => {
      if (!confirm(`${preview.recalculadas} celdas recalculadas\n${preview.manuales_respetadas} manuales respetadas\n${preview.advertencias} advertencias\n\nAplicar recalculo?`)) return;
      return AdminService.recalcularProyecciones({ ...payload, confirm: true }).then(() => {
        UI.toast('Recalculo aplicado', 'success');
        ProyeccionesView._loadGrilla();
      });
    }).catch(e => UI.toast(e.message || 'No se pudo recalcular', 'danger'));
  },

  _crearVersion() {
    const anio = Number($('#grid-anio').val()) || ProyeccionesView.state.anio;
    AdminService.crearVersionProyecciones({ anio })
      .then(() => { UI.toast('Version creada', 'success'); ProyeccionesView._loadGrilla(); })
      .fail(e => UI.toast(e.message || 'No se pudo crear versión', 'danger'));
  },

  _renderVersionesShell() {
    $('#proy-tab-root').html(`
      <div class="proyecciones-toolbar mb-3">
        <div class="proy-filter-grid">
          <div class="proy-field proy-field-year"><label class="form-label">Año</label><input class="form-control" id="ver-anio" type="number" value="${ProyeccionesView.state.anio}" min="2020" max="2100"></div>
          <div class="proy-actions">
            <button class="btn btn-outline-secondary" id="btn-ver-reload"><i class="bi bi-arrow-clockwise"></i> Recargar</button>
            <button class="btn btn-primary" id="btn-ver-create"><i class="bi bi-layers"></i> Crear versión</button>
            <button class="btn btn-outline-secondary" id="btn-ver-import"><i class="bi bi-upload"></i> Subir Excel</button>
          </div>
        </div>
      </div>
      <div class="card"><div class="card-header"><strong>Versiones</strong></div><div class="table-responsive"><table class="table table-sm align-middle mb-0"><thead><tr><th>Número</th><th>Nombre</th><th>Año</th><th>Estado</th><th>Origen</th><th>Items</th><th class="text-end">Acciones</th></tr></thead><tbody id="ver-body"></tbody></table></div></div>
    `);
    $('#ver-anio').on('change', () => ProyeccionesView._loadVersiones());
    $('#btn-ver-reload').on('click', () => ProyeccionesView._loadVersiones());
    $('#btn-ver-create').on('click', () => AdminService.crearVersionProyecciones({ anio: Number($('#ver-anio').val()) || ProyeccionesView.state.anio }).then(() => ProyeccionesView._loadVersiones()));
    $('#btn-ver-import').on('click', () => ProyeccionesView._openImport({
      source: 'versiones',
      anio: Number($('#ver-anio').val()) || ProyeccionesView.state.anio
    }));
    ProyeccionesView._loadVersiones();
  },

  _loadVersiones() {
    const anio = Number($('#ver-anio').val()) || ProyeccionesView.state.anio;
    AdminService.versionesProyecciones({ anio }).then(rows => {
      $('#ver-body').html(rows.map(v => `
        <tr>
          <td>${v.numero}</td><td>${ProyeccionesView._esc(v.nombre)}</td><td>${v.anio}</td>
          <td>${v.activa ? '<span class="badge text-bg-success">Activa</span>' : '<span class="badge text-bg-secondary">Inactiva</span>'}</td>
          <td>${ProyeccionesView._esc(v.origen)}</td><td>${v.items || 0}</td>
          <td class="text-end">
            <button class="btn btn-sm btn-outline-primary btn-ver-view" data-id="${v.id}">Ver</button>
            <button class="btn btn-sm btn-outline-success btn-ver-active" data-id="${v.id}" ${v.activa ? 'disabled' : ''}>Activar</button>
            <button class="btn btn-sm btn-outline-secondary btn-ver-dup" data-id="${v.id}">Duplicar</button>
            <button class="btn btn-sm btn-outline-secondary btn-ver-rename" data-id="${v.id}" data-name="${ProyeccionesView._esc(v.nombre)}">Renombrar</button>
            <button class="btn btn-sm btn-outline-secondary" disabled>Comparar</button>
            <button class="btn btn-sm btn-outline-secondary" disabled>Exportar</button>
          </td>
        </tr>
      `).join('') || '<tr><td colspan="7" class="text-muted text-center py-3">Sin versiones</td></tr>');
      $('.btn-ver-view').on('click', function () { ProyeccionesView.state.tab = 'grilla'; ProyeccionesView.render(); });
      $('.btn-ver-active').on('click', function () { AdminService.activarVersionProyecciones($(this).data('id')).then(() => ProyeccionesView._loadVersiones()); });
      $('.btn-ver-dup').on('click', function () { AdminService.duplicarVersionProyecciones($(this).data('id')).then(() => ProyeccionesView._loadVersiones()); });
      $('.btn-ver-rename').on('click', function () {
        const nombre = prompt('Nuevo nombre:', $(this).data('name'));
        if (nombre) AdminService.renombrarVersionProyecciones($(this).data('id'), { nombre }).then(() => ProyeccionesView._loadVersiones());
      });
    });
  },

  _modalEdicion() {
    return `
      <div class="modal fade" id="proy-edit-modal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-lg modal-dialog-centered"><div class="modal-content">
          <div class="modal-header"><h5 class="modal-title" id="edit-title">Editar proyección</h5><button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button></div>
          <div class="modal-body">
            <div class="row g-3">
              <div class="col-md-5"><div class="small" id="edit-context"></div></div>
              <div class="col-md-7">
                <div class="row g-2">
                  <div class="col-md-4"><label class="form-label">Cantidad UF</label><input class="form-control proy-edit-input" id="edit-cantidad-uf" type="number" step="0.01"></div>
                  <div class="col-md-4"><label class="form-label">UF proyectada</label><input class="form-control proy-edit-input" id="edit-uf-proyectada" type="number" step="0.01"></div>
                  <div class="col-md-4 d-flex align-items-end"><button class="btn btn-outline-primary w-100" id="btn-edit-project-uf" type="button"><i class="bi bi-graph-up-arrow"></i> Proyectar UF</button></div>
                  <div class="col-md-6"><label class="form-label">Valor CLP</label><input class="form-control proy-edit-input" id="edit-clp-manual" type="number" step="1"></div>
                  <div class="col-md-6"><label class="form-label">Resultado proyectado</label><input class="form-control" id="edit-clp-calculado" readonly></div>
                  <div class="col-12"><label class="form-label">Observación</label><textarea class="form-control proy-edit-input" id="edit-observacion" rows="2"></textarea></div>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer"><button class="btn btn-outline-secondary" data-bs-dismiss="modal">Cancelar</button><button class="btn btn-primary" id="btn-edit-apply" type="button">Aplicar cambio</button></div>
        </div></div>
      </div>
    `;
  },

  _modalImport() {
    return `
      <div class="modal fade" id="proy-import-modal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-lg modal-dialog-centered"><div class="modal-content">
          <div class="modal-header"><h5 class="modal-title">Subir Excel de proyecciones</h5><button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button></div>
          <div class="modal-body">
            <div class="row g-2">
              <div class="col-md-6"><label class="form-label">Archivo Excel</label><input class="form-control" id="proy-import-file" type="file" accept=".xlsx,.xls"></div>
              <div class="col-md-3"><label class="form-label">Año</label><input class="form-control" id="proy-import-anio" type="number" value="${ProyeccionesView.state.anio}"></div>
              <div class="col-md-3"><label class="form-label">Hoja</label><input class="form-control" id="proy-import-sheet" placeholder="Venta Plataformas 2026"></div>
            </div>
            <div id="proy-import-result" class="mt-3"></div>
          </div>
          <div class="modal-footer"><button class="btn btn-outline-secondary" data-bs-dismiss="modal">Cerrar</button><button class="btn btn-outline-primary" id="btn-proy-preview-import">Previsualizar</button><button class="btn btn-primary" id="btn-proy-confirm-import" disabled>Confirmar y crear versión</button></div>
        </div></div>
      </div>
    `;
  },

  _openImport(options = {}) {
    ProyeccionesView.state.importPayload = null;
    ProyeccionesView.state.importSource = options.source || ProyeccionesView.state.tab;
    const anio = Number(options.anio) || ProyeccionesView.state.anio || new Date().getFullYear();
    $('#proy-import-anio').val(anio);
    $('#proy-import-file').val('');
    $('#proy-import-sheet').val('');
    $('#proy-import-result').empty();
    $('#btn-proy-preview-import').prop('disabled', false).html('Previsualizar');
    $('#btn-proy-confirm-import').prop('disabled', true);
    $('#btn-proy-preview-import').off('click').on('click', () => ProyeccionesView._previewImport());
    $('#btn-proy-confirm-import').off('click').on('click', () => ProyeccionesView._confirmImport());
    new bootstrap.Modal($('#proy-import-modal')[0]).show();
  },

  _previewImport() {
    const file = document.getElementById('proy-import-file').files[0];
    if (!file) return $('#proy-import-result').html('<div class="alert alert-warning">Selecciona un archivo Excel.</div>');
    $('#btn-proy-preview-import').prop('disabled', true).html('<span class="spinner-border spinner-border-sm"></span> Leyendo');
    $('#btn-proy-confirm-import').prop('disabled', true);
    $('#proy-import-result').html('<div class="text-muted small">Leyendo archivo...</div>');
    ProyeccionesView._fileToBase64(file).then(fileBase64 => {
      ProyeccionesView.state.importPayload = { fileBase64, fileName: file.name, anio: Number($('#proy-import-anio').val()) || ProyeccionesView.state.anio, sheet: $('#proy-import-sheet').val() };
      return AdminService.previewImportProyecciones(ProyeccionesView.state.importPayload);
    }).then(result => {
      const cambios = result.resumen_cambios || {};
      const hasChanges = Number(cambios.total_cambios || 0) > 0;
      $('#btn-proy-confirm-import').prop('disabled', !hasChanges);
      const version = result.version ? `<strong>${ProyeccionesView._esc(result.version.nombre)}</strong>` : 'nueva versión';
      const omitidas = (result.omitidas || []).length;
      const message = cambios.sin_cambios
        ? `<div class="alert alert-success mb-3">El Excel contiene lo mismo que se visualiza actualmente en la versión activa. No hay cambios para aplicar.</div>`
        : `<div class="alert alert-info mb-3">Se detectaron ${ProyeccionesView._num(cambios.total_cambios || 0)} cambios: ${ProyeccionesView._num(cambios.filas_nuevas || 0)} filas nuevas, ${ProyeccionesView._num(cambios.filas_actualizadas || 0)} filas con cambios y ${ProyeccionesView._num(cambios.celdas_actualizadas || 0)} columnas/meses a actualizar.</div>`;
      const rows = (result.preview || []).map(row => `
        <tr>
          <td>${ProyeccionesView._esc(row.accion || '')}</td>
          <td class="text-end">${ProyeccionesView._esc(row.orden_fila || '')}</td>
          <td>${ProyeccionesView._esc(row.cliente || '')}</td>
          <td>${ProyeccionesView._esc(row.ms || '')}</td>
          <td>${ProyeccionesView._esc(row.proyecto || '')}</td>
          <td>${ProyeccionesView._esc(row.columna || '')}</td>
          <td class="text-end">${row.valor_excel == null ? '' : ProyeccionesView._clp(row.valor_excel)}</td>
          <td class="text-end">${row.valor_actual == null ? '' : ProyeccionesView._clp(row.valor_actual)}</td>
          <td>${ProyeccionesView._esc(row.motivo || '')}</td>
        </tr>
      `).join('');
      const previewVersion = result.version ? version : 'nueva versión';
      $('#proy-import-result').html(`
        ${message}
        <div class="small text-muted mb-2">Preview: ${result.total_items} filas válidas para ${previewVersion}. ${omitidas} filas omitidas.</div>
        <div class="table-responsive proy-preview-table">
          <table class="table table-sm align-middle">
            <thead><tr><th>Acción</th><th class="text-end">Orden fila</th><th>Cliente</th><th>MS</th><th>Proyecto</th><th>Columna/Mes</th><th class="text-end">Valor Excel</th><th class="text-end">Valor actual</th><th>Motivo</th></tr></thead>
            <tbody>${rows || '<tr><td colspan="9" class="text-muted">No hay filas válidas para importar.</td></tr>'}</tbody>
          </table>
        </div>
      `);
    }).catch(e => $('#proy-import-result').html(`<div class="alert alert-danger">${e.message || 'No se pudo previsualizar'}</div>`))
      .finally(() => $('#btn-proy-preview-import').prop('disabled', false).html('Previsualizar'));
  },

  _confirmImport() {
    if (!ProyeccionesView.state.importPayload) return;
    let imported = false;
    $('#btn-proy-confirm-import').prop('disabled', true).html('<span class="spinner-border spinner-border-sm"></span> Importando');
    AdminService.confirmarImportProyecciones(ProyeccionesView.state.importPayload).then(result => {
      imported = true;
      $('#proy-import-result').html(`<div class="alert alert-success">Versión creada: ${ProyeccionesView._esc(result.version.nombre)}</div>`);
      ProyeccionesView.state.anio = Number(result.version.anio) || ProyeccionesView.state.importPayload.anio || ProyeccionesView.state.anio;
      ProyeccionesView.state.importPayload = null;
      if (ProyeccionesView.state.importSource === 'versiones') {
        $('#ver-anio').val(ProyeccionesView.state.anio);
        ProyeccionesView._loadVersiones();
      } else if (ProyeccionesView.state.importSource === 'grilla') {
        $('#grid-anio').val(ProyeccionesView.state.anio);
        ProyeccionesView._loadGrilla();
      }
    }).fail(e => $('#proy-import-result').html(`<div class="alert alert-danger">${e.message || 'No se pudo importar'}</div>`))
      .always(() => $('#btn-proy-confirm-import').prop('disabled', imported || !ProyeccionesView.state.importPayload).html('Confirmar y crear versión'));
  },

  _renderResumenFilters(filtros) {
    ProyeccionesView._fillSelect('#proy-cliente', (filtros.clientes || []).map(c => ({ value: c.cliente_id || c.cliente, label: c.cliente })), 'Todos');
    ProyeccionesView._fillSelect('#proy-producto', (filtros.productos || []).map(v => ({ value: v, label: v })), 'Todos');
    ProyeccionesView._fillSelect('#proy-tipo-cp', (filtros.tiposCp || []).map(v => ({ value: v, label: v })), 'Todos');
  },

  _fillSelect(selector, options, placeholder) {
    const current = $(selector).val();
    $(selector).html(`<option value="">${placeholder}</option>` + options.map(opt => `<option value="${ProyeccionesView._esc(opt.value)}">${ProyeccionesView._esc(opt.label)}</option>`).join(''));
    if (current) $(selector).val(current);
  },

  _renderMetaChart(resumen) {
    const total = Number(resumen.total_clp || 0);
    const meta = Number(resumen.meta_anual || 0);
    const pct = meta ? Math.min(100, Math.round((total / meta) * 100)) : 0;
    $('#proy-version-label').text(resumen.version ? resumen.version.nombre : '');
    $('#proy-meta-chart').html(`
      <div class="proy-goal-grid">
        <div>
          <div class="small text-muted">Monto actual</div>
          <div class="proy-goal-value">${ProyeccionesView._clp(total)}</div>
        </div>
        <div>
          <div class="small text-muted">Meta anual</div>
          <div class="proy-goal-value">${meta ? ProyeccionesView._clp(meta) : '-'}</div>
        </div>
        <div>
          <div class="small text-muted">Avance</div>
          <div class="proy-goal-value">${meta ? pct + '%' : '-'}</div>
        </div>
      </div>
      <div class="proy-goal-bar mt-3"><div style="width:${pct}%"></div></div>
    `);
  },

  _renderMonthlySummary(rows, resumen) {
    $('#proy-total').text(`${ProyeccionesView._clp(resumen.total_clp || 0)} total anual`);
    $('#proy-table-head').html('<tr><th>Mes</th><th class="text-end">Total UF</th><th class="text-end">Total CLP</th></tr>');
    const body = rows.map(row => `
      <tr><td>${ProyeccionesView._esc(row.mes_nombre)}</td><td class="text-end">${ProyeccionesView._num(row.monto_uf)}</td><td class="text-end">${ProyeccionesView._clp(row.monto_clp)}</td></tr>
    `).join('');
    const totalRow = `<tr class="table-light fw-semibold"><td>Total anual</td><td class="text-end">${ProyeccionesView._num(resumen.total_uf || 0)}</td><td class="text-end">${ProyeccionesView._clp(resumen.total_clp || 0)}</td></tr>`;
    $('#proy-table-body').html(body + totalRow);
  },

  _fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result).split(',')[1]);
      reader.onerror = () => reject(new Error('No se pudo leer el archivo'));
      reader.readAsDataURL(file);
    });
  },

  _meses() {
    return ['ENERO','FEBRERO','MARZO','ABRIL','MAYO','JUNIO','JULIO','AGOSTO','SEPTIEMBRE','OCTUBRE','NOVIEMBRE','DICIEMBRE'];
  },

  _esc(value) {
    return String(value == null ? '' : value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  },

  _iva(value) {
    if (value === 'AFECTO_IVA') return 'AFECTO';
    if (value === 'EXENTO_IVA') return 'EXENTO';
    return ProyeccionesView._esc(value);
  },

  _num(value) {
    if (value == null || isNaN(value)) return '';
    return Number(value).toLocaleString('es-CL', { maximumFractionDigits: 2 });
  },

  _ufInput(value) {
    if (value == null || value === '' || isNaN(value)) return '';
    return String(Math.round(Number(value)));
  },

  _roundInput(value) {
    if (value == null || value === '' || isNaN(value)) return '';
    return String(Math.round(Number(value)));
  },

  _clp(value) {
    if (value == null || value === '' || isNaN(value)) return '';
    return '$' + Number(value).toLocaleString('es-CL', { maximumFractionDigits: 0 });
  }
};

$(document).off('click.proyEditApply').on('click.proyEditApply', '#btn-edit-apply', () => ProyeccionesView._applyEditPending());
