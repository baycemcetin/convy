---
draft: false
title: "Convy Hakkında: Açık Kaynak, Lisanslar, Yapanlar"
h1: "Convy hakkında"
description: "Convy nedir, kim yaptı (Zeze Workshop), içindeki açık kaynak motorlar, sürümleri, lisansları ve kaynak kodu."
---
Convy, tarayıcında çalışan bir dosya dönüştürücü. Görsel, ses, video, belge ve PDF sayfalarını WebAssembly'ye derlenmiş açık kaynak motorlarla, bu cihazda dönüştürür. Reklam yok, hesap yok. Convy'yi Zeze Workshop yaptı ve kendisi de açık kaynak.

## Kim yaptı

Convy'yi Zeze Workshop tasarladı ve geliştirdi: ürünü, kimliği, metinleri ve kodu. Stüdyonun adı altbilgide ve bu sayfada geçer, dönüştürücünün içinde hiçbir yerde geçmez.

<h2 id="lisanslar">Lisanslar</h2>

Convy, GNU Genel Kamu Lisansı sürüm 3 ya da sonrası (GPL-3.0-or-later) ile lisanslanır. İçindeki motorlar ve kütüphaneler kendi lisanslarını korur:

| Bileşen | Sürüm | Burada ne yapar | Lisans |
|---|---|---|---|
| ImageMagick (magick-wasm) | 0.0.46 | Görseller | Apache-2.0 ve ImageMagick Lisansı |
| ffmpeg.wasm çekirdeği | 0.12.10 | Ses, video yedeği, videodan GIF | GPL-2.0-or-later |
| ffmpeg.wasm | 0.12.15 | ffmpeg çekirdeğini çalıştırır | MIT |
| Mediabunny | 1.65.2 | WebCodecs ile video | MPL-2.0 |
| Pandoc (pandoc-wasm) | 1.1.0 (Pandoc 3.10) | Belgeler | GPL-2.0-or-later |
| pdf.js (pdfjs-dist) | 6.5.438 | PDF sayfalarından görsel ve metin | Apache-2.0 |
| fflate | 0.8.3 | ZIP dosyaları, PDF içindeki sıkıştırma | MIT |
| Astro | 7.4.2 | Siteyi üretir | MIT |
| Svelte | 5.57.2 | Dönüştürücü arayüzü | MIT |
| Inter | | Yazı karakteri | SIL Open Font License 1.1 |

ImageMagick derlemesi başka kütüphaneler de içerir; aralarında HEIC için libheif ve libde265 (LGPL-3.0) var.

<h2 id="kaynak">Kaynak kod</h2>

Convy'nin kaynak kodu GPL-3.0-or-later lisanslıdır. Onu çalıştırabilir, inceleyebilir, değiştirebilir ve paylaşabilirsin. Değiştirilmiş bir sürümü paylaşırsan o sürüm de aynı lisansla ve kaynak koduyla birlikte paylaşılır. Convy'nin kendi kodu sıfırdan yazıldı.
