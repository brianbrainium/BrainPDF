# Customizing the Service Worker

BrainPDF uses the Nuxt PWA module which generates the `sw.js` file from the options in `nuxt.config.ts`.

To change caching strategies or add more runtime rules:

1. Edit the `pwa.workbox.runtimeCaching` array in `nuxt.config.ts`.
2. Each entry can specify a `urlPattern`, a caching `handler` such as `NetworkFirst` or `CacheFirst`, and additional `options` like cache name and expiration settings.
3. Run `pnpm run generate` to rebuild the static site with your updated service worker.

The resulting service worker will be placed in the `docs/` directory and will apply your custom caching logic.
