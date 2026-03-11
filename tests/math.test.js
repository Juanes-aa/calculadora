/**
 * math.test.js
 * Pruebas unitarias para los módulos principales de la calculadora.
 * Ejecutar con: node tests/math.test.js
 *
 * Framework de pruebas liviano — sin dependencias externas.
 */

// ─── Framework de Pruebas ─────────────────────────────────────────────────────

let aprobadas = 0, falladas = 0;

function describir(nombre, fn) {
  console.log(`\n\x1b[36m▶ ${nombre}\x1b[0m`);
  fn();
}

function prueba(nombre, fn) {
  try {
    fn();
    console.log(`  \x1b[32m✓\x1b[0m ${nombre}`);
    aprobadas++;
  } catch (e) {
    console.log(`  \x1b[31m✗\x1b[0m ${nombre}`);
    console.log(`    \x1b[31m${e.message}\x1b[0m`);
    falladas++;
  }
}

function esperar(actual) {
  return {
    serIgualA(esperado) {
      if (actual !== esperado)
        throw new Error(`Se esperaba ${JSON.stringify(esperado)}, se obtuvo ${JSON.stringify(actual)}`);
    },
    aproximarse(esperado, digitos = 6) {
      const tol = Math.pow(10, -digitos);
      if (Math.abs(actual - esperado) > tol)
        throw new Error(`Se esperaba ~${esperado}, se obtuvo ${actual}`);
    },
    lanzarError() {
      if (typeof actual !== 'function') throw new Error('Se esperaba una función');
      let lanzo = false;
      try { actual(); } catch (e) { lanzo = true; }
      if (!lanzo) throw new Error('Se esperaba que la función lanzara un error');
    },
    contener(subcadena) {
      if (!String(actual).includes(subcadena))
        throw new Error(`Se esperaba que "${actual}" contuviera "${subcadena}"`);
    },
  };
}

// ─── Pruebas Inline (sin importaciones, compatibles con Node estándar) ─────────

console.log('\n\x1b[33m=== Calculadora de Ingeniería — Pruebas Unitarias ===\x1b[0m');

describir('Operaciones con Matrices', () => {
  function det2x2(a, b, c, d) { return a * d - b * c; }

  function multiplicar(A, B) {
    const filas = A.length, colsB = B[0].length;
    return Array.from({ length: filas }, (_, i) =>
      Array.from({ length: colsB }, (_, j) =>
        A[i].reduce((s, _, k) => s + A[i][k] * B[k][j], 0)
      )
    );
  }

  function determinante(M) {
    const n = M.length;
    const mat = M.map(f => [...f]);
    let det = 1, signo = 1;
    for (let col = 0; col < n; col++) {
      let piv = -1;
      for (let f = col; f < n; f++) if (Math.abs(mat[f][col]) > 1e-12) { piv = f; break; }
      if (piv === -1) return 0;
      if (piv !== col) { [mat[col], mat[piv]] = [mat[piv], mat[col]]; signo *= -1; }
      det *= mat[col][col];
      for (let f = col + 1; f < n; f++) {
        const fc = mat[f][col] / mat[col][col];
        for (let k = col; k < n; k++) mat[f][k] -= fc * mat[col][k];
      }
    }
    return signo * det;
  }

  prueba('det([[1,2],[3,4]]) = -2',   () => esperar(det2x2(1,2,3,4)).serIgualA(-2));
  prueba('det([[5,0],[0,5]]) = 25',   () => esperar(det2x2(5,0,0,5)).serIgualA(25));
  prueba('det([[1,2,3],[4,5,6],[7,8,9]]) = 0 (singular)', () => esperar(determinante([[1,2,3],[4,5,6],[7,8,9]])).aproximarse(0));
  prueba('Identidad × A = A',         () => {
    const r = multiplicar([[1,0],[0,1]], [[3,7],[2,5]]);
    esperar(r[0][0]).serIgualA(3);
    esperar(r[1][1]).serIgualA(5);
  });
  prueba('[[1,2],[3,4]] × [[2,0],[1,2]] = [[4,4],[10,8]]', () => {
    const r = multiplicar([[1,2],[3,4]], [[2,0],[1,2]]);
    esperar(r[0][0]).serIgualA(4);
    esperar(r[0][1]).serIgualA(4);
    esperar(r[1][0]).serIgualA(10);
    esperar(r[1][1]).serIgualA(8);
  });
});

