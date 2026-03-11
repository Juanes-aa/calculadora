/**
 * mathEngine.js
 * Motor de cálculo principal. Envuelve math.js para la evaluación y
 * provee funciones especializadas de ingeniería.
 * Todas las funciones trigonométricas usan RADIANES por defecto.
 */

import { CONSTANTS } from './constants.js';
import {
  convertDecimalToBinary, convertDecimalToHex, convertDecimalToOctal,
  convertBinaryToDecimal, convertHexToDecimal, convertOctalToDecimal,
} from './bases.js';
import * as estadistica from './estadistica.js';
import * as complejos from './complejos.js';

// ─── Ámbito de math.js (se llena después de cargar la librería) ───────────────
let _math = null;

/**
 * Inyecta la instancia de math.js (se llama desde main.js tras la carga del CDN).
 * @param {object} instanciaMath - window.math
 */
export function initMathEngine(instanciaMath) {
  _math = instanciaMath;

  // Crear un ámbito personalizado de math.js precargado con constantes de ingeniería
  _ambito = {};
  for (const [clave, c] of Object.entries(CONSTANTS)) {
    _ambito[clave.toLowerCase()] = c.value;
  }
  // Alias comunes
  _ambito['pi']    = CONSTANTS.PI.value;
  _ambito['euler'] = CONSTANTS.E.value;

  // ─── Registrar módulos nuevos en math.js ──────────────────────────────────
  _registrarFuncionesExtendidas();
}

let _ambito = {};

// ─── Registro de Funciones Extendidas ────────────────────────────────────

/**
 * Convierte un argumento de math.js (puede ser Array, Matrix o valor) a array plano JS.
 * @param {*} arg
 * @returns {number[]}
 */
function _aArrayPlano(arg) {
  if (Array.isArray(arg)) return arg.flat(Infinity);
  if (arg && typeof arg.toArray === 'function') return arg.toArray().flat(Infinity);
  if (arg && typeof arg._data !== 'undefined') return arg._data.flat(Infinity);
  throw new Error('Se esperaba un array de números.');
}

/**
 * Registra las funciones de los módulos bases, estadística y complejos
 * dentro de math.js para que sean accesibles vía evaluate().
 */
function _registrarFuncionesExtendidas() {
  _math.import({
    // ─── Conversión de Bases ───────────────────────────────────────────────
    decToBin:  function (n) { return convertDecimalToBinary(n); },
    decToHex:  function (n) { return convertDecimalToHex(n); },
    decToOct:  function (n) { return convertDecimalToOctal(n); },
    binToDec:  function (s) { return convertBinaryToDecimal(s); },
    hexToDec:  function (s) { return convertHexToDecimal(s); },
    octToDec:  function (s) { return convertOctalToDecimal(s); },

    // ─── Estadística ───────────────────────────────────────────────────────
    mean:       function (arr) { return estadistica.mean(_aArrayPlano(arr)); },
    median:     function (arr) { return estadistica.median(_aArrayPlano(arr)); },
    mode:       function (arr) { return estadistica.mode(_aArrayPlano(arr)); },
    variance:   function (arr) { return estadistica.variance(_aArrayPlano(arr)); },
    stdDev:     function (arr) { return estadistica.stdDev(_aArrayPlano(arr)); },
    range:      function (arr) { return estadistica.range(_aArrayPlano(arr)); },
    percentile: function (arr, p) { return estadistica.percentile(_aArrayPlano(arr), p); },

    // ─── Números Complejos ────────────────────────────────────────────────
    cAdd:       function (z1, z2) { return complejos.add(z1, z2); },
    cSub:       function (z1, z2) { return complejos.subtract(z1, z2); },
    cMul:       function (z1, z2) { return complejos.multiply(z1, z2); },
    cDiv:       function (z1, z2) { return complejos.divide(z1, z2); },
    cModulus:   function (z) { return complejos.modulus(z); },
    cArgument:  function (z) { return complejos.argument(z); },
    cConjugate: function (z) { return complejos.conjugate(z); },
    cPower:     function (z, n) { return complejos.power(z, n); },
    cSqrt:      function (z) { return complejos.sqrt(z); },
  }, { override: true });
}

