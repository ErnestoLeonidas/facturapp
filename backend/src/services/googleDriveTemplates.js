const fs = require('fs');
const path = require('path');
const db = require('../db');
const { getClients } = require('./google');

const TEMPLATE_DIR = path.join(__dirname, '..', '..', 'storage', 'plantillas');
const XLSX_MIME = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
const GOOGLE_SHEETS_MIME = 'application/vnd.google-apps.spreadsheet';

function ensureDir() {
  if (!fs.existsSync(TEMPLATE_DIR)) fs.mkdirSync(TEMPLATE_DIR, { recursive: true });
}

function plantillaFileId() {
  return process.env.GOOGLE_DRIVE_PLANTILLA_FILE_ID || null;
}

async function getMetadata(fileId = plantillaFileId()) {
  if (!fileId) {
    const err = new Error('GOOGLE_DRIVE_PLANTILLA_FILE_ID no configurado.');
    err.code = 'DRIVE_CONFIG_MISSING';
    throw err;
  }

  const { drive } = await getClients();
  const response = await drive.files.get({
    fileId,
    fields: 'id,name,mimeType,modifiedTime,version,size,webViewLink'
  });
  return response.data;
}

async function listTemplates(q = 'plantilla solicitud factura') {
  const { drive } = await getClients();
  const response = await drive.files.list({
    q: `name contains '${String(q).replace(/'/g, "\\'")}' and trashed = false`,
    fields: 'files(id,name,mimeType,modifiedTime,webViewLink)',
    pageSize: 20,
    orderBy: 'modifiedTime desc'
  });
  return response.data.files || [];
}

async function downloadTemplate(fileId = plantillaFileId()) {
  const metadata = await getMetadata(fileId);
  ensureDir();

  const { drive } = await getClients();
  const response = metadata.mimeType === GOOGLE_SHEETS_MIME
    ? await drive.files.export({ fileId, mimeType: XLSX_MIME }, { responseType: 'arraybuffer' })
    : await drive.files.get({ fileId, alt: 'media' }, { responseType: 'arraybuffer' });

  const versionId = `drive-${metadata.id}-${Date.now()}`;
  const safeName = metadata.name.replace(/[^\w.-]+/g, '_');
  const filename = `${versionId}-${safeName.endsWith('.xlsx') ? safeName : safeName + '.xlsx'}`;
  const filepath = path.join(TEMPLATE_DIR, filename);
  fs.writeFileSync(filepath, Buffer.from(response.data));

  db.prepare(`
    UPDATE version_plantilla
    SET vigente_hasta = date('now')
    WHERE vigente_hasta IS NULL
  `).run();
  db.prepare(`
    INSERT INTO version_plantilla (id, descripcion, definicion_layout, ruta, vigente_desde)
    VALUES (?, ?, ?, ?, date('now'))
  `).run(versionId, `Plantilla Drive: ${metadata.name}`, JSON.stringify(metadata), filename);

  return {
    id: versionId,
    fileId: metadata.id,
    name: metadata.name,
    mimeType: metadata.mimeType,
    modifiedTime: metadata.modifiedTime,
    ruta: filename
  };
}

module.exports = { getMetadata, listTemplates, downloadTemplate };
