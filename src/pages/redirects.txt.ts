// Source of dist/_redirects: scripts/headers.mjs renames dist/redirects.txt to _redirects after the build (a page file cannot start with "_").
// Rows come from conversions.ts alias spellings x published pairs (never hand-written), plus the fixed rows. Limit 2 000 static rows (checked in tests/seo-build.mjs).
// http->https and www->apex are zone-level (Cloudflare redirect rules / domain settings), not file rows.
import { loadPairs } from '../content/publish';
import { aliasRedirects } from '../content/conversions';
import { LICENSES } from '../i18n/site';
export async function GET() {
  const rows: [string, string][] = [['/licenses', LICENSES.en], ['/licenses/', LICENSES.en], ['/tr/lisanslar', LICENSES.tr], ['/tr/lisanslar/', LICENSES.tr]];
  for (const p of (await loadPairs()).pubs) rows.push(...aliasRedirects(p.c));
  return new Response(rows.map(([a, b]) => `${a} ${b} 301`).join('\n') + '\n', { headers: { 'Content-Type': 'text/plain' } });
}
