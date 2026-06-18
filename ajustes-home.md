# Ajustes del HOME (pendientes de aplicar en una sola pasada)

> El cliente los va mandando uno por uno; avisará cuando estén TODOS para ejecutarlos juntos. NO aplicar hasta el "ya están todos".

## Lista
2. **Sección 2 ("No tienes que recorrer el camino solo") — la card flotante se encima sobre el texto.**
   - La card overlap (desafíos 01–04) sube demasiado y **tapa el H2** (se corta el "solo." del título). Dar más espacio vertical / reducir el `margin-top` negativo para que NO pise el H2 ni el párrafo.
   - **Alinear arriba** el H2 (columna izquierda) y el `<p>` (columna derecha): hoy el párrafo arranca más arriba que el título. Deben quedar alineados al top (mismo baseline superior).
   - Revisar también en tablet/móvil que no se encime.

3. **Sección "Las 4 rutas" (scroll lateral) — gusta el efecto, ajustar:**
   - **Reducir mucho el espacio vertical** entre: (a) el H2 "Cada empresa tiene desafíos distintos…" + su `<p>`, y (b) el bloque "RECORRE LAS RUTAS" / "Una sola red, cuatro caminos." Hoy hay demasiado aire entre ambos; dejarlos bastante más juntos.
   - **Añadir un indicador de scroll**: algún elemento que denote que la sección se va a recorrer hacia la derecha al hacer scroll hacia abajo (ej. hint "Desliza →", flecha, o cue animado).
   - **Cambiar la línea punteada** que va bajo las cards: NO gusta. Poner en su lugar una **línea ondulada de las de Valor Pyme** (sistema metro) que "salga" y se desplace hacia la derecha conforme avanza el scroll. **Mantenerla a la misma altura abajo** (no que suba ni tape contenido).
   - **Reducir el espacio** entre el final de las cards y el CTA **"Ver todas las rutas"**: hoy hay demasiado aire abajo → mucho menos espacio.

4. **Quitar el journey strip** (la franja blanca con las líneas amarilla/morada onduladas + la bicicleta + los puntos rosa/verde) que va antes del break del Diagnóstico. Eliminar la sección completa. OJO: solo en el HOME; no tocar el journey de las páginas de ruta (rutas.html / ruta-*.html lo siguen usando).

5. **Break del Diagnóstico ("¿No sabes cuál es el mejor camino…?") — quitar el degradado.** Dejar fondo plano de un color del brandbook. Usar el MISMO morado plano que el hero (`#330559`, ajuste #1) para mantener consistencia. Texto blanco + eyebrow amarillo se quedan.

6. **Sección Aliados ("El motor del viaje") — gusta tal cual, solo la línea.** Cambiar la **línea punteada** (beam) que cruza el grid de logos por una **línea ondulada de Valor Pyme** (sistema metro, igual que el ajuste #3). Que **pase por debajo** y **termine casi en la misma posición/largo** que la actual. Todo lo demás queda igual.

7. **Break B&N ("Avanzar también es elegir mejor la siguiente ruta") — parallax más agresivo.** Subir la intensidad del parallax de la foto de fondo (`data-parallax` mayor + más overscan/inset para que no se vean bordes) para que se note claramente que la imagen se desplaza por detrás al hacer scroll. Mantener legible el texto (overlay).

8. **Clímax Comunidad/Suscripción ("Sé parte de la mayor comunidad…") — gusta tal cual, solo quitar el degradado.** Cambiar `--grad-suscripcion` (rosa→morado) por **rosa plano del brandbook `#FF005B`**. Verificar legibilidad sobre rosa plano: texto blanco, eyebrow amarillo, y las cards translúcidas del offer-stack (subir un poco la opacidad/contraste del fondo de las cards si hace falta para que se lean sobre el rosa). Lo demás intacto.

1. **Hero — fondo sin degradado.** Quitar `--grad-hero` (linear-gradient morado) del hero. Dejarlo en **morado plano `#330559`** (morado profundo del brandbook, el tono del lado derecho del degradado actual). No usar otro color que no sea del brandbook. Revisar al aplicar: ¿se quitan también los glows radiales menta/rosa? (probablemente sí, o dejarlos muy sutiles, para que quede "plano"). Texto sigue blanco (contrasta bien sobre #330559).
