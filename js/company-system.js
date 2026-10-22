/**
 * company-system.js - Akıllı Şirket & Filo Yönetimi, Dinamik Borsa, Şoför AI & Otomatik Sefer Optimizasyonu
 * Şoför Karakterleri, Gerçek Araç Tahsisi, Sinerji Algoritmaları, Dinamik Piyasa Talepleri ve Başharekât Yönetimi
 * Geliştirici: Ümit Ekrem Mikyas
 */

(function () {
    'use strict';

    const CompanySystem = {
        STORAGE_KEY: 'otobus_company_data_v2',
        COMMUNITY_STORAGE_KEY: 'otobus_community_companies_v1',
        LEGACY_STORAGE_KEY: 'otobus_company_data',

        data: {
            companyName: "Mikyas Seyahat & Turizm",
            foundedDate: Date.now(),
            totalRevenue: 0,
            completedTripsCount: 0,
            companyLevel: 1, // 1: Yazıhane, 2: Bölge Acentesi, 3: Marmara Lojistik, 4: Ulusal Karayolları, 5: Uluslararası Holding
            companyTreasury: 50000,        // Şirket Kasası Bakiyesi (₺)
            revenueSharePercent: 50,       // %50 Şirket Kasasına, %50 Kaptana (Serbestçe değiştirilebilir)
            cateringPackage: 'standart',   // 'ekonomik' | 'standart' | 'vip'
            institutions: {
                headquarters: 1,       // 1. Merkez Yönetim Ofisi / Genel Müdürlük (B1 Yasal Zorunluluk)
                bus_garage: 1,         // 2. Araç Park Sahası / Garaj (B1 Yasal Zorunluluk)
                terminal_offices: 1,   // 3. Otogar Yazıhaneleri & Peron Ağı (B1 Yasal & Operasyonel)
                maintenance_depot: 1,  // 4. Bakım, Onarım ve Yıkama Atölyesi (Kademe Binası)
                driver_lodging: 1,     // 5. Personel Dinlenme Evi / Kaptan Lojmanı (Takograf İhtiyacı)
                city_agencies: 1       // 6. Şehir İçi Bilet Satış Acenteleri & Terminal Shuttle
            },
            satisfactionRating: 4.9,       // 1.0 - 5.0 (Yıldız Değerlendirmesi)
            terminalBranches: {            // Otogar Yazıhaneleri
                tekirdag: true,
                corlu: false,
                istanbul_esenler: false,
                ankara_asti: false,
                izmir_otogar: false
            },
            ticketPricingMultiplier: 1.0,  // 0.8: Halk (%100 Doluluk), 1.0: Standart, 1.3: Ekspres, 1.6: VIP
            facilityContract: 'standart',  // Dinlenme Tesisi Anlaşması
            hqUpgrades: {
                fuelContract: false,       // %20 yakıt tasarrufu
                luxuryLounge: false,       // %50 hızlı şoför dinlenmesi & enerji
                terminalPlatform: false,   // +%25 yolcu talebi
                corporateBrand: false      // +%25 bilet marka primi
            },
            busConditions: {},             // busId -> 0-100 kondisyon
            hiredDrivers: [],
            marketTrends: {},              // routeId -> { multiplier, trendName, icon, desc, expiresAt }
            specialContracts: [],          // Aktif VIP ihaleler
            radioLogs: [],                 // Canlı telsiz kayıtları
            bankruptcyWarned250k: false,   // -250.000 ₺ Sarı Alarm Uyarısı Yapıldı mı
            bankruptcyWarned750k: false,   // -750.000 ₺ Kırmızı Alarm Uyarısı Yapıldı mı
            bankruptcyCount: 0             // Toplam İflas ve Tasfiye Sayısı
        },

        BANKRUPTCY_LIMIT: -1000000,     // Resmi İflas ve Tasfiye Eşiği (-1.000.000 ₺)
        WARNING_YELLOW: -250000,       // Finansal Risk Sarı Alarmı (-250.000 ₺)
        WARNING_RED: -750000,          // Kritik İflas Kırmızı Alarmı (-750.000 ₺),

        // Türkçe Tarih Formatlayıcı
        formatTurkishDate: function(timestamp) {
            try {
                const d = new Date(timestamp || Date.now());
                const months = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
                return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
            } catch(e) {
                return "22 Ekim 2026";
            }
        },

        // Topluluk / Kaptan Şirketlerini Getir
        getCaptainCompanies: function() {
            try {
                const raw = localStorage.getItem(this.COMMUNITY_STORAGE_KEY);
                if (raw) {
                    const parsed = JSON.parse(raw);
                    if (Array.isArray(parsed)) return parsed;
                }
            } catch(e) {
                console.warn("[CompanySystem] Kaptan şirketleri okunamadı:", e);
            }
            return [];
        },

        // Yeni Kaptan Şirketi Kaydet / Tescille
        registerCaptainCompany: function(compData) {
            let list = this.getCaptainCompanies();
            const id = compData.id || ('captain_comp_' + Date.now());
            const existingIdx = list.findIndex(c => c.id === id || (c.name && compData.name && c.name.toLowerCase() === compData.name.toLowerCase()));

            const companyObj = {
                id: id,
                name: compData.name || "Kaptan Turizm",
                founder: compData.founder || (typeof Game !== 'undefined' && Game.username) || "Ümit Ekrem Mikyas",
                slogan: compData.slogan || "Özel Kaptan Taşımacılığı",
                logo: compData.logo || "👑",
                badge: "⭐ Kaptan Şirketi",
                color: "#f59e0b",
                city: compData.city || (typeof Game !== 'undefined' && Game.currentCity) || "Tekirdağ (Süleymanpaşa)",
                maxCaptainsQuota: parseInt(compData.maxCaptainsQuota) || 10,
                activeCaptainsCount: parseInt(compData.activeCaptainsCount) || 1,
                dailySalary: parseInt(compData.dailySalary) || 2500,
                bonusPercent: parseInt(compData.bonusPercent) || 18,
                companySharePercent: (compData.companySharePercent !== undefined) ? parseInt(compData.companySharePercent) : 50,
                treasury: parseInt(compData.treasury) || 50000,
                desc: compData.desc || `Kurucu Kaptan ${compData.founder || 'Kaptan'} tarafından kurulan bağımsız filo. Kontenjan: ${compData.maxCaptainsQuota || 10} kaptan, Günlük Maaş: ${(parseInt(compData.dailySalary) || 2500).toLocaleString('tr-TR')} ₺.`,
                minLevel: 1,
                isCaptainCompany: true,
                createdDate: compData.createdDate || Date.now()
            };

            if (existingIdx >= 0) {
                list[existingIdx] = Object.assign(list[existingIdx], companyObj);
            } else {
                list.unshift(companyObj);
            }

            try {
                localStorage.setItem(this.COMMUNITY_STORAGE_KEY, JSON.stringify(list));
            } catch(e) {}

            try {
                if (typeof window !== 'undefined' && window.db) {
                    window.db.ref('otobus_simulasyonu/topluluk_sirketleri/' + id).set(companyObj).catch(() => {});
                }
            } catch(e) {}

            return companyObj;
        },

        // Şirket Kasasına Hasılat Ekleme
        addCompanyRevenue: function(amount) {
            if (!amount || amount <= 0) return;
            this.data.companyTreasury = (this.data.companyTreasury || 0) + amount;
            this.data.totalRevenue = (this.data.totalRevenue || 0) + amount;

            // Eğer bir kaptan şirketinde çalışılıyorsa, o şirketin topluluk kasasına da yansıt
            if (this.data.corporateEmployer) {
                let captains = this.getCaptainCompanies();
                const target = captains.find(c => c.id === this.data.corporateEmployer);
                if (target) {
                    target.treasury = (target.treasury || 0) + amount;
                    try {
                        localStorage.setItem(this.COMMUNITY_STORAGE_KEY, JSON.stringify(captains));
                    } catch(e) {}
                }
            }

            this.saveData();
            if (typeof this.renderCompanyOverview === 'function') {
                this.renderCompanyOverview();
            }
        },

        // Hasılat Paylaşım Oranını Ayarla (Serbest Belirleme)
        setRevenueSharePercent: function(percent) {
            let val = parseInt(percent);
            if (isNaN(val)) val = 50;
            val = Math.max(0, Math.min(100, val));

            this.data.revenueSharePercent = val;

            // Kendi kurduğu kaptan şirketi varsa oraya da uygula
            let captains = this.getCaptainCompanies();
            const ownComp = captains.find(c => c.name && this.data.companyName && c.name.toLowerCase() === this.data.companyName.toLowerCase());
            if (ownComp) {
                ownComp.companySharePercent = val;
                try {
                    localStorage.setItem(this.COMMUNITY_STORAGE_KEY, JSON.stringify(captains));
                } catch(e) {}
            }

            this.saveData();
            this.renderAll();

            const msg = `Hasılat paylaşım oranı güncellendi: Yüzde ${val} şirket kasasına aktarılacak, yüzde ${100 - val} kaptan cüzdanına kalacaktır.`;
            if (typeof audio !== 'undefined' && audio.speak) audio.speak(msg);
            if (typeof UI !== 'undefined' && UI.showToast) {
                UI.showToast(`📊 Hasılat Bölüşümü: %${val} Şirket / %${100 - val} Kaptan`, 'success');
            }
        },

        // Serbest Hasılat Oranı Ayarlama Penceresi
        openShareCustomModal: function() {
            const current = this.data.revenueSharePercent !== undefined ? this.data.revenueSharePercent : 50;
            const input = prompt(
                "Şirket Kasasına Aktarılacak Yüzdeyi Belirleyin (0 ile 100 arasında bir sayı girin):\n\n" +
                "Örnekler:\n" +
                "• 50: %50 Şirket / %50 Kaptan (Standart & Önerilen)\n" +
                "• 40: %40 Şirket / %60 Kaptan (Kaptan Teşvikli)\n" +
                "• 30: %30 Şirket / %70 Kaptan (Yüksek Kaptan Payı)\n" +
                "• 60: %60 Şirket / %40 Kaptan (Şirket Büyüme)\n" +
                "• 70: %70 Şirket / %30 Kaptan (Filo Yatırımı)\n" +
                "• 0: %0 Şirket / %100 Kaptan (Tamamı Kaptana Kalsın)\n" +
                "• 100: %100 Şirket / %0 Kaptan (Tamamı Şirkete Aktarılsın)\n\n" +
                "Kalan miktar otomatik olarak kaptan cüzdanına aktarılacaktır.",
                current
            );

            if (input !== null) {
                const parsed = parseInt(input.trim());
                if (!isNaN(parsed) && parsed >= 0 && parsed <= 100) {
                    this.setRevenueSharePercent(parsed);
                } else {
                    if (typeof UI !== 'undefined' && UI.showToast) UI.showToast("Lütfen 0 ile 100 arasında geçerli bir yüzde girin.", "warning");
                }
            }
        },

        // Cüzdandan Şirket Kasasına Para Yatır
        transferToTreasury: function() {
            if (typeof Game === 'undefined') return;
            const curBudget = Game.playerBudget || 0;
            if (curBudget <= 0) {
                if (typeof UI !== 'undefined' && UI.showToast) UI.showToast("Cüzdanınızda para bulunmuyor.", "warning");
                return;
            }

            const input = prompt(`Şirket kasasına yatırmak istediğiniz tutarı girin (Mevcut Cüzdanınız: ${curBudget.toLocaleString('tr-TR')} ₺):`, "5000");
            if (input !== null) {
                const amt = parseInt(input.trim());
                if (!isNaN(amt) && amt > 0) {
                    if (amt > curBudget) {
                        if (typeof UI !== 'undefined' && UI.showToast) UI.showToast("Cüzdanınızda bu kadar para yok!", "warning");
                        return;
                    }
                    Game.playerBudget -= amt;
                    Game.saveData();
                    this.data.companyTreasury = (this.data.companyTreasury || 0) + amt;
                    this.recordTransaction('income', 'dividends', 'Kaptan Şahsi Sermaye Enjeksiyonu', amt);
                    this.saveData();
                    this.renderAll();
                    this.checkBankruptcyStatus();

                    const msg = `${amt.toLocaleString('tr-TR')} ₺ cüzdanınızdan şirket kasasına aktarıldı. Yeni Kasa Bakiyesi: ${this.data.companyTreasury.toLocaleString('tr-TR')} ₺.`;
                    if (typeof audio !== 'undefined' && audio.speak) audio.speak(msg);
                    if (typeof UI !== 'undefined' && UI.showToast) UI.showToast(msg, "success");
                    if (typeof UI !== 'undefined' && UI.updatePlayerStats) {
                        UI.updatePlayerStats(Game.licenseLevel, Game.completedTasks, Game.playerBudget, Game.getLicenseTitle());
                    }
                }
            }
        },

        // Şirket Kasasından Cüzdana Para Çek
        transferToWallet: function() {
            const curTreasury = (this.data.companyTreasury !== undefined) ? this.data.companyTreasury : 50000;
            const maxCreditAvailable = curTreasury - this.BANKRUPTCY_LIMIT; // Azami çekilebilecek tutar

            if (maxCreditAvailable <= 0) {
                const failMsg = "Şirket borçlanma tavanına (-1.000.000 ₺) ulaşılmıştır. Daha fazla fon çekilemez!";
                if (typeof UI !== 'undefined' && UI.showToast) UI.showToast(failMsg, "error");
                if (typeof audio !== 'undefined' && audio.speak) audio.speak(failMsg);
                return;
            }

            let promptMsg = `Cüzdanınıza çekmek istediğiniz tutarı girin (Mevcut Kasa: ${curTreasury.toLocaleString('tr-TR')} ₺):\n\n`;
            if (curTreasury > 0) {
                promptMsg += `• Kasada ${curTreasury.toLocaleString('tr-TR')} ₺ nakit mevcuttur.\n`;
                promptMsg += `• Dilerseniz şirketi borçlandırarak (Ticari KMH Kredisi) daha yüksek tutar çekebilirsiniz.\n`;
            } else {
                promptMsg += `⚠️ Şirket kasası şu anda borçtadır (${curTreasury.toLocaleString('tr-TR')} ₺).\n`;
                promptMsg += `• Ticari KMH Finansmanı ile şahsi cüzdanınıza para çekmeye devam edebilirsiniz.\n`;
            }
            promptMsg += `• DİKKAT: Şirket borcu -1.000.000 ₺'ye ulaşırsa Asliye Ticaret Mahkemesi şirketi RESMEN İFLAS ettirir ve tasfiye eder! (Kişisel cüzdanınız, araçlarınız ve ehliyetiniz korunur).\n\n` +
                         `Maksimum çekilebilecek kredi limiti: ${maxCreditAvailable.toLocaleString('tr-TR')} ₺`;

            const defVal = curTreasury > 0 ? String(Math.min(curTreasury, 10000)) : "50000";
            const input = prompt(promptMsg, defVal);
            if (input !== null) {
                const amt = parseInt(input.trim());
                if (!isNaN(amt) && amt > 0) {
                    if (amt > maxCreditAvailable) {
                        const limitMsg = `Bu tutarı çekemezsiniz! Çekebileceğiniz azami tutar ${maxCreditAvailable.toLocaleString('tr-TR')} ₺'dir. (Daha fazlası şirket borcunu -1.000.000 ₺ iflas eşiğinin de altına düşürür).`;
                        if (typeof UI !== 'undefined' && UI.showToast) UI.showToast(limitMsg, "warning");
                        if (typeof audio !== 'undefined' && audio.speak) audio.speak(limitMsg);
                        return;
                    }

                    this.data.companyTreasury -= amt;
                    this.recordTransaction('expense', 'dividends', 'Kaptan Şahsi Kâr / Finansman Çekimi', amt);
                    this.saveData();

                    if (typeof Game !== 'undefined') {
                        Game.playerBudget = (Game.playerBudget || 0) + amt;
                        Game.saveData();
                        if (typeof UI !== 'undefined' && UI.updatePlayerStats) {
                            UI.updatePlayerStats(Game.licenseLevel, Game.completedTasks, Game.playerBudget, Game.getLicenseTitle());
                        }
                    }

                    this.renderAll();
                    this.checkBankruptcyStatus();

                    const msg = `Şirket hesabından cüzdanınıza ${amt.toLocaleString('tr-TR')} ₺ aktarıldı. Yeni Kasa Bakiyesi: ${this.data.companyTreasury.toLocaleString('tr-TR')} ₺.`;
                    if (typeof audio !== 'undefined' && audio.speak) audio.speak(msg);
                    if (typeof UI !== 'undefined' && UI.showToast) UI.showToast(msg, "success");
                }
            }
        },

                // --- İKRAM & MUAVİN SİSTEMİ ---
        setCateringPackage: function(pkg) {
            this.data.cateringPackage = pkg;
            this.saveData();
            this.renderAll();

            const pkgNames = {
                'ekonomik': 'Sıcak Çay, Su & Taze Kek Paketi',
                'standart': 'Standart Karayolu Paketi (Çay, Nescafe, Soğuk Meşrubat, Kraker & Kolonya)',
                'vip': 'Jumbo VIP First Class (Sıcak Sandviç, Taze Meyve Suyu & Dondurma)'
            };
            const msg = `İkram paketi güncellendi: ${pkgNames[pkg] || pkg}. Sürüş esnasında I tuşuna basarak yolcularınıza ikram servisi yapabilirsiniz.`;
            if (typeof audio !== 'undefined' && audio.speak) audio.speak(msg);
            if (typeof UI !== 'undefined' && UI.showToast) UI.showToast(`☕ ${pkgNames[pkg] || pkg} Seçildi!`, 'success');
        },

        boostSatisfaction: function(delta) {
            this.data.satisfactionRating = Math.min(5.0, Math.max(3.0, (this.data.satisfactionRating || 4.8) + delta));
            this.saveData();
        },

        renderCatering: function() {
            const container = document.getElementById('company-catering-container');
            if (!container) return;

            const curPkg = this.data.cateringPackage || 'standart';
            const rating = (this.data.satisfactionRating || 4.9).toFixed(1);

            container.innerHTML = `
            <div style="background: rgba(15,23,42,0.85); border: 2px solid #ca8a04; border-radius: 12px; padding: 18px; margin-bottom: 14px;">
                <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; margin-bottom: 12px;">
                    <div>
                        <div style="color: #facc15; font-size: 1.25rem; font-weight: bold; display: flex; align-items: center; gap: 8px;">
                            <span>☕</span> <span>Otobüs İçi İkram & Muavin Hizmet Standardı</span>
                        </div>
                        <div style="color: #cbd5e1; font-size: 0.88rem; margin-top: 3px;">
                            Gerçek otobüs firmalarının sunduğu ikram kalitesini siz belirlersiniz. İkram kalitesi arttıkça yolcu memnuniyeti ve bahşişler artar.
                        </div>
                    </div>
                    <div style="background: rgba(245, 158, 11, 0.18); border: 1.5px solid #f59e0b; border-radius: 8px; padding: 6px 14px; text-align: center;">
                        <span style="font-size: 0.8rem; color: #fde047; display: block; font-weight: bold;">YOLCU MEMNUNİYETİ</span>
                        <strong style="font-size: 1.35rem; color: #fff;">⭐ ${rating} / 5.0</strong>
                    </div>
                </div>

                <!-- CANLI SÜRÜŞ İKRAM REHBERİ -->
                <div style="background: linear-gradient(135deg, rgba(56, 189, 248, 0.15), rgba(2, 132, 199, 0.15)); border: 1.5px solid #38bdf8; border-radius: 10px; padding: 12px 16px; margin-bottom: 16px;">
                    <div style="color: #38bdf8; font-weight: bold; font-size: 1rem; display: flex; align-items: center; gap: 8px;">
                        <span>🛎️</span> <span>Sürüş Esnasında İkram Nasıl Dağıtılır?</span>
                    </div>
                    <div style="color: #e2e8f0; font-size: 0.9rem; line-height: 1.5; margin-top: 4px;">
                        Otobüsünüzde yolcu varken klavyeden <strong>I</strong> (veya <strong>ı</strong>) tuşuna bastığınızda, muavin ayağa kalkar, yolculara limon kolonyası döker ve seçtiğiniz ikramları dağıtır. Yolcular memnun kalır ve kaptana nakit <strong>bahşiş</strong> bırakır!
                    </div>
                </div>

                <!-- 3 İKRAM PAKETİ SEÇİMİ -->
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 14px;">
                    
                    <!-- 1. EKONOMİK -->
                    <div style="background: rgba(30,41,59,0.7); border: 2px solid ${curPkg === 'ekonomik' ? '#22c55e' : '#475569'}; border-radius: 10px; padding: 14px; display: flex; flex-direction: column; justify-content: space-between;">
                        <div>
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                                <strong style="color: #fff; font-size: 1.05rem;">🍵 Ekonomik İkram</strong>
                                <span style="font-size: 0.78rem; padding: 2px 8px; border-radius: 6px; background: rgba(255,255,255,0.06); border: 1px solid #64748b; color: #cbd5e1;">Halk Paketi</span>
                            </div>
                            <div style="color: #94a3b8; font-size: 0.83rem; margin-bottom: 10px;">
                                Sıcak Demleme Çay, Pınar Bardak Su ve Taze Meyveli Kek.
                            </div>
                            <div style="font-size: 0.85rem; color: #cbd5e1; background: rgba(0,0,0,0.25); padding: 8px 10px; border-radius: 6px; margin-bottom: 12px; line-height: 1.4;">
                                <div>💰 Maliyet: <strong style="color: #fde047;">8 ₺ / Yolcu</strong></div>
                                <div>🎁 Bahşiş Ortalama: <strong style="color: #4ade80;">+25 ₺</strong></div>
                                <div>⭐ Memnuniyet Etkisi: <strong style="color: #38bdf8;">%80</strong></div>
                            </div>
                        </div>
                        <button class="modern-btn btn-select-catering nav-item" data-pkg="ekonomik" style="width: 100%; padding: 8px; background: ${curPkg === 'ekonomik' ? '#22c55e' : 'rgba(255,255,255,0.08)'}; color: ${curPkg === 'ekonomik' ? '#000' : '#fff'}; font-weight: bold; border-radius: 6px; border: 1px solid #22c55e; cursor: pointer;">
                            ${curPkg === 'ekonomik' ? '✅ Aktif İkram Paketi' : 'Bu Paketi Seç'}
                        </button>
                    </div>

                    <!-- 2. STANDART (ÖNERİLEN) -->
                    <div style="background: rgba(30,41,59,0.7); border: 2px solid ${curPkg === 'standart' ? '#22c55e' : '#f59e0b'}; border-radius: 10px; padding: 14px; display: flex; flex-direction: column; justify-content: space-between; box-shadow: 0 0 15px rgba(245,158,11,0.2);">
                        <div>
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                                <strong style="color: #fff; font-size: 1.05rem;">☕ Standart Karayolu</strong>
                                <span style="font-size: 0.78rem; padding: 2px 8px; border-radius: 6px; background: rgba(245,158,11,0.2); border: 1px solid #f59e0b; color: #fde047; font-weight: bold;">⭐ Önerilen</span>
                            </div>
                            <div style="color: #94a3b8; font-size: 0.83rem; margin-bottom: 10px;">
                                Sıcak Çay, Nescafe, Kutu Meşrubat, Çikolatalı Kek, Tuzlu Kraker ve Limon Kolonyası.
                            </div>
                            <div style="font-size: 0.85rem; color: #cbd5e1; background: rgba(0,0,0,0.25); padding: 8px 10px; border-radius: 6px; margin-bottom: 12px; line-height: 1.4;">
                                <div>💰 Maliyet: <strong style="color: #fde047;">18 ₺ / Yolcu</strong></div>
                                <div>🎁 Bahşiş Ortalama: <strong style="color: #4ade80;">+50 ₺</strong></div>
                                <div>⭐ Memnuniyet Etkisi: <strong style="color: #38bdf8;">%92</strong></div>
                            </div>
                        </div>
                        <button class="modern-btn btn-select-catering nav-item" data-pkg="standart" style="width: 100%; padding: 8px; background: ${curPkg === 'standart' ? '#22c55e' : 'linear-gradient(135deg, #f59e0b, #d97706)'}; color: #000; font-weight: bold; border-radius: 6px; border: none; cursor: pointer;">
                            ${curPkg === 'standart' ? '✅ Aktif İkram Paketi' : 'Bu Paketi Seç'}
                        </button>
                    </div>

                    <!-- 3. JUMBO VIP -->
                    <div style="background: rgba(30,41,59,0.7); border: 2px solid ${curPkg === 'vip' ? '#22c55e' : '#a855f7'}; border-radius: 10px; padding: 14px; display: flex; flex-direction: column; justify-content: space-between;">
                        <div>
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                                <strong style="color: #fff; font-size: 1.05rem;">🍨 Jumbo VIP First Class</strong>
                                <span style="font-size: 0.78rem; padding: 2px 8px; border-radius: 6px; background: rgba(168,85,247,0.2); border: 1px solid #a855f7; color: #d8b4fe;">Ultra Lüks</span>
                            </div>
                            <div style="color: #94a3b8; font-size: 0.83rem; margin-bottom: 10px;">
                                Sıcak Kaşarlı Sandviç, Karışık Meyve Suları, İsviçre Çikolatası ve Yazın Maraş Dondurması.
                            </div>
                            <div style="font-size: 0.85rem; color: #cbd5e1; background: rgba(0,0,0,0.25); padding: 8px 10px; border-radius: 6px; margin-bottom: 12px; line-height: 1.4;">
                                <div>💰 Maliyet: <strong style="color: #fde047;">35 ₺ / Yolcu</strong></div>
                                <div>🎁 Bahşiş Ortalama: <strong style="color: #4ade80;">+90 ₺</strong></div>
                                <div>⭐ Memnuniyet Etkisi: <strong style="color: #38bdf8;">%99</strong></div>
                            </div>
                        </div>
                        <button class="modern-btn btn-select-catering nav-item" data-pkg="vip" style="width: 100%; padding: 8px; background: ${curPkg === 'vip' ? '#22c55e' : 'rgba(168,85,247,0.2)'}; color: ${curPkg === 'vip' ? '#000' : '#d8b4fe'}; font-weight: bold; border-radius: 6px; border: 1px solid #a855f7; cursor: pointer;">
                            ${curPkg === 'vip' ? '✅ Aktif İkram Paketi' : 'Bu Paketi Seç'}
                        </button>
                    </div>

                </div>
            </div>
            `;

            container.querySelectorAll('.btn-select-catering').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const pkg = e.currentTarget.getAttribute('data-pkg');
                    this.setCateringPackage(pkg);
                });
            });
        },

        // --- OTOGAR YAZIHANELERİ & BİLET FİYAT TARİFESİ ---
        rentTerminalBranch: function(branchId, cost, name, model = 'owned') {
            if (!this.data.terminalBranches) this.data.terminalBranches = {};

            if (model === 'owned') {
                // ŞİRKETİN ÖZ ŞUBESİ (Kendi Bordrolu Müdürü & Personeli)
                const curTreasury = this.data.companyTreasury || 0;
                if (curTreasury < cost) {
                    const failMsg = `${name} Öz Şubesini kiralamak için şirket kasasında en az ${cost.toLocaleString('tr-TR')} ₺ bulunmalıdır. (Mevcut Kasa: ${curTreasury.toLocaleString('tr-TR')} ₺).`;
                    if (typeof audio !== 'undefined' && audio.speak) audio.speak(failMsg);
                    if (typeof UI !== 'undefined' && UI.showToast) UI.showToast(failMsg, 'warning');
                    return;
                }

                this.data.companyTreasury -= cost;
                this.recordTransaction('expense', 'branches', name + ' Öz Şube Açılış Bedeli', cost);
                this.data.terminalBranches[branchId] = {
                    type: 'owned',
                    name: name,
                    openedAt: Date.now(),
                    managerTitle: 'Bordrolu Yazıhane Müdürü'
                };
                this.saveData();
                this.renderAll();

                const succMsg = `Tebrikler! ${name} Şirket Öz Şubesi açıldı. Bordrolu yazıhane müdürünüz, bilet ve peron görevlileriniz göreve başladı. Bilet ve emanet kargo gelirlerinin %100'ü doğrudan şirket kasasına akacaktır.`;
                if (typeof audio !== 'undefined' && audio.speak) audio.speak(succMsg);
                if (typeof UI !== 'undefined' && UI.showToast) UI.showToast(`🏢 ${name} Öz Şubesi Açıldı!`, 'success');
                this.addRadioLog("🏢 Yazıhane Müdürü", "👔", `${name} terminalinde öz şubemiz açıldı. Peron anonsları, bagaj fişleme ve emanet kargo kabulü başladı.`, "success");
            } else {
                // ACENTELİK / BAYİLİK (F1 Yetki Belgeli Yerel Esnaf) - SIFIR KİRA MALİYETİ
                this.data.terminalBranches[branchId] = {
                    type: 'agency',
                    name: name,
                    openedAt: Date.now(),
                    commissionRate: 12, // %12 Acente Komisyonu
                    managerTitle: 'F1 Yetkili Acente Bayi'
                };
                this.saveData();
                this.renderAll();

                const succMsg = `Tebrikler! ${name} terminalinde F1 yetki belgeli yerel acente ile bayilik sözleşmesi imzalandı. Sıfır kira masrafıyla tabelanız asıldı! Bilet hasılatının %88'i şirket kasasına kalır (%12 acente payı).`;
                if (typeof audio !== 'undefined' && audio.speak) audio.speak(succMsg);
                if (typeof UI !== 'undefined' && UI.showToast) UI.showToast(`🤝 ${name} F1 Acente Bayiliği Kuruldu!`, 'success');
                this.addRadioLog("🤝 Acente Bayisi", "🏬", `${name} otogarında şirketinizin tabelasını astık. Yolculara bilet kesimi ve bagaj fişleme hizmeti vermeye başladık.`, "success");
            }
        },

        setPricingMultiplier: function(mult) {
            this.data.ticketPricingMultiplier = parseFloat(mult) || 1.0;
            this.saveData();
            this.renderAll();

            const multNames = {
                0.8: '%80 İndirimli Halk Tarifesi (%100 Doluluk Garantisi)',
                1.0: '%100 Standart Karayolu Tarifesi (Dengeli Fiyat & Yolcu)',
                1.3: '%130 Ekspres Konforlu Tarife (Yüksek Kâr)',
                1.6: '%160 VIP First Class Lüks Tarife (Maksimum Ciro)'
            };
            const msg = `Bilet fiyat politikası güncellendi: ${multNames[mult] || mult}.`;
            if (typeof audio !== 'undefined' && audio.speak) audio.speak(msg);
            if (typeof UI !== 'undefined' && UI.showToast) UI.showToast(`🏷️ ${multNames[mult] || mult}`, 'success');
        },

        renderBranches: function() {
            const container = document.getElementById('company-branches-container');
            if (!container) return;

            const branches = [
                { id: 'tekirdag', name: 'Tekirdağ Süleymanpaşa Otogarı', desc: 'Genel Merkez Yazıhanesi. Süleymanpaşa sahil ve ilçe peronları ana kalkış noktası.', cost: 0, boost: '+%30 Yolcu Akışı' },
                { id: 'corlu', name: 'Çorlu Şehirlerarası Otogarı', desc: 'Sanayi ve Trakya bölge kavşağı. Çorlu ringi ve fabrika işçi-yolcu transfer merkezi.', cost: 15000, boost: '+%40 Yolcu Akışı' },
                { id: 'istanbul_esenler', name: 'İstanbul 15 Temmuz Demokrasi Otogarı (Esenler)', desc: "Türkiye'nin ve Avrupa'nın en büyük otobüs terminali. 168 aktif peron bağlantısı ve dev yolcu hacmi.", cost: 35000, boost: '+%60 Yolcu & Bilet Satışı' },
                { id: 'ankara_asti', name: 'Ankara AŞTİ Şehirlerarası Terminali', desc: 'Başkentin kalbi. Bakanlıklar, üniversiteler ve tüm Anadolu aktarma peronları.', cost: 30000, boost: '+%50 Yolcu Akışı' },
                { id: 'izmir_otogar', name: 'İzmir Şehirlerarası Otobüs Terminali (İZOTAŞ)', desc: 'Ege sahilleri, Bornova ana peronları ve turizm hatlarının merkezi.', cost: 28000, boost: '+%50 Yolcu Akışı' }
            ];

            const activeBranches = this.data.terminalBranches || { tekirdag: true };
            const curMult = this.data.ticketPricingMultiplier || 1.0;

            let html = `
            <!-- 1. BİLET FİYAT POLİTİKASI (DİNAMİK TARİFE) -->
            <div style="background: rgba(15,23,42,0.85); border: 2px solid #38bdf8; border-radius: 12px; padding: 18px; margin-bottom: 16px;">
                <div style="color: #38bdf8; font-size: 1.25rem; font-weight: bold; display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                    <span>🏷️</span> <span>Bilet Fiyat Politikası & Dinamik Tarife</span>
                </div>
                <div style="color: #cbd5e1; font-size: 0.88rem; margin-bottom: 14px;">
                    Bilet fiyatlarını ucuz yaparak otobüsü hemen doldurabilir veya VIP lüks tarife seçerek bilet başına rekor kâr elde edebilirsiniz.
                </div>

                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); gap: 10px;">
                    <button class="modern-btn btn-set-pricing nav-item" data-mult="0.8" style="padding: 10px; background: ${curMult === 0.8 ? '#38bdf8' : 'rgba(255,255,255,0.06)'}; color: ${curMult === 0.8 ? '#000' : '#fff'}; font-weight: bold; border-radius: 8px; border: 1px solid #38bdf8; cursor: pointer; text-align: left;">
                        <div style="font-size: 0.95rem;">%80 Halk Tarifesi</div>
                        <div style="font-size: 0.78rem; opacity: 0.85; margin-top: 2px;">Biletler %20 Ucuz (%100 Doluluk)</div>
                    </button>
                    <button class="modern-btn btn-set-pricing nav-item" data-mult="1.0" style="padding: 10px; background: ${curMult === 1.0 ? '#22c55e' : 'rgba(255,255,255,0.06)'}; color: ${curMult === 1.0 ? '#000' : '#fff'}; font-weight: bold; border-radius: 8px; border: 1px solid #22c55e; cursor: pointer; text-align: left;">
                        <div style="font-size: 0.95rem;">%100 Standart Tarife</div>
                        <div style="font-size: 0.78rem; opacity: 0.85; margin-top: 2px;">Dengeli Fiyat & Yüksek Talep</div>
                    </button>
                    <button class="modern-btn btn-set-pricing nav-item" data-mult="1.3" style="padding: 10px; background: ${curMult === 1.3 ? '#f59e0b' : 'rgba(255,255,255,0.06)'}; color: ${curMult === 1.3 ? '#000' : '#fff'}; font-weight: bold; border-radius: 8px; border: 1px solid #f59e0b; cursor: pointer; text-align: left;">
                        <div style="font-size: 0.95rem;">%130 Ekspres Konfor</div>
                        <div style="font-size: 0.78rem; opacity: 0.85; margin-top: 2px;">Hızlı Hat, +%30 Yüksek Bilet</div>
                    </button>
                    <button class="modern-btn btn-set-pricing nav-item" data-mult="1.6" style="padding: 10px; background: ${curMult === 1.6 ? '#a855f7' : 'rgba(255,255,255,0.06)'}; color: ${curMult === 1.6 ? '#000' : '#fff'}; font-weight: bold; border-radius: 8px; border: 1px solid #a855f7; cursor: pointer; text-align: left;">
                        <div style="font-size: 0.95rem;">%160 VIP First Class</div>
                        <div style="font-size: 0.78rem; opacity: 0.85; margin-top: 2px;">Lüks Sefer, En Yüksek Kâr</div>
                    </button>
                </div>
            </div>

            <!-- 2. OTOGAR YAZIHANELERİ & İŞLETME MODELLERİ REHBERİ -->
            <div style="background: rgba(15,23,42,0.85); border: 2px solid #ca8a04; border-radius: 12px; padding: 18px; margin-bottom: 16px;">
                <div style="color: #facc15; font-size: 1.25rem; font-weight: bold; display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                    <span>🏢</span> <span>Şehirlerarası Otogar Yazıhaneleri & Şube Ağı</span>
                </div>
                <div style="color: #cbd5e1; font-size: 0.88rem; line-height: 1.5; margin-bottom: 12px;">
                    Otobüslerin yolcu alıp indirebileceği tek yasal yer şehirlerarası otogarlardır. Yol kenarından veya korsan yolcu almak yasaktır. Bir otogarda yazıhane açtığınızda peron, gişe ve emanet kargo hakkı kazanırsınız.
                </div>

                <!-- 2 İŞLETME MODELİ KARŞILAŞTIRMA KUTUSU -->
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 10px; background: rgba(0,0,0,0.3); padding: 12px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.08); margin-bottom: 14px;">
                    <div style="border-left: 3.5px solid #22c55e; padding-left: 10px;">
                        <strong style="color: #4ade80; font-size: 0.9rem;">🏢 Model A: Şirket Öz Şubesi (Kendi Şubemiz)</strong>
                        <div style="color: #cbd5e1; font-size: 0.83rem; margin-top: 3px;">
                            Otogar kirasını şirketiniz öder, kendi bordrolu personelinizi yerleştirirsiniz. Bilet ve kargo emanet gelirlerinin <strong>%100'ü doğrudan şirket kasasına</strong> kalır.
                        </div>
                    </div>
                    <div style="border-left: 3.5px solid #38bdf8; padding-left: 10px;">
                        <strong style="color: #38bdf8; font-size: 0.9rem;">🤝 Model B: F1 Acente Bayiliği (Yerel Esnaf Bayisi)</strong>
                        <div style="color: #cbd5e1; font-size: 0.83rem; margin-top: 3px;">
                            <strong>Kira Masrafı: 0 ₺ (Ücretsiz Kurulum)!</strong> Dükkânı yerel acente işletir. Bilet ve kargo hasılatının <strong>%88'i şirketinize gelir, %12'si bayiye komisyon</strong> olarak kalır. Hızlı ve sıfır riskle büyütür.
                        </div>
                    </div>
                </div>

                <!-- YAZIHANELER LİSTESİ -->
                <div style="display: flex; flex-direction: column; gap: 12px;">
            `;

            branches.forEach(b => {
                const branchData = activeBranches[b.id];
                const isOwned = (b.id === 'tekirdag' || !!branchData);
                const isAgency = branchData && (branchData.type === 'agency');
                const isDirectBranch = isOwned && !isAgency;

                html += `
                <div style="background: rgba(30,41,59,0.85); border: 2px solid ${isOwned ? (isDirectBranch ? '#22c55e' : '#38bdf8') : '#475569'}; border-radius: 12px; padding: 16px; box-shadow: 0 4px 15px rgba(0,0,0,0.25);">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 8px; margin-bottom: 8px;">
                        <div>
                            <div style="font-size: 1.15rem; font-weight: bold; color: #fff; display: flex; align-items: center; gap: 8px;">
                                <span style="font-size: 1.35rem;">${isOwned ? (isDirectBranch ? '🏢' : '🤝') : '🏬'}</span>
                                <span>${b.name}</span>
                            </div>
                            <div style="color: #94a3b8; font-size: 0.85rem; margin-top: 3px;">
                                ${b.desc}
                            </div>
                        </div>
                        <div>
                            ${isDirectBranch ? `
                                <span style="font-size: 0.82rem; padding: 4px 12px; border-radius: 6px; background: rgba(34,197,94,0.2); border: 1.5px solid #22c55e; color: #4ade80; font-weight: 800;">
                                    🏢 ŞİRKET ÖZ ŞUBESİ (%100 Hasılat Şirket Kasasında)
                                </span>
                            ` : (isAgency ? `
                                <span style="font-size: 0.82rem; padding: 4px 12px; border-radius: 6px; background: rgba(56,189,248,0.2); border: 1.5px solid #38bdf8; color: #38bdf8; font-weight: 800;">
                                    🤝 F1 ACENTE BAYİSİ (%88 Şirket Payı / %12 Bayi Komisyonu)
                                </span>
                            ` : `
                                <span style="font-size: 0.82rem; padding: 4px 10px; border-radius: 6px; background: rgba(255,255,255,0.08); border: 1px solid #64748b; color: #94a3b8; font-weight: bold;">
                                    Kapalı Yazıhane
                                </span>
                            `)}
                        </div>
                    </div>

                    <!-- 4 Günlük Yazıhane Görevi Kartı (Sade Açıklamalı) -->
                    <div style="background: rgba(15,23,42,0.65); border-radius: 8px; padding: 12px; margin: 10px 0; font-size: 0.83rem; color: #cbd5e1; border: 1px solid rgba(255,255,255,0.06); display: grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); gap: 8px;">
                        <div>
                            📢 <strong>Peron Anonsu:</strong> 
                            ${isOwned ? '<span style="color:#4ade80;">Yolcular perona anons edilir</span>' : '<span style="color:#94a3b8;">Beklemede</span>'}
                        </div>
                        <div>
                            📋 <strong>Yolcu Manifestosu:</strong> 
                            ${isOwned ? '<span style="color:#4ade80;">Resmi liste kaptana teslim</span>' : '<span style="color:#94a3b8;">Beklemede</span>'}
                        </div>
                        <div>
                            🏷️ <strong>Bagaj Fişleme:</strong> 
                            ${isOwned ? '<span style="color:#4ade80;">Bavullara barkod takılır</span>' : '<span style="color:#94a3b8;">Beklemede</span>'}
                        </div>
                        <div>
                            📦 <strong>Emanet Koli Kargo:</strong> 
                            ${isOwned ? '<span style="color:#fde047;">Her seferde 4-8 koli x 140 ₺ ek gelir</span>' : '<span style="color:#94a3b8;">Beklemede</span>'}
                        </div>
                    </div>

                    <!-- Eylem Alanı: Öz Şube vs Acente Seçimi -->
                    <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; margin-top: 12px; padding-top: 10px; border-top: 1px solid rgba(255,255,255,0.08);">
                        <div style="color: #38bdf8; font-size: 0.85rem;">
                            ⚡ Sefer Gücü: <strong>${b.boost}</strong>
                        </div>
                        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                            ${isOwned ? `
                                <span style="color: #4ade80; font-weight: 800; font-size: 0.95rem; display: flex; align-items: center; gap: 6px;">
                                    <span>✔️</span> <span>Yazıhane ve Peron Hizmetinizde</span>
                                </span>
                            ` : `
                                <button class="modern-btn btn-rent-branch nav-item" data-id="${b.id}" data-model="owned" data-cost="${b.cost}" data-name="${b.name}" style="padding: 9px 16px; background: linear-gradient(135deg, #16a34a, #15803d); color: #fff; font-weight: bold; border-radius: 8px; border: 1.5px solid #22c55e; cursor: pointer; font-size: 0.88rem; box-shadow: 0 2px 10px rgba(22,163,74,0.3);" aria-label="${b.name} Öz Şubesi Aç. Kira: ${b.cost.toLocaleString('tr-TR')} ₺. Bilet ve kargo gelirinin %100'ü şirkete kalır.">
                                    🏢 Öz Şube Aç (${b.cost.toLocaleString('tr-TR')} ₺)
                                </button>
                                <button class="modern-btn btn-rent-branch nav-item" data-id="${b.id}" data-model="agency" data-cost="0" data-name="${b.name}" style="padding: 9px 16px; background: linear-gradient(135deg, #0284c7, #0369a1); color: #fff; font-weight: bold; border-radius: 8px; border: 1.5px solid #38bdf8; cursor: pointer; font-size: 0.88rem; box-shadow: 0 2px 10px rgba(2,132,199,0.3);" aria-label="${b.name} F1 Acentesi ile Anlaş. 0 TL Peşin. Yerel bayi işletir, %12 komisyon alır.">
                                    🤝 F1 Acente ile Anlaş (0 ₺ Bedava Bayilik)
                                </button>
                            `}
                        </div>
                    </div>
                </div>
                `;
            });

            html += `
                </div>
            </div>
            `;

            container.innerHTML = html;

            container.querySelectorAll('.btn-set-pricing').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const mult = e.currentTarget.getAttribute('data-mult');
                    this.setPricingMultiplier(mult);
                });
            });

            container.querySelectorAll('.btn-rent-branch').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const bId = e.currentTarget.getAttribute('data-id');
                    const cost = parseInt(e.currentTarget.getAttribute('data-cost')) || 0;
                    const name = e.currentTarget.getAttribute('data-name');
                    const model = e.currentTarget.getAttribute('data-model') || 'owned';
                    this.rentTerminalBranch(bId, cost, name, model);
                });
            });
        },

        institutionsData: [
            {
                id: "bus_garage",
                name: "1. Garaj ve Filo Sahası (Depot / Garage)",
                icon: "🅿️",
                category: "Filo Kapasitesi & Araç Güvenliği",
                howToUpgrade: "Seviye 1 (küçük otopark) halinden kademe kademe büyütülür (Seviye 2, Seviye 3...).",
                whatItEarns: "Barındırabileceğiniz maksimum otobüs ve istihdam edebileceğiniz şoför kapasitesini artırır. İleri seviyelerde garaja kapalı hangarlar, güvenlik kameraları ve çevre aydınlatması eklenerek araçların yıpranma oranı düşürülür.",
                simpleSummary: "Filodaki otobüslerin ana park ve bekleme alanıdır. Garaj büyüdükçe filonuza daha çok otobüs ve şoför katabilir, kapalı hangar ve güvenlik sistemleri ile araç yıpranmasını %50 azaltırsınız.",
                playerBenefits: [
                    "🚌 Barındırabileceğiniz maksimum otobüs ve istihdam edebileceğiniz şoför kapasitesini artırır.",
                    "🔒 İleri seviyelerde güvenlik kameraları ve çevre aydınlatması ile gece hasarı ve parça hırsızlığını önler.",
                    "🛡️ Seviye 3 kapalı hangarlar sayesinde araçların sefer yıpranma oranını %50 yarı yarıya düşürür."
                ],
                desc: "Otobüslerin geceleme yaptığı, beklediği ve güvenle korunduğu tescilli filo park sahası.",
                levels: [
                    {
                        level: 1,
                        title: "Küçük Açık Park Sahası (5 Otobüs / 5 Şoför)",
                        badge: "🥉 Seviye 1: Küçük Otopark",
                        cost: 0,
                        simplePerk: "5 adede kadar otobüs ve şoför barındırma kapasitesi.",
                        perkDesc: "5 araca kadar yasal geceleme ve park kapasitesi.",
                        perkShort: "5 Otobüs Kapasitesi",
                        effects: { capacity: 5 }
                    },
                    {
                        level: 2,
                        title: "Güvenlikli Asfalt Garaj (15 Otobüs / 15 Şoför)",
                        badge: "🥈 Seviye 2: Güvenlikli Garaj",
                        cost: 45000,
                        simplePerk: "15 otobüs kapasitesi, 7/24 güvenlik kameraları ve çevre aydınlatması (%25 daha az yıpranma).",
                        perkDesc: "15 araca kadar park sahası, güvenlik kameraları, aydınlatma, gece hasarı riski sıfır.",
                        perkShort: "15 Otobüs Kapasitesi, Aydınlatma & Kamera",
                        effects: { capacity: 15 }
                    },
                    {
                        level: 3,
                        title: "Tam Entegre Kapalı Lojistik Hangar (Sınırsız Filo)",
                        badge: "🥇 Seviye 3: Kapalı Hangar (MAX)",
                        cost: 130000,
                        simplePerk: "Sınırsız otobüs ve şoför kapasitesi! Kapalı hangarlar ile araç yıpranması %50 yarı yarıya düşer.",
                        perkDesc: "Sınırsız araç park kapasitesi, kapalı hangarlar, araç yıpranma oranında %50 azalma.",
                        perkShort: "Sınırsız Filo Kapasitesi, -%50 Yıpranma",
                        effects: { capacity: 999 }
                    }
                ]
            },
            {
                id: "maintenance_depot",
                name: "2. Bakım ve Onarım Atölyesi (Kademe / Service Workshop)",
                icon: "🛠️",
                category: "Teknik Servis & Bakım Onarım",
                howToUpgrade: "Garajın içine basit bir tamir kanalı olarak kurulur; sonrasında gelişmiş liftler, diagnostik bilgisayarları ve boyahane eklenir.",
                whatItEarns: "Dışarıdaki tamircilere ödenen yüksek servis ve parça faturalarını %40–50 oranında ucuzlatır. Seferden hasarlı dönen araçların hatta geri dönme süresini (tamir süresini) ciddi oranda kısaltır.",
                simpleSummary: "Şirketinize ait teknik servis atölyesidir. Otobüslerin periyodik bakımları ve hasar onarımları burada yapılır; sanayi masraflarını %65 düşürür ve tamir sürelerini yarı yarıya kısaltır.",
                playerBenefits: [
                    "🔧 Dışarıdaki tamircilere ödenen yüksek servis ve parça faturalarını %40–65 oranında ucuzlatır.",
                    "⚡ Seferden hasarlı dönen araçların tamir süresini yarı yarıya (%50) kısaltarak sefere dönüşü hızlandırır.",
                    "🛡️ Motor arızası ve hararet riskini sıfıra indirir, tüm filonun kondisyonunu korur."
                ],
                desc: "Otobüslerin motor, şanzıman, fren ve gövde onarımlarının yapıldığı tam teşekküllü şirket atölyesi.",
                levels: [
                    {
                        level: 1,
                        title: "Basit Tamir Kanal Çukuru",
                        badge: "🥉 Seviye 1: Tamir Kanalı",
                        cost: 0,
                        simplePerk: "Temel yağ ve lastik değişimi (%10 servis indirimi).",
                        perkDesc: "Rutin bakım ve kontrol imkânı (%10 tamir indirimi).",
                        perkShort: "%10 Servis İndirimi",
                        effects: { repairDiscount: 0.10, wearRate: 1.0 }
                    },
                    {
                        level: 2,
                        title: "Hidrolik Liftler, Diagnostik Bilgisayarları ve Boyahane",
                        badge: "🥈 Seviye 2: Servis Atölyesi",
                        cost: 45000,
                        simplePerk: "Tamir masraflarında %45 indirim ve tamir süresinde %50 hızlanma.",
                        perkDesc: "Diagnostik bilgisayarlar, hidrolik liftler, tamir masrafında %45 indirim, 2 kat hızlı onarım.",
                        perkShort: "%45 Servis İndirimi, 2 Kat Hızlı Tamir",
                        effects: { repairDiscount: 0.45, wearRate: 0.75 }
                    },
                    {
                        level: 3,
                        title: "Tam Teşekküllü Entegre Revizyon ve Ağır Bakım Üssü",
                        badge: "🥇 Seviye 3: Mega Kademe Üssü (MAX)",
                        cost: 125000,
                        simplePerk: "Tamir masraflarında %65 İNDİRİM! Hızlı servis, sıfır motor arıza riski ve filoda %15 yakıt tasarrufu.",
                        perkDesc: "Ağır bakım üssü, tamir faturalarında %65 indirim, tamir süresinde %50 kısalma, sıfır motor arıza riski.",
                        perkShort: "%65 Servis İndirimi, Sıfır Arıza Riski",
                        effects: { repairDiscount: 0.65, wearRate: 0.50 }
                    }
                ]
            },
            {
                id: "bus_wash",
                name: "3. Otobüs Yıkama İstasyonu (Bus Wash)",
                icon: "🧼",
                category: "Temizlik & Yolcu Memnuniyeti",
                howToUpgrade: "Elle yıkama hortumundan başlayıp otomatik fırçalı yıkama tüneline ve kurutma sistemlerine terfi ettirilir.",
                whatItEarns: "Araçlar seferden kirlendikçe düşen yolcu memnuniyetini ve bilet talebini hızla toparlar. Otomatik sistemler sayesinde araç başına yıkama maliyeti ve bekleme süresi sıfıra yaklaşır.",
                simpleSummary: "Otobüslerin iç ve dış temizliğinin yapıldığı yıkama istasyonudur. Seferden kirlenen araçları hızla temizleyerek yolcu memnuniyetini ve bilet talebini zirvede tutar.",
                playerBenefits: [
                    "🧼 Araçlar kirlendikçe düşen yolcu memnuniyetini ve bilet talebini hızla toparlar.",
                    "⚡ Otomatik fırçalı tünel sistemleri sayesinde yıkama maliyetini ve bekleme süresini sıfıra indirir.",
                    "🌟 Pırıl pırıl araçlar sayesinde yolcu bahşiş oranlarını ve sefer başı memnuniyet puanını artırır."
                ],
                desc: "Sefer öncesi ve sonrası otobüslerin dış fırçalama, basınçlı su ve iç dezenfeksiyon işlemlerinin yapıldığı tesis.",
                levels: [
                    {
                        level: 1,
                        title: "Manuel Hortumlu Elle Yıkama Alanı",
                        badge: "🥉 Seviye 1: Manuel Yıkama",
                        cost: 0,
                        simplePerk: "Standart araç temizliği ile temel yolcu memnuniyeti sağlar.",
                        perkDesc: "Manuel hortumlu yıkama alanı, temel temizlik.",
                        perkShort: "Temel Yıkama",
                        effects: { washSpeedBonus: 0, satisfactionBonus: 0 }
                    },
                    {
                        level: 2,
                        title: "Basınçlı Köpük & Yarı Otomatik Fırçalı Yıkama Ünitesi",
                        badge: "🥈 Seviye 2: Fırçalı Yıkama",
                        cost: 35000,
                        simplePerk: "Yıkama süresi yarıya iner, araç başına yıkama maliyeti %50 ucuzlar, bilet talebi +%15 artar.",
                        perkDesc: "Basınçlı köpük ve fırçalı temizlik, 2 kat hızlı temizlik, +%15 memnuniyet primi.",
                        perkShort: "Hızlı Temizlik, +%15 Memnuniyet",
                        effects: { washSpeedBonus: 0.50, satisfactionBonus: 0.15 }
                    },
                    {
                        level: 3,
                        title: "Tam Otomatik Tünel Yıkama & Sıcak Kurutma Sistemi",
                        badge: "🥇 Seviye 3: Otomatik Yıkama Tüneli (MAX)",
                        cost: 95000,
                        simplePerk: "0 saniye bekleme süresi, tamamen ÜCRETSİZ yıkama, tavan yolcu memnuniyeti ve +%30 bahşiş primi!",
                        perkDesc: "Otomatik yıkama tüneli, anında kurutma, sıfır bekleme süresi, bilet talebi ve bahşişlerde +%30 prim.",
                        perkShort: "Ücretsiz & Anında Yıkama, +%30 Bahşiş",
                        effects: { washSpeedBonus: 1.0, satisfactionBonus: 0.30 }
                    }
                ]
            },
            {
                id: "fuel_depot",
                name: "4. Şirket Akaryakıt İstasyonu (Fuel Depot)",
                icon: "⛽",
                category: "Akaryakıt Temini & Yakıt Tasarrufu",
                howToUpgrade: "Küçük bir yer altı yakıt deposu ve tek pompayla başlar; dev tanklara ve çoklu dolum adalarına dönüştürülür.",
                whatItEarns: "Yol üstündeki normal istasyonlara kıyasla mazotu toptan fiyata getirerek firmanın en büyük gideri olan akaryakıt masrafını doğrudan aşağı çeker.",
                simpleSummary: "Şirketinizin kendi özel akaryakıt ikmal tesisidir. Mazotu toptan fiyata temin ederek firmanın en büyük operasyonel giderini aşağı çeker; Seviye 3'te ücretsiz yakıt ikmali sağlar.",
                playerBenefits: [
                    "⛽ Akaryakıt masraflarını doğrudan aşağı çeker (Seviye 2'de %30 toptan indirim).",
                    "💰 Seviye 3 dev tank çiftliği ile şirketin tüm otobüslerine %100 ÜCRETSİZ MAZOT sağlar.",
                    "⏱️ İstasyonlarda sıra beklemeden hızlı ikmal imkanı sunar."
                ],
                desc: "Şirket garajında konuşlu akaryakıt depolama tankları ve doğrudan filo dolum pompaları.",
                levels: [
                    {
                        level: 1,
                        title: "Küçük Yer Altı Yakıt Deposu ve Tek Pompa",
                        badge: "🥉 Seviye 1: Tek Pompa",
                        cost: 0,
                        simplePerk: "Şirket garajında akaryakıt dolumu (%10 toptan yakıt indirimi).",
                        perkDesc: "Küçük yer altı tankı, tek pompa, %10 yakıt tasarrufu.",
                        perkShort: "%10 Yakıt Tasarrufu",
                        effects: { fuelDiscount: 0.10 }
                    },
                    {
                        level: 2,
                        title: "Çift Pompalı 25.000 Litre Yakıt Depo Sahası",
                        badge: "🥈 Seviye 2: Toptan Yakıt Sahası",
                        cost: 50000,
                        simplePerk: "Mazotta %30 toptan fiyat indirimi! Firmanın en büyük giderini doğrudan aşağı çeker.",
                        perkDesc: "Genişletilmiş yakıt tankı, çift pompa, akaryakıt dolumunda %30 indirim.",
                        perkShort: "%30 Toptan Mazot İndirimi",
                        effects: { fuelDiscount: 0.30 }
                    },
                    {
                        level: 3,
                        title: "Dev Tank Çiftliği ve Çoklu Dolum Adaları Kompleksi",
                        badge: "🥇 Seviye 3: Dev Yakıt Çiftliği (MAX)",
                        cost: 140000,
                        simplePerk: "Şirketinizin tüm otobüslerine %100 ÜCRETSİZ AKARYAKIT (BEDAVA MAZOT)!",
                        perkDesc: "Dev tank çiftliği, çoklu dolum adaları, tüm şirket araçlarına akaryakıt %100 ÜCRETSİZ.",
                        perkShort: "%100 ÜCRETSİZ AKARYAKIT (BEDAVA)",
                        effects: { fuelDiscount: 1.0 }
                    }
                ]
            },
            {
                id: "terminal_offices",
                name: "5. Otogar / Terminal Yazıhaneleri ve Bekleme Salonları",
                icon: "🏢",
                category: "Bilet Gişesi & VIP Yolcu Salonu",
                howToUpgrade: "Basit bir bilet gişesinden başlanıp klima, konforlu koltuklar, ücretsiz çay-kahve otomatları, Wi-Fi ve VIP yolcu bekleme salonuna dönüştürülür.",
                whatItEarns: "O şehirdeki/duraktaki yolcu çekme kapasitesini (talep çarpanını) artırır. Yolcular daha lüks karşılandığı için bilet fiyatlarını tavan fiyata çekmenize imkân tanır.",
                simpleSummary: "Şehir otogarlarındaki resmi yazıhaneleriniz ve VIP bekleme salonlarınızdır. Yolcu çekme kapasitesini katlar, bilet fiyatlarını tavan fiyata çekmenizi sağlar ve pasif terminal kârı kazandırır.",
                playerBenefits: [
                    "👥 Şehirlerdeki yolcu çekme kapasitesini (talep çarpanını) doğrudan artırır.",
                    "💎 VIP bekleme salonları sayesinde bilet fiyatlarını tavan fiyata (+%30 prim) çekmenize imkân tanır.",
                    "💰 Sefer başına düzenli pasif terminal kâr payı (+3.500 ₺) kazandırır."
                ],
                desc: "Terminallerde bilet kesimi, bagaj fişleme, peron tahsisi ve konforlu yolcu bekleme salonları.",
                levels: [
                    {
                        level: 1,
                        title: "Standart Otogar Gişesi ve Peron Masası",
                        badge: "🥉 Seviye 1: Bilet Gişesi",
                        cost: 0,
                        simplePerk: "Terminallerde resmi bilet satışı ve yolcu alımı sağlar.",
                        perkDesc: "Standart otogar gişesi ve peron hakkı.",
                        perkShort: "Bilet Gişesi",
                        effects: { passiveDividend: 0, fareBonus: 0 }
                    },
                    {
                        level: 2,
                        title: "Klimalı, Koltuklu ve Otomatlı Yolcu Bekleme Salonu",
                        badge: "🥈 Seviye 2: Konforlu Salon",
                        cost: 50000,
                        simplePerk: "Yolcu talep çarpanı +%35 artar, sefer başına +1.500 ₺ sabit pasif terminal geliri sağlar.",
                        perkDesc: "Klimalı bekleme salonu, ücretsiz çay-kahve otomatı, Wi-Fi, sefer başı +1.500 ₺ pay.",
                        perkShort: "+%35 Talep, +1.500 ₺ Sefer Payı",
                        effects: { passiveDividend: 1500, fareBonus: 0.15 }
                    },
                    {
                        level: 3,
                        title: "VIP Yolcu Bekleme Salonu ve Ulusal Otogar Konsorsiyumu",
                        badge: "🥇 Seviye 3: VIP Yolcu Salonu (MAX)",
                        cost: 135000,
                        simplePerk: "Bilet fiyatlarını tavan fiyata çekme imkânı (+%30 prim) ve sefer başı +3.500 ₺ pasif gelir!",
                        perkDesc: "Lüks VIP salonu, tavan bilet fiyatı hakkı (+%30 bilet hasılat primi), sefer başı +3.500 ₺ pasif kâr.",
                        perkShort: "Tavan Bilet Fiyatı (+%30), +3.500 ₺ Kâr",
                        effects: { passiveDividend: 3500, fareBonus: 0.30 }
                    }
                ]
            },
            {
                id: "driver_lodging",
                name: "6. Personel Sosyal Tesisleri ve Dinlenme Odaları (Staff Lounge)",
                icon: "🛏️",
                category: "Personel Sosyal Tesis & Dinlenme",
                howToUpgrade: "Basit bir sandalyeli dinlenme odasından; televizyon, mutfak, oyun masaları ve otel konforunda yatakhanelere yükseltilir.",
                whatItEarns: "Şoförlerin yorgunluk ve stres seviyelerini çok daha hızlı sıfırlar. Şoförlerin kaza yapma, seferi aksatma veya istifa etme riskini en aza indirir.",
                simpleSummary: "Kaptan ve muavinlerin sefer aralarında dinlendiği sosyal tesistir. Yorgunluk ve stresi hızla sıfırlar; kaza ve sefer aksama riskini tamamen ortadan kaldırır.",
                playerBenefits: [
                    "🛌 Şoförlerin yorgunluk ve stres seviyelerini %75 daha hızlı sıfırlar.",
                    "🛡️ Uykusuzluk ve yorgunluk kaynaklı kaza yapma veya seferi aksatma riskini sıfırlar.",
                    "🌟 Dinç ve yüksek moralli kaptanlar sayesinde sefer verimini 2 katına (x2.0) çıkarır."
                ],
                desc: "Personelin sefer aralarında kaliteli uyku uyuduğu, yemek yediği ve dinlendiği sosyal tesis kompleksi.",
                levels: [
                    {
                        level: 1,
                        title: "Basit Sandalyeli Personel Dinlenme Odası",
                        badge: "🥉 Seviye 1: Dinlenme Odası",
                        cost: 0,
                        simplePerk: "Standart personel dinlenmesi ve sefer hazırlığı.",
                        perkDesc: "Temel dinlenme odası.",
                        perkShort: "Temel Dinlenme",
                        effects: { fatigueSpeed: 1.0, xpMultiplier: 1.0 }
                    },
                    {
                        level: 2,
                        title: "Televizyonlu, Mutfaklı ve Yatakhaneli Sosyal Tesis",
                        badge: "🥈 Seviye 2: Sosyal Dinlenme Tesisi",
                        cost: 40000,
                        simplePerk: "Dinlenme süresi %50 kısalır, yorgunluk kaynaklı kaza ve ceza riski %40 azalır.",
                        perkDesc: "Mutfak, televizyon, dinlenme yatakları, %50 daha hızlı toparlanma, x1.5 tecrübe puanı.",
                        perkShort: "-%50 Dinlenme Süresi, -%40 Risk",
                        effects: { fatigueSpeed: 1.5, xpMultiplier: 1.5 }
                    },
                    {
                        level: 3,
                        title: "Otel Konforunda Kaptan Sosyal Yaşam ve Konaklama Kampüsü",
                        badge: "🥇 Seviye 3: Kaptan Kampüsü (MAX)",
                        cost: 115000,
                        simplePerk: "Dinlenme süresi %75 kısalır! Stres ve yorgunluk anında sıfırlanır, sefer verimi x2.0 katına ulaşır.",
                        perkDesc: "5 yıldızlı otel konforu, dinlenme süresi %75 daha hızlı, sıfır kaza riski, x2.0 sefer verimi.",
                        perkShort: "Anında Zindelik, Sıfır Risk, x2.0 Verim",
                        effects: { fatigueSpeed: 2.0, xpMultiplier: 2.0 }
                    }
                ]
            },
            {
                id: "catering_cargo_hub",
                name: "7. Lojistik ve İkram Deposu (Catering & Cargo Hub)",
                icon: "📦",
                category: "İkram Lojistiği & Kargo Taşımacılığı",
                howToUpgrade: "Küçük bir koli deposundan profesyonel soğuk hava depolu ve yükleme rampalı lojistik merkezine çevrilir.",
                whatItEarns: "Yolculara sunulan ikramların (kek, meşrubat vb.) birim maliyetini düşürür. Otobüs bagajında taşınan ücretli kargo hacmini büyüterek ek sefer geliri sağlar.",
                simpleSummary: "Şirketinizin lojistik merkezidir. Yolculara ikram edilen ürünlerin toptan tedarik maliyetini düşürür ve otobüs bagajında taşınan ücretli kargo hacmini büyüterek ek sefer geliri sağlar.",
                playerBenefits: [
                    "☕ Yolculara sunulan ikramların (kek, meşrubat vb.) birim maliyetini %40–70 oranında düşürür.",
                    "📦 Otobüs bagajında taşınan ücretli emanet kargo hacmini büyüterek koli başı 140 ₺ ek gelir sağlar.",
                    "💰 Sefer başına düzenli ek kargo kazancı (+800 ₺ – +2.500 ₺) kazandırır."
                ],
                desc: "İkram paketlerinin toptan depolandığı ve şehirlerarası ticari emanet kolilerin kabul edildiği lojistik üs.",
                levels: [
                    {
                        level: 1,
                        title: "Küçük Koli ve İkram Ambarı",
                        badge: "🥉 Seviye 1: Koli Ambarı",
                        cost: 0,
                        simplePerk: "Standart ikram tedariği ve sefer başı 2-4 emanet koli bagaj kapasitesi.",
                        perkDesc: "Küçük ambar, temel ikram ve koli kabulü.",
                        perkShort: "Temel Koli & İkram",
                        effects: { cateringDiscount: 0.10, cargoBonus: 400 }
                    },
                    {
                        level: 2,
                        title: "Soğuk Hava Depolu ve Yükleme Rampalı Lojistik Depo",
                        badge: "🥈 Seviye 2: Soğuk Hava Deposu",
                        cost: 40000,
                        simplePerk: "İkram masraflarında %40 tasarruf, sefer başı 4-8 emanet koli ile +1.200 ₺ ek kargo geliri.",
                        perkDesc: "Soğuk hava deposu, yükleme rampası, ikram masrafı %40 ucuz, sefer başı 8 koli kapasitesi.",
                        perkShort: "-%40 İkram Maliyeti, +1.200 ₺ Kargo",
                        effects: { cateringDiscount: 0.40, cargoBonus: 1200 }
                    },
                    {
                        level: 3,
                        title: "Tam Otomasyonlu Mega Lojistik ve Dağıtım Merkezi",
                        badge: "🥇 Seviye 3: Mega Lojistik Merkezi (MAX)",
                        cost: 120000,
                        simplePerk: "İkram masraflarında %70 tasarruf, VIP kargo taşımacılığı ile sefer başı +2.500 ₺ net kargo hasılatı!",
                        perkDesc: "Mega kargo merkezi, ikram maliyetinde %70 toptan indirim, sefer başı +2.500 ₺ kargo geliri.",
                        perkShort: "-%70 İkram Gideri, +2.500 ₺ Net Kargo",
                        effects: { cateringDiscount: 0.70, cargoBonus: 2500 }
                    }
                ]
            }
        ],

        // Kurumun Mevcut Seviyesini Al (1 - 3, Takma İsimler / Aliases Destekli)
        getInstitutionLevel: function(instId) {
            if (!this.data.institutions) {
                this.data.institutions = {};
            }
            const aliases = {
                garage_maintenance: 'maintenance_depot',
                driver_academy: 'driver_lodging',
                ticketing_network: 'terminal_offices',
                city_agencies: 'terminal_offices',
                catering_logistics: 'catering_cargo_hub',
                highway_resort: 'fuel_depot',
                fleet_operations: 'bus_garage',
                headquarters: 'terminal_offices',
                fuel_station: 'fuel_depot'
            };
            const targetKey = aliases[instId] || instId;
            return this.data.institutions[instId] || this.data.institutions[targetKey] || 1;
        },

        // Kurum Büyütme / Seviye Atlama Sesi (Majör Arpej)
        playLevelUpChime: function() {
            const ctx = this.getAudioCtx();
            if (!ctx) return;
            try {
                if (ctx.state === 'suspended') ctx.resume();
                const now = ctx.currentTime;
                const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
                notes.forEach((freq, idx) => {
                    const t = now + (idx * 0.08);
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.type = 'triangle';
                    osc.frequency.setValueAtTime(freq, t);
                    gain.gain.setValueAtTime(0.001, t);
                    gain.gain.linearRampToValueAtTime(0.28, t + 0.02);
                    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.42);
                    osc.connect(gain);
                    gain.connect(ctx.destination);
                    osc.start(t);
                    osc.stop(t + 0.45);
                });
            } catch(e) {}
        },

        // Kurumu Büyüt / Seviye Yükselt
        upgradeInstitution: function(instId) {
            const aliases = {
                garage_maintenance: 'maintenance_depot',
                driver_academy: 'driver_lodging',
                ticketing_network: 'city_agencies',
                catering_logistics: 'maintenance_depot',
                highway_resort: 'terminal_offices',
                fleet_operations: 'headquarters'
            };
            const targetKey = aliases[instId] || instId;
            instId = targetKey;
            const inst = this.institutionsData.find(i => i.id === instId);
            if (!inst) return;
            const currentLevel = this.getInstitutionLevel(instId);
            if (currentLevel >= 3) {
                const maxMsg = `${inst.name} zaten maksimum zirve seviyededir (${inst.levels[2].title}).`;
                if (typeof audio !== 'undefined' && audio.speak) audio.speak(maxMsg);
                if (typeof UI !== 'undefined' && UI.showToast) UI.showToast(maxMsg, 'info');
                return;
            }

            const nextLvlObj = inst.levels[currentLevel]; // index 1 is level 2, index 2 is level 3
            const cost = nextLvlObj.cost;

            const companyTreasury = (this.data.companyTreasury !== undefined) ? this.data.companyTreasury : 50000;
            const playerBudget = (typeof Game !== 'undefined' && Game.playerBudget) ? Game.playerBudget : 0;

            let paidFrom = '';
            if (companyTreasury >= cost) {
                this.data.companyTreasury -= cost;
                paidFrom = 'Şirket Kasasından';
            } else if (playerBudget >= cost) {
                if (typeof Game !== 'undefined') {
                    Game.playerBudget -= cost;
                    Game.saveData();
                    if (typeof UI !== 'undefined' && UI.updatePlayerStats) {
                        const title = (typeof Game.getLicenseTitle === 'function') ? Game.getLicenseTitle() : 'Kaptan';
                        UI.updatePlayerStats(Game.licenseLevel, Game.completedTasks, Game.playerBudget, title);
                    }
                }
                paidFrom = 'Kaptan Cüzdanınızdan (Şahsi Yatırım)';
            } else if ((companyTreasury + playerBudget) >= cost) {
                const fromTreasury = companyTreasury;
                const remainder = cost - fromTreasury;
                this.data.companyTreasury = 0;
                if (typeof Game !== 'undefined') {
                    Game.playerBudget -= remainder;
                    Game.saveData();
                    if (typeof UI !== 'undefined' && UI.updatePlayerStats) {
                        const title = (typeof Game.getLicenseTitle === 'function') ? Game.getLicenseTitle() : 'Kaptan';
                        UI.updatePlayerStats(Game.licenseLevel, Game.completedTasks, Game.playerBudget, title);
                    }
                }
                paidFrom = `Kasadan (${fromTreasury.toLocaleString('tr-TR')} ₺) ve Cüzdandan (${remainder.toLocaleString('tr-TR')} ₺)`;
            } else {
                const needed = cost - (companyTreasury + playerBudget);
                const failMsg = `Yetersiz bakiye! ${inst.name} Seviye ${nextLvlObj.level} yükseltmesi için ${cost.toLocaleString('tr-TR')} ₺ gerekiyor. Şirket Kasası: ${companyTreasury.toLocaleString('tr-TR')} ₺, Cüzdanınız: ${playerBudget.toLocaleString('tr-TR')} ₺. Eksik: ${needed.toLocaleString('tr-TR')} ₺.`;
                if (typeof audio !== 'undefined' && audio.speak) audio.speak(failMsg);
                if (typeof UI !== 'undefined' && UI.showToast) UI.showToast(`⚠️ ${failMsg}`, 'warning');
                return;
            }

            this.recordTransaction('expense', 'upgrades', inst.name + ' Seviye ' + nextLvlObj.level + ' Yatırımı', cost);
            this.data.institutions[instId] = nextLvlObj.level;
            this.saveData();

            this.playLevelUpChime();

            const toastMsg = `🎉 TEBRİKLER! ${inst.name} başarıyla Seviye ${nextLvlObj.level}'e büyütüldü: '${nextLvlObj.title}'. ${paidFrom} ${cost.toLocaleString('tr-TR')} ₺ ödendi.`;
            const speechMsg = `Tebrikler! ${inst.name} Seviye ${nextLvlObj.level}'e büyütüldü: ${nextLvlObj.title}. Yeni avantaj: ${nextLvlObj.perkShort}.`;

            if (typeof audio !== 'undefined' && audio.speak) audio.speak(speechMsg);
            if (typeof UI !== 'undefined' && UI.showToast) UI.showToast(toastMsg, 'success');

            this.addRadioLog("🏢 Merkez İdare", "🏛️", `${inst.name} tesisimiz Seviye ${nextLvlObj.level}'e terfi etti (${nextLvlObj.title}). Filonun yeni gücü: ${nextLvlObj.perkShort}`, "system");

            this.renderAll();
        },

        // Otobüs Kurumları ve Tesislerini Render Et
        renderInstitutions: function() {
            const container = document.getElementById('company-institutions-container');
            if (!container) return;

            const companyTreasury = (this.data.companyTreasury !== undefined) ? this.data.companyTreasury : 50000;
            const playerBudget = (typeof Game !== 'undefined' && Game.playerBudget) ? Game.playerBudget : 0;
            const totalAvailable = companyTreasury + playerBudget;

            let html = `
            <!-- 1. B1 YETKİ BELGESİ BİNALARI GENEL REHBERİ (OYUNCUNUN ANLAYACAĞI SADE DİL) -->
            <div style="background: linear-gradient(135deg, rgba(30, 41, 59, 0.95), rgba(15, 23, 42, 0.95)); border: 2px solid #38bdf8; border-radius: 14px; padding: 20px; margin-bottom: 18px; box-shadow: 0 4px 25px rgba(56, 189, 248, 0.18);">
                <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; margin-bottom: 12px;">
                    <div>
                        <div style="color: #38bdf8; font-size: 1.35rem; font-weight: 800; display: flex; align-items: center; gap: 8px;">
                            <span>🏢</span> <span>ŞİRKET BİNALARI VE TESİSLERİ REHBERİ</span>
                        </div>
                        <div style="color: #cbd5e1; font-size: 0.9rem; margin-top: 4px; line-height: 1.5;">
                            Şirketinizi büyüttükçe geliştirebileceğiniz <strong>7 temel tesis</strong> bulunur. Bu tesisler operasyonel maliyetlerinizi düşürür, filo kapasitenizi artırır ve gelirinizi katlar.
                        </div>
                    </div>
                    <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                        <div style="background: rgba(234, 179, 8, 0.2); border: 1.5px solid #eab308; border-radius: 8px; padding: 8px 16px; font-size: 0.9rem; color: #fef08a;">
                            🏦 Şirket Kasası: <strong style="color: #facc15; font-size: 1.05rem;">${companyTreasury.toLocaleString('tr-TR')} ₺</strong>
                        </div>
                        <div style="background: rgba(34, 197, 94, 0.2); border: 1.5px solid #22c55e; border-radius: 8px; padding: 8px 16px; font-size: 0.9rem; color: #86efac;">
                            👤 Kaptan Cüzdanı: <strong style="color: #4ade80; font-size: 1.05rem;">${playerBudget.toLocaleString('tr-TR')} ₺</strong>
                        </div>
                    </div>
                </div>

                <!-- 7 TEMEL TESİS HIZLI ÖZET KARTLARI -->
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 10px; margin-top: 14px; padding-top: 14px; border-top: 1px solid rgba(255,255,255,0.1);">
                    <div style="background: rgba(15,23,42,0.6); padding: 10px 12px; border-radius: 8px; border-left: 3.5px solid #22c55e; font-size: 0.84rem; color: #cbd5e1;">
                        🅿️ <strong>1. Garaj & Filo Sahası:</strong> Otobüs ve şoför kapasitesini artırır; kapalı hangar ile yıpranmayı %50 azaltır.
                    </div>
                    <div style="background: rgba(15,23,42,0.6); padding: 10px 12px; border-radius: 8px; border-left: 3.5px solid #f97316; font-size: 0.84rem; color: #cbd5e1;">
                        🛠️ <strong>2. Bakım Atölyesi (Kademe):</strong> Servis faturalarını %65 ucuzlatır ve tamir süresini yarı yarıya kısaltır.
                    </div>
                    <div style="background: rgba(15,23,42,0.6); padding: 10px 12px; border-radius: 8px; border-left: 3.5px solid #38bdf8; font-size: 0.84rem; color: #cbd5e1;">
                        🧼 <strong>3. Yıkama İstasyonu:</strong> Kirlenen araçları hızla temizleyip yolcu memnuniyetini ve bahşişleri toparlar.
                    </div>
                    <div style="background: rgba(15,23,42,0.6); padding: 10px 12px; border-radius: 8px; border-left: 3.5px solid #eab308; font-size: 0.84rem; color: #cbd5e1;">
                        ⛽ <strong>4. Akaryakıt İstasyonu:</strong> Toptan mazot tasarrufu sağlar; Seviye 3'te %100 ÜCRETSİZ MAZOT sunar.
                    </div>
                    <div style="background: rgba(15,23,42,0.6); padding: 10px 12px; border-radius: 8px; border-left: 3.5px solid #a855f7; font-size: 0.84rem; color: #cbd5e1;">
                        🏢 <strong>5. Otogar Yazıhaneleri & Salonlar:</strong> Talep çarpanını artırır, tavan bilet fiyatı ve sefer başı +3.500 ₺ pasif gelir sağlar.
                    </div>
                    <div style="background: rgba(15,23,42,0.6); padding: 10px 12px; border-radius: 8px; border-left: 3.5px solid #ec4899; font-size: 0.84rem; color: #cbd5e1;">
                        🛏️ <strong>6. Personel Dinlenme Tesisi:</strong> Şoförlerin yorgunluğunu %75 daha hızlı sıfırlar; kaza riskini önler.
                    </div>
                    <div style="background: rgba(15,23,42,0.6); padding: 10px 12px; border-radius: 8px; border-left: 3.5px solid #06b6d4; font-size: 0.84rem; color: #cbd5e1;">
                        📦 <strong>7. Lojistik & İkram Deposu:</strong> İkram maliyetini düşürür, otobüs bagajında ücretli kargo ile ek gelir sağlar.
                    </div>
                </div>
            </div>

            <!-- BİNA KARTLARI LİSTESİ -->
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(360px, 1fr)); gap: 16px;">
            `;

            this.institutionsData.forEach(inst => {
                const curLvl = this.getInstitutionLevel(inst.id);
                const curLvlObj = inst.levels[curLvl - 1];
                const isMax = (curLvl >= 3);
                const nextLvlObj = isMax ? null : inst.levels[curLvl];
                const canAfford = nextLvlObj ? (totalAvailable >= nextLvlObj.cost) : false;

                const benefitsListHtml = (inst.playerBenefits || []).map(b => `
                    <div style="margin-bottom: 4px; font-size: 0.84rem; color: #e2e8f0; line-height: 1.4;">
                        ${b}
                    </div>
                `).join('');

                html += `
                <div style="background: rgba(15, 23, 42, 0.9); border: 2px solid ${isMax ? '#eab308' : (curLvl === 2 ? '#38bdf8' : '#475569')}; border-radius: 14px; padding: 18px; display: flex; flex-direction: column; justify-content: space-between; box-shadow: 0 4px 20px rgba(0,0,0,0.35);">
                    <div>
                        <!-- Başlık ve Rozet -->
                        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
                            <div>
                                <div style="font-size: 1.2rem; font-weight: bold; color: #fff; display: flex; align-items: center; gap: 8px;">
                                    <span style="font-size: 1.4rem;">${inst.icon}</span>
                                    <span>${inst.name}</span>
                                </div>
                                <div style="color: #94a3b8; font-size: 0.82rem; margin-top: 3px;">
                                    📌 ${inst.category}
                                </div>
                            </div>
                            <span style="font-size: 0.82rem; padding: 4px 10px; border-radius: 6px; font-weight: bold; ${isMax ? 'background: rgba(234, 179, 8, 0.25); color: #facc15; border: 1.5px solid #eab308;' : (curLvl === 2 ? 'background: rgba(56, 189, 248, 0.2); color: #38bdf8; border: 1.5px solid #38bdf8;' : 'background: rgba(148, 163, 184, 0.15); color: #cbd5e1; border: 1px solid #64748b;')}">
                                ${curLvlObj.badge}
                            </span>
                        </div>

                        <!-- 3 Aşamalı Seviye Çubuğu (Stepper) -->
                        <div style="display: flex; gap: 5px; margin: 12px 0 14px 0;">
                            <div style="flex: 1; height: 7px; border-radius: 4px; background: #22c55e;"></div>
                            <div style="flex: 1; height: 7px; border-radius: 4px; background: ${curLvl >= 2 ? (curLvl === 2 ? '#38bdf8' : '#22c55e') : 'rgba(255,255,255,0.12)'};"></div>
                            <div style="flex: 1; height: 7px; border-radius: 4px; background: ${curLvl >= 3 ? '#eab308' : 'rgba(255,255,255,0.12)'};"></div>
                        </div>

                        <!-- 1. KUTU: NASIL GELİŞTİRİLİR? -->
                        <div style="background: linear-gradient(135deg, rgba(30, 58, 138, 0.25), rgba(15, 23, 42, 0.6)); border: 1px solid rgba(56, 189, 248, 0.3); border-radius: 9px; padding: 12px; margin-bottom: 10px;">
                            <div style="color: #38bdf8; font-weight: bold; font-size: 0.85rem; margin-bottom: 4px; display: flex; align-items: center; gap: 5px;">
                                <span>📌</span> <span>Nasıl Geliştirilir?</span>
                            </div>
                            <div style="color: #e2e8f0; font-size: 0.85rem; line-height: 1.45;">
                                ${inst.howToUpgrade || inst.simpleSummary}
                            </div>
                        </div>

                        <!-- 2. KUTU: NE KAZANDIRIR? -->
                        <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255,255,255,0.08); border-radius: 9px; padding: 12px; margin-bottom: 12px;">
                            <div style="color: #facc15; font-weight: bold; font-size: 0.85rem; margin-bottom: 6px; display: flex; align-items: center; gap: 5px;">
                                <span>💰</span> <span>Ne Kazandırır?</span>
                            </div>
                            ${benefitsListHtml}
                        </div>

                        <!-- 3. KUTU: MEVCUT SEVİYE GÜCÜ -->
                        <div style="background: rgba(34, 197, 94, 0.12); border: 1.5px solid rgba(34, 197, 94, 0.35); border-radius: 9px; padding: 12px; margin-bottom: 10px;">
                            <div style="color: #4ade80; font-size: 0.84rem; font-weight: bold; margin-bottom: 3px; display: flex; align-items: center; gap: 5px;">
                                <span>✓</span> <span>ŞU ANKİ SEVİYEN: ${curLvlObj.title}</span>
                            </div>
                            <div style="color: #f1f5f9; font-size: 0.85rem; line-height: 1.4;">
                                ${curLvlObj.simplePerk || curLvlObj.perkDesc}
                            </div>
                        </div>

                        <!-- 4. KUTU: SONRAKİ SEVİYEDE NE KAZANACAKSINIZ? -->
                        ${!isMax && nextLvlObj ? `
                            <div style="background: rgba(56, 189, 248, 0.1); border: 1.5px solid rgba(56, 189, 248, 0.35); border-radius: 9px; padding: 12px; margin-bottom: 14px;">
                                <div style="color: #38bdf8; font-size: 0.84rem; font-weight: bold; margin-bottom: 3px; display: flex; align-items: center; gap: 5px;">
                                    <span>★</span> <span>SEVİYE ${nextLvlObj.level} HEDEFİ: ${nextLvlObj.title}</span>
                                </div>
                                <div style="color: #cbd5e1; font-size: 0.85rem; line-height: 1.4;">
                                    ${nextLvlObj.simplePerk || nextLvlObj.perkDesc}
                                </div>
                                <div style="margin-top: 6px; font-size: 0.82rem; color: #fde047; font-weight: bold;">
                                    💰 Geliştirme Ücreti: ${nextLvlObj.cost.toLocaleString('tr-TR')} ₺
                                </div>
                            </div>
                        ` : `
                            <div style="background: rgba(234, 179, 8, 0.12); border: 1.5px solid rgba(234, 179, 8, 0.4); border-radius: 9px; padding: 12px; margin-bottom: 14px; text-align: center; color: #fde047; font-weight: bold; font-size: 0.88rem;">
                                👑 TEBRİKLER! Bu tesis maksimum zirve seviyeye ulaştırıldı.
                            </div>
                        `}
                    </div>

                    <!-- AKSİYON BUTONU -->
                    <div>
                        ${isMax ? `
                            <button class="modern-btn" disabled style="width: 100%; padding: 12px; background: rgba(234, 179, 8, 0.2); border: 1.5px solid #eab308; color: #facc15; font-weight: 800; border-radius: 8px; font-size: 0.94rem;">
                                👑 MAKSİMUM SEVİYEYE ULAŞILDI
                            </button>
                        ` : `
                            <button class="modern-btn btn-upgrade-institution nav-item" data-inst-id="${inst.id}" style="width: 100%; padding: 12px; background: ${canAfford ? 'linear-gradient(135deg, #0284c7, #0369a1)' : 'rgba(255,255,255,0.06)'}; border: 1.5px solid ${canAfford ? '#38bdf8' : '#475569'}; color: ${canAfford ? '#ffffff' : '#94a3b8'}; font-weight: 800; border-radius: 8px; cursor: pointer; font-size: 0.95rem; box-shadow: ${canAfford ? '0 4px 15px rgba(2, 132, 199, 0.4)' : 'none'};" aria-label="${inst.name} tesisini Seviye ${nextLvlObj.level}'e büyüt. Ücret: ${nextLvlObj.cost.toLocaleString('tr-TR')} TL. Sağlayacağı avantaj: ${nextLvlObj.simplePerk || nextLvlObj.perkShort}">
                                🚀 Binayı Büyüt (Seviye ${nextLvlObj.level}'e Yükselt) — ${nextLvlObj.cost.toLocaleString('tr-TR')} ₺
                            </button>
                        `}
                    </div>
                </div>
                `;
            });

            html += `</div>`;
            container.innerHTML = html;

            container.querySelectorAll('.btn-upgrade-institution').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const instId = e.currentTarget.getAttribute('data-inst-id');
                    this.upgradeInstitution(instId);
                });
            });
        },

        // Şirket Arama (Kaptan + Kurumsal)
        getCompanyById: function(companyId) {
            if (!companyId) return null;
            const captains = this.getCaptainCompanies();
            const capComp = captains.find(c => c.id === companyId);
            if (capComp) return capComp;
            return this.corporateCompanies.find(c => c.id === companyId) || null;
        },

        // Yeni Şirket Kurma Modalını Aç
        openCreateCompanyModal: function() {
            this.injectCreateCompanyModal();
            const modal = document.getElementById('create-company-modal');
            if (modal) {
                modal.classList.remove('hidden');
                const inpName = document.getElementById('new-comp-name');
                if (inpName) {
                    inpName.value = this.data.companyName || "Mikyas Express Seyahat";
                    inpName.focus();
                }
                const inpFounder = document.getElementById('new-comp-founder');
                if (inpFounder) {
                    inpFounder.value = (typeof Game !== 'undefined' && Game.username) ? Game.username : "Ümit Ekrem Mikyas";
                }
                const inpCity = document.getElementById('new-comp-city');
                if (inpCity) {
                    inpCity.value = (typeof Game !== 'undefined' && Game.currentCity) ? `${Game.currentCity} (${Game.activeDistrict || 'Süleymanpaşa'})` : "Tekirdağ (Süleymanpaşa)";
                }
                if (typeof audio !== 'undefined' && audio.speak) {
                    audio.speak("Yeni bir şirket kurma penceresi açıldı. Şirketinizin adını, çalıştıracağınız kaptan sayısını ve vereceğiniz günlük maaşı belirleyebilirsiniz.");
                }
            }
        },

        // Yeni Şirket Kurma Modalını Enjekte Et
        injectCreateCompanyModal: function() {
            if (document.getElementById('create-company-modal')) return;

            const modalHtml = `
            <div id="create-company-modal" class="modal-overlay modal hidden" role="dialog" aria-modal="true" aria-labelledby="create-comp-title" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.92); z-index: 8900; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(10px);">
                <div class="glass-panel" style="max-width: 620px; width: 95%; padding: 24px 28px; text-align: left; max-height: 92vh; overflow-y: auto; border: 2px solid #f59e0b; box-shadow: 0 0 45px rgba(245, 158, 11, 0.4); border-radius: 14px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; border-bottom: 1px solid rgba(250, 204, 21, 0.2); padding-bottom: 10px;">
                        <h2 id="create-comp-title" style="margin: 0; font-size: 1.6rem; color: #facc15; display: flex; align-items: center; gap: 8px;">
                            🏢 Yeni Bir Şirket Kur
                        </h2>
                        <button id="btn-close-create-comp-modal" class="modern-btn nav-item" style="padding: 6px 14px; background: rgba(239, 68, 68, 0.2); border: 1px solid #ef4444; color: #fca5a5; font-weight: bold; border-radius: 8px; cursor: pointer;" aria-label="Pencereyi kapat">✕ Kapat</button>
                    </div>

                    <form id="form-create-company" onsubmit="event.preventDefault();" style="display: flex; flex-direction: column; gap: 14px;">
                        <div>
                            <label for="new-comp-name" style="display: block; color: #fde047; font-weight: bold; font-size: 0.95rem; margin-bottom: 4px;">🏢 Şirketinizin Adı:</label>
                            <input id="new-comp-name" type="text" maxlength="40" required placeholder="Örn: Mikyas Seyahat, Trakya Lojistik" style="width: 100%; padding: 10px 14px; background: rgba(15, 23, 42, 0.9); border: 1.5px solid #ca8a04; color: #fff; border-radius: 8px; font-size: 1rem; box-sizing: border-box;" />
                        </div>

                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                            <div>
                                <label for="new-comp-founder" style="display: block; color: #cbd5e1; font-size: 0.9rem; margin-bottom: 4px;">👑 Kurucu Kaptan:</label>
                                <input id="new-comp-founder" type="text" maxlength="30" required style="width: 100%; padding: 9px 12px; background: rgba(15, 23, 42, 0.9); border: 1px solid #475569; color: #fff; border-radius: 8px; font-size: 0.95rem; box-sizing: border-box;" />
                            </div>
                            <div>
                                <label for="new-comp-city" style="display: block; color: #cbd5e1; font-size: 0.9rem; margin-bottom: 4px;">📍 Merkez Şehir:</label>
                                <input id="new-comp-city" type="text" maxlength="40" style="width: 100%; padding: 9px 12px; background: rgba(15, 23, 42, 0.9); border: 1px solid #475569; color: #fff; border-radius: 8px; font-size: 0.95rem; box-sizing: border-box;" />
                            </div>
                        </div>

                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                            <div>
                                <label for="new-comp-quota" style="display: block; color: #38bdf8; font-weight: bold; font-size: 0.92rem; margin-bottom: 4px;">👥 Kaç Kaptan Çalıştırmak İstiyorsunuz?</label>
                                <input id="new-comp-quota" type="number" min="1" max="100" value="10" required style="width: 100%; padding: 9px 12px; background: rgba(15, 23, 42, 0.9); border: 1.5px solid #0284c7; color: #fff; border-radius: 8px; font-size: 0.95rem; box-sizing: border-box;" placeholder="Örn: 10 Kaptan" />
                                <small style="color: #94a3b8; font-size: 0.78rem; display: block; margin-top: 3px;">Kurucu olarak çalıştıracağınız kaptan sayısını siz belirlersiniz.</small>
                            </div>
                            <div>
                                <label for="new-comp-salary" style="display: block; color: #4ade80; font-weight: bold; font-size: 0.92rem; margin-bottom: 4px;">💰 Kaptanlara Verilecek Günlük Maaş (₺):</label>
                                <input id="new-comp-salary" type="number" min="500" max="50000" step="100" value="2500" required style="width: 100%; padding: 9px 12px; background: rgba(15, 23, 42, 0.9); border: 1.5px solid #16a34a; color: #fff; border-radius: 8px; font-size: 0.95rem; box-sizing: border-box;" placeholder="Örn: 2500 ₺" />
                                <small style="color: #94a3b8; font-size: 0.78rem; display: block; margin-top: 3px;">Kaptanlarınıza ödenecek günlük maaşı siz belirlersiniz.</small>
                            </div>
                        </div>

                        <div>
                            <label for="new-comp-share" style="display: block; color: #fde047; font-weight: bold; font-size: 0.92rem; margin-bottom: 4px;">
                                📊 Şirket / Kaptan Hasılat Bölüşümü:
                            </label>
                            <select id="new-comp-share" style="width: 100%; padding: 9px 12px; background: rgba(15, 23, 42, 0.9); border: 1.5px solid #ca8a04; color: #fff; border-radius: 8px; font-size: 0.95rem; box-sizing: border-box;">
                                <option value="50" selected>%50 Şirket Kasasına / %50 Kaptana Kalsın (Standart & Önerilen)</option>
                                <option value="40">%40 Şirket Kasasına / %60 Kaptana (Kaptan Teşvikli)</option>
                                <option value="30">%30 Şirket Kasasına / %70 Kaptana (Yüksek Kaptan Payı)</option>
                                <option value="60">%60 Şirket Kasasına / %40 Kaptana (Şirket Büyüme)</option>
                                <option value="70">%70 Şirket Kasasına / %30 Kaptana (Holding Yatırımı)</option>
                                <option value="0">%0 Şirket / %100 Kaptana (Tamamı Kaptana Kalsın - Serbest)</option>
                                <option value="100">%100 Şirkete / %0 Kaptana (Tamamı Şirket Kasasına)</option>
                            </select>
                            <small style="color: #94a3b8; font-size: 0.78rem; display: block; margin-top: 3px;">
                                Kurucu olarak bilet ve sefer hasılatının % kaçının şirkete aktarılacağını, % kaçının kaptana kalacağını serbestçe belirlersiniz.
                            </small>
                        </div>

                        <div>
                            <label for="new-comp-bonus" style="display: block; color: #cbd5e1; font-size: 0.9rem; margin-bottom: 4px;">🎁 Sefer Başı Bilet Primi:</label>
                            <select id="new-comp-bonus" style="width: 100%; padding: 9px 12px; background: rgba(15, 23, 42, 0.9); border: 1px solid #475569; color: #fff; border-radius: 8px; font-size: 0.95rem; box-sizing: border-box;">
                                <option value="10">%10 Bilet Satış Primi</option>
                                <option value="15">%15 Bilet Satış Primi</option>
                                <option value="20" selected>%20 Bilet Satış Primi (Tavsiye Edilen)</option>
                                <option value="25">%25 Bilet Satış Primi</option>
                                <option value="30">%30 Yüksek Sefer Primi</option>
                            </select>
                        </div>

                        <div>
                            <label for="new-comp-slogan" style="display: block; color: #cbd5e1; font-size: 0.9rem; margin-bottom: 4px;">📢 Şirket Sloganı:</label>
                            <input id="new-comp-slogan" type="text" maxlength="60" value="Türkiye Karayollarında Güven ve Konfor" style="width: 100%; padding: 9px 12px; background: rgba(15, 23, 42, 0.9); border: 1px solid #475569; color: #fff; border-radius: 8px; font-size: 0.95rem; box-sizing: border-box;" />
                        </div>

                        <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 10px;">
                            <button id="btn-cancel-create-comp" type="button" class="modern-btn nav-item" style="padding: 10px 20px; background: rgba(255,255,255,0.08); border: 1px solid #64748b; color: #cbd5e1; border-radius: 8px; cursor: pointer;">
                                Vazgeç
                            </button>
                            <button id="btn-submit-create-comp" type="submit" class="modern-btn nav-item" style="padding: 10px 24px; background: linear-gradient(135deg, #f59e0b, #d97706); color: #000; font-weight: bold; border-radius: 8px; border: none; cursor: pointer; font-size: 1rem; box-shadow: 0 4px 15px rgba(245, 158, 11, 0.4);">
                                🏢 Şirketi Kur ve Tescille
                            </button>
                        </div>
                    </form>
                </div>
            </div>`;

            document.body.insertAdjacentHTML('beforeend', modalHtml);

            document.getElementById('btn-close-create-comp-modal').addEventListener('click', () => {
                document.getElementById('create-company-modal').classList.add('hidden');
            });
            document.getElementById('btn-cancel-create-comp').addEventListener('click', () => {
                document.getElementById('create-company-modal').classList.add('hidden');
            });

            document.getElementById('form-create-company').addEventListener('submit', () => {
                const name = document.getElementById('new-comp-name').value.trim();
                const founder = document.getElementById('new-comp-founder').value.trim();
                const city = document.getElementById('new-comp-city').value.trim();
                const quota = document.getElementById('new-comp-quota').value;
                const salary = document.getElementById('new-comp-salary').value;
                const bonus = document.getElementById('new-comp-bonus').value;
                const slogan = document.getElementById('new-comp-slogan').value.trim();

                if (!name) return;

                const compObj = this.registerCaptainCompany({
                    name: name,
                    founder: founder,
                    city: city,
                    maxCaptainsQuota: quota,
                    activeCaptainsCount: 1,
                    dailySalary: salary,
                    bonusPercent: bonus,
                    companySharePercent: sharePercent,
                    slogan: slogan
                });

                this.data.companyName = name;
                this.data.revenueSharePercent = sharePercent;
                this.saveData();

                document.getElementById('create-company-modal').classList.add('hidden');

                const succMsg = `Tebrikler! ${name} şirketi başarıyla kuruldu. Kurucu kaptan: ${founder}. Kontenjan: ${quota}, günlük maaş: ${parseInt(salary).toLocaleString('tr-TR')} ₺ olarak tescillendi.`;
                if (typeof audio !== 'undefined' && audio.speak) audio.speak(succMsg);
                if (typeof UI !== 'undefined' && UI.showToast) UI.showToast(`🏢 ${name} Şirketi Başarıyla Kuruldu!`, "success");

                this.renderAll();

                // Var Olan Şirkete Katıl sekmesine geçip yeni şirketi göstersin
                const tabCorp = document.getElementById('tab-comp-corporate-work');
                if (tabCorp) tabCorp.click();
            });
        },

        // Şirketler Sadece Gerçek İnsanlar / Kaptanlar Tarafından Kurulur (Yapay Şirket Bulunmaz)
        corporateCompanies: [],

        // Şoför Rütbe ve Terfi Basamakları
        ranks: [
            { level: 1, title: "Stajyer Şoför", badge: "🌱", reqXP: 0, speedMod: 0.95, bonusRev: 1.0, desc: "Mesleğe yeni adım atmış, acemi ama hevesli çırak şoför." },
            { level: 2, title: "Yardımcı Kaptan", badge: "🔰", reqXP: 120, speedMod: 1.05, bonusRev: 1.15, desc: "Yolları öğrenmiş, şehir içi ve ilçeler arası hatta güvenilir yardımcı şoför." },
            { level: 3, title: "Kaptan Şoför", badge: "🚌", reqXP: 350, speedMod: 1.15, bonusRev: 1.30, desc: "Tam yetkili usta kaptan. Şehirlerarası uzun yollarda yolcu güvenini kazanır." },
            { level: 4, title: "Kıdemli Uzun Yol Kaptanı", badge: "⭐", reqXP: 800, speedMod: 1.25, bonusRev: 1.50, desc: "Bolu Dağı ve kar kış demeden her yolda tecrübesini konuşturan kıdemli kurt şoför." },
            { level: 5, title: "Baş Kaptan & Filo Ustası", badge: "👑", reqXP: 1600, speedMod: 1.35, bonusRev: 1.85, desc: "Şirketin gözbebeği efsane kaptan. En yüksek hasılatı ve maksimum bahşişi toplar." }
        ],

        // Şirket Büyüme Seviyeleri (HQ Titles)
        companyLevels: [
            { level: 1, title: "Sahil Yazıhanesi", badge: "🏠", reqTrips: 0, reqRev: 0, perkDesc: "Başlangıç yazıhanesi. 2 şoföre kadar filo kapasitesi." },
            { level: 2, title: "Trakya Bölge Acentesi", badge: "🏢", reqTrips: 4, reqRev: 5000, perkDesc: "4 şoför kapasitesi. Şoför dinlenme sürelerinde %20 kısalma." },
            { level: 3, title: "Marmara Lojistik & Seyahat", badge: "🏙️", reqTrips: 12, reqRev: 18000, perkDesc: "6 şoför kapasitesi. Otogar biletlerinde %10 kurumsal prim." },
            { level: 4, title: "Ulusal Karayolları Markası", badge: "⭐", reqTrips: 28, reqRev: 50000, perkDesc: "8 şoför kapasitesi. Tüm filoda %15 akaryakıt anlaşması indirimi." },
            { level: 5, title: "Altın Yıldızlı Holding", badge: "👑", reqTrips: 60, reqRev: 120000, perkDesc: "Sınırsız filo. Her seferde +%25 holding kâr payı bonusu." }
        ],

        // Şoför Pazarında Kiralanabilecek Akıllı Kaptanlar (Traits & Personalities)
        driverMarket: [
            {
                id: "drv_murat",
                name: "Murat Çırak",
                avatar: "👨‍💼",
                startRankLevel: 1,
                startXP: 0,
                wagePerTrip: 140,
                hireFee: 300,
                traitId: "trait_apprentice",
                traitName: "Çırak Azmi",
                traitBadge: "🌱",
                traitDesc: "Her seferde +%60 daha fazla tecrübe (XP) kazanır. Çabucak usta kaptana dönüşür.",
                desc: "Genç ve son derece gayretli. Sefer yaptıkça roket gibi seviye atlar!",
                preferredBusClass: "kucuk"
            },
            {
                id: "drv_mehmet",
                name: "Mehmet Kaptan",
                avatar: "👨‍✈️",
                startRankLevel: 2,
                startXP: 140,
                wagePerTrip: 260,
                hireFee: 650,
                traitId: "trait_eco",
                traitName: "Ekonomik Ayak",
                traitBadge: "🍃",
                traitDesc: "Mükemmel gaz pedalı disiplini. Yakıt tüketimini %30 azaltır, otobüs aşınmasını %50 düşürür.",
                desc: "Yakıt cimrisi ve dikkatli şoför. Şirketin işletme giderlerini dibe çeker.",
                preferredBusClass: "orta"
            },
            {
                id: "drv_ayse",
                name: "Ayşe Kaptan",
                avatar: "👩‍✈️",
                startRankLevel: 2,
                startXP: 220,
                wagePerTrip: 340,
                hireFee: 850,
                traitId: "trait_vip",
                traitName: "VIP Zerafet & İkram",
                traitBadge: "✨",
                traitDesc: "Yolcuların gözdesidir. Bilet hasılatına +%45 VIP bahşiş ve memnuniyet primi ekler.",
                desc: "Çok kibar ve titiz. Lüks seyahat otobüslerinde devasa ciro patlaması yaşatır.",
                preferredBusClass: "buyuk"
            },
            {
                id: "drv_ahmet",
                name: "Ahmet Kaptan",
                avatar: "👨‍✈️",
                startRankLevel: 3,
                startXP: 450,
                wagePerTrip: 420,
                hireFee: 1200,
                traitId: "trait_winter",
                traitName: "Bolu Dağı Kurdu",
                traitBadge: "❄️",
                traitDesc: "Kar, fırtına ve zorlu dağ yollarında asla gecikmez; kaza/arıza riski %0'dır.",
                desc: "Zorlu maratonların yenilmez kaptanı. Erzurum ve Bolu dağlarında rakipsizdir.",
                preferredBusClass: "buyuk"
            },
            {
                id: "drv_kemal",
                name: "Kemal Usta",
                avatar: "🧔",
                startRankLevel: 4,
                startXP: 950,
                wagePerTrip: 550,
                hireFee: 1800,
                traitId: "trait_mentor",
                traitName: "Filo Duayeni & Lider",
                traitBadge: "👑",
                traitDesc: "Tüm filoya ilham verir. Şirketteki TÜM şoförlerin sefer gelirine +%12 filo liderliği payı katar.",
                desc: "Otogarların yaşayan efsanesi. Varlığı bile şirketin değerini ikiye katlar.",
                preferredBusClass: "buyuk"
            },
            {
                id: "drv_selim",
                name: "Selim Kaptan",
                avatar: "⚡",
                startRankLevel: 2,
                startXP: 180,
                wagePerTrip: 300,
                hireFee: 750,
                traitId: "trait_speed",
                traitName: "Gece Kuşu & Seri Sürüş",
                traitBadge: "🌙",
                traitDesc: "Otoyollarda akıcı sürüş yapar. Sefer sürelerini %25 daha hızlı tamamlar.",
                desc: "Vakit nakittir diyen seri şoför. Ekspres hatlarda saat gibi çalışır.",
                preferredBusClass: "orta"
            },
            {
                id: "drv_fatma",
                name: "Fatma Kaptan",
                avatar: "🧕",
                startRankLevel: 3,
                startXP: 400,
                wagePerTrip: 390,
                hireFee: 1100,
                traitId: "trait_punctual",
                traitName: "Çelik Disiplin & Dakiklik",
                traitBadge: "🎯",
                traitDesc: "Tam zamanında perona yanaşır. Her sefer bitiminde +%25 dakiklik ikramiyesi kazandırır.",
                desc: "Kusursuz zamanlama ustası. Sefer gecikmelerine asla izin vermez.",
                preferredBusClass: "buyuk"
            }
        ],

        // Şirket Sefer Rotaları
        availableRoutes: [
            {
                id: "route_corlu",
                name: "Süleymanpaşa ➔ Çorlu - Çerkezköy (Sanayi Ring)",
                distKm: 45,
                minRankLevel: 1,
                routeType: "kucuk", // Küçük/Midibüs için optimize
                baseDurationSeconds: 60,
                baseTicketPrice: 75,
                avgPassengers: 32,
                fuelCost: 140,
                xpReward: 45,
                desc: "Fabrika vardiyaları ve ilçe ringi. Küçük ve çevik araçlar için mükemmel kârlılık."
            },
            {
                id: "route_ist",
                name: "Tekirdağ ➔ İstanbul (Esenler Otogar Ekspresi)",
                distKm: 135,
                minRankLevel: 2,
                routeType: "orta", // Standart solo veya VIP
                baseDurationSeconds: 100,
                baseTicketPrice: 195,
                avgPassengers: 40,
                fuelCost: 340,
                xpReward: 95,
                desc: "Marmara koridorunun kalbi. Kesintisiz yolcu talebi ve yüksek nakit akışı."
            },
            {
                id: "route_izm",
                name: "Tekirdağ ➔ Bursa - İzmir (Ege Turizm Hattı)",
                distKm: 420,
                minRankLevel: 3,
                routeType: "buyuk", // VIP Seyahat
                baseDurationSeconds: 165,
                baseTicketPrice: 440,
                avgPassengers: 42,
                fuelCost: 720,
                xpReward: 170,
                desc: "Çanakkale Köprüsü geçişli Ege sahili turizm koridoru. VIP araçlarda hasılat katlanır."
            },
            {
                id: "route_ank",
                name: "Tekirdağ ➔ Bolu Dağı - Ankara (AŞTİ Başkent)",
                distKm: 585,
                minRankLevel: 4,
                routeType: "buyuk", // VIP Seyahat
                baseDurationSeconds: 210,
                baseTicketPrice: 510,
                avgPassengers: 46,
                fuelCost: 950,
                xpReward: 230,
                desc: "Bolu Dağı geçişli prestijli başkent seferi. Kıdemli kaptanlar ve lüks filolar için."
            },
            {
                id: "route_antalya",
                name: "Tekirdağ ➔ Denizli Travertenleri - Antalya (Akdeniz Ekspresi)",
                distKm: 780,
                minRankLevel: 4,
                routeType: "buyuk",
                baseDurationSeconds: 260,
                baseTicketPrice: 680,
                avgPassengers: 45,
                fuelCost: 1250,
                xpReward: 290,
                desc: "Turizm cennetine doğrudan VIP ekspres. Yerli ve yabancı yolculardan yüksek bahşiş."
            },
            {
                id: "route_erz",
                name: "Tekirdağ ➔ Sivas - Erzurum (Palandöken Maratonu)",
                distKm: 1360,
                minRankLevel: 5,
                routeType: "buyuk",
                baseDurationSeconds: 340,
                baseTicketPrice: 980,
                avgPassengers: 48,
                fuelCost: 1900,
                xpReward: 420,
                desc: "Türkiye'nin en uzun karlı maratonu. Usta Baş Kaptanlar için devasa servet kapısı."
            }
        ],

        // Piyasa Trendleri Havuzu (Dinamik Borsa Olayları)
        marketTrendTemplates: [
            {
                trendName: "Cuma Akşamı Otogar Yoğunluğu",
                icon: "🔥",
                multiplier: 1.85,
                desc: "Hafta sonu tatili nedeniyle tüm koltuklar kapış kapış! Bilet fiyatı x1.85!",
                targetRouteIds: ["route_ist", "route_corlu"]
            },
            {
                trendName: "Ege Yaz Tatili & Çeşme Akını",
                icon: "🏖️",
                multiplier: 1.75,
                desc: "Ege sahillerine yoğun tatilci akını. VIP biletlere hücum var! Bilet x1.75!",
                targetRouteIds: ["route_izm"]
            },
            {
                trendName: "Meclis & Kongre Haftası",
                icon: "🏛️",
                multiplier: 1.65,
                desc: "Başkentte resmi heyet ve kongre hareketliliği. Başkent seferi x1.65 ciro getirir!",
                targetRouteIds: ["route_ank"]
            },
            {
                trendName: "Fabrika Vardiya Değişimi",
                icon: "⚙️",
                multiplier: 1.55,
                desc: "Organize Sanayi Bölgesinde yüzlerce işçi servisi talebi. Çorlu ringi x1.55!",
                targetRouteIds: ["route_corlu"]
            },
            {
                trendName: "Palandöken Kayak Festivali & Kar Maratonu",
                icon: "❄️",
                multiplier: 2.20,
                desc: "Erzurum'a kayak kafilesi akını! Rekor seviyede bilet hasılatı (x2.20)! Bolu kurdu kaptanlar parlar!",
                targetRouteIds: ["route_erz"]
            },
            {
                trendName: "Akdeniz Turizm Fuarı",
                icon: "🌴",
                multiplier: 1.90,
                desc: "Antalya 5 yıldızlı oteller bölgesinde transfer çılgınlığı! x1.90 bilet hasılatı!",
                targetRouteIds: ["route_antalya"]
            },
            {
                trendName: "Bahar Yağmurları & Dikkatli Sürüş",
                icon: "🌧️",
                multiplier: 1.20,
                desc: "Yollar ıslak, dikkatli sürüş gerekiyor. Bilet fiyatı ılımlı artışta (+%20).",
                targetRouteIds: ["route_corlu", "route_ist", "route_izm", "route_ank"]
            }
        ],

        // Özel Süreli VIP İhale Şablonları (Charter Contracts)
        contractTemplates: [
            {
                id: "contract_derbi",
                title: "⚽ Süper Lig Derbi Kafilesi Özel Seferi",
                client: "TFF Süper Lig Kulübü",
                icon: "🏆",
                routeId: "route_ist",
                rewardBonus: 3500,
                reqMinRank: 3,
                reqBusClass: "buyuk",
                desc: "Futbol takımını Esenler üzerinden stada götürün. Lüks VIP otobüs ve usta kaptan şartı!"
            },
            {
                id: "contract_festival",
                title: " Kiraz Festivali Protokol Transferi",
                client: "Tekirdağ Büyükşehir Belediyesi",
                icon: "🍒",
                routeId: "route_corlu",
                rewardBonus: 2200,
                reqMinRank: 2,
                reqBusClass: "orta",
                desc: "Uluslararası davetlileri ve sanatçıları sahil kordonuna taşıyın. Yüksek bahşiş garantili!"
            },
            {
                id: "contract_holding",
                title: "💼 Uluslararası CEO & Yatırımcı Zirvesi",
                client: "Global Finans Konsorsiyumu",
                icon: "💎",
                routeId: "route_ank",
                rewardBonus: 5400,
                reqMinRank: 4,
                reqBusClass: "buyuk",
                desc: "Ankara Bakanlıklar kongresine yabancı diplomatları ulaştırın. Devasa prim!"
            },
            {
                id: "contract_kayak",
                title: "🎿 Milli Kayak Takımı Erzurum Kampı",
                client: "Kış Sporları Federasyonu",
                icon: "⛷️",
                routeId: "route_erz",
                rewardBonus: 7200,
                reqMinRank: 4,
                reqBusClass: "buyuk",
                desc: "Palandöken zirvesine milli sporcuları ve ekipmanları götürün. Zorlu dağ primi!"
            }
        ],

        simulationTimer: null,
        marketTimer: null,

        // Başlatma
        init: function () {
            this.loadData();

            // Şirkete tüm şoförler oyuncu tarafından Şoför Pazarı'ndan bizzat transfer edilir
            if (!Array.isArray(this.data.hiredDrivers)) {
                this.data.hiredDrivers = [];
            }

            // Piyasa trendlerini ve ihaleleri kontrol et / tazele
            this.refreshMarketTrendsIfNeeded();
            this.refreshSpecialContractsIfNeeded();

            // Arka planda sefer ilerletme döngüsü (Her 1 saniyede bir hassas simülasyon)
            if (!this.simulationTimer) {
                this.simulationTimer = setInterval(() => {
                    this.tickSimulation(1);
                }, 1000);
            }

            // Piyasa borsası ve ihaleleri her 90 saniyede bir yenile
            if (!this.marketTimer) {
                this.marketTimer = setInterval(() => {
                    this.updateMarketFluctuations();
                }, 90000);
            }

            console.log("[CompanySystem] Akıllı Şirket & Filo Yönetimi hazır. Şirket:", this.data.companyName);
        },

        // Verileri Yükle
        loadData: function () {
            try {
                let raw = localStorage.getItem(this.STORAGE_KEY);
                if (!raw) {
                    raw = localStorage.getItem(this.LEGACY_STORAGE_KEY);
                }
                if (raw) {
                    const parsed = JSON.parse(raw);
                    this.data = Object.assign(this.data, parsed);

                    // Eksik alanları tamamla
                    if (!this.data.institutions) {
                        this.data.institutions = {
                            headquarters: 1,
                            bus_garage: 1,
                            terminal_offices: 1,
                            maintenance_depot: 1,
                            driver_lodging: 1,
                            city_agencies: 1
                        };
                    }
                    if (!this.data.hqUpgrades) {
                        this.data.hqUpgrades = { fuelContract: false, luxuryLounge: false, terminalPlatform: false, corporateBrand: false };
                    }
                    if (!this.data.busConditions) {
                        this.data.busConditions = {};
                    }
                    if (!Array.isArray(this.data.radioLogs)) {
                        this.data.radioLogs = [];
                    }
                    if (!Array.isArray(this.data.specialContracts)) {
                        this.data.specialContracts = [];
                    }
                    if (!this.data.marketTrends || Object.keys(this.data.marketTrends).length === 0) {
                        this.data.marketTrends = {};
                    }

                    // Şoför nesnelerindeki eksik yeni özellikleri yamala
                    this.data.hiredDrivers.forEach(d => {
                        const marketInfo = this.driverMarket.find(m => m.id === d.id);
                        if (marketInfo) {
                            d.traitId = d.traitId || marketInfo.traitId;
                            d.traitName = d.traitName || marketInfo.traitName;
                            d.traitBadge = d.traitBadge || marketInfo.traitBadge;
                            d.traitDesc = d.traitDesc || marketInfo.traitDesc;
                            d.preferredBusClass = d.preferredBusClass || marketInfo.preferredBusClass;
                        }
                        if (d.energy === undefined) d.energy = 100;
                        if (!d.assignedBusId) d.assignedBusId = "otokar_kent_lf";
                        if (d.autoDispatch === undefined) d.autoDispatch = true;
                    });
                }
            } catch (e) {
                console.warn("[CompanySystem] Yükleme hatası:", e);
            }
        },

        // Verileri Kaydet
        saveData: function () {
            try {
                localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.data));
            } catch (e) {
                console.warn("[CompanySystem] Kaydetme hatası:", e);
            }
        },

        // Şoförün Rütbe Bilgisini Getir
        getDriverRankInfo: function (driver) {
            const lvl = driver.rankLevel || 1;
            return this.ranks.find(r => r.level === lvl) || this.ranks[0];
        },

        // Şoförün Sonraki Rütbeye Kalan XP Hedefi
        getNextRankXP: function (currentLvl) {
            const nextRank = this.ranks.find(r => r.level === currentLvl + 1);
            return nextRank ? nextRank.reqXP : 99999;
        },

        // Şirket Büyüme Seviyesini Kontrol Et ve Güncelle
        checkCompanyLevelUp: function () {
            const trips = this.data.completedTripsCount || 0;
            const rev = this.data.totalRevenue || 0;
            let currentLvl = this.data.companyLevel || 1;
            let newLvl = 1;

            for (let i = this.companyLevels.length - 1; i >= 0; i--) {
                const req = this.companyLevels[i];
                if (trips >= req.reqTrips && rev >= req.reqRev) {
                    newLvl = req.level;
                    break;
                }
            }

            if (newLvl > currentLvl) {
                this.data.companyLevel = newLvl;
                this.saveData();
                const lvlInfo = this.companyLevels.find(l => l.level === newLvl);
                const toastMsg = `🏢 ŞİRKET BÜYÜDÜ! Şirketiniz '${lvlInfo.badge} ${lvlInfo.title}' seviyesine terfi etti! (${lvlInfo.perkDesc})`;
                if (typeof audio !== 'undefined' && audio.playSuccess) audio.playSuccess();
                if (typeof audio !== 'undefined' && audio.speak) audio.speak(toastMsg);
                if (typeof UI !== 'undefined' && UI.showToast) UI.showToast(toastMsg, "success");
                this.addRadioLog("🏢 Merkez Ofis", "👨‍💼", `Şirketimiz resmi olarak '${lvlInfo.title}' unvanını aldı. Tüm filoya tebrikler!`, "system");
            }
        },

        // Telsiz Günlüğüne Mesaj Ekle
        addRadioLog: function (senderName, avatar, text, type = "normal") {
            const timeStr = new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
            this.data.radioLogs.unshift({
                time: timeStr,
                sender: senderName,
                avatar: avatar || "📻",
                text: text,
                type: type
            });
            if (this.data.radioLogs.length > 25) {
                this.data.radioLogs.pop();
            }
            this.saveData();
        },

        // Şirket Adını Değiştir
        setCompanyName: function (newName) {
            if (!newName || !newName.trim()) return;
            this.data.companyName = newName.trim().substring(0, 40);
            this.saveData();
            const msg = `Şirketinizin adı '${this.data.companyName}' olarak tescillendi.`;
            if (typeof audio !== 'undefined' && audio.speak) audio.speak(msg);
            if (typeof UI !== 'undefined' && UI.showToast) UI.showToast(`🏢 ${msg}`, "success");
            this.renderCompanyOverview();
        },

        // Şoför Kirala
        hireDriver: function (driverId, isFreeGift = false) {
            const driverInfo = this.driverMarket.find(d => d.id === driverId);
            if (!driverInfo) return false;

            if (this.data.hiredDrivers.some(d => d.id === driverId)) {
                if (typeof UI !== 'undefined') UI.showToast("Bu şoför zaten şirketinizde çalışıyor.", "warning");
                return false;
            }

            // Kapasite kontrolü: Garaj ve Filo Sahası Seviyesine Göre
            const garageLvl = this.getInstitutionLevel('bus_garage');
            let maxDriversAllowed = 5; // Seviye 1: 5 şoför
            if (garageLvl === 1) maxDriversAllowed = 5;
            else if (garageLvl === 2) maxDriversAllowed = 15;
            else if (garageLvl >= 3) maxDriversAllowed = 99;
            
            if (!isFreeGift && this.data.hiredDrivers.length >= maxDriversAllowed) {
                const limitMsg = `Garaj ve İstihdam Kapasitesi Dolu! Seviye ${garageLvl} Garaj Sahası en fazla ${maxDriversAllowed} şoför barındırabilir. Daha fazla kaptan istihdam etmek için Yasal Binalar sekmesinden Garaj ve Filo Sahası'nı Seviye ${garageLvl + 1}'e büyütün!`;
                if (typeof audio !== 'undefined' && audio.speak) audio.speak(limitMsg);
                if (typeof UI !== 'undefined') UI.showToast(`⛔ ${limitMsg}`, "warning");
                return false;
            }

            const currentBudget = (typeof Game !== 'undefined' && Game.playerBudget) ? Game.playerBudget : 0;
            if (!isFreeGift && currentBudget < driverInfo.hireFee) {
                const msg = `Yetersiz bakiye! ${driverInfo.name} transferi için ${driverInfo.hireFee} ₺ gerekiyor. Bakiyeniz: ${currentBudget} ₺.`;
                if (typeof audio !== 'undefined' && audio.speak) audio.speak(msg);
                if (typeof UI !== 'undefined') UI.showToast(msg, "warning");
                return false;
            }

            if (!isFreeGift && typeof Game !== 'undefined') {
                Game.playerBudget -= driverInfo.hireFee;
                Game.saveData();
                if (typeof UI !== 'undefined' && UI.updatePlayerStats) {
                    const title = (typeof Game.getLicenseTitle === 'function') ? Game.getLicenseTitle() : 'Kaptan';
                    UI.updatePlayerStats(Game.licenseLevel, Game.completedTasks, Game.playerBudget, title);
                }
            }

            const initialRankLvl = driverInfo.startRankLevel || 1;
            const rankObj = this.ranks.find(r => r.level === initialRankLvl) || this.ranks[0];

            // Şoför için uygun başlangıç aracını belirle
            const defaultBusId = (driverInfo.preferredBusClass === "kucuk") ? "otokar_sultan_mega" : "otokar_kent_lf";

            const hiredObj = {
                id: driverInfo.id,
                name: driverInfo.name,
                avatar: driverInfo.avatar,
                rankLevel: initialRankLvl,
                rankTitle: rankObj.title,
                rankBadge: rankObj.badge,
                currentXP: driverInfo.startXP || 0,
                wagePerTrip: driverInfo.wagePerTrip,
                status: "idle",
                energy: 100,
                assignedBusId: defaultBusId,
                assignedRouteId: "route_corlu",
                currentTripSeconds: 0,
                targetDurationSeconds: 60,
                totalTripsMade: 0,
                totalEarningsMade: 0,
                autoDispatch: true,
                traitId: driverInfo.traitId,
                traitName: driverInfo.traitName,
                traitBadge: driverInfo.traitBadge,
                traitDesc: driverInfo.traitDesc,
                preferredBusClass: driverInfo.preferredBusClass
            };

            this.data.hiredDrivers.push(hiredObj);
            this.saveData();

            // İlk seferini otomatik başlat
            this.dispatchDriver(driverInfo.id, "route_corlu", defaultBusId);

            const successMsg = isFreeGift 
                ? `Hayırlı olsun! Başlangıç çırağınız ${driverInfo.name} (${rankObj.badge} ${rankObj.title}) şirketinize katıldı! Sefere çıktıkça tecrübe kazanıp yükselecek.`
                : `Transfer başarılı! ${driverInfo.name} (${rankObj.badge} ${rankObj.title}) ${driverInfo.hireFee} ₺ bedelle şirketinize katıldı.`;

            this.playCashChime();
            if (typeof audio !== 'undefined' && audio.speak) audio.speak(successMsg);
            if (typeof UI !== 'undefined') UI.showToast(`🎉 ${successMsg}`, "success");
            this.addRadioLog(driverInfo.name, driverInfo.avatar, `Selamünaleyküm kaptanlar! Şirket bünyesine katıldım, tekerime taş değmesin!`, "success");

            this.renderAll();
            return true;
        },

        // Otobüs Bilgisini Getir
        getBusInfo: function (busId) {
            if (typeof BusFleet !== 'undefined' && BusFleet.buses) {
                const found = BusFleet.buses.find(b => b.id === busId);
                if (found) return found;
            }
            // Yedek varsayılan araçlar
            if (busId === "otokar_sultan_mega") {
                return { id: "otokar_sultan_mega", fullName: "Otokar Sultan Mega (Midibüs)", sizeTier: 1, sizeClass: "kucuk", seatCapacity: 29, tipBonusPercent: 12, icon: "🚐" };
            }
            if (busId === "mercedes_travego_16sh") {
                return { id: "mercedes_travego_16sh", fullName: "Mercedes-Benz Travego 16 SH (VIP)", sizeTier: 3, sizeClass: "buyuk", seatCapacity: 46, tipBonusPercent: 25, icon: "⭐" };
            }
            return { id: "otokar_kent_lf", fullName: "Otokar Kent LF (Solo)", sizeTier: 2, sizeClass: "orta", seatCapacity: 32, tipBonusPercent: 0, icon: "🚌" };
        },

        // Otobüs Kondisyonunu Al
        getBusCondition: function (busId) {
            if (this.data.busConditions[busId] === undefined) {
                this.data.busConditions[busId] = 100;
            }
            return this.data.busConditions[busId];
        },

        // Otobüse Bakım Yap
        repairBus: function (busId) {
            const bus = this.getBusInfo(busId);
            const curCond = this.getBusCondition(busId);
            if (curCond >= 98) {
                if (typeof UI !== 'undefined') UI.showToast(`${bus.fullName} zaten pırıl pırıl, bakıma ihtiyacı yok! (%100)`, "info");
                return false;
            }

            const garageLevel = (typeof this.getInstitutionLevel === 'function') ? this.getInstitutionLevel('garage_maintenance') : 1;
            let costMultiplier = 8;
            if (garageLevel === 2) costMultiplier = 4.4; // %45 Kademe İndirimi (Gelişmiş Liftler & Diagnostik)
            else if (garageLevel >= 3) costMultiplier = 2.8; // %65 Mega Kademe İndirimi (Kendi Revizyon Üssümüz)
            const repairCost = Math.round((100 - curCond) * costMultiplier);
            const currentBudget = (typeof Game !== 'undefined' && Game.playerBudget) ? Game.playerBudget : 0;
            if (currentBudget < repairCost) {
                const msg = `Yetersiz bakiye! ${bus.fullName} periyodik bakımı için ${repairCost} ₺ gerekiyor.`;
                if (typeof audio !== 'undefined' && audio.speak) audio.speak(msg);
                if (typeof UI !== 'undefined') UI.showToast(`⚠️ ${msg}`, "warning");
                return false;
            }

            if (typeof Game !== 'undefined') {
                Game.playerBudget -= repairCost;
                Game.saveData();
                if (typeof UI !== 'undefined' && UI.updatePlayerStats) {
                    const title = (typeof Game.getLicenseTitle === 'function') ? Game.getLicenseTitle() : 'Kaptan';
                    UI.updatePlayerStats(Game.licenseLevel, Game.completedTasks, Game.playerBudget, title);
                }
            }

            this.data.busConditions[busId] = 100;
            this.saveData();

            this.playCashChime();
            const doneMsg = `🛠️ ${bus.fullName} periyodik bakımı yapıldı! Yağ, frenler ve filtreler yenilendi. Kondisyon: %100 (-${repairCost} ₺).`;
            if (typeof audio !== 'undefined' && audio.speak) audio.speak(doneMsg);
            if (typeof UI !== 'undefined') UI.showToast(doneMsg, "success");
            this.renderAll();
            return true;
        },

        // Tüm Filoya Toplu Periyodik Bakım Yap
        repairAllFleet: function () {
            let totalCost = 0;
            const busesToFix = [];

            this.data.hiredDrivers.forEach(d => {
                const busId = d.assignedBusId || "otokar_kent_lf";
                const cond = this.getBusCondition(busId);
                if (cond < 90 && !busesToFix.some(b => b.busId === busId)) {
                    const garageLvl = (typeof this.getInstitutionLevel === 'function') ? this.getInstitutionLevel('garage_maintenance') : 1;
                    let mult = 8;
                    if (garageLvl === 2) mult = 4.4; // %45 İndirim
                    else if (garageLvl >= 3) mult = 2.8; // %65 İndirim
                    const cost = Math.round((100 - cond) * mult);
                    totalCost += cost;
                    busesToFix.push({ busId, cost });
                }
            });

            if (busesToFix.length === 0) {
                if (typeof UI !== 'undefined') UI.showToast("Tüm filonuzun kondisyonu yüksek, acil bakıma ihtiyaç yok!", "info");
                return;
            }

            const currentBudget = (typeof Game !== 'undefined' && Game.playerBudget) ? Game.playerBudget : 0;
            if (currentBudget < totalCost) {
                if (typeof UI !== 'undefined') UI.showToast(`Toplu bakım için ${totalCost} ₺ gerekiyor. Bakiyeniz yetersiz!`, "warning");
                return;
            }

            if (typeof Game !== 'undefined') {
                Game.playerBudget -= totalCost;
                Game.saveData();
                if (typeof UI !== 'undefined' && UI.updatePlayerStats) {
                    const title = (typeof Game.getLicenseTitle === 'function') ? Game.getLicenseTitle() : 'Kaptan';
                    UI.updatePlayerStats(Game.licenseLevel, Game.completedTasks, Game.playerBudget, title);
                }
            }

            busesToFix.forEach(b => {
                this.data.busConditions[b.busId] = 100;
            });
            this.saveData();

            this.playCashChime();
            const msg = `🛠️ FİLO SERVİSTE! ${busesToFix.length} otobüsün tüm bakımları tamamlandı! Kasadan -${totalCost} ₺ ödendi.`;
            if (typeof audio !== 'undefined' && audio.speak) audio.speak(msg);
            if (typeof UI !== 'undefined') UI.showToast(msg, "success");
            this.renderAll();
        },

        // Şoföre Kahve ve Dinlenme İkramı Ver
        boostDriverEnergy: function (driverId) {
            const driver = this.data.hiredDrivers.find(d => d.id === driverId);
            if (!driver) return;

            if (driver.energy >= 95) {
                if (typeof UI !== 'undefined') UI.showToast(`${driver.name} zaten tamamen dinlenmiş ve enerjik! (% ${driver.energy})`, "info");
                return;
            }

            const cost = 120; // 120 TL dinlenme tesisi ikramı
            const currentBudget = (typeof Game !== 'undefined' && Game.playerBudget) ? Game.playerBudget : 0;
            if (currentBudget < cost) {
                if (typeof UI !== 'undefined') UI.showToast(`İkram için ${cost} ₺ gerekiyor. Yetersiz bakiye!`, "warning");
                return;
            }

            if (typeof Game !== 'undefined') {
                Game.playerBudget -= cost;
                Game.saveData();
                if (typeof UI !== 'undefined' && UI.updatePlayerStats) {
                    const title = (typeof Game.getLicenseTitle === 'function') ? Game.getLicenseTitle() : 'Kaptan';
                    UI.updatePlayerStats(Game.licenseLevel, Game.completedTasks, Game.playerBudget, title);
                }
            }

            driver.energy = 100;
            this.saveData();

            this.playCashChime();
            const msg = `☕ ${driver.name} tesislerde duble çay & kahve molası verdi! Enerjisi %100 oldu!`;
            if (typeof audio !== 'undefined' && audio.speak) audio.speak(msg);
            if (typeof UI !== 'undefined') UI.showToast(msg, "success");
            this.renderAll();
        },

        // Şoförü Sefere Çıkart (Gerçek Araç ve Rota ile)
        dispatchDriver: function (driverId, routeId, busId) {
            const driver = this.data.hiredDrivers.find(d => d.id === driverId);
            const route = this.availableRoutes.find(r => r.id === routeId);
            if (!driver || !route) return false;

            const selectedBusId = busId || driver.assignedBusId || "otokar_kent_lf";
            const bus = this.getBusInfo(selectedBusId);

            // Uzun yol rütbe kontrolü
            if (route.minRankLevel && (driver.rankLevel || 1) < route.minRankLevel) {
                const reqRank = this.ranks.find(r => r.level === route.minRankLevel);
                const reqTitle = reqRank ? reqRank.title : `${route.minRankLevel}. Seviye Kaptan`;
                const warnMsg = `Uzun Yol Tecrübesi Yetersiz: ${driver.name} (${driver.rankTitle}), ${route.name} seferine çıkamaz! En az ${reqTitle} tecrübesi şarttır.`;
                if (typeof audio !== 'undefined' && audio.speak) audio.speak(warnMsg);
                if (typeof UI !== 'undefined' && UI.showToast) UI.showToast(`⛔ ${warnMsg}`, "warning");
                return false;
            }

            // Kondisyon kontrolü
            const cond = this.getBusCondition(selectedBusId);
            if (cond < 20) {
                const warnMsg = `ARIZA RİSKİ! ${bus.fullName} kondisyonu % ${cond}! Seferden önce acil bakım yaptırmalısınız.`;
                if (typeof audio !== 'undefined' && audio.speak) audio.speak(warnMsg);
                if (typeof UI !== 'undefined') UI.showToast(`⚠️ ${warnMsg}`, "warning");
                return false;
            }

            const rankInfo = this.getDriverRankInfo(driver);
            let speedMultiplier = rankInfo.speedMod || 1.0;

            // Şoför Trait Etkisi: Seri Sürüş
            if (driver.traitId === "trait_speed") {
                speedMultiplier *= 1.25;
            }

            // Kondisyon Hız Etkisi
            if (cond < 50) {
                speedMultiplier *= 0.85; // Yıpranmış otobüs yavaş gider
            }

            // Enerji Hız Etkisi
            if ((driver.energy || 100) < 30) {
                speedMultiplier *= 0.90; // Yorgun kaptan dikkatli ve yavaş gider
            }

            const baseSec = route.baseDurationSeconds || 60;
            const actualDuration = Math.max(25, Math.round(baseSec / speedMultiplier));

            driver.status = "on_trip";
            driver.assignedRouteId = route.id;
            driver.assignedBusId = selectedBusId;
            driver.currentTripSeconds = 0;
            driver.targetDurationSeconds = actualDuration;
            this.saveData();

            this.playRadioBeep();
            const msg = `${driver.rankBadge} ${driver.name}, ${bus.icon} ${bus.fullName} ile '${route.name}' seferine çıktı. Tahmini varış: ${Math.round(actualDuration / 60 * 10) / 10} dk.`;
            if (typeof UI !== 'undefined' && UI.showToast) UI.showToast(`🚌 ${msg}`, "info");
            this.addRadioLog(driver.name, driver.avatar, `${route.name} seferi için perondan teker döndürdük. Yolcularımız emanetimizdir!`, "info");
            this.renderAll();
            return true;
        },

        // BAŞHAREKÂT YÖNETİMİ: TEK TUŞLA AKILLI SEFER DAĞITIMI
        autoDispatchAllAI: function () {
            if (!this.data.hiredDrivers || this.data.hiredDrivers.length === 0) {
                if (typeof UI !== 'undefined') UI.showToast("Filoda kayıtlı şoför bulunamadı!", "warning");
                return;
            }

            // Sahip olunan veya mevcut otobüsler havuzunu belirle
            let availableBusIds = [];
            if (typeof BusFleet !== 'undefined' && typeof BusFleet.getOwnedBusIds === 'function') {
                availableBusIds = BusFleet.getOwnedBusIds();
            }
            if (!availableBusIds || availableBusIds.length === 0) {
                availableBusIds = ["otokar_sultan_mega", "otokar_kent_lf", "mercedes_travego_16sh"];
            }

            // Canlı piyasa borsa taleplerini değerlendir
            const trends = this.data.marketTrends || {};
            let dispatchedCount = 0;
            const dispatchReports = [];

            // Şoförleri rütbelerine ve uzmanlıklarına göre sırala (en tecrübeli şoför en karlı uzun hatta)
            const driversSorted = [...this.data.hiredDrivers].sort((a, b) => (b.rankLevel || 1) - (a.rankLevel || 1));

            driversSorted.forEach((driver, idx) => {
                // Şoförün ehliyetinin yettiği en karlı rotayı bul
                const eligibleRoutes = this.availableRoutes.filter(r => (driver.rankLevel || 1) >= (r.minRankLevel || 1));
                if (eligibleRoutes.length === 0) return;

                // Karlılık skorunu hesapla
                let bestRoute = eligibleRoutes[0];
                let maxProfitScore = -1;

                eligibleRoutes.forEach(r => {
                    const trend = trends[r.id];
                    const multiplier = trend ? trend.multiplier : 1.0;
                    const expectedRev = r.avgPassengers * r.baseTicketPrice * multiplier;
                    const netExpected = expectedRev - (r.fuelCost + driver.wagePerTrip);
                    
                    // Şoför Trait Sinerjisi
                    let synergyBonus = 1.0;
                    if (driver.traitId === "trait_winter" && r.id === "route_erz") synergyBonus = 1.4;
                    if (driver.traitId === "trait_vip" && (r.id === "route_izm" || r.id === "route_ank" || r.id === "route_antalya")) synergyBonus = 1.35;
                    if (driver.traitId === "trait_eco" && r.distKm > 300) synergyBonus = 1.25;
                    if (driver.traitId === "trait_apprentice" && r.id === "route_corlu") synergyBonus = 1.3;

                    const finalScore = netExpected * synergyBonus;
                    if (finalScore > maxProfitScore) {
                        maxProfitScore = finalScore;
                        bestRoute = r;
                    }
                });

                // Bu rota için en uygun otobüsü seç
                let chosenBusId = availableBusIds[0];
                if (bestRoute.routeType === "buyuk") {
                    // Tercihen Tier 3 VIP otobüs
                    const vipBus = availableBusIds.find(id => {
                        const b = this.getBusInfo(id);
                        return b.sizeTier === 3 || b.sizeClass === "buyuk";
                    });
                    if (vipBus) chosenBusId = vipBus;
                } else if (bestRoute.routeType === "kucuk") {
                    // Tercihen Tier 1 Midibüs
                    const midiBus = availableBusIds.find(id => {
                        const b = this.getBusInfo(id);
                        return b.sizeTier === 1 || b.sizeClass === "kucuk";
                    });
                    if (midiBus) chosenBusId = midiBus;
                }

                // Şoför yorgunsa otomatik enerji ikramı uygula (bütçe varsa)
                if (driver.energy < 25 && typeof Game !== 'undefined' && Game.playerBudget >= 120) {
                    driver.energy = 100;
                    Game.playerBudget -= 120;
                }

                // Kondisyon düşükse ve bütçe varsa hızlı tamir et
                const busCond = this.getBusCondition(chosenBusId);
                if (busCond < 40 && typeof Game !== 'undefined' && Game.playerBudget >= 300) {
                    this.data.busConditions[chosenBusId] = 100;
                    Game.playerBudget -= 300;
                }

                // Sefere çıkart
                this.dispatchDriver(driver.id, bestRoute.id, chosenBusId);
                dispatchedCount++;
                const bInfo = this.getBusInfo(chosenBusId);
                dispatchReports.push(`${driver.name} ➔ ${bInfo.fullName} ile ${bestRoute.name}`);
            });

            this.playAiDispatchSound();

            const summarySpeech = `Başharekât Müdürü ${dispatchedCount} şoförünüzü ve araçlarınızı canlı borsa taleplerine göre en yüksek kâr potansiyeliyle akıllıca seferlere dağıttı!`;
            if (typeof audio !== 'undefined' && audio.speak) audio.speak(summarySpeech);
            if (typeof UI !== 'undefined' && UI.showToast) {
                UI.showToast(`📋 AKILLI SEFER DAĞITIMI TAMAMLANDI: ${dispatchedCount} sefer başlatıldı!`, "success");
            }

            this.addRadioLog("👨‍💼 Başharekât Müdürü", "📋", `Akıllı Sefer Dağıtımı tamamlandı. Tüm filo en yüksek kâr potansiyeline göre sahaya sürüldü.`, "success");
            this.renderAll();
        },

        // Arka Plan Canlı Sefer Simülasyonu
        tickSimulation: function (deltaSec) {
            if (!this.data.hiredDrivers || this.data.hiredDrivers.length === 0) return;

            let stateChanged = false;

            // Dönemsel Sabit İşletme Giderleri (Her 60 simülasyon saniyesinde bir)
            this.overheadCounter = (this.overheadCounter || 0) + (deltaSec || 1);
            if (this.overheadCounter >= 60) {
                this.overheadCounter = 0;
                let branchCount = 0;
                if (this.data.terminalBranches) {
                    Object.values(this.data.terminalBranches).forEach(b => {
                        if (b && b.type === 'owned') branchCount++;
                    });
                }
                const branchRents = branchCount * 1200; // Şube peron kiraları

                let facilityLevels = 0;
                if (this.data.institutions) {
                    Object.values(this.data.institutions).forEach(lvl => {
                        if (lvl > 1) facilityLevels += (lvl - 1);
                    });
                }
                const facilityUpkeep = facilityLevels * 600; // Tesis bakım & elektrik

                const driverCount = (this.data.hiredDrivers && this.data.hiredDrivers.length) || 0;
                const driverInsurance = driverCount * 250; // Şoför sigorta ve taban lojman harcırahı

                const totalOverhead = branchRents + facilityUpkeep + driverInsurance;
                if (totalOverhead > 0) {
                    this.data.companyTreasury = (this.data.companyTreasury || 0) - totalOverhead;
                    this.recordTransaction('expense', 'branches', 'Dönemsel Şube, Garaj Bakım ve Personel Aidatları', totalOverhead);
                    this.saveData();
                    this.checkBankruptcyStatus();
                    stateChanged = true;
                }
            }

            this.data.hiredDrivers.forEach(driver => {
                if (driver.status === 'on_trip') {
                    const opsLvl = (typeof this.getInstitutionLevel === 'function') ? this.getInstitutionLevel('fleet_operations') : 1;
                    let speedMult = 1.0;
                    if (opsLvl === 2) speedMult = 1.25; // %25 daha hızlı sefer tamamlama
                    else if (opsLvl === 3) speedMult = 1.65; // %65 daha hızlı sefer tamamlama
                    driver.currentTripSeconds = (driver.currentTripSeconds || 0) + (deltaSec * speedMult);

                    // Sefer tamamlandı mı?
                    if (driver.currentTripSeconds >= driver.targetDurationSeconds) {
                        this.completeDriverTrip(driver);
                        stateChanged = true;
                    } else {
                        stateChanged = true;
                    }
                } else if (driver.status === 'resting') {
                    // 6. Personel Sosyal Tesisleri ve Dinlenme Odaları (Staff Lounge)
                    let restRate = 1.0;
                    const loungeLvl = (typeof this.getInstitutionLevel === 'function') ? this.getInstitutionLevel('driver_lodging') : 1;
                    if (loungeLvl === 2) restRate = 2.0; // Seviye 2: %50 daha hızlı dinlenme (2 kat)
                    else if (loungeLvl >= 3) restRate = 4.0; // Seviye 3: %75 daha hızlı dinlenme (4 kat)
                    if (this.data.hqUpgrades && this.data.hqUpgrades.luxuryLounge) restRate = Math.max(restRate, 2.0);
                    driver.restRemainingSeconds = (driver.restRemainingSeconds || 12) - (deltaSec * restRate);
                    
                    // Enerji yavaş yavaş dolar
                    if (driver.energy < 100) {
                        driver.energy = Math.min(100, (driver.energy || 50) + (1 * restRate));
                    }

                    if (driver.restRemainingSeconds <= 0) {
                        driver.status = 'idle';
                        stateChanged = true;

                        // Otomatik sefer modu aktifse hemen tekrar yola çıkart
                        if (driver.autoDispatch && driver.assignedRouteId) {
                            this.dispatchDriver(driver.id, driver.assignedRouteId, driver.assignedBusId);
                        }
                    }
                }
            });

            if (stateChanged) {
                this.updateLiveTripProgressUI();
            }
        },

        // Sefer Tamamlandığında Kazanç, Sinerji, Kondisyon ve Rütbe Hesaplaması
        completeDriverTrip: function (driver) {
            const route = this.availableRoutes.find(r => r.id === driver.assignedRouteId) || this.availableRoutes[0];
            const rankInfo = this.getDriverRankInfo(driver);
            const bus = this.getBusInfo(driver.assignedBusId);

            // 1. DİNAMİK BORSA ÇARPANI
            const trend = (this.data.marketTrends && this.data.marketTrends[route.id]) ? this.data.marketTrends[route.id] : null;
            const marketMultiplier = trend ? trend.multiplier : 1.0;

            // 2. YOLCU KAPASİTESİ VE BİLET HASILATI
            let basePass = route.avgPassengers + Math.floor(Math.random() * 6);
            const ticketingLvl = (typeof this.getInstitutionLevel === 'function') ? this.getInstitutionLevel('ticketing_network') : 1;
            if (ticketingLvl === 2) basePass = Math.round(basePass * 1.35);
            else if (ticketingLvl === 3) basePass = Math.round(basePass * 1.60);

            if (this.data.hqUpgrades && this.data.hqUpgrades.terminalPlatform) {
                basePass = Math.round(basePass * 1.25); // +%25 peron yolcu çekme
            }

            // Araç koltuk kapasitesini aşamaz
            const passengerCount = Math.min(bus.seatCapacity || 45, basePass);

            // Bilet Fiyatı & Çarpanlar
            let ticketPrice = route.baseTicketPrice * (rankInfo.bonusRev || 1.0) * marketMultiplier;
            if (this.data.hqUpgrades && this.data.hqUpgrades.corporateBrand) {
                ticketPrice *= 1.25; // Marka primi
            }

            // 3. SİNERJİ VE ÖZEL YETENEK (TRAIT) BONUSA HESAPLAMASI
            let grossRevenue = Math.round(passengerCount * ticketPrice);

            // Trait: Ayşe Kaptan VIP İkram & Zerafet
            if (driver.traitId === "trait_vip") {
                grossRevenue = Math.round(grossRevenue * 1.45);
            }

            // Trait: Fatma Kaptan Dakiklik Bonusu
            if (driver.traitId === "trait_punctual") {
                grossRevenue = Math.round(grossRevenue * 1.25);
            }

            // Araç NVH Sessizliği ve Bahşiş Bonusu
            const busTipPct = bus.tipBonusPercent || 0;
            if (busTipPct > 0) {
                grossRevenue += Math.round(grossRevenue * (busTipPct / 100));
            }

            // Şirket Seviyesi Holding Bonusu (Seviye 5 ise +%25 net kar)
            if (this.data.companyLevel >= 5) {
                grossRevenue = Math.round(grossRevenue * 1.25);
            }

            // Kemal Usta Mentor Liderlik Bonusu (Tüm filoya +%12)
            const hasKemalUsta = this.data.hiredDrivers.some(d => d.id === "drv_kemal");
            if (hasKemalUsta) {
                grossRevenue = Math.round(grossRevenue * 1.12);
            }

            // 4. GİDERLER: YAKIT + MAAŞ + AŞINMA
            let fuel = route.fuelCost || 300;

            // Trait: Mehmet Kaptan Ekonomik Ayak (-%30 Yakıt)
            if (driver.traitId === "trait_eco") {
                fuel = Math.round(fuel * 0.70);
            }

            // Şirket Akaryakıt Anlaşması (-%20 Yakıt)
            if (this.data.hqUpgrades && this.data.hqUpgrades.fuelContract) {
                fuel = Math.round(fuel * 0.80);
            }

            // Araç ve Rota Sinerjisi (Şehir içine küçük otobüs girdiyse yakıt %35 düşer; büyük girdiyse %30 artar)
            if (route.routeType === "kucuk" && (bus.sizeTier === 1 || bus.sizeClass === "kucuk")) {
                fuel = Math.round(fuel * 0.65);
            } else if (route.routeType === "buyuk" && (bus.sizeTier === 1 || bus.sizeClass === "kucuk")) {
                grossRevenue = Math.round(grossRevenue * 0.80); // Midibüs uzun yolda az hasılat üretir
            }

            const wage = driver.wagePerTrip || 250;

            // İkram Paketi Gideri
            let cateringCost = 0;
            if (this.data.cateringPackage === 'vip') {
                cateringCost = Math.round(passengerCount * 65);
            } else if (this.data.cateringPackage === 'standart') {
                cateringCost = Math.round(passengerCount * 30);
            } else if (this.data.cateringPackage === 'ekonomik') {
                cateringCost = Math.round(passengerCount * 12);
            }

            const totalTripExpenses = fuel + wage + cateringCost;
            const netProfit = grossRevenue - totalTripExpenses;

            // Muhasebe Defterine Detaylı Gelir ve Gider Kaydı
            this.recordTransaction('income', 'tickets', `${driver.name} - ${route.name} Sefer Hasılatı`, grossRevenue);
            this.recordTransaction('expense', 'fuel', `${driver.name} - Akaryakıt Tüketimi`, fuel);
            this.recordTransaction('expense', 'wages', `${driver.name} - Seferlik Harcırah & Maaş`, wage);
            if (cateringCost > 0) {
                this.recordTransaction('expense', 'catering', `${driver.name} - İkram Paketi Gideri`, cateringCost);
            }

            // 5. KONDİSYON AŞINMASI
            const curCond = this.getBusCondition(driver.assignedBusId);
            let wearAmount = (route.distKm > 500) ? 5 : ((route.distKm > 100) ? 3 : 2);
            if (driver.traitId === "trait_eco") wearAmount = Math.max(1, Math.round(wearAmount / 2));
            this.data.busConditions[driver.assignedBusId] = Math.max(5, curCond - wearAmount);

            // 6. ENERJİ TÜKETİMİ
            driver.energy = Math.max(10, (driver.energy || 100) - (wearAmount * 4));

            // 7. KASAYA VE CÜZDANA AKTARMA (Hasılat Paylaşım Politikasına Göre)
            const sharePercent = (this.data.revenueSharePercent !== undefined) ? this.data.revenueSharePercent : 50;

            if (netProfit >= 0) {
                const companyShare = Math.round(netProfit * (sharePercent / 100));
                const captainShare = netProfit - companyShare;

                this.data.companyTreasury = (this.data.companyTreasury || 0) + companyShare;

                if (typeof Game !== 'undefined') {
                    Game.playerBudget = (Game.playerBudget || 0) + captainShare;
                    Game.saveData();

                    if (typeof UI !== 'undefined' && UI.updatePlayerStats) {
                        const title = (typeof Game.getLicenseTitle === 'function') ? Game.getLicenseTitle() : 'Kaptan';
                        UI.updatePlayerStats(Game.licenseLevel, Game.completedTasks, Game.playerBudget, title);
                    }
                }
            } else {
                // Zararına Sefer: Şirket kasası operasyonel zararı üstlenir
                this.data.companyTreasury = (this.data.companyTreasury || 0) + netProfit;
            }

            // İflas Durumu Denetimi
            this.checkBankruptcyStatus();

            // 8. XP KAZANIMI & TERFİ
            let gainedXP = route.xpReward || 50;
            if (driver.traitId === "trait_apprentice") {
                gainedXP = Math.round(gainedXP * 1.6); // Çırak azmi
            }
            const academyLvl = (typeof this.getInstitutionLevel === 'function') ? this.getInstitutionLevel('driver_academy') : 1;
            if (academyLvl === 2) gainedXP = Math.round(gainedXP * 1.5);
            else if (academyLvl === 3) gainedXP = Math.round(gainedXP * 2.0);
            driver.currentXP = (driver.currentXP || 0) + gainedXP;
            driver.totalTripsMade = (driver.totalTripsMade || 0) + 1;
            driver.totalEarningsMade = (driver.totalEarningsMade || 0) + netProfit;
            driver.status = "resting";
            driver.restRemainingSeconds = 12;

            this.data.totalRevenue = (this.data.totalRevenue || 0) + netProfit;
            this.data.completedTripsCount = (this.data.completedTripsCount || 0) + 1;

            // RÜTBE TERFİ KONTROLÜ
            let hasLeveledUp = false;
            let currentLvl = driver.rankLevel || 1;

            if (currentLvl < 5) {
                const nextRank = this.ranks.find(r => r.level === currentLvl + 1);
                if (nextRank && driver.currentXP >= nextRank.reqXP) {
                    driver.rankLevel = nextRank.level;
                    driver.rankTitle = nextRank.title;
                    driver.rankBadge = nextRank.badge;
                    hasLeveledUp = true;
                }
            }

            // Şirket Büyüme Seviyesini Kontrol Et
            this.checkCompanyLevelUp();
            this.saveData();

            // Kutlama ve Telsiz Anonsları
            if (hasLeveledUp) {
                if (typeof audio !== 'undefined' && audio.playSuccess) audio.playSuccess();
                const levelMsg = `🎖️ RÜTBE TERFİSİ! ${driver.name} '${driver.rankBadge} ${driver.rankTitle}' unvanına yükseldi! Sefer hasılatı ve hızı arttı!`;
                if (typeof audio !== 'undefined' && audio.speak) audio.speak(levelMsg);
                if (typeof UI !== 'undefined' && UI.showToast) UI.showToast(levelMsg, "success");
                this.addRadioLog(driver.name, driver.avatar, `Yılların emeğiyle ${driver.rankTitle} rütbesine terfi ettim! Var olun kaptanlarım!`, "success");
            } else {
                this.playCashChime();
                const alertMsg = `💰 [${this.data.companyName}] ${driver.rankBadge} ${driver.name} seferi bitirdi! Net Kasaya: +${netProfit.toLocaleString('tr-TR')} ₺ (${gainedXP} XP).`;
                if (typeof UI !== 'undefined' && UI.showToast) UI.showToast(alertMsg, "success");
                this.addRadioLog(driver.name, driver.avatar, `${route.name} seferini sağ salim tamamladık. Hasılat kasaya teslim: +${netProfit} ₺.`, "normal");
            }

            this.renderAll();
        },

        // Piyasa Trendlerini Güncelle (Dinamik Borsa)
        refreshMarketTrendsIfNeeded: function () {
            if (!this.data.marketTrends || Object.keys(this.data.marketTrends).length === 0) {
                this.updateMarketFluctuations();
            }
        },

        updateMarketFluctuations: function () {
            this.data.marketTrends = {};
            const availableTemplates = [...this.marketTrendTemplates];

            // 2 veya 3 rotada aynı anda özel talep patlaması yarat
            const countToPick = 2 + Math.floor(Math.random() * 2);
            for (let i = 0; i < countToPick && availableTemplates.length > 0; i++) {
                const randIdx = Math.floor(Math.random() * availableTemplates.length);
                const picked = availableTemplates.splice(randIdx, 1)[0];

                picked.targetRouteIds.forEach(rId => {
                    this.data.marketTrends[rId] = {
                        trendName: picked.trendName,
                        icon: picked.icon,
                        multiplier: picked.multiplier,
                        desc: picked.desc,
                        expiresAt: Date.now() + 180000 // 3 dakika geçerli
                    };
                });
            }

            this.saveData();
            console.log("[CompanySystem] Sefer borsası güncellendi. Aktif trendler:", this.data.marketTrends);
            this.renderMarketTrends();
        },

        // VIP Özel İhaleleri Güncelle
        refreshSpecialContractsIfNeeded: function () {
            if (!this.data.specialContracts || this.data.specialContracts.length === 0) {
                this.data.specialContracts = [
                    Object.assign({}, this.contractTemplates[0], { expiresAt: Date.now() + 240000 }),
                    Object.assign({}, this.contractTemplates[1], { expiresAt: Date.now() + 300000 })
                ];
                this.saveData();
            }
        },

        // VIP Özel İhalesini Kabul Et ve Sefer Başlat
        acceptSpecialContract: function (contractId, driverId) {
            const contractIdx = this.data.specialContracts.findIndex(c => c.id === contractId);
            if (contractIdx === -1) return;

            const contract = this.data.specialContracts[contractIdx];
            const driver = this.data.hiredDrivers.find(d => d.id === driverId);
            if (!driver) {
                if (typeof UI !== 'undefined') UI.showToast("Bu ihale için bir kaptan seçmelisiniz!", "warning");
                return;
            }

            if ((driver.rankLevel || 1) < contract.reqMinRank) {
                if (typeof UI !== 'undefined') UI.showToast(`Bu ihaleyi sadece Seviye ${contract.reqMinRank} ve üzeri usta kaptanlar alabilir!`, "warning");
                return;
            }

            // İhaleyi kabul et: Peşin prim kasaya aktarılır
            if (typeof Game !== 'undefined') {
                Game.playerBudget = (Game.playerBudget || 0) + contract.rewardBonus;
                Game.saveData();
                if (typeof UI !== 'undefined' && UI.updatePlayerStats) {
                    const title = (typeof Game.getLicenseTitle === 'function') ? Game.getLicenseTitle() : 'Kaptan';
                    UI.updatePlayerStats(Game.licenseLevel, Game.completedTasks, Game.playerBudget, title);
                }
            }

            this.playCashChime();
            const msg = `🏆 VIP İHALE KABUL EDİLDİ! '${contract.title}' ihalesi ${driver.name} kaptanımıza teslim edildi. Kasaya peşin prim aktarıldı: +${contract.rewardBonus.toLocaleString('tr-TR')} ₺!`;
            if (typeof audio !== 'undefined' && audio.speak) audio.speak(msg);
            if (typeof UI !== 'undefined') UI.showToast(msg, "success");
            this.addRadioLog(driver.name, driver.avatar, `${contract.client} protokol kontratını aldık. VIP yolcularımızı taşımak üzere yola çıkıyoruz!`, "success");

            // İlgili rotaya sefere çıkart
            this.dispatchDriver(driver.id, contract.routeId, driver.assignedBusId);

            // İhaleyi listeden kaldır
            this.data.specialContracts.splice(contractIdx, 1);
            this.saveData();
            this.renderAll();
        },

        // Şirket Genel Merkezi Avantajını Satın Al
        buyHqUpgrade: function (upgradeKey) {
            const upgradeCosts = {
                fuelContract: 2500,
                luxuryLounge: 3500,
                terminalPlatform: 6000,
                corporateBrand: 9500
            };

            const upgradeNames = {
                fuelContract: "Akaryakıt Filo Sözleşmesi (-%20 Yakıt Gideri)",
                luxuryLounge: "Lüks Dinlenme Tesisi Anlaşması (%50 Hızlı Mola & Enerji)",
                terminalPlatform: "Otogar Peron İmtiyazı (+%25 Yolcu Talebi)",
                corporateBrand: "Ulusal Reklam & Marka Tescili (+%25 Bilet Primi)"
            };

            const cost = upgradeCosts[upgradeKey];
            if (!cost) return;

            if (this.data.hqUpgrades[upgradeKey]) {
                if (typeof UI !== 'undefined') UI.showToast("Bu kurumsal avantaj zaten satın alınmış!", "info");
                return;
            }

            const currentBudget = (typeof Game !== 'undefined' && Game.playerBudget) ? Game.playerBudget : 0;
            if (currentBudget < cost) {
                const msg = `Yetersiz bakiye! ${upgradeNames[upgradeKey]} için ${cost.toLocaleString('tr-TR')} ₺ gerekiyor.`;
                if (typeof audio !== 'undefined' && audio.speak) audio.speak(msg);
                if (typeof UI !== 'undefined') UI.showToast(`⚠️ ${msg}`, "warning");
                return;
            }

            if (typeof Game !== 'undefined') {
                Game.playerBudget -= cost;
                Game.saveData();
                if (typeof UI !== 'undefined' && UI.updatePlayerStats) {
                    const title = (typeof Game.getLicenseTitle === 'function') ? Game.getLicenseTitle() : 'Kaptan';
                    UI.updatePlayerStats(Game.licenseLevel, Game.completedTasks, Game.playerBudget, title);
                }
            }

            this.data.hqUpgrades[upgradeKey] = true;
            this.saveData();

            this.playCashChime();
            const msg = `🏢 KURUMSAL YATIRIM TAMAMLANDI! ${upgradeNames[upgradeKey]} filonuza kalıcı olarak eklendi!`;
            if (typeof audio !== 'undefined' && audio.speak) audio.speak(msg);
            if (typeof UI !== 'undefined') UI.showToast(msg, "success");
            this.renderAll();
        },

        // Web Audio Synthesizer Ses Efektleri
        getAudioCtx: function () {
            if (typeof audio !== 'undefined' && audio.ctx) return audio.ctx;
            if (!this._internalAudioCtx && typeof window !== 'undefined') {
                const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
                if (AudioCtxClass) this._internalAudioCtx = new AudioCtxClass();
            }
            return this._internalAudioCtx;
        },

        playCashChime: function () {
            const ctx = this.getAudioCtx();
            if (!ctx) return;
            try {
                if (ctx.state === 'suspended') ctx.resume();
                const now = ctx.currentTime;
                // İki aşamalı altın para şıngırtısı (High bell chime)
                const freqs = [987.77, 1318.51, 1975.53];
                freqs.forEach((freq, idx) => {
                    const t = now + (idx * 0.08);
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.type = 'triangle';
                    osc.frequency.setValueAtTime(freq, t);
                    gain.gain.setValueAtTime(0.001, t);
                    gain.gain.linearRampToValueAtTime(0.28, t + 0.015);
                    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
                    osc.connect(gain);
                    gain.connect(ctx.destination);
                    osc.start(t);
                    osc.stop(t + 0.38);
                });
            } catch(e) {}
        },

        playRadioBeep: function () {
            const ctx = this.getAudioCtx();
            if (!ctx) return;
            try {
                if (ctx.state === 'suspended') ctx.resume();
                const now = ctx.currentTime;
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(1760, now); // A6 radio burst
                osc.frequency.setValueAtTime(2200, now + 0.04);
                gain.gain.setValueAtTime(0.001, now);
                gain.gain.linearRampToValueAtTime(0.18, now + 0.01);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start(now);
                osc.stop(now + 0.1);
            } catch(e) {}
        },

        
        playWarningAlarm: function () {
            const ctx = this.getAudioCtx();
            if (!ctx) return;
            try {
                if (ctx.state === 'suspended') ctx.resume();
                const now = ctx.currentTime;
                [650, 440, 650, 440].forEach((freq, idx) => {
                    const t = now + (idx * 0.16);
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.type = 'sawtooth';
                    osc.frequency.setValueAtTime(freq, t);
                    gain.gain.setValueAtTime(0.001, t);
                    gain.gain.linearRampToValueAtTime(0.18, t + 0.02);
                    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);
                    osc.connect(gain);
                    gain.connect(ctx.destination);
                    osc.start(t);
                    osc.stop(t + 0.15);
                });
            } catch(e) {}
        },

        playEmergencySiren: function () {
            const ctx = this.getAudioCtx();
            if (!ctx) return;
            try {
                if (ctx.state === 'suspended') ctx.resume();
                const now = ctx.currentTime;
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(450, now);
                osc.frequency.linearRampToValueAtTime(850, now + 0.4);
                osc.frequency.linearRampToValueAtTime(450, now + 0.8);
                osc.frequency.linearRampToValueAtTime(850, now + 1.2);
                osc.frequency.linearRampToValueAtTime(450, now + 1.6);
                
                gain.gain.setValueAtTime(0.001, now);
                gain.gain.linearRampToValueAtTime(0.25, now + 0.05);
                gain.gain.setValueAtTime(0.25, now + 1.5);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 1.8);

                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start(now);
                osc.stop(now + 1.8);
            } catch(e) {}
        },

        playCourtGavelSound: function () {
            const ctx = this.getAudioCtx();
            if (!ctx) return;
            try {
                if (ctx.state === 'suspended') ctx.resume();
                const now = ctx.currentTime;
                [0, 0.28].forEach(offset => {
                    const t = now + offset;
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(160, t);
                    osc.frequency.exponentialRampToValueAtTime(42, t + 0.15);

                    gain.gain.setValueAtTime(0.45, t);
                    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);

                    osc.connect(gain);
                    gain.connect(ctx.destination);
                    osc.start(t);
                    osc.stop(t + 0.23);
                });
            } catch(e) {}
        },

        playAiDispatchSound: function () {
            const ctx = this.getAudioCtx();
            if (!ctx) return;
            try {
                if (ctx.state === 'suspended') ctx.resume();
                const now = ctx.currentTime;
                // Fütüristik akıllı algoritma arpeji (D5 -> F#5 -> A5 -> D6)
                const notes = [587.33, 739.99, 880.00, 1174.66];
                notes.forEach((freq, idx) => {
                    const t = now + (idx * 0.07);
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(freq, t);
                    gain.gain.setValueAtTime(0.001, t);
                    gain.gain.linearRampToValueAtTime(0.3, t + 0.01);
                    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
                    osc.connect(gain);
                    gain.connect(ctx.destination);
                    osc.start(t);
                    osc.stop(t + 0.24);
                });
            } catch(e) {}
        },

        // Şirket Modalını Aç
        // --- CANLI KASA DEFTERİ & OTOMATİK ÖN MUHASEBE SİSTEMİ ---
        
        // --- İFLAS & TASFİYE SİSTEMİ (TİCARİON ESİNTİLİ -1.000.000 ₺ LİMİTİ) ---
        checkBankruptcyStatus: function () {
            const treasury = (this.data.companyTreasury !== undefined) ? this.data.companyTreasury : 50000;

            // 1. RESMİ İFLAS VE TASFİYE EŞİĞİ (-1.000.000 ₺)
            if (treasury <= this.BANKRUPTCY_LIMIT) {
                this.triggerBankruptcyLiquidation();
                return true;
            }

            // 2. KIRMIZI ALARM EŞİĞİ (-750.000 ₺)
            if (treasury <= this.WARNING_RED) {
                if (!this.data.bankruptcyWarned750k) {
                    this.data.bankruptcyWarned750k = true;
                    this.playEmergencySiren();
                    const redMsg = `🚨 ACİL İFLAS UYARISI! Şirket borcumuz ${treasury.toLocaleString('tr-TR')} ₺ seviyesine ulaştı! Borç -1.000.000 ₺ sınırına dayanırsa mahkeme şirketimizi tasfiye edecektir! Lütfen cüzdandan şirkete para yatırın veya giderlerinizi kısın!`;
                    if (typeof audio !== 'undefined' && audio.speak) audio.speak(redMsg);
                    if (typeof UI !== 'undefined' && UI.showToast) UI.showToast(redMsg, 'error');
                    this.addRadioLog("⚖️ Hukuk ve Mali Müşavir", "🚨", `Şirket borcumuz ${treasury.toLocaleString('tr-TR')} ₺ oldu! -1.000.000 ₺'de Asliye Ticaret Mahkemesi iflas kararı verecek!`, "danger");
                }
            } else {
                this.data.bankruptcyWarned750k = false;
            }

            // 3. SARI ALARM EŞİĞİ (-250.000 ₺)
            if (treasury <= this.WARNING_YELLOW) {
                if (!this.data.bankruptcyWarned250k) {
                    this.data.bankruptcyWarned250k = true;
                    this.playWarningAlarm();
                    const yellowMsg = `⚠️ FİNANSAL RİSK İHTARI! Şirket kasası ${treasury.toLocaleString('tr-TR')} ₺ eksiye düştü. Banka kredi ve faiz yükü artıyor. Lütfen kasanızı fonlayın veya harcamaları dengeleyin.`;
                    if (typeof audio !== 'undefined' && audio.speak) audio.speak(yellowMsg);
                    if (typeof UI !== 'undefined' && UI.showToast) UI.showToast(yellowMsg, 'warning');
                    this.addRadioLog("🏦 Bankalar & Mali Müşavir", "⚠️", `Şirket kasamız eksi ${Math.abs(treasury).toLocaleString('tr-TR')} ₺ oldu. Mali dengeyi sağlamalıyız.`, "warning");
                }
            } else {
                this.data.bankruptcyWarned250k = false;
            }

            return false;
        },

        triggerBankruptcyLiquidation: function () {
            const prevTreasury = (this.data.companyTreasury !== undefined) ? this.data.companyTreasury : -1000000;
            const compName = this.data.companyName || "Şirket";

            // Borç Tasfiyesi ve Temiz Sayfa
            this.data.companyTreasury = 0;
            this.data.companyLevel = 1;
            this.data.institutions = {
                headquarters: 1,
                bus_garage: 1,
                terminal_offices: 1,
                maintenance_depot: 1,
                driver_lodging: 1,
                city_agencies: 1
            };
            this.data.terminalBranches = {
                tekirdag: true,
                corlu: false,
                istanbul_esenler: false,
                ankara_asti: false,
                izmir_otogar: false
            };
            this.data.hqUpgrades = {
                fuelContract: false,
                luxuryLounge: false,
                terminalPlatform: false,
                corporateBrand: false
            };
            this.data.cateringPackage = 'standart';

            // Şoförlerin sözleşmeleri feshedilir ve serbest kalırlar
            const releasedDriversCount = (this.data.hiredDrivers && this.data.hiredDrivers.length) || 0;
            this.data.hiredDrivers = [];

            // İflas uyarı bayrakları sıfırlanır
            this.data.bankruptcyWarned250k = false;
            this.data.bankruptcyWarned750k = false;
            this.data.bankruptcyCount = (this.data.bankruptcyCount || 0) + 1;

            // Muhasebe Defterine Borç Tasfiyesi Kaydı
            this.recordTransaction('income', 'debt_relief', '⚖️ Asliye Ticaret Mahkemesi Tasfiye Kararı ile Borç Sıfırlaması', Math.abs(prevTreasury));

            this.saveData();

            // Telsiz Kaydı
            this.addRadioLog(
                "⚖️ İcra & Tasfiye Masası",
                "🏛️",
                `Asliye Ticaret Mahkemesi Kararıyla ${compName} iflas etmiş ve tasfiye masasına devredilmiştir. ${Math.abs(prevTreasury).toLocaleString('tr-TR')} ₺ borç sıfırlanmış, şirket 1. Seviye Yazıhane olarak yeniden yapılandırılmıştır.`,
                "danger"
            );

            // Şirket Yönetim Modalı Açıksa Kapat
            this.closeCompanyModal();

            // Mahkeme Tokmak Sesi
            this.playCourtGavelSound();

            // Sesli Anons ve Uyarı
            if (typeof audio !== 'undefined' && audio.speak) {
                const speechText = `T.C. Asliye Ticaret Mahkemesi Kararı: Şirketiniz bir milyon Türk Lirası borç sınırına ulaştığı için resmen iflas etmiş ve tasfiye edilmiştir. Şirketin bir milyon liralık borcu tasfiye masası tarafından tamamen silinmiştir. Binalar temel seviyeye çekilmiş ve şoförlerin sözleşmeleri feshedilmiştir. Şahsi ehliyetiniz, şahsi otobüsleriniz ve cüzdanınız korunmuştur. Dilerseniz kurumsal şirketlerde çalışıp nakit biriktirebilir ya da sıfırdan yeniden başlayabilirsiniz.`;
                audio.speak(speechText);
            }

            // Görsel ve Erişilebilir Resmi Mahkeme İflas Tutanağı Modalı Aç
            this.showBankruptcyModal(prevTreasury, releasedDriversCount);
        },

        injectBankruptcyModal: function () {
            if (document.getElementById('company-bankruptcy-modal')) return;

            const modalHtml = `
            <div id="company-bankruptcy-modal" class="modal-overlay modal hidden" role="dialog" aria-modal="true" aria-labelledby="bankruptcy-modal-title" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(5,5,10,0.96); z-index: 99999; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(14px); padding: 16px;">
                <div class="glass-panel" style="max-width: 820px; width: 100%; padding: 26px 30px; text-align: left; max-height: 92vh; overflow-y: auto; border: 2.5px solid #ef4444; box-shadow: 0 0 50px rgba(239, 68, 68, 0.45); border-radius: 16px; background: linear-gradient(150deg, #180808 0%, #1e1111 60%, #0f172a 100%); color: #f8fafc;">
                    
                    <!-- ÜST BAŞLIK & MÜHÜR -->
                    <div style="text-align: center; border-bottom: 2px solid rgba(239, 68, 68, 0.4); padding-bottom: 14px; margin-bottom: 18px;">
                        <div style="font-size: 2.2rem; margin-bottom: 4px;">⚖️</div>
                        <h2 id="bankruptcy-modal-title" style="color: #ef4444; font-size: 1.4rem; font-weight: 800; margin: 0; letter-spacing: 0.5px; text-transform: uppercase;">
                            T.C. ASLİYE TİCARET MAHKEMESİ VE İCRA İFLAS MÜDÜRLÜĞÜ
                        </h2>
                        <div style="color: #fca5a5; font-size: 1.05rem; font-weight: bold; margin-top: 4px;">
                            RESMİ ŞİRKET İFLAS VE TASFİYE TUTANAĞI
                        </div>
                        <div id="bankruptcy-modal-meta" style="font-size: 0.8rem; color: #94a3b8; margin-top: 6px;">
                            Karar Dosya No: 2026/TAS-1M • Yetkili: Tasfiye Heyeti
                        </div>
                    </div>

                    <!-- AÇIKLAMA BİLDİRİMİ -->
                    <div style="background: rgba(239, 68, 68, 0.12); border-left: 4px solid #ef4444; padding: 12px 16px; border-radius: 8px; margin-bottom: 18px;">
                        <p id="bankruptcy-modal-desc" style="margin: 0; color: #fecaca; font-size: 0.92rem; line-height: 1.55;">
                            Şirket borcu yasal iflas limitine ulaşmış ve tasfiye protokolü tamamlanmıştır.
                        </p>
                    </div>

                    <!-- 3 KOLONLU KARTLAR -->
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(230px, 1fr)); gap: 14px; margin-bottom: 20px;">
                        
                        <!-- KART 1: TASFİYE EDİLENLER -->
                        <div style="background: rgba(0, 0, 0, 0.4); border: 1.5px solid rgba(239, 68, 68, 0.4); border-radius: 10px; padding: 14px;">
                            <div style="color: #f87171; font-weight: bold; font-size: 0.98rem; display: flex; align-items: center; gap: 6px; margin-bottom: 8px;">
                                <span>📋</span> <span>Tasfiye Edilenler</span>
                            </div>
                            <ul id="bankruptcy-liquidated-list" style="margin: 0; padding-left: 18px; color: #cbd5e1; font-size: 0.84rem; line-height: 1.6;">
                                <li>Şirket borcu sıfırlandı.</li>
                                <li>Sözleşmeli şoförler serbest bırakıldı.</li>
                                <li>Tesisler Seviye 1'e çekildi.</li>
                            </ul>
                        </div>

                        <!-- KART 2: HACZEDİLEMEZ BİREYSEL HAKLAR (KORUNANLAR) -->
                        <div style="background: rgba(0, 0, 0, 0.4); border: 1.5px solid rgba(34, 197, 94, 0.5); border-radius: 10px; padding: 14px;">
                            <div style="color: #4ade80; font-weight: bold; font-size: 0.98rem; display: flex; align-items: center; gap: 6px; margin-bottom: 8px;">
                                <span>🛡️</span> <span>Haczedilemez Şahsi Haklar (Korundu)</span>
                            </div>
                            <ul id="bankruptcy-protected-list" style="margin: 0; padding-left: 18px; color: #cbd5e1; font-size: 0.84rem; line-height: 1.6;">
                                <li><strong>Sürücü Ehliyeti:</strong> Ehliyet seviyeniz aynen korunur.</li>
                                <li><strong>Şahsi Garajınız:</strong> Sahip olduğunuz bireysel otobüsler haczedilemez.</li>
                                <li><strong>Kişisel Cüzdan:</strong> Şahsi birikiminiz elinizde kalır.</li>
                                <li><strong>Mesleki Tecrübe:</strong> Tamamladığınız görevler ve itibarınız silinmez.</li>
                            </ul>
                        </div>

                        <!-- KART 3: ÇIKIŞ YOLU VE TAVSİYELER -->
                        <div style="background: rgba(0, 0, 0, 0.4); border: 1.5px solid rgba(56, 189, 248, 0.5); border-radius: 10px; padding: 14px;">
                            <div style="color: #38bdf8; font-weight: bold; font-size: 0.98rem; display: flex; align-items: center; gap: 6px; margin-bottom: 8px;">
                                <span>💡</span> <span>Kaptan Tavsiyesi & Çıkış Yolu</span>
                            </div>
                            <p style="margin: 0; color: #cbd5e1; font-size: 0.84rem; line-height: 1.55;">
                                • <strong>Bağımsız Serbest Kaptanlık:</strong> Herhangi bir şirkete bağlı olmadan serbest bireysel kaptan olarak çalışabilir, sıfır şirket masrafıyla tüm bilet gelirini (%100) doğrudan kendi cüzdanınıza alabilirsiniz.<br><br>
                                • <strong>Temiz Başlangıç:</strong> Borçsuz 1. Seviye şirketinizle bütçenizi dikkatle yöneterek yeniden filonuzu büyütebilirsiniz.
                            </p>
                        </div>

                    </div>

                    <!-- EKRAN OKUYUCU BUTONU -->
                    <div style="margin-top: 14px;">
                        <button id="btn-confirm-bankruptcy" class="modern-btn nav-item" style="width: 100%; padding: 14px 20px; font-size: 1.05rem; font-weight: bold; background: linear-gradient(135deg, #b91c1c, #7f1d1d); color: #fff; border: 2px solid #ef4444; border-radius: 10px; cursor: pointer; box-shadow: 0 4px 20px rgba(239, 68, 68, 0.45); transition: all 0.2s;" aria-label="Mahkeme Tasfiye Kararını Okudum ve Onaylıyorum, Temiz Bir Sayfa Aç, düğme">
                            📜 Mahkeme Tasfiye Kararını Onaylıyorum ve Temiz Sayfa Açıyorum (Enter / Space)
                        </button>
                    </div>

                </div>
            </div>`;

            document.body.insertAdjacentHTML('beforeend', modalHtml);

            const modal = document.getElementById('company-bankruptcy-modal');
            const confirmBtn = document.getElementById('btn-confirm-bankruptcy');

            if (confirmBtn) {
                confirmBtn.addEventListener('click', () => {
                    if (modal) modal.classList.add('hidden');
                    if (typeof UI !== 'undefined' && UI.showToast) {
                        UI.showToast("✅ Tasfiye süreci tamamlandı. Temiz bir sayfa ile yeni başlangıç yapabilirsiniz!", "success");
                    }
                    if (typeof audio !== 'undefined' && audio.playSelect) {
                        audio.playSelect();
                    }
                    const btnCity = document.getElementById('btn-city-routes');
                    if (btnCity) btnCity.focus();
                });
            }

            window.addEventListener('keydown', (e) => {
                if (modal && !modal.classList.contains('hidden')) {
                    if (e.key === 'Escape' || e.key === 'Enter') {
                        confirmBtn.click();
                    }
                }
            });
        },

        showBankruptcyModal: function (debtAmount, driverCount) {
            this.injectBankruptcyModal();
            const modal = document.getElementById('company-bankruptcy-modal');
            if (!modal) return;

            const compName = this.data.companyName || "Mikyas Seyahat";
            const dateStr = this.formatTurkishDate(Date.now());
            const absDebt = Math.abs(debtAmount).toLocaleString('tr-TR');
            const budgetStr = (typeof Game !== 'undefined' && Game.playerBudget ? Game.playerBudget : 0).toLocaleString('tr-TR');
            const licenseLvl = (typeof Game !== 'undefined' && Game.licenseLevel ? Game.licenseLevel : 1);

            const metaEl = document.getElementById('bankruptcy-modal-meta');
            if (metaEl) {
                metaEl.innerHTML = `Karar Dosya No: 2026/TAS-1M • Karar Tarihi: ${dateStr} • Şirket: <strong>${compName}</strong>`;
            }

            const descEl = document.getElementById('bankruptcy-modal-desc');
            if (descEl) {
                descEl.innerHTML = `<strong>Resmi İflas Kararı:</strong> Sayın Şirket Sahibi; <strong>${compName}</strong> ticari işletmesi, toplam <strong>-${absDebt} ₺</strong> borç bakiyesine ulaşarak yasal <strong>-1.000.000 ₺</strong> iflas sınırını aşmıştır. İcra ve İflas Kanunu gereğince şirketin mevcut operasyonel tüzel kişiliği feshedilmiş ve tasfiye protokolü icra edilmiştir.`;
            }

            const liqEl = document.getElementById('bankruptcy-liquidated-list');
            if (liqEl) {
                liqEl.innerHTML = `
                    <li><strong>-${absDebt} ₺ Borç Silindi:</strong> Tasfiye masası kararıyla şirket borcu sıfırlandı.</li>
                    <li><strong>${driverCount} Sözleşmeli Kaptan:</strong> Sözleşmeler feshedildi, şoför pazarına döndüler.</li>
                    <li><strong>Tesisler & Şubeler:</strong> Seviye 1 Yazıhane düzeyine sıfırlandı.</li>
                    <li><strong>Şirket Seviyesi:</strong> Seviye 1 Yazıhaneye çekildi.</li>
                `;
            }

            const protEl = document.getElementById('bankruptcy-protected-list');
            if (protEl) {
                protEl.innerHTML = `
                    <li><strong>Sürücü Ehliyeti:</strong> Ehliyet seviyeniz (${licenseLvl}. Seviye) aynen korunur.</li>
                    <li><strong>Şahsi Garajınız:</strong> Sahip olduğunuz bireysel otobüsler haczedilemez.</li>
                    <li><strong>Kişisel Cüzdan:</strong> Şahsi birikiminiz (${budgetStr} ₺) güvendedir.</li>
                    <li><strong>Mesleki Tecrübe:</strong> Tamamladığınız görevler ve itibarınız silinmez.</li>
                `;
            }

            modal.classList.remove('hidden');

            const confirmBtn = document.getElementById('btn-confirm-bankruptcy');
            if (confirmBtn) {
                setTimeout(() => confirmBtn.focus(), 100);
            }
        },

        initFinances: function() {
            if (!this.data.finances) {
                this.data.finances = {
                    totalIncome: 0,
                    totalExpense: 0,
                    categories: {
                        tickets: 0,
                        cargo: 0,
                        dividends: 0,
                        tips: 0,
                        fuel: 0,
                        maintenance: 0,
                        catering: 0,
                        branches: 0,
                        upgrades: 0
                    },
                    ledger: []
                };
            }
        },

        recordTransaction: function(type, category, title, amount) {
            this.initFinances();
            const amt = Math.round(Number(amount) || 0);
            if (amt <= 0) return;

            const now = new Date();
            const timeStr = now.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

            if (type === 'income') {
                this.data.finances.totalIncome += amt;
                this.data.finances.categories[category] = (this.data.finances.categories[category] || 0) + amt;
            } else {
                this.data.finances.totalExpense += amt;
                this.data.finances.categories[category] = (this.data.finances.categories[category] || 0) + amt;
            }

            const currentTreasury = (this.data.companyTreasury !== undefined) ? this.data.companyTreasury : 50000;
            const currentWallet = (typeof Game !== 'undefined' && Game.playerBudget) ? Game.playerBudget : 0;

            const entry = {
                id: 'tx_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
                time: timeStr,
                type: type, // 'income' | 'expense'
                category: category,
                title: title,
                amount: amt,
                balance: currentTreasury + currentWallet
            };

            this.data.finances.ledger.unshift(entry);
            if (this.data.finances.ledger.length > 40) {
                this.data.finances.ledger.pop();
            }

            this.saveData();
            if (document.getElementById('panel-comp-finances') && document.getElementById('panel-comp-finances').style.display !== 'none') {
                this.renderFinances();
            }
        },

        renderFinances: function() {
            const container = document.getElementById('company-finances-container');
            if (!container) return;

            this.initFinances();
            const fin = this.data.finances;
            const totalInc = fin.totalIncome || 0;
            const totalExp = fin.totalExpense || 0;
            const netProfit = totalInc - totalExp;
            const profitMargin = totalInc > 0 ? Math.round((netProfit / totalInc) * 100) : 0;

            const cats = fin.categories || {};
            const ticketRev = cats.tickets || 0;
            const cargoRev = cats.cargo || 0;
            const divRev = cats.dividends || 0;
            const tipRev = cats.tips || 0;

            const fuelExp = cats.fuel || 0;
            const maintExp = cats.maintenance || 0;
            const catExp = cats.catering || 0;
            const branchExp = cats.branches || 0;
            const upgExp = cats.upgrades || 0;

            let advice = "Filonuz dengeli çalışıyor. Sefer sayısını artırarak cironuzu yükseltebilirsiniz.";
            if (fuelExp > (totalExp * 0.35) && fuelExp > 5000) {
                advice = "💡 <strong>Akaryakıt Masrafınız Yüksek:</strong> Otogar Yazıhanelerini Seviye 3 yaparak tüm araçlarınıza <strong>%100 BEDAVA MAZOT</strong> alabilir ve kârınızı devasa oranda artırabilirsiniz!";
            } else if (maintExp > (totalExp * 0.30) && maintExp > 5000) {
                advice = "💡 <strong>Tamir Masrafınız Yüksek:</strong> Kademe Binasını Seviye 2 veya 3'e büyüterek bakım faturalarınızı <strong>%65'e varan oranda</strong> ucuzlatabilirsiniz.";
            } else if (cargoRev > 0) {
                advice = "💡 <strong>Emanet Koli Kargo Harika Gidiyor:</strong> Açtığınız her otogar şubesi sefer başına 4-8 koli ekstra kargo kazandırır. Daha çok otogarda şube açın!";
            }

            let ledgerRows = '';
            if (!fin.ledger || fin.ledger.length === 0) {
                ledgerRows = '<tr><td colspan="5" style="text-align:center; padding: 18px; color: #94a3b8;">Henüz kayıtlı finansal hareket bulunmuyor. İlk seferinizi tamamladığınızda veya mazot aldığınızda kasa defterine otomatik işlenecektir.</td></tr>';
            } else {
                fin.ledger.forEach(tx => {
                    const isInc = (tx.type === 'income');
                    const badgeColor = isInc ? '#22c55e' : '#ef4444';
                    const sign = isInc ? '+' : '-';
                    const catIcons = {
                        tickets: '🎫 Bilet Satışı',
                        cargo: '📦 Emanet Kargo',
                        dividends: '🏢 Terminal Temettüsü',
                        tips: '🎁 Yolcu Bahşişi',
                        fuel: '⛽ Akaryakıt',
                        maintenance: '🛠️ Kademe & Bakım',
                        catering: '☕ İkram Malzemesi',
                        branches: '🏬 Yazıhane İhalesi',
                        upgrades: '🚀 Tesis Yatırımı',
                        other: '💼 Genel'
                    };
                    ledgerRows += `
                    <tr style="border-bottom: 1px solid rgba(255,255,255,0.06); font-size: 0.86rem;">
                        <td style="padding: 10px 8px; color: #94a3b8;">${tx.time}</td>
                        <td style="padding: 10px 8px; color: #cbd5e1;">${catIcons[tx.category] || tx.category}</td>
                        <td style="padding: 10px 8px; color: #fff; font-weight: 500;">${tx.title}</td>
                        <td style="padding: 10px 8px; font-weight: bold; color: ${badgeColor}; text-align: right;">${sign}${tx.amount.toLocaleString('tr-TR')} ₺</td>
                        <td style="padding: 10px 8px; color: #facc15; text-align: right;">${tx.balance.toLocaleString('tr-TR')} ₺</td>
                    </tr>
                    `;
                });
            }

            container.innerHTML = `
            <!-- 1. CANLI BİLANÇO VE KÂR/ZARAR KARTLARI -->
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); gap: 12px; margin-bottom: 16px;">
                <div style="background: rgba(34,197,94,0.12); border: 1.5px solid #22c55e; border-radius: 10px; padding: 14px;">
                    <div style="font-size: 0.82rem; color: #86efac; font-weight: bold;">🟢 TOPLAM KASA GİRİŞİ (GELİR)</div>
                    <div style="font-size: 1.45rem; font-weight: 800; color: #4ade80; margin-top: 4px;">+${totalInc.toLocaleString('tr-TR')} ₺</div>
                    <div style="font-size: 0.78rem; color: #cbd5e1; margin-top: 2px;">Bilet, kargo, temettü ve bahşişler</div>
                </div>

                <div style="background: rgba(239,68,68,0.12); border: 1.5px solid #ef4444; border-radius: 10px; padding: 14px;">
                    <div style="font-size: 0.82rem; color: #fca5a5; font-weight: bold;">🔴 TOPLAM KASA ÇIKIŞI (GİDER)</div>
                    <div style="font-size: 1.45rem; font-weight: 800; color: #f87171; margin-top: 4px;">-${totalExp.toLocaleString('tr-TR')} ₺</div>
                    <div style="font-size: 0.78rem; color: #cbd5e1; margin-top: 2px;">Mazot, tamir, ikram ve kiralar</div>
                </div>

                <div style="background: rgba(234,179,8,0.15); border: 1.5px solid #eab308; border-radius: 10px; padding: 14px;">
                    <div style="font-size: 0.82rem; color: #fde047; font-weight: bold;">💵 NET ŞİRKET KÂRI</div>
                    <div style="font-size: 1.45rem; font-weight: 800; color: ${netProfit >= 0 ? '#facc15' : '#ef4444'}; margin-top: 4px;">${netProfit >= 0 ? '+' : ''}${netProfit.toLocaleString('tr-TR')} ₺</div>
                    <div style="font-size: 0.78rem; color: #cbd5e1; margin-top: 2px;">Kâr Marjı: <strong>%${profitMargin}</strong></div>
                </div>
            </div>

            <!-- 2. AKILLI MALİ DANIŞMAN NOTU -->
            <div style="background: linear-gradient(135deg, rgba(56,189,248,0.15), rgba(15,23,42,0.7)); border: 1.5px solid #38bdf8; border-radius: 10px; padding: 12px 16px; margin-bottom: 16px; font-size: 0.88rem; color: #e2e8f0; line-height: 1.5;">
                ${advice}
            </div>

            <!-- 3. KATEGORİ BAZLI GELİR-GİDER DAĞILIMI -->
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 14px; margin-bottom: 16px;">
                <div style="background: rgba(15,23,42,0.75); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; padding: 14px;">
                    <h4 style="color: #4ade80; margin: 0 0 10px 0; font-size: 0.95rem;">📈 Nereden Para Kazandınız? (Gelirler)</h4>
                    <div style="display: flex; flex-direction: column; gap: 8px; font-size: 0.84rem;">
                        <div style="display: flex; justify-content: space-between;">
                            <span>🎫 Bilet Satış Hasılatı:</span>
                            <strong style="color: #4ade80;">+${ticketRev.toLocaleString('tr-TR')} ₺</strong>
                        </div>
                        <div style="display: flex; justify-content: space-between;">
                            <span>📦 Emanet Kargo Gelirleri:</span>
                            <strong style="color: #fde047;">+${cargoRev.toLocaleString('tr-TR')} ₺</strong>
                        </div>
                        <div style="display: flex; justify-content: space-between;">
                            <span>🏢 Otogar & Acente Temettüleri:</span>
                            <strong style="color: #38bdf8;">+${divRev.toLocaleString('tr-TR')} ₺</strong>
                        </div>
                        <div style="display: flex; justify-content: space-between;">
                            <span>🎁 Yolcu Memnuniyet Bahşişleri:</span>
                            <strong style="color: #a7f3d0;">+${tipRev.toLocaleString('tr-TR')} ₺</strong>
                        </div>
                    </div>
                </div>

                <div style="background: rgba(15,23,42,0.75); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; padding: 14px;">
                    <h4 style="color: #f87171; margin: 0 0 10px 0; font-size: 0.95rem;">📉 Paranız Nereye Gitti? (Masraflar)</h4>
                    <div style="display: flex; flex-direction: column; gap: 8px; font-size: 0.84rem;">
                        <div style="display: flex; justify-content: space-between;">
                            <span>⛽ Akaryakıt (Mazot) Gideri:</span>
                            <strong style="color: #f87171;">-${fuelExp.toLocaleString('tr-TR')} ₺</strong>
                        </div>
                        <div style="display: flex; justify-content: space-between;">
                            <span>🛠️ Kademe & Bakım-Onarım:</span>
                            <strong style="color: #fca5a5;">-${maintExp.toLocaleString('tr-TR')} ₺</strong>
                        </div>
                        <div style="display: flex; justify-content: space-between;">
                            <span>☕ İkram ve Muavin Malzemeleri:</span>
                            <strong style="color: #fed7aa;">-${catExp.toLocaleString('tr-TR')} ₺</strong>
                        </div>
                        <div style="display: flex; justify-content: space-between;">
                            <span>🏬 Yazıhane Kiraları & Tesis Yatırımları:</span>
                            <strong style="color: #e2e8f0;">-${(branchExp + upgExp).toLocaleString('tr-TR')} ₺</strong>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 4. CANLI KASA DEFTERİ (EKSTRE) TABLOSU -->
            <div style="background: rgba(15,23,42,0.85); border: 1.5px solid #475569; border-radius: 10px; padding: 14px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                    <h4 style="color: #facc15; margin: 0; font-size: 1rem; display: flex; align-items: center; gap: 6px;">
                        <span>📜</span> <span>Son Kasa Hareketleri (Canlı Ekstre)</span>
                    </h4>
                    <span style="font-size: 0.78rem; color: #94a3b8;">Otomatik güncellenir</span>
                </div>
                <div style="overflow-x: auto; max-height: 280px; overflow-y: auto;">
                    <table style="width: 100%; border-collapse: collapse; text-align: left;">
                        <thead>
                            <tr style="border-bottom: 1.5px solid rgba(255,255,255,0.15); font-size: 0.8rem; color: #94a3b8;">
                                <th style="padding: 8px;">Saat</th>
                                <th style="padding: 8px;">İşlem Türü</th>
                                <th style="padding: 8px;">Açıklama</th>
                                <th style="padding: 8px; text-align: right;">Tutar</th>
                                <th style="padding: 8px; text-align: right;">Kasa Sonu</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${ledgerRows}
                        </tbody>
                    </table>
                </div>
            </div>
            `;
        },

        openCompanyModal: function () {
            // Şirket Yönetimi SADECE Ana Menü'den açılabilir! Sürüş veya mola esnasında açılamaz.
            const drivingScreen = document.getElementById('driving-screen');
            const stopScreen = document.getElementById('stop-screen');
            const isDriving = (typeof Game !== 'undefined' && Game.isDriving);
            const isDrivingVisible = drivingScreen && !drivingScreen.classList.contains('hidden');
            const isStopVisible = stopScreen && !stopScreen.classList.contains('hidden');

            if (isDriving || isDrivingVisible || isStopVisible) {
                if (typeof UI !== 'undefined' && UI.showToast) {
                    UI.showToast("Şirket Yönetimine sadece Ana Menüden erişebilirsiniz!", "warning");
                }
                if (typeof audio !== 'undefined' && audio.speak) {
                    audio.speak("Şirket yönetimine sadece ana menüden erişebilirsiniz. Lütfen önce ana menüye dönünüz.");
                }
                return;
            }

            this.injectModal();
            const modal = document.getElementById('company-system-modal');
            if (!modal) return;

            modal.classList.remove('hidden');
            this.renderAll();

            if (typeof KeyboardNav !== 'undefined' && KeyboardNav.initForScreen) {
                KeyboardNav.initForScreen();
            }

            const currentLvl = this.companyLevels.find(l => l.level === (this.data.companyLevel || 1)) || this.companyLevels[0];
            const introMsg = `${this.data.companyName} yönetim paneli açıldı. Seviyeniz: ${currentLvl.badge} ${currentLvl.title}. Filoda ${this.data.hiredDrivers.length} kaptan çalışıyor.`;
            if (typeof audio !== 'undefined' && audio.speak) {
                audio.speak(introMsg);
            }
        },

        // Şirket Modalını Kapat
        closeCompanyModal: function () {
            const modal = document.getElementById('company-system-modal');
            if (modal) modal.classList.add('hidden');
            if (typeof KeyboardNav !== 'undefined' && KeyboardNav.initForScreen) {
                KeyboardNav.initForScreen();
            }
        },

        // DOM'a Şirket Modalını Enjekte Et
        injectModal: function () {
            if (document.getElementById('company-system-modal')) return;

            const modalHtml = `
            <div id="company-system-modal" class="modal-overlay modal hidden" role="dialog" aria-modal="true" aria-labelledby="company-modal-title" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.92); z-index: 8600; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(10px);">
                <div class="glass-panel" style="max-width: 940px; width: 96%; padding: 22px 26px; text-align: left; max-height: 92vh; overflow-y: auto; border: 2px solid #ca8a04; box-shadow: 0 0 45px rgba(202, 138, 4, 0.35); border-radius: 14px;">
                    
                    <!-- Başlık ve Kapatma -->
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; border-bottom: 1px solid rgba(250, 204, 21, 0.2); padding-bottom: 10px;">
                        <div>
                            <h2 id="company-modal-title" style="font-size: 1.75rem; margin: 0; color: #facc15; display: flex; align-items: center; gap: 8px;">
                                🏢 Şirket Kur veya Var Olan Bir Şirkette Çalış
                            </h2>
                            
                        </div>
                        <div style="display: flex; gap: 8px; align-items: center;">
                            <button id="btn-company-ai-dispatch-top" class="modern-btn nav-item" style="padding: 8px 16px; background: linear-gradient(135deg, #0284c7, #38bdf8); color: #000; font-weight: bold; border: 1px solid #7dd3fc; border-radius: 8px; cursor: pointer; display: flex; align-items: center; gap: 6px;" aria-label="Başharekât: Tek tuşla tüm şoförleri en karlı seferlere akıllıca dağıt">
                                📋 Akıllı Sefer Dağıtımı
                            </button>
                            <button id="btn-close-company-modal" class="modern-btn nav-item" style="padding: 7px 14px; background: rgba(239, 68, 68, 0.2); border: 1px solid #ef4444; color: #fca5a5; font-weight: bold; cursor: pointer; border-radius: 8px;" aria-label="Şirket Menüsünü Kapat (Esc)">✕ Kapat</button>
                        </div>
                    </div>

                    <!-- Şirket Bilgi ve İstatistik Kartı -->
                    <div id="company-overview-card" style="background: linear-gradient(135deg, rgba(202, 138, 4, 0.25), rgba(161, 98, 7, 0.35)); border: 1.5px solid #eab308; border-radius: 10px; padding: 14px 18px; margin-bottom: 14px;">
                        <!-- Dinamik doldurulacak -->
                    </div>

                    <!-- 5 Sekme Butonları -->
                    <div style="display: flex; gap: 6px; margin-bottom: 14px; flex-wrap: wrap;">
                        <button id="tab-comp-drivers" class="modern-btn nav-item" style="flex: 1; min-width: 130px; padding: 9px 8px; font-weight: bold; background: rgba(234, 179, 8, 0.3); border: 1.5px solid #facc15; color: #fff; cursor: pointer; border-radius: 6px; font-size: 0.88rem;">
                            🚌 Kendi Filom & Şoförlerim
                        </button>
                        <button id="tab-comp-institutions" class="modern-btn nav-item" style="flex: 1; min-width: 150px; padding: 9px 8px; font-weight: bold; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.2); color: #94a3b8; cursor: pointer; border-radius: 6px; font-size: 0.88rem;">
                            🏛️ Yasal Binalar & Garaj (B1 Belgesi)
                        </button>
                        <button id="tab-comp-corporate-work" class="modern-btn nav-item" style="flex: 1; min-width: 140px; padding: 9px 8px; font-weight: bold; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.2); color: #94a3b8; cursor: pointer; border-radius: 6px; font-size: 0.88rem;">
                            👔 Var Olan Bir Şirkete Katıl (Maaşlı)
                        </button>
                        <button id="tab-comp-market-trends" class="modern-btn nav-item" style="flex: 1; min-width: 140px; padding: 9px 8px; font-weight: bold; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.2); color: #94a3b8; cursor: pointer; border-radius: 6px; font-size: 0.9rem;">
                            📈 Sefer Borsası & VIP İhale
                        </button>
                        <button id="tab-comp-hire" class="modern-btn nav-item" style="flex: 1; min-width: 140px; padding: 9px 8px; font-weight: bold; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.2); color: #94a3b8; cursor: pointer; border-radius: 6px; font-size: 0.9rem;">
                            👨‍✈️ Şoför Pazarı & Transfer
                        </button>
                        <button id="tab-comp-hq" class="modern-btn nav-item" style="flex: 1; min-width: 140px; padding: 9px 8px; font-weight: bold; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.2); color: #94a3b8; cursor: pointer; border-radius: 6px; font-size: 0.9rem;">
                            🏢 Şirket Gelişimi & Merkez
                        </button>
                        <button id="tab-comp-radio" class="modern-btn nav-item" style="flex: 1; min-width: 120px; padding: 9px 8px; font-weight: bold; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.2); color: #94a3b8; cursor: pointer; border-radius: 6px; font-size: 0.88rem;">
                            📻 Canlı Telsiz
                        </button>
                        <button id="tab-comp-catering" class="modern-btn nav-item" style="flex: 1; min-width: 140px; padding: 9px 8px; font-weight: bold; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.2); color: #94a3b8; cursor: pointer; border-radius: 6px; font-size: 0.88rem;">
                            ☕ İkram & Muavin
                        </button>
                                                <button id="tab-comp-finances" class="modern-btn nav-item" style="flex: 1; min-width: 150px; padding: 9px 8px; font-weight: bold; background: rgba(34, 197, 94, 0.2); border: 1.5px solid #22c55e; color: #4ade80; cursor: pointer; border-radius: 6px; font-size: 0.88rem;">
                            📊 Kasa Defteri & Muhasebe
                        </button>
<button id="tab-comp-branches" class="modern-btn nav-item" style="flex: 1; min-width: 150px; padding: 9px 8px; font-weight: bold; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.2); color: #94a3b8; cursor: pointer; border-radius: 6px; font-size: 0.88rem;">
                            🏢 Yazıhaneler & Bilet
                        </button>
                    </div>

                    <!-- 1. SEKME: Şoförlerim & Filo Yönetimi -->
                    <div id="panel-comp-drivers" style="display: block;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; flex-wrap: wrap; gap: 8px;">
                            <span style="font-size: 0.9rem; color: #cbd5e1;">Filodaki kaptanlarınızın araç, rota, enerji ve canlı ilerlemeleri:</span>
                            <div style="display: flex; gap: 6px;">
                                <button id="btn-comp-repair-all" class="modern-btn nav-item" style="padding: 5px 12px; background: rgba(34, 197, 94, 0.2); border: 1px solid #22c55e; color: #4ade80; font-size: 0.85rem; cursor: pointer; border-radius: 6px;">
                                    🛠️ Tüm Filoya Bakım Yap
                                </button>
                            </div>
                        </div>
                        <div id="company-hired-list" style="max-height: 48vh; overflow-y: auto;">
                            <!-- Dinamik doldurulacak -->
                        </div>
                    </div>

                    <!-- 2. SEKME: Sefer Borsası & VIP İhaleler -->
                    <div id="panel-comp-market-trends" style="display: none;">
                        <div id="company-trends-container" style="max-height: 48vh; overflow-y: auto;">
                            <!-- Dinamik doldurulacak -->
                        </div>
                    </div>

                    <!-- 3. SEKME: Şoför Pazarı & Transfer -->
                    <div id="panel-comp-hire" style="display: none;">
                        <div id="company-market-list" style="max-height: 48vh; overflow-y: auto;">
                            <!-- Dinamik doldurulacak -->
                        </div>
                    </div>

                    <!-- 4. SEKME: Şirket Gelişimi & Kurumsal Avantajlar -->
                    <div id="panel-comp-hq" style="display: none;">
                        <div id="company-hq-container" style="max-height: 48vh; overflow-y: auto;">
                            <!-- Dinamik doldurulacak -->
                        </div>
                    </div>

                    <!-- 6. SEKME: Var Olan Bir Şirkette Çalış (Maaşlı Kaptanlık) -->
                    <div id="panel-comp-corporate-work" style="display: none;">
                        <div style="background: rgba(15,23,42,0.6); padding: 12px 16px; border-radius: 8px; margin-bottom: 12px; border: 1px solid rgba(255,255,255,0.1);">
                            <h3 style="color: #fde047; margin: 0 0 4px 0; font-size: 1.1rem;">👔 Kaptan Şirketleri & Çalışma Listesi</h3>
                            <p style="color: #cbd5e1; font-size: 0.88rem; margin: 0;">
                                Bir şirkette çalışmak isterseniz aşağıdaki şirketlerden dilediğiniz birine katılabilirsiniz. Şirkete bağlandığınızda günlük maaş ve sefer primi kazanırsınız. Şirketten ayrıldığınızda ise kendi başınıza serbest çalışırsınız.
                            </p>
                        </div>
                        <div id="corporate-work-list" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 12px;">
                            <!-- Dinamik doldurulacak -->
                        </div>
                    </div>

                    <!-- 5. SEKME: Canlı Telsiz Kayıtları -->
                    <div id="panel-comp-radio" style="display: none;">
                        <div id="company-radio-container" style="max-height: 48vh; overflow-y: auto; background: rgba(15,23,42,0.7); border: 1px solid #334155; border-radius: 8px; padding: 12px;" role="status" aria-live="polite">
                            <!-- Dinamik doldurulacak -->
                        </div>
                    </div>

                    <!-- 7. SEKME: Otobüs Kurumları ve Tesisler (Seviye Sistemi) -->
                    <div id="panel-comp-institutions" style="display: none;">
                        <div id="company-institutions-container" style="max-height: 52vh; overflow-y: auto;">
                            <!-- Dinamik doldurulacak -->
                        </div>
                    </div>

                    <!-- 8. SEKME: İkram & Muavin Servisi -->
                    <div id="panel-comp-catering" style="display: none;">
                        <div id="company-catering-container" style="max-height: 52vh; overflow-y: auto;">
                            <!-- Dinamik doldurulacak -->
                        </div>
                    </div>

                                        <!-- 10. SEKME: Kasa Defteri & Ön Muhasebe -->
                    <div id="panel-comp-finances" style="display: none;">
                        <div id="company-finances-container" style="max-height: 52vh; overflow-y: auto;">
                            <!-- Dinamik doldurulacak -->
                        </div>
                    </div>
                    <!-- 9. SEKME: Otogar Yazıhaneleri & Bilet Fiyat Tarifesi -->
                    <div id="panel-comp-branches" style="display: none;">
                        <div id="company-branches-container" style="max-height: 52vh; overflow-y: auto;">
                            <!-- Dinamik doldurulacak -->
                        </div>
                    </div>

                </div>
            </div>
            `;

            document.body.insertAdjacentHTML('beforeend', modalHtml);

            // Kapat butonları
            document.getElementById('btn-close-company-modal').addEventListener('click', () => {
                this.closeCompanyModal();
            });

            // AI Dağıtım butonu
            document.getElementById('btn-company-ai-dispatch-top').addEventListener('click', () => {
                this.autoDispatchAllAI();
            });

            // Tüm filoya bakım
            document.getElementById('btn-comp-repair-all').addEventListener('click', () => {
                this.repairAllFleet();
            });

            // Sekme geçişleri
            const tabs = [
                { tabId: 'tab-comp-drivers', panelId: 'panel-comp-drivers' },
                { tabId: 'tab-comp-institutions', panelId: 'panel-comp-institutions' },
                { tabId: 'tab-comp-catering', panelId: 'panel-comp-catering' },
                { tabId: 'tab-comp-finances', panelId: 'panel-comp-finances' },
                { tabId: 'tab-comp-branches', panelId: 'panel-comp-branches' },
                { tabId: 'tab-comp-corporate-work', panelId: 'panel-comp-corporate-work' },
                { tabId: 'tab-comp-market-trends', panelId: 'panel-comp-market-trends' },
                { tabId: 'tab-comp-hire', panelId: 'panel-comp-hire' },
                { tabId: 'tab-comp-hq', panelId: 'panel-comp-hq' },
                { tabId: 'tab-comp-radio', panelId: 'panel-comp-radio' }
            ];

            tabs.forEach(t => {
                const btn = document.getElementById(t.tabId);
                if (btn) {
                    btn.addEventListener('click', () => {
                        tabs.forEach(other => {
                            const otherBtn = document.getElementById(other.tabId);
                            const otherPanel = document.getElementById(other.panelId);
                            if (otherBtn && otherPanel) {
                                if (other.tabId === t.tabId) {
                                if (t.tabId === 'tab-comp-institutions') {
                                        if (typeof audio !== 'undefined' && audio.speak) {
                                            audio.speak("Ulaştırma Bakanlığı B1 Taşıma Yetki Belgesi yasal binalar ve tesisler menüsü açıldı. Merkez ofis, garaj, otogar yazıhaneleri, kademe, kaptan lojmanı ve şehir içi servis acentelerini büyütebilirsiniz.");
                                        }
                                    } else if (t.tabId === 'tab-comp-catering') {
                                        if (typeof audio !== 'undefined' && audio.speak) {
                                            audio.speak("Otobüs içi ikram ve muavin servisi menüsü açıldı. İkram paketini belirleyebilir, yolda I tuşuna basarak ikram dağıtabilirsiniz.");
                                        }
                                    } else if (t.tabId === 'tab-comp-branches') {
                                        if (typeof audio !== 'undefined' && audio.speak) {
                                            audio.speak("Otogar yazıhaneleri ve bilet fiyat tarifesi menüsü açıldı.");
                                        }
                                    } else if (t.tabId === 'tab-comp-corporate-work') {
                                    const caps = this.getCaptainCompanies();
                                    if (caps.length === 0) {
                                        if (typeof audio !== 'undefined' && audio.speak) {
                                            audio.speak("Var olan bir şirkete katıl menüsü açıldı. Görünüşe göre kimse şirket kurmamış. İlk şirketinizi oluşturmak için yeni bir şirket kur butonuna basınız.");
                                        }
                                    } else {
                                        if (typeof audio !== 'undefined' && audio.speak) {
                                            audio.speak(`Var olan bir şirkete katıl menüsü açıldı. Kaptanlar tarafından kurulan ${caps.length} şirket listelendi.`);
                                        }
                                    }
                                }
                                    otherBtn.style.background = 'rgba(234, 179, 8, 0.3)';
                                    otherBtn.style.borderColor = '#facc15';
                                    otherBtn.style.color = '#fff';
                                    otherPanel.style.display = 'block';
                                } else {
                                    otherBtn.style.background = 'rgba(255,255,255,0.06)';
                                    otherBtn.style.borderColor = 'rgba(255,255,255,0.2)';
                                    otherBtn.style.color = '#94a3b8';
                                    otherPanel.style.display = 'none';
                                }
                            }
                        });
                        this.renderAll();
                    });
                }
            });
        },

        // Tüm Paneli Render Et
        renderAll: function () {
            this.renderCompanyOverview();
            this.renderHiredDrivers();
            this.renderMarketTrends();
            this.renderDriverMarket();
            this.renderHqUpgrades();
            this.renderRadioLogs();
            this.renderCorporateWork();
            this.renderInstitutions();
            this.renderCatering();
            this.renderBranches();
        },

        // Şirket Başlık Kartını Render Et
        renderCompanyOverview: function () {
            const card = document.getElementById('company-overview-card');
            if (!card) return;

            const currentBudget = (typeof Game !== 'undefined' && Game.playerBudget) ? Game.playerBudget : 0;
            const companyTreasury = (this.data.companyTreasury !== undefined) ? this.data.companyTreasury : 50000;
            const sharePercent = (this.data.revenueSharePercent !== undefined) ? this.data.revenueSharePercent : 50;
            const captainPercent = 100 - sharePercent;
            const hiredCount = this.data.hiredDrivers.length;
            const revFormatted = (this.data.totalRevenue || 0).toLocaleString('tr-TR');
            const lvlInfo = this.companyLevels.find(l => l.level === (this.data.companyLevel || 1)) || this.companyLevels[0];

            const empId = this.data.corporateEmployer;
            const empComp = this.getCompanyById(empId);

            const empBadge = empComp
                ? `<div style="margin-top: 8px; padding: 10px 14px; background: rgba(34,197,94,0.18); border: 1.5px solid #22c55e; border-radius: 8px; font-size: 0.88rem; color: #86efac; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px;">
                    <div>
                        <span>👔 <strong>Maaşlı Kaptan:</strong> ${empComp.name} (${empComp.badge}) | Günlük Maaş: <strong style="color: #fde047;">${empComp.dailySalary.toLocaleString('tr-TR')} ₺</strong> | Sefer Primi: <strong style="color: #4ade80;">+${empComp.bonusPercent}%</strong></span>
                        <div style="font-size: 0.82rem; color: #cbd5e1; margin-top: 3px;">
                            📊 Hasılat Bölüşümü: <strong>%${empComp.companySharePercent || 50} Şirkete Aktarılır</strong>, <strong>%${100 - (empComp.companySharePercent || 50)} Kaptana Kalır</strong>
                        </div>
                    </div>
                    <button id="btn-comp-leave-corp" class="modern-btn nav-item" style="padding: 6px 14px; font-size: 0.82rem; background: rgba(239,68,68,0.25); border: 1px solid #ef4444; color: #fca5a5; font-weight: bold; border-radius: 6px; cursor: pointer;">Kendi Şirketime Dön</button>
                   </div>`
                : `<div style="margin-top: 8px; padding: 10px 14px; background: rgba(234,179,8,0.15); border: 1.5px solid #facc15; border-radius: 8px; font-size: 0.88rem; color: #fef08a; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px;">
                    <div>
                        <span>🏢 <strong>Bağımsız Şirket Sahibi:</strong> Kendi filonuzu ve şoförlerinizi yönetiyorsunuz. Sefer bilet hasılatı belirlediğiniz orana göre bölüştürülür.</span>
                        <div style="font-size: 0.82rem; color: #cbd5e1; margin-top: 3px;">
                            📊 Aktif Bölüşüm Politikası: <strong>%${sharePercent} Şirket Kasasına</strong>, <strong>%${captainPercent} Kaptan Cüzdanına</strong>
                        </div>
                    </div>
                    <button id="btn-comp-go-corp-tab" class="modern-btn nav-item" style="padding: 6px 14px; font-size: 0.82rem; background: rgba(56,189,248,0.2); border: 1px solid #38bdf8; color: #7dd3fc; font-weight: bold; border-radius: 6px; cursor: pointer;">👔 Şirketlerde Çalış</button>
                   </div>`;

            card.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
                <div>
                    <div style="color: #fde047; font-size: 1.25rem; font-weight: bold; display: flex; align-items: center; flex-wrap: wrap; gap: 8px;">
                        <span>🏢 ${this.data.companyName}</span>
                        <button id="btn-rename-company" class="modern-btn nav-item" style="padding: 3px 10px; font-size: 0.8rem; background: rgba(255,255,255,0.12); border: 1px solid #fde047; color: #fde047; border-radius: 6px; cursor: pointer;" title="Şirket İsmini Değiştir">✏️ Şirket Kur / İsim Düzenle</button>
                        <span style="font-size: 0.85rem; padding: 2px 8px; border-radius: 6px; background: rgba(0,0,0,0.4); border: 1px solid #facc15; color: #fef08a;">
                            ${lvlInfo.badge} Seviye ${lvlInfo.level}: ${lvlInfo.title}
                        </span>
                    </div>
                    <div style="color: #cbd5e1; font-size: 0.88rem; margin-top: 4px;">
                        Kayıtlı Filo: <strong style="color: #38bdf8;">${hiredCount} Kaptan</strong> | Tamamlanan Sefer: <strong style="color: #4ade80;">${this.data.completedTripsCount}</strong> | Holding Ayrıcalığı: <span style="color: #a7f3d0;">${lvlInfo.perkDesc}</span>
                    </div>
                </div>
                <div style="text-align: right; display: flex; flex-direction: column; gap: 3px;">
                    <div style="color: #4ade80; font-size: 1.18rem; font-weight: bold;">
                        💰 Şirket Cirosu: ${revFormatted} ₺
                    </div>
                    ${(() => {
                        if (companyTreasury <= -750000) {
                            return `<div style="background: rgba(239, 68, 68, 0.25); border: 1.5px solid #ef4444; border-radius: 6px; padding: 4px 8px; color: #fca5a5; font-size: 0.92rem;">
                                <span style="color: #ef4444; font-weight: bold;">🚨 Şirket Kasası: ${companyTreasury.toLocaleString('tr-TR')} ₺</span>
                                <div style="font-size: 0.74rem; color: #fecaca; margin-top: 1px;">
                                    <strong>KIRMIZI ALARM:</strong> İflasa Kalan: ${(-1000000 - companyTreasury).toLocaleString('tr-TR')} ₺
                                </div>
                            </div>`;
                        } else if (companyTreasury <= -250000) {
                            return `<div style="background: rgba(249, 115, 22, 0.2); border: 1.5px solid #f97316; border-radius: 6px; padding: 4px 8px; color: #fdba74; font-size: 0.92rem;">
                                <span style="color: #f97316; font-weight: bold;">⚠️ Şirket Kasası: ${companyTreasury.toLocaleString('tr-TR')} ₺</span>
                                <div style="font-size: 0.74rem; color: #fed7aa; margin-top: 1px;">
                                    <strong>SARI ALARM:</strong> Ticari Borç Eşiği (İflas: -1.000.000 ₺)
                                </div>
                            </div>`;
                        } else if (companyTreasury < 0) {
                            return `<div style="background: rgba(234, 179, 8, 0.15); border: 1px solid #eab308; border-radius: 6px; padding: 4px 8px; color: #fef08a; font-size: 0.92rem;">
                                <span style="color: #fde047; font-weight: bold;">🏢 Şirket Kasası: ${companyTreasury.toLocaleString('tr-TR')} ₺ (Borçlu)</span>
                                <div style="font-size: 0.74rem; color: #cbd5e1; margin-top: 1px;">İflas Sınırı: -1.000.000 ₺</div>
                            </div>`;
                        } else {
                            return `<div style="color: #fde047; font-size: 0.95rem;">
                                🏢 Şirket Kasası: <strong>${companyTreasury.toLocaleString('tr-TR')} ₺</strong>
                                <div style="font-size: 0.74rem; color: #94a3b8; margin-top: 1px;">İflas Sınırı: -1.000.000 ₺</div>
                            </div>`;
                        }
                    })()}
                    <div style="color: #bae6fd; font-size: 0.9rem;">
                        💼 Kaptan Cüzdanı (Bize Kalan): <strong>${currentBudget.toLocaleString('tr-TR')} ₺</strong>
                    </div>
                </div>
            </div>

            <!-- HASILAT PAYLAŞIM VE TRANSFER KONTROL BARİYERİ -->
            <div style="margin-top: 12px; background: rgba(0,0,0,0.35); border: 1.5px solid rgba(245, 158, 11, 0.4); border-radius: 10px; padding: 12px 16px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
                <div>
                    <div style="color: #facc15; font-weight: bold; font-size: 0.95rem; display: flex; align-items: center; gap: 6px;">
                        <span>📊</span> <span>Hasılat Paylaşım Oranı:</span>
                        <span style="color: #38bdf8;">%${sharePercent} Şirkete Aktar</span> / <span style="color: #4ade80;">%${captainPercent} Bize Kalsın</span>
                    </div>
                    <div style="color: #94a3b8; font-size: 0.8rem; margin-top: 2px;">
                        Yolcu bilet ve sefer gelirleri bu orana göre şirket kasası ile kaptan cüzdanı arasında otomatik bölüştürülür.
                    </div>
                </div>
                <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                    <button id="btn-share-preset-50" class="modern-btn nav-item" style="padding: 7px 13px; font-size: 0.82rem; background: ${sharePercent === 50 ? '#f59e0b' : 'rgba(255,255,255,0.08)'}; color: ${sharePercent === 50 ? '#000' : '#fff'}; font-weight: bold; border-radius: 6px; border: 1px solid #f59e0b; cursor: pointer;">
                        %50 - %50 (Önerilen)
                    </button>
                    <button id="btn-share-custom-modal" class="modern-btn nav-item" style="padding: 7px 13px; font-size: 0.82rem; background: rgba(56,189,248,0.18); border: 1.5px solid #38bdf8; color: #7dd3fc; font-weight: bold; border-radius: 6px; cursor: pointer;">
                        ⚙️ Serbest Oran Ayarla
                    </button>
                    <button id="btn-deposit-treasury" class="modern-btn nav-item" style="padding: 7px 11px; font-size: 0.82rem; background: rgba(34,197,94,0.18); border: 1px solid #22c55e; color: #86efac; font-weight: bold; border-radius: 6px; cursor: pointer;" title="Cüzdandan Şirket Kasasına Para Yatır">
                        📥 Kasaya Yatır
                    </button>
                    <button id="btn-withdraw-treasury" class="modern-btn nav-item" style="padding: 7px 11px; font-size: 0.82rem; background: rgba(234,179,8,0.18); border: 1px solid #eab308; color: #fef08a; font-weight: bold; border-radius: 6px; cursor: pointer;" title="Şirket Kasasından Cüzdana Para Çek">
                        📤 Kasadan Çek
                    </button>
                    <button id="btn-test-bankruptcy" class="modern-btn nav-item" style="padding: 7px 11px; font-size: 0.82rem; background: rgba(239,68,68,0.18); border: 1.5px solid #ef4444; color: #fca5a5; font-weight: bold; border-radius: 6px; cursor: pointer;" title="Resmi Asliye Ticaret Mahkemesi Tasfiye ve İflas Protokolünü Test Et (-1.000.000 ₺)">
                        ⚖️ İflas Testi (-1M ₺)
                    </button>
                </div>
            </div>

            ${empBadge}
            `;

            const btnRename = card.querySelector('#btn-rename-company');
            if (btnRename) {
                btnRename.addEventListener('click', () => {
                    this.openCreateCompanyModal();
                });
            }

            const btnLeave = card.querySelector('#btn-comp-leave-corp');
            if (btnLeave) {
                btnLeave.addEventListener('click', () => {
                    this.leaveCorporateCompany();
                });
            }

            const btnGoCorp = card.querySelector('#btn-comp-go-corp-tab');
            if (btnGoCorp) {
                btnGoCorp.addEventListener('click', () => {
                    const tabCorp = document.getElementById('tab-comp-corporate-work');
                    if (tabCorp) tabCorp.click();
                });
            }

            const btnShare50 = card.querySelector('#btn-share-preset-50');
            if (btnShare50) {
                btnShare50.addEventListener('click', () => {
                    this.setRevenueSharePercent(50);
                });
            }

            const btnShareCustom = card.querySelector('#btn-share-custom-modal');
            if (btnShareCustom) {
                btnShareCustom.addEventListener('click', () => {
                    this.openShareCustomModal();
                });
            }

            const btnDeposit = card.querySelector('#btn-deposit-treasury');
            if (btnDeposit) {
                btnDeposit.addEventListener('click', () => {
                    this.transferToTreasury();
                });
            }

            const btnWithdraw = card.querySelector('#btn-withdraw-treasury');
            if (btnWithdraw) {
                btnWithdraw.addEventListener('click', () => {
                    this.transferToWallet();
                });
            }

            const btnTestBankruptcy = card.querySelector('#btn-test-bankruptcy');
            if (btnTestBankruptcy) {
                btnTestBankruptcy.addEventListener('click', () => {
                    const confirmTest = confirm(
                        "⚖️ RESMİ İFLAS VE TASFİYE SİMÜLASYONU\n\n" +
                        "Şirket kasasını -1.000.000 ₺ borca çekip T.C. Asliye Ticaret Mahkemesi Tasfiye Protokolünü çalıştırmak istiyor musunuz?\n\n" +
                        "• Şirketin 1.000.000 ₺ borcu sıfırlanacaktır (Borç affı).\n" +
                        "• Binalar Seviye 1'e dönecek, şoförler serbest kalacaktır.\n" +
                        "• ŞAHSİ HAKLARINIZ (Kişisel cüzdanınız, garajınızdaki araçlar, ehliyetiniz) KORUNACAKTIR.\n\n" +
                        "İflas sürecini şimdi başlatmak istiyor musunuz?"
                    );
                    if (confirmTest) {
                        this.data.companyTreasury = -1000000;
                        this.checkBankruptcyStatus();
                    }
                });
            }
        },

        // Kiralanmış Şoförleri, Araçları, Kondisyon ve Enerji Durumlarını Render Et
        renderHiredDrivers: function () {
            const container = document.getElementById('company-hired-list');
            if (!container) return;

            container.innerHTML = '';

            if (this.data.hiredDrivers.length === 0) {
                container.innerHTML = `
                <div style="padding: 24px; text-align: center; color: #cbd5e1; background: rgba(255,255,255,0.03); border: 1.5px dashed rgba(202, 138, 4, 0.4); border-radius: 10px;">
                    <div style="font-size: 2.2rem; margin-bottom: 8px;">👨‍✈️</div>
                    <strong style="color: #facc15; font-size: 1.15rem;">Filonuzda Henüz Kaptan Bulunmuyor</strong>
                    <p style="margin: 8px 0 16px 0; color: #94a3b8; font-size: 0.9rem;">
                        Şirketinizin tüm şoförlerini siz seçersiniz! <strong>'Şoför Pazarı'</strong> sekmesinden dilediğiniz kaptanı tecrübesine, sefer başı maaşına ve özel yeteneklerine göre hemen işe alabilirsiniz.
                    </p>
                    <button id="btn-empty-goto-hire" class="modern-btn nav-item" style="padding: 10px 20px; background: linear-gradient(135deg, #ca8a04, #eab308); color: #000; font-weight: bold; border-radius: 8px; cursor: pointer; border: 1px solid #fde047;">
                        🛒 Şoför Pazarına Git ve Kaptan Transfer Et
                    </button>
                </div>`;
                const btnHire = container.querySelector('#btn-empty-goto-hire');
                if (btnHire) {
                    btnHire.addEventListener('click', () => {
                        const tabHire = document.getElementById('tab-comp-hire');
                        if (tabHire) tabHire.click();
                    });
                }
                return;
            }

            // Sahip olunan veya mevcut otobüsler listesi
            let ownedBusIds = [];
            if (typeof BusFleet !== 'undefined' && typeof BusFleet.getOwnedBusIds === 'function') {
                ownedBusIds = BusFleet.getOwnedBusIds();
            }
            if (!ownedBusIds || ownedBusIds.length === 0) {
                ownedBusIds = ["otokar_sultan_mega", "otokar_kent_lf", "mercedes_travego_16sh"];
            }

            this.data.hiredDrivers.forEach(driver => {
                const route = this.availableRoutes.find(r => r.id === driver.assignedRouteId) || this.availableRoutes[0];
                const rankInfo = this.getDriverRankInfo(driver);
                const bus = this.getBusInfo(driver.assignedBusId);
                const busCond = this.getBusCondition(driver.assignedBusId);

                const nextXP = this.getNextRankXP(rankInfo.level);
                const prevXP = rankInfo.reqXP;
                const xpSpan = Math.max(1, nextXP - prevXP);
                const curXPInLvl = Math.max(0, (driver.currentXP || 0) - prevXP);
                const xpPct = (rankInfo.level >= 5) ? 100 : Math.min(100, Math.round((curXPInLvl / xpSpan) * 100));

                const tripProgressPct = driver.targetDurationSeconds > 0 
                    ? Math.min(100, Math.round(((driver.currentTripSeconds || 0) / driver.targetDurationSeconds) * 100))
                    : 0;

                const statusColor = (driver.status === 'on_trip') ? '#4ade80' : ((driver.status === 'resting') ? '#facc15' : '#38bdf8');
                const statusLabel = (driver.status === 'on_trip') 
                    ? `🛣️ Seferde (%${tripProgressPct})` 
                    : ((driver.status === 'resting') ? `☕ Mola (%${driver.energy || 50} Enerji)` : `🅿️ Garajda Bekliyor`);

                // Canlı Borsa Trend Rozeti
                const trend = (this.data.marketTrends && this.data.marketTrends[route.id]) ? this.data.marketTrends[route.id] : null;
                const trendBadge = trend 
                    ? `<span style="padding: 2px 6px; border-radius: 6px; background: rgba(239,68,68,0.25); border: 1px solid #ef4444; color: #fca5a5; font-size: 0.8rem; font-weight: bold; margin-left: 6px;">${trend.icon} ${trend.trendName} (x${trend.multiplier})</span>` 
                    : '';

                const div = document.createElement('div');
                div.style.cssText = "background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; padding: 14px; margin-bottom: 12px;";
                div.innerHTML = `
                <!-- Kaptan Başlığı ve Durum -->
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; flex-wrap: wrap; gap: 8px;">
                    <div>
                        <strong style="color: #fff; font-size: 1.15rem;">${driver.avatar} ${driver.name}</strong> 
                        <span style="display: inline-block; padding: 2px 8px; border-radius: 8px; font-size: 0.85rem; font-weight: bold; background: rgba(202, 138, 4, 0.25); border: 1px solid #facc15; color: #fde047; margin-left: 6px;">
                            ${rankInfo.badge} Seviye ${rankInfo.level}: ${rankInfo.title}
                        </span>
                        <span style="display: inline-block; padding: 2px 8px; border-radius: 8px; font-size: 0.85rem; font-weight: bold; background: rgba(56, 189, 248, 0.2); border: 1px solid #38bdf8; color: #7dd3fc; margin-left: 6px;" title="${driver.traitDesc || ''}">
                            ${driver.traitBadge || '⭐'} ${driver.traitName || 'Uzman Kaptan'}
                        </span>
                    </div>
                    <div style="display: flex; gap: 6px; align-items: center;">
                        <span style="padding: 4px 10px; border-radius: 12px; font-size: 0.85rem; font-weight: bold; background: rgba(255,255,255,0.1); color: ${statusColor};">
                            ${statusLabel}
                        </span>
                        <button id="btn-driver-coffee-${driver.id}" class="modern-btn nav-item" style="padding: 4px 8px; background: rgba(234, 179, 8, 0.2); border: 1px solid #eab308; color: #fef08a; font-size: 0.8rem; border-radius: 6px; cursor: pointer;" title="120 ₺ ile enerjiyi anında %100 tazele">
                            ☕ Dinlendir (120 ₺)
                        </button>
                    </div>
                </div>

                <!-- Şoförün Tecrübe (XP) İlerleme Çubuğu -->
                <div style="margin-bottom: 8px;">
                    <div style="display: flex; justify-content: space-between; font-size: 0.8rem; color: #cbd5e1; margin-bottom: 2px;">
                        <span>Kaptan Tecrübesi (XP): <strong>${driver.currentXP || 0} XP</strong></span>
                        <span>${rankInfo.level >= 5 ? '👑 Maksimum Ustalık' : `Sonraki Terfiye: ${(nextXP - (driver.currentXP || 0))} XP`}</span>
                    </div>
                    <div style="background: rgba(0,0,0,0.5); border-radius: 6px; height: 6px; width: 100%; overflow: hidden;">
                        <div style="background: linear-gradient(90deg, #38bdf8, #818cf8); height: 100%; width: ${xpPct}%;"></div>
                    </div>
                </div>

                <!-- Atanmış Araç ve Kondisyon Paneli -->
                <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(15,23,42,0.6); border: 1px solid rgba(255,255,255,0.08); border-radius: 6px; padding: 6px 10px; margin-bottom: 8px; font-size: 0.85rem; flex-wrap: wrap; gap: 6px;">
                    <div>
                        🚌 <strong>Tahsisi Araç:</strong> <span style="color: #38bdf8;">${bus.icon} ${bus.fullName}</span> (${bus.seatCapacity} Koltuk)
                    </div>
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <span>Mekanik Kondisyon: <strong style="color: ${busCond > 60 ? '#4ade80' : (busCond > 30 ? '#facc15' : '#ef4444')};">%${busCond}</strong></span>
                        <button id="btn-bus-repair-${driver.id}" class="modern-btn nav-item" style="padding: 2px 8px; font-size: 0.78rem; background: rgba(34,197,94,0.2); border: 1px solid #22c55e; color: #86efac; border-radius: 4px; cursor: pointer;">
                            🛠️ Bakım Yap
                        </button>
                    </div>
                </div>

                <!-- Aktif Hat ve Canlı Trend -->
                <div style="color: #facc15; font-size: 0.92rem; margin-bottom: 6px; display: flex; align-items: center; flex-wrap: wrap;">
                    <span>📍 <strong>Sefer Hattı:</strong> ${route.name}</span>
                    ${trendBadge}
                </div>

                <!-- Sefer İlerleme Çubuğu -->
                <div style="background: rgba(0,0,0,0.5); border-radius: 6px; height: 10px; width: 100%; overflow: hidden; margin-bottom: 8px;">
                    <div id="prog-bar-${driver.id}" style="background: linear-gradient(90deg, #ca8a04, #facc15); height: 100%; width: ${tripProgressPct}%; transition: width 0.3s;"></div>
                </div>

                <!-- Kontroller: Rota ve Araç Seçici -->
                <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.85rem; color: #cbd5e1; flex-wrap: wrap; gap: 8px;">
                    <div>
                        Sefer: <strong>${driver.totalTripsMade || 0}</strong> | Kazandırdığı: <strong style="color: #4ade80;">${(driver.totalEarningsMade || 0).toLocaleString('tr-TR')} ₺</strong> | Enerji: <strong style="color: #38bdf8;">%${driver.energy || 100}</strong>
                    </div>
                    <div style="display: flex; gap: 6px; flex-wrap: wrap;">
                        <!-- Araç Seç -->
                        <select id="bus-select-${driver.id}" class="modern-btn" style="padding: 4px 6px; font-size: 0.82rem; background: #0f172a; color: #fff; border: 1px solid #334155; border-radius: 6px;">
                            ${ownedBusIds.map(bId => {
                                const b = this.getBusInfo(bId);
                                return `<option value="${b.id}" ${b.id === driver.assignedBusId ? 'selected' : ''}>${b.icon} ${b.fullName}</option>`;
                            }).join('')}
                        </select>

                        <!-- Rota Seç -->
                        <select id="route-select-${driver.id}" class="modern-btn" style="padding: 4px 6px; font-size: 0.82rem; background: #0f172a; color: #fff; border: 1px solid #334155; border-radius: 6px;">
                            ${this.availableRoutes.map(r => `<option value="${r.id}" ${r.id === driver.assignedRouteId ? 'selected' : ''}>${r.name}</option>`).join('')}
                        </select>

                        <button id="btn-change-dispatch-${driver.id}" class="modern-btn nav-item" style="padding: 4px 10px; background: #0284c7; border: 1px solid #38bdf8; color: #fff; font-size: 0.82rem; cursor: pointer; border-radius: 6px;">
                            Sefere Sür
                        </button>
                    </div>
                </div>
                `;

                container.appendChild(div);

                // Olay Dinleyicileri
                div.querySelector(`#btn-change-dispatch-${driver.id}`).addEventListener('click', () => {
                    const selRoute = div.querySelector(`#route-select-${driver.id}`).value;
                    const selBus = div.querySelector(`#bus-select-${driver.id}`).value;
                    this.dispatchDriver(driver.id, selRoute, selBus);
                });

                div.querySelector(`#btn-driver-coffee-${driver.id}`).addEventListener('click', () => {
                    this.boostDriverEnergy(driver.id);
                });

                div.querySelector(`#btn-bus-repair-${driver.id}`).addEventListener('click', () => {
                    this.repairBus(driver.assignedBusId);
                });
            });
        },

        // Sefer İlerleme Çubuklarını Canlı Tazele
        updateLiveTripProgressUI: function () {
            if (!this.data.hiredDrivers) return;
            this.data.hiredDrivers.forEach(driver => {
                const bar = document.getElementById(`prog-bar-${driver.id}`);
                if (bar && driver.targetDurationSeconds > 0) {
                    const pct = Math.min(100, Math.round(((driver.currentTripSeconds || 0) / driver.targetDurationSeconds) * 100));
                    bar.style.width = pct + '%';
                }
            });
        },

        // Canlı Sefer Borsası ve VIP İhaleleri Render Et
        renderMarketTrends: function () {
            const container = document.getElementById('company-trends-container');
            if (!container) return;

            container.innerHTML = '';

            // 1. Canlı Piyasa Bülteni
            const trendsHtml = `
            <div style="background: rgba(15,23,42,0.85); border: 1.5px solid #38bdf8; border-radius: 10px; padding: 14px; margin-bottom: 16px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                    <div style="color: #38bdf8; font-size: 1.15rem; font-weight: bold; display: flex; align-items: center; gap: 6px;">
                        📈 Karayolları Canlı Borsa Bülteni
                    </div>
                    <button id="btn-refresh-trends-manual" class="modern-btn nav-item" style="padding: 4px 10px; background: rgba(56,189,248,0.2); border: 1px solid #38bdf8; color: #7dd3fc; font-size: 0.8rem; cursor: pointer; border-radius: 6px;">
                        🔄 Borsayı Güncelle
                    </button>
                </div>
                <p style="color: #cbd5e1; font-size: 0.85rem; margin: 0 0 10px 0;">
                    Yolcu talepleri ve bilet fiyatları dinamik dalgalanır! Talebin zirve yaptığı rotalara şoförlerinizi yönlendirerek devasa hasılat toplayın.
                </p>

                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 10px;">
                    ${this.availableRoutes.map(route => {
                        const trend = (this.data.marketTrends && this.data.marketTrends[route.id]) ? this.data.marketTrends[route.id] : null;
                        const mult = trend ? trend.multiplier : 1.0;
                        const multColor = mult >= 1.5 ? '#4ade80' : (mult > 1.0 ? '#facc15' : '#94a3b8');

                        return `
                        <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 10px;">
                            <div style="display: flex; justify-content: space-between; align-items: center; font-weight: bold; color: #fff; font-size: 0.9rem;">
                                <span>${route.name}</span>
                                <span style="color: ${multColor}; font-size: 1.05rem;">x${mult}</span>
                            </div>
                            <div style="color: #38bdf8; font-size: 0.82rem; margin-top: 3px;">
                                ${trend ? `${trend.icon} ${trend.trendName}` : 'Normal Sefer Tarifesi'}
                            </div>
                            <div style="color: #94a3b8; font-size: 0.78rem; margin-top: 2px;">
                                ${trend ? trend.desc : 'Standart yolcu akışı.'}
                            </div>
                            <div style="margin-top: 6px; font-size: 0.8rem; color: #cbd5e1;">
                                Tahmini Bilet: <strong style="color: #facc15;">${Math.round(route.baseTicketPrice * mult)} ₺</strong> | Ortalama Yolcu: ${route.avgPassengers}
                            </div>
                        </div>
                        `;
                    }).join('')}
                </div>
            </div>
            `;

            // 2. VIP Özel İhaleler
            const contractsHtml = `
            <div style="background: rgba(15,23,42,0.85); border: 1.5px solid #eab308; border-radius: 10px; padding: 14px;">
                <div style="color: #facc15; font-size: 1.15rem; font-weight: bold; margin-bottom: 6px; display: flex; align-items: center; gap: 6px;">
                    🏆 VIP Özel Şirket İhaleleri & Protokol Kontratları
                </div>
                <p style="color: #cbd5e1; font-size: 0.85rem; margin: 0 0 10px 0;">
                    Yüksek bütçeli kurumsal kurum ve spor kulübü ihaleleri. Şartları sağlayan usta kaptanınızı görevlendirip peşin prim kazanın!
                </p>

                <div style="display: flex; flex-direction: column; gap: 10px;">
                    ${(this.data.specialContracts && this.data.specialContracts.length > 0) ? this.data.specialContracts.map(contract => {
                        return `
                        <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(234, 179, 8, 0.3); border-radius: 8px; padding: 12px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
                            <div>
                                <div style="color: #fde047; font-weight: bold; font-size: 1rem;">
                                    ${contract.icon} ${contract.title}
                                </div>
                                <div style="color: #38bdf8; font-size: 0.85rem; margin-top: 2px;">
                                    Kurum: <strong>${contract.client}</strong> | Peşin Prim: <strong style="color: #4ade80; font-size: 1.05rem;">+${contract.rewardBonus.toLocaleString('tr-TR')} ₺</strong>
                                </div>
                                <div style="color: #cbd5e1; font-size: 0.82rem; margin-top: 4px; max-width: 520px;">
                                    ${contract.desc} (Gereken Kaptan: En az Seviye ${contract.reqMinRank} Kaptan)
                                </div>
                            </div>
                            <div style="display: flex; gap: 6px; align-items: center;">
                                <select id="contract-driver-select-${contract.id}" class="modern-btn" style="padding: 6px; font-size: 0.85rem; background: #0f172a; color: #fff; border: 1px solid #334155; border-radius: 6px;">
                                    ${this.data.hiredDrivers.map(d => `<option value="${d.id}">${d.avatar} ${d.name} (${d.rankTitle})</option>`).join('')}
                                </select>
                                <button id="btn-accept-contract-${contract.id}" class="modern-btn nav-item" style="padding: 8px 14px; background: linear-gradient(135deg, #ca8a04, #eab308); color: #000; font-weight: bold; border-radius: 6px; cursor: pointer; border: none;">
                                    İhaleyi Al
                                </button>
                            </div>
                        </div>
                        `;
                    }).join('') : '<div style="color: #94a3b8; font-size: 0.85rem; text-align: center; padding: 12px;">Şu anda açıkta yeni ihale yok. 90 saniye sonra yeni ihaleler düşecektir.</div>'}
                </div>
            </div>
            `;

            container.innerHTML = trendsHtml + contractsHtml;

            // Olay dinleyicileri
            const btnRefresh = container.querySelector('#btn-refresh-trends-manual');
            if (btnRefresh) {
                btnRefresh.addEventListener('click', () => {
                    this.updateMarketFluctuations();
                });
            }

            if (this.data.specialContracts) {
                this.data.specialContracts.forEach(contract => {
                    const btn = container.querySelector(`#btn-accept-contract-${contract.id}`);
                    if (btn) {
                        btn.addEventListener('click', () => {
                            const sel = container.querySelector(`#contract-driver-select-${contract.id}`);
                            const drvId = sel ? sel.value : null;
                            this.acceptSpecialContract(contract.id, drvId);
                        });
                    }
                });
            }
        },

        // Şoför Pazarını Render Et
        renderDriverMarket: function () {
            const container = document.getElementById('company-market-list');
            if (!container) return;

            container.innerHTML = '';
            const currentBudget = (typeof Game !== 'undefined' && Game.playerBudget) ? Game.playerBudget : 0;

            this.driverMarket.forEach(d => {
                const isHired = this.data.hiredDrivers.some(hd => hd.id === d.id);
                const canAfford = currentBudget >= d.hireFee;
                const startRank = this.ranks.find(r => r.level === d.startRankLevel) || this.ranks[0];

                const div = document.createElement('div');
                div.style.cssText = "background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; padding: 14px; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;";
                div.innerHTML = `
                <div>
                    <div style="font-size: 1.15rem; font-weight: bold; color: #fff; display: flex; align-items: center; gap: 6px;">
                        <span>${d.avatar} ${d.name}</span> 
                        <span style="font-size: 0.85rem; color: #facc15; padding: 2px 8px; border-radius: 6px; background: rgba(202, 138, 4, 0.2); border: 1px solid #facc15;">
                            ${startRank.badge} ${startRank.title}
                        </span>
                        <span style="font-size: 0.82rem; color: #38bdf8; padding: 2px 8px; border-radius: 6px; background: rgba(56, 189, 248, 0.15); border: 1px solid #38bdf8;">
                            ${d.traitBadge} ${d.traitName}
                        </span>
                    </div>
                    <div style="color: #a7f3d0; font-size: 0.88rem; margin-top: 4px;">
                        💡 <strong>Özel Nitelik:</strong> ${d.traitDesc}
                    </div>
                    <div style="color: #cbd5e1; font-size: 0.84rem; margin-top: 3px; max-width: 520px;">
                        ${d.desc}
                    </div>
                    <div style="color: #94a3b8; font-size: 0.82rem; margin-top: 4px;">
                        Sefer Başı Maaş: <strong style="color: #fbbf24;">${d.wagePerTrip} ₺</strong> | Tercih Ettiği Araç: ${d.preferredBusClass.toUpperCase()}
                    </div>
                </div>

                <div>
                    ${isHired ? `
                        <button class="modern-btn" disabled style="padding: 10px 18px; background: rgba(34, 197, 94, 0.2); border: 1px solid #22c55e; color: #4ade80; font-weight: bold; border-radius: 8px;">
                            ✓ Şirketinizde
                        </button>
                    ` : `
                        <button id="btn-hire-${d.id}" class="modern-btn nav-item ${canAfford ? 'btn-primary' : ''}" style="padding: 10px 18px; font-weight: bold; border-radius: 8px; cursor: pointer; ${canAfford ? 'background: #ca8a04; border: 1px solid #facc15; color: #000;' : 'background: rgba(255,255,255,0.08); color: #64748b; border: 1px solid #334155;'}">
                            Transfer Et (${d.hireFee} ₺)
                        </button>
                    `}
                </div>
                `;

                container.appendChild(div);

                if (!isHired) {
                    const btn = div.querySelector(`#btn-hire-${d.id}`);
                    if (btn) {
                        btn.addEventListener('click', () => {
                            this.hireDriver(d.id);
                        });
                    }
                }
            });
        },

        // Şirket Gelişimi & Kurumsal Avantajları Render Et
        renderHqUpgrades: function () {
            const container = document.getElementById('company-hq-container');
            if (!container) return;

            const currentBudget = (typeof Game !== 'undefined' && Game.playerBudget) ? Game.playerBudget : 0;
            const upgrades = [
                {
                    key: "fuelContract",
                    title: "⛽ Akaryakıt Filo Sözleşmesi",
                    cost: 2500,
                    desc: "Tüm filoda geçerli toplu akaryakıt anlaşması. Sefer başı yakıt giderlerini kalıcı olarak %20 azaltır.",
                    icon: "🛢️"
                },
                {
                    key: "luxuryLounge",
                    title: "☕ Lüks Otogar Dinlenme Tesisi",
                    cost: 3500,
                    desc: "Şoförlerin mola süresini yarı yarıya düşürür (%50 hızlı dinlenme) ve enerji dolumunu 2 kat hızlandırır.",
                    icon: "🏨"
                },
                {
                    key: "terminalPlatform",
                    title: "🏛️ Merkezi Otogar Peron İmtiyazı",
                    cost: 6000,
                    desc: "Büyükşehir otogarlarında 1 numaralı peron tahsisi. Tüm rotalarda ortalama yolcu çekimini +%25 artırır.",
                    icon: "🎫"
                },
                {
                    key: "corporateBrand",
                    title: "⭐ Ulusal Reklam & Marka Tescili",
                    cost: 9500,
                    desc: "Şirketinizin marka değeri tavan yapar! Tüm hatlarda bilet fiyatlarına %25 marka primi eklenir.",
                    icon: "📺"
                }
            ];

            container.innerHTML = `
            <div style="background: rgba(15,23,42,0.8); border: 1.5px solid #a855f7; border-radius: 10px; padding: 14px; margin-bottom: 14px;">
                <div style="color: #c084fc; font-size: 1.15rem; font-weight: bold; margin-bottom: 4px;">
                    🏢 Şirket Büyüme Basamakları (HQ Seviyesi)
                </div>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 8px; margin-top: 8px;">
                    ${this.companyLevels.map(lvl => {
                        const isReached = (this.data.companyLevel || 1) >= lvl.level;
                        return `
                        <div style="background: ${isReached ? 'rgba(168,85,247,0.2)' : 'rgba(255,255,255,0.03)'}; border: 1px solid ${isReached ? '#c084fc' : '#334155'}; border-radius: 8px; padding: 10px; text-align: center;">
                            <div style="font-size: 1.4rem;">${lvl.badge}</div>
                            <div style="font-weight: bold; color: ${isReached ? '#fff' : '#64748b'}; font-size: 0.9rem;">${lvl.title}</div>
                            <div style="font-size: 0.75rem; color: #a1a1aa; margin-top: 2px;">${lvl.perkDesc}</div>
                            ${isReached ? '<div style="color: #4ade80; font-size: 0.75rem; font-weight: bold; margin-top: 4px;">✓ AKTİF</div>' : `<div style="color: #94a3b8; font-size: 0.72rem; margin-top: 4px;">${lvl.reqTrips} Sefer & ${lvl.reqRev.toLocaleString('tr-TR')} ₺</div>`}
                        </div>
                        `;
                    }).join('')}
                </div>
            </div>

            <div style="background: rgba(15,23,42,0.8); border: 1.5px solid #38bdf8; border-radius: 10px; padding: 14px;">
                <div style="color: #38bdf8; font-size: 1.15rem; font-weight: bold; margin-bottom: 6px;">
                    💼 Kurumsal Şirket Yatırımları & Pasif Avantajlar
                </div>
                <div style="display: flex; flex-direction: column; gap: 10px;">
                    ${upgrades.map(up => {
                        const isOwned = this.data.hqUpgrades && this.data.hqUpgrades[up.key];
                        const canAfford = currentBudget >= up.cost;

                        return `
                        <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 12px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
                            <div>
                                <div style="font-size: 1rem; font-weight: bold; color: #fff;">
                                    ${up.icon} ${up.title}
                                </div>
                                <div style="color: #cbd5e1; font-size: 0.85rem; margin-top: 2px; max-width: 520px;">
                                    ${up.desc}
                                </div>
                            </div>
                            <div>
                                ${isOwned ? `
                                    <button class="modern-btn" disabled style="padding: 8px 16px; background: rgba(34, 197, 94, 0.2); border: 1px solid #22c55e; color: #4ade80; font-weight: bold; border-radius: 6px;">
                                        ✓ Şirketinizde Aktif
                                    </button>
                                ` : `
                                    <button id="btn-buy-upgrade-${up.key}" class="modern-btn nav-item" style="padding: 8px 16px; font-weight: bold; border-radius: 6px; cursor: pointer; ${canAfford ? 'background: #0284c7; border: 1px solid #38bdf8; color: #fff;' : 'background: rgba(255,255,255,0.08); color: #64748b; border: 1px solid #334155;'}">
                                        Satın Al (${up.cost.toLocaleString('tr-TR')} ₺)
                                    </button>
                                `}
                            </div>
                        </div>
                        `;
                    }).join('')}
                </div>
            </div>
            `;

            upgrades.forEach(up => {
                const btn = container.querySelector(`#btn-buy-upgrade-${up.key}`);
                if (btn) {
                    btn.addEventListener('click', () => {
                        this.buyHqUpgrade(up.key);
                    });
                }
            });
        },

        // Canlı Telsiz Kayıtlarını Render Et
        renderRadioLogs: function () {
            const container = document.getElementById('company-radio-container');
            if (!container) return;

            if (!this.data.radioLogs || this.data.radioLogs.length === 0) {
                container.innerHTML = '<div style="color: #94a3b8; font-size: 0.85rem; text-align: center;">Henüz telsiz kaydı bulunmuyor. Şoförler yola çıktıkça anonslar buraya düşecektir.</div>';
                return;
            }

            container.innerHTML = this.data.radioLogs.map(log => {
                const color = log.type === "success" ? "#4ade80" : (log.type === "system" ? "#facc15" : "#7dd3fc");
                return `
                <div style="border-bottom: 1px solid rgba(255,255,255,0.06); padding: 6px 0; font-size: 0.85rem; display: flex; align-items: flex-start; gap: 8px;">
                    <span style="color: #64748b; font-size: 0.78rem; min-width: 60px;">[${log.time}]</span>
                    <div>
                        <strong style="color: ${color};">${log.avatar} ${log.sender}:</strong>
                        <span style="color: #f1f5f9; margin-left: 4px;">${log.text}</span>
                    </div>
                </div>
                `;
            }).join('');
        },

        setCompanyName: function(newName) {
            this.data.companyName = newName;
            this.saveData();
            this.renderCompanyOverview();
            if (typeof UI !== 'undefined' && UI.showToast) UI.showToast(`🏢 Şirket İsmi: ${this.data.companyName}`, 'success');
            if (typeof audio !== 'undefined' && audio.speak) audio.speak(`Şirket ismi ${this.data.companyName} olarak kaydedildi.`);
        },

        joinCorporateCompany: function(companyId) {
            const comp = this.getCompanyById(companyId);
            if (!comp) return;

            const currentLevel = (typeof Game !== 'undefined' && Game.licenseLevel) ? Game.licenseLevel : 1;
            if (currentLevel < (comp.minLevel || 1)) {
                const lockMsg = `Bu şirkete katılmak için Seviye ${comp.minLevel} kaptanlık derecesine sahip olmalısınız (Mevcut Seviyeniz: ${currentLevel}).`;
                if (typeof audio !== 'undefined' && audio.speak) audio.speak(lockMsg);
                if (typeof UI !== 'undefined' && UI.showToast) UI.showToast(lockMsg, 'warning');
                return;
            }

            // Kaptan şirketi kontenjan kontrolü
            if (comp.isCaptainCompany) {
                let activeCount = parseInt(comp.activeCaptainsCount) || 1;
                const maxQuota = parseInt(comp.maxCaptainsQuota) || 10;
                if (activeCount >= maxQuota) {
                    const fullMsg = `Bu şirketin kaptan kontenjanı doludur! (${activeCount}/${maxQuota} Kaptan).`;
                    if (typeof audio !== 'undefined' && audio.speak) audio.speak(fullMsg);
                    if (typeof UI !== 'undefined' && UI.showToast) UI.showToast(fullMsg, 'warning');
                    return;
                }

                // Eski şirketten ayrılma sayısını düşür
                if (this.data.corporateEmployer) {
                    this.adjustCaptainCompanyWorkers(this.data.corporateEmployer, -1);
                }

                // Yeni şirketin çalışan sayısını artır
                this.adjustCaptainCompanyWorkers(comp.id, 1);
            }

            this.data.corporateEmployer = comp.id;
            this.saveData();

            // İlk işe başlama primini hediye et
            if (typeof Game !== 'undefined') {
                Game.playerBudget += comp.dailySalary;
                Game.saveData();
                if (typeof UI !== 'undefined' && UI.updatePlayerStats) {
                    const title = (typeof Game.getLicenseTitle === 'function') ? Game.getLicenseTitle() : 'Kaptan';
                    UI.updatePlayerStats(Game.licenseLevel, Game.completedTasks, Game.playerBudget, title);
                }
            }

            const successMsg = comp.isCaptainCompany 
                ? `Tebrikler! Kurucu Kaptan ${comp.founder} tarafından kurulan ${comp.name} bünyesinde göreve başladınız. İlk günlük maaşınız ${comp.dailySalary.toLocaleString('tr-TR')} ₺ hesabınıza yatırıldı.`
                : `Tebrikler! ${comp.name} bünyesinde maaşlı kaptan olarak göreve başladınız. İlk günlük maaşınız ${comp.dailySalary.toLocaleString('tr-TR')} ₺ hesabınıza yatırıldı.`;

            if (typeof audio !== 'undefined' && audio.speak) audio.speak(successMsg);
            if (typeof UI !== 'undefined' && UI.showToast) UI.showToast(`👔 ${comp.name} Kadrosuna Katıldınız! (+${comp.dailySalary.toLocaleString('tr-TR')} ₺)`, 'success');

            this.renderAll();
        },

        adjustCaptainCompanyWorkers: function(companyId, delta) {
            let list = this.getCaptainCompanies();
            const target = list.find(c => c.id === companyId);
            if (target) {
                target.activeCaptainsCount = Math.max(1, (parseInt(target.activeCaptainsCount) || 1) + delta);
                try {
                    localStorage.setItem(this.COMMUNITY_STORAGE_KEY, JSON.stringify(list));
                } catch(e) {}
            }
        },

        
        // Bağımsız Serbest Kaptan Çalışma Modu (Telif Riski Yok, %100 Kazanç Kaptana)
        activateIndependentCaptainMode: function() {
            if (this.data.corporateEmployer) {
                this.adjustCaptainCompanyWorkers(this.data.corporateEmployer, -1);
            }
            this.data.corporateEmployer = null;
            this.data.revenueSharePercent = 0;
            this.data.isIndependentMode = true;
            this.saveData();
            this.renderAll();

            const msg = "Tebrikler! Bağımsız Serbest Kaptan moduna geçtiniz. Hiçbir şirkete bağlı değilsiniz; sefer bilet gelirlerinin yüzde yüzü doğrudan şahsi cüzdanınıza aktarılır. Sıfır şirket gideri ve sıfır telif riski!";
            if (typeof audio !== 'undefined' && audio.speak) audio.speak(msg);
            if (typeof UI !== 'undefined' && UI.showToast) {
                UI.showToast("⭐ Bağımsız Kaptan Modu: Sefer gelirlerinin %100'ü doğrudan cüzdanınıza kalır!", "success");
            }
        },

        leaveCorporateCompany: function() {
            if (this.data.corporateEmployer) {
                this.adjustCaptainCompanyWorkers(this.data.corporateEmployer, -1);
            }
            this.data.corporateEmployer = null;
            this.saveData();

            const msg = "Şirketten ayrıldınız. Artık bağımsız çalışıyorsunuz.";
            if (typeof audio !== 'undefined' && audio.speak) audio.speak(msg);
            if (typeof UI !== 'undefined' && UI.showToast) UI.showToast("🏢 Şirketten Ayrıldınız", "info");

            this.renderAll();
        },

        renderCorporateWork: function() {
            const container = document.getElementById('corporate-work-list');
            if (!container) return;

            const currentLevel = (typeof Game !== 'undefined' && Game.licenseLevel) ? Game.licenseLevel : 1;
            const activeCorpId = this.data.corporateEmployer;
            const captainCompanies = this.getCaptainCompanies();

            let html = '';

            // ŞİRKETLERİ SADECE İNSANLAR KURAR (YAPAY ŞİRKETLER YOKTUR)
            if (captainCompanies.length === 0) {
                // Görünüşe göre kimse şirket kurmamış ikazı
                html += `
                <div style="grid-column: 1 / -1; background: linear-gradient(135deg, rgba(30, 41, 59, 0.95), rgba(15, 23, 42, 0.95)); border: 2.5px dashed #f59e0b; border-radius: 14px; padding: 32px 28px; text-align: center; margin-bottom: 16px; box-shadow: 0 6px 25px rgba(245, 158, 11, 0.2);">
                    <div style="font-size: 3rem; margin-bottom: 12px; animation: pulse 2s infinite;">🏢</div>
                    <div style="color: #fde047; font-size: 1.4rem; font-weight: 800; margin-bottom: 10px; letter-spacing: 0.5px;">
                        Görünüşe göre kimse şirket kurmamış.
                    </div>
                    <div style="color: #e2e8f0; font-size: 1.02rem; max-width: 650px; margin: 0 auto 20px auto; line-height: 1.6;">
                        Oyunda yapay şirket bulunmamaktadır; tüm şirketler sadece gerçek kaptanlar tarafından kurulur. İlk şirketinizi oluşturmak için aşağıdaki <strong>"Yeni Bir Şirket Kur"</strong> butonuna basınız. Şirketinizin adını, kaç kaptan çalıştırmak istediğinizi, kaptanlara vereceğiniz günlük maaşı ve hasılat bölüşümünü kendiniz belirlersiniz.
                    </div>
                    <button id="btn-empty-create-company" class="modern-btn nav-item" style="padding: 13px 32px; background: linear-gradient(135deg, #f59e0b, #d97706); color: #000; font-weight: 800; border-radius: 10px; font-size: 1.05rem; cursor: pointer; border: none; box-shadow: 0 4px 20px rgba(245,158,11,0.45); transition: transform 0.2s;" aria-label="Yeni bir şirket kur">
                        🏢 Yeni Bir Şirket Kur
                    </button>
                </div>
                `;
            } else {
                html += `
                <div style="grid-column: 1 / -1; display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; flex-wrap: wrap; gap: 10px; background: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.3); border-radius: 10px; padding: 12px 16px;">
                    <div>
                        <div style="color: #facc15; font-size: 1.25rem; font-weight: bold; display: flex; align-items: center; gap: 8px;">
                            <span>👨‍✈️</span> <span>Kaptanların Kurduğu Şirketler (${captainCompanies.length} Şirket Aktif)</span>
                        </div>
                        <div style="color: #cbd5e1; font-size: 0.85rem; margin-top: 2px;">
                            Tüm şirketler sadece gerçek insanlar tarafından kurulur. Kurucu kaç kaptan çalıştıracağını, maaşını ve hasılat bölüşümünü kendisi belirler.
                        </div>
                    </div>
                    <button id="btn-sub-create-company" class="modern-btn nav-item" style="padding: 8px 18px; background: linear-gradient(135deg, #f59e0b, #d97706); color: #000; font-weight: bold; font-size: 0.92rem; border-radius: 8px; cursor: pointer; border: none; box-shadow: 0 2px 10px rgba(245,158,11,0.3);">
                        + Yeni Bir Şirket Kur
                    </button>
                </div>
                `;

                captainCompanies.forEach(comp => {
                    const isCurrent = (activeCorpId === comp.id);
                    const activeCount = parseInt(comp.activeCaptainsCount) || 1;
                    const maxQuota = parseInt(comp.maxCaptainsQuota) || 10;
                    const isFull = (activeCount >= maxQuota && !isCurrent);
                    const foundedDateStr = this.formatTurkishDate(comp.createdDate);
                    const salaryFormatted = (parseInt(comp.dailySalary) || 2500).toLocaleString('tr-TR');
                    const compShare = (comp.companySharePercent !== undefined) ? comp.companySharePercent : 50;
                    const capShare = 100 - compShare;

                    html += `
                    <div style="background: rgba(15,23,42,0.92); border: 2px solid ${isCurrent ? '#22c55e' : '#f59e0b'}; border-radius: 12px; padding: 18px; display: flex; flex-direction: column; justify-content: space-between; box-shadow: 0 4px 20px rgba(245, 158, 11, 0.18);">
                        <div>
                            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
                                <div>
                                    <div style="font-size: 1.25rem; font-weight: bold; color: #fff; display: flex; align-items: center; gap: 8px;">
                                        <span>${comp.logo || '👑'}</span>
                                        <span>${comp.name}</span>
                                    </div>
                                    <div style="color: #94a3b8; font-size: 0.85rem; margin-top: 3px;">
                                        📅 <strong>Kurulma Tarihi:</strong> <span style="color: #bae6fd;">${foundedDateStr}</span> | 📍 <strong>Merkez:</strong> ${comp.city || 'Tekirdağ'}
                                    </div>
                                </div>
                                <span style="font-size: 0.82rem; padding: 4px 10px; border-radius: 6px; background: rgba(245, 158, 11, 0.2); border: 1px solid #f59e0b; color: #fde047; font-weight: bold; white-space: nowrap;">
                                    👑 KAPTAN ŞİRKETİ
                                </span>
                            </div>

                            <div style="color: #fde047; font-size: 0.88rem; font-style: italic; margin-bottom: 12px;">
                                "${comp.slogan || 'Karayollarında Güven ve Kalite'}"
                            </div>

                            <!-- Kurucunun Belirlediği Şartlar & Kaptan Sayısı -->
                            <div style="background: rgba(255,255,255,0.04); border-radius: 10px; padding: 12px 14px; margin-bottom: 12px; font-size: 0.9rem; color: #cbd5e1; border: 1px solid rgba(255,255,255,0.08);">
                                <div style="display: flex; justify-content: space-between; margin-bottom: 6px; padding-bottom: 6px; border-bottom: 1px solid rgba(255,255,255,0.06);">
                                    <span>👑 Kurucu Kaptan:</span>
                                    <strong style="color: #fde047; font-size: 0.95rem;">${comp.founder || 'Kaptan'}</strong>
                                </div>
                                <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
                                    <span>👥 Kaç Kaptan Çalışıyor (Kontenjan):</span>
                                    <strong style="color: ${isFull ? '#ef4444' : '#38bdf8'}; font-size: 0.95rem;">${activeCount} / ${maxQuota} Kaptan ${isFull ? '(Dolu)' : ''}</strong>
                                </div>
                                <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
                                    <span>💰 Kaptanlara Verilen Günlük Maaş:</span>
                                    <strong style="color: #4ade80; font-size: 1.05rem;">${salaryFormatted} ₺ / Gün</strong>
                                </div>
                                <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
                                    <span>📊 Hasılat Bölüşümü:</span>
                                    <strong style="color: #38bdf8; font-size: 0.95rem;">%${compShare} Şirkete / %${capShare} Kaptana</strong>
                                </div>
                                <div style="display: flex; justify-content: space-between;">
                                    <span>🎁 Sefer Başı Bilet Primi:</span>
                                    <strong style="color: #facc15;">+%${comp.bonusPercent || 18}</strong>
                                </div>
                            </div>

                            <div style="color: #94a3b8; font-size: 0.84rem; line-height: 1.4; margin-bottom: 14px; background: rgba(0,0,0,0.25); padding: 8px 10px; border-radius: 6px;">
                                💡 <em>Kurucu Şartı:</em> Kurucu ${comp.founder} tarafından ${maxQuota} kaptanlık kontenjan açılmış olup, kaptan başına günlük ${salaryFormatted} ₺ garanti maaş, %${compShare} şirket / %${capShare} kaptan gelir bölüşümü ve +%${comp.bonusPercent || 18} sefer primi ödenmektedir.
                            </div>
                        </div>

                        <div>
                            ${isCurrent ? `
                                <button class="modern-btn btn-leave-company nav-item" data-company-id="${comp.id}" style="width: 100%; padding: 11px; background: rgba(34,197,94,0.2); border: 1.5px solid #22c55e; color: #4ade80; font-weight: bold; border-radius: 8px; cursor: pointer; font-size: 0.95rem;" aria-label="${comp.name} şirketinden ayrıl">
                                    ✅ AKTİF ÇALIŞTIĞINIZ ŞİRKET (Ayrıl)
                                </button>
                            ` : (isFull ? `
                                <button class="modern-btn" disabled style="width: 100%; padding: 11px; background: rgba(255,255,255,0.05); border: 1px solid #475569; color: #64748b; font-weight: bold; border-radius: 8px; font-size: 0.92rem;">
                                    🔒 Kontenjan Dolu (${maxQuota}/${maxQuota} Kaptan)
                                </button>
                            ` : `
                                <button class="modern-btn btn-join-company nav-item" data-company-id="${comp.id}" style="width: 100%; padding: 11px; background: linear-gradient(135deg, #0284c7, #0369a1); border: 1.5px solid #38bdf8; color: #fff; font-weight: bold; border-radius: 8px; cursor: pointer; box-shadow: 0 4px 14px rgba(2, 132, 199, 0.35); font-size: 0.95rem;" aria-label="${comp.name} şirketine maaşlı kaptan olarak katıl">
                                    ✍️ Bu Şirkete Katıl (Günlük ${salaryFormatted} ₺ Maaş)
                                </button>
                            `)}
                        </div>
                    </div>
                    `;
                });
            }

            container.innerHTML = html;

            // Olay Dinleyicileri
            const btnEmptyCreate = container.querySelector('#btn-empty-create-company');
            if (btnEmptyCreate) {
                btnEmptyCreate.addEventListener('click', () => this.openCreateCompanyModal());
            }

            const btnSubCreate = container.querySelector('#btn-sub-create-company');
            if (btnSubCreate) {
                btnSubCreate.addEventListener('click', () => this.openCreateCompanyModal());
            }

            container.querySelectorAll('.btn-join-company').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const compId = e.currentTarget.getAttribute('data-company-id');
                    this.joinCorporateCompany(compId);
                });
            });

            container.querySelectorAll('.btn-leave-company').forEach(btn => {
                btn.addEventListener('click', () => {
                    this.leaveCorporateCompany();
                });
            });
        }
    };

    // Global nesneye bağla
    window.CompanySystem = CompanySystem;

    // DOM yüklendiğinde başlat
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => CompanySystem.init());
    } else {
        CompanySystem.init();
    }

})();
