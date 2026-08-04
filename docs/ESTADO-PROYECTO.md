# Estado del proyecto · Valor Pyme

**2026-08-04** · worktree `naypyidaw`, rama `ted` · repo `alanvalderrabano/sitio-web-valor-pyme`
Este documento es el contexto de trabajo. Reemplaza al historial de conversación.

## Objetivo

Sitio de Valor Pyme (red para pymes de Chile, respaldada por Bci y Pyme UC). En curso: portar
contenido del HubSpot antiguo (`valorpyme.cl`) al sitio nuevo con el brandbook 2026.

## Arquitectura

**Solo se despliega `site/`.** Cloudflare Pages sirve la carpeta tal cual, sin build. Merge a `main`
→ redeploy automático a `sitio-web-valor-pyme.pages.dev`.

| | |
|---|---|
| `site/` | 24 HTML + 7 CSS + 4 JS + 16 MB assets — **el sitio** |
| `functions/api/ask.js` | buscador IA (lo llama `script.js:167`) |
| `ted-local/` | proyecto Node que genera el TED en `site/` · 11 tests |
| `tools/serve-site.mjs` | preview con URLs limpias |
| `build-foro.py` / `build-recursos.py` | generan páginas desde JSON |
| `hubspot/valor-pyme-2026/` | theme del CMS · port parcial del home (**congelado 17-jul**) + **copia del TED** |
| `brand-kit.md` | referencia de marca **vigente** |
| `tools/` (otros 19), `brand-reference/` | one-shot ya ejecutados / consulta humana |

El cascarón (header + menú móvil + footer) está **copiado en las 24 páginas**; al crear una se extrae
de `index.html`. No hay plantillas.

⚠️ **Cloudflare devuelve 200 con el index para rutas inexistentes.** El status NO confirma publicación:
verificar por contenido y content-type contra una ruta de control inventada. El edge cachea; los
assets con `?v=` hay que pedirlos con el mismo query que usa la página.

## El TED y sus dos destinos

`ted-local/` es la **fuente única**. Se compila a dos sitios; ninguno de los dos es el que está
publicado hoy en `valorpyme.cl/descarga-test-de-digitalizacion`.

| Comando | Destino | Qué es |
|---|---|---|
| `npm run build:static` | `site/` | vista previa en Cloudflare, sin backend |
| `npm run build:hubspot` | `hubspot/valor-pyme-2026/` | copia de trabajo para el CMS |

**La copia del theme 2026 es la sucesora, no un experimento.** Decisión del cliente (1-ago-2026):
cuando esté al 100% se deshabilita la página actual y esta ocupa su lugar. Hasta entonces conviven.

**Mientras convivan, producción no se toca.** El TED publicado vive en el theme *antiguo* del portal
7800319, en el módulo `valor-pyme-ted`. La copia es `modules/ted.module` + `templates/ted.html`
dentro del theme "Valor Pyme 2026": rutas distintas del Design Manager, página distinta. Subir el
theme 2026 con el CLI no altera la página publicada.

**Qué tiene que estar cerrado antes del cambio:**

| | |
|---|---|
| `MEDIO-ALTO` sin formulario | crear el 8.º formulario (solo Marketing/eCommerce) y mapearlo |
| Cierre para las 4 `ALTO-*` | el negocio las marca N/A: hoy terminan el test sin nada en pantalla |
| Botón "Agendar ahora" de la TYP | `href` vacío en la variante por defecto |
| Pérdida silenciosa de respuestas | payload acumulativo (ver Pendientes) |
| Taller Modelo de Negocios | única fecha ofrecida, "9 de Julio", vencida |
| Propiedades de taller | 2 de las 4 documentadas no las escribe ningún formulario |
| Al cambiar la URL | conservar `/descarga-test-de-digitalizacion` o redirigir 301; revisar qué páginas y correos enlazan ahí |

⚠️ **La copia aísla el código, no los datos.** Sigue llamando a `/_hcms/api/store-ted-data` y
escribiendo las mismas propiedades de contacto del mismo portal. Probarla con correos reales
ensucia el CRM de producción. Para aislar de verdad hace falta sandbox o propiedades de prueba.

