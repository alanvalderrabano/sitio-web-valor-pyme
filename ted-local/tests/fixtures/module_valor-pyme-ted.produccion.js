document.addEventListener('alpine:init', () => {
  let Alpine = window.Alpine;

  Alpine.data('ted', () => ({
    page: Alpine.$persist('home'),

    name: Alpine.$persist(''),
    email: Alpine.$persist(''),
    rut: Alpine.$persist(''),
    firstname:Alpine.$persist(''),
    lastname: Alpine.$persist(''),
    company: Alpine.$persist(''),

    mailingStageRange: '',
    postSurveyFormIds: [],
    hasForm: false,

    showStartOverModal: false,

    currentQuestionIndex: Alpine.$persist(0),
    score: Alpine.$persist(0),
    stage: Alpine.$persist(''),

    contactId: null,

    surveyCompleted: Alpine.$persist(false),

    errors: [],

    stages: {
      'tradicional': {
        id: 'BAJO0', 
        label: 'Tradicional',
        color: '#e83642',
        ranges: {
          1: [0, 4],
          2: [0, 3],
          3: [0, 1],
          4: [0, 3.75],
          5: [0, 2],
          total: [0, 13.75],
        }
      },
      'principiante': {
        id: 'BAJO1',
        label: 'Principiante',
        color: '#f4b21e',
        ranges: {
          1: [4.01, 10.7],
          2: [3.01, 6.8],
          3: [1.01, 3.5],
          4: [3.76, 11.25],
          5: [2.01, 9],
          total: [13.76, 41.25]
        }
      },
      'intermedio': {
        id: 'MEDIO',
        label: 'Intermedio',
        color: '#00953f',
        ranges: {
          1: [10.71, 13.1],
          2: [6.81, 13.4],
          3: [3.51, 6],
          4: [11.26, 20],
          5: [9.01, 17],
          total: [41.26, 69.5]
        }
      },
      'avanzado': {
        id: 'ALTO',
        label: 'Avanzado',
        color: '#1d4ed8',
        ranges: {
          1: [13.11, 20],
          2: [13.41, 20],
          3: [6.01, 10],
          4: [20.01, 25],
          5: [17.01, 25],
          total: [69.51, 100]
        }
      }
    },

    dimensions: Alpine.$persist({
      1: {
        name: 'Visión Estratégica',
        weight: 20,
        score: 0,
        progress: 0,
        stage: '',
        gap: 0,
        progressProperty: 'ted_3_dimension_1_posicion_actual',
        scoreProperty: 'ted_3_dimension_1_posicion_score',
        stageProperty: 'ted_3_dimension_1_brecha'
      },
      2: {
        name: 'Marketing, Ventas y Experiencia con Clientes',
        weight: 20,
        score: 0,
        progress: 0,
        stage: '',
        gap: 0,
        progressProperty: 'ted_3_dimension_2_posicion_actual',
        scoreProperty: 'ted_3_dimension_2_posicion_score',
        stageProperty: 'ted_3_dimension_2_brecha'
      },
      3: {
        name: 'Personas',
        weight: 10,
        score: 0,
        progress: 0,
        stage: '',
        gap: 0,
        progressProperty: 'ted_3_dimension_3_posicion_actual',
        scoreProperty: 'ted_3_dimension_3_posicion_score',
        stageProperty: 'ted_3_dimension_3_brecha'
      },
      4: {
        name: 'Procesos',
        weight: 25,
        score: 0,
        progress: 0,
        stage: '',
        gap: 0,
        progressProperty: 'ted_3_dimension_4_posicion_actual',
        scoreProperty: 'ted_3_dimension_4_posicion_score',
        stageProperty: 'ted_3_dimension_4_brecha'
      },
      5: {
        name: 'Tecnologías, Equipamiento y Herramientas',
        weight: 15,
        score: 0,
        progress: 0,
        stage: '',
        gap: 0,
        progressProperty: 'ted_3_dimension_5_posicion_actual',
        scoreProperty: 'ted_3_dimension_5_posicion_score',
        stageProperty: 'ted_3_dimension_5_brecha'
      }
    }),

    get dimensionsData() {
      let data = {};

      for (let dimension in this.dimensions) {
        const dimensionData = this.dimensions[dimension];

        data[dimensionData.progressProperty] = dimensionData.progress + '%';
        data[dimensionData.stageProperty] = this.getStage(dimensionData.score, dimension);
        data[dimensionData.scoreProperty] = dimensionData.score;

      }

      return data;
    },

    questions: Alpine.$persist([
      {
        id: "question-1",
        property: "ted232___cual_es_el_principal_cargo_o_responsabilidad_que_desempenas_en_tu_empresa_",
        weight: 0,
        type: "radio",
        dimension: 0,
        question: "1. ¿Cuál es el principal cargo o responsabilidad que desempeñas en tu empresa?",
        options: [
          { value: "a. Dueño o Socio" },
          { value: "b. Director" },
          { value: "c. Gerente General"},
          { value: "d. Gerente, Jefe de Finanzas o persona que maneja presupuesto para la toma de decisiones en la empresa." },
          { value: "e. Otro cargo"},
        ],
        answer: '',
        answers: []
      },
      {
        id: "question-2",
        property: "ted232___cual_es_tu___de_participacion_en_la_empresa_",
        weight: 0,
        type: "radio",
        dimension: 0,
        question: "2. ¿Cuál es tu % de participación en la empresa?",
        options: [
          { value: "Entre el 66% - 100%" },
          { value: "Entre el 41- 65%" },
          { value: "Menos del 40%" },
          { value: "No tengo participación" }
        ],
        answer: '',
        answers: []
      },
      {
        id: "question-3",
        property: "ted232__indica_cuantas_personas_trabajan_en_tu_empresa__incluyendo_los_socios_",
        weight: 0,
        type: "radio",
        dimension: 0,
        question: "3. Indica cuántas personas trabajan en tu empresa (incluyendo los socios).",
        options: [
          { value: "a. 0 - 9 empleados" },
          { value: "b. 10 - 25 empleados" },
          { value: "c. 26 - 50 empleados" },
          { value: "d. 51 - 100 empleados" },
          { value: "e. 101 - 200 empleados" },
          { value: "f. Más de 200 empleados" }
        ],
        answer: '',
        answers: []
      },
      {
        id: "question-4",
        property: "ted232__indica_el_rubro_en_el_cual_se_encuentra_tu_empresa",
        weight: 0,
        type: "radio",
        dimension: 0,
        question: "4. Indica el rubro en el cual se encuentra tu empresa",
        options: [
          { value: "a. Comercio al por mayor y al por menor" },
          { value: "b. Industria manofacturera" },
          { value: "c. Transporte y almacenamiento" },
          { value: "d. Construcción" },
          { value: "e. Agricultura, ganadería, silvicultura y pesca" },
          { value: "f. Actividades de servicio" },
          { value: "g. Actividades profesionales, científicas y técnicas" },
          { value: "h. Hoteles y Restaurantes" },
          { value: "I. Actividades artísticas, de entretenimiento y recreativas" },
          { value: "j. Información y comunicaciones" },
          { value: "k. Explotación y comunicaciones" },
          { value: "l. Actividades financieras y de seguros" },
          { value: "m. Suministro de electricidad, gas y agua" },
          { value: "n. Educación" },
          { value: "o. Salud" },
          { value: "p. Otro" }
        ],
        answer: '',
        answers: []
      },
      {
        id: "question-5",
        property: "ted232___en_que_rango_de_edad_te_encuentras_",
        weight: 0,
        type: "radio",
        dimension: 0,
        question: "5. ¿En qué rango de edad te encuentras?",
        options: [
          { value: "a. Menos de 30 años" },
          { value: "b. 31 a 50 años" },
          { value: "c. 51 a 60 años" },
          { value: "d. Más de 60 años" }
        ],
        answer: '',
        answers: []
      },
      {
        id: "question-6",
        property: "ted232__nivel_maximo_de_educacion_alcanzado",
        weight: 0,
        type: "radio",
        dimension: 0,
        question: "6. Favor indique el nivel máximo de educación alcanzado",
        options: [
          { value: "a. Educación Escolar" },
          { value: "b. Educación superior incompleta" },
          { value: "c. Educación Técnico Profesional Completa" },
          { value: "d. Educación Universitaria Completa" },
          { value: "e. Postgrado (doctorado y/o magister)" }
        ],
        answer: '',
        answers: []
      },
      {
        id: "question-7",
        property: "ted232__los_principales_clientes_a_los_que_diriges_tus_productos_o_servicios_son",
        weight: 0,
        type: "checkbox",
        dimension: 0,
        question: "7. Los principales clientes a los que diriges tus productos o servicios son:",
        options: [
          { value: "a. Consumidores nacionales (Personas)" },
          { value: "b. Consumidores internacionales (Personas)" },
          { value: "c. Empresas nacionales" },
          { value: "d. Empresas extranjeras" },
          { value: "e. Instituciones, organismos del Estado y otras organizaciones" }
        ],
        answer: '',
        answers: []
      },
      {
        id: "question-8",
        property: "ted_h_cual_de_las_siguientes_opciones_refleja_mejor_tu_opinion_y_la_situacion_sobre_la_digitalizaci",
        weight: 8,
        type: "radio",
        dimension: 1,
        question: "8. Cuál de las siguientes opciones refleja mejor tu opinión y la situación sobre la Digitalización en tu empresa",
        options: [
          { value: "No creo que la digitalización aporte grandes beneficios a la empresa", score: 0 },
          { value: "Creo que puede aportar algunos beneficios, pero aún no lo hemos aplicado en mi empresa", score: 20 },
          { value: "Es importante y tenemos algunas iniciativas digitales, pero no hemos destinado mayores recursos a ello", score: 40 },
          { value: "Aún tenemos un nivel bajo de digitalización aunque estamos trabajando en objetivos concretos para alcanzar mayor desarrollo en digitalización y para eso tenemos recursos asignados", score: 60 },
          { value: "Mi empresa ha alcanzado un desarrollo de digitalización medio pero tenemos que seguir avanzando", score: 80 },
          { value: "Mi empresa está muy avanzada en temas de digitalización. Es un proceso continuo", score: 100 },
          { value: "No sé. No conozco nada sobre digitalización", score: 0 }
        ],
        answer: '',
        answers: []
      },
      {
        id: "question-9",
        property: "ted_h_considerando_los_ultimos_tres_anos__tu_empresa_ha_implementado_tecnologias_que_han_permitido",
        weight: 12,
        type: "checkbox",
        dimension: 1,
        question: "9. Considerando los últimos tres años, tu empresa ha implementado tecnologías que han permitido: (Selecciona todas las alternativas que correspondan)",
        options: [
          { value: "Mejorar la oferta de productos/servicios", score: 18 },
          { value: "Mejorar la experiencia de clientes", score: 18 },
          { value: "Aumentar la eficiencia operacional y resultados", score: 18 },
          { value: "Mejorar la productividad y manejo de personas", score: 10 },
          { value: "Gestionar la empresa tomando decisiones basadas en los datos obtenidos por las tecnologías digitales", score: 26 },
          { value: "Aumentar la seguridad de la información de la empresa", score: 10 },
          { value: "No hemos implementado nuevas tecnologías en este período", score: 0 }
        ],
        answer: '',
        answers: []
      },
      {
        id: "question-10a",
        property: "ted_3_question_9_a",
        weight: 2.5,
        type: "radio",
        dimension: 5,
        title: "10. Según la siguiente escala, indique el nivel de equipamiento tecnológico y conectividad que tienen las personas para desempeñar sus funciones en áreas de gestión comercial, financiera y de personas",
        question: "a. Equipamiento tecnológico (Computadores, Notebooks, Tablets o Smartphones)",
        options: [
          { value: "No contamos con esta tecnología", score: 0 },
          { value: "Sólo algunas personas tienen acceso", score: 25 },
          { value: "Aproximadamente la mitad de las personas tienen acceso", score: 50 },
          { value: "La mayoría de las personas tienen acceso", score: 75 },
          { value: "Todas las personas tienen acceso", score: 100 }
        ],
        answer: '',
        answers: []
      },
      {
        id: "question-10b",
        property: "ted_3_question_9_b",
        weight: 2.5,
        type: "radio",
        dimension: 5,
        title: "10. Según la siguiente escala, indique el nivel de equipamiento tecnológico y conectividad que tienen las personas para desempeñar sus funciones en áreas de gestión comercial, financiera y de personas",
        question: "b. Conexión a internet (Wi-Fi, Banda Ancha o Fibra Óptica)",
        options: [
          { value: "No contamos con esta tecnología", score: 0 },
          { value: "Sólo algunas personas tienen acceso", score: 2.5 },
          { value: "Aproximadamente la mitad de las personas tienen acceso", score: 50 },
          { value: "La mayoría de las personas tienen acceso", score: 7.5 },
          { value: "Todas las personas tienen acceso", score: 100 }
        ],
        answer: '',
        answers: []
      },
      {
        id: "question-11",
        property: "ted_3_question_10",
        weight: 5,
        type: "checkbox",
        dimension: 3,
        question: "11. ¿Qué herramientas utilizan en tu negocio para coordinar y planificar el trabajo de las personas y equipos? Selecciona todas las alternativas que correspondan. (Selección múltiple)",
        options: [
          { value: "Correo electrónico", score: 10 },
          { value: "Mensajería instantánea (ejemplo: Whatsapp, otros)", score: 10 },
          { value: "Servicios en la nube (ejemplos: Drive, One Drive, etc.)", score: 20 },
          { value: "Servidores compartidos", score: 10 },
          { value: "Video conferencia (ejemplo: Zoom, Teams, Hangouts, etc.)", score: 20 },
          { value: "Aplicaciones de coordinación (ejemplo: Asana, Activecollab, Trello, Teams, etc.)", score: 20 },
          { value: "Otras", score: 10 },
          { value: "Ninguna", score: 0 }
        ],
        answer: '',
        answers: []
      },
      {
        id: "question-12a",
        property: "ted_h_a__microsoft_office_365__excel__word__power_point_o_similar____de_acuerdo_a_la_escala_a_conti",
        weight: 0.625,
        type: "radio",
        dimension: 5,
        title: "12. De acuerdo a la escala a continuación, ¿Cuál es el nivel de utilización en tu empresa de las siguientes tecnologías/herramientas digitales para la gestión?  (Para cada alternativa marca la opción que mejor refleje la situación en tu empresa)",
        question: "a. Microsoft Office 365 (Excel, Word, Power Point o similar)",
        options: [
          { value: "No conozco esta(s) herramienta(s)/no la(s) utilizamos", score: 0 },
          { value: "Estamos evaluando adoptarla(s)", score: 25 },
          { value: "La(s) utilizamos parcialmente", score: 60 },
          { value: "Utilizamos todas o la mayor parte de las capacidades de esta(s) herramienta(s)", score: 100 }
        ],
        answer: '',
        answers: []
      },
      {
        id: "question-12b",
        property: "ted_h_b__herramientas_de_administracion_de_procesos_y_recursos__erp__con_sus_distintos_modulos___de",
        weight: 1.25,
        type: "radio",
        dimension: 5,
        title: "12. De acuerdo a la escala a continuación, ¿Cuál es el nivel de utilización en tu empresa de las siguientes tecnologías/herramientas digitales para la gestión? (Para cada alternativa marca la opción que mejor refleje la situación en tu empresa)",
        question: "b. Herramientas de administración de procesos y recursos (ERP) con sus distintos módulos",
        options: [
          { value: "No conozco esta(s) herramienta(s)/no la(s) utilizamos(s)", score: 0 },
          { value: "Estamos evaluando adoptarla(s)", score: 25 },
          { value: "La(s) utilizamos parcialmente", score: 60 },
          { value: "Utilizamos todas o la mayor parte de las capacidades de esta(s) herramienta(s)", score: 10 }
        ],
        answer: '',
        answers: []
      },
      {
        id: "question-12c",
        property: "ted_h_c__herramientas_para_gestion_y_relacion_con_los_clientes__crm____de_acuerdo_a_la_escala_a_con",
        weight: 1.875,
        type: "radio",
        dimension: 5,
        title: "12. De acuerdo a la escala a continuación, ¿Cuál es el nivel de utilización en tu empresa de las siguientes tecnologías/herramientas digitales para la gestión? (Para cada alternativa marca la opción que mejor refleje la situación en tu empresa)",
        question: "c. Herramientas para gestión y relación con los clientes (CRM)",
        options: [
          { value: "No conozco esta(s) herramienta(s)/no la(s) utilizamos(s)", score: 0 },
          { value: "Estamos evaluando adoptarla(s)", score: 25 },
          { value: "La(s) utilizamos parcialmente", score: 60 },
          { value: "Utilizamos todas o la mayor parte de las capacidades de esta(s) herramienta(s)", score: 100 }
        ],
        answer: '',
        answers: []
      },
      {
        id: "question-12e",
        property: "ted_h_d__otras_herramientas_o_softwares_especializados_de_trabajo_disenados_para_mi_empresa_____de_",
        type: "radio",
        weight: 2.5,
        dimension: 5,
        title: "12. De acuerdo a la escala a continuación, ¿Cuál es el nivel de utilización en tu empresa de las siguientes tecnologías/herramientas digitales para la gestión? (Para cada alternativa marca la opción que mejor refleje la situación en tu empresa)",
        question: "e. Otras herramientas o softwares especializados de trabajo diseñados para mi empresa",
        options: [
          { value: "No conozco esta(s) herramienta(s)/no la(s) utilizamos", score: 0 },
          { value: "Estamos evaluando adoptarla(s)", score: 25 },
          { value: "La(s) utilizamos parcialmente", score: 60 },
          { value: "Utilizamos todas o la mayor parte de las capacidades de esta(s) herramienta(s)", score: 100 }
        ],
        answer: '',
        answers: []
      },
      {
        id: "question-12f",
        property: "ted_h_e__servidores_y_almacenamiento_en_la_nube__azure__g_suite__amazon_web_services__entre_otros__",
        type: "radio",
        weight: 2.5,
        dimension: 5,
        title: "12. De acuerdo a la escala a continuación, ¿Cuál es el nivel de utilización en tu empresa de las siguientes tecnologías/herramientas digitales para la gestión? (Para cada alternativa marca la opción que mejor refleje la situación en tu empresa)",
        question: "f. Servidores y almacenamiento en la Nube (Azure, G-suite, Amazon Web Services, entre otros)",
        options: [
          { value: "No conozco esta(s) herramienta(s)/no la(s) utilizamos", score: 0 },
          { value: "Estamos evaluando adoptarla(s)", score: 25 },
          { value: "La(s) utilizamos parcialmente", score: 60 },
          { value: "Utilizamos todas o la mayor parte de las capacidades de esta(s) herramienta(s)", score: 100 }
        ],
        answer: '',
        answers: []
      },
      {
        id: "question-12g",
        property: "ted_h_f__robotica__inteligencia_artificial_que_permita_automatizar_ciertas_tareas_o_procesos___de_a",
        type: "radio",
        weight: 2.5,
        dimension: 5,
        title: "12. De acuerdo a la escala a continuación, ¿Cuál es el nivel de utilización en tu empresa de las siguientes tecnologías/herramientas digitales para la gestión? (Para cada alternativa marca la opción que mejor refleje la situación en tu empresa)",
        question: "g. Robótica o Inteligencia Artificial que permita automatizar ciertas tareas o procesos",
        options: [
          { value: "No conozco esta(s) herramienta(s)/no la(s) utilizamos(s)", score: 0 },
          { value: "Estamos evaluando adoptarla(s)", score: 25 },
          { value: "La(s) utilizamos parcialmente", score: 60 },
          { value: "Utilizamos todas o la mayor parte de las capacidades de esta(s) herramienta(s)", score: 100 }
        ],
        answer: '',
        answers: []
      },
      {
        id: "question-12h",
        property: "ted_h_g__uso_del_internet_de_las_cosas_a_traves_de_dispositivos_que_permitan_obtener_informacion_de",
        type: "radio",
        weight: 2.5,
        dimension: 5,
        title: "12. De acuerdo a la escala a continuación, ¿Cuál es el nivel de utilización en tu empresa de las siguientes tecnologías/herramientas digitales para la gestión? (Para cada alternativa marca la opción que mejor refleje la situación en tu empresa)",
        question: "h. Internet de las cosas a través de dispositivos que permitan obtener información de los datos recopilados y tomar mejores decisiones",
        options: [
          { value: "No conozco esta(s) herramienta(s)/no la(s) utilizamos(s)", score: 0 },
          { value: "Estamos evaluando adoptarla(s)", score: 25 },
          { value: "La(s) utilizamos parcialmente", score: 60 },
          { value: "Utilizamos todas o la mayor parte de las capacidades de esta(s) herramienta(s)", score: 100 }
        ],
        answer: '',
        answers: []
      },
      {
        id: "question-13",
        property: "ted232__actualmente___que_medidas_se_toman_para_la_seguridad_informatica_de_tu_negocio__selecciona_",
        type: "checkbox",
        weight: 7.5,
        dimension: 5,
        question: "13. Actualmente, ¿Qué medidas se toman para la seguridad informática de tu negocio? Selecciona todas las alternativas que correspondan (selección múltiple)",
        options: [
          { value: "a. Actualización frecuente de sistemas y softwares", score: 10 },
          { value: "b. Uso de Antivirus", score: 15 },
          { value: "c. Realización de copias de seguridad de la información", score: 20 },
          { value: "d. Cambio o actualización de contraseñas de acceso, tanto personales como institucionales", score: 10 },
          { value: "e. Utilización de contraseñas robustas (con mayúscula/minúscula, número, símbolos, etc.)", score: 20 },
          { value: "f. Pruebas de seguridad de sistemas", score: 25 },
          { value: "g. Ninguna", score: 0 }
        ],
        answer: '',
        answers: []
      },
      {
        id: "question-14",
        property: "ted232_22__que_canales_digitales_utilizan_para_difundir_y_dar_a_conocer_los_productos__servicios_de",
        type: "checkbox",
        weight: 3,
        dimension: 2,
        question: "14. ¿Qué canales digitales utilizan para difundir y dar a conocer los productos/servicios de la empresa? Selecciona todas las alternativas que correspondan (selección múltiple)",
        options: [
          { value: "a. Página Web con catálogo de productos/servicios", score: 35 },
          { value: "b. Redes Sociales (Instagram, Facebook, TikTok)", score: 20 },
          { value: "c. Publicidad digital (en Google, marketplaces, etc.)", score: 30 },
          { value: "d. Mensajería o comunicación electrónica (Emailing, WhatsApp, SMS, entre otras)", score: 15 },
          { value: "e. Ninguno", score: 0 }
        ],
        answer: '',
        answers: []
      },
      {
        id: "question-15",
        property: "ted232_22__que_canales_digitales_utilizan_para_vender_los_productos_o_servicios_de_la_empresa_",
        type: "checkbox",
        weight: 5,
        dimension: 2,
        question: "15. ¿Qué canales digitales utilizan para vender los productos o servicios de la empresa? Selecciona todas las alternativas que correspondan (selección múltiple)",
        options: [
          { value: "Página Web con catálogo de productos/servicios y carro de compra", score: 30 },
          { value: "Plataformas digitales de ventas o marketplaces (ejemplo: Mercado Libre, de grandes tiendas, Cornershop, gubernamentales, etc.)", score: 20 },
          { value: "Consulta en plataformas de compra de entidades públicas o privadas (incluyendo licitaciones)", score: 10 },
          { value: "Aplicación móvil de ventas propia", score: 40 },
          { value: "Ninguno", score: 0 }
        ],
        answer: '',
        answers: []
      },
      {
        id: "question-16",
        property: "ted232__el_conjunto_de_canales_o_medios_digitales_de_difusion_y_venta_que_utilizamos_permite_a_los_",
        type: "checkbox",
        weight: 5,
        dimension: 2,
        question: "16. El conjunto de canales o medios digitales de difusión y venta que utilizamos permite a los clientes: (marque todas las alternativas que apliquen)",
        options: [
          { value: "a. Conocer los productos/servicios disponibles online con sus especificaciones", score: 10 },
          { value: "b. Hacer pedidos online de productos/servicios", score: 10 },
          { value: "c. Pagar los productos/servicios online a través de tarjetas de crédito, débito u otros medios de pago digitales", score: 20 },
          { value: "d. Elegir entre las opciones de despacho disponibles", score: 20 },
          { value: "e. Hacer seguimiento en línea de sus pedidos de productos/servicios", score: 30 },
          { value: "f. Realizar sugerencias y reclamos o solicitar servicio postventa", score: 10 },
          { value: "g. Ninguno de los anteriores", score: 0 }
        ],
        answer: '',
        answers: []
      },
      {
        id: "question-17",
        property: "ted_h__que_porcentaje_aproximado_de_las_ventas__facturacion__se_realiza_a_traves_de_canales_digital",
        type: "radio",
        weight: 4,
        dimension: 2,
        question: "17. ¿Qué porcentaje aproximado de las ventas (facturación) se realiza a través de canales digitales (e-commerce)?",
        options: [
          { value: "0%, no utilizo e-commerce para ventas", score: 0 },
          { value: "Menos del 10%", score: 10 },
          { value: "Entre el 10% y 30%", score: 30 },
          { value: "Entre el 31% y 50%", score: 50 },
          { value: "Entre el 51% y 70%", score: 70 },
          { value: "Más del 70%", score: 100 }
        ],
        answer: '',
        answers: []
      },
      {
        id: "question-18",
        property: "ted232___que_medios_de_pago_ofrecen_para_vender_los_productos_servicios_",
        type: "checkbox",
        weight: 3,
        dimension: 2,
        question: "18. ¿Qué medios de pago ofrecen para vender los productos/servicios? (marcar todos los que apliquen)",
        options: [
          { value: "a. Efectivo", score: 0 },
          { value: "b. Cheques", score: 0 },
          { value: "c. Pago a través de POS (máquina física), para tarjetas de crédito, débito, cuenta rut/vista", score: 10 },
          { value: "d. Transferencias Electrónicas", score: 10 },
          { value: "e. Botones de Pago (ejemplo: Webpay, Paypal, Mercado Pago, Código QR, MACH, etc.)", score: 40 },
          { value: "f. Pasarelas de pago, (ejemplo: Pago Fácil, Flow, Khipu, etc.)", score: 40 }
        ],
        answer: '',
        answers: []
      },
      {
        id: "question-19a",
        property: "ted_h_a__abastecimiento__adquisiciones__relacion_con_proveedores__pagos____de_acuerdo_a_la_siguient",
        type: "radio",
        weight: 5,
        dimension: 4,
        title: "19. De acuerdo a la siguiente escala, indique cuál es el nivel de digitalización de los siguientes procesos:",
        question: "a. Abastecimiento (adquisiciones, relación con proveedores, pagos)",
        options: [
          { value: "Se realizan todos en forma manual", score: 0 },
          { value: "La mayoría son manuales, pero hay algunos digitales", score: 30 },
          { value: "Cerca de la mitad son digitales", score: 60 },
          { value: "Prácticamente todos los procesos están digitalizados", score: 100 }
        ],
        answer: '',
        answers: []
      },
      {
        id: "question-19b",
        property: "ted_h_b__operaciones_o_produccion_de_bienes_servicios_y_control_de_su_calidad___de_acuerdo_a_la_sig",
        type: "radio",
        weight: 5,
        dimension: 4,
        title: "19. De acuerdo a la siguiente escala, indique cuál es el nivel de digitalización de los siguientes procesos:",
        question: "b. Operaciones o producción de bienes/servicios y control de su calidad",
        options: [
          { value: "Se realizan todos en forma manual", score: 0 },
          { value: "La mayoría son manuales, pero hay algunos digitales", score: 30 },
          { value: "Cerca de la mitad son digitales", score: 60 },
          { value: "Prácticamente todos los procesos están digitalizados", score: 100 }
        ],
        answer: '',
        answers: []
      },
      {
        id: "question-19c",
        property: "ted_h_c__logisticos__recepcion__almacenamiento__seguimiento_de_pedidos__transporte__manejo_de_inven",
        type: "radio",
        weight: 5,
        dimension: 4,
        title: "19. De acuerdo a la siguiente escala, indique cuál es el nivel de digitalización de los siguientes procesos:",
        question: "c. Logísticos (recepción, almacenamiento, seguimiento de pedidos, transporte, manejo de inventarios, control de calidad)",
        options: [
          { value: "Se realizan todos en forma manual", score: 0 },
          { value: "La mayoría son manuales, pero hay algunos digitales", score: 30 },
          { value: "Cerca de la mitad son digitales", score: 60 },
          { value: "Prácticamente todos los procesos están digitalizados", score: 100 }
        ],
        answer: '',
        answers: []
      },
      {
        id: "question-19d",
        property: "ted_h_d__contables_y_administrativos__registros_y_manejo_de_informacion__reportes__estados_financie",
        type: "radio",
        weight: 5,
        dimension: 4,
        title: "19. De acuerdo a la siguiente escala, indique cuál es el nivel de digitalización de los siguientes procesos:",
        question: "d. Contables y administrativos (registros y manejo de información, reportes, estados financieros, cobranzas etc.)",
        options: [
          { value: "Se realizan todos en forma manual", score: 0 },
          { value: "La mayoría son manuales, pero hay algunos digitales", score: 30 },
          { value: "Cerca de la mitad son digitales", score: 60 },
          { value: "Prácticamente todos los procesos están digitalizados", score: 100 }
        ],
        answer: '',
        answers: []
      },
      {
        id: "question-19e",
        property: "ted_h_e__gestion_de_personas__ejemplo__remuneraciones__evaluacion_de_desempeno__capacitacion__etc__",
        type: "radio",
        weight: 5,
        dimension: 4,
        title: "19. De acuerdo a la siguiente escala, indique cuál es el nivel de digitalización de los siguientes procesos:",
        question: "e. Gestión de personas (ejemplo: Remuneraciones, evaluación de desempeño, capacitación, etc.)",
        options: [
          { value: "Se realizan todos en forma manual", score: 0 },
          { value: "La mayoría son manuales, pero hay algunos digitales", score: 30 },
          { value: "Cerca de la mitad son digitales", score: 60 },
          { value: "Prácticamente todos los procesos están digitalizados", score: 100 }
        ],
        answer: '',
        answers: []
      },
      {
        id: "question-20",
        property: "ted_h_cual_de_las_siguientes_opciones_refleja_mejor_la_realidad_de_su_empresa_en_cuanto_a_las_compe",
        type: "radio",
        weight: 5,
        dimension: 3,
        question: "20. Cuál de las siguientes opciones refleja mejor la realidad de su empresa en cuanto a las competencias digitales de las personas que trabajan en ella:",
        options: [
          { value: "Las competencias digitales de las personas que trabajan en nuestra empresa son muy limitadas y no contamos con apoyo externo para desarrollarlas e impulsar el uso de tecnologías.", score: 0 },
          { value: "Sólo algunas personas cuentan con competencias digitales, pero tenemos un equipo dedicado a impulsar la adopción de herramientas tecnológicas.", score: 30 },
          { value: "La mayoría de las personas cuentan con las competencias digitales suficientes para que la organización adopte herramientas tecnológicas. No contamos con apoyo externo para impulsar la adopción de herramientas tecnológicas.", score: 60 },
          { value: "La mayoría de las personas cuentan con competencias digitales y además tenemos un equipo dedicado a impulsar la adopción de herramientas digitales.", score: 100 }
        ],
        answer: '',
        answers: []
      }          
    ]),

    get percentage() {
      return Math.round(((this.currentQuestionIndex + 1) / this.questions.length) * 100) || 0;
    },

    calculateDimensionsPercentage() {
      // Object to hold the count of total and answered questions per dimension
      let dimensionCounts = {};

      // Iterate over all questions to populate dimensionCounts
      this.questions.forEach(question => {
        // Skip questions without a dimension or with dimension 0
        if (!question.dimension || question.dimension === 0) return;

        // Initialize the dimension in dimensionCounts if it doesn't exist
        if (!dimensionCounts[question.dimension]) {
          dimensionCounts[question.dimension] = { total: 0, answered: 0 };
        }

        // Increment total questions for this dimension
        dimensionCounts[question.dimension].total++;

        // Check if the question has been answered and increment accordingly
        if (question.answers && question.answers.length > 0) {
          dimensionCounts[question.dimension].answered++;
        }
      });

      // Calculate the percentage for each dimension and store it
      Object.keys(dimensionCounts).forEach(dimension => {
        const { total, answered } = dimensionCounts[dimension];
        const percentage = total > 0 ? Math.round((answered / total) * 100) : 0;
        // Store the calculated percentage in the dimensions object
        if (this.dimensions[dimension]) {
          this.dimensions[dimension].progress = percentage;
        }
      });
    },

    // Reset all variables to their initial state and go back to the home page
    startOver() {
      this.page = 'home';
      this.showStartOverModal = false;
      this.name = '';
      this.email = '';
      this.rut = '';
      this.firstname = '';
      this.lastname = '';
      this.company = '';
      this.currentQuestionIndex = 0;
      this.score = 0;
      this.stage = '';
      this.errors = [];
      this.questions = this.questions.map(question => {
        question.answers = [];
        question.answer = null;
        return question;
      });

      // Remove the c parameter from the URL
      const url = new URL(window.location.href);
      url.searchParams.delete('c');
      window.history.replaceState({}, document.title, url);
    },

    isValidRUT(rut) {
      // console.log("inputElem", inputElem.value)
      // Remove dots and hyphen
      let cleanRUT = rut.replace(/\./g, '').replace('-', '');
      
      if (cleanRUT.length < 8 || cleanRUT.length > 9) {
        return false;
      }

      // Separate body and check digit
      let body = cleanRUT.slice(0, -1);
      let checkDigit = cleanRUT.slice(-1).toUpperCase();

      // Reverse body and multiply each digit by 2, 3, 4, 5, 6, 7, 2, 3, ...
      let multiplier = 2;
      let sum = 0;
      for (let i = body.length - 1; i >= 0; i--) {
        sum += parseInt(body.charAt(i)) * multiplier;
        multiplier = multiplier === 7 ? 2 : multiplier + 1;
      }

      // Calculate modulo 11
      let modulo = 11 - (sum % 11);

      // Determine the correct check digit
      let calculatedCheckDigit = modulo === 11 ? '0' : modulo === 10 ? 'K' : String(modulo);

      // Compare the calculated check digit with the provided one
      return checkDigit === calculatedCheckDigit;
    },

    storeAnswer(event) {
      const currentQuestion = this.questions[this.currentQuestionIndex];
      const answerValue = event.target.value;

      if (currentQuestion.type === 'radio') {
        currentQuestion.answer = answerValue;
        currentQuestion.answers = [{ value: answerValue }];
      } else if (currentQuestion.type === 'checkbox') {
        const answerIndex = currentQuestion.answers.findIndex(a => a.value === answerValue);
        if (event.target.checked) {
          if (answerIndex === -1) {
            currentQuestion.answers.push({ value: answerValue });
          }
        } else {
          if (answerIndex !== -1) {
            currentQuestion.answers.splice(answerIndex, 1);
          }
        }
      }

      this.calculateScore();
      this.calculateDimensionsPercentage();
    },

    cleanErrors() {
      this.errors = [];
    },

    async sendQuestionData(question) {
      // The property to update
      const property = question.property; 

      // The value to update the property with
      const answer = 
            question.type === 'radio'  
      ? question.answers[0].value 
      : ';' + question.answers.map(answer => answer.value).join('; ');

      //-- console.log("fetch 1")
      const fetchUrl = '/_hcms/api/store-ted-data';
      
      console.log("fetchUrl ", fetchUrl)
      
      await fetch(fetchUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          properties: {
            email: this.email,
            [property]: answer
          }
        })
      }).catch((error) => {
        // Your error is here!
        console.log(error)
      });;
    },

    async sendDimensionsData() {
      //-- console.log("fetch 2")
      const response = await fetch('/_hcms/api/store-ted-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          properties: {
            email: this.email,
            ted_3_porcentaje_digitalizacion: this.score + '%',
            ted_3_procesos: this.translateDimensionStage(this.dimensions[2]['stage']),
            ted_3_marketing: this.translateDimensionStage(this.dimensions[2]['stage']),
            ted_3_nivel_digitalizacion: this.stage,
            ted_3_flujo_correos: this.mailingStageRange,
            ... this.dimensionsData
          }
        })
      }).catch((error) => {
        // Your error is here!
        console.log(error)
      });;

      console.log("response ", response)

      /*
      console.log("this.email ", this.email)
      console.log(this.score + '%')
      console.log("this.translateDimensionStage(this.dimensions[2]['stage']) ", this.translateDimensionStage(this.dimensions[2]['stage']))
      console.log("this.translateDimensionStage(this.dimensions[2]['stage']) ", this.translateDimensionStage(this.dimensions[2]['stage']))
      console.log("this.stage " + this.stage)
      console.log("this.mailingStageRange " + this.mailingStageRange)
      console.log("this.dimensionsData "+ this.dimensionsData)
*/


      // Check if the response was successful and toggle the surveyCompleted flag
      if (response.ok) {
        this.surveyCompleted = true;
      }
    },

    translateDimensionStage(stage) {
      switch (stage) {
        case 'tradicional':
          return 'BAJO0';
        case 'principiante':
          return 'BAJO1';
        case 'intermedio':
          return 'MEDIO';
        case 'avanzado':
          return 'ALTO';
        default:
          return '';
      }
    },

    calculateScore() {
      let totalScore = 0;
      let totalWeight = 0;
      let dimensionsScore = {};
      this.questions.forEach(question => {
        if (!question.answers || question.answers.length === 0 || question.weight === 0) return;
        let questionScore = 0;
        if (question.type === 'radio') {
          const selectedOption = question.options.find(option => option.value === question.answers[0].value);
          questionScore = selectedOption ? selectedOption.score : 0;
        } else if (question.type === 'checkbox') {
          question.answers.forEach(answer => {
            const optionScore = question.options.find(option => option.value === answer.value)?.score || 0;
            questionScore += optionScore;
          });
        }
        const calculatedScore = questionScore * (question.weight / 100);
        totalScore += calculatedScore;
        totalWeight += question.weight;
        if (question.dimension && this.dimensions[question.dimension]) {
          if (!dimensionsScore[question.dimension]) {
            dimensionsScore[question.dimension] = 0;
          }
          dimensionsScore[question.dimension] += calculatedScore;
        }
      });
      this.score = Math.round(totalScore);
      this.stage = this.getStage(this.score);
      for (const [dimension, score] of Object.entries(dimensionsScore)) {
        this.dimensions[dimension].score = Math.round(score);
        this.dimensions[dimension].stage = this.getStage(score, dimension);
        this.dimensions[dimension].gap = this.getGap(score, this.dimensions[dimension].weight);
      }
    },

    getStage(score, dimension) {
      for (const [stageName, stageDetails] of Object.entries(this.stages)) {
        const range = stageDetails.ranges[dimension] || stageDetails.ranges['total'];
        if (score >= range[0] && score <= range[1]) {
          return stageName;
        }
      }
    },

    previousQuestion() {
      if (this.currentQuestionIndex === 0) {
        return;
      }

      this.currentQuestionIndex--;
    },

    nextQuestion() {
      $('.btn-prev').hide();
      $('.btn-next').hide();
      
      setTimeout(function() {
        $('.btn-prev').show();
        $('.btn-next').show();
      }, 2000);
      
      const currentQuestion = this.questions[this.currentQuestionIndex];

      // Validate that the current question is answered
      if ((currentQuestion.type === 'radio' && !currentQuestion.answer) ||
          (currentQuestion.type === 'checkbox' && currentQuestion.answers.length === 0)) {
        this.errors = ['Debes seleccionar al menos una opción'];
        return false;
      }

      // Clean errors
      this.cleanErrors();

      // Send question data
      this.sendQuestionData(currentQuestion);

      // Check if it's the last question
      if (this.currentQuestionIndex === this.questions.length - 1) {
        this.showResults();
      } else {
        // Move to the next question
        this.currentQuestionIndex++;
      }
    },

    parseFullName(fullName) {
      const names = fullName.trim().split(/\s+/);

      if (names.length > 2) {
        this.firstname = names.slice(0, -2).join(' '); // Joins all names except the last two as the first name
        this.lastname = names.slice(-2).join(' '); // Joins the last two names as the last name
      } else if (names.length === 2) {
        this.firstname = names[0];
        this.lastname = names[1];
      } else {
        // Assuming only one name is given, treat it as the first name
        this.firstname = fullName;
        this.lastname = ''; // No last name available
      }
    },        

    async submitUserData(event) {
      let inputElem = document.querySelector("#rut");
      inputElem.value = inputElem.value.replace(/\./g, '');
      // console.log("inputElem.value.length ", inputElem.value.length)
      // Validate Rut
      if (!this.isValidRUT(this.rut)) {
        this.errors = ['El RUT ingresado no es válido'];
        return;
      }

      this.cleanErrors();

      this.parseFullName(this.name);

      this.page = 'survey';

      //-- console.log("fetch 3")
      await fetch('/_hcms/api/store-ted-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          properties: {
            firstname: this.firstname,
            lastname: this.lastname,
            email: this.email,
            ted_3_rut: this.rut,
            company: this.company,
            inicio_del_test__ted_: true,
          }
        })
      }).catch((error) => {
        // Your error is here!
        console.log(error)
      });;
    },

    getGap(score, weight) {
      const maxScore = weight;
      const scoreDifference = maxScore - score;

      if (scoreDifference <= 0) return 0;

      const gap = scoreDifference / maxScore * 100;

      return 100 - Math.round(gap);
    },

    renderForm(formId) {
      hbspt.forms.create({
        portalId: '7800319', // HubSpot Portal ID
        formId: formId,
        target: '#dynamic-form-container'
      });

      this.hasForm = true;
    },

    showResults() {
      //-- console.log("showResults")
      this.page = 'results';

      this.stage = this.getStage(this.score);

      if (! this.surveyCompleted) {
        //-- console.log("sendDimensionsData")
        this.sendDimensionsData();
      }

      this.mailingStageRange = this.translateDimensionStage(this.dimensions[2]['stage']) + '-' + this.translateDimensionStage(this.dimensions[4]['stage']);

      //-- console.log(this.postSurveyFormIds)
      //-- console.log("this.postSurveyFormIds[this.mailingStageRange]", this.postSurveyFormIds[this.mailingStageRange])

      if (this.postSurveyFormIds[this.mailingStageRange]) {
        //-- console.log("renderForm")
        this.renderForm(this.postSurveyFormIds[this.mailingStageRange]);
      }

      let resultsGauge = window.Gauge(
        document.getElementById('results-gauge'), {
          max: 100,
          dialStartAngle: 180,
          dialEndAngle: 0,
          value: 0,
          label: function(value) {
            return Math.round(value) + '%';
          },
          color: function(value) {
            if (value < 13.75) {
              return "#e83642";
            } else if (value < 41.25) {
              return "#f4b21e";
            } else if (value < 69.5) {
              return "#00953f";
            } else {
              return "#1d4ed8";
            }
          }
        }
      );

      setInterval(() => {
        resultsGauge.setValueAnimated(this.score);
      }, 100);
    },

    async updatePropertiesFromAPI(contactId) {
      try {
        // console.log("fetch 4")
        const response = await fetch('/_hcms/api/get-contact-ted-properties', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            contactId: contactId
          })
        }).catch((error) => {
          // Your error is here!
          console.log(error)
        });;

        if (!response.ok) {
          throw new Error('Failed to fetch contact properties');
        }

        const data = await response.json();

        // console.log(data)

        // Update local state with fetched data
        this.name = data.firstname + ' ' + data.lastname;
        this.email = data.email;
        this.rut = data.ted_3_rut;
        this.firstname = data.firstname;
        this.lastname = data.lastname;
        this.company = data.company;
        this.score = data.ted_3_porcentaje_digitalizacion.replace('%', '') || 0;
        this.stage = data.ted_3_nivel_digitalizacion || '';
        this.mailingStageRange = data.ted_3_flujo_correos || '';

        // Populate questions with fetched data
        this.questions = this.questions.map((question, index) => {
          const property = question.property;
          if (property in data) {
            question.answer = data[property];
            question.answers = [{
              value: data[property]
            }];
          }
          return question;
        });

        for (i = 1; i <= 5; i++) {
          this.dimensions[i].score = data['ted_3_dimension_' + i + '_posicion_score'];
          this.dimensions[i].stage = this.getStage(this.dimensions[i].score, i);
          this.dimensions[i].gap = this.getGap(this.dimensions[i].score, this.dimensions[i].weight);
        }

        this.surveyCompleted = true;
        this.showResults();
      } catch (error) {
        console.error('Error fetching contact properties:', error);
      }
    },

    init() {
      this.postSurveyFormIds = JSON.parse(document.getElementById('form-ids').textContent);

      // Check if the user is coming from a results page
      const urlParams = new URLSearchParams(window.location.search);
      
      // console.log(this.postSurveyFormIds)
      // console.log(urlParams)

      if (urlParams.has('c')) {
        this.contactId = urlParams.get('c');
        this.updatePropertiesFromAPI(this.contactId);
        return;
      }

      if (this.page === 'results') {
        this.showResults();
      }
    }
  }));


  const cleanRut = () => {
    const rutEmpresa = document.querySelector('#rut');
    if(rutEmpresa) {
      console.log("empresa");
      rutEmpresa.addEventListener('paste', function(event) {
        event.preventDefault();

        const pasteText = (event.clipboardData || window.clipboardData).getData('text');

        const cleanText = pasteText.replace(/[^a-zA-Z0-9\-]/g, '');

        document.execCommand('insertText', false, cleanText);
      });
    }
  }

  cleanRut();


  ///////////
  $("#rut").bind({
    keydown: function(e) {
      if (e.which==190) {
        return false;
      }
      return true;
    }
  });
  
  $('.btn-next').click(function() {
    $(this).hide();
    console.log("hide")
    
    setTimeout(function() {
      $(this).show();
      console.log("show")
    }, 1000);
  })

});