describir('Solucionador de Ecuaciones', () => {
  function lineal(a, b) {
    if (a === 0) throw new Error('El coef. a no puede ser cero');
    return -b / a;
  }
  function cuadratica(a, b, c) {
    const d = b*b - 4*a*c;
    return d >= 0 ? [(-b + Math.sqrt(d))/(2*a), (-b - Math.sqrt(d))/(2*a)] : null;
  }

  prueba('Lineal: 2x + 4 = 0 → x = -2',    () => esperar(lineal(2, 4)).serIgualA(-2));
  prueba('Lineal: -3x - 9 = 0 → x = -3',  () => esperar(lineal(-3, -9)).serIgualA(-3)); // FIX ISS-08
  prueba('Cuadrática: x²-5x+6=0 → 3, 2',   () => {
    const r = cuadratica(1, -5, 6);
    esperar(r[0]).serIgualA(3);
    esperar(r[1]).serIgualA(2);
  });
  prueba('Cuadrática: x²-4=0 → 2, -2',     () => {
    const r = cuadratica(1, 0, -4);
    esperar(r[0]).serIgualA(2);
    esperar(r[1]).serIgualA(-2);
  });
  prueba('Cuadrática: x²+1=0 → compleja',  () => esperar(cuadratica(1, 0, 1)).serIgualA(null));
  prueba('a=0 lanza error',                () => esperar(() => lineal(0, 5)).lanzarError());
});

describir('Conversión de Unidades', () => {
  const km_a_m = km => km * 1000;
  const m_a_ft  = m  => m / 0.3048;
  const c_a_f   = c  => c * 9/5 + 32;
  const c_a_k   = c  => c + 273.15;
  const k_a_c   = k  => k - 273.15;
  const kg_a_g  = kg => kg * 1000;
  const j_a_kj  = j  => j / 1000;

  prueba('1 km = 1000 m',            () => esperar(km_a_m(1)).serIgualA(1000));
  prueba('1 m ≈ 3.28084 ft',         () => esperar(m_a_ft(1)).aproximarse(3.28084, 4));
  prueba('0 °C = 32 °F',             () => esperar(c_a_f(0)).serIgualA(32));
  prueba('100 °C = 212 °F',          () => esperar(c_a_f(100)).serIgualA(212));
  prueba('0 °C = 273.15 K',          () => esperar(c_a_k(0)).serIgualA(273.15));
  prueba('300 K = 26.85 °C',         () => esperar(k_a_c(300)).aproximarse(26.85, 2));
  prueba('1 kg = 1000 g',            () => esperar(kg_a_g(1)).serIgualA(1000));
  prueba('1000 J = 1 kJ',            () => esperar(j_a_kj(1000)).serIgualA(1));
});

describir('Constantes Físicas', () => {
  prueba('π ≈ 3.14159265358979',  () => esperar(Math.PI).aproximarse(3.14159265358979, 14));
  prueba('e ≈ 2.71828182845904',  () => esperar(Math.E).aproximarse(2.71828182845904, 14));
  prueba('c = 299 792 458 m/s',   () => esperar(299792458).serIgualA(299792458));
  prueba('NA ≈ 6.022e23',         () => esperar(6.02214076e23).aproximarse(6.022e23, -20));
});

describir('Factorial', () => {
  function factorial(n) {
    if (!Number.isInteger(n) || n < 0) throw new Error('Entrada inválida');
    let r = 1;
    for (let i = 2; i <= n; i++) r *= i;
    return r;
  }

  prueba('0! = 1',        () => esperar(factorial(0)).serIgualA(1));
  prueba('1! = 1',        () => esperar(factorial(1)).serIgualA(1));
  prueba('5! = 120',      () => esperar(factorial(5)).serIgualA(120));
  prueba('10! = 3628800', () => esperar(factorial(10)).serIgualA(3628800));
  prueba('Negativo lanza error', () => esperar(() => factorial(-1)).lanzarError());
  prueba('Decimal lanza error',  () => esperar(() => factorial(3.5)).lanzarError());
});

