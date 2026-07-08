/**
 * Cloudflare Pages Function — Buscador IA de Valor Pyme
 * Ruta pública: POST /api/ask
 *
 * Proxy seguro a OpenAI: la API key vive como variable de entorno del
 * proyecto de Cloudflare Pages (NUNCA en el repo ni en el cliente).
 *
 * Variables de entorno (Cloudflare → Pages → Settings → Environment variables):
 *   - OPENAI_API_KEY   (secreto, obligatorio)  → sk-...
 *   - OPENAI_MODEL     (opcional)              → por defecto "gpt-4o-mini"
 *
 * Body esperado: { "messages": [ { "role": "user"|"assistant", "content": "..." }, ... ] }
 * Respuesta: stream de texto plano (los deltas del modelo), para escribirlo en vivo.
 */

const SYSTEM_PROMPT = `Eres el asistente virtual de Valor Pyme, respondiendo dentro de su sitio web (valorpyme.cl). Hablas en español de Chile (es-CL), con un tono cercano, claro y motivador. Tu único tema es Valor Pyme; si te preguntan algo fuera de eso, redirígelo amablemente a lo que sí puedes ayudar.

QUÉ ES VALOR PYME
- Una red de soluciones y comunidad gratuita para emprendedores y pymes de Chile. Idea central: "Emprender es siempre un viaje" y Valor Pyme acompaña ese viaje conectando a las pymes con herramientas, oportunidades, formación, beneficios y una comunidad.
- Sumarse es SIN COSTO. Es la mayor comunidad de emprendedores y pymes de Chile, con más de 150.000 visitas al mes y recursos gratuitos.

LAS 4 RUTAS (soluciones organizadas por desafío)
1. Ruta Capital — Financiamiento y capital: bancarización, acceso a servicios financieros, perfil financiero y cobranza. "Ordena tu caja, prepara tu ruta."
2. Ruta Mercado — Conexión comercial y mercado: vender online, mejorar despachos/logística y conectar con oportunidades comerciales. "Abre nuevos caminos para vender."
3. Ruta Digitalización — Ordenar la gestión, automatizar tareas y decidir mejor con herramientas simples. "Digitaliza tu negocio sin complicarte."
4. Ruta Talento y Gestión — Formación, liderazgo, desarrollo del equipo y mejor gestión. "Profesionaliza la gestión de tu negocio."
Quien no sepa qué ruta elegir puede usar el diagnóstico del sitio o explorar las cuatro.

ALIADOS (el "motor del viaje": empresas e instituciones con soluciones y beneficios para la comunidad)
Bci (inclusión y educación financiera), Walmart Marketplace (canales de venta), Blue Express (logística y distribución), Defontana (ERP gratis para digitalizar la gestión), Microsoft (tecnología e IA), Pyme UC / Facultad de Economía y Administración UC (formación y mentorías), OTIC CChC (capacitación), Multigremial Nacional (gremio que representa a las pymes). Entre otros.

CÓMO EMPEZAR (3 pasos)
1) Crea tu cuenta (suscríbete gratis). 2) Completa tu perfil. 3) Explora y conecta con rutas, aliados y contenidos.

CONTACTO
Para consultas, alianzas, prensa o ayuda de la comunidad hay una página de contacto (/contacto) con un formulario por motivo.

REGLAS
- Respuestas breves: 2 a 4 frases. Ve al grano y, cuando aplique, invita a la acción (suscribirse gratis, hacer el diagnóstico, ver una ruta o escribir a contacto).
- NO inventes datos que no tengas: precios exactos, fechas, montos, condiciones específicas de un beneficio, correos o teléfonos. Si no lo sabes, dilo y sugiere la página de contacto.
- No prometas resultados ni des asesoría legal/financiera personalizada; orienta hacia las rutas y aliados.
- Si preguntan por algo ajeno a Valor Pyme, explícalo con amabilidad y reconduce.`;

function jsonError(message, status) {
  return new Response(JSON.stringify({ error: message }), {
    status: status || 400,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}

export async function onRequestPost(context) {
  const { request, env } = context;

  if (!env.OPENAI_API_KEY) {
    return jsonError('Falta configurar OPENAI_API_KEY en el entorno.', 500);
  }

  let body;
  try {
    body = await request.json();
  } catch (e) {
    return jsonError('Body inválido.', 400);
  }

  const incoming = Array.isArray(body && body.messages) ? body.messages : null;
  if (!incoming || !incoming.length) {
    return jsonError('Falta "messages".', 400);
  }

  // Saneo: solo user/assistant, contenido string y acotado; máx. 8 turnos.
  const cleaned = incoming
    .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
    .slice(-8)
    .map((m) => ({ role: m.role, content: m.content.slice(0, 1000) }));

  if (!cleaned.length) {
    return jsonError('No hay mensajes válidos.', 400);
  }

  const messages = [{ role: 'system', content: SYSTEM_PROMPT }, ...cleaned];
  const model = env.OPENAI_MODEL || 'gpt-4o-mini';

  let openaiRes;
  try {
    openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.3,
        max_tokens: 500,
        stream: true,
      }),
    });
  } catch (e) {
    return jsonError('No se pudo conectar con OpenAI.', 502);
  }

  if (!openaiRes.ok || !openaiRes.body) {
    const detail = await openaiRes.text().catch(() => '');
    return jsonError('OpenAI respondió con error: ' + detail.slice(0, 300), 502);
  }

  // Transforma el stream SSE de OpenAI a texto plano (solo los deltas de contenido).
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  let buffer = '';

  const transform = new TransformStream({
    transform(chunk, controller) {
      buffer += decoder.decode(chunk, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || ''; // deja la última línea parcial en el buffer
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith('data:')) continue;
        const data = trimmed.slice(5).trim();
        if (data === '[DONE]') continue;
        try {
          const json = JSON.parse(data);
          const delta = json.choices && json.choices[0] && json.choices[0].delta;
          const text = delta && delta.content;
          if (text) controller.enqueue(encoder.encode(text));
        } catch (e) {
          /* fragmento incompleto: se ignora, llegará completo en el siguiente chunk */
        }
      }
    },
  });

  return new Response(openaiRes.body.pipeThrough(transform), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Accel-Buffering': 'no',
    },
  });
}
