# Brand fix 2 — cumplir el brandbook oficial (esquinas, estaciones, íconos, fotos)

> Ya se aplicó (commit previo): colores de ruta oficiales (#FFF21C/#330559/#FF2B5E/#00BD70) + fuente Rubik. Ahora faltan estos 4 frentes, en **las 6 páginas** (home + rutas + 4 ruta-*). Mantener todo lo demás. Versionar `styles.css?v=11`.

## 1. ESQUINAS 100% RECTAS (0px) — decisión del cliente
El brandbook pide evitar módulos redondeados ("terminaciones rectas, modernidad"). **Cuadrar TODO a 0px**:
- En `:root`: `--radius-xl/--radius-lg/--radius-md/--radius-sm/--radius-pill` → **0**.
- Reemplazar TODO `border-radius: <Npx>` por `border-radius: 0` en `styles.css` (cards, botones, tags, badges, photo-frame, inputs, FAQ, hero-badge, pills del orbit, logo-cells, etc.).
- También en estilos inline de los HTML (`style="border-radius:..."`).
- **EXCEPCIÓN — conservar círculos:** lo que es `border-radius: 50%` (puntos/estaciones, dots con letra, avatares, anillos del orbit) se queda circular. Las imágenes de íconos de ruta (ver §3) son circulares por sí mismas. NO cuadrar los círculos.
- Botones: pasan a rectángulos (0px), es la intención.

## 2. ESTACIONES (PUNTOS) BLANCAS
Regla del brandbook: "el punto que marca una estación es blanco, no de otros colores".
- Home: `.hp-orbit__dot` (el punto del orbit) → **blanco**.
- Páginas de ruta y `rutas.html`: los `.journey__dot` que hoy usan `background:var(--ruta)` / `var(--color-corp)` / etc. → **#FFFFFF** (todos blancos).
- Los `<circle class="station ...">` de los SVG de hero (en `rutas.html` y `ruta-*.html`) que hoy tienen `fill:var(--color-...)` → **fill:#FFFFFF**.
- Las LÍNEAS siguen con su color; solo los **puntos** son blancos. (Si un punto blanco sobre fondo claro queda invisible, darle un borde sutil del color de la línea, pero el relleno es blanco.)

## 3. ÍCONOS OFICIALES DE RUTA (reemplazar las letras C/M/D/T)
Assets ya descargados y optimizados en **`site/assets/icons/rutas/`**: `ruta-capital.png`, `ruta-mercado.png`, `ruta-digitalizacion.png`, `ruta-talento.png` (PNG circular con transparencia, ~160px, el color de ruta ya viene en el ícono).
- **Home — route cards** (`.hp-rcard__dot` con letra C/M/D/T): reemplazar el `<span class="hp-rcard__dot">X</span>` por `<img class="hp-rcard__icon" src="assets/icons/rutas/ruta-<ruta>.png" alt="" width="48" height="48">`. Ajustar CSS (quitar el fondo de color del dot; el ícono ya lo trae).
- **Dropdown del nav** (las 6 páginas): los `.drop-route__dot` con letra → mismo ícono, tamaño ~28–32px.
- **Páginas de ruta** (`ruta-*.html`): donde haya el badge/letra de la ruta (hero `.hero__badge .rline`, dots), usar el ícono oficial de ESA ruta. El brandbook dice: incorporar los íconos de ruta en las landings de soluciones.
- Mantener proporción, no deformar. Los íconos ya son circulares (no cuadrar).

## 4. FOTOGRAFÍAS (estilo documental del brandbook)
11 fotos optimizadas en **`site/assets/photos/brand/`** (`p01.jpg`..`p11.jpg`, ~1600px). Son emprendedores reales en sus locales/talleres (documental, varias luminosas) — cumplen el brandbook. Reemplazar las fotos actuales por estas donde apliquen:
- **Heroes de ruta** (foto grande del hero): usar luminosas/retratos:
  - Ruta Capital → `p08.jpg` (mujer con laptop, oficina luminosa) o `p03.jpg`.
  - Ruta Mercado → `p05.jpg` (mujer empacando cajas en tienda — ideal ventas/logística).
  - Ruta Digitalización → `p03.jpg` (personas frente al computador).
  - Ruta Talento y Gestión → `p04.jpg` (emprendedora en su local, sonriendo) o `p06.jpg`.
- **Banda B&N del home** (`franja-bn-mercado.jpg`): reemplazar por `p11.jpg` o `p02.jpg` (más documental/dramática; se ve desaturada de todos modos).
- **Fotos secundarias** de las páginas de ruta (descripción del eje, etc.): usar las restantes (`p01, p06, p07, p10`) con criterio documental.
- Redimensionar/recortar cada una al tamaño del slot (no servir 1600px si el slot es chico). `loading="lazy"` salvo la del hero. `alt` descriptivo en español. Evitar fotos con símbolos culturales locales (no aplica aquí).

## Reglas
- No tocar el copy (ya quedó del doc). No romper motion/scroll/layout; solo lo de arriba.
- Cuidar regresión entre páginas (estilos compartidos). Verificar en preview `:4399` los 4 viewports (1440/1280/768/390) home + `rutas.html` + `ruta-capital.html` al menos.
- Un solo `<h1>` por página. Footer #2F2927.
- Versionar `styles.css?v=11` en las 6 páginas. Optimizar peso (las fotos de ruta deben pesar poco; el home no debe dispararse).
- **Reportar**: si algún punto blanco queda invisible sobre fondo claro, cómo lo resolviste; y si falta mapear algún ícono/foto.
