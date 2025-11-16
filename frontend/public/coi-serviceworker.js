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
  // For all requests, fetch the resource and add the COOP/COEP headers to the response.
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // If the response is not OK (e.g., 404), or it's an opaque response 
        // (e.g., from a no-cors request which has status 0), return it as-is.
        if (!response.ok && response.status !== 0) {
          return response;
        }

        // Create a new Headers object and add the required COOP/COEP headers.
        const newHeaders = new Headers(response.headers);
        newHeaders.set('Cross-Origin-Opener-Policy', 'same-origin');
        newHeaders.set('Cross-Origin-Embedder-Policy', 'require-corp');

        // Return a new Response object with the original body and the modified headers.
        return new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers: newHeaders,
        });
      })
      .catch((e) => {
        console.error('COI Service Worker fetch failed:', e);
        // This could happen if the user is offline, for example.
        // It's important to still throw the error to see what went wrong.
        throw e;
      })
  );
});
