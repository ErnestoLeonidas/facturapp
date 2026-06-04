window.AppConfig = {
  apiBase: '/api',
  defaultMoneda: 'CLP',
  features: {
    slackBot: false
  },
  empresasEmisoras: [
    { codigo: 'MAS_CONSULTORES',  nombre: 'MAS Consultores S.A.', afectoIva: true,  ivaPct: 0.19 },
    { codigo: 'INSTITUTO_ROI', nombre: 'Instituto ROI SpA', afectoIva: true, ivaPct: 0.19 }
  ],
  estadosProyecciones: ['PENDIENTE OC / HES', 'FACTURA SOLICITADA'],
  estadosSolicitud: [
    'PENDIENTE OC / HES','FACTURA SOLICITADA',
    'Borrador','PendienteDatos','EnRevision','Aprobada','Rechazada',
    'Emitida','Facturada','Anulada','Cerrada'
  ],
  versionPlantilla: 'v1'
};
