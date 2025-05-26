import { precacheAndRoute, cleanupOutdatedCaches } from "workbox-precaching";
import { registerRoute } from "workbox-routing";
import {
  CacheFirst,
  NetworkFirst,
  StaleWhileRevalidate,
} from "workbox-strategies";
import { ExpirationPlugin } from "workbox-expiration";
import { CacheableResponsePlugin } from "workbox-cacheable-response";

cleanupOutdatedCaches();

precacheAndRoute(self.__WB_MANIFEST || []);

registerRoute(
  ({ url }) =>
    url.origin === "https://story-api.dicoding.dev" &&
    url.pathname.startsWith("/v1/"),
  new NetworkFirst({
    cacheName: "api-dicoding-cache",
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({ maxEntries: 50, maxAgeSeconds: 24 * 60 * 60 }),
    ],
  })
);

registerRoute(
  ({ request }) => request.destination === "image",
  new CacheFirst({
    cacheName: "images-cache",
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 30 * 24 * 60 * 60,
      }),
    ],
  })
);

self.addEventListener("push", function (event) {
  let notificationData = {
    title: "Notifikasi Baru",
    body: "Anda memiliki notifikasi baru.",
    icon: "/images/icons/icon-x192.png",
    badge: "/images/favicon.png",
    url: "/",
  };

  // Coba parse data sebagai JSON, tapi tangani jika bukan JSON
  if (event.data) {
    try {
      const jsonData = event.data.json();
      // Gunakan data JSON jika berhasil di-parse
      notificationData = {
        title: jsonData.title || notificationData.title,
        body: jsonData.body || notificationData.body,
        icon: jsonData.icon || notificationData.icon,
        badge: jsonData.badge || notificationData.badge,
        url: jsonData.url || notificationData.url,
      };
    } catch (error) {
      // Jika parsing JSON gagal, gunakan data sebagai text biasa
      console.warn(
        "Push message tidak dalam format JSON, menggunakan sebagai teks:",
        error
      );
      const textData = event.data.text();
      notificationData.body = textData;
    }
  }

  // Tampilkan notifikasi dengan data yang sudah disiapkan
  event.waitUntil(
    self.registration.showNotification(notificationData.title, {
      body: notificationData.body,
      icon: notificationData.icon,
      badge: notificationData.badge,
      data: {
        url: notificationData.url,
      },
    })
  );
});

self.addEventListener("notificationclick", function (event) {
  event.notification.close();
  const notificationDataUrl =
    event.notification.data && event.notification.data.url;

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then(function (clientList) {
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i];
          if (client.url === notificationDataUrl && "focus" in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(notificationDataUrl || "/");
        }
      })
  );
});

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

self.addEventListener("activate", (event) => {
  event.waitUntil(clients.claim());
});
