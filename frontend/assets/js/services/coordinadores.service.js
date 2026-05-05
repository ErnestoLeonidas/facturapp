window.CoordinadoresService = {
  list()              { return Api.get('/coordinadores'); },
  create(payload)    { return Api.post('/coordinadores', payload); },
  update(id, payload){ return Api.patch('/coordinadores/' + id, payload); },
  delete(id)         { return Api.del('/coordinadores/' + id); }
};
