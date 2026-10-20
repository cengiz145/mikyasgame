# Proje ve Asistan Kuralları (Antigravity & Gemini)

## Temel Çalışma İlkesi: Uçtan Uca Tam Otonomi
- Kullanıcı (Ümit Ekrem Mikyas) operasyonel teknik işlerle, dosya senkronizasyonlarıyla, terminal komutlarıyla ve git commit/push işlemleriyle uğraşmaz. Bütün bu işler doğrudan asistan tarafından otonom olarak eksiksiz yerine getirilir.
- Yapılan her kod, tasarım veya içerik değişikliğinin ardından:
  1. İlgili dosyalar hem `benim_dunyam` hem de `wep sitem` klasörlerinde güncellenir ve senkronize edilir.
  2. Otomatik olarak Git'e eklenir (`git add .`), anlamlı bir commit mesajıyla kaydedilir (`git commit`) ve GitHub'a (`git push origin main`) gönderilir.
  3. Kullanıcıya "şunu çalıştır", "bunu kopyala", "git push yap" gibi talimatlar verilmez; asistan her adımı kendi çalıştırır ve kullanıcıya yalnızca sonucun özetini sunar.
- Herhangi bir hata veya çakışma durumunda kullanıcıya sormadan önce otonom olarak teşhis konulup giderilir.
