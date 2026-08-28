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
├── script.js         Validación del formulario y aparición al scroll
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
- **Color plano, sin degradados.** El Brandbook no usa un solo degradado: cada aplicación
  —impresa, packaging y digital— es un bloque de color plano con las cintas encima. La
  página 61, que es la aplicación web, muestra exactamente eso. Las superficies de color
  aquí son dos: corporativo `#6126FF` en el hero y en el CTA final, y morado `#330559`
  en el footer.
- **Sistema gráfico** (cap. 10): la "unidad mínima" es una línea que **cambia de nivel con
  una curva S suave**, con extremos redondeados. Cuatro unidades a distinta altura = las 4
  rutas. Están implementadas como cintas SVG (`stroke-linecap: round`, sin ángulos rectos)
  en el hero y sobre el footer, donde tienen escala para lucirse. **Las cintas son las 4
  rutas** —amarillo Capital, morado Mercado, rosa Digitalización, verde Talento— sobre el
  corporativo, que es el único fondo donde las cuatro se leen: es literalmente la
  composición de la página 49. A tamaño de marcador de sección la curva se aplana y pierde
  sentido, así que ahí no se usa: los antetítulos llevan la barra recta del sitio principal.
- **El punto** `#FFE3CC`: color del logotipo y de los nodos que marcan "unión, partida,
  viaje, conexión" en los cruces de las cintas. No está en la carta Pantone del cap. 07;
  lo tomé de las páginas 49–52.
- **Fotografía**: retrato documental de una dueña de pyme, según el cap. 08.

Todo está en `:root` de `styles.css`: color, tipografía, escala de espaciado de 4,
radios, sombras y layout.

---

## 2. Fidelidad al wireframe

El Figma es la **fuente de verdad** para el orden de los módulos, los textos, los CTAs y el
contenido de cada sección. La página no agrega textos, controles ni bloques que no estén en
el wireframe. Los textos son literales; se verificaron uno a uno contra el frame `2002:10`.

Se retiraron, por decisión de revisión, elementos que se habían propuesto en la primera
versión y que no estaban contemplados:

| Retirado | Estaba para |
|---|---|
| Antetítulos de sección | Orientar en una página larga |
| Selector de solución (tarjetas seleccionables + campo en el formulario) | Unir descubrimiento y conversión |
| Casilla de consentimiento de datos | Tratamiento del RUT y traspaso a Defontana |
| Footer con términos y privacidad | Cierre legal |
| Acordeón del FAQ | Reducir ruido antes del CTA final |
| Barra CTA fija en mobile | Acceso al formulario en una página de ~5.200 px |
| Bajada y nota al pie del formulario | Contexto y confianza |

**Excepción autorizada:** la franja de beneficios del hero —«Suscripción 100% gratuita»,
«Sin compromiso de compra», «Activación en menos de 3 minutos»— se mantiene. Va en blanco
pleno (6.5:1 sobre el corporativo; el blanco al 75% de la primera versión se quedaba en
4.25:1) y con un beneficio por línea, para que no dependa de un salto que se rompa según el
ancho: se comporta igual en 390, 768, 1280 y 1440.

Se conservaron dos cosas que el wireframe no puede expresar, porque son estado o
accesibilidad, no composición:

- **Labels del formulario**, en `.sr-only`. Visualmente la tarjeta es idéntica al Figma
  —solo placeholders—, pero los lectores de pantalla siguen anunciando cada campo. Sin
  esto el formulario es inoperable para quien no ve la pantalla.
- **Validación y confirmación de envío**, incluida la verificación de RUT por módulo 11.
  El wireframe no define estados y un formulario que no responde al enviarse no se puede
  evaluar.

### Riesgos abiertos

- **Sin casilla de consentimiento.** La página pide RUT y datos de contacto y los traspasa
  a un tercero. Antes de producción hay que resolver el consentimiento y la información
  sobre tratamiento de datos que exige la Ley 19.628.
- **Sin enlaces a términos ni política de privacidad**, al no haber footer.

## 3. Responsive

No es el desktop reducido. Lo que cambia de composición:

| | Desktop | Mobile |
|---|---|---|
| Hero | 2 columnas, formulario a la derecha | 1 columna: gancho → beneficio → formulario |
| Soluciones | grilla 2×2 | 1 columna, tarjetas más compactas |
| Pasos | 3 columnas con riel horizontal punteado | línea de tiempo vertical con riel por tramo |
| Comunidad | texto + foto lado a lado | foto primero (ancla visual), luego texto |
| CTA principales | ancho automático | ancho completo |
| Sistema de líneas | cintas de fondo tras la tarjeta | banda de flujo entre argumento y formulario |

Verificado sin scroll horizontal en 390 / 768 / 1280 / 1440.

## 4. Accesibilidad

- HTML semántico: `header / main / section / figure`, un solo `h1`, jerarquía sin saltos.
- Skip link, `:focus-visible` visible en todos los controles, área táctil ≥ 44 px.
- Labels en `.sr-only`: la tarjeta se ve como el Figma y sigue siendo usable con lector de pantalla.
- Errores de formulario con `aria-invalid` y texto, no solo color; confirmación con `aria-live`.
- Contraste AA: blanco sobre corporativo 6.5:1; en las tarjetas, el nombre del producto va
  en el color de acento sobre blanco.
- `prefers-reduced-motion` respetado; la animación de entrada es progressive enhancement.

## 5. Pendientes para producción

- **FG Futurist**: cargar el webfont cuando haya licencia; el `--font-display` ya lo tiene como primera opción.
- **Envío del formulario**: `script.js` marca el punto exacto donde conectar HubSpot o la función serverless.
- **Consentimiento de datos y enlaces legales**: retirados por fidelidad al wireframe; hay
  que resolverlos antes de publicar (ver riesgos abiertos en el punto 2).

- **Fotografía**: la imagen de comunidad es de la biblioteca del sitio, a modo de referencia de estilo.
- **Logo de Defontana**: se usa `assets/logos/defontana.png`, la versión oficial a color. Si
  existe un SVG, conviene cambiarlo para que escale sin pérdida.
