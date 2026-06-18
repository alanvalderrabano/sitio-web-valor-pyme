# HANDOFF — Sitio Valor Pyme (léeme al iniciar un chat nuevo)

> Documento de traspaso. Si eres un chat nuevo, **lee esto completo primero**. La memoria del proyecto (`memory/`) ya carga los feedbacks por sección; aquí está el "cómo trabajamos + gotchas + estado".

## 1. Qué es / dónde está
- Front-end estático de **valor-pyme.com**. Por ahora: 4 páginas de **Rutas** + un hub.
- Carpeta: `/Users/alan/Documents/Valor Pyme/sitio-web-rutas/` · código servible en `site/`.
- **Repo:** github.com/alanvalderrabano/sitio-web-valor-pyme · **Live:** https://sitio-web-valor-pyme.pages.dev/
- Deploy: **Cloudflare Pages**, output dir = `site`. Flujo: editar → commit → **GitHub Desktop → Push origin** → Cloudflare redeploya solo (~1 min). YO no puedo hacer `git push` (lo bloquea el clasificador de auto-mode) ni editar `.claude/settings*` — el usuario pushea desde GitHub Desktop. Commits locales sí puedo.
- Cliente en **Chile** (`lang="es-CL"`). Tema de marca: **movilidad / metro / rutas que se cruzan**.

## 2. Páginas y archivos (`site/`)
- `index.html` = **HOME nuevo** (portada de valor-pyme.com), construido con el pipeline proceso-web. 8 secciones AIDA + oferta Hormozi. Insumos/trazabilidad: `home-inputs.md`, `brief-home.md`, `blueprint-home.md`, `review-home-1.md` (PASS).
- `rutas.html` = **hub "metro Pyme"** (las 4 rutas) — era el `index.html`, se renombró. Sirve en `/rutas`.
- `ruta-capital.html`, `ruta-mercado.html`, `ruta-digitalizacion.html`, `ruta-talento.html`.
- `styles.css` (un solo CSS, mobile-first, theming por `body[data-ruta]`), `script.js`.
- Cloudflare sirve **URLs limpias** (sin `.html`); enlaces internos ya van sin `.html` (`href="ruta-capital"`, home `href="/"`).

