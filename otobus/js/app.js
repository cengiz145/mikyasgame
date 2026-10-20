/* ==========================================================================
   TÜRKİYE TURNESİ - OTOBÜS SİMÜLASYONU BAÅLATICI (APP.JS)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // === HATA AYIKLAMA (DEBUG) MODU ===
    window.addEventListener('error', (e) => {
        console.error("Global JS Error:", e.message, "at", e.filename, ":", e.lineno);
        if (window.UI && typeof window.UI.showToast === 'function') {
            window.UI.showToast(`SİSTEM HATASI: ${e.message} (Satır: ${e.lineno})`, 'danger');
        }
        if (typeof audio !== 'undefined' && typeof audio.speak === 'function') {
            audio.speak(`Kritik sistem hatası: ${e.message}. Lütfen bu hatayı bana bildirin.`);
        }
    });
    
    window.addEventListener('unhandledrejection', (e) => {
        console.error("Unhandled Promise Rejection:", e.reason);
        let msg = e.reason ? (e.reason.message || e.reason) : "Bilinmeyen Promise Hatası";
        if (String(msg).indexOf('Firebase') === -1 && String(msg).indexOf('offline') === -1) {
            if (window.UI && typeof window.UI.showToast === 'function') {
                window.UI.showToast(`SİSTEM HATASI (Promise): ${msg}`, 'danger');
            }
            if (typeof audio !== 'undefined' && typeof audio.speak === 'function') {
                audio.speak(`Gizli arka plan hatası: ${msg}. Lütfen bu hatayı bana bildirin.`);
            }
        }
    });
    // ===================================
    
    // Initialize Keyboard Navigation on load
    KeyboardNav.initForScreen();

    // === GÜNCELLEME: Eski hatalı rotaları otomatik temizle ===
    if (!localStorage.getItem('routeFixApplied_v1')) {
        localStorage.removeItem('routesData');
        localStorage.removeItem('activeRoute');
        localStorage.setItem('routeFixApplied_v1', 'true');
        console.log("Eski hatalı rotalar başarıyla temizlendi, yeni sistem aktif.");
    }
    // ==========================================================

    // === HERKESİ SEVİYE 1'DEN BAŞLAT GÜNCELLEMESİ ===
    if (localStorage.getItem('sim_season_level1') !== 'true') {
        localStorage.setItem('sim_season_level1', 'true');
        localStorage.setItem('licenseLevel', '1');
        localStorage.setItem('completedTasks', '0');
        localStorage.setItem('unlockedCities', JSON.stringify(["Tekirdağ"]));
        localStorage.setItem('merkezUs', 'Tekirdağ');
        if (typeof Game !== 'undefined') {
            Game.licenseLevel = 1;
            Game.completedTasks = 0;
            Game.unlockedCities = ["Tekirdağ"];
            Game.currentCity = "Tekirdağ";
        }
        console.log("Herkes Seviye 1'den başlatıldı.");
    }
    // =================================================

        // === ROTALARI VE TEKULAŞ GÖREVLERİNİ AÇILIŞTA ANINDA YEREL VERİDEN YÜKLE ===
    const initAllRoutesInstantly = () => {
        try {
            if (typeof generateRoutesFromAPI === 'function') {
                const defaultStops = (typeof varsayilanSehirDuraklari !== 'undefined' && varsayilanSehirDuraklari["Tekirdağ"]) 
                    ? varsayilanSehirDuraklari["Tekirdağ"] : [];
                generateRoutesFromAPI(defaultStops, "Tekirdağ");
                console.log("Tekirdağ rotaları ve TEKULAŞ veritabanı anında yüklendi:", Object.keys(routesData).length);

                if (typeof varsayilanSehirDuraklari !== 'undefined') {
                    ["Yalova", "Bayburt", "Edirne", "Kırklareli", "İstanbul"].forEach(city => {
                        if (varsayilanSehirDuraklari[city]) {
                            generateRoutesFromAPI(varsayilanSehirDuraklari[city], city);
                        }
                    });
                }
            }
        } catch (preloadErr) {
            console.warn("Açılışta rota ön yükleme uyarısı:", preloadErr);
        }
    };
    initAllRoutesInstantly();
    // =========================================================================

    // 0. Splash Screen
    const splashScreen = document.getElementById('splash-screen');
    const loginScreen = document.getElementById('login-screen');
    const titleScreen = document.getElementById('title-screen');
    
        const dismissSplash = async () => {
        if (!splashScreen.classList.contains('hidden')) {
            if (typeof audio !== 'undefined' && audio.playSelect) audio.playSelect();
            splashScreen.classList.add('hidden');
            
            let savedUser = localStorage.getItem('otobusUsername');
            if (savedUser) {
                if (typeof UI !== 'undefined' && UI.showToast) UI.showToast('Kullanıcı bilgileri yükleniyor...', 'info');
                try {
                    if (typeof Game !== 'undefined' && Game.loadFromFirebase) {
                        await Game.loadFromFirebase(savedUser);
                    }
                } catch (err) {
                    console.warn("Firebase splash error:", err);
                }
                
                if (typeof UI !== 'undefined' && UI.switchScreen) {
                    UI.switchScreen('title-screen');
                } else {
                    titleScreen.classList.remove('hidden');
                }
                if (typeof UI !== 'undefined' && UI.showToast) UI.showToast(`Tekrar hoş geldin, ${savedUser}!`, 'success');
                if (typeof audio !== 'undefined' && audio.speak) audio.speak(`Tekrar hoş geldin, ${savedUser}!`);
                if (typeof UI !== 'undefined' && UI.updatePlayerStats && typeof Game !== 'undefined') {
                    const licenseTitle = (typeof Game.getLicenseTitle === 'function') ? Game.getLicenseTitle() : 'Stajyer';
                    UI.updatePlayerStats(Game.licenseLevel || 1, Game.completedTasks || 0, Game.playerBudget || 0, licenseTitle);
                }
            } else {
                loginScreen.classList.remove('hidden');
                const userInput = document.getElementById('username-input');
                if (userInput) userInput.focus();
            }
            if (typeof KeyboardNav !== 'undefined' && KeyboardNav.initForScreen) {
                KeyboardNav.initForScreen();
            }
        }
    };

    splashScreen.addEventListener('click', dismissSplash);
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            dismissSplash();
        }
    });

                // 0.5. Login Screen & Bölge / İlçe Listesi Sistemi (Yüksek Erişilebilirlik)
    const DISTRICT_OPTIONS = [
        { id: "Süleymanpaşa", icon: "🏙️", name: "Süleymanpaşa (Tekirdağ Merkez)", desc: "Şehir içi sahil, çarşı ve üniversite hatları" },
        { id: "Saray", icon: "🌳", name: "Saray (İlçe Merkezi & Mahalleleri)", desc: "Kuzey Trakya ormanları ve ilçe hatları" },
        { id: "Velimeşe", icon: "🏭", name: "Velimeşe (Ergene Sanayi & TOKİ)", desc: "Sanayi bölgesi, TOKİ konutları ve fabrika hatları" },
        { id: "Çorlu", icon: "🏭", name: "Çorlu (Sanayi & Şehir Merkezi)", desc: "Büyük metropol ve yoğun şehir hatları" },
        { id: "Çerkezköy - Kapaklı", icon: "🏢", name: "Çerkezköy ve Kapaklı", desc: "Organize sanayi ve ilçe hatları" },
        { id: "Malkara", icon: "🌾", name: "Malkara (Merkez & Köy Yolları)", desc: "Geniş ova, tepe mahalleler ve köy yolları" },
        { id: "Hayrabolu", icon: "🌻", name: "Hayrabolu (Trakya Ovası)", desc: "Ayçiçeği tarlaları ve ova çarşı hatları" },
        { id: "Şarköy", icon: "🍇", name: "Şarköy (Sahil & Bağ Yolları)", desc: "Marmara denizi kıyısı ve bağ hatları" },
        { id: "Muratlı", icon: "🚆", name: "Muratlı (Tren Garı & Çarşı)", desc: "Tren istasyonu aksı ve ilçe merkez seferleri" }
    ];

    let chosenDistrict = (typeof Game !== 'undefined' && Game.activeDistrict) ? Game.activeDistrict : (localStorage.getItem('activeDistrict') || "Süleymanpaşa");

    const renderLoginDistrictList = () => {
        const listEl = document.getElementById('login-district-list');
        const statusEl = document.getElementById('lbl-current-chosen-district');
        if (!listEl) return;
        listEl.innerHTML = '';
        listEl.setAttribute('role', 'radiogroup');
        listEl.setAttribute('aria-label', 'Başlangıç bölgesi ve ilçe listesi. 9 ilçe mevcuttur.');

        DISTRICT_OPTIONS.forEach((opt, idx) => {
            const isSelected = (opt.id === chosenDistrict);
            const li = document.createElement('li');
            li.style.marginBottom = '6px';

            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = `menu-btn nav-item login-dist-btn ${isSelected ? 'primary-btn' : ''}`;
            btn.style.width = '100%';
            btn.style.textAlign = 'left';
            btn.style.padding = '10px 14px';
            btn.style.fontSize = '0.98rem';
            btn.style.display = 'flex';
            btn.style.alignItems = 'center';
            btn.style.justifyContent = 'space-between';
            btn.style.border = isSelected ? '2px solid #22c55e' : '1px solid rgba(56,189,248,0.3)';
            btn.style.background = isSelected ? 'rgba(34, 197, 94, 0.22)' : 'rgba(15,23,42,0.7)';
            btn.style.cursor = 'pointer';
            btn.setAttribute('role', 'radio');
            btn.setAttribute('aria-checked', isSelected ? 'true' : 'false');
            btn.setAttribute('data-dist-id', opt.id);
            btn.setAttribute('aria-label', `${idx + 1}. İlçe: ${opt.name}. ${isSelected ? 'Seçili bölge.' : 'Seçmek için Enter tuşuna basın.'}`);

            btn.innerHTML = `
                <span><strong>${opt.icon} ${opt.name}</strong></span>
                <span class="sel-badge" style="font-weight:bold; font-size:0.9rem; color:${isSelected ? '#4ade80' : '#94a3b8'}">
                    ${isSelected ? '✓ SEÇİLİ' : 'Seç'}
                </span>
            `;

            btn.onclick = () => {
                chosenDistrict = opt.id;
                if (typeof audio !== 'undefined' && audio.playSelect) audio.playSelect();
                if (statusEl) statusEl.innerText = `${opt.icon} ${opt.name}`;
                
                // DOM'u yıkmadan sadece durum ve stilleri güncelle (NVDA odağını kaybetmez)
                const allButtons = listEl.querySelectorAll('.login-dist-btn');
                allButtons.forEach((b, bIdx) => {
                    const bId = b.getAttribute('data-dist-id');
                    const isSel = (bId === chosenDistrict);
                    b.setAttribute('aria-checked', isSel ? 'true' : 'false');
                    b.classList.toggle('primary-btn', isSel);
                    b.style.border = isSel ? '2px solid #22c55e' : '1px solid rgba(56,189,248,0.3)';
                    b.style.background = isSel ? 'rgba(34, 197, 94, 0.22)' : 'rgba(15,23,42,0.7)';
                    const badge = b.querySelector('.sel-badge');
                    if (badge) {
                        badge.innerText = isSel ? '✓ SEÇİLİ' : 'Seç';
                        badge.style.color = isSel ? '#4ade80' : '#94a3b8';
                    }
                    const o = DISTRICT_OPTIONS.find(x => x.id === bId);
                    if (o) {
                        b.setAttribute('aria-label', `${bIdx + 1}. İlçe: ${o.name}. ${isSel ? 'Seçili bölge.' : 'Seçmek için Enter tuşuna basın.'}`);
                    }
                });

                const announceText = `${opt.name} başlangıç bölgesi seçildi. Oyuna girmek için Aşağı okla Oyuna Gir butonuna ilerleyebilirsiniz.`;
                if (typeof audio !== 'undefined' && audio.speak) audio.speak(announceText);
                if (typeof audio !== 'undefined' && audio.updateNvdaLiveRegion) audio.updateNvdaLiveRegion(announceText);
            };

            li.appendChild(btn);
            listEl.appendChild(li);
        });

        if (statusEl) {
            const cur = DISTRICT_OPTIONS.find(o => o.id === chosenDistrict) || DISTRICT_OPTIONS[0];
            statusEl.innerText = `${cur.icon} ${cur.name}`;
        }
    };

    // Açılışta login listesini hazırla
    renderLoginDistrictList();

    const usernameInput = document.getElementById('username-input');
    const btnLogin = document.getElementById('btn-login');

    const handleLoginAction = async () => {
        let username = (usernameInput && usernameInput.value) ? usernameInput.value.trim() : '';
        username = username.replace(/[.#$\[\]]/g, '');
        
        // Asla kullanıcıyı engelleme, boşsa Kaptan yap
        if (!username) {
            username = "Kaptan";
        }

        if (typeof audio !== 'undefined' && audio.playSelect) audio.playSelect();
        if (typeof UI !== 'undefined' && UI.showToast) UI.showToast('Giriş yapılıyor, lütfen bekleyin...', 'info');
        if (typeof audio !== 'undefined' && audio.speak) audio.speak(`Giriş yapılıyor. Hoş geldin, ${username}!`);

        try {
            if (typeof Game !== 'undefined' && Game.loadFromFirebase) {
                await Game.loadFromFirebase(username);
            }
        } catch (error) {
            console.warn("Firebase bağlantı hatası, yerel modla devam ediliyor:", error);
        }

        if (typeof Game !== 'undefined' && Game.setActiveDistrict) {
            Game.setActiveDistrict(chosenDistrict);
        } else {
            localStorage.setItem('activeDistrict', chosenDistrict);
        }
        localStorage.setItem('otobusUsername', username);
        
        if (typeof UI !== 'undefined' && UI.switchScreen) {
            UI.switchScreen('title-screen');
        } else {
            document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
            if (titleScreen) titleScreen.classList.remove('hidden');
        }

        if (typeof KeyboardNav !== 'undefined' && KeyboardNav.initForScreen) {
            KeyboardNav.initForScreen();
        }
        
        if (typeof UI !== 'undefined' && UI.showToast) UI.showToast(`Hoş geldin, ${username}!`, 'success');
        if (typeof audio !== 'undefined' && audio.speak) audio.speak(`Hoş geldin, ${username}! Ana menü açıldı. Çalışma bölgeniz ${chosenDistrict}.`);
        if (typeof UI !== 'undefined' && UI.updatePlayerStats && typeof Game !== 'undefined') {
            const licenseTitle = (typeof Game.getLicenseTitle === 'function') ? Game.getLicenseTitle() : 'Stajyer';
            UI.updatePlayerStats(Game.licenseLevel || 1, Game.completedTasks || 0, Game.playerBudget || 0, licenseTitle);
        }
        if (typeof UI !== 'undefined' && UI.updateTitleScreenButtons) {
            UI.updateTitleScreenButtons();
        }
    };

    if (usernameInput) {
        usernameInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                handleLoginAction();
            }
        });
    }

    if (btnLogin) {
        btnLogin.addEventListener('click', handleLoginAction);
    }

    // Title Screen - Bölge & İlçe Seçim Modalı (Listeden Oklarla Gezinme)
    const openDistrictPickerModal = () => {
        const modal = document.getElementById('district-picker-modal');
        const listEl = document.getElementById('district-picker-list');
        if (!modal || !listEl) return;

        const curDist = (typeof Game !== 'undefined' && Game.activeDistrict) ? Game.activeDistrict : (localStorage.getItem('activeDistrict') || 'Süleymanpaşa');
        listEl.innerHTML = '';
        listEl.setAttribute('role', 'radiogroup');
        listEl.setAttribute('aria-label', 'Bölge ve ilçe seçim listesi. 9 ilçe mevcuttur.');

        DISTRICT_OPTIONS.forEach((opt, idx) => {
            const isSelected = (opt.id === curDist);
            const li = document.createElement('li');
            li.style.marginBottom = '8px';

            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = `menu-btn nav-item ${isSelected ? 'primary-btn' : ''}`;
            btn.style.width = '100%';
            btn.style.textAlign = 'left';
            btn.style.padding = '12px 16px';
            btn.style.fontSize = '1.02rem';
            btn.style.display = 'flex';
            btn.style.alignItems = 'center';
            btn.style.justifyContent = 'space-between';
            btn.style.border = isSelected ? '2px solid #22c55e' : '1.5px solid rgba(56,189,248,0.3)';
            btn.style.background = isSelected ? 'rgba(34, 197, 94, 0.22)' : 'rgba(15,23,42,0.85)';
            btn.style.cursor = 'pointer';
            btn.setAttribute('role', 'radio');
            btn.setAttribute('aria-checked', isSelected ? 'true' : 'false');
            btn.setAttribute('data-dist-id', opt.id);
            btn.setAttribute('aria-label', `${idx + 1}. İlçe: ${opt.name}. ${opt.desc}. ${isSelected ? 'Şu anki aktif çalışma bölgeniz.' : 'Seçmek için Enter tuşuna basın.'}`);

            btn.innerHTML = `
                <span class="btn-text">
                    <strong>${opt.icon} ${opt.name}</strong>
                    <small style="display:block; color:#94a3b8; font-size:0.85rem; margin-top:2px;">${opt.desc}</small>
                </span>
                <span style="font-weight:bold; font-size:0.95rem; color:${isSelected ? '#4ade80' : '#38bdf8'};">
                    ${isSelected ? '✓ SEÇİLİ' : 'Seç (Enter)'}
                </span>
            `;

            btn.onclick = () => {
                if (typeof audio !== 'undefined' && audio.playSelect) audio.playSelect();
                if (typeof Game !== 'undefined' && Game.setActiveDistrict) {
                    Game.setActiveDistrict(opt.id);
                } else {
                    localStorage.setItem('activeDistrict', opt.id);
                }
                closeDistrictPickerModal();
                if (typeof UI !== 'undefined' && UI.updateTitleScreenButtons) {
                    UI.updateTitleScreenButtons();
                }
                const announceMsg = `${opt.name} ana çalışma bölgeniz olarak seçildi. 1. Seviye seferleriniz 4 duraktan başlayarak hazırlandı.`;
                if (typeof audio !== 'undefined' && audio.speak) audio.speak(announceMsg);
                if (typeof audio !== 'undefined' && audio.updateNvdaLiveRegion) audio.updateNvdaLiveRegion(announceMsg);
                if (typeof UI !== 'undefined' && UI.showToast) UI.showToast(`📍 Aktif Bölge: ${opt.name}`, 'success');
            };

            li.appendChild(btn);
            listEl.appendChild(li);
        });

        modal.classList.remove('hidden');
        if (typeof KeyboardNav !== 'undefined' && KeyboardNav.initForScreen) {
            KeyboardNav.initForScreen();
        }

        // Seçili ilçeye veya ilk öğeye odaklan
        setTimeout(() => {
            const activeBtn = listEl.querySelector(`[data-dist-id="${curDist}"]`) || listEl.querySelector('button');
            if (activeBtn) activeBtn.focus();
        }, 120);

        const welcomeVoice = "Bölge ve ilçe seçim penceresi açıldı. 9 ilçe arasında yukarı ve aşağı oklarla gezinebilir, Enter ile seçebilirsiniz. Kapatmak için Escape tuşuna basabilirsiniz.";
        if (typeof audio !== 'undefined' && audio.speak) audio.speak(welcomeVoice);
        if (typeof audio !== 'undefined' && audio.updateNvdaLiveRegion) audio.updateNvdaLiveRegion(welcomeVoice);
    };

    const closeDistrictPickerModal = () => {
        const modal = document.getElementById('district-picker-modal');
        if (modal) modal.classList.add('hidden');
        if (typeof KeyboardNav !== 'undefined' && KeyboardNav.initForScreen) {
            KeyboardNav.initForScreen();
        }
        const btnChange = document.getElementById('btn-change-active-district');
        if (btnChange) btnChange.focus();
    };

    const btnClosePicker = document.getElementById('btn-close-district-picker');
    if (btnClosePicker) {
        btnClosePicker.addEventListener('click', closeDistrictPickerModal);
    }

    const btnChangeDist = document.getElementById('btn-change-active-district');
    if (btnChangeDist) {
        btnChangeDist.addEventListener('click', openDistrictPickerModal);
    }

    // 1. Title Screen - Şehir İçi ve Şehirlerarası Ayrımı
    const openCitySelection = () => {
        /* TEKULAŞ_CATEGORIZED_MENU_SYSTEM */
        Game.gameMode = 'city';
        Game.busType = 'belediye';

        // 10 seviye geçilmeden ilçeler, şehirler, ülkeler ve harita kesinlikle gözükmesin! Doğrudan aktif ilçe görev ekranına yönlendir
        if (!Game.hasPassedLevel10()) {
            const activeDist = (typeof Game !== 'undefined' && Game.activeDistrict) ? Game.activeDistrict : (localStorage.getItem('activeDistrict') || "Süleymanpaşa");
            audio.speak(`${activeDist} şehir içi belediye seferleri seçildi. Sefer görevleri listeleniyor.`);
            UI.showToast(`${activeDist} Şehir İçi Seferleri (10 Seviye Kuralı)`, "info");
            document.dispatchEvent(new CustomEvent('go-to-route-screen', { detail: { city: "Tekirdağ", district: activeDist } }));
            return;
        }

        audio.speak("Şehir içi ve ilçe belediye seferleri seçildi. Lütfen gitmek istediğiniz bölgeyi veya hattı seçin.");
        UI.showToast("Belediye Seferleri (TEKULAŞ) Modu Aktif", "info");

        // TEKULAŞ KATEGORİLİ HAT SEÇİM MENÜSÜ
        const listEl = document.getElementById('district-dest-list');
        const descEl = document.getElementById('district-modal-desc');
        const tekulasDb = (typeof window !== 'undefined' && window.tekulasHatVeritabani) ? window.tekulasHatVeritabani : (typeof ilceRotalari !== 'undefined' ? ilceRotalari["Tekirdağ"] : []);

        const renderCategories = () => {
            if (!listEl) return;
            listEl.innerHTML = '';
            if (descEl) descEl.innerText = "Lütfen gitmek istediğiniz ilçe veya hat kategorisini seçin:";

            const cats = [
                { id: "Süleymanpaşa", icon: "🏙️", title: "Süleymanpaşa Şehir İçi Hatları", filter: r => r.district === 'Süleymanpaşa' },
                { id: "Çorlu", icon: "🏭", title: "Çorlu Şehir İçi Hatları", filter: r => r.district === 'Çorlu' },
                { id: "Çerkezköy - Kapaklı", icon: "🏢", title: "Çerkezköy ve Kapaklı Hatları", filter: r => r.district === 'Çerkezköy - Kapaklı' },
                { id: "İlçeler Arası", icon: "🚌", title: "İlçeler Arası Hatlar (Hat 26 Saray, Hat 48 Velimeşe vb.)", filter: r => r.isDistrict || r.district === 'İlçeler Arası' },
                { id: "Malkara", icon: "🌾", title: "Malkara Hatları", filter: r => r.district === 'Malkara' },
                { id: "Saray", icon: "🌳", title: "Saray Hatları", filter: r => r.district === 'Saray' },
                { id: "Hayrabolu", icon: "🌻", title: "Hayrabolu Hatları", filter: r => r.district === 'Hayrabolu' },
                { id: "Şarköy", icon: "🍇", title: "Şarköy Hatları", filter: r => r.district === 'Şarköy' },
                { id: "Muratlı", icon: "🚆", title: "Muratlı Hatları", filter: r => r.district === 'Muratlı' },
                { id: "TÜMÜ", icon: "📋", title: "Tüm TEKULAŞ Hatları (183 Hat, 3.913 Durak)", filter: () => true }
            ];

            cats.forEach(c => {
                const count = tekulasDb.filter(c.filter).length;
                const li = document.createElement('li');
                li.style.marginBottom = "10px";
                const btn = document.createElement('button');
                btn.className = 'menu-btn nav-item';
                btn.style.width = '100%';
                btn.style.justifyContent = 'space-between';
                btn.style.padding = '14px 16px';
                btn.innerHTML = '<span><strong>' + c.icon + ' ' + c.title + '</strong></span><span style="color: var(--secondary); font-weight: bold;">' + count + ' Hat</span>';
                btn.setAttribute('aria-label', c.title + ', ' + count + ' hat mevcut.');
                btn.onclick = () => {
                    audio.playSelect();
                    renderCategoryLines(c);
                };
                li.appendChild(btn);
                listEl.appendChild(li);
            });

            KeyboardNav.initForScreen();
        };

        const renderCategoryLines = (cat) => {
            if (!listEl) return;
            listEl.innerHTML = '';
            if (descEl) descEl.innerText = cat.title + " listeleniyor. Bir hat seçin:";
            audio.speak(cat.title + " listelendi. Toplam hat sayısı: " + tekulasDb.filter(cat.filter).length);

            // Geri dön butonu
            const backLi = document.createElement('li');
            backLi.style.marginBottom = "12px";
            const backBtn = document.createElement('button');
            backBtn.className = 'menu-btn nav-item';
            backBtn.style.width = '100%';
            backBtn.style.padding = '12px';
            backBtn.style.background = 'rgba(255,255,255,0.1)';
            backBtn.style.color = '#f87171';
            backBtn.innerHTML = '<span>⬅️ <strong>Kategorilere Dön</strong></span>';
            backBtn.setAttribute('aria-label', 'Kategorilere geri dön');
            backBtn.onclick = () => {
                audio.playSelect();
                audio.speak("Kategorilere dönüldü.");
                renderCategories();
            };
            backLi.appendChild(backBtn);
            listEl.appendChild(backLi);

            const filteredLines = tekulasDb.filter(cat.filter);
            filteredLines.forEach(route => {
                const li = document.createElement('li');
                li.style.marginBottom = "8px";
                const btn = document.createElement('button');
                btn.className = 'menu-btn nav-item';
                btn.style.width = '100%';
                btn.style.flexDirection = 'column';
                btn.style.alignItems = 'stretch';
                btn.style.textAlign = 'left';
                btn.style.padding = '12px 14px';

                const totalKm = route.totalKm || (route.stops ? route.stops.reduce((sum, s) => sum + (s.gercekMesafeSonraki || 0), 0) : 10);
                const stopCount = route.stops ? route.stops.length : (route.allUniqueStops ? route.allUniqueStops.length : 0);
                const sName = route.startStop || (route.stops && route.stops[0] ? route.stops[0].name : "");
                const eName = route.endStop || (route.stops && route.stops.length > 0 ? route.stops[route.stops.length - 1].name : "");

                let ariaTxt = "Hat " + route.hatNo + ": " + route.name + ". Toplam " + stopCount + " durak, " + totalKm.toFixed(1) + " kilometre. Kalkış: " + sName + ", Varış: " + eName;
                btn.setAttribute('aria-label', ariaTxt);

                btn.innerHTML = [
                    '<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">',
                    '   <span style="font-weight: bold; color: ' + (route.color || '#38bdf8') + '; font-size: 1.05rem;">[Hat ' + route.hatNo + '] ' + route.name + '</span>',
                    '   <span style="color: var(--secondary); font-size: 0.85rem; font-weight: bold;">' + stopCount + ' Durak | ' + totalKm.toFixed(1) + ' KM</span>',
                    '</div>',
                    '<div style="font-size: 0.85rem; color: #94a3b8;">',
                    '   📍 ' + sName + ' ➔ 🏁 ' + eName,
                    '</div>'
                ].join('');

                const access = (typeof Game !== 'undefined' && typeof Game.isRouteAccessible === 'function')
                    ? Game.isRouteAccessible(route.id)
                    : { allowed: true };

                if (!access.allowed) {
                    btn.classList.add('locked-route');
                    btn.style.opacity = '0.65';
                    btn.style.border = '1px dashed rgba(239, 68, 68, 0.5)';
                    btn.setAttribute('aria-disabled', 'true');
                }

                btn.onclick = () => {
                    if (!access.allowed) {
                        if (typeof audio !== 'undefined' && audio.playWarning) {
                            try { audio.playWarning(); } catch(e) {}
                        }
                        if (typeof audio !== 'undefined' && audio.speak) audio.speak(access.reason);
                        if (typeof UI !== 'undefined' && UI.showToast) UI.showToast(access.reason, "warning");
                        return;
                    }
                    audio.playSelect();
                    document.getElementById('district-dest-modal').classList.add('hidden');
                    routesData[route.id] = route;
                    audio.speak("TEKULAŞ " + route.name + " devreye alındı. İyi yolculuklar kaptan.");
                    UI.showToast(route.name + " Devreye Alındı (" + totalKm.toFixed(1) + " KM)", "success");
                    Game.startRoute(route.id);
                };

                li.appendChild(btn);
                listEl.appendChild(li);
            });

            KeyboardNav.initForScreen();
        };

        renderCategories();
        document.getElementById('district-dest-modal').classList.remove('hidden');
        KeyboardNav.initForScreen();
    };

    const openIntercitySelection = () => {
        if (!Game.hasPassedLevel10()) {
            audio.playSelect();
            const msg = "Mikyas Kaptanlık Akademisi Kuralı: Bir seviye tamamlanmadan diğer seviyelere başlanamaz! Şehirlerarası seyahat için önce 1. Seviye Şehir İçi Seferlerini (10 Görevi) tamamlamalısınız. Mevcut tamamlanan: " + (Game.completedTasks || 0) + " / 10.";
            audio.speak(msg);
            UI.showToast("Mikyas Akademisi: 1. Seviye (10 Görev) Tamamlanmadan Şehirlerarası Sefer Açılamaz", "warning");
            return;
        }
        Game.gameMode = 'intercity';
        Game.busType = 'seyahat';
        
        audio.playSelect();
        audio.speak("Şehirlerarası seyahat modu seçildi. Lütfen hareket edeceğiniz şehri ve sefer güzergâhınızı seçin.");
        UI.showToast("Şehirler Arası Seyahat (Türkiye Turnesi) Modu Aktif", "info");

        UI.renderCityMap(Game.licenseLevel, Game.unlockedCities);
        UI.updatePlayerStats(Game.licenseLevel, Game.completedTasks, Game.playerBudget, Game.getLicenseTitle());
        UI.switchScreen('base-selection-menu');
    };

    if (document.getElementById('btn-start-city')) {
        document.getElementById('btn-start-city').addEventListener('click', openCitySelection);
    }
    if (document.getElementById('btn-start-intercity')) {
        document.getElementById('btn-start-intercity').addEventListener('click', openIntercitySelection);
    }

    document.getElementById('btn-start-game').addEventListener('click', () => {
        audio.playSelect();
        
        if (Game.savedState) {
            audio.speak("Kaldığınız yerden yola devam ediyorsunuz.");
            Game.resumeFromSave();
            return;
        }

        UI.renderCityMap(Game.licenseLevel, Game.unlockedCities);
        UI.updatePlayerStats(Game.licenseLevel, Game.completedTasks, Game.playerBudget, Game.getLicenseTitle());
        
        // Eğer daha önce merkez üs seçilmişse, direkt o şehrin görev ekranına (oyuna başla menüsüne) at!
        if (!Game.hasPassedLevel10()) {
            document.dispatchEvent(new CustomEvent('go-to-route-screen', { detail: { city: "Tekirdağ" } }));
        } else if (!Game.hasPassedLevel10()) {
            document.dispatchEvent(new CustomEvent('go-to-route-screen', { detail: { city: "Tekirdağ" } }));
        } else if (!Game.hasPassedLevel10()) {
            document.dispatchEvent(new CustomEvent('go-to-route-screen', { detail: { city: "Tekirdağ" } }));
        } else if (Game.unlockedCities.length > 0 && Game.currentCity) {
            document.dispatchEvent(new CustomEvent('go-to-route-screen', { detail: { city: Game.currentCity } }));
        } else {
            UI.switchScreen('base-selection-menu');
        }
    });

    document.getElementById('btn-exit-game').addEventListener('click', () => {
        audio.playSelect();
        document.getElementById('exit-screen').classList.remove('hidden');
    });

    document.getElementById('btn-clear-cache').addEventListener('click', () => {
        audio.playSelect();
        
        // Sadece tutulması gerekenleri ayır
        const safeKeys = ['otobusUsername', 'licenseLevel', 'completedTasks', 'para', 'clockMinutes', 'unlockedCities', 'merkezUs'];
        const savedData = {};
        
        safeKeys.forEach(key => {
            savedData[key] = localStorage.getItem(key);
        });
        
        // Tümünü temizle (Gereksiz/bozuk veriler gider)
        localStorage.clear();
        
        // Gerekli olanları geri yükle
        safeKeys.forEach(key => {
            if (savedData[key] !== null) {
                localStorage.setItem(key, savedData[key]);
            }
        });
        
        UI.showToast("Önbellek temizlendi, oyun yeniden başlatılıyor...", "success");
        if (typeof audio !== 'undefined' && typeof audio.speak === 'function') {
            audio.speak("Gereksiz veriler temizlendi, oyun yeniden başlatılıyor.");
        }
        
        setTimeout(() => {
            window.location.reload(true);
        }, 2000);
    });

    // 2. City Selection (Map) Screen
    const btnBaseBack = document.getElementById('btn-base-back');
    if (btnBaseBack) {
        btnBaseBack.addEventListener('click', () => {
            if (typeof audio !== 'undefined' && audio.playSelect) audio.playSelect();
            if (typeof audio !== 'undefined' && audio.speak) audio.speak("Ana ekrana dönüldü.");
            if (typeof UI !== 'undefined' && UI.switchScreen) {
                UI.switchScreen('title-screen');
            }
            const btnStart = document.getElementById('btn-start-city');
            if (btnStart) btnStart.focus();
        });
    }

    // Harita ekranından rota ekranına geçiş eventi (ui.js fırlatıyor)
    // 2.5 Mode Selection Modals
    document.getElementById('btn-mode-inner').addEventListener('click', () => {
        audio.playSelect();
        document.getElementById('mode-selection-modal').classList.add('hidden');
        KeyboardNav.initForScreen(); // Modal kapandı, arkaplana odaklan
        document.dispatchEvent(new CustomEvent('go-to-route-screen', { detail: { city: Game.currentCity } }));
    });

    document.getElementById('btn-mode-cancel').addEventListener('click', () => {
        audio.playSelect();
        document.getElementById('mode-selection-modal').classList.add('hidden');
        KeyboardNav.initForScreen(); // Modal kapandı, arkaplana odaklan
    });

    document.getElementById('btn-mode-inter').addEventListener('click', () => {
        audio.playSelect();
        document.getElementById('mode-selection-modal').classList.add('hidden');
        
        // Populate destination list
        const listEl = document.getElementById('intercity-dest-list');
        listEl.innerHTML = '';
        
        const unlockedCitiesArr = Game.unlockedCities;
        let hasDestinations = false;
        
        // Find all possible destinations (all unlocked + neighbors)
        const possibleDests = new Set([...unlockedCitiesArr]);
        const data = sehirRotalari[Game.currentCity];
        if (data && data.komsular) {
            Object.values(data.komsular).forEach(n => possibleDests.add(n));
        }
        
        possibleDests.delete(Game.currentCity); // Can't go to self
        
        possibleDests.forEach(destCity => {
            hasDestinations = true;
            const isUnlocked = unlockedCitiesArr.includes(destCity);
            const li = document.createElement('li');
            li.style.marginBottom = "10px";
            
            const btn = document.createElement('button');
            btn.className = 'menu-btn nav-item';
            btn.style.width = '100%';
            btn.style.justifyContent = 'space-between';
            btn.style.padding = '15px';
            
            btn.innerHTML = `
                <span><strong>${destCity}</strong> ${isUnlocked ? '(Açık Åehir)' : '(Keşfedilecek)'}</span>
                <span style="color: var(--secondary);">15 KM Sefer</span>
            `;
            
            btn.onclick = () => {
                audio.playSelect();
                document.getElementById('intercity-dest-modal').classList.add('hidden');
                
                // GENERATE AND START INTERCITY ROUTE
                const intercityRouteId = "intercity_" + Game.currentCity + "_" + destCity;
                const startStop = Game.currentCity + " Kalkış Peronu";
                const endStop = destCity + " Merkez Otogar";
                routesData[intercityRouteId] = {
                    id: intercityRouteId,
                    name: "Şehirlerarası Sefer: " + Game.currentCity + " ➔ " + destCity,
                    startStop: startStop,
                    endStop: endStop,
                    intermediateStops: [],
                    desc: "Kalkış: " + startStop + " ➔ Varış: " + endStop + ". Otoyol üzerinden ekspres şehirlerarası sefer.",
                    detailedInstructions: "Şehirlerarası Sefer Adımları:\n1. Adım: " + startStop + " durağından bekleyen 28 yolcuyu alarak hareket edin.\n2. Adım (Hedef Son Durak): Sonra " + endStop + " durağına gidin; tüm yolcuları indirin ve görevi başarıyla tamamlayın.",
                    speechBriefing: "Şehirlerarası " + Game.currentCity + " " + destCity + " seferi. 1. Adım: " + startStop + " durağından bekleyen yolcuları alarak hareket edin. 2. Adım: Son durak olan " + endStop + " durağına varıp tüm yolcuları indirin ve görevi tamamlayın.",
                    color: "#facc15",
                    taskIndex: Game.completedTasks,
                    otobusKapasitesi: 28,
                    biletFiyatMultiplier: 10,
                    isIntercity: true,
                    destCity: destCity,
                    stops: []
                };
                const sehirlerarasiMesafeler = {
                    "Tekirdağ-İstanbul": 135, "İstanbul-Tekirdağ": 135,
                    "Tekirdağ-Edirne": 140, "Edirne-Tekirdağ": 140,
                    "Tekirdağ-Kırklareli": 115, "Kırklareli-Tekirdağ": 115,
                    "Tekirdağ-Çanakkale": 170, "Çanakkale-Tekirdağ": 170,
                    "İstanbul-Ankara": 450, "Ankara-İstanbul": 450,
                    "Edirne-Kırklareli": 65, "Kırklareli-Edirne": 65,
                    "İstanbul-Edirne": 240, "Edirne-İstanbul": 240,
                    "İstanbul-Kırklareli": 215, "Kırklareli-İstanbul": 215,
                    "Çanakkale-Balıkesir": 195,
                    "Tekirdağ-Ankara": 585, "Ankara-Tekirdağ": 585
                };
                const intercityKey = Game.currentCity + "-" + destCity;
                const realDistKm = sehirlerarasiMesafeler[intercityKey] || 150;
                
                routesData[intercityRouteId].stops = [
                    { name: startStop, anons: startStop + " kalkış peronundayız. " + destCity + " seferi başlıyor.", bekleyenYolcu: 28, inenYolcu: 0, gercekMesafeSonraki: realDistKm },
                    { name: endStop, anons: "Son durak: " + endStop + ". Şehirlerarası seferimiz sona ermiştir.", bekleyenYolcu: 0, inenYolcu: 28, gercekMesafeSonraki: 0 }
                ];
                
                // Add to sehirRotalari temporarily so startRoute works
                if (!sehirRotalari[Game.currentCity].routes.includes(intercityRouteId)) {
                    sehirRotalari[Game.currentCity].routes.push(intercityRouteId);
                }
                
                Game.startRoute(intercityRouteId);
            };
            li.appendChild(btn);
            listEl.appendChild(li);
        });
        
        if (hasDestinations) {
            document.getElementById('intercity-dest-modal').classList.remove('hidden');
            KeyboardNav.initForScreen(); // Modal açıldı, odağı buraya al
        } else {
            UI.showToast("Gidilebilecek şehir bulunamadı.", "error");
            document.getElementById('mode-selection-modal').classList.remove('hidden');
            KeyboardNav.initForScreen();
        }
    });

    
    // === İLÇE SEFERLERİ MODAL YÖNETİCİSİ ===
    const openDistrictModal = () => {
        if (!Game.hasPassedLevel10()) {
            audio.playSelect();
            audio.speak("İlçe seferleri için önce şehir içi 10 seviyeyi geçmelisiniz. Mevcut seviyeniz: " + Game.licenseLevel);
            UI.showToast("İlçe Seferleri 10. Seviyeden Sonra Açılır", "warning");
            return;
        }
        audio.playSelect();
        const modeModal = document.getElementById('mode-selection-modal');
        if (modeModal) modeModal.classList.add('hidden');
        
        const listEl = document.getElementById('district-dest-list');
        if (!listEl) return;
        listEl.innerHTML = '';
        
        const currentCity = Game.currentCity || "Tekirdağ";
        const districtList = (typeof ilceRotalari !== 'undefined' && ilceRotalari[currentCity]) 
            ? ilceRotalari[currentCity] 
            : (typeof ilceRotalari !== 'undefined' ? ilceRotalari["Tekirdağ"] : []);
        
        if (!districtList || districtList.length === 0) {
            UI.showToast("Bu şehir için tanımlı ilçe hattı bulunamadı.", "error");
            if (modeModal) modeModal.classList.remove('hidden');
            KeyboardNav.initForScreen();
            return;
        }

        districtList.forEach(distRoute => {
            const li = document.createElement('li');
            li.style.marginBottom = "10px";
            
            const btn = document.createElement('button');
            btn.className = 'menu-btn nav-item';
            btn.style.width = '100%';
            btn.style.justifyContent = 'space-between';
            btn.style.padding = '15px';
            
            const totalKm = distRoute.stops.reduce((sum, s) => sum + (s.gercekMesafeSonraki || 0), 0);
            
            btn.innerHTML = `
                <span><strong style="color: ${distRoute.color};">[Hat ${distRoute.hatNo}] ${distRoute.destDistrict}</strong> (${distRoute.originDistrict} - ${distRoute.destDistrict})</span>
                <span style="color: var(--secondary);">${totalKm.toFixed(0)} KM İlçe Seferi</span>
            `;
            
            btn.onclick = () => {
                audio.playSelect();
                document.getElementById('district-dest-modal').classList.add('hidden');
                
                // Rota verisini routesData havuzuna ekle
                routesData[distRoute.id] = distRoute;
                
                if (distRoute.id === "hat_velimese_cetin_ring" || distRoute.hatNo === "48/R") {
                    audio.speak("TEKULAŞ 48 Taksim R Velimeşe Çetin Sokak Mahalle Ring seferi devreye alındı. İyi yolculuklar kaptan.");
                    UI.showToast("48/R Hattı: Velimeşe Çetin Sokak Ring (6 KM)", "success");
                } else if (distRoute.hatNo === "48") {
                    audio.speak("TEKULAŞ 48 numaralı Velimeşe Çorlu hattı devreye alındı. İyi yolculuklar kaptan.");
                    UI.showToast("48 Numaralı Hat: Velimeşe - Çorlu (19 KM)", "success");
                } else if (distRoute.hatNo === "26") {
                    audio.speak("TEKULAŞ 26 numaralı Süleymanpaşa Saray hattı devreye alındı. İyi yolculuklar kaptan.");
                    UI.showToast("26 Numaralı Hat Devreye Alındı: Süleymanpaşa - Saray (86 KM)", "success");
                } else {
                    audio.speak(`${distRoute.name} hattı devreye alındı.`);
                    UI.showToast(`${distRoute.name} Devreye Alındı`, "success");
                }
                
                Game.startRoute(distRoute.id);
            };
            
            li.appendChild(btn);
            listEl.appendChild(li);
        });
        
        document.getElementById('district-dest-modal').classList.remove('hidden');
        KeyboardNav.initForScreen();
        audio.speak("İlçe seferleri listelendi. Lütfen gitmek istediğiniz hattı seçin.");
    };

    const btnModeDistrict = document.getElementById('btn-mode-district');
    if (btnModeDistrict) {
        btnModeDistrict.addEventListener('click', openDistrictModal);
    }
    
    const btnRouteDistrict = document.getElementById('btn-route-district-mode');
    if (btnRouteDistrict) {
        btnRouteDistrict.addEventListener('click', openDistrictModal);
    }

    const btnDistrictCancel = document.getElementById('btn-district-cancel');
    if (btnDistrictCancel) {
        btnDistrictCancel.addEventListener('click', () => {
            audio.playSelect();
            document.getElementById('district-dest-modal').classList.add('hidden');
            const modeModal = document.getElementById('mode-selection-modal');
            if (modeModal) modeModal.classList.remove('hidden');
            KeyboardNav.initForScreen();
        });
    }
    // ======================================

    document.getElementById('btn-intercity-cancel').addEventListener('click', () => {
        audio.playSelect();
        document.getElementById('intercity-dest-modal').classList.add('hidden');
        document.getElementById('mode-selection-modal').classList.remove('hidden');
        KeyboardNav.initForScreen(); // Önceki modala geri dönüldü
    });

    // 3. Route Menu // Eğer bu şehir için önceden API'den rota çekilmemişse, çek.
    document.addEventListener('go-to-route-screen', async (e) => {
        const cityName = e.detail.city || "Tekirdağ";
        const districtName = e.detail.district || (typeof Game !== 'undefined' && Game.activeDistrict) || localStorage.getItem('activeDistrict') || "Süleymanpaşa";
        
        // Bu şehir ve ilçe için taskIndex'e sahip sıralı sefer görevleri var mı kontrol et
        let existingTaskRoutes = Object.values(routesData).filter(r => r.sehir === cityName && r.district === districtName && typeof r.taskIndex === 'number');
        
        if (existingTaskRoutes.length === 0 || (existingTaskRoutes.length > 0 && existingTaskRoutes[0].district !== districtName)) {
            const realCityStops = (typeof varsayilanSehirDuraklari !== 'undefined' && varsayilanSehirDuraklari[cityName])
                ? varsayilanSehirDuraklari[cityName]
                : (typeof varsayilanSehirDuraklari !== 'undefined' ? varsayilanSehirDuraklari["Tekirdağ"] : []);
            
            if (typeof generateRoutesFromAPI === 'function') {
                generateRoutesFromAPI(realCityStops, cityName, districtName);
            }
        }
        
        // Rotaları çiz ve ekrana anında geç
        UI.renderRoutes(cityName, Game.completedTasks);
        UI.switchScreen('route-menu');
    });

    // 3. Route Selection Screen
    document.getElementById('btn-route-back').addEventListener('click', () => {
        audio.playSelect();
        if (Game.hasPassedLevel10()) {
            UI.renderCityMap(Game.licenseLevel, Game.unlockedCities);
            UI.switchScreen('base-selection-menu');
        } else {
            UI.switchScreen('title-screen');
        }
    });

    // 4. Garage Logic (Sefer Özeti)
    const btnReadBriefing = document.getElementById("btn-read-briefing");
    if (btnReadBriefing) {
        btnReadBriefing.addEventListener("click", () => {
            audio.playSelect();
            if (Game.activeRouteData) {
                const briefing = Game.activeRouteData.speechBriefing || Game.activeRouteData.desc;
                if (typeof audio.speak === "function") {
                    audio.speak(briefing);
                }
                if (typeof audio.updateNvdaLiveRegion === "function") {
                    audio.updateNvdaLiveRegion(briefing);
                }
            }
        });
    }

    // B tuşuyla garajdayken brifing dinleme
    window.addEventListener("keydown", (e) => {
        if (e.key && e.key.toLowerCase() === "b" && !document.getElementById("garage-screen").classList.contains("hidden")) {
            const btn = document.getElementById("btn-read-briefing");
            if (btn) btn.click();
        }
    });

    document.getElementById('btn-garage-back').addEventListener('click', () => {
        audio.playSelect();
        if (typeof SanayiMechanic !== 'undefined') SanayiMechanic.isActive = false;
        UI.switchScreen('route-menu');
    });

    document.getElementById('start-engine-btn').addEventListener('click', () => {
        audio.playSelect();
        Game.beginDriving();
    });

    // 5. Stop Screen Logic
    document.getElementById('btn-front-door').addEventListener('click', (e) => {
        Game.toggleFrontDoor();
    });

    document.getElementById('btn-rear-door').addEventListener('click', (e) => {
        Game.toggleRearDoor();
    });

    const btnAllow = document.getElementById('btn-passenger-allow');
    if (btnAllow) {
        btnAllow.addEventListener('click', () => {
            if (typeof Game !== 'undefined' && typeof Game.resolveInsufficientBalance === 'function') {
                Game.resolveInsufficientBalance(true);
            }
        });
    }

    const btnReject = document.getElementById('btn-passenger-reject');
    if (btnReject) {
        btnReject.addEventListener('click', () => {
            if (typeof Game !== 'undefined' && typeof Game.resolveInsufficientBalance === 'function') {
                Game.resolveInsufficientBalance(false);
            }
        });
    }

    // 6. Results Logic
    document.getElementById('btn-next-mission').addEventListener('click', () => {
        audio.playSelect();
        UI.updatePlayerStats(Game.licenseLevel, Game.completedTasks, Game.playerBudget, Game.getLicenseTitle());
        
        // BUG FIX: activeRouteId yerine sıradaki (completedTasks) taskIndex'e sahip rotayı bul
        let nextRouteId = Object.keys(routesData).find(k => 
            routesData[k].sehir === Game.currentCity && 
            routesData[k].taskIndex === Game.completedTasks
        );
        
        if (nextRouteId) {
            Game.startRoute(nextRouteId);
        } else {
            UI.showToast("Bu şehirdeki görevleri tamamladınız! Haritaya dönülüyor.", "success");
            Game.activeRouteId = null;
            const btnStart = document.getElementById('btn-start-game');
            if (btnStart) btnStart.innerText = "Yeni Bir Oyuna Başla";
            UI.switchScreen('route-menu');
        }
    });

    document.getElementById('btn-finish').addEventListener('click', () => {
        audio.playSelect();
        UI.updatePlayerStats(Game.licenseLevel, Game.completedTasks, Game.playerBudget, Game.getLicenseTitle());
        
        Game.activeRouteId = null;
        const btnStart = document.getElementById('btn-start-game');
        if (btnStart) {
            btnStart.onclick = null;
            btnStart.innerText = "Yeni Bir Oyuna Başla";
        }
        
        if (Game.hasPassedLevel10()) {
            UI.renderCityMap(Game.licenseLevel, Game.unlockedCities);
            UI.switchScreen('base-selection-menu');
        } else {
            UI.switchScreen('title-screen');
        }
    });

    // Draw Highway Canvas background
    const canvas = document.getElementById('highway-bg');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let w = canvas.width = window.innerWidth;
        let h = canvas.height = window.innerHeight;
        
        window.addEventListener('resize', () => {
            w = canvas.width = window.innerWidth;
            h = canvas.height = window.innerHeight;
        });

        let offset = 0;
        function drawBg() {
            ctx.fillStyle = '#08090c';
            ctx.fillRect(0, 0, w, h);
            
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
            ctx.lineWidth = 2;
            
            offset = (offset + 1) % 100;
            
            ctx.beginPath();
            for(let x = 0; x < w; x += 100) {
                ctx.moveTo(x - offset, 0);
                ctx.lineTo(x - offset + h, h);
            }
            for(let y = 0; y < h; y += 100) {
                ctx.moveTo(0, y + offset);
                ctx.lineTo(w, y + offset);
            }
            ctx.stroke();
            requestAnimationFrame(drawBg);
        }
        drawBg();
    }

    // ==========================================================================
    // GLOBAL KEYBOARD EVENT LISTENER (REMOVED FOR ACCESSIBILITY)
    // ==========================================================================
    // Screen readers and standard keyboard users rely on native Tab/Shift+Tab 
    // and virtual cursor arrow keys. Custom KeyboardNav interferes with this.

});

