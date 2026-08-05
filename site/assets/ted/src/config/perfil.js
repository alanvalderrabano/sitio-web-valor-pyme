// Campos de perfilamiento del formulario inicial.
//
// SOLO INFORMATIVOS: se guardan en HubSpot y no intervienen en el puntaje, las
// dimensiones, las etapas ni en qué formulario se muestra al final. Añadir o
// quitar campos aquí no puede alterar el resultado del diagnóstico.
//
// `ancho` decide si el campo ocupa media fila o entera. Los de etiqueta u opciones
// largas van completos; los cortos se emparejan. Es solo maquetación: no toca ni
// el orden de envío ni las propiedades.
//
// Los `value` de cada opción son LITERALES del portal 7800319, leídos de
// GET /crm/v3/properties/contacts el 4-ago-2026. No inventar ni retocar: las
// propiedades de tipo `select` rechazan cualquier valor fuera de su lista, y un
// solo valor inválido tumba el POST entero — con él, todo lo demás del envío.

export const camposPerfil = [
  { property: 'firstname', ancho: 'medio', label: 'Nombre', type: 'text', placeholder: 'Escribe tu nombre' },
  { property: 'lastname', ancho: 'medio', label: 'Apellidos', type: 'text', placeholder: 'Escribe tus apellidos' },
  { property: 'email', ancho: 'completo', label: 'Correo electrónico', type: 'email', placeholder: 'Escribe tu correo electrónico' },

  {
    property: 'etapa_de_la_pyme', ancho: 'completo',
    label: '¿En qué etapa se encuentra tu negocio?',
    type: 'select',
    options: [
      "Inicio: estamos partiendo y validando nuestro modelo de negocios.",
      "Mantención: ya validamos nuestro modelo de negocios, pero aún no logramos las ventas esperadas.",
      "Crecimiento: validamos el modelo de negocios y estamos creciendo.",
      "Madurez: tenemos un modelo de negocios establecido, con ingresos estables.",
    ],
  },
  {
    property: 'bo_cual_de_estas_situaciones_representa_mejor_tu_principal_desafio_actual', ancho: 'completo',
    label: '¿Cuál de estas situaciones representa mejor tu principal desafío actual?',
    type: 'select',
    options: [
      "Mantener el flujo de dinero y acceder a financiamiento",
      "Vender más o llegar a nuevos clientes",
      "Hacer más fácil la administración de mi negocio",
      "Desarrollar habilidades o fortalecer mi equipo",
    ],
  },
  {
    property: 'nivel_de_ventas', ancho: 'medio',
    label: '¿Cuál es el tramo de ventas de tu empresa?',
    type: 'select',
    options: [
      "Sin ventas",
      "0,01 ~ 200 UF",
      "200 ~ 600 UF",
      "600 ~ 2.400 UF",
      "2.400 ~ 5.000 UF",
      "5.000 ~ 10.000 UF",
      "10.000 ~ 25.000 UF",
      "25.000 ~ 50.000 UF",
      "50.000 ~ 100.000 UF",
      "100.000 ~ 200.000 UF",
      "200.000 ~ 600.000 UF",
      "600.000 ~ 1.000.000 UF",
      "sobre 1.000.000 UF",
    ],
  },
  {
    property: 'cual_es_el_rubro_de_tu_pyme__', ancho: 'medio',
    label: '¿Cuál es el rubro de tu pyme?',
    type: 'select',
    options: [
      "Agro, Ganadería y Pesca",
      "Agua, Residuos y Reciclaje",
      "Arte, Entretención y Deporte",
      "Actividades de servicio",
      "Comercio y Retail",
      "Construcción",
      "Educación y Capacitación",
      "Energía y Combustibles",
      "Finanzas y Seguros",
      "Gastronomía y Hotelería",
      "Inmobiliario",
      "Manufactura y Elaboración de Productos",
      "Minería",
      "Organismos Internacionales",
      "Salud y Bienestar",
      "Sector Público",
      "Servicios Administrativos",
      "Servicios Domésticos",
      "Servicios Personales y Otros",
      "Servicios Profesionales y Consultoría",
      "Tecnología y Comunicaciones",
      "Transporte y Logística",
    ],
  },

  // El desplegable que decide cuál de los dos RUT se pide.
  {
    property: 'tienes_rut_empresa_', ancho: 'medio',
    label: '¿Tienes RUT empresa?',
    type: 'select',
    options: [
      "Si",
      "No",
    ],
  },
  // Estos dos son excluyentes: `mostrarSi` lo evalúa el componente.
  { property: 'rut_empresa', ancho: 'medio', label: 'RUT empresa', type: 'text', placeholder: 'Ejemplo: 87654321-0',
     mostrarSi: { campo: 'tienes_rut_empresa_', valor: 'Si' } },
  { property: 'rut_persona', ancho: 'medio', label: 'RUT persona', type: 'text', placeholder: 'Ejemplo: 12345678-5',
     mostrarSi: { campo: 'tienes_rut_empresa_', valor: 'No' } },

  {
    property: 'region', ancho: 'medio',
    label: '¿En qué región resides?',
    type: 'select',
    options: [
      "Región de Arica y Parinacota",
      "Región de Tarapacá",
      "Región de Antofagasta",
      "Región de Atacama",
      "Región de Coquimbo",
      "Región de Valparaíso",
      "Región Metropolitana de Santiago",
      "Región del Libertador General Bernardo O’Higgins",
      "Región del Maule",
      "Región del Ñuble",
      "Región del Biobío",
      "Región de La Araucanía",
      "Región de Los Ríos",
      "Región de Los Lagos",
      "Región de Aysén del General Carlos Ibáñez del Campo",
      "Región de Magallanes y la Antártica Chilena",
      "Fuera de Chile",
      "No Identificada",
    ],
  },
  // En el portal es un campo numérico, no una lista.
  { property: 'bo_edad', ancho: 'medio', label: '¿Cuál es tu edad?', type: 'number', placeholder: 'Ejemplo: 42', min: 15, max: 110 },
  {
    property: 'nivel_de_educacion', ancho: 'completo',
    label: '¿Cuál es tu nivel de educación?',
    type: 'select',
    options: [
      "Sin estudios",
      "Básica",
      "Media",
      "Educación técnica incompleta",
      "Educación técnica completa",
      "Universitaria incompleta",
      "Universitaria completa",
      "Postgrado (Magister o Doctorado)",
      "Superior",
    ],
  },
  {
    property: 'bo_con_que_frecuencia_te_gustaria_recibir_contenidos_de_valor_pyme', ancho: 'completo',
    label: '¿Con qué frecuencia te gustaría recibir contenidos de Valor Pyme?',
    type: 'select',
    options: [
      "1 vez por semana",
      "Cada 15 días",
      "1 vez al mes",
      "Solo cuando haya algo realmente importante",
      "Prefiero poder elegir los temas y la frecuencia",
    ],
  },
];

/** Estado inicial: una clave por propiedad, vacía. */
export function estadoPerfilInicial() {
  const estado = {};
  for (const c of camposPerfil) estado[c.property] = '';
  // Por defecto "Si", para que el formulario arranque pidiendo el RUT de empresa
  // igual que antes de añadir estos campos.
  estado.tienes_rut_empresa_ = 'Si';
  return estado;
}
