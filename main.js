/**
 * main.js
 * Punto de entrada de la aplicación. Orquesta los eventos de la interfaz,
 * la conexión entre módulos y el renderizado.
 * Cargado como type="module" desde index.html.
 */

import { initMathEngine, evaluate, factorial, toEngineeringNotation, solveLinear, solveQuadratic, formatNumber } from './modules/mathEngine.js';
import { quickValidate, formatForDisplay, parseFromDisplay, CalculationHistory } from './modules/parser.js';
import { CONSTANTS } from './modules/constants.js';
import { UNITS, convert } from './modules/units.js';
import {
  parseMatrixString, formatMatrix,
  matAdd, matSub, matMul, matDet, matInverse, matTranspose, isValidMatrix
} from './modules/matrix.js';
import {
  convertDecimalToBinary, convertDecimalToHex, convertDecimalToOctal,
  convertBinaryToDecimal, convertHexToDecimal, convertOctalToDecimal
} from './modules/bases.js';
import { mean, median, mode, variance, stdDev, range, percentile } from './modules/estadistica.js';
import {
  complejo, add, subtract, multiply, divide,
  modulus, argument, conjugate, power, sqrt, toPolar, formatComplex
} from './modules/complejos.js';

// ─── Estado de la Aplicación ──────────────────────────────────────────────────

let sessionCalcCount = 0;  // Contador de cálculos exitosos en la sesión actual

const estado = {
  expresion:   '',      // Expresión evaluable cruda (sin símbolos de pantalla)
  exprPantalla: '',     // Formateada para la pantalla (con símbolos π, etc.)
  resultado:   '',      // Último resultado calculado
  modoAngulo:  'RAD',   // Modo ángulo: 'RAD' | 'DEG' | 'GRAD'
  memoria:     0,       // Registro de memoria
  historial:   new CalculationHistory(),
  graficoFns:  [],      // Funciones graficadas
};

// ─── Referencias del DOM ──────────────────────────────────────────────────────

const dom = {
  display:       () => document.getElementById('display'),
  exprPantalla:  () => document.getElementById('display-expr'),
  resultPantalla:() => document.getElementById('display-result'),
  modoAngulo:    () => document.getElementById('angle-mode-group'),
  listaHistorial:() => document.getElementById('history-list'),
  memPantalla:   () => document.getElementById('mem-display'),

  // Matriz
  matA:          () => document.getElementById('mat-a'),
  matB:          () => document.getElementById('mat-b'),
  matResultado:  () => document.getElementById('mat-result'),

  // Unidades
  uValor:        () => document.getElementById('unit-value'),
  uDesde:        () => document.getElementById('unit-from'),
  uHacia:        () => document.getElementById('unit-to'),
  uCategoria:    () => document.getElementById('unit-category'),
  uResultado:    () => document.getElementById('unit-result'),

  // Solucionador
  tipoEcuacion:  () => document.getElementById('solver-type'),
  coefA:         () => document.getElementById('solver-a'),
  coefB:         () => document.getElementById('solver-b'),
  coefC:         () => document.getElementById('solver-c'),
  solResultado:  () => document.getElementById('solver-result'),

  // Gráfica
  graficaInput:  () => document.getElementById('graph-input'),
  graficaCanvas: () => document.getElementById('graph-canvas'),
};

// ─── Actualización de Pantalla ────────────────────────────────────────────────

function actualizarPantalla() {
  const exprEl = dom.exprPantalla();
  const resEl  = dom.resultPantalla();

  exprEl.textContent = estado.exprPantalla || '0';

  const nuevoResultado = estado.resultado || '';
  const esError = ['Error de Sintaxis', 'Indefinido', 'No Soportado'].includes(estado.resultado);

  // Animar solo si el resultado cambió y no está vacío
  if (nuevoResultado && nuevoResultado !== resEl.textContent) {
    resEl.classList.remove('resultado-nuevo');
    // Force reflow para reiniciar la animación aunque el valor anterior fuera igual
    void resEl.offsetWidth;
    resEl.classList.add('resultado-nuevo');
  }

  resEl.textContent = nuevoResultado;
  resEl.style.color = esError ? 'var(--peligro)' : 'var(--exito)';
}

// ─── Manejador de Entrada ─────────────────────────────────────────────────────

function agregarAExpresion(crudo, pantalla) {
  estado.expresion   += crudo;
  estado.exprPantalla += (pantalla || crudo);

  // Evaluación en tiempo real para expresiones simples
  const validacion = quickValidate(estado.expresion);
  if (!validacion) {
    const res = evaluate(estado.expresion, estado.modoAngulo);
    if (!['Error de Sintaxis', 'Indefinido', 'No Soportado', ''].includes(res)) {
      estado.resultado = '= ' + res;
    }
  }
  actualizarPantalla();
}

function limpiarTodo() {
  estado.expresion    = '';
  estado.exprPantalla = '';
  estado.resultado    = '';
  actualizarPantalla();
}

function borrarUltimo() {
  estado.expresion    = estado.expresion.slice(0, -1);
  estado.exprPantalla = estado.exprPantalla.slice(0, -1);
  estado.resultado    = '';
  actualizarPantalla();
}

function calcularResultado() {
  if (!estado.expresion) return;

  const err = quickValidate(estado.expresion);
  if (err) {
    estado.resultado = 'Error de Sintaxis';
    actualizarPantalla();
    return;
  }

  const resultado = evaluate(estado.expresion, estado.modoAngulo);
  estado.resultado = resultado;
  estado.historial.push(estado.exprPantalla, resultado);
  renderizarHistorial();

  // Usar el resultado como nueva expresión para encadenamiento
  if (!['Error de Sintaxis', 'Indefinido', 'No Soportado'].includes(resultado)) {
    const limpio = resultado.replace(/^= /, '');
    estado.expresion    = limpio;
    estado.exprPantalla = formatForDisplay(limpio);
    sessionCalcCount++;
    updateSessionCounter();
  }

  actualizarPantalla();
}

