---
draft: false
intro: "iPhone'da alınan ses kayıtları ve iTunes Store'dan gelen şarkılar M4A'dır; bazı araç teypleri, eski çalarlar ve web formları bu dosyayı hâlâ kabul etmez. M4A dosyalarını seç, Convy bu cihazda onları MP3'e çevirsin. Başlık, sanatçı ve albüm gelir; kapak resmi gelmez."
metaHook: "başlık, sanatçı ve albüm ID3 etiketine geçer, kapak resmi geçmez"
steps:
  - "M4A dosyalarını seç, istersen sayfaya bırak."
  - "Hedefte MP3 zaten seçili gelir."
  - "Dönüştür'e bas, sonra MP3'leri kaydet."
limits:
  - "Convy başlamadan önce MP3'ün boyutunu tahmin eder; 1 GB'ı (iPhone ve iPad'de 500 MB'ı) geçecekse dosyayı reddeder. Bu, 190 kbps hızda kabaca 11,7 saatlik ses demektir."
  - "120 saniye ve M4A'nın her MB'ı için 2 saniyeden uzun süren dönüşüm durdurulur."
  - "Ses ve video motoru ilk dönüşümde iner (yaklaşık 10 MB) ve bu cihazda saklanır."
faq:
  - q: "Albüm kapağı neden yok?"
    a: "Kapak resmi MP3'e aktarılmaz, yalnızca ses akışı dönüştürülür. Etiketli test dosyamızda başlık, sanatçı ve albüm geçti, resim geçmedi. Kapağı dönüştürdükten sonra bir müzik uygulamasında ya da etiket düzenleyicide yeniden ekleyebilirsin."
  - q: "MP3, M4A'dan kötü mü ses verir?"
    a: "M4A'dan daha iyi ses veremez; AAC çözülüp MP3 olarak yeniden kodlanır ve bu ikinci bir kayıplı turdur. Kodlayıcının ortalaması 190 kbps civarındadır, arayüzde kalite ayarı yok. M4A'yı özgün kopya olarak sakla, MP3'ü M4A'nın kabul edilmediği yerlerde kullan."
  - q: "iPhone'daki ses kayıtları dönüşür mü?"
    a: "iPhone ses kayıtlarını AAC sesli M4A olarak saklar; Chromium, Firefox ve WebKit'te denediğimiz dosya da bu türdendi. Test dosyamız bilgisayarda üretildi, iPhone'da kaydedilmedi; bunu kayıt uygulamasının doğrudan testi olarak değil, yakın bir eşleşme olarak oku."
  - q: "İlk seferde neden bir şey iniyor?"
    a: "MP3'ü her tarayıcıda FFmpeg motoru üretir; Convy MP3 için tarayıcının yerleşik ses araçlarını kullanmaz. Motor yaklaşık 10 MB tutar, bir kez iner ve bu cihazda kalır; sonraki dönüşümler onu yeniden indirmeden başlar."
factRefs: [lossy, quality, metadata, path, download, limits.0, limits.1, limits.2, extra.0]
---
M4A'nın içinde çoğunlukla AAC bulunur ve AAC zaten kayıplıdır. MP3'e çevirmek bu AAC'yi çözüp sesi ikinci kez sıkıştırır: LAME ile, değişken bit hızında, 2 kalite ayarında, ortalama 190 kbps civarında. İkinci kayıplı tur ilkinin attığını geri getiremez ve geri alınamaz; M4A elindeyse onu da sakla.

Etiketler yanında gelir. Başlık, sanatçı, albüm ve kapak resmi taşıyan bir M4A dönüştürdük. Chromium, Firefox ve WebKit'te MP3 başlığı, sanatçıyı ve albümü ID3 etiketi olarak korudu, kapağı korumadı. MP3'e ayrıca kaynağın kapsayıcı etiketleri ve bir kodlayıcı etiketi eklenir.

Üç tarayıcı da aynı boyutta, 10 845 baytlık MP3'ler üretti; süre kaynaktan saniyenin yüzde ikisi kadar uzundu. Hepsi aynı FFmpeg motorunu kullandı; motor her tarayıcıda ilk seferde iner.

Yalnızca AAC denedik. İçinde Apple Lossless (ALAC) bulunan M4A dosyaları teste girmedi.
