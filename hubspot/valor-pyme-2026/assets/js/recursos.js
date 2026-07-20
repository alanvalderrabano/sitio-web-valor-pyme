/* ============================================================
   CENTRO DE RECURSOS · Filtros (versión HubSpot)
   Las tarjetas y los chips se renderizan server-side desde el
   módulo (repeater). Aquí solo se filtra el DOM ya presente por
   data-tipo / data-ruta, se sincroniza el estado y la URL.
   ============================================================ */
(function () {
  var grid = document.getElementById('rc-grid');
  if (!grid) return;

  var cards = Array.prototype.slice.call(grid.querySelectorAll('.rc-card'));
  var countEl = document.getElementById('rc-count');
  var resetEl = document.getElementById('rc-reset');
  var emptyEl = grid.querySelector('.rc-empty');
  var state = { tipo: 'all', ruta: 'all' };

  var params = new URLSearchParams(location.search);
  if (params.get('tipo')) state.tipo = params.get('tipo');
  if (params.get('ruta')) state.ruta = params.get('ruta');

  function updateUrl() {
    var p = new URLSearchParams();
    if (state.tipo !== 'all') p.set('tipo', state.tipo);
    if (state.ruta !== 'all') p.set('ruta', state.ruta);
    var qs = p.toString();
    history.replaceState(null, '', qs ? ('?' + qs) : location.pathname);
  }

  function syncControls(kind) {
    document.querySelectorAll('.rc-chip[data-kind="' + kind + '"]').forEach(function (c) {
      c.setAttribute('aria-pressed', c.dataset.value === state[kind] ? 'true' : 'false');
    });
    var sel = document.querySelector('.rc-select[data-kind="' + kind + '"]');
    if (sel) sel.value = state[kind];
  }

  function render() {
    var visible = 0;
    cards.forEach(function (card) {
      var ok = (state.tipo === 'all' || card.dataset.tipo === state.tipo) &&
               (state.ruta === 'all' || card.dataset.ruta === state.ruta);
      card.hidden = !ok;
      if (ok) visible++;
    });
    if (emptyEl) emptyEl.hidden = visible !== 0;
    if (countEl) countEl.textContent = visible + (visible === 1 ? ' recurso' : ' recursos');
    if (resetEl) resetEl.hidden = (state.tipo === 'all' && state.ruta === 'all');
  }

  function setFilter(kind, value) {
    state[kind] = value;
    syncControls(kind);
    render();
    updateUrl();
  }

  document.querySelectorAll('.rc-chip').forEach(function (chip) {
    chip.addEventListener('click', function () { setFilter(chip.dataset.kind, chip.dataset.value); });
  });
  document.querySelectorAll('.rc-select').forEach(function (sel) {
    sel.addEventListener('change', function () { setFilter(sel.dataset.kind, sel.value); });
  });
  if (resetEl) resetEl.addEventListener('click', function () {
    state.tipo = 'all'; state.ruta = 'all';
    syncControls('tipo'); syncControls('ruta'); render(); updateUrl();
  });

  syncControls('tipo'); syncControls('ruta');
  render();
})();
