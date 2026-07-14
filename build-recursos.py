#!/usr/bin/env python3
"""
Genera una página HTML estática por cada recurso de site/recursos.json.
Cada página tiene su propia URL (/slug), SEO baked (title, meta, OG, JSON-LD)
y el contenido horneado en el HTML (no depende de JS para indexarse).

Uso:  python3 build-recursos.py
Reutiliza el header/footer de site/recursos.html para no duplicar el layout.
Al agregar un recurso: edita site/recursos.json y vuelve a correr este script.
"""
import json, os, re, html

SITE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "site")
BASE_URL = "https://www.valorpyme.cl/"
CSS_V = "recursos.css?v=7"

TYPE_ICON = {
    "ebook": '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 5.5A1.5 1.5 0 015.5 4H11v15H5.5A1.5 1.5 0 014 17.5v-12z" stroke="currentColor" stroke-width="1.7"/><path d="M20 5.5A1.5 1.5 0 0018.5 4H13v15h5.5a1.5 1.5 0 001.5-1.5v-12z" stroke="currentColor" stroke-width="1.7"/></svg>',
    "infografia": '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 20V10M12 20V4M19 20v-7" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    "video": '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" stroke-width="1.7"/><path d="M10 9l5 3-5 3V9z" fill="currentColor"/></svg>',
}
ABOUT_ICON = {
    "contiene": '<svg viewBox="0 0 24 24" fill="none"><path d="M4 6h16M4 12h16M4 18h10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    "sirve": '<svg viewBox="0 0 24 24" fill="none"><path d="M12 3l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9 6.8 19.2l1-5.8L3.5 9.2l5.9-.9L12 3z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></svg>',
    "aprende": '<svg viewBox="0 0 24 24" fill="none"><path d="M12 4L3 8l9 4 9-4-9-4zM7 11v4c0 1.1 2.2 2 5 2s5-.9 5-2v-4" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></svg>',
    "dirigido": '<svg viewBox="0 0 24 24" fill="none"><circle cx="9" cy="8" r="3" stroke="currentColor" stroke-width="1.7"/><path d="M3 20c0-3 2.7-5 6-5s6 2 6 5M16 6.5a3 3 0 010 5.5M21 20c0-2.2-1.3-4-3.5-4.7" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>',
}
ARROW = '<svg class="arrow" width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'

def e(s): return html.escape("" if s is None else str(s), quote=True)

def embed_src(m):
    if m.get("embedUrl"): return m["embedUrl"]
    p = m.get("provider")
    if p == "youtube": return "https://www.youtube.com/embed/" + m["id"]
    if p == "vimeo":   return "https://player.vimeo.com/video/" + m["id"]
    if p == "hubspot": return m["id"]
    return m.get("id", "")

def detail_html(r, rutas):
    rm = rutas.get(r["ruta"], {"label": r["ruta"], "color": "#6126FF"})
    tipo_label = r["_tipo_label"]
    cta_label = (r.get("cta") or {}).get("label", "Descargar recurso")
    desc = r.get("descripcion") or r.get("resumen")
    descarga = r.get("descarga")
    primary_href = descarga["href"] if isinstance(descarga, dict) and descarga.get("href") else "#descargar"

    media = r.get("media") or {}
    if media.get("tipo") == "video":
        media_html = ('<div class="rd-video" id="video"><iframe src="' + e(embed_src(media)) +
                      '" title="' + e(r["titulo"]) + '" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>')
    else:
        media_html = '<div class="rd-media"><img src="' + e(r["portada"]) + '" alt="' + e(r["titulo"]) + '"></div>'

    hero = ('<section class="rd-hero"><div class="container"><div class="rd-hero__grid">'
            '<div class="rd-hero__lead">'
            '<a href="/recursos" class="rd-back"><svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M13 8H3M7 4L3 8l4 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>Centro de Recursos</a>'
            '<div class="rd-badges">'
            '<span class="rd-badge rd-badge--type">' + TYPE_ICON.get(r["tipo"], "") + tipo_label + '</span>'
            '<span class="rd-badge rd-badge--ruta" style="background:' + rm["color"] + '"><span class="rc-dot"></span>Ruta ' + e(rm["label"]) + '</span>'
            '</div>'
            '<h1>' + e(r["titulo"]) + '</h1>'
            '<p class="rd-hero__desc">' + e(desc) + '</p>'
            '<div class="rd-hero__cta"><a href="' + e(primary_href) + '" class="btn">' + e(cta_label) + ARROW + '</a></div>'
            '</div>' + media_html +
            '</div></div></section>')

    download = ""
    if descarga == "form":
        download = ('<section class="rd-download" id="descargar"><div class="container"><div class="rd-download__card">'
                    '<h2>Descarga este recurso gratis</h2>'
                    '<p>Déjanos tus datos y recibirás el material en tu correo. Es gratuito y sin compromiso.</p>'
                    '<form class="hp-form" id="rdForm" novalidate>'
                    '<div class="hp-form__row">'
                    '<div class="hp-field"><label for="rd-nombre">Nombre <span class="req">*</span></label><input id="rd-nombre" type="text" required placeholder="Tu nombre y apellido"></div>'
                    '<div class="hp-field"><label for="rd-email">Correo <span class="req">*</span></label><input id="rd-email" type="email" required placeholder="tucorreo@ejemplo.cl"></div>'
                    '</div>'
                    '<div class="hp-check"><input id="rd-ok" type="checkbox" required><label for="rd-ok">Acepto recibir el recurso y comunicaciones de Valor Pyme. <span class="req">*</span></label></div>'
                    '<div class="hp-form__actions"><button type="submit" class="btn">' + e(cta_label) + ARROW + '</button></div>'
                    '<p class="hp-form__ok" id="rdOk" role="status" hidden>¡Listo! Te enviamos el recurso al correo indicado.</p>'
                    '</form></div></div></section>')

    a = r.get("about") or {}
    def fact(key, title):
        v = a.get(key)
        if not v: return ""
        return ('<div class="rd-fact"><div class="rd-fact__k"><span class="rd-ico">' + ABOUT_ICON[key] + '</span>' + title + '</div><p>' + e(v) + '</p></div>')
    about = ('<section class="rd-about"><div class="container">'
             '<span class="hp-eyebrow">Sobre este recurso</span>'
             '<h2 class="hp-h2">¿Qué encontrarás en este material?</h2>'
             '<div class="rd-about__grid">' +
             fact("contiene", "Qué contiene") + fact("sirve", "Para qué sirve") +
             fact("aprende", "Qué aprenderás") + fact("dirigido", "Para quién es") +
             '</div></div></section>')

    final = ('<section class="rd-final"><div class="container">'
             '<h2>Da el siguiente paso con Valor Pyme</h2>'
             '<p>Descarga este recurso y súmate a una red de soluciones para acompañar el crecimiento de tu pyme.</p>'
             '<a href="' + e(primary_href) + '" class="btn btn--onfill">' + e(cta_label) + ARROW + '</a>'
             '</div></section>')

    return hero + download + about + final

