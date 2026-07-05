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

  isPlatformUser() {
    const user = AuthService.user();
    const username = String((user && (user.username || user.email)) || '').trim().toLowerCase();
    return username === 'plataformas';
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
    const isAdmin = !!user && user.rol === 'admin';
    const isPlatform = AuthService.isPlatformUser();
    $('#nav-calendario').toggle(isAdmin);
    $('#nav-admin').toggle(isAdmin);
    $('#nav-coordinadores').toggle(isAdmin);
    $('#nav-proyecciones').toggle(isAdmin);
    $('#nav-configuracion').toggle(isAdmin);
    const displayName = isPlatform ? 'Usuario plataforma' : (user ? (user.nombre || user.username || 'Usuario') : '');
    const labelName = isPlatform ? 'Plataformas' : (user ? (user.username || user.nombre || 'Usuario') : '');
    const label = AuthService._esc(labelName);
    const name = AuthService._esc(displayName);
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
