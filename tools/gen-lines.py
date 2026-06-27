#!/usr/bin/env python3
"""
Genera las LÍNEAS de marca (estilo mapa de transporte del brandbook) con Nano
Banana Pro (kie.ai), sobre un fondo chroma sólido, las recorta a PNG/WebP con
alfa, y las deja en site/assets/lines/ listas para insertar como overlay.

Un patrón ÚNICO por hero (5) y por sección (4). Paleta por página que contrasta
con su fondo; chroma elegido para no chocar con los colores de cada panel
(magenta para Mercado porque su "menta" está cerca del cian).

Uso: python3 gen-lines.py [solo_clave_opcional]
"""
import concurrent.futures as cf, json, os, subprocess, sys, time
import numpy as np
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.abspath(os.path.join(HERE, "..", "site", "assets", "lines"))
TMP = "/tmp/genlines"; os.makedirs(TMP, exist_ok=True)
TOKEN = open(os.path.expanduser("~/.config/kie/token")).read().strip()
BASE = "https://api.kie.ai/api/v1/jobs"

CYAN, MAGENTA, WHITE = "00FFFF", "FF00FF", "FFFFFF"

# clave -> (n_lineas, [colores con hex], chroma_hex, frase_variacion)
JOBS = {
  # ---- HEROES (4 líneas, 16:9) ----
  "hero-rutas":          (4, ["bright yellow #FFF21C","near-black charcoal #2F2927","magenta pink #FF2B5E","emerald green #00BD70"], CYAN,    "one tall arch on the left and a gentle hump on the right"),
  "hero-capital":        (4, ["deep violet #330559","electric violet #6126FF","magenta pink #FF2B5E","emerald green #00BD70"],       CYAN,    "a big sweeping arch just right of center where a pair crosses"),
  "hero-mercado":        (4, ["bright yellow #FFF21C","mint green #87FFD6","magenta pink #FF2B5E","emerald green #00BD70"],          MAGENTA, "two humps, one left-of-center and one on the right"),
  "hero-digitalizacion": (4, ["deep violet #330559","electric violet #6126FF","bright yellow #FFF21C","emerald green #00BD70"],      CYAN,    "a long gentle S-curve with one prominent hump on the right"),
  "hero-talento":        (4, ["deep violet #330559","electric violet #6126FF","bright yellow #FFF21C","magenta pink #FF2B5E"],       CYAN,    "one large central arch with the bundles running straight at both edges"),
  # ---- SECCIONES "por qué" (3 líneas, 16:9, fondo blanco → recorte limpio) ----
  "sec-capital":         (3, ["electric violet #6126FF","magenta pink #FF2B5E","emerald green #00BD70"], WHITE, "a single elegant hump just right of center"),
  "sec-mercado":         (3, ["electric violet #6126FF","magenta pink #FF2B5E","emerald green #00BD70"], WHITE, "one big arch on the right third"),
  "sec-digitalizacion":  (3, ["electric violet #6126FF","magenta pink #FF2B5E","emerald green #00BD70"], WHITE, "two small humps near the center"),
  "sec-talento":         (3, ["electric violet #6126FF","magenta pink #FF2B5E","emerald green #00BD70"], WHITE, "one wide gentle arch on the left-center"),
}

def cname(hexv):
    return {"00FFFF": "cyan", "FF00FF": "magenta", "FFFFFF": "white"}[hexv]

def prompt_for(key):
    n, colors, chroma, variation = JOBS[key]
    cn = cname(chroma)
    clist = ", ".join(colors)
    dots = "" if chroma == WHITE else "small solid white dots exactly at the crossing points. "
    return (f"Flat vector brand graphic of a stylized transit/subway line system on a PURE SOLID FLAT "
            f"{cn} #{chroma} background that fills the entire canvas as one single uniform color (NOT a "
            f"checkerboard, NOT a pattern, NOT transparent). Absolutely NO faint marks, NO pale strokes, "
            f"NO extra blurred shapes — ONLY the lines on a perfectly clean solid {cn} field. On top of "
            f"that solid {cn}, draw exactly {n} smooth lines in solid flat colors: {clist}. The lines run "
            f"horizontally across a very wide frame like a clean metro map: long straight parallel runs "
            f"where lines travel in close parallel pairs/bundles, with a few LARGE smooth rounded humps and "
            f"arches where pairs gently separate, cross over each other, then rejoin into parallel straight "
            f"runs ({variation}). Uniform thick strokes with rounded caps. {dots}Minimal and elegant with "
            f"lots of empty {cn} space. No photograph, no text, no shadow, no gradient, no 3D, pure clean "
            f"flat vector lines on solid {cn}.")

