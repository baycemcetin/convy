---
draft: false
intro: "Siteler ve sayfa hızı araçları görselleri çoğu zaman WebP olarak ister. JPG fotoğraflarını seç, Convy onları tarayıcında 85 kalitede WebP olarak yeniden kodlasın. Kamera bilgileri ve GPS konumu silinir, renk profili kalır."
metaHook: "web için 85 kalitede yeniden kodlanır; GPS ve kamera bilgisi silinir"
steps:
  - "JPG fotoğraflarını seç ya da sayfaya bırak."
  - "Hedefte WebP zaten seçili gelir."
  - "Dönüştür'e bas, ardından WebP dosyalarını kaydet."
limits:
  - "250 megapikselin üstündeki görseller reddedilir; iPhone ve iPad'de sınır 100 megapiksel."
  - "Her JPG ikinci kez kayıplı sıkıştırılır; sonradan düzenleyebileceğin fotoğrafların özgününü sakla."
faq:
  - q: "WebP, JPG'den küçük olur mu?"
    a: "Fotoğrafa bağlı. Bir JPG ile WebP'sini yan yana ölçmedik, bu yüzden burada bir oran yok. Elimizdeki tek veri: 15 megapiksellik bir JPG 6,6 MB'lık bir WebP oldu. Hepsine geçmeden önce tek bir fotoğrafı çevirip boyutları karşılaştır."
  - q: "Kalite kaybı olur mu?"
    a: "Biraz. JPG zaten kayıplı; Convy onu açıp 85 kalitede kayıplı WebP olarak yeniden sıkıştırır, değiştirecek bir ayar yok. Her kayıplı sıkıştırma biraz ayrıntı götürür. Özgün kopya olarak JPG'yi sakla."
  - q: "GPS konumu siliniyor mu?"
    a: "Siliniyor. Test için kamera markası, GPS konumu, XMP ve IPTC bilgileri ile bir yorum taşıyan bir JPG kullandık; çıktıda bunların hiçbiri kalmadı. Yan kaydedilmiş fotoğraf önce dikleştirilir. Korunan tek şey ICC renk profili."
  - q: "Ne kadar sürer?"
    a: "Büyük bir fotoğraf için birkaç saniye bekle: tarayıcı testlerimizde 15 megapiksellik bir JPG 7,0 ile 8,2 saniye sürdü. Hız cihaza göre değişir. İlk dosyadan önce görsel motoru, yaklaşık 5 MB, bir kez iner ve sonra saklanır."
factRefs: [lossy, quality, metadata, path, extra.0, extra.1, extra.2, limits.0, download]
---
Burada kayıplı bir formattan yine kayıplı bir formata geçiyorsun. Convy JPG'yi piksellere açar ve bunları sabit bir değerle, 85 kalitede WebP olarak yeniden sıkıştırır. Özgün sıkıştırmadan hiçbir şey yeniden kullanılmaz; WebP hem JPG'nin izlerini hem de kendi izlerini taşır. Arşivde tutacağın kopya JPG olsun.

Büyük bir fotoğrafta süre ve boyut öne çıkar. Tarayıcı testlerimizde 15 megapiksellik bir JPG 7,0 ile 8,2 saniye arasında işlendi ve 6,6 MB'lık bir WebP verdi. Bunun senin JPG'nden küçük olup olmayacağı, JPG'nin nasıl kaydedildiğine bağlı. Toplu dönüşümden önce tek bir dosyayla karşılaştır.

Yolda metaveri silinir: kamera modeli, tarih ve GPS konumuyla birlikte EXIF, ayrıca XMP, IPTC ve yorumlar. Yön etiketi önce piksellere uygulanır, böylece WebP hangi görüntüleyicide açılırsa açılsın dik durur. ICC renk profili korunur; her tarayıcıda aynı motor çalışır.
