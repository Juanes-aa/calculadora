/**
 * matrix.js
 * Operaciones matriciales en JavaScript puro para la calculadora de ingeniería.
 * Implementaciones propias para transparencia y sin dependencias externas.
 */

// ─── Validación ───────────────────────────────────────────────────────────────

/**
 * Valida que la entrada sea una matriz numérica 2D bien formada.
 * @param {number[][]} M
 * @returns {boolean}
 */
export function isValidMatrix(M) {
  if (!Array.isArray(M) || M.length === 0) return false;
  const cols = M[0].length;
  return M.every(fila =>
    Array.isArray(fila) && fila.length === cols &&
    fila.every(v => typeof v === 'number' && isFinite(v))
  );
}

// ─── Operaciones Básicas ──────────────────────────────────────────────────────

/**
 * Suma de matrices: A + B
 */
export function matAdd(A, B) {
  if (A.length !== B.length || A[0].length !== B[0].length)
    throw new Error('Las dimensiones de las matrices deben coincidir para la suma.');
  return A.map((fila, i) => fila.map((val, j) => val + B[i][j]));
}

/**
 * Resta de matrices: A - B
 */
export function matSub(A, B) {
  if (A.length !== B.length || A[0].length !== B[0].length)
    throw new Error('Las dimensiones de las matrices deben coincidir para la resta.');
  return A.map((fila, i) => fila.map((val, j) => val - B[i][j]));
}

/**
 * Multiplicación de matrices: A × B
 */
export function matMul(A, B) {
  const filasA = A.length, colsA = A[0].length;
  const filasB = B.length, colsB = B[0].length;
  if (colsA !== filasB)
    throw new Error(`No se puede multiplicar: ${filasA}×${colsA} por ${filasB}×${colsB}.`);

  return Array.from({ length: filasA }, (_, i) =>
    Array.from({ length: colsB }, (_, j) =>
      A[i].reduce((suma, _, k) => suma + A[i][k] * B[k][j], 0)
    )
  );
}

/**
 * Multiplicación escalar: k × A
 */
export function matScale(k, A) {
  return A.map(fila => fila.map(v => k * v));
}

/**
 * Transpuesta de una matriz
 */
export function matTranspose(A) {
  return A[0].map((_, j) => A.map(fila => fila[j]));
}

// ─── Determinante (Eliminación Gaussiana) ────────────────────────────────────

/**
 * Calcula el determinante de una matriz cuadrada mediante eliminación gaussiana.
 * @param {number[][]} M
 * @returns {number}
 */
export function matDet(M) {
  const n = M.length;
  if (M.some(fila => fila.length !== n))
    throw new Error('El determinante requiere una matriz cuadrada.');

  // Copia profunda para no mutar el original
  const mat = M.map(fila => [...fila]);
  let det  = 1;
  let signo = 1;

  for (let col = 0; col < n; col++) {
    // Buscar pivote
    let filaPivote = -1;
    for (let fila = col; fila < n; fila++) {
      if (Math.abs(mat[fila][col]) > 1e-12) { filaPivote = fila; break; }
    }
    if (filaPivote === -1) return 0; // Matriz singular

    if (filaPivote !== col) {
      [mat[col], mat[filaPivote]] = [mat[filaPivote], mat[col]];
      signo *= -1;
    }

    det *= mat[col][col];

    for (let fila = col + 1; fila < n; fila++) {
      const factor = mat[fila][col] / mat[col][col];
      for (let k = col; k < n; k++) {
        mat[fila][k] -= factor * mat[col][k];
      }
    }
  }

  return signo * det;
}

// ─── Inversa (Gauss-Jordan) ───────────────────────────────────────────────────

/**
 * Calcula la inversa de una matriz cuadrada usando eliminación de Gauss-Jordan.
 * @param {number[][]} M
 * @returns {number[][]}
 */
export function matInverse(M) {
  const n = M.length;
  if (M.some(fila => fila.length !== n))
    throw new Error('La inversa requiere una matriz cuadrada.');

  // Aumentar [M | I]
  const aug = M.map((fila, i) => [
    ...fila,
    ...Array.from({ length: n }, (_, j) => (i === j ? 1 : 0)),
  ]);

  for (let col = 0; col < n; col++) {
    // Pivoteo parcial
    let maxFila = col;
    for (let fila = col + 1; fila < n; fila++) {
      if (Math.abs(aug[fila][col]) > Math.abs(aug[maxFila][col])) maxFila = fila;
    }
    [aug[col], aug[maxFila]] = [aug[maxFila], aug[col]];

    const pivote = aug[col][col];
    if (Math.abs(pivote) < 1e-12)
      throw new Error('La matriz es singular y no puede invertirse.');

    // Normalizar fila pivote
    for (let k = 0; k < 2 * n; k++) aug[col][k] /= pivote;

    // Eliminar columna
    for (let fila = 0; fila < n; fila++) {
      if (fila === col) continue;
      const factor = aug[fila][col];
      for (let k = 0; k < 2 * n; k++) {
        aug[fila][k] -= factor * aug[col][k];
      }
    }
  }

  return aug.map(fila => fila.slice(n));
}

// ─── Utilidades de Presentación ───────────────────────────────────────────────

/**
 * Parsea una cadena como "1,2;3,4" en un array numérico 2D.
 * Filas separadas por punto y coma, columnas por coma.
 */
export function parseMatrixString(cadena) {
  return cadena.trim().split(';').map(fila =>
    fila.trim().split(',').map(v => {
      const n = parseFloat(v.trim());
      if (isNaN(n)) throw new Error(`Valor de matriz inválido: "${v}"`);
      return n;
    })
  );
}

/**
 * Formatea un array 2D como una cuadrícula legible.
 */
export function formatMatrix(M, decimales = 4) {
  return M.map(fila =>
    '[ ' + fila.map(v => Number(v.toFixed(decimales)).toString().padStart(10)).join('  ') + ' ]'
  ).join('\n');
}
