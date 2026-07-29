// Mapa "flujo de correos" -> formulario de HubSpot que se renderiza al final del test.
//
// La clave es `<etapa dimensión 2>-<etapa dimensión 4>`, es decir
// <Marketing/Ventas>-<Procesos>, usando los códigos BAJO0 / BAJO1 / MEDIO / ALTO.
// Estos IDs son los del portal 7800319 y vienen del <script id="form-ids"> de la página original.
//
// OJO: el mapa está incompleto — faltan las 5 combinaciones que empiezan con ALTO
// y las MEDIO-ALTO. Ver docs/ANALISIS.md § "Inconsistencias detectadas".

export const postSurveyFormIds = {
  'BAJO0-BAJO0': 'f0f33ebb-bc0e-4b52-b962-5743d9df6314',
  'BAJO0-ALTO': 'f0f33ebb-bc0e-4b52-b962-5743d9df6314',
  'BAJO0-BAJO1': '7feed2f0-17e5-44d8-b5a9-3e3222dd6d39',
  'BAJO0-MEDIO': '7feed2f0-17e5-44d8-b5a9-3e3222dd6d39',
  'BAJO1-BAJO0': '46c3bd47-5bf2-4024-911c-0f930773cd66',
  'BAJO1-MEDIO': '5f1087ba-1204-422f-8336-3bc0693143e9',
  'BAJO1-BAJO1': '5f1087ba-1204-422f-8336-3bc0693143e9',
  'BAJO1-ALTO': '2c887494-10c1-4802-9436-4595a8e8be52',
  'MEDIO-BAJO0': '579e11f9-dd9d-4c14-9444-fd4fc94fc483',
  'MEDIO-BAJO1': 'd0516f67-7859-4cd2-8dfd-1ef9e6622c20',
  'MEDIO-MEDIO': 'd0516f67-7859-4cd2-8dfd-1ef9e6622c20',
};

/**
 * DIVERGENCIA vs. el original: allí, si la combinación no está en el mapa, no se renderiza
 * ningún formulario y el usuario termina el test sin poder pedir su informe — le pasa a toda
 * pyme con resultado ALTO en Marketing. Aquí se cae a este formulario por defecto.
 * Al llevarlo a producción, reemplazar por los formIds reales de las 6 combinaciones que faltan.
 */
export const fallbackFormId = 'd0516f67-7859-4cd2-8dfd-1ef9e6622c20';
