/* ============================================================
   FORO VALOR PYME
   1) Índice: renderiza las tarjetas de temas desde /foro.json
   2) Entrada: módulo de comentarios (envío + moderación básica)
      Los comentarios enviados quedan "En revisión" (localStorage),
      simulando el flujo de moderación que en producción vive en
      HubSpot: Valor Pyme revisa, aprueba u oculta antes de publicar.
   ============================================================ */
(function () {
  'use strict';

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  var CHAT_ICON = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 5.5A1.5 1.5 0 0 1 5.5 4h13A1.5 1.5 0 0 1 20 5.5v8A1.5 1.5 0 0 1 18.5 15H9l-4 4v-4H5.5A1.5 1.5 0 0 1 4 13.5v-8Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>';
  var ARROW = '<svg viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var CLOCK = '<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2"/><path d="M12 7v5l3 2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';

  /* ===================== 1 · ÍNDICE DEL FORO ===================== */
  var grid = document.getElementById('fr-grid');
  if (grid) {
    fetch('/foro.json').then(function (r) { return r.json(); }).then(function (db) {
      var rutas = db.meta.rutas, temas = db.temas || [];
      if (!temas.length) { grid.innerHTML = '<div class="fr-empty">Aún no hay conversaciones abiertas. Vuelve pronto.</div>'; return; }
      grid.innerHTML = temas.map(function (t) {
        var rm = rutas[t.ruta] || { label: 'Comunidad', color: '#6126FF' };
        var n = (t.comentarios || []).length;
        var href = '/' + encodeURIComponent(t.slug);
        return '' +
          '<article class="fr-tcard" style="--tema:' + rm.color + '">' +
            '<div class="fr-tcard__top">' +
              '<span class="bl-chip bl-chip--' + esc(t.ruta) + '">Ruta ' + esc(rm.label) + '</span>' +
              '<span class="bl-meta__item" style="font-size:13px;color:var(--color-gris-claro)">' + esc(t.fecha_label) + '</span>' +
            '</div>' +
            '<h3><a href="' + href + '">' + esc(t.titulo) + '</a></h3>' +
            '<p class="fr-tcard__excerpt">' + esc(t.resumen) + '</p>' +
            '<div class="fr-tcard__foot">' +
              '<span class="fr-count">' + CHAT_ICON + n + (n === 1 ? ' comentario' : ' comentarios') + '</span>' +
              '<a class="fr-tcard__cta" href="' + href + '">Participar' + ARROW + '</a>' +
            '</div>' +
          '</article>';
      }).join('');
    }).catch(function () {
      grid.innerHTML = '<div class="fr-empty"><strong>No se pudieron cargar las conversaciones.</strong> Intenta recargar la página.</div>';
    });
  }

  /* ===================== 2 · COMENTARIOS (entrada) ===================== */
  var form = document.querySelector('[data-fr-form]');
  var list = document.getElementById('fr-list');
  if (!form || !list) return;

  var slug = form.getAttribute('data-slug') || 'foro';
  var storeKey = 'vp-foro:' + slug;
  var countEls = document.querySelectorAll('[data-fr-count]');
  var okMsg = document.getElementById('fr-ok');
  var emptyEl = document.querySelector('[data-fr-empty]');

  // Nº de comentarios ya publicados (horneados en el HTML por el build)
  var publishedCount = list.querySelectorAll('.fr-comment').length;

  function load() {
    try { return JSON.parse(localStorage.getItem(storeKey) || '[]'); }
    catch (e) { return []; }
  }
  function save(arr) {
    try { localStorage.setItem(storeKey, JSON.stringify(arr)); } catch (e) {}
  }

  function initials(name) {
    var parts = String(name).trim().split(/\s+/);
    var a = (parts[0] || '')[0] || '';
    var b = (parts.length > 1 ? parts[parts.length - 1][0] : '') || '';
    return (a + b) || '?';
  }

  function commentNode(c) {
    var el = document.createElement('article');
    el.className = 'fr-comment is-pending';
    el.innerHTML =
      '<div class="fr-comment__avatar">' + esc(initials(c.nombre)) + '</div>' +
      '<div class="fr-comment__body">' +
        '<div class="fr-comment__meta">' +
          '<span class="fr-comment__name">' + esc(c.nombre) + '</span>' +
          (c.empresa ? '<span class="fr-comment__where">' + esc(c.empresa) + '</span>' : '') +
          '<span class="fr-badge">' + CLOCK + 'En revisión</span>' +
        '</div>' +
        '<p class="fr-comment__text">' + esc(c.texto) + '</p>' +
      '</div>';
    return el;
  }

  function updateCount() {
    var pending = list.querySelectorAll('.fr-comment.is-pending').length;
    var total = publishedCount + pending;
    var label = total + (total === 1 ? ' comentario' : ' comentarios');
    for (var i = 0; i < countEls.length; i++) countEls[i].textContent = label;
    if (emptyEl) emptyEl.hidden = total > 0;
  }

  // Repinta los comentarios pendientes guardados (arriba del listado)
  load().forEach(function (c) { list.insertBefore(commentNode(c), list.firstChild); });
  updateCount();

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!form.checkValidity()) { form.reportValidity(); return; }

    var data = {
      nombre: form.querySelector('[name="nombre"]').value.trim(),
      empresa: (form.querySelector('[name="empresa"]') || {}).value ? form.querySelector('[name="empresa"]').value.trim() : '',
      texto: form.querySelector('[name="comentario"]').value.trim()
    };
    if (!data.nombre || !data.texto) { form.reportValidity(); return; }

    var stored = load();
    stored.push(data);
    save(stored);

    list.insertBefore(commentNode(data), list.firstChild);
    updateCount();
    form.reset();

    if (okMsg) {
      okMsg.classList.add('is-shown');
      okMsg.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  });
})();
