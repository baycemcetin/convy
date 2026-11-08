---
draft: false
intro: "Ekran kaydediciler ve tarayıcı tabanlı araçlar videoyu çoğu zaman WebM olarak kaydeder; iPhone uygulamaları, video düzenleyiciler ve mesajlaşma uygulamaları ise bu dosyayı sıklıkla geri çevirir. WebM dosyalarını seç, Convy bu cihazda her birini H.264 görüntülü ve AAC sesli bir MP4'e çevirsin."
metaHook: "VP9 ya da VP8 görüntü H.264'e, ses AAC'ye döner; MP4 isteyen her yer için"
steps:
  - "WebM kayıtlarını seç ya da sayfaya bırak."
  - "Hedefte MP4 zaten seçili gelir."
  - "Dönüştür'e bas, sonra MP4 dosyalarını kaydet."
limits:
  - "Tarayıcı yolunda 50 MB'tan büyük çıktılar bellekte değil, bu cihazın depolama alanında oluşturulur."
  - "FFmpeg yolunda tahmini çıktısı 1 GB'ı (iPhone ve iPad'de 500 MB'ı) aşan kayıt hiç başlatılmaz; süren bir dönüşüm 120 saniye artı WebM'in MB'ı başına 2 saniyede kesilir."
  - "FFmpeg yolu motorunu ilk seferde bir kez indirir (yaklaşık 10 MB) ve saklar; tarayıcı yolu indirme istemez."
faq:
  - q: "Firefox neden önce bir motor indiriyor?"
    a: "Firefox'un yerleşik video araçları, MP4'ün ihtiyaç duyduğu AAC sesi kodlayamıyor; bu yüzden Convy orada her WebM için FFmpeg motorunu kullanır. Motor bir kez iner, yaklaşık 10 MB tutar ve bu cihazda kalır. Chromium ve WebKit, etiketli ya da 720p ve üstü videoda kendi araçlarını kullanır, hiçbir şey indirmez."
  - q: "Renkler değişir mi?"
    a: "720 satırın altında kalan, renk etiketi taşımayan küçük WebM kayıtları her tarayıcıda FFmpeg'e gönderilir. Tarayıcı yolunda bu tür dosyalar gözle görülür biçimde kaymış renklerle çıkıyordu, kırmızı turuncuya çalıyordu; FFmpeg'den geçince kaynakla örtüşüyor. Etiketli video ile 720p ve üstü, tarayıcı destekliyorsa tarayıcı yolunda kalır."
  - q: "Ekran kaydının kalitesi korunur mu?"
    a: "Görüntü yeniden kodlandığı için bir miktar ayrıntı kaybolur. FFmpeg H.264'ü CRF 23 ile, sesi 160 kbps AAC olarak yazar; tarayıcı yolu orta düzey bir bit hızı ön ayarı kullanır. Arayüzde kalite ayarı bulunmuyor. Özgün kayda yeniden ihtiyaç duyabileceksen WebM'i sakla."
  - q: "Başlık ve diğer bilgiler MP4'e geçer mi?"
    a: "Başlık ve sanatçı korunur, konum ve kamera markası düşer; tarayıcı yolu oluşturma tarihinin yerine dönüştürme anını yazar, FFmpeg yolu hiç tarih yazmaz. Bunu MOV dosyalarıyla ölçtük. WebM örneklerimizde etiket yoktu; WebM için bu sonuç doğrudan bir testten değil, iki formatın aynı dönüştürme adımından geçmesinden çıkıyor."
factRefs: [lossy, quality, metadata, path, download, limits.0, limits.1, limits.2, extra.0, extra.1]
---
WebM ile MP4 farklı kodekler taşır, bu yüzden hiçbir şey olduğu gibi aktarılamaz. VP9 ya da VP8 görüntü çözülüp H.264 olarak yeniden kodlanır, Opus ya da Vorbis ses AAC'ye döner. Ortaya çıkan MP4, WebM'in açılmadığı yerlerde oynar; ama özgün bitler değil, kayıplı yeni bir kopyadır.

Dosyanın izleyeceği yol tarayıcına bağlı. Firefox her WebM'de FFmpeg motorunu kullanır, çünkü yerleşik video araçları (WebCodecs) AAC kodlayamıyor. Chromium ve WebKit, video bir renk etiketi taşıyorsa ya da 720p ve üstündeyse kendi WebCodecs'lerini Mediabunny üzerinden kullanır; bu yol hiçbir şey indirmez. Web kamerasıyla ya da eski bir araçla alınmış küçük, etiketsiz bir kayıt ise her tarayıcıda FFmpeg'e gider, renkleri kaynaktan sapmasın diye.

Bir VP9 ve bir VP8 test klibini Chromium, Firefox ve WebKit'te dönüştürdük. Üçü de H.264 ve AAC verdi, süre kaynaktan en fazla saniyenin yüzde ikisi kadar saptı. Klipler kısa ve sentetikti; içinde AV1 görüntü bulunan bir WebM denemeye girmedi.