// ─── Solucionadores de Ecuaciones ─────────────────────────────────────────

/**
 * Resuelve ecuación lineal: ax + b = 0 → x = -b/a
 */
export function solveLinear(a, b) {
  if (a === 0) throw new Error('El coeficiente "a" no puede ser cero en una ecuación lineal.');
  return { x: -b / a };
}

/**
 * Resuelve ecuación cuadrática: ax² + bx + c = 0
 * Retorna raíces reales o complejas.
 */
export function solveQuadratic(a, b, c) {
  if (a === 0) return { ...solveLinear(b, c), tipo: 'lineal' };
  const discriminante = b * b - 4 * a * c;

  if (discriminante > 0) {
    return {
      tipo: 'dos_reales',
      x1: (-b + Math.sqrt(discriminante)) / (2 * a),
      x2: (-b - Math.sqrt(discriminante)) / (2 * a),
    };
  } else if (discriminante === 0) {
    return {
      tipo: 'una_real',
      x1: -b / (2 * a),
    };
  } else {
    const parteReal = -b / (2 * a);
    const parteImag = Math.sqrt(-discriminante) / (2 * a);
    return {
      tipo: 'compleja',
      x1: `${parteReal.toFixed(6)} + ${parteImag.toFixed(6)}i`,
      x2: `${parteReal.toFixed(6)} - ${parteImag.toFixed(6)}i`,
    };
  }
}

// ─── Funciones Numéricas ──────────────────────────────────────────────────────

/**
 * Factorial iterativo (soporta enteros hasta ~170).
 * @param {number} n
 * @returns {number}
 */
export function factorial(n) {
  if (!Number.isInteger(n) || n < 0) throw new Error('El factorial requiere un entero no negativo.');
  if (n > 170) throw new Error('Desbordamiento factorial (n > 170).');
  let resultado = 1;
  for (let i = 2; i <= n; i++) resultado *= i;
  return resultado;
}

/**
 * Convierte un número a notación de ingeniería (exponente múltiplo de 3).
 * @param {number} valor
 * @param {number} precision
 * @returns {string}
 */
export function toEngineeringNotation(valor, precision = 3) {
  if (valor === 0) return '0';
  const signo = valor < 0 ? '-' : '';
  const abs   = Math.abs(valor);
  const exp   = Math.floor(Math.log10(abs));
  const expIng = Math.floor(exp / 3) * 3;
  const mantisa = abs / Math.pow(10, expIng);
  return `${signo}${mantisa.toFixed(precision)}×10^${expIng}`;
}

// ─── Evaluador Principal ──────────────────────────────────────────────────────

/**
 * Evalúa una cadena de expresión matemática usando math.js.
 * Soporta todos los operadores estándar, funciones y constantes inyectadas.
 *
 * @param {string} expresion   - Cadena de expresión cruda
 * @param {string|boolean} modoAngulo - 'RAD' | 'DEG' | 'GRAD'  (boolean legacy: false=RAD, true=DEG)
 * @returns {string}           - Resultado como cadena formateada
 */
export function evaluate(expresion, modoAngulo = 'RAD') {
  if (!_math) throw new Error('Motor matemático no inicializado. Llama initMathEngine() primero.');
  if (!expresion || expresion.trim() === '') return '';

  try {
    let expr = preprocesarExpresion(expresion, modoAngulo);
    const resultado = _math.evaluate(expr, { ..._ambito });

    // Manejar resultados matriciales de math.js
    if (_math.typeOf(resultado) === 'Matrix') {
      return formatearMatrizMathJs(resultado);
    }

    // Manejar números complejos
    if (typeof resultado === 'object' && resultado.real !== undefined) {
      const re = +resultado.real.toFixed(10);
      const im = +resultado.imag.toFixed(10);
      if (im === 0) return formatearNumero(re);
      return `${formatearNumero(re)} ${im >= 0 ? '+' : '-'} ${formatearNumero(Math.abs(im))}i`;
    }

    if (typeof resultado === 'boolean') return resultado.toString();
    if (typeof resultado === 'number') {
      if (!isFinite(resultado)) return resultado > 0 ? 'Infinito' : resultado < 0 ? '-Infinito' : 'Indefinido';
      if (isNaN(resultado)) return 'Indefinido';
      return formatearNumero(resultado);
    }

    return String(resultado);

  } catch (err) {
    return clasificarError(err.message);
  }
}

