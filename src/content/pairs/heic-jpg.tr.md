---
draft: false
intro: "iPhone, fotoğrafları varsayılan ayarda HEIC olarak kaydeder; birçok program ve web formu bu dosyayı hâlâ tanımaz. HEIC dosyalarını seç, Convy onları bu cihazda JPG'ye çevirsin. Kopyada kamera bilgileri ve GPS konumu yer almaz, renk profili korunur."
metaHook: "konum ve kamera bilgisi silinir, renk profili kalır, fotoğraf dik açılır"
steps:
  - "HEIC fotoğraflarını seç ya da sayfaya bırak."
  - "Hedefte JPG zaten seçili gelir."
  - "Dönüştür'e bas, ardından JPG dosyalarını kaydet."
limits:
  - "250 megapikselin üstündeki görseller reddedilir, iPhone ve iPad'de sınır 100 megapiksel; böylece cihazın belleği tükenmez."
  - "İlk dönüşümde görsel motoru bir kez iner (yaklaşık 5 MB) ve sonraki seferler için bu cihazda saklanır."
faq:
  - q: "Konum bilgisi JPG'de kalıyor mu?"
    a: "Hayır. GPS konumu dahil EXIF bloğunun tamamı JPG'nin dışında kalır. Bunu konum taşıyan bir HEIC ile Chromium, Firefox ve WebKit'te ayrı ayrı denedik. İçeride kalan tek veri renk profilidir, çünkü renklerin nasıl görüneceğini o belirler."
  - q: "JPG neden HEIC'ten büyük çıkıyor?"
    a: "HEIC aynı görüntüyü daha az bayta sığdırır. Denememizde 1280 × 720 piksellik, 39 KB'lık bir HEIC, 85 kalitede 51 KB'lık bir JPG'ye dönüştü. Oran fotoğraftan fotoğrafa değişir; bunu bir örnek olarak oku, kural olarak değil."
  - q: "JPG kalitesini yükseltebilir miyim?"
    a: "Hayır, kalite 85'te sabit ve arayüzde bunun için bir ayar yok. Her pikselin çözüldüğü gibi kalmasını istiyorsan HEIC'i PNG'ye çevir: PNG kayıpsızdır, karşılığında dosya çok daha büyük olur."
  - q: "Safari'de çevirirsem farklı bir dosya mı çıkar?"
    a: "Örnek dosyamızda hayır: Chromium, Firefox ve WebKit aynı JPG'yi bayt bayt üretti, çünkü üçünde de aynı görsel motoru çalışıyor. Bu tek bir dosyada ölçüldü; motorun nasıl davrandığını anlatır, her fotoğrafın tek tek sınandığını değil."
factRefs: [lossy, quality, metadata, path, extra.0, extra.1, extra.2, limits.0, download]
---
Fotoğrafın içindeki EXIF bloğu JPG'ye geçmez. Bunu Mac'te hazırlanmış, kamera markası, tarih ve GPS konumu taşıyan bir HEIC ile denedik: Chromium, Firefox ve WebKit'te çıkan JPG'de bunların hiçbiri yoktu. Korunan tek parça ICC renk profili. Display P3 ile çekilmiş bir fotoğrafın geniş renkleri bu sayede donuklaşmaz.

Silmeden önce yön düzeltilir. Telefonlar pikselleri bazen yan kaydeder, nasıl çevrileceğini de ayrı bir etikette tutar. Convy pikselleri o etikete göre döndürür; etiket gittikten sonra da fotoğraf, etiketi okumayan görüntüleyicilerde bile dik açılır.

JPG kayıplı bir formattır ve Convy kaliteyi 85'te sabit tutar; arayüzde bunun için bir ayar yok. HEIC zaten sıkıştırılmış bir dosya, JPG bunun üstüne bir sıkıştırma turu daha ekler ve bu geri alınmaz. Özgün piksellere ileride ihtiyacın olabilirse HEIC'i de sakla.

Denememizde 1280 × 720 piksellik, 39 KB'lık bir HEIC 51 KB'lık bir JPG oldu ve üç tarayıcıda da bayt bayt aynı dosya çıktı. Kendi fotoğrafların bu örnekten çok daha büyük olacak; telefon kamerası bunun birkaç katı piksel kaydeder.
