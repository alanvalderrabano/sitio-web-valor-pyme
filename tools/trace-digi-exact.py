#!/usr/bin/env python3
"""Reproduce EXACTAMENTE el patrón de la referencia del cliente (ref-digi.png)
extrayendo las curvas por color píxel a píxel y redibujándolas con brocha redonda
sobre alfa limpio, full-bleed, sin estaciones. -> lineas-hero-digitalizacion.webp"""
import numpy as np
from PIL import Image, ImageDraw

SC = "/private/tmp/claude-501/-Users-alan-Documents-Valor-Pyme/beef633b-45e8-446a-b569-ae1d2d245d6e/scratchpad"
OUT = "/Users/alan/Documents/Valor Pyme/sitio-web-rutas/site/assets/lines/lineas-hero-digitalizacion.webp"

ref = Image.open(f"{SC}/ref-digi.png").convert("RGB")
a = np.asarray(ref).astype(int); H, W, _ = a.shape
R, G, B = a[:, :, 0], a[:, :, 1], a[:, :, 2]
masks = {
    "V": (R < 95) & (G < 75) & (B > 70),                       # violeta profundo
    "G": (G > 120) & (G > R + 40) & (G > B + 10) & (R < 150),  # verde
    "Y": (R > 180) & (G > 160) & (B < 110),                    # amarillo
}
gray = (np.abs(R - G) < 25) & (np.abs(G - B) < 25) & (R > 40) & (R < 210)
PX0 = 435  # la foto empieza ~55% del ancho

def anchors(name):
    m = masks[name] & ~gray
    pts = []
    for x in range(W):
        ys = np.where(m[:, x])[0]
        if name in ("Y", "G") and x >= PX0:
            ys = ys[ys < int(H * 0.50)]   # a la derecha solo la cima del arco (sobre la foto)
        if name == "V" and x >= PX0:
            continue
        if len(ys) >= 2:
            pts.append((x, float(np.median(ys))))
    # bin por x (suaviza)
    xs = np.array([p[0] for p in pts]); ysv = np.array([p[1] for p in pts])
    bins = np.linspace(0, W, 70)
    out = []
    for i in range(len(bins) - 1):
        sel = (xs >= bins[i]) & (xs < bins[i + 1])
        if sel.any():
            out.append((float(xs[sel].mean()), float(np.median(ysv[sel]))))
    return out

# --- construye la polilínea completa de cada color (full width) en coords ref ---
flat = {"Y": H * 0.61, "G": H * 0.54, "V": H * 0.78}
# arco grande (amarillo exterior + verde interior) reconstruido donde la foto tapa
XC, HW = 478.0, 100.0                 # centro y semiancho del arco
PEAK = {"Y": H * 0.18, "G": H * 0.25} # cima: amarillo más alto, verde justo por dentro
ARCH_X0 = 360.0                       # a la izq de esto = trazo exacto; a la der = arco analitico

def build_lr(name):
    """izquierda: trazo exacto de la referencia; derecha: arco coseno + plano (full-bleed)."""
    an = [p for p in anchors(name) if p[0] < ARCH_X0]
    fy = flat[name]
    pts = [(-30.0, an[0][1])] + an
    amp = fy - PEAK[name]
    import math
    x = ARCH_X0
    while x <= W + 30:
        if abs(x - XC) < HW:
            y = fy - amp * 0.5 * (1 + math.cos(math.pi * (x - XC) / HW))
        else:
            y = fy
        pts.append((x, y)); x += 4
    return pts

def build_v():
    an = anchors("V")
    return [(-30.0, an[0][1])] + an + [(W + 30.0, flat["V"])]

paths = {"V": build_v(), "G": build_lr("G"), "Y": build_lr("Y")}

# --- densifica con interpolación monótona en x ---
def densify(pts, step=1.0):
    pts = sorted(pts, key=lambda p: p[0])
    xs = np.array([p[0] for p in pts]); ys = np.array([p[1] for p in pts])
    X = np.arange(xs[0], xs[-1], step)
    Y = np.interp(X, xs, ys)
    # suavizado leve (media móvil) para que el arco quede redondo
    k = 9
    Ys = np.convolve(Y, np.ones(k)/k, mode="same")
    Ys[:k] = Y[:k]; Ys[-k:] = Y[-k:]
    return list(zip(X, Ys))

# --- render a 1760x982, escala uniforme, brocha redonda ---
TW, TH = 1760, 982
scale = TW / W                      # escala uniforme (no distorsiona)
off_y = (TH - H * scale) / 2.0
canvas = Image.new("RGBA", (TW, TH), (0, 0, 0, 0))
d = ImageDraw.Draw(canvas)
RGB = {"Y": (255, 242, 28), "G": (0, 189, 112), "V": (51, 5, 89)}
rad = 8                             # ~16px de grosor a 1760 (match talento ~13-16)
for name in ("V", "G", "Y"):        # violeta abajo, amarillo arriba
    dense = densify(paths[name])
    col = RGB[name] + (255,)
    prev = None
    for (x, y) in dense:
        X = x * scale; Y = y * scale + off_y
        d.ellipse([X-rad, Y-rad, X+rad, Y+rad], fill=col)
        if prev is not None:
            d.line([prev, (X, Y)], fill=col, width=rad*2)
        prev = (X, Y)

canvas.save(OUT, "WEBP", quality=92, method=6)
print("saved", OUT, canvas.size)
# previews
base = Image.new("RGBA", canvas.size, (235, 72, 97, 255))
Image.alpha_composite(base, canvas).convert("RGB").resize((780, 435)).save(f"{SC}/digi-exact-pink.png")
Image.alpha_composite(Image.new("RGBA", canvas.size, (38,38,42,255)), canvas).convert("RGB").resize((780,435)).save(f"{SC}/digi-exact-dark.png")
print("previews ready")
