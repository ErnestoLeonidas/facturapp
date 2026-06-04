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

  _esc(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  },

  login(username, password) {
    return Api.post('/auth/login', { username, password }).then(session => {
      localStorage.setItem(AuthService._key, JSON.stringify(session));
      AuthService.renderStatus();
      return session;
    });
  },

  logout() {
    return Api.post('/auth/logout', {}).always(() => {
      localStorage.removeItem(AuthService._key);
      AuthService.renderStatus();
      location.hash = '#/login';
    });
  },

  renderStatus() {
    const user = AuthService.user();
    $('#nav-admin').toggle(!!user && user.rol === 'admin');
    $('#nav-coordinadores').toggle(!!user && user.rol === 'admin');
    $('#nav-proyecciones').toggle(!!user && user.rol === 'admin');
    $('#nav-configuracion').toggle(!!user && user.rol === 'admin');
    const label = AuthService._esc(user ? (user.username || user.nombre || 'Usuario') : '');
    const name = AuthService._esc(user ? (user.nombre || user.username || 'Usuario') : '');
    const role = AuthService._esc(user ? user.rol : '');
    $('#auth-status').html(user ? `
      <div class="dropdown">
        <button class="btn btn-outline-secondary user-menu-btn dropdown-toggle" type="button" id="btn-user-menu" data-bs-toggle="dropdown" aria-expanded="false" aria-label="Menu de usuario">
          <i class="bi bi-person-circle"></i>
          <span>${label}</span>
        </button>
        <ul class="dropdown-menu dropdown-menu-end shadow-sm" aria-labelledby="btn-user-menu">
          <li>
            <h6 class="dropdown-header">
              ${name}<br>
              <small class="text-muted">${role}</small>
            </h6>
          </li>
          <li><hr class="dropdown-divider"></li>
          <li>
            <button class="dropdown-item text-danger" type="button" id="btn-logout">
              <i class="bi bi-box-arrow-right me-2"></i>Cerrar sesión
            </button>
          </li>
        </ul>
      </div>
    ` : '');

    $('#btn-logout').on('click', () => AuthService.logout());
  }
};