// ─── Conexión de Botones ──────────────────────────────────────────────────────

function configurarBotones() {
  document.querySelectorAll('[data-input]').forEach(btn => {
    btn.addEventListener('click', () => {
      const crudo    = btn.getAttribute('data-input');
      const pantalla = btn.getAttribute('data-display') || crudo;
      agregarAExpresion(crudo, pantalla);
    });
  });

  document.querySelectorAll('[data-action]').forEach(btn => {
    btn.addEventListener('click', () => manejarAccion(btn.getAttribute('data-action')));
  });
}

function manejarAccion(accion) {
  switch (accion) {
    case 'clear':         limpiarTodo(); break;
    case 'back':          borrarUltimo(); break;
    case 'equals':        calcularResultado(); break;
    case 'negate':        negarExpresion(); break;
    case 'percent':       agregarAExpresion('%', '%'); break;
    case 'pi':            agregarAExpresion('pi', 'π'); break;
    case 'e_const':       agregarAExpresion('e', 'e'); break;
    case 'sqrt':          agregarAExpresion('sqrt(', '√('); break;
    case 'cbrt':          agregarAExpresion('cbrt(', '∛('); break;
    case 'square':        agregarAExpresion('^2', '²'); break;
    case 'cube':          agregarAExpresion('^3', '³'); break;
    case 'power':         agregarAExpresion('^', '^'); break;
    case 'inv':           agregarAExpresion('1/', '1÷'); break;
    case 'factorial':     agregarAExpresion('!', '!'); break;
    case 'abs':           agregarAExpresion('abs(', '|'); break;
    case 'log':           agregarAExpresion('log10(', 'log('); break;
    case 'ln':            agregarAExpresion('log(', 'ln('); break;
    case 'exp':           agregarAExpresion('exp(', 'eˣ('); break;
    case 'sin':           agregarAExpresion('sin(', 'sen('); break;
    case 'cos':           agregarAExpresion('cos(', 'cos('); break;
    case 'tan':           agregarAExpresion('tan(', 'tan('); break;
    case 'asin':          agregarAExpresion('asin(', 'sen⁻¹('); break;
    case 'acos':          agregarAExpresion('acos(', 'cos⁻¹('); break;
    case 'atan':          agregarAExpresion('atan(', 'tan⁻¹('); break;
    case 'sinh':          agregarAExpresion('sinh(', 'senh('); break;
    case 'cosh':          agregarAExpresion('cosh(', 'cosh('); break;
    case 'tanh':          agregarAExpresion('tanh(', 'tanh('); break;
    case 'eng_notation':  aplicarNotacionIng(); break;
    case 'mem_store':     guardarMemoria(); break;
    case 'mem_recall':    recuperarMemoria(); break;
    case 'mem_clear':     limpiarMemoria(); break;
    case 'mem_add':       sumarMemoria(); break;
    case 'ans':           agregarAExpresion(estado.resultado.replace(/^= /, '') || '0', 'Ant'); break;
    case 'clear_history': estado.historial.clear(); renderizarHistorial(); break;
    default: console.warn('Acción desconocida:', accion);
  }
}

// ─── Soporte de Teclado ───────────────────────────────────────────────────────

document.addEventListener('keydown', (e) => {
  const tecla = e.key;
  if (tecla === 'Enter' || tecla === '=')    { calcularResultado(); return; }
  if (tecla === 'Backspace')                 { borrarUltimo(); return; }
  if (tecla === 'Escape')                    { limpiarTodo(); return; }
  if (tecla === '(' || tecla === ')')        { agregarAExpresion(tecla, tecla); return; }
  if ('0123456789.'.includes(tecla))         { agregarAExpresion(tecla, tecla); return; }
  if ('+-*/%'.includes(tecla))               { agregarAExpresion(tecla, { '*': '×', '/': '÷' }[tecla] || tecla); return; }
  if (tecla === '^')                          { agregarAExpresion('^', '^'); return; }
});

// ─── Modo Ángulo ──────────────────────────────────────────────────────────────

document.getElementById('angle-mode-group').addEventListener('click', (e) => {
  const btn = e.target.closest('.mode-btn');
  if (!btn) return;
  const grupo = document.getElementById('angle-mode-group');
  grupo.querySelectorAll('.mode-btn').forEach(b => {
    b.classList.remove('activo');
    b.setAttribute('aria-pressed', 'false');
  });
  btn.classList.add('activo');
  btn.setAttribute('aria-pressed', 'true');
  estado.modoAngulo = btn.dataset.mode;
});

// ─── Funciones de Memoria ─────────────────────────────────────────────────────

function guardarMemoria() {
  const val = parseFloat(estado.expresion);
  if (!isNaN(val)) { estado.memoria = val; actualizarPantallaMemoria(); }
}
function recuperarMemoria() { agregarAExpresion(estado.memoria.toString(), estado.memoria.toString()); }
function limpiarMemoria()   { estado.memoria = 0; actualizarPantallaMemoria(); }
function sumarMemoria() {
  const val = parseFloat(evaluate(estado.expresion));
  if (!isNaN(val)) { estado.memoria += val; actualizarPantallaMemoria(); }
}
function actualizarPantallaMemoria() {
  const el = dom.memPantalla();
  if (el) el.textContent = estado.memoria !== 0 ? `M: ${formatNumber(estado.memoria)}` : '';
}