describir('Notación de Ingeniería', () => {
  function notacionIng(v, p = 3) {
    if (v === 0) return '0';
    const e  = Math.floor(Math.log10(Math.abs(v)));
    const ee = Math.floor(e / 3) * 3;
    return `${(v / 10**ee).toFixed(p)}×10^${ee}`;
  }

  prueba('1234 → contiene 10^3',        () => esperar(notacionIng(1234)).contener('10^3'));
  prueba('0.001234 → contiene 10^-3',   () => esperar(notacionIng(0.001234)).contener('10^-3'));
  prueba('1 000 000 → contiene 10^6',   () => esperar(notacionIng(1000000)).contener('10^6'));
  prueba('0.000001 → contiene 10^-6',   () => esperar(notacionIng(0.000001)).contener('10^-6'));
});

describir('Validación de Paréntesis', () => {
  function verificarParens(expr) {
    let d = 0;
    for (const ch of expr) {
      if (ch === '(') d++;
      else if (ch === ')') { d--; if (d < 0) return false; }
    }
    return d === 0;
  }

  prueba('"(1+2)" → balanceado',        () => esperar(verificarParens('(1+2)')).serIgualA(true));
  prueba('"(1+(2*3))" → balanceado',    () => esperar(verificarParens('(1+(2*3))')).serIgualA(true));
  prueba('"((1+2)" → desbalanceado',    () => esperar(verificarParens('((1+2)')).serIgualA(false));
  prueba('")" → desbalanceado',         () => esperar(verificarParens(')')).serIgualA(false));
  prueba('"()()" → balanceado',         () => esperar(verificarParens('()()')).serIgualA(true));
});

// ─── Conversión de Bases Numéricas ───────────────────────────────────────────────

describir('Conversión de Bases', () => {
  // Decimal → Binario
  function decToBin(n) {
    if (n === 0) return '0';
    const signo = n < 0 ? '-' : '';
    return signo + Math.abs(n).toString(2);
  }
  // Decimal → Hexadecimal
  function decToHex(n) {
    if (n === 0) return '0';
    const signo = n < 0 ? '-' : '';
    return signo + Math.abs(n).toString(16).toUpperCase();
  }
  // Decimal → Octal
  function decToOct(n) {
    if (n === 0) return '0';
    const signo = n < 0 ? '-' : '';
    return signo + Math.abs(n).toString(8);
  }
  // Binario → Decimal
  function binToDec(s) {
    const neg = s.startsWith('-');
    const val = parseInt(neg ? s.slice(1) : s, 2);
    return (neg ? -val : val).toString();
  }
  // Hexadecimal → Decimal
  function hexToDec(s) {
    const neg = s.startsWith('-');
    const val = parseInt(neg ? s.slice(1) : s, 16);
    return (neg ? -val : val).toString();
  }
  // Octal → Decimal
  function octToDec(s) {
    const neg = s.startsWith('-');
    const val = parseInt(neg ? s.slice(1) : s, 8);
    return (neg ? -val : val).toString();
  }

  prueba('10 dec → "1010" bin',       () => esperar(decToBin(10)).serIgualA('1010'));
  prueba('255 dec → "11111111" bin',  () => esperar(decToBin(255)).serIgualA('11111111'));
  prueba('0 dec → "0" bin',           () => esperar(decToBin(0)).serIgualA('0'));
  prueba('-10 dec → "-1010" bin',     () => esperar(decToBin(-10)).serIgualA('-1010'));
  prueba('255 dec → "FF" hex',        () => esperar(decToHex(255)).serIgualA('FF'));
  prueba('16 dec → "10" hex',         () => esperar(decToHex(16)).serIgualA('10'));
  prueba('-255 dec → "-FF" hex',      () => esperar(decToHex(-255)).serIgualA('-FF'));
  prueba('8 dec → "10" oct',          () => esperar(decToOct(8)).serIgualA('10'));
  prueba('64 dec → "100" oct',        () => esperar(decToOct(64)).serIgualA('100'));
  prueba('"1010" bin → "10" dec',     () => esperar(binToDec('1010')).serIgualA('10'));
  prueba('"FF" hex → "255" dec',      () => esperar(hexToDec('FF')).serIgualA('255'));
  prueba('"10" oct → "8" dec',        () => esperar(octToDec('10')).serIgualA('8'));
});

