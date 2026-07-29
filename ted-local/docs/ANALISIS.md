# Análisis técnico — Test de Digitalización (TED)

Diagnóstico de <https://www.valorpyme.cl/descarga-test-de-digitalizacion>, hecho el 2026-07-29
sobre el HTML servido en producción y los bundles que carga. Es la base de la copia local
que vive en este directorio.

---

## 1. Estructura técnica

### CMS y arquitectura

| | |
|---|---|
| **CMS** | HubSpot CMS Hub — `<meta name="generator" content="HubSpot">`, portal **`7800319`** |
| **Tema** | `tema-2022` + plantillas `main-tailwind-agosto-2023` y `tailwind` |
| **Arquitectura** | Página server-rendered por HubSpot (HubL) que embebe **un módulo custom**; el test en sí es una **SPA de una sola pantalla, 100 % en el cliente** |
| **Backend** | Dos **HubSpot serverless functions** bajo `/_hcms/api/`; no hay servidor propio |
| **Persistencia** | El CRM de HubSpot (propiedades de contacto) + `localStorage` en el navegador |

El módulo custom es `valor-pyme-ted` (id `159370030935`). Todo el test — marcado, lógica,
banco de preguntas y textos de resultados — está dentro de ese módulo:

```
module_valor-pyme-ted.min.js    34 KB   componente Alpine + las 31 preguntas embebidas
module_valor-pyme-ted.min.css  203 B    prácticamente vacío; el estilo es Tailwind
```

### Librerías cargadas

| Librería | Origen | Para qué |
|---|---|---|
| **Alpine.js 3.x** | jsDelivr CDN | reactividad y la máquina de estados de la vista |
| **@alpinejs/persist 3.x** | jsDelivr CDN | espeja el estado en `localStorage` (el test sobrevive a un F5) |
| **Tailwind CSS** | bundle compilado del tema | todo el layout; **164 clases**, de las cuales solo ~7 son propias |
| **gauge.js** | `template_gauge.min.js` (3 KB) | el velocímetro semicircular del resultado |
| **jQuery 1.7.1** | HubSpot | heredado del tema; el módulo solo lo usa para un hack de botones |
| **HubSpot Forms v2** | `js.hsforms.net/forms/v2.js` | inyecta el formulario de descarga al terminar |
| **Font Awesome 5 y 6** | CDN | iconografía del tema (las dos versiones a la vez) |
| **BugHerd** | `bugherd.com/sidebarv2.js` | widget de QA — **no debería estar en producción** |

**No hay build step, ni framework SPA, ni bundler.** Es Alpine sobre HTML generado por HubL.

### APIs y servicios externos

| Servicio | Uso |
|---|---|
| `POST /_hcms/api/store-ted-data` | upsert de propiedades del contacto en el CRM. Se llama **una vez por pregunta** más una vez al final |
| `POST /_hcms/api/get-contact-ted-properties` | lee un contacto por id; alimenta `?c=<contactId>` para reabrir un resultado |
| HubSpot Forms | formulario de descarga del informe, elegido según el resultado |
| Workflows de HubSpot | el informe **no se descarga desde la página**: se dispara por correo según las propiedades guardadas |

El código de ambas serverless functions es privado (vive en el portal, no se sirve al cliente).
Se verificó su existencia y contrato sondeándolas: responden `500` con
`{"message":"Contact ID is required"}` ante un body vacío, y `404` a `GET`.

### Formularios, validación y almacenamiento

- **Un solo formulario propio**: nombre, correo, empresa y RUT, en la pantalla `contact`.
- **Validación**: solo el **RUT** se valida en serio (módulo 11, en el cliente). El resto se
  apoya en `required` del navegador. **No hay validación en el servidor visible.**
- El `#rut` bloquea la tecla `.` y limpia el pegado con `document.execCommand` (API obsoleta).
- **Almacenamiento**: cada respuesta viaja al CRM apenas se pulsa "Siguiente" — es decir,
  **el test se guarda incrementalmente**, no al final. En paralelo, `$persist` guarda todo el
  estado en `localStorage`, así que se puede cerrar el navegador y retomar.

