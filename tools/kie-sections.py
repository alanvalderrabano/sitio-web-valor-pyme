#!/usr/bin/env python3
"""Regenera imágenes de SECCIONES (no-hero) con Kie/Nano Banana Pro, estilo
brandbook (luminoso, documental, limpio). Reemplaza las fotos oscuras/cargadas.
Conserva los nombres de archivo (no hay que tocar el HTML).

Crea tareas en SECUENCIA (kie da 500 si van en paralelo); poll/descarga en paralelo.
"""
import concurrent.futures as cf
import json
import os
import subprocess
import time

OUT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "site", "assets", "photos", "brand"))
TOKEN = open(os.path.expanduser("~/.config/kie/token")).read().strip()
BASE = "https://api.kie.ai/api/v1/jobs"

STYLE = ("documentary candid photograph, bright airy natural daylight, clean luminous positive atmosphere, "
         "soft shallow depth of field, true-to-life warm colors, photorealistic, Chilean small business, "
         "tidy and uncluttered, no text, no logos")

# nombre_archivo -> (aspect, descripción)
JOBS = {
    # split — sección "por qué la ruta" (4:3)
    "split-capital":        ("4:3", "a Chilean woman small-business owner reviewing her finances on a laptop at a bright tidy counter, neat paperwork, calm and confident"),
    "split-mercado":        ("4:3", "a Chilean shop owner arranging tidy products on clean light shelves in a bright welcoming retail store"),
    "split-digitalizacion": ("4:3", "a young Chilean entrepreneur using a laptop and tablet at a bright modern minimal desk with a plant"),
    "split-talento":        ("4:3", "a small Chilean team collaborating around a light table in a bright open workspace, positive and engaged"),
    # blog — sección "contenidos / refuerza tu camino" (3:2)
    "blog-a":               ("3:2", "a bright modern small business storefront with a smiling Chilean owner standing in the doorway, welcoming"),
    "blog-b":               ("3:2", "a Chilean entrepreneur focused on a laptop at a bright cafe table with a coffee, candid"),
    "blog-c":               ("3:2", "two Chilean colleagues collaborating and smiling in a bright tidy workshop"),
    "blog-d":               ("3:2", "close-up of hands carefully packaging a product on a clean table in a bright shop"),
}


def curl(method, url, data=None):
    cmd = ["curl", "-s", "-X", method, url, "-H", f"Authorization: Bearer {TOKEN}", "-H", "Content-Type: application/json"]
    if data is not None:
        cmd += ["-d", json.dumps(data)]
    return json.loads(subprocess.run(cmd, capture_output=True, text=True).stdout or "{}")


def create(name):
    ar, desc = JOBS[name]
    body = {"model": "nano-banana-pro", "input": {"prompt": f"{desc}. {STYLE}.",
            "aspect_ratio": ar, "resolution": "2K", "output_format": "jpg"}}
    for _ in range(3):
        r = curl("POST", f"{BASE}/createTask", body)
        tid = (r.get("data") or {}).get("taskId")
        if tid:
            return name, tid
        time.sleep(4)
    return name, None


def poll(item):
    name, tid = item
    if not tid:
        return name, False, "no taskId"
    out = os.path.join(OUT, f"{name}.jpg")
    for _ in range(60):
        time.sleep(5)
        r = curl("GET", f"{BASE}/recordInfo?taskId={tid}")
        st = (r.get("data") or {}).get("state", "")
        if st == "success":
            url = json.loads(r["data"]["resultJson"])["resultUrls"][0]
            subprocess.run(["curl", "-s", url, "-o", out])
            return name, True, f"{os.path.getsize(out)//1024}KB"
        if st == "fail":
            return name, False, f"FAIL {r.get('data')}"
    return name, False, "timeout"


tasks = []
for n in JOBS:
    item = create(n)
    print(f"created {item[0]}: {item[1]}", flush=True)
    tasks.append(item)
    time.sleep(3)

with cf.ThreadPoolExecutor(max_workers=len(tasks)) as ex:
    for name, ok, msg in ex.map(poll, tasks):
        print(f"[{'OK ' if ok else 'FAIL'}] {name}: {msg}", flush=True)