// ─── Estadística ────────────────────────────────────────────────────────────────

describir('Estadística', () => {
  // Media
  function media(arr) {
    return arr.reduce((a, v) => a + v, 0) / arr.length;
  }
  // Mediana
  function mediana(arr) {
    const s = [...arr].sort((a, b) => a - b);
    const m = Math.floor(s.length / 2);
    return s.length % 2 === 0 ? (s[m - 1] + s[m]) / 2 : s[m];
  }
  // Moda
  function moda(arr) {
    const f = new Map();
    let maxF = 0, resultado = arr[0];
    for (const v of arr) {
      const c = (f.get(v) || 0) + 1;
      f.set(v, c);
      if (c > maxF) { maxF = c; resultado = v; }
    }
    return resultado;
  }
  // Varianza poblacional
  function varianza(arr) {
    if (arr.length === 1) return 0;
    const m = media(arr);
    return arr.reduce((a, v) => a + (v - m) ** 2, 0) / arr.length;
  }
  // Desviación estándar
  function desviacion(arr) { return Math.sqrt(varianza(arr)); }
  // Rango
  function rango(arr) { return Math.max(...arr) - Math.min(...arr); }
  // Percentil con interpolación
  function percentil(arr, p) {
    const s = [...arr].sort((a, b) => a - b);
    const i = (p / 100) * (s.length - 1);
    const lo = Math.floor(i), hi = Math.ceil(i);
    if (lo === hi) return s[lo];
    return s[lo] + (i - lo) * (s[hi] - s[lo]);
  }

  prueba('media([1,2,3,4,5]) = 3',          () => esperar(media([1,2,3,4,5])).serIgualA(3));
  prueba('media([10]) = 10',                () => esperar(media([10])).serIgualA(10));
  prueba('mediana([1,3,5]) = 3',            () => esperar(mediana([1,3,5])).serIgualA(3));
  prueba('mediana([1,2,3,4]) = 2.5',        () => esperar(mediana([1,2,3,4])).serIgualA(2.5));
  prueba('moda([1,2,2,3]) = 2',             () => esperar(moda([1,2,2,3])).serIgualA(2));
  prueba('moda([5]) = 5',                   () => esperar(moda([5])).serIgualA(5));
  prueba('varianza([2,4,4,4,5,5,7,9]) ≈ 4', () => esperar(varianza([2,4,4,4,5,5,7,9])).aproximarse(4, 6));
  prueba('varianza([5]) = 0',               () => esperar(varianza([5])).serIgualA(0));
  prueba('desviación([2,4,4,4,5,5,7,9]) ≈ 2', () => esperar(desviacion([2,4,4,4,5,5,7,9])).aproximarse(2, 6));
  prueba('rango([1,5,3,9,2]) = 8',          () => esperar(rango([1,5,3,9,2])).serIgualA(8));
  prueba('rango([7]) = 0',                  () => esperar(rango([7])).serIgualA(0));
  prueba('percentil([1,2,3,4,5], 50) = 3',  () => esperar(percentil([1,2,3,4,5], 50)).serIgualA(3));
  prueba('percentil([1,2,3,4,5], 0) = 1',   () => esperar(percentil([1,2,3,4,5], 0)).serIgualA(1));
  prueba('percentil([1,2,3,4,5], 100) = 5', () => esperar(percentil([1,2,3,4,5], 100)).serIgualA(5));
  prueba('percentil([10,20,30,40], 25) = 17.5', () => esperar(percentil([10,20,30,40], 25)).aproximarse(17.5, 6));
});

// ─── Números Complejos ──────────────────────────────────────────────────────────

