-- Constraints/indices formales para tablas criticas.
-- Evita reconstruir tablas existentes: se usan indices idempotentes y seguros.

-- cliente
CREATE INDEX IF NOT EXISTS idx_cliente_estado ON cliente(estado);
CREATE INDEX IF NOT EXISTS idx_cliente_coordinador ON cliente(coordinador_id);

-- cp
CREATE INDEX IF NOT EXISTS idx_cp_cliente_codigo ON cp(cliente_id, codigo);
CREATE INDEX IF NOT EXISTS idx_cp_tipo ON cp(tipo_cp);

-- solicitud_factura
CREATE INDEX IF NOT EXISTS idx_sol_periodo_estado ON solicitud_factura(periodo, estado, is_delete);
CREATE INDEX IF NOT EXISTS idx_sol_empresa_periodo ON solicitud_factura(empresa_emisora, periodo, is_delete);
CREATE INDEX IF NOT EXISTS idx_sol_coordinador_periodo ON solicitud_factura(coordinador_id, periodo, is_delete);
CREATE INDEX IF NOT EXISTS idx_sol_programada_periodo ON solicitud_factura(programada_id, periodo, is_delete);
CREATE INDEX IF NOT EXISTS idx_sol_updated_at ON solicitud_factura(updated_at DESC);

-- solicitud_cp
CREATE UNIQUE INDEX IF NOT EXISTS uq_solicitud_cp_solicitud_cp ON solicitud_cp(solicitud_id, cp_id);
CREATE INDEX IF NOT EXISTS idx_solicitud_cp_cp ON solicitud_cp(cp_id);
CREATE INDEX IF NOT EXISTS idx_solicitud_cp_solicitud_orden ON solicitud_cp(solicitud_id, orden);

-- proyeccion_facturacion
CREATE UNIQUE INDEX IF NOT EXISTS uq_proyeccion_natural
  ON proyeccion_facturacion(cliente_id, codigo, anio, mes, tipo_impuesto);
CREATE INDEX IF NOT EXISTS idx_proy_periodo_tipo_estado
  ON proyeccion_facturacion(anio, mes, tipo_impuesto, estado);
CREATE INDEX IF NOT EXISTS idx_proy_cliente_codigo_periodo
  ON proyeccion_facturacion(cliente_id, codigo, anio, mes);
CREATE INDEX IF NOT EXISTS idx_proy_estado ON proyeccion_facturacion(estado);
CREATE INDEX IF NOT EXISTS idx_proy_source_updated ON proyeccion_facturacion(source, updated_at DESC);

-- historial_estado
CREATE INDEX IF NOT EXISTS idx_hist_fecha ON historial_estado(fecha DESC);
CREATE INDEX IF NOT EXISTS idx_hist_estado_hacia ON historial_estado(estado_hacia);

-- documento_exportado
CREATE INDEX IF NOT EXISTS idx_doc_solicitud ON documento_exportado(solicitud_id, generado_at DESC);
CREATE INDEX IF NOT EXISTS idx_doc_checksum ON documento_exportado(checksum);
CREATE INDEX IF NOT EXISTS idx_doc_version ON documento_exportado(version_plantilla);

-- bitacora_integracion
CREATE INDEX IF NOT EXISTS idx_bitacora_estado ON bitacora_integracion(estado, iniciado_at DESC);
CREATE INDEX IF NOT EXISTS idx_bitacora_dataset ON bitacora_integracion(dataset, iniciado_at DESC);
