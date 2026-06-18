# Blueprint — HOME de Valor Pyme (`index.html` → `/`)

> **Página:** Home / portada de valor-pyme.com (reemplaza el antiguo hub, que pasó a `rutas.html`).
> **Prioridad:** 1) conversión a suscripción (sumar pymes gratis a la comunidad); 2) preservar SEO del dominio vivo valorpyme.cl.
> **Mapa AIDA del home:** Attention (Hero) → Interest (acompañamiento + 4 rutas + diagnóstico) → Desire (aliados/motor + comunidad/suscripción con oferta Hormozi) → Action (3 pasos + CTA suscripción + FAQ).
> **Acento transversal:** morado corporativo `#6126FF` (sin `data-ruta`, el home es transversal).
> **Idioma / atributo HTML:** `lang="es-CL"`.
> **Fuente de verdad de copy:** `home-inputs.md` §A (arquitectura aprobada), §B (contenido validado del sitio vivo), §C (FAQ propuesta).

---

## Trazabilidad del research

- **GSC (gsc-historial):** intentado. El token de GSC funciona, pero **la propiedad valorpyme.cl NO está en la cuenta de GSC conectada** (solo aparecen black-n-orange.com, rh-shipping.com, gs1mexico.org). **No se pudo extraer queries/landing reales del home.** → Para no romper SEO se preservan las **keywords ya presentes en el dominio vivo** (cosechadas en `home-inputs.md`): *pyme(s), emprendedores, Chile, rutas, financiamiento/capital, digitalización, mercado/ventas, talento, comunidad*. **PENDIENTE:** dar de alta valorpyme.cl en la cuenta GSC de BnO para validar queries antes de publicar.
- **Semrush:** no se corrió (la prioridad operativa del cliente es conversión + preservar lo existente, no descubrir keyword nueva; el copy y los titulares ya están aprobados en el doc). Si el cliente quiere ampliar tráfico orgánico nuevo, correr `semrush-research` en una iteración posterior.

---

## Reglas de implementación transversales (para el desarrollador)