describir('Números Complejos', () => {
  function c(re, im) { return { real: re, imag: im }; }

  // Suma
  function cAdd(z1, z2) { return { real: z1.real + z2.real, imag: z1.imag + z2.imag }; }
  // Resta
  function cSub(z1, z2) { return { real: z1.real - z2.real, imag: z1.imag - z2.imag }; }
  // Multiplicación
  function cMul(z1, z2) {
    return { real: z1.real*z2.real - z1.imag*z2.imag, imag: z1.real*z2.imag + z1.imag*z2.real };
  }
  // División
  function cDiv(z1, z2) {
    const d = z2.real*z2.real + z2.imag*z2.imag;
    return { real: (z1.real*z2.real + z1.imag*z2.imag)/d, imag: (z1.imag*z2.real - z1.real*z2.imag)/d };
  }
  // Módulo
  function cMod(z) { return Math.sqrt(z.real*z.real + z.imag*z.imag); }
  // Argumento
  function cArg(z) { return Math.atan2(z.imag, z.real); }
  // Conjugado
  function cConj(z) { return { real: z.real, imag: -z.imag }; }
  // Potencia (De Moivre)
  function cPow(z, n) {
    const r = cMod(z), theta = cArg(z);
    const rn = Math.pow(r, n), ang = n * theta;
    return { real: rn * Math.cos(ang), imag: rn * Math.sin(ang) };
  }
  // Raíz cuadrada
  function cSqrt(z) {
    const r = cMod(z);
    if (r === 0) return { real: 0, imag: 0 };
    const re = Math.sqrt((r + z.real) / 2);
    const im = Math.sqrt((r - z.real) / 2);
    return { real: re, imag: z.imag >= 0 ? im : -im };
  }

  prueba('(1+2i) + (3+4i) = 4+6i', () => {
    const r = cAdd(c(1,2), c(3,4));
    esperar(r.real).serIgualA(4);
    esperar(r.imag).serIgualA(6);
  });
  prueba('(5+3i) - (2+1i) = 3+2i', () => {
    const r = cSub(c(5,3), c(2,1));
    esperar(r.real).serIgualA(3);
    esperar(r.imag).serIgualA(2);
  });
  prueba('(1+2i) × (3+4i) = -5+10i', () => {
    const r = cMul(c(1,2), c(3,4));
    esperar(r.real).serIgualA(-5);
    esperar(r.imag).serIgualA(10);
  });
  prueba('(1+2i) / (1-1i) → real ≈ -0.5', () => {
    const r = cDiv(c(1,2), c(1,-1));
    esperar(r.real).aproximarse(-0.5, 6);
    esperar(r.imag).aproximarse(1.5, 6);
  });
  prueba('|3+4i| = 5',       () => esperar(cMod(c(3,4))).serIgualA(5));
  prueba('|0+0i| = 0',       () => esperar(cMod(c(0,0))).serIgualA(0));
  prueba('arg(1+0i) = 0',    () => esperar(cArg(c(1,0))).serIgualA(0));
  prueba('arg(0+1i) ≈ π/2',  () => esperar(cArg(c(0,1))).aproximarse(Math.PI/2, 10));
  prueba('conj(3+4i) = 3-4i', () => {
    const r = cConj(c(3,4));
    esperar(r.real).serIgualA(3);
    esperar(r.imag).serIgualA(-4);
  });
  prueba('(1+i)^2 → real ≈ 0, imag ≈ 2', () => {
    const r = cPow(c(1,1), 2);
    esperar(r.real).aproximarse(0, 10);
    esperar(r.imag).aproximarse(2, 10);
  });
  prueba('(0+1i)^0 = 1+0i', () => {
    const r = cPow(c(0,1), 0);
    esperar(r.real).serIgualA(1);
    esperar(r.imag).serIgualA(0);
  });
  prueba('√(0+1i) → real ≈ 0.7071', () => {
    const r = cSqrt(c(0,1));
    esperar(r.real).aproximarse(Math.SQRT1_2, 6);
    esperar(r.imag).aproximarse(Math.SQRT1_2, 6);
  });
  prueba('√(-1+0i) → imag ≈ 1', () => {
    const r = cSqrt(c(-1,0));
    esperar(r.real).aproximarse(0, 6);
    esperar(r.imag).aproximarse(1, 6);
  });
});

// ─── T-87 a T-93: Edge Cases de Números Complejos ────────────────────────────

