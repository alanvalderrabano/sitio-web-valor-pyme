#!/usr/bin/env python3
"""
Líneas Valor Pyme v4 — flujo orgánico estilo brandbook p49.

Reemplaza el patrón geométrico de "vías de tren" de v3 (vías paralelas
perfectas + cruces en las mismas x + misma curva-S repetida) por trazos que
SERPENTEAN con amplitud y cruces variados, ÚNICOS por hero y por sección.

Cómo se logra el look orgánico (no geométrico) sin perder armonía de marca:
  - Spline Catmull-Rom suave a través de puntos de control con meandro
    (random-walk correlacionado → ondula, no hace zig-zag de ruido).
  - Una onda global compartida mueve todo el conjunto junto (parece diseñado,
    no aleatorio).
  - Grosor de cada trazo ligeramente variable: calc(var(--linea-peso) * f).
  - Nodos blancos (estaciones) en cruces REALES, sin borde, bien espaciados.
  - Semilla por (página, región) → cada hero y cada sección tiene su propio
    recorrido, reproducible.

Inyecta en hero__lines (las 5 páginas) y en section__lines (las 4 rutas).
Bordes a sangre (x de -80 a 1520) y vector-effect:non-scaling-stroke vienen
del CSS, así escala nítido a cualquier ancho.
"""
import re, os, glob, math, hashlib, random

SITE = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "site"))
W = 1440
X0, X1 = -80, 1520          # sangrado de borde a borde
SPAN = X1 - X0

# colores por página (orden = trazo 0..n); deben contrastar con el fondo de la ruta
HERO_COLORS = {
    "rutas":               ["var(--color-amarillo)", "var(--color-negro)", "var(--color-rosa)",     "var(--color-verde)"],
    "ruta-capital":        ["var(--color-morado)",   "var(--color-corp)",  "var(--color-rosa)",     "var(--color-verde)"],
    "ruta-mercado":        ["var(--color-amarillo)", "var(--color-menta)", "var(--color-rosa)",     "var(--color-verde)"],
    "ruta-digitalizacion": ["var(--color-morado)",   "var(--color-corp)",  "var(--color-amarillo)", "var(--color-verde)"],
    "ruta-talento":        ["var(--color-morado)",   "var(--color-corp)",  "var(--color-amarillo)", "var(--color-rosa)"],
}
# sección "por qué" (fondo blanco): 3 trazos
SEC_COLORS = ["var(--color-corp)", "var(--color-rosa)", "var(--color-verde)"]


def seeded(key):
    h = hashlib.md5(key.encode()).hexdigest()
    return random.Random(int(h[:12], 16))


def catmull_path(pts):
    """pts: [(x,y)]. Devuelve un path SVG con bezier suave (Catmull-Rom→cúbica)."""
    n = len(pts)
    d = [f"M{pts[0][0]:.1f} {pts[0][1]:.1f}"]
    for i in range(n - 1):
        p0 = pts[i - 1] if i > 0 else pts[i]
        p1, p2 = pts[i], pts[i + 1]
        p3 = pts[i + 2] if i + 2 < n else pts[i + 1]
        c1x = p1[0] + (p2[0] - p0[0]) / 6.0
        c1y = p1[1] + (p2[1] - p0[1]) / 6.0
        c2x = p2[0] - (p3[0] - p1[0]) / 6.0
        c2y = p2[1] - (p3[1] - p1[1]) / 6.0
        d.append(f"C{c1x:.1f} {c1y:.1f} {c2x:.1f} {c2y:.1f} {p2[0]:.1f} {p2[1]:.1f}")
    return " ".join(d)


def gen_lines(rng, n, vbh, pad, kpts):
    """Genera n líneas orgánicas que SE CRUZAN. Cada línea = suma de dos senos
    con fase propia (→ se intercalan), más una deriva global mínima de cohesión.
    Devuelve (ctrl_pts para el path, polylines densas para detectar cruces)."""
    band = vbh - 2 * pad
    # carriles repartidos en el 72% central de la banda (cruzan dentro de cuadro)
    spread = 0.72 * band
    lane0 = pad + 0.14 * band
    egap = spread / (n - 1) if n > 1 else spread
    ymin, ymax = pad * 0.42, vbh - pad * 0.42

    # deriva global suave → da cohesión de "sistema" sin imponer orden
    gd_amp = rng.uniform(0.04, 0.08) * band
    gd_f = rng.uniform(0.6, 1.1)
    gd_p = rng.uniform(0, 2 * math.pi)

    params = []
    for i in range(n):
        lane = lane0 + egap * i
        a1 = rng.uniform(0.78, 1.18) * egap     # onda base (amplia → cruza carriles)
        f1 = rng.uniform(0.75, 1.55)
        p1 = rng.uniform(0, 2 * math.pi)
        a2 = rng.uniform(0.20, 0.42) * egap     # 2.ª armónica (rompe la regularidad)
        f2 = rng.uniform(1.8, 3.0)
        p2 = rng.uniform(0, 2 * math.pi)
        params.append((lane, a1, f1, p1, a2, f2, p2))

    def y_of(i, x):
        lane, a1, f1, p1, a2, f2, p2 = params[i]
        u = (x - X0) / SPAN
        y = (lane
             + a1 * math.sin(2 * math.pi * f1 * u + p1)
             + a2 * math.sin(2 * math.pi * f2 * u + p2)
             + gd_amp * math.sin(2 * math.pi * gd_f * u + gd_p))
        return max(ymin, min(ymax, y))

    xs = [X0 + SPAN * k / (kpts - 1) for k in range(kpts)]
    ctrl = [[(x, y_of(i, x)) for x in xs] for i in range(n)]
    dense = [X0 + SPAN * k / 159.0 for k in range(160)]
    polys = [[(x, y_of(i, x)) for x in dense] for i in range(n)]
    return ctrl, polys


