# Restyle del TED con el theme "Valor Pyme 2026"

**Fecha:** 2026-07-29
**Estado:** aprobado, pendiente de plan de implementación

## Objetivo

Dar al TED local el look and feel del theme HubSpot "Valor Pyme 2026", dejándolo listo para
migrar como módulo de ese theme.

**Alcance: reskin.** Misma estructura, misma jerarquía, mismo flujo. Cambian color, tipografía,
esquinas y espaciados. No se reordena nada ni se rediseña ninguna pantalla.

**Fuera de alcance:** la migración en sí (crear `ted.module/`, `fields.json`, subir por CLI) y
cualquier cambio a la lógica de puntaje.

## Contexto

El TED vive hoy en el portal HubSpot `7800319` con el tema viejo (`tema-2022` + Tailwind).
El theme nuevo "Valor Pyme 2026" está **en ese mismo portal**, así que ambos conviven y la
migración es realista.

Visualmente el TED está lejos de la marca: Roboto, esquinas de 24 px, verde y azul genéricos.
El brandbook exige terminaciones rectas (radio 0), display FG Futurist con fallback Rubik,
cuerpo Arial, y morado corporativo `#6126FF` como color principal.

## Decisiones tomadas

| # | Decisión | Razón |
|---|---|---|
| 1 | Se elimina Tailwind | En HubSpot el módulo vive dentro del theme, que ya carga `styles.css`. Cargar Tailwind sería traer un framework entero para pelearse con los tokens de marca |
| 2 | El local sirve el `styles.css` **real** del theme | Lo que se ve en local es lo que se verá en HubSpot. Cero sorpresas al migrar |
| 3 | Lo propio del módulo va namespaced `.ted-*` | Sigue el precedente `hp-*` del home redesign |
| 4 | Las etapas mantienen lectura de semáforo | Es una herramienta de diagnóstico; la semántica del color pesa más que la pureza de marca |
| 5 | "Avanzado" usa morado corporativo | La marca no tiene azul. El morado es adyacente, mantiene la lectura de "nivel más alto" y cierra la escala en marca |
| 6 | "Principiante" usa naranja `#FF8500`, no el amarillo de marca | `#FFF21C` sobre blanco no alcanza contraste legible |

### Alternativas descartadas

- **Copiar los tokens del theme dentro de `ted.css`.** Se desincroniza. Ya existe una
  discrepancia documentada en `brand-kit.md` (`#00C168` vs `#00BD70`); una copia congelaría la
  versión equivocada sin que nadie se entere. Además, al migrar habría que borrar el `:root`
  duplicado o pisaría al theme.
- **Reescribir el CSS a ojo imitando la marca.** Es exactamente como se acumulan las
  inconsistencias de marca.
- **Usar los 4 colores primarios de marca para las etapas.** Esos colores ya están
  comprometidos con las 4 rutas (Capital = amarillo, Digitalización = rosa, Talento = verde,
  Mercado = morado); reusarlos para niveles de madurez se lee como pertenencia a una ruta.

## Arquitectura

```
ted-local/
├── public/
│   ├── index.html              esqueleto intacto; clases .ted-* en vez de utilidades
│   └── assets/css/ted.css      SOLO lo propio del módulo, sobre tokens del theme
├── src/config/stages.js        colores de etapa (fuente única)
├── src/components/ted.js       lee los colores desde stages.js
└── server/mock-api.mjs         monta /theme/ → hubspot/valor-pyme-2026/assets/
```

### Orden de carga

```html
<link rel="stylesheet" href="/theme/css/styles.css">   <!-- tokens, reset, .btn, .hp-field -->
<link rel="stylesheet" href="/assets/css/ted.css">     <!-- solo el módulo -->
```

Es el mismo orden que tendrá dentro del theme en HubSpot.

El servidor añade una raíz estática `/theme/` que apunta a
`../hubspot/valor-pyme-2026/assets/`. Sale la fuente Roboto de Google Fonts y sale el CDN de
Tailwind; `styles.css` ya importa Rubik.

**Acoplamiento aceptado:** el TED deja de poder abrirse aislado del theme. Es deliberado — el
destino es ser un módulo de ese theme.

## El trabajo real

Al quitar Tailwind desaparecen **164 clases de utilidad**, y no solo las de color:

| Grupo | Clases |
|---|---|
| Layout (flex, grid, gap, anchos) | 38 |
| Tipografía | 29 |
| Espaciado (padding/margin) | 24 |
| Color, fondo, borde, sombra | 23 |
| Responsive (`sm:`/`md:`/`lg:`) | 17 |
| Posición | 5 |

Si solo se cambiaran colores, el layout se desarma: las estructurales sostienen las columnas y
el responsive. Así que el trabajo es **traducir el marcado a clases semánticas `.ted-*` con CSS
propio**, conservando exactamente la misma estructura.

Esto no es trabajo desechable: es lo que hace falta igual para que sea un módulo de HubSpot
mantenible.

## Componentes a estilar

Las 7 regiones del marcado, en orden:

| Región | `x-show` | Qué lleva |
|---|---|---|
| Franja de progreso | `page !== 'home'` | banda superior con título y pasos |
| Portada | `page === 'home'` | imagen + copy + CTA de inicio |
| Contacto | `page === 'contact'` | formulario de 4 campos + imagen |
| Cuestionario | `page === 'survey'` | pregunta, opciones, errores, Atrás/Siguiente |
| Resultados — cabecera | `page === 'results'` | etapa, texto largo, velocímetro |
| Resultados — dimensiones | `page === 'results'` | 5 tarjetas + formulario de descarga |
| Modal de reinicio | `showStartOverModal` | confirmación de dos botones |

