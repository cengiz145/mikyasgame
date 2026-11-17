/* ==========================================================================
   MİKYAS YAŞAYAN İNSAN & AKILLI NPC SES MOTORU (HUMAN-NPC-VOICES.JS)
   ElevenLabs v4 Türkçe Stüdyo Dublajı + Özel Ses Efektleri + 3B Yönlü Ses
   12 Farklı Gerçek İnsan Karakteri • Hafızalı Yolcu Sabır Sistemi • Sıfır Argo
   ========================================================================== */

(function (window) {
    'use strict';

    const BASE_PATH = 'sounds/npc_human/';

    const CLIPS = {
        // Özel Ses Efektleri (ElevenLabs Sound Generation)
        sfxGasp: 'sfx_cabin_gasp.mp3',
        sfxHorn: 'sfx_angry_car_horn.mp3',
        sfxScrape: 'sfx_fender_scrape.mp3',

        // Merkez Filo Amiri (Telsiz Dispeçer - Uğur Işık)
        dispatch: ['dispatch_01.mp3', 'dispatch_02.mp3', 'dispatch_03.mp3', 'dispatch_04.mp3'],
        dispatchCrash: 'dispatch_crash.mp3',

        // Kanal 19 Karşı Şerit Usta Kaptan (Erol Tüm)
        ch19: [
            { file: 'ch19_01.mp3', text: 'Karşı şeritteki kaptanım selamlar! Bolu Dağı tünel çıkışında yoğun sis var, hızını 70\'e düşür, kazasız belasız hayırlı işler!' },
            { file: 'ch19_02.mp3', text: '59 plakalı meslektaşım dinlemede misin? İleride sağ şeritte yol çalışması var, sol şeritten akıp git, tekerine taş değmesin!' },
            { file: 'ch19_03.mp3', text: 'Aleykümselam usta kaptanım! Yol tertemiz, radar da yok, 19. kanaldan tüm şoför kardeşlerime hayırlı nöbetler!' },
            { file: 'ch19_04.mp3', text: 'Kaptanım hayırlı yolculuklar! Susurluk tesislerine yaklaşıyorsan tostu ve köpüklü ayranı yeni çıktı, bir mola ver nefeslen!' }
        ],

        // Bölge Trafik Polisi (Atakan)
        policeClean: 'police_clean.mp3',
        policeFine: 'police_fine.mp3',

        // Dış Trafik & Yaya Çarpışma / Tehlike Tepkileri (3B Sağ/Sol Yönlü)
        crashLeft: [
            { file: 'npc_crash_left_01.mp3', label: 'Sol Şerit Sürücüsü: "Hooop kaptan! Sol aynaya hiç mi bakmıyorsun?! Boydan boya çizdin güzelim arabayı!"' },
            { file: 'npc_crash_left_02.mp3', label: 'Sol Şerit Sürücüsü: "Yuh artık kaptan bey! Koca otobüsü sol şeride üstümüze kırdın!"' }
        ],
        crashRight: [
            { file: 'npc_crash_right_01.mp3', label: 'Sağ Şerit Taksicisi: "Hoop! Sağ şeritte taksi var görmüyor musun, çamurluğu dağıttın!"' },
            { file: 'npc_pedestrian_right_01.mp3', label: 'Kaldırımdaki Yaya: "Ayyy! Dikkat etsene be kardeşim, kaldırıma çıkacaksın, az kalsın eziliyorduk!"' }
        ],
        crashFront: [
            { file: 'npc_crash_front_01.mp3', label: 'Öndeki Sürücü: "Eyvaaah! Frenin mi patladı kaptan?! Dümdüz tampona girdin!"' }
        ],
        nearMiss: [
            { file: 'npc_nearmiss_01.mp3', label: 'Yan Şerit Sürücüsü: "Yavaş geç be kaptan! Rüzgarından savrulduk!"' },
            { file: 'npc_nearmiss_f1.mp3', label: 'Yaya / Sürücü: "Ayy! Ne kadar yakın geçtin öyle kaptan, aynan çarpacaktı neredeyse!"' }
        ],
        redLight: [
            { file: 'npc_pedestrian_redlight.mp3', label: 'Yaya Geçidindeki Vatandaş: "Ayy! Kırmızı ışıkta geçilir mi kaptan?! Yaya geçidindeyiz!"' },
            { file: 'npc_redlight_01.mp3', label: 'Kavşaktaki Sürücü: "Hooop! Kırmızı yanıyor kaptan, az kalsın kavşakta biçiyordun bizi!"' }
        ],

        // Kabin İçi Kaza Panik & Korku Çığlıkları
        cabinPanic: ['panic_scream_f1.mp3', 'panic_scream_f2.mp3', 'kid_crash.mp3'],

        // Kademeli Yolcu Sabır & Hafıza Tepkileri (1: Kibar Uyarı, 2: Sitem, 3: Küfürsüz Öfke)
        patienceMild: [
            { file: 'warn_mild_01.mp3', label: 'Tonton Teyze: "Aman kaptan evladım, biraz yumuşak bas şu frene, dizlerim ağrıyor tutunamıyorum."' },
            { file: 'warn_mild_02.mp3', label: 'Yolcu Hanım: "Kaptan bey, kasislere biraz daha yavaş girerseniz çok seviniriz, sarsıldık arkada."' },
            { file: 'kid_bump_01.mp3', label: 'Çocuk Yolcu: "Hoop! Anne sıkı tutun, kaptan bizi uçuracak galiba!"' },
            { file: 'warn_mild_03.mp3', label: 'Pazar Arabalı Teyze: "Ayy domateslerim ezilecek poşette kaptan oğlum, azıcık yavaş gir şu çukurlara!"' },
            { file: 'warn_mild_04.mp3', label: 'Öğrenci Genç Kız: "Hoop! Telefon elimden uçuyordu az kalsın kaptan abi, ne fren yaptın be!"' }
        ],
        patienceMedium: [
            { file: 'warn_medium_01.mp3', label: 'Emekli Amca: "Yeter ama kaptan bey! Az önce de sarsıldık, çuval mı taşıyorsun insan mı taşıyorsun?!"' },
            { file: 'warn_medium_02.mp3', label: 'Yolcu Hanım: "Kaptan bey lütfen dikkat edin artık, üst üste ani fren yapıyorsunuz, ayaktaki yolcular düşecek!"' },
            { file: 'warn_medium_03.mp3', label: 'Takım Elbiseli Yolcu: "Kaptan bey gömleğime kahve döküldü sarsıntıdan, biraz daha özenli kullanalım lütfen!"' },
            { file: 'warn_medium_04.mp3', label: 'Bebekli Anne: "Kaptan bey rica ediyorum sarsmayın bu kadar, bebek ağlayacak şimdi arkada!"' }
        ],
        patienceAngry: [
            { file: 'warn_angry_01.mp3', label: 'Tansiyonlu Teyze: "İndir beni ilk durakta kaptan! Bu ne biçim araba kullanmak böyle, tansiyonum fırladı valla!"' },
            { file: 'warn_angry_02.mp3', label: 'Sinirli Amca: "Kaptan yavaş sür şu otobüsü! Her çukura kasise küt küt giriyorsun, sabrımız taştı artık!"' },
            { file: 'warn_angry_03.mp3', label: 'Öfkeli Yolcu: "Beyaz Masayı arayıp plakanı vereceğim şimdi kaptan! Lunapark mı burası, savura savura götürüyorsun bizi!"' },
            { file: 'warn_angry_04.mp3', label: 'Öfkeli Teyze: "Tövbe estağfurullah! Evladım bu ne sert sürüş böyle, yüreğimiz ağzımıza geldi kaçıncı sarsıntı bu!"' }
        ],

        // Sert Viraj, Aşırı Hız, Uzun Bekleme, Korna Sitemi, Usta Sürüş Övgüsü & Doğal Kabin Sohbetleri
        curvePanic: [
            { file: 'curve_panic_f1.mp3', label: 'Teyze: "Ayyy savrulduk! Kaptan evladım viraja bu hızla girilir mi, devrileceğiz şimdi!"' },
            { file: 'curve_panic_m1.mp3', label: 'Emekli Amca: "Hooop tutunun millet! Kaptan ralli mi yapıyorsun, virajda yan yattı koca otobüs!"' },
            { file: 'curve_kid_01.mp3', label: 'Çocuk Yolcu: "Uuuu! Lunapark treni gibi yana yattık anneee!"' }
        ],
        curveMurmur: { file: 'curve_murmur_f1.mp3', label: 'Yolcu Hanım: "Üff başım döndü valla, virajlara biraz daha tatlı girsek keşke kaptan bey."' },
        stopBell: [
            { file: 'stop_bell_01.mp3', label: 'Tonton Teyze: "Kaptan evladım, müsait bir yerde durakta indirebilir misin zahmet olmazsa?"' },
            { file: 'stop_bell_02.mp3', label: 'Emekli Amca: "Kaptan usta, gelecek durakta ineceğiz inşallah, arka kapıyı unutma!"' },
            { file: 'stop_bell_03.mp3', label: 'Öğrenci Kız: "Kaptan abi, gelecek durakta inecek var!"' }
        ],
        stopBellFinal: { file: 'stop_bell_final.mp3', label: 'Yolcu Hanım: "Son durağa geldik çok şükür, elinize sağlık kaptan bey!"' },
        alightThanks: [
            { file: 'alight_thank_01.mp3', label: 'İnen Teyze: "Ellerine kollarına sağlık kaptan evladım, Allah kaza bela vermesin, hayırlı işler!"' },
            { file: 'alight_thank_02.mp3', label: 'İnen Amca: "Kazasız belasız hayırlı nöbetler kaptan usta, kolay gelsin!"' },
            { file: 'alight_thank_03.mp3', label: 'İnen Öğrenci: "Çok teşekkürler kaptan abi, iyi günler kolay gelsin!"' }
        ],
        alightAngry: { file: 'alight_angry_01.mp3', label: 'Sitemli İnen Yolcu: "Oh be nihayet indik, içimiz dışımıza çıktı valla kaptan!"' },
        waitLong: [
            { file: 'wait_long_01.mp3', label: 'Sabırsız Yolcu: "Of ya, ne bitmez trafikmiş arkadaş! Kaptan bey önümüzde yol mu tıkandı, niye kıpırdamıyoruz?"' },
            { file: 'wait_long_02.mp3', label: 'Öğrenci Kız: "Eyvah derse geç kaldık yine, saat kaç oldu hâlâ kıpırdamadık!"' },
            { file: 'wait_long_03.mp3', label: 'Tonton Teyze: "Sabır çekin evladım sabır, uçacak hali yok ya şoförün, açılır şimdi yol!"' }
        ],
        overspeed: [
            { file: 'overspeed_01.mp3', label: 'Korkan Yolcu: "Kaptan bey biraz yavaş mı gitsek acaba? İbre doksanı geçti, korkuyoruz arkada!"' },
            { file: 'overspeed_02.mp3', label: 'Emekli Amca: "Aman kaptan usta, acelemiz yok, geç olsun güç olmasın, ayağını gazdan biraz çek gözünü seveyim!"' },
            { file: 'overspeed_kid.mp3', label: 'Heyecanlı Çocuk: "Vaaay baba bak, otobüs yarış arabası gibi gidiyor vıııınn!"' }
        ],
        hornSpam: [
            { file: 'horn_spam_01.mp3', label: 'Emekli Amca: "Kaptan usta kulağımızın pası silindi valla, düğün konvoyunda mıyız, basma şu kornaya bu kadar!"' },
            { file: 'horn_spam_02.mp3', label: 'Bebekli Anne: "Şşşt kaptan bey rica ediyorum, kucağımda bebek uyuyor, kornayla sıçrattınız çocuğu!"' }
        ],
        smoothPraise: [
            { file: 'praise_smooth_01.mp3', label: 'Usta Şoför Amca: "Maşallah kaptan kardeşime be! Vites geçişleri, frenaj pamuk gibi, kırk yıllık usta şoförsün valla!"' },
            { file: 'praise_smooth_02.mp3', label: 'Tonton Teyze: "Çay bardağını konsola koysan bir damla dökülmez valla, pamuk gibi sürüyorsun evladım!"' },
            { file: 'praise_smooth_03.mp3', label: 'Genç Yolcu: "Valla helal olsun kaptan abi, arkada mışıl mışıl dinlendik, sürüşün on numara!"' }
        ],
        ambientSlice: [
            { file: 'ambient_phone_01.mp3', pan: -0.35, label: 'Arka Koltuk (Telefon): "Alo hanım, otobüsteyim şimdi, on dakikaya merkezde inerim, sıcak ekmek de alırım gelirken..."' },
            { file: 'ambient_phone_f1.mp3', pan: 0.35, label: 'Öğrenci Sohbeti: "Kanka bindim otobüse geliyorum, kantinde çayı söyle sen, beş dakikaya kampüsteyim!"' },
            { file: 'ambient_seat_offer.mp3', pan: -0.25, label: 'Kibar Genç: "Buyur teyzeciğim sen şöyle cam kenarına otur, ben ayakta giderim hiç sorun değil."' },
            { file: 'ambient_kid_question.mp3', pan: 0.25, label: 'Meraklı Çocuk: "Anne bak! Kaptan amcanın önünde ne kadar çok ışıklı düğme var, ben de büyüyünce otobüs kaptanı olacağım!"' },
            { file: 'ambient_route_ask.mp3', pan: 0.3, label: 'Yolcu Sorusu: "Pardon kaptan abi, bu araç merkez durağından geçiyor mu acaba?"' }
        ],

        // Durak, Kapı, Rampa, Bakiye ve İkram Etkileşimleri
        greetings: {
            yasli: ['teyze_greet.mp3', 'amca_greet.mp3', 'greet_amca_02.mp3'],
            ogrenci: ['student_greet_01.mp3', 'greet_student_02.mp3'],
            tam: ['tam_greet_m1.mp3', 'tam_greet_f1.mp3']
        },
        greetMorning: 'greet_morning_01.mp3',
        greetEvening: 'greet_evening_01.mp3',
        standing: ['young_standing.mp3', 'standing_02.mp3', 'standing_03.mp3'],
        rearDoorRemind: 'amca_reardoor.mp3',
        acRequest: 'ac_request.mp3',
        rampThank: 'teyze_ramp_thank.mp3',
        runnerWait: 'runner_wait.mp3',
        runnerBoarded: 'runner_boarded.mp3',
        runnerMissed: 'runner_missed.mp3',
        studentNoBalance: 'student_no_balance.mp3',
        studentThankFree: 'student_thank_free.mp3',
        studentSadOff: 'student_sad_off.mp3',
        muavinCologne: 'muavin_cologne.mp3',
        cologneReplies: [
            { file: 'teyze_cologne.mp3', text: 'Sağ olasın evladım, limon kolonyası da pek güzel ferahlattı içimizi.' },
            { file: 'amca_cologne.mp3', text: 'Eyvallah kaptanım, hem sürüşün rahatladı hem kolonya iyi geldi, sağ olasın.' },
            { file: 'kid_cologne.mp3', text: 'Vaaay limon kolonyası! Mis gibi koktu kaptan amca, sağ ol!' }
        ]
    };

    const HumanNpcVoices = {
        howlCache: {},
        activeHowl: null,
        angerLevel: 0,
        lastJoltVoiceTime: 0,
        lastNearMissTime: 0,
        lastGreetingStopIndex: -1,
        greetingsAtCurrentStop: 0,
        lastAcRemindTime: 0,
        ch19Index: 0,

        isEnabled: function () {
            try {
                return localStorage.getItem('mikyas_human_npc_enabled') !== 'false';
            } catch (e) {
                return true;
            }
        },

        setEnabled: function (val) {
            try {
                localStorage.setItem('mikyas_human_npc_enabled', val ? 'true' : 'false');
            } catch (e) {}
        },

        toggleEnabled: function () {
            const next = !this.isEnabled();
            this.setEnabled(next);
            if (!next) this.stopAll();
            return next;
        },

        getVolume: function (mult = 1.0) {
            const base = (typeof audio !== 'undefined' && typeof audio.gameSoundVolume === 'number')
                ? audio.gameSoundVolume
                : 1.0;
            return Math.max(0, Math.min(1.0, base * mult));
        },

        canSpeakInCabin: function (forceAllow = false) {
            if (!this.isEnabled()) return false;
            if (forceAllow) return true;
            if (typeof audio !== 'undefined' && typeof audio.isInBusCabin === 'function') {
                return audio.isInBusCabin();
            }
            return true;
        },

        getHowl: function (filename) {
            if (!this.howlCache[filename] && typeof Howl !== 'undefined') {
                this.howlCache[filename] = new Howl({
                    src: [BASE_PATH + filename],
                    preload: true
                });
            }
            return this.howlCache[filename] || null;
        },

        stopAll: function () {
            if (this.activeHowl) {
                try { this.activeHowl.stop(); } catch (e) {}
                this.activeHowl = null;
            }
        },

        playClip: function (filename, opts = {}) {
            if (!filename) return null;
            const force = !!opts.force;
            if (!this.canSpeakInCabin(force)) {
                if (typeof opts.onend === 'function') opts.onend();
                return null;
            }

            const pan = typeof opts.pan === 'number' ? Math.max(-1, Math.min(1, opts.pan)) : 0;
            const vol = this.getVolume(typeof opts.volume === 'number' ? opts.volume : 0.95);
            if (vol <= 0.01) {
                if (typeof opts.onend === 'function') opts.onend();
                return null;
            }

            if (opts.interrupt && this.activeHowl) {
                try { this.activeHowl.stop(); } catch (e) {}
            }

            if (opts.nvdaText && typeof audio !== 'undefined' && typeof audio.updateNvdaLiveRegion === 'function') {
                audio.updateNvdaLiveRegion(opts.nvdaText);
            }
            if (opts.toastText && typeof UI !== 'undefined' && typeof UI.showToast === 'function') {
                UI.showToast(opts.toastText, opts.toastType || 'info');
            }

            const h = this.getHowl(filename);
            if (h) {
                const sid = h.play();
                h.volume(vol, sid);
                if (typeof h.stereo === 'function' && pan !== 0) {
                    h.stereo(pan, sid);
                }
                if (!opts.backgroundSfx) {
                    this.activeHowl = h;
                }
                if (typeof opts.onend === 'function') {
                    h.once('end', () => opts.onend(), sid);
                    h.once('loaderror', () => opts.onend(), sid);
                    h.once('playerror', () => opts.onend(), sid);
                }
                return h;
            }

            // Fallback HTML5 Audio
            try {
                const a = new Audio(BASE_PATH + filename);
                a.volume = vol;
                if (typeof opts.onend === 'function') {
                    a.onended = () => opts.onend();
                    a.onerror = () => opts.onend();
                }
                a.play().catch(() => {
                    if (typeof opts.onend === 'function') opts.onend();
                });
                return a;
            } catch (e) {
                if (typeof opts.onend === 'function') opts.onend();
                return null;
            }
        },

        pickRandom: function (arr) {
            return arr[Math.floor(Math.random() * arr.length)];
        },

        resetForNewRoute: function () {
            this.angerLevel = 0;
            this.lastJoltVoiceTime = 0;
            this.lastNearMissTime = 0;
            this.lastGreetingStopIndex = -1;
            this.greetingsAtCurrentStop = 0;
        },

        // 1. ÇARPIŞMA ANINDA SAĞ / SOL / ÖN DIŞ NPC VE KABİN ÇIĞLIK SİSTEMİ
        onCollision: function (direction, damageAmount, passengersOnBoard, damageSummaryText, forceTest = false) {
            if (!this.canSpeakInCabin(forceTest)) return false;

            // Hafif yan sürtmede metal sürtme efekti
            if (damageAmount < 22 && direction !== 'front') {
                this.playClip(CLIPS.sfxScrape, {
                    pan: direction === 'left' ? -0.85 : 0.85,
                    volume: 0.75,
                    backgroundSfx: true,
                    force: forceTest
                });
            }

            // Otobüste yolcu varsa kabin içinden anında korku nidası efekti
            if (passengersOnBoard > 0) {
                this.angerLevel = Math.min(4, this.angerLevel + 2);
                this.playClip(CLIPS.sfxGasp, {
                    pan: 0,
                    volume: 0.70,
                    backgroundSfx: true,
                    force: forceTest
                });
            }

            // Çarpılan yöndeki sürücü / yaya tepkisi (Sol: -0.85, Sağ: +0.85, Ön: 0)
            let pool = CLIPS.crashFront;
            let pan = 0;
            if (direction === 'left') {
                pool = CLIPS.crashLeft;
                pan = -0.85;
            } else if (direction === 'right') {
                pool = CLIPS.crashRight;
                pan = 0.85;
            }
            const chosen = this.pickRandom(pool);

            setTimeout(() => {
                this.playClip(chosen.file, {
                    pan,
                    volume: 1.0,
                    interrupt: true,
                    force: forceTest,
                    nvdaText: (damageSummaryText ? damageSummaryText + ' ' : '') + chosen.label,
                    toastText: `💥 ${chosen.label}`,
                    toastType: 'warning',
                    onend: () => {
                        // Ağır darbede kabin içinden korkmuş yolcu çığlığı + acil merkez telsizi
                        if (passengersOnBoard > 0 && damageAmount >= 18) {
                            const panicFile = this.pickRandom(CLIPS.cabinPanic);
                            setTimeout(() => {
                                this.playClip(panicFile, { pan: 0, volume: 0.92, force: forceTest });
                            }, 220);
                        }
                        if (damageAmount >= 30 && !forceTest) {
                            setTimeout(() => {
                                this.playEmergencyDispatchCrash();
                            }, 2800);
                        }
                    }
                });
            }, 260);

            return true;
        },

        playEmergencyDispatchCrash: function () {
            if (!this.canSpeakInCabin()) return;
            if (typeof audio !== 'undefined' && typeof audio.playRadioSquelch === 'function') {
                audio.playRadioSquelch(true);
            }
            setTimeout(() => {
                this.playClip(CLIPS.dispatchCrash, {
                    pan: -0.2,
                    volume: 0.95,
                    toastText: '📻 [ACİL MERKEZ ANONSU]: Darbe sensörü uyarısı! Dörtlüleri yakıp yolcuları kontrol edin!',
                    toastType: 'error',
                    onend: () => {
                        if (typeof audio !== 'undefined' && typeof audio.playRadioSquelch === 'function') {
                            setTimeout(() => audio.playRadioSquelch(false), 90);
                        }
                    }
                });
            }, 180);
        },

        // 2. TEHLİKELİ YAKIN GEÇİŞ (SIFIR GEÇME - KORNA VE SÜRÜCÜ SİNİRLENMESİ)
        onNearMiss: function (side) {
            if (!this.canSpeakInCabin()) return;
            const now = performance.now();
            if (this.lastNearMissTime && (now - this.lastNearMissTime < 20000)) return;
            this.lastNearMissTime = now;

            const pan = side === 'left' ? -0.82 : 0.82;
            this.playClip(CLIPS.sfxHorn, { pan, volume: 0.72, backgroundSfx: true });
            const chosen = this.pickRandom(CLIPS.nearMiss);
            setTimeout(() => {
                this.playClip(chosen.file, {
                    pan,
                    volume: 0.92,
                    nvdaText: chosen.label,
                    toastText: `🚗 ${chosen.label}`,
                    toastType: 'warning'
                });
            }, 380);
        },

        // 3. KIRMIZI IŞIK İHLALİ (YAYA GEÇİDİ ÇIĞLIĞI & ÖFKELİ SÜRÜCÜ)
        onRedLightViolation: function () {
            if (!this.canSpeakInCabin()) return false;
            this.angerLevel = Math.min(4, this.angerLevel + 1);
            this.playClip(CLIPS.sfxHorn, { pan: 0.65, volume: 0.78, backgroundSfx: true });
            const chosen = this.pickRandom(CLIPS.redLight);
            setTimeout(() => {
                this.playClip(chosen.file, {
                    pan: 0.55,
                    volume: 0.98,
                    interrupt: true,
                    nvdaText: 'Kırmızı ışıkta geçtiniz! 150 Lira trafik cezası kesildi. ' + chosen.label,
                    toastText: `🚦 ${chosen.label}`,
                    toastType: 'error'
                });
            }, 300);
            return true;
        },

        // 4. KADEMELİ YOLCU SABIR VE HAFIZA SİSTEMİ (ANİ FREN, HIZLI KASİS, ÇUKUR)
        onRoughDriving: function (reason, passengersOnBoard) {
            if (!this.canSpeakInCabin() || (passengersOnBoard || 0) <= 0) return false;
            const now = performance.now();
            if (this.lastJoltVoiceTime && (now - this.lastJoltVoiceTime < 7500)) return false;
            this.lastJoltVoiceTime = now;

            this.angerLevel = Math.min(4, (this.angerLevel || 0) + 1);
            let pool = CLIPS.patienceMild;
            if (this.angerLevel === 2) pool = CLIPS.patienceMedium;
            else if (this.angerLevel >= 3) pool = CLIPS.patienceAngry;

            const chosen = this.pickRandom(pool);
            const randomCabinPan = Number(((Math.random() - 0.5) * 0.45).toFixed(2));
            setTimeout(() => {
                this.playClip(chosen.file, {
                    pan: randomCabinPan,
                    volume: 0.94,
                    nvdaText: chosen.label,
                    toastText: `🗣️ ${chosen.label}`,
                    toastType: this.angerLevel >= 3 ? 'warning' : 'info'
                });
            }, 350);
            return true;
        },

        // 5. DURAK BİNİŞ SELAMLARI, AYAKTA YOLCU, KOŞAN YOLCU, YETERSİZ BAKİYE, RAMPA
        onPassengerBoarded: function (pType, stopIndex, isStanding, clockMinutes) {
            if (!this.canSpeakInCabin()) return;
            if (stopIndex !== this.lastGreetingStopIndex) {
                this.lastGreetingStopIndex = stopIndex;
                this.greetingsAtCurrentStop = 0;
                this.fullStopWarnedIndex = -1;
            }
            if (isStanding && this.greetingsAtCurrentStop === 0) {
                this.greetingsAtCurrentStop++;
                const standFile = Array.isArray(CLIPS.standing) ? this.pickRandom(CLIPS.standing) : CLIPS.standing;
                setTimeout(() => this.playClip(standFile, { pan: 0.25, volume: 0.88 }), 420);
                return;
            }
            // Her durakta en fazla 1 doğal selam (kalabalık yapmasın, çok gerçekçi duyulsun)
            if (this.greetingsAtCurrentStop >= 1 || Math.random() > 0.72) return;
            this.greetingsAtCurrentStop++;

            const baseList = (CLIPS.greetings[pType] || CLIPS.greetings.tam).slice();
            if (typeof clockMinutes === 'number') {
                if (clockMinutes >= 330 && clockMinutes < 660) baseList.push(CLIPS.greetMorning);
                else if (clockMinutes >= 1050 || clockMinutes < 300) baseList.push(CLIPS.greetEvening);
            }
            const file = this.pickRandom(baseList);
            setTimeout(() => {
                this.playClip(file, { pan: 0.35, volume: 0.88 });
            }, 460);
        },

        onBusFullAtStop: function (stopIndex) {
            if (!this.canSpeakInCabin()) return false;
            if (this.fullStopWarnedIndex === stopIndex) return false;
            this.fullStopWarnedIndex = stopIndex;
            setTimeout(() => {
                this.playClip('bus_full_left_01.mp3', {
                    pan: 0.65,
                    volume: 0.92,
                    nvdaText: 'Durakta kalan yolcu: Hay Allah, otobüs tamamen dolu, bir sonrakine bineriz artık!',
                    toastText: '🚏 Duraktaki Yolcu: "İğne atsan yere düşmez otobüste! Bir sonrakine bineriz artık!"',
                    toastType: 'warning'
                });
            }, 450);
            return true;
        },

        onRearDoorAlight: function (alightingCount) {
            if (!this.canSpeakInCabin() || (alightingCount || 0) <= 0) return false;
            const now = performance.now();
            if (this._lastAlightVoiceTime && (now - this._lastAlightVoiceTime < 9000)) return false;
            this._lastAlightVoiceTime = now;

            if ((this.angerLevel || 0) >= 2) {
                setTimeout(() => {
                    this.playClip(CLIPS.alightAngry.file, {
                        pan: -0.45,
                        volume: 0.92,
                        nvdaText: CLIPS.alightAngry.label,
                        toastText: `😤 ${CLIPS.alightAngry.label}`,
                        toastType: 'warning'
                    });
                }, 480);
                return true;
            }

            if (Math.random() > 0.78) return false;
            const chosen = this.pickRandom(CLIPS.alightThanks);
            setTimeout(() => {
                this.playClip(chosen.file, {
                    pan: -0.45,
                    volume: 0.90,
                    nvdaText: chosen.label,
                    toastText: `👋 ${chosen.label}`,
                    toastType: 'success'
                });
            }, 520);
            return true;
        },

        onStopBellRing: function (isFinalStop) {
            if (!this.canSpeakInCabin()) return false;
            const chosen = isFinalStop ? CLIPS.stopBellFinal : this.pickRandom(CLIPS.stopBell);
            const pan = Number(((Math.random() - 0.5) * 0.6).toFixed(2));
            setTimeout(() => {
                this.playClip(chosen.file, {
                    pan,
                    volume: 0.92,
                    nvdaText: 'Duracak zili çaldı. ' + chosen.label,
                    toastText: `🔔 ${chosen.label}`,
                    toastType: 'info'
                });
            }, 520);
            return true;
        },

        onSharpCurve: function (state, isTurnRight, passengersOnBoard) {
            if (!this.canSpeakInCabin() || (passengersOnBoard || 0) <= 0) return false;
            const now = performance.now();
            if (this._lastCurveVoiceTime && (now - this._lastCurveVoiceTime < 8500)) return false;
            this._lastCurveVoiceTime = now;

            const throwPan = isTurnRight ? -0.55 : 0.55;
            if (state === 'panic') {
                this.angerLevel = Math.min(4, (this.angerLevel || 0) + 1);
                const chosen = this.pickRandom(CLIPS.curvePanic);
                this.playClip(chosen.file, {
                    pan: throwPan,
                    volume: 0.96,
                    interrupt: true,
                    nvdaText: chosen.label,
                    toastText: `↩️ ${chosen.label}`,
                    toastType: 'warning'
                });
                return true;
            } else if (state === 'murmur') {
                this.playClip(CLIPS.curveMurmur.file, {
                    pan: throwPan * 0.65,
                    volume: 0.88,
                    nvdaText: CLIPS.curveMurmur.label,
                    toastText: `💫 ${CLIPS.curveMurmur.label}`,
                    toastType: 'info'
                });
                return true;
            }
            return false;
        },

        onStopPunctuality: function (deltaMinutes, waitingCount) {
            if (!this.canSpeakInCabin() || (waitingCount || 0) <= 0 || typeof deltaMinutes !== 'number') return false;
            if (deltaMinutes >= 4.0) {
                setTimeout(() => {
                    if (this.activeHowl && this.activeHowl.playing && this.activeHowl.playing()) return;
                    this.playClip('late_complain_01.mp3', {
                        pan: 0.45,
                        volume: 0.90,
                        nvdaText: 'Duraktaki yolcu rötar sitemi: Neredesin be kaptan bey, ağaç olduk durakta beklemekten!',
                        toastText: '⏱️ Duraktaki Yolcu: "Ağaç olduk durakta beklemekten kaptan bey, rötar yaptı bu hat!"',
                        toastType: 'warning'
                    });
                }, 3100);
                return true;
            } else if (Math.abs(deltaMinutes) <= 1.0) {
                this._ontimeCount = (this._ontimeCount || 0) + 1;
                if (this._ontimeCount % 3 === 1) {
                    setTimeout(() => {
                        if (this.activeHowl && this.activeHowl.playing && this.activeHowl.playing()) return;
                        this.playClip('ontime_praise_01.mp3', {
                            pan: 0.4,
                            volume: 0.90,
                            nvdaText: 'Duraktaki yolcu: Vallahi İsviçre saati gibi tam dakikasında geldi otobüs, helal olsun kaptan!',
                            toastText: '⌚ Yolcu: "İsviçre saati gibi tam dakikasında geldi otobüs, helal olsun kaptan!"',
                            toastType: 'success'
                        });
                    }, 3100);
                    return true;
                }
            }
            return false;
        },

        onLongStationaryWait: function () {
            if (!this.canSpeakInCabin()) return false;
            this._waitIdx = ((this._waitIdx || 0) + 1) % CLIPS.waitLong.length;
            const chosen = CLIPS.waitLong[this._waitIdx];
            this.playClip(chosen.file, {
                pan: -0.25,
                volume: 0.90,
                nvdaText: chosen.label,
                toastText: `⏳ ${chosen.label}`,
                toastType: 'info'
            });
            return true;
        },

        onHornPressed: function (passengersOnBoard, hasNearbyHazard) {
            if (!this.canSpeakInCabin() || (passengersOnBoard || 0) <= 0 || hasNearbyHazard) return false;
            const now = performance.now();
            this._hornTimes = (this._hornTimes || []).filter(t => (now - t) < 8000);
            this._hornTimes.push(now);
            if (this._hornTimes.length >= 3 && (!this._lastHornScoldTime || (now - this._lastHornScoldTime > 22000))) {
                this._hornTimes = [];
                this._lastHornScoldTime = now;
                const chosen = this.pickRandom(CLIPS.hornSpam);
                setTimeout(() => {
                    this.playClip(chosen.file, {
                        pan: -0.2,
                        volume: 0.94,
                        nvdaText: chosen.label,
                        toastText: `📯 ${chosen.label}`,
                        toastType: 'warning'
                    });
                }, 420);
                return true;
            }
            return false;
        },

        onLowAirAlarm: function (passengersOnBoard) {
            if (!this.canSpeakInCabin() || (passengersOnBoard || 0) <= 0) return false;
            const now = performance.now();
            if (this._lastLowAirVoice && (now - this._lastLowAirVoice < 35000)) return false;
            this._lastLowAirVoice = now;
            setTimeout(() => {
                this.playClip('low_air_panic_m1.mp3', {
                    pan: -0.3,
                    volume: 0.94,
                    nvdaText: 'Yolcu telaşı: Kaptan usta bu öten alarm neyin nesi yahu, otobüsün havası mı bitti?!',
                    toastText: '🚨 Yolcu: "Kaptan usta bu öten alarm neyin nesi yahu, otobüsün havası mı bitti?!"',
                    toastType: 'warning'
                });
            }, 650);
            return true;
        },

        onThunderclap: function (passengersOnBoard) {
            if (!this.canSpeakInCabin() || (passengersOnBoard || 0) <= 0) return false;
            const now = performance.now();
            if (this._lastThunderVoice && (now - this._lastThunderVoice < 75000)) return false;
            this._lastThunderVoice = now;
            setTimeout(() => {
                this.playClip('weather_thunder_01.mp3', {
                    pan: 0.25,
                    volume: 0.90,
                    nvdaText: 'Tonton Teyze: Bismillahirrahmanirrahim! Ne gök gürledi öyle, iyi ki otobüsün içindeyiz!',
                    toastText: '⛈️ Teyze: "Bismillahirrahmanirrahim! Ne gök gürledi öyle, iyi ki otobüsün içindeyiz!"',
                    toastType: 'info'
                });
            }, 900);
            return true;
        },

        onDriverWindowOpened: function (gameObj) {
            if (!this.canSpeakInCabin() || !gameObj || (gameObj.passengersOnBoard || 0) <= 0) return false;
            const isColdOrWet = (gameObj.weather === 'rainy' || gameObj.weather === 'snowy' || (typeof gameObj.temperature === 'number' && gameObj.temperature <= 14) || gameObj.speed > 55);
            if (!isColdOrWet) return false;
            const now = performance.now();
            if (this._lastWindowDraftVoice && (now - this._lastWindowDraftVoice < 45000)) return false;
            this._lastWindowDraftVoice = now;
            setTimeout(() => {
                if (typeof audio !== 'undefined' && audio.isWindowOpen) {
                    this.playClip('window_draft_01.mp3', {
                        pan: -0.35,
                        volume: 0.90,
                        nvdaText: 'Ön koltuktaki yolcu: Üff kaptan bey, açık camdan buz gibi cereyan vurdu boynumuza, End tuşuyla kapatabilir misiniz?',
                        toastText: '🪟 Yolcu: "Açık camdan buz gibi cereyan vurdu boynumuza kaptan bey! (End: Camı Kapat)"',
                        toastType: 'info'
                    });
                }
            }, 2200);
            return true;
        },

        onCaptainTeaSip: function (passengersOnBoard) {
            if (!this.canSpeakInCabin() || (passengersOnBoard || 0) <= 0) return false;
            setTimeout(() => {
                this.playClip('tea_smell_kid.mp3', {
                    pan: 0.25,
                    volume: 0.92,
                    nvdaText: 'Çocuk Yolcu: Mmm! Kaptan amcanın çayı ne güzel koktu, benim de canım simit çekti anne!',
                    toastText: '🫖 Çocuk Yolcu: "Mmm! Kaptan amcanın çayı ne güzel koktu, canım simit çekti anne!"',
                    toastType: 'success'
                });
            }, 900);
            return true;
        },

        onRunningPassengerAppear: function () {
            if (!this.canSpeakInCabin()) return false;
            this.playClip(CLIPS.runnerWait, {
                pan: 0.65,
                volume: 1.0,
                interrupt: true,
                nvdaText: 'Durağa doğru koşan bir yolcu var: Kaptanım dur bekle lütfen geliyorum! Ön kapıyı açmak için PageUp tuşuna basın.'
            });
            return true;
        },

        onRunningPassengerBoarded: function () {
            if (!this.canSpeakInCabin()) return false;
            this.angerLevel = Math.max(0, this.angerLevel - 1);
            setTimeout(() => {
                this.playClip(CLIPS.runnerBoarded, {
                    pan: 0.3,
                    volume: 0.95,
                    nvdaText: 'Koşan yolcu bindi: Oh be, helal olsun kaptanım, işe yetiştim sayende! Artı 60 Lira ve 30 XP.'
                });
            }, 320);
            return true;
        },

        onRunningPassengerMissed: function () {
            if (!this.canSpeakInCabin()) return false;
            this.playClip(CLIPS.runnerMissed, {
                pan: 0.75,
                volume: 0.88,
                nvdaText: 'Yolcu durağa yetişemedi: Ah be kaptanım, kıl payı kaçırdım otobüsü.'
            });
            return true;
        },

        onInsufficientBalanceAsk: function () {
            if (!this.canSpeakInCabin()) return false;
            setTimeout(() => {
                this.playClip(CLIPS.studentNoBalance, {
                    pan: 0.35,
                    volume: 0.96,
                    interrupt: true,
                    nvdaText: 'Yolcunun kartında bakiye yetersiz: Kaptan abi sınava yetişmem lazım, idare edebilir misin? İzin vermek için Y, indirmek için N tuşuna basın.'
                });
            }, 380);
            return true;
        },

        onInsufficientBalanceResolved: function (allowed) {
            if (!this.canSpeakInCabin()) return false;
            if (allowed) this.angerLevel = Math.max(0, this.angerLevel - 1);
            this.playClip(allowed ? CLIPS.studentThankFree : CLIPS.studentSadOff, {
                pan: 0.3,
                volume: 0.95,
                interrupt: true,
                nvdaText: allowed
                    ? 'Yolcuya izin verdiniz: Çok teşekkür ederim kaptan abi! Artı 50 Lira gönlü zengin kaptan primi.'
                    : 'Yolcuyu indirdiniz: Peki kaptan abi, canın sağ olsun, iyi nöbetler.'
            });
            return true;
        },

        onRampThank: function () {
            if (!this.canSpeakInCabin()) return false;
            this.angerLevel = Math.max(0, this.angerLevel - 1);
            setTimeout(() => {
                this.playClip(CLIPS.rampThank, {
                    pan: 0.35,
                    volume: 0.95,
                    nvdaText: 'Tekerlekli sandalye rampası açıldı. Yolcu: Allah razı olsun kaptan evladım, ellerin dert görmesin. Artı 30 XP.'
                });
            }, 550);
            return true;
        },

        // 6. TELSİZ DİSPEÇER (T TUŞU), KANAL 19 KAPTAN, POLİS DENETİMİ VE KOLONYA İKRAMI
        playDispatch: function (idx) {
            if (!this.canSpeakInCabin()) return false;
            const file = CLIPS.dispatch[(idx || 0) % CLIPS.dispatch.length];
            if (typeof audio !== 'undefined' && typeof audio.playRadioSquelch === 'function') {
                audio.playRadioSquelch(true);
            }
            setTimeout(() => {
                this.playClip(file, {
                    pan: -0.25,
                    volume: 0.95,
                    interrupt: true,
                    onend: () => {
                        if (typeof audio !== 'undefined' && typeof audio.playRadioSquelch === 'function') {
                            setTimeout(() => audio.playRadioSquelch(false), 80);
                        }
                    }
                });
            }, 150);
            return true;
        },

        playChannel19Chat: function (force = false) {
            if (!this.canSpeakInCabin(force)) return false;
            const item = CLIPS.ch19[this.ch19Index % CLIPS.ch19.length];
            this.ch19Index++;
            if (typeof UI !== 'undefined' && UI.showToast) {
                UI.showToast(`📻 [Kanal 19 Telsiz]: "${item.text}"`, 'info');
            }
            this.playClip(item.file, {
                pan: -0.2,
                volume: 0.95,
                force,
                interrupt: true,
                nvdaText: 'Kanal 19 Kaptan Telsizi: ' + item.text,
                onend: () => {
                    if (typeof audio !== 'undefined' && typeof audio.playRadioSquelch === 'function') {
                        setTimeout(() => audio.playRadioSquelch(false), 75);
                    }
                }
            });
            return true;
        },

        playPoliceInspectionResult: function (isOverSpeed, currentSpeed, force = false) {
            if (!this.canSpeakInCabin(force)) return false;
            const file = isOverSpeed ? CLIPS.policeFine : CLIPS.policeClean;
            this.playClip(file, {
                pan: -0.55,
                volume: 0.98,
                force,
                interrupt: true,
                nvdaText: isOverSpeed
                    ? `Trafik polisi ${currentSpeed} kilometre hız tespiti nedeniyle 350 Lira ceza kesti.`
                    : `Trafik polisi takografı inceledi: Hızınız ${currentSpeed} kilometre, kurallara uygun. Artı 30 XP.`
            });
            return true;
        },

        playCologneSequence: function (force = false) {
            if (!this.canSpeakInCabin(force)) return false;
            // Yolcuların sinirini yumuşat!
            this.angerLevel = 0;
            const reply = this.pickRandom(CLIPS.cologneReplies);
            if (typeof UI !== 'undefined' && UI.showToast) {
                UI.showToast(`🧴 [İkram Servisi] Yolcu: "${reply.text}" (+12 Konfor, Yolcular Sakinleşti!)`, 'success');
            }
            this.playClip(CLIPS.muavinCologne, {
                pan: 0.1,
                volume: 0.92,
                force,
                interrupt: true,
                nvdaText: 'Limon kolonyası ikram edildi. Yolcu: ' + reply.text,
                onend: () => {
                    setTimeout(() => {
                        this.playClip(reply.file, { pan: -0.25, volume: 0.95, force });
                    }, 220);
                }
            });
            return true;
        },

        // 7. SANAYİ BAŞ USTASI VE HAVALI SOMUN TABANCASI (SANAYİ EKRANI)
        playSanayiWelcome: function () {
            if (!this.isEnabled()) return false;
            this.playClip('sanayi_welcome.mp3', { pan: 0, volume: 0.95, force: true, interrupt: true });
            return true;
        },

        playSanayiReport: function () {
            if (!this.isEnabled()) return false;
            this.playClip('sanayi_report.mp3', { pan: 0, volume: 0.95, force: true, interrupt: true });
            return true;
        },

        playSanayiWrench: function () {
            if (!this.isEnabled()) return false;
            this.playClip('sfx_impact_wrench.mp3', { pan: 0.25, volume: 0.72, force: true, backgroundSfx: true });
            return true;
        },

        playSanayiDone: function () {
            if (!this.isEnabled()) return false;
            this.playClip('sanayi_done.mp3', { pan: 0, volume: 0.96, force: true, interrupt: true });
            return true;
        },

        playSanayiSkip: function () {
            if (!this.isEnabled()) return false;
            this.playClip('sanayi_skip.mp3', { pan: 0, volume: 0.95, force: true, interrupt: true });
            return true;
        },

        // 8. AKARYAKIT POMPACISI VE DİNLENME TESİSİ GÖREVLİLERİ (MUAVİN, ÇAYCI, AŞÇI, YIKAMACI)
        playFuelFilled: function (liters, pct) {
            if (!this.isEnabled()) return false;
            this.playClip('sfx_fuel_nozzle.mp3', { pan: -0.45, volume: 0.75, force: true, backgroundSfx: true });
            setTimeout(() => {
                this.playClip('fuel_filled.mp3', {
                    pan: -0.4,
                    volume: 0.95,
                    force: true,
                    interrupt: true,
                    nvdaText: `Depoya ${Math.floor(liters)} litre mazot dolduruldu, yakıt seviyeniz yüzde ${pct}. Pompacı Usta: Hayırlı yolculuklar kaptan!`
                });
            }, 420);
            return true;
        },

        playFuelAlreadyFull: function () {
            if (!this.isEnabled()) return false;
            this.playClip('fuel_already_full.mp3', {
                pan: -0.35,
                volume: 0.92,
                force: true,
                interrupt: true,
                nvdaText: 'Deponuz zaten ağzına kadar dolu kaptanım!'
            });
            return true;
        },

        playFacilityBreakStart: function () {
            if (!this.isEnabled()) return false;
            this.angerLevel = 0;
            this.playClip('muavin_break_start.mp3', {
                pan: 0.15,
                volume: 0.95,
                force: true,
                interrupt: true,
                nvdaText: 'Muavin Anonsu: Dinlenme tesisine ulaştık, 30 dakika ihtiyaç molası verilmiştir.'
            });
            return true;
        },

        playFacilityBreakEnd: function () {
            if (!this.isEnabled()) return false;
            this.playClip('peron_break_end.mp3', {
                pan: 0,
                volume: 0.94,
                force: true,
                interrupt: true,
                nvdaText: 'Peron Anonsu: Mola süresi sona erdi, aracınız hareket etmek üzeredir.'
            });
            return true;
        },

        playTeaServed: function () {
            if (!this.isEnabled()) return false;
            setTimeout(() => {
                this.playClip('tea_served.mp3', {
                    pan: 0.25,
                    volume: 0.94,
                    force: true,
                    interrupt: true,
                    nvdaText: 'Çaycı Usta: Buyur kaptanım, tavşan kanı demli Rize çayın hazır!'
                });
            }, 320);
            return true;
        },

        playFoodServed: function (foodName) {
            if (!this.isEnabled()) return false;
            setTimeout(() => {
                this.playClip('food_served.mp3', {
                    pan: 0.2,
                    volume: 0.94,
                    force: true,
                    interrupt: true,
                    nvdaText: `Afiyet olsun kaptan! ${foodName || 'Sıcak yemeğiniz'} servis edildi.`
                });
            }, 320);
            return true;
        },

        playWashBoyDone: function () {
            if (!this.isEnabled()) return false;
            setTimeout(() => {
                this.playClip('wash_boy_done.mp3', {
                    pan: 0.3,
                    volume: 0.95,
                    force: true,
                    interrupt: true,
                    nvdaText: 'Tesis görevlisi ön camı ve farları pırıl pırıl yıkadı!'
                });
            }, 480);
            return true;
        },

        // 9. KURUMSAL BELEDİYE / TEKULAŞ ANONS SPİKERİ (İREM) VE KAYIP EŞYA
        playIbisWelcome: function () {
            if (!this.canSpeakInCabin()) return false;
            this.playClip('ibis_welcome.mp3', { pan: 0, volume: 0.92, interrupt: true });
            return true;
        },

        playIbisFinalStop: function () {
            if (!this.canSpeakInCabin()) return false;
            this.playClip('ibis_final_stop.mp3', { pan: 0, volume: 0.94, interrupt: true });
            return true;
        },

        onLostItemFound: function (fullMsg) {
            if (!this.canSpeakInCabin(true)) return false;
            this.playClip('lost_item_found.mp3', {
                pan: 0.15,
                volume: 0.95,
                force: true,
                interrupt: true,
                nvdaText: fullMsg
            });
            return true;
        },

        onRearEndHit: function () {
            if (!this.canSpeakInCabin()) return false;
            this.playClip('rear_hit_apology.mp3', {
                pan: 0,
                volume: 0.96,
                interrupt: true,
                nvdaText: 'Arkadan çarptılar! Egzoz hasar aldı. Arkadaki sürücü: Eyvah kaptan abi özür dilerim, duramadım!',
                toastText: '💥 Arkadaki Sürücü: "Eyvah kaptan abi çok özür dilerim, duramadım arkadan dokundurdum!"',
                toastType: 'warning'
            });
            return true;
        },

        onAcTurnedOn: function (busTemp) {
            if (!this.canSpeakInCabin()) return;
            if (typeof busTemp === 'number' && (busTemp >= 26 || busTemp <= 15)) {
                setTimeout(() => {
                    this.playClip('ac_thank.mp3', {
                        pan: -0.2,
                        volume: 0.88,
                        nvdaText: 'Yolcu: Ohh be dünya varmış, içerisi ne güzel ferahladı, teşekkürler kaptan!'
                    });
                }, 1400);
            }
        },

        // 10. AKILLI KABİN İÇİ ORTAM, AŞIRI HIZ, USTA SÜRÜŞ ÖVGÜSÜ & DOĞAL YOLCU SOHBETLERİ
        checkSmartCabinReminders: function (gameObj, deltaTime) {
            if (!gameObj || !gameObj.isDriving || !this.canSpeakInCabin()) return;
            const now = performance.now();

            // Aşırı hız tepkisi (92 km/s ve üzeri 5.5 saniye kesintisiz sürülürse)
            if ((gameObj.passengersOnBoard || 0) > 0 && gameObj.speed >= 92) {
                this._overspeedSecs = (this._overspeedSecs || 0) + deltaTime;
                if (this._overspeedSecs >= 5.5 && (!this._lastOverspeedTime || (now - this._lastOverspeedTime > 38000))) {
                    this._overspeedSecs = 0;
                    this._lastOverspeedTime = now;
                    this.lastSmartRemindTime = now;
                    const chosen = this.pickRandom(CLIPS.overspeed);
                    this.playClip(chosen.file, {
                        pan: -0.25,
                        volume: 0.94,
                        nvdaText: chosen.label,
                        toastText: `🏎️ ${chosen.label}`,
                        toastType: 'warning'
                    });
                    return;
                }
            } else {
                this._overspeedSecs = 0;
            }

            // Pamuk gibi sarsıntısız usta sürüş övgüsü & Doğal kabin içi yaşam sohbetleri
            if ((gameObj.passengersOnBoard || 0) >= 2 && gameObj.speed >= 26 && gameObj.speed <= 84 && (gameObj.passengerComfort || 100) >= 97 && (this.angerLevel || 0) === 0) {
                this._smoothDriveSecs = (this._smoothDriveSecs || 0) + deltaTime;
                if (this._smoothDriveSecs >= 52 && (!this.lastSmartRemindTime || (now - this.lastSmartRemindTime > 36000))) {
                    this._smoothDriveSecs = 0;
                    this.lastSmartRemindTime = now;
                    this._ambientToggle = !this._ambientToggle;
                    if (this._ambientToggle) {
                        const praise = this.pickRandom(CLIPS.smoothPraise);
                        if (typeof gameObj.addMoney === 'function') gameObj.addMoney(20);
                        if (typeof gameObj.addXP === 'function') gameObj.addXP(15);
                        this.playClip(praise.file, {
                            pan: 0.2,
                            volume: 0.92,
                            nvdaText: praise.label + ' Artı 20 Lira ve 15 XP Usta Sürüş Övgüsü!',
                            toastText: `🌟 ${praise.label} (+20 ₺ / +15 XP)`,
                            toastType: 'success'
                        });
                    } else {
                        this._ambientIdx = ((this._ambientIdx || 0) + 1) % CLIPS.ambientSlice.length;
                        const slice = CLIPS.ambientSlice[this._ambientIdx];
                        this.playClip(slice.file, {
                            pan: slice.pan,
                            volume: 0.80,
                            nvdaText: slice.label,
                            toastText: `💬 ${slice.label}`,
                            toastType: 'info'
                        });
                    }
                    return;
                }
            } else if ((this.angerLevel || 0) > 0) {
                this._smoothDriveSecs = 0;
            }

            if (this.lastSmartRemindTime && (now - this.lastSmartRemindTime < 48000)) return;

            if (gameObj.isNight && !gameObj.isHeadlightsOn && gameObj.speed > 22 && (!gameObj.busDamage || gameObj.busDamage.headlights < 100)) {
                this._darkDriveSecs = (this._darkDriveSecs || 0) + deltaTime;
                if (this._darkDriveSecs >= 6.5) {
                    this._darkDriveSecs = 0;
                    this.lastSmartRemindTime = now;
                    this.playClip('dark_headlights_warn.mp3', {
                        pan: 0.25,
                        volume: 0.94,
                        nvdaText: 'Yolcu uyarısı: Kaptan bey farları yakmayı unuttunuz, F tuşuyla farları açın!',
                        toastText: '💡 Yolcu: "Kaptan bey farları yakmayı unuttunuz galiba! (F tuşu)"',
                        toastType: 'warning'
                    });
                    return;
                }
            } else {
                this._darkDriveSecs = 0;
            }

            const wiperOn = (typeof audio !== 'undefined' && audio.isWiperOn);
            if ((gameObj.weather === 'rainy' || gameObj.weather === 'snowy') && !wiperOn && gameObj.speed > 22 && (!gameObj.busDamage || gameObj.busDamage.wipers < 100)) {
                this._wetDriveSecs = (this._wetDriveSecs || 0) + deltaTime;
                if (this._wetDriveSecs >= 7.5) {
                    this._wetDriveSecs = 0;
                    this.lastSmartRemindTime = now;
                    this.playClip('rain_wipers_warn.mp3', {
                        pan: 0.35,
                        volume: 0.94,
                        nvdaText: 'Yolcu uyarısı: Ön cam yağmurdan sırılsıklam oldu, Shift ve W ile silecekleri çalıştırın!',
                        toastText: '🌧️ Yolcu: "Kaptan usta ön cam sırılsıklam oldu, silecekleri çalıştırsana! (Shift+W)"',
                        toastType: 'warning'
                    });
                    return;
                }
            } else {
                this._wetDriveSecs = 0;
            }

            if ((gameObj.passengersOnBoard || 0) > 0 && !gameObj.isACOn && typeof gameObj.busTemperature === 'number') {
                if (gameObj.busTemperature >= 27) {
                    this.lastSmartRemindTime = now;
                    this.playClip('ac_request.mp3', {
                        pan: -0.25,
                        volume: 0.92,
                        nvdaText: 'Yolcu: Kaptan bey otobüsün içi çok sıcak oldu, K tuşuyla klimayı açabilir misiniz?',
                        toastText: '❄️ Yolcu: "Kaptan bey içerisi çok havasız kaldı, klimayı açabilir misiniz? (K tuşu)"',
                        toastType: 'info'
                    });
                } else if (gameObj.busTemperature <= 13) {
                    this.lastSmartRemindTime = now;
                    this.playClip('cold_request.mp3', {
                        pan: -0.3,
                        volume: 0.92,
                        nvdaText: 'Yolcu: Kaptan evladım üşüdük arkada, K tuşuyla kaloriferi açsana!',
                        toastText: '🔥 Yolcu: "Kaptan evladım donduk arkada, klimayı kaloriferi açsana! (K tuşu)"',
                        toastType: 'info'
                    });
                    return;
                }
            }

            if (typeof SmartEnvironmentEngine !== 'undefined' && SmartEnvironmentEngine.currentEnv === 'mountain' && gameObj.speed > 55 && (!gameObj.retarderLevel || gameObj.retarderLevel === 0) && !this._mountainWarned) {
                this._mountainWarned = true;
                this.lastSmartRemindTime = now;
                this.playClip('mountain_retarder_warn.mp3', {
                    pan: 0,
                    volume: 0.95,
                    nvdaText: 'Eğitmen Notu: Dik rampa inişinde balataları yakmamak için B tuşuyla retarderi devreye alın!',
                    toastText: '⛰️ Eğitmen Notu: "Dik rampa inişindeyiz kaptan; balataları yakmamak için B tuşuyla retarderi aç!"',
                    toastType: 'info'
                });
            } else if (typeof SmartEnvironmentEngine !== 'undefined' && SmartEnvironmentEngine.currentEnv !== 'mountain') {
                this._mountainWarned = false;
            }
        },

        // 11. MİKYAS KAPTANLIK AKADEMİSİ 13 SESLİ DERS (BAŞ EĞİTMEN UĞUR IŞIK)
        playAcademyLesson: function (lessonId, fallbackText) {
            if (!this.isEnabled()) return false;
            this._academyQueue = null;
            const file = 'lesson_' + lessonId + '.mp3';
            this.playClip(file, {
                pan: 0,
                volume: 1.0,
                force: true,
                interrupt: true,
                nvdaText: fallbackText || ''
            });
            return true;
        },

        playFullAcademySequence: function (lessonIds) {
            if (!this.isEnabled() || !Array.isArray(lessonIds) || lessonIds.length === 0) return false;
            this._academyQueue = lessonIds.slice();
            const next = () => {
                if (!this._academyQueue || this._academyQueue.length === 0) return;
                const id = this._academyQueue.shift();
                this.playClip('lesson_' + id + '.mp3', {
                    pan: 0,
                    volume: 1.0,
                    force: true,
                    interrupt: true,
                    onend: () => {
                        if (this._academyQueue && this._academyQueue.length > 0) {
                            setTimeout(next, 450);
                        }
                    }
                });
            };
            next();
            return true;
        },

        stopAcademyLesson: function () {
            this._academyQueue = null;
            this.stopAll();
        },

        // 12. F2 KAVRAMLAR BAŞUCU SÖZLÜĞÜ (9 KAVRAM), KURTARICI ÇEKİCİ, HGS, BAGAJ VE 20 İKONİK KURUMSAL DURAK ANONSU
        playConceptGuide: function (conceptId, fallbackText) {
            if (!this.isEnabled()) return false;
            this.playClip('concept_' + conceptId + '.mp3', {
                pan: 0,
                volume: 1.0,
                force: true,
                interrupt: true,
                nvdaText: fallbackText || ''
            });
            return true;
        },

        playEduModeToggle: function (isEdu) {
            if (!this.isEnabled()) return false;
            this.playClip(isEdu ? 'coach_edu_on.mp3' : 'coach_edu_off.mp3', {
                pan: 0,
                volume: 0.95,
                force: true,
                interrupt: true
            });
            return true;
        },

        playLuggageStapled: function () {
            if (!this.isEnabled()) return false;
            this.playClip('sfx_luggage_thud.mp3', { pan: 0.35, volume: 0.72, force: true, backgroundSfx: true });
            setTimeout(() => {
                this.playClip('luggage_stapled.mp3', {
                    pan: 0.2,
                    volume: 0.95,
                    force: true,
                    interrupt: true,
                    nvdaText: 'Muavin: Bagaj kuponlarınız biletinize zımbalandı efendim, valizleriniz güvenli bagaja yerleşti. Artı 45 Lira bagaj geliri.'
                });
            }, 350);
            return true;
        },

        playTowArrive: function () {
            if (!this.isEnabled()) return false;
            this.playClip('sfx_tow_winch.mp3', { pan: 0, volume: 0.78, force: true, backgroundSfx: true });
            setTimeout(() => {
                this.playClip('tow_arrive.mp3', {
                    pan: -0.25,
                    volume: 0.98,
                    force: true,
                    interrupt: true,
                    nvdaText: 'Kurtarıcı çekici geldi, çelik halat bağlandı, sizi sanayi ustasına çekiyor!'
                });
            }, 520);
            return true;
        },

        playTowDrivingWarn: function () {
            if (!this.isEnabled()) return false;
            this.playClip('tow_driving_warn.mp3', {
                pan: -0.25,
                volume: 0.95,
                force: true,
                interrupt: true
            });
            return true;
        },

        playHgsStatus: function (ok, textMsg) {
            if (!this.isEnabled()) return false;
            setTimeout(() => {
                this.playClip(ok ? 'hgs_ok.mp3' : 'hgs_low.mp3', {
                    pan: 0,
                    volume: 0.94,
                    force: true,
                    interrupt: true,
                    nvdaText: textMsg || ''
                });
            }, 260);
            return true;
        },

        playStopHubAnnouncement: function (stopName) {
            if (!this.canSpeakInCabin() || !stopName) return false;
            const s = stopName.toLowerCase();
            let file = null;
            if (s.includes('değirmenaltı') || s.includes('üniversite caddesi') || s.includes('kampüs')) file = 'stop_degirmenalti.mp3';
            else if (s.includes('köprübaşı')) file = 'stop_koprubasi.mp3';
            else if (s.includes('valilik') || s.includes('hükümet caddesi')) file = 'stop_valilik.mp3';
            else if (s.includes('şehir hastanesi')) file = 'stop_sehir_hastanesi.mp3';
            else if (s.includes('spor salonu')) file = 'stop_spor_salonu.mp3';
            else if (s.includes('altınova')) file = 'stop_altinova.mp3';
            else if (s.includes('baykallar')) file = 'stop_baykallar.mp3';
            else if (s.includes('süleymanpaşa yeni otobüs') || s.includes('tekirdağ otogar')) file = 'stop_tekirdag_otogar.mp3';
            else if (s.includes('çorlu atatürk meydanı') || s.includes('kumyol')) file = 'stop_corlu_meydan.mp3';
            else if (s.includes('çorlu devlet hastanesi')) file = 'stop_corlu_hastane.mp3';
            else if (s.includes('çorlu tarihi tren') || s.includes('çorlu tren gar')) file = 'stop_corlu_gar.mp3';
            else if (s.includes('çorlu atatürk havalimanı') || s.includes('havalimanı')) file = 'stop_corlu_havalimani.mp3';
            else if (s.includes('saray') && (s.includes('çarşı') || s.includes('cumhuriyet meydanı'))) file = 'stop_saray_carsi.mp3';
            else if (s.includes('velimeşe')) file = 'stop_velimese.mp3';
            else if (s.includes('çerkezköy organize') || s.includes('çosb')) file = 'stop_cerkezkoy_osb.mp3';
            else if (s.includes('marmaraereğlisi')) file = 'stop_eregli_otogar.mp3';
            else if (s.includes('esenler') || s.includes('büyük istanbul')) file = 'stop_istanbul_otogar.mp3';
            else if (s.includes('aşti') || s.includes('ankara otogar')) file = 'stop_ankara_asti.mp3';
            else if (s.includes('izmir otogar')) file = 'stop_izmir_otogar.mp3';
            else if (s.includes('bursa otogar') || s.includes('bursa büyükşehir')) file = 'stop_bursa_otogar.mp3';

            if (!file) return false;
            this.playClip(file, { pan: 0, volume: 0.94, interrupt: true });
            return true;
        }
    };

    window.HumanNpcVoices = HumanNpcVoices;
})(window);
