window.AuthService = {
  _key: 'facturapp.auth',

  session() {
    try { return JSON.parse(localStorage.getItem(AuthService._key) || 'null'); }
    catch (_) { return null; }
  },

  token() {
    const session = AuthService.session();
    return session && session.token;
  },

  user() {
    const session = AuthService.session();
    return session && session.user;
  },

  isAdmin() {
    const user = AuthService.user();
    return !!user && user.rol === 'admin';
  },

  login(email, password) {
    return Api.post('/auth/login', { email, password }).then(session => {
      localStorage.setItem(AuthService._key, JSON.stringify(session));
      AuthService.renderStatus();
      return session;
    });
  },

  logout() {
    return Api.post('/auth/logout', {}).always(() => {
      localStorage.removeItem(AuthService._key);
      AuthService.renderStatus();
      if (location.hash === '#/admin') location.hash = '#/dashboard';
    });
  },

  renderStatus() {
    const user = AuthService.user();
    $('#nav-admin').toggle(!!user && user.rol === 'admin');
    $('#auth-status').html(user ? `
      <div class="d-flex align-items-center gap-2">
        <span class="small text-muted">${user.nombre} · ${user.rol}</span>
        <button class="btn btn-sm btn-outline-secondary" id="btn-logout">Salir</button>
      </div>
    ` : `
      <div class="d-flex align-items-center gap-1">
        <input class="form-control form-control-sm" id="login-email" placeholder="email" value="admin@facturapp.local" style="width: 190px">
        <input class="form-control form-control-sm" id="login-password" type="password" placeholder="password" value="admin123" style="width: 120px">
        <button class="btn btn-sm btn-outline-primary" id="btn-login">Entrar</button>
      </div>
    `);

    $('#btn-login').on('click', () => {
      AuthService.login($('#login-email').val(), $('#login-password').val())
        .then(() => UI.toast('Sesion iniciada', 'success'))
        .fail(e => UI.toast(e.message || 'No se pudo iniciar sesion', 'danger'));
    });
    $('#btn-logout').on('click', () => AuthService.logout());
  }
};
