window.Validators = {
  paraEnviarRevision(s) {
    const errs = [];
    if (!s.cliente_id)      errs.push('Falta cliente.');
    if (!s.empresa_emisora) errs.push('Falta seleccionar "Facturar Por".');
    if (!s.periodo)         errs.push('Falta periodo.');

    if (s.estado === 'FACTURA SOLICITADA') {
      if (!s.coordinador_id) errs.push('Falta responsable.');
      if (!s.glosa)          errs.push('Falta glosa.');
      if (!s.observaciones)  errs.push('Falta observaciones.');
      if (!s.hes_numero)     errs.push('Falta HES.');
      if (!s.oc_numero && !s.contrato_numero) errs.push('Debe incluir OC/Nota de Pedido o numero de contrato.');
      if (!s.receptores || !s.receptores.length) errs.push('Debe incluir al menos un receptor.');
      if (!s.cps || !s.cps.length) errs.push('Debe especificar al menos un Centro de Proyecto.');
      if ((s.cps || []).some(cp => Number(cp.monto_uf) > 0) && !s.uf_valor) errs.push('Debe ingresar o buscar el valor UF.');
      const neto = Number(s.monto_neto_clp) || (s.cps || []).reduce((sum, cp) => sum + (Number(cp.monto_clp) || 0), 0);
      if (neto <= 0) errs.push('Monto neto debe ser mayor a 0.');
    }

    return errs;
  }
};
