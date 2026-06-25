#!/usr/bin/env python3
"""Mueve <img class="hero__character"> de dentro del grid a hijo directo de
.hero (antes del .container hero__grid), para que el position:absolute se
resuelva contra el hero (igual que en el hub)."""
import re
import os

SITE = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "site"))

for r in ["capital", "mercado", "digitalizacion", "talento"]:
    p = os.path.join(SITE, f"ruta-{r}.html")
    text = open(p).read()
    m = re.search(r'[ \t]*<img class="hero__character"[^>]*>\n?', text)
    if not m:
        print(f"!! {r}: no encontre el personaje"); continue
    img = m.group(0).strip()
    text = text[:m.start()] + text[m.end():]              # quitar de su lugar
    text, n = re.subn(r'( *)<div class="container hero__grid">',
                      r'  ' + img.replace('\\', '\\\\') + r'\n\n\1<div class="container hero__grid">',
                      text, count=1)
    if n != 1:
        print(f"!! {r}: no encontre el grid"); continue
    open(p, "w").write(text)
    print(f"OK {r}: personaje movido a hijo directo de .hero")
