const r = require('express').Router();
const db = require('../db');
const { v4: uuidv4 } = require('uuid');
const { ok, fail, notFound } = require('../middleware/envelope');
const { generarSolicitudXLSX } = require('../services/exportador');
const path = require('path');
const fs = require('fs');

const EXPORT_DIR = path.join(__dirname, '..', '..', 'storage', 'exports');
if (!fs.existsSync(EXPORT_DIR)) fs.mkdirSync(EXPORT_DIR, { recursive: true });

r.post('/solicitud/:id', async (req, res, next) => {
  const sol = db.prepare('SELECT estado, folio FROM solicitud_factura WHERE id=?').get(req.params.id);
  if (!sol) return notFound(res);
  if (!['Aprobada','Emitida','Facturada','Cerrada'].includes(sol.estado))
    return fail(res, 'VALIDATION_ERROR', `Solo se puede exportar desde estado Aprobada. Estado actual: ${sol.estado}`);

  try {
    const buf = await generarSolicitudXLSX(req.params.id);
    const filename = `${sol.folio}_${Date.now()}.xlsx`;
    const filepath = path.join(EXPORT_DIR, filename);
    fs.writeFileSync(filepath, buf);

    const expId = uuidv4();
    db.prepare(`INSERT INTO documento_exportado (id, solicitud_id, ruta, generado_por) VALUES (?,?,?,?)`)
      .run(expId, req.params.id, filename, req.body._usuario || 'usuario');

    ok(res, { exportId: expId, url: `/api/exportaciones/${expId}`, folio: sol.folio }, 201);
  } catch (e) { next(e); }
});

r.get('/:id', (req, res) => {
  const exp = db.prepare('SELECT * FROM documento_exportado WHERE id=?').get(req.params.id);
  if (!exp) return notFound(res);
  const filepath = path.join(EXPORT_DIR, exp.ruta);
  if (!fs.existsSync(filepath)) return notFound(res, 'Archivo no encontrado');
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename="${path.basename(exp.ruta)}"`);
  res.sendFile(filepath);
});

module.exports = r;
