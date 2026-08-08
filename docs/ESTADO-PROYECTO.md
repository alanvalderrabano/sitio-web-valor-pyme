# Estado del proyecto · Valor Pyme

**2026-08-04** · worktree `naypyidaw`, rama `ted` · repo `alanvalderrabano/sitio-web-valor-pyme`
Este documento es la memoria de trabajo. Reemplaza al historial de conversación.

---

## 1 · Objetivo

Sitio de Valor Pyme, red de soluciones para pymes de Chile respaldada por Bci y Pyme UC.
En curso: **portar el contenido del HubSpot antiguo (`valorpyme.cl`) al sitio nuevo con el
brandbook 2026**, y migrar el Test de Digitalización (TED) al theme nuevo.

---

## 2 · Arquitectura

**Solo se despliega `site/`.** Cloudflare Pages la sirve tal cual, sin build. Merge a `main`
→ redeploy automático a `sitio-web-valor-pyme.pages.dev`.

| | |
|---|---|
| `site/` | 26 HTML + 11 CSS + JS + assets — **el sitio** |
| `ted-local/` | proyecto Node que genera el TED · 21 tests · única dependencia: esbuild |
| `hubspot/valor-pyme-2026/` | theme del CMS · port parcial del home (**congelado 17-jul**) + `ted2026/` |
| `hubspot/_produccion/` | descarga del portal para comparar · **IGNORADA POR GIT: trae el token** |
| `functions/api/ask.js` | buscador IA (Cloudflare) |
| `tools/serve-site.mjs` | preview con URLs limpias |
| `brand-kit.md` | referencia de marca **vigente**, 525 líneas |

El cascarón (header + menú móvil + footer) está **copiado en cada página**; al crear una se extrae
de otra. No hay plantillas.

**Stack:** HTML/CSS/JS sin framework · Alpine.js 3 + `@alpinejs/persist` en el TED · Python solo
para los generadores desde JSON (`build-foro.py`, `build-recursos.py`).

⚠️ **Cloudflare devuelve 200 con el index para rutas inexistentes.** El status NO confirma
publicación: verificar por **contenido** contra una ruta de control inventada.

---

## 3 · El TED y sus dos destinos

`ted-local/` es la **fuente única**. Se compila a dos sitios:

| Comando | Destino | Qué es |
|---|---|---|
| `npm run build:static` | `site/` | vista previa en Cloudflare, sin backend |
| `npm run build:hubspot` | `hubspot/valor-pyme-2026/ted2026/` | el que va al CMS |

**La copia del theme 2026 es la sucesora, no un experimento.** Decisión del cliente (1-ago):
cuando esté al 100% se deshabilita la página actual y esta ocupa su lugar.

**El TED publicado hoy** vive en el theme *antiguo* (`Valor Pyme v2/templates/TED2024.html` +
`modules/valor-pyme-ted.module`). No se toca.

⚠️ **La copia aísla el código, NO los datos.** Llama a las mismas serverless functions y escribe
las mismas propiedades del mismo portal. Probar con correos reales ensucia el CRM.

🔴 **Nunca subir `hubspot/valor-pyme-2026/` entera.** La copia local es el port congelado en julio:
**29 archivos compartidos difieren** del portal (entre ellos `styles.css` y `main.js`) y el portal
tiene **234 que no tenemos**. Solo se sube `ted2026/`, que es lo único que genera el build.

---

## 4 · El portal HubSpot por dentro (verificado por CLI, 1-ago)

`hs cms fetch "<carpeta>" <destino> --account=valor-pyme`
⚠️ La cuenta por defecto del CLI es **otra** (`bright-eye-solar`); sin `--account` se apunta mal.

| Theme | Qué contiene |
|---|---|
| `Valor Pyme v2` | el TED en producción · 18 MB |
| `Valor Pyme v2/serverless-functions.functions` | **5** funciones |
| `Valor Pyme 2026` | el theme nuevo, muy por delante de nuestra copia local |
| `Valor Pyme 2026/diagnostico-2026` | **otro diagnóstico ya publicado — NO se toca** (decisión del cliente). Modelo distinto: puntúa por las 4 rutas |
| `Valor Pyme v1` | las landing de talleres, incluida la TYP |

**Las 5 funciones** (todas POST públicas y sin autenticación):