- Reutilizar **el mismo `site/styles.css`, `script.js`, header (navbar blanco, logo `logo-horizontal-dark.svg`), footer, sistema de líneas de metro y journey strip** que ya usa `rutas.html`. **No crear estilos nuevos** salvo lo mínimo indispensable.
- El home es transversal: el hero usa `--ruta:var(--color-corp)` (#6126FF), igual que el hero de `rutas.html`. No poner `data-ruta` en `<body>`.
- URLs limpias (Cloudflare): enlaces internos **sin** `.html`. Home = `/`, rutas = `/rutas`, páginas de ruta = `/ruta-capital` etc.
- Componentes reutilizables de `rutas.html` que se reaprovechan tal cual: `.hero` (grid copy+visual con líneas), `.route-card` (las 4 cards), `.journey` (vehículo + líneas), `.diag` (bloque diagnóstico). Ver notas por sección.
- Animaciones existentes: clases `.reveal` / `.d1`–`.d4` (stagger), `.draw` (dibujo de líneas), `.station-pop`. Mantenerlas.

---

## SEO / AEO global del home

- **Title (`<title>`, <60c):** `Valor Pyme — Red de soluciones para emprendedores y pymes de Chile` (60c).
  - Alternativa más corta si se prefiere: `Valor Pyme | La comunidad de pymes y emprendedores de Chile` (57c).
- **Meta description (<155c):** `Súmate gratis a la mayor comunidad de pymes de Chile. 4 rutas —Capital, Mercado, Digitalización y Talento— con soluciones de grandes empresas e instituciones.` (154c)
- **`<html lang="es-CL">`**, `<meta name="viewport">`, charset UTF-8.
- **Open Graph:** `og:title`, `og:description` (reusar los de arriba), `og:type=website`, `og:image` = una foto luminosa de emprendedor/a (ej. `assets/photos/foto-ref-06.png`). `og:url=https://www.valorpyme.cl/`.
- **Un solo H1** en todo el documento: el del Hero. Todas las demás secciones usan H2 (y H3 dentro de cards/pasos). Validar que no haya un segundo H1.
- **Schema (JSON-LD):**
  - `Organization` (name: Valor Pyme, url, logo, sameAs a redes — pendiente URLs reales de redes).
  - `WebSite` con `potentialAction` SearchAction (opcional).
  - `FAQPage` con las 5 preguntas/respuestas de la sección 8 (**marcado como provisional hasta validar las preguntas con el cliente** — ver pendientes).
- **AEO:** la FAQ está redactada en formato pregunta→respuesta directa (primera frase responde literal) para featured snippets / respuestas de IA. Mantener cada respuesta autocontenida.
- **Keywords a preservar** (densidad natural, sin keyword stuffing): pyme, pymes, emprendedores, Chile, rutas, capital/financiamiento, mercado/ventas, digitalización, talento, gestión, comunidad, gratis.

---

# Secciones (en el orden aprobado de `home-inputs.md §A`)

---

## Sección 1 — HERO  ·  AIDA: ATTENTION

**Objetivo:** capturar en 3 segundos qué es Valor Pyme y para quién, plantar la metáfora del viaje, y ofrecer de inmediato el CTA primario (suscripción) sin scroll.

- **Heading — H1 (único del documento):**
  > **Emprender es siempre un viaje.**
  *(titular literal aprobado en el doc — NO modificar)*

- **Subtítulo — H2:**
  > Una red de soluciones para acompañar el crecimiento de tu pyme.
  *(literal aprobado)*

- **Body (1 frase de apoyo, debajo del subtítulo):**
  > Valor Pyme conecta a las pymes y emprendedores de Chile con soluciones de grandes empresas, banca, universidades e instituciones. Cuatro rutas, muchas estaciones, una sola comunidad.

- **Badge / eyebrow (reusar `.hero__badge` de rutas.html):**
  > Red de soluciones para pymes · Chile

- **CTA primario (`.btn btn--onfill`):**
  - Label: **Súmate gratis**
  - Destino: `#suscripcion` (ancla provisional; **ruta real de Suscripción por confirmar** → ver pendientes)
- **CTA secundario (`.btn btn--ghost`):**
  - Label: **Descubre tu ruta**
  - Destino: `#diagnostico` (ancla provisional) — o `/rutas` si se prefiere llevar al hub. **Decisión por confirmar** (recomendado: diagnóstico, refuerza personalización).

**Recursos requeridos:**
- Foto del hero — **YA EXISTE**: `assets/photos/foto-ref-04.png` (o `foto-ref-06.png`, emprendedora luminosa). Reusar `.photo-frame`.
- Líneas de metro del hero (SVG inline, 4 trazos en colores de ruta + estaciones) — **patrón YA EXISTE** en `rutas.html` (copiar el bloque `.lines-svg--back/--front`). El home usa las 4 rutas (amarillo Capital, morado Mercado, rosa Digitalización, verde Talento) cruzando, con el morado corp como hilo conductor.
- Iconografía: ninguna extra.

**SEO/AEO:** H1 contiene la metáfora aprobada; el body inyecta keywords (pymes, emprendedores, Chile, rutas, comunidad). Es la única H1.
**Reutilización:** copia directa de la estructura `.hero` de `rutas.html` cambiando textos y CTAs.

---

## Sección 2 — "NO TIENES QUE RECORRER EL CAMINO SOLO"  ·  AIDA: INTEREST (problema → promesa)

**Objetivo:** conectar emocionalmente con el dolor del emprendedor (lo difícil de crecer solo) y posicionar a Valor Pyme como el acompañante. Puente narrativo antes de mostrar las rutas.

- **Heading — H2:**
  > No tienes que recorrer el camino solo.
  *(literal aprobado)*

- **Body:**
  > Hacer crecer una pyme está lleno de cruces de camino: conseguir capital, llegar a más clientes, ordenar la gestión, formar un equipo. En Valor Pyme reunimos en un mismo lugar las soluciones de grandes empresas, banca, universidades e instituciones, para que avances acompañado y con herramientas reales. Cuatro rutas que se convierten en una sola red.

- **(Opcional) micro-claim de respaldo / prueba social ligera** (usar solo el claim respaldado):
  > La mayor comunidad de pymes y emprendedores de Chile — **+150.000 visitas al mes.**

- **Sin CTA propio** (sección puente) — o un `link-more` discreto: **Conoce cómo funciona → `#tres-pasos`** (ancla a sección 6).

**Recursos requeridos:**
- Opcional: una foto secundaria (`assets/photos/foto-ref-05.png`, mujeres colaborando en taller) con 2 líneas de metro cruzándola (reusar patrón). Si se prefiere sección de solo texto centrada, no requiere foto.
- Si se usan las 4 líneas como elemento gráfico de fondo, reusar `patron-lineas` / el SVG inline del hero.

**SEO/AEO:** H2 = titular aprobado. Body refuerza las 4 dimensiones (capital, clientes/mercado, gestión/digitalización, talento) en lenguaje natural → buen contexto semántico.
**Reutilización:** patrón de sección `.section` + `.section-head` de `rutas.html`. El claim +150.000 reusa el dato validado.

---

## Sección 3 — LAS 4 RUTAS  ·  AIDA: INTEREST (beneficios concretos)

**Objetivo:** mostrar las 4 rutas como respuesta a los 4 desafíos; permitir auto-segmentación; enlazar al detalle de cada ruta.

- **Heading — H2:**
  > Cada empresa tiene desafíos distintos. Encuentra tu ruta.
  *(literal aprobado)*

- **Lead (debajo del H2):**
  > Elige la línea que resuelve tu desafío de hoy. Y cuando dos rutas se cruzan, aparecen estaciones de combinación con beneficios únicos.

- **4 cards (reusar `.route-card` de rutas.html — H3 por card):**

  | Card | H3 | Tag | Body | Link | Destino | Color (`--ruta`) |
  |---|---|---|---|---|---|---|
  | Capital | Ruta Capital | Eje financiero | Accede al capital que impulsa tu crecimiento: bancarización, orden de tu caja y servicios financieros. | Explorar ruta → | `/ruta-capital` | `#FF8500` (naranja, mapeo web) |
  | Mercado | Ruta Mercado | Ventas y logística | Llega a nuevos clientes en marketplaces de alto tráfico y resuelve tu logística y distribución en todo Chile. | Explorar ruta → | `/ruta-mercado` | `#6126FF` |
  | Digitalización | Ruta Digitalización | Procesos internos | Digitaliza y profesionaliza tu operación: ERP, gestión y herramientas para ordenar, controlar y escalar. | Explorar ruta → | `/ruta-digitalizacion` | `#FF005B` |
  | Talento y Gestión | Ruta Talento y Gestión | Equipo y capacidades | Forma a tu equipo y fortalece tu gestión con capacitación, mentorías y formación. | Explorar ruta → | `/ruta-talento` | `#00C168` |

  > **Nota de color:** las cards de `rutas.html` usan Capital `#FFF200` (amarillo). El brand kit (mapeo web) asigna Capital = `#FF8500` (naranja). **Hay discrepancia abierta (P-02).** Para consistencia inmediata con lo ya construido, el desarrollador puede mantener `#FFF200` como en `rutas.html` y marcarlo como pendiente; lo importante es que el home y rutas.html coincidan. **Por confirmar con cliente.**

- **CTA de sección (opcional, debajo de las cards):**
  - Label: **Ver todas las rutas**
  - Destino: `/rutas`

**Recursos requeridos:**
- Cards: ningún asset extra (usan dot con letra + color). Los íconos de letra (C/M/D/T) ya están como `.route-card__dot` en CSS.
- Si se quiere logo de aliado por card (como en rutas.html con tooltips), usar logos de `assets/logos/partners/` — **todos existen** (bci, walmart, blueexpress, defontana, pymeuc, microsoft, otic, buk, omia, rindegastos, fintegram, salcobrand, misabogados). **NO inventar qué aliado va en qué card más allá de lo ya validado**; si hay duda, omitir logos en las cards del home y dejarlos solo en la sección 5 (Aliados).

**SEO/AEO:** H2 aprobado + 4 H3 con nombre de ruta = estructura semántica clara. Keywords: capital, mercado, digitalización, talento, gestión.
**Reutilización:** copia directa del bloque `.grid-2` con `.route-card` de `rutas.html` (ya tiene los 4 colores y links). Solo ajustar copy de body si el cliente prefiere el del sitio vivo.

---

## Sección 4 — DIAGNÓSTICO  ·  AIDA: INTEREST→DESIRE (personalización / reducción de fricción)

**Objetivo:** capturar a quien no sabe qué ruta elegir y convertirlo vía diagnóstico (camino alternativo de bajo esfuerzo hacia la conversión).

- **Heading — H2:**
  > ¿No sabes cuál es el mejor camino para tu empresa?
  *(literal aprobado)*

- **Body:**
  > Responde el diagnóstico de Valor Pyme, evalúa las dimensiones de tu negocio y obtén una ruta personalizada con las estaciones exactas para tus necesidades de hoy.

- **CTA (`.btn btn--onfill`):**
  - Label: **Descubrir mi ruta**
  - Destino: `#diagnostico` (ancla provisional; **ruta real del diagnóstico por confirmar** → pendientes)

**Recursos requeridos:**
- Bloque `.diag` — **YA EXISTE** en `rutas.html` (copiar tal cual, con journey strip + vehículo opcional encima).
- Vehículo del journey: `assets/img/veh-capital.png` (o el morado/transversal si existe — solo hay veh por ruta; usar `veh-mercado.png` por ser morado, alineado al acento corp). **YA EXISTE.**

**SEO/AEO:** H2 = pregunta aprobada (excelente para AEO/voice: es una pregunta literal). Considerar enlazar internamente a `/rutas`.
**Reutilización:** bloque `.diag` + `.journey` de `rutas.html`, idénticos.

---

## Sección 5 — ALIADOS (EL MOTOR DEL VIAJE)  ·  AIDA: DESIRE (prueba social / credibilidad)

**Objetivo:** demostrar respaldo real con logos de marcas grandes y reconocidas → sube la "probabilidad percibida de lograrlo" (Hormozi B). Es el principal generador de confianza del home.

- **Heading — H2:**
  > El motor del viaje: empresas con soluciones para los desafíos de las pymes.
  *(literal aprobado)*

- **Body:**
  > Grandes empresas, banca, universidades e instituciones se suman a Valor Pyme con soluciones y beneficios exclusivos para la comunidad. Encuentra la ruta que más te sirva, descubre los recursos de nuestros aliados y combínalos a tu manera.
  *(frase puente literal del sitio vivo, §B)*

- **Grid / carrusel de logos (reusar patrón de logos de partners):**
  Usar los **13 logos que YA EXISTEN** en `assets/logos/partners/`. Con caption/tooltip cuando aplique, usando las descripciones validadas (§B). Descripciones disponibles y verificadas:
  - **bci.png** — "Inclusión y educación financiera para un crecimiento sostenible."
  - **walmart.png** — "Nuevos canales y oportunidades de venta para llevar tus productos a todo Chile." (Walmart Marketplace)
  - **blueexpress.png** — "Logística, cobertura y distribución de tus productos en todo Chile."
  - **defontana.png** — "Digitaliza la gestión de tu pyme con ERP y descuentos exclusivos para ordenar, controlar y escalar."
  - **pymeuc.png** — "Formación, mentorías y evidencia para mejorar la productividad y el crecimiento de las pymes en Chile." (Facultad de Economía y Administración UC)
  - **otic.png** — "Capacitación y desarrollo de talento para aumentar la productividad de las pymes." (OTIC CChC)
  - **microsoft.png** — "Tecnología, inteligencia artificial y herramientas digitales para acelerar la transformación pyme."
  - Logos adicionales presentes sin descripción validada en §B (mostrar **logo sin tooltip** o sin claim inventado): **buk.svg, omia.png, rindegastos.png, fintegram.png, salcobrand.png, misabogados.png**. **NO inventar su descripción**; si el cliente no la entrega, mostrar solo el logo. *(Multigremial Nacional tiene descripción en §B pero NO tiene logo en `partners/` → reportado en pendientes.)*

- **CTA (`.btn btn--ghost` o link):**
  - Label: **Conoce a los aliados**
  - Destino: `#aliados` provisional (la página Aliados aún no existe → ver pendientes). Mantener en `#` hasta tener la página.

**Recursos requeridos:**
- 13 logos: **TODOS EXISTEN** en `assets/logos/partners/`.
- **FALTA (reportar):** logo de **Multigremial Nacional** (tiene descripción validada pero no archivo).
- Componente carrusel/grid de logos en escala de grises→color en hover (patrón común; el desarrollador puede reaprovechar grid simple si no hay carrusel en CSS).

**SEO/AEO:** H2 = titular aprobado. Alt text de cada logo con el nombre del aliado (ej. `alt="Bci"`). No FAQ aquí.
**Reutilización:** logos ya integrados en cards de `rutas.html`; reusar el mismo tratamiento visual.

---

## Sección 6 — COMIENZA TU VIAJE EN TRES PASOS  ·  AIDA: ACTION (reducción de esfuerzo)

**Objetivo:** quitar fricción mostrando lo fácil que es empezar (Hormozi D: ↓esfuerzo). Antesala directa de la conversión.

- **Heading — H2:**
  > Comienza tu viaje en tres pasos.
  *(esqueleto aprobado; titular natural a partir del doc)*

- **3 pasos (H3 por paso, reusar patrón de cards numeradas):**
  1. **Crea tu cuenta** — Regístrate gratis en menos de un minuto. Sin costo y sin permanencia.
  2. **Completa tu perfil** — Cuéntanos de tu pyme para recibir rutas, recursos y beneficios pensados para ti.
  3. **Explora y conecta** — Recorre las rutas, accede a los beneficios de los aliados y súmate a la comunidad.

  *(los nombres de los 3 pasos son literales del doc; los subtítulos se redactan a partir del contexto validado.)*

- **CTA (`.btn btn--onfill`):**
  - Label: **Crear mi cuenta gratis**
  - Destino: `#suscripcion` (provisional)

**Recursos requeridos:**
- Íconos de 3 pasos: usar números grandes en círculo morado (`#6126FF`) o íconos simples — **a definir por desarrollador con CSS existente** (no requiere asset nuevo). Opcional: `assets/icons/icono-web-ruta-*.svg` si encajan visualmente.
- Sin foto obligatoria.

**SEO/AEO:** H2 + 3 H3 de pasos = contenido estructurado, base para el FAQ "¿Cómo empiezo?" (sección 8). Reforzar coherencia con esa respuesta.
**Reutilización:** patrón de tarjetas/grid de 3 columnas (puede derivar de `.grid-2`/cards existentes ampliado a 3).

---

## Sección 7 — COMUNIDAD / SUSCRIPCIÓN (bloque Título + Texto + CTA)  ·  AIDA: DESIRE→ACTION (la OFERTA)

**Objetivo:** sección de conversión principal del home. Aquí se concentra la **oferta Hormozi** y el CTA primario de suscripción. Es el clímax del embudo.

- **Heading — H2:**
  > Sé parte de la mayor comunidad de pymes y emprendedores de Chile.
  *(plantilla del doc rellenada con copy validado del sitio vivo, §B)*

- **Body:**
  > Apoyamos el crecimiento de las pequeñas y medianas empresas de Chile. Con **más de 150.000 visitas al mes** y una amplia gama de recursos gratuitos a tu disposición, te damos el impulso que necesitas para llevar tu negocio al siguiente nivel. Súmate sin costo y comienza tu viaje hoy.

- **CTA primario (`.btn btn--onfill`, el más prominente del home):**
  - Label: **Súmate gratis**
  - Destino: `#suscripcion` (provisional → ruta real de la página Suscripción, ya validada, por confirmar)
- **CTA secundario (link a redes — "abrimos las redes para hacer comunidad"):**
  - Label: **Súmate a la conversación**
  - Destino: redes sociales (URLs reales **pendientes**) → dejar en `#` hasta confirmar.

### Oferta Hormozi (refuerzo de esta sección — solo claims respaldados)

> **Nombre de la oferta:** *Comunidad Valor Pyme* — gratis, para siempre.

- **A. Dream Outcome (↑):** hacer crecer tu pyme acompañado, con acceso a soluciones que normalmente solo tienen las grandes empresas.
- **B. Probabilidad percibida (↑):** respaldo de marcas reales (Bci, Walmart, Microsoft, UC, Blue Express, Defontana, OTIC CChC…) + la mayor comunidad de pymes de Chile (+150.000 visitas/mes). *Prueba social = los logos de la sección 5.*
- **C. Time delay (↓):** te registras en menos de un minuto y empiezas a explorar al instante.
- **D. Esfuerzo (↓):** 3 pasos simples; sin instalar nada; sin costo; sin permanencia.

- **Offer stack (qué incluye sumarse — todo gratis, claims respaldados por §B):**
  - Acceso a las **4 rutas** (Capital, Mercado, Digitalización, Talento y Gestión).
  - **Beneficios exclusivos** de los aliados para la comunidad.
  - **Contenidos**: novedades y datos clave para tu pyme (blog).
  - **Formación**: cursos, talleres y mentorías para impulsar tu negocio.
  - **Diagnóstico** para encontrar tu ruta personalizada.
- **Garantía / reducción de riesgo (honesta):** **Gratis. Sin costo y sin permanencia.** (Es lo que el cliente respalda — NO prometer resultados de negocio ni garantías de financiamiento.)
- **Urgencia/escasez:** **NO usar urgencia falsa.** No hay fecha límite ni cupos reales → no inventar. Marco honesto: "súmate hoy y empieza tu viaje".

**Recursos requeridos:**
- Foto luminosa de comunidad/emprendedores (`assets/photos/foto-ref-06.png` o `foto-ref-08.png`) con líneas cruzando — reusar patrón.
- Íconos para el offer stack (lista con checks): usar check SVG simple o `assets/icons/icono-web-ruta-*.svg`. No requiere asset nuevo crítico.
- **NO replicar el formulario de suscripción** (vive en su propia página validada). En el home solo va el CTA que lleva a esa página.

**SEO/AEO:** H2 con keywords (comunidad, pymes, emprendedores, Chile). Claim +150.000 visitas/mes (único dato cuantitativo respaldado). Reforzar coherencia con FAQ "¿Tiene costo?".
**Reutilización:** patrón de sección con foto + líneas; botón `.btn--onfill`.

---

## Sección 8 — PREGUNTAS FRECUENTES (FAQ)  ·  AIDA: ACTION (objeciones) + AEO

**Objetivo:** resolver las últimas objeciones y alimentar FAQ schema para snippets/IA. **El doc no traía las preguntas redactadas → las 5 siguientes son PROPUESTA y deben validarse con el cliente.**

- **Heading — H2:**
  > Preguntas frecuentes.

- **5 preguntas (H3) con respuesta directa (formato AEO: la primera frase responde literal):**

  1. **H3: ¿Qué es Valor Pyme?**
     R: Valor Pyme es una red gratuita que conecta a las pymes y emprendedores de Chile con soluciones de grandes empresas, banca, universidades e instituciones. Organiza esas soluciones en cuatro rutas —Capital, Mercado, Digitalización y Talento y Gestión— para acompañar el crecimiento de tu negocio.

  2. **H3: ¿Tiene costo sumarme a la comunidad?**
     R: No, sumarte a Valor Pyme es gratis. No tiene costo ni permanencia: creas tu cuenta y accedes a las rutas, los contenidos, la formación y los beneficios de los aliados sin pagar nada.

  3. **H3: ¿Qué son las rutas y cómo elijo la mía?**
     R: Las rutas son los cuatro caminos en los que Valor Pyme organiza las soluciones para tu pyme: Capital (financiamiento), Mercado (ventas y logística), Digitalización (gestión y procesos) y Talento y Gestión (equipo y capacidades). Puedes elegir la que resuelve tu desafío de hoy, combinarlas, o hacer el diagnóstico para recibir una ruta personalizada.

  4. **H3: ¿Quiénes son los aliados y qué beneficios entregan?**
     R: Los aliados son las empresas e instituciones que ofrecen soluciones y beneficios exclusivos para la comunidad Valor Pyme, como Bci, Walmart Marketplace, Blue Express, Defontana, Microsoft, OTIC CChC y la Facultad de Economía y Administración UC, entre otros. Cada uno aporta recursos para una o más rutas: financiamiento, canales de venta, logística, digitalización, capacitación y formación.

  5. **H3: ¿Cómo empiezo?**
     R: Empiezas en tres pasos: crea tu cuenta gratis, completa el perfil de tu pyme y explora las rutas para conectar con los recursos y beneficios de los aliados. Todo el proceso toma pocos minutos.

  > **PENDIENTE (cliente):** validar/ajustar estas 5 preguntas y respuestas — no venían redactadas en el doc. Los nombres de aliados citados en la pregunta 4 están todos respaldados en §B.

- **Sin CTA propio obligatorio**; opcional un cierre: **¿Aún tienes dudas? Contáctanos → `#contacto`** (la página Contacto aún no existe).

**Recursos requeridos:**
- Acordeón FAQ (CSS/JS): si no existe en `styles.css`/`script.js`, el desarrollador agrega un acordeón accesible mínimo (`<details>/<summary>` es válido y SEO-friendly).
- Sin imágenes.

**SEO/AEO:** generar **JSON-LD `FAQPage`** con estas 5 Q&A (marcar como provisional en código hasta validación). Respuestas autocontenidas y en español neutro-CL. Es el bloque de mayor valor para AEO del home.
**Reutilización:** ninguna específica; sigue el sistema tipográfico/colores del home (`#6126FF` en acentos).

---

## Footer (reusar el de `rutas.html`)

Mantener el footer existente. **Ajuste recomendado:** en la columna "Súmate", apuntar "Registrarme" → ruta real de suscripción cuando se confirme; añadir enlace a `/rutas` (hub) en la columna "Rutas" (ej. "Ver todas las rutas"). Logo blanco `logo-horizontal-white.svg` (existe). Año dinámico ya está (`data-year`).

---

# Lista consolidada de PENDIENTES y RECURSOS FALTANTES

### Rutas internas por confirmar (provisionales en el blueprint)
| Elemento | Provisional usado | Acción |
|---|---|---|
| Página/ancla **Suscripción** (CTA primario, secciones 1, 6, 7, footer) | `#suscripcion` | Confirmar URL real de la página de Suscripción (ya validada, fuera de alcance). |
| **Diagnóstico** (secciones 1, 4) | `#diagnostico` | Confirmar URL/funcionalidad real del diagnóstico. |
| Página **Aliados** (sección 5) | `#aliados` | No existe aún → mantener `#`. |
| **Redes sociales** (sección 7 "súmate a la conversación") | `#` | Entregar URLs reales de redes. |
| Páginas **Nosotros / Comunidad / Recursos / Contacto** (navbar/footer) | `#` | Mantener `#` hasta tener arquitectura completa. |

### Recursos faltantes
- **Logo de Multigremial Nacional**: tiene descripción validada en §B pero **no hay archivo** en `assets/logos/partners/`. Solicitar al cliente o excluir de la sección Aliados.
- **Descripciones validadas** de: Buk, OMIA, Rindegastos, Fintegram, Salcobrand, Mis Abogados (logos existen, sin claim aprobado). Mostrar logo sin tooltip o pedir copy al cliente. **No inventar.**
- **Licencia web FG Futurist** (P-01 brand kit): si no está licenciada, usar fallback Futura/Century Gothic en el H1 display. Pendiente transversal del sitio.

### Decisiones de diseño/copy a confirmar con cliente
- **Color de la card Capital**: `#FFF200` (como en `rutas.html`) vs `#FF8500` (mapeo web del brand kit, P-02). Mantener coherencia home↔rutas.
- **CTA secundario del hero**: `#diagnostico` (recomendado) vs `/rutas`.
- **FAQ (5 preguntas y respuestas)**: validar redacción — son propuesta, no venían en el doc.
- **Title/meta** propuestos: confirmar (sobre todo si GSC revela una query principal distinta una vez dada de alta la propiedad).

### SEO/research pendiente
- **Dar de alta valorpyme.cl en la cuenta GSC de BnO** para validar queries/landing del home y no romper SEO (no fue posible en esta corrida: la propiedad no estaba en la cuenta).
- (Opcional) correr `semrush-research` si se busca capturar tráfico orgánico nuevo además de preservar el existente.

---

*Blueprint generado por pw-arquitecto — home transversal, AIDA + oferta Hormozi, 8 secciones en orden aprobado. Reutiliza el design system de `rutas.html`. Listo para el desarrollador.*
