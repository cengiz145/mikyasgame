// guncelleme.js - Otomatik Güncelleme ve Sürüm Kontrol Sistemi

// --- Ekran Okuyucu Notu ---
// Bu dosya, oyunun yeni bir versiyonu çıktığında arka planda sessizce kontrol yapıp önbelleği temizlemek içindir.
// Arayüz butonlarıyla hiçbir bağlantısı yoktur, tamamen "kur ve unut" mantığıyla arka planda çalışır.

window.mevcutSurum = window.UYGULAMA_SURUMU || (typeof UYGULAMA_SURUMU !== 'undefined' ? UYGULAMA_SURUMU : null);
window.globalChangelogVersion = null;
window.globalChangelogMessage = null;

window.guncellemeKontrolEt = function (isManual = false) {
    if (isManual && typeof window.announceToScreenReader === 'function') {
        window.announceToScreenReader('Güncellemeler denetleniyor...');
    }
    fetch('version.json?t=' + new Date().getTime())
        .then(response => { if (!response.ok) throw new Error('Network response bad'); return response.json(); })
        .then(data => {
            const visualVersion = document.getElementById("intro-version-display");
            if (visualVersion) visualVersion.textContent = "Sürüm: " + data.version;

            window.globalChangelogVersion = data.version;
            if (data.changelog) {
                window.globalChangelogMessage = data.changelog;
                const smt = document.getElementById('server-message-text');
                if (smt) smt.innerText = data.changelog;
            }

            let currentMsg = 'Oyununuz güncel.';
            if (data.buildId) {
                const dateObj = new Date(data.buildId * 1000);
                const now = new Date();
                const diffMs = Math.max(0, now - dateObj);
                const totalSec = Math.floor(diffMs / 1000);
                const days = Math.floor(totalSec / 86400);
                const hours = Math.floor((totalSec % 86400) / 3600);
                const mins = Math.floor((totalSec % 3600) / 60);
                const secs = totalSec % 60;

                let timeAgoStr = "";
                if (days > 0) timeAgoStr += `${days} gün `;
                if (hours > 0) timeAgoStr += `${hours} saat `;
                if (mins > 0) timeAgoStr += `${mins} dakika `;
                timeAgoStr += `${secs} saniye`;

                const takvimStr = dateObj.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
                currentMsg = `Oyunun güncelleme takvimi: ${takvimStr}. Ve yaklaşık ${timeAgoStr} önce güncellendi.`;
            }

            const updateBtn = document.getElementById('check-updates-btn');
            if (updateBtn) {
                updateBtn.innerText = "Sürüm: " + data.version + (data.buildId ? "" : " (Güncel)");
                updateBtn.setAttribute('aria-label', currentMsg);
            }

            if (!window.mevcutSurum) {
                window.mevcutSurum = data.version;
            } else if (data.version !== window.mevcutSurum) {
                window.mevcutSurum = data.version;

                // Arka planda Service Worker'ı güncelliyoruz
                if ('serviceWorker' in navigator) {
                    navigator.serviceWorker.getRegistrations().then(function(registrations) {
                        for(let registration of registrations) {
                            registration.update();
                        }
                    });
                }

                // Tarayıcı önbelleğini agresif bir şekilde siliyoruz
                if ('caches' in window) {
                    caches.keys().then((names) => {
                        names.forEach((name) => {
                            caches.delete(name);
                        });
                    });
                }

                // KULLANICI İSTEĞİ: Güncelleme bulunduğunda anında önbelleği temizleyip sayfayı yenile (Force Reload)
                if (typeof window.announceToScreenReader === 'function') {
                    window.announceToScreenReader("Oyun güncellendi! Yeni sürüm uygulanıyor, sayfa yenilenecek, lütfen bekleyin...", true);
                }
                
                // Sesleri sustur
                const allAudios = document.querySelectorAll('audio');
                allAudios.forEach(audio => { audio.pause(); });

                // 2 saniye sonra sayfayı tam yenile
                setTimeout(() => {
                    // Sayfayı serverdan zorla yenileme kodu
                    window.location.href = window.location.href.split('?')[0] + '?v=' + new Date().getTime();
                }, 2500);

            } else {
                // Sessizce güncelleme durumunu UI'da tuttuk.
            }
        })
        .catch(err => {
            const visualVersion = document.getElementById("intro-version-display");
            if (visualVersion && !visualVersion.textContent.includes("Çevrimdışı")) {
                visualVersion.textContent = "Sürüm: " + (window.mevcutSurum || "Bilinmiyor") + " (Çevrimdışı)";
            }
            const updateBtn = document.getElementById('check-updates-btn');
            if (updateBtn) {
                updateBtn.innerText = "Güncelleme kontrolü başarısız.";
                updateBtn.setAttribute('aria-label', "Güncelleme kontrolü başarısız oldu. Çevrimdışı olabilirsiniz.");
            }
        });
};
