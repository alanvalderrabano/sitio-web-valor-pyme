// Test de PARIDAD: corre el bundle minificado original de HubSpot dentro de un sandbox
// y compara sus resultados con los de src/lib/scoring.js sobre cientos de cuestionarios
// llenados al azar (con semilla fija, así que es determinista).
//
//   npm test
//
// Si esto falla, la copia local dejó de calcular igual que el sitio real.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { calculateScore, getStage, getGap } from '../src/lib/scoring.js';
import { isValidRUT, parseFullName } from '../src/lib/rut.js';
import { questions as questionsConfig } from '../src/config/questions.js';
import { stages } from '../src/config/stages.js';
import { dimensions as dimensionsConfig } from '../src/config/dimensions.js';

const HERE = path.dirname(fileURLToPath(import.meta.url));

// --------------------------------------------------------------- sandbox del original

/** Ejecuta el bundle original con un Alpine y un jQuery falsos, y devuelve el objeto del componente. */
function loadOriginalComponent() {
  const source = fs.readFileSync(path.join(HERE, 'fixtures', 'module_valor-pyme-ted.min.js'), 'utf8');
  const listeners = [];
  let component = null;

  const sandbox = {
    document: {
      addEventListener: (_event, fn) => listeners.push(fn),
      getElementById: () => ({ textContent: '{}' }),
      querySelector: () => null,
    },
    window: {
      Alpine: { data: (_name, factory) => { component = factory(); }, $persist: (v) => v },
    },
    $: () => ({ bind() {}, click() {}, hide() {}, show() {} }),
  };

  new Function('document', 'window', '$', source)(sandbox.document, sandbox.window, sandbox.$);
  listeners.forEach((fn) => fn());

  assert.ok(component, 'no se pudo instanciar el componente original');
  return component;
}

// --------------------------------------------------------------- generador determinista