### Mapeo de tokens

| Elemento | Hoy | Queda |
|---|---|---|
| Títulos | Roboto bold | `var(--font-display)`, `--text-h2` / `--text-h3` |
| Cuerpo | Roboto | `var(--font-body)`, `--text-body` |
| Esquinas | `rounded-3xl` (24 px) | `var(--radius-md)` → **0** |
| Ancho de contenido | `max-w-7xl` (80 rem) | `var(--maxw)` (1240 px) + `var(--pad-x)` |
| Sombras | `shadow` de Tailwind | `--shadow-sm` / `--shadow-md` (tinte morado) |
| Botón Siguiente | `bg-green-600` | `.btn` del theme |
| Botón Atrás | gris | `.btn--ghost` |
| Franja superior | `bg-gray-200` | `var(--color-soft)` |
| Inputs | borde gris | patrón `.hp-field` del theme |

### Escala de etapas

| Etapa | Antes | Ahora |
|---|---|---|
| Tradicional | `#e83642` | `#FF2B5E` rosa |
| Principiante | `#f4b21e` | `#FF8500` naranja |
| Intermedio | `#00953f` | `#00BD70` verde |
| Avanzado | `#1d4ed8` | `#6126FF` morado corporativo |

Hoy estos colores están **duplicados** en `src/config/stages.js` (campo `color`) y en
`GAUGE_COLORS` de `src/components/ted.js`. Se unifican: `ted.js` deriva el umbral y el color
desde `stages.js`, que queda como fuente única.

### Velocímetro

`vendor/gauge.min.js` emite `.gauge`, `.dial`, `.value`, `.value-text`, `.text-container`, y
además escribe estilos **inline** (`font-family: sans-serif`, `font-size`, `font-weight`).
Los inline ganan a cualquier regla de `ted.css` por especificidad, así que hay que pisarlos con
`!important` en esas tres propiedades. Es la única fealdad prevista y va comentada.

## Verificación

- `npm test` — los 10 tests deben seguir pasando **sin tocarse**. No se toca lógica; si un test
  cambia, es señal de que el reskin se salió de alcance.

  **Resultado real:** 9 de 10 pasaron intactos, incluida la paridad de 300 cuestionarios. Falló
  `etapas y dimensiones son idénticas a las del original`, que hacía `deepEqual` sobre `stages`
  **incluyendo el campo `color`** — es decir, mezclaba contrato de cálculo con presentación.
  Se partió en dos: uno compara rangos/ids/etiquetas contra el original, otro fija la paleta
  nueva. Quedan 11 tests en verde. El criterio detectó lo que tenía que detectar; lo que estaba
  mal era el alcance del test, no el reskin.
- Chromium: las 4 pantallas capturadas en 1280 px y 390 px, comparadas contra el estado actual
  para confirmar que la estructura no se movió.
- Recorrer una vez el flujo completo tras el cambio: cero errores de consola.
- Contraste del texto sobre cada uno de los 4 colores de etapa (mínimo AA, 4.5:1).

  **Resultado real:** 3 de los 4 colores de marca **no sirven como color de texto** sobre blanco —
  rosa 3.65:1, naranja 2.44:1, verde 2.47:1; solo el morado pasa (6.5:1). Por eso el nombre de la
  etapa se pinta en `--color-texto-dark` (16:1) y el color de la etapa quedó como **acento**: borde
  izquierdo de la píldora y punto cuadrado junto al nombre, que no son texto. Además los captions
  pasaron de `--color-gris-claro` (2.55:1) a `--color-gris` (7:1).

## Riesgos

| Riesgo | Mitigación |
|---|---|
| El reset del theme (`*`, `body`, `h1-h4`, `a`, `button`) pisa estilos que el marcado daba por sentados vía Tailwind | Se estila región por región verificando en el navegador, no a ciegas |
| `styles.css` trae reglas globales de `body[data-ruta]` que podrían aplicar sin querer | El TED no define `data-ruta`; hereda el corporativo por defecto, que es lo buscado |
| Perder responsive al soltar las 17 clases `md:`/`lg:` | Captura en 390 px como criterio de aceptación, no como revisión opcional |
| Los estilos inline del gauge | `!important` acotado a 3 propiedades, comentado |

## Pendiente de decidir más adelante

- **FG Futurist** sigue sin licencia web; se usa Rubik. No bloquea.
- ~~El **header/footer local** seguirá siendo el mínimo actual. Los partials del theme son HubL y
  no se pueden servir en local sin un motor de plantillas.~~
  **Corregido:** el supuesto era falso. `partials/header.html` y `partials/footer.html` no tienen
  ni un tag de HubL — solo comentarios `{# #}`. Se montan al vuelo con `injectPartials()`, leyendo
  los archivos del theme, más `/theme/js/main.js` para el menú móvil y los dropdowns.

## Descubierto durante la implementación

**La copia del theme en el worktree naypyidaw está desactualizada.** `melbourne` va 9 commits
adelante con 24 archivos sin commitear; su `styles.css` tiene 727 líneas más (1941 vs 1214) y
~20 módulos que aquí no existen. Entre las diferencias está `body { overflow-x }`: melbourne usa
`clip` (el fix del header sticky) y naypyidaw todavía `hidden`.

En local el sticky funciona igual, porque el problema aparece con los wrappers que HubSpot
inyecta alrededor del contenido, que aquí no existen. Pero significa que **el TED se está
mirando contra un theme viejo**.

Mitigación: la ruta del theme quedó configurable (`--theme` o `TED_THEME_DIR`) y el servidor
imprime al arrancar contra cuál corre. Decidir con la usuaria si el default pasa a melbourne.
