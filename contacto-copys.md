# Página de CONTACTO — copy del doc (Ari) · para construir DESPUÉS del fix de marca

> Fuente: https://docs.google.com/document/d/1i-n7liW3OY_-601HATwTO_VFCa7ngnaj9TbEUNCcJ_Q
> Construir `site/contacto.html` heredando el design system YA con las correcciones de marca (esquinas rectas 0px, colores oficiales, Rubik, íconos oficiales, footer #2F2927, header/nav consistente). Enlazar "Contacto" del nav/footer a `/contacto`.

## Estructura y copy (verbatim del doc)
1. **Hero**
   - H1: `¿Necesitas contactarnos?`
   - CTA: `Contáctanos` (ancla al formulario `#mensaje`)
2. **¿Cómo podemos ayudarte?** (H2) → **6 cards de motivo** (cada una lleva al formulario con el motivo preseleccionado, o es seleccionable):
   1. `Quiero ser partner o aliado`
   2. `Tengo una consulta sobre Valor Pyme`
   3. `Soy parte de la comunidad y necesito ayuda`
   4. `Quiero colaborar con Valor Pyme`
   5. `Prensa o comunicaciones`
   6. `Otro`
3. **Formulario** (H3 `Envíanos tu mensaje`) + "Mensaje de apoyo" (bajada — el doc no da el texto; redactar breve o dejar pendiente). Campos típicos: nombre, email, motivo (los 6 de arriba), mensaje, aceptación de datos. **OJO:** no hay endpoint real → dejar el form sin acción real (placeholder) y reportar que falta el backend/email destino. No enviar a ningún lado inventado.
4. **FAQ (4 preguntas)** — el doc NO trae las respuestas; redactar propuesta y marcar como pendiente de validación:
   - `¿Cuánto tiempo demora la respuesta?`
   - `¿Cómo recibiré la respuesta?`
   - `¿Qué sucede después de enviar mi consulta?`
   - `¿Puedo contactar a Valor Pyme para proponer una alianza o colaboración?`

## Pendientes a confirmar con cliente
- Texto "Mensaje de apoyo" bajo el formulario (no venía).
- Respuestas de las 4 FAQ (no venían).
- **Endpoint/email destino** del formulario (a dónde llegan los mensajes).
- Datos de contacto directos si los hay (email, redes, dirección) — no venían en el doc.
