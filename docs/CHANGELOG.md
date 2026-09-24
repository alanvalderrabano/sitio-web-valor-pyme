<!--
  Cambios IMPORTANTES del proyecto Valor Pyme, con fecha y descripción breve.
  Lo más nuevo arriba. Estado vigente → PROJECT_MEMORY.md · trabajo → PROJECT_TASKS.md
-->

# CHANGELOG — Valor Pyme

## 2026-07-22
- **Buscador IA — enlaces en la respuesta.** La respuesta enlaza a las páginas que recomienda (ruta, diagnóstico, contacto…) desde un diccionario fijo de URLs en el front; la IA no escribe URLs. Corregidos dos `/contacto` que daban 404. Verificado de punta a punta en producción.

## 2026-07-21
- **Buscador IA migrado a HubSpot Serverless** (`/_hcms/api/vp-ask`) y desplegado; el endpoint anterior de Cloudflare (`/api/ask`) daba 403 en producción. Respuesta completa en JSON (sin streaming).
- **Filtros de Recursos arreglados**: las tarjetas ahora se ocultan al filtrar (`.rc-card[hidden]`).
- **Carrusel de aliados en móvil**: sin recorte, flechas centradas abajo; 1 tarjeta en teléfono, 2 en tablet.
- **Home**: animación del hero en SVG (vectores de Figma), blog dinámico por tag y estilos del formulario de descarga.

## 2026-07-20
- **Franja "El viaje pyme"** y **curva del hero de Capital** rehechas como unidad del brandbook (sigmoides).
- **Hero de rutas en móvil**: la línea se ve completa y con el pico sobre la cabeza del personaje.

## 2026-07-18
- **4 rutas**: heroes v2 con línea animada según Figma (Capital, Mercado, Digitalización, Talento) y franja B&N.
- **Nosotros**: hero sin el CTA "Nuestra propuesta"; logos del ecosistema a 80 px.
- Ajustes de copy y de tarjetas de estaciones en Mercado, Digitalización y Talento.

## 2026-07-16
- **Migración a HubSpot CMS**: creación y subida del theme **"Valor Pyme 2026"** (Home + páginas + Foro como blog nativo), portado desde el sitio estático `site/`.
