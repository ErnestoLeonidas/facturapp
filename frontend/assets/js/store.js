// Store mínimo en memoria + filtros guardados en localStorage.
window.Store = (function () {
  const cache = {};

  return {
    set(key, value) { cache[key] = value; },
    get(key)        { return cache[key]; },
    clear(key)      { delete cache[key]; },

    persistFilter(viewKey, filter) {
      try { localStorage.setItem('flt:' + viewKey, JSON.stringify(filter)); } catch (e) {}
    },
    loadFilter(viewKey) {
      try { return JSON.parse(localStorage.getItem('flt:' + viewKey) || '{}'); }
      catch (e) { return {}; }
    }
  };
})();
