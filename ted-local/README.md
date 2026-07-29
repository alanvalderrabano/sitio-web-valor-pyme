# TED local — Test de Digitalización

Copia funcional de <https://www.valorpyme.cl/descarga-test-de-digitalizacion> para estudiarlo,
modificarlo y adaptarlo sin tocar el portal de HubSpot.

No es un volcado estático: el cuestionario, el motor de puntaje y los dos endpoints del backend
están reimplementados y **verificados contra el bundle original** (`npm test` compara los dos
motores sobre 300 cuestionarios llenados al azar).

El diagnóstico completo del sitio original está en **[`docs/ANALISIS.md`](docs/ANALISIS.md)** —
léelo antes de cambiar la lógica de puntaje.

---

## Levantarlo

Necesitas **Node 18 o superior**. No hay dependencias que instalar.

```bash
cd ted-local
npm run dev
```

→ <http://localhost:4321>

Otro puerto: `npm run dev -- --port 8080`.

### Comandos

| Comando | Qué hace |
|---|---|
| `npm run dev` | levanta el sitio y los mocks del backend |
| `npm test` | verifica que el puntaje siga coincidiendo con el del sitio real |
| `npm run reset` | vacía el "CRM" local (`server/data/contacts.json`) |

Para partir de cero en el navegador, además borra el `localStorage` del sitio: el test guarda
el avance ahí a propósito, igual que el original.

---

## Estructura

```
ted-local/
├── public/                  lo que se sirve tal cual
│   ├── index.html           las 4 pantallas (home · contacto · encuesta · resultados)
│   └── assets/
│       ├── css/ted.css      estilos del módulo (el resto viene del theme, ver abajo)
│       └── img/             imágenes traídas del sitio original
│
├── src/
│   ├── config/              DATOS — se editan sin tocar lógica
│   │   ├── questions.js       las 31 preguntas, sus opciones y sus puntajes
│   │   ├── stages.js          las 4 etapas, sus rangos y sus colores
│   │   ├── dimensions.js      las 5 dimensiones, sus pesos y sus propiedades de CRM
│   │   ├── forms.js           mapa resultado → formulario de descarga
│   │   └── api.config.js      rutas del backend, portal de HubSpot, flags
│   │
│   ├── lib/                 LÓGICA PURA — sin DOM, testeable
│   │   ├── scoring.js         puntaje, etapas y progreso por dimensión
│   │   ├── rut.js             validación de RUT chileno y parseo de nombre
│   │   └── api.js             cliente de los dos endpoints
│   │
│   └── components/
│       └── ted.js           el componente Alpine: máquina de estados de la vista
│
├── server/
│   ├── mock-api.mjs         servidor estático + mocks del backend de HubSpot
│   └── data/contacts.json   el "CRM" local (se crea solo; está en .gitignore)
│
├── tests/
│   ├── scoring.test.mjs     test de paridad contra el bundle original
│   └── fixtures/            el bundle original, como referencia
│
├── vendor/                  Alpine, alpine-persist y gauge.js versionados
└── docs/
    ├── ANALISIS.md          diagnóstico del sitio original
    └── superpowers/specs/   diseño del restyle con el theme
```

La separación es deliberada: **`config/` son datos, `lib/` es lógica, `components/` es vista.**
Para cambiar preguntas o pesos no hace falta abrir un solo archivo de lógica.

---

## Qué se sustituyó y por qué

El original depende de servicios de HubSpot que no existen fuera del portal. Cada uno tiene su
reemplazo local, con **el mismo contrato** — el front no sabe contra cuál está hablando.

| Servicio original | Reemplazo local | Dónde |
|---|---|---|
| `POST /_hcms/api/store-ted-data` | mismo path, escribe en un JSON en disco | `server/mock-api.mjs` |
| `POST /_hcms/api/get-contact-ted-properties` | mismo path, lee del JSON | `server/mock-api.mjs` |
| CRM de HubSpot | `server/data/contacts.json`, deduplicado por correo | — |
| Formularios de HubSpot (`hbspt.forms`) | formulario mock con los mismos campos | `renderForm()` en `src/components/ted.js` |
| Informe por correo (workflow de HubSpot) | `GET /api/report?email=…` devuelve un HTML descargable | `server/mock-api.mjs` |
| `styles.css` compilado del tema viejo | el `styles.css` real del theme Valor Pyme 2026, servido en `/theme/` | `server/mock-api.mjs` |

Para volver a apuntar a HubSpot de verdad, basta con `useMockForms: false` en
`src/config/api.config.js` y servir esto desde el portal: los paths ya coinciden.

### Utilidades del servidor local

```bash
curl localhost:4321/api/contacts          # ver todo el "CRM"
open "localhost:4321/?c=<contactId>"      # reabrir un resultado ya rendido
```

`?c=<contactId>` es la misma función que en producción: rehidrata la pantalla de resultados
desde el backend, sin volver a responder.

### Dónde la copia NO se comporta igual que el original

Cuatro divergencias deliberadas, todas marcadas con un comentario `DIVERGENCIA` en el código y
explicadas en [`docs/ANALISIS.md` § 4](docs/ANALISIS.md). Son correcciones de bugs que rompen el
flujo, no mejoras de estilo:

| # | En el original | En la copia |
|---|---|---|
| 1 | `ted_3_procesos` guardaba la etapa de **Marketing** (copy-paste de `dimensions[2]`) | usa `dimensions[4]`, que es Procesos |
| 2 | cada marca de un checkbox se registraba **dos veces** y el CRM recibía `"; ; a; ; c"` | `storeAnswer` es la única fuente; llega `"; a; c"` |
| 3 | con puntaje perfecto el total da **101** y la dimensión 5 se sale de rango → pantalla de resultados **sin etapa** | `getStage(..., {clamp:true})` satura al extremo; siempre hay etapa |
| 4 | faltan 6 combinaciones en el mapa de formularios → esos usuarios **no reciben informe** | `fallbackFormId` como respaldo |

