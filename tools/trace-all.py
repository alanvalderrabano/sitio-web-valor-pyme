#!/usr/bin/env python3
"""
Genera patrones de líneas en el estilo SUAVE/ORGÁNICO del trazo aprobado de
Talento (referencia del cliente) para el resto de heroes de ruta y para las
secciones "por qué la ruta", con Nano Banana Pro (image-to-image anclado en la
referencia) y los deja como overlay transparente en site/assets/lines/.

Estilo: mismo trazo fluido suave (curvas amplias, cruces limpios, cap redondo,
nodos blancos) que lineas-hero-talento, pero con la PALETA de cada ruta y un
RECORRIDO variado por panel. Chroma elegido para no chocar con la paleta
(magenta cuando hay línea menta; cyan en el resto).

Uso: python3 trace-all.py [clave_o_prefijo]   (default: todos)
"""
import base64, concurrent.futures as cf, json, os, subprocess, sys, time
import numpy as np
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.abspath(os.path.join(HERE, "..", "site", "assets", "lines"))
TOKEN = open(os.path.expanduser("~/.config/kie/token")).read().strip()
BASE = "https://api.kie.ai/api/v1/jobs"
TMP = "/private/tmp/claude-501/-Users-alan-Documents-Valor-Pyme/beef633b-45e8-446a-b569-ae1d2d245d6e/scratchpad"
REF = os.path.join(TMP, "ref-1.png")  # referencia original del cliente (4 líneas suaves)

CYAN, MAGENTA = "00FFFF", "FF00FF"

# clave -> (n_lineas, [colores], chroma, variacion, tipo)  tipo: hero | sec
JOBS = {
  # ---- HEROES restantes (4 líneas) ----
  "hero-capital": (4, ["deep violet #330559","electric violet #6126FF","magenta pink #FF2B5E","emerald green #00BD70"],
                   CYAN, "one tall smooth arch just left-of-center and long calm parallel runs on the right", "hero"),
  "hero-mercado": (4, ["bright yellow #FFF21C","mint aqua-green #87FFD6","crimson red #FF2B5E","emerald green #00BD70"],
                   MAGENTA, "two smooth rolling humps, a small one near the center and a bigger sweeping one on the right third", "hero"),
  "hero-digitalizacion": (4, ["deep violet #330559","electric violet #6126FF","bright yellow #FFF21C","emerald green #00BD70"],
                   CYAN, "a long gentle S-curve with one prominent deep valley dipping low in the center-right", "hero"),
  # ---- SECCIONES "por qué" (3 líneas, más calmadas) ----
  "sec-capital":  (3, ["electric violet #6126FF","magenta pink #FF2B5E","emerald green #00BD70"],
                   CYAN, "a single elegant wide hump just right of center, otherwise calm parallel runs", "sec"),
  "sec-mercado":  (3, ["electric violet #6126FF","magenta pink #FF2B5E","emerald green #00BD70"],
                   CYAN, "one big smooth arch over the right third, calm and minimal", "sec"),
  "sec-digitalizacion": (3, ["electric violet #6126FF","magenta pink #FF2B5E","emerald green #00BD70"],
                   CYAN, "the 3 lines running as ONE single horizontal bundle with two small gentle humps near the center, all lines stacked in a single row (never two separate rows)", "sec"),
  "sec-talento":  (3, ["electric violet #6126FF","magenta pink #FF2B5E","emerald green #00BD70"],
                   CYAN, "one wide gentle arch on the left-center", "sec"),
}

def cname(h): return {"00FFFF":"cyan","FF00FF":"magenta"}[h]

