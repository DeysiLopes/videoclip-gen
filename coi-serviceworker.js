/**
 * @license
 * SPDX-License-Identifier: MIT
 * Copyright (c) 2021, Google LLC.
 *
 * This is a service worker that enables cross-origin isolation.
 * It is needed to use APIs like SharedArrayBuffer that are essential for
 * high-performance libraries like FFmpeg.
 *
 * For more details, see: https://web.dev/coop-coep/
 */

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));

self.addEventListener('fetch', (event) => {
  // We only need to modify navigation requests, but we do it for all requests
  // to be on the safe side.
  if (event.request.mode === 'navigate') {
    const newRequest = new Request(event.request, {
      headers: {
        ...event.request.headers,
        'Cross-Origin-Opener-Policy': 'same-origin',
        'Cross-Origin-Embedder-Policy': 'require-corp',
      },
    });
    event.respondWith(fetch(newRequest));
  } else {
     event.respondWith(
      fetch(event.request)
        .then((response) => {
          // If the response is not a 2xx, return it as-is.
          if (!response.ok) {
            return response;
          }
          
          // Create new headers and add the COOP/COEP headers.
          const newHeaders = new Headers(response.headers);
          newHeaders.set('Cross-Origin-Opener-Policy', 'same-origin');
          newHeaders.set('Cross-Origin-Embedder-Policy', 'require-corp');

          // Return a new response with the modified headers.
          return new Response(response.body, {
            status: response.status,
            statusText: response.statusText,
            headers: newHeaders,
          });
        })
        .catch((e) => {
          console.error('COI Service Worker fetch failed:', e);
          throw e;
        })
    );
  }
});