El motor de puntaje **sin** `clamp` sigue siendo idéntico al original — es lo que compara
`npm test`. El `clamp` solo actúa donde el original devolvía `undefined`.

### Sobre los estilos

El TED **ya no usa Tailwind**. Lleva el look and feel del theme HubSpot "Valor Pyme 2026":
tipografía Rubik, esquinas rectas, morado corporativo y la paleta de marca.

El servidor monta `/theme/` apuntando a los assets **reales** del theme
(`../hubspot/valor-pyme-2026/assets/`), sin copiarlos. El `index.html` carga primero
`/theme/css/styles.css` y después `/assets/css/ted.css`, el mismo orden que tendrá en HubSpot.
Consecuencia buscada: lo que ves en local es lo que se verá dentro del theme, y cualquier cambio
de marca lo hereda el TED solo.

`ted.css` solo tiene lo propio del módulo, namespaced `.ted-*` (siguiendo el precedente `hp-*`
del home). Todo lo demás sale de los tokens del theme: `--color-*`, `--font-*`, `--text-*`,
`--radius-*`, `--shadow-*`, `--maxw`, `--pad-x`, y los componentes `.btn` / `.btn--ghost`.

**Los colores de etapa se declaran una sola vez**, en `src/config/stages.js`. `ted.js` los publica
como custom properties (`--ted-tradicional`, …) sobre el elemento raíz, y de ahí los toman el CSS
y el velocímetro. Cambiar la paleta ahí repinta las tres cosas a la vez.

**El header y el footer también salen del theme.** El servidor los lee de
`partials/header.html` y `partials/footer.html` al servir la página, resolviendo las marcas
`<!-- #include partial="..." -->` del `index.html` (`injectPartials()` en `server/mock-api.mjs`).
No hay copia local que mantener. Se carga además `/theme/js/main.js`, que es lo que hace
funcionar el menú móvil, los dropdowns, la sombra del header al scrollear y el año del footer.

El precio del enfoque: **el TED ya no se puede abrir aislado del theme.** Es deliberado — el
destino es ser un módulo de ese theme.

### ⚠️ La copia del theme en este worktree está desactualizada

`/theme/` apunta por defecto a `../hubspot/valor-pyme-2026`, que es lo que hay en `origin/main`.
El worktree **melbourne** va **9 commits adelante y con 24 archivos sin commitear**, y su
`styles.css` tiene **727 líneas más** (1941 vs 1214) y ~20 módulos que aquí no existen.

Los partials del header y el footer **sí son idénticos** en ambos, así que el cascarón es fiel.
Lo que puede diferir es el detalle visual del módulo.

Para ver el TED contra el theme al día:

```bash
npm run dev -- --theme ../../melbourne/hubspot/valor-pyme-2026
```

También sirve la variable `TED_THEME_DIR`. El servidor imprime al arrancar contra cuál está
corriendo.

El diseño y las decisiones están en
[`docs/superpowers/specs/2026-07-29-ted-restyle-theme-2026-design.md`](docs/superpowers/specs/2026-07-29-ted-restyle-theme-2026-design.md).

---

## Verificación

Lo que está comprobado, y cómo:

- **Paridad de puntaje** — `npm test` carga el bundle minificado original en un sandbox y compara
  puntaje global, etapa, y score/etapa/avance de las 5 dimensiones sobre 300 cuestionarios
  aleatorios con semilla fija. **11 tests, todos en verde.**
- **Flujo completo en Chromium** — home → contacto → 31 preguntas → resultados, con rechazo de
  RUT inválido, bloqueo de "Siguiente" sin responder, velocímetro dibujado, formulario mock,
  rehidratación por `?c=` y descarga del informe. Sin errores de consola.
- **Ramas del flujo** — botón Atrás (conserva la respuesta), selección múltiple (marcar y
  desmarcar), modal de "comenzar de nuevo" (cancelar y confirmar), y el caso de **puntaje
  máximo**, que es donde el original se rompe.
- **Payload al CRM** — interceptado desde el navegador y comparado con el formato esperado.
- **Restyle** — las 4 pantallas capturadas en 1280 px y 390 px antes y después, para confirmar
  que la estructura no se movió.
- **Contraste** — medido sobre los 4 colores de etapa. Rosa, naranja y verde de marca dan
  3.65:1, 2.44:1 y 2.47:1 sobre blanco, **por debajo del 4.5:1 de AA**; por eso el nombre de la
  etapa va en el morado de texto (16:1) y el color queda como acento en el borde y el punto.

## Limitaciones conocidas

- **El contenido de los informes es de HubSpot.** Los 11 formularios y sus workflows viven en el
  portal `7800319`; el mock local solo demuestra el punto de integración, no reproduce el PDF real.
- **No se replicó el resto del sitio** (menú, footer, buscador). Solo el módulo del test, que es
  lo que tiene lógica.
- **Los textos de resultados** están embebidos en el marcado, tal como en el original. Si vas a
  editarlos seguido, conviene sacarlos a `src/config/`.
- **Las serverless functions originales son una caja negra.** El mock reproduce el contrato
  observado desde el navegador, no su implementación.
- El original arrastra dos bugs de puntaje que aquí se mantuvieron a propósito para no romper la
  paridad — **léelos en [`docs/ANALISIS.md` § 4](docs/ANALISIS.md) antes de adaptar el test.**
