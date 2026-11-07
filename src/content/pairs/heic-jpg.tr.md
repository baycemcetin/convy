---
draft: true # ÖRNEK: şablon ve build kontrollerini doğrulamak için pair-facts'ten yazıldı. Copywriter bunu değiştirir; olduğu gibi yayına girmez.
intro: "HEIC, iPhone'un varsayılan olarak kaydettiği biçim ve birçok program hâlâ açamıyor. HEIC dosyalarını seç, Convy bu cihazda JPG'ye çevirsin, sonra sonucu kaydet. Fotoğrafın içindeki kamera bilgileri de onunla birlikte gelir ve resim doğru yönde durur."
metaHook: "fotoğraf kamera bilgilerini korur ve doğru yönde durur"
steps:
  - "HEIC fotoğraflarını seç ya da sayfaya bırak."
  - "Hedef olarak JPG zaten seçili geliyor."
  - "Dönüştür'e bas, sonra JPG dosyalarını kaydet."
limits:
  - "250 megapikselin üstündeki görseller, iPhone ve iPad'de 100 megapikselin üstündekiler, cihazın belleğini tüketmesin diye reddedilir."
  - "İlk dönüşümde görsel motoru bir kez iner, yaklaşık 5 MB, sonraki sefer için saklanır."
faq:
  - q: "JPG tarihi ve konumu koruyor mu?"
    a: "Evet. EXIF bloğu olduğu gibi JPG'ye taşınır; HEIC'te varsa kamera markası ve GPS konumu da dahil. Konumun başkalarıyla paylaşılmasını istemiyorsan dosyayı göndermeden önce bir metaveri aracıyla sil."
  - q: "Dosya neden büyüyor?"
    a: "HEIC fotoğrafı JPG'den daha sıkı sıkıştırır. Denememizde 39 KB'lık bir HEIC, kalite 85'te 51 KB'lık JPG oldu. Oran fotoğrafa göre değişir; bu tek bir örnek, kural değil."
  - q: "Chrome, Firefox ve Safari'de sonuç aynı mı?"
    a: "Örnek dosyamızda çıktı Chromium, Firefox ve WebKit'te bayt bayt aynıydı, çünkü üçünde de aynı görsel motoru çalışıyor. Başka fotoğraflar karşılaştırılmadı; bu, motoru anlatır, her dosyayı değil."
factRefs: [lossy, metadata, path, limits.0, extra.0, extra.2]
---
JPG kayıplı bir biçimdir ve Convy onu 85 kalitesinde yazar. HEIC orijinale göre görünür ama yumuşak bir düşüştür ve geri alınmaz: pikselleri olduğu gibi tutmak istiyorsan HEIC'i sakla, kopyasını dönüştür.

Kamera bilgileri yolda düşmez. Bu bilgileri taşıyan bir HEIC'i dönüştürdüğümüzde marka, model ve GPS konumu JPG'de duruyordu; yani konum etiketli bir fotoğraf etiketli kalır. Dosyayı herkese açık bir yerde paylaşacaksan önce buna bak.

Yön işi senin yerine yapılır. Convy pikselleri fotoğrafın çekildiği yöne çevirir ve yön etiketini normale sıfırlar; böylece etiketi görmezden gelen görüntüleyicilerde de resim dik durur.

Bir örnekte 1280 × 720 piksellik 39 KB'lık HEIC, 51 KB'lık JPG çıktı. Gerçek telefon fotoğrafları çok daha büyüktür; iki dosyanın da birkaç megabayt olmasını bekle. Boyut farkı fotoğrafın içeriğine göre değişir.
