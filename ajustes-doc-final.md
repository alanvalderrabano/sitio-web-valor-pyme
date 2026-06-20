# Overhaul de contenido del HOME — copys DEFINITIVOS del cliente (usar VERBATIM)

> El cliente entregó el copy final. Aplicar **tal cuál** en `site/index.html`. Mantener el design system, motion, navegación y el rediseño ya hecho. Solo cambia CONTENIDO + 2 secciones nuevas + ajustes puntuales indicados. Versionar `styles.css?v=9` en las 6 páginas si tocas CSS.

## Decisiones del cliente (tienen prioridad)
- **Sección Parallax B&N** ("Avanzar también es elegir mejor la siguiente ruta"): **quitar TODO el texto** (eyebrow + H2), dejar **solo la imagen** B&N. Hacerla **menos alta** y con el **parallax más agresivo** aún. Queda como banda decorativa B&N.
- **Sección rosa "Sé parte de la mayor comunidad…": ELIMINARLA por completo.** El rosa se reubica: aplicar el **fondo rosa (`#FF005B`) a la nueva sección "Blog destacado"** (cards blancas sobre rosa).
- **Convocatorias destacadas (carrusel): OMITIR** por ahora (no hay datos). No agregar esa sección.
- **Sección 6 Aliados: SOLO logos de socios** (lista abajo), no los 13.

---

