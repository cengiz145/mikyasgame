/* ==========================================================================
   KAPTAN LİYAKAT ROZETLERİ VE 1500 ŞOFÖR BAŞARISI SİSTEMİ (DRIVER BADGES)
   Mikyas Simülasyon Dünyası - İki Ana Kategoriye Ayrılmış Sistem:
   1. AÇILMIŞ BAŞARILAR (Kazanılanlar / Gurur Tablosu)
   2. AÇILMAYANLAR (Gizemli Mühürlü Başarılar / Sır Odası)
   %100 Ekran Okuyucu (NVDA) Uyumlu, Sayfalamalı ve Tam Erişilebilir
   ========================================================================== */

const DriverBadges = {
    STORAGE_KEY: 'tekulas_driver_badges_v2',
    STATS_KEY: 'tekulas_driver_stats_v2',
    currentTab: 'unlocked', // 'unlocked' veya 'locked'
    currentTier: 'all',
    searchQuery: '',
    currentPage: 1,
    pageSize: 30,

    mysteryClues: {
    "sefer_azmi": "Trakya yollarında kontak kapatmadan seferden sefere koşan azimli kaptanların mührü...",
    "yolcu_hizmeti": "Halkın sevgisini ve itimadını kazanıp yolcuları emniyetle taşıyanların mührü...",
    "xp_tecrube": "Direksiyon başında gece gündüz alın teri dökerek tecrübe basamaklarını tırmananların mührü...",
    "ipek_fren": "Çay bardağındaki tek damlayı taşırmayan, sarsıntısız kadife ayakların mührü...",
    "dakiklik": "Durak saatine ve sefer tarifesine saniyesi saniyesine riayet eden intizam abidelerinin mührü...",
    "hasarsiz_surus": "Aracına tek çizik dahi aldırmadan sanayi kapısı görmeyen dikkatli gözlerin mührü...",
    "kazasiz_seri": "Konsantrasyonunu bir an bile bozmadan peş peşe kusursuz sefer zinciri dizenlerin mührü...",
    "gece_nobeti": "Karanlık basınca poyrazın ve yıldızların sesini dinleyen gece muhafızlarının mührü...",
    "engelsiz_ulasim": "Her yolcuya hürmetle yaklaşıp engelleri kaldıran koca yürekli kaptanların mührü...",
    "durak_kesfi": "Şehrin en dar çıkmaz sokaklarını bile hafızasına kazıyan usta kaşiflerin mührü...",
    "hasilat_butce": "Alın teri ve dürüst emekle bilet hasılatından kasa dolduranların mührü...",
    "direksiyon_zamani": "Asfaltın üzerinde ömrünü direksiyona adayan emektar şoförlerin mührü...",
    "yol_mesafesi": "Trakya'yı karış karış arşınlayıp kilometreleri yutan asfalt aşındırıcıların mührü...",
    "emanet_esya": "Son durakta unutulan emaneti namus bilip sahibine ulaştıran dürüstlerin mührü...",
    "ehliyet_prestij": "Şoförlük makamının en yüce mertebelerine erişen büyük başkaptanların mührü..."
},

    get badges() {
        if (typeof window !== 'undefined' && window.ACHIEVEMENTS_1500) {
            return window.ACHIEVEMENTS_1500;
        }
        if (typeof ACHIEVEMENTS_1500 !== 'undefined') {
            return ACHIEVEMENTS_1500;
        }
        return [];
    },

    // --- YEREL VERİ VE İSTATİSTİK YÖNETİMİ ---
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

    getLifetimeStats: function() {
        let stats = {
            totalTrips: 0,
            totalPassengers: 0,
            totalXP: 0,
            totalComfortTrips: 0,
            totalPunctualTrips: 0,
            totalCleanTrips: 0,
            maxCleanStreak: 0,
            currentCleanStreak: 0,
            totalNightTrips: 0,
            totalRampsUsed: 0,
            stopsDiscovered: 0,
            budgetEarned: 0,
            totalDrivingMinutes: 0,
            totalKm: 0,
            totalLostItemsFound: 0,
            licenseLevel: 1
        };

        try {
            const saved = localStorage.getItem(this.STATS_KEY);
            if (saved) {
                stats = Object.assign(stats, JSON.parse(saved));
            }
        } catch(e) {}

        if (typeof Game !== 'undefined') {
            if (Game.completedTasks) stats.totalTrips = Math.max(stats.totalTrips, Game.completedTasks);
            if (Game.playerXP) stats.totalXP = Math.max(stats.totalXP, Game.playerXP);
            if (Game.licenseLevel) stats.licenseLevel = Math.max(stats.licenseLevel, Game.licenseLevel);
            if (Game.playerBudget) stats.budgetEarned = Math.max(stats.budgetEarned, Game.playerBudget);
        }
        if (typeof StopDiscovery !== 'undefined' && StopDiscovery.getDiscoveredStops) {
            stats.stopsDiscovered = Math.max(stats.stopsDiscovered, StopDiscovery.getDiscoveredStops().length);
        }

        return stats;
    },

    saveLifetimeStats: function(stats) {
        try {
            localStorage.setItem(this.STATS_KEY, JSON.stringify(stats));
        } catch(e) {}
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
        return Object.keys(data).filter(k => data[k] && data[k].unlocked).length;
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
                UI.showToast(`🎖️ Yeni Başarı Açıldı: ${badge.title}`, 'success');
            }
        }

        return true;
    },

    // --- SEFER SONU 1500 BAŞARI OTOMATİK KONTROLÜ ---
    checkAfterRoute: function(stats) {
        if (!stats || !stats.isSuccess) return [];

        const lifetime = this.getLifetimeStats();

        lifetime.totalTrips += 1;
        const carried = (typeof Game !== 'undefined' && Game.passengersOnBoard) ? Game.passengersOnBoard : 15;
        lifetime.totalPassengers += carried;
        
        const xpEarned = (typeof stats.earnedXP === 'number') ? stats.earnedXP : 150;
        lifetime.totalXP += xpEarned;

        const moneyEarned = (typeof stats.earnedMoney === 'number') ? stats.earnedMoney : 100;
        lifetime.budgetEarned += moneyEarned;

        const km = (typeof stats.routeDistanceKm === 'number') ? stats.routeDistanceKm : 8;
        lifetime.totalKm += km;

        const drivingSec = (typeof stats.totalDrivingSeconds === 'number') ? stats.totalDrivingSeconds : 180;
        lifetime.totalDrivingMinutes += Math.max(1, Math.round(drivingSec / 60));

        if (typeof stats.passengerComfort === 'number' && stats.passengerComfort >= 90) {
            lifetime.totalComfortTrips += 1;
        }

        if (typeof stats.punctualityScore === 'number' && stats.punctualityScore >= 90) {
            lifetime.totalPunctualTrips += 1;
        }

        if (typeof stats.busHealth === 'number' && stats.busHealth >= 100) {
            lifetime.totalCleanTrips += 1;
            lifetime.currentCleanStreak += 1;
            if (lifetime.currentCleanStreak > lifetime.maxCleanStreak) {
                lifetime.maxCleanStreak = lifetime.currentCleanStreak;
            }
        } else {
            lifetime.currentCleanStreak = 0;
        }

        if (stats.isNight === true) {
            lifetime.totalNightTrips += 1;
        }

        if (stats.rampUsed === true) {
            lifetime.totalRampsUsed += 1;
        }

        if (stats.lostItemFound === true) {
            lifetime.totalLostItemsFound += 1;
        }

        if (typeof StopDiscovery !== 'undefined' && StopDiscovery.getDiscoveredStops) {
            lifetime.stopsDiscovered = StopDiscovery.getDiscoveredStops().length;
        }

        if (typeof Game !== 'undefined' && Game.licenseLevel) {
            lifetime.licenseLevel = Game.licenseLevel;
        }

        this.saveLifetimeStats(lifetime);

        const data = this.getBadgesData();
        const newlyUnlocked = [];

        this.badges.forEach(b => {
            if (data[b.id] && data[b.id].unlocked) return;

            const currentStatVal = lifetime[b.stat] || 0;
            if (currentStatVal >= b.targetValue) {
                this.unlock(b.id, false);
                newlyUnlocked.push(b);
            }
        });

        if (newlyUnlocked.length > 0) {
            setTimeout(() => {
                if (typeof audio !== 'undefined' && typeof audio.playBadgeFanfare === 'function') {
                    audio.playBadgeFanfare();
                }
            }, 600);

            const count = newlyUnlocked.length;
            const topTitle = newlyUnlocked[0].title;
            const announceText = count === 1
                ? `Tebrikler Kaptan! Yeni bir liyakat rozeti kazandınız: ${topTitle}!`
                : `Tebrikler Kaptan! Sefer başarınızla ${count} yeni liyakat rozeti açıldı! İlk rozetiniz: ${topTitle}.`;

            setTimeout(() => {
                if (typeof audio !== 'undefined' && typeof audio.speak === 'function') {
                    audio.speak(announceText);
                }
                if (typeof audio !== 'undefined' && typeof audio.updateNvdaLiveRegion === 'function') {
                    audio.updateNvdaLiveRegion(announceText);
                }
                if (typeof UI !== 'undefined' && typeof UI.showToast === 'function') {
                    UI.showToast(`🎖️ ${count} Yeni Başarı Açıldı: ${topTitle}`, 'success');
                }
            }, 1800);
        }

        return newlyUnlocked;
    },

    // --- MODAL VE ARAYÜZ YÖNETİMİ ---
    openModal: function() {
        const modal = document.getElementById('driver-badges-modal');
        if (!modal) return;

        modal.classList.remove('hidden');

        // Eğer henüz kazanılan başarı yoksa doğrudan Açılmayanlar gizemli sekmesine geç
        const unlockedCount = this.getUnlockedCount();
        this.currentTab = (unlockedCount > 0) ? 'unlocked' : 'locked';
        this.currentPage = 1;
        this.renderModal();

        const totalCount = this.badges.length;
        const lockedCount = totalCount - unlockedCount;
        const currentTabName = (this.currentTab === 'unlocked') ? 'Açılmış Başarılar' : 'Açılmayan Gizemli Başarılar';

        const welcomeSpeech = `Başarılar menüsü açıldı. Şu an ${currentTabName} sekmesindesiniz. Toplam ${totalCount} başarıdan ${unlockedCount} tanesi açıldı, ${lockedCount} tanesi mühürlü bekliyor. Sekmeler arasında Tab tuşu ile geçiş yapabilirsiniz. Kapatmak için Esc tuşuna basınız.`;

        if (typeof audio !== 'undefined') {
            if (typeof audio.playSwitchClick === 'function') audio.playSwitchClick();
            if (typeof audio.speak === 'function') audio.speak(welcomeSpeech);
            if (typeof audio.updateNvdaLiveRegion === 'function') audio.updateNvdaLiveRegion(welcomeSpeech);
        }

        const activeTabBtn = document.getElementById(this.currentTab === 'unlocked' ? 'tab-badges-unlocked' : 'tab-badges-locked');
        if (activeTabBtn) activeTabBtn.focus();

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

        const opener = document.getElementById('btn-open-badges') || document.getElementById('btn-view-badges-results');
        if (opener) opener.focus();

        if (typeof KeyboardNav !== 'undefined' && KeyboardNav.initForScreen) {
            KeyboardNav.initForScreen();
        }
    },

    renderModal: function() {
        const listEl = document.getElementById('driver-badges-list');
        const summaryEl = document.getElementById('driver-badges-summary');
        const pageIndicatorEl = document.getElementById('badge-page-indicator');
        const btnPrev = document.getElementById('btn-badge-prev-page');
        const btnNext = document.getElementById('btn-badge-next-page');

        const tabUnlockedBtn = document.getElementById('tab-badges-unlocked');
        const tabLockedBtn = document.getElementById('tab-badges-locked');

        if (!listEl) return;
        listEl.innerHTML = '';

        const unlockedCount = this.getUnlockedCount();
        const totalCount = this.badges.length;
        const lockedCount = totalCount - unlockedCount;

        if (tabUnlockedBtn) {
            tabUnlockedBtn.innerText = `🏆 Açılmış Başarılar (${unlockedCount})`;
        }
        if (tabLockedBtn) {
            tabLockedBtn.innerText = `🔒 Açılmayanlar (${lockedCount})`;
        }

        // Aktif sekme stilini güncelle
        if (this.currentTab === 'unlocked') {
            if (tabUnlockedBtn) {
                tabUnlockedBtn.style.background = 'linear-gradient(135deg, rgba(234, 179, 8, 0.35), rgba(202, 138, 4, 0.2))';
                tabUnlockedBtn.style.borderColor = '#eab308';
                tabUnlockedBtn.style.color = '#fef08a';
                tabUnlockedBtn.style.boxShadow = '0 0 15px rgba(234, 179, 8, 0.2)';
            }
            if (tabLockedBtn) {
                tabLockedBtn.style.background = 'rgba(255, 255, 255, 0.06)';
                tabLockedBtn.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                tabLockedBtn.style.color = '#94a3b8';
                tabLockedBtn.style.boxShadow = 'none';
            }
        } else {
            if (tabLockedBtn) {
                tabLockedBtn.style.background = 'linear-gradient(135deg, rgba(168, 85, 247, 0.35), rgba(126, 34, 206, 0.2))';
                tabLockedBtn.style.borderColor = '#a855f7';
                tabLockedBtn.style.color = '#e9d5ff';
                tabLockedBtn.style.boxShadow = '0 0 15px rgba(168, 85, 247, 0.2)';
            }
            if (tabUnlockedBtn) {
                tabUnlockedBtn.style.background = 'rgba(255, 255, 255, 0.06)';
                tabUnlockedBtn.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                tabUnlockedBtn.style.color = '#94a3b8';
                tabUnlockedBtn.style.boxShadow = 'none';
            }
        }

        // Sadece seçili sekmenin başarılarını filtrele (Açılmış vs Açılmayanlar)
        let filtered = this.badges.filter(b => {
            const isUn = this.isUnlocked(b.id);
            if (this.currentTab === 'unlocked' && !isUn) return false;
            if (this.currentTab === 'locked' && isUn) return false;

            if (this.currentTier !== 'all' && b.tier !== parseInt(this.currentTier)) {
                return false;
            }

            if (this.searchQuery && this.searchQuery.trim() !== '') {
                const q = this.searchQuery.toLowerCase();
                const matchTitle = b.title.toLowerCase().includes(q);
                const matchDesc = b.desc.toLowerCase().includes(q);
                const matchCat = b.category.toLowerCase().includes(q);
                const matchReq = b.requirement.toLowerCase().includes(q);
                if (!matchTitle && !matchDesc && !matchCat && !matchReq) return false;
            }

            return true;
        });

        const totalFiltered = filtered.length;
        const totalPages = Math.max(1, Math.ceil(totalFiltered / this.pageSize));
        if (this.currentPage > totalPages) this.currentPage = totalPages;
        if (this.currentPage < 1) this.currentPage = 1;

        if (summaryEl) {
            summaryEl.innerText = (this.currentTab === 'unlocked')
                ? `🏆 Açılmış Başarılar: Toplam ${unlockedCount} Başarı Kazanıldı (Filtrelenen: ${totalFiltered})`
                : `🔒 Açılmayan Gizemli Başarılar: Toplam ${lockedCount} Mühürlü Başarı Bekliyor (Filtrelenen: ${totalFiltered})`;
        }

        if (pageIndicatorEl) {
            pageIndicatorEl.innerText = `Sayfa ${this.currentPage} / ${totalPages} (${totalFiltered} Başarı)`;
        }

        if (btnPrev) btnPrev.disabled = (this.currentPage <= 1);
        if (btnNext) btnNext.disabled = (this.currentPage >= totalPages);

        // Sayfa dilimi
        const startIndex = (this.currentPage - 1) * this.pageSize;
        const pageItems = filtered.slice(startIndex, startIndex + this.pageSize);

        if (pageItems.length === 0) {
            const emptyLi = document.createElement('li');
            emptyLi.style.padding = '35px 20px';
            emptyLi.style.textAlign = 'center';
            emptyLi.style.color = '#94a3b8';
            emptyLi.style.fontSize = '1.05rem';
            emptyLi.style.lineHeight = '1.6';

            if (this.currentTab === 'unlocked') {
                emptyLi.innerHTML = `
                    <div style="font-size: 2.2rem; margin-bottom: 10px;">🏆</div>
                    <strong style="color: #fde047; font-size: 1.15rem;">Henüz Açılmış Bir Başarınız Bulunmuyor</strong><br>
                    Seferlere çıkarak, yolcu taşıyarak ve durakları keşfederek ilk rozetlerinizi kazanmaya hemen başlayabilirsiniz!<br>
                    <button id="btn-switch-to-locked" class="modern-btn nav-item" style="margin-top: 15px; padding: 10px 20px; background: rgba(168, 85, 247, 0.25); border: 1px solid #a855f7; color: #e9d5ff; font-weight: bold; cursor: pointer;">
                        🔒 Açılmayan Gizemli Başarıları İncele
                    </button>
                `;
                setTimeout(() => {
                    const btnSwitch = document.getElementById('btn-switch-to-locked');
                    if (btnSwitch) {
                        btnSwitch.onclick = () => {
                            this.currentTab = 'locked';
                            this.currentPage = 1;
                            this.renderModal();
                        };
                    }
                }, 50);
            } else {
                emptyLi.innerHTML = `
                    <div style="font-size: 2.2rem; margin-bottom: 10px;">🎉</div>
                    <strong style="color: #22c55e; font-size: 1.15rem;">İnanılmaz! Bu filtrede tüm başarıları açtınız!</strong><br>
                    Kazanılan başarılarınızı görmek için "Açılmış Başarılar" sekmesine geçebilirsiniz.
                `;
            }

            listEl.appendChild(emptyLi);
            return;
        }

        pageItems.forEach(badge => {
            const isUn = this.isUnlocked(badge.id);
            const dateStr = this.getUnlockedDate(badge.id);

            const li = document.createElement('li');
            li.style.marginBottom = '10px';
            li.style.listStyle = 'none';

            const btn = document.createElement('button');
            btn.className = 'menu-btn nav-item';
            btn.style.width = '100%';
            btn.style.flexDirection = 'column';
            btn.style.alignItems = 'stretch';
            btn.style.textAlign = 'left';
            btn.style.padding = '12px 16px';
            btn.style.borderRadius = '8px';
            btn.style.cursor = 'pointer';
            btn.style.transition = 'all 0.2s ease';

            let tierColor = '#22c55e';
            if (badge.tier === 2) tierColor = '#eab308';
            else if (badge.tier === 3) tierColor = '#f97316';
            else if (badge.tier === 4) tierColor = '#ef4444';
            else if (badge.tier === 5) tierColor = '#a855f7';

            if (isUn) {
                // AÇILMIŞ BAŞARI TASARIMI (Altın ve Zafer Parlaması)
                btn.style.border = '2px solid #eab308';
                btn.style.background = 'linear-gradient(135deg, rgba(234, 179, 8, 0.18), rgba(202, 138, 4, 0.08))';
                btn.style.boxShadow = '0 0 12px rgba(234, 179, 8, 0.15)';

                const ariaLabel = `Açılmış Başarı No ${badge.difficulty}: ${badge.title}. Zorluk: ${badge.tierName}. Kategori: ${badge.category}. Açıklama: ${badge.desc}. Kazanma şartı: ${badge.requirement}. Kazanılma tarihi: ${dateStr || 'Kayıtlı'}. Dinlemek için Enter.`;
                btn.setAttribute('aria-label', ariaLabel);

                btn.innerHTML = `
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <span style="font-size: 1.35rem;" aria-hidden="true">${badge.icon}</span>
                            <div>
                                <span style="font-size: 0.8rem; color: ${tierColor}; font-weight: bold; margin-right: 6px;">
                                    #${badge.difficulty} • ${badge.tierName}
                                </span>
                                <span style="font-size: 1.05rem; font-weight: bold; color: #fef08a;">
                                    ${badge.title}
                                </span>
                                <span style="display: inline-block; margin-left: 6px; font-size: 0.75rem; padding: 1px 6px; border-radius: 4px; background: rgba(56, 189, 248, 0.15); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.3);">
                                    ${badge.category}
                                </span>
                            </div>
                        </div>
                        <div>
                            <span style="background: linear-gradient(135deg, #eab308, #ca8a04); color: #000; font-weight: bold; padding: 3px 8px; border-radius: 4px; font-size: 0.8rem;">🎖️ AÇILDI</span>
                        </div>
                    </div>

                    <div style="font-size: 0.9rem; color: #e2e8f0; margin-bottom: 6px; line-height: 1.35;">
                        ${badge.desc}
                    </div>

                    <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.82rem; padding-top: 4px; border-top: 1px solid rgba(255,255,255,0.08);">
                        <div style="color: #38bdf8;">
                            🎯 <strong>Kazanma Şartı:</strong> ${badge.requirement}
                        </div>
                        <div style="color: #fde047; font-size: 0.8rem;">
                            📅 ${dateStr || 'Kayıtlı'}
                        </div>
                    </div>
                `;

                btn.onclick = () => {
                    if (typeof audio !== 'undefined') {
                        if (typeof audio.playBadgeFanfare === 'function') audio.playBadgeFanfare();
                        if (typeof audio.speak === 'function') audio.speak(ariaLabel);
                        if (typeof audio.updateNvdaLiveRegion === 'function') audio.updateNvdaLiveRegion(ariaLabel);
                    }
                };
            } else {
                // AÇILMAYAN GİZEMLİ BAŞARI TASARIMI (Mühürlü ve Kriptik)
                btn.style.border = '1px dashed rgba(168, 85, 247, 0.35)';
                btn.style.background = 'linear-gradient(135deg, rgba(15, 23, 42, 0.85), rgba(30, 27, 75, 0.4))';
                btn.style.opacity = '0.92';

                // Gizemli başlık ve ipucu mantığı
                const mysteryClueText = this.mysteryClues[badge.stat] || 'Trakya yollarında direksiyon salladıkça bu mühür çözülecek...';
                const mysteryTitle = (badge.tier >= 4)
                    ? `🔒 ??? (Gizemli Mühür #${badge.difficulty})`
                    : `🔒 ${badge.title}`;

                const ariaLabel = `Açılmayan Gizemli Başarı No ${badge.difficulty}: ${mysteryTitle}. Zorluk Derecesi: ${badge.tierName}. Kategori: ${badge.category}. Gizemli İpucu: ${mysteryClueText}. Şart: ${badge.requirement}. Dinlemek için Enter.`;
                btn.setAttribute('aria-label', ariaLabel);

                btn.innerHTML = `
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <span style="font-size: 1.25rem; color: #c084fc;" aria-hidden="true">🗝️</span>
                            <div>
                                <span style="font-size: 0.8rem; color: ${tierColor}; font-weight: bold; margin-right: 6px;">
                                    #${badge.difficulty} • ${badge.tierName}
                                </span>
                                <span style="font-size: 1.05rem; font-weight: bold; color: #cbd5e1;">
                                    ${mysteryTitle}
                                </span>
                                <span style="display: inline-block; margin-left: 6px; font-size: 0.75rem; padding: 1px 6px; border-radius: 4px; background: rgba(168, 85, 247, 0.15); color: #c084fc; border: 1px solid rgba(168, 85, 247, 0.3);">
                                    ${badge.category}
                                </span>
                            </div>
                        </div>
                        <div>
                            <span style="background: rgba(168, 85, 247, 0.2); color: #c084fc; font-weight: bold; padding: 3px 8px; border-radius: 4px; font-size: 0.8rem;">🔒 MÜHÜRLÜ</span>
                        </div>
                    </div>

                    <div style="font-size: 0.88rem; color: #94a3b8; font-style: italic; margin-bottom: 6px; line-height: 1.35;">
                        🔮 <strong>Gizemli Fısıltı:</strong> "${mysteryClueText}"
                    </div>

                    <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.82rem; padding-top: 4px; border-top: 1px solid rgba(255,255,255,0.06);">
                        <div style="color: #facc15;">
                            🎯 <strong>Nasıl Açılır:</strong> ${badge.requirement}
                        </div>
                    </div>
                `;

                btn.onclick = () => {
                    if (typeof audio !== 'undefined') {
                        if (typeof audio.playSwitchClick === 'function') audio.playSwitchClick();
                        if (typeof audio.speak === 'function') audio.speak(ariaLabel);
                        if (typeof audio.updateNvdaLiveRegion === 'function') audio.updateNvdaLiveRegion(ariaLabel);
                    }
                };
            }

            li.appendChild(btn);
            listEl.appendChild(li);
        });

        if (typeof KeyboardNav !== 'undefined' && KeyboardNav.initForScreen) {
            KeyboardNav.initForScreen();
        }
    },

    nextPage: function() {
        this.currentPage++;
        this.renderModal();
        const notice = `Sayfa ${this.currentPage}'e geçildi.`;
        if (typeof audio !== 'undefined' && audio.updateNvdaLiveRegion) audio.updateNvdaLiveRegion(notice);
        const listEl = document.getElementById('driver-badges-list');
        if (listEl) listEl.scrollTop = 0;
    },

    prevPage: function() {
        this.currentPage--;
        this.renderModal();
        const notice = `Sayfa ${this.currentPage}'e geçildi.`;
        if (typeof audio !== 'undefined' && audio.updateNvdaLiveRegion) audio.updateNvdaLiveRegion(notice);
        const listEl = document.getElementById('driver-badges-list');
        if (listEl) listEl.scrollTop = 0;
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

        // İki ana sekme: Açılmış Başarılar ve Açılmayanlar
        const tabUnlocked = document.getElementById('tab-badges-unlocked');
        const tabLocked = document.getElementById('tab-badges-locked');

        if (tabUnlocked) tabUnlocked.addEventListener('click', () => {
            this.currentTab = 'unlocked';
            this.currentPage = 1;
            this.renderModal();
            if (typeof audio !== 'undefined' && audio.speak) {
                audio.speak("Açılmış başarılar sekmesine geçildi.");
            }
        });

        if (tabLocked) tabLocked.addEventListener('click', () => {
            this.currentTab = 'locked';
            this.currentPage = 1;
            this.renderModal();
            if (typeof audio !== 'undefined' && audio.speak) {
                audio.speak("Açılmayan gizemli başarılar sekmesine geçildi.");
            }
        });

        // Zorluk filtresi
        const tierSelect = document.getElementById('badge-tier-select');
        if (tierSelect) {
            tierSelect.addEventListener('change', (e) => {
                this.currentTier = e.target.value;
                this.currentPage = 1;
                this.renderModal();
            });
        }

        // Arama kutusu
        const searchInput = document.getElementById('badge-search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchQuery = e.target.value;
                this.currentPage = 1;
                this.renderModal();
            });
        }

        // Sayfalama butonları
        const btnPrev = document.getElementById('btn-badge-prev-page');
        const btnNext = document.getElementById('btn-badge-next-page');

        if (btnPrev) btnPrev.addEventListener('click', () => this.prevPage());
        if (btnNext) btnNext.addEventListener('click', () => this.nextPage());

        // Klavye kısayolları
        document.addEventListener('keydown', (e) => {
            const modal = document.getElementById('driver-badges-modal');
            if (!modal || modal.classList.contains('hidden')) return;

            if (e.key === 'Escape') {
                this.closeModal();
            } else if (e.key === 'PageDown' || e.key === ']') {
                this.nextPage();
            } else if (e.key === 'PageUp' || e.key === '[') {
                this.prevPage();
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
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DriverBadges;
}
