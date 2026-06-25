#!/usr/bin/env python3
"""Recorta los personajes a BUSTO (cintura para arriba) desde el respaldo de
cuerpo completo en /tmp/charfull. Recorta al bounding box del alfa (tight) y
conserva la fraccion superior (head -> ~cintura). Reejecutable cambiando FRAC.

Uso: python3 crop-bust.py [FRAC]   (FRAC por defecto 0.62)
"""
import os
import sys
from PIL import Image

SRC = "/tmp/charfull"
DST = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "site", "assets", "photos", "brand"))
FRAC = float(sys.argv[1]) if len(sys.argv) > 1 else 0.62
KEYS = ["hub", "capital", "mercado", "digitalizacion", "talento"]

for k in KEYS:
    im = Image.open(os.path.join(SRC, f"hero-char-{k}.webp")).convert("RGBA")
    bbox = im.getchannel("A").getbbox()        # caja del sujeto (sin transparencia)
    im = im.crop(bbox)
    w, h = im.size
    bust = im.crop((0, 0, w, round(h * FRAC)))  # conserva de la cabeza a ~cintura
    out = os.path.join(DST, f"hero-char-{k}.webp")
    bust.save(out, "WEBP", quality=85, method=6)
    print(f"{k}: full{(w,h)} -> bust{bust.size}  {os.path.getsize(out)//1024}KB")
