window.IntegracionesService = {
  uf(fecha) { return Api.get('/uf?fecha=' + encodeURIComponent(fecha)); }
};
