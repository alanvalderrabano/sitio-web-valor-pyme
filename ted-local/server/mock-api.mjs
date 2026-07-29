#!/usr/bin/env node
// Servidor local del TED: estáticos + mocks de los dos endpoints serverless de HubSpot.
// Sin dependencias: solo módulos nativos de Node (>= 18).
//
//   node server/mock-api.mjs [--port 4321]
//
// Rutas emuladas
//   POST /_hcms/api/store-ted-data              -> upsert de propiedades del contacto
//   POST /_hcms/api/get-contact-ted-properties  -> lee un contacto por id
//   GET  /api/report?email=...                  -> descarga del informe (sustituye al PDF de HubSpot)
//   GET  /api/contacts                          -> utilidad de inspección, no existe en producción

import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const DB_PATH = path.join(ROOT, 'server', 'data', 'contacts.json');

const portArgIndex = process.argv.indexOf('--port');
const PORT = Number(portArgIndex !== -1 ? process.argv[portArgIndex + 1] : process.env.PORT || 4321);

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
};

// --------------------------------------------------------------- "CRM" en disco

/** Sustituye al CRM de HubSpot: un JSON plano indexado por contactId. */
async function readDB() {
  try {
    return JSON.parse(await fs.readFile(DB_PATH, 'utf8'));
  } catch {
    return { contacts: {} };
  }
}

async function writeDB(db) {
  await fs.mkdir(path.dirname(DB_PATH), { recursive: true });
  await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2));
}

/** HubSpot deduplica por email; hacemos lo mismo para que ?c=<id> sea estable. */
function findByEmail(db, email) {
  return Object.entries(db.contacts).find(([, c]) => c.email === email);
}

// --------------------------------------------------------------- helpers HTTP

function json(res, status, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(status, { 'Content-Type': MIME['.json'], 'Content-Length': Buffer.byteLength(body) });
  res.end(body);
}

async function readBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  if (chunks.length === 0) return {};
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    return null;
  }
}

// --------------------------------------------------------------- endpoints

async function storeTedData(req, res) {
  const body = await readBody(req);
  const properties = body?.properties;

  if (!properties || typeof properties !== 'object') {
    return json(res, 400, { message: 'properties is required' });
  }
  if (!properties.email) {
    return json(res, 400, { message: 'email is required' });
  }

  const db = await readDB();
  const existing = findByEmail(db, properties.email);
  const contactId = existing ? existing[0] : crypto.randomUUID();

  db.contacts[contactId] = { ...(existing?.[1] ?? {}), ...properties, contactId };
  await writeDB(db);

  const propertyNames = Object.keys(properties).filter((k) => k !== 'email');
  console.log(`  [store-ted-data] ${properties.email} -> ${propertyNames.join(', ') || '(solo email)'}`);

  json(res, 200, { contactId, updated: propertyNames });
}

async function getContactTedProperties(req, res) {
  const body = await readBody(req);
  const contactId = body?.contactId;

  if (!contactId) return json(res, 500, { message: 'Contact ID is required' });

  const db = await readDB();
  const contact = db.contacts[contactId];
  if (!contact) return json(res, 404, { message: 'Contact not found' });

  console.log(`  [get-contact-ted-properties] ${contactId} -> ${contact.email}`);
  json(res, 200, contact);
}

/**
 * Reemplazo local de la descarga del informe. En el sitio real esto lo entrega
 * un workflow de HubSpot por correo, no la página; aquí se genera al vuelo.
 */
async function downloadReport(req, res, url) {
  const email = url.searchParams.get('email');
  const db = await readDB();
  const entry = email ? findByEmail(db, email) : null;

  if (!entry) return json(res, 404, { message: 'No hay un test completado para ese correo' });

  const [contactId, contact] = entry;
  const rows = Object.entries(contact)
    .map(([key, value]) => `<tr><th>${key}</th><td>${String(value)}</td></tr>`)
    .join('\n');

  const html = `<!doctype html>
<html lang="es-CL"><head><meta charset="utf-8"><title>Informe TED — ${contact.firstname ?? ''} ${contact.lastname ?? ''}</title>
<style>body{font-family:Roboto,Arial,sans-serif;margin:2.5rem;color:#111}h1{color:#1d4ed8}
table{border-collapse:collapse;width:100%;margin-top:1.5rem}th,td{border:1px solid #ddd;padding:.5rem .75rem;text-align:left;font-size:.9rem}
th{background:#f5f5f5;width:45%;font-weight:600}</style></head>
<body><h1>Test de Digitalización</h1>
<p><strong>${contact.firstname ?? ''} ${contact.lastname ?? ''}</strong> — ${contact.company ?? 'sin empresa'}</p>
<p>Nivel de digitalización: <strong>${contact.ted_3_nivel_digitalizacion ?? '—'}</strong>
 (${contact.ted_3_porcentaje_digitalizacion ?? '—'})</p>
<p>Contacto: <code>${contactId}</code> · reabrir resultados en <code>/?c=${contactId}</code></p>
<table>${rows}</table></body></html>`;

  res.writeHead(200, {
    'Content-Type': MIME['.html'],
    'Content-Disposition': `attachment; filename="informe-ted-${contactId.slice(0, 8)}.html"`,
  });
  res.end(html);
}