## Orden final de secciones del home
1. Hero
2. ¿Qué es Valor Pyme? (la actual "No tienes que recorrer el camino solo")
3. Rutas Pyme (4 cards) — scroll horizontal, se mantiene
4. Diagnóstico
5. Aliados destacados (solo socios)
6. Banda Parallax B&N (solo imagen, baja, parallax agresivo)
7. Cómo ser parte (3 pasos) — verde, se mantiene
8. Blog destacado (NUEVA) — **fondo rosa #FF005B**
9. Preguntas frecuentes (FAQ) — nuevas Q&A
+ Footer (#2F2927, ya hecho)

---

## 1. HERO  (verbatim)
- **H1:** `Emprender es siempre un viaje.`
- **Subtítulo (strong):** `Una red de soluciones para acompañar el crecimiento de tu pyme.`
- **Párrafo de apoyo (reemplaza el actual):** `Accede a oportunidades, herramientas, formación, beneficios y una comunidad diseñada para ayudarte a enfrentar los desafíos de emprender y avanzar con más apoyo, información y conexiones.`
- **CTA principal:** label `Suscríbete gratis` → `#suscripcion` (antes decía "Súmate gratis"). Mantener el CTA secundario `Descubre tu ruta` → `#diagnostico`.
- Cambiar también el CTA del navbar (las 6 páginas comparten el patrón solo en index/rutas): en index.html el nav dice "Súmate gratis" → cambiar a **`Suscríbete gratis`** (`#suscripcion`). (En las páginas de ruta el nav dice "Registrarme", déjalo.)

## 2. ¿QUÉ ES VALOR PYME?  (la sección "No tienes que recorrer el camino solo")
- **Eyebrow:** `¿Qué es Valor Pyme?`
- **H2:** `No tienes que recorrer el camino solo.`
- **Cuerpo (3 párrafos, reemplaza TODO el body actual y el claim +150.000):**
  1. `Valor Pyme es una comunidad que conecta emprendedores y pymes con soluciones concretas para crecer.`
  2. `Reunimos a socios, partners y especialistas en un mismo ecosistema para facilitar el acceso a herramientas, oportunidades, formación y acompañamiento en cada etapa del viaje empresarial.`
  3. `Porque crecer no debería depender únicamente del esfuerzo individual.`
- **CTA:** `Conoce nuestra historia` → `#` (placeholder, página Nosotros aún no existe).
- **QUITAR la card flotante de desafíos (01–04 Conseguir capital / Llegar a más clientes / Ordenar la gestión / Formar un equipo)** — no está en el doc. La sección queda: encabezado a la izquierda, cuerpo + CTA a la derecha (ajustar el grid `hp-acomp` para que se vea bien sin la card).

## 3. RUTAS PYME  (scroll horizontal — mantener estructura/motion)
- **H2:** `Cada empresa tiene desafíos distintos. Encuentra tu ruta.`
- **Bajada (reemplaza la actual):** `Hemos organizado nuestras soluciones en cuatro rutas para ayudarte a avanzar según las necesidades de tu negocio.`
- **Cards** (mantener el nombre de ruta en el h3 con su dot/color y los logos que ya están dentro; cambiar el TAG, la DESCRIPCIÓN y el link):
  - **Ruta Capital** — tag: `Financiamiento y Capital` · desc: `Explora alternativas de financiamiento, inversión y herramientas económicas para dar solidez financiera a tu operación.` · link: `Ver ruta` → `/ruta-capital`
  - **Ruta Mercado** — tag: `Conexión Comercial y Mercado` · desc: `Conecta con nuevos clientes, canales de venta y redes comerciales para expandir tus fronteras y vender más.` · link: `Ver ruta` → `/ruta-mercado`
  - **Ruta Digitalización** — tag: `Transformación Tecnológica` · desc: `Adopta herramientas digitales, softwares y procesos modernos para automatizar tareas y optimizar tu tiempo.` · link: `Ver ruta` → `/ruta-digitalizacion`
  - **Ruta Talento y Gestión** — tag: `Capacitación y Procesos` · desc: `Desarrolla las habilidades de tu equipo y mejora la gestión interna para liderar una pyme eficiente y sostenible.` · link: `Ver ruta` → `/ruta-talento`
- El cue "Desliza para recorrer las rutas →" y el CTA "Ver todas las rutas" se mantienen.

## 4. DIAGNÓSTICO  (#6126FF, se mantiene)
- **H2:** `¿No sabes cuál es el mejor camino para tu empresa?`
- **Cuerpo (reemplaza):** `Cada pyme enfrenta desafíos distintos. Descubre las oportunidades más relevantes para tu negocio y encuentra la ruta que mejor se adapta a tus necesidades.`
- **CTA:** `Descubrir mi ruta` → `#diagnostico`

## 5. ALIADOS DESTACADOS  (solo socios)
- **Eyebrow:** `Aliados destacados`
- **H2 (Título):** `Una red construida para generar más oportunidades`
- **Lead (Texto):** `El motor del viaje: empresas con soluciones para los desafíos de las pymes`
- **Cuerpo:** `Reunimos empresas, instituciones y especialistas que colaboran para acercar soluciones reales a quienes emprenden.`
- **CTA:** `Conocer las alianzas` → `#aliados`
- **LOGOS — solo estos socios** (quitar buk, rindegastos, fintegram, salcobrand, misabogados, omia del grid de Aliados):
  - `bci.png` — Bci — tooltip/`title`: `Inclusión y educación financiera para un crecimiento sostenible.`
  - `blueexpress.png` — Blue Express — `Logística, cobertura y distribución de tus productos en todo Chile.`
  - `defontana.png` — Defontana — `Digitaliza la gestión de tu Pyme con ERP gratis y exclusivos descuentos para ordenar, controlar y escalar tu negocio.`
  - `pymeuc.png` — Facultad de Economía y Administración UC — `Formación, mentorías y evidencia para mejorar la productividad y el crecimiento de las PYMEs en Chile.`
  - `otic.png` — OTIC CChC — `Capacitación y desarrollo de talento para aumentar la productividad de las pymes de Chile.`
  - `microsoft.png` — Microsoft — `Tecnología, inteligencia artificial y herramientas digitales para acelerar la transformación pyme.`
  - `walmart.png` — Walmart Marketplace — `Nuevos canales y oportunidades de venta para llevar tus productos a todo Chile.`
  - **Multigremial Nacional** — descripción `La voz de las pymes que impulsa mejores condiciones para emprender en Chile.` → **NO tenemos el archivo de logo**. Dejar el espacio o un placeholder con el nombre en texto, y **reportar que falta el logo de Multigremial**. NO inventar logo.

## 6. BANDA PARALLAX B&N  (solo imagen)
- **Quitar** el eyebrow `Empresas en constante movimiento` y el H2 `Avanzar también es elegir mejor la siguiente ruta.` (sin texto).
- Dejar solo la foto B&N (`assets/img/franja-bn-mercado.jpg`) como banda.
- **Reducir la altura** de la banda (ej. `height: clamp(160px, 26vh, 320px)` en vez de la sección alta actual).
- **Parallax más agresivo** todavía (sube `data-parallax` a ~`0.7` y más overscan/inset para que no se vean bordes).
- Mantener un overlay sutil para que no choque (opcional).

## 7. CÓMO SER PARTE  (3 pasos, verde, se mantiene)
- **Eyebrow:** `Cómo ser parte`
- **H2:** `Comienza tu viaje en tres pasos`
- **Pasos (reemplaza subtítulos):**
  - 1 `Crea tu cuenta` — `Regístrate gratis y accede al ecosistema Valor Pyme.`
  - 2 `Completa tu perfil` — `Cuéntanos más sobre tu empresa para recomendarte contenidos y oportunidades relevantes.`
  - 3 `Explora y conecta` — `Accede a beneficios, recursos, iniciativas y espacios de aprendizaje junto a otras pymes.`
- **CTA:** `Quiero ser parte` → `#suscripcion`

## 8. BLOG DESTACADO  (NUEVA · **fondo rosa #FF005B**, cards blancas)
- **Eyebrow:** `Blog`
- **H2 (Título):** `Historias, aprendizajes y tendencias para pymes`
- **Texto:** `Descubre contenidos que te ayudarán a enfrentar desafíos, identificar oportunidades y fortalecer el crecimiento de tu empresa.`
- **CTA:** `Ir al blog` → `#`
- **3 cards de artículos REALES** (del sitio vivo, ya validados) — cada card: fecha + título + "Leer más" → `#`:
  1. `Cómo preparar la logística de tu Pyme para entregar una mejor experiencia a tus clientes` — `15 de junio, 2026`
  2. `Ley 40 Horas: guía práctica para que tu Pyme se adapte a los nuevos dictámenes de la Dirección del Trabajo` — `28 de mayo, 2026`
  3. `Operación Renta 2026: 3 indicadores que tu Pyme debería revisar hoy` — `25 de mayo, 2026`
- Esta sección usa el **rosa `#FF005B`** (reemplaza el clímax rosa eliminado). Cards blancas con texto oscuro para legibilidad; eyebrow/acento en amarillo o blanco.

## 9. PREGUNTAS FRECUENTES  (FAQ — reemplazar las 5 Q&A actuales por estas EXACTAS)
- **H2:** `Preguntas frecuentes`
- **Q&A (verbatim, actualizar el acordeón `<details>` Y el JSON-LD FAQPage; quitar la nota "provisional"):**
  1. **¿Qué es Valor Pyme?** — `Una comunidad gratuita que conecta emprendedores y pymes con soluciones, oportunidades, formación y beneficios para apoyar su crecimiento.`
  2. **¿Tiene algún costo participar?** — `No. El acceso a la comunidad es gratuito.`
  3. **¿Necesito ser cliente de alguna empresa socia?** — `No. Puedes registrarte y explorar las oportunidades disponibles para tu negocio.`
  4. **¿Cómo sé qué ruta es la adecuada para mí?** — `Puedes explorar las rutas o realizar el diagnóstico para descubrir las alternativas más relevantes según tu situación.`
  5. **¿Qué beneficios obtengo al registrarme?** — `Acceso a recursos, contenidos, actividades, oportunidades y soluciones ofrecidas por los socios y partners del ecosistema.`

---

## Reglas
- No tocar `rutas.html` ni `ruta-*.html` salvo lo ya hecho (navegación). El overhaul es solo del HOME (`index.html`) + CSS compartido (clases `hp-*`, sin regresión en otras páginas).
- Mantener un solo `<h1>`, motion, parallax, scroll horizontal, footer #2F2927.
- Versionar `styles.css?v=9` en las 6 páginas.
- Verificar en preview local (`/index.html`) los 4 viewports y que las otras páginas no se rompan.
- **Reportar pendientes:** falta logo de Multigremial Nacional; rutas reales de Suscripción/Diagnóstico/Aliados/Nosotros/Blog (siguen como `#`).
