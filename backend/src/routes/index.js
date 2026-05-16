const r = require('express').Router();

r.use('/auth',                   require('./auth'));
r.use('/admin',                  require('./admin'));
r.use('/coordinadores',          require('./coordinadores'));
r.use('/clientes',               require('./clientes'));
r.use('/receptores',             require('./receptores'));
r.use('/cp',                     require('./cp'));
r.use('/productos',              require('./productos'));
r.use('/desarrolladores',        require('./desarrolladores'));
r.use('/solicitudes-programadas',require('./solicitudes-programadas'));
r.use('/solicitudes',            require('./solicitudes'));
r.use('/calendario',             require('./calendario'));
r.use('/tiempos',                require('./tiempos'));
r.use('/uf',                     require('./uf'));
r.use('/reportes',               require('./reportes'));
r.use('/finanzas',               require('./finanzas'));
r.use('/exportaciones',          require('./exportaciones'));
r.use('/integraciones',          require('./integraciones'));

// Empresas emisoras (solo lectura)
const db = require('../db');
const { ok } = require('../middleware/envelope');
r.get('/empresas', (req, res) => ok(res, db.prepare("SELECT * FROM empresa_emisora WHERE codigo = 'MAS_CONSULTORES'").all()));

module.exports = r;
