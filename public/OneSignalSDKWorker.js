// ── Web Share Target: muss VOR importScripts stehen, damit dieser
//    Handler Priorität hat, bevor OneSignal eigene fetch-Listener registriert.
// ────────────────────────────────────────────────────────────────────────────
const SHARE_CACHE_NAME = 'share-cache';

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  if (url.pathname === '/share-recipe' && event.request.method === 'POST') {
    event.respondWith((async () => {
      try {
        const formData = await event.request.formData();
        const text     = formData.get('text')  || '';
        const shareUrl = formData.get('url')   || '';
        const title    = formData.get('title') || '';

        // Alle Felder zu einem String kombinieren
        const combined = [title, text, shareUrl].filter(Boolean).join('\n');

        // Versuche, die Nachricht an ein bereits geöffnetes App-Fenster zu senden
        const clients = await self.clients.matchAll({
          type: 'window',
          includeUncontrolled: true,
        });

        if (clients.length > 0) {
          // App ist offen — direkt per postMessage senden und fokussieren
          clients[0].postMessage({ type: 'SHARE_RECEIVED', text: combined });
          try { clients[0].focus(); } catch (_) { /* focus kann in manchen Browsern fehlschlagen */ }
        } else {
          // App ist geschlossen — Text im Cache zwischenspeichern
          const cache = await caches.open(SHARE_CACHE_NAME);
          await cache.put('/pending-share', new Response(combined));
        }
      } catch (err) {
        console.error('[OneSignalSDKWorker] Share target error:', err);
      }

      // Zurück zur App-Root umleiten (303 See Other)
      return Response.redirect('/', 303);
    })());
  }
});

// ── OneSignal Push Notifications ────────────────────────────────────────────
importScripts("https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js");
