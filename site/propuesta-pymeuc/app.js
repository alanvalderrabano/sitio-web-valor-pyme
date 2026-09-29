/* =====================================================================
   PYME UC × VALOR PYME
   Catálogo unificado y formulario. Todos los textos salen de cursos.js,
   copiados literal de la página de referencia; aquí solo se decide
   cómo se muestran.
   ===================================================================== */
(function () {
  'use strict';

  var CURSOS = window.CURSOS || [];
  var CAMPOS = window.FORM || [];

  var cont    = document.getElementById('cards');
  var conteo  = document.getElementById('conteo');
  var elegido = document.getElementById('elegido');

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (m) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[m];
    });
  }

  /* ---------- filtros (solo sobre "Más cursos, talleres y mentorías") ---------- */
  var esGratis = function (c) { return /gratuito/i.test(c.modalidad || ''); };
  var esRitmo  = function (c) { return /asincr/i.test(c.modalidad || ''); };

  var FILTROS = {
    todos:  function ()  { return true; },
    gratis: esGratis,
    ritmo:  esRitmo
  };

  var DESTACADOS = CURSOS.filter(function (c) { return c.destacado; });
  var RESTO      = CURSOS.filter(function (c) { return !c.destacado; });

  /* ---------- tarjeta destacada (los dos programas pagados) ---------- */
  function destacada(c, i) {
    return '<article class="dest">' +
      '<div class="dest__main">' +
        '<h3>' + esc(c.titulo) + '</h3>' +
        '<p class="dest__dirigido"><b>Dirigido a:</b> ' + esc(c.dirigido) + '</p>' +
        '<p class="dest__label">¿Qué aprenderás?</p>' +
        '<p class="dest__d">' + esc(c.aprenderas) + '</p>' +
        (c.nota ? '<p class="dest__nota">' + esc(c.nota) + '</p>' : '') +
      '</div>' +
      '<div class="dest__side">' +
        '<p class="dest__clases">' +
          '<img class="card__ico" src="assets/icon-calendar.svg" alt="" aria-hidden="true">' +
          '<span>' + esc(c.clases) + '</span></p>' +
        '<p class="dest__valor">' +
          '<span class="card__valor-l">Valor</span>' +
          '<span class="ahora">' + esc(c.valor) + '</span>' +
          (c.dcto ? '<span class="off">' + esc(c.dcto) + '</span>' : '') +
        '</p>' +
        '<button class="puc-btn puc-btn--verde puc-btn--full" data-i="' + i + '"' +
          ' aria-label="Inscribirme en ' + esc(c.titulo) + '">Inscribirme</button>' +
      '</div>' +
    '</article>';
  }

  /* ---------- tarjeta normal ---------- */
  function tarjeta(c, i) {
    var gratis = esGratis(c);
    var meta = [];
    if (c.fecha) meta.push('<li><img class="card__ico" src="assets/icon-calendar.svg" alt="" aria-hidden="true">' + esc(c.fecha) + '</li>');
    if (c.hora)  meta.push('<li><img class="card__ico" src="assets/icon-clock.svg" alt="" aria-hidden="true">' + esc(c.hora) + '</li>');

    return '<article class="card' + (gratis ? ' card--free' : '') + '">' +
      '<span class="card__tag' + (gratis ? ' card__tag--free' : '') + '">' + esc(c.modalidad) + '</span>' +
      '<p class="card__hook">' + esc(c.hook) + '</p>' +
      '<h3>' + esc(c.titulo) + '</h3>' +
      '<p class="card__d">' + esc(c.d) + '</p>' +
      (meta.length ? '<ul class="card__meta">' + meta.join('') + '</ul>' : '') +
      '<div class="card__foot">' +
        '<div class="card__precio">' +
          (c.valor
            ? '<span class="card__valor-l">Valor:</span><span class="ahora">' + esc(c.valor) + '</span>'
            : '<span class="gratis">Gratuito</span>') +
        '</div>' +
        '<button class="puc-btn ' + (gratis ? 'puc-btn--verde' : 'puc-btn--line') + ' puc-btn--full"' +
          ' data-i="' + i + '" aria-label="Inscribirme en ' + esc(c.titulo) + '">Inscribirme</button>' +
      '</div>' +
    '</article>';
  }

  /* ---------- render ---------- */
  var actual = 'todos';
  var contDest = document.getElementById('destacados');

  contDest.innerHTML = DESTACADOS
    .map(function (c) { return destacada(c, CURSOS.indexOf(c)); }).join('');

  function pinta() {
    var test = FILTROS[actual] || FILTROS.todos;
    var html = '', n = 0;

    RESTO.forEach(function (c) {
      if (!test(c)) return;
      n++;
      html += tarjeta(c, CURSOS.indexOf(c));
    });

    cont.innerHTML = html;
    conteo.textContent = n === RESTO.length
      ? 'Mostrando los ' + n + ' programas.'
      : 'Mostrando ' + n + ' de ' + RESTO.length + ' programas.';
  }

  document.querySelectorAll('.chip').forEach(function (b) {
    b.addEventListener('click', function () {
      document.querySelectorAll('.chip').forEach(function (o) {
        o.classList.remove('is-on');
        o.setAttribute('aria-pressed', 'false');
      });
      b.classList.add('is-on');
      b.setAttribute('aria-pressed', 'true');
      actual = b.dataset.f;
      pinta();
    });
  });

  /* ---------- formulario ---------- */
  var campos = document.getElementById('campos');

  function campo(f) {
    var req = f.req ? ' <em>*</em>' : '';
    var attr = f.req ? ' required' : '';
    var control = f.tipo === 'select'
      ? '<select id="' + f.n + '" name="' + f.n + '"' + attr + '><option value="">Selecciona</option>' +
        f.o.map(function (o) { return '<option value="' + esc(o) + '">' + esc(o) + '</option>'; }).join('') + '</select>'
      : '<input id="' + f.n + '" name="' + f.n + '" type="' + f.tipo + '"' +
        (f.ac ? ' autocomplete="' + f.ac + '"' : '') + attr + '>';
    return '<div class="f' + (f.ancho === 'medio' ? ' f--medio' : '') + '">' +
      '<label for="' + f.n + '">' + esc(f.l) + req + '</label>' + control + '</div>';
  }

  campos.innerHTML = CAMPOS.map(campo).join('');

  /* ---------- "Inscribirme" lleva al formulario con el programa elegido ---------- */
  var sel = document.getElementById('en_cual_curso_te_gustaria_participar_');

  function alPulsar(e) {
    var b = e.target.closest('button[data-i]');
    if (!b) return;
    var c = CURSOS[+b.dataset.i];
    if (!c) return;

    if (c.opcion) {
      sel.value = c.opcion;
      elegido.innerHTML = 'Estás postulando a <b>' + esc(c.titulo) + '</b>.';
      elegido.classList.remove('form__sel--aviso');
    } else {
      // La página de referencia no ofrece este programa en el desplegable
      sel.value = '';
      elegido.innerHTML = 'Elegiste <b>' + esc(c.titulo) + '</b>, pero hoy no aparece entre las ' +
        'iniciativas del desplegable. Envía el formulario igual y te contactamos por ese programa.';
      elegido.classList.add('form__sel--aviso');
    }
    elegido.hidden = false;
    document.getElementById('contacto').scrollIntoView({ behavior: 'smooth', block: 'start' });
    window.setTimeout(function () {
      document.getElementById('firstname').focus({ preventScroll: true });
    }, 500);
  }
  cont.addEventListener('click', alPulsar);
  contDest.addEventListener('click', alPulsar);

  /* ---------- validación ---------- */
  var form = document.getElementById('form');
  var okMsg = document.getElementById('ok-msg');

  function error(el, msg) {
    el.setAttribute('aria-invalid', 'true');
    var p = el.parentNode.querySelector('.form__err');
    if (!p) {
      p = document.createElement('p');
      p.className = 'form__err';
      p.id = el.id + '-err';
      el.parentNode.appendChild(p);
    }
    p.textContent = msg;
    el.setAttribute('aria-describedby', p.id);
  }
  function limpia(el) {
    el.removeAttribute('aria-invalid');
    el.removeAttribute('aria-describedby');
    var p = el.parentNode.querySelector('.form__err');
    if (p) p.remove();
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var primero = null;

    CAMPOS.forEach(function (f) {
      var el = document.getElementById(f.n);
      var v = el.value.trim();
      var mal = (f.req && !v) || (f.tipo === 'email' && v && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v));
      if (mal) {
        error(el, f.tipo === 'email' && v ? 'Escribe un correo válido' : 'Este campo es obligatorio');
        if (!primero) primero = el;
      } else limpia(el);
    });

    var ok = document.getElementById('consentimiento');
    if (!ok.checked) { error(ok, 'Necesitamos tu autorización'); if (!primero) primero = ok; }
    else limpia(ok);

    if (primero) { primero.focus(); return; }
    okMsg.hidden = false;
    okMsg.focus();
    form.querySelector('button[type=submit]').disabled = true;
  });

  form.addEventListener('input', function (e) {
    if (e.target.getAttribute('aria-invalid')) limpia(e.target);
  });

  /* ---------- arranque ---------- */
  pinta();
})();
