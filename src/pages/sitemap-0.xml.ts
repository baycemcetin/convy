// Indexable pages only: home, non-draft content pages, published pairs. No 404, no alias URLs, no hreflang alternates (SEO-7: hreflang lives in the page <link>s).
import { loadDocs, loadPairs } from '../content/publish';
import { DOC_KEYS, DOC, HOME } from '../i18n/site';
import { pairUrl } from '../content/conversions';
import { lastmod } from '../lib/lastmod';
const SITE = 'https://useconvy.com';
export async function GET() {
  const rows: [string, string | undefined][] = [];
  const home = lastmod(['src/pages/index.astro', 'src/i18n/metin.json']);
  rows.push([HOME.en, home], [HOME.tr, home]);
  const docs = await loadDocs();
  for (const k of DOC_KEYS) for (const l of ['en', 'tr'] as const) if (!docs[k][l].data.draft) rows.push([DOC[k][l], lastmod([`src/content/pages/${k}.${l}.md`])]);
  for (const p of (await loadPairs()).pubs) if (!p.draft) for (const l of ['en', 'tr'] as const) rows.push([pairUrl(p.c, l), lastmod([`src/content/pairs/${p.c.from}-${p.c.to}.${l}.md`])]);
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${rows.map(([u, m]) => `<url><loc>${SITE}${u}</loc>${m ? `<lastmod>${m}</lastmod>` : ''}</url>`).join('\n')}\n</urlset>\n`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml' } });
}