FORM_SCRIPT = """<script>
(function(){var f=document.getElementById('rdForm');if(!f)return;
f.addEventListener('submit',function(e){e.preventDefault();
if(f.checkValidity()){var ok=document.getElementById('rdOk');if(ok){ok.hidden=false;ok.scrollIntoView({behavior:'smooth',block:'center'});}f.reset();}else{f.reportValidity();}});})();
</script>"""

def build():
    with open(os.path.join(SITE, "recursos.json"), encoding="utf-8") as fh:
        db = json.load(fh)
    tipos, rutas = db["meta"]["tipos"], db["meta"]["rutas"]

    # Reutilizar header + menú móvil y footer desde recursos.html
    tpl = open(os.path.join(SITE, "recursos.html"), encoding="utf-8").read()
    nav_block = re.search(r'<body[^>]*>\s*(.*?)\s*<main>', tpl, re.S).group(1)
    footer_block = re.search(r'</main>\s*(<footer class="site-footer">.*?</footer>)', tpl, re.S).group(1)

    for r in db["recursos"]:
        r["_tipo_label"] = tipos.get(r["tipo"], {}).get("label", r["tipo"])
        slug = r["slug"]
        title = r["titulo"] + " — Recursos · Valor Pyme"
        desc = r.get("descripcion") or r.get("resumen")
        url = BASE_URL + slug
        og_img = BASE_URL + r["portada"]
        ld = {
            "@context": "https://schema.org", "@type": "LearningResource",
            "name": r["titulo"], "description": desc, "url": url,
            "learningResourceType": r["_tipo_label"], "inLanguage": "es-CL",
            "isAccessibleForFree": True,
            "provider": {"@type": "Organization", "name": "Valor Pyme", "url": BASE_URL},
        }
        head = (
            '<!DOCTYPE html>\n<html lang="es-CL">\n<head>\n'
            '<meta charset="UTF-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n'
            '<title>' + e(title) + '</title>\n'
            '<meta name="description" content="' + e(desc) + '">\n'
            '<link rel="canonical" href="' + e(url) + '">\n'
            '<meta property="og:title" content="' + e(r["titulo"] + " — Valor Pyme") + '">\n'
            '<meta property="og:description" content="' + e(desc) + '">\n'
            '<meta property="og:type" content="article">\n'
            '<meta property="og:url" content="' + e(url) + '">\n'
            '<meta property="og:image" content="' + e(og_img) + '">\n'
            '<meta name="twitter:card" content="summary_large_image">\n'
            '<link rel="icon" href="assets/logos/isotipo-dark.svg" type="image/svg+xml">\n'
            '<link rel="preconnect" href="https://fonts.googleapis.com">\n'
            '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n'
            '<link rel="stylesheet" href="styles.css?v=44">\n'
            '<link rel="stylesheet" href="' + CSS_V + '">\n'
            '<script type="application/ld+json">' + json.dumps(ld, ensure_ascii=False) + '</script>\n'
            '</head>\n<body data-ruta="" class="hp">\n\n'
        )
        doc = (head + nav_block + "\n\n<main>\n" +
               detail_html(r, rutas) + "\n</main>\n\n" + footer_block +
               '\n\n<script src="script.js?v=18" defer></script>\n' + FORM_SCRIPT + "\n</body>\n</html>\n")
        out = os.path.join(SITE, slug + ".html")
        with open(out, "w", encoding="utf-8") as fh:
            fh.write(doc)
        print("generado:", slug + ".html")

if __name__ == "__main__":
    build()
