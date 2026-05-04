const ExcelJS = require('exceljs');
const db = require('../db');

function fmtCLP(n) {
  if (n == null) return '';
  return Number(n).toLocaleString('es-CL', { minimumFractionDigits: 2 });
}

function fmtFecha(iso) {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return `${d}-${m}-${y}`;
}

async function generarSolicitudXLSX(solicitudId) {
  const sf = db.prepare('SELECT * FROM solicitud_factura WHERE id=?').get(solicitudId);
  if (!sf) throw new Error('Solicitud no encontrada');

  const cliente = db.prepare('SELECT * FROM cliente WHERE id=?').get(sf.cliente_id);
  const empresa = db.prepare('SELECT * FROM empresa_emisora WHERE codigo=?').get(sf.empresa_emisora);
  const coordinador = sf.coordinador_id ? db.prepare('SELECT nombre FROM coordinador WHERE id=?').get(sf.coordinador_id) : null;
  const items = db.prepare('SELECT * FROM solicitud_item WHERE solicitud_id=? ORDER BY orden').all(solicitudId);
  const cps = db.prepare(`SELECT sc.*, cp.codigo, cp.nombre as cp_nombre FROM solicitud_cp sc JOIN cp ON cp.id=sc.cp_id WHERE sc.solicitud_id=? ORDER BY sc.orden`).all(solicitudId);
  const receptores = db.prepare(`SELECT r.* FROM receptor r JOIN solicitud_receptor sr ON sr.receptor_id=r.id WHERE sr.solicitud_id=?`).all(solicitudId);

  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('Solicitud');

  ws.getColumn('A').width = 4;
  ws.getColumn('B').width = 32;
  ws.getColumn('C').width = 38;
  ws.getColumn('D').width = 16;

  const AZUL = '1F3864';
  const AZUL_CLARO = 'D9E2F3';
  const GRIS = 'F2F2F2';
  const BORDE = { style: 'thin', color: { argb: 'AAAAAA' } };
  const BORDERS = { top: BORDE, left: BORDE, bottom: BORDE, right: BORDE };

  function setCell(row, col, value, opts = {}) {
    const cell = ws.getCell(row, col);
    cell.value = value;
    if (opts.bold)      cell.font = { ...(cell.font||{}), bold: true };
    if (opts.size)      cell.font = { ...(cell.font||{}), size: opts.size };
    if (opts.color)     cell.font = { ...(cell.font||{}), color: { argb: opts.color } };
    if (opts.bg)        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: opts.bg } };
    if (opts.align)     cell.alignment = { vertical: 'middle', horizontal: opts.align, wrapText: true };
    if (opts.border)    cell.border = BORDERS;
    if (opts.numFmt)    cell.numFmt = opts.numFmt;
  }

  function label(row, text) {
    setCell(row, 2, text, { bold: true, bg: AZUL_CLARO, border: true, align: 'left' });
  }
  function value(row, text, opts = {}) {
    setCell(row, 3, text, { border: true, align: 'left', ...opts });
  }
  function fullRow(row, text, opts = {}) {
    ws.mergeCells(row, 2, row, 4);
    setCell(row, 2, text, { border: true, align: 'center', ...opts });
  }

  let r = 1;

  // Título
  ws.mergeCells(r, 1, r, 4);
  setCell(r, 1, 'SOLICITUD DE FACTURA GRUPO MAS', { bold: true, size: 14, bg: AZUL, color: 'FFFFFF', align: 'center' });
  ws.getRow(r).height = 28;
  r++;

  // Facturar Por
  label(r, 'Facturar Por');
  value(r, empresa ? empresa.razon_social : sf.empresa_emisora, { bold: true });
  r++;

  // Cliente
  label(r, 'Cliente');
  value(r, cliente ? cliente.nombre_corto : '');
  r++;

  // Separador INFORMACIÓN CLIENTE
  ws.mergeCells(r, 2, r, 4);
  setCell(r, 2, 'INFORMACIÓN CLIENTE', { bold: true, bg: AZUL, color: 'FFFFFF', align: 'center' });
  r++;

  label(r, 'Razón Social');
  value(r, cliente ? cliente.razon_social || '' : '');
  r++;

  label(r, 'RUT');
  value(r, cliente ? cliente.rut || '' : '');
  r++;

  label(r, 'Giro');
  value(r, cliente ? cliente.giro || '' : '');
  r++;

  label(r, 'Dirección');
  value(r, cliente ? cliente.direccion || '' : '');
  r++;

  label(r, 'Orden de Compra / Nota de Pedido');
  value(r, sf.oc_numero || sf.contrato_numero || '');
  r++;

  label(r, 'HES');
  value(r, sf.hes_numero || 'N/A');
  r++;

  label(r, 'Glosa');
  ws.getRow(r).height = 36;
  value(r, sf.glosa, { align: 'left' });
  r++;

  label(r, 'Neto');
  value(r, fmtCLP(sf.monto_neto_clp), { align: 'right' });
  r++;

  const empresaAfectoIva = empresa && empresa.afecto_iva;
  label(r, 'Monto IVA');
  value(r, empresaAfectoIva ? fmtCLP(sf.monto_iva_clp) : 'Exento', { align: 'right' });
  r++;

  label(r, 'Total');
  value(r, fmtCLP(sf.monto_total_clp), { bold: true, align: 'right' });
  r++;

  // Receptores (una línea por receptor: nombre + email)
  label(r, 'Receptor de Documento');
  const recTexto = receptores.map(rec => `${rec.nombre}\n${rec.email}`).join('\n');
  ws.getRow(r).height = Math.max(18, receptores.length * 28);
  value(r, recTexto);
  r++;

  // Separador INFORMACIÓN INTERNA
  ws.mergeCells(r, 2, r, 4);
  setCell(r, 2, 'Información Interna', { bold: true, bg: AZUL, color: 'FFFFFF', align: 'center' });
  r++;

  label(r, 'Fecha de Solicitud');
  value(r, fmtFecha(sf.fecha_solicitud));
  r++;

  // CPs: una fila por CP con código y monto
  if (cps.length > 0) {
    cps.forEach((cp, i) => {
      label(r, i === 0 ? 'Centro de Proyecto' : '');
      setCell(r, 3, cp.codigo, { border: true, align: 'left' });
      setCell(r, 4, fmtCLP(cp.monto_clp), { border: true, align: 'right' });
      r++;
    });
  } else {
    label(r, 'Centro de Proyecto');
    value(r, '');
    r++;
  }

  label(r, 'Área');
  value(r, sf.area || '');
  r++;

  label(r, 'Encargado de Solicitud');
  value(r, coordinador ? coordinador.nombre : '');
  r++;

  label(r, 'Observaciones');
  value(r, sf.observaciones || '');
  r++;

  // Notas fijas
  r++;
  ws.mergeCells(r, 1, r, 4);
  setCell(r, 1, 'NOTAS:', { bold: true, bg: GRIS });
  r++;

  const notas = [
    '*Si la solicitud es exenta de IVA, solo completar el monto total.',
    '*Si la factura es con IVA, solo debes agregar el monto neto y automáticamente dará el valor de IVA y bruto.',
    '*Para efecto de las proyecciones, deberá indicarse si el proyecto está afecto, exento de IVA o mixto.',
    '*En las proyecciones debe incluirse el valor total de proyecto, incluyendo el IVA si está afecto.'
  ];
  notas.forEach(n => {
    ws.mergeCells(r, 1, r, 4);
    setCell(r, 1, n, { bg: GRIS, align: 'left' });
    ws.getRow(r).height = 16;
    r++;
  });

  const buf = await wb.xlsx.writeBuffer();
  return buf;
}

module.exports = { generarSolicitudXLSX };
