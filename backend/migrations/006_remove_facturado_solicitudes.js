module.exports = function migrate(db) {
  db.exec(`
UPDATE solicitud_factura
SET estado = 'FACTURA SOLICITADA',
    updated_at = datetime('now')
WHERE estado = 'FACTURADO';

UPDATE proyeccion_facturacion
SET estado = 'FACTURA SOLICITADA',
    updated_at = datetime('now')
WHERE estado = 'FACTURADO';

UPDATE historial_estado
SET estado_desde = 'FACTURA SOLICITADA'
WHERE estado_desde = 'FACTURADO';

UPDATE historial_estado
SET estado_hacia = 'FACTURA SOLICITADA'
WHERE estado_hacia = 'FACTURADO';

UPDATE catalogo_estado_solicitud
SET activo = 0
WHERE codigo = 'FACTURADO';
`);
};
