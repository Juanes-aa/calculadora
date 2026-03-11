/**
 * sw.js
 * Service Worker para CalcIng v3.0.
 * Estrategia cache-first: sirve desde caché si está disponible,
 * recurre a la red solo si el recurso no está en caché.
 */

const CACHE_NAME = 'calcing-v3.1';

const RECURSOS_CACHE = [
  '/',
  '/index.html',
  '/main.js',
  '/styles/style.css',
  '/modules/constants.js',
  '/modules/mathEngine.js',
  '/modules/parser.js',
  '/modules/matrix.js',
  '/modules/units.js',
  '/modules/bases.js',
  '/modules/estadistica.js',
  '/modules/complejos.js',
  '/libs/math.min.js',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
];

// ─── Instalación: pre-cachear recursos esenciales ─────────────────────────────
self.addEventListener('install', (evento) => {
  evento.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(RECURSOS_CACHE);
    // FIX ISS-03: skipWaiting dentro de waitUntil para evitar race condition
    }).then(() => self.skipWaiting())
  );
});

// ─── Activación: limpiar cachés antiguas ──────────────────────────────────────
self.addEventListener('activate', (evento) => {
  evento.waitUntil(
    caches.keys().then((nombres) => {
      return Promise.all(
        nombres
          .filter((nombre) => nombre !== CACHE_NAME)
          .map((nombre) => caches.delete(nombre))
      );
    })
  );
  self.clients.claim();
});

// ─── Fetch: estrategia cache-first ────────────────────────────────────────────
self.addEventListener('fetch', (evento) => {
  evento.respondWith(
    caches.match(evento.request).then((respuestaCache) => {
      if (respuestaCache) {
        return respuestaCache;
      }
      return fetch(evento.request).then((respuestaRed) => {
        // Solo cachear solicitudes GET exitosas del mismo origen
        if (
          evento.request.method === 'GET' &&
          respuestaRed.status === 200 &&
          respuestaRed.type === 'basic'
        ) {
          const copia = respuestaRed.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(evento.request, copia);
          });
        }
        return respuestaRed;
      });
    }).catch(() => {
      // Fallback offline: devolver la página principal si no hay conexión
      if (evento.request.mode === 'navigate') {
        return caches.match('/index.html');
      }
    })
  );
});
