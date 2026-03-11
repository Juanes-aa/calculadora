/**
 * estadistica.js
 * Funciones estadísticas básicas para la calculadora de ingeniería.
 * Todas las funciones reciben un array de números y retornan un número.
 *
 * @module estadistica
 */

// ─── Validación ───────────────────────────────────────────────────────────────

/**
 * Valida que la entrada sea un array numérico no vacío.
 * @param {number[]} datos
 */
function validarDatos(datos) {
  if (!Array.isArray(datos) || datos.length === 0) {
    throw new Error('Se requiere un array de números no vacío.');
  }
  if (datos.some(v => typeof v !== 'number' || !isFinite(v))) {
    throw new Error('Todos los elementos deben ser números finitos.');
  }
}

// ─── Funciones Estadísticas ───────────────────────────────────────────────────

/**
 * Calcula la media aritmética.
 * @param {number[]} datos
 * @returns {number}
 */
export function mean(datos) {
  validarDatos(datos);
  const suma = datos.reduce((acc, v) => acc + v, 0);
  return suma / datos.length;
}

/**
 * Calcula la mediana (valor central del conjunto ordenado).
 * @param {number[]} datos
 * @returns {number}
 */
export function median(datos) {
  validarDatos(datos);
  const ordenados = [...datos].sort((a, b) => a - b);
  const n = ordenados.length;
  const mitad = Math.floor(n / 2);

  if (n % 2 === 0) {
    return (ordenados[mitad - 1] + ordenados[mitad]) / 2;
  }
  return ordenados[mitad];
}

/**
 * Calcula la moda (valor más frecuente).
 * Si hay múltiples modas, retorna la primera encontrada.
 * @param {number[]} datos
 * @returns {number}
 */
export function mode(datos) {
  validarDatos(datos);
  const frecuencias = new Map();
  let maxFrec = 0;
  let moda = datos[0];

  for (const v of datos) {
    const frec = (frecuencias.get(v) || 0) + 1;
    frecuencias.set(v, frec);
    if (frec > maxFrec) {
      maxFrec = frec;
      moda = v;
    }
  }
  return moda;
}

/**
 * Calcula la varianza poblacional.
 * @param {number[]} datos
 * @returns {number}
 */
export function variance(datos) {
  validarDatos(datos);
  if (datos.length === 1) return 0;
  const m = mean(datos);
  const sumaCuadrados = datos.reduce((acc, v) => acc + (v - m) ** 2, 0);
  return sumaCuadrados / datos.length;
}

/**
 * Calcula la desviación estándar poblacional.
 * @param {number[]} datos
 * @returns {number}
 */
export function stdDev(datos) {
  return Math.sqrt(variance(datos));
}

// FIX ISS-04: varianza y desviación estándar muestral (divisor n-1)
/**
 * Calcula la varianza muestral (divisor n-1).
 * @param {number[]} datos
 * @returns {number}
 */
export function sampleVariance(datos) {
  validarDatos(datos);
  if (datos.length === 1) throw new Error('Se requieren al menos 2 elementos.');
  const m = mean(datos);
  return datos.reduce((acc, v) => acc + (v - m) ** 2, 0) / (datos.length - 1);
}

/**
 * Calcula la desviación estándar muestral (divisor n-1).
 * @param {number[]} datos
 * @returns {number}
 */
export function sampleStdDev(datos) {
  return Math.sqrt(sampleVariance(datos));
}

// FIX ISS-05: moda multimodal — retorna todos los valores con máxima frecuencia
/**
 * Retorna todos los valores con la frecuencia máxima (soporte multimodal).
 * @param {number[]} datos
 * @returns {number[]}
 */
export function allModes(datos) {
  validarDatos(datos);
  const freq = new Map();
  for (const v of datos) freq.set(v, (freq.get(v) || 0) + 1);
  const maxF = Math.max(...freq.values());
  return [...freq.entries()].filter(([, f]) => f === maxF).map(([v]) => v);
}

/**
 * Calcula el rango (diferencia entre máximo y mínimo).
 * @param {number[]} datos
 * @returns {number}
 */
export function range(datos) {
  validarDatos(datos);
  let min = datos[0], max = datos[0];
  for (let i = 1; i < datos.length; i++) {
    if (datos[i] < min) min = datos[i];
    if (datos[i] > max) max = datos[i];
  }
  return max - min;
}

/**
 * Calcula el percentil p (0-100) usando interpolación lineal.
 * Método: ordenar los datos, calcular el índice fraccionario e interpolar.
 * @param {number[]} datos
 * @param {number} p - Percentil (0 a 100)
 * @returns {number}
 */
export function percentile(datos, p) {
  validarDatos(datos);
  if (typeof p !== 'number' || p < 0 || p > 100) {
    throw new Error('El percentil debe estar entre 0 y 100.');
  }
  if (datos.length === 1) return datos[0];

  const ordenados = [...datos].sort((a, b) => a - b);
  const n = ordenados.length;

  // Índice fraccionario (basado en 0)
  const indice = (p / 100) * (n - 1);
  const inferior = Math.floor(indice);
  const superior = Math.ceil(indice);

  if (inferior === superior) return ordenados[inferior];

  // Interpolación lineal
  const fraccion = indice - inferior;
  return ordenados[inferior] + fraccion * (ordenados[superior] - ordenados[inferior]);
}
