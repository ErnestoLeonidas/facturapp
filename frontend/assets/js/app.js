// Bootstrap de la SPA: registra rutas y arranca el router.
$(function () {
  Router.on('/dashboard',                () => DashboardView.render());
  Router.on('/solicitudes',              () => SolicitudesView.list());
  Router.on('/solicitudes/nueva',        () => SolicitudesView.nueva());
  Router.on('/solicitudes/:id',          (p) => SolicitudesView.detalle(p));
  Router.on('/calendario',               (p) => CalendarioView.render(p));
  Router.on('/clientes',                 () => ClientesView.list());
  Router.on('/clientes/:id',             (p) => ClientesView.detalle(p));
  Router.on('/coordinadores',            () => CoordinadoresView.list());
  Router.on('/desarrolladores',          () => DesarrolladoresView.list());
  Router.on('/desarrolladores/:id',      (p) => DesarrolladoresView.detalle(p));
  Router.on('/reportes',                 () => ReportesView.index());
  Router.on('/reportes/cliente/:id',     (p) => ReportesView.cliente(p));
  Router.on('/configuracion',            () => ConfiguracionView.render());

  if (!location.hash) location.hash = '#/dashboard';
  Router.start();
});
