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

  /* ============================================================
     Buscador IA (lupa en el nav → popup) · endpoint /_hcms/api/vp-ask
     Se inyecta en todas las páginas desde el JS compartido.
     ============================================================ */
  (function () {
    var nav = document.querySelector('.site-header .nav');
    if (!nav) return;

    var SUGGESTIONS = [
      '¿Qué es Valor Pyme?',
      '¿Cuánto cuesta sumarme?',
      '¿Cuáles son las 4 rutas?',
      '¿Quiénes son los aliados?',
      '¿Cómo empiezo?'
    ];

    /* --- Botón lupa en el nav (antes del CTA / burger) --- */
    var searchBtn = document.createElement('button');
    searchBtn.type = 'button';
    searchBtn.className = 'nav__search';
    searchBtn.setAttribute('aria-label', 'Buscar / Preguntar a la IA');
    searchBtn.setAttribute('aria-haspopup', 'dialog');
    searchBtn.innerHTML =
      '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="2"/><path d="M20 20l-3.2-3.2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
    var cta = nav.querySelector('.nav__cta');
    var burgerBtn = nav.querySelector('.nav__burger');
    nav.insertBefore(searchBtn, cta || burgerBtn || null);

    /* --- Modal (una sola vez por página) --- */
    var modal = document.createElement('div');
    modal.className = 'vp-ask';
    modal.id = 'vpAsk';
    modal.hidden = true;
    modal.innerHTML =
      '<div class="vp-ask__backdrop" data-ask-close></div>' +
      '<div class="vp-ask__dialog" role="dialog" aria-modal="true" aria-labelledby="vpAskTitle">' +
        '<button class="vp-ask__x" type="button" aria-label="Cerrar" data-ask-close>' +
          '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>' +
        '</button>' +
        '<span class="vp-ask__badge">IA · Valor Pyme</span>' +
        '<h2 class="vp-ask__title" id="vpAskTitle">¿Tienes dudas? <em>Pregúntale a la IA de Valor Pyme.</em></h2>' +
        '<form class="vp-ask__form" data-ask-form autocomplete="off">' +
          '<input class="vp-ask__input" type="text" name="q" data-ask-input ' +
            'placeholder="Pregúntame sobre Valor Pyme… rutas, aliados, cómo sumarte" ' +
            'aria-label="Escribe tu pregunta">' +
          '<button class="vp-ask__send" type="submit" aria-label="Preguntar">' +
            '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 19V5M5 12l7-7 7 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
          '</button>' +
        '</form>' +
        '<div class="vp-ask__chips" data-ask-chips></div>' +
        '<div class="vp-ask__answer" data-ask-answer hidden></div>' +
        '<p class="vp-ask__disc">Respuestas generadas con IA en base a la información oficial de Valor Pyme.</p>' +
      '</div>';
    document.body.appendChild(modal);

    var dialog = modal.querySelector('.vp-ask__dialog');
    var form = modal.querySelector('[data-ask-form]');
    var input = modal.querySelector('[data-ask-input]');
    var chipsWrap = modal.querySelector('[data-ask-chips]');
    var answerEl = modal.querySelector('[data-ask-answer]');
    var busy = false;
    var lastFocus = null;
    var history = []; // [{role, content}] para dar contexto a las repreguntas

    SUGGESTIONS.forEach(function (q) {
      var c = document.createElement('button');
      c.type = 'button';
      c.className = 'vp-ask__chip';
      c.textContent = q;
      c.addEventListener('click', function () { input.value = q; ask(q); });
      chipsWrap.appendChild(c);
    });

    function openModal() {
      lastFocus = document.activeElement;
      modal.hidden = false;
      document.body.classList.add('vp-ask-open');
      requestAnimationFrame(function () {
        modal.classList.add('is-open');
        input.focus();
      });
    }
    function closeModal() {
      modal.classList.remove('is-open');
      document.body.classList.remove('vp-ask-open');
      window.setTimeout(function () { modal.hidden = true; }, 220);
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    }

    searchBtn.addEventListener('click', openModal);
    modal.addEventListener('click', function (e) {
      // closest() sube desde el elemento clicado (p.ej. el <svg>/<path> dentro
      // de la X) hasta el que lleva data-ask-close, para que la X cierre siempre.
      if (e.target.closest('[data-ask-close]')) closeModal();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !modal.hidden) closeModal();
    });
    // Trampa de foco simple dentro del diálogo
    dialog.addEventListener('keydown', function (e) {
      if (e.key !== 'Tab') return;
      var f = dialog.querySelectorAll('button, input, [href], [tabindex]:not([tabindex="-1"])');
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      ask(input.value);
    });

    function setAnswer(html) {
      answerEl.hidden = false;
      answerEl.innerHTML = html;
    }

    function ask(q) {
      q = (q || '').trim();
      if (!q || busy) return;
      busy = true;
      input.value = q;
      chipsWrap.style.display = 'none';
      setAnswer(
        '<div class="vp-ask__q">' + escapeHtml(q) + '</div>' +
        '<div class="vp-ask__a" data-a><span class="vp-ask__typing"><i></i><i></i><i></i></span></div>'
      );
      var aEl = answerEl.querySelector('[data-a]');
      answerEl.scrollTop = 0;

      history.push({ role: 'user', content: q });

      /* Endpoint de HubSpot Serverless: mismo dominio, así que no hay CORS.
         Antes apuntaba a /api/ask (Cloudflare Pages), que en producción daba 403
         porque HubSpot no ejecuta esas funciones. La respuesta llega completa en
         JSON —HubSpot no admite streaming—, por eso ya no se lee por chunks:
         los puntitos de "escribiendo" cubren la espera (1.8–3.3 s medidos). */
      fetch('/_hcms/api/vp-ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history.slice(-8) })
      }).then(function (res) {
        return res.json().then(function (data) {
          if (!res.ok || !data || !data.text) throw new Error('bad response ' + res.status);
          aEl.textContent = '';
          aEl.appendChild(vpLinkify(data.text));
          answerEl.scrollTop = answerEl.scrollHeight;
          history.push({ role: 'assistant', content: data.text });
          busy = false;
        });
      }).catch(function () {
        busy = false;
        if (aEl) {
          aEl.innerHTML = 'Ups, no pudimos responder en este momento. Escríbenos en ' +
            '<a href="/ponte-en-contacto">la página de contacto</a> y te ayudamos.';
        }
      });
    }

    function escapeHtml(s) {
      return s.replace(/[&<>"']/g, function (c) {
        return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c];
      });
    }

    /* Enlazado de la respuesta de la IA.
       La IA responde SIEMPRE en texto plano; los enlaces los pone el front desde
       este diccionario fijo de URLs reales. Nunca se deja que la IA escriba una
       URL: los slugs de este sitio no son adivinables (contacto = /ponte-en-contacto,
       alianzas = /alianzas-estrategicas-valor-pyme…) y los inventaría mal.
       Orden: del patrón más específico al más general; cada destino se enlaza una
       sola vez (la primera aparición). */
    var VP_ENLACES = [
      { re: /ruta\s+(?:de\s+)?capital/i,               url: '/ruta-capital' },
      { re: /ruta\s+(?:de\s+)?mercado/i,               url: '/ruta-mercado' },
      { re: /ruta\s+(?:de\s+)?digitalizaci[oó]n/i,     url: '/ruta-digitalizacion' },
      { re: /ruta\s+(?:de\s+)?talento(?:\s+y\s+gesti[oó]n)?/i, url: '/ruta-talento' },
      { re: /las\s+(?:4|cuatro)\s+rutas/i,             url: '/rutas' },
      { re: /rutas\s+pyme/i,                           url: '/rutas' },
      { re: /diagn[oó]stico/i,                         url: '/diagnostico-de-madurez-empresarial' },
      { re: /suscr[ií]b\w*\s+gratis/i,                 url: '/suscripcion' },
      { re: /crea(?:r)?\s+(?:tu\s+|una\s+|su\s+)?cuenta/i, url: '/suscripcion' },
      { re: /p[aá]gina\s+de\s+contacto/i,              url: '/ponte-en-contacto' },
      { re: /cont[aá]ctanos/i,                         url: '/ponte-en-contacto' },
      { re: /(?:centro|secci[oó]n|biblioteca)\s+de\s+recursos/i, url: '/recursos' },
      { re: /\bfor[oó]\b/i,                            url: '/foro-comunidad-pyme' },
      { re: /\bblog\b/i,                               url: '/blog' }
    ];

    /* Devuelve un fragmento con el texto y sus enlaces como nodos reales.
       El texto de la IA va SOLO en nodos de texto / textContent y el href sale
       únicamente del diccionario de arriba: aunque la respuesta trajera <script>
       o comillas, no se ejecuta ni se interpreta como HTML. */
    function vpLinkify(text) {
      var frag = document.createDocumentFragment();
      var hits = [];
      VP_ENLACES.forEach(function (e) {
        var re = new RegExp(e.re.source, 'gi');
        var m;
        while ((m = re.exec(text))) {
          if (m[0]) hits.push({ ini: m.index, fin: m.index + m[0].length, txt: m[0], url: e.url });
          if (re.lastIndex === m.index) re.lastIndex++;
        }
      });
      hits.sort(function (a, b) { return a.ini - b.ini || (b.fin - b.ini) - (a.fin - a.ini); });
      var pos = 0, usados = {};
      hits.forEach(function (h) {
        if (h.ini < pos || usados[h.url]) return; // solapa con otro enlace, o ese destino ya se usó
        usados[h.url] = true;
        if (h.ini > pos) frag.appendChild(document.createTextNode(text.slice(pos, h.ini)));
        var a = document.createElement('a');
        a.href = h.url;
        a.className = 'vp-ask__link';
        a.textContent = h.txt;
        frag.appendChild(a);
        pos = h.fin;
      });
      if (pos < text.length) frag.appendChild(document.createTextNode(text.slice(pos)));
      return frag;
    }
  })();

  /* ---- Hero split: animación del isotipo (APNG, una vez) ----
     La imagen arranca en el fotograma estático (isotipo completo). Si el usuario
     NO pidió reduced-motion, la cambiamos por el APNG (se reproduce una sola vez,
     ~6s) y al terminar volvemos al estático, para que quede fijo en el isotipo
     completo (el APNG, al terminar, se limpia solo). Reduced-motion → estático. */
  (function () {
    var anims = document.querySelectorAll('.hp-hero__anim[data-anim]');
    if (!anims.length || reduce) return;
    anims.forEach(function (img) {
      var anim = img.getAttribute('data-anim');
      var still = img.getAttribute('src'); // estático inicial (isotipo completo)
      if (!anim) return;
      img.src = anim;
      // El APNG dura 6.0s y al terminar se limpia; cambiamos al estático justo
      // antes (mismo isotipo completo) para que quede fijo sin parpadeo en blanco.
      window.setTimeout(function () { img.src = still; }, 5800);
    });
  })();

  /* ---- Longitud real de cada path para animar el trazo ---- */
  document.querySelectorAll('.route-line.draw').forEach(function (p) {
    try {
      var len = Math.ceil(p.getTotalLength());
      p.style.setProperty('--len', len);
    } catch (e) {}
  });

  /* ---- Reveal + disparo de animaciones de líneas ---- */
  var revealables = document.querySelectorAll('.reveal, .lines-svg, .hero__lines--rutas, .bw-band, .hero__visual, .diag, .combo');
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

  /* ---- Carrusel de convocatorias (HOME · debajo del hero) ---- */
  var cvCar = document.querySelector('[data-conv-carousel]');
  if (cvCar) {
    var cvVp = cvCar.querySelector('[data-conv-viewport]');
    var cvTrack = cvCar.querySelector('[data-conv-track]');
    var cvPrev = cvCar.querySelector('[data-conv-prev]');
    var cvNext = cvCar.querySelector('[data-conv-next]');
    var cvCards = cvTrack ? [].slice.call(cvTrack.children) : [];
    if (cvVp && cvCards.length) {
      function cvStep() {
        var cs = window.getComputedStyle(cvTrack);
        var gap = parseFloat(cs.columnGap || cs.gap) || 0;
        return cvCards[0].getBoundingClientRect().width + gap;
      }
      function cvUpdate() {
        var max = cvVp.scrollWidth - cvVp.clientWidth;
        if (cvPrev) cvPrev.disabled = cvVp.scrollLeft <= 8;
        if (cvNext) cvNext.disabled = cvVp.scrollLeft >= max - 8;
      }
      function cvGo(dir) {
        var step = cvStep();
        var current = Math.round(cvVp.scrollLeft / step);
        var target = Math.max(0, Math.min(cvCards.length - 1, current + dir));
        cvVp.scrollTo({ left: target * step, behavior: reduce ? 'auto' : 'smooth' });
        window.setTimeout(cvUpdate, reduce ? 0 : 280);
      }
      if (cvPrev) cvPrev.addEventListener('click', function () { cvGo(-1); });
      if (cvNext) cvNext.addEventListener('click', function () { cvGo(1); });
      var cvTick = false;
      cvVp.addEventListener('scroll', function () {
        if (!cvTick) { window.requestAnimationFrame(function () { cvUpdate(); cvTick = false; }); cvTick = true; }
      }, { passive: true });
      window.addEventListener('resize', cvUpdate);
      cvUpdate();
    }
  }

  /* ---- Hero: congelar el video en el estado de líneas (evita el final "plano") ---- */
  var heroBg = document.querySelector('.hp-hero__bg');
  if (heroBg) {
    var HERO_FREEZE_AT = 11; // seg · congelado del hero. 11 = isotipo + líneas de color (ACTUAL, aprobado). 14.5 = solo isotipo blanco limpio sin líneas (versión anterior — cambiar a 14.5 si piden dejarlo "como estaba").
    var heroFrozen = false;
    function heroFreezeCheck() {
      var d = heroBg.duration || 0;
      var stop = d ? Math.min(HERO_FREEZE_AT, d - 0.05) : HERO_FREEZE_AT;
      if (!heroFrozen && heroBg.currentTime >= stop) {
        heroFrozen = true;
        heroBg.pause();
      }
    }
    heroBg.addEventListener('timeupdate', heroFreezeCheck);
    // Fallback: si el video termina antes de congelarse, deja el último frame quieto.
    heroBg.addEventListener('ended', function () { heroFrozen = true; });
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
