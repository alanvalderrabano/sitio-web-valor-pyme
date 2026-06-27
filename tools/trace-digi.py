#!/usr/bin/env python3
"""Traza EXACTAMENTE el patrón de la referencia del cliente (Pionero/brandbook)
para el hero de Ruta Digitalización con Nano Banana Pro image-to-image, quitando
foto+texto y extendiendo las líneas a todo el ancho. -> lineas-hero-digitalizacion.webp"""
import base64, json, os, subprocess, sys, time
import numpy as np
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.abspath(os.path.join(HERE, "..", "site", "assets", "lines"))
TOKEN = open(os.path.expanduser("~/.config/kie/token")).read().strip()
BASE = "https://api.kie.ai/api/v1/jobs"
TMP = "/private/tmp/claude-501/-Users-alan-Documents-Valor-Pyme/beef633b-45e8-446a-b569-ae1d2d245d6e/scratchpad"
SRC = os.path.join(TMP, "ref-digi.png")
RAW = os.path.join(TMP, "digi-traced.png")
DST = os.path.join(OUT, "lineas-hero-digitalizacion.webp")
CHROMA = "00FFFF"

PROMPT = (
    "Recreate EXACTLY this transit/subway line pattern as a clean flat-vector graphic, ONE single time. "
    "The pattern: a bright yellow line and an emerald green line run close together from the left as "
    "near-horizontal lines, then on the RIGHT they rise together into ONE large tall smooth rounded hump/arch "
    "(yellow on the outer/upper edge, emerald green just inside it) and come back down. A deep violet line "
    "runs lower along the bottom with a gentle shallow valley dip and then a small soft hump on the left side. "
    "Use EXACTLY 3 lines in these solid flat colors only: bright yellow #FFF21C, emerald green #00BD70, deep "
    "violet #330559. Uniform thick strokes with rounded caps, a few small solid white station dots at the "
    "crossings. IMPORTANT: REMOVE the photograph and REMOVE ALL TEXT completely; extend the 3 lines as clean "
    "continuous horizontal runs all the way across the full width from the left edge to the right edge. Replace "
    "the background with a PURE SOLID FLAT cyan #00FFFF filling the entire canvas as one uniform color. Do NOT "
    "duplicate, tile, mirror or repeat the diagram. No photograph, no text, no shadow, no gradient, no 3D — only "
    "the 3 colored lines and white dots on a clean solid cyan field."
)

def curl(m, u, d=None):
    c = ["curl","-s","-X",m,u,"-H",f"Authorization: Bearer {TOKEN}","-H","Content-Type: application/json"]
    if d is not None: c += ["-d", json.dumps(d)]
    return json.loads(subprocess.run(c, capture_output=True, text=True).stdout or "{}")

def upload(p):
    b64 = "data:image/png;base64," + base64.b64encode(open(p,"rb").read()).decode()
    r = curl("POST","https://kieai.redpandaai.co/api/file-base64-upload",
             {"base64Data":b64,"uploadPath":"images/valorpyme","fileName":"ref-digi.png"})
    u = (r.get("data") or {}).get("downloadUrl")
    if not u: print("UPLOAD FAIL", r); sys.exit(1)
    print("uploaded:", u); return u

def chroma_key(raw, dst):
    lo, hi = 72.0, 124.0
    cr = np.array([int(CHROMA[i:i+2],16) for i in (0,2,4)], dtype=np.float32)
    a = np.asarray(Image.open(raw).convert("RGB")).astype(np.float32)
    dist = np.sqrt(((a-cr)**2).sum(2))
    alpha = np.clip((dist-lo)/(hi-lo),0,1); er = alpha.copy()
    for dy in (-1,0,1):
        for dx in (-1,0,1): er = np.minimum(er, np.roll(np.roll(alpha,dy,0),dx,1))
    out = Image.fromarray(np.dstack([a, er*255]).astype(np.uint8),"RGBA")
    if out.width > 1760: out = out.resize((1760, round(out.height*1760/out.width)), Image.LANCZOS)
    out.save(dst,"WEBP",quality=90,method=6)
    return f"{os.path.getsize(dst)//1024}KB {out.size}"

def main():
    url = upload(SRC)
    body = {"model":"nano-banana-pro","input":{"prompt":PROMPT,"image_input":[url],
            "aspect_ratio":"16:9","resolution":"2K","output_format":"png"}}
    tid = None
    for a in range(3):
        r = curl("POST", f"{BASE}/createTask", body); tid = (r.get("data") or {}).get("taskId")
        if tid: break
        print("retry", r.get("msg")); time.sleep(4)
    print("task:", tid)
    for _ in range(72):
        time.sleep(5)
        r = curl("GET", f"{BASE}/recordInfo?taskId={tid}")
        st = (r.get("data") or {}).get("state","")
        print("poll:", st)
        if st == "success":
            ru = json.loads(r["data"]["resultJson"])["resultUrls"][0]
            subprocess.run(["curl","-s",ru,"-o",RAW]); print("raw:", os.path.getsize(RAW))
            print("keyed:", chroma_key(RAW, DST)); return
        if st == "fail": print("FAIL", (r.get("data") or {}).get("failMsg")); sys.exit(1)
    print("timeout"); sys.exit(1)

if __name__ == "__main__":
    main()
