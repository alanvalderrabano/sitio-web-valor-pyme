<!--
  FUENTE ÚNICA DE VERDAD del proyecto Valor Pyme.
  Solo estado vigente — sin conversaciones ni duplicados.
  Al cambiar una decisión, se REEMPLAZA la anterior (no se acumula).
  El trabajo operativo va en PROJECT_TASKS.md; la cronología en CHANGELOG.md.
-->

# PROJECT_MEMORY — Valor Pyme

**Última actualización:** 2026-07-22

---

## Resumen del proyecto

Valor Pyme es una red de soluciones y comunidad **gratuita** para emprendedores y pymes de Chile. Idea central: *"Emprender es siempre un viaje"*. El entregable es el **sitio web** (valorpyme.cl), publicado en **HubSpot CMS**, que presenta la propuesta, organiza las soluciones en **4 rutas** (Capital, Mercado, Digitalización, Talento y Gestión), muestra a los aliados, ofrece recursos/blog/foro, incluye un buscador con IA y capta suscripciones.

## Objetivo

Mantener y mejorar el sitio en HubSpot CMS para que comunique con claridad la propuesta, guíe a cada usuario a la ruta que le sirve y convierta visitas en **suscripciones gratuitas**, siempre alineado al brandbook.

## Alcance

**Incluye:** el theme de HubSpot **"Valor Pyme 2026"** y sus páginas (Home, 4 rutas, Nosotros, Contacto, Recursos + ficha de detalle, Blog, Foro, Suscripción), sus módulos/plantillas/estilos/JS, la función serverless del buscador IA, y los assets (imágenes en File Manager).

**No incluye (o fuera de este control):** la carga de contenido editorial (la hace el cliente en el editor de HubSpot), la configuración de CRM/automations de marketing, y otros portales/proyectos ajenos. El sitio estático `site/` es la versión original y **no es lo desplegado**.

## Estado actual

- **Sitio en producción y vigente** en `valorpyme.cl` (portal HubSpot `valor-pyme`, id **7800319**).
- Theme "Valor Pyme 2026" con todas las páginas listadas en Alcance.
- **Buscador IA operativo** (serverless en HubSpot) y **enlazando** a las páginas que recomienda. Verificado de punta a punta en producción (2026-07-22).
- Trabajo activo en la rama **`actualizar-hero-rutas`** (worktree `melbourne`).
- Detalle del trabajo abierto/cerrado: ver `PROJECT_TASKS.md`.

## Arquitectura

- **Plataforma:** HubSpot **CMS Hub Enterprise**, portal `valor-pyme` (7800319). CDN de Cloudflare delante de las páginas públicas (`s-maxage=36000`).
- **Theme (fuente de verdad de lo desplegado):** `hubspot/valor-pyme-2026/` dentro del worktree `melbourne`.
  - `templates/` (page/blog), `modules/`, `partials/` (header/footer globales), `assets/css/` (`styles.css`, `blog.css`, `foro.css`, `recursos.css`), `assets/js/` (`main.js`, `blog.js`, `recursos.js`), `vp.functions/` (serverless).
  - En el Design Manager la carpeta se llama **`"Valor Pyme 2026"` (con espacios)**.
- **Buscador IA:** función serverless `vp.functions/ask.js` → endpoint **`POST /_hcms/api/vp-ask`** (nodejs18.x). Llama a OpenAI, sin streaming, responde `{text}` en JSON. El front (`main.js`) pinta la respuesta y **enlaza** términos conocidos desde un diccionario fijo de URLs; a la IA no se le deja escribir URLs.
- **Imágenes:** en el File Manager de HubSpot, base pública `https://www.valorpyme.cl/hubfs/BNO%20-%20Sitio26/`.
- **`site/`:** versión estática original (se desplegaba en Cloudflare Pages, con `functions/api/ask.js`). Ha divergido de lo desplegado; se conserva como espejo del CSS compartido, no como fuente de verdad.

