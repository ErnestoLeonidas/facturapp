window.Format = {
  clp(n) {
    if (n == null || isNaN(n)) return '';
    return '$' + Number(n).toLocaleString('es-CL', { maximumFractionDigits: 0 });
  },
  uf(n) {
    if (n == null || isNaN(n)) return '';
    return Number(n).toLocaleString('es-CL', { maximumFractionDigits: 2 }) + ' UF';
  },
  fecha(iso) {
    if (!iso) return '';
    const d = new Date(iso);
    if (isNaN(d)) return iso;
    return d.toLocaleDateString('es-CL');
  },
  rut(r) { return r || ''; }
};
