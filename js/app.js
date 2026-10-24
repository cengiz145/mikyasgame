/* ==========================================================================
   TÜRKİYE TURNESİ - OTOBÜS SİMÜLASYONU BAÅLATICI (APP.JS)
   ========================================================================== */

// 81 İl Karayolları Mesafeleri js/data.js içerisinde tanımlıdır ve window.sehirlerarasiMesafeler üzerinden erişilir.

        if (typeof window !== 'undefined') window.sehirlerarasiMesafeler = sehirlerarasiMesafeler;

document.addEventListener('DOMContentLoaded', () => {
    // === HATA AYIKLAMA (DEBUG) MODU ===
    window.addEventListener('error', (e) => {
        console.error("Global JS Error:", e.message, "at", e.filename, ":", e.lineno);
        if (window.UI && typeof window.UI.showToast === 'function') {
            const errMsg = e.message || "Bilinmeyen Hata";
            const lineInfo = (e.lineno !== undefined && e.lineno !== null) ? ` (Satır: ${e.lineno})` : "";
            window.UI.showToast(`SİSTEM HATASI: ${errMsg}${lineInfo}`, 'danger');
        }
        if (typeof audio !== 'undefined' && typeof audio.speak === 'function') {
            audio.speak(`Kritik sistem hatası: ${e.message}. Lütfen bu hatayı bana bildirin.`);
        }
    });
    
    window.addEventListener('unhandledrejection', (e) => {
        console.warn("Unhandled Promise Rejection:", e.reason);
        let msg = e.reason ? (e.reason.message || String(e.reason)) : "";
        const ignoredPatterns = ['Firebase', 'offline', 'AudioContext', 'user gesture', 'play()', 'abort', 'fetch', 'NetworkError', 'not allowed'];
        const isIgnored = ignoredPatterns.some(p => msg.toLowerCase().includes(p.toLowerCase()));
        if (!isIgnored && msg.length > 0) {
            if (window.UI && typeof window.UI.showToast === 'function') {
                window.UI.showToast(`SİSTEM HATASI (Promise): ${msg}`, 'danger');
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

    // === TÜM VERİLERİ SIFIRLAMA & SEVİYE 1 TEMİZ BAŞLANGIÇ GÜNCELLEMESİ ===
    if (localStorage.getItem('wipe_all_data_20261024_v1') !== 'true') {
        localStorage.setItem('wipe_all_data_20261024_v1', 'true');
        localStorage.setItem('sim_season_fresh_v2', 'true');
        if (typeof Game !== 'undefined' && typeof Game.resetAllGameData === 'function') {
            Game.resetAllGameData(false);
        }
        console.log("Tüm oyun ve şirket verileri sıfırlandı. Temiz kariyer aktif.");
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
                if (typeof UI !== 'undefined' && UI.updateTitleScreenButtons) {
                    UI.updateTitleScreenButtons();
                }
            } else {
                loginScreen.classList.remove('hidden');
                const userInput = document.getElementById('username-input');
                if (userInput) {
                    userInput.value = '';
                    userInput.focus();
                }
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
        { id: "Süleymanpaşa", icon: "🏙️", name: "Süleymanpaşa (Tekirdağ Merkez)", desc: "Eski merkez ilçe Süleymanpaşa adını aldı. Sahil, çarşı ve üniversite hatları (0 km)" },
        { id: "Muratlı", icon: "🚆", name: "Muratlı (Tren Garı & Çarşı)", desc: "Tren istasyonu aksı ve ilçe merkez seferleri (Merkeze 24 km)" },
        { id: "Çorlu", icon: "🏭", name: "Çorlu (Sanayi & Şehir Merkezi)", desc: "Büyük sanayi metropolü ve en kalabalık ilçe (Merkeze 36 km)" },
        { id: "Marmaraereğlisi", icon: "🏖️", name: "Marmaraereğlisi (Sahil & Antik Kent)", desc: "Perinthos antik kenti, Yeniçiftlik, Sultanköy ve Marmara sahil hatları (Merkeze 38 km)" },
        { id: "Ergene", icon: "⚙️", name: "Ergene / Velimeşe (Sanayi & TOKİ)", desc: "Çorlu'ya bağlı beldelerin birleşmesiyle Ergene yeni bir ilçe oldu. OSB ve TOKİ hatları (Merkeze 45 km)" },
        { id: "Hayrabolu", icon: "🌻", name: "Hayrabolu (Trakya Ovası)", desc: "Ayçiçeği tarlaları ve ova çarşı hatları (Merkeze 52 km)" },
        { id: "Malkara", icon: "🌾", name: "Malkara (Merkez & Köy Yolları)", desc: "Geniş ova, tepe mahalleler ve köy yolları (Merkeze 58 km)" },
        { id: "Çerkezköy", icon: "🏭", name: "Çerkezköy (Sanayi & OSB Merkezi)", desc: "Çerkezköy OSB, Tepe, İstasyon ve Veliköy hatları (Merkeze 62 km)" },
        { id: "Kapaklı", icon: "🏢", name: "Kapaklı (Müstakil İlçe & Yıldızkent)", desc: "Çerkezköy'e bağlı bir belde olan Kapaklı müstakil bir ilçeye dönüştürüldü. Yıldızkent ve Pınarça hatları (Merkeze 67 km)" },
        { id: "Saray", icon: "🌳", name: "Saray (İlçe Merkezi & Mahalleleri)", desc: "Kuzey Trakya ormanları ve ilçe hatları (Merkeze 78 km)" },
        { id: "Şarköy", icon: "🍇", name: "Şarköy (Sahil & Bağ Yolları)", desc: "Marmara denizi kıyısı ve bağ hatları (Merkeze 84 km)" }
    ];

    let chosenDistrict = (typeof Game !== 'undefined' && Game.activeDistrict) ? Game.activeDistrict : (localStorage.getItem('activeDistrict') || "Süleymanpaşa");

    const renderLoginDistrictList = () => {
        const listEl = document.getElementById('login-district-list');
        const statusEl = document.getElementById('lbl-current-chosen-district');
        if (!listEl) return;
        listEl.innerHTML = '';
        listEl.setAttribute('role', 'radiogroup');
        listEl.setAttribute('aria-label', 'Başlangıç bölgesi ve ilçe listesi. 11 ilçe mevcuttur.');

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

                const announceText = `${opt.name} başlangıç bölgesi seçildi. Oyuna girmek için Sağ okla veya Tab tuşuyla Oyuna Gir butonuna ilerleyebilirsiniz.`;
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
        
        // Kullanıcı adı boş bırakılırsa oyuncuyu uyar ve kutucuğa odaklan
        if (!username) {
            if (typeof UI !== 'undefined' && UI.showToast) UI.showToast('Lütfen bir kullanıcı adı yazınız!', 'warning');
            if (typeof audio !== 'undefined' && audio.speak) audio.speak('Lütfen bir kullanıcı adı yazınız.');
            if (usernameInput) usernameInput.focus();
            return;
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
        if (typeof Multiplayer !== 'undefined' && Multiplayer.profile) { Multiplayer.profile.name = username; Multiplayer.syncMyState(); }
        
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
    // 3 Kademeli Hiyerarşik Serbest Rota Seçim Durumu (İl ➔ İlçe ➔ Mahalle)
    window.freePickerState = {
        step: 'city', // 'city' | 'district' | 'neighborhood'
        city: 'Tekirdağ',
        district: 'Süleymanpaşa',
        neighborhood: null,
        searchQuery: ''
    };

    const renderFreePickerCurrentStep = (filterQuery = '') => {
        const modal = document.getElementById('district-picker-modal');
        const listEl = document.getElementById('district-picker-list');
        const titleEl = document.getElementById('district-picker-title');
        const descEl = document.getElementById('district-picker-desc');
        const badgeEl = document.getElementById('free-picker-step-badge');
        const backBtn = document.getElementById('btn-free-picker-back');
        const searchInp = document.getElementById('free-picker-search');

        if (!modal || !listEl) return;
        listEl.innerHTML = '';

        const adminData = (typeof window !== 'undefined' && window.TurkeyAdminData) ? window.TurkeyAdminData : null;
        const q = (filterQuery || freePickerState.searchQuery || '').trim().toLowerCase();

        // -------------------------------------------------------------
        // 1. ADIM: İL SEÇİMİ (81 İL)
        // -------------------------------------------------------------
        if (freePickerState.step === 'city') {
            if (badgeEl) badgeEl.innerText = "1. ADIM: İL SEÇİMİ (81 İL)";
            if (backBtn) backBtn.classList.add('hidden');
            if (titleEl) titleEl.innerText = "🗺️ Serbest Rota: 1. Adım - İl (Şehir) Seçimi";
            if (descEl) descEl.innerText = "Türkiye'nin 81 ili listeleniyor. Sağ ve Sol oklarla listede gezinebilir, Tab ile arama kutusuna geçebilirsiniz.";
            if (searchInp) searchInp.placeholder = "🔍 İl ara (örn: İstanbul, Ankara, İzmir, Antalya, Bursa, Tekirdağ)...";

            const allCities = adminData ? Object.keys(adminData) : ((typeof masterCitiesList !== 'undefined') ? masterCitiesList : ["Tekirdağ", "İstanbul", "Ankara", "İzmir", "Bursa"]);
            allCities.sort((a, b) => a.localeCompare(b, 'tr'));

            const filteredCities = allCities.filter(c => {
                if (!q) return true;
                const plate = adminData && adminData[c] ? adminData[c].plate : '';
                return c.toLowerCase().includes(q) || plate.includes(q);
            });

            if (filteredCities.length === 0) {
                listEl.innerHTML = '<li style="color:#94a3b8; text-align:center; padding:20px;">Aramanıza uygun il bulunamadı.</li>';
                return;
            }

            filteredCities.forEach(cityName => {
                const cInfo = adminData && adminData[cityName] ? adminData[cityName] : { plate: "TR", region: "Türkiye", districts: {} };
                const distCount = Object.keys(cInfo.districts || {}).length;
                const isSelected = (cityName === freePickerState.city);

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

                btn.setAttribute('aria-label', `${cInfo.plate} ${cityName} ili, ${cInfo.region} bölgesi, ${distCount} ilçe mevcut. Seçmek için Enter'a basın.`);

                btn.innerHTML = `
                    <span class="btn-text">
                        <strong>🏙️ ${cInfo.plate ? cInfo.plate + ' - ' : ''}${cityName}</strong>
                        <small style="display:block; color:#94a3b8; font-size:0.85rem; margin-top:2px;">${cInfo.region || 'Türkiye'}</small>
                    </span>
                    <span style="color:#38bdf8; font-size:0.9rem; font-weight:bold;">
                        ${distCount > 0 ? distCount + ' İlçe ➔' : 'Seç (Enter)'}
                    </span>
                `;

                btn.onclick = () => {
                    if (typeof audio !== 'undefined' && audio.playSelect) audio.playSelect();
                    freePickerState.city = cityName;
                    freePickerState.step = 'district';
                    freePickerState.searchQuery = '';
                    if (searchInp) searchInp.value = '';

                    const msg = `${cityName} ili seçildi. İlçeleri listeleniyor.`;
                    if (typeof audio !== 'undefined' && audio.speak) audio.speak(msg);
                    if (typeof UI !== 'undefined' && UI.showToast) UI.showToast(`📍 İl: ${cityName}`, 'info');

                    renderFreePickerCurrentStep();
                };

                li.appendChild(btn);
                listEl.appendChild(li);
            });
        }

        // -------------------------------------------------------------
        // 2. ADIM: İLÇE SEÇİMİ (SEÇİLEN İLİN TÜM İLÇELERİ)
        // -------------------------------------------------------------
        else if (freePickerState.step === 'district') {
            const cityName = freePickerState.city || 'Tekirdağ';
            const cInfo = adminData && adminData[cityName] ? adminData[cityName] : null;
            const distMap = cInfo ? cInfo.districts : {};
            const allDistricts = Object.keys(distMap);
            allDistricts.sort((a, b) => a.localeCompare(b, 'tr'));

            if (badgeEl) badgeEl.innerText = "2. ADIM: İLÇE SEÇİMİ";
            if (backBtn) {
                backBtn.classList.remove('hidden');
                backBtn.innerHTML = "⬅️ İllere Geri Dön";
                backBtn.onclick = () => {
                    freePickerState.step = 'city';
                    freePickerState.searchQuery = '';
                    if (searchInp) searchInp.value = '';
                    if (typeof audio !== 'undefined' && audio.playSelect) audio.playSelect();
                    renderFreePickerCurrentStep();
                };
            }
            if (titleEl) titleEl.innerText = `📍 ${cityName} İli: 2. Adım - İlçe Seçimi`;
            if (descEl) descEl.innerText = `${cityName} iline ait ${allDistricts.length} ilçe listeleniyor. Sürüş yapmak istediğiniz ilçeyi seçin.`;
            if (searchInp) searchInp.placeholder = `🔍 ${cityName} ilçelerinde ara...`;

            const filteredDistricts = allDistricts.filter(d => !q || d.toLowerCase().includes(q));

            if (filteredDistricts.length === 0) {
                listEl.innerHTML = '<li style="color:#94a3b8; text-align:center; padding:20px;">Aramanıza uygun ilçe bulunamadı.</li>';
                return;
            }

            filteredDistricts.forEach(distName => {
                const nList = distMap[distName] || [];
                const isSelected = (distName === freePickerState.district);

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

                btn.setAttribute('aria-label', `${distName} ilçesi, ${nList.length} mahalle mevcut. Seçmek için Enter'a basın.`);

                btn.innerHTML = `
                    <span class="btn-text">
                        <strong>📍 ${distName} İlçesi</strong>
                        <small style="display:block; color:#94a3b8; font-size:0.85rem; margin-top:2px;">${nList.length} Mahalle & Hat Mevcut</small>
                    </span>
                    <span style="color:#22c55e; font-size:0.9rem; font-weight:bold;">
                        Mahalleleri Gör ➔
                    </span>
                `;

                btn.onclick = () => {
                    if (typeof audio !== 'undefined' && audio.playSelect) audio.playSelect();
                    freePickerState.district = distName;
                    freePickerState.step = 'neighborhood';
                    freePickerState.searchQuery = '';
                    if (searchInp) searchInp.value = '';

                    const msg = `${distName} ilçesi seçildi. Mahalleler listeleniyor.`;
                    if (typeof audio !== 'undefined' && audio.speak) audio.speak(msg);
                    if (typeof UI !== 'undefined' && UI.showToast) UI.showToast(`📍 İlçe: ${distName}`, 'info');

                    renderFreePickerCurrentStep();
                };

                li.appendChild(btn);
                listEl.appendChild(li);
            });
        }

        // -------------------------------------------------------------
        // 3. ADIM: MAHALLE & HAT SEÇİMİ (SEÇİLEN İLÇENİN TÜM MAHALLELERİ)
        // -------------------------------------------------------------
        else if (freePickerState.step === 'neighborhood') {
            const cityName = freePickerState.city || 'Tekirdağ';
            const distName = freePickerState.district || 'Süleymanpaşa';
            const cInfo = adminData && adminData[cityName] ? adminData[cityName] : null;
            const distMap = cInfo ? cInfo.districts : {};
            const rawNeighborhoods = distMap[distName] || [
                `${distName} Merkez & Hükümet Konağı`,
                "Cumhuriyet Mahallesi",
                "Atatürk Bulvarı & Çarşı",
                "İstiklal Caddesi",
                "Yeni Mahalle & Konutlar",
                `${distName} Otogar & Sanayi`
            ];

            if (badgeEl) badgeEl.innerText = "3. ADIM: MAHALLE & HAT SEÇİMİ";
            if (backBtn) {
                backBtn.classList.remove('hidden');
                backBtn.innerHTML = "⬅️ İlçelere Geri Dön";
                backBtn.onclick = () => {
                    freePickerState.step = 'district';
                    freePickerState.searchQuery = '';
                    if (searchInp) searchInp.value = '';
                    if (typeof audio !== 'undefined' && audio.playSelect) audio.playSelect();
                    renderFreePickerCurrentStep();
                };
            }
            if (titleEl) titleEl.innerText = `🏘️ ${distName || 'Merkez'} (${cityName || 'Tekirdağ'}): 3. Adım - Mahalle & Hat`;
            if (descEl) descEl.innerText = `${distName} ilçesine ait mahalleler listeleniyor. Serbest seferinizi başlatmak istediğiniz mahalleyi seçin.`;
            if (searchInp) searchInp.placeholder = `🔍 Mahalle ara (örn: Merkez, Cumhuriyet, Atatürk)... `;

            // Genel Tur seçeneği
            const fullTourTitle = `🌟 ${distName} Genel İlçe Turu (Tüm Mahalleler Arası Kesintisiz Hat)`;
            let itemsToRender = [fullTourTitle, ...rawNeighborhoods];

            if (q) {
                itemsToRender = itemsToRender.filter(m => m.toLowerCase().includes(q));
            }

            if (itemsToRender.length === 0) {
                listEl.innerHTML = '<li style="color:#94a3b8; text-align:center; padding:20px;">Aramanıza uygun mahalle bulunamadı.</li>';
                return;
            }

            itemsToRender.forEach((mName, idx) => {
                const isFullTour = (idx === 0 && mName === fullTourTitle);
                const li = document.createElement('li');
                li.style.marginBottom = '8px';

                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = `menu-btn nav-item ${isFullTour ? 'primary-btn pulse-anim' : ''}`;
                btn.style.width = '100%';
                btn.style.textAlign = 'left';
                btn.style.padding = '14px 16px';
                btn.style.fontSize = '1.02rem';
                btn.style.display = 'flex';
                btn.style.alignItems = 'center';
                btn.style.justifyContent = 'space-between';
                btn.style.border = isFullTour ? '2px solid #f59e0b' : '1.5px solid rgba(56,189,248,0.3)';
                btn.style.background = isFullTour ? 'rgba(245, 158, 11, 0.2)' : 'rgba(15,23,42,0.85)';
                btn.style.cursor = 'pointer';

                btn.setAttribute('aria-label', `${mName}. Serbest seferi başlatmak için Enter'a basın.`);

                btn.innerHTML = `
                    <span class="btn-text">
                        <strong>${isFullTour ? '🌟' : '🏘️'} ${mName}</strong>
                        <small style="display:block; color:#94a3b8; font-size:0.85rem; margin-top:2px;">
                            ${isFullTour ? 'Tüm mahalle duraklarını kapsayan ekspres hat' : cityName + ' - ' + distName + ' Yerel Seferi'}
                        </small>
                    </span>
                    <span style="color:${isFullTour ? '#f59e0b' : '#38bdf8'}; font-size:0.95rem; font-weight:bold;">
                        Seferi Başlat ➔
                    </span>
                `;

                btn.onclick = () => {
                    if (typeof audio !== 'undefined' && audio.playSelect) audio.playSelect();
                    freePickerState.neighborhood = mName;

                    // Game ve localStorage güncelle
                    if (typeof Game !== 'undefined') {
                        Game.currentCity = freePickerState.city;
                        Game.activeDistrict = freePickerState.district;
                        Game.activeNeighborhood = mName;
                        if (typeof Game.setPlayMode === 'function') Game.setPlayMode('free_drive');
                    }
                    localStorage.setItem('currentCity', freePickerState.city);
                    localStorage.setItem('activeDistrict', freePickerState.district);
                    localStorage.setItem('activeNeighborhood', mName);

                    const lblActive = document.getElementById('lbl-active-district');
                    if (lblActive) lblActive.textContent = freePickerState.city + " / " + freePickerState.district;
                    const lblRouteActive = document.getElementById('lbl-route-active-district');
                    if (lblRouteActive) lblRouteActive.textContent = (freePickerState.district || 'Merkez') + (mName ? " (" + mName + ")" : "");

                    const announceMsg = `${freePickerState.city || 'Tekirdağ'}, ${freePickerState.district || 'Merkez'}, ${mName || 'Şehir İçi'} serbest seferiniz hazırlandı. İyi yolculuklar kaptan.`;
                    if (typeof audio !== 'undefined' && audio.speak) audio.speak(announceMsg);
                    if (typeof audio !== 'undefined' && audio.updateNvdaLiveRegion) audio.updateNvdaLiveRegion(announceMsg);
                    if (typeof UI !== 'undefined' && UI.showToast) UI.showToast(`🛣️ ${freePickerState.city || 'Tekirdağ'} - ${freePickerState.district || 'Merkez'}${mName ? ' (' + mName + ')' : ''}`, 'success');

                    // Serbest rotayı oluştur
                    if (typeof createOrGetFreeRoamRoute === 'function') {
                        createOrGetFreeRoamRoute(freePickerState.city, freePickerState.district, mName);
                    }

                    closeDistrictPickerModal();

                    // Rota Ekranına veya Sefer Ekranına yönlendir
                    document.dispatchEvent(new CustomEvent('go-to-route-screen', { 
                        detail: { 
                            city: freePickerState.city, 
                            district: freePickerState.district,
                            mahalle: mName
                        } 
                    }));
                };

                li.appendChild(btn);
                listEl.appendChild(li);
            });
        }

        if (typeof KeyboardNav !== 'undefined' && KeyboardNav.initForScreen) {
            KeyboardNav.initForScreen();
        }
    };

    const openDistrictPickerModal = () => {
        const modal = document.getElementById('district-picker-modal');
        if (!modal) return;

        // İlçe seçimini 1. Adım (İl Seçimi) ile başlat
        freePickerState.step = 'city';
        freePickerState.city = (typeof Game !== 'undefined' && Game.currentCity) || localStorage.getItem('currentCity') || 'Tekirdağ';
        freePickerState.district = (typeof Game !== 'undefined' && Game.activeDistrict) || localStorage.getItem('activeDistrict') || 'Süleymanpaşa';
        freePickerState.neighborhood = null;
        freePickerState.searchQuery = '';

        const searchInp = document.getElementById('free-picker-search');
        if (searchInp) {
            searchInp.value = '';
            searchInp.oninput = (e) => {
                freePickerState.searchQuery = e.target.value.trim();
                renderFreePickerCurrentStep(freePickerState.searchQuery);
            };
        }

        modal.classList.remove('hidden');
        renderFreePickerCurrentStep();

        const welcomeVoice = "Serbest Sefer Seçim Penceresi açıldı. 1. Adım: İl Seçimi. 81 il arasında Sağ ve Sol oklarla gezinebilir, aramak için Tab ile arama kutusuna geçebilirsiniz.";
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
                { id: "Süleymanpaşa", icon: "🏙️", title: "Süleymanpaşa Hatları (Merkez)", filter: r => r.district === 'Süleymanpaşa' || r.originDistrict === 'Süleymanpaşa' || r.destDistrict === 'Süleymanpaşa' },
                { id: "Muratlı", icon: "🚆", title: "Muratlı Hatları (24 km)", filter: r => r.district === 'Muratlı' || r.originDistrict === 'Muratlı' || r.destDistrict === 'Muratlı' },
                { id: "Çorlu", icon: "🏭", title: "Çorlu Hatları (36 km)", filter: r => r.district === 'Çorlu' || r.originDistrict === 'Çorlu' || r.destDistrict === 'Çorlu' },
                { id: "Marmaraereğlisi", icon: "🏖️", title: "Marmaraereğlisi Sahil Hatları (38 km)", filter: r => r.district === 'Marmaraereğlisi' || r.originDistrict === 'Marmaraereğlisi' || r.destDistrict === 'Marmaraereğlisi' || (r.name && r.name.toLowerCase().includes('ereğli')) },
                { id: "Ergene", icon: "⚙️", title: "Ergene & Velimeşe Hatları (45 km)", filter: r => r.district === 'Ergene' || r.district === 'Velimeşe' || r.originDistrict === 'Ergene' || r.destDistrict === 'Ergene' || (r.name && (r.name.toLowerCase().includes('ergene') || r.name.toLowerCase().includes('marmaracık') || r.name.toLowerCase().includes('velimeşe'))) },
                { id: "Hayrabolu", icon: "🌻", title: "Hayrabolu Hatları (52 km)", filter: r => r.district === 'Hayrabolu' || r.originDistrict === 'Hayrabolu' || r.destDistrict === 'Hayrabolu' },
                { id: "Malkara", icon: "🌾", title: "Malkara Hatları (58 km)", filter: r => r.district === 'Malkara' || r.originDistrict === 'Malkara' || r.destDistrict === 'Malkara' },
                { id: "Çerkezköy", icon: "🏭", title: "Çerkezköy Hatları (62 km)", filter: r => r.district === 'Çerkezköy' || r.originDistrict === 'Çerkezköy' || r.destDistrict === 'Çerkezköy' },
                { id: "Kapaklı", icon: "🏢", title: "Kapaklı Hatları (67 km)", filter: r => r.district === 'Kapaklı' || r.originDistrict === 'Kapaklı' || r.destDistrict === 'Kapaklı' },
                { id: "Saray", icon: "🌳", title: "Saray Hatları (78 km)", filter: r => r.district === 'Saray' || r.originDistrict === 'Saray' || r.destDistrict === 'Saray' },
                { id: "Şarköy", icon: "🍇", title: "Şarköy Sahil Hatları (84 km)", filter: r => r.district === 'Şarköy' || r.originDistrict === 'Şarköy' || r.destDistrict === 'Şarköy' },
                { id: "İlçeler Arası", icon: "🚌", title: "İlçeler Arası Ekspres Hatlar (11 İlçe Ağı)", filter: r => r.isDistrict || r.district === 'İlçeler Arası' || (r.originDistrict && r.destDistrict && r.originDistrict !== r.destDistrict) },
                { id: "TÜMÜ", icon: "📋", title: "Tüm TEKULAŞ Hatları (11 İlçe Ağı)", filter: () => true }
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

                let badgeSpan = '';
                if (route.isBorderRoute) {
                    badgeSpan = ' <span style="background: rgba(239, 68, 68, 0.25); color: #f87171; border: 1px solid #ef4444; padding: 2px 7px; border-radius: 4px; font-size: 0.78rem; margin-left: 6px; font-weight: bold;">[Komşu İl Sınırı]</span>';
                } else if (route.isKomsuRoute || (route.originDistrict && route.destDistrict && route.originDistrict !== route.destDistrict)) {
                    badgeSpan = ' <span style="background: rgba(56, 189, 248, 0.2); color: #38bdf8; border: 1px solid #0284c7; padding: 2px 7px; border-radius: 4px; font-size: 0.78rem; margin-left: 6px; font-weight: bold;">[Komşu İlçe]</span>';
                } else {
                    badgeSpan = ' <span style="background: rgba(34, 197, 94, 0.2); color: #4ade80; border: 1px solid #22c55e; padding: 2px 7px; border-radius: 4px; font-size: 0.78rem; margin-left: 6px; font-weight: bold;">[İlçe İçi]</span>';
                }

                btn.innerHTML = [
                    '<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">',
                    '   <span style="font-weight: bold; color: ' + (route.color || '#38bdf8') + '; font-size: 1.05rem;">[Hat ' + route.hatNo + '] ' + route.name + badgeSpan + '</span>',
                    '   <span style="color: var(--secondary); font-size: 0.85rem; font-weight: bold;">' + stopCount + ' Durak | ' + totalKm.toFixed(1) + ' KM</span>',
                    '</div>',
                    '<div style="font-size: 0.85rem; color: #94a3b8;">',
                    '   📍 ' + sName + ' ➔ 🏁 ' + eName + (route.karayolu ? ' | <span style="color:#f59e0b; font-weight:bold;">🛣️ ' + route.karayolu + '</span>' : ''),
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
                    const safeKm = (typeof totalKm === 'number' && !isNaN(totalKm)) ? totalKm.toFixed(1) : '0';
                    UI.showToast(route.name + " Devreye Alındı (" + safeKm + " KM)", "success");
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

    const btnOpenComp = document.getElementById('btn-open-company');
    if (btnOpenComp) {
        btnOpenComp.addEventListener('click', () => {
            if (typeof CompanySystem !== 'undefined' && CompanySystem.openCompanyModal) {
                CompanySystem.openCompanyModal();
            }
        });
    }

    const btnOpenMp = document.getElementById('btn-open-multiplayer');
    if (btnOpenMp) {
        btnOpenMp.addEventListener('click', () => {
            if (typeof Multiplayer !== 'undefined' && Multiplayer.openRadarModal) {
                Multiplayer.openRadarModal();
            }
        });
    }

    const btnOpenLeaderboard = document.getElementById('btn-open-leaderboard');
    if (btnOpenLeaderboard) {
        btnOpenLeaderboard.addEventListener('click', () => {
            if (typeof LeaderboardSystem !== 'undefined' && LeaderboardSystem.open) {
                LeaderboardSystem.open();
            }
        });
    }
    const hudFuelPanel = document.getElementById('hud-fuel-panel');
    if (hudFuelPanel) {
        hudFuelPanel.addEventListener('click', () => {
            if (typeof Game !== 'undefined' && Game.handleKeyDown) {
                Game.handleKeyDown({ key: 'h', preventDefault: () => {} });
            }
        });
    }

    const hudMpPanel = document.getElementById('hud-multiplayer-panel');
    if (hudMpPanel) {
        hudMpPanel.addEventListener('click', () => {
            if (typeof Multiplayer !== 'undefined' && Multiplayer.openRadarModal) {
                Multiplayer.openRadarModal();
            }
        });
    }

    const btnOpenGarageFleet = document.getElementById('btn-open-garage-fleet');
    if (btnOpenGarageFleet) {
        btnOpenGarageFleet.addEventListener('click', () => {
            if (typeof BusFleet !== 'undefined' && BusFleet.openGarageModal) {
                BusFleet.openGarageModal();
            }
        });
    }

    const btnOpenDealer = document.getElementById('btn-open-dealership');
    if (btnOpenDealer) {
        btnOpenDealer.addEventListener('click', () => {
            if (typeof BusFleet !== 'undefined' && BusFleet.openDealershipModal) {
                BusFleet.openDealershipModal();
            }
        });
    }

    const btnCareer = document.getElementById('btn-mode-career');
    if (btnCareer) {
        btnCareer.addEventListener('click', () => {
            audio.playSelect();
            if (typeof Game !== 'undefined' && typeof Game.launchCareerDirectToGarage === 'function') {
                Game.launchCareerDirectToGarage();
            } else {
                if (typeof Game !== 'undefined') Game.setPlayMode('career');
                openCitySelection();
            }
        });
    }

    const btnFreeDrive = document.getElementById('btn-mode-freedrive');
    if (btnFreeDrive) {
        btnFreeDrive.addEventListener('click', () => {
            if (typeof Game !== 'undefined') Game.setPlayMode('free_drive');
            audio.playSelect();
            const msg = "Serbest Sürüş Modu açıldı.";
            audio.speak(msg);
            UI.showToast("🛣️ Serbest Sürüş Modu", "info");
            openDistrictPickerModal();
        });
    }

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
            document.dispatchEvent(new CustomEvent('go-to-route-screen', { detail: { city: "Tekirdağ", district: Game.activeDistrict } }));
        } else if (Game.unlockedCities.length > 0 && Game.currentCity) {
            document.dispatchEvent(new CustomEvent('go-to-route-screen', { detail: { city: Game.currentCity || "Tekirdağ", district: Game.activeDistrict } }));
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
        const safeKeys = [
            'otobusUsername',
            'licenseLevel',
            'completedTasks',
            'para',
            'playerXP',
            'clockMinutes',
            'unlockedCities',
            'merkezUs',
            'activeDistrict',
            'selectedBusId',
            'tekulas_owned_buses_v1',
            'driver_lifetime_stats_v1',
            'driver_badges_v1',
            'tekulas_discovered_stops_v1',
            'copilot_enabled'
        ];
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
        // Mikyas Kaptanlık Akademisi: Stajyer ve acemi şoförler uzun yol şehirlerarası sefere çıkamaz!
        if (typeof Game !== 'undefined' && typeof Game.hasPassedLevel10 === 'function' && !Game.hasPassedLevel10()) {
            if (typeof audio !== 'undefined' && audio.playWarning) {
                try { audio.playWarning(); } catch(e) {}
            } else if (typeof audio !== 'undefined' && audio.playSelect) {
                audio.playSelect();
            }
            const completed = (typeof Game.completedTasks === 'number') ? Game.completedTasks : 0;
            const academyMsg = `Mikyas Kaptanlık Akademisi Kuralı: Şehirlerarası uzun yol seferlerine çıkabilmek için önce şehir içi 10 görevi tamamlayıp Usta Kaptan ehliyetini almalısınız! Stajyer ve acemi şoförler uzun yola çıkamaz. Mevcut tamamlanan görev: ${completed} / 10.`;
            if (typeof audio !== 'undefined' && audio.speak) audio.speak(academyMsg);
            if (typeof UI !== 'undefined' && UI.showToast) UI.showToast("Şehirlerarası Seferler İçin En Az 10 Görev Gerekir!", "warning");
            return;
        }

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
        if (data) {
            if (data.komsular) {
                Object.values(data.komsular).forEach(n => {
                    if (typeof n === 'string') {
                        n.split(/[\/,]+/).map(s => s.trim()).forEach(sub => {
                            if (sub && (typeof sehirRotalari !== 'undefined' && sehirRotalari[sub])) possibleDests.add(sub);
                        });
                    }
                });
            }
            if (Array.isArray(data.komsuIller)) {
                data.komsuIller.forEach(sub => {
                    if (sub && (typeof sehirRotalari !== 'undefined' && sehirRotalari[sub])) possibleDests.add(sub);
                });
            }
            // Bütün illeri bütün illere komşu ve şehirlerarası sefer ağı olarak bağla:
            if (typeof masterCitiesList !== 'undefined' && Array.isArray(masterCitiesList)) {
                masterCitiesList.forEach(sub => {
                    if (sub && (typeof sehirRotalari !== 'undefined' && sehirRotalari[sub])) possibleDests.add(sub);
                });
            }
        }
        
        possibleDests.delete(Game.currentCity); // Can't go to self
        
        // Akıllı Sıralama: 1. Doğrudan Komşu İller, 2. Açılmış Şehirler, 3. Diğer İller (Alfabetik)
        const sortedDests = Array.from(possibleDests).sort((a, b) => {
            const isKomsuA = data && Array.isArray(data.komsuIller) && data.komsuIller.includes(a);
            const isKomsuB = data && Array.isArray(data.komsuIller) && data.komsuIller.includes(b);
            if (isKomsuA && !isKomsuB) return -1;
            if (!isKomsuA && isKomsuB) return 1;

            const isUnlA = unlockedCitiesArr.includes(a);
            const isUnlB = unlockedCitiesArr.includes(b);
            if (isUnlA && !isUnlB) return -1;
            if (!isUnlA && isUnlB) return 1;

            return a.localeCompare(b, 'tr');
        });

        sortedDests.forEach(destCity => {
            hasDestinations = true;
            const isUnlocked = unlockedCitiesArr.includes(destCity);
            const isKomsu = (data && Array.isArray(data.komsuIller) && data.komsuIller.includes(destCity));
            const li = document.createElement('li');
            li.style.marginBottom = "10px";
            
            const btn = document.createElement('button');
            btn.className = 'menu-btn nav-item';
            btn.style.width = '100%';
            btn.style.justifyContent = 'space-between';
            btn.style.padding = '15px';
            
            let previewDistKm = 0;
            const pairKey1 = Game.currentCity + "-" + destCity;
            const pairKey2 = destCity + "-" + Game.currentCity;
            if (typeof sehirlerarasiMesafeler !== 'undefined') {
                if (sehirlerarasiMesafeler[pairKey1]) previewDistKm = sehirlerarasiMesafeler[pairKey1];
                else if (sehirlerarasiMesafeler[pairKey2]) previewDistKm = sehirlerarasiMesafeler[pairKey2];
            }

            const cFromPrev = typeof sehirRotalari !== 'undefined' ? sehirRotalari[Game.currentCity] : null;
            const cToPrev = typeof sehirRotalari !== 'undefined' ? sehirRotalari[destCity] : null;
            if (!previewDistKm) {
                if (Game.currentCity === "Tekirdağ" && cToPrev && cToPrev.merkezeMesafeKm) previewDistKm = cToPrev.merkezeMesafeKm;
                else if (destCity === "Tekirdağ" && cFromPrev && cFromPrev.merkezeMesafeKm) previewDistKm = cFromPrev.merkezeMesafeKm;
                else if (cFromPrev && cFromPrev.tekirdagMesafeKm && cFromPrev.tekirdagMesafeKm[destCity]) previewDistKm = cFromPrev.tekirdagMesafeKm[destCity];
                else if (cToPrev && cToPrev.tekirdagMesafeKm && cToPrev.tekirdagMesafeKm[Game.currentCity]) previewDistKm = cToPrev.tekirdagMesafeKm[Game.currentCity];
                else if (cFromPrev && cFromPrev.coordinates && cToPrev && cToPrev.coordinates) {
                    const lat1 = cFromPrev.coordinates.lat, lon1 = cFromPrev.coordinates.lon;
                    const lat2 = cToPrev.coordinates.lat, lon2 = cToPrev.coordinates.lon;
                    if (lat1 && lon1 && lat2 && lon2) {
                        const R = 6371;
                        const dLat = (lat2 - lat1) * Math.PI / 180;
                        const dLon = (lon2 - lon1) * Math.PI / 180;
                        const a = Math.sin(dLat/2)*Math.sin(dLat/2) + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)*Math.sin(dLon/2);
                        previewDistKm = Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)) * 1.28);
                    }
                }
            }
            if (!previewDistKm) previewDistKm = 150;

            const badgeHtml = isKomsu
                ? '<span style="background: rgba(56, 189, 248, 0.2); color: #38bdf8; padding: 2px 8px; border-radius: 4px; font-size: 0.8em; margin-left: 6px;">[Komşu İl]</span>'
                : (isUnlocked ? '<span style="color: #4ade80; font-size: 0.8em; margin-left: 6px;">(Açık Şehir)</span>' : '<span style="color: #94a3b8; font-size: 0.8em; margin-left: 6px;">(Keşfedilecek)</span>');

            btn.innerHTML = `
                <span><strong>${destCity}</strong> ${badgeHtml}</span>
                <span style="color: var(--secondary); font-weight: bold;">${previewDistKm} KM Sefer</span>
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
                const intercityKey = Game.currentCity + "-" + destCity;
                let realDistKm = sehirlerarasiMesafeler[intercityKey];
                if (!realDistKm) {
                    const cFrom = typeof sehirRotalari !== 'undefined' ? sehirRotalari[Game.currentCity] : null;
                    const cTo = typeof sehirRotalari !== 'undefined' ? sehirRotalari[destCity] : null;
                    if (Game.currentCity === "Tekirdağ" && cTo && cTo.merkezeMesafeKm) realDistKm = cTo.merkezeMesafeKm;
                    else if (destCity === "Tekirdağ" && cFrom && cFrom.merkezeMesafeKm) realDistKm = cFrom.merkezeMesafeKm;
                    else if (cFrom && cFrom.tekirdagMesafeKm && cFrom.tekirdagMesafeKm[destCity]) realDistKm = cFrom.tekirdagMesafeKm[destCity];
                    else if (cTo && cTo.tekirdagMesafeKm && cTo.tekirdagMesafeKm[Game.currentCity]) realDistKm = cTo.tekirdagMesafeKm[Game.currentCity];
                    else if (cFrom && cFrom.coordinates && cTo && cTo.coordinates) {
                        const lat1 = cFrom.coordinates.lat, lon1 = cFrom.coordinates.lon;
                        const lat2 = cTo.coordinates.lat, lon2 = cTo.coordinates.lon;
                        if (lat1 && lon1 && lat2 && lon2) {
                            const R = 6371;
                            const dLat = (lat2 - lat1) * Math.PI / 180;
                            const dLon = (lon2 - lon1) * Math.PI / 180;
                            const a = Math.sin(dLat/2)*Math.sin(dLat/2) + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)*Math.sin(dLon/2);
                            realDistKm = Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)) * 1.28);
                        }
                    }
                }
                if (!realDistKm) realDistKm = 150;
                
                const cFromData = (typeof sehirRotalari !== 'undefined') ? sehirRotalari[Game.currentCity] : null;
                const cToData = (typeof sehirRotalari !== 'undefined') ? sehirRotalari[destCity] : null;
                const lat1 = (cFromData && cFromData.coordinates) ? cFromData.coordinates.lat : 40.9833;
                const lon1 = (cFromData && cFromData.coordinates) ? cFromData.coordinates.lon : 27.5167;
                const lat2 = (cToData && cToData.coordinates) ? cToData.coordinates.lat : 41.0082;
                const lon2 = (cToData && cToData.coordinates) ? cToData.coordinates.lon : 28.9784;

                const midArr = (typeof window !== 'undefined' && window.midPoints && window.midPoints[destCity])
                    ? window.midPoints[destCity]
                    : ((typeof midPoints !== 'undefined' && midPoints[destCity]) ? midPoints[destCity] : null);

                if (realDistKm >= 200 && midArr && midArr.length > 0) {
                    const passName = midArr[0];
                    const midLat = Number((lat1 + (lat2 - lat1) * 0.50).toFixed(4));
                    const midLon = Number((lon1 + (lon2 - lon1) * 0.50).toFixed(4));
                    const dist1 = Math.round(realDistKm * 0.55);
                    const dist2 = realDistKm - dist1;

                    routesData[intercityRouteId].intermediateStops = [passName];
                    routesData[intercityRouteId].stops = [
                        { name: startStop, lat: lat1, lon: lon1, anons: `${startStop} kalkış peronundayız. ${destCity} seferi başlıyor.`, bekleyenYolcu: 28, inenYolcu: 0, gercekMesafeSonraki: dist1 },
                        { name: passName, lat: midLat, lon: midLon, anons: `Önemli geçiş noktası: ${passName}. Yolcularımızın emniyet kemerlerini takmaları rica olunur.`, bekleyenYolcu: 0, inenYolcu: 0, gercekMesafeSonraki: dist2 },
                        { name: endStop, lat: lat2, lon: lon2, anons: `Son durak: ${endStop}. Şehirlerarası seferimiz sona ermiştir.`, bekleyenYolcu: 0, inenYolcu: 28, gercekMesafeSonraki: 0 }
                    ];
                } else {
                    routesData[intercityRouteId].stops = [
                        { name: startStop, lat: lat1, lon: lon1, anons: startStop + " kalkış peronundayız. " + destCity + " seferi başlıyor.", bekleyenYolcu: 28, inenYolcu: 0, gercekMesafeSonraki: realDistKm },
                        { name: endStop, lat: lat2, lon: lon2, anons: "Son durak: " + endStop + ". Şehirlerarası seferimiz sona ermiştir.", bekleyenYolcu: 0, inenYolcu: 28, gercekMesafeSonraki: 0 }
                    ];
                }
                
                // Add to sehirRotalari temporarily so startRoute works
                if (!sehirRotalari[Game.currentCity].routes) sehirRotalari[Game.currentCity].routes = [];
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

        const curDist = (typeof Game !== 'undefined' && Game.activeDistrict) ? Game.activeDistrict : (localStorage.getItem('activeDistrict') || "Süleymanpaşa");
        const tkData = (typeof sehirRotalari !== 'undefined' && sehirRotalari["Tekirdağ"] && sehirRotalari["Tekirdağ"].ilcelerBilgisi) ? sehirRotalari["Tekirdağ"].ilcelerBilgisi : null;
        const komsuList = (tkData && tkData.komsuIlceler && tkData.komsuIlceler[curDist]) ? tkData.komsuIlceler[curDist] : [];

        const descEl = document.getElementById('district-modal-desc');
        if (descEl) {
            descEl.innerHTML = `📍 <strong>Aktif Bölgeniz:</strong> <span style="color:#38bdf8;">${curDist}</span> | İllerdeki komşuluk ilişkilerine göre hatlar:`;
        }
        
        if (!districtList || districtList.length === 0) {
            UI.showToast("Bu şehir için tanımlı ilçe hattı bulunamadı.", "error");
            if (modeModal) modeModal.classList.remove('hidden');
            KeyboardNav.initForScreen();
            return;
        }

        // Akıllı Sıralama: Aktif ilçenin Doğrudan Komşuları -> Komşu İl Sınır Kapıları -> İlçe İçi -> Diğerleri
        const sortedDistrictList = [...districtList].sort((a, b) => {
            const getPriority = (r) => {
                const isBorderThis = r.isBorderRoute && r.originDistrict === curDist;
                const isKomsuThis = (r.originDistrict === curDist && komsuList.includes(r.destDistrict)) || (r.destDistrict === curDist && komsuList.includes(r.originDistrict));
                const isLocalThis = (r.originDistrict === curDist && r.destDistrict === curDist) || r.district === curDist;
                const isRelThis = r.originDistrict === curDist || r.destDistrict === curDist;

                if (isKomsuThis) return 1;
                if (isBorderThis) return 2;
                if (isLocalThis) return 3;
                if (isRelThis) return 4;
                if (r.isBorderRoute) return 5;
                if (r.isKomsuRoute) return 6;
                return 7;
            };
            return getPriority(a) - getPriority(b);
        });

        sortedDistrictList.forEach(distRoute => {
            const li = document.createElement('li');
            li.style.marginBottom = "10px";
            
            const btn = document.createElement('button');
            btn.className = 'menu-btn nav-item';
            btn.style.width = '100%';
            btn.style.justifyContent = 'space-between';
            btn.style.padding = '15px';
            
            const totalKm = distRoute.totalKm || (distRoute.stops ? distRoute.stops.reduce((sum, s) => sum + (s.gercekMesafeSonraki || 0), 0) : 20);
            
            let badgeHtml = '';
            if (distRoute.isBorderRoute) {
                badgeHtml = '<span style="background: rgba(239,68,68,0.25); color: #f87171; border: 1px solid #ef4444; padding: 2px 7px; border-radius: 4px; font-size: 0.75rem; margin-left: 6px;">[Komşu İl Sınırı]</span>';
            } else if ((distRoute.originDistrict === curDist && komsuList.includes(distRoute.destDistrict)) || (distRoute.destDistrict === curDist && komsuList.includes(distRoute.originDistrict)) || distRoute.isKomsuRoute) {
                badgeHtml = '<span style="background: rgba(56,189,248,0.2); color: #38bdf8; border: 1px solid #0284c7; padding: 2px 7px; border-radius: 4px; font-size: 0.75rem; margin-left: 6px;">[Komşu İlçe]</span>';
            } else if (distRoute.originDistrict === distRoute.destDistrict) {
                badgeHtml = '<span style="background: rgba(34,197,94,0.2); color: #4ade80; border: 1px solid #22c55e; padding: 2px 7px; border-radius: 4px; font-size: 0.75rem; margin-left: 6px;">[İlçe İçi]</span>';
            }

            const roadBadge = distRoute.karayolu ? `<div style="font-size: 0.82rem; color: #fbbf24; margin-top: 3px; font-weight: bold;">🛣️ Güzergâh: ${distRoute.karayolu}</div>` : '';
            btn.innerHTML = `
                <div style="text-align: left;">
                    <div><strong style="color: ${distRoute.color || '#38bdf8'};">[Hat ${distRoute.hatNo}] ${distRoute.name}</strong> ${badgeHtml}</div>
                    ${roadBadge}
                </div>
                <span style="color: var(--secondary); font-weight: bold;">${Math.round(totalKm)} KM</span>
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
        const cityName = (e.detail && e.detail.city) || (typeof Game !== 'undefined' && Game.currentCity) || "Tekirdağ";
        const districtName = (e.detail && e.detail.district) || (typeof Game !== 'undefined' && Game.activeDistrict) || localStorage.getItem('activeDistrict') || "Süleymanpaşa";
        
        // Tekirdağ için aktif ilçe rotaları kontrol et
        const task0 = (typeof routesData !== 'undefined') ? routesData["tekirdag_task_0"] : null;
        const needsRegen = (cityName === "Tekirdağ")
            ? (!task0 || task0.district !== districtName)
            : (!routesData || !routesData[`${cityName.toLowerCase()}_task_0`]);
            
        if (needsRegen) {
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
        if (typeof Game !== 'undefined' && Game.playMode === 'career') {
            UI.switchScreen('main-menu');
        } else {
            UI.switchScreen('route-menu');
        }
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
        
        let nextRouteId = null;
        if (Game.currentCity === "Tekirdağ") {
            const candidateKey = "tekirdag_task_" + Game.completedTasks;
            if (typeof routesData !== 'undefined' && routesData[candidateKey]) {
                nextRouteId = candidateKey;
            }
        }
        if (!nextRouteId && typeof routesData !== 'undefined') {
            nextRouteId = Object.keys(routesData).find(k => 
                routesData[k] &&
                routesData[k].sehir === Game.currentCity && 
                routesData[k].taskIndex === Game.completedTasks
            );
        }
        
        if (nextRouteId) {
            Game.startRoute(nextRouteId);
        } else {
            UI.showToast("Bu seviyedeki görevleri tamamladınız! Görev listesine dönülüyor.", "success");
            Game.activeRouteId = null;
            const btnStart = document.getElementById('btn-start-game');
            if (btnStart) btnStart.innerText = "Yeni Bir Oyuna Başla";
            UI.renderRoutes(Game.currentCity || "Tekirdağ", Game.completedTasks);
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
            if (typeof UI !== 'undefined' && UI.updateTitleScreenButtons) {
                UI.updateTitleScreenButtons();
            }
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


if (typeof turkiyeDenizleri !== "undefined" && typeof window !== "undefined") { window.turkiyeDenizleri = turkiyeDenizleri; }
