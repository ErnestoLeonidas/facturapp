# Backend — FacturApp

API JSON propia para la web única de solicitudes de facturación.

## Stack objetivo

- Node.js ≥ 20
- Express
- Postgres (vía `pg` o `prisma`) — SQLite válido para arranque
- `exceljs` para exportación XLSX
- `googleapis` para Sheets/Drive
- `axios` para mindicador.cl

## Estructura prevista (a crear en Fase 1)

```
backend/
├── package.json
├── .env.example
├── src/
│   ├── server.js                # arranque Express
│   ├── config/                  # carga .env, sheets.json, etc.
│   ├── db/
│   │   ├── client.js
│   │   └── migrations/
│   ├── middlewares/
│   │   ├── envelope.js          # response wrapper {ok, data, meta, error}
│   │   ├── error.js
│   │   └── auth.js              # fase 2
│   ├── routes/
│   │   ├── clientes.routes.js
│   │   ├── receptores.routes.js
│   │   ├── coordinadores.routes.js
│   │   ├── productos.routes.js
│   │   ├── cp.routes.js
│   │   ├── desarrolladores.routes.js
│   │   ├── solicitudes.routes.js
│   │   ├── solicitudes-programadas.routes.js
│   │   ├── tiempos.routes.js
│   │   ├── reportes.routes.js
│   │   ├── exportaciones.routes.js
│   │   ├── uf.routes.js
│   │   └── integraciones.routes.js
│   ├── services/
│   │   ├── solicitudes.service.js
│   │   ├── estados.service.js   # máquina de estados
│   │   ├── uf.service.js
│   │   ├── sheets.service.js
│   │   ├── drive.service.js
│   │   └── exportador.service.js
│   ├── exportador/
│   │   ├── plantilla-v1.js      # construcción del XLSX réplica
│   │   └── plantilla-v1.json    # layout declarativo
│   ├── jobs/
│   │   ├── generar-recurrentes.job.js
│   │   ├── recordatorio-slack.job.js
│   │   └── sync-sheets.job.js
│   └── utils/
│       ├── folio.js             # SF-2026-XXXXX
│       ├── formatos.js          # CLP, RUT, etc.
│       └── validators.js
├── seed/
│   └── seed.json                # datos iniciales (ver docs/seed-data.md)
└── tests/
    ├── solicitudes.test.js
    ├── estados.test.js
    └── exportador.test.js
```

## Comandos previstos (no implementados aún)

```bash
npm install
cp .env.example .env             # editar con credenciales reales
npm run db:migrate
npm run db:seed
npm run dev                      # nodemon en puerto 3000
npm test
```

## Variables de entorno

Ver `.env.example` (a crear en Fase 1) y `docs/integraciones.md`.

## Endpoints implementados

Ver [docs/contratos-api.md](../docs/contratos-api.md). Esta carpeta está vacía
en Fase 0 — solo contiene esta guía y el `seed/seed.json` de placeholder.