def prompt_for(key):
    n, colors, chroma, variation, typ = JOBS[key]
    cn = cname(chroma); clist = ", ".join(colors)
    node = ("Include ONE larger solid white interchange circle plus a few small solid white station dots "
            "at crossing points. " if typ == "hero" else
            "Include a few small solid white station dots at crossing points. ")
    return (
        f"Use the SAME smooth flowing flat-vector style as this reference image: long horizontal metro/subway "
        f"lines with wide, calm, smoothly curving meanders, gentle rounded humps and valleys, clean crossings, "
        f"uniform thick strokes with rounded caps. But REDRAW it as a NEW single diagram with a DIFFERENT "
        f"layout: {variation}. Draw EXACTLY {n} lines in these solid flat colors only: {clist}. {node}"
        f"Replace the background with a PURE SOLID FLAT {cn} #{chroma} that fills the entire canvas as one "
        f"perfectly uniform color. REMOVE ALL TEXT. Do NOT duplicate, tile, mirror or repeat the diagram — "
        f"draw it only once and keep large empty background areas empty. No photograph, no text, no shadow, "
        f"no gradient, no 3D — only the {n} colored lines and white dots on a clean solid {cn} field."
    )

def curl(method, url, data=None):
    cmd = ["curl","-s","-X",method,url,"-H",f"Authorization: Bearer {TOKEN}","-H","Content-Type: application/json"]
    if data is not None: cmd += ["-d", json.dumps(data)]
    return json.loads(subprocess.run(cmd, capture_output=True, text=True).stdout or "{}")

def upload(path):
    b64 = "data:image/png;base64," + base64.b64encode(open(path,"rb").read()).decode()
    body = {"base64Data": b64, "uploadPath":"images/valorpyme", "fileName":"ref-style-anchor.png"}
    r = curl("POST","https://kieai.redpandaai.co/api/file-base64-upload", body)
    url = (r.get("data") or {}).get("downloadUrl")
    if not url: print("UPLOAD FAIL:", r); sys.exit(1)
    print("anchor uploaded:", url); return url

def chroma_key(raw, dst, chroma):
    lo, hi = 72.0, 124.0
    cr = np.array([int(chroma[i:i+2],16) for i in (0,2,4)], dtype=np.float32)
    a = np.asarray(Image.open(raw).convert("RGB")).astype(np.float32)
    dist = np.sqrt(((a-cr)**2).sum(2))
    alpha = np.clip((dist-lo)/(hi-lo), 0.0, 1.0)
    er = alpha.copy()
    for dy in (-1,0,1):
        for dx in (-1,0,1):
            er = np.minimum(er, np.roll(np.roll(alpha,dy,0),dx,1))
    out = Image.fromarray(np.dstack([a, er*255.0]).astype(np.uint8), "RGBA")
    tw = 1760
    if out.width > tw: out = out.resize((tw, round(out.height*tw/out.width)), Image.LANCZOS)
    out.save(dst, "WEBP", quality=90, method=6)
    return f"{os.path.getsize(dst)//1024}KB {out.size}"

ANCHOR = None
def create(key):
    body = {"model":"nano-banana-pro","input":{
        "prompt": prompt_for(key), "image_input":[ANCHOR],
        "aspect_ratio":"16:9","resolution":"2K","output_format":"png"}}
    for a in range(3):
        r = curl("POST", f"{BASE}/createTask", body)
        tid = (r.get("data") or {}).get("taskId")
        if tid: return key, tid
        print(f"  ! {key} retry {a+1}: {r.get('msg')}"); time.sleep(4)
    return key, None

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
    global ANCHOR
    sel = sys.argv[1] if len(sys.argv) > 1 else ""
    keys = [k for k in JOBS if k.startswith(sel)] if sel else list(JOBS)
    print(f"== {len(keys)} paneles: {keys}")
    ANCHOR = upload(REF)
    tasks = []
    for k in keys:
        it = create(k); print(f"  created {k}: {it[1]}", flush=True); tasks.append(it); time.sleep(3)
    with cf.ThreadPoolExecutor(max_workers=len(tasks)) as ex:
        for key, ok, msg in ex.map(poll_dl, tasks):
            print(f"[{'OK ' if ok else 'FAIL'}] {key}: {msg}", flush=True)

if __name__ == "__main__":
    main()
