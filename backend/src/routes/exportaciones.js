const r = require('express').Router();
const db = require('../db');
const { v4: uuidv4 } = require('uuid');
const { ok, fail, notFound } = require('../middleware/envelope');
const { generarSolicitudXLSX } = require('../services/exportador');
const path = require('path');
const fs = require('fs');

const EXPORT_DIR = path.join(__dirname, '..', '..', 'storage', 'exports');
if (!fs.existsSync(EXPORT_DIR)) fs.mkdirSync(EXPORT_DIR, { recursive: true });

const MESES = [
  'ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO',
  'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'
];

function limpiarParteArchivo(valor) {
  return String(valor || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Za-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .toUpperCase();
}

function nombreMesDesdePeriodo(periodo) {
  const mes = Number(String(periodo || '').slice(5, 7));
  return MESES[mes - 1] || limpiarParteArchivo(periodo) || 'SIN_MES';
}

function nombreArchivoSolicitud(sol) {
  const cliente = limpiarParteArchivo(sol.cliente_nombre || 'CLIENTE');
  const mes = nombreMesDesdePeriodo(sol.periodo);
  return `Solicitud_factura_${cliente}_${mes}.xlsx`;
}

r.post('/solicitud/:id', async (req, res, next) => {
  const sol = db.prepare(`SELECT sf.estado, sf.folio, sf.periodo, c.nombre_corto as cliente_nombre
    FROM solicitud_factura sf
    JOIN cliente c ON c.id = sf.cliente_id
    WHERE sf.id=? AND sf.is_delete = 0`).get(req.params.id);
  if (!sol) return notFound(res);
  if (!['FACTURA SOLICITADA','FACTURADO','Aprobada','Emitida','Facturada','Cerrada'].includes(sol.estado))
    return fail(res, 'VALIDATION_ERROR', `Solo se puede exportar desde estado FACTURA SOLICITADA o superior. Estado actual: ${sol.estado}`);

  try {
    const buf = await generarSolicitudXLSX(req.params.id);
    const filename = nombreArchivoSolicitud(sol);
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