## 3. Design system (resumen; detalle en `brand-kit.md`)
- **Colores por ruta** (¡Mercado cambió a morado!): Capital `#FFF200` (amarillo), **Mercado `#330559` (morado profundo, Pantone 2745 C — antes era negro)**, Digitalización `#FF005B` (rosa), Talento `#00C168` (verde). Conector transversal = morado corporativo `#6126FF`.
- Theming: cada página pone `body data-ruta="capital|mercado|digitalizacion|talento"`. Variables: `--ruta`, `--ruta-ink` (texto legible sobre el color: blanco en mercado/digi/**talento**, oscuro en capital), `--ruta-soft`, `--ruta-deep`. **Talento usa texto BLANCO sobre verde** (`--ruta-ink:#FFFFFF`).
- Tipografía: display = **FG Futurist** (PENDIENTE licencia web) con fallback **Outfit** (Google Fonts); cuerpo = Arial.
- **Navbar = blanco** con logo morado (`logo-horizontal-dark.svg`) y elementos morados. (Probamos morado y se revirtió.)
- **Hero por ruta**: fondo en color de ruta vibrante, texto `--ruta-ink`, imagen grande, líneas cruzando (unas detrás/otras delante de la foto, sin tapar caras), CTA primario morado (en Mercado el CTA es blanco por contraste sobre morado).
- **Sistema de líneas (metro):** trazos gruesos redondeados; las estaciones (puntos) son parte de las líneas. En SVGs con `preserveAspectRatio="xMidYMid meet"` los `<circle>` van bien; **en el SVG del journey (`preserveAspectRatio="none"`) NO uses `<circle>` (salen ovalados): los puntos son `<span class="journey__dot">` posicionados por % (left=cx/viewBoxW, top=cy/viewBoxH).**
- **Journey strip** (bajo el hero): línea full-bleed + **vehículo REAL** que la recorre. `assets/img/veh-<ruta>.png`: Capital=teleférico, Mercado=bici, Digitalización=moto, Talento=avioneta. Tamaño por `height` (aspect ratios distintos).
- **Franja B&N parallax** (después de Beneficios): foto documental desaturada (`grayscale(1) brightness(.85)`), `data-parallax="1.05"`, `inset:-42%`.
- Secciones por página (todas las rutas): Hero · Journey · Descripción del eje · Estaciones (cards de partners, banda de color vibrante + cards blancas + número/tag vibrantes + simetría con min-heights) · Estaciones de combinación (fondo morado) · Beneficios · Franja B&N · Contenidos/blog · CTA diagnóstico (morado) · Otras rutas (burbujas pastel) · Footer.
- **Logos de partners**: `site/assets/logos/partners/` — 13 reales colocados (bci, blueexpress, defontana, omia, microsoft, otic, misabogados, pymeuc, fintegram, walmart, salcobrand, rindegastos, buk). Sin placeholders.

## 4. Agentes de marca (`.claude/agents/`)
- `vp-brand-validator` (lee/valida marca desde Figma+brandbook; modos BUILD/AUDIT).
- `vp-image-creator` (compone fotos + líneas; SVG de movilidad).

## 5. GOTCHAS / errores que ya resolvimos (no repetir)
1. **Parallax runaway:** el JS leía la posición YA transformada cada frame → bucle (saltaba a -535px) y se veía “imperceptible”. Fix: en `update()` poner `el.style.transform='none'` ANTES de medir `getBoundingClientRect`, y clamp de `prog` a [-1,1]. Ya aplicado en `script.js`.
2. **Puntos ovalados:** ver §3 (journey con `preserveAspectRatio="none"` deforma `<circle>`). Usar `.journey__dot` HTML.
3. **Preview MCP:** los screenshots **se ponen en blanco al hacer scroll** (rAF throttled). Truco: para capturar una sección abajo, traerla arriba con `document.querySelector('main').style.transform='translateY(-Npx)'` (resetear a 'none' antes de medir). Usar `scrollBehavior='auto'` para que el scroll programático no anime. El preview se cae entre turnos: re-`preview_start` (config en `.claude/launch.json`, server `vp-rutas`, sirve `site/` en :4321). NOTA: en local las URLs sin `.html` dan 404 (Cloudflare sí reescribe); para probar local agrega `.html`.
4. **Caché de JS en preview:** si cambias `script.js` y no se refleja, hay caché → versiona el `<script src="script.js?v=N">` (vamos en v4).
5. **Python urllib falla por SSL** en esta Mac → usa **curl** para todo HTTP (APIs, descargas).
6. **Recorte de fondo de imágenes:** usar `rembg` (Python) con modelo **`isnet-general-use` + alpha_matting** (u2net deja huecos rellenos en cosas con caladuras como la bici). Autocrop al bbox alpha. Así se hicieron los vehículos y varios logos.
7. **`.ai` de Adobe** muchas veces son PDF por dentro → se pueden renderizar con **PyMuPDF (`fitz`)** a PNG (así salieron Walmart y Salcobrand). PyMuPDF también extrae texto/render de los PDFs de marca.
8. **Google Drive:** carpetas piden login con curl normal, PERO `https://drive.google.com/embeddedfolderview?id=<FOLDER_ID>#list` lista carpetas públicas sin login (saca IDs `entry-<id>` + nombres). Descargar archivo público: `https://drive.usercontent.google.com/download?id=<FILE_ID>&export=download&confirm=t`. OJO: en Cloudflare Pages un archivo inexistente puede dar 200 → el código 200 NO confirma existencia; verifica el **HTML real** (qué referencia) o el content-type.
9. **ClickUp:** token en `~/.config/clickup/token` (curl). Workspace Black & Orange `9017102376`. NO escanear todo el workspace (rate limit ~100/min) → pedir URL/ID de la tarea. Tarea del proyecto: "Desarrollo Rutas" = `86e1uhddu`. Mención en comentario: `{"comment":[{"text":"…"},{"text":"@Nombre","type":"tag","user":{"id":<uid>}}],"assignee":<uid>}`. Ari = 38189502.
10. **Límites de permisos:** no puedo `git push` ni editar `.claude/settings*.json` en auto-mode (clasificador). El usuario hace el push.

## 6. Pendientes
- **Buk** ✅ ya colocado. (Todos los logos listos.)
- **FG Futurist**: licencia web o aprobar Outfit como definitivo.
- **Navbar**: enlaces no-ruta en `#` (Nosotros/Aliados/Comunidad/Recursos/Contacto) a la espera de la arquitectura del sitio.
- **Recorte del sujeto en heroes** (líneas entre fondo y persona): mejora futura.
- 🔐 Usuario debe **regenerar el token de ClickUp** (quedó en el chat).

## 7. HECHO: reestructura + HOME ✅ (pendiente push + validaciones de cliente)
1. ✅ `index.html` (hub) → renombrado a **`rutas.html`**. Nav "Rutas Pyme" ahora enlaza a `/rutas` (conserva dropdown). Logo → `/` (nuevo home).
2. ✅ **HOME nuevo** en `index.html` (pipeline proceso-web, revisión PASS). Reutiliza el design system. JSON-LD Organization + FAQPage.
3. ⏳ **Falta push** (GitHub Desktop) para que Cloudflare redeploye.

### Pendientes del HOME a validar con cliente (provisionales en código)
- **Rutas internas reales:** `#suscripcion`, `#diagnostico`, `#aliados`, redes sociales, y Nosotros/Comunidad/Recursos/Contacto (hoy en `#`). Confirmar URLs.
- **FAQ:** las 5 preguntas/respuestas son PROPUESTA (el doc no las traía) — validar redacción. JSON-LD marcado provisional.
- **Logo OMIA** (`assets/logos/partners/omia.png`) muestra el wordmark "organizaMe" pero el `alt` dice "OMIA" → confirmar nombre real del aliado y ajustar `alt`/archivo.
- **Aliados sin descripción validada** (Buk, OMIA, Rindegastos, Fintegram, Salcobrand, Mis Abogados): van como logo sin tooltip; pedir copy al cliente. **Multigremial Nacional** tiene descripción pero falta su logo.
- **Color card Capital** `#FFF200` vs `#FF8500` (P-02): se mantuvo `#FFF200` por coherencia con `rutas.html`.
- **SEO:** dar de alta valorpyme.cl en la cuenta GSC de BnO para validar queries del home (no estaba disponible en esta corrida).
- **Optimización de imágenes pendiente:** falta `cwebp`/`svgo` en la máquina (`brew install webp`) para servir WebP y bajar peso (~1.7 MB el home).
