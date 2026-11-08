---
draft: false
intro: "Bazı düzenleyiciler, formlar ve tasarım araçları PNG ister; düzenleyeceğin bir fotoğrafı da daha fazla kayıp olmadan saklamak iyidir. JPG dosyalarını seç, Convy PNG kopyalarını telefonunda ya da bilgisayarında yazsın. Dosyalar çok büyür; kamera bilgileri ve GPS konumu silinir."
metaHook: "düzenlerken ek kayıp yok, karşılığında dosya epey büyür"
steps:
  - "JPG dosyalarını seç ya da sayfaya bırak."
  - "Hedefte PNG zaten seçili gelir."
  - "Dönüştür'e bas, ardından PNG dosyalarını kaydet."
limits:
  - "250 megapikselin üstündeki görseller reddedilir; iPhone ve iPad'de sınır 100 megapiksel."
  - "Denememizde 15 megapiksellik bir JPG 37,6 MB'lık bir PNG oldu; bir klasör dolusu fotoğraf diski çabuk doldurabilir."
faq:
  - q: "PNG'ye çevirmek JPG'yi güzelleştirir mi?"
    a: "Hayır. PNG, JPG'nin piksellerini sıkıştırma izleriyle birlikte birebir kopyalar; görüntü aynı kalır. Kazanç sonra gelir: PNG'yi her düzenleyip kaydettiğinde yeni bir kayıp eklenmez, defalarca kaydedilen bir JPG'de ise eklenir."
  - q: "PNG neden bu kadar büyük?"
    a: "PNG her pikseli kayıplı sıkıştırma olmadan saklar, fotoğraflar da bu yolla pek küçülmez. Denememizde 12 megapiksellik, 1,2 MB'lık bir JPG, PNG olarak 11,8 MB tuttu. Oran fotoğrafa göre değişir; önce tek bir dosyayla dene."
  - q: "GPS konumu ve kamera bilgileri kalıyor mu?"
    a: "Hayır. GPS konumuyla birlikte EXIF silinir; XMP, IPTC ve yorumlar da gider. Bir test JPG'sinde her biri tek tek kontrol edildi. İstisna renk profili: PNG'de kalır, böylece renkler kaymaz."
  - q: "Büyük bir fotoğraf ne kadar sürer?"
    a: "Tarayıcı testlerimizde 15 megapiksellik bir JPG, tarayıcıya göre 4,6 ile 5,6 saniye arasında PNG'ye dönüştü. Senin cihazın daha hızlı ya da yavaş olabilir. İlk dönüşüm ayrıca görsel motorunun, yaklaşık 5 MB, bir kez inmesini bekler."
factRefs: [lossy, quality, metadata, extra.0, extra.1, extra.2, limits.0, download]
---
Önce beklentiyi doğru kuralım: PNG'ye çevirmek, JPG sıkıştırmasının attığı ayrıntıyı geri getirmez. PNG, JPG'nin piksellerini bulanıklığı ve bloklu kenarlarıyla birlikte olduğu gibi tutar. Yaptığı şey kaybı orada durdurmaktır. PNG'yi istediğin kadar açıp düzenleyip kaydedebilirsin, aynı kalır; tekrar tekrar kaydedilen bir JPG ise her seferinde biraz daha bozulur.

Asıl bedel boyut. Denememizde 1,2 MB'lık 12 megapiksellik bir JPG, 11,8 MB'lık bir PNG oldu; neredeyse on katı. Tarayıcıda 15 megapiksellik bir JPG 4,6 ile 5,6 saniye arasında işlendi ve 37,6 MB'lık bir PNG çıktı. Bütün bir klasöre geçmeden önce tek bir dosyayla dene.

JPG'deki metaveri PNG'ye geçmez. Kamera markası, GPS konumu, XMP, IPTC ve yorum taşıyan bir JPG ile denedik; çıktıda hiçbiri yoktu. JPG yön etiketiyle yan kaydedilmişse pikseller önce döndürülür, PNG etikete gerek kalmadan dik durur. ICC renk profili korunur.
