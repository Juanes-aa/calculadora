# CalcIng — PRD v3.0

Product Requirements Document
Marzo 2026

---

# Resumen

CalcIng es una calculadora científica web de código abierto orientada al público general.

La versión 3.0 busca convertir la aplicación en una herramienta moderna, instalable y funcional sin conexión.

Los tres pilares de la versión 3.0 son:

1. Rediseño visual profesional
2. Nuevas funciones matemáticas
3. Conversión a Progressive Web App (PWA)

---

# Objetivo

Crear una calculadora científica moderna en español accesible desde cualquier dispositivo y capaz de competir con herramientas populares disponibles en línea.

---

# Estado actual (v2.0)

La aplicación actualmente incluye:

* cálculo científico
* graficación de funciones
* conversión de unidades
* operaciones con matrices
* solucionador de ecuaciones
* constantes físicas
* historial de cálculos
* memoria de calculadora
* diseño responsive
* 38 pruebas unitarias

---

# Limitaciones actuales

* dependencia de CDNs externos
* no funciona offline
* no es instalable como aplicación
* diseño visual mejorable
* funciones matemáticas limitadas
* sin metadata SEO
* accesibilidad incompleta

---

# Pilar 1 — Rediseño visual

Objetivo: mejorar la calidad visual y percepción profesional de la aplicación.

Cambios principales:

* nueva identidad visual
* display rediseñado
* mejoras en botones
* animaciones y microinteracciones
* panel lateral mejorado
* header y footer rediseñados

---

# Pilar 2 — Nuevas funciones matemáticas

Se añadirán tres nuevos módulos matemáticos.

## Conversión de bases numéricas

Archivo:

modules/bases.js

Conversión entre:

* decimal
* binario
* hexadecimal
* octal

---

## Estadística básica

Archivo:

modules/estadistica.js

Funciones:

* media
* mediana
* moda
* desviación estándar
* varianza
* percentiles
* rango

---

## Números complejos

Archivo:

modules/complejos.js

Operaciones:

* suma
* resta
* multiplicación
* división
* módulo
* argumento
* conjugado
* potencia
* raíz cuadrada
* forma polar

---

# Pilar 3 — Progressive Web App

La aplicación será convertida en una Progressive Web App (PWA).

Archivos nuevos:

manifest.json
sw.js

Características:

* instalable desde el navegador
* funcional sin conexión
* iconos de aplicación
* caché de recursos
* eliminación de dependencias CDN

---

# Fases de implementación

Fase 1 — Infraestructura PWA
Fase 2 — Nuevos módulos matemáticos
Fase 3 — Rediseño visual
Fase 4 — QA y pruebas finales

---

# Métricas de éxito

* 86 pruebas unitarias aprobadas
* puntuación Lighthouse ≥ 90
* aplicación instalable
* funcionamiento completo offline
* tamaño total < 500KB

---

# Fuera de alcance

No se incluye en v3.0:

* backend
* cuentas de usuario
* sincronización entre dispositivos
* álgebra simbólica
* soporte multiidioma
