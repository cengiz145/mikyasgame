# Hafızana Güven — Google Play Store Yayın Paketi ve Kopyala-Yapıştır Rehberi

Bu klasörde Google Play Console'a yüklemek için gereken **tüm dosyalar ve hazır metinler** eksiksiz hazırlanmıştır:

## 1. Yüklemeye Hazır Dosyalar (`play_store_paketi/` Klasörü)
- **Play Store Uygulama Paketi (`.aab`):** `HafizanaGuven-release.aab` *(Google Play Console -> Üretim veya Kapalı Test -> Yeni Sürüm Oluştur ekranına doğrudan bu dosya yüklenir)*
- **Telefonda Doğrudan Test Paketi (`.apk`):** `HafizanaGuven-test.apk` *(Arkadaşlarınla WhatsApp/Telegram üzerinden doğrudan telefona kurup denemek için)*
- **Yükleme İmza Anahtarı Yedeği (`.jks`):** `../hafizana_guven_android/app/hafizana-guven-upload.jks` *(Gelecekteki güncellemelerde aynı imza ile paket üretmek için saklanır — Alias: `hafizana_guven_upload`)*
- **Uygulama İkonu (`512x512`):** `uygulama_ikonu_512x512.png`
- **Özellik Grafiği / Üst Kapak (`1024x500`):** `ozellik_grafigi_1024x500.png`
- **Telefon Ekran Görüntüleri (`1080x1920`, 4 Adet):**
  1. `ekran_goruntusu_1_ana_menu.png`
  2. `ekran_goruntusu_2_oyun_ekrani.png`
  3. `ekran_goruntusu_3_kayip_notalar_ritim.png`
  4. `ekran_goruntusu_4_cok_oyunculu_terminoloji.png`

---

## 2. Ana Mağaza Girişi (Kopyala - Yapıştır Metinleri)

- **Uygulama Adı (En fazla 30 karakter):**
  `Hafızana Güven`

- **Kısa Açıklama (En fazla 80 karakter):**
  `Notaları dinle, sırayı hatırla ve çal! Tam erişilebilir müzik ve hafıza oyunu.`

- **Tam Açıklama (En fazla 4000 karakter):**
```text
Hafızana Güven, işitsel dikkatinizi, müzik kulağınızı ve hafızanızı eğlenceli bir deneyimle geliştiren, TalkBack ve ekran okuyucularla %100 uyumlu bir müzik ve hafıza oyunudur.

Görme engelli bir müzik öğretmeni olan Ümit Ekrem Mikyas tarafından hem görme engelli oyuncular hem de müzikseverler için özenle tasarlanmıştır.

ÖNE ÇIKAN ÖZELLİKLER:

• Klasik Hafıza Modları (Kolay, Orta, Zor):
Bilgisayarın çaldığı nota dizilerini dikkatle dinleyin ve aynı sırayla çalarak seriyi uzatın. Kazandığınız jetonlarla mağazadan Hata Koruması, Zaman Koruması ve Seri Dondurma edinin.

• Zengin Enstrüman Paketleri:
Klasik Piyano tınısının yanı sıra Bağlama, Kaval, Flüt ve Kanun ses paketlerini açarak notaları Türk müziği enstrümanlarıyla deneyimleyin.

• Kayıp Notalar (Sesli Hikaye Modu):
Tamamı Türkçe karakter dublajlı sesli macerada adımlarınızı ve çevresel sesleri dinleyerek fırtınada kaybolan yedi notayı bulun ve piyanoya ulaştırın.

• Ritim Avcısı Modu:
60 BPM'den başlayıp giderek hızlanan metronom eşliğinde notaları ve es boşluklarını doğru zamanlamayla çalarak ritim duygunuzu test edin.

• Müzik Terminolojisi Sözlüğü ve Eşleştirme Sınavı:
Tempo, Dinamik, Artikülasyon ve İfade kategorilerindeki evrensel müzik terimlerini sesli kartlarla öğrenin ve hafıza kartı eşleştirme sınavıyla bilginizi pekiştirin.

• Çok Oyunculu Odalar (1-4 Kişi & Takım Modu):
5 haneli oda kodu oluşturarak arkadaşlarınızla gerçek zamanlı bireysel veya takım düelloları yapın ya da yapay zekaya karşı yarışın.

• %100 Ekran Okuyucu Dostu Erişilebilirlik:
Tüm menüler, oyun içi bildirimler, süre/skor göstergeleri ve yönlendirmeler TalkBack ve diğer ekran okuyucularla kesintisiz çalışacak şekilde optimize edilmiştir.
```

