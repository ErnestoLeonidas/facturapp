window.SolicitudesService = {
  list(filtros)         { return Api.get('/solicitudes' + (filtros ? '?' + $.param(filtros) : '')); },
  get(id)               { return Api.get('/solicitudes/' + id); },
  create(payload)       { return Api.post('/solicitudes', payload); },
  update(id, payload)   { return Api.patch('/solicitudes/' + id, payload); },
  delete(id)            { return Api.del('/solicitudes/' + id); },
  cambiarEstado(id, hacia, comentario) {
    return Api.post('/solicitudes/' + id + '/estado', { hacia, comentario });
  },
  duplicar(id)          { return Api.post('/solicitudes/' + id + '/duplicar'); },
  historial(id)         { return Api.get('/solicitudes/' + id + '/historial'); },
  exportar(id)          { return Api.post('/exportaciones/solicitud/' + id); },
  descargarExportacion(exportId) {
    const token = AuthService.token();
    const url = AppConfig.apiBase + '/exportaciones/' + encodeURIComponent(exportId);
    return fetch(url, { headers: token ? { Authorization: 'Bearer ' + token } : {} })
      .then(resp => {
        if (!resp.ok) throw new Error('No se pudo descargar el archivo exportado');
        const disposition = resp.headers.get('Content-Disposition') || '';
        const match = disposition.match(/filename="([^"]+)"/i);
        const filename = match ? match[1] : 'Solicitud_factura.xlsx';
        return resp.blob().then(blob => ({ blob, filename }));
      })
      .then(({ blob, filename }) => {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
          URL.revokeObjectURL(a.href);
          a.remove();
        }, 0);
      });
  },

  // Recurrentes
  recurrentes()                        { return Api.get('/solicitudes-programadas'); },
  recurrenteCrear(p)                   { return Api.post('/solicitudes-programadas', p); },
  recurrenteEditar(id, p)              { return Api.patch('/solicitudes-programadas/' + id, p); },
  recurrenteGenerar(id, periodo)       { return Api.post('/solicitudes-programadas/' + id + '/generar?periodo=' + periodo); }
};
