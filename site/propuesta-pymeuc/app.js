/* =====================================================================
   PYME UC × VALOR PYME — catálogo y formulario
   Todo se genera desde window.CURSOS (cursos.js): las tarjetas y el
   desplegable del formulario leen la MISMA lista, así no pueden
   desincronizarse como ocurre hoy en la página en producción.
   ===================================================================== */
(function () {
  'use strict';

  var CURSOS = window.CURSOS || [];
  var cont   = document.getElementById('cards');
  var conteo = document.getElementById('conteo');
  var sel    = document.getElementById('programa');
  var elegido= document.getElementById('elegido');

  /* ---------- utilidades ---------- */
  function plata(v, moneda) {
    if (!v) return 'Gratis';
    if (moneda === 'USD') return 'USD $' + v;
    return '$' + v.toLocaleString('es-CL');
  }
  function final(c) {
    return c.dcto ? Math.round(c.precio * (1 - c.dcto / 100)) : c.precio;
  }
  function esc(s) {
    return String(s || '').replace(/[&<>"]/g, function (m) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[m];
    });
  }

  /* ---------- filtros ---------- */
  var FILTROS = {
    todos:  function ()  { return true; },
    gratis: function (c) { return c.precio === 0; },
    fecha:  function (c) { return c.mod !== 'async'; },
    ritmo:  function (c) { return c.mod === 'async'; }
  };

  /* ---------- tarjeta ---------- */
  function meta(c) {
    var li = [];
    if (c.fecha) li.push('<li><img class="card__ico" src="assets/icon-calendar.svg" alt="" aria-hidden="true"><b>' + esc(c.fecha) + '</b></li>');
    if (c.hora)  li.push('<li><img class="card__ico" src="assets/icon-clock.svg" alt="" aria-hidden="true"><b>' + esc(c.hora) + '</b></li>');
    if (!c.fecha && !c.hora) li.push('<li><img class="card__ico" src="assets/icon-clock.svg" alt="" aria-hidden="true"><b>Empiezas cuando quieras, a tu propio ritmo</b></li>');
    return '<ul class="card__meta">' + li.join('') + '</ul>';
  }

  function precio(c) {
    if (c.precio === 0) {
      return '<div class="card__precio"><span class="gratis">Gratis</span></div>';
    }
    var f = final(c);
    var h = '<div class="card__precio"><span class="ahora">' + plata(f, c.moneda) + '</span>';
    if (c.dcto) {
      h += '<span class="antes">' + plata(c.precio, c.moneda) + '</span>' +
           '<span class="off">−' + c.dcto + '% comunidad</span>';
    }
    return h + '</div>';
  }

  function tarjeta(c, i) {
    var free = c.precio === 0;
    var cls  = 'card' + (c.destacado ? ' card--top' : (free ? ' card--free' : ''));
    var tag  = c.destacado ? '<span class="card__tag card__tag--top">Destacado</span>'
             : free        ? '<span class="card__tag card__tag--free">Taller gratuito</span>'
                           : '<span class="card__tag">' + esc(c.modTxt) + '</span>';

    var cuerpo =
      tag +
      '<p class="card__hook">' + esc(c.hook) + '</p>' +
      '<h3>' + esc(c.t) + '</h3>' +
      '<p class="card__d">' + esc(c.d) + '</p>' +
      (c.para ? '<p class="card__para">Para ' + esc(c.para) + '</p>' : '');

    var pie =
      '<div class="card__foot">' +
        (c.destacado ? '' : '') +
        precio(c) +
        '<button class="puc-btn ' + (free ? 'puc-btn--verde' : 'puc-btn--line') + ' puc-btn--full" data-i="' + i + '">' +
          (free ? 'Reservar mi cupo' : 'Quiero este programa') +
        '</button>' +
        (c.nota ? '<p class="card__nota">' + esc(c.nota) + '</p>' : '') +
      '</div>';

    if (c.destacado) {
      return '<article class="' + cls + '">' +
               '<div>' + cuerpo + '<p class="card__nota" style="margin:0">' + esc(c.modTxt) + '</p></div>' +
               '<div class="card__side">' + meta(c) + pie + '</div>' +
             '</article>';
    }
    return '<article class="' + cls + '">' + cuerpo + meta(c) + pie + '</article>';
  }

  /* ---------- render ---------- */
  var actual = 'todos';

  function pinta() {
    var test = FILTROS[actual] || FILTROS.todos;
    var html = '', n = 0;
    CURSOS.forEach(function (c, i) {
      if (!test(c)) return;
      n++;
      html += tarjeta(c, i);
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

  /* ---------- CTA de tarjeta → preselecciona el programa en el form ---------- */
  cont.addEventListener('click', function (e) {
    var b = e.target.closest('button[data-i]');
    if (!b) return;
    var c = CURSOS[+b.dataset.i];
    if (!c) return;
    sel.value = c.t;
    elegido.hidden = false;
    elegido.innerHTML = 'Estás postulando a <b>' + esc(c.t) + '</b>. Puedes cambiarlo abajo.';
    document.getElementById('contacto').scrollIntoView({ behavior: 'smooth', block: 'start' });
    window.setTimeout(function () { document.getElementById('nombre').focus({ preventScroll: true }); }, 500);
  });

  /* ---------- desplegable del formulario: mismo origen que las tarjetas ---------- */
  function opciones() {
    var h = '<option value="">Selecciona un programa</option>';
    var grupos = [
      ['Talleres gratuitos', function (c) { return c.precio === 0; }],
      ['Cursos online a tu ritmo', function (c) { return c.mod === 'async'; }],
      ['Programas con descuento comunidad', function (c) { return c.precio > 0 && c.mod !== 'async'; }]
    ];
    grupos.forEach(function (g) {
      var items = CURSOS.filter(g[1]);
      if (!items.length) return;
      h += '<optgroup label="' + g[0] + '">';
      items.forEach(function (c) { h += '<option value="' + esc(c.t) + '">' + esc(c.t) + '</option>'; });
      h += '</optgroup>';
    });
    h += '<option value="__otro">Todavía no lo tengo claro, quiero orientación</option>';
    sel.innerHTML = h;
  }

  /* ---------- validación ---------- */
  var form = document.getElementById('form');
  var okMsg = document.getElementById('ok-msg');

  function error(campo, msg) {
    campo.setAttribute('aria-invalid', 'true');
    var p = campo.parentNode.querySelector('.form__err');
    if (!p) {
      p = document.createElement('p');
      p.className = 'form__err';
      campo.parentNode.appendChild(p);
    }
    p.textContent = msg;
  }
  function limpia(campo) {
    campo.removeAttribute('aria-invalid');
    var p = campo.parentNode.querySelector('.form__err');
    if (p) p.remove();
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var malo = null;
    [
      [sel, 'Elige el programa que te interesa'],
      [document.getElementById('nombre'), 'Escribe tu nombre'],
      [document.getElementById('empresa'), 'Escribe el nombre de tu empresa'],
      [document.getElementById('email'), 'Escribe un correo válido'],
      [document.getElementById('fono'), 'Escribe tu teléfono']
    ].forEach(function (par) {
      var campo = par[0], v = campo.value.trim();
      var mal = !v || (campo.type === 'email' && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v));
      if (mal) { error(campo, par[1]); if (!malo) malo = campo; }
      else limpia(campo);
    });

    var ok = document.getElementById('ok');
    if (!ok.checked) {
      error(ok, 'Necesitamos tu autorización para contactarte');
      if (!malo) malo = ok;
    } else limpia(ok);

    if (malo) { malo.focus(); return; }
    okMsg.hidden = false;
    form.querySelector('button[type=submit]').disabled = true;
  });

  form.addEventListener('input', function (e) {
    if (e.target.getAttribute('aria-invalid')) limpia(e.target);
  });

  /* ---------- arranque ---------- */
  opciones();
  pinta();
})();