| Endpoint | Quién lo llama |
|---|---|
| `store-ted-data` · `get-contact-ted-properties` | `valor-pyme-ted.module` |
| `get-contact-dimensions` | `ted-results-table.module` (que no usa ninguna plantilla) |
| `store-properties` | **nadie** — crea propiedades de contacto por API |
| `store-survey-data` | **nadie** — y está roto: usa `contactProperties`, que no existe |

---

## 5 · Decisiones técnicas tomadas

- **Texto de páginas portadas: literal del original**, verificado bloque a bloque con diff automático.
- Un solo `<h1>` por página.
- Videos >25 MB se quedan en HubSpot (límite de Cloudflare). Fachada: póster local + iframe al pulsar.
- Contenido de flujo cerrado con `noindex`.
- Colores de etapa del TED: fuente única en `stages.js`; `ted.js` los publica con `setProperty`
  (**un grep estático no los ve — no están rotos**).
- **El brandbook manda sobre los SVG entregados**: `--color-menta` es `#A6FFD9` (Pantone 331 C),
  no el `#87FFD6` que usan los archivos de diseño. Decisión del cliente del 3-ago.
- **Las cuatro combinaciones `ALTO-*` no reciben formulario**: el negocio las marca "N/A" en la
  matriz. No es un hueco, es diseño. `MEDIO-ALTO` sí debería tener y **falta crearlo**.
- Los IDs de formulario son **campos del módulo**, editables desde el editor de páginas.
- El JS del TED en HubSpot va **empaquetado con esbuild en un solo archivo** (ver §8).

---

## 6 · Convenciones

- CSS por página con namespace: `hp-` home · `bl-` blog · `fr-` foro · `rc-`/`rd-` recursos ·
  `ppd2-` landing v2 · `typ-` TYP · `ds-` sistema. Lo global en `styles.css`.
- Comentar **el porqué**. Marcar divergencias vs. el original con `DIVERGENCIA`.
- **Verificar en navegador** (contraste, solapes, estados computados), no por grep.
- **Antes de commitear CSS: comprobar balance de `/* */` y `{ }`.** Ya se desplegó un comentario
  huérfano que anuló la regla siguiente.
- Los archivos generados llevan **"GENERADO por … — no editar a mano"**.
- Commits y PRs en español. **No commitear ni desplegar sin pedirlo.**

---

## 7 · Restricciones

- **No tocar el TED publicado** mientras convivan las dos versiones.
- **No subir nada a HubSpot sin pedirlo.** Y verificar en el portal, no solo en la build local.
- El contenido de las páginas portadas es **literal**; añadir texto requiere aprobación.
- Los campos de perfilamiento son **solo informativos**: no pueden entrar en el cálculo.

---

## 8 · Problemas conocidos y cómo se resolvieron

### Trampas de plataforma (volverán a morder)

🔴 **HubSpot ELIMINA los `<template>` dentro de `<select>`.** Generar opciones con
`<template x-for>` ahí dentro funciona en local y deja **todos los desplegables vacíos** en el
portal, con `op is not defined`. Solución: crearlas con JS en `x-init`.

🔴 **HubSpot mueve cada JS del theme a su propia URL generada**, lo que rompe los imports de un
módulo ES (404). Y **re-minifica los `.min.js` de terceros y los corrompe** (Alpine pasaba de
46346 bytes válidos a 46205 rotos). Solución: **todo el JS empaquetado en un solo archivo**.

⚠️ `meta.json` de un módulo: `content_types` válidos son `["LANDING_PAGE","SITE_PAGE"]` y
`host_template_types: ["ANY"]`. `"PAGE"` **no existe** — `hubspot/MODULE_SPEC.md` lo dice mal.

### Trampas del código propio

⚠️ **La clase `reveal` del sitio pone `transform: none`** al hacerse visible y anula cualquier
`translate` propio. Si un elemento necesita centrarse con transform, no puede llevar `reveal`.

⚠️ **`$nextTick` no basta tras un `await`**: el tick se resuelve antes de que Alpine aplique el
`x-show`, y enfocar un elemento en `display:none` falla en silencio. Necesita
`requestAnimationFrame` encima.

⚠️ **`loading="lazy"` sin `width`/`height`** dentro de un grid centrado se calcula a 0×0, y una
imagen de 0×0 nunca cruza el umbral de carga diferida.

⚠️ **`max-width` en `ch`** con la tipografía display: el `0` es muy estrecho y `30ch` se quedaba
en 267px. Usar `rem` o `em`.

