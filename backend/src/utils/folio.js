const db = require('../db');

function generarFolio() {
  const year = new Date().getFullYear();
  const row = db.prepare(
    `SELECT COUNT(*) as cnt FROM solicitud_factura WHERE folio LIKE ?`
  ).get(`SF-${year}-%`);
  const n = (row.cnt || 0) + 1;
  return `SF-${year}-${String(n).padStart(5, '0')}`;
}

module.exports = { generarFolio };
