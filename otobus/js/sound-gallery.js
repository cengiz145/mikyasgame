/* ==========================================================================
   TÜRKİYE TURNESİ - SESLERİ GÖSTER & SES GALERİSİ (SOUND-GALLERY.JS)
   Motor seslerini 10 saniye boyunca dinleme, havalı fren, korna ve efektler
   ========================================================================== */

const SoundGallery = {
    currentAudioNode: null,
    currentGainNode: null,
    currentHtmlAudio: null,
    activeTimer: null,
    countdownInterval: null,
    remainingSeconds: 0,
    currentlyPlayingId: null,
    currentTab: 'all',

    // Ses Listesi Veritabanı
    sounds: [
        // --- 1. OTOBÜS MOTORLARI (10 Saniye Dinleme) ---
        {
            id: 'engine_travego',
            category: 'engine',
            title: 'Mercedes-Benz Travego 16 SHD',
            busId: 'mercedes_travego_16shd',
            icon: '👑',
            specs: 'OM 470 LA Euro 6, 456 HP - Ağır V6 Şehirlerarası',
            desc: 'Freesound Coach Idle: Derin, tok ve güçlü şehirlerarası dizel rölanti homurtusu.',
            type: 'coach',
            playbackRate: 1.0,
            bassBoost: 3
        },
        {
            id: 'engine_tourismo',
            category: 'engine',
            title: 'Mercedes-Benz Tourismo 16 RHD',
            busId: 'mercedes_tourismo_16rhd',
            icon: '🚌',
            specs: 'OM 470 LA, 428 HP - Akıcı Uzun Yol Dizel Rölantisi',
            desc: 'Dengeli ve konforlu seyahat rölantisi, sakin kabin akustiği.',
            type: 'coach',
            playbackRate: 1.03,
            bassBoost: 2
        },
        {
            id: 'engine_o403',
            category: 'engine',
            title: 'Mercedes-Benz O 403 RHD (Efsane V8)',
            busId: 'mercedes_o403_rhd',
            icon: '⭐',
            specs: 'OM 442 LA V8, 381 HP - Efsanevi V8 Çift Egzoz Bas Sesi',
            desc: '90\'ların ve 2000\'lerin kralı. Yeri göğü titreten o meşhur derin V8 dizel sesi.',
            type: 'coach',
            playbackRate: 0.91,
            bassBoost: 7
        },
        {
            id: 'engine_setra',
            category: 'engine',
            title: 'Setra S 516 HD (TopClass)',
            busId: 'setra_topclass_s516',
            icon: '💎',
            specs: 'OM 471 LA, 476 HP - Lüks Alman Şehirlerarası Motoru',
            desc: 'Kassbohrer-Setra kalitesi; sessiz, elit ve derinden gelen Alman güç homurtusu.',
            type: 'coach',
            playbackRate: 0.97,
            bassBoost: 3
        },
        {
            id: 'engine_safir',
            category: 'engine',
            title: 'Temsa Safir Plus VIP',
            busId: 'temsa_safir_plus',
            icon: '🇹🇷',
            specs: 'DAF PACCAR MX-11, 450 HP - Yerli Uzun Yol Devi',
            desc: 'DAF motor bloğunun kendine has yüksek torklu ve kararlı çalışma ritmi.',
            type: 'coach',
            playbackRate: 1.06,
            bassBoost: 4
        },
        {
            id: 'engine_man',
            category: 'engine',
            title: 'MAN Lion\'s Coach',
            busId: 'man_lions_coach',
            icon: '🦁',
            specs: 'D2676 LOH Euro 6, 460 HP - Tok Bavyera Dizeli',
            desc: 'Sert, otoriter ve güçlü Bavyera motor akustiği.',
            type: 'coach',
            playbackRate: 0.95,
            bassBoost: 4
        },
        {
            id: 'engine_neoplan',
            category: 'engine',
            title: 'Neoplan Cityliner',
            busId: 'neoplan_cityliner',
            icon: '🚀',
            specs: 'MAN D2676, 470 HP - Çift Turbo Aerodinamik Seyahat',
            desc: 'Fütüristik çift turbo uzun yol rölantisi ve hafif ıslık tonu.',
            type: 'coach',
            playbackRate: 1.0,
            bassBoost: 3
        },
        {
            id: 'engine_kent',
            category: 'engine',
            title: 'Otokar Kent LF (Belediye)',
            busId: 'otokar_kent_lf',
            icon: '🏙️',
            specs: 'Cummins ISB6.7 Euro 6, 280 HP - Alçak Tabanlı Şehir İçi',
            desc: 'Freesound City Transit Bus: Belediye hatlarının vazgeçilmez Cummins homurtusu.',
            type: 'city',
            playbackRate: 1.0,
            bassBoost: 1
        },
        {
            id: 'engine_kent_g',
            category: 'engine',
            title: 'Mercedes-Benz Conecto Körüklü (18m)',
            busId: 'mercedes_conecto_g',
            icon: '🚃',
            specs: 'OM 470, 360 HP - Körüklü Metropol Transit Bası',
            desc: 'Ağır gövdeyi çeken 10.7 litrelik motorun tok ve hırıltılı rölantisi.',
            type: 'city',
            playbackRate: 0.88,
            bassBoost: 5
        },
        {
            id: 'engine_conecto',
            category: 'engine',
            title: 'Mercedes-Benz Conecto Solo (12m)',
            busId: 'mercedes_conecto_12m',
            icon: '🚌',
            specs: 'OM 936, 300 HP - Metropol Solo Şehir İçi',
            desc: 'Klasik modern belediye otobüsü akustiği ve yumuşak rölanti.',
            type: 'city',
            playbackRate: 1.02,
            bassBoost: 2
        },
        {
            id: 'engine_neocity',
            category: 'engine',
            title: 'BMC Neocity 10M',
            busId: 'bmc_neocity_10m',
            icon: '⚡',
            specs: 'Cummins ISB4.5, 210 HP - Çevik Kompakt Dizel',
            desc: 'Dar sokaklar ve ilçe merkezleri için çevik ve ritmik motor sesi.',
            type: 'city',
            playbackRate: 1.12,
            bassBoost: 1
        },
        {
            id: 'engine_novo',
            category: 'engine',
            title: 'Isuzu Novo Lux Midibüs',
            busId: 'isuzu_novo_lux',
            icon: '🚐',
            specs: 'Isuzu 4HK1-TCS, 190 HP - 4 Silindir Japon Dizeli',
            desc: 'Trakya köyleri ve kasaba hatlarının yüksek devirli tok midibüs sesi.',
            type: 'city',
            playbackRate: 1.18,
            bassBoost: 0
        },

        
        // --- 3. AKBİL VE KART OKUYUCU (VALIDATOR) SESLERİ ---
        {
            id: 'akbil_tam',
            category: 'akbil',
            title: 'Tam Akbil / Standart Biniş Onay Bipi',
            icon: '💳',
            specs: 'Freesound ilmari_freesound #625731 Zoom H5 Stüdyo Kaydı',
            desc: 'Şehir içi otobüse binerken tam kart basıldığında çıkan o temiz ve net tek tonlu onay sesi.',
            playFn: () => {
                if (typeof audio !== 'undefined' && audio.playAkbilTam) audio.playAkbilTam();
                else if (typeof audio !== 'undefined' && audio.playValidatorSound) audio.playValidatorSound('tam');
            }
        },
        {
            id: 'akbil_ogrenci',
            category: 'akbil',
            title: 'Öğrenci & İndirimli Akbil (Çift Bip)',
            icon: '🎓',
            specs: 'Freesound SpliceSound #369875 Orijinal Transit Kart Kaydı',
            desc: 'Öğrenci veya indirimli kart okutulduğunda çıkan o melodik ve neşeli çift dıt-dıt onay sesi.',
            playFn: () => {
                if (typeof audio !== 'undefined' && audio.playAkbilOgrenci) audio.playAkbilOgrenci();
                else if (typeof audio !== 'undefined' && audio.playValidatorSound) audio.playValidatorSound('ogrenci');
            }
        },
        {
            id: 'akbil_hata',
            category: 'akbil',
            title: 'Yetersiz Bakiye / Kart Reddedildi Alarmı',
            icon: '❌',
            specs: 'Freesound PerMagnusLindborg #324248 Card Reject Alarm',
            desc: 'Kartta para kalmadığında veya kart okunamadığında validatörün çaldığı o keskin ret ve uyarı alarmı.',
            playFn: () => {
                if (typeof audio !== 'undefined' && audio.playAkbilHata) audio.playAkbilHata();
                else if (typeof audio !== 'undefined' && audio.playValidatorSound) audio.playValidatorSound('yetersiz');
            }
        },
        {
            id: 'bus_validator',
            category: 'akbil',
            title: 'Gerçek Otobüs Kart Okuyucu Validatör Mekanizması',
            icon: '📟',
            specs: 'Freesound Robinhood76 #62589 Orijinal Otobüs Validatörü',
            desc: 'Gerçek bir belediye otobüsü kart okuyucu cihazının iç röle ve elektronik kart okuma tepkisi.',
            playFn: () => {
                if (typeof audio !== 'undefined' && audio.playBusValidator) audio.playBusValidator();
                else if (typeof audio !== 'undefined' && audio.playValidatorSound) audio.playValidatorSound('serbest');
            }
        },
        // --- 2. PNÖMATİK & MEKANİK EFEKTLER ---
        {
            id: 'fx_air_brake',
            category: 'effect',
            title: 'Gerçek Havalı Fren (Air Brake Release)',
            icon: '💨',
            specs: 'Freesound InspectorJ #415510 Orijinal Kayıt',
            desc: 'Otobüs durduğunda veya frene basıldığında çıkan meşhur pnömatik hava tahliye ve tıslama sesi.',
            playFn: () => {
                if (typeof audio !== 'undefined' && audio.playAirBrake) audio.playAirBrake();
                else if (typeof audio !== 'undefined' && audio.sounds && audio.sounds.airBrake) audio.sounds.airBrake.play();
            }
        },
        {
            id: 'fx_door',
            category: 'effect',
            title: 'Gerçek Otobüs Pnömatik Kapı Sesi',
            icon: '🚪',
            specs: 'Freesound Robinhood76 #489370 Orijinal Kayıt',
            desc: 'İki kanatlı pnömatik yolcu kapısının açılma, hava tahliyesi ve kapanma kilitlenme sesi.',
            playFn: () => {
                if (typeof audio !== 'undefined' && audio.sounds && audio.sounds.doorOpen) {
                    audio.sounds.doorOpen.play();
                } else {
                    const a = new Audio('sounds/freesound_bus_door.mp3');
                    a.play().catch(() => {});
                }
            }
        },
        {
            id: 'fx_air_horn',
            category: 'effect',
            title: 'Ağır Vasıta Endüstriyel Havalı Korna',
            icon: '📯',
            specs: 'Freesound mcpable #397858 Orijinal Kayıt',
            desc: 'Şehirlerarası otobüslerin ve tırların o heybetli, gür ve yankılanan havalı kornası.',
            playFn: () => {
                if (typeof audio !== 'undefined' && audio.sounds && audio.sounds.airHorn) {
                    audio.sounds.airHorn.play();
                } else {
                    const a = new Audio('sounds/freesound_industrial_horn.mp3');
                    a.play().catch(() => {});
                }
            }
        },
        {
            id: 'fx_retarder',
            category: 'effect',
            title: 'Voith / ZF Hidrolik Retarder Düdüğü',
            icon: '🎶',
            specs: '10 Saniyelik Dinamik Retarder Simülasyonu',
            desc: 'Ağır vasıta yüksek hızdan yavaşlarken şanzımandan gelen o meşhur elektrikli ıslık ve düdük sesi.',
            is10Seconds: true,
            playFn: () => {
                if (typeof audio !== 'undefined' && audio.playRetarder) {
                    audio.playRetarder(10, 90);
                }
            }
        },
        {
            id: 'fx_governor',
            category: 'effect',
            title: 'Kompresör Hava Tahliye Valfi (Air Governor)',
            icon: '⚙️',
            specs: '120 PSI Basınç Tahliye Boşalması',
            desc: 'Hava tüpleri dolduğunda tahliye regülatörünün attığı o keskin "çuf-tısss" sesi.',
            playFn: () => {
                if (typeof audio !== 'undefined' && audio.playAirGovernorCutoff) {
                    audio.playAirGovernorCutoff();
                }
            }
        },
        {
            id: 'fx_emergency_lock',
            category: 'effect',
            title: 'İmdat Freni Kilitlenme ve Boşalma',
            icon: '🛑',
            specs: 'Mekanik Mandal ve Pnömatik İmdat Sistemi',
            desc: 'El freni mandalı çekildiğinde arka tekerleklerin zınk diye kilitlenme ve hava boşalma sesi.',
            playFn: () => {
                if (typeof audio !== 'undefined' && audio.playEmergencyBrakeLock) {
                    audio.playEmergencyBrakeLock();
                }
            }
        }
    ],

    init: function() {
        const btnOpen = document.getElementById('btn-open-sound-gallery');
        if (btnOpen) {
            btnOpen.addEventListener('click', () => this.openModal());
        }

        const btnClose = document.getElementById('btn-sound-gallery-close');
        if (btnClose) {
            btnClose.addEventListener('click', () => this.closeModal());
        }

        const btnStopAll = document.getElementById('btn-sound-gallery-stop-all');
        if (btnStopAll) {
            btnStopAll.addEventListener('click', () => this.stopCurrentSound(true));
        }

        const tabAll = document.getElementById('tab-sound-all');
        const tabEngine = document.getElementById('tab-sound-engine');
        const tabFx = document.getElementById('tab-sound-fx');
        const tabAkbil = document.getElementById('tab-sound-akbil');
        if (tabAkbil) tabAkbil.addEventListener('click', () => this.switchTab('akbil'));

        if (tabAll) tabAll.addEventListener('click', () => this.switchTab('all'));
        if (tabEngine) tabEngine.addEventListener('click', () => this.switchTab('engine'));
        if (tabFx) tabFx.addEventListener('click', () => this.switchTab('effect'));

        // Klavye Kısayolu: [S] tuşu ile Ses Galerisi Açma
        window.addEventListener('keydown', (e) => {
            const activeTag = document.activeElement ? document.activeElement.tagName.toLowerCase() : '';
            if (activeTag === 'input' || activeTag === 'textarea' || activeTag === 'select') return;

            if (e.key === 's' || e.key === 'S') {
                const titleScreen = document.getElementById('title-screen');
                if (titleScreen && !titleScreen.classList.contains('hidden')) {
                    const modal = document.getElementById('sound-gallery-modal');
                    if (modal && modal.classList.contains('hidden')) {
                        e.preventDefault();
                        this.openModal();
                    }
                }
            } else if (e.key === 'Escape') {
                const modal = document.getElementById('sound-gallery-modal');
                if (modal && !modal.classList.contains('hidden')) {
                    this.closeModal();
                }
            }
        });
    },

    openModal: function() {
        const modal = document.getElementById('sound-gallery-modal');
        if (!modal) return;
        modal.classList.remove('hidden');

        // AudioContext uyandır
        if (typeof audio !== 'undefined' && audio.ctx && audio.ctx.state === 'suspended') {
            audio.ctx.resume();
        }

        this.renderModal(this.currentTab);

        const welcomeText = "Sesleri Göster galerisi açıldı. 12 farklı otobüsün motor sesini 10 saniye boyunca dinleyebilir veya havalı fren, korna gibi efektleri deneyebilirsiniz.";
        if (typeof audio !== 'undefined' && audio.speak) {
            audio.speak(welcomeText);
        }
        if (typeof audio !== 'undefined' && audio.updateNvdaLiveRegion) {
            audio.updateNvdaLiveRegion(welcomeText);
        }

        if (typeof KeyboardNav !== 'undefined' && KeyboardNav.initForScreen) {
            KeyboardNav.initForScreen();
        }
    },

    closeModal: function() {
        this.stopCurrentSound(false);
        const modal = document.getElementById('sound-gallery-modal');
        if (modal) modal.classList.add('hidden');

        if (typeof audio !== 'undefined' && audio.speak) {
            audio.speak("Ses galerisi kapatıldı, ana menüye dönüldü.");
        }

        if (typeof KeyboardNav !== 'undefined' && KeyboardNav.initForScreen) {
            KeyboardNav.initForScreen();
        }
    },

    switchTab: function(tab) {
        this.currentTab = tab;
        ['tab-sound-all', 'tab-sound-engine', 'tab-sound-akbil', 'tab-sound-fx'].forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.style.background = 'rgba(255,255,255,0.08)';
                el.style.borderColor = 'rgba(255,255,255,0.2)';
                el.style.color = '#94a3b8';
            }
        });

        const activeId = tab === 'engine' ? 'tab-sound-engine' : (tab === 'akbil' ? 'tab-sound-akbil' : (tab === 'effect' ? 'tab-sound-fx' : 'tab-sound-all'));
        const activeEl = document.getElementById(activeId);
        if (activeEl) {
            activeEl.style.background = 'rgba(168,85,247,0.3)';
            activeEl.style.borderColor = '#c084fc';
            activeEl.style.color = '#fff';
        }

        this.renderModal(tab);
        if (typeof KeyboardNav !== "undefined" && KeyboardNav.initForScreen) KeyboardNav.initForScreen();
    },

    renderModal: function(tab = 'all') {
        const listEl = document.getElementById('sound-gallery-list');
        if (!listEl) return;
        listEl.innerHTML = '';

        const filtered = this.sounds.filter(s => {
            if (tab === 'engine') return s.category === 'engine';
            if (tab === 'effect') return s.category === 'effect';
            if (tab === 'akbil') return s.category === 'akbil';
            return true;
        });

        filtered.forEach(s => {
            const li = document.createElement('li');
            li.style.marginBottom = "12px";

            const isPlaying = this.currentlyPlayingId === s.id;

            const btn = document.createElement('button');
            btn.className = 'menu-btn nav-item';
            btn.id = `btn-sound-${s.id}`;
            btn.style.width = '100%';
            btn.style.flexDirection = 'column';
            btn.style.alignItems = 'stretch';
            btn.style.textAlign = 'left';
            btn.style.padding = '14px 18px';
            btn.style.border = isPlaying ? '2.5px solid #a855f7' : '1px solid rgba(255,255,255,0.15)';
            btn.style.background = isPlaying ? 'rgba(168, 85, 247, 0.22)' : 'rgba(15, 23, 42, 0.7)';
            btn.style.borderRadius = '10px';
            btn.style.transition = 'all 0.2s ease';

            const categoryTag = s.category === 'engine'
                ? '<span style="color: #c084fc; font-size: 0.85rem; font-weight: bold; background: rgba(168,85,247,0.2); padding: 3px 8px; border-radius: 4px;">⏱️ 10 Saniye Motor Dinleme</span>'
                : '<span style="color: #38bdf8; font-size: 0.85rem; font-weight: bold; background: rgba(56,189,248,0.2); padding: 3px 8px; border-radius: 4px;">💨 Havalı & Mekanik Efekt</span>';

            let playBadge = '';
            if (isPlaying) {
                playBadge = `<span id="badge-countdown-${s.id}" style="background: linear-gradient(135deg, #a855f7, #7e22ce); color: #fff; font-weight: bold; padding: 6px 12px; border-radius: 20px; font-size: 0.95rem; animation: pulse 1s infinite;">
                    🔊 ÇALIYOR (${this.remainingSeconds} sn)
                </span>`;
            } else {
                playBadge = s.category === 'engine'
                    ? '<span style="background: rgba(168,85,247,0.25); color: #e9d5ff; font-weight: bold; padding: 5px 12px; border-radius: 20px; font-size: 0.88rem;">▶️ 10 Saniye Dinle</span>'
                    : '<span style="background: rgba(56,189,248,0.2); color: #7dd3fc; font-weight: bold; padding: 5px 12px; border-radius: 20px; font-size: 0.88rem;">▶️ Efekti Çal</span>';
            }

            const ariaLabel = `${s.title}. ${s.specs}. ${s.desc}. ${s.category === 'engine' ? '10 saniye boyunca dinlemek için Enter tuşuna basın.' : 'Efekti dinlemek için Enter tuşuna basın.'} ${isPlaying ? 'Şu anda çalıyor.' : ''}`;
            btn.setAttribute('aria-label', ariaLabel);

            btn.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; flex-wrap: wrap; gap: 8px;">
                    <div>
                        <span style="font-size: 1.2rem; font-weight: bold; color: #fff;">
                            ${s.icon} ${s.title}
                        </span>
                        <div style="margin-top: 4px;">${categoryTag}</div>
                    </div>
                    <div>${playBadge}</div>
                </div>
                <div style="font-size: 0.92rem; color: #cbd5e1; margin-bottom: 4px;">
                    ⚙️ <strong>Özellikler:</strong> <span style="color: #facc15;">${s.specs}</span>
                </div>
                <div style="font-size: 0.88rem; color: #94a3b8; line-height: 1.4;">
                    💡 ${s.desc}
                </div>
            `;

            btn.onclick = () => {
                if (isPlaying) {
                    this.stopCurrentSound(true);
                } else {
                    this.playSoundItem(s);
                }
            };

            li.appendChild(btn);
            listEl.appendChild(li);
        });

        if (typeof KeyboardNav !== 'undefined' && KeyboardNav.initForScreen) {
            KeyboardNav.initForScreen();
        }
    },

    playSoundItem: function(s) {
        // Önceki çalan sesi durdur
        this.stopCurrentSound(false);

        this.currentlyPlayingId = s.id;
        const statusBanner = document.getElementById('sound-gallery-current-status');
        const statusText = document.getElementById('sound-gallery-status-text');

        if (s.category === 'engine') {
            this.playEngineFor10Seconds(s);
        } else if (s.is10Seconds) {
            this.play10SecondEffect(s);
        } else {
            // Tek seferlik efekt
            if (statusBanner && statusText) {
                statusBanner.style.display = 'flex';
                statusText.innerText = `▶️ Çalıyor: ${s.title}`;
            }
            if (typeof audio !== 'undefined' && audio.speak) {
                audio.speak(`${s.title} çalınıyor.`);
            }
            if (typeof s.playFn === 'function') {
                s.playFn();
            }
            this.renderModal(this.currentTab);
            setTimeout(() => {
                this.currentlyPlayingId = null;
                if (statusBanner) statusBanner.style.display = 'none';
                this.renderModal(this.currentTab);
            }, 3000);
        }
    },

    playEngineFor10Seconds: function(s) {
        this.remainingSeconds = 10;
        const statusBanner = document.getElementById('sound-gallery-current-status');
        const statusText = document.getElementById('sound-gallery-status-text');
        const countdownEl = document.getElementById('sound-gallery-countdown-num');

        if (statusBanner) statusBanner.style.display = 'flex';
        if (statusText) statusText.innerText = `▶️ 10 Saniye Motor Dinleniyor: ${s.title}`;
        if (countdownEl) countdownEl.innerText = '10';

        const speechNotice = `${s.title} motor sesi 10 saniye boyunca dinletiliyor.`;
        if (typeof audio !== 'undefined' && audio.speak) {
            audio.speak(speechNotice);
        }
        if (typeof audio !== 'undefined' && audio.updateNvdaLiveRegion) {
            audio.updateNvdaLiveRegion(speechNotice);
        }

        // Web Audio API üzerinden motor sesi çalma
        try {
            const ctx = (typeof audio !== 'undefined' && audio.ctx) ? audio.ctx : (Howler.ctx || new (window.AudioContext || window.webkitAudioContext)());
            if (ctx.state === 'suspended') ctx.resume();

            let targetBuffer = null;
            if (typeof audio !== 'undefined') {
                if (s.type === 'coach') {
                    targetBuffer = audio.coachIdleBuffer || audio.bassIdleBuffer || audio.idleBuffer;
                } else {
                    targetBuffer = audio.cityIdleBuffer || audio.idleBuffer;
                }
            }

            if (targetBuffer) {
                const source = ctx.createBufferSource();
                source.buffer = targetBuffer;
                source.loop = true;
                source.loopStart = 0.05;
                source.loopEnd = Math.max(0.1, targetBuffer.duration - 0.05);
                source.playbackRate.value = s.playbackRate || 1.0;

                const gain = ctx.createGain();
                gain.gain.setValueAtTime(0.001, ctx.currentTime);
                gain.gain.linearRampToValueAtTime(1.0, ctx.currentTime + 0.15); // Yumuşak giriş

                // Bas ve Kabin Filtresi
                const bassFilter = ctx.createBiquadFilter();
                bassFilter.type = 'lowshelf';
                bassFilter.frequency.value = 130;
                bassFilter.gain.value = s.bassBoost || 3;

                const lowpass = ctx.createBiquadFilter();
                lowpass.type = 'lowpass';
                lowpass.frequency.value = 6500;

                source.connect(bassFilter);
                bassFilter.connect(lowpass);
                lowpass.connect(gain);
                gain.connect(ctx.destination);

                source.start(0);
                this.currentAudioNode = source;
                this.currentGainNode = gain;
            } else {
                // Buffer henüz çözülmemişse HTMLAudioElement ile garantili fallback
                const audioSrc = s.type === 'coach' ? 'sounds/freesound_coach_idle.mp3' : 'sounds/freesound_engine_city.mp3';
                this.currentHtmlAudio = new Audio(audioSrc);
                this.currentHtmlAudio.loop = true;
                this.currentHtmlAudio.play().catch(() => {});
            }
        } catch (e) {
            console.error("Motor sesi başlatılırken hata:", e);
        }

        this.renderModal(this.currentTab);

        // 10 Saniyelik Geri Sayım Döngüsü
        this.countdownInterval = setInterval(() => {
            this.remainingSeconds--;
            if (countdownEl) countdownEl.innerText = this.remainingSeconds;
            
            const badge = document.getElementById(`badge-countdown-${s.id}`);
            if (badge) {
                badge.innerText = `🔊 ÇALIYOR (${this.remainingSeconds} sn)`;
            }

            // Son saniyede yumuşak kapanış (fade-out)
            if (this.remainingSeconds === 1) {
                if (this.currentGainNode && typeof audio !== 'undefined' && audio.ctx) {
                    try {
                        this.currentGainNode.gain.linearRampToValueAtTime(0.001, audio.ctx.currentTime + 0.9);
                    } catch(e) {}
                }
            }

            if (this.remainingSeconds <= 0) {
                this.finish10Seconds(s);
            }
        }, 1000);
    },

    play10SecondEffect: function(s) {
        this.remainingSeconds = 10;
        const statusBanner = document.getElementById('sound-gallery-current-status');
        const statusText = document.getElementById('sound-gallery-status-text');
        const countdownEl = document.getElementById('sound-gallery-countdown-num');

        if (statusBanner) statusBanner.style.display = 'flex';
        if (statusText) statusText.innerText = `▶️ 10 Saniye Dinleniyor: ${s.title}`;
        if (countdownEl) countdownEl.innerText = '10';

        if (typeof s.playFn === 'function') {
            s.playFn();
        }

        this.renderModal(this.currentTab);

        this.countdownInterval = setInterval(() => {
            this.remainingSeconds--;
            if (countdownEl) countdownEl.innerText = this.remainingSeconds;
            const badge = document.getElementById(`badge-countdown-${s.id}`);
            if (badge) badge.innerText = `🔊 ÇALIYOR (${this.remainingSeconds} sn)`;

            if (this.remainingSeconds <= 0) {
                this.finish10Seconds(s);
            }
        }, 1000);
    },

    finish10Seconds: function(s) {
        this.stopCurrentSound(false);

        const doneMessage = `${s.title} 10 saniyelik dinleme tamamlandı.`;
        if (typeof audio !== 'undefined' && audio.speak) {
            audio.speak(doneMessage);
        }
        if (typeof audio !== 'undefined' && audio.updateNvdaLiveRegion) {
            audio.updateNvdaLiveRegion(doneMessage);
        }

        const statusText = document.getElementById('sound-gallery-status-text');
        if (statusText) {
            statusText.innerText = `✅ ${s.title} 10 saniyelik dinleme bitti.`;
        }

        setTimeout(() => {
            const statusBanner = document.getElementById('sound-gallery-current-status');
            if (statusBanner && !this.currentlyPlayingId) {
                statusBanner.style.display = 'none';
            }
        }, 3000);

        this.renderModal(this.currentTab);
    },

    stopCurrentSound: function(notify = true) {
        if (this.countdownInterval) {
            clearInterval(this.countdownInterval);
            this.countdownInterval = null;
        }

        // Web Audio Node kapat
        if (this.currentAudioNode) {
            try {
                this.currentAudioNode.stop();
                this.currentAudioNode.disconnect();
            } catch(e) {}
            this.currentAudioNode = null;
        }

        if (this.currentGainNode) {
            try { this.currentGainNode.disconnect(); } catch(e){}
            this.currentGainNode = null;
        }

        if (this.currentHtmlAudio) {
            try {
                this.currentHtmlAudio.pause();
                this.currentHtmlAudio.currentTime = 0;
            } catch(e) {}
            this.currentHtmlAudio = null;
        }

        if (typeof audio !== 'undefined' && audio.stopRetarder) {
            try { audio.stopRetarder(); } catch(e){}
        }

        const wasPlaying = this.currentlyPlayingId;
        this.currentlyPlayingId = null;
        this.remainingSeconds = 0;

        const statusBanner = document.getElementById('sound-gallery-current-status');
        if (statusBanner) statusBanner.style.display = 'none';

        if (notify && wasPlaying) {
            const msg = "Ses çalması durduruldu.";
            if (typeof audio !== 'undefined' && audio.speak) audio.speak(msg);
            if (typeof audio !== 'undefined' && audio.updateNvdaLiveRegion) audio.updateNvdaLiveRegion(msg);
        }

        this.renderModal(this.currentTab);
    }
};

if (typeof window !== 'undefined') {
    window.SoundGallery = SoundGallery;
    document.addEventListener('DOMContentLoaded', () => {
        SoundGallery.init();
    });
}
