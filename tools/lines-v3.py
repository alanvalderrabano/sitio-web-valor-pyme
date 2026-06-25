#!/usr/bin/env python3
"""
Líneas Valor Pyme v3 — estilo brandbook p49.
- Líneas SIEMPRE en vías paralelas distintas (nunca encimadas), que se CRUZAN
  limpio en puntos concretos (red de ordenamiento / trenza).
- Transiciones BEZIER suaves con tangentes horizontales (no arcos rígidos).
- ESTACIONES solo en los cruces. Nodos blancos SIN borde.
Inyecta el SVG nuevo en el hero (todas) y en la sección "por qué" (rutas).
"""
import re, os, glob

SITE = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "site"))
W = 1440

def build(n, tracks, swaps, TW):
    """Devuelve (paths, nodes). Cada swap (x, L) intercambia ocupantes de las
    vías L y L+1: cruce limpio con estación en el punto medio."""
    occ = list(range(n))                 # occ[via] = linea
    trans = [[] for _ in range(n)]       # trans[linea] = [(x, via_ini, via_fin)]
    nodes = []
    for (x, L) in sorted(swaps):
        a, b = occ[L], occ[L + 1]
        trans[a].append((x, L, L + 1))   # baja
        trans[b].append((x, L + 1, L))   # sube
        occ[L], occ[L + 1] = b, a
        nodes.append((x, (tracks[L] + tracks[L + 1]) / 2.0))
    paths = []
    for line in range(n):
        y = tracks[line]
        d = [f"M-80 {y:.0f}"]
        for (x, ft, tt) in sorted(trans[line]):
            y0, y1 = tracks[ft], tracks[tt]
            xs, xe = x - TW / 2, x + TW / 2
            d.append(f"L{xs:.0f} {y0:.0f}")
            d.append(f"C{x:.0f} {y0:.0f} {x:.0f} {y1:.0f} {xe:.0f} {y1:.0f}")
            y = y1
        d.append(f"L{W + 80} {y:.0f}")
        paths.append(" ".join(d))
    return paths, nodes

def emit(colors, tracks, swaps, vbh, stn_class, TW, r):
    paths, nodes = build(len(tracks), tracks, swaps, TW)
    out = [f'<svg viewBox="0 0 {W} {vbh}" preserveAspectRatio="xMidYMid slice" aria-hidden="true">']
    for i, d in enumerate(paths):
        out.append(f'      <path class="route-line" style="stroke:{colors[i]}" d="{d}"/>')
    for (x, y) in nodes:
        out.append(f'      <circle class="{stn_class}" cx="{x:.0f}" cy="{y:.0f}" r="{r}"/>')
    out.append('    </svg>')
    return "\n".join(out)

# ---- HERO: 4 líneas, 4 vías paralelas, trenza con 6 cruces ----
HERO_TRACKS = [110, 230, 350, 470]
HERO_SWAPS  = [(300, 1), (560, 0), (560, 2), (860, 1), (1120, 0), (1120, 2)]
HERO_TW = 180
# colores por página (orden = vía inicial 0..3); deben contrastar con el fondo de la ruta
HERO_COLORS = {
    "rutas":          ["var(--color-amarillo)", "var(--color-negro)", "var(--color-rosa)",     "var(--color-verde)"],
    "ruta-capital":   ["var(--color-morado)",   "var(--color-corp)",  "var(--color-rosa)",     "var(--color-verde)"],
    "ruta-mercado":   ["var(--color-amarillo)", "var(--color-menta)", "var(--color-rosa)",     "var(--color-verde)"],
    "ruta-digitalizacion": ["var(--color-morado)", "var(--color-corp)", "var(--color-amarillo)", "var(--color-verde)"],
    "ruta-talento":   ["var(--color-morado)",   "var(--color-corp)",  "var(--color-amarillo)", "var(--color-rosa)"],
}

# ---- SECCIÓN "por qué" (fondo blanco): 3 líneas, 3 vías, 3 cruces ----
SEC_TRACKS = [130, 250, 370]
SEC_SWAPS  = [(360, 1), (680, 0), (1000, 1)]
SEC_TW = 180
SEC_COLORS = ["var(--color-corp)", "var(--color-rosa)", "var(--color-verde)"]

RE_HERO = re.compile(r'(<div class="hero__lines"[^>]*>)\s*<svg[\s\S]*?</svg>')
RE_SEC  = re.compile(r'(<div class="section__lines"[^>]*>)\s*<svg[\s\S]*?</svg>')

for path in glob.glob(os.path.join(SITE, "*.html")):
    key = os.path.splitext(os.path.basename(path))[0]
    if key not in HERO_COLORS:
        continue
    t = open(path).read()
    hero_svg = emit(HERO_COLORS[key], HERO_TRACKS, HERO_SWAPS, 560, "hero__stn", HERO_TW, 12)
    t, nh = RE_HERO.subn(lambda m: m.group(1) + "\n    " + hero_svg, t, count=1)
    sec_svg = emit(SEC_COLORS, SEC_TRACKS, SEC_SWAPS, 480, "section__stn", SEC_TW, 11)
    t, ns = RE_SEC.subn(lambda m: m.group(1) + "\n    " + sec_svg, t, count=1)
    open(path, "w").write(t)
    print(f"{os.path.basename(path)}: hero={nh} section={ns}")
