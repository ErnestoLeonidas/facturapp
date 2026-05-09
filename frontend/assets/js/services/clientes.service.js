window.ClientesService = {
  list(filtros)         { return Api.get('/clientes' + (filtros ? '?' + $.param(filtros) : '')); },
  get(id)               { return Api.get('/clientes/' + id); },
  create(payload)       { return Api.post('/clientes', payload); },
  update(id, payload)   { return Api.patch('/clientes/' + id, payload); },
  desactivar(id)        { return Api.del('/clientes/' + id); },
  receptores(clienteId) { return Api.get('/receptores?clienteId=' + encodeURIComponent(clienteId)); },
  cps(clienteId)        { return Api.get('/cp?clienteId=' + encodeURIComponent(clienteId)); },
  coordinadores(clienteId) { return Api.get('/clientes/' + encodeURIComponent(clienteId) + '/coordinadores'); },
  addCoordinador(clienteId, payload) { return Api.post('/clientes/' + encodeURIComponent(clienteId) + '/coordinadores', payload); },
  deleteCoordinador(clienteId, asignacionId) { return Api.del('/clientes/' + encodeURIComponent(clienteId) + '/coordinadores/' + encodeURIComponent(asignacionId)); }
};
