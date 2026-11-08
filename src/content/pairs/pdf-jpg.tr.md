---
draft: false
intro: "Bir PDF sayfasını paylaşmak, sunuma koymak ya da mesajla göndermek için resim olarak mı istiyorsun? PDF dosyanı seç, Convy bu cihazda her sayfayı JPG olarak çizsin. Birden çok sayfalı bir belge, numaralı görsellerden oluşan tek bir ZIP olarak gelir."
metaHook: "her sayfa bir JPG; çok sayfalı belgeler tek ZIP olarak gelir"
steps:
  - "PDF dosyalarını seç ya da sayfaya bırak."
  - "Hedefte JPG zaten seçili gelir."
  - "Dönüştür'e bas, sonra JPG'yi kaydet; çok sayfalı belgede ZIP'i."
limits:
  - "Parola korumalı PDF'ler parola uyarısıyla durur; parolayı girip açma seçeneği yok."
  - "Her dosya için süre sınırı 120 saniye, artı PDF'nin her megabaytı için 2 saniye."
  - "Sayfalar yaklaşık 144 dpi ile çıkar, uzun kenar en çok 4 000 piksel; çözünürlük ayarı yok."
faq:
  - q: "Yazılar okunacak kadar net olur mu?"
    a: "Her sayfa, PDF.js'nin temel ölçeğinin iki katında, yaklaşık 144 dpi ile çizilir; uzun kenar en çok 4 000 piksel olur. Küçük puntoların rahat okunup okunmaması PDF'nin kendi yazı boyutuna bağlı, daha yüksek çözünürlük için bir ayar yok. Kenarların sıkıştırmasız kalması gerekiyorsa PNG'yi seç."
  - q: "20 sayfalık bir PDF seçtim. Ne alırım?"
    a: "İçinde 20 numaralı JPG bulunan tek bir ZIP dosyası, her sayfa için bir görsel. Tek sayfalık bir PDF ise ZIP olmadan tek bir JPG verir. Belgenin bütün sayfaları dönüştürülür, hiçbiri atlanmaz."
  - q: "PDF'nin bilgileri görsellere geçer mi?"
    a: "Geçmez. Görseller çizilen sayfadan üretildiği için başlık ya da yazar gibi belge bilgileri JPG'lere taşınmaz. Sayfa zemini de PDF.js'nin çizdiği gibi beyazdır, bu yüzden görsellerde saydam alan olmaz."
  - q: "Aynı PDF başka bir tarayıcıda neden biraz farklı bir JPG veriyor?"
    a: "Sayfayı her tarayıcı kendi tuvalinde çizer, JPG'yi de tarayıcının kendi kodlayıcısı 0,9 kalitede yazar. Bu yüzden aynı belgede bile pikseller ve dosya boyutu Chromium, Firefox ve WebKit arasında biraz değişebilir."
factRefs: [lossy, quality, metadata, transparency, path, limits.0, limits.1, extra.0]
---
Convy PDF'yi PDF.js'ye verir; her sayfa bir tuvale, temel ölçeğinin iki katında, yaklaşık 144 dpi ile çizilir. Sayfanın uzun kenarı en çok 4 000 piksel olabilir, bu yüzden çok büyük çizimler ve afişler bu sınıra küçültülür. Sayfanın kendi dolgusu olmayan her yeri beyaz görünür.

Tuval sonra tarayıcının kendi kodlayıcısıyla, 0,9 kalitede JPG olarak kaydedilir. Yani JPG kayıplıdır; üstelik sonuç tarayıcıdan tarayıcıya biraz değişebilir, çünkü her tarayıcının çizdiği pikseller birebir aynı değil.

Tek sayfalık bir PDF tek bir JPG verir. Daha uzun bir belge, her sayfa için numaralı bir görselin bulunduğu bir ZIP olarak gelir; hiçbir sayfa dışarıda kalmaz. PDF'nin kendi metaverisi görsellere geçmez, görsellerdeki yazı da artık seçilip aranamaz. Parola korumalı bir PDF, parolayı sormak yerine bir uyarıyla durur. Her dosyanın süre sınırı 120 saniye, artı her megabayt için 2 saniyedir.
