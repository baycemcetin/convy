---
draft: false
intro: "Webden kaydedilen görselleri işe yarar kılan iki şeyi PNG korur: saydam zemini ve pikselleri. WebP dosyalarını seç, Convy bu cihazda PNG'ye çevirsin; WebP açmayan düzenleyiciler ve sunum araçları için hazır olur. Hareketli bir WebP'nin ilk karesi durağan PNG olarak çıkar."
metaHook: "şeffaflık korunur, ek kayıp olmaz; WebP açmayan araçlar için hazır"
steps:
  - "WebP görsellerini seç ya da sayfaya bırak."
  - "Hedefte PNG zaten seçili gelir."
  - "Dönüştür'e bas, ardından PNG dosyalarını kaydet."
limits:
  - "250 megapikselin üstündeki görseller, iPhone ve iPad'de 100 megapikselin üstündekiler reddedilir."
  - "İlk dönüşümde görsel motoru bir kez iner, yaklaşık 5 MB; sonraki seferler için bu cihazda saklanır."
faq:
  - q: "Saydam zemin korunur mu?"
    a: "Korunur. PNG şeffaflığı saklayabilir ve Convy onu olduğu gibi aktarır; tamamen ya da kısmen saydam pikseller aynı kalır. Webden alınan logo, ikon ve dekupe görsellerde PNG'yi JPG'ye tercih etmenin asıl nedeni de bu."
  - q: "PNG neden WebP'den büyük?"
    a: "WebP bir görseli çoğu zaman daha az bayta sığdırır, bazen ayrıntıdan vazgeçerek. PNG her pikseli birebir tuttuğu için aynı resim daha çok yer kaplar ve küçültmek için bir ayar yok. Boyut, piksellerden önemliyse ve şeffaflığa ihtiyacın yoksa JPG'ye çevir."
  - q: "Hareketli bir WebP'ye ne olur?"
    a: "İlk karesinden tek bir durağan PNG yapılır. Diğer kareler hiç okunmaz, çünkü buradaki çıktı tek bir görseldir. Animasyon hâlâ lazımsa, örneğin bir sohbet ya da web sayfası için, özgün WebP'yi sakla."
factRefs: [lossy, quality, transparency, animation, metadata, path, extra.0, extra.1, download]
---
WebP'nin saydam bir zemini varsa doğru hedef PNG'dir. Şeffaflık korunur: bir siteden kaydedilmiş logo, ikon ya da dekupe ürün görseli saydam kalır ve sunumda, belgede ya da tasarım dosyasında istediğin rengin üstüne konabilir. Bunu saydam bir test görseliyle sınadık.

PNG kayıpsızdır; dönüşümün kendisi kaliteden bir şey götürmez, seçilecek bir ayar da yok. Ama kayıplı bir WebP'nin sıkıştırmasını geri almaz: o pikseller olduğu gibi kopyalanır, özgündeki yumuşaklık da kalır. Dosya genellikle büyür, bazen epey; PNG yer kazanmak için ayrıntı atmaz.

Hareketli bir WebP tek bir durağan görsele dönüşür. Yalnız ilk kare okunup yazılır, hareketin PNG'de gideceği bir yer yok.

WebP'nin içindeki EXIF verisi konumla birlikte silinir. ICC renk profili kalır; görselde yön etiketi varsa pikseller etiket gitmeden önce döndürülür. Her tarayıcıda aynı motor çalışır, Safari ya da Firefox için ayrı bir yol yok.
