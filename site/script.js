/* Valor Pyme — Rutas · interacciones */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- Header sombra al scrollear ---- */
  var header = document.querySelector('.site-header');
  function onScrollHeader() {
    if (!header) return;
    header.classList.toggle('scrolled', window.scrollY > 8);
  }
  onScrollHeader();
  window.addEventListener('scroll', onScrollHeader, { passive: true });

  /* ---- Menú móvil ---- */
  var burger = document.querySelector('.nav__burger');
  var menu = document.querySelector('.mobile-menu');
  if (burger && menu) {
    burger.addEventListener('click', function () {
      var open = menu.classList.toggle('open');
      burger.classList.toggle('is-open', open);
      document.body.classList.toggle('menu-open', open);
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    menu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        menu.classList.remove('open');
        burger.classList.remove('is-open');
        document.body.classList.remove('menu-open');
      });
    });
  }

  /* ---- Longitud real de cada path para animar el trazo ---- */
  document.querySelectorAll('.route-line.draw').forEach(function (p) {
    try {
      var len = Math.ceil(p.getTotalLength());
      p.style.setProperty('--len', len);
    } catch (e) {}
  });

  /* ---- Reveal + disparo de animaciones de líneas ---- */
  var revealables = document.querySelectorAll('.reveal, .lines-svg, .hero__visual, .diag, .combo');
  if (!('IntersectionObserver' in window)) {
    revealables.forEach(function (el) { el.classList.add('is-visible'); });
    return;
  }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) {
        en.target.classList.add('is-visible');
        io.unobserve(en.target);
      }
    });
  }, { threshold: 0.18, rootMargin: '0px 0px -8% 0px' });
  revealables.forEach(function (el) { io.observe(el); });
  /* Safety: si algo no se disparó (scroll muy rápido), revela tras 2.5s */
  window.setTimeout(function () {
    revealables.forEach(function (el) { el.classList.add('is-visible'); });
  }, 2500);

  /* ---- Parallax suave (scroll-linked) ---- */
  var items = [].slice.call(document.querySelectorAll('[data-parallax]'));
  if (items.length && !reduce) {
    var ticking = false;
    function update() {
      var vh = window.innerHeight;
      items.forEach(function (el) {
        el.style.transform = 'none'; // medir SIN transform para evitar feedback/runaway
        var r = el.getBoundingClientRect();
        var center = r.top + r.height / 2;
        var prog = (center - vh / 2) / vh; // ~ -0.6..0.6 mientras está en pantalla
        if (prog > 1) prog = 1; else if (prog < -1) prog = -1; // clamp: evita transforms absurdos fuera de pantalla
        var speed = parseFloat(el.getAttribute('data-parallax')) || 0.15;
        el.style.transform = 'translate3d(0,' + (prog * speed * -100).toFixed(2) + 'px,0)';
      });
      ticking = false;
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { window.requestAnimationFrame(update); ticking = true; }
    }, { passive: true });
    window.addEventListener('resize', update);
    update();
  }

  /* ---- Año dinámico en footer ---- */
  var y = document.querySelector('[data-year]');
  if (y) y.textContent = new Date().getFullYear();
})();
