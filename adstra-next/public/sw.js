// Service Worker stub to cleanly respond to browser /sw.js requests with 200 OK
// and unregister any stale service workers, preventing slow 404 compilation in dev.

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    self.registration
      .unregister()
      .then(() => self.clients.matchAll())
      .then((clients) => {
        clients.forEach((client) => {
          if (client.url && "navigate" in client) {
            client.navigate(client.url);
          }
        });
      })
      .catch(() => {})
  );
});