function negarExpresion() {
  if (estado.expresion.startsWith('-')) {
    estado.expresion    = estado.expresion.slice(1);
    estado.exprPantalla = estado.exprPantalla.slice(1);
  } else {
    estado.expresion    = '-' + estado.expresion;
    estado.exprPantalla = '-' + estado.exprPantalla;
  }
  actualizarPantalla();
}

function aplicarNotacionIng() {
  const val = parseFloat(evaluate(estado.expresion));
  if (!isNaN(val)) {
    const ing = toEngineeringNotation(val);
    estado.exprPantalla = ing;
    estado.expresion    = val.toString();
    estado.resultado    = '';
    actualizarPantalla();
  }
}

// ─── Renderizador de Historial ────────────────────────────────────────────────

function renderizarHistorial() {
  const lista = dom.listaHistorial();
  if (!lista) return;
  lista.innerHTML = estado.historial.items.map(item => `
    <div class="history-item"
         data-expr="${encodeURIComponent(item.expresion)}">
      <div class="hist-body">
        <div class="hist-expr">${item.expresion}</div>
        <div class="hist-result-row">
          <span class="hist-equals">=</span>
          <span class="hist-res">${item.resultado}</span>
        </div>
      </div>
      <span class="hist-arrow" aria-hidden="true">↩</span>
    </div>
  `).join('');

  lista.querySelectorAll('.history-item').forEach(item => {
    item.addEventListener('click', () => {
      const expr = decodeURIComponent(item.getAttribute('data-expr'));
      estado.expresion    = expr;
      estado.exprPantalla = formatForDisplay(expr);
      estado.resultado    = '';
      actualizarPantalla();
    });
  });
}

// ─── Panel de Constantes ──────────────────────────────────────────────────────

function renderizarConstantes() {
  const panel = document.getElementById('constants-panel');
  if (!panel) return;
  panel.innerHTML = Object.entries(CONSTANTS).map(([clave, c]) => `
    <button class="constante-btn" data-value="${c.value}" data-symbol="${c.symbol}">
      <div style="display:flex;align-items:center;gap:8px;min-width:0;">
        <span class="constante-simbolo">${c.symbol}</span>
        <span class="constante-nombre">${c.label}</span>
      </div>
      <span class="constante-valor">
        ${typeof c.value === 'number' && !Number.isInteger(c.value) ? c.value.toExponential(3) : c.value}
      </span>
    </button>
  `).join('');

  panel.querySelectorAll('.constante-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const val = btn.getAttribute('data-value');
      const sim = btn.getAttribute('data-symbol');
      agregarAExpresion(val, sim);
    });
  });
}

// ─── Conversor de Unidades ────────────────────────────────────────────────────

function configurarConversorUnidades() {
  const selCategoria = dom.uCategoria();
  if (!selCategoria) return;

  // Llenar categorías
  selCategoria.innerHTML = Object.entries(UNITS).map(([k, v]) =>
    `<option value="${k}">${v.label}</option>`
  ).join('');

  selCategoria.addEventListener('change', llenarSelectsUnidades);
  llenarSelectsUnidades();

  document.getElementById('btn-convert')?.addEventListener('click', realizarConversion);
}

function llenarSelectsUnidades() {
  const cat    = dom.uCategoria()?.value;
  const unidades = UNITS[cat]?.units;
  if (!unidades) return;

  const opciones = Object.entries(unidades).map(([k, v]) =>
    `<option value="${k}">${v.label}</option>`
  ).join('');

  const desde = dom.uDesde();
  const hacia = dom.uHacia();
  if (desde) desde.innerHTML = opciones;
  if (hacia) {
    hacia.innerHTML = opciones;
    if (hacia.options.length > 1) hacia.selectedIndex = 1;
  }
}

function realizarConversion() {
  const val  = parseFloat(dom.uValor()?.value);
  const desde = dom.uDesde()?.value;
  const hacia  = dom.uHacia()?.value;
  const cat   = dom.uCategoria()?.value;
  const res   = dom.uResultado();

  if (isNaN(val)) { if (res) res.textContent = 'Entrada inválida'; return; }

  try {
    const convertido = convert(val, desde, hacia, cat);
    if (res) {
      res.textContent = `${val} ${desde} = ${formatNumber(convertido)} ${hacia}`;
      res.className   = 'panel-resultado resultado-ok';
    }
  } catch (e) {
    if (res) {
      res.textContent = e.message;
      res.className   = 'panel-resultado resultado-error';
    }
  }
}

// ─── Panel de Matrices ────────────────────────────────────────────────────────

function configurarPanelMatriz() {
  document.getElementById('btn-mat-op')?.addEventListener('click', realizarOpMatriz);
}

