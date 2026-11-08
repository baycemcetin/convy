---
draft: false
intro: "PNG grafikleri bir siteye koymadan önce WebP'ye çevirmek yaygın bir adım. PNG dosyalarını seç, Convy WebP kopyalarını şeffaflığıyla birlikte, sunucuya göndermeden yazsın. Bilmen gereken şu: WebP her zaman 85 kalitede kayıplı çıkar, kayıpsız seçenek yok."
metaHook: "şeffaflık korunur, ama çıktı her zaman 85 kalitede kayıplı"
steps:
  - "PNG dosyalarını seç ya da sayfaya bırak."
  - "Hedefte WebP zaten seçili gelir."
  - "Dönüştür'e bas, ardından WebP dosyalarını kaydet."
limits:
  - "250 megapikselin üstündeki görseller reddedilir; iPhone ve iPad'de sınır 100 megapiksel."
  - "WebP çıktısı her zaman kayıplıdır (85 kalite); piksel piksel aynı kopya gerekiyorsa PNG'yi tut."
faq:
  - q: "Saydam arka plan WebP'de kalır mı?"
    a: "Kalır. WebP şeffaflık taşıyabilir ve Convy alfa kanalını yazar; kendi test dosyamızın çıktısında da alfa kanalı yerindeydi. Saydam zeminli bir logo ya da simge, sayfanda hangi renge konursa konsun saydam kalır."
  - q: "Kayıpsız WebP alabilir miyim?"
    a: "Convy ile alamazsın. Yazdığı her WebP, kaynak PNG olsa bile, 85 kalitede kayıplı VP8 yöntemini kullanır; kayıpsıza geçiren bir düğme yok. Her kenarın keskin kalması gereken ekran görüntüleri ve piksel sanatı için PNG'yi tut."
  - q: "WebP, PNG'den küçük olur mu?"
    a: "PNG'den WebP'ye boyutları ölçmedik, o yüzden burada bir rakam vermiyoruz. Sonuç görsele bağlı; fotoğraflar ve düz renkli grafikler farklı sıkışır. Bütün klasörü çevirmeden önce tek bir dosyayı dönüştürüp iki boyutu karşılaştır."
  - q: "PNG'deki metaveri silinir mi?"
    a: "Evet. eXIf, XMP ve metin yorumları silinir, yön etiketi önce uygulanır. Bunu, GPS konumu da dahil üçünü birden taşıyan bir PNG ile sınadık. ICC renk profili WebP'de korunur."
factRefs: [lossy, quality, transparency, metadata, path, extra.1, limits.0]
---
Bir PNG'nin WebP'de nasıl duracağını iki soru belirler: şeffaflığa ne olur, ayrıntıya ne olur.

Şeffaflık kalır. WebP'nin alfa kanalı var ve Convy onu yazar; simgeler, logolar ve dekupeler saydam zeminleriyle çıkar. Aynı PNG'yi JPG'ye çevirmekten temel farkı bu, çünkü orada saydam alanlar beyazla dolar.

Ayrıntı sıkıştırılır. Convy WebP'yi yalnız kayıplı biçimde, 85 kalitede VP8 olarak yazar; kaynak kayıpsız bir PNG olsa bile. Keskin yazılar, ince çizgiler ve piksel sanatı kenarlarda yumuşayabilir. Kayıpsız WebP seçeneği yok, tam piksel gerekiyorsa PNG'yi sakla.

Bu çift için boyut ölçülmedi. Dosyanın küçülüp küçülmeyeceği ve ne kadar küçüleceği görsele bağlı; toplu işe geçmeden önce tek bir dosyayı çevirip karşılaştır.

PNG metaverisi, yani eXIf ve XMP parçaları, diğer görsellerde olduğu gibi silinir; bu parçaları taşıyan bir PNG'de de sonuç aynıydı. ICC renk profili korunur. Her tarayıcıda aynı motor çalışır.
