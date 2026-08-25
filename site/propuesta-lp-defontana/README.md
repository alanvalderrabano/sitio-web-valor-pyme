# Valor Pyme × Defontana — Propuesta de landing "Suscríbete"

Propuesta de diseño de **alta fidelidad implementada en HTML + CSS**, lista para abrir en el navegador.
No es un mockup: es la página funcionando.

```bash
python3 -m http.server 8790 --directory propuesta-lp-defontana
```

Luego abre `http://localhost:8790`.

```
propuesta-lp-defontana/
├── index.html        HTML semántico, componentizado por secciones
├── styles.css        Sistema de diseño completo en variables CSS
├── script.js         Acordeón, selector de solución, validación, barra CTA móvil
├── variantes-marcador.html   Comparativa de marcadores de sección (registro de decisión)
└── assets/
    ├── logos/        Marca Valor Pyme (SVG)
    └── photos/       Fotografía de estilo documental (Brandbook, cap. 08)
```

---

## 1. De dónde sale cada decisión

| Fuente | Aporta |
|---|---|
| Figma · *Wireframe LP Defontana* | Estructura, jerarquía de contenidos, copy, orden de secciones |
| Brandbook Valor Pyme 2026 | Color, tipografía, radios, sistema gráfico, estilo fotográfico |
| `sitio/styles.css` | Continuidad con el sistema ya implementado del sitio |

El Figma está en gris con Montserrat: es un wireframe de estructura, **no** una referencia visual.
Toda la identidad viene del Brandbook.

### Tokens aplicados desde el Brandbook

- **Corporativo** `#6126FF` (Pantone 2725 C) — color principal, el "azul cálido" del cap. 07.
- **Primarios** morado `#330559`, verde `#00BD70`, rosa `#FF2B5E`, amarillo `#FFF21C`.
- **Secundarios** naranja `#FF8500`, menta `#A6FFD9`, rosa claro `#FFB8DE`.
- **Tipografía display**: FG Futurist (corporativa). Como no hay licencia web, el fallback
  del sistema es **Rubik** — geométrica con gestos redondeados, igual que describe el cap. 06.
- **Tipografía de cuerpo**: **Arial**, la complementaria que el Brandbook define para web.
- **Radios: 0px.** El Brandbook usa terminaciones rectas. Es la decisión que más aleja
  la página del aspecto "template genérico".
- **Sistema gráfico** (cap. 10): la "unidad mínima" es una línea que **cambia de nivel con
  una curva S suave**, con extremos redondeados. Cuatro unidades a distinta altura = las 4
  rutas. Están implementadas como cintas SVG (`stroke-linecap: round`, sin ángulos rectos)
  en el hero y el CTA final, donde tienen escala para lucirse. A tamaño de marcador de
  sección la curva se aplana y pierde sentido, así que ahí no se usa: los antetítulos
  llevan la barra recta del sitio principal.
- **El punto** `#FFE3CC`: color del logotipo y de los nodos que marcan "unión, partida,
  viaje, conexión" en los cruces de las cintas. No está en la carta Pantone del cap. 07;
  lo tomé de las páginas 49–52.
- **Fotografía**: retrato documental de una dueña de pyme, según el cap. 08.

Todo está en `:root` de `styles.css`: color, tipografía, escala de espaciado de 4,
radios, sombras y layout.

---

## 2. Qué cambié respecto del Figma (y por qué)

Estas son mejoras de UX, no cambios de contenido. El copy del wireframe se conserva.

**1 · CTA permanente en el header.**
El wireframe tiene el header solo como lockup de marcas. En una landing de captura el
formulario debe estar siempre a un clic: agregué `Quiero mi descuento` + "Suscripción gratuita".

**2 · Las 4 tarjetas de solución ahora son un selector.**
En el Figma son una lista informativa. Aquí son *radio cards*: elegir una precarga el campo
"¿Qué solución te interesa?" del formulario. Une descubrimiento y conversión, y adelanta
el paso 2 del flujo ("elige tu solución") al momento en que el usuario ya está decidido.
El select y las tarjetas se sincronizan en ambas direcciones.

**3 · Certificado Digital SII, separado del resto.**
Es 30% frente a 15%: no puede tener el mismo peso visual. Se convirtió en una banda morada
con badge amarillo y su propio CTA, que además preselecciona esa opción en el formulario.