## Tecnologías

- **HubSpot CMS** + lenguaje de plantillas **HubL**.
- Front **vanilla**: HTML, CSS (design system propio con variables), JavaScript sin framework. SVG para líneas de marca e íconos.
- **Node.js 18** para la función serverless de HubSpot.
- **OpenAI API** (`gpt-4o-mini`) para el buscador.
- **hs CLI** v8.8.0 (`hs cms upload/fetch`, `hs secrets`, `hs api`).
- **Git / GitHub** (repo público). **Python** para scripts de build puntuales (p. ej. el foro).

## Integraciones

- **OpenAI** — motor del buscador IA (vía la función serverless; clave en secreto de HubSpot).
- **HubSpot Forms** — formularios de Contacto y de descarga de recursos; entran al CRM (con fallback estático si no hay `form_id`).
- **HubSpot Blog nativo** — Blog editorial y Foro (comentarios nativos con moderación).
- **HubSpot File Manager** — alojamiento de imágenes.
- **Cloudflare CDN** — delante de las páginas públicas (gestionado por HubSpot).
- **GitHub** — repositorio de código.

## Requerimientos funcionales

- Buscador IA que responde **solo sobre Valor Pyme** (tono es-CL), breve, y **enlaza** a las páginas relevantes dentro del texto.
- Home y 4 rutas navegables; **suscripción gratuita** como conversión principal.
- Recursos filtrables por **tipo** (e-book / infografía / cápsula) y **ruta**.
- Carrusel de aliados.
- Blog editorial + Foro de comunidad con **comentarios moderados**.
- Diagnóstico ("Encuentra tu ruta").

## Requerimientos técnicos

- Theme de HubSpot con HubL; header/footer como global partials.
- Serverless **nodejs18.x**, límite **10 s** por invocación, **sin streaming**; `fetch` global disponible.
- Responsive (el único breakpoint válido del theme es "mobile").
- Al subir CSS/JS, el bundle público (`template_*.min.js/.css`) **tarda en regenerarse** y el JS se **minifica** (para verificar en el bundle, buscar **literales de string**, no nombres de función).

## Reglas de negocio

- **Sumarse a Valor Pyme es gratis.** La conversión principal es la suscripción sin costo.
- Las soluciones se organizan en **4 rutas** por desafío; quien no sabe cuál elegir usa el diagnóstico.
- **Buscador IA:** habla solo de Valor Pyme; respuestas de 2–4 frases; **no inventa** datos (precios, fechas, montos, correos, teléfonos); no da asesoría legal/financiera personalizada; ante lo que no sabe, redirige a la página de contacto.
- Los **comentarios del foro se moderan** (se aprueban antes de publicar).

## Restricciones

- **No commit/push/deploy sin pedido explícito** del cliente; al subir, decir exactamente qué entra.
- **Worktree `melbourne` compartido** por varias sesiones → antes de subir, revisar `git diff` y comparar contra el archivo vivo en HubSpot para no arrastrar trabajo ajeno.
- El token (PAK) tiene `files`, `cms.functions.*` y `cms.source_code.write`, **pero NO `cms.pages.site_pages.write`**: el contenido de un `dnd_area` **no se puede editar por API/CLI** (solo en el editor).
- **HubSpot no despliega la función si un secreto declarado no existe** → `hs secrets add` primero, luego `hs cms upload`.
- El buscador **no tiene rate limiting**: el control de gasto vive en el proyecto de OpenAI. El control de origen es por dominio (no frena un curl).
- Brandbook: ilustración §09 = **no usar**; foto documental B/N; colores de la guía para estados de interacción; líneas = **sigmoides, nunca arcos**.

## Decisiones tomadas

