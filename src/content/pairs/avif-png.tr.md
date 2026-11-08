---
draft: false
intro: "AVIF'i açmayan bir tasarım aracında, düzenleyicide ya da sunumda kullanman mı gerekiyor? AVIF görsellerini seç, Convy bu cihazda PNG kopyalarını yazsın. Şeffaflık korunur, ek kayıp olmaz, GPS konumu dahil EXIF silinir. Dosyaların büyümesini bekle."
metaHook: "şeffaflık korunur, ek kayıp yok; AVIF açmayan araçlar için"
steps:
  - "AVIF görsellerini seç ya da sayfaya bırak."
  - "Hedefte PNG zaten seçili gelir."
  - "Dönüştür'e bas, ardından PNG dosyalarını kaydet."
limits:
  - "250 megapikselin üstündeki görseller reddedilir; iPhone ve iPad'de sınır 100 megapiksel."
  - "Fotoğraflarda PNG çoğu zaman kaynaktan çok daha büyük olur; JPG ile yaptığımız denemede 1,2 MB, 11,8 MB'a çıktı."
faq:
  - q: "Saydam arka plan saydam kalır mı?"
    a: "Kalır. PNG'nin alfa kanalı var; tam ya da yarı saydam pikseller şeffaflıklarını korur, bunu öz denetim testimizin PNG çıktısında kontrol ettik. Dekupe bir AVIF, PNG'de de dekupe kalır ve istediğin renkte bir zemine konabilir."
  - q: "Kalite düşer mi?"
    a: "Bu adımda düşmez. PNG kayıpsızdır ve kalite ayarı yoktur; Convy AVIF'ten çözdüğü pikselleri olduğu gibi yazar. AVIF ilk kaydedildiğinde ne kaybettiyse o kayıp kalır, PNG üstüne yenisini eklemez."
  - q: "PNG ne kadar büyük olur?"
    a: "Genellikle kaynaktan çok daha büyük, çünkü PNG her pikseli kayıplı sıkıştırma olmadan saklar. AVIF için henüz ölçümümüz yok; JPG denemesinde 12 megapiksellik bir fotoğraf 1,2 MB'tan 11,8 MB'a çıktı. Önce tek bir dosyayla kendi oranını gör."
  - q: "Kamera bilgileri ve konum silinir mi?"
    a: "Silinir. GPS konumu dahil EXIF bloğu çıktıya geçmez; bunu GPS verisi taşıyan bir test görselini önce AVIF'e, sonra PNG'ye çevirerek doğruladık. ICC renk profili PNG'de kalır, yön etiketi de silinmeden önce piksellere uygulanır."
factRefs: [lossy, quality, transparency, metadata, path, extra.0, extra.1, limits.0]
---
Bir JPG'nin atacağı iki şeyi PNG tutar: şeffaflığı ve piksellerin kendisini. Üzerinde çalışmaya devam edeceğin bir AVIF grafik için bu yüzden daha güvenli hedef.

Saydam zemin saydam kalır. Tam ya da yarı saydam her piksel, alfa değerini PNG'ye taşır. Renkli bir sayfaya konacak logolar, çıkartmalar ve dekupe ürün fotoğrafları etraflarında beyaz bir kutu olmadan durur.

PNG'nin kalite ayarı yok, Convy da bir ayar eklemiyor. AVIF'ten çözülen pikseller olduğu gibi yazılır; bu adımda yeni bir kayıp oluşmaz. Bedeli boyut: PNG fotoğrafları iyi sıkıştıramaz, çevrilen bir fotoğraf genellikle kaynağından çok daha büyük olur. Bütün bir klasöre geçmeden önce tek dosyayla dene.

Metaveri öteki görsel hedeflerindeki gibi ele alınır. GPS konumu dahil EXIF silinir, ICC renk profili kalır, yön etiketi de silinmeden önce gerçek bir döndürmeye çevrilir. Tüm tarayıcılarda aynı motor çalışır, tarayıcıya özel bir dal yok.