Los archivos generados llevan **"GENERADO por build-hubspot.mjs — no editar a mano"**: los cambios
van en `ted-local/src/` y se regeneran. Si no, la copia se separa de los tests.

## El portal por dentro (verificado por CLI, 1-ago-2026)

Descarga completa en `hubspot/_produccion/` — **ignorada por git: trae credenciales en claro**.
`hs cms fetch "<carpeta>" <destino> --account=valor-pyme`. Ojo: la cuenta por defecto del CLI es
**otra** (`bright-eye-solar`); sin `--account` se apunta al portal equivocado.

| Theme | Qué contiene |
|---|---|
| `Valor Pyme v2` | 18 MB · el TED en producción: `templates/TED2024.html` + `modules/valor-pyme-ted.module` |
| `Valor Pyme v2/serverless-functions.functions` | **5** funciones, no 2 |
| `Valor Pyme 2026` | el theme nuevo, **muy por delante de nuestra copia local** |
| `Valor Pyme 2026/diagnostico-2026` | ⚠️ **otro diagnóstico ya publicado**, ver abajo |
| `Valor Pyme v1` | las landing de talleres, incluida la TYP |

**Página en vivo:** `/descarga-test-de-digitalizacion` → `Valor Pyme v2/templates/TED2024.html`, PUBLISHED.
Hay 5 borradores más de la misma página apuntando a plantillas viejas.

**Las 5 funciones** (todas POST públicas y sin autenticación, token en claro en las 5):

| Endpoint | Quién lo llama |
|---|---|
| `store-ted-data` · `get-contact-ted-properties` | `valor-pyme-ted.module` |
| `get-contact-dimensions` | `ted-results-table.module` (que no usa ninguna plantilla) |
| `store-properties` | **nadie** — crea propiedades de contacto por API |
| `store-survey-data` | **nadie** — y está roto: usa `contactProperties`, que no existe |

🔴 **Nunca subir `hubspot/valor-pyme-2026/` entera.** La copia local es el port parcial del home
congelado en julio: **29 archivos compartidos difieren** del portal (entre ellos `styles.css` y
`main.js`, que usa todo el sitio) y el portal tiene **234 archivos que no tenemos**. Subir la carpeta
sería una regresión en un sitio con páginas publicadas. Solo se suben las 5 rutas del TED, que son
lo único que genera `build-hubspot.mjs`; el propio script las imprime al terminar.

⚠️ **Ya hay un diagnóstico 2026 publicado, y es otra cosa.** Decisión del cliente (1-ago-2026):
**no se toca.** Convive con el TED, no lo reemplaza. `/diagnostico-de-madurez-empresarial` →
`Valor Pyme 2026/diagnostico-2026/`, una app compilada con sus propias funciones
(`diagnostico-save`, `diagnostico-submit`) que **sí usan secrets**. Modelo distinto al del TED:
puntúa por las 4 rutas (`puntaje_financiero__capital`, `puntaje_mercado`,
`puntaje_digitalizacion__productividad`, `puntaje_gestion_y_talento`) más `puntaje_perfil`.
Es un diagnóstico distinto, con otro modelo de datos. **Resuelto: no se toca y no afecta al TED.**

**Paridad TED:** nuestra copia difiere de producción en **3 cosas**, las tres a propósito
(12b puntaje 10→100, 12e peso 2.5→1.25, dim5 peso 15→25). Todo lo demás es idéntico:
31 preguntas, propiedades, opciones, puntajes, pesos y los 6 juegos de rangos.

## Landing Programa Pyme Digital · v2

`site/programa-pyme-digital-v2.html` + `programa-v2.css` (namespace `ppd2-`).
**Publicada** en `/programa-pyme-digital-v2`. La original sigue intacta y sin tocar.

Dirección visual del rediseño de Figma, con el **contenido literal** del original: 2005 vs 2096
caracteres, las diferencias son los ceros de `01/02/03` y el texto de las tres píldoras del hero.