describir('Edge Cases: Números Complejos', () => {
  // Helpers locales (misma lógica que modules/complejos.js)
  function c(real, imag) { return { real, imag }; }

  function cMod(z) { return Math.sqrt(z.real * z.real + z.imag * z.imag); }

  function cSqrt(z) {
    const r = cMod(z);
    if (r === 0) return { real: 0, imag: 0 };
    const re = Math.sqrt((r + z.real) / 2);
    const im = Math.sqrt((r - z.real) / 2);
    return { real: re, imag: z.imag >= 0 ? im : -im };
  }

  function cDiv(z1, z2) {
    const d = z2.real * z2.real + z2.imag * z2.imag;
    if (d === 0) throw new Error('División por cero complejo.');
    return {
      real: (z1.real * z2.real + z1.imag * z2.imag) / d,
      imag: (z1.imag * z2.real - z1.real * z2.imag) / d,
    };
  }

  function cPow(z, n) {
    if (typeof n !== 'number' || !Number.isInteger(n))
      throw new Error('El exponente debe ser un entero.');
    if (n < 0 && z.real === 0 && z.imag === 0)
      throw new Error('Potencia negativa de cero no definida.');
    if (n === 0) return { real: 1, imag: 0 };
    const r = cMod(z), theta = Math.atan2(z.imag, z.real);
    const rn = Math.pow(r, n), ang = n * theta;
    return { real: rn * Math.cos(ang), imag: rn * Math.sin(ang) };
  }

  // T-87: √(-1+0i) → 0+1i  (raíz cuadrada de número negativo puro)
  prueba('T-87: sqrt(-1+0i) → real≈0, imag≈1', () => {
    const r = cSqrt(c(-1, 0));
    esperar(r.real).aproximarse(0, 6);
    esperar(r.imag).aproximarse(1, 6);
  });

  // T-88: √(-4+0i) → 0+2i
  prueba('T-88: sqrt(-4+0i) → real≈0, imag≈2', () => {
    const r = cSqrt(c(-4, 0));
    esperar(r.real).aproximarse(0, 6);
    esperar(r.imag).aproximarse(2, 6);
  });

  // T-89: √(0+0i) → 0+0i  (raíz de cero)
  prueba('T-89: sqrt(0+0i) → 0+0i', () => {
    const r = cSqrt(c(0, 0));
    esperar(r.real).serIgualA(0);
    esperar(r.imag).serIgualA(0);
  });

  // T-90: división por cero complejo lanza error
  prueba('T-90: (1+2i) / (0+0i) lanza error', () =>
    esperar(() => cDiv(c(1, 2), c(0, 0))).lanzarError());

  // T-91: división de cero entre número no-cero → resultado cero
  prueba('T-91: (0+0i) / (3+4i) → real≈0, imag≈0', () => {
    const r = cDiv(c(0, 0), c(3, 4));
    esperar(r.real).aproximarse(0, 10);
    esperar(r.imag).aproximarse(0, 10);
  });

  // T-92: potencia negativa de cero lanza error (ISS-01 — regresión)
  prueba('T-92: (0+0i)^(-1) lanza error (regresión ISS-01)', () =>
    esperar(() => cPow(c(0, 0), -1)).lanzarError());

  // T-93: potencia negativa de cualquier exponente negativo sobre cero lanza error
  prueba('T-93: (0+0i)^(-3) lanza error', () =>
    esperar(() => cPow(c(0, 0), -3)).lanzarError());
});

// ─── T-79 a T-86: Integración y Regresión ────────────────────────────────────

describir('Integración: Bases Numéricas (módulo bases.js)', () => {
  // Replica la lógica exacta de convertDecimalToBinary() de bases.js
  function convertDecimalToBinary(n) {
    if (n === 0) return '0';
    const signo = n < 0 ? '-' : '';
    return signo + Math.abs(n).toString(2);
  }
  // Replica convertDecimalToHex() — retorna mayúsculas (igual que bases.js)
  function convertDecimalToHex(n) {
    if (n === 0) return '0';
    const signo = n < 0 ? '-' : '';
    return signo + Math.abs(n).toString(16).toUpperCase();
  }

  // T-79
  prueba('T-79: convertDecimalToBinary(10) === "1010"', () =>
    esperar(convertDecimalToBinary(10)).serIgualA('1010'));

  // T-80
  prueba('T-80: convertDecimalToHex(255) === "FF"', () =>
    esperar(convertDecimalToHex(255)).serIgualA('FF'));
});

