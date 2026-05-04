window.SolicitudesService = {
  list(filtros)         { return Api.get('/solicitudes' + (filtros ? '?' + $.param(filtros) : '')); },
  get(id)               { return Api.get('/solicitudes/' + id); },
  create(payload)       { return Api.post('/solicitudes', payload); },
  update(id, payload)   { return Api.patch('/solicitudes/' + id, payload); },
  cambiarEstado(id, hacia, comentario) {
    return Api.post('/solicitudes/' + id + '/estado', { hacia, comentario });
  },
  duplicar(id)          { return Api.post('/solicitudes/' + id + '/duplicar'); },
  historial(id)         { return Api.get('/solicitudes/' + id + '/historial'); },
  exportar(id)          { return Api.post('/exportaciones/solicitud/' + id); },

  // Recurrentes
  recurrentes()                        { return Api.get('/solicitudes-programadas'); },
  recurrenteCrear(p)                   { return Api.post('/solicitudes-programadas', p); },
  recurrenteEditar(id, p)              { return Api.patch('/solicitudes-programadas/' + id, p); },
  recurrenteGenerar(id, periodo)       { return Api.post('/solicitudes-programadas/' + id + '/generar?periodo=' + periodo); }
};
