/* =============================================================================
   LP Valor Pyme × Defontana — comportamiento mínimo
   Solo aparición al scroll. El formulario lo maneja HubSpot.
   La animación es progressive enhancement: sin este archivo, todo se ve igual.
   ========================================================================== */
(function () {
  'use strict';
  var raiz = document.documentElement;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  raiz.classList.add('vpd-anim');

  var pendientes = Array.prototype.slice.call(document.querySelectorAll('.vpd-reveal'));
  if (!pendientes.length) return;

  var enCola = false;

  /* Se evalúa por posición y no con IntersectionObserver: un salto de ancla
     puede mover un bloque de "bajo el viewport" a "sobre el viewport" sin
     frames intermedios, y el observer nunca dispararía. */
  var revisar = function () {
    var limite = window.innerHeight * 0.92;
    var mostrados = 0;
    for (var i = pendientes.length - 1; i >= 0; i--) {
      if (pendientes[i].getBoundingClientRect().top < limite) {
        pendientes[i].style.transitionDelay = Math.min(mostrados * 60, 180) + 'ms';
        pendientes[i].classList.add('vpd-is-in');
        pendientes.splice(i, 1);
        mostrados++;
      }
    }
  };

  var pedir = function () {
    if (enCola) return;
    enCola = true;
    var correr = function () { if (!enCola) return; enCola = false; revisar(); };
    window.requestAnimationFrame(correr);
    window.setTimeout(correr, 120);   // rAF queda pausado en pestañas ocultas
  };

  revisar();
  window.addEventListener('scroll', pedir, { passive: true });
  window.addEventListener('resize', pedir);
  window.addEventListener('load', revisar);
  document.addEventListener('visibilitychange', revisar);
})();
