/* Contenido textual de https://www.valorpyme.cl/cursos-mentorias-pyme-uc
   Copiado literal de la página de referencia. Lo único que cambia es el diseño. */

window.PROXIMOS = [
  {
    titulo: 'IA para tu Pyme: de las herramientas a los agentes',
    dirigido: 'Directivos de pymes que buscan impulsar su competitividad.',
    clases: 'Clases Online (15 y 22 oct, 9-12 hrs) | Híbrido (29 oct, 9-11 hrs).',
    aprenderas: 'A aplicar IA generativa de forma segura, automatizar tareas, analizar datos de tu negocio y diseñar agentes personalizados con el contexto de tu empresa.',
    nota: '(Req: Suscripción a herramienta de IA, aprox. USD 20/mes).',
    valor: '$165.000',
    dcto: '20% dcto Comunidad Valor Pyme'
  },
  {
    titulo: 'Curso "Gestión del Marketing para Pymes"',
    dirigido: 'Empresarios, directivos o gerentes de pymes interesados en mejorar la competitividad y gestión de su empresa.',
    clases: 'Clases Online, en vivo: Del 30 de septiembre al 04 de noviembre',
    aprenderas: 'En este curso aprenderás a gestionar estratégicamente el marketing y la comunicación de tu pyme, adquiriendo herramientas que te permitirán tomar mejores decisiones, crear una oferta de valor atractiva y conectar de manera efectiva con tus clientes.',
    nota: '',
    valor: '550.000',
    dcto: '20% Dcto Comunidad Valor Pyme'
  }
];

window.MAS = [
  {
    titulo: 'Taller Digitalización de Proceso',
    hook: '¿Tus procesos te ayudan a avanzar o te hacen perder tiempo?',
    d: 'Aprende a identificar oportunidades de mejora y adquiere herramientas para diseñar o rediseñar procesos más eficientes y alineados con los objetivos de tu negocio.',
    modalidad: 'Online sincrónico y gratuito',
    fecha: '30 de Octubre del 2026',
    hora: '9:00 hrs',
    valor: ''
  },
  {
    titulo: 'Taller Marketing digital e Ecommerce',
    hook: '¿Estás aprovechando los canales digitales para hacer crecer tu negocio?',
    d: 'Aprende las claves para fortalecer tu presencia online, llegar a tus clientes y desarrollar una estrategia digital más efectiva.',
    modalidad: 'Online sincrónico y gratuito',
    fecha: '06 de Octubre del 2026',
    hora: '14:00 hrs',
    valor: ''
  },
  {
    titulo: 'Taller Modelo de Negocios',
    hook: '¿Tu modelo de negocio está preparado para crecer?',
    d: 'Analiza cómo funciona tu empresa, detecta oportunidades de mejora y fortalece las bases para crecer de manera sostenible.',
    modalidad: 'Online sincrónico y gratuito',
    fecha: '20 de Octubre del 2026',
    hora: '12:30 hrs',
    valor: ''
  },
  {
    titulo: 'Curso Gestión Empresarial Exitosa para Pyme',
    hook: '¿Quieres gestionar tu empresa con más herramientas y mejores decisiones?',
    d: 'Fortalece tus conocimientos en áreas clave del negocio como estrategia, marketing, finanzas y gestión de personas.',
    modalidad: 'Online asincrónico',
    fecha: '',
    hora: '',
    valor: '$49 dólares'
  },
  {
    titulo: 'Curso Planificación y Gestión Estratégica para Pymes.',
    hook: '¿Tienes claro hacia dónde va tu empresa y cómo llegar?',
    d: 'Aprende a definir objetivos, tomar decisiones estratégicas y utilizar herramientas que te permitan construir e implementar una estrategia para hacer crecer tu negocio.',
    modalidad: 'Online asincrónico',
    fecha: '',
    hora: '',
    valor: '$49 dólares'
  },
  {
    titulo: 'Curso Escalamiento Exitoso e Innovación en los Negocios',
    hook: '¿Tu empresa está preparada para dar el siguiente paso?',
    d: 'Aprende estrategias y herramientas para impulsar su crecimiento, incorporar la innovación y explorar nuevas oportunidades de mercado e internacionalización.',
    modalidad: 'Online asincrónico',
    fecha: '',
    hora: '',
    valor: '$49 dólares'
  },
  {
    titulo: 'Curso Claves para el Éxito de la Transformación Digital en Pymes.',
    hook: '¿Tu empresa está aprovechando realmente las oportunidades digitales?',
    d: 'Aprende las claves para avanzar en su transformación digital, mejorar su competitividad y aprovechar la tecnología para impulsar su crecimiento.',
    modalidad: 'Online asincrónico',
    fecha: '',
    hora: '',
    valor: '$49 dólares'
  }
];

/* Campos del formulario "Contacta a Pyme UC", con sus etiquetas y opciones
   exactamente como están en la página de referencia. */