function realizarOpMatriz() {
  const op   = document.getElementById('mat-op')?.value;
  const strA = dom.matA()?.value.trim();
  const strB = dom.matB()?.value.trim();
  const res  = dom.matResultado();

  try {
    const A = parseMatrixString(strA);
    if (!isValidMatrix(A)) throw new Error('La Matriz A es inválida.');

    let resultado;

    if (op === 'det') {
      resultado = `det(A) = ${formatNumber(matDet(A))}`;
    } else if (op === 'inv') {
      resultado = 'A⁻¹ =\n' + formatMatrix(matInverse(A));
    } else if (op === 'transpose') {
      resultado = 'Aᵀ =\n' + formatMatrix(matTranspose(A));
    } else {
      if (!strB) throw new Error('Se requiere la Matriz B para esta operación.');
      const B = parseMatrixString(strB);
      if (!isValidMatrix(B)) throw new Error('La Matriz B es inválida.');

      if (op === 'add')      resultado = 'A + B =\n' + formatMatrix(matAdd(A, B));
      else if (op === 'sub') resultado = 'A − B =\n' + formatMatrix(matSub(A, B));
      else if (op === 'mul') resultado = 'A × B =\n' + formatMatrix(matMul(A, B));
      else throw new Error('Operación desconocida.');
    }

    if (res) {
      res.textContent = resultado;
      res.className   = 'panel-resultado resultado-ok';
    }
  } catch (e) {
    if (res) {
      res.textContent = '⚠ ' + e.message;
      res.className   = 'panel-resultado resultado-error';
    }
  }
}

// ─── Solucionador de Ecuaciones ───────────────────────────────────────────────

function configurarSolucionador() {
  const tipoSel = dom.tipoEcuacion();
  tipoSel?.addEventListener('change', () => {
    const filC = document.getElementById('solver-c-row');
    if (filC) filC.style.display = tipoSel.value === 'quadratic' ? '' : 'none';
  });

  document.getElementById('btn-solve')?.addEventListener('click', realizarSolucion);
}

function realizarSolucion() {
  const tipo = dom.tipoEcuacion()?.value;
  const a    = parseFloat(dom.coefA()?.value);
  const b    = parseFloat(dom.coefB()?.value);
  const c    = parseFloat(dom.coefC()?.value);
  const res  = dom.solResultado();

  try {
    let resultado;
    if (tipo === 'linear') {
      const sol = solveLinear(a, b);
      resultado = `x = ${formatNumber(sol.x)}`;
    } else {
      const sol = solveQuadratic(a, b, c);
      if (sol.tipo === 'dos_reales') {
        resultado = `x₁ = ${formatNumber(sol.x1)}\nx₂ = ${formatNumber(sol.x2)}`;
      } else if (sol.tipo === 'una_real') {
        resultado = `x = ${formatNumber(sol.x1)}  (raíz repetida)`;
      } else {
        resultado = `x₁ = ${sol.x1}\nx₂ = ${sol.x2}`;
      }
    }

    if (res) {
      res.textContent = resultado;
      res.className   = 'panel-resultado resultado-ok';
    }
  } catch (e) {
    if (res) {
      res.textContent = '⚠ ' + e.message;
      res.className   = 'panel-resultado resultado-error';
    }
  }
}

// ─── Motor Gráfico ────────────────────────────────────────────────────────────

function configurarGraficadora() {
  document.getElementById('btn-plot')?.addEventListener('click', graficarFuncion);
  document.getElementById('btn-clear-graph')?.addEventListener('click', limpiarGrafica);

  // Controles de zoom (movidos aquí desde el scope del módulo)
  document.getElementById('btn-zoom-in')?.addEventListener('click', () => {
    const escala = 0.7;
    const cx = (zoomGrafica.xMin + zoomGrafica.xMax) / 2;
    const cy = (zoomGrafica.yMin + zoomGrafica.yMax) / 2;
    const hw = (zoomGrafica.xMax - zoomGrafica.xMin) / 2 * escala;
    const hh = (zoomGrafica.yMax - zoomGrafica.yMin) / 2 * escala;
    zoomGrafica = { xMin: cx - hw, xMax: cx + hw, yMin: cy - hh, yMax: cy + hh };
    graficarFuncion();
  });

  document.getElementById('btn-zoom-out')?.addEventListener('click', () => {
    const escala = 1 / 0.7;
    const cx = (zoomGrafica.xMin + zoomGrafica.xMax) / 2;
    const cy = (zoomGrafica.yMin + zoomGrafica.yMax) / 2;
    const hw = (zoomGrafica.xMax - zoomGrafica.xMin) / 2 * escala;
    const hh = (zoomGrafica.yMax - zoomGrafica.yMin) / 2 * escala;
    zoomGrafica = { xMin: cx - hw, xMax: cx + hw, yMin: cy - hh, yMax: cy + hh };
    graficarFuncion();
  });

  // Corrección: el HTML usa id="btn-zoom-reset", no "btn-reset-zoom"
  document.getElementById('btn-zoom-reset')?.addEventListener('click', () => {
    zoomGrafica = { xMin: -10, xMax: 10, yMin: -10, yMax: 10 };
    graficarFuncion();
  });
}

let zoomGrafica = { xMin: -10, xMax: 10, yMin: -10, yMax: 10 };

function graficarFuncion() {
  const entrada = dom.graficaInput()?.value?.trim();
  if (!entrada) return;

  const canvas = dom.graficaCanvas();
  if (!canvas) return;

  const funciones = entrada.split(',').map(s => s.trim()).filter(Boolean);
  const colores   = ['#00e5ff', '#ff4081', '#76ff03', '#ffab40', '#e040fb'];

  const ctx = canvas.getContext('2d');
  const W   = canvas.width  = canvas.offsetWidth  * devicePixelRatio;
  const H   = canvas.height = canvas.offsetHeight * devicePixelRatio;

  dibujarCuadricula(ctx, W, H);

  funciones.forEach((fn, idx) => {
    dibujarFuncion(ctx, W, H, fn, colores[idx % colores.length]);
  });

  // Leyenda
  funciones.forEach((fn, idx) => {
    ctx.fillStyle = colores[idx % colores.length];
    ctx.font = `${14 * devicePixelRatio}px monospace`;
    ctx.fillText(`f${idx + 1}(x) = ${fn}`, 15 * devicePixelRatio, (20 + idx * 20) * devicePixelRatio);
  });
}

