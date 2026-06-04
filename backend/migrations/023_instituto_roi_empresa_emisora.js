module.exports = function migration(db) {
  db.prepare(`
    INSERT INTO empresa_emisora (codigo, razon_social, rut, giro, direccion, telefono, afecto_iva, iva_pct)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(codigo) DO UPDATE SET
      razon_social = excluded.razon_social,
      rut = COALESCE(excluded.rut, empresa_emisora.rut),
      giro = COALESCE(excluded.giro, empresa_emisora.giro),
      direccion = COALESCE(excluded.direccion, empresa_emisora.direccion),
      telefono = COALESCE(excluded.telefono, empresa_emisora.telefono),
      afecto_iva = excluded.afecto_iva,
      iva_pct = excluded.iva_pct
  `).run(
    'INSTITUTO_ROI',
    'INSTITUTO ROI SPA',
    '76.455.718-2',
    'Servicios de Asesoria, Consultoria, Investigacion, Desarrollo y Publicaciones de Materias afines',
    null,
    null,
    1,
    0.19
  );

  db.prepare(`
    UPDATE solicitud_factura
    SET empresa_emisora = 'INSTITUTO_ROI'
    WHERE empresa_emisora = 'INSTITUTO_ROY'
  `).run();
};
