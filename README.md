# CalcIng

Calculadora científica de ingeniería para el público general.

CalcIng es una aplicación web de código abierto diseñada para realizar cálculos científicos avanzados directamente en el navegador. Incluye operaciones matemáticas, matrices, conversión de unidades y graficación de funciones en una interfaz moderna y responsive.

El objetivo del proyecto es crear una herramienta de cálculo científico accesible, rápida y completamente funcional sin conexión a internet.

---

# Características actuales (v2.0)

* Calculadora científica completa
* Operaciones trigonométricas y logarítmicas
* Graficación de funciones matemáticas
* Conversión de unidades
* Operaciones con matrices
* Constantes físicas y matemáticas
* Historial de cálculos
* Memoria de calculadora
* Diseño responsive
* Suite de pruebas unitarias

---

# Roadmap

La versión **3.0** está en desarrollo y añadirá:

* Progressive Web App (PWA)
* Soporte offline completo
* Nuevos módulos matemáticos
* Rediseño visual profesional
* Ampliación de la suite de pruebas

El plan completo se encuentra en:

docs/PRD-v3.md

---

# Arquitectura del proyecto

La aplicación utiliza una arquitectura modular basada en ES Modules.

modules/
constants.js
mathEngine.js
matrix.js
parser.js
units.js

El flujo principal de cálculo es:

input usuario
↓
parser.js
↓
mathEngine.js
↓
resultado

La función central que procesa las expresiones matemáticas es:

evaluate()

---

# Estructura del proyecto

modules/
styles/
tests/

docs/

AGENTS.md
README.md
index.html
main.js

---

# Ejecutar el proyecto

La aplicación es completamente client-side.

Solo necesitas abrir:

index.html

en cualquier navegador moderno.

Para desarrollo se recomienda usar un servidor local:

npx serve

o

python -m http.server

---

# Pruebas

Las pruebas unitarias se encuentran en:

tests/math.test.js

El objetivo de la versión 3.0 es aumentar la cobertura de pruebas de **38 a 86 tests**.

---

# Objetivo del proyecto

Convertir CalcIng en una calculadora científica moderna en español que pueda competir con herramientas populares accesibles desde el navegador.

---

# Licencia

Proyecto open source.
