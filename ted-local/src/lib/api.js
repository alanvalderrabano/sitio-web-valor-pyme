// Cliente de las serverless functions. En producción (HubSpot) escribe en el CRM;
// en local pega contra server/mock-api.mjs, que guarda en server/data/contacts.json.

import { config } from '../config/api.config.js';

async function postJSON(url, payload) {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error(`${url} respondió ${response.status}`);
  }
  return response;
}

/**
 * Upsert de propiedades del contacto. El original dispara esto en cada "Siguiente",
 * ignorando los errores para no bloquear al usuario; mantenemos ese comportamiento
 * pero dejamos rastro en consola.
 */
export async function storeTedData(properties) {
  try {
    return await postJSON(config.endpoints.storeTedData, { properties });
  } catch (error) {
    console.warn('[ted] no se pudo guardar la respuesta:', error.message);
    return null;
  }
}

/** Recupera un test ya respondido para reconstruir la pantalla de resultados (?c=<contactId>). */
export async function getContactTedProperties(contactId) {
  const response = await postJSON(config.endpoints.getContactTedProperties, { contactId });
  return response.json();
}
