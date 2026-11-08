---
draft: false
title: "Gizlilik | Convy"
h1: "Gizlilik"
description: "Convy dosyaları cihazında dönüştürür. Hesap, çerez, reklam ve analitik yok. Tarayıcının neyi sakladığı, nasıl silinir, barındırıcı ne görür."
---
Convy dosyaları tarayıcında, bu cihazda dönüştürür. Dosyalar cihazında kalır. Hesap, çerez, reklam ve analitik yok. Aşağıda tarayıcının Convy için neleri sakladığını, bunları nasıl sileceğini ve siteyi sunan hizmetin neyi görebildiğini bulursun.

## Dosyaların

Eklediğin dosyayı sayfa okur ve bu sekmenin arka planında dönüştürür. Convy'nin dosya alan bir parçası yok: sunucu tarafında Convy yalnızca durağan dosyalardan (sayfalar, betikler ve motorlar) oluşur ve orada hiçbir kod çalıştırmaz; sayfanın güvenlik politikası da yalnızca Convy'nin kendi adresine bağlanmasına izin verir. Sonuç, sen kaydedene dek sekmede durur.

50 MB'tan büyük sonuçlar beklerken tarayıcının bu site için ayırdığı depolama alanına yazılır. Convy her birini kaydettikten yaklaşık bir dakika sonra, listeden kaldırdığında ya da sekmeyi kapattığında siler; geride kalanı bir sonraki ziyaretinde temizler. Telefonda bir sonucu paylaşırsan, paylaşım menüsünde seçtiğin uygulamaya gider.

## Convy'nin toplamadıkları

- **Hesap yok.** Üye olunacak ya da giriş yapılacak bir şey yok.
- **Çerez yok.** Convy hiç çerez koymaz.
- **Analitik, reklam ya da üçüncü taraf içerik yok.** Sayfadaki her betik, yazı tipi ve görsel Convy'nin kendi adresinden gelir.
- **Kamera, mikrofon ya da konum yok.** Sayfanın izin politikası bunları kapatır.

## Tarayıcının sakladıkları

Bunlar yalnızca bu tarayıcıda, yalnızca useconvy.com için durur. Hiçbiri sunucuya geri gönderilmez.

- **Motorlar.** Kullandığın motor yeniden inmesin diye Cache Storage'da saklanır: görsel için yaklaşık 5 MB, ses ve video için 10 MB, belge için 16 MB, PDF için 0,5 MB.
- **Dönüştürücü sayfası.** İlk ziyaretinden sonra bir service worker dönüştürücü sayfasını betikleri, yazı tipi ve simgeleriyle birlikte saklar; sayfa bağlantı olmadan da açılır.
- **Büyük sonuçlar.** 50 MB'tan büyük sonuçlar, yukarıda anlatıldığı gibi kısa süreliğine (Origin Private File System'de).
- **Teman.** Tema düğmesiyle açık ya da koyu temayı seçersen tercihin localStorage'da `convy-theme` adıyla saklanır. Orada başka bir şey tutulmaz.

## Nasıl silinir

- **Saklanan motorlar:** dönüştürücüde Bu cihaz panelini aç ve Saklanan motorları sil'e bas. Düğme ne kadar yer açacağını gösterir.
- **Saklanan sayfa ve tema dahil her şey:** tarayıcının ayarlarında useconvy.com için site verilerini temizle. Convy bundan sonra ilk ziyaretteki gibi davranır.
- Depolama azalınca tarayıcılar bu verileri kendileri de silebilir; Safari, 7 gün ziyaret etmezsen silebilir.

## Barındırıcı ne görür

Convy'yi Cloudflare sunar. Tarayıcın bir sayfa, betik ya da motor dosyası istediğinde istek, Cloudflare'in sunduğu her sitede olduğu gibi Cloudflare'den geçer ve her web isteğinin taşıdığını taşır: IP adresin, istenen adres, zaman ve tarayıcının kimlik bilgisi (user agent). Cloudflare bu isteklerin standart kayıtlarını tutabilir; bunları nasıl işlediği [Cloudflare'in gizlilik politikasında](https://www.cloudflare.com/privacypolicy/) yazar. Bu isteklerin hiçbiri dosyalarını, adlarını ya da içeriklerini taşımaz.

## Başka siteler

Kaynak kodun bulunduğu GitHub gibi başka sitelere giden bağlantılar seni Convy'nin dışına çıkarır; o sitelerin kendi politikaları geçerlidir. Convy onlara, geldiğin sayfa olarak yalnızca kendi adresini bildirir.

## Kendin bak

Kaynak kodu oku (bağlantısı [Hakkında](/tr/hakkinda/#kaynak) sayfasında) ya da bir dosya dönüşürken tarayıcının geliştirici araçlarında Ağ sekmesini aç ve sayfanın neler istediğini izle. Ayrıntılar [Nasıl çalışır](/tr/nasil-calisir/#check) sayfasında.

Son güncelleme: 8 Kasım 2026.