---

## 2. Experiencia funcional

### Flujo del usuario

```
home ──"Comenzar"──▶ contact ──RUT válido──▶ survey ──31 preguntas──▶ results
                                                │                        │
                                    cada "Siguiente" guarda        gauge + 5 dimensiones
                                    la respuesta en el CRM         + formulario de descarga

results también se alcanza directo con  /?c=<contactId>  (rehidrata desde el CRM)
"Comenzar de nuevo" pide confirmación en un modal y borra todo el estado.
```

### Campos solicitados

| Campo | Propiedad de CRM | Validación |
|---|---|---|
| Nombre completo | `firstname` + `lastname` | se parte por espacios: con 3+ palabras, **las dos últimas son los apellidos** |
| Correo | `email` | `type=email` del navegador; es la **llave de deduplicación** |
| Empresa | `company` | `required` |
| RUT | `ted_3_rut` | módulo 11, 8–9 caracteres |

Al enviar también se marca `inicio_del_test__ted_: true`, que es lo que permite medir abandono.

### El cuestionario

**31 preguntas**, de a una en pantalla, tipo `radio` o `checkbox`. Se dividen en dos grupos:

- **Preguntas 1–7 — perfilamiento** (`weight: 0`, `dimension: 0`): cargo, participación,
  dotación, rubro, edad, educación, tipo de cliente. **No puntúan**; solo enriquecen el CRM.
- **Preguntas 8–31 — evaluación**: cada una tiene un `weight` y pertenece a una de las 5 dimensiones.

Las opciones traen un `score` propio. Los checkbox **suman** el score de todo lo marcado.

### Las 5 dimensiones

| # | Dimensión | Peso declarado | Suma real de pesos |
|---|---|---|---|
| 1 | Visión Estratégica | 20 | 20 |
| 2 | Marketing, Ventas y Experiencia con Clientes | 20 | 20 |
| 3 | Personas | 10 | 10 |
| 4 | Procesos | 25 | 25 |
| 5 | Tecnologías, Equipamiento y Herramientas | **15** | **26,25** ⚠️ |

### Lógica de cálculo

```
score_pregunta   = (radio: score de la opción | checkbox: suma de los score marcados)
aporte           = score_pregunta × (weight / 100)
score_global     = round(Σ aportes)                    → 0-100
score_dimensión  = round(Σ aportes de esa dimensión)
```

La **etapa** sale de buscar en qué rango cae el puntaje. Los rangos son distintos para el
total y para cada dimensión:

| Etapa | Código CRM | Color | Rango total |
|---|---|---|---|
| Tradicional | `BAJO0` | `#e83642` | 0 – 13,75 |
| Principiante | `BAJO1` | `#f4b21e` | 13,76 – 41,25 |
| Intermedio | `MEDIO` | `#00953f` | 41,26 – 69,5 |
| Avanzado | `ALTO` | `#1d4ed8` | 69,51 – 100 |

### Reportes y descargas

**La página no genera ningún archivo.** Al llegar a `results`:

1. Se calcula `mailingStageRange = <etapa dim. 2>-<etapa dim. 4>`, o sea **Marketing × Procesos**.
2. Ese string se busca en un mapa de 11 entradas (`<script id="form-ids">`) que devuelve un
   **formId de HubSpot**.
3. Se inyecta ese formulario. Al enviarlo, un **workflow de HubSpot** manda el informe por correo.

Es decir: la segmentación del informe depende de solo 2 de las 5 dimensiones.

---

## 3. Recursos

