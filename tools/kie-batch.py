#!/usr/bin/env python3
"""
Orquesta la generacion de heros de Valor Pyme con Kie/Nano Banana Pro.
Cada hero = 1 fondo (jpg, sin personas) + 1 personaje (png, recorte transparente).
Estilo: brandbook seccion 6 (luminoso, documental, espontaneo, pyme chilena).

IMPORTANTE: kie devuelve 500 si se crean tareas en paralelo -> se crean en
SECUENCIA (con stagger). El polling/descarga si va en paralelo.
Aspect ratio validado: 4:5 (otros como 4:3 dan 500).

Uso:
  python3 kie-batch.py char-hub      # 1 img (validar transparencia)
  python3 kie-batch.py rest          # las que faltan (todas menos hub)
  python3 kie-batch.py all
"""
import concurrent.futures as cf
import json
import os
import subprocess
import sys
import time

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.abspath(os.path.join(HERE, "..", "site", "assets", "photos", "brand"))
TOKEN = open(os.path.expanduser("~/.config/kie/token")).read().strip()
BASE = "https://api.kie.ai/api/v1/jobs"
AR = "4:5"

BG_STYLE = ("documentary interior photograph, bright airy natural window light, "
            "clean luminous positive atmosphere, soft shallow depth of field with gentle bokeh, "
            "true-to-life warm colors, NO people, no text, no logos, realistic photo, "
            "Chilean small-business setting, tidy and uncluttered")
CH_STYLE = ("candid documentary full-body photograph, 3/4 standing pose, natural warm genuine smile, "
            "bright soft even daylight, true-to-life colors, photorealistic, "
            "Chilean small-business owner, approachable and confident, casual-professional, "
            "the subject ISOLATED ON A FULLY TRANSPARENT BACKGROUND (alpha), clean precise cutout edges, "
            "entire body and feet visible, no scenery, no floor, no text")

JOBS = {
    "bg-hub":            ("bg", "interior of a bright neighborhood small retail shop, tidy wooden shelves with products, green plants, large window daylight"),
    "char-hub":          ("ch", "a Chilean woman entrepreneur about 40 wearing a denim apron over a light tee, arms crossed, looking at camera"),
    "bg-capital":        ("bg", "a bright tidy small-business front counter corner with a laptop and notebook, calm modern finance vibe, plant, daylight"),
    "char-capital":      ("ch", "a Chilean woman business owner about 38, smart-casual blouse, holding a tablet, friendly confident"),
    "bg-mercado":        ("bg", "interior of a clean colorful boutique retail shop with neatly organized products on shelves, bright daylight"),
    "char-mercado":      ("ch", "a Chilean shopkeeper man about 35 wearing an apron, holding a product box, warm welcoming"),
    "bg-digitalizacion": ("bg", "a modern minimal home-office coworking desk with an open laptop and devices, plants, bright daylight"),
    "char-digitalizacion": ("ch", "a young Chilean woman entrepreneur about 30 holding a laptop, modern casual, optimistic"),
    "bg-talento":        ("bg", "a bright collaborative team workspace with a light wooden meeting table and chairs, plants, large windows"),
    "char-talento":      ("ch", "a Chilean team leader woman about 42, blazer over casual top, warm approachable leadership presence"),
}
GROUPS = {
    "char-hub": ["char-hub"],
    "rest": [k for k in JOBS if not k.endswith("hub")],
    "all": list(JOBS),
}


def curl(method, url, data=None):
    cmd = ["curl", "-s", "-X", method, url,
           "-H", f"Authorization: Bearer {TOKEN}", "-H", "Content-Type: application/json"]
    if data is not None:
        cmd += ["-d", json.dumps(data)]
    return json.loads(subprocess.run(cmd, capture_output=True, text=True).stdout or "{}")


def create(key):
    typ, desc = JOBS[key]
    fmt = "jpg" if typ == "bg" else "png"
    style = BG_STYLE if typ == "bg" else CH_STYLE
    body = {"model": "nano-banana-pro",
            "input": {"prompt": f"{desc}. {style}.", "aspect_ratio": AR,
                      "resolution": "2K", "output_format": fmt}}
    for attempt in range(3):
        r = curl("POST", f"{BASE}/createTask", body)
        tid = (r.get("data") or {}).get("taskId")
        if tid:
            return key, fmt, tid
        print(f"  ! {key} create retry {attempt+1}: {r.get('msg')}")
        time.sleep(4)
    return key, fmt, None


def poll_download(item):
    key, fmt, tid = item
    if not tid:
        return key, False, "no taskId"
    out = os.path.join(OUT, f"hero-{key}.{fmt}")
    for _ in range(60):
        time.sleep(5)
        r = curl("GET", f"{BASE}/recordInfo?taskId={tid}")
        st = (r.get("data") or {}).get("state", "")
        if st == "success":
            url = json.loads(r["data"]["resultJson"])["resultUrls"][0]
            subprocess.run(["curl", "-s", url, "-o", out])
            return key, True, f"{os.path.getsize(out)} bytes -> {os.path.basename(out)}"
        if st == "fail":
            return key, False, f"FAIL {r.get('data')}"
    return key, False, "timeout"


def main():
    grp = sys.argv[1] if len(sys.argv) > 1 else "char-hub"
    keys = GROUPS[grp]
    print(f"== grupo '{grp}': {keys}")
    # 1) crear tareas en SECUENCIA (evita el 500 por concurrencia)
    tasks = []
    for k in keys:
        item = create(k)
        print(f"  created {k}: {item[2]}")
        tasks.append(item)
        time.sleep(3)
    # 2) poll + descarga en paralelo
    with cf.ThreadPoolExecutor(max_workers=len(tasks)) as ex:
        for key, ok, msg in ex.map(poll_download, tasks):
            print(f"[{'OK ' if ok else 'FAIL'}] {key}: {msg}")


if __name__ == "__main__":
    main()
