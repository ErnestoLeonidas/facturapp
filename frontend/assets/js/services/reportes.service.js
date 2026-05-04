window.ReportesService = {
  clientes(filtros)        { return Api.get('/reportes/clientes' + (filtros ? '?' + $.param(filtros) : '')); },
  cliente(id, filtros)     { return Api.get('/reportes/clientes/' + id + (filtros ? '?' + $.param(filtros) : '')); },
  gastos(filtros)          { return Api.get('/reportes/gastos' + (filtros ? '?' + $.param(filtros) : '')); },
  desarrollador(id, f)     { return Api.get('/reportes/desarrolladores/' + id + (f ? '?' + $.param(f) : '')); }
};
