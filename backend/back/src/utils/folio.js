const db = require('../db-async');

async function generarFolio(conn = db) {
  const year = new Date().getFullYear();
  const rows = await conn.all(
    'SELECT folio FROM solicitud_factura WHERE folio LIKE ?',
    [`SF-${year}-%`]
  );

  const ultimo = rows.reduce((max, row) => {
    const match = String(row.folio || '').match(new RegExp(`^SF-${year}-(\\d+)$`));
    if (!match) return max;
    return Math.max(max, Number(match[1]) || 0);
  }, 0);
  const n = ultimo + 1;

  return `SF-${year}-${String(n).padStart(5, '0')}`;
}

module.exports = { generarFolio };