// --------------------------------------------------------------- estáticos

// public/ es el docroot; src/ y vendor/ se exponen para los ES modules.
//
// /theme/ apunta a los assets REALES del theme "Valor Pyme 2026", que vive fuera de este
// proyecto. No se copian a propósito: así el TED hereda cualquier cambio de marca y lo que
// se ve en local es exactamente lo que se verá dentro del theme en HubSpot.
//
// La ruta es configurable porque el theme vive en varios worktrees y no siempre están al día:
//   node server/mock-api.mjs --theme ../../melbourne/hubspot/valor-pyme-2026
const themeArgIndex = process.argv.indexOf('--theme');
const THEME_ROOT = path.resolve(
  themeArgIndex !== -1
    ? process.argv[themeArgIndex + 1]
    : process.env.TED_THEME_DIR || path.join(path.dirname(ROOT), 'hubspot', 'valor-pyme-2026'),
);
const THEME_DIR = path.join(THEME_ROOT, 'assets');
const PARTIALS_DIR = path.join(THEME_ROOT, 'partials');

const STATIC_ROOTS = [
  { prefix: '/theme/', dir: THEME_DIR },
  { prefix: '/src/', dir: path.join(ROOT, 'src') },
  { prefix: '/vendor/', dir: path.join(ROOT, 'vendor') },
  { prefix: '/', dir: path.join(ROOT, 'public') },
];

/**
 * Include de partials al vuelo. En HubSpot el header y el footer los inyecta la plantilla;
 * aquí los leemos de los MISMOS archivos del theme, para no mantener una copia que se
 * desincronice. Solo hay que limpiar los comentarios de HubL, que el navegador no entiende.
 */
async function injectPartials(html) {
  const marcas = [...html.matchAll(/<!--\s*#include\s+partial="([\w-]+)"\s*-->/g)];
  if (marcas.length === 0) return html;

  let salida = html;
  for (const [marca, nombre] of marcas) {
    let partial;
    try {
      partial = await fs.readFile(path.join(PARTIALS_DIR, `${nombre}.html`), 'utf8');
    } catch {
      console.warn(`  [partials] no se encontró ${nombre}.html en ${PARTIALS_DIR}`);
      continue;
    }
    partial = partial
      .replace(/\{#[\s\S]*?#\}/g, '')          // comentarios HubL
      .replace(/<!--\s*templateType[\s\S]*?-->/g, '') // cabecera del partial
      .trim();
    salida = salida.replace(marca, partial);
  }
  return salida;
}

async function serveStatic(res, pathname) {
  const root = STATIC_ROOTS.find((r) => pathname.startsWith(r.prefix));
  const relative = pathname.slice(root.prefix.length) || 'index.html';
  const filePath = path.join(root.dir, relative.endsWith('/') ? relative + 'index.html' : relative);

  // Evita salir del directorio servido con ../
  if (!filePath.startsWith(root.dir)) {
    res.writeHead(403).end('Forbidden');
    return;
  }

  try {
    let file = await fs.readFile(filePath);
    if (path.extname(filePath) === '.html') {
      file = Buffer.from(await injectPartials(file.toString('utf8')), 'utf8');
    }
    res.writeHead(200, {
      'Content-Type': MIME[path.extname(filePath)] ?? 'application/octet-stream',
      'Cache-Control': 'no-store',
    });
    res.end(file);
  } catch {
    res.writeHead(404, { 'Content-Type': MIME['.html'] });
    res.end('<h1>404</h1>');
  }
}

// --------------------------------------------------------------- router

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const { pathname } = url;

  try {
    if (req.method === 'POST' && pathname === '/_hcms/api/store-ted-data') return await storeTedData(req, res);
    if (req.method === 'POST' && pathname === '/_hcms/api/get-contact-ted-properties') return await getContactTedProperties(req, res);
    if (req.method === 'GET' && pathname === '/api/report') return await downloadReport(req, res, url);
    if (req.method === 'GET' && pathname === '/api/contacts') return json(res, 200, await readDB());
    if (req.method === 'GET') return await serveStatic(res, pathname);
    res.writeHead(405).end('Method Not Allowed');
  } catch (error) {
    console.error(error);
    json(res, 500, { message: error.message });
  }
});

server.listen(PORT, () => {
  console.log(`\n  TED local  ->  http://localhost:${PORT}`);
  console.log(`  theme      ->  ${THEME_ROOT}`);
  console.log(`  "CRM" mock ->  ${path.relative(process.cwd(), DB_PATH)}`);
  console.log(`  contactos  ->  http://localhost:${PORT}/api/contacts\n`);
});