⚠️ **`preserveAspectRatio="none"`** convierte los círculos de un SVG en elipses. Sacarlos del SVG.

⚠️ **`stroke-dasharray` + `pathLength` + `non-scaling-stroke` no casan**: los guiones se miden en
píxeles de pantalla y el `pathLength` en unidades del viewBox. Animar con `clip-path`.

### Del propio proceso

⚠️ **El mapeo de propiedades en Excel describe intenciones, no la realidad.** Dos "correcciones"
suyas resultaron falsas al contrastarlas con `GET /crm/v3/properties/contacts`. **Verificar
siempre contra el esquema del portal antes de cambiar un nombre de propiedad.**

⚠️ **Una propiedad de tipo lista rechaza cualquier valor fuera de su catálogo, y una sola inválida
tumba el POST entero** — con él, todo lo demás del envío.

---

## 9 · Estado actual

**En `main`:** PRs #12–#23.

| Publicado en Cloudflare | |
|---|---|
| `/programa-pyme-digital-v2` | landing — **mix aprobado por el Equipo Fé** (ver abajo) |
| `/cupo-registrado-taller-ppd-v2` | TYP con propuesta visual · fondo verde de ruta |
| `/design-system` | página de sistema, lee del CSS real · `noindex` |
| `/descarga-test-de-digitalizacion` | vista previa del TED, sin backend |

**En HubSpot:** `Valor Pyme 2026/ted2026/` con los 14 campos de perfilamiento y las mejoras de UX.

**Sin pushear:** el commit `cd6f328` está solo en local.

### Programa Pyme Digital · mix del Equipo Fé (2026-08-07)

`/programa-pyme-digital-v2` deja de ser "la v2" y pasa a ser **la propuesta final**: un mix de las
dos versiones. La v1 (`/programa-pyme-digital`) queda intacta como referencia.

- **De la v1:** hero claro sobre lavanda, "¡Realiza el test ahora!" centrado y testimonios a dos
  columnas sobre blanco.
- **De la v2:** los 3 pasos con numerales y curvas conectoras, y los beneficios sobre menta.
- **Rechazado por el equipo y eliminado del hero** (sin sustituto equivalente): el degradado morado
  sobre la foto, las curvas decorativas y las píldoras flotantes. La fotografía se conserva, en
  **formato cuadrado**: `assets/photos/brand/ppd-hero-cuadrada.jpg`, recorte 872×872 de
  `ppd-hero-escena.jpg`.
- **CTA:** `btn--xl` en el hero y `btn--lg` más abajo (modificadores nuevos en `styles.css`; solo
  cambian tamaño, aire y sombra — el color de acción sigue siendo el morado corporativo).
- **Ruta:** ambas páginas declaran `data-ruta="talento"`, así `--ruta` = `#00BD70`. En la TYP el
  filo del grupo "apanio" pasó de rosa (Ruta Digitalización) a verde profundo para no mezclar rutas.
- **TYP:** el hero mantiene la composición aprobada —mosaico del brandbook con el desvanecido
  hacia abajo— pero en el **verde de ruta**: fondo `#00BD70` y patrón en menta `#A6FFD9`
  (`patron-mosaico.svg`, no hizo falta asset nuevo; 2.11:1, la misma sutileza que tenía el rosa
  claro sobre rosa). El disco del visto va en `#00733E` (blanco sobre `#00BD70` daba 2.47:1).
- Ambas páginas **no tenían el bloque `.mobile-menu`**: el botón hamburguesa no abría nada por
  debajo de 900px. Añadido.

### Lo hecho en el TED

- **3 correcciones de cálculo** verificadas contra el portal: `question-12b` puntaje 10→100,
  `question-12e` peso 2.5→1.25, dimensión 5 peso 15→25. Un cuestionario perfecto ya da 100 y no 101.
- **14 campos de perfilamiento** (`src/config/perfil.js`), solo informativos, en dos columnas.
  Las 14 propiedades existen en el portal — **`etapa_de_la_pyme` SÍ existe** (una sospecha anterior
  de que era `etapa_de_tu_pyme` resultó falsa). `bo_edad` es numérico, no lista.
- **Envío acumulativo**: cada POST manda todo lo contestado. Probado tirando 32 de 33 POSTs: llegan
  las 31 respuestas. Antes se perdían en silencio.
