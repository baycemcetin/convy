---
draft: false
intro: "Bazen videonun tek işi sesi taşımaktır: kaydedilmiş bir konuşma, bir ders, birinin klip olarak gönderdiği bir şarkı. MP4 dosyalarını seç, Convy bu cihazda sesini MP3 olarak ayırsın. Görüntü dışarıda kalır, yalnızca ses izi kodlanır."
metaHook: "yalnızca ses izi, ortalaması 190 kbps civarında olan standart bir MP3"
steps:
  - "MP4 videolarını seç ya da sayfaya bırak."
  - "Hedefte MP3 zaten seçili gelir."
  - "Dönüştür'e bas, ardından MP3 dosyalarını kaydet."
limits:
  - "Convy başlamadan önce çıktının boyutunu süreden ve bit hızından tahmin eder; tahmin 1 GB'ı (iPhone ve iPad'de 500 MB'ı) geçerse dosya reddedilir. 190 kbps hızda bu, yaklaşık 11,7 saatlik sese denk gelir."
  - "Bir dönüşüm 120 saniye ve girdinin her MB'ı için 2 saniye dolunca durdurulur."
  - "İlk dönüşümde ses ve video motoru bir kez iner (yaklaşık 10 MB) ve sonraki seferler için bu cihazda saklanır."
faq:
  - q: "Video MP3'ün içinde bir yerde kalıyor mu?"
    a: "Kalmıyor. Ses kodlanmadan önce video izi ayrılır, MP3'te yalnızca ses bulunur. MP4'e eklenmiş bir kapak resmi varsa o da gelmez. Görüntüye yeniden ihtiyacın olacaksa MP4'ü de sakla."
  - q: "Daha yüksek bir bit hızı seçebilir miyim?"
    a: "Hayır. Kodlayıcı tek ve sabit bir değişken bit hızı ayarıyla çalışır, ortalaması 190 kbps civarındadır; arayüzde bunun için bir düğme yok. Sessiz bölümler daha az, yoğun bölümler daha çok bit alır, bu yüzden gerçek hız dosyadan dosyaya değişir."
  - q: "Şarkı adı ve sanatçı müzik çalarımda görünür mü?"
    a: "Başlık, sanatçı ve albüm MP3'e ID3 etiketi olarak kopyalanır; müzik çalarlar bu etiketleri okur. Bunu etiketli WAV ve M4A dosyalarıyla Chromium, Firefox ve WebKit'te denedik. Albüm kapağı istisna: aktarılmaz, istersen çalarında yeniden ekleyebilirsin."
  - q: "Safari'de çalışıyor mu?"
    a: "Örnek dosyamız Safari'nin motoru WebKit'te de, Chromium ve Firefox'ta da dönüştü; üçü de aynı MP3'ü verdi. Ses çıktısı her tarayıcıda aynı FFmpeg motoruyla üretilir. Denemeleri Playwright'ın tarayıcı sürümlerinde yaptık; Google Chrome'da ve iPhone'da denemedik."
factRefs: [lossy, quality, metadata, path, download, limits.0, limits.1, limits.2, extra.0, extra.1]
---
MP3'e yalnızca ses girer. Convy kodlamaya başlamadan video izini ayırır; elinde klibin sesinden başka bir şey kalmaz. Ses, LAME ile değişken bit hızında ve 2 kalite ayarında kodlanır, ortalaması 190 kbps civarındadır. Arayüzde bunu değiştirecek bir ayar yok.

MP4'ün içindeki ses çoğu zaman zaten sıkıştırılmıştır, genellikle AAC olarak. MP3'e çevirmek ilk kaybın üstüne ikinci bir kayıplı adım ekler ve bu adım geri alınmaz. Özgün sese ileride dönmek isteyebileceksen MP4'ü silme.

Başlık, sanatçı ve albüm MP3'e ID3 etiketi olarak yazılır. Bunu bir MP4 ile değil, etiketli WAV ve M4A dosyalarıyla ölçtük; üçünü de aynı dönüştürme adımı işliyor. Kapak resmi gelmez. Dosyaya ayrıca bir kodlayıcı etiketi ve kaynağın kapsayıcı etiketleri eklenir.

Burada her tarayıcı aynı yoldan gider: WebAssembly'ye derlenmiş FFmpeg, yani ses ve video motoru. Örnek MP4'ümüz Chromium, Firefox ve WebKit'te 18 868 baytlık bir MP3 oldu; üç tarayıcıda da bayt bayt aynı dosya.
