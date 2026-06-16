# Brand Kit — Valor Pyme
**Fuente canónica:** Figma "Guía de estilo para sitio web" (fileKey `ioGnv4HcTegm9jEfm84Vrn`, nodo `5-809`)
**Última verificación:** 2026-06-15

---

## 1. Paleta de Colores

### 1.1 Color Corporativo

| Nombre Figma | Hex | Variable CSS | Uso |
|---|---|---|---|
| Color Corporativo / Morado 100% | `#6126FF` | `--color-corp` | CTA principal, conector transversal, fondo hero global |
| Color Corporativo / 40% | `rgba(97,38,255,0.4)` | `--color-corp-40` | Focus ring de botones |

**Tints del corporativo:**
- 80% → `rgba(97,38,255,0.8)`
- 60% → `rgba(97,38,255,0.6)`
- 40% → `rgba(97,38,255,0.4)`
- 20% → `rgba(97,38,255,0.2)`
- Lavanda 100% → `#EFE9FF` (var: `--color-lavanda`)

### 1.2 Colores Primarios

| Nombre Figma | Hex Figma | Hex Brandbook | Variable CSS | Uso |
|---|---|---|---|---|
| Colores primarios / Morado | `#330559` | `#330559` | `--color-morado` | Texto heading oscuro, fondos oscuros |
| Colores primarios / Verde | `#00C168` | `#00BD70`* | `--color-verde` | Ruta Talento y Gestión, acentos positivos |
| Colores primarios / Rosa vibrante | `#FF005B` | `#FF2B5E`* | `--color-rosa` | Ruta Digitalización |
| Colores primarios / Amarillo | `#FFF200` | `#FFF21C`* | `--color-amarillo` | Ruta Capital |

> DISCREPANCIA: El Figma web tiene valores ligeramente distintos al brandbook impreso.
> **El Figma es la fuente canónica para web.** Los hex del brandbook son para impresión (Pantone).
> Pendiente confirmar con cliente cuál hex usar en la práctica: `#00C168` vs `#00BD70`, `#FF005B` vs `#FF2B5E`, `#FFF200` vs `#FFF21C`.

### 1.3 Colores Secundarios

| Nombre Figma | Hex | Variable CSS | Uso |
|---|---|---|---|
| Colores secundarios / Naranja | `#FF8500` | `--color-naranja` | Ruta Capital (cards web) |
| Colores secundarios / Verde claro | `#87FFD6` | `--color-menta` | Acento secundario verde |
| Colores secundarios / Rosa | `#FFB8DE` | `--color-rosa-claro` | Acento secundario rosa |
| Colores secundarios / Gris oscuro | `#2F2927` | `--color-gris-oscuro` | Texto general, botones sobre fondo claro |
| Colores secundarios / Gris claro | `#9EA2AE` | `--color-gris-claro` | Placeholder, texto secundario |
| Colores secundarios / Blanco | `#FFFFFF` | `--color-blanco` | Fondos, texto sobre fondos oscuros |

> NOTA: El Figma usa Naranja (`#FF8500`) para la card de Capital en web.
> El brandbook y la definición de rol asignaban Amarillo a Capital. En las cards web del Figma,
> Capital = Naranja y Productividad (nombre alternativo de una ruta) = Rosa vibrante.
> PENDIENTE: Confirmar con cliente el mapeo definitivo de color por ruta para web.

### 1.4 Texto

| Nombre Figma | Hex | Variable CSS |
|---|---|---|
| Colores Texto / Morado oscuro | `#330559` | `--color-texto-dark` |
| Colores Texto / Gris | `#2F2927` | `--color-texto-body` |
| Colores Texto / Blanco | `#FFFFFF` | `--color-texto-light` |

### 1.5 Variables CSS (todas)