**4 · El formulario tiene labels visibles.**
El wireframe usa solo placeholders — desaparecen al escribir y no funcionan con lectores de
pantalla. Además agregué:
- validación en vivo, con RUT chileno verificado por **módulo 11** y autoformato al salir del campo;
- casilla de consentimiento (necesaria para tratar datos y compartirlos con Defontana);
- estado de éxito, que cierra el ciclo sin sacar al usuario de la página;
- microcopy de confianza ("gratis", "sin compromiso", "sin tarjeta").

**5 · Bloque de descuento jerarquizado en el hero.**
"15% a 30%" es el argumento comercial. En el wireframe es una etiqueta suelta; aquí es un
bloque en menta que enumera dónde aplica.

**6 · FAQ en acordeón.**
En el wireframe las tres respuestas están siempre abiertas y compiten con el CTA final.
Acordeón con la primera abierta: se reduce el ruido y se acorta el camino al cierre.

**7 · Los 5 ejes de Valor Pyme, extraídos del párrafo.**
Digitalización, financiamiento, mercado, talento y gestión estaban dentro de un bloque de
texto de cuatro líneas. Como chips con el color de cada ruta son escaneables y conectan
esta landing con el sitio principal.

**8 · Footer.**
El wireframe termina en el CTA. Una landing pública necesita cierre legal y salidas mínimas.

**9 · La banda de cintas es distinta en mobile.**
En desktop corre de fondo por la zona inferior del hero, pasando por detrás de la tarjeta
del formulario ("las líneas interactúan con los elementos de la marca", p. 52). En mobile
no hay lugar de fondo —la tarjeta ocupa casi todo el alto— así que pasa a ser un bloque de
flujo a ancho completo que separa el argumento del formulario y corta un hero muy largo.

**10 · Antetítulos que orientan, no que decoran.**
Cada sección abre con un antetítulo corto —Elige tu solución · Cómo funciona · La comunidad ·
Antes de suscribirte— con la misma barra de 22×3 px que ya usa `sitio/styles.css`
(`.eyebrow::before`), para no abrir un recurso nuevo. Dice en qué parte del recorrido está
el usuario y hace la página escaneable, que es lo que necesita una landing larga.
`variantes-marcador.html` deja registradas las alternativas que se evaluaron.

**11 · Barra CTA fija en mobile.**
La página mide ~6.600 px en 390 px de ancho. Aparece al salir del formulario y se oculta
cuando el formulario vuelve a estar a la vista.

---

## 3. Responsive

No es el desktop reducido. Lo que cambia de composición:

| | Desktop | Mobile |
|---|---|---|
| Hero | 2 columnas, formulario a la derecha | 1 columna: gancho → beneficio → formulario |
| Soluciones | grilla 2×2 | 1 columna, tarjetas más compactas |
| Pasos | 3 columnas con riel horizontal punteado | línea de tiempo vertical con riel por tramo |
| Comunidad | texto + foto lado a lado | foto primero (ancla visual), luego texto |
| CTA principales | ancho automático | ancho completo |
| Navegación | CTA en header | barra fija inferior |
| Sistema de líneas | cintas de fondo tras la tarjeta | banda de flujo entre argumento y formulario |

Verificado sin scroll horizontal en 390 / 768 / 1280 / 1440.

---

## 4. Accesibilidad

- HTML semántico: `header / main / section / fieldset / figure / footer`, un solo `h1`, jerarquía sin saltos.
- Skip link, `:focus-visible` visible en todos los controles, área táctil ≥ 44 px.
- Acordeón con `aria-expanded` / `aria-controls`; estado de éxito con `aria-live`.
- Errores de formulario con `aria-invalid` y texto, no solo color.
- Contraste AA verificado en los badges de descuento: sobre verde, rosa y naranja el texto
  va en morado oscuro (`#1B0630`), no en blanco — blanco sobre esos tonos no alcanza 4.5:1.
- `prefers-reduced-motion` respetado.

---

## 5. Pendientes para producción

- **Logo de Defontana**: hoy es un lockup tipográfico. Reemplazar por el SVG oficial en `.cobrand__partner`.
- **FG Futurist**: cargar el webfont cuando haya licencia; el `--font-display` ya lo tiene como primera opción.
- **Envío del formulario**: `script.js` marca el punto exacto donde conectar HubSpot o la función serverless.
- **Fotografía**: la imagen de comunidad es de la biblioteca del sitio, a modo de referencia de estilo.
