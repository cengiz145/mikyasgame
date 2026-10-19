/* ==========================================================================
   KAPTAN LİYAKAT ROZETLERİ VE 1500 ŞOFÖR BAŞARISI SİSTEMİ (DRIVER BADGES)
   Mikyas Simülasyon Dünyası - İki Ana Kategoriye Ayrılmış Sistem:
   1. AÇILMIŞ BAŞARILAR (Kazanılan Resmi Başarılar)
   2. AÇILMAYANLAR (Henüz Kazanılmamış Resmi Başarılar)
   %100 Resmi, Oyunu Öğreten Net Açıklamalar ve Tuş Kombinasyonları
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
    currentSuggestedBadge: null,

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

    // --- RASTGELE HEDEF SEÇİCİ (ÖĞRETİCİ GÖREV TAVSİYESİ) ---
    pickRandomMysteryBadge: function(announce = false) {
        const data = this.getBadgesData();
        let locked = this.badges.filter(b => !(data[b.id] && data[b.id].unlocked));

        if (this.currentTier !== 'all') {
            const tierFiltered = locked.filter(b => b.tier === parseInt(this.currentTier));
            if (tierFiltered.length > 0) locked = tierFiltered;
        }

        if (locked.length === 0) {
            this.currentSuggestedBadge = null;
            return null;
        }

        const rand = locked[Math.floor(Math.random() * locked.length)];
        this.currentSuggestedBadge = rand;

        if (announce && typeof audio !== 'undefined') {
            if (typeof audio.playSwitchClick === 'function') audio.playSwitchClick();
            const msg = `Tavsiye edilen hedef: Başarı No ${rand.difficulty}, ${rand.title}. Şart: ${rand.requirement}. Nasıl Yapılır: ${rand.desc}`;
            if (audio.speak) audio.speak(msg);
            if (audio.updateNvdaLiveRegion) audio.updateNvdaLiveRegion(msg);
        }

        return rand;
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

        const unlockedCount = this.getUnlockedCount();
        this.currentTab = (unlockedCount > 0) ? 'unlocked' : 'locked';
        this.currentPage = 1;

        if (this.currentTab === 'locked') {
            this.pickRandomMysteryBadge(false);
        }

        this.renderModal();

        const totalCount = this.badges.length;
        const lockedCount = totalCount - unlockedCount;
        const currentTabName = (this.currentTab === 'unlocked') ? 'Açılmış Başarılar' : 'Açılmayan Başarılar';

        let welcomeSpeech = `1500 Başarı Menüsü açıldı. Şu an ${currentTabName} sekmesindesiniz. Toplam ${totalCount} başarıdan ${unlockedCount} tanesi açıldı, ${lockedCount} tanesi hedeflenmeyi bekliyor.`;

        if (this.currentTab === 'locked' && this.currentSuggestedBadge) {
            welcomeSpeech += ` Tavsiye edilen görev: No ${this.currentSuggestedBadge.difficulty}, ${this.currentSuggestedBadge.title}. Şart: ${this.currentSuggestedBadge.requirement}. Nasıl Yapılır: ${this.currentSuggestedBadge.desc}`;
        }

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
        const randomTargetBox = document.getElementById('random-mystery-target-box');

        if (!listEl) return;
        listEl.innerHTML = '';

        const unlockedCount = this.getUnlockedCount();
        const totalCount = this.badges.length;
        const lockedCount = totalCount - unlockedCount;

        if (tabUnlockedBtn) {
            tabUnlockedBtn.innerText = `🏆 Açılmış Başarılar (${unlockedCount})`;
        }
        if (tabLockedBtn) {
            tabLockedBtn.innerText = `🔒 Açılmayan Başarılar (${lockedCount})`;
        }

        // Aktif sekme stili
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
            if (randomTargetBox) {
                randomTargetBox.style.display = 'none';
            }
        } else {
            if (tabLockedBtn) {
                tabLockedBtn.style.background = 'linear-gradient(135deg, rgba(56, 189, 248, 0.3), rgba(30, 58, 138, 0.3))';
                tabLockedBtn.style.borderColor = '#38bdf8';
                tabLockedBtn.style.color = '#bae6fd';
                tabLockedBtn.style.boxShadow = '0 0 15px rgba(56, 189, 248, 0.2)';
            }
            if (tabUnlockedBtn) {
                tabUnlockedBtn.style.background = 'rgba(255, 255, 255, 0.06)';
                tabUnlockedBtn.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                tabUnlockedBtn.style.color = '#94a3b8';
                tabUnlockedBtn.style.boxShadow = 'none';
            }

            // GÖREV TAVSİYESİ KUTUSU (RESMİ VE ÖĞRETİCİ)
            if (randomTargetBox) {
                if (!this.currentSuggestedBadge || this.isUnlocked(this.currentSuggestedBadge.id)) {
                    this.pickRandomMysteryBadge(false);
                }

                if (this.currentSuggestedBadge) {
                    const r = this.currentSuggestedBadge;
                    randomTargetBox.style.display = 'block';
                    randomTargetBox.innerHTML = `
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                            <div style="display: flex; align-items: center; gap: 8px;">
                                <span style="font-size: 1.3rem;">🎯</span>
                                <span style="font-size: 1.05rem; font-weight: bold; color: #38bdf8;">
                                    Tavsiye Edilen Görev Hedefi
                                </span>
                            </div>
                            <button id="btn-reroll-mystery-target" class="modern-btn nav-item" style="padding: 5px 12px; font-size: 0.85rem; background: rgba(56, 189, 248, 0.2); border: 1px solid #38bdf8; color: #bae6fd; cursor: pointer; border-radius: 6px;" aria-label="Başka bir görev hedefi öner">
                                🎲 Başka Bir Hedef Öner
                            </button>
                        </div>
                        <div style="font-size: 0.95rem; color: #e2e8f0; margin-bottom: 6px;">
                            <strong style="color: #38bdf8;">No #${r.difficulty} • ${r.tierName}:</strong> 
                            <span style="color: #fef08a; font-weight: bold;">${r.title}</span> 
                            <span style="font-size: 0.8rem; padding: 2px 6px; border-radius: 4px; background: rgba(56, 189, 248, 0.15); color: #38bdf8; margin-left: 6px;">${r.category}</span>
                        </div>
                        <div style="font-size: 0.88rem; color: #cbd5e1; margin-bottom: 6px; line-height: 1.4;">
                            📖 <strong>Nasıl Kazanılır:</strong> ${r.desc}
                        </div>
                        <div style="font-size: 0.85rem; color: #facc15; padding-top: 6px; border-top: 1px solid rgba(255,255,255,0.1);">
                            🎯 <strong>Resmi Şart:</strong> ${r.requirement}
                        </div>
                    `;

                    setTimeout(() => {
                        const btnReroll = document.getElementById('btn-reroll-mystery-target');
                        if (btnReroll) {
                            btnReroll.onclick = () => {
                                this.pickRandomMysteryBadge(true);
                                this.renderModal();
                            };
                        }
                    }, 50);
                } else {
                    randomTargetBox.style.display = 'none';
                }
            }
        }

        // Filtreleme
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
                : `🔒 Açılmayan Başarılar: Toplam ${lockedCount} Başarı Bekliyor (Filtrelenen: ${totalFiltered})`;
        }

        if (pageIndicatorEl) {
            pageIndicatorEl.innerText = `Sayfa ${this.currentPage} / ${totalPages} (${totalFiltered} Başarı)`;
        }

        if (btnPrev) btnPrev.disabled = (this.currentPage <= 1);
        if (btnNext) btnNext.disabled = (this.currentPage >= totalPages);

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
                    <strong style="color: #fde047; font-size: 1.15rem;">Henüz Kazanılmış Bir Başarınız Bulunmuyor</strong><br>
                    Seferlere çıkarak, yolcu taşıyarak ve durakları tamamlayarak ilk başarılarınızı hemen kazanmaya başlayabilirsiniz.<br>
                    <button id="btn-switch-to-locked" class="modern-btn nav-item" style="margin-top: 15px; padding: 10px 20px; background: rgba(56, 189, 248, 0.2); border: 1px solid #38bdf8; color: #bae6fd; font-weight: bold; cursor: pointer;">
                        🔒 Açılmayan Başarıları ve Görevleri İncele
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
                    <div style="font-size: 2.2rem; margin-bottom: 10px;">✅</div>
                    <strong style="color: #22c55e; font-size: 1.15rem;">Tebrikler! Bu kategorideki tüm başarılar kazanıldı.</strong>
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
                // AÇILMIŞ BAŞARI KARTI
                btn.style.border = '2px solid #eab308';
                btn.style.background = 'linear-gradient(135deg, rgba(234, 179, 8, 0.18), rgba(202, 138, 4, 0.08))';
                btn.style.boxShadow = '0 0 12px rgba(234, 179, 8, 0.15)';

                const ariaLabel = `Açılmış Başarı No ${badge.difficulty}: ${badge.title}. Kategori: ${badge.category}. Zorluk: ${badge.tierName}. Nasıl Kazanıldı: ${badge.desc}. Şart: ${badge.requirement}. Tarih: ${dateStr || 'Kayıtlı'}. Dinlemek için Enter.`;
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
                            <span style="background: linear-gradient(135deg, #eab308, #ca8a04); color: #000; font-weight: bold; padding: 3px 8px; border-radius: 4px; font-size: 0.8rem;">🎖️ KAZANILDI</span>
                        </div>
                    </div>

                    <div style="font-size: 0.9rem; color: #e2e8f0; margin-bottom: 6px; line-height: 1.35;">
                        📖 <strong>Nasıl Kazanıldı:</strong> ${badge.desc}
                    </div>

                    <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.82rem; padding-top: 4px; border-top: 1px solid rgba(255,255,255,0.08);">
                        <div style="color: #38bdf8;">
                            🎯 <strong>Resmi Şart:</strong> ${badge.requirement}
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
                // AÇILMAYAN RESMİ BAŞARI KARTI (ÖĞRETİCİ TALİMATLAR)
                btn.style.border = '1px solid rgba(56, 189, 248, 0.25)';
                btn.style.background = 'rgba(15, 23, 42, 0.75)';
                btn.style.opacity = '0.95';

                const ariaLabel = `Açılmayan Başarı No ${badge.difficulty}: ${badge.title}. Kategori: ${badge.category}. Zorluk: ${badge.tierName}. Nasıl Kazanılır: ${badge.desc}. Şart: ${badge.requirement}. Dinlemek için Enter.`;
                btn.setAttribute('aria-label', ariaLabel);

                btn.innerHTML = `
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <span style="font-size: 1.25rem;" aria-hidden="true">${badge.icon}</span>
                            <div>
                                <span style="font-size: 0.8rem; color: ${tierColor}; font-weight: bold; margin-right: 6px;">
                                    #${badge.difficulty} • ${badge.tierName}
                                </span>
                                <span style="font-size: 1.05rem; font-weight: bold; color: #cbd5e1;">
                                    ${badge.title}
                                </span>
                                <span style="display: inline-block; margin-left: 6px; font-size: 0.75rem; padding: 1px 6px; border-radius: 4px; background: rgba(56, 189, 248, 0.15); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.3);">
                                    ${badge.category}
                                </span>
                            </div>
                        </div>
                        <div>
                            <span style="background: rgba(148, 163, 184, 0.2); color: #94a3b8; font-weight: bold; padding: 3px 8px; border-radius: 4px; font-size: 0.8rem;">🔒 KİLİTLİ</span>
                        </div>
                    </div>

                    <div style="font-size: 0.88rem; color: #cbd5e1; margin-bottom: 6px; line-height: 1.35;">
                        📖 <strong>Nasıl Kazanılır:</strong> ${badge.desc}
                    </div>

                    <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.82rem; padding-top: 4px; border-top: 1px solid rgba(255,255,255,0.08);">
                        <div style="color: #facc15;">
                            🎯 <strong>Resmi Şart:</strong> ${badge.requirement}
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
            if (!this.currentSuggestedBadge || this.isUnlocked(this.currentSuggestedBadge.id)) {
                this.pickRandomMysteryBadge(false);
            }
            this.renderModal();
            if (typeof audio !== 'undefined' && audio.speak) {
                audio.speak("Açılmayan başarılar sekmesine geçildi.");
            }
        });

        const tierSelect = document.getElementById('badge-tier-select');
        if (tierSelect) {
            tierSelect.addEventListener('change', (e) => {
                this.currentTier = e.target.value;
                this.currentPage = 1;
                this.pickRandomMysteryBadge(false);
                this.renderModal();
            });
        }

        const searchInput = document.getElementById('badge-search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchQuery = e.target.value;
                this.currentPage = 1;
                this.renderModal();
            });
        }

        const btnPrev = document.getElementById('btn-badge-prev-page');
        const btnNext = document.getElementById('btn-badge-next-page');

        if (btnPrev) btnPrev.addEventListener('click', () => this.prevPage());
        if (btnNext) btnNext.addEventListener('click', () => this.nextPage());

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
