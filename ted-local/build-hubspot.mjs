#!/usr/bin/env node
// Genera la copia del TED dentro del theme "Valor Pyme 2026".
//
//   node build-hubspot.mjs
//
// Hermano de build-static.mjs: mismo origen (`public/index.html` + `src/`), otro destino.
//
//   build-static.mjs   → site/                        (Cloudflare Pages)
//   build-hubspot.mjs  → hubspot/valor-pyme-2026/     (HubSpot CMS)
//
// IMPORTANTE — qué NO toca esto:
// El TED que hoy está en https://www.valorpyme.cl/descarga-test-de-digitalizacion vive en OTRO
// theme del portal (módulo `valor-pyme-ted`). Este script no lo lee ni lo escribe; solo crea
// archivos nuevos dentro de hubspot/valor-pyme-2026/. Subir esta carpeta con el CLI tampoco lo
// afecta: son rutas distintas del Design Manager y la página publicada sigue apuntando al viejo.
//
// Salida:
//   modules/ted.module/{meta,fields,module}.…   el test como módulo
//   templates/ted.html                          plantilla de página que lo monta
//   assets/js/ted/**                            src/ + vendor/ + entrada main.js
//   assets/css/ted.css
//   assets/img/ted/**

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as esbuild from 'esbuild';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.dirname(ROOT);
const THEME = path.join(REPO, 'hubspot', 'valor-pyme-2026');
// Todo el TED vive en UNA carpeta del theme. Mismo patrón que `diagnostico-2026/`, que ya
// funciona así en el portal: nada fuera de aquí, así no puede chocar con el resto del sitio
// y la subida es una sola ruta en vez de cinco.
const TED = path.join(THEME, 'ted2026');
const MODULO = path.join(TED, 'ted.module');
const JS = path.join(TED, 'js');
const IMG = path.join(TED, 'img');
const FUNCS = path.join(TED, 'ted.functions');

const log = (...a) => console.log(' ', ...a);

/** Extrae un bloque balanceado `<tag ...>...</tag>` desde la primera aparición de `apertura`. */
function extraerBloque(html, apertura, tag) {
  const i = html.indexOf(apertura);
  if (i === -1) throw new Error(`no se encontró ${apertura} en public/index.html`);
  const re = new RegExp(`<${tag}\\b|</${tag}>`, 'g');
  re.lastIndex = i;
  let nivel = 0;
  let m;
  while ((m = re.exec(html))) {
    nivel += m[0].startsWith('</') ? -1 : 1;
    if (nivel === 0) return html.slice(i, m.index + m[0].length);
  }
  throw new Error(`bloque <${tag}> sin cerrar`);
}

async function copiarDir(desde, hacia) {
  await fs.mkdir(hacia, { recursive: true });
  for (const entrada of await fs.readdir(desde, { withFileTypes: true })) {
    const o = path.join(desde, entrada.name);
    const d = path.join(hacia, entrada.name);
    if (entrada.isDirectory()) await copiarDir(o, d);
    else await fs.copyFile(o, d);
  }
}

/** Reemplazo que falla si no encuentra nada: si el markup cambia, se entera aquí y no en el portal. */
function sustituir(html, busca, pone, que) {
  if (!(busca instanceof RegExp ? busca.test(html) : html.includes(busca))) {
    throw new Error(`no se pudo aplicar la sustitución "${que}" — cambió public/index.html`);
  }
  return html.replace(busca, pone);
}

// ─────────────────────────────────────────────────────────── markup del módulo

// Las 16 combinaciones de <Marketing>-<Procesos>. El nombre de campo no admite guiones.
// Las cuatro ALTO-* NO están: el negocio las marca "N/A" en la matriz de combinaciones y no
// deben poder recibir formulario ni siquiera desde el editor. MEDIO-ALTO sí está, sin ID por
// defecto, para que puedan pegarlo en cuanto creen el formulario que falta.
const COMBINACIONES = [
  'BAJO0-BAJO0', 'BAJO0-ALTO', 'BAJO0-BAJO1', 'BAJO0-MEDIO',
  'BAJO1-BAJO0', 'BAJO1-MEDIO', 'BAJO1-BAJO1', 'BAJO1-ALTO',
  'MEDIO-BAJO0', 'MEDIO-BAJO1', 'MEDIO-MEDIO', 'MEDIO-ALTO',
].map((clave) => ({ clave, campo: clave.replace('-', '_') }));

