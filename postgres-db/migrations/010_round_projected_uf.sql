UPDATE proyeccion_uf
SET uf_proyectada = round(uf_proyectada),
    updated_at = datetime('now')
WHERE uf_proyectada IS NOT NULL;
