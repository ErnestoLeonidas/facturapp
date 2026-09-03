--
-- PostgreSQL database dump
--

\restrict Hq22ZIh1h1bTNtNMca8XAmMfLVbgRBHa2e7kyUrqmElkike9B1fAB5FsCPelNcr

-- Dumped from database version 16.14
-- Dumped by pg_dump version 16.14

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

ALTER TABLE IF EXISTS ONLY public.solicitud_receptor DROP CONSTRAINT IF EXISTS solicitud_receptor_solicitud_id_fkey;
ALTER TABLE IF EXISTS ONLY public.solicitud_receptor DROP CONSTRAINT IF EXISTS solicitud_receptor_receptor_id_fkey;
ALTER TABLE IF EXISTS ONLY public.solicitud_programada DROP CONSTRAINT IF EXISTS solicitud_programada_cliente_id_fkey;
ALTER TABLE IF EXISTS ONLY public.solicitud_item DROP CONSTRAINT IF EXISTS solicitud_item_solicitud_id_fkey;
ALTER TABLE IF EXISTS ONLY public.solicitud_item DROP CONSTRAINT IF EXISTS solicitud_item_producto_id_fkey;
ALTER TABLE IF EXISTS ONLY public.solicitud_factura DROP CONSTRAINT IF EXISTS solicitud_factura_empresa_emisora_fkey;
ALTER TABLE IF EXISTS ONLY public.solicitud_factura DROP CONSTRAINT IF EXISTS solicitud_factura_coordinador_id_fkey;
ALTER TABLE IF EXISTS ONLY public.solicitud_factura DROP CONSTRAINT IF EXISTS solicitud_factura_cliente_id_fkey;
ALTER TABLE IF EXISTS ONLY public.solicitud_cp DROP CONSTRAINT IF EXISTS solicitud_cp_solicitud_id_fkey;
ALTER TABLE IF EXISTS ONLY public.solicitud_cp DROP CONSTRAINT IF EXISTS solicitud_cp_cp_id_fkey;
ALTER TABLE IF EXISTS ONLY public.slack_notificacion_log DROP CONSTRAINT IF EXISTS slack_notificacion_log_solicitud_id_fkey;
ALTER TABLE IF EXISTS ONLY public.slack_notificacion_log DROP CONSTRAINT IF EXISTS slack_notificacion_log_coordinador_id_fkey;
ALTER TABLE IF EXISTS ONLY public.registro_tiempo DROP CONSTRAINT IF EXISTS registro_tiempo_solicitud_id_fkey;
ALTER TABLE IF EXISTS ONLY public.registro_tiempo DROP CONSTRAINT IF EXISTS registro_tiempo_desarrollador_id_fkey;
ALTER TABLE IF EXISTS ONLY public.receptor DROP CONSTRAINT IF EXISTS receptor_cliente_id_fkey;
ALTER TABLE IF EXISTS ONLY public.proyeccion_mensual DROP CONSTRAINT IF EXISTS proyeccion_mensual_item_id_fkey;
ALTER TABLE IF EXISTS ONLY public.proyeccion_item DROP CONSTRAINT IF EXISTS proyeccion_item_version_id_fkey;
ALTER TABLE IF EXISTS ONLY public.proyeccion_item DROP CONSTRAINT IF EXISTS proyeccion_item_cliente_id_fkey;
ALTER TABLE IF EXISTS ONLY public.proyeccion_facturacion DROP CONSTRAINT IF EXISTS proyeccion_facturacion_cliente_id_fkey;
ALTER TABLE IF EXISTS ONLY public.proyeccion_configuracion DROP CONSTRAINT IF EXISTS proyeccion_configuracion_cliente_id_fkey;
ALTER TABLE IF EXISTS ONLY public.proyeccion DROP CONSTRAINT IF EXISTS proyeccion_cliente_id_fkey;
ALTER TABLE IF EXISTS ONLY public.historial_estado DROP CONSTRAINT IF EXISTS historial_estado_solicitud_id_fkey;
ALTER TABLE IF EXISTS ONLY public.documento_exportado DROP CONSTRAINT IF EXISTS documento_exportado_solicitud_id_fkey;
ALTER TABLE IF EXISTS ONLY public.cp DROP CONSTRAINT IF EXISTS cp_cliente_id_fkey;
ALTER TABLE IF EXISTS ONLY public.cliente_producto DROP CONSTRAINT IF EXISTS cliente_producto_producto_id_fkey;
ALTER TABLE IF EXISTS ONLY public.cliente_producto DROP CONSTRAINT IF EXISTS cliente_producto_cliente_id_fkey;
ALTER TABLE IF EXISTS ONLY public.cliente_facturacion DROP CONSTRAINT IF EXISTS cliente_facturacion_cliente_id_fkey;
ALTER TABLE IF EXISTS ONLY public.cliente DROP CONSTRAINT IF EXISTS cliente_coordinador_id_fkey;
ALTER TABLE IF EXISTS ONLY public.cliente_coordinador DROP CONSTRAINT IF EXISTS cliente_coordinador_cp_id_fkey;
ALTER TABLE IF EXISTS ONLY public.cliente_coordinador DROP CONSTRAINT IF EXISTS cliente_coordinador_coordinador_id_fkey;
ALTER TABLE IF EXISTS ONLY public.cliente_coordinador DROP CONSTRAINT IF EXISTS cliente_coordinador_cliente_id_fkey;
ALTER TABLE IF EXISTS ONLY public.asignacion_solicitud DROP CONSTRAINT IF EXISTS asignacion_solicitud_solicitud_id_fkey;
ALTER TABLE IF EXISTS ONLY public.asignacion_solicitud DROP CONSTRAINT IF EXISTS asignacion_solicitud_desarrollador_id_fkey;
ALTER TABLE IF EXISTS ONLY public.app_user DROP CONSTRAINT IF EXISTS app_user_coordinador_id_fkey;
ALTER TABLE IF EXISTS ONLY public.app_session DROP CONSTRAINT IF EXISTS app_session_user_id_fkey;
DROP TRIGGER IF EXISTS trg_solicitud_receptor_cliente_update ON public.solicitud_receptor;
DROP TRIGGER IF EXISTS trg_solicitud_receptor_cliente_insert ON public.solicitud_receptor;
DROP TRIGGER IF EXISTS trg_solicitud_programada_cliente_update ON public.solicitud_factura;
DROP TRIGGER IF EXISTS trg_solicitud_programada_cliente_insert ON public.solicitud_factura;
DROP TRIGGER IF EXISTS trg_solicitud_cp_cliente_update ON public.solicitud_cp;
DROP TRIGGER IF EXISTS trg_solicitud_cp_cliente_insert ON public.solicitud_cp;
DROP TRIGGER IF EXISTS trg_solicitud_cliente_facturacion_update ON public.solicitud_factura;
DROP TRIGGER IF EXISTS trg_solicitud_cliente_facturacion_insert ON public.solicitud_factura;
DROP INDEX IF EXISTS public.uq_solicitud_cp_solicitud_cp;
DROP INDEX IF EXISTS public.uq_receptor_cliente_email_activo;
DROP INDEX IF EXISTS public.uq_proyeccion_version_activa_anio;
DROP INDEX IF EXISTS public.uq_proyeccion_version_activa;
DROP INDEX IF EXISTS public.uq_proyeccion_uf_anio_mes;
DROP INDEX IF EXISTS public.uq_proyeccion_natural;
DROP INDEX IF EXISTS public.uq_proyeccion_configuracion_natural;
DROP INDEX IF EXISTS public.uq_proyeccion_admin_natural;
DROP INDEX IF EXISTS public.idx_solicitud_cp_solicitud_orden;
DROP INDEX IF EXISTS public.idx_solicitud_cp_cp;
DROP INDEX IF EXISTS public.idx_sol_updated_at;
DROP INDEX IF EXISTS public.idx_sol_programada_periodo;
DROP INDEX IF EXISTS public.idx_sol_programada;
DROP INDEX IF EXISTS public.idx_sol_periodo_estado;
DROP INDEX IF EXISTS public.idx_sol_is_delete;
DROP INDEX IF EXISTS public.idx_sol_fecha;
DROP INDEX IF EXISTS public.idx_sol_estado;
DROP INDEX IF EXISTS public.idx_sol_empresa_periodo;
DROP INDEX IF EXISTS public.idx_sol_coordinador_periodo;
DROP INDEX IF EXISTS public.idx_sol_cliente_facturacion;
DROP INDEX IF EXISTS public.idx_sol_cliente;
DROP INDEX IF EXISTS public.idx_slack_log_status;
DROP INDEX IF EXISTS public.idx_slack_log_solicitud;
DROP INDEX IF EXISTS public.idx_receptor_cli;
DROP INDEX IF EXISTS public.idx_proyeccion_mensual_item_mes;
DROP INDEX IF EXISTS public.idx_proyeccion_item_version;
DROP INDEX IF EXISTS public.idx_proyeccion_item_orden_fila;
DROP INDEX IF EXISTS public.idx_proyeccion_auxiliar_anio_hoja;
DROP INDEX IF EXISTS public.idx_proyeccion_admin_filtros;
DROP INDEX IF EXISTS public.idx_proyeccion_admin_cliente_id;
DROP INDEX IF EXISTS public.idx_proy_tipo_facturacion;
DROP INDEX IF EXISTS public.idx_proy_source_updated;
DROP INDEX IF EXISTS public.idx_proy_periodo_tipo_estado;
DROP INDEX IF EXISTS public.idx_proy_estado;
DROP INDEX IF EXISTS public.idx_proy_codigo;
DROP INDEX IF EXISTS public.idx_proy_cliente_periodo;
DROP INDEX IF EXISTS public.idx_proy_cliente_codigo_periodo;
DROP INDEX IF EXISTS public.idx_hist_sol;
DROP INDEX IF EXISTS public.idx_hist_fecha;
DROP INDEX IF EXISTS public.idx_hist_estado_hacia;
DROP INDEX IF EXISTS public.idx_doc_version;
DROP INDEX IF EXISTS public.idx_doc_solicitud;
DROP INDEX IF EXISTS public.idx_doc_checksum;
DROP INDEX IF EXISTS public.idx_cp_tipo;
DROP INDEX IF EXISTS public.idx_cp_cliente_codigo;
DROP INDEX IF EXISTS public.idx_cp_cli;
DROP INDEX IF EXISTS public.idx_cliente_facturacion_cliente;
DROP INDEX IF EXISTS public.idx_cliente_estado;
DROP INDEX IF EXISTS public.idx_cliente_coordinador;
DROP INDEX IF EXISTS public.idx_cliente_coord_cp_nombre;
DROP INDEX IF EXISTS public.idx_cliente_coord_cp;
DROP INDEX IF EXISTS public.idx_cliente_coord_cliente;
DROP INDEX IF EXISTS public.idx_catalogo_tipo_impuesto_activo;
DROP INDEX IF EXISTS public.idx_catalogo_tipo_cp_activo;
DROP INDEX IF EXISTS public.idx_catalogo_estado_grupo;
DROP INDEX IF EXISTS public.idx_bitacora_integracion;
DROP INDEX IF EXISTS public.idx_bitacora_estado;
DROP INDEX IF EXISTS public.idx_bitacora_dataset;
DROP INDEX IF EXISTS public.idx_audit_entidad;
DROP INDEX IF EXISTS public.idx_audit_created;
DROP INDEX IF EXISTS public.idx_app_user_username_unique;
DROP INDEX IF EXISTS public.idx_app_user_coordinador;
DROP INDEX IF EXISTS public.idx_app_session_user;
ALTER TABLE IF EXISTS ONLY public.version_plantilla DROP CONSTRAINT IF EXISTS version_plantilla_pkey;
ALTER TABLE IF EXISTS ONLY public.uf_cache DROP CONSTRAINT IF EXISTS uf_cache_pkey;
ALTER TABLE IF EXISTS ONLY public.solicitud_receptor DROP CONSTRAINT IF EXISTS solicitud_receptor_pkey;
ALTER TABLE IF EXISTS ONLY public.solicitud_programada DROP CONSTRAINT IF EXISTS solicitud_programada_pkey;
ALTER TABLE IF EXISTS ONLY public.solicitud_item DROP CONSTRAINT IF EXISTS solicitud_item_pkey;
ALTER TABLE IF EXISTS ONLY public.solicitud_factura DROP CONSTRAINT IF EXISTS solicitud_factura_pkey;
ALTER TABLE IF EXISTS ONLY public.solicitud_factura DROP CONSTRAINT IF EXISTS solicitud_factura_folio_key;
ALTER TABLE IF EXISTS ONLY public.solicitud_cp DROP CONSTRAINT IF EXISTS solicitud_cp_pkey;
ALTER TABLE IF EXISTS ONLY public.slack_notificacion_log DROP CONSTRAINT IF EXISTS slack_notificacion_log_pkey;
ALTER TABLE IF EXISTS ONLY public.schema_migrations DROP CONSTRAINT IF EXISTS schema_migrations_pkey;
ALTER TABLE IF EXISTS ONLY public.registro_tiempo DROP CONSTRAINT IF EXISTS registro_tiempo_pkey;
ALTER TABLE IF EXISTS ONLY public.receptor DROP CONSTRAINT IF EXISTS receptor_pkey;
ALTER TABLE IF EXISTS ONLY public.proyeccion_version DROP CONSTRAINT IF EXISTS proyeccion_version_pkey;
ALTER TABLE IF EXISTS ONLY public.proyeccion_version DROP CONSTRAINT IF EXISTS proyeccion_version_anio_numero_key;
ALTER TABLE IF EXISTS ONLY public.proyeccion_uf DROP CONSTRAINT IF EXISTS proyeccion_uf_pkey;
ALTER TABLE IF EXISTS ONLY public.proyeccion_uf DROP CONSTRAINT IF EXISTS proyeccion_uf_anio_mes_key;
ALTER TABLE IF EXISTS ONLY public.proyeccion DROP CONSTRAINT IF EXISTS proyeccion_pkey;
ALTER TABLE IF EXISTS ONLY public.proyeccion_mensual DROP CONSTRAINT IF EXISTS proyeccion_mensual_pkey;
ALTER TABLE IF EXISTS ONLY public.proyeccion_mensual DROP CONSTRAINT IF EXISTS proyeccion_mensual_item_id_mes_key;
ALTER TABLE IF EXISTS ONLY public.proyeccion_item DROP CONSTRAINT IF EXISTS proyeccion_item_pkey;
ALTER TABLE IF EXISTS ONLY public.proyeccion_facturacion DROP CONSTRAINT IF EXISTS proyeccion_facturacion_pkey;
ALTER TABLE IF EXISTS ONLY public.proyeccion_configuracion DROP CONSTRAINT IF EXISTS proyeccion_configuracion_pkey;
ALTER TABLE IF EXISTS ONLY public.proyeccion_auxiliar DROP CONSTRAINT IF EXISTS proyeccion_auxiliar_pkey;
ALTER TABLE IF EXISTS ONLY public.producto DROP CONSTRAINT IF EXISTS producto_pkey;
ALTER TABLE IF EXISTS ONLY public.producto DROP CONSTRAINT IF EXISTS producto_codigo_key;
ALTER TABLE IF EXISTS ONLY public.historial_estado DROP CONSTRAINT IF EXISTS historial_estado_pkey;
ALTER TABLE IF EXISTS ONLY public.empresa_emisora DROP CONSTRAINT IF EXISTS empresa_emisora_pkey;
ALTER TABLE IF EXISTS ONLY public.documento_exportado DROP CONSTRAINT IF EXISTS documento_exportado_pkey;
ALTER TABLE IF EXISTS ONLY public.desarrollador DROP CONSTRAINT IF EXISTS desarrollador_pkey;
ALTER TABLE IF EXISTS ONLY public.cp DROP CONSTRAINT IF EXISTS cp_pkey;
ALTER TABLE IF EXISTS ONLY public.cp DROP CONSTRAINT IF EXISTS cp_codigo_key;
ALTER TABLE IF EXISTS ONLY public.coordinador DROP CONSTRAINT IF EXISTS coordinador_pkey;
ALTER TABLE IF EXISTS ONLY public.cliente_producto DROP CONSTRAINT IF EXISTS cliente_producto_pkey;
ALTER TABLE IF EXISTS ONLY public.cliente_producto DROP CONSTRAINT IF EXISTS cliente_producto_cliente_id_producto_id_key;
ALTER TABLE IF EXISTS ONLY public.cliente DROP CONSTRAINT IF EXISTS cliente_pkey;
ALTER TABLE IF EXISTS ONLY public.cliente DROP CONSTRAINT IF EXISTS cliente_nombre_corto_key;
ALTER TABLE IF EXISTS ONLY public.cliente_facturacion DROP CONSTRAINT IF EXISTS cliente_facturacion_pkey;
ALTER TABLE IF EXISTS ONLY public.cliente_coordinador DROP CONSTRAINT IF EXISTS cliente_coordinador_pkey;
ALTER TABLE IF EXISTS ONLY public.cliente_coordinador DROP CONSTRAINT IF EXISTS cliente_coordinador_cliente_id_coordinador_id_cp_id_key;
ALTER TABLE IF EXISTS ONLY public.catalogo_tipo_impuesto DROP CONSTRAINT IF EXISTS catalogo_tipo_impuesto_pkey;
ALTER TABLE IF EXISTS ONLY public.catalogo_tipo_cp DROP CONSTRAINT IF EXISTS catalogo_tipo_cp_pkey;
ALTER TABLE IF EXISTS ONLY public.catalogo_tipo_cp DROP CONSTRAINT IF EXISTS catalogo_tipo_cp_nombre_key;
ALTER TABLE IF EXISTS ONLY public.catalogo_estado_solicitud DROP CONSTRAINT IF EXISTS catalogo_estado_solicitud_pkey;
ALTER TABLE IF EXISTS ONLY public.bitacora_integracion DROP CONSTRAINT IF EXISTS bitacora_integracion_pkey;
ALTER TABLE IF EXISTS ONLY public.audit_log DROP CONSTRAINT IF EXISTS audit_log_pkey;
ALTER TABLE IF EXISTS ONLY public.asignacion_solicitud DROP CONSTRAINT IF EXISTS asignacion_solicitud_pkey;
ALTER TABLE IF EXISTS ONLY public.app_user DROP CONSTRAINT IF EXISTS app_user_pkey;
ALTER TABLE IF EXISTS ONLY public.app_user DROP CONSTRAINT IF EXISTS app_user_email_key;
ALTER TABLE IF EXISTS ONLY public.app_session DROP CONSTRAINT IF EXISTS app_session_pkey;
ALTER TABLE IF EXISTS ONLY public.app_config DROP CONSTRAINT IF EXISTS app_config_pkey;
DROP TABLE IF EXISTS public.version_plantilla;
DROP TABLE IF EXISTS public.uf_cache;
DROP TABLE IF EXISTS public.solicitud_receptor;
DROP TABLE IF EXISTS public.solicitud_programada;
DROP TABLE IF EXISTS public.solicitud_item;
DROP TABLE IF EXISTS public.solicitud_factura;
DROP TABLE IF EXISTS public.solicitud_cp;
DROP TABLE IF EXISTS public.slack_notificacion_log;
DROP TABLE IF EXISTS public.schema_migrations;
DROP TABLE IF EXISTS public.registro_tiempo;
DROP TABLE IF EXISTS public.receptor;
DROP TABLE IF EXISTS public.proyeccion_version;
DROP TABLE IF EXISTS public.proyeccion_uf;
DROP TABLE IF EXISTS public.proyeccion_mensual;
DROP TABLE IF EXISTS public.proyeccion_item;
DROP TABLE IF EXISTS public.proyeccion_facturacion;
DROP TABLE IF EXISTS public.proyeccion_configuracion;
DROP TABLE IF EXISTS public.proyeccion_auxiliar;
DROP TABLE IF EXISTS public.proyeccion;
DROP TABLE IF EXISTS public.producto;
DROP TABLE IF EXISTS public.historial_estado;
DROP TABLE IF EXISTS public.empresa_emisora;
DROP TABLE IF EXISTS public.documento_exportado;
DROP TABLE IF EXISTS public.desarrollador;
DROP TABLE IF EXISTS public.cp;
DROP TABLE IF EXISTS public.coordinador;
DROP TABLE IF EXISTS public.cliente_producto;
DROP TABLE IF EXISTS public.cliente_facturacion;
DROP TABLE IF EXISTS public.cliente_coordinador;
DROP TABLE IF EXISTS public.cliente;
DROP TABLE IF EXISTS public.catalogo_tipo_impuesto;
DROP TABLE IF EXISTS public.catalogo_tipo_cp;
DROP TABLE IF EXISTS public.catalogo_estado_solicitud;
DROP TABLE IF EXISTS public.bitacora_integracion;
DROP TABLE IF EXISTS public.audit_log;
DROP TABLE IF EXISTS public.asignacion_solicitud;
DROP TABLE IF EXISTS public.app_user;
DROP TABLE IF EXISTS public.app_session;
DROP TABLE IF EXISTS public.app_config;
DROP FUNCTION IF EXISTS public.enforce_solicitud_receptor_cliente();
DROP FUNCTION IF EXISTS public.enforce_solicitud_programada_cliente();
DROP FUNCTION IF EXISTS public.enforce_solicitud_cp_cliente();
DROP FUNCTION IF EXISTS public.enforce_solicitud_cliente_facturacion();
DROP EXTENSION IF EXISTS pgcrypto;
--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- Name: enforce_solicitud_cliente_facturacion(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.enforce_solicitud_cliente_facturacion() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
      BEGIN
        IF NEW.cliente_facturacion_id IS NOT NULL
          AND NOT EXISTS (
            SELECT 1
            FROM cliente_facturacion cf
            WHERE cf.id = NEW.cliente_facturacion_id
              AND cf.cliente_id = NEW.cliente_id
              AND cf.activo = 1
          ) THEN
          RAISE EXCEPTION 'Datos de facturacion no pertenecen al cliente de la solicitud';
        END IF;
        RETURN NEW;
      END;
      $$;


--
-- Name: enforce_solicitud_cp_cliente(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.enforce_solicitud_cp_cliente() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
      BEGIN
        IF (
          SELECT cp.cliente_id
          FROM cp
          WHERE cp.id = NEW.cp_id
        ) IS DISTINCT FROM (
          SELECT sf.cliente_id
          FROM solicitud_factura sf
          WHERE sf.id = NEW.solicitud_id
        ) THEN
          RAISE EXCEPTION 'CP no pertenece al cliente de la solicitud';
        END IF;
        RETURN NEW;
      END;
      $$;


--
-- Name: enforce_solicitud_programada_cliente(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.enforce_solicitud_programada_cliente() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
      BEGIN
        IF NEW.programada_id IS NOT NULL
          AND NOT EXISTS (
            SELECT 1
            FROM solicitud_programada sp
            WHERE sp.id = NEW.programada_id
              AND sp.cliente_id = NEW.cliente_id
          ) THEN
          RAISE EXCEPTION 'Solicitud programada no pertenece al cliente de la solicitud';
        END IF;
        RETURN NEW;
      END;
      $$;


--
-- Name: enforce_solicitud_receptor_cliente(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.enforce_solicitud_receptor_cliente() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
      BEGIN
        IF (
          SELECT r.cliente_id
          FROM receptor r
          WHERE r.id = NEW.receptor_id
        ) IS DISTINCT FROM (
          SELECT sf.cliente_id
          FROM solicitud_factura sf
          WHERE sf.id = NEW.solicitud_id
        ) THEN
          RAISE EXCEPTION 'Receptor no pertenece al cliente de la solicitud';
        END IF;
        RETURN NEW;
      END;
      $$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: app_config; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.app_config (
    key text NOT NULL,
    value text,
    updated_at text DEFAULT (CURRENT_TIMESTAMP)::text
);


--
-- Name: app_session; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.app_session (
    token text NOT NULL,
    user_id text NOT NULL,
    created_at text DEFAULT (CURRENT_TIMESTAMP)::text,
    expires_at text,
    revoked_at text
);


--
-- Name: app_user; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.app_user (
    id text NOT NULL,
    nombre text NOT NULL,
    email text NOT NULL,
    rol text NOT NULL,
    password_hash text NOT NULL,
    password_salt text NOT NULL,
    activo integer DEFAULT 1 NOT NULL,
    created_at text DEFAULT (CURRENT_TIMESTAMP)::text,
    updated_at text DEFAULT (CURRENT_TIMESTAMP)::text,
    username text,
    coordinador_id text,
    CONSTRAINT app_user_rol_check CHECK ((rol = ANY (ARRAY['admin'::text, 'usuario'::text])))
);


--
-- Name: asignacion_solicitud; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.asignacion_solicitud (
    id text NOT NULL,
    solicitud_id text NOT NULL,
    desarrollador_id text NOT NULL,
    rol text,
    horas_estimadas real,
    activo integer DEFAULT 1 NOT NULL
);


--
-- Name: audit_log; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.audit_log (
    id text NOT NULL,
    usuario_id text,
    usuario_email text,
    accion text NOT NULL,
    entidad text NOT NULL,
    entidad_id text,
    detalle text,
    created_at text DEFAULT (CURRENT_TIMESTAMP)::text
);


--
-- Name: bitacora_integracion; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.bitacora_integracion (
    id text NOT NULL,
    integracion text NOT NULL,
    dataset text NOT NULL,
    estado text NOT NULL,
    mensaje text,
    filas_leidas integer DEFAULT 0,
    filas_procesadas integer DEFAULT 0,
    detalles text,
    iniciado_at text DEFAULT (CURRENT_TIMESTAMP)::text,
    finalizado_at text
);


--
-- Name: catalogo_estado_solicitud; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.catalogo_estado_solicitud (
    codigo text NOT NULL,
    nombre text NOT NULL,
    grupo text,
    orden integer DEFAULT 0,
    activo integer DEFAULT 1 NOT NULL
);


--
-- Name: catalogo_tipo_cp; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.catalogo_tipo_cp (
    codigo text NOT NULL,
    nombre text NOT NULL,
    activo integer DEFAULT 1 NOT NULL
);


--
-- Name: catalogo_tipo_impuesto; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.catalogo_tipo_impuesto (
    codigo text NOT NULL,
    nombre text NOT NULL,
    afecto_iva integer DEFAULT 0 NOT NULL,
    activo integer DEFAULT 1 NOT NULL
);


--
-- Name: cliente; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cliente (
    id text NOT NULL,
    nombre_corto text NOT NULL,
    razon_social text,
    rut text,
    giro text,
    direccion text,
    coordinador_id text,
    frecuencia text DEFAULT 'Mensual'::text,
    dia_facturacion integer,
    mes_inicio integer,
    requiere_hes integer DEFAULT 0 NOT NULL,
    estado text DEFAULT 'Activo'::text NOT NULL,
    notas text,
    created_at text DEFAULT (CURRENT_TIMESTAMP)::text,
    updated_at text DEFAULT (CURRENT_TIMESTAMP)::text
);


--
-- Name: cliente_coordinador; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cliente_coordinador (
    id text NOT NULL,
    cliente_id text NOT NULL,
    coordinador_id text NOT NULL,
    cp_id text,
    activo integer DEFAULT 1 NOT NULL,
    created_at text DEFAULT (CURRENT_TIMESTAMP)::text,
    cp_nombre text
);


--
-- Name: cliente_facturacion; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cliente_facturacion (
    id text NOT NULL,
    cliente_id text NOT NULL,
    etiqueta text,
    razon_social text NOT NULL,
    rut text,
    giro text,
    direccion text,
    activo integer DEFAULT 1 NOT NULL,
    created_at text DEFAULT (CURRENT_TIMESTAMP)::text,
    updated_at text DEFAULT (CURRENT_TIMESTAMP)::text
);


--
-- Name: cliente_producto; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cliente_producto (
    id text NOT NULL,
    cliente_id text NOT NULL,
    producto_id text NOT NULL,
    vigencia_desde text,
    vigencia_hasta text,
    condiciones text,
    activo integer DEFAULT 1 NOT NULL,
    created_at text DEFAULT (CURRENT_TIMESTAMP)::text
);


--
-- Name: coordinador; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.coordinador (
    id text NOT NULL,
    nombre text NOT NULL,
    email text,
    slack_user_id text,
    activo integer DEFAULT 1 NOT NULL,
    created_at text DEFAULT (CURRENT_TIMESTAMP)::text
);


--
-- Name: cp; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cp (
    id text NOT NULL,
    codigo text NOT NULL,
    nombre text,
    tipo_cp text,
    area text,
    cliente_id text,
    activo integer DEFAULT 1 NOT NULL,
    created_at text DEFAULT (CURRENT_TIMESTAMP)::text
);


--
-- Name: desarrollador; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.desarrollador (
    id text NOT NULL,
    nombre text NOT NULL,
    email text,
    equipo text,
    activo integer DEFAULT 1 NOT NULL,
    created_at text DEFAULT (CURRENT_TIMESTAMP)::text
);


--
-- Name: documento_exportado; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.documento_exportado (
    id text NOT NULL,
    solicitud_id text NOT NULL,
    tipo text DEFAULT 'solicitud_factura_xlsx'::text,
    formato text DEFAULT 'xlsx'::text,
    version_plantilla text,
    ruta text,
    checksum text,
    generado_at text DEFAULT (CURRENT_TIMESTAMP)::text,
    generado_por text
);


--
-- Name: empresa_emisora; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.empresa_emisora (
    codigo text NOT NULL,
    razon_social text NOT NULL,
    rut text,
    giro text,
    direccion text,
    telefono text,
    afecto_iva integer DEFAULT 1 NOT NULL,
    iva_pct real DEFAULT 0.19 NOT NULL
);


--
-- Name: historial_estado; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.historial_estado (
    id text NOT NULL,
    solicitud_id text NOT NULL,
    estado_desde text,
    estado_hacia text NOT NULL,
    fecha text DEFAULT (CURRENT_TIMESTAMP)::text,
    usuario text,
    comentario text
);


--
-- Name: producto; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.producto (
    id text NOT NULL,
    codigo text,
    nombre text NOT NULL,
    categoria text,
    activo integer DEFAULT 1 NOT NULL,
    created_at text DEFAULT (CURRENT_TIMESTAMP)::text
);


--
-- Name: proyeccion; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.proyeccion (
    id text NOT NULL,
    anio integer NOT NULL,
    iva text,
    ms text,
    proyecto text,
    cliente_id text,
    cliente text,
    dp text,
    cp text,
    producto text,
    tipo_cp text,
    venta real,
    mes integer NOT NULL,
    monto real,
    monto_uf real,
    monto_clp_referencia real,
    estado text,
    source text,
    source_row integer,
    created_at text DEFAULT (CURRENT_TIMESTAMP)::text,
    updated_at text DEFAULT (CURRENT_TIMESTAMP)::text
);


--
-- Name: proyeccion_auxiliar; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.proyeccion_auxiliar (
    id text NOT NULL,
    anio integer NOT NULL,
    hoja text NOT NULL,
    fila integer NOT NULL,
    data_json text NOT NULL,
    source text,
    created_at text DEFAULT (CURRENT_TIMESTAMP)::text
);


--
-- Name: proyeccion_configuracion; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.proyeccion_configuracion (
    id text NOT NULL,
    cliente_id text,
    ms text,
    anio integer NOT NULL,
    modo_uf text DEFAULT 'PROYECTADA'::text NOT NULL,
    uf_fija_default real,
    created_at text DEFAULT (CURRENT_TIMESTAMP)::text,
    updated_at text DEFAULT (CURRENT_TIMESTAMP)::text
);


--
-- Name: proyeccion_facturacion; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.proyeccion_facturacion (
    id text NOT NULL,
    cliente_id text NOT NULL,
    cliente text,
    codigo text,
    nombre text,
    tipo_cp text,
    tipo_impuesto text,
    mes text,
    anio integer,
    monto_uf real,
    moneda text,
    estado text,
    observaciones text,
    fecha_estimada_facturacion text,
    codigo_facturacion text,
    source text,
    updated_at text DEFAULT (CURRENT_TIMESTAMP)::text
);


--
-- Name: proyeccion_item; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.proyeccion_item (
    id text NOT NULL,
    version_id text NOT NULL,
    iva text,
    proyecto text,
    ms text,
    cliente_id text,
    cliente text,
    dp text,
    cp text,
    producto text,
    tipo_cp text,
    venta real,
    created_at text DEFAULT (CURRENT_TIMESTAMP)::text,
    updated_at text DEFAULT (CURRENT_TIMESTAMP)::text,
    orden_fila integer
);


--
-- Name: proyeccion_mensual; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.proyeccion_mensual (
    id text NOT NULL,
    item_id text NOT NULL,
    mes integer NOT NULL,
    cantidad_uf real,
    uf_fija real,
    uf_proyectada real,
    uf_manual real,
    monto_clp real,
    monto_clp_manual real,
    modo_calculo text DEFAULT 'MANUAL_CLP'::text NOT NULL,
    submodo_uf text,
    origen_valor text DEFAULT 'APP'::text NOT NULL,
    es_manual integer DEFAULT 0 NOT NULL,
    observacion text,
    created_at text DEFAULT (CURRENT_TIMESTAMP)::text,
    updated_at text DEFAULT (CURRENT_TIMESTAMP)::text,
    CONSTRAINT proyeccion_mensual_mes_check CHECK (((mes >= 1) AND (mes <= 12))),
    CONSTRAINT proyeccion_mensual_modo_calculo_check CHECK ((modo_calculo = ANY (ARRAY['UF_PROYECTADA'::text, 'UF_FIJA'::text, 'MANUAL_UF'::text, 'MANUAL_CLP'::text]))),
    CONSTRAINT proyeccion_mensual_origen_valor_check CHECK ((origen_valor = ANY (ARRAY['APP'::text, 'EXCEL_IMPORTADO'::text, 'RECALCULADO'::text, 'MANUAL_UF'::text, 'MANUAL_CLP'::text]))),
    CONSTRAINT proyeccion_mensual_submodo_uf_check CHECK (((submodo_uf IS NULL) OR (submodo_uf = ANY (ARRAY['UF_FIJA'::text, 'UF_PROYECTADA'::text]))))
);


--
-- Name: proyeccion_uf; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.proyeccion_uf (
    id text NOT NULL,
    anio integer NOT NULL,
    mes integer NOT NULL,
    uf_fija real,
    uf_proyectada real,
    uf_manual real,
    origen_valor text DEFAULT 'PROYECTADA'::text NOT NULL,
    observaciones text,
    created_at text DEFAULT (CURRENT_TIMESTAMP)::text,
    updated_at text DEFAULT (CURRENT_TIMESTAMP)::text
);


--
-- Name: proyeccion_version; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.proyeccion_version (
    id text NOT NULL,
    numero integer NOT NULL,
    nombre text NOT NULL,
    fecha_version text NOT NULL,
    anio integer NOT NULL,
    descripcion text,
    activa integer DEFAULT 0 NOT NULL,
    origen text DEFAULT 'APP'::text NOT NULL,
    created_by text,
    created_at text DEFAULT (CURRENT_TIMESTAMP)::text,
    meta_anual real
);


--
-- Name: receptor; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.receptor (
    id text NOT NULL,
    cliente_id text NOT NULL,
    nombre text NOT NULL,
    email text NOT NULL,
    cargo text,
    activo integer DEFAULT 1 NOT NULL,
    created_at text DEFAULT (CURRENT_TIMESTAMP)::text
);


--
-- Name: registro_tiempo; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.registro_tiempo (
    id text NOT NULL,
    solicitud_id text NOT NULL,
    desarrollador_id text NOT NULL,
    fecha text NOT NULL,
    minutos integer NOT NULL,
    descripcion text,
    aprobado integer DEFAULT 0 NOT NULL,
    created_at text DEFAULT (CURRENT_TIMESTAMP)::text,
    CONSTRAINT registro_tiempo_minutos_check CHECK ((minutos > 0))
);


--
-- Name: schema_migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.schema_migrations (
    version text NOT NULL,
    name text NOT NULL,
    checksum text,
    applied_at text DEFAULT (CURRENT_TIMESTAMP)::text
);


--
-- Name: slack_notificacion_log; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.slack_notificacion_log (
    id text NOT NULL,
    solicitud_id text,
    channel_id text,
    coordinador_id text,
    slack_user_id text,
    message_ts text,
    status text NOT NULL,
    error text,
    texto text,
    created_at text DEFAULT (CURRENT_TIMESTAMP)::text
);


--
-- Name: solicitud_cp; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.solicitud_cp (
    id text NOT NULL,
    solicitud_id text NOT NULL,
    cp_id text NOT NULL,
    monto_uf real,
    monto_clp real NOT NULL,
    orden integer DEFAULT 0,
    monto_clp_manual real,
    monto_clp_es_manual integer DEFAULT 0 NOT NULL
);


--
-- Name: solicitud_factura; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.solicitud_factura (
    id text NOT NULL,
    folio text NOT NULL,
    tipo text DEFAULT 'mensual'::text NOT NULL,
    cliente_id text NOT NULL,
    coordinador_id text,
    empresa_emisora text NOT NULL,
    periodo text NOT NULL,
    fecha_solicitud text NOT NULL,
    fecha_facturacion text,
    oc_numero text,
    contrato_numero text,
    hes_numero text,
    glosa text NOT NULL,
    area text,
    moneda_base text DEFAULT 'CLP'::text NOT NULL,
    uf_fecha text,
    uf_valor real,
    monto_neto_clp real DEFAULT 0,
    monto_iva_clp real DEFAULT 0,
    monto_total_clp real DEFAULT 0,
    observaciones text,
    estado text DEFAULT 'Borrador'::text NOT NULL,
    is_delete integer DEFAULT 0 NOT NULL,
    version_plantilla text DEFAULT 'v1'::text,
    programada_id text,
    created_at text DEFAULT (CURRENT_TIMESTAMP)::text,
    updated_at text DEFAULT (CURRENT_TIMESTAMP)::text,
    admin_batch_id text,
    origen_admin text,
    monto_neto_clp_manual real,
    cliente_facturacion_id text
);


--
-- Name: solicitud_item; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.solicitud_item (
    id text NOT NULL,
    solicitud_id text NOT NULL,
    producto_id text,
    descripcion text NOT NULL,
    codigo_ref text,
    cantidad real DEFAULT 1,
    uf_unitaria real,
    clp_unitario real,
    subtotal_clp real DEFAULT 0,
    orden integer DEFAULT 0
);


--
-- Name: solicitud_programada; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.solicitud_programada (
    id text NOT NULL,
    cliente_id text NOT NULL,
    nombre text NOT NULL,
    dia_emision integer,
    frecuencia text DEFAULT 'Mensual'::text,
    mes_inicio integer,
    activa integer DEFAULT 1 NOT NULL,
    payload_base text,
    proxima_generacion text,
    created_at text DEFAULT (CURRENT_TIMESTAMP)::text,
    updated_at text DEFAULT (CURRENT_TIMESTAMP)::text
);


--
-- Name: solicitud_receptor; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.solicitud_receptor (
    solicitud_id text NOT NULL,
    receptor_id text NOT NULL
);


--
-- Name: uf_cache; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.uf_cache (
    fecha text NOT NULL,
    valor real NOT NULL,
    source text DEFAULT 'mindicador.cl'::text,
    obtenido_at text DEFAULT (CURRENT_TIMESTAMP)::text
);


--
-- Name: version_plantilla; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.version_plantilla (
    id text NOT NULL,
    descripcion text,
    definicion_layout text,
    ruta text,
    vigente_desde text,
    vigente_hasta text,
    created_at text DEFAULT (CURRENT_TIMESTAMP)::text
);


--
-- Data for Name: app_config; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.app_config (key, value, updated_at) FROM stdin;
slack_version_config	00b1eef8-912c-4306-b299-6badee18d76d	2026-06-03 19:21:00.079324+00
slack_habilitado	0	2026-06-03 19:37:18
slack_channel_id	C09P7PNF7GA	2026-06-03 19:37:18
slack_dias_anticipacion	5	2026-06-03 19:37:18
slack_base_url		2026-06-03 19:37:18
slack_mensaje_intro	es momento de revisar esta solicitud de factura.	2026-06-03 19:37:18
slack_mensaje_pie	Actualiza el estado directamente en FactuFlow.	2026-06-03 19:37:18
\.


--
-- Data for Name: app_session; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.app_session (token, user_id, created_at, expires_at, revoked_at) FROM stdin;
b04e0900bbe3cf539b835742162035d06043133dca1b69ba020d59ee900a8f75	f2d059c3-a4f4-4fcb-8d15-260d794337f0	2026-06-03 19:30:18.766192+00	2026-06-04 07:30:18	2026-06-09 21:20:10
bb1daa6ed6119cef119b7b2a0410a5decb17f70f537c4f34c2da9f9d87007816	f2d059c3-a4f4-4fcb-8d15-260d794337f0	2026-06-03 19:30:40.645219+00	2026-06-04 07:30:40	2026-06-09 21:20:10
c9c86959ccf9535385565e36c8768897d413f77d66bdbd0d49faee705e3f6c0b	f2d059c3-a4f4-4fcb-8d15-260d794337f0	2026-06-03 19:33:26.143787+00	2026-06-04 07:33:26	2026-06-09 21:20:10
59c4e1d820fcdb05a25b9137f896de0305d5e27383d0a9145a4ee430457942ab	f2d059c3-a4f4-4fcb-8d15-260d794337f0	2026-06-03 19:36:02.111698+00	2026-06-04 07:36:02	2026-06-09 21:20:10
eb717f2d9b310264efe43c8baab759d8e8698bb01b07fd700685ad957bd84907	f2d059c3-a4f4-4fcb-8d15-260d794337f0	2026-06-03 19:37:17.855321+00	2026-06-04 07:37:17	2026-06-09 21:20:10
9a11b1f65e0ae8b86f5bc8cecbe4df16303793642866323a4baca4e265b7030d	f2d059c3-a4f4-4fcb-8d15-260d794337f0	2026-06-03 20:05:49.557251+00	2026-06-04 08:05:49	2026-06-09 21:20:10
89216d6337317ff645c5f9911ea043fe21d95f78878c1158ced705b7886a4a3e	f2d059c3-a4f4-4fcb-8d15-260d794337f0	2026-06-04 04:09:24.928607+00	2026-06-04 16:09:24	2026-06-09 21:20:10
6e71f136613782a817baac5b9b917865e83302934dc507009f8dbfb9b49df801	f2d059c3-a4f4-4fcb-8d15-260d794337f0	2026-06-04 04:10:58.852531+00	2026-06-04 16:10:58	2026-06-09 21:20:10
b258791cf16c4fabc984ef4349ad95ddd1bbd30d55a5c4d79e00f3635d87d9d3	0de5b205-9bfd-426d-a9ba-4315e76e950a	2026-06-09 21:19:25.117807+00	2026-06-10 09:19:25	2026-06-09 21:20:14
a32cce11c17cc6c2c18647a51a08358e9190498ce56886f671edf88e414199db	5071125a-d19e-4d26-a846-5e4d8f1bab1b	2026-06-03 19:30:18.848524+00	2026-06-04 07:30:18	2026-06-09 21:20:41
7e8ff8840bc26d130156be8f1e995d9b733923d786bf83a5c1d3435f9eda7bd4	5071125a-d19e-4d26-a846-5e4d8f1bab1b	2026-06-03 19:30:40.676123+00	2026-06-04 07:30:40	2026-06-09 21:20:41
f15f7a8f826243f6c617a5dfb3dab1e4e064c29257e481a0f1d3728d3bfe07f9	5071125a-d19e-4d26-a846-5e4d8f1bab1b	2026-06-03 19:33:26.44986+00	2026-06-04 07:33:26	2026-06-09 21:20:41
778d0325a90a4f5b7fdf8c6de0cc5317610a52c0bf63e8493c59f85ccede69c9	5071125a-d19e-4d26-a846-5e4d8f1bab1b	2026-06-03 19:36:02.158331+00	2026-06-04 07:36:02	2026-06-09 21:20:41
7cc57eba753fd04c3f06dcac5ca3a1d966c7c29bf2650915d2e360123d5d13ed	5071125a-d19e-4d26-a846-5e4d8f1bab1b	2026-06-03 19:37:17.902385+00	2026-06-04 07:37:17	2026-06-09 21:20:41
61a80e2198b6f37ae6480abba3da3240aee996669bcc660ae6049dc3f8a4c922	0de5b205-9bfd-426d-a9ba-4315e76e950a	2026-06-09 21:15:59.564734+00	2026-06-10 09:15:59	2026-06-09 21:38:18
460bdf12100a412ce0674ca9eade587cd474aa89c8a517eb22b16b9c41839519	0de5b205-9bfd-426d-a9ba-4315e76e950a	2026-06-09 21:22:33.869534+00	2026-06-10 09:22:33	2026-06-09 21:38:18
c7d2d1e37f391f12e889c8414bb6a38c0ca5ebf8965ec0d74cf2c2f0c4428e79	f2d059c3-a4f4-4fcb-8d15-260d794337f0	2026-06-10 15:32:16.446166+00	2026-06-11 03:32:16	\N
574f8ca52ab93fd1f94357ca42a93759203c34ac7bea379fcb7392f029562e4d	f2d059c3-a4f4-4fcb-8d15-260d794337f0	2026-06-10 15:32:27.640871+00	2026-06-11 03:32:27	2026-06-10 15:32:27
98a40cdbfbe31a92118daf9f0402af10d634c749ec63d5c8f84ce014f4e92732	f2d059c3-a4f4-4fcb-8d15-260d794337f0	2026-06-10 15:50:10.706251+00	2026-06-11 03:50:10	2026-06-10 15:50:10
0671124681998a65b49befe550003a7afce6dfa33914daaac5d48f25be23fef1	f2d059c3-a4f4-4fcb-8d15-260d794337f0	2026-06-09 21:20:17.756146+00	2026-06-10 09:20:17	2026-06-25 14:55:14
4d642e8057577fdc8809d5467418901948633d9f19a6ca937be8d4138c4eb4ac	13bee0c7-947b-4ce5-9eba-417767b58d44	2026-06-03 19:30:18.872737+00	2026-06-04 07:30:18	2026-06-25 15:07:07
5edb7ba861460eeb84215f7ef45ccdae48426ac0b1dfca972f7dfbf0e9d60589	13bee0c7-947b-4ce5-9eba-417767b58d44	2026-06-04 04:10:47.266424+00	2026-06-04 16:10:47	2026-06-25 15:07:07
d22920b283a648c3d7214e54fa1001bbbedcb6a3aafa7e8374cd85fef78fb5c1	f2d059c3-a4f4-4fcb-8d15-260d794337f0	2026-06-25 15:06:18.450654+00	2026-06-26 03:06:18	2026-06-25 15:07:10
ed3da94b1c8a5b019a0d06a23914d2392fdf1d7e81bad89a6d021e8085a92999	13bee0c7-947b-4ce5-9eba-417767b58d44	2026-06-25 15:07:13.596543+00	2026-06-26 03:07:13	2026-06-25 17:16:10
4eae49cf0076b2819940f3e7c047cb9726147d37ad3589bcdd4144443beec60b	be214d76-f315-452c-8cc6-0c5200ffb053	2026-06-25 17:16:11.042869+00	2026-06-26 05:16:11	2026-06-25 17:17:32
b4cb9059932c02006babd21947997863672e3511f8fee7abe3d0eb4747411644	0de5b205-9bfd-426d-a9ba-4315e76e950a	2026-06-25 17:17:32.880048+00	2026-06-26 05:17:32	2026-06-25 17:22:09
2cce5a269f9b717f21d8f667f3802005082d6885f280cc505ea1360882c36699	be214d76-f315-452c-8cc6-0c5200ffb053	2026-06-25 17:17:32.639473+00	2026-06-26 05:17:32	2026-06-25 17:22:09
cdb300435060fb5ed489565c13caf437a94b0a3ae65678bdb2356cc7d1bfc948	f2d059c3-a4f4-4fcb-8d15-260d794337f0	2026-06-25 17:22:09.16788+00	2026-06-26 05:22:09	\N
fe6b8e72a38100c57bf76c94515730e605fd00b7488ab3076154537b8f039fc3	63a8f210-66a1-4534-abc4-3282ea3c117f	2026-06-25 17:22:09.217102+00	2026-06-26 05:22:09	\N
3287c94c52de32349fd8e1ed359a0636e4b5eb72c0102c6a969d0b8cee52c54a	0de5b205-9bfd-426d-a9ba-4315e76e950a	2026-06-25 17:22:09.236143+00	2026-06-26 05:22:09	\N
46f58f20ccac1d9717571bd437d3f73baad82864d2401c03f3d7a567f1ba47e5	be214d76-f315-452c-8cc6-0c5200ffb053	2026-06-25 17:22:09.255228+00	2026-06-26 05:22:09	\N
68c136f6eb1c900740feabf4f438ec193dab6286cc221553b75baa1dbbb08192	be214d76-f315-452c-8cc6-0c5200ffb053	2026-06-25 17:22:09.275622+00	2026-06-26 05:22:09	\N
275c10630aae5177d4997771df35405c8b3c59549a0d205638ebc027beaa3a93	be214d76-f315-452c-8cc6-0c5200ffb053	2026-06-25 17:23:29.858676+00	2026-06-26 05:23:29	\N
bb5e8f0a8dead0b293921a0919311f1cbd7ff4eb1696ac779a587b1e6604e410	be214d76-f315-452c-8cc6-0c5200ffb053	2026-06-25 17:23:46.110305+00	2026-06-26 05:23:46	\N
b70c63cd2e0249101569e88949c8b791a0f166f686adac0f3baac15d59fad078	13bee0c7-947b-4ce5-9eba-417767b58d44	2026-06-25 15:27:20.567207+00	2026-06-26 03:27:20	2026-06-25 19:59:22
913946bf905677eefaf6aeac246a532a23785c46f02ff7528f675037c92facf7	be214d76-f315-452c-8cc6-0c5200ffb053	2026-06-25 19:59:48.291853+00	2026-06-26 07:59:48	2026-06-26 13:31:32
2e9d7018d8d63a2bcebf36ed5e8522a53431d471f1ed0b9c24d5f3b9e15fec21	be214d76-f315-452c-8cc6-0c5200ffb053	2026-06-26 15:15:14.662612+00	2026-06-27 03:15:14	\N
2905bba0387101b535514e9c8a118832bb8f35a2f647a936eb5523bd0943098c	be214d76-f315-452c-8cc6-0c5200ffb053	2026-06-26 13:31:35.206405+00	2026-06-27 01:31:35	2026-06-26 15:18:17
d2dd1ce1467f459f033c80ccc4b0ad1fbe93c8d970adc44ec86bbfe5f0c7f0d2	be214d76-f315-452c-8cc6-0c5200ffb053	2026-06-26 15:18:18.105739+00	2026-06-27 03:18:18	2026-06-26 15:22:46
2668c16dc094aba088e8e6ad625de2b98ba97af6b73fa50d7d1627c2411af6c2	be214d76-f315-452c-8cc6-0c5200ffb053	2026-06-26 15:51:10.118436+00	2026-06-27 03:51:10	\N
943faba355a8de9211b8632d797946a9cbe4554e0930fbb988f685f911b3083a	be214d76-f315-452c-8cc6-0c5200ffb053	2026-06-26 15:51:25.61615+00	2026-06-27 03:51:25	\N
70af8ac370e7f8bb50b6c7baeb5856d275e9144625cd678a58d41932d429c97c	be214d76-f315-452c-8cc6-0c5200ffb053	2026-06-26 15:52:56.057475+00	2026-06-27 03:52:56	\N
8477ced31a41e11eb29706c457d3ce47bacb7db99abe0938a91f239cd1080b10	be214d76-f315-452c-8cc6-0c5200ffb053	2026-06-26 15:53:21.063533+00	2026-06-27 03:53:21	\N
28febdc4c26a7325868b1f30ab81a99fd0d9aab3595b4eb351ffd507b574e5a9	f2d059c3-a4f4-4fcb-8d15-260d794337f0	2026-06-26 15:53:42.109563+00	2026-06-27 03:53:42	\N
5a04819dcc73c87c27fcbde4326de3398a01dc6ca28d1b6f55a709e7d3c0aefb	be214d76-f315-452c-8cc6-0c5200ffb053	2026-06-26 15:22:48.299187+00	2026-06-27 03:22:48	2026-06-26 16:08:59
e4ad431820f77034eabb1d06f52f590d12da9fb5400d77e02a7df99e0c3db16c	be214d76-f315-452c-8cc6-0c5200ffb053	2026-06-26 16:09:00.45053+00	2026-06-27 04:09:00	2026-06-26 16:17:04
103ab0596912b3608f6355b6fbae8a8f9faa51b3a1b1a090f7ff15058555fcb2	be214d76-f315-452c-8cc6-0c5200ffb053	2026-06-26 16:43:20.190685+00	2026-06-27 04:43:20	\N
3b0ef6ef99c101844ffaf791a74153bad0d3f0aafcd8dfe93f812299351a21d7	be214d76-f315-452c-8cc6-0c5200ffb053	2026-06-26 16:44:19.313181+00	2026-06-27 04:44:19	\N
85cf381edf6ef564ccf62e6aaa09c516c764133461feeb4008fe24059df4c214	be214d76-f315-452c-8cc6-0c5200ffb053	2026-06-26 16:17:19.657559+00	2026-06-27 04:17:19	2026-06-26 16:54:41
be52156938aee588c7b8fea20da535bc82058743b3fe816105865dcc9ddb5fd9	be214d76-f315-452c-8cc6-0c5200ffb053	2026-06-26 20:17:11.047169+00	2026-06-27 08:17:11	\N
45cb4df0fc7f238f3fc1c053294c3034c64d4f3a5333c5d0bcf1bdd907e74b87	be214d76-f315-452c-8cc6-0c5200ffb053	2026-06-26 16:54:42.835788+00	2026-06-27 04:54:42	2026-07-01 16:41:00
de2fe1d925c08bca4b58a0af3e410758bad1943aacd95fc99c05021212974cf2	be214d76-f315-452c-8cc6-0c5200ffb053	2026-07-01 16:56:50.863887+00	2026-07-02 04:56:50	\N
8534cf472d96194782301d81f6768eff8ce2868b03523792769d9c1d1c3af40c	be214d76-f315-452c-8cc6-0c5200ffb053	2026-07-01 16:59:40.382846+00	2026-07-02 04:59:40	\N
c0cf505c985c11890feaf4d5dbdab3eded99aa15f620da4524ee505c031e67ee	be214d76-f315-452c-8cc6-0c5200ffb053	2026-07-01 16:59:46.733349+00	2026-07-02 04:59:46	\N
3733988820483e749adcf44b5d9164add794cef8466e2ebd0313754ef8043f48	be214d76-f315-452c-8cc6-0c5200ffb053	2026-07-01 17:00:33.71838+00	2026-07-02 05:00:33	\N
b9ee4deaef83d3d5e1bf8da4e2295802304fc0b524f36d5045a1da6fdafa7df6	be214d76-f315-452c-8cc6-0c5200ffb053	2026-07-01 16:41:01.775341+00	2026-07-02 04:41:01	2026-07-01 17:49:10
2d93aa00530a8c71c840641fc0f71ebf1ef8b589194106ca64beabfde9576d2f	be214d76-f315-452c-8cc6-0c5200ffb053	2026-07-01 17:49:11.641064+00	2026-07-02 05:49:11	2026-07-01 17:50:25
6f39545fea7065bacc0092e44d3d5596cb95c1a4d0451e5747a6ab136b7ae25f	be214d76-f315-452c-8cc6-0c5200ffb053	2026-07-01 17:51:35.405782+00	2026-07-02 05:51:35	2026-07-01 17:52:45
d0458291b5edacc74ba1180988c9dbbae54bf58dc6533229825b0475dfc079af	be214d76-f315-452c-8cc6-0c5200ffb053	2026-07-01 17:53:04.442033+00	2026-07-02 05:53:04	2026-07-01 17:54:04
3b5122c71b6b24c20b567b90b689eaf5514c076fd7cdef07d41aaf77e3a38273	be214d76-f315-452c-8cc6-0c5200ffb053	2026-07-01 17:56:01.622036+00	2026-07-02 05:56:01	\N
34b63c51d1c8ffef7ccf6edc8901a40255397a6135970f0382cc63efb24f1899	be214d76-f315-452c-8cc6-0c5200ffb053	2026-07-01 17:58:37.068005+00	2026-07-02 05:58:37	\N
a3cd7c017ae06f77c8c91f6b176ef423401489bf6ec6bf185eae925d846efe4e	be214d76-f315-452c-8cc6-0c5200ffb053	2026-07-01 17:59:09.726389+00	2026-07-02 05:59:09	\N
b6c883dd71e0c0bf3c6ada9210d6e12d88243c792d32fd61d5b6ae97a3dcac4a	be214d76-f315-452c-8cc6-0c5200ffb053	2026-07-07 15:40:00.985517+00	2026-07-08 03:40:00	\N
71f4088b4d8c2fa892b879e2a40594317e91f9f44a48135bbeb8be2a987046bd	0de5b205-9bfd-426d-a9ba-4315e76e950a	2026-07-07 15:45:06.902457+00	2026-07-08 03:45:06	2026-07-07 15:45:07
02271ef846c02b7fb7aa8d926518dab457d39eaeffc4a59c9275762fdc291556	be214d76-f315-452c-8cc6-0c5200ffb053	2026-07-07 17:04:47.429948+00	2026-07-08 05:04:47	\N
91084877a326122de29cbff3b6208a4c03a75ac8fe2eca1d6a0c0596daddc561	be214d76-f315-452c-8cc6-0c5200ffb053	2026-07-07 17:08:30.868715+00	2026-07-08 05:08:30	\N
4b1fb0daf8788223416260dde76074eed09cae984d2205de7fc8f8419637b6e4	be214d76-f315-452c-8cc6-0c5200ffb053	2026-07-07 17:10:02.379081+00	2026-07-08 05:10:02	\N
d9fe1691a91c7a47eb72f15cc6e6131e3b82a000f0fa38595eb8103e1b2666dc	be214d76-f315-452c-8cc6-0c5200ffb053	2026-07-07 17:11:07.265104+00	2026-07-08 05:11:07	\N
788299b6a679e60ae977bad6a00a637aa24eff4089822b778685be7ed3c84811	be214d76-f315-452c-8cc6-0c5200ffb053	2026-07-07 17:11:18.266904+00	2026-07-08 05:11:18	\N
073b70b30186f5a1b91116570bdb3793f839205a02239d5e11a148a65eefaa4a	be214d76-f315-452c-8cc6-0c5200ffb053	2026-07-07 17:11:38.809603+00	2026-07-08 05:11:38	\N
8cf0a205bc34e119c3a04280a5a04793a46909a1086d6bdf1e0802e3114facd5	be214d76-f315-452c-8cc6-0c5200ffb053	2026-07-07 17:13:33.475881+00	2026-07-08 05:13:33	\N
ae90601f6d00a0a11a888685cde744cca9ad5c1e0df671137a07895659038917	be214d76-f315-452c-8cc6-0c5200ffb053	2026-07-07 17:15:23.845386+00	2026-07-08 05:15:23	\N
\.


--
-- Data for Name: app_user; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.app_user (id, nombre, email, rol, password_hash, password_salt, activo, created_at, updated_at, username, coordinador_id) FROM stdin;
d83789ba-ebbc-4a62-b4de-95b2f66772f0	Macarena Abasolo	mabasolo	usuario	23b2e49cb68e34290300eeb0f55f9dab5affd52a747339249475b80451ed2d67	facturapp-mabasolo-mas2026	0	2026-06-03 19:20:59.98001+00	2026-06-25 17:22:09	mabasolo	coor_001
e4bd45b5-2318-4984-8608-92eff79e5905	Monica Da Rocha	mdarocha	usuario	ac958cb044c512a386114dc4d93ec49edc32a7895975472e4bff7e1e2a5bb3bb	facturapp-mdarocha-mas2026	0	2026-06-03 19:20:59.98001+00	2026-06-25 17:22:09	mdarocha	coor_002
5071125a-d19e-4d26-a846-5e4d8f1bab1b	Usuario General	usuario	usuario	2fbcfd2af36e9151a08364423d3d4f85baa25bdd4faa47fb0ce9a8c26634501c	facturapp-usuario-mas2026	0	2026-06-03 19:20:59.718602+00	2026-06-25 17:22:09	usuario	\N
f2d059c3-a4f4-4fcb-8d15-260d794337f0	Constanza Gaete	gconstanzabelen@gmail.com	admin	f99134180a8a0349b8c67c594e4b55a29d044a3bdee86c4b70e6d344d599069c	facturapp-cgaete-mas2026	1	2026-06-03 19:20:59.811851+00	2026-06-25 17:22:08	cgaete	coor_004
63a8f210-66a1-4534-abc4-3282ea3c117f	Valeria Giannattasio	valgian	admin	52a752b83f85ba318879810511321515caa11f3250564380bbbdf4eb4bc13ac2	facturapp-vgianna-mas2026	1	2026-06-03 19:20:59.811851+00	2026-06-25 17:22:08	valgian	\N
0de5b205-9bfd-426d-a9ba-4315e76e950a	Administrador	admin@facturapp.local	admin	d36715abdd009df8ce47b82f18a9c864718aeb4465c8a53488b36bf4a0fbbc72	factuflow-password-XGXKvWwSWfGo1rNu2H4WPw	1	2026-06-03 19:20:59.718602+00	2026-06-25 17:22:08	admin	\N
be214d76-f315-452c-8cc6-0c5200ffb053	Usuario Plataforma	plataformas	usuario	1b8bdf09849c7596ccda26ea4828a3abc969be63da610bf4225499699cc1f514	factuflow-password-nCNElpvU2pGUXpWiPtYtKQ	1	2026-06-25 17:16:10.92409+00	2026-06-25 17:22:09	plataformas	\N
13bee0c7-947b-4ce5-9eba-417767b58d44	Daniel Llanes	dllanes	usuario	e58af840817aae095a06b2cd8d0864003a4b2bd2a63c8721e74ee5df0f3daf87	facturapp-dllanes-05e93f9c4875655a	0	2026-06-03 19:20:59.98001+00	2026-06-25 17:22:09	dllanes	coor_003
\.


--
-- Data for Name: asignacion_solicitud; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.asignacion_solicitud (id, solicitud_id, desarrollador_id, rol, horas_estimadas, activo) FROM stdin;
\.


--
-- Data for Name: audit_log; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.audit_log (id, usuario_id, usuario_email, accion, entidad, entidad_id, detalle, created_at) FROM stdin;
a0624918-eeea-4c66-9691-82895002583b	f2d059c3-a4f4-4fcb-8d15-260d794337f0	cgaete	login	auth	f2d059c3-a4f4-4fcb-8d15-260d794337f0	{"username":"cgaete","email":"cgaete"}	2026-06-03 19:30:18.77066+00
842d180f-f520-49a3-8091-6dd624c551a8	5071125a-d19e-4d26-a846-5e4d8f1bab1b	usuario	login	auth	5071125a-d19e-4d26-a846-5e4d8f1bab1b	{"username":"usuario","email":"usuario"}	2026-06-03 19:30:18.851185+00
c2e76e0b-a9d1-4089-8707-caef68b4d26d	13bee0c7-947b-4ce5-9eba-417767b58d44	dllanes	login	auth	13bee0c7-947b-4ce5-9eba-417767b58d44	{"username":"dllanes","email":"dllanes"}	2026-06-03 19:30:18.875119+00
e49132c0-1749-4784-a74d-7d93f2516d2e	f2d059c3-a4f4-4fcb-8d15-260d794337f0	cgaete	login	auth	f2d059c3-a4f4-4fcb-8d15-260d794337f0	{"username":"cgaete","email":"cgaete"}	2026-06-03 19:30:40.64863+00
702c04ab-a1a9-4c97-86de-edb6053780f6	5071125a-d19e-4d26-a846-5e4d8f1bab1b	usuario	login	auth	5071125a-d19e-4d26-a846-5e4d8f1bab1b	{"username":"usuario","email":"usuario"}	2026-06-03 19:30:40.678849+00
54115f96-b0de-4964-98ed-6f18912da6f6	f2d059c3-a4f4-4fcb-8d15-260d794337f0	cgaete	login	auth	f2d059c3-a4f4-4fcb-8d15-260d794337f0	{"username":"cgaete","email":"cgaete"}	2026-06-03 19:33:26.148106+00
511c9a50-2e31-4042-b84c-59737a9fdf59	5071125a-d19e-4d26-a846-5e4d8f1bab1b	usuario	login	auth	5071125a-d19e-4d26-a846-5e4d8f1bab1b	{"username":"usuario","email":"usuario"}	2026-06-03 19:33:26.452703+00
ed8fc25e-b08c-487c-aab8-ef6a8ad4d06c	f2d059c3-a4f4-4fcb-8d15-260d794337f0	cgaete	login	auth	f2d059c3-a4f4-4fcb-8d15-260d794337f0	{"username":"cgaete","email":"cgaete"}	2026-06-03 19:36:02.115372+00
5e7017b8-aadb-46a7-8526-ab4cd0fa8fb5	5071125a-d19e-4d26-a846-5e4d8f1bab1b	usuario	login	auth	5071125a-d19e-4d26-a846-5e4d8f1bab1b	{"username":"usuario","email":"usuario"}	2026-06-03 19:36:02.16067+00
3d2b37aa-bb76-44fa-a370-2256eeb82b5c	f2d059c3-a4f4-4fcb-8d15-260d794337f0	cgaete	crear	solicitud_factura	f3b23bbf-cd71-43ad-812c-408e03f11b13	{"folio":"SF-2026-00001","periodo":"2026-06","cliente_id":"753b22f8-0d48-423b-9ccb-c4eff869e7b8"}	2026-06-03 19:36:02.247218+00
b0381d87-cad9-48c2-a8c3-b8fb2cfbb48f	f2d059c3-a4f4-4fcb-8d15-260d794337f0	cgaete	editar	solicitud_factura	f3b23bbf-cd71-43ad-812c-408e03f11b13	{"folio":"SF-2026-00001","fields":["observaciones","receptores","monto_neto_clp_manual","cps","glosa"]}	2026-06-03 19:36:02.295129+00
77afb26b-b126-4d62-948a-fc5abfec8191	f2d059c3-a4f4-4fcb-8d15-260d794337f0	cgaete	login	auth	f2d059c3-a4f4-4fcb-8d15-260d794337f0	{"username":"cgaete","email":"cgaete"}	2026-06-03 19:37:17.858821+00
d3031353-efc6-43f9-a5a3-ea318151e3a9	5071125a-d19e-4d26-a846-5e4d8f1bab1b	usuario	login	auth	5071125a-d19e-4d26-a846-5e4d8f1bab1b	{"username":"usuario","email":"usuario"}	2026-06-03 19:37:17.904836+00
a1528e4f-7fe7-4198-b49f-2622440c07ff	f2d059c3-a4f4-4fcb-8d15-260d794337f0	cgaete	crear	solicitud_factura	e060a61c-8237-4383-8cbd-4506a2e7f8df	{"folio":"SF-2026-00001","periodo":"2026-06","cliente_id":"83ef5062-dfb7-4f0d-aa91-5686c581f8c5"}	2026-06-03 19:37:17.967323+00
afc6fce4-6952-4dc5-adaf-3b2b1f814779	f2d059c3-a4f4-4fcb-8d15-260d794337f0	cgaete	editar	solicitud_factura	e060a61c-8237-4383-8cbd-4506a2e7f8df	{"folio":"SF-2026-00001","fields":["observaciones","receptores","monto_neto_clp_manual","cps","glosa"]}	2026-06-03 19:37:18.013993+00
cc9801c1-8cc6-48e0-b7bd-b49f85a012ca	f2d059c3-a4f4-4fcb-8d15-260d794337f0	cgaete	guardar_config_slack	app_config	slack	{"channel_id":"C_SMOKE","dias_anticipacion":30,"habilitado":false}	2026-06-03 19:37:18.280869+00
0ba317c0-730f-47f7-9fd9-2036ed597da6	f2d059c3-a4f4-4fcb-8d15-260d794337f0	cgaete	guardar_config_slack	app_config	slack	{"channel_id":"C09P7PNF7GA","dias_anticipacion":5,"habilitado":false}	2026-06-03 19:37:18.323177+00
304de393-f79b-4ad3-a168-4aab045987b8	f2d059c3-a4f4-4fcb-8d15-260d794337f0	cgaete	login	auth	f2d059c3-a4f4-4fcb-8d15-260d794337f0	{"username":"cgaete","email":"cgaete"}	2026-06-03 20:05:49.562258+00
8b3b8e24-0145-4569-a969-95afef0716fd	f2d059c3-a4f4-4fcb-8d15-260d794337f0	gconstanzabelen@gmail.com	login	auth	f2d059c3-a4f4-4fcb-8d15-260d794337f0	{"username":"cgaete","email":"gconstanzabelen@gmail.com"}	2026-06-04 04:09:24.944301+00
9e191547-6347-4ca8-80f1-059725416e39	f2d059c3-a4f4-4fcb-8d15-260d794337f0	gconstanzabelen@gmail.com	cambiar_password_usuario	app_user	13bee0c7-947b-4ce5-9eba-417767b58d44	{"username":"dllanes"}	2026-06-04 04:10:33.798202+00
07797b6f-0a67-4320-af21-559cd0781fbd	13bee0c7-947b-4ce5-9eba-417767b58d44	dllanes	login	auth	13bee0c7-947b-4ce5-9eba-417767b58d44	{"username":"dllanes","email":"dllanes"}	2026-06-04 04:10:47.268395+00
ee718753-8831-4e92-b03f-6dc7230c0c97	f2d059c3-a4f4-4fcb-8d15-260d794337f0	gconstanzabelen@gmail.com	login	auth	f2d059c3-a4f4-4fcb-8d15-260d794337f0	{"username":"cgaete","email":"gconstanzabelen@gmail.com"}	2026-06-04 04:10:58.854478+00
0a113766-1aeb-4fcb-9cb1-f7dea352e295	0de5b205-9bfd-426d-a9ba-4315e76e950a	admin@facturapp.local	login	auth	0de5b205-9bfd-426d-a9ba-4315e76e950a	{"username":"admin","email":"admin@facturapp.local"}	2026-06-09 21:15:59.569295+00
f7ac3c49-eec8-4763-b5ec-5e0aacf55f80	0de5b205-9bfd-426d-a9ba-4315e76e950a	admin@facturapp.local	login	auth	0de5b205-9bfd-426d-a9ba-4315e76e950a	{"username":"admin","email":"admin@facturapp.local"}	2026-06-09 21:19:25.121344+00
c3be2cd3-3a4f-4050-9a56-ab0f23e55143	0de5b205-9bfd-426d-a9ba-4315e76e950a	admin@facturapp.local	cambiar_password_usuario	app_user	f2d059c3-a4f4-4fcb-8d15-260d794337f0	{"username":"cgaete"}	2026-06-09 21:20:10.60909+00
889f2f72-4a11-4eb3-ac44-5624ec729d7a	f2d059c3-a4f4-4fcb-8d15-260d794337f0	gconstanzabelen@gmail.com	login	auth	f2d059c3-a4f4-4fcb-8d15-260d794337f0	{"username":"cgaete","email":"gconstanzabelen@gmail.com"}	2026-06-09 21:20:17.75922+00
c5b05d6e-d321-47c4-b2ef-92eb7ca463b4	f2d059c3-a4f4-4fcb-8d15-260d794337f0	gconstanzabelen@gmail.com	cambiar_password_usuario	app_user	5071125a-d19e-4d26-a846-5e4d8f1bab1b	{"username":"usuario"}	2026-06-09 21:20:41.19022+00
e319690e-71ed-4717-aa09-86635bf24f92	0de5b205-9bfd-426d-a9ba-4315e76e950a	admin@facturapp.local	login	auth	0de5b205-9bfd-426d-a9ba-4315e76e950a	{"username":"admin","email":"admin@facturapp.local"}	2026-06-09 21:22:33.873723+00
df7e229c-5f4a-4130-b768-515f495bb9c1	f2d059c3-a4f4-4fcb-8d15-260d794337f0	gconstanzabelen@gmail.com	login	auth	f2d059c3-a4f4-4fcb-8d15-260d794337f0	{"username":"cgaete","email":"gconstanzabelen@gmail.com"}	2026-06-10 15:32:16.4611+00
c5c4d6b5-0181-4e3e-a77c-e12aec8c4713	f2d059c3-a4f4-4fcb-8d15-260d794337f0	gconstanzabelen@gmail.com	login	auth	f2d059c3-a4f4-4fcb-8d15-260d794337f0	{"username":"cgaete","email":"gconstanzabelen@gmail.com"}	2026-06-10 15:32:27.644178+00
69f164e1-34a8-4430-9f3d-73d38fb3a710	f2d059c3-a4f4-4fcb-8d15-260d794337f0	gconstanzabelen@gmail.com	login	auth	f2d059c3-a4f4-4fcb-8d15-260d794337f0	{"username":"cgaete","email":"gconstanzabelen@gmail.com"}	2026-06-10 15:50:10.710833+00
4e2f420f-7cbf-4029-9671-508e0783087c	f2d059c3-a4f4-4fcb-8d15-260d794337f0	gconstanzabelen@gmail.com	login	auth	f2d059c3-a4f4-4fcb-8d15-260d794337f0	{"username":"cgaete","email":"gconstanzabelen@gmail.com"}	2026-06-25 15:06:18.455309+00
e645f0d7-8313-4163-ae1c-89cb62ebdc32	f2d059c3-a4f4-4fcb-8d15-260d794337f0	gconstanzabelen@gmail.com	cambiar_password_usuario	app_user	13bee0c7-947b-4ce5-9eba-417767b58d44	{"username":"dllanes"}	2026-06-25 15:07:07.437386+00
37b21893-acbd-4e0f-ad01-2cb57d3c8132	13bee0c7-947b-4ce5-9eba-417767b58d44	dllanes	login	auth	13bee0c7-947b-4ce5-9eba-417767b58d44	{"username":"dllanes","email":"dllanes"}	2026-06-25 15:07:13.599161+00
eb221472-ef6f-4372-925b-9e9771430afb	13bee0c7-947b-4ce5-9eba-417767b58d44	dllanes	login	auth	13bee0c7-947b-4ce5-9eba-417767b58d44	{"username":"dllanes","email":"dllanes"}	2026-06-25 15:27:20.572589+00
71a3a5bb-2335-49a0-ab2e-360971540c04	be214d76-f315-452c-8cc6-0c5200ffb053	plataformas	login	auth	be214d76-f315-452c-8cc6-0c5200ffb053	{"username":"plataformas","email":"plataformas"}	2026-06-25 17:16:11.045571+00
92d1d457-2ac7-4ae9-9d4b-8df38e621d18	be214d76-f315-452c-8cc6-0c5200ffb053	plataformas	login	auth	be214d76-f315-452c-8cc6-0c5200ffb053	{"username":"plataformas","email":"plataformas"}	2026-06-25 17:17:32.642273+00
ad2b15bf-080a-435e-b20f-409d5de345e1	0de5b205-9bfd-426d-a9ba-4315e76e950a	admin@facturapp.local	login	auth	0de5b205-9bfd-426d-a9ba-4315e76e950a	{"username":"admin","email":"admin@facturapp.local"}	2026-06-25 17:17:32.882046+00
a1dd37c2-e4d7-40e5-9a52-6856fa9787ed	f2d059c3-a4f4-4fcb-8d15-260d794337f0	gconstanzabelen@gmail.com	login	auth	f2d059c3-a4f4-4fcb-8d15-260d794337f0	{"username":"cgaete","email":"gconstanzabelen@gmail.com"}	2026-06-25 17:22:09.172426+00
bc9237d0-2b26-48ee-90a2-627699407118	63a8f210-66a1-4534-abc4-3282ea3c117f	valgian	login	auth	63a8f210-66a1-4534-abc4-3282ea3c117f	{"username":"valgian","email":"valgian"}	2026-06-25 17:22:09.218887+00
97a9eafb-de9c-4a8f-9345-0c84c0c14cf2	0de5b205-9bfd-426d-a9ba-4315e76e950a	admin@facturapp.local	login	auth	0de5b205-9bfd-426d-a9ba-4315e76e950a	{"username":"admin","email":"admin@facturapp.local"}	2026-06-25 17:22:09.237844+00
6e651126-2296-47fe-8b94-a7564fc0d174	be214d76-f315-452c-8cc6-0c5200ffb053	plataformas	login	auth	be214d76-f315-452c-8cc6-0c5200ffb053	{"username":"plataformas","email":"plataformas"}	2026-06-25 17:22:09.256945+00
668fa31d-4010-41d5-9843-d310541b7c15	be214d76-f315-452c-8cc6-0c5200ffb053	plataformas	login	auth	be214d76-f315-452c-8cc6-0c5200ffb053	{"username":"plataformas","email":"plataformas"}	2026-06-25 17:22:09.277987+00
96717c91-7469-4e2b-a386-abd16c65641b	be214d76-f315-452c-8cc6-0c5200ffb053	plataformas	login	auth	be214d76-f315-452c-8cc6-0c5200ffb053	{"username":"plataformas","email":"plataformas"}	2026-06-25 17:23:29.861809+00
a9fc2a3c-d917-460e-b234-f38a0f0a4482	be214d76-f315-452c-8cc6-0c5200ffb053	plataformas	login	auth	be214d76-f315-452c-8cc6-0c5200ffb053	{"username":"plataformas","email":"plataformas"}	2026-06-25 17:23:46.11318+00
40f02d99-bc8c-40ac-9568-326e1b6d29b1	be214d76-f315-452c-8cc6-0c5200ffb053	plataformas	login	auth	be214d76-f315-452c-8cc6-0c5200ffb053	{"username":"plataformas","email":"plataformas"}	2026-06-25 19:59:48.295055+00
e1d0ef61-b9b5-49b7-bbb7-f80fad0e10f5	be214d76-f315-452c-8cc6-0c5200ffb053	plataformas	login	auth	be214d76-f315-452c-8cc6-0c5200ffb053	{"username":"plataformas","email":"plataformas"}	2026-06-26 13:31:35.209009+00
52166039-4615-4dd4-a07e-c43f7d923087	be214d76-f315-452c-8cc6-0c5200ffb053	plataformas	editar	solicitud_factura	ce422bc7-e2ae-4100-8db8-bf33e6ef5201	{"folio":"SF-2026-00067","fields":["empresa_emisora","tipo","estado","periodo","fecha_solicitud","cliente_id","cliente_facturacion_id","coordinador_id","oc_numero","contrato_numero","hes_numero","glosa","area","moneda_base","uf_fecha","uf_valor","monto_neto_clp_manual","monto_neto_clp","observaciones","cps","receptores"]}	2026-06-26 13:46:41.13136+00
626ca327-9bc9-40bc-b33f-75a78dd44244	be214d76-f315-452c-8cc6-0c5200ffb053	plataformas	editar	solicitud_factura	ce422bc7-e2ae-4100-8db8-bf33e6ef5201	{"folio":"SF-2026-00067","fields":["empresa_emisora","tipo","estado","periodo","fecha_solicitud","cliente_id","cliente_facturacion_id","coordinador_id","oc_numero","contrato_numero","hes_numero","glosa","area","moneda_base","uf_fecha","uf_valor","monto_neto_clp_manual","monto_neto_clp","observaciones","cps","receptores"]}	2026-06-26 13:46:53.529731+00
69778f83-5e01-409b-bb2c-47fbf24e72fe	be214d76-f315-452c-8cc6-0c5200ffb053	plataformas	login	auth	be214d76-f315-452c-8cc6-0c5200ffb053	{"username":"plataformas","email":"plataformas"}	2026-06-26 15:15:14.66803+00
5530fe8e-3192-4f3b-8fdc-e1a23ec1bb54	be214d76-f315-452c-8cc6-0c5200ffb053	plataformas	login	auth	be214d76-f315-452c-8cc6-0c5200ffb053	{"username":"plataformas","email":"plataformas"}	2026-06-26 15:18:18.10815+00
0b757466-99a8-49b4-bf8d-cbf9d0e6ba2a	be214d76-f315-452c-8cc6-0c5200ffb053	plataformas	login	auth	be214d76-f315-452c-8cc6-0c5200ffb053	{"username":"plataformas","email":"plataformas"}	2026-06-26 15:22:48.302413+00
5af71eb5-9249-48c7-9e13-7abfe0e472e1	be214d76-f315-452c-8cc6-0c5200ffb053	plataformas	duplicar	solicitud_factura	2d01ee01-144e-4b06-9fc7-bedf82040cf0	{"desde":"7afcd067-c5f0-4570-86d9-21fbb1c6d0e3","folio_origen":"SF-2026-00071","folio":"SF-2026-00072"}	2026-06-26 15:23:37.731112+00
a9a23574-9475-48ac-ab80-059e80b458da	be214d76-f315-452c-8cc6-0c5200ffb053	plataformas	editar	solicitud_factura	2d01ee01-144e-4b06-9fc7-bedf82040cf0	{"folio":"SF-2026-00072","fields":["empresa_emisora","tipo","estado","periodo","fecha_solicitud","cliente_id","cliente_facturacion_id","coordinador_id","oc_numero","contrato_numero","hes_numero","glosa","area","moneda_base","uf_fecha","uf_valor","monto_neto_clp_manual","monto_neto_clp","observaciones","cps","receptores"]}	2026-06-26 15:23:39.912202+00
ccbddd18-131b-46a0-b830-83d5b3701741	be214d76-f315-452c-8cc6-0c5200ffb053	plataformas	editar	solicitud_factura	2d01ee01-144e-4b06-9fc7-bedf82040cf0	{"folio":"SF-2026-00072","fields":["empresa_emisora","tipo","estado","periodo","fecha_solicitud","cliente_id","cliente_facturacion_id","coordinador_id","oc_numero","contrato_numero","hes_numero","glosa","area","moneda_base","uf_fecha","uf_valor","monto_neto_clp_manual","monto_neto_clp","observaciones","cps","receptores"]}	2026-06-26 15:23:46.443944+00
bd090b76-e835-4d78-b789-ad2d9893b42e	be214d76-f315-452c-8cc6-0c5200ffb053	plataformas	editar	solicitud_factura	2d01ee01-144e-4b06-9fc7-bedf82040cf0	{"folio":"SF-2026-00072","fields":["empresa_emisora","tipo","estado","periodo","fecha_solicitud","cliente_id","cliente_facturacion_id","coordinador_id","oc_numero","contrato_numero","hes_numero","glosa","area","moneda_base","uf_fecha","uf_valor","monto_neto_clp_manual","monto_neto_clp","observaciones","cps","receptores"]}	2026-06-26 15:23:57.612216+00
33be90ae-65f2-4c41-90f1-06027301f043	be214d76-f315-452c-8cc6-0c5200ffb053	plataformas	login	auth	be214d76-f315-452c-8cc6-0c5200ffb053	{"username":"plataformas","email":"plataformas"}	2026-06-26 15:51:10.121224+00
6a29ab3b-d07b-42c1-8283-a44548fe8ef7	be214d76-f315-452c-8cc6-0c5200ffb053	plataformas	login	auth	be214d76-f315-452c-8cc6-0c5200ffb053	{"username":"plataformas","email":"plataformas"}	2026-06-26 15:51:25.618944+00
21eb05f0-8e00-4660-ac22-45cc5c023b31	be214d76-f315-452c-8cc6-0c5200ffb053	plataformas	login	auth	be214d76-f315-452c-8cc6-0c5200ffb053	{"username":"plataformas","email":"plataformas"}	2026-06-26 15:52:56.060394+00
7e567858-e323-4718-b6b9-8bbb361a8a00	be214d76-f315-452c-8cc6-0c5200ffb053	plataformas	login	auth	be214d76-f315-452c-8cc6-0c5200ffb053	{"username":"plataformas","email":"plataformas"}	2026-06-26 15:53:21.066217+00
5f498e53-72a9-46e7-adc4-97fa1d620348	be214d76-f315-452c-8cc6-0c5200ffb053	plataformas	crear	solicitud_factura	e27f44c9-de0d-4960-af2b-ee0ff5b1afee	{"folio":"SF-2026-00073","periodo":"2026-06","cliente_id":"cli_afp_habitat"}	2026-06-26 15:53:21.152313+00
bce0c8f7-1ff4-4ee6-9c2f-0c12e24cc6c2	be214d76-f315-452c-8cc6-0c5200ffb053	plataformas	editar	solicitud_factura	e27f44c9-de0d-4960-af2b-ee0ff5b1afee	{"folio":"SF-2026-00073","fields":["empresa_emisora","tipo","estado","periodo","fecha_solicitud","cliente_id","coordinador_id","oc_numero","hes_numero","glosa","area","moneda_base","uf_fecha","uf_valor","observaciones","cps","receptores"]}	2026-06-26 15:53:21.1896+00
93dfa240-a557-408c-b3b9-c049cdaf22af	be214d76-f315-452c-8cc6-0c5200ffb053	plataformas	editar	solicitud_factura	e27f44c9-de0d-4960-af2b-ee0ff5b1afee	{"folio":"SF-2026-00073","fields":["empresa_emisora","tipo","estado","periodo","fecha_solicitud","cliente_id","coordinador_id","oc_numero","hes_numero","glosa","area","moneda_base","uf_fecha","uf_valor","observaciones","cps","receptores"]}	2026-06-26 15:53:21.213334+00
c18728d7-6063-4f7c-a650-840b60985bb3	be214d76-f315-452c-8cc6-0c5200ffb053	plataformas	eliminar	solicitud_factura	e27f44c9-de0d-4960-af2b-ee0ff5b1afee	{"folio":"SF-2026-00073"}	2026-06-26 15:53:21.338294+00
fe9086cf-7d4e-4ef1-8fee-860849f033f6	f2d059c3-a4f4-4fcb-8d15-260d794337f0	gconstanzabelen@gmail.com	login	auth	f2d059c3-a4f4-4fcb-8d15-260d794337f0	{"username":"cgaete","email":"gconstanzabelen@gmail.com"}	2026-06-26 15:53:42.112184+00
d80fb2d2-9edf-4373-82c6-16307bb12285	be214d76-f315-452c-8cc6-0c5200ffb053	plataformas	login	auth	be214d76-f315-452c-8cc6-0c5200ffb053	{"username":"plataformas","email":"plataformas"}	2026-06-26 16:09:00.452697+00
fe6ae0c6-6e06-49fc-9f39-f0cbc9c01c7d	be214d76-f315-452c-8cc6-0c5200ffb053	plataformas	crear	solicitud_factura	1be97ed8-cfad-4ec6-ae53-5d9ad1601b0d	{"folio":"SF-2026-00074","periodo":"2026-06","cliente_id":"cli_afp_habitat"}	2026-06-26 16:09:16.292498+00
b86ae8c0-7a72-48ef-b765-815ee760ec60	be214d76-f315-452c-8cc6-0c5200ffb053	plataformas	editar	solicitud_factura	1be97ed8-cfad-4ec6-ae53-5d9ad1601b0d	{"folio":"SF-2026-00074","fields":["empresa_emisora","tipo","estado","periodo","fecha_solicitud","cliente_id","cliente_facturacion_id","coordinador_id","oc_numero","contrato_numero","hes_numero","glosa","area","moneda_base","uf_fecha","uf_valor","monto_neto_clp_manual","monto_neto_clp","observaciones","cps","receptores"]}	2026-06-26 16:09:23.32726+00
3e73231b-405b-4407-b985-93a4cee86b1d	be214d76-f315-452c-8cc6-0c5200ffb053	plataformas	editar	solicitud_factura	1be97ed8-cfad-4ec6-ae53-5d9ad1601b0d	{"folio":"SF-2026-00074","fields":["empresa_emisora","tipo","estado","periodo","fecha_solicitud","cliente_id","cliente_facturacion_id","coordinador_id","oc_numero","contrato_numero","hes_numero","glosa","area","moneda_base","uf_fecha","uf_valor","monto_neto_clp_manual","monto_neto_clp","observaciones","cps","receptores"]}	2026-06-26 16:09:48.478845+00
9f823e1a-fd4c-4910-9d2a-ca0e0be53dc2	be214d76-f315-452c-8cc6-0c5200ffb053	plataformas	editar	solicitud_factura	1be97ed8-cfad-4ec6-ae53-5d9ad1601b0d	{"folio":"SF-2026-00074","fields":["empresa_emisora","tipo","estado","periodo","fecha_solicitud","cliente_id","cliente_facturacion_id","coordinador_id","oc_numero","contrato_numero","hes_numero","glosa","area","moneda_base","uf_fecha","uf_valor","monto_neto_clp_manual","monto_neto_clp","observaciones","cps","receptores"]}	2026-06-26 16:09:51.100538+00
290245c5-0084-44a5-a8cb-88a41d64dce2	be214d76-f315-452c-8cc6-0c5200ffb053	plataformas	editar	solicitud_factura	1be97ed8-cfad-4ec6-ae53-5d9ad1601b0d	{"folio":"SF-2026-00074","fields":["empresa_emisora","tipo","estado","periodo","fecha_solicitud","cliente_id","cliente_facturacion_id","coordinador_id","oc_numero","contrato_numero","hes_numero","glosa","area","moneda_base","uf_fecha","uf_valor","monto_neto_clp_manual","monto_neto_clp","observaciones","cps","receptores"]}	2026-06-26 16:10:28.564244+00
80ab86e1-c77d-4cf9-9064-83f82a83b797	be214d76-f315-452c-8cc6-0c5200ffb053	plataformas	editar	solicitud_factura	1be97ed8-cfad-4ec6-ae53-5d9ad1601b0d	{"folio":"SF-2026-00074","fields":["empresa_emisora","tipo","estado","periodo","fecha_solicitud","cliente_id","cliente_facturacion_id","coordinador_id","oc_numero","contrato_numero","hes_numero","glosa","area","moneda_base","uf_fecha","uf_valor","monto_neto_clp_manual","monto_neto_clp","observaciones","cps","receptores"]}	2026-06-26 16:10:38.782088+00
0314e299-c160-4a7f-a39c-eeb64db46d15	be214d76-f315-452c-8cc6-0c5200ffb053	plataformas	editar	solicitud_factura	1be97ed8-cfad-4ec6-ae53-5d9ad1601b0d	{"folio":"SF-2026-00074","fields":["empresa_emisora","tipo","estado","periodo","fecha_solicitud","cliente_id","cliente_facturacion_id","coordinador_id","oc_numero","contrato_numero","hes_numero","glosa","area","moneda_base","uf_fecha","uf_valor","monto_neto_clp_manual","monto_neto_clp","observaciones","cps","receptores"]}	2026-06-26 16:10:41.263064+00
afc61a2e-e022-4986-af97-3702dadf594a	be214d76-f315-452c-8cc6-0c5200ffb053	plataformas	editar	solicitud_factura	1be97ed8-cfad-4ec6-ae53-5d9ad1601b0d	{"folio":"SF-2026-00074","fields":["empresa_emisora","tipo","estado","periodo","fecha_solicitud","cliente_id","cliente_facturacion_id","coordinador_id","oc_numero","contrato_numero","hes_numero","glosa","area","moneda_base","uf_fecha","uf_valor","monto_neto_clp_manual","monto_neto_clp","observaciones","cps","receptores"]}	2026-06-26 16:11:00.258802+00
0b6e28fb-4e14-4e15-93fb-2c4068a0ba47	be214d76-f315-452c-8cc6-0c5200ffb053	plataformas	login	auth	be214d76-f315-452c-8cc6-0c5200ffb053	{"username":"plataformas","email":"plataformas"}	2026-06-26 16:17:19.66031+00
bdf8143f-e3a7-418f-bcf5-3b40ab31a7aa	be214d76-f315-452c-8cc6-0c5200ffb053	plataformas	crear	solicitud_factura	7b12599c-2837-45d5-8d2a-2b965278a337	{"folio":"SF-2026-00075","periodo":"2026-06","cliente_id":"cli_andritz"}	2026-06-26 16:17:32.874013+00
789e8d09-1f3d-4acc-961d-7a0e3e0a4ad0	be214d76-f315-452c-8cc6-0c5200ffb053	plataformas	editar	solicitud_factura	7b12599c-2837-45d5-8d2a-2b965278a337	{"folio":"SF-2026-00075","fields":["empresa_emisora","tipo","estado","periodo","fecha_solicitud","cliente_id","cliente_facturacion_id","coordinador_id","oc_numero","contrato_numero","hes_numero","glosa","area","moneda_base","uf_fecha","uf_valor","monto_neto_clp_manual","monto_neto_clp","observaciones","cps","receptores"]}	2026-06-26 16:17:34.882288+00
b378fde6-4ccf-490a-a91c-c8da73e29e73	be214d76-f315-452c-8cc6-0c5200ffb053	plataformas	duplicar	solicitud_factura	ae7366e1-5a90-4690-b612-c339f928f22a	{"desde":"1be97ed8-cfad-4ec6-ae53-5d9ad1601b0d","folio_origen":"SF-2026-00074","folio":"SF-2026-00076"}	2026-06-26 16:18:07.284783+00
eea07998-644a-4f94-9fe8-23cacad4e75f	be214d76-f315-452c-8cc6-0c5200ffb053	plataformas	crear	solicitud_factura	72ab8552-2cb2-4740-b663-144f340761e6	{"folio":"SF-2026-00081","periodo":"2026-06","cliente_id":"cli_afp_habitat"}	2026-07-01 17:53:15.022425+00
84f97a6a-73df-46ed-9305-9b620bbd3cc2	be214d76-f315-452c-8cc6-0c5200ffb053	plataformas	editar	solicitud_factura	ae7366e1-5a90-4690-b612-c339f928f22a	{"folio":"SF-2026-00076","fields":["empresa_emisora","tipo","estado","periodo","fecha_solicitud","cliente_id","cliente_facturacion_id","coordinador_id","oc_numero","contrato_numero","hes_numero","glosa","area","moneda_base","uf_fecha","uf_valor","monto_neto_clp_manual","monto_neto_clp","observaciones","cps","receptores"]}	2026-06-26 16:18:15.867368+00
984efab7-3fef-4b91-968f-015d76cf9990	be214d76-f315-452c-8cc6-0c5200ffb053	plataformas	editar	solicitud_factura	ae7366e1-5a90-4690-b612-c339f928f22a	{"folio":"SF-2026-00076","fields":["empresa_emisora","tipo","estado","periodo","fecha_solicitud","cliente_id","cliente_facturacion_id","coordinador_id","oc_numero","contrato_numero","hes_numero","glosa","area","moneda_base","uf_fecha","uf_valor","monto_neto_clp_manual","monto_neto_clp","observaciones","cps","receptores"]}	2026-06-26 16:18:20.418653+00
1cd2259b-710c-413a-a296-be3893381d0c	be214d76-f315-452c-8cc6-0c5200ffb053	plataformas	editar	solicitud_factura	ae7366e1-5a90-4690-b612-c339f928f22a	{"folio":"SF-2026-00076","fields":["empresa_emisora","tipo","estado","periodo","fecha_solicitud","cliente_id","cliente_facturacion_id","coordinador_id","oc_numero","contrato_numero","hes_numero","glosa","area","moneda_base","uf_fecha","uf_valor","monto_neto_clp_manual","monto_neto_clp","observaciones","cps","receptores"]}	2026-06-26 16:18:30.9722+00
27d8ff09-a3dc-4a34-bd57-6957c7fe2ca7	be214d76-f315-452c-8cc6-0c5200ffb053	plataformas	editar	solicitud_factura	ae7366e1-5a90-4690-b612-c339f928f22a	{"folio":"SF-2026-00076","fields":["empresa_emisora","tipo","estado","periodo","fecha_solicitud","cliente_id","cliente_facturacion_id","coordinador_id","oc_numero","contrato_numero","hes_numero","glosa","area","moneda_base","uf_fecha","uf_valor","monto_neto_clp_manual","monto_neto_clp","observaciones","cps","receptores"]}	2026-06-26 16:18:18.233495+00
246fc7fa-d43c-424a-90e6-460dd7e1f22e	be214d76-f315-452c-8cc6-0c5200ffb053	plataformas	editar	solicitud_factura	ae7366e1-5a90-4690-b612-c339f928f22a	{"folio":"SF-2026-00076","fields":["empresa_emisora","tipo","estado","periodo","fecha_solicitud","cliente_id","cliente_facturacion_id","coordinador_id","oc_numero","contrato_numero","hes_numero","glosa","area","moneda_base","uf_fecha","uf_valor","monto_neto_clp_manual","monto_neto_clp","observaciones","cps","receptores"]}	2026-06-26 16:18:28.128364+00
14a5649d-e463-42e0-aeb9-d10b99a0de84	be214d76-f315-452c-8cc6-0c5200ffb053	plataformas	duplicar	solicitud_factura	a1e8b706-9a8d-4c7d-9303-f3c454c0de44	{"desde":"ae7366e1-5a90-4690-b612-c339f928f22a","folio_origen":"SF-2026-00076","folio":"SF-2026-00077"}	2026-06-26 16:18:44.24613+00
a4ed1976-f7c0-4491-a498-727b0f2bfa86	be214d76-f315-452c-8cc6-0c5200ffb053	plataformas	editar	solicitud_factura	a1e8b706-9a8d-4c7d-9303-f3c454c0de44	{"folio":"SF-2026-00077","fields":["empresa_emisora","tipo","estado","periodo","fecha_solicitud","cliente_id","cliente_facturacion_id","coordinador_id","oc_numero","contrato_numero","hes_numero","glosa","area","moneda_base","uf_fecha","uf_valor","monto_neto_clp_manual","monto_neto_clp","observaciones","cps","receptores"]}	2026-06-26 16:18:50.759295+00
fe7768ef-ac09-4b20-896f-8b19715d4fd7	be214d76-f315-452c-8cc6-0c5200ffb053	plataformas	editar	solicitud_factura	a1e8b706-9a8d-4c7d-9303-f3c454c0de44	{"folio":"SF-2026-00077","fields":["empresa_emisora","tipo","estado","periodo","fecha_solicitud","cliente_id","cliente_facturacion_id","coordinador_id","oc_numero","contrato_numero","hes_numero","glosa","area","moneda_base","uf_fecha","uf_valor","monto_neto_clp_manual","monto_neto_clp","observaciones","cps","receptores"]}	2026-06-26 16:18:52.601667+00
590853ca-52e8-459f-a427-7dad2e279138	be214d76-f315-452c-8cc6-0c5200ffb053	plataformas	editar	solicitud_factura	a1e8b706-9a8d-4c7d-9303-f3c454c0de44	{"folio":"SF-2026-00077","fields":["empresa_emisora","tipo","estado","periodo","fecha_solicitud","cliente_id","cliente_facturacion_id","coordinador_id","oc_numero","contrato_numero","hes_numero","glosa","area","moneda_base","uf_fecha","uf_valor","monto_neto_clp_manual","monto_neto_clp","observaciones","cps","receptores"]}	2026-06-26 16:18:54.027004+00
6972fc69-be4b-4598-a382-6d153698c9cd	be214d76-f315-452c-8cc6-0c5200ffb053	plataformas	editar	solicitud_factura	a1e8b706-9a8d-4c7d-9303-f3c454c0de44	{"folio":"SF-2026-00077","fields":["empresa_emisora","tipo","estado","periodo","fecha_solicitud","cliente_id","cliente_facturacion_id","coordinador_id","oc_numero","contrato_numero","hes_numero","glosa","area","moneda_base","uf_fecha","uf_valor","monto_neto_clp_manual","monto_neto_clp","observaciones","cps","receptores"]}	2026-06-26 16:18:57.856007+00
ed5a3cd8-92fd-4443-a741-af435246dc82	be214d76-f315-452c-8cc6-0c5200ffb053	plataformas	login	auth	be214d76-f315-452c-8cc6-0c5200ffb053	{"username":"plataformas","email":"plataformas"}	2026-06-26 16:43:20.193906+00
e33af3ae-481a-448a-97c3-9dc990564d0d	be214d76-f315-452c-8cc6-0c5200ffb053	plataformas	eliminar	solicitud_factura	7b12599c-2837-45d5-8d2a-2b965278a337	{"folio":"SF-2026-00075"}	2026-06-26 16:43:20.211408+00
bd9dc431-4967-4c65-9496-4055f3119910	be214d76-f315-452c-8cc6-0c5200ffb053	plataformas	login	auth	be214d76-f315-452c-8cc6-0c5200ffb053	{"username":"plataformas","email":"plataformas"}	2026-06-26 16:44:19.316898+00
35c04ba3-cab2-447a-b1cd-f8c7f6a3a2bc	be214d76-f315-452c-8cc6-0c5200ffb053	plataformas	crear	solicitud_factura	cf1915e3-4f74-4e38-8f56-43d0bc3d123b	{"folio":"SF-2026-00078","periodo":"2026-06","cliente_id":"cli_afp_habitat"}	2026-06-26 16:44:19.485154+00
2e93c444-f49f-4fbb-8afb-ff758ff2c4e8	be214d76-f315-452c-8cc6-0c5200ffb053	plataformas	eliminar	solicitud_factura	cf1915e3-4f74-4e38-8f56-43d0bc3d123b	{"folio":"SF-2026-00078"}	2026-06-26 16:44:19.642349+00
32017399-94b8-4a30-bf95-88e23b57d470	be214d76-f315-452c-8cc6-0c5200ffb053	plataformas	login	auth	be214d76-f315-452c-8cc6-0c5200ffb053	{"username":"plataformas","email":"plataformas"}	2026-06-26 16:54:42.837918+00
8e883652-8460-4d29-8384-51cdeae76b17	be214d76-f315-452c-8cc6-0c5200ffb053	plataformas	login	auth	be214d76-f315-452c-8cc6-0c5200ffb053	{"username":"plataformas","email":"plataformas"}	2026-06-26 20:17:11.052156+00
88623fa9-e55b-4bda-9069-e2deb72bb952	be214d76-f315-452c-8cc6-0c5200ffb053	plataformas	crear	solicitud_factura	3b8d59c2-6f4d-49b8-9795-280e007afe76	{"folio":"SF-2026-00079","periodo":"2026-06","cliente_id":"cli_copec"}	2026-06-26 20:17:11.207763+00
28ac7d92-86cc-4478-aa37-8ca09d8e4ebf	be214d76-f315-452c-8cc6-0c5200ffb053	plataformas	eliminar	solicitud_factura	3b8d59c2-6f4d-49b8-9795-280e007afe76	{"folio":"SF-2026-00079"}	2026-06-26 20:17:11.377718+00
a69550e6-cc5f-4b71-bc92-c265f3e5e73c	be214d76-f315-452c-8cc6-0c5200ffb053	plataformas	login	auth	be214d76-f315-452c-8cc6-0c5200ffb053	{"username":"plataformas","email":"plataformas"}	2026-07-01 16:41:01.778009+00
f1792510-a327-4145-b1c4-57bfb030714e	be214d76-f315-452c-8cc6-0c5200ffb053	plataformas	crear	solicitud_factura	e5c3a1a8-de16-4e8f-921e-4a2e490aa61d	{"folio":"SF-2026-00080","periodo":"2026-06","cliente_id":"cli_afp_habitat"}	2026-07-01 16:41:39.12956+00
5a98416e-eb93-4c14-aa25-3591bda2efcd	be214d76-f315-452c-8cc6-0c5200ffb053	plataformas	login	auth	be214d76-f315-452c-8cc6-0c5200ffb053	{"username":"plataformas","email":"plataformas"}	2026-07-01 16:56:50.867017+00
4352c00a-3701-48b9-a629-654bc55191b6	be214d76-f315-452c-8cc6-0c5200ffb053	plataformas	login	auth	be214d76-f315-452c-8cc6-0c5200ffb053	{"username":"plataformas","email":"plataformas"}	2026-07-01 16:59:40.386264+00
813e7df4-e021-4d94-83e7-0eca12ec4b52	be214d76-f315-452c-8cc6-0c5200ffb053	plataformas	login	auth	be214d76-f315-452c-8cc6-0c5200ffb053	{"username":"plataformas","email":"plataformas"}	2026-07-01 16:59:46.735236+00
f9e01e05-223c-4e16-87d9-02029e590074	be214d76-f315-452c-8cc6-0c5200ffb053	plataformas	login	auth	be214d76-f315-452c-8cc6-0c5200ffb053	{"username":"plataformas","email":"plataformas"}	2026-07-01 17:00:33.721268+00
27e0c67f-31b6-4e67-9e9c-c1a36f6f7968	be214d76-f315-452c-8cc6-0c5200ffb053	plataformas	login	auth	be214d76-f315-452c-8cc6-0c5200ffb053	{"username":"plataformas","email":"plataformas"}	2026-07-01 17:49:11.64425+00
20ccfc35-9967-4aa1-8f18-1715ba316974	be214d76-f315-452c-8cc6-0c5200ffb053	plataformas	login	auth	be214d76-f315-452c-8cc6-0c5200ffb053	{"username":"plataformas","email":"plataformas"}	2026-07-01 17:51:35.408654+00
74ae0115-4c25-40e9-92d3-dfb81c7aae26	be214d76-f315-452c-8cc6-0c5200ffb053	plataformas	login	auth	be214d76-f315-452c-8cc6-0c5200ffb053	{"username":"plataformas","email":"plataformas"}	2026-07-01 17:53:04.444973+00
a9430eb0-3d6c-4194-90cf-0eb7cc0239a8	be214d76-f315-452c-8cc6-0c5200ffb053	plataformas	login	auth	be214d76-f315-452c-8cc6-0c5200ffb053	{"username":"plataformas","email":"plataformas"}	2026-07-01 17:56:01.625062+00
f859e7b3-9b7f-4d28-a451-c03a7ec26baa	be214d76-f315-452c-8cc6-0c5200ffb053	plataformas	login	auth	be214d76-f315-452c-8cc6-0c5200ffb053	{"username":"plataformas","email":"plataformas"}	2026-07-01 17:58:37.070603+00
8ac78a65-8afb-4c9a-9822-7dae808a066c	be214d76-f315-452c-8cc6-0c5200ffb053	plataformas	login	auth	be214d76-f315-452c-8cc6-0c5200ffb053	{"username":"plataformas","email":"plataformas"}	2026-07-01 17:59:09.729315+00
933b98c4-b5ba-45a7-bbfd-db1a02202837	be214d76-f315-452c-8cc6-0c5200ffb053	plataformas	login	auth	be214d76-f315-452c-8cc6-0c5200ffb053	{"username":"plataformas","email":"plataformas"}	2026-07-07 15:40:00.990678+00
20b098d0-ee4f-49bd-a0c4-4d9640fb3790	0de5b205-9bfd-426d-a9ba-4315e76e950a	admin@facturapp.local	login	auth	0de5b205-9bfd-426d-a9ba-4315e76e950a	{"username":"admin","email":"admin@facturapp.local"}	2026-07-07 15:45:06.905133+00
d76599f7-e589-4c95-aa31-c67b08ac368d	0de5b205-9bfd-426d-a9ba-4315e76e950a	admin@facturapp.local	crear	solicitud_factura	aeba8638-dc71-4a91-a453-7298951ad44f	{"folio":"SF-2026-00082","periodo":"2026-07","cliente_id":"cli_afp_habitat"}	2026-07-07 15:45:06.953708+00
2038463b-751c-4e07-83d1-d3466319dc04	0de5b205-9bfd-426d-a9ba-4315e76e950a	admin@facturapp.local	cambiar_estado	solicitud_factura	aeba8638-dc71-4a91-a453-7298951ad44f	{"hacia":"FACTURA SOLICITADA","comentario":"E2E Codex"}	2026-07-07 15:45:06.991202+00
9c7efc9b-f7bc-4ee4-8ee0-ad2cb4fc9869	0de5b205-9bfd-426d-a9ba-4315e76e950a	admin@facturapp.local	eliminar	solicitud_factura	aeba8638-dc71-4a91-a453-7298951ad44f	{"folio":"SF-2026-00082"}	2026-07-07 15:45:07.126362+00
f05242c3-481f-44b6-8f59-ff6559ac1bb7	be214d76-f315-452c-8cc6-0c5200ffb053	plataformas	login	auth	be214d76-f315-452c-8cc6-0c5200ffb053	{"username":"plataformas","email":"plataformas"}	2026-07-07 17:04:47.434188+00
71ef60f8-73a0-4fbc-89a8-7d4ef9660745	be214d76-f315-452c-8cc6-0c5200ffb053	plataformas	login	auth	be214d76-f315-452c-8cc6-0c5200ffb053	{"username":"plataformas","email":"plataformas"}	2026-07-07 17:08:30.871859+00
0ac93d28-dc15-43cf-a5f4-1a9b48f70e15	be214d76-f315-452c-8cc6-0c5200ffb053	plataformas	login	auth	be214d76-f315-452c-8cc6-0c5200ffb053	{"username":"plataformas","email":"plataformas"}	2026-07-07 17:10:02.381848+00
34bf934f-24e8-426c-b647-2760ac1feeaf	be214d76-f315-452c-8cc6-0c5200ffb053	plataformas	login	auth	be214d76-f315-452c-8cc6-0c5200ffb053	{"username":"plataformas","email":"plataformas"}	2026-07-07 17:11:07.267864+00
12543e8d-d2b8-4646-8f56-f8d895669a59	be214d76-f315-452c-8cc6-0c5200ffb053	plataformas	login	auth	be214d76-f315-452c-8cc6-0c5200ffb053	{"username":"plataformas","email":"plataformas"}	2026-07-07 17:11:18.27249+00
686f0fee-3595-42f4-a3d4-a6f9e6035a3d	be214d76-f315-452c-8cc6-0c5200ffb053	plataformas	login	auth	be214d76-f315-452c-8cc6-0c5200ffb053	{"username":"plataformas","email":"plataformas"}	2026-07-07 17:11:38.818632+00
b177fe26-1f0d-4064-b84e-dcc3993088b6	be214d76-f315-452c-8cc6-0c5200ffb053	plataformas	login	auth	be214d76-f315-452c-8cc6-0c5200ffb053	{"username":"plataformas","email":"plataformas"}	2026-07-07 17:13:33.479655+00
c0f26dd8-2a22-4f08-94f4-9c779b3004e4	be214d76-f315-452c-8cc6-0c5200ffb053	plataformas	login	auth	be214d76-f315-452c-8cc6-0c5200ffb053	{"username":"plataformas","email":"plataformas"}	2026-07-07 17:15:23.849098+00
\.


--
-- Data for Name: bitacora_integracion; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.bitacora_integracion (id, integracion, dataset, estado, mensaje, filas_leidas, filas_procesadas, detalles, iniciado_at, finalizado_at) FROM stdin;
\.


--
-- Data for Name: catalogo_estado_solicitud; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.catalogo_estado_solicitud (codigo, nombre, grupo, orden, activo) FROM stdin;
PENDIENTE OC / HES	Pendiente OC / HES	proyeccion	10	1
FACTURA SOLICITADA	Factura solicitada	proyeccion	20	1
Borrador	Borrador	solicitud	40	1
PendienteDatos	Pendiente de datos	solicitud	50	1
EnRevision	En revision	solicitud	60	1
Aprobada	Aprobada	solicitud	70	1
Rechazada	Rechazada	solicitud	80	1
Emitida	Emitida	solicitud	90	1
Facturada	Facturada	solicitud	100	1
Anulada	Anulada	solicitud	110	1
Cerrada	Cerrada	solicitud	120	1
\.


--
-- Data for Name: catalogo_tipo_cp; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.catalogo_tipo_cp (codigo, nombre, activo) FROM stdin;
ADMIN_OPERACION	Administracion y Operacion	1
CONSTRUCCION	Construccion	1
HORAS_DESARROLLO	Horas de Desarrollo	1
\.


--
-- Data for Name: catalogo_tipo_impuesto; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.catalogo_tipo_impuesto (codigo, nombre, afecto_iva, activo) FROM stdin;
AFECTO_IVA	Afecto IVA	1	1
EXENTO_IVA	Exento IVA	0	1
\.


--
-- Data for Name: cliente; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.cliente (id, nombre_corto, razon_social, rut, giro, direccion, coordinador_id, frecuencia, dia_facturacion, mes_inicio, requiere_hes, estado, notas, created_at, updated_at) FROM stdin;
cli_andritz	ANDRITZ	ANDRITZ CHILE LTDA.	77.470.940-1	Andritz Chile Limitada	Avda. Andres Bello 2777, Of 1101 7550611 Santiago-Las Condes	coor_003	Mensual	\N	\N	0	Activo	\N	2026-05-05 19:58:23	2026-05-11 16:28:17
cli_avla	AVLA	AVLA SERVICIOS SPA	76.255.149-7	ACTIVIDADES DE ASESORAMIENTO EMPRESARIAL Y EN MATERIA DE GESTION	CERRO EL PLOMO 5420 DEPTO. 802 LAS CONDES, SANTIAGO	\N	Mensual	\N	\N	0	Activo	\N	2026-05-05 19:58:23	2026-05-11 16:28:17
cli_ccu	CCU	CIA. CERVECERIAS UNIDAS S.A.	90.413.000-1	\N	Vitacura 2670 piso 23	\N	Mensual	\N	\N	0	Activo	\N	2026-05-05 19:58:23	2026-05-11 16:28:17
cli_soprole	SOPROLE	SOPROLE S.A.	76.101.812-4	Elaboradora de productos lácteos	Av. Vitacura 4465, Vitacura	coor_001	Mensual	\N	\N	0	Activo	\N	2026-05-05 19:58:23	2026-06-10 15:31:47.84435+00
cli_afp_habitat	AFP HABITAT	ADMINISTRADORA DE FONDOS DE PENSIONES HABITAT S.A	98.000.100-8	Administradora de Fondos de Pensiones	Providencia 1909, comuna de Providencia, Santiago, Región Metropolitana	coor_001	Mensual	\N	\N	0	Activo	\N	2026-05-05 19:58:23	2026-06-10 15:31:47.84435+00
cli_aristia	ARIZTÍA	SERVICIOS AGROSISTEMA LTDA	78.083.710-1	Servicios integrales de informática y servicios relacionados	Los carrera 444 Melipilla	coor_002	Trimestral	\N	\N	0	Activo	\N	2026-05-05 19:58:23	2026-06-10 15:31:47.84435+00
cli_arcor	ARCOR	INDUSTRIA DE ALIMENTOS DOS EN UNO S.A.	84.476.300-K	Fabrica de productos alimenticios, exportaciones	Placer 1324, Santiago	\N	Bimensual	\N	\N	0	Activo	\N	2026-05-05 19:58:23	2026-06-10 15:31:47.84435+00
cli_aza	AZA	ACEROS AZA S.A.	92.176.000-0	\N	La Unión N° 3070, Renca, RM, Santiago	\N	Mensual	\N	\N	0	Activo	\N	2026-05-05 19:58:23	2026-06-10 15:31:47.84435+00
cli_banco_internacional	BANCO INTERNACIONAL	BANCO INTERNACIONAL	97.011.000-3	\N	Apoquindo 6750, piso 12 - Las Condes, Santiago Región Metropolitana	\N	Mensual	\N	\N	0	Activo	\N	2026-05-06 15:16:26	2026-06-10 15:31:47.84435+00
cli_beco	BECO	BANCOESTADO SERVICIOS DE COBRANZA S.A.	96.900.150-0	\N	SAN DIEGO 81,  PISO 6	\N	Mensual	\N	\N	0	Activo	\N	2026-05-05 19:58:23	2026-06-10 15:31:47.84435+00
cli_bex	BANCO ESTADO EXPRESS	BANCO ESTADO CENTRO DE SERVICIOS S.A.	99.578.880-2	Sociedad de Apoyo al Giro bancario	Nueva York 9 Piso 3, Región Metropolitana de Santiago	coor_003	Mensual	\N	\N	0	Activo	\N	2026-05-05 19:58:23	2026-06-10 15:31:47.84435+00
cli_carozzi	CAROZZI	EMPRESAS CAROZZI S.A	96.591.040-9	Fabricación de Alimentos	Camino Longitudinal Sur 5210	\N	Mensual	\N	\N	0	Activo	\N	2026-05-05 19:58:23	2026-06-10 15:31:47.84435+00
cli_copec	COPEC	COPEC SA	99.520.000-7	Distribuidora de Combustibles, Servicios de Carga Eléctrica y Exportación.	El Bosque Norte N°0211/Isidora Goyenechea N°2915, Piso 20	coor_003	Mensual	\N	\N	0	Activo	\N	2026-05-05 19:58:23	2026-06-10 15:31:47.84435+00
cli_emin	EMIN	EMIN INGENIERÍA Y CONSTRUCCIÓN S.A	79.527.230-5	\N	Asturias 350 Piso 8, Las Condes, Santiago	\N	Mensual	\N	\N	0	Activo	\N	2026-05-05 19:58:23	2026-06-10 15:31:47.84435+00
cli_enaex	ENAEX	ENAEX S.A.	90.266.000-3	FABRICACION Y VENTA DE EXPLOSIVOS	EL TROVADOR 4253, Piso 5	coor_001	Mensual	\N	\N	0	Activo	\N	2026-05-05 19:58:23	2026-06-10 15:31:47.84435+00
7dcb28af-08ba-4b41-a8e0-6e9ab28c3a25	FLESAN	\N	\N	\N	\N	\N	Mensual	\N	\N	0	Activo	\N	2026-05-11 20:10:17	2026-06-10 15:31:47.84435+00
cli_magotteaux	MAGOTTEAUX	MAGOTTEAUX ANDINO S.A.	78.803.130-0	PRODUCTOS CHILENOS DE ACERO LIMITADA	KM 37 Panamericana Norte, Til Til 13227 - Santiago	\N	Mensual	\N	\N	0	Activo	\N	2026-05-05 19:58:23	2026-06-10 15:31:47.84435+00
cli_resiter	RESITER	LE GRAND CHIC SA	92.177.000-6	\N	Los Conquistadores 2752 - Providencia - Santiago	\N	Mensual	\N	\N	0	Activo	\N	2026-05-05 19:58:23	2026-06-10 15:31:47.84435+00
cli_salmones	SALMONES AUSTRAL	\N	\N	\N	\N	coor_001	Mensual	\N	\N	0	Activo	\N	2026-05-05 19:58:23	2026-06-10 15:31:47.84435+00
cli_transelect	TRANSELEC	TRANSELEC S.A	76.555.400-4	Transmisión eléctrica	Orinoco 90, piso 12. Las Condes	\N	Mensual	\N	\N	1	Activo	\N	2026-05-05 19:58:23	2026-06-10 15:31:47.84435+00
\.


--
-- Data for Name: cliente_coordinador; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.cliente_coordinador (id, cliente_id, coordinador_id, cp_id, activo, created_at, cp_nombre) FROM stdin;
a9270c82-5767-4360-8c9a-026aacac07a2	cli_afp_habitat	coor_004	702624bf-5b21-480e-b371-9918024eae6d	1	2026-05-06 16:20:54	DESEMPEÑO
\.


--
-- Data for Name: cliente_facturacion; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.cliente_facturacion (id, cliente_id, etiqueta, razon_social, rut, giro, direccion, activo, created_at, updated_at) FROM stdin;
fb5ef0c8-ee32-44cf-9663-ad4de18df048	cli_aristia	Datos cliente 2	SERVICIOS EMPRESARIALES PUANGUE	78.098.060-5	Inversiones y Servicios de apoyo a las empresas.	Los Carreras 444, melipilla.	1	2026-06-01 17:02:59	2026-06-01 17:02:59
aa96dfeb-8201-41b1-b723-fa985f3d7fee	cli_enaex	Datos cliente 2	ENAEX SERVICIOS SA	76.041.871-4	FABRICACION DE EXPLOSIVOS	EL TROVADOR 4253	1	2026-06-01 21:43:33	2026-06-01 21:43:33
\.


--
-- Data for Name: cliente_producto; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.cliente_producto (id, cliente_id, producto_id, vigencia_desde, vigencia_hasta, condiciones, activo, created_at) FROM stdin;
cada7985-62da-4ab2-9c15-c32aca343743	cli_afp_habitat	533135fd-a5ed-4fc5-a0e2-2b19737db650	\N	\N	{"source":"proyecciones_limpias_uf","codigo":"MS24213","producto":"LMS","tipo_impuesto":"EXENTO_IVA","mes":"JUNIO","estado":"PENDIENTE OC / HES","monto_uf":96.34,"monto_clp":3950000}	1	2026-05-05 19:58:23
06285cc0-076c-4f3d-9d35-62c01babc306	cli_afp_habitat	3475a303-b49a-4cdb-901a-5ad06b694b50	\N	\N	{"source":"proyecciones_limpias_uf","codigo":"MS25183","producto":"Gestión Capacitación","tipo_impuesto":"EXENTO_IVA","mes":"JUNIO","estado":"PENDIENTE OC / HES","monto_uf":120,"monto_clp":4920000}	1	2026-05-05 19:58:23
c50a6fe1-a396-4a2c-99c0-9a60b004090b	cli_afp_habitat	ab0f701c-54d4-4171-bc37-d46f98082042	\N	\N	{"source":"proyecciones_limpias_uf","codigo":"MS26077","producto":"Desempeño","tipo_impuesto":"EXENTO_IVA","mes":"OCTUBRE","estado":"PENDIENTE OC / HES","monto_uf":0,"monto_clp":0}	1	2026-05-05 19:58:23
efcc8c5c-ddf0-4a43-beb1-a8afeeb6d2fb	cli_afp_habitat	3a516d8c-f200-43ff-b350-93971275f600	\N	\N	{"source":"proyecciones_limpias_uf","codigo":"MS25185","producto":"Desempeño DNC","tipo_impuesto":"EXENTO_IVA","mes":"JUNIO","estado":"PENDIENTE OC / HES","monto_uf":70,"monto_clp":2870000}	1	2026-05-05 19:58:23
ffe97ea9-f5c7-4d99-b371-0f26e988894e	cli_afp_habitat	7faa2358-95aa-4030-9cb0-6d3b563f5f46	\N	\N	{"source":"proyecciones_limpias_uf","codigo":"MS25186","producto":"Reconocimiento","tipo_impuesto":"EXENTO_IVA","mes":"JUNIO","estado":"PENDIENTE OC / HES","monto_uf":168,"monto_clp":6888000}	1	2026-05-05 19:58:23
28ca7c60-cf67-4b83-ac50-5ec82b0d1686	cli_afp_habitat	3a003629-758e-4000-8e09-c0df44c54b21	\N	\N	{"source":"proyecciones_limpias_uf","codigo":"MS25187","producto":"Clima/Encuesta","tipo_impuesto":"EXENTO_IVA","mes":"JUNIO","estado":"PENDIENTE OC / HES","monto_uf":220,"monto_clp":9020000}	1	2026-05-05 19:58:23
a2cb5415-6cc4-4774-94c7-59ae4e33d137	cli_afp_habitat	c6da7f68-0545-4605-a9d2-4d1c5709c089	\N	\N	{"source":"proyecciones_limpias_uf","codigo":"MS25188","producto":"Talento","tipo_impuesto":"EXENTO_IVA","mes":"JUNIO","estado":"PENDIENTE OC / HES","monto_uf":170,"monto_clp":6970000}	1	2026-05-05 19:58:23
e8549a06-dee0-4572-9274-023b9dc16844	cli_andritz	3475a303-b49a-4cdb-901a-5ad06b694b50	\N	\N	{"source":"proyecciones_limpias_uf","codigo":"MS25135","producto":"Gestión Capacitación","tipo_impuesto":"EXENTO_IVA","mes":"DICIEMBRE","estado":"PENDIENTE OC / HES","monto_uf":168.05,"monto_clp":6890103}	1	2026-05-05 19:58:23
55aa88d4-9987-4e43-903b-d29da1fe5c47	cli_arcor	9d29e09e-14f0-406a-a8a1-de89fbafbd73	\N	\N	{"source":"proyecciones_limpias_uf","codigo":"MS25078","producto":"Talentos","tipo_impuesto":"AFECTO_IVA","mes":"OCTUBRE","estado":"PENDIENTE OC / HES","monto_uf":84.55,"monto_clp":3466666.67}	1	2026-05-05 19:58:23
a9dd3cf6-ca33-4166-af82-37f3d438d17a	cli_aristia	ab583239-16b9-43f3-9fc9-48354f71ee7f	\N	\N	{"source":"proyecciones_limpias_uf","codigo":"MS24233","producto":"Clima/Encuestas","tipo_impuesto":"EXENTO_IVA","mes":"ENERO","estado":"FACTURADO","monto_uf":0,"monto_clp":0}	1	2026-05-05 19:58:23
7bfa9951-272c-46c0-b588-5437dfb89976	cli_aristia	7faa2358-95aa-4030-9cb0-6d3b563f5f46	\N	\N	{"source":"proyecciones_limpias_uf","codigo":"MS26009","producto":"Reconocimiento","tipo_impuesto":"EXENTO_IVA","mes":"AGOSTO","estado":"PENDIENTE OC / HES","monto_uf":148.15,"monto_clp":6074100}	1	2026-05-05 19:58:23
fa219f48-a696-4d97-8a99-528463c4913f	cli_aristia	3475a303-b49a-4cdb-901a-5ad06b694b50	\N	\N	{"source":"proyecciones_limpias_uf","codigo":"MS26008","producto":"Gestión Capacitación","tipo_impuesto":"AFECTO_IVA","mes":"MAYO","estado":"PENDIENTE OC / HES","monto_uf":0,"monto_clp":0}	1	2026-05-05 19:58:23
789ca4d3-7529-46d5-83da-ed8205c5d35b	cli_avla	ab0f701c-54d4-4171-bc37-d46f98082042	\N	\N	{"source":"proyecciones_limpias_uf","codigo":"MS25016","producto":"Desempeño","tipo_impuesto":"AFECTO_IVA","mes":"ENERO","estado":"FACTURADO","monto_uf":38.77,"monto_clp":1589371}	1	2026-05-05 19:58:23
79414951-e801-41bb-8a44-3f452a4d5a96	cli_aza	3475a303-b49a-4cdb-901a-5ad06b694b50	\N	\N	{"source":"proyecciones_limpias_uf","codigo":"MS25003","producto":"Gestión Capacitación","tipo_impuesto":"EXENTO_IVA","mes":"JULIO","estado":"PENDIENTE OC / HES","monto_uf":346.83,"monto_clp":14220000}	1	2026-05-05 19:58:23
72275aaf-8e30-4a4f-a907-a842ab8b7007	cli_aza	533135fd-a5ed-4fc5-a0e2-2b19737db650	\N	\N	{"source":"proyecciones_limpias_uf","codigo":"MS25002","producto":"LMS","tipo_impuesto":"EXENTO_IVA","mes":"JULIO","estado":"PENDIENTE OC / HES","monto_uf":395.67,"monto_clp":16222572}	1	2026-05-05 19:58:23
bbb0e209-135a-4d18-a339-ddc8f19e4172	cli_bex	533135fd-a5ed-4fc5-a0e2-2b19737db650	\N	\N	{"source":"proyecciones_limpias_uf","codigo":"MS24197","producto":"LMS","tipo_impuesto":"EXENTO_IVA","mes":"OCTUBRE","estado":"PENDIENTE OC / HES","monto_uf":466.54,"monto_clp":19128000}	1	2026-05-05 19:58:23
626cfb4b-0aeb-4bae-a41b-052e08335a88	cli_bex	64904db3-d79d-476b-b587-9ab3266575bb	\N	\N	{"source":"proyecciones_limpias_uf","codigo":"MS24198","producto":"LMS CHATBOT","tipo_impuesto":"EXENTO_IVA","mes":"JUNIO","estado":"PENDIENTE OC / HES","monto_uf":57.8,"monto_clp":2370000}	1	2026-05-05 19:58:23
a665a2a7-be34-4e16-877b-8aaaabe1576f	cli_bex	3475a303-b49a-4cdb-901a-5ad06b694b50	\N	\N	{"source":"proyecciones_limpias_uf","codigo":"MS24199","producto":"Gestión Capacitación","tipo_impuesto":"EXENTO_IVA","mes":"OCTUBRE","estado":"PENDIENTE OC / HES","monto_uf":58.32,"monto_clp":2391000}	1	2026-05-05 19:58:23
6bf09faf-7450-4fc3-877a-2711df20d49f	cli_bex	ab0f701c-54d4-4171-bc37-d46f98082042	\N	\N	{"source":"proyecciones_limpias_uf","codigo":"MS24200","producto":"Desempeño","tipo_impuesto":"AFECTO_IVA","mes":"OCTUBRE","estado":"PENDIENTE OC / HES","monto_uf":262.43,"monto_clp":10759500}	1	2026-05-05 19:58:23
472422dc-ab6a-4ac5-9b18-f86fefbbac7b	cli_bex	ab583239-16b9-43f3-9fc9-48354f71ee7f	\N	\N	{"source":"proyecciones_limpias_uf","codigo":"MS24202","producto":"Clima/Encuestas","tipo_impuesto":"EXENTO_IVA","mes":"OCTUBRE","estado":"PENDIENTE OC / HES","monto_uf":204.11,"monto_clp":8368500}	1	2026-05-05 19:58:23
4c436dbb-d193-4cfe-9df8-486348e52926	cli_bex	7faa2358-95aa-4030-9cb0-6d3b563f5f46	\N	\N	{"source":"proyecciones_limpias_uf","codigo":"MS24203","producto":"Reconocimiento","tipo_impuesto":"AFECTO_IVA","mes":"DICIEMBRE","estado":"PENDIENTE OC / HES","monto_uf":64.07,"monto_clp":2626800}	1	2026-05-05 19:58:23
14e0c396-ff7b-4ea0-b406-76f7c2375b27	cli_bex	9d29e09e-14f0-406a-a8a1-de89fbafbd73	\N	\N	{"source":"proyecciones_limpias_uf","codigo":"MS24205","producto":"Talentos","tipo_impuesto":"EXENTO_IVA","mes":"OCTUBRE","estado":"PENDIENTE OC / HES","monto_uf":87.48,"monto_clp":3586500}	1	2026-05-05 19:58:23
758db20a-5643-4226-9787-38695d14c58a	cli_beco	533135fd-a5ed-4fc5-a0e2-2b19737db650	\N	\N	{"source":"proyecciones_limpias_uf","codigo":"MS24099","producto":"LMS","tipo_impuesto":"AFECTO_IVA","mes":"ENERO","estado":"FACTURADO","monto_uf":0,"monto_clp":0}	1	2026-05-05 19:58:23
279564fd-9284-4a00-a8ee-3fa7ff01936e	cli_carozzi	533135fd-a5ed-4fc5-a0e2-2b19737db650	\N	\N	{"source":"proyecciones_limpias_uf","codigo":"MS24014","producto":"LMS","tipo_impuesto":"EXENTO_IVA","mes":"DICIEMBRE","estado":"PENDIENTE OC / HES","monto_uf":439.02,"monto_clp":18000000}	1	2026-05-05 19:58:23
ab9ca014-70f6-4f85-b376-8793c5d4e6ca	cli_carozzi	3475a303-b49a-4cdb-901a-5ad06b694b50	\N	\N	{"source":"proyecciones_limpias_uf","codigo":"MS24015","producto":"Gestión Capacitación","tipo_impuesto":"EXENTO_IVA","mes":"DICIEMBRE","estado":"PENDIENTE OC / HES","monto_uf":72.26,"monto_clp":2962500}	1	2026-05-05 19:58:23
3106c93f-b8e3-44b0-ac37-c6dc87d787d7	cli_ccu	476540f4-19d9-4f4a-843c-63cda25c79ab	\N	\N	{"source":"proyecciones_limpias_uf","codigo":"MS26053","producto":"LMS TALLER IA","tipo_impuesto":"AFECTO_IVA","mes":"ENERO","estado":"FACTURADO","monto_uf":0,"monto_clp":0}	1	2026-05-05 19:58:23
4d873079-300a-471c-82f7-dbdb2ced48fb	cli_copec	ab0f701c-54d4-4171-bc37-d46f98082042	\N	\N	{"source":"proyecciones_limpias_uf","codigo":"MS25006","producto":"Desempeño","tipo_impuesto":"AFECTO_IVA","mes":"DICIEMBRE","estado":"PENDIENTE OC / HES","monto_uf":45.13,"monto_clp":1850400}	1	2026-05-05 19:58:23
e3ac2469-fc43-4c66-9c85-2333acf90d7f	cli_copec	9d29e09e-14f0-406a-a8a1-de89fbafbd73	\N	\N	{"source":"proyecciones_limpias_uf","codigo":"MS25007","producto":"Talentos","tipo_impuesto":"AFECTO_IVA","mes":"DICIEMBRE","estado":"PENDIENTE OC / HES","monto_uf":20.17,"monto_clp":826800}	1	2026-05-05 19:58:23
b90b4005-c7aa-4f1e-806d-f0850fc8f6ab	cli_emin	ab0f701c-54d4-4171-bc37-d46f98082042	\N	\N	{"source":"proyecciones_limpias_uf","codigo":"MS25076","producto":"Desempeño","tipo_impuesto":"AFECTO_IVA","mes":"DICIEMBRE","estado":"PENDIENTE OC / HES","monto_uf":71.02,"monto_clp":2912000}	1	2026-05-05 19:58:23
f13e8555-1863-4288-b17a-9afa2829a0ea	cli_enaex	3475a303-b49a-4cdb-901a-5ad06b694b50	\N	\N	{"source":"proyecciones_limpias_uf","codigo":"MS26002","producto":"Gestión Capacitación","tipo_impuesto":"EXENTO_IVA","mes":"OCTUBRE","estado":"PENDIENTE OC / HES","monto_uf":115.61,"monto_clp":4740000}	1	2026-05-05 19:58:23
cede3387-cfed-4a54-996c-5d487c580194	cli_enaex	533135fd-a5ed-4fc5-a0e2-2b19737db650	\N	\N	{"source":"proyecciones_limpias_uf","codigo":"MS26001","producto":"LMS","tipo_impuesto":"AFECTO_IVA","mes":"MAYO","estado":"PENDIENTE OC / HES","monto_uf":290.6,"monto_clp":11914472.08}	1	2026-05-05 19:58:23
7207ccf9-8d13-41b0-afc6-8021efd71ac6	cli_enaex	7faa2358-95aa-4030-9cb0-6d3b563f5f46	\N	\N	{"source":"proyecciones_limpias_uf","codigo":"MS26004","producto":"Reconocimiento","tipo_impuesto":"EXENTO_IVA","mes":"OCTUBRE","estado":"PENDIENTE OC / HES","monto_uf":231.22,"monto_clp":9480000}	1	2026-05-05 19:58:23
bd9e194d-2869-48f3-90d5-e22f1c7ccbb1	cli_magotteaux	7faa2358-95aa-4030-9cb0-6d3b563f5f46	\N	\N	{"source":"proyecciones_limpias_uf","codigo":"MS25013","producto":"Reconocimiento","tipo_impuesto":"AFECTO_IVA","mes":"DICIEMBRE","estado":"PENDIENTE OC / HES","monto_uf":17.56,"monto_clp":720000}	1	2026-05-05 19:58:23
0f18c7f4-018e-4998-992a-750e14086025	cli_resiter	533135fd-a5ed-4fc5-a0e2-2b19737db650	\N	\N	{"source":"proyecciones_limpias_uf","codigo":"MS21000","producto":"LMS","tipo_impuesto":"AFECTO_IVA","mes":"ENERO","estado":"FACTURADO","monto_uf":5.23,"monto_clp":214629.58}	1	2026-05-05 19:58:23
d86687b4-d72a-472f-aa13-9ee2a4d72b69	cli_salmones	f3b5b03b-6f2b-4f6f-b9f0-530aa17d321b	\N	\N	{"source":"proyecciones_limpias_uf","codigo":"MS26063","producto":"Liderazgo","tipo_impuesto":"AFECTO_IVA","mes":"MAYO","estado":"PENDIENTE OC / HES","monto_uf":97.56,"monto_clp":4000000}	1	2026-05-05 19:58:23
d57e4642-6b2c-4496-a4ea-68be752a7dfb	cli_soprole	ab0f701c-54d4-4171-bc37-d46f98082042	\N	\N	{"source":"proyecciones_limpias_uf","codigo":"MS25008","producto":"Desempeño","tipo_impuesto":"AFECTO_IVA","mes":"DICIEMBRE","estado":"PENDIENTE OC / HES","monto_uf":33.98,"monto_clp":1393000}	1	2026-05-05 19:58:23
e39478d7-5b56-40fd-9ac6-5dd30970790a	cli_transelect	533135fd-a5ed-4fc5-a0e2-2b19737db650	\N	\N	{"source":"proyecciones_limpias_uf","codigo":"MS25027","producto":"LMS","tipo_impuesto":"AFECTO_IVA","mes":"JUNIO","estado":"PENDIENTE OC / HES","monto_uf":57.8,"monto_clp":2370000}	1	2026-05-05 19:58:23
7c77b410-f668-4405-a8a0-ef131798e722	cli_banco_internacional	533135fd-a5ed-4fc5-a0e2-2b19737db650	\N	\N	{"source":"proyecciones_limpias_uf","codigo":"MS25159","producto":"LMS","tipo_impuesto":"EXENTO_IVA","mes":"ENERO","estado":"FACTURADO","monto_uf":0,"monto_clp":0}	1	2026-05-06 15:16:26
c85acdd3-8d5d-46b0-8f2f-177d90b6cee6	cli_banco_internacional	3475a303-b49a-4cdb-901a-5ad06b694b50	\N	\N	{"source":"proyecciones_limpias_uf","codigo":"MS25160","producto":"Gestión Capacitación","tipo_impuesto":"EXENTO_IVA","mes":"ENERO","estado":"FACTURADO","monto_uf":0,"monto_clp":0}	1	2026-05-06 15:16:26
\.


--
-- Data for Name: coordinador; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.coordinador (id, nombre, email, slack_user_id, activo, created_at) FROM stdin;
coor_007	MAS FINANZAS	\N	\N	1	2026-05-06 02:46:26
coor_001	MACARENA ABÁSOLO	\N	U07AKJLQCTY	1	2026-05-05 21:11:27
coor_002	MONICA DA ROCHA	\N	U09T7NL350T	1	2026-05-05 21:11:27
coor_003	DANIEL LLANES	\N	U07AKJLT4G6	1	2026-05-05 21:11:27
coor_004	CONSTANZA GAETE	\N	U0AR2F4G4F8	1	2026-05-05 21:11:27
\.


--
-- Data for Name: cp; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.cp (id, codigo, nombre, tipo_cp, area, cliente_id, activo, created_at) FROM stdin;
a690ea9e-7252-47f4-bc4e-c1a3563b3045	MS25182	LMS	Administración y Operación	\N	cli_afp_habitat	1	2026-05-05 19:58:23
de071ba4-51de-4aa8-885b-c3457db2541d	MS25183	GESTIÓN CAPACITACIÓN	Administración y Operación	\N	cli_afp_habitat	1	2026-05-05 19:58:23
702624bf-5b21-480e-b371-9918024eae6d	MS25184	DESEMPEÑO	Administración y Operación	\N	cli_afp_habitat	1	2026-05-05 19:58:23
b910957c-2e4b-4ceb-8e83-f2839239259d	MS25185	DESEMPEÑO DNC	Administración y Operación	\N	cli_afp_habitat	1	2026-05-05 19:58:23
25e80b51-3878-4786-92bf-cc2fa5e8c0e4	MS25186	RECONOCIMIENTO	Administración y Operación	\N	cli_afp_habitat	1	2026-05-05 19:58:23
19f10fff-2acb-45e5-bb5b-f811fb816bc0	MS25187	CLIMA/ENCUESTA	Administración y Operación	\N	cli_afp_habitat	1	2026-05-05 19:58:23
e0e4e9cc-e02b-49aa-a254-5df14c3d5aef	MS25188	TALENTO	Administración y Operación	\N	cli_afp_habitat	1	2026-05-05 19:58:23
d6818e92-4464-445c-9eff-4b7974a8dcbe	MS24213	LMS	Horas de Desarrollo	\N	cli_afp_habitat	1	2026-05-05 19:58:23
1cb355e4-1489-405e-8c06-885d100ef8b3	MS26077	DESEMPEÑO	Construcción	\N	cli_afp_habitat	1	2026-05-05 19:58:23
74f7c022-2569-4eb6-adac-4419dfdc0ab7	MS25135	GESTIÓN CAPACITACIÓN	Administración y Operación	\N	cli_andritz	1	2026-05-05 19:58:23
1dcd46c0-8e45-4b59-a9ce-c9c52b11ce40	MS25078	TALENTOS	Administración y Operación	\N	cli_arcor	1	2026-05-05 19:58:23
d467d8a3-d572-433a-9600-ab3e73adbe67	MS24233	CLIMA/ENCUESTAS	Administración y Operación	\N	cli_aristia	1	2026-05-05 19:58:23
27482b68-545a-483a-b5d3-e765bd5b4b6f	MS26010	RECONOCIMIENTO	Horas de Desarrollo	\N	cli_aristia	1	2026-05-05 19:58:23
9d1e1ba2-a63b-4881-a2ba-f2fec2f2ce67	MS26008	GESTIÓN CAPACITACIÓN	Administración y Operación	\N	cli_aristia	1	2026-05-05 19:58:23
0a9e7168-a75e-4d67-8357-5e2ef8075530	MS26009	RECONOCIMIENTO	Administración y Operación	\N	cli_aristia	1	2026-05-05 19:58:23
6e14e70e-c659-4e47-82cb-0158a8b2eca4	MS25016	DESEMPEÑO	Administración y Operación	\N	cli_avla	1	2026-05-05 19:58:23
a2727753-9bbb-4cd4-8edf-5196a619c9d5	MS25003	GESTIÓN CAPACITACIÓN	Administración y Operación	\N	cli_aza	1	2026-05-05 19:58:23
195cebe3-4628-4b5b-9904-e354fbc30a62	MS25002	LMS	Administración y Operación	\N	cli_aza	1	2026-05-05 19:58:23
5216a343-035e-4d4b-a65c-74b5525b8ab0	MS24197	LMS	Administración y Operación	\N	cli_bex	1	2026-05-05 19:58:23
9ebedbdd-fc25-4fb8-b515-625f5b6e7054	MS24198	LMS CHATBOT	Administración y Operación	\N	cli_bex	1	2026-05-05 19:58:23
5aefeea1-4fbc-4a1a-ac1e-10a501e246c7	MS24199	GESTIÓN CAPACITACIÓN	Administración y Operación	\N	cli_bex	1	2026-05-05 19:58:23
43636507-047d-4e10-9c16-996cb38dec76	MS24200	DESEMPEÑO	Administración y Operación	\N	cli_bex	1	2026-05-05 19:58:23
d1320643-545f-45dd-928f-86128fa80eeb	MS24202	CLIMA/ENCUESTAS	Administración y Operación	\N	cli_bex	1	2026-05-05 19:58:23
23b79374-f7b2-4ee3-a217-d07ddebb20e7	MS24203	RECONOCIMIENTO	Administración y Operación	\N	cli_bex	1	2026-05-05 19:58:23
55b330d8-ef4f-4d7e-8b2b-409f58c01dcc	MS24205	TALENTOS	Administración y Operación	\N	cli_bex	1	2026-05-05 19:58:23
9f91af01-8af8-42c3-92b1-d1e069397af7	MS25159	LMS	Administración y Operación	\N	cli_banco_internacional	1	2026-05-05 19:58:23
981659ce-7c22-49ec-9c6d-ebd237cc418b	MS25160	GESTIÓN CAPACITACIÓN	Administración y Operación	\N	cli_banco_internacional	1	2026-05-05 19:58:23
23e23bae-8b0c-4214-b163-edc6698f17d9	MS24099	LMS	Administración y Operación	\N	cli_beco	1	2026-05-05 19:58:23
753a5610-490b-49d3-ba1f-a8a748489876	MS24014	LMS	Administración y Operación	\N	cli_carozzi	1	2026-05-05 19:58:23
2a03f9fb-fcfe-4ed4-97ab-4e861ce735dc	MS24015	GESTIÓN CAPACITACIÓN	Administración y Operación	\N	cli_carozzi	1	2026-05-05 19:58:23
e9d67861-87a9-4bac-ad56-7d83591ea0a8	MS26053	LMS TALLER IA	Construcción	\N	cli_ccu	1	2026-05-05 19:58:23
e82e6e4a-8127-426f-ade5-b538f1999a4c	MS25006	DESEMPEÑO	Administración y Operación	\N	cli_copec	1	2026-05-05 19:58:23
5027ff97-c244-4295-8463-582673dd5b43	MS25007	TALENTOS	Administración y Operación	\N	cli_copec	1	2026-05-05 19:58:23
41a269d4-7854-40b0-93a0-35d8f2fdce17	MS25076	DESEMPEÑO	Administración y Operación	\N	cli_emin	1	2026-05-05 19:58:23
84796332-cb1d-4e62-a03a-c99d21117925	MS26002	GESTIÓN CAPACITACIÓN	Administración y Operación	\N	cli_enaex	1	2026-05-05 19:58:23
c6f50037-66e3-4a8b-ad2c-22094280f542	MS26001	LMS	Administración y Operación	\N	cli_enaex	1	2026-05-05 19:58:23
c8e755d7-60bc-41ad-8781-24e21d9e5306	MS26004	RECONOCIMIENTO	Administración y Operación	\N	cli_enaex	1	2026-05-05 19:58:23
53aed8bc-e4cf-4b76-a606-1a177b5f46ad	MS26005	LMS	Horas de Desarrollo	\N	cli_enaex	1	2026-05-05 19:58:23
ce57fcb5-7d76-4003-b938-73065171ad61	MS25013	RECONOCIMIENTO	Administración y Operación	\N	cli_magotteaux	1	2026-05-05 19:58:23
dc61fa21-857c-4396-8527-b96fb0703cab	MS21000	LMS	Administración y Operación	\N	cli_resiter	1	2026-05-05 19:58:23
8d9866f8-20c7-47c2-9a60-7e93c10c8a11	MS26063	LIDERAZGO	Administración y Operación	\N	cli_salmones	1	2026-05-05 19:58:23
95bb13b0-ad0b-4fea-b81c-fc1758e772a8	MS25027	LMS	Administración y Operación	\N	cli_transelect	1	2026-05-05 19:58:23
e429875a-d59e-4438-af2a-2c240fab737c	MS25008	PLATAFORMA NUTRIR SOPROLE — SPLIT A	Administración y Operación	MAS Plataformas	cli_soprole	1	2026-05-03 23:58:50
7777e15d-2f59-4121-ac3b-3ba978aa7eaf	MS25009	PLATAFORMA NUTRIR SOPROLE — SPLIT B	\N	MAS Plataformas	cli_soprole	1	2026-05-11 20:10:17
\.


--
-- Data for Name: desarrollador; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.desarrollador (id, nombre, email, equipo, activo, created_at) FROM stdin;
\.


--
-- Data for Name: documento_exportado; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.documento_exportado (id, solicitud_id, tipo, formato, version_plantilla, ruta, checksum, generado_at, generado_por) FROM stdin;
49f583ed-01ec-499b-bb51-6af3819e9c51	6b2c61bb-4ab8-4d74-80ae-b71bfc7e0d03	solicitud_factura_xlsx	xlsx	\N	SF-2026-00001_1777853440405.xlsx	\N	2026-05-04 00:10:40	usuario
7d413b6b-b78c-44ea-8feb-9b086e87c9fc	6b2c61bb-4ab8-4d74-80ae-b71bfc7e0d03	solicitud_factura_xlsx	xlsx	\N	SF-2026-00001_1777854184228.xlsx	\N	2026-05-04 00:23:04	usuario
b7ab6c50-c523-4592-9796-636fab9b5cff	6b2c61bb-4ab8-4d74-80ae-b71bfc7e0d03	solicitud_factura_xlsx	xlsx	\N	SF-2026-00001_1777854239707.xlsx	\N	2026-05-04 00:23:59	usuario
12788b64-de1c-4caf-8cfb-441e6590d6ac	6b2c61bb-4ab8-4d74-80ae-b71bfc7e0d03	solicitud_factura_xlsx	xlsx	\N	SF-2026-00001_1777909312480.xlsx	\N	2026-05-04 15:41:52	usuario
98197309-8688-4641-9fe2-216d96884577	127c8e80-0d99-424c-85dd-8a9d2339395f	solicitud_factura_xlsx	xlsx	\N	SF-2026-00004_1778033700870.xlsx	\N	2026-05-06 02:15:00	usuario
a89dbb3e-e307-4f5c-8005-d768ebd9d4d0	127c8e80-0d99-424c-85dd-8a9d2339395f	solicitud_factura_xlsx	xlsx	\N	SF-2026-00004_1778034109689.xlsx	\N	2026-05-06 02:21:49	usuario
17123436-e553-489c-a787-7c91cc743670	3e99f9ab-c36d-4ba9-94e3-32548f66d1be	solicitud_factura_xlsx	xlsx	\N	Solicitud_factura_TRANSELEC_MAYO.xlsx	\N	2026-05-06 03:03:23	usuario
c3aea839-5487-47e1-96d5-ee931899e2d4	3e99f9ab-c36d-4ba9-94e3-32548f66d1be	solicitud_factura_xlsx	xlsx	\N	Solicitud_factura_TRANSELEC_MAYO.xlsx	\N	2026-05-06 03:13:59	usuario
bbc3915c-71ee-4a8f-b9d8-8f1a1c2d5638	3e99f9ab-c36d-4ba9-94e3-32548f66d1be	solicitud_factura_xlsx	xlsx	\N	Solicitud_factura_TRANSELEC_MAYO.xlsx	\N	2026-05-06 03:33:36	usuario
46e86ba0-d797-4c73-acff-6502b40318ea	3e99f9ab-c36d-4ba9-94e3-32548f66d1be	solicitud_factura_xlsx	xlsx	\N	Solicitud_factura_TRANSELEC_MAYO.xlsx	\N	2026-05-06 03:34:33	usuario
3a5ec2ec-1ab3-4867-8de1-18ea6e2c5b93	3e99f9ab-c36d-4ba9-94e3-32548f66d1be	solicitud_factura_xlsx	xlsx	\N	Solicitud_factura_TRANSELEC_MAYO.xlsx	\N	2026-05-06 03:35:41	usuario
943ee213-c0b9-4928-add4-932bed7b931d	3e99f9ab-c36d-4ba9-94e3-32548f66d1be	solicitud_factura_xlsx	xlsx	\N	Solicitud_factura_TRANSELEC_MAYO.xlsx	\N	2026-05-06 19:36:56	usuario
b7937288-5e06-40f9-b901-21bef0d36600	a91476e8-ffc9-4800-8237-32b97574afe8	solicitud_factura_xlsx	xlsx	\N	Solicitud_factura_ENAEX_MAYO.xlsx	\N	2026-05-08 20:01:44	usuario
f067fcd1-e2e0-4c0e-ae27-87e14fd4e1c9	aa40cf8e-ac7a-45e6-8aae-600af11029c3	solicitud_factura_xlsx	xlsx	\N	Solicitud_factura_MAGOTTEAUX_MAYO.xlsx	\N	2026-05-11 15:09:49	usuario
f0c9ebdc-ff9e-440c-8bbc-e642a0b3e4f7	aa40cf8e-ac7a-45e6-8aae-600af11029c3	solicitud_factura_xlsx	xlsx	\N	Solicitud_factura_MAGOTTEAUX_MAYO.xlsx	\N	2026-05-11 15:46:33	usuario
3afdc887-0f12-4e3a-99ae-e48b286a2594	1ebc6410-acde-4035-a83d-61a0c2a23264	solicitud_factura_xlsx	xlsx	\N	Solicitud_factura_SOPROLE_MAYO.xlsx	\N	2026-05-13 16:40:30	usuario
c5ca46f9-b360-4af1-882e-6b7ad0f9dad4	fe5cea7d-416f-4815-83de-d9cf8f6d6faa	solicitud_factura_xlsx	xlsx	\N	Solicitud_factura_ENAEX_MAYO.xlsx	\N	2026-05-13 16:44:55	usuario
a4420b65-4c72-44de-8858-ad8bbd8137e5	a91476e8-ffc9-4800-8237-32b97574afe8	solicitud_factura_xlsx	xlsx	\N	Solicitud_factura_ENAEX_MAYO.xlsx	\N	2026-05-13 19:52:53	usuario
6d473d1d-d674-479e-a37f-204317367b26	a91476e8-ffc9-4800-8237-32b97574afe8	solicitud_factura_xlsx	xlsx	\N	Solicitud_factura_ENAEX_MAYO.xlsx	\N	2026-05-18 15:03:25	usuario
56cb9832-75a1-4783-91c4-a7c412ccdd66	aa40cf8e-ac7a-45e6-8aae-600af11029c3	solicitud_factura_xlsx	xlsx	\N	Solicitud_factura_MAGOTTEAUX_MAYO.xlsx	\N	2026-05-20 20:27:23	usuario
a9e99955-b50e-4cf0-aeb2-abac7d18b6db	74244347-73f3-4cff-92cc-b2b2ae652276	solicitud_factura_xlsx	xlsx	\N	Solicitud_factura_COPEC_MAYO.xlsx	\N	2026-05-27 19:41:42	usuario
709273ce-801b-41ac-886d-f8d7abc77cc1	74244347-73f3-4cff-92cc-b2b2ae652276	solicitud_factura_xlsx	xlsx	\N	Solicitud_factura_COPEC_MAYO.xlsx	\N	2026-05-27 19:42:52	usuario
fc87ebed-2770-4f32-b875-7bb64ad70f75	74244347-73f3-4cff-92cc-b2b2ae652276	solicitud_factura_xlsx	xlsx	\N	Solicitud_factura_COPEC_MAYO.xlsx	\N	2026-05-27 19:43:15	usuario
c0569cf7-40c4-49fc-a626-c735b760b393	1ebc6410-acde-4035-a83d-61a0c2a23264	solicitud_factura_xlsx	xlsx	\N	Solicitud_factura_SOPROLE_MAYO.xlsx	\N	2026-05-27 19:43:38	usuario
70b2829d-a66e-48ae-a447-ca00282314a3	a519697c-73fc-4173-a103-8518a075f761	solicitud_factura_xlsx	xlsx	\N	Solicitud_factura_COPEC_MAYO.xlsx	\N	2026-06-02 16:47:27	usuario
5b1520c9-8dda-41f0-bd96-7c7a270ba2ad	b9a5cc11-7136-4b4d-a9a9-457a75d2a24f	solicitud_factura_xlsx	xlsx	\N	Solicitud_factura_ARCOR_MAYO.xlsx	\N	2026-06-25 17:23:46.316483+00	usuario
b6a71895-3bb2-4fce-b805-3eca4bf57d31	2d01ee01-144e-4b06-9fc7-bedf82040cf0	solicitud_factura_xlsx	xlsx	\N	Solicitud_factura_COPEC_JUNIO.xlsx	\N	2026-06-26 15:23:57.746084+00	usuario
31df6009-3ac7-4e55-921b-c14008263d83	e27f44c9-de0d-4960-af2b-ee0ff5b1afee	solicitud_factura_xlsx	xlsx	\N	Solicitud_factura_AFP_HABITAT_JUNIO.xlsx	\N	2026-06-26 15:53:21.327083+00	usuario
a5584042-eaba-40e3-854d-2e2fdf3c750d	1be97ed8-cfad-4ec6-ae53-5d9ad1601b0d	solicitud_factura_xlsx	xlsx	\N	Solicitud_factura_AFP_HABITAT_JUNIO.xlsx	\N	2026-06-26 16:11:00.362013+00	usuario
9505220e-eb97-4116-b005-c153e9ea68f3	cf1915e3-4f74-4e38-8f56-43d0bc3d123b	solicitud_factura_xlsx	xlsx	\N	Solicitud_factura_AFP_HABITAT_JUNIO.xlsx	\N	2026-06-26 16:44:19.627462+00	usuario
b0477344-e3bb-4441-ba96-85f6a277083a	3b8d59c2-6f4d-49b8-9795-280e007afe76	solicitud_factura_xlsx	xlsx	\N	Solicitud_factura_COPEC_JUNIO.xlsx	\N	2026-06-26 20:17:11.352703+00	usuario
ef0866ef-add1-432d-bd25-d77b7e31ee57	e5c3a1a8-de16-4e8f-921e-4a2e490aa61d	solicitud_factura_xlsx	xlsx	\N	Solicitud_factura_AFP_HABITAT_JUNIO.xlsx	\N	2026-07-01 16:41:39.291498+00	usuario
3fbe68cb-7d2f-4350-bd28-d98d373a49b9	72ab8552-2cb2-4740-b663-144f340761e6	solicitud_factura_xlsx	xlsx	\N	Solicitud_factura_AFP_HABITAT_JUNIO.xlsx	\N	2026-07-01 17:53:15.20565+00	usuario
5b348891-87a7-490d-966a-a92d64aa5c2f	aeba8638-dc71-4a91-a453-7298951ad44f	solicitud_factura_xlsx	xlsx	\N	Solicitud_factura_AFP_HABITAT_JULIO.xlsx	\N	2026-07-07 15:45:07.108304+00	codex-e2e
\.


--
-- Data for Name: empresa_emisora; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.empresa_emisora (codigo, razon_social, rut, giro, direccion, telefono, afecto_iva, iva_pct) FROM stdin;
MAS_CAPACITACIONES	MAS CAPACITACIÓN	76.595.200-k	Capacitación	\N	\N	0	0
INSTITUTO_ROY	INSTITUTO ROI SPA	76.455.718-2	Servicios de Asesoría, Consultoría, Investigación, Desarrollo y Publicaciones de Materias a fines	\N	\N	1	0.19
INSTITUTO_ROI	INSTITUTO ROI SPA	76.455.718-2	Servicios de Asesoria, Consultoria, Investigacion, Desarrollo y Publicaciones de Materias afines	\N	\N	1	0.19
MAS_CONSULTORES	MAS CONSULTORES S.A.	78.757.340-1	Asesoría en Recursos Humanos	Hernando de Aguirre 268, Oficina 101, Providencia	225840090	1	0.19
MAS_CAPACITACION	MÁS CAPACITACIÓN	76.595.200-k	OTEC / Capacitación	\N	\N	0	0
\.


--
-- Data for Name: historial_estado; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.historial_estado (id, solicitud_id, estado_desde, estado_hacia, fecha, usuario, comentario) FROM stdin;
6d145b70-10a4-4b6d-8809-c73a6e5601d7	6b2c61bb-4ab8-4d74-80ae-b71bfc7e0d03	\N	Borrador	2026-05-04 00:08:26	sistema	Solicitud creada
3b9d6d1c-e59c-4744-99a4-53415d0bade8	6b2c61bb-4ab8-4d74-80ae-b71bfc7e0d03	Borrador	EnRevision	2026-05-04 00:08:34	usuario	Listo para revisar
81831244-8ef5-4631-aa8b-8d89924a757b	6b2c61bb-4ab8-4d74-80ae-b71bfc7e0d03	EnRevision	Aprobada	2026-05-04 00:10:40	usuario	Aprobado test
17f45702-7e94-42d1-86dd-9943bcdf56bc	21cbca08-7503-4b08-8b42-c290fafc0b88	\N	Borrador	2026-05-05 19:12:25	sistema	Solicitud creada
16203322-0683-4525-a300-36c75c4f78ec	3a59daf9-386e-4f0b-94a2-974263fe245a	\N	PENDIENTE OC / HES	2026-05-06 01:41:17	sistema	Solicitud creada
fb35b735-b813-4968-aeb2-f3d6d729fc5d	3a59daf9-386e-4f0b-94a2-974263fe245a	PENDIENTE OC / HES	FACTURA SOLICITADA	2026-05-06 01:41:17	sistema	Estado actualizado desde formulario
62fabf51-7c51-47b2-908c-588732d6084b	127c8e80-0d99-424c-85dd-8a9d2339395f	\N	PENDIENTE OC / HES	2026-05-06 02:12:04	sistema	Solicitud creada
506933a3-c652-41ec-9bea-45c4bba28d4f	127c8e80-0d99-424c-85dd-8a9d2339395f	PENDIENTE OC / HES	FACTURA SOLICITADA	2026-05-06 02:13:30	sistema	Estado actualizado desde formulario
ac99962d-478f-4df6-b2a9-8935ace17f84	67e22a2d-37c8-4c8f-a2ef-5c9ea3dc0eb9	\N	FACTURA SOLICITADA	2026-05-06 02:20:42	sistema	Solicitud creada
80f062b7-3344-43b8-8142-29c099a92712	23a25098-74ec-4a9c-9a9e-d81d6dfbefdc	\N	FACTURA SOLICITADA	2026-05-06 02:21:05	sistema	Solicitud creada
0165adf5-f4e4-4eab-bc4e-8c745b62578b	6767da9d-52b4-43db-ae29-a0d6b8dfba35	\N	FACTURA SOLICITADA	2026-05-06 02:28:04	sistema	Solicitud creada
e79d37e1-5bd7-4703-aa1a-26ebd39ba411	3e99f9ab-c36d-4ba9-94e3-32548f66d1be	\N	PENDIENTE OC / HES	2026-05-06 03:00:57	sistema	Solicitud creada
cd0d6674-fe3d-42f1-8e0b-0c3275ca3fe1	3e99f9ab-c36d-4ba9-94e3-32548f66d1be	PENDIENTE OC / HES	FACTURA SOLICITADA	2026-05-06 03:03:02	sistema	Estado actualizado desde formulario
c6a1b328-9609-4aff-b29b-43ca2db0c2ac	3e99f9ab-c36d-4ba9-94e3-32548f66d1be	FACTURA SOLICITADA	FACTURA SOLICITADA	2026-05-06 03:11:15	sistema	Estado actualizado desde formulario
ea76aff7-1940-4409-acf2-a053ca98fd0f	2b770da1-c051-43f1-9c6b-4e7f768c6cd2	\N	FACTURA SOLICITADA	2026-05-06 03:17:24	sistema	Solicitud creada
e4feae97-e860-45f6-a222-b4bb7744dc46	1ebc6410-acde-4035-a83d-61a0c2a23264	\N	PENDIENTE OC / HES	2026-05-06 15:37:47	sistema	Creada desde proyeccion proy_096
194154e4-0b42-4422-9847-28a9b625af52	3c1148de-9ede-499b-b5a7-15f3c0da1fe9	\N	PENDIENTE OC / HES	2026-05-06 15:38:17	sistema	Creada desde proyeccion proy_018
63c80d65-b87c-4a1d-807c-ea06afb7aaab	c3f69878-c7b5-47b9-a23a-88fc64ef8842	\N	PENDIENTE OC / HES	2026-05-06 15:38:54	sistema	Creada desde proyeccion proy_031
c69aee3c-132f-4e97-8f84-cda7e9cf2593	93bee80c-45b5-41ce-9c50-29ef33587624	\N	PENDIENTE OC / HES	2026-05-06 15:39:03	sistema	Creada desde proyeccion proy_040
2405c0dd-6ef6-4b36-90f2-67ac67b6f6c2	1a742b1a-dd75-47f5-9fd8-40bc0128a427	\N	PENDIENTE OC / HES	2026-05-06 15:39:06	sistema	Creada desde proyeccion proy_044
b0810874-a1e8-4ce5-94ec-4bc8f8aec36f	74244347-73f3-4cff-92cc-b2b2ae652276	\N	PENDIENTE OC / HES	2026-05-06 15:39:10	sistema	Creada desde proyeccion proy_049
d602f220-d22e-4933-a0eb-9719c0701013	ecccbd54-12ad-4eab-9628-0063c69daee5	\N	PENDIENTE OC / HES	2026-05-06 15:39:11	sistema	Creada desde proyeccion proy_057
7453ab00-dfb8-4e25-a210-eb59eed17f72	59dd0371-e9b0-4ac2-b7c1-23de4f1ba5be	\N	PENDIENTE OC / HES	2026-05-06 15:39:13	sistema	Creada desde proyeccion proy_065
6b565f75-dd94-448d-9d11-7fa260bbe66b	63465b42-92c9-4853-b911-8c0adb5a5daa	\N	PENDIENTE OC / HES	2026-05-06 15:39:14	sistema	Creada desde proyeccion proy_073
c08308b4-cc6f-4c3e-9ba1-d5268519af96	a91476e8-ffc9-4800-8237-32b97574afe8	\N	PENDIENTE OC / HES	2026-05-06 15:39:16	sistema	Creada desde proyeccion proy_075
e321bd66-ede8-4ba3-af40-4b965d07a43b	35a5142d-995f-494c-962d-660411d86f6a	\N	PENDIENTE OC / HES	2026-05-06 15:39:18	sistema	Creada desde proyeccion proy_083
74ae62dc-4e24-4e01-a68a-614b3e8cb109	aa40cf8e-ac7a-45e6-8aae-600af11029c3	\N	PENDIENTE OC / HES	2026-05-06 15:39:20	sistema	Creada desde proyeccion proy_086
7fbb9519-6e72-4201-b16b-c73183d07df8	65dd05e6-e51b-42f8-a924-e5017f4babd1	\N	PENDIENTE OC / HES	2026-05-06 15:39:23	sistema	Creada desde proyeccion proy_095
8d13a4b3-a709-40c9-b39f-325312bd6b61	3dc583da-9119-4223-b299-5210c1896702	\N	PENDIENTE OC / HES	2026-05-06 16:57:32	sistema	Creada desde proyeccion proy_106
81451072-044a-4536-9558-d05bac78c123	a91476e8-ffc9-4800-8237-32b97574afe8	PENDIENTE OC / HES	FACTURA SOLICITADA	2026-05-08 20:01:43	sistema	Estado actualizado desde formulario
7dc6edbd-7304-453f-bf6d-d2a41e775abe	aa40cf8e-ac7a-45e6-8aae-600af11029c3	PENDIENTE OC / HES	FACTURA SOLICITADA	2026-05-11 15:09:47	sistema	Estado actualizado desde formulario
39041d52-e078-4e06-97de-b891d205fa99	a91476e8-ffc9-4800-8237-32b97574afe8	FACTURA SOLICITADA	FACTURA SOLICITADA	2026-05-11 15:26:21	sistema	Estado actualizado desde formulario
00f2cbf3-95ad-4852-998e-b47f88930b21	fe5cea7d-416f-4815-83de-d9cf8f6d6faa	\N	PENDIENTE OC / HES	2026-05-13 13:57:48	sistema	Creada desde proyeccion proy_075
69e7d843-0f07-48d2-982f-1ba07369ecc3	1ebc6410-acde-4035-a83d-61a0c2a23264	PENDIENTE OC / HES	FACTURA SOLICITADA	2026-05-13 16:40:28	sistema	Estado actualizado desde formulario
c425d0f6-b97b-4e3d-85c1-c6bceb7e5901	fe5cea7d-416f-4815-83de-d9cf8f6d6faa	PENDIENTE OC / HES	FACTURA SOLICITADA	2026-05-13 16:44:55	sistema	Estado actualizado desde formulario
ac2ad04d-4dea-4cd7-8401-b3b971d6bae3	c130914e-2edc-4a0c-9a58-a630dff1065c	\N	PENDIENTE OC / HES	2026-05-13 18:41:28	sistema	Creada desde proyeccion proy_075
1aba5c7c-b031-417d-b0e2-4c14f70819f5	f316c25a-1e38-48d0-8993-f426c9c1f070	\N	PENDIENTE OC / HES	2026-05-14 19:54:12	sistema	Creada desde proyeccion proy_075
a18e149a-d3c1-4b9f-8220-9a5eb3ae4d93	95e51a0a-b2f0-4655-b6cc-9031a7fc349c	\N	PENDIENTE OC / HES	2026-05-14 19:54:31	sistema	Creada desde proyeccion proy_075
e84d2e3f-6dc0-4450-8875-82a5756ba784	55008c9e-6606-4bb3-872f-4ec6fecc03e6	\N	PENDIENTE OC / HES	2026-05-14 19:54:41	sistema	Creada desde proyeccion proy_075
2785a484-4d12-4eeb-ad95-36c8b42f3c79	464fa580-5850-4025-8ae4-a1268e6f2301	\N	PENDIENTE OC / HES	2026-05-14 19:55:15	sistema	Creada desde proyeccion proy_075
ed54aa8d-503e-445d-b8b3-e3a7b65313ec	545ecbac-b1df-430f-9849-9de18b0523f9	\N	PENDIENTE OC / HES	2026-05-14 19:57:41	sistema	Creada desde proyeccion proy_075
2ff940c9-45f6-4b05-8a3e-520c8ba5da78	b9a5cc11-7136-4b4d-a9a9-457a75d2a24f	\N	PENDIENTE OC / HES	2026-05-25 15:48:13	carga-solicitudes-2026	Solicitud creada
2e1a41c8-00a3-4cfa-adb1-17db7f238138	9480067b-ffd1-435f-82d9-33a6e6c2f8d8	\N	PENDIENTE OC / HES	2026-05-25 15:48:13	carga-solicitudes-2026	Solicitud creada
21898f35-2dac-41aa-8a06-f74d64a077cb	34644598-a822-4d9f-912e-9ca5265b2d3b	\N	PENDIENTE OC / HES	2026-05-25 15:48:13	carga-solicitudes-2026	Solicitud creada
b7e502f8-d239-4f90-92ec-3543219ed0b3	4a9336cd-3d12-4112-bd43-0f29add4a6a0	\N	PENDIENTE OC / HES	2026-05-25 15:48:13	carga-solicitudes-2026	Solicitud creada
acf8b585-66e6-49f0-9b5e-669000e9f2ac	fced3f1a-4078-4bb4-b04c-6bcce3ff8955	\N	PENDIENTE OC / HES	2026-05-25 15:48:13	carga-solicitudes-2026	Solicitud creada
1ffac8b9-d02d-4f03-b2fa-06c22ea08ec3	0de2bf92-fd44-45c0-8a9c-3dd2302767b5	\N	PENDIENTE OC / HES	2026-05-25 15:48:13	carga-solicitudes-2026	Solicitud creada
1f29e08c-407e-4d2d-b05d-0e8f031e3af7	fadf8375-3d9f-4354-8157-5fc128a0a76a	\N	PENDIENTE OC / HES	2026-05-25 15:48:13	carga-solicitudes-2026	Solicitud creada
5d432b31-e51f-4105-b023-5146006d3b43	59a029c7-3025-418d-a90a-1e1a4128a2ef	\N	PENDIENTE OC / HES	2026-05-25 15:48:13	carga-solicitudes-2026	Solicitud creada
b1c63811-2760-46c6-97de-1f8b966914ef	97c4fc89-34e5-48ef-a7b6-5413bd33c351	\N	PENDIENTE OC / HES	2026-05-25 15:48:13	carga-solicitudes-2026	Solicitud creada
80dc1284-0a99-40e5-b92e-478591b1a3d8	a3804a5e-7fd8-4c88-9ecd-33f1e7e31a2d	\N	PENDIENTE OC / HES	2026-05-25 15:48:13	carga-solicitudes-2026	Solicitud creada
07bee357-0dd7-4265-884a-1a1fde20ff94	ab885469-199f-435e-870f-d439ebcd9ec6	\N	PENDIENTE OC / HES	2026-05-25 15:48:13	carga-solicitudes-2026	Solicitud creada
a5256d34-cc78-44fd-8a04-febd9bf9de9b	6a07c314-d52d-4a6b-8b58-bb93d2919b1f	\N	PENDIENTE OC / HES	2026-05-25 15:48:13	carga-solicitudes-2026	Solicitud creada
59c51031-b2ea-43d3-bc1c-1b3a3ae2a697	f386e201-90ab-463d-8e52-a89e98d71fdd	\N	PENDIENTE OC / HES	2026-05-25 15:48:13	carga-solicitudes-2026	Solicitud creada
bcea21d3-979e-4831-abf0-85c4bae26dd7	04943fec-1ce4-4771-96f3-690e41b918a2	\N	PENDIENTE OC / HES	2026-05-25 15:48:13	carga-solicitudes-2026	Solicitud creada
8233fa4f-b111-4f7a-9d3d-03044fe43c57	a519697c-73fc-4173-a103-8518a075f761	\N	PENDIENTE OC / HES	2026-05-25 15:48:13	carga-solicitudes-2026	Solicitud creada
824333db-aad1-43bb-b0ea-6c95538e6c60	72e0042b-7c4e-47d4-a075-7109c70865f9	\N	PENDIENTE OC / HES	2026-05-25 15:48:13	carga-solicitudes-2026	Solicitud creada
e80dfbf6-5859-424b-86b6-7884aa5c7ccc	7ec6b974-35cc-42ae-86a8-a00755954a9b	\N	PENDIENTE OC / HES	2026-05-25 15:48:13	carga-solicitudes-2026	Solicitud creada
059c2b49-90f0-44aa-a070-181b456ebc4f	68dfbdb5-5902-47a1-b4a4-01b2853f599d	\N	PENDIENTE OC / HES	2026-05-25 15:48:13	carga-solicitudes-2026	Solicitud creada
a91cb235-5f6a-4a24-a30c-1a8b7c52ad4f	515f97fb-05c9-4ce0-af55-bbed457a08ee	\N	PENDIENTE OC / HES	2026-05-25 15:48:13	carga-solicitudes-2026	Solicitud creada
8808742b-d774-44f3-a2f2-4eb814038cb3	30f486f2-f449-4e43-9d69-941d198a59e6	\N	PENDIENTE OC / HES	2026-05-25 15:48:13	carga-solicitudes-2026	Solicitud creada
d7c5891d-48a8-4350-a3c4-21e3b2ed99b0	f744aed4-dcd3-43a5-9a21-e003ce769f67	\N	PENDIENTE OC / HES	2026-05-25 15:48:13	carga-solicitudes-2026	Solicitud creada
84d7259e-e7cf-47cc-b43b-f8c323078a4a	c70310b1-e8b7-4bc0-802c-a6ca91a279d8	\N	PENDIENTE OC / HES	2026-05-25 15:48:13	carga-solicitudes-2026	Solicitud creada
21eea6b8-e233-47ed-b31c-fe4ec2de1698	b255ca53-f3eb-4732-af12-cd945f095fe9	\N	PENDIENTE OC / HES	2026-05-25 15:48:13	carga-solicitudes-2026	Solicitud creada
0d2199f2-9a5e-43d3-bb57-ff5aaa344dd6	9cbdc2e9-c1af-414e-ac52-498d9282a2a6	\N	PENDIENTE OC / HES	2026-05-25 15:48:13	carga-solicitudes-2026	Solicitud creada
e805a666-f516-4fd8-902c-35aa5b8e2193	b0c1aab4-3f5f-476a-8a24-8c8d33111ce6	\N	PENDIENTE OC / HES	2026-05-25 15:48:13	carga-solicitudes-2026	Solicitud creada
7e6793c0-45ca-4607-94b4-6468e4d112e7	5aaf9575-fdfd-4f0d-a062-51fe215a5167	\N	PENDIENTE OC / HES	2026-05-25 15:48:13	carga-solicitudes-2026	Solicitud creada
b6f66bbe-f2a1-4ac3-99c2-882287f28ae9	39dce8b7-d452-4c06-a9d1-7d524c74f1ce	\N	PENDIENTE OC / HES	2026-05-25 15:48:13	carga-solicitudes-2026	Solicitud creada
e9718fd7-651a-4b74-9e43-2027639a49b8	45cea2d5-f7cc-46b9-b5d1-5dc017d5e4e0	\N	PENDIENTE OC / HES	2026-05-25 15:48:13	carga-solicitudes-2026	Solicitud creada
cedb65e1-7929-4230-89ae-ec2213cd8727	541641a6-78b6-43bb-9c0c-d63853dd5e98	\N	PENDIENTE OC / HES	2026-05-25 15:48:13	carga-solicitudes-2026	Solicitud creada
f2667366-4b64-4be8-b6fc-dcd723711be7	81968ec2-cf44-496f-9e01-a98eff2ac718	\N	PENDIENTE OC / HES	2026-05-25 15:48:13	carga-solicitudes-2026	Solicitud creada
6b6c6680-0423-4790-8513-1585c8d3350a	61aa55d4-d219-47c9-a8ad-43e6ecaafc9d	\N	PENDIENTE OC / HES	2026-05-25 15:48:13	carga-solicitudes-2026	Solicitud creada
48d5647c-a2b2-45c9-9a59-5a107fa94441	e7e8f834-1867-40d0-94d1-2e0edb822937	\N	PENDIENTE OC / HES	2026-05-25 15:48:13	carga-solicitudes-2026	Solicitud creada
77208c67-b2b9-42c4-b812-a33406175d97	e00a4764-d7e7-428d-bf38-bb14a4f97eb8	\N	PENDIENTE OC / HES	2026-05-25 15:48:13	carga-solicitudes-2026	Solicitud creada
ed88f672-c76a-46dd-ac57-3c993392d70c	708f2199-14e0-4f2e-b15b-5ce1bca884e6	\N	PENDIENTE OC / HES	2026-05-25 15:48:13	carga-solicitudes-2026	Solicitud creada
719b36c4-d698-4226-8468-beebf7b7cc49	a5c78a1c-506f-4392-b655-ddaa24064b4c	\N	PENDIENTE OC / HES	2026-05-25 15:48:13	carga-solicitudes-2026	Solicitud creada
7829d04c-acb3-4580-8477-44c093b8ef53	5f198a21-bb8a-4738-9b3a-c582ea366e63	\N	PENDIENTE OC / HES	2026-05-25 15:48:13	carga-solicitudes-2026	Solicitud creada
b53093b3-a19b-466e-b83c-eb308a6837f6	ce422bc7-e2ae-4100-8db8-bf33e6ef5201	\N	PENDIENTE OC / HES	2026-05-25 15:48:13	carga-solicitudes-2026	Solicitud creada
205255a7-6c3a-4feb-aea4-da3e1ccbe4ed	74244347-73f3-4cff-92cc-b2b2ae652276	PENDIENTE OC / HES	FACTURA SOLICITADA	2026-05-27 19:41:42	sistema	Estado actualizado desde formulario
bbe298b2-0ee7-4702-b6f5-e685667606db	a519697c-73fc-4173-a103-8518a075f761	PENDIENTE OC / HES	FACTURA SOLICITADA	2026-06-01 15:37:59	sistema	Estado actualizado desde formulario
060a4006-d026-44ec-902b-845f48560ccc	59a029c7-3025-418d-a90a-1e1a4128a2ef	PENDIENTE OC / HES	FACTURA SOLICITADA	2026-06-01 15:39:04	sistema	Estado actualizado desde formulario
69c62bf3-5e8d-4aad-963f-fdb00111c3f9	b9a5cc11-7136-4b4d-a9a9-457a75d2a24f	PENDIENTE OC / HES	FACTURA SOLICITADA	2026-06-01 15:46:20	sistema	Estado actualizado desde formulario
2dcb9978-c737-49a7-9fd4-521a6b483827	e118f729-387d-4beb-8c4f-57ce9cb59e71	\N	PENDIENTE OC / HES	2026-06-01 16:45:13	sistema	Solicitud creada
3bd6ef60-1791-4e59-9fda-d228bcd8cdf7	e118f729-387d-4beb-8c4f-57ce9cb59e71	PENDIENTE OC / HES	FACTURA SOLICITADA	2026-06-01 16:45:17	sistema	Estado actualizado desde formulario
459d70af-b1bb-4c8e-8bec-723270b86596	3dc583da-9119-4223-b299-5210c1896702	PENDIENTE OC / HES	FACTURA SOLICITADA	2026-06-01 17:36:33	sistema	Estado actualizado desde formulario
5adfa382-9973-4220-81e4-cc535326f727	59a029c7-3025-418d-a90a-1e1a4128a2ef	FACTURA SOLICITADA	PENDIENTE OC / HES	2026-06-01 17:41:09	sistema	Estado actualizado desde formulario
e04a9b30-7163-4fb2-9953-5d363815dd10	42bbc224-ef71-4895-8479-c7a173d51930	\N	PENDIENTE OC / HES	2026-06-01 20:13:50	sistema	Solicitud creada
6e97f7a6-1618-4aac-94cb-d9f78312bc25	197b6317-1e51-4d4d-9f34-6e26a13a4e8f	\N	PENDIENTE OC / HES	2026-06-01 20:15:09	sistema	Solicitud creada
e18aec80-9ab4-4f4c-8e25-a7b6862615de	7afcd067-c5f0-4570-86d9-21fbb1c6d0e3	\N	PENDIENTE OC / HES	2026-06-01 20:16:01	sistema	Solicitud creada
0fd899da-3302-41f2-9b0f-7e2f7c506d74	65dd05e6-e51b-42f8-a924-e5017f4babd1	PENDIENTE OC / HES	PENDIENTE OC / HES	2026-06-02 16:40:09	migration-022	Solicitud inactivada: no tenia receptores y el cliente no tiene receptores activos
6d45deb7-8233-4cdb-b4b7-a4e01ac731a3	541641a6-78b6-43bb-9c0c-d63853dd5e98	PENDIENTE OC / HES	PENDIENTE OC / HES	2026-06-02 16:40:09	migration-022	Solicitud inactivada: no tenia receptores y el cliente no tiene receptores activos
78366360-cec4-416c-b78f-084ff6115e69	2d01ee01-144e-4b06-9fc7-bedf82040cf0	\N	PENDIENTE OC / HES	2026-06-26 15:23:37.706038+00	sistema	Duplicada desde SF-2026-00071
4cacd206-1e01-4ace-92eb-bd19c9ea8451	2d01ee01-144e-4b06-9fc7-bedf82040cf0	PENDIENTE OC / HES	FACTURA SOLICITADA	2026-06-26 15:23:57.608113+00	sistema	Estado actualizado desde formulario
a5fb352c-628a-4f2a-8bef-81f82c812c56	e27f44c9-de0d-4960-af2b-ee0ff5b1afee	\N	PENDIENTE OC / HES	2026-06-26 15:53:21.13862+00	sistema	Solicitud creada
3153ed9f-c53c-4936-b7e7-3c2329c5be46	e27f44c9-de0d-4960-af2b-ee0ff5b1afee	PENDIENTE OC / HES	FACTURA SOLICITADA	2026-06-26 15:53:21.208959+00	sistema	Estado actualizado desde formulario
31fdfed4-3f78-4e97-be1a-af5e2c98a692	1be97ed8-cfad-4ec6-ae53-5d9ad1601b0d	\N	PENDIENTE OC / HES	2026-06-26 16:09:16.284554+00	sistema	Solicitud creada
ae1eca70-62d1-45d3-a019-bf0584d446b4	1be97ed8-cfad-4ec6-ae53-5d9ad1601b0d	PENDIENTE OC / HES	FACTURA SOLICITADA	2026-06-26 16:11:00.245096+00	sistema	Estado actualizado desde formulario
86b5e4b3-f772-44cc-af1e-62a16bb81450	7b12599c-2837-45d5-8d2a-2b965278a337	\N	PENDIENTE OC / HES	2026-06-26 16:17:32.865959+00	sistema	Solicitud creada
48cd044f-b538-4d2d-9204-4239669f1559	ae7366e1-5a90-4690-b612-c339f928f22a	\N	PENDIENTE OC / HES	2026-06-26 16:18:07.278207+00	sistema	Duplicada desde SF-2026-00074
a7220fa5-a372-4dc2-9d74-be9771c57885	a1e8b706-9a8d-4c7d-9303-f3c454c0de44	\N	PENDIENTE OC / HES	2026-06-26 16:18:44.240784+00	sistema	Duplicada desde SF-2026-00076
52d90f39-e2bf-4ffd-bf9c-bc7d7141778f	cf1915e3-4f74-4e38-8f56-43d0bc3d123b	\N	FACTURA SOLICITADA	2026-06-26 16:44:19.474088+00	sistema	Solicitud creada
b127e177-4858-429a-a62c-cd51d0633f9f	3b8d59c2-6f4d-49b8-9795-280e007afe76	\N	FACTURA SOLICITADA	2026-06-26 20:17:11.188498+00	sistema	Solicitud creada
2e4ed135-304a-4079-9a59-34fac620f3c5	e5c3a1a8-de16-4e8f-921e-4a2e490aa61d	\N	FACTURA SOLICITADA	2026-07-01 16:41:39.109455+00	sistema	Solicitud creada
f5efa049-89d6-4ceb-9ef0-80d2ed68f84a	72ab8552-2cb2-4740-b663-144f340761e6	\N	FACTURA SOLICITADA	2026-07-01 17:53:15.001097+00	sistema	Solicitud creada
19786a13-629e-4240-8558-d46c0ba19b7a	aeba8638-dc71-4a91-a453-7298951ad44f	\N	PENDIENTE OC / HES	2026-07-07 15:45:06.937935+00	codex-e2e	Solicitud creada
8ae0fe49-df79-4ebe-9609-c7ad37f9c928	aeba8638-dc71-4a91-a453-7298951ad44f	PENDIENTE OC / HES	FACTURA SOLICITADA	2026-07-07 15:45:06.989736+00	codex-e2e	E2E Codex
\.


--
-- Data for Name: producto; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.producto (id, codigo, nombre, categoria, activo, created_at) FROM stdin;
533135fd-a5ed-4fc5-a0e2-2b19737db650	\N	LMS	\N	1	2026-05-05 19:58:23
3475a303-b49a-4cdb-901a-5ad06b694b50	\N	GESTIÓN CAPACITACIÓN	\N	1	2026-05-05 19:58:23
ab0f701c-54d4-4171-bc37-d46f98082042	\N	DESEMPEÑO	\N	1	2026-05-05 19:58:23
3a516d8c-f200-43ff-b350-93971275f600	\N	DESEMPEÑO DNC	\N	1	2026-05-05 19:58:23
7faa2358-95aa-4030-9cb0-6d3b563f5f46	\N	RECONOCIMIENTO	\N	1	2026-05-05 19:58:23
3a003629-758e-4000-8e09-c0df44c54b21	\N	CLIMA/ENCUESTA	\N	1	2026-05-05 19:58:23
c6da7f68-0545-4605-a9d2-4d1c5709c089	\N	TALENTO	\N	1	2026-05-05 19:58:23
9d29e09e-14f0-406a-a8a1-de89fbafbd73	\N	TALENTOS	\N	1	2026-05-05 19:58:23
ab583239-16b9-43f3-9fc9-48354f71ee7f	\N	CLIMA/ENCUESTAS	\N	1	2026-05-05 19:58:23
64904db3-d79d-476b-b587-9ab3266575bb	\N	LMS CHATBOT	\N	1	2026-05-05 19:58:23
476540f4-19d9-4f4a-843c-63cda25c79ab	\N	LMS TALLER IA	\N	1	2026-05-05 19:58:23
f3b5b03b-6f2b-4f6f-b9f0-530aa17d321b	\N	LIDERAZGO	\N	1	2026-05-05 19:58:23
\.


--
-- Data for Name: proyeccion; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.proyeccion (id, anio, iva, ms, proyecto, cliente_id, cliente, dp, cp, producto, tipo_cp, venta, mes, monto, monto_uf, monto_clp_referencia, estado, source, source_row, created_at, updated_at) FROM stdin;
d27c616b-38c3-4cde-8d84-6cc95e110941	2026	EXENTO_IVA	MS25182	Plataforma LMS 2026-2027	cli_afp_habitat	AFP HABITAT	VG	MA	LMS	Administración y Operación	3.69e+07	1	3.2704e+07	\N	3.2704e+07	\N	C:\\Users\\gcons\\Downloads\\20. Proyecciones Plataformas 14.05.2026.xlsx	3	2026-05-18 15:29:30	2026-05-18 16:42:45
1db3eb85-bb92-436d-ac6b-82d76fcd3d57	2026	EXENTO_IVA	MS25182	Plataforma LMS 2026-2027	cli_afp_habitat	AFP HABITAT	VG	MA	LMS	Administración y Operación	3.69e+07	5	4.196e+06	102.34146	4.196e+06	\N	C:\\Users\\gcons\\Downloads\\20. Proyecciones Plataformas 14.05.2026.xlsx	3	2026-05-18 15:29:30	2026-05-18 16:42:45
3440c560-4f6c-4e5f-9acb-a561ba1e55e0	2026	EXENTO_IVA	MS25183	Plataforma GC 2026-2027	cli_afp_habitat	AFP HABITAT	VG	MA	Gestión Capacitación	Administración y Operación	4.92e+06	5	4.92e+06	120	4.92e+06	\N	C:\\Users\\gcons\\Downloads\\20. Proyecciones Plataformas 14.05.2026.xlsx	4	2026-05-18 15:29:30	2026-05-18 16:42:45
11381483-b8a1-40aa-b8cd-e5fbd5750144	2026	AFECTO_IVA	MS25184	Plataforma SGD 2026-2027	cli_afp_habitat	AFP HABITAT	VG	CG	Desempeño	Administración y Operación	1.7785344e+07	3	1.7785344e+07	446.4	1.7785344e+07	\N	C:\\Users\\gcons\\Downloads\\20. Proyecciones Plataformas 14.05.2026.xlsx	5	2026-05-18 15:29:30	2026-05-18 16:42:45
d150fefa-d73d-4284-aed4-ee9d4b8abc67	2026	EXENTO_IVA	MS25185	Plataforma DNC 2026-2027	cli_afp_habitat	AFP HABITAT	VG	MA	Desempeño	Administración y Operación	2.87e+06	5	2.87e+06	70	2.87e+06	\N	C:\\Users\\gcons\\Downloads\\20. Proyecciones Plataformas 14.05.2026.xlsx	6	2026-05-18 15:29:30	2026-05-18 16:42:45
0bd1e372-36a8-4f13-bd85-dcf146e48ac9	2026	EXENTO_IVA	MS25186	Plataforma Reconocimiento 2026-2027	cli_afp_habitat	AFP HABITAT	VG	CG	Reconocimiento	Administración y Operación	7.569268e+06	5	7.569268e+06	184.61629	7.569268e+06	\N	C:\\Users\\gcons\\Downloads\\20. Proyecciones Plataformas 14.05.2026.xlsx	7	2026-05-18 15:29:30	2026-05-18 16:42:45
3fbc38f2-e08a-4baf-a7a7-999093305e36	2026	EXENTO_IVA	MS25187	Plataforma Clima 2026-2027	cli_afp_habitat	AFP HABITAT	VG	CG	Clima/Encuestas	Administración y Operación	9.02e+06	5	9.02e+06	220	9.02e+06	\N	C:\\Users\\gcons\\Downloads\\20. Proyecciones Plataformas 14.05.2026.xlsx	8	2026-05-18 15:29:30	2026-05-18 16:42:45
14a4bf2f-abf1-457a-878e-6aab62722405	2026	EXENTO_IVA	MS25188	Plataforma Talento 2026-2027	cli_afp_habitat	AFP HABITAT	VG	CG	Talentos	Administración y Operación	6.97e+06	1	2.3834472e+06	60	2.3834472e+06	\N	C:\\Users\\gcons\\Downloads\\20. Proyecciones Plataformas 14.05.2026.xlsx	9	2026-05-18 15:29:30	2026-05-18 16:42:45
fc36d99b-0585-42a5-98c2-5fc0ac8f217e	2026	EXENTO_IVA	MS25188	Plataforma Talento 2026-2027	cli_afp_habitat	AFP HABITAT	VG	CG	Talentos	Administración y Operación	6.97e+06	5	4.586553e+06	111.86714	4.586553e+06	\N	C:\\Users\\gcons\\Downloads\\20. Proyecciones Plataformas 14.05.2026.xlsx	9	2026-05-18 15:29:30	2026-05-18 16:42:45
fc1f9d2e-4b8f-4e57-8ad8-7f94ec5c2cf8	2026	EXENTO_IVA	MS24213	Paquete de Horas 2025	cli_afp_habitat	AFP HABITAT	VG	MA	LMS	Horas de Desarrollo	9.532747e+06	5	9.532747e+06	232.50603	9.532747e+06	\N	C:\\Users\\gcons\\Downloads\\20. Proyecciones Plataformas 14.05.2026.xlsx	10	2026-05-18 15:29:30	2026-05-18 16:42:45
e9b50cb3-c8b0-4625-9aec-75d879d6ffc6	2026	EXENTO_IVA	MS26077	Planes de Desarrollo 2026	cli_afp_habitat	AFP HABITAT	VG	CG	Desempeño	Construcción	4.92e+06	5	4.92e+06	120	4.92e+06	\N	C:\\Users\\gcons\\Downloads\\20. Proyecciones Plataformas 14.05.2026.xlsx	11	2026-05-18 15:29:30	2026-05-18 16:42:45
7addfcfd-ed22-474d-90fb-d24208038696	2026	EXENTO_IVA	MS25135	Plataforma GC 2025-2027	cli_andritz	ANDRITZ	VG	DL	Gestión Capacitación	Administración y Operación	1.3780206e+07	10	6.890103e+06	\N	6.890103e+06	\N	C:\\Users\\gcons\\Downloads\\20. Proyecciones Plataformas 14.05.2026.xlsx	12	2026-05-18 15:29:30	2026-05-18 16:42:45
9cdabd6a-8b99-4bfa-8fc5-33dca5f448c4	2026	EXENTO_IVA	MS25135	Plataforma GC 2025-2027	cli_andritz	ANDRITZ	VG	DL	Gestión Capacitación	Administración y Operación	1.3780206e+07	12	6.890103e+06	\N	6.890103e+06	\N	C:\\Users\\gcons\\Downloads\\20. Proyecciones Plataformas 14.05.2026.xlsx	12	2026-05-18 15:29:30	2026-05-18 16:42:45
91028354-091f-4ab9-ba48-71c700659ee5	2026	AFECTO_IVA	MS25078	Plataforma de Potencial y Ninebox	cli_arcor	ARCOR	VG	MDR	Talentos	Administración y Operación	1.04e+07	6	3.4666668e+06	86.666664	3.4666668e+06	\N	C:\\Users\\gcons\\Downloads\\20. Proyecciones Plataformas 14.05.2026.xlsx	13	2026-05-18 15:29:30	2026-05-18 16:42:45
8e59dfa7-55c3-466d-a58c-fddadc3ba7a8	2026	AFECTO_IVA	MS25078	Plataforma de Potencial y Ninebox	cli_arcor	ARCOR	VG	MDR	Talentos	Administración y Operación	1.04e+07	8	3.4666668e+06	86.666664	3.4666668e+06	\N	C:\\Users\\gcons\\Downloads\\20. Proyecciones Plataformas 14.05.2026.xlsx	13	2026-05-18 15:29:30	2026-05-18 16:42:45
52be590f-e223-4193-85ed-4e3d7729f077	2026	AFECTO_IVA	MS25078	Plataforma de Potencial y Ninebox	cli_arcor	ARCOR	VG	MDR	Talentos	Administración y Operación	1.04e+07	10	3.4666668e+06	86.666664	3.4666668e+06	\N	C:\\Users\\gcons\\Downloads\\20. Proyecciones Plataformas 14.05.2026.xlsx	13	2026-05-18 15:29:30	2026-05-18 16:42:45
7c8c6f6f-de38-4d00-86bc-3fbbdf8a3444	2026	EXENTO_IVA	MS24233	Planes de Acción 2025	cli_aristia	ARIZTÍA	VG	MDR	Clima/Encuestas	Administración y Operación	4.23913e+06	2	4.23913e+06	\N	4.23913e+06	\N	C:\\Users\\gcons\\Downloads\\20. Proyecciones Plataformas 14.05.2026.xlsx	14	2026-05-18 15:29:30	2026-05-18 16:42:45
3cb35fec-deba-4177-8987-a2a227feab98	2026	EXENTO_IVA	MS26010	Paquete Horas TI 2026	cli_aristia	ARIZTÍA	VG	MDR	Reconocimiento	Horas de Desarrollo	1.985e+06	8	1.985e+06	50	1.985e+06	\N	C:\\Users\\gcons\\Downloads\\20. Proyecciones Plataformas 14.05.2026.xlsx	15	2026-05-18 15:29:30	2026-05-18 16:42:45
b084cb73-315e-445e-9117-79ffd1039643	2026	EXENTO_IVA	MS26008	Gestión de Capacitación 2026	cli_aristia	ARIZTÍA	VG	MDR	Gestión Capacitación	Administración y Operación	1.04e+07	8	1.04e+07	260	1.04e+07	\N	C:\\Users\\gcons\\Downloads\\20. Proyecciones Plataformas 14.05.2026.xlsx	16	2026-05-18 15:29:30	2026-05-18 16:42:45
c7d2a900-ef01-4055-9ad2-0eabbb450450	2026	EXENTO_IVA	MS26009	Reconocimiento 2026	cli_aristia	ARIZTÍA	VG	MDR	Reconocimiento	Administración y Operación	1.21941e+07	5	6.12e+06	153	6.12e+06	\N	C:\\Users\\gcons\\Downloads\\20. Proyecciones Plataformas 14.05.2026.xlsx	17	2026-05-18 15:29:30	2026-05-18 16:42:45
021b8add-ab39-42f6-81d7-cee9f9200dec	2026	EXENTO_IVA	MS26009	Reconocimiento 2026	cli_aristia	ARIZTÍA	VG	MDR	Reconocimiento	Administración y Operación	1.21941e+07	8	6.0741e+06	153	6.0741e+06	\N	C:\\Users\\gcons\\Downloads\\20. Proyecciones Plataformas 14.05.2026.xlsx	17	2026-05-18 15:29:30	2026-05-18 16:42:45
ad72ba15-df0c-4ec6-950d-f996ae8d3a6a	2026	AFECTO_IVA	MS25016	Plataforma Desempeño 2025	cli_avla	AVLA	VG	MDR	Desempeño	Administración y Operación	4.772171e+06	1	1.589371e+06	\N	1.589371e+06	\N	C:\\Users\\gcons\\Downloads\\20. Proyecciones Plataformas 14.05.2026.xlsx	18	2026-05-18 15:29:30	2026-05-18 16:42:45
2038cca1-6848-4e81-abe0-abce77ec1985	2026	AFECTO_IVA	MS25016	Plataforma Desempeño 2025	cli_avla	AVLA	VG	MDR	Desempeño	Administración y Operación	4.772171e+06	2	1.589131e+06	\N	1.589131e+06	\N	C:\\Users\\gcons\\Downloads\\20. Proyecciones Plataformas 14.05.2026.xlsx	18	2026-05-18 15:29:30	2026-05-18 16:42:45
d48b63b6-bae7-4e13-b964-8829c523b790	2026	AFECTO_IVA	MS25016	Plataforma Desempeño 2025	cli_avla	AVLA	VG	MDR	Desempeño	Administración y Operación	4.772171e+06	3	1.593669e+06	\N	1.593669e+06	\N	C:\\Users\\gcons\\Downloads\\20. Proyecciones Plataformas 14.05.2026.xlsx	18	2026-05-18 15:29:30	2026-05-18 16:42:45
4772fcde-08ce-437d-9ce9-440dbce40be6	2026	EXENTO_IVA	MS25003	Plataforma GC 2025	cli_aza	AZA	VG	DL	Gestión Capacitación	Administración y Operación	1.44e+07	6	1.44e+07	360	1.44e+07	\N	C:\\Users\\gcons\\Downloads\\20. Proyecciones Plataformas 14.05.2026.xlsx	19	2026-05-18 15:29:30	2026-05-18 16:42:45
26b94fd5-b081-48bf-9d46-3ee11671a657	2026	EXENTO_IVA	MS25002	Plataforma LMS 2025	cli_aza	AZA	VG	DL	LMS	Administración y Operación	1.6492572e+07	6	1.6492572e+07	412.3143	1.6492572e+07	\N	C:\\Users\\gcons\\Downloads\\20. Proyecciones Plataformas 14.05.2026.xlsx	20	2026-05-18 15:29:30	2026-05-18 16:42:45
9ca3ee64-012b-42a1-82db-308d44006417	2026	EXENTO_IVA	MS24197	Plataforma LMS 2025	cli_bex	BANCO ESTADO EXPRESS	VG	DL	LMS	Administración y Operación	3.8256e+07	1	1.42e+07	\N	1.42e+07	\N	C:\\Users\\gcons\\Downloads\\20. Proyecciones Plataformas 14.05.2026.xlsx	21	2026-05-18 15:29:30	2026-05-18 16:42:45
167c83d7-0409-4d9d-9a92-754ad0c4f61e	2026	EXENTO_IVA	MS24197	Plataforma LMS 2025	cli_bex	BANCO ESTADO EXPRESS	VG	DL	LMS	Administración y Operación	3.8256e+07	3	750625	\N	750625	\N	C:\\Users\\gcons\\Downloads\\20. Proyecciones Plataformas 14.05.2026.xlsx	21	2026-05-18 15:29:30	2026-05-18 16:42:45
3ca70e6c-d1e6-4ced-8b4a-ca58017ef869	2026	EXENTO_IVA	MS24197	Plataforma LMS 2025	cli_bex	BANCO ESTADO EXPRESS	VG	DL	LMS	Administración y Operación	3.8256e+07	5	4.177375e+06	\N	4.177375e+06	\N	C:\\Users\\gcons\\Downloads\\20. Proyecciones Plataformas 14.05.2026.xlsx	21	2026-05-18 15:29:30	2026-05-18 16:42:45
dc728218-23e5-4e4b-aae5-790f258bba14	2026	EXENTO_IVA	MS24197	Plataforma LMS 2025	cli_bex	BANCO ESTADO EXPRESS	VG	DL	LMS	Administración y Operación	3.8256e+07	10	1.9128e+07	480	1.9128e+07	\N	C:\\Users\\gcons\\Downloads\\20. Proyecciones Plataformas 14.05.2026.xlsx	21	2026-05-18 15:29:30	2026-05-18 16:42:45
18ad81e4-953c-4181-852b-73c6bfc34da6	2026	EXENTO_IVA	MS24198	Mantención Chatbot 2025	cli_bex	BANCO ESTADO EXPRESS	VG	DL	LMS	Administración y Operación	1.9925e+06	5	1.9925e+06	50	1.9925e+06	\N	C:\\Users\\gcons\\Downloads\\20. Proyecciones Plataformas 14.05.2026.xlsx	22	2026-05-18 15:29:30	2026-05-18 16:42:45
458e12e6-b41f-4df4-876e-1416e2d0684f	2026	EXENTO_IVA	MS24199	Plataforma GC 2025	cli_bex	BANCO ESTADO EXPRESS	VG	DL	Gestión Capacitación	Administración y Operación	4.782e+06	5	689375	\N	689375	\N	C:\\Users\\gcons\\Downloads\\20. Proyecciones Plataformas 14.05.2026.xlsx	23	2026-05-18 15:29:30	2026-05-18 16:42:45
2121a5ca-ec92-4803-9262-71cd436b51d2	2026	EXENTO_IVA	MS24199	Plataforma GC 2025	cli_bex	BANCO ESTADO EXPRESS	VG	DL	Gestión Capacitación	Administración y Operación	4.782e+06	8	1.701625e+06	42.700752	1.701625e+06	\N	C:\\Users\\gcons\\Downloads\\20. Proyecciones Plataformas 14.05.2026.xlsx	23	2026-05-18 15:29:30	2026-05-18 16:42:45
cbee627d-ca33-42ab-9653-45f256a1dd27	2026	EXENTO_IVA	MS24199	Plataforma GC 2025	cli_bex	BANCO ESTADO EXPRESS	VG	DL	Gestión Capacitación	Administración y Operación	4.782e+06	10	2.391e+06	60	2.391e+06	\N	C:\\Users\\gcons\\Downloads\\20. Proyecciones Plataformas 14.05.2026.xlsx	23	2026-05-18 15:29:30	2026-05-18 16:42:45
9e5be70b-1e5b-4699-a08f-0d30639a6016	2026	AFECTO_IVA	MS24200	Plataforma Desempeño 2025	cli_bex	BANCO ESTADO EXPRESS	VG	DL	Desempeño	Administración y Operación	2.4208876e+07	3	1.3449375e+07	\N	1.3449375e+07	\N	C:\\Users\\gcons\\Downloads\\20. Proyecciones Plataformas 14.05.2026.xlsx	24	2026-05-18 15:29:30	2026-05-18 16:42:45
9a8cc900-0b90-430c-8486-86fcb5cf76fe	2026	AFECTO_IVA	MS24200	Plataforma Desempeño 2025	cli_bex	BANCO ESTADO EXPRESS	VG	DL	Desempeño	Administración y Operación	2.4208876e+07	10	1.07595e+07	270	1.07595e+07	\N	C:\\Users\\gcons\\Downloads\\20. Proyecciones Plataformas 14.05.2026.xlsx	24	2026-05-18 15:29:30	2026-05-18 16:42:45
10791ba8-dbea-45fe-a015-f2edade67fda	2026	EXENTO_IVA	MS24202	Plataforma Clima y Planes 2025	cli_bex	BANCO ESTADO EXPRESS	VG	DL	Clima/Encuestas	Administración y Operación	1.6737e+07	8	8.3685e+06	210	8.3685e+06	\N	C:\\Users\\gcons\\Downloads\\20. Proyecciones Plataformas 14.05.2026.xlsx	25	2026-05-18 15:29:30	2026-05-18 16:42:45
be9a56b2-5eef-4198-869e-38aa57f21ac8	2026	EXENTO_IVA	MS24202	Plataforma Clima y Planes 2025	cli_bex	BANCO ESTADO EXPRESS	VG	DL	Clima/Encuestas	Administración y Operación	1.6737e+07	10	8.3685e+06	210	8.3685e+06	\N	C:\\Users\\gcons\\Downloads\\20. Proyecciones Plataformas 14.05.2026.xlsx	25	2026-05-18 15:29:30	2026-05-18 16:42:45
9f62a1d8-e786-4030-b9aa-84d4ba1d8b75	2026	AFECTO_IVA	MS24203	Plataforma Reconocimiento 2025	cli_bex	BANCO ESTADO EXPRESS	VG	DL	Reconocimiento	Administración y Operación	1.05204e+07	5	2.64e+06	66	2.64e+06	\N	C:\\Users\\gcons\\Downloads\\20. Proyecciones Plataformas 14.05.2026.xlsx	26	2026-05-18 15:29:30	2026-05-18 16:42:45
21c9bb46-3bef-4ddf-a724-d1fedc4c7ee7	2026	AFECTO_IVA	MS24203	Plataforma Reconocimiento 2025	cli_bex	BANCO ESTADO EXPRESS	VG	DL	Reconocimiento	Administración y Operación	1.05204e+07	7	2.6268e+06	66	2.6268e+06	\N	C:\\Users\\gcons\\Downloads\\20. Proyecciones Plataformas 14.05.2026.xlsx	26	2026-05-18 15:29:30	2026-05-18 16:42:45
4137ba42-29b2-4ade-a944-5ccea87b6e98	2026	AFECTO_IVA	MS24203	Plataforma Reconocimiento 2025	cli_bex	BANCO ESTADO EXPRESS	VG	DL	Reconocimiento	Administración y Operación	1.05204e+07	9	2.6268e+06	66	2.6268e+06	\N	C:\\Users\\gcons\\Downloads\\20. Proyecciones Plataformas 14.05.2026.xlsx	26	2026-05-18 15:29:30	2026-05-18 16:42:45
b9819166-521e-4ec1-87d5-c3e52cd11bd6	2026	AFECTO_IVA	MS24203	Plataforma Reconocimiento 2025	cli_bex	BANCO ESTADO EXPRESS	VG	DL	Reconocimiento	Administración y Operación	1.05204e+07	12	2.6268e+06	66	2.6268e+06	\N	C:\\Users\\gcons\\Downloads\\20. Proyecciones Plataformas 14.05.2026.xlsx	26	2026-05-18 15:29:30	2026-05-18 16:42:45
00b00594-1ed9-4bee-9cc8-48440303af69	2026	EXENTO_IVA	MS24205	Plataforma Talento 2025	cli_bex	BANCO ESTADO EXPRESS	VG	DL	Talentos	Administración y Operación	7.173e+06	5	3.5865e+06	90	3.5865e+06	\N	C:\\Users\\gcons\\Downloads\\20. Proyecciones Plataformas 14.05.2026.xlsx	27	2026-05-18 15:29:30	2026-05-18 16:42:45
d16c53d2-7f0e-4b46-a938-6b793ed43c2b	2026	EXENTO_IVA	MS24205	Plataforma Talento 2025	cli_bex	BANCO ESTADO EXPRESS	VG	DL	Talentos	Administración y Operación	7.173e+06	10	3.5865e+06	90	3.5865e+06	\N	C:\\Users\\gcons\\Downloads\\20. Proyecciones Plataformas 14.05.2026.xlsx	27	2026-05-18 15:29:30	2026-05-18 16:42:45
fe681e87-ed97-4391-a6b3-462bdf6cf732	2026	EXENTO_IVA	MS25159	Plataforma LMS 2026	cli_banco_internacional	BANCO INTERNACIONAL	VG	DL	LMS	Administración y Operación	8.2811725e+06	3	8.2811725e+06	208	8.2811725e+06	\N	C:\\Users\\gcons\\Downloads\\20. Proyecciones Plataformas 14.05.2026.xlsx	28	2026-05-18 15:29:30	2026-05-18 16:42:45
5f7b2150-42b2-4cd6-9977-a10f2c854adb	2026	EXENTO_IVA	MS25160	Plataforma GC 2026	cli_banco_internacional	BANCO INTERNACIONAL	VG	DL	Gestión Capacitación	Administración y Operación	9.555199e+06	3	9.555199e+06	240	9.555199e+06	\N	C:\\Users\\gcons\\Downloads\\20. Proyecciones Plataformas 14.05.2026.xlsx	29	2026-05-18 15:29:30	2026-05-18 16:42:45
0aff532c-8d72-4823-9ce1-207448a0a7db	2026	EXENTO_IVA	MS24014	Plataforma LMS 2024	cli_carozzi	CAROZZI	VG	MDR	LMS	Administración y Operación	9.403992e+07	1	2.145e+07	\N	2.145e+07	\N	C:\\Users\\gcons\\Downloads\\20. Proyecciones Plataformas 14.05.2026.xlsx	31	2026-05-18 15:29:30	2026-05-18 16:42:45
00affe67-88b9-461a-b57e-6bc44ce7cf59	2026	EXENTO_IVA	MS24014	Plataforma LMS 2024	cli_carozzi	CAROZZI	VG	MDR	LMS	Administración y Operación	9.403992e+07	2	1.039924e+06	\N	1.039924e+06	\N	C:\\Users\\gcons\\Downloads\\20. Proyecciones Plataformas 14.05.2026.xlsx	31	2026-05-18 15:29:30	2026-05-18 16:42:45
361192a8-9a41-4576-9087-035625f3e6d6	2026	EXENTO_IVA	MS24014	Plataforma LMS 2024	cli_carozzi	CAROZZI	VG	MDR	LMS	Administración y Operación	9.403992e+07	6	1.7775e+07	450	1.7775e+07	\N	C:\\Users\\gcons\\Downloads\\20. Proyecciones Plataformas 14.05.2026.xlsx	31	2026-05-18 15:29:30	2026-05-18 16:42:45
eea0d86b-cd3f-4f02-a3eb-5375e0c3486a	2026	EXENTO_IVA	MS24014	Plataforma LMS 2024	cli_carozzi	CAROZZI	VG	MDR	LMS	Administración y Operación	9.403992e+07	8	1.7775e+07	450	1.7775e+07	\N	C:\\Users\\gcons\\Downloads\\20. Proyecciones Plataformas 14.05.2026.xlsx	31	2026-05-18 15:29:30	2026-05-18 16:42:45
1c81f16f-b6bf-4fd5-936a-16b2ade41564	2026	EXENTO_IVA	MS24014	Plataforma LMS 2024	cli_carozzi	CAROZZI	VG	MDR	LMS	Administración y Operación	9.403992e+07	10	1.8e+07	450	1.8e+07	\N	C:\\Users\\gcons\\Downloads\\20. Proyecciones Plataformas 14.05.2026.xlsx	31	2026-05-18 15:29:30	2026-05-18 16:42:45
f8bf14d7-613a-47c6-b77c-066cad53e33f	2026	EXENTO_IVA	MS24014	Plataforma LMS 2024	cli_carozzi	CAROZZI	VG	MDR	LMS	Administración y Operación	9.403992e+07	12	1.8e+07	450	1.8e+07	\N	C:\\Users\\gcons\\Downloads\\20. Proyecciones Plataformas 14.05.2026.xlsx	31	2026-05-18 15:29:30	2026-05-18 16:42:45
fc4c1ce1-e64c-4e86-b548-ef1cfcdd54d2	2026	EXENTO_IVA	MS24015	Plataforma GC 2024	cli_carozzi	CAROZZI	VG	MDR	Gestión Capacitación	Administración y Operación	1.3060846e+07	2	7.135846e+06	\N	7.135846e+06	\N	C:\\Users\\gcons\\Downloads\\20. Proyecciones Plataformas 14.05.2026.xlsx	32	2026-05-18 15:29:30	2026-05-18 16:42:45
f0b6260a-4078-4c42-ac51-b1a3739ed617	2026	EXENTO_IVA	MS24015	Plataforma GC 2024	cli_carozzi	CAROZZI	VG	MDR	Gestión Capacitación	Administración y Operación	1.3060846e+07	6	2.9625e+06	75	2.9625e+06	\N	C:\\Users\\gcons\\Downloads\\20. Proyecciones Plataformas 14.05.2026.xlsx	32	2026-05-18 15:29:30	2026-05-18 16:42:45
34ebecaa-b279-4474-8528-8bdeabf3dfaa	2026	EXENTO_IVA	MS24015	Plataforma GC 2024	cli_carozzi	CAROZZI	VG	MDR	Gestión Capacitación	Administración y Operación	1.3060846e+07	8	2.9625e+06	75	2.9625e+06	\N	C:\\Users\\gcons\\Downloads\\20. Proyecciones Plataformas 14.05.2026.xlsx	32	2026-05-18 15:29:30	2026-05-18 16:42:45
0ce62f7f-ba8c-461f-b4d6-5b89284b96dc	2026	AFECTO_IVA	MS26053	Taller IA	cli_ccu	CCU	VG	DV	LMS	Construcción	2.3905032e+06	3	2.3905032e+06	60	2.3905032e+06	\N	C:\\Users\\gcons\\Downloads\\20. Proyecciones Plataformas 14.05.2026.xlsx	33	2026-05-18 15:29:30	2026-05-18 16:42:45
cc75970d-1807-4fd1-bc05-55c204a55ba3	2026	AFECTO_IVA	MS25006	Plataforma Desempeño 2025	cli_copec	COPEC	VG	DL	Desempeño	Administración y Operación	2.2188394e+07	3	5.529234e+06	138.78	5.529234e+06	\N	C:\\Users\\gcons\\Downloads\\20. Proyecciones Plataformas 14.05.2026.xlsx	34	2026-05-18 15:29:30	2026-05-18 16:42:45
a97e483f-df47-41d0-94d2-1dff8c0a6335	2026	AFECTO_IVA	MS25006	Plataforma Desempeño 2025	cli_copec	COPEC	VG	DL	Desempeño	Administración y Operación	2.2188394e+07	4	1.8559605e+06	46.26	1.8559605e+06	\N	C:\\Users\\gcons\\Downloads\\20. Proyecciones Plataformas 14.05.2026.xlsx	34	2026-05-18 15:29:30	2026-05-18 16:42:45
88e65d52-cd97-4ba7-be1a-4d7215c87415	2026	AFECTO_IVA	MS25006	Plataforma Desempeño 2025	cli_copec	COPEC	VG	DL	Desempeño	Administración y Operación	2.2188394e+07	5	1.8504e+06	46.26	1.8504e+06	\N	C:\\Users\\gcons\\Downloads\\20. Proyecciones Plataformas 14.05.2026.xlsx	34	2026-05-18 15:29:30	2026-05-18 16:42:45
52c2c35b-89a8-40ce-840c-558f05b4d095	2026	AFECTO_IVA	MS25006	Plataforma Desempeño 2025	cli_copec	COPEC	VG	DL	Desempeño	Administración y Operación	2.2188394e+07	6	1.8504e+06	46.26	1.8504e+06	\N	C:\\Users\\gcons\\Downloads\\20. Proyecciones Plataformas 14.05.2026.xlsx	34	2026-05-18 15:29:30	2026-05-18 16:42:45
8bc205c2-a387-4525-809b-10a6abbbd078	2026	AFECTO_IVA	MS25006	Plataforma Desempeño 2025	cli_copec	COPEC	VG	DL	Desempeño	Administración y Operación	2.2188394e+07	7	1.8504e+06	\N	1.8504e+06	\N	C:\\Users\\gcons\\Downloads\\20. Proyecciones Plataformas 14.05.2026.xlsx	34	2026-05-18 15:29:30	2026-05-18 16:42:45
a0127f8a-6762-4b5b-b96a-4e5808b96b37	2026	AFECTO_IVA	MS25006	Plataforma Desempeño 2025	cli_copec	COPEC	VG	DL	Desempeño	Administración y Operación	2.2188394e+07	8	1.8504e+06	\N	1.8504e+06	\N	C:\\Users\\gcons\\Downloads\\20. Proyecciones Plataformas 14.05.2026.xlsx	34	2026-05-18 15:29:30	2026-05-18 16:42:45
837f6b87-5928-46f1-9dd2-07d227f09543	2026	AFECTO_IVA	MS25006	Plataforma Desempeño 2025	cli_copec	COPEC	VG	DL	Desempeño	Administración y Operación	2.2188394e+07	9	1.8504e+06	\N	1.8504e+06	\N	C:\\Users\\gcons\\Downloads\\20. Proyecciones Plataformas 14.05.2026.xlsx	34	2026-05-18 15:29:30	2026-05-18 16:42:45
de06f1d4-a512-481e-b563-fe5574626542	2026	AFECTO_IVA	MS25006	Plataforma Desempeño 2025	cli_copec	COPEC	VG	DL	Desempeño	Administración y Operación	2.2188394e+07	10	1.8504e+06	\N	1.8504e+06	\N	C:\\Users\\gcons\\Downloads\\20. Proyecciones Plataformas 14.05.2026.xlsx	34	2026-05-18 15:29:30	2026-05-18 16:42:45
9bac9979-4af8-44c1-9bac-5c2177b6d8ce	2026	AFECTO_IVA	MS25006	Plataforma Desempeño 2025	cli_copec	COPEC	VG	DL	Desempeño	Administración y Operación	2.2188394e+07	11	1.8504e+06	\N	1.8504e+06	\N	C:\\Users\\gcons\\Downloads\\20. Proyecciones Plataformas 14.05.2026.xlsx	34	2026-05-18 15:29:30	2026-05-18 16:42:45
34ebd478-b38b-42fc-80d3-8d3c0798acb0	2026	AFECTO_IVA	MS25006	Plataforma Desempeño 2025	cli_copec	COPEC	VG	DL	Desempeño	Administración y Operación	2.2188394e+07	12	1.8504e+06	\N	1.8504e+06	\N	C:\\Users\\gcons\\Downloads\\20. Proyecciones Plataformas 14.05.2026.xlsx	34	2026-05-18 15:29:30	2026-05-18 16:42:45
0ea8817e-da0f-428f-844c-1777f9a1abd3	2026	AFECTO_IVA	MS25007	Plataforma Gestión de Talentos 2025	cli_copec	COPEC	VG	DL	Talentos	Administración y Operación	9.91427e+06	3	2.470585e+06	62.01	2.470585e+06	\N	C:\\Users\\gcons\\Downloads\\20. Proyecciones Plataformas 14.05.2026.xlsx	35	2026-05-18 15:29:30	2026-05-18 16:42:45
289055aa-4bab-4d57-a90f-8181ed1c9929	2026	AFECTO_IVA	MS25007	Plataforma Gestión de Talentos 2025	cli_copec	COPEC	VG	DL	Talentos	Administración y Operación	9.91427e+06	4	829284.56	20.67	829284.56	\N	C:\\Users\\gcons\\Downloads\\20. Proyecciones Plataformas 14.05.2026.xlsx	35	2026-05-18 15:29:30	2026-05-18 16:42:45
4906b429-2af8-4089-b41a-ec01d42b7c1d	2026	AFECTO_IVA	MS25007	Plataforma Gestión de Talentos 2025	cli_copec	COPEC	VG	DL	Talentos	Administración y Operación	9.91427e+06	5	826800	20.67	826800	\N	C:\\Users\\gcons\\Downloads\\20. Proyecciones Plataformas 14.05.2026.xlsx	35	2026-05-18 15:29:30	2026-05-18 16:42:45
1bb21655-28cc-4224-a5ea-2cff1a119a62	2026	AFECTO_IVA	MS25007	Plataforma Gestión de Talentos 2025	cli_copec	COPEC	VG	DL	Talentos	Administración y Operación	9.91427e+06	6	826800	20.67	826800	\N	C:\\Users\\gcons\\Downloads\\20. Proyecciones Plataformas 14.05.2026.xlsx	35	2026-05-18 15:29:30	2026-05-18 16:42:45
c0e95265-e62f-45b8-9a2c-7af84960f723	2026	AFECTO_IVA	MS25007	Plataforma Gestión de Talentos 2025	cli_copec	COPEC	VG	DL	Talentos	Administración y Operación	9.91427e+06	7	826800	\N	826800	\N	C:\\Users\\gcons\\Downloads\\20. Proyecciones Plataformas 14.05.2026.xlsx	35	2026-05-18 15:29:30	2026-05-18 16:42:45
631ff9c3-55e3-4cc5-823f-3c0ac951d01c	2026	AFECTO_IVA	MS25007	Plataforma Gestión de Talentos 2025	cli_copec	COPEC	VG	DL	Talentos	Administración y Operación	9.91427e+06	8	826800	\N	826800	\N	C:\\Users\\gcons\\Downloads\\20. Proyecciones Plataformas 14.05.2026.xlsx	35	2026-05-18 15:29:30	2026-05-18 16:42:45
069c4d38-8917-4759-9d10-ffecbc228cc9	2026	AFECTO_IVA	MS25007	Plataforma Gestión de Talentos 2025	cli_copec	COPEC	VG	DL	Talentos	Administración y Operación	9.91427e+06	9	826800	\N	826800	\N	C:\\Users\\gcons\\Downloads\\20. Proyecciones Plataformas 14.05.2026.xlsx	35	2026-05-18 15:29:30	2026-05-18 16:42:45
ca9d6f2a-ba82-40f2-aeae-9a03c7f3b594	2026	AFECTO_IVA	MS25007	Plataforma Gestión de Talentos 2025	cli_copec	COPEC	VG	DL	Talentos	Administración y Operación	9.91427e+06	10	826800	\N	826800	\N	C:\\Users\\gcons\\Downloads\\20. Proyecciones Plataformas 14.05.2026.xlsx	35	2026-05-18 15:29:30	2026-05-18 16:42:45
0da675cd-e92c-498a-9171-5f3bf1d94007	2026	AFECTO_IVA	MS25007	Plataforma Gestión de Talentos 2025	cli_copec	COPEC	VG	DL	Talentos	Administración y Operación	9.91427e+06	11	826800	\N	826800	\N	C:\\Users\\gcons\\Downloads\\20. Proyecciones Plataformas 14.05.2026.xlsx	35	2026-05-18 15:29:30	2026-05-18 16:42:45
d93ac3bf-6850-4a0f-a4ab-1cc94f2f59d1	2026	AFECTO_IVA	MS25007	Plataforma Gestión de Talentos 2025	cli_copec	COPEC	VG	DL	Talentos	Administración y Operación	9.91427e+06	12	826800	\N	826800	\N	C:\\Users\\gcons\\Downloads\\20. Proyecciones Plataformas 14.05.2026.xlsx	35	2026-05-18 15:29:30	2026-05-18 16:42:45
6f807873-00dc-41f9-a822-fd7c4b3bb93c	2026	AFECTO_IVA	MS25076	Plataforma SGD	cli_emin	EMIN	VG	MDR	Desempeño	Administración y Operación	2.3296e+07	5	2.912e+06	72.8	2.912e+06	\N	C:\\Users\\gcons\\Downloads\\20. Proyecciones Plataformas 14.05.2026.xlsx	36	2026-05-18 15:29:30	2026-05-18 16:42:45
30ec7272-86c5-412a-bb2d-8c65cc89962f	2026	AFECTO_IVA	MS25076	Plataforma SGD	cli_emin	EMIN	VG	MDR	Desempeño	Administración y Operación	2.3296e+07	6	2.912e+06	72.8	2.912e+06	\N	C:\\Users\\gcons\\Downloads\\20. Proyecciones Plataformas 14.05.2026.xlsx	36	2026-05-18 15:29:30	2026-05-18 16:42:45
bd567ab8-1ccb-42ce-857e-73a297bd407d	2026	AFECTO_IVA	MS25076	Plataforma SGD	cli_emin	EMIN	VG	MDR	Desempeño	Administración y Operación	2.3296e+07	7	2.912e+06	\N	2.912e+06	\N	C:\\Users\\gcons\\Downloads\\20. Proyecciones Plataformas 14.05.2026.xlsx	36	2026-05-18 15:29:30	2026-05-18 16:42:45
95fa5b92-4c37-49c4-8a1b-43d3a6812ec9	2026	AFECTO_IVA	MS25076	Plataforma SGD	cli_emin	EMIN	VG	MDR	Desempeño	Administración y Operación	2.3296e+07	8	2.912e+06	\N	2.912e+06	\N	C:\\Users\\gcons\\Downloads\\20. Proyecciones Plataformas 14.05.2026.xlsx	36	2026-05-18 15:29:30	2026-05-18 16:42:45
291e72bb-aaa4-4ef2-9a52-43643e049287	2026	AFECTO_IVA	MS25076	Plataforma SGD	cli_emin	EMIN	VG	MDR	Desempeño	Administración y Operación	2.3296e+07	9	2.912e+06	\N	2.912e+06	\N	C:\\Users\\gcons\\Downloads\\20. Proyecciones Plataformas 14.05.2026.xlsx	36	2026-05-18 15:29:30	2026-05-18 16:42:45
3de2f7bb-7434-4a4c-8226-de20ac5b319f	2026	AFECTO_IVA	MS25076	Plataforma SGD	cli_emin	EMIN	VG	MDR	Desempeño	Administración y Operación	2.3296e+07	10	2.912e+06	\N	2.912e+06	\N	C:\\Users\\gcons\\Downloads\\20. Proyecciones Plataformas 14.05.2026.xlsx	36	2026-05-18 15:29:30	2026-05-18 16:42:45
ec3f6e65-1d89-46a3-9527-bf8dd69dda5f	2026	AFECTO_IVA	MS25076	Plataforma SGD	cli_emin	EMIN	VG	MDR	Desempeño	Administración y Operación	2.3296e+07	11	2.912e+06	\N	2.912e+06	\N	C:\\Users\\gcons\\Downloads\\20. Proyecciones Plataformas 14.05.2026.xlsx	36	2026-05-18 15:29:30	2026-05-18 16:42:45
f2a1d257-5f52-4f49-bf3d-c67dc36d3c31	2026	AFECTO_IVA	MS25076	Plataforma SGD	cli_emin	EMIN	VG	MDR	Desempeño	Administración y Operación	2.3296e+07	12	2.912e+06	\N	2.912e+06	\N	C:\\Users\\gcons\\Downloads\\20. Proyecciones Plataformas 14.05.2026.xlsx	36	2026-05-18 15:29:30	2026-05-18 16:42:45
a696e7fe-7bb4-4d19-877b-0fbdc6f44082	2026	EXENTO_IVA	MS26002	Plataforma GC 2026	cli_enaex	ENAEX	VG	MA	Gestión Capacitación	Administración y Operación	9.48e+06	7	4.74e+06	120	4.74e+06	\N	C:\\Users\\gcons\\Downloads\\20. Proyecciones Plataformas 14.05.2026.xlsx	37	2026-05-18 15:29:30	2026-05-18 16:42:45
a59c2bca-8bad-4a33-9f16-4c90344288f0	2026	EXENTO_IVA	MS26002	Plataforma GC 2026	cli_enaex	ENAEX	VG	MA	Gestión Capacitación	Administración y Operación	9.48e+06	10	4.74e+06	120	4.74e+06	\N	C:\\Users\\gcons\\Downloads\\20. Proyecciones Plataformas 14.05.2026.xlsx	37	2026-05-18 15:29:30	2026-05-18 16:42:45
c0aa76d3-65c6-4b64-99ce-2988a090ad8d	2026	MIXTO	MS26001	Plataforma LMS 2026	cli_enaex	ENAEX	VG	MA	LMS	Administración y Operación	7.563113e+07	1	5.7577515e+06	145	5.7577515e+06	\N	C:\\Users\\gcons\\Downloads\\20. Proyecciones Plataformas 14.05.2026.xlsx	38	2026-05-18 15:29:30	2026-05-18 16:42:45
0143253a-baab-4669-94a0-ab52c67c03c2	2026	MIXTO	MS26001	Plataforma LMS 2026	cli_enaex	ENAEX	VG	MA	LMS	Administración y Operación	7.563113e+07	2	5.766353e+06	145	5.766353e+06	\N	C:\\Users\\gcons\\Downloads\\20. Proyecciones Plataformas 14.05.2026.xlsx	38	2026-05-18 15:29:30	2026-05-18 16:42:45
e6d1b8c7-51ca-42af-b0df-8d0a7ace4a7f	2026	MIXTO	MS26001	Plataforma LMS 2026	cli_enaex	ENAEX	VG	MA	LMS	Administración y Operación	7.563113e+07	3	5.7770495e+06	145	5.7770495e+06	\N	C:\\Users\\gcons\\Downloads\\20. Proyecciones Plataformas 14.05.2026.xlsx	38	2026-05-18 15:29:30	2026-05-18 16:42:45
7a707b47-6f6c-40fd-9c6d-17e660e87cd1	2026	MIXTO	MS26001	Plataforma LMS 2026	cli_enaex	ENAEX	VG	MA	LMS	Administración y Operación	7.563113e+07	4	5.815499e+06	145	5.815499e+06	\N	C:\\Users\\gcons\\Downloads\\20. Proyecciones Plataformas 14.05.2026.xlsx	38	2026-05-18 15:29:30	2026-05-18 16:42:45
a12157b4-41b4-41e4-8d90-fe1d0c72fd62	2026	MIXTO	MS26001	Plataforma LMS 2026	cli_enaex	ENAEX	VG	MA	LMS	Administración y Operación	7.563113e+07	5	1.1914472e+07	297.01978	1.1914472e+07	\N	C:\\Users\\gcons\\Downloads\\20. Proyecciones Plataformas 14.05.2026.xlsx	38	2026-05-18 15:29:30	2026-05-18 16:42:45
c6586552-1b64-4b22-8eee-fc9129ca40f2	2026	MIXTO	MS26001	Plataforma LMS 2026	cli_enaex	ENAEX	VG	MA	LMS	Administración y Operación	7.563113e+07	6	5.8e+06	145	5.8e+06	\N	C:\\Users\\gcons\\Downloads\\20. Proyecciones Plataformas 14.05.2026.xlsx	38	2026-05-18 15:29:30	2026-05-18 16:42:45
b3bf41bb-783d-4258-8ce1-adb14476ece4	2026	MIXTO	MS26001	Plataforma LMS 2026	cli_enaex	ENAEX	VG	MA	LMS	Administración y Operación	7.563113e+07	7	5.8e+06	145	5.8e+06	\N	C:\\Users\\gcons\\Downloads\\20. Proyecciones Plataformas 14.05.2026.xlsx	38	2026-05-18 15:29:30	2026-05-18 16:42:45
1166ad30-bbf8-4435-9479-6514bb9a021c	2026	MIXTO	MS26001	Plataforma LMS 2026	cli_enaex	ENAEX	VG	MA	LMS	Administración y Operación	7.563113e+07	8	5.8e+06	\N	5.8e+06	\N	C:\\Users\\gcons\\Downloads\\20. Proyecciones Plataformas 14.05.2026.xlsx	38	2026-05-18 15:29:30	2026-05-18 16:42:45
551ae4a8-e3a0-4e11-9b61-a8408f9e63a7	2026	MIXTO	MS26001	Plataforma LMS 2026	cli_enaex	ENAEX	VG	MA	LMS	Administración y Operación	7.563113e+07	9	5.8e+06	\N	5.8e+06	\N	C:\\Users\\gcons\\Downloads\\20. Proyecciones Plataformas 14.05.2026.xlsx	38	2026-05-18 15:29:30	2026-05-18 16:42:45
4a099cff-5db5-4eb5-bcd1-3325cf368c24	2026	MIXTO	MS26001	Plataforma LMS 2026	cli_enaex	ENAEX	VG	MA	LMS	Administración y Operación	7.563113e+07	10	5.8e+06	\N	5.8e+06	\N	C:\\Users\\gcons\\Downloads\\20. Proyecciones Plataformas 14.05.2026.xlsx	38	2026-05-18 15:29:30	2026-05-18 16:42:45
44b59430-0262-4fe5-8855-1fa9fb8ffea7	2026	MIXTO	MS26001	Plataforma LMS 2026	cli_enaex	ENAEX	VG	MA	LMS	Administración y Operación	7.563113e+07	11	5.8e+06	\N	5.8e+06	\N	C:\\Users\\gcons\\Downloads\\20. Proyecciones Plataformas 14.05.2026.xlsx	38	2026-05-18 15:29:30	2026-05-18 16:42:45
0e38dcc3-897f-4e5c-81eb-a2971fec7ba7	2026	MIXTO	MS26001	Plataforma LMS 2026	cli_enaex	ENAEX	VG	MA	LMS	Administración y Operación	7.563113e+07	12	5.8e+06	\N	5.8e+06	\N	C:\\Users\\gcons\\Downloads\\20. Proyecciones Plataformas 14.05.2026.xlsx	38	2026-05-18 15:29:30	2026-05-18 16:42:45
bdfe25e3-4be1-4b38-a7a7-a076bc09f2d0	2026	EXENTO_IVA	MS26004	Plataforma Reconocimiento 2026	cli_enaex	ENAEX	VG	MA	Reconocimiento	Administración y Operación	1.7020638e+07	1	3.57759e+06	90	3.57759e+06	\N	C:\\Users\\gcons\\Downloads\\20. Proyecciones Plataformas 14.05.2026.xlsx	39	2026-05-18 15:29:30	2026-05-18 16:42:45
51a42ff2-f6fc-43db-bcbb-b484cf665278	2026	EXENTO_IVA	MS26004	Plataforma Reconocimiento 2026	cli_enaex	ENAEX	VG	MA	Reconocimiento	Administración y Operación	1.7020638e+07	7	3.963048e+06	100.33033	3.963048e+06	\N	C:\\Users\\gcons\\Downloads\\20. Proyecciones Plataformas 14.05.2026.xlsx	39	2026-05-18 15:29:30	2026-05-18 16:42:45
95929ad6-9950-46e2-8362-79bfe0b31a19	2026	EXENTO_IVA	MS26004	Plataforma Reconocimiento 2026	cli_enaex	ENAEX	VG	MA	Reconocimiento	Administración y Operación	1.7020638e+07	10	9.48e+06	240	9.48e+06	\N	C:\\Users\\gcons\\Downloads\\20. Proyecciones Plataformas 14.05.2026.xlsx	39	2026-05-18 15:29:30	2026-05-18 16:42:45
5d9e327a-8293-4e19-b3b6-1340a930b8d9	2026	EXENTO_IVA	MS26005	Paquete de Horas 2026	cli_enaex	ENAEX	VG	MA	LMS	Horas de Desarrollo	4.68e+06	12	4.68e+06	117	4.68e+06	\N	C:\\Users\\gcons\\Downloads\\20. Proyecciones Plataformas 14.05.2026.xlsx	40	2026-05-18 15:29:30	2026-05-18 16:42:45
15cfe693-1d4c-495f-b43c-c9a43438244b	2026	AFECTO_IVA	MS25013	Plataforma Reconocimiento 2025	cli_magotteaux	MAGOTTEAUX	VG	MDR	Reconocimiento	Administración y Operación	1.107284e+07	1	1.9356848e+06	48.7	1.9356848e+06	\N	C:\\Users\\gcons\\Downloads\\20. Proyecciones Plataformas 14.05.2026.xlsx	41	2026-05-18 15:29:30	2026-05-18 16:42:45
94df3d90-cc05-426d-9f0b-fa11bd34943f	2026	AFECTO_IVA	MS25013	Plataforma Reconocimiento 2025	cli_magotteaux	MAGOTTEAUX	VG	MDR	Reconocimiento	Administración y Operación	1.107284e+07	2	1.9369752e+06	48.7	1.9369752e+06	\N	C:\\Users\\gcons\\Downloads\\20. Proyecciones Plataformas 14.05.2026.xlsx	41	2026-05-18 15:29:30	2026-05-18 16:42:45
fc8dd506-65f6-410f-a97d-1fb2aa548770	2026	AFECTO_IVA	MS25013	Plataforma Reconocimiento 2025	cli_magotteaux	MAGOTTEAUX	VG	MDR	Reconocimiento	Administración y Operación	1.107284e+07	3	717150.94	18	717150.94	\N	C:\\Users\\gcons\\Downloads\\20. Proyecciones Plataformas 14.05.2026.xlsx	41	2026-05-18 15:29:30	2026-05-18 16:42:45
3834c6c3-9a07-4b06-8868-33d2bbd76e58	2026	AFECTO_IVA	MS25013	Plataforma Reconocimiento 2025	cli_magotteaux	MAGOTTEAUX	VG	MDR	Reconocimiento	Administración y Operación	1.107284e+07	4	718103	18	718103	\N	C:\\Users\\gcons\\Downloads\\20. Proyecciones Plataformas 14.05.2026.xlsx	41	2026-05-18 15:29:30	2026-05-18 16:42:45
49b2050d-7688-47f4-9d99-ebaf5eeb5d7f	2026	AFECTO_IVA	MS25013	Plataforma Reconocimiento 2025	cli_magotteaux	MAGOTTEAUX	VG	MDR	Reconocimiento	Administración y Operación	1.107284e+07	5	724926.44	18	724926.44	\N	C:\\Users\\gcons\\Downloads\\20. Proyecciones Plataformas 14.05.2026.xlsx	41	2026-05-18 15:29:30	2026-05-18 16:42:45
93cf7589-c313-451f-854b-06f5bc4d6a78	2026	AFECTO_IVA	MS25013	Plataforma Reconocimiento 2025	cli_magotteaux	MAGOTTEAUX	VG	MDR	Reconocimiento	Administración y Operación	1.107284e+07	6	720000	18	720000	\N	C:\\Users\\gcons\\Downloads\\20. Proyecciones Plataformas 14.05.2026.xlsx	41	2026-05-18 15:29:30	2026-05-18 16:42:45
9e4ec53f-631e-41a6-903b-cae5e58f0df7	2026	AFECTO_IVA	MS25013	Plataforma Reconocimiento 2025	cli_magotteaux	MAGOTTEAUX	VG	MDR	Reconocimiento	Administración y Operación	1.107284e+07	7	720000	\N	720000	\N	C:\\Users\\gcons\\Downloads\\20. Proyecciones Plataformas 14.05.2026.xlsx	41	2026-05-18 15:29:30	2026-05-18 16:42:45
3a7c5f39-4da5-425f-914e-055970c96d44	2026	AFECTO_IVA	MS25013	Plataforma Reconocimiento 2025	cli_magotteaux	MAGOTTEAUX	VG	MDR	Reconocimiento	Administración y Operación	1.107284e+07	8	720000	\N	720000	\N	C:\\Users\\gcons\\Downloads\\20. Proyecciones Plataformas 14.05.2026.xlsx	41	2026-05-18 15:29:30	2026-05-18 16:42:45
2d2ea82c-c77a-4614-9dcf-abe77d7f01d4	2026	AFECTO_IVA	MS25013	Plataforma Reconocimiento 2025	cli_magotteaux	MAGOTTEAUX	VG	MDR	Reconocimiento	Administración y Operación	1.107284e+07	9	720000	\N	720000	\N	C:\\Users\\gcons\\Downloads\\20. Proyecciones Plataformas 14.05.2026.xlsx	41	2026-05-18 15:29:30	2026-05-18 16:42:45
89dcfb43-5c69-41b7-b066-d1ee503e75cc	2026	AFECTO_IVA	MS25013	Plataforma Reconocimiento 2025	cli_magotteaux	MAGOTTEAUX	VG	MDR	Reconocimiento	Administración y Operación	1.107284e+07	10	720000	\N	720000	\N	C:\\Users\\gcons\\Downloads\\20. Proyecciones Plataformas 14.05.2026.xlsx	41	2026-05-18 15:29:30	2026-05-18 16:42:45
365f8cfb-0bb6-42ab-89cc-138a7fa513f2	2026	AFECTO_IVA	MS25013	Plataforma Reconocimiento 2025	cli_magotteaux	MAGOTTEAUX	VG	MDR	Reconocimiento	Administración y Operación	1.107284e+07	11	720000	\N	720000	\N	C:\\Users\\gcons\\Downloads\\20. Proyecciones Plataformas 14.05.2026.xlsx	41	2026-05-18 15:29:30	2026-05-18 16:42:45
18c4967e-3448-461a-b2ee-1b7a10b04c0f	2026	AFECTO_IVA	MS25013	Plataforma Reconocimiento 2025	cli_magotteaux	MAGOTTEAUX	VG	MDR	Reconocimiento	Administración y Operación	1.107284e+07	12	720000	\N	720000	\N	C:\\Users\\gcons\\Downloads\\20. Proyecciones Plataformas 14.05.2026.xlsx	41	2026-05-18 15:29:30	2026-05-18 16:42:45
cf5b3096-bfd7-4268-bb3b-664ea6ffa2a9	2026	AFECTO_IVA	MS21000	LMS	cli_resiter	RESITER	VG	MDR	LMS	Administración y Operación	214629.58	1	214629.58	5.4093647	214629.58	\N	C:\\Users\\gcons\\Downloads\\20. Proyecciones Plataformas 14.05.2026.xlsx	42	2026-05-18 15:29:30	2026-05-18 16:42:45
8953329d-2a4d-4c46-89c7-511c82c3416f	2026	AFECTO_IVA	MS26063	Plataforma Liderazgo 2026	cli_salmones	SALMONES AUSTRAL	VG	MDR	Liderazgo	Administración y Operación	7.7451215e+06	5	4e+06	100	4e+06	\N	C:\\Users\\gcons\\Downloads\\20. Proyecciones Plataformas 14.05.2026.xlsx	43	2026-05-18 15:29:30	2026-05-18 16:42:45
0dac2550-24a4-47d8-a2d9-e841400ff652	2026	AFECTO_IVA	MS26063	Plataforma Liderazgo 2026	cli_salmones	SALMONES AUSTRAL	VG	MDR	Liderazgo	Administración y Operación	7.7451215e+06	6	3.7451218e+06	94	3.7451218e+06	\N	C:\\Users\\gcons\\Downloads\\20. Proyecciones Plataformas 14.05.2026.xlsx	43	2026-05-18 15:29:30	2026-05-18 16:42:45
05f09974-2ac4-4879-b235-e281141bb6ea	2026	AFECTO_IVA	MS25008	Plataforma Desempeño 2025 - Profesionales	cli_soprole	SOPROLE	VG	MA	Desempeño	Administración y Operación	1.6732564e+07	1	1.3905202e+06	35	1.3905202e+06	\N	C:\\Users\\gcons\\Downloads\\20. Proyecciones Plataformas 14.05.2026.xlsx	44	2026-05-18 15:29:30	2026-05-18 16:42:45
e46e2fba-0bf8-4942-bd12-b1e4da21c8af	2026	AFECTO_IVA	MS25008	Plataforma Desempeño 2025 - Profesionales	cli_soprole	SOPROLE	VG	MA	Desempeño	Administración y Operación	1.6732564e+07	3	2.787728e+06	70	2.787728e+06	\N	C:\\Users\\gcons\\Downloads\\20. Proyecciones Plataformas 14.05.2026.xlsx	44	2026-05-18 15:29:30	2026-05-18 16:42:45
aeed362f-9a62-48d3-a13c-c8e54ae57c14	2026	AFECTO_IVA	MS25008	Plataforma Desempeño 2025 - Profesionales	cli_soprole	SOPROLE	VG	MA	Desempeño	Administración y Operación	1.6732564e+07	4	1.3963114e+06	35	1.3963114e+06	\N	C:\\Users\\gcons\\Downloads\\20. Proyecciones Plataformas 14.05.2026.xlsx	44	2026-05-18 15:29:30	2026-05-18 16:42:45
f29e0b02-9a78-4b65-ac1b-e77c64375738	2026	AFECTO_IVA	MS25008	Plataforma Desempeño 2025 - Profesionales	cli_soprole	SOPROLE	VG	MA	Desempeño	Administración y Operación	1.6732564e+07	5	1.4070042e+06	35	1.4070042e+06	\N	C:\\Users\\gcons\\Downloads\\20. Proyecciones Plataformas 14.05.2026.xlsx	44	2026-05-18 15:29:30	2026-05-18 16:42:45
c39f96ce-1a4a-4a47-8506-bda4d59bbf81	2026	AFECTO_IVA	MS25008	Plataforma Desempeño 2025 - Profesionales	cli_soprole	SOPROLE	VG	MA	Desempeño	Administración y Operación	1.6732564e+07	6	1.393e+06	35	1.393e+06	\N	C:\\Users\\gcons\\Downloads\\20. Proyecciones Plataformas 14.05.2026.xlsx	44	2026-05-18 15:29:30	2026-05-18 16:42:45
8d653cff-1637-4eec-899e-4977a71ebb39	2026	AFECTO_IVA	MS25008	Plataforma Desempeño 2025 - Profesionales	cli_soprole	SOPROLE	VG	MA	Desempeño	Administración y Operación	1.6732564e+07	7	1.393e+06	\N	1.393e+06	\N	C:\\Users\\gcons\\Downloads\\20. Proyecciones Plataformas 14.05.2026.xlsx	44	2026-05-18 15:29:30	2026-05-18 16:42:45
f83fc5f5-39ef-49fd-b6e5-31c78619e4e0	2026	AFECTO_IVA	MS25008	Plataforma Desempeño 2025 - Profesionales	cli_soprole	SOPROLE	VG	MA	Desempeño	Administración y Operación	1.6732564e+07	8	1.393e+06	\N	1.393e+06	\N	C:\\Users\\gcons\\Downloads\\20. Proyecciones Plataformas 14.05.2026.xlsx	44	2026-05-18 15:29:30	2026-05-18 16:42:45
ed517aa3-d75e-4e73-9da2-b8f2a03ffa2c	2026	AFECTO_IVA	MS25008	Plataforma Desempeño 2025 - Profesionales	cli_soprole	SOPROLE	VG	MA	Desempeño	Administración y Operación	1.6732564e+07	9	1.393e+06	\N	1.393e+06	\N	C:\\Users\\gcons\\Downloads\\20. Proyecciones Plataformas 14.05.2026.xlsx	44	2026-05-18 15:29:30	2026-05-18 16:42:45
fc828bcb-8d48-4307-b9c6-c78813676627	2026	AFECTO_IVA	MS25008	Plataforma Desempeño 2025 - Profesionales	cli_soprole	SOPROLE	VG	MA	Desempeño	Administración y Operación	1.6732564e+07	10	1.393e+06	\N	1.393e+06	\N	C:\\Users\\gcons\\Downloads\\20. Proyecciones Plataformas 14.05.2026.xlsx	44	2026-05-18 15:29:30	2026-05-18 16:42:45
09ca178a-a692-4891-ad89-c1eaf13fbb1a	2026	AFECTO_IVA	MS25008	Plataforma Desempeño 2025 - Profesionales	cli_soprole	SOPROLE	VG	MA	Desempeño	Administración y Operación	1.6732564e+07	11	1.393e+06	\N	1.393e+06	\N	C:\\Users\\gcons\\Downloads\\20. Proyecciones Plataformas 14.05.2026.xlsx	44	2026-05-18 15:29:30	2026-05-18 16:42:45
560b15a4-fed3-4d20-8b9e-568e3aa139c9	2026	AFECTO_IVA	MS25008	Plataforma Desempeño 2025 - Profesionales	cli_soprole	SOPROLE	VG	MA	Desempeño	Administración y Operación	1.6732564e+07	12	1.393e+06	\N	1.393e+06	\N	C:\\Users\\gcons\\Downloads\\20. Proyecciones Plataformas 14.05.2026.xlsx	44	2026-05-18 15:29:30	2026-05-18 16:42:45
c0f29acc-d936-4465-b5ff-3fbc49f6f58b	2026	AFECTO_IVA	MS25027	Plataforma LMS 2025	cli_transelect	TRANSELEC	VG	DL	LMS	Administración y Operación	1.4357458e+07	2	2.3840365e+06	60	2.3840365e+06	\N	C:\\Users\\gcons\\Downloads\\20. Proyecciones Plataformas 14.05.2026.xlsx	45	2026-05-18 15:29:30	2026-05-18 16:42:45
5a3b86d4-2742-4c6a-b033-3bd91fefa382	2026	AFECTO_IVA	MS25027	Plataforma LMS 2025	cli_transelect	TRANSELEC	VG	DL	LMS	Administración y Operación	1.4357458e+07	3	4.7810065e+06	120	4.7810065e+06	\N	C:\\Users\\gcons\\Downloads\\20. Proyecciones Plataformas 14.05.2026.xlsx	45	2026-05-18 15:29:30	2026-05-18 16:42:45
347584ea-8ced-44d1-9adb-ed1b41c1c9bf	2026	AFECTO_IVA	MS25027	Plataforma LMS 2025	cli_transelect	TRANSELEC	VG	DL	LMS	Administración y Operación	1.4357458e+07	4	2.4112075e+06	60	2.4112075e+06	\N	C:\\Users\\gcons\\Downloads\\20. Proyecciones Plataformas 14.05.2026.xlsx	45	2026-05-18 15:29:30	2026-05-18 16:42:45
02783c48-2950-453a-b58e-387dc17ac173	2026	AFECTO_IVA	MS25027	Plataforma LMS 2025	cli_transelect	TRANSELEC	VG	DL	LMS	Administración y Operación	1.4357458e+07	5	2.4112075e+06	60	2.4112075e+06	\N	C:\\Users\\gcons\\Downloads\\20. Proyecciones Plataformas 14.05.2026.xlsx	45	2026-05-18 15:29:30	2026-05-18 16:42:45
ab9c54e4-1dc6-4675-a69c-161d7a7f0aa2	2026	AFECTO_IVA	MS25027	Plataforma LMS 2025	cli_transelect	TRANSELEC	VG	DL	LMS	Administración y Operación	1.4357458e+07	6	2.37e+06	60	2.37e+06	\N	C:\\Users\\gcons\\Downloads\\20. Proyecciones Plataformas 14.05.2026.xlsx	45	2026-05-18 15:29:30	2026-05-18 16:42:45
eb4615fc-84d8-4aed-a9f5-5d10f2486bfb	2026	EXENTO_IVA	MS24049	Platas Sin Asignar	cli_banco_internacional	BANCO INTERNACIONAL	VG	DL			\N	3	8.222048e+06	\N	8.222048e+06	\N	C:\\Users\\gcons\\Downloads\\20. Proyecciones Plataformas 14.05.2026.xlsx	49	2026-05-18 15:29:30	2026-05-18 16:42:45
\.


--
-- Data for Name: proyeccion_auxiliar; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.proyeccion_auxiliar (id, anio, hoja, fila, data_json, source, created_at) FROM stdin;
beec7655-1540-4a5a-85fc-042f0c7087ec	2026	Hoja1	1	["Proyecciones Vale","85202994.126","24091395.444","75868641.51680002","13026365.765999999"]	20. Proyecciones Plataformas 14.05.2026.xlsx	2026-05-18 16:09:12
a5d15c62-fd6f-4e1a-8503-a9860d0251f4	2026	Hoja1	2	["Proyecciones Maca","85203038.544","24091395","75868642","13026365"]	20. Proyecciones Plataformas 14.05.2026.xlsx	2026-05-18 16:09:12
ab4ed179-52a2-476b-bcf2-2856251cef8f	2026	Hoja1	3	["Diferencia","44.41799999773502","-0.4439999982714653","0.48319998383522034","-0.7659999988973141"]	20. Proyecciones Plataformas 14.05.2026.xlsx	2026-05-18 16:09:12
10f88d6c-16a0-493c-9cf3-20c0ea7e8447	2026	Hoja2	1	["CP","CLIENTE","PRODUCTO"]	20. Proyecciones Plataformas 14.05.2026.xlsx	2026-05-18 16:09:12
d37f1fb1-5dfc-4772-b1fc-f87dd00b8849	2026	Hoja2	2	["MS24191","AFP HABITAT","Desempeño"]	20. Proyecciones Plataformas 14.05.2026.xlsx	2026-05-18 16:09:12
9739e934-b9a1-41b1-b460-3df50ca64874	2026	Hoja2	3	["MS24206","AFP HABITAT","Desempeño"]	20. Proyecciones Plataformas 14.05.2026.xlsx	2026-05-18 16:09:12
5efad5f2-a38f-4688-bad6-a2b4b8b4d530	2026	Hoja2	4	["MS24207","AFP HABITAT","Reconocimiento"]	20. Proyecciones Plataformas 14.05.2026.xlsx	2026-05-18 16:09:12
9bab1902-0b1b-4fe5-a156-094792086939	2026	Hoja2	5	["MS24208","AFP HABITAT","Clima/Encuestas"]	20. Proyecciones Plataformas 14.05.2026.xlsx	2026-05-18 16:09:12
ebaad4d0-873a-4788-b648-b91601f5b856	2026	Hoja2	6	["MS24209","AFP HABITAT","Desempeño"]	20. Proyecciones Plataformas 14.05.2026.xlsx	2026-05-18 16:09:12
613200ef-2b47-4e8e-9c2e-511a2093e9bc	2026	Hoja2	7	["MS24210","AFP HABITAT","Gestión Capacitación"]	20. Proyecciones Plataformas 14.05.2026.xlsx	2026-05-18 16:09:12
447e67f2-df50-4cfc-8702-1b0486c51973	2026	Hoja2	8	["MS24211","AFP HABITAT","LMS"]	20. Proyecciones Plataformas 14.05.2026.xlsx	2026-05-18 16:09:12
29607c06-cd25-481d-ba13-3ca2744e6dce	2026	Hoja2	9	["MS24212","AFP HABITAT","Talentos"]	20. Proyecciones Plataformas 14.05.2026.xlsx	2026-05-18 16:09:12
a08d34f9-5950-4888-91ca-13c446226b2d	2026	Hoja2	10	["MS24213","AFP HABITAT","LMS"]	20. Proyecciones Plataformas 14.05.2026.xlsx	2026-05-18 16:09:12
d3947587-a9f4-42d8-aa95-133bbc2b2599	2026	Hoja2	11	["MS24225","AFP HABITAT","LMS"]	20. Proyecciones Plataformas 14.05.2026.xlsx	2026-05-18 16:09:12
961b0570-aae9-4294-87e6-ae7ff65211a2	2026	Hoja2	12	["MS24056","Arcor","Talentos"]	20. Proyecciones Plataformas 14.05.2026.xlsx	2026-05-18 16:09:12
88dd6a5c-a4c5-4fac-884e-7a574502e756	2026	Hoja2	13	["MS24057","Arcor","Talentos"]	20. Proyecciones Plataformas 14.05.2026.xlsx	2026-05-18 16:09:12
387be27e-0f17-4487-8c82-be6aa9e28c16	2026	Hoja2	14	["MS23157","Ariztía","Reconocimiento"]	20. Proyecciones Plataformas 14.05.2026.xlsx	2026-05-18 16:09:12
dd4f164f-26d3-4fd6-9392-6123e8406847	2026	Hoja2	15	["MS24232","Ariztía","Gestión Capacitación"]	20. Proyecciones Plataformas 14.05.2026.xlsx	2026-05-18 16:09:12
116c6fe6-22f6-427a-a28d-7702d91bf2cf	2026	Hoja2	16	["MS24233","Ariztía","Clima/Encuestas"]	20. Proyecciones Plataformas 14.05.2026.xlsx	2026-05-18 16:09:12
9ab31e01-1a50-41e2-bd97-ad5f0c23bdc8	2026	Hoja2	17	["MS24234","Ariztía","Reconocimiento"]	20. Proyecciones Plataformas 14.05.2026.xlsx	2026-05-18 16:09:12
51bb4937-13bf-4531-9c87-2e042c36fcd8	2026	Hoja2	18	["MS25016","AVLA","Desempeño"]	20. Proyecciones Plataformas 14.05.2026.xlsx	2026-05-18 16:09:12
068e496e-e42d-4648-a9d2-2c098d8ac479	2026	Hoja2	19	["MS25003","AZA","Gestión Capacitación"]	20. Proyecciones Plataformas 14.05.2026.xlsx	2026-05-18 16:09:12
22fb203f-7383-47f4-a15d-79cbe32625e2	2026	Hoja2	20	["MS25002","AZA","LMS"]	20. Proyecciones Plataformas 14.05.2026.xlsx	2026-05-18 16:09:12
65dd949f-d6ed-4206-ab3d-cb2ac94be0c0	2026	Hoja2	21	["MS25004","AZA","LMS"]	20. Proyecciones Plataformas 14.05.2026.xlsx	2026-05-18 16:09:12
4cddc369-2c2c-4e9e-a7bb-2289904eb02d	2026	Hoja2	22	["MS24197","BANCO ESTADO EXPRESS","LMS"]	20. Proyecciones Plataformas 14.05.2026.xlsx	2026-05-18 16:09:12
70e3f424-125b-4af7-adcf-d3cacf12f0b3	2026	Hoja2	23	["MS24198","BANCO ESTADO EXPRESS","LMS"]	20. Proyecciones Plataformas 14.05.2026.xlsx	2026-05-18 16:09:12
a94d1f23-116c-4324-8a15-5e0e88d0217b	2026	Hoja2	24	["MS24199","BANCO ESTADO EXPRESS","Gestión Capacitación"]	20. Proyecciones Plataformas 14.05.2026.xlsx	2026-05-18 16:09:12
5202b740-7849-41c4-a839-290be777879c	2026	Hoja2	25	["MS24200","BANCO ESTADO EXPRESS","Desempeño"]	20. Proyecciones Plataformas 14.05.2026.xlsx	2026-05-18 16:09:12
574bbc06-90a7-4257-bf12-6345d7682003	2026	Hoja2	26	["MS24201","BANCO ESTADO EXPRESS","Liderazgo"]	20. Proyecciones Plataformas 14.05.2026.xlsx	2026-05-18 16:09:12
160624c5-d0f9-41ad-95b7-6927449665df	2026	Hoja2	27	["MS24202","BANCO ESTADO EXPRESS","Clima/Encuestas"]	20. Proyecciones Plataformas 14.05.2026.xlsx	2026-05-18 16:09:12
b4aa8334-bbc5-4182-8ddc-f66c1a5c5f56	2026	Hoja2	28	["MS24203","BANCO ESTADO EXPRESS","Reconocimiento"]	20. Proyecciones Plataformas 14.05.2026.xlsx	2026-05-18 16:09:12
67e75410-742e-43ff-b016-608b9bc4dbd0	2026	Hoja2	29	["MS24205","BANCO ESTADO EXPRESS","Talentos"]	20. Proyecciones Plataformas 14.05.2026.xlsx	2026-05-18 16:09:12
baa06977-c515-4a48-bd6e-0b42aca3c634	2026	Hoja2	30	["MS24217","BANCO INTERNACIONAL","LMS"]	20. Proyecciones Plataformas 14.05.2026.xlsx	2026-05-18 16:09:12
7aa37a65-7c91-4f24-98bd-1b013dcf8fbc	2026	Hoja2	31	["MS24218","BANCO INTERNACIONAL","Gestión Capacitación"]	20. Proyecciones Plataformas 14.05.2026.xlsx	2026-05-18 16:09:12
a46c7f8d-d6a9-4475-bf79-ccbe8299bac6	2026	Hoja2	32	["MS24099","BECO","LMS"]	20. Proyecciones Plataformas 14.05.2026.xlsx	2026-05-18 16:09:12
aa46d171-6939-4c7e-b6bd-32aa1112b992	2026	Hoja2	33	["MS24014","CAROZZI","LMS"]	20. Proyecciones Plataformas 14.05.2026.xlsx	2026-05-18 16:09:12
ab9de8b1-474a-4681-9764-39ab707d0439	2026	Hoja2	34	["MS24015","CAROZZI","Gestión Capacitación"]	20. Proyecciones Plataformas 14.05.2026.xlsx	2026-05-18 16:09:12
565f725a-834a-4c2b-8778-4d2ffce4da21	2026	Hoja2	35	["MS25006","COPEC","Desempeño"]	20. Proyecciones Plataformas 14.05.2026.xlsx	2026-05-18 16:09:12
402c5ff3-d14a-4568-9482-91c6655af4f5	2026	Hoja2	36	["MS25007","COPEC","Talentos"]	20. Proyecciones Plataformas 14.05.2026.xlsx	2026-05-18 16:09:12
d95fd83d-76fd-4394-9de7-c49260987f73	2026	Hoja2	37	["MS25015","COPEC","Desempeño"]	20. Proyecciones Plataformas 14.05.2026.xlsx	2026-05-18 16:09:12
6ded157f-3164-4893-8d1f-97b4c241543e	2026	Hoja2	38	["MS23206","ENAEX","LMS"]	20. Proyecciones Plataformas 14.05.2026.xlsx	2026-05-18 16:09:12
3474de30-f363-4bce-9083-e067ad520254	2026	Hoja2	39	["MS24221","ENAEX","Gestión Capacitación"]	20. Proyecciones Plataformas 14.05.2026.xlsx	2026-05-18 16:09:12
96021579-aef3-40b1-a951-0b33ecd10512	2026	Hoja2	40	["MS24222","ENAEX","LMS"]	20. Proyecciones Plataformas 14.05.2026.xlsx	2026-05-18 16:09:12
d2182244-ae27-4e36-a3bb-737fc38d8305	2026	Hoja2	41	["MS24223","ENAEX","Reconocimiento"]	20. Proyecciones Plataformas 14.05.2026.xlsx	2026-05-18 16:09:12
a97f5825-512e-4964-b312-68d01144b397	2026	Hoja2	42	["MS24224","ENAEX","LMS"]	20. Proyecciones Plataformas 14.05.2026.xlsx	2026-05-18 16:09:12
44fcb917-1e00-4c10-8a88-01d59d7f4847	2026	Hoja2	43	["MS25012","MAGOTTEAUX","Reconocimiento"]	20. Proyecciones Plataformas 14.05.2026.xlsx	2026-05-18 16:09:12
72acc4d8-4495-4064-8652-94c0e793436f	2026	Hoja2	44	["MS25013","MAGOTTEAUX","Reconocimiento"]	20. Proyecciones Plataformas 14.05.2026.xlsx	2026-05-18 16:09:12
8c510ace-953f-42f2-a9d3-7f7edae67ed1	2026	Hoja2	45	["MS25014","MAGOTTEAUX","Reconocimiento"]	20. Proyecciones Plataformas 14.05.2026.xlsx	2026-05-18 16:09:12
7b83ca85-5216-4092-9884-3ac7521aac1a	2026	Hoja2	46	["MS21050","MAS","LMS"]	20. Proyecciones Plataformas 14.05.2026.xlsx	2026-05-18 16:09:12
a702ce16-577e-4123-8e77-7dc6ef93e494	2026	Hoja2	47	["MS21000","RESITER","LMS"]	20. Proyecciones Plataformas 14.05.2026.xlsx	2026-05-18 16:09:12
4aa60539-698d-4f2e-8c90-2fe22d680351	2026	Hoja2	48	["MS24062","SALFACORP","Clima/Encuestas"]	20. Proyecciones Plataformas 14.05.2026.xlsx	2026-05-18 16:09:12
e75753be-0272-42ab-adc5-549ca574d860	2026	Hoja2	49	["MS24033","SALMONES AUSTRAL","Liderazgo"]	20. Proyecciones Plataformas 14.05.2026.xlsx	2026-05-18 16:09:12
5f6a694a-c614-4014-95cd-5a20773d1913	2026	Hoja2	50	["MS24236","SIGDO KOPPERS","LMS"]	20. Proyecciones Plataformas 14.05.2026.xlsx	2026-05-18 16:09:12
17350ec9-c165-40d6-a4e2-d9720f32a5f4	2026	Hoja2	51	["MS25017","SOPROLE","Desempeño"]	20. Proyecciones Plataformas 14.05.2026.xlsx	2026-05-18 16:09:12
f7fe4854-cd68-4e83-8511-77f1d6442031	2026	Hoja2	52	["MS25008","SOPROLE","Desempeño"]	20. Proyecciones Plataformas 14.05.2026.xlsx	2026-05-18 16:09:12
87b1d5e6-2f85-4d09-8821-d862a9abb14a	2026	Hoja2	53	["MS25009","SOPROLE","Desempeño"]	20. Proyecciones Plataformas 14.05.2026.xlsx	2026-05-18 16:09:12
2228c4a4-2731-4f00-a8d6-e100d5fc42a7	2026	Hoja2	54	["MS25010","SOPROLE","Talentos"]	20. Proyecciones Plataformas 14.05.2026.xlsx	2026-05-18 16:09:12
2c67a6f3-fea0-4b14-bad5-6b426a14f75e	2026	Hoja2	55	["MS23200","TRANSELEC","LMS"]	20. Proyecciones Plataformas 14.05.2026.xlsx	2026-05-18 16:09:12
d00cdc85-abf0-488d-82ff-960fca0be2d4	2026	Hoja1	1	["Proyecciones Vale","85202994.126","24091395.444","75868641.51680002","13026365.765999999"]	C:\\Users\\gcons\\Downloads\\20. Proyecciones Plataformas 14.05.2026.xlsx	2026-05-18 16:42:45
7b433d33-6a9f-4939-a91d-40824d829729	2026	Hoja1	2	["Proyecciones Maca","85203038.544","24091395","75868642","13026365"]	C:\\Users\\gcons\\Downloads\\20. Proyecciones Plataformas 14.05.2026.xlsx	2026-05-18 16:42:45
89724be8-bea8-416e-9065-96967cc12c0e	2026	Hoja1	3	["Diferencia","44.41799999773502","-0.4439999982714653","0.48319998383522034","-0.7659999988973141"]	C:\\Users\\gcons\\Downloads\\20. Proyecciones Plataformas 14.05.2026.xlsx	2026-05-18 16:42:45
db2de412-0513-4058-a2e3-f6ff41ef52be	2026	Hoja2	1	["CP","CLIENTE","PRODUCTO"]	C:\\Users\\gcons\\Downloads\\20. Proyecciones Plataformas 14.05.2026.xlsx	2026-05-18 16:42:45
23e58529-3e60-4a7b-8671-bf3789158937	2026	Hoja2	2	["MS24191","AFP HABITAT","Desempeño"]	C:\\Users\\gcons\\Downloads\\20. Proyecciones Plataformas 14.05.2026.xlsx	2026-05-18 16:42:45
8c665c75-ff98-4aec-9bba-4222fb6a6da4	2026	Hoja2	3	["MS24206","AFP HABITAT","Desempeño"]	C:\\Users\\gcons\\Downloads\\20. Proyecciones Plataformas 14.05.2026.xlsx	2026-05-18 16:42:45
8357e44d-2f81-4dc5-bf0e-beb6efad907e	2026	Hoja2	4	["MS24207","AFP HABITAT","Reconocimiento"]	C:\\Users\\gcons\\Downloads\\20. Proyecciones Plataformas 14.05.2026.xlsx	2026-05-18 16:42:45
4b063957-76e4-4bf9-8cba-e4ba9f111a4e	2026	Hoja2	5	["MS24208","AFP HABITAT","Clima/Encuestas"]	C:\\Users\\gcons\\Downloads\\20. Proyecciones Plataformas 14.05.2026.xlsx	2026-05-18 16:42:45
0767b6cf-79ae-453f-8faf-2cf8dbf9439c	2026	Hoja2	6	["MS24209","AFP HABITAT","Desempeño"]	C:\\Users\\gcons\\Downloads\\20. Proyecciones Plataformas 14.05.2026.xlsx	2026-05-18 16:42:45
207f79c9-09d1-4e95-bd54-f5004ff8cc8d	2026	Hoja2	7	["MS24210","AFP HABITAT","Gestión Capacitación"]	C:\\Users\\gcons\\Downloads\\20. Proyecciones Plataformas 14.05.2026.xlsx	2026-05-18 16:42:45
08b3a8c9-62e6-4a89-ad05-7edf511d144b	2026	Hoja2	8	["MS24211","AFP HABITAT","LMS"]	C:\\Users\\gcons\\Downloads\\20. Proyecciones Plataformas 14.05.2026.xlsx	2026-05-18 16:42:45
612d4b3e-c5e8-4f8e-af73-453f2317c111	2026	Hoja2	9	["MS24212","AFP HABITAT","Talentos"]	C:\\Users\\gcons\\Downloads\\20. Proyecciones Plataformas 14.05.2026.xlsx	2026-05-18 16:42:45
1f993cd3-b008-4b1c-b23d-2d29ff8ba554	2026	Hoja2	10	["MS24213","AFP HABITAT","LMS"]	C:\\Users\\gcons\\Downloads\\20. Proyecciones Plataformas 14.05.2026.xlsx	2026-05-18 16:42:45
6c00792e-9f60-4bcf-9ed3-cecb00899bba	2026	Hoja2	11	["MS24225","AFP HABITAT","LMS"]	C:\\Users\\gcons\\Downloads\\20. Proyecciones Plataformas 14.05.2026.xlsx	2026-05-18 16:42:45
94699189-4573-48bf-b2b6-4fbe75f8c321	2026	Hoja2	12	["MS24056","Arcor","Talentos"]	C:\\Users\\gcons\\Downloads\\20. Proyecciones Plataformas 14.05.2026.xlsx	2026-05-18 16:42:45
a9dd519b-35d4-4629-8668-35710ad6805a	2026	Hoja2	13	["MS24057","Arcor","Talentos"]	C:\\Users\\gcons\\Downloads\\20. Proyecciones Plataformas 14.05.2026.xlsx	2026-05-18 16:42:45
ae4be7d9-8e03-40ba-8d24-2ebabb949eae	2026	Hoja2	14	["MS23157","Ariztía","Reconocimiento"]	C:\\Users\\gcons\\Downloads\\20. Proyecciones Plataformas 14.05.2026.xlsx	2026-05-18 16:42:45
d5369352-986e-45e8-b571-486b25ca55b4	2026	Hoja2	15	["MS24232","Ariztía","Gestión Capacitación"]	C:\\Users\\gcons\\Downloads\\20. Proyecciones Plataformas 14.05.2026.xlsx	2026-05-18 16:42:45
dced7b2f-01cc-4c84-8659-5b3da4b55af7	2026	Hoja2	16	["MS24233","Ariztía","Clima/Encuestas"]	C:\\Users\\gcons\\Downloads\\20. Proyecciones Plataformas 14.05.2026.xlsx	2026-05-18 16:42:45
1d3738d3-978d-412a-850c-1d36babf8c52	2026	Hoja2	17	["MS24234","Ariztía","Reconocimiento"]	C:\\Users\\gcons\\Downloads\\20. Proyecciones Plataformas 14.05.2026.xlsx	2026-05-18 16:42:45
d6acdfe1-ef67-4df6-9fc9-04a875f5fed7	2026	Hoja2	18	["MS25016","AVLA","Desempeño"]	C:\\Users\\gcons\\Downloads\\20. Proyecciones Plataformas 14.05.2026.xlsx	2026-05-18 16:42:45
4aaa3897-eb88-446e-9bc8-dda8cfddfc76	2026	Hoja2	19	["MS25003","AZA","Gestión Capacitación"]	C:\\Users\\gcons\\Downloads\\20. Proyecciones Plataformas 14.05.2026.xlsx	2026-05-18 16:42:45
f9dfefab-3df3-4c63-b624-22551801a43d	2026	Hoja2	20	["MS25002","AZA","LMS"]	C:\\Users\\gcons\\Downloads\\20. Proyecciones Plataformas 14.05.2026.xlsx	2026-05-18 16:42:45
d6a9c9c8-0d80-4dfc-8053-938f0ad0a190	2026	Hoja2	21	["MS25004","AZA","LMS"]	C:\\Users\\gcons\\Downloads\\20. Proyecciones Plataformas 14.05.2026.xlsx	2026-05-18 16:42:45
894d69e4-1f2c-4d10-aeaa-d0ddb59950eb	2026	Hoja2	22	["MS24197","BANCO ESTADO EXPRESS","LMS"]	C:\\Users\\gcons\\Downloads\\20. Proyecciones Plataformas 14.05.2026.xlsx	2026-05-18 16:42:45
bf46f7af-30a2-4af2-a3c2-3dafddeb656a	2026	Hoja2	23	["MS24198","BANCO ESTADO EXPRESS","LMS"]	C:\\Users\\gcons\\Downloads\\20. Proyecciones Plataformas 14.05.2026.xlsx	2026-05-18 16:42:45
1722d6a8-1601-454d-8e94-85df5d3206fb	2026	Hoja2	24	["MS24199","BANCO ESTADO EXPRESS","Gestión Capacitación"]	C:\\Users\\gcons\\Downloads\\20. Proyecciones Plataformas 14.05.2026.xlsx	2026-05-18 16:42:45
611f9ad9-d20e-4981-8051-7fe950ac5a22	2026	Hoja2	25	["MS24200","BANCO ESTADO EXPRESS","Desempeño"]	C:\\Users\\gcons\\Downloads\\20. Proyecciones Plataformas 14.05.2026.xlsx	2026-05-18 16:42:45
8d9f646b-ce1b-4ec1-9d15-e9dbf0097635	2026	Hoja2	26	["MS24201","BANCO ESTADO EXPRESS","Liderazgo"]	C:\\Users\\gcons\\Downloads\\20. Proyecciones Plataformas 14.05.2026.xlsx	2026-05-18 16:42:45
9a12b68e-82f1-4ca0-90dd-0b00415edc2d	2026	Hoja2	27	["MS24202","BANCO ESTADO EXPRESS","Clima/Encuestas"]	C:\\Users\\gcons\\Downloads\\20. Proyecciones Plataformas 14.05.2026.xlsx	2026-05-18 16:42:45
c92043dd-3f12-4bea-9da2-67e2817ed3c8	2026	Hoja2	28	["MS24203","BANCO ESTADO EXPRESS","Reconocimiento"]	C:\\Users\\gcons\\Downloads\\20. Proyecciones Plataformas 14.05.2026.xlsx	2026-05-18 16:42:45
89bb31c2-4a39-43b4-810e-5b9ee365f6d4	2026	Hoja2	29	["MS24205","BANCO ESTADO EXPRESS","Talentos"]	C:\\Users\\gcons\\Downloads\\20. Proyecciones Plataformas 14.05.2026.xlsx	2026-05-18 16:42:45
474bc920-f964-40e7-a258-dd8b04c7ee5b	2026	Hoja2	30	["MS24217","BANCO INTERNACIONAL","LMS"]	C:\\Users\\gcons\\Downloads\\20. Proyecciones Plataformas 14.05.2026.xlsx	2026-05-18 16:42:45
b820d7eb-2fbd-4100-9322-d224ea1599b2	2026	Hoja2	31	["MS24218","BANCO INTERNACIONAL","Gestión Capacitación"]	C:\\Users\\gcons\\Downloads\\20. Proyecciones Plataformas 14.05.2026.xlsx	2026-05-18 16:42:45
de4dffa2-4e13-4e4a-adef-bebf6196437e	2026	Hoja2	32	["MS24099","BECO","LMS"]	C:\\Users\\gcons\\Downloads\\20. Proyecciones Plataformas 14.05.2026.xlsx	2026-05-18 16:42:45
6b9547d6-d2ce-40df-9d2b-aad7e26a6870	2026	Hoja2	33	["MS24014","CAROZZI","LMS"]	C:\\Users\\gcons\\Downloads\\20. Proyecciones Plataformas 14.05.2026.xlsx	2026-05-18 16:42:45
fa6321b0-f6e3-4c27-b1be-d86be34e43b6	2026	Hoja2	34	["MS24015","CAROZZI","Gestión Capacitación"]	C:\\Users\\gcons\\Downloads\\20. Proyecciones Plataformas 14.05.2026.xlsx	2026-05-18 16:42:45
95e74b74-dbdd-43a2-8f69-46ab9d9efa6b	2026	Hoja2	35	["MS25006","COPEC","Desempeño"]	C:\\Users\\gcons\\Downloads\\20. Proyecciones Plataformas 14.05.2026.xlsx	2026-05-18 16:42:45
086e86ee-df6d-4e3b-a635-4d250987d887	2026	Hoja2	36	["MS25007","COPEC","Talentos"]	C:\\Users\\gcons\\Downloads\\20. Proyecciones Plataformas 14.05.2026.xlsx	2026-05-18 16:42:45
dfe085b0-f276-48b2-8e49-2e0a0ab633d9	2026	Hoja2	37	["MS25015","COPEC","Desempeño"]	C:\\Users\\gcons\\Downloads\\20. Proyecciones Plataformas 14.05.2026.xlsx	2026-05-18 16:42:45
40943e54-be29-40ce-8388-556c2bf3096e	2026	Hoja2	38	["MS23206","ENAEX","LMS"]	C:\\Users\\gcons\\Downloads\\20. Proyecciones Plataformas 14.05.2026.xlsx	2026-05-18 16:42:45
2666ff17-59e8-4dcb-bf5d-f96f7b2b10b9	2026	Hoja2	39	["MS24221","ENAEX","Gestión Capacitación"]	C:\\Users\\gcons\\Downloads\\20. Proyecciones Plataformas 14.05.2026.xlsx	2026-05-18 16:42:45
ccf26a5d-4e0e-49c7-b1c6-5f46cf02380d	2026	Hoja2	40	["MS24222","ENAEX","LMS"]	C:\\Users\\gcons\\Downloads\\20. Proyecciones Plataformas 14.05.2026.xlsx	2026-05-18 16:42:45
4b4724f1-f482-46d3-9619-d97b7a4ce946	2026	Hoja2	41	["MS24223","ENAEX","Reconocimiento"]	C:\\Users\\gcons\\Downloads\\20. Proyecciones Plataformas 14.05.2026.xlsx	2026-05-18 16:42:45
b10b9f7c-64d5-4342-9ffc-09e7a3907cb1	2026	Hoja2	42	["MS24224","ENAEX","LMS"]	C:\\Users\\gcons\\Downloads\\20. Proyecciones Plataformas 14.05.2026.xlsx	2026-05-18 16:42:45
c05db798-8da0-4cf6-9c82-fbac7900015c	2026	Hoja2	43	["MS25012","MAGOTTEAUX","Reconocimiento"]	C:\\Users\\gcons\\Downloads\\20. Proyecciones Plataformas 14.05.2026.xlsx	2026-05-18 16:42:45
3d7b4906-ac3e-40f2-a41d-0e87cb125646	2026	Hoja2	44	["MS25013","MAGOTTEAUX","Reconocimiento"]	C:\\Users\\gcons\\Downloads\\20. Proyecciones Plataformas 14.05.2026.xlsx	2026-05-18 16:42:45
e40061f2-ba38-4506-aa27-d985cec29461	2026	Hoja2	45	["MS25014","MAGOTTEAUX","Reconocimiento"]	C:\\Users\\gcons\\Downloads\\20. Proyecciones Plataformas 14.05.2026.xlsx	2026-05-18 16:42:45
4af911e5-f0e1-46fb-8ef8-c17b677d27c8	2026	Hoja2	46	["MS21050","MAS","LMS"]	C:\\Users\\gcons\\Downloads\\20. Proyecciones Plataformas 14.05.2026.xlsx	2026-05-18 16:42:45
e16a7ff7-adb9-482a-bce2-e0a03313ea06	2026	Hoja2	47	["MS21000","RESITER","LMS"]	C:\\Users\\gcons\\Downloads\\20. Proyecciones Plataformas 14.05.2026.xlsx	2026-05-18 16:42:45
0af42896-ff4b-480a-afa1-76a75b5e1035	2026	Hoja2	48	["MS24062","SALFACORP","Clima/Encuestas"]	C:\\Users\\gcons\\Downloads\\20. Proyecciones Plataformas 14.05.2026.xlsx	2026-05-18 16:42:45
063e8907-8909-4e5f-88ce-6b5a4ad7b6e8	2026	Hoja2	49	["MS24033","SALMONES AUSTRAL","Liderazgo"]	C:\\Users\\gcons\\Downloads\\20. Proyecciones Plataformas 14.05.2026.xlsx	2026-05-18 16:42:45
7094ef22-49f4-4b51-b1b1-4dcadc49406e	2026	Hoja2	50	["MS24236","SIGDO KOPPERS","LMS"]	C:\\Users\\gcons\\Downloads\\20. Proyecciones Plataformas 14.05.2026.xlsx	2026-05-18 16:42:45
487cb3a9-f6f8-45fe-a6ba-00eb4a516a55	2026	Hoja2	51	["MS25017","SOPROLE","Desempeño"]	C:\\Users\\gcons\\Downloads\\20. Proyecciones Plataformas 14.05.2026.xlsx	2026-05-18 16:42:45
e9025bc0-6f8c-4847-8b8d-4fd0a65daaa8	2026	Hoja2	52	["MS25008","SOPROLE","Desempeño"]	C:\\Users\\gcons\\Downloads\\20. Proyecciones Plataformas 14.05.2026.xlsx	2026-05-18 16:42:45
602f2af5-a9ab-4da6-99c2-49646b80df0c	2026	Hoja2	53	["MS25009","SOPROLE","Desempeño"]	C:\\Users\\gcons\\Downloads\\20. Proyecciones Plataformas 14.05.2026.xlsx	2026-05-18 16:42:45
cf4ba10b-db5b-4342-b544-9581142af00f	2026	Hoja2	54	["MS25010","SOPROLE","Talentos"]	C:\\Users\\gcons\\Downloads\\20. Proyecciones Plataformas 14.05.2026.xlsx	2026-05-18 16:42:45
3288ecac-ac75-4fa4-b46c-f64c46ecedd6	2026	Hoja2	55	["MS23200","TRANSELEC","LMS"]	C:\\Users\\gcons\\Downloads\\20. Proyecciones Plataformas 14.05.2026.xlsx	2026-05-18 16:42:45
597ed520-cf0d-4430-889e-213dc41d02d3	2026	Hoja1	1	["Proyecciones Vale","85202994.126","24091395.444","75868641.51680002","13026365.765999999"]	C:\\Users\\gcons\\Downloads\\22. Proyecciones Plataformas 28.05.2026.xlsx	2026-06-02 15:27:56
4d8aec3a-ac98-4c19-8c29-10981994ba69	2026	Hoja1	2	["Proyecciones Maca","85203038.544","24091395","75868642","13026365"]	C:\\Users\\gcons\\Downloads\\22. Proyecciones Plataformas 28.05.2026.xlsx	2026-06-02 15:27:56
f4814957-b65b-438e-b1a0-24fd2ca08797	2026	Hoja1	3	["Diferencia","44.41799999773502","-0.4439999982714653","0.48319998383522034","-0.7659999988973141"]	C:\\Users\\gcons\\Downloads\\22. Proyecciones Plataformas 28.05.2026.xlsx	2026-06-02 15:27:56
2bf6ff1c-c862-4020-90c3-4b306cb18c42	2026	Hoja2	1	["CP","CLIENTE","PRODUCTO"]	C:\\Users\\gcons\\Downloads\\22. Proyecciones Plataformas 28.05.2026.xlsx	2026-06-02 15:27:56
07b55b0b-8dea-44fb-a61b-89689553dfe7	2026	Hoja2	2	["MS24191","AFP HABITAT","Desempeño"]	C:\\Users\\gcons\\Downloads\\22. Proyecciones Plataformas 28.05.2026.xlsx	2026-06-02 15:27:56
db9050b8-9bd6-426c-9c54-90f255d2e463	2026	Hoja2	3	["MS24206","AFP HABITAT","Desempeño"]	C:\\Users\\gcons\\Downloads\\22. Proyecciones Plataformas 28.05.2026.xlsx	2026-06-02 15:27:56
b1e22951-bd88-4058-ada2-91bbf60b0171	2026	Hoja2	4	["MS24207","AFP HABITAT","Reconocimiento"]	C:\\Users\\gcons\\Downloads\\22. Proyecciones Plataformas 28.05.2026.xlsx	2026-06-02 15:27:56
441e6d85-857f-464f-922d-34d2929aa209	2026	Hoja2	5	["MS24208","AFP HABITAT","Clima/Encuestas"]	C:\\Users\\gcons\\Downloads\\22. Proyecciones Plataformas 28.05.2026.xlsx	2026-06-02 15:27:56
b32bff5a-d52e-4aab-b47b-6351bf7b1d1c	2026	Hoja2	6	["MS24209","AFP HABITAT","Desempeño"]	C:\\Users\\gcons\\Downloads\\22. Proyecciones Plataformas 28.05.2026.xlsx	2026-06-02 15:27:56
92374a56-d4d5-4255-93a9-9aba60e7499f	2026	Hoja2	7	["MS24210","AFP HABITAT","Gestión Capacitación"]	C:\\Users\\gcons\\Downloads\\22. Proyecciones Plataformas 28.05.2026.xlsx	2026-06-02 15:27:56
4ae48017-a448-486f-a75d-bbadd9ef1361	2026	Hoja2	8	["MS24211","AFP HABITAT","LMS"]	C:\\Users\\gcons\\Downloads\\22. Proyecciones Plataformas 28.05.2026.xlsx	2026-06-02 15:27:56
0b1379a4-34ca-4db2-81ec-923c3662babc	2026	Hoja2	9	["MS24212","AFP HABITAT","Talentos"]	C:\\Users\\gcons\\Downloads\\22. Proyecciones Plataformas 28.05.2026.xlsx	2026-06-02 15:27:56
2475b91a-7949-4413-bed5-9de9b1600ffe	2026	Hoja2	10	["MS24213","AFP HABITAT","LMS"]	C:\\Users\\gcons\\Downloads\\22. Proyecciones Plataformas 28.05.2026.xlsx	2026-06-02 15:27:56
0dd20c40-0110-46db-a17a-195486679673	2026	Hoja2	11	["MS24225","AFP HABITAT","LMS"]	C:\\Users\\gcons\\Downloads\\22. Proyecciones Plataformas 28.05.2026.xlsx	2026-06-02 15:27:56
26093b3a-78c8-472c-b7af-a508833f3d24	2026	Hoja2	12	["MS24056","Arcor","Talentos"]	C:\\Users\\gcons\\Downloads\\22. Proyecciones Plataformas 28.05.2026.xlsx	2026-06-02 15:27:56
99bcfc36-52cf-4173-b4b4-476f1c903631	2026	Hoja2	13	["MS24057","Arcor","Talentos"]	C:\\Users\\gcons\\Downloads\\22. Proyecciones Plataformas 28.05.2026.xlsx	2026-06-02 15:27:56
05a05f2f-2f40-412c-b52d-ecfc4a94f4fa	2026	Hoja2	14	["MS23157","Ariztía","Reconocimiento"]	C:\\Users\\gcons\\Downloads\\22. Proyecciones Plataformas 28.05.2026.xlsx	2026-06-02 15:27:56
543942f6-f7e5-4c21-b789-7cdacf15be68	2026	Hoja2	15	["MS24232","Ariztía","Gestión Capacitación"]	C:\\Users\\gcons\\Downloads\\22. Proyecciones Plataformas 28.05.2026.xlsx	2026-06-02 15:27:56
1d2b6c61-7295-4782-b281-9dd2c4819ec5	2026	Hoja2	16	["MS24233","Ariztía","Clima/Encuestas"]	C:\\Users\\gcons\\Downloads\\22. Proyecciones Plataformas 28.05.2026.xlsx	2026-06-02 15:27:56
483379e2-1cd8-4fb6-99b8-0d6192da0d85	2026	Hoja2	17	["MS24234","Ariztía","Reconocimiento"]	C:\\Users\\gcons\\Downloads\\22. Proyecciones Plataformas 28.05.2026.xlsx	2026-06-02 15:27:56
254ae64c-1a12-41f9-b0f7-9fc694348e74	2026	Hoja2	18	["MS25016","AVLA","Desempeño"]	C:\\Users\\gcons\\Downloads\\22. Proyecciones Plataformas 28.05.2026.xlsx	2026-06-02 15:27:56
d9bdf944-37ab-46a3-8b88-a374c222084d	2026	Hoja2	19	["MS25003","AZA","Gestión Capacitación"]	C:\\Users\\gcons\\Downloads\\22. Proyecciones Plataformas 28.05.2026.xlsx	2026-06-02 15:27:56
a9fb512a-cfde-4138-970f-fd5bb0b540b2	2026	Hoja2	20	["MS25002","AZA","LMS"]	C:\\Users\\gcons\\Downloads\\22. Proyecciones Plataformas 28.05.2026.xlsx	2026-06-02 15:27:56
b8f99271-b118-48b8-bb40-74112b5f9a93	2026	Hoja2	21	["MS25004","AZA","LMS"]	C:\\Users\\gcons\\Downloads\\22. Proyecciones Plataformas 28.05.2026.xlsx	2026-06-02 15:27:56
87749dc5-e30c-4df0-8e9a-ef52f8370eed	2026	Hoja2	22	["MS24197","BANCO ESTADO EXPRESS","LMS"]	C:\\Users\\gcons\\Downloads\\22. Proyecciones Plataformas 28.05.2026.xlsx	2026-06-02 15:27:56
01b246aa-a7ba-401c-8b0a-925cf0451904	2026	Hoja2	23	["MS24198","BANCO ESTADO EXPRESS","LMS"]	C:\\Users\\gcons\\Downloads\\22. Proyecciones Plataformas 28.05.2026.xlsx	2026-06-02 15:27:56
1ab82970-562c-4b2c-a20f-2e7fb8c2ef13	2026	Hoja2	24	["MS24199","BANCO ESTADO EXPRESS","Gestión Capacitación"]	C:\\Users\\gcons\\Downloads\\22. Proyecciones Plataformas 28.05.2026.xlsx	2026-06-02 15:27:56
54f0d59e-0fd5-4827-a4e4-b1237102dd19	2026	Hoja2	25	["MS24200","BANCO ESTADO EXPRESS","Desempeño"]	C:\\Users\\gcons\\Downloads\\22. Proyecciones Plataformas 28.05.2026.xlsx	2026-06-02 15:27:56
61a0e106-b23f-4991-9ba5-24bcf69a3034	2026	Hoja2	26	["MS24201","BANCO ESTADO EXPRESS","Liderazgo"]	C:\\Users\\gcons\\Downloads\\22. Proyecciones Plataformas 28.05.2026.xlsx	2026-06-02 15:27:56
252ccd73-3010-43ce-8958-b884d5233778	2026	Hoja2	27	["MS24202","BANCO ESTADO EXPRESS","Clima/Encuestas"]	C:\\Users\\gcons\\Downloads\\22. Proyecciones Plataformas 28.05.2026.xlsx	2026-06-02 15:27:56
9dc18df4-deb3-4b9c-a2e9-923a07eac719	2026	Hoja2	28	["MS24203","BANCO ESTADO EXPRESS","Reconocimiento"]	C:\\Users\\gcons\\Downloads\\22. Proyecciones Plataformas 28.05.2026.xlsx	2026-06-02 15:27:56
6b082321-79a2-4398-bada-e996fba1aef1	2026	Hoja2	29	["MS24205","BANCO ESTADO EXPRESS","Talentos"]	C:\\Users\\gcons\\Downloads\\22. Proyecciones Plataformas 28.05.2026.xlsx	2026-06-02 15:27:56
22b3b3c4-e8db-43f6-9e4b-7feb2c2de0ec	2026	Hoja2	30	["MS24217","BANCO INTERNACIONAL","LMS"]	C:\\Users\\gcons\\Downloads\\22. Proyecciones Plataformas 28.05.2026.xlsx	2026-06-02 15:27:56
fbe556a9-66c2-4330-ae0a-a96c78caeee1	2026	Hoja2	31	["MS24218","BANCO INTERNACIONAL","Gestión Capacitación"]	C:\\Users\\gcons\\Downloads\\22. Proyecciones Plataformas 28.05.2026.xlsx	2026-06-02 15:27:56
5452ed8a-8065-41fd-9cdd-f83165d8f22d	2026	Hoja2	32	["MS24099","BECO","LMS"]	C:\\Users\\gcons\\Downloads\\22. Proyecciones Plataformas 28.05.2026.xlsx	2026-06-02 15:27:56
1878ad5c-8a46-4043-83e7-352787318f9a	2026	Hoja2	33	["MS24014","CAROZZI","LMS"]	C:\\Users\\gcons\\Downloads\\22. Proyecciones Plataformas 28.05.2026.xlsx	2026-06-02 15:27:56
48fd1fbf-fb80-46c3-8f95-a09bd08adcc9	2026	Hoja2	34	["MS24015","CAROZZI","Gestión Capacitación"]	C:\\Users\\gcons\\Downloads\\22. Proyecciones Plataformas 28.05.2026.xlsx	2026-06-02 15:27:56
0907bb64-6fc3-472d-aeea-dd7d48ce9ea1	2026	Hoja2	35	["MS25006","COPEC","Desempeño"]	C:\\Users\\gcons\\Downloads\\22. Proyecciones Plataformas 28.05.2026.xlsx	2026-06-02 15:27:56
44c82e0c-ae8a-4213-be11-01487451406e	2026	Hoja2	36	["MS25007","COPEC","Talentos"]	C:\\Users\\gcons\\Downloads\\22. Proyecciones Plataformas 28.05.2026.xlsx	2026-06-02 15:27:56
b36f6a67-1e0c-4963-80e7-0b1ededeaa37	2026	Hoja2	37	["MS25015","COPEC","Desempeño"]	C:\\Users\\gcons\\Downloads\\22. Proyecciones Plataformas 28.05.2026.xlsx	2026-06-02 15:27:56
77156fb6-5d63-4f24-a136-a492828f81be	2026	Hoja2	38	["MS23206","ENAEX","LMS"]	C:\\Users\\gcons\\Downloads\\22. Proyecciones Plataformas 28.05.2026.xlsx	2026-06-02 15:27:56
d29ab36d-e8f1-4b8d-a2cd-1c543acecd3d	2026	Hoja2	39	["MS24221","ENAEX","Gestión Capacitación"]	C:\\Users\\gcons\\Downloads\\22. Proyecciones Plataformas 28.05.2026.xlsx	2026-06-02 15:27:56
3e000e07-aa46-4dfe-bb7a-14029aac47c6	2026	Hoja2	40	["MS24222","ENAEX","LMS"]	C:\\Users\\gcons\\Downloads\\22. Proyecciones Plataformas 28.05.2026.xlsx	2026-06-02 15:27:56
bffc99ae-8e0f-425a-a4d3-5de1f06e53ae	2026	Hoja2	41	["MS24223","ENAEX","Reconocimiento"]	C:\\Users\\gcons\\Downloads\\22. Proyecciones Plataformas 28.05.2026.xlsx	2026-06-02 15:27:56
8f68b95c-6b8d-4bb7-baa8-772489892d10	2026	Hoja2	42	["MS24224","ENAEX","LMS"]	C:\\Users\\gcons\\Downloads\\22. Proyecciones Plataformas 28.05.2026.xlsx	2026-06-02 15:27:56
97fc99d5-e6ea-4ae9-a3ae-07d0c3ae73e1	2026	Hoja2	43	["MS25012","MAGOTTEAUX","Reconocimiento"]	C:\\Users\\gcons\\Downloads\\22. Proyecciones Plataformas 28.05.2026.xlsx	2026-06-02 15:27:56
2350f7d1-589f-4fc9-a862-518b492631a3	2026	Hoja2	44	["MS25013","MAGOTTEAUX","Reconocimiento"]	C:\\Users\\gcons\\Downloads\\22. Proyecciones Plataformas 28.05.2026.xlsx	2026-06-02 15:27:56
f396b609-8e28-4e1d-9110-a819be4fc2ea	2026	Hoja2	45	["MS25014","MAGOTTEAUX","Reconocimiento"]	C:\\Users\\gcons\\Downloads\\22. Proyecciones Plataformas 28.05.2026.xlsx	2026-06-02 15:27:56
5f4a298c-e43b-4767-b89e-d8c13283ab65	2026	Hoja2	46	["MS21050","MAS","LMS"]	C:\\Users\\gcons\\Downloads\\22. Proyecciones Plataformas 28.05.2026.xlsx	2026-06-02 15:27:56
14392f5f-2ced-4499-86b0-515e780ab278	2026	Hoja2	47	["MS21000","RESITER","LMS"]	C:\\Users\\gcons\\Downloads\\22. Proyecciones Plataformas 28.05.2026.xlsx	2026-06-02 15:27:56
2d1241e0-7b22-44d6-b475-aec4984a5e00	2026	Hoja2	48	["MS24062","SALFACORP","Clima/Encuestas"]	C:\\Users\\gcons\\Downloads\\22. Proyecciones Plataformas 28.05.2026.xlsx	2026-06-02 15:27:56
e5e38381-681f-4ac1-949e-ae6527aba72e	2026	Hoja2	49	["MS24033","SALMONES AUSTRAL","Liderazgo"]	C:\\Users\\gcons\\Downloads\\22. Proyecciones Plataformas 28.05.2026.xlsx	2026-06-02 15:27:56
58c5d056-89b5-4a3a-a2fc-3ac8ba5241aa	2026	Hoja2	50	["MS24236","SIGDO KOPPERS","LMS"]	C:\\Users\\gcons\\Downloads\\22. Proyecciones Plataformas 28.05.2026.xlsx	2026-06-02 15:27:56
20209753-ec67-424c-a744-feaeba616b2c	2026	Hoja2	51	["MS25017","SOPROLE","Desempeño"]	C:\\Users\\gcons\\Downloads\\22. Proyecciones Plataformas 28.05.2026.xlsx	2026-06-02 15:27:56
481ec3ac-780a-4e84-8321-4f845526edee	2026	Hoja2	52	["MS25008","SOPROLE","Desempeño"]	C:\\Users\\gcons\\Downloads\\22. Proyecciones Plataformas 28.05.2026.xlsx	2026-06-02 15:27:56
b2fd3b87-6b66-4694-ab6d-ebeedf564393	2026	Hoja2	53	["MS25009","SOPROLE","Desempeño"]	C:\\Users\\gcons\\Downloads\\22. Proyecciones Plataformas 28.05.2026.xlsx	2026-06-02 15:27:56
e6d59946-0148-4c90-8b9a-bd2fc5be0b61	2026	Hoja2	54	["MS25010","SOPROLE","Talentos"]	C:\\Users\\gcons\\Downloads\\22. Proyecciones Plataformas 28.05.2026.xlsx	2026-06-02 15:27:56
29d636ca-da94-49c8-897a-77030b7e2830	2026	Hoja2	55	["MS23200","TRANSELEC","LMS"]	C:\\Users\\gcons\\Downloads\\22. Proyecciones Plataformas 28.05.2026.xlsx	2026-06-02 15:27:56
c286ecc1-ef79-4fda-b9ca-fbef395a7288	2026	Hoja1	1	["Proyecciones Vale","85202994.126","24091395.444","75868641.51680002","13026365.765999999"]	22. Proyecciones Plataformas 28.05.2026.xlsx	2026-06-02 16:16:04
44cf8c67-9579-459a-9973-fde7066c1904	2026	Hoja1	2	["Proyecciones Maca","85203038.544","24091395","75868642","13026365"]	22. Proyecciones Plataformas 28.05.2026.xlsx	2026-06-02 16:16:04
a43731e0-81f6-4e83-82ea-5de0dc1d777c	2026	Hoja1	3	["Diferencia","44.41799999773502","-0.4439999982714653","0.48319998383522034","-0.7659999988973141"]	22. Proyecciones Plataformas 28.05.2026.xlsx	2026-06-02 16:16:04
b59b98bc-45e3-4c43-9741-2718f9dad272	2026	Hoja2	1	["CP","CLIENTE","PRODUCTO"]	22. Proyecciones Plataformas 28.05.2026.xlsx	2026-06-02 16:16:04
48d8b18e-1d9b-402d-a7ff-ba898df4bb73	2026	Hoja2	2	["MS24191","AFP HABITAT","Desempeño"]	22. Proyecciones Plataformas 28.05.2026.xlsx	2026-06-02 16:16:04
4c938aed-ab97-4726-80cf-08f2bd0aa960	2026	Hoja2	3	["MS24206","AFP HABITAT","Desempeño"]	22. Proyecciones Plataformas 28.05.2026.xlsx	2026-06-02 16:16:04
1de45682-c989-43db-a128-73060c1377e8	2026	Hoja2	4	["MS24207","AFP HABITAT","Reconocimiento"]	22. Proyecciones Plataformas 28.05.2026.xlsx	2026-06-02 16:16:04
c837a901-4e0d-4b7f-881f-81f94a8cd889	2026	Hoja2	5	["MS24208","AFP HABITAT","Clima/Encuestas"]	22. Proyecciones Plataformas 28.05.2026.xlsx	2026-06-02 16:16:04
2ad95856-91fd-4b1b-a592-1354c33b6efa	2026	Hoja2	6	["MS24209","AFP HABITAT","Desempeño"]	22. Proyecciones Plataformas 28.05.2026.xlsx	2026-06-02 16:16:04
c74ae341-6a88-478f-9213-7fc565a181d1	2026	Hoja2	7	["MS24210","AFP HABITAT","Gestión Capacitación"]	22. Proyecciones Plataformas 28.05.2026.xlsx	2026-06-02 16:16:04
b61177b6-be2a-43f2-acda-b0c735af09b2	2026	Hoja2	8	["MS24211","AFP HABITAT","LMS"]	22. Proyecciones Plataformas 28.05.2026.xlsx	2026-06-02 16:16:04
894c5e06-4a18-40c1-9992-1115b82fe57b	2026	Hoja2	9	["MS24212","AFP HABITAT","Talentos"]	22. Proyecciones Plataformas 28.05.2026.xlsx	2026-06-02 16:16:04
0ed9ecf3-0600-40cc-9b6b-bda235135595	2026	Hoja2	10	["MS24213","AFP HABITAT","LMS"]	22. Proyecciones Plataformas 28.05.2026.xlsx	2026-06-02 16:16:04
eeda5df1-eeed-41ef-a21e-4cd53217c8e7	2026	Hoja2	11	["MS24225","AFP HABITAT","LMS"]	22. Proyecciones Plataformas 28.05.2026.xlsx	2026-06-02 16:16:04
92b9f365-bf33-41b7-b289-4940e207a077	2026	Hoja2	12	["MS24056","Arcor","Talentos"]	22. Proyecciones Plataformas 28.05.2026.xlsx	2026-06-02 16:16:04
c8ad5ed4-fd54-41e0-afea-c89edbef1c53	2026	Hoja2	13	["MS24057","Arcor","Talentos"]	22. Proyecciones Plataformas 28.05.2026.xlsx	2026-06-02 16:16:04
7e6b4b5b-ef0b-461c-a4f0-ea9130db7385	2026	Hoja2	14	["MS23157","Ariztía","Reconocimiento"]	22. Proyecciones Plataformas 28.05.2026.xlsx	2026-06-02 16:16:04
5136cc2d-ea60-453b-b529-002f4d396088	2026	Hoja2	15	["MS24232","Ariztía","Gestión Capacitación"]	22. Proyecciones Plataformas 28.05.2026.xlsx	2026-06-02 16:16:04
d559b098-fc97-4381-ae5a-0bed788650cd	2026	Hoja2	16	["MS24233","Ariztía","Clima/Encuestas"]	22. Proyecciones Plataformas 28.05.2026.xlsx	2026-06-02 16:16:04
e6ecaae2-6441-49ec-812f-0570019bbee3	2026	Hoja2	17	["MS24234","Ariztía","Reconocimiento"]	22. Proyecciones Plataformas 28.05.2026.xlsx	2026-06-02 16:16:04
f58e8e86-a53b-4883-b2ed-a3cc28410a70	2026	Hoja2	18	["MS25016","AVLA","Desempeño"]	22. Proyecciones Plataformas 28.05.2026.xlsx	2026-06-02 16:16:04
b774cf99-5460-4fb8-91fc-c86fe2547d71	2026	Hoja2	19	["MS25003","AZA","Gestión Capacitación"]	22. Proyecciones Plataformas 28.05.2026.xlsx	2026-06-02 16:16:04
a4ba2d5c-37d2-4ce3-868a-f288b728144f	2026	Hoja2	20	["MS25002","AZA","LMS"]	22. Proyecciones Plataformas 28.05.2026.xlsx	2026-06-02 16:16:04
02d8c6c0-7252-4404-a93c-cbcd1f9881a6	2026	Hoja2	21	["MS25004","AZA","LMS"]	22. Proyecciones Plataformas 28.05.2026.xlsx	2026-06-02 16:16:04
6d8dce35-f41e-4cc7-8b82-f315e7d4ebf2	2026	Hoja2	22	["MS24197","BANCO ESTADO EXPRESS","LMS"]	22. Proyecciones Plataformas 28.05.2026.xlsx	2026-06-02 16:16:04
d65dc0a2-d992-4f50-8a9c-7812e796a488	2026	Hoja2	23	["MS24198","BANCO ESTADO EXPRESS","LMS"]	22. Proyecciones Plataformas 28.05.2026.xlsx	2026-06-02 16:16:04
18cddcfc-a31b-4ce0-b6d7-47fb95452279	2026	Hoja2	24	["MS24199","BANCO ESTADO EXPRESS","Gestión Capacitación"]	22. Proyecciones Plataformas 28.05.2026.xlsx	2026-06-02 16:16:04
225ffed5-230f-4ebd-b87b-ff83df79a00a	2026	Hoja2	25	["MS24200","BANCO ESTADO EXPRESS","Desempeño"]	22. Proyecciones Plataformas 28.05.2026.xlsx	2026-06-02 16:16:04
38e550d3-105c-466f-b75d-eceef0be8b5b	2026	Hoja2	26	["MS24201","BANCO ESTADO EXPRESS","Liderazgo"]	22. Proyecciones Plataformas 28.05.2026.xlsx	2026-06-02 16:16:04
142b2bee-0135-4d2b-92d6-f247f2dcc315	2026	Hoja2	27	["MS24202","BANCO ESTADO EXPRESS","Clima/Encuestas"]	22. Proyecciones Plataformas 28.05.2026.xlsx	2026-06-02 16:16:04
6da4991b-92f4-42d2-badd-f143e6b64e39	2026	Hoja2	28	["MS24203","BANCO ESTADO EXPRESS","Reconocimiento"]	22. Proyecciones Plataformas 28.05.2026.xlsx	2026-06-02 16:16:04
e4b39165-1426-4339-a52c-20093d161ea4	2026	Hoja2	29	["MS24205","BANCO ESTADO EXPRESS","Talentos"]	22. Proyecciones Plataformas 28.05.2026.xlsx	2026-06-02 16:16:04
7603a632-4136-4cbc-8546-7591b18c46bc	2026	Hoja2	30	["MS24217","BANCO INTERNACIONAL","LMS"]	22. Proyecciones Plataformas 28.05.2026.xlsx	2026-06-02 16:16:04
a8dc12e9-8993-473a-a4a1-542932b0be07	2026	Hoja2	31	["MS24218","BANCO INTERNACIONAL","Gestión Capacitación"]	22. Proyecciones Plataformas 28.05.2026.xlsx	2026-06-02 16:16:04
913bb36f-ab24-45ff-b727-cd2a430d2979	2026	Hoja2	32	["MS24099","BECO","LMS"]	22. Proyecciones Plataformas 28.05.2026.xlsx	2026-06-02 16:16:04
bb786d12-3d38-4324-b3dd-e351f8ad1305	2026	Hoja2	33	["MS24014","CAROZZI","LMS"]	22. Proyecciones Plataformas 28.05.2026.xlsx	2026-06-02 16:16:04
e87d4051-e456-4b24-970a-4b8cbf6fe8ae	2026	Hoja2	34	["MS24015","CAROZZI","Gestión Capacitación"]	22. Proyecciones Plataformas 28.05.2026.xlsx	2026-06-02 16:16:04
b84823e6-d28d-4f41-b288-43b002b5192b	2026	Hoja2	35	["MS25006","COPEC","Desempeño"]	22. Proyecciones Plataformas 28.05.2026.xlsx	2026-06-02 16:16:04
b00bdae9-180a-4dd4-999e-53b3a0343d6f	2026	Hoja2	36	["MS25007","COPEC","Talentos"]	22. Proyecciones Plataformas 28.05.2026.xlsx	2026-06-02 16:16:04
f48d8084-e78f-4a79-a544-9d5acd597403	2026	Hoja2	37	["MS25015","COPEC","Desempeño"]	22. Proyecciones Plataformas 28.05.2026.xlsx	2026-06-02 16:16:04
b350649d-7402-491a-95d1-6255b10fc2fe	2026	Hoja2	38	["MS23206","ENAEX","LMS"]	22. Proyecciones Plataformas 28.05.2026.xlsx	2026-06-02 16:16:04
80540a89-152e-4e34-a058-c5b751367b16	2026	Hoja2	39	["MS24221","ENAEX","Gestión Capacitación"]	22. Proyecciones Plataformas 28.05.2026.xlsx	2026-06-02 16:16:04
f7cbfe6a-9e5c-40c4-896b-7a6a3c1abe9a	2026	Hoja2	40	["MS24222","ENAEX","LMS"]	22. Proyecciones Plataformas 28.05.2026.xlsx	2026-06-02 16:16:04
87f6d2d1-e05a-4d73-a631-75ac9e7cc7d1	2026	Hoja2	41	["MS24223","ENAEX","Reconocimiento"]	22. Proyecciones Plataformas 28.05.2026.xlsx	2026-06-02 16:16:04
bc782665-67c9-4c82-a66a-57be1824672e	2026	Hoja2	42	["MS24224","ENAEX","LMS"]	22. Proyecciones Plataformas 28.05.2026.xlsx	2026-06-02 16:16:04
24cc0b8e-1d78-482d-8545-c7b0f55104b8	2026	Hoja2	43	["MS25012","MAGOTTEAUX","Reconocimiento"]	22. Proyecciones Plataformas 28.05.2026.xlsx	2026-06-02 16:16:04
ff8e27c9-8313-458f-b0ce-960e01d886fd	2026	Hoja2	44	["MS25013","MAGOTTEAUX","Reconocimiento"]	22. Proyecciones Plataformas 28.05.2026.xlsx	2026-06-02 16:16:04
3352cfe8-7cd0-4f87-bdc4-b0f9e3898261	2026	Hoja2	45	["MS25014","MAGOTTEAUX","Reconocimiento"]	22. Proyecciones Plataformas 28.05.2026.xlsx	2026-06-02 16:16:04
28fd9d3e-1ed4-4b60-abe6-e0163c5767e3	2026	Hoja2	46	["MS21050","MAS","LMS"]	22. Proyecciones Plataformas 28.05.2026.xlsx	2026-06-02 16:16:04
918048c5-5d3b-4669-822a-8da1206717d5	2026	Hoja2	47	["MS21000","RESITER","LMS"]	22. Proyecciones Plataformas 28.05.2026.xlsx	2026-06-02 16:16:04
f2d760b3-bda1-445a-97ce-8ca6bcaab97b	2026	Hoja2	48	["MS24062","SALFACORP","Clima/Encuestas"]	22. Proyecciones Plataformas 28.05.2026.xlsx	2026-06-02 16:16:04
281ed049-9379-47a4-9510-c4b254058947	2026	Hoja2	49	["MS24033","SALMONES AUSTRAL","Liderazgo"]	22. Proyecciones Plataformas 28.05.2026.xlsx	2026-06-02 16:16:04
1a873b33-1af7-4622-8006-e7185ba7710d	2026	Hoja2	50	["MS24236","SIGDO KOPPERS","LMS"]	22. Proyecciones Plataformas 28.05.2026.xlsx	2026-06-02 16:16:04
a1ff83d5-cea9-4a68-b40b-ae1543d4672d	2026	Hoja2	51	["MS25017","SOPROLE","Desempeño"]	22. Proyecciones Plataformas 28.05.2026.xlsx	2026-06-02 16:16:04
e829cba2-e40c-40f5-9921-e87662c53ee9	2026	Hoja2	52	["MS25008","SOPROLE","Desempeño"]	22. Proyecciones Plataformas 28.05.2026.xlsx	2026-06-02 16:16:04
c27afa5e-fe1e-4751-880f-a6d57b1ade60	2026	Hoja2	53	["MS25009","SOPROLE","Desempeño"]	22. Proyecciones Plataformas 28.05.2026.xlsx	2026-06-02 16:16:04
9bda78e3-0d96-421f-acc3-0f077dabee99	2026	Hoja2	54	["MS25010","SOPROLE","Talentos"]	22. Proyecciones Plataformas 28.05.2026.xlsx	2026-06-02 16:16:04
33a8ba8b-6579-4b36-9ddd-e29f79ebbbf7	2026	Hoja2	55	["MS23200","TRANSELEC","LMS"]	22. Proyecciones Plataformas 28.05.2026.xlsx	2026-06-02 16:16:04
\.


--
-- Data for Name: proyeccion_configuracion; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.proyeccion_configuracion (id, cliente_id, ms, anio, modo_uf, uf_fija_default, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: proyeccion_facturacion; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.proyeccion_facturacion (id, cliente_id, cliente, codigo, nombre, tipo_cp, tipo_impuesto, mes, anio, monto_uf, moneda, estado, observaciones, fecha_estimada_facturacion, codigo_facturacion, source, updated_at) FROM stdin;
\.


--
-- Data for Name: proyeccion_item; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.proyeccion_item (id, version_id, iva, proyecto, ms, cliente_id, cliente, dp, cp, producto, tipo_cp, venta, created_at, updated_at, orden_fila) FROM stdin;
ad864312-a0f5-4f74-8201-876bad927fb4	e7689f11-2943-4249-851e-580d26e1c668	EXENTO_IVA	Paquete de Horas 2025	MS24213	cli_afp_habitat	AFP HABITAT	VG	MA	LMS	Horas de Desarrollo	9.532747e+06	2026-05-20 16:01:46	2026-05-20 16:01:46	1
7c780c8e-1bd4-4983-bfb5-afbdbb5710d7	e7689f11-2943-4249-851e-580d26e1c668	EXENTO_IVA	Plataforma LMS 2026-2027	MS25182	cli_afp_habitat	AFP HABITAT	VG	MA	LMS	Administración y Operación	3.69e+07	2026-05-20 16:01:46	2026-05-20 16:01:46	2
cee7ef13-dfdc-4053-846a-9416534a82a2	e7689f11-2943-4249-851e-580d26e1c668	EXENTO_IVA	Plataforma GC 2026-2027	MS25183	cli_afp_habitat	AFP HABITAT	VG	MA	Gestión Capacitación	Administración y Operación	4.92e+06	2026-05-20 16:01:46	2026-05-20 16:01:46	3
cff1ac1a-28a4-44c2-92ac-e85987155072	e7689f11-2943-4249-851e-580d26e1c668	AFECTO_IVA	Plataforma SGD 2026-2027	MS25184	cli_afp_habitat	AFP HABITAT	VG	CG	Desempeño	Administración y Operación	1.7785344e+07	2026-05-20 16:01:46	2026-05-20 16:01:46	4
160cd851-8e9b-481d-acaa-0f584905123a	e7689f11-2943-4249-851e-580d26e1c668	EXENTO_IVA	Plataforma DNC 2026-2027	MS25185	cli_afp_habitat	AFP HABITAT	VG	MA	Desempeño	Administración y Operación	2.87e+06	2026-05-20 16:01:46	2026-05-20 16:01:46	5
9717107a-a93a-41b5-b234-0c5f929a5750	e7689f11-2943-4249-851e-580d26e1c668	EXENTO_IVA	Plataforma Reconocimiento 2026-2027	MS25186	cli_afp_habitat	AFP HABITAT	VG	CG	Reconocimiento	Administración y Operación	7.569268e+06	2026-05-20 16:01:46	2026-05-20 16:01:46	6
a76490ef-3b9c-4270-8610-d33f3bf94420	e7689f11-2943-4249-851e-580d26e1c668	EXENTO_IVA	Plataforma Clima 2026-2027	MS25187	cli_afp_habitat	AFP HABITAT	VG	CG	Clima/Encuestas	Administración y Operación	9.02e+06	2026-05-20 16:01:46	2026-05-20 16:01:46	7
df7a797c-5348-468d-8391-b250df385e83	e7689f11-2943-4249-851e-580d26e1c668	EXENTO_IVA	Plataforma Talento 2026-2027	MS25188	cli_afp_habitat	AFP HABITAT	VG	CG	Talentos	Administración y Operación	6.97e+06	2026-05-20 16:01:46	2026-05-20 16:01:46	8
8e2e3294-0c87-4f27-9457-97d8d5e4ce25	e7689f11-2943-4249-851e-580d26e1c668	EXENTO_IVA	Planes de Desarrollo 2026	MS26077	cli_afp_habitat	AFP HABITAT	VG	CG	Desempeño	Construcción	4.92e+06	2026-05-20 16:01:46	2026-05-20 16:01:46	9
1fda0fe7-3db6-4e9f-9057-f43ed66ac89e	e7689f11-2943-4249-851e-580d26e1c668	EXENTO_IVA	Plataforma GC 2025-2027	MS25135	cli_andritz	ANDRITZ	VG	DL	Gestión Capacitación	Administración y Operación	1.3780206e+07	2026-05-20 16:01:46	2026-05-20 16:01:46	10
0579e28f-b5f8-46a3-a86d-de76f28f0f09	e7689f11-2943-4249-851e-580d26e1c668	AFECTO_IVA	Plataforma de Potencial y Ninebox	MS25078	cli_arcor	ARCOR	VG	MDR	Talentos	Administración y Operación	1.04e+07	2026-05-20 16:01:46	2026-05-20 16:01:46	11
03e50f70-ef8a-4354-9122-5e075c5a6fd9	e7689f11-2943-4249-851e-580d26e1c668	EXENTO_IVA	Planes de Acción 2025	MS24233	cli_aristia	ARIZTÍA	VG	MDR	Clima/Encuestas	Administración y Operación	4.23913e+06	2026-05-20 16:01:46	2026-05-20 16:01:46	12
23488cf2-a5b7-4984-a8f3-dfba0e0c65d6	e7689f11-2943-4249-851e-580d26e1c668	EXENTO_IVA	Gestión de Capacitación 2026	MS26008	cli_aristia	ARIZTÍA	VG	MDR	Gestión Capacitación	Administración y Operación	1.04e+07	2026-05-20 16:01:46	2026-05-20 16:01:46	13
0e81bbe9-ec94-419e-852d-2c3a45e7807e	e7689f11-2943-4249-851e-580d26e1c668	EXENTO_IVA	Reconocimiento 2026	MS26009	cli_aristia	ARIZTÍA	VG	MDR	Reconocimiento	Administración y Operación	1.21941e+07	2026-05-20 16:01:46	2026-05-20 16:01:46	14
ccdb6ab1-f7ba-4c32-9808-b40096dc7713	e7689f11-2943-4249-851e-580d26e1c668	EXENTO_IVA	Paquete Horas TI 2026	MS26010	cli_aristia	ARIZTÍA	VG	MDR	Reconocimiento	Horas de Desarrollo	1.985e+06	2026-05-20 16:01:46	2026-05-20 16:01:46	15
b548fb52-48f6-4288-81e9-6624603f9c03	e7689f11-2943-4249-851e-580d26e1c668	AFECTO_IVA	Plataforma Desempeño 2025	MS25016	cli_avla	AVLA	VG	MDR	Desempeño	Administración y Operación	4.772171e+06	2026-05-20 16:01:46	2026-05-20 16:01:46	16
82df8a7c-6b5b-405f-9ecc-86a393b6c33a	e7689f11-2943-4249-851e-580d26e1c668	EXENTO_IVA	Plataforma LMS 2025	MS25002	cli_aza	AZA	VG	DL	LMS	Administración y Operación	1.6492572e+07	2026-05-20 16:01:46	2026-05-20 16:01:46	17
3b21d650-233f-47aa-9367-1bb89f3513ce	e7689f11-2943-4249-851e-580d26e1c668	EXENTO_IVA	Plataforma GC 2025	MS25003	cli_aza	AZA	VG	DL	Gestión Capacitación	Administración y Operación	1.44e+07	2026-05-20 16:01:46	2026-05-20 16:01:46	18
67150288-c28f-445c-870f-eb7a3c4f166c	e7689f11-2943-4249-851e-580d26e1c668	EXENTO_IVA	Plataforma LMS 2025	MS24197	cli_bex	BANCO ESTADO EXPRESS	VG	DL	LMS	Administración y Operación	3.8256e+07	2026-05-20 16:01:46	2026-05-20 16:01:46	19
480619b3-c78c-4bdb-b36f-abed605a80aa	e7689f11-2943-4249-851e-580d26e1c668	EXENTO_IVA	Mantención Chatbot 2025	MS24198	cli_bex	BANCO ESTADO EXPRESS	VG	DL	LMS	Administración y Operación	1.9925e+06	2026-05-20 16:01:46	2026-05-20 16:01:46	20
e69a6d4d-985a-436a-9f0f-dc2f72ddddf5	e7689f11-2943-4249-851e-580d26e1c668	EXENTO_IVA	Plataforma GC 2025	MS24199	cli_bex	BANCO ESTADO EXPRESS	VG	DL	Gestión Capacitación	Administración y Operación	4.782e+06	2026-05-20 16:01:46	2026-05-20 16:01:46	21
787abf99-71f3-4d7a-ac55-fa4ae49ce5ce	e7689f11-2943-4249-851e-580d26e1c668	AFECTO_IVA	Plataforma Desempeño 2025	MS24200	cli_bex	BANCO ESTADO EXPRESS	VG	DL	Desempeño	Administración y Operación	2.4208876e+07	2026-05-20 16:01:46	2026-05-20 16:01:46	22
232390df-c04a-4b92-8f0b-5481ca4aabb2	e7689f11-2943-4249-851e-580d26e1c668	EXENTO_IVA	Plataforma Clima y Planes 2025	MS24202	cli_bex	BANCO ESTADO EXPRESS	VG	DL	Clima/Encuestas	Administración y Operación	1.6737e+07	2026-05-20 16:01:46	2026-05-20 16:01:46	23
33ac5e83-20b4-4847-90ad-d6cae1d89c36	e7689f11-2943-4249-851e-580d26e1c668	AFECTO_IVA	Plataforma Reconocimiento 2025	MS24203	cli_bex	BANCO ESTADO EXPRESS	VG	DL	Reconocimiento	Administración y Operación	1.05204e+07	2026-05-20 16:01:46	2026-05-20 16:01:46	24
f807ebd0-085d-4292-bdc6-d9af68272971	e7689f11-2943-4249-851e-580d26e1c668	EXENTO_IVA	Plataforma Talento 2025	MS24205	cli_bex	BANCO ESTADO EXPRESS	VG	DL	Talentos	Administración y Operación	7.173e+06	2026-05-20 16:01:46	2026-05-20 16:01:46	25
2969cccb-d399-4fe9-a355-fc1eacf2614c	e7689f11-2943-4249-851e-580d26e1c668	EXENTO_IVA	Platas Sin Asignar	MS24049	cli_banco_internacional	BANCO INTERNACIONAL	VG	DL			\N	2026-05-20 16:01:46	2026-05-20 16:01:46	26
8477af52-ad41-480f-8b82-d96942924402	e7689f11-2943-4249-851e-580d26e1c668	EXENTO_IVA	Plataforma LMS 2026	MS25159	cli_banco_internacional	BANCO INTERNACIONAL	VG	DL	LMS	Administración y Operación	8.2811725e+06	2026-05-20 16:01:46	2026-05-20 16:01:46	27
85ae2aed-b0b9-4cc0-aa74-7a0254293823	e7689f11-2943-4249-851e-580d26e1c668	EXENTO_IVA	Plataforma GC 2026	MS25160	cli_banco_internacional	BANCO INTERNACIONAL	VG	DL	Gestión Capacitación	Administración y Operación	9.555199e+06	2026-05-20 16:01:46	2026-05-20 16:01:46	28
699269f4-b66c-4f2e-aa6c-8d0ee2201b78	e7689f11-2943-4249-851e-580d26e1c668	EXENTO_IVA	Plataforma LMS 2024	MS24014	cli_carozzi	CAROZZI	VG	MDR	LMS	Administración y Operación	9.403992e+07	2026-05-20 16:01:46	2026-05-20 16:01:46	29
dcb07693-3f23-4538-bc5d-292648c85cfa	e7689f11-2943-4249-851e-580d26e1c668	EXENTO_IVA	Plataforma GC 2024	MS24015	cli_carozzi	CAROZZI	VG	MDR	Gestión Capacitación	Administración y Operación	1.3060846e+07	2026-05-20 16:01:46	2026-05-20 16:01:46	30
7d5965c3-3c53-4e97-bdea-58b553cd07aa	e7689f11-2943-4249-851e-580d26e1c668	AFECTO_IVA	Taller IA	MS26053	cli_ccu	CCU	VG	DV	LMS	Construcción	2.3905032e+06	2026-05-20 16:01:46	2026-05-20 16:01:46	31
07fa9a2e-7357-4a0d-87e6-c799ba808358	e7689f11-2943-4249-851e-580d26e1c668	AFECTO_IVA	Plataforma Desempeño 2025	MS25006	cli_copec	COPEC	VG	DL	Desempeño	Administración y Operación	2.2188394e+07	2026-05-20 16:01:46	2026-05-20 16:01:46	32
bdc81e93-7795-47a5-93f1-96b013491d82	e7689f11-2943-4249-851e-580d26e1c668	AFECTO_IVA	Plataforma Gestión de Talentos 2025	MS25007	cli_copec	COPEC	VG	DL	Talentos	Administración y Operación	9.91427e+06	2026-05-20 16:01:46	2026-05-20 16:01:46	33
cb947898-0b07-4cfc-8b22-14ada64025da	e7689f11-2943-4249-851e-580d26e1c668	AFECTO_IVA	Plataforma SGD	MS25076	cli_emin	EMIN	VG	MDR	Desempeño	Administración y Operación	2.3296e+07	2026-05-20 16:01:46	2026-05-20 16:01:46	34
5dc4def9-8ed6-4618-bfc4-97870e2bf789	e7689f11-2943-4249-851e-580d26e1c668	MIXTO	Plataforma LMS 2026	MS26001	cli_enaex	ENAEX	VG	MA	LMS	Administración y Operación	7.563113e+07	2026-05-20 16:01:46	2026-05-20 16:01:46	35
6fa25f28-74ee-4a6b-910f-b87f4162382f	e7689f11-2943-4249-851e-580d26e1c668	EXENTO_IVA	Plataforma GC 2026	MS26002	cli_enaex	ENAEX	VG	MA	Gestión Capacitación	Administración y Operación	9.48e+06	2026-05-20 16:01:46	2026-05-20 16:01:46	36
b45c5a5f-ec2b-4216-9766-b30c8f6ff7be	e7689f11-2943-4249-851e-580d26e1c668	EXENTO_IVA	Plataforma Reconocimiento 2026	MS26004	cli_enaex	ENAEX	VG	MA	Reconocimiento	Administración y Operación	1.7020638e+07	2026-05-20 16:01:46	2026-05-20 16:01:46	37
1762e828-b530-4715-8372-88175bb7c2ae	e7689f11-2943-4249-851e-580d26e1c668	EXENTO_IVA	Paquete de Horas 2026	MS26005	cli_enaex	ENAEX	VG	MA	LMS	Horas de Desarrollo	4.68e+06	2026-05-20 16:01:46	2026-05-20 16:01:46	38
8dcfec48-a2fd-49de-a6e3-e38078d133a3	e7689f11-2943-4249-851e-580d26e1c668	AFECTO_IVA	Plataforma Reconocimiento 2025	MS25013	cli_magotteaux	MAGOTTEAUX	VG	MDR	Reconocimiento	Administración y Operación	1.107284e+07	2026-05-20 16:01:46	2026-05-20 16:01:46	39
8dd838e9-603f-41b4-acf4-91e5e29c3e15	e7689f11-2943-4249-851e-580d26e1c668	AFECTO_IVA	LMS	MS21000	cli_resiter	RESITER	VG	MDR	LMS	Administración y Operación	214629.58	2026-05-20 16:01:46	2026-05-20 16:01:46	40
e4f68cf8-736c-4b0b-94f5-4860f69ec2af	e7689f11-2943-4249-851e-580d26e1c668	AFECTO_IVA	Plataforma Liderazgo 2026	MS26063	cli_salmones	SALMONES AUSTRAL	VG	MDR	Liderazgo	Administración y Operación	7.7451215e+06	2026-05-20 16:01:46	2026-05-20 16:01:46	41
adc89b8a-77e7-4943-ad7c-7f312a527f5b	e7689f11-2943-4249-851e-580d26e1c668	AFECTO_IVA	Plataforma Desempeño 2025 - Profesionales	MS25008	cli_soprole	SOPROLE	VG	MA	Desempeño	Administración y Operación	1.6732564e+07	2026-05-20 16:01:46	2026-05-20 16:01:46	42
58973a95-3985-45a7-aab1-4f8ad8c4b9d5	e7689f11-2943-4249-851e-580d26e1c668	AFECTO_IVA	Plataforma LMS 2025	MS25027	cli_transelect	TRANSELEC	VG	DL	LMS	Administración y Operación	1.4357458e+07	2026-05-20 16:01:46	2026-05-20 16:01:46	43
13eed094-8b66-4443-bfbe-0a0858928e7d	94e9e93c-60a8-47cd-8126-e0836bd5cfe1	EXENTO_IVA	Plataforma LMS 2026-2027	MS25182	cli_afp_habitat	AFP HABITAT	VG	MA	LMS	Administración y Operación	3.69e+07	2026-06-02 15:27:56	2026-06-02 16:16:04	3
8229ab41-223c-41b2-b4c7-ac775c882ae8	94e9e93c-60a8-47cd-8126-e0836bd5cfe1	EXENTO_IVA	Plataforma GC 2026-2027	MS25183	cli_afp_habitat	AFP HABITAT	VG	MA	Gestión Capacitación	Administración y Operación	4.92e+06	2026-06-02 15:27:56	2026-06-02 16:16:04	4
6e08b1e3-6307-4209-860e-fd3c1c12b765	94e9e93c-60a8-47cd-8126-e0836bd5cfe1	AFECTO_IVA	Plataforma SGD 2026-2027	MS25184	cli_afp_habitat	AFP HABITAT	VG	CG	Desempeño	Administración y Operación	1.7785344e+07	2026-06-02 15:27:56	2026-06-02 16:16:04	5
82f01d2a-e48d-4d25-9065-6942d72bd6ef	94e9e93c-60a8-47cd-8126-e0836bd5cfe1	EXENTO_IVA	Plataforma DNC 2026-2027	MS25185	cli_afp_habitat	AFP HABITAT	VG	MA	Desempeño	Administración y Operación	2.87e+06	2026-06-02 15:27:56	2026-06-02 16:16:04	6
c3df63f8-1b5b-4677-a4aa-881b11729eae	94e9e93c-60a8-47cd-8126-e0836bd5cfe1	EXENTO_IVA	Plataforma Reconocimiento 2026-2027	MS25186	cli_afp_habitat	AFP HABITAT	VG	CG	Reconocimiento	Administración y Operación	7.569268e+06	2026-06-02 15:27:56	2026-06-02 16:16:04	7
4b02d7c5-adcb-4e7e-96e5-f56211fb7d47	94e9e93c-60a8-47cd-8126-e0836bd5cfe1	EXENTO_IVA	Plataforma Clima 2026-2027	MS25187	cli_afp_habitat	AFP HABITAT	VG	CG	Clima/Encuestas	Administración y Operación	9.02e+06	2026-06-02 15:27:56	2026-06-02 16:16:04	8
23bdd370-e4b6-4ca9-b775-114383948be0	94e9e93c-60a8-47cd-8126-e0836bd5cfe1	EXENTO_IVA	Plataforma Talento 2026-2027	MS25188	cli_afp_habitat	AFP HABITAT	VG	CG	Talentos	Administración y Operación	6.97e+06	2026-06-02 15:27:56	2026-06-02 16:16:04	9
8edd6a6c-0dcd-4a77-a799-e12454b93226	94e9e93c-60a8-47cd-8126-e0836bd5cfe1	EXENTO_IVA	Paquete de Horas 2025	MS24213	cli_afp_habitat	AFP HABITAT	VG	MA	LMS	Horas de Desarrollo	9.261108e+06	2026-06-02 15:27:56	2026-06-02 16:16:04	10
11534164-d017-46e0-932d-61d95de679be	94e9e93c-60a8-47cd-8126-e0836bd5cfe1	EXENTO_IVA	Planes de Desarrollo 2026	MS26077	cli_afp_habitat	AFP HABITAT	VG	CG	Desempeño	Construcción	4.92e+06	2026-06-02 15:27:56	2026-06-02 16:16:04	11
33f01c20-8944-48dc-963f-f69504e74f64	94e9e93c-60a8-47cd-8126-e0836bd5cfe1	EXENTO_IVA	Plataforma GC 2025-2027	MS25135	cli_andritz	ANDRITZ	VG	DL	Gestión Capacitación	Administración y Operación	1.3780206e+07	2026-06-02 15:27:56	2026-06-02 16:16:04	12
ebe818cf-4800-4191-9a30-d6121888b5ab	94e9e93c-60a8-47cd-8126-e0836bd5cfe1	AFECTO_IVA	Plataforma de Potencial y Ninebox	MS25078	cli_arcor	ARCOR	VG	MDR	Talentos	Administración y Operación	1.04e+07	2026-06-02 15:27:56	2026-06-02 16:16:04	13
e5c1ce12-6e3d-4b96-80dc-2b52b286263f	94e9e93c-60a8-47cd-8126-e0836bd5cfe1	EXENTO_IVA	Planes de Acción 2025	MS24233	cli_aristia	ARIZTÍA	VG	MDR	Clima/Encuestas	Administración y Operación	4.23913e+06	2026-06-02 15:27:56	2026-06-02 16:16:04	14
4215ee2e-2a8d-4c5f-bfcd-39af81345dd2	94e9e93c-60a8-47cd-8126-e0836bd5cfe1	EXENTO_IVA	Paquete Horas TI 2026	MS26010	cli_aristia	ARIZTÍA	VG	MDR	Reconocimiento	Horas de Desarrollo	1.985e+06	2026-06-02 15:27:56	2026-06-02 16:16:04	15
83f15dd7-ebc3-4d7e-99a7-c6de2b1e9e2c	94e9e93c-60a8-47cd-8126-e0836bd5cfe1	EXENTO_IVA	Gestión de Capacitación 2026	MS26008	cli_aristia	ARIZTÍA	VG	MDR	Gestión Capacitación	Administración y Operación	1.04e+07	2026-06-02 15:27:56	2026-06-02 16:16:04	16
548e4ae8-cfe4-43e7-8fbd-20eec374a252	94e9e93c-60a8-47cd-8126-e0836bd5cfe1	EXENTO_IVA	Reconocimiento 2026	MS26009	cli_aristia	ARIZTÍA	VG	MDR	Reconocimiento	Administración y Operación	1.21941e+07	2026-06-02 15:27:56	2026-06-02 16:16:04	17
36028989-ea20-41f5-b246-c8e44c1e6b61	94e9e93c-60a8-47cd-8126-e0836bd5cfe1	AFECTO_IVA	Plataforma Desempeño 2025	MS25016	cli_avla	AVLA	VG	MDR	Desempeño	Administración y Operación	4.772171e+06	2026-06-02 15:27:56	2026-06-02 16:16:04	18
681cc031-9409-4acc-a962-dbb677dbe942	94e9e93c-60a8-47cd-8126-e0836bd5cfe1	EXENTO_IVA	Plataforma GC 2025	MS25003	cli_aza	AZA	VG	DL	Gestión Capacitación	Administración y Operación	1.4552996e+07	2026-06-02 15:27:56	2026-06-02 16:16:04	19
6bc2ac0e-215a-424b-9a42-840812e3981f	94e9e93c-60a8-47cd-8126-e0836bd5cfe1	EXENTO_IVA	Plataforma LMS 2025	MS25002	cli_aza	AZA	VG	DL	LMS	Administración y Operación	2.7111004e+07	2026-06-02 15:27:56	2026-06-02 16:16:04	20
98eec03c-3ab2-4ba1-b891-dbd79c2a7bd6	94e9e93c-60a8-47cd-8126-e0836bd5cfe1	EXENTO_IVA	Plataforma LMS 2025	MS24197	cli_bex	BANCO ESTADO EXPRESS	VG	DL	LMS	Administración y Operación	3.8256e+07	2026-06-02 15:27:56	2026-06-02 16:16:04	21
fa91cc8e-ecaf-48dd-91f6-a87c7cfe5f73	94e9e93c-60a8-47cd-8126-e0836bd5cfe1	EXENTO_IVA	Mantención Chatbot 2025	MS24198	cli_bex	BANCO ESTADO EXPRESS	VG	DL	LMS	Administración y Operación	1.9925e+06	2026-06-02 15:27:56	2026-06-02 16:16:04	22
fb3fdd4e-94d2-4014-b286-b416725602bb	94e9e93c-60a8-47cd-8126-e0836bd5cfe1	EXENTO_IVA	Plataforma GC 2025	MS24199	cli_bex	BANCO ESTADO EXPRESS	VG	DL	Gestión Capacitación	Administración y Operación	4.782e+06	2026-06-02 15:27:56	2026-06-02 16:16:04	23
cc653b6e-0d4e-4f16-bcd1-d9fd252bcf28	94e9e93c-60a8-47cd-8126-e0836bd5cfe1	AFECTO_IVA	Plataforma Desempeño 2025	MS24200	cli_bex	BANCO ESTADO EXPRESS	VG	DL	Desempeño	Administración y Operación	2.4208876e+07	2026-06-02 15:27:56	2026-06-02 16:16:04	24
143a0b7e-2296-4dbb-86a6-f0c534c5b414	94e9e93c-60a8-47cd-8126-e0836bd5cfe1	EXENTO_IVA	Plataforma Clima y Planes 2025	MS24202	cli_bex	BANCO ESTADO EXPRESS	VG	DL	Clima/Encuestas	Administración y Operación	1.6737e+07	2026-06-02 15:27:56	2026-06-02 16:16:04	25
d1ebc656-b4bc-403f-a6b7-9420de66a0cd	94e9e93c-60a8-47cd-8126-e0836bd5cfe1	AFECTO_IVA	Plataforma Reconocimiento 2025	MS24203	cli_bex	BANCO ESTADO EXPRESS	VG	DL	Reconocimiento	Administración y Operación	1.05204e+07	2026-06-02 15:27:56	2026-06-02 16:16:04	26
b65c2f8d-ed90-46c6-8d89-c84958e189f3	94e9e93c-60a8-47cd-8126-e0836bd5cfe1	EXENTO_IVA	Plataforma Talento 2025	MS24205	cli_bex	BANCO ESTADO EXPRESS	VG	DL	Talentos	Administración y Operación	7.173e+06	2026-06-02 15:27:56	2026-06-02 16:16:04	27
4078e7a1-c489-44bb-af5d-20670345b0aa	94e9e93c-60a8-47cd-8126-e0836bd5cfe1	EXENTO_IVA	Plataforma LMS 2026	MS25159	cli_banco_internacional	BANCO INTERNACIONAL	VG	DL	LMS	Administración y Operación	8.2811725e+06	2026-06-02 15:27:56	2026-06-02 16:16:04	28
ad4246e8-0b0e-4959-9a9f-421880b6c83c	94e9e93c-60a8-47cd-8126-e0836bd5cfe1	EXENTO_IVA	Plataforma GC 2026	MS25160	cli_banco_internacional	BANCO INTERNACIONAL	VG	DL	Gestión Capacitación	Administración y Operación	9.555199e+06	2026-06-02 15:27:56	2026-06-02 16:16:04	29
eef3aad4-d6a2-458b-ad9a-9ec3fec6d0b5	94e9e93c-60a8-47cd-8126-e0836bd5cfe1	EXENTO_IVA	Plataforma LMS 2024	MS24014	cli_carozzi	CAROZZI	VG	MDR	LMS	Administración y Operación	9.403992e+07	2026-06-02 15:27:56	2026-06-02 16:16:04	31
42010027-79f6-4d5e-99e8-f96deb137cf8	94e9e93c-60a8-47cd-8126-e0836bd5cfe1	EXENTO_IVA	Plataforma GC 2024	MS24015	cli_carozzi	CAROZZI	VG	MDR	Gestión Capacitación	Administración y Operación	1.3060846e+07	2026-06-02 15:27:56	2026-06-02 16:16:04	32
4943bc08-59f8-4908-9cac-5ec83fea9d73	94e9e93c-60a8-47cd-8126-e0836bd5cfe1	AFECTO_IVA	Taller IA	MS26053	cli_ccu	CCU	VG	DV	LMS	Construcción	2.3905032e+06	2026-06-02 15:27:56	2026-06-02 16:16:04	33
2c03b99e-7087-455c-a39b-46188232d26f	94e9e93c-60a8-47cd-8126-e0836bd5cfe1	AFECTO_IVA	Plataforma Desempeño 2025	MS25006	cli_copec	COPEC	VG	DL	Desempeño	Administración y Operación	2.2213516e+07	2026-06-02 15:27:56	2026-06-02 16:16:04	34
7bb4e4d2-c2aa-45d6-81a4-f9d6dc577115	94e9e93c-60a8-47cd-8126-e0836bd5cfe1	AFECTO_IVA	Plataforma Gestión de Talentos 2025	MS25007	cli_copec	COPEC	VG	DL	Talentos	Administración y Operación	9.925495e+06	2026-06-02 15:27:56	2026-06-02 16:16:04	35
8bf43911-694d-4fe9-8cde-0a1af1422d33	94e9e93c-60a8-47cd-8126-e0836bd5cfe1	AFECTO_IVA	Plataforma SGD	MS25076	cli_emin	EMIN	VG	MDR	Desempeño	Administración y Operación	2.3296e+07	2026-06-02 15:27:56	2026-06-02 16:16:04	36
25bc4459-b4dc-4097-80a7-e5156fb2b761	94e9e93c-60a8-47cd-8126-e0836bd5cfe1	EXENTO_IVA	Plataforma GC 2026	MS26002	cli_enaex	ENAEX	VG	MA	Gestión Capacitación	Administración y Operación	9.48e+06	2026-06-02 15:27:56	2026-06-02 16:16:04	37
89f8d55d-8cac-4e9f-b00b-df54e5ea64ce	94e9e93c-60a8-47cd-8126-e0836bd5cfe1	MIXTO	Plataforma LMS 2026	MS26001	cli_enaex	ENAEX	VG	MA	LMS	Administración y Operación	7.563113e+07	2026-06-02 15:27:56	2026-06-02 16:16:04	38
cca28c04-2fa0-46ad-85f0-71b7b3a83f3c	94e9e93c-60a8-47cd-8126-e0836bd5cfe1	EXENTO_IVA	Plataforma Reconocimiento 2026	MS26004	cli_enaex	ENAEX	VG	MA	Reconocimiento	Administración y Operación	1.7020638e+07	2026-06-02 15:27:56	2026-06-02 16:16:04	39
dff972cd-bf25-4403-a360-932ee23e71c5	94e9e93c-60a8-47cd-8126-e0836bd5cfe1	EXENTO_IVA	Paquete de Horas 2026	MS26005	cli_enaex	ENAEX	VG	MA	LMS	Horas de Desarrollo	4.68e+06	2026-06-02 15:27:56	2026-06-02 16:16:04	40
1a1e6e4d-c5c4-45cf-941f-8bf3bdbb774e	94e9e93c-60a8-47cd-8126-e0836bd5cfe1	AFECTO_IVA	Plataforma Reconocimiento 2025	MS25013	cli_magotteaux	MAGOTTEAUX	VG	MDR	Reconocimiento	Administración y Operación	1.107284e+07	2026-06-02 15:27:56	2026-06-02 16:16:04	41
c992b1d1-209b-4205-a332-e705b9bb90b5	94e9e93c-60a8-47cd-8126-e0836bd5cfe1	AFECTO_IVA	LMS	MS21000	cli_resiter	RESITER	VG	MDR	LMS	Administración y Operación	214629.58	2026-06-02 15:27:56	2026-06-02 16:16:04	42
8285508a-30d2-4322-bb44-d0b4dfc5130f	94e9e93c-60a8-47cd-8126-e0836bd5cfe1	AFECTO_IVA	Plataforma Liderazgo 2026	MS26063	cli_salmones	SALMONES AUSTRAL	VG	MDR	Liderazgo	Administración y Operación	7.7451215e+06	2026-06-02 15:27:56	2026-06-02 16:16:04	43
92da538e-02a6-451c-a662-618695ce63c2	94e9e93c-60a8-47cd-8126-e0836bd5cfe1	AFECTO_IVA	Plataforma Desempeño 2025 - Profesionales	MS25008	cli_soprole	SOPROLE	VG	MA	Desempeño	Administración y Operación	1.6732564e+07	2026-06-02 15:27:56	2026-06-02 16:16:04	44
f39bd107-dd8e-4afc-aa80-1395d4e139f4	94e9e93c-60a8-47cd-8126-e0836bd5cfe1	AFECTO_IVA	Plataforma LMS 2025	MS25027	cli_transelect	TRANSELEC	VG	DL	LMS	Administración y Operación	1.4357458e+07	2026-06-02 15:27:56	2026-06-02 16:16:04	45
9f1a9c52-26a2-493c-b7c6-e157844f3895	94e9e93c-60a8-47cd-8126-e0836bd5cfe1	EXENTO_IVA	Platas Sin Asignar	MS24049	cli_banco_internacional	BANCO INTERNACIONAL	VG	DL			\N	2026-06-02 15:27:56	2026-06-02 16:16:04	49
\.


--
-- Data for Name: proyeccion_mensual; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.proyeccion_mensual (id, item_id, mes, cantidad_uf, uf_fija, uf_proyectada, uf_manual, monto_clp, monto_clp_manual, modo_calculo, submodo_uf, origen_valor, es_manual, observacion, created_at, updated_at) FROM stdin;
313058a6-cf5f-4754-811c-af58d917a1fd	ad864312-a0f5-4f74-8201-876bad927fb4	5	232.50603	\N	40424	\N	9.532747e+06	9.532747e+06	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Migrado desde proyeccion legacy	2026-05-20 16:01:46	2026-05-20 16:01:46
d7c6fac1-be9a-445e-bfa8-c67d1c82e97e	7c780c8e-1bd4-4983-bfb5-afbdbb5710d7	1	\N	\N	39723	\N	3.2704e+07	3.2704e+07	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Migrado desde proyeccion legacy	2026-05-20 16:01:46	2026-05-20 16:01:46
e148d338-b8df-4320-9762-fc00c6183e6b	7c780c8e-1bd4-4983-bfb5-afbdbb5710d7	5	102.34146	\N	40424	\N	4.196e+06	4.196e+06	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Migrado desde proyeccion legacy	2026-05-20 16:01:46	2026-05-20 16:01:46
94291a35-ee3d-4ca9-8b98-237cc12e05d8	cee7ef13-dfdc-4053-846a-9416534a82a2	5	120	\N	40424	\N	4.92e+06	4.92e+06	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Migrado desde proyeccion legacy	2026-05-20 16:01:46	2026-05-20 16:01:46
ccc34487-64bc-47d9-bd1c-7cb1bbe21a3a	cff1ac1a-28a4-44c2-92ac-e85987155072	3	446.4	\N	39834	\N	1.7785344e+07	1.7785344e+07	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Migrado desde proyeccion legacy	2026-05-20 16:01:46	2026-05-20 16:01:46
abe8c5b8-dcc4-4833-a27f-a6929f4bee07	160cd851-8e9b-481d-acaa-0f584905123a	5	70	\N	40424	\N	2.87e+06	2.87e+06	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Migrado desde proyeccion legacy	2026-05-20 16:01:46	2026-05-20 16:01:46
b5578d3b-5d1c-452b-9911-0a5e5415e34d	9717107a-a93a-41b5-b234-0c5f929a5750	5	184.61629	\N	40424	\N	7.569268e+06	7.569268e+06	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Migrado desde proyeccion legacy	2026-05-20 16:01:46	2026-05-20 16:01:46
5de16364-de17-43e0-915f-72155727a03d	a76490ef-3b9c-4270-8610-d33f3bf94420	5	220	\N	40424	\N	9.02e+06	9.02e+06	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Migrado desde proyeccion legacy	2026-05-20 16:01:46	2026-05-20 16:01:46
5f36468d-4100-4d9e-879a-cb4ff7b80359	df7a797c-5348-468d-8391-b250df385e83	1	60	\N	39723	\N	2.3834472e+06	2.3834472e+06	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Migrado desde proyeccion legacy	2026-05-20 16:01:46	2026-05-20 16:01:46
8f6a5287-50f0-484e-8fe5-dc998c878183	df7a797c-5348-468d-8391-b250df385e83	5	111.86714	\N	40424	\N	4.586553e+06	4.586553e+06	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Migrado desde proyeccion legacy	2026-05-20 16:01:46	2026-05-20 16:01:46
5da8b0fe-ee2c-4ba1-98cd-b58252667042	8e2e3294-0c87-4f27-9457-97d8d5e4ce25	5	120	\N	40424	\N	4.92e+06	4.92e+06	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Migrado desde proyeccion legacy	2026-05-20 16:01:46	2026-05-20 16:01:46
9fc31eb1-6e2f-4ed9-b75a-bf29c1f5666a	1fda0fe7-3db6-4e9f-9057-f43ed66ac89e	10	\N	\N	39806	\N	6.890103e+06	6.890103e+06	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Migrado desde proyeccion legacy	2026-05-20 16:01:46	2026-05-20 16:01:46
5e6903e5-edf4-46cd-bb47-74d40c8901b3	1fda0fe7-3db6-4e9f-9057-f43ed66ac89e	12	\N	\N	39933	\N	6.890103e+06	6.890103e+06	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Migrado desde proyeccion legacy	2026-05-20 16:01:46	2026-05-20 16:01:46
9234121c-c2ea-4020-b43d-47500c9e07ce	0579e28f-b5f8-46a3-a86d-de76f28f0f09	6	86.666664	\N	39857	\N	3.4666668e+06	3.4666668e+06	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Migrado desde proyeccion legacy	2026-05-20 16:01:46	2026-05-20 16:01:46
508e145d-9553-4936-bf4a-ba7477038c2c	0579e28f-b5f8-46a3-a86d-de76f28f0f09	8	86.666664	\N	39763	\N	3.4666668e+06	3.4666668e+06	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Migrado desde proyeccion legacy	2026-05-20 16:01:46	2026-05-20 16:01:46
bd16e1f5-cea2-4f61-a727-c3d5e02c67b3	0579e28f-b5f8-46a3-a86d-de76f28f0f09	10	86.666664	\N	39806	\N	3.4666668e+06	3.4666668e+06	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Migrado desde proyeccion legacy	2026-05-20 16:01:46	2026-05-20 16:01:46
712cf456-d015-444c-9953-55b74579589c	03e50f70-ef8a-4354-9122-5e075c5a6fd9	2	\N	\N	39759	\N	4.23913e+06	4.23913e+06	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Migrado desde proyeccion legacy	2026-05-20 16:01:46	2026-05-20 16:01:46
3b14857b-93e3-41c6-9557-eb0b7e820095	23488cf2-a5b7-4984-a8f3-dfba0e0c65d6	8	260	\N	39763	\N	1.04e+07	1.04e+07	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Migrado desde proyeccion legacy	2026-05-20 16:01:46	2026-05-20 16:01:46
6dac7188-04e5-4706-82a0-2aa758a98721	0e81bbe9-ec94-419e-852d-2c3a45e7807e	5	153	\N	40424	\N	6.12e+06	6.12e+06	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Migrado desde proyeccion legacy	2026-05-20 16:01:46	2026-05-20 16:01:46
48a158c0-b9a3-4100-90a2-3c9a61ba50b4	0e81bbe9-ec94-419e-852d-2c3a45e7807e	8	153	\N	39763	\N	6.0741e+06	6.0741e+06	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Migrado desde proyeccion legacy	2026-05-20 16:01:46	2026-05-20 16:01:46
ca0a24f5-f8e8-4115-b6b7-ad44fdfc01c5	ccdb6ab1-f7ba-4c32-9808-b40096dc7713	8	50	\N	39763	\N	1.985e+06	1.985e+06	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Migrado desde proyeccion legacy	2026-05-20 16:01:46	2026-05-20 16:01:46
94cbc428-3901-498a-8a4c-54a82c6692a4	b548fb52-48f6-4288-81e9-6624603f9c03	1	\N	\N	39723	\N	1.589371e+06	1.589371e+06	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Migrado desde proyeccion legacy	2026-05-20 16:01:46	2026-05-20 16:01:46
006a5a82-9adf-473a-93a7-5a65950c687f	b548fb52-48f6-4288-81e9-6624603f9c03	2	\N	\N	39759	\N	1.589131e+06	1.589131e+06	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Migrado desde proyeccion legacy	2026-05-20 16:01:46	2026-05-20 16:01:46
839d561a-4f7b-484c-a6fc-9bbea20604a9	b548fb52-48f6-4288-81e9-6624603f9c03	3	\N	\N	39834	\N	1.593669e+06	1.593669e+06	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Migrado desde proyeccion legacy	2026-05-20 16:01:46	2026-05-20 16:01:46
0e380026-911a-4815-8533-b31168767c99	82df8a7c-6b5b-405f-9ecc-86a393b6c33a	6	412.3143	\N	39857	\N	1.6492572e+07	1.6492572e+07	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Migrado desde proyeccion legacy	2026-05-20 16:01:46	2026-05-20 16:01:46
5e6bc476-2a83-48dc-a37f-9f14ae695d97	3b21d650-233f-47aa-9367-1bb89f3513ce	6	360	\N	39857	\N	1.44e+07	1.44e+07	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Migrado desde proyeccion legacy	2026-05-20 16:01:46	2026-05-20 16:01:46
7b9c5653-0296-4130-9c2e-96a7114a97ad	67150288-c28f-445c-870f-eb7a3c4f166c	1	\N	\N	39723	\N	1.42e+07	1.42e+07	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Migrado desde proyeccion legacy	2026-05-20 16:01:46	2026-05-20 16:01:46
cfe0aab7-6ad4-4875-b4a7-333823c61cb0	67150288-c28f-445c-870f-eb7a3c4f166c	3	\N	\N	39834	\N	750625	750625	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Migrado desde proyeccion legacy	2026-05-20 16:01:46	2026-05-20 16:01:46
168f3b44-3399-4d58-884b-c724c273f713	67150288-c28f-445c-870f-eb7a3c4f166c	5	\N	\N	40424	\N	4.177375e+06	4.177375e+06	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Migrado desde proyeccion legacy	2026-05-20 16:01:46	2026-05-20 16:01:46
22bf0ad0-6b3e-447d-86c4-f81d57c4cac8	67150288-c28f-445c-870f-eb7a3c4f166c	10	480	\N	39806	\N	1.9128e+07	1.9128e+07	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Migrado desde proyeccion legacy	2026-05-20 16:01:46	2026-05-20 16:01:46
5d1dd8e4-b19a-4ad4-978f-4ef154080d4f	480619b3-c78c-4bdb-b36f-abed605a80aa	5	50	\N	40424	\N	1.9925e+06	1.9925e+06	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Migrado desde proyeccion legacy	2026-05-20 16:01:46	2026-05-20 16:01:46
6ccfc55b-0ad4-4480-ab09-741baf3aa591	e69a6d4d-985a-436a-9f0f-dc2f72ddddf5	5	\N	\N	40424	\N	689375	689375	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Migrado desde proyeccion legacy	2026-05-20 16:01:46	2026-05-20 16:01:46
bbf82581-6fa3-4f36-8cef-a21c7060a889	e69a6d4d-985a-436a-9f0f-dc2f72ddddf5	8	42.700752	\N	39763	\N	1.701625e+06	1.701625e+06	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Migrado desde proyeccion legacy	2026-05-20 16:01:46	2026-05-20 16:01:46
82b3b478-9f60-4acf-822f-5b1f8dfbc233	e69a6d4d-985a-436a-9f0f-dc2f72ddddf5	10	60	\N	39806	\N	2.391e+06	2.391e+06	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Migrado desde proyeccion legacy	2026-05-20 16:01:46	2026-05-20 16:01:46
ccb8124b-6db2-4e24-9037-a6ec54a2856b	787abf99-71f3-4d7a-ac55-fa4ae49ce5ce	3	\N	\N	39834	\N	1.3449375e+07	1.3449375e+07	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Migrado desde proyeccion legacy	2026-05-20 16:01:46	2026-05-20 16:01:46
c8bcbc3f-df3d-4dd9-8b43-a10a1ee717c9	787abf99-71f3-4d7a-ac55-fa4ae49ce5ce	10	270	\N	39806	\N	1.07595e+07	1.07595e+07	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Migrado desde proyeccion legacy	2026-05-20 16:01:46	2026-05-20 16:01:46
e3d56ee1-71c2-4f26-ab3b-58bf2969b592	232390df-c04a-4b92-8f0b-5481ca4aabb2	8	210	\N	39763	\N	8.3685e+06	8.3685e+06	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Migrado desde proyeccion legacy	2026-05-20 16:01:46	2026-05-20 16:01:46
846f5b43-76fb-4395-ab93-bba9f07f47b8	232390df-c04a-4b92-8f0b-5481ca4aabb2	10	210	\N	39806	\N	8.3685e+06	8.3685e+06	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Migrado desde proyeccion legacy	2026-05-20 16:01:46	2026-05-20 16:01:46
c9397590-4cfe-4752-951d-85d5890d9bc9	33ac5e83-20b4-4847-90ad-d6cae1d89c36	5	66	\N	40424	\N	2.64e+06	2.64e+06	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Migrado desde proyeccion legacy	2026-05-20 16:01:46	2026-05-20 16:01:46
9157dba5-41fb-4927-9852-e379a9d237da	33ac5e83-20b4-4847-90ad-d6cae1d89c36	7	66	\N	39700	\N	2.6268e+06	2.6268e+06	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Migrado desde proyeccion legacy	2026-05-20 16:01:46	2026-05-20 16:01:46
f778bc28-5888-41c1-bdfc-1831f5cec40b	33ac5e83-20b4-4847-90ad-d6cae1d89c36	9	66	\N	39800	\N	2.6268e+06	2.6268e+06	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Migrado desde proyeccion legacy	2026-05-20 16:01:46	2026-05-20 16:01:46
d58572d7-1777-43e5-88cb-c7bddb13def8	33ac5e83-20b4-4847-90ad-d6cae1d89c36	12	66	\N	39933	\N	2.6268e+06	2.6268e+06	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Migrado desde proyeccion legacy	2026-05-20 16:01:46	2026-05-20 16:01:46
9d79dfe9-6e67-419d-b2f0-2fcb8f42204d	f807ebd0-085d-4292-bdc6-d9af68272971	5	90	\N	40424	\N	3.5865e+06	3.5865e+06	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Migrado desde proyeccion legacy	2026-05-20 16:01:46	2026-05-20 16:01:46
f686e4aa-c032-4570-977e-2e9276964d43	f807ebd0-085d-4292-bdc6-d9af68272971	10	90	\N	39806	\N	3.5865e+06	3.5865e+06	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Migrado desde proyeccion legacy	2026-05-20 16:01:46	2026-05-20 16:01:46
7f3f7b65-5585-4763-b9ea-5fe6e3d55361	2969cccb-d399-4fe9-a355-fc1eacf2614c	3	\N	\N	39834	\N	8.222048e+06	8.222048e+06	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Migrado desde proyeccion legacy	2026-05-20 16:01:46	2026-05-20 16:01:46
fe45fba8-5e71-44b9-939f-3fd5168ed2f6	8477af52-ad41-480f-8b82-d96942924402	3	208	\N	39834	\N	8.2811725e+06	8.2811725e+06	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Migrado desde proyeccion legacy	2026-05-20 16:01:46	2026-05-20 16:01:46
d9861078-256d-4f78-8fa3-ca945824982b	85ae2aed-b0b9-4cc0-aa74-7a0254293823	3	240	\N	39834	\N	9.555199e+06	9.555199e+06	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Migrado desde proyeccion legacy	2026-05-20 16:01:46	2026-05-20 16:01:46
f089471b-ba06-4c20-98f8-b60c34d70895	699269f4-b66c-4f2e-aa6c-8d0ee2201b78	1	\N	\N	39723	\N	2.145e+07	2.145e+07	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Migrado desde proyeccion legacy	2026-05-20 16:01:46	2026-05-20 16:01:46
dd74ab2a-13f3-4c78-b2bd-cfb0f942f41f	699269f4-b66c-4f2e-aa6c-8d0ee2201b78	2	\N	\N	39759	\N	1.039924e+06	1.039924e+06	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Migrado desde proyeccion legacy	2026-05-20 16:01:46	2026-05-20 16:01:46
1926766c-ab6a-4e58-876d-70d008dddff6	699269f4-b66c-4f2e-aa6c-8d0ee2201b78	6	450	\N	39857	\N	1.7775e+07	1.7775e+07	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Migrado desde proyeccion legacy	2026-05-20 16:01:46	2026-05-20 16:01:46
0d748a1b-3b38-48c3-8644-04c9c5de47ee	699269f4-b66c-4f2e-aa6c-8d0ee2201b78	8	450	\N	39763	\N	1.7775e+07	1.7775e+07	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Migrado desde proyeccion legacy	2026-05-20 16:01:46	2026-05-20 16:01:46
54c2e00e-e95c-47f8-b0fc-86245563d8c4	699269f4-b66c-4f2e-aa6c-8d0ee2201b78	10	450	\N	39806	\N	1.8e+07	1.8e+07	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Migrado desde proyeccion legacy	2026-05-20 16:01:46	2026-05-20 16:01:46
1ce409bc-1385-473e-a3fb-b44d2c0650c5	699269f4-b66c-4f2e-aa6c-8d0ee2201b78	12	450	\N	39933	\N	1.8e+07	1.8e+07	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Migrado desde proyeccion legacy	2026-05-20 16:01:46	2026-05-20 16:01:46
d6ea1ba2-f7d0-4919-8e33-f7186ed98062	dcb07693-3f23-4538-bc5d-292648c85cfa	2	\N	\N	39759	\N	7.135846e+06	7.135846e+06	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Migrado desde proyeccion legacy	2026-05-20 16:01:46	2026-05-20 16:01:46
2757520c-58d7-442f-8ca1-045d0b817bc6	dcb07693-3f23-4538-bc5d-292648c85cfa	6	75	\N	39857	\N	2.9625e+06	2.9625e+06	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Migrado desde proyeccion legacy	2026-05-20 16:01:46	2026-05-20 16:01:46
df75ce38-99ca-4475-8468-98bd915576a7	dcb07693-3f23-4538-bc5d-292648c85cfa	8	75	\N	39763	\N	2.9625e+06	2.9625e+06	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Migrado desde proyeccion legacy	2026-05-20 16:01:46	2026-05-20 16:01:46
7d877182-1467-4805-99a0-a4e07194f5c3	7d5965c3-3c53-4e97-bdea-58b553cd07aa	3	60	\N	39834	\N	2.3905032e+06	2.3905032e+06	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Migrado desde proyeccion legacy	2026-05-20 16:01:46	2026-05-20 16:01:46
cc7f9146-b3b6-4283-9086-dd96709d1ea2	07fa9a2e-7357-4a0d-87e6-c799ba808358	3	138.78	\N	39834	\N	5.529234e+06	5.529234e+06	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Migrado desde proyeccion legacy	2026-05-20 16:01:46	2026-05-20 16:01:46
d5af51f3-85b7-4125-b3f1-99744f2c7548	07fa9a2e-7357-4a0d-87e6-c799ba808358	4	46.26	\N	40054	\N	1.8559605e+06	1.8559605e+06	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Migrado desde proyeccion legacy	2026-05-20 16:01:46	2026-05-20 16:01:46
aeb8cebf-46fd-4947-a54c-af270b79535e	07fa9a2e-7357-4a0d-87e6-c799ba808358	5	46.26	\N	40424	\N	1.8504e+06	1.8504e+06	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Migrado desde proyeccion legacy	2026-05-20 16:01:46	2026-05-20 16:01:46
5318cc67-2d86-4185-a21c-72deb6aa708f	07fa9a2e-7357-4a0d-87e6-c799ba808358	6	46.26	\N	39857	\N	1.8504e+06	1.8504e+06	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Migrado desde proyeccion legacy	2026-05-20 16:01:46	2026-05-20 16:01:46
01baf925-68f8-4087-8658-2feb6bf98ec4	07fa9a2e-7357-4a0d-87e6-c799ba808358	7	\N	\N	39700	\N	1.8504e+06	1.8504e+06	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Migrado desde proyeccion legacy	2026-05-20 16:01:46	2026-05-20 16:01:46
d8c11601-4a2f-4a78-ac8a-0a0de5b1cd62	07fa9a2e-7357-4a0d-87e6-c799ba808358	8	\N	\N	39763	\N	1.8504e+06	1.8504e+06	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Migrado desde proyeccion legacy	2026-05-20 16:01:46	2026-05-20 16:01:46
f67b092b-5dfa-4196-818e-92ccd0c6cae2	07fa9a2e-7357-4a0d-87e6-c799ba808358	9	\N	\N	39800	\N	1.8504e+06	1.8504e+06	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Migrado desde proyeccion legacy	2026-05-20 16:01:46	2026-05-20 16:01:46
230f6b96-5b40-48aa-8136-42a2a31fcf93	07fa9a2e-7357-4a0d-87e6-c799ba808358	10	\N	\N	39806	\N	1.8504e+06	1.8504e+06	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Migrado desde proyeccion legacy	2026-05-20 16:01:46	2026-05-20 16:01:46
2357f03c-5165-4f46-80f2-5629c9b2f69b	07fa9a2e-7357-4a0d-87e6-c799ba808358	11	\N	\N	\N	\N	1.8504e+06	1.8504e+06	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Migrado desde proyeccion legacy	2026-05-20 16:01:46	2026-05-20 16:01:46
688e7b0a-004d-402c-ab8a-7a5e014924a0	07fa9a2e-7357-4a0d-87e6-c799ba808358	12	\N	\N	39933	\N	1.8504e+06	1.8504e+06	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Migrado desde proyeccion legacy	2026-05-20 16:01:46	2026-05-20 16:01:46
2466c4b5-1c74-44b5-9372-383682783371	bdc81e93-7795-47a5-93f1-96b013491d82	3	62.01	\N	39834	\N	2.470585e+06	2.470585e+06	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Migrado desde proyeccion legacy	2026-05-20 16:01:46	2026-05-20 16:01:46
3e82ff84-cdbc-4951-8dd0-6b9992fba3f6	bdc81e93-7795-47a5-93f1-96b013491d82	4	20.67	\N	40054	\N	829284.56	829284.56	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Migrado desde proyeccion legacy	2026-05-20 16:01:46	2026-05-20 16:01:46
08946130-cf6d-4858-9581-c89230bd5fa9	bdc81e93-7795-47a5-93f1-96b013491d82	5	20.67	\N	40424	\N	826800	826800	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Migrado desde proyeccion legacy	2026-05-20 16:01:46	2026-05-20 16:01:46
24100d1f-5c37-430f-9017-93cd2c52e6f1	bdc81e93-7795-47a5-93f1-96b013491d82	6	20.67	\N	39857	\N	826800	826800	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Migrado desde proyeccion legacy	2026-05-20 16:01:46	2026-05-20 16:01:46
5fb659ab-7631-4a58-918c-05d30c3df754	bdc81e93-7795-47a5-93f1-96b013491d82	7	\N	\N	39700	\N	826800	826800	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Migrado desde proyeccion legacy	2026-05-20 16:01:46	2026-05-20 16:01:46
43db0f71-6612-4126-b092-2e5b6eed6cdd	bdc81e93-7795-47a5-93f1-96b013491d82	8	\N	\N	39763	\N	826800	826800	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Migrado desde proyeccion legacy	2026-05-20 16:01:46	2026-05-20 16:01:46
c5af3874-fdaa-4272-9212-b04ae02a07dd	bdc81e93-7795-47a5-93f1-96b013491d82	9	\N	\N	39800	\N	826800	826800	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Migrado desde proyeccion legacy	2026-05-20 16:01:46	2026-05-20 16:01:46
43ab8b0a-105d-4a77-9912-45c4295c6c8f	bdc81e93-7795-47a5-93f1-96b013491d82	10	\N	\N	39806	\N	826800	826800	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Migrado desde proyeccion legacy	2026-05-20 16:01:46	2026-05-20 16:01:46
dd3a6d73-b602-4db5-9c42-5accbabdc65e	bdc81e93-7795-47a5-93f1-96b013491d82	11	\N	\N	\N	\N	826800	826800	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Migrado desde proyeccion legacy	2026-05-20 16:01:46	2026-05-20 16:01:46
21632f45-87b2-44f0-b43f-1a90e09befa0	bdc81e93-7795-47a5-93f1-96b013491d82	12	\N	\N	39933	\N	826800	826800	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Migrado desde proyeccion legacy	2026-05-20 16:01:46	2026-05-20 16:01:46
2e56de65-d739-46a5-b346-bcd3631ca3dc	cb947898-0b07-4cfc-8b22-14ada64025da	5	72.8	\N	40424	\N	2.912e+06	2.912e+06	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Migrado desde proyeccion legacy	2026-05-20 16:01:46	2026-05-20 16:01:46
ae086e19-79c8-4781-b619-d6bd463e597f	cb947898-0b07-4cfc-8b22-14ada64025da	6	72.8	\N	39857	\N	2.912e+06	2.912e+06	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Migrado desde proyeccion legacy	2026-05-20 16:01:46	2026-05-20 16:01:46
a68b6ad7-14d9-4431-90c0-0a4eef5aa19d	cb947898-0b07-4cfc-8b22-14ada64025da	7	\N	\N	39700	\N	2.912e+06	2.912e+06	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Migrado desde proyeccion legacy	2026-05-20 16:01:46	2026-05-20 16:01:46
90f6690c-3d31-4083-8dde-6c14a794b991	cb947898-0b07-4cfc-8b22-14ada64025da	8	\N	\N	39763	\N	2.912e+06	2.912e+06	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Migrado desde proyeccion legacy	2026-05-20 16:01:46	2026-05-20 16:01:46
9e99067d-74cb-4280-8267-45a9ba6ecb00	cb947898-0b07-4cfc-8b22-14ada64025da	9	\N	\N	39800	\N	2.912e+06	2.912e+06	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Migrado desde proyeccion legacy	2026-05-20 16:01:46	2026-05-20 16:01:46
78b5bf08-9c5b-4b82-91c0-b4b54716bddb	cb947898-0b07-4cfc-8b22-14ada64025da	10	\N	\N	39806	\N	2.912e+06	2.912e+06	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Migrado desde proyeccion legacy	2026-05-20 16:01:46	2026-05-20 16:01:46
ae67d344-650a-445c-8652-5a94bd83ee0c	cb947898-0b07-4cfc-8b22-14ada64025da	11	\N	\N	\N	\N	2.912e+06	2.912e+06	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Migrado desde proyeccion legacy	2026-05-20 16:01:46	2026-05-20 16:01:46
f8caf0f0-78ac-499e-a6a6-8171108b02bb	cb947898-0b07-4cfc-8b22-14ada64025da	12	\N	\N	39933	\N	2.912e+06	2.912e+06	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Migrado desde proyeccion legacy	2026-05-20 16:01:46	2026-05-20 16:01:46
30d4d0f4-e9ec-4732-836a-98872939d08c	5dc4def9-8ed6-4618-bfc4-97870e2bf789	1	145	\N	39723	\N	5.7577515e+06	5.7577515e+06	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Migrado desde proyeccion legacy	2026-05-20 16:01:46	2026-05-20 16:01:46
61e95c84-5ba0-4160-a0fd-bbb98ac5a262	5dc4def9-8ed6-4618-bfc4-97870e2bf789	2	145	\N	39759	\N	5.766353e+06	5.766353e+06	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Migrado desde proyeccion legacy	2026-05-20 16:01:46	2026-05-20 16:01:46
2a3b2b44-afe0-4183-baf1-54c3f659e944	5dc4def9-8ed6-4618-bfc4-97870e2bf789	3	145	\N	39834	\N	5.7770495e+06	5.7770495e+06	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Migrado desde proyeccion legacy	2026-05-20 16:01:46	2026-05-20 16:01:46
59f6dc85-6f39-4367-a41b-51d6869bd53c	5dc4def9-8ed6-4618-bfc4-97870e2bf789	4	145	\N	40054	\N	5.815499e+06	5.815499e+06	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Migrado desde proyeccion legacy	2026-05-20 16:01:46	2026-05-20 16:01:46
4022c800-9cab-47fc-8e5e-bb6ca75d31f9	5dc4def9-8ed6-4618-bfc4-97870e2bf789	5	297.01978	\N	40424	\N	1.1914472e+07	1.1914472e+07	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Migrado desde proyeccion legacy	2026-05-20 16:01:46	2026-05-20 16:01:46
587265d7-dbf4-43de-b926-3024e44101ce	5dc4def9-8ed6-4618-bfc4-97870e2bf789	6	145	\N	39857	\N	5.8e+06	5.8e+06	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Migrado desde proyeccion legacy	2026-05-20 16:01:46	2026-05-20 16:01:46
cddf894c-826f-4d52-8dc7-396e53069104	5dc4def9-8ed6-4618-bfc4-97870e2bf789	7	145	\N	39700	\N	5.8e+06	5.8e+06	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Migrado desde proyeccion legacy	2026-05-20 16:01:46	2026-05-20 16:01:46
030d14a9-6252-4472-b98a-d37ed2570e38	5dc4def9-8ed6-4618-bfc4-97870e2bf789	8	\N	\N	39763	\N	5.8e+06	5.8e+06	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Migrado desde proyeccion legacy	2026-05-20 16:01:46	2026-05-20 16:01:46
5b550c04-cf33-46e2-abbe-e6932922f745	5dc4def9-8ed6-4618-bfc4-97870e2bf789	9	\N	\N	39800	\N	5.8e+06	5.8e+06	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Migrado desde proyeccion legacy	2026-05-20 16:01:46	2026-05-20 16:01:46
bb403a60-eac1-4004-b9b1-6859a4fba50e	5dc4def9-8ed6-4618-bfc4-97870e2bf789	10	\N	\N	39806	\N	5.8e+06	5.8e+06	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Migrado desde proyeccion legacy	2026-05-20 16:01:46	2026-05-20 16:01:46
cbbf2412-e8c0-4298-9179-57f4ad060a9c	5dc4def9-8ed6-4618-bfc4-97870e2bf789	11	\N	\N	\N	\N	5.8e+06	5.8e+06	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Migrado desde proyeccion legacy	2026-05-20 16:01:46	2026-05-20 16:01:46
2c3edcba-d0e0-489f-898b-ceec0dc86934	5dc4def9-8ed6-4618-bfc4-97870e2bf789	12	\N	\N	39933	\N	5.8e+06	5.8e+06	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Migrado desde proyeccion legacy	2026-05-20 16:01:46	2026-05-20 16:01:46
9660989a-27a0-4d1c-8c0c-a50eceae5e1c	6fa25f28-74ee-4a6b-910f-b87f4162382f	7	120	\N	39700	\N	4.74e+06	4.74e+06	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Migrado desde proyeccion legacy	2026-05-20 16:01:46	2026-05-20 16:01:46
482f8c60-245b-494d-b75d-eab67d3b19c1	6fa25f28-74ee-4a6b-910f-b87f4162382f	10	120	\N	39806	\N	4.74e+06	4.74e+06	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Migrado desde proyeccion legacy	2026-05-20 16:01:46	2026-05-20 16:01:46
2bb3e23c-8b31-4e99-8a9f-2501c3cfe7a1	b45c5a5f-ec2b-4216-9766-b30c8f6ff7be	1	90	\N	39723	\N	3.57759e+06	3.57759e+06	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Migrado desde proyeccion legacy	2026-05-20 16:01:46	2026-05-20 16:01:46
12a5f626-d3d6-49b0-bb2b-e55d511b10cc	b45c5a5f-ec2b-4216-9766-b30c8f6ff7be	7	100.33033	\N	39700	\N	3.963048e+06	3.963048e+06	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Migrado desde proyeccion legacy	2026-05-20 16:01:46	2026-05-20 16:01:46
5a27db21-8f62-40de-b0a7-dfe493f51aa5	b45c5a5f-ec2b-4216-9766-b30c8f6ff7be	10	240	\N	39806	\N	9.48e+06	9.48e+06	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Migrado desde proyeccion legacy	2026-05-20 16:01:46	2026-05-20 16:01:46
b068c541-781c-44e4-a5a9-ba25765ec431	1762e828-b530-4715-8372-88175bb7c2ae	12	117	\N	39933	\N	4.68e+06	4.68e+06	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Migrado desde proyeccion legacy	2026-05-20 16:01:46	2026-05-20 16:01:46
d696a6db-7b2f-4e6c-8c5f-a45b7acd1797	8dcfec48-a2fd-49de-a6e3-e38078d133a3	1	48.7	\N	39723	\N	1.9356848e+06	1.9356848e+06	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Migrado desde proyeccion legacy	2026-05-20 16:01:46	2026-05-20 16:01:46
e7ce2f90-0303-47ad-87c7-a74f301b9c5e	8dcfec48-a2fd-49de-a6e3-e38078d133a3	2	48.7	\N	39759	\N	1.9369752e+06	1.9369752e+06	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Migrado desde proyeccion legacy	2026-05-20 16:01:46	2026-05-20 16:01:46
7a7aba18-fab1-4c43-a3a9-48848b4e7f32	8dcfec48-a2fd-49de-a6e3-e38078d133a3	3	18	\N	39834	\N	717150.94	717150.94	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Migrado desde proyeccion legacy	2026-05-20 16:01:46	2026-05-20 16:01:46
4dd690a6-6d9e-45f0-befb-bc701182d499	8dcfec48-a2fd-49de-a6e3-e38078d133a3	4	18	\N	40054	\N	718103	718103	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Migrado desde proyeccion legacy	2026-05-20 16:01:46	2026-05-20 16:01:46
d365cf66-d6f1-41b8-bef2-ba8d590e7716	8dcfec48-a2fd-49de-a6e3-e38078d133a3	5	18	\N	40424	\N	724926.44	724926.44	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Migrado desde proyeccion legacy	2026-05-20 16:01:46	2026-05-20 16:01:46
03f8cff0-dc1f-46dd-bffb-e0d5347ea2a8	8dcfec48-a2fd-49de-a6e3-e38078d133a3	6	18	\N	39857	\N	720000	720000	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Migrado desde proyeccion legacy	2026-05-20 16:01:46	2026-05-20 16:01:46
924d773f-f82e-482d-9a69-36b2fa13a747	8dcfec48-a2fd-49de-a6e3-e38078d133a3	7	\N	\N	39700	\N	720000	720000	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Migrado desde proyeccion legacy	2026-05-20 16:01:46	2026-05-20 16:01:46
9ae5eb88-8252-4553-98c5-c4c8a426781c	8dcfec48-a2fd-49de-a6e3-e38078d133a3	8	\N	\N	39763	\N	720000	720000	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Migrado desde proyeccion legacy	2026-05-20 16:01:46	2026-05-20 16:01:46
c93e148c-e878-46d6-baec-876ecb37d44f	8dcfec48-a2fd-49de-a6e3-e38078d133a3	9	\N	\N	39800	\N	720000	720000	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Migrado desde proyeccion legacy	2026-05-20 16:01:46	2026-05-20 16:01:46
444272a3-5c03-4d87-b870-ec94cee57687	8dcfec48-a2fd-49de-a6e3-e38078d133a3	10	\N	\N	39806	\N	720000	720000	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Migrado desde proyeccion legacy	2026-05-20 16:01:46	2026-05-20 16:01:46
2b299df3-5941-4b4c-9617-7e0bfd5c2839	8dcfec48-a2fd-49de-a6e3-e38078d133a3	11	\N	\N	\N	\N	720000	720000	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Migrado desde proyeccion legacy	2026-05-20 16:01:46	2026-05-20 16:01:46
e8535d58-ed32-4e83-9d02-5cb09682d596	8dcfec48-a2fd-49de-a6e3-e38078d133a3	12	\N	\N	39933	\N	720000	720000	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Migrado desde proyeccion legacy	2026-05-20 16:01:46	2026-05-20 16:01:46
ea187bc0-cfde-429a-ae3c-665dc93be575	8dd838e9-603f-41b4-acf4-91e5e29c3e15	1	5.4093647	\N	39723	\N	214629.58	214629.58	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Migrado desde proyeccion legacy	2026-05-20 16:01:46	2026-05-20 16:01:46
2d7bbf15-e997-4324-9f60-ab558f16b760	e4f68cf8-736c-4b0b-94f5-4860f69ec2af	5	100	\N	40424	\N	4e+06	4e+06	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Migrado desde proyeccion legacy	2026-05-20 16:01:46	2026-05-20 16:01:46
56d62f01-2205-4d9f-b908-81d03cfb70b1	e4f68cf8-736c-4b0b-94f5-4860f69ec2af	6	94	\N	39857	\N	3.7451218e+06	3.7451218e+06	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Migrado desde proyeccion legacy	2026-05-20 16:01:46	2026-05-20 16:01:46
a887a133-1337-43c5-a385-d05163cdf39e	adc89b8a-77e7-4943-ad7c-7f312a527f5b	1	35	\N	39723	\N	1.3905202e+06	1.3905202e+06	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Migrado desde proyeccion legacy	2026-05-20 16:01:46	2026-05-20 16:01:46
8cf0a55a-d477-422d-8aad-bfef3c87413d	adc89b8a-77e7-4943-ad7c-7f312a527f5b	3	70	\N	39834	\N	2.787728e+06	2.787728e+06	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Migrado desde proyeccion legacy	2026-05-20 16:01:46	2026-05-20 16:01:46
ea6bfb31-c6c3-461c-8382-c8efabfaf004	adc89b8a-77e7-4943-ad7c-7f312a527f5b	4	35	\N	40054	\N	1.3963114e+06	1.3963114e+06	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Migrado desde proyeccion legacy	2026-05-20 16:01:46	2026-05-20 16:01:46
235cfd63-4a8a-4c60-9365-e11fdc388205	adc89b8a-77e7-4943-ad7c-7f312a527f5b	5	35	\N	40424	\N	1.4070042e+06	1.4070042e+06	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Migrado desde proyeccion legacy	2026-05-20 16:01:46	2026-05-20 16:01:46
c852869d-2466-406a-a12a-f828002fed96	adc89b8a-77e7-4943-ad7c-7f312a527f5b	6	35	\N	39857	\N	1.393e+06	1.393e+06	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Migrado desde proyeccion legacy	2026-05-20 16:01:46	2026-05-20 16:01:46
8c0de1dc-cde9-47f0-82a9-27e557afa274	adc89b8a-77e7-4943-ad7c-7f312a527f5b	7	\N	\N	39700	\N	1.393e+06	1.393e+06	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Migrado desde proyeccion legacy	2026-05-20 16:01:46	2026-05-20 16:01:46
a77e979b-7f6c-47df-b763-97a4bf4490fd	adc89b8a-77e7-4943-ad7c-7f312a527f5b	8	\N	\N	39763	\N	1.393e+06	1.393e+06	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Migrado desde proyeccion legacy	2026-05-20 16:01:46	2026-05-20 16:01:46
f256723d-f111-4eab-b8ea-50fca127a899	adc89b8a-77e7-4943-ad7c-7f312a527f5b	9	\N	\N	39800	\N	1.393e+06	1.393e+06	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Migrado desde proyeccion legacy	2026-05-20 16:01:46	2026-05-20 16:01:46
bf06b7b9-1782-43d0-9503-586e597a464a	adc89b8a-77e7-4943-ad7c-7f312a527f5b	10	\N	\N	39806	\N	1.393e+06	1.393e+06	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Migrado desde proyeccion legacy	2026-05-20 16:01:46	2026-05-20 16:01:46
84003fa3-a730-4fbc-afb5-2fc43585aa76	adc89b8a-77e7-4943-ad7c-7f312a527f5b	11	\N	\N	\N	\N	1.393e+06	1.393e+06	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Migrado desde proyeccion legacy	2026-05-20 16:01:46	2026-05-20 16:01:46
371f4c37-3bd6-4f75-83f4-b951d93992ed	adc89b8a-77e7-4943-ad7c-7f312a527f5b	12	\N	\N	39933	\N	1.393e+06	1.393e+06	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Migrado desde proyeccion legacy	2026-05-20 16:01:46	2026-05-20 16:01:46
6800e971-9bff-4e49-be10-55c2690ffa05	58973a95-3985-45a7-aab1-4f8ad8c4b9d5	2	60	\N	39759	\N	2.3840365e+06	2.3840365e+06	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Migrado desde proyeccion legacy	2026-05-20 16:01:46	2026-05-20 16:01:46
f045fc03-2261-497c-b521-75f3dc2f61e0	58973a95-3985-45a7-aab1-4f8ad8c4b9d5	3	120	\N	39834	\N	4.7810065e+06	4.7810065e+06	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Migrado desde proyeccion legacy	2026-05-20 16:01:46	2026-05-20 16:01:46
f8514711-52a0-43c7-9aeb-43b7bf603b2f	58973a95-3985-45a7-aab1-4f8ad8c4b9d5	4	60	\N	40054	\N	2.4112075e+06	2.4112075e+06	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Migrado desde proyeccion legacy	2026-05-20 16:01:46	2026-05-20 16:01:46
ec9eccb4-ed96-44dd-8e46-936212e2eebf	58973a95-3985-45a7-aab1-4f8ad8c4b9d5	5	60	\N	40424	\N	2.4112075e+06	2.4112075e+06	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Migrado desde proyeccion legacy	2026-05-20 16:01:46	2026-05-20 16:01:46
fe3af80f-b472-4702-b8c9-b91444b61b9c	58973a95-3985-45a7-aab1-4f8ad8c4b9d5	6	60	\N	39857	\N	2.37e+06	2.37e+06	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Migrado desde proyeccion legacy	2026-05-20 16:01:46	2026-05-20 16:01:46
6220933e-7e9b-434b-80cf-d9e34275b465	ad864312-a0f5-4f74-8201-876bad927fb4	1	\N	\N	39723	\N	\N	\N	UF_PROYECTADA	\N	RECALCULADO	0		2026-05-20 16:06:56	2026-05-20 16:07:55
cd8c6ad1-621d-4288-a0bd-048f49e4296e	ad864312-a0f5-4f74-8201-876bad927fb4	2	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
41d1ff19-9cf7-4c98-abc1-3d99c0b2169a	ad864312-a0f5-4f74-8201-876bad927fb4	3	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
cad4ba22-e2c1-43b5-84ef-b598d300cd99	ad864312-a0f5-4f74-8201-876bad927fb4	4	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
8d36e489-504e-460d-8a22-80b861c19d18	ad864312-a0f5-4f74-8201-876bad927fb4	6	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
bf5510dd-6482-4d79-a79a-c0def3782e76	ad864312-a0f5-4f74-8201-876bad927fb4	7	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
786380d3-ff57-45ec-b37e-2a60687b4710	ad864312-a0f5-4f74-8201-876bad927fb4	8	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
38573135-320a-4565-80f8-ac2bbcc65372	ad864312-a0f5-4f74-8201-876bad927fb4	9	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
911a87e1-19e0-40a3-8ac2-43eaecfdccf5	ad864312-a0f5-4f74-8201-876bad927fb4	10	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
875471c6-3067-464b-9e40-15256030fa86	ad864312-a0f5-4f74-8201-876bad927fb4	11	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
921c71da-6e97-4730-b72e-5cb22e082911	ad864312-a0f5-4f74-8201-876bad927fb4	12	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
65d4377e-c489-4857-9e1e-0c97f9bdd20e	7c780c8e-1bd4-4983-bfb5-afbdbb5710d7	2	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
9f56fbf1-d38d-40c1-abdc-70fa6679b20b	7c780c8e-1bd4-4983-bfb5-afbdbb5710d7	3	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
c06a70b2-7caa-407f-b205-a4a50f988163	7c780c8e-1bd4-4983-bfb5-afbdbb5710d7	4	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
79aba563-84fe-4505-85b7-09350facc9bd	7c780c8e-1bd4-4983-bfb5-afbdbb5710d7	6	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
1322b05f-bfea-4ee8-8e19-63b25ceb0c51	7c780c8e-1bd4-4983-bfb5-afbdbb5710d7	7	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
774cb8b2-8857-4536-9b55-9a175394eefd	7c780c8e-1bd4-4983-bfb5-afbdbb5710d7	8	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
7d4c74b2-2947-4ab1-b052-fa186268085f	7c780c8e-1bd4-4983-bfb5-afbdbb5710d7	9	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
d511db3b-0941-49a2-ab74-672b22a38f3e	7c780c8e-1bd4-4983-bfb5-afbdbb5710d7	10	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
e5728a1c-a5e3-4f12-8955-7d8fb5943f3d	7c780c8e-1bd4-4983-bfb5-afbdbb5710d7	11	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
1f578e27-1fc0-498e-b72b-aab324154963	7c780c8e-1bd4-4983-bfb5-afbdbb5710d7	12	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
17646709-1fd3-4322-bd5e-d098f063d80d	cee7ef13-dfdc-4053-846a-9416534a82a2	1	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
b36bd6e6-1c63-4900-ab19-5cfa4a5f76cd	cee7ef13-dfdc-4053-846a-9416534a82a2	2	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
71db2c52-e5ef-4de9-a948-a8a76f60a554	cee7ef13-dfdc-4053-846a-9416534a82a2	3	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
2a6d6bea-fd77-4fd1-9e29-5dbb4e17e4a6	cee7ef13-dfdc-4053-846a-9416534a82a2	4	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
c23fba63-f59c-4de2-acb0-5e9cd328071e	cee7ef13-dfdc-4053-846a-9416534a82a2	6	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
8418751b-5394-421d-9a03-21aef3cc980f	cee7ef13-dfdc-4053-846a-9416534a82a2	7	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
5eae1086-4565-488c-8d3e-fae4563101bd	cee7ef13-dfdc-4053-846a-9416534a82a2	8	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
e5bc7ba1-96b6-434e-8708-c6add3b510e1	cee7ef13-dfdc-4053-846a-9416534a82a2	9	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
a2813060-8f27-44f0-93ac-f46c7634a2f3	cee7ef13-dfdc-4053-846a-9416534a82a2	10	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
451cfe0f-a1d4-4779-ab5f-06b9979b53cb	cee7ef13-dfdc-4053-846a-9416534a82a2	11	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
c8d20fd2-9cac-4c1a-9988-9ed1d48dfc43	cee7ef13-dfdc-4053-846a-9416534a82a2	12	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
b715b716-c551-4f4b-b8b0-d2f373e6746a	cff1ac1a-28a4-44c2-92ac-e85987155072	1	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
c7517f72-493e-4e01-a5ea-a9976b87213c	cff1ac1a-28a4-44c2-92ac-e85987155072	2	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
25c0a740-a1a2-4945-9af1-8af9f5787f0b	cff1ac1a-28a4-44c2-92ac-e85987155072	4	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
4b588e53-c2db-4beb-89e4-992eba37bbf1	cff1ac1a-28a4-44c2-92ac-e85987155072	5	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
101eab38-4392-4be7-a0a2-d7d133d62e40	cff1ac1a-28a4-44c2-92ac-e85987155072	6	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
cb21f699-f889-437d-bcfa-c6d6073a9b61	cff1ac1a-28a4-44c2-92ac-e85987155072	7	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
62d1d7d5-8e4d-405b-bfd8-ca0a7856cb16	cff1ac1a-28a4-44c2-92ac-e85987155072	8	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
3c613ec9-db7c-483c-9d79-883f2c4b7f4a	cff1ac1a-28a4-44c2-92ac-e85987155072	9	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
fea3bd93-6a3e-40ba-8ce6-72a6fe894f08	cff1ac1a-28a4-44c2-92ac-e85987155072	10	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
57c41c1a-71d1-4f36-83b3-73eec03095ad	cff1ac1a-28a4-44c2-92ac-e85987155072	11	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
689ea694-77c7-400e-8c19-d075339e286d	cff1ac1a-28a4-44c2-92ac-e85987155072	12	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
70652063-fa54-4048-b6e9-ec37d9db0e03	160cd851-8e9b-481d-acaa-0f584905123a	1	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
acbb1916-ed5e-4b73-830a-e761758a8997	160cd851-8e9b-481d-acaa-0f584905123a	2	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
c790ee68-f8d4-44b1-a3ca-e8cbaa32b3d7	160cd851-8e9b-481d-acaa-0f584905123a	3	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
16d5bb1f-3e16-48e8-bc59-2ab2de2dc1ca	160cd851-8e9b-481d-acaa-0f584905123a	4	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
dd4d6c29-d5bc-48de-adab-f0892701189a	160cd851-8e9b-481d-acaa-0f584905123a	6	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
79188a0e-25ea-4ad4-b9f6-d1d944f49384	160cd851-8e9b-481d-acaa-0f584905123a	7	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
c6c07064-a0d2-4527-8a96-08d66d39dd2e	160cd851-8e9b-481d-acaa-0f584905123a	8	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
ec5b8643-7e52-4fee-8cf5-1918588c5f01	160cd851-8e9b-481d-acaa-0f584905123a	9	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
2a703a07-6c38-40dc-845d-3228e3fe25f1	160cd851-8e9b-481d-acaa-0f584905123a	10	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
6ace4221-10e6-41bf-bbf3-f65e45fb2545	160cd851-8e9b-481d-acaa-0f584905123a	11	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
1fa62ffa-cae0-48ad-9835-6cb0f8c8456d	160cd851-8e9b-481d-acaa-0f584905123a	12	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
273f05e6-7696-4625-b67e-5169abfa14e6	9717107a-a93a-41b5-b234-0c5f929a5750	1	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
f65e6ed2-aa09-4d2c-8885-6ff9d29c0ba9	9717107a-a93a-41b5-b234-0c5f929a5750	2	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
a11419f7-649c-4dc0-98af-ae4154e73249	9717107a-a93a-41b5-b234-0c5f929a5750	3	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
c11a2f41-ff31-4d96-8194-217e9622fc7e	9717107a-a93a-41b5-b234-0c5f929a5750	4	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
e70b866e-f840-4aa6-b082-060021791e77	9717107a-a93a-41b5-b234-0c5f929a5750	6	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
c547a4c0-0120-4e9a-86ad-6d74ddc185ce	9717107a-a93a-41b5-b234-0c5f929a5750	7	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
ef280b37-03d4-45be-a085-8110d24ffff6	9717107a-a93a-41b5-b234-0c5f929a5750	8	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
a437dc4e-b6fc-4cd0-a10e-18113767bae2	9717107a-a93a-41b5-b234-0c5f929a5750	9	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
3686a20c-2c9f-45c9-ba07-5f5b5cb0b7f4	9717107a-a93a-41b5-b234-0c5f929a5750	10	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
48fba001-a48d-4ff1-a734-fc4ec061169a	9717107a-a93a-41b5-b234-0c5f929a5750	11	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
ef7dcef2-eaf8-476e-9f7d-43049a1a8730	9717107a-a93a-41b5-b234-0c5f929a5750	12	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
ba091608-1ab2-4c08-8988-8a4a35e269f2	a76490ef-3b9c-4270-8610-d33f3bf94420	1	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
5632827d-bb16-49a2-899b-0cbd22ca157b	a76490ef-3b9c-4270-8610-d33f3bf94420	2	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
05fd781b-3fd2-4daf-9f80-8942bff90750	a76490ef-3b9c-4270-8610-d33f3bf94420	3	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
cf578dc6-bee0-41f0-be05-78b965e4a4a5	a76490ef-3b9c-4270-8610-d33f3bf94420	4	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
a56f1563-603b-4298-ad5c-01f959e1aeac	a76490ef-3b9c-4270-8610-d33f3bf94420	6	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
22523e64-68cf-4b92-ad25-5d05d41fecfa	a76490ef-3b9c-4270-8610-d33f3bf94420	7	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
a8bc9970-960c-4562-8c91-853c75407c70	a76490ef-3b9c-4270-8610-d33f3bf94420	8	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
5c2e704a-9319-4b8d-a96b-52ca79ba2614	a76490ef-3b9c-4270-8610-d33f3bf94420	9	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
1b98ef4e-8cbc-413c-962c-b4272491695c	a76490ef-3b9c-4270-8610-d33f3bf94420	10	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
b7da9d52-490f-485a-b65e-f63844a26eba	a76490ef-3b9c-4270-8610-d33f3bf94420	11	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
7284ecc9-0baf-449a-b714-0e71b0b8d5fb	a76490ef-3b9c-4270-8610-d33f3bf94420	12	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
06dbf213-9458-4092-a5f7-4c779bd97370	df7a797c-5348-468d-8391-b250df385e83	2	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
ee8b5177-15b4-443c-a2ee-5d016ad63f57	df7a797c-5348-468d-8391-b250df385e83	3	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
c875d523-232b-4a15-b4f6-4e26c809c776	df7a797c-5348-468d-8391-b250df385e83	4	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
1d0e1106-917b-45f6-abd5-84208d91265d	df7a797c-5348-468d-8391-b250df385e83	6	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
689c13eb-1cb9-438e-93db-b2851f3069f4	df7a797c-5348-468d-8391-b250df385e83	7	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
aadd2c0e-10ae-4f8e-96b6-386f09071ade	df7a797c-5348-468d-8391-b250df385e83	8	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
f7ea6a47-733d-4c95-9792-e76846064899	df7a797c-5348-468d-8391-b250df385e83	9	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
8f591c38-7454-4ac9-8826-09306cf5b6ac	df7a797c-5348-468d-8391-b250df385e83	10	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
c24f57b7-0f85-4b93-aebb-6e77c05b4a36	df7a797c-5348-468d-8391-b250df385e83	11	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
cf4e41b6-ecb1-4b22-892e-a64e33b1ad27	df7a797c-5348-468d-8391-b250df385e83	12	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
9ce147e5-3295-47e2-8d2c-0391d6bc3b69	8e2e3294-0c87-4f27-9457-97d8d5e4ce25	1	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
dcb95f76-016c-42ca-8bef-9a03b5206038	8e2e3294-0c87-4f27-9457-97d8d5e4ce25	2	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
6e91398d-ccea-4f7f-896b-44d78ee0ec32	8e2e3294-0c87-4f27-9457-97d8d5e4ce25	3	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
12614a29-92fe-4c41-bb9f-bd154a9f7608	8e2e3294-0c87-4f27-9457-97d8d5e4ce25	4	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
01357e3f-fac2-41f9-9ca1-70eb1197bfdf	8e2e3294-0c87-4f27-9457-97d8d5e4ce25	6	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
37833d3b-2fdf-4b01-9104-1b28886b8bf7	8e2e3294-0c87-4f27-9457-97d8d5e4ce25	7	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
1be8da78-feaa-48ff-a598-d85c8c313576	8e2e3294-0c87-4f27-9457-97d8d5e4ce25	8	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
a9fda349-7330-4442-934b-fddfd5b3641c	8e2e3294-0c87-4f27-9457-97d8d5e4ce25	9	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
03c5bd38-16da-4f79-a2e1-f6f564af8538	8e2e3294-0c87-4f27-9457-97d8d5e4ce25	10	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
501b9dc5-bdce-49e9-bb19-3f27a2ed6746	8e2e3294-0c87-4f27-9457-97d8d5e4ce25	11	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
0ea54905-882b-4a70-8eb3-b21488cec129	8e2e3294-0c87-4f27-9457-97d8d5e4ce25	12	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
3f8cc0b2-139c-421a-b6f0-1eb07c3dac88	1fda0fe7-3db6-4e9f-9057-f43ed66ac89e	1	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
f2458f63-0413-43df-8dc8-f43757a398da	1fda0fe7-3db6-4e9f-9057-f43ed66ac89e	2	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
0460ca43-d66b-434e-93b4-d91b71ba350a	1fda0fe7-3db6-4e9f-9057-f43ed66ac89e	3	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
3c0cd4f5-44df-4e43-bf38-f0c5a526cc64	1fda0fe7-3db6-4e9f-9057-f43ed66ac89e	4	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
a70166ef-5fb8-4444-91c3-91474b145128	1fda0fe7-3db6-4e9f-9057-f43ed66ac89e	5	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
3c62cc2f-6d55-4322-9f32-a05f0a5b3ef0	1fda0fe7-3db6-4e9f-9057-f43ed66ac89e	6	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
e7847c5a-76d2-4469-b393-57d877a140e9	1fda0fe7-3db6-4e9f-9057-f43ed66ac89e	7	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
db31ead7-f8a6-43ba-ad84-46473c5267ac	1fda0fe7-3db6-4e9f-9057-f43ed66ac89e	8	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
da72ca3b-cbbd-4bf3-9c8f-a0803d31f03b	1fda0fe7-3db6-4e9f-9057-f43ed66ac89e	9	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
a15d811d-5e0e-4c60-a395-1872962d5080	1fda0fe7-3db6-4e9f-9057-f43ed66ac89e	11	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
b7a2cfa1-e17d-4a6f-8a64-dbb6ae3e8b5a	0579e28f-b5f8-46a3-a86d-de76f28f0f09	1	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
765a0788-d4e7-4a18-93b7-36c570f2c3e8	0579e28f-b5f8-46a3-a86d-de76f28f0f09	2	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
75375feb-6233-4b79-8de5-e3c71db24096	0579e28f-b5f8-46a3-a86d-de76f28f0f09	3	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
bfb15b36-f6e1-443c-9e05-8b3306e15344	0579e28f-b5f8-46a3-a86d-de76f28f0f09	4	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
3fdddf46-3081-4201-913b-0c6c8d4c6b12	0579e28f-b5f8-46a3-a86d-de76f28f0f09	5	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
a1cce18a-48a9-499d-ba1b-9feb835b18dd	0579e28f-b5f8-46a3-a86d-de76f28f0f09	7	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
cc41015d-bf68-44ae-9b58-c7dffb579cf9	0579e28f-b5f8-46a3-a86d-de76f28f0f09	9	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
65c574d4-4106-43a2-9fad-e5cb22b288f5	0579e28f-b5f8-46a3-a86d-de76f28f0f09	11	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
4e97fa0e-7c48-403a-bdc0-bdfef0139803	0579e28f-b5f8-46a3-a86d-de76f28f0f09	12	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
257dd1b9-210d-4fb1-8c8a-b234d68f170e	03e50f70-ef8a-4354-9122-5e075c5a6fd9	1	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
3bd8f3eb-1519-4097-b660-1ef264cf48d6	03e50f70-ef8a-4354-9122-5e075c5a6fd9	3	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
00b1100f-e65e-4ac4-ab30-c86d27ea673b	03e50f70-ef8a-4354-9122-5e075c5a6fd9	4	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
0f1e6308-1b6c-4997-b481-8769789089e2	03e50f70-ef8a-4354-9122-5e075c5a6fd9	5	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
40db2e2f-d0e5-465e-89a9-35103fd23d38	03e50f70-ef8a-4354-9122-5e075c5a6fd9	6	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
8b7de2f0-ec39-43d6-bd58-67412d635e30	03e50f70-ef8a-4354-9122-5e075c5a6fd9	7	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
3065ad66-4f0c-4855-9008-e167be477001	03e50f70-ef8a-4354-9122-5e075c5a6fd9	8	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
a49fe266-5de9-4843-aa9e-87a001e81cee	03e50f70-ef8a-4354-9122-5e075c5a6fd9	9	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
521e9227-bbb3-4ca3-9371-2a2defcd0f7b	03e50f70-ef8a-4354-9122-5e075c5a6fd9	10	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
a35a8db1-597e-4ed5-8382-128bd0db23dd	03e50f70-ef8a-4354-9122-5e075c5a6fd9	11	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
ec9ec645-eae5-4f08-bdd6-9e09ec8dd25b	03e50f70-ef8a-4354-9122-5e075c5a6fd9	12	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
2a19648e-3d50-4a1f-9cf3-3effe3c317d3	23488cf2-a5b7-4984-a8f3-dfba0e0c65d6	1	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
339bd53e-ef49-4873-9e3c-a821c2f9d164	23488cf2-a5b7-4984-a8f3-dfba0e0c65d6	2	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
a12ea7ee-b078-40c9-9988-d53292b95d6f	23488cf2-a5b7-4984-a8f3-dfba0e0c65d6	3	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
e183faa9-8507-4088-87fe-619d4723d10b	23488cf2-a5b7-4984-a8f3-dfba0e0c65d6	4	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
19680844-0faf-4f62-8deb-9320b2775fcb	23488cf2-a5b7-4984-a8f3-dfba0e0c65d6	5	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
209ee617-3600-4a1d-b850-55bfdf16b339	23488cf2-a5b7-4984-a8f3-dfba0e0c65d6	6	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
38fc62e8-7e81-42aa-8104-e24d8f6c4618	23488cf2-a5b7-4984-a8f3-dfba0e0c65d6	7	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
3613b09a-89af-481f-8272-540b21a20573	23488cf2-a5b7-4984-a8f3-dfba0e0c65d6	9	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
25947350-7be4-49e8-8274-ab708577ea72	23488cf2-a5b7-4984-a8f3-dfba0e0c65d6	10	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
16e64451-0a03-4278-abfb-1a6d741c0001	23488cf2-a5b7-4984-a8f3-dfba0e0c65d6	11	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
c6f91abe-b8b5-4c12-9343-4e6c0d98e62a	23488cf2-a5b7-4984-a8f3-dfba0e0c65d6	12	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
852254b1-7200-45c2-8584-08dd136e8f0d	0e81bbe9-ec94-419e-852d-2c3a45e7807e	1	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
c60037a5-5740-4d37-88a6-72084b4d82ea	0e81bbe9-ec94-419e-852d-2c3a45e7807e	2	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
f00774ec-cfde-4917-b7bc-89a84dc92680	0e81bbe9-ec94-419e-852d-2c3a45e7807e	3	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
c863c972-a2d0-4e8f-b5e4-44bd55518ab4	0e81bbe9-ec94-419e-852d-2c3a45e7807e	4	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
7ee72753-cd41-4743-b808-181fa47838f7	0e81bbe9-ec94-419e-852d-2c3a45e7807e	6	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
64474d34-2c00-4b0a-a32a-93ecf27c31ae	0e81bbe9-ec94-419e-852d-2c3a45e7807e	7	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
a13512e5-6c3d-4d32-af25-15f5b7f6f80c	0e81bbe9-ec94-419e-852d-2c3a45e7807e	9	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
053d5c57-b91a-48f5-8e40-df64e33afc2f	0e81bbe9-ec94-419e-852d-2c3a45e7807e	10	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
d0e87828-99ce-4d57-ba7e-558354cdb54b	0e81bbe9-ec94-419e-852d-2c3a45e7807e	11	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
3d114832-398e-4854-a3b1-2d1441e12731	0e81bbe9-ec94-419e-852d-2c3a45e7807e	12	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
c8b32e22-3fb3-4c4b-b86c-7b637c779632	ccdb6ab1-f7ba-4c32-9808-b40096dc7713	1	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
2482cc03-4c18-421e-a1b0-d74090f55d52	ccdb6ab1-f7ba-4c32-9808-b40096dc7713	2	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
2afc4dec-a15a-44a0-8f2a-3f7ed9fb8df3	ccdb6ab1-f7ba-4c32-9808-b40096dc7713	3	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
de7db4b1-3ded-428c-869a-a64cd9826198	ccdb6ab1-f7ba-4c32-9808-b40096dc7713	4	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
679fb024-bb8f-4c77-b37f-49a296704c07	ccdb6ab1-f7ba-4c32-9808-b40096dc7713	5	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
65e511fd-b225-4e48-826a-cdaebe3beede	ccdb6ab1-f7ba-4c32-9808-b40096dc7713	6	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
db97bb62-270e-4f48-baf9-b8a9602da50b	ccdb6ab1-f7ba-4c32-9808-b40096dc7713	7	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
71b5f781-2b56-4b93-b331-20c5a174cd2b	ccdb6ab1-f7ba-4c32-9808-b40096dc7713	9	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
ccccd049-a714-4534-ae87-a003001e6f2a	ccdb6ab1-f7ba-4c32-9808-b40096dc7713	10	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
0530ba06-164f-43e2-a674-c0c5b63241fc	ccdb6ab1-f7ba-4c32-9808-b40096dc7713	11	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
e5ac9eca-672e-4bcf-8848-3db0bfe75d6d	ccdb6ab1-f7ba-4c32-9808-b40096dc7713	12	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
3d49ca3d-7c1a-4679-b0ed-e3eee686d95f	b548fb52-48f6-4288-81e9-6624603f9c03	4	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
839ee9f9-f046-47ad-b8a1-e142b8c20adf	b548fb52-48f6-4288-81e9-6624603f9c03	5	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
d2138fbb-a781-4832-baf1-aa988646e40e	b548fb52-48f6-4288-81e9-6624603f9c03	6	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
117fd3f8-c47d-45af-a943-0485cc9e707b	b548fb52-48f6-4288-81e9-6624603f9c03	7	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
7f0aace7-9c59-4084-b03f-66aec781b469	b548fb52-48f6-4288-81e9-6624603f9c03	8	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
bb4f03ea-b40c-4b25-96e8-74982183c9bd	b548fb52-48f6-4288-81e9-6624603f9c03	9	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
d13feb5c-d212-4594-aeb8-1fe81931ec86	b548fb52-48f6-4288-81e9-6624603f9c03	10	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
e5a30421-2553-445a-acea-9ba233cde342	b548fb52-48f6-4288-81e9-6624603f9c03	11	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
674d91dc-6973-41f6-93fe-d9aac81f00bb	b548fb52-48f6-4288-81e9-6624603f9c03	12	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
960452a7-65b8-418e-85a2-b5c842533a00	82df8a7c-6b5b-405f-9ecc-86a393b6c33a	1	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
d166cb48-7cc6-4ac1-a6d3-1684aaf90640	82df8a7c-6b5b-405f-9ecc-86a393b6c33a	2	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
5f33e07f-a85d-440f-9837-8c845652e913	82df8a7c-6b5b-405f-9ecc-86a393b6c33a	3	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
45e15a27-6b2b-469f-9bff-a98d21f6f3d7	82df8a7c-6b5b-405f-9ecc-86a393b6c33a	4	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
da7c8b81-7ad1-41c5-a70f-cfd56d81ef82	82df8a7c-6b5b-405f-9ecc-86a393b6c33a	5	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
4b8040ae-e8e1-4151-b206-c15e7e738735	82df8a7c-6b5b-405f-9ecc-86a393b6c33a	7	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
f7fed9bf-bf12-4305-9e55-950b79ca6256	82df8a7c-6b5b-405f-9ecc-86a393b6c33a	8	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
0e358dfe-28f2-4ecd-a948-9e9420ef22c5	82df8a7c-6b5b-405f-9ecc-86a393b6c33a	9	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
3d1d3590-c314-4c51-b21d-4bd77133a249	82df8a7c-6b5b-405f-9ecc-86a393b6c33a	10	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
3bc37ce4-4a05-404a-923a-a497f3082e00	82df8a7c-6b5b-405f-9ecc-86a393b6c33a	11	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
bb654359-67d2-4355-9ce4-97d20e4040d9	82df8a7c-6b5b-405f-9ecc-86a393b6c33a	12	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
b1d1a8ee-e7fd-4294-b5de-8dcf88c620ae	3b21d650-233f-47aa-9367-1bb89f3513ce	1	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
04b205b4-b749-4698-9fbe-b0530023e12a	3b21d650-233f-47aa-9367-1bb89f3513ce	2	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
30acda93-e15e-477c-978a-3a0b3848ccb7	3b21d650-233f-47aa-9367-1bb89f3513ce	3	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
46ee7282-ce2b-4ba0-8890-86b8796780e6	3b21d650-233f-47aa-9367-1bb89f3513ce	4	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
07297c0e-844a-4377-9a99-176441e4859c	3b21d650-233f-47aa-9367-1bb89f3513ce	5	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
35117505-6308-480b-a49f-973e7419c5fa	3b21d650-233f-47aa-9367-1bb89f3513ce	7	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
864886b3-fe85-46fc-b134-77c29289001c	3b21d650-233f-47aa-9367-1bb89f3513ce	8	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
6a30a2e6-aaf4-4080-893e-2111b85b1d54	3b21d650-233f-47aa-9367-1bb89f3513ce	9	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
077740fc-0198-4163-a49f-4c8fc1f5b422	3b21d650-233f-47aa-9367-1bb89f3513ce	10	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
74a0f356-8cf4-431a-a1ff-98dbab63f304	3b21d650-233f-47aa-9367-1bb89f3513ce	11	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
9bcde25b-e45c-4a92-81fa-9db8f6cc0cbc	3b21d650-233f-47aa-9367-1bb89f3513ce	12	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
f7333728-455d-4323-bd30-fb06b8c367fe	67150288-c28f-445c-870f-eb7a3c4f166c	2	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
5e71322e-eaeb-4ca6-ab39-92e119eccda3	67150288-c28f-445c-870f-eb7a3c4f166c	4	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
459a79ec-ca68-44aa-85bc-d069cb05d707	67150288-c28f-445c-870f-eb7a3c4f166c	6	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
9ba6dbcb-db78-481e-815b-af40b7b8a6b6	67150288-c28f-445c-870f-eb7a3c4f166c	7	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
5574645e-c724-48c8-9b1a-a8efadbbea79	67150288-c28f-445c-870f-eb7a3c4f166c	8	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
8d950dbd-9ae0-4f41-b70f-59f6b2775e2f	67150288-c28f-445c-870f-eb7a3c4f166c	9	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
8d0dff9a-6085-4bb7-84da-1aa2e378cb5a	67150288-c28f-445c-870f-eb7a3c4f166c	11	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
bdbc2be3-6ed9-4c35-a914-12a7f345a887	67150288-c28f-445c-870f-eb7a3c4f166c	12	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
29a736fc-7bce-4b5a-a8ff-a5b57a2fd7cf	480619b3-c78c-4bdb-b36f-abed605a80aa	1	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
a8b0d8b8-34b6-416d-aab5-b4863ae0f3f8	480619b3-c78c-4bdb-b36f-abed605a80aa	2	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
0fa6e333-4aca-4765-912d-5df75b0ed303	480619b3-c78c-4bdb-b36f-abed605a80aa	3	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
27e1f5be-43da-40c7-b24e-f29213ed8fe2	480619b3-c78c-4bdb-b36f-abed605a80aa	4	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
ee5e037e-7bdf-4c58-ba1f-e7f910649965	480619b3-c78c-4bdb-b36f-abed605a80aa	6	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
7bf11b8f-d0c1-4c67-8418-cca013b0817e	480619b3-c78c-4bdb-b36f-abed605a80aa	7	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
281ad33d-f2f3-4fe1-875b-9afe82fdc9f3	480619b3-c78c-4bdb-b36f-abed605a80aa	8	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
626532aa-092c-47e5-8c73-8f5762fc729c	480619b3-c78c-4bdb-b36f-abed605a80aa	9	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
d496eca5-971a-4467-a117-2f8e4fae7083	480619b3-c78c-4bdb-b36f-abed605a80aa	10	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
b3fea883-b88b-4163-b863-e3e8ccad27a9	480619b3-c78c-4bdb-b36f-abed605a80aa	11	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
3e1a6e5d-cffc-4aeb-b9bd-be3df509bf78	480619b3-c78c-4bdb-b36f-abed605a80aa	12	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
081fbc79-a8a8-4c1a-b8d2-1df3cf9dcf71	e69a6d4d-985a-436a-9f0f-dc2f72ddddf5	1	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
bd9efbf7-5172-4e3d-85f5-e2455bf4c655	e69a6d4d-985a-436a-9f0f-dc2f72ddddf5	2	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
944cf53d-1282-4f87-a979-e3fcae14da51	e69a6d4d-985a-436a-9f0f-dc2f72ddddf5	3	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
84e73884-9aee-468d-a1eb-b8494aac4a96	e69a6d4d-985a-436a-9f0f-dc2f72ddddf5	4	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
2983ddf2-96a2-4fd4-91fd-4f82affb96cc	e69a6d4d-985a-436a-9f0f-dc2f72ddddf5	6	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
2aa88a77-9854-4617-9601-35a4415699a6	e69a6d4d-985a-436a-9f0f-dc2f72ddddf5	7	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
2830f5b1-1c8a-46cf-bdb6-f5b87354327a	e69a6d4d-985a-436a-9f0f-dc2f72ddddf5	9	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
b5452830-79e6-4f25-98b3-8dffb85697c1	e69a6d4d-985a-436a-9f0f-dc2f72ddddf5	11	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
1f32b532-1c43-4d90-b2a8-97b6192ffa7e	e69a6d4d-985a-436a-9f0f-dc2f72ddddf5	12	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
5fe40e0a-ffca-4a95-9589-0085d2e73ca7	787abf99-71f3-4d7a-ac55-fa4ae49ce5ce	1	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
dd8bee4d-a031-41e7-804b-c9466ec712bc	787abf99-71f3-4d7a-ac55-fa4ae49ce5ce	2	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
b71f8043-f3f2-4a39-81a3-36b6922334b5	787abf99-71f3-4d7a-ac55-fa4ae49ce5ce	4	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
a43a5b74-086e-4362-bdc2-eccf2ca15945	787abf99-71f3-4d7a-ac55-fa4ae49ce5ce	5	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
23be33da-d060-467f-aaf2-6d05cd14c8d2	787abf99-71f3-4d7a-ac55-fa4ae49ce5ce	6	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
88cfe440-31fc-4bfe-a5db-ba6388a6b18a	787abf99-71f3-4d7a-ac55-fa4ae49ce5ce	7	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
ab81cde5-4e29-427b-bf23-a48a0ea70705	787abf99-71f3-4d7a-ac55-fa4ae49ce5ce	8	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
c7b4d8e4-8b7d-41f4-97da-0f83cab34eae	787abf99-71f3-4d7a-ac55-fa4ae49ce5ce	9	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
2b02083c-649a-4b22-9780-e3858a1fbb28	787abf99-71f3-4d7a-ac55-fa4ae49ce5ce	11	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
fd211e5a-f52b-4ee1-b854-90094bd88476	787abf99-71f3-4d7a-ac55-fa4ae49ce5ce	12	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
1f0688fd-6c6d-4eac-bb44-c4096619d9e1	232390df-c04a-4b92-8f0b-5481ca4aabb2	1	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
903498e0-d6c4-414f-9980-ba2efdc34c47	232390df-c04a-4b92-8f0b-5481ca4aabb2	2	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
1627c985-2cc3-40b6-b1cd-579e1ac88a06	232390df-c04a-4b92-8f0b-5481ca4aabb2	3	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
a0380327-13b2-4406-942a-729d307d3703	232390df-c04a-4b92-8f0b-5481ca4aabb2	4	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
aa22353d-2fea-4aba-9ee5-788e6e7a8a5d	232390df-c04a-4b92-8f0b-5481ca4aabb2	5	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
50901898-cf9a-4abb-aa2c-a6c242ac3d39	232390df-c04a-4b92-8f0b-5481ca4aabb2	6	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
5084b198-54d2-4d21-a790-64ccbbe71d1d	232390df-c04a-4b92-8f0b-5481ca4aabb2	7	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
43675e2f-c7eb-43ae-8b14-3218b1826910	232390df-c04a-4b92-8f0b-5481ca4aabb2	9	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
cca5c367-6683-4fa2-a49f-f78d7b119876	232390df-c04a-4b92-8f0b-5481ca4aabb2	11	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
60ef38a7-423b-43bd-8969-ac2f654084b3	232390df-c04a-4b92-8f0b-5481ca4aabb2	12	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
b77222e4-4247-4e90-b902-9bdb3e730d1d	33ac5e83-20b4-4847-90ad-d6cae1d89c36	1	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
16d06163-4b03-4827-80a3-227f43e615aa	33ac5e83-20b4-4847-90ad-d6cae1d89c36	2	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
abd32cc5-6e4f-4343-9999-964192964978	33ac5e83-20b4-4847-90ad-d6cae1d89c36	3	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
04caebb0-30e1-46ad-b4b1-13ff50c7036e	33ac5e83-20b4-4847-90ad-d6cae1d89c36	4	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
e0ba0af3-d325-4caf-b129-0e485a57ea2f	33ac5e83-20b4-4847-90ad-d6cae1d89c36	6	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
ee860fe1-2178-4637-a8a1-54f93b04d1f5	33ac5e83-20b4-4847-90ad-d6cae1d89c36	8	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
423848f3-4de2-4ad1-90c3-3d01c884c80e	33ac5e83-20b4-4847-90ad-d6cae1d89c36	10	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
45ccb669-b2d7-49a1-a289-81f323e3de07	33ac5e83-20b4-4847-90ad-d6cae1d89c36	11	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
6c91a45c-5421-421d-99f7-c4fb92d58590	f807ebd0-085d-4292-bdc6-d9af68272971	1	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
4d14f647-af46-49bc-93e6-9abee2e17541	f807ebd0-085d-4292-bdc6-d9af68272971	2	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
b0f784d1-4042-44fc-bf57-c70ebbe4027b	f807ebd0-085d-4292-bdc6-d9af68272971	3	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
bd479b62-52f7-45c7-a78a-7b232679bd37	f807ebd0-085d-4292-bdc6-d9af68272971	4	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
58fae61e-cb09-431a-8b1e-944df2cc054c	f807ebd0-085d-4292-bdc6-d9af68272971	6	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
96aa13cb-f830-4323-9f7b-1ed38ed3c65e	f807ebd0-085d-4292-bdc6-d9af68272971	7	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
4438726c-2626-47a7-8ae5-8c8629a3ec6a	f807ebd0-085d-4292-bdc6-d9af68272971	8	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
fcb2a17e-967a-4da3-9504-443fc50a70ba	f807ebd0-085d-4292-bdc6-d9af68272971	9	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
ebcf41a2-8b13-41df-bc9a-f4621257a3ce	f807ebd0-085d-4292-bdc6-d9af68272971	11	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
85766306-bcb0-47c2-b5a0-259733d652f0	f807ebd0-085d-4292-bdc6-d9af68272971	12	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
42aa2b77-fdd5-460b-9069-46a4c9986dda	2969cccb-d399-4fe9-a355-fc1eacf2614c	1	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
79354caa-ed73-4733-9646-089bfd209546	2969cccb-d399-4fe9-a355-fc1eacf2614c	2	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
91149bcc-d14e-4838-91e3-be2407030dcc	2969cccb-d399-4fe9-a355-fc1eacf2614c	4	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
de0dec61-0c23-4ab6-96e0-9a89515bab5f	2969cccb-d399-4fe9-a355-fc1eacf2614c	5	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
6cc8f060-1c05-4dd6-a348-f72e71f38742	2969cccb-d399-4fe9-a355-fc1eacf2614c	6	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
df151559-3f39-4b1b-8e68-dd2b21a07789	2969cccb-d399-4fe9-a355-fc1eacf2614c	7	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
def4451f-0d8e-4390-8c30-178eaa10e3c2	2969cccb-d399-4fe9-a355-fc1eacf2614c	8	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
b565ed5a-04a4-4a72-8f76-8bb5ce232ad8	2969cccb-d399-4fe9-a355-fc1eacf2614c	9	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
02da0017-b461-4e79-a976-6cb8cc4fb31a	2969cccb-d399-4fe9-a355-fc1eacf2614c	10	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
7a35096a-535b-4caf-b816-f808b39d7e38	2969cccb-d399-4fe9-a355-fc1eacf2614c	11	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
d8fd3ab7-ddb0-4f78-b9a6-2f952a45ee9b	2969cccb-d399-4fe9-a355-fc1eacf2614c	12	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
697d27df-a104-4c94-8d0c-d203d8b8bcdc	8477af52-ad41-480f-8b82-d96942924402	1	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
c49e7648-8939-4718-b929-1f413b3d4f51	8477af52-ad41-480f-8b82-d96942924402	2	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
1ef2ca78-a02f-4cb6-8c07-9b9d2752c7d8	8477af52-ad41-480f-8b82-d96942924402	4	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
7d70eb4c-1600-4f79-81ca-0368cc345e92	8477af52-ad41-480f-8b82-d96942924402	5	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
6a8b08c9-f19d-40c7-a20f-3d1f16ac30bc	8477af52-ad41-480f-8b82-d96942924402	6	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
665519f8-212f-4ce8-b0ed-d52e90b47c27	8477af52-ad41-480f-8b82-d96942924402	7	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
e3824dc3-e3f2-4977-8d60-3e9caea8090c	8477af52-ad41-480f-8b82-d96942924402	8	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
40e6e8af-b0c5-4d03-9d8e-39e3a0c2090c	8477af52-ad41-480f-8b82-d96942924402	9	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
a995a436-ed59-41e5-82a7-6942acc906f3	8477af52-ad41-480f-8b82-d96942924402	10	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
bd2886ab-3b0d-425f-8a24-33e6dfe6cb22	8477af52-ad41-480f-8b82-d96942924402	11	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
1656c9b9-954c-4d9c-a9b8-3b17902bd97a	8477af52-ad41-480f-8b82-d96942924402	12	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
cea66746-f0ca-485e-af4c-48da193cf54a	85ae2aed-b0b9-4cc0-aa74-7a0254293823	1	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
72734c4c-e349-4faf-b3f1-f64b7ac30f49	85ae2aed-b0b9-4cc0-aa74-7a0254293823	2	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
9f9fbf32-bc55-4e06-9668-2faf9c595cdd	85ae2aed-b0b9-4cc0-aa74-7a0254293823	4	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
4e184e2a-4e9d-4d9b-829c-df66108f56fc	85ae2aed-b0b9-4cc0-aa74-7a0254293823	5	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
6c8449ff-9b1b-43a5-8fb2-555e0bfe1b47	85ae2aed-b0b9-4cc0-aa74-7a0254293823	6	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
6f300c9e-61b5-4b01-85d7-4f9c80c7e1e0	85ae2aed-b0b9-4cc0-aa74-7a0254293823	7	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
39e9b285-9425-49c6-8285-10bd9dfc50eb	85ae2aed-b0b9-4cc0-aa74-7a0254293823	8	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
3b022ebc-2ee1-4e0f-80ff-e103e93ca979	85ae2aed-b0b9-4cc0-aa74-7a0254293823	9	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
9ab7d397-93f5-4a7d-a4aa-6a334b54cae6	85ae2aed-b0b9-4cc0-aa74-7a0254293823	10	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
c67a66c0-e168-4bfc-a33e-ade0f025af86	85ae2aed-b0b9-4cc0-aa74-7a0254293823	11	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
d9f333d4-ff71-4128-ac47-a3ca8e6ff03b	85ae2aed-b0b9-4cc0-aa74-7a0254293823	12	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
b0e8c2e8-b545-449f-8876-66ec59e38584	699269f4-b66c-4f2e-aa6c-8d0ee2201b78	3	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
dbed0993-c771-4d0f-961a-6b025ce84aa7	699269f4-b66c-4f2e-aa6c-8d0ee2201b78	4	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
0cfb6185-4999-4c51-84ee-248e036ed3ac	699269f4-b66c-4f2e-aa6c-8d0ee2201b78	5	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
f795e7dc-c105-4c48-83fa-060edde9ab64	699269f4-b66c-4f2e-aa6c-8d0ee2201b78	7	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
f72c4d19-17ee-4e05-a3e3-abe56d882720	699269f4-b66c-4f2e-aa6c-8d0ee2201b78	9	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
e4b80c50-d77c-47f7-841e-603e13ebf949	699269f4-b66c-4f2e-aa6c-8d0ee2201b78	11	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
97843e63-5955-463e-9a2f-ef211063db03	dcb07693-3f23-4538-bc5d-292648c85cfa	1	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
66a993c4-537a-4869-b441-e2d0d917a4ee	dcb07693-3f23-4538-bc5d-292648c85cfa	3	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
95abc67c-35ea-433f-920f-a3e44f7c513c	dcb07693-3f23-4538-bc5d-292648c85cfa	4	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
0ed042a1-b803-4e66-a57a-58d769a2d3e5	dcb07693-3f23-4538-bc5d-292648c85cfa	5	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
287ec041-da46-40f7-9887-eefe1ccbbd35	dcb07693-3f23-4538-bc5d-292648c85cfa	7	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
70cd8941-f9b3-4d81-8d90-0915840774e0	dcb07693-3f23-4538-bc5d-292648c85cfa	9	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
1b9d91b2-bdda-4c6c-9b46-1028c320b626	dcb07693-3f23-4538-bc5d-292648c85cfa	10	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
20d13988-be35-4b64-8257-9635fdcee314	dcb07693-3f23-4538-bc5d-292648c85cfa	11	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
4ef006ae-0238-44b2-a6a4-280cdb9a6fad	dcb07693-3f23-4538-bc5d-292648c85cfa	12	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
103ece04-f6f3-42de-9521-c9c7a34099d3	7d5965c3-3c53-4e97-bdea-58b553cd07aa	1	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
aa58bae4-73d8-4be6-81d6-7ebe0a5a55f1	7d5965c3-3c53-4e97-bdea-58b553cd07aa	2	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
446edb8e-0abe-43ce-b2dd-71aea47d5aef	7d5965c3-3c53-4e97-bdea-58b553cd07aa	4	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
f5d0f330-5005-4f13-8a75-9d4369d2dd26	7d5965c3-3c53-4e97-bdea-58b553cd07aa	5	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
f5408333-303c-4497-9efd-9005952840e3	7d5965c3-3c53-4e97-bdea-58b553cd07aa	6	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
46dec701-ac5f-4e42-a1bb-2bcdb6c9ec95	7d5965c3-3c53-4e97-bdea-58b553cd07aa	7	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
6aee19c1-8799-466a-8491-63014a007c0e	7d5965c3-3c53-4e97-bdea-58b553cd07aa	8	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
5a972179-387c-4b23-82f6-3192e443a556	7d5965c3-3c53-4e97-bdea-58b553cd07aa	9	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
de29ece8-1b87-4ebb-8d78-694b8fec16ed	7d5965c3-3c53-4e97-bdea-58b553cd07aa	10	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
73f13f29-3f93-4ef4-8c4c-50e76449c663	7d5965c3-3c53-4e97-bdea-58b553cd07aa	11	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
d3be2928-bd62-4912-9b82-bfb18de5af6c	7d5965c3-3c53-4e97-bdea-58b553cd07aa	12	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
559e6cb0-3608-4b7d-92af-a3e1b2eda5b8	07fa9a2e-7357-4a0d-87e6-c799ba808358	1	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
0e3eaab4-a54d-472e-a38b-b046e445c599	07fa9a2e-7357-4a0d-87e6-c799ba808358	2	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
7cbedac0-4eb0-4c27-bf8d-2daa7643514d	bdc81e93-7795-47a5-93f1-96b013491d82	1	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
b9366b5d-fb40-45c7-84be-ede9b188b2fe	bdc81e93-7795-47a5-93f1-96b013491d82	2	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
e327a1c5-bc78-4640-b10e-d31980eee85f	cb947898-0b07-4cfc-8b22-14ada64025da	1	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
7a65caf3-b6e3-47ca-9d32-6d6fb7799c35	cb947898-0b07-4cfc-8b22-14ada64025da	2	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
66d1bbf0-5219-4120-982f-6440c48fd2f6	cb947898-0b07-4cfc-8b22-14ada64025da	3	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
86e0720e-27c3-4f14-b790-24e2e211f8db	cb947898-0b07-4cfc-8b22-14ada64025da	4	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
bf530b4d-291c-45be-ad72-4d1e0e9ca86e	6fa25f28-74ee-4a6b-910f-b87f4162382f	1	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
3071f163-53ed-4b3b-b765-4126461ca10a	6fa25f28-74ee-4a6b-910f-b87f4162382f	2	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
37b8c31b-7180-412a-b025-7d2306934ab4	6fa25f28-74ee-4a6b-910f-b87f4162382f	3	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
65d962df-8313-4270-9769-2094ef97e565	6fa25f28-74ee-4a6b-910f-b87f4162382f	4	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
f6a1622c-9ba5-4b7a-9202-99c824498a0d	6fa25f28-74ee-4a6b-910f-b87f4162382f	5	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
7b6a4b6f-053d-4ac3-89a7-45d72a347176	6fa25f28-74ee-4a6b-910f-b87f4162382f	6	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
c123d166-af5f-4009-981e-a83685f64b29	6fa25f28-74ee-4a6b-910f-b87f4162382f	8	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
a6a8cf1a-1e15-472b-b271-96a6a57bbacc	6fa25f28-74ee-4a6b-910f-b87f4162382f	9	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
7385180d-73b0-422e-a563-0dce8c4fe494	6fa25f28-74ee-4a6b-910f-b87f4162382f	11	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
2392e913-c25b-4149-8f1f-ab9470879843	6fa25f28-74ee-4a6b-910f-b87f4162382f	12	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
f31c481c-c5d3-48db-9a71-4490e7d049dc	b45c5a5f-ec2b-4216-9766-b30c8f6ff7be	2	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
3961c983-8a97-4b0e-8bff-087c465f78ff	b45c5a5f-ec2b-4216-9766-b30c8f6ff7be	3	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
15116252-4af3-4a10-87ea-b4d7eecbc4bb	b45c5a5f-ec2b-4216-9766-b30c8f6ff7be	4	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
c5e15a7e-ed0f-47bb-98bc-bed427e54ed8	b45c5a5f-ec2b-4216-9766-b30c8f6ff7be	5	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
25fb4239-7d40-4539-a43d-69e439b9b398	b45c5a5f-ec2b-4216-9766-b30c8f6ff7be	6	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
94203b4e-2f64-4ca2-bc39-0d7d86c4f54b	b45c5a5f-ec2b-4216-9766-b30c8f6ff7be	8	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
64b6f0c4-ad32-4c14-aa24-15c9308ee09c	b45c5a5f-ec2b-4216-9766-b30c8f6ff7be	9	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
50feac8a-0975-4a55-8dd9-d4cb0159c26c	b45c5a5f-ec2b-4216-9766-b30c8f6ff7be	11	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
f24aff99-8375-49e2-96c0-ec22491ed2bd	b45c5a5f-ec2b-4216-9766-b30c8f6ff7be	12	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
ed1cb09d-e603-47df-9b8e-e55b12c1afb1	1762e828-b530-4715-8372-88175bb7c2ae	1	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
f9f5af1d-ba8e-4a9c-a7b9-d1e3ec5f1be3	1762e828-b530-4715-8372-88175bb7c2ae	2	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
83def70b-3cf5-4310-8220-8042be0950db	1762e828-b530-4715-8372-88175bb7c2ae	3	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
68a2909d-5a38-446e-af5d-6102e92ec480	1762e828-b530-4715-8372-88175bb7c2ae	4	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
f3405610-d8f0-4b4b-8350-0140d8fee299	1762e828-b530-4715-8372-88175bb7c2ae	5	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
0f4ef8b5-d04d-48c8-adbe-b6e2b7b3280d	1762e828-b530-4715-8372-88175bb7c2ae	6	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
d21a888d-154a-4141-a246-e6dc5ae6a570	1762e828-b530-4715-8372-88175bb7c2ae	7	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
3d909bf1-fba8-46ba-81c9-939616f85c34	1762e828-b530-4715-8372-88175bb7c2ae	8	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
faefe62f-9df0-4716-8adb-3c4c68bdad99	1762e828-b530-4715-8372-88175bb7c2ae	9	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
26278464-66bf-4842-8d0c-4c71f4aa16e6	1762e828-b530-4715-8372-88175bb7c2ae	10	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
699f4648-b63c-4dfb-86e5-1968290fad13	1762e828-b530-4715-8372-88175bb7c2ae	11	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
2d9a490f-4c62-410a-85f7-c5f2adc5c8cf	8dd838e9-603f-41b4-acf4-91e5e29c3e15	2	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
9328f3ae-40a8-4792-99f5-0cbb30a966cd	8dd838e9-603f-41b4-acf4-91e5e29c3e15	3	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
718fe23f-1dcc-49e5-8780-a3bfd7dd4c90	8dd838e9-603f-41b4-acf4-91e5e29c3e15	4	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
94bd3c10-dc28-4389-91be-e5b2b9f8922b	8dd838e9-603f-41b4-acf4-91e5e29c3e15	5	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
fa400c68-b085-4b4b-9083-6ec0af544d36	8dd838e9-603f-41b4-acf4-91e5e29c3e15	6	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
af1db8dd-4c0b-42b4-9bbd-9b8ff3b62d00	8dd838e9-603f-41b4-acf4-91e5e29c3e15	7	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
cd061b5b-f653-4ac6-9efc-e68d4c635749	8dd838e9-603f-41b4-acf4-91e5e29c3e15	8	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
8fdb17ea-7e36-4815-b86f-a1ebab1df69b	8dd838e9-603f-41b4-acf4-91e5e29c3e15	9	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
265adf79-c0aa-40e6-87bf-250043a5632d	8dd838e9-603f-41b4-acf4-91e5e29c3e15	10	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
da402def-d5a8-4b4a-aa7c-70b1d7df2108	8dd838e9-603f-41b4-acf4-91e5e29c3e15	11	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
1c421bd2-c540-4d16-9967-d16221bc375a	8dd838e9-603f-41b4-acf4-91e5e29c3e15	12	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
df4b0d51-7e69-4e8a-82a0-0fb8537dae61	e4f68cf8-736c-4b0b-94f5-4860f69ec2af	1	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
950a6e6c-8f0e-4425-aa30-48c8d9f70aa0	e4f68cf8-736c-4b0b-94f5-4860f69ec2af	2	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
2d52b487-591e-48f5-9c96-bbdcac8d4bf3	e4f68cf8-736c-4b0b-94f5-4860f69ec2af	3	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
6586cc37-25d8-41f8-b707-6a96da411f1e	e4f68cf8-736c-4b0b-94f5-4860f69ec2af	4	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
fc651db0-701b-4969-b983-3a6bb6db760b	e4f68cf8-736c-4b0b-94f5-4860f69ec2af	7	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
eaf9d63f-7bdd-46e6-9197-83e39d6cb20d	e4f68cf8-736c-4b0b-94f5-4860f69ec2af	8	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
305e158b-7ec2-490c-b4a5-77684a2c270e	e4f68cf8-736c-4b0b-94f5-4860f69ec2af	9	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
6392151d-6efb-4603-8785-8a9ddb06c76e	e4f68cf8-736c-4b0b-94f5-4860f69ec2af	10	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
2fe18c5e-4944-417c-b56f-a3c02f15c5e7	e4f68cf8-736c-4b0b-94f5-4860f69ec2af	11	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
a490de5f-2802-4ce5-baa6-2a36d1ca3bcc	e4f68cf8-736c-4b0b-94f5-4860f69ec2af	12	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
137bded4-3dfe-43c9-b477-064fec82f256	adc89b8a-77e7-4943-ad7c-7f312a527f5b	2	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
0f6cf87b-da4d-406a-88d7-3dcea8e99ab9	58973a95-3985-45a7-aab1-4f8ad8c4b9d5	1	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
23739158-ddfb-4521-a83e-585e750b736b	58973a95-3985-45a7-aab1-4f8ad8c4b9d5	7	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
d766141f-baa3-48e2-b6c8-e10508a3e0be	58973a95-3985-45a7-aab1-4f8ad8c4b9d5	8	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
d37924af-f229-402e-a47b-e980372e53c6	58973a95-3985-45a7-aab1-4f8ad8c4b9d5	9	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
936cec6f-52b2-4201-b36c-2b2451ec5d7c	58973a95-3985-45a7-aab1-4f8ad8c4b9d5	10	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
576abb96-8ebf-43e8-a355-bc6a81f10fe6	58973a95-3985-45a7-aab1-4f8ad8c4b9d5	11	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
a0f048ce-9df5-4dec-95e5-815e57d552f2	58973a95-3985-45a7-aab1-4f8ad8c4b9d5	12	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-05-20 16:06:56	2026-05-20 16:06:56
f7369305-da06-4ae1-b949-04a94cf2d526	13eed094-8b66-4443-bfbe-0a0858928e7d	1	\N	\N	\N	\N	3.2704e+07	3.2704e+07	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Importado desde Excel	2026-06-02 15:27:56	2026-06-02 16:16:04
b18d3c0b-ee78-43d4-91cd-68b28912e759	13eed094-8b66-4443-bfbe-0a0858928e7d	5	\N	\N	\N	\N	4.196e+06	4.196e+06	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Importado desde Excel	2026-06-02 15:27:56	2026-06-02 16:16:04
8eda9270-9a6c-4b86-85e2-9c02110549dd	8229ab41-223c-41b2-b4c7-ac775c882ae8	5	\N	\N	\N	\N	4.92e+06	4.92e+06	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Importado desde Excel	2026-06-02 15:27:56	2026-06-02 16:16:04
e97ef7d7-6983-4f59-a713-7ca7c97e2c2e	6e08b1e3-6307-4209-860e-fd3c1c12b765	3	\N	\N	\N	\N	1.7785344e+07	1.7785344e+07	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Importado desde Excel	2026-06-02 15:27:56	2026-06-02 16:16:04
92a6f3bb-ce10-4114-98ea-4b5155dd6623	82f01d2a-e48d-4d25-9065-6942d72bd6ef	5	\N	\N	\N	\N	2.87e+06	2.87e+06	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Importado desde Excel	2026-06-02 15:27:56	2026-06-02 16:16:04
3852af6f-c9dc-45f9-87d0-bba20789d219	c3df63f8-1b5b-4677-a4aa-881b11729eae	5	\N	\N	\N	\N	7.569268e+06	7.569268e+06	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Importado desde Excel	2026-06-02 15:27:56	2026-06-02 16:16:04
7f3c46c7-32ba-4667-91b8-db9e30a87b86	4b02d7c5-adcb-4e7e-96e5-f56211fb7d47	5	\N	\N	\N	\N	9.02e+06	9.02e+06	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Importado desde Excel	2026-06-02 15:27:56	2026-06-02 16:16:04
33056b43-4e9b-4807-8d27-e074d2dad560	23bdd370-e4b6-4ca9-b775-114383948be0	1	\N	\N	\N	\N	2.383447e+06	2.383447e+06	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Importado desde Excel	2026-06-02 15:27:56	2026-06-02 16:16:04
241a5e4a-df2a-40a8-a6d1-05ffef4bc4ce	23bdd370-e4b6-4ca9-b775-114383948be0	5	\N	\N	\N	\N	4.586553e+06	4.586553e+06	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Importado desde Excel	2026-06-02 15:27:56	2026-06-02 16:16:04
57531e32-f05e-464a-b8c9-299c4089af53	8edd6a6c-0dcd-4a77-a799-e12454b93226	5	\N	\N	\N	\N	9.261108e+06	9.261108e+06	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Importado desde Excel	2026-06-02 15:27:56	2026-06-02 16:16:04
022745af-4a32-46ad-af97-fff8cb82b15b	11534164-d017-46e0-932d-61d95de679be	5	\N	\N	\N	\N	4.92e+06	4.92e+06	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Importado desde Excel	2026-06-02 15:27:56	2026-06-02 16:16:04
321fc21f-650f-4418-9d16-5c62048fbf2e	33f01c20-8944-48dc-963f-f69504e74f64	10	\N	\N	\N	\N	6.890103e+06	6.890103e+06	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Importado desde Excel	2026-06-02 15:27:56	2026-06-02 16:16:04
46b8f9a0-0fd0-4b7f-ad05-0b72a5b8dd59	33f01c20-8944-48dc-963f-f69504e74f64	12	\N	\N	\N	\N	6.890103e+06	6.890103e+06	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Importado desde Excel	2026-06-02 15:27:56	2026-06-02 16:16:04
769ad1a9-a8e3-4024-93b8-48e5d5bfdd85	ebe818cf-4800-4191-9a30-d6121888b5ab	5	\N	\N	\N	\N	3.466667e+06	3.466667e+06	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Importado desde Excel	2026-06-02 15:27:56	2026-06-02 16:16:04
146cf6bd-1c92-49a7-bbc8-e976a50e7cbd	ebe818cf-4800-4191-9a30-d6121888b5ab	8	\N	\N	\N	\N	3.466667e+06	3.466667e+06	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Importado desde Excel	2026-06-02 15:27:56	2026-06-02 16:16:04
3cb9305d-96f3-4b12-980e-c9ae26a42f45	ebe818cf-4800-4191-9a30-d6121888b5ab	10	\N	\N	\N	\N	3.466667e+06	3.466667e+06	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Importado desde Excel	2026-06-02 15:27:56	2026-06-02 16:16:04
d424bd49-a5fb-402e-a842-f409261f026a	e5c1ce12-6e3d-4b96-80dc-2b52b286263f	2	\N	\N	\N	\N	4.23913e+06	4.23913e+06	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Importado desde Excel	2026-06-02 15:27:56	2026-06-02 16:16:04
3ef34ad2-0d32-4c6e-a697-79d1b65d15c5	4215ee2e-2a8d-4c5f-bfcd-39af81345dd2	8	\N	\N	\N	\N	1.985e+06	1.985e+06	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Importado desde Excel	2026-06-02 15:27:56	2026-06-02 16:16:04
9a22b374-b0ad-4c56-ab53-84e5c1455a1d	83f15dd7-ebc3-4d7e-99a7-c6de2b1e9e2c	8	\N	\N	\N	\N	1.04e+07	1.04e+07	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Importado desde Excel	2026-06-02 15:27:56	2026-06-02 16:16:04
36759434-48b8-4490-916b-58d45f31e877	548e4ae8-cfe4-43e7-8fbd-20eec374a252	5	\N	\N	\N	\N	6.12e+06	6.12e+06	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Importado desde Excel	2026-06-02 15:27:56	2026-06-02 16:16:04
baf85b52-8de2-43f7-ae0e-dfb350d135fd	548e4ae8-cfe4-43e7-8fbd-20eec374a252	8	\N	\N	\N	\N	6.0741e+06	6.0741e+06	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Importado desde Excel	2026-06-02 15:27:56	2026-06-02 16:16:04
533122f3-1b82-42db-ad0d-59fbb1374765	36028989-ea20-41f5-b246-c8e44c1e6b61	1	\N	\N	\N	\N	1.589371e+06	1.589371e+06	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Importado desde Excel	2026-06-02 15:27:56	2026-06-02 16:16:04
35e2120d-3168-4ae7-b02d-43db6364b6f9	36028989-ea20-41f5-b246-c8e44c1e6b61	2	\N	\N	\N	\N	1.589131e+06	1.589131e+06	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Importado desde Excel	2026-06-02 15:27:56	2026-06-02 16:16:04
113e9a5f-742a-4ccb-ba39-05539d2b359d	36028989-ea20-41f5-b246-c8e44c1e6b61	3	\N	\N	\N	\N	1.593669e+06	1.593669e+06	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Importado desde Excel	2026-06-02 15:27:56	2026-06-02 16:16:04
52f88083-7b9b-43cb-bc34-01c550b9498f	681cc031-9409-4acc-a962-dbb677dbe942	5	\N	\N	\N	\N	1.4552996e+07	1.4552996e+07	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Importado desde Excel	2026-06-02 15:27:56	2026-06-02 16:16:04
abd5f1b5-1cec-41be-aa10-01669b3407bf	6bc2ac0e-215a-424b-9a42-840812e3981f	5	\N	\N	\N	\N	2.7111004e+07	2.7111004e+07	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Importado desde Excel	2026-06-02 15:27:56	2026-06-02 16:16:04
365866f7-4e1a-447d-9613-bd003e5865ea	98eec03c-3ab2-4ba1-b891-dbd79c2a7bd6	1	\N	\N	\N	\N	1.42e+07	1.42e+07	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Importado desde Excel	2026-06-02 15:27:56	2026-06-02 16:16:04
96281564-0d75-4642-86ea-6a12fa37948c	98eec03c-3ab2-4ba1-b891-dbd79c2a7bd6	3	\N	\N	\N	\N	750625	750625	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Importado desde Excel	2026-06-02 15:27:56	2026-06-02 16:16:04
97f90ab9-a4c6-4064-878a-ac0e01aeb934	98eec03c-3ab2-4ba1-b891-dbd79c2a7bd6	5	\N	\N	\N	\N	4.177375e+06	4.177375e+06	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Importado desde Excel	2026-06-02 15:27:56	2026-06-02 16:16:04
b5cb2783-c590-44b9-be05-5c3f39729440	98eec03c-3ab2-4ba1-b891-dbd79c2a7bd6	10	\N	\N	\N	\N	1.9128e+07	1.9128e+07	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Importado desde Excel	2026-06-02 15:27:56	2026-06-02 16:16:04
fb44959a-4726-4a6a-960f-921ecaf4ad04	fa91cc8e-ecaf-48dd-91f6-a87c7cfe5f73	5	\N	\N	\N	\N	1.9925e+06	1.9925e+06	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Importado desde Excel	2026-06-02 15:27:56	2026-06-02 16:16:04
263d23d2-5a73-423f-bb40-94ad36c8049f	fb3fdd4e-94d2-4014-b286-b416725602bb	5	\N	\N	\N	\N	689375	689375	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Importado desde Excel	2026-06-02 15:27:56	2026-06-02 16:16:04
f380057f-0144-48ec-ae36-39ea7f5cd7bd	fb3fdd4e-94d2-4014-b286-b416725602bb	8	\N	\N	\N	\N	1.701625e+06	1.701625e+06	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Importado desde Excel	2026-06-02 15:27:56	2026-06-02 16:16:04
5d724d4d-e917-486c-b372-b0c0b4aa61f6	fb3fdd4e-94d2-4014-b286-b416725602bb	10	\N	\N	\N	\N	2.391e+06	2.391e+06	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Importado desde Excel	2026-06-02 15:27:56	2026-06-02 16:16:04
a8bf1141-9fab-4075-b377-b5573e5058af	cc653b6e-0d4e-4f16-bcd1-d9fd252bcf28	3	\N	\N	\N	\N	1.3449375e+07	1.3449375e+07	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Importado desde Excel	2026-06-02 15:27:56	2026-06-02 16:16:04
bf1fca7b-a053-4c76-9467-37c2459182fe	cc653b6e-0d4e-4f16-bcd1-d9fd252bcf28	10	\N	\N	\N	\N	1.07595e+07	1.07595e+07	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Importado desde Excel	2026-06-02 15:27:56	2026-06-02 16:16:04
1ab023a5-6e0b-40d3-b360-862f6f3ea4f7	143a0b7e-2296-4dbb-86a6-f0c534c5b414	8	\N	\N	\N	\N	8.3685e+06	8.3685e+06	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Importado desde Excel	2026-06-02 15:27:56	2026-06-02 16:16:04
c10d6001-60e7-4b6e-b60a-febbeca6ac72	143a0b7e-2296-4dbb-86a6-f0c534c5b414	10	\N	\N	\N	\N	8.3685e+06	8.3685e+06	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Importado desde Excel	2026-06-02 15:27:56	2026-06-02 16:16:04
1d8b226c-a642-4554-aa61-0f34519fe6d8	d1ebc656-b4bc-403f-a6b7-9420de66a0cd	5	\N	\N	\N	\N	2.64e+06	2.64e+06	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Importado desde Excel	2026-06-02 15:27:56	2026-06-02 16:16:04
6d624971-1fc0-407d-979c-311e3a8a9f83	d1ebc656-b4bc-403f-a6b7-9420de66a0cd	7	\N	\N	\N	\N	2.6268e+06	2.6268e+06	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Importado desde Excel	2026-06-02 15:27:56	2026-06-02 16:16:04
93e6b5ff-22d4-43d1-bfd5-0c1deb9e497f	d1ebc656-b4bc-403f-a6b7-9420de66a0cd	9	\N	\N	\N	\N	2.6268e+06	2.6268e+06	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Importado desde Excel	2026-06-02 15:27:56	2026-06-02 16:16:04
6f241d54-1259-46a5-80fe-5462a12d54fb	d1ebc656-b4bc-403f-a6b7-9420de66a0cd	12	\N	\N	\N	\N	2.6268e+06	2.6268e+06	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Importado desde Excel	2026-06-02 15:27:56	2026-06-02 16:16:04
cdaee133-74aa-431a-b77b-e830e9501d09	b65c2f8d-ed90-46c6-8d89-c84958e189f3	5	\N	\N	\N	\N	3.5865e+06	3.5865e+06	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Importado desde Excel	2026-06-02 15:27:56	2026-06-02 16:16:04
58db7262-d60c-4d2b-a8c4-ae3477a01040	b65c2f8d-ed90-46c6-8d89-c84958e189f3	10	\N	\N	\N	\N	3.5865e+06	3.5865e+06	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Importado desde Excel	2026-06-02 15:27:56	2026-06-02 16:16:04
f183d425-be86-4714-b0db-83ff7525c4cb	4078e7a1-c489-44bb-af5d-20670345b0aa	3	\N	\N	\N	\N	8.281173e+06	8.281173e+06	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Importado desde Excel	2026-06-02 15:27:56	2026-06-02 16:16:04
292ce82d-14b0-47f3-9178-8749dfad92f6	ad4246e8-0b0e-4959-9a9f-421880b6c83c	3	\N	\N	\N	\N	9.555199e+06	9.555199e+06	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Importado desde Excel	2026-06-02 15:27:56	2026-06-02 16:16:04
e7cf5515-2e23-4b4d-84a5-602cff4e4d97	eef3aad4-d6a2-458b-ad9a-9ec3fec6d0b5	1	\N	\N	\N	\N	2.145e+07	2.145e+07	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Importado desde Excel	2026-06-02 15:27:56	2026-06-02 16:16:04
45e54beb-69f0-4506-bd19-b2cafec19078	eef3aad4-d6a2-458b-ad9a-9ec3fec6d0b5	2	\N	\N	\N	\N	1.039924e+06	1.039924e+06	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Importado desde Excel	2026-06-02 15:27:56	2026-06-02 16:16:04
5396bcde-74b9-4feb-af04-db40d74c99fa	eef3aad4-d6a2-458b-ad9a-9ec3fec6d0b5	6	\N	\N	\N	\N	1.7775e+07	1.7775e+07	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Importado desde Excel	2026-06-02 15:27:56	2026-06-02 16:16:04
8cbc8188-5dc9-4671-8be7-4b4084932eb8	eef3aad4-d6a2-458b-ad9a-9ec3fec6d0b5	8	\N	\N	\N	\N	1.7775e+07	1.7775e+07	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Importado desde Excel	2026-06-02 15:27:56	2026-06-02 16:16:04
e2f478da-91d8-49ae-8c04-419650992405	eef3aad4-d6a2-458b-ad9a-9ec3fec6d0b5	10	\N	\N	\N	\N	1.8e+07	1.8e+07	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Importado desde Excel	2026-06-02 15:27:56	2026-06-02 16:16:04
a7c60483-37b8-4c42-840d-d9b2a1e49a37	eef3aad4-d6a2-458b-ad9a-9ec3fec6d0b5	12	\N	\N	\N	\N	1.8e+07	1.8e+07	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Importado desde Excel	2026-06-02 15:27:56	2026-06-02 16:16:04
60df553e-534d-45b0-a79c-ba5349f0dd55	42010027-79f6-4d5e-99e8-f96deb137cf8	2	\N	\N	\N	\N	7.135846e+06	7.135846e+06	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Importado desde Excel	2026-06-02 15:27:56	2026-06-02 16:16:04
5d925664-bcc2-454e-bb78-d483d5cb9cc9	42010027-79f6-4d5e-99e8-f96deb137cf8	6	\N	\N	\N	\N	2.9625e+06	2.9625e+06	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Importado desde Excel	2026-06-02 15:27:56	2026-06-02 16:16:04
50e7e0f8-5b89-45e5-b15d-73b366525264	42010027-79f6-4d5e-99e8-f96deb137cf8	8	\N	\N	\N	\N	2.9625e+06	2.9625e+06	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Importado desde Excel	2026-06-02 15:27:56	2026-06-02 16:16:04
c11979d5-1d35-40b8-a7e3-e9276a665f12	4943bc08-59f8-4908-9cac-5ec83fea9d73	3	\N	\N	\N	\N	2.390503e+06	2.390503e+06	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Importado desde Excel	2026-06-02 15:27:56	2026-06-02 16:16:04
30a50a1b-a950-4fc8-a053-a0c6e4663336	2c03b99e-7087-455c-a39b-46188232d26f	3	\N	\N	\N	\N	5.529234e+06	5.529234e+06	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Importado desde Excel	2026-06-02 15:27:56	2026-06-02 16:16:04
fcd2e2b8-4651-4456-ab5c-a3f7cb065fbc	2c03b99e-7087-455c-a39b-46188232d26f	4	\N	\N	\N	\N	1.85596e+06	1.85596e+06	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Importado desde Excel	2026-06-02 15:27:56	2026-06-02 16:16:04
8a118e35-4418-40e6-83e8-c25d5ff976a6	2c03b99e-7087-455c-a39b-46188232d26f	5	\N	\N	\N	\N	1.875522e+06	1.875522e+06	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Importado desde Excel	2026-06-02 15:27:56	2026-06-02 16:16:04
12a93d8c-00bc-4ff8-9ac8-ad947c9463e5	2c03b99e-7087-455c-a39b-46188232d26f	6	\N	\N	\N	\N	1.8504e+06	1.8504e+06	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Importado desde Excel	2026-06-02 15:27:56	2026-06-02 16:16:04
cb2285a7-d143-483a-8a02-f14be622bfa7	2c03b99e-7087-455c-a39b-46188232d26f	7	\N	\N	\N	\N	1.8504e+06	1.8504e+06	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Importado desde Excel	2026-06-02 15:27:56	2026-06-02 16:16:04
09fc0d34-bd64-4b5d-9769-a3b08c898e67	2c03b99e-7087-455c-a39b-46188232d26f	8	\N	\N	\N	\N	1.8504e+06	1.8504e+06	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Importado desde Excel	2026-06-02 15:27:56	2026-06-02 16:16:04
7a21ac49-9464-4479-9b84-3894484d4748	2c03b99e-7087-455c-a39b-46188232d26f	9	\N	\N	\N	\N	1.8504e+06	1.8504e+06	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Importado desde Excel	2026-06-02 15:27:56	2026-06-02 16:16:04
401c0374-0c08-4866-96e7-4d02b49a51b5	2c03b99e-7087-455c-a39b-46188232d26f	10	\N	\N	\N	\N	1.8504e+06	1.8504e+06	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Importado desde Excel	2026-06-02 15:27:56	2026-06-02 16:16:04
8469599f-0fe1-44f2-9096-ca91c56eeeb1	2c03b99e-7087-455c-a39b-46188232d26f	11	\N	\N	\N	\N	1.8504e+06	1.8504e+06	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Importado desde Excel	2026-06-02 15:27:56	2026-06-02 16:16:04
0cf7fd60-c938-4479-bda6-c58e341b7fdf	2c03b99e-7087-455c-a39b-46188232d26f	12	\N	\N	\N	\N	1.8504e+06	1.8504e+06	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Importado desde Excel	2026-06-02 15:27:56	2026-06-02 16:16:04
8c6d0560-1f12-4dd5-9f38-26910d49bb03	7bb4e4d2-c2aa-45d6-81a4-f9d6dc577115	3	\N	\N	\N	\N	2.470585e+06	2.470585e+06	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Importado desde Excel	2026-06-02 15:27:56	2026-06-02 16:16:04
0ee7895a-2af0-438d-b773-15aae74ba74c	7bb4e4d2-c2aa-45d6-81a4-f9d6dc577115	4	\N	\N	\N	\N	829285	829285	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Importado desde Excel	2026-06-02 15:27:56	2026-06-02 16:16:04
ef6ad19e-48ba-4532-90e9-13ada8a40360	7bb4e4d2-c2aa-45d6-81a4-f9d6dc577115	5	\N	\N	\N	\N	838025	838025	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Importado desde Excel	2026-06-02 15:27:56	2026-06-02 16:16:04
458fe9fc-7973-4389-8838-ba6ebb51431b	7bb4e4d2-c2aa-45d6-81a4-f9d6dc577115	6	\N	\N	\N	\N	826800	826800	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Importado desde Excel	2026-06-02 15:27:56	2026-06-02 16:16:04
5f08e79a-6160-46e7-bfa2-bfe5368a6049	7bb4e4d2-c2aa-45d6-81a4-f9d6dc577115	7	\N	\N	\N	\N	826800	826800	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Importado desde Excel	2026-06-02 15:27:56	2026-06-02 16:16:04
75a181dd-8e7b-49fc-86ae-a78f5decbae0	7bb4e4d2-c2aa-45d6-81a4-f9d6dc577115	8	\N	\N	\N	\N	826800	826800	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Importado desde Excel	2026-06-02 15:27:56	2026-06-02 16:16:04
c83a2984-f12f-449f-bcbe-dbcd25e0b24e	7bb4e4d2-c2aa-45d6-81a4-f9d6dc577115	9	\N	\N	\N	\N	826800	826800	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Importado desde Excel	2026-06-02 15:27:56	2026-06-02 16:16:04
cde76dd1-34be-4bc3-a693-345b51a03bfb	7bb4e4d2-c2aa-45d6-81a4-f9d6dc577115	10	\N	\N	\N	\N	826800	826800	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Importado desde Excel	2026-06-02 15:27:56	2026-06-02 16:16:04
ee09670e-9828-418a-ad21-52f593bb6ce9	7bb4e4d2-c2aa-45d6-81a4-f9d6dc577115	11	\N	\N	\N	\N	826800	826800	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Importado desde Excel	2026-06-02 15:27:56	2026-06-02 16:16:04
5948a8b4-d770-4c56-87be-138f43179a0d	7bb4e4d2-c2aa-45d6-81a4-f9d6dc577115	12	\N	\N	\N	\N	826800	826800	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Importado desde Excel	2026-06-02 15:27:56	2026-06-02 16:16:04
1c2f44bc-9ccb-40bc-95d5-ec9b52a92ec8	8bf43911-694d-4fe9-8cde-0a1af1422d33	5	\N	\N	\N	\N	2.912e+06	2.912e+06	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Importado desde Excel	2026-06-02 15:27:56	2026-06-02 16:16:04
9a49be04-14ec-40ad-a308-5d36a2d30358	8bf43911-694d-4fe9-8cde-0a1af1422d33	6	\N	\N	\N	\N	2.912e+06	2.912e+06	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Importado desde Excel	2026-06-02 15:27:56	2026-06-02 16:16:04
ab50054b-8e65-4da6-be22-e020a7dc6783	8bf43911-694d-4fe9-8cde-0a1af1422d33	7	\N	\N	\N	\N	2.912e+06	2.912e+06	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Importado desde Excel	2026-06-02 15:27:56	2026-06-02 16:16:04
e0d9104e-d03e-458a-83f2-e66aef8f526d	8bf43911-694d-4fe9-8cde-0a1af1422d33	8	\N	\N	\N	\N	2.912e+06	2.912e+06	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Importado desde Excel	2026-06-02 15:27:56	2026-06-02 16:16:04
e49d073f-c260-4389-aa63-bbb5ae9e5656	8bf43911-694d-4fe9-8cde-0a1af1422d33	9	\N	\N	\N	\N	2.912e+06	2.912e+06	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Importado desde Excel	2026-06-02 15:27:56	2026-06-02 16:16:04
4e1986ef-6e30-4a21-b052-f6c9f5a024a1	8bf43911-694d-4fe9-8cde-0a1af1422d33	10	\N	\N	\N	\N	2.912e+06	2.912e+06	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Importado desde Excel	2026-06-02 15:27:56	2026-06-02 16:16:04
9430d1bb-f092-48ce-9065-37291aed9674	8bf43911-694d-4fe9-8cde-0a1af1422d33	11	\N	\N	\N	\N	2.912e+06	2.912e+06	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Importado desde Excel	2026-06-02 15:27:56	2026-06-02 16:16:04
072246f9-d6f2-492a-8a7d-0a0ebe349ebe	8bf43911-694d-4fe9-8cde-0a1af1422d33	12	\N	\N	\N	\N	2.912e+06	2.912e+06	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Importado desde Excel	2026-06-02 15:27:56	2026-06-02 16:16:04
a9f2bb85-4189-4570-a1ea-94968ed2812f	25bc4459-b4dc-4097-80a7-e5156fb2b761	7	\N	\N	\N	\N	4.74e+06	4.74e+06	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Importado desde Excel	2026-06-02 15:27:56	2026-06-02 16:16:04
2dd91dfe-2b9e-409b-93be-ad2203fcc02e	25bc4459-b4dc-4097-80a7-e5156fb2b761	10	\N	\N	\N	\N	4.74e+06	4.74e+06	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Importado desde Excel	2026-06-02 15:27:56	2026-06-02 16:16:04
c75a84a4-5196-472b-b46f-2be9ae733138	89f8d55d-8cac-4e9f-b00b-df54e5ea64ce	1	\N	\N	\N	\N	5.757751e+06	5.757751e+06	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Importado desde Excel	2026-06-02 15:27:56	2026-06-02 16:16:04
0d399d05-258c-4b98-a541-ae6be2bd1848	89f8d55d-8cac-4e9f-b00b-df54e5ea64ce	2	\N	\N	\N	\N	5.766353e+06	5.766353e+06	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Importado desde Excel	2026-06-02 15:27:56	2026-06-02 16:16:04
945569d9-0be5-4a77-90a3-64766cc1f41f	89f8d55d-8cac-4e9f-b00b-df54e5ea64ce	3	\N	\N	\N	\N	5.777049e+06	5.777049e+06	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Importado desde Excel	2026-06-02 15:27:56	2026-06-02 16:16:04
634910b3-bb3a-4839-bd8c-7cd8e7073726	89f8d55d-8cac-4e9f-b00b-df54e5ea64ce	4	\N	\N	\N	\N	5.815499e+06	5.815499e+06	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Importado desde Excel	2026-06-02 15:27:56	2026-06-02 16:16:04
32cfc254-d71c-4ce5-9b27-1abd02845608	89f8d55d-8cac-4e9f-b00b-df54e5ea64ce	5	\N	\N	\N	\N	1.1914472e+07	1.1914472e+07	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Importado desde Excel	2026-06-02 15:27:56	2026-06-02 16:16:04
e1b6c316-a7ad-48da-8013-84f0cf5e685a	89f8d55d-8cac-4e9f-b00b-df54e5ea64ce	6	\N	\N	\N	\N	5.8e+06	5.8e+06	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Importado desde Excel	2026-06-02 15:27:56	2026-06-02 16:16:04
ea80feb8-3b28-4b8f-bd5f-2409947b3ec8	89f8d55d-8cac-4e9f-b00b-df54e5ea64ce	7	\N	\N	\N	\N	5.8e+06	5.8e+06	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Importado desde Excel	2026-06-02 15:27:56	2026-06-02 16:16:04
0332512f-0fed-47fe-88a8-9db740721343	89f8d55d-8cac-4e9f-b00b-df54e5ea64ce	8	\N	\N	\N	\N	5.8e+06	5.8e+06	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Importado desde Excel	2026-06-02 15:27:56	2026-06-02 16:16:04
4453e21c-e5e1-4223-bed2-f0d83917878d	89f8d55d-8cac-4e9f-b00b-df54e5ea64ce	9	\N	\N	\N	\N	5.8e+06	5.8e+06	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Importado desde Excel	2026-06-02 15:27:56	2026-06-02 16:16:04
7106f2c7-46f2-475f-9b2b-aaa317a3bb08	89f8d55d-8cac-4e9f-b00b-df54e5ea64ce	10	\N	\N	\N	\N	5.8e+06	5.8e+06	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Importado desde Excel	2026-06-02 15:27:56	2026-06-02 16:16:04
df4c2f1a-2891-445f-bf0c-bb83153d457e	89f8d55d-8cac-4e9f-b00b-df54e5ea64ce	11	\N	\N	\N	\N	5.8e+06	5.8e+06	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Importado desde Excel	2026-06-02 15:27:56	2026-06-02 16:16:04
0ec5a00f-28e9-4800-b6fb-bdc5b0f70f93	89f8d55d-8cac-4e9f-b00b-df54e5ea64ce	12	\N	\N	\N	\N	5.8e+06	5.8e+06	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Importado desde Excel	2026-06-02 15:27:56	2026-06-02 16:16:04
cf605b54-dfc4-4f3f-b0e7-6b51b3eb2103	cca28c04-2fa0-46ad-85f0-71b7b3a83f3c	1	\N	\N	\N	\N	3.57759e+06	3.57759e+06	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Importado desde Excel	2026-06-02 15:27:56	2026-06-02 16:16:04
3ae851f6-ae52-4b3c-acc2-9d86e045007b	cca28c04-2fa0-46ad-85f0-71b7b3a83f3c	7	\N	\N	\N	\N	3.963048e+06	3.963048e+06	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Importado desde Excel	2026-06-02 15:27:56	2026-06-02 16:16:04
c06d85cd-8216-401a-8398-99b6cee53d4f	cca28c04-2fa0-46ad-85f0-71b7b3a83f3c	10	\N	\N	\N	\N	9.48e+06	9.48e+06	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Importado desde Excel	2026-06-02 15:27:56	2026-06-02 16:16:04
af454c36-c5dc-4ecb-a623-efbcf4c88f7e	dff972cd-bf25-4403-a360-932ee23e71c5	12	\N	\N	\N	\N	4.68e+06	4.68e+06	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Importado desde Excel	2026-06-02 15:27:56	2026-06-02 16:16:04
e1b237f4-f72b-454f-ac24-8ec4d3d17ade	1a1e6e4d-c5c4-45cf-941f-8bf3bdbb774e	1	\N	\N	\N	\N	1.935685e+06	1.935685e+06	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Importado desde Excel	2026-06-02 15:27:56	2026-06-02 16:16:04
fce573fc-78e5-4a08-9a13-7750104a676f	1a1e6e4d-c5c4-45cf-941f-8bf3bdbb774e	2	\N	\N	\N	\N	1.936975e+06	1.936975e+06	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Importado desde Excel	2026-06-02 15:27:56	2026-06-02 16:16:04
c8691192-9265-437d-8d46-86b4765f9d32	1a1e6e4d-c5c4-45cf-941f-8bf3bdbb774e	3	\N	\N	\N	\N	717151	717151	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Importado desde Excel	2026-06-02 15:27:56	2026-06-02 16:16:04
7f52fec1-5628-48ee-9a55-05235675e3f0	1a1e6e4d-c5c4-45cf-941f-8bf3bdbb774e	4	\N	\N	\N	\N	718103	718103	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Importado desde Excel	2026-06-02 15:27:56	2026-06-02 16:16:04
a7df1dd7-91c0-4c22-abce-43e521d8f92d	1a1e6e4d-c5c4-45cf-941f-8bf3bdbb774e	5	\N	\N	\N	\N	724926	724926	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Importado desde Excel	2026-06-02 15:27:56	2026-06-02 16:16:04
c35bc0b7-4cfd-4a81-879f-23d7dd16db65	1a1e6e4d-c5c4-45cf-941f-8bf3bdbb774e	6	\N	\N	\N	\N	720000	720000	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Importado desde Excel	2026-06-02 15:27:56	2026-06-02 16:16:04
beb47870-0035-4c48-86b4-4948cd9b082b	1a1e6e4d-c5c4-45cf-941f-8bf3bdbb774e	7	\N	\N	\N	\N	720000	720000	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Importado desde Excel	2026-06-02 15:27:56	2026-06-02 16:16:04
3a9240ca-c071-47ee-ba8d-c47d9aed444b	1a1e6e4d-c5c4-45cf-941f-8bf3bdbb774e	8	\N	\N	\N	\N	720000	720000	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Importado desde Excel	2026-06-02 15:27:56	2026-06-02 16:16:04
42c3eea5-2ee1-465b-a641-16555bbb63ba	1a1e6e4d-c5c4-45cf-941f-8bf3bdbb774e	9	\N	\N	\N	\N	720000	720000	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Importado desde Excel	2026-06-02 15:27:56	2026-06-02 16:16:04
cb77c920-0977-41ee-8e0b-c235d89576d4	1a1e6e4d-c5c4-45cf-941f-8bf3bdbb774e	10	\N	\N	\N	\N	720000	720000	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Importado desde Excel	2026-06-02 15:27:56	2026-06-02 16:16:04
f9933d52-1a31-4744-a9cf-5a0f5be83713	1a1e6e4d-c5c4-45cf-941f-8bf3bdbb774e	11	\N	\N	\N	\N	720000	720000	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Importado desde Excel	2026-06-02 15:27:56	2026-06-02 16:16:04
f5705c84-0f97-4dbb-87e2-2f348ef4e942	1a1e6e4d-c5c4-45cf-941f-8bf3bdbb774e	12	\N	\N	\N	\N	720000	720000	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Importado desde Excel	2026-06-02 15:27:56	2026-06-02 16:16:04
f55e1921-b625-44a8-9e70-8100e3e4a356	c992b1d1-209b-4205-a332-e705b9bb90b5	1	\N	\N	\N	\N	214630	214630	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Importado desde Excel	2026-06-02 15:27:56	2026-06-02 16:16:04
937c91e0-c6e6-4fc2-aabc-b7b8adeb042e	8285508a-30d2-4322-bb44-d0b4dfc5130f	5	\N	\N	\N	\N	4e+06	4e+06	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Importado desde Excel	2026-06-02 15:27:56	2026-06-02 16:16:04
80f45f62-65fd-4263-a2f0-b5cc0bd3b682	8285508a-30d2-4322-bb44-d0b4dfc5130f	6	\N	\N	\N	\N	3.745122e+06	3.745122e+06	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Importado desde Excel	2026-06-02 15:27:56	2026-06-02 16:16:04
f9a899f2-9191-490b-8473-026a32a340e3	92da538e-02a6-451c-a662-618695ce63c2	1	\N	\N	\N	\N	1.39052e+06	1.39052e+06	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Importado desde Excel	2026-06-02 15:27:56	2026-06-02 16:16:04
2c3ae943-a0c0-4e44-b6d3-64959487a256	92da538e-02a6-451c-a662-618695ce63c2	3	\N	\N	\N	\N	2.787728e+06	2.787728e+06	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Importado desde Excel	2026-06-02 15:27:56	2026-06-02 16:16:04
08e46815-9f11-4a77-96e5-b6ed71b7f733	92da538e-02a6-451c-a662-618695ce63c2	4	\N	\N	\N	\N	1.396311e+06	1.396311e+06	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Importado desde Excel	2026-06-02 15:27:56	2026-06-02 16:16:04
99d80d64-9d37-4695-820b-82e2fbd76e81	92da538e-02a6-451c-a662-618695ce63c2	5	\N	\N	\N	\N	1.407004e+06	1.407004e+06	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Importado desde Excel	2026-06-02 15:27:56	2026-06-02 16:16:04
f133abd9-45fe-49b1-a19b-89a718f968db	92da538e-02a6-451c-a662-618695ce63c2	6	\N	\N	\N	\N	1.393e+06	1.393e+06	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Importado desde Excel	2026-06-02 15:27:56	2026-06-02 16:16:04
3c98f8b6-5c8c-43c6-8707-66d08db7c5f0	92da538e-02a6-451c-a662-618695ce63c2	7	\N	\N	\N	\N	1.393e+06	1.393e+06	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Importado desde Excel	2026-06-02 15:27:56	2026-06-02 16:16:04
b8b7b590-e17d-470a-b901-59665da050cf	92da538e-02a6-451c-a662-618695ce63c2	8	\N	\N	\N	\N	1.393e+06	1.393e+06	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Importado desde Excel	2026-06-02 15:27:56	2026-06-02 16:16:04
0df72e24-8779-4c92-86b9-d51a22d5009a	92da538e-02a6-451c-a662-618695ce63c2	9	\N	\N	\N	\N	1.393e+06	1.393e+06	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Importado desde Excel	2026-06-02 15:27:56	2026-06-02 16:16:04
599c5e19-4ca9-4a5f-8534-5f359f87e872	92da538e-02a6-451c-a662-618695ce63c2	10	\N	\N	\N	\N	1.393e+06	1.393e+06	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Importado desde Excel	2026-06-02 15:27:56	2026-06-02 16:16:04
fcffe91d-b0f2-4830-99ee-24176162cc81	92da538e-02a6-451c-a662-618695ce63c2	11	\N	\N	\N	\N	1.393e+06	1.393e+06	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Importado desde Excel	2026-06-02 15:27:56	2026-06-02 16:16:04
57541a9d-a52b-4221-99fa-9293b1af2d27	92da538e-02a6-451c-a662-618695ce63c2	12	\N	\N	\N	\N	1.393e+06	1.393e+06	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Importado desde Excel	2026-06-02 15:27:56	2026-06-02 16:16:04
04ba0d13-33d8-414a-918f-20c9144c906d	f39bd107-dd8e-4afc-aa80-1395d4e139f4	2	\N	\N	\N	\N	2.384036e+06	2.384036e+06	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Importado desde Excel	2026-06-02 15:27:56	2026-06-02 16:16:04
37bf1105-d4db-4b83-bd8f-a964b9f4cb33	f39bd107-dd8e-4afc-aa80-1395d4e139f4	3	\N	\N	\N	\N	4.781006e+06	4.781006e+06	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Importado desde Excel	2026-06-02 15:27:56	2026-06-02 16:16:04
8ff78161-76dd-403d-8a8c-78dfef15afcc	f39bd107-dd8e-4afc-aa80-1395d4e139f4	4	\N	\N	\N	\N	2.411207e+06	2.411207e+06	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Importado desde Excel	2026-06-02 15:27:56	2026-06-02 16:16:04
818d2f44-6561-4a19-8126-a44bc7a920b5	f39bd107-dd8e-4afc-aa80-1395d4e139f4	5	\N	\N	\N	\N	2.411207e+06	2.411207e+06	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Importado desde Excel	2026-06-02 15:27:56	2026-06-02 16:16:04
76635b76-e9f6-4be9-8821-5319e8f32502	f39bd107-dd8e-4afc-aa80-1395d4e139f4	6	\N	\N	\N	\N	2.37e+06	2.37e+06	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Importado desde Excel	2026-06-02 15:27:56	2026-06-02 16:16:04
ded902b5-eca7-4a68-9b74-7b9ec39852eb	9f1a9c52-26a2-493c-b7c6-e157844f3895	3	\N	\N	\N	\N	8.222048e+06	8.222048e+06	MANUAL_CLP	\N	EXCEL_IMPORTADO	1	Importado desde Excel	2026-06-02 15:27:56	2026-06-02 16:16:04
f5f7e13b-4656-4c4b-9fde-23fd1d93777a	13eed094-8b66-4443-bfbe-0a0858928e7d	2	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
cd735389-fd04-4b6d-91e1-b1962f23ffdd	13eed094-8b66-4443-bfbe-0a0858928e7d	3	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
e9e0e067-54c9-4885-97aa-e4f0b7203644	13eed094-8b66-4443-bfbe-0a0858928e7d	4	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
e9127198-4929-449f-b723-053a72f5ab53	13eed094-8b66-4443-bfbe-0a0858928e7d	6	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
e73fb663-f455-415c-abab-53c77f52173b	13eed094-8b66-4443-bfbe-0a0858928e7d	7	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
fdf8aed5-1410-4e53-bdb5-a045505fd2ce	13eed094-8b66-4443-bfbe-0a0858928e7d	8	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
fc3be552-dbf2-495b-9c0c-967bea3d064f	13eed094-8b66-4443-bfbe-0a0858928e7d	9	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
9b6c2e0b-56cc-4157-bee9-74ad821f521d	13eed094-8b66-4443-bfbe-0a0858928e7d	10	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
4e7b687b-df35-458d-89ab-9394311b889e	13eed094-8b66-4443-bfbe-0a0858928e7d	11	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
9b03d2e9-a5e4-490f-9b6f-621aaecf88c3	13eed094-8b66-4443-bfbe-0a0858928e7d	12	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
b0ca10fa-07c6-47f0-bc13-e2c4f3a13947	8229ab41-223c-41b2-b4c7-ac775c882ae8	1	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
f830de1c-0c13-42fd-883d-e24945e6d791	8229ab41-223c-41b2-b4c7-ac775c882ae8	2	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
94539040-821f-40e4-a752-73b27d7bb1e3	8229ab41-223c-41b2-b4c7-ac775c882ae8	3	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
b4fb2fbf-3dd4-440d-a28b-11cb08cc4a15	8229ab41-223c-41b2-b4c7-ac775c882ae8	4	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
c4e2a648-7fff-442e-8870-1a9e82b2a374	8229ab41-223c-41b2-b4c7-ac775c882ae8	6	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
4598bc13-a667-4966-a087-f4c993047cdb	8229ab41-223c-41b2-b4c7-ac775c882ae8	7	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
fa94ea2e-3865-4cdb-879e-fcc85912a38d	8229ab41-223c-41b2-b4c7-ac775c882ae8	8	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
feef4cfa-55b4-4d14-8a3f-befd34dc3a0a	8229ab41-223c-41b2-b4c7-ac775c882ae8	9	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
af6a3872-7a44-46f5-b02c-11704189d891	8229ab41-223c-41b2-b4c7-ac775c882ae8	10	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
2fafc745-41ae-4ef7-a2b3-8094a484b0e2	8229ab41-223c-41b2-b4c7-ac775c882ae8	11	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
a2e25b97-ad80-4561-a937-f8a997b2daf0	8229ab41-223c-41b2-b4c7-ac775c882ae8	12	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
3a1c70a7-8f1f-490a-bb9e-884073d5494d	6e08b1e3-6307-4209-860e-fd3c1c12b765	1	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
f9b41f80-f770-453e-b76e-1a575d8030de	6e08b1e3-6307-4209-860e-fd3c1c12b765	2	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
3a8fad7c-e2d9-43c9-aa9c-972ba73961db	6e08b1e3-6307-4209-860e-fd3c1c12b765	4	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
0ee0b754-3a44-4f92-880d-de94e6966883	6e08b1e3-6307-4209-860e-fd3c1c12b765	5	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
00327bd4-1979-48a4-8d35-ada090d4b7cb	6e08b1e3-6307-4209-860e-fd3c1c12b765	6	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
248e51ec-75e0-4f29-9538-6236b2fcc647	6e08b1e3-6307-4209-860e-fd3c1c12b765	7	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
56684766-215d-4fc6-bb7c-656d3f0a8b6d	6e08b1e3-6307-4209-860e-fd3c1c12b765	8	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
53258a88-a7f3-431c-b04e-8f951dc2982b	6e08b1e3-6307-4209-860e-fd3c1c12b765	9	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
0683e14c-135f-4dbe-b00d-5d5b0bd79c1c	6e08b1e3-6307-4209-860e-fd3c1c12b765	10	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
7cc86dca-bd3f-44de-a5ee-3757e650976c	6e08b1e3-6307-4209-860e-fd3c1c12b765	11	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
967f62cd-1c25-4c26-bc9f-f5537a8a522f	6e08b1e3-6307-4209-860e-fd3c1c12b765	12	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
4cbb949e-2e8b-4a60-9dd5-66b91ceff27d	82f01d2a-e48d-4d25-9065-6942d72bd6ef	1	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
588fc05f-3ef6-429d-8f34-1c86af7c38a1	82f01d2a-e48d-4d25-9065-6942d72bd6ef	2	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
07c1be25-4a90-40e8-86a6-7b355ce66cf9	82f01d2a-e48d-4d25-9065-6942d72bd6ef	3	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
91b3d591-ba91-4fb4-a9ae-52f7fbf27e2d	82f01d2a-e48d-4d25-9065-6942d72bd6ef	4	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
141439a6-f50e-4457-a6fa-b7891fde51d2	82f01d2a-e48d-4d25-9065-6942d72bd6ef	6	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
e166ed56-bd0c-4064-91fd-8db9f71e5d51	82f01d2a-e48d-4d25-9065-6942d72bd6ef	7	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
19a90851-b324-4dc6-95cc-65d02767461f	82f01d2a-e48d-4d25-9065-6942d72bd6ef	8	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
2469fddc-6293-4ccd-a951-dba9e69e2ed2	82f01d2a-e48d-4d25-9065-6942d72bd6ef	9	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
563e5d71-c6f2-4868-bcd3-e13503afd5c9	82f01d2a-e48d-4d25-9065-6942d72bd6ef	10	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
ea42590f-8062-4e0f-9c5e-fe0063f15bfb	82f01d2a-e48d-4d25-9065-6942d72bd6ef	11	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
3d0bbc2d-3697-4e32-9ced-af45b7bfc73b	82f01d2a-e48d-4d25-9065-6942d72bd6ef	12	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
311418c0-9567-4ce6-8905-6ee46b3e9425	c3df63f8-1b5b-4677-a4aa-881b11729eae	1	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
cb0fbb47-c9c1-49ba-b2aa-0bc04e1ca0ea	c3df63f8-1b5b-4677-a4aa-881b11729eae	2	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
b3b24c88-1880-4e3d-af32-580699d2a6b6	c3df63f8-1b5b-4677-a4aa-881b11729eae	3	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
ceac0281-7b02-4844-b574-2ceb1c05037e	c3df63f8-1b5b-4677-a4aa-881b11729eae	4	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
cf29bdfa-dba4-4943-88c3-d42abde0374d	c3df63f8-1b5b-4677-a4aa-881b11729eae	6	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
ff2b11e1-ce49-4ebf-aeba-224162701019	c3df63f8-1b5b-4677-a4aa-881b11729eae	7	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
80a012f4-9099-423c-8362-5ec7e283096d	c3df63f8-1b5b-4677-a4aa-881b11729eae	8	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
f0f45cbd-2439-425d-88b7-0c4f02b5c404	c3df63f8-1b5b-4677-a4aa-881b11729eae	9	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
64b90f31-cc10-4a95-bebe-6688ecf2c61a	c3df63f8-1b5b-4677-a4aa-881b11729eae	10	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
25d0b83c-13de-4aa8-9f16-2c67cb136b56	c3df63f8-1b5b-4677-a4aa-881b11729eae	11	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
6bc45c9d-3610-45c5-a07e-49f2cd744dff	c3df63f8-1b5b-4677-a4aa-881b11729eae	12	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
8e7b3e84-7fff-4038-8abb-19bd84b16af2	4b02d7c5-adcb-4e7e-96e5-f56211fb7d47	1	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
1f308158-6dff-4bf6-bbd7-60bf08a7fe3e	4b02d7c5-adcb-4e7e-96e5-f56211fb7d47	2	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
98ebfded-b94b-4e99-bc12-a29ee7538531	4b02d7c5-adcb-4e7e-96e5-f56211fb7d47	3	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
acde82f7-6fe7-423e-9127-25333f5d3fff	4b02d7c5-adcb-4e7e-96e5-f56211fb7d47	4	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
cc53f9d0-32b0-47e8-a17f-7984aaefa033	4b02d7c5-adcb-4e7e-96e5-f56211fb7d47	6	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
89aed35e-2bba-4596-8fe9-cea3a61e06aa	4b02d7c5-adcb-4e7e-96e5-f56211fb7d47	7	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
0155f8f1-9ae5-44f3-ae3d-81dc1e4c862c	4b02d7c5-adcb-4e7e-96e5-f56211fb7d47	8	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
5894f528-8d98-41c6-b28c-6d12e716a7ec	4b02d7c5-adcb-4e7e-96e5-f56211fb7d47	9	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
5c0196f4-8d7a-408a-bd0f-cfb8abdaf5b8	4b02d7c5-adcb-4e7e-96e5-f56211fb7d47	10	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
82ae8798-30c5-4884-b1ef-a5e1fe37b6fd	4b02d7c5-adcb-4e7e-96e5-f56211fb7d47	11	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
54f035d7-219a-4e78-9d8d-70b5096a87cf	4b02d7c5-adcb-4e7e-96e5-f56211fb7d47	12	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
1b938ba2-bf17-4ea1-85ac-ff433dcbfa22	23bdd370-e4b6-4ca9-b775-114383948be0	2	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
c7ae5071-33a4-489f-ac06-08d851586349	23bdd370-e4b6-4ca9-b775-114383948be0	3	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
cb7d98c8-1ff0-47c6-8bda-bfaaeeb4f175	23bdd370-e4b6-4ca9-b775-114383948be0	4	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
5b75dc89-7345-40e4-a09b-fb93acdbbcb6	23bdd370-e4b6-4ca9-b775-114383948be0	6	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
f932cc54-78c3-4e14-88df-e7ce03ab8919	23bdd370-e4b6-4ca9-b775-114383948be0	7	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
d81d883a-c328-4c05-b2ba-f2478ba106bf	23bdd370-e4b6-4ca9-b775-114383948be0	8	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
f8c8b806-e5c6-4cf2-939f-75c518ac8c84	23bdd370-e4b6-4ca9-b775-114383948be0	9	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
7fff5c51-5a4c-4530-af3d-1b1a6c2a918e	23bdd370-e4b6-4ca9-b775-114383948be0	10	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
335885c7-f2c9-4d94-8bb8-bd7229c80892	23bdd370-e4b6-4ca9-b775-114383948be0	11	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
7634699b-d5c5-4f60-8c31-2498fe1385ff	23bdd370-e4b6-4ca9-b775-114383948be0	12	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
a387d0d6-f2be-40a9-ae91-daec30197427	8edd6a6c-0dcd-4a77-a799-e12454b93226	1	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
b1f130de-94b3-4976-968a-a024d30ebaa0	8edd6a6c-0dcd-4a77-a799-e12454b93226	2	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
b572a272-ce72-4086-aafe-3c86ada213a3	8edd6a6c-0dcd-4a77-a799-e12454b93226	3	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
56acee9d-4158-4613-9bb0-9bbf24c39456	8edd6a6c-0dcd-4a77-a799-e12454b93226	4	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
7eabfdf7-f3f6-459b-9f51-d32c2e38145e	8edd6a6c-0dcd-4a77-a799-e12454b93226	6	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
fa3cadb0-decb-4bfe-bad7-665defd12aa3	8edd6a6c-0dcd-4a77-a799-e12454b93226	7	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
6fb03bd9-4cb3-4836-862c-398d86a606bf	8edd6a6c-0dcd-4a77-a799-e12454b93226	8	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
28032d20-a9ce-4b3e-9cb5-9c91bd8ba19d	8edd6a6c-0dcd-4a77-a799-e12454b93226	9	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
14f86310-4205-4f9e-848f-88cfeb527b2f	8edd6a6c-0dcd-4a77-a799-e12454b93226	10	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
68718ca5-9d71-47c9-a475-8af62bee0b7d	8edd6a6c-0dcd-4a77-a799-e12454b93226	11	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
1697fe70-bb96-49a0-99bc-16c6493021bf	8edd6a6c-0dcd-4a77-a799-e12454b93226	12	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
da04c5d9-d076-42fe-b207-32c90ebc5364	11534164-d017-46e0-932d-61d95de679be	1	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
90bb7815-d7fa-4270-ae7d-45b87826ccd7	11534164-d017-46e0-932d-61d95de679be	2	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
e2d9d340-097f-47a3-804b-1d46ac970693	11534164-d017-46e0-932d-61d95de679be	3	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
7fd6884c-3746-42d7-bf01-3263c64c052a	11534164-d017-46e0-932d-61d95de679be	4	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
e49d6aaa-136f-42c4-b9e3-2245d9c4b778	11534164-d017-46e0-932d-61d95de679be	6	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
9a377b0c-c92e-46f9-9d95-3e5181aa027b	11534164-d017-46e0-932d-61d95de679be	7	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
a8b34348-0768-49da-ac5a-abc6e786c953	11534164-d017-46e0-932d-61d95de679be	8	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
f50eaba1-6b32-45bb-a107-0c440c66c7b6	11534164-d017-46e0-932d-61d95de679be	9	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
f3fa6c8b-07c4-4613-b475-44d66908c2a7	11534164-d017-46e0-932d-61d95de679be	10	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
f1d3c7ff-defb-4bd4-a80c-e10f4acd45de	11534164-d017-46e0-932d-61d95de679be	11	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
657fd83f-5449-4761-8dce-4dd5d7de3d73	11534164-d017-46e0-932d-61d95de679be	12	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
5af4e348-a646-4714-9e9d-a29981e1882a	33f01c20-8944-48dc-963f-f69504e74f64	1	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
e4660e14-6da8-4fba-93f1-33a680f25737	33f01c20-8944-48dc-963f-f69504e74f64	2	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
358531b8-59eb-4a96-ae03-5482b7f63a3d	33f01c20-8944-48dc-963f-f69504e74f64	3	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
4558d16d-5b4a-4cdc-8011-d923e4f700e0	33f01c20-8944-48dc-963f-f69504e74f64	4	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
710c0188-e99a-4dc3-9b0a-c8c359663f53	33f01c20-8944-48dc-963f-f69504e74f64	5	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
7662c4da-133d-471d-be79-5e8429054d87	33f01c20-8944-48dc-963f-f69504e74f64	6	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
3128e586-5640-4f33-9da0-714b317da1b4	33f01c20-8944-48dc-963f-f69504e74f64	7	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
35968e64-9a17-4922-85ec-fe24d41e3936	33f01c20-8944-48dc-963f-f69504e74f64	8	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
927f508e-d736-4041-80ce-76be0f0414c7	33f01c20-8944-48dc-963f-f69504e74f64	9	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
f5659b79-e0eb-4a28-86e4-99dc303c2621	33f01c20-8944-48dc-963f-f69504e74f64	11	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
f9ce5e5c-a903-489f-b0d1-1171ed36daec	ebe818cf-4800-4191-9a30-d6121888b5ab	1	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
b6088159-9608-4c77-a450-9df535d9de74	ebe818cf-4800-4191-9a30-d6121888b5ab	2	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
e3727d40-a3f4-4625-b28c-9520acbe8f31	ebe818cf-4800-4191-9a30-d6121888b5ab	3	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
d23df5d3-2701-4603-b685-ee3d88f986ed	ebe818cf-4800-4191-9a30-d6121888b5ab	4	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
7af6a254-37c6-4d7c-a523-37453a7631f6	ebe818cf-4800-4191-9a30-d6121888b5ab	6	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
6400378e-bac9-4dc3-aeab-052a2912717c	ebe818cf-4800-4191-9a30-d6121888b5ab	7	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
c99fe1cf-e206-4ae3-9b4d-11496d33012d	ebe818cf-4800-4191-9a30-d6121888b5ab	9	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
11e5c3e0-f3ab-4c69-8370-4ba7a6795119	ebe818cf-4800-4191-9a30-d6121888b5ab	11	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
23482f88-4e50-4f34-ab8c-eb7bdeb59509	ebe818cf-4800-4191-9a30-d6121888b5ab	12	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
7d410980-7cdf-4bfb-a4e7-c3581f004569	e5c1ce12-6e3d-4b96-80dc-2b52b286263f	1	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
e6fee1a9-e60e-4dfd-b3a8-410da8a0417b	e5c1ce12-6e3d-4b96-80dc-2b52b286263f	3	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
62d5479f-0944-431c-9f55-3852cd270d2c	e5c1ce12-6e3d-4b96-80dc-2b52b286263f	4	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
10243ab6-8f47-4dd5-b9a8-43b12f54df44	e5c1ce12-6e3d-4b96-80dc-2b52b286263f	5	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
7c062f57-8e51-4a5b-a02c-5137e6c08bcc	e5c1ce12-6e3d-4b96-80dc-2b52b286263f	6	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
d30cf73f-d561-4d77-80ab-562cbd9db846	e5c1ce12-6e3d-4b96-80dc-2b52b286263f	7	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
d8a7d2c8-d8a7-40ae-97ce-1f8d03c33759	e5c1ce12-6e3d-4b96-80dc-2b52b286263f	8	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
e1c82c21-46ce-485b-80ac-5dcccfb01d3d	e5c1ce12-6e3d-4b96-80dc-2b52b286263f	9	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
c62f5def-571b-418b-b882-19eb528bbb37	e5c1ce12-6e3d-4b96-80dc-2b52b286263f	10	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
1259c8d6-89e9-47ef-92cb-103f2fdcea40	e5c1ce12-6e3d-4b96-80dc-2b52b286263f	11	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
38e47b8f-723e-4fd5-abab-f45f00668dc5	e5c1ce12-6e3d-4b96-80dc-2b52b286263f	12	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
24e66a49-fd55-47a3-8797-8d0ede971680	4215ee2e-2a8d-4c5f-bfcd-39af81345dd2	1	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
8c1e4502-b06e-4124-9087-02b98353193c	4215ee2e-2a8d-4c5f-bfcd-39af81345dd2	2	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
ce9e913f-59b6-4baf-b366-46c8d52a0533	4215ee2e-2a8d-4c5f-bfcd-39af81345dd2	3	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
b7f9d56c-5b12-4239-9416-94a55831ae82	4215ee2e-2a8d-4c5f-bfcd-39af81345dd2	4	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
641b5a11-11bf-43b9-893b-297b401b20f5	4215ee2e-2a8d-4c5f-bfcd-39af81345dd2	5	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
3fe32d5b-5fb2-4c31-94bc-86ac3c4b5fcc	4215ee2e-2a8d-4c5f-bfcd-39af81345dd2	6	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
97002cdb-46bb-422b-9a3b-d48df5e69415	4215ee2e-2a8d-4c5f-bfcd-39af81345dd2	7	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
29ee5202-9b11-48bc-90ec-d3b3b0d94e36	4215ee2e-2a8d-4c5f-bfcd-39af81345dd2	9	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
32c81973-d6fb-4ad1-8eab-0b64a3bff684	4215ee2e-2a8d-4c5f-bfcd-39af81345dd2	10	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
7ff8a56b-d932-4999-a226-b81c8b139c35	4215ee2e-2a8d-4c5f-bfcd-39af81345dd2	11	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
dbe0dfc4-b63b-450b-9f17-746ad17ff2da	4215ee2e-2a8d-4c5f-bfcd-39af81345dd2	12	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
97d3fb86-e065-427e-8cb5-f8e0453b4e73	83f15dd7-ebc3-4d7e-99a7-c6de2b1e9e2c	1	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
50379169-8313-470d-a99c-054da1aa4f56	83f15dd7-ebc3-4d7e-99a7-c6de2b1e9e2c	2	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
938fc0a1-91ea-49f7-9648-929e155fc170	83f15dd7-ebc3-4d7e-99a7-c6de2b1e9e2c	3	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
a678ebaa-881b-4ad5-82b6-35b6d28e4ffe	83f15dd7-ebc3-4d7e-99a7-c6de2b1e9e2c	4	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
1aacb66d-07f0-402c-a160-08f24b9f0768	83f15dd7-ebc3-4d7e-99a7-c6de2b1e9e2c	5	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
119fa574-0e8e-48c9-953e-05d0dfd968c1	83f15dd7-ebc3-4d7e-99a7-c6de2b1e9e2c	6	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
0aa98d69-f729-4565-987d-a72e438181f3	83f15dd7-ebc3-4d7e-99a7-c6de2b1e9e2c	7	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
bf717237-58b5-42eb-b441-ae111b973279	83f15dd7-ebc3-4d7e-99a7-c6de2b1e9e2c	9	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
cabee412-6d1d-4b6e-8612-077053f4c2d2	83f15dd7-ebc3-4d7e-99a7-c6de2b1e9e2c	10	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
3559fa6f-cf53-4655-9c73-5ae4476850df	83f15dd7-ebc3-4d7e-99a7-c6de2b1e9e2c	11	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
bf2b2488-19d6-44fe-b34f-cb7b9e769753	83f15dd7-ebc3-4d7e-99a7-c6de2b1e9e2c	12	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
300f1200-8f25-4f03-b6c1-d3d735b2d263	548e4ae8-cfe4-43e7-8fbd-20eec374a252	1	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
342e05c2-efde-4b29-be92-0c8bceac9997	548e4ae8-cfe4-43e7-8fbd-20eec374a252	2	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
91c34371-d1b0-4646-badf-53d81945c250	548e4ae8-cfe4-43e7-8fbd-20eec374a252	3	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
36fa318b-e46d-4d6b-a880-e846a90b3fcb	548e4ae8-cfe4-43e7-8fbd-20eec374a252	4	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
103b70a7-f02f-4414-bebf-bf53fe7b7fbb	548e4ae8-cfe4-43e7-8fbd-20eec374a252	6	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
150adeb3-0b97-4ead-8c0c-51a2bf165fbd	548e4ae8-cfe4-43e7-8fbd-20eec374a252	7	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
73be7ca9-1a43-4a13-9641-df10b12aab4b	548e4ae8-cfe4-43e7-8fbd-20eec374a252	9	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
5dbd416e-ce86-4c76-9fbd-82c171afb721	548e4ae8-cfe4-43e7-8fbd-20eec374a252	10	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
1bc07985-ae0a-4214-a353-4f528a3642b0	548e4ae8-cfe4-43e7-8fbd-20eec374a252	11	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
fabab184-c23c-4fdf-aeab-0c8b66dfe0a9	548e4ae8-cfe4-43e7-8fbd-20eec374a252	12	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
1b3f2851-5f9e-45eb-8d0c-fc9789ab7122	36028989-ea20-41f5-b246-c8e44c1e6b61	4	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
82e8bf4d-e974-4ac3-8d65-e12a2002a10d	36028989-ea20-41f5-b246-c8e44c1e6b61	5	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
ef472754-beb5-4fba-8b69-cc8cde3c1b70	36028989-ea20-41f5-b246-c8e44c1e6b61	6	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
b13d5351-2772-43c1-ba14-037569a86ce0	36028989-ea20-41f5-b246-c8e44c1e6b61	7	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
eee6a36d-eed9-441e-b34b-c4a947f7841c	36028989-ea20-41f5-b246-c8e44c1e6b61	8	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
debe8929-1ffc-4fa5-a09e-90f79a15b94f	36028989-ea20-41f5-b246-c8e44c1e6b61	9	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
eeed7302-d8f6-4910-bba8-59d870300354	36028989-ea20-41f5-b246-c8e44c1e6b61	10	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
214cb69a-2c15-404f-8fbb-dddf9eb5fdf6	36028989-ea20-41f5-b246-c8e44c1e6b61	11	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
7dfe547f-942a-41f5-94ba-3d9912badf0f	36028989-ea20-41f5-b246-c8e44c1e6b61	12	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
ef2afe9e-1181-44da-a659-98814cedcdfa	681cc031-9409-4acc-a962-dbb677dbe942	1	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
b6650d2c-2b97-4a74-a969-23a3f99dc8ff	681cc031-9409-4acc-a962-dbb677dbe942	2	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
1e86d685-52a8-4371-815f-6bde396f9064	681cc031-9409-4acc-a962-dbb677dbe942	3	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
aa06bb9c-0cd5-4897-80f1-ac9f30a29f8e	681cc031-9409-4acc-a962-dbb677dbe942	4	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
9aea93e5-54d6-4bdb-9a3c-410a8c16172e	681cc031-9409-4acc-a962-dbb677dbe942	6	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
90322d6c-2c80-4559-b1cf-2d4298987f8d	681cc031-9409-4acc-a962-dbb677dbe942	7	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
3222edfd-f267-446c-b62e-3270e83175ff	681cc031-9409-4acc-a962-dbb677dbe942	8	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
c1b283d8-9da0-43c4-9537-6b85406fe7c5	681cc031-9409-4acc-a962-dbb677dbe942	9	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
442aae1d-4789-4971-86a5-17f2f7c4490e	681cc031-9409-4acc-a962-dbb677dbe942	10	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
4f725029-64c2-4722-a48f-8e1b463c0a7d	681cc031-9409-4acc-a962-dbb677dbe942	11	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
579ca33e-034f-491a-8c2a-dadcde6650e8	681cc031-9409-4acc-a962-dbb677dbe942	12	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
7e1704aa-b909-4ada-a90c-09be585dba32	6bc2ac0e-215a-424b-9a42-840812e3981f	1	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
1345168b-633e-457a-9da3-732268760dbc	6bc2ac0e-215a-424b-9a42-840812e3981f	2	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
b7b21b17-173d-4afd-9218-4ef71a20f3b9	6bc2ac0e-215a-424b-9a42-840812e3981f	3	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
a88bedac-646c-4653-9f90-247bd9b46816	6bc2ac0e-215a-424b-9a42-840812e3981f	4	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
717b10ba-7e63-4b01-bf7b-b638482c6b32	6bc2ac0e-215a-424b-9a42-840812e3981f	6	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
9d46ab0d-ab6d-49b7-92b2-0304f57cbb4f	6bc2ac0e-215a-424b-9a42-840812e3981f	7	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
981843ea-c6b7-440e-8eac-84d80764c4c1	6bc2ac0e-215a-424b-9a42-840812e3981f	8	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
716ce062-ab08-4e79-93c9-d2dc0275b8f5	6bc2ac0e-215a-424b-9a42-840812e3981f	9	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
45825da4-1fe9-4ab4-b144-11659396f73c	6bc2ac0e-215a-424b-9a42-840812e3981f	10	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
e7350cd2-3ad8-4856-bc80-6b14d42317eb	6bc2ac0e-215a-424b-9a42-840812e3981f	11	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
5076e259-ad0e-4c17-a5d5-07b91488360f	6bc2ac0e-215a-424b-9a42-840812e3981f	12	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
d5cca8e3-93e2-4a78-9168-8478330af879	98eec03c-3ab2-4ba1-b891-dbd79c2a7bd6	2	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
86e00066-2955-4c99-ac90-f94ea5837eb3	98eec03c-3ab2-4ba1-b891-dbd79c2a7bd6	4	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
543beaea-5c7d-4221-94f5-967520271ff2	98eec03c-3ab2-4ba1-b891-dbd79c2a7bd6	6	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
de4eb3c8-e7d7-4af8-8678-9d95e32e71d6	98eec03c-3ab2-4ba1-b891-dbd79c2a7bd6	7	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
07b9ffe7-389f-43ee-bc20-b1e8d63a160f	98eec03c-3ab2-4ba1-b891-dbd79c2a7bd6	8	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
5dcd53a1-c688-477b-a18f-5b8e229e0eba	98eec03c-3ab2-4ba1-b891-dbd79c2a7bd6	9	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
d4e5dfae-68b6-476a-934c-65e15ed46e48	98eec03c-3ab2-4ba1-b891-dbd79c2a7bd6	11	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
722b5144-5770-41a2-999f-c03f4370f2e7	98eec03c-3ab2-4ba1-b891-dbd79c2a7bd6	12	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
ef2cbfc9-c990-41b4-a90a-203de97e538b	fa91cc8e-ecaf-48dd-91f6-a87c7cfe5f73	1	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
0148ab49-a563-47ef-88b9-679a15375f10	fa91cc8e-ecaf-48dd-91f6-a87c7cfe5f73	2	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
42681dce-f848-4b6e-aaff-3714c82191d1	fa91cc8e-ecaf-48dd-91f6-a87c7cfe5f73	3	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
0e0e4d85-49c4-4ae5-9e9f-1b01a493f94a	fa91cc8e-ecaf-48dd-91f6-a87c7cfe5f73	4	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
39351d6b-f546-4257-822f-8ce6f869e3b9	fa91cc8e-ecaf-48dd-91f6-a87c7cfe5f73	6	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
edca9c92-1988-4326-a700-35480ec1773c	fa91cc8e-ecaf-48dd-91f6-a87c7cfe5f73	7	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
14b003a9-564e-46e7-b3c4-b50c12b5e2d6	fa91cc8e-ecaf-48dd-91f6-a87c7cfe5f73	8	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
13eb8dc0-804f-493e-ba04-3fc053577730	fa91cc8e-ecaf-48dd-91f6-a87c7cfe5f73	9	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
0b586ed2-5204-4a49-b783-f790c0da8b82	fa91cc8e-ecaf-48dd-91f6-a87c7cfe5f73	10	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
09e91149-0383-44b7-a3b9-26446d1b2893	fa91cc8e-ecaf-48dd-91f6-a87c7cfe5f73	11	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
9d1da88d-d82b-4125-b30d-4ff4f2c0c4fc	fa91cc8e-ecaf-48dd-91f6-a87c7cfe5f73	12	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
a26ca53b-90b4-4992-a93c-7396e7f6a1c6	fb3fdd4e-94d2-4014-b286-b416725602bb	1	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
b2dff795-2f82-45bb-b526-202860ae247b	fb3fdd4e-94d2-4014-b286-b416725602bb	2	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
f2fafab9-9b4f-4f3f-ad64-bb974222ab07	fb3fdd4e-94d2-4014-b286-b416725602bb	3	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
49a85e87-717a-4b71-b65f-de01146018ff	fb3fdd4e-94d2-4014-b286-b416725602bb	4	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
5a85adfb-b399-49e5-a037-d78df866e864	fb3fdd4e-94d2-4014-b286-b416725602bb	6	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
7fc46ad4-57b8-4bbb-a06e-c727c2c022fb	fb3fdd4e-94d2-4014-b286-b416725602bb	7	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
b33d169d-bbe0-489f-a721-075a43e0563b	fb3fdd4e-94d2-4014-b286-b416725602bb	9	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
17326b8d-f42b-4fe3-a5ca-0bcab9c1b0aa	fb3fdd4e-94d2-4014-b286-b416725602bb	11	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
57cb5307-c243-4292-bbb1-ad5ff3089bd2	fb3fdd4e-94d2-4014-b286-b416725602bb	12	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
fc64c30e-5a24-4423-a002-eb6bf2ba017f	cc653b6e-0d4e-4f16-bcd1-d9fd252bcf28	1	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
465c3cf3-3162-4dfe-bc6b-773dbf926e10	cc653b6e-0d4e-4f16-bcd1-d9fd252bcf28	2	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
e921dbe8-9359-4794-bc09-f8bd0dd9e809	cc653b6e-0d4e-4f16-bcd1-d9fd252bcf28	4	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
34c92744-5bc2-4565-98c2-8b0104fd8a87	cc653b6e-0d4e-4f16-bcd1-d9fd252bcf28	5	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
d772ce3a-b8a6-429f-a989-3b1fe4e809cc	cc653b6e-0d4e-4f16-bcd1-d9fd252bcf28	6	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
3d069910-5ec3-442a-9009-346c0d5dc346	cc653b6e-0d4e-4f16-bcd1-d9fd252bcf28	7	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
f8accda1-1b96-4b67-9de6-200588aba11c	cc653b6e-0d4e-4f16-bcd1-d9fd252bcf28	8	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
535cbcb9-1bb3-4531-8c4a-6ac403a95c01	cc653b6e-0d4e-4f16-bcd1-d9fd252bcf28	9	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
38de3ae0-5eca-464f-b9f9-8f4ab9748f53	cc653b6e-0d4e-4f16-bcd1-d9fd252bcf28	11	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
8fa224f3-85f9-4867-b34a-6d3dd657eb71	cc653b6e-0d4e-4f16-bcd1-d9fd252bcf28	12	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
697d003f-ceda-421a-ba89-75317bb3a846	143a0b7e-2296-4dbb-86a6-f0c534c5b414	1	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
cd229c5c-5180-4f31-b4d8-bc5433b14c35	143a0b7e-2296-4dbb-86a6-f0c534c5b414	2	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
45ea714b-bd1c-4660-ab47-e0048ac2a24c	143a0b7e-2296-4dbb-86a6-f0c534c5b414	3	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
40c57425-6d50-446c-9b56-078f5a01533f	143a0b7e-2296-4dbb-86a6-f0c534c5b414	4	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
9573679c-9b1b-44e3-b2e0-2f880f5a03df	143a0b7e-2296-4dbb-86a6-f0c534c5b414	5	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
79938445-c754-4344-8252-dd22b8ea92ce	143a0b7e-2296-4dbb-86a6-f0c534c5b414	6	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
884f5dff-cbe5-4bc6-ad23-281b4a324d12	143a0b7e-2296-4dbb-86a6-f0c534c5b414	7	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
2fa69da0-9753-4c72-ae2e-c54c07b17da2	143a0b7e-2296-4dbb-86a6-f0c534c5b414	9	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
c8dd26e7-bc48-4f21-82a2-1d82d0e31445	143a0b7e-2296-4dbb-86a6-f0c534c5b414	11	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
7e6c05f7-ddb2-46bf-96f8-73af9c86f91e	143a0b7e-2296-4dbb-86a6-f0c534c5b414	12	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
9c94eabf-5e55-4d8b-8794-d4fb0eddeee7	d1ebc656-b4bc-403f-a6b7-9420de66a0cd	1	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
548e08c1-5b83-41e9-8f47-7962ea6620f3	d1ebc656-b4bc-403f-a6b7-9420de66a0cd	2	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
c4364f51-9400-47fa-ac18-4517291650bb	d1ebc656-b4bc-403f-a6b7-9420de66a0cd	3	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
8312af38-9156-4916-b4fe-6a1d22a3b71c	d1ebc656-b4bc-403f-a6b7-9420de66a0cd	4	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
10c08b5c-da38-47f1-96da-6cf98f9ca40d	d1ebc656-b4bc-403f-a6b7-9420de66a0cd	6	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
7f3a03fc-0c9c-48e3-9197-a409bf8e29ca	d1ebc656-b4bc-403f-a6b7-9420de66a0cd	8	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
448d7541-9076-48fb-90f6-c1b91d48928a	d1ebc656-b4bc-403f-a6b7-9420de66a0cd	10	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
d196ad68-d83c-4da6-abe7-725b49007c04	d1ebc656-b4bc-403f-a6b7-9420de66a0cd	11	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
d5b72766-a83b-42a5-a84e-493e84d58470	b65c2f8d-ed90-46c6-8d89-c84958e189f3	1	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
d3f37b98-4a1d-41f6-abf5-42f33bc416dc	b65c2f8d-ed90-46c6-8d89-c84958e189f3	2	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
28b057ed-ca3f-4049-a3b5-22230e31139c	b65c2f8d-ed90-46c6-8d89-c84958e189f3	3	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
430029d8-c357-4145-b1d4-8e2b1b46cd1b	b65c2f8d-ed90-46c6-8d89-c84958e189f3	4	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
fa622a88-dff3-4032-9fae-8cf26a4c0c47	b65c2f8d-ed90-46c6-8d89-c84958e189f3	6	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
ccf969de-71d7-4963-8de1-5f5b943d9573	b65c2f8d-ed90-46c6-8d89-c84958e189f3	7	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
e8f2cdb8-d810-42f9-a69a-040b71c84884	b65c2f8d-ed90-46c6-8d89-c84958e189f3	8	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
1ce9939c-25bc-40d3-b8dc-bbb23caae845	b65c2f8d-ed90-46c6-8d89-c84958e189f3	9	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
275d50e1-51da-47a9-8ce3-2e29d13851cd	b65c2f8d-ed90-46c6-8d89-c84958e189f3	11	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
6fe87714-4872-4edf-a914-fb2f0b48cfb3	b65c2f8d-ed90-46c6-8d89-c84958e189f3	12	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
a0b34c22-0559-413d-b88b-9eec38e1333b	4078e7a1-c489-44bb-af5d-20670345b0aa	1	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
b0a860ba-65d5-4b54-9ec0-75772a204d2d	4078e7a1-c489-44bb-af5d-20670345b0aa	2	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
9fa19e76-ee4f-4452-ae31-b45a033e77b4	4078e7a1-c489-44bb-af5d-20670345b0aa	4	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
fd276e6d-3f62-4f90-971d-0eb3305959d3	4078e7a1-c489-44bb-af5d-20670345b0aa	5	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
344fc339-8de1-43dc-ab6f-fbbef96893e2	4078e7a1-c489-44bb-af5d-20670345b0aa	6	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
40bde296-3fdd-4b3a-93bb-fef8e045cbf6	4078e7a1-c489-44bb-af5d-20670345b0aa	7	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
683fb03b-8ef3-4e00-a77f-72332b52ee36	4078e7a1-c489-44bb-af5d-20670345b0aa	8	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
ec87bb73-6aed-498d-9c3e-e3ba3b3a204f	4078e7a1-c489-44bb-af5d-20670345b0aa	9	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
2530bd1e-fcfe-4da5-9059-9b0744506ce1	4078e7a1-c489-44bb-af5d-20670345b0aa	10	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
5edb04cb-5fd4-4de1-ac7e-ba090f0209bd	4078e7a1-c489-44bb-af5d-20670345b0aa	11	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
ca2f85af-d5dc-4b38-8b01-49d9d8f16e9a	4078e7a1-c489-44bb-af5d-20670345b0aa	12	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
435696cc-6330-47ad-a56d-cf79fa3e82b4	ad4246e8-0b0e-4959-9a9f-421880b6c83c	1	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
99c84f0b-3820-4a1e-9a77-8b37bccbe445	ad4246e8-0b0e-4959-9a9f-421880b6c83c	2	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
5707da20-6a36-4502-bc24-80f3bfc7a04e	ad4246e8-0b0e-4959-9a9f-421880b6c83c	4	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
ec1eedc3-0c1f-4543-90a5-ba3e553e0e9a	ad4246e8-0b0e-4959-9a9f-421880b6c83c	5	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
2411e39a-c1bd-481b-b221-7a146ec2c994	ad4246e8-0b0e-4959-9a9f-421880b6c83c	6	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
401bbc09-18f8-42e6-a604-e4180f6192fb	ad4246e8-0b0e-4959-9a9f-421880b6c83c	7	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
efabb4d3-a8de-4469-a993-5bfa332dc005	ad4246e8-0b0e-4959-9a9f-421880b6c83c	8	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
10ea1b39-7f9b-4b52-88b4-634799a42a0a	ad4246e8-0b0e-4959-9a9f-421880b6c83c	9	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
39c3d058-0c7c-4567-87e8-070b21d8ddb6	ad4246e8-0b0e-4959-9a9f-421880b6c83c	10	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
08426f28-5543-4c39-a6f8-50c8d620bd82	ad4246e8-0b0e-4959-9a9f-421880b6c83c	11	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
8685c3c9-091c-40d2-9d27-7e382f910394	ad4246e8-0b0e-4959-9a9f-421880b6c83c	12	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
408f5da9-94fc-4bff-87b4-cc8f88e2100a	eef3aad4-d6a2-458b-ad9a-9ec3fec6d0b5	3	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
2e759980-3eb7-4b1f-b91d-6f6872160d98	eef3aad4-d6a2-458b-ad9a-9ec3fec6d0b5	4	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
839ca1c5-b12e-4175-8be6-d95fb93e300d	eef3aad4-d6a2-458b-ad9a-9ec3fec6d0b5	5	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
5460af8f-cd89-46d7-9c5c-3c81f8eedd74	eef3aad4-d6a2-458b-ad9a-9ec3fec6d0b5	7	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
e9a710e1-6518-40d6-8d27-e47a778f1e30	eef3aad4-d6a2-458b-ad9a-9ec3fec6d0b5	9	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
237f6c38-5c00-43cd-bf03-406d851e5eeb	eef3aad4-d6a2-458b-ad9a-9ec3fec6d0b5	11	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
b8c644cb-f3e4-477a-bbb6-fbc33eabaee2	42010027-79f6-4d5e-99e8-f96deb137cf8	1	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
e9853d2a-c098-4d5f-9640-277faa348496	42010027-79f6-4d5e-99e8-f96deb137cf8	3	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
70db45c0-5cb2-40eb-bd80-f7150e5d606f	42010027-79f6-4d5e-99e8-f96deb137cf8	4	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
286af94a-4ac7-4a9e-acc4-1cc158f6fd6d	42010027-79f6-4d5e-99e8-f96deb137cf8	5	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
eb11f42d-3cd1-4d92-9115-841eaa57aeb5	42010027-79f6-4d5e-99e8-f96deb137cf8	7	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
9c368509-6463-48c5-9b91-3c096ad7b48a	42010027-79f6-4d5e-99e8-f96deb137cf8	9	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
97222d17-f474-4595-aed8-4f387c0ad745	42010027-79f6-4d5e-99e8-f96deb137cf8	10	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
e8512fe7-51db-4d43-a9a6-082ed3d252dc	42010027-79f6-4d5e-99e8-f96deb137cf8	11	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
80543e3b-cac8-456b-9408-f0f6be0c09d9	42010027-79f6-4d5e-99e8-f96deb137cf8	12	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
f67659d5-0f4d-4b57-911d-88ce457b80c6	4943bc08-59f8-4908-9cac-5ec83fea9d73	1	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
38ae01d0-71c6-481a-907f-743d9b956902	4943bc08-59f8-4908-9cac-5ec83fea9d73	2	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
944d50b7-72bb-4094-a66d-5ac11d923d3b	4943bc08-59f8-4908-9cac-5ec83fea9d73	4	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
3727a4b4-c3ba-4f10-8aad-12138cd7815e	4943bc08-59f8-4908-9cac-5ec83fea9d73	5	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
92a94b11-0c22-4373-9ff3-cf23f29800a5	4943bc08-59f8-4908-9cac-5ec83fea9d73	6	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
e37fbe6a-2224-4a56-88e3-ce8ba165bef5	4943bc08-59f8-4908-9cac-5ec83fea9d73	7	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
24d83f00-8011-4eed-8fc0-162c5e2598bb	4943bc08-59f8-4908-9cac-5ec83fea9d73	8	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
cd20f0ac-6132-4f6f-99ab-7a363040f5cf	4943bc08-59f8-4908-9cac-5ec83fea9d73	9	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
633b168d-dd8b-40a8-8ac3-fc4360fb70df	4943bc08-59f8-4908-9cac-5ec83fea9d73	10	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
543b7835-df21-46df-a356-fc0c1a503450	4943bc08-59f8-4908-9cac-5ec83fea9d73	11	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
c610dd14-f1e4-4150-8801-9e891331735c	4943bc08-59f8-4908-9cac-5ec83fea9d73	12	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
3017aece-eecf-4ed1-9fdc-8a0e892495f7	2c03b99e-7087-455c-a39b-46188232d26f	1	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
81f311e3-387b-467b-9961-7472da17d245	2c03b99e-7087-455c-a39b-46188232d26f	2	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
b405a2a3-49c1-4c02-896c-ca87a5ec787a	7bb4e4d2-c2aa-45d6-81a4-f9d6dc577115	1	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
f3ebd597-edf5-4d3e-9564-648e6ecaa738	7bb4e4d2-c2aa-45d6-81a4-f9d6dc577115	2	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
e9ab28d1-16b1-48d1-82b5-0b6b023258ad	8bf43911-694d-4fe9-8cde-0a1af1422d33	1	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
1a3d3b3e-d4a7-433e-907e-6bbc3c1d7916	8bf43911-694d-4fe9-8cde-0a1af1422d33	2	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
242b1353-7623-4fcf-bc3f-935457e728b5	8bf43911-694d-4fe9-8cde-0a1af1422d33	3	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
093c9263-7564-4129-8075-5092f463e830	8bf43911-694d-4fe9-8cde-0a1af1422d33	4	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
77b479b1-cd52-4cd4-a254-7a63c7786155	25bc4459-b4dc-4097-80a7-e5156fb2b761	1	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
55ee0ee3-6858-4559-a697-b592c6be0bda	25bc4459-b4dc-4097-80a7-e5156fb2b761	2	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
6f915b0c-7129-48d8-aa35-d8be07a1efc0	25bc4459-b4dc-4097-80a7-e5156fb2b761	3	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
44f8bd26-80ce-41f3-85cc-1d17d53e2bcc	25bc4459-b4dc-4097-80a7-e5156fb2b761	4	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
422885f2-8895-410e-9e93-bf797a8cb5a4	25bc4459-b4dc-4097-80a7-e5156fb2b761	5	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
cb11a929-457f-4db9-8038-1b8b8d3a9bd4	25bc4459-b4dc-4097-80a7-e5156fb2b761	6	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
82f6a8bb-944a-43aa-b04b-31024ecd5d5b	25bc4459-b4dc-4097-80a7-e5156fb2b761	8	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
3822c470-30e9-4dc5-a7d4-25b63149c55d	25bc4459-b4dc-4097-80a7-e5156fb2b761	9	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
b70cba1b-371f-4f17-bf39-283cd51c1160	25bc4459-b4dc-4097-80a7-e5156fb2b761	11	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
fe66d2de-aff0-46cb-b662-010e7aa2eb19	25bc4459-b4dc-4097-80a7-e5156fb2b761	12	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
6b2e1549-5b9a-4a4d-a5c9-1591a4c26b31	cca28c04-2fa0-46ad-85f0-71b7b3a83f3c	2	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
66b82dc4-6796-40a3-9d0d-62a449127036	cca28c04-2fa0-46ad-85f0-71b7b3a83f3c	3	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
32f635f5-7e64-4578-9b44-408c7ec1bf41	cca28c04-2fa0-46ad-85f0-71b7b3a83f3c	4	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
eeda5532-7761-46eb-b229-491774ac4668	cca28c04-2fa0-46ad-85f0-71b7b3a83f3c	5	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
b3b58025-c3cf-45f0-89f4-4802cbf8a06a	cca28c04-2fa0-46ad-85f0-71b7b3a83f3c	6	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
bc4179af-84f9-444b-a715-e18abb29f3b0	cca28c04-2fa0-46ad-85f0-71b7b3a83f3c	8	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
b069dcfe-a974-407b-a34d-723fe4a72f76	cca28c04-2fa0-46ad-85f0-71b7b3a83f3c	9	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
4329d3d0-0b43-4ac5-bbce-3bee2bdde4ec	cca28c04-2fa0-46ad-85f0-71b7b3a83f3c	11	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
f1efdfb2-cc5a-4c7f-afd5-f7f82de57131	cca28c04-2fa0-46ad-85f0-71b7b3a83f3c	12	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
0019e627-4acc-4014-a4a1-137ac7943314	dff972cd-bf25-4403-a360-932ee23e71c5	1	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
744c9ada-6966-4eaf-ac55-ac9b70282efc	dff972cd-bf25-4403-a360-932ee23e71c5	2	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
f48834f3-461d-444e-a93a-5f798ee1a15f	dff972cd-bf25-4403-a360-932ee23e71c5	3	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
aebb18da-ae1f-49e3-8e7c-d741594a6b95	dff972cd-bf25-4403-a360-932ee23e71c5	4	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
63289ce2-8cfd-476a-a6c7-dd550f681ab6	dff972cd-bf25-4403-a360-932ee23e71c5	5	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
0ed3daa7-c057-48df-8bc5-545c48ad2790	dff972cd-bf25-4403-a360-932ee23e71c5	6	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
85cc252d-6211-41ac-a720-1bacb4b8e89d	dff972cd-bf25-4403-a360-932ee23e71c5	7	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
8688bb4d-6e55-41aa-9bf4-1c8eae7ccb27	dff972cd-bf25-4403-a360-932ee23e71c5	8	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
6050b013-c584-4163-8ac5-51f74b2aaf4d	dff972cd-bf25-4403-a360-932ee23e71c5	9	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
2fc1e9e6-17c2-406f-a1e7-138792f89338	dff972cd-bf25-4403-a360-932ee23e71c5	10	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
311e03d8-279d-475c-892c-b57178887c67	dff972cd-bf25-4403-a360-932ee23e71c5	11	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
c880adf2-6e93-4ecc-bc74-ac2e1e5831b2	c992b1d1-209b-4205-a332-e705b9bb90b5	2	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
0c7b42b8-db72-4b0a-9b2c-7f4a14f77b11	c992b1d1-209b-4205-a332-e705b9bb90b5	3	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
160094d4-5b04-45ad-9fa9-6c55b368a533	c992b1d1-209b-4205-a332-e705b9bb90b5	4	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
12d5cf83-eaa5-4363-b39e-d3fc01c979ec	c992b1d1-209b-4205-a332-e705b9bb90b5	5	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
2fff6dce-91c8-4595-bfa8-c42d403cc67c	c992b1d1-209b-4205-a332-e705b9bb90b5	6	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
f76cd51d-959e-4cd2-9330-e17f8866e275	c992b1d1-209b-4205-a332-e705b9bb90b5	7	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
d867dd9e-6bad-4f97-b2e5-65ba4347ce2c	c992b1d1-209b-4205-a332-e705b9bb90b5	8	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
d22ee820-3464-4bb3-84c8-9af0b149e139	c992b1d1-209b-4205-a332-e705b9bb90b5	9	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
0208e7d4-1efe-45a2-83c2-2800c511bcd8	c992b1d1-209b-4205-a332-e705b9bb90b5	10	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
ae3d7065-2997-458a-b6ec-67b100dac067	c992b1d1-209b-4205-a332-e705b9bb90b5	11	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
45ccb46f-8ffd-4e34-a99f-d736ffa5a04c	c992b1d1-209b-4205-a332-e705b9bb90b5	12	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
c88d8bc4-4220-4e26-8741-9a90af0514d3	8285508a-30d2-4322-bb44-d0b4dfc5130f	1	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
737bb0ce-190f-473a-a424-c12da7605261	8285508a-30d2-4322-bb44-d0b4dfc5130f	2	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
3b426d65-7207-42a7-9d4b-40f6f8351877	8285508a-30d2-4322-bb44-d0b4dfc5130f	3	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
3c3c9853-e9b0-4a0f-a22f-212362291b00	8285508a-30d2-4322-bb44-d0b4dfc5130f	4	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
7a636d95-eeed-40c8-867b-46e72d977132	8285508a-30d2-4322-bb44-d0b4dfc5130f	7	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
bc152f2d-d7f4-4e01-bae8-2c7213d70479	8285508a-30d2-4322-bb44-d0b4dfc5130f	8	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
e974e884-0192-4b38-bc11-72f073a25a83	8285508a-30d2-4322-bb44-d0b4dfc5130f	9	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
939ab6a7-7f36-413f-a4d0-47887eb917a6	8285508a-30d2-4322-bb44-d0b4dfc5130f	10	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
8968e4fa-a409-4ea1-a978-84467aa890c0	8285508a-30d2-4322-bb44-d0b4dfc5130f	11	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
23a9cbc9-dd2c-43ea-9a34-1ac1e437929e	8285508a-30d2-4322-bb44-d0b4dfc5130f	12	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
7cc38774-c125-48d1-9f25-5bbb4e17a408	92da538e-02a6-451c-a662-618695ce63c2	2	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
e2f4778d-a1ab-4a04-93ab-598814fe5471	f39bd107-dd8e-4afc-aa80-1395d4e139f4	1	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
8cac18c9-c513-43eb-afe3-f857c2312823	f39bd107-dd8e-4afc-aa80-1395d4e139f4	7	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
66feb0ea-769f-4d32-a5d5-11d43036c2f6	f39bd107-dd8e-4afc-aa80-1395d4e139f4	8	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
64aa711a-ed13-4b1f-8410-24a20960c159	f39bd107-dd8e-4afc-aa80-1395d4e139f4	9	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
33c46a62-99f9-47c6-8970-aaa218949074	f39bd107-dd8e-4afc-aa80-1395d4e139f4	10	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
360ce08b-a458-4966-a8be-ed4936046739	f39bd107-dd8e-4afc-aa80-1395d4e139f4	11	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
31f1aabb-e8ac-44f8-863f-806626bcdaf4	f39bd107-dd8e-4afc-aa80-1395d4e139f4	12	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
1aad1e16-a2b0-4645-93d6-ec99efd97815	9f1a9c52-26a2-493c-b7c6-e157844f3895	1	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
61947ca8-7084-4fd1-99b5-9b72137e1693	9f1a9c52-26a2-493c-b7c6-e157844f3895	2	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
102b16cd-4129-4857-9696-3db6b27d4d09	9f1a9c52-26a2-493c-b7c6-e157844f3895	4	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
d35d5c72-991e-4bef-b3af-b77adb3dbd6d	9f1a9c52-26a2-493c-b7c6-e157844f3895	5	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
e2ecdd10-eaf5-4d03-8ee3-69e145e8b600	9f1a9c52-26a2-493c-b7c6-e157844f3895	6	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
7e02b6fe-419b-46e1-b2ff-ec67f2af0588	9f1a9c52-26a2-493c-b7c6-e157844f3895	7	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
8927f490-9471-4416-b233-40eead697fad	9f1a9c52-26a2-493c-b7c6-e157844f3895	8	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
d15829fc-8e81-482c-87a3-efe241cf1b4f	9f1a9c52-26a2-493c-b7c6-e157844f3895	9	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
fc1a4e96-ad29-43dc-bc5d-832884255e29	9f1a9c52-26a2-493c-b7c6-e157844f3895	10	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
4ea43113-0254-4c7b-81f3-679757df691e	9f1a9c52-26a2-493c-b7c6-e157844f3895	11	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
1405e01e-4008-479c-832f-d2030a286073	9f1a9c52-26a2-493c-b7c6-e157844f3895	12	\N	\N	\N	\N	\N	\N	UF_PROYECTADA	\N	APP	0	\N	2026-06-02 15:27:56	2026-06-02 15:27:56
\.


--
-- Data for Name: proyeccion_uf; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.proyeccion_uf (id, anio, mes, uf_fija, uf_proyectada, uf_manual, origen_valor, observaciones, created_at, updated_at) FROM stdin;
f68b900a-3de8-46b9-850a-a1b4493b82f1	2026	1	\N	39723	\N	PROYECTADA	\N	2026-05-18 16:42:45	2026-05-19 16:54:51
1ed21827-5b08-4f16-b611-05b85735e815	2026	2	\N	39759	\N	PROYECTADA	\N	2026-05-18 16:42:45	2026-05-19 16:54:51
64ceb77d-685f-4183-9daa-3cb144e17d78	2026	3	\N	39834	\N	PROYECTADA	\N	2026-05-18 16:42:45	2026-05-19 16:54:51
e1e63c3d-10ab-46e6-b53c-196f9388816e	2026	4	\N	40054	\N	PROYECTADA	\N	2026-05-18 16:42:45	2026-05-19 16:54:51
8ebb78fd-53c2-484c-86a8-0092e3d57ac3	2026	5	\N	40424	\N	PROYECTADA	\N	2026-05-18 16:42:45	2026-05-19 16:54:51
0f2113c4-e228-4011-9420-5a320e578e15	2026	6	\N	39857	\N	PROYECTADA	\N	2026-05-18 16:42:45	2026-05-19 16:54:51
62379977-eb05-43cb-bc04-d0b3bfc7fc02	2026	7	\N	39700	\N	PROYECTADA	\N	2026-05-18 16:42:45	2026-05-19 16:54:51
cf08ee0b-054d-4f9f-b72b-b4b2bdfc4a84	2026	8	\N	39763	\N	PROYECTADA	\N	2026-05-18 16:42:45	2026-05-19 16:54:51
49598c99-cd72-4758-abc5-db90aead76fb	2026	9	\N	39800	\N	PROYECTADA	\N	2026-05-18 16:42:45	2026-05-19 16:54:51
5891deef-007c-4721-9ca2-c74285ece665	2026	10	\N	39806	\N	PROYECTADA	\N	2026-05-18 16:42:45	2026-05-19 16:54:51
1efa5fac-79e7-419c-b56c-da3a8fa15c36	2026	12	\N	39933	\N	PROYECTADA	\N	2026-05-18 16:42:45	2026-05-19 16:54:51
a1b4960c-a0c5-451e-af17-7a3ac3219dd2	2026	11	\N	39806	\N	PROYECTADA	Completada por normalizacion de BD usando UF proyectada cercana.	2026-06-02 16:40:09	2026-06-02 16:40:09
\.


--
-- Data for Name: proyeccion_version; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.proyeccion_version (id, numero, nombre, fecha_version, anio, descripcion, activa, origen, created_by, created_at, meta_anual) FROM stdin;
e7689f11-2943-4249-851e-580d26e1c668	1	1. Proyecciones Plataformas 20.05.2026	2026-05-20	2026	Version inicial migrada desde proyeccion legacy	0	MIGRACION_LEGACY	sistema	2026-05-20 16:01:46	8.25e+08
394095a3-97fd-40ec-978f-41c6349d8fc0	1	1. Proyecciones Plataformas 20.05.2026	2026-05-20	2025	Version inicial	0	APP	sistema	2026-05-20 20:34:16	\N
94e9e93c-60a8-47cd-8126-e0836bd5cfe1	22	22. Proyecciones Plataformas 28.05.2026	2026-05-28	2026	Reimportado desde 22. Proyecciones Plataformas 28.05.2026.xlsx	1	EXCEL_IMPORTADO	codex	2026-06-02 15:27:56	8.25e+08
\.


--
-- Data for Name: receptor; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.receptor (id, cliente_id, nombre, email, cargo, activo, created_at) FROM stdin;
recep_004	cli_arcor	MARÍA JOSÉ ASTORGA	mastorga@arcor.com	Analista Selección y DO	1	2026-05-05 21:11:27
recep_008	cli_aristia	NICOLAS SOTO	nsoto@ariztia.com	Subgerente de DO, Capacitación e Inclusión	1	2026-05-05 21:11:27
recep_013	cli_carozzi	NICOLAS HENRIQUEZ	nicolas.henriquez@carozzi.cl	Analista de DO	1	2026-05-05 21:11:27
recep_018	cli_emin	PHILIPPE DUSSERT	pdussertl@emin.cl	Jefe DO y Aprendizaje	1	2026-05-05 21:11:27
recep_019	cli_magotteaux	NURY MATA	nury.mata@magotteaux.com	Analista HR Stgo	1	2026-05-05 21:11:27
recep_022	cli_resiter	JORGE VALENZUELA	jvalenzuela@resiter.cl	Gerente TI	1	2026-05-05 21:11:27
recep_036	cli_aza	GABRIELA CEBALLOS	gabriela.ceballos@aza.cl	\N	1	2026-05-05 21:11:27
recep_037	cli_aza	DANITZA ESCUDERO	danitza.escudero@ex.aza.cl	\N	1	2026-05-05 21:11:27
recep_038	cli_aza	LORENA SALDAÑO	Lorena.saldano@aza.cl	\N	1	2026-05-05 21:11:27
recep_039	cli_beco	JAVIER MUÑOZ	jmunoz53@beco.bancoestado.cl	\N	1	2026-05-05 21:11:27
recep_040	cli_ccu	ANTONIO MARIANO KURTH CRAIG	akurth@ccu.cl	\N	1	2026-05-05 21:11:27
recep_001	cli_andritz	ROBERTO LORCA	roberto.Lorca@andritz.com	\N	1	2026-05-05 21:12:01
recep_002	cli_andritz	PROVEEDORES ACL	proveedores.acl@andritz.com	\N	1	2026-05-05 21:12:01
recep_003	cli_andritz	LORENA ADAMS	Lorena.Adams@andritz.com	\N	1	2026-05-05 21:12:01
recep_005	cli_arcor	MPRODRIGUE	mprodrigue@arcor.com	\N	1	2026-05-05 21:12:01
recep_007	cli_arcor	DROJO	drojo@arcor.com	\N	1	2026-05-05 21:12:01
recep_009	cli_aristia	RECEPCION	recepcion@custodium.com	\N	1	2026-05-05 21:12:01
recep_010	cli_aristia	CGUAJARDO	cguajardo@ariztia.com	\N	1	2026-05-05 21:12:01
recep_011	cli_bex	RGONZA45	rgonza45@bex.bancoestado.cl	\N	1	2026-05-05 21:12:01
recep_012	cli_bex	CVEGA29	cvega29@bex.bancoestado.cl	\N	1	2026-05-05 21:12:01
recep_014	cli_carozzi	CAROZZI DTE	carozzi_dte@paperless.cl	\N	1	2026-05-05 21:12:01
recep_015	cli_copec	CFFLORES	cfflores@copec.cl	\N	1	2026-05-05 21:12:01
recep_016	cli_copec	SMELENDEZ	smelendez@copec.cl	\N	1	2026-05-05 21:12:01
recep_017	cli_copec	COPECRECEPCION	copecrecepcion@custodium.com	\N	1	2026-05-05 21:12:01
recep_020	cli_magotteaux	SABINA ASTARGO	sabina.astargo@magotteaux.com	\N	1	2026-05-05 21:12:01
recep_021	cli_magotteaux	OLABRA	olabra@magotteaux.com	\N	1	2026-05-05 21:12:01
recep_025	cli_transelect	OTIC KROJAS	otic-krojas@transelec.cl	\N	1	2026-05-05 21:12:01
recep_026	cli_transelect	TRANSELECRECEPCION	transelecrecepcion@custodium.com	\N	1	2026-05-05 21:12:01
recep_027	cli_transelect	JURRUTIA	jurrutia@transelec.cl	\N	1	2026-05-05 21:12:01
recep_028	cli_afp_habitat	RECEPCIONDTE AFPHABITAT	recepciondte_afphabitat@azuriandte.com	\N	1	2026-05-05 21:12:01
recep_029	cli_afp_habitat	FERNANDA ARIAS	fernanda.arias@afphabitat.cl	\N	1	2026-05-05 21:12:01
recep_030	cli_afp_habitat	PROVEEDORES	proveedores@afphabitat.cl	\N	1	2026-05-05 21:12:01
recep_033	cli_avla	FACTURAS	facturas@avla.com	\N	1	2026-05-05 21:12:01
recep_034	cli_avla	MACEVEDO	macevedo@avla.com	\N	1	2026-05-05 21:12:01
recep_035	cli_avla	ALOPEZL	alopezl@avla.com	\N	1	2026-05-05 21:12:01
recep_041	cli_enaex	ISABEL NOVOA	isabel.novoa@enaex.com	\N	1	2026-05-05 21:12:01
recep_042	cli_enaex	ENAEXRECEPCION	enaexrecepcion@custodium.com	\N	1	2026-05-05 21:12:01
recep_044	cli_banco_internacional	JFELIU	jfeliu@bancointernacional.cl	\N	1	2026-05-06 15:41:31
recep_045	cli_banco_internacional	EGONZALEZ	egonzalez@bancointernacional.cl	\N	1	2026-05-06 15:41:31
recep_023	cli_soprole	JEANNETTE DEL CARMEN NANJARI BARRERA	jeannette.nanjari@soprole.cl	\N	1	2026-05-05 21:11:27
recep_024	cli_soprole	PABLO RUEDI	pablo.ruedi@soprole.cl	\N	1	2026-05-05 21:11:27
\.


--
-- Data for Name: registro_tiempo; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.registro_tiempo (id, solicitud_id, desarrollador_id, fecha, minutos, descripcion, aprobado, created_at) FROM stdin;
\.


--
-- Data for Name: schema_migrations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.schema_migrations (version, name, checksum, applied_at) FROM stdin;
001	001_initial_schema.sql	3209317886	2026-06-03 19:20:59.31357+00
002	002_constraints_indexes.sql	272686497	2026-06-03 19:20:59.564434+00
003	003_adjust_proyeccion_unique_index.sql	3597967089	2026-06-03 19:20:59.640322+00
004	004_used_fields_integrations_finance.js	132633815	2026-06-03 19:20:59.650748+00
006	006_remove_facturado_solicitudes.js	833837693	2026-06-03 19:20:59.710111+00
007	007_auth_roles_admin.js	1141223531	2026-06-03 19:20:59.718602+00
008	008_admin_proyecciones.sql	3389714544	2026-06-03 19:20:59.758499+00
009	009_admin_usernames.js	614644184	2026-06-03 19:20:59.811851+00
010	010_round_projected_uf.sql	2092107400	2026-06-03 19:20:59.860357+00
011	011_proyecciones_versionadas.sql	3617533374	2026-06-03 19:20:59.866588+00
012	012_proyecciones_orden_fila.js	2258527711	2026-06-03 19:20:59.919521+00
013	013_proyecciones_meta_anual.js	1620639506	2026-06-03 19:20:59.92886+00
014	014_usuario_general.js	2300988266	2026-06-03 19:20:59.934285+00
015	015_solicitud_montos_manual_hes.js	2501426823	2026-06-03 19:20:59.955623+00
016	016_cliente_datos_facturacion.js	823007956	2026-06-03 19:20:59.962213+00
017	017_coordinador_usuarios_cleanup.js	2013988737	2026-06-03 19:20:59.98001+00
018	018_renombrar_usuario_valeria.js	3266851945	2026-06-03 19:21:00.058942+00
019	019_usuario_coordinador_scope.js	934774154	2026-06-03 19:21:00.063344+00
020	020_slack_bot_config.js	249521467	2026-06-03 19:21:00.079324+00
021	021_enaex_facturacion_sigdo_cleanup.js	3355260602	2026-06-03 19:21:00.110008+00
005	005_operational_catalogs.js	670355929	2026-06-03 19:20:59.669335+00
022	022_database_normalization_and_guards.js	1616183571	2026-06-03 19:21:00.11635+00
023	023_instituto_roi_empresa_emisora.js	1495566337	2026-06-03 19:21:00.187889+00
024	024_set_all_users_mas2026.js	1270950700	2026-06-10 15:30:21.075211+00
\.


--
-- Data for Name: slack_notificacion_log; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.slack_notificacion_log (id, solicitud_id, channel_id, coordinador_id, slack_user_id, message_ts, status, error, texto, created_at) FROM stdin;
\.


--
-- Data for Name: solicitud_cp; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.solicitud_cp (id, solicitud_id, cp_id, monto_uf, monto_clp, orden, monto_clp_manual, monto_clp_es_manual) FROM stdin;
363e712d-f3d0-487b-ab5f-835c72f2fbed	21cbca08-7503-4b08-8b42-c290fafc0b88	e429875a-d59e-4438-af2a-2c240fab737c	\N	123456	0	\N	0
80835f74-7e9e-4061-ae87-8d0cac08d050	3a59daf9-386e-4f0b-94a2-974263fe245a	e429875a-d59e-4438-af2a-2c240fab737c	\N	1000	0	\N	0
23756b62-425c-43a0-8f3d-179f7a2adff7	127c8e80-0d99-424c-85dd-8a9d2339395f	95bb13b0-ad0b-4fea-b81c-fc1758e772a8	60	2.411207e+06	0	\N	0
bd4dad68-d455-4f15-b141-c6554c992c9c	67e22a2d-37c8-4c8f-a2ef-5c9ea3dc0eb9	e429875a-d59e-4438-af2a-2c240fab737c	60	2.411207e+06	0	\N	0
7abfb588-c447-459d-8979-51c6cefa889a	23a25098-74ec-4a9c-9a9e-d81d6dfbefdc	e429875a-d59e-4438-af2a-2c240fab737c	60	2.411207e+06	0	\N	0
bd4e67d1-63ff-4d6d-9418-2e7ae29780bc	6767da9d-52b4-43db-ae29-a0d6b8dfba35	e429875a-d59e-4438-af2a-2c240fab737c	1	40187	0	\N	0
ffe7d79b-f200-48bd-b187-130643790d96	3e99f9ab-c36d-4ba9-94e3-32548f66d1be	95bb13b0-ad0b-4fea-b81c-fc1758e772a8	60	2.411207e+06	0	\N	0
78c80240-447f-4908-9ae1-bb11df414ec9	2b770da1-c051-43f1-9c6b-4e7f768c6cd2	e429875a-d59e-4438-af2a-2c240fab737c	1	40187	0	\N	0
e9edc1f1-bc33-486d-81a6-db58e5cfffcf	3c1148de-9ede-499b-b5a7-15f3c0da1fe9	0a9e7168-a75e-4d67-8357-5e2ef8075530	\N	0	0	\N	0
49391fc4-ee81-4675-8f02-59c9150b3008	93bee80c-45b5-41ce-9c50-29ef33587624	753a5610-490b-49d3-ba1f-a8a748489876	\N	0	0	\N	0
5fb2cd40-7a8c-4d2b-bbdd-4c8073b22694	1a742b1a-dd75-47f5-9fd8-40bc0128a427	2a03f9fb-fcfe-4ed4-97ab-4e861ce735dc	\N	0	0	\N	0
b6aa0267-0fca-4d98-b7d8-3a8cd0f52075	ecccbd54-12ad-4eab-9628-0063c69daee5	5027ff97-c244-4295-8463-582673dd5b43	\N	0	0	\N	0
dee7b64c-9b24-4755-9d1f-90d3d58e134e	63465b42-92c9-4853-b911-8c0adb5a5daa	84796332-cb1d-4e62-a03a-c99d21117925	\N	0	0	\N	0
89b856d2-2966-4b75-a107-7c77dc6715b9	35a5142d-995f-494c-962d-660411d86f6a	c8e755d7-60bc-41ad-8781-24e21d9e5306	\N	0	0	\N	0
b1b425ed-cf38-4d8e-98fb-4ff80a9168b9	fe5cea7d-416f-4815-83de-d9cf8f6d6faa	c6f50037-66e3-4a8b-ad2c-22094280f542	152	6.114472e+06	0	\N	0
4019986a-0fd4-4107-bf16-cf59768db538	f316c25a-1e38-48d0-8993-f426c9c1f070	c6f50037-66e3-4a8b-ad2c-22094280f542	\N	0	0	\N	0
5beaee9e-831f-45ed-b039-384d3ffd4d9c	95e51a0a-b2f0-4655-b6cc-9031a7fc349c	c6f50037-66e3-4a8b-ad2c-22094280f542	290.6	0	0	\N	0
7ae5a910-ffd6-4cb3-876e-2078faddd1b2	55008c9e-6606-4bb3-872f-4ec6fecc03e6	c6f50037-66e3-4a8b-ad2c-22094280f542	290.6	0	0	\N	0
dc244dd9-0b29-42f3-bffd-b126e1cf7b2e	464fa580-5850-4025-8ae4-a1268e6f2301	c6f50037-66e3-4a8b-ad2c-22094280f542	290.6	0	0	\N	0
0f183e52-489f-4e29-b099-af9d4eafede5	545ecbac-b1df-430f-9849-9de18b0523f9	c6f50037-66e3-4a8b-ad2c-22094280f542	290.6	0	0	\N	0
4cfa6641-bc7b-4bbd-b1ae-61ce69f0aab8	a91476e8-ffc9-4800-8237-32b97574afe8	c6f50037-66e3-4a8b-ad2c-22094280f542	152	6.114472e+06	0	\N	0
5e151720-1407-4725-804d-90d2bbebe300	65dd05e6-e51b-42f8-a924-e5017f4babd1	8d9866f8-20c7-47c2-9a60-7e93c10c8a11	\N	0	0	\N	0
8bc8ecae-c60e-4cc8-afdc-abbabe19aae1	aa40cf8e-ac7a-45e6-8aae-600af11029c3	ce57fcb5-7d76-4003-b938-73065171ad61	18	724926	0	\N	0
322dc1ba-1513-4eec-94b3-c610b2825b17	34644598-a822-4d9f-912e-9ca5265b2d3b	1dcd46c0-8e45-4b59-a9ce-c9c52b11ce40	\N	3.466667e+06	0	\N	0
8dece59c-5e22-4e31-af52-bb79dabd9231	4a9336cd-3d12-4112-bd43-0f29add4a6a0	23b79374-f7b2-4ee3-a217-d07ddebb20e7	66	2.64e+06	0	\N	0
a87b59a1-e315-4e2e-b738-f6de8e5ecdb2	fced3f1a-4078-4bb4-b04c-6bcce3ff8955	23b79374-f7b2-4ee3-a217-d07ddebb20e7	66	2.64e+06	0	\N	0
e63be6c5-73b2-4589-98e4-a5709b64c3ae	0de2bf92-fd44-45c0-8a9c-3dd2302767b5	23b79374-f7b2-4ee3-a217-d07ddebb20e7	66	2.64e+06	0	\N	0
503f3871-7ea8-47f6-b749-6cd0a6dc5cbd	fadf8375-3d9f-4354-8157-5fc128a0a76a	43636507-047d-4e10-9c16-996cb38dec76	270	1.08e+07	0	\N	0
915fc556-e2c4-4b4c-a61b-5562c994223d	97c4fc89-34e5-48ef-a7b6-5413bd33c351	e82e6e4a-8127-426f-ade5-b538f1999a4c	46.26	1.8504e+06	0	\N	0
4a3c702d-8e6c-4f6d-8eaf-58795103de81	a3804a5e-7fd8-4c88-9ecd-33f1e7e31a2d	e82e6e4a-8127-426f-ade5-b538f1999a4c	46.26	1.8504e+06	0	\N	0
4da5f9c5-093c-4cd1-99c3-c503d036dcaa	ab885469-199f-435e-870f-d439ebcd9ec6	e82e6e4a-8127-426f-ade5-b538f1999a4c	46.26	1.8504e+06	0	\N	0
9c8e23a4-c183-49b2-ae58-6f626a50664d	6a07c314-d52d-4a6b-8b58-bb93d2919b1f	e82e6e4a-8127-426f-ade5-b538f1999a4c	46.26	1.8504e+06	0	\N	0
9fb4b673-7f2f-4fc1-bf56-e2ee5456c409	f386e201-90ab-463d-8e52-a89e98d71fdd	e82e6e4a-8127-426f-ade5-b538f1999a4c	46.26	1.8504e+06	0	\N	0
e6e18dbe-e120-4992-a804-4fa2b6ecf2c5	04943fec-1ce4-4771-96f3-690e41b918a2	e82e6e4a-8127-426f-ade5-b538f1999a4c	46.26	1.8504e+06	0	\N	0
0ce8ede6-0f34-4f11-bc8e-9c930915278b	72e0042b-7c4e-47d4-a075-7109c70865f9	5027ff97-c244-4295-8463-582673dd5b43	20.67	826800	0	\N	0
462d36eb-15ff-4eca-9f4f-780fc422e052	7ec6b974-35cc-42ae-86a8-a00755954a9b	5027ff97-c244-4295-8463-582673dd5b43	20.67	826800	0	\N	0
d613370d-7d6c-4097-a632-ee9d2c38bb21	68dfbdb5-5902-47a1-b4a4-01b2853f599d	5027ff97-c244-4295-8463-582673dd5b43	20.67	826800	0	\N	0
92d57043-defe-41f1-b5f0-51fdeb3698a7	515f97fb-05c9-4ce0-af55-bbed457a08ee	5027ff97-c244-4295-8463-582673dd5b43	20.67	826800	0	\N	0
f7ec5417-44f1-4541-ab32-abfd4e926b20	30f486f2-f449-4e43-9d69-941d198a59e6	5027ff97-c244-4295-8463-582673dd5b43	20.67	826800	0	\N	0
b28aee9d-726f-4fdc-89b7-9b68464767dd	f744aed4-dcd3-43a5-9a21-e003ce769f67	5027ff97-c244-4295-8463-582673dd5b43	20.67	826800	0	\N	0
686aa955-f6ad-435d-a6ae-785fcbf2516c	9cbdc2e9-c1af-414e-ac52-498d9282a2a6	41a269d4-7854-40b0-93a0-35d8f2fdce17	72.8	2.912e+06	0	\N	0
e99e4ff3-7eed-4f2a-9626-2a7efd6006a0	b0c1aab4-3f5f-476a-8a24-8c8d33111ce6	41a269d4-7854-40b0-93a0-35d8f2fdce17	72.8	2.912e+06	0	\N	0
67b30451-e857-476d-9d79-43dd6dcd5772	5aaf9575-fdfd-4f0d-a062-51fe215a5167	41a269d4-7854-40b0-93a0-35d8f2fdce17	72.8	2.912e+06	0	\N	0
5f2ae791-17b7-43b4-96eb-968d4254c52e	39dce8b7-d452-4c06-a9d1-7d524c74f1ce	41a269d4-7854-40b0-93a0-35d8f2fdce17	72.8	2.912e+06	0	\N	0
a372ecb0-d54c-4739-be5b-3b16c9e544f0	45cea2d5-f7cc-46b9-b5d1-5dc017d5e4e0	41a269d4-7854-40b0-93a0-35d8f2fdce17	72.8	2.912e+06	0	\N	0
2773fbf2-5455-4b9b-9ed3-00ff2578cc95	541641a6-78b6-43bb-9c0c-d63853dd5e98	8d9866f8-20c7-47c2-9a60-7e93c10c8a11	94	3.76e+06	0	\N	0
826740f2-f6e0-4e2f-9003-f8c4ed0a2105	81968ec2-cf44-496f-9e01-a98eff2ac718	e429875a-d59e-4438-af2a-2c240fab737c	35	1.4e+06	0	\N	0
a3dcb11b-6d4c-4657-9d9d-6085f5140e91	61aa55d4-d219-47c9-a8ad-43e6ecaafc9d	e429875a-d59e-4438-af2a-2c240fab737c	35	1.4e+06	0	\N	0
c1969683-ebec-47a8-b151-0b63d6fbc121	e7e8f834-1867-40d0-94d1-2e0edb822937	e429875a-d59e-4438-af2a-2c240fab737c	35	1.4e+06	0	\N	0
d38f5fbf-0976-4b5b-bd58-a9a1e9da0582	e00a4764-d7e7-428d-bf38-bb14a4f97eb8	e429875a-d59e-4438-af2a-2c240fab737c	35	1.4e+06	0	\N	0
bfff7cec-8dff-4d0d-a66a-345847213af8	708f2199-14e0-4f2e-b15b-5ce1bca884e6	e429875a-d59e-4438-af2a-2c240fab737c	35	1.4e+06	0	\N	0
2418c0fc-32ad-4301-a0ba-6f4d72fcad5a	a5c78a1c-506f-4392-b655-ddaa24064b4c	e429875a-d59e-4438-af2a-2c240fab737c	35	1.4e+06	0	\N	0
0eb366b7-93ba-48fc-8826-db32b53f2a02	5f198a21-bb8a-4738-9b3a-c582ea366e63	e429875a-d59e-4438-af2a-2c240fab737c	35	1.4e+06	0	\N	0
12ac7d0e-16bd-44a6-8f6b-dfa0328e4c6f	c130914e-2edc-4a0c-9a58-a630dff1065c	84796332-cb1d-4e62-a03a-c99d21117925	\N	0	0	\N	0
a03e75fd-3ee2-4b46-8c29-29c592ee3cd4	74244347-73f3-4cff-92cc-b2b2ae652276	e82e6e4a-8127-426f-ade5-b538f1999a4c	46.26	1.875522e+06	0	\N	0
b6636fec-e756-4250-9343-e10140e5dade	1ebc6410-acde-4035-a83d-61a0c2a23264	e429875a-d59e-4438-af2a-2c240fab737c	35	1.407004e+06	0	\N	0
1b639594-b7bf-4c0a-aed6-45721365c317	c70310b1-e8b7-4bc0-802c-a6ca91a279d8	41a269d4-7854-40b0-93a0-35d8f2fdce17	72.8	2.912e+06	0	\N	0
731ba243-ac1b-4be5-ae62-b9ce1a36e7f2	e118f729-387d-4beb-8c4f-57ce9cb59e71	c6f50037-66e3-4a8b-ad2c-22094280f542	145	5.881194e+06	0	\N	0
57c9e54a-8b42-45a7-a9f2-f6f381a33032	3dc583da-9119-4223-b299-5210c1896702	0a9e7168-a75e-4d67-8357-5e2ef8075530	152.66	6.199998e+06	0	6.199998e+06	1
13912a63-91ef-4644-9355-0c52c2d12ba3	59dd0371-e9b0-4ac2-b7c1-23de4f1ba5be	41a269d4-7854-40b0-93a0-35d8f2fdce17	\N	0	0	\N	0
5f740e98-8314-4e07-b598-0b0ca731f5f6	59a029c7-3025-418d-a90a-1e1a4128a2ef	e82e6e4a-8127-426f-ade5-b538f1999a4c	46.26	1.875522e+06	0	\N	0
40c057fa-676a-4ba6-b52b-26b043f6a593	9480067b-ffd1-435f-82d9-33a6e6c2f8d8	1dcd46c0-8e45-4b59-a9ce-c9c52b11ce40	\N	3.466667e+06	0	\N	0
c73268a8-e847-4c25-a3c1-0d5a94b35c75	b255ca53-f3eb-4732-af12-cd945f095fe9	41a269d4-7854-40b0-93a0-35d8f2fdce17	72.8	2.912e+06	0	\N	0
73c4b660-d104-4b60-8836-689592624753	42bbc224-ef71-4895-8479-c7a173d51930	ce57fcb5-7d76-4003-b938-73065171ad61	18	731297	0	\N	0
80a58221-28d8-4e4d-990c-4228c11fe276	197b6317-1e51-4d4d-9f34-6e26a13a4e8f	c6f50037-66e3-4a8b-ad2c-22094280f542	145	5.891005e+06	0	\N	0
e46b9be5-99fd-4d1a-92da-cacaab88d1a0	c3f69878-c7b5-47b9-a23a-88fc64ef8842	23b79374-f7b2-4ee3-a217-d07ddebb20e7	66	2.64e+06	0	\N	0
1f89f520-2d0a-422a-a913-4289d8c76bee	7afcd067-c5f0-4570-86d9-21fbb1c6d0e3	5027ff97-c244-4295-8463-582673dd5b43	20.67	839773	0	\N	0
610fc712-eed1-4fc1-8232-3a5b24c77d50	a519697c-73fc-4173-a103-8518a075f761	5027ff97-c244-4295-8463-582673dd5b43	20.67	838025	0	\N	0
fe06753c-cb36-4fa8-871e-76b55a0fc346	b9a5cc11-7136-4b4d-a9a9-457a75d2a24f	1dcd46c0-8e45-4b59-a9ce-c9c52b11ce40	86.67	3.51487e+06	0	3.51487e+06	1
81985389-9be1-430e-8f5c-b75c9a186eaf	ce422bc7-e2ae-4100-8db8-bf33e6ef5201	95bb13b0-ad0b-4fea-b81c-fc1758e772a8	60	2.4e+06	0	\N	0
8fe436ac-25b9-4b52-ba2f-0008a82005a1	2d01ee01-144e-4b06-9fc7-bedf82040cf0	5027ff97-c244-4295-8463-582673dd5b43	20.67	843531	0	\N	0
efd83435-c93d-4b9b-8876-5fae61c08ae2	e27f44c9-de0d-4960-af2b-ee0ff5b1afee	d6818e92-4464-445c-9eff-4b7974a8dcbe	0.01	408	0	\N	0
49ca9513-64af-4149-80f4-a1c6d06dbf5b	1be97ed8-cfad-4ec6-ae53-5d9ad1601b0d	19f10fff-2acb-45e5-bb5b-f811fb816bc0	4	163238	0	\N	0
b493345c-de1c-4909-bef4-cb57db0d468b	ae7366e1-5a90-4690-b612-c339f928f22a	702624bf-5b21-480e-b371-9918024eae6d	15	612142	0	\N	0
b31fee3f-b92d-4f1c-959a-5111b2c057ae	a1e8b706-9a8d-4c7d-9303-f3c454c0de44	e0e4e9cc-e02b-49aa-a254-5df14c3d5aef	80	3.264755e+06	0	\N	0
a9ce50c0-4af3-40e6-bb8b-6f2aeed33d54	cf1915e3-4f74-4e38-8f56-43d0bc3d123b	d6818e92-4464-445c-9eff-4b7974a8dcbe	0.01	408	0	\N	0
4f513316-9a4d-4557-ba63-230b09fb5cd3	3b8d59c2-6f4d-49b8-9795-280e007afe76	5027ff97-c244-4295-8463-582673dd5b43	20.68	840179	0	\N	0
3307b99d-7a15-442e-96d6-f671de5b1a52	e5c3a1a8-de16-4e8f-921e-4a2e490aa61d	e0e4e9cc-e02b-49aa-a254-5df14c3d5aef	150	6.123455e+06	0	\N	0
7dda0d9f-5cf7-40e8-a717-a22c39d64d6a	72ab8552-2cb2-4740-b663-144f340761e6	e0e4e9cc-e02b-49aa-a254-5df14c3d5aef	140	5.715224e+06	0	\N	0
2b13b0d0-fd9e-4a48-8dc3-4664fece5ba4	aeba8638-dc71-4a91-a453-7298951ad44f	d6818e92-4464-445c-9eff-4b7974a8dcbe	\N	123456	0	123456	1
\.


--
-- Data for Name: solicitud_factura; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.solicitud_factura (id, folio, tipo, cliente_id, coordinador_id, empresa_emisora, periodo, fecha_solicitud, fecha_facturacion, oc_numero, contrato_numero, hes_numero, glosa, area, moneda_base, uf_fecha, uf_valor, monto_neto_clp, monto_iva_clp, monto_total_clp, observaciones, estado, is_delete, version_plantilla, programada_id, created_at, updated_at, admin_batch_id, origen_admin, monto_neto_clp_manual, cliente_facturacion_id) FROM stdin;
6b2c61bb-4ab8-4d74-80ae-b71bfc7e0d03	SF-2026-00001	mensual	cli_soprole	\N	MAS_CONSULTORES	2026-05	2026-05-04	\N	\N	\N	\N	Servicio administracion soporte mensual Plataforma Nutrir MAS	\N	CLP	\N	\N	2.775051e+06	527260	3.302311e+06	\N	Aprobada	1	v1	\N	2026-05-04 00:08:26	2026-05-04 16:19:38	\N	\N	\N	\N
21cbca08-7503-4b08-8b42-c290fafc0b88	SF-2026-00002	mensual	cli_soprole	\N	MAS_CONSULTORES	2026-05	2026-05-05	\N	\N	\N	\N	Prueba CP cliente	\N	CLP	\N	\N	123456	23457	146913	\N	Borrador	1	v1	\N	2026-05-05 19:12:25	2026-05-05 19:12:31	\N	\N	\N	\N
3a59daf9-386e-4f0b-94a2-974263fe245a	SF-2026-00003	mensual	cli_soprole	\N	MAS_CONSULTORES	2026-05	2026-05-06	\N	TEST-ESTADOS	\N	\N	Prueba temporal estados PROYECCIONES_MASTER	\N	CLP	\N	\N	1000	190	1190	\N	FACTURA SOLICITADA	1	v1	\N	2026-05-06 01:41:17	2026-05-06 01:41:17	\N	\N	\N	\N
127c8e80-0d99-424c-85dd-8a9d2339395f	SF-2026-00004	mensual	cli_transelect	\N	MAS_CONSULTORES	2026-05	2026-05-06	\N	4500215068	\N	1000545179	Fee LMS Aprende mayo 2026	Plataformas	UF	2026-05-05	40186.79	2.411207e+06	458130	2.869337e+06	Revisar documento carta de facturación electrónica. \nUF 60 al día 05-05 ($40.186,79)	FACTURA SOLICITADA	1	v1	\N	2026-05-06 02:12:04	2026-05-06 02:28:59	\N	\N	\N	\N
67e22a2d-37c8-4c8f-a2ef-5c9ea3dc0eb9	SF-2026-00005	mensual	cli_soprole	\N	MAS_CONSULTORES	2026-05	2026-05-05	\N	TEST-FORMULA-UF	\N	\N	Prueba temporal formula neto UF	\N	UF	2026-05-05	40186.79	2.411207e+06	458130	2.869337e+06	\N	FACTURA SOLICITADA	1	v1	\N	2026-05-06 02:20:42	2026-05-06 02:20:42	\N	\N	\N	\N
23a25098-74ec-4a9c-9a9e-d81d6dfbefdc	SF-2026-00006	mensual	cli_soprole	\N	MAS_CONSULTORES	2026-05	2026-05-05	\N	TEST-FORMULA-UF	\N	\N	Prueba temporal formula neto UF	\N	UF	2026-05-05	40186.79	2.411207e+06	458130	2.869337e+06	\N	FACTURA SOLICITADA	1	v1	\N	2026-05-06 02:21:05	2026-05-06 02:21:05	\N	\N	\N	\N
6767da9d-52b4-43db-ae29-a0d6b8dfba35	SF-2026-00007	mensual	cli_soprole	\N	MAS_CONSULTORES	2026-05	2026-05-05	\N	TEST-FILENAME	\N	\N	Prueba temporal nombre archivo exportacion	\N	UF	2026-05-05	40186.79	40187	7640	47827	\N	FACTURA SOLICITADA	1	v1	\N	2026-05-06 02:28:04	2026-05-06 02:28:04	\N	\N	\N	\N
3e99f9ab-c36d-4ba9-94e3-32548f66d1be	SF-2026-00008	mensual	cli_transelect	coor_003	MAS_CONSULTORES	2026-05	2026-05-06	\N	4500215068	\N	1000545179	Fee LMS Aprende mayo 2026	Plataformas	UF	2026-05-05	40186.79	2.411207e+06	458130	2.869337e+06	Revisar documento carta de facturación electrónica. UF 60 al día 05-05 ($40.186,79)	FACTURA SOLICITADA	0	v1	\N	2026-05-06 03:00:57	2026-05-13 17:20:28	\N	\N	\N	\N
2b770da1-c051-43f1-9c6b-4e7f768c6cd2	SF-2026-00009	mensual	cli_soprole	coor_001	MAS_CONSULTORES	2026-05	2026-05-05	\N	TEST-XLSX-CP-REC	\N	HES-1	Prueba temporal cp receptor xlsx	\N	UF	2026-05-05	40186.79	40187	7640	47827	Obs prueba	FACTURA SOLICITADA	1	v1	\N	2026-05-06 03:17:24	2026-05-06 03:17:24	\N	\N	\N	\N
1ebc6410-acde-4035-a83d-61a0c2a23264	SF-2026-00010	mensual	cli_soprole	coor_001	MAS_CONSULTORES	2026-05	2026-05-06	\N	1600243339	\N	N/A	Servicio de administración y soporte mensual Plataforma Conversación de Carrera Mayo\t	Plataformas	UF	2026-05-06	40200.12	1.407004e+06	267340	1.674344e+06	Valor UF 2026-05-06: 40.200,12	FACTURA SOLICITADA	0	v1	\N	2026-05-06 15:37:47	2026-05-27 19:43:38	\N	\N	\N	\N
3c1148de-9ede-499b-b5a7-15f3c0da1fe9	SF-2026-00011	mensual	cli_aristia	\N	MAS_CAPACITACIONES	2026-05	2026-05-06	\N	\N	\N	\N	Reconocimiento	\N	UF	\N	\N	0	0	0	\N	PENDIENTE OC / HES	1	v1	\N	2026-05-06 15:38:17	2026-05-14 20:04:31	\N	\N	\N	\N
c3f69878-c7b5-47b9-a23a-88fc64ef8842	SF-2026-00012	mensual	cli_bex	coor_003	MAS_CONSULTORES	2026-05	2026-05-01	\N	\N	\N	N/A	Reconocimiento	\N	UF	2026-05-01	40000	2.64e+06	501600	3.1416e+06	Monto referencial con UF estimada 40.000 para MAYO 2026.\nValor UF 2026-05-01: 40.000,00	PENDIENTE OC / HES	0	v1	\N	2026-05-06 15:38:54	2026-06-01 20:17:03	\N	\N	\N	\N
93bee80c-45b5-41ce-9c50-29ef33587624	SF-2026-00013	mensual	cli_carozzi	\N	MAS_CAPACITACIONES	2026-05	2026-05-06	\N	\N	\N	\N	LMS	\N	UF	\N	\N	0	0	0	\N	PENDIENTE OC / HES	1	v1	\N	2026-05-06 15:39:03	2026-05-14 20:04:47	\N	\N	\N	\N
1a742b1a-dd75-47f5-9fd8-40bc0128a427	SF-2026-00014	mensual	cli_carozzi	\N	MAS_CAPACITACIONES	2026-05	2026-05-06	\N	\N	\N	\N	Gestión Capacitación	\N	UF	\N	\N	0	0	0	\N	PENDIENTE OC / HES	1	v1	\N	2026-05-06 15:39:06	2026-05-14 20:04:44	\N	\N	\N	\N
74244347-73f3-4cff-92cc-b2b2ae652276	SF-2026-00015	mensual	cli_copec	coor_003	MAS_CONSULTORES	2026-05	2026-05-27	\N	4503574336	\N	5012117359	Desempeño	Plataformas	UF	2026-05-27	40543.07	1.875522e+06	356350	2.231872e+06	Valor UF 2026-05-27: 40.543,07	FACTURA SOLICITADA	0	v1	\N	2026-05-06 15:39:10	2026-05-27 19:43:15	\N	\N	\N	\N
ecccbd54-12ad-4eab-9628-0063c69daee5	SF-2026-00016	mensual	cli_copec	\N	MAS_CONSULTORES	2026-05	2026-05-06	\N	\N	\N	\N	Talentos	\N	UF	\N	\N	0	0	0	\N	PENDIENTE OC / HES	1	v1	\N	2026-05-06 15:39:11	2026-06-01 17:40:43	\N	\N	\N	\N
59dd0371-e9b0-4ac2-b7c1-23de4f1ba5be	SF-2026-00017	mensual	cli_emin	coor_002	MAS_CONSULTORES	2026-05	2026-05-14	\N	\N	\N	N/A	Desempeño	\N	UF	2026-05-14	\N	0	0	0	\N	PENDIENTE OC / HES	0	v1	\N	2026-05-06 15:39:13	2026-06-01 17:37:16	\N	\N	\N	\N
63465b42-92c9-4853-b911-8c0adb5a5daa	SF-2026-00018	mensual	cli_enaex	\N	MAS_CAPACITACIONES	2026-05	2026-05-06	\N	\N	\N	\N	Gestión Capacitación	\N	UF	\N	\N	0	0	0	\N	PENDIENTE OC / HES	1	v1	\N	2026-05-06 15:39:14	2026-05-14 20:04:55	\N	\N	\N	\N
a91476e8-ffc9-4800-8237-32b97574afe8	SF-2026-00019	mensual	cli_enaex	coor_001	MAS_CONSULTORES	2026-05	2026-05-08	\N	3800027672	\N	1003873160	Sistema de Puntos Enaex Academy\nN° proveedor: 401325	Pataformas	UF	2026-05-08	40226.79	6.114472e+06	1.16175e+06	7.276222e+06	Valor UF 2026-05-08: 40.226,79	FACTURA SOLICITADA	0	v1	\N	2026-05-06 15:39:16	2026-05-18 15:03:25	\N	\N	\N	\N
35a5142d-995f-494c-962d-660411d86f6a	SF-2026-00020	mensual	cli_enaex	\N	MAS_CAPACITACIONES	2026-05	2026-05-06	\N	\N	\N	\N	Reconocimiento	\N	UF	\N	\N	0	0	0	\N	PENDIENTE OC / HES	1	v1	\N	2026-05-06 15:39:18	2026-05-14 20:04:52	\N	\N	\N	\N
aa40cf8e-ac7a-45e6-8aae-600af11029c3	SF-2026-00021	mensual	cli_magotteaux	coor_002	MAS_CONSULTORES	2026-05	2026-05-11	\N	4801108816	\N	n/a	Reconocimiento\n	Plataformas	UF	2026-05-11	40273.69	724926	137740	862666	Valor UF 2026-05-11: 40.273,69	FACTURA SOLICITADA	0	v1	\N	2026-05-06 15:39:20	2026-05-20 20:27:23	\N	\N	\N	\N
65dd05e6-e51b-42f8-a924-e5017f4babd1	SF-2026-00022	mensual	cli_salmones	coor_001	MAS_CONSULTORES	2026-05	2026-05-20	\N	\N	\N	\N	Liderazgo	\N	UF	2026-05-20	\N	0	0	0	\nInactivada por normalizacion de BD: cliente sin receptores activos.	PENDIENTE OC / HES	1	v1	\N	2026-05-06 15:39:23	2026-06-02 16:40:09	\N	\N	\N	\N
3dc583da-9119-4223-b299-5210c1896702	SF-2026-00023	mensual	cli_aristia	coor_002	MAS_CONSULTORES	2026-05	2026-05-31	\N	1876127	\N	N/A	total	Plataforma	UF	2026-05-31	40610.69	6.199998e+06	1.178e+06	7.377998e+06	excepcional pago pendiente\nValor UF 2026-05-31: 40.610,69	FACTURA SOLICITADA	0	v1	\N	2026-05-06 16:57:32	2026-06-01 17:36:39	\N	\N	6.199998e+06	\N
fe5cea7d-416f-4815-83de-d9cf8f6d6faa	SF-2026-00024	mensual	cli_enaex	coor_001	MAS_CONSULTORES	2026-05	2026-05-08	\N	3800027672	\N	1003873160	Sistema de Puntos Enaex Academy\nN° proveedor: 401325	Plataformas	UF	2026-05-08	40226.79	6.114472e+06	1.16175e+06	7.276222e+06	Valor UF 2026-05-08: 40.226,79	FACTURA SOLICITADA	1	v1	\N	2026-05-13 13:57:48	2026-05-13 18:40:37	\N	\N	\N	\N
c130914e-2edc-4a0c-9a58-a630dff1065c	SF-2026-00025	mensual	cli_enaex	coor_001	MAS_CONSULTORES	2026-05	2026-05-14	\N	\N	\N	\N	LMS	\N	UF	2026-05-14	\N	0	0	0	monto_clp=11914472.08	PENDIENTE OC / HES	1	v1	\N	2026-05-13 18:41:28	2026-05-26 18:22:56	\N	\N	\N	\N
f316c25a-1e38-48d0-8993-f426c9c1f070	SF-2026-00026	mensual	cli_enaex	coor_001	MAS_CONSULTORES	2026-05	2026-05-14	\N	\N	\N	\N	LMS	\N	UF	2026-05-14	\N	0	0	0	monto_clp=11914472.08	PENDIENTE OC / HES	1	v1	\N	2026-05-14 19:54:12	2026-05-26 18:22:56	\N	\N	\N	\N
95e51a0a-b2f0-4655-b6cc-9031a7fc349c	SF-2026-00027	mensual	cli_enaex	\N	MAS_CAPACITACION	2026-05	2026-05-14	\N	\N	\N	\N	LMS	\N	UF	\N	\N	0	0	0	monto_clp=11914472.08	PENDIENTE OC / HES	1	v1	\N	2026-05-14 19:54:31	2026-05-14 19:54:36	\N	\N	\N	\N
55008c9e-6606-4bb3-872f-4ec6fecc03e6	SF-2026-00028	mensual	cli_enaex	\N	MAS_CAPACITACION	2026-05	2026-05-14	\N	\N	\N	\N	LMS	\N	UF	\N	\N	0	0	0	monto_clp=11914472.08	PENDIENTE OC / HES	1	v1	\N	2026-05-14 19:54:41	2026-05-14 19:55:04	\N	\N	\N	\N
464fa580-5850-4025-8ae4-a1268e6f2301	SF-2026-00029	mensual	cli_enaex	\N	MAS_CAPACITACION	2026-05	2026-05-14	\N	\N	\N	\N	LMS	\N	UF	\N	\N	0	0	0	monto_clp=11914472.08	PENDIENTE OC / HES	1	v1	\N	2026-05-14 19:55:15	2026-05-14 19:56:19	\N	\N	\N	\N
545ecbac-b1df-430f-9849-9de18b0523f9	SF-2026-00030	mensual	cli_enaex	\N	MAS_CAPACITACION	2026-05	2026-05-14	\N	\N	\N	\N	LMS	\N	UF	\N	\N	0	0	0	monto_clp=11914472.08	PENDIENTE OC / HES	1	v1	\N	2026-05-14 19:57:41	2026-05-14 20:00:52	\N	\N	\N	\N
9480067b-ffd1-435f-82d9-33a6e6c2f8d8	SF-2026-00032	mensual	cli_arcor	coor_002	MAS_CONSULTORES	2026-08	2026-06-01	\N	\N	\N	N/A	Talento	\N	CLP	2026-06-01	\N	3.466667e+06	658670	4.125337e+06	Monto CLP estimado segun formula indicada: (260/3)*40000.	PENDIENTE OC / HES	0	v1	\N	2026-05-25 15:48:13	2026-06-01 18:10:00	\N	\N	\N	\N
34644598-a822-4d9f-912e-9ca5265b2d3b	SF-2026-00033	mensual	cli_arcor	\N	MAS_CONSULTORES	2026-10	2026-05-25	\N	\N	\N	\N	Talento	Administración y Operación	CLP	\N	\N	3.466667e+06	658670	4.125337e+06	Monto CLP estimado segun formula indicada: (260/3)*40000.	PENDIENTE OC / HES	0	v1	\N	2026-05-25 15:48:13	2026-05-25 15:48:13	\N	\N	\N	\N
4a9336cd-3d12-4112-bd43-0f29add4a6a0	SF-2026-00034	mensual	cli_bex	coor_003	MAS_CONSULTORES	2026-07	2026-05-25	\N	\N	\N	\N	Reconocimiento	Administración y Operación	UF	2026-07-01	40000	2.64e+06	501600	3.1416e+06	Monto referencial con UF estimada 40.000 para JULIO 2026.\nValor UF 2026-07-01: 40.000,00	PENDIENTE OC / HES	0	v1	\N	2026-05-25 15:48:13	2026-05-25 15:48:13	\N	\N	\N	\N
fced3f1a-4078-4bb4-b04c-6bcce3ff8955	SF-2026-00035	mensual	cli_bex	coor_003	MAS_CONSULTORES	2026-09	2026-05-25	\N	\N	\N	\N	Reconocimiento	Administración y Operación	UF	2026-09-01	40000	2.64e+06	501600	3.1416e+06	Monto referencial con UF estimada 40.000 para SEPTIEMBRE 2026.\nValor UF 2026-09-01: 40.000,00	PENDIENTE OC / HES	0	v1	\N	2026-05-25 15:48:13	2026-05-25 15:48:13	\N	\N	\N	\N
0de2bf92-fd44-45c0-8a9c-3dd2302767b5	SF-2026-00036	mensual	cli_bex	coor_003	MAS_CONSULTORES	2026-12	2026-05-25	\N	\N	\N	\N	Reconocimiento	Administración y Operación	UF	2026-12-01	40000	2.64e+06	501600	3.1416e+06	Monto referencial con UF estimada 40.000 para DICIEMBRE 2026.\nValor UF 2026-12-01: 40.000,00	PENDIENTE OC / HES	0	v1	\N	2026-05-25 15:48:13	2026-05-25 15:48:13	\N	\N	\N	\N
fadf8375-3d9f-4354-8157-5fc128a0a76a	SF-2026-00037	mensual	cli_bex	coor_003	MAS_CONSULTORES	2026-10	2026-05-25	\N	\N	\N	\N	Desempeño	Administración y Operación	UF	2026-10-01	40000	1.08e+07	2.052e+06	1.2852e+07	Monto referencial con UF estimada 40.000 para OCTUBRE 2026.\nValor UF 2026-10-01: 40.000,00	PENDIENTE OC / HES	0	v1	\N	2026-05-25 15:48:13	2026-05-25 15:48:13	\N	\N	\N	\N
59a029c7-3025-418d-a90a-1e1a4128a2ef	SF-2026-00038	mensual	cli_copec	coor_003	MAS_CONSULTORES	2026-06	2026-05-27	\N	4503574336	\N	5012117359	Desempeño	Plataforma	UF	2026-05-27	40543.07	1.875522e+06	356350	2.231872e+06	Monto referencial con UF estimada 40.000 para JUNIO 2026.\nValor UF 2026-05-27: 40.543,07	PENDIENTE OC / HES	0	v1	\N	2026-05-25 15:48:13	2026-06-01 17:41:09	\N	\N	\N	\N
97c4fc89-34e5-48ef-a7b6-5413bd33c351	SF-2026-00039	mensual	cli_copec	coor_003	MAS_CONSULTORES	2026-07	2026-05-25	\N	\N	\N	\N	Desempeño	Administración y Operación	UF	2026-07-01	40000	1.8504e+06	351580	2.20198e+06	Monto referencial con UF estimada 40.000 para JULIO 2026.\nValor UF 2026-07-01: 40.000,00	PENDIENTE OC / HES	0	v1	\N	2026-05-25 15:48:13	2026-05-25 15:48:13	\N	\N	\N	\N
a3804a5e-7fd8-4c88-9ecd-33f1e7e31a2d	SF-2026-00040	mensual	cli_copec	coor_003	MAS_CONSULTORES	2026-08	2026-05-25	\N	\N	\N	\N	Desempeño	Administración y Operación	UF	2026-08-01	40000	1.8504e+06	351580	2.20198e+06	Monto referencial con UF estimada 40.000 para AGOSTO 2026.\nValor UF 2026-08-01: 40.000,00	PENDIENTE OC / HES	0	v1	\N	2026-05-25 15:48:13	2026-05-25 15:48:13	\N	\N	\N	\N
ab885469-199f-435e-870f-d439ebcd9ec6	SF-2026-00041	mensual	cli_copec	coor_003	MAS_CONSULTORES	2026-09	2026-05-25	\N	\N	\N	\N	Desempeño	Administración y Operación	UF	2026-09-01	40000	1.8504e+06	351580	2.20198e+06	Monto referencial con UF estimada 40.000 para SEPTIEMBRE 2026.\nValor UF 2026-09-01: 40.000,00	PENDIENTE OC / HES	0	v1	\N	2026-05-25 15:48:13	2026-05-25 15:48:13	\N	\N	\N	\N
6a07c314-d52d-4a6b-8b58-bb93d2919b1f	SF-2026-00042	mensual	cli_copec	coor_003	MAS_CONSULTORES	2026-10	2026-05-25	\N	\N	\N	\N	Desempeño	Administración y Operación	UF	2026-10-01	40000	1.8504e+06	351580	2.20198e+06	Monto referencial con UF estimada 40.000 para OCTUBRE 2026.\nValor UF 2026-10-01: 40.000,00	PENDIENTE OC / HES	0	v1	\N	2026-05-25 15:48:13	2026-05-25 15:48:13	\N	\N	\N	\N
f386e201-90ab-463d-8e52-a89e98d71fdd	SF-2026-00043	mensual	cli_copec	coor_003	MAS_CONSULTORES	2026-11	2026-05-25	\N	\N	\N	\N	Desempeño	Administración y Operación	UF	2026-11-01	40000	1.8504e+06	351580	2.20198e+06	Monto referencial con UF estimada 40.000 para NOVIEMBRE 2026.\nValor UF 2026-11-01: 40.000,00	PENDIENTE OC / HES	0	v1	\N	2026-05-25 15:48:13	2026-05-25 15:48:13	\N	\N	\N	\N
04943fec-1ce4-4771-96f3-690e41b918a2	SF-2026-00044	mensual	cli_copec	coor_003	MAS_CONSULTORES	2026-12	2026-05-25	\N	\N	\N	\N	Desempeño	Administración y Operación	UF	2026-12-01	40000	1.8504e+06	351580	2.20198e+06	Monto referencial con UF estimada 40.000 para DICIEMBRE 2026.\nValor UF 2026-12-01: 40.000,00	PENDIENTE OC / HES	0	v1	\N	2026-05-25 15:48:13	2026-05-25 15:48:13	\N	\N	\N	\N
a519697c-73fc-4173-a103-8518a075f761	SF-2026-00045	mensual	cli_copec	coor_003	MAS_CONSULTORES	2026-05	2026-05-27	\N	4503574336	\N	5012117342	Talento	Plataforma	UF	2026-05-27	40543.07	838025	159230	997255	Monto referencial con UF estimada 40.000 para JUNIO 2026.\nValor UF 2026-05-27: 40.543,07	FACTURA SOLICITADA	0	v1	\N	2026-05-25 15:48:13	2026-06-02 16:47:27	\N	\N	\N	\N
72e0042b-7c4e-47d4-a075-7109c70865f9	SF-2026-00046	mensual	cli_copec	coor_003	MAS_CONSULTORES	2026-07	2026-05-25	\N	\N	\N	\N	Talento	Administración y Operación	UF	2026-07-01	40000	826800	157100	983900	Monto referencial con UF estimada 40.000 para JULIO 2026.\nValor UF 2026-07-01: 40.000,00	PENDIENTE OC / HES	0	v1	\N	2026-05-25 15:48:13	2026-05-25 15:48:13	\N	\N	\N	\N
7ec6b974-35cc-42ae-86a8-a00755954a9b	SF-2026-00047	mensual	cli_copec	coor_003	MAS_CONSULTORES	2026-08	2026-05-25	\N	\N	\N	\N	Talento	Administración y Operación	UF	2026-08-01	40000	826800	157100	983900	Monto referencial con UF estimada 40.000 para AGOSTO 2026.\nValor UF 2026-08-01: 40.000,00	PENDIENTE OC / HES	0	v1	\N	2026-05-25 15:48:13	2026-05-25 15:48:13	\N	\N	\N	\N
68dfbdb5-5902-47a1-b4a4-01b2853f599d	SF-2026-00048	mensual	cli_copec	coor_003	MAS_CONSULTORES	2026-09	2026-05-25	\N	\N	\N	\N	Talento	Administración y Operación	UF	2026-09-01	40000	826800	157100	983900	Monto referencial con UF estimada 40.000 para SEPTIEMBRE 2026.\nValor UF 2026-09-01: 40.000,00	PENDIENTE OC / HES	0	v1	\N	2026-05-25 15:48:13	2026-05-25 15:48:13	\N	\N	\N	\N
515f97fb-05c9-4ce0-af55-bbed457a08ee	SF-2026-00049	mensual	cli_copec	coor_003	MAS_CONSULTORES	2026-10	2026-05-25	\N	\N	\N	\N	Talento	Administración y Operación	UF	2026-10-01	40000	826800	157100	983900	Monto referencial con UF estimada 40.000 para OCTUBRE 2026.\nValor UF 2026-10-01: 40.000,00	PENDIENTE OC / HES	0	v1	\N	2026-05-25 15:48:13	2026-05-25 15:48:13	\N	\N	\N	\N
30f486f2-f449-4e43-9d69-941d198a59e6	SF-2026-00050	mensual	cli_copec	coor_003	MAS_CONSULTORES	2026-11	2026-05-25	\N	\N	\N	\N	Talento	Administración y Operación	UF	2026-11-01	40000	826800	157100	983900	Monto referencial con UF estimada 40.000 para NOVIEMBRE 2026.\nValor UF 2026-11-01: 40.000,00	PENDIENTE OC / HES	0	v1	\N	2026-05-25 15:48:13	2026-05-25 15:48:13	\N	\N	\N	\N
f744aed4-dcd3-43a5-9a21-e003ce769f67	SF-2026-00051	mensual	cli_copec	coor_003	MAS_CONSULTORES	2026-12	2026-05-25	\N	\N	\N	\N	Talento	Administración y Operación	UF	2026-12-01	40000	826800	157100	983900	Monto referencial con UF estimada 40.000 para DICIEMBRE 2026.\nValor UF 2026-12-01: 40.000,00	PENDIENTE OC / HES	0	v1	\N	2026-05-25 15:48:13	2026-05-25 15:48:13	\N	\N	\N	\N
c70310b1-e8b7-4bc0-802c-a6ca91a279d8	SF-2026-00052	mensual	cli_emin	coor_002	MAS_CONSULTORES	2026-06	2026-06-01	\N	\N	\N	N/A	Desempeño	\N	UF	2026-06-01	40000	2.912e+06	553280	3.46528e+06	Monto referencial con UF estimada 40.000 para JUNIO 2026.\nValor UF 2026-06-01: 40.000,00	PENDIENTE OC / HES	0	v1	\N	2026-05-25 15:48:13	2026-06-01 16:29:39	\N	\N	\N	\N
b255ca53-f3eb-4732-af12-cd945f095fe9	SF-2026-00053	mensual	cli_emin	coor_002	MAS_CONSULTORES	2026-07	2026-07-01	\N	\N	\N	N/A	Desempeño	\N	UF	2026-07-01	40000	2.912e+06	553280	3.46528e+06	Monto referencial con UF estimada 40.000 para JULIO 2026.\nValor UF 2026-07-01: 40.000,00	PENDIENTE OC / HES	0	v1	\N	2026-05-25 15:48:13	2026-06-01 18:10:14	\N	\N	\N	\N
9cbdc2e9-c1af-414e-ac52-498d9282a2a6	SF-2026-00054	mensual	cli_emin	\N	MAS_CONSULTORES	2026-08	2026-05-25	\N	\N	\N	\N	Desempeño	Administración y Operación	UF	2026-08-01	40000	2.912e+06	553280	3.46528e+06	Monto referencial con UF estimada 40.000 para AGOSTO 2026.\nValor UF 2026-08-01: 40.000,00	PENDIENTE OC / HES	0	v1	\N	2026-05-25 15:48:13	2026-05-25 15:48:13	\N	\N	\N	\N
b0c1aab4-3f5f-476a-8a24-8c8d33111ce6	SF-2026-00055	mensual	cli_emin	\N	MAS_CONSULTORES	2026-09	2026-05-25	\N	\N	\N	\N	Desempeño	Administración y Operación	UF	2026-09-01	40000	2.912e+06	553280	3.46528e+06	Monto referencial con UF estimada 40.000 para SEPTIEMBRE 2026.\nValor UF 2026-09-01: 40.000,00	PENDIENTE OC / HES	0	v1	\N	2026-05-25 15:48:13	2026-05-25 15:48:13	\N	\N	\N	\N
5aaf9575-fdfd-4f0d-a062-51fe215a5167	SF-2026-00056	mensual	cli_emin	\N	MAS_CONSULTORES	2026-10	2026-05-25	\N	\N	\N	\N	Desempeño	Administración y Operación	UF	2026-10-01	40000	2.912e+06	553280	3.46528e+06	Monto referencial con UF estimada 40.000 para OCTUBRE 2026.\nValor UF 2026-10-01: 40.000,00	PENDIENTE OC / HES	0	v1	\N	2026-05-25 15:48:13	2026-05-25 15:48:13	\N	\N	\N	\N
39dce8b7-d452-4c06-a9d1-7d524c74f1ce	SF-2026-00057	mensual	cli_emin	\N	MAS_CONSULTORES	2026-11	2026-05-25	\N	\N	\N	\N	Desempeño	Administración y Operación	UF	2026-11-01	40000	2.912e+06	553280	3.46528e+06	Monto referencial con UF estimada 40.000 para NOVIEMBRE 2026.\nValor UF 2026-11-01: 40.000,00	PENDIENTE OC / HES	0	v1	\N	2026-05-25 15:48:13	2026-05-25 15:48:13	\N	\N	\N	\N
45cea2d5-f7cc-46b9-b5d1-5dc017d5e4e0	SF-2026-00058	mensual	cli_emin	\N	MAS_CONSULTORES	2026-12	2026-05-25	\N	\N	\N	\N	Desempeño	Administración y Operación	UF	2026-12-01	40000	2.912e+06	553280	3.46528e+06	Monto referencial con UF estimada 40.000 para DICIEMBRE 2026.\nValor UF 2026-12-01: 40.000,00	PENDIENTE OC / HES	0	v1	\N	2026-05-25 15:48:13	2026-05-25 15:48:13	\N	\N	\N	\N
541641a6-78b6-43bb-9c0c-d63853dd5e98	SF-2026-00059	mensual	cli_salmones	coor_001	MAS_CONSULTORES	2026-06	2026-05-25	\N	\N	\N	\N	Liderazgo	Administración y Operación	UF	2026-06-01	40000	3.76e+06	714400	4.4744e+06	Monto referencial con UF estimada 40.000 para JUNIO 2026.\nValor UF 2026-06-01: 40.000,00\nInactivada por normalizacion de BD: cliente sin receptores activos.	PENDIENTE OC / HES	1	v1	\N	2026-05-25 15:48:13	2026-06-02 16:40:09	\N	\N	\N	\N
81968ec2-cf44-496f-9e01-a98eff2ac718	SF-2026-00060	mensual	cli_soprole	coor_001	MAS_CONSULTORES	2026-06	2026-05-25	\N	\N	\N	\N	Desempeño	Administración y Operación	UF	2026-06-01	40000	1.4e+06	266000	1.666e+06	Monto referencial con UF estimada 40.000 para JUNIO 2026.\nValor UF 2026-06-01: 40.000,00	PENDIENTE OC / HES	0	v1	\N	2026-05-25 15:48:13	2026-05-25 15:48:13	\N	\N	\N	\N
61aa55d4-d219-47c9-a8ad-43e6ecaafc9d	SF-2026-00061	mensual	cli_soprole	coor_001	MAS_CONSULTORES	2026-07	2026-05-25	\N	\N	\N	\N	Desempeño	Administración y Operación	UF	2026-07-01	40000	1.4e+06	266000	1.666e+06	Monto referencial con UF estimada 40.000 para JULIO 2026.\nValor UF 2026-07-01: 40.000,00	PENDIENTE OC / HES	0	v1	\N	2026-05-25 15:48:13	2026-05-25 15:48:13	\N	\N	\N	\N
e7e8f834-1867-40d0-94d1-2e0edb822937	SF-2026-00062	mensual	cli_soprole	coor_001	MAS_CONSULTORES	2026-08	2026-05-25	\N	\N	\N	\N	Desempeño	Administración y Operación	UF	2026-08-01	40000	1.4e+06	266000	1.666e+06	Monto referencial con UF estimada 40.000 para AGOSTO 2026.\nValor UF 2026-08-01: 40.000,00	PENDIENTE OC / HES	0	v1	\N	2026-05-25 15:48:13	2026-05-25 15:48:13	\N	\N	\N	\N
e00a4764-d7e7-428d-bf38-bb14a4f97eb8	SF-2026-00063	mensual	cli_soprole	coor_001	MAS_CONSULTORES	2026-09	2026-05-25	\N	\N	\N	\N	Desempeño	Administración y Operación	UF	2026-09-01	40000	1.4e+06	266000	1.666e+06	Monto referencial con UF estimada 40.000 para SEPTIEMBRE 2026.\nValor UF 2026-09-01: 40.000,00	PENDIENTE OC / HES	0	v1	\N	2026-05-25 15:48:13	2026-05-25 15:48:13	\N	\N	\N	\N
708f2199-14e0-4f2e-b15b-5ce1bca884e6	SF-2026-00064	mensual	cli_soprole	coor_001	MAS_CONSULTORES	2026-10	2026-05-25	\N	\N	\N	\N	Desempeño	Administración y Operación	UF	2026-10-01	40000	1.4e+06	266000	1.666e+06	Monto referencial con UF estimada 40.000 para OCTUBRE 2026.\nValor UF 2026-10-01: 40.000,00	PENDIENTE OC / HES	0	v1	\N	2026-05-25 15:48:13	2026-05-25 15:48:13	\N	\N	\N	\N
a5c78a1c-506f-4392-b655-ddaa24064b4c	SF-2026-00065	mensual	cli_soprole	coor_001	MAS_CONSULTORES	2026-11	2026-05-25	\N	\N	\N	\N	Desempeño	Administración y Operación	UF	2026-11-01	40000	1.4e+06	266000	1.666e+06	Monto referencial con UF estimada 40.000 para NOVIEMBRE 2026.\nValor UF 2026-11-01: 40.000,00	PENDIENTE OC / HES	0	v1	\N	2026-05-25 15:48:13	2026-05-25 15:48:13	\N	\N	\N	\N
5f198a21-bb8a-4738-9b3a-c582ea366e63	SF-2026-00066	mensual	cli_soprole	coor_001	MAS_CONSULTORES	2026-12	2026-05-25	\N	\N	\N	\N	Desempeño	Administración y Operación	UF	2026-12-01	40000	1.4e+06	266000	1.666e+06	Monto referencial con UF estimada 40.000 para DICIEMBRE 2026.\nValor UF 2026-12-01: 40.000,00	PENDIENTE OC / HES	0	v1	\N	2026-05-25 15:48:13	2026-05-25 15:48:13	\N	\N	\N	\N
e118f729-387d-4beb-8c4f-57ce9cb59e71	SF-2026-00068	mensual	cli_enaex	coor_001	MAS_CONSULTORES	2026-05	2026-05-28	\N	4400048853	\N	1003884808	Plataforma Enaex Academy Mayo\nN° proveedor: 401325	Plataforma	UF	2026-05-28	40559.96	5.881194e+06	1.11743e+06	6.998624e+06	Valor UF 2026-05-28: 40.559,96	FACTURA SOLICITADA	0	v1	\N	2026-06-01 16:45:13	2026-06-01 16:45:17	\N	\N	\N	\N
42bbc224-ef71-4895-8479-c7a173d51930	SF-2026-00069	mensual	cli_magotteaux	coor_002	MAS_CONSULTORES	2026-06	2026-06-01	\N	\N	\N	N/A		Plataforma	UF	2026-06-01	40627.62	731297	138950	870247	Valor UF 2026-06-01: 40.627,62	PENDIENTE OC / HES	0	v1	\N	2026-06-01 20:13:50	2026-06-01 20:13:50	\N	\N	\N	\N
197b6317-1e51-4d4d-9f34-6e26a13a4e8f	SF-2026-00070	mensual	cli_enaex	coor_001	MAS_CONSULTORES	2026-06	2026-06-01	\N	\N	\N	N/A		\N	UF	2026-06-01	40627.62	5.891005e+06	1.1193e+06	7.010305e+06	Valor UF 2026-06-01: 40.627,62	PENDIENTE OC / HES	0	v1	\N	2026-06-01 20:15:09	2026-06-01 20:15:09	\N	\N	\N	\N
7afcd067-c5f0-4570-86d9-21fbb1c6d0e3	SF-2026-00071	mensual	cli_copec	coor_003	MAS_CONSULTORES	2026-06	2026-06-01	\N	\N	\N	N/A		Plataforma	UF	2026-06-01	40627.62	839773	159560	999333	Valor UF 2026-06-01: 40.627,62	PENDIENTE OC / HES	0	v1	\N	2026-06-01 20:16:01	2026-06-02 16:57:04	\N	\N	\N	\N
b9a5cc11-7136-4b4d-a9a9-457a75d2a24f	SF-2026-00031	mensual	cli_arcor	coor_002	MAS_CONSULTORES	2026-05	2026-05-29	\N	4700882	\N	N/A	Talento	Plataforma	UF	2026-05-29	40559.96	3.51487e+06	667830	4.1827e+06	Monto CLP estimado segun formula indicada: (260/3)*40000.\nValor UF 2026-05-29: 40.559,96	FACTURA SOLICITADA	0	v1	\N	2026-05-25 15:48:13	2026-06-25 17:23:46	\N	\N	3.51487e+06	\N
ce422bc7-e2ae-4100-8db8-bf33e6ef5201	SF-2026-00067	mensual	cli_transelect	\N	MAS_CONSULTORES	2026-06	2026-06-01	\N	4503574336	\N	N/A	LMS	Plataforma	UF	2026-06-01	40000	2.4e+06	456000	2.856e+06	Monto referencial con UF estimada 40.000 para JUNIO 2026.\nValor UF 2026-06-01: 40.000,00	PENDIENTE OC / HES	0	v1	\N	2026-05-25 15:48:13	2026-06-26 13:46:53	\N	\N	\N	\N
2d01ee01-144e-4b06-9fc7-bedf82040cf0	SF-2026-00072	mensual	cli_copec	coor_003	MAS_CONSULTORES	2026-06	2026-06-26	\N	3800027672	\N	N/A	DASDSA	Plataforma	UF	2026-06-26	40809.44	843531	160280	1.003811e+06	Valor UF 2026-06-26: 40.809,44	FACTURA SOLICITADA	0	v1	\N	2026-06-26 15:23:37.706038+00	2026-06-26 15:23:57	\N	\N	\N	\N
e27f44c9-de0d-4960-af2b-ee0ff5b1afee	SF-2026-00073	mensual	cli_afp_habitat	coor_001	MAS_CONSULTORES	2026-06	2026-06-26	\N	OC-PRUEBA-UX-AUTOSAVE	\N	N/A	PRUEBA UX AUTOSAVE - CAMBIO GUARDADO	Plataforma	UF	2026-06-26	40809.44	408	80	488	PRUEBA UX AUTOSAVE - DESCARTAR\nValor UF 2026-06-26: 40.809,44	FACTURA SOLICITADA	1	v1	\N	2026-06-26 15:53:21.13862+00	2026-06-26 15:53:21	\N	\N	\N	\N
1be97ed8-cfad-4ec6-ae53-5d9ad1601b0d	SF-2026-00074	mensual	cli_afp_habitat	coor_001	MAS_CONSULTORES	2026-06	2026-06-26	\N	\N	aaaa	N/A	a	\N	UF	2026-06-26	40809.44	163238	31020	194258	Valor UF 2026-06-26: 40.809,44	FACTURA SOLICITADA	0	v1	\N	2026-06-26 16:09:16.284554+00	2026-06-26 16:11:00	\N	\N	\N	\N
ae7366e1-5a90-4690-b612-c339f928f22a	SF-2026-00076	mensual	cli_afp_habitat	coor_001	MAS_CONSULTORES	2026-06	2026-06-26	\N	\N	aaaa	N/A	a	\N	UF	2026-06-26	40809.44	612142	116310	728452	Valor UF 2026-06-26: 40.809,44	PENDIENTE OC / HES	0	v1	\N	2026-06-26 16:18:07.278207+00	2026-06-26 16:18:30	\N	\N	\N	\N
a1e8b706-9a8d-4c7d-9303-f3c454c0de44	SF-2026-00077	mensual	cli_afp_habitat	coor_001	MAS_CONSULTORES	2026-06	2026-06-26	\N	\N	aaaa	N/A	a	\N	UF	2026-06-26	40809.44	3.264755e+06	620310	3.885065e+06	Valor UF 2026-06-26: 40.809,44	PENDIENTE OC / HES	0	v1	\N	2026-06-26 16:18:44.240784+00	2026-06-26 16:18:57	\N	\N	\N	\N
7b12599c-2837-45d5-8d2a-2b965278a337	SF-2026-00075	mensual	cli_andritz	\N	MAS_CONSULTORES	2026-06	2026-06-26	\N	\N	\N	N/A		\N	UF	2026-06-26	\N	0	0	0	\N	PENDIENTE OC / HES	1	v1	\N	2026-06-26 16:17:32.865959+00	2026-06-26 16:43:20	\N	\N	\N	\N
cf1915e3-4f74-4e38-8f56-43d0bc3d123b	SF-2026-00078	mensual	cli_afp_habitat	coor_004	MAS_CONSULTORES	2026-06	2026-06-26	\N	OC-PRUEBA-EXPORT-SAVE	CONTRATO-PRUEBA-UX	N/A	PRUEBA UX EXPORT SAVE - DESCARTAR	Plataforma	UF	2026-06-26	40809.44	408	80	488	PRUEBA UX EXPORT SAVE - DESCARTAR\nValor UF 2026-06-26: 40.809,44	FACTURA SOLICITADA	1	v1	\N	2026-06-26 16:44:19.474088+00	2026-06-26 16:44:19	\N	\N	\N	\N
3b8d59c2-6f4d-49b8-9795-280e007afe76	SF-2026-00079	mensual	cli_copec	coor_003	MAS_CONSULTORES	2026-06	2026-06-26	\N	OC-PRUEBA-HOME-DUP	\N	N/A	Prueba duplicacion Home - prueba UX duplicate	Plataforma	UF	2026-06-01	40627.62	840179	159640	999819	Valor UF 2026-06-01: 40.627,62	FACTURA SOLICITADA	1	v1	\N	2026-06-26 20:17:11.188498+00	2026-06-26 20:17:11	\N	\N	\N	\N
e5c3a1a8-de16-4e8f-921e-4a2e490aa61d	SF-2026-00080	mensual	cli_afp_habitat	coor_001	MAS_CONSULTORES	2026-06	2026-07-01	\N	aaaa	aaaa	N/A	a	Plataforma	UF	2026-07-01	40823.03	6.123455e+06	1.16346e+06	7.286915e+06	Valor UF 2026-07-01: 40.823,03	FACTURA SOLICITADA	0	v1	\N	2026-07-01 16:41:39.109455+00	2026-07-01 16:41:39	\N	\N	\N	\N
72ab8552-2cb2-4740-b663-144f340761e6	SF-2026-00081	mensual	cli_afp_habitat	coor_001	MAS_CONSULTORES	2026-06	2026-07-01	\N	aaaa	aaaa	N/A	a	Plataforma	UF	2026-07-01	40823.03	5.715224e+06	1.0859e+06	6.801124e+06	Valor UF 2026-07-01: 40.823,03	FACTURA SOLICITADA	0	v1	\N	2026-07-01 17:53:15.001097+00	2026-07-01 17:53:15	\N	\N	\N	\N
aeba8638-dc71-4a91-a453-7298951ad44f	SF-2026-00082	mensual	cli_afp_habitat	coor_001	MAS_CONSULTORES	2026-07	2026-07-07	\N	OC-E2E-1783439106928	\N	HES-E2E-1783439106928	Prueba flujo completo Codex 1783439106928	PRUEBAS	CLP	\N	\N	123456	23460	146916	Prueba automatizada flujo completo	FACTURA SOLICITADA	1	v1	\N	2026-07-07 15:45:06.937935+00	2026-07-07 15:45:07	\N	\N	123456	\N
\.


--
-- Data for Name: solicitud_item; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.solicitud_item (id, solicitud_id, producto_id, descripcion, codigo_ref, cantidad, uf_unitaria, clp_unitario, subtotal_clp, orden) FROM stdin;
6b1db691-cb13-481d-a5bb-c21e1d21be88	6b2c61bb-4ab8-4d74-80ae-b71bfc7e0d03	\N	Soporte mensual	\N	1	\N	2.775051e+06	2.775051e+06	0
\.


--
-- Data for Name: solicitud_programada; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.solicitud_programada (id, cliente_id, nombre, dia_emision, frecuencia, mes_inicio, activa, payload_base, proxima_generacion, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: solicitud_receptor; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.solicitud_receptor (solicitud_id, receptor_id) FROM stdin;
127c8e80-0d99-424c-85dd-8a9d2339395f	recep_025
127c8e80-0d99-424c-85dd-8a9d2339395f	recep_026
127c8e80-0d99-424c-85dd-8a9d2339395f	recep_027
3e99f9ab-c36d-4ba9-94e3-32548f66d1be	recep_025
3e99f9ab-c36d-4ba9-94e3-32548f66d1be	recep_026
3e99f9ab-c36d-4ba9-94e3-32548f66d1be	recep_027
1a742b1a-dd75-47f5-9fd8-40bc0128a427	recep_013
1a742b1a-dd75-47f5-9fd8-40bc0128a427	recep_014
35a5142d-995f-494c-962d-660411d86f6a	recep_041
35a5142d-995f-494c-962d-660411d86f6a	recep_042
3c1148de-9ede-499b-b5a7-15f3c0da1fe9	recep_008
3c1148de-9ede-499b-b5a7-15f3c0da1fe9	recep_009
3c1148de-9ede-499b-b5a7-15f3c0da1fe9	recep_010
63465b42-92c9-4853-b911-8c0adb5a5daa	recep_041
63465b42-92c9-4853-b911-8c0adb5a5daa	recep_042
93bee80c-45b5-41ce-9c50-29ef33587624	recep_013
93bee80c-45b5-41ce-9c50-29ef33587624	recep_014
ecccbd54-12ad-4eab-9628-0063c69daee5	recep_015
ecccbd54-12ad-4eab-9628-0063c69daee5	recep_016
ecccbd54-12ad-4eab-9628-0063c69daee5	recep_017
3a59daf9-386e-4f0b-94a2-974263fe245a	recep_023
67e22a2d-37c8-4c8f-a2ef-5c9ea3dc0eb9	recep_023
23a25098-74ec-4a9c-9a9e-d81d6dfbefdc	recep_023
6767da9d-52b4-43db-ae29-a0d6b8dfba35	recep_023
2b770da1-c051-43f1-9c6b-4e7f768c6cd2	recep_023
fe5cea7d-416f-4815-83de-d9cf8f6d6faa	recep_041
f316c25a-1e38-48d0-8993-f426c9c1f070	recep_041
f316c25a-1e38-48d0-8993-f426c9c1f070	recep_042
95e51a0a-b2f0-4655-b6cc-9031a7fc349c	recep_042
95e51a0a-b2f0-4655-b6cc-9031a7fc349c	recep_041
55008c9e-6606-4bb3-872f-4ec6fecc03e6	recep_042
55008c9e-6606-4bb3-872f-4ec6fecc03e6	recep_041
464fa580-5850-4025-8ae4-a1268e6f2301	recep_042
464fa580-5850-4025-8ae4-a1268e6f2301	recep_041
545ecbac-b1df-430f-9849-9de18b0523f9	recep_042
545ecbac-b1df-430f-9849-9de18b0523f9	recep_041
a91476e8-ffc9-4800-8237-32b97574afe8	recep_041
a91476e8-ffc9-4800-8237-32b97574afe8	recep_042
aa40cf8e-ac7a-45e6-8aae-600af11029c3	recep_019
aa40cf8e-ac7a-45e6-8aae-600af11029c3	recep_020
aa40cf8e-ac7a-45e6-8aae-600af11029c3	recep_021
34644598-a822-4d9f-912e-9ca5265b2d3b	recep_007
34644598-a822-4d9f-912e-9ca5265b2d3b	recep_004
34644598-a822-4d9f-912e-9ca5265b2d3b	recep_005
4a9336cd-3d12-4112-bd43-0f29add4a6a0	recep_012
4a9336cd-3d12-4112-bd43-0f29add4a6a0	recep_011
fced3f1a-4078-4bb4-b04c-6bcce3ff8955	recep_012
fced3f1a-4078-4bb4-b04c-6bcce3ff8955	recep_011
0de2bf92-fd44-45c0-8a9c-3dd2302767b5	recep_012
0de2bf92-fd44-45c0-8a9c-3dd2302767b5	recep_011
fadf8375-3d9f-4354-8157-5fc128a0a76a	recep_012
fadf8375-3d9f-4354-8157-5fc128a0a76a	recep_011
97c4fc89-34e5-48ef-a7b6-5413bd33c351	recep_015
97c4fc89-34e5-48ef-a7b6-5413bd33c351	recep_017
97c4fc89-34e5-48ef-a7b6-5413bd33c351	recep_016
a3804a5e-7fd8-4c88-9ecd-33f1e7e31a2d	recep_015
a3804a5e-7fd8-4c88-9ecd-33f1e7e31a2d	recep_017
a3804a5e-7fd8-4c88-9ecd-33f1e7e31a2d	recep_016
ab885469-199f-435e-870f-d439ebcd9ec6	recep_015
ab885469-199f-435e-870f-d439ebcd9ec6	recep_017
ab885469-199f-435e-870f-d439ebcd9ec6	recep_016
6a07c314-d52d-4a6b-8b58-bb93d2919b1f	recep_015
6a07c314-d52d-4a6b-8b58-bb93d2919b1f	recep_017
6a07c314-d52d-4a6b-8b58-bb93d2919b1f	recep_016
f386e201-90ab-463d-8e52-a89e98d71fdd	recep_015
f386e201-90ab-463d-8e52-a89e98d71fdd	recep_017
f386e201-90ab-463d-8e52-a89e98d71fdd	recep_016
04943fec-1ce4-4771-96f3-690e41b918a2	recep_015
04943fec-1ce4-4771-96f3-690e41b918a2	recep_017
04943fec-1ce4-4771-96f3-690e41b918a2	recep_016
72e0042b-7c4e-47d4-a075-7109c70865f9	recep_015
72e0042b-7c4e-47d4-a075-7109c70865f9	recep_017
72e0042b-7c4e-47d4-a075-7109c70865f9	recep_016
7ec6b974-35cc-42ae-86a8-a00755954a9b	recep_015
7ec6b974-35cc-42ae-86a8-a00755954a9b	recep_017
7ec6b974-35cc-42ae-86a8-a00755954a9b	recep_016
68dfbdb5-5902-47a1-b4a4-01b2853f599d	recep_015
68dfbdb5-5902-47a1-b4a4-01b2853f599d	recep_017
68dfbdb5-5902-47a1-b4a4-01b2853f599d	recep_016
515f97fb-05c9-4ce0-af55-bbed457a08ee	recep_015
515f97fb-05c9-4ce0-af55-bbed457a08ee	recep_017
515f97fb-05c9-4ce0-af55-bbed457a08ee	recep_016
30f486f2-f449-4e43-9d69-941d198a59e6	recep_015
30f486f2-f449-4e43-9d69-941d198a59e6	recep_017
30f486f2-f449-4e43-9d69-941d198a59e6	recep_016
f744aed4-dcd3-43a5-9a21-e003ce769f67	recep_015
f744aed4-dcd3-43a5-9a21-e003ce769f67	recep_017
f744aed4-dcd3-43a5-9a21-e003ce769f67	recep_016
9cbdc2e9-c1af-414e-ac52-498d9282a2a6	recep_018
b0c1aab4-3f5f-476a-8a24-8c8d33111ce6	recep_018
5aaf9575-fdfd-4f0d-a062-51fe215a5167	recep_018
39dce8b7-d452-4c06-a9d1-7d524c74f1ce	recep_018
45cea2d5-f7cc-46b9-b5d1-5dc017d5e4e0	recep_018
81968ec2-cf44-496f-9e01-a98eff2ac718	recep_023
81968ec2-cf44-496f-9e01-a98eff2ac718	recep_024
61aa55d4-d219-47c9-a8ad-43e6ecaafc9d	recep_023
61aa55d4-d219-47c9-a8ad-43e6ecaafc9d	recep_024
e7e8f834-1867-40d0-94d1-2e0edb822937	recep_023
e7e8f834-1867-40d0-94d1-2e0edb822937	recep_024
e00a4764-d7e7-428d-bf38-bb14a4f97eb8	recep_023
e00a4764-d7e7-428d-bf38-bb14a4f97eb8	recep_024
708f2199-14e0-4f2e-b15b-5ce1bca884e6	recep_023
708f2199-14e0-4f2e-b15b-5ce1bca884e6	recep_024
a5c78a1c-506f-4392-b655-ddaa24064b4c	recep_023
a5c78a1c-506f-4392-b655-ddaa24064b4c	recep_024
5f198a21-bb8a-4738-9b3a-c582ea366e63	recep_023
5f198a21-bb8a-4738-9b3a-c582ea366e63	recep_024
c130914e-2edc-4a0c-9a58-a630dff1065c	recep_041
c130914e-2edc-4a0c-9a58-a630dff1065c	recep_042
74244347-73f3-4cff-92cc-b2b2ae652276	recep_015
74244347-73f3-4cff-92cc-b2b2ae652276	recep_016
74244347-73f3-4cff-92cc-b2b2ae652276	recep_017
1ebc6410-acde-4035-a83d-61a0c2a23264	recep_023
c70310b1-e8b7-4bc0-802c-a6ca91a279d8	recep_018
e118f729-387d-4beb-8c4f-57ce9cb59e71	recep_041
b9a5cc11-7136-4b4d-a9a9-457a75d2a24f	recep_004
b9a5cc11-7136-4b4d-a9a9-457a75d2a24f	recep_005
b9a5cc11-7136-4b4d-a9a9-457a75d2a24f	recep_007
3dc583da-9119-4223-b299-5210c1896702	recep_008
3dc583da-9119-4223-b299-5210c1896702	recep_009
3dc583da-9119-4223-b299-5210c1896702	recep_010
59dd0371-e9b0-4ac2-b7c1-23de4f1ba5be	recep_018
59a029c7-3025-418d-a90a-1e1a4128a2ef	recep_015
59a029c7-3025-418d-a90a-1e1a4128a2ef	recep_016
59a029c7-3025-418d-a90a-1e1a4128a2ef	recep_017
9480067b-ffd1-435f-82d9-33a6e6c2f8d8	recep_004
9480067b-ffd1-435f-82d9-33a6e6c2f8d8	recep_005
9480067b-ffd1-435f-82d9-33a6e6c2f8d8	recep_007
b255ca53-f3eb-4732-af12-cd945f095fe9	recep_018
42bbc224-ef71-4895-8479-c7a173d51930	recep_019
42bbc224-ef71-4895-8479-c7a173d51930	recep_021
42bbc224-ef71-4895-8479-c7a173d51930	recep_020
197b6317-1e51-4d4d-9f34-6e26a13a4e8f	recep_042
197b6317-1e51-4d4d-9f34-6e26a13a4e8f	recep_041
c3f69878-c7b5-47b9-a23a-88fc64ef8842	recep_011
c3f69878-c7b5-47b9-a23a-88fc64ef8842	recep_012
7afcd067-c5f0-4570-86d9-21fbb1c6d0e3	recep_015
7afcd067-c5f0-4570-86d9-21fbb1c6d0e3	recep_016
7afcd067-c5f0-4570-86d9-21fbb1c6d0e3	recep_017
a519697c-73fc-4173-a103-8518a075f761	recep_015
a519697c-73fc-4173-a103-8518a075f761	recep_016
a519697c-73fc-4173-a103-8518a075f761	recep_017
ce422bc7-e2ae-4100-8db8-bf33e6ef5201	recep_025
ce422bc7-e2ae-4100-8db8-bf33e6ef5201	recep_026
ce422bc7-e2ae-4100-8db8-bf33e6ef5201	recep_027
2d01ee01-144e-4b06-9fc7-bedf82040cf0	recep_015
2d01ee01-144e-4b06-9fc7-bedf82040cf0	recep_016
2d01ee01-144e-4b06-9fc7-bedf82040cf0	recep_017
e27f44c9-de0d-4960-af2b-ee0ff5b1afee	recep_029
1be97ed8-cfad-4ec6-ae53-5d9ad1601b0d	recep_029
1be97ed8-cfad-4ec6-ae53-5d9ad1601b0d	recep_030
1be97ed8-cfad-4ec6-ae53-5d9ad1601b0d	recep_028
7b12599c-2837-45d5-8d2a-2b965278a337	recep_003
7b12599c-2837-45d5-8d2a-2b965278a337	recep_002
7b12599c-2837-45d5-8d2a-2b965278a337	recep_001
ae7366e1-5a90-4690-b612-c339f928f22a	recep_029
ae7366e1-5a90-4690-b612-c339f928f22a	recep_030
ae7366e1-5a90-4690-b612-c339f928f22a	recep_028
a1e8b706-9a8d-4c7d-9303-f3c454c0de44	recep_029
a1e8b706-9a8d-4c7d-9303-f3c454c0de44	recep_030
a1e8b706-9a8d-4c7d-9303-f3c454c0de44	recep_028
cf1915e3-4f74-4e38-8f56-43d0bc3d123b	recep_029
3b8d59c2-6f4d-49b8-9795-280e007afe76	recep_015
3b8d59c2-6f4d-49b8-9795-280e007afe76	recep_016
3b8d59c2-6f4d-49b8-9795-280e007afe76	recep_017
e5c3a1a8-de16-4e8f-921e-4a2e490aa61d	recep_028
e5c3a1a8-de16-4e8f-921e-4a2e490aa61d	recep_029
e5c3a1a8-de16-4e8f-921e-4a2e490aa61d	recep_030
72ab8552-2cb2-4740-b663-144f340761e6	recep_028
72ab8552-2cb2-4740-b663-144f340761e6	recep_029
72ab8552-2cb2-4740-b663-144f340761e6	recep_030
aeba8638-dc71-4a91-a453-7298951ad44f	recep_029
\.


--
-- Data for Name: uf_cache; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.uf_cache (fecha, valor, source, obtenido_at) FROM stdin;
2025-05-01	39081.9	sii.cl	2026-07-15 18:03:46
2025-05-11	39138.96	sii.cl	2026-07-15 18:03:46
2025-05-21	39164.2	sii.cl	2026-07-15 18:03:46
2025-05-02	39088.4	sii.cl	2026-07-15 18:03:46
2025-05-12	39141.49	sii.cl	2026-07-15 18:03:46
2025-05-22	39166.72	sii.cl	2026-07-15 18:03:46
2025-05-03	39094.9	sii.cl	2026-07-15 18:03:46
2025-05-13	39144.01	sii.cl	2026-07-15 18:03:46
2025-05-23	39169.25	sii.cl	2026-07-15 18:03:46
2025-05-04	39101.4	sii.cl	2026-07-15 18:03:46
2025-05-14	39146.53	sii.cl	2026-07-15 18:03:46
2025-05-24	39171.77	sii.cl	2026-07-15 18:03:46
2025-05-05	39107.9	sii.cl	2026-07-15 18:03:46
2025-05-15	39149.06	sii.cl	2026-07-15 18:03:46
2025-05-25	39174.3	sii.cl	2026-07-15 18:03:46
2025-05-06	39114.4	sii.cl	2026-07-15 18:03:46
2025-05-16	39151.58	sii.cl	2026-07-15 18:03:46
2025-05-26	39176.82	sii.cl	2026-07-15 18:03:46
2025-05-07	39120.91	sii.cl	2026-07-15 18:03:46
2025-05-17	39154.1	sii.cl	2026-07-15 18:03:46
2025-05-27	39179.35	sii.cl	2026-07-15 18:03:46
2025-05-08	39127.41	sii.cl	2026-07-15 18:03:46
2025-05-18	39156.63	sii.cl	2026-07-15 18:03:46
2025-05-28	39181.87	sii.cl	2026-07-15 18:03:46
2025-05-09	39133.92	sii.cl	2026-07-15 18:03:46
2025-05-19	39159.15	sii.cl	2026-07-15 18:03:46
2025-05-29	39184.4	sii.cl	2026-07-15 18:03:46
2025-05-10	39136.44	sii.cl	2026-07-15 18:03:46
2025-05-20	39161.67	sii.cl	2026-07-15 18:03:46
2025-05-30	39186.92	sii.cl	2026-07-15 18:03:46
2026-07-01	40823.03	sii.cl	2026-07-15 18:03:46
2026-07-02	40825.75	sii.cl	2026-07-15 18:03:46
2026-07-03	40828.47	sii.cl	2026-07-15 18:03:46
2026-07-04	40831.19	sii.cl	2026-07-15 18:03:46
2026-07-05	40833.91	sii.cl	2026-07-15 18:03:46
2026-07-06	40836.63	sii.cl	2026-07-15 18:03:46
2026-07-07	40839.35	sii.cl	2026-07-15 18:03:46
2026-07-08	40842.07	sii.cl	2026-07-15 18:03:46
2026-07-09	40844.79	sii.cl	2026-07-15 18:03:46
2026-06-11	40768.69	sii.cl	2026-07-15 18:03:46
2026-06-21	40795.85	sii.cl	2026-07-15 18:03:46
2026-06-12	40771.41	sii.cl	2026-07-15 18:03:46
2026-06-22	40798.57	sii.cl	2026-07-15 18:03:46
2026-06-13	40774.12	sii.cl	2026-07-15 18:03:46
2026-06-23	40801.29	sii.cl	2026-07-15 18:03:46
2026-06-14	40776.84	sii.cl	2026-07-15 18:03:46
2026-06-24	40804	sii.cl	2026-07-15 18:03:46
2026-06-15	40779.55	sii.cl	2026-07-15 18:03:46
2026-06-25	40806.72	sii.cl	2026-07-15 18:03:46
2026-06-16	40782.27	sii.cl	2026-07-15 18:03:46
2026-06-26	40809.44	sii.cl	2026-07-15 18:03:46
2026-06-17	40784.98	sii.cl	2026-07-15 18:03:46
2026-06-27	40812.16	sii.cl	2026-07-15 18:03:46
2026-06-18	40787.7	sii.cl	2026-07-15 18:03:46
2026-06-28	40814.87	sii.cl	2026-07-15 18:03:46
2026-06-19	40790.42	sii.cl	2026-07-15 18:03:46
2026-06-29	40817.59	sii.cl	2026-07-15 18:03:46
2025-07-11	39280.45	sii.cl	2026-07-15 18:03:46
2025-07-12	39275.37	sii.cl	2026-07-15 18:03:46
2025-07-13	39270.3	sii.cl	2026-07-15 18:03:46
2025-07-14	39265.22	sii.cl	2026-07-15 18:03:46
2025-07-19	39239.84	sii.cl	2026-07-15 18:03:46
2025-07-29	39189.14	sii.cl	2026-07-15 18:03:46
2025-07-10	39285.53	sii.cl	2026-07-15 18:03:46
2025-07-20	39234.77	sii.cl	2026-07-15 18:03:46
2025-07-30	39184.08	sii.cl	2026-07-15 18:03:46
2025-07-31	39179.01	sii.cl	2026-07-15 18:03:46
2025-06-01	39191.97	sii.cl	2026-07-15 18:03:46
2025-06-11	39217.41	sii.cl	2026-07-15 18:03:46
2025-06-21	39243.54	sii.cl	2026-07-15 18:03:46
2025-06-02	39194.5	sii.cl	2026-07-15 18:03:46
2025-06-12	39220.03	sii.cl	2026-07-15 18:03:46
2025-06-22	39246.15	sii.cl	2026-07-15 18:03:46
2025-06-03	39197.03	sii.cl	2026-07-15 18:03:46
2025-06-13	39222.64	sii.cl	2026-07-15 18:03:46
2025-06-23	39248.77	sii.cl	2026-07-15 18:03:46
2025-06-04	39199.55	sii.cl	2026-07-15 18:03:46
2025-06-14	39225.25	sii.cl	2026-07-15 18:03:46
2025-06-24	39251.38	sii.cl	2026-07-15 18:03:46
2025-06-05	39202.08	sii.cl	2026-07-15 18:03:46
2025-06-15	39227.86	sii.cl	2026-07-15 18:03:46
2025-06-25	39254	sii.cl	2026-07-15 18:03:46
2025-06-06	39204.61	sii.cl	2026-07-15 18:03:46
2025-06-16	39230.48	sii.cl	2026-07-15 18:03:46
2025-06-26	39256.61	sii.cl	2026-07-15 18:03:46
2025-06-07	39207.13	sii.cl	2026-07-15 18:03:46
2025-06-17	39233.09	sii.cl	2026-07-15 18:03:46
2025-06-27	39259.23	sii.cl	2026-07-15 18:03:46
2025-06-08	39209.66	sii.cl	2026-07-15 18:03:46
2025-06-18	39235.7	sii.cl	2026-07-15 18:03:46
2025-06-28	39261.84	sii.cl	2026-07-15 18:03:46
2025-06-09	39212.19	sii.cl	2026-07-15 18:03:46
2025-06-19	39238.31	sii.cl	2026-07-15 18:03:46
2025-06-29	39264.46	sii.cl	2026-07-15 18:03:46
2025-06-10	39214.8	sii.cl	2026-07-15 18:03:46
2025-06-20	39240.93	sii.cl	2026-07-15 18:03:46
2025-06-30	39267.07	sii.cl	2026-07-15 18:03:46
2025-05-31	39189.45	sii.cl	2026-07-15 18:03:46
2025-04-01	38899.12	sii.cl	2026-07-15 18:03:46
2026-06-01	40627.62	sii.cl	2026-07-15 18:03:46
2026-06-02	40644.55	sii.cl	2026-07-15 18:03:46
2026-06-03	40661.48	sii.cl	2026-07-15 18:03:46
2026-06-04	40678.43	sii.cl	2026-07-15 18:03:46
2026-06-05	40695.38	sii.cl	2026-07-15 18:03:46
2026-06-06	40712.34	sii.cl	2026-07-15 18:03:46
2026-06-07	40729.31	sii.cl	2026-07-15 18:03:46
2026-06-08	40746.28	sii.cl	2026-07-15 18:03:46
2026-06-09	40763.26	sii.cl	2026-07-15 18:03:46
2026-05-01	40133.5	sii.cl	2026-07-15 18:03:46
2026-05-11	40273.69	sii.cl	2026-07-15 18:03:46
2026-05-21	40441.84	sii.cl	2026-07-15 18:03:46
2026-05-02	40146.82	sii.cl	2026-07-15 18:03:46
2026-05-12	40290.47	sii.cl	2026-07-15 18:03:46
2026-05-22	40458.69	sii.cl	2026-07-15 18:03:46
2026-05-03	40160.14	sii.cl	2026-07-15 18:03:46
2026-05-13	40307.26	sii.cl	2026-07-15 18:03:46
2026-05-23	40475.55	sii.cl	2026-07-15 18:03:46
2026-05-04	40173.46	sii.cl	2026-07-15 18:03:46
2026-05-14	40324.06	sii.cl	2026-07-15 18:03:46
2026-05-24	40492.42	sii.cl	2026-07-15 18:03:46
2026-05-05	40186.79	sii.cl	2026-07-15 18:03:46
2026-05-15	40340.86	sii.cl	2026-07-15 18:03:46
2025-12-01	39643.59	sii.cl	2026-07-15 18:03:46
2025-12-11	39651.25	sii.cl	2026-07-15 18:03:46
2025-12-21	39689.59	sii.cl	2026-07-15 18:03:46
2025-12-02	39643.59	sii.cl	2026-07-15 18:03:46
2025-12-12	39655.08	sii.cl	2026-07-15 18:03:46
2025-12-22	39693.42	sii.cl	2026-07-15 18:03:46
2025-12-03	39643.59	sii.cl	2026-07-15 18:03:46
2025-12-13	39658.92	sii.cl	2026-07-15 18:03:46
2025-12-23	39697.26	sii.cl	2026-07-15 18:03:46
2025-12-04	39643.59	sii.cl	2026-07-15 18:03:46
2025-12-14	39662.75	sii.cl	2026-07-15 18:03:46
2025-12-24	39701.09	sii.cl	2026-07-15 18:03:46
2025-12-05	39643.59	sii.cl	2026-07-15 18:03:46
2025-12-15	39666.58	sii.cl	2026-07-15 18:03:46
2025-12-25	39704.93	sii.cl	2026-07-15 18:03:46
2025-12-06	39643.59	sii.cl	2026-07-15 18:03:46
2025-12-16	39670.41	sii.cl	2026-07-15 18:03:46
2025-12-26	39708.77	sii.cl	2026-07-15 18:03:46
2025-12-07	39643.59	sii.cl	2026-07-15 18:03:46
2025-12-17	39674.25	sii.cl	2026-07-15 18:03:46
2025-12-27	39712.6	sii.cl	2026-07-15 18:03:46
2025-12-08	39643.59	sii.cl	2026-07-15 18:03:46
2025-12-18	39678.08	sii.cl	2026-07-15 18:03:46
2025-12-28	39716.44	sii.cl	2026-07-15 18:03:46
2025-12-09	39643.59	sii.cl	2026-07-15 18:03:46
2025-12-19	39681.92	sii.cl	2026-07-15 18:03:46
2025-12-29	39720.28	sii.cl	2026-07-15 18:03:46
2025-12-10	39647.42	sii.cl	2026-07-15 18:03:46
2025-12-20	39685.75	sii.cl	2026-07-15 18:03:46
2025-12-30	39724.12	sii.cl	2026-07-15 18:03:46
2025-12-31	39727.96	sii.cl	2026-07-15 18:03:46
2025-11-01	39602.77	sii.cl	2026-07-15 18:03:46
2025-11-11	39643.59	sii.cl	2026-07-15 18:03:46
2025-11-21	39643.59	sii.cl	2026-07-15 18:03:46
2025-11-02	39607.87	sii.cl	2026-07-15 18:03:46
2025-11-12	39643.59	sii.cl	2026-07-15 18:03:46
2025-11-22	39643.59	sii.cl	2026-07-15 18:03:46
2025-11-03	39612.97	sii.cl	2026-07-15 18:03:46
2025-11-13	39643.59	sii.cl	2026-07-15 18:03:46
2025-11-23	39643.59	sii.cl	2026-07-15 18:03:46
2025-11-04	39618.08	sii.cl	2026-07-15 18:03:46
2025-11-14	39643.59	sii.cl	2026-07-15 18:03:46
2025-11-24	39643.59	sii.cl	2026-07-15 18:03:46
2025-11-05	39623.18	sii.cl	2026-07-15 18:03:46
2025-11-15	39643.59	sii.cl	2026-07-15 18:03:46
2026-05-10	40256.91	sii.cl	2026-07-15 18:03:46
2026-05-20	40424.99	sii.cl	2026-07-15 18:03:46
2026-05-30	40593.77	sii.cl	2026-07-15 18:03:46
2026-05-31	40610.69	sii.cl	2026-07-15 18:03:46
2026-04-01	39841.72	sii.cl	2026-07-15 18:03:46
2026-04-11	39868.16	sii.cl	2026-07-15 18:03:46
2026-04-21	40000.61	sii.cl	2026-07-15 18:03:46
2026-04-02	39841.72	sii.cl	2026-07-15 18:03:46
2025-11-25	39643.59	sii.cl	2026-07-15 18:03:46
2025-11-06	39628.28	sii.cl	2026-07-15 18:03:46
2025-11-16	39643.59	sii.cl	2026-07-15 18:03:46
2025-11-26	39643.59	sii.cl	2026-07-15 18:03:46
2025-11-07	39633.38	sii.cl	2026-07-15 18:03:46
2025-11-17	39643.59	sii.cl	2026-07-15 18:03:46
2025-11-27	39643.59	sii.cl	2026-07-15 18:03:46
2025-11-08	39638.49	sii.cl	2026-07-15 18:03:46
2025-11-18	39643.59	sii.cl	2026-07-15 18:03:46
2025-11-28	39643.59	sii.cl	2026-07-15 18:03:46
2025-11-09	39643.59	sii.cl	2026-07-15 18:03:46
2025-11-19	39643.59	sii.cl	2026-07-15 18:03:46
2025-11-29	39643.59	sii.cl	2026-07-15 18:03:46
2025-11-10	39643.59	sii.cl	2026-07-15 18:03:46
2025-11-20	39643.59	sii.cl	2026-07-15 18:03:46
2025-11-30	39643.59	sii.cl	2026-07-15 18:03:46
2025-10-01	39485.65	sii.cl	2026-07-15 18:03:46
2025-10-11	39495.82	sii.cl	2026-07-15 18:03:46
2025-10-21	39546.71	sii.cl	2026-07-15 18:03:46
2025-10-02	39485.65	sii.cl	2026-07-15 18:03:46
2025-10-12	39500.91	sii.cl	2026-07-15 18:03:46
2025-10-22	39551.81	sii.cl	2026-07-15 18:03:46
2025-10-03	39485.65	sii.cl	2026-07-15 18:03:46
2025-10-13	39505.99	sii.cl	2026-07-15 18:03:46
2025-10-23	39556.9	sii.cl	2026-07-15 18:03:46
2025-10-04	39485.65	sii.cl	2026-07-15 18:03:46
2025-10-14	39511.08	sii.cl	2026-07-15 18:03:46
2025-10-24	39562	sii.cl	2026-07-15 18:03:46
2025-10-05	39485.65	sii.cl	2026-07-15 18:03:46
2025-10-15	39516.17	sii.cl	2026-07-15 18:03:46
2025-10-25	39567.09	sii.cl	2026-07-15 18:03:46
2025-10-06	39485.65	sii.cl	2026-07-15 18:03:46
2025-10-16	39521.26	sii.cl	2026-07-15 18:03:46
2025-10-26	39572.19	sii.cl	2026-07-15 18:03:46
2025-10-07	39485.65	sii.cl	2026-07-15 18:03:46
2025-10-17	39526.35	sii.cl	2026-07-15 18:03:46
2025-10-27	39577.28	sii.cl	2026-07-15 18:03:46
2025-10-08	39485.65	sii.cl	2026-07-15 18:03:46
2025-10-18	39531.44	sii.cl	2026-07-15 18:03:46
2025-10-28	39582.38	sii.cl	2026-07-15 18:03:46
2025-10-09	39485.65	sii.cl	2026-07-15 18:03:46
2025-10-19	39536.53	sii.cl	2026-07-15 18:03:46
2025-10-29	39587.48	sii.cl	2026-07-15 18:03:46
2025-10-10	39490.74	sii.cl	2026-07-15 18:03:46
2025-10-20	39541.62	sii.cl	2026-07-15 18:03:46
2025-10-30	39592.57	sii.cl	2026-07-15 18:03:46
2025-10-31	39597.67	sii.cl	2026-07-15 18:03:46
2025-09-01	39394.46	sii.cl	2026-07-15 18:03:46
2025-09-11	39485.65	sii.cl	2026-07-15 18:03:46
2025-09-21	39485.65	sii.cl	2026-07-15 18:03:46
2025-09-02	39405.85	sii.cl	2026-07-15 18:03:46
2025-09-12	39485.65	sii.cl	2026-07-15 18:03:46
2025-09-22	39485.65	sii.cl	2026-07-15 18:03:46
2026-06-10	40765.97	sii.cl	2026-07-15 18:03:46
2026-06-20	40793.13	sii.cl	2026-07-15 18:03:46
2025-09-03	39417.24	sii.cl	2026-07-15 18:03:46
2025-09-13	39485.65	sii.cl	2026-07-15 18:03:46
2025-09-23	39485.65	sii.cl	2026-07-15 18:03:46
2025-09-04	39428.63	sii.cl	2026-07-15 18:03:46
2025-09-14	39485.65	sii.cl	2026-07-15 18:03:46
2025-09-24	39485.65	sii.cl	2026-07-15 18:03:46
2025-09-05	39440.03	sii.cl	2026-07-15 18:03:46
2025-09-15	39485.65	sii.cl	2026-07-15 18:03:46
2025-09-25	39485.65	sii.cl	2026-07-15 18:03:46
2025-09-06	39451.43	sii.cl	2026-07-15 18:03:46
2025-09-16	39485.65	sii.cl	2026-07-15 18:03:46
2025-09-26	39485.65	sii.cl	2026-07-15 18:03:46
2025-09-07	39462.83	sii.cl	2026-07-15 18:03:46
2025-09-17	39485.65	sii.cl	2026-07-15 18:03:46
2025-09-27	39485.65	sii.cl	2026-07-15 18:03:46
2025-09-08	39474.24	sii.cl	2026-07-15 18:03:46
2025-09-18	39485.65	sii.cl	2026-07-15 18:03:46
2025-09-28	39485.65	sii.cl	2026-07-15 18:03:46
2025-09-09	39485.65	sii.cl	2026-07-15 18:03:46
2025-09-19	39485.65	sii.cl	2026-07-15 18:03:46
2025-09-29	39485.65	sii.cl	2026-07-15 18:03:46
2025-09-10	39485.65	sii.cl	2026-07-15 18:03:46
2025-09-20	39485.65	sii.cl	2026-07-15 18:03:46
2025-09-30	39485.65	sii.cl	2026-07-15 18:03:46
2025-08-01	39173.95	sii.cl	2026-07-15 18:03:46
2025-08-11	39156.08	sii.cl	2026-07-15 18:03:46
2025-08-21	39269.41	sii.cl	2026-07-15 18:03:46
2025-08-02	39168.88	sii.cl	2026-07-15 18:03:46
2025-08-12	39167.4	sii.cl	2026-07-15 18:03:46
2025-08-22	39280.76	sii.cl	2026-07-15 18:03:46
2025-08-03	39163.82	sii.cl	2026-07-15 18:03:46
2025-08-13	39178.72	sii.cl	2026-07-15 18:03:46
2025-08-23	39292.12	sii.cl	2026-07-15 18:03:46
2025-08-04	39158.75	sii.cl	2026-07-15 18:03:46
2025-08-14	39190.04	sii.cl	2026-07-15 18:03:46
2025-08-24	39303.48	sii.cl	2026-07-15 18:03:46
2025-08-05	39153.69	sii.cl	2026-07-15 18:03:46
2025-08-15	39201.37	sii.cl	2026-07-15 18:03:46
2025-08-25	39314.84	sii.cl	2026-07-15 18:03:46
2025-08-06	39148.63	sii.cl	2026-07-15 18:03:46
2025-08-16	39212.7	sii.cl	2026-07-15 18:03:46
2025-08-26	39326.2	sii.cl	2026-07-15 18:03:46
2025-08-07	39143.57	sii.cl	2026-07-15 18:03:46
2025-08-17	39224.04	sii.cl	2026-07-15 18:03:46
2025-08-27	39337.57	sii.cl	2026-07-15 18:03:46
2025-08-08	39138.51	sii.cl	2026-07-15 18:03:46
2025-08-18	39235.38	sii.cl	2026-07-15 18:03:46
2025-08-28	39348.94	sii.cl	2026-07-15 18:03:46
2025-08-09	39133.45	sii.cl	2026-07-15 18:03:46
2025-08-19	39246.72	sii.cl	2026-07-15 18:03:46
2025-08-29	39360.32	sii.cl	2026-07-15 18:03:46
2025-08-10	39144.76	sii.cl	2026-07-15 18:03:46
2025-08-20	39258.06	sii.cl	2026-07-15 18:03:46
2025-08-30	39371.69	sii.cl	2026-07-15 18:03:46
2025-08-31	39383.07	sii.cl	2026-07-15 18:03:46
2025-07-01	39269.69	sii.cl	2026-07-15 18:03:46
2025-07-21	39229.7	sii.cl	2026-07-15 18:03:46
2025-07-02	39272.3	sii.cl	2026-07-15 18:03:46
2025-07-22	39224.63	sii.cl	2026-07-15 18:03:46
2025-07-03	39274.92	sii.cl	2026-07-15 18:03:46
2025-07-23	39219.56	sii.cl	2026-07-15 18:03:46
2025-07-04	39277.53	sii.cl	2026-07-15 18:03:46
2025-07-24	39214.48	sii.cl	2026-07-15 18:03:46
2025-07-05	39280.15	sii.cl	2026-07-15 18:03:46
2025-07-15	39260.14	sii.cl	2026-07-15 18:03:46
2025-07-25	39209.42	sii.cl	2026-07-15 18:03:46
2025-07-06	39282.76	sii.cl	2026-07-15 18:03:46
2025-07-16	39255.07	sii.cl	2026-07-15 18:03:46
2025-07-26	39204.35	sii.cl	2026-07-15 18:03:46
2025-07-07	39285.38	sii.cl	2026-07-15 18:03:46
2025-07-17	39249.99	sii.cl	2026-07-15 18:03:46
2025-07-27	39199.28	sii.cl	2026-07-15 18:03:46
2025-07-08	39288	sii.cl	2026-07-15 18:03:46
2025-07-18	39244.92	sii.cl	2026-07-15 18:03:46
2025-07-28	39194.21	sii.cl	2026-07-15 18:03:46
2025-07-09	39290.61	sii.cl	2026-07-15 18:03:46
2026-02-01	39703.5	sii.cl	2026-07-15 18:03:46
2026-02-11	39694.31	sii.cl	2026-07-15 18:03:46
2026-02-21	39750.94	sii.cl	2026-07-15 18:03:46
2026-01-14	39749.68	sii.cl	2026-07-15 18:03:46
2026-01-24	39724.02	sii.cl	2026-07-15 18:03:46
2025-04-11	38952.17	sii.cl	2026-07-15 18:03:46
2025-04-21	39016.98	sii.cl	2026-07-15 18:03:46
2025-04-02	38904.13	sii.cl	2026-07-15 18:03:46
2025-04-12	38958.65	sii.cl	2026-07-15 18:03:46
2025-04-22	39023.47	sii.cl	2026-07-15 18:03:46
2025-04-03	38909.14	sii.cl	2026-07-15 18:03:46
2025-04-13	38965.12	sii.cl	2026-07-15 18:03:46
2025-04-23	39029.96	sii.cl	2026-07-15 18:03:46
2025-04-04	38914.15	sii.cl	2026-07-15 18:03:46
2025-04-14	38971.6	sii.cl	2026-07-15 18:03:46
2025-04-24	39036.45	sii.cl	2026-07-15 18:03:46
2025-04-05	38919.16	sii.cl	2026-07-15 18:03:46
2025-04-15	38978.08	sii.cl	2026-07-15 18:03:46
2025-04-25	39042.94	sii.cl	2026-07-15 18:03:46
2025-04-06	38924.18	sii.cl	2026-07-15 18:03:46
2025-04-16	38984.56	sii.cl	2026-07-15 18:03:46
2025-04-26	39049.43	sii.cl	2026-07-15 18:03:46
2025-04-07	38929.19	sii.cl	2026-07-15 18:03:46
2025-04-17	38991.04	sii.cl	2026-07-15 18:03:46
2025-04-27	39055.92	sii.cl	2026-07-15 18:03:46
2025-04-08	38934.2	sii.cl	2026-07-15 18:03:46
2025-04-18	38997.53	sii.cl	2026-07-15 18:03:46
2025-04-28	39062.41	sii.cl	2026-07-15 18:03:46
2025-04-09	38939.22	sii.cl	2026-07-15 18:03:46
2025-04-19	39004.01	sii.cl	2026-07-15 18:03:46
2025-04-29	39068.91	sii.cl	2026-07-15 18:03:46
2025-04-10	38945.69	sii.cl	2026-07-15 18:03:46
2025-04-20	39010.5	sii.cl	2026-07-15 18:03:46
2025-04-30	39075.41	sii.cl	2026-07-15 18:03:46
2025-03-01	38663.05	sii.cl	2026-07-15 18:03:46
2025-03-11	38794.07	sii.cl	2026-07-15 18:03:46
2025-03-21	38844.06	sii.cl	2026-07-15 18:03:46
2025-03-02	38678.15	sii.cl	2026-07-15 18:03:46
2025-03-12	38799.07	sii.cl	2026-07-15 18:03:46
2025-03-22	38849.06	sii.cl	2026-07-15 18:03:46
2025-03-03	38693.27	sii.cl	2026-07-15 18:03:46
2025-03-13	38804.06	sii.cl	2026-07-15 18:03:46
2025-03-23	38854.06	sii.cl	2026-07-15 18:03:46
2025-03-04	38708.39	sii.cl	2026-07-15 18:03:46
2025-03-14	38809.06	sii.cl	2026-07-15 18:03:46
2025-03-24	38859.07	sii.cl	2026-07-15 18:03:46
2025-03-05	38723.52	sii.cl	2026-07-15 18:03:46
2025-03-15	38814.06	sii.cl	2026-07-15 18:03:46
2025-03-25	38864.07	sii.cl	2026-07-15 18:03:46
2025-03-06	38738.65	sii.cl	2026-07-15 18:03:46
2025-03-16	38819.06	sii.cl	2026-07-15 18:03:46
2025-03-26	38869.08	sii.cl	2026-07-15 18:03:46
2025-03-07	38753.79	sii.cl	2026-07-15 18:03:46
2025-03-17	38824.06	sii.cl	2026-07-15 18:03:46
2025-03-27	38874.08	sii.cl	2026-07-15 18:03:46
2025-03-08	38768.93	sii.cl	2026-07-15 18:03:46
2025-03-18	38829.06	sii.cl	2026-07-15 18:03:46
2025-03-28	38879.09	sii.cl	2026-07-15 18:03:46
2025-03-09	38784.08	sii.cl	2026-07-15 18:03:46
2025-03-19	38834.06	sii.cl	2026-07-15 18:03:46
2025-03-29	38884.1	sii.cl	2026-07-15 18:03:46
2025-03-10	38789.07	sii.cl	2026-07-15 18:03:46
2025-03-20	38839.06	sii.cl	2026-07-15 18:03:46
2025-03-30	38889.1	sii.cl	2026-07-15 18:03:46
2025-03-31	38894.11	sii.cl	2026-07-15 18:03:46
2025-02-01	38381.93	sii.cl	2026-07-15 18:03:46
2025-02-11	38392.09	sii.cl	2026-07-15 18:03:46
2025-02-21	38542.38	sii.cl	2026-07-15 18:03:46
2025-02-02	38379.45	sii.cl	2026-07-15 18:03:46
2025-02-12	38407.09	sii.cl	2026-07-15 18:03:46
2025-02-22	38557.45	sii.cl	2026-07-15 18:03:46
2025-02-03	38376.97	sii.cl	2026-07-15 18:03:46
2025-02-13	38422.1	sii.cl	2026-07-15 18:03:46
2025-02-23	38572.51	sii.cl	2026-07-15 18:03:46
2025-02-04	38374.49	sii.cl	2026-07-15 18:03:46
2025-02-14	38437.12	sii.cl	2026-07-15 18:03:46
2025-02-24	38587.59	sii.cl	2026-07-15 18:03:46
2025-02-05	38372.01	sii.cl	2026-07-15 18:03:46
2025-02-15	38452.14	sii.cl	2026-07-15 18:03:46
2025-02-25	38602.67	sii.cl	2026-07-15 18:03:46
2025-02-06	38369.54	sii.cl	2026-07-15 18:03:46
2025-02-16	38467.16	sii.cl	2026-07-15 18:03:46
2025-02-26	38617.75	sii.cl	2026-07-15 18:03:46
2025-02-07	38367.06	sii.cl	2026-07-15 18:03:46
2025-02-17	38482.2	sii.cl	2026-07-15 18:03:46
2025-02-27	38632.84	sii.cl	2026-07-15 18:03:46
2025-02-08	38364.58	sii.cl	2026-07-15 18:03:46
2025-02-18	38497.23	sii.cl	2026-07-15 18:03:46
2025-02-28	38647.94	sii.cl	2026-07-15 18:03:46
2025-02-09	38362.1	sii.cl	2026-07-15 18:03:46
2025-02-19	38512.28	sii.cl	2026-07-15 18:03:46
2025-02-10	38377.09	sii.cl	2026-07-15 18:03:46
2025-02-20	38527.33	sii.cl	2026-07-15 18:03:46
2025-01-01	38419.17	sii.cl	2026-07-15 18:03:46
2025-01-11	38434.02	sii.cl	2026-07-15 18:03:46
2025-01-21	38409.2	sii.cl	2026-07-15 18:03:46
2025-01-02	38421.65	sii.cl	2026-07-15 18:03:46
2025-01-12	38431.53	sii.cl	2026-07-15 18:03:46
2025-01-22	38406.72	sii.cl	2026-07-15 18:03:46
2025-01-03	38424.12	sii.cl	2026-07-15 18:03:46
2025-01-13	38429.05	sii.cl	2026-07-15 18:03:46
2025-01-23	38404.24	sii.cl	2026-07-15 18:03:46
2025-01-04	38426.6	sii.cl	2026-07-15 18:03:46
2025-01-14	38426.57	sii.cl	2026-07-15 18:03:46
2025-01-24	38401.76	sii.cl	2026-07-15 18:03:46
2025-01-05	38429.08	sii.cl	2026-07-15 18:03:46
2025-01-15	38424.09	sii.cl	2026-07-15 18:03:46
2025-01-25	38399.28	sii.cl	2026-07-15 18:03:46
2025-01-06	38431.55	sii.cl	2026-07-15 18:03:46
2025-01-16	38421.61	sii.cl	2026-07-15 18:03:46
2025-01-26	38396.8	sii.cl	2026-07-15 18:03:46
2025-01-07	38434.03	sii.cl	2026-07-15 18:03:46
2025-01-17	38419.13	sii.cl	2026-07-15 18:03:46
2025-01-27	38394.32	sii.cl	2026-07-15 18:03:46
2025-01-08	38436.51	sii.cl	2026-07-15 18:03:46
2025-01-18	38416.64	sii.cl	2026-07-15 18:03:46
2025-01-28	38391.84	sii.cl	2026-07-15 18:03:46
2025-01-09	38438.98	sii.cl	2026-07-15 18:03:46
2025-01-19	38414.16	sii.cl	2026-07-15 18:03:46
2025-01-29	38389.36	sii.cl	2026-07-15 18:03:46
2025-01-10	38436.5	sii.cl	2026-07-15 18:03:46
2025-01-20	38411.68	sii.cl	2026-07-15 18:03:46
2025-01-30	38386.88	sii.cl	2026-07-15 18:03:46
2025-01-31	38384.41	sii.cl	2026-07-15 18:03:46
2026-08-01	40844.79	sii.cl	2026-07-15 18:03:46
2026-08-02	40844.79	sii.cl	2026-07-15 18:03:46
2026-08-03	40844.79	sii.cl	2026-07-15 18:03:46
2026-08-04	40844.79	sii.cl	2026-07-15 18:03:46
2026-08-05	40844.79	sii.cl	2026-07-15 18:03:46
2026-08-06	40844.79	sii.cl	2026-07-15 18:03:46
2026-08-07	40844.79	sii.cl	2026-07-15 18:03:46
2026-08-08	40844.79	sii.cl	2026-07-15 18:03:46
2026-08-09	40844.79	sii.cl	2026-07-15 18:03:46
2026-07-11	40844.79	sii.cl	2026-07-15 18:03:46
2026-07-21	40844.79	sii.cl	2026-07-15 18:03:46
2026-07-12	40844.79	sii.cl	2026-07-15 18:03:46
2026-07-22	40844.79	sii.cl	2026-07-15 18:03:46
2026-07-13	40844.79	sii.cl	2026-07-15 18:03:46
2026-07-23	40844.79	sii.cl	2026-07-15 18:03:46
2026-07-14	40844.79	sii.cl	2026-07-15 18:03:46
2026-07-24	40844.79	sii.cl	2026-07-15 18:03:46
2026-07-15	40844.79	sii.cl	2026-07-15 18:03:46
2026-07-25	40844.79	sii.cl	2026-07-15 18:03:46
2026-07-16	40844.79	sii.cl	2026-07-15 18:03:46
2026-07-26	40844.79	sii.cl	2026-07-15 18:03:46
2026-07-17	40844.79	sii.cl	2026-07-15 18:03:46
2026-07-27	40844.79	sii.cl	2026-07-15 18:03:46
2026-07-18	40844.79	sii.cl	2026-07-15 18:03:46
2026-07-28	40844.79	sii.cl	2026-07-15 18:03:46
2026-07-19	40844.79	sii.cl	2026-07-15 18:03:46
2026-07-29	40844.79	sii.cl	2026-07-15 18:03:46
2026-07-10	40844.79	sii.cl	2026-07-15 18:03:46
2026-07-20	40844.79	sii.cl	2026-07-15 18:03:46
2026-07-30	40844.79	sii.cl	2026-07-15 18:03:46
2026-07-31	40844.79	sii.cl	2026-07-15 18:03:46
2026-06-30	40820.31	sii.cl	2026-07-15 18:03:46
2026-05-25	40509.29	sii.cl	2026-07-15 18:03:46
2026-05-06	40200.12	sii.cl	2026-07-15 18:03:46
2026-05-16	40357.67	sii.cl	2026-07-15 18:03:46
2026-05-26	40526.18	sii.cl	2026-07-15 18:03:46
2026-05-07	40213.45	sii.cl	2026-07-15 18:03:46
2026-05-17	40374.49	sii.cl	2026-07-15 18:03:46
2026-05-27	40543.07	sii.cl	2026-07-15 18:03:46
2026-05-08	40226.79	sii.cl	2026-07-15 18:03:46
2026-05-18	40391.32	sii.cl	2026-07-15 18:03:46
2026-05-28	40559.96	sii.cl	2026-07-15 18:03:46
2026-05-09	40240.14	sii.cl	2026-07-15 18:03:46
2026-05-19	40408.15	sii.cl	2026-07-15 18:03:46
2026-05-29	40576.86	sii.cl	2026-07-15 18:03:46
2026-04-12	39881.38	sii.cl	2026-07-15 18:03:46
2026-04-22	40013.88	sii.cl	2026-07-15 18:03:46
2026-04-03	39841.72	sii.cl	2026-07-15 18:03:46
2026-04-13	39894.61	sii.cl	2026-07-15 18:03:46
2026-04-23	40027.15	sii.cl	2026-07-15 18:03:46
2026-04-04	39841.72	sii.cl	2026-07-15 18:03:46
2026-04-14	39907.85	sii.cl	2026-07-15 18:03:46
2026-04-24	40040.43	sii.cl	2026-07-15 18:03:46
2026-04-05	39841.72	sii.cl	2026-07-15 18:03:46
2026-04-15	39921.09	sii.cl	2026-07-15 18:03:46
2026-04-25	40053.72	sii.cl	2026-07-15 18:03:46
2026-04-06	39841.72	sii.cl	2026-07-15 18:03:46
2026-04-16	39934.33	sii.cl	2026-07-15 18:03:46
2026-04-26	40067	sii.cl	2026-07-15 18:03:46
2026-04-07	39841.72	sii.cl	2026-07-15 18:03:46
2026-04-17	39947.58	sii.cl	2026-07-15 18:03:46
2026-04-27	40080.29	sii.cl	2026-07-15 18:03:46
2026-04-08	39841.72	sii.cl	2026-07-15 18:03:46
2026-04-18	39960.83	sii.cl	2026-07-15 18:03:46
2026-04-28	40093.59	sii.cl	2026-07-15 18:03:46
2026-04-09	39841.72	sii.cl	2026-07-15 18:03:46
2026-04-19	39974.09	sii.cl	2026-07-15 18:03:46
2026-04-29	40106.89	sii.cl	2026-07-15 18:03:46
2026-04-10	39854.94	sii.cl	2026-07-15 18:03:46
2026-04-20	39987.35	sii.cl	2026-07-15 18:03:46
2026-04-30	40120.2	sii.cl	2026-07-15 18:03:46
2026-03-01	39796.31	sii.cl	2026-07-15 18:03:46
2026-03-11	39841.72	sii.cl	2026-07-15 18:03:46
2026-03-21	39841.72	sii.cl	2026-07-15 18:03:46
2026-03-02	39801.98	sii.cl	2026-07-15 18:03:46
2026-03-12	39841.72	sii.cl	2026-07-15 18:03:46
2026-03-22	39841.72	sii.cl	2026-07-15 18:03:46
2026-03-03	39807.65	sii.cl	2026-07-15 18:03:46
2026-03-13	39841.72	sii.cl	2026-07-15 18:03:46
2026-03-23	39841.72	sii.cl	2026-07-15 18:03:46
2026-03-04	39813.33	sii.cl	2026-07-15 18:03:46
2026-03-14	39841.72	sii.cl	2026-07-15 18:03:46
2026-03-24	39841.72	sii.cl	2026-07-15 18:03:46
2026-03-05	39819.01	sii.cl	2026-07-15 18:03:46
2026-03-15	39841.72	sii.cl	2026-07-15 18:03:46
2026-03-25	39841.72	sii.cl	2026-07-15 18:03:46
2026-03-06	39824.68	sii.cl	2026-07-15 18:03:46
2026-03-16	39841.72	sii.cl	2026-07-15 18:03:46
2026-03-26	39841.72	sii.cl	2026-07-15 18:03:46
2026-03-07	39830.36	sii.cl	2026-07-15 18:03:46
2026-03-17	39841.72	sii.cl	2026-07-15 18:03:46
2026-03-27	39841.72	sii.cl	2026-07-15 18:03:46
2026-03-08	39836.04	sii.cl	2026-07-15 18:03:46
2026-03-18	39841.72	sii.cl	2026-07-15 18:03:46
2026-03-28	39841.72	sii.cl	2026-07-15 18:03:46
2026-03-09	39841.72	sii.cl	2026-07-15 18:03:46
2026-03-19	39841.72	sii.cl	2026-07-15 18:03:46
2026-03-29	39841.72	sii.cl	2026-07-15 18:03:46
2026-03-10	39841.72	sii.cl	2026-07-15 18:03:46
2026-03-20	39841.72	sii.cl	2026-07-15 18:03:46
2026-03-30	39841.72	sii.cl	2026-07-15 18:03:46
2026-03-31	39841.72	sii.cl	2026-07-15 18:03:46
2026-02-02	39700.94	sii.cl	2026-07-15 18:03:46
2026-02-12	39699.97	sii.cl	2026-07-15 18:03:46
2026-02-22	39756.61	sii.cl	2026-07-15 18:03:46
2026-02-03	39698.37	sii.cl	2026-07-15 18:03:46
2026-02-13	39705.63	sii.cl	2026-07-15 18:03:46
2026-02-23	39762.28	sii.cl	2026-07-15 18:03:46
2026-02-04	39695.81	sii.cl	2026-07-15 18:03:46
2026-02-14	39711.29	sii.cl	2026-07-15 18:03:46
2026-02-24	39767.95	sii.cl	2026-07-15 18:03:46
2026-02-05	39693.25	sii.cl	2026-07-15 18:03:46
2026-02-15	39716.95	sii.cl	2026-07-15 18:03:46
2026-02-25	39773.62	sii.cl	2026-07-15 18:03:46
2026-02-06	39690.68	sii.cl	2026-07-15 18:03:46
2026-02-16	39722.61	sii.cl	2026-07-15 18:03:46
2026-02-26	39779.29	sii.cl	2026-07-15 18:03:46
2026-02-07	39688.12	sii.cl	2026-07-15 18:03:46
2026-02-17	39728.28	sii.cl	2026-07-15 18:03:46
2026-02-27	39784.96	sii.cl	2026-07-15 18:03:46
2026-02-08	39685.56	sii.cl	2026-07-15 18:03:46
2026-02-18	39733.94	sii.cl	2026-07-15 18:03:46
2026-02-28	39790.63	sii.cl	2026-07-15 18:03:46
2026-02-09	39682.99	sii.cl	2026-07-15 18:03:46
2026-02-19	39739.61	sii.cl	2026-07-15 18:03:46
2026-02-10	39688.65	sii.cl	2026-07-15 18:03:46
2026-02-20	39745.27	sii.cl	2026-07-15 18:03:46
2026-01-01	39731.79	sii.cl	2026-07-15 18:03:46
2026-01-11	39757.38	sii.cl	2026-07-15 18:03:46
2026-01-21	39731.72	sii.cl	2026-07-15 18:03:46
2026-01-02	39735.63	sii.cl	2026-07-15 18:03:46
2026-01-12	39754.82	sii.cl	2026-07-15 18:03:46
2026-01-22	39729.15	sii.cl	2026-07-15 18:03:46
2026-01-03	39739.47	sii.cl	2026-07-15 18:03:46
2026-01-13	39752.25	sii.cl	2026-07-15 18:03:46
2026-01-23	39726.59	sii.cl	2026-07-15 18:03:46
2026-01-04	39743.31	sii.cl	2026-07-15 18:03:46
2026-01-05	39747.15	sii.cl	2026-07-15 18:03:46
2026-01-15	39747.12	sii.cl	2026-07-15 18:03:46
2026-01-25	39721.45	sii.cl	2026-07-15 18:03:46
2026-01-06	39751	sii.cl	2026-07-15 18:03:46
2026-01-16	39744.55	sii.cl	2026-07-15 18:03:46
2026-01-26	39718.89	sii.cl	2026-07-15 18:03:46
2026-01-07	39754.84	sii.cl	2026-07-15 18:03:46
2026-01-17	39741.98	sii.cl	2026-07-15 18:03:46
2026-01-27	39716.32	sii.cl	2026-07-15 18:03:46
2026-01-08	39758.68	sii.cl	2026-07-15 18:03:46
2026-01-18	39739.42	sii.cl	2026-07-15 18:03:46
2026-01-28	39713.76	sii.cl	2026-07-15 18:03:46
2026-01-09	39762.52	sii.cl	2026-07-15 18:03:46
2026-01-19	39736.85	sii.cl	2026-07-15 18:03:46
2026-01-29	39711.2	sii.cl	2026-07-15 18:03:46
2026-01-10	39759.95	sii.cl	2026-07-15 18:03:46
2026-01-20	39734.28	sii.cl	2026-07-15 18:03:46
2026-01-30	39708.63	sii.cl	2026-07-15 18:03:46
2026-01-31	39706.07	sii.cl	2026-07-15 18:03:46
\.


--
-- Data for Name: version_plantilla; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.version_plantilla (id, descripcion, definicion_layout, ruta, vigente_desde, vigente_hasta, created_at) FROM stdin;
\.


--
-- Name: app_config app_config_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.app_config
    ADD CONSTRAINT app_config_pkey PRIMARY KEY (key);


--
-- Name: app_session app_session_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.app_session
    ADD CONSTRAINT app_session_pkey PRIMARY KEY (token);


--
-- Name: app_user app_user_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.app_user
    ADD CONSTRAINT app_user_email_key UNIQUE (email);


--
-- Name: app_user app_user_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.app_user
    ADD CONSTRAINT app_user_pkey PRIMARY KEY (id);


--
-- Name: asignacion_solicitud asignacion_solicitud_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.asignacion_solicitud
    ADD CONSTRAINT asignacion_solicitud_pkey PRIMARY KEY (id);


--
-- Name: audit_log audit_log_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_log
    ADD CONSTRAINT audit_log_pkey PRIMARY KEY (id);


--
-- Name: bitacora_integracion bitacora_integracion_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bitacora_integracion
    ADD CONSTRAINT bitacora_integracion_pkey PRIMARY KEY (id);


--
-- Name: catalogo_estado_solicitud catalogo_estado_solicitud_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.catalogo_estado_solicitud
    ADD CONSTRAINT catalogo_estado_solicitud_pkey PRIMARY KEY (codigo);


--
-- Name: catalogo_tipo_cp catalogo_tipo_cp_nombre_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.catalogo_tipo_cp
    ADD CONSTRAINT catalogo_tipo_cp_nombre_key UNIQUE (nombre);


--
-- Name: catalogo_tipo_cp catalogo_tipo_cp_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.catalogo_tipo_cp
    ADD CONSTRAINT catalogo_tipo_cp_pkey PRIMARY KEY (codigo);


--
-- Name: catalogo_tipo_impuesto catalogo_tipo_impuesto_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.catalogo_tipo_impuesto
    ADD CONSTRAINT catalogo_tipo_impuesto_pkey PRIMARY KEY (codigo);


--
-- Name: cliente_coordinador cliente_coordinador_cliente_id_coordinador_id_cp_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cliente_coordinador
    ADD CONSTRAINT cliente_coordinador_cliente_id_coordinador_id_cp_id_key UNIQUE (cliente_id, coordinador_id, cp_id);


--
-- Name: cliente_coordinador cliente_coordinador_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cliente_coordinador
    ADD CONSTRAINT cliente_coordinador_pkey PRIMARY KEY (id);


--
-- Name: cliente_facturacion cliente_facturacion_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cliente_facturacion
    ADD CONSTRAINT cliente_facturacion_pkey PRIMARY KEY (id);


--
-- Name: cliente cliente_nombre_corto_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cliente
    ADD CONSTRAINT cliente_nombre_corto_key UNIQUE (nombre_corto);


--
-- Name: cliente cliente_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cliente
    ADD CONSTRAINT cliente_pkey PRIMARY KEY (id);


--
-- Name: cliente_producto cliente_producto_cliente_id_producto_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cliente_producto
    ADD CONSTRAINT cliente_producto_cliente_id_producto_id_key UNIQUE (cliente_id, producto_id);


--
-- Name: cliente_producto cliente_producto_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cliente_producto
    ADD CONSTRAINT cliente_producto_pkey PRIMARY KEY (id);


--
-- Name: coordinador coordinador_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.coordinador
    ADD CONSTRAINT coordinador_pkey PRIMARY KEY (id);


--
-- Name: cp cp_codigo_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cp
    ADD CONSTRAINT cp_codigo_key UNIQUE (codigo);


--
-- Name: cp cp_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cp
    ADD CONSTRAINT cp_pkey PRIMARY KEY (id);


--
-- Name: desarrollador desarrollador_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.desarrollador
    ADD CONSTRAINT desarrollador_pkey PRIMARY KEY (id);


--
-- Name: documento_exportado documento_exportado_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.documento_exportado
    ADD CONSTRAINT documento_exportado_pkey PRIMARY KEY (id);


--
-- Name: empresa_emisora empresa_emisora_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.empresa_emisora
    ADD CONSTRAINT empresa_emisora_pkey PRIMARY KEY (codigo);


--
-- Name: historial_estado historial_estado_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.historial_estado
    ADD CONSTRAINT historial_estado_pkey PRIMARY KEY (id);


--
-- Name: producto producto_codigo_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.producto
    ADD CONSTRAINT producto_codigo_key UNIQUE (codigo);


--
-- Name: producto producto_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.producto
    ADD CONSTRAINT producto_pkey PRIMARY KEY (id);


--
-- Name: proyeccion_auxiliar proyeccion_auxiliar_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.proyeccion_auxiliar
    ADD CONSTRAINT proyeccion_auxiliar_pkey PRIMARY KEY (id);


--
-- Name: proyeccion_configuracion proyeccion_configuracion_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.proyeccion_configuracion
    ADD CONSTRAINT proyeccion_configuracion_pkey PRIMARY KEY (id);


--
-- Name: proyeccion_facturacion proyeccion_facturacion_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.proyeccion_facturacion
    ADD CONSTRAINT proyeccion_facturacion_pkey PRIMARY KEY (id);


--
-- Name: proyeccion_item proyeccion_item_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.proyeccion_item
    ADD CONSTRAINT proyeccion_item_pkey PRIMARY KEY (id);


--
-- Name: proyeccion_mensual proyeccion_mensual_item_id_mes_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.proyeccion_mensual
    ADD CONSTRAINT proyeccion_mensual_item_id_mes_key UNIQUE (item_id, mes);


--
-- Name: proyeccion_mensual proyeccion_mensual_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.proyeccion_mensual
    ADD CONSTRAINT proyeccion_mensual_pkey PRIMARY KEY (id);


--
-- Name: proyeccion proyeccion_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.proyeccion
    ADD CONSTRAINT proyeccion_pkey PRIMARY KEY (id);


--
-- Name: proyeccion_uf proyeccion_uf_anio_mes_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.proyeccion_uf
    ADD CONSTRAINT proyeccion_uf_anio_mes_key UNIQUE (anio, mes);


--
-- Name: proyeccion_uf proyeccion_uf_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.proyeccion_uf
    ADD CONSTRAINT proyeccion_uf_pkey PRIMARY KEY (id);


--
-- Name: proyeccion_version proyeccion_version_anio_numero_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.proyeccion_version
    ADD CONSTRAINT proyeccion_version_anio_numero_key UNIQUE (anio, numero);


--
-- Name: proyeccion_version proyeccion_version_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.proyeccion_version
    ADD CONSTRAINT proyeccion_version_pkey PRIMARY KEY (id);


--
-- Name: receptor receptor_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.receptor
    ADD CONSTRAINT receptor_pkey PRIMARY KEY (id);


--
-- Name: registro_tiempo registro_tiempo_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.registro_tiempo
    ADD CONSTRAINT registro_tiempo_pkey PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: slack_notificacion_log slack_notificacion_log_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.slack_notificacion_log
    ADD CONSTRAINT slack_notificacion_log_pkey PRIMARY KEY (id);


--
-- Name: solicitud_cp solicitud_cp_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.solicitud_cp
    ADD CONSTRAINT solicitud_cp_pkey PRIMARY KEY (id);


--
-- Name: solicitud_factura solicitud_factura_folio_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.solicitud_factura
    ADD CONSTRAINT solicitud_factura_folio_key UNIQUE (folio);


--
-- Name: solicitud_factura solicitud_factura_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.solicitud_factura
    ADD CONSTRAINT solicitud_factura_pkey PRIMARY KEY (id);


--
-- Name: solicitud_item solicitud_item_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.solicitud_item
    ADD CONSTRAINT solicitud_item_pkey PRIMARY KEY (id);


--
-- Name: solicitud_programada solicitud_programada_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.solicitud_programada
    ADD CONSTRAINT solicitud_programada_pkey PRIMARY KEY (id);


--
-- Name: solicitud_receptor solicitud_receptor_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.solicitud_receptor
    ADD CONSTRAINT solicitud_receptor_pkey PRIMARY KEY (solicitud_id, receptor_id);


--
-- Name: uf_cache uf_cache_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.uf_cache
    ADD CONSTRAINT uf_cache_pkey PRIMARY KEY (fecha);


--
-- Name: version_plantilla version_plantilla_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.version_plantilla
    ADD CONSTRAINT version_plantilla_pkey PRIMARY KEY (id);


--
-- Name: idx_app_session_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_app_session_user ON public.app_session USING btree (user_id, revoked_at);


--
-- Name: idx_app_user_coordinador; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_app_user_coordinador ON public.app_user USING btree (coordinador_id);


--
-- Name: idx_app_user_username_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_app_user_username_unique ON public.app_user USING btree (lower(username)) WHERE ((username IS NOT NULL) AND (username <> ''::text));


--
-- Name: idx_audit_created; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_audit_created ON public.audit_log USING btree (created_at DESC);


--
-- Name: idx_audit_entidad; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_audit_entidad ON public.audit_log USING btree (entidad, entidad_id);


--
-- Name: idx_bitacora_dataset; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_bitacora_dataset ON public.bitacora_integracion USING btree (dataset, iniciado_at DESC);


--
-- Name: idx_bitacora_estado; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_bitacora_estado ON public.bitacora_integracion USING btree (estado, iniciado_at DESC);


--
-- Name: idx_bitacora_integracion; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_bitacora_integracion ON public.bitacora_integracion USING btree (integracion, dataset, iniciado_at DESC);


--
-- Name: idx_catalogo_estado_grupo; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_catalogo_estado_grupo ON public.catalogo_estado_solicitud USING btree (grupo, activo, orden);


--
-- Name: idx_catalogo_tipo_cp_activo; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_catalogo_tipo_cp_activo ON public.catalogo_tipo_cp USING btree (activo, nombre);


--
-- Name: idx_catalogo_tipo_impuesto_activo; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_catalogo_tipo_impuesto_activo ON public.catalogo_tipo_impuesto USING btree (activo, afecto_iva);


--
-- Name: idx_cliente_coord_cliente; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_cliente_coord_cliente ON public.cliente_coordinador USING btree (cliente_id, activo);


--
-- Name: idx_cliente_coord_cp; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_cliente_coord_cp ON public.cliente_coordinador USING btree (cp_id, activo);


--
-- Name: idx_cliente_coord_cp_nombre; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_cliente_coord_cp_nombre ON public.cliente_coordinador USING btree (cliente_id, cp_nombre, activo);


--
-- Name: idx_cliente_coordinador; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_cliente_coordinador ON public.cliente USING btree (coordinador_id);


--
-- Name: idx_cliente_estado; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_cliente_estado ON public.cliente USING btree (estado);


--
-- Name: idx_cliente_facturacion_cliente; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_cliente_facturacion_cliente ON public.cliente_facturacion USING btree (cliente_id, activo);


--
-- Name: idx_cp_cli; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_cp_cli ON public.cp USING btree (cliente_id);


--
-- Name: idx_cp_cliente_codigo; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_cp_cliente_codigo ON public.cp USING btree (cliente_id, codigo);


--
-- Name: idx_cp_tipo; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_cp_tipo ON public.cp USING btree (tipo_cp);


--
-- Name: idx_doc_checksum; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_doc_checksum ON public.documento_exportado USING btree (checksum);


--
-- Name: idx_doc_solicitud; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_doc_solicitud ON public.documento_exportado USING btree (solicitud_id, generado_at DESC);


--
-- Name: idx_doc_version; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_doc_version ON public.documento_exportado USING btree (version_plantilla);


--
-- Name: idx_hist_estado_hacia; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_hist_estado_hacia ON public.historial_estado USING btree (estado_hacia);


--
-- Name: idx_hist_fecha; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_hist_fecha ON public.historial_estado USING btree (fecha DESC);


--
-- Name: idx_hist_sol; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_hist_sol ON public.historial_estado USING btree (solicitud_id, fecha DESC);


--
-- Name: idx_proy_cliente_codigo_periodo; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_proy_cliente_codigo_periodo ON public.proyeccion_facturacion USING btree (cliente_id, codigo, anio, mes);


--
-- Name: idx_proy_cliente_periodo; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_proy_cliente_periodo ON public.proyeccion_facturacion USING btree (cliente_id, anio, mes);


--
-- Name: idx_proy_codigo; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_proy_codigo ON public.proyeccion_facturacion USING btree (codigo);


--
-- Name: idx_proy_estado; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_proy_estado ON public.proyeccion_facturacion USING btree (estado);


--
-- Name: idx_proy_periodo_tipo_estado; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_proy_periodo_tipo_estado ON public.proyeccion_facturacion USING btree (anio, mes, tipo_impuesto, estado);


--
-- Name: idx_proy_source_updated; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_proy_source_updated ON public.proyeccion_facturacion USING btree (source, updated_at DESC);


--
-- Name: idx_proy_tipo_facturacion; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_proy_tipo_facturacion ON public.proyeccion_facturacion USING btree (tipo_impuesto, codigo_facturacion);


--
-- Name: idx_proyeccion_admin_cliente_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_proyeccion_admin_cliente_id ON public.proyeccion USING btree (cliente_id, anio, ms);


--
-- Name: idx_proyeccion_admin_filtros; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_proyeccion_admin_filtros ON public.proyeccion USING btree (anio, cliente, ms, producto, tipo_cp, iva, estado);


--
-- Name: idx_proyeccion_auxiliar_anio_hoja; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_proyeccion_auxiliar_anio_hoja ON public.proyeccion_auxiliar USING btree (anio, hoja, fila);


--
-- Name: idx_proyeccion_item_orden_fila; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_proyeccion_item_orden_fila ON public.proyeccion_item USING btree (version_id, orden_fila, id);


--
-- Name: idx_proyeccion_item_version; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_proyeccion_item_version ON public.proyeccion_item USING btree (version_id, cliente, ms, producto, tipo_cp, iva);


--
-- Name: idx_proyeccion_mensual_item_mes; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_proyeccion_mensual_item_mes ON public.proyeccion_mensual USING btree (item_id, mes);


--
-- Name: idx_receptor_cli; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_receptor_cli ON public.receptor USING btree (cliente_id);


--
-- Name: idx_slack_log_solicitud; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_slack_log_solicitud ON public.slack_notificacion_log USING btree (solicitud_id, created_at DESC);


--
-- Name: idx_slack_log_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_slack_log_status ON public.slack_notificacion_log USING btree (status, created_at DESC);


--
-- Name: idx_sol_cliente; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_sol_cliente ON public.solicitud_factura USING btree (cliente_id, periodo);


--
-- Name: idx_sol_cliente_facturacion; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_sol_cliente_facturacion ON public.solicitud_factura USING btree (cliente_facturacion_id);


--
-- Name: idx_sol_coordinador_periodo; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_sol_coordinador_periodo ON public.solicitud_factura USING btree (coordinador_id, periodo, is_delete);


--
-- Name: idx_sol_empresa_periodo; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_sol_empresa_periodo ON public.solicitud_factura USING btree (empresa_emisora, periodo, is_delete);


--
-- Name: idx_sol_estado; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_sol_estado ON public.solicitud_factura USING btree (estado);


--
-- Name: idx_sol_fecha; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_sol_fecha ON public.solicitud_factura USING btree (fecha_solicitud DESC);


--
-- Name: idx_sol_is_delete; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_sol_is_delete ON public.solicitud_factura USING btree (is_delete);


--
-- Name: idx_sol_periodo_estado; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_sol_periodo_estado ON public.solicitud_factura USING btree (periodo, estado, is_delete);


--
-- Name: idx_sol_programada; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_sol_programada ON public.solicitud_factura USING btree (programada_id);


--
-- Name: idx_sol_programada_periodo; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_sol_programada_periodo ON public.solicitud_factura USING btree (programada_id, periodo, is_delete);


--
-- Name: idx_sol_updated_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_sol_updated_at ON public.solicitud_factura USING btree (updated_at DESC);


--
-- Name: idx_solicitud_cp_cp; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_solicitud_cp_cp ON public.solicitud_cp USING btree (cp_id);


--
-- Name: idx_solicitud_cp_solicitud_orden; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_solicitud_cp_solicitud_orden ON public.solicitud_cp USING btree (solicitud_id, orden);


--
-- Name: uq_proyeccion_admin_natural; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX uq_proyeccion_admin_natural ON public.proyeccion USING btree (anio, mes, COALESCE(ms, ''::text), COALESCE(cliente, ''::text), COALESCE(proyecto, ''::text), COALESCE(producto, ''::text), COALESCE(tipo_cp, ''::text), COALESCE(cp, ''::text));


--
-- Name: uq_proyeccion_configuracion_natural; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX uq_proyeccion_configuracion_natural ON public.proyeccion_configuracion USING btree (COALESCE(cliente_id, ''::text), COALESCE(ms, ''::text), anio);


--
-- Name: uq_proyeccion_natural; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX uq_proyeccion_natural ON public.proyeccion_facturacion USING btree (cliente_id, codigo, nombre, anio, mes, tipo_impuesto, codigo_facturacion);


--
-- Name: uq_proyeccion_uf_anio_mes; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX uq_proyeccion_uf_anio_mes ON public.proyeccion_uf USING btree (anio, mes);


--
-- Name: uq_proyeccion_version_activa; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX uq_proyeccion_version_activa ON public.proyeccion_version USING btree (anio) WHERE (activa = 1);


--
-- Name: uq_proyeccion_version_activa_anio; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX uq_proyeccion_version_activa_anio ON public.proyeccion_version USING btree (anio) WHERE (activa = 1);


--
-- Name: uq_receptor_cliente_email_activo; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX uq_receptor_cliente_email_activo ON public.receptor USING btree (cliente_id, lower(TRIM(BOTH FROM email))) WHERE (activo = 1);


--
-- Name: uq_solicitud_cp_solicitud_cp; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX uq_solicitud_cp_solicitud_cp ON public.solicitud_cp USING btree (solicitud_id, cp_id);


--
-- Name: solicitud_factura trg_solicitud_cliente_facturacion_insert; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_solicitud_cliente_facturacion_insert BEFORE INSERT ON public.solicitud_factura FOR EACH ROW EXECUTE FUNCTION public.enforce_solicitud_cliente_facturacion();


--
-- Name: solicitud_factura trg_solicitud_cliente_facturacion_update; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_solicitud_cliente_facturacion_update BEFORE UPDATE OF cliente_id, cliente_facturacion_id ON public.solicitud_factura FOR EACH ROW EXECUTE FUNCTION public.enforce_solicitud_cliente_facturacion();


--
-- Name: solicitud_cp trg_solicitud_cp_cliente_insert; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_solicitud_cp_cliente_insert BEFORE INSERT ON public.solicitud_cp FOR EACH ROW EXECUTE FUNCTION public.enforce_solicitud_cp_cliente();


--
-- Name: solicitud_cp trg_solicitud_cp_cliente_update; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_solicitud_cp_cliente_update BEFORE UPDATE ON public.solicitud_cp FOR EACH ROW EXECUTE FUNCTION public.enforce_solicitud_cp_cliente();


--
-- Name: solicitud_factura trg_solicitud_programada_cliente_insert; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_solicitud_programada_cliente_insert BEFORE INSERT ON public.solicitud_factura FOR EACH ROW EXECUTE FUNCTION public.enforce_solicitud_programada_cliente();


--
-- Name: solicitud_factura trg_solicitud_programada_cliente_update; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_solicitud_programada_cliente_update BEFORE UPDATE OF cliente_id, programada_id ON public.solicitud_factura FOR EACH ROW EXECUTE FUNCTION public.enforce_solicitud_programada_cliente();


--
-- Name: solicitud_receptor trg_solicitud_receptor_cliente_insert; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_solicitud_receptor_cliente_insert BEFORE INSERT ON public.solicitud_receptor FOR EACH ROW EXECUTE FUNCTION public.enforce_solicitud_receptor_cliente();


--
-- Name: solicitud_receptor trg_solicitud_receptor_cliente_update; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_solicitud_receptor_cliente_update BEFORE UPDATE ON public.solicitud_receptor FOR EACH ROW EXECUTE FUNCTION public.enforce_solicitud_receptor_cliente();


--
-- Name: app_session app_session_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.app_session
    ADD CONSTRAINT app_session_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.app_user(id);


--
-- Name: app_user app_user_coordinador_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.app_user
    ADD CONSTRAINT app_user_coordinador_id_fkey FOREIGN KEY (coordinador_id) REFERENCES public.coordinador(id);


--
-- Name: asignacion_solicitud asignacion_solicitud_desarrollador_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.asignacion_solicitud
    ADD CONSTRAINT asignacion_solicitud_desarrollador_id_fkey FOREIGN KEY (desarrollador_id) REFERENCES public.desarrollador(id);


--
-- Name: asignacion_solicitud asignacion_solicitud_solicitud_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.asignacion_solicitud
    ADD CONSTRAINT asignacion_solicitud_solicitud_id_fkey FOREIGN KEY (solicitud_id) REFERENCES public.solicitud_factura(id);


--
-- Name: cliente_coordinador cliente_coordinador_cliente_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cliente_coordinador
    ADD CONSTRAINT cliente_coordinador_cliente_id_fkey FOREIGN KEY (cliente_id) REFERENCES public.cliente(id);


--
-- Name: cliente_coordinador cliente_coordinador_coordinador_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cliente_coordinador
    ADD CONSTRAINT cliente_coordinador_coordinador_id_fkey FOREIGN KEY (coordinador_id) REFERENCES public.coordinador(id);


--
-- Name: cliente_coordinador cliente_coordinador_cp_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cliente_coordinador
    ADD CONSTRAINT cliente_coordinador_cp_id_fkey FOREIGN KEY (cp_id) REFERENCES public.cp(id);


--
-- Name: cliente cliente_coordinador_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cliente
    ADD CONSTRAINT cliente_coordinador_id_fkey FOREIGN KEY (coordinador_id) REFERENCES public.coordinador(id);


--
-- Name: cliente_facturacion cliente_facturacion_cliente_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cliente_facturacion
    ADD CONSTRAINT cliente_facturacion_cliente_id_fkey FOREIGN KEY (cliente_id) REFERENCES public.cliente(id) ON DELETE CASCADE;


--
-- Name: cliente_producto cliente_producto_cliente_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cliente_producto
    ADD CONSTRAINT cliente_producto_cliente_id_fkey FOREIGN KEY (cliente_id) REFERENCES public.cliente(id);


--
-- Name: cliente_producto cliente_producto_producto_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cliente_producto
    ADD CONSTRAINT cliente_producto_producto_id_fkey FOREIGN KEY (producto_id) REFERENCES public.producto(id);


--
-- Name: cp cp_cliente_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cp
    ADD CONSTRAINT cp_cliente_id_fkey FOREIGN KEY (cliente_id) REFERENCES public.cliente(id);


--
-- Name: documento_exportado documento_exportado_solicitud_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.documento_exportado
    ADD CONSTRAINT documento_exportado_solicitud_id_fkey FOREIGN KEY (solicitud_id) REFERENCES public.solicitud_factura(id);


--
-- Name: historial_estado historial_estado_solicitud_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.historial_estado
    ADD CONSTRAINT historial_estado_solicitud_id_fkey FOREIGN KEY (solicitud_id) REFERENCES public.solicitud_factura(id);


--
-- Name: proyeccion proyeccion_cliente_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.proyeccion
    ADD CONSTRAINT proyeccion_cliente_id_fkey FOREIGN KEY (cliente_id) REFERENCES public.cliente(id);


--
-- Name: proyeccion_configuracion proyeccion_configuracion_cliente_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.proyeccion_configuracion
    ADD CONSTRAINT proyeccion_configuracion_cliente_id_fkey FOREIGN KEY (cliente_id) REFERENCES public.cliente(id);


--
-- Name: proyeccion_facturacion proyeccion_facturacion_cliente_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.proyeccion_facturacion
    ADD CONSTRAINT proyeccion_facturacion_cliente_id_fkey FOREIGN KEY (cliente_id) REFERENCES public.cliente(id);


--
-- Name: proyeccion_item proyeccion_item_cliente_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.proyeccion_item
    ADD CONSTRAINT proyeccion_item_cliente_id_fkey FOREIGN KEY (cliente_id) REFERENCES public.cliente(id);


--
-- Name: proyeccion_item proyeccion_item_version_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.proyeccion_item
    ADD CONSTRAINT proyeccion_item_version_id_fkey FOREIGN KEY (version_id) REFERENCES public.proyeccion_version(id);


--
-- Name: proyeccion_mensual proyeccion_mensual_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.proyeccion_mensual
    ADD CONSTRAINT proyeccion_mensual_item_id_fkey FOREIGN KEY (item_id) REFERENCES public.proyeccion_item(id);


--
-- Name: receptor receptor_cliente_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.receptor
    ADD CONSTRAINT receptor_cliente_id_fkey FOREIGN KEY (cliente_id) REFERENCES public.cliente(id);


--
-- Name: registro_tiempo registro_tiempo_desarrollador_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.registro_tiempo
    ADD CONSTRAINT registro_tiempo_desarrollador_id_fkey FOREIGN KEY (desarrollador_id) REFERENCES public.desarrollador(id);


--
-- Name: registro_tiempo registro_tiempo_solicitud_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.registro_tiempo
    ADD CONSTRAINT registro_tiempo_solicitud_id_fkey FOREIGN KEY (solicitud_id) REFERENCES public.solicitud_factura(id);


--
-- Name: slack_notificacion_log slack_notificacion_log_coordinador_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.slack_notificacion_log
    ADD CONSTRAINT slack_notificacion_log_coordinador_id_fkey FOREIGN KEY (coordinador_id) REFERENCES public.coordinador(id);


--
-- Name: slack_notificacion_log slack_notificacion_log_solicitud_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.slack_notificacion_log
    ADD CONSTRAINT slack_notificacion_log_solicitud_id_fkey FOREIGN KEY (solicitud_id) REFERENCES public.solicitud_factura(id);


--
-- Name: solicitud_cp solicitud_cp_cp_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.solicitud_cp
    ADD CONSTRAINT solicitud_cp_cp_id_fkey FOREIGN KEY (cp_id) REFERENCES public.cp(id);


--
-- Name: solicitud_cp solicitud_cp_solicitud_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.solicitud_cp
    ADD CONSTRAINT solicitud_cp_solicitud_id_fkey FOREIGN KEY (solicitud_id) REFERENCES public.solicitud_factura(id) ON DELETE CASCADE;


--
-- Name: solicitud_factura solicitud_factura_cliente_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.solicitud_factura
    ADD CONSTRAINT solicitud_factura_cliente_id_fkey FOREIGN KEY (cliente_id) REFERENCES public.cliente(id);


--
-- Name: solicitud_factura solicitud_factura_coordinador_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.solicitud_factura
    ADD CONSTRAINT solicitud_factura_coordinador_id_fkey FOREIGN KEY (coordinador_id) REFERENCES public.coordinador(id);


--
-- Name: solicitud_factura solicitud_factura_empresa_emisora_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.solicitud_factura
    ADD CONSTRAINT solicitud_factura_empresa_emisora_fkey FOREIGN KEY (empresa_emisora) REFERENCES public.empresa_emisora(codigo);


--
-- Name: solicitud_item solicitud_item_producto_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.solicitud_item
    ADD CONSTRAINT solicitud_item_producto_id_fkey FOREIGN KEY (producto_id) REFERENCES public.producto(id);


--
-- Name: solicitud_item solicitud_item_solicitud_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.solicitud_item
    ADD CONSTRAINT solicitud_item_solicitud_id_fkey FOREIGN KEY (solicitud_id) REFERENCES public.solicitud_factura(id) ON DELETE CASCADE;


--
-- Name: solicitud_programada solicitud_programada_cliente_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.solicitud_programada
    ADD CONSTRAINT solicitud_programada_cliente_id_fkey FOREIGN KEY (cliente_id) REFERENCES public.cliente(id);


--
-- Name: solicitud_receptor solicitud_receptor_receptor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.solicitud_receptor
    ADD CONSTRAINT solicitud_receptor_receptor_id_fkey FOREIGN KEY (receptor_id) REFERENCES public.receptor(id);


--
-- Name: solicitud_receptor solicitud_receptor_solicitud_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.solicitud_receptor
    ADD CONSTRAINT solicitud_receptor_solicitud_id_fkey FOREIGN KEY (solicitud_id) REFERENCES public.solicitud_factura(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict Hq22ZIh1h1bTNtNMca8XAmMfLVbgRBHa2e7kyUrqmElkike9B1fAB5FsCPelNcr