function dibujarCuadricula(ctx, W, H) {
  const { xMin, xMax, yMin, yMax } = zoomGrafica;
  ctx.fillStyle = '#0d1117';
  ctx.fillRect(0, 0, W, H);

  ctx.strokeStyle = '#1f2937';
  ctx.lineWidth   = devicePixelRatio;

  for (let x = Math.ceil(xMin); x <= xMax; x++) {
    const px = ((x - xMin) / (xMax - xMin)) * W;
    ctx.beginPath(); ctx.moveTo(px, 0); ctx.lineTo(px, H); ctx.stroke();
    if (x !== 0) {
      ctx.fillStyle = '#4b5563';
      ctx.font = `${10 * devicePixelRatio}px monospace`;
      ctx.fillText(x, px + 2, H / 2 + 12 * devicePixelRatio);
    }
  }

  for (let y = Math.ceil(yMin); y <= yMax; y++) {
    const py = H - ((y - yMin) / (yMax - yMin)) * H;
    ctx.beginPath(); ctx.moveTo(0, py); ctx.lineTo(W, py); ctx.stroke();
    if (y !== 0) {
      ctx.fillStyle = '#4b5563';
      ctx.font = `${10 * devicePixelRatio}px monospace`;
      ctx.fillText(y, W / 2 + 3, py - 3 * devicePixelRatio);
    }
  }

  // Ejes
  ctx.strokeStyle = '#374151';
  ctx.lineWidth   = 2 * devicePixelRatio;

  const ejePY = H - ((-yMin) / (yMax - yMin)) * H;
  ctx.beginPath(); ctx.moveTo(0, ejePY); ctx.lineTo(W, ejePY); ctx.stroke();

  const ejePX = ((-xMin) / (xMax - xMin)) * W;
  ctx.beginPath(); ctx.moveTo(ejePX, 0); ctx.lineTo(ejePX, H); ctx.stroke();
}

function dibujarFuncion(ctx, W, H, fnStr, color) {
  const { xMin, xMax, yMin, yMax } = zoomGrafica;
  ctx.strokeStyle = color;
  ctx.lineWidth   = 2.5 * devicePixelRatio;
  ctx.lineJoin    = 'round';
  ctx.beginPath();

  // Compilar la expresión una sola vez antes del bucle de píxeles.
  // math.compile() parsea y construye el AST una vez; .evaluate({ x }) solo
  // ejecuta el árbol ya compilado en cada iteración, evitando re-parsear W veces.
  let fnCompilada;
  try {
    fnCompilada = window.math.compile(fnStr);
  } catch {
    // Expresión inválida — no dibujar nada
    return;
  }

  let iniciado = false;
  const pasos  = W;

  for (let px = 0; px <= pasos; px++) {
    const x = xMin + (px / pasos) * (xMax - xMin);

    let y;
    try {
      y = fnCompilada.evaluate({ x });
    } catch {
      iniciado = false;
      continue;
    }

    if (typeof y !== 'number' || isNaN(y) || !isFinite(y))         { iniciado = false; continue; }
    if (y < yMin - (yMax - yMin) || y > yMax + (yMax - yMin))      { iniciado = false; continue; }

    const canvasX = (px / pasos) * W;
    const canvasY = H - ((y - yMin) / (yMax - yMin)) * H;

    if (!iniciado) { ctx.moveTo(canvasX, canvasY); iniciado = true; }
    else ctx.lineTo(canvasX, canvasY);
  }
  ctx.stroke();
}

function limpiarGrafica() {
  const canvas = dom.graficaCanvas();
  if (!canvas) return;
  canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
  if (dom.graficaInput()) dom.graficaInput().value = '';
}

// ─── Inicialización ───────────────────────────────────────────────────────────

function inicializar() {
  if (typeof window.math === 'undefined') {
    console.error('math.js no fue cargado. Verifica el enlace CDN en index.html.');
    return;
  }

  initMathEngine(window.math);

  configurarBotones();
  renderizarConstantes();
  configurarConversorUnidades();
  configurarPanelMatriz();
  configurarSolucionador();
  configurarGraficadora();
  inicializarPanelBases();
  inicializarPanelEstadistica();
  inicializarPanelComplejos();
  inicializarCalculadoraTriangulo();
  actualizarPantalla();

  // Splash: visible 800ms → fade-out 350ms → eliminado del DOM
  setTimeout(() => {
    const splash = document.getElementById('splash-screen');
    if (splash) {
      splash.classList.add('oculto');
      splash.addEventListener('transitionend', () => splash.remove(), { once: true });
    }
  }, 800);

  console.log('Calculadora de Ingeniería inicializada correctamente.');
}

// Esperar al DOM
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', inicializar);
} else {
  inicializar();
}



// ─── Panel Números Complejos ──────────────────────────────────────────────────
function inicializarPanelComplejos() {
  ['cpx-re', 'cpx-im'].forEach(id =>
    document.getElementById(id)?.addEventListener('input', actualizarPreviewComplejo));
  document.querySelectorAll('.btn-cpx').forEach(btn =>
    btn.addEventListener('click', () => ejecutarOpCompleja(btn.dataset.op)));
  document.querySelectorAll('.btn-cpx2').forEach(btn =>
    btn.addEventListener('click', () => ejecutarOpCompleja(btn.dataset.op)));
}

// ─── Calculadora de Triángulo ──────────────────────────────────────────────

