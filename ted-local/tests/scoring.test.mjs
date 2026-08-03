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
import { postSurveyFormIds } from '../src/config/forms.js';

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

  // Se compara TODO menos `color`, que es presentación y cambió a propósito.
  const sinColor = (etapas) =>
    Object.fromEntries(Object.entries(etapas).map(([k, { color, ...resto }]) => [k, resto]));

  assert.deepEqual(sinColor(stages), sinColor(original.stages));
});

test('las dimensiones divergen del original SOLO en lo que corrige la spec del cliente', () => {
  const original = loadOriginalComponent();

  for (const k of Object.keys(dimensionsConfig)) {
    assert.equal(dimensionsConfig[k].name, original.dimensions[k].name, `nombre dim ${k}`);
    assert.equal(dimensionsConfig[k].progressProperty, original.dimensions[k].progressProperty);
    assert.equal(dimensionsConfig[k].stageProperty, original.dimensions[k].stageProperty);
  }

  // Divergencia 1 — el original declara 15 para la dimensión 5; la spec dice 25.
  assert.equal(original.dimensions[5].weight, 15);
  assert.equal(dimensionsConfig[5].weight, 25);

  // Ya NO divergimos en scoreProperty. El Excel pedía `ted_3_dimension_N`, pero la consulta al
  // esquema del portal (1-ago-2026) mostró que esas son de marzo de 2023, de otro grupo, y que
  // la 4 ni siquiera existe. Como las 21 propiedades de resultado viajan en un solo POST, una
  // sola inexistente tumbaba el guardado entero. Manda `_posicion_score`, que sí están las 5.
  for (const k of Object.keys(dimensionsConfig)) {
    assert.equal(dimensionsConfig[k].scoreProperty, original.dimensions[k].scoreProperty, `score dim ${k}`);
    assert.match(dimensionsConfig[k].scoreProperty, /_posicion_score$/);
  }
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

test('respondiendo todo al máximo el puntaje es exactamente 100 y todo tiene etapa', () => {
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

  // SIN clamp: con los pesos corregidos ya no hace falta. Antes daba 101 y dejaba
  // el total y la dimensión 5 sin etapa.
  const r = calculateScore({ questions: maximas, dimensions: dimensionsConfig, stages });
  assert.equal(r.score, 100, 'el puntaje máximo debe ser exactamente 100');
  assert.equal(r.stage, 'avanzado');
  for (const key of Object.keys(dimensionsConfig)) {
    assert.equal(r.byDimension[key].stage, 'avanzado', `dimensión ${key}`);
  }
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

// ═══════════════════════════════════════════════════════════════════════════
// La especificación del cliente, como invariantes ejecutables.
// Fuente: tests/fixtures/spec-cliente.json, extraído de los dos Excel que
// entregó el cliente el 2026-07-30:
//   · "Cuestionario y ponderaciones TED (2).xlsx"  → pesos y rangos
//   · "TED 2023.2.xlsx", hoja "TED VERSIÓN 2024"   → propiedades de HubSpot
// Si algo de esto falla, la implementación dejó de respetar lo acordado.
// ═══════════════════════════════════════════════════════════════════════════

const spec = JSON.parse(fs.readFileSync(path.join(HERE, 'fixtures', 'spec-cliente.json'), 'utf8'));

test('spec · cada pregunta escribe en la propiedad de HubSpot del mapeo', () => {
  for (const [id, propiedad] of Object.entries(spec.propiedadPorPregunta)) {
    const q = questionsConfig.find((q) => q.id === id);
    assert.ok(q, `falta la pregunta ${id}`);
    assert.equal(q.property, propiedad, `propiedad de ${id}`);
  }
  assert.equal(Object.keys(spec.propiedadPorPregunta).length, 31);
});

test('spec · los pesos de pregunta son los del Excel de ponderaciones', () => {
  for (const [id, peso] of Object.entries(spec.pesoPregunta)) {
    const q = questionsConfig.find((q) => q.id === id);
    assert.equal(q.weight, peso, `peso de ${id}`);
  }
});

test('spec · los pesos de dimensión son los del Excel', () => {
  for (const [d, peso] of Object.entries(spec.pesoDimension)) {
    assert.equal(dimensionsConfig[d].weight, peso, `peso de la dimensión ${d}`);
  }
});

test('spec · los topes de cada etapa son los del Excel', () => {
  const orden = ['tradicional', 'principiante', 'intermedio', 'avanzado'];
  for (const [clave, topes] of Object.entries(spec.topesDeEtapa)) {
    assert.deepEqual(orden.map((e) => stages[e].ranges[clave][1]), topes, `topes de ${clave}`);
  }
});

test('spec · cada pregunta puntuada puede alcanzar 100 en su escala de opciones', () => {
  // Si no llega a 100, la pregunta nunca aporta su peso completo. Así se detectó
  // que el original dejaba la opción máxima de la 12b en 10 en vez de 100.
  for (const q of questionsConfig.filter((q) => q.weight > 0)) {
    const puntajes = q.options.map((o) => o.score || 0);
    const max = q.type === 'radio' ? Math.max(...puntajes) : puntajes.reduce((a, b) => a + b, 0);
    assert.equal(max, 100, `${q.id} solo alcanza ${max}`);
  }
});

test('spec · cada dimensión aporta exactamente su peso, y el total suma 100', () => {
  const aporte = {};
  for (const q of questionsConfig.filter((q) => q.weight > 0)) {
    const puntajes = q.options.map((o) => o.score || 0);
    const max = q.type === 'radio' ? Math.max(...puntajes) : puntajes.reduce((a, b) => a + b, 0);
    aporte[q.dimension] = (aporte[q.dimension] || 0) + max * (q.weight / 100);
  }
  let total = 0;
  for (const [d, peso] of Object.entries(spec.pesoDimension)) {
    const v = Number(aporte[d].toFixed(6));
    total += v;
    assert.equal(v, peso, `la dimensión ${d} aporta ${v} y debería aportar ${peso}`);
  }
  assert.equal(Number(total.toFixed(6)), 100);
});

test('spec · las escalas de la pregunta 12 son homogéneas entre sus siete ítems', () => {
  // Las siete usan la misma escala 0/25/60/100. La 12b la tenía rota en producción.
  const ids = ['question-12a', 'question-12b', 'question-12c', 'question-12e',
               'question-12f', 'question-12g', 'question-12h'];
  for (const id of ids) {
    const q = questionsConfig.find((q) => q.id === id);
    assert.deepEqual(q.options.map((o) => o.score), [0, 25, 60, 100], `escala de ${id}`);
  }
});

test('spec · el mapa de formularios respeta la matriz de combinaciones 2024', () => {
  // Guarda dos reglas que el código tuvo mal y es fácil volver a romper:
  //  1. las cuatro ALTO-* NO llevan formulario (el negocio las marca "N/A"), así que
  //     tampoco puede haber un formulario de respaldo que se las cuele;
  //  2. las 11 combinaciones con taller definido sí están mapeadas.
  // MEDIO-ALTO se espera ausente a propósito: falta crear su formulario en el portal.
  const matriz = spec.tallerPorCombinacion;
  const pendientes = ['MEDIO-ALTO'];

  for (const [combi, talleres] of Object.entries(matriz)) {
    const tieneForm = Boolean(postSurveyFormIds[combi]);
    if (talleres.length === 0) {
      assert.equal(tieneForm, false, `${combi} está marcada N/A y no debe ofrecer formulario`);
    } else if (pendientes.includes(combi)) {
      assert.equal(tieneForm, false, `${combi} ya tiene formulario: quítala de "pendientes"`);
    } else {
      assert.ok(tieneForm, `falta el formulario de ${combi}`);
    }
  }

  // Ninguna clave de más: cada entrada del mapa tiene que existir en la matriz del negocio.
  for (const combi of Object.keys(postSurveyFormIds)) {
    assert.ok(combi in matriz, `${combi} no existe en la matriz de combinaciones`);
  }
});

test('spec · cada combinación carga exactamente el formulario de la tabla del cliente', () => {
  // La tabla del cliente es la lista completa: 11 combinaciones con formulario. Las otras 5
  // (MEDIO-ALTO y las cuatro ALTO-*) no deben recibir ninguno, ni por defecto ni heredado.
  const tabla = spec.formularioPorCombinacion;

  for (const [combi, id] of Object.entries(tabla)) {
    assert.equal(postSurveyFormIds[combi], id, `formulario de ${combi}`);
  }
  assert.equal(Object.keys(postSurveyFormIds).length, Object.keys(tabla).length,
    'el mapa tiene combinaciones que no están en la tabla del cliente');
});
