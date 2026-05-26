const axios = require('axios');
const db = require('../db');

const BASE = process.env.UF_API_BASE || 'https://mindicador.cl/api/uf';
const SII_BASE = process.env.UF_SII_BASE || 'https://www.sii.cl/valores_y_fechas/uf';
const CACHE_FROM_YEAR = Number(process.env.UF_CACHE_FROM_YEAR || 2026);
const CACHE_TO_YEAR = Number(process.env.UF_CACHE_TO_YEAR || 2026);
const MESES_SII = {
  enero: 1,
  febrero: 2,
  marzo: 3,
  abril: 4,
  mayo: 5,
  junio: 6,
  julio: 7,
  agosto: 8,
  septiembre: 9,
  octubre: 10,
  noviembre: 11,
  diciembre: 12
};

async function getUF(fecha) {
  const cached = db.prepare('SELECT valor, source, obtenido_at FROM uf_cache WHERE fecha = ?').get(fecha);
  if (cached) {
    return {
      fecha,
      valor: cached.valor,
      updated_at: cached.obtenido_at,
      cached: true,
      source: cached.source || 'cache'
    };
  }

  const anio = Number(fecha.slice(0, 4));
  if (Number.isInteger(anio) && anio >= CACHE_FROM_YEAR) {
    try {
      await cacheUFYear(anio, fecha);
      const saved = db.prepare('SELECT valor, source, obtenido_at FROM uf_cache WHERE fecha = ?').get(fecha);
      if (saved) {
        return {
          fecha,
          valor: saved.valor,
          updated_at: saved.obtenido_at,
          cached: false,
          source: saved.source || 'sii.cl'
        };
      }
    } catch (e) {
      // Si SII no responde, se usa el fallback por fecha de mindicador.cl.
    }
  }

  const [d, m, y] = fecha.split('-').reverse().join('-').split('-');
  const url = `${BASE}/${d}-${m}-${y}`;

  let valor;
  for (let i = 0; i < 3; i++) {
    try {
      const { data } = await axios.get(url, { timeout: 5000 });
      if (data && data.serie && data.serie[0]) {
        valor = data.serie[0].valor;
        break;
      }
    } catch (e) {
      if (i === 2) throw Object.assign(new Error('No se pudo obtener UF: ' + e.message), { code: 'UF_UNAVAILABLE' });
      await new Promise(r => setTimeout(r, 500 * (i + 1)));
    }
  }

  if (valor == null) throw Object.assign(new Error('UF no disponible para ' + fecha), { code: 'UF_UNAVAILABLE' });

  db.prepare("INSERT OR REPLACE INTO uf_cache (fecha, valor, source) VALUES (?, ?, 'mindicador.cl')").run(fecha, valor);
  const saved = db.prepare('SELECT obtenido_at FROM uf_cache WHERE fecha = ?').get(fecha);
  return { fecha, valor, updated_at: saved && saved.obtenido_at, cached: false, source: 'mindicador.cl' };
}

function pad(n) {
  return String(n).padStart(2, '0');
}

function round2(n) {
  return Math.round(Number(n) * 100) / 100;
}

function todayParts() {
  const hoy = new Date();
  return {
    anio: hoy.getFullYear(),
    mes: hoy.getMonth() + 1,
    dia: hoy.getDate(),
    iso: `${hoy.getFullYear()}-${pad(hoy.getMonth() + 1)}-${pad(hoy.getDate())}`
  };
}

function ultimoDiaDisponible(anio, mes) {
  const hoy = todayParts();
  const actualAnio = hoy.anio;
  const actualMes = hoy.mes;

  if (anio > actualAnio || (anio === actualAnio && mes > actualMes)) return 0;

  const finMes = new Date(anio, mes, 0).getDate();
  if (anio === actualAnio && mes === actualMes) return Math.min(finMes, hoy.dia);
  return finMes;
}

function resumenValores(valores) {
  if (!valores.length) {
    return {
      inicio_mes: null,
      ultimo_disponible: null,
      maximo: null,
      minimo: null,
      promedio: null
    };
  }

  const nums = valores.map(v => Number(v.valor));
  const total = nums.reduce((sum, n) => sum + n, 0);
  return {
    inicio_mes: round2(valores[0].valor),
    ultimo_disponible: round2(valores[valores.length - 1].valor),
    maximo: round2(Math.max(...nums)),
    minimo: round2(Math.min(...nums)),
    promedio: round2(total / nums.length)
  };
}

function normalizeApiFecha(value) {
  if (!value) return null;
  return String(value).slice(0, 10);
}

function isBetween(fecha, inicio, fin) {
  return fecha >= inicio && fecha <= fin;
}

