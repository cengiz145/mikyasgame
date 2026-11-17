/* ==========================================================================
   MİKYAS YAŞAYAN İNSAN & AKILLI NPC SES MOTORU (HUMAN-NPC-VOICES.JS)
   ElevenLabs v4 Türkçe Stüdyo Dublajı + Özel Ses Efektleri + 3B Yönlü Ses
   12 Farklı Gerçek İnsan Karakteri • Hafızalı Yolcu Sabır Sistemi • Sıfır Argo
   ========================================================================== */

(function (window) {
    'use strict';

    const BASE_PATH = 'sounds/npc_human/';
    const AUDIO_VER = '?v=20261117p5';

    const CLIPS = {
        // Özel Ses Efektleri (ElevenLabs Sound Generation)
        sfxGasp: 'sfx_cabin_gasp.mp3',
        sfxHorn: 'sfx_angry_car_horn.mp3',
        sfxScrape: 'sfx_fender_scrape.mp3',
        sfxDoorBang: 'sfx_door_fist_bang.mp3',
        sfxUproar: 'sfx_cabin_uproar.mp3',

        // Merkez Filo Amiri (Telsiz Dispeçer - Uğur Işık)
        dispatch: ['dispatch_01.mp3', 'dispatch_02.mp3', 'dispatch_03.mp3', 'dispatch_04.mp3'],
        dispatchCrash: 'dispatch_crash.mp3',

        // Kanal 19 Karşı Şerit Usta Kaptan (Erol Tüm)
        ch19: [
            { file: 'ch19_01.mp3', text: 'Karşı şeritteki kaptanım selamlar! Bolu Dağı tünel çıkışında yoğun sis var, hızını 70\'e düşür, kazasız belasız hayırlı işler!' },
            { file: 'ch19_02.mp3', text: '59 plakalı meslektaşım dinlemede misin? İleride sağ şeritte yol çalışması var, sol şeritten akıp git, tekerine taş değmesin!' },
            { file: 'ch19_03.mp3', text: 'Aleykümselam meslektaşım! Yol tertemiz, radar da yok, 19. kanaldan tüm emekçi meslektaşlarıma hayırlı nöbetler!' },
            { file: 'ch19_04.mp3', text: 'Kaptanım hayırlı yolculuklar! Susurluk tesislerine yaklaşıyorsan tostu ve köpüklü ayranı yeni çıktı, bir mola ver nefeslen!' }
        ],

        // Bölge Trafik Polisi (Atakan)
        policeClean: 'police_clean.mp3',
        policeFine: 'police_fine.mp3',

        // Dış Trafik & Yaya Çarpışma / Tehlike Tepkileri (3B Sağ/Sol Yönlü)
        crashLeft: [
            { file: 'npc_crash_left_01.mp3', label: 'Sol Şerit Sürücüsü: "Hooop! Sol aynaya hiç mi bakmıyorsun yahu?! Boydan boya çizdin güzelim arabayı!"' },
            { file: 'npc_crash_left_02.mp3', label: 'Sol Şerit Sürücüsü: "Yuh artık ya! Koca otobüsü sol şeride üstümüze kırdın, sinyal de mi yok?!"' }
        ],
        crashRight: [
            { file: 'npc_crash_right_01.mp3', label: 'Sağ Şerit Taksicisi: "Hoop! Sağ şeritte taksi var görmüyor musun, çamurluğu dağıttın!"' },
            { file: 'npc_pedestrian_right_01.mp3', label: 'Kaldırımdaki Yaya: "Ayyy! Önünüze baksanıza lütfen, kaldırıma çıkacaksınız, az kalsın eziliyorduk!"' }
        ],
        crashFront: [
            { file: 'npc_crash_front_01.mp3', label: 'Öndeki Sürücü: "Eyvaaah! Frenin mi patladı yahu?! Dümdüz tampona girdin!"' }
        ],
        nearMiss: [
            { file: 'npc_nearmiss_01.mp3', label: 'Yan Şerit Sürücüsü: "Yavaş geç biraz yavaş! Koca otobüsün rüzgarından savrulduk!"' },
            { file: 'npc_nearmiss_f1.mp3', label: 'Yaya / Sürücü: "Ayy! Ne kadar yakın geçtiniz öyle, otobüsün aynası çarpacaktı neredeyse!"' }
        ],
        redLight: [
            { file: 'npc_pedestrian_redlight.mp3', label: 'Yaya Geçidindeki Vatandaş: "Ayy! Kırmızı ışıkta geçilir mi böyle?! Yaya geçidindeyiz!"' },
            { file: 'npc_redlight_01.mp3', label: 'Kavşaktaki Sürücü: "Hooop! Kırmızı yanıyor kırmızı, görmüyor musun?! Az kalsın kavşakta biçiyordun bizi!"' }
        ],

        // Kabin İçi Kaza Panik & Korku Çığlıkları
        cabinPanic: ['panic_scream_f1.mp3', 'panic_scream_f2.mp3', 'kid_crash.mp3'],

        // Kademeli Yolcu Sabır & Hafıza Tepkileri (1: Kibar Uyarı, 2: Sitem, 3: Küfürsüz Öfke)
        patienceMild: [
            { file: 'warn_mild_01.mp3', label: 'Tonton Teyze: "Aman evladım, biraz yumuşak bas şu frene, dizlerim ağrıyor tutunamıyorum."' },
            { file: 'warn_mild_02.mp3', label: 'Yolcu: "Affedersiniz, kasislere biraz daha yavaş girerseniz çok seviniriz, bayağı sarsıldık arkada."' },
            { file: 'kid_bump_01.mp3', label: 'Çocuk Yolcu: "Hoop! Anne sıkı tutun, otobüs bizi havaya uçuracak galiba!"' },
            { file: 'warn_mild_03.mp3', label: 'Pazar Arabalı Teyze: "Ayy domateslerim ezilecek poşette evladım, azıcık yavaş gir şu çukurlara!"' },
            { file: 'warn_mild_04.mp3', label: 'Öğrenci Genç: "Hoop! Telefon elimden uçuyordu az kalsın, ne sert fren oldu öyle ya!"' }
        ],
        patienceMedium: [
            { file: 'warn_medium_01.mp3', label: 'Emekli Amca: "Yeter ama artık yahu! Az önce de sarsıldık, çuval mı taşıyorsunuz insan mı taşıyorsunuz?!"' },
            { file: 'warn_medium_02.mp3', label: 'Yolcu: "Lütfen biraz daha dikkatli sürer misiniz, üst üste ani fren yapıyorsunuz, ayaktaki yolcular düşecek!"' },
            { file: 'warn_medium_03.mp3', label: 'Yolcu: "Pardon ama gömleğime kahve döküldü sarsıntıdan, biraz daha özenli kullanalım lütfen!"' },
            { file: 'warn_medium_04.mp3', label: 'Bebekli Anne: "Rica ediyorum bu kadar sert sarsmayın aracı, bebek ağlayacak şimdi arkada!"' }
        ],
        patienceAngry: [
            { file: 'warn_angry_01.mp3', label: 'Tansiyonlu Teyze: "İndir beni ilk durakta lütfen! Bu ne biçim araba kullanmak böyle, tansiyonum fırladı valla!"' },
            { file: 'warn_angry_02.mp3', label: 'Sinirli Amca: "Yavaş sür biraz şu otobüsü! Her çukura kasise küt küt giriyorsun, sabrımız taştı artık!"' },
            { file: 'warn_angry_03.mp3', label: 'Öfkeli Yolcu: "Beyaz Masayı arayıp plakanızı vereceğim şimdi! Lunapark mı burası, savura savura götürüyorsunuz bizi!"' },
            { file: 'warn_angry_04.mp3', label: 'Öfkeli Teyze: "Tövbe estağfurullah! Evladım bu ne sert sürüş böyle, yüreğimiz ağzımıza geldi kaçıncı sarsıntı bu!"' }
        ],
        // 4. Kademe: Şiddetli Agresif Çıkış & Sert Kavga Tonu
        patienceFurious: [
            { file: 'agg_lvl4_m1.mp3', label: 'Çileden Çıkan Yolcu: "YETER ARTIK YETER!! Canımızı sokakta mı bulduk biz yahu?! Doğru düzgün sür şu otobüsü!!"' },
            { file: 'agg_lvl4_m2.mp3', label: 'Bağıran Emekli: "NE YAPIYORSUNUZ SİZ YAHU?! Fren değil balyoz mübarek, boynumuz kırılacaktı az kalsın!!"' },
            { file: 'agg_lvl4_f1.mp3', label: 'Öfkeli Yolcu: "YETER AMA ARTIK YA!! Çantalar bir yana uçtu biz bir yana savrulduk, insan taşıyorsunuz burada İNSAN!!"' },
            { file: 'agg_lvl4_f2.mp3', label: 'Öfkeli Anne: "ÇOCUĞUM AĞLIYOR KORKUDAN GÖRÜYOR MUSUNUZ?! Hiç mi insafınız yok sizin, YAVAŞLAYIN ARTIK!!"' },
            { file: 'agg_lvl4_m3.mp3', label: 'Sert Çıkışan Genç: "ŞAKA MI YAPIYORSUNUZ SİZ YA?! Lunapark çarpışan arabası mı bu, KENDİNİZE GELİN!!"' },
            { file: 'agg_lvl4_f3.mp3', label: 'Bağıran Teyze: "EL İNSAF BE EVLADIM EL İNSAF!! İçimiz dışımıza çıktı, kemiklerimiz birbirine geçti!!"' },
            { file: 'agg_lvl4_m4.mp3', label: 'Gürleyen Yolcu: "HOOOP KENDİNİZE GELİN ARTIK!! Koca otobüsü oyuncak gibi savuruyorsunuz, can güvenliğimiz kalmadı!!"' },
            { file: 'agg_lvl4_f4.mp3', label: 'Öfkeli Üniversiteli: "YUH ARTIK GERÇEKTEN YUH!! Az kalsın koridora kapaklanıyordum, şikayet edeceğim sizi!!"' }
        ],
        // 5. Kademe: KABİN İSYANI & OTOBÜSÜ DURDURUP İNME KRİZİ!
        cabinRiot: [
            { file: 'riot_stop_m1.mp3', label: 'KABİN İSYANI: "ÇEK SAĞA DURDUR ŞU OTOBÜSÜ HEMEN!! İniyoruz yahu yürüyerek gideriz daha iyi, AÇ ŞU KAPIYI!!"' },
            { file: 'riot_stop_f1.mp3', label: 'KABİN İSYANI: "DURDURUN OTOBÜSÜ İNECEĞİM ŞİMDİ!! Hat numaranızı da aldım doğrudan müdürlüğe şikayet ediyorum!!"' },
            { file: 'riot_stop_m2.mp3', label: 'KABİN İSYANI: "AÇIN KAPIYI İNDİRİN BİZİ ŞURADA!! Sizin yüzünüzden hastanelik mi olacağız, YAZIKLAR OLSUN!!"' },
            { file: 'riot_stop_f2.mp3', label: 'KABİN İSYANI: "AÇ ŞU KAPIYI EVLADIM İNECEĞİM!! Kalbim sıkıştı vallahi billahi, İNDİR BENİ HEMEN!!"' },
            { file: 'riot_stop_m3.mp3', label: 'KABİN İSYANI: "ARAÇ KODUNU ÇEKTİM VİDEOYA ALDIM, BİTTİ BU İŞ!! Açın kapıyı iniyoruz!!"' },
            { file: 'riot_stop_m4.mp3', label: 'KABİN İSYANI: "YETER BE KAPIYI AÇIN İNİYORUM!! Kırk yıldır otobüse biniyorum böyle rezalet sürüş görmedim!!"' }
        ],
        // Kaza Sonrası Kabin İçinden Şoföre Çok Sert Öfke Patlaması
        crashRage: [
            { file: 'crash_rage_m1.mp3', label: 'Öfkeli Yolcu: "GÖZÜNÜZ MÜ KÖR YAHU?! Koca otobüsle göz göre göre çarptınız, kırk tane can var bu arabada!!"' },
            { file: 'crash_rage_f1.mp3', label: 'Öfkeli Yolcu: "İNANAMIYORUM YA KAZA YAPTIK!! Yola hiç mi bakmıyorsunuz siz?! Ödümüz koptu, REZALET BU!!"' },
            { file: 'crash_rage_m2.mp3', label: 'Öfkeli Emekli: "ALLAH AKIL FİKİR VERSİN!! Koca yolu tutturamadınız gittiniz arabaya vurdunuz, perişan ettiniz hepimizi!!"' },
            { file: 'crash_rage_f2.mp3', label: 'Öfkeli Yolcu: "ÇILDIRACAĞIM ŞİMDİ KAZA YAPTINIZ RESMEN!! Başımızı cama çarptık, derhal polis çağırın!!"' }
        ],
        // Arka Kapıyı Yumruklayarak Bağıran Yolcular
        rearDoorRage: [
            { file: 'reardoor_rage_m1.mp3', label: 'Kapıyı Yumruklayan Yolcu: "ARKA KAPIYI AÇSANIZA YAHU!! Durağı geçirteceksiniz bize, AÇIN ŞU KAPIYI!!"' },
            { file: 'reardoor_rage_f1.mp3', label: 'Bağıran Yolcu: "ARKA KAPI DİYORUZ ARKA KAPI!! Görmüyor musunuz aynadan, AÇSANIZA ŞU KAPIYI ARTIK!!"' },
            { file: 'reardoor_rage_m2.mp3', label: 'Öfkeli Genç: "HOOOP KAPIYI UNUTTUNUZ KAPIYI!! Esir mi aldınız bizi otobüste, açsanıza şu arka kapıyı!!"' }
        ],
        // 100+ km/s Ölüm Korkusu & Sert Viraj Öfkesi & Yolcuların Kendi Arasında Kavgası
        speedRage: [
            { file: 'speed_rage_m1.mp3', label: 'Bağıran Yolcu: "YÜZÜ GEÇTİNİZ YÜZÜ!! Uçurumdan mı atacaksınız bizi, çekin ayağınızı şu gazdan hemen!!"' },
            { file: 'speed_rage_f1.mp3', label: 'Çığlık Atan Yolcu: "YAVAŞLAYIN DİYORUM SİZE YAVAŞLAYIN!! Kalp krizi geçireceğiz arkada, İMDAAAT!!"' }
        ],
        curveRage: [
            { file: 'curve_rage_m1.mp3', label: 'Gürleyen Yolcu: "DEVİRİYORDUNUZ OTOBÜSÜ AZ KALSIN!! Viraja bu süratle mi girilir, aklınızı mı kaçırdınız?!"' },
            { file: 'curve_rage_f1.mp3', label: 'Bağıran Yolcu: "AYYY YERE DÜŞTÜK ARKADA!! Virajda hepimiz üst üste yığıldık, ne biçim savuruyorsunuz YA!!"' }
        ],
        bickerCrowd: [
            { file: 'bicker_crowd_m1.mp3', pan: -0.35, label: 'Yolcu Tartışması: "Üstüme üstüme abanmasana be arkadaşım! Zaten otobüs beşik gibi sallanıyor, ayağıma bastın kaç kere!"' },
            { file: 'bicker_crowd_f1.mp3', pan: 0.35, label: 'Yolcu Tartışması: "İtmesenize arkadan ya! Görmüyor musunuz tıklım tıklım otobüs, üst üste mi çıkalım?!"' },
            { file: 'bicker_ac_pair.mp3', pan: -0.25, label: 'Yolcu Kavgası: "İçerisi hamam gibi oldu nefes alamıyoruz, hala camı kapat diyorsunuz! Şu klimayı açın artık!!"' }
        ],

        // Sert Viraj, Aşırı Hız, Uzun Bekleme, Korna Sitemi, Usta Sürüş Övgüsü & Doğal Kabin Sohbetleri
        curvePanic: [
            { file: 'curve_panic_f1.mp3', label: 'Teyze: "Ayyy savrulduk! Evladım viraja bu hızla girilir mi hiç, devrileceğiz şimdi!"' },
            { file: 'curve_panic_m1.mp3', label: 'Emekli Amca: "Hooop tutunun millet! Yarış pistinde miyiz yahu, virajda yan yattı koca otobüs!"' },
            { file: 'curve_kid_01.mp3', label: 'Çocuk Yolcu: "Uuuu! Lunapark treni gibi yana yattık anneee!"' }
        ],
        curveMurmur: { file: 'curve_murmur_f1.mp3', label: 'Yolcu: "Üff başım döndü valla, virajlara biraz daha yumuşak girsek keşke."' },
        stopBell: [
            { file: 'stop_bell_01.mp3', label: 'Tonton Teyze: "Evladım, müsait bir yerde gelecek durakta indirebilir misin zahmet olmazsa?"' },
            { file: 'stop_bell_02.mp3', label: 'Emekli Amca: "Gelecek durakta ineceğiz inşallah, arka kapıyı unutmayalım!"' },
            { file: 'stop_bell_03.mp3', label: 'Öğrenci: "Pardon, gelecek durakta inecek var!"' }
        ],
        stopBellFinal: { file: 'stop_bell_final.mp3', label: 'Yolcu: "Son durağa geldik çok şükür, ellerinize emeğinize sağlık, iyi günler!"' },
        alightThanks: [
            { file: 'alight_thank_01.mp3', label: 'İnen Teyze: "Ellerine kollarına sağlık evladım, Allah kaza bela vermesin, hayırlı işler!"' },
            { file: 'alight_thank_02.mp3', label: 'İnen Amca: "Kazasız belasız hayırlı nöbetler olsun, kolay gelsin!"' },
            { file: 'alight_thank_03.mp3', label: 'İnen Öğrenci: "Çok teşekkürler, ellerinize sağlık, iyi günler kolay gelsin!"' }
        ],
        alightAngry: { file: 'alight_angry_01.mp3', label: 'Sitemli İnen Yolcu: "Oh be nihayet indik, içimiz dışımıza çıktı valla bu nasıl sürüş!"' },
        waitLong: [
            { file: 'wait_long_01.mp3', label: 'Sabırsız Yolcu: "Of ya, ne bitmez trafikmiş arkadaş! Önümüzde yol mu tıkandı acaba, niye hiç kıpırdamıyoruz?"' },
            { file: 'wait_long_02.mp3', label: 'Öğrenci Kız: "Eyvah derse geç kaldık yine, saat kaç oldu hâlâ kıpırdamadık!"' },
            { file: 'wait_long_03.mp3', label: 'Tonton Teyze: "Sabır çekin evladım sabır, uçacak hali yok ya şoförün, açılır şimdi yol!"' }
        ],
        overspeed: [
            { file: 'overspeed_01.mp3', label: 'Korkan Yolcu: "Pardon, biraz yavaş mı gitsek acaba? İbre doksanı geçti, korkuyoruz arkada!"' },
            { file: 'overspeed_02.mp3', label: 'Emekli Amca: "Aman gözünü seveyim acelemiz yok, geç olsun güç olmasın, ayağını gazdan biraz çek lütfen!"' },
            { file: 'overspeed_kid.mp3', label: 'Heyecanlı Çocuk: "Vaaay baba bak, otobüs yarış arabası gibi gidiyor vıııınn!"' }
        ],
        hornSpam: [
            { file: 'horn_spam_01.mp3', label: 'Emekli Amca: "Kulağımızın pası silindi valla, düğün konvoyunda mıyız yahu, basma şu kornaya bu kadar!"' },
            { file: 'horn_spam_02.mp3', label: 'Bebekli Anne: "Rica ediyorum basmayın şu kornaya artık, kucağımda bebek uyuyor, sıçrattınız çocuğu!"' }
        ],
        smoothPraise: [
            { file: 'praise_smooth_01.mp3', label: 'Emekli Şoför Amca: "Maşallah be, bileğine sağlık! Vites geçişleri, frenaj pamuk gibi, kırk yıllık usta şoförsün valla!"' },
            { file: 'praise_smooth_02.mp3', label: 'Tonton Teyze: "Çay bardağını konsola koysan bir damla dökülmez valla, pamuk gibi sürüyorsun evladım!"' },
            { file: 'praise_smooth_03.mp3', label: 'Genç Yolcu: "Valla helal olsun, arkada mışıl mışıl dinlendik, sürüşünüz on numara gerçekten!"' }
        ],
        ambientSlice: [
            { file: 'ambient_phone_01.mp3', pan: -0.35, label: 'Arka Koltuk (Telefon): "Alo hanım, otobüsteyim şimdi, on dakikaya merkezde inerim, sıcak ekmek de alırım gelirken..."' },
            { file: 'ambient_phone_f1.mp3', pan: 0.35, label: 'Öğrenci Sohbeti: "Kanka bindim otobüse geliyorum, kantinde çayı söyle sen, beş dakikaya kampüsteyim!"' },
            { file: 'ambient_seat_offer.mp3', pan: -0.25, label: 'Kibar Genç: "Buyur teyzeciğim sen şöyle cam kenarına otur, ben ayakta giderim hiç sorun değil."' },
            { file: 'ambient_kid_question.mp3', pan: 0.25, label: 'Meraklı Çocuk: "Anne bak! Şoför koltuğunun önünde ne kadar çok ışıklı düğme var, ben de büyüyünce otobüs şoförü olacağım!"' },
            { file: 'ambient_route_ask.mp3', pan: 0.3, label: 'Yolcu Sorusu: "Çok pardon, bu otobüs merkez durağından geçiyor mu acaba?"' }
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
            { file: 'amca_cologne.mp3', text: 'Eyvallah çok sağ olasın, hem sürüş rahatladı hem kolonya ferahlattı içimizi.' },
            { file: 'kid_cologne.mp3', text: 'Vaaay limon kolonyası! Mis gibi koktu ellerim, çok teşekkürler!' }
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
                    src: [BASE_PATH + filename + AUDIO_VER],
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
                const a = new Audio(BASE_PATH + filename + AUDIO_VER);
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
                this.angerLevel = Math.min(5, (this.angerLevel || 0) + 2);
                this.playClip(CLIPS.sfxGasp, {
                    pan: 0,
                    volume: 0.72,
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
                        // Ağır darbede kabin içinden korku çığlığı + şoföre şiddetli öfke patlaması + acil merkez telsizi
                        if (passengersOnBoard > 0 && damageAmount >= 15) {
                            const rageItem = this.pickRandom(CLIPS.crashRage);
                            setTimeout(() => {
                                this.playClip(CLIPS.sfxUproar, { pan: 0, volume: 0.55, backgroundSfx: true, force: forceTest });
                                this.playClip(rageItem.file, {
                                    pan: -0.15,
                                    volume: 0.98,
                                    force: forceTest,
                                    nvdaText: rageItem.label,
                                    toastText: `🤬 ${rageItem.label}`,
                                    toastType: 'error'
                                });
                            }, 220);
                        } else if (passengersOnBoard > 0) {
                            const panicFile = this.pickRandom(CLIPS.cabinPanic);
                            setTimeout(() => {
                                this.playClip(panicFile, { pan: 0, volume: 0.92, force: forceTest });
                            }, 220);
                        }
                        if (damageAmount >= 30 && !forceTest) {
                            setTimeout(() => {
                                this.playEmergencyDispatchCrash();
                            }, 4600);
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

        // 4. 5 KADEMELİ AGRESİF YOLCU SABIR & KABİN İSYANI SİSTEMİ (1: Kibar -> 2: Sitem -> 3: Kızgın -> 4: Sert Kavga -> 5: KABİN İSYANI!)
        onRoughDriving: function (reason, passengersOnBoard) {
            if (!this.canSpeakInCabin() || (passengersOnBoard || 0) <= 0) return false;
            const now = performance.now();
            if (this.lastJoltVoiceTime && (now - this.lastJoltVoiceTime < 6500)) return false;
            this.lastJoltVoiceTime = now;

            this.angerLevel = Math.min(5, (this.angerLevel || 0) + 1);

            // 5. KADEME: TAM KABİN İSYANI + CAMA YUMRUK + BEYAZ MASA ŞİKAYET CEZASI!
            if (this.angerLevel >= 5) {
                this.pendingRiotWalkout = true;
                const riot = this.pickRandom(CLIPS.cabinRiot);
                this.playClip(CLIPS.sfxDoorBang, { pan: -0.45, volume: 0.88, backgroundSfx: true });
                this.playClip(CLIPS.sfxUproar, { pan: 0, volume: 0.62, backgroundSfx: true });
                if (typeof game !== 'undefined' && typeof game.money === 'number' && game.money >= 50) {
                    game.money -= 50;
                    const moneyEl = document.getElementById('hud-money');
                    if (moneyEl) moneyEl.innerText = `${Math.floor(game.money)} ₺`;
                }
                setTimeout(() => {
                    this.playClip(riot.file, {
                        pan: -0.35,
                        volume: 1.0,
                        interrupt: true,
                        nvdaText: riot.label + ' Yolcular kapıyı yumruklayıp Beyaz Masaya şikayet etti! Eksi 50 Lira konfor cezası!',
                        toastText: `🚨 ${riot.label} (-50 ₺ Beyaz Masa Cezası!)`,
                        toastType: 'error',
                        onend: () => {
                            setTimeout(() => this.playRiotDispatchAlert(5), 350);
                        }
                    });
                }, 420);
                return true;
            }

            let pool = CLIPS.patienceMild;
            let toastPrefix = '🗣️';
            let toastLvl = 'info';
            if (this.angerLevel === 2) {
                pool = CLIPS.patienceMedium;
            } else if (this.angerLevel === 3) {
                pool = CLIPS.patienceAngry;
                toastPrefix = '😠';
                toastLvl = 'warning';
            } else if (this.angerLevel === 4) {
                pool = CLIPS.patienceFurious;
                toastPrefix = '🤬';
                toastLvl = 'error';
                this.playClip(CLIPS.sfxUproar, { pan: 0, volume: 0.45, backgroundSfx: true });
            }

            const isLvl4Warn = (this.angerLevel === 4);
            const chosen = this.pickRandom(pool);
            const randomCabinPan = Number(((Math.random() - 0.5) * 0.55).toFixed(2));
            setTimeout(() => {
                this.playClip(chosen.file, {
                    pan: randomCabinPan,
                    volume: this.angerLevel >= 4 ? 0.98 : 0.94,
                    interrupt: this.angerLevel >= 4,
                    nvdaText: chosen.label + (isLvl4Warn ? ' Dikkat: Yolcu gerginliği 4. seviyede! Bir sarsıntı daha olursa 5. seviye kabin isyanı çıkacak!' : ''),
                    toastText: `${toastPrefix} [Seviye ${this.angerLevel}/5] ${chosen.label}`,
                    toastType: toastLvl,
                    onend: () => {
                        if (isLvl4Warn) {
                            setTimeout(() => this.playRiotDispatchAlert(4), 380);
                        }
                    }
                });
            }, 320);
            return true;
        },

        playRiotDispatchAlert: function (lvl) {
            if (!this.canSpeakInCabin()) return;
            const file = lvl >= 5 ? 'dispatch_riot_lvl5.mp3' : 'dispatch_riot_warn_lvl4.mp3';
            if (typeof audio !== 'undefined' && typeof audio.playRadioSquelch === 'function') {
                audio.playRadioSquelch(true);
            }
            setTimeout(() => {
                this.playClip(file, {
                    pan: -0.2,
                    volume: 0.95,
                    toastText: lvl >= 5
                        ? '📻 [MERKEZ]: 5. Seviye Kabin İsyanı! Beyaz Masa şikayeti ve -50 ₺ ceza işlendi!'
                        : '📻 [MERKEZ İKAZI]: Yolcu Gerginliği 4/5! 5. seviyede isyan çıkacak, Alt+V ile kolonya dağıtın veya yavaşlayın!',
                    toastType: lvl >= 5 ? 'error' : 'warning',
                    onend: () => {
                        if (typeof audio !== 'undefined' && typeof audio.playRadioSquelch === 'function') {
                            setTimeout(() => audio.playRadioSquelch(false), 85);
                        }
                    }
                });
            }, 160);
        },

        getAngerStatusText: function () {
            const lvl = this.angerLevel || 0;
            if (lvl === 0) return 'Yolcu gerginliği 5 üzerinden 0, herkes huzurlu.';
            if (lvl === 1) return 'Yolcu gerginliği 5 üzerinden 1, hafif huzursuzluk var.';
            if (lvl === 2) return 'Yolcu gerginliği 5 üzerinden 2, yolcular sitemli.';
            if (lvl === 3) return 'Yolcu gerginliği 5 üzerinden 3, yolcular öfkeli.';
            if (lvl === 4) return 'Dikkat! Yolcu gerginliği 5 üzerinden 4, kritik sınır! Bir sarsıntıda 5. seviye kabin isyanı çıkabilir, Alt ve V ile kolonya ikram edin!';
            return 'Alarm! Yolcu gerginliği 5 üzerinden 5, kabinde isyan var!';
        },

        onRearDoorBanging: function () {
            if (!this.canSpeakInCabin()) return false;
            this.angerLevel = Math.min(5, (this.angerLevel || 0) + 1);
            const chosen = this.pickRandom(CLIPS.rearDoorRage);
            this.playClip(CLIPS.sfxDoorBang, { pan: -0.55, volume: 0.88, backgroundSfx: true });
            setTimeout(() => {
                this.playClip(chosen.file, {
                    pan: -0.5,
                    volume: 0.98,
                    interrupt: true,
                    nvdaText: chosen.label + ' Arka kapıyı açmak için PageDown tuşuna basın!',
                    toastText: `👊 ${chosen.label} (PageDown)`,
                    toastType: 'error'
                });
            }, 420);
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
                this.angerLevel = Math.min(5, (this.angerLevel || 0) + 1);
                const useRage = (this.angerLevel >= 3);
                const chosen = this.pickRandom(useRage ? CLIPS.curveRage : CLIPS.curvePanic);
                if (useRage) this.playClip(CLIPS.sfxUproar, { pan: 0, volume: 0.48, backgroundSfx: true });
                this.playClip(chosen.file, {
                    pan: throwPan,
                    volume: 0.98,
                    interrupt: true,
                    nvdaText: chosen.label,
                    toastText: `${useRage ? '🤬' : '↩️'} ${chosen.label}`,
                    toastType: useRage ? 'error' : 'warning'
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
            if (deltaMinutes >= 7.0) {
                setTimeout(() => {
                    if (this.activeHowl && this.activeHowl.playing && this.activeHowl.playing()) return;
                    this.playClip('late_rage_f1.mp3', {
                        pan: 0.45,
                        volume: 0.96,
                        nvdaText: 'Duraktaki öfkeli yolcu: Bu kaçıncı rötar ya! Yarım saattir soğukta durakta dikiliyoruz, böyle ciddiyetsizlik olmaz!',
                        toastText: '🤬 Öfkeli Yolcu: "BU KAÇINCI RÖTAR YA!! Yarım saattir soğukta durakta dikiliyoruz!!"',
                        toastType: 'error'
                    });
                }, 3100);
                return true;
            } else if (deltaMinutes >= 4.0) {
                setTimeout(() => {
                    if (this.activeHowl && this.activeHowl.playing && this.activeHowl.playing()) return;
                    this.playClip('late_complain_01.mp3', {
                        pan: 0.45,
                        volume: 0.90,
                        nvdaText: 'Duraktaki yolcu rötar sitemi: Neredesiniz yahu, ağaç olduk durakta beklemekten!',
                        toastText: '⏱️ Duraktaki Yolcu: "Neredesiniz yahu, ağaç olduk durakta beklemekten, rötar yaptı bu hat!"',
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
                            nvdaText: 'Duraktaki yolcu: Vallahi İsviçre saati gibi tam dakikasında geldi otobüs, helal olsun size!',
                            toastText: '⌚ Yolcu: "İsviçre saati gibi tam dakikasında geldi otobüs, helal olsun size!"',
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
            this._waitCount = (this._waitCount || 0) + 1;
            if ((this.angerLevel || 0) >= 2 || (this._waitCount % 2 === 0)) {
                this.playClip('wait_rage_m1.mp3', {
                    pan: -0.3,
                    volume: 0.95,
                    nvdaText: 'Öfkeli yolcu: Kök saldık burada yahu! Yürüyerek gitsek çoktan varmıştık!',
                    toastText: '🤬 Öfkeli Yolcu: "KÖK SALDIK BURADA YAHU!! Yürüyerek gitsek çoktan varmıştık!!"',
                    toastType: 'warning'
                });
                return true;
            }
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
                    nvdaText: 'Yolcu telaşı: Yahu bu öten alarm neyin nesi böyle, otobüsün fren havası mı bitti?!',
                    toastText: '🚨 Yolcu: "Yahu bu öten alarm neyin nesi böyle, otobüsün fren havası mı bitti?!"',
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
                        nvdaText: 'Ön koltuktaki yolcu: Affedersiniz, öndeki açık camdan buz gibi cereyan vurdu boynumuza, End tuşuyla kapatabilir misiniz?',
                        toastText: '🪟 Yolcu: "Affedersiniz, öndeki açık camdan buz gibi cereyan vurdu boynumuza! (End: Camı Kapat)"',
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
                    nvdaText: 'Çocuk Yolcu: Mmm! Ön taraftan ne güzel taze çay kokusu geldi, benim de canım simit çekti anne!',
                    toastText: '🫖 Çocuk Yolcu: "Mmm! Ön taraftan ne güzel taze çay kokusu geldi, canım simit çekti anne!"',
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
                nvdaText: 'Durağa doğru koşan bir yolcu var: Hooop durun bekleyin lütfen geliyorum! Ön kapıyı açmak için PageUp tuşuna basın.'
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
                    nvdaText: 'Koşan yolcu bindi: Oh be, helal olsun size, işe yetiştim sayenizde! Artı 60 Lira ve 30 XP.'
                });
            }, 320);
            return true;
        },

        onRunningPassengerMissed: function () {
            if (!this.canSpeakInCabin()) return false;
            this.playClip(CLIPS.runnerMissed, {
                pan: 0.75,
                volume: 0.88,
                nvdaText: 'Yolcu durağa yetişemedi: Ah be, kıl payı gözümün önünde kaçırdım otobüsü.'
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
                    nvdaText: 'Yolcunun kartında bakiye yetersiz: Çok pardon, sınava yetişmem lazım, idare edebilir misiniz? İzin vermek için Y, indirmek için N tuşuna basın.'
                });
            }, 380);
            return true;
        },

        onInsufficientBalanceResolved: function (allowed) {
            if (!this.canSpeakInCabin()) return false;
            if (allowed) {
                this.angerLevel = Math.max(0, (this.angerLevel || 0) - 1);
                this.playClip(CLIPS.studentThankFree, {
                    pan: 0.3,
                    volume: 0.95,
                    interrupt: true,
                    nvdaText: 'Yolcuya izin verdiniz: Çok teşekkür ederim, hayatımı kurtardınız! Artı 50 Lira hoşgörü primi.'
                });
            } else {
                const useRage = Math.random() < 0.55;
                this.playClip(useRage ? 'balance_reject_rage.mp3' : CLIPS.studentSadOff, {
                    pan: 0.3,
                    volume: 0.96,
                    interrupt: true,
                    nvdaText: useRage
                        ? 'Yolcuyu indirdiniz. Öğrenci sitemi: Bir bilet parası için sınav günü öğrencinin kalbini kırdınız ya, yazıklar olsun!'
                        : 'Yolcuyu indirdiniz: Peki, canınız sağ olsun, iyi yolculuklar.'
                });
            }
            return true;
        },

        onRampThank: function () {
            if (!this.canSpeakInCabin()) return false;
            this.angerLevel = Math.max(0, this.angerLevel - 1);
            setTimeout(() => {
                this.playClip(CLIPS.rampThank, {
                    pan: 0.35,
                    volume: 0.95,
                    nvdaText: 'Tekerlekli sandalye rampası açıldı. Yolcu: Allah razı olsun evladım, ellerin dert görmesin. Artı 30 XP.'
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
                nvdaText: 'Arkadan çarptılar! Egzoz hasar aldı. Arkadaki sürücü: Eyvah çok özür dilerim, duramadım!',
                toastText: '💥 Arkadaki Sürücü: "Eyvah çok özür dilerim, aniden durunca arkadan dokundurdum!"',
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
                        nvdaText: 'Yolcu: Ohh be dünya varmış, içerisi ne güzel ferahladı, çok teşekkürler!'
                    });
                }, 1400);
            }
        },

        // 10. AKILLI KABİN İÇİ ORTAM, AŞIRI HIZ, USTA SÜRÜŞ ÖVGÜSÜ & DOĞAL YOLCU SOHBETLERİ
        checkSmartCabinReminders: function (gameObj, deltaTime) {
            if (!gameObj || !gameObj.isDriving || !this.canSpeakInCabin()) return;
            const now = performance.now();

            // Aşırı hız tepkisi (92+ km/s korku, 100+ km/s veya yüksek gerginlikte agresif öfke!)
            if ((gameObj.passengersOnBoard || 0) > 0 && gameObj.speed >= 92) {
                this._overspeedSecs = (this._overspeedSecs || 0) + deltaTime;
                if (this._overspeedSecs >= 5.0 && (!this._lastOverspeedTime || (now - this._lastOverspeedTime > 32000))) {
                    this._overspeedSecs = 0;
                    this._lastOverspeedTime = now;
                    this.lastSmartRemindTime = now;
                    const useRage = (gameObj.speed >= 100 || (this.angerLevel || 0) >= 2);
                    if (useRage) {
                        this.angerLevel = Math.min(5, (this.angerLevel || 0) + 1);
                        const rage = this.pickRandom(CLIPS.speedRage);
                        this.playClip(CLIPS.sfxUproar, { pan: 0, volume: 0.45, backgroundSfx: true });
                        this.playClip(rage.file, {
                            pan: -0.25,
                            volume: 0.98,
                            interrupt: true,
                            nvdaText: rage.label,
                            toastText: `🤬 ${rage.label}`,
                            toastType: 'error'
                        });
                    } else {
                        const chosen = this.pickRandom(CLIPS.overspeed);
                        this.playClip(chosen.file, {
                            pan: -0.25,
                            volume: 0.94,
                            nvdaText: chosen.label,
                            toastText: `🏎️ ${chosen.label}`,
                            toastType: 'warning'
                        });
                    }
                    return;
                }
            } else {
                this._overspeedSecs = 0;
            }

            // Gergin, sıcak veya kalabalık otobüste yolcuların kendi arasında tartışması!
            if ((gameObj.passengersOnBoard || 0) >= 14 || ((gameObj.passengersOnBoard || 0) >= 4 && ((this.angerLevel || 0) >= 2 || (gameObj.busTemperature || 22) >= 27.5))) {
                this._bickerSecs = (this._bickerSecs || 0) + deltaTime;
                if (this._bickerSecs >= 44 && (!this._lastBickerTime || (now - this._lastBickerTime > 48000))) {
                    this._bickerSecs = 0;
                    this._lastBickerTime = now;
                    this.lastSmartRemindTime = now;
                    const bicker = (gameObj.busTemperature >= 27.5 && !gameObj.isACOn)
                        ? CLIPS.bickerCrowd[2]
                        : CLIPS.bickerCrowd[Math.floor(Math.random() * 2)];
                    this.playClip(bicker.file, {
                        pan: bicker.pan,
                        volume: 0.92,
                        nvdaText: bicker.label,
                        toastText: `💢 ${bicker.label}`,
                        toastType: 'warning'
                    });
                    return;
                }
            } else {
                this._bickerSecs = 0;
            }

            // Sarsıntısız sürüşte yolcu sinirinin kademeli yatışması (her 38 sn yumuşak sürüşte -1 kademe)
            if ((this.angerLevel || 0) > 0 && gameObj.speed >= 20 && gameObj.speed <= 82 && (gameObj.passengerComfort || 100) >= 96) {
                this._calmDownSecs = (this._calmDownSecs || 0) + deltaTime;
                if (this._calmDownSecs >= 38) {
                    this._calmDownSecs = 0;
                    this.angerLevel = Math.max(0, this.angerLevel - 1);
                }
            } else {
                this._calmDownSecs = 0;
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
                        nvdaText: 'Yolcu uyarısı: Pardon, farları yakmayı unuttunuz, F tuşuyla farları açabilir misiniz?',
                        toastText: '💡 Yolcu: "Pardon, farları yakmayı unuttunuz galiba! (F tuşu)"',
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
                        toastText: '🌧️ Yolcu: "Pardon, ön cam yağmurdan sırılsıklam oldu, silecekleri çalıştırabilir misiniz? (Shift+W)"',
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
                        nvdaText: 'Yolcu: Affedersiniz, otobüsün içi çok sıcak oldu, K tuşuyla klimayı açabilir misiniz?',
                        toastText: '❄️ Yolcu: "Affedersiniz, içerisi çok havasız kaldı, klimayı açabilir misiniz? (K tuşu)"',
                        toastType: 'info'
                    });
                } else if (gameObj.busTemperature <= 13) {
                    this.lastSmartRemindTime = now;
                    this.playClip('cold_request.mp3', {
                        pan: -0.3,
                        volume: 0.92,
                        nvdaText: 'Yolcu: Üşüdük arkada, K tuşuyla kaloriferi açabilir misiniz?',
                        toastText: '🔥 Yolcu: "Üşüdük arkada, klimayı kaloriferi açabilir misiniz? (K tuşu)"',
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