/** PRNG con semilla (mulberry32) para que la corrida sea reproducible. */
function seededRandom(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Rellena una copia del cuestionario con respuestas al azar. */
function fillQuestions(random) {
  return structuredClone(questionsConfig).map((question) => {
    if (question.type === 'radio') {
      const option = question.options[Math.floor(random() * question.options.length)];
      question.answer = option.value;
      question.answers = [{ value: option.value }];
    } else {
      // Al menos una opción marcada, como exige la validación de nextQuestion().
      const picked = question.options.filter(() => random() < 0.4);
      if (picked.length === 0) picked.push(question.options[0]);
      question.answers = picked.map((o) => ({ value: o.value }));
    }
    return question;
  });
}

// --------------------------------------------------------------- tests

test('el banco de preguntas conserva las 31 preguntas del original', () => {
  const original = loadOriginalComponent();
  assert.equal(questionsConfig.length, 31);
  assert.equal(questionsConfig.length, original.questions.length);
  assert.deepEqual(
    questionsConfig.map((q) => q.id),
    original.questions.map((q) => q.id),
  );
});

test('los rangos, ids y etiquetas de las etapas son idénticos a los del original', () => {
  const original = loadOriginalComponent();

  // Se compara TODO menos `color`, que es presentación y sí cambió a propósito (ver abajo).
  const sinColor = (etapas) =>
    Object.fromEntries(Object.entries(etapas).map(([k, { color, ...resto }]) => [k, resto]));

  assert.deepEqual(sinColor(stages), sinColor(original.stages));
  assert.deepEqual(dimensionsConfig, original.dimensions);
});

test('los colores de etapa usan la paleta del theme Valor Pyme 2026', () => {
  // Divergencia deliberada: se conserva la lectura de semáforo pero con hex de marca.
  // "Avanzado" usa el morado corporativo porque la marca no tiene azul.
  assert.equal(stages.tradicional.color, '#FF2B5E');
  assert.equal(stages.principiante.color, '#FF8500');
  assert.equal(stages.intermedio.color, '#00BD70');
  assert.equal(stages.avanzado.color, '#6126FF');
});

test('calculateScore coincide con el original en 300 cuestionarios al azar', () => {
  const original = loadOriginalComponent();
  const random = seededRandom(20260729);

  for (let run = 0; run < 300; run++) {
    const filled = fillQuestions(random);

    // --- original: muta su propio estado ---
    original.questions = structuredClone(filled);
    original.dimensions = structuredClone(dimensionsConfig);
    original.calculateScore();

    // --- copia local ---
    const mine = calculateScore({
      questions: filled,
      dimensions: structuredClone(dimensionsConfig),
      stages,
    });

    assert.equal(mine.score, original.score, `run ${run}: puntaje global`);
    assert.equal(mine.stage, original.stage, `run ${run}: etapa global`);

    for (const key of Object.keys(dimensionsConfig)) {
      assert.equal(mine.byDimension[key].score, original.dimensions[key].score, `run ${run}: score dim ${key}`);
      assert.equal(mine.byDimension[key].stage, original.dimensions[key].stage, `run ${run}: stage dim ${key}`);
      assert.equal(mine.byDimension[key].gap, original.dimensions[key].gap, `run ${run}: gap dim ${key}`);
    }
  }
});

test('getStage mapea los bordes de cada rango total', () => {
  assert.equal(getStage(stages, 0), 'tradicional');
  assert.equal(getStage(stages, 13.75), 'tradicional');
  assert.equal(getStage(stages, 13.76), 'principiante');
  assert.equal(getStage(stages, 41.25), 'principiante');
  assert.equal(getStage(stages, 41.26), 'intermedio');
  assert.equal(getStage(stages, 69.5), 'intermedio');
  assert.equal(getStage(stages, 69.51), 'avanzado');
  assert.equal(getStage(stages, 100), 'avanzado');
});

test('sin clamp, getStage reproduce el hueco del original fuera de rango', () => {
  // Puntaje perfecto: el total llega a 101 y la dimensión 5 a 26,25 — ambos fuera de rango.
  assert.equal(getStage(stages, 101), undefined);
  assert.equal(getStage(stages, 26.25, 5), undefined);
});

test('con clamp, todo puntaje recibe una etapa', () => {
  assert.equal(getStage(stages, 101, undefined, { clamp: true }), 'avanzado');
  assert.equal(getStage(stages, 26.25, 5, { clamp: true }), 'avanzado');
  assert.equal(getStage(stages, -5, undefined, { clamp: true }), 'tradicional');
  // dentro de rango el clamp no cambia nada
  assert.equal(getStage(stages, 50, undefined, { clamp: true }), getStage(stages, 50));
});

test('respondiendo todo al máximo, ninguna dimensión queda sin etapa', () => {
  const maximas = structuredClone(questionsConfig).map((question) => {
    if (question.type === 'radio') {
      const mejor = question.options.reduce((a, b) => ((b.score ?? 0) > (a.score ?? 0) ? b : a));
      question.answer = mejor.value;
      question.answers = [{ value: mejor.value }];
    } else {
      question.answers = question.options.map((o) => ({ value: o.value }));
    }
    return question;
  });

  const conClamp = calculateScore({ questions: maximas, dimensions: dimensionsConfig, stages, clamp: true });
  assert.equal(conClamp.stage, 'avanzado');
  for (const key of Object.keys(dimensionsConfig)) {
    assert.equal(conClamp.byDimension[key].stage, 'avanzado', `dimensión ${key}`);
  }

  // ...mientras que el original deja el total y la dimensión 5 sin etapa
  const sinClamp = calculateScore({ questions: maximas, dimensions: dimensionsConfig, stages });
  assert.equal(sinClamp.stage, undefined);
  assert.equal(sinClamp.byDimension[5].stage, undefined);
  assert.ok(sinClamp.score > 100, `el puntaje se pasa de 100: ${sinClamp.score}`);
});

test('getGap devuelve 0 al alcanzar el peso máximo de la dimensión', () => {
  assert.equal(getGap(20, 20), 0);
  assert.equal(getGap(25, 20), 0);
  assert.equal(getGap(10, 20), 50);
  assert.equal(getGap(0, 20), 0); // el original devuelve 100-100 = 0 también aquí
});

test('isValidRUT acepta RUTs válidos y rechaza los inválidos', () => {
  assert.equal(isValidRUT('12.345.678-5'), true);
  assert.equal(isValidRUT('123456785'), true);
  assert.equal(isValidRUT('12.345.678-9'), false);
  assert.equal(isValidRUT('1234'), false);
  assert.equal(isValidRUT(''), false);
});

test('parseFullName toma las dos últimas palabras como apellidos', () => {
  assert.deepEqual(parseFullName('Ana Pérez'), { firstname: 'Ana', lastname: 'Pérez' });
  assert.deepEqual(parseFullName('Ana María Pérez Soto'), { firstname: 'Ana María', lastname: 'Pérez Soto' });
  assert.deepEqual(parseFullName('Ana'), { firstname: 'Ana', lastname: '' });
});
