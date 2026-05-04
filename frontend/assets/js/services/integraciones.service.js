window.IntegracionesService = {
  uf(fecha)                  { return Api.get('/uf?fecha=' + encodeURIComponent(fecha)); },
  syncSheets(dataset)        { return Api.post('/integraciones/google-sheets/sync?dataset=' + encodeURIComponent(dataset)); },
  estadoSheets()             { return Api.get('/integraciones/google-sheets/estado'); }
};
