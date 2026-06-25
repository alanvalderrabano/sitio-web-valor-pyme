#!/usr/bin/env python3
"""
Genera las líneas del hero de Valor Pyme con la geometría del brandbook:
trazos de metro construidos con ARCOS DE 1/4 DE CÍRCULO de radio constante
(cada transición entre "vías" = dos cuartos de círculo espejados, tipo S).
Nada de bezier "espagueti".

Las ESTACIONES se colocan en las INTERSECCIONES REALES entre líneas
(brand-kit §5.2.4 / §5.4.2: el punto sólo aparece en cruces).

Uso:
  python3 hero-lines.py            -> mapa de color del hub (fondo morado)
  python3 hero-lines.py capital    -> mapa de color de una ruta
"""
import math
import sys

W, H = 1440, 560
R = 60                       # radio de cada 1/4 de círculo (constante)
SP = 2 * R                   # separación entre vías = 2R
Y0 = 96
TRACKS = [Y0 + i * SP for i in range(4)]   # 96, 216, 336, 456

# Líneas: (nombre, vía inicial, [(cx, dir)])  dir +1 baja una vía, -1 sube.
LINES = [
    ("amarillo", 0, [(360, +1), (900, -1)]),
    ("negro",    1, [(250, +1), (760, -1), (1170, +1)]),
    ("rosa",     2, [(300, -1), (650, +1), (1050, -1)]),
    ("verde",    3, [(560, -1), (1010, +1)]),
]


def build(start_track, steps, tracks):
    """Devuelve (d_string, [puntos]) muestreando los arcos para poder
    calcular intersecciones."""
    cur = start_track
    y = tracks[cur]
    x = -80
    d = f"M{x} {y}"
    pts = [(x, y)]

    def arc(cx, cy, a0, a1):
        n = 16
        for i in range(1, n + 1):
            a = math.radians(a0 + (a1 - a0) * i / n)
            pts.append((cx + R * math.cos(a), cy + R * math.sin(a)))

    for cx, dr in steps:
        sx = cx - R
        d += f" L{sx} {y}"
        pts.append((sx, y))
        if dr > 0:                                   # baja
            d += f" A{R} {R} 0 0 1 {sx + R} {y + R}"
            d += f" A{R} {R} 0 0 0 {sx + 2*R} {y + 2*R}"
            arc(sx, y + R, -90, 0)                    # 1/4 CW
            arc(sx + 2*R, y + R, 180, 90)             # 1/4 CCW
            y += SP
        else:                                        # sube (espejo)
            d += f" A{R} {R} 0 0 0 {sx + R} {y - R}"
            d += f" A{R} {R} 0 0 1 {sx + 2*R} {y - 2*R}"
            arc(sx, y - R, 90, 0)
            arc(sx + 2*R, y - R, 180, 270)
            y -= SP
        cur += dr
    d += f" L{W + 80} {y}"
    pts.append((W + 80, y))
    return d, pts


def seg_intersect(p1, p2, p3, p4):
    """Intersección de segmentos p1p2 y p3p4 (o None)."""
    x1, y1 = p1; x2, y2 = p2; x3, y3 = p3; x4, y4 = p4
    den = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4)
    if abs(den) < 1e-9:
        return None
    t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / den
    u = ((x1 - x3) * (y1 - y2) - (y1 - y3) * (x1 - x2)) / den
    if 0 <= t <= 1 and 0 <= u <= 1:
        return (x1 + t * (x2 - x1), y1 + t * (y2 - y1))
    return None


def stations(polys):
    found = []
    for i in range(len(polys)):
        for j in range(i + 1, len(polys)):
            A, B = polys[i], polys[j]
            for a in range(len(A) - 1):
                for b in range(len(B) - 1):
                    p = seg_intersect(A[a], A[a + 1], B[b], B[b + 1])
                    if p:
                        found.append(p)
    # dedup por cercanía
    out = []
    for p in found:
        if all((p[0] - q[0]) ** 2 + (p[1] - q[1]) ** 2 > 30 ** 2 for q in out):
            if 10 < p[0] < W - 10:                    # dentro del frame visible
                out.append(p)
    return out


# Colores por línea (geometría line0..line3) elegidos para contrastar con el
# fondo de cada ruta (la mitad izquierda del hero = color de ruta).
COLORS = {
    "hub":           {"amarillo": "var(--color-amarillo)", "negro": "var(--color-negro)", "rosa": "var(--color-rosa)",     "verde": "var(--color-verde)"},
    "capital":       {"amarillo": "var(--color-morado)",   "negro": "var(--color-corp)",  "rosa": "var(--color-rosa)",     "verde": "var(--color-verde)"},
    "mercado":       {"amarillo": "var(--color-amarillo)", "negro": None,                 "rosa": "var(--color-rosa)",     "verde": "var(--color-verde)"},
    "digitalizacion":{"amarillo": "var(--color-morado)",   "negro": "var(--color-corp)",  "rosa": "var(--color-amarillo)", "verde": "var(--color-verde)"},
    "talento":       {"amarillo": "var(--color-morado)",   "negro": "var(--color-corp)",  "rosa": "var(--color-amarillo)", "verde": "var(--color-rosa)"},
}


# ---- Sección "Por qué la ruta": banda más baja, sobre fondo BLANCO ----
# 3 líneas con colores que contrastan en blanco (consistentes en las 4 rutas).
SECTION_H = 480
SECTION_TRACKS = [84, 204, 324]            # 3 vías (sep 120 = 2R)
SECTION_LINES = [
    ("a", 0, [(380, +1), (980, -1)]),
    ("b", 1, [(260, +1), (820, -1)]),
    ("c", 2, [(540, -1), (1080, +1)]),
]
SECTION_COLORS = {"a": "var(--color-corp)", "b": "var(--color-rosa)", "c": "var(--color-verde)"}


def emit(cmap, lines, tracks, vbh, stn_class, r=11):
    paths, polys = [], []
    for name, st, steps in lines:
        color = cmap.get(name)
        if not color:                      # color None/ausente -> se omite esa línea
            continue
        d, pts = build(st, steps, tracks)
        polys.append(pts)
        paths.append(f'      <path class="route-line" style="stroke:{color}" d="{d}"/>')
    out = [f'    <svg viewBox="0 0 {W} {vbh}" preserveAspectRatio="xMidYMid slice" aria-hidden="true">']
    out += paths
    for (cx, cy) in stations(polys):
        out.append(f'      <circle class="{stn_class}" cx="{cx:.0f}" cy="{cy:.0f}" r="{r}"/>')
    out.append('    </svg>')
    return "\n".join(out)


if __name__ == "__main__":
    args = sys.argv[1:]
    if args and args[0] == "section":
        print(emit(SECTION_COLORS, SECTION_LINES, SECTION_TRACKS, SECTION_H, "section__stn"))
    else:
        key = args[0] if args else "hub"
        print(emit(COLORS.get(key, COLORS["hub"]), LINES, TRACKS, H, "hero__stn", r=12))
