/* ==========================================================================
   TÜRKİYE TURNESİ - SESLERİ GÖSTER & SES GALERİSİ (SOUND-GALLERY.JS)
   7 Farklı Akustik Rölanti Grubu, Akbil Sesleri ve Mekanik Efektler
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
        // --- 10 GRUP MODEL VE MOTOR BİREBİR EŞLEŞTİRİLMİŞ GERÇEK RÖLANTİ SESLERİ ---
        // GRUP 1: MERCEDES-BENZ TRAVEGO & SETRA TOPCLASS (SAF DAIMLER OM 470/471 V6)
        {
            id: 'engine_pure_v6_travego',
            category: 'engine',
            soundGroup: 'Grup 1: Saf Daimler V6 Rölantisi',
            title: 'Grup 1: Mercedes Travego 16 SHD & Setra S 516',
            busId: 'mercedes_travego_16shd',
            icon: '⚙️',
            specs: 'OM 470 / OM 471 BlueTec Euro 6 - Kesintisiz Saf Rölanti',
            desc: 'Daimler V6/sıralı 6 motorunun pürüzsüz, ritmik uzun yol dizel tınısı (tır-tır-tır). [Travego ve Setra TopClass VIP]',
            type: 'pure_v6',
            file: 'sounds/freesound_pure_bus_idle.mp3',
            playbackRate: 1.0,
            bassBoost: 4
        },
        // GRUP 2: MERCEDES-BENZ TOURISMO (OTOGAR PERON RÖLANTİSİ VE HAVA TAHLİYESİ)
        {
            id: 'engine_terminal_tourismo',
            category: 'engine',
            soundGroup: 'Grup 2: Otogar Peron Rölantisi',
            title: 'Grup 2: Mercedes-Benz Tourismo 16 RHD',
            busId: 'mercedes_tourismo_16rhd',
            icon: '🛣️',
            specs: 'OM 936 Euro 6, 354 HP - Orijinal Peron Kalkış ve Hava Tahliyeli Ses',
            desc: 'Otogar peronunda kalkış öncesi hava tahliye tıslaması ve ardından devam eden tok uzun yol dizel rölantisi.',
            type: 'coach_terminal',
            file: 'sounds/freesound_coach_idle.mp3',
            playbackRate: 1.0,
            bassBoost: 4
        },
        // GRUP 3: MERCEDES-BENZ O 403 RHD (EFSANEVİ OM 442 V8 ÇİFT EGZOZ BASI)
        {
            id: 'engine_v8_o403',
            category: 'engine',
            soundGroup: 'Grup 3: Efsane V8 Derin Bas',
            title: 'Grup 3: Mercedes-Benz O 403 RHD (Yolların Efsanesi V8)',
            busId: 'mercedes_o403_rhd',
            icon: '⭐',
            specs: 'OM 442 LA V8 Turbo Intercooler, 381 HP - Efsanevi V8 Çift Egzoz Bas Sesi',
            desc: '90 ve 2000\'lerin kralı. Yeri göğü titreten o meşhur derin V8 çift egzoz bas homurtusu. Sadece gerçek O 403\'e özeldir.',
            type: 'v8_bass',
            file: 'sounds/bassrolanti.mp3',
            playbackRate: 0.91,
            bassBoost: 7
        },
        // GRUP 4: OTOKAR KENT LF & BMC NEOCITY (CUMMINS ISB BELEDİYE)
        {
            id: 'engine_city_kent',
            category: 'engine',
            soundGroup: 'Grup 4: Cummins Şehir İçi Belediye',
            title: 'Grup 4: Otokar Kent LF & BMC Neocity (Cummins ISB)',
            busId: 'otokar_kent_lf',
            icon: '🏙️',
            specs: 'Cummins ISB6.7 & 4.5L Euro 6 - Alçak Tabanlı Şehir İçi',
            desc: 'Alçak tabanlı şehir içi belediye otobüsünün durağa yanaşırken ve dururken çıkardığı Cummins turbo/dizel sesi.',
            type: 'city_cummins',
            file: 'sounds/freesound_new_bus_idle.mp3',
            playbackRate: 1.0,
            bassBoost: 1
        },
        // GRUP 5: MERCEDES-BENZ CONECTO 12M SOLO (OM 936 SOLO ŞEHİR İÇİ)
        {
            id: 'engine_conecto_solo',
            category: 'engine',
            soundGroup: 'Grup 5: Mercedes Solo Belediye',
            title: 'Grup 5: Mercedes-Benz Conecto 12M Solo (OM 936)',
            busId: 'mercedes_conecto_12m',
            icon: '🚌',
            specs: 'OM 936 Euro 6, 299 HP - 12 Metre Solo Belediye',
            desc: '12 metrelik solo Conecto\'nun tok ve pürüzsüz Alman OM 936 motor sesi ve sessiz şehir içi rölantisi.',
            type: 'conecto_solo',
            file: 'sounds/freesound_engine_city.mp3',
            playbackRate: 1.0,
            bassBoost: 3
        },
        // GRUP 6: MERCEDES-BENZ CONECTO G 18M KÖRÜKLÜ (AĞIR TRANSİT BASI)
        {
            id: 'engine_articulated_conecto',
            category: 'engine',
            soundGroup: 'Grup 6: 18m Körüklü Ağır Transit',
            title: 'Grup 6: Mercedes-Benz Conecto G (18m Körüklü Transit Bası)',
            busId: 'mercedes_conecto_g',
            icon: '🚃',
            specs: 'OM 470, 360 HP - 18 Metre Körüklü Ağır Metropol Bası',
            desc: '18 metrelik ağır körüklü gövdeyi çeken 10.7 litrelik motorun devasa kütleli ve hırıltılı transit rölantisi.',
            type: 'articulated',
            file: 'sounds/freesound_articulated_idle.mp3',
            playbackRate: 0.90,
            bassBoost: 5
        },
        // GRUP 7: MAN LION\'S COACH & NEOPLAN CITYLINER (MAN D2676 BAVYERA DİZELİ)
        {
            id: 'engine_man_d26',
            category: 'engine',
            soundGroup: 'Grup 7: MAN D26 Ağır Bavyera',
            title: 'Grup 7: MAN Lion\'s Coach & Neoplan Cityliner',
            busId: 'man_lions_coach',
            icon: '🦁',
            specs: 'MAN D2676 Euro 6, 470 HP - Endüstriyel Bavyera Dizeli',
            desc: 'Sert, otoriter, doğrudan motor ızgarasından gelen kalın ve gür Bavyera dizel homurtusu. Neoplan MAN üretimi olduğu için D26 kullanır.',
            type: 'man_d26',
            file: 'sounds/freesound_heavy_man_idle.mp3',
            playbackRate: 0.96,
            bassBoost: 5
        },
        // GRUP 8: TEMSA SAFİR PLUS (DAF PACCAR MX-11 450 HP)
        {
            id: 'engine_daf_safir',
            category: 'engine',
            soundGroup: 'Grup 8: DAF PACCAR Uzun Yol',
            title: 'Grup 8: Temsa Safir Plus (DAF PACCAR MX-11)',
            busId: 'temsa_safir_plus',
            icon: '💎',
            specs: 'DAF PACCAR MX-11 Euro 6, 450 HP - 6 Silindir Ağır Dizel',
            desc: 'Temsa Safir\'in hak ettiği orijinal DAF motoru. Tok ve gırtlaktan gelen 6 silindir DAF homurtusu. Asla V8 değildir.',
            type: 'daf_paccar',
            file: 'sounds/freesound_daf_paccar_idle.mp3',
            playbackRate: 1.0,
            bassBoost: 5
        },
        // GRUP 9: SCANIA IRIZAR i8 VIP (SCANIA DC13 13 LITRE DERİN İSVEÇ TORKU)
        {
            id: 'engine_scania_dc13',
            category: 'engine',
            soundGroup: 'Grup 9: Scania DC13 İsveç Torku',
            title: 'Grup 9: Scania Irizar i8 VIP (Otogar Peron Kralı)',
            busId: 'scania_irizar_i8',
            icon: '👑',
            specs: 'Scania DC13 Euro 6, 490 HP - 13 Litre Dev İsveç Dizeli',
            desc: 'İsveç mühendisliği 13 litrelik dev Scania motorunun o meşhur düşük devirli, derin göğüslü tork homurtusu.',
            type: 'scania_dc13',
            file: 'sounds/freesound_scania_dc13_idle.mp3',
            playbackRate: 0.98,
            bassBoost: 6
        },
        // GRUP 10: ISUZU NOVO LUX (4 SILINDIR SERI KASABA MİDİBÜSÜ)
        {
            id: 'engine_midibus_novo',
            category: 'engine',
            soundGroup: 'Grup 10: Çevik Midibüs Rölantisi',
            title: 'Grup 10: Isuzu Novo Lux Midibüs (4HK1)',
            busId: 'isuzu_novo_lux',
            icon: '🚐',
            specs: 'Isuzu 4HK1-TCS, 190 HP - 4 Silindir Japon Dizeli',
            desc: 'Trakya kasaba ve köy hatlarının küçük hacimli, daha seri ve tiz vuran 4 silindirli dizel midibüs sesi.',
            type: 'midibus',
            file: 'sounds/freesound_midibus_idle.mp3',
            playbackRate: 1.05,
            bassBoost: 1
        },
        
        // --- AKBİL VE KART OKUYUCU (VALIDATOR) SESLERİ ---
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

        // --- PNÖMATİK & MEKANİK EFEKTLER ---
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
            id: 'fx_window_open',
            category: 'effect',
            title: 'Freesound Kaptan Camı Açılma (Elektrikli Motor)',
            icon: '🪟',
            specs: 'Freesound scriotxstudios #354003 Stüdyo Kaydı',
            desc: 'Kaptan sol penceresinin elektrikli motor ve ray sesi eşliğinde aşağı inişi (Kısayol: Home tuşu).',
            playFn: () => {
                if (typeof audio !== 'undefined' && audio.playWindowSound) {
                    audio.playWindowSound(true);
                } else {
                    const a = new Audio('sounds/freesound_window_open.mp3');
                    a.play().catch(() => {});
                }
            }
        },
        {
            id: 'fx_window_close',
            category: 'effect',
            title: 'Freesound Kaptan Camı Kapanma & Akustik Yalıtım',
            icon: '🪟',
            specs: 'Freesound scriotxstudios #354002 Stüdyo Kaydı',
            desc: 'Kaptan sol penceresinin yukarı kapanışı ve kauçuk fitille kabin yalıtımı kilitleme sesi (Kısayol: End tuşu).',
            playFn: () => {
                if (typeof audio !== 'undefined' && audio.playWindowSound) {
                    audio.playWindowSound(false);
                } else {
                    const a = new Audio('sounds/freesound_window_close.mp3');
                    a.play().catch(() => {});
                }
            }
        },
        {
            id: 'fx_ramp_deploy',
            category: 'effect',
            title: 'Freesound Engelli Rampası İniş & Kaldırım Teması',
            icon: '🛹',
            specs: 'Freesound SoundsofTheMachine #784981 Stüdyo Kaydı',
            desc: 'Tekerlekli sandalyeli yolcular için otobüs tabanından uzanan hidrolik rampanın inişi ve kaldırıma kilitlenme sesi (Kısayol: U veya R tuşu).',
            playFn: () => {
                if (typeof audio !== 'undefined' && audio.playRampDeploy) {
                    audio.playRampDeploy();
                } else {
                    const a = new Audio('sounds/freesound_ramp_deploy.mp3');
                    a.play().catch(() => {});
                }
            }
        },
        {
            id: 'fx_ramp_retract',
            category: 'effect',
            title: 'Freesound Engelli Rampası Toplanma & Şasi Kilidi',
            icon: '🛹',
            specs: 'Freesound #637009 HD Mekanizma Kaydı',
            desc: 'Yolcu binişi sonrası rampanın elektrikli motorla yukarı toplanıp otobüs şasisine kilitlenme sesi (Kısayol: U veya R tuşu).',
            playFn: () => {
                if (typeof audio !== 'undefined' && audio.playRampRetract) {
                    audio.playRampRetract();
                } else {
                    const a = new Audio('sounds/freesound_ramp_retract.mp3');
                    a.play().catch(() => {});
                }
            }
        },
        {
            id: 'fx_passenger_shock',
            category: 'effect',
            title: 'Freesound Yolcu Sert Fren İrkilme & Şok Çığlığı',
            icon: '😱',
            specs: 'Freesound #324895 Stüdyo Kaydı (CC0)',
            desc: 'Sert frende veya ani savrulmada arka koltuktaki yolcuların ses tellerinden çıkan gerçek şok, irkilme ve panik çığlığı ("Hooop! N\'oluyor!").',
            playFn: () => {
                if (typeof audio !== 'undefined' && audio.playPassengerShock) {
                    audio.playPassengerShock();
                } else {
                    const a = new Audio('sounds/freesound_passenger_shock.mp3');
                    a.play().catch(() => {});
                }
            }
        },
        {
            id: 'fx_passenger_bump',
            category: 'effect',
            title: 'Freesound Yolcu Kasis Zıplama & Sarsıntı İniltisi',
            icon: '💥',
            specs: 'Freesound #324897 Stüdyo Kaydı (CC0)',
            desc: 'Kasise veya çukura hızlı girildiğinde koltukta zıplayan yolcuların gerçek bedensel "Ooff!", "Ah!" iniltisi.',
            playFn: () => {
                if (typeof audio !== 'undefined' && audio.playPassengerBump) {
                    audio.playPassengerBump();
                } else {
                    const a = new Audio('sounds/freesound_passenger_bump.mp3');
                    a.play().catch(() => {});
                }
            }
        },
        {
            id: 'fx_passenger_discontent',
            category: 'effect',
            title: 'Freesound Yolcu Huzursuzluk & Homurdanma Uğultusu',
            icon: '😠',
            specs: 'Freesound #144903 Stüdyo Kaydı (CC0)',
            desc: 'Sürüş konforu düştüğünde veya otobüs sıcak olduğunda arka sıralardan gelen şikayet mırıldanmaları ve homurtular.',
            playFn: () => {
                if (typeof audio !== 'undefined' && audio.playPassengerDiscontent) {
                    audio.playPassengerDiscontent();
                } else {
                    const a = new Audio('sounds/freesound_passenger_discontent.mp3');
                    a.play().catch(() => {});
                }
            }
        },
        {
            id: 'fx_passenger_groan',
            category: 'effect',
            title: 'Freesound Yolcu Bekleme Bıkkınlığı & "Of Ya" İç Çekişi',
            icon: '⏱️',
            specs: 'Freesound #150956 Stüdyo Kaydı (CC-BY)',
            desc: 'Durakta, ışıkta veya trafikte uzun süre hareketsiz kalınca yolcuların toplu bıkkınlık homurtusu ve iç çekişi.',
            playFn: () => {
                if (typeof audio !== 'undefined' && audio.playPassengerGroan) {
                    audio.playPassengerGroan();
                } else {
                    const a = new Audio('sounds/freesound_passenger_groan.mp3');
                    a.play().catch(() => {});
                }
            }
        },
        {
            id: 'fx_passenger_murmur',
            category: 'effect',
            title: 'Freesound Yolcu Doğal Kabin İçi Sohbet & Mırıltı Ambiyansı',
            icon: '👥',
            specs: 'Freesound #260122 Stüdyo Kaydı (CC0 - Kesintisiz Döngü)',
            desc: 'Otobüste yolcu varken arkadan gelen o dertsiz, huzurlu kabin içi sohbet ve mırıltı atmosferi.',
            playFn: () => {
                if (typeof audio !== 'undefined' && audio.sounds && audio.sounds.passengerMurmur) {
                    audio.updatePassengerCabinMurmur(30, true);
                    setTimeout(() => {
                        audio.updatePassengerCabinMurmur(0, false);
                    }, 8000);
                } else {
                    const a = new Audio('sounds/freesound_passenger_murmur_loop.mp3');
                    a.volume = 0.5;
                    a.play().catch(() => {});
                    setTimeout(() => a.pause(), 8000);
                }
            }
        },
        {
            id: 'fx_station_chime',
            category: 'effect',
            title: 'Freesound Otogar Peron Anons Çanı & Melodik Gong',
            icon: '🔔',
            specs: 'Freesound #419491 Stüdyo Kaydı (CC0)',
            desc: 'Otogarda perona yanaşırken ve kalkış öncesi peron hoparlörlerinden çalan 3 tonlu melodik otogar anons çanı.',
            playFn: () => {
                if (typeof audio !== 'undefined' && audio.playStationChime) audio.playStationChime();
                else new Audio('sounds/freesound_station_chime.mp3').play().catch(()=>{});
            }
        },
        {
            id: 'fx_tea_service',
            category: 'effect',
            title: 'Freesound Yol Boyu Çay İkramı & Kaşık Şıngırtısı',
            icon: '☕',
            specs: 'Freesound #657675 & #665189 Stüdyo Kaydı (CC0)',
            desc: 'Muavinin termostan karton bardağa taze çay döküşü ve ardından ince belli bardakta çay kaşığı şıngırtısı.',
            playFn: () => {
                if (typeof audio !== 'undefined' && audio.playFullRefreshmentService) audio.playFullRefreshmentService();
                else {
                    new Audio('sounds/freesound_tea_pour.mp3').play().catch(()=>{});
                    setTimeout(() => new Audio('sounds/freesound_tea_stir.mp3').play().catch(()=>{}), 1800);
                }
            }
        },
        {
            id: 'fx_luggage_suitcase',
            category: 'effect',
            title: 'Freesound Tekerlekli Valiz & Peron Bagaj Yükleme',
            icon: '🧳',
            specs: 'Freesound #423703 HD Kayıt (CC0)',
            desc: 'Yolcuların peronda valiz sürüklemesi ve otobüsün alt bagaj haznesine bavulların yerleştirilme sesi.',
            playFn: () => {
                if (typeof audio !== 'undefined' && audio.playLuggageSuitcase) audio.playLuggageSuitcase();
                else new Audio('sounds/freesound_luggage_suitcase.mp3').play().catch(()=>{});
            }
        },
        {
            id: 'fx_police_siren',
            category: 'effect',
            title: 'Freesound Jandarma / Polis Yol Denetim Sireni',
            icon: '🚨',
            specs: 'Freesound #853022 Stüdyo Kaydı (CC0)',
            desc: 'Şehir girişindeki denetim noktasında veya otoyolda kenara çekme esnasında çalan kısa polis sireni.',
            playFn: () => {
                if (typeof audio !== 'undefined' && audio.playPoliceSiren) audio.playPoliceSiren();
                else new Audio('sounds/freesound_police_siren.mp3').play().catch(()=>{});
            }
        },
        {
            id: 'fx_tachograph_print',
            category: 'effect',
            title: 'Freesound Takograf Termal Kağıt Yazdırma & Çıktı',
            icon: '📄',
            specs: 'Freesound #413838 HD Mekanizma (CC0)',
            desc: 'Polis kontrolünde takograf cihazından sürüş süresi ve hız fişi basıp yırtma sesi.',
            playFn: () => {
                if (typeof audio !== 'undefined' && audio.playTachographPrint) audio.playTachographPrint();
                else new Audio('sounds/freesound_tachograph_print.mp3').play().catch(()=>{});
            }
        },
        {
            id: 'fx_thunderclap',
            category: 'effect',
            title: 'Freesound Gece Fırtınası & Derin Gök Gürültüsü',
            icon: '⛈️',
            specs: 'Freesound #534023 Doğa Kaydı (CC0)',
            desc: 'Yağmurlu gece sürüşlerinde gökyüzünde yankılanan heybetli şimşek ve gök gürültüsü sesi.',
            playFn: () => {
                if (typeof audio !== 'undefined' && audio.playThunderclap) audio.playThunderclap();
                else new Audio('sounds/freesound_thunderclap.mp3').play().catch(()=>{});
            }
        },
        {
            id: 'fx_distant_foghorn',
            category: 'effect',
            title: 'Freesound Boğaz / Köprü Geçişi Vapur Sis Düdüğü',
            icon: '🚢',
            specs: 'Freesound #507471 Deniz Kaydı (CC0)',
            desc: 'Köprülerden geçerken veya Marmara sahili boyunca sisli havada uzaktan gelen nostaljik gemi sis düdüğü.',
            playFn: () => {
                if (typeof audio !== 'undefined' && audio.playDistantFoghorn) audio.playDistantFoghorn();
                else new Audio('sounds/freesound_distant_foghorn.mp3').play().catch(()=>{});
            }
        },
        {
            id: 'fx_radio_squelch',
            category: 'effect',
            title: 'Freesound CB Şoför Telsizi Mandal Bırakma Cızırtısı',
            icon: '📻',
            specs: 'Freesound #524205 Telsiz Kaydı (CC0)',
            desc: 'Şoförler arası telsiz anonsu bittiğinde mandalı bırakırken çıkan o gerçekçi radyo paraziti (squelch).',
            playFn: () => {
                if (typeof audio !== 'undefined' && audio.playRadioSquelchSound) audio.playRadioSquelchSound();
                else new Audio('sounds/freesound_radio_squelch.mp3').play().catch(()=>{});
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
        },
        // --- FREESOUND YOL VE ÇEVRE SESLERİ ---
        {
            id: 'road_asphalt',
            category: 'effect',
            title: 'Freesound Asfalt Yol & Kabin Lastik Yuvarlanması',
            icon: '🛣️',
            specs: 'Freesound #566284 Orijinal Pürüzsüz Asfalt Sürüş Kaydı',
            desc: 'Otobüs asfalt yolda seyrederken kabin içine gelen pürüzsüz ve gerçekçi lastik yuvarlanma sesi.',
            is10Seconds: true,
            playFn: () => {
                if (typeof audio !== 'undefined' && audio.sounds && audio.sounds.roadAsphalt) {
                    audio.sounds.roadAsphalt.volume(0.65);
                    audio.sounds.roadAsphalt.rate(1.0);
                    audio.sounds.roadAsphalt.play();
                }
            }
        },
                {
            id: 'bus_cabin_ambience',
            category: 'effect',
            title: 'Freesound Otobüs İçi Yolcu & Kabin Ambiyansı',
            icon: '👥',
            specs: 'Freesound #379370 Orijinal Otobüs Yolcu Kabin Kaydı',
            desc: 'Otobüs seyir halindeyken içeride oluşan gerçekçi yolcu hareketleri, hafif uğultu ve doğal kabin atmosferi.',
            is10Seconds: true,
            playFn: () => {
                if (typeof audio !== 'undefined' && audio.sounds && audio.sounds.cabinAmbience) {
                    audio.sounds.cabinAmbience.volume(0.65);
                    audio.sounds.cabinAmbience.play();
                }
            }
        },
        {
            id: 'city_ambience',
            category: 'effect',
            title: 'Freesound Sakin Şehir & Mahalle Çevre Ambiyansı',
            icon: '🌳',
            specs: 'Freesound #135074 Orijinal Şehir & Kuş Cıvıltısı Kaydı',
            desc: 'Otobüs durakta beklerken veya şehir içinde sakince ilerlerken dışarıdan gelen huzurlu kuş sesleri, hafif esinti ve sakin cadde atmosferi.',
            is10Seconds: true,
            playFn: () => {
                if (typeof audio !== 'undefined' && audio.sounds && audio.sounds.cityAmbience) {
                    audio.sounds.cityAmbience.volume(0.65);
                    audio.sounds.cityAmbience.play();
                }
            }
        },
        {
            id: 'road_gravel',
            category: 'effect',
            title: 'Freesound Çakıllı Yol Sürüşü',
            icon: '🪨',
            specs: 'Freesound #251662 Orijinal Çakıl Zemin Lastik Kaydı',
            desc: 'Otobüsün çakıllı ve taşlı yollarda ilerlerken lastiklerin altından gelen çıtır çıtır çakıl ezilme sesi.',
            is10Seconds: true,
            playFn: () => {
                if (typeof audio !== 'undefined' && audio.sounds && audio.sounds.roadGravel) {
                    audio.sounds.roadGravel.volume(0.70);
                    audio.sounds.roadGravel.rate(1.0);
                    audio.sounds.roadGravel.play();
                }
            }
        },
        {
            id: 'road_sand_dirt',
            category: 'effect',
            title: 'Freesound Kumlu ve Toprak Yol Sürüşü',
            icon: '🏜️',
            specs: 'Freesound #637192 Orijinal Toprak Yol Kabin Kaydı',
            desc: 'Kumlu, gevşek zeminlerde ve toprak yollarda tekerleklerin çıkardığı yumuşak ve hışırtılı sürüş sesi.',
            is10Seconds: true,
            playFn: () => {
                if (typeof audio !== 'undefined' && audio.sounds && audio.sounds.roadGravelAsphalt) {
                    audio.sounds.roadGravelAsphalt.volume(0.70);
                    audio.sounds.roadGravelAsphalt.rate(1.0);
                    audio.sounds.roadGravelAsphalt.play();
                }
            }
        },
        {
            id: 'tire_screech',
            category: 'effect',
            title: 'Freesound Gerçek Lastik Kayma & Savrulma',
            icon: '🛑',
            specs: 'Freesound #271337 Orijinal Lastik Kayma Kaydı',
            desc: 'Sert fren yapıldığında veya virajlarda tekerleklerin asfaltta çıkardığı gerçek sürtünme sesi.',
            playFn: () => {
                if (typeof audio !== 'undefined' && audio.playTireScreech) {
                    audio.playTireScreech(1.0);
                }
            }
        },
        {
            id: 'snow_tires',
            category: 'effect',
            title: 'Freesound Karda Sürüş & Kar Ezilme Sesi',
            icon: '❄️',
            specs: 'Freesound #71099 Orijinal Kar Zemin Lastik Kaydı',
            desc: 'Karlı havalarda lastiklerin altındaki taze karın ezilmesiyle oluşan çıtır çıtır kış sürüşü sesi.',
            is10Seconds: true,
            playFn: () => {
                if (typeof audio !== 'undefined' && audio.sounds && audio.sounds.snowTires) {
                    audio.sounds.snowTires.volume(0.70);
                    audio.sounds.snowTires.play();
                }
            }
        },
        {
            id: 'road_wind',
            category: 'effect',
            title: 'Freesound Doğal Çevre Rüzgar Esintisi',
            icon: '💨',
            specs: 'Freesound #697217 Orijinal Doğal Rüzgar Esintisi Kaydı',
            desc: 'Hızlandıkça kabin etrafında esen aerodinamik rüzgar sesi ve sürücü penceresi açıldığında içeri dolan canlı hava akımı.',
            is10Seconds: true,
            playFn: () => {
                if (typeof audio !== 'undefined' && audio.sounds && audio.sounds.roadWind) {
                    audio.sounds.roadWind.volume(0.65);
                    audio.sounds.roadWind.rate(1.0);
                    audio.sounds.roadWind.play();
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
        const tabAkbil = document.getElementById('tab-sound-akbil');
        const tabFx = document.getElementById('tab-sound-fx');

        if (tabAll) tabAll.addEventListener('click', () => this.switchTab('all'));
        if (tabEngine) tabEngine.addEventListener('click', () => this.switchTab('engine'));
        if (tabAkbil) tabAkbil.addEventListener('click', () => this.switchTab('akbil'));
        if (tabFx) tabFx.addEventListener('click', () => this.switchTab('effect'));

        // Klavye Kısayolları: [S] ile Açma, [Boşluk] ile Çal/Durdur, [ESC] ile Kapatma
        window.addEventListener('keydown', (e) => {
            const modal = document.getElementById('sound-gallery-modal');
            const isModalOpen = (modal && !modal.classList.contains('hidden'));

            // Galeri açıkken Boşluk (Space) tuşu ile odaklanılan sesi başlat veya durdur
            if (isModalOpen && (e.key === ' ' || e.code === 'Space')) {
                const activeEl = document.activeElement;
                if (activeEl && activeEl.id && activeEl.id.startsWith('btn-sound-')) {
                    e.preventDefault();
                    e.stopPropagation();
                    activeEl.click();
                    return;
                }
                // Odak bir ses butonunda olmasa dahi çalan ses varsa Boşluk ile durdur
                if (this.currentlyPlayingId) {
                    e.preventDefault();
                    e.stopPropagation();
                    this.stopCurrentSound(true);
                    return;
                }
            }

            const activeTag = document.activeElement ? document.activeElement.tagName.toLowerCase() : '';
            if (activeTag === 'input' || activeTag === 'textarea' || activeTag === 'select') return;

            if (e.key === 's' || e.key === 'S') {
                const titleScreen = document.getElementById('title-screen');
                if (titleScreen && !titleScreen.classList.contains('hidden')) {
                    if (modal && modal.classList.contains('hidden')) {
                        e.preventDefault();
                        this.openModal();
                    }
                }
            } else if (e.key === 'Escape') {
                if (isModalOpen) {
                    e.preventDefault();
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
            if (audio.ctx && audio.ctx.state === 'suspended') audio.ctx.resume().catch(() => {});
        }

        // Dinamik sekme sayılarını güncelle
        const countAll = this.sounds.length;
        const countEngine = this.sounds.filter(s => s.category === 'engine').length;
        const countAkbil = this.sounds.filter(s => s.category === 'akbil').length;
        const countFx = this.sounds.filter(s => s.category === 'effect').length;
        const elAll = document.getElementById('tab-sound-all');
        if (elAll) elAll.innerHTML = `📋 Tüm Sesler (${countAll})`;
        const elEngine = document.getElementById('tab-sound-engine');
        if (elEngine) elEngine.innerHTML = `🚌 Motor Sesleri (${countEngine} Ses - 10 Sn)`;
        const elAkbil = document.getElementById('tab-sound-akbil');
        if (elAkbil) elAkbil.innerHTML = `💳 Akbil & Validatör (${countAkbil})`;
        const elFx = document.getElementById('tab-sound-fx');
        if (elFx) elFx.innerHTML = `💨 Havalı Fren & Çevre (${countFx})`;

        this.renderModal(this.currentTab);

        const welcomeText = "Sesleri Göster galerisi açıldı. 7 farklı otobüs grubunun rölanti motor seslerini 10 saniye boyunca dinleyebilir veya akbil ve mekanik efektleri test edebilirsiniz.";
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
        if (typeof KeyboardNav !== "undefined" && KeyboardNav.initForScreen) {
            KeyboardNav.initForScreen();
        }
    },


    updatePlayingUI: function(activeId) {
        this.sounds.forEach(s => {
            const btn = document.getElementById("btn-sound-" + s.id);
            if (!btn) return;
            const isPlaying = (s.id === activeId);
            btn.style.border = isPlaying ? '2.5px solid #a855f7' : '1px solid rgba(255,255,255,0.15)';
            btn.style.background = isPlaying ? 'rgba(168, 85, 247, 0.25)' : 'rgba(15, 23, 42, 0.7)';
            
            const badgeContainer = document.getElementById('badge-container-' + s.id);
            if (badgeContainer) {
                if (isPlaying) {
                    badgeContainer.innerHTML = '<span id="badge-countdown-' + s.id + '" style="background: linear-gradient(135deg, #a855f7, #7e22ce); color: #fff; font-weight: bold; padding: 6px 12px; border-radius: 20px; font-size: 0.95rem; animation: pulse 1s infinite;">' +
                        '🔊 ÇALIYOR (' + this.remainingSeconds + ' sn) [Durdurmak İçin Boşluk]</span>';
                } else {
                    badgeContainer.innerHTML = s.category === 'engine'
                        ? '<span style="background: rgba(168,85,247,0.25); color: #e9d5ff; font-weight: bold; padding: 5px 12px; border-radius: 20px; font-size: 0.88rem;">▶️ 10 Saniye Dinle</span>'
                        : '<span style="background: rgba(56,189,248,0.2); color: #7dd3fc; font-weight: bold; padding: 5px 12px; border-radius: 20px; font-size: 0.88rem;">▶️ Efekti Çal</span>';
                }
            }

            const actionTip = isPlaying 
                ? 'Şu anda çalıyor. Durdurmak için Boşluk veya Enter tuşuna basın.' 
                : (s.category === 'engine' ? '10 saniye boyunca dinlemek için Boşluk veya Enter tuşuna basın.' : 'Efekti dinlemek için Boşluk veya Enter tuşuna basın.');
            const ariaLabel = s.title + '. ' + s.specs + '. ' + s.desc + '. ' + actionTip;
            btn.setAttribute('aria-label', ariaLabel);
        });
    },
    renderModal: function(tab = 'all') {
        const listEl = document.getElementById('sound-gallery-list');
        if (!listEl) return;
        listEl.innerHTML = '';

        const filtered = this.sounds.filter(s => {
            if (tab === 'engine') return s.category === 'engine';
            if (tab === 'akbil') return s.category === 'akbil';
            if (tab === 'effect') return s.category === 'effect';
            return true;
        });

        filtered.forEach(s => {
            const li = document.createElement('li');
            li.style.marginBottom = "12px";

            const isPlaying = this.currentlyPlayingId === s.id;

            const btn = document.createElement('button');
            btn.className = 'menu-btn nav-item';
            btn.id = "btn-sound-" + s.id;
            btn.style.width = '100%';
            btn.style.flexDirection = 'column';
            btn.style.alignItems = 'stretch';
            btn.style.textAlign = 'left';
            btn.style.padding = '14px 18px';
            btn.style.border = isPlaying ? '2.5px solid #a855f7' : '1px solid rgba(255,255,255,0.15)';
            btn.style.background = isPlaying ? 'rgba(168, 85, 247, 0.22)' : 'rgba(15, 23, 42, 0.7)';
            btn.style.borderRadius = '10px';
            btn.style.transition = 'all 0.2s ease';

            let categoryTag = '';
            if (s.category === 'engine') {
                categoryTag = '<span style="color: #c084fc; font-size: 0.85rem; font-weight: bold; background: rgba(168,85,247,0.2); padding: 3px 8px; border-radius: 4px;">⏱️ ' + (s.soundGroup || 'Motor Rölantisi') + '</span>';
            } else if (s.category === 'akbil') {
                categoryTag = '<span style="color: #38bdf8; font-size: 0.85rem; font-weight: bold; background: rgba(56,189,248,0.2); padding: 3px 8px; border-radius: 4px;">💳 Akbil & Kart Okuyucu</span>';
            } else {
                categoryTag = '<span style="color: #34d399; font-size: 0.85rem; font-weight: bold; background: rgba(16,185,129,0.2); padding: 3px 8px; border-radius: 4px;">💨 Havalı & Mekanik Efekt</span>';
            }

            let playBadge = '';
            if (isPlaying) {
                playBadge = '<span id="badge-countdown-' + s.id + '" style="background: linear-gradient(135deg, #a855f7, #7e22ce); color: #fff; font-weight: bold; padding: 6px 12px; border-radius: 20px; font-size: 0.95rem; animation: pulse 1s infinite;">' +
                    '🔊 ÇALIYOR (' + this.remainingSeconds + ' sn)</span>';
            } else {
                playBadge = s.category === 'engine'
                    ? '<span style="background: rgba(168,85,247,0.25); color: #e9d5ff; font-weight: bold; padding: 5px 12px; border-radius: 20px; font-size: 0.88rem;">▶️ 10 Saniye Dinle</span>'
                    : '<span style="background: rgba(56,189,248,0.2); color: #7dd3fc; font-weight: bold; padding: 5px 12px; border-radius: 20px; font-size: 0.88rem;">▶️ Efekti Çal</span>';
            }

            const ariaAction = isPlaying 
                ? 'Şu anda çalıyor. Durdurmak için Boşluk veya Enter tuşuna basın.' 
                : (s.category === 'engine' ? '10 saniye boyunca dinlemek için Boşluk veya Enter tuşuna basın.' : 'Efekti dinlemek için Boşluk veya Enter tuşuna basın.');
            const ariaLabel = s.title + '. ' + s.specs + '. ' + s.desc + '. ' + ariaAction;
            btn.setAttribute('aria-label', ariaLabel);

            btn.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; flex-wrap: wrap; gap: 8px;">
                    <div>
                        <span style="font-size: 1.2rem; font-weight: bold; color: #fff;">
                            ${s.icon} ${s.title}
                        </span>
                        <div style="margin-top: 4px;">${categoryTag}</div>
                    </div>
                    <div id="badge-container-${s.id}">${playBadge}</div>
                </div>
                <div style="font-size: 0.92rem; color: #cbd5e1; margin-bottom: 4px;">
                    ⚙️ <strong>Özellikler:</strong> <span style="color: #facc15;">${s.specs}</span>
                </div>
                <div style="font-size: 0.88rem; color: #94a3b8; line-height: 1.4;">
                    💡 ${s.desc}
                </div>
            `;

            btn.onclick = () => {
                if (this.currentlyPlayingId === s.id) {
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
        this.stopCurrentSound(false);

        this.currentlyPlayingId = s.id;
        const statusBanner = document.getElementById('sound-gallery-current-status');
        const statusText = document.getElementById('sound-gallery-status-text');

        if (s.category === 'engine') {
            this.playEngineFor10Seconds(s);
        } else if (s.is10Seconds) {
            this.play10SecondEffect(s);
        } else {
            if (statusBanner && statusText) {
                statusBanner.style.display = 'flex';
                statusText.innerText = '▶️ Çalıyor: ' + s.title;
            }
            if (typeof audio !== 'undefined' && audio.speak) {
                audio.speak(s.title + ' çalınıyor.');
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
        if (statusText) statusText.innerText = '▶️ 10 Saniye Motor Dinleniyor: ' + s.title;
        if (countdownEl) countdownEl.innerText = '10';

        const speechNotice = s.title + ' motor sesi 10 saniye boyunca dinletiliyor.';
        if (typeof audio !== 'undefined' && audio.speak) {
            audio.speak(speechNotice);
        }
        if (typeof audio !== 'undefined' && audio.updateNvdaLiveRegion) {
            audio.updateNvdaLiveRegion(speechNotice);
        }

        try {
            const ctx = (typeof audio !== 'undefined' && audio.ctx) ? audio.ctx : (Howler.ctx || new (window.AudioContext || window.webkitAudioContext)());
            if (ctx.state === 'suspended') ctx.resume().catch(() => {});

            let targetBuffer = null;
            if (typeof audio !== 'undefined') {
                if (audio.groupBuffers && audio.groupBuffers[s.type]) {
                    targetBuffer = audio.groupBuffers[s.type];
                } else if (s.type === 'pure_v6') {
                    targetBuffer = audio.pureIdleBuffer || audio.idleBuffer;
                } else if (s.type === 'coach_terminal') {
                    targetBuffer = audio.coachTerminalIdleBuffer || audio.pureIdleBuffer || audio.idleBuffer;
                } else if (s.type === 'v8_bass') {
                    targetBuffer = audio.bassIdleBuffer || audio.pureIdleBuffer || audio.idleBuffer;
                } else {
                    targetBuffer = audio.cityIdleBuffer || audio.pureIdleBuffer || audio.idleBuffer;
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
                gain.gain.linearRampToValueAtTime(1.0, ctx.currentTime + 0.15);

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
                this.currentHtmlAudio = new Audio(s.file || 'sounds/freesound_pure_bus_idle.mp3');
                this.currentHtmlAudio.loop = true;
                this.currentHtmlAudio.play().catch(() => {});
            }
        } catch (e) {
            console.error("Motor sesi başlatılırken hata:", e);
        }

        this.updatePlayingUI(s.id);

        this.countdownInterval = setInterval(() => {
            this.remainingSeconds--;
            if (countdownEl) countdownEl.innerText = this.remainingSeconds;
            
            const badge = document.getElementById('badge-countdown-' + s.id);
            if (badge) {
                badge.innerText = '🔊 ÇALIYOR (' + this.remainingSeconds + ' sn)';
            }

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
        if (statusText) statusText.innerText = '▶️ 10 Saniye Dinleniyor: ' + s.title;
        if (countdownEl) countdownEl.innerText = '10';

        if (typeof s.playFn === 'function') {
            s.playFn();
        }

        this.updatePlayingUI(s.id);

        this.countdownInterval = setInterval(() => {
            this.remainingSeconds--;
            if (countdownEl) countdownEl.innerText = this.remainingSeconds;
            const badge = document.getElementById('badge-countdown-' + s.id);
            if (badge) badge.innerText = '🔊 ÇALIYOR (' + this.remainingSeconds + ' sn)';

            if (this.remainingSeconds <= 0) {
                this.finish10Seconds(s);
            }
        }, 1000);
    },

    finish10Seconds: function(s) {
        this.stopCurrentSound(false);

        const doneMessage = s.title + ' 10 saniyelik dinleme tamamlandı.';
        if (typeof audio !== 'undefined' && audio.speak) {
            audio.speak(doneMessage);
        }
        if (typeof audio !== 'undefined' && audio.updateNvdaLiveRegion) {
            audio.updateNvdaLiveRegion(doneMessage);
        }

        const statusText = document.getElementById('sound-gallery-status-text');
        if (statusText) {
            statusText.innerText = '✅ ' + s.title + ' 10 saniyelik dinleme bitti.';
        }

        setTimeout(() => {
            const statusBanner = document.getElementById('sound-gallery-current-status');
            if (statusBanner && !this.currentlyPlayingId) {
                statusBanner.style.display = 'none';
            }
        }, 3000);

        this.updatePlayingUI(null);
    },

    stopCurrentSound: function(notify = true) {
        if (this.countdownInterval) {
            clearInterval(this.countdownInterval);
            this.countdownInterval = null;
        }

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
        if (typeof audio !== 'undefined' && audio.stopAllRoadSounds) {
            try { audio.stopAllRoadSounds(); } catch(e){}
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

        this.updatePlayingUI(null);
    }
};

if (typeof window !== 'undefined') {
    window.SoundGallery = SoundGallery;
    document.addEventListener('DOMContentLoaded', () => {
        SoundGallery.init();
    });
}