```css
:root {
  /* Corporativo */
  --color-corp:         #6126FF;
  --color-corp-40:      rgba(97,38,255,0.4);
  --color-lavanda:      #EFE9FF;

  /* Primarios */
  --color-morado:       #330559;
  --color-verde:        #00C168;   /* Figma web; brandbook impreso: #00BD70 */
  --color-rosa:         #FF005B;   /* Figma web; brandbook impreso: #FF2B5E */
  --color-amarillo:     #FFF200;   /* Figma web; brandbook impreso: #FFF21C */

  /* Secundarios */
  --color-naranja:      #FF8500;
  --color-menta:        #87FFD6;
  --color-rosa-claro:   #FFB8DE;
  --color-gris-oscuro:  #2F2927;
  --color-gris-claro:   #9EA2AE;
  --color-blanco:       #FFFFFF;

  /* Texto */
  --color-texto-dark:   #330559;
  --color-texto-body:   #2F2927;
  --color-texto-light:  #FFFFFF;

  /* Notificaciones (sistema UI) */
  --notif-default:      #4E61F6;
  --notif-success:      #43B75D;
  --notif-info:         #0095FF;
  --notif-warning:      #FFAA00;
  --notif-error:        #EE443F;
}
```

---

## 2. Colores por Ruta (Mapeo Web)

Basado en las cards de rutas en el Figma (nodo "Elementos para web"):

| Ruta | Color Figma (web) | Hex | Variable CSS |
|---|---|---|---|
| Capital | Colores secundarios / Naranja | `#FF8500` | `--ruta-capital` |
| Mercado | Color Corporativo / Morado 100% | `#6126FF` | `--ruta-mercado` |
| Digitalización / Productividad | Colores primarios / Rosa vibrante | `#FF005B` | `--ruta-digitalizacion` |
| Talento y Gestión | Colores primarios / Verde | `#00C168` | `--ruta-talento` |

**Variables CSS:**
```css
:root {
  --ruta-capital:        #FF8500;
  --ruta-mercado:        #6126FF;
  --ruta-digitalizacion: #FF005B;
  --ruta-talento:        #00C168;

  /* Íconos de letras en las líneas de metro */
  --ruta-capital-letra:  C;
  --ruta-mercado-letra:  M;
  --ruta-digitalizacion-letra: P; /* "Productividad" en Figma */
  --ruta-talento-letra:  T;
}
```