// Lo único que este script escribe dentro del theme, y por tanto lo único que se puede subir.
// El resto de la carpeta local es un port parcial del home congelado en julio; el portal va muy
// por delante y subirlo entero sería una regresión en un sitio con páginas publicadas.
const RUTAS_SUBIBLES = ['ted2026'];

const { postSurveyFormIds } = await import('./src/config/forms.js');

const fuente = await fs.readFile(path.join(ROOT, 'public', 'index.html'), 'utf8');
let cuerpo = extraerBloque(fuente, '<div class="ted" id="ted-contenido"', 'div');

// El <script id="form-ids"> del original se alimenta de CAMPOS del módulo: el equipo cambia un
// formulario desde el editor de páginas, sin tocar código. Se conserva esa capacidad. Aquí se
// regenera desde COMBINACIONES para que los campos, el JSON y los IDs por defecto no se
// desincronicen, y `loadFormIds()` lo lee para pisar los valores de config/forms.js.
const jsonFormIds = COMBINACIONES.map(
  (c) => `            "${c.clave}": "{{ module.${c.campo}.form_id }}"`,
).join(',\n');
cuerpo = sustituir(
  cuerpo,
  /<script type="application\/json" id="form-ids">[\s\S]*?<\/script>/,
  `<script type="application/json" id="form-ids">\n        {\n${jsonFormIds}\n        }\n        </script>`,
  'repoblar el #form-ids desde los campos del módulo',
);

// Imágenes → assets del theme.
cuerpo = cuerpo.replace(/src="\/assets\/img\/([^"]+)"/g, "src=\"{{ get_asset_url('../img/$1') }}\"");

// Los cuatro textos de la portada se vuelven editables. El resto del markup NO se expone como
// campo a propósito: son etiquetas de formulario, botones de navegación y textos que el JS
// referencia o traduce. Hacerlos editables invita a romper el test desde el editor de páginas.
cuerpo = sustituir(
  cuerpo,
  /<h1 class="ted-home__title">\s*Programa <br>\s*PyME Digital\s*<\/h1>/,
  '<h1 class="ted-home__title">{{ module.titulo }}</h1>',
  'H1 editable',
);
cuerpo = sustituir(
  cuerpo,
  /<p class="ted-home__lead">\s*Descubre tu nivel[^<]*<\/p>/,
  '<p class="ted-home__lead">{{ module.bajada }}</p>',
  'bajada editable',
);
cuerpo = sustituir(
  cuerpo,
  /Duración del diagnóstico: <span>4 min<\/span>/,
  'Duración del diagnóstico: <span>{{ module.duracion }}</span>',
  'duración editable',
);
cuerpo = sustituir(
  cuerpo,
  /(<button @click="page = 'contact'" class="btn">)\s*Quiero Comenzar\s*(<\/button>)/,
  '$1{{ module.cta }}$2',
  'CTA editable',
);

const moduleHtml = `{# ═══════════════════════════════════════════════════════════════════════════
   MÓDULO · Test de Digitalización (TED)

   Copia del test para el theme "Valor Pyme 2026". NO es el que está publicado en
   /descarga-test-de-digitalizacion: aquel vive en el theme antiguo, en el módulo
   \`valor-pyme-ted\`, y no se toca desde aquí.

   GENERADO por ted-local/build-hubspot.mjs — no editar a mano.
   El markup sale de ted-local/public/index.html y la lógica de ted-local/src/.

   Habla con las mismas serverless functions y escribe las mismas propiedades de
   contacto que producción: la copia aísla el CÓDIGO, no los DATOS del CRM.
   ═══════════════════════════════════════════════════════════════════════════ #}
${cuerpo}

{# Formularios de HubSpot. Sin esto \`window.hbspt\` no existe y renderForm() se cae al
   formulario mock del entorno local: el usuario vería un formulario falso que no inscribe
   a nadie. La plantilla de producción lo carga igual, desde el mismo CDN. #}
<script defer src="https://js.hsforms.net/forms/v2.js"></script>

{# Terceros primero, después la entrada del test. Los tres scripts diferidos se ejecutan en el
   orden del documento, así que main.js registra el componente antes de que arranque Alpine.
   Mismo orden que en local.
   A diferencia de producción, Alpine y su plugin van servidos desde el theme y no desde
   jsdelivr: una dependencia menos fuera de nuestro control y sin fijar versión. #}
<script defer src="{{ get_asset_url('../js/main.js') }}"></script>
`;

