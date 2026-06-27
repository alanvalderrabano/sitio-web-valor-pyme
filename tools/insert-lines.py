#!/usr/bin/env python3
"""Inserta las líneas WebP recortadas como overlay <img>, reemplazando el SVG
dentro de hero__lines (5 páginas) y section__lines (4 rutas)."""
import re, os, glob

SITE = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "site"))
VER = "1"   # cache-bust
STY = "position:absolute;inset:0;width:100%;height:100%;object-fit:cover"

PAGES = {  # archivo -> (hero_key, sec_key|None)
    "rutas":               ("rutas", None),
    "ruta-capital":        ("capital", "capital"),
    "ruta-mercado":        ("mercado", "mercado"),
    "ruta-digitalizacion": ("digitalizacion", "digitalizacion"),
    "ruta-talento":        ("talento", "talento"),
}

def img(kind, key):
    return (f'<img src="assets/lines/lineas-{kind}-{key}.webp?v={VER}" alt="" '
            f'style="{STY}">')

RE_HERO = re.compile(r'(<div class="hero__lines"[^>]*>)\s*(?:<svg[\s\S]*?</svg>|<img[^>]*>)')
RE_SEC  = re.compile(r'(<div class="section__lines"[^>]*>)\s*(?:<svg[\s\S]*?</svg>|<img[^>]*>)')

for page, (hkey, skey) in PAGES.items():
    path = os.path.join(SITE, page + ".html")
    t = open(path).read()
    t, nh = RE_HERO.subn(lambda m: m.group(1) + "\n    " + img("hero", hkey), t, count=1)
    ns = 0
    if skey:
        t, ns = RE_SEC.subn(lambda m: m.group(1) + "\n    " + img("sec", skey), t, count=1)
    open(path, "w").write(t)
    print(f"{page:22s} hero={nh} section={ns}")
