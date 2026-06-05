const { requireProductionEnv } = require('./config/env');
const express = require('express');
const cors = require('cors');
const path = require('path');

requireProductionEnv();

const app = express();
const PORT = process.env.PORT || 3000;

const corsOrigin = process.env.CORS_ORIGIN || true;
app.use(cors({
  origin: corsOrigin === 'true' ? true : corsOrigin,
  credentials: true
}));
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

app.get('/api/health', async (req, res) => {
  const db = require('./db-async');
  try {
    await db.get('SELECT 1 AS ok');
    res.json({
      ok: true,
      data: {
        status: 'ok',
        database: db.isPostgres ? 'postgres' : 'sqlite'
      },
      meta: { generatedAt: new Date().toISOString() },
      error: null
    });
  } catch (error) {
    res.status(503).json({
      ok: false,
      data: null,
      meta: { generatedAt: new Date().toISOString() },
      error: { code: 'HEALTHCHECK_FAILED', message: 'Base de datos no disponible' }
    });
  }
});

app.use(require('./services/auth').attachUser);

// API
app.use('/api', require('./routes/index'));

// Frontend — sirve static desde /frontend
const FRONT = path.join(__dirname, '..', '..', 'frontend');
app.use(express.static(FRONT));
app.get('*', (req, res) => res.sendFile(path.join(FRONT, 'index.html')));

// Error handler (debe ir último)
app.use(require('./middleware/errors'));

app.listen(PORT, () => {
  console.log(`FacturApp corriendo en http://localhost:${PORT}`);

  const { warmUFCacheDesde2026 } = require('./services/uf');
  warmUFCacheDesde2026()
    .then(result => console.log(`Cache UF precargado desde ${result.from} hasta ${result.to}: ${result.saved} registros`))
    .catch(e => console.warn('No se pudo precargar cache UF:', e.message));
});

module.exports = app;
