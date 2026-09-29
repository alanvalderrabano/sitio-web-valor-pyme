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

## Estructura

1. Hero — *Fortalece las capacidades que impulsan el crecimiento de tu Pyme*
2. Franja de cifras
3. Acerca de Pyme UC
4. Desarrolla nuevas capacidades para hacer crecer tu Pyme
5. Beneficios exclusivos para la comunidad
6. Conoce los próximos talleres y mentorías — los dos programas pagados, lado a lado
7. Más cursos, talleres y mentorías — los otros siete, con filtros
8. Fortalece la gestión y crecimiento de tu Pyme en 3 simples pasos:
9. Contacta a Pyme UC — los 14 campos del formulario, con sus etiquetas y opciones

## Qué cambia (solo diseño)

- **Tipografía, color y espaciado del sitio**: Rubik para títulos, paleta del
  brandbook, esquinas rectas y el sistema de líneas de rutas en el hero.
- **Header y footer reales** del sitio, con su navegación y menú móvil.
- **Tarjetas comparables**: modalidad, pregunta, descripción, fecha, hora y valor
  siempre en la misma posición. Los dos programas pagados usan una tarjeta más
  alta, con la información práctica en una banda inferior.
- **Filtros** en "Más cursos": *Todos 7 / Gratuitos 3 / Online asincrónico 4*.
- **Cada "Inscribirme" preselecciona su programa** en el desplegable del
  formulario. Cuando el programa no está entre las opciones (ver más abajo), la
  página lo dice en vez de dejar el campo vacío sin explicación.
- **Formulario legible**: los 14 campos se mantienen completos, en dos columnas
  cuando la etiqueta es corta y a ancho completo cuando es larga, con validación
  en línea y foco en el primer campo con error.
- **Móvil diseñado por breakpoint**, no encogido: una columna, filtros en
  carrusel, cifras en 2×2 y botones a ancho completo.

### Márgenes

El contenido usa el **mismo contenedor que el header y el footer del sitio**
(`max-width: 1240px`, `padding-inline: clamp(20px, 5vw, 80px)`), así que todo
—hero, cifras, tarjetas, formulario— queda alineado con el logo y la navegación.
Los espacios salen de cuatro variables (`--sp`, `--sp-head`, `--gap`,
`--pad-card`) en lugar de valores sueltos por bloque, y en móvil bajan de golpe
redefiniendo las variables.

### Accesibilidad

Los controles del formulario llevan `autocomplete` donde corresponde, los
mensajes de error se enlazan al campo con `aria-describedby`, cada botón
*Inscribirme* dice a qué programa pertenece en su nombre accesible, el foco es
visible en todos los controles (incluido el checkbox y los botones sobre fondo
morado, donde el anillo pasa a crema para llegar a 3:1) y el borde de inputs,
selects y chips usa un gris que alcanza 3:1 sobre blanco.

### Textos que no vienen de la referencia

Todo el contenido es literal salvo estos elementos de interfaz, que son parte del
diseño propuesto: la franja de cifras (9 / 3 / 20% / 100%, datos tomados de la
propia página), las etiquetas de los filtros y su contador, la palabra *Gratuito*
como precio, el aviso de programa elegido y los mensajes de validación. Si
prefieren quitar alguno, se saca sin tocar el resto.

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
