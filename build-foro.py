#!/usr/bin/env python3
"""
Genera una página HTML estática por cada tema del foro (site/foro.json).
Cada tema es una "entrada tipo blog" con:
  · Título del tema
  · Introducción / contexto
  · Pregunta detonadora (bloque destacado)
  · Módulo/formulario para comentar
  · Listado de comentarios ya publicados (horneados en el HTML → indexables)
Los comentarios nuevos que envíe un visitante quedan "En revisión"
(localStorage, ver foro.js), reflejando el flujo de moderación de HubSpot.

Uso:  python3 build-foro.py
Reutiliza el header/menú-móvil/footer de site/foro.html para no duplicar
el layout. Al agregar/editar un tema: edita site/foro.json y vuelve a correr.
"""
import json, os, re, html

SITE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "site")
BASE_URL = "https://www.valorpyme.cl/"
CSS_STYLES = "styles.css?v=60"
CSS_BLOG = "blog.css?v=3"
CSS_FORO = "foro.css?v=2"

ARROW = '<svg class="arrow" width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
CAL_ICON = '<svg viewBox="0 0 24 24" fill="none"><rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" stroke-width="2"/><path d="M3 9h18M8 3v4M16 3v4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>'
CHAT_ICON = '<svg viewBox="0 0 24 24" fill="none"><path d="M4 5.5A1.5 1.5 0 0 1 5.5 4h13A1.5 1.5 0 0 1 20 5.5v8A1.5 1.5 0 0 1 18.5 15H9l-4 4v-4H5.5A1.5 1.5 0 0 1 4 13.5v-8Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>'
LOCK_ICON = '<svg viewBox="0 0 24 24" fill="none"><rect x="5" y="10" width="14" height="10" rx="2" stroke="currentColor" stroke-width="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>'
CHECK_ICON = '<svg viewBox="0 0 24 24" fill="none"><path d="M20 6 9 17l-5-5" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>'


def e(s):
    return html.escape("" if s is None else str(s), quote=True)


def initials(name):
    parts = str(name).strip().split()
    a = parts[0][0] if parts else ""
    b = parts[-1][0] if len(parts) > 1 else ""
    return (a + b).upper() or "?"


def comment_html(c):
    where = ('<span class="fr-comment__where">' + e(c["empresa"]) + '</span>') if c.get("empresa") else ""
    date = ('<span class="fr-comment__date">' + e(c["fecha_label"]) + '</span>') if c.get("fecha_label") else ""
    return ('<article class="fr-comment">'
            '<div class="fr-comment__avatar">' + e(initials(c["nombre"])) + '</div>'
            '<div class="fr-comment__body">'
            '<div class="fr-comment__meta">'
            '<span class="fr-comment__name">' + e(c["nombre"]) + '</span>' + where + date +
            '</div>'
            '<p class="fr-comment__text">' + e(c["texto"]) + '</p>'
            '</div></article>')


def other_card(t, rutas):
    rm = rutas.get(t["ruta"], {"label": "Comunidad", "color": "#6126FF"})
    n = len(t.get("comentarios") or [])
    href = "/" + t["slug"]
    return ('<article class="fr-tcard" style="--tema:' + rm["color"] + '">'
            '<div class="fr-tcard__top">'
            '<span class="bl-chip bl-chip--' + e(t["ruta"]) + '">Ruta ' + e(rm["label"]) + '</span>'
            '</div>'
            '<h3><a href="' + href + '">' + e(t["titulo"]) + '</a></h3>'
            '<div class="fr-tcard__foot">'
            '<span class="fr-count">' + CHAT_ICON + str(n) + (' comentario' if n == 1 else ' comentarios') + '</span>'
            '<a class="fr-tcard__cta" href="' + href + '">Participar' +
            '<svg viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
            '</a></div></article>')


