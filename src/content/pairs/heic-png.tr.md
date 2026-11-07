---
draft: false
intro: "Fotoğrafı düzenleyecek, kırpacak ya da üstüne yazı ekleyeceksen PNG her pikseli olduğu gibi tutar. iPhone'dan gelen HEIC dosyalarını seç; Convy bu cihazda kayıpsız PNG kopyalar üretir. Konum ve kamera bilgileri kopyaya geçmez, renk profili kalır."
metaHook: "düzenlemeye hazır kayıpsız kopya, konum ve kamera bilgisi olmadan"
steps:
  - "HEIC dosyalarını seç ya da sayfaya bırak."
  - "Hedefte PNG zaten seçili gelir."
  - "Dönüştür'e bas, sonra PNG dosyalarını kaydet."
limits:
  - "250 megapikselin üstündeki görseller, iPhone ve iPad'de 100 megapikselin üstündekiler, cihazın belleği tükenmesin diye reddedilir."
  - "Tam boy fotoğrafların PNG kopyası HEIC'ten çok daha fazla yer kaplar; bütün bir albümden önce tek dosyayla dene."
faq:
  - q: "iPhone fotoğrafı için PNG mi, JPG mi?"
    a: "Fotoğrafı düzenlemeye devam edeceksen ya da hiç bozulmasın istiyorsan PNG, çünkü kayıpsızdır. Paylaşmak içinse JPG, dosya küçük kalır. Örneğimizde aynı 39 KB'lık HEIC'ten 51 KB'lık bir JPG ve 136 KB'lık bir PNG çıktı."
  - q: "Fotoğrafın çekildiği yer PNG'den anlaşılır mı?"
    a: "Anlaşılmaz. GPS konumu, EXIF bloğunun geri kalanıyla birlikte silinir; bunu konum etiketli bir HEIC ile üç tarayıcı motorunda da doğruladık. Yalnız ICC renk profili kalır, böylece renkler özgün fotoğraftaki gibi görünür."
  - q: "Sıkıştırma ya da kalite ayarı var mı?"
    a: "Yok. PNG kayıpsız olduğu için seçilecek bir kalite yoktur, her piksel olduğu gibi saklanır; arayüzde başka bir ayar da bulunmuyor. Dosya göndermek için fazla büyükse HEIC'i JPG'ye çevir, orada kalite 85'te sabit."
factRefs: [lossy, quality, metadata, path, extra.0, extra.1, extra.2, limits.0]
---
Ne zaman PNG? Fotoğraf son durak değil de bir başlangıçsa. Rötuştan, kırpmadan ya da üstüne yazı eklemeden önce PNG daha doğru seçimdir, çünkü JPG her yeniden kaydedişte biraz daha ayrıntı kaybeder. PNG kayıpsızdır; dönüşüm kendi payına hiçbir şey eksiltmez ve elindeki, HEIC'in çözüldüğü hâliyle piksel piksel aynı görüntüdür. Ayarlanacak bir kalite olmadığından arayüzde kalite ayarı da yok.

Bunun bedeli dosya boyutu. JPG'de 51 KB tutan 1280 × 720 piksellik örnek PNG'de 136 KB oldu, yani 39 KB'lık HEIC'in üç buçuk katı kadar. Fotoğraf büyüdükçe dosya da büyür; bütün bir albümü çevirmeden önce boş yerine bak.

Metaveride denediğimiz üç tarayıcı aynı davrandı: GPS konumu dahil EXIF silindi, ICC renk profili PNG'nin içinde kaldı. Chromium, Firefox ve WebKit bayt bayt aynı PNG'yi verdi. Yön de önce piksellere işlenir; dik çekilmiş bir fotoğraf dik açılır.
