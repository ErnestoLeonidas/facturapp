window.UfService = {
  historial(filtros) {
    return Api.get('/uf/historial' + (filtros ? '?' + $.param(filtros) : ''));
  }
};