- **Buscador IA en HubSpot Serverless**, no en Cloudflare. `/api/ask` daba 403 porque HubSpot no ejecuta funciones de Cloudflare; al ser mismo dominio, sin CORS. Sin streaming (HubSpot no lo admite).
- **La IA nunca escribe URLs.** Los enlaces los pone el front desde un diccionario fijo de las 13 URLs reales (los slugs no son adivinables: contacto = `/ponte-en-contacto`, alianzas = `/alianzas-estrategicas-valor-pyme`, diagnóstico = `/diagnostico-de-madurez-empresarial`). Cada `<a>` se arma como nodo con el texto como dato (nunca `innerHTML` de la IA) → sin XSS.
- **Clave de OpenAI acotada:** proyecto aparte con tope de gasto mensual, clave *restricted* solo con "Model capabilities: Write". El `hs secrets add` lo corre el cliente.
- **Filtros del blog = enlaces nativos por topic** (`/tag/{slug}`), no filtrado en cliente.
- **Marca:** esquinas rectas (radius 0); display FG Futurist → fallback Rubik, cuerpo Arial; hover de botón `#330559` + texto blanco.

## Configuración importante

- **Portal HubSpot:** `valor-pyme`, id **7800319** (cuenta del hs CLI: `valor-pyme`).
- **Carpeta del theme (Design Manager):** `"Valor Pyme 2026"` (con espacios).
- **Endpoint del buscador:** `POST /_hcms/api/vp-ask`.
- **Secreto:** `OPENAI_API_KEY` (obligatorio). Modelo `gpt-4o-mini` por defecto; `OPENAI_MODEL` es opcional y **no** se declara como secreto (HubSpot exige que todo secreto declarado exista).
- **Dominios permitidos por la función:** `valorpyme.cl`, `hs-sites.com`, `hubspotpagebuilder.com`.
- **Base de imágenes:** `https://www.valorpyme.cl/hubfs/BNO%20-%20Sitio26/`.
- **Repo:** `git@github.com:alanvalderrabano/sitio-web-valor-pyme.git` (por HTTPS, público). Rama de trabajo: `actualizar-hero-rutas`.
- **Worktree de trabajo:** `/Users/jazmin/conductor/workspaces/VP-web26/melbourne/`.
- **Colores de ruta:** Capital `#FFF21C` · Mercado `#330559` · Digitalización `#FF2B5E` · Talento `#00BD70`. Corporativo `#6126FF`, morado-deep `#330559`.

## Riesgos

- **Gasto del buscador IA**: endpoint público sin rate limiting; un abuso consume tokens de OpenAI. Mitigado por el tope mensual del proyecto; vigilar consumo.
- **Worktree compartido**: subir a ciegas puede publicar trabajo ajeno a medias.
- **Caché del CDN**: tras subir, el cambio no se ve hasta que HubSpot regenera el bundle (minutos).
- **`dnd_area` congela el contenido** al crear la página: corregir plantillas no arregla páginas ya creadas.
- **Relación `site/` ↔ HubSpot** no definida del todo: `site/` ha divergido; conviene aclarar si se mantiene en sync o se abandona, para no editar el archivo equivocado.

## Pendientes del cliente

- Decidir si se ocultan los chips de Recursos sin contenido (Infografías, Cápsulas/Videos, Capital, Digitalización).
- Cargar el contenido faltante (infografías, cápsulas/videos, recursos de Capital y Digitalización).
- Fusionar los topics duplicados del blog en HubSpot.
- Corregir las estaciones de Ruta Digitalización en el editor de páginas.
- (Si se quiere rehacer) proveer el archivo de la lámina del muro del brandbook (`cyclist-wall`).
- Mantener/rotar el secreto `OPENAI_API_KEY` y vigilar el tope de gasto de OpenAI.

## Próximos pasos

1. Definir con el cliente lo de los chips de Recursos vacíos y, si aplica, implementarlo.
2. Revisar Mercado y Talento por el problema de estaciones (`dnd_area`) y corregir Digitalización en el editor.
3. Investigar la ausencia de `<title>`/meta description en el HTML servido.
