import { defineConfig } from 'astro/config';
import svelte from '@astrojs/svelte';

// Dev server headers mirror dist/_headers minus CSP (dev needs inline HMR scripts). `npm run preview` is
// scripts/serve.mjs, which applies the built dist/_headers (CSP included) like Cloudflare.
const base = { 'Cross-Origin-Opener-Policy': 'same-origin', 'Cross-Origin-Resource-Policy': 'same-origin' };
const coep = process.env.COEP ? { 'Cross-Origin-Embedder-Policy': 'require-corp' } : {};
const headers = (extra = {}) => (server) => {
  server.middlewares.use((_req, res, next) => { for (const [k, v] of Object.entries({ ...base, ...coep, ...extra })) res.setHeader(k, v); next(); });
};

export default defineConfig({
  site: 'https://useconvy.com',
  output: 'static',
  trailingSlash: 'ignore',
  i18n: { defaultLocale: 'en', locales: ['en', 'tr'], routing: { prefixDefaultLocale: false } },
  integrations: [svelte()],
  build: { inlineStylesheets: 'never' },
  vite: {
    plugins: [{ name: 'convy-headers', configureServer: headers() }],
    optimizeDeps: { exclude: ['@ffmpeg/ffmpeg'] },
    worker: { format: 'es' },
  },
});
