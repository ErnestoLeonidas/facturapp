window.LoginView = {
  render() {
    if (AuthService.user()) {
      location.replace('#/dashboard');
      return;
    }

    document.body.classList.add('auth-screen');
    $('#auth-status').empty();
    $('#page-title').empty();
    $('#view-root').html(`
      <div class="login-page">
        <section class="login-panel" aria-labelledby="login-title">
          <a class="login-brand" href="#/dashboard" aria-label="Ir al dashboard">
            <img src="assets/img/logo-mas.png" alt="MAS">
            <div>
              <h1 id="login-title">FactuFlow</h1>
              <p>Acceso corporativo MAS</p>
            </div>
          </a>

          <form id="login-form" class="login-form" novalidate>
            <div class="alert alert-danger d-none" id="login-error" role="alert"></div>

            <div class="mb-3">
              <label class="form-label" for="login-username">Usuario</label>
              <input class="form-control" id="login-username" name="username" type="text" autocomplete="username" minlength="3" required>
              <div class="invalid-feedback">Ingresa tu usuario.</div>
            </div>

            <div class="mb-3">
              <label class="form-label" for="login-password">Contraseña</label>
              <input class="form-control" id="login-password" name="password" type="password" autocomplete="current-password" minlength="6" required>
              <div class="invalid-feedback">Ingresa tu contraseña de al menos 6 caracteres.</div>
            </div>

            <button class="btn btn-primary w-100" id="login-submit" type="submit">
              <span class="login-submit-text">Entrar</span>
              <span class="spinner-border spinner-border-sm d-none" id="login-spinner" aria-hidden="true"></span>
            </button>
          </form>
        </section>
      </div>
    `);

    $('#login-username').trigger('focus');

    $('#login-form').on('submit', function (event) {
      event.preventDefault();
      const form = this;
      const username = $('#login-username').val().trim();
      const password = $('#login-password').val();
      const $error = $('#login-error');
      const $button = $('#login-submit');
      const $spinner = $('#login-spinner');

      $error.addClass('d-none').text('');
      form.classList.add('was-validated');
      if (!form.checkValidity()) return;

      $button.prop('disabled', true);
      $spinner.removeClass('d-none');

      AuthService.login(username, password)
        .then(() => {
          document.body.classList.remove('auth-screen');
          location.replace('#/dashboard');
          UI.toast('Sesión iniciada', 'success');
        })
        .fail(e => {
          $error.text(e.message || 'No se pudo iniciar sesión').removeClass('d-none');
        })
        .always(() => {
          $button.prop('disabled', false);
          $spinner.addClass('d-none');
        });
    });
  }
};
