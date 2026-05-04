window.TiemposService = {
  porSolicitud(solicitudId)         { return Api.get('/solicitudes/' + solicitudId + '/tiempos'); },
  registrar(solicitudId, payload)   { return Api.post('/solicitudes/' + solicitudId + '/tiempos', payload); },
  corregir(id, payload)             { return Api.patch('/tiempos/' + id, payload); },
  porDesarrollador(devId, filtros)  { return Api.get('/desarrolladores/' + devId + '/tiempos' + (filtros ? '?' + $.param(filtros) : '')); }
};
