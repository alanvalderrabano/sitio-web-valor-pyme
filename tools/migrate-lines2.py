#!/usr/bin/env python3
"""Convierte a patrón brandbook (arcos de 1/4 de círculo) las líneas bezier
restantes: franja B&N (bw-band) en las 4 rutas y los metroline del home."""
import re
import os
import glob

SITE = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "site"))

# --- bw-band: una sola línea de arco (sin estación: línea única = no hay cruce) ---
BW_NEW = ('<svg class="bw-band__line" viewBox="0 0 1200 300" preserveAspectRatio="xMidYMid slice" aria-hidden="true">\n'
          '    <path class="route-line" style="stroke:var(--ruta);stroke-width:9" '
          'd="M-40 110 L470 110 A60 60 0 0 1 530 170 A60 60 0 0 0 590 230 L1240 230"/>\n'
          '  </svg>')
RE_BW = re.compile(r'<svg class="bw-band__line"[\s\S]*?</svg>')

for p in glob.glob(os.path.join(SITE, "ruta-*.html")):
    t = open(p).read()
    t, n = RE_BW.subn(BW_NEW, t, count=1)
    open(p, "w").write(t)
    print(f"bw-band {os.path.basename(p)}: {n}")

# --- home: línea fina con arcos (weave entre y=14 y y=42, R=14) reemplaza las ondas sine ---
ARC = ("M-40 14 L166 14 A14 14 0 0 1 180 28 A14 14 0 0 0 194 42 L406 42 A14 14 0 0 0 420 28 "
       "A14 14 0 0 1 434 14 L646 14 A14 14 0 0 1 660 28 A14 14 0 0 0 674 42 L886 42 "
       "A14 14 0 0 0 900 28 A14 14 0 0 1 914 14 L1126 14 A14 14 0 0 1 1140 28 A14 14 0 0 0 1154 42 L1240 42")
idx = os.path.join(SITE, "index.html")
t = open(idx).read()
old1 = "M-40 28 Q 60 6 160 28 T 360 28 T 560 28 T 760 28 T 960 28 T 1160 28 T 1360 28"
old2 = "M0 28 Q 100 6 200 28 T 400 28 T 600 28 T 800 28 T 1000 28 T 1200 28"
c1 = t.count(old1); c2 = t.count(old2)
t = t.replace(old1, ARC).replace(old2, ARC)
open(idx, "w").write(t)
print(f"home metroline: reemplazos sine1={c1} sine2={c2}")

# --- limpieza: SVG de movilidad huérfanos (journey eliminado) ---
for f in glob.glob(os.path.join(SITE, "assets/img/movilidad-*.svg")):
    os.remove(f); print(f"borrado {os.path.basename(f)}")