function inicializarCalculadoraTriangulo() {
  document.getElementById('btn-trig-calcular')
    ?.addEventListener('click', calcularTriangulo);
  document.getElementById('btn-trig-limpiar')
    ?.addEventListener('click', () => {
      ['ta','tb','tc','tA','tB','tC'].forEach(id => {
        document.getElementById(id).value = '';
      });
      document.getElementById('trig-result').innerHTML = '';
    });
}

function calcularTriangulo() {
  const result = document.getElementById('trig-result');
  try {
    const vals = ['ta','tb','tc','tA','tB','tC'].map(id => {
      const v = document.getElementById(id).value.trim();
      return v === '' ? null : parseFloat(v);
    });
    const [a, b, c, A, B, C] = vals;
    const DEG = Math.PI / 180;
    const RAD = 180 / Math.PI;

    const known = vals.filter(v => v !== null).length;
    if (known < 3) throw new Error('Ingresa al menos 3 valores conocidos.');

    let ra, rb, rc, rA, rB, rC;

    // SSS — 3 lados conocidos
    if (a !== null && b !== null && c !== null) {
      ra = a; rb = b; rc = c;
      rA = Math.acos((rb*rb + rc*rc - ra*ra) / (2*rb*rc)) * RAD;
      rB = Math.acos((ra*ra + rc*rc - rb*rb) / (2*ra*rc)) * RAD;
      rC = 180 - rA - rB;
    }
    // SAS — 2 lados y ángulo incluido
    else if (a !== null && b !== null && C !== null) {
      ra = a; rb = b; rC = C;
      rc = Math.sqrt(ra*ra + rb*rb - 2*ra*rb*Math.cos(rC * DEG));
      rA = Math.acos((rb*rb + rc*rc - ra*ra) / (2*rb*rc)) * RAD;
      rB = 180 - rA - rC;
    }
    else if (a !== null && c !== null && B !== null) {
      ra = a; rc = c; rB = B;
      rb = Math.sqrt(ra*ra + rc*rc - 2*ra*rc*Math.cos(rB * DEG));
      rA = Math.acos((rb*rb + rc*rc - ra*ra) / (2*rb*rc)) * RAD;
      rC = 180 - rA - rB;
    }
    else if (b !== null && c !== null && A !== null) {
      rb = b; rc = c; rA = A;
      ra = Math.sqrt(rb*rb + rc*rc - 2*rb*rc*Math.cos(rA * DEG));
      rB = Math.acos((ra*ra + rc*rc - rb*rb) / (2*ra*rc)) * RAD;
      rC = 180 - rA - rB;
    }
    // AAS / ASA — 2 ángulos + 1 lado (ley de senos)
    else if (A !== null && B !== null && a !== null) {
      rA = A; rB = B; rC = 180 - A - B; ra = a;
      rb = ra * Math.sin(rB * DEG) / Math.sin(rA * DEG);
      rc = ra * Math.sin(rC * DEG) / Math.sin(rA * DEG);
    }
    else if (A !== null && B !== null && b !== null) {
      rA = A; rB = B; rC = 180 - A - B; rb = b;
      ra = rb * Math.sin(rA * DEG) / Math.sin(rB * DEG);
      rc = rb * Math.sin(rC * DEG) / Math.sin(rB * DEG);
    }
    else if (A !== null && B !== null && c !== null) {
      rA = A; rB = B; rC = 180 - A - B; rc = c;
      ra = rc * Math.sin(rA * DEG) / Math.sin(rC * DEG);
      rb = rc * Math.sin(rB * DEG) / Math.sin(rC * DEG);
    }
    else if (A !== null && C !== null && a !== null) {
      rA = A; rC = C; rB = 180 - A - C; ra = a;
      rb = ra * Math.sin(rB * DEG) / Math.sin(rA * DEG);
      rc = ra * Math.sin(rC * DEG) / Math.sin(rA * DEG);
    }
    else if (A !== null && C !== null && b !== null) {
      rA = A; rC = C; rB = 180 - A - C; rb = b;
      ra = rb * Math.sin(rA * DEG) / Math.sin(rB * DEG);
      rc = rb * Math.sin(rC * DEG) / Math.sin(rB * DEG);
    }
    else if (B !== null && C !== null && a !== null) {
      rB = B; rC = C; rA = 180 - B - C; ra = a;
      rb = ra * Math.sin(rB * DEG) / Math.sin(rA * DEG);
      rc = ra * Math.sin(rC * DEG) / Math.sin(rA * DEG);
    }
    else if (B !== null && C !== null && b !== null) {
      rB = B; rC = C; rA = 180 - B - C; rb = b;
      ra = rb * Math.sin(rA * DEG) / Math.sin(rB * DEG);
      rc = rb * Math.sin(rC * DEG) / Math.sin(rB * DEG);
    }
    else if (B !== null && C !== null && c !== null) {
      rB = B; rC = C; rA = 180 - B - C; rc = c;
      ra = rc * Math.sin(rA * DEG) / Math.sin(rC * DEG);
      rb = rc * Math.sin(rB * DEG) / Math.sin(rC * DEG);
    }
    else {
      throw new Error('Combinación no soportada. Prueba SSS, SAS o AAS/ASA.');
    }

    // Validaciones
    if ([ra, rb, rc].some(v => v <= 0 || !isFinite(v)))
      throw new Error('Triángulo imposible: los lados deben ser positivos.');
    if ([rA, rB, rC].some(v => v <= 0 || v >= 180 || !isFinite(v)))
      throw new Error('Triángulo imposible: ángulos fuera de rango (0°–180°).');
    const sumAngulos = rA + rB + rC;
    if (Math.abs(sumAngulos - 180) > 0.01)
      throw new Error(`Triángulo imposible: ángulos suman ${sumAngulos.toFixed(2)}° ≠ 180°.`);

    const f = n => {
      const r = parseFloat(n.toFixed(6));
      return parseFloat(r.toFixed(4)).toString();
    };
    const area = 0.5 * ra * rb * Math.sin(rC * DEG);
    const perim = ra + rb + rc;

    result.innerHTML = `
      <div class="panel-resultado resultado-ok" style="font-size:0.73rem;line-height:2;">
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:4px;text-align:center;margin-bottom:8px;">
          <span><span style="color:var(--apagado);font-size:0.6rem;display:block;">lado a</span><b>${f(ra)}</b></span>
          <span><span style="color:var(--apagado);font-size:0.6rem;display:block;">lado b</span><b>${f(rb)}</b></span>
          <span><span style="color:var(--apagado);font-size:0.6rem;display:block;">lado c</span><b>${f(rc)}</b></span>
        </div>
        <div style="border-top:1px solid var(--borde);padding-top:8px;display:grid;grid-template-columns:repeat(3,1fr);gap:4px;text-align:center;margin-bottom:8px;">
          <span><span style="color:var(--apagado);font-size:0.6rem;display:block;">ángulo A</span><b>${f(rA)}°</b></span>
          <span><span style="color:var(--apagado);font-size:0.6rem;display:block;">ángulo B</span><b>${f(rB)}°</b></span>
          <span><span style="color:var(--apagado);font-size:0.6rem;display:block;">ángulo C</span><b>${f(rC)}°</b></span>
        </div>
        <div style="border-top:1px solid var(--borde);padding-top:8px;display:grid;grid-template-columns:1fr 1fr;gap:4px;text-align:center;">
          <span><span style="color:var(--apagado);font-size:0.6rem;display:block;">Área</span><b>${f(area)}</b></span>
          <span><span style="color:var(--apagado);font-size:0.6rem;display:block;">Perímetro</span><b>${f(perim)}</b></span>
        </div>
      </div>`;
  } catch (e) {
    result.innerHTML = `<div class="panel-resultado resultado-error">${e.message}</div>`;
  }
}

