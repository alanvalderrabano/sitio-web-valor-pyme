#!/usr/bin/env python3
"""
Traza EXACTAMENTE el patrón de líneas de la referencia del cliente para el hero
de Ruta Talento, con Nano Banana Pro (image-to-image), y lo deja como overlay
transparente en site/assets/lines/lineas-hero-talento.webp.

Flujo: referencia (rellenada a 16:9 sobre cyan) -> upload kie -> nano-banana-pro
image-to-image (misma composición, fondo cyan plano, sin texto) -> chroma key
cyan->alfa -> webp.
"""
import base64, json, os, subprocess, sys, time
import numpy as np
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.abspath(os.path.join(HERE, "..", "site", "assets", "lines"))
TOKEN = open(os.path.expanduser("~/.config/kie/token")).read().strip()
BASE = "https://api.kie.ai/api/v1/jobs"
TMP = "/private/tmp/claude-501/-Users-alan-Documents-Valor-Pyme/beef633b-45e8-446a-b569-ae1d2d245d6e/scratchpad"

SRC = os.path.join(TMP, "ref-1.png")          # referencia ORIGINAL del cliente (sin relleno)
RAW = os.path.join(TMP, "talento-traced.png")
DST = os.path.join(OUT, "lineas-hero-talento.webp")

CHROMA = "FF00FF"  # magenta: la menta aqua-verde se confunde con cyan, magenta no choca con la paleta

PROMPT = (
    "Recreate this exact transit/subway line diagram ONE SINGLE TIME. Keep the composition IDENTICAL "
    "to the reference: same number of lines, same line colors (bright yellow, electric blue/violet, "
    "crimson red, and a bright mint aqua-green line that must stay clearly visible), the SAME curve "
    "shapes, the SAME humps and arches, the SAME crossings and routing, the SAME big white interchange "
    "circle on the left and the SAME small white station dots in the same positions. Render them as "
    "clean flat vector strokes of uniform thickness with rounded caps. The ONLY changes: replace the "
    "dark background with a PURE SOLID FLAT magenta #FF00FF that fills the entire canvas as one "
    "perfectly uniform color, and REMOVE ALL TEXT LABELS completely. Do NOT duplicate, tile, mirror or "
    "repeat the diagram — draw it only once and keep the large empty background areas empty. No "
    "photograph, no text, no shadow, no gradient, no 3D — only the colored lines and white dots on a "
    "clean solid magenta field. Match the original line layout precisely."
)

def curl(method, url, data=None, extra=None):
    cmd = ["curl", "-s", "-X", method, url, "-H", f"Authorization: Bearer {TOKEN}",
           "-H", "Content-Type: application/json"]
    if data is not None:
        cmd += ["-d", json.dumps(data)]
    return json.loads(subprocess.run(cmd, capture_output=True, text=True).stdout or "{}")

def upload(path):
    b64 = "data:image/png;base64," + base64.b64encode(open(path, "rb").read()).decode()
    body = {"base64Data": b64, "uploadPath": "images/valorpyme", "fileName": "ref-talento-src.png"}
    r = curl("POST", "https://kieai.redpandaai.co/api/file-base64-upload", body)
    url = (r.get("data") or {}).get("downloadUrl")
    if not url:
        print("UPLOAD FAIL:", r); sys.exit(1)
    print("uploaded:", url)
    return url

def chroma_key(raw, dst):
    chroma = CHROMA; lo, hi = 72.0, 124.0
    cr = np.array([int(chroma[i:i+2], 16) for i in (0, 2, 4)], dtype=np.float32)
    a = np.asarray(Image.open(raw).convert("RGB")).astype(np.float32)
    dist = np.sqrt(((a - cr) ** 2).sum(2))
    alpha = np.clip((dist - lo) / (hi - lo), 0.0, 1.0)
    er = alpha.copy()
    for dy in (-1, 0, 1):
        for dx in (-1, 0, 1):
            er = np.minimum(er, np.roll(np.roll(alpha, dy, 0), dx, 1))
    out = Image.fromarray(np.dstack([a, er * 255.0]).astype(np.uint8), "RGBA")
    tw = 1760
    if out.width > tw:
        out = out.resize((tw, round(out.height * tw / out.width)), Image.LANCZOS)
    out.save(dst, "WEBP", quality=90, method=6)
    return f"{os.path.getsize(dst)//1024}KB {out.size}"

def main():
    url = upload(SRC)
    body = {"model": "nano-banana-pro", "input": {
        "prompt": PROMPT, "image_input": [url],
        "aspect_ratio": "16:9", "resolution": "2K", "output_format": "png"}}
    tid = None
    for a in range(3):
        r = curl("POST", f"{BASE}/createTask", body)
        tid = (r.get("data") or {}).get("taskId")
        if tid:
            break
        print("create retry:", r.get("msg")); time.sleep(4)
    print("task:", tid)
    if not tid:
        sys.exit(1)
    for _ in range(72):
        time.sleep(5)
        r = curl("GET", f"{BASE}/recordInfo?taskId={tid}")
        st = (r.get("data") or {}).get("state", "")
        print("poll:", st)
        if st == "success":
            rurl = json.loads(r["data"]["resultJson"])["resultUrls"][0]
            subprocess.run(["curl", "-s", rurl, "-o", RAW])
            print("raw saved:", RAW, os.path.getsize(RAW), "bytes")
            print("keyed:", chroma_key(RAW, DST))
            return
        if st == "fail":
            print("FAIL:", (r.get("data") or {}).get("failMsg")); sys.exit(1)
    print("timeout"); sys.exit(1)

if __name__ == "__main__":
    main()