def curl(method, url, data=None):
    cmd = ["curl","-s","-X",method,url,"-H",f"Authorization: Bearer {TOKEN}","-H","Content-Type: application/json"]
    if data is not None: cmd += ["-d", json.dumps(data)]
    return json.loads(subprocess.run(cmd, capture_output=True, text=True).stdout or "{}")

def create(key):
    body = {"model":"nano-banana-pro","input":{"prompt":prompt_for(key),"aspect_ratio":"16:9","resolution":"2K","output_format":"png"}}
    for a in range(3):
        r = curl("POST", f"{BASE}/createTask", body)
        tid = (r.get("data") or {}).get("taskId")
        if tid: return key, tid
        print(f"  ! {key} retry {a+1}: {r.get('msg')}"); time.sleep(4)
    return key, None

def chroma_key(raw, dst, chroma_hex):
    # blanco necesita umbral más alto (atrapa fantasmas pálidos); cian/magenta más bajo
    lo, hi = (118.0, 152.0) if chroma_hex == WHITE else (72.0, 124.0)
    cr = np.array([int(chroma_hex[i:i+2],16) for i in (0,2,4)], dtype=np.float32)
    a = np.asarray(Image.open(raw).convert("RGB")).astype(np.float32)
    dist = np.sqrt(((a-cr)**2).sum(2))
    alpha = np.clip((dist-lo)/(hi-lo), 0.0, 1.0)
    # erosión 1px (min en vecindad 3x3) → elimina el anillo de halo del chroma
    er = alpha.copy()
    for dy in (-1,0,1):
        for dx in (-1,0,1):
            er = np.minimum(er, np.roll(np.roll(alpha, dy, 0), dx, 1))
    out = Image.fromarray(np.dstack([a, er*255.0]).astype(np.uint8), "RGBA")
    # downscale a ~1760px de ancho (overlay decorativo) y guardar webp con alfa
    tw = 1760
    if out.width > tw:
        out = out.resize((tw, round(out.height*tw/out.width)), Image.LANCZOS)
    out.save(dst, "WEBP", quality=90, method=6)
    return f"{os.path.getsize(dst)//1024}KB {out.size}"

def poll_dl(item):
    key, tid = item
    if not tid: return key, False, "no taskId"
    chroma = JOBS[key][2]
    raw = os.path.join(TMP, f"{key}.png")
    dst = os.path.join(OUT, f"lineas-{key}.webp")
    for _ in range(72):
        time.sleep(5)
        r = curl("GET", f"{BASE}/recordInfo?taskId={tid}")
        st = (r.get("data") or {}).get("state","")
        if st == "success":
            url = json.loads(r["data"]["resultJson"])["resultUrls"][0]
            subprocess.run(["curl","-s",url,"-o",raw])
            return key, True, chroma_key(raw, dst, chroma)
        if st == "fail": return key, False, f"FAIL {(r.get('data') or {}).get('failMsg')}"
    return key, False, "timeout"

def main():
    keys = [k for k in JOBS if k.startswith(sys.argv[1])] if len(sys.argv) > 1 else list(JOBS)
    print(f"== generando {len(keys)} paneles de líneas")
    tasks = []
    for k in keys:
        it = create(k); print(f"  created {k}: {it[1]}", flush=True); tasks.append(it); time.sleep(3)
    with cf.ThreadPoolExecutor(max_workers=len(tasks)) as ex:
        for key, ok, msg in ex.map(poll_dl, tasks):
            print(f"[{'OK ' if ok else 'FAIL'}] {key}: {msg}", flush=True)

if __name__ == "__main__":
    main()
