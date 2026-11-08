---
draft: false
intro: "PNG, çizilen her sayfayı kayıplı sıkıştırma olmadan saklar; yazı, şema ve slayt sayfaları için uygun bir hedef. PDF dosyanı seç, Convy bu cihazda her sayfayı PNG olarak çizsin. Birden çok sayfa, her sayfaya bir görselle tek bir ZIP'te gelir."
metaHook: "yazı ve şemalar için kayıpsız sayfa görselleri, çok sayfada ZIP"
steps:
  - "PDF dosyalarını seç ya da sayfaya bırak."
  - "Hedefte PNG zaten seçili gelir."
  - "Dönüştür'e bas, sonra PNG'yi ya da çok sayfalı belgenin ZIP'ini kaydet."
limits:
  - "Parola korumalı PDF'ler parola uyarısıyla durur; parolayı girecek bir yer yok."
  - "Her dosya için süre sınırı 120 saniye, artı PDF'nin her megabaytı için 2 saniye."
faq:
  - q: "Bir PDF sayfası için PNG mi, JPG mi?"
    a: "Sayfa çoğunlukla yazı, çizgi ya da düz renkse PNG: kayıpsızdır, kenarlar sıkıştırmayla dağılmaz. JPG 0,9 kalitede kayıplıdır, çoğu fotoğraftan oluşan sayfalar için bir seçenek. İkisi de aynı ölçekte, yaklaşık 144 dpi ile çizilir."
  - q: "Başka tarayıcıda ZIP neden farklı boyutta?"
    a: "Her tarayıcı sayfayı kendi tuvalinde çizer, bu yüzden pikseller biraz farklı çıkar. Örnek PDF'miz PNG olarak Chromium'da 116 KB, WebKit'te 105 KB, Firefox'ta 44 KB'lık bir ZIP verdi. Motor her yerde aynı, çizim aynı değil."
  - q: "PDF'ler için bir şey indiriliyor mu?"
    a: "Bir kez, evet: PDF motoru yaklaşık 0,5 MB tutar ve sonraki sefer için saklanır. Bazı PDF'ler ayrıca ek yazı tipi verisine ihtiyaç duyar; toplamı 3,4 MB'a kadar çıkan bu veri yalnız belge gerektirdiğinde indirilir."
  - q: "Parola korumalı bir PDF'yi açabilir mi?"
    a: "Açamaz. Parola isteyen bir PDF, bunu söyleyen bir uyarıyla durur; parolayı yazacak bir alan yok. Önce güvendiğin bir PDF uygulamasında korumayı kaldır, sonra kilidi açılmış kopyayı çevir."
factRefs: [lossy, quality, metadata, transparency, path, limits.0, limits.1, extra.0, download]
---
PDF.js her sayfayı temel ölçeğinin iki katında, yaklaşık 144 dpi ile çizer; Convy sonucu PNG olarak kaydeder. PNG kayıpsız olduğu için görsel, çizilenin ta kendisidir: ince çizgiler, küçük yazılar ve düz renkler kenarlarını korur, etraflarında sıkıştırma blokları oluşmaz. Uzun kenar en çok 4 000 piksel olur.

Çizimi tarayıcının tuvali yapar ve bu kısım her yerde aynı değildir. Aynı örnek PDF'yi PNG'ye çevirdiğimizde Chromium 116 KB, WebKit 105 KB, Firefox ise 44 KB'lık bir ZIP üretti. Tarayıcılar arasında küçük piksel farkları bekle.

Sayfaların zemini beyazdır; PNG şeffaflık taşıyabilse de bu görsellerde saydam alan olmaz. Tek sayfa tek bir PNG verir, uzun bir belge ise her sayfaya bir numaralı görselle ZIP olarak gelir. Başlık ya da yazar gibi belge bilgileri PDF'de kalır, görsellere kopyalanmaz.
