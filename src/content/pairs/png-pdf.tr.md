---
draft: false
intro: "Bir form ya da kurum PDF istediğinde PNG bir ekran görüntüsü ya da tarama işe yaramaz. PNG dosyalarını seç, Convy bu cihazda her birini kendi PDF sayfasına koysun. Pikseller kayıpsız girer, saydam alanlar saydam kalır."
metaHook: "kayıpsız pikseller, korunan şeffaflık, her görsele bir sayfa"
steps:
  - "PNG görsellerini seç ya da sayfaya bırak."
  - "Hedefte PDF zaten seçili gelir."
  - "Dönüştür'e bas, sonra her görsel için çıkan PDF'yi kaydet."
limits:
  - "Bir PNG'den tek sayfalık bir PDF çıkar; birden çok görsel tek belgede birleştirilmez."
  - "16 bitlik PNG'ler PDF'de kanal başına 8 bite indirilir."
  - "250 megapikselin üstündeki görseller reddedilir; iPhone ve iPad'de sınır 100 megapiksel."
faq:
  - q: "Birkaç PNG'yi tek PDF yapabilir miyim?"
    a: "Convy'de yapamazsın. Her PNG, tek sayfalık kendi PDF'sine dönüşür; on görsel on dosya demek. Form tek bir dosyada ısrar ediyorsa çıkan PDF'leri sonradan kullandığın bir PDF uygulamasında birleştir."
  - q: "PNG, PDF'nin içinde bulanıklaşır mı?"
    a: "Hayır. Pikseller kayıpsız Flate sıkıştırmasıyla saklanır; görüntüyü bitmiş PDF'den çıkarıp açtığımızda kaynakla piksel piksel aynıydı. Tek değişiklik derinlikte: 16 bitlik bir PNG, kanal başına 8 bite indirilir."
  - q: "Saydam arka plana ne olur?"
    a: "Saydam kalır. Alfa kanalı PDF'ye yumuşak maske olarak girer, saydam yerlerden sayfanın kendisi görünür; testte PDF.js ile çizdirdiğimizde bu alanlar beyaz sayfanın üstünde göründü. Logo bir kutunun içine hapsolmaz, kendi kenarlarını korur."
  - q: "Sayfa hangi boyutta olur?"
    a: "Kâğıt ölçüsüne değil görsele göre: Convy sayfayı inç başına 150 piksel üzerinden kurar. 1920 × 1080'lik bir ekran görüntüsü yaklaşık 33 × 18 cm'lik bir sayfa verir. A4 ya da Letter'a basmak için yazdırma penceresinde sayfaya sığdır seçeneğini kullan."
factRefs: [lossy, quality, transparency, metadata, path, limits.0, extra.0, extra.1]
---
PDF'nin içinde PNG'nin her pikseli yerinde durur. Convy pikselleri kayıpsız Flate sıkıştırmasıyla yazar; bitmiş PDF'den görüntüyü çıkardığımızda kaynakla tam olarak aynıydı. Tek indirim renk derinliğinde olur: 16 bitlik bir PNG, kanal başına 8 bite iner.

Şeffaflık yumuşak maske olarak korunur. Saydam zeminli bir logo ya da imza, arkasındaki sayfayı gösterir; sonucu PDF.js ile çizdirdiğimizde saydam alanlarda beyaz sayfa görünüyordu.

PDF, PNG'nin kendi boyutuna yakın çıkar: 96 453 baytlık örnek PNG'miz 105 947 baytlık bir PDF oldu. Her görsel kendi sayfasını alır ve sayfa boyu piksellerden 150 dpi ile hesaplanır; 1920 × 1080'lik bir ekran görüntüsü kabaca 33 × 18 cm'lik bir sayfa olur. PDF'nin 14 400 punto sınırını aşan bir kenar bu sınıra küçültülür.

Metaveri silinir, ICC renk profili PDF'nin renk uzayına dönüşür, yön etiketi de silinmeden önce uygulanır. Chromium, Firefox ve WebKit'te çıkan PDF baytı baytına aynıydı.
