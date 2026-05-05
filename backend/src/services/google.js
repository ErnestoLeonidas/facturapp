const path = require('path');
const { google } = require('googleapis');

const SCOPES = [
  'https://www.googleapis.com/auth/spreadsheets.readonly',
  'https://www.googleapis.com/auth/drive.readonly'
];

function serviceAccountPath() {
  const configured = process.env.GOOGLE_SA_JSON_PATH;
  if (!configured) return null;
  return path.isAbsolute(configured) ? configured : path.resolve(process.cwd(), configured);
}

function getAuth() {
  const keyFile = serviceAccountPath();
  if (!keyFile) {
    const err = new Error('Service Account no configurada. Define GOOGLE_SA_JSON_PATH.');
    err.code = 'GOOGLE_AUTH_MISSING';
    throw err;
  }

  return new google.auth.GoogleAuth({ keyFile, scopes: SCOPES });
}

async function getClients() {
  const auth = await getAuth().getClient();
  return {
    sheets: google.sheets({ version: 'v4', auth }),
    drive: google.drive({ version: 'v3', auth })
  };
}

module.exports = { getAuth, getClients, serviceAccountPath };
