// Hash router básico. Cada ruta se registra con una función render(params).
window.Router = (function () {
  const routes = [];

  function on(pattern, render) {
    // Convierte "/solicitudes/:id" en regex y nombres de parámetros.
    const names = [];
    const re = new RegExp('^' + pattern
      .replace(/:[^/]+/g, m => { names.push(m.slice(1)); return '([^/]+)'; })
      .replace(/\//g, '\\/') + '$');
    routes.push({ re, names, render, pattern });
  }

  function resolve() {
    const rawHash = (location.hash || '#/dashboard').replace(/^#/, '');
    const [hash, queryString] = rawHash.split('?');
    const query = Object.fromEntries(new URLSearchParams(queryString || ''));
    for (const r of routes) {
      const m = hash.match(r.re);
      if (m) {
        const params = {};
        r.names.forEach((n, i) => params[n] = decodeURIComponent(m[i + 1]));
        Object.assign(params, query);
        document.querySelectorAll('#main-nav .nav-link').forEach(a => {
          a.classList.toggle('active', a.getAttribute('href') === '#' + hash.split('/').slice(0,2).join('/'));
        });
        try { r.render(params); }
        catch (e) { console.error(e); $('#view-root').html('<div class="alert alert-danger">Error renderizando vista.</div>'); }
        return;
      }
    }
    $('#view-root').html('<div class="alert alert-warning">Ruta no encontrada: ' + hash + '</div>');
  }

  window.addEventListener('hashchange', resolve);
  return { on, start: resolve };
})();
