#!/usr/bin/env python3
"""
Genera TODO el set de imágenes de rutas con Nano Banana Pro y las deja colocadas:
- hero bg (jpg, sin personas, fondo del oficio)
- hero personaje (jpg fondo plano -> rembg -> webp recorte limpio, MANOS LIBRES)
- split/sección (jpg, escena completa persona en su negocio)
Rubros variados + mezcla de géneros/edades (feedback cliente). Sin tech excesivo.

Crea tareas en SECUENCIA (kie da 500 en paralelo); poll+descarga en paralelo.
Uso: python3 gen-all.py [grupo]   grupos: bg | char | split | all (default all)
"""
import concurrent.futures as cf, json, os, subprocess, sys, time
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.abspath(os.path.join(HERE, "..", "site", "assets", "photos", "brand"))
TOKEN = open(os.path.expanduser("~/.config/kie/token")).read().strip()
BASE = "https://api.kie.ai/api/v1/jobs"
TMP = "/tmp/genall"; os.makedirs(TMP, exist_ok=True)

BG = ("documentary interior photograph, bright airy natural window light, clean luminous positive "
      "atmosphere, soft shallow depth of field with gentle bokeh, true-to-life warm colors, NO people, "
      "no text, no logos, realistic photo, Chilean small-business setting, tidy and uncluttered")
CH = ("full-length editorial documentary portrait, three-quarter to full body, standing relaxed and "
      "confident, warm genuine natural smile, BOTH HANDS RELAXED AND EMPTY, nothing held, no props, "
      "facing camera. Plain seamless light grey studio background, soft even natural daylight, "
      "true-to-life soft colors not oversaturated, photorealistic, sharp, professional, full body and "
      "feet visible, centered with headroom, not cropped")
SP = ("candid documentary photograph of the person working in their own small business, natural warm "
      "genuine smile, bright soft natural daylight, clean luminous uncluttered background with gentle "
      "bokeh, true-to-life soft colors not oversaturated, photorealistic, authentic Chilean "
      "small-business, not stocky, no text, no logos")

# key: (tipo, aspect, prompt)   tipo: bg | char | split
JOBS = {
  # --- fondos del hero (oficio, sin personas) ---
  "bg-hub":            ("bg","4:5","interior of a bright cozy neighborhood café/shop with plants and wooden shelves"),
  "bg-capital":        ("bg","4:5","tidy bright carpentry woodworking workshop, wood planks and hand tools neatly arranged on the wall"),
  "bg-mercado":        ("bg","4:5","interior of a bright artisan bakery, loaves of bread on wooden shelves behind a clean counter"),
  "bg-digitalizacion": ("bg","4:5","bright tidy pottery and crafts studio, shelves of handmade ceramics, a laptop resting on the worktable"),
  "bg-talento":        ("bg","4:5","bright collaborative workspace with a light wooden meeting table, chairs and large windows"),
  # --- personajes del hero (manos libres, recorte) ; mercado=panadero ya colocado ---
  "char-hub":            ("char","4:5","a Chilean woman café owner about 34, denim apron over a tee, hair in a loose bun, arms relaxed at her sides"),
  "char-capital":        ("char","4:5","a Chilean male carpenter about 52, short greying hair and stubble, work apron over a rolled-sleeve shirt, arms relaxed"),
  "char-digitalizacion": ("char","4:5","a Chilean woman ceramicist artisan about 36, work apron, hair tied back, arms relaxed at her sides"),
  "char-talento":        ("char","4:5","a Chilean woman business leader about 52, blazer over a blouse, short hair, warm confident, arms relaxed"),
  # --- escenas de la sección 'por qué la ruta' (persona distinta, rubro variado) ---
  "split-capital":        ("split","4:3","a Chilean woman shop owner about 40 smiling while reviewing her finances on paper at a tidy wooden counter"),
  "split-mercado":        ("split","4:3","a Chilean woman market vendor about 38 smiling while packing a customer order at her stall"),
  "split-digitalizacion": ("split","4:3","a Chilean man small-business owner about 45 using a laptop to manage orders at his workshop table"),
  "split-talento":        ("split","4:3","a Chilean woman mentor about 50 guiding a young employee, both smiling, in a bright workspace"),
}
GROUPS = {
  "bg":    [k for k in JOBS if k.startswith("bg-")],
  "char":  [k for k in JOBS if k.startswith("char-")],
  "split": [k for k in JOBS if k.startswith("split-")],
  "all":   list(JOBS),
}

