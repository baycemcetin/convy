---
draft: false
intro: "Kısa bir klibin bazen videonun oynamadığı bir yerde dönmesi gerekir: bir sohbette, bir hata kaydında, bir sunumda ya da bir e-postada. MP4 dosyalarını seç, Convy bu cihazda her birini saniyede 12 kare, 480 piksel genişlikte ve sessiz, hareketli bir GIF'e çevirsin."
metaHook: "saniyede 12 kare ve 480 piksel genişlikte, sesi atılmış hareketli bir GIF"
steps:
  - "Kısa bir MP4 klip seç ya da sayfaya bırak."
  - "Hedefte GIF zaten seçili gelir."
  - "Dönüştür'e bas, sonra GIF'i kaydet."
limits:
  - "Convy başlamadan önce GIF'i 3000 kbps üzerinden tahmin eder; tahmini 1 GB'ı (iPhone ve iPad'de 500 MB'ı) geçen klip reddedilir. Bu, aşağı yukarı 44 dakikalık videoya denk gelir."
  - "Bir dönüşüm 120 saniye ve girdinin her MB'ı için 2 saniye dolunca durdurulur."
  - "Ses ve video motoru ilk dönüşümde bir kez iner (yaklaşık 10 MB) ve sonraki seferler için saklanır."
faq:
  - q: "Kare hızını ya da boyutu değiştirebilir miyim?"
    a: "Hayır. Her GIF saniyede 12 kare ve 480 piksel genişlikte üretilir; yükseklik klibin oranını izler, yani 16:9 bir video 480 × 270 verir. Arayüzde bu iki değer için bir ayar yok."
  - q: "Ses nereye gitti?"
    a: "GIF bir görsel formatıdır ve ses için yeri yoktur; bu yüzden ses izi dönüşüm sırasında dışarıda bırakılır. Görüntü sessiz oynar. Ses önemliyse GIF yerine MP4'ün kendisini paylaş."
  - q: "GIF neden kumlu görünüyor?"
    a: "GIF her karede yalnızca 256 renge izin verir. Convy dönüştürmeden önce klibin kendisinden bir palet çıkarır, bu işe yarar; yine de renk geçişleri, gökyüzü ve ten bantlı ya da nokta nokta görünebilir. Ekran kayıtları ve düz renkli grafikler genellikle kamera görüntüsünden daha iyi sonuç verir."
  - q: "Her tarayıcıda aynı GIF mi çıkıyor?"
    a: "Örneğimizde evet: Chromium, Firefox ve WebKit bayt bayt aynı GIF'i üretti, çünkü üçünde de aynı FFmpeg motoru çalışıyor; tarayıcının kendi video araçları GIF için kullanılmıyor. Denemeyi Playwright'ın tarayıcı sürümlerinde yaptık, Google Chrome'da ya da iPhone'da değil."
factRefs: [lossy, quality, animation, path, download, limits.0, limits.1, limits.2, extra.0]
---
Klibin tamamı tek bir hareketli GIF olur; Convy klibi kesmez, içinden bir bölüm seçmez. Ayarlar sabit ve arayüzden değiştirilemez: saniyede 12 kare, 480 piksel genişlik, klibin oranına göre bir yükseklik. Ölçekleme Lanczos filtresiyle yapılır. 640 × 360'lık bir test videosu 480 × 270'lik bir GIF'e dönüştü.

GIF her karede en fazla 256 renk saklar. Convy önce klibin kendisinden bir palet çıkarır, sonra kareleri bu palete oturtur; böylece renkler 256'nın el verdiği ölçüde kaynağa yakın kalır. Yumuşak geçişlerde, gökyüzünde ve ten tonlarında yine de bantlanma ya da kumlanma görülebilir.

Ses silinir, çünkü GIF ses taşıyamaz. Klibin sesine ihtiyacın varsa onu video olarak bırak.

Bu dönüşüm her tarayıcıda FFmpeg motorundan geçer. Örnek MP4'ümüz 875 487 baytlık bir GIF oldu; Chromium, Firefox ve WebKit'te bayt bayt aynı dosya çıktı, süre saniyenin yüzde biri kadar değişti. Motor ilk seferde iner, yaklaşık 10 MB tutar ve bu cihazda saklanır.
