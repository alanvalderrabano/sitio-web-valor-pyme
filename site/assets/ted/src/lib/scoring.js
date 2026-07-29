// Motor de puntaje del TED. Funciones puras, sin dependencia de Alpine ni del DOM,
// para poder verificarlas con tests/scoring.test.mjs.
//
// PARIDAD: replican exactamente el comportamiento del bundle original, incluidas
// sus rarezas. Ver docs/ANALISIS.md § "Inconsistencias detectadas" antes de "arreglar" algo.

/**
 * Devuelve la etapa (`tradicional|principiante|intermedio|avanzado`) para un puntaje.
 * Si se pasa `dimension`, usa los rangos de esa dimensión; si no, los rangos `total`.
 *
 * Con `clamp: false` (por defecto) es idéntica al original: devuelve `undefined` si el
 * puntaje cae fuera de todos los rangos. Ese caso NO es teórico — con respuestas perfectas
 * el total llega a 101 y la dimensión 5 a 26,25, ambos fuera de rango, y la pantalla de
 * resultados queda en blanco. Ver docs/ANALISIS.md § 4.1.
 *
 * Con `clamp: true` satura al extremo más cercano, que es lo que usa la vista.
 */
export function getStage(stages, score, dimension, { clamp = false } = {}) {
  const entries = Object.entries(stages);

  for (const [stageName, stageDetails] of entries) {
    const range = stageDetails.ranges[dimension] || stageDetails.ranges.total;
    if (score >= range[0] && score <= range[1]) return stageName;
  }

  if (!clamp) return undefined;

  const [firstStage, firstDetails] = entries[0];
  const firstRange = firstDetails.ranges[dimension] || firstDetails.ranges.total;
  return score < firstRange[0] ? firstStage : entries[entries.length - 1][0];
}

/**
 * Porcentaje de avance de una dimensión respecto de su peso máximo.
 * Ojo: el nombre original es "gap" pero devuelve el % ALCANZADO, y 0 cuando ya se llegó al tope.
 */
export function getGap(score, weight) {
  const scoreDifference = weight - score;
  if (scoreDifference <= 0) return 0;
  const gap = (scoreDifference / weight) * 100;
  return 100 - Math.round(gap);
}

/**
 * Puntaje de una sola pregunta, antes de aplicar su peso.
 * - radio: el `score` de la opción elegida.
 * - checkbox: la suma de los `score` de todas las opciones marcadas.
 */
export function questionRawScore(question) {
  if (!question.answers || question.answers.length === 0) return 0;

  if (question.type === 'radio') {
    const selected = question.options.find((o) => o.value === question.answers[0].value);
    return selected ? selected.score : 0;
  }

  if (question.type === 'checkbox') {
    return question.answers.reduce((total, answer) => {
      const option = question.options.find((o) => o.value === answer.value);
      return total + (option?.score || 0);
    }, 0);
  }

  return 0;
}

/**
 * Recorre el cuestionario y devuelve el puntaje global (0-100), la etapa global
 * y el detalle por dimensión (puntaje, etapa y % de avance).
 */
export function calculateScore({ questions, dimensions, stages, clamp = false }) {
  let totalScore = 0;
  const dimensionsScore = {};

  for (const question of questions) {
    if (!question.answers || question.answers.length === 0 || question.weight === 0) continue;

    // El peso viene expresado sobre 100, por eso se divide.
    const calculatedScore = questionRawScore(question) * (question.weight / 100);
    totalScore += calculatedScore;

    if (question.dimension && dimensions[question.dimension]) {
      dimensionsScore[question.dimension] = (dimensionsScore[question.dimension] || 0) + calculatedScore;
    }
  }

  const score = Math.round(totalScore);
  const byDimension = {};

  for (const [dimension, rawScore] of Object.entries(dimensionsScore)) {
    byDimension[dimension] = {
      score: Math.round(rawScore),
      // El original evalúa la etapa con el puntaje SIN redondear, pero guarda el redondeado.
      stage: getStage(stages, rawScore, dimension, { clamp }),
      gap: getGap(rawScore, dimensions[dimension].weight),
    };
  }

  return { score, stage: getStage(stages, score, undefined, { clamp }), byDimension };
}

/**
 * % de preguntas respondidas dentro de cada dimensión. Alimenta las barras de progreso.
 */
export function calculateDimensionsProgress({ questions, dimensions }) {
  const counts = {};

  for (const question of questions) {
    if (!question.dimension || question.dimension === 0) continue;
    counts[question.dimension] ??= { total: 0, answered: 0 };
    counts[question.dimension].total++;
    if (question.answers && question.answers.length > 0) counts[question.dimension].answered++;
  }

  const progress = {};
  for (const [dimension, { total, answered }] of Object.entries(counts)) {
    if (!dimensions[dimension]) continue;
    progress[dimension] = total > 0 ? Math.round((answered / total) * 100) : 0;
  }
  return progress;
}

/** Traduce la etapa interna al código que espera el CRM. */
export function translateDimensionStage(stage) {
  switch (stage) {
    case 'tradicional': return 'BAJO0';
    case 'principiante': return 'BAJO1';
    case 'intermedio': return 'MEDIO';
    case 'avanzado': return 'ALTO';
    default: return '';
  }
}