def curl(method, url, data=None):
    cmd = ["curl","-s","-X",method,url,"-H",f"Authorization: Bearer {TOKEN}","-H","Content-Type: application/json"]
    if data is not None: cmd += ["-d", json.dumps(data)]
    return json.loads(subprocess.run(cmd, capture_output=True, text=True).stdout or "{}")

def create(key):
    typ, ar, desc = JOBS[key]
    style = {"bg":BG,"char":CH,"split":SP}[typ]
    fmt = "png" if typ=="char" else "jpg"
    body = {"model":"nano-banana-pro","input":{"prompt":f"{desc}. {style}.","aspect_ratio":ar,"resolution":"2K","output_format":fmt}}
    for a in range(3):
        r = curl("POST", f"{BASE}/createTask", body)
        tid = (r.get("data") or {}).get("taskId")
        if tid: return key, fmt, tid
        print(f"  ! {key} retry {a+1}: {r.get('msg')}"); time.sleep(4)
    return key, fmt, None

def poll_dl(item):
    key, fmt, tid = item
    if not tid: return key, False, "no taskId"
    raw = os.path.join(TMP, f"{key}.{fmt}")
    for _ in range(72):
        time.sleep(5)
        r = curl("GET", f"{BASE}/recordInfo?taskId={tid}")
        st = (r.get("data") or {}).get("state","")
        if st == "success":
            url = json.loads(r["data"]["resultJson"])["resultUrls"][0]
            subprocess.run(["curl","-s",url,"-o",raw])
            return key, True, place(key, raw)
        if st == "fail": return key, False, f"FAIL {(r.get('data') or {}).get('failMsg')}"
    return key, False, "timeout"

_SESS = None
def place(key, raw):
    typ = JOBS[key][0]
    if typ == "bg":
        out = os.path.join(OUT, f"hero-{key}.jpg")   # hero-bg-xxx.jpg
        Image.open(raw).convert("RGB").save(out, "JPEG", quality=84, optimize=True)
        return f"-> {os.path.basename(out)}"
    if typ == "split":
        name = key.replace("split-", "split-")        # split-xxx.jpg
        out = os.path.join(OUT, f"{name}.jpg")
        Image.open(raw).convert("RGB").save(out, "JPEG", quality=84, optimize=True)
        return f"-> {os.path.basename(out)}"
    # char: rembg -> recorte limpio -> webp
    global _SESS
    from rembg import remove, new_session
    if _SESS is None: _SESS = new_session("isnet-general-use")
    im = Image.open(raw).convert("RGBA")
    cut = remove(im, session=_SESS, alpha_matting=True, alpha_matting_foreground_threshold=270,
                 alpha_matting_background_threshold=10, alpha_matting_erode_size=11)
    cut = cut.crop(cut.getchannel("A").getbbox())
    tw = 820; cut = cut.resize((tw, round(cut.height*tw/cut.width)), Image.LANCZOS)
    k = key.replace("char-", "")
    out = os.path.join(OUT, f"hero-char-{k}.webp")
    cut.save(out, "WEBP", quality=86, method=6)
    return f"-> hero-char-{k}.webp {cut.size}"

def main():
    grp = sys.argv[1] if len(sys.argv) > 1 else "all"
    keys = GROUPS[grp]
    print(f"== grupo '{grp}': {len(keys)} imgs")
    tasks = []
    for k in keys:
        it = create(k); print(f"  created {k}: {it[2]}"); tasks.append(it); time.sleep(3)
    with cf.ThreadPoolExecutor(max_workers=len(tasks)) as ex:
        for key, ok, msg in ex.map(poll_dl, tasks):
            print(f"[{'OK ' if ok else 'FAIL'}] {key}: {msg}")

if __name__ == "__main__":
    main()
