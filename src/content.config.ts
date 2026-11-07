// Content collections. File name = `<key>.<lang>.md` (heic-jpg.en.md); the entry id keeps the dots so key and lang are read from it (publish.ts).
// `draft: true` keeps a file out of production (pairs/formats) or marks the page noindex (pages); CONVY_RELEASE=1 fails the build while any draft remains.
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const load = (base: string) => glob({ pattern: '*.md', base, generateId: ({ entry }) => entry.replace(/\.md$/, '') });
const draft = z.boolean().default(false);

export const collections = {
  // body (markdown) = pairNote. Title, H1 and meta description are composed from the pair, the formats and metaHook (publish.ts): not authored here.
  pairs: defineCollection({ loader: load('./src/content/pairs'), schema: z.object({
    draft, intro: z.string(), metaHook: z.string(),
    steps: z.array(z.string()), limits: z.array(z.string()),
    faq: z.array(z.object({ q: z.string(), a: z.string() })),
    factRefs: z.array(z.string()), // pair-facts keys the pairNote relies on: lossy quality metadata transparency animation path download offline limits.N extra.N
  }) }),
  // body = the format text shared by every pair that uses it (50-90 words); one file per format per language
  formats: defineCollection({ loader: load('./src/content/formats'), schema: z.object({ draft }) }),
  // P4 P5 P6 P7: title/H1/meta are SEO-owned (SEO-SAYFALAR §3.4); body = page text
  pages: defineCollection({ loader: load('./src/content/pages'), schema: z.object({ draft, title: z.string(), h1: z.string(), description: z.string() }) }),
};
