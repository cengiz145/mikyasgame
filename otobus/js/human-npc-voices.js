/* ==========================================================================
   MİKYAS YAŞAYAN İNSAN & AKILLI NPC SES MOTORU (HUMAN-NPC-VOICES.JS)
   ElevenLabs v4 Türkçe Stüdyo Dublajı + Özel Ses Efektleri + 3B Yönlü Ses
   12 Farklı Gerçek İnsan Karakteri • Hafızalı Yolcu Sabır Sistemi • Sıfır Argo
   ========================================================================== */

(function (window) {
    'use strict';

    const BASE_PATH = 'sounds/npc_human/';
    const AUDIO_VER = '?v=20261117p28';

    const CLIPS = {
        // Özel Ses Efektleri (ElevenLabs Sound Generation)
        sfxGasp: 'sfx_cabin_gasp.mp3',
        sfxHorn: 'sfx_angry_car_horn.mp3',
        sfxScrape: 'sfx_fender_scrape.mp3',
        sfxDoorBang: 'sfx_door_fist_bang.mp3',
        sfxUproar: 'sfx_cabin_uproar.mp3',
        sfxBagsCrash: 'sfx_bags_crash_aisle.mp3',
        sfxBabyCry: 'sfx_baby_crying_bus.mp3',
        sfxEmergencyValve: 'sfx_emergency_valve_alarm.mp3',

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

        // Dış Trafik & Yaya Çarpışma / Tehlike Tepkileri (3B Sağ/Sol Yönlü + Ağır Kaba Trafik Magandaları)
        crashLeft: [
            { file: 'rude_traffic_m1.mp3', label: 'Sol Şerit Sürücüsü: "ULAN SIĞIR GİBİ ÜSTÜMÜZE KIRDIN KOCA OTOBÜSÜ!! Kör gözüne gözlük mü takalım lan, in aşağı!!"' },
            { file: 'slang_crash_out_m1.mp3', label: 'Sol Şerit Sürücüsü: "OHA LAN KÖR MÜSÜN NESİN?! Koca otobüsü üstümüze çıkardın, haşat ettin arabayı! İn aşağı hesap ver!!"' }
        ],
        crashRight: [
            { file: 'slang_crash_out_f1.mp3', label: 'Kaldırımdaki Mahalleli: "YUH BE GÖZÜNÜ TOPRAK DOYURSUN!! Kaldırıma çıktın be manyak, ezip geçecektin bizi, önüne baksana!!"' },
            { file: 'rude_traffic_m1.mp3', label: 'Sağ Şerit Sürücüsü: "ULAN SIĞIR GİBİ ÜSTÜMÜZE KIRDIN KOCA OTOBÜSÜ!! Kör gözüne gözlük mü takalım lan, in aşağı!!"' }
        ],
        crashFront: [
            { file: 'rude_traffic_m1.mp3', label: 'Öndeki Sürücü: "ULAN SIĞIR GİBİ ÜSTÜMÜZE KIRDIN KOCA OTOBÜSÜ!! Kör gözüne gözlük mü takalım lan, in aşağı!!"' },
            { file: 'slang_crash_out_m1.mp3', label: 'Öndeki Sürücü: "OHA LAN KÖR MÜSÜN NESİN?! Koca otobüsü üstümüze çıkardın, haşat ettin arabayı! İn aşağı hesap ver!!"' }
        ],
        nearMiss: [
            { file: 'rude_traffic_m2.mp3', label: 'Yan Şerit Sürücüsü: "YAVAŞ GEÇ LAN ŞUURSUZ!! Aynayı elimize verecektin be, babanın asfaltı mı burası davar gibi sıkıştırıyorsun?!"' },
            { file: 'npc_nearmiss_01.mp3', label: 'Yan Şerit Sürücüsü: "Yavaş geç biraz yavaş! Koca otobüsün rüzgarından savrulduk!"' }
        ],
        redLight: [
            { file: 'rude_traffic_f1.mp3', label: 'Yaya Geçidindeki Mahalleli: "KÖR MÜSÜN LAN KIRMIZI YANIYOR KIRMIZI!! Çiğneyip geçecektin bizi be manyak, yuh senin sıfatına!!"' },
            { file: 'npc_redlight_01.mp3', label: 'Kavşaktaki Sürücü: "Hooop! Kırmızı yanıyor kırmızı, görmüyor musun?! Az kalsın kavşakta biçiyordun bizi!"' }
        ],

        // Kabin İçi Kaza Panik & Korku Çığlıkları
        cabinPanic: ['panic_scream_f1.mp3', 'panic_scream_f2.mp3', 'kid_crash.mp3'],

        // AKILLI SEBEP, ROL, KALABALIK VE SAAT ETİKETLİ YOLCU HAVUZLARI (Fren vs Kasis vs Zikzak %100 Fiziksel Eşleşmeli!)
        patienceMild: [
            { file: 'rude_mild_m1.mp3', causes: ['brake'], label: 'Kaba Yolcu: "Höst lan höst! Hayvan gibi asılma şu frene be, insan var arkada kereste mi taşıyorsun?!"' },
            { file: 'rude_mild_f1.mp3', causes: ['brake'], label: 'Atarlı Yolcu: "Yavaş be yavaş, ne abanıyorsun pedala kazma gibi?! Boynumuz koptu şurada!"' },
            { file: 'slang_jolt_f4.mp3', causes: ['brake'], role: 'ogrenci', label: 'Atarlı Genç: "ÇÜŞ ARTIK YA HARBİDEN ÇÜŞ!! Burnum cama yapıştı resmen, patates çuvalı mı var arkada, ne bu kabalık be?!"' },
            { file: 'warn_mild_04.mp3', causes: ['brake'], role: 'ogrenci', label: 'Öğrenci Genç: "Hoop! Telefon elimden uçuyordu az kalsın, ne sert fren oldu öyle ya!"' },
            { file: 'warn_mild_01.mp3', causes: ['brake'], role: 'yasli', label: 'Tonton Teyze: "Aman evladım, biraz yumuşak bas şu frene, dizlerim ağrıyor tutunamıyorum."' },
            { file: 'warn_mild_03.mp3', causes: ['kasis'], role: 'yasli', label: 'Pazar Arabalı Teyze: "Ayy domateslerim ezilecek poşette evladım, azıcık yavaş gir şu çukurlara!"' },
            { file: 'warn_mild_02.mp3', causes: ['kasis'], label: 'Yolcu: "Affedersiniz, kasislere biraz daha yavaş girerseniz çok seviniriz, bayağı sarsıldık arkada."' },
            { file: 'micro_tsk_sigh.mp3', causes: ['brake', 'swerve', 'any'], role: 'yasli', label: 'Yaşlı Yolcu (Dil Şaklatıp İç Çekti): "Cık cık cık... Püff, Allah sabır versin ya Rabbi..."' },
            { file: 'kid_bump_01.mp3', causes: ['kasis', 'swerve'], role: 'kid', label: 'Çocuk Yolcu: "Hoop! Anne sıkı tutun, otobüs bizi havaya uçuracak galiba!"' }
        ],
        patienceMedium: [
            { file: 'slang_jolt_f3.mp3', causes: ['brake'], label: 'Cırlayan Yolcu: "MANYAK MISIN NESİN BE?! Ödümüz patladı şurada, babanın çiftliği mi burası kafana göre fren köklüyorsun?!"' },
            { file: 'warn_medium_02.mp3', causes: ['brake'], minPass: 4, label: 'Yolcu: "Lütfen biraz daha dikkatli sürer misiniz, üst üste ani fren yapıyorsunuz, ayaktaki yolcular düşecek!"' },
            { file: 'slang_jolt_m3.mp3', causes: ['brake', 'kasis'], label: 'Atarlı Yolcu: "HOOOP YAVAŞ OL LAN BİRAZ!! Kafamızı demire gömdük senin yüzünden, artistlik mi yapıyorsun şoförlük mü belli değil be!!"' },
            { file: 'rude_hard_m3.mp3', causes: ['kasis'], role: 'yasli', label: 'Huysuz İhtiyar: "ULAN KAFA MI BULUYORSUN BİZİMLE?! Küt küt bütün çukurları saydın be beceriksiz, git kumda oyuncak kamyon sür sen!!"' },
            { file: 'rude_hard_m4.mp3', causes: ['swerve', 'kasis'], label: 'Bıçkın Genç: "LAN KAFAN MI GÜZEL NE İÇTİN ÇIKTIN YOLA?! Zikzak çize çize maymuna çevirdin milleti, delirtme adamı!!"' },
            { file: 'warn_medium_03.mp3', causes: ['kasis', 'swerve'], label: 'Yolcu: "Pardon ama gömleğime kahve döküldü sarsıntıdan, biraz daha özenli kullanalım lütfen!"' },
            { file: 'warn_medium_04.mp3', causes: ['any'], role: 'kid', label: 'Bebekli Anne: "Rica ediyorum bu kadar sert sarsmayın aracı, bebek ağlayacak şimdi arkada!"' },
            { file: 'warn_medium_01.mp3', causes: ['any'], role: 'yasli', label: 'Emekli Amca: "Yeter ama artık yahu! Az önce de sarsıldık, çuval mı taşıyorsunuz insan mı taşıyorsunuz?!"' }
        ],
        patienceAngry: [
            { file: 'rude_hard_m2.mp3', causes: ['brake'], label: 'Hödük Esnaf: "ÇÜŞ BE AYI GİBİ ABANDIN FRENE!! Şanzımanı kucağımıza bıraktın lan, aldığın ehliyetin mührünü seveyim kazma!!"' },
            { file: 'slang_jolt_m2.mp3', causes: ['brake'], label: 'Ters Esnaf: "ÇÜŞŞ BE ÇÜŞ!! Ehliyeti bakkaldan promosyon mu aldın sen, at arabası mı sürüyorsun lan?!"' },
            { file: 'rude_hard_f1.mp3', causes: ['brake', 'swerve'], label: 'Ağzı Bozuk Abla: "GERİ ZEKALI MIDIR NEDİR YA?! Kafamızı cama geçirdin be şuursuz, gözün mü kör ayağın mı felçli senin?!"' },
            { file: 'warn_angry_02.mp3', causes: ['kasis'], role: 'yasli', label: 'Sinirli Amca: "Yavaş sür biraz şu otobüsü! Her çukura kasise küt küt giriyorsun, sabrımız taştı artık!"' },
            { file: 'rude_hard_m1.mp3', causes: ['kasis', 'brake'], label: 'Zorba Yolcu: "ULAN DANGALAK MISIN NESİN SEN?! Dağdan mı indin şehre, el arabası bile teslim edilmez sana!!"' },
            { file: 'rude_hard_f2.mp3', causes: ['any'], role: 'yasli', label: 'Bedduacı Teyze: "BOYUN DEVRİLMESİN EMİ ZIRDELİ!! Ciğerimiz ağzımıza geldi be, mezarlığa mı yetiştiriyorsun bizi şuursuz?!"' },
            { file: 'warn_angry_03.mp3', causes: ['swerve', 'any'], label: 'Öfkeli Yolcu: "Beyaz Masayı arayıp plakanızı vereceğim şimdi! Lunapark mı burası, savura savura götürüyorsunuz bizi!"' }
        ],
        patienceFurious: [
            { file: 'agg_lvl4_m2.mp3', causes: ['brake'], role: 'yasli', label: 'Bağıran Emekli: "NE YAPIYORSUNUZ SİZ YAHU?! Fren değil balyoz mübarek, boynumuz kırılacaktı az kalsın!!"' },
            { file: 'agg_lvl4_f4.mp3', causes: ['brake'], role: 'ogrenci', label: 'Öfkeli Üniversiteli: "YUH ARTIK GERÇEKTEN YUH!! Az kalsın koridora kapaklanıyordum, şikayet edeceğim sizi!!"' },
            { file: 'slang_jolt_f2.mp3', causes: ['kasis'], role: 'yasli', minPass: 5, label: 'Terslenen Teyze: "TÜH KALIBINA YAZIKLAR OLSUN BE!! Traktör mü sürüyorsun tarlada, haşat ettin koca otobüsteki milleti!!"' },
            { file: 'slang_jolt_m1.mp3', causes: ['kasis', 'any'], label: 'Mahalleli Yolcu: "OHA BE OHA!! Odun mu taşıyorsun çuval mı taşıyorsun lan?! Adam gibi sür şunu tepemin tasını attırma benim!!"' },
            { file: 'slang_jolt_f1.mp3', causes: ['swerve', 'any'], label: 'Mahalle Ablası: "AY YETER BE ASABIMI BOZMA BENİM!! Şoför müsün kasap mısın nesin sen ya?! Doğru sür şu tenekeyi!!"' },
            { file: 'slang_jolt_m4.mp3', causes: ['kasis', 'any'], role: 'yasli', label: 'Kavgacı Emekli: "ULAN YETER BE SABRIMIZI MI SINIYORSUN?! Süremiyorsan in koltuktan biz sürelim be!!"' },
            { file: 'agg_lvl4_f2.mp3', causes: ['any'], role: 'kid', label: 'Öfkeli Anne: "ÇOCUĞUM AĞLIYOR KORKUDAN GÖRÜYOR MUSUNUZ?! Hiç mi insafınız yok sizin, YAVAŞLAYIN ARTIK!!"' },
            { file: 'agg_lvl4_m1.mp3', causes: ['any'], minPass: 3, label: 'Çileden Çıkan Yolcu: "YETER ARTIK YETER!! Canımızı sokakta mı bulduk biz yahu?! Doğru düzgün sür şu otobüsü!!"' }
        ],
        cabinRiot: [
            { file: 'rude_berserk_m1.mp3', label: 'Şoföre Yürüyen Kabadayı: "ULAN İN O KOLTUKTAN AŞAĞI GEL BURAYA!! Aç lan şu kapıyı yoksa camı indireceğim ha!!"' },
            { file: 'rude_berserk_m2.mp3', label: 'Gürleyen Esnaf: "YETER ULAN REZİL RÜSVA ETTİN BİZİ!! Şoför değil canlı bomba mübarek, çek sağa defol git gözümüz görmesin!!"' },
            { file: 'rude_berserk_f1.mp3', minPass: 4, label: 'Çıldıran Mahalle Ablası: "AÇ LAN ŞU KAPIYI MANYAK!! Tımarhaneden mi kaçtın nereden çıktın başımıza belasın!!"' },
            { file: 'slang_riot_f2.mp3', role: 'yasli', label: 'Terlikli Teyze: "İNDİR BİZİ ŞURADA ZIRDELİ!! Vallahi ayağımdan terliği çıkarıp fırlatacağım şimdi ön tarafa, aç şu kapıyı be!!"' },
            { file: 'slang_riot_m1.mp3', label: 'Kabadayı Yolcu: "ÇEK LAN SAĞA ÇEK DİYORUM SANA!! Vallahi şoför mahalline dalacağım şimdi ha! Aç şu kapıyı zırdeli!!"' }
        ],
        berserkMeltdown: [
            { file: 'rude_berserk_m1.mp3', label: 'Şoföre Yürüyen Kabadayı: "ULAN İN O KOLTUKTAN AŞAĞI GEL BURAYA!! Aç lan şu kapıyı yoksa camı indireceğim ha!!"' },
            { file: 'rude_berserk_f1.mp3', minPass: 4, label: 'Çıldıran Mahalle Ablası: "AÇ LAN ŞU KAPIYI MANYAK!! Tımarhaneden mi kaçtın nereden çıktın başımıza belasın!!"' },
            { file: 'rude_berserk_m2.mp3', label: 'Gürleyen Esnaf: "YETER ULAN REZİL RÜSVA ETTİN BİZİ!! Şoför değil canlı bomba mübarek, çek sağa defol git!!"' },
            { file: 'rude_berserk_m3.mp3', minPass: 8, label: 'İsyancı Genç: "ULAN YÜRÜYÜN ŞOFÖR KABİNİNE DAYANALIM!! Bu delinin duracağı yok, hepimizi şarampole yuvarlayacak, DURDURUN LAN ŞUNU!!"' },
            { file: 'slang_riot_m1.mp3', label: 'Kabadayı Yolcu: "ÇEK LAN SAĞA ÇEK DİYORUM SANA!! Vallahi şoför mahalline dalacağım şimdi ha! Aç şu kapıyı zırdeli!!"' },
            { file: 'slang_riot_f2.mp3', role: 'yasli', label: 'Terlikli Teyze: "İNDİR BİZİ ŞURADA ZIRDELİ!! Vallahi ayağımdan terliği çıkarıp fırlatacağım şimdi ön tarafa, aç şu kapıyı be!!"' },
            { file: 'slang_riot_f1.mp3', label: 'Mahalle Ablası: "AÇ KAPIYI AÇ!! Cırlatacaksın şimdi beni burada, haram zıkkım olsun verdiğimiz bilet parası!!"' },
            { file: 'berserk_valve_m1.mp3', label: 'Çıldıran Yolcu: "NEREDE BU ACİL KAPI MANDALI ÇEKİN KOPARIN ŞUNU!! Camı kırıp atlayacağım şimdi, DURDUR ŞU OTOBÜSÜ DURDUUUR!!"' },
            { file: 'berserk_112_f1.mp3', label: '112\'yi Arayan Yolcu: "ALO YÜZ ON İKİ ACİL Mİ?! Yetişin polis gönderin çabuk, gözü dönmüş bir şoförün eline düştük, İMDAAAT!!"' },
            { file: 'berserk_eggs_m1.mp3', causes: ['kasis', 'swerve'], role: 'yasli', label: 'Çıldıran Emekli: "PAZAR ARABASI DEVRİLDİ BÜTÜN YUMURTALAR KIRILDI KORİDORDA!! Savaş alanına çevirdin otobüsü, DURDUR ARTIK ŞUNU!!"' },
            { file: 'berserk_faint_f1.mp3', role: 'yasli', minPass: 3, label: 'Sinir Krizi Geçiren Teyze: "YETİŞİN KOMŞULAR BAYILACAĞIM ŞİMDİ AYYY!! Tansiyonum yirmiye fırladı, AÇIN KAPILARI İMDAAAT!!"' },
            { file: 'berserk_live_f1.mp3', role: 'ogrenci', minPass: 4, label: 'Canlı Yayın Açan Öğrenci: "CANLI YAYINI AÇTIM ŞU AN HERKES İZLİYOR BU DELİLİĞİ!! Durdurun hemen bu aracı İMDAAAT!!"' },
            { file: 'berserk_chant_m1.mp3', minPass: 10, label: 'İsyancı Yolcu: "MİLLET HEP BERABER CAMA VURUP BAĞIRIN!! DURDUR ŞU OTOBÜSÜ ARTIK, AÇ ŞU KAPILARI HEMEN!!"' },
            { file: 'berserk_mom_f1.mp3', role: 'kid', label: 'Çıldıran Anne: "BEBEĞİM KATILDI AĞLAMAKTAN DUYMUYOR MUSUNUZ?! Gözünüz döndü sizin resmen, İNDİRİN BİZİ HEMEN!!"' }
        ],
        // Kaza Sonrası Kabin İçinden Şoföre Kaba & Sert Öfke Patlaması
        crashRage: [
            { file: 'slang_crash_in_m1.mp3', minPass: 2, label: 'Öfkeli Esnaf: "ULAN GÖZÜNÜN ÖNÜNDEKİ ARABAYI DA MI GÖRMÜYORSUN?! Bostan korkuluğu musun o koltukta, darmadağın ettin milleti be!!"' },
            { file: 'slang_crash_in_f1.mp3', label: 'Mahalle Ablası: "ALLAH CEZANI VERMESİN EMİ, GİTTİ GÜZELİM BURNUM CAMA GİRDİ!! Kör müsün nesin be, nasıl çarptın koca yolda?!"' },
            { file: 'crash_rage_m1.mp3', minPass: 14, label: 'Öfkeli Yolcu: "GÖZÜNÜZ MÜ KÖR YAHU?! Koca otobüsle göz göre göre çarptınız, kırk tane can var bu arabada!!"' },
            { file: 'crash_rage_f1.mp3', label: 'Öfkeli Yolcu: "İNANAMIYORUM YA KAZA YAPTIK!! Yola hiç mi bakmıyorsunuz siz?! Ödümüz koptu, REZALET BU!!"' }
        ],
        // Arka Kapıyı Yumruklayarak Kaba Mahalle Ağzıyla Bağıran Yolcular
        rearDoorRage: [
            { file: 'slang_door_m1.mp3', label: 'Kapıyı Yumruklayan Yolcu: "LAN ARKA KAPIYI AÇSANA SAĞIR SULTAN BİLE DUYDU BE!! Turşu mu kuracaksın bizimle otobüste, aç şu kapıyı!!"' },
            { file: 'slang_door_f1.mp3', label: 'Mahalle Ablası: "HOOOP UYUYOR MUSUN ÖN TARAFTA?! Arka kapıyı açsana be, taa öbür mahalleye götürdün bizi!!"' },
            { file: 'reardoor_rage_m2.mp3', role: 'ogrenci', label: 'Öfkeli Genç: "HOOOP KAPIYI UNUTTUNUZ KAPIYI!! Esir mi aldınız bizi otobüste, açsanıza şu arka kapıyı!!"' }
        ],
        // 100+ km/s Ölüm Korkusu & Sert Viraj Öfkesi & Yolcuların Kendi Arasında Mahalle Kavgası
        speedRage: [
            { file: 'speed_rage_m1.mp3', label: 'Bağıran Yolcu: "YÜZÜ GEÇTİNİZ YÜZÜ!! Uçurumdan mı atacaksınız bizi, çekin ayağınızı şu gazdan hemen!!"' },
            { file: 'speed_rage_f1.mp3', label: 'Çığlık Atan Yolcu: "YAVAŞLAYIN DİYORUM SİZE YAVAŞLAYIN!! Kalp krizi geçireceğiz arkada, İMDAAAT!!"' }
        ],
        curveRage: [
            { file: 'curve_rage_m1.mp3', label: 'Gürleyen Yolcu: "DEVİRİYORDUNUZ OTOBÜSÜ AZ KALSIN!! Viraja bu süratle mi girilir, aklınızı mı kaçırdınız?!"' },
            { file: 'curve_rage_f1.mp3', minPass: 4, label: 'Bağıran Yolcu: "AYYY YERE DÜŞTÜK ARKADA!! Virajda hepimiz üst üste yığıldık, ne biçim savuruyorsunuz YA!!"' }
        ],
        bickerCrowd: [
            { file: 'slang_bicker_m1.mp3', pan: -0.35, minHour: 15, maxHour: 24, label: 'Arka Sıra Kavgası: "Lan ensende boza pişirtme adama, itip durma arkadan! Bir de seninle papaz olmayalım akşam akşam!"' },
            { file: 'slang_bicker_f1.mp3', pan: 0.35, label: 'Arka Sıra Kavgası: "Ne üflüyorsun be enseme körük gibi?! Çekil şuradan azıcık öteye, patavatsız herif!"' },
            { file: 'bicker_crowd_m1.mp3', pan: -0.35, label: 'Yolcu Tartışması: "Üstüme üstüme abanmasana be arkadaşım! Zaten otobüs beşik gibi sallanıyor, ayağıma bastın kaç kere!"' },
            { file: 'bicker_crowd_f1.mp3', pan: 0.35, label: 'Yolcu Tartışması: "İtmesenize arkadan ya! Görmüyor musunuz tıklım tıklım otobüs, üst üste mi çıkalım?!"' },
            { file: 'bicker_ac_pair.mp3', pan: -0.25, label: 'Yolcu Kavgası: "İçerisi hamam gibi oldu nefes alamıyoruz, hala camı kapat diyorsunuz! Şu klimayı açın artık!!"' }
        ],

        // Sert Viraj, Aşırı Hız, Uzun Bekleme, Korna Sitemi, Usta Sürüş Övgüsü & Doğal Kabin Sohbetleri
        curvePanic: [
            { file: 'curve_panic_f1.mp3', role: 'yasli', label: 'Teyze: "Ayyy savrulduk! Evladım viraja bu hızla girilir mi hiç, devrileceğiz şimdi!"' },
            { file: 'curve_panic_m1.mp3', minPass: 3, label: 'Emekli Amca: "Hooop tutunun millet! Yarış pistinde miyiz yahu, virajda yan yattı koca otobüs!"' },
            { file: 'curve_kid_01.mp3', role: 'kid', label: 'Çocuk Yolcu: "Uuuu! Lunapark treni gibi yana yattık anneee!"' }
        ],
        curveMurmur: { file: 'curve_murmur_f1.mp3', label: 'Yolcu: "Üff başım döndü valla, virajlara biraz daha yumuşak girsek keşke."' },
        stopBellPolite: [
            { file: 'stop_bell_01.mp3', role: 'yasli', label: 'Tonton Teyze: "Evladım, müsait bir yerde gelecek durakta indirebilir misin zahmet olmazsa?"' },
            { file: 'stop_bell_02.mp3', role: 'yasli', label: 'Emekli Amca: "Gelecek durakta ineceğiz inşallah, arka kapıyı unutmayalım!"' },
            { file: 'stop_bell_03.mp3', label: 'Yolcu: "Pardon, gelecek durakta inecek var!"' }
        ],
        stopBellRude: [
            { file: 'rude_stop_bell_m1.mp3', label: 'Kaba Yolcu: "Höst! Sağda indir bizi sağda uyuma! Durağı geçirirsen fena bozuşuruz ha!!"' },
            { file: 'rude_stop_bell_m2.mp3', label: 'Atarlı Genç: "Lan zili çaldık ya sağır mısın, durakta indir bizi uyuma!!"' }
        ],
        stopBellFinal: { file: 'stop_bell_final.mp3', label: 'Yolcu: "Son durağa geldik çok şükür, ellerinize emeğinize sağlık, iyi günler!"' },
        alightThanks: [
            { file: 'alight_thank_01.mp3', role: 'yasli', label: 'İnen Teyze: "Ellerine kollarına sağlık evladım, Allah kaza bela vermesin, hayırlı işler!"' },
            { file: 'alight_thank_02.mp3', label: 'İnen Yolcu: "Kazasız belasız hayırlı nöbetler olsun, kolay gelsin!"' },
            { file: 'alight_thank_03.mp3', role: 'ogrenci', label: 'İnen Öğrenci: "Çok teşekkürler, ellerinize sağlık, iyi günler kolay gelsin!"' }
        ],
        alightAngry: { file: 'alight_angry_01.mp3', label: 'Sitemli İnen Yolcu: "Oh be nihayet indik, içimiz dışımıza çıktı valla bu nasıl sürüş!"' },
        waitLong: [
            { file: 'slang_wait_m1.mp3', label: 'Atarlı Yolcu: "Lan ağaç olduk kök saldık şurada be! Kaplumbağa bile geçti yanımızdan, sürsene şu arabayı artık uyukluyor musun?!"' },
            { file: 'wait_long_01.mp3', label: 'Sabırsız Yolcu: "Of ya, ne bitmez trafikmiş arkadaş! Önümüzde yol mu tıkandı acaba, niye hiç kıpırdamıyoruz?"' },
            { file: 'wait_long_02.mp3', role: 'ogrenci', minHour: 7, maxHour: 18, label: 'Öğrenci Kız: "Eyvah derse geç kaldık yine, saat kaç oldu hâlâ kıpırdamadık!"' },
            { file: 'wait_long_03.mp3', role: 'yasli', label: 'Tonton Teyze: "Sabır çekin evladım sabır, uçacak hali yok ya şoförün, açılır şimdi yol!"' }
        ],
        overspeed: [
            { file: 'overspeed_01.mp3', label: 'Korkan Yolcu: "Pardon, biraz yavaş mı gitsek acaba? İbre doksanı geçti, korkuyoruz arkada!"' },
            { file: 'overspeed_02.mp3', role: 'yasli', label: 'Emekli Amca: "Aman gözünü seveyim acelemiz yok, geç olsun güç olmasın, ayağını gazdan biraz çek lütfen!"' },
            { file: 'overspeed_kid.mp3', role: 'kid', label: 'Heyecanlı Çocuk: "Vaaay baba bak, otobüs yarış arabası gibi gidiyor vıııınn!"' }
        ],
        hornSpam: [
            { file: 'slang_horn_m1.mp3', label: 'Ters Emekli: "ÇALMA ŞU KORNAYI ZIRT PIRT BE!! Beynimizi ütüledin sabahtan beri, elinin altında oyuncak mı buldun çek elini şundan!!"' },
            { file: 'horn_spam_01.mp3', role: 'yasli', label: 'Emekli Amca: "Kulağımızın pası silindi valla, düğün konvoyunda mıyız yahu, basma şu kornaya bu kadar!"' },
            { file: 'horn_spam_02.mp3', role: 'kid', label: 'Bebekli Anne: "Rica ediyorum basmayın şu kornaya artık, kucağımda bebek uyuyor, sıçrattınız çocuğu!"' }
        ],
        smoothPraise: [
            { file: 'praise_smooth_01.mp3', role: 'yasli', label: 'Emekli Şoför Amca: "Maşallah be, bileğine sağlık! Vites geçişleri, frenaj pamuk gibi, kırk yıllık usta şoförsün valla!"' },
            { file: 'praise_smooth_02.mp3', role: 'yasli', label: 'Tonton Teyze: "Çay bardağını konsola koysan bir damla dökülmez valla, pamuk gibi sürüyorsun evladım!"' },
            { file: 'praise_smooth_03.mp3', label: 'Genç Yolcu: "Valla helal olsun, arkada mışıl mışıl dinlendik, sürüşünüz on numara gerçekten!"' }
        ],
        ambientSlice: [
            { file: 'ambient_phone_01.mp3', pan: -0.35, minHour: 14.5, maxHour: 22.5, label: 'Arka Koltuk (Telefon): "Alo hanım, otobüsteyim şimdi, on dakikaya merkezde inerim, sıcak ekmek de alırım gelirken..."' },
            { file: 'ambient_phone_f1.mp3', pan: 0.35, role: 'ogrenci', minHour: 7.5, maxHour: 18.5, label: 'Öğrenci Sohbeti: "Kanka bindim otobüse geliyorum, kantinde çayı söyle sen, beş dakikaya kampüsteyim!"' },
            { file: 'ambient_seat_offer.mp3', pan: -0.25, role: 'yasli', requiresCrowdedSeats: true, label: 'Kibar Genç: "Buyur teyzeciğim sen şöyle cam kenarına otur, ben ayakta giderim hiç sorun değil."' },
            { file: 'ambient_kid_question.mp3', pan: 0.25, role: 'kid', minHour: 8, maxHour: 21, label: 'Meraklı Çocuk: "Anne bak! Şoför koltuğunun önünde ne kadar çok ışıklı düğme var, ben de büyüyünce otobüs şoförü olacağım!"' },
            { file: 'ambient_route_ask.mp3', pan: 0.3, requiresCentralStopAhead: true, label: 'Yolcu Sorusu: "Çok pardon, bu otobüs merkez durağından geçiyor mu acaba?"' }
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
        activePriority: 0,
        angerLevel: 0,
        lastLateMinutes: 0,
        announcementBusyUntil: 0,
        recentFiles: [],
        roster: { yasli: 0, ogrenci: 0, tam: 0, standing: 0, hasKid: false },
        simulatedPassengers: [],
        _nextAgentId: 0,
        _centralStopWaiter: null,
        _lastAlightedMaxStress: 0,
        _lastAlightedSeatPan: -0.45,
        lastJoltVoiceTime: 0,
        lastNearMissTime: 0,
        lastGreetingStopIndex: -1,
        greetingsAtCurrentStop: 0,
        lastAcRemindTime: 0,
        ch19Index: 0,

        notifyBusAnnouncement: function (durationMs = 4600) {
            this.announcementBusyUntil = Math.max(this.announcementBusyUntil || 0, performance.now() + durationMs);
        },

        isPlayingNow: function () {
            try {
                return !!(this.activeHowl && typeof this.activeHowl.playing === 'function' && this.activeHowl.playing());
            } catch (e) {
                return false;
            }
        },

        isDriverRespected: function () {
            return (this.angerLevel || 0) === 0 && (this.lastLateMinutes || 0) < 3.5;
        },

        rememberFile: function (filename) {
            if (!filename) return;
            this.recentFiles = (this.recentFiles || []).filter(f => f !== filename);
            this.recentFiles.push(filename);
            if (this.recentFiles.length > 14) this.recentFiles.shift();
        },

        getGameObj: function () {
            if (typeof Game !== 'undefined' && Game) return Game;
            if (typeof window !== 'undefined' && window.Game) return window.Game;
            if (typeof game !== 'undefined' && game) return game;
            return null;
        },

        getGameContext: function (override = {}) {
            const g = this.getGameObj();
            const passCount = typeof override.passengersOnBoard === 'number'
                ? override.passengersOnBoard
                : ((g && typeof g.passengersOnBoard === 'number') ? g.passengersOnBoard : 0);
            const clockMins = typeof override.clockMinutes === 'number'
                ? override.clockMinutes
                : ((g && typeof g.clockMinutes === 'number') ? g.clockMinutes : 720);
            const hour = ((clockMins % 1440) + 1440) % 1440 / 60;
            const activeBus = (typeof BusFleet !== 'undefined' && BusFleet.getSelectedBus) ? BusFleet.getSelectedBus() : null;
            const seatCap = activeBus ? (activeBus.seatCapacity || 40) : 40;

            let hasCentralStopAhead = false;
            if (g && g.activeRouteData && Array.isArray(g.activeRouteData.stops)) {
                const remStops = g.activeRouteData.stops.slice(g.currentStopIndex || 0);
                hasCentralStopAhead = remStops.some(st => {
                    const nm = ((st && st.name) || '').toLowerCase();
                    return nm.includes('merkez') || nm.includes('meydan') || nm.includes('çarşı') || nm.includes('otogar') || nm.includes('köprübaşı') || nm.includes('valilik') || nm.includes('hastane');
                });
            }

            return {
                cause: override.cause || null,
                passCount,
                hour,
                seatCap,
                crowdedSeats: passCount >= Math.max(8, Math.round(seatCap * 0.65)),
                hasCentralStopAhead
            };
        },

        pickSmart: function (pool, overrideCtx = {}) {
            if (!Array.isArray(pool) || pool.length === 0) return null;
            const ctx = this.getGameContext(overrideCtx);
            const r = this.roster || { yasli: 0, ogrenci: 0, tam: 0, hasKid: false };

            // 1. Demografik, kalabalık, saat ve güzergah uygunluk filtresi
            let eligible = pool.filter(item => {
                if (typeof item === 'string') return true;
                if (item.minPass && ctx.passCount < item.minPass) return false;
                if (typeof item.minHour === 'number' && ctx.hour < item.minHour) return false;
                if (typeof item.maxHour === 'number' && ctx.hour > item.maxHour) return false;
                if (item.requiresCrowdedSeats && !ctx.crowdedSeats) return false;
                if (item.requiresCentralStopAhead && !ctx.hasCentralStopAhead) return false;
                if (item.role === 'yasli' && r.yasli <= 0 && ctx.passCount < 9) return false;
                if (item.role === 'ogrenci' && r.ogrenci <= 0 && ctx.passCount < 12) return false;
                if (item.role === 'kid' && !r.hasKid && ctx.passCount < 10) return false;
                return true;
            });

            if (eligible.length === 0) {
                eligible = pool.filter(item => typeof item === 'string' || !item.minPass || ctx.passCount >= item.minPass);
            }
            if (eligible.length === 0) eligible = pool.slice();

            // 2. Fiziksel sebep (Fren vs Kasis vs Zikzak) tam eşleşmesi
            if (ctx.cause) {
                const exactCause = eligible.filter(item => typeof item === 'object' && Array.isArray(item.causes) && item.causes.includes(ctx.cause));
                if (exactCause.length > 0) {
                    eligible = exactCause;
                } else {
                    const anyCause = eligible.filter(item => typeof item === 'object' && (!item.causes || item.causes.includes('any')));
                    if (anyCause.length > 0) eligible = anyCause;
                }
            }

            // 3. Tekrar önleyici hafıza (Son 14 ses içinde çalınmamış olanlara öncelik ver!)
            const fresh = eligible.filter(item => {
                const f = typeof item === 'string' ? item : item.file;
                return !(this.recentFiles || []).includes(f);
            });
            const finalPool = fresh.length > 0 ? fresh : eligible;
            const picked = finalPool[Math.floor(Math.random() * finalPool.length)];
            this.rememberFile(typeof picked === 'string' ? picked : picked.file);
            return picked;
        },

        applyStressToAgents: function (baseDelta, reason) {
            if (!Array.isArray(this.simulatedPassengers) || this.simulatedPassengers.length === 0) {
                return Number(((Math.random() - 0.5) * 0.9).toFixed(2));
            }
            let topAgent = null;
            let topScore = -1;
            this.simulatedPassengers.forEach(ag => {
                let mult = 1.0;
                if (ag.isStanding && (reason === 'brake' || reason === 'swerve' || reason === 'curve')) mult *= 1.75;
                if (ag.temperament === 'impatient') mult *= 1.35;
                else if (ag.temperament === 'calm') mult *= 0.68;
                ag.stress = Math.max(0, Math.min(100, (ag.stress || 0) + baseDelta * mult));
                if (ag.stress > topScore) {
                    topScore = ag.stress;
                    topAgent = ag;
                }
            });
            return topAgent ? topAgent.seatPan : -0.48;
        },

        syncStopArrival: function (alightingCount, remainingPassengers, deltaMinutes, stopIndex, stopName) {
            if (typeof deltaMinutes === 'number') {
                this.lastLateMinutes = deltaMinutes;
            }
            const rem = Math.max(0, remainingPassengers || 0);

            // Bireysel Simüle Yolcu Ajanları İniş & Stres Hesabı
            let maxAlightStress = 0;
            let alightPan = -0.45;
            if (Array.isArray(this.simulatedPassengers) && this.simulatedPassengers.length > 0 && alightingCount > 0) {
                const curIdx = typeof stopIndex === 'number' ? stopIndex : 0;
                this.simulatedPassengers.sort((a, b) => {
                    const aDue = (a.targetStopIndex <= curIdx) ? 0 : 1;
                    const bDue = (b.targetStopIndex <= curIdx) ? 0 : 1;
                    if (aDue !== bDue) return aDue - bDue;
                    return (b.stress || 0) - (a.stress || 0);
                });
                const alighted = this.simulatedPassengers.splice(0, Math.min(alightingCount, this.simulatedPassengers.length));
                alighted.forEach(ag => {
                    if ((ag.stress || 0) >= maxAlightStress) {
                        maxAlightStress = ag.stress || 0;
                        alightPan = ag.seatPan || -0.45;
                    }
                });
            }
            this._lastAlightedMaxStress = maxAlightStress;
            this._lastAlightedSeatPan = alightPan;

            // Merkez / Meydan / Otogar / Hastane Durağını Soran Yolcunun Çok Duraklı Hafıza Takibi!
            if (this._centralStopWaiter && stopName) {
                const nm = String(stopName).toLowerCase();
                if (nm.includes('merkez') || nm.includes('meydan') || nm.includes('çarşı') || nm.includes('otogar') || nm.includes('köprübaşı') || nm.includes('valilik') || nm.includes('hastane')) {
                    const waiterPan = this._centralStopWaiter.seatPan || 0.30;
                    this._centralStopWaiter = null;
                    setTimeout(() => {
                        const gNow = this.getGameObj();
                        if (gNow && gNow.isDriving) return;
                        this.playClip('smart_central_arrived.mp3', {
                            pan: waiterPan,
                            volume: 0.94,
                            priority: 2,
                            nvdaText: 'Az önce merkez durağını soran yolcu: Hah tamam geldik merkez durağına! Az önce sormuştum ya çok sağ olun, müsait olunca arka kapıyı açar mısınız?',
                            toastText: '📍 Durağı Soran Yolcu: "Hah tamam geldik merkez durağına! Çok sağ olun, arka kapıyı açar mısınız?" (PageDown)',
                            toastType: 'success'
                        });
                    }, 2200);
                }
            }

            if (rem === 0) {
                this.roster = { yasli: 0, ogrenci: 0, tam: 0, standing: 0, hasKid: false };
                this.simulatedPassengers = [];
                this.angerLevel = 0;
                return;
            }

            // Kalan gerçek yolcu ajanlarından demografi ve kabin öfkesini yeniden hesapla
            if (Array.isArray(this.simulatedPassengers) && this.simulatedPassengers.length > 0) {
                const rNext = { yasli: 0, ogrenci: 0, tam: 0, standing: 0, hasKid: this.roster && this.roster.hasKid };
                let maxRemStress = 0;
                this.simulatedPassengers.forEach(ag => {
                    rNext[ag.role] = (rNext[ag.role] || 0) + 1;
                    if (ag.isStanding) rNext.standing++;
                    if ((ag.stress || 0) > maxRemStress) maxRemStress = ag.stress || 0;
                });
                if (rem < 3) rNext.hasKid = false;
                this.roster = rNext;
                if (maxRemStress < 16 && this.angerLevel > 0) {
                    this.angerLevel = Math.max(0, this.angerLevel - 2);
                } else if (alightingCount > 0 && maxAlightStress >= 40 && this.angerLevel > 0) {
                    this.angerLevel = Math.max(0, this.angerLevel - 1);
                }
                return;
            }

            const prevTotal = rem + Math.max(0, alightingCount || 0);
            if (prevTotal > 0 && alightingCount > 0) {
                const ratio = rem / prevTotal;
                this.roster.yasli = Math.max(0, Math.round((this.roster.yasli || 0) * ratio));
                this.roster.ogrenci = Math.max(0, Math.round((this.roster.ogrenci || 0) * ratio));
                this.roster.tam = Math.max(0, rem - this.roster.yasli - this.roster.ogrenci);
                this.roster.standing = Math.max(0, Math.min(this.roster.standing || 0, rem - 20));
                if (rem < 3) this.roster.hasKid = false;
                if (alightingCount >= Math.ceil(prevTotal * 0.45) && this.angerLevel > 0) {
                    this.angerLevel = Math.max(0, this.angerLevel - 1);
                }
            }
        },

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
            this._demoForceOcclusion = null;
            if (this._demoFightInterval) {
                clearInterval(this._demoFightInterval);
                this._demoFightInterval = null;
            }
            if (typeof this.stopPolicePursuit === 'function') {
                this.stopPolicePursuit();
            }
            if (this.activeStreetFight && Array.isArray(this.activeStreetFight.entries)) {
                this.activeStreetFight.entries.forEach(en => {
                    try { if (en.howl) en.howl.stop(en.sid); } catch (e) {}
                });
                this.activeStreetFight = null;
            }
            if (this._footstepTimers && Array.isArray(this._footstepTimers)) {
                this._footstepTimers.forEach(t => clearTimeout(t));
                this._footstepTimers = [];
            }
            if (this._stuntTimers && Array.isArray(this._stuntTimers)) {
                this._stuntTimers.forEach(t => clearTimeout(t));
                this._stuntTimers = [];
            }
            if (this.activeHowl) {
                try { this.activeHowl.stop(); } catch (e) {}
                this.activeHowl = null;
                this.activePriority = 0;
            }
        },

        ensureExteriorFilter: function () {
            if (this.exteriorFilter) return true;
            if (typeof Howler === 'undefined' || !Howler.ctx || !Howler.masterGain) return false;
            try {
                const ctx = Howler.ctx;
                const filter = ctx.createBiquadFilter();
                filter.type = 'lowpass';
                filter.frequency.value = 18500;
                filter.Q.value = 0.7;

                const gain = ctx.createGain();
                gain.gain.value = 1.0;

                filter.connect(gain);
                gain.connect(Howler.masterGain);

                this.exteriorFilter = filter;
                this.exteriorGain = gain;
                return true;
            } catch (e) {
                return false;
            }
        },

        isExteriorOpen: function () {
            if (this._demoForceOcclusion === 'muffled') return false;
            if (this._demoForceOcclusion === 'open') return true;
            const winOpen = (typeof audio !== 'undefined' && !!audio.isWindowOpen);
            const g = this.getGameObj();
            const doorOpen = !!(g && (g.frontDoorOpen || g.rearDoorOpen));
            const brokenGlass = !!(g && g.busDamage && ((g.busDamage.leftWindow || 0) >= 100 || (g.busDamage.rightWindow || 0) >= 100));
            return !!(winOpen || doorOpen || brokenGlass);
        },

        updateExteriorOcclusion: function () {
            const isOpen = this.isExteriorOpen();
            if (this.ensureExteriorFilter() && Howler.ctx) {
                try {
                    const t = Howler.ctx.currentTime;
                    this.exteriorFilter.frequency.setTargetAtTime(isOpen ? 18500 : 620, t, 0.055);
                    this.exteriorGain.gain.setTargetAtTime(isOpen ? 1.0 : 0.62, t, 0.055);
                } catch (e) {}
            }
            if (this._activeExteriorHtmlAudio) {
                try {
                    const baseV = this._activeExteriorBaseVol || 0.9;
                    this._activeExteriorHtmlAudio.volume = Math.max(0, Math.min(1, baseV * (isOpen ? 1.0 : 0.56)));
                } catch (e) {}
            }
        },

        ensureRearCabinFilter: function () {
            if (typeof Howler === 'undefined' || !Howler.ctx || !Howler.masterGain) return false;
            const activeBus = (typeof BusFleet !== 'undefined' && BusFleet.getSelectedBus) ? BusFleet.getSelectedBus() : null;
            const isArticulated = !!(activeBus && (activeBus.category === 'körüklü' || (activeBus.lengthMeters && activeBus.lengthMeters >= 18)));
            if (!this.rearCabinFilter) {
                try {
                    const ctx = Howler.ctx;
                    const filter = ctx.createBiquadFilter();
                    filter.type = 'lowpass';
                    filter.Q.value = 0.65;
                    const gain = ctx.createGain();
                    filter.connect(gain);
                    gain.connect(Howler.masterGain);
                    this.rearCabinFilter = filter;
                    this.rearCabinGain = gain;
                } catch (e) {
                    return false;
                }
            }
            try {
                const t = Howler.ctx.currentTime;
                this.rearCabinFilter.frequency.setTargetAtTime(isArticulated ? 3100 : 4400, t, 0.04);
                this.rearCabinGain.gain.setTargetAtTime(isArticulated ? 0.74 : 0.84, t, 0.04);
            } catch (e) {}
            return true;
        },

        ensureAnnouncementSpeakerBoost: function () {
            if (this.announcementBoostInput) return true;
            if (typeof Howler === 'undefined' || !Howler.ctx || !Howler.masterGain) return false;
            try {
                const ctx = Howler.ctx;
                const eq = ctx.createBiquadFilter();
                eq.type = 'peaking';
                eq.frequency.value = 2600;
                eq.Q.value = 0.95;
                eq.gain.value = 3.2;

                const gain = ctx.createGain();
                gain.gain.value = 1.48;

                const comp = ctx.createDynamicsCompressor();
                comp.threshold.value = -7;
                comp.knee.value = 5;
                comp.ratio.value = 6;
                comp.attack.value = 0.003;
                comp.release.value = 0.12;

                eq.connect(gain);
                gain.connect(comp);
                comp.connect(Howler.masterGain);

                this.announcementBoostInput = eq;
                return true;
            } catch (e) {
                return false;
            }
        },

        playClip: function (filename, opts = {}) {
            if (!filename) return null;
            const force = !!opts.force;
            if (!this.canSpeakInCabin(force)) {
                if (typeof opts.onend === 'function') opts.onend();
                return null;
            }

            const priority = typeof opts.priority === 'number' ? opts.priority : (opts.interrupt ? 3 : 2);
            const now = performance.now();

            // Akıllı Çakışma Yönetimi: Düşük öncelikli sesler aktif yüksek öncelikli sesi veya durak anonsunu bölmez!
            if (!force && !opts.backgroundSfx) {
                if (this.isPlayingNow() && priority < (this.activePriority || 2)) {
                    if (typeof opts.onend === 'function') opts.onend();
                    return null;
                }
                if (priority === 1 && (this.isPlayingNow() || now < (this.announcementBusyUntil || 0))) {
                    if (typeof opts.onend === 'function') opts.onend();
                    return null;
                }
                if (priority === 2 && !opts.alreadyDelayedForAnons && now < (this.announcementBusyUntil || 0)) {
                    const waitMs = Math.min(2800, Math.max(350, Math.round(this.announcementBusyUntil - now + 180)));
                    setTimeout(() => {
                        this.playClip(filename, Object.assign({}, opts, { alreadyDelayedForAnons: true }));
                    }, waitMs);
                    return null;
                }
                // Yüksek öncelikli gerçek insan çığlığı/öfkesi varsa robotik TTS'i sustur ki üst üste binmesin!
                if (priority >= 3 && typeof window !== 'undefined' && window.speechSynthesis && window.speechSynthesis.speaking) {
                    try { window.speechSynthesis.cancel(); } catch (e) {}
                }
            }

            const isHostessAnons = !!opts.isAnnouncement || /^(ibis_|cabin_quiet_anons|stop_(?!bell_|idle_)|muavin_|peron_break_end|hgs_)/.test(filename);
            const pan = typeof opts.pan === 'number' ? Math.max(-1, Math.min(1, opts.pan)) : 0;
            const vol = this.getVolume(isHostessAnons ? 1.0 : (typeof opts.volume === 'number' ? opts.volume : 0.95));
            if (vol <= 0.01) {
                if (typeof opts.onend === 'function') opts.onend();
                return null;
            }
            if (isHostessAnons && typeof audio !== 'undefined' && typeof audio.duckForAnnouncement === 'function') {
                audio.duckForAnnouncement(6500);
            }

            if ((opts.interrupt || priority > (this.activePriority || 0)) && this.activeHowl && !opts.backgroundSfx) {
                try { this.activeHowl.stop(); } catch (e) {}
            }

            this.rememberFile(filename);

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
                // Akustik Cam & Kapı Yalıtım Filtresi + 3B Arka Koltuk / Körüklü Mesafe Derinlik Filtresi!
                try {
                    const snd = typeof h._soundById === 'function' ? h._soundById(sid) : null;
                    if (snd && snd._node) {
                        const autoRear = opts.seatRow === 'rear' || /^(micro_students_giggle|micro_whisper_gossip|slang_bicker_|annoy_phone_loud)/.test(filename);
                        if (opts.isExterior && this.ensureExteriorFilter()) {
                            this.updateExteriorOcclusion();
                            snd._node.disconnect();
                            snd._node.connect(this.exteriorFilter);
                            snd._mikyasRoutedExterior = true;
                        } else if (isHostessAnons && this.ensureAnnouncementSpeakerBoost()) {
                            snd._node.disconnect();
                            snd._node.connect(this.announcementBoostInput);
                            snd._mikyasRoutedExterior = true;
                        } else if (!opts.isExterior && autoRear && this.ensureRearCabinFilter()) {
                            snd._node.disconnect();
                            snd._node.connect(this.rearCabinFilter);
                            snd._mikyasRoutedExterior = true;
                        } else if (snd._mikyasRoutedExterior && typeof Howler !== 'undefined' && Howler.masterGain) {
                            snd._node.disconnect();
                            snd._node.connect(Howler.masterGain);
                            snd._mikyasRoutedExterior = false;
                        }
                    }
                } catch (e) {}
                if (!opts.backgroundSfx) {
                    this.activeHowl = h;
                    this.activePriority = priority;
                    h.once('end', () => {
                        if (this.activeHowl === h) this.activePriority = 0;
                        if (isHostessAnons && typeof audio !== 'undefined' && typeof audio.unduckAnnouncement === 'function') {
                            audio.unduckAnnouncement();
                        }
                    }, sid);
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
                const extScale = opts.isExterior && !this.isExteriorOpen() ? 0.56 : 1.0;
                a.volume = Math.max(0, Math.min(1, vol * extScale));
                if (opts.isExterior) {
                    this._activeExteriorHtmlAudio = a;
                    this._activeExteriorBaseVol = vol;
                }
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

        pickRandom: function (arr, ctx) {
            return this.pickSmart(arr, ctx) || arr[Math.floor(Math.random() * arr.length)];
        },

        getCityReputation: function () {
            try {
                const v = parseInt(localStorage.getItem('mikyas_city_driver_rep') || '0', 10);
                return isNaN(v) ? 0 : Math.max(-100, Math.min(100, v));
            } catch (e) {
                return 0;
            }
        },

        adjustCityReputation: function (delta) {
            try {
                const next = Math.max(-100, Math.min(100, this.getCityReputation() + delta));
                localStorage.setItem('mikyas_city_driver_rep', String(next));
                return next;
            } catch (e) {
                return 0;
            }
        },

        resetForNewRoute: function () {
            if (typeof this.stopPolicePursuit === 'function') this.stopPolicePursuit();
            this._majorTrafficOffenses = 0;
            this._radarOverspeedSecs = 0;
            this.angerLevel = 0;
            this.allyPoints = 0;
            this.lastLateMinutes = 0;
            this.announcementBusyUntil = 0;
            this.activePriority = 0;
            this.recentFiles = [];
            this.roster = { yasli: 0, ogrenci: 0, tam: 0, standing: 0, hasKid: false };
            this.simulatedPassengers = [];
            this._centralStopWaiter = null;
            this._lastAlightedMaxStress = 0;
            this._wheezeWasDeniz = false;
            this.inspector = { crashes: 0, redLights: 0, roughCount: 0, kindness: 0, evaluated: false };
            this._repRecognizedInRoute = false;
            this._brokenWindowWarned = false;
            this._brokenExhaustWarned = false;
            this._loudPhoneTriggeredInRoute = false;
            this.loudPhoneActiveUntil = 0;
            this.wheezeLaughActiveUntil = 0;
            this._walkAngryDoneInRoute = false;
            this._wrongBusDoneInRoute = false;
            this._wrongBusDriveSecs = 0;
            this._goalShoutDoneInRoute = false;
            this._hawkerTriggeredInRoute = false;
            this.hawkerActiveUntil = 0;
            this._stuffyCoughTime = 0;
            this.activeStreetFight = null;
            this._roadsideFightDriveSecs = 0;
            this._nextRoadsideFightThreshold = 68 + Math.random() * 35;
            this.lastJoltVoiceTime = 0;
            this.lastNearMissTime = 0;
            this.lastGreetingStopIndex = -1;
            this.greetingsAtCurrentStop = 0;
        },

        // 1. ÇARPIŞMA ANINDA SAĞ / SOL / ÖN DIŞ NPC VE KABİN ÇIĞLIK SİSTEMİ
        onCollision: function (direction, damageAmount, passengersOnBoard, damageSummaryText, forceTest = false) {
            if (!this.canSpeakInCabin(forceTest)) return false;

            if (!forceTest) {
                this.adjustCityReputation(-15);
                if (this.inspector) this.inspector.crashes = (this.inspector.crashes || 0) + 1;
            }
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
                this.angerLevel = Math.min(8, (this.angerLevel || 0) + 2);
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
                    isExterior: !forceTest,
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
                        if (!forceTest) {
                            this._majorTrafficOffenses = (this._majorTrafficOffenses || 0) + 1;
                            if (this._majorTrafficOffenses >= 2 && !(this.activePoliceChase && this.activePoliceChase.active)) {
                                const nowCh = performance.now();
                                if (!this._lastPoliceChaseTime || (nowCh - this._lastPoliceChaseTime > 95000)) {
                                    this._majorTrafficOffenses = 0;
                                    setTimeout(() => {
                                        const gCur = this.getGameObj();
                                        if (gCur && gCur.isDriving && gCur.speed > 18) {
                                            this.startPolicePursuit('hit_and_run', false);
                                        }
                                    }, 3800);
                                }
                            }
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
            this.playClip(CLIPS.sfxHorn, { pan, volume: 0.72, isExterior: true, backgroundSfx: true });
            const chosen = this.pickRandom(CLIPS.nearMiss);
            setTimeout(() => {
                this.playClip(chosen.file, {
                    pan,
                    volume: 0.92,
                    isExterior: true,
                    nvdaText: chosen.label,
                    toastText: `🚗 ${chosen.label}`,
                    toastType: 'warning'
                });
            }, 380);
        },

        // 3. KIRMIZI IŞIK İHLALİ (YAYA GEÇİDİ ÇIĞLIĞI, ÖFKELİ SÜRÜCÜ & AĞIR İHLALDE POLİS KOVALAMACASI!)
        onRedLightViolation: function () {
            if (!this.canSpeakInCabin()) return false;
            this.angerLevel = Math.min(4, this.angerLevel + 1);
            this._majorTrafficOffenses = (this._majorTrafficOffenses || 0) + 1;
            const g = this.getGameObj();
            const curSpeed = (g && typeof g.speed === 'number') ? g.speed : 30;
            this.playClip(CLIPS.sfxHorn, { pan: 0.65, volume: 0.78, isExterior: true, backgroundSfx: true });
            const chosen = this.pickRandom(CLIPS.redLight);
            setTimeout(() => {
                this.playClip(chosen.file, {
                    pan: 0.55,
                    volume: 0.98,
                    isExterior: true,
                    interrupt: true,
                    nvdaText: 'Kırmızı ışıkta geçtiniz! 150 Lira trafik cezası kesildi. ' + chosen.label,
                    toastText: `🚦 ${chosen.label}`,
                    toastType: 'error'
                });
            }, 300);

            // Yüksek hızda kırmızı ışık ihlali veya üst üste 2. ağır ihlalde Bölge Trafik Ekibi peşinize düşer!
            const nowCh = performance.now();
            if ((curSpeed >= 48 || this._majorTrafficOffenses >= 2) && (!this._lastPoliceChaseTime || (nowCh - this._lastPoliceChaseTime > 90000))) {
                this._majorTrafficOffenses = 0;
                setTimeout(() => {
                    const gNow = this.getGameObj();
                    if (gNow && gNow.isDriving && !(this.activePoliceChase && this.activePoliceChase.active)) {
                        this.startPolicePursuit('red_light', false);
                    }
                }, 4200);
            }
            return true;
        },

        // 4. AKILLI FİZİKSEL SEBEP (FREN / KASİS / ZİKZAK) VE YOLCU MANİFESTOSU DUYARLI ÖFKE MOTORU
        onRoughDriving: function (reason, passengersOnBoard) {
            if (!this.canSpeakInCabin() || (passengersOnBoard || 0) <= 0) return false;
            const now = performance.now();
            if (this.lastJoltVoiceTime && (now - this.lastJoltVoiceTime < 5800)) return false;
            this.lastJoltVoiceTime = now;

            this.angerLevel = Math.min(8, (this.angerLevel || 0) + 1);
            const smartCtx = { cause: reason || 'any', passengersOnBoard };

            // TAM ÇILDIRMA / ZIVADAN ÇIKMA KAOSU
            if (this.angerLevel >= 6) {
                this.pendingRiotWalkout = true;
                this.playClip(CLIPS.sfxBagsCrash, { pan: 0.65, volume: 0.85, backgroundSfx: true });
                this.playClip(CLIPS.sfxDoorBang, { pan: -0.60, volume: 0.90, backgroundSfx: true });
                if ((passengersOnBoard || 0) >= 3) {
                    this.playClip(CLIPS.sfxUproar, { pan: 0, volume: 0.70, backgroundSfx: true });
                }
                if ((this.roster && this.roster.hasKid) || (passengersOnBoard || 0) >= 8) {
                    this.playClip(CLIPS.sfxBabyCry, { pan: 0.35, volume: 0.62, backgroundSfx: true });
                }
                if (this.angerLevel >= 7) {
                    setTimeout(() => {
                        this.playClip(CLIPS.sfxEmergencyValve, { pan: -0.45, volume: 0.82, backgroundSfx: true });
                    }, 900);
                }

                const b1 = this.pickSmart(CLIPS.berserkMeltdown, smartCtx);
                const b2 = this.pickSmart(CLIPS.berserkMeltdown.filter(x => x.file !== b1.file), smartCtx) || b1;

                const gRiot1 = this.getGameObj();
                if (gRiot1 && typeof gRiot1.playerBudget === 'number' && gRiot1.playerBudget >= 50) {
                    gRiot1.playerBudget -= 50;
                    if (typeof gRiot1.saveData === 'function') gRiot1.saveData();
                    if (typeof UI !== 'undefined' && typeof UI.updatePlayerStats === 'function') {
                        UI.updatePlayerStats(gRiot1.licenseLevel, gRiot1.completedTasks, gRiot1.playerBudget, typeof gRiot1.getLicenseTitle === 'function' ? gRiot1.getLicenseTitle() : 'Kaptan');
                    }
                }

                setTimeout(() => {
                    this.playClip(b1.file, {
                        pan: -0.60,
                        volume: 1.0,
                        priority: 4,
                        interrupt: true,
                        nvdaText: ((passengersOnBoard || 0) >= 2 && b2.file !== b1.file) ? (b1.label + ' ' + b2.label) : b1.label,
                        toastText: `🔥 ${b1.label}`,
                        toastType: 'error'
                    });
                }, 280);

                // Otobüste gerçekten en az 2 yolcu varsa 2. yolcu sağ kulaklıktan üst üste binerek bağırır!
                if ((passengersOnBoard || 0) >= 2 && b2.file !== b1.file) {
                    setTimeout(() => {
                        this.playClip(b2.file, {
                            pan: 0.60,
                            volume: 0.96,
                            backgroundSfx: true,
                            toastText: `🚨 ${b2.label}`,
                            toastType: 'error'
                        });
                    }, 2100);
                }
                return true;
            }

            // KAPI YUMRUKLAMA & İSYAN BAŞLANGICI
            if (this.angerLevel === 5) {
                this.pendingRiotWalkout = true;
                const riot = this.pickSmart(CLIPS.cabinRiot, smartCtx);
                this.playClip(CLIPS.sfxDoorBang, { pan: -0.45, volume: 0.88, backgroundSfx: true });
                if ((passengersOnBoard || 0) >= 3) {
                    this.playClip(CLIPS.sfxUproar, { pan: 0, volume: 0.62, backgroundSfx: true });
                }
                const gRiot1 = this.getGameObj();
                if (gRiot1 && typeof gRiot1.playerBudget === 'number' && gRiot1.playerBudget >= 50) {
                    gRiot1.playerBudget -= 50;
                    if (typeof gRiot1.saveData === 'function') gRiot1.saveData();
                    if (typeof UI !== 'undefined' && typeof UI.updatePlayerStats === 'function') {
                        UI.updatePlayerStats(gRiot1.licenseLevel, gRiot1.completedTasks, gRiot1.playerBudget, typeof gRiot1.getLicenseTitle === 'function' ? gRiot1.getLicenseTitle() : 'Kaptan');
                    }
                }
                setTimeout(() => {
                    this.playClip(riot.file, {
                        pan: -0.35,
                        volume: 1.0,
                        priority: 4,
                        interrupt: true,
                        nvdaText: riot.label,
                        toastText: `🚨 ${riot.label}`,
                        toastType: 'error'
                    });
                }, 400);
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
                // 3B YÜRÜYEREK ŞOFÖRÜN ENSESİNE GELEN ÖFKELİ YOLCU İLLÜZYONU (Seferde 1 kez!)
                if (!this._walkAngryDoneInRoute && (passengersOnBoard || 0) >= 2) {
                    this._walkAngryDoneInRoute = true;
                    this.adjustCityReputation(-5);
                    if (this.inspector) this.inspector.roughCount = (this.inspector.roughCount || 0) + 1;
                    this.playWalkingAngryConfrontation(false);
                    return true;
                }
                pool = CLIPS.patienceFurious;
                toastPrefix = '🤬';
                toastLvl = 'error';
                if ((passengersOnBoard || 0) >= 3) {
                    this.playClip(CLIPS.sfxUproar, { pan: 0, volume: 0.45, backgroundSfx: true });
                }
            }

            const chosen = this.pickSmart(pool, smartCtx);
            const randomCabinPan = this.applyStressToAgents(16, reason || 'any');
            const canAllyDefend = (this.angerLevel <= 3 && (this.allyPoints || 0) > 0 && (passengersOnBoard || 0) >= 3);
            if (!canAllyDefend) {
                this.adjustCityReputation(-4);
                if (this.inspector) this.inspector.roughCount = (this.inspector.roughCount || 0) + 1;
            }
            setTimeout(() => {
                this.playClip(chosen.file, {
                    pan: randomCabinPan,
                    volume: this.angerLevel >= 4 ? 0.98 : 0.94,
                    priority: 3,
                    interrupt: this.angerLevel >= 3,
                    nvdaText: chosen.label,
                    toastText: `${toastPrefix} ${chosen.label}`,
                    toastType: toastLvl,
                    onend: () => {
                        // Dost Yolcu Savunması: Daha önce iyilik yaptıysan karşı koltuktan bir yolcu kaba zorbayı azarlar ve öfkeyi söndürür!
                        if (canAllyDefend) {
                            this.allyPoints = Math.max(0, (this.allyPoints || 0) - 1);
                            this.angerLevel = Math.max(0, (this.angerLevel || 0) - 1);
                            const allies = [
                                { file: 'ally_defend_f1.mp3', role: 'yasli', label: 'Seni Savunan Teyze: "Şşt ağzını topla be terbiyesiz! Az önce yaşlıları bekledi o kadar iyilik yaptı şoför, trafikte olur o kadar fren!"' },
                                { file: 'ally_defend_m1.mp3', role: 'yasli', label: 'Seni Savunan Amca: "Üstüne gitme lan şoförün! Sabahtan beri direksiyon sallıyor kolay mı sanıyorsun, beğenmiyorsan taksiye bin!"' },
                                { file: 'ally_defend_f2.mp3', label: 'Seni Savunan Yolcu: "Ay ne anlayışsız insanlarsınız ya! Önüne araba kırmıştır belki, hemen ne yükleniyorsunuz şoföre!"' }
                            ];
                            const defender = this.pickSmart(allies, { passengersOnBoard });
                            setTimeout(() => {
                                this.playClip(defender.file, {
                                    pan: 0.55,
                                    volume: 0.95,
                                    priority: 3,
                                    nvdaText: defender.label,
                                    toastText: `🛡️ ${defender.label} (Kabin Sakinleşti!)`,
                                    toastType: 'success'
                                });
                            }, 340);
                        }
                    }
                });
            }, 320);
            return true;
        },

        onRearDoorBanging: function () {
            if (!this.canSpeakInCabin()) return false;
            this.angerLevel = Math.min(8, (this.angerLevel || 0) + 1);
            const chosen = this.pickSmart(CLIPS.rearDoorRage);
            this.playClip(CLIPS.sfxDoorBang, { pan: -0.55, volume: 0.88, backgroundSfx: true });
            setTimeout(() => {
                this.playClip(chosen.file, {
                    pan: -0.5,
                    volume: 0.98,
                    priority: 3,
                    interrupt: true,
                    nvdaText: chosen.label + ' Arka kapıyı açmak için PageDown tuşuna basın!',
                    toastText: `👊 ${chosen.label} (PageDown)`,
                    toastType: 'error'
                });
            }, 420);
            return true;
        },

        // 5. CANLI KABİN YOLCU MANİFESTOSU GÜNCELLEMELİ AKILLI DURAK ETKİLEŞİMLERİ
        onPassengerBoarded: function (pType, stopIndex, isStanding, clockMinutes) {
            if (!this.roster) this.roster = { yasli: 0, ogrenci: 0, tam: 0, standing: 0, hasKid: false };
            const roleKey = (pType === 'yasli' || pType === 'ogrenci') ? pType : 'tam';
            this.roster[roleKey] = (this.roster[roleKey] || 0) + 1;
            if (isStanding) this.roster.standing = (this.roster.standing || 0) + 1;
            if ((this.roster.tam + this.roster.yasli) >= 3) this.roster.hasKid = true;

            // Bireysel Simüle Yolcu Ajanı Oluştur (Gerçek 3B Koltuk Konumu, Kişilik ve İneceği Hedef Durak!)
            if (!Array.isArray(this.simulatedPassengers)) this.simulatedPassengers = [];
            const g = this.getGameObj();
            const totalStops = (g && g.activeRouteData && Array.isArray(g.activeRouteData.stops)) ? g.activeRouteData.stops.length : ((stopIndex || 0) + 4);
            const minDest = Math.min(totalStops - 1, (stopIndex || 0) + 1);
            const targetStopIndex = minDest + Math.floor(Math.random() * Math.max(1, totalStops - minDest));
            let seatPan = 0;
            if (isStanding) seatPan = Number(((Math.random() - 0.5) * 0.36).toFixed(2));
            else if (roleKey === 'yasli') seatPan = Number(((Math.random() < 0.5 ? -1 : 1) * (0.20 + Math.random() * 0.22)).toFixed(2));
            else if (roleKey === 'ogrenci') seatPan = Number(((Math.random() < 0.5 ? -1 : 1) * (0.42 + Math.random() * 0.26)).toFixed(2));
            else seatPan = Number(((Math.random() < 0.5 ? -1 : 1) * (0.28 + Math.random() * 0.34)).toFixed(2));
            const rTemp = Math.random();
            const temperament = rTemp < 0.26 ? 'calm' : (rTemp < 0.72 ? 'normal' : 'impatient');
            const seatRow = roleKey === 'yasli' ? 'front' : (roleKey === 'ogrenci' ? 'rear' : (Math.random() < 0.35 ? 'rear' : 'mid'));
            this.simulatedPassengers.push({
                id: ++this._nextAgentId,
                role: roleKey,
                isStanding: !!isStanding,
                seatPan,
                seatRow,
                targetStopIndex,
                temperament,
                stress: (this.angerLevel || 0) * 6
            });

            if (!this.canSpeakInCabin()) return;
            if (stopIndex !== this.lastGreetingStopIndex) {
                this.lastGreetingStopIndex = stopIndex;
                this.greetingsAtCurrentStop = 0;
                this.fullStopWarnedIndex = -1;
            }

            // Şehir İtibar Hafızası: Geçmiş seferlerdeki şoförlüğüne göre duraktaki yolcular otobüsünü tanır!
            if (!this._repRecognizedInRoute && stopIndex <= 1 && this.greetingsAtCurrentStop === 0) {
                const rep = this.getCityReputation();
                if (rep <= -22) {
                    this._repRecognizedInRoute = true;
                    this.greetingsAtCurrentStop++;
                    const badRep = this.pickSmart([
                        { file: 'rep_bad_m1.mp3', label: 'Duraktaki Yolcu Seni Tanıdı: "Eyvah eyvah! Yine geçen sefer milleti haşat eden o kasap şoföre denk geldik, sıkı tutunun demirlere!"' },
                        { file: 'rep_bad_f1.mp3', role: 'yasli', label: 'Teyze Seni Tanıdı: "Ayy bu geçen günkü deli süren otobüs değil mi?! İnşallah bugün sağ salim ineriz!"' }
                    ]);
                    setTimeout(() => {
                        this.playClip(badRep.file, {
                            pan: 0.35,
                            volume: 0.94,
                            priority: 2,
                            nvdaText: badRep.label,
                            toastText: `👀 ${badRep.label}`,
                            toastType: 'warning'
                        });
                    }, 480);
                    return;
                } else if (rep >= 28) {
                    this._repRecognizedInRoute = true;
                    this.greetingsAtCurrentStop++;
                    const goodRep = this.pickSmart([
                        { file: 'rep_good_m1.mp3', role: 'yasli', label: 'Yolcu Seni Tanıdı: "Ooo maşallah, hattın en usta şoförüne denk geldik bugün! Rahat rahat gideriz artık!"' },
                        { file: 'rep_good_f1.mp3', label: 'Yolcu Seni Tanıdı: "Ne güzel ya, şehrin en temiz ve sarsmadan süren otobüsü bu, iyi yolculuklar!"' }
                    ]);
                    setTimeout(() => {
                        this.playClip(goodRep.file, {
                            pan: 0.35,
                            volume: 0.92,
                            priority: 2,
                            nvdaText: goodRep.label,
                            toastText: `🌟 ${goodRep.label}`,
                            toastType: 'success'
                        });
                    }, 480);
                    return;
                }
            }
            if (isStanding && this.greetingsAtCurrentStop === 0) {
                this.greetingsAtCurrentStop++;
                const standFile = Array.isArray(CLIPS.standing) ? this.pickSmart(CLIPS.standing) : CLIPS.standing;
                setTimeout(() => this.playClip(standFile, { pan: 0.25, volume: 0.88, priority: 2 }), 420);
                return;
            }
            if (this.greetingsAtCurrentStop >= 1 || Math.random() > 0.72) return;
            this.greetingsAtCurrentStop++;

            const baseList = (CLIPS.greetings[roleKey] || CLIPS.greetings.tam).slice();
            if (typeof clockMinutes === 'number') {
                const modMins = ((clockMinutes % 1440) + 1440) % 1440;
                if (modMins >= 300 && modMins < 660) baseList.push(CLIPS.greetMorning);
                else if (modMins >= 1050 || modMins < 240) baseList.push(CLIPS.greetEvening);
            }
            const file = this.pickSmart(baseList, { clockMinutes });
            setTimeout(() => {
                this.playClip(file, { pan: 0.35, volume: 0.88, priority: 2 });
            }, 460);
        },

        onBusFullAtStop: function (stopIndex) {
            if (!this.canSpeakInCabin()) return false;
            if (this.fullStopWarnedIndex === stopIndex) return false;
            this.fullStopWarnedIndex = stopIndex;
            const respected = this.isDriverRespected();
            const fName = respected ? 'bus_full_left_01.mp3' : 'rude_bus_full.mp3';
            setTimeout(() => {
                this.playClip(fName, {
                    pan: 0.65,
                    volume: 0.95,
                    isExterior: true,
                    priority: 2,
                    nvdaText: respected
                        ? 'Durakta kalan yolcu: Hay Allah, otobüs tamamen dolu, bir sonrakine bineriz artık!'
                        : 'Durakta kalan öfkeli yolcu: Yuh be balık istifi doldurmuşsun otobüsü hala bakıyorsun! Tepesine mi çıkacağız arabanın?!',
                    toastText: respected
                        ? '🚏 Duraktaki Yolcu: "İğne atsan yere düşmez otobüste! Bir sonrakine bineriz artık!"'
                        : '🤬 Duraktaki Yolcu: "Yuh be balık istifi doldurmuşsun otobüsü, tepesine mi çıkacağız arabanın?!"',
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

            if ((this.angerLevel || 0) >= 1 || (this._lastAlightedMaxStress || 0) >= 36) {
                const useHeavyCurse = ((this.angerLevel || 0) >= 2 || (this._lastAlightedMaxStress || 0) >= 55);
                const fName = useHeavyCurse ? 'rude_alight_curse.mp3' : CLIPS.alightAngry.file;
                const lbl = useHeavyCurse
                    ? 'İnen Huysuz Yolcu: "Hay senin süreceğin arabanın tekerine tüküreyim be! İnene kadar canımız çıktı, bir daha tövbeler olsun binmem!!"'
                    : CLIPS.alightAngry.label;
                setTimeout(() => {
                    this.playClip(fName, {
                        pan: -0.45,
                        volume: 0.95,
                        priority: 2,
                        nvdaText: lbl,
                        toastText: `🤬 ${lbl}`,
                        toastType: 'warning'
                    });
                }, 480);
                return true;
            }

            if (Math.random() > 0.78) return false;
            const chosen = this.pickSmart(CLIPS.alightThanks);
            setTimeout(() => {
                this.playClip(chosen.file, {
                    pan: -0.45,
                    volume: 0.90,
                    priority: 2,
                    nvdaText: chosen.label,
                    toastText: `👋 ${chosen.label}`,
                    toastType: 'success'
                });
            }, 520);
            return true;
        },

        getSmartBellDistance: function (upcomingStopIndex) {
            if (!Array.isArray(this.simulatedPassengers) || this.simulatedPassengers.length === 0) return 220;
            const due = this.simulatedPassengers.filter(ag => ag.targetStopIndex === upcomingStopIndex);
            if (due.length === 0) return 210;
            if (due.some(ag => ag.temperament === 'impatient')) return 255; // Sabırsız yolcu erkenden zile asılır!
            if (due.every(ag => ag.role === 'ogrenci')) return 120; // Kulaklıklı dalgın öğrenci durağa yaklaşırken son anda basar!
            return 205;
        },

        onStopBellRing: function (isFinalStop) {
            if (!this.canSpeakInCabin()) return false;
            const g = this.getGameObj();
            const curStopIdx = g ? (g.currentStopIndex || 0) : 0;
            const dueAgent = (Array.isArray(this.simulatedPassengers) && this.simulatedPassengers.length > 0)
                ? (this.simulatedPassengers.find(ag => ag.targetStopIndex === curStopIdx) || this.simulatedPassengers[0])
                : null;
            const respected = this.isDriverRespected() && (!dueAgent || (dueAgent.stress || 0) < 35);
            let chosen;
            if (isFinalStop && (this.angerLevel || 0) <= 1) {
                chosen = CLIPS.stopBellFinal;
            } else if (respected) {
                chosen = this.pickSmart(CLIPS.stopBellPolite);
            } else {
                chosen = this.pickSmart(CLIPS.stopBellRude);
            }
            const pan = dueAgent ? dueAgent.seatPan : Number(((Math.random() - 0.5) * 0.6).toFixed(2));
            const seatRow = dueAgent ? dueAgent.seatRow : 'mid';
            setTimeout(() => {
                this.playClip(chosen.file, {
                    pan,
                    seatRow,
                    volume: respected ? 0.92 : 0.96,
                    priority: 2,
                    nvdaText: 'Duracak zili çaldı. ' + chosen.label,
                    toastText: `🔔 ${chosen.label}`,
                    toastType: respected ? 'info' : 'warning'
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
                this.angerLevel = Math.min(8, (this.angerLevel || 0) + 1);
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
            if (!this.canSpeakInCabin() || typeof deltaMinutes !== 'number') return false;
            const g = this.getGameObj();
            if ((waitingCount || 0) <= 0 && !(deltaMinutes <= -2.2 && g && (g.passengersOnBoard || 0) > 0)) return false;
            if (deltaMinutes >= 7.0) {
                setTimeout(() => {
                    if (this.activeHowl && this.activeHowl.playing && this.activeHowl.playing()) return;
                    this.playClip('late_rage_f1.mp3', {
                        pan: 0.45,
                        volume: 0.96,
                        isExterior: true,
                        nvdaText: 'Duraktaki öfkeli yolcu: Bu kaçıncı rötar ya! Yarım saattir soğukta durakta dikiliyoruz, böyle ciddiyetsizlik olmaz!',
                        toastText: '🤬 Öfkeli Yolcu: "BU KAÇINCI RÖTAR YA!! Yarım saattir soğukta durakta dikiliyoruz!!"',
                        toastType: 'error'
                    });
                }, 3100);
                return true;
            } else if (deltaMinutes >= 4.0) {
                setTimeout(() => {
                    if (this.activeHowl && this.activeHowl.playing && this.activeHowl.playing()) return;
                    this.playClip('rude_late_f1.mp3', {
                        pan: 0.45,
                        volume: 0.96,
                        isExterior: true,
                        nvdaText: 'Duraktaki kaba yolcu: Nerede kaldın be uyuşuk?! Kök saldık durakta senin keyfini mi bekleyeceğiz sabahtan beri, yürü aç kapıyı!',
                        toastText: '🤬 Duraktaki Yolcu: "Nerede kaldın be uyuşuk?! Senin keyfini mi bekleyeceğiz, yürü aç kapıyı!!"',
                        toastType: 'warning'
                    });
                }, 3100);
                return true;
            } else if (deltaMinutes <= -2.2 && this.inspector && (this.inspector.roughCount || 0) >= 2 && g && (g.passengersOnBoard || 0) > 0) {
                setTimeout(() => {
                    if (this.isPlayingNow()) return;
                    this.playClip('smart_early_reckless.mp3', {
                        pan: -0.35,
                        volume: 0.95,
                        priority: 2,
                        nvdaText: 'Yolcu sitemi: Tabii erken varırsın durağa, kelle koltukta ralli yapar gibi uçura uçura getirdin bizi!',
                        toastText: '😒 Yolcu: "Tabii erken varırsın durağa, kelle koltukta ralli yapar gibi uçura uçura getirdin bizi!"',
                        toastType: 'warning'
                    });
                }, 2900);
                return true;
            } else if (Math.abs(deltaMinutes) <= 1.0 && (waitingCount || 0) > 0) {
                this._ontimeCount = (this._ontimeCount || 0) + 1;
                if (this._ontimeCount % 3 === 1) {
                    setTimeout(() => {
                        if (this.activeHowl && this.activeHowl.playing && this.activeHowl.playing()) return;
                        this.playClip('ontime_praise_01.mp3', {
                            pan: 0.4,
                            volume: 0.90,
                            isExterior: true,
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
            if (!this.canSpeakInCabin()) return false;
            // Yolda kavga eden adamların yanından geçerken kornaya (H) basarsan kavgacı dönüp otobüse bağırır!
            if (this.activeStreetFight && this.activeStreetFight.active && !this.activeStreetFight.hornSnapped && Math.abs(this.activeStreetFight.distMeters) < 58) {
                this.activeStreetFight.hornSnapped = true;
                const sf = this.activeStreetFight;
                const snapPan = sf.sideSign * 0.85;
                setTimeout(() => {
                    const hSnap = this.getHowl('street_fight_horn_snap.mp3');
                    if (hSnap) {
                        const sid = hSnap.play();
                        const absD = Math.abs(sf.distMeters || 0);
                        const dGain = Math.max(0.25, Math.min(1.0, 1.0 / (1.0 + Math.pow(absD / 34, 1.5))));
                        hSnap.volume(this.getVolume(dGain), sid);
                        if (typeof hSnap.stereo === 'function') hSnap.stereo(snapPan, sid);
                        try {
                            const snd = typeof hSnap._soundById === 'function' ? hSnap._soundById(sid) : null;
                            if (snd && snd._node && this.ensureExteriorFilter()) {
                                this.updateExteriorOcclusion();
                                snd._node.disconnect();
                                snd._node.connect(this.exteriorFilter);
                                snd._mikyasRoutedExterior = true;
                            }
                        } catch (e) {}
                        sf.entries.push({ howl: hSnap, sid, panOffset: 0 });
                    }
                    if (typeof audio !== 'undefined' && typeof audio.updateNvdaLiveRegion === 'function') {
                        audio.updateNvdaLiveRegion('Kavgacı adam kornanıza sinirlendi: Sen ne basıyorsun lan kornaya oradan?! İşine bak yürü git karışma bize!');
                    }
                    if (typeof UI !== 'undefined' && UI.showToast) {
                        UI.showToast('🥊🤬 Kavgacı Adam Otobüse Döndü: "SEN NE BASIYORSUN LAN KORNAYA ORADAN?! İşine bak yürü git karışma bize!!"', 'error');
                    }
                }, 260);
                return true;
            }
            if ((passengersOnBoard || 0) <= 0 || hasNearbyHazard) return false;
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
            const useRudeTea = !this.isDriverRespected();
            setTimeout(() => {
                if (useRudeTea) {
                    this.playClip('rude_tea_scold.mp3', {
                        pan: -0.3,
                        volume: 0.96,
                        priority: 2,
                        nvdaText: 'Ters Yolcu: Keyfe bak keyfe, paşam çay höpürdetiyor! Milletin acelesi var zıkkımlanmayı bırak da gaza bas yürü be!',
                        toastText: '🤬 Yolcu: "Keyfe bak keyfe, paşam çay höpürdetiyor! Zıkkımlanmayı bırak da gaza bas yürü be!!"',
                        toastType: 'warning',
                        onend: () => {
                            if ((this.roster && this.roster.ogrenci > 0) || (passengersOnBoard || 0) >= 6) {
                                setTimeout(() => {
                                    this.playClip('micro_students_giggle.mp3', {
                                        pan: 0.48,
                                        volume: 0.86,
                                        priority: 2,
                                        nvdaText: 'Arka koltuktaki gençler gülüştü: Hahaha! Duydun mu lafı nasıl soktu şoföre!',
                                        toastText: '🤭 Arka Sıra Gençler: "Hahaha! Duydun mu lafı nasıl soktu şoföre!"',
                                        toastType: 'info'
                                    });
                                }, 320);
                            }
                        }
                    });
                } else {
                    this.playClip('tea_smell_kid.mp3', {
                        pan: 0.25,
                        volume: 0.92,
                        priority: 2,
                        nvdaText: 'Çocuk Yolcu: Mmm! Ön taraftan ne güzel taze çay kokusu geldi, benim de canım simit çekti anne!',
                        toastText: '🫖 Çocuk Yolcu: "Mmm! Ön taraftan ne güzel taze çay kokusu geldi, canım simit çekti anne!"',
                        toastType: 'success'
                    });
                }
            }, 900);
            return true;
        },

        onRunningPassengerAppear: function () {
            if (!this.canSpeakInCabin()) return false;
            this.playClip(CLIPS.runnerWait, {
                pan: 0.65,
                volume: 1.0,
                isExterior: true,
                interrupt: true,
                nvdaText: 'Durağa doğru koşan bir yolcu var: Hooop durun bekleyin lütfen geliyorum! Ön kapıyı açmak için PageUp tuşuna basın.'
            });
            return true;
        },

        onRunningPassengerBoarded: function () {
            if (!this.canSpeakInCabin()) return false;
            this.angerLevel = Math.max(0, this.angerLevel - 1);
            this.allyPoints = (this.allyPoints || 0) + 1;
            this.adjustCityReputation(10);
            if (this.inspector) this.inspector.kindness = (this.inspector.kindness || 0) + 1;
            setTimeout(() => {
                this.playClip(CLIPS.runnerBoarded, {
                    pan: 0.3,
                    volume: 0.95,
                    priority: 3,
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
                isExterior: true,
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
                this.allyPoints = (this.allyPoints || 0) + 1;
                this.adjustCityReputation(8);
                if (this.inspector) this.inspector.kindness = (this.inspector.kindness || 0) + 1;
                this.playClip(CLIPS.studentThankFree, {
                    pan: 0.3,
                    volume: 0.95,
                    priority: 3,
                    interrupt: true,
                    nvdaText: 'Yolcuya izin verdiniz: Çok teşekkür ederim, hayatımı kurtardınız! Artı 50 Lira hoşgörü primi.'
                });
            } else {
                const useRudeReject = Math.random() < 0.70;
                this.playClip(useRudeReject ? 'rude_student_reject.mp3' : 'balance_reject_rage.mp3', {
                    pan: 0.3,
                    volume: 0.96,
                    priority: 3,
                    interrupt: true,
                    nvdaText: useRudeReject
                        ? 'Yolcuyu indirdiniz. Kaba tepki: Al otobüsünü başına çal be! İki kuruşluk bilet için yaptığın triplere bak, sanki özel uçak kaldırıyor cimri!'
                        : 'Yolcuyu indirdiniz. Öğrenci sitemi: Bir bilet parası için sınav günü öğrencinin kalbini kırdınız ya, yazıklar olsun!'
                });
            }
            return true;
        },

        onRampThank: function () {
            if (!this.canSpeakInCabin()) return false;
            this.angerLevel = Math.max(0, this.angerLevel - 1);
            this.allyPoints = (this.allyPoints || 0) + 1;
            this.adjustCityReputation(8);
            if (this.inspector) this.inspector.kindness = (this.inspector.kindness || 0) + 1;
            setTimeout(() => {
                this.playClip(CLIPS.rampThank, {
                    pan: 0.35,
                    volume: 0.95,
                    priority: 3,
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

        getPoliceIdentity: function () {
            if (typeof window.getDriverPoliceIdentity === 'function') {
                return window.getDriverPoliceIdentity();
            }
            return {
                driverName: (typeof Game !== 'undefined' && Game.username) ? Game.username : 'Kaptan',
                plate: '59 TKL 059',
                busName: 'Yolcu Otobüsü',
                licenseTitle: 'Kaptan Şoför',
                cityName: 'Tekirdağ'
            };
        },

        triggerRoadsidePtsCheck: function (gameObj, isManual = false) {
            const g = gameObj || this.getGameObj();
            const id = this.getPoliceIdentity();
            const curSpeed = (g && typeof g.speed === 'number') ? Math.round(g.speed) : 0;

            if (typeof audio !== 'undefined' && typeof audio.playPtsScanTone === 'function') {
                audio.playPtsScanTone();
            }

            let nvdaMsg = '';
            let toastMsg = '';
            let toastType = 'info';

            if (isManual && (!g || !g.isDriving || curSpeed < 3)) {
                nvdaMsg = `Bölge Trafik PTS ve Sürücü Sicil Kaydı: Plaka ${id.plate}, Araç ${id.busName}, Kayıtlı Sürücü ${id.driverName}, Ehliyet Ünvanı ${id.licenseTitle}. Plaka ve GBT kaydı temiz.`;
                toastMsg = `🚓 [Bölge Trafik PTS Kaydı] Plaka: ${id.plate} | Sürücü: ${id.driverName} (${id.licenseTitle}) | Araç: ${id.busName} — Sicil Temiz`;
                toastType = 'success';
            } else if (curSpeed >= 96) {
                nvdaMsg = `Bölge Trafik PTS Radar Uyarısı! ${id.plate} plakalı araç sürücüsü ${id.driverName}, hızınız ${curSpeed}! Radar sınırındasınız, hızınızı düşürün!`;
                toastMsg = `⚠️🚓 [PTS Radar Uyarısı] "${id.plate} plakalı ${id.busName} — Sürücü ${id.driverName}, hızınız ${curSpeed} km/s! Yavaşlayın!"`;
                toastType = 'warning';
            } else {
                nvdaMsg = `Bölge Trafik PTS Plaka Tanıma Noktası: ${id.plate} plakalı araç, sürücü ${id.driverName}, hız ${curSpeed}. Kayıt temiz, iyi yolculuklar.`;
                toastMsg = `🚓 [PTS Plaka Okuma] ${id.plate} • Kaptan ${id.driverName} (${curSpeed} km/s) — Kayıt Temiz, İyi Seferler!`;
                toastType = 'info';
            }

            if (typeof UI !== 'undefined' && typeof UI.showToast === 'function') {
                UI.showToast(toastMsg, toastType);
            }
            if (typeof audio !== 'undefined' && typeof audio.updateNvdaLiveRegion === 'function') {
                audio.updateNvdaLiveRegion(nvdaMsg);
            }
            return true;
        },

        playPoliceInspectionResult: function (isOverSpeed, currentSpeed, force = false) {
            if (!this.canSpeakInCabin(force)) return false;
            const id = this.getPoliceIdentity();
            const file = isOverSpeed ? CLIPS.policeFine : CLIPS.policeClean;
            this.playClip(file, {
                pan: -0.55,
                volume: 0.98,
                force,
                interrupt: true,
                nvdaText: isOverSpeed
                    ? `Trafik polisi ${id.plate} plakalı araç sürücüsü ${id.driverName} adına, ${currentSpeed} hız tespiti nedeniyle 350 Lira ceza kesti.`
                    : `Trafik polisi sorguladı: ${id.plate} plakalı araç sürücüsü ${id.driverName}, ehliyet ve takograf temiz, hız ${currentSpeed}. Hayırlı yolculuklar ${id.driverName}! Artı 30 XP.`
            });
            return true;
        },

        playCologneSequence: function (force = false) {
            if (!this.canSpeakInCabin(force)) return false;
            // Yolcuların sinirini yumuşat!
            this.angerLevel = 0;
            this.allyPoints = (this.allyPoints || 0) + 1; // cologne
            this.adjustCityReputation(6);
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

        // 10. AKILLI BAĞLAMSAL KABİN YÖNETMENİ (Zikzak Tespiti, Saygı-Uyumlu İklim/Far/Silecek, Kalabalık Analizi & Akıllı Sohbetler)
        checkSmartCabinReminders: function (gameObj, deltaTime) {
            if (!gameObj || !gameObj.isDriving || !this.canSpeakInCabin()) return;
            const now = performance.now();

            // 10-00. Aktif 3B Polis Kovalamacası & Radar Aşırı Hız Takibi!
            if (this.activePoliceChase && this.activePoliceChase.active) {
                this.updatePolicePursuit(gameObj, deltaTime);
                return;
            }
            if (gameObj.speed >= 106) {
                this._radarOverspeedSecs = (this._radarOverspeedSecs || 0) + deltaTime;
                if (this._radarOverspeedSecs >= 6.5 && (!this._lastPoliceChaseTime || (now - this._lastPoliceChaseTime > 110000))) {
                    this._radarOverspeedSecs = 0;
                    this.startPolicePursuit('radar', false);
                    return;
                }
            } else {
                this._radarOverspeedSecs = 0;
            }

            // 10-0. Yolda Kavga Eden 2 Adamın Yanından Geçiş 3B Fiziği & Doğal Karşılaşma Zamanlayıcısı!
            if (this.activeStreetFight && this.activeStreetFight.active) {
                this.updateRoadsideFight(gameObj, deltaTime);
            } else if (gameObj.speed >= 22 && (typeof gameObj.currentDistanceToNext !== 'number' || gameObj.currentDistanceToNext > 210)) {
                this._roadsideFightDriveSecs = (this._roadsideFightDriveSecs || 0) + deltaTime;
                const thresh = this._nextRoadsideFightThreshold || 78;
                if (this._roadsideFightDriveSecs >= thresh && !this.isPlayingNow()) {
                    this._roadsideFightDriveSecs = 0;
                    this._nextRoadsideFightThreshold = 95 + Math.random() * 45;
                    this.triggerRoadsideFight(false);
                }
            }

            // 10-0b. Bölge Trafik PTS (Plaka Tanıma Sistemi) & Mobil Ekip Geçiş Kontrolü (Durağa uzaktayken plaka ve isim okur)
            if (gameObj.speed >= 26 && (typeof gameObj.currentDistanceToNext !== 'number' || gameObj.currentDistanceToNext > 240)) {
                this._ptsCheckpointSecs = (this._ptsCheckpointSecs || 0) + deltaTime;
                const ptsThresh = this._nextPtsCheckpointThreshold || 92;
                if (this._ptsCheckpointSecs >= ptsThresh && !this.isPlayingNow() && now >= (this.announcementBusyUntil || 0)) {
                    this._ptsCheckpointSecs = 0;
                    this._nextPtsCheckpointThreshold = 125 + Math.random() * 45;
                    this.triggerRoadsidePtsCheck(gameObj, false);
                }
            }

            // 10a. Gerçek Zamanlı Zikzak / Sert Şerit Kırma Fiziği Dedektörü (Swerve)
            if ((gameObj.passengersOnBoard || 0) > 0 && gameObj.speed > 32 && typeof gameObj.steeringAngle === 'number') {
                const dirSign = gameObj.steeringAngle > 13 ? 1 : (gameObj.steeringAngle < -13 ? -1 : 0);
                if (dirSign !== 0 && dirSign !== (this._lastSwerveSign || 0)) {
                    this._lastSwerveSign = dirSign;
                    this._swerveFlips = (this._swerveFlips || []).filter(t => (now - t) < 4600);
                    this._swerveFlips.push(now);
                    if (this._swerveFlips.length >= 3) {
                        this._swerveFlips = [];
                        this.onRoughDriving('swerve', gameObj.passengersOnBoard);
                        return;
                    }
                }
            }

            // 10b. Aşırı hız tepkisi (92+ km/s korku, 100+ km/s veya yüksek gerginlikte agresif öfke!)
            if ((gameObj.passengersOnBoard || 0) > 0 && gameObj.speed >= 92) {
                this._overspeedSecs = (this._overspeedSecs || 0) + deltaTime;
                if (this._overspeedSecs >= 5.0 && (!this._lastOverspeedTime || (now - this._lastOverspeedTime > 32000))) {
                    this._overspeedSecs = 0;
                    this._lastOverspeedTime = now;
                    this.lastSmartRemindTime = now;
                    const useRage = (gameObj.speed >= 100 || (this.angerLevel || 0) >= 2);
                    if (useRage) {
                        this.angerLevel = Math.min(8, (this.angerLevel || 0) + 1);
                        const rage = this.pickSmart(CLIPS.speedRage, { passengersOnBoard: gameObj.passengersOnBoard });
                        if ((gameObj.passengersOnBoard || 0) >= 3) {
                            this.playClip(CLIPS.sfxUproar, { pan: 0, volume: 0.45, backgroundSfx: true });
                        }
                        this.playClip(rage.file, {
                            pan: -0.25,
                            volume: 0.98,
                            priority: 3,
                            interrupt: true,
                            nvdaText: rage.label,
                            toastText: `🤬 ${rage.label}`,
                            toastType: 'error'
                        });
                    } else {
                        const chosen = this.pickSmart(CLIPS.overspeed, { passengersOnBoard: gameObj.passengersOnBoard });
                        this.playClip(chosen.file, {
                            pan: -0.25,
                            volume: 0.94,
                            priority: 3,
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

            // 10c. Gerçek Kalabalık / Hamam Sıcağı Analizli Yolcu Tartışması (+ Milisaniyelik Kesmeli 3'lü Klima Kavgası!)
            const activeBus = (typeof BusFleet !== 'undefined' && BusFleet.getSelectedBus) ? BusFleet.getSelectedBus() : null;
            const seatCap = activeBus ? (activeBus.seatCapacity || 40) : 40;
            const isTrulyCrowded = (gameObj.passengersOnBoard || 0) >= Math.max(16, Math.round(seatCap * 0.72));
            const isHotNoAc = ((gameObj.passengersOnBoard || 0) >= 4 && (gameObj.busTemperature || 22) >= 27.5 && !gameObj.isACOn);
            if (isTrulyCrowded || isHotNoAc) {
                this._bickerSecs = (this._bickerSecs || 0) + deltaTime;
                if (this._bickerSecs >= 44 && (!this._lastBickerTime || (now - this._lastBickerTime > 48000))) {
                    this._bickerSecs = 0;
                    this._lastBickerTime = now;
                    this.lastSmartRemindTime = now;
                    this._trioToggle = !this._trioToggle;
                    if (isHotNoAc && (gameObj.passengersOnBoard || 0) >= 5 && this._trioToggle) {
                        this.playInterruptingTrioFight(false);
                        return;
                    }
                    const bickerPool = isHotNoAc ? [CLIPS.bickerCrowd[4]] : CLIPS.bickerCrowd.slice(0, 4);
                    const bicker = this.pickSmart(bickerPool, { passengersOnBoard: gameObj.passengersOnBoard, clockMinutes: gameObj.clockMinutes });
                    this.playClip(bicker.file, {
                        pan: bicker.pan,
                        volume: 0.92,
                        priority: 2,
                        nvdaText: bicker.label,
                        toastText: `💢 ${bicker.label}`,
                        toastType: 'warning',
                        onend: () => {
                            if ((this.roster && this.roster.ogrenci > 0) && Math.random() < 0.45) {
                                setTimeout(() => {
                                    this.playClip('micro_students_giggle.mp3', { pan: 0.45, volume: 0.82, priority: 1 });
                                }, 320);
                            }
                        }
                    });
                    return;
                }
            } else {
                this._bickerSecs = 0;
            }

            // 10c-quater. Yanlış Otobüse Binen Telaşlı Yolcu (Koridordan Koşarak Şoförün Yanına Gelme!)
            if (!this._wrongBusDoneInRoute && (gameObj.currentStopIndex === 1 || gameObj.currentStopIndex === 2) && (gameObj.passengersOnBoard || 0) >= 3 && gameObj.speed >= 25 && (this.angerLevel || 0) <= 1) {
                this._wrongBusDriveSecs = (this._wrongBusDriveSecs || 0) + deltaTime;
                if (this._wrongBusDriveSecs >= 17 && (!this.lastSmartRemindTime || (now - this.lastSmartRemindTime > 20000))) {
                    this._wrongBusDoneInRoute = true;
                    this.lastSmartRemindTime = now;
                    this.playWalkingWrongBusDrama(false);
                    return;
                }
            }

            // 10c-quinquies. Yorgun/Gece Sürüşünde veya Gerginlikte Arka Koltuk Fısıltı Dedikodusu!
            if (!this._gossipDoneInRoute && (gameObj.passengersOnBoard || 0) >= 4 && gameObj.speed >= 24 && (gameObj.isNight || (this.angerLevel >= 1 && this.angerLevel <= 2))) {
                this._gossipDriveSecs = (this._gossipDriveSecs || 0) + deltaTime;
                if (this._gossipDriveSecs >= 41 && (!this.lastSmartRemindTime || (now - this.lastSmartRemindTime > 28000))) {
                    this._gossipDoneInRoute = true;
                    this.lastSmartRemindTime = now;
                    this.playWhisperGossipPair(false);
                    return;
                }
            }

            // 10c-bis. Kırık Cam & Kopuk Egzoz Hasar Farkındalığı!
            if ((gameObj.passengersOnBoard || 0) > 0 && gameObj.busDamage && gameObj.speed > 30) {
                const leftBroken = (gameObj.busDamage.leftWindow || 0) >= 100;
                const rightBroken = (gameObj.busDamage.rightWindow || 0) >= 100;
                if ((leftBroken || rightBroken) && !this._brokenWindowWarned && (!this.lastSmartRemindTime || (now - this.lastSmartRemindTime > 24000))) {
                    this._brokenWindowWarned = true;
                    this.lastSmartRemindTime = now;
                    this.playClip('dmg_window_wind.mp3', {
                        pan: leftBroken ? -0.65 : 0.65,
                        volume: 0.96,
                        priority: 3,
                        nvdaText: 'Yolcu tepkisi: Kırık camdan fırtına giriyor içeriye dondum be! Bu hurdayla sefere mi çıkılır, sanayiye götürsene şu otobüsü!',
                        toastText: '🪟 Yolcu: "Kırık camdan fırtına giriyor içeriye dondum be! Sanayiye götürsene şu otobüsü!!"',
                        toastType: 'warning'
                    });
                    return;
                }
                if (((gameObj.busDamage.exhaust || 0) >= 65 || (gameObj.busDamage.engine || 0) >= 65) && !this._brokenExhaustWarned && (!this.lastSmartRemindTime || (now - this.lastSmartRemindTime > 24000))) {
                    this._brokenExhaustWarned = true;
                    this.lastSmartRemindTime = now;
                    this.playClip('dmg_exhaust_noise.mp3', {
                        pan: -0.25,
                        volume: 0.96,
                        priority: 3,
                        nvdaText: 'Yolcu tepkisi: Ulan otobüsün altından pancar motoru gibi gürültü geliyor, egzozu mu kopardın ne yaptın?!',
                        toastText: '🔧 Yolcu: "Otobüsün altından pancar motoru gibi gürültü geliyor, egzozu mu kopardın?!"',
                        toastType: 'warning'
                    });
                    return;
                }
            }

            // 10c-ter. Otobüste Ciğerleri Hırıldayarak Kahkahayla Telefonda Anlatan VEYA Bağırarak Konuşan Yolcu Olayı (Q Tuşu ile Susturma!)
            if (!this._loudPhoneTriggeredInRoute && (gameObj.passengersOnBoard || 0) >= 5 && gameObj.speed >= 24 && (typeof gameObj.currentDistanceToNext !== 'number' || gameObj.currentDistanceToNext > 280)) {
                this._phoneEventSecs = (this._phoneEventSecs || 0) + deltaTime;
                if (this._phoneEventSecs >= 34 && (!this.lastSmartRemindTime || (now - this.lastSmartRemindTime > 25000))) {
                    this._loudPhoneTriggeredInRoute = true;
                    this.lastSmartRemindTime = now;
                    if (Math.random() < 0.68) {
                        this.playWheezeLaughPhoneDrama(null, false);
                        return;
                    }
                    this.loudPhoneActiveUntil = now + 22000;
                    this.playClip('annoy_phone_loud.mp3', {
                        pan: -0.35,
                        volume: 0.95,
                        priority: 2,
                        nvdaText: 'Arkada görgüsüz bir yolcu avaz avaz telefonla konuşuyor!',
                        toastText: '📱 Görgüsüz Yolcu: "ALOOO! OTOBÜSTEYİM DİYORUM SANA, AKŞAMA HALISAHA MAÇI AYARLADIM!!"',
                        toastType: 'warning',
                        onend: () => {
                            if (performance.now() < (this.loudPhoneActiveUntil || 0)) {
                                setTimeout(() => {
                                    this.playClip('annoy_passengers_complain.mp3', {
                                        pan: 0.35,
                                        volume: 0.94,
                                        priority: 2,
                                        nvdaText: 'Yolcu şikayeti: Arkadaki adam avaz avaz telefonla konuşuyor, Q tuşuyla ikaz anonsu geçer misiniz?',
                                        toastText: '🗣️ Yolcu: "Başımız şişti, Q tuşuyla kabin ikaz anonsu geçer misiniz şuna?!" (Kısayol: Q)',
                                        toastType: 'info'
                                    });
                                }, 300);
                            }
                        }
                    });
                    return;
                }
            }

            // 10d. Sarsıntısız sürüşte yolcu sinirinin kademeli yatışması
            if ((this.angerLevel || 0) > 0 && gameObj.speed >= 20 && gameObj.speed <= 82 && (gameObj.passengerComfort || 100) >= 96) {
                this._calmDownSecs = (this._calmDownSecs || 0) + deltaTime;
                if (this._calmDownSecs >= 38) {
                    this._calmDownSecs = 0;
                    this.angerLevel = Math.max(0, this.angerLevel - 1);
                }
            } else {
                this._calmDownSecs = 0;
            }

            // 10e. Usta Sürüş Övgüsü & Saat/Rota/Koltuk Filtreli Doğal Kabin Sohbetleri (Yalnızca duraktan ve keskin virajdan uzaktayken!)
            const safeFromStop = (typeof gameObj.currentDistanceToNext !== 'number' || gameObj.currentDistanceToNext > 255);
            const safeFromCurve = !(Array.isArray(gameObj.upcomingTurns) && gameObj.upcomingTurns.length > 0 && gameObj.upcomingTurns[0].triggerDistance - gameObj.totalDistanceCovered < 120);
            if (safeFromStop && safeFromCurve && (gameObj.passengersOnBoard || 0) >= 2 && gameObj.speed >= 26 && gameObj.speed <= 84 && (gameObj.passengerComfort || 100) >= 97 && (this.angerLevel || 0) === 0) {
                this._smoothDriveSecs = (this._smoothDriveSecs || 0) + deltaTime;
                if (this._smoothDriveSecs >= 50 && (!this.lastSmartRemindTime || (now - this.lastSmartRemindTime > 36000))) {
                    this._smoothDriveSecs = 0;
                    this.lastSmartRemindTime = now;
                    this._ambientToggle = !this._ambientToggle;
                    if (this._ambientToggle) {
                        const praise = this.pickSmart(CLIPS.smoothPraise, { passengersOnBoard: gameObj.passengersOnBoard, clockMinutes: gameObj.clockMinutes });
                        if (typeof gameObj.addMoney === 'function') gameObj.addMoney(20);
                        if (typeof gameObj.addXP === 'function') gameObj.addXP(15);
                        this.playClip(praise.file, {
                            pan: 0.2,
                            volume: 0.92,
                            priority: 1,
                            nvdaText: praise.label + ' Artı 20 Lira ve 15 XP Usta Sürüş Övgüsü!',
                            toastText: `🌟 ${praise.label} (+20 ₺ / +15 XP)`,
                            toastType: 'success'
                        });
                    } else {
                        const curHour = (((gameObj.clockMinutes || 720) % 1440) + 1440) % 1440 / 60;
                        if (!this._goalShoutDoneInRoute && (gameObj.passengersOnBoard || 0) >= 5 && (curHour >= 15.5 || curHour < 0.5) && Math.random() < 0.55) {
                            this._goalShoutDoneInRoute = true;
                            this.playGoalRadioDrama(false);
                        } else {
                            const slice = this.pickSmart(CLIPS.ambientSlice, { passengersOnBoard: gameObj.passengersOnBoard, clockMinutes: gameObj.clockMinutes });
                            if (slice) {
                                if (slice.file === 'ambient_route_ask.mp3') {
                                    this._centralStopWaiter = { seatPan: slice.pan || 0.30 };
                                }
                                this.playClip(slice.file, {
                                    pan: slice.pan,
                                    volume: 0.80,
                                    priority: 1,
                                    nvdaText: slice.label,
                                    toastText: `💬 ${slice.label}`,
                                    toastType: 'info'
                                });
                            }
                        }
                    }
                    return;
                }
            } else if ((this.angerLevel || 0) > 0) {
                this._smoothDriveSecs = 0;
            }

            if (this.lastSmartRemindTime && (now - this.lastSmartRemindTime < 44000)) return;
            const respected = this.isDriverRespected();

            // 10f. Şoför Saygınlığına Göre Kibar veya Kaba Far / Silecek / Klima / Kalorifer İstekleri!
            if ((gameObj.passengersOnBoard || 0) > 0 && gameObj.isNight && !gameObj.isHeadlightsOn && gameObj.speed > 22 && (!gameObj.busDamage || gameObj.busDamage.headlights < 100)) {
                this._darkDriveSecs = (this._darkDriveSecs || 0) + deltaTime;
                if (this._darkDriveSecs >= 6.5) {
                    this._darkDriveSecs = 0;
                    this.lastSmartRemindTime = now;
                    this.playClip(respected ? 'dark_headlights_warn.mp3' : 'rude_headlights.mp3', {
                        pan: 0.25,
                        volume: 0.95,
                        priority: 2,
                        nvdaText: respected
                            ? 'Yolcu uyarısı: Pardon, farları yakmayı unuttunuz, F tuşuyla farları açabilir misiniz?'
                            : 'Kaba yolcu uyarısı: Lan farları yaksana köstebek gibi karanlıkta gidiyoruz, F tuşuyla farları aç!',
                        toastText: respected
                            ? '💡 Yolcu: "Pardon, farları yakmayı unuttunuz galiba! (F tuşu)"'
                            : '💡 Kaba Yolcu: "Lan farları yaksana köstebek gibi karanlıkta gidiyoruz! (F tuşu)"',
                        toastType: 'warning'
                    });
                    return;
                }
            } else {
                this._darkDriveSecs = 0;
            }

            const wiperOn = (typeof audio !== 'undefined' && audio.isWiperOn);
            if ((gameObj.passengersOnBoard || 0) > 0 && (gameObj.weather === 'rainy' || gameObj.weather === 'snowy') && !wiperOn && gameObj.speed > 22 && (!gameObj.busDamage || gameObj.busDamage.wipers < 100)) {
                this._wetDriveSecs = (this._wetDriveSecs || 0) + deltaTime;
                if (this._wetDriveSecs >= 7.5) {
                    this._wetDriveSecs = 0;
                    this.lastSmartRemindTime = now;
                    this.playClip(respected ? 'rain_wipers_warn.mp3' : 'rude_wipers.mp3', {
                        pan: 0.35,
                        volume: 0.95,
                        priority: 2,
                        nvdaText: respected
                            ? 'Yolcu uyarısı: Pardon, ön cam yağmurdan sırılsıklam oldu, Shift ve W ile silecekleri çalıştırabilir misiniz?'
                            : 'Kaba yolcu uyarısı: Şu sileceği çalıştırsana be körlemesine gidiyorsun, Shift ve W ile silecekleri aç!',
                        toastText: respected
                            ? '🌧️ Yolcu: "Pardon, ön cam yağmurdan sırılsıklam oldu, silecekleri çalıştırabilir misiniz? (Shift+W)"'
                            : '🌧️ Kaba Yolcu: "Şu sileceği çalıştırsana be körlemesine gidiyorsun! (Shift+W)"',
                        toastType: 'warning'
                    });
                    return;
                }
            } else {
                this._wetDriveSecs = 0;
            }

            if ((gameObj.passengersOnBoard || 0) > 0 && !gameObj.isACOn && typeof gameObj.busTemperature === 'number') {
                if (gameObj.busTemperature >= 26.0 && gameObj.busTemperature < 27.0 && (!this._stuffyCoughTime || (now - this._stuffyCoughTime > 65000))) {
                    this._stuffyCoughTime = now;
                    this.lastSmartRemindTime = now;
                    this.playClip('micro_cough_stuffy.mp3', {
                        pan: -0.32,
                        volume: 0.90,
                        priority: 2,
                        nvdaText: 'Yolcu öksürdü: Öhhö öhhö! Uff içerisi de amma havasız kaldı be, nefes alamıyoruz! (K tuşu: Klima)',
                        toastText: '😷 Havasızlıktan Öksüren Yolcu: "Öhhö öhhö! Uff içerisi amma havasız kaldı!" (K: Klima)',
                        toastType: 'info'
                    });
                    return;
                }
                if (gameObj.busTemperature >= 27) {
                    this.lastSmartRemindTime = now;
                    this.playClip(respected ? 'ac_request.mp3' : 'rude_ac_hot.mp3', {
                        pan: -0.25,
                        volume: 0.95,
                        priority: 2,
                        nvdaText: respected
                            ? 'Yolcu: Affedersiniz, otobüsün içi çok sıcak oldu, K tuşuyla klimayı açabilir misiniz?'
                            : 'Kaba yolcu: Lan açsana şu klimayı geberdik sıcaktan be! K tuşuyla klimayı aç!',
                        toastText: respected
                            ? '❄️ Yolcu: "Affedersiniz, içerisi çok havasız kaldı, klimayı açabilir misiniz? (K tuşu)"'
                            : '❄️ Kaba Yolcu: "Lan açsana şu klimayı geberdik sıcaktan, cimrilik mi yapıyorsun?! (K tuşu)"',
                        toastType: respected ? 'info' : 'warning'
                    });
                } else if (gameObj.busTemperature <= 13) {
                    this.lastSmartRemindTime = now;
                    this.playClip(respected ? 'cold_request.mp3' : 'rude_cold.mp3', {
                        pan: -0.3,
                        volume: 0.95,
                        priority: 2,
                        nvdaText: respected
                            ? 'Yolcu: Üşüdük arkada, K tuşuyla kaloriferi açabilir misiniz?'
                            : 'Kaba yolcu: Kutuplarda mıyız lan açsana şu kaloriferi! K tuşuyla ısıtıcıyı aç!',
                        toastText: respected
                            ? '🔥 Yolcu: "Üşüdük arkada, klimayı kaloriferi açabilir misiniz? (K tuşu)"'
                            : '🔥 Kaba Yolcu: "Kutuplarda mıyız lan açsana şu kaloriferi, morga mı götürüyorsun bizi?! (K tuşu)"',
                        toastType: respected ? 'info' : 'warning'
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
            this.playClip(file, { pan: 0, volume: 0.94, priority: 2, interrupt: true });
            return true;
        },

        // 13. YÜZE KAPI ÇARPMA, İNECEK VAR İKEN KALKMA, DURAKTA BOŞ BEKLEME, GİZLİ MÜFETTİŞ VE Q KABİN İKAZI
        onDoorSlammedInFace: function () {
            if (!this.canSpeakInCabin()) return false;
            this.adjustCityReputation(-8);
            if (this.inspector) this.inspector.roughCount = (this.inspector.roughCount || 0) + 1;
            this.playClip(CLIPS.sfxDoorBang, { pan: 0.72, volume: 0.88, isExterior: true, backgroundSfx: true });
            setTimeout(() => {
                this.playClip('door_slammed_face.mp3', {
                    pan: 0.70,
                    volume: 0.98,
                    isExterior: true,
                    priority: 3,
                    interrupt: true,
                    nvdaText: 'Durakta bekleyen yolcunun yüzüne kapıyı kapattınız! Yolcu: Hooop yüzümüze kapıyı çarptın be! Daha sırada bekleyen yolcu var, açsana şu ön kapıyı! (PageUp)',
                    toastText: '🚪 Yüzüne Kapı Çarpılan Yolcu: "HOOOP YÜZÜMÜZE KAPIYI ÇARPTIN BE!! Daha bekleyen yolcu var, aç şu ön kapıyı!!" (PageUp)',
                    toastType: 'error'
                });
            }, 340);
            return true;
        },

        onMissedAlightBlock: function () {
            if (!this.canSpeakInCabin()) return false;
            this.angerLevel = Math.min(8, (this.angerLevel || 0) + 1);
            this.adjustCityReputation(-6);
            this.playClip(CLIPS.sfxDoorBang, { pan: -0.55, volume: 0.90, backgroundSfx: true });
            setTimeout(() => {
                this.playClip('missed_alight_rage.mp3', {
                    pan: -0.50,
                    volume: 1.0,
                    priority: 4,
                    interrupt: true,
                    nvdaText: 'İnecek yolcular varken arka kapıyı açmadınız! Yolcu: Dur kalkma sakın kalkma! Daha arka kapıyı açmadın inemedik, aç şu arka kapıyı! (PageDown)',
                    toastText: '🛑 İnecek Yolcu: "DUR KALKMA SAKIN KALKMA!! Daha arka kapıyı açmadın inemedik, aç şu arka kapıyı!!" (PageDown)',
                    toastType: 'error'
                });
            }, 320);
            return true;
        },

        onStopIdleScold: function () {
            if (!this.canSpeakInCabin()) return false;
            this.playClip('stop_idle_scold.mp3', {
                pan: -0.30,
                volume: 0.95,
                priority: 2,
                nvdaText: 'Yolcu: Herkes bindi indi hala neyi bekliyorsun durakta be?! Kapat şu kapıları da yürü artık!',
                toastText: '⏳ Sabırsız Yolcu: "Herkes bindi indi hala neyi bekliyorsun durakta?! Kapat kapıları da yürü artık!!"',
                toastType: 'warning'
            });
            return true;
        },

        triggerCabinQuietAnons: function (gameObj) {
            if (!this.canSpeakInCabin()) return false;
            const now = performance.now();
            if (this._lastQuietAnonsTime && (now - this._lastQuietAnonsTime < 9000)) return false;
            this._lastQuietAnonsTime = now;

            if (typeof audio !== 'undefined' && typeof audio.playIBISChime === 'function') {
                audio.playIBISChime();
            }
            const wasLoudPhone = now < (this.loudPhoneActiveUntil || 0);
            const wasWheezeLaugh = now < (this.wheezeLaughActiveUntil || 0);
            const wasHawker = now < (this.hawkerActiveUntil || 0);
            this.loudPhoneActiveUntil = 0;
            this.wheezeLaughActiveUntil = 0;
            this.hawkerActiveUntil = 0;

            setTimeout(() => {
                this.playClip('cabin_quiet_anons.mp3', {
                    pan: 0,
                    volume: 0.94,
                    priority: 3,
                    interrupt: true,
                    nvdaText: 'Kabin içi sessizlik ve düzen anonsu yapıldı.',
                    toastText: '🎙️ [Kabin İkaz Anonsu]: "Lütfen araç içi düzene özen gösteriniz..."',
                    toastType: 'info',
                    onend: () => {
                        if (wasWheezeLaugh) {
                            this.allyPoints = (this.allyPoints || 0) + 1;
                            this.adjustCityReputation(7);
                            if (gameObj && typeof gameObj.addMoney === 'function') gameObj.addMoney(35);
                            if (gameObj && typeof gameObj.addXP === 'function') gameObj.addXP(20);
                            const wasDeniz = !!this._wheezeWasDeniz;
                            this._wheezeWasDeniz = false;
                            setTimeout(() => {
                                this.playClip(wasDeniz ? 'deniz_shutup_laugh.mp3' : 'wheeze_laugh_shutup_m1.mp3', {
                                    pan: wasDeniz ? 0.45 : -0.38,
                                    volume: 0.96,
                                    priority: 3,
                                    nvdaText: wasDeniz
                                        ? 'Mahalle ablası gülmesini zor tutarak telefonu kapattı: Pffft ahahaha! Ay tamam be yemeyin adamı sustuk işte! Kız kapat kapat şoför anons geçti otobüsten atacak şimdi beni! Artı 35 Lira ve 20 XP!'
                                        : 'Gülme krizine giren yolcu gülmesini zor tutarak telefonu kapattı: Pffft hahaha! Ay tamam pardon özür dilerim sustum, kanka kapatıyorum otobüsten atacaklar şimdi bizi! Artı 35 Lira ve 20 XP!',
                                    toastText: wasDeniz
                                        ? '🤣 Mahalle Ablası: "Pffft-ahahaha! Ay tamam be yemeyin adamı sustuk işte! Kız kapat kapat otobüsten atacak şimdi beni!!" (+35 ₺ / +20 XP)'
                                        : '🤭 Gülmesini Zor Tutan Yolcu: "Pffft-hahaha! Tamam pardon sustum, kapatıyorum otobüsten atacaklar şimdi!!" (+35 ₺ / +20 XP)',
                                    toastType: 'success'
                                });
                            }, 300);
                        } else if (wasHawker) {
                            this.allyPoints = (this.allyPoints || 0) + 1;
                            this.adjustCityReputation(7);
                            if (gameObj && typeof gameObj.addMoney === 'function') gameObj.addMoney(35);
                            if (gameObj && typeof gameObj.addXP === 'function') gameObj.addXP(20);
                            setTimeout(() => {
                                this.playClip('story_hawker_kick.mp3', {
                                    pan: 0.42,
                                    volume: 0.95,
                                    priority: 3,
                                    nvdaText: 'Kaçak seyyar satıcı otobüsten indirildi! Artı 35 Lira Kabin Düzeni Primi ve 20 XP!',
                                    toastText: '🧳 Seyyar Satıcı İndirildi: "Tamam be kızmayın iniyoruz işte!" (+35 ₺ / +20 XP)',
                                    toastType: 'success'
                                });
                            }, 320);
                        } else if (wasLoudPhone) {
                            this.allyPoints = (this.allyPoints || 0) + 1;
                            this.adjustCityReputation(6);
                            if (gameObj && typeof gameObj.addMoney === 'function') gameObj.addMoney(30);
                            if (gameObj && typeof gameObj.addXP === 'function') gameObj.addXP(20);
                            setTimeout(() => {
                                this.playClip('annoy_phone_shutup.mp3', {
                                    pan: -0.35,
                                    volume: 0.94,
                                    priority: 3,
                                    nvdaText: 'Görgüsüz yolcu telefonu kapattı! Artı 30 Lira Kabin Huzuru Primi ve 20 XP!',
                                    toastText: '📵 Görgüsüz Yolcu: "Tamam be amma büyüttünüz kapatıyoruz işte telefonu!" (+30 ₺ / +20 XP)',
                                    toastType: 'success'
                                });
                            }, 350);
                        } else if (gameObj && (gameObj.passengersOnBoard || 0) > 0 && (this.angerLevel || 0) >= 4) {
                            // Şoför çok kötü sürüp üstüne yolculara "sessiz olun" anonsu açarsa ters cevap alır!
                            setTimeout(() => {
                                this.playClip('rude_mock_anons.mp3', {
                                    pan: -0.40,
                                    volume: 0.96,
                                    priority: 3,
                                    nvdaText: 'Öfkeli Yolcu: Banttan kibar anons açacağına önce doğru düzgün araba sürmeyi öğren sen be!',
                                    toastText: '🤬 Yolcu: "Banttan kibar anons açacağına önce araba sürmeyi öğren sen be!!"',
                                    toastType: 'warning'
                                });
                            }, 350);
                        }
                    }
                });
            }, 680);
            return true;
        },

        evaluateInspectorAtFinalStop: function (gameObj) {
            if (!this.canSpeakInCabin() || !gameObj || !this.inspector || this.inspector.evaluated) return false;
            if (gameObj.activeRouteData && (gameObj.activeRouteData.isTraining || gameObj.activeRouteData.emptyBus)) return false;
            this.inspector.evaluated = true;

            const inf = this.inspector;
            let file = 'insp_warn.mp3';
            let toast = '🕵️ [Sivil Belediye Müfettişi]: "Birkaç noktada sarsıntı kaydettim; bu seferlik ceza yazmıyorum, daha özenli sürün."';
            let tType = 'info';

            if (inf.crashes === 0 && inf.redLights === 0 && inf.roughCount <= 1) {
                file = 'insp_perfect.mp3';
                toast = '🕵️ [Sivil Müfettiş Ödülü]: "Kusursuz sürüş ve nezaket! +150 ₺ Üstün Hizmet İkramiyesi & +60 XP!"';
                tType = 'success';
                this.adjustCityReputation(18);
                if (typeof gameObj.addMoney === 'function') gameObj.addMoney(150);
                if (typeof gameObj.addXP === 'function') gameObj.addXP(60);
            } else if (inf.crashes > 0 || inf.redLights > 0 || inf.roughCount >= 4) {
                file = 'insp_fail.mp3';
                toast = '🕵️ [Sivil Müfettiş Cezası]: "Bütün ihlallerinizi kaydettim! -120 ₺ Ağır Disiplin Tutanağı!"';
                tType = 'error';
                this.adjustCityReputation(-15);
                if (typeof gameObj.money === 'number') {
                    gameObj.money = Math.max(0, gameObj.money - 120);
                    const moneyEl = document.getElementById('hud-money');
                    if (moneyEl) moneyEl.innerText = `${Math.floor(gameObj.money)} ₺`;
                }
            }

            setTimeout(() => {
                if (gameObj.isDriving) return;
                this.playClip(file, {
                    pan: 0.20,
                    volume: 0.98,
                    priority: 3,
                    interrupt: true,
                    nvdaText: toast,
                    toastText: toast,
                    toastType: tType
                });
            }, 4600);
            return true;
        },

        // 14. İNSAN CAMBAZLIKLARI: 3B KORİDOR ADIM İLLÜZYONU, MİLİSANİYELİK SÖZ KESME, FISILTI DEDİKODU, 90+4 GOL & SEYYAR SATICI
        playAisleFootsteps: function (fromPan = 0.65, toPan = -0.18, stepsCount = 6, stepIntervalMs = 290, onComplete = null) {
            if (!this._footstepTimers) this._footstepTimers = [];
            const ctx = (typeof Howler !== 'undefined' && Howler.ctx)
                ? Howler.ctx
                : ((typeof audio !== 'undefined' && audio.ctx) ? audio.ctx : null);

            for (let i = 0; i < stepsCount; i++) {
                const tid = setTimeout(() => {
                    if (!ctx) return;
                    try {
                        if (ctx.state === 'suspended') ctx.resume().catch(() => {});
                        const progress = stepsCount > 1 ? (i / (stepsCount - 1)) : 1;
                        const curPan = fromPan + (toPan - fromPan) * progress;
                        const stepGain = this.getVolume(0.26 + 0.56 * progress);
                        const nowT = ctx.currentTime;

                        // Kauçuk otobüs koridoru tok taban vuruşu
                        const osc = ctx.createOscillator();
                        const gNode = ctx.createGain();
                        osc.type = 'triangle';
                        osc.frequency.setValueAtTime(i % 2 === 0 ? 118 : 104, nowT);
                        osc.frequency.exponentialRampToValueAtTime(38, nowT + 0.11);
                        gNode.gain.setValueAtTime(stepGain, nowT);
                        gNode.gain.exponentialRampToValueAtTime(0.001, nowT + 0.13);

                        // Ayakkabı tabanı sürtünme dokusu
                        const bufLen = Math.floor(ctx.sampleRate * 0.075);
                        const nBuf = ctx.createBuffer(1, bufLen, ctx.sampleRate);
                        const data = nBuf.getChannelData(0);
                        for (let k = 0; k < bufLen; k++) {
                            data[k] = (Math.random() * 2 - 1) * Math.exp(-k / (bufLen * 0.35));
                        }
                        const nSrc = ctx.createBufferSource();
                        nSrc.buffer = nBuf;
                        const bp = ctx.createBiquadFilter();
                        bp.type = 'bandpass';
                        bp.frequency.value = 880 + (i % 2) * 140;
                        bp.Q.value = 1.4;
                        const nGain = ctx.createGain();
                        nGain.gain.value = stepGain * 0.42;

                        if (typeof ctx.createStereoPanner === 'function') {
                            const panner = ctx.createStereoPanner();
                            panner.pan.value = Math.max(-1, Math.min(1, curPan));
                            osc.connect(gNode);
                            gNode.connect(panner);
                            nSrc.connect(bp);
                            bp.connect(nGain);
                            nGain.connect(panner);
                            panner.connect(ctx.destination);
                        } else {
                            osc.connect(gNode);
                            gNode.connect(ctx.destination);
                            nSrc.connect(bp);
                            bp.connect(nGain);
                            nGain.connect(ctx.destination);
                        }
                        osc.start(nowT);
                        osc.stop(nowT + 0.14);
                        nSrc.start(nowT);
                    } catch (e) {}
                }, i * stepIntervalMs);
                this._footstepTimers.push(tid);
            }

            if (typeof onComplete === 'function') {
                const doneId = setTimeout(() => onComplete(), stepsCount * stepIntervalMs + 80);
                this._footstepTimers.push(doneId);
            }
        },

        playWalkingAngryConfrontation: function (force = false) {
            if (!this.canSpeakInCabin(force)) return false;
            this.playClip('walk_start_angry.mp3', {
                pan: 0.68,
                volume: 0.68,
                priority: 4,
                force,
                interrupt: true,
                nvdaText: 'En arka koltuktaki öfkeli yolcu ayağa kalktı: Bekle lan bekle geliyorum oraya, arkadan bağırmakla anlamıyorsun sen!',
                toastText: '👣 Arka Sıradan Kalkan Yolcu: "Bekle lan bekle geliyorum oraya!!"',
                toastType: 'warning',
                onend: () => {
                    this.playAisleFootsteps(0.68, -0.16, 6, 280, () => {
                        this.playClip('walk_arrive_angry.mp3', {
                            pan: -0.16,
                            volume: 1.0,
                            priority: 4,
                            force,
                            interrupt: true,
                            nvdaText: 'Yolcu koridoru yürüyüp tam ensenize dikildi: Bak şimdi yüzüne söylüyorum, şu direksiyonu adam gibi tut yoksa fena papaz olacağız seninle!',
                            toastText: '🤬 Ensenize Dikilen Yolcu: "Bak şimdi yüzüne söylüyorum, şu direksiyonu adam gibi tut yoksa fena papaz olacağız!!"',
                            toastType: 'error'
                        });
                    });
                }
            });
            return true;
        },

        playWalkingWrongBusDrama: function (force = false) {
            if (!this.canSpeakInCabin(force)) return false;
            this.playClip('walk_start_wrongbus.mp3', {
                pan: 0.65,
                volume: 0.72,
                priority: 2,
                force,
                interrupt: force,
                nvdaText: 'Arka koltuktan telaşlı yolcu: Eyvah eyvah! Bu otobüs sanayi kavşağına gitmiyor mu, yanlış arabaya bindim ben!',
                toastText: '🏃 Arkadan Koşan Yolcu: "Eyvah eyvah! Yanlış arabaya bindim ben!!"',
                toastType: 'info',
                onend: () => {
                    this.playAisleFootsteps(0.65, 0.16, 5, 255, () => {
                        this.playClip('walk_arrive_wrongbus.mp3', {
                            pan: 0.16,
                            volume: 0.96,
                            priority: 2,
                            force,
                            nvdaText: 'Yolcu nefes nefese yanınıza geldi: Çok pardon ya dalgınlığıma gelmiş yanlış otobüse binmişim, ilk durakta beni indirebilir misiniz?',
                            toastText: '😅 Yanınıza Gelen Yolcu: "Çok pardon ya dalgınlığıma gelmiş yanlış otobüse binmişim, ilk durakta indirebilir misiniz?"',
                            toastType: 'info'
                        });
                    });
                }
            });
            return true;
        },

        playInterruptingTrioFight: function (force = false) {
            if (!this.canSpeakInCabin(force)) return false;
            if (!this._stuntTimers) this._stuntTimers = [];
            const h1 = this.playClip('trio_1_cold.mp3', {
                pan: -0.60,
                volume: 0.94,
                priority: 3,
                force,
                interrupt: true,
                nvdaText: 'Üçlü yolcu kavgası başladı! Sol koltuk: Şu camı kapatır mısınız buz gibi rüzgar vuruyor! Sağ koltuk sözünü kesiyor: Ne kapatması ya içerisi hamam gibi! Orta sıra bağırıyor: Yeter be ikiniz de susun, şoför klimayı açsın!',
                toastText: '🗣️ Sol Sıra: "Şu camı kapatır mısınız artık, buz gibi rüzgar vuruyor!!"',
                toastType: 'info'
            });
            const cut1Ms = (h1 && typeof h1.duration === 'function' && h1.duration() > 1.2)
                ? Math.max(1500, Math.round(h1.duration() * 1000) - 340)
                : 2900;

            const t1 = setTimeout(() => {
                const h2 = this.playClip('trio_2_hot.mp3', {
                    pan: 0.60,
                    volume: 0.97,
                    force,
                    backgroundSfx: true,
                    toastText: '⚡ Sağ Sıra Sözünü Kesti: "Ne kapatması ya içerisi hamam gibi olmuş, açın şu camı!!"',
                    toastType: 'warning'
                });
                const cut2Ms = (h2 && typeof h2.duration === 'function' && h2.duration() > 1.2)
                    ? Math.max(1500, Math.round(h2.duration() * 1000) - 360)
                    : 3100;
                const t2 = setTimeout(() => {
                    this.playClip('trio_3_shutup.mp3', {
                        pan: -0.05,
                        volume: 1.0,
                        priority: 3,
                        force,
                        backgroundSfx: true,
                        toastText: '🤬 Orta Sıra İkisini Bastırdı: "YETER BE İKİNİZ DE SUSUN!! Şoför klimayı açsın bitsin şu tantana!!" (K)',
                        toastType: 'error'
                    });
                }, cut2Ms);
                this._stuntTimers.push(t2);
            }, cut1Ms);
            this._stuntTimers.push(t1);
            return true;
        },

        playWhisperGossipPair: function (force = false) {
            if (!this.canSpeakInCabin(force)) return false;
            this.playClip('micro_whisper_gossip1.mp3', {
                pan: 0.48,
                volume: 0.88,
                priority: 1,
                force,
                interrupt: force,
                nvdaText: 'Arka koltukta iki yolcu fısıldaşarak dedikodunuzu yapıyor: Şşşt kız çaktırmadan şoföre baksana, uykusuz mu çıkmış yola ne yapmış...',
                toastText: '🤫 Fısıltı Dedikodu: "Şşşt kız çaktırmadan şoföre baksana, uykusuz mu çıkmış yola..."',
                toastType: 'info',
                onend: () => {
                    const t = setTimeout(() => {
                        this.playClip('micro_whisper_gossip2.mp3', {
                            pan: 0.56,
                            volume: 0.88,
                            priority: 1,
                            force,
                            nvdaText: 'Arkadaşı fısıldadı: Sus kız duyacak şimdi aynadan bakıyor, vallahi sağ salim insek şükredeceğim...',
                            toastText: '🤫 Fısıltı Cevap: "Sus kız duyacak şimdi aynadan bakıyor..."',
                            toastType: 'info'
                        });
                    }, 180);
                    if (!this._stuntTimers) this._stuntTimers = [];
                    this._stuntTimers.push(t);
                }
            });
            return true;
        },

        playGoalRadioDrama: function (force = false) {
            if (!this.canSpeakInCabin(force)) return false;
            const h1 = this.playClip('story_goal_shout.mp3', {
                pan: -0.45,
                volume: 0.98,
                priority: 2,
                force,
                interrupt: force,
                nvdaText: 'Gizlice maç dinleyen taraftar bir anda bağırdı: GOOOOL BE GOOOL! Doksan artı dörtte attık vallahi şampiyonuz be!',
                toastText: '⚽ Radyodan Maç Dinleyen Yolcu: "GOOOOL BE GOOOL!! 90+4\'te attık şampiyonuz beee!!"',
                toastType: 'success'
            });
            const cutMs = (h1 && typeof h1.duration === 'function' && h1.duration() > 1.2)
                ? Math.max(1600, Math.round(h1.duration() * 1000) - 240)
                : 3200;
            if (!this._stuntTimers) this._stuntTimers = [];
            this._stuntTimers.push(setTimeout(() => {
                this.playClip('story_goal_scold.mp3', {
                    pan: 0.42,
                    volume: 0.96,
                    priority: 2,
                    force,
                    backgroundSfx: true,
                    nvdaText: 'Yanındaki teyze korkudan sıçradı: Ayy ödüm patladı be adam! Otobüste öyle bağırılır mı yüreğime indi vallahi!',
                    toastText: '👵 Korkudan Sıçrayan Teyze: "Ayy ödüm patladı be adam! Otobüste öyle bağırılır mı yüreğime indi!!"',
                    toastType: 'warning'
                });
            }, cutMs));
            return true;
        },

        triggerStopHawker: function (stopIndex, force = false) {
            if (!this.canSpeakInCabin(force)) return false;
            if (!force) {
                if (this._hawkerTriggeredInRoute || (stopIndex || 0) < 1) return false;
                if (Math.random() > 0.24) return false;
                this._hawkerTriggeredInRoute = true;
            }
            this.hawkerActiveUntil = performance.now() + 22000;
            this.playClip('story_hawker_pitch.mp3', {
                pan: 0.38,
                volume: 0.95,
                priority: 2,
                force,
                interrupt: force,
                nvdaText: 'Duraktan kaçak seyyar satıcı bindi: Abilerim ablalarım hayırlı yolculuklar, yara bantları kağıt mendiller on lira! İndirmek için Q tuşuyla ikaz anonsu yapın.',
                toastText: '🧳 Kaçak İşportacı Bindi: "Yara bantları kağıt mendiller 10 lira!" (İndirmek İçin Q Tuşu!)',
                toastType: 'warning'
            });
            return true;
        },

        playWheezeLaughPhoneDrama: function (genderOverride = null, force = false) {
            if (!this.canSpeakInCabin(force)) return false;
            let choice = genderOverride;
            if (!choice) {
                const r = Math.random();
                choice = r < 0.38 ? 'deniz' : (r < 0.70 ? 'm' : 'f');
            }
            this._wheezeWasDeniz = (choice === 'deniz');
            const file = choice === 'deniz'
                ? 'wheeze_laugh_deniz_f1.mp3'
                : (choice === 'f' ? 'wheeze_laugh_phone_f1.mp3' : 'wheeze_laugh_phone_m1.mp3');
            const pan = choice === 'm' ? -0.42 : 0.44;
            const label = choice === 'deniz'
                ? 'Mahalle Ablası Deniz (Katıla Katıla Kahkaha Krizi): "AHAHAHA!! Ay kız dur dalağım şişti nefes alamıyorum! Koca herif otobüsün peşinden koşarken pazar arabasının tekeri fırladı boylu boyunca yapıştı yere kız AHAHAHA!! Karnıma kramp girdi gülmekten çatlayacağım!!"'
                : (choice === 'f'
                    ? 'Telefonda Katıla Katıla Gülen Kız: "AHAHAHA!! Ay kız dur nefes alamıyorum boğulacağım! Çocuğun çantası kapıya sıkıştı pantolonu cırt diye yırtıldı kız AHAHAHA!!"'
                    : 'Telefonda Ciğeri Sökülerek Gülen Yolcu: "AHAHAHA!! Ay dur nefesim kesildi! Adam otobüse yetişecem diye koşarken ayağından terlik uçtu lan AHAHAHA!!"');

            this.wheezeLaughActiveUntil = performance.now() + 30000;
            this.playClip(file, {
                pan,
                volume: 0.98,
                priority: 2,
                force,
                interrupt: force,
                nvdaText: label,
                toastText: `🤣📱 ${label}`,
                toastType: 'warning',
                onend: () => {
                    if (force || performance.now() < (this.wheezeLaughActiveUntil || 0)) {
                        const t = setTimeout(() => {
                            this.playClip('wheeze_laugh_scold_f1.mp3', {
                                pan: -pan,
                                volume: 0.95,
                                priority: 2,
                                force,
                                nvdaText: 'Yan koltuktaki yolcu tepki gösterdi: Ay çatlayacak şimdi gülmekten tövbe estağfurullah! Koca otobüsü kahvehane belledi anıra anıra gülüyor telefondan! Q tuşuyla ikaz anonsu geçin!',
                                toastText: '😒 Yan Koltuktaki Yolcu: "Ay çatlayacak şimdi gülmekten! Koca otobüsü kahvehane belledi, şuna bir anons geçin!!" (Kısayol: Q)',
                                toastType: 'info'
                            });
                        }, 260);
                        if (!this._stuntTimers) this._stuntTimers = [];
                        this._stuntTimers.push(t);
                    }
                }
            });
            return true;
        },

        // 15. AKILLI MEKANİK, KAPI/RAMPA/EL FRENİ KİLİDİ, HARARET, YAKIT BİTME VE YAĞMURLU DURAK FARKINDALIĞI
        onInterlockGasAttempt: function (type, passengersOnBoard) {
            if (!this.canSpeakInCabin() || (passengersOnBoard || 0) <= 0) return false;
            const now = performance.now();
            if (this._lastInterlockVoice && (now - this._lastInterlockVoice < 18000)) return false;
            this._lastInterlockVoice = now;

            const map = {
                doors: {
                    file: 'smart_doors_open_gas.mp3',
                    pan: 0.35,
                    text: 'Kapılar açık hala kapılar! Önce kapıları kapatın öyle basın gaza, düşüreceksiniz milleti! (PageUp / PageDown)'
                },
                ramp: {
                    file: 'smart_ramp_open_warn.mp3',
                    pan: 0.45,
                    text: 'Hooop durun rampa hala dışarıda açık kaldı! Kaldırıma çarpacak şimdi, önce rampayı toplayın! (U tuşu)'
                },
                handbrake: {
                    file: 'smart_handbrake_warn.mp3',
                    pan: -0.25,
                    text: 'El freni çekili kaldı galiba, otobüs yerinden oynamıyor zorlamayın boşuna! (Shift + Boşluk)'
                },
                engine_off: {
                    file: 'smart_engine_off_gas.mp3',
                    pan: -0.30,
                    text: 'Motor çalışmıyor ki daha! Önce kontağı çevirip motoru çalıştırsana, boşa basıyorsun pedala! (Boşluk tuşu)'
                }
            };
            const item = map[type];
            if (!item) return false;
            setTimeout(() => {
                this.playClip(item.file, {
                    pan: item.pan,
                    volume: 0.95,
                    priority: 3,
                    interrupt: true,
                    nvdaText: 'Yolcu uyarısı: ' + item.text,
                    toastText: `🛑 Yolcu Fark Etti: "${item.text}"`,
                    toastType: 'warning'
                });
            }, 350);
            return true;
        },

        onWheelchairWaitingAtStop: function () {
            if (!this.canSpeakInCabin()) return false;
            this.playClip('smart_wheelchair_wait.mp3', {
                pan: 0.58,
                volume: 0.96,
                isExterior: true,
                priority: 3,
                nvdaText: 'Duraktaki tekerlekli sandalyeli yolcu: Pardon! Tekerlekli sandalyeyle bekliyoruz durakta, engelli rampasını indirebilir misiniz zahmet olmazsa? Rampayı açmak için U tuşuna basın.',
                toastText: '♿ Duraktaki Yolcu: "Tekerlekli sandalyeyle bekliyoruz, engelli rampasını indirebilir misiniz?" (Kısayol: U)',
                toastType: 'info'
            });
            return true;
        },

        onEngineOverheatCabin: function (passengersOnBoard) {
            if (!this.canSpeakInCabin() || (passengersOnBoard || 0) <= 0) return false;
            const now = performance.now();
            if (this._lastOverheatVoice && (now - this._lastOverheatVoice < 50000)) return false;
            this._lastOverheatVoice = now;
            this.playClip('smart_engine_overheat.mp3', {
                pan: 0.55,
                volume: 0.96,
                priority: 3,
                nvdaText: 'En arka koltuktaki yolcu: Uff en arka koltukların altı fırın gibi yandı, motordan yanık kokusu geliyor! Hararet mi yaptı bu araba?!',
                toastText: '🌡️🔥 Arka Koltuk Yolcusu: "Koltukların altı fırın gibi yandı, motordan yanık kokusu geliyor! Hararet mi yaptı?!"',
                toastType: 'error'
            });
            return true;
        },

        onOutOfFuelStall: function (passengersOnBoard) {
            if (!this.canSpeakInCabin() || (passengersOnBoard || 0) <= 0) return false;
            this.angerLevel = Math.min(8, (this.angerLevel || 0) + 2);
            this.adjustCityReputation(-12);
            setTimeout(() => {
                this.playClip('smart_out_of_fuel.mp3', {
                    pan: -0.35,
                    volume: 0.98,
                    priority: 4,
                    interrupt: true,
                    nvdaText: 'Mazot bitti ve otobüs yolda kaldı! Öfkeli yolcu: Şaka mı bu ya yolda mı kaldık şimdi?! Koca otobüste mazota bakmadan mı çıktın yola, nasıl yetişeceğiz biz işe?!',
                    toastText: '⛽🤬 Yolcu: "Şaka mı bu ya yolda mı kaldık?! Mazota bakmadan mı çıktın yola, nasıl yetişeceğiz işe?!" (J: Tesis/Çekici)',
                    toastType: 'error'
                });
            }, 600);
            return true;
        },

        onRainStopWaitingForDoor: function () {
            if (!this.canSpeakInCabin()) return false;
            this.playClip(CLIPS.sfxDoorBang, { pan: 0.68, volume: 0.82, isExterior: true, backgroundSfx: true });
            setTimeout(() => {
                this.playClip('smart_rain_open_door.mp3', {
                    pan: 0.65,
                    volume: 0.96,
                    isExterior: true,
                    priority: 3,
                    nvdaText: 'Yağmurda durakta bekleyen yolcu cama vurdu: Hooop açsana şu ön kapıyı sırılsıklam olduk yağmurun altında be, donduk dışarıda! (PageUp)',
                    toastText: '🌧️🚪 Duraktaki Yolcu: "Hooop açsana şu ön kapıyı sırılsıklam olduk yağmurun altında be!!" (PageUp)',
                    toastType: 'warning'
                });
            }, 280);
            return true;
        },

        speakLivePassengerReport: function (gameObj) {
            const g = gameObj || this.getGameObj();
            const total = g ? (g.passengersOnBoard || 0) : 0;
            const r = this.roster || { yasli: 0, ogrenci: 0, tam: 0, standing: 0 };
            const rep = this.getCityReputation();
            const repTitle = rep >= 45
                ? `Şehir Efsanesi Usta (+${rep})`
                : (rep >= 18
                    ? `Sevilen Şoför (+${rep})`
                    : (rep <= -35
                        ? `Sabıkalı Hırçın Şoför (${rep})`
                        : (rep <= -12 ? `Şikayet Edilen Şoför (${rep})` : `Standart Şoför (${rep})`)));

            const anger = this.angerLevel || 0;
            const moodText = total === 0
                ? 'Kabin şu an boş.'
                : (anger === 0
                    ? 'Kabin huzurlu ve memnun.'
                    : (anger <= 2
                        ? 'Yolcular hafif huzursuz.'
                        : (anger <= 4 ? 'Kabin oldukça gergin!' : 'Yolcular isyan eşiğinde!')));

            const curIdx = g ? (g.currentStopIndex || 0) : 0;
            const dueCount = Array.isArray(this.simulatedPassengers)
                ? this.simulatedPassengers.filter(ag => ag.targetStopIndex <= curIdx).length
                : 0;
            const allies = this.allyPoints || 0;

            const report = total === 0
                ? `Kabin İstihbaratı: Araçta yolcu yok. Şehir itibarınız: ${repTitle}.`
                : `Kabin İstihbaratı: Araçta toplam ${total} yolcu var (${r.yasli || 0} yaşlı, ${r.ogrenci || 0} öğrenci, ${Math.max(0, total - (r.yasli || 0) - (r.ogrenci || 0))} tam kartlı, ${r.standing || 0} ayakta). ${moodText} Gelecek durakta tahmini ${dueCount} yolcu inecek. ${allies > 0 ? `Sizi savunmaya hazır ${allies} dost yolcu var. ` : ''}Şehir itibarınız: ${repTitle}.`;

            if (typeof audio !== 'undefined' && typeof audio.speak === 'function') {
                audio.speak(report);
            }
            if (typeof audio !== 'undefined' && typeof audio.updateNvdaLiveRegion === 'function') {
                audio.updateNvdaLiveRegion('📡 ' + report);
            }
            if (typeof UI !== 'undefined' && typeof UI.showToast === 'function') {
                UI.showToast(`📡 ${total} Yolcu (${r.yasli || 0} Yaşlı / ${r.ogrenci || 0} Öğrenci) • ${moodText} • İtibar: ${repTitle}`, 'info');
            }
            return true;
        },

        // 16. YOLDA KAVGA EDEN 2 ADAMIN YANINDAN 3B GEÇİŞ SAHNESİ (Yaklaşma -> Tam Cam Hizası -> Uzaklaşma + H Korna Tepkisi + Kabin Yorumu!)
        computeStreetFightSpatial: function (distMeters, sideSign) {
            const absD = Math.abs(distMeters);
            const gain = Math.max(0.08, Math.min(1.0, 1.0 / (1.0 + Math.pow(absD / 32, 1.55))));
            const width = 0.36 + 0.56 * (1.0 - Math.min(1.0, absD / 80));
            return { gain, pan: Math.max(-0.96, Math.min(0.96, sideSign * width)) };
        },

        playExteriorSpatialHowl: function (filename, sf, panOffset = 0, onend = null) {
            const h = this.getHowl(filename);
            if (!h) {
                if (typeof onend === 'function') onend();
                return null;
            }
            const sid = h.play();
            const sp = this.computeStreetFightSpatial(sf.distMeters, sf.sideSign);
            h.volume(this.getVolume(sp.gain), sid);
            if (typeof h.stereo === 'function') {
                h.stereo(Math.max(-0.98, Math.min(0.98, sp.pan + panOffset)), sid);
            }
            try {
                const snd = typeof h._soundById === 'function' ? h._soundById(sid) : null;
                if (snd && snd._node && this.ensureExteriorFilter()) {
                    this.updateExteriorOcclusion();
                    snd._node.disconnect();
                    snd._node.connect(this.exteriorFilter);
                    snd._mikyasRoutedExterior = true;
                }
            } catch (e) {}
            const entry = { howl: h, sid, panOffset };
            sf.entries.push(entry);
            if (typeof onend === 'function') {
                h.once('end', () => onend(), sid);
            }
            return { h, sid };
        },

        updateRoadsideFight: function (gameObj, deltaTime) {
            const sf = this.activeStreetFight;
            if (!sf || !sf.active) return;
            const speedKmh = sf.isDemo ? 40 : ((gameObj && typeof gameObj.speed === 'number') ? gameObj.speed : 36);
            sf.distMeters -= (speedKmh / 3.6) * deltaTime;

            const sp = this.computeStreetFightSpatial(sf.distMeters, sf.sideSign);
            sf.entries.forEach(en => {
                try {
                    if (en.howl && en.howl.playing(en.sid)) {
                        en.howl.volume(this.getVolume(sp.gain), en.sid);
                        if (typeof en.howl.stereo === 'function') {
                            en.howl.stereo(Math.max(-0.98, Math.min(0.98, sp.pan + (en.panOffset || 0))), en.sid);
                        }
                    }
                } catch (e) {}
            });

            if (sf.distMeters < -95 && sf.brawlFinished) {
                sf.active = false;
                if (this._demoFightInterval) {
                    clearInterval(this._demoFightInterval);
                    this._demoFightInterval = null;
                }
            }
        },

        triggerRoadsideFight: function (forceDemo = false) {
            if (!this.canSpeakInCabin(forceDemo)) return false;
            if (this._demoFightInterval) {
                clearInterval(this._demoFightInterval);
                this._demoFightInterval = null;
            }
            if (typeof this.stopPolicePursuit === 'function') {
                this.stopPolicePursuit();
            }
            if (!this._stuntTimers) this._stuntTimers = [];

            this._fightVariantIdx = ((this._fightVariantIdx || 0) + 1) % 2;
            const isVariant1 = (this._fightVariantIdx === 1);
            const fileA = isVariant1 ? 'street_fight1_a.mp3' : 'street_fight2_a.mp3';
            const fileB = isVariant1 ? 'street_fight1_b.mp3' : 'street_fight2_b.mp3';
            const sideSign = forceDemo ? 1 : (Math.random() < 0.72 ? 1 : -1);
            const sideText = sideSign > 0 ? 'Sağ kaldırımda' : 'Sol şeritte';

            const sf = {
                active: true,
                isDemo: !!forceDemo,
                distMeters: 56,
                sideSign,
                hornSnapped: false,
                brawlFinished: false,
                entries: []
            };
            this.activeStreetFight = sf;

            if (forceDemo) {
                this._demoForceOcclusion = 'open';
                this.updateExteriorOcclusion();
                this._demoFightInterval = setInterval(() => {
                    this.updateRoadsideFight(null, 0.08);
                }, 80);
            }

            // İleride kavga kornası + 1. Adam bağırışı -> üstüne binerek 2. Adam bağırışı -> Yanlarından geçince otobüsteki yolcu yorumu!
            this.playExteriorSpatialHowl(CLIPS.sfxHorn, sf, 0);
            const descToast = isVariant1
                ? `🥊 ${sideText} İleride 2 Şoför Yakapaça Kavga Ediyor! (Cam: Home / Korna: L)`
                : `🥊 ${sideText} İleride Esnaf ile Sürücü Kavga Ediyor! (Cam: Home / Korna: L)`;
            if (typeof UI !== 'undefined' && UI.showToast) UI.showToast(descToast, 'warning');
            if (typeof audio !== 'undefined' && typeof audio.updateNvdaLiveRegion === 'function') {
                audio.updateNvdaLiveRegion(`${sideText} ileride iki adam kavga ediyor, yanlarından geçiyorsunuz!`);
            }

            this._stuntTimers.push(setTimeout(() => {
                if (!sf.active) return;
                const playedA = this.playExteriorSpatialHowl(fileA, sf, -0.06);
                const overlapMs = (playedA && playedA.h && typeof playedA.h.duration === 'function' && playedA.h.duration() > 1.5)
                    ? Math.max(1800, Math.round(playedA.h.duration() * 1000) - 1100)
                    : 3400;

                this._stuntTimers.push(setTimeout(() => {
                    if (!sf.active) return;
                    this.playExteriorSpatialHowl(fileB, sf, 0.06, () => {
                        sf.brawlFinished = true;
                        if (forceDemo) {
                            this._demoForceOcclusion = null;
                            this.updateExteriorOcclusion();
                            if (this._demoFightInterval) {
                                clearInterval(this._demoFightInterval);
                                this._demoFightInterval = null;
                            }
                        }
                        const g = this.getGameObj();
                        if (forceDemo || (g && (g.passengersOnBoard || 0) > 0)) {
                            this._stuntTimers.push(setTimeout(() => {
                                this.playClip('street_fight_cabin_watch.mp3', {
                                    pan: sideSign * 0.42,
                                    volume: 0.92,
                                    priority: 2,
                                    force: forceDemo,
                                    nvdaText: 'Otobüsten kavgayı izleyen yolcu: Ohoo dışarıya bak fena birbirine girdi adamlar yakapaça oldular! Hiç bulaşma bas geç vallahi başımıza iş almayalım!',
                                    toastText: '👀 Yolcu Camdan Baktı: "Ohoo dışarıya bak fena birbirine girdi adamlar! Hiç bulaşma bas geç vallahi!"',
                                    toastType: 'info'
                                });
                            }, 350));
                        }
                    });
                }, overlapMs));
            }, 260));

            return true;
        },

        demoWindowOcclusionStunt: function () {
            if (!this.isEnabled()) return false;
            if (!this._stuntTimers) this._stuntTimers = [];
            this._demoForceOcclusion = 'muffled';
            this.updateExteriorOcclusion();
            this.playClip('rude_traffic_m1.mp3', {
                pan: -0.78,
                volume: 1.0,
                isExterior: true,
                force: true,
                interrupt: true,
                nvdaText: 'Canlı Cam Akustiği Gösterisi: Dışarıdaki sürücü önce kapalı cam arkasından boğuk bağırıyor, 1.5 saniye sonra cam açılınca sesi bir anda netleşiyor!',
                toastText: '🪟 [Cam Kapalı - Boğuk 620Hz] Dışarıdaki Sürücü Bağırıyor...',
                toastType: 'info',
                onend: () => {
                    this._demoForceOcclusion = null;
                    this.updateExteriorOcclusion();
                }
            });
            this._stuntTimers.push(setTimeout(() => {
                if (typeof audio !== 'undefined' && audio.playWindowSound) audio.playWindowSound(true);
                this._demoForceOcclusion = 'open';
                this.updateExteriorOcclusion();
                if (typeof UI !== 'undefined' && UI.showToast) {
                    UI.showToast('🪟 [Sol Cam Açıldı - 18.5kHz Canlı HD!] Ses Cümle Ortasında Netleşti!', 'success');
                }
            }, 1550));
            return true;
        },

        // 17. AŞAMA 14: GERÇEK ZAMANLI 3B POLİS KOVALAMACASI, MEGAFON İHTARI & BARİKAT KISKACI AKSİYON SAHNESİ!
        stopPolicePursuit: function () {
            if (this._policeChaseTimers && Array.isArray(this._policeChaseTimers)) {
                this._policeChaseTimers.forEach(t => clearTimeout(t));
                this._policeChaseTimers = [];
            }
            if (this._policeSirenHowl) {
                try { this._policeSirenHowl.stop(); } catch (e) {}
            }
            if (this.activePoliceChase) {
                this.activePoliceChase.active = false;
                this.activePoliceChase = null;
            }
        },

        ensurePoliceSirenHowl: function () {
            if (!this._policeSirenHowl && typeof Howl !== 'undefined') {
                this._policeSirenHowl = new Howl({
                    src: ['sounds/freesound_police_siren.mp3'],
                    loop: true,
                    volume: 0.45
                });
            }
            return this._policeSirenHowl || null;
        },

        applyFineToPlayer: function (amount) {
            const g = this.getGameObj();
            if (!g) return;
            g.playerBudget = Math.max(0, (g.playerBudget || 0) - amount);
            g.sessionPenalties = (g.sessionPenalties || 0) + amount;
            if (typeof g.saveData === 'function') g.saveData();
            if (typeof UI !== 'undefined' && typeof UI.updatePlayerStats === 'function') {
                UI.updatePlayerStats(g.licenseLevel, g.completedTasks, g.playerBudget, typeof g.getLicenseTitle === 'function' ? g.getLicenseTitle() : 'Kaptan');
            }
        },

        startPolicePursuit: function (reason = 'radar', forceDemo = false) {
            if (!this.canSpeakInCabin(forceDemo)) return false;
            if (this.activePoliceChase && this.activePoliceChase.active && !forceDemo) return false;
            this.stopPolicePursuit();
            this._policeChaseTimers = [];
            this._lastPoliceChaseTime = performance.now();

            const chase = {
                active: true,
                isDemo: !!forceDemo,
                reason,
                elapsed: 0,
                escalated: false,
                resolved: false,
                sirenSid: null
            };
            this.activePoliceChase = chase;

            const siren = this.ensurePoliceSirenHowl();
            if (siren) {
                const sid = siren.play();
                chase.sirenSid = sid;
                siren.volume(this.getVolume(forceDemo ? 0.36 : 0.42), sid);
                siren.rate(1.0, sid);
                if (typeof siren.stereo === 'function') siren.stereo(-0.58, sid);
                if (!forceDemo) {
                    try {
                        const snd = typeof siren._soundById === 'function' ? siren._soundById(sid) : null;
                        if (snd && snd._node && this.ensureExteriorFilter()) {
                            this.updateExteriorOcclusion();
                            snd._node.disconnect();
                            snd._node.connect(this.exteriorFilter);
                            snd._mikyasRoutedExterior = true;
                        }
                    } catch (e) {}
                }
            }

            if (typeof audio !== 'undefined' && typeof audio.playRadioSquelch === 'function') {
                audio.playRadioSquelch(true);
            }
            if (typeof audio !== 'undefined' && typeof audio.playPtsScanTone === 'function') {
                audio.playPtsScanTone();
            }

            const id = this.getPoliceIdentity();
            const reasonLabel = (reason === 'radar')
                ? 'PTS Radarda aşırı hız'
                : (reason === 'red_light'
                    ? 'EDS Kırmızı ışık ihlali'
                    : (reason === 'hit_and_run' ? 'Kaza yerini terk ihbarı' : 'Bölge Trafik PTS takibi'));

            const startMsg = forceDemo
                ? `🚨 [PTS EŞLEŞTİ: ${id.plate} • ${id.driverName}] Bölge Trafik Ekibi Sirenle Peşinize Düştü! Megafon İhtarı -> Kaçış -> Barikat Kıskacı!`
                : `🚨 POLİS PTS TESPİTİ (${reasonLabel}): "${id.plate} PLAKALI OTOBÜS SÜRÜCÜSÜ ${id.driverName.toUpperCase()}, S TUŞUYLA SAĞA ÇEKİN!"`;
            if (typeof UI !== 'undefined' && UI.showToast) UI.showToast(startMsg, 'error');
            if (typeof audio !== 'undefined' && typeof audio.updateNvdaLiveRegion === 'function') {
                audio.updateNvdaLiveRegion(`Polis PTS kamerası tespit etti! Polis megafonu: ${id.plate} plakalı otobüs sürücüsü ${id.driverName}, ${reasonLabel} nedeniyle derhal sağa çek ve motoru durdur! Durmak için S tuşuna basın!`);
            }

            this._policeChaseTimers.push(setTimeout(() => {
                if (!chase.active) return;
                this.playClip('police_chase_start.mp3', {
                    pan: -0.62,
                    volume: 1.0,
                    isExterior: !forceDemo,
                    priority: 4,
                    force: forceDemo,
                    interrupt: true,
                    toastText: `📢🚓 Polis Megafonu: "${id.plate} PLAKALI OTOBÜS SÜRÜCÜSÜ ${id.driverName.toUpperCase()}, DERHAL SAĞA ÇEK VE MOTORU DURDUR!!"`,
                    toastType: 'error',
                    onend: () => {
                        if (!chase.active || chase.resolved) return;
                        const g = this.getGameObj();
                        if (forceDemo || !g || (g.passengersOnBoard || 0) > 0) {
                            this._policeChaseTimers.push(setTimeout(() => {
                                if (!chase.active || chase.resolved) return;
                                this.playClip('police_cabin_panic.mp3', {
                                    pan: 0.28,
                                    volume: 0.96,
                                    priority: 3,
                                    force: forceDemo,
                                    nvdaText: 'Kabindeki yolcu panikledi: Eyvah eyvah polis peşimize düştü siren çalıyor arkadan! Çabuk sağa çek dur başımızı belaya sokma!',
                                    toastText: '😱 Yolcu Paniği: "Eyvah polis peşimize düştü siren çalıyor! Çabuk sağa çek dur!!"',
                                    toastType: 'warning',
                                    onend: () => {
                                        if (forceDemo && chase.active) {
                                            this._runPoliceDemoEscalation(chase);
                                        }
                                    }
                                });
                            }, 280));
                        }
                    }
                });
            }, 380));

            return true;
        },

        _runPoliceDemoEscalation: function (chase) {
            if (!chase || !chase.active) return;
            const siren = this._policeSirenHowl;
            if (siren && chase.sirenSid !== null) {
                try {
                    siren.rate(1.18, chase.sirenSid);
                    siren.volume(this.getVolume(0.46), chase.sirenSid);
                    if (typeof siren.stereo === 'function') siren.stereo(-0.82, chase.sirenSid);
                } catch (e) {}
            }
            const id = this.getPoliceIdentity();
            this._policeChaseTimers.push(setTimeout(() => {
                if (!chase.active) return;
                this.playClip('police_chase_escalate.mp3', {
                    pan: -0.82,
                    volume: 1.0,
                    priority: 4,
                    force: true,
                    interrupt: true,
                    nvdaText: `Ekip telsizi merkez anonsu: ${id.plate} plakalı otobüs sürücüsü ${id.driverName} dur ihtarına uymuyor, kaçmaya devam ediyor! Önünü kesin barikat kurun!`,
                    toastText: `🚨🚓 Ekip Telsizi: "${id.plate} PLAKALI ARAÇ SÜRÜCÜSÜ ${id.driverName.toUpperCase()} KAÇIYOR, ÖNÜNÜ KESİN BARİKAT KURUN!!"`,
                    toastType: 'error',
                    onend: () => {
                        if (!chase.active) return;
                        this._policeChaseTimers.push(setTimeout(() => {
                            if (!chase.active) return;
                            this.playClip('police_cabin_scream.mp3', {
                                pan: 0.35,
                                volume: 0.98,
                                priority: 4,
                                force: true,
                                toastText: '😱🗣️ Yolcu Çığlığı: "Ayyy durmuyor hala gaza basıyor polis kovalıyor bizi!! Durdur şu otobüsü!!"',
                                toastType: 'error',
                                onend: () => {
                                    if (!chase.active) return;
                                    if (typeof audio !== 'undefined' && typeof audio.playTireScreech === 'function') {
                                        audio.playTireScreech(0.75);
                                        setTimeout(() => { if (typeof audio.stopTireScreech === 'function') audio.stopTireScreech(); }, 850);
                                    }
                                    this._policeChaseTimers.push(setTimeout(() => {
                                        if (!chase.active) return;
                                        if (this._policeSirenHowl) {
                                            try { this._policeSirenHowl.stop(); } catch (e) {}
                                        }
                                        this.playClip('police_roadblock_bust.mp3', {
                                            pan: -0.65,
                                            volume: 1.0,
                                            priority: 4,
                                            force: true,
                                            interrupt: true,
                                            nvdaText: `Polis barikatı ${id.plate} plakalı otobüsün önünü kesti! Başkomiser: Sürücü ${id.driverName}, kontağı kapat ellerini direksiyondan çek hemen!`,
                                            toastText: `🛑🚓 BARİKAT KISKACI (${id.plate})! Başkomiser: "${id.driverName.toUpperCase()}, KONTAĞI KAPAT ELLERİNİ DİREKSİYONDAN ÇEK!!"`,
                                            toastType: 'error',
                                            onend: () => {
                                                chase.active = false;
                                                this.activePoliceChase = null;
                                            }
                                        });
                                    }, 750));
                                }
                            });
                        }, 240));
                    }
                });
            }, 350));
        },

        updatePolicePursuit: function (gameObj, deltaTime) {
            const chase = this.activePoliceChase;
            if (!chase || !chase.active || chase.isDemo || chase.resolved || !gameObj) return;

            chase.elapsed += deltaTime;
            const siren = this._policeSirenHowl;
            if (siren && chase.sirenSid !== null) {
                try {
                    const approachRatio = Math.min(1.0, chase.elapsed / 10.0);
                    const targetPan = -0.52 - (approachRatio * 0.34);
                    const targetVol = 0.38 + (approachRatio * 0.22);
                    siren.volume(this.getVolume(targetVol), chase.sirenSid);
                    if (typeof siren.stereo === 'function') siren.stereo(targetPan, chase.sirenSid);
                } catch (e) {}
            }

            // A) SÜRÜCÜ İHTARA UYUP SAĞA ÇEKTİ VE DURDU (speed <= 4 km/s)
            if (chase.elapsed >= 1.4 && gameObj.speed <= 4) {
                chase.resolved = true;
                if (this._policeSirenHowl) {
                    try { this._policeSirenHowl.stop(); } catch (e) {}
                }
                const id = this.getPoliceIdentity();
                const fineAmt = chase.escalated ? 550 : 350;
                this.applyFineToPlayer(fineAmt);
                this.adjustCityReputation(-6);

                this._policeChaseTimers.push(setTimeout(() => {
                    this.playClip('police_pullover_stern.mp3', {
                        pan: -0.72,
                        volume: 1.0,
                        isExterior: false,
                        priority: 4,
                        interrupt: true,
                        nvdaText: `Sağa çekip durdunuz. Sert Başkomiser GBT ve plaka sorgusu yaptı: ${id.plate} plakalı otobüs sürücüsü ${id.driverName}, indir camı kontağı kapat! ${id.plate} plakasına ve siciline ${fineAmt} Lira ceza kesildi, dikkatli devam edin.`,
                        toastText: `👮‍♂️ Başkomiser (${id.plate} • ${id.driverName}): "İndir camı kontağı kapat! Plakana ve siciline ${fineAmt} ₺ ceza işlendi!"`,
                        toastType: 'warning',
                        onend: () => {
                            this.stopPolicePursuit();
                        }
                    });
                }, 320));
                return;
            }

            // B) 8.5 SANİYE GEÇTİ VE SÜRÜCÜ DURMAYIP KAÇMAYA DEVAM EDİYOR! (Barikat Anonsu + Çığlık!)
            if (!chase.escalated && chase.elapsed >= 8.5 && gameObj.speed > 12) {
                chase.escalated = true;
                const id = this.getPoliceIdentity();
                if (siren && chase.sirenSid !== null) {
                    try { siren.rate(1.18, chase.sirenSid); } catch (e) {}
                }
                if (typeof audio !== 'undefined' && typeof audio.playRadioSquelch === 'function') {
                    audio.playRadioSquelch(true);
                }
                this.playClip('police_chase_escalate.mp3', {
                    pan: -0.84,
                    volume: 1.0,
                    isExterior: false,
                    priority: 4,
                    interrupt: true,
                    nvdaText: `Polisten kaçıyorsunuz! Telsiz merkez anonsu: ${id.plate} plakalı otobüs sürücüsü ${id.driverName} dur ihtarına uymuyor, kaçmaya devam ediyor! Merkez önünü kesin barikat kurun!`,
                    toastText: `🚨🚓 MERKEZ TELSİZİ: "${id.plate} PLAKALI OTOBÜS SÜRÜCÜSÜ ${id.driverName.toUpperCase()} KAÇIYOR, ÖNÜNÜ KESİN BARİKAT KURUN!!"`,
                    toastType: 'error',
                    onend: () => {
                        if (!chase.active || chase.resolved) return;
                        if ((gameObj.passengersOnBoard || 0) > 0) {
                            this._policeChaseTimers.push(setTimeout(() => {
                                if (!chase.active || chase.resolved) return;
                                this.playClip('police_cabin_scream.mp3', {
                                    pan: 0.35,
                                    volume: 0.98,
                                    priority: 4,
                                    nvdaText: 'Yolcular çığlık atıyor: Ayyy durmuyor hala gaza basıyor polis kovalıyor bizi! Durdur şu otobüsü indir bizi delirdin mi?!',
                                    toastText: '😱🗣️ Kabinde Çığlık: "Ayyy durmuyor hala gaza basıyor polis kovalıyor bizi!! Durdur şu otobüsü!!"',
                                    toastType: 'error'
                                });
                            }, 240));
                        }
                    }
                });
                return;
            }

            // C) 16.5 SANİYE SONUNDA İLERİDE POLİS BARİKATI YOLU KESER VE OTOBÜSÜ DURDURUR!
            if (chase.elapsed >= 16.5 && !chase.resolved) {
                chase.resolved = true;
                const id = this.getPoliceIdentity();
                gameObj.speed = 0;
                gameObj.acceleration = 0;
                if (gameObj.keys) {
                    gameObj.keys.w = false;
                    gameObj.keys.arrowup = false;
                }
                if (typeof audio !== 'undefined' && typeof audio.playTireScreech === 'function') {
                    audio.playTireScreech(0.85);
                    setTimeout(() => { if (typeof audio.stopTireScreech === 'function') audio.stopTireScreech(); }, 900);
                }
                this.applyFineToPlayer(950);
                this.adjustCityReputation(-16);
                this.angerLevel = Math.min(8, (this.angerLevel || 0) + 2);

                this._policeChaseTimers.push(setTimeout(() => {
                    if (this._policeSirenHowl) {
                        try { this._policeSirenHowl.stop(); } catch (e) {}
                    }
                    this.playClip('police_roadblock_bust.mp3', {
                        pan: -0.75,
                        volume: 1.0,
                        isExterior: false,
                        priority: 4,
                        interrupt: true,
                        nvdaText: `İleride polis barikatı ${id.plate} plakalı otobüsün yolunu kesti! Başkomiser: Sürücü ${id.driverName}, kontağı kapat ellerini direksiyondan çek hemen! ${id.plate} plakasına ve adına 950 Lira ağır ceza kesildi!`,
                        toastText: `🛑🚓 BARİKAT YOLU KESTİ (${id.plate})! "SÜRÜCÜ ${id.driverName.toUpperCase()}, KONTAĞI KAPAT!!" (-950 ₺ Ağır Ceza)`,
                        toastType: 'error',
                        onend: () => {
                            this.stopPolicePursuit();
                        }
                    });
                }, 780));
            }
        }
    };

    window.HumanNpcVoices = HumanNpcVoices;
})(window);