const meta = {
  label: 'Test de Digitalización (TED)',
  // Los 44 módulos del theme usan esta combinación. `PAGE` (lo que decía hubspot/MODULE_SPEC.md)
  // NO es un content_type válido: HubSpot rechaza el meta.json al subir.
  content_types: ['LANDING_PAGE', 'SITE_PAGE'],
  is_available_for_new_content: true,
  global: false,
  host_template_types: ['ANY'],
  // Solo `text` y `media` están comprobadas en este portal (42 y 2 módulos). `form` no aparece
  // en ninguno y una categoría inválida hace fallar la validación al subir. Es cosmético:
  // agrupa el módulo en el selector del editor.
  categories: ['text'],
  smart_type: 'NOT_SMART',
};

const fields = [
  { id: 'titulo', name: 'titulo', label: 'Título (H1)', type: 'text', required: false, default: 'Programa PyME Digital' },
  { id: 'bajada', name: 'bajada', label: 'Bajada', type: 'text', required: false, default: 'Descubre tu nivel de digitalización y avanza hacia la transformación de tu negocio en 3 simples pasos' },
  { id: 'duracion', name: 'duracion', label: 'Duración que se anuncia', type: 'text', required: false, default: '4 min' },
  { id: 'cta', name: 'cta', label: 'Texto del botón de inicio', type: 'text', required: false, default: 'Quiero Comenzar' },

  // Un campo por combinación, como en el módulo original: así se cambia un formulario desde el
  // editor de páginas sin pasar por un despliegue. El valor por defecto sale de forms.js.
  ...COMBINACIONES.map(({ clave, campo }) => ({
    id: campo,
    name: campo,
    label: `Formulario · ${clave.replace('-', ' → ')}`,
    type: 'form',
    required: false,
    default: postSurveyFormIds[clave]
      ? { form_id: postSurveyFormIds[clave], response_type: 'inline', message: '' }
      : { response_type: 'inline', message: '' },
  })),
];

// ─────────────────────────────────────────────────────────── plantilla

const template = `<!--
  templateType: page
  label: Test de Digitalización (TED)
  isAvailableForNewContent: true
  enableDomainStylesheets: false
-->
{# ============================================================
   TED · theme Valor Pyme 2026
   Todo lo propio del test vive en esta carpeta. De fuera
   solo se PIDEN PRESTADOS el look & feel y el cascarón del sitio:
   styles.css, main.js y los partials de header/footer. Nada de
   esto se modifica desde aquí, así que el TED no puede romper
   ninguna otra página del theme.

   La página publicada hoy en /descarga-test-de-digitalizacion usa
   el theme antiguo y NO se ve afectada por este archivo.
   GENERADO por ted-local/build-hubspot.mjs — no editar a mano.
   ============================================================ #}
<!DOCTYPE html>
<html lang="{{ html_lang }}" {{ html_lang_dir }}>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  {{ standard_header_includes }}
  {# Prestado del theme: tokens, reset, tipografía y .btn del sitio 2026. #}
  <link rel="stylesheet" href="{{ get_asset_url('../assets/css/styles.css') }}">
  {# Propio del TED, dentro de su carpeta. Va después para poder afinar sobre el theme. #}
  <link rel="stylesheet" href="{{ get_asset_url('./ted.css') }}">
</head>
<body class="hp" data-ruta="">
  {# Primer elemento enfocable: sin él hacen falta 21 pulsaciones de Tab para
     llegar a la primera opción, y eso en cada una de las 31 preguntas. Va antes
     del header porque un enlace de salto solo sirve si es lo primero que recibe
     el foco. Lo suyo sería tenerlo en el propio partial, para todo el theme. #}
  <a class="ted-skip" href="#ted-contenido">Saltar al contenido</a>

  {% global_partial path="../partials/header.html" %}

  <main>
    {% module "ted" path="./ted.module" %}
  </main>

  {% global_partial path="../partials/footer.html" %}

  {# Prestado: menú móvil, sombra del header al hacer scroll y año del footer. #}
  <script src="{{ get_asset_url('../assets/js/main.js') }}" defer></script>
  {{ standard_footer_includes }}
</body>
</html>
`;