function leerComplejo(reId, imId) {
  const re = parseFloat(document.getElementById(reId).value);
  const im = parseFloat(document.getElementById(imId).value);
  if (isNaN(re) || isNaN(im)) throw new Error('Ingresa valores numéricos válidos en ambos campos.');
  return complejo(re, im);
}

function actualizarPreviewComplejo() {
  const prev = document.getElementById('cpx-preview');
  if (!prev) return;
  const re = parseFloat(document.getElementById('cpx-re').value);
  const im = parseFloat(document.getElementById('cpx-im').value);
  if (isNaN(re) && isNaN(im)) { prev.textContent = ''; return; }
  prev.textContent = formatComplex({ re: isNaN(re) ? 0 : re, im: isNaN(im) ? 0 : im }, 4);
}

function fmtN(n, dec) {
  dec = dec === undefined ? 4 : dec;
  const r = +n.toFixed(10);
  return Number.isInteger(r) ? r.toString() : parseFloat(r.toFixed(dec)).toString();
}

function fmtZ(z) {
  return formatComplex({ real: +z.real.toFixed(10), imag: +z.imag.toFixed(10) }, 4);
}

function ejecutarOpCompleja(op) {
  const result = document.getElementById('cpx-result');
  try {
    var label, valor;
    var OPS_UN  = ['modulus', 'argument', 'conjugate', 'polar', 'sqrt'];
    var OPS_BIN = ['add', 'subtract', 'multiply', 'divide', 'power'];

    if (OPS_UN.includes(op)) {
      var z = leerComplejo('cpx-re', 'cpx-im');

      if (op === 'modulus') {
        label = '|z| M\u00f3dulo';
        valor = fmtN(modulus(z));

      } else if (op === 'argument') {
        var rad = argument(z);
        var deg = rad * (180 / Math.PI);
        label = 'arg(z)';
        valor = fmtN(rad) + ' rad  /  ' + fmtN(deg) + '\u00b0';

      } else if (op === 'conjugate') {
        label = 'z\u0305 Conjugado';
        valor = fmtZ(conjugate(z));

      } else if (op === 'polar') {
        var p = toPolar(z);
        var pdeg = p.argumento * (180 / Math.PI);
        label = 'Forma Polar';
        valor = fmtN(p.modulo) + ' \u2220 ' + fmtN(pdeg) + '\u00b0';

      } else if (op === 'sqrt') {
        label = '\u221az';
        valor = fmtZ(sqrt(z));
      }

    } else if (OPS_BIN.includes(op)) {
      var z1 = leerComplejo('cpx-re1', 'cpx-im1');
      var binLabels = {
        add: 'z1 + z2', subtract: 'z1 \u2212 z2',
        multiply: 'z1 \u00d7 z2', divide: 'z1 \u00f7 z2', power: 'z1 ^ n'
      };
      label = binLabels[op];

      if (op === 'power') {
        var n = parseInt(document.getElementById('cpx-exp').value);
        if (isNaN(n) || !Number.isInteger(n))
          throw new Error('El exponente debe ser un entero.');
        valor = fmtZ(power(z1, n));
      } else {
        var z2 = leerComplejo('cpx-re2', 'cpx-im2');
        var binOps = { add: add, subtract: subtract, multiply: multiply, divide: divide };
        valor = fmtZ(binOps[op](z1, z2));
      }
    }

    if (label && valor !== undefined) {
      result.innerHTML =
        '<div class="panel-resultado resultado-ok" ' +
        'style="display:flex;justify-content:space-between;align-items:center;padding:8px 12px;">' +
        '<span style="color:var(--apagado);font-size:0.68rem;font-weight:600;">' + label + '</span>' +
        '<span style="font-weight:600;">' + valor + '</span>' +
        '</div>';
    }

  } catch (e) {
    result.innerHTML = '<div class="panel-resultado resultado-error">' + e.message + '</div>';
  }
}
// ─── Panel Estadística ────────────────────────────────────────────────────────
function parsearDataset(raw) {
  if (!raw || raw.trim() === '') throw new Error('Ingresa al menos un número.');
  const valores = raw.split(',').map(s => {
    const n = parseFloat(s.trim());
    if (isNaN(n)) throw new Error('Valor inválido: "' + s.trim() + '"');
    return n;
  });
  if (valores.length === 0) throw new Error('Dataset vacío.');
  return valores;
}

