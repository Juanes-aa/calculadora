/**
 * parser.js
 * Validador de entrada y tokenizador de expresiones para la capa de visualización.
 * Proporciona saneamiento previo a la evaluación y formateo para la pantalla.
 */

// ─── Validación ───────────────────────────────────────────────────────────────

/**
 * Verifica el balance de paréntesis en una expresión.
 * @param {string} expr
 * @returns {{ valid: boolean, message: string }}
 */
export function checkParentheses(expr) {
  let profundidad = 0;
  for (const ch of expr) {
    if (ch === '(') profundidad++;
    else if (ch === ')') {
      profundidad--;
      if (profundidad < 0) return { valid: false, message: 'Paréntesis de cierre inesperado.' };
    }
  }
  if (profundidad !== 0) return { valid: false, message: `Faltan ${profundidad} paréntesis de cierre.` };
  return { valid: true, message: '' };
}

/**
 * Detecta errores de sintaxis obvios antes de enviar al motor matemático.
 * Retorna una cadena de error o null si está limpio.
 * @param {string} expr
 * @returns {string|null}
 */
export function quickValidate(expr) {
  if (!expr || expr.trim() === '') return 'Expresión vacía.';

  // Operadores colgantes (excepto menos unario al inicio)
  if (/[+\-*/^%]\s*$/.test(expr)) return 'La expresión termina con un operador.';

  // Operadores dobles (ej: **)
  if (/[+*/^%]{2,}/.test(expr)) return 'Operadores consecutivos detectados.';

  // Verificación de paréntesis
  const pCheck = checkParentheses(expr);
  if (!pCheck.valid) return pCheck.message;

  return null; // Todo correcto
}

// ─── Formateo para Pantalla ───────────────────────────────────────────────────

/**
 * Formatea una expresión para la pantalla, reemplazando operadores crudos por símbolos.
 * Ejemplo: "3*pi/2" → "3×π÷2"
 * @param {string} expr
 * @returns {string}
 */
export function formatForDisplay(expr) {
  return expr
    .replace(/\*/g, '×')
    .replace(/\//g, '÷')
    .replace(/\bpi\b/gi, 'π')
    .replace(/sqrt\(/g, '√(')
    .replace(/\bInfinity\b/g, '∞');
}

/**
 * Convierte símbolos de pantalla de vuelta a sintaxis evaluable.
 * @param {string} exprPantalla
 * @returns {string}
 */
export function parseFromDisplay(exprPantalla) {
  return exprPantalla
    .replace(/×/g, '*')
    .replace(/÷/g, '/')
    .replace(/π/g, 'pi')
    .replace(/√\(/g, 'sqrt(')
    .replace(/∞/g, 'Infinity');
}

// ─── Tokenizador ─────────────────────────────────────────────────────────────

/**
 * Tokeniza una cadena de expresión en un array de objetos token.
 * Cada token: { tipo: 'numero'|'operador'|'funcion'|'parentesis'|'constante', valor: string }
 * Usado para resaltado de sintaxis en la pantalla.
 * @param {string} expr
 * @returns {Array<{tipo:string, valor:string}>}
 */
export function tokenize(expr) {
  const tokens = [];
  const re = /(\d+\.?\d*(?:e[+-]?\d+)?)|([a-zA-Z_][a-zA-Z0-9_]*)|([+\-*/^%])|([()])|(\s+)|(\.)/g;
  let match;

  const FUNCIONES_CONOCIDAS = new Set([
    'sin','cos','tan','asin','acos','atan','sinh','cosh','tanh',
    'log','log10','log2','ln','exp','sqrt','cbrt','abs','ceil','floor','round',
    'sign','factorial','nthRoot','pow','mod',
  ]);

  const CONSTANTES_CONOCIDAS = new Set(['pi','e','phi','c','g','h','hbar','kb','na']);

  while ((match = re.exec(expr)) !== null) {
    const [, num, palabra, op, paren] = match;
    if (num)     tokens.push({ tipo: 'numero',     valor: num });
    else if (palabra) {
      const lower = palabra.toLowerCase();
      if (FUNCIONES_CONOCIDAS.has(lower))   tokens.push({ tipo: 'funcion',   valor: palabra });
      else if (CONSTANTES_CONOCIDAS.has(lower)) tokens.push({ tipo: 'constante', valor: palabra });
      else tokens.push({ tipo: 'identificador', valor: palabra });
    }
    else if (op)    tokens.push({ tipo: 'operador',    valor: op });
    else if (paren) tokens.push({ tipo: 'parentesis',  valor: paren });
  }

  return tokens;
}

// ─── Gestión del Historial ────────────────────────────────────────────────────

const MAX_HISTORIAL = 50;

export class CalculationHistory {
  constructor() {
    this._items = [];
  }

  /** Agrega una entrada al historial. */
  push(expresion, resultado) {
    this._items.unshift({ expresion, resultado, timestamp: Date.now() });
    if (this._items.length > MAX_HISTORIAL) this._items.pop();
  }

  get items() { return [...this._items]; }
  clear()     { this._items = []; }
  getLast(n = 1) { return this._items.slice(0, n); }
}
