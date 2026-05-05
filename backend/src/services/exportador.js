const ExcelJS = require('exceljs');
const db = require('../db');
const path = require('path');

const TEMPLATE_PATH = path.join(__dirname, '..', '..', 'templates', 'solicitud-factura-ejemplo.xlsx');

function fechaExcel(iso) {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return new Date(Number(y), Number(m) - 1, Number(d));
}

function fmtFechaCL(iso) {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return `${d}-${m}-${y}`;
}

function fmtUF(valor) {
  if (valor == null) return '';
  return Number(valor).toLocaleString('es-CL', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function observacionesSolicitud(sf) {
  if (sf.observaciones) return sf.observaciones;
  if (sf.moneda_base === 'UF' && sf.uf_valor) {
    const fecha = sf.uf_fecha || sf.fecha_solicitud;
    return `UF  ${fmtUF(sf.uf_valor)}${fecha ? '\n' + fmtFechaCL(fecha) : ''}`;
  }
  return '';
}

function setValue(ws, cellAddress, value) {
  ws.getCell(cellAddress).value = value;
}

function esHabitat(cliente) {
  return String((cliente && cliente.nombre_corto) || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .includes('HABITAT');
}

function copyRowStyle(sourceRow, targetRow) {
  targetRow.height = sourceRow.height;
  sourceRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
    const target = targetRow.getCell(colNumber);
    target.style = JSON.parse(JSON.stringify(cell.style || {}));
    target.numFmt = cell.numFmt;
    target.alignment = cell.alignment ? { ...cell.alignment } : undefined;
    target.border = cell.border ? JSON.parse(JSON.stringify(cell.border)) : undefined;
    target.fill = cell.fill ? JSON.parse(JSON.stringify(cell.fill)) : undefined;
    target.font = cell.font ? { ...cell.font } : undefined;
  });
}

async function generarSolicitudXLSX(solicitudId) {
  const sf = db.prepare('SELECT * FROM solicitud_factura WHERE id=? AND is_delete = 0').get(solicitudId);
  if (!sf) throw new Error('Solicitud no encontrada');

  const cliente = db.prepare('SELECT * FROM cliente WHERE id=?').get(sf.cliente_id);
  const empresa = db.prepare('SELECT * FROM empresa_emisora WHERE codigo=?').get(sf.empresa_emisora);
  const coordinador = sf.coordinador_id ? db.prepare('SELECT nombre FROM coordinador WHERE id=?').get(sf.coordinador_id) : null;
  const cps = db.prepare(`
    SELECT sc.*, cp.codigo, cp.nombre as cp_nombre
    FROM solicitud_cp sc
    JOIN cp ON cp.id=sc.cp_id
    WHERE sc.solicitud_id=?
    ORDER BY sc.orden
  `).all(solicitudId);
  const receptores = db.prepare(`
    SELECT r.*
    FROM receptor r
    JOIN solicitud_receptor sr ON sr.receptor_id=r.id
    WHERE sr.solicitud_id=?
  `).all(solicitudId);

  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(TEMPLATE_PATH);
  const ws = wb.worksheets[0];
  ws.name = 'Solicitud';

  const cpRows = Math.max(cps.length, 1);
  if (cpRows > 1) {
    ws.spliceRows(22, 0, ...Array.from({ length: cpRows - 1 }, () => []));
    const sourceRow = ws.getRow(21);
    for (let row = 22; row < 21 + cpRows; row++) copyRowStyle(sourceRow, ws.getRow(row));
    ws.mergeCells(`B21:B${20 + cpRows}`);
  }

  const offset = cpRows - 1;
  const rowArea = 22 + offset;
  const rowEncargado = 23 + offset;
  const rowObservaciones = 24 + offset;

  setValue(ws, 'C4', empresa ? empresa.razon_social : sf.empresa_emisora);
  setValue(ws, 'C5', cliente ? cliente.nombre_corto : '');
  setValue(ws, 'C8', cliente ? cliente.razon_social || '' : '');
  setValue(ws, 'C9', cliente ? cliente.rut || '' : '');
  setValue(ws, 'C10', cliente ? cliente.giro || '' : '');
  setValue(ws, 'C11', cliente ? cliente.direccion || '' : '');
  if (esHabitat(cliente)) {
    setValue(ws, 'B12', 'N° Contrato');
    setValue(ws, 'C12', sf.contrato_numero || sf.oc_numero || '');
  } else {
    setValue(ws, 'B12', 'Orden de Compra/ Nota de Pedido');
    setValue(ws, 'C12', sf.oc_numero || '');
  }
  setValue(ws, 'C13', sf.hes_numero || 'N/A');
  setValue(ws, 'C14', sf.glosa);
  setValue(ws, 'C15', Number(sf.monto_neto_clp) || 0);
  setValue(ws, 'C16', Number(sf.monto_iva_clp) || 0);
  setValue(ws, 'C17', Number(sf.monto_total_clp) || 0);
  setValue(ws, 'C18', receptores.map(rec => `${rec.nombre}\n${rec.email}`).join('\n'));
  setValue(ws, 'C20', fechaExcel(sf.fecha_solicitud));

  cps.forEach((cp, i) => {
    const row = 21 + i;
    ws.getCell(`B${row}`).value = 'Centro de Proyecto';
    ws.getCell(`C${row}`).value = cp.codigo;
    ws.getCell(`D${row}`).value = Number(cp.monto_clp) || 0;
  });
  if (!cps.length) {
    ws.getCell('B21').value = 'Centro de Proyecto';
    ws.getCell('C21').value = '';
    ws.getCell('D21').value = '';
  }

  setValue(ws, `C${rowArea}`, sf.area || '');
  setValue(ws, `C${rowEncargado}`, coordinador ? coordinador.nombre : '');
  setValue(ws, `C${rowObservaciones}`, observacionesSolicitud(sf));

  return wb.xlsx.writeBuffer();
}

module.exports = { generarSolicitudXLSX };
