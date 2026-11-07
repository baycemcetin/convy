---
draft: false
intro: "Bir siteden kaydettiğin resim çoğu zaman WebP çıkar; eski düzenleyiciler, baskı hizmetleri ve birçok web formu bu dosyayı kabul etmez. WebP dosyalarını seç, Convy bu cihazda JPG'ye çevirsin. Saydam alanlar beyaz olur, hareketli bir WebP'den ilk kare alınır."
metaHook: "WebP açmayan program ve formlar için; hareketli dosyada ilk kare kalır"
steps:
  - "WebP görsellerini seç ya da sayfaya bırak."
  - "Hedefte JPG zaten seçili gelir."
  - "Dönüştür'e bas, sonra JPG dosyalarını kaydet."
limits:
  - "250 megapikselin üstündeki görseller reddedilir; iPhone ve iPad'de sınır 100 megapiksel."
  - "Hareketli bir WebP'den tek bir durağan JPG çıkar; diğer kareler dönüştürülmez."
faq:
  - q: "Hareketli bir WebP kaydettim. JPG'de ne görünür?"
    a: "Yalnız ilk kare. Convy dosyadaki ilk görüntüyü okur ve onu çevirir; animasyonun geri kalanı kullanılmaz. JPG hareketi hiçbir şekilde saklayamaz, hareket gerekiyorsa WebP'yi olduğu gibi tut."
  - q: "Dekupe edilmiş arka plan neden beyaz oluyor?"
    a: "Çünkü JPG'de şeffaflığı saklayacak bir yer yok. Convy dosyayı yazmadan önce saydam ya da yarı saydam her pikseli beyazın üstüne yerleştirir; bunu saydam bir test görseliyle doğruladık. Dekupenin saydam kalmasını istiyorsan hedef olarak PNG'yi seç."
  - q: "JPG'de kalite düşer mi?"
    a: "Biraz. JPG kayıplıdır ve Convy onu 85 kalitede yazar, değiştirecek bir ayar yok. WebP de kayıplıysa JPG bunun üstüne ikinci bir sıkıştırma turu ekler. Her pikselin önemli olduğu düzenlemeler için kayıpsız olan PNG'ye çevir."
factRefs: [lossy, quality, transparency, animation, metadata, path, extra.0, extra.1, limits.0]
---
WebP'nin yapabildiği üç şeyi JPG yapamaz: şeffaflık, hareket ve kayıpsız sıkıştırma. Convy üçünü de sabit bir kurala göre çözer, değiştirmek için seçenek yok.

Önce şeffaflık: beyaza döner. Saydam zemin üzerine dekupe edilmiş bir ürün fotoğrafı beyaz bir alanın üstüne oturur. Beyaz bir sayfada bu sorun olmaz, ama renkli bir zemine konacak görselde beyaz kutu göze batar.

Hareket ilk karede kalır. Convy dosyadaki yalnız ilk görüntüyü okur; hareketli bir çıkartma ya da afiş durağan bir resme dönüşür. Hareket gerekiyorsa WebP'yi sakla, JPG onu tutamaz.

Kayıpsız WebP, sabit 85 kalitede kayıplı JPG olur. Zaten kayıplı olan bir WebP ikinci kez sıkıştırılır; bir sayfadan kaydedilmiş küçük görseller öncekinden biraz daha pürüzlü görünebilir.

Dosyanın içindeki EXIF, varsa GPS konumuyla birlikte silinir; ICC renk profili korunur. Yön etiketi varsa pikseller etiket silinmeden önce döndürülür. Her tarayıcıda aynı motor çalışır, kodda tarayıcıya özel bir dal yok.
