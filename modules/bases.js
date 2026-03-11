/**
 * bases.js
 * Conversión de bases numéricas para la calculadora de ingeniería.
 * Soporta conversiones entre decimal, binario, hexadecimal y octal.
 * Todas las funciones soportan enteros negativos.
 *
 * @module bases
 */

// ─── Validación ───────────────────────────────────────────────────────────────

/**
 * Valida que el valor sea un entero finito.
 * @param {number} n
 * @param {string} nombre - Nombre del parámetro para el mensaje de error
 */
function validarEntero(n, nombre = 'n') {
  if (typeof n !== 'number' || !Number.isFinite(n)) {
    throw new Error(`${nombre} debe ser un número finito.`);
  }
  if (!Number.isInteger(n)) {
    throw new Error(`${nombre} debe ser un entero.`);
  }
  // FIX ISS-09: advertencia para enteros fuera del rango seguro de representación
  if (Math.abs(n) > Number.MAX_SAFE_INTEGER) {
    console.warn(`Advertencia: ${nombre} = ${n} supera Number.MAX_SAFE_INTEGER (2^53 - 1). La conversión puede ser inexacta.`);
  }
}

/**
 * Valida que una cadena contenga solo caracteres válidos para la base dada.
 * @param {string} cadena
 * @param {RegExp} patron
 * @param {string} nombreBase
 */
function validarCadenaBase(cadena, patron, nombreBase) {
  if (typeof cadena !== 'string' || cadena.trim() === '') {
    throw new Error(`Se requiere una cadena ${nombreBase} válida.`);
  }
  const limpio = cadena.trim().replace(/^-/, '');
  if (!patron.test(limpio)) {
    throw new Error(`Cadena ${nombreBase} inválida: "${cadena}".`);
  }
}

// ─── Decimal → Otras Bases ────────────────────────────────────────────────────

/**
 * Convierte un entero decimal a cadena binaria.
 * @param {number} n - Entero decimal
 * @returns {string} Representación binaria
 */
export function convertDecimalToBinary(n) {
  validarEntero(n, 'n');
  if (n === 0) return '0';
  const signo = n < 0 ? '-' : '';
  return signo + Math.abs(n).toString(2);
}

/**
 * Convierte un entero decimal a cadena hexadecimal (mayúsculas).
 * @param {number} n - Entero decimal
 * @returns {string} Representación hexadecimal
 */
export function convertDecimalToHex(n) {
  validarEntero(n, 'n');
  if (n === 0) return '0';
  const signo = n < 0 ? '-' : '';
  return signo + Math.abs(n).toString(16).toUpperCase();
}

/**
 * Convierte un entero decimal a cadena octal.
 * @param {number} n - Entero decimal
 * @returns {string} Representación octal
 */
export function convertDecimalToOctal(n) {
  validarEntero(n, 'n');
  if (n === 0) return '0';
  const signo = n < 0 ? '-' : '';
  return signo + Math.abs(n).toString(8);
}

// ─── Otras Bases → Decimal ────────────────────────────────────────────────────

/**
 * Convierte una cadena binaria a entero decimal.
 * @param {string} cadena - Cadena binaria (ej: "1010", "-110")
 * @returns {string} Valor decimal como cadena
 */
export function convertBinaryToDecimal(cadena) {
  validarCadenaBase(cadena, /^[01]+$/, 'binaria');
  const limpio = cadena.trim();
  const esNegativo = limpio.startsWith('-');
  const valor = parseInt(esNegativo ? limpio.slice(1) : limpio, 2);
  return (esNegativo ? -valor : valor).toString();
}

/**
 * Convierte una cadena hexadecimal a entero decimal.
 * @param {string} cadena - Cadena hexadecimal (ej: "FF", "-A3")
 * @returns {string} Valor decimal como cadena
 */
export function convertHexToDecimal(cadena) {
  validarCadenaBase(cadena, /^[0-9a-fA-F]+$/, 'hexadecimal');
  const limpio = cadena.trim();
  const esNegativo = limpio.startsWith('-');
  const valor = parseInt(esNegativo ? limpio.slice(1) : limpio, 16);
  return (esNegativo ? -valor : valor).toString();
}

/**
 * Convierte una cadena octal a entero decimal.
 * @param {string} cadena - Cadena octal (ej: "17", "-77")
 * @returns {string} Valor decimal como cadena
 */
export function convertOctalToDecimal(cadena) {
  validarCadenaBase(cadena, /^[0-7]+$/, 'octal');
  const limpio = cadena.trim();
  const esNegativo = limpio.startsWith('-');
  const valor = parseInt(esNegativo ? limpio.slice(1) : limpio, 8);
  return (esNegativo ? -valor : valor).toString();
}
