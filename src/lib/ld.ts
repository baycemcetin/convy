// JSON-LD (SEO-SAYFALAR §2.7): WebApplication on the two home pages only (no rating, no review: none exists and none is invented); BreadcrumbList on pairs and the index. No FAQPage.
const SITE = 'https://useconvy.com';
export const ld = (o: object) => JSON.stringify({ '@context': 'https://schema.org', ...o });
export const webApp = (lang: 'en' | 'tr', url: string, description: string) => ld({
  '@type': 'WebApplication', name: 'Convy', url: SITE + url, description, applicationCategory: 'UtilitiesApplication', operatingSystem: 'Web browser',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' }, inLanguage: lang,
});
/** crumbs: [name, path]; the last item is the current page and carries no `item` requirement but gets one anyway (valid) */
export const breadcrumb = (crumbs: [string, string][]) => ld({
  '@type': 'BreadcrumbList',
  itemListElement: crumbs.map(([name, path], i) => ({ '@type': 'ListItem', position: i + 1, name, item: SITE + path })),
});
