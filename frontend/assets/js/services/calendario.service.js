window.CalendarioService = {
  list(filtros) {
    return Api.get('/calendario' + (filtros ? '?' + $.param(filtros) : ''));
  }
};
