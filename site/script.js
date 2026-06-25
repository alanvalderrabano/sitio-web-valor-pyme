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

  /* ---- Scroll horizontal anclado (HOME · 4 rutas) ---- */
  var hWrap = document.querySelector('[data-hscroll]');
  var hRail = hWrap ? hWrap.querySelector('[data-rail]') : null;
  var hMetro = hWrap ? hWrap.querySelector('[data-metroline]') : null;
  if (hWrap && hRail) {
    var hTicking = false;
    function hUpdate() {
      hTicking = false;
      // En móvil/tablet (≤900px) el sticky está desactivado por CSS: no transformamos.
      if (window.matchMedia('(max-width: 900px)').matches) {
        hRail.style.transform = '';
        if (hMetro) hMetro.style.transform = '';
        return;
      }
      var rect = hWrap.getBoundingClientRect();
      var sticky = hWrap.querySelector('.hp-hscroll-sticky');
      var vp = hWrap.querySelector('.hp-hscroll-viewport');
      if (!sticky || !vp) return;
      var scrollable = hWrap.offsetHeight - sticky.offsetHeight; // recorrido total del wrapper
      if (scrollable <= 0) { hRail.style.transform = ''; return; }
      var prog = (-rect.top) / scrollable;
      if (prog < 0) prog = 0; else if (prog > 1) prog = 1;
      var maxX = hRail.scrollWidth - vp.clientWidth; // cuánto debe desplazarse el riel
      if (maxX < 0) maxX = 0;
      hRail.style.transform = 'translate3d(' + (-prog * maxX).toFixed(1) + 'px,0,0)';
      // Línea ondulada de metro: corre hacia la derecha conforme avanza el scroll.
      // El SVG mide 220% del ancho del contenedor. Sus translate% son relativos a su
      // propio ancho: -54.5% deja su mitad derecha cubriendo el viewport, 0% deja su
      // mitad izquierda. Al pasar de -54.5%→0% el trazo se desplaza a la derecha sin
      // dejar hueco a ningún lado.
      if (hMetro) {
        hMetro.style.transform = 'translate3d(' + (-54.5 + prog * 54.5).toFixed(2) + '%,0,0)';
      }
    }
    window.addEventListener('scroll', function () {
      if (!hTicking) { window.requestAnimationFrame(hUpdate); hTicking = true; }
    }, { passive: true });
    window.addEventListener('resize', hUpdate);
    hUpdate();
  }

  /* ---- Carrusel de aliados (HOME · "Nuestros Aliados") ---- */
  var aCar = document.querySelector('[data-ally-carousel]');
  if (aCar) {
    var aVp = aCar.querySelector('[data-ally-viewport]');
    var aTrack = aCar.querySelector('[data-ally-track]');
    var aPrev = aCar.querySelector('[data-ally-prev]');
    var aNext = aCar.querySelector('[data-ally-next]');
    var aDotsWrap = document.querySelector('[data-ally-dots]');
    var aCards = aTrack ? [].slice.call(aTrack.children) : [];
    if (aVp && aTrack && aCards.length) {
      var aIndex = 0;
      var aDots = [];
      if (aDotsWrap) {
        aCards.forEach(function (c, i) {
          var b = document.createElement('button');
          b.type = 'button';
          b.className = 'hp-allies__dot';
          b.setAttribute('aria-label', 'Ir al aliado ' + (i + 1));
          b.addEventListener('click', function () { aIndex = i; aApply(); });
          aDotsWrap.appendChild(b);
          aDots.push(b);
        });
      }
      function aStep() {
        var cs = window.getComputedStyle(aTrack);
        var gap = parseFloat(cs.columnGap || cs.gap) || 0;
        return aCards[0].getBoundingClientRect().width + gap;
      }
      function aMaxShift() { return Math.max(0, aTrack.scrollWidth - aVp.clientWidth); }
      function aMaxIndex() { var s = aStep(); var mi = s ? Math.round(aMaxShift() / s) : 0; return Math.min(mi, aCards.length - 1); }
      function aApply() {
        var s = aStep();
        var mi = aMaxIndex();
        if (aIndex < 0) aIndex = 0;
        if (aIndex > mi) aIndex = mi;
        var shift = Math.min(aIndex * s, aMaxShift());
        aTrack.style.transform = 'translateX(' + (-shift).toFixed(1) + 'px)';
        aDots.forEach(function (d, i) { d.classList.toggle('is-active', i === aIndex); });
        if (aPrev) aPrev.disabled = aIndex <= 0;
        if (aNext) aNext.disabled = aIndex >= mi;
      }
      if (aPrev) aPrev.addEventListener('click', function () { aIndex -= 1; aApply(); });
      if (aNext) aNext.addEventListener('click', function () { aIndex += 1; aApply(); });
      var aRz = false;
      window.addEventListener('resize', function () {
        if (!aRz) { window.requestAnimationFrame(function () { aApply(); aRz = false; }); aRz = true; }
      });
      aApply();
    }
  }

  /* ---- Contador count-up (HOME · +150.000) ---- */
  var counters = [].slice.call(document.querySelectorAll('[data-count]'));
  if (counters.length) {
    function formatNum(n) { return n.toLocaleString('es-CL'); }
    function runCount(el) {
      if (reduce) { return; } // respeta reduced-motion: deja el valor estático del HTML
      var target = parseInt(el.getAttribute('data-count'), 10) || 0;
      var suffix = el.getAttribute('data-suffix') || '';
      var dur = 1400, start = null;
      function tick(ts) {
        if (start === null) start = ts;
        var p = Math.min((ts - start) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        el.textContent = suffix + formatNum(Math.round(target * eased));
        if (p < 1) window.requestAnimationFrame(tick);
      }
      window.requestAnimationFrame(tick);
    }
    if ('IntersectionObserver' in window && !reduce) {
      var cio = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) { runCount(en.target); cio.unobserve(en.target); }
        });
      }, { threshold: 0.6 });
      counters.forEach(function (el) { cio.observe(el); });
    }
  }

  /* ---- Año dinámico en footer ---- */
  var y = document.querySelector('[data-year]');
  if (y) y.textContent = new Date().getFullYear();
})();