def entry_html(t, rutas, others):
    rm = rutas.get(t["ruta"], {"label": "Comunidad", "color": "#6126FF"})
    comentarios = t.get("comentarios") or []
    n = len(comentarios)
    count_label = str(n) + (' comentario' if n == 1 else ' comentarios')

    crumb = ('<div class="container"><nav class="bp-crumb" aria-label="Ruta de navegación">'
             '<a href="/">Inicio</a><span>/</span><a href="/foro">Foro</a><span>/</span>Ruta ' + e(rm["label"]) +
             '</nav></div>')

    header = ('<div class="container"><header class="fr-header">'
              '<span class="bl-chip bl-chip--' + e(t["ruta"]) + '">Ruta ' + e(rm["label"]) + '</span>'
              '<h1>' + e(t["titulo"]) + '</h1>'
              '<p class="fr-header__dek">' + e(t["resumen"]) + '</p>'
              '<div class="bl-meta">'
              '<span class="bl-meta__author"><img class="bl-meta__avatar" src="assets/logos/isotipo-dark.svg" alt="">Equipo Valor Pyme</span>'
              '<span class="bl-meta__sep"></span>'
              '<span class="bl-meta__item">' + CAL_ICON + e(t["fecha_label"]) + '</span>'
              '<span class="bl-meta__sep"></span>'
              '<span class="bl-meta__item">' + CHAT_ICON + '<span data-fr-count>' + count_label + '</span></span>'
              '</div></header></div>')

    contexto = "".join('<p>' + e(p) + '</p>' for p in t.get("contexto", []))

    question = ('<div class="fr-question">'
                '<img class="fr-question__lines" src="assets/lines/patron-lineas-color.svg" alt="" aria-hidden="true">'
                '<span class="fr-question__eyebrow">Pregunta para la comunidad</span>'
                '<p>' + e(t["pregunta"]) + '</p>'
                '</div>')

    form = ('<form class="fr-form" data-fr-form data-slug="' + e(t["slug"]) + '" novalidate>'
            '<div class="fr-form__head">'
            '<h2>Deja tu comentario</h2>'
            '<p>Cuéntale a la comunidad tu experiencia. Sé respetuoso: aquí compartimos para ayudarnos entre pymes.</p>'
            '</div>'
            '<div class="fr-form__row">'
            '<div class="fr-field"><label for="fr-nombre">Nombre <span class="req">*</span></label>'
            '<input id="fr-nombre" name="nombre" type="text" required placeholder="Tu nombre"></div>'
            '<div class="fr-field"><label for="fr-empresa">Negocio o ciudad <span style="color:var(--color-gris-claro);font-weight:400">(opcional)</span></label>'
            '<input id="fr-empresa" name="empresa" type="text" placeholder="Ej: Almacén Doña Mary · Maipú"></div>'
            '</div>'
            '<div class="fr-field"><label for="fr-comentario">Tu comentario <span class="req">*</span></label>'
            '<textarea id="fr-comentario" name="comentario" required placeholder="Comparte tu experiencia, tu consejo o tu duda…"></textarea></div>'
            '<div class="fr-check"><input id="fr-ok-check" type="checkbox" required>'
            '<label for="fr-ok-check">He leído y acepto las normas de convivencia de la comunidad. <span class="req">*</span></label></div>'
            '<div class="fr-form__actions">'
            '<button type="submit" class="btn">Publicar comentario' + ARROW + '</button>'
            '<span class="fr-form__note">' + LOCK_ICON + 'Revisamos cada comentario antes de publicarlo.</span>'
            '</div>'
            '<p class="fr-form__ok" id="fr-ok" role="status">' + CHECK_ICON +
            '<span>¡Gracias por participar! Tu comentario quedó <strong>en revisión</strong>. El equipo de Valor Pyme lo revisará y, si cumple las normas, aparecerá publicado en la conversación.</span></p>'
            '</form>')

    if comentarios:
        list_items = "".join(comment_html(c) for c in comentarios)
        empty = '<p class="fr-empty-comments" data-fr-empty hidden>Todavía no hay comentarios. ¡Sé el primero en participar!</p>'
    else:
        list_items = ""
        empty = '<p class="fr-empty-comments" data-fr-empty>Todavía no hay comentarios. ¡Sé el primero en participar!</p>'

    comments = ('<div class="fr-comments">'
                '<div class="fr-comments__head">'
                '<h2>Lo que otros emprendedores están compartiendo</h2>'
                '<span class="fr-comments__count" data-fr-count>' + count_label + '</span>'
                '</div>' + empty +
                '<div class="fr-list" id="fr-list">' + list_items + '</div>'
                '</div>')

    body = ('<div class="container"><div class="fr-wrap">'
            '<div class="fr-context">' + contexto + '</div>' +
            question + form + comments +
            '</div></div>')

    others_html = ""
    if others:
        cards = "".join(other_card(o, rutas) for o in others)
        others_html = ('<section class="section fr-more"><div class="container">'
                       '<div class="fr-more__head"><span class="hp-eyebrow">Sigue conversando</span>'
                       '<h2 class="hp-h2">Otros temas abiertos</h2></div>'
                       '<div class="fr-more__grid">' + cards + '</div>'
                       '</div></section>')

    final = ('<section class="hp-diag"><div class="container reveal">'
             '<span class="hp-eyebrow">Sé parte de la comunidad</span>'
             '<h2 class="hp-h2">Un viaje que se recorre mejor acompañado.</h2>'
             '<p>Suscríbete gratis y recibe nuevos temas del foro, guías y oportunidades para tu pyme directo en tu correo.</p>'
             '<a href="/#suscripcion" class="btn btn--onfill">Suscríbete gratis' + ARROW + '</a>'
             '</div></section>')

    top_pad = '<div style="padding-top:clamp(20px,3vw,34px)"></div>'
    return top_pad + crumb + header + '<div style="padding-top:clamp(8px,1.5vw,18px)"></div>' + body + others_html + final


