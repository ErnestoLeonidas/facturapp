window.UI = {
  setTitle(t) { $('#page-title').html('<h2 class="mb-0">' + t + '</h2>'); },

  loading(target) {
    $(target || '#view-root').html(
      '<div class="d-flex justify-content-center py-5"><div class="spinner-border" role="status"></div></div>'
    );
  },

  error(target, err) {
    const msg = (err && err.message) || 'Error inesperado';
    const code = (err && err.code) || '';
    $(target || '#view-root').html(
      '<div class="alert alert-danger"><strong>' + code + '</strong> ' + msg + '</div>'
    );
  },

  toast(msg, kind) {
    const k = kind || 'info';
    const $t = $(
      '<div class="toast align-items-center text-bg-' + k + ' border-0 position-fixed bottom-0 end-0 m-3" role="alert">' +
      '<div class="d-flex"><div class="toast-body">' + msg + '</div>' +
      '<button class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button></div></div>'
    );
    $('body').append($t);
    new bootstrap.Toast($t[0], { delay: 3500 }).show();
  },

  estadoChip(estado) {
    return '<span class="estado-chip estado-' + estado + '">' + estado + '</span>';
  }
};