function parseValorSII(value) {
  const raw = String(value || '').trim();
  if (!raw) return null;
  const normalized = raw.replace(/\./g, '').replace(',', '.');
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function stripHtml(value) {
  return String(value || '').replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').trim();
}

function monthFromSIIBlock(block) {
  const title = block.match(/<h2>([^<]+)<\/h2>/i);
  const monthName = stripHtml(title && title[1]).toLowerCase();
  return MESES_SII[monthName] || null;
}

function parseSIIUFYear(html, anio) {
  const blocks = String(html || '').split(/<div class='meses' id='mes_[^']+'>/i).slice(1);
  const rows = [];

  for (const block of blocks) {
    const mes = monthFromSIIBlock(block);
    if (!mes) continue;

    const pairRegex = /<th[^>]*>\s*<strong>(\d{1,2})<\/strong>\s*<\/th>\s*<td[^>]*>([\s\S]*?)<\/td>/gi;
    let match;
    while ((match = pairRegex.exec(block))) {
      const dia = Number(match[1]);
      const valor = parseValorSII(stripHtml(match[2]));
      if (!Number.isInteger(dia) || dia < 1 || dia > 31 || valor == null) continue;
      rows.push({
        fecha: `${anio}-${pad(mes)}-${pad(dia)}`,
        valor,
        source: 'sii.cl'
      });
    }
  }

  return rows;
}

async function fetchUFYearSII(anio) {
  const { data } = await axios.get(`${SII_BASE}/uf${anio}.htm`, { responseType: 'text', timeout: 15000 });
  const rows = parseSIIUFYear(data, anio);
  if (!rows.length) throw new Error(`SII no publico valores UF para ${anio}`);
  return rows;
}

async function fetchUFYearMindicador(anio) {
  const { data } = await axios.get(`${BASE}/${anio}`, { timeout: 15000 });
  return ((data && data.serie) || [])
    .map(item => ({ fecha: normalizeApiFecha(item.fecha), valor: item.valor, source: 'mindicador.cl' }))
    .filter(item => item.fecha && item.valor != null);
}

async function fetchUFYear(anio) {
  try {
    return await fetchUFYearSII(anio);
  } catch (e) {
    return fetchUFYearMindicador(anio);
  }
}

function saveUFCacheRows(rows) {
  if (!rows.length) return 0;

  const insert = db.prepare(`
    INSERT OR REPLACE INTO uf_cache (fecha, valor, source)
    VALUES (?, ?, ?)
  `);
  const save = db.transaction((items) => {
    for (const item of items) insert.run(item.fecha, item.valor, item.source || 'sii.cl');
  });

  save(rows);
  return rows.length;
}

function getCachedRange(inicio, fin) {
  return db.prepare(`
    SELECT fecha, valor, obtenido_at
    FROM uf_cache
    WHERE fecha BETWEEN ? AND ?
    ORDER BY fecha
  `).all(inicio, fin);
}

async function cacheUFYear(anio, hastaFecha) {
  const serie = await fetchUFYear(anio);
  const inicioAnio = `${anio}-01-01`;
  const finAnio = `${anio}-12-31`;
  const limite = hastaFecha && hastaFecha < finAnio ? hastaFecha : finAnio;
  const rows = serie
    .map(item => ({ fecha: normalizeApiFecha(item.fecha), valor: item.valor, source: item.source || 'sii.cl' }))
    .filter(item => item.fecha && item.valor != null && isBetween(item.fecha, inicioAnio, limite));

  return saveUFCacheRows(rows);
}

async function ensureUFCacheRange(inicio, fin) {
  if (!inicio || !fin || inicio > fin) return { saved: 0, cached: true };

  const cached = getCachedRange(inicio, fin);
  const expectedDays = Math.floor((new Date(fin + 'T00:00:00') - new Date(inicio + 'T00:00:00')) / 86400000) + 1;
  if (cached.length >= expectedDays) return { saved: 0, cached: true };

  const anioInicio = Number(inicio.slice(0, 4));
  const anioFin = Number(fin.slice(0, 4));
  let saved = 0;

  for (let anio = anioInicio; anio <= anioFin; anio++) {
    saved += await cacheUFYear(anio, fin);
  }

  return { saved, cached: false };
}

async function getHistorialUF(anio, mes) {
  const inicio = `${anio}-${pad(mes)}-01`;
  const finMes = new Date(anio, mes, 0).getDate();
  const fin = `${anio}-${pad(mes)}-${pad(finMes)}`;
  if (anio >= CACHE_FROM_YEAR) {
    try {
      await cacheUFYear(anio, fin);
    } catch (e) {
      // Si falla la carga anual, se mantiene el fallback por fecha mas abajo.
    }
  }

  const cachedRows = getCachedRange(inicio, fin);
  const cachedByFecha = new Map(cachedRows.map(row => [row.fecha, row]));
  const valores = [];
  const errores = [];
  const endDay = cachedRows.length
    ? Math.max(...cachedRows.map(row => Number(row.fecha.slice(8, 10))))
    : ultimoDiaDisponible(anio, mes);

  for (let dia = 1; dia <= endDay; dia++) {
    const fecha = `${anio}-${pad(mes)}-${pad(dia)}`;
    const cached = cachedByFecha.get(fecha);
    if (cached) {
      valores.push({
        fecha,
        valor: cached.valor,
        updated_at: cached.obtenido_at || null
      });
      continue;
    }

    try {
      const uf = await getUF(fecha);
      valores.push({
        fecha: uf.fecha,
        valor: uf.valor,
        updated_at: uf.updated_at || null
      });
    } catch (e) {
      errores.push({ fecha, message: e.message });
      break;
    }
  }

  if (!valores.length && errores.length) {
    throw Object.assign(new Error('No se pudo obtener el historial UF para el mes seleccionado'), {
      code: 'UF_UNAVAILABLE',
      details: errores
    });
  }

  return {
    anio,
    mes,
    valores,
    resumen: resumenValores(valores),
    errores
  };
}

async function warmUFCacheDesde2026() {
  const hasta = `${CACHE_TO_YEAR}-12-31`;
  const result = await ensureUFCacheRange(`${CACHE_FROM_YEAR}-01-01`, hasta);

  return { from: CACHE_FROM_YEAR, to: hasta, saved: result.saved };
}

module.exports = { getUF, getHistorialUF, warmUFCacheDesde2026 };
