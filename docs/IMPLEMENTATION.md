# CalcIng — Implementation Specification

Technical implementation guide for CalcIng v3.0.

This document defines the exact structure, functions, and behavior required for implementing the features described in `PRD-v3.md`.

All code must follow the existing modular architecture of the repository.

---

# Architecture Principles

The project uses a modular architecture based on ES modules.

All mathematical logic must remain inside the `/modules` directory.

Current modules:

modules/constants.js
modules/parser.js
modules/mathEngine.js
modules/matrix.js
modules/units.js

New modules must follow the same structure and export ES functions.

---

# Core Evaluation Flow

All calculations follow this pipeline:

User input
→ parser.js
→ mathEngine.js
→ evaluate()
→ result

The `evaluate()` function inside `mathEngine.js` is the core execution point.

All new mathematical functionality must integrate with this engine without breaking the existing evaluation flow.

---

# Phase 1 — PWA Infrastructure

Goal: convert CalcIng into a fully installable Progressive Web App.

---

## Step 1 — Local math.js

Create directory:

libs/

Download math.js and save:

libs/math.min.js

Remove any CDN references in `index.html`.

Load math.js locally.

---

## Step 2 — Remove Tailwind CDN

Remove the Tailwind CDN dependency from `index.html`.

Ensure all UI styling is handled by:

styles/style.css

Audit existing class usage to ensure layout is preserved.

---

## Step 3 — Web App Manifest

Create file:

manifest.json

Minimum structure:

{
"name": "CalcIng — Calculadora de Ingeniería",
"short_name": "CalcIng",
"start_url": "/",
"display": "standalone",
"background_color": "#090d13",
"theme_color": "#00b4cc",
"orientation": "portrait-primary",
"lang": "es"
}

Add icons:

icons/icon-192x192.png
icons/icon-512x512.png

Link manifest in `index.html`.

---

## Step 4 — Service Worker

Create file:

sw.js

Implement cache-first strategy.

Cache the following files:

index.html
main.js
styles/style.css

modules/constants.js
modules/mathEngine.js
modules/parser.js
modules/matrix.js
modules/units.js

libs/math.min.js

manifest.json

---

## Step 5 — Service Worker Registration

Add script in `index.html` before closing `</body>`:

Check:

if ('serviceWorker' in navigator)

Register `sw.js` on window load.

---

# Phase 2 — New Mathematical Modules

Three modules must be implemented.

Each module must include unit tests.

---

# Module 1 — Base Converter

File:

modules/bases.js

Exports:

convertDecimalToBinary(n)
convertDecimalToHex(n)
convertDecimalToOctal(n)

convertBinaryToDecimal(n)
convertHexToDecimal(n)
convertOctalToDecimal(n)

Behavior:

All conversions must support negative integers.

Return type:

string

Example:

convertDecimalToBinary(10)

returns:

"1010"

---

# Module 2 — Statistics

File:

modules/estadistica.js

Exports:

mean(array)
median(array)
mode(array)
variance(array)
stdDev(array)
range(array)
percentile(array, p)

Input:

array of numbers

Output:

number

Percentile implementation must use interpolation.

Edge cases:

* empty array
* single element array

---

# Module 3 — Complex Numbers

File:

modules/complejos.js

Represent complex numbers as objects:

{
real: number,
imag: number
}

Functions:

add(z1, z2)
subtract(z1, z2)
multiply(z1, z2)
divide(z1, z2)

modulus(z)
argument(z)

conjugate(z)

power(z, n)

sqrt(z)

Return complex objects.

---

# Integration with Math Engine

Each module must be registered inside:

modules/mathEngine.js

Expose functions through the evaluation system.

Example:

evaluate("mean([1,2,3])")

should return:

2

---

# Phase 3 — Visual Improvements

Modify:

index.html
styles/style.css

Add:

* improved display layout
* better button interactions
* animated result transitions
* improved panel UI

No external CSS frameworks allowed.

---

# Phase 4 — Tests

Extend:

tests/math.test.js

Add tests for:

Base conversions
Statistics functions
Complex numbers

Total tests required:

86 minimum.

---

# Performance Constraints

Total application size:

< 500KB

Initial load time:

< 1.5 seconds

Offline load:

< 200ms

---

# Quality Requirements

No console errors.

All modules must be documented with JSDoc.

All tests must pass before merging changes.