// ─────────────────────────────────────────────────────────── escritura

// Se borra la carpeta entera y se regenera: así no sobreviven restos de builds anteriores.
await fs.rm(TED, { recursive: true, force: true });
await fs.mkdir(MODULO, { recursive: true });

await fs.writeFile(path.join(MODULO, 'meta.json'), JSON.stringify(meta, null, 2) + '\n');
await fs.writeFile(path.join(MODULO, 'fields.json'), JSON.stringify(fields, null, 2) + '\n');
await fs.writeFile(path.join(MODULO, 'module.html'), moduleHtml);
await fs.writeFile(path.join(TED, 'ted.html'), template);

// El JS del test va EMPAQUETADO en un solo archivo, no como módulos sueltos.
//
// HubSpot mueve cada archivo de un theme a su propia URL generada
// (hubfs/hub_generated/template_assets/<id>/<hash>/template_<nombre>.min.js). Eso rompe los
// imports relativos de un módulo ES: `import ... from './components/ted.js'` acaba pidiendo
// una ruta que no existe y devuelve 404. Sin JS, Alpine no arranca y `x-cloak` deja la
// página en blanco — que es exactamente lo que pasó al subirlo la primera vez.
//
// Empaquetando desaparecen los imports y con ellos el problema.
await copiarDir(path.join(ROOT, 'public', 'assets', 'img'), IMG);
// El CSS local pinta una etiqueta en la barra del header ("copia local" / "vista previa") para
// que nadie confunda el entorno de trabajo con el test real. En HubSpot eso saldría en el header
// del sitio, así que se retira aquí. Es además el ÚNICO selector que ted.css comparte con el
// styles.css del theme; quitándolo, la hoja del TED deja de tocar nada de fuera.
const cssLocal = await fs.readFile(path.join(ROOT, 'public', 'assets', 'css', 'ted.css'), 'utf8');
const marcadores = [
  /\/\* El header y el footer vienen[\s\S]*?\.site-header__top-inner::before \{[\s\S]*?\n\}\n/,
  /\/\* ── Vista previa estática[\s\S]*?html\[data-ted-static\] \.site-header__top-inner::before \{[\s\S]*?\n\}\n/,
];
let css = cssLocal;
for (const [i, re] of marcadores.entries()) {
  if (!re.test(css)) throw new Error(`no se encontró el marcador de entorno ${i + 1} en ted.css`);
  css = css.replace(re, '');
}
// El guardián mira las REGLAS, no los comentarios: el CSS explica de dónde salen los 120px
// del header sticky y ahí la palabra aparece legítimamente.
const cssSinComentarios = css.replace(/\/\*[\s\S]*?\*\//g, '');
if (cssSinComentarios.includes('site-header')) {
  throw new Error('ted.css sigue tocando el header del theme');
}
await fs.writeFile(path.join(TED, 'ted.css'), css);

// En HubSpot los formularios de descarga son los reales, no los mock del servidor local.
// El bundle se arma desde src/, así que hay que parchear ANTES de empaquetar y devolver el
// archivo a su estado original después — si no, `npm run dev` se quedaría sin formularios mock.
const apiConfig = path.join(ROOT, 'src', 'config', 'api.config.js');
const apiConfigOriginal = await fs.readFile(apiConfig, 'utf8');
if (!apiConfigOriginal.includes('useMockForms: true')) {
  throw new Error('api.config.js ya no trae `useMockForms: true` — revisar build-hubspot.mjs');
}
await fs.writeFile(
  apiConfig,
  apiConfigOriginal
    .replace(
      'useMockForms: true,',
      'useMockForms: false, // en HubSpot se renderizan los formularios reales (lo pone build-hubspot.mjs)',
    )
    // El comentario de arriba describía el caso local; si se queda, contradice al valor.
    .replace(
      'de descarga; con `useMockForms: true` no se contacta a HubSpot en absoluto.',
      'de descarga. En esta copia está en `false`: se piden los formularios reales del portal.',
    ),
);

// TODO el JS en un solo archivo: el test y también gauge, Alpine y su plugin.
//
// Los terceros NO pueden ir como archivos sueltos del theme: HubSpot vuelve a minificar los
// .min.js y a Alpine lo deja con un error de sintaxis (46346 bytes válidos -> 46205 rotos),
// así que nunca arrancaba. Dentro del bundle, HubSpot minifica el conjunto y sale correcto.
//
// El orden importa y por eso el registro va en su propio módulo: los `import` se ejecutan en
// orden, así que el listener de `alpine:init` queda puesto ANTES de que Alpine se inicie.
const vendor = (f) => JSON.stringify(path.join(ROOT, 'vendor', f));
const registro = path.join(JS, '__registro.js');
const entrada = path.join(JS, '__entrada.js');
await fs.mkdir(JS, { recursive: true });
try {
  await fs.writeFile(
    registro,
    `import { registerTed } from ${JSON.stringify(path.join(ROOT, 'src', 'components', 'ted.js'))};\n` +
      `document.addEventListener('alpine:init', () => registerTed(window.Alpine));\n`,
  );
  await fs.writeFile(
    entrada,
    `import ${JSON.stringify(registro)};\n` +
      `import ${vendor('gauge.min.js')};\n` +
      `import ${vendor('alpine-persist.min.js')};\n` +
      `import ${vendor('alpine.min.js')};\n`,
  );
  await esbuild.build({
    entryPoints: [entrada],
    outfile: path.join(JS, 'main.js'),
    bundle: true,
    format: 'iife',
    target: 'es2019',
    banner: { js: '// TED · empaquetado por ted-local/build-hubspot.mjs — no editar a mano.' },
  });
} finally {
  // Pase lo que pase, src/ queda como estaba.
  await fs.writeFile(apiConfig, apiConfigOriginal);
  await fs.rm(entrada, { force: true });
  await fs.rm(registro, { force: true });
}

// ─────────────────────────────────────────────────────────── verificación

JSON.parse(await fs.readFile(path.join(MODULO, 'meta.json'), 'utf8'));
JSON.parse(await fs.readFile(path.join(MODULO, 'fields.json'), 'utf8'));

const escrito = await fs.readFile(path.join(MODULO, 'module.html'), 'utf8');
// Rutas absolutas del servidor local: en HubSpot no existen. Se buscan con la comilla delante
// para no confundirlas con las relativas del theme (`../../assets/img/…`).
for (const resto of ['"/assets/', '"/vendor/', "'/src/"]) {
  if (escrito.includes(resto)) throw new Error(`quedó una ruta local sin traducir: ${resto}`);
}

const cuentaJs = async (dir) => {
  let n = 0;
  for (const e of await fs.readdir(dir, { withFileTypes: true })) {
    n += e.isDirectory() ? await cuentaJs(path.join(dir, e.name)) : 1;
  }
  return n;
};

log(`todo el TED en ${path.relative(REPO, TED)}/`);
log(`   ted.module/ ${(escrito.length / 1024).toFixed(1)} KB  ·  ted.html  ·  ted.css`);
log(`   js/ ${await cuentaJs(JS)} archivos  ·  img/`);
log('');
log('el TED publicado en valorpyme.cl NO se toca: vive en el theme antiguo (Valor Pyme v2).');
log('');
log('⚠️  NUNCA subir la carpeta entera: la copia local está 234 archivos por detrás del portal');
log('    y pisaría styles.css, main.js, el home y los módulos hp-* del sitio 2026 EN VIVO.');
log('    Subir solo las rutas del TED, una por una:');
log('');
for (const ruta of RUTAS_SUBIBLES) {
  log(`      hs cms upload hubspot/valor-pyme-2026/${ruta} "Valor Pyme 2026/${ruta}" --account=valor-pyme`);
}
