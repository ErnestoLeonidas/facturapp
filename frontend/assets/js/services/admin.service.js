window.AdminService = {
  usuarios() { return Api.get('/admin/usuarios'); },
  crearUsuario(payload) { return Api.post('/admin/usuarios', payload); },
  cambiarPasswordUsuario(id, password) { return Api.put('/admin/usuarios/' + encodeURIComponent(id) + '/password', { password }); },
  eliminarUsuario(id) { return Api.del('/admin/usuarios/' + encodeURIComponent(id)); },
  audit(limit) { return Api.get('/admin/audit?limit=' + (limit || 80)); },
  exportarPendientesOCMes() {
    const token = AuthService.token();
    const url = AppConfig.apiBase + '/admin/reportes/pendientes-oc-mes/export';
    return fetch(url, { headers: token ? { Authorization: 'Bearer ' + token } : {} })
      .then(resp => {
        if (!resp.ok) throw new Error('No se pudo exportar pendientes de OC');
        return resp.blob();
      })
      .then(blob => {
        const parts = new Intl.DateTimeFormat('en-US', {
          timeZone: 'America/Santiago',
          year: 'numeric',
          month: '2-digit'
        }).formatToParts(new Date());
        const periodo = parts.find(p => p.type === 'year').value + '-' + parts.find(p => p.type === 'month').value;
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'Pendientes_OC_' + periodo + '.xlsx';
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
          URL.revokeObjectURL(a.href);
          a.remove();
        }, 0);
      });
  },

  proyecciones(params) { return Api.get('/admin/proyecciones?' + $.param(params || {})); },
  resumenProyecciones(params) { return Api.get('/admin/proyecciones/resumen?' + $.param(params || {})); },
  versionesProyecciones(params) { return Api.get('/admin/proyecciones/versiones?' + $.param(params || {})); },
  crearVersionProyecciones(payload) { return Api.post('/admin/proyecciones/versiones', payload); },
  activarVersionProyecciones(id) { return Api.put('/admin/proyecciones/versiones/' + encodeURIComponent(id) + '/activar', {}); },
  duplicarVersionProyecciones(id) { return Api.post('/admin/proyecciones/versiones/' + encodeURIComponent(id) + '/duplicar', {}); },
  renombrarVersionProyecciones(id, payload) { return Api.put('/admin/proyecciones/versiones/' + encodeURIComponent(id), payload); },
  grillaProyecciones(params) { return Api.get('/admin/proyecciones/grilla?' + $.param(params || {})); },
  actualizarMensualProyeccion(id, payload) { return Api.put('/admin/proyecciones/mensual/' + encodeURIComponent(id), payload); },
  recalcularProyecciones(payload) { return Api.post('/admin/proyecciones/recalcular', payload); },
  previewImportProyecciones(payload) { return Api.post('/admin/proyecciones/import/preview', payload); },
  confirmarImportProyecciones(payload) { return Api.post('/admin/proyecciones/import/confirm', payload); },
  importarProyecciones(payload) { return Api.post('/admin/proyecciones/import', payload); },
  clientesProyecciones() { return Api.get('/admin/proyecciones/clientes'); },
  msProyecciones(clienteId) { return Api.get('/admin/proyecciones/clientes/' + encodeURIComponent(clienteId) + '/ms'); },
  graficoProyecciones(params) { return Api.get('/admin/proyecciones/grafico?' + $.param(params || {})); },
  ufProyecciones(anio, params) { return Api.get('/admin/proyecciones/uf?' + $.param({ ...(params || {}), anio })); },
  guardarUfProyecciones(rows) { return Api.put('/admin/proyecciones/uf', { rows }); },
  guardarConfiguracionProyecciones(payload) { return Api.put('/admin/proyecciones/configuracion', payload); },
  recomendacionesProyecciones(params) { return Api.get('/admin/proyecciones/recomendaciones?' + $.param(params || {})); },
  exportarProyecciones(params) {
    const token = AuthService.token();
    const url = AppConfig.apiBase + '/admin/proyecciones/export?' + $.param(params || {});
    return fetch(url, { headers: token ? { Authorization: 'Bearer ' + token } : {} })
      .then(resp => {
        if (!resp.ok) throw new Error('No se pudo exportar proyecciones');
        return resp.blob();
      })
      .then(blob => {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'Proyecciones_Plataformas.xlsx';
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
          URL.revokeObjectURL(a.href);
          a.remove();
        }, 0);
      });
  }
};
