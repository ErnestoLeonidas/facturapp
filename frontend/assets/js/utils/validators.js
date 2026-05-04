window.Validators = {
  // Devuelve array de mensajes; vacío si todo ok. Reglas alineadas con docs/estados.md.
  paraEnviarRevision(s) {
    const errs = [];
    if (!s.cliente_id)            errs.push('Falta cliente.');
    if (!s.glosa)                 errs.push('Falta glosa.');
    if (!s.empresa_emisora)       errs.push('Falta seleccionar "Facturar Por".');
    if (!s.receptores || !s.receptores.length) errs.push('Debe incluir al menos un receptor.');
    if (!s.oc_numero && !s.contrato_numero) errs.push('Debe incluir OC o número de contrato.');
    if (s.requiere_hes && !s.hes_numero) errs.push('Este cliente requiere HES.');
    if (!s.monto_neto_clp || Number(s.monto_neto_clp) <= 0) errs.push('Monto neto debe ser mayor a 0.');
    if (!s.cps || !s.cps.length) errs.push('Debe especificar al menos un Centro de Proyecto.');
    return errs;
  }
};
