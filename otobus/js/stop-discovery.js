/* ==========================================================================
   DURAK KEŞİF ALBÜMÜ VE ŞEHİR HAFIZASI SİSTEMİ (STOP DISCOVERY CODEX)
   Mikyas Simülasyon Dünyası - Şoförlük Durak Hafızası ve Keşif Sistemi
   %100 Ekran Okuyucu (NVDA) Uyumlu, Sesli Anonslu, Prim Ödüllü
   ========================================================================== */

const StopDiscovery = {
    STORAGE_KEY: 'tekulas_discovered_stops_v1',
    currentTab: 'Süleymanpaşa',

    knownStops: {
        "Süleymanpaşa": [],
        "Saray": [],
        "Velimeşe": []
    },

    initKnownStops: function() {
        if (typeof SuleymanpasaNavigasyon !== 'undefined' && Array.isArray(SuleymanpasaNavigasyon.sokaklar)) {
            this.knownStops["Süleymanpaşa"] = SuleymanpasaNavigasyon.sokaklar.map(s => s.name);
        }
        if (typeof SarayNavigasyon !== 'undefined' && Array.isArray(SarayNavigasyon.sokaklar)) {
            this.knownStops["Saray"] = SarayNavigasyon.sokaklar.map(s => s.name);
        }
        if (typeof VelimeseNavigasyon !== 'undefined' && Array.isArray(VelimeseNavigasyon.sokaklar)) {
            this.knownStops["Velimeşe"] = VelimeseNavigasyon.sokaklar.map(s => s.name);
        }
    },

    getDiscoveredData: function() {
        try {
            const data = localStorage.getItem(this.STORAGE_KEY);
            return data ? JSON.parse(data) : {};
        } catch(e) {
            return {};
        }
    },

    saveDiscoveredData: function(data) {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
        } catch(e) {}
        if (typeof Game !== 'undefined' && typeof Game.saveData === 'function') {
            Game.saveData();
        }
    },

    onReachStop: function(stopName, district) {
        if (!stopName) return;
        this.initKnownStops();

        const activeDist = district || (typeof Game !== 'undefined' && Game.activeDistrict ? Game.activeDistrict : "Süleymanpaşa");
        const data = this.getDiscoveredData();
        const cleanName = stopName.trim();

        const isNew = !data[cleanName];

        if (isNew) {
            data[cleanName] = {
                name: cleanName,
                district: activeDist,
                firstDiscoveredAt: Date.now(),
                visitCount: 1
            };
            this.saveDiscoveredData(data);

            const districtKnown = this.knownStops[activeDist] || [];
            const districtDiscoveredCount = Object.values(data).filter(d => d.district === activeDist).length;
            const totalCount = districtKnown.length > 0 ? districtKnown.length : 25;

            // Sesli kutlama ve anons
            if (typeof audio !== 'undefined' && audio.playSuccess) {
                try { audio.playSuccess(); } catch(e) {}
            }

            const speechText = `Yeni durak keşfedildi: ${cleanName}! ${activeDist} keşfi: ${districtDiscoveredCount} de ${totalCount}.`;
            if (typeof audio !== 'undefined' && audio.speak) {
                audio.speak(speechText);
            }

            if (typeof UI !== 'undefined' && UI.showToast) {
                UI.showToast(`✨ YENİ DURAK KEŞFEDİLDİ: ${cleanName} (${districtDiscoveredCount}/${totalCount})`, "success");
            }

            // Keşif Primi (+50 ₺ ve +25 XP tecrübe)
            if (typeof Game !== 'undefined' && Game.addMoney) {
                Game.addMoney(50);
            }

            // Rozet kontrolleri
            const totalDiscovered = Object.keys(data).length;
            if (totalDiscovered >= 5 && typeof DriverBadges !== 'undefined' && DriverBadges.unlockBadge) {
                DriverBadges.unlockBadge('mahalle_kasifi');
            }
            if (districtDiscoveredCount >= Math.round(totalCount * 0.8) && typeof DriverBadges !== 'undefined' && DriverBadges.unlockBadge) {
                DriverBadges.unlockBadge('hat_hakimi');
            }
        } else {
            data[cleanName].visitCount = (data[cleanName].visitCount || 1) + 1;
            this.saveDiscoveredData(data);

            if (data[cleanName].visitCount === 3 && typeof audio !== 'undefined' && audio.speak) {
                audio.speak(`${cleanName} durağına 3. seferiniz. Hat hakimiyeti pekişti!`);
            }
        }
    },

    getStats: function(district) {
        this.initKnownStops();
        const data = this.getDiscoveredData();
        const activeDist = district || this.currentTab;
        const allKnown = this.knownStops[activeDist] || [];
        const discovered = Object.values(data).filter(d => d.district === activeDist);

        const total = Math.max(allKnown.length, 1);
        const count = discovered.length;
        const percent = Math.min(100, Math.round((count / total) * 100));

        return {
            district: activeDist,
            discoveredCount: count,
            totalCount: total,
            percent: percent,
            discoveredList: discovered,
            allKnown: allKnown
        };
    },

    renderModal: function(tabDistrict) {
        const modal = document.getElementById('stop-collection-modal');
        if (!modal) return;

        this.initKnownStops();
        if (tabDistrict) this.currentTab = tabDistrict;
        modal.classList.remove('hidden');

        const stats = this.getStats(this.currentTab);

        // Özet başlığı
        const summaryEl = document.getElementById('stop-collection-summary');
        if (summaryEl) {
            summaryEl.innerText = `📍 ${stats.district}: ${stats.discoveredCount} / ${stats.totalCount} Durak Keşfedildi (%${stats.percent} Hat Hakimiyeti)`;
        }

        // İlerleme çubuğu
        const progressFill = document.getElementById('stop-collection-progress-fill');
        if (progressFill) {
            progressFill.style.width = `${stats.percent}%`;
        }

        // Sekme butonları stili
        ['Süleymanpaşa', 'Saray', 'Velimeşe'].forEach(d => {
            const btn = document.getElementById('tab-collect-' + (d === 'Süleymanpaşa' ? 'spasa' : (d === 'Saray' ? 'saray' : 'velimese')));
            if (!btn) return;
            const isAct = (d === this.currentTab);
            btn.style.background = isAct ? 'rgba(56,189,248,0.3)' : 'rgba(255,255,255,0.06)';
            btn.style.borderColor = isAct ? '#38bdf8' : 'rgba(255,255,255,0.2)';
            btn.style.color = isAct ? '#fff' : '#94a3b8';
            btn.style.fontWeight = isAct ? 'bold' : 'normal';
        });

        // Durak listesi oluştur
        const listEl = document.getElementById('stop-collection-list');
        if (listEl) {
            listEl.innerHTML = '';
            const discoveredMap = {};
            stats.discoveredList.forEach(d => { discoveredMap[d.name] = d; });

            stats.allKnown.forEach((stopName, idx) => {
                const isDisc = !!discoveredMap[stopName];
                const info = discoveredMap[stopName];

                const li = document.createElement('li');
                li.style.padding = '12px 14px';
                li.style.marginBottom = '8px';
                li.style.borderRadius = '8px';
                li.style.border = isDisc ? '1px solid rgba(34, 197, 94, 0.4)' : '1px solid rgba(255, 255, 255, 0.08)';
                li.style.background = isDisc ? 'rgba(34, 197, 94, 0.12)' : 'rgba(0, 0, 0, 0.4)';
                li.style.display = 'flex';
                li.style.justifyContent = 'space-between';
                li.style.alignItems = 'center';

                const ariaTxt = isDisc 
                    ? `Keşfedildi: ${stopName}. ${info.visitCount || 1} kez sefer yapıldı.`
                    : `Henüz keşfedilmedi: ${idx + 1}. durak. Sürüş esnasında keşfedin.`;
                li.setAttribute('tabindex', '0');
                li.setAttribute('aria-label', ariaTxt);

                li.innerHTML = isDisc ? `
                    <div>
                        <div style="font-weight: bold; color: #22c55e; font-size: 1.05rem;">✅ ${stopName}</div>
                        <div style="font-size: 0.85rem; color: #cbd5e1; margin-top: 3px;">🏆 ${info.visitCount || 1} kez sefer yapıldı • Hafızaya kaydedildi</div>
                    </div>
                    <span style="font-size: 0.9rem; color: #facc15; font-weight: bold;">+50 ₺ Alındı</span>
                ` : `
                    <div>
                        <div style="color: #94a3b8; font-size: 1rem;">🔒 ${idx + 1}. Keşfedilmemiş Durak</div>
                        <div style="font-size: 0.82rem; color: #64748b; margin-top: 3px;">Bu durağa henüz sefer düzenlenmedi. Sürüş sırasında keşfedin.</div>
                    </div>
                    <span style="font-size: 0.85rem; color: #64748b;">+50 ₺ Prim Bekliyor</span>
                `;

                listEl.appendChild(li);
            });
        }

        const speechNotice = `Durak Keşif Albümü açıldı. ${stats.district} bölgesinde toplam ${stats.totalCount} duraktan ${stats.discoveredCount} tanesi keşfedildi. Yüzde ${stats.percent} hat hakimiyeti. Kapatmak için Esc tuşuna basınız.`;
        if (typeof audio !== 'undefined' && audio.speak) {
            audio.speak(speechNotice);
        }

        if (typeof KeyboardNav !== 'undefined' && KeyboardNav.initForScreen) {
            KeyboardNav.initForScreen();
        }
    },

    closeModal: function() {
        const modal = document.getElementById('stop-collection-modal');
        if (modal) modal.classList.add('hidden');
        if (typeof KeyboardNav !== 'undefined' && KeyboardNav.initForScreen) {
            KeyboardNav.initForScreen();
        }
    },

    init: function() {
        const btnOpen = document.getElementById('btn-open-stop-collection');
        if (btnOpen) {
            btnOpen.addEventListener('click', () => {
                const activeDist = (typeof Game !== 'undefined' && Game.activeDistrict) ? Game.activeDistrict : "Süleymanpaşa";
                this.renderModal(activeDist);
            });
        }

        const btnClose = document.getElementById('btn-stop-collection-close');
        if (btnClose) {
            btnClose.addEventListener('click', () => this.closeModal());
        }

        // Sekme dinleyicileri
        const tabSpasa = document.getElementById('tab-collect-spasa');
        if (tabSpasa) tabSpasa.addEventListener('click', () => this.renderModal('Süleymanpaşa'));

        const tabSaray = document.getElementById('tab-collect-saray');
        if (tabSaray) tabSaray.addEventListener('click', () => this.renderModal('Saray'));

        const tabVelimese = document.getElementById('tab-collect-velimese');
        if (tabVelimese) tabVelimese.addEventListener('click', () => this.renderModal('Velimeşe'));

        // Klavye kısayolu: [K] tuşu ile albümü açma
        window.addEventListener('keydown', (e) => {
            if (e.key === 'k' || e.key === 'K') {
                const titleScreen = document.getElementById('title-screen');
                if (titleScreen && !titleScreen.classList.contains('hidden')) {
                    const modal = document.getElementById('stop-collection-modal');
                    if (modal && modal.classList.contains('hidden')) {
                        const activeDist = (typeof Game !== 'undefined' && Game.activeDistrict) ? Game.activeDistrict : "Süleymanpaşa";
                        this.renderModal(activeDist);
                    }
                }
            } else if (e.key === 'Escape') {
                const modal = document.getElementById('stop-collection-modal');
                if (modal && !modal.classList.contains('hidden')) {
                    this.closeModal();
                }
            }
        });
    }
};

if (typeof window !== 'undefined') {
    window.StopDiscovery = StopDiscovery;
    document.addEventListener('DOMContentLoaded', () => {
        StopDiscovery.init();
    });
}
