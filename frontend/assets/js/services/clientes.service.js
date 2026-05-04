window.ClientesService = {
  list(filtros)         { return Api.get('/clientes' + (filtros ? '?' + $.param(filtros) : '')); },
  get(id)               { return Api.get('/clientes/' + id); },
  create(payload)       { return Api.post('/clientes', payload); },
  update(id, payload)   { return Api.patch('/clientes/' + id, payload); },
  desactivar(id)        { return Api.del('/clientes/' + id); },
  receptores(clienteId) { return Api.get('/receptores?clienteId=' + encodeURIComponent(clienteId)); }
};
