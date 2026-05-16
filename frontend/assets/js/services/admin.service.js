window.AdminService = {
  usuarios() { return Api.get('/admin/usuarios'); },
  audit(limit) { return Api.get('/admin/audit?limit=' + (limit || 80)); },
  cargaAnual(payload) { return Api.post('/admin/carga-anual', payload); }
};