| Tipo | Detalle |
|---|---|
| **HTML** | 49 KB de página; el módulo TED son **32 KB** de ese total |
| **CSS** | 8 hojas (2 de Font Awesome, 4 del tema, 1 del módulo, 1 legacy `tema-2022`) |
| **JS** | 16 scripts entre CDN, HubSpot y tema |
| **Imágenes** | `ted-bg.jpg` (135 KB), `ted-programa-pyme-digital.jpg` (90 KB), logo SVG (110 KB) |
| **Fuentes** | Roboto 400/500/700 desde Google Fonts |
| **Descargables** | ninguno en la página — el informe llega por correo |

El logo SVG pesa **110 KB**, muy por encima de lo razonable para un SVG (probablemente trae
trazados sin simplificar). Candidato claro a pasar por SVGO.

---

## 4. Inconsistencias detectadas en el original

Todas están **replicadas tal cual** en la copia local, para que los puntajes coincidan. Están
documentadas aquí para decidir si arreglarlas al adaptar el test.

1. **La dimensión 5 no puede alcanzar su etapa máxima.** Sus preguntas suman **26,25** puntos
   pero su `weight` declarado es **15**, y sus rangos de etapa llegan solo hasta **25**. Un
   puntaje sobre 25 cae **fuera de todos los rangos** y `getStage()` devuelve `undefined`:
   la tarjeta de resultados queda en blanco. Como los pesos totales suman **101,25** en vez de 100,
   el puntaje global también puede pasarse de 100.

2. **`ted_3_procesos` guardaba la dimensión equivocada.** El bundle original escribe
   `dimensions[2].stage` (Marketing) tanto en `ted_3_marketing` como en `ted_3_procesos` —
   copy-paste. La copia local **corrige esto** y usa `dimensions[4]` para procesos; es el único
   punto donde nos apartamos a propósito del original.
   → En `src/components/ted.js`, `sendDimensionsData()`.

3. **Las respuestas de selección múltiple llegan corruptas al CRM.** El `<input type="checkbox">`
   trae a la vez `x-model="question.answers"` y `@change="storeAnswer"`, así que **cada marca se
   registra dos veces**: Alpine mete el valor como *string* y `storeAnswer` mete un objeto
   `{value}`. Al serializar con `answers.map(a => a.value)`, los strings dan `undefined` y el
   valor enviado queda con huecos:

   ```
   original:  "; ; a. Consumidores nacionales (Personas); ; c. Empresas nacionales"
   correcto:  "; a. Consumidores nacionales (Personas); c. Empresas nacionales"
   ```

   Afecta a las **11 preguntas de tipo checkbox**, o sea toda propiedad multi-select del CRM.
   El **puntaje no se ve afectado** (las entradas string no calzan con ninguna opción y suman 0),
   por eso el bug pasa desapercibido en pantalla.
   La copia local **corrige esto**: quita el `x-model` y deja `storeAnswer` como única fuente,
   con `:checked` para reflejar el estado al volver atrás.
   → `public/index.html`, el input del bloque `question-options`.

4. **El mapa de formularios está incompleto.** Faltan las 5 combinaciones que empiezan con
   `ALTO` y también `MEDIO-ALTO`. Un usuario con buen resultado en Marketing **no ve ningún
   formulario** y por lo tanto no recibe informe.

5. **`getGap()` no devuelve una brecha.** Devuelve el **% alcanzado**, y `0` cuando ya se llegó
   al tope — o sea, `0` significa tanto "nada" como "todo". La copia local mantiene el cálculo
   pero renombra el concepto en los comentarios.

6. **`setInterval` sin `clearInterval`.** El original re-anima el velocímetro cada 100 ms para
   siempre. La copia lo cambia por una sola animación.

7. **Los botones se ocultan con jQuery** durante 1–2 s para evitar el doble click. La copia usa
   una bandera `isAdvancing`, que es lo mismo sin manipular el DOM a mano.

8. **BugHerd está activo en producción** — widget de QA que se sirve a los usuarios reales.

9. **Sin CSRF ni rate limiting visibles.** `store-ted-data` acepta cualquier `email` +
   propiedades desde el navegador. Se puede escribir en el CRM sin pasar por el test.
   Esto hay que revisarlo en el portal antes de reutilizar el patrón.
