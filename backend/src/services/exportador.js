const ExcelJS = require('exceljs');
const db = require('../db');
const path = require('path');
const { getUF } = require('./uf');

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
  if (sf.moneda_base === 'UF' && sf.uf_valor) {
    const fecha = sf.uf_fecha || sf.fecha_solicitud;
    const linea = `Valor UF ${fecha}: ${fmtUF(sf.uf_valor)}`;
    const base = String(sf.observaciones || '')
      .split(/\r?\n/)
      .filter(line => !/^Valor UF \d{4}-\d{2}-\d{2}:/i.test(line.trim()))
      .join('\n')
      .trim();
    return [base, linea].filter(Boolean).join('\n');
  }
  return sf.observaciones || '';
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

function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function fechaSolicitudExportacion(sf) {
  return sf.uf_fecha || todayISO();
}

function cpMontoClp(cp, ufValor) {
  const montoUF = Number(cp.monto_uf);
  if (!Number.isNaN(montoUF) && montoUF > 0 && ufValor) return Math.round(montoUF * Number(ufValor));
  return Math.round(Number(cp.monto_clp) || 0);
}

function redondearIvaCLP(valor) {
  return Math.ceil((Number(valor) || 0) / 10) * 10;
}

function numeroFormula(valor) {
  return Number(valor || 0).toFixed(6).replace(/\.?0+$/, '');
}

function formulaNetoUF(cps, ufValor) {
  const totalUF = cps.reduce((sum, cp) => sum + (Number(cp.monto_uf) || 0), 0);
  if (!totalUF || !ufValor) return null;
  return `${numeroFormula(totalUF)}*${numeroFormula(ufValor)}`;
}

async function recalcularMontosParaExportacion(sf, cps, empresa) {
  const usaUF = cps.some(cp => Number(cp.monto_uf) > 0);
  let ufFecha = sf.uf_fecha;
  let ufValor = sf.uf_valor;

  if (usaUF && ufValor && !ufFecha) ufFecha = todayISO();
  if (usaUF && !ufValor) {
    ufFecha = ufFecha || todayISO();
    const uf = await getUF(ufFecha);
    ufValor = uf.valor;
  }

  const montoNeto = cps.reduce((sum, cp) => sum + cpMontoClp(cp, ufValor), 0);
  const ivaPct = (empresa && empresa.iva_pct) || 0.19;
  const montoIva = empresa && empresa.afecto_iva ? redondearIvaCLP(montoNeto * ivaPct) : 0;
  const montoTotal = montoNeto + montoIva;

  if (usaUF) {
    cps.forEach(cp => {
      const montoClp = cpMontoClp(cp, ufValor);
      cp.monto_clp = montoClp;
      db.prepare('UPDATE solicitud_cp SET monto_clp=? WHERE id=?').run(montoClp, cp.id);
    });
    db.prepare(`UPDATE solicitud_factura
      SET moneda_base='UF', uf_fecha=?, uf_valor=?, monto_neto_clp=?, monto_iva_clp=?, monto_total_clp=?, updated_at=datetime('now')
      WHERE id=?`)
      .run(ufFecha, ufValor, montoNeto, montoIva, montoTotal, sf.id);
    sf.moneda_base = 'UF';
    sf.uf_fecha = ufFecha;
    sf.uf_valor = ufValor;
    sf.monto_neto_clp = montoNeto;
    sf.monto_iva_clp = montoIva;
    sf.monto_total_clp = montoTotal;
  }

  return { ufFecha, ufValor, montoNeto, montoIva, montoTotal };
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
  const montos = await recalcularMontosParaExportacion(sf, cps, empresa);

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
  const netoFormula = formulaNetoUF(cps, montos.ufValor);
  setValue(ws, 'C15', netoFormula ? { formula: netoFormula, result: montos.montoNeto } : montos.montoNeto);
  setValue(ws, 'C16', montos.montoIva);
  setValue(ws, 'C17', montos.montoTotal);
  setValue(ws, 'C18', receptores.map(rec => rec.email).filter(Boolean).join('\n'));
  setValue(ws, 'C20', fechaExcel(fechaSolicitudExportacion(sf)));
  ws.getCell('C20').numFmt = 'd/m/yyyy';

  cps.forEach((cp, i) => {
    const row = 21 + i;
    ws.getCell(`B${row}`).value = 'Centro de Proyecto';
    ws.getCell(`C${row}`).value = cp.codigo;
    ws.getCell(`D${row}`).value = '';
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
