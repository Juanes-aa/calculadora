/**
 * constants.js
 * Constantes físicas y matemáticas para la calculadora de ingeniería.
 * Todos los valores provienen del NIST (Instituto Nacional de Estándares y Tecnología).
 */

export const CONSTANTS = {
  // Matemáticas
  PI:   { value: Math.PI,              symbol: 'π',  label: 'Pi',                       unit: '' },
  E:    { value: Math.E,               symbol: 'e',  label: 'Número de Euler',           unit: '' },
  PHI:  { value: 1.6180339887498948,   symbol: 'φ',  label: 'Razón Áurea',              unit: '' },

  // Físicas
  C:    { value: 299792458,            symbol: 'c',  label: 'Velocidad de la Luz',      unit: 'm/s' },
  G:    { value: 6.67430e-11,          symbol: 'G',  label: 'Constante Gravitacional',   unit: 'm³/(kg·s²)' },
  H:    { value: 6.62607015e-34,       symbol: 'h',  label: 'Constante de Planck',       unit: 'J·s' },
  HBAR: { value: 1.054571817e-34,      symbol: 'ℏ',  label: 'Planck Reducida',           unit: 'J·s' },
  KB:   { value: 1.380649e-23,         symbol: 'kB', label: 'Constante de Boltzmann',    unit: 'J/K' },
  NA:   { value: 6.02214076e23,        symbol: 'Nₐ', label: 'Número de Avogadro',        unit: 'mol⁻¹' },
  E0:   { value: 8.8541878128e-12,     symbol: 'ε₀', label: 'Permitividad del Vacío',    unit: 'F/m' },
  MU0:  { value: 1.25663706212e-6,     symbol: 'μ₀', label: 'Permeabilidad del Vacío',   unit: 'H/m' },
  QE:   { value: 1.602176634e-19,      symbol: 'qe', label: 'Carga Elemental',            unit: 'C' },
  ME:   { value: 9.1093837015e-31,     symbol: 'mₑ', label: 'Masa del Electrón',         unit: 'kg' },
  R:    { value: 8.314462618,          symbol: 'R',  label: 'Constante de los Gases',    unit: 'J/(mol·K)' },
};

/**
 * Devuelve el valor de una constante por su clave.
 * @param {string} clave - Identificador de la constante (ej: 'PI', 'C')
 * @returns {number|null}
 */
export function getConstant(clave) {
  const c = CONSTANTS[clave.toUpperCase()];
  return c ? c.value : null;
}
