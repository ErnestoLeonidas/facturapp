window.AppConfig = {
  apiBase: '/api',
  defaultMoneda: 'CLP',
  empresasEmisoras: [
    { codigo: 'MAS_CONSULTORES',  nombre: 'MAS Consultores S.A.', afectoIva: true,  ivaPct: 0.19 },
    { codigo: 'MAS_CAPACITACION', nombre: 'Más Capacitación',     afectoIva: false, ivaPct: 0    }
  ],
  estadosSolicitud: [
    'Borrador','PendienteDatos','EnRevision','Aprobada','Rechazada',
    'Emitida','Facturada','Anulada','Cerrada'
  ],
  versionPlantilla: 'v1'
};
