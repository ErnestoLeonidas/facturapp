window.FinanzasService = {
  flujoCaja(params = {}) {
    const qs = $.param(Object.fromEntries(Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== '')));
    return Api.get('/finanzas/flujo-caja' + (qs ? `?${qs}` : ''));
  },
  rentabilidadCP() {
    return Api.get('/finanzas/rentabilidad-cp');
  }
};
