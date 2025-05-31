# BrainPDF Offline PWA

BrainPDF is a minimal example of a Progressive Web Application built with Nuxt. After the first visit the site installs a service worker and precaches all of its assets so it can operate fully offline.

This repository contains the generated static output in the `docs/` directory so it can be hosted on GitHub Pages or any static file host. Once a user opens the page online, the service worker caches everything needed and the app works without a network connection.

## Setup

Install dependencies with your preferred package manager:

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

## Development

Run the development server at `http://localhost:3000`:

```bash
npm run dev
```

## Production

Build the application for production:

```bash
npm run build
```

Generate the static site (output in `docs/`):

```bash
npm run generate
```

Preview the production build locally:

```bash
npm run preview
```

## Offline usage

1. Deploy the contents of the `docs/` folder to any static web host.
2. Visit the site once while online. The service worker will install and cache all assets.
3. Subsequent visits can be completely offline. The app will load from the cache and continue to function.

## Testing

Run the test suite with:

```bash
npm test
```

The tests verify that the generated output contains a service worker with Workbox caching rules so the application can run offline after the first visit.