window.FORM = [
  { n:'firstname', l:'Nombre', req:true, tipo:'text', ancho:'medio' },
  { n:'lastname',  l:'Apellido', req:true, tipo:'text', ancho:'medio' },
  { n:'email',     l:'Correo electrónico', req:true, tipo:'email', ancho:'medio' },
  { n:'phone',     l:'Número de teléfono', req:false, tipo:'tel', ancho:'medio' },
  { n:'en_cual_curso_te_gustaria_participar_', l:'¿En cuál iniciativa te gustaría Participar?', req:false, tipo:'select', o:[
    'Mentorías de Aspectos Claves de tu Negocio',
    'Curso “ Gestión de Operaciones para Empresas Pequeñas y Medianas”',
    'Curso “Control de gestión para empresarios pyme”.',
    'Taller Digitalización de Proceso',
    'Taller Marketing digital e Ecommerce.',
    'Taller Modelo de Negocios.',
    'Curso Gestión Empresarial Exitosa para Pyme',
    'Curso Planificación y Gestión Estratégica para Pymes.',
    'Curso Escalamiento Exitoso e Innovación en los Negocios',
    'Curso Claves para el Éxito de la Transformación Digital en Pymes.'] },
  { n:'etapa_de_la_pyme', l:'¿En qué etapa se encuentra tu negocio?', req:true, tipo:'select', o:[
    'Inicio: estamos partiendo y validando nuestro modelo de negocios.',
    'Mantención: ya validamos nuestro modelo de negocios, pero aún no logramos las ventas esperadas.',
    'Crecimiento: validamos el modelo de negocios y estamos creciendo.',
    'Madurez: tenemos un modelo de negocios establecido, con ingresos estables.'] },
  { n:'bo_cual_de_estas_situaciones_representa_mejor_tu_principal_desafio_actual', l:'¿Cuál de estas situaciones representa mejor tu principal desafío actual?', req:true, tipo:'select', o:[
    'Mantener el flujo de dinero y acceder a financiamiento',
    'Vender más o llegar a nuevos clientes',
    'Hacer más fácil la administración de mi negocio',
    'Desarrollar habilidades o fortalecer mi equipo'] },
  { n:'nivel_de_ventas', l:'¿Cuál es el tramo de ventas de tu empresa?', req:true, tipo:'select', ancho:'medio', o:[
    'Sin ventas','0,01 ~ 200 UF','200,01 ~ 600 UF','600,01 ~ 2.400 UF','2.400,01 ~ 5.000 UF',
    '5.000,01 ~ 10.000 UF','10.000,01 ~ 25.000 UF','25.000,01 ~ 50.000 UF','50.000,01 ~ 100.000 UF',
    '100.000,01 ~ 200.000 UF','200.000,01 ~ 600.000 UF','600.000,01 ~ 1.000.000 UF','más de 1.000.000 UF'] },
  { n:'tienes_rut_empresa_', l:'¿Tienes RUT empresa?', req:true, tipo:'select', ancho:'medio', o:['Si','No'] },
  { n:'cual_es_el_rubro_de_tu_pyme__', l:'¿Cuál es el rubro de tu pyme ?', req:true, tipo:'select', ancho:'medio', o:[
    'Agro, Ganadería y Pesca','Agua, Residuos y Reciclaje','Arte, Entretención y Deporte','Actividades de servicio',
    'Comercio y Retail','Construcción','Educación y Capacitación','Energía y Combustibles','Finanzas y Seguros',
    'Gastronomía y Hotelería','Inmobiliario','Manufactura y Elaboración de Productos','Minería',
    'Organismos Internacionales','Salud y Bienestar','Sector Público','Servicios Administrativos',
    'Servicios Domésticos','Servicios Personales y Otros','Servicios Profesionales y Consultoría',
    'Tecnología y Comunicaciones','Transporte y Logística'] },
  { n:'region', l:'¿En qué región resides?', req:true, tipo:'select', ancho:'medio', o:[
    'Región de Arica y Parinacota','Región de Tarapacá','Región de Antofagasta','Región de Atacama',
    'Región de Coquimbo','Región de Valparaíso','Región Metropolitana de Santiago',
    'Región del Libertador General Bernardo O’Higgins','Región del Maule','Región del Ñuble','Región del Biobío',
    'Región de La Araucanía','Región de Los Ríos','Región de Los Lagos',
    'Región de Aysén del General Carlos Ibáñez del Campo','Región de Magallanes y la Antártica Chilena',
    'Fuera de Chile','No Identificada'] },
  { n:'bo_edad', l:'¿Cual es tu edad?', req:true, tipo:'number', ancho:'medio' },
  { n:'nivel_de_educacion', l:'¿Cuál es tu nivel de educación?', req:true, tipo:'select', ancho:'medio', o:[
    'Sin estudios','Básica','Media','Educación técnica incompleta','Educación técnica completa',
    'Universitaria incompleta','Universitaria completa','Postgrado (Magister o Doctorado)'] },
  { n:'bo_con_que_frecuencia_te_gustaria_recibir_contenidos_de_valor_pyme', l:'¿Con qué frecuencia te gustaría recibir contenidos de Valor Pyme?', req:true, tipo:'select', o:[
    '1 vez por semana','Cada 15 días','1 vez al mes','Solo cuando haya algo realmente importante',
    'Prefiero poder elegir los temas y la frecuencia'] }
];