**El hero se reconstruyó capa por capa desde `Hero.svg`** (1440x718, lo entregó diseño): escena,
velo morado, curvas de marca y figura recortada. El orden importa — la figura va DESPUÉS de las
curvas, por eso pasan por detrás de ella. Las dos capas de imagen son el mismo lienzo de 1942x872,
así que comparten caja y encajan por construcción: recortar la figura y recolocarla la desalinea
y sale la mujer duplicada.

⚠️ **Tres divergencias de color, todas por contraste medido:**

| | Figma | v2 | |
|---|---|---|---|
| Acento del H1 | `#0BBB70` | `#2FE08F` | 2.64:1 sobre morado, mínimo 3 |
| Tinta del botón | blanco | morado profundo | 2.47:1 sobre el verde |
| Título Testimonios | blanco | morado profundo | 2.47:1 |

Resultado: **0 fallos WCAG AA**, igual que la página actual.

**Correcciones de jerarquía sobre el diseño:** las cinco bandas del Figma miden casi lo mismo
(ritmo de cartel). Aquí el hero es el más alto y la banda de conversión el más bajo, con el titular
al 54% del H1 — repite la misma acción y lleva al mismo enlace, no puede leerse como segunda
portada. El mosaico del brandbook va al 55% y se desvanece: a plena intensidad daba 5.36:1 contra
el morado, más del doble que el propio botón.

**Recursos de impresión adaptados:** las curvas conectoras nacían en x=0 de un lienzo de 2198px →
responsivas y animadas con barrido `clip-path`; el mockup de navegador con semáforos de macOS →
captura real del test.

**Gotchas anotados** (ya resueltos, pero vuelven a morder):
- `preserveAspectRatio="none"` convierte los círculos en elipses: las estaciones van FUERA del SVG.
- `stroke-dasharray` + `pathLength` + `non-scaling-stroke` no casan — los guiones se miden en px de
  pantalla y el trazo moría en el ancho del viewBox. Por eso la animación es un `clip-path`.
- La clase `reveal` del sitio pone `transform: none` al hacerse visible y **anula cualquier
  `translate` propio**. Si un elemento necesita centrarse con transform, no puede llevar `reveal`.
- `max-width` en `ch` con la display: el `0` es muy estrecho y 30ch se quedaba en 267px. Usar `rem`.

## Perfilamiento y UX del TED (4-ago-2026)

⚠️ **SUBIDO A HUBSPOT PERO SIN COMMITEAR EN GIT.** El portal tiene código que el repo no.
Si alguien clona el repo y regenera, pisa lo que hay en `Valor Pyme 2026/ted2026/`.

**14 campos de perfilamiento** en el formulario inicial. Configuración en `src/config/perfil.js`,
con los valores de opción **literales del portal** — una propiedad de tipo lista rechaza cualquier
valor fuera de su catálogo y una sola inválida tumba el POST entero. Verificados contra
`GET /crm/v3/properties/contacts`: las 14 existen, y **`etapa_de_la_pyme` SÍ existe** (la auditoría
de julio sospechaba que era `etapa_de_tu_pyme`; era falsa alarma). `bo_edad` es numérico, no lista.

Son solo informativos: no entran en puntaje, dimensiones, etapas ni en la elección del formulario
final. La paridad con producción sigue en **3 diferencias**, las tres aprobadas.

Decisiones tomadas al montarlo: el RUT no se pregunta dos veces (el campo que ya existía pasa a ser
el par condicional empresa/persona y sigue escribiendo `ted_3_rut`); "Nombre Completo" se parte en
dos; los campos nuevos son **opcionales**; se conserva "Nombre de tu Empresa", que no estaba en la
lista pero ya se pedía.

**Formulario en dos columnas.** El ancho lo decide `perfil.js` (`ancho: 'medio' | 'completo'`), no
el CSS. De 2322px a 1971px de página.

**Cuatro mejoras de UX**, ninguna toca el cálculo:

| | |
|---|---|
| Envío acumulativo | cada POST manda todo lo contestado. Probado tirando 32 de 33 POSTs: 31/31 respuestas llegan |
| Foco al enunciado | de 0/31 a 31/31 al avanzar. Reposiciona scroll, teclado y lectores |
| "1 de 31" | antes solo el porcentaje |
| Skip link | de 21 pulsaciones de Tab a la primera opción, a 2 |

