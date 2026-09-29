# Propuesta de rediseño · Cursos y mentorías Pyme UC

Rediseño de `https://www.valorpyme.cl/cursos-mentorias-pyme-uc`, implementado en
HTML + CSS + JS sin dependencias. Abrir `index.html` o servir la carpeta.

**El contenido es el de la página de referencia, copiado textualmente.**
Lo único que cambia es el diseño, para que la página se vea como el sitio actual.

## Archivos
| Archivo | Qué contiene |
|---|---|
| `index.html` | Estructura semántica de la página. |
| `styles.css` | Sistema de diseño (tokens del brandbook Valor Pyme) y los 3 breakpoints. |
| `cursos.js` | Los textos de los cursos y los campos del formulario, literales. |
| `app.js` | Render de tarjetas y formulario, y validación en línea. |
| `assets/` | Imágenes y logos tomados de la página en producción. |
| `vp-header.css` / `vp-header.js` | Copia de la hoja de estilos y el script del sitio: la página usa el **header y el footer reales de valorpyme.cl**. |

> Las clases propias llevan prefijo `puc-` donde colisionaban con las del sitio
> (`btn`, `hero`, `eyebrow`, `lead`), para que el CSS global no las pise.

## Estructura (misma que la página de referencia)

1. Hero — *Fortalece las capacidades que impulsan el crecimiento de tu Pyme*
2. Acerca de Pyme UC
3. Desarrolla nuevas capacidades para hacer crecer tu Pyme
4. Beneficios exclusivos para la comunidad
5. Conoce los próximos talleres y mentorías
6. Más cursos, talleres y mentorías
7. Fortalece la gestión y crecimiento de tu Pyme en 3 simples pasos:
8. Contacta a Pyme UC — los 14 campos del formulario, con sus etiquetas y opciones

## Qué cambia (solo diseño)

- **Tipografía, color y espaciado del sitio**: Rubik para títulos, paleta del
  brandbook, esquinas rectas y el sistema de líneas de rutas en el hero.
- **Header y footer reales** del sitio, con su navegación y menú móvil.
- **Tarjetas con jerarquía**: modalidad, pregunta gancho, descripción, fecha,
  hora y valor en posiciones fijas, para poder comparar programas de un vistazo.
  Los dos programas pagados usan una tarjeta más amplia con su información
  separada en dos columnas.
- **Formulario legible**: los 14 campos se mantienen, agrupados en dos columnas
  cuando la etiqueta es corta y a ancho completo cuando es larga, con validación
  en línea y foco en el primer campo con error.
- **Móvil diseñado por breakpoint**, no encogido: una columna, imágenes con
  proporción propia y botones a ancho completo.

## Hallazgo en la página en producción

El desplegable *"¿En cuál iniciativa te gustaría Participar?"* está desalineado
con el catálogo. Lo dejamos **tal cual está hoy** para no alterar el contenido,
pero conviene corregirlo:

- **No incluye** los dos programas pagados destacados: *IA para tu Pyme: de las
  herramientas a los agentes* ($165.000) y *Gestión del Marketing para Pymes*
  ($550.000).
- **Sí incluye tres programas que no aparecen en la página**: *Mentorías de
  Aspectos Claves de tu Negocio*, *Curso "Gestión de Operaciones para Empresas
  Pequeñas y Medianas"* y *Curso "Control de gestión para empresarios pyme"*.

Además, los nueve botones *Inscribirme* llevan al mismo formulario sin indicar
qué programa se eligió, así que quien viene del curso de $165.000 no puede
seleccionarlo.

## Pendiente antes de publicar
- Reemplazar el `<form>` de demostración por el formulario de HubSpot.
- Corregir las opciones del desplegable de iniciativas.
- Confirmar fechas y valores vigentes de los programas.
