/* Valor Pyme — Blog · interacciones (listing + post) */
(function () {
  'use strict';

  /* ===================== LISTING: video del hero (vp-lines) — más lento, sin loop ===================== */
  var heroVideo = document.querySelector('[data-bl-hero-video]');
  if (heroVideo) {
    var SPEED = 0.6; // más lento que el original, pero no tanto
    function slowDown() { try { heroVideo.playbackRate = SPEED; } catch (e) {} }
    slowDown();
    heroVideo.addEventListener('loadedmetadata', slowDown);
    heroVideo.addEventListener('play', slowDown);
    // Al terminar: se queda congelado en el último frame (sin loop y sin reiniciar)
    heroVideo.addEventListener('ended', function () {
      heroVideo.pause();
      heroVideo.currentTime = Math.max(0, heroVideo.duration - 0.05);
    });
  }

  /* ===================== LISTING: filtros por categoría (tabs) ===================== */
  var tabs = document.querySelectorAll('[data-bl-tab]');
  var cards = [].slice.call(document.querySelectorAll('[data-bl-card]'));
  var empty = document.querySelector('[data-bl-empty]');
  if (tabs.length && cards.length) {
    function applyFilter(cat) {
      var shown = 0;
      cards.forEach(function (card) {
        var cats = (card.getAttribute('data-cats') || '').split(/\s+/);
        var match = cat === 'all' || cats.indexOf(cat) !== -1;
        card.classList.toggle('is-hidden', !match);
        if (match) shown++;
      });
      if (empty) empty.classList.toggle('is-shown', shown === 0);
    }
    tabs.forEach(function (t) {
      t.addEventListener('click', function () {
        tabs.forEach(function (x) { x.classList.remove('is-active'); x.setAttribute('aria-selected', 'false'); });
        t.classList.add('is-active');
        t.setAttribute('aria-selected', 'true');
        applyFilter(t.getAttribute('data-bl-tab'));
      });
    });
  }

  /* ===================== LISTING: búsqueda en vivo ===================== */
  var searchForm = document.querySelector('[data-bl-search]');
  if (searchForm && cards.length) {
    var input = searchForm.querySelector('input');
    function runSearch() {
      var q = (input.value || '').trim().toLowerCase();
      var shown = 0;
      cards.forEach(function (card) {
        var hay = (card.textContent || '').toLowerCase();
        var match = !q || hay.indexOf(q) !== -1;
        card.classList.toggle('is-hidden', !match);
        if (match) shown++;
      });
      if (empty) empty.classList.toggle('is-shown', shown === 0);
      // Al buscar, resetea el tab activo a "Todos"
      if (q) {
        document.querySelectorAll('[data-bl-tab]').forEach(function (x) {
          x.classList.toggle('is-active', x.getAttribute('data-bl-tab') === 'all');
        });
      }
    }
    input.addEventListener('input', runSearch);
    searchForm.addEventListener('submit', function (e) { e.preventDefault(); runSearch(); });
  }

  /* ===================== POST: barra de progreso de lectura ===================== */
  var bar = document.querySelector('[data-bp-progress]');
  var article = document.querySelector('[data-bp-article]');
  if (bar && article) {
    var ticking = false;
    function updateBar() {
      ticking = false;
      var rect = article.getBoundingClientRect();
      var vh = window.innerHeight;
      var total = article.offsetHeight - vh;
      var scrolled = -rect.top;
      var prog = total > 0 ? scrolled / total : 0;
      if (prog < 0) prog = 0; else if (prog > 1) prog = 1;
      bar.style.width = (prog * 100).toFixed(2) + '%';
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { window.requestAnimationFrame(updateBar); ticking = true; }
    }, { passive: true });
    window.addEventListener('resize', updateBar);
    updateBar();
  }

  /* ===================== POST: TOC scrollspy ===================== */
  var tocLinks = [].slice.call(document.querySelectorAll('[data-toc-link]'));
  if (tocLinks.length && 'IntersectionObserver' in window) {
    var byId = {};
    var headings = tocLinks.map(function (l) {
      var id = l.getAttribute('href').slice(1);
      byId[id] = l;
      return document.getElementById(id);
    }).filter(Boolean);
    var current = null;
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) current = en.target.id;
      });
      tocLinks.forEach(function (l) {
        l.classList.toggle('is-active', l.getAttribute('href') === '#' + current);
      });
    }, { rootMargin: '-20% 0px -70% 0px', threshold: 0 });
    headings.forEach(function (h) { spy.observe(h); });
  }

  /* ===================== POST: compartir ===================== */
  var shareBtns = document.querySelectorAll('[data-share]');
  if (shareBtns.length) {
    var url = window.location.href;
    var title = document.title;
    shareBtns.forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        var net = btn.getAttribute('data-share');
        var u = encodeURIComponent(url), t = encodeURIComponent(title);
        var dest = '';
        if (net === 'linkedin') dest = 'https://www.linkedin.com/sharing/share-offsite/?url=' + u;
        else if (net === 'x') dest = 'https://twitter.com/intent/tweet?url=' + u + '&text=' + t;
        else if (net === 'facebook') dest = 'https://www.facebook.com/sharer/sharer.php?u=' + u;
        else if (net === 'whatsapp') dest = 'https://api.whatsapp.com/send?text=' + t + '%20' + u;
        else if (net === 'copy') {
          e.preventDefault();
          if (navigator.clipboard) {
            navigator.clipboard.writeText(url).then(function () {
              var old = btn.getAttribute('aria-label');
              btn.setAttribute('aria-label', '¡Enlace copiado!');
              btn.classList.add('is-copied');
              window.setTimeout(function () { btn.setAttribute('aria-label', old); btn.classList.remove('is-copied'); }, 1600);
            });
          }
          return;
        }
        if (dest) { e.preventDefault(); window.open(dest, '_blank', 'noopener,width=620,height=560'); }
      });
    });
  }
})();
