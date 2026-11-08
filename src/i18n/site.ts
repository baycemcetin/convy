// Routes and chrome strings of the content pages (P2-P8). Page *copy* lives in src/content/*; UI copy of the tool island stays in metin.json.
// The strings below are working labels: the copywriter reviews them (listed in WAVE4.md).
export type Lang = 'en' | 'tr';
export const HOME: Record<Lang, string> = { en: '/', tr: '/tr/' };
export const INDEX: Record<Lang, string> = { en: '/convert/', tr: '/tr/donustur/' };
export const DOC = {
  index: INDEX, how: { en: '/how-it-works/', tr: '/tr/nasil-calisir/' }, faq: { en: '/faq/', tr: '/tr/sss/' },
  privacy: { en: '/privacy/', tr: '/tr/gizlilik/' }, about: { en: '/about/', tr: '/tr/hakkinda/' },
} as const;
export type DocKey = keyof typeof DOC;
export const DOC_KEYS = Object.keys(DOC) as DocKey[];
export const LICENSES: Record<Lang, string> = { en: '/about/#licenses', tr: '/tr/hakkinda/#lisanslar' };
export const SOURCE: Record<Lang, string> = { en: '/about/#source', tr: '/tr/hakkinda/#kaynak' }; // GitHub URL is not decided: the About page carries it
/** top bar links, same order as metin.json `nav` (Formats, How it works, FAQ) */
export const navHref = (l: Lang) => [INDEX[l], DOC.how[l], DOC.faq[l]];
/** footer links, same order as metin.json `foot` */
export const footHref = (l: Lang) => [INDEX[l], DOC.how[l], DOC.faq[l], DOC.privacy[l], LICENSES[l], SOURCE[l]];
export const both = (f: (l: Lang) => string): Record<Lang, string> => ({ en: f('en'), tr: f('tr') });

export const CHROME = {
  en: {
    home: 'Convy', convert: 'Convert', crumb: 'Breadcrumb',
    cat: { image: 'Image', audio: 'Audio', video: 'Video', document: 'Document', pdf: 'PDF' },
    h: { how: 'How it works here', note: 'About this conversion', limits: 'Limits', faq: 'Questions', related: 'Related conversions', about: 'About {name}' },
    sum: { engine: 'Engine', dl: 'Download', off: 'Offline', size: 'About {mb} MB, saved for next time', offline: 'Works offline once the engine is saved and the page stays open', noEngine: 'Runs inside the page, no separate engine download', fallback: 'Usually runs inside the page; about {mb} MB more if it needs the fallback engine' },
    rel: { same: 'More from {a}', target: 'More to {b}', reverse: 'The other way', near: 'Also on Convy', all: 'All {k} conversions' },
    draftNote: 'Draft content. Not for production.',
    nf: { h1: "This conversion isn't here", p: 'There is no page for this address.', pair: '{a} to {b} has no page of its own.', from: 'What {a} can become here', to: 'What can become {b}', all: 'All conversions', home: 'Open the converter' },
    menu: 'Menu',
  },
  tr: {
    home: 'Convy', convert: 'Dönüştür', crumb: 'Sayfa yolu',
    cat: { image: 'Görsel', audio: 'Ses', video: 'Video', document: 'Belge', pdf: 'PDF' },
    h: { how: 'Burada nasıl yapılır', note: 'Bu dönüşüm hakkında', limits: 'Sınırlar', faq: 'Sorular', related: 'İlgili dönüşümler', about: '{name} hakkında' },
    sum: { engine: 'Motor', dl: 'İndirme', off: 'Çevrimdışı', size: 'Yaklaşık {mb} MB, sonraki sefer için saklanır', offline: 'Motor saklandıktan sonra, sayfa açıkken çevrimdışı çalışır', noEngine: 'Sayfanın içinde çalışır, ayrı motor indirmesi yok', fallback: 'Çoğunlukla sayfanın içinde çalışır; yedek motor gerekirse yaklaşık {mb} MB daha iner' },
    rel: { same: 'Başka {a} dönüşümleri', target: 'Sonucu {b} olan diğerleri', reverse: 'Ters yönde', near: "Convy'de bu da var", all: 'Tüm {k} dönüşümleri' },
    draftNote: 'Taslak içerik. Üretime girmez.',
    nf: { h1: 'Bu dönüşüm burada yok', p: 'Bu adreste bir sayfa yok.', pair: '{a} → {b} için ayrı bir sayfa yok.', from: '{a} burada neye dönüşebilir', to: 'Burada neler {b} olabilir', all: 'Tüm dönüşümler', home: 'Dönüştürücüyü aç' },
    menu: 'Menü',
  },
} as const;
export const sub = (s: string, o: Record<string, string | number>) => s.replace(/\{(\w+)\}/g, (m, k) => (k in o ? String(o[k]) : m));
