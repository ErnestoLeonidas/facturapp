window.HistorialUfView = {
  _anioDisponible: new Date().getFullYear(),
  _meses: [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ],

  render(params = {}) {
    const hoy = new Date();
    const anio = HistorialUfView._anioDisponible;
    const mes = Number(params.mes) || hoy.getMonth() + 1;

    UI.setTitle('Historial UF');
    $('#view-root').html(`
      <div class="d-flex flex-wrap gap-2 align-items-end mb-3">
        <div>
          <label class="form-label mb-1">Mes</label>
          <select class="form-select" id="uf-mes" style="min-width: 180px">
            ${HistorialUfView._meses.map((nombre, i) => `<option value="${i + 1}" ${mes === i + 1 ? 'selected' : ''}>${nombre}</option>`).join('')}
          </select>
        </div>
        <div>
          <label class="form-label mb-1">Año</label>
          <input type="text" class="form-control" id="uf-anio" value="${anio}" readonly style="width: 110px">
        </div>
        <button class="btn btn-primary" id="uf-consultar"><i class="bi bi-search"></i> Consultar UF</button>
        <button class="btn btn-outline-secondary" id="uf-mes-actual"><i class="bi bi-calendar-check"></i> Mes actual</button>
      </div>

      <div id="uf-alert"></div>

      <section class="kpi-grid uf-summary mb-3" id="uf-resumen">
        ${HistorialUfView._renderResumenCards({})}
      </section>

      <div class="d-flex justify-content-between align-items-center mb-2">
        <div class="text-muted small" id="uf-count"></div>
      </div>

      <div class="card">
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead>
              <tr>
                <th>Fecha</th>
                <th class="text-end">Valor UF</th>
                <th>Última actualización</th>
              </tr>
            </thead>
            <tbody id="uf-rows">
              <tr><td colspan="3" class="text-center text-muted py-4">Cargando...</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    `);

    $('#uf-consultar').on('click', () => HistorialUfView._navegar());
    $('#uf-mes').on('change', () => HistorialUfView._navegar());
    $('#uf-mes-actual').on('click', () => {
      location.hash = `#/historial-uf?anio=${HistorialUfView._anioDisponible}&mes=${hoy.getMonth() + 1}`;
    });

    HistorialUfView._cargar();
  },

  _filtros() {
    return {
      anio: HistorialUfView._anioDisponible,
      mes: $('#uf-mes').val()
    };
  },

  _navegar() {
    location.hash = '#/historial-uf?' + $.param(HistorialUfView._filtros());
  },

  _cargar() {
    $('#uf-alert').empty();
    $('#uf-count').empty();
    $('#uf-resumen').html(HistorialUfView._renderResumenCards({}));
    $('#uf-rows').html('<tr><td colspan="3" class="text-center text-muted py-4">Cargando...</td></tr>');

    UfService.historial(HistorialUfView._filtros())
      .then(data => HistorialUfView._renderData(data))
      .fail(e => {
        const msg = (e && e.message) || 'No se pudo consultar el historial UF';
        $('#uf-alert').html(`<div class="alert alert-danger">${msg}</div>`);
        $('#uf-rows').html('<tr><td colspan="3" class="text-center text-danger py-4">No se pudo cargar el historial UF.</td></tr>');
      });
  },

  _renderData(data) {
    const valores = data.valores || [];
    $('#uf-resumen').html(HistorialUfView._renderResumenCards(data.resumen || {}));
    $('#uf-count').text(`${valores.length} día${valores.length === 1 ? '' : 's'} con UF disponible`);

    if (data.errores && data.errores.length) {
      $('#uf-alert').html(`
        <div class="alert alert-warning">
          Algunos días no tienen UF disponible o no pudieron consultarse. Se muestran los valores encontrados.
        </div>
      `);
    }

    if (!valores.length) {
      $('#uf-rows').html('<tr><td colspan="3" class="text-center text-muted py-4">Sin valores disponibles para el mes seleccionado</td></tr>');
      return;
    }

    $('#uf-rows').html(valores.map(row => `
      <tr>
        <td>${Format.fecha(row.fecha)}</td>
        <td class="text-end"><strong>${HistorialUfView._formatValor(row.valor)}</strong></td>
        <td>${row.updated_at ? HistorialUfView._formatUpdatedAt(row.updated_at) : '<span class="text-muted">No disponible</span>'}</td>
      </tr>
    `).join(''));
  },

  _renderResumenCards(resumen) {
    const cards = [
      ['UF inicio de mes', resumen.inicio_mes],
      ['UF último día disponible', resumen.ultimo_disponible],
      ['UF máxima del mes', resumen.maximo],
      ['UF mínima del mes', resumen.minimo],
      ['UF promedio mensual', resumen.promedio]
    ];

    return cards.map(([label, value]) => `
      <div class="card-kpi">
        <small class="text-muted">${label}</small>
        <h3>${HistorialUfView._formatValor(value) || '-'}</h3>
      </div>
    `).join('');
  },

  _formatValor(value) {
    if (value == null || isNaN(value)) return '';
    return Math.round(Number(value)).toLocaleString('es-CL', {
      maximumFractionDigits: 0
    });
  },

  _formatUpdatedAt(value) {
    return String(value).replace('T', ' ').replace(/\.\d+Z$/, '');
  }
};
