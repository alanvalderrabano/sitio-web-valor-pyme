# Spec de rediseño visual + motion del HOME

> Objetivo: subir el home de "correcto pero normal" al nivel de la landing **/suscripcion** (la que le encantó al cliente). Mantener **el contenido y la estructura ya aprobados** (8 secciones, copy del blueprint) y **encima** aplicar: breaks de secciones a todo color, parallax con foto B&N, scroll horizontal anclado, y mucho más movimiento con el scroll. Extraído del CSS real de valorpyme.cl/suscripcion (HubSpot). **Sin librerías pesadas** (no GSAP/Lenis): todo CSS `@keyframes` + `position:sticky` + el motor de parallax/reveal que ya tenemos en `script.js`.

## Tokens de color EXACTOS (añadir a `:root` en styles.css)
```
--grad-hero: linear-gradient(135deg,#6126FF,#4B16DD 46%,#330559);
--grad-suscripcion: linear-gradient(120deg,#FF0058,#6126FF 48%,#330559);
--glow-mint: radial-gradient(circle at 82% 12%, rgba(166,255,217,.25), transparent 60%);
--glow-rosa: radial-gradient(circle at 12% 76%, rgba(255,0,88,.32), transparent 55%);
--c-rosa:#FF0058; --c-verde:#00C168; --c-amarillo:#FFF21C; --c-morado:#6126FF; --c-morado-deep:#330559;
--c-lavanda:#EFE9FF; --c-mint:#A6FFD9; --c-dark:#161616; --c-dark2:#241B2B;
```
(Reusar las variables de marca que ya existan; estas son los valores objetivo.)

## Ritmo de color por sección (los "breaks completos de color" que pidió)
Alternar fondos full-bleed, cada uno con titular display GRANDE + eyebrow uppercase pequeño + (donde aplique) cards translúcidas sobre el color:
1. **Hero** — fondo `--grad-hero` + glows (`--glow-mint`, `--glow-rosa`) en parallax. Texto blanco.
2. **"No tienes que recorrer el camino solo"** — fondo **blanco/crema**, con **card flotante** que se monta sobre el borde hero→blanco (técnica overlap, ver §Componentes).
3. **Las 4 rutas** — fondo **lavanda `#EFE9FF`**, en **scroll horizontal anclado** (ver §Motion 4).
4. **Diagnóstico** — **break morado** `--grad-hero` (o morado plano) full-bleed, texto blanco, con vehículo journey.
5. **Aliados** — fondo **blanco**, grid de logos con haz de luz (beam) recorriendo una línea de metro de fondo.
6. **Break B&N (NUEVO)** — fondo **oscuro `#161616`** con **foto documental B&N en parallax** (`assets/img/franja-bn-*.jpg`, p.ej. `franja-bn-mercado.jpg`), overlay degradado, titular display blanco: *"Avanzar también es elegir mejor la siguiente ruta."* eyebrow *"Empresas en constante movimiento"*. Es el parallax B&N que pidió explícitamente.
7. **Comienza en 3 pasos** — **break verde `#00C168`** full-bleed, 3 cards translúcidas (números en círculo blanco), texto blanco.
8. **Comunidad/Suscripción** — **break gradiente `--grad-suscripcion`** (rosa→morado), clímax, offer-stack en cards translúcidas, CTA blanco prominente.
9. **FAQ** — fondo **lavanda** o blanco; acordeón con acento morado. **Footer** morado profundo (ya existe).

Resultado: morado→blanco→lavanda→morado→blanco→oscuro→verde→rosa→lavanda→morado. Muchos breaks, como /suscripcion.

## Componentes a portar de /suscripcion
- **Card flotante / overlap:** contenedor blanco con `margin-top` negativo que pisa el borde de la sección anterior, `box-shadow` suave, grid de items numerados (01–04). Úsalo en la sección 2 para los 4 desafíos/beneficios.
- **Cards translúcidas sobre color:** `background: rgba(255,255,255,.12)`, `border:1px solid rgba(255,255,255,.22)`, `backdrop-filter: blur(6px)`, texto blanco. Para secciones 7 (verde) y 8 (rosa).
- **Eyebrow uppercase** chico (letter-spacing alto) en color de acento (rosa sobre morado, morado sobre claro).
- **Tipografía display MÁS GRANDE** y con leading ajustado (clamp). El home actual se queda corto: subir el H1 y los H2 de sección a tamaños tipo `clamp(2.4rem, 6vw, 5rem)` para el hero y `clamp(2rem,4.5vw,3.4rem)` para H2 de break.

