---
draft: false
intro: "Bitmiş bir kayıt, ses arayüzüyle kaydedilmiş bir vokal ya da dışa aktarılmış bir miks çoğunlukla WAV'dır: eksiksizdir ama göndermek zahmetlidir. WAV dosyalarını seç, Convy her birini bilgisayarında, ortalaması 190 kbps civarında olan değişken bit hızlı bir MP3'e çevirsin."
metaHook: "ortalama 190 kbps'lik bir MP3, başlık ve sanatçı ID3 etiketine geçer"
steps:
  - "WAV kayıtlarını seç ya da sayfaya bırak."
  - "Hedefte MP3 zaten seçili gelir."
  - "Dönüştür'e bas, ardından MP3 dosyalarını kaydet."
limits:
  - "Çıktının boyutu başlamadan önce tahmin edilir; 1 GB'ı (iPhone ve iPad'de 500 MB'ı) geçerse dosya reddedilir. 190 kbps'de bu, yaklaşık 11,7 saatlik sese karşılık gelir."
  - "Her dönüşüm 120 saniye ve WAV'ın her MB'ı için 2 saniye dolunca durdurulur."
  - "İlk dönüşümde ses ve video motoru bir kez iner (yaklaşık 10 MB) ve tarayıcıda saklanır."
faq:
  - q: "320 kbps seçebilir miyim?"
    a: "Hayır. Bit hızı bir ayar değil: LAME'in değişken modu 2 kalitesinde hızı an an kendisi belirler, ortalaması 190 kbps civarındadır. Arayüzde bunun için bir düğme yok, sabit bit hızı seçeneği de sunulmuyor."
  - q: "Başlık ve sanatçı korunuyor mu?"
    a: "WAV'da varsa korunuyor. Denememizde başlık ve sanatçı etiketli bir WAV, Chromium, Firefox ve WebKit'te ikisini de ID3 etiketi olarak taşıyan bir MP3 verdi. Birçok WAV dosyasında hiç etiket olmaz; o zaman kopyalanacak bir şey yoktur, etiketleri sonradan bir müzik uygulamasında ekleyebilirsin."
  - q: "Süre değişiyor mu?"
    a: "Denememizde değişmedi: örnek WAV ile MP3'ünün süresi üç tarayıcıda da aynıydı. Test dosyalarımız kısaydı; uzun kayıtlarda MP3 kodlayıcısının eklediği dolgu süreyi saniyenin küçük bir kesri kadar uzatabilir, bunu ölçmedik."
  - q: "İnternet olmadan çevirebilir miyim?"
    a: "Ses ve video motoru bu cihazda saklıysa evet. Bu sayfa açık kaldığı sürece dönüşümler bağlantı olmadan da çalışır. Sayfayı kapatırsan Convy ana sayfasını aç: bu sayfanın aksine, ilk ziyaretten sonra tarayıcında saklanır ve bağlantı olmadan açılır."
factRefs: [lossy, quality, metadata, path, download, offline, limits.0, limits.1, limits.2, extra.0]
---
WAV her örneği saklar; MP3 ise kulağın en az fark edeceği kısmı atar. Kayıp tam bu adımda ve yalnızca bir kez yaşanır. Convy LAME ile değişken bit hızında, 2 kalite ayarında kodlar; ortalama 190 kbps civarına düşer. Sakin bölümler daha az, kalabalık bölümler daha çok bit alır. Ayar sabittir, arayüzden değiştirilemez.

WAV genellikle sıkıştırılmamış olduğu için bu, kopyanın kopyası değil, tek bir kayıplı adımdır. Sesi yeniden düzenleyecek, miksleyecek ya da dışa aktaracaksan ana kopya olarak WAV'ı sakla.

Etiketler de gelir. Başlık ve sanatçı taşıyan bir WAV'da ikisi de MP3'e ID3 etiketi olarak geçti; Chromium, Firefox ve WebKit'te sonuç aynıydı. MP3'e ayrıca bir kodlayıcı etiketi eklenir. Dosyada kapak resmi varsa o aktarılmaz.

Bu iş için her tarayıcı aynı motoru kullanır: WebAssembly'deki FFmpeg. Tarayıcının yerleşik ses araçları devreye girmez. Örnek WAV'ımız üç tarayıcıda da süresi değişmeden 6 755 baytlık bir MP3 oldu.
