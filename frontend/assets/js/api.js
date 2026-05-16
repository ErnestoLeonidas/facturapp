// Cliente HTTP delgado sobre jQuery, con envelope unificado.
// Devuelve promesas que resuelven con `data` o rechazan con `error`.
window.Api = (function () {
  function unwrap(resp) {
    if (resp && resp.ok) return resp.data;
    const err = (resp && resp.error) || { code: 'UNKNOWN', message: 'Respuesta inválida' };
    return $.Deferred().reject(err).promise();
  }

  function request(method, path, body) {
    const token = window.AuthService && AuthService.token && AuthService.token();
    return $.ajax({
      method,
      url: AppConfig.apiBase + path,
      headers: token ? { Authorization: 'Bearer ' + token } : {},
      contentType: 'application/json',
      data: body ? JSON.stringify(body) : undefined,
      dataType: 'json'
    }).then(unwrap, function (xhr) {
      const e = (xhr.responseJSON && xhr.responseJSON.error) || {
        code: 'NETWORK_ERROR',
        message: 'No se pudo contactar al backend'
      };
      return $.Deferred().reject(e).promise();
    });
  }

  return {
    get:    (p)    => request('GET',    p),
    post:   (p, b) => request('POST',   p, b),
    patch:  (p, b) => request('PATCH',  p, b),
    put:    (p, b) => request('PUT',    p, b),
    del:    (p)    => request('DELETE', p)
  };
})();
