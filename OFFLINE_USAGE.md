# Offline Usage

The BrainPDF application is designed to work even without network connectivity. After the initial visit, all resources are cached by the service worker. Follow these steps to verify offline behaviour:

1. Serve the contents of the `docs/` directory from a web server and open the site in your browser while online.
2. Use your browser's developer tools to simulate going offline.
3. Refresh the page. The application should continue to load and allow you to interact with it without errors.

For an automated check run `npm test`. The `pwa-offline.test.js` script ensures the generated files contain the service worker configuration required for offline operation.
