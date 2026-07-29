// Etapas de madurez digital y sus rangos por dimensión (1-5) y total.
// Extraído del bundle original module_valor-pyme-ted.min.js (portal HubSpot 7800319).
// No editar a mano sin re-verificar la paridad de puntajes con tests/scoring.test.mjs.
//
// Los `color` NO son los del original: se re-mapearon a la paleta del theme "Valor Pyme 2026"
// conservando la lectura de semáforo (rojo -> amarillo -> verde -> tope). "Avanzado" usa el
// morado corporativo porque la marca no tiene azul. Esta es la fuente ÚNICA de esos colores:
// el velocímetro y el CSS los derivan de aquí.

export const stages = {
  "tradicional": {
    "id": "BAJO0",
    "label": "Tradicional",
    "color": "#FF2B5E",
    "ranges": {
      "1": [
        0,
        4
      ],
      "2": [
        0,
        3
      ],
      "3": [
        0,
        1
      ],
      "4": [
        0,
        3.75
      ],
      "5": [
        0,
        2
      ],
      "total": [
        0,
        13.75
      ]
    }
  },
  "principiante": {
    "id": "BAJO1",
    "label": "Principiante",
    "color": "#FF8500",
    "ranges": {
      "1": [
        4.01,
        10.7
      ],
      "2": [
        3.01,
        6.8
      ],
      "3": [
        1.01,
        3.5
      ],
      "4": [
        3.76,
        11.25
      ],
      "5": [
        2.01,
        9
      ],
      "total": [
        13.76,
        41.25
      ]
    }
  },
  "intermedio": {
    "id": "MEDIO",
    "label": "Intermedio",
    "color": "#00BD70",
    "ranges": {
      "1": [
        10.71,
        13.1
      ],
      "2": [
        6.81,
        13.4
      ],
      "3": [
        3.51,
        6
      ],
      "4": [
        11.26,
        20
      ],
      "5": [
        9.01,
        17
      ],
      "total": [
        41.26,
        69.5
      ]
    }
  },
  "avanzado": {
    "id": "ALTO",
    "label": "Avanzado",
    "color": "#6126FF",
    "ranges": {
      "1": [
        13.11,
        20
      ],
      "2": [
        13.41,
        20
      ],
      "3": [
        6.01,
        10
      ],
      "4": [
        20.01,
        25
      ],
      "5": [
        17.01,
        25
      ],
      "total": [
        69.51,
        100
      ]
    }
  }
};