// ─── Preprocesamiento ─────────────────────────────────────────────────────────

/**
 * Normaliza y preprocesa la expresión del usuario antes de la evaluación.
 * - Reemplaza × ÷ con * /
 * - Maneja multiplicación implícita: 2π → 2*pi
 * - En modo DEG/GRAD, envuelve los argumentos de las funciones trigonométricas
 *   directas con la conversión angular, y las inversas con la conversión de salida.
 *
 * Conversiones:
 *   DEG  → entrada: arg * pi / 180   | salida: resultado * 180 / pi
 *   GRAD → entrada: arg * pi / 200   | salida: resultado * 200 / pi
 *
 * Ejemplo DEG:  sin(90)    → sin((90) * pi / 180)      → 1
 * Ejemplo GRAD: sin(100)   → sin((100) * pi / 200)     → 1
 * Ejemplo DEG:  asin(1)    → ((asin(1)) * 180 / pi)    → 90
 */
function preprocesarExpresion(expr, modoAngulo) {
  // Compatibilidad retroactiva con llamadas que pasan boolean
  if (modoAngulo === true)  modoAngulo = 'DEG';
  if (modoAngulo === false) modoAngulo = 'RAD';

  let e = expr
    .replace(/×/g, '*')
    .replace(/÷/g, '/')
    .replace(/π/g, 'pi')
    .replace(/\^/g, '^')
    .replace(/(\d)(pi|e\b)/g, '$1*$2')
    .replace(/(pi|e\b)(\d)/g, '$1*$2');

  if (modoAngulo === 'DEG' || modoAngulo === 'GRAD') {
    // Funciones que reciben ángulos: envuelve fn(arg) → fn((arg) * factor)
    // Estrategia: insertar marcador ANTES de fn( para capturar fn(arg) completo,
    // luego el wrapper reescribe fn(arg) → fn((arg) * factor).
    const TRIG_DIRECTAS = ['sin', 'cos', 'tan', 'sinh', 'cosh', 'tanh'];
    for (const fn of TRIG_DIRECTAS) {
      const re = new RegExp(`\\b${fn}\\(`, 'g');
      e = e.replace(re, `_TRIG_${fn.toUpperCase()}_(`);
    }

    // Funciones que retornan ángulos en radianes → convertir salida con _RAD2ANG_
    const TRIG_INVERSAS = ['asin', 'acos', 'atan'];
    for (const fn of TRIG_INVERSAS) {
      const re = new RegExp(`\\b${fn}\\(`, 'g');
      e = e.replace(re, `_RAD2ANG_(${fn}(`);
    }

    // Expandir marcadores con el factor correcto según el modo
    e = _expandirMarcadoresAngulo(e, modoAngulo);
  }

  return e;
}

/**
 * Expande los marcadores de conversión angular introducidos por preprocesarExpresion.
 * Recorre la cadena carácter a carácter para anidar correctamente los paréntesis.
 *
 * Para funciones directas: _TRIG_SIN_(arg)  →  sin((arg) * factor)
 * Para funciones inversas: _RAD2ANG_(fn(arg))  →  ((fn(arg)) * factor)
 *
 * @param {string} expr
 * @param {string} modoAngulo - 'DEG' | 'GRAD'
 * @returns {string}
 */