## Motion (todo CSS keyframes + sticky + el parallax/reveal existente)
1. **Hero orbit** (firma de la marca): anillos concéntricos rotando + pills de estación flotando. Keyframes reales:
   - `@keyframes orbit-spin{to{transform:rotate(1turn)}}` → dos `.orbit-ring` (uno blanco 38% inset:12%, otro amarillo 55% inset:24%, contrarrotando: `animation-direction:reverse;animation-duration:14s` el segundo, 18s el primero).
   - `@keyframes route-square-orbit{0%,100%{left:12%;top:10%}25%{left:86%;top:24%}50%{left:80%;top:84%}75%{left:10%;top:72%}}` con `transform:translate3d(-50%,-50%,0)` → cada pill ("Ruta Capital/Mercado/Digitalización/Talento", en su color) orbita con distinta duración/delay.
   - `@keyframes lateral-dot{0%,100%{opacity:.55;transform:translateX(0)}55%{opacity:1;transform:translateX(14px)}}` → punto que viaja por una línea.
   - Las pills mantienen los colores de ruta (amarillo/morado/rosa/verde) — refuerza el sistema metro.
2. **Scroll-reveal** stagger (ya existe `.reveal`/`.d1..d4`) en cada sección.
3. **Parallax** (ya existe motor `data-parallax` en script.js): aplicarlo a los glows del hero y a la **foto B&N** del break oscuro (`data-parallax="1.05"`, inset negativo), como la "Franja B&N" de las rutas.
4. **Scroll horizontal anclado** para las 4 rutas (lo más vistoso):
   - `.route-scroll-sticky{position:sticky;top:68px;height:calc(100svh - 68px);overflow:hidden;background:#EFE9FF}` dentro de un wrapper alto (p.ej. `300vh`).
   - JS: calcular progreso de scroll del wrapper y `translateX` el riel de cards (heading fijo a la izquierda tipo `.ecosystem-layout` grid `0.72fr / 1.28fr`; cards entran por la derecha). Reusar/portar el patrón.
   - Línea de metro SVG conectando las cards con `@keyframes ecosystem-beam-flow{to{stroke-dashoffset:0}}` (stroke-dasharray + dashoffset → haz que "fluye").
   - **Responsive:** en móvil/tablet desactivar el sticky → `position:relative;height:auto;overflow:visible` y apilar las cards verticalmente (como hace /suscripcion).
5. **Banda de tren/vehículo** (opcional, refuerzo): `.train-motion{background:#161616;height:clamp(150px,17vw,245px);overflow:hidden}` con `@keyframes train-advance{0%{transform:translateX(calc(-50% - 90px))}to{transform:translateX(calc(-50% + 90px))}}` usando un `veh-*.png`. Puede fusionarse con el journey strip que ya existe.
6. **Contador** para "+150.000 visitas al mes" (count-up al entrar en viewport).
7. **Hover lift** en cards; logos grayscale→color (ya existe).
8. **`@media (prefers-reduced-motion: reduce)`**: apagar orbits/auto-anim y dejar el contenido estático y legible.

## Reglas
- **No romper** el contenido/copy/CTAs/SEO ya aprobados (un solo H1, JSON-LD, meta). Solo cambian envoltura visual y motion.
- Reutilizar el design system y el header/footer; ampliar `styles.css` (no romper `rutas.html`, que comparte el archivo — usar clases nuevas namespaced `home-*`/`hp-*` para lo nuevo; no alterar `.route-card`, `.hero`, `.journey`, `.diag` que usa rutas.html, o si se extienden, hacerlo sin regresión).
- Mantener peso razonable; `loading="lazy"` salvo hero; respetar `prefers-reduced-motion`.
- Versionar `<script src="script.js?v=N">` al tocar JS.
- Coherencia con la marca metro/movilidad y con /suscripcion (mismo aire), pero sin copiar literal sus textos: usar el copy del home ya aprobado.

## Assets disponibles (verificados)
- Fotos: `assets/photos/foto-ref-01..08.png`. B&N: `assets/img/franja-bn-{capital,mercado,digitalizacion,talento}.jpg`.
- Vehículos: `assets/img/veh-{capital,mercado,digitalizacion,talento}.png`. SVGs movilidad: `assets/img/movilidad-*.svg`.
- Logos partners: `assets/logos/partners/` (13). Logos marca: dark/white.
- **Falta** (no inventar): foto de metro/tren real como la de /suscripcion (usar nuestras B&N en su lugar); logo Multigremial; logo correcto de "omIA" (el archivo actual `omia.png` muestra "organizaMe" → dejar fuera o pedir el correcto).
