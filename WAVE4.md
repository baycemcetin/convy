# Wave 4 · SEO infrastructure and content-page skeletons (framework-specialist)

Status: done. Checks: `node tests/seo-build.mjs` (116 ok), `npm run size` 37 930 B br (budget 38 000), e2e chromium/firefox/webkit exit 0.

## Open items
- "This device" panel is not on the static content pages (P3-P8); only on the island pages. Needs the static `<details>` version (IA §4.1).
- P1 title/meta still the old `Convy · {h1}`; SEO §3.4 P1 text is not applied (metin.json is copywriter-owned).
- Pair breadcrumb is rendered below the tool (island owns the top of `<main>`), BreadcrumbList JSON-LD is complete.
- TR suffix table (`TR_SUFFIX` in conversions.ts) and chrome strings (`src/i18n/site.ts` CHROME): copywriter confirms.
- GitHub URL not decided: footer "Source on GitHub" goes to `/about/#source`.
- Worker name in wrangler.toml is a placeholder; www->apex and http->https are zone-level rules (not in `_redirects`).
- Content files are `.md` (frontmatter + markdown body), not `.mdx`: no MDX dependency needed.
- Release gate: `CONVY_RELEASE=1 npm run build` fails while any draft file remains. `CONVY_DRAFTS=1` = validation build only.

## Copywriter files (all currently `draft: true`)
- `src/content/pairs/<from>-<to>.<en|tr>.md` (sample: heic-jpg). Frontmatter: `intro` (30-55 words), `metaHook`, `steps` (3), `limits` (1-3), `faq` [{q,a}] (3-5, answers 25-80 words), `factRefs` (>=3 usable pair-facts keys: lossy quality metadata transparency animation path download offline limits.N extra.N; unverified ones are refused). Body = pairNote (>=120 words). Title/H1/description are composed in code.
- `src/content/formats/<id>.<en|tr>.md`: body = format text, 50-90 words, one per format per language (A pairs need heic jpg png webp avif mp4 mov mp3 wav m4a pdf webm gif).
- `src/content/pages/{index,how,faq,privacy,about}.<en|tr>.md`: frontmatter `title h1 description` (SEO-owned), body = text; `how` keeps ids engines/limits/offline, `about` ids licenses|lisanslar and source|kaynak. `index` body = 60-90 word intro. P6 waits for the analytics decision.
- Thresholds (pair-checks.ts): >=300 words prose per language, shingle overlap warn 30% / error 50%, unique title+description.
