# FacturApp — Grupo MAS

Aplicación web única para gestionar **solicitudes de facturación** de Grupo MAS
(MAS Consultores S.A. y Más Capacitación), reemplazando el flujo actual basado
en plantillas Excel y un bot de Slack.

## Estado

Fase 0 — definición y bases. No hay aplicación ejecutable todavía.
Este repo contiene el plan, los contratos y el esqueleto para iniciar Fase 1.

## Documentos clave (leer en este orden)

1. [PLAN.md](PLAN.md) — plan ejecutable con fases, criterios y riesgos.
2. [deep-research-report.md](deep-research-report.md) — propuesta técnica de fondo.
3. [docs/dominio.md](docs/dominio.md) — modelo conceptual.
4. [docs/plantilla-solicitud-factura.md](docs/plantilla-solicitud-factura.md) — mapeo exacto de la plantilla canónica.
5. [docs/modelo-datos.md](docs/modelo-datos.md) — entidades, relaciones, DDL.
6. [docs/contratos-api.md](docs/contratos-api.md) — endpoints y envelopes JSON.
7. [docs/estados.md](docs/estados.md) — máquina de estados de la solicitud.
8. [docs/integraciones.md](docs/integraciones.md) — UF, Google Sheets/Drive.
9. [docs/pantallas.md](docs/pantallas.md) — vistas y wireframes.
10. [docs/seed-data.md](docs/seed-data.md) — datos iniciales reales.

## Stack objetivo

- **Frontend**: HTML + Bootstrap 5 + jQuery + JS modular. Hash routing. Servido como estático.
- **Backend**: Node.js + Express. Postgres recomendado (SQLite válido para fase 1).
- **Integraciones**: UF oficial SII vía proxy propio con fallback externo; Google Sheets/Drive con Service Account (backend-only).
- **Exportación**: `exceljs` para regenerar la plantilla XLSX idéntica.

## Empezar Fase 1

Ver `PLAN.md` sección 4 (Fase 1) y `backend/README.md`.
