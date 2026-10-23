/**
 * leaderboard-system.js - Canlı Kaptanlar Sıralaması, Lider Tablosu & Profil Teftiş Sistemi
 * En çok kilometre yapan, en çok yolcu taşıyan, en yüksek ciroya ve unvana sahip kaptanların canlı sıralaması.
 * Geliştirici: Ümit Ekrem Mikyas
 */

(function () {
    'use strict';

    const LeaderboardSystem = {
        currentCategory: 'km', // 'km' | 'passengers' | 'xp' | 'company'
        searchQuery: '',
        _cachedData: [],
        _cacheTimestamp: 0,
        _cacheTTL: 45000, // 45 saniye önbellek (Firebase kotasını %100 korur)
        _isLoading: false,

        // Başlatıcı
        init: function () {
            this.injectModals();
            this.bindEvents();
        },

        // Modal Yapılarını DOM'a Ekle
        injectModals: function () {
            if (document.getElementById('leaderboard-modal')) return;

            const modalHtml = `
            <!-- CANLI KAPTANLAR SIRALAMASI & LİDER TABLOSU MODALI -->
            <div id="leaderboard-modal" class="modal-overlay modal hidden" role="dialog" aria-modal="true" aria-labelledby="leaderboard-title" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.88); z-index: 8650; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(10px);">
                <div class="glass-panel" style="max-width: 780px; width: 94%; padding: 24px 28px; text-align: left; max-height: 90vh; overflow-y: auto; border: 2px solid #10b981; box-shadow: 0 0 35px rgba(16, 185, 129, 0.35);">
                    
                    <!-- Başlık & Kapat Butonu -->
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                        <div>
                            <h2 id="leaderboard-title" style="font-size: 1.8rem; margin: 0; color: #34d399; display: flex; align-items: center; gap: 10px;">
                                <span>🏆</span> Canlı Kaptanlar Sıralaması & Lider Tablosu
                            </h2>
                            <p style="color: #cbd5e1; font-size: 0.92rem; margin: 4px 0 0 0;">
                                Türkiye yollarında en çok mesafe kat eden, en çok yolcu taşıyan ve holding kuran şoförler.
                            </p>
                        </div>
                        <button id="btn-close-leaderboard" class="modern-btn nav-item" style="padding: 7px 16px; background: rgba(239, 68, 68, 0.2); border: 1px solid #ef4444; color: #fca5a5; font-weight: bold; cursor: pointer;" aria-label="Lider Tablosunu Kapat (Esc)">✕ Kapat</button>
                    </div>

                    <!-- Kategori Sekmeleri (4 Büyük Branş) -->
                    <div style="display: flex; gap: 8px; margin-bottom: 14px; flex-wrap: wrap;">
                        <button id="tab-lb-km" class="modern-btn nav-item lb-tab-btn" data-cat="km" style="flex: 1; min-width: 140px; padding: 10px; font-size: 0.92rem; background: rgba(16, 185, 129, 0.3); border: 2px solid #10b981; color: #fff; font-weight: bold; border-radius: 8px; cursor: pointer;" aria-label="En Çok Kilometre Yapanlar Sıralaması">
                            🛣️ En Çok KM (Yol Efendileri)
                        </button>
                        <button id="tab-lb-passengers" class="modern-btn nav-item lb-tab-btn" data-cat="passengers" style="flex: 1; min-width: 140px; padding: 10px; font-size: 0.92rem; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.2); color: #94a3b8; border-radius: 8px; cursor: pointer;" aria-label="En Çok Yolcu Taşıyanlar Sıralaması">
                            👥 En Çok Yolcu (Halk Kaptanı)
                        </button>
                        <button id="tab-lb-xp" class="modern-btn nav-item lb-tab-btn" data-cat="xp" style="flex: 1; min-width: 140px; padding: 10px; font-size: 0.92rem; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.2); color: #94a3b8; border-radius: 8px; cursor: pointer;" aria-label="En Yüksek Seviye ve XP Sıralaması">
                            👑 Seviye & Bröveler
                        </button>
                        <button id="tab-lb-company" class="modern-btn nav-item lb-tab-btn" data-cat="company" style="flex: 1; min-width: 140px; padding: 10px; font-size: 0.92rem; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.2); color: #94a3b8; border-radius: 8px; cursor: pointer;" aria-label="En Büyük Şirket ve Hasılat Sıralaması">
                            🏢 Şirket Hasılatı & Kasa
                        </button>
                    </div>

                    <!-- Canlı Arama ve Yenileme Çubuğu -->
                    <div style="display: flex; gap: 10px; margin-bottom: 14px;">
                        <input type="text" id="leaderboard-search-input" placeholder="🔍 Kaptan adı veya şehir ara..." style="flex: 1; padding: 10px 14px; border-radius: 8px; border: 1.5px solid #334155; background: rgba(15,23,42,0.8); color: #fff; font-size: 0.95rem;" aria-label="Sıralamada kaptan veya şehir ara">
                        <button id="btn-refresh-leaderboard" class="modern-btn nav-item" style="padding: 10px 18px; background: rgba(56, 189, 248, 0.2); border: 1.5px solid #38bdf8; color: #38bdf8; font-weight: bold; border-radius: 8px; cursor: pointer;" aria-label="Sıralamayı Yenile">🔄 Yenile</button>
                    </div>

                    <!-- Kendi Sıralamamız / Şeref Kartı -->
                    <div id="lb-my-rank-banner" style="display: flex; justify-content: space-between; align-items: center; background: linear-gradient(135deg, rgba(16, 185, 129, 0.25), rgba(6, 78, 59, 0.35)); border: 1.5px solid #10b981; border-radius: 8px; padding: 10px 16px; margin-bottom: 14px;">
                        <!-- Dinamik doldurulacak -->
                    </div>

                    <!-- Sıralama Listesi -->
                    <ul id="leaderboard-list" style="list-style: none; padding: 0; margin: 0; max-height: 48vh; overflow-y: auto;">
                        <li style="padding: 24px; text-align: center; color: #94a3b8;">
                            ⏳ Kaptan verileri yükleniyor, lütfen bekleyin...
                        </li>
                    </ul>
                </div>
            </div>

            <!-- DETAYLI KAPTAN PROFİL TEFTİŞ MODALI -->
            <div id="captain-profile-inspector-modal" class="modal-overlay modal hidden" role="dialog" aria-modal="true" aria-labelledby="inspector-captain-name" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.92); z-index: 8750; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(12px);">
                <div class="glass-panel" style="max-width: 620px; width: 92%; padding: 26px; text-align: left; max-height: 90vh; overflow-y: auto; border: 2px solid #facc15; box-shadow: 0 0 35px rgba(250, 204, 21, 0.3);">
                    
                    <!-- Üst Başlık & Kapat Butonu -->
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
                        <div>
                            <span style="font-size: 0.85rem; color: #facc15; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">🎖️ Resmi Şoförlük Teftiş Karnesi</span>
                            <h2 id="inspector-captain-name" style="font-size: 1.7rem; margin: 4px 0 0 0; color: #fff;">
                                Kaptan Ali
                            </h2>
                        </div>
                        <button id="btn-close-inspector" class="modern-btn nav-item" style="padding: 6px 14px; background: rgba(239, 68, 68, 0.2); border: 1px solid #ef4444; color: #fca5a5; font-weight: bold; cursor: pointer;" aria-label="Profil Kartını Kapat (Esc)">✕ Kapat</button>
                    </div>

                    <div id="inspector-body">
                        <!-- Dinamik doldurulacak -->
                    </div>

                    <!-- Canlı Etkileşim Butonları -->
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 18px; border-top: 1px solid rgba(255,255,255,0.12); padding-top: 14px;">
                        <button id="btn-inspector-radio-greet" class="modern-btn nav-item" style="padding: 12px; background: #ea580c; border: 1.5px solid #fb923c; color: #fff; font-weight: bold; border-radius: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px;" aria-label="Telsizden bu kaptana selam gönder">
                            📻 Telsizden Selam Ver
                        </button>
                        <button id="btn-inspector-applaud" class="modern-btn nav-item" style="padding: 12px; background: #059669; border: 1.5px solid #10b981; color: #fff; font-weight: bold; border-radius: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px;" aria-label="Kaptana saygı ve alkış gönder">
                            👏 Alkışla & Tebrik Et
                        </button>
                    </div>
                </div>
            </div>
            `;

            document.body.insertAdjacentHTML('beforeend', modalHtml);
        },

        // Olay Dinleyicileri
        bindEvents: function () {
            // Modalı Kapatma
            const btnClose = document.getElementById('btn-close-leaderboard');
            if (btnClose) btnClose.addEventListener('click', () => this.close());

            const btnCloseInsp = document.getElementById('btn-close-inspector');
            if (btnCloseInsp) btnCloseInsp.addEventListener('click', () => this.closeInspector());

            // Kategori Değiştirme
            document.querySelectorAll('.lb-tab-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const cat = e.currentTarget.getAttribute('data-cat');
                    this.switchCategory(cat);
                });
            });

            // Arama Kutusu
            const searchInput = document.getElementById('leaderboard-search-input');
            if (searchInput) {
                searchInput.addEventListener('input', (e) => {
                    this.searchQuery = e.target.value.toLowerCase().trim();
                    this.renderList();
                });
            }

            // Yenile Butonu
            const btnRefresh = document.getElementById('btn-refresh-leaderboard');
            if (btnRefresh) {
                btnRefresh.addEventListener('click', () => {
                    this.fetchData(true);
                });
            }

            // Başlık Ekranı veya Radar Modalındaki Liderlik Butonu
            document.addEventListener('click', (e) => {
                if (e.target && e.target.closest('#btn-open-leaderboard-from-radar')) {
                    if (typeof Multiplayer !== 'undefined' && Multiplayer.closeRadarModal) {
                        Multiplayer.closeRadarModal();
                    }
                    this.open();
                } else if (e.target && e.target.closest('#btn-open-leaderboard')) {
                    this.open();
                }
            });

            // Escape Tuşu ile Pencereleri Sırayla Kapat
            window.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    const inspModal = document.getElementById('captain-profile-inspector-modal');
                    if (inspModal && !inspModal.classList.contains('hidden')) {
                        this.closeInspector();
                        e.stopPropagation();
                        return;
                    }
                    const lbModal = document.getElementById('leaderboard-modal');
                    if (lbModal && !lbModal.classList.contains('hidden')) {
                        this.close();
                        e.stopPropagation();
                        return;
                    }
                }
            });
        },

        // Firebase'den Verileri Çek (45 Saniye Önbellek Korumalı)
        fetchData: function (forceRefresh = false) {
            const now = Date.now();
            if (!forceRefresh && this._cachedData.length > 0 && (now - this._cacheTimestamp < this._cacheTTL)) {
                this.renderList();
                return;
            }

            this._isLoading = true;
            const listEl = document.getElementById('leaderboard-list');
            if (listEl) {
                listEl.innerHTML = `
                <li style="padding: 24px; text-align: center; color: #38bdf8;">
                    ⏳ Canlı Kaptan Ağı taranıyor, sıralama güncelleniyor...
                </li>`;
            }

            if (!window.db || typeof firebase === 'undefined') {
                console.warn("[Leaderboard] Firebase bağlantısı yok, yerel profil gösteriliyor.");
                this.generateFallbackData();
                this.renderList();
                return;
            }

            const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("Zaman aşımı")), 3500));
            const fetchPromise = window.db.ref('otobus_simulasyonu/kullanicilar').once('value');

            Promise.race([fetchPromise, timeoutPromise])
                .then((snapshot) => {
                    const data = snapshot.val() || {};
                    const parsedList = [];

                    Object.keys(data).forEach(username => {
                        const u = data[username];
                        if (!u) return;

                        // İstatistikleri güvenli normalize et
                        const dStats = u.driverStats || {};
                        const compData = u.companyData || {};
                        const tasks = parseInt(u.completedTasks) || 0;
                        const level = parseInt(u.licenseLevel) || 1;

                        const totalKm = (dStats.totalKm !== undefined) ? Math.round(dStats.totalKm) : (tasks * 22);
                        const totalPassengers = (dStats.totalPassengers !== undefined) ? parseInt(dStats.totalPassengers) : (tasks * 48);
                        const totalTrips = (dStats.totalTrips !== undefined) ? parseInt(dStats.totalTrips) : tasks;
                        const perfectTrips = (dStats.perfectTripsCount !== undefined) ? parseInt(dStats.perfectTripsCount) : Math.round(tasks * 0.75);

                        parsedList.push({
                            username: username,
                            licenseLevel: level,
                            playerXP: parseInt(u.playerXP) || 0,
                            completedTasks: tasks,
                            playerBudget: parseFloat(u.playerBudget) || 0,
                            currentCity: u.currentCity || "Tekirdağ",
                            activeDistrict: u.activeDistrict || "Süleymanpaşa",
                            selectedBusId: u.selectedBusId || "otokar_sultan_mega",
                            equippedTitle: u.equippedTitle || "title_cirak",
                            totalKm: totalKm,
                            totalPassengers: totalPassengers,
                            totalTrips: totalTrips,
                            perfectTrips: perfectTrips,
                            companyName: compData.companyName || "Serbest Kaptan",
                            companyLevel: parseInt(compData.companyLevel) || 1,
                            companyTreasury: parseFloat(compData.companyTreasury) || 50000,
                            totalRevenue: parseFloat(compData.totalRevenue) || 0,
                            satisfactionRating: parseFloat(compData.satisfactionRating) || 4.9,
                            badgesCount: (u.badgesData) ? Object.keys(u.badgesData).length : 0,
                            lastSavedTimestamp: u.lastSavedTimestamp || 0
                        });
                    });

                    // Kendi yerel profilimizi de listeye dahil et / güncelle
                    this.mergeCurrentPlayer(parsedList);

                    this._cachedData = parsedList;
                    this._cacheTimestamp = Date.now();
                    this._isLoading = false;
                    this.renderList();
                })
                .catch(err => {
                    console.warn("[Leaderboard] Canlı çekme uyarısı, yedek veriler devrede:", err);
                    this.generateFallbackData();
                    this.renderList();
                });
        },

        // Şu anki oyuncuyu listeyle harmanla
        mergeCurrentPlayer: function (list) {
            const myName = (typeof Game !== 'undefined' && Game.username) ? Game.username : (localStorage.getItem('otobusUsername') || "Kaptan");
            let myStats = {};
            if (typeof DriverBadges !== 'undefined' && DriverBadges.getLifetimeStats) {
                myStats = DriverBadges.getLifetimeStats();
            }

            const myIdx = list.findIndex(u => u.username.toLowerCase() === myName.toLowerCase());
            const myObj = {
                username: myName,
                licenseLevel: (typeof Game !== 'undefined') ? (Game.licenseLevel || 1) : 1,
                playerXP: (typeof Game !== 'undefined') ? (Game.playerXP || 0) : 0,
                completedTasks: (typeof Game !== 'undefined') ? (Game.completedTasks || 0) : 0,
                playerBudget: (typeof Game !== 'undefined') ? (Game.playerBudget || 0) : 0,
                currentCity: (typeof Game !== 'undefined') ? (Game.currentCity || "Tekirdağ") : "Tekirdağ",
                activeDistrict: (typeof Game !== 'undefined') ? (Game.activeDistrict || "Süleymanpaşa") : "Süleymanpaşa",
                selectedBusId: (typeof BusFleet !== 'undefined') ? BusFleet.getSelectedBusId() : "otokar_sultan_mega",
                equippedTitle: (typeof DriverBadges !== 'undefined') ? DriverBadges.getEquippedTitleId() : "title_cirak",
                totalKm: Math.round(myStats.totalKm || 0),
                totalPassengers: parseInt(myStats.totalPassengers || 0),
                totalTrips: parseInt(myStats.totalTrips || 0),
                perfectTrips: parseInt(myStats.perfectTripsCount || 0),
                companyName: (typeof CompanySystem !== 'undefined' && CompanySystem.data) ? CompanySystem.data.companyName : "Mikyas Seyahat",
                companyLevel: (typeof CompanySystem !== 'undefined' && CompanySystem.data) ? CompanySystem.data.companyLevel : 1,
                companyTreasury: (typeof CompanySystem !== 'undefined' && CompanySystem.data) ? CompanySystem.data.companyTreasury : 50000,
                totalRevenue: (typeof CompanySystem !== 'undefined' && CompanySystem.data) ? CompanySystem.data.totalRevenue : 0,
                satisfactionRating: 4.9,
                badgesCount: (typeof DriverBadges !== 'undefined' && typeof DriverBadges.getTotalUnlockedAllCount === 'function') ? DriverBadges.getTotalUnlockedAllCount() : ((typeof DriverBadges !== 'undefined') ? Object.values(DriverBadges.getBadgesData()).filter(v => v && v.unlocked).length : 0),
                lastSavedTimestamp: Date.now(),
                isMe: true
            };

            if (myIdx >= 0) {
                list[myIdx] = Object.assign(list[myIdx], myObj);
            } else {
                list.push(myObj);
            }
        },

        // İnternet yoksa veya veritabanı boşsa gösterilecek zengin yedek kadro
        generateFallbackData: function () {
            const list = [
                { username: "Usta Kaptan Selim", licenseLevel: 8, playerXP: 6850, totalKm: 14250, totalPassengers: 3840, totalTrips: 180, perfectTrips: 165, currentCity: "Tekirdağ", companyName: "Tekirdağ Ekspres", companyTreasury: 420000, equippedTitle: "title_yol_efendisi" },
                { username: "Dadaş Mehmet", licenseLevel: 7, playerXP: 5200, totalKm: 11800, totalPassengers: 3120, totalTrips: 145, perfectTrips: 130, currentCity: "Erzurum", companyName: "Dadaş Seyahat", companyTreasury: 310000, equippedTitle: "title_gece_kartali" },
                { username: "Kaptan Fatma", licenseLevel: 6, playerXP: 3800, totalKm: 9600, totalPassengers: 2850, totalTrips: 120, perfectTrips: 112, currentCity: "İzmir", companyName: "Ege Güneşi Turizm", companyTreasury: 250000, equippedTitle: "title_ipek_ayak" },
                { username: "Gültekin Kaptan", licenseLevel: 5, playerXP: 2550, totalKm: 7400, totalPassengers: 2100, totalTrips: 95, perfectTrips: 84, currentCity: "İstanbul", companyName: "Marmara Hatları", companyTreasury: 180000, equippedTitle: "title_usta" },
                { username: "Murat Çırak", licenseLevel: 3, playerXP: 850, totalKm: 3800, totalPassengers: 1150, totalTrips: 52, perfectTrips: 46, currentCity: "Tekirdağ (Süleymanpaşa)", companyName: "Sahil Birlik", companyTreasury: 95000, equippedTitle: "title_halk_kahramani" }
            ];
            this.mergeCurrentPlayer(list);
            this._cachedData = list;
            this._cacheTimestamp = Date.now();
            this._isLoading = false;
        },

        // Kategori Değiştir
        switchCategory: function (cat) {
            this.currentCategory = cat;
            document.querySelectorAll('.lb-tab-btn').forEach(btn => {
                if (btn.getAttribute('data-cat') === cat) {
                    btn.style.background = 'rgba(16, 185, 129, 0.3)';
                    btn.style.borderColor = '#10b981';
                    btn.style.color = '#fff';
                } else {
                    btn.style.background = 'rgba(255,255,255,0.06)';
                    btn.style.borderColor = 'rgba(255,255,255,0.2)';
                    btn.style.color = '#94a3b8';
                }
            });

            this.renderList();

            // Ekran okuyucu sesli anonsu
            if (typeof audio !== 'undefined' && audio.speak) {
                const catNames = { km: "Kilometre", passengers: "Yolcu Sayısı", xp: "Seviye ve Deneyim", company: "Şirket Hasılatı" };
                audio.speak(`${catNames[cat]} sıralaması seçildi.`);
            }
        },

        // Sıralamayı ve Arayüzü Ekrana Bas
        renderList: function () {
            const listEl = document.getElementById('leaderboard-list');
            if (!listEl) return;

            let items = [...this._cachedData];

            // 1. Sıralama Algoritması
            if (this.currentCategory === 'km') {
                items.sort((a, b) => (b.totalKm || 0) - (a.totalKm || 0));
            } else if (this.currentCategory === 'passengers') {
                items.sort((a, b) => (b.totalPassengers || 0) - (a.totalPassengers || 0));
            } else if (this.currentCategory === 'xp') {
                items.sort((a, b) => {
                    const diff = (b.playerXP || 0) - (a.playerXP || 0);
                    if (diff !== 0) return diff;
                    return (b.licenseLevel || 1) - (a.licenseLevel || 1);
                });
            } else if (this.currentCategory === 'company') {
                items.sort((a, b) => (b.companyTreasury || 0) - (a.companyTreasury || 0));
            }

            // 2. Arama Filtresi
            if (this.searchQuery) {
                items = items.filter(u => 
                    (u.username && u.username.toLowerCase().includes(this.searchQuery)) ||
                    (u.currentCity && u.currentCity.toLowerCase().includes(this.searchQuery)) ||
                    (u.companyName && u.companyName.toLowerCase().includes(this.searchQuery))
                );
            }

            // 3. Kendi Sıralamamızı Güncelle
            const myName = (typeof Game !== 'undefined' && Game.username) ? Game.username : (localStorage.getItem('otobusUsername') || "Kaptan");
            const myRankIdx = items.findIndex(u => u.username.toLowerCase() === myName.toLowerCase());
            const myBanner = document.getElementById('lb-my-rank-banner');
            if (myBanner) {
                if (myRankIdx >= 0) {
                    const me = items[myRankIdx];
                    let myScoreText = "";
                    if (this.currentCategory === 'km') myScoreText = `${me.totalKm.toLocaleString('tr-TR')} KM`;
                    else if (this.currentCategory === 'passengers') myScoreText = `${me.totalPassengers.toLocaleString('tr-TR')} Yolcu`;
                    else if (this.currentCategory === 'xp') myScoreText = `Seviye ${me.licenseLevel || 1} (${(me.playerXP || 0).toLocaleString('tr-TR')} XP)`;
                    else if (this.currentCategory === 'company') myScoreText = `${Math.round(me.companyTreasury).toLocaleString('tr-TR')} ₺ Kasa`;

                    myBanner.innerHTML = `
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <span style="font-size: 1.5rem;">🌟</span>
                        <div>
                            <div style="color: #6ee7b7; font-weight: bold; font-size: 0.95rem;">SİZİN DERECENİZ:</div>
                            <div style="color: #fff; font-size: 1.1rem; font-weight: bold;">
                                #${myRankIdx + 1}. Sıra: <strong>${me.username}</strong>
                            </div>
                        </div>
                    </div>
                    <div style="text-align: right;">
                        <span style="color: #fde047; font-weight: bold; font-size: 1.15rem;">${myScoreText}</span>
                    </div>
                    `;
                } else {
                    myBanner.innerHTML = `
                    <div style="color: #cbd5e1; font-size: 0.95rem;">
                        👤 Kendi kaptan profiliniz listede aranıyor...
                    </div>`;
                }
            }

            // 4. Listeyi Oluştur
            listEl.innerHTML = '';

            if (items.length === 0) {
                listEl.innerHTML = `
                <li style="padding: 24px; text-align: center; color: #94a3b8; background: rgba(255,255,255,0.03); border-radius: 8px;">
                    Aramanızla eşleşen şoför kaydı bulunamadı.
                </li>`;
                return;
            }

            items.forEach((u, index) => {
                const rankNum = index + 1;
                let medalBadge = `#${rankNum}`;
                let rankColor = "#94a3b8";

                if (rankNum === 1) { medalBadge = "🥇 1."; rankColor = "#facc15"; }
                else if (rankNum === 2) { medalBadge = "🥈 2."; rankColor = "#e2e8f0"; }
                else if (rankNum === 3) { medalBadge = "🥉 3."; rankColor = "#fb923c"; }

                let metricText = "";
                let metricSubText = "";
                if (this.currentCategory === 'km') {
                    metricText = `${(u.totalKm || 0).toLocaleString('tr-TR')} KM`;
                    metricSubText = `${u.totalTrips || 0} Sefer | ${u.perfectTrips || 0} Kusursuz`;
                } else if (this.currentCategory === 'passengers') {
                    metricText = `${(u.totalPassengers || 0).toLocaleString('tr-TR')} Yolcu`;
                    metricSubText = `Ort. ${Math.round((u.totalPassengers || 0) / Math.max(1, u.totalTrips || 1))} kişi/sefer`;
                } else if (this.currentCategory === 'xp') {
                    metricText = `Seviye ${u.licenseLevel}`;
                    metricSubText = `${(u.playerXP || 0).toLocaleString('tr-TR')} XP | ${u.completedTasks || 0} Görev`;
                } else if (this.currentCategory === 'company') {
                    metricText = `${Math.round(u.companyTreasury || 0).toLocaleString('tr-TR')} ₺`;
                    metricSubText = `${u.companyName || 'Şirket'} (Seviye ${u.companyLevel || 1})`;
                }

                const titleObj = this.getTitleInfo(u.equippedTitle);
                const isMe = (u.username.toLowerCase() === myName.toLowerCase());

                const li = document.createElement('li');
                li.style.cssText = `padding: 12px 16px; margin-bottom: 8px; border-radius: 10px; display: flex; justify-content: space-between; align-items: center; background: ${isMe ? 'rgba(16, 185, 129, 0.16)' : 'rgba(255,255,255,0.04)'}; border: 1.5px solid ${isMe ? '#10b981' : 'rgba(255,255,255,0.1)'};`;
                
                li.innerHTML = `
                <div style="display: flex; align-items: center; gap: 14px;">
                    <div style="font-size: 1.3rem; font-weight: bold; color: ${rankColor}; min-width: 44px; text-align: center;">
                        ${medalBadge}
                    </div>
                    <div>
                        <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                            <strong style="font-size: 1.1rem; color: #fff;">${u.username}</strong>
                            ${isMe ? '<span style="background: #10b981; color: #000; font-size: 0.75rem; font-weight: bold; padding: 2px 6px; border-radius: 4px;">SİZ</span>' : ''}
                            <span style="font-size: 0.85rem; color: #fde047; background: rgba(234,179,8,0.18); border: 1px solid rgba(234,179,8,0.3); padding: 1px 7px; border-radius: 4px;">
                                ${titleObj.icon} ${titleObj.name}
                            </span>
                        </div>
                        <div style="color: #94a3b8; font-size: 0.85rem; margin-top: 3px;">
                            📍 ${u.currentCity} | 🏢 ${u.companyName}
                        </div>
                    </div>
                </div>

                <div style="display: flex; align-items: center; gap: 14px;">
                    <div style="text-align: right;">
                        <div style="color: #38bdf8; font-weight: bold; font-size: 1.15rem;">${metricText}</div>
                        <div style="color: #64748b; font-size: 0.78rem;">${metricSubText}</div>
                    </div>
                    <button class="btn-inspect-captain modern-btn nav-item" data-user="${u.username}" style="padding: 7px 12px; font-size: 0.85rem; background: rgba(250, 204, 21, 0.2); border: 1.5px solid #facc15; color: #fef08a; border-radius: 6px; cursor: pointer;" aria-label="${u.username} kaptanın profil karnesini ve başarılarını incele">
                        🔍 İncele
                    </button>
                </div>
                `;

                listEl.appendChild(li);
            });

            // Teftiş Butonlarını Bağla
            listEl.querySelectorAll('.btn-inspect-captain').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const uname = e.currentTarget.getAttribute('data-user');
                    this.openProfileInspector(uname);
                });
            });

            if (typeof KeyboardNav !== 'undefined' && KeyboardNav.initForScreen) {
                KeyboardNav.initForScreen();
            }
        },

        // Unvan Bilgisi Getir
        getTitleInfo: function (titleId) {
            if (typeof DriverBadges !== 'undefined' && Array.isArray(DriverBadges.CAPTAIN_TITLES)) {
                const found = DriverBadges.CAPTAIN_TITLES.find(t => t.id === titleId);
                if (found) return found;
            }
            return { icon: "🌱", name: "Kaptan", category: "Temel Kademe" };
        },

        // Otobüs Bilgisi Getir
        getBusInfo: function (busId) {
            if (typeof BusFleet !== 'undefined' && Array.isArray(BusFleet.buses)) {
                const found = BusFleet.buses.find(b => b.id === busId);
                if (found) return found;
            }
            return { fullName: "Otokar Sultan Mega (8.5m Midibüs)", icon: "🚐", brand: "Otokar" };
        },

        // Seçilen Kaptanın Detaylı Profil Kartını Aç
        openProfileInspector: function (username) {
            const user = this._cachedData.find(u => u.username.toLowerCase() === username.toLowerCase());
            if (!user) return;

            const modal = document.getElementById('captain-profile-inspector-modal');
            const bodyEl = document.getElementById('inspector-body');
            const nameEl = document.getElementById('inspector-captain-name');

            if (!modal || !bodyEl || !nameEl) return;

            nameEl.innerText = user.username;
            const titleObj = this.getTitleInfo(user.equippedTitle);
            const busObj = this.getBusInfo(user.selectedBusId);

            bodyEl.innerHTML = `
            <!-- Ana Unvan & Statü Kartı -->
            <div style="background: rgba(250, 204, 21, 0.12); border: 1.5px solid #facc15; border-radius: 10px; padding: 14px; margin-bottom: 14px; display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <div style="font-size: 1.25rem; font-weight: bold; color: #fef08a;">
                        ${titleObj.icon} ${titleObj.name}
                    </div>
                    <div style="color: #cbd5e1; font-size: 0.85rem; margin-top: 3px;">
                        Kategori: ${titleObj.category || 'Resmi Kaptanlık'} | Seviye ${user.licenseLevel} Şoför
                    </div>
                </div>
                <span style="background: rgba(16, 185, 129, 0.2); border: 1px solid #10b981; color: #34d399; padding: 4px 10px; border-radius: 6px; font-weight: bold; font-size: 0.85rem;">
                    📍 ${user.currentCity}
                </span>
            </div>

            <!-- 4'lü Sürüş İstatistik Matrisi -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 14px;">
                <div style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 10px 12px;">
                    <div style="font-size: 0.8rem; color: #94a3b8;">Toplam Sefer Mesafesi</div>
                    <div style="font-size: 1.25rem; font-weight: bold; color: #38bdf8;">${(user.totalKm || 0).toLocaleString('tr-TR')} KM</div>
                </div>
                <div style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 10px 12px;">
                    <div style="font-size: 0.8rem; color: #94a3b8;">Taşınan Yolcu Sayısı</div>
                    <div style="font-size: 1.25rem; font-weight: bold; color: #4ade80;">${(user.totalPassengers || 0).toLocaleString('tr-TR')} Kişi</div>
                </div>
                <div style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 10px 12px;">
                    <div style="font-size: 0.8rem; color: #94a3b8;">Kusursuz İpek Ayak Seferi</div>
                    <div style="font-size: 1.25rem; font-weight: bold; color: #facc15;">${user.perfectTrips || 0} / ${user.totalTrips || 0}</div>
                </div>
                <div style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 10px 12px;">
                    <div style="font-size: 0.8rem; color: #94a3b8;">Kazanılan Kaptan Brövesi</div>
                    <div style="font-size: 1.25rem; font-weight: bold; color: #c084fc;">🎖️ ${user.badgesCount || 1} Bröve</div>
                </div>
            </div>

            <!-- Aktif Otobüs ve Şirket Bilgisi -->
            <div style="background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.15); border-radius: 8px; padding: 12px; margin-bottom: 10px;">
                <div style="color: #38bdf8; font-weight: bold; font-size: 0.95rem; margin-bottom: 6px;">🚍 Tercih Ettiği Otobüs:</div>
                <div style="color: #fff; font-size: 1rem;">
                    ${busObj.icon} ${busObj.fullName || busObj.name}
                </div>
            </div>

            <div style="background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.15); border-radius: 8px; padding: 12px;">
                <div style="color: #facc15; font-weight: bold; font-size: 0.95rem; margin-bottom: 6px;">🏢 Şirketi & Filo Gücü:</div>
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div style="color: #fff; font-size: 1rem;">
                        <strong>${user.companyName}</strong> (Seviye ${user.companyLevel})
                    </div>
                    <span style="color: #4ade80; font-weight: bold;">
                        ${Math.round(user.companyTreasury || 0).toLocaleString('tr-TR')} ₺ Kasa
                    </span>
                </div>
            </div>
            `;

            // Telsizden Selam Butonu
            const btnGreet = document.getElementById('btn-inspector-radio-greet');
            if (btnGreet) {
                btnGreet.onclick = () => {
                    const myName = (typeof Game !== 'undefined' && Game.username) ? Game.username : "Kaptan";
                    const greetMsg = `Selamlar Kaptan ${user.username}! Karayolu Kanal 19'dan tebrik eder, hayırlı seferler dilerim!`;
                    if (typeof Multiplayer !== 'undefined' && Multiplayer.sendRadioMessage) {
                        Multiplayer.sendRadioMessage(greetMsg);
                    } else if (typeof UI !== 'undefined' && UI.showToast) {
                        UI.showToast(`📻 [Kanal 19] ${myName} ➔ ${user.username}: "Hayırlı seferler kaptanım!"`, "success");
                    }
                    if (typeof audio !== 'undefined' && audio.speak) {
                        audio.speak(`${user.username} kaptana telsizden selam anonsu gönderildi.`);
                    }
                };
            }

            // Alkışla Butonu
            const btnApplaud = document.getElementById('btn-inspector-applaud');
            if (btnApplaud) {
                btnApplaud.onclick = () => {
                    if (typeof audio !== 'undefined' && audio.playSuccess) audio.playSuccess();
                    if (typeof UI !== 'undefined' && UI.showToast) {
                        UI.showToast(`👏 Kaptan ${user.username} tebrik edildi! Saygı ve itibar puanı iletildi.`, "success");
                    }
                    if (typeof audio !== 'undefined' && audio.speak) {
                        audio.speak(`Kaptan ${user.username} alkışlandı. Harika bir meslektaş dayanışması!`);
                    }
                };
            }

            modal.classList.remove('hidden');

            // Sesli Teftiş Brifingi (Ekran Okuyucu Uyumlu)
            if (typeof audio !== 'undefined' && audio.speak) {
                const speech = `Kaptan ${user.username} teftiş karnesi açıldı. Unvanı: ${titleObj.name}. Toplam ${user.totalKm} kilometre ve ${user.totalPassengers} yolcu taşımış. Şirketi: ${user.companyName}.`;
                audio.speak(speech);
            }
        },

        // Teftiş Modalını Kapat
        closeInspector: function () {
            const modal = document.getElementById('captain-profile-inspector-modal');
            if (modal) modal.classList.add('hidden');
        },

        // Ana Liderlik Modalını Aç
        open: function () {
            this.injectModals();
            const modal = document.getElementById('leaderboard-modal');
            if (!modal) return;

            modal.classList.remove('hidden');
            this.fetchData();

            if (typeof audio !== 'undefined' && audio.playSelect) audio.playSelect();
            if (typeof audio !== 'undefined' && audio.speak) {
                audio.speak("Canlı Kaptanlar Sıralaması açıldı. Ok tuşlarıyla listedeki şoförleri inceleyebilirsiniz.");
            }
        },

        // Ana Liderlik Modalını Kapat
        close: function () {
            const modal = document.getElementById('leaderboard-modal');
            if (modal) modal.classList.add('hidden');
            if (typeof KeyboardNav !== 'undefined' && KeyboardNav.initForScreen) {
                KeyboardNav.initForScreen();
            }
        }
    };

    window.LeaderboardSystem = LeaderboardSystem;

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => LeaderboardSystem.init());
    } else {
        LeaderboardSystem.init();
    }
})();