describir('Integración: Estadística (módulo estadistica.js)', () => {
  function mean(datos) {
    return datos.reduce((acc, v) => acc + v, 0) / datos.length;
  }
  function variance(datos) {
    if (datos.length === 1) return 0;
    const m = mean(datos);
    return datos.reduce((acc, v) => acc + (v - m) ** 2, 0) / datos.length;
  }
  function stdDev(datos) { return Math.sqrt(variance(datos)); }

  // T-81
  prueba('T-81: mean([1,2,3,4,5]) === 3', () =>
    esperar(mean([1, 2, 3, 4, 5])).serIgualA(3));

  // T-82 — tolerancia ±0.001 (3 dígitos)
  prueba('T-82: stdDev([2,4,4,4,5,5,7,9]) ≈ 2', () =>
    esperar(stdDev([2, 4, 4, 4, 5, 5, 7, 9])).aproximarse(2, 3));
});

describir('Integración: Complejos (módulo complejos.js)', () => {
  function complejo(real, imag) { return { real, imag }; }
  function modulus(z) { return Math.sqrt(z.real * z.real + z.imag * z.imag); }
  function conjugate(z) { return { real: z.real, imag: -z.imag }; }

  // T-83
  prueba('T-83: modulus({real:3, imag:4}) === 5', () =>
    esperar(modulus(complejo(3, 4))).serIgualA(5));

  // T-84 — compara real e imag por separado (objeto no comparable con ===)
  prueba('T-84: conjugate({real:3, imag:4}) → {real:3, imag:-4}', () => {
    const r = conjugate(complejo(3, 4));
    esperar(r.real).serIgualA(3);
    esperar(r.imag).serIgualA(-4);
  });
});

describir('Regresión BUG-01: Modo GRAD (FASE 0A)', () => {
  // Replica la lógica de preprocesarExpresion() de mathEngine.js para GRAD
  function aplicarGRAD(expr) {
    const TRIG_FNS = ['sin', 'cos', 'tan', 'asin', 'acos', 'atan'];
    const factor = Math.PI / 200; // factor GRAD → RAD
    let result = expr;
    for (const fn of TRIG_FNS) {
      result = result.replace(
        new RegExp(fn + '\\(([^)]+)\\)', 'g'),
        (_, arg) => `${fn}((${arg}) * ${factor})`
      );
    }
    return result;
  }
  function evalGRAD(expr) {
    // eslint-disable-next-line no-new-func
    return new Function('sin', 'cos', 'tan', 'asin', 'acos', 'atan',
      'return ' + aplicarGRAD(expr))(
      Math.sin, Math.cos, Math.tan, Math.asin, Math.acos, Math.atan
    );
  }

  // T-85: sin(100 grad) debe devolver número ≈ 1, no 'Error de Sintaxis'
  prueba('T-85: sin(100) en GRAD devuelve número ≈ 1 (fix BUG-01)', () => {
    const resultado = evalGRAD('sin(100)');
    esperar(typeof resultado).serIgualA('number');
    esperar(resultado).aproximarse(1, 6);
  });

  // T-86: sin/cos/tan correctos en RAD, DEG y GRAD — 3 afirmaciones
  prueba('T-86: sin/cos/tan correctos en RAD, DEG y GRAD', () => {
    // RAD: sin(π/2) = 1
    esperar(Math.sin(Math.PI / 2)).aproximarse(1, 10);
    // DEG: sin(90°) = sin(90 * π/180) = 1
    esperar(Math.sin(90 * Math.PI / 180)).aproximarse(1, 10);
    // GRAD: sin(100 grad) = sin(100 * π/200) = 1
    esperar(Math.sin(100 * Math.PI / 200)).aproximarse(1, 10);
  });
});

// ─── Resumen ─────────────────────────────────────────────────────────────────
console.log(`\n${'═'.repeat(45)}`);
console.log(`Total: ${aprobadas + falladas} pruebas`);
console.log(`\x1b[32m✓ Aprobadas: ${aprobadas}\x1b[0m`);
if (falladas > 0) {
  console.log(`\x1b[31m✗ Falladas:  ${falladas}\x1b[0m`);
  process.exit(1);
} else {
  console.log(`\x1b[32m¡Todas las pruebas pasaron!\x1b[0m`);
}