> NOTA: El Figma llama a la ruta "Productividad" en algunos módulos y "Digitalización" en el copy.
> El conector transversal `--color-corp` (#6126FF) une todas las rutas y aparece en navbar, footer y CTA principal.

---

## 3. Tipografías

### 3.1 Familias y jerarquía web

| Rol | Familia | Peso | Tamaño referencial | Estilo Figma |
|---|---|---|---|---|
| Display / Hero (H1 grande) | FG Futurist | Bold TRIAL (700) | 112px | style_SLXYIX |
| Títulos de sección | FG Futurist | Bold TRIAL (700) | 48px | style_1WEJ10 |
| Heading cards | Arial | Regular (400) | 30–38px | style_2F9PTU / style_B10Z5F |
| Body texto principal | Arial | Regular (400) | 16px / 20px lh | style_NF6LIS |
| Cuerpo sub-heading | Arial | Regular (400) | 14px / 20px lh | style_5FD12A |
| Badge / etiqueta | Open Sans | Bold (700) | 10px / 16px lh | style_LF2L2K |
| Botón Giant | Arial | Bold (700) | 18px / 24px lh | Boton/Giant |
| Botón Large | Arial | Bold (700) | 16px / 20px lh | Boton/Large |
| Botón Medium | Arial | Bold (700) | 14px / 16px lh | Boton/Medium |
| Botón Small | Arial | Bold (700) | 12px / 16px lh | Boton/Small |

> NOTA: El Figma también usa **Rubik** y **Open Sans** en algunos componentes auxiliares (showcase de tipografías, cards de ilustraciones, heading de convocatorias). Estas no son tipografías de marca — son del kit de componentes UI genérico. Las tipografías canónicas de la marca son FG Futurist (display) y Arial (cuerpo/botones).

### 3.2 Estrategia @font-face

**FG Futurist** es una fuente tipográfica de pago (trial en Figma). Para web se requiere licencia.

```css
/* ===== FG FUTURIST (requiere licencia web) ===== */
@font-face {
  font-family: 'FG Futurist';
  src: url('/assets/fonts/fg-futurist-bold.woff2') format('woff2'),
       url('/assets/fonts/fg-futurist-bold.woff')  format('woff');
  font-weight: 700;
  font-style: normal;
  font-display: swap;
}

/* ===== ARIAL (sistema — no requiere descarga) ===== */
/* Arial está disponible en todos los OS. No requiere @font-face. */
/* Usar font-stack completo: */

/* ===== STACKS ===== */
:root {
  --font-display: 'FG Futurist', 'Futura', 'Century Gothic', 'Trebuchet MS', sans-serif;
  --font-body:    Arial, 'Helvetica Neue', Helvetica, sans-serif;
}
```

**Fallback si FG Futurist no está licenciada:** usar `'Futura'` + `'Century Gothic'` como aproximación geométrica. Documentar como pendiente y NO publicar con la fuente Trial sin licencia.

### 3.3 Escala tipográfica web

```css
:root {
  /* FG Futurist — Display */
  --text-display:  clamp(56px, 8vw, 112px);  /* Hero H1 */
  --text-h1:       clamp(32px, 4vw,  48px);  /* Titulos de sección */

  /* Arial — Texto */
  --text-h2:       clamp(24px, 3vw,  38px);
  --text-h3:       30px;
  --text-body-lg:  18px;  /* line-height: 150% */
  --text-body:     16px;  /* line-height: 20px */
  --text-body-sm:  14px;  /* line-height: 20px */
  --text-caption:  10px;  /* Open Sans Bold — solo badges */
}
```

---

## 4. Botones — Specs del Figma (Componente 16:5261)

El sistema de botones usa **Arial Bold** para el texto (confirmado en Figma). El border-radius es **30px** (pastilla) para todos los tamaños excepto Small (15px).

### 4.1 Tabla de specs

| Talla | Padding | Alto fijo | Font size | Line height | Border radius |
|---|---|---|---|---|---|
| Giant | 16px 24px | — (hug) | 18px | 24px | 30px |
| Large | 14px 20px | 48px | 16px | 20px | 30px |
| Medium | 12px 16px | 40px | 14px | 16px | 30px |
| Small | 8px 12px | 32px | 12px | 16px | 15px |

### 4.2 Estados

| Estado | Fondo | Texto | Stroke |
|---|---|---|---|
| Default (Filled) | `#6126FF` | `#FFFFFF` | ninguno |
| Hover | `#330559` | `#FFFFFF` | ninguno |
| Focus | `#6126FF` | `#FFFFFF` | 3px `rgba(97,38,255,0.4)` |
| Disabled | (pendiente — componente no explorado en detalle) | — | — |

### 4.3 CSS base

```css
/* Botón principal CTA — talla Large */
.btn-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;                         /* padding interno del label */
  padding: 14px 20px;
  height: 48px;
  background: var(--color-corp);    /* #6126FF */
  color: var(--color-texto-light);
  font-family: var(--font-body);
  font-size: 16px;
  font-weight: 700;
  line-height: 20px;
  text-align: center;
  border: none;
  border-radius: 30px;
  cursor: pointer;
  transition: background 0.2s ease;
}

.btn-primary:hover {
  background: var(--color-morado);  /* #330559 */
}

.btn-primary:focus-visible {
  outline: 3px solid var(--color-corp-40);
  outline-offset: 2px;
}

/* Talla Medium */
.btn-primary--md {
  padding: 12px 16px;
  height: 40px;
  font-size: 14px;
  line-height: 16px;
}

/* Talla Giant */
.btn-primary--giant {
  padding: 16px 24px;
  font-size: 18px;
  line-height: 24px;
}

/* Talla Small */
.btn-primary--sm {
  padding: 8px 12px;
  height: 32px;
  font-size: 12px;
  border-radius: 15px;
}
```

---

## 5. Sistema de Líneas y Rutas (Sistema Gráfico)

### 5.1 Concepto

Las **4 líneas de metro** son el corazón del sistema gráfico de Valor Pyme. Representan las 4 rutas en un lenguaje de transporte urbano. Sus características:

- **4 trazos gruesos y redondeados** — una por ruta, con su color asignado.
- **Interactúan entre sí:** se entrelazan, cruzan y comparten "estaciones" (puntos de intersección).
- **El punto / estación** es el elemento de marca que representa unión, partida y conexión. NUNCA va solo: siempre en cruce de líneas.
- **Las líneas cruzan fotografías:** unas por delante, otras por detrás, sin tapar caras.
- **Isotipo:** 4 cuartos de círculo (una por ruta) que se unen en un hub central.

### 5.2 Anatomía de una línea

Basado en el brandbook (p. 31-35) y el nodo "Patrones" del Figma:

1. **Unidad mínima:** un cuarto de círculo (¼ del isotipo), en el color de la ruta.
2. **La unidad se puede espejar y escalar:** genera el patrón de movimiento.
3. **Terminaciones:** rectas (no redondeadas en los extremos del trazo; el redondeo es del cuarto de círculo).
4. **Punto de estación:** círculo sólido en el color de la ruta, con un mínimo de espacio respecto a la línea.

### 5.3 Construcción CSS / SVG

```css
/* Variables del sistema de líneas */
:root {
  --linea-peso:     8px;      /* grosor de trazo en pantalla desktop */
  --linea-peso-md:  6px;      /* grosor en tablet */
  --linea-peso-sm:  4px;      /* grosor en mobile */
  --linea-radio:    40px;     /* border-radius de las curvas */
  --estacion-size:  16px;     /* diámetro del punto/estación */
}
```

**Para SVG (recomendado):** usar `stroke-linecap: round` en los extremos de la ruta, `stroke-width` de 8–12px en desktop. El archivo `patron-lineas-1.svg` del Figma es la referencia base.

**Animación recomendada:**

```css
/* Animación de entrada — stroke-dasharray / stroke-dashoffset */
@keyframes draw-line {
  from { stroke-dashoffset: var(--line-length); }
  to   { stroke-dashoffset: 0; }
}

.route-line {
  stroke-dasharray: var(--line-length);
  stroke-dashoffset: var(--line-length);
  animation: draw-line 1.2s ease-out forwards;
}

/* Stagger por ruta */
.route-line--capital      { animation-delay: 0s; }
.route-line--mercado      { animation-delay: 0.2s; }
.route-line--digitalizacion { animation-delay: 0.4s; }
.route-line--talento      { animation-delay: 0.6s; }
```

### 5.4 Reglas de uso

1. Las 4 líneas deben aparecer juntas como sistema; evitar usar una sola línea suelta sin contexto.
2. El punto/estación aparece SOLO en intersecciones — nunca flotando sin línea.
3. Al superponer sobre foto: 2 líneas van por detrás de la imagen (z-index menor) y 2 por delante (z-index mayor). Nunca tapar caras de personas.
4. Las líneas pueden cortar el borde del contenedor (overflow visible) para crear profundidad.
5. El isotipo SVG (4 cuartos de círculo) es la versión compacta del sistema; usarlo en avatar, favicon, y lugares pequeños.

---

## 6. Fotografía — Reglas

Basado en brandbook pp. 26-28 y el panel "Fotos" del Figma (nodo 52:809).

### 6.1 Estilo

- **A. Planos desenfocados:** captura natural con bokeh, zoom documental, foco en detalles. Personas trabajando sin posar.
- **B. Retratos espontáneos:** mirando o no a cámara; transmiten alegría, confianza, cercanía. Nunca artificiales.
- **C. Luminosidad:** atmósfera limpia, positiva, luminosa. Sin filtros oscuros ni dramáticos.

### 6.2 Sujetos (Chile)

- Emprendedores reales en su quehacer cotidiano.
- Diversidad de rubros: café, taller, comercio, oficina, artesanía.
- Preferencia por mujeres (el Figma tiene mayoría de retratos femeninos).
- Plano completo o 3/4 — no solo rostros cerrados.

### 6.3 Interacción foto + líneas

```
[FONDO]
  → Líneas de metro (2 rutas, z-index: 1)
  → Fotografía (z-index: 2, con clip o overflow)
  → Líneas de metro (otras 2 rutas, z-index: 3)
  → Texto / CTA (z-index: 4)
```

Las líneas que pasan por encima de la foto deben ir por zonas sin rostro. Si la foto tiene cara centrada, las líneas superiores pasan por los bordes izquierdo/derecho.

---

## 7. Inventario de Assets Descargados

### 7.1 Logos (`site/assets/logos/`)

| Archivo | Nodo Figma | Descripción |
|---|---|---|
| `logo-horizontal-white.svg` | 5:1365 | Logo horizontal blanco (para fondo morado) |
| `logo-horizontal-dark.svg` | 6:2637 | Logo horizontal oscuro (para fondo blanco) |
| `logo-vertical-white.svg` | 5:1389 | Logo vertical blanco |
| `logo-vertical-dark.svg` | 6:2649 | Logo vertical oscuro |
| `isotipo-white.svg` | 6:2737 | Isotipo (4 cuartos) blanco |
| `isotipo-dark.svg` | 52:638 | Isotipo (4 cuartos) oscuro |
| `logo-condensado.svg` | 6:2674 | Logo condensado / avatar |

**Reglas de uso:**
- Fondo morado (`#6126FF` o `#330559`) → versión white.
- Fondo blanco o claro → versión dark.
- Fondo de color de ruta → validar contraste; usar white si el color es oscuro.
- Área de seguridad mínima: 42px en digital (brandbook p. 17).
- Tamaño mínimo digital: 28px de alto.

### 7.2 Íconos de Rutas (`site/assets/icons/`)

| Archivo | Nodo Figma | Descripción |
|---|---|---|
| `iconos-rutas-set.svg` | 6:2746 | Set completo de íconos de rutas |
| `icono-ruta-capital.svg` | 5:1425 | Ícono letra "C" — Ruta Capital |
| `icono-ruta-mercado.svg` | 5:1416 | Ícono letra "M" — Ruta Mercado |
| `icono-ruta-digitalizacion.svg` | 5:1443 | Ícono letra "P" — Ruta Digitalización |
| `icono-ruta-talento.svg` | 5:1436 | Ícono letra "T" — Ruta Talento |
| `avatar-logo.svg` | 6:2742 | Avatar circular con logo |
| `icono-web-ruta-1.svg` | 37:5737 | Ícono web ruta 1 (contexto "Nuestras rutas") |
| `icono-web-ruta-2.svg` | 37:5728 | Ícono web ruta 2 |
| `icono-web-ruta-3.svg` | 37:5734 | Ícono web ruta 3 |
| `icono-web-ruta-4.svg` | 37:5741 | Ícono web ruta 4 |

### 7.3 Líneas y Patrones (`site/assets/lines/`)

| Archivo | Nodo Figma | Descripción |
|---|---|---|
| `patron-lineas-1.svg` | 29:1700 | Patrón de líneas variante 1 |
| `patron-lineas-2.svg` | 29:1707 | Patrón de líneas variante 2 |
| `patron-lineas-3.svg` | 29:1715 | Patrón de líneas variante 3 |
| `patron-lineas-color.svg` | 29:1737 | Patrón de líneas con color |
| `patron-composicion-1.svg` | 29:1743 | Composición de rutas 1 |
| `patron-composicion-2.svg` | 29:1751 | Composición de rutas 2 |

### 7.4 Fotos de Referencia (`site/assets/photos/`)

| Archivo | Dimensión | Descripción |
|---|---|---|
| `foto-ref-01.png` | 400×211 | Hombre en ambiente oficina / prensa |
| `foto-ref-02.png` | 400×518 | Mujer trabajadora en bakery |
| `foto-ref-03.png` | 636×425 | Mujer con laptop en oficina |
| `foto-ref-04.png` | 427×640 | Mujer moderna posando |
| `foto-ref-05.png` | 400×267 | Mujeres colaborando en taller |
| `foto-ref-06.png` | 636×424 | Mujer emprendedora en espacio creativo |
| `foto-ref-07.png` | 580×386 | Persona trabajando en taller de cerámica |
| `foto-ref-08.png` | 311×555 | Mujer sonriente (retrato espontáneo) |

---

## 8. Pendientes y Observaciones

### 8.1 CRÍTICO — Pendientes que bloquean producción

| ID | Pendiente | Impacto |
|---|---|---|
| P-01 | **Licencia web de FG Futurist** — confirmar si se tiene o hay que adquirir. Sin licencia no se puede usar en producción. Fallback: Futura / Century Gothic. | Display / H1 en todo el sitio |
| P-02 | **Confirmar mapeo definitivo color × ruta** — el Figma web usa Naranja para Capital y Rosa vibrante para Productividad/Digitalización, pero el briefing original asigna Amarillo a Capital. | Todas las páginas de ruta |
| P-03 | **Confirmar nombre de 4ta ruta** — el Figma usa "Productividad" y "Mercado" donde el rol define "Digitalización" y "Mercado". ¿Son la misma? ¿Cambió el nombre? | Copy y sección hero de cada ruta |

### 8.2 IMPORTANTE — Pendientes antes de lanzar

| ID | Pendiente |
|---|---|
| P-04 | Verificar que los SVG descargados renderizan correctamente (0×0 es normal en SVG, pero confirmar que los archivos tienen contenido válido). |
| P-05 | **Hex definitivos para web:** `#00C168` vs `#00BD70` (verde), `#FF005B` vs `#FF2B5E` (rosa), `#FFF200` vs `#FFF21C` (amarillo). Usar Figma como fuente pero documentar para el cliente. |
| P-06 | Descargar versión negra/oscura del logo si existe (no encontrada en el nodo — los logos del Figma son sobre fondo morado o blanco). |
| P-07 | Decidir si Open Sans se usa en producción (solo aparece en badges y en el showcase de tipografías del Figma; no es tipografía de marca oficial). |
| P-08 | El sistema de líneas requiere archivo SVG animable por ruta (los patrones descargados pueden no ser editables por ruta individualmente — pendiente verificar). |

### 8.3 MENOR — Para afinar

| ID | Pendiente |
|---|---|
| P-09 | Definir `letterSpacing` estándar para FG Futurist en display (no encontrado explícitamente en el Figma para los estilos canónicos). |
| P-10 | Confirmar breakpoints responsivos (el Figma muestra ancho fijo de 1317px; definir grid para 768px y 375px). |
| P-11 | Fotos de referencia descargadas son de stock con names en inglés. Antes de usarlas en producción verificar licencia Figma → uso web permitido. |
| P-12 | El botón en la card de ruta usa `Boton/Medium` (Arial Bold 14px) con border-radius 30px — confirmar si el estilo de texto de botón cambia según la ruta (color de texto) o si siempre es blanco. |

---

## 9. Notas de Implementación

### 9.1 Z-index del sistema gráfico

```css
/* Propuesta de capas para hero con foto y líneas */
.hero {
  position: relative;
}
.hero__lines-back   { position: absolute; z-index: 1; }  /* 2 rutas por detrás */
.hero__photo        { position: relative; z-index: 2; }
.hero__lines-front  { position: absolute; z-index: 3; }  /* 2 rutas por delante */
.hero__content      { position: relative; z-index: 4; }
```

### 9.2 Grid base

El canvas del Figma es 1317px de ancho. Grid sugerido:

```css
.container {
  max-width: 1320px;
  margin: 0 auto;
  padding: 0 80px;   /* padding lateral del Figma */
}

@media (max-width: 768px) {
  .container {
    padding: 0 24px;
  }
}
```

### 9.3 Border-radius del sistema

El Figma usa dos valores predominantes:
- **30px** → tarjetas de ruta, botones principales, contenedores de logos.
- **25px** → frames/paneles de la guía de estilo.
- **24px** → cards de programas y convocatorias.
- **8px** → alerts y badges.
- **6px** → badges pequeños (etiquetas de sección).

```css
:root {
  --radius-xl:  30px;   /* tarjetas principales, botones */
  --radius-lg:  24px;   /* cards programas */
  --radius-md:  12px;   /* alerts */
  --radius-sm:   8px;   /* badges, inputs */
  --radius-xs:   6px;   /* etiquetas micro */
}
```

---

*Generado por el agente vp-brand-validator en modo BUILD — 2026-06-15*
