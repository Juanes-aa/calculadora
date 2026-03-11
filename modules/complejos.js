/**
 * complejos.js
 * Operaciones con números complejos para la calculadora de ingeniería.
 * Representación: { real: number, imag: number }  ← conforme a IMPLEMENTATION.md
 *
 * @module complejos
 */

// ─── Validación ───────────────────────────────────────────────────────────────

/**
 * Valida que el objeto sea un número complejo válido.
 * @param {object} z
 * @param {string} nombre
 */
function validarComplejo(z, nombre = 'z') {
  if (
    !z || typeof z !== 'object' ||
    typeof z.real !== 'number' || typeof z.imag !== 'number' ||
    !isFinite(z.real) || !isFinite(z.imag)
  ) {
    throw new Error(`${nombre} debe ser un objeto complejo {real, imag} con valores finitos.`);
  }
}

/**
 * Crea un objeto complejo.
 * @param {number} real - Parte real
 * @param {number} imag - Parte imaginaria
 * @returns {{ real: number, imag: number }}
 */
export function complejo(real, imag = 0) {
  return { real, imag };
}

// ─── Operaciones Aritméticas ──────────────────────────────────────────────────

/**
 * Suma de dos números complejos: z1 + z2
 * @param {{ real: number, imag: number }} z1
 * @param {{ real: number, imag: number }} z2
 * @returns {{ real: number, imag: number }}
 */
export function add(z1, z2) {
  validarComplejo(z1, 'z1');
  validarComplejo(z2, 'z2');
  return {
    real: z1.real + z2.real,
    imag: z1.imag + z2.imag,
  };
}

/**
 * Resta de dos números complejos: z1 - z2
 * @param {{ real: number, imag: number }} z1
 * @param {{ real: number, imag: number }} z2
 * @returns {{ real: number, imag: number }}
 */
export function subtract(z1, z2) {
  validarComplejo(z1, 'z1');
  validarComplejo(z2, 'z2');
  return {
    real: z1.real - z2.real,
    imag: z1.imag - z2.imag,
  };
}

/**
 * Multiplicación de dos números complejos: z1 × z2
 * (a+bi)(c+di) = (ac-bd) + (ad+bc)i
 * @param {{ real: number, imag: number }} z1
 * @param {{ real: number, imag: number }} z2
 * @returns {{ real: number, imag: number }}
 */
export function multiply(z1, z2) {
  validarComplejo(z1, 'z1');
  validarComplejo(z2, 'z2');
  return {
    real: z1.real * z2.real - z1.imag * z2.imag,
    imag: z1.real * z2.imag + z1.imag * z2.real,
  };
}

/**
 * División de dos números complejos: z1 / z2
 * (a+bi)/(c+di) = ((ac+bd) + (bc-ad)i) / (c²+d²)
 * @param {{ real: number, imag: number }} z1
 * @param {{ real: number, imag: number }} z2
 * @returns {{ real: number, imag: number }}
 */
export function divide(z1, z2) {
  validarComplejo(z1, 'z1');
  validarComplejo(z2, 'z2');
  const denominador = z2.real * z2.real + z2.imag * z2.imag;
  if (denominador === 0) {
    throw new Error('División por cero complejo.');
  }
  return {
    real: (z1.real * z2.real + z1.imag * z2.imag) / denominador,
    imag: (z1.imag * z2.real - z1.real * z2.imag) / denominador,
  };
}

// ─── Propiedades ──────────────────────────────────────────────────────────────

/**
 * Módulo (valor absoluto) de un número complejo: |z| = √(a² + b²)
 * @param {{ real: number, imag: number }} z
 * @returns {number}
 */
export function modulus(z) {
  validarComplejo(z, 'z');
  return Math.sqrt(z.real * z.real + z.imag * z.imag);
}

/**
 * Argumento (ángulo en radianes) de un número complejo: arg(z) = atan2(b, a)
 * @param {{ real: number, imag: number }} z
 * @returns {number} Ángulo en radianes (-π, π]
 */
export function argument(z) {
  validarComplejo(z, 'z');
  return Math.atan2(z.imag, z.real);
}

/**
 * Conjugado de un número complejo: conj(a+bi) = a-bi
 * @param {{ real: number, imag: number }} z
 * @returns {{ real: number, imag: number }}
 */
export function conjugate(z) {
  validarComplejo(z, 'z');
  return {
    real: z.real,
    imag: -z.imag,
  };
}

// ─── Operaciones Avanzadas ────────────────────────────────────────────────────

/**
 * Potencia entera de un número complejo: z^n (usando fórmula de De Moivre)
 * @param {{ real: number, imag: number }} z
 * @param {number} n - Exponente entero
 * @returns {{ real: number, imag: number }}
 */
export function power(z, n) {
  validarComplejo(z, 'z');
  if (typeof n !== 'number' || !Number.isInteger(n)) {
    throw new Error('El exponente debe ser un entero.');
  }

  // FIX ISS-01: potencia negativa de cero no está definida
  if (n < 0 && z.real === 0 && z.imag === 0) {
    throw new Error('Potencia negativa de cero no definida.');
  }

  // Caso especial
  if (n === 0) return { real: 1, imag: 0 };

  // Forma polar: z = r * e^(iθ)
  const r = modulus(z);
  const theta = argument(z);

  // De Moivre: z^n = r^n * (cos(nθ) + i·sin(nθ))
  const rn = Math.pow(r, n);
  const angulo = n * theta;

  return {
    real: rn * Math.cos(angulo),
    imag: rn * Math.sin(angulo),
  };
}

/**
 * Raíz cuadrada principal de un número complejo.
 * √(a+bi) = √((r+a)/2) + i·sign(b)·√((r-a)/2)
 * @param {{ real: number, imag: number }} z
 * @returns {{ real: number, imag: number }}
 */
export function sqrt(z) {
  validarComplejo(z, 'z');
  const r = modulus(z);

  // Si z es cero
  if (r === 0) return { real: 0, imag: 0 };

  const parteReal = Math.sqrt((r + z.real) / 2);
  const parteImag = Math.sqrt((r - z.real) / 2);

  return {
    real: parteReal,
    imag: z.imag >= 0 ? parteImag : -parteImag,
  };
}

/**
 * Convierte un número complejo a su forma polar.
 * @param {{ real: number, imag: number }} z
 * @returns {{ modulo: number, argumento: number }}
 */
export function toPolar(z) {
  return {
    modulo: modulus(z),
    argumento: argument(z),
  };
}

/**
 * Formatea un número complejo como cadena legible.
 * @param {{ real: number, imag: number }} z
 * @param {number} decimales
 * @returns {string}
 */
export function formatComplex(z, decimales = 6) {
  const re = +z.real.toFixed(decimales);
  const im = +z.imag.toFixed(decimales);

  if (im === 0) return `${re}`;
  if (re === 0) return `${im}i`;

  const signo = im >= 0 ? '+' : '-';
  return `${re} ${signo} ${Math.abs(im)}i`;
}
