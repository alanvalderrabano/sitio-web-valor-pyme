/**
 * HubSpot Serverless Function — Buscador IA de Valor Pyme
 * Endpoint público: POST /_hcms/api/vp-ask
 *
 * Portada desde la Cloudflare Pages Function `functions/api/ask.js`. Se movió a
 * HubSpot para que viva en el mismo dominio que el sitio: /api/ask devolvía 403
 * porque HubSpot no ejecuta las funciones de Cloudflare. Al ser mismo origen, no
 * hace falta CORS.
 *
 * Diferencia con el original: HubSpot devuelve la respuesta completa de una vez
 * (no admite streaming), así que se pide a OpenAI sin `stream` y se responde en
 * JSON. Medido: 1.8–3.3 s por respuesta, holgado frente al límite de 10 s.
 *
 * Configuración:
 *   - OPENAI_API_KEY  obligatorio · `hs secrets add OPENAI_API_KEY`
 *   - OPENAI_MODEL    opcional (gpt-4o-mini por defecto). No se declara en
 *     serverless.json porque no es un secreto y HubSpot exige que todo secreto
 *     declarado exista; para cambiar de modelo, añadirlo ahí y como secreto.
 *
 * Body: { "messages": [ { "role": "user"|"assistant", "content": "..." } ] }
 * Respuesta: { "text": "..." }  ·  errores: { "error": "..." }
 */

const SYSTEM_PROMPT = `Eres el asistente virtual de Valor Pyme, respondiendo dentro de su sitio web (valorpyme.cl). Hablas en español de Chile (es-CL), con un tono cercano, claro y motivador. Tu único tema es Valor Pyme; si te preguntan algo fuera de eso, redirígelo amablemente a lo que sí puedes ayudar.

QUÉ ES VALOR PYME
- Una red de soluciones y comunidad gratuita para emprendedores y pymes de Chile. Idea central: "Emprender es siempre un viaje" y Valor Pyme acompaña ese viaje conectando a las pymes con herramientas, oportunidades, formación, beneficios y una comunidad.
- Sumarse es SIN COSTO. Es la mayor comunidad de emprendedores y pymes de Chile, con más de 150.000 visitas al mes y recursos gratuitos.

LAS 4 RUTAS (soluciones organizadas por desafío)
1. Ruta Capital — Financiamiento y capital: ordenar las cuentas, entender la situación financiera y recuperar pagos pendientes. "Tu caja también necesita una ruta."
2. Ruta Mercado — Conexión comercial y mercado: vender online, mejorar despachos/logística y conectar con oportunidades comerciales. "Abre nuevos caminos para vender."
3. Ruta Digitalización — Ordenar la gestión, automatizar tareas y decidir mejor con herramientas simples. "Digitaliza tu negocio sin complicarte."
4. Ruta Talento y Gestión — Formación, liderazgo, desarrollo del equipo y mejor gestión. "Profesionaliza la gestión de tu negocio."
Quien no sepa qué ruta elegir puede usar el diagnóstico del sitio o explorar las cuatro.

ALIADOS (el "motor del viaje": empresas e instituciones con soluciones y beneficios para la comunidad)
Bci (inclusión y educación financiera), Walmart Marketplace (canales de venta), Blue Express (logística y distribución), Defontana (ERP gratis para digitalizar la gestión), Microsoft (tecnología e IA), Pyme UC / Facultad de Economía y Administración UC (formación y mentorías), OTIC CChC (capacitación), Multigremial Nacional (gremio que representa a las pymes). Entre otros.

CÓMO EMPEZAR (3 pasos)
1) Crea tu cuenta (suscríbete gratis). 2) Completa tu perfil. 3) Explora y conecta con rutas, aliados y contenidos.

CONTACTO
Para consultas, alianzas, prensa o ayuda de la comunidad hay una página de contacto con un formulario por motivo.

REGLAS
- Respuestas breves: 2 a 4 frases. Ve al grano y, cuando aplique, invita a la acción (suscribirse gratis, hacer el diagnóstico, ver una ruta o escribir a contacto).
- NO inventes datos que no tengas: precios exactos, fechas, montos, condiciones específicas de un beneficio, correos o teléfonos. Si no lo sabes, dilo y sugiere la página de contacto.
- No prometas resultados ni des asesoría legal/financiera personalizada; orienta hacia las rutas y aliados.
- Si preguntan por algo ajeno a Valor Pyme, explícalo con amabilidad y reconduce.`;

/* Solo se atiende a peticiones que salgan del propio sitio. No frena un curl
   (la cabecera se puede falsear), pero corta el uso desde otras webs. El límite
   por IP conviene ponerlo en la plataforma.
   Se compara por dominio y no por URL exacta para no romper las vistas previas,
   que se sirven desde subdominios de HubSpot. */
const DOMINIOS_OK = ['valorpyme.cl', 'hs-sites.com', 'hubspotpagebuilder.com'];

function origenPermitido(origen) {
  if (!origen) return true; // sin cabecera Origin no hay nada que validar
  let host;
  try {
    host = new URL(origen).hostname;
  } catch (e) {
    return false;
  }
  return DOMINIOS_OK.some((d) => host === d || host.endsWith('.' + d));
}

exports.main = async (context, sendResponse) => {
  const responder = (statusCode, body) =>
    sendResponse({ statusCode, body, headers: { 'Cache-Control': 'no-store' } });

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return responder(500, { error: 'Falta configurar OPENAI_API_KEY.' });
  }

  const headers = context.headers || {};
  if (!origenPermitido(headers.origin || headers.Origin || '')) {
    return responder(403, { error: 'Origen no permitido.' });
  }

  // context.body ya viene parseado cuando el Content-Type es JSON.
  const body = typeof context.body === 'string' ? safeParse(context.body) : context.body;
  const incoming = body && Array.isArray(body.messages) ? body.messages : null;
  if (!incoming || !incoming.length) {
    return responder(400, { error: 'Falta "messages".' });
  }

  // Saneo: solo user/assistant, contenido string y acotado; máx. 8 turnos.
  const cleaned = incoming
    .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
    .slice(-8)
    .map((m) => ({ role: m.role, content: m.content.slice(0, 1000) }));

  if (!cleaned.length) {
    return responder(400, { error: 'No hay mensajes válidos.' });
  }

  const messages = [{ role: 'system', content: SYSTEM_PROMPT }, ...cleaned];
  const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';

  let openaiRes;
  try {
    openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      // Sin `stream`: HubSpot entrega la respuesta de una vez.
      body: JSON.stringify({ model, messages, temperature: 0.3, max_tokens: 500 }),
    });
  } catch (e) {
    return responder(502, { error: 'No se pudo conectar con OpenAI.' });
  }

  if (!openaiRes.ok) {
    const detail = await openaiRes.text().catch(() => '');
    return responder(502, { error: 'OpenAI respondió con error: ' + detail.slice(0, 300) });
  }

  let data;
  try {
    data = await openaiRes.json();
  } catch (e) {
    return responder(502, { error: 'Respuesta de OpenAI ilegible.' });
  }

  const text =
    data && data.choices && data.choices[0] && data.choices[0].message
      ? String(data.choices[0].message.content || '').trim()
      : '';

  if (!text) {
    return responder(502, { error: 'OpenAI no devolvió contenido.' });
  }

  return responder(200, { text });
};

function safeParse(s) {
  try {
    return JSON.parse(s);
  } catch (e) {
    return null;
  }
}
