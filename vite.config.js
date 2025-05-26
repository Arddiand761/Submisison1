import { defineConfig } from "vite";
import { resolve } from "path";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  root: resolve(__dirname, "src"),
  publicDir: resolve(__dirname, "src", "public"),
  build: {
    outDir: resolve(__dirname, "dist"),
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, "src/index.html"),
      },
    },
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },

  optimizeDeps: {
    include: ["leaflet"],
  },
  plugins: [
    VitePWA({
      registerType: "autoUpdate",
      strategies: "injectManifest",
      swSrc: "sw.js",
      includeAssets: ["favicon.png", "logo192.png", "logo512.png"],
      manifest: {
        name: "JourDay",
        short_name: "JourDay",
        description: "Aplikasi Catatan Perjalanan",
        theme_color: "#007bff",
        background_color: "#ffffff",
        display: "standalone",
        start_url: "/",
        icons: [
          {
            src: "images/icons/icon-x144.png",
            type: "image/png",
            sizes: "144x144",
            purpose: "any",
          },
          {
            src: "images/icons/maskable-icon-x48.png",
            type: "image/png",
            sizes: "48x48",
            purpose: "maskable",
          },
          {
            src: "images/icons/maskable-icon-x96.png",
            type: "image/png",
            sizes: "96x96",
            purpose: "maskable",
          },
          {
            src: "images/icons/maskable-icon-x192.png",
            type: "image/png",
            sizes: "192x192",
            purpose: "maskable",
          },
          {
            src: "images/icons/maskable-icon-x384.png",
            type: "image/png",
            sizes: "384x384",
            purpose: "maskable",
          },
          {
            src: "images/icons/maskable-icon-x512.png",
            type: "image/png",
            sizes: "512x512",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/story-api\.dicoding\.dev\/v1\//,
            handler: "NetworkFirst",
            options: {
              cacheName: "api-cache",
              networkTimeoutSeconds: 10,
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24, // 1 hari
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },
    }),
  ],
});
