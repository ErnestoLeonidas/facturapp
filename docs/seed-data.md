# Datos semilla iniciales

Extraidos inicialmente de `archivos/Base de Datos Bot Facturacion.xlsx`.
La fuente operativa vigente para completar/actualizar el seed es la planilla
Google Sheets:

`https://docs.google.com/spreadsheets/d/1YFn9QfyIympuqS7zeF2jtfSjOTwBI184CP4mkRUB4V0/edit?usp=sharing`

Estos datos alimentan el seeder de Fase 1 (`backend/seed/seed.json`).

## Coordinadores conocidos

| Nombre | Slack ID |
|---|---|
| Macarena Abásolo | U07AKJLQCTY |
| Monica Da Rocha | U09T7NL350T |
| Daniel Llanes | U07AKJLT4G6 |
| Constanza Gaete | U0AR2F4G4F8 |

Email y datos adicionales: por completar antes del seed.

## Clientes activos (19)

Hábitat, Ariztía, Arcor, Aza, Banco Internacional, Beco, Bex, Carozzi, Copec,
Emin, Enaex, Flesan, Magotteaux, Resiter, Salmones Austral, Sigdo Koppers,
Soprole, Transelect.

> ⚠️ El archivo del bot tiene una fila por solicitud — cada cliente aparece
> múltiples veces. La lista anterior se obtuvo de la pestaña `Config` del
> mismo libro (lista canónica).

### Datos por cliente que faltan (por completar antes del seed)

Para cada uno: razón social, RUT, giro, dirección, frecuencia oficial, día de
facturación, mes de inicio, requiere HES (sí/no), coordinador asignado.

Ejemplo confirmado (de la plantilla Soprole noviembre 2025):

```json
{
  "nombre_corto": "Soprole",
  "razon_social": "Soprole S.A.",
  "rut": "76.101.812-4",
  "giro": "Elaboradora de productos lácteos",
  "direccion": "Av. Vitacura 4465, Vitacura",
  "frecuencia": "Mensual",
  "requiere_hes": false,
  "coordinador_slack": "U07AKJLQCTY",
  "area": "MAS Plataformas",
  "receptores": [
    { "nombre": "Jeannette del Carmen Nanjari Barrera", "email": "jeannette.nanjari@soprole.cl" },
    { "nombre": "Pablo Ruedi", "email": "pablo.ruedi@soprole.cl" }
  ],
  "cps": [
    { "codigo": "MS25008", "nombre": "Plataforma Nutrir Soprole — split A" },
    { "codigo": "MS25009", "nombre": "Plataforma Nutrir Soprole — split B" }
  ]
}
```

### Caso especial: Transelect

- `requiere_hes = true` (confirmado por `Inducción de gestión financiera y comercial.docx`).

### Frecuencias observadas en el bot

- Mensual (mayoría)
- Bimensual (al menos Arcor)
- Trimestral (al menos Ariztía)

## Empresas emisoras

| Código interno | Nombre completo | Tributación |
|---|---|---|
| `MAS_CONSULTORES` | MAS Consultores S.A. | Afecto IVA 19% |
| `MAS_CAPACITACIONES` | Más Capacitación | Exento (SENCE / OTEC) |

(Información tributaria a confirmar con Macarena Ayala — RUT, dirección legal, etc., para el header de la exportación.)

## Áreas internas

Conocidas:
- MAS Plataformas
- MAS Capacitación

(Catalogo a confirmar con negocio.)

## Base facturacion Google Sheets

Columnas disponibles: `id`, `cliente_id`, `cliente`, `codigo`, `nombre`,
`tipo_cp`, `tipo_impuesto`, `mes`, `anio`, `monto_uf`, `moneda`, `estado`,
`observaciones`, `fecha_estimada_facturacion`.

Campos que pueden venir vacios y deben tolerarse en el seed/importador:
`mes`, `monto_uf`, `estado`, `observaciones` y
`fecha_estimada_facturacion`.

Uso para seed:

- `cliente_id` + `cliente` crean/actualizan clientes.
- `codigo` + `nombre` + `tipo_cp` crean/actualizan CPs.
- `nombre` puede crear/actualizar catalogo de productos cuando represente un
  servicio facturable.
- `tipo_impuesto`, `moneda` y `monto_uf` alimentan la base de solicitudes o
  plantillas recurrentes.
- `anio` y `mes`, cuando ambos existen, forman el periodo `YYYY-MM`.
- El area del CP no viene en esta planilla; dejarla vacia o completarla desde
  un catalogo interno posterior.

## Plantilla del seed

`backend/seed/seed.json` (placeholder en Fase 0; completar antes de correr Fase 1):

```json
{
  "coordinadores": [],
  "empresas_emisoras": [],
  "clientes": [],
  "receptores": [],
  "cps": [],
  "productos": []
}
```
