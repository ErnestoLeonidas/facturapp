window.CalendarioView = {
  _meses: [
    'ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO',
    'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'
  ],

  render(params = {}) {
    const hoy = new Date();
    const anio = Number(params.anio) || hoy.getFullYear();
    const mes = params.mes || '';

    UI.setTitle('Calendario');
    $('#view-root').html(`
      <div class="d-flex flex-wrap gap-2 align-items-end mb-3">
        <div>
          <label class="form-label mb-1">Año</label>
          <input type="number" class="form-control" id="cal-anio" value="${anio}" min="2020" max="2100" style="width: 110px">
        </div>
        <div>
          <label class="form-label mb-1">Mes</label>
          <select class="form-select" id="cal-mes" style="min-width: 180px">
            <option value="">Todo el año</option>
            ${CalendarioView._meses.map((nombre, i) => `<option value="${i + 1}" ${String(mes) === String(i + 1) ? 'selected' : ''}>${nombre}</option>`).join('')}
          </select>
        </div>
        <div class="flex-grow-1">
          <label class="form-label mb-1">Buscar</label>
          <input class="form-control" id="cal-q" placeholder="Cliente, codigo, nombre, tipo de CP o facturacion" value="${params.q || ''}">
        </div>
        <button class="btn btn-primary" id="cal-aplicar"><i class="bi bi-search"></i> Revisar</button>
      </div>

      <section class="cal-months mb-3" id="cal-meses"></section>

      <div class="d-flex justify-content-between align-items-center mb-2">
        <div class="text-muted small" id="cal-resumen"></div>
        <button class="btn btn-sm btn-outline-secondary" id="cal-refresh"><i class="bi bi-arrow-clockwise"></i> Actualizar</button>
      </div>

      <div class="card">
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead>
              <tr>
                <th data-col-mes>Mes</th>
                <th>Cliente</th>
                <th>Código</th>
                <th>Nombre</th>
                <th>Tipo de CP</th>
                <th>Facturación</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody id="cal-rows">
              <tr><td colspan="7" class="text-center text-muted py-4">Cargando...</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    `);

    $('#cal-aplicar').on('click', () => CalendarioView._navegar());
    $('#cal-refresh').on('click', () => CalendarioView._cargar());
    $('#cal-anio, #cal-mes').on('change', () => CalendarioView._navegar());
    $('#cal-q').on('keydown', (e) => { if (e.key === 'Enter') CalendarioView._navegar(); });
    CalendarioView._cargar();
  },

  _filtros() {
    return {
      anio: $('#cal-anio').val(),
      mes: $('#cal-mes').val(),
      q: $('#cal-q').val()
    };
  },

  _navegar() {
    const filtros = CalendarioView._filtros();
    const qs = $.param(Object.fromEntries(Object.entries(filtros).filter(([, value]) => value)));
    location.hash = '#/calendario' + (qs ? '?' + qs : '');
  },

  _cargar() {
    $('#cal-rows').html('<tr><td colspan="7" class="text-center text-muted py-4">Cargando...</td></tr>');
    CalendarioService.list(CalendarioView._filtros())
      .then(data => CalendarioView._renderData(data))
      .fail(e => {
        const msg = (e && e.message) || 'No se pudo cargar el calendario';
        $('#cal-rows').html(`<tr><td colspan="7" class="text-center text-danger py-4">${msg}</td></tr>`);
      });
  },

  _renderData(data) {
    const rows = data.rows || [];
    const mesActivo = data.mes ? String(data.mes) : '';
    const totalClientes = new Set(rows.map(row => row.cliente_id)).size;

    $('#cal-resumen').text(`${rows.length} CP por revisar · ${totalClientes} cliente${totalClientes === 1 ? '' : 's'}`);
    $('[data-col-mes]').toggle(!mesActivo);
    CalendarioView._renderMeses(data.resumen || [], data.anio, mesActivo);
    CalendarioView._renderRows(rows, !!mesActivo);
  },

  _renderMeses(resumen, anio, mesActivo) {
    $('#cal-meses').html(resumen.map(item => `
      <button class="btn btn-sm ${String(item.mes) === mesActivo ? 'btn-primary' : 'btn-outline-secondary'} cal-month-btn"
        data-mes="${item.mes}" title="${item.clientes} clientes">
        <span>${item.nombre.slice(0, 3)}</span>
        <strong>${item.total}</strong>
      </button>
    `).join(''));
    $('.cal-month-btn').on('click', function () {
      location.hash = `#/calendario?anio=${anio}&mes=${$(this).data('mes')}`;
    });
  },

  _renderRows(rows, ocultarMes) {
    if (!rows.length) {
      $('#cal-rows').html('<tr><td colspan="7" class="text-center text-muted py-4">Sin CP programados para el filtro seleccionado</td></tr>');
      return;
    }

    $('#cal-rows').html(rows.map(row => `
      <tr>
        <td data-cell-mes>${row.mes_nombre || ''}</td>
        <td><strong>${row.cliente || ''}</strong></td>
        <td><code>${row.codigo || ''}</code></td>
        <td>${row.nombre || ''}</td>
        <td>${row.tipo_cp || ''}</td>
        <td>${row.codigo_facturacion || ''}</td>
        <td>${row.estado ? UI.estadoChip(row.estado) : '<span class="text-muted">Sin estado</span>'}</td>
      </tr>
    `).join(''));
    $('[data-cell-mes]').toggle(!ocultarMes);
  }
};

