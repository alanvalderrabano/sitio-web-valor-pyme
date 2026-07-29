#!/usr/bin/env node
// Genera la versión estática del TED para Cloudflare Pages.
//
//   node build-static.mjs
//
// Cloudflare sirve `site/` tal cual, sin build command, así que aquí se hace todo lo que en
// local resuelve el servidor: inyectar el cascarón, reescribir rutas y copiar los assets.
//
// Diferencia importante con el local: el cascarón NO sale del theme de HubSpot sino de
// `site/index.html`, para que la página se vea igual que sus vecinas del mismo sitio y use
// el mismo `styles.css` y `script.js` ya desplegados.
//
// Salida:
//   site/descarga-test-de-digitalizacion.html
//   site/assets/ted/**            (js del módulo, vendor, imágenes)

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.dirname(ROOT);
const SITE = path.join(REPO, 'site');
const OUT_HTML = path.join(SITE, 'descarga-test-de-digitalizacion.html');
const OUT_ASSETS = path.join(SITE, 'assets', 'ted');

const log = (...a) => console.log(' ', ...a);

/** Extrae un bloque balanceado `<tag ...>...</tag>` desde la primera aparición de `apertura`. */
function extraerBloque(html, apertura, tag) {
  const i = html.indexOf(apertura);
  if (i === -1) throw new Error(`no se encontró ${apertura} en site/index.html`);
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

// ─────────────────────────────────────────────────────────────── cascarón

const siteIndex = await fs.readFile(path.join(SITE, 'index.html'), 'utf8');
const header = extraerBloque(siteIndex, '<header class="site-header"', 'header');
const mobileMenu = extraerBloque(siteIndex, '<div class="mobile-menu"', 'div');
const footer = extraerBloque(siteIndex, '<footer class="site-footer"', 'footer');
log(`cascarón de site/index.html: header ${header.length}b · menú ${mobileMenu.length}b · footer ${footer.length}b`);

// La versión de caché que ya usa el sitio, para no servir un styles.css viejo.
const vCss = siteIndex.match(/styles\.css\?v=(\d+)/)?.[1] ?? '1';
const vJs = siteIndex.match(/script\.js\?v=(\d+)/)?.[1] ?? '1';

// ─────────────────────────────────────────────────────────────── html

let html = await fs.readFile(path.join(ROOT, 'public', 'index.html'), 'utf8');

// El theme de HubSpot se cambia por el CSS del propio sitio estático.
html = html.replace(
  /<link rel="stylesheet" href="\/theme\/css\/styles\.css">/,
  `<link rel="stylesheet" href="styles.css?v=${vCss}">`,
);
html = html.replace(
  /<link rel="stylesheet" href="\/assets\/css\/ted\.css">/,
  `<link rel="stylesheet" href="assets/ted/ted.css?v=${Date.now().toString(36)}">`,
);
html = html.replace(
  /<script src="\/theme\/js\/main\.js" defer><\/script>/,
  `<script src="script.js?v=${vJs}" defer></script>`,
);

// Los include se resuelven aquí, no en tiempo de request.
html = html.replace(/<!--\s*#include\s+partial="header"\s*-->/, `${header}\n\n${mobileMenu}`);
html = html.replace(/<!--\s*#include\s+partial="footer"\s*-->/, footer);

// Rutas de los módulos y assets.
html = html
  .replace(/"\/vendor\//g, '"assets/ted/vendor/')
  .replace(/'\/src\/components\/ted\.js'/g, "'./assets/ted/src/components/ted.js'")
  .replace(/"\/assets\/img\//g, '"assets/ted/img/');

// Sin servidor no hay backend: se marca para que api.js no intente escribir.
html = html.replace('<html lang="es-CL">', '<html lang="es-CL" data-ted-static="1">');

// La página es una vista previa, no la de producción: no debe indexarse.
html = html.replace(
  '<meta name="viewport" content="width=device-width, initial-scale=1">',
  '<meta name="viewport" content="width=device-width, initial-scale=1">\n  <meta name="robots" content="noindex, nofollow">',
);

if (html.includes('#include') || html.includes('/theme/')) {
  throw new Error('quedaron referencias sin resolver al servidor local');
}

// ─────────────────────────────────────────────────────────────── assets

await fs.rm(OUT_ASSETS, { recursive: true, force: true });
await copiarDir(path.join(ROOT, 'src'), path.join(OUT_ASSETS, 'src'));
await copiarDir(path.join(ROOT, 'vendor'), path.join(OUT_ASSETS, 'vendor'));
await copiarDir(path.join(ROOT, 'public', 'assets', 'img'), path.join(OUT_ASSETS, 'img'));
await fs.mkdir(OUT_ASSETS, { recursive: true });
await fs.copyFile(path.join(ROOT, 'public', 'assets', 'css', 'ted.css'), path.join(OUT_ASSETS, 'ted.css'));

await fs.writeFile(OUT_HTML, html);

log(`escrito ${path.relative(REPO, OUT_HTML)} (${(html.length / 1024).toFixed(1)} KB)`);
log(`assets  ${path.relative(REPO, OUT_ASSETS)}/`);
log('recuerda: sin backend, las respuestas no se guardan en ningún lado.');
