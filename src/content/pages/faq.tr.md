---
draft: false
title: "SSS: Formatlar, Sınırlar, Çevrimdışı, iPhone | Convy"
h1: "Sorular, koşullarıyla cevaplandı"
description: "Desteklenen formatlar, dosya boyutu sınırları, çevrimdışı kullanım, iPhone ve Safari üzerine kısa cevaplar."
---
Her cevap koşuluyla birlikte. Ayrıntılar [Nasıl çalışır](/tr/nasil-calisir/) sayfasında.

## Convy neleri dönüştürebilir?

Görsel (PNG, JPG, WebP, AVIF, HEIC, GIF, BMP, TIFF, ICO, JPEG XL ve düzleştirilmiş PSD), ses (MP3, WAV, M4A, OGG, FLAC ve diğerleri), video (MP4, MOV, WebM, MKV, AVI; ayrıca videodan GIF ya da MP3), Pandoc ile belge (DOCX, ODT, EPUB, Markdown, HTML; düz metin yalnızca çıktı olarak) ve PDF sayfalarından görsel ya da metin. Görseller PDF'ye de dönüşebilir. Kendi sayfası olan dönüşümler [Tüm dönüşümler](/tr/donustur/) sayfasında.

## Dosya boyutu sınırı var mı?

Var, birkaç tane; sekmenin belleği işin ortasında bitmesin diye konuldu: görsellerde 250 megapiksele kadar (iPhone ve iPad'de 100), ffmpeg sonuçlarında tahmini 1 GB'a kadar (iPhone ve iPad'de 500 MB). Bir dosya fazla gelecek gibiyse Convy bunu iş başlamadan söyler.

## Dosyalarım nerede dönüştürülüyor?

Bu tarayıcı sekmesinde, bu cihazda. Motor sekmenin arka planında çalışır, sayfa önce sonucu gösterir ve Kaydet'e basmadan hiçbir şey kaydedilmez. İş sürerken sayfanın neler istediğini görmek için tarayıcının geliştirici araçlarında Ağ sekmesini aç.

## İlk dönüşüm neden daha uzun sürüyor?

O dosya türünün motoru bir kez iner: görsel için yaklaşık 5 MB, ses ve video yedeği için 10 MB, belge için 16 MB, PDF için 0,5 MB. Tarayıcı motoru saklar; aynı türden bir sonraki dönüşüm hemen başlar. Tarayıcı yer açmak için motoru sildiyse yeniden iner.

## Çevrimdışı çalışır mı?

Gereken motor saklıysa evet. İlk ziyaretten sonra dönüştürücü sayfası bu tarayıcıda saklanır, bu yüzden bağlantı olmadan da açılır; diğer Convy sayfaları için bağlantı gerekir. Hazırlanmak için dönüştürücüdeki Bu cihaz panelinden tüm motorları sakla. Panel önce indirme boyutunu gösterir; Çevrimdışı satırı da neyin hazır olduğunu söyler.

## iPhone'da ve Safari'de çalışır mı?

Convy Chromium, Firefox ve Safari'nin altındaki motor olan WebKit'te test edilir. iPhone ve iPad'de görseller ve ffmpeg sonuçları için daha düşük sınırlar kullanır. Fotoğrafı Fotoğraflar arşivinden seçersen iOS tarayıcıya HEIC yerine bir JPG kopyası verebilir; orijinali dönüştürmek için fotoğrafı Dosyalar uygulamasından seç.

## Sonuçta kalite düşer mi?

Hedef formata bağlı. JPG, WebP, MP3 ve yeniden kodlanan MP4 kayıplıdır: her dönüşümde biraz ayrıntı gider, bu yüzden orijinalini sakla. PNG ve WAV kayıpsızdır. PDF'ye konan bir JPG olduğu gibi girer. Kalite ayarı yoktur; her format tek ve sabit bir kalitede yazılır, JPG 85'te.

## Birden çok dosyayı aynı anda dönüştürebilir miyim?

Evet. Birkaç dosya ekle, hedefi bir kez seç, sonuçları tek tek ya da hepsini bir ZIP olarak kaydet. Bir dosya başarısız olursa diğerleri devam eder.

## Convy .jpg dosyama neden başka bir şey gibi davranıyor?

Convy dosyayı noktadan sonraki harflere göre değil, içeriğine göre tanır. Adı .jpg yapılmış bir HEIC yine HEIC'tir ve Convy onu HEIC olarak dönüştürür. İçerik desteklediği hiçbir formata uymuyorsa bunu iş başlamadan söyler.

## Ücretsiz mi? Hesap gerekiyor mu?

Convy ücretsizdir, reklam göstermez ve hesap istemez. GPL-3.0 ile açık kaynaktır; her motor ve lisansı için [Hakkında](/tr/hakkinda/#lisanslar) sayfasına bak.

## Convy'nin VERT'ten farkı ne?

VERT de ffmpeg ve ImageMagick gibi motorları WebAssembly ile tarayıcıda çalıştıran açık kaynak bir dönüştürücü; Convy de öyle. Farklar şunlar: Convy sıfırdan, GPL-3.0 ile yazıldı ve VERT'ten kod almaz. Convy videoyu yalnızca tarayıcıda dönüştürür; bir video işi ya bu cihazda yapılır ya da hiç sunulmaz. Ve Convy, neyin indiğini, işin nasıl gittiğini ve elinde ne olduğunu göstermek üzere tasarlandı.