### Trampas que costaron encontrar, y volverán

🔴 **HubSpot ELIMINA `<template>` dentro de `<select>`.** Generar opciones con `<template x-for>`
ahí dentro funciona en local y deja los 8 desplegables VACÍOS en el portal, con
`op is not defined`. Hay que crearlas con JS en `x-init`. **Verificar siempre en el portal, no solo
en local.**

⚠️ `$nextTick` no basta tras un `await`: en `nextQuestion` el tick se resuelve antes de que Alpine
aplique el `x-show`, y enfocar un elemento en `display:none` falla en silencio. Necesita
`requestAnimationFrame` encima. La pista fue que al retroceder (síncrono) sí funcionaba.

⚠️ `loading="lazy"` sobre una imagen sin `width`/`height` dentro de un grid centrado se calcula a
0x0, y una imagen de 0x0 nunca cruza el umbral de carga diferida. No carga porque no tiene tamaño
y no tiene tamaño porque no carga.

## Sistema de diseño

Tokens en `site/styles.css` `:root`.

Corporativo `#6126FF` · morado profundo `#330559` · lavanda `#EFE9FF` · soft `#F6F3FF`
Rutas: Capital `#FFF21C` · Mercado `#330559` · Digitalización `#FF2B5E` · Talento `#00BD70`
Display **Rubik** (fallback de FG Futurist, sin licencia) · cuerpo Arial · **radius 0** · `--maxw: 1240px`

**Sistema de líneas** (brand-kit §5): se construye desde un cuarto de círculo espejado y escalado —
sigmoides, nunca arcos. Las 4 líneas actúan como sistema, nunca una suelta. La estación solo en
intersecciones. Sobre foto: unas detrás, otras delante, sin tapar caras. **Prohibido inventar formas**
(barras, degradados). Patrones oficiales en `site/assets/lines/patron-*.svg`.

⚠️ **Dos contradicciones del brandbook sin resolver:** radios (§9.3 dice 30/25/24px, el theme usa 0) y
terminaciones de línea (§5.2.3 pide rectas, §5.3 recomienda `linecap: round`). Afectan a cualquier
hero que se elija.

## Decisiones finales

- Texto de páginas portadas: **literal del original**, verificado bloque a bloque.
- Un solo `<h1>` por página.
- Videos >25 MB se quedan en HubSpot (límite de Cloudflare). Fachada: póster local + iframe al pulsar.
- Contenido de flujo cerrado con `noindex`.
- Colores de etapa del TED: fuente única en `stages.js`; `ted.js` los publica con `setProperty`
  (**un grep estático no los ve — no están rotos**).
- Hero de `programa-pyme-digital`: claro (lavanda + foto a sangre). **Nunca reutilizar el hero del home.**

## Convenciones

- CSS por página namespaced: `bl-` blog · `fr-` foro · `rc-`/`rd-` recursos · `ppd-` programa ·
  `cap-` cápsulas · `op-` heroes · `hp-` home. Lo global en `styles.css`.
- Comentar el porqué. Marcar divergencias vs. el original con `DIVERGENCIA`.
- Verificar en navegador (contraste, solapes, estados computados), no por grep.
- **Antes de commitear CSS: comprobar balance de `/* */` y `{ }`.** Ya se desplegó un comentario
  huérfano que anulaba la regla siguiente.
- Commits y PRs en español. **No commitear ni desplegar sin pedirlo.**

## Estado

**En `main`:** PRs #12–#18 — `ted-local/`, TED publicado, páginas `programa-pyme-digital` y
`digitalizacion-principiante-tendencias`, hero claro y página de 6 patrones de hero.

**Auditoría hecha (solo lectura).** Hallazgos: 47 assets huérfanos (3,65 MB, 23% del peso) · 46 clases
muertas en `styles.css` · bloque `.bl-hero` muerto con referencia rota en `blog.js:12` · 3 heroes
idénticos (`.bl-hero`/`.fr-hero`/`.rc-hero`) · 9 tarjetas, 6 grids, 5 chips duplicados · 2 vocabularios
de color (`--color-*` y `--c-*`) · 4 páginas huérfanas · 7 enlaces `/blog/<slug>` rotos (no existe
`site/blog/`) · 81 `href="#"` muertos · anclas de footer inconsistentes.

