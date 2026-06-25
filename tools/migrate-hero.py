#!/usr/bin/env python3
"""Migra el hero de las 4 paginas de ruta a la arquitectura v3 (3 capas):
fondo (mitad derecha) -> lineas brandbook -> personaje recortado.
Reemplaza el bloque hero__lines (bezier viejo) y el hero__visual (foto)."""
import re
import subprocess
import os

HERE = os.path.dirname(os.path.abspath(__file__))
SITE = os.path.abspath(os.path.join(HERE, "..", "site"))

ALT = {
    "capital": "Duena de pyme con tablet revisando sus finanzas",
    "mercado": "Comerciante en su local mostrando un producto",
    "digitalizacion": "Emprendedora con laptop digitalizando su negocio",
    "talento": "Lider de equipo de una pyme",
}

RE_LINES = re.compile(r'<div class="hero__lines" aria-hidden="true">.*?</svg>\s*</div>', re.S)
RE_VISUAL = re.compile(r'<div class="hero__visual">.*?</div>\s*</div>', re.S)

for r in ["capital", "mercado", "digitalizacion", "talento"]:
    path = os.path.join(SITE, f"ruta-{r}.html")
    text = open(path).read()
    svg = subprocess.run(["python3", os.path.join(HERE, "hero-lines.py"), r],
                         capture_output=True, text=True).stdout.rstrip("\n")

    lines_block = (
        f'<div class="hero__bg" aria-hidden="true"><img src="assets/photos/brand/hero-bg-{r}.jpg" alt=""></div>\n'
        f'  <div class="hero__lines" aria-hidden="true">\n{svg}\n  </div>'
    )
    char_block = (
        f'<img class="hero__character" src="assets/photos/brand/hero-char-{r}.png" '
        f'width="1856" height="2304" alt="{ALT[r]}">'
    )

    new, n1 = RE_LINES.subn(lines_block, text, count=1)
    new, n2 = RE_VISUAL.subn(char_block, new, count=1)
    if n1 != 1 or n2 != 1:
        print(f"!! {r}: lines={n1} visual={n2} (esperaba 1/1) — NO escrito")
        continue
    open(path, "w").write(new)
    print(f"OK {r}: lines+bg y personaje reemplazados")
