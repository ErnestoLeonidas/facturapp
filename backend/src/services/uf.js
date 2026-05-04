const axios = require('axios');
const db = require('../db');

const BASE = process.env.UF_API_BASE || 'https://mindicador.cl/api/uf';

async function getUF(fecha) {
  const cached = db.prepare('SELECT valor, obtenido_at FROM uf_cache WHERE fecha = ?').get(fecha);
  if (cached) return { fecha, valor: cached.valor, cached: true, source: 'mindicador.cl' };

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

  db.prepare('INSERT OR REPLACE INTO uf_cache (fecha, valor) VALUES (?, ?)').run(fecha, valor);
  return { fecha, valor, cached: false, source: 'mindicador.cl' };
}

module.exports = { getUF };
