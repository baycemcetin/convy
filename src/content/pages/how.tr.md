---
draft: false
title: "Nasıl Çalışır: Motorlar, Sınırlar, Çevrimdışı | Convy"
h1: "Convy nasıl çalışır"
description: "Hangi motor hangi dosyayı dönüştürür, ilk seferde ne iner, sınırlar nerede ve ağ sekmesinden kendin nasıl bakarsın."
---
Convy dosyaları, tarayıcı sekmenin içinde çalışan açık kaynak motorlarla dönüştürür. Sayfayı açmak hiçbir motoru indirmez. Motor, ona ihtiyaç duyan bir dosyada Dönüştür'e bastığında iner ve tarayıcı onu sonraki sefer için saklar. Aşağıda hangi motorun ne yaptığını, sınırların nerede olduğunu ve bağlantı yokken neyin çalışmaya devam ettiğini bulursun.

<h2 id="engines">Motorlar</h2>

**Görsel: ImageMagick** (magick-wasm 0.0.46), indirmesi yaklaşık 5 MB. PNG, JPG, WebP, AVIF, GIF, BMP, TIFF, ICO ve JPEG XL okur ve yazar; HEIC ile düzleştirilmiş PSD dosyalarını da okur. Her tarayıcıda aynı motor çalışır, tarayıcıya özel bir yol yoktur.

**Görselden PDF'ye: Convy'nin kendi PDF yazıcısı**, sitenin kodunun bir parçası. JPG, PDF'nin içine yeniden sıkıştırılmadan olduğu gibi girer; diğer görseller kayıpsız girer. Bir görsel bir sayfa olur.

**Ses: ffmpeg** (ffmpeg.wasm 0.12.10, tek iş parçacıklı), yaklaşık 10 MB. Her ses sonucunu, her tarayıcıda ffmpeg üretir.

**Video: önce Mediabunny, gerekirse ffmpeg.** Convy her dosya için tarayıcının onu WebCodecs ile kendisinin çözüp H.264 video ve AAC ses olarak kodlayıp kodlayamayacağına bakar. Kodlayabiliyorsa işi Mediabunny yapar; sitenin kodunun parçası olduğu için ayrıca bir şey inmez. Kodlayamıyorsa iş ffmpeg'e geçer. Videodan GIF'e her zaman ffmpeg'le yapılır.

**Belge: Pandoc** (pandoc-wasm 1.1.0, Pandoc 3.10), yaklaşık 16 MB; en büyük motor bu. DOCX, ODT, EPUB, Markdown ve HTML gibi belgeleri dönüştürür, düz metin de yazabilir.

**PDF: pdf.js** (6.5.438), yaklaşık 0,5 MB; Firefox'un içinde de çalışan PDF görüntüleyicisi. Her sayfayı yaklaşık 144 dpi, uzun kenarı en fazla 4000 piksel bir görsele çevirir ya da seçilebilir metni çıkarır. Bir PDF'nin ihtiyaç duyduğu yazı tipleri yalnızca o PDF onları istediğinde iner.

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
