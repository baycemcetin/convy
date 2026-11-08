---
draft: false
intro: "Ekran görüntüleri ve dışa aktarılan grafikler çoğunlukla PNG olarak kaydedilir; e-postaya eklemek ya da paylaşmak için ağır gelebilir. PNG dosyalarını seç, Convy onları hiçbir yere göndermeden 85 kalitede JPG'ye çevirsin. JPG şeffaflık taşımadığı için saydam alanlar beyazla dolar."
metaHook: "paylaşmaya uygun daha küçük dosya, saydam alanlar beyaza döner"
steps:
  - "PNG dosyalarını seç ya da sayfaya bırak."
  - "Hedefte JPG zaten seçili gelir."
  - "Dönüştür'e bas, ardından JPG dosyalarını kaydet."
limits:
  - "250 megapikselin üstündeki görseller reddedilir (iPhone ve iPad'de 100 megapiksel); cihazın belleği tükenmesin diye."
  - "İlk dönüşümde görsel motoru bir kez iner, yaklaşık 5 MB, ve tarayıcıda saklanır."
faq:
  - q: "Saydam arka plana ne olur?"
    a: "Beyaz olur. JPG şeffaflığı saklayamadığı için tamamen ya da kısmen saydam her piksel, dosya yazılmadan önce beyaz zeminin üstüne oturtulur; saydam test görselimiz de böyle çıktı. Zeminin saydam kalması gerekiyorsa PNG ya da WebP bunu taşır, JPG taşımaz."
  - q: "Ekran görüntüsündeki yazılar net kalır mı?"
    a: "Büyük ölçüde, ama kusursuz değil. JPG kayıplıdır ve Convy onu 85 kalitede yazar, yükseltmek için bir ayar yok. Küçük harf ya da ince çizgi gibi keskin kenarlarda hafif lekelenme olabilir. Dikkatle okunacak ekran görüntülerinde PNG'yi tutmak daha iyi olur."
  - q: "Dönüşüm PNG'deki gizli verileri siler mi?"
    a: "Evet. PNG'deki eXIf, XMP ya da metin yorumu gibi metaveri silinir, yön etiketi önce uygulanır. Bunu, GPS konumu da dahil üçünü birden taşıyan bir PNG ile sınadık."
  - q: "JPG ne kadar küçük olur?"
    a: "Görsele bağlı. 96 KB'lık örnek PNG'miz 51 KB'lık bir JPG oldu, yarıdan biraz fazlası; sonuç Chromium, Firefox ve WebKit'te aynıydı. Hepsine geçmeden önce tek bir dosyayı çevirip boyutları karşılaştır."
factRefs: [lossy, quality, transparency, metadata, path, extra.1, limits.0]
---
PNG'nin saydam yerlerinin arkasına bir renk gelmesi gerekir, çünkü JPG şeffaflığı saklayamaz. Convy oraya beyaz koyar. Saydam zeminli bir logo beyaz bir dikdörtgenin üstünde kalır; yumuşak bir gölge de görselin sonradan konduğu sayfanın rengine değil, beyaza karışır. Şeffaflık önemliyse PNG'yi sakla.

İkinci değişiklik kayıp. PNG pikselleri birebir saklar; 85 kalitedeki JPG ise biraz ayrıntıdan vazgeçip dosyayı küçültür. Fotoğraflarda bu pek fark edilmez. Düz renklerde, ince çizgilerde ve küçük yazılarda kenarlarda hafif lekeler olarak belirir; yazı dolu bir ekran görüntüsü özgününden biraz daha yumuşak görünebilir.

PNG de metaveri taşıyabilir, eXIf ve XMP parçalarında. Diğer görsellerde olduğu gibi silinirler: bu parçaları taşıyan test PNG'mizin JPG'sinde hiçbiri kalmadı. ICC renk profili korunur.

Sonuç tarayıcıya göre değişmez. 96 453 baytlık örnek PNG'miz Chromium, Firefox ve WebKit'te aynı 51 298 baytlık JPG'yi verdi.
