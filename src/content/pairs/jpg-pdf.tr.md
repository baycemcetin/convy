---
draft: false
intro: "Bir kurum ya da çevrimiçi form PDF istediğinde elinde çoğu zaman JPG olarak kaydedilmiş bir fotoğraf ya da tarama vardır. JPG dosyalarını seç, Convy her birini tarayıcının içinde tek sayfalık bir PDF'ye koysun. JPEG verisi dokunulmadan girer, kalite kaybı olmaz."
metaHook: "JPEG verisi olduğu gibi girer, her fotoğraf bir sayfa, kalite kaybı yok"
steps:
  - "JPG fotoğraflarını ya da taramalarını seç, istersen sayfaya bırak."
  - "Hedefte PDF zaten seçili gelir."
  - "Dönüştür'e bas, ardından her görsel için çıkan PDF'yi kaydet."
limits:
  - "Bir JPG'den tek sayfalık bir PDF çıkar; birden çok fotoğraf tek belgede birleştirilmez."
  - "12 bitlik, kayıpsız ya da aritmetik kodlu JPEG'ler olduğu gibi kopyalanmaz; görsel motorundan geçip kayıpsız olarak saklanır."
  - "Standart bir JPG için motor indirilmez. Yalnızca yukarıdaki seyrek türler önce görsel motorunu indirir (yaklaşık 5 MB); sonraki seferler için saklanır."
faq:
  - q: "Fotoğraf PDF'nin içinde kalite kaybeder mi?"
    a: "Kaybetmez. JPEG verisi çözülüp yeniden sıkıştırılmadan gömülür; PDF'deki görüntü baytları kaynakla birebir aynıdır. İstisna seyrek JPEG türleri: 12 bitlik, kayıpsız ya da aritmetik kodlu dosyalar görsel motorundan geçer ve kayıpsız olarak saklanır."
  - q: "Birkaç fotoğrafı tek PDF'de birleştirebilir miyim?"
    a: "Hayır. Her JPG kendi tek sayfalık PDF'sine dönüşür; beş fotoğraf seçersen beş PDF alırsın. Tek belgede birleştirme sunulmuyor. Form tek dosya istiyorsa PDF'leri sonradan bir PDF düzenleyicisiyle birleştirebilirsin."
  - q: "Açınca ya da yazdırınca sayfa neden bu kadar büyük?"
    a: "Sayfa boyu bir kâğıt ölçüsüne göre değil, piksellerden 150 dpi ile hesaplanır. 12 megapiksellik bir fotoğraf yaklaşık 69 × 52 cm'lik bir sayfa verir. Yazdırma penceresinde sayfaya sığdır seçeneğini işaretlersen A4 ya da Letter kâğıdı doldurur."
  - q: "GPS konumu siliniyor mu?"
    a: "Siliniyor. GPS konumunu içeren EXIF, XMP, IPTC ve yorumlar, görüntü verisine dokunulmadan gömülü JPEG'den kesilir; Chromium, Firefox ve WebKit'te çıkan PDF'lerde bunların hiçbiri yoktu. ICC renk profili, PDF'nin renk uzayı olarak korunur."
factRefs: [lossy, quality, metadata, path, download, limits.0, extra.0, extra.1]
---
PDF'nin içine giren şey JPG'nin kendisidir. Convy dosyayı yeniden sıkıştırmaz, JPEG verisini olduğu gibi kopyalar; PDF'deki görüntü baytlarını kaynakla karşılaştırdığımızda birebir aynıydı. Bu yüzden PDF aşağı yukarı JPG kadar tutar: 1 339 baytlık bir test görseli 1 651 baytlık bir PDF oldu, aradaki fark PDF'nin kendi yapısı.

Her JPG bir sayfa olur. Sayfa boyu piksellerden 150 dpi ile çıkar; 4080 × 3072 piksellik 12 megapiksellik bir fotoğraf A4 ya da Letter değil, kabaca 69 × 52 cm'lik bir sayfa verir. Hiçbir piksel atılmaz, yazdırırken sayfayı kâğıda sığdırmak yazdırma penceresinin işi. Bir kenar PDF'nin 14 400 punto sınırını aşarsa o sınıra küçültülür.

Kesilen tek şey metaveri: varsa GPS konumuyla EXIF, XMP, IPTC, yorumlar ve bazı kameraların ana görüntünün arkasına eklediği ek görseller. Bunları kesmek görüntü verisine dokunmaz. Renk profili PDF'nin renk uzayı olur. Yön etiketiyle yan kaydedilmiş bir fotoğrafı sayfanın kendisi çevirir; yeniden kodlama olmadan dik açılır. Chromium, Firefox ve WebKit aynı PDF'yi bayt bayt üretti.