def crossings(polys):
    """Cruces reales entre pares de líneas (las polilíneas comparten x por índice)."""
    pts = []
    for a in range(len(polys)):
        for b in range(a + 1, len(polys)):
            pa, pb = polys[a], polys[b]
            m = min(len(pa), len(pb))
            prev = None
            for i in range(m):
                dlt = pa[i][1] - pb[i][1]
                if prev is not None and ((dlt < 0) != (prev < 0)):
                    x = (pa[i][0] + pa[i - 1][0]) / 2
                    y = (pa[i][1] + pb[i][1] + pa[i - 1][1] + pb[i - 1][1]) / 4
                    pts.append((x, y))
                prev = dlt
    return pts


def pick_nodes(cross, want, gap, xpad):
    """Elige cruces bien espaciados, lejos de los bordes."""
    cand = sorted(c for c in cross if xpad <= c[0] <= W - xpad)
    chosen = []
    for c in cand:
        if all(abs(c[0] - d[0]) > gap for d in chosen):
            chosen.append(c)
        if len(chosen) >= want:
            break
    return chosen


def emit(colors, widths, vbh, stn_class, r, lines_ctrl, nodes):
    out = [f'<svg viewBox="0 0 {W} {vbh}" preserveAspectRatio="xMidYMid slice" aria-hidden="true">']
    for i, pts in enumerate(lines_ctrl):
        d = catmull_path(pts)
        out.append(f'      <path class="route-line" '
                   f'style="stroke:{colors[i]};stroke-width:calc(var(--linea-peso) * {widths[i]})" d="{d}"/>')
    for (x, y) in nodes:
        out.append(f'      <circle class="{stn_class}" cx="{x:.0f}" cy="{y:.0f}" r="{r}"/>')
    out.append('    </svg>')
    return "\n".join(out)


def widths_for(rng, n):
    return [round(rng.uniform(0.82, 1.20), 2) for _ in range(n)]


RE_HERO = re.compile(r'(<div class="hero__lines"[^>]*>)\s*<svg[\s\S]*?</svg>')
RE_SEC  = re.compile(r'(<div class="section__lines"[^>]*>)\s*<svg[\s\S]*?</svg>')

for path in sorted(glob.glob(os.path.join(SITE, "*.html"))):
    key = os.path.splitext(os.path.basename(path))[0]
    if key not in HERO_COLORS:
        continue
    t = open(path).read()

    # ---- HERO ----
    rng = seeded(key + "|hero")
    cols = HERO_COLORS[key]
    lc, polys = gen_lines(rng, len(cols), 560, 60, kpts=18)
    w = widths_for(rng, len(cols))
    nodes = pick_nodes(crossings(polys), want=rng.randint(4, 6), gap=185, xpad=130)
    hero_svg = emit(cols, w, 560, "hero__stn", 12, lc, nodes)
    t, nh = RE_HERO.subn(lambda m: m.group(1) + "\n    " + hero_svg, t, count=1)

    # ---- SECCIÓN "por qué" (puede no existir, p.ej. rutas.html) ----
    ns = 0
    if 'class="section__lines"' in t:
        rng = seeded(key + "|sec")
        lc2, polys2 = gen_lines(rng, len(SEC_COLORS), 480, 55, kpts=16)
        w2 = widths_for(rng, len(SEC_COLORS))
        nodes2 = pick_nodes(crossings(polys2), want=rng.randint(3, 4), gap=210, xpad=140)
        sec_svg = emit(SEC_COLORS, w2, 480, "section__stn", 11, lc2, nodes2)
        t, ns = RE_SEC.subn(lambda m: m.group(1) + "\n    " + sec_svg, t, count=1)

    open(path, "w").write(t)
    print(f"{os.path.basename(path):26s} hero={nh} section={ns}")
