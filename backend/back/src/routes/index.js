const r = require('express').Router();
const { requireAuth } = require('../services/auth');

r.use('/auth',                   require('./auth'));
r.use(requireAuth);
r.use('/admin',                  require('./admin'));
r.use('/coordinadores',          require('./coordinadores'));
r.use('/clientes',               require('./clientes'));
r.use('/receptores',             require('./receptores'));
r.use('/cp',                     require('./cp'));
r.use('/solicitudes-programadas',require('./solicitudes-programadas'));
r.use('/solicitudes',            require('./solicitudes'));
r.use('/calendario',             require('./calendario'));
r.use('/uf',                     require('./uf'));
r.use('/exportaciones',          require('./exportaciones'));

// Empresas emisoras (solo lectura)
const db = require('../db-async');
const { ok } = require('../middleware/envelope');
r.get('/empresas', async (req, res, next) => {
  try {
    ok(res, await db.all(`
      SELECT *
      FROM empresa_emisora
      WHERE codigo IN ('MAS_CONSULTORES', 'INSTITUTO_ROI')
      ORDER BY CASE codigo WHEN 'MAS_CONSULTORES' THEN 1 WHEN 'INSTITUTO_ROI' THEN 2 ELSE 9 END
    `));
  } catch (error) {
    next(error);
  }
});

module.exports = r;
