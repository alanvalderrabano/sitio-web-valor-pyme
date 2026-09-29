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

  /* ---------- filtros ---------- */
  var esGratis = function (c) { return /gratuito/i.test(c.modalidad || ''); };
  var esRitmo  = function (c) { return /asincr/i.test(c.modalidad || ''); };
  var esFecha  = function (c) { return !!(c.fecha || c.clases); };

  var FILTROS = {
    todos:  function ()  { return true; },
    gratis: esGratis,
    fecha:  esFecha,
    ritmo:  esRitmo
  };

  /* ---------- tarjeta destacada (los dos programas pagados) ---------- */
  function destacada(c, i) {
    return '<article class="card card--top">' +
      '<div>' +
        '<span class="card__tag card__tag--top">Destacado</span>' +
        '<h3>' + esc(c.titulo) + '</h3>' +
        '<p class="card__para"><b>Dirigido a:</b> ' + esc(c.dirigido) + '</p>' +
        '<p class="card__label">¿Qué aprenderás?</p>' +
        '<p class="card__d">' + esc(c.aprenderas) + '</p>' +
        (c.nota ? '<p class="card__nota">' + esc(c.nota) + '</p>' : '') +
      '</div>' +
      '<div class="card__side">' +
        '<ul class="card__meta"><li>' +
          '<img class="card__ico" src="assets/icon-calendar.svg" alt="" aria-hidden="true">' +
          esc(c.clases) + '</li></ul>' +
        '<div class="card__precio">' +
          '<span class="card__valor-l">Valor:</span>' +
          '<span class="ahora">' + esc(c.valor) + '</span>' +
          (c.dcto ? '<span class="off">' + esc(c.dcto) + '</span>' : '') +
        '</div>' +
        '<button class="puc-btn puc-btn--verde puc-btn--full" data-i="' + i + '">Inscribirme</button>' +
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
        '<button class="puc-btn ' + (gratis ? 'puc-btn--verde' : 'puc-btn--line') + ' puc-btn--full" data-i="' + i + '">Inscribirme</button>' +
      '</div>' +
    '</article>';
  }

  /* ---------- render ---------- */
  var actual = 'todos';

  function pinta() {
    var test = FILTROS[actual] || FILTROS.todos;
    var html = '', n = 0, subtitulo = false;

    CURSOS.forEach(function (c, i) {
      if (!test(c)) return;
      n++;
      // En "Todos" se conserva el segundo encabezado de la página original
      if (actual === 'todos' && !c.destacado && !subtitulo) {
        subtitulo = true;
        html += '<h3 class="cards__grupo">Más cursos, talleres y mentorías</h3>';
      }
      html += c.destacado ? destacada(c, i) : tarjeta(c, i);
    });

    cont.innerHTML = html;
    conteo.textContent = n === CURSOS.length
      ? 'Mostrando los ' + n + ' programas disponibles.'
      : 'Mostrando ' + n + ' de ' + CURSOS.length + ' programas.';
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
      : '<input id="' + f.n + '" name="' + f.n + '" type="' + f.tipo + '"' + attr + '>';
    return '<div class="f' + (f.ancho === 'medio' ? ' f--medio' : '') + '">' +
      '<label for="' + f.n + '">' + esc(f.l) + req + '</label>' + control + '</div>';
  }

  campos.innerHTML = CAMPOS.map(campo).join('');

  /* ---------- "Inscribirme" lleva al formulario con el programa elegido ---------- */
  var sel = document.getElementById('en_cual_curso_te_gustaria_participar_');

  cont.addEventListener('click', function (e) {
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
        'iniciativas del formulario. Escríbelo al contactarnos.';
      elegido.classList.add('form__sel--aviso');
    }
    elegido.hidden = false;
    document.getElementById('contacto').scrollIntoView({ behavior: 'smooth', block: 'start' });
    window.setTimeout(function () {
      document.getElementById('firstname').focus({ preventScroll: true });
    }, 500);
  });

  /* ---------- validación ---------- */
  var form = document.getElementById('form');
  var okMsg = document.getElementById('ok-msg');

  function error(el, msg) {
    el.setAttribute('aria-invalid', 'true');
    var p = el.parentNode.querySelector('.form__err');
    if (!p) { p = document.createElement('p'); p.className = 'form__err'; el.parentNode.appendChild(p); }
    p.textContent = msg;
  }
  function limpia(el) {
    el.removeAttribute('aria-invalid');
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
    form.querySelector('button[type=submit]').disabled = true;
  });

  form.addEventListener('input', function (e) {
    if (e.target.getAttribute('aria-invalid')) limpia(e.target);
  });

  /* ---------- arranque ---------- */
  pinta();
})();
