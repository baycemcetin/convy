---
draft: false
intro: "iPhone'da çekilmiş ya da Mac'te kaydedilmiş bir MOV, Windows'ta, bir web formunda ya da televizyonda çoğu zaman açılmaz. MOV dosyalarını seç, Convy onları bu cihazda H.264 görüntülü ve AAC sesli MP4'e çevirsin. Başlık ve sanatçı kalır, konum bilgisi silinir."
metaHook: "neredeyse her yerde oynayan H.264 görüntü ve AAC ses, konum bilgisi silinir"
steps:
  - "MOV kliplerini ya da ekran kayıtlarını seç, istersen sayfaya bırak."
  - "Hedefte MP4 zaten seçili gelir."
  - "Dönüştür'e bas, ardından her MP4'ü kaydet."
limits:
  - "Tarayıcı yolunda 50 MB'ı aşan çıktılar bellek yerine bu cihazın depolama alanına yazılır."
  - "FFmpeg yolunda tahmini çıktısı 1 GB'ı (iPhone ve iPad'de 500 MB'ı) geçen dosya başlamadan reddedilir; dönüşüm 120 saniye ve girdinin her MB'ı için 2 saniye dolunca durdurulur."
  - "FFmpeg yedeği bir kez iner (yaklaşık 10 MB) ve tarayıcıda saklanır; tarayıcı yolu hiçbir şey indirmez."
faq:
  - q: "iPhone videomdaki GPS konumu siliniyor mu?"
    a: "Denemelerimizde evet. QuickTime konumu ve kamera markası taşıyan bir MOV, Chromium, Firefox ve WebKit'te, iki dönüştürme yolunda da bunlar olmadan çıktı. Test dosyası gerçek bir iPhone kaydı değil, kısa bir sentetik klipti; bunu dönüştürücünün davranışı olarak oku, her telefon modelinin tek tek sınandığı olarak değil."
  - q: "MP4'te neden çekim günü değil bugünün tarihi görünüyor?"
    a: "Dönüşümü tarayıcının kendi kodlayıcısı yaptığında oluşturma tarihi olarak dönüştürme anı yazılır, kaynaktaki tarih kaybolur. Firefox'un her zaman kullandığı FFmpeg yolunda ise hiç tarih yazılmaz. Çekim tarihi senin için önemliyse özgün MOV'u sakla."
  - q: "HEVC (H.265) iPhone videom dönüşür mü?"
    a: "Dönüşür. 8 ve 10 bitlik HEVC çözülür ve 8 bitlik H.264 olarak çıkar. Denediğimiz Chromium ve Firefox sürümlerinde HEVC FFmpeg'den geçti, WebKit onu kendisi çözdü. Gerçek iPhone HDR görüntüsü (HLG, Dolby Vision) sınanmadı; bu kliplerin renklerinin nasıl çıkacağını söyleyemeyiz."
  - q: "Kalite özgün dosyadan düşük mü olur?"
    a: "Video her seferinde yeniden kodlanır ve bu kayıplıdır. FFmpeg yolu H.264'ü CRF 23 ile, AAC sesi 160 kbps ile yazar; tarayıcı yolu orta kalite ön ayarını kullanır. Arayüzde kalite ayarı yok. Düzenleme yapacaksan MOV'u sakla, paylaşırken MP4'ü kullan."
factRefs: [lossy, quality, metadata, path, download, limits.0, limits.1, limits.2, extra.0, extra.1, extra.2]
---
Convy, MOV'un içindeki akışları yeni bir kapsayıcıya (MP4) olduğu gibi aktarmaz; videoyu baştan kodlar. Çıkan dosyada her zaman H.264 görüntü ve AAC ses bulunur, oynatıcıların, düzenleme programlarının ve sitelerin en rahat kabul ettiği ikili bu. Yeniden kodlama kayıplıdır: MP4, özgün dosyanın bitleri değil, yeni bir kopyasıdır.

İşi hangi kodlayıcının yapacağına tarayıcı ve dosya birlikte karar verir. Convy önce tarayıcının klibi kendisinin çözüp o boyutta H.264 ve AAC kodlayıp kodlayamayacağına bakar. Kodlayabiliyorsa iş tarayıcının kendi video araçlarıyla (WebCodecs, Mediabunny üzerinden) yapılır ve fazladan bir şey indirilmez. Kodlayamıyorsa FFmpeg motoru devreye girer. Firefox her zaman FFmpeg yolunu kullanır, çünkü WebCodecs'inde AAC kodlayıcı yok. yüksekliği 720 pikselin altında kalan ve renk etiketi taşımayan klipler de her tarayıcıda FFmpeg'e gider; renkler kaynaktaki gibi çıksın diye.

Yeni iPhone'ların kaydettiği HEVC (H.265) de çözülür, 8 ve 10 bit; 10 bitlik görüntü 8 bitlik H.264 olarak çıkar. Denediğimiz Chromium ve Firefox sürümleri HEVC'yi FFmpeg ile işledi, WebKit ise kendi çözücüsünü kullandı.

Metaveride başlık ve sanatçı korunur. Konum ve kamera markası iki yolda da düşer. Çekim tarihi de kalmaz: tarayıcı yolu dönüştürme anını yazar, FFmpeg yolu hiç tarih yazmaz. Bunların hepsini bir iki saniyelik sentetik kliplerle ölçtük, gerçek bir iPhone videosuyla değil. HDR görüntü (HLG, Dolby Vision) ve donanımsal HEVC çözücüsü olan Google Chrome sınanmadı.
