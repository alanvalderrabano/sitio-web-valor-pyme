// Componente Alpine del Test de Digitalización.
// Es la máquina de estados de la vista; toda la aritmética vive en src/lib/scoring.js
// y toda la conversación con el backend en src/lib/api.js.

import { questions as questionsConfig } from '../config/questions.js';
import { stages } from '../config/stages.js';
import { dimensions as dimensionsConfig } from '../config/dimensions.js';
import { postSurveyFormIds } from '../config/forms.js';
import { camposPerfil, estadoPerfilInicial } from '../config/perfil.js';
import { config } from '../config/api.config.js';
import { isValidRUT, parseFullName } from '../lib/rut.js';
import { storeTedData, getContactTedProperties } from '../lib/api.js';
import {
  calculateScore,
  calculateDimensionsProgress,
  getStage,
  getGap,
  translateDimensionStage,
} from '../lib/scoring.js';

// Umbrales y colores del velocímetro, derivados de stages.js — antes estaban duplicados a mano
// y era cuestión de tiempo que se desincronizaran del config al cambiar la paleta.
const GAUGE_COLORS = Object.values(stages).map((etapa, i, todas) => ({
  max: i === todas.length - 1 ? Infinity : etapa.ranges.total[1],
  color: etapa.color,
}));

export function registerTed(Alpine) {
  // Con `persistProgress: false` el test arranca limpio en cada recarga (útil para probar).
  const persist = config.persistProgress ? (value) => Alpine.$persist(value) : (value) => value;

  Alpine.data('ted', () => ({
    // --- estado de navegación ---
    page: persist('home'),          // home | contact | survey | results
    currentQuestionIndex: persist(0),
    showStartOverModal: false,
    isAdvancing: false,             // bloquea el doble click en "Siguiente"
    errors: [],

    // --- datos del contacto ---
    // Campos de perfilamiento. SOLO INFORMATIVOS: viajan a HubSpot y no entran en
    // ningún cálculo. Ver config/perfil.js.
    perfil: persist(estadoPerfilInicial()),
    camposPerfil,

    name: persist(''),
    email: persist(''),
    rut: persist(''),
    firstname: persist(''),
    lastname: persist(''),
    company: persist(''),
    contactId: null,

    // --- resultados ---
    score: persist(0),
    stage: persist(''),
    surveyCompleted: persist(false),
    mailingStageRange: '',
    hasForm: false,
    // Sin persistir a propósito: en HubSpot los pisa el módulo en cada carga (loadFormIds).
    formIds: { ...postSurveyFormIds },

    // --- configuración (copia mutable: las respuestas se guardan dentro de cada pregunta) ---
    questions: persist(structuredClone(questionsConfig)),
    dimensions: persist(structuredClone(dimensionsConfig)),
    stages,

    // ---------------------------------------------------------------- getters

    get percentage() {
      return Math.round(((this.currentQuestionIndex + 1) / this.questions.length) * 100) || 0;
    },

    /** Los campos de perfil que toca mostrar: resuelve el RUT condicional. */
    get camposVisibles() {
      return this.camposPerfil.filter(
        (c) => !c.mostrarSi || this.perfil[c.mostrarSi.campo] === c.mostrarSi.valor,
      );
    },

    /** El RUT que el usuario está rellenando, sea de empresa o de persona. */
    get rutActivo() {
      return this.perfil.tienes_rut_empresa_ === 'No'
        ? this.perfil.rut_persona
        : this.perfil.rut_empresa;
    },

    get currentQuestion() {
      return this.questions[this.currentQuestionIndex];
    },

    /** Propiedades de CRM derivadas de las 5 dimensiones. */
    get dimensionsData() {
      const data = {};
      for (const key of Object.keys(this.dimensions)) {
        const dimension = this.dimensions[key];
        data[dimension.progressProperty] = `${dimension.progress}%`;
        data[dimension.stageProperty] = getStage(this.stages, dimension.score, key, { clamp: true });
        data[dimension.scoreProperty] = dimension.score;
      }
      return data;
    },

    // ---------------------------------------------------------------- cálculo

    recalculate() {
      const { score, stage, byDimension } = calculateScore({
        questions: this.questions,
        dimensions: this.dimensions,
        stages: this.stages,
        clamp: true, // ver getStage() — evita que un puntaje perfecto quede sin etapa
      });

      this.score = score;
      this.stage = stage ?? '';

      for (const [key, result] of Object.entries(byDimension)) {
        Object.assign(this.dimensions[key], result);
      }

      const progress = calculateDimensionsProgress({
        questions: this.questions,
        dimensions: this.dimensions,
      });
      for (const [key, value] of Object.entries(progress)) {
        this.dimensions[key].progress = value;
      }
    },

    // ---------------------------------------------------------------- acciones

    cleanErrors() {
      this.errors = [];
    },

    /** Guarda la opción marcada en la pregunta actual y recalcula al vuelo. */
    storeAnswer(event) {
      const question = this.currentQuestion;
      const value = event.target.value;

      if (question.type === 'radio') {
        question.answer = value;
        question.answers = [{ value }];
      } else if (question.type === 'checkbox') {
        const index = question.answers.findIndex((a) => a.value === value);
        if (event.target.checked && index === -1) question.answers.push({ value });
        if (!event.target.checked && index !== -1) question.answers.splice(index, 1);
      }

      this.recalculate();
    },

    /** Paso 1: valida el RUT, crea el contacto y entra al cuestionario. */
    async submitUserData() {
      // El RUT sale ahora del par condicional empresa/persona. Se sigue validando
      // igual y se sigue guardando en `ted_3_rut`, que es lo que lee la
      // rehidratación por ?c=. Nada de esto entra en ningún cálculo.
      const rutLimpio = String(this.rutActivo || '').replace(/\./g, '');
      const clave = this.perfil.tienes_rut_empresa_ === 'No' ? 'rut_persona' : 'rut_empresa';
      this.perfil[clave] = rutLimpio;
      this.rut = rutLimpio;

      if (!isValidRUT(rutLimpio)) {
        this.errors = ['El RUT ingresado no es válido'];
        return;
      }

      this.cleanErrors();
      // `name` se mantiene por compatibilidad: lo usa la rehidratación y la
      // pantalla de resultados. Ahora se compone de los dos campos separados.
      this.firstname = this.perfil.firstname.trim();
      this.lastname = this.perfil.lastname.trim();
      this.name = `${this.firstname} ${this.lastname}`.trim();
      this.email = this.perfil.email;
      this.page = 'survey';

      // Solo se envían los campos con valor: una propiedad de tipo lista rechaza
      // la cadena vacía y con ella se cae el POST entero.
      const perfilConValor = Object.fromEntries(
        Object.entries(this.perfil).filter(([, v]) => v !== '' && v != null),
      );

      await storeTedData({
        firstname: this.firstname,
        lastname: this.lastname,
        email: this.email,
        ted_3_rut: this.rut,
        company: this.company,
        inicio_del_test__ted_: true,
        ...perfilConValor,
      });
    },

    /**
     * Lleva el foco al enunciado de la pregunta visible.
     *
     * Antes, al pulsar Siguiente no cambiaba nada perceptible: el scroll se
     * quedaba donde estaba y el foco volvía a <body>. En una pregunta larga
     * podías estar mirando media pantalla sin notar que ya habías avanzado, y
     * quien navega con teclado perdía la posición 31 veces seguidas.
     *
     * Enfocar el enunciado resuelve las tres cosas a la vez: reposiciona el
     * scroll, devuelve el punto de partida al teclado y hace que un lector de
     * pantalla anuncie la pregunta nueva.
     */
    enfocarPregunta() {
      // `$nextTick` + `requestAnimationFrame`, no solo lo primero: `nextQuestion`
      // es asíncrona y tras su `await` el nextTick se resuelve ANTES de que Alpine
      // haya aplicado el `x-show` de la pregunta nueva. Enfocar un elemento cuyo
      // padre sigue en `display:none` no hace nada y no avisa — al retroceder
      // funcionaba (es síncrono) y al avanzar no, que fue la pista.
      this.$nextTick(() => {
        requestAnimationFrame(() => {
          const actual = this.$el.querySelectorAll('.ted-question')[this.currentQuestionIndex];
          const enunciado = actual?.querySelector('.ted-question__text');
          if (!enunciado || actual.offsetParent === null) return;
          enunciado.focus({ preventScroll: true });
          enunciado.scrollIntoView({ block: 'center', behavior: 'smooth' });
        });
      });
    },

    previousQuestion() {
      if (this.currentQuestionIndex !== 0) {
        this.currentQuestionIndex--;
        this.enfocarPregunta();
      }
    },

    async nextQuestion() {
      if (this.isAdvancing) return;

      const question = this.currentQuestion;
      const unanswered =
        (question.type === 'radio' && !question.answer) ||
        (question.type === 'checkbox' && question.answers.length === 0);

      if (unanswered) {
        this.errors = ['Debes seleccionar al menos una opción'];
        return;
      }

      this.isAdvancing = true;
      this.cleanErrors();

      try {
        await this.sendQuestionData();
        if (this.currentQuestionIndex === this.questions.length - 1) {
          this.showResults();
        } else {
          this.currentQuestionIndex++;
          this.enfocarPregunta();
        }
      } finally {
        this.isAdvancing = false;
      }
    },

    /** Formatea una respuesta como la espera el CRM: el checkbox va "; a; b; c". */
    formatoRespuesta(question) {
      return question.type === 'radio'
        ? question.answers[0].value
        : '; ' + question.answers.map((a) => a.value).join('; ');
    },

    /**
     * TODO lo que el usuario lleva contestado, listo para enviar: los campos de
     * perfil con valor y las preguntas ya respondidas.
     *
     * Es la pieza del envío ACUMULATIVO. Antes cada "Siguiente" mandaba solo su
     * propia respuesta, así que un POST fallido la perdía para siempre: el test
     * seguía avanzando, el usuario llegaba a resultados sin ver ningún aviso y el
     * CRM quedaba con huecos que nadie detectaba. Comprobado cortando la red.
     *
     * Mandando el acumulado, el siguiente envío que sí llegue repara los
     * anteriores. No hace falta lógica de reintentos ni avisar de nada.
     */
    get datosAcumulados() {
      const datos = { email: this.email };

      for (const [prop, valor] of Object.entries(this.perfil)) {
        if (valor !== '' && valor != null) datos[prop] = valor;
      }

      for (const q of this.questions) {
        const contestada =
          (q.type === 'radio' && q.answer) ||
          (q.type === 'checkbox' && q.answers.length > 0);
        if (contestada) datos[q.property] = this.formatoRespuesta(q);
      }

      return datos;
    },

    sendQuestionData() {
      return storeTedData(this.datosAcumulados);
    },

    sendDimensionsData() {
      return storeTedData({
        // Va también el acumulado: si falla el POST de la última pregunta, no hay
        // ningún envío posterior que lo repare salvo este.
        ...this.datosAcumulados,
        ted_3_porcentaje_digitalizacion: `${this.score}%`,
        ted_3_marketing: translateDimensionStage(this.dimensions[2].stage),
        ted_3_procesos: translateDimensionStage(this.dimensions[4].stage),
        ted_3_nivel_digitalizacion: this.stage,
        ted_3_flujo_correos: this.mailingStageRange,
        ...this.dimensionsData,
      }).then((response) => {
        if (response) this.surveyCompleted = true;
      });
    },

    startOver() {
      this.page = 'home';
      this.showStartOverModal = false;
      this.name = '';
      this.email = '';
      this.rut = '';
      this.firstname = '';
      this.lastname = '';
      this.company = '';
      this.perfil = estadoPerfilInicial();
      this.currentQuestionIndex = 0;
      this.score = 0;
      this.stage = '';
      this.surveyCompleted = false;
      this.hasForm = false;
      this.errors = [];
      this.questions = structuredClone(questionsConfig);
      this.dimensions = structuredClone(dimensionsConfig);

      const url = new URL(window.location.href);
      url.searchParams.delete('c');
      window.history.replaceState({}, document.title, url);
    },

    // ---------------------------------------------------------------- resultados

    showResults() {
      this.page = 'results';
      this.stage = getStage(this.stages, this.score, undefined, { clamp: true }) ?? '';

      if (!this.surveyCompleted) this.sendDimensionsData();

      // El flujo de correos se decide por Marketing (dim. 2) x Procesos (dim. 4).
      this.mailingStageRange =
        translateDimensionStage(this.dimensions[2].stage) +
        '-' +
        translateDimensionStage(this.dimensions[4].stage);

      // Sin formulario para la combinación no se dibuja nada: las cuatro ALTO-* están
      // marcadas "N/A" por el negocio y no deben recibir taller. La única que falta de
      // verdad es MEDIO-ALTO. Ver el comentario de config/forms.js.
      //
      // El `else` no es decorativo: showResults() puede ejecutarse dos veces sobre la misma
      // página (al recargar con el test ya completado, o si el usuario retrocede, cambia
      // respuestas y vuelve a terminar). Sin limpiar, el formulario de la combinación
      // anterior seguía en pantalla y el usuario se inscribía al taller equivocado.
      const formId = this.formIds[this.mailingStageRange];
      if (formId) {
        this.renderForm(formId);
      } else {
        const contenedor = document.querySelector('#dynamic-form-container');
        if (contenedor) contenedor.innerHTML = '';
        this.hasForm = false;
      }

      this.$nextTick(() => this.renderGauge());
    },

    renderGauge() {
      const element = document.getElementById('results-gauge');
      if (!element || !window.Gauge) return;

      element.innerHTML = '';
      const gauge = window.Gauge(element, {
        max: 100,
        dialStartAngle: 180,
        dialEndAngle: 0,
        value: 0,
        label: (value) => `${Math.round(value)}%`,
        color: (value) => GAUGE_COLORS.find((c) => value < c.max).color,
      });

      // El original usaba setInterval sin limpiar; una sola animación basta.
      gauge.setValueAnimated(this.score, 1);
    },

    /**
     * Formulario de descarga del informe. En local se dibuja un formulario mock
     * (mismos campos, POST al servidor local); en HubSpot lo inyecta hbspt.forms.
     */
    renderForm(formId) {
      const target = document.querySelector('#dynamic-form-container');
      if (!target) return;

      if (config.hubspot.useMockForms || typeof window.hbspt === 'undefined') {
        target.innerHTML = `
          <form class="ted-mockform" data-form-id="${formId}">
            <p class="ted-mockform__hint">Formulario local (mock del formulario de HubSpot <code>${formId}</code>)</p>
            <label>Correo<input type="email" name="email" value="${this.email}" required></label>
            <label><input type="checkbox" name="consent" required> Acepto recibir el informe por correo</label>
            <button type="submit">Descargar mi informe</button>
          </form>`;
        target.querySelector('form').addEventListener('submit', (event) => {
          event.preventDefault();
          if (config.isStatic) {
            // Sin backend no hay informe que generar; se dice, en vez de romper el botón.
            target.querySelector('.ted-mockform__hint').textContent =
              'Vista previa: aquí el sitio real enviaría el informe por correo mediante un workflow de HubSpot.';
            return;
          }
          window.location.href = `/api/report?email=${encodeURIComponent(this.email)}`;
        });
      } else {
        window.hbspt.forms.create({
          portalId: config.hubspot.portalId,
          formId,
          target: '#dynamic-form-container',
        });
      }

      this.hasForm = true;
    },

    // ---------------------------------------------------------------- ciclo de vida

    async init() {
      this.publishStageColors();
      this.loadFormIds();

      const contactId = new URLSearchParams(window.location.search).get('c');

      if (contactId) {
        this.contactId = contactId;
        await this.loadFromContact(contactId);
        return;
      }

      if (this.page === 'results') this.showResults();
    },

    /**
     * En HubSpot los IDs de formulario son campos del módulo: el equipo los cambia desde el
     * editor de páginas sin tocar código. El módulo los imprime en `<script id="form-ids">` y
     * aquí pisan a los de config/forms.js, que son el valor por defecto y lo que se usa en local.
     *
     * Se ignoran las claves vacías: un campo sin formulario asignado renderiza "" y mapearlo
     * dejaría a esa combinación creyendo que tiene formulario cuando no lo tiene.
     */
    loadFormIds() {
      const nodo = document.getElementById('form-ids');
      if (!nodo) return;

      try {
        for (const [combinacion, id] of Object.entries(JSON.parse(nodo.textContent))) {
          if (id) this.formIds[combinacion] = id;
        }
      } catch (error) {
        console.error('[ted] #form-ids no es JSON válido, se usan los IDs por defecto:', error);
      }
    },

    /**
     * Expone los colores de etapa como custom properties (`--ted-tradicional`, …) para que
     * ted.css los use sin redeclararlos. Así stages.js sigue siendo la fuente única: cambiar
     * la paleta ahí repinta marcas, píldoras y velocímetro a la vez.
     */
    publishStageColors() {
      for (const [nombre, etapa] of Object.entries(this.stages)) {
        this.$el.style.setProperty(`--ted-${nombre}`, etapa.color);
      }
    },

    /** Rehidrata un test ya completado a partir de las propiedades guardadas en el CRM. */
    async loadFromContact(contactId) {
      try {
        const data = await getContactTedProperties(contactId);

        this.name = `${data.firstname} ${data.lastname}`;
        this.email = data.email;
        this.rut = data.ted_3_rut;
        this.firstname = data.firstname;
        this.lastname = data.lastname;
        this.company = data.company;
        this.score = Number(String(data.ted_3_porcentaje_digitalizacion ?? '').replace('%', '')) || 0;
        this.stage = data.ted_3_nivel_digitalizacion || '';
        this.mailingStageRange = data.ted_3_flujo_correos || '';

        this.questions = this.questions.map((question) => {
          if (question.property in data) {
            question.answer = data[question.property];
            question.answers = [{ value: data[question.property] }];
          }
          return question;
        });

        // La propiedad se toma de la config, no del nombre a mano: escribir en una y leer de
        // otra dejaba los resultados en blanco al volver con ?c=. Ver dimensions.js.
        for (let i = 1; i <= 5; i++) {
          const dimensionScore = data[this.dimensions[i].scoreProperty];
          this.dimensions[i].score = dimensionScore;
          this.dimensions[i].stage = getStage(this.stages, dimensionScore, i, { clamp: true });
          this.dimensions[i].gap = getGap(dimensionScore, this.dimensions[i].weight);
        }

        this.surveyCompleted = true;
        this.showResults();
      } catch (error) {
        console.error('[ted] no se pudieron cargar las propiedades del contacto:', error);
      }
    },
  }));
}
