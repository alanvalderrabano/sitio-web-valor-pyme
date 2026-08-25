/* =============================================================================
   VALOR PYME × DEFONTANA — Landing "Suscríbete"
   Interacciones mínimas: nada que no aporte a la comprensión o a la conversión.
   ========================================================================== */
(function () {
  'use strict';

  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---------------------------------------------------------------- Año --- */
  $$('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });

  var header = $('#header');

  /* ------------------------------------------------------- FAQ (acordeón) --- */
  /* Animación por altura real para que el acordeón no salte en mobile. */
  $$('.faq__item').forEach(function (item) {
    var btn    = $('.faq__q', item);
    var panel  = $('.faq__a', item);
    var inner  = $('.faq__a-inner', item);

    var setHeight = function (open) {
      panel.style.height = open ? inner.offsetHeight + 'px' : '0px';
    };
    setHeight(item.classList.contains('is-open'));

    btn.addEventListener('click', function () {
      var willOpen = !item.classList.contains('is-open');

      // Comportamiento de acordeón: una respuesta a la vez.
      $$('.faq__item.is-open').forEach(function (other) {
        if (other === item) return;
        other.classList.remove('is-open');
        $('.faq__q', other).setAttribute('aria-expanded', 'false');
        $('.faq__a', other).style.height = '0px';
      });

      item.classList.toggle('is-open', willOpen);
      btn.setAttribute('aria-expanded', String(willOpen));
      setHeight(willOpen);
    });

    // Recalcula si cambia el ancho (el texto puede pasar de 2 a 3 líneas).
    window.addEventListener('resize', function () {
      if (item.classList.contains('is-open')) setHeight(true);
    });
  });

  /* ------------------------------- Selector de solución ↔ campo del formulario */
  var selectSolucion = $('#solucion');
  var needHint       = $('#need-hint');

  var syncFromCard = function (value, label) {
    if (selectSolucion) selectSolucion.value = value;
    if (needHint) {
      needHint.innerHTML = label
        ? '<strong style="color:var(--vp-morado)">' + label + '</strong> quedó seleccionado en tu formulario.'
        : 'Puedes activar más de una solución después de suscribirte.';
    }
  };

  $$('.need input[type="radio"]').forEach(function (radio) {
    radio.addEventListener('change', function () {
      syncFromCard(radio.value, radio.getAttribute('data-label'));
    });
  });

  // El select también manda: si el usuario lo cambia, se marca la tarjeta.
  if (selectSolucion) {
    selectSolucion.addEventListener('change', function () {
      var match = $$('.need input[type="radio"]').filter(function (r) {
        return r.value === selectSolucion.value;
      })[0];
      $$('.need input[type="radio"]').forEach(function (r) { r.checked = false; });
      if (match) { match.checked = true; }
    });
  }

  /* ------------------------------- CTA que preselecciona (Certificado SII) --- */
  $$('[data-preselect]').forEach(function (el) {
    el.addEventListener('click', function () {
      if (selectSolucion) {
        selectSolucion.value = el.getAttribute('data-preselect');
        selectSolucion.dispatchEvent(new Event('change'));
      }
    });
  });

  /* ------------------------- Foco al formulario desde cualquier CTA interno --- */
  $$('a[href="#formulario"]').forEach(function (link) {
    link.addEventListener('click', function () {
      window.setTimeout(function () {
        var first = $('#nombre');
        if (first && window.matchMedia('(min-width: 721px)').matches) first.focus({ preventScroll: true });
      }, 520);
    });
  });

  /* ------------------------------------------------- Validación del formulario */
  var form = $('#lead-form');
  var card = $('#formulario');

  var setError = function (input, invalid, msg) {
    var field = input.closest('[data-field]');
    if (!field) return;
    field.classList.toggle('is-invalid', invalid);
    input.setAttribute('aria-invalid', String(invalid));
    if (msg) {
      var err = $('[data-error]', field);
      if (err) err.textContent = msg;
    }
  };

  var isEmail = function (v) { return /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(v.trim()); };
  var isPhone = function (v) { return v.replace(/\D/g, '').length >= 8; };

  /* RUT chileno: validación real por módulo 11. */
  var isRut = function (v) {
    var clean = v.replace(/[.\-\s]/g, '').toUpperCase();
    if (!/^\d{7,8}[0-9K]$/.test(clean)) return false;
    var body = clean.slice(0, -1);
    var dv   = clean.slice(-1);
    var sum = 0, mul = 2;
    for (var i = body.length - 1; i >= 0; i--) {
      sum += parseInt(body[i], 10) * mul;
      mul = mul === 7 ? 2 : mul + 1;
    }
    var rest = 11 - (sum % 11);
    var expected = rest === 11 ? '0' : rest === 10 ? 'K' : String(rest);
    return dv === expected;
  };

  var formatRut = function (v) {
    var clean = v.replace(/[^0-9kK]/g, '').toUpperCase();
    if (clean.length < 2) return clean;
    var body = clean.slice(0, -1);
    var dv   = clean.slice(-1);
    return body.replace(/\B(?=(\d{3})+(?!\d))/g, '.') + '-' + dv;
  };

  var rutInput = $('#rut');
  if (rutInput) {
    rutInput.addEventListener('blur', function () {
      if (rutInput.value.trim()) rutInput.value = formatRut(rutInput.value);
    });
  }

  var validators = {
    nombre:         function (v) { return v.trim().length >= 3 && v.trim().indexOf(' ') > 0; },
    email:          function (v) { return isEmail(v); },
    telefono:       function (v) { return isPhone(v); },
    rut:            function (v) { return isRut(v); },
    consentimiento: function (_, el) { return el.checked; }
  };

  var validateOne = function (el) {
    var rule = validators[el.name];
    if (!rule) return true;
    var ok = rule(el.value, el);
    setError(el, !ok);
    return ok;
  };

  if (form) {
    // Limpia el error en cuanto el usuario corrige: no castigar mientras escribe.
    $$('input, select', form).forEach(function (el) {
      el.addEventListener('input', function () {
        var field = el.closest('[data-field]');
        if (field && field.classList.contains('is-invalid')) validateOne(el);
      });
      el.addEventListener('blur', function () {
        if (el.value !== '' || el.type === 'checkbox') validateOne(el);
      });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var firstInvalid = null;

      Object.keys(validators).forEach(function (name) {
        var el = form.elements[name];
        if (!el) return;
        if (!validateOne(el) && !firstInvalid) firstInvalid = el;
      });

      if (firstInvalid) {
        firstInvalid.focus();
        firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }

      // Demo: aquí iría el envío real (HubSpot / serverless).
      card.classList.add('is-done');
      card.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  }

  /* ============================================================================
     Un solo bucle de scroll para header, barra móvil y aparición de bloques.
     Se evalúa por posición (no IntersectionObserver): un salto de ancla puede
     mover un elemento de "bajo el viewport" a "sobre el viewport" sin frames
     intermedios, y el observer nunca dispararía.
     ========================================================================= */
  var bar     = $('#mobile-bar');
  var pending = $$('.reveal');
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (reduced) {
    pending.forEach(function (el) { el.classList.add('is-in'); });
    pending = [];
  }

  var revealVisible = function () {
    var limit = window.innerHeight * 0.92;
    var shown = 0;
    for (var i = pending.length - 1; i >= 0; i--) {
      if (pending[i].getBoundingClientRect().top < limit) {
        pending[i].style.transitionDelay = Math.min(shown * 60, 180) + 'ms';
        pending[i].classList.add('is-in');
        pending.splice(i, 1);
        shown++;
      }
    }
  };

  /* La barra aparece solo cuando el formulario quedó fuera de vista. */
  var updateBar = function () {
    if (!bar || !card) return;
    var r = card.getBoundingClientRect();
    var formOut = r.bottom < 72 || r.top > window.innerHeight;
    bar.classList.toggle('is-visible', formOut && window.scrollY > 400);
  };

  var ticking = false;

  var frame = function () {
    header.classList.toggle('is-stuck', window.scrollY > 8);
    if (pending.length) revealVisible();
    updateBar();
  };

  var request = function () {
    if (ticking) return;
    ticking = true;
    var run = function () { if (!ticking) return; ticking = false; frame(); };
    window.requestAnimationFrame(run);
    // Red de seguridad: en una pestaña en segundo plano rAF queda pausado y el
    // flag se quedaría bloqueado. El timeout lo libera sin ejecutar dos veces.
    window.setTimeout(run, 120);
  };

  frame();
  window.addEventListener('scroll', request, { passive: true });
  window.addEventListener('resize', request);
  window.addEventListener('load', frame);
  document.addEventListener('visibilitychange', frame);

})();
