// Post-build: writes dist/_headers (MIMARI §11) with a CSP that hashes every inline <script> found in dist HTML
// (hash-all-dist, not one page). No COEP in v1 (Ek C); add it back here if the three-browser e2e condition fails.
import { readdirSync, readFileSync, writeFileSync, statSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join } from 'node:path';
const walk = (d) => readdirSync(d).flatMap((f) => (statSync(join(d, f)).isDirectory() ? walk(join(d, f)) : [join(d, f)]));
const hashes = new Set(), styles = new Set();
const h = (b) => `'sha256-${createHash('sha256').update(b).digest('base64')}'`;
for (const f of walk('dist').filter((f) => f.endsWith('.html')))
  for (const [, body] of readFileSync(f, 'utf8').matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g))
    if (body.trim()) hashes.add(h(body));
for (const f of walk('dist').filter((f) => f.endsWith('.html')))
  for (const [, body] of readFileSync(f, 'utf8').matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)) styles.add(h(body)); // Astro's island display:contents rule
const csp = [
  "default-src 'self'", `script-src 'self' 'wasm-unsafe-eval' ${[...hashes].join(' ')}`.trim(), "worker-src 'self' blob:",
  "connect-src 'self' blob:", "img-src 'self' blob: data:", "media-src 'self' blob:", `style-src 'self' ${[...styles].join(' ')}`.trim(), "style-src-attr 'unsafe-inline'",
  "font-src 'self'", "object-src 'none'", "base-uri 'none'", "form-action 'none'", "frame-ancestors 'none'", // no upgrade-insecure-requests: everything is same-origin + HSTS, and WebKit upgrades http://127.0.0.1 in local e2e
].join('; ');
writeFileSync('dist/_headers', `/*
  Cross-Origin-Opener-Policy: same-origin
  Cross-Origin-Resource-Policy: same-origin
  Content-Security-Policy: ${csp}
  Referrer-Policy: strict-origin-when-cross-origin
  X-Content-Type-Options: nosniff
  Permissions-Policy: camera=(), microphone=(), geolocation=(), interest-cohort=()
  Strict-Transport-Security: max-age=31536000; includeSubDomains
/_astro/*
  Cache-Control: public, max-age=31536000, immutable
/engines/*
  Cache-Control: public, max-age=31536000, immutable
`);
console.log(`dist/_headers: ${hashes.size} inline script, ${styles.size} inline style hash(es)`);
