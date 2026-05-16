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

  confirm(message, title) {
    const id = 'confirm-' + Date.now();
    const $modal = $(`
      <div class="modal fade" id="${id}" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">${title || 'Confirmar'}</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
            </div>
            <div class="modal-body">${message}</div>
            <div class="modal-footer">
              <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Cancelar</button>
              <button type="button" class="btn btn-danger" data-confirm-ok>Eliminar</button>
            </div>
          </div>
        </div>
      </div>
    `);
    const deferred = $.Deferred();
    $('body').append($modal);
    const modal = new bootstrap.Modal($modal[0]);
    $modal.find('[data-confirm-ok]').on('click', () => {
      deferred.resolve(true);
      modal.hide();
    });
    $modal.on('hidden.bs.modal', () => {
      if (deferred.state() === 'pending') deferred.resolve(false);
      $modal.remove();
    });
    modal.show();
    return deferred.promise();
  },

  estadoClass(estado) {
    return 'estado-' + String(estado || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^A-Za-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  },

  estadoChip(estado) {
    const visible = estado === 'FACTURADO' ? 'FACTURA SOLICITADA' : estado;
    return '<span class="estado-chip ' + UI.estadoClass(visible) + '">' + visible + '</span>';
  }
};
