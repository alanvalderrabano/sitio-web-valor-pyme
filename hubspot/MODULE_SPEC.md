# Spec para convertir una sección del Home en un módulo de HubSpot CMS

Vas a crear **3 archivos** dentro de la carpeta del módulo que se te indique
(`hubspot/valor-pyme-2026/modules/<nombre>.module/`):

1. `meta.json`
2. `fields.json`
3. `module.html`

## Reglas absolutas
- **Respeta el markup EXACTO** de la sección fuente: mismas etiquetas, clases CSS,
  atributos `data-*`, SVGs y estructura. El CSS (`styles.css`) y el JS (`main.js`)
  dependen de esas clases y hooks. NO renombres nada, NO agregues wrappers extra.
- El módulo **ES la sección**: empieza por el `<section ...>` de la fuente. No incluyas
  `<html>`, `<head>`, header ni footer.
- **Texto editable** → reemplázalo por un campo: `{{ module.<campo> }}`.
- **Imágenes/íconos** (rutas `assets/...`) → dos casos:
  - Decorativas/fijas (patrones, íconos de ruta, fondos): sirve directo del theme con
    `{{ get_asset_url('../../assets/img/<ruta-después-de-assets>') }}`.
    Ej: `assets/logos/x.svg` → `{{ get_asset_url('../../assets/img/logos/x.svg') }}`.
  - Imágenes de contenido (fotos de tarjetas): usa **campo image con fallback** para que
    sea editable Y renderice de una:
    `<img src="{{ item.image.src or get_asset_url('../../assets/img/photos/brand/blog-a.jpg') }}" alt="{{ item.image.alt }}" loading="lazy">`
- Conserva clases de animación (`reveal`, `d1`, `d2`) y todos los `data-*`.

## meta.json (plantilla)
```json
{
  "label": "Home · <Nombre de la sección>",
  "content_types": ["PAGE"],
  "is_available_for_new_content": true,
  "global": false,
  "host_template_types": ["PAGE"],
  "categories": ["text"],
  "smart_type": "NOT_SMART"
}
```

## fields.json
Array JSON de campos. Expón como campos TODO el contenido editable (títulos, párrafos,
textos de botón, enlaces, y listas de tarjetas/pasos/preguntas como **repeaters**).
Tipos que usarás:
- Texto simple: `{ "id":"heading","name":"heading","label":"Título","type":"text","default":"..." }`
- Texto enriquecido (párrafos con <strong>/<br>/varios <p>): `"type":"richtext"`
- Enlace URL: `{ "id":"cta_url","name":"cta_url","label":"Enlace","type":"url","default":{"type":"EXTERNAL","href":"#"} }`
- Imagen: `{ "id":"image","name":"image","label":"Imagen","type":"image","default":{"src":"","alt":""} }`
- **Repeater** (tarjetas, pasos, FAQ): usa un grupo con `children` y `occurrence`:
```json
{
  "id":"cards","name":"cards","label":"Tarjetas","type":"group",
  "occurrence":{"min":0,"max":null,"default":3},
  "default":[ { ...valores por defecto de cada item... } ],
  "children":[
    { "id":"title","name":"title","label":"Título","type":"text","default":"" }
  ]
}
```
En `module.html` recorres el repeater: `{% for card in module.cards %} ... {{ card.title }} ... {% endfor %}`.
Rellena los `default` de cada item con el copy real de la fuente (no dejes vacíos los textos).

## module.html
Reproduce el markup de la fuente insertando `{{ module.* }}` donde va contenido editable.
Envuelve bloques opcionales en `{% if module.campo %}...{% endif %}` cuando tenga sentido.
Documenta arriba con un comentario `{# ... #}` breve qué hace el módulo.

## Referencia ya construida (módulo Hero) — síguela como ejemplo de estilo

`meta.json`:
```json
{
  "label": "Home · Hero",
  "content_types": ["PAGE"],
  "is_available_for_new_content": true,
  "global": false,
  "host_template_types": ["PAGE"],
  "categories": ["media"],
  "smart_type": "NOT_SMART"
}
```

`fields.json`:
```json
[
  { "id": "heading", "name": "heading", "label": "Título (H1)", "type": "text", "required": false, "default": "Emprender es siempre un viaje." },
  { "id": "subtext", "name": "subtext", "label": "Bajada", "type": "richtext", "required": false, "default": "<strong>...</strong><br>..." },
  { "id": "cta_text", "name": "cta_text", "label": "Texto del botón", "type": "text", "required": false, "default": "Suscríbete gratis" },
  { "id": "cta_url", "name": "cta_url", "label": "Enlace del botón", "type": "url", "required": false, "default": { "type": "EXTERNAL", "href": "#suscripcion" } }
]
```

`module.html`:
```html
{# MÓDULO · Home Hero #}
<section class="hp-hero">
  <video class="hp-hero__bg" autoplay muted playsinline preload="auto" poster="{{ get_asset_url('../../assets/img/motion/hero-bg-poster.jpg') }}" aria-hidden="true">
    <source src="{{ get_asset_url('../../assets/img/motion/hero-bg.webm') }}" type="video/webm">
    <source src="{{ get_asset_url('../../assets/img/motion/hero-bg.mp4') }}" type="video/mp4">
  </video>
  <div class="container">
    <div class="hp-hero__grid">
      <div class="hp-hero__copy">
        {% if module.heading %}<h1 class="hp-display reveal">{{ module.heading }}</h1>{% endif %}
        {% if module.subtext %}<div class="hp-hero__sub reveal d1">{{ module.subtext }}</div>{% endif %}
        {% if module.cta_text %}
        <div class="hp-hero__cta reveal d2">
          <a href="{{ module.cta_url.href }}" class="btn btn--onfill">{{ module.cta_text }} <svg class="arrow" width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></a>
        </div>
        {% endif %}
      </div>
    </div>
  </div>
</section>
```

## Validación antes de terminar
- `python3 -c "import json; json.load(open('fields.json')); json.load(open('meta.json'))"` debe pasar.
- Revisa que cada `assets/...` de la fuente quedó como `{{ get_asset_url('../../assets/img/...') }}` o como campo image con fallback.
- Devuelve UN resumen corto: campos creados y cualquier decisión no obvia.
