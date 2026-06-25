#!/usr/bin/env python3
"""Optimiza los heros: fondos -> JPEG redimensionado; personajes -> WebP con alfa.
Borra los PNG pesados tras crear el WebP."""
import os
from PIL import Image

BRAND = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "site", "assets", "photos", "brand"))
KEYS = ["hub", "capital", "mercado", "digitalizacion", "talento"]


def kb(p):
    return os.path.getsize(p) // 1024


for k in KEYS:
    # fondo -> jpeg 1300px ancho, q78 progresivo
    bg = os.path.join(BRAND, f"hero-bg-{k}.jpg")
    im = Image.open(bg).convert("RGB")
    before = kb(bg)
    im.thumbnail((1300, 1700), Image.LANCZOS)
    im.save(bg, "JPEG", quality=78, optimize=True, progressive=True)
    print(f"bg-{k}: {before}KB -> {kb(bg)}KB {im.size}")

    # personaje -> webp con alfa, 1200px alto, q82
    png = os.path.join(BRAND, f"hero-char-{k}.png")
    webp = os.path.join(BRAND, f"hero-char-{k}.webp")
    im = Image.open(png).convert("RGBA")
    pb = kb(png)
    w, h = im.size
    scale = 1200 / h
    im = im.resize((round(w * scale), 1200), Image.LANCZOS)
    im.save(webp, "WEBP", quality=82, method=6)
    os.remove(png)
    print(f"char-{k}: {pb}KB(png) -> {kb(webp)}KB(webp) {im.size}")
