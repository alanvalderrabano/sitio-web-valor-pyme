// Configuración de entorno. Único lugar donde se decide contra qué backend habla el test.

export const config = {
  /**
   * Rutas de las serverless functions. En HubSpot viven bajo /_hcms/api/;
   * el servidor mock de este proyecto expone exactamente las mismas rutas,
   * así que el front no necesita saber dónde está corriendo.
   */
  endpoints: {
    storeTedData: '/_hcms/api/store-ted-data',
    getContactTedProperties: '/_hcms/api/get-contact-ted-properties',
  },

  /**
   * Portal de HubSpot del sitio original. Solo se usa para construir los formularios
   * de descarga; con `useMockForms: true` no se contacta a HubSpot en absoluto.
   */
  hubspot: {
    portalId: '7800319',
    useMockForms: true,
  },

  /** Poner en false para que el front deje de persistir en localStorage entre recargas. */
  persistProgress: true,

  /**
   * Modo estático: la build para Cloudflare Pages marca el <html> con data-ted-static
   * porque ahí NO hay backend. En ese modo no se intenta ninguna llamada — el test funciona
   * completo en el navegador, pero las respuestas no se guardan en ningún lado.
   */
  isStatic: typeof document !== 'undefined' && document.documentElement.hasAttribute('data-ted-static'),
};
