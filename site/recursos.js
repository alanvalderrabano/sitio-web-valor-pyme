/* ============================================================
   CENTRO DE RECURSOS · Listado + filtros (página /recursos)
   Lee la fuente única de datos /recursos.json.
   El detalle de cada recurso es una página estática propia
   (generada con build-recursos.py) — no se renderiza aquí.
   ============================================================ */
(function () {
  var grid = document.getElementById('rc-grid');
  if (!grid) return;

  var TYPE_ICON = {
    ebook: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 5.5A1.5 1.5 0 015.5 4H11v15H5.5A1.5 1.5 0 014 17.5v-12z" stroke="currentColor" stroke-width="1.7"/><path d="M20 5.5A1.5 1.5 0 0018.5 4H13v15h5.5a1.5 1.5 0 001.5-1.5v-12z" stroke="currentColor" stroke-width="1.7"/></svg>',
    infografia: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 20V10M12 20V4M19 20v-7" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    video: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" stroke-width="1.7"/><path d="M10 9l5 3-5 3V9z" fill="currentColor"/></svg>'
  };

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
  }); }

  fetch('/recursos.json').then(function (r) { return r.json(); }).then(function (db) {
    var META = db.meta, DATA = db.recursos;
    function tipoLabel(t) { return (META.tipos[t] && META.tipos[t].label) || t; }
    function rutaMeta(r) { return META.rutas[r] || { label: r, color: '#6126FF' }; }

    var state = { tipo: 'all', ruta: 'all' };
    var countEl = document.getElementById('rc-count');
    var resetEl = document.getElementById('rc-reset');

    var params = new URLSearchParams(location.search);
    if (params.get('tipo') && META.tipos[params.get('tipo')]) state.tipo = params.get('tipo');
    if (params.get('ruta') && META.rutas[params.get('ruta')]) state.ruta = params.get('ruta');

    function buildChips(groupId, kind) {
      var box = document.getElementById(groupId);
      if (!box) return;
      var col = kind === 'tipo' ? 'tipos' : 'rutas';
      var items = [{ v: 'all', label: kind === 'tipo' ? 'Todos' : 'Todas' }];
      Object.keys(META[col]).forEach(function (k) {
        items.push({ v: k, label: kind === 'tipo' ? (META.tipos[k].plural || META.tipos[k].label) : META.rutas[k].label });
      });
      items.forEach(function (it) {
        var b = document.createElement('button');
        b.type = 'button'; b.className = 'rc-chip';
        b.setAttribute('aria-pressed', state[kind] === it.v ? 'true' : 'false');
        b.dataset.value = it.v;
        var dot = (kind === 'ruta' && it.v !== 'all')
          ? '<span class="rc-chip__dot" style="background:' + rutaMeta(it.v).color + '"></span>' : '';
        b.innerHTML = dot + '<span>' + esc(it.label) + '</span>';
        b.addEventListener('click', function () {
          state[kind] = it.v; syncPressed(box, it.v); render(); updateUrl();
        });
        box.appendChild(b);
      });
    }

    function syncPressed(box, value) {
      box.querySelectorAll('.rc-chip').forEach(function (c) {
        c.setAttribute('aria-pressed', c.dataset.value === value ? 'true' : 'false');
      });
    }

    function updateUrl() {
      var p = new URLSearchParams();
      if (state.tipo !== 'all') p.set('tipo', state.tipo);
      if (state.ruta !== 'all') p.set('ruta', state.ruta);
      var qs = p.toString();
      history.replaceState(null, '', qs ? ('?' + qs) : location.pathname);
    }

    function cardHTML(r) {
      var rm = rutaMeta(r.ruta);
      return '' +
        '<a class="rc-card" href="/' + encodeURIComponent(r.slug) + '">' +
          '<div class="rc-card__cover">' +
            '<img src="' + esc(r.portada) + '" alt="" loading="lazy">' +
            '<span class="rc-card__type">' + (TYPE_ICON[r.tipo] || '') + tipoLabel(r.tipo) + '</span>' +
          '</div>' +
          '<div class="rc-card__body">' +
            '<span class="rc-card__ruta" style="color:' + rm.color + '"><span class="rc-dot" style="background:' + rm.color + '"></span>Ruta ' + esc(rm.label) + '</span>' +
            '<h3 class="rc-card__title">' + esc(r.titulo) + '</h3>' +
            '<p class="rc-card__desc">' + esc(r.resumen) + '</p>' +
            '<span class="rc-card__cta">' + esc((r.cta && r.cta.label) || 'Ver recurso') +
              '<svg viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
            '</span>' +
          '</div>' +
        '</a>';
    }

    function render() {
      var list = DATA.filter(function (r) {
        return (state.tipo === 'all' || r.tipo === state.tipo) &&
               (state.ruta === 'all' || r.ruta === state.ruta);
      });
      grid.innerHTML = list.length ? list.map(cardHTML).join('')
        : '<div class="rc-empty"><strong>Sin resultados</strong>No hay recursos que coincidan con estos filtros. Prueba con otra combinación.</div>';
      if (countEl) countEl.textContent = list.length + (list.length === 1 ? ' recurso' : ' recursos');
      if (resetEl) resetEl.hidden = (state.tipo === 'all' && state.ruta === 'all');
    }

    if (resetEl) resetEl.addEventListener('click', function () {
      state = { tipo: 'all', ruta: 'all' };
      syncPressed(document.getElementById('fg-tipo'), 'all');
      syncPressed(document.getElementById('fg-ruta'), 'all');
      render(); updateUrl();
    });

    buildChips('fg-tipo', 'tipo');
    buildChips('fg-ruta', 'ruta');
    render();
  }).catch(function () {
    grid.innerHTML = '<div class="rc-empty"><strong>No se pudieron cargar los recursos</strong>Intenta recargar la página.</div>';
  });
})();
