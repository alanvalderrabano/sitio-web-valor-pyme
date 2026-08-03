// Mapa "flujo de correos" -> formulario de HubSpot que se renderiza al final del test.
//
// La clave es `<etapa dimensión 2>-<etapa dimensión 4>`, es decir
// <Marketing/Ventas>-<Procesos>, usando los códigos BAJO0 / BAJO1 / MEDIO / ALTO.
// Estos IDs son los del portal 7800319 y vienen del <script id="form-ids"> de la página original.
//
// Contrastado contra "Combinaciones_ Programa Pyme Digital [TED].xlsx", hoja "Programa PD 2024":
// las 11 entradas de abajo ofrecen exactamente los talleres que pide el negocio, con dos salvedades
// anotadas en su línea. Las 5 combinaciones ausentes NO son todas un error — ver abajo.

export const postSurveyFormIds = {
  'BAJO0-BAJO0': 'f0f33ebb-bc0e-4b52-b962-5743d9df6314',
  'BAJO0-ALTO': 'f0f33ebb-bc0e-4b52-b962-5743d9df6314',
  'BAJO0-BAJO1': '7feed2f0-17e5-44d8-b5a9-3e3222dd6d39',
  'BAJO0-MEDIO': '7feed2f0-17e5-44d8-b5a9-3e3222dd6d39',
  'BAJO1-BAJO0': '46c3bd47-5bf2-4024-911c-0f930773cd66',
  'BAJO1-MEDIO': '5f1087ba-1204-422f-8336-3bc0693143e9',
  'BAJO1-BAJO1': '5f1087ba-1204-422f-8336-3bc0693143e9',
  'BAJO1-ALTO': '2c887494-10c1-4802-9436-4595a8e8be52',
  // El negocio pide Marketing + Modelo de Negocios; este formulario lista además
  // Digitalización de Procesos. Sobra una opción — se corrige en el portal, no aquí.
  'MEDIO-BAJO0': '579e11f9-dd9d-4c14-9444-fd4fc94fc483',
  'MEDIO-BAJO1': 'd0516f67-7859-4cd2-8dfd-1ef9e6622c20',
  'MEDIO-MEDIO': 'd0516f67-7859-4cd2-8dfd-1ef9e6622c20',

  // PENDIENTE 'MEDIO-ALTO': el negocio sí define taller ("Marketing Digital eCommerce", él solo).
  // Ninguno de los 7 formularios existentes sirve: el más cercano (d0516f67) añade Procesos.
  // Hace falta crear el octavo formulario en el portal y pegar aquí su ID.

  // ALTO-BAJO0 / ALTO-BAJO1 / ALTO-MEDIO / ALTO-ALTO: ausentes A PROPÓSITO. El Excel marca
  // "N/A" en la columna Taller para las cuatro: a ese perfil no le corresponde ninguno.
  // No inventar un formulario de respaldo aquí; lo que falta definir es qué ve en pantalla
  // al terminar el test, que hoy es nada.
};
