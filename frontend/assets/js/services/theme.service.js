window.ThemeService = {
  _key: 'facturapp.theme',

  current() {
    return localStorage.getItem(ThemeService._key) || 'light';
  },

  apply(theme) {
    const next = theme === 'dark' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-bs-theme', next);
    document.body.classList.toggle('theme-dark', next === 'dark');
    localStorage.setItem(ThemeService._key, next);
    ThemeService.renderToggle();
  },

  toggle() {
    ThemeService.apply(ThemeService.current() === 'dark' ? 'light' : 'dark');
  },

  renderToggle() {
    const isDark = ThemeService.current() === 'dark';
    $('#btn-theme-toggle')
      .attr('aria-label', isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro')
      .attr('title', isDark ? 'Modo claro' : 'Modo oscuro')
      .html(`<i class="bi ${isDark ? 'bi-sun' : 'bi-moon'}"></i>`);
  },

  init() {
    ThemeService.apply(ThemeService.current());
    $('#btn-theme-toggle').off('click').on('click', () => ThemeService.toggle());
  }
};