function inicializarPanelEstadistica() {
  document.querySelectorAll('.btn-stat').forEach(btn => {
    btn.addEventListener('click', () => ejecutarEstadistica(btn.dataset.fn));
  });
}

function ejecutarEstadistica(fn) {
  const raw    = document.getElementById('stat-input').value;
  const result = document.getElementById('stat-result');
  const labels = {
    mean: 'Media', median: 'Mediana', mode: 'Moda',
    variance: 'Varianza', stdDev: 'Desv. Estándar', range: 'Rango',
    percentile: 'Percentil',
  };

  try {
    const datos = parsearDataset(raw);
    let valor;

    if (fn === 'percentile') {
      const p = parseFloat(document.getElementById('stat-percentile-p').value);
      if (isNaN(p) || p < 0 || p > 100)
        throw new Error('El percentil debe ser un número entre 0 y 100.');
      valor = percentile(datos, p);
    } else {
      const fns = { mean, median, mode, variance, stdDev, range };
      valor = fns[fn](datos);
    }

    const redondeado = +valor.toFixed(10);
    const display = Number.isInteger(redondeado)
      ? redondeado.toString()
      : parseFloat(redondeado.toFixed(4)).toString();

    result.innerHTML =
      '<div class="panel-resultado resultado-ok" style="display:flex;justify-content:space-between;align-items:center;padding:8px 12px;">' +
      '<span style="color:var(--apagado);font-size:0.68rem;font-weight:600;">' + labels[fn] + '</span>' +
      '<span style="font-weight:600;">' + display + '</span>' +
      '</div>';

  } catch (e) {
    result.innerHTML = '<div class="panel-resultado resultado-error">' + e.message + '</div>';
  }
}
// ─── Panel Bases Numéricas ────────────────────────────────────────────────────
function inicializarPanelBases() {
  const btn = document.getElementById('btn-bases-convert');
  if (!btn) return;
  btn.addEventListener('click', ejecutarConversionBases);
  document.getElementById('bases-input')
    ?.addEventListener('keydown', e => { if (e.key === 'Enter') ejecutarConversionBases(); });
}

function ejecutarConversionBases() {
  const input  = document.getElementById('bases-input').value.trim().toUpperCase();
  const base   = document.getElementById('bases-from').value;
  const result = document.getElementById('bases-result');

  if (!input) { result.innerHTML = ''; return; }

  try {
    // Paso 1: normalizar a decimal
    let dec;
    if      (base === 'DEC') dec = parseInt(input, 10);
    else if (base === 'BIN') dec = parseInt(convertBinaryToDecimal(input), 10);
    else if (base === 'OCT') dec = parseInt(convertOctalToDecimal(input),  10);
    else if (base === 'HEX') dec = parseInt(convertHexToDecimal(input),    10);

    if (!Number.isInteger(dec) || !Number.isFinite(dec))
      throw new Error('Valor no es un entero válido.');

    // Paso 2: convertir a todas las bases
    const outputs = [
      { label: 'BIN', valor: convertDecimalToBinary(dec) },
      { label: 'OCT', valor: convertDecimalToOctal(dec)  },
      { label: 'DEC', valor: dec.toString()              },
      { label: 'HEX', valor: convertDecimalToHex(dec)    },
    ];

    result.innerHTML = outputs.map(({ label, valor }) => `
      <div class="panel-resultado resultado-ok"
           style="display:flex;justify-content:space-between;align-items:center;padding:8px 12px;">
        <span style="color:var(--apagado);font-size:0.68rem;font-weight:600;">${label}</span>
        <span style="font-weight:600;letter-spacing:0.04em;">${valor}</span>
      </div>`).join('');

  } catch (e) {
    result.innerHTML = `<div class="panel-resultado resultado-error">${e.message}</div>`;
  }
}

// ─── Indicador de conectividad ────────────────────────────────────────────────
function updateConnectivityBadge() {
  const badge = document.getElementById('connectivity-badge');
  if (!badge) return;
  const online = navigator.onLine;
  badge.textContent = online ? '🟢 Online' : '🔴 Offline';
  badge.className   = online ? 'online'    : 'offline';
}
window.addEventListener('online',  updateConnectivityBadge);
window.addEventListener('offline', updateConnectivityBadge);
document.addEventListener('DOMContentLoaded', updateConnectivityBadge);

// ─── Contador de sesión ───────────────────────────────────────────────────────
function updateSessionCounter() {
  const el = document.getElementById('session-counter');
  if (!el) return;
  el.innerHTML = 'Cálculos: <span>' + sessionCalcCount + '</span>';
}
document.addEventListener('DOMContentLoaded', updateSessionCounter);