/* ==========================================================================
   KAPTAN LİYAKAT ROZETLERİ VE ŞOFÖR BAŞARILARI SİSTEMİ (DRIVER BADGES)
   Mikyas Simülasyon Dünyası - Şoförlük Onur ve Liyakat Ödülleri
   %100 Ekran Okuyucu (NVDA) Uyumlu, Sesli Anlatımlı ve Zafer Fanfarlı
   ========================================================================== */

const DriverBadges = {
    STORAGE_KEY: 'tekulas_driver_badges_v1',
    STATS_KEY: 'tekulas_driver_stats_v1',
    currentTab: 'all',

    badges: [
        {
            id: 'ilk_sefer',
            title: 'Çırak Kaptan Rozeti',
            icon: '🥉',
            category: 'Kariyer',
            desc: 'İlk resmi belediye veya şehirlerarası seferini başarıyla tamamlayan şoförlere verilir.',
            requirement: 'Herhangi bir seferi başarıyla tamamla'
        },
        {
            id: 'altin_saat',
            title: 'Altın Saat ve Dakiklik Rozeti',
            icon: '⏱️',
            category: 'Dakiklik',
            desc: 'Sefer tarifesine ve durak saatlerine tam riayet ederek %95 ve üzeri dakiklik sağlayan intizamlı kaptanlara verilir.',
            requirement: '%95 veya üzeri sefer dakikliği elde et'
        },
        {
            id: 'engelsiz_ulasim',
            title: 'Erişilebilirlik ve Nezaket Rozeti',
            icon: '♿',
            category: 'Nezaket',
            desc: 'Durakta tekerlekli sandalyeli yolcuya hürmetle yaklaşıp engelli rampasını (U tuşu) açarak hizmet veren duyarlı kaptanlara verilir.',
            requirement: 'Sefer esnasında tekerlekli sandalye rampasını (U tuşu) açarak hizmet ver'
        },
        {
            id: 'ipek_fren',
            title: 'İpek Fren ve Üstün Konfor Rozeti',
            icon: '🪶',
            category: 'Konfor',
            desc: 'Sarsıntısız kalkışlar ve ipek gibi yumuşak frenleme ile yolcu konfor puanını %95 üzerinde tutan usta kaptanlara verilir.',
            requirement: '%95 veya üzeri yolcu konforu puanı sağla'
        },
        {
            id: 'kazasiz_surus',
            title: 'Sıfır Hasar ve Emniyet Rozeti',
            icon: '🛡️',
            category: 'Emniyet',
            desc: 'Trafikteki diğer araçlara, kasislere ve yayalara karşı azami özen göstererek seferi sıfır hasar ve tek çiziksiz tamamlayan kaptanlara verilir.',
            requirement: 'Otobüse hiç hasar aldırmadan (%100 araç sağlığı) seferi tamamla'
        },
        {
            id: 'emanet_namustur',
            title: 'Dürüst Kaptan ve Emanet Rozeti',
            icon: '🎒',
            category: 'Dürüstlük',
            desc: 'Son durakta araç içini teftiş edip unutulan yolcu çantasını bularak (J tuşu) TEKULAŞ Emanet Bürosu\'na teslim eden ahlaklı kaptanlara verilir.',
            requirement: 'Son durakta unutulan eşyayı arayıp (J tuşu) emanet bürosuna teslim et'
        },
        {
            id: 'gece_kartali',
            title: 'Gece Kartalı Rozeti',
            icon: '🌃',
            category: 'Nöbet',
            desc: 'Karanlık gece vardiyasında farları nizami şekilde açık tutarak zorlu yol koşullarında seferi başarıyla bitiren nöbetçi kaptanlara verilir.',
            requirement: 'Gece vardiyasında (saat 18:00 - 06:00 arası) farlar açık şekilde sefer tamamla'
        },
        {
            id: 'usta_kaptan',
            title: 'Kıdemli Başşoför ve Filo Ustası',
            icon: '👑',
            category: 'Ustalık',
            desc: 'En az 5 farklı resmi seferi başarıyla bitirip direksiyon başında ustalığını ispatlayan kıdemli filo kaptanlarına verilir.',
            requirement: 'En az 5 resmi seferi başarıyla tamamla'
        },
        {
            id: 'emektar_direksiyon',
            title: 'Emektar Direksiyon Rozeti',
            icon: '⏳',
            category: 'Kıdem',
            desc: 'Direksiyon başında saatlerce sabırla, yorulmadan ve emektarca yolcu taşıyan kıdemli kaptanlara verilir.',
            requirement: 'Toplamda en az 30 dakika (oyun içi 2 saatlik vardiya) aktif sürüş yap'
        }
    ],

    // --- YEREL VERİ YÖNETİMİ ---
    getBadgesData: function() {
        try {
            const data = localStorage.getItem(this.STORAGE_KEY);
            return data ? JSON.parse(data) : {};
        } catch (e) {
            return {};
        }
    },

    saveBadgesData: function(data) {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
        } catch (e) {
            console.warn("Rozet verisi kaydedilemedi:", e);
        }
    },

    getTotalTrips: function() {
        try {
            const trips = localStorage.getItem(this.STATS_KEY + '_trips');
            return trips ? parseInt(trips, 10) : 0;
        } catch (e) {
            return 0;
        }
    },

    setTotalTrips: function(count) {
        try {
            localStorage.setItem(this.STATS_KEY + '_trips', count.toString());
        } catch (e) {}
    },

    isUnlocked: function(badgeId) {
        const data = this.getBadgesData();
        return !!(data[badgeId] && data[badgeId].unlocked);
    },

    getUnlockedDate: function(badgeId) {
        const data = this.getBadgesData();
        return (data[badgeId] && data[badgeId].date) ? data[badgeId].date : null;
    },

    getUnlockedCount: function() {
        const data = this.getBadgesData();
        let count = 0;
        this.badges.forEach(b => {
            if (data[b.id] && data[b.id].unlocked) count++;
        });
        return count;
    },

    unlock: function(badgeId, announceNow = true) {
        const data = this.getBadgesData();
        if (data[badgeId] && data[badgeId].unlocked) return false;

        const badge = this.badges.find(b => b.id === badgeId);
        if (!badge) return false;

        const now = new Date();
        const dateStr = now.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' }) + ' ' + 
                        now.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });

        data[badgeId] = {
            unlocked: true,
            date: dateStr
        };
        this.saveBadgesData(data);

        if (announceNow) {
            if (typeof audio !== 'undefined' && typeof audio.playBadgeFanfare === 'function') {
                audio.playBadgeFanfare();
            }
            const msg = `Tebrikler Kaptan! Yeni bir liyakat rozeti kazandınız: ${badge.title}! ${badge.desc}`;
            if (typeof audio !== 'undefined' && typeof audio.speak === 'function') {
                audio.speak(msg);
            }
            if (typeof audio !== 'undefined' && typeof audio.updateNvdaLiveRegion === 'function') {
                audio.updateNvdaLiveRegion(msg);
            }
            if (typeof UI !== 'undefined' && typeof UI.showToast === 'function') {
                UI.showToast(`🎖️ Yeni Rozet: ${badge.title}`, 'success');
            }
        }

        return true;
    },

    // --- SEFER SONU OTOMATİK ROZET KONTROLÜ ---
    checkAfterRoute: function(stats) {
        if (!stats || !stats.isSuccess) return [];

        const totalTrips = this.getTotalTrips() + 1;
        this.setTotalTrips(totalTrips);

        const newlyUnlocked = [];

        this.badges.forEach(badge => {
            if (this.isUnlocked(badge.id)) return;

            let earned = false;
            switch (badge.id) {
                case 'ilk_sefer':
                    earned = (stats.isSuccess === true);
                    break;
                case 'altin_saat':
                    earned = (typeof stats.punctualityScore === 'number' && stats.punctualityScore >= 95);
                    break;
                case 'engelsiz_ulasim':
                    earned = (stats.rampUsed === true);
                    break;
                case 'ipek_fren':
                    earned = (typeof stats.passengerComfort === 'number' && stats.passengerComfort >= 95);
                    break;
                case 'kazasiz_surus':
                    earned = (typeof stats.busHealth === 'number' && stats.busHealth >= 100);
                    break;
                case 'emanet_namustur':
                    earned = (stats.lostItemFound === true);
                    break;
                case 'gece_kartali':
                    earned = (stats.isNight === true && stats.isHeadlightsOn === true);
                    break;
                case 'usta_kaptan':
                    earned = (totalTrips >= 5 || (typeof stats.completedTasks === 'number' && stats.completedTasks >= 5));
                    break;
                case 'emektar_direksiyon':
                    earned = (typeof stats.totalDrivingSeconds === 'number' && stats.totalDrivingSeconds >= 1800);
                    break;
            }

            if (earned) {
                this.unlock(badge.id, false); // Toplu duyuru için sessiz aç
                newlyUnlocked.push(badge);
            }
        });

        if (newlyUnlocked.length > 0) {
            // Zafer arpejini çal
            setTimeout(() => {
                if (typeof audio !== 'undefined' && typeof audio.playBadgeFanfare === 'function') {
                    audio.playBadgeFanfare();
                }
            }, 600);

            // Sesli anons ve ekran okuyucu bildirimi
            const titles = newlyUnlocked.map(b => b.title).join(", ");
            const speechMsg = newlyUnlocked.length === 1 
                ? `Tebrikler Kaptan! Sefer başarınızla yeni bir liyakat rozeti kazandınız: ${newlyUnlocked[0].title}! ${newlyUnlocked[0].desc} Rozetlerinizi ana menüden veya sonuç ekranından inceleyebilirsiniz.`
                : `Tebrikler Kaptan! Sefer başarınızla ${newlyUnlocked.length} yeni liyakat rozeti kazandınız: ${titles}! Rozetlerinizi ana menüden veya sonuç ekranından inceleyebilirsiniz.`;

            setTimeout(() => {
                if (typeof audio !== 'undefined' && typeof audio.speak === 'function') {
                    audio.speak(speechMsg);
                }
                if (typeof audio !== 'undefined' && typeof audio.updateNvdaLiveRegion === 'function') {
                    audio.updateNvdaLiveRegion(speechMsg);
                }
                if (typeof UI !== 'undefined' && typeof UI.showToast === 'function') {
                    UI.showToast(`🎖️ ${newlyUnlocked.length} Yeni Rozet Kazanıldı: ${titles}`, 'success');
                }
            }, 1900);
        }

        return newlyUnlocked;
    },

    // --- MODAL VE ARAYÜZ YÖNETİMİ ---
    openModal: function() {
        const modal = document.getElementById('driver-badges-modal');
        if (!modal) return;

        modal.classList.remove('hidden');
        this.renderModal(this.currentTab || 'all');

        const unlockedCount = this.getUnlockedCount();
        const totalCount = this.badges.length;
        const welcomeSpeech = `Kaptan Liyakat Rozetleri menüsü açıldı. Toplam ${totalCount} rozetten ${unlockedCount} tanesi kazanıldı. Rozetleri incelemek için yön tuşlarıyla veya Tab ile ilerleyebilirsiniz. Kapatmak için Esc tuşuna basınız.`;

        if (typeof audio !== 'undefined') {
            if (typeof audio.playSwitchClick === 'function') audio.playSwitchClick();
            if (typeof audio.speak === 'function') audio.speak(welcomeSpeech);
            if (typeof audio.updateNvdaLiveRegion === 'function') audio.updateNvdaLiveRegion(welcomeSpeech);
        }

        const closeBtn = document.getElementById('btn-badges-modal-close');
        if (closeBtn) closeBtn.focus();

        if (typeof KeyboardNav !== 'undefined' && KeyboardNav.initForScreen) {
            KeyboardNav.initForScreen();
        }
    },

    closeModal: function() {
        const modal = document.getElementById('driver-badges-modal');
        if (modal) modal.classList.add('hidden');

        if (typeof audio !== 'undefined' && typeof audio.playSwitchClick === 'function') {
            audio.playSwitchClick();
        }

        // Açan butona odağı geri ver
        const opener = document.getElementById('btn-open-badges') || document.getElementById('btn-view-badges-results');
        if (opener) opener.focus();

        if (typeof KeyboardNav !== 'undefined' && KeyboardNav.initForScreen) {
            KeyboardNav.initForScreen();
        }
    },

    renderModal: function(filterTab = 'all') {
        this.currentTab = filterTab;
        const listEl = document.getElementById('driver-badges-list');
        const summaryEl = document.getElementById('driver-badges-summary');
        if (!listEl) return;
        listEl.innerHTML = '';

        const unlockedCount = this.getUnlockedCount();
        const totalCount = this.badges.length;
        const lockedCount = totalCount - unlockedCount;

        if (summaryEl) {
            summaryEl.innerText = `Toplam ${totalCount} Rozet • ${unlockedCount} Kazanıldı • ${lockedCount} Kilitli`;
        }

        this.setTabActive(filterTab);

        const filtered = this.badges.filter(b => {
            const isUn = this.isUnlocked(b.id);
            if (filterTab === 'unlocked') return isUn;
            if (filterTab === 'locked') return !isUn;
            return true;
        });

        filtered.forEach(badge => {
            const isUn = this.isUnlocked(badge.id);
            const dateStr = this.getUnlockedDate(badge.id);

            const li = document.createElement('li');
            li.style.marginBottom = '12px';
            li.style.listStyle = 'none';

            const btn = document.createElement('button');
            btn.className = 'menu-btn nav-item';
            btn.style.width = '100%';
            btn.style.flexDirection = 'column';
            btn.style.alignItems = 'stretch';
            btn.style.textAlign = 'left';
            btn.style.padding = '14px 18px';
            btn.style.borderRadius = '10px';
            btn.style.cursor = 'pointer';
            btn.style.transition = 'all 0.25s ease';

            if (isUn) {
                btn.style.border = '2px solid #eab308';
                btn.style.background = 'linear-gradient(135deg, rgba(234, 179, 8, 0.18), rgba(202, 138, 4, 0.08))';
                btn.style.boxShadow = '0 0 15px rgba(234, 179, 8, 0.2)';
            } else {
                btn.style.border = '1px dashed rgba(255, 255, 255, 0.2)';
                btn.style.background = 'rgba(15, 23, 42, 0.65)';
                btn.style.opacity = '0.9';
            }

            const statusBadgeHtml = isUn
                ? `<span style="background: linear-gradient(135deg, #eab308, #ca8a04); color: #000; font-weight: bold; padding: 4px 10px; border-radius: 6px; font-size: 0.85rem; letter-spacing: 0.5px;">🎖️ KAZANILDI</span>`
                : `<span style="background: rgba(148, 163, 184, 0.2); color: #94a3b8; font-weight: bold; padding: 4px 10px; border-radius: 6px; font-size: 0.85rem;">🔒 KİLİTLİ</span>`;

            const dateHtml = (isUn && dateStr)
                ? `<span style="color: #fde047; font-size: 0.85rem; font-weight: normal; margin-left: 8px;">(${dateStr})</span>`
                : '';

            const ariaLabel = isUn
                ? `${badge.title}. Durum: Kazanıldı. Tarih: ${dateStr || 'Kayıtlı'}. Kategori: ${badge.category}. Açıklama: ${badge.desc}. Kazanma şartı: ${badge.requirement}. Detayları dinlemek için tıklayın.`
                : `${badge.title}. Durum: Kilitli. Kategori: ${badge.category}. Nasıl kazanılır: ${badge.requirement}. Detayları dinlemek için tıklayın.`;
            
            btn.setAttribute('aria-label', ariaLabel);

            btn.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <span style="font-size: 1.6rem;" aria-hidden="true">${isUn ? badge.icon : '🔒'}</span>
                        <div>
                            <span style="font-size: 1.2rem; font-weight: bold; color: ${isUn ? '#fef08a' : '#cbd5e1'};">
                                ${badge.title}
                            </span>
                            <span style="display: inline-block; margin-left: 8px; font-size: 0.8rem; padding: 2px 8px; border-radius: 4px; background: rgba(56, 189, 248, 0.15); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.3);">
                                ${badge.category}
                            </span>
                        </div>
                    </div>
                    <div>${statusBadgeHtml}</div>
                </div>

                <div style="font-size: 0.95rem; color: ${isUn ? '#e2e8f0' : '#94a3b8'}; margin-bottom: 8px; line-height: 1.45;">
                    ${badge.desc}
                </div>

                <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.88rem; padding-top: 6px; border-top: 1px solid rgba(255,255,255,0.08);">
                    <div style="color: ${isUn ? '#38bdf8' : '#facc15'};">
                        🎯 <strong>${isUn ? 'Kazanma Şartı:' : 'Nasıl Kazanılır:'}</strong> ${badge.requirement}
                    </div>
                    <div>${dateHtml}</div>
                </div>
            `;

            btn.onclick = () => {
                if (typeof audio !== 'undefined') {
                    if (isUn && typeof audio.playBadgeFanfare === 'function') {
                        audio.playBadgeFanfare();
                    } else if (typeof audio.playSwitchClick === 'function') {
                        audio.playSwitchClick();
                    }
                    if (typeof audio.speak === 'function') {
                        audio.speak(ariaLabel);
                    }
                    if (typeof audio.updateNvdaLiveRegion === 'function') {
                        audio.updateNvdaLiveRegion(ariaLabel);
                    }
                }
            };

            li.appendChild(btn);
            listEl.appendChild(li);
        });

        if (typeof KeyboardNav !== 'undefined' && KeyboardNav.initForScreen) {
            KeyboardNav.initForScreen();
        }
    },

    setTabActive: function(tab) {
        const tabs = [
            { id: 'tab-badges-all', key: 'all' },
            { id: 'tab-badges-unlocked', key: 'unlocked' },
            { id: 'tab-badges-locked', key: 'locked' }
        ];

        tabs.forEach(t => {
            const el = document.getElementById(t.id);
            if (!el) return;
            if (t.key === tab) {
                el.style.background = 'rgba(234, 179, 8, 0.25)';
                el.style.borderColor = '#eab308';
                el.style.color = '#fde047';
            } else {
                el.style.background = 'rgba(255, 255, 255, 0.08)';
                el.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                el.style.color = '#94a3b8';
            }
        });
    },

    init: function() {
        const btnOpen = document.getElementById('btn-open-badges');
        if (btnOpen) {
            btnOpen.addEventListener('click', () => this.openModal());
        }

        const btnOpenResults = document.getElementById('btn-view-badges-results');
        if (btnOpenResults) {
            btnOpenResults.addEventListener('click', () => this.openModal());
        }

        const btnClose = document.getElementById('btn-badges-modal-close');
        if (btnClose) {
            btnClose.addEventListener('click', () => this.closeModal());
        }

        const tabAll = document.getElementById('tab-badges-all');
        const tabUnlocked = document.getElementById('tab-badges-unlocked');
        const tabLocked = document.getElementById('tab-badges-locked');

        if (tabAll) tabAll.addEventListener('click', () => this.renderModal('all'));
        if (tabUnlocked) tabUnlocked.addEventListener('click', () => this.renderModal('unlocked'));
        if (tabLocked) tabLocked.addEventListener('click', () => this.renderModal('locked'));

        // ESC tuşu ile modalı kapatma
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const modal = document.getElementById('driver-badges-modal');
                if (modal && !modal.classList.contains('hidden')) {
                    this.closeModal();
                }
            }
        });
    }
};

if (typeof window !== 'undefined') {
    window.DriverBadges = DriverBadges;
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => DriverBadges.init());
    } else {
        DriverBadges.init();
    }
}
