export default defineNuxtConfig({
  modules: [
    '@vite-pwa/nuxt',
  ],
  pwa: {
    /** Service‑worker behaviour **/
    registerType: 'autoUpdate', // swaps in new SW instantly

    /** Web App Manifest **/
    manifest: {
      name: 'My Offline App',
      short_name: 'OfflineApp',
      start_url: '/',
      display: 'standalone',
      background_color: '#ffffff',
      theme_color: '#3b8070',
      icons: []
    },

    /** Workbox caching rules **/
    workbox: {
      navigateFallback: '/', // fallback page when offline
      runtimeCaching: [
        {
          urlPattern: /^https:\/\/api\.example\.com\/.*$/,
          handler: 'NetworkFirst',
          options: {
            cacheName: 'api-cache',
            expiration: { maxEntries: 50, maxAgeSeconds: 86_400 }
          }
        }
      ]
    }
  }
})
