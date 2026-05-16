const r = require('express').Router();
const db = require('../db');
const { ok } = require('../middleware/envelope');

r.get('/clientes', (req, res) => {
  const rows = db.prepare(`
    SELECT c.id, c.nombre_corto, c.razon_social,
      COUNT(sf.id) as total_solicitudes,
      COALESCE(SUM(CASE WHEN sf.estado IN ('Facturada','Cerrada','Emitida') THEN sf.monto_neto_clp ELSE 0 END),0) as facturado_clp,
      COALESCE(SUM(CASE WHEN sf.tipo='mensual' THEN sf.monto_neto_clp ELSE 0 END),0) as recurrente_clp,
      COALESCE(SUM(CASE WHEN sf.tipo='adicional' THEN sf.monto_neto_clp ELSE 0 END),0) as adicional_clp
    FROM cliente c
    LEFT JOIN solicitud_factura sf ON sf.cliente_id = c.id AND sf.is_delete = 0
    WHERE c.estado = 'Activo'
    GROUP BY c.id ORDER BY facturado_clp DESC
  `).all();
  ok(res, rows);
});

r.get('/clientes/:id', (req, res) => {
  const { periodoDesde, periodoHasta } = req.query;
  let sql = `SELECT periodo,
    SUM(monto_neto_clp) as neto,
    SUM(monto_iva_clp) as iva,
    SUM(monto_total_clp) as total,
    SUM(CASE WHEN tipo='mensual' THEN monto_neto_clp ELSE 0 END) as recurrente,
    SUM(CASE WHEN tipo='adicional' THEN monto_neto_clp ELSE 0 END) as adicional,
    COUNT(*) as solicitudes
    FROM solicitud_factura WHERE cliente_id=? AND is_delete = 0`;
  const vals = [req.params.id];
  if (periodoDesde) { sql += ' AND periodo >= ?'; vals.push(periodoDesde); }
  if (periodoHasta) { sql += ' AND periodo <= ?'; vals.push(periodoHasta); }
  sql += ' GROUP BY periodo ORDER BY periodo DESC';
  const serie = db.prepare(sql).all(...vals);
  const cliente = db.prepare('SELECT * FROM cliente WHERE id=?').get(req.params.id);
  ok(res, { cliente, serie });
});

r.get('/gastos', (req, res) => {
  const { desde, hasta } = req.query;
  let sql = `SELECT periodo, SUM(monto_neto_clp) as neto, SUM(monto_iva_clp) as iva, COUNT(*) as solicitudes
    FROM solicitud_factura WHERE is_delete = 0 AND estado IN ('FACTURA SOLICITADA','Facturada','Cerrada','Emitida','Aprobada')`;
  const vals = [];
  if (desde) { sql += ' AND periodo >= ?'; vals.push(desde); }
  if (hasta) { sql += ' AND periodo <= ?'; vals.push(hasta); }
  sql += ' GROUP BY periodo ORDER BY periodo DESC';
  ok(res, db.prepare(sql).all(...vals));
});

r.get('/desarrolladores/:id', (req, res) => {
  const { desde, hasta } = req.query;
  let sql = `SELECT rt.fecha, rt.minutos, rt.descripcion, rt.aprobado,
    sf.folio, sf.periodo, sf.glosa, c.nombre_corto as cliente
    FROM registro_tiempo rt
    JOIN solicitud_factura sf ON sf.id=rt.solicitud_id
    JOIN cliente c ON c.id=sf.cliente_id
    WHERE rt.desarrollador_id=? AND sf.is_delete = 0`;
  const vals = [req.params.id];
  if (desde) { sql += ' AND rt.fecha >= ?'; vals.push(desde); }
  if (hasta) { sql += ' AND rt.fecha <= ?'; vals.push(hasta); }
  sql += ' ORDER BY rt.fecha DESC';
  const tiempos = db.prepare(sql).all(...vals);
  const totalMin = tiempos.reduce((a, t) => a + t.minutos, 0);
  ok(res, { desarrollador: db.prepare('SELECT * FROM desarrollador WHERE id=?').get(req.params.id), tiempos, total_minutos: totalMin, total_horas: +(totalMin/60).toFixed(2) });
});

module.exports = r;
