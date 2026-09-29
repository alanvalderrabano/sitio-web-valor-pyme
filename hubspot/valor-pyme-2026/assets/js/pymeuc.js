/* =====================================================================
   PYME UC · página de cursos y mentorías
   Solo interacción: los contenidos los pinta HubL desde los campos de
   cada módulo. Todo va acotado a los bloques .puc-s para no tocar el
   resto del theme.
   ===================================================================== */
(function () {
  'use strict';

  /* ---------- Filtros del catálogo -------------------------------------
     Las cuentas de cada chip se calculan del DOM, así no se desajustan
     si el admin agrega o quita programas desde el editor. */
  document.querySelectorAll('[data-puc-filtros]').forEach(function (seccion) {
    var chips   = seccion.querySelectorAll('.puc-chip');
    var tarjetas = seccion.querySelectorAll('.puc-card[data-filtro]');
    var conteo  = seccion.querySelector('[data-puc-conteo]');
    if (!chips.length || !tarjetas.length) return;

    var total = tarjetas.length;

    function cuantas(f) {
      if (f === 'todos') return total;
      return Array.prototype.filter.call(tarjetas, function (t) {
        return t.getAttribute('data-filtro') === f;
      }).length;
    }

    // Cada chip muestra su propio número y desaparece si no tiene programas
    chips.forEach(function (chip) {
      var n = cuantas(chip.getAttribute('data-f'));
      var marca = chip.querySelector('i');
      if (marca) marca.textContent = n;
      if (!n) chip.hidden = true;
    });

    function aplicar(f) {
      var visibles = 0;
      tarjetas.forEach(function (t) {
        var ok = f === 'todos' || t.getAttribute('data-filtro') === f;
        t.hidden = !ok;
        if (ok) visibles++;
      });
      if (conteo) {
        conteo.textContent = visibles === total
          ? 'Mostrando los ' + visibles + ' programas.'
          : 'Mostrando ' + visibles + ' de ' + total + ' programas.';
      }
    }

    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        chips.forEach(function (o) {
          o.classList.remove('is-on');
          o.setAttribute('aria-pressed', 'false');
        });
        chip.classList.add('is-on');
        chip.setAttribute('aria-pressed', 'true');
        aplicar(chip.getAttribute('data-f'));
      });
    });

    aplicar('todos');
  });

  /* ---------- "Inscribirme" lleva al formulario con el programa elegido --
     El formulario lo pinta HubSpot de forma asíncrona, así que el select
     se busca durante unos segundos en vez de una sola vez. */
  var seccionForm = document.querySelector('[data-puc-form]');
  if (!seccionForm) return;

  var aviso  = seccionForm.querySelector('[data-puc-aviso]');
  var campo  = seccionForm.getAttribute('data-puc-campo') || '';

  function buscarSelect() {
    if (!campo) return null;
    return seccionForm.querySelector('select[name="' + campo + '"]');
  }

  function preseleccionar(valor, intentos) {
    var sel = buscarSelect();
    if (!sel) {
      if (intentos > 0) window.setTimeout(function () { preseleccionar(valor, intentos - 1); }, 200);
      return false;
    }
    var existe = Array.prototype.some.call(sel.options, function (o) { return o.value === valor; });
    if (!existe) return false;
    sel.value = valor;
    sel.dispatchEvent(new Event('change', { bubbles: true }));
    return true;
  }

  document.querySelectorAll('[data-puc-inscribir]').forEach(function (boton) {
    boton.addEventListener('click', function (e) {
      e.preventDefault();
      var titulo   = boton.getAttribute('data-titulo') || '';
      var programa = boton.getAttribute('data-programa') || '';

      if (aviso) {
        if (programa) {
          aviso.innerHTML = 'Estás postulando a <b></b>.';
          aviso.querySelector('b').textContent = titulo;
          aviso.classList.remove('puc-form__sel--aviso');
        } else {
          // El desplegable del formulario no ofrece este programa
          aviso.innerHTML = 'Elegiste <b></b>, pero hoy no aparece entre las iniciativas ' +
            'del desplegable. Envía el formulario igual y te contactamos por ese programa.';
          aviso.querySelector('b').textContent = titulo;
          aviso.classList.add('puc-form__sel--aviso');
        }
        aviso.hidden = false;
      }

      if (programa) preseleccionar(programa, 15);
      seccionForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
})();
