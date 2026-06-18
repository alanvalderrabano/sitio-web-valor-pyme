# Review HOME — Valor Pyme · Ronda 1

**Página:** `site/index.html` (nuevo HOME, sirve en `/`)
**Revisor:** pw-revisor · 2026-06-17
**Preview:** server `vp-rutas` (puerto 4399 — 4321 estaba ocupado por otro server), `http://localhost:4399/index.html`

## VEREDICTO: **PASS** (con 1 verificación de contenido menor, no bloqueante)

El home está listo en estructura, responsive, coherencia de marca y SEO/AEO. Reproduce
fielmente el design system de `rutas.html` y cumple el blueprint en las 8 secciones y su orden.
La única observación es un posible desajuste de identidad de un logo de aliado (OMIA/OrganizaMe),
que es una verificación de contenido — no rompe nada visual ni funcional.

---

## Lo verificado (todo OK)

### Estructura / SEO
- **1 solo `<h1>`**: "Emprender es siempre un viaje." ✔
- **7 `<h2>`** = los titulares del blueprint, en orden: acompañamiento → 4 rutas → diagnóstico
  → aliados → 3 pasos → comunidad → FAQ. ✔
- `lang="es-CL"`, title (60c) y meta description correctos. ✔
- JSON-LD **Organization** + **FAQPage** (5 Q&A) presentes y bien formados. ✔
- FAQ `<details>` **funcional**: abre (answer 99px) y cierra al click. ✔

### CTAs (labels + destinos)
- Hero: "Súmate gratis" → `#suscripcion` ✔ · "Descubre tu ruta" → `#diagnostico` ✔
- Sección 3: "Ver todas las rutas" → `/rutas` ✔
- 4 cards → `/ruta-capital`, `/ruta-mercado`, `/ruta-digitalizacion`, `/ruta-talento` ✔
- Diagnóstico → `#diagnostico` · 3 pasos → `#suscripcion` · Comunidad → `#suscripcion` ✔
- "Súmate a la conversación" → `#` (provisional intencional, redes pendientes — OK por blueprint) ✔

### Coherencia de marca con rutas.html
- 4 route-cards en colores **idénticos** a rutas.html: Capital `#FFF200`, Mercado `#330559`,
  Digitalización `#FF005B`, Talento `#00C168`. ✔
- Navbar blanco + logo morado, hero morado corp `#6126FF`, tipografía display, sistema de
  líneas de metro y journey strip reutilizados. Se ve hermano de rutas.html, no ajeno. ✔
- Footer dark con logo blanco; incluye "Ver todas las rutas" → /rutas. ✔

### Recursos
- 13 logos de aliados presentes, **0 imágenes rotas** (las 19 imágenes resuelven; las marcadas
  "broken" en el primer eval eran solo lazy-load below-the-fold). ✔
- Fotos del hero/secciones y vehículo `veh-mercado.png` cargan. ✔

### Responsive (1440 / 1280 / 768 / 390)
| Viewport | Overflow X | Navbar | Cards | Logos | Notas |
|---|---|---|---|---|---|
| 1440 | No (doc=1440) | desktop | 2-col | 5-col | Hero, líneas no tapan cara |
| 1280 | No (doc=1280) | desktop | 2-col | — | CTAs verificados |
| 768  | No (doc=768)  | burger | 2-col | 3-col | Hero apilado, OK |
| 390  | No (doc=390)  | burger | 1-col | 2-col | Form/CTAs usables; menú móvil abre/cierra OK |

- Menú móvil (off-canvas) **funcional**: slide a left:0 con transición 0.35s, lista completa
  (Rutas Pyme → /rutas, 4 rutas, Nosotros/Aliados/Comunidad/Recursos/Contacto, "Súmate gratis"). ✔
- Sin solapamientos, texto cortado ni overflow horizontal en ningún ancho. ✔

---

## Correcciones / verificaciones

### Menor — verificación de contenido (no bloqueante)

1. **Logo "OMIA" muestra en realidad la marca "OrganizaMe".**
   `assets/logos/partners/omia.png` despliega el wordmark **"[organizaMe]"** (gris/verde),
   pero el `alt` y la intención del blueprint lo nombran "OMIA". Hay que confirmar cuál es el
   aliado real: si el aliado es **OrganizaMe**, corregir `alt="OrganizaMe"` (y, si aplica,
   renombrar el archivo); si es **OMIA**, el PNG está equivocado y hay que reemplazarlo.
   → `pw-arquitecto`: confirmar el nombre real del aliado.
   → `pw-desarrollador`: una vez confirmado, ajustar `alt` (línea 247 de `index.html`) y/o el archivo.

   *Nota:* se verificaron además otros logos "sin descripción validada":
   - `pymeuc.png` = crest Pontificia Universidad Católica de Chile → alt "Pyme UC — Facultad de
     Economía y Administración UC" → **correcto**.
   - `salcobrand.png` = "Open by Salcobrand" → alt "Salcobrand" → **correcto** (sub-marca de Salcobrand).
   - `otic.png` = "OTIC 50 años CChC" → alt "OTIC CChC" → **correcto**.
   Solo OMIA/OrganizaMe requiere confirmación.

### Pendientes ya documentados en el blueprint (no son defectos de esta build)
- Rutas reales de `#suscripcion` / `#diagnostico` por confirmar (provisionales correctos).
- Páginas Nosotros/Comunidad/Recursos/Contacto/Aliados en `#` hasta tener arquitectura.
- FAQ (5 Q&A) marcada como provisional hasta validación del cliente.
- Color card Capital `#FFF200` vs `#FF8500` (P-02): se mantuvo `#FFF200` por coherencia con
  rutas.html — decisión correcta, queda como pendiente de confirmar con cliente.

---

## Resumen para el orquestador
**PASS.** El home puede avanzar a deploy de prueba. La única acción recomendada antes de
publicar de cara a cliente es confirmar la identidad del logo OMIA/OrganizaMe (ítem 1), que es
un ajuste de 1 línea una vez confirmado el nombre.
