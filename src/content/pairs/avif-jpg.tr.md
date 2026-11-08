---
draft: false
intro: "AVIF küçük dosya demek, ama birçok fotoğraf uygulaması, düzenleyici ve site onu hâlâ açmıyor. AVIF görsellerini seç, Convy onları bu cihazda JPG'ye çevirsin; JPG'yi neredeyse her uygulama ve form kabul eder. Saydam alanlar beyaz olur, GPS konumu dahil EXIF silinir."
metaHook: "AVIF açmayan uygulama ve siteler için; saydam alanlar beyaza döner"
steps:
  - "AVIF görsellerini seç ya da sayfaya bırak."
  - "Hedefte JPG zaten seçili gelir."
  - "Dönüştür'e bas, ardından JPG dosyalarını kaydet."
limits:
  - "250 megapikselin üstündeki görseller reddedilir; iPhone ve iPad'de sınır 100 megapiksel."
  - "Görsel motoru ilk dönüşümde bir kez iner, yaklaşık 5 MB; sonra tarayıcıda saklanır."
faq:
  - q: "Saydam bir AVIF neden beyaz zeminle çıkıyor?"
    a: "JPG'de şeffaflığı tutacak bir kanal yok. Bu yüzden Convy tam ya da yarı saydam pikselleri, dosyayı yazmadan önce beyaz bir zemine oturtur; saydam bir test görselinde sonuç beyaz zemin oldu. Zeminin şeffaf kalması gerekiyorsa hedef olarak PNG'yi seç."
  - q: "JPG, AVIF'ten daha kötü mü görünür?"
    a: "Biraz ayrıntı gidebilir. JPG kayıplıdır; Convy onu sabit 85 kalitede yazar, değiştirecek bir ayar yok. AVIF de kayıplı kaydedildiyse görüntü ikinci kez sıkıştırılır ve ince ayrıntılar yumuşayabilir. Özgün dosya olarak AVIF'i elinde tut."
  - q: "Görseldeki konum bilgisi silinir mi?"
    a: "Silinir. GPS konumu taşıyan bir test görselini önce AVIF'e, ardından JPG'ye çevirdik; sonuçta GPS dahil EXIF bloğu yoktu. ICC renk profili ise yerinde kalır. Kontrol bir test dosyasıyla yapıldı, gerçek bir kameradan çıkmış AVIF ile değil."
  - q: "Yan duran bir AVIF dik çıkar mı?"
    a: "Dosya dönüşünü EXIF yön etiketiyle belirtiyorsa evet. Convy önce pikselleri döndürür, etiketi ancak ondan sonra siler; böylece JPG, bu etiketi okumayan programlarda da doğru durur. Bunu döndürülmüş bir test görseliyle doğruladık."
factRefs: [lossy, quality, transparency, metadata, path, extra.0, extra.1, limits.0, download]
---
AVIF'ten JPG'ye geçerken kazandığın şey uyumluluk. Karşılığında üç şey değişir; hiçbiri için seçenek yok, kural sabit.

İlki şeffaflık. JPG saydamlığı saklayamadığı için saydam zeminli bir AVIF logo ya da dekupe, beyaz bir dikdörtgenin içinde kalır. Görsel beyaz bir sayfaya konacaksa bu fark edilmez; renkli bir zeminde kutu hemen seçilir.

İkincisi sıkıştırma. Convy JPG'yi 85 kalitede yazar. AVIF de kayıplı kaydedildiyse onun izleri yerinde kalır, JPG kendi kaybını bunun üstüne ekler. AVIF'in kendisini sakla; sonradan düzenlemen gerekirse ondan başlarsın.

Üçüncüsü metaveri. GPS konumu taşıyan bir test görselini AVIF'e, oradan da JPG'ye çevirdik; EXIF bloğu konumla birlikte silinmişti. Yön etiketi silinmeden önce piksellere uygulanır, ICC renk profili ise korunur. Tarayıcı fark etmez: bu çift için her yerde aynı ImageMagick motoru çalışır, tarayıcıya özel bir kod yolu yok.
