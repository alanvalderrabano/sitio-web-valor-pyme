/* =====================================================================
   PYME UC × VALOR PYME
   Render de tarjetas y formulario. Todos los textos vienen de cursos.js,
   copiados literalmente de la página de referencia.
   ===================================================================== */
(function () {
  'use strict';

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (m) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[m];
    });
  }

  /* ---------- próximos talleres y mentorías ---------- */
  function destacado(c) {
    return '<article class="dest">' +
      '<div class="dest__main">' +
        '<h3>' + esc(c.titulo) + '</h3>' +
        '<p class="dest__dirigido"><b>Dirigido a:</b> ' + esc(c.dirigido) + '</p>' +
        '<p class="dest__label">¿Qué aprenderás?</p>' +
        '<p class="dest__d">' + esc(c.aprenderas) + '</p>' +
        (c.nota ? '<p class="dest__nota">' + esc(c.nota) + '</p>' : '') +
      '</div>' +
      '<div class="dest__side">' +
        '<p class="dest__clases"><img class="card__ico" src="assets/icon-calendar.svg" alt="" aria-hidden="true">' +
          esc(c.clases) + '</p>' +
        '<div class="dest__valor">' +
          '<span class="dest__valor-l">Valor</span>' +
          '<span class="ahora">' + esc(c.valor) + '</span>' +
          (c.dcto ? '<span class="off">' + esc(c.dcto) + '</span>' : '') +
        '</div>' +
        '<a class="puc-btn puc-btn--verde puc-btn--full" href="#contacto">Inscribirme</a>' +
      '</div>' +
    '</article>';
  }

  /* ---------- más cursos, talleres y mentorías ---------- */
  function tarjeta(c) {
    var gratis = /gratuito/i.test(c.modalidad);
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
        (c.valor
          ? '<div class="card__precio"><span class="card__valor-l">Valor:</span><span class="ahora">' + esc(c.valor) + '</span></div>'
          : '<div class="card__precio"><span class="gratis">Gratuito</span></div>') +
        '<a class="puc-btn ' + (gratis ? 'puc-btn--verde' : 'puc-btn--line') + ' puc-btn--full" href="#contacto">Inscribirme</a>' +
      '</div>' +
    '</article>';
  }

  document.getElementById('destacados').innerHTML = (window.PROXIMOS || []).map(destacado).join('');
  document.getElementById('cards').innerHTML = (window.MAS || []).map(tarjeta).join('');

  /* ---------- formulario ---------- */
  var campos = document.getElementById('campos');

  function campo(f) {
    var req = f.req ? ' <em>*</em>' : '';
    var attrReq = f.req ? ' required' : '';
    var control;
    if (f.tipo === 'select') {
      control = '<select id="' + f.n + '" name="' + f.n + '"' + attrReq + '>' +
        '<option value="">Selecciona</option>' +
        f.o.map(function (o) { return '<option value="' + esc(o) + '">' + esc(o) + '</option>'; }).join('') +
        '</select>';
    } else {
      control = '<input id="' + f.n + '" name="' + f.n + '" type="' + f.tipo + '"' + attrReq + '>';
    }
    return '<div class="f' + (f.ancho === 'medio' ? ' f--medio' : '') + '">' +
      '<label for="' + f.n + '">' + esc(f.l) + req + '</label>' + control + '</div>';
  }

  campos.innerHTML = (window.FORM || []).map(campo).join('');

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

    (window.FORM || []).forEach(function (f) {
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
})();