- **Foco al enunciado** al cambiar de pregunta (0/31 → 31/31), **"1 de 31"** y **skip link**
  (de 21 pulsaciones de Tab a la primera opción, a 2).
- El formulario de la combinación anterior ya no se queda en pantalla al volver a terminar.

---

## 10 · Pendientes

### 🔴 Bloqueantes

1. **Rotar el token de Private App.** Está en claro en las 5 serverless functions del portal, con
   `"secrets": []`. Verificado que **nunca entró en git**, pero está expuesto en el Design Manager.
   Modelo a seguir: el `serverless.json` del buscador IA, que sí usa `secrets`.
2. **Crear el formulario `MEDIO-ALTO`** (solo taller de Marketing/eCommerce) y pegar su ID en el
   módulo. Es el único hueco real del mapa.
3. **Botón "Agendar ahora" de la TYP**: `href` vacío en la variante por defecto del módulo en
   `Valor Pyme v1`. Hoy recarga la página sobre sí misma.

### 🟡 Importantes

4. **`ted_3_flujo_correos` viaja vacío.** En `showResults()` se envía dos líneas antes de
   calcularse. Viene de producción. El cliente considera que los workflows no son nuestro alcance,
   pero **la propiedad la escribe este código**.
5. **Los perfiles `ALTO` terminan sin nada** en pantalla: ni mensaje ni siguiente paso. Necesita
   copy del negocio.
6. **Fecha vencida**: `taller_modelo_de_negocios` ofrece una única opción, "Jueves 9 de Julio".
7. **Propiedades de taller**: 2 de las 4 documentadas no las escribe ningún formulario.
8. Contradicciones del brandbook sin resolver: radios (§9.3 dice 30/25/24px, el theme usa 0) y
   terminaciones de línea (§5.2.3 rectas vs §5.3 redondeadas).

### 🟢 Deuda técnica

9. **Consolidar componentes.** El `/design-system` lo cuantifica: 566 clases, 37 prefijos, 13
   formas de hacer una tarjeta, 12 heroes, 10 grids. Empezar por las tarjetas.
10. **Limpieza pendiente de aprobación**: 47 assets huérfanos (3,65 MB), 46 clases muertas en
    `styles.css`, bloque `.bl-hero` con referencia rota en `blog.js:12`. **No consolidar aún**:
    tocar `styles.css` afecta a todas las páginas y hay worktrees sin mergear.
11. Contenido: `<title>` de cápsulas dice "Curso modelo de negocios 3" · el vídeo del testimonio
    **no tiene audio** · "menos de 5 minutos" vs "4 min" · un testimonio bajo título en plural.

### Riesgo de worktrees

| Worktree | Estado |
|---|---|
| `Documents/IA/VP-web26` (`main`) | **31 sin commitear** — incluye un CV en PDF y un CSV bancario en `site/assets/` |
| `melbourne` (`actualizar-hero-rutas`) | **24 sin commitear** |
| `seville` (`hero-design-proposals`) | 2 sin commitear |
| `naypyidaw` (`ted`) | limpio, 1 commit sin pushear |

Borrar en `main` genera conflictos a los otros.

---

## 11 · Entorno

```bash
node tools/serve-site.mjs --port 4400    # sitio con URLs limpias
cd ted-local && npm run dev              # TED con backend simulado (4321)
cd ted-local && npm test                 # 21 tests
cd ted-local && npm run build:static     # regenera el TED en site/
cd ted-local && npm run build:hubspot    # regenera ted2026/ del theme
python3 build-foro.py                    # regenera foro desde foro.json
python3 build-recursos.py                # regenera recursos desde recursos.json

hs cms list  "<carpeta>" --account=valor-pyme
hs cms fetch "<carpeta>" <destino> --account=valor-pyme
hs cms upload hubspot/valor-pyme-2026/ted2026 "Valor Pyme 2026/ted2026" --account=valor-pyme
```

**Datos no verificados** que conviene comprobar antes de usarlos:

- Si los 4 bugs históricos del TED siguen vivos en la página publicada. Confirmado solo el de
  `ted_3_procesos`, que usa `dimensions[2]` (Marketing) en vez de `dimensions[4]`.
- Si existen contactos duplicados por el desfase del índice de búsqueda de HubSpot en
  `findContactByEmail` — es un riesgo teórico, no reproducido.
- Qué llama a `store-properties`, `store-survey-data` y `get-contact-dimensions` fuera del theme.