**En `main`:** PRs #19–#21 — landing v2 publicada, correcciones del TED verificadas contra el
portal, y el TED como carpeta `ted2026/` del theme 2026 (subida al Design Manager).

🔴 **Token de Private App en claro** en las 5 serverless functions del portal
(`Valor Pyme v2/serverless-functions.functions/`). Verificado que **NUNCA entró en git** —
`hubspot/_produccion/` se añadió al `.gitignore` ANTES de descargar. Pero sigue expuesto en el
portal. Rotarlo y pasarlo a `secrets`, como ya hace el `serverless.json` del buscador IA.

## Riesgos

3 worktrees, dos sucios. Borrar en `main` les genera conflictos.

| Worktree | Estado |
|---|---|
| `Documents/IA/VP-web26` (`main`) | **79 commits atrás**, 31 sin commitear — incluye un CV en PDF y un CSV bancario dentro de `site/assets/` |
| `melbourne` (`actualizar-hero-rutas`) | 2 adelante, **24 sin commitear** |
| `naypyidaw` (`ted`) | limpio |

## Orden recomendado

1. **Enlazar las 3 páginas huérfanas** que construimos — trabajo hecho e invisible. Media hora.
2. **Reportar los 4 bugs del TED** (abajo). El #4 pierde leads hoy.
3. **Ordenar los worktrees** antes de limpiar nada.
4. **Limpieza**, solo la parte verificada: 47 assets + 46 clases + `.bl-hero`. Dejar fuera `hubspot/`
   y todo lo marcado "para revisión".

**No consolidar aún** los componentes duplicados: tocar `styles.css` afecta a las 24 páginas y hay dos
worktrees con cambios sin mergear sobre ese archivo.

## Pendientes

**Bloqueantes (decisión de cliente o diseño):**
1. Cerrar las 2 contradicciones del brandbook.
2. Elegir uno de los 6 patrones de hero (`/programa-hero-opciones`).
3. Formulario de perfilamiento del TED: 14 campos pedidos, solo 4 verificables en el portal.
   `etapa_de_la_pyme` probablemente no existe — la real es `etapa_de_tu_pyme`.

**4 bugs vivos en `valorpyme.cl`** (detalle en `ted-local/docs/ANALISIS.md` §4; corregidos solo en local):
1. `ted_3_procesos` guarda la etapa de Marketing, no de Procesos.
2. Cada marca de checkbox se registra dos veces → el CRM recibe `"; ; a; ; c"`. Afecta a 11 preguntas.
3. Con puntaje perfecto el total da 101 y la dimensión 5 se sale de rango → resultados sin etapa.
4. **Faltan 6 combinaciones en el mapa de formularios → esos usuarios no reciben informe.**

Además: rosa, naranja y verde de marca dan 3.65:1, 2.44:1 y 2.47:1 sobre blanco — **no sirven como
color de texto**.

**Contenido:** `<title>` de cápsulas en producción dice "Curso modelo de negocios 3" · H1 y título de
Cápsula 3 son el mismo string · faltan duraciones (3:53/4:22/4:25) y descripciones · el video del
testimonio **no tiene audio** (20 s mudos) · "menos de 5 minutos" vs "4 min" del TED · un solo
testimonio bajo título en plural.

**Técnicos:** conectar `/blog/<slug>` o retirar `blog-post.html` · unificar anclas del footer ·
`blog.css` se pide con 3 cache-busters distintos.

## Entorno

```bash
node tools/serve-site.mjs --port 4400    # sitio con URLs limpias
cd ted-local && npm run dev              # TED con backend simulado (4321)
cd ted-local && npm test                 # 11 tests
python3 build-foro.py                    # regenera foro desde foro.json
python3 build-recursos.py                # regenera recursos desde recursos.json
node ted-local/build-static.mjs          # regenera el TED en site/
```
