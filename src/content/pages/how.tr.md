---
draft: false
title: "Nasıl Çalışır: Motorlar, Sınırlar, Çevrimdışı | Convy"
h1: "Convy nasıl çalışır"
description: "Hangi motor hangi dosyayı dönüştürür, ilk seferde ne iner, sınırlar nerede ve ağ sekmesinden kendin nasıl bakarsın."
---
Convy dosyaları, tarayıcı sekmenin içinde çalışan açık kaynak motorlarla dönüştürür. Sayfayı açmak hiçbir motoru indirmez. Motor, ona ihtiyaç duyan bir dosyada Dönüştür'e bastığında iner ve tarayıcı onu sonraki sefer için saklar. Aşağıda hangi motorun ne yaptığını, türüne göre tüm formatları, sınırların nerede olduğunu ve bağlantı yokken neyin çalışmaya devam ettiğini bulursun.

<h2 id="engines">Motorlar</h2>

**Görsel: ImageMagick** (magick-wasm 0.0.46), indirmesi yaklaşık 5 MB. Gündelik formatları (JPG, PNG, WebP, AVIF, GIF, BMP, TIFF, ICO, JPEG XL) ve grafik, oyun ve görüntüleme işlerinde kullanılan JPEG 2000, TGA, DDS, EXR, HDR, QOI, PCX gibi formatları hem okur hem yazar. HEIC'i, düzleştirilmiş PSD'yi ve yazmadığı birkaç formatı (CUR, XBM gibi) yalnızca okur; hepsi [format tablosunda](#formats). Her tarayıcıda aynı motor çalışır, tarayıcıya özel bir yol yoktur.

**SVG: önce tarayıcı çizer.** SVG ya da SVGZ dosyasını tarayıcın, bir web sayfasında gösterir gibi çizer; Convy bunu PNG olarak alır. Başka bir hedef seçtiysen ImageMagick bu PNG'den devam eder. SVG'nin içindeki betikler çalışmaz, dosyanın dışından hiçbir şey istenmez. SVG'den PNG'ye dönüşüm motor indirmez.

**Görselden PDF'ye: Convy'nin kendi PDF yazıcısı**, sitenin kodunun bir parçası. JPG, PDF'nin içine yeniden sıkıştırılmadan olduğu gibi girer; diğer görseller kayıpsız girer. Bir görsel bir sayfa olur.

**Ses: ffmpeg** (ffmpeg.wasm 0.12.10, tek iş parçacıklı), yaklaşık 10 MB. Her ses sonucunu, her tarayıcıda ffmpeg üretir. Yaygın formatları (MP3, WAV, M4A, AAC, FLAC, OGG, Opus, AIFF, WMA) ve AC3, AMR, AU, VOC gibi eskileri okur; Apple Lossless (ALAC) M4A ve CAF dosyalarının içinden okunur. MP3, M4A, AAC, FLAC, WAV, OGG, Opus, AIFF, AC3, WMA ve sesli kitap formatı M4B yazar.

**Video: önce Mediabunny, gerekirse ffmpeg.** Convy her dosya için tarayıcının onu WebCodecs ile kendisinin çözüp H.264 video ve AAC ses olarak kodlayıp kodlayamayacağına bakar. Kodlayabiliyorsa işi Mediabunny yapar; sitenin kodunun parçası olduğu için ayrıca bir şey inmez. Kodlayamıyorsa iş ffmpeg'e geçer. Convy MP4, MOV, WebM, MKV ve AVI'yi; ayrıca MPG, MPEG-TS (MTS, M2TS), FLV, WMV, 3GP, OGV, VOB ve MXF gibi eski ya da yayıncılıkta kullanılan kapları açar. Sonuç MP4 ya da WebM, kısa bir animasyon (GIF, hareketli PNG ya da hareketli WebP) veya ses izi olarak MP3 ya da M4A olur. Animasyonlar her zaman ffmpeg'le, saniyede 12 kare ve 480 piksel genişlikte yapılır.

**Belge: Pandoc** (pandoc-wasm 1.1.0, Pandoc 3.10), yaklaşık 16 MB; en büyük motor bu. Word (DOCX), OpenDocument (ODT), EPUB, Markdown, HTML, RTF ve LaTeX'i; ayrıca teknik yazı ve yayıncılık formatlarını okur: reStructuredText (RST), AsciiDoc, Org, Typst, DocBook, JATS, FictionBook (FB2), Jupyter not defterleri (IPYNB), OPML, man sayfaları ve CSV ya da TSV tabloları. Bunların çoğunu ve düz metni yazabilir; RTF, LaTeX, CSV ve TSV yazmaz.

**PDF: pdf.js** (6.5.438), yaklaşık 0,5 MB; Firefox'un içinde de çalışan PDF görüntüleyicisi. Her sayfayı yaklaşık 144 dpi, uzun kenarı en fazla 4000 piksel bir görsele çevirir ya da seçilebilir metni çıkarır. Bir PDF'nin ihtiyaç duyduğu yazı tipleri yalnızca o PDF onları istediğinde iner.

<h2 id="formats">Formatlar</h2>

Convy'nin açtığı ve üretebildiği her format, türüne göre. Tablo site derlenirken dönüştürücünün kendi format listesinden üretilir; dönüştürücünün kabul ettiğinden geri kalamaz. Bazı formatların birden çok uzantısı var: JPG .jpeg, .jfif ya da .jpe olarak da açılır, TIFF .tif, MPEG-TS .ts, .mts ya da .m2ts olarak. Uzantısı .ts ya da .xml olan bir dosya yalnızca içeriği formatı doğrularsa alınır; .ts bir TypeScript dosyası, .xml herhangi bir XML de olabilir.

<!-- formats -->

Kendi sayfası olan dönüşümler [Tüm dönüşümler](/tr/donustur/) sayfasında.

<h2 id="where">İş nerede yapılır</h2>

Motor bu sekmenin arka planında çalışır. Sayfa gerçek ilerlemeyi, ardından sonucu ve sayılarını gösterir: format, öncesi ve sonrası boyut, çözünürlük. Kaydet'e basmadan hiçbir şey kaydedilmez. Convy dosyayı noktadan sonraki harflere göre değil, içeriğine göre tanır; adı değiştirilmiş bir dosya da gerçekte ne ise o olarak okunur. 50 MB'tan büyük sonuçlar bellekte tutulmaz, tarayıcının bu site için ayırdığı depolama alanına yazılır.

<h2 id="limits">Sınırlar</h2>

Convy'nin sınırları, tarayıcının bu sekmeye verdiği bellek ve depolama alanına göre konuldu. Amaç, bir işin yarıda kalmaması; Convy bunlara iş başlamadan bakar:

- **Görseller:** 250 megapikselin üstü reddedilir, iPhone ve iPad'de 100 megapikselin üstü. Böylece sekmenin belleği işin ortasında tükenmez.
- **ffmpeg işleri:** tahmini sonuç 1 GB'tan büyükse, iPhone ve iPad'de 500 MB'tan, iş başlamadan reddedilir. 2 dakikayı ve girdinin her MB'ı için 2 saniyeyi aşan iş durdurulur.
- **Mediabunny ile video:** büyük sonuçlar depolama alanına akarak yazılır. 2 GB'ın üstündeki dosyalarda uyarı çıkar, çünkü Convy bu boyutun üstünde test edilmedi; yine de deneyebilirsin.
- **Depolama:** Convy iş başlamadan motorun ve beklenen sonucun boyutunu, tarayıcının bildirdiği boş alanla karşılaştırır. Yer yetmiyorsa önce bunu söyler.
- **PDF:** parolalı PDF'ler açılamaz. Taranmış bir PDF'de seçilebilir metin olmadığı için metne çevirmek bir şey vermez; onun yerine sayfalarını PNG ya da JPG'ye çevir.
- **Kalite:** ayarı yoktur; her format tek ve sabit bir kalitede yazılır, örneğin JPG 85, MP3 yaklaşık 190 kbps.
- **Belgeden PDF'ye** dönüşüm yok. Bunun için bugün tarayıcıda çalışmayan bir PDF dizgi motoru gerekiyor.

Bir iş yine de başarısız olursa mesaj nedenini ve ne deneyebileceğini söyler; orijinal dosyan olduğu gibi kalır.

<h2 id="offline">Çevrimdışı</h2>

Bir motor saklandıktan sonra, onu kullanan dönüşümler bağlantı olmadan da çalışır. İlk ziyaretten sonra dönüştürücü sayfası bu tarayıcıda saklanır; böylece çevrimdışı da açılır. Bu sayfa gibi diğer sayfalar saklanmaz; onları açmak için bağlantı gerekir. Kontrol etmek için dönüştürücüdeki Bu cihaz panelini aç: Çevrimdışı satırı hangi dosya türlerinin hazır olduğunu söyler.

Çevrimdışı kalmadan önce hazırlanmak için dönüştürücüdeki Bu cihaz panelini aç ve tüm motorları sakla; panel önce indirme boyutunu gösterir. Depolama azalınca tarayıcılar saklanan motorları ve sayfayı silebilir; Safari, 7 gün ziyaret etmezsen de silebilir. Silinen motor, bir dosya ona ihtiyaç duyduğunda yeniden iner; sayfa da bir sonraki ziyaretinde yeniden saklanır.

<h2 id="check">Kendin kontrol et</h2>

Bir dosya dönüşürken tarayıcının geliştirici araçlarında Ağ sekmesini aç ve sayfanın neler istediğine bak.

Convy'yi Zeze Workshop yaptı. Kaynak kodu GPL-3.0 ile açıktır; her motor, sürümü ve lisansı [Hakkında sayfasında](/tr/hakkinda/#lisanslar) listelenir.
