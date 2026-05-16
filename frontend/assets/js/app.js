// Bootstrap de la SPA: registra rutas y arranca el router.
$(function () {
  const redirectTo = (hash) => () => location.replace(hash);

  Router.on('/dashboard',                () => DashboardView.render());
  Router.on('/solicitudes',              () => SolicitudesView.list());
  Router.on('/solicitudes/nueva',        () => SolicitudesView.nueva());
  Router.on('/solicitudes/:id',          (p) => SolicitudesView.detalle(p));
  Router.on('/calendario',               (p) => CalendarioView.render(p));
  Router.on('/historial-uf',             (p) => HistorialUfView.render(p));
  Router.on('/clientes',                 () => ClientesView.list());
  Router.on('/clientes/:id',             (p) => ClientesView.detalle(p));
  Router.on('/coordinadores',            () => CoordinadoresView.list());
  Router.on('/admin',                    () => AdminView.render());
  Router.on('/configuracion',            () => ConfiguracionView.render());

  Router.on('/desarrolladores',          redirectTo('#/dashboard'));
  Router.on('/desarrolladores/:id',      redirectTo('#/dashboard'));
  Router.on('/reportes',                 redirectTo('#/solicitudes'));
  Router.on('/reportes/cliente/:id',     redirectTo('#/solicitudes'));
  Router.on('/finanzas',                 redirectTo('#/solicitudes'));

  if (!location.hash) location.hash = '#/dashboard';
  AuthService.renderStatus();
  Router.start();
});
