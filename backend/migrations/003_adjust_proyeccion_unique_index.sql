-- Ajusta la clave natural de proyecciones para no bloquear filas facturables
-- separadas del mismo cliente/MS/mes/tipo cuando cambian producto o facturacion.

DROP INDEX IF EXISTS uq_proyeccion_natural;

CREATE UNIQUE INDEX IF NOT EXISTS uq_proyeccion_natural
  ON proyeccion_facturacion(cliente_id, codigo, nombre, anio, mes, tipo_impuesto, codigo_facturacion);
