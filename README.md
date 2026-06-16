# Valor Pyme — Sitio web · Páginas de Rutas (front-end)

Front-end estático de las **4 páginas de Rutas** de Valor Pyme + un hub `index.html`.
Trabajo en subcarpeta de `/Users/alan/Documents/Valor Pyme/`.

## Páginas (`site/`)
| Archivo | Ruta | Color (data-ruta) |
|---|---|---|
| `index.html` | Hub "metro Pyme" | morado corporativo |
| `ruta-capital.html` | Capital · eje financiero | **Amarillo** `#FFF200` |
| `ruta-mercado.html` | Mercado · ventas y logística | **Negro** `#2F2927` |
| `ruta-digitalizacion.html` | Digitalización · procesos | **Rosa** `#FF005B` |
| `ruta-talento.html` | Talento y Gestión · equipo | **Verde** `#00C168` |

Morado corporativo `#6126FF` = conector transversal (navbar, footer, CTA principal, cruces).
Cuando aparecen otras rutas (sección "Continúa tu viaje", combinaciones, hub) cada una usa **su** color.

## Sistema de diseño
- **`styles.css`** — un solo CSS, mobile-first, theming por `body[data-ruta]`. Tokens del `../brand-kit.md`.
- **`script.js`** — header sticky, menú móvil, reveal on-scroll (IntersectionObserver + fallback), parallax suave, dibujo de líneas (stroke-dashoffset), vehículo "journey".
- **Tipografía:** display = `FG Futurist` con fallback `Outfit` (Google Fonts) — ver pendiente P-01. Cuerpo = Arial.
- **Sistema gráfico:** líneas de metro que cruzan las fotos (grupos `lines-svg--back` z1 / foto z2 / `lines-svg--front` z3); estaciones (puntos) solo en cruces. Tira `journey` con el vehículo clásico de cada ruta recorriendo la línea.
- **Movilidad (modelos clásicos):** `assets/img/movilidad-{capital,mercado,digitalizacion,talento}.svg` = bici / tranvía / scooter / globo.

## Assets (`site/assets/`)
- `logos/`, `icons/`, `lines/`, `photos/` → descargados del Figma "Guía de estilo para sitio web".
- `img/` → ilustraciones SVG de movilidad (generadas por el agente vp-image-creator).
- Fotos de referencia (`foto-ref-0X.png`) son del panel "Fotos" del Figma — **verificar licencia de uso web antes de producción** (P-11).

## Cómo previsualizar
```bash
cd "/Users/alan/Documents/Valor Pyme/sitio-web-rutas/site"
python3 -m http.server 4321
# abrir http://localhost:4321/index.html
```
(También configurado en `../.claude/launch.json` como server `vp-rutas`.)

## Agentes de marca creados (`../.claude/agents/`)
- **vp-brand-validator** — lee/valida elementos de marca (logos, colores, tipografías, líneas, botones, foto) desde Figma + brandbook; modo BUILD (genera `brand-kit.md`) y AUDIT (revisa páginas).
- **vp-image-creator** — compone imágenes: fotos reales + duotono de ruta + líneas cruzando (front/back, sin tapar caras) y SVG de movilidad clásica.

## Ronda de feedback v2 (aplicada 2026-06-15)
Heroes con fondo de color de ruta vibrante (H1 −20%, líneas más gruesas/contrastantes, imagen más grande, CTAs legibles) · header morado intenso global (logo blanco) · estaciones con banda vibrante (cards blancas, número y tag vibrantes, 4 en una fila en Digi/Talento) · franja B&N con parallax tras Beneficios · CTA diagnóstico sin líneas, más corto y ancho · journey full-bleed con vehículos bici/teleférico/moto/dirigible. Sin cambios: combinación, beneficios, contenidos, otras rutas, footer.

## Pendientes / decisiones para el cliente
- **Vehículos del journey como imágenes reales:** hoy son SVG (tipo correcto: bici/teleférico/moto/dirigible). Faltan fotos reales con fondo transparente — el cliente debe proveerlas o aprobar sourcing con licencia.
- **Recorte del sujeto en heroes:** para que las líneas pasen entre el fondo y la persona se necesita remoción de fondo de las fotos (pendiente).
- **P-01 (bloquea producción):** licencia web de **FG Futurist**. Hoy se usa `Outfit` como stand-in documentado. Decidir: licenciar FG Futurist o aprobar Outfit.
- **Nav:** estructura con dropdown de Rutas lista; **todos los enlaces no-ruta apuntan a `#`** a la espera de la arquitectura final (presentación de estructura del sitio).
- **Letra ícono Digitalización:** se usa **"D"** (nombre de la ruta). El isotipo histórico del brandbook usa "P" (Productividad). Confirmado por el nombre "Digitalización".
- **Logos de partners:** placeholders `[Nombre]` (Bci, Fintegram, Walmart, BlueExpress, Defontana, etc.). Reemplazar por los SVG reales de `../drive-logos/`.
- **Copys:** provienen de los wireframes low-fi (Figma), **no aprobados aún** por el cliente. Subtítulo de "Beneficios" en Talento venía como *Lorem ipsum* → reemplazado por texto provisional (marcado con comentario `<!-- PENDIENTE -->`).
- **Hex web vs impresión:** se usan los del Figma web (verde `#00C168`, rosa `#FF005B`, amarillo `#FFF200`). El brandbook impreso (Pantone) difiere levemente.
- **og:image:** ruta relativa; al desplegar, cambiar a URL absoluta del dominio.
- **Optimización:** fotos en PNG; recomendable convertir a WebP antes de producción.
