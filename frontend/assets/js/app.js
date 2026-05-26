// Bootstrap de la SPA: registra rutas y arranca el router.
$(function () {
  function initWelcomeScreen() {
    const screen = document.getElementById('welcome-screen');
    const video = document.getElementById('welcome-video');
    const skip = document.getElementById('welcome-skip');
    if (!screen || !video || !skip) return;

    let closed = false;
    const close = () => {
      if (closed) return;
      closed = true;
      screen.classList.add('is-hidden');
      setTimeout(() => screen.remove(), 220);
    };

    skip.addEventListener('click', close);
    video.addEventListener('ended', close);
    video.addEventListener('error', close);
    video.playbackRate = 1.75;
    setTimeout(close, 4000);

    const playback = video.play();
    if (playback && typeof playback.catch === 'function') {
      playback.catch(() => skip.focus());
    }
  }

  function initSidebarToggle() {
    const button = document.getElementById('btn-sidebar-toggle');
    if (!button) return;

    const applyState = (collapsed) => {
      document.body.classList.toggle('sidebar-collapsed', collapsed);
      button.setAttribute('aria-label', collapsed ? 'Mostrar menú' : 'Ocultar menú');
      button.setAttribute('title', collapsed ? 'Mostrar menú' : 'Ocultar menú');
      button.innerHTML = '<i class="bi ' + (collapsed ? 'bi-chevron-right' : 'bi-chevron-left') + '"></i>';
    };

    applyState(localStorage.getItem('facturapp.sidebarCollapsed') === '1');
    button.addEventListener('click', () => {
      const collapsed = !document.body.classList.contains('sidebar-collapsed');
      localStorage.setItem('facturapp.sidebarCollapsed', collapsed ? '1' : '0');
      applyState(collapsed);
    });
  }

  const redirectTo = (hash) => () => location.replace(hash);
  const protectedView = (render) => (params) => {
    document.body.classList.remove('auth-screen');
    if (!AuthService.user()) {
      location.replace('#/login');
      return;
    }
    render(params);
  };
  const adminView = (render) => protectedView((params) => {
    if (!AuthService.isAdmin()) {
      location.replace('#/dashboard');
      return;
    }
    render(params);
  });

  Router.on('/login',                    () => LoginView.render());
  Router.on('/dashboard',                protectedView(() => DashboardView.render()));
  Router.on('/solicitudes',              protectedView(() => SolicitudesView.list()));
  Router.on('/solicitudes/nueva',        protectedView(() => SolicitudesView.nueva()));
  Router.on('/solicitudes/:id',          protectedView((p) => SolicitudesView.detalle(p)));
  Router.on('/calendario',               protectedView((p) => CalendarioView.render(p)));
  Router.on('/historial-uf',             protectedView((p) => HistorialUfView.render(p)));
  Router.on('/clientes',                 protectedView(() => ClientesView.list()));
  Router.on('/clientes/:id',             protectedView((p) => ClientesView.detalle(p)));
  Router.on('/coordinadores',            protectedView(() => CoordinadoresView.list()));
  Router.on('/proyecciones',             adminView(() => ProyeccionesView.render()));
  Router.on('/admin',                    adminView(() => AdminView.render()));
  Router.on('/configuracion',            adminView(() => ConfiguracionView.render()));

  Router.on('/desarrolladores',          redirectTo('#/dashboard'));
  Router.on('/desarrolladores/:id',      redirectTo('#/dashboard'));
  Router.on('/reportes',                 redirectTo('#/solicitudes'));
  Router.on('/reportes/cliente/:id',     redirectTo('#/solicitudes'));
  Router.on('/finanzas',                 redirectTo('#/solicitudes'));

  if (!location.hash) location.hash = AuthService.user() ? '#/dashboard' : '#/login';
  ThemeService.init();
  initSidebarToggle();
  initWelcomeScreen();
  AuthService.renderStatus();
  Router.start();
});