def build():
    with open(os.path.join(SITE, "foro.json"), encoding="utf-8") as fh:
        db = json.load(fh)
    rutas = db["meta"]["rutas"]
    temas = db["temas"]

    # Reutilizar header + menú móvil y footer desde foro.html
    tpl = open(os.path.join(SITE, "foro.html"), encoding="utf-8").read()
    nav_block = re.search(r'<body[^>]*>\s*(.*?)\s*<main>', tpl, re.S).group(1)
    footer_block = re.search(r'</main>\s*(<footer class="site-footer">.*?</footer>)', tpl, re.S).group(1)

    for i, t in enumerate(temas):
        slug = t["slug"]
        others = [temas[j] for j in range(len(temas)) if j != i][:3]
        rm = rutas.get(t["ruta"], {"label": "Comunidad"})
        title = t["titulo"] + " — Foro · Valor Pyme"
        desc = t["resumen"]
        url = BASE_URL + slug

        ld = {
            "@context": "https://schema.org",
            "@type": "DiscussionForumPosting",
            "headline": t["titulo"],
            "text": t["resumen"],
            "url": url,
            "datePublished": t.get("fecha"),
            "inLanguage": "es-CL",
            "author": {"@type": "Organization", "name": "Valor Pyme"},
            "publisher": {
                "@type": "Organization", "name": "Valor Pyme",
                "logo": {"@type": "ImageObject", "url": BASE_URL + "assets/logos/logo-horizontal-dark.svg"},
            },
            "commentCount": len(t.get("comentarios") or []),
            "comment": [
                {"@type": "Comment", "text": c["texto"],
                 "author": {"@type": "Person", "name": c["nombre"]}}
                for c in (t.get("comentarios") or [])
            ],
        }

        head = (
            '<!DOCTYPE html>\n<html lang="es-CL">\n<head>\n'
            '<meta charset="UTF-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n'
            '<title>' + e(title) + '</title>\n'
            '<meta name="description" content="' + e(desc) + '">\n'
            '<link rel="canonical" href="' + e(url) + '">\n'
            '<meta property="og:title" content="' + e(t["titulo"] + " — Foro Valor Pyme") + '">\n'
            '<meta property="og:description" content="' + e(desc) + '">\n'
            '<meta property="og:type" content="article">\n'
            '<meta property="og:url" content="' + e(url) + '">\n'
            '<meta property="og:image" content="' + e(BASE_URL + "assets/photos/brand/blog-a.jpg") + '">\n'
            '<meta name="twitter:card" content="summary_large_image">\n'
            '<link rel="icon" href="assets/logos/isotipo-dark.svg" type="image/svg+xml">\n'
            '<link rel="preconnect" href="https://fonts.googleapis.com">\n'
            '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n'
            '<link rel="stylesheet" href="' + CSS_STYLES + '">\n'
            '<link rel="stylesheet" href="' + CSS_BLOG + '">\n'
            '<link rel="stylesheet" href="' + CSS_FORO + '">\n'
            '<script type="application/ld+json">' + json.dumps(ld, ensure_ascii=False) + '</script>\n'
            '</head>\n<body data-ruta="" class="hp">\n\n'
        )

        doc = (head + nav_block + "\n\n<main>\n" +
               entry_html(t, rutas, others) + "\n</main>\n\n" + footer_block +
               '\n\n<script src="script.js?v=17" defer></script>\n'
               '<script src="blog.js?v=5" defer></script>\n'
               '<script src="foro.js?v=1" defer></script>\n'
               '</body>\n</html>\n')

        out = os.path.join(SITE, slug + ".html")
        with open(out, "w", encoding="utf-8") as fh:
            fh.write(doc)
        print("generado:", slug + ".html")


if __name__ == "__main__":
    build()