---

## 3. Zorunlu Bağlantılar (Uygulama İçeriği Sekmesi)

- **Gizlilik Politikası URL'si:**
  `https://mikyasstudio.com.tr/hafizana_guven/gizlilik.html`
  *(Yedek URL: `https://cengiz145.github.io/mikyasgame/hafizana_guven/gizlilik.html`)*

- **Veri / Takma Ad Silme URL'si:**
  `https://mikyasstudio.com.tr/hafizana_guven/veri-silme.html`
  *(Ayrıca oyun içinde `Profil > Sunucudaki Verilerimi Sil` düğmesi de aktif olarak yer almaktadır.)*

---

## 4. Play Console "Uygulama İçeriği" Formları Cevap Anahtarı

1. **Reklamlar:** `Hayır, uygulamam reklam içermiyor.`
2. **Uygulama Erişimi:** `Tüm işlevler herhangi bir kısıtlama olmadan kullanılabilir.` (Giriş zorunluluğu yoktur, doğrudan oynanır.)
3. **İçerik Derecelendirmesi (IARC):**
   - Kategori: `Oyun`
   - Şiddet / Korku / Kumar / Cinsellik: Tümü `Hayır`
   - Kullanıcıların birbiriyle etkileşimi (Çevrimiçi sohbet / çok oyunculu): `Evet` (Canlı sohbet ve susturma/engelleme özelliği mevcuttur)
   - Konum paylaşımı: `Hayır`
   - Dijital ürün satışı (Gerçek parayla): `Hayır` (Oyun içi jetonlar tamamen ücretsiz kazanılır, gerçek para satışı yoktur)
4. **Hedef Kitle ve İçerik:** `13+` (veya `13-15, 16-17, 18+` işaretlenirse "Aile Politikası" ek onay süreçlerine takılmadan çok daha hızlı onaylanır; Canlı Sohbet içerdiği için `13+` seçilmesi Google Play standartlarına en uygun seçenektir).
5. **Veri Güvenliği (Data Safety) Formu:**
   - Uygulamanız gerekli kullanıcı verisi türlerinden herhangi birini topluyor veya paylaşıyor mu? → `Evet`
   - Toplanan tüm veriler aktarım sırasında güvenli bağlantı (HTTPS/TLS) ile korunuyor mu? → `Evet`
   - Kullanıcıların verilerinin silinmesini talep etmesi için bir yol sunuyor musunuz? → `Evet` (`https://mikyasstudio.com.tr/hafizana_guven/veri-silme.html`)
   - İşaretlenecek Veri Türleri:
     - **Kişisel Bilgiler > Kullanıcı Kimlikleri:** (İsteğe bağlı takma ad — Uygulama işlevselliği için, üçüncü taraflarla **paylaşılmaz**, isteğe bağlıdır).
     - **Uygulama İçi Mesajlar:** (Canlı sohbet ve geri bildirim mesajları — Uygulama işlevselliği için, **paylaşılmaz**, isteğe bağlıdır).
     - **Cihaz veya Diğer Kimlikler:** (Takma ad çakışmasını önleyen anonim cihaz kodu ve isteğe bağlı FCM bildirim anahtarı — Uygulama işlevselliği için, **paylaşılmaz**).

---

## 5. Yayınlama Adımları (12 Test Kullanıcısı Kuralı)
1. Google Play Console'da **Uygulama Oluştur** diyerek uygulama adını `Hafızana Güven`, dilini `Türkçe`, türünü `Oyun`, ücret durumunu `Ücretsiz` seçin.
2. Yukarıdaki **Gizlilik Politikası**, **Veri Güvenliği**, **İçerik Derecelendirmesi** ve **Ana Mağaza Girişi** görsellerini/metinlerini yükleyin.
3. Yeni bireysel geliştirici hesaplarında önce **Test > Kapalı Test (Closed Testing)** sekmesine girip bir test kanalı açın, `HafizanaGuven-release.aab` dosyasını yükleyin ve en az **12 arkadaşınızın Gmail adresini** test kullanıcısı listesine ekleyin.
4. Arkadaşlarınız kendilerine verdiğiniz Google Play test bağlantısından oyunu indirip **14 gün boyunca** telefonlarında tuttuğunda **Üretime Erişim Başvurusu** düğmesi aktif olur ve tek tıkla oyun herkese açık Play Store'da yayınlanır!
