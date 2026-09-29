# Propuesta de mejora · Cursos y mentorías Pyme UC

Rediseño de `https://www.valorpyme.cl/cursos-mentorias-pyme-uc`, implementado en
HTML + CSS + JS sin dependencias. Abrir `index.html` o servir la carpeta.

## Archivos
| Archivo      | Qué contiene |
|--------------|--------------|
| `index.html` | Estructura semántica de la página. |
| `styles.css` | Sistema de diseño (tokens del brandbook Valor Pyme) y los 3 breakpoints. |
| `cursos.js`  | **Fuente única de verdad**: los 9 programas reales. |
| `app.js`     | Render del catálogo, filtros, preselección y validación del formulario. |
| `assets/`    | Imágenes y logos tomados de la página en producción. |
| `vp-header.css` / `vp-header.js` | Copia de la hoja de estilos y el script del sitio: la página usa el **header y el footer reales de valorpyme.cl**, no una versión simplificada. |

> Las clases propias van con prefijo `puc-` donde colisionaban con las del sitio
> (`btn`, `hero`, `eyebrow`, `lead`), para que el CSS global no las pise.

## Qué cambia respecto de la página actual

1. **Catálogo unificado y filtrable.** Hoy los programas están repartidos en tres
   bloques separados (webinars, cursos destacados, cursos a tu ritmo) y hay que
   recorrer toda la página para compararlos. Ahora son 9 tarjetas con el mismo
   formato y filtros por *Gratuitos / Con fecha en vivo / Online a tu ritmo*.
2. **El catálogo sube.** Pasa de estar tras cuatro secciones introductorias a ser
   lo segundo que se ve, porque es el producto de la página.
3. **Cada CTA lleva a su programa.** Hoy los 9 botones "Inscribirme" apuntan al
   mismo `#banner-form-section`. Aquí el botón preselecciona el programa en el
   formulario y avisa cuál se está postulando.
4. **Precios resueltos.** Se muestra el valor final con el descuento de comunidad
   ya aplicado, junto al precio de lista tachado. El usuario no calcula nada.
5. **Formulario de 14 campos a 6.** Programa, nombre, empresa, correo, teléfono y
   consentimiento. Con validación en línea y mensajes de error concretos.
6. **El desplegable no se puede desincronizar.** Tarjetas y `<select>` se generan
   desde `cursos.js`. (Ver el hallazgo de más abajo.)
7. **Consentimiento explícito** con enlaces a términos y política de privacidad.
8. **Móvil diseñado, no encogido**: filtros en carrusel horizontal, cifras en 2×2,
   pasos en lista horizontal, CTA a ancho completo.

## Hallazgo en la página en producción

El desplegable *"¿En cuál iniciativa te gustaría Participar?"* está desalineado
con el catálogo:

- **No incluye** los dos cursos pagados destacados: *IA para tu Pyme: de las
  herramientas a los agentes* y *Gestión del Marketing para Pymes*.
- **Sí incluye tres programas que no existen en la página**: *Mentorías de
  Aspectos Claves de tu Negocio*, *Gestión de Operaciones para Empresas Pequeñas
  y Medianas* y *Control de gestión para empresarios pyme*.

Combinado con el punto 3, quien hace clic en "Inscribirme" del curso de $165.000
cae en un formulario largo donde ese curso ni siquiera se puede seleccionar.

## Pendiente antes de publicar
- Reemplazar el `<form>` de demostración por el formulario de HubSpot.
- Enlazar términos y condiciones y política de privacidad reales.
- Confirmar fechas y precios vigentes de los 9 programas.