function _expandirMarcadoresAngulo(expr, modoAngulo) {
  // Factores de conversión según el modo
  //   DEG:  1° = π/180 rad   →  entrada × pi/180  |  salida × 180/pi
  //   GRAD: 1g = π/200 rad   →  entrada × pi/200  |  salida × 200/pi
  const factorEntrada = modoAngulo === 'GRAD' ? 'pi / 200' : 'pi / 180';
  const factorSalida  = modoAngulo === 'GRAD' ? '200 / pi' : '180 / pi';

  // Expandir cada función trig directa: _TRIG_SIN_(arg) → sin((arg) * factor)
  const NOMBRES = ['sin', 'cos', 'tan', 'sinh', 'cosh', 'tanh'];
  for (const fn of NOMBRES) {
    const marcador = `_TRIG_${fn.toUpperCase()}_(`;
    expr = _envolverMarcador(expr, marcador, (inner) => `${fn}((${inner}) * ${factorEntrada})`);
  }

  // Expandir inversas: _RAD2ANG_(fn(arg)) → ((fn(arg)) * factorSalida)
  expr = _envolverMarcador(expr, '_RAD2ANG_(', (inner) => `((${inner}) * ${factorSalida})`);
  return expr;
}

/**
 * Encuentra todas las ocurrencias del marcador en la cadena y reemplaza cada una
 * por wrapper(contenido_entre_parentesis), respetando el anidamiento.
 * @param {string} expr
 * @param {string} marcador  - p.ej. '_DEG2RAD_('
 * @param {function} wrapper - función (inner: string) => string
 * @returns {string}
 */
function _envolverMarcador(expr, marcador, wrapper) {
  let resultado = '';
  let i = 0;

  while (i < expr.length) {
    const idx = expr.indexOf(marcador, i);
    if (idx === -1) {
      resultado += expr.slice(i);
      break;
    }

    // Copiar todo lo anterior al marcador
    resultado += expr.slice(i, idx);

    // Avanzar pasado el marcador (que ya incluye el '(')
    let pos = idx + marcador.length;
    let profundidad = 1;
    const inicio = pos;

    // Recorrer hasta encontrar el ')' de cierre del marcador
    while (pos < expr.length && profundidad > 0) {
      if (expr[pos] === '(') profundidad++;
      else if (expr[pos] === ')') profundidad--;
      pos++;
    }

    // inner es el contenido entre los paréntesis del marcador
    const inner = expr.slice(inicio, pos - 1);
    resultado += wrapper(inner);
    i = pos;
  }

  return resultado;
}

// ─── Formateo ─────────────────────────────────────────────────────────────────

/**
 * Formatea un número hasta 12 cifras significativas, eliminando ceros finales.
 */
export function formatearNumero(n) {
  if (Number.isInteger(n) && Math.abs(n) < 1e15) return n.toString();

  // Usar exponencial para valores muy grandes o pequeños
  if (Math.abs(n) >= 1e12 || (Math.abs(n) < 1e-6 && n !== 0)) {
    return n.toPrecision(10).replace(/\.?0+e/, 'e');
  }

  // Redondear a 12 dígitos significativos
  const str = parseFloat(n.toPrecision(12)).toString();
  return str;
}

// Alias para compatibilidad con main.js
export const formatNumber = formatearNumero;

function formatearMatrizMathJs(m) {
  const arr = m.toArray();
  return arr.map(fila =>
    Array.isArray(fila)
      ? '[' + fila.map(v => formatearNumero(v)).join(', ') + ']'
      : formatearNumero(fila)
  ).join('\n');
}

// ─── Clasificación de Errores ────────────────────────────────────────────────

function clasificarError(msg) {
  if (!msg) return 'Error';
  const m = msg.toLowerCase();
  if (m.includes('divide by zero') || m.includes('division by zero')) return 'Indefinido';
  if (m.includes('undefined') || m.includes('is not defined'))         return 'Error de Sintaxis';
  if (m.includes('unexpected'))                                         return 'Error de Sintaxis';
  if (m.includes('parenthesis') || m.includes('bracket'))              return 'Error de Sintaxis';
  return 'Error de Sintaxis';
}
