# AGENTS.md

Guide for AI agents working in this repository.

This project is a modular scientific calculator written in JavaScript and designed to run entirely in the browser.

All code and naming conventions are written in Spanish.

---

# Project Architecture

The application is structured using ES modules. It is a Progressive Web App (PWA) with offline support.

Core modules:

modules/constants.js
Mathematical and physical constants.

modules/parser.js
Parses user input expressions.

modules/mathEngine.js
Core math evaluation engine.

modules/matrix.js
Matrix operations.

modules/units.js
Unit conversion utilities.

PWA files:

libs/math.min.js
Local copy of math.js 12.4.2 (no CDN dependency).

manifest.json
Web App Manifest for installability.

sw.js
Service Worker with cache-first strategy. When adding new modules or files, update the RECURSOS_CACHE array in sw.js.

icons/
PWA icons (192x192, 512x512).

The central evaluation pipeline is:

user input
↓
parser.js
↓
mathEngine.js
↓
evaluate()
↓
result

The `evaluate()` function is the core execution point of the calculator.

Agents modifying mathematical behavior should work inside `mathEngine.js`.

---

# Entry Point

The application entry point is:

main.js

UI structure is defined in:

index.html

Styling is located in:

styles/style.css

---

# Tests

Unit tests are located in:

tests/math.test.js

Run tests with: node tests/math.test.js

Tests use a custom lightweight framework (no external dependencies). The test file re-implements core logic inline rather than importing modules.

Agents implementing new mathematical modules must add corresponding tests.

---

# Code Conventions

Important conventions used in this repository:

* Code and variables are written in Spanish.
* Modules use ES module syntax.
* Mathematical logic should remain inside `/modules`.
* UI logic should remain in `main.js`.
* Styling is handled in `styles/style.css`.

---

# Product Context

The product requirements for the next version are defined in:

docs/PRD-v3.md

Agents implementing features should follow the implementation phases defined in the PRD.

---

# Implementation Phases

Development follows these phases:

Phase 1 — PWA infrastructure
Phase 2 — New mathematical modules
Phase 3 — Visual redesign
Phase 4 — QA and testing

Agents should implement features phase by phase.

Each phase should produce a functional result before moving to the next.
