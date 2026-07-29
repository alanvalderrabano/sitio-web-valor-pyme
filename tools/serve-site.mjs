#!/usr/bin/env node
// Servidor de previsualización de site/ con URLs limpias.
//
//   node tools/serve-site.mjs [--port 4400] [--root site]
//
// Cloudflare Pages sirve `/nosotros` desde `nosotros.html`. Un `python3 -m http.server`
// no hace esa reescritura, así que todos los enlaces del menú dan 404 en local. Este
// servidor resuelve igual que Cloudflare para poder navegar el sitio completo.
//
// Orden de resolución de una ruta:
//   1. el archivo exacto            /styles.css        -> site/styles.css
//   2. <ruta>.html                  /nosotros          -> site/nosotros.html
//   3. <ruta>/index.html            /blog/             -> site/blog/index.html
//   4. 404 con la lista de páginas disponibles
//
// A diferencia de Cloudflare, un 404 responde 404 de verdad — no el index con código 200.
// Eso evita el falso positivo en el que un archivo que no existe parece existir.

import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

const arg = (nombre, porDefecto) => {
  const i = process.argv.indexOf(`--${nombre}`);
  return i !== -1 ? process.argv[i + 1] : porDefecto;
};
const PORT = Number(arg('port', 4400));
const ROOT = path.resolve(REPO, arg('root', 'site'));

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.mp4': 'video/mp4',
  '.pdf': 'application/pdf',
};

/** Devuelve la primera ruta que exista, siguiendo el orden de resolución. */
async function resolver(pathname) {
  const limpio = decodeURIComponent(pathname).replace(/^\/+/, '');
  const candidatos = limpio === ''
    ? ['index.html']
    : [limpio, `${limpio}.html`, path.join(limpio, 'index.html')];

  for (const c of candidatos) {
    const abs = path.join(ROOT, c);
    // Nada fuera de ROOT, por si llega un ../
    if (!abs.startsWith(ROOT)) continue;
    try {
      const st = await fs.stat(abs);
      if (st.isFile()) return abs;
    } catch { /* siguiente candidato */ }
  }
  return null;
}

async function paginas() {
  const files = await fs.readdir(ROOT);
  return files.filter((f) => f.endsWith('.html')).map((f) => '/' + f.replace(/\.html$/, '')).sort();
}

const server = http.createServer(async (req, res) => {
  const { pathname } = new URL(req.url, `http://localhost:${PORT}`);
  const archivo = await resolver(pathname);

  if (!archivo) {
    const lista = (await paginas()).map((p) => `<li><a href="${p}">${p}</a></li>`).join('');
    res.writeHead(404, { 'Content-Type': MIME['.html'] });
    res.end(`<!doctype html><meta charset="utf-8"><title>404</title>
      <body style="font-family:system-ui;margin:3rem;line-height:1.6">
      <h1>404 — no existe <code>${pathname}</code></h1>
      <p>Páginas disponibles en <code>${path.relative(REPO, ROOT)}/</code>:</p>
      <ul>${lista}</ul>`);
    console.log(`  404  ${pathname}`);
    return;
  }

  const body = await fs.readFile(archivo);
  res.writeHead(200, {
    'Content-Type': MIME[path.extname(archivo)] ?? 'application/octet-stream',
    'Cache-Control': 'no-store',
  });
  res.end(body);
});

server.listen(PORT, async () => {
  console.log(`\n  Sitio  ->  http://localhost:${PORT}`);
  console.log(`  raíz   ->  ${path.relative(REPO, ROOT)}/  (URLs limpias, como en Cloudflare)`);
  console.log(`\n  Páginas:`);
  for (const p of await paginas()) console.log(`    http://localhost:${PORT}${p}`);
  console.log();
});
