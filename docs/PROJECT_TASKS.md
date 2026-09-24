<!--
  Trabajo OPERATIVO del proyecto Valor Pyme.
  Estado y contexto general → PROJECT_MEMORY.md · cronología → CHANGELOG.md
  Al completar una tarea, muévela a "Completadas" y registra el hito en CHANGELOG.md.
-->

# PROJECT_TASKS — Valor Pyme

**Última actualización:** 2026-07-22

---

## Backlog

- **Ocultar los chips de Recursos sin contenido** (Infografías, Cápsulas/Videos, Capital, Digitalización): que no se muestren mientras den 0 y reaparezcan solos al cargar un recurso de esa categoría. Son unas líneas en `recursos.js`. *(Requiere OK del cliente — ver Bloqueadas.)*
- **Investigar la ausencia de `<title>` y meta description** en el HTML servido en todo el sitio (aunque `htmlTitle` esté configurado y `og:title` sí renderice).
- **Optimizar el peso de página** (~2 MB): redimensionar/recomprimir imágenes (p. ej. `hero-bg-capital.jpg` 398 KB, `Ruta Capital.png` 356 KB).
- **Revisar Mercado y Talento** por el problema de estaciones congeladas en el `dnd_area` (mismo patrón que Digitalización).
- **Hero del Home en móvil**: el SVG con `slice` recorta la animación en pantallas chicas. Iterar en local antes de subir (trabajo compartido con otra sesión).

## En progreso

- *(nada activo en este momento)*

## Bloqueadas

- **Ocultar chips vacíos de Recursos** — bloqueada a la espera de que el cliente decida si se hace.
- **Estaciones de Ruta Digitalización** (muestra 4 de Capital en vez de sus 6) — bloqueada: el contenido vive en un `dnd_area` y el token no puede escribirlo por API; **debe corregirse en el editor de HubSpot**.
- **Fusionar topics duplicados del blog** (17 pestañas, `Marketing`/`Marketing y Ventas`, etc.) — bloqueada: es limpieza de taxonomía en HubSpot, la hace el cliente.
- **Rehacer la lámina del muro (`cyclist-wall`)** — bloqueada: falta que el cliente provea el archivo del brandbook.

## Completadas

- **Buscador IA: enlaces inline** a las páginas que recomienda (diccionario fijo de URLs) + corrección de dos slugs `/contacto` → `/ponte-en-contacto`. Verificado E2E en producción. *(2026-07-22)*
- **Buscador IA portado a HubSpot Serverless** (`/_hcms/api/vp-ask`) y desplegado; el endpoint viejo de Cloudflare daba 403. *(2026-07-21)*
- **Carrusel de aliados en móvil**: tarjeta completa sin recorte, flechas centradas abajo (48 px); 1 tarjeta ≤600 px, 2 en tablet. *(2026-07-21)*
- **Filtros de Recursos**: ahora ocultan las tarjetas (`.rc-card[hidden]{display:none}`). *(2026-07-21)*
- **Filtros del blog** como enlaces nativos por topic. *(2026-07-20)*
- **Heros de ruta en móvil**, **franja "El viaje pyme"** y **curva del hero de Capital** alineados al brandbook. *(2026-07-20)*
