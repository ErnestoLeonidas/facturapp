window.IntegracionesService = {
  uf(fecha)                  { return Api.get('/uf?fecha=' + encodeURIComponent(fecha)); },
  syncSheets(dataset)        { return Api.post('/integraciones/google-sheets/sync?dataset=' + encodeURIComponent(dataset)); },
  importBaseExcel(source)    { return Api.post('/integraciones/excel/base-facturacion/import?source=' + encodeURIComponent(source || 'public-google-sheet')); },
  importMasterExcel()        { return Api.post('/integraciones/excel/master-facturacion/import'); },
  estadoSheets()             { return Api.get('/integraciones/google-sheets/estado'); },
  bitacora(limit)            { return Api.get('/integraciones/bitacora?limit=' + (limit || 20)); },
  plantillaDrive()           { return Api.get('/integraciones/google-drive/plantilla'); },
  syncPlantillaDrive()       { return Api.post('/integraciones/google-drive/plantilla/sync'); }
};
