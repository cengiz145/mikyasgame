/* ==========================================================================
   KAPTAN LİYAKAT SİSTEMİ: UNVANLAR, BRÖVELER VE 1500 ŞOFÖR BAŞARISI SİSTEMİ
   Mikyas Simülasyon Dünyası
   1. KAPTAN UNVANLARI (Equipable Driver Titles - 28 Seçkin Unvan)
   2. RESMİ KAPTAN BRÖVELERİ (24 Prestijli Liyakat Nişanı & Madalyası)
   3. 1500 ŞOFÖR BAŞARISI (Tam Veritabanı + Açılmış/Açılmayanlar + Arama + Sayfalama)
   %100 Ekran Okuyucu (NVDA) Uyumlu, Sesli Anonslu, Web Audio Fanfarlı
   ========================================================================== */

const DriverBadges = {
    STORAGE_KEY: 'tekulas_driver_badges_v2',
    STATS_KEY: 'tekulas_driver_stats_v2',
    TITLES_KEY: 'tekulas_driver_equipped_title_v1',
    UNLOCKED_TITLES_KEY: 'tekulas_driver_unlocked_titles_v1',
    
    currentMainTab: 'titles', // 'titles', 'broveler', 'achievements'
    currentAchSubTab: 'unlocked', // 'unlocked' veya 'locked'
    currentTier: 'all',
    searchQuery: '',
    currentPage: 1,
    pageSize: 30,
    currentSuggestedBadge: null,

    // --- 1. RESMİ KAPTAN UNVANLARI (KUŞANILABİLİR - 28 SEÇKİN UNVAN) ---
    CAPTAIN_TITLES: [
        {
            id: 'title_cirak',
            name: 'Çırak Kaptan',
            icon: '🌱',
            category: 'Temel Kademe',
            desc: 'Mikyas Kaptanlık Akademisi’ne ilk adımını atan, intizamlı ve öğrenmeye açık çaylak şoför.',
            requirement: 'Akademiye kaydolarak ilk kontağı çevirin.',
            badgeId: null,
            unlockCondition: () => true
        },
        {
            id: 'title_ipek_ayak',
            name: 'İpek Ayak Virtüözü',
            icon: '🪶',
            category: 'Sürüş Sanatı & Konfor',
            desc: 'Gaz ve fren pedallarına kuyumcu hassasiyetiyle basan, yolcularına su üstünde kayar gibi sarsıntısız bir seyahat sunan konfor ustası.',
            requirement: 'Yolcu memnuniyeti en az %95 olan 5 seferi peş peşe tamamlayın.',
            badgeId: 'brove_ipek_suspansiyon',
            unlockCondition: (stats) => (stats.maxComfortStreak || 0) >= 5
        },
        {
            id: 'title_celik_zirh',
            name: 'Çelik Zırh Kaptanı',
            icon: '🛡️',
            category: 'Disiplin & Hasarsızlık',
            desc: 'Aynaları milimetrik kullanan, en dar sokak ve kavşaklarda bile aracına tek bir çizik dahi aldırmayan emniyet abidesi.',
            requirement: 'Otobüse hiç hasar aldırmadan (%100 kondisyon) peş peşe 10 sefer tamamlayın.',
            badgeId: 'brove_celik_govde',
            unlockCondition: (stats) => (stats.maxCleanStreak || 0) >= 10
        },
        {
            id: 'title_kronometre',
            name: 'Kronometre Şefi',
            icon: '⏱️',
            category: 'Disiplin & Dakiklik',
            desc: 'Yolcuların saatlerini ona göre ayarladığı, ne bir saniye erken ne bir saniye geç kalan, hat çizelgesinin dakiklik efendisi.',
            requirement: 'Tüm duraklara tam vaktinde (%95+ dakiklik) yanaşarak peş peşe 5 sefer bitirin.',
            badgeId: 'brove_gumus_kronometre',
            unlockCondition: (stats) => (stats.maxPunctualStreak || 0) >= 5
        },
        {
            id: 'title_elmas_kaptan',
            name: 'Üçlü Kusursuzluk Elması',
            icon: '💎',
            category: 'Prestij & Mükemmeliyet',
            desc: 'Tek bir seferde hem %100 Memnuniyet, hem %100 Dakiklik, hem de %100 Kondisyon ile kusursuz sefer yapan nadir sürüş dehası.',
            requirement: 'Tek bir seferde üç kriteri birden (%100 Memnuniyet + %100 Dakiklik + %100 Hasarsızlık) tam puanla tamamlayın.',
            badgeId: 'brove_elmas_kusursuzluk',
            unlockCondition: (stats) => (stats.perfectTripsCount || 0) >= 1
        },
        {
            id: 'title_retarder_ustasi',
            name: 'Retarder & Motor Freni Virtüözü',
            icon: '⚙️',
            category: 'Mekanik & Sürüş Becerisi',
            desc: 'Uzun inişlerde ve durak yanaşmalarında balataları yakmadan, hidrolik retarder kolunu ve motor kompresyonunu sanata dönüştüren mekanik üstat.',
            requirement: 'Yüksek hızlarda (30+ km/s) retarder devreye sokarak en az 25 kez emniyetli yavaşlama yapın.',
            badgeId: 'brove_retarder_ustasi',
            unlockCondition: (stats) => (stats.retarderUsesCount || 0) >= 25
        },
        {
            id: 'title_gece_kartali',
            name: 'Gece Kartalı',
            icon: '🦅',
            category: 'Coğrafya & İklim',
            desc: 'Karanlık bastığında, ay ışığı altında ve gece sisinde yolcularını güvenle ulaştıran karayollarının usta gece nöbetçisi.',
            requirement: 'Gece 22:00 - 06:00 saatleri arasında en az 10 gece seferini başarıyla bitirin.',
            badgeId: 'brove_gece_kartali',
            unlockCondition: (stats) => (stats.totalNightTrips || 0) >= 10
        },
        {
            id: 'title_koruk_bukucu',
            name: 'Körük Bükücü',
            icon: '🐍',
            category: 'Araç Filosu & Akrobasi',
            desc: '18.75 metrelik dev körüklü otobüsü iğne deliğinden geçiren, dar kavşaklarda körük açısını milimetrik ayarlayan manevra sihirbazı.',
            requirement: 'Körüklü otobüslerle (Conecto G, Otokar Kent Körüklü) en az 5 seferi hasarsız tamamlayın.',
            badgeId: 'brove_koruklu_akrobasi',
            unlockCondition: (stats) => (stats.articulatedTrips || 0) >= 5
        },
        {
            id: 'title_bolu_fatihi',
            name: 'Bolu Dağı Fatihi',
            icon: '🏔️',
            category: 'Coğrafya & İklim',
            desc: 'Sert dağ geçitlerinde, sisli rampalarda ve buzlu virajlarda otobüsünü kıl payı dahi kaydırmayan karayolu fatihi.',
            requirement: 'Dağ geçitleri, virajlı veya sisli karayollarında en az 8 sefer tamamlayın.',
            badgeId: 'brove_bolu_dagi',
            unlockCondition: (stats) => (stats.mountainTrips || 0) >= 8
        },
        {
            id: 'title_toroslar_kaplani',
            name: 'Toroslar Kaplanı',
            icon: '🌲',
            category: 'Coğrafya & İklim',
            desc: 'Uçurumlu dik yokuşlarda ve keskin saç tokası virajlarda savrulmadan, yolcusunu tek bir an bile tedirgin etmeyen dağ kurdu.',
            requirement: 'Keskin virajlı ve dağlık güzergahlarda en az 12 sefer tamamlayın.',
            badgeId: 'brove_toroslar_viraj',
            unlockCondition: (stats) => ((stats.mountainTrips || 0) + (stats.intercityTrips || 0)) >= 12
        },
        {
            id: 'title_81_il_seyyahi',
            name: '81 İl Baş Seyyahı',
            icon: '🇹🇷',
            category: 'Coğrafya & Seyyahlık',
            desc: 'Edirne’den Kars’a, Sinop’tan Hatay’a Türkiye karayollarını karış karış arşınlayan vatan seyyahı.',
            requirement: 'Türkiye haritasında en az 10 farklı şehrin kilidini açıp sefer düzenleyin.',
            badgeId: 'brove_81_il_maresal',
            unlockCondition: (stats) => (stats.citiesVisitedCount || 0) >= 10
        },
        {
            id: 'title_kiyi_seridi',
            name: 'Kıyı Şeridi Reisi',
            icon: '🌊',
            category: 'Coğrafya & Seyyahlık',
            desc: 'Marmara, Ege ve Akdeniz sahil yollarında deniz meltemi eşliğinde yolcularına VIP konfor sunan kıyı reisi.',
            requirement: 'Sahil ve kıyı hatlarında toplam en az 15 sefer tamamlayın.',
            badgeId: 'brove_kiyi_sahil',
            unlockCondition: (stats) => ((stats.coastalTrips || stats.totalTrips || 0) >= 15)
        },
        {
            id: 'title_sehir_ici_cambazi',
            name: 'Şehir İçi Sokak Cambazı',
            icon: '🚐',
            category: 'Araç Filosu (Küçük Sınıf)',
            desc: 'Küçük sınıf çevik midibüslerle en dar sokaklardan ve park etmiş arabaların arasından tereyağından kıl çeker gibi geçen usta.',
            requirement: 'Küçük sınıf midibüslerle (Otokar Sultan, Isuzu Novo, Iveco vb.) en az 10 sefer bitirin.',
            badgeId: 'brove_kucuk_cevik',
            unlockCondition: (stats) => (stats.midibusTrips || 0) >= 10
        },
        {
            id: 'title_metropol_ustasi',
            name: 'Metropol Solo Hat Efendisi',
            icon: '🚏',
            category: 'Araç Filosu (Orta Sınıf)',
            desc: '12 metrelik solo otobüslerle en kalabalık bulvarlarda ve yoğun duraklarda kusursuz sefer yöneten metropol kaptanı.',
            requirement: '12 metrelik solo otobüslerle (Conecto 12M, Kent LF vb.) en az 15 sefer tamamlayın.',
            badgeId: 'brove_orta_solo',
            unlockCondition: (stats) => (stats.soloTrips || 0) >= 15
        },
        {
            id: 'title_vip_kaptan',
            name: 'VIP Peron Başkaptanı',
            icon: '🌟',
            category: 'Araç Filosu (Büyük Sınıf VIP)',
            desc: 'Şehirlerarası otogarların peronlarından alkışlarla uğurlanan, Travego ve Setra ile uzun yolun tadını çıkaran elit kaptan.',
            requirement: 'Büyük sınıf peron otobüsleriyle (Travego, Setra, Tourismo, Scania i8) en az 10 uzun yol seferi bitirin.',
            badgeId: 'brove_vip_peron',
            unlockCondition: (stats) => (stats.vipIntercityTrips || 0) >= 10
        },
        {
            id: 'title_yildizli_lider',
            name: 'Yıldızlı Filo Lideri',
            icon: '⭐',
            category: 'Filo Marka Hakimiyeti',
            desc: 'Kaputundaki üç kollu yıldızın ağırlığını ve asaletini her kilometrede hissettiren Mercedes-Benz tutkunu.',
            requirement: 'Mercedes-Benz modelleriyle (O 403, Conecto, Tourismo, Travego) toplam en az 20 sefer tamamlayın.',
            badgeId: 'brove_mercedes_yildiz',
            unlockCondition: (stats) => (stats.mercedesTrips || 0) >= 20
        },
        {
            id: 'title_aslan_terbiyecisi',
            name: 'Aslan Terbiyecisi',
            icon: '🦁',
            category: 'Filo Marka Hakimiyeti',
            desc: 'MAN Lion’s Coach ve Neoplan Cityliner’ın güçlü motor kükremesini dizginleyen, Alman mühendisliğinin efendisi.',
            requirement: 'MAN veya Neoplan modelleriyle toplam en az 10 sefer tamamlayın.',
            badgeId: 'brove_man_neoplan',
            unlockCondition: (stats) => (stats.manNeoplanTrips || 0) >= 10
        },
        {
            id: 'title_setra_beyefendisi',
            name: 'Setra Karayolu Beyefendisi',
            icon: '🎩',
            category: 'Prestij & VIP Sürüş',
            desc: 'Setra TopClass S 516 direksiyonunda takım elbisesiyle oturan, her yolcusuna beş yıldızlı otel konforu sunan beyefendi.',
            requirement: 'En az 5 sefer boyunca yolcu memnuniyetini %95 üzerinde tutarak VIP hizmet sunun.',
            badgeId: null,
            unlockCondition: (stats) => (stats.totalComfortTrips || 0) >= 5
        },
        {
            id: 'title_filo_koleksiyoneri',
            name: 'Filo Koleksiyoneri',
            icon: '🚌',
            category: 'İktisat & Filo Genişletme',
            desc: 'Garajını Türkiye’nin en gözde otobüsleriyle donatan, her sınıf araca hükmeden vizyoner filo yöneticisi.',
            requirement: 'Ehliyet seviyenizi yükselterek garajda en az 8 farklı otobüsün kilidini açın.',
            badgeId: 'brove_filo_koleksiyoneri',
            unlockCondition: (stats) => (stats.licenseLevel || 1) >= 8
        },
        {
            id: 'title_milyoner_patron',
            name: 'Milyoner Filo Patronu',
            icon: '💼',
            category: 'İktisat & Zenginlik',
            desc: 'Kusursuz seferler ve disiplinli bütçe yönetimiyle kasasını dolduran, karayolu taşımacılığının mali dehası.',
            requirement: 'Sefer kazançları ve bilet gelirleriyle toplamda en az 50.000 ₺ temiz bütçeye ulaşın.',
            badgeId: 'brove_milyoner_patron',
            unlockCondition: (stats) => (stats.budgetEarned || 0) >= 50000
        },
        {
            id: 'title_halkin_hizmetkari',
            name: 'Halkın Hizmetkarı',
            icon: '👥',
            category: 'Yolcu Hizmeti',
            desc: 'İşine, okuluna, evine giden yüzlerce vatandaşı güleryüzle ve güvenle gideceği yere ulaştıran halkın sevgilisi.',
            requirement: 'Seferlerde toplam en az 250 yolcuyu güvenle gideceği durağa ulaştırın.',
            badgeId: 'brove_bin_yolcu',
            unlockCondition: (stats) => (stats.totalPassengers || 0) >= 250
        },
        {
            id: 'title_salon_mufettisi',
            name: 'Salon Başmüfettişi',
            icon: '🧼',
            category: 'Yolcu Hizmeti & İntizam',
            desc: 'Otobüsünün içi mis gibi kokan, koltukları tertemiz, koridorunda tek bir çöp barındırmayan intizam ustası.',
            requirement: 'En az 15 sefer boyunca otobüs salonunu ve koltukları kusursuz temiz tutun.',
            badgeId: 'brove_salon_hijyen',
            unlockCondition: (stats) => (stats.totalCleanTrips || 0) >= 15
        },
        {
            id: 'title_sefkat_rehberi',
            name: 'Şefkat Rehberi',
            icon: '♿',
            category: 'Yolcu Hizmeti & Saygı',
            desc: 'Engelli ve yaşlı yolculara karşı nezaketini asla kaybetmeyen, engelli rampasını gururla ve özenle açan örnek kaptan.',
            requirement: 'Engelli yolcular için en az 5 kez engelli rampası açarak hizmet verin.',
            badgeId: 'brove_engelsiz_ulasim',
            unlockCondition: (stats) => (stats.totalRampsUsed || 0) >= 5
        },
        {
            id: 'title_emanet_muhafizi',
            name: 'Emanet Muhafızı',
            icon: '🎒',
            category: 'Yolcu Hizmeti & Dürüstlük',
            desc: 'Koltuk aralarında unutulan telefon, cüzdan ve çantaları eksiksiz sahibine ulaştıran, dürüstlüğün simgesi.',
            requirement: 'Koltuk aralarında unutulan en az 10 kayıp eşyayı bularak teslim edin.',
            badgeId: 'brove_emanet_muhafizi',
            unlockCondition: (stats) => (stats.totalLostItemsFound || 0) >= 10
        },
        {
            id: 'title_yagmur_danscisi',
            name: 'Yağmur & Sis Dansçısı',
            icon: '🌧️',
            category: 'Coğrafya & İklim',
            desc: 'Göz gözü görmeyen fırtınalarda, kaygan asfaltta ve şiddetli yağmur altında aracını emniyetle süren iklim ustası.',
            requirement: 'Yağmurlu ve karlı havalarda silecekleri çalıştırarak en az 5 zorlu sefer tamamlayın.',
            badgeId: 'brove_firtina_yagmur',
            unlockCondition: (stats) => (stats.rainSnowTrips || 0) >= 5
        },
        {
            id: 'title_asfalt_canavari',
            name: 'Asfalt Canavarı',
            icon: '⚡',
            category: 'Kıdem & Kilometre',
            desc: 'Binlerce kilometre asfaltı yutan, tekerlek sesiyle uyuyup motor sesiyle uyanan karayollarının tecrübeli kurdu.',
            requirement: 'Seferlerde otobüsünüzle toplam en az 1.000 kilometre karayolu kat edin.',
            badgeId: null,
            unlockCondition: (stats) => (stats.totalKm || 0) >= 1000
        },
        {
            id: 'title_altin_direksiyon_sovalyesi',
            name: 'Mikyas Altın Direksiyon Onur Şövalyesi',
            icon: '👑',
            category: 'Zirve Liyakat',
            desc: 'Mikyas Kaptanlık Akademisi’nin tüm operasyonel sınavlarını geçmiş, liyakat ve disiplinde zirveye ulaşmış şeref kaptanı.',
            requirement: 'İlerleme modunda en az 15 operasyonel görevi tamamlayın veya ehliyet seviyenizi 10’a çıkarın.',
            badgeId: 'brove_altin_direksiyon',
            unlockCondition: (stats) => (stats.totalTrips || 0) >= 15 || (stats.licenseLevel || 1) >= 10
        },
        {
            id: 'title_efsanevi_maresal',
            name: 'Efsanevi Karayolu Baş Mareşali',
            icon: '🌌',
            category: 'Grandmaster Efsane',
            desc: 'Tüm sürüş disiplinlerini, araç sınıflarını ve Türkiye coğrafyasını fethederek simülasyon tarihine adını altın harflerle yazdıran yaşayan efsane.',
            requirement: 'En az 10 farklı Resmi Kaptan Brövesi kazanarak büyük ustalığınızı kanıtlayın.',
            badgeId: null,
            unlockCondition: (stats, badgesData) => {
                if (!badgesData) return false;
                const badgesList = (typeof DriverBadges !== 'undefined' && Array.isArray(DriverBadges.CAPTAIN_BADGES)) ? DriverBadges.CAPTAIN_BADGES : [];
                const count = badgesList.length > 0 
                    ? badgesList.filter(b => badgesData[b.id] && badgesData[b.id].unlocked).length
                    : Object.keys(badgesData).filter(k => k.startsWith('brove_') && badgesData[k].unlocked).length;
                return count >= 10;
            }
        }
    ],

    // --- 2. RESMİ KAPTAN BRÖVELERİ (24 PRESTİJLİ MADALYA & NİŞAN) ---
    CAPTAIN_BADGES: [
        {
            id: 'brove_ipek_suspansiyon',
            title: 'İpek Süspansiyon Liyakat Brövesi',
            icon: '🪶',
            category: 'surus',
            categoryName: 'Sürüş Sanatı & Konfor',
            tier: 3,
            tierName: 'Altın Bröve',
            desc: 'Yolcuları sarsmadan, virajlarda savurmadan ve kasislerden yumuşakça geçerek yüksek konfor disiplini sergileyen kaptanlara tevdi edilir.',
            requirement: 'Üst üste 5 sefer boyunca yolcu memnuniyetini %95 ve üzerinde tutun.',
            grantedTitleId: 'title_ipek_ayak',
            getProgress: (stats) => {
                const cur = stats.maxComfortStreak || 0;
                return { current: cur, target: 5, isCompleted: cur >= 5, percent: Math.min(100, Math.round((cur / 5) * 100)) };
            }
        },
        {
            id: 'brove_celik_govde',
            title: 'Çelik Gövde & Sıfır Hasar Nişanı',
            icon: '🛡️',
            category: 'surus',
            categoryName: 'Sürüş Sanatı & Disiplin',
            tier: 4,
            tierName: 'Platin Nişan',
            desc: 'Otobüs gövdesine, aynalarına ve tamponuna en ufak çizik dahi aldırmadan aralıksız sefer tamamlayan üstün dikkat timsali kaptanlara verilir.',
            requirement: 'Otobüse hiç hasar aldırmadan (%100 kondisyon) peş peşe 10 sefer bitirin.',
            grantedTitleId: 'title_celik_zirh',
            getProgress: (stats) => {
                const cur = stats.maxCleanStreak || 0;
                return { current: cur, target: 10, isCompleted: cur >= 10, percent: Math.min(100, Math.round((cur / 10) * 100)) };
            }
        },
        {
            id: 'brove_gumus_kronometre',
            title: 'Gümüş Kronometre ve Dakiklik Brövesi',
            icon: '⏱️',
            category: 'surus',
            categoryName: 'Sürüş Sanatı & Disiplin',
            tier: 2,
            tierName: 'Gümüş Bröve',
            desc: 'Zamanlama çizelgesine harfiyen uyarak duraklara ne erken ne geç, tam vaktinde yanaşan dakik kaptanlara verilir.',
            requirement: 'Tüm duraklara tam vaktinde (%95+ dakiklik) yanaşarak peş peşe 5 sefer bitirin.',
            grantedTitleId: 'title_kronometre',
            getProgress: (stats) => {
                const cur = stats.maxPunctualStreak || 0;
                return { current: cur, target: 5, isCompleted: cur >= 5, percent: Math.min(100, Math.round((cur / 5) * 100)) };
            }
        },
        {
            id: 'brove_elmas_kusursuzluk',
            title: 'Üçlü Kusursuzluk Elmas Madalyası',
            icon: '💎',
            category: 'surus',
            categoryName: 'Sürüş Sanatı & Prestij',
            tier: 5,
            tierName: 'Elmas Madalya',
            desc: 'Tek bir seferde hem %100 Memnuniyet, hem %100 Dakiklik, hem de %100 Sıfır Hasar ile mükemmel sürüş gerçekleştiren seçkinlere verilir.',
            requirement: 'Tek bir seferde üç kriteri birden (%100 Memnuniyet + %100 Dakiklik + %100 Hasarsızlık) tam puanla tamamlayın.',
            grantedTitleId: 'title_elmas_kaptan',
            getProgress: (stats) => {
                const cur = stats.perfectTripsCount || 0;
                return { current: cur, target: 1, isCompleted: cur >= 1, percent: cur >= 1 ? 100 : 0 };
            }
        },
        {
            id: 'brove_retarder_ustasi',
            title: 'Retarder & Aktif Motor Freni Brövesi',
            icon: '⚙️',
            category: 'surus',
            categoryName: 'Mekanik & Sürüş Sanatı',
            tier: 3,
            tierName: 'Altın Bröve',
            desc: 'Yüksek hızlarda iniş yaparken hidrolik retarderi ve egzoz frenini kullanarak balataları yakmayan teknik şoförlere verilir.',
            requirement: '30+ km/s hızlarda retarder devreye sokarak en az 25 kez emniyetli yavaşlama yapın.',
            grantedTitleId: 'title_retarder_ustasi',
            getProgress: (stats) => {
                const cur = stats.retarderUsesCount || 0;
                return { current: cur, target: 25, isCompleted: cur >= 25, percent: Math.min(100, Math.round((cur / 25) * 100)) };
            }
        },
        {
            id: 'brove_salon_hijyen',
            title: 'Pırıl Pırıl Salon Hijyen Brövesi',
            icon: '🧼',
            category: 'hizmet',
            categoryName: 'Yolcu Hizmeti & İntizam',
            tier: 2,
            tierName: 'Gümüş Bröve',
            desc: 'Yolcularına pırıl pırıl, ferah ve tertemiz bir kabin sunan, otobüs bakımını aksatmayan kaptanlara verilir.',
            requirement: '15 sefer boyunca otobüs salonunu ve koltukları kusursuz temiz muhafaza edin.',
            grantedTitleId: 'title_salon_mufettisi',
            getProgress: (stats) => {
                const cur = stats.totalCleanTrips || 0;
                return { current: cur, target: 15, isCompleted: cur >= 15, percent: Math.min(100, Math.round((cur / 15) * 100)) };
            }
        },
        {
            id: 'brove_gece_kartali',
            title: 'Gece Kartalı ve Ayışığı Brövesi',
            icon: '🦅',
            category: 'cografya',
            categoryName: 'Coğrafya & İklim',
            tier: 3,
            tierName: 'Altın Bröve',
            desc: 'Gece karanlığında, ay ışığında ve sabaha karşı saatlerde yolcularını emniyetle hedefine ulaştıran gece nöbetçilerine verilir.',
            requirement: 'Gece 22:00 - 06:00 saatleri arasında en az 10 gece seferini başarıyla bitirin.',
            grantedTitleId: 'title_gece_kartali',
            getProgress: (stats) => {
                const cur = stats.totalNightTrips || 0;
                return { current: cur, target: 10, isCompleted: cur >= 10, percent: Math.min(100, Math.round((cur / 10) * 100)) };
            }
        },
        {
            id: 'brove_firtina_yagmur',
            title: 'Fırtına ve Islak Asfalt Brövesi',
            icon: '🌧️',
            category: 'cografya',
            categoryName: 'Coğrafya & İklim',
            tier: 3,
            tierName: 'Altın Bröve',
            desc: 'Şiddetli yağmur, kaygan zemin ve sisli havalarda sileceklerini çalıştırarak hızını kontrol altında tutan kaptanlara verilir.',
            requirement: 'Yağmurlu/karlı iklimde silecekleri çalıştırarak toplam 5 zorlu seferi tamamlayın.',
            grantedTitleId: 'title_yagmur_danscisi',
            getProgress: (stats) => {
                const cur = stats.rainSnowTrips || 0;
                return { current: cur, target: 5, isCompleted: cur >= 5, percent: Math.min(100, Math.round((cur / 5) * 100)) };
            }
        },
        {
            id: 'brove_bolu_dagi',
            title: 'Bolu Dağı ve Sert Geçitler Brövesi',
            icon: '🏔️',
            category: 'cografya',
            categoryName: 'Coğrafya & İklim',
            tier: 4,
            tierName: 'Platin Bröve',
            desc: 'Bolu Dağı, Cankurtaran veya Zigana gibi sarp geçitlerde otobüsünü güvenle sevk eden dağ kurdu kaptanlara verilir.',
            requirement: 'Dağ geçitleri, virajlı veya sisli karayollarında toplam en az 8 sefer tamamlayın.',
            grantedTitleId: 'title_bolu_fatihi',
            getProgress: (stats) => {
                const cur = stats.mountainTrips || 0;
                return { current: cur, target: 8, isCompleted: cur >= 8, percent: Math.min(100, Math.round((cur / 8) * 100)) };
            }
        },
        {
            id: 'brove_toroslar_viraj',
            title: 'Toroslar Uçurum & Keskin Viraj Brövesi',
            icon: '🌲',
            category: 'cografya',
            categoryName: 'Coğrafya & İklim',
            tier: 4,
            tierName: 'Platin Bröve',
            desc: 'Akdeniz ve İç Anadolu arasındaki sarp uçurumlu virajlarda savrulmadan yolcu taşıyan cesur kaptanlara verilir.',
            requirement: 'Keskin virajlı dağ ve şehirlerarası güzergahlarda en az 12 sefer tamamlayın.',
            grantedTitleId: 'title_toroslar_kaplani',
            getProgress: (stats) => {
                const cur = (stats.mountainTrips || 0) + (stats.intercityTrips || 0);
                return { current: cur, target: 12, isCompleted: cur >= 12, percent: Math.min(100, Math.round((cur / 12) * 100)) };
            }
        },
        {
            id: 'brove_81_il_maresal',
            title: '81 İl Milli Karayolu Mareşal Brövesi',
            icon: '🇹🇷',
            category: 'cografya',
            categoryName: 'Coğrafya & Seyyahlık',
            tier: 5,
            tierName: 'Mareşal Brövesi',
            desc: 'Türkiye haritasında çok sayıda ilin kilidini açıp şehirlerarası hatta yolcu taşıyan büyük seyyahlara verilir.',
            requirement: 'Türkiye haritasında en az 10 farklı ilin kilidini açıp sefer düzenleyin.',
            grantedTitleId: 'title_81_il_seyyahi',
            getProgress: (stats) => {
                const cur = stats.citiesVisitedCount || 1;
                return { current: cur, target: 10, isCompleted: cur >= 10, percent: Math.min(100, Math.round((cur / 10) * 100)) };
            }
        },
        {
            id: 'brove_kiyi_sahil',
            title: 'Ege ve Akdeniz Kıyı Şeridi Brövesi',
            icon: '🌊',
            category: 'cografya',
            categoryName: 'Coğrafya & Seyyahlık',
            tier: 2,
            tierName: 'Gümüş Bröve',
            desc: 'Marmara, Ege ve Akdeniz sahil boyu hatlarında toplam en az 15 sefer tamamlayan kaptanlara verilir.',
            requirement: 'Sahil ve kıyı hatlarında toplam en az 15 sefer tamamlayın.',
            grantedTitleId: 'title_kiyi_seridi',
            getProgress: (stats) => {
                const cur = stats.totalTrips || 0;
                return { current: cur, target: 15, isCompleted: cur >= 15, percent: Math.min(100, Math.round((cur / 15) * 100)) };
            }
        },
        {
            id: 'brove_kucuk_cevik',
            title: 'Şehir İçi Dar Sokak Çeviklik Brövesi',
            icon: '🚐',
            category: 'filo',
            categoryName: 'Filo Hakimiyeti (1. Seviye Araçlar)',
            tier: 2,
            tierName: 'Gümüş Bröve',
            desc: 'Küçük sınıf midibüslerle (Otokar Sultan, Isuzu Novo, Iveco Daily vb.) dar sokaklarda kıvraklık sergileyenlere verilir.',
            requirement: 'Küçük sınıf midibüslerle en az 10 sefer bitirin.',
            grantedTitleId: 'title_sehir_ici_cambazi',
            getProgress: (stats) => {
                const cur = stats.midibusTrips || 0;
                return { current: cur, target: 10, isCompleted: cur >= 10, percent: Math.min(100, Math.round((cur / 10) * 100)) };
            }
        },
        {
            id: 'brove_orta_solo',
            title: 'Metropol Solo Otobüs Usta Brövesi',
            icon: '🚏',
            category: 'filo',
            categoryName: 'Filo Hakimiyeti (2. Seviye Araçlar)',
            tier: 3,
            tierName: 'Altın Bröve',
            desc: '12 metrelik solo otobüslerle (Conecto 12M, Kent LF, Procity vb.) yoğun şehir içi hatlarını idare edenlere verilir.',
            requirement: '12 metrelik solo otobüslerle en az 15 sefer bitirin.',
            grantedTitleId: 'title_metropol_ustasi',
            getProgress: (stats) => {
                const cur = stats.soloTrips || 0;
                return { current: cur, target: 15, isCompleted: cur >= 15, percent: Math.min(100, Math.round((cur / 15) * 100)) };
            }
        },
        {
            id: 'brove_koruklu_akrobasi',
            title: 'Körük Akrobasisi ve Manevra Brövesi',
            icon: '🐍',
            category: 'filo',
            categoryName: 'Filo Hakimiyeti (3. Seviye Körüklü)',
            tier: 4,
            tierName: 'Platin Bröve',
            desc: '18.75 metrelik körüklü otobüslerle körük açısını koruyarak ve savurmadan sefer tamamlayanlara verilir.',
            requirement: '18.75 metrelik körüklü otobüslerle en az 5 seferi hasarsız bitirin.',
            grantedTitleId: 'title_koruk_bukucu',
            getProgress: (stats) => {
                const cur = stats.articulatedTrips || 0;
                return { current: cur, target: 5, isCompleted: cur >= 5, percent: Math.min(100, Math.round((cur / 5) * 100)) };
            }
        },
        {
            id: 'brove_vip_peron',
            title: 'VIP Şehirlerarası Peron Seyahat Brövesi',
            icon: '🌟',
            category: 'filo',
            categoryName: 'Filo Hakimiyeti (3. Seviye VIP)',
            tier: 4,
            tierName: 'Platin Bröve',
            desc: '3. Seviye amiral gemisi peron otobüsleriyle (Travego, Setra, Tourismo, Scania i8) uzun yol seferi bitiren seçkin kaptanlara verilir.',
            requirement: '3. Seviye VIP peron otobüsleriyle en az 10 uzun yol seferi bitirin.',
            grantedTitleId: 'title_vip_kaptan',
            getProgress: (stats) => {
                const cur = stats.vipIntercityTrips || 0;
                return { current: cur, target: 10, isCompleted: cur >= 10, percent: Math.min(100, Math.round((cur / 10) * 100)) };
            }
        },
        {
            id: 'brove_mercedes_yildiz',
            title: 'Yıldızlı Filo Sadakat Brövesi',
            icon: '⭐',
            category: 'filo',
            categoryName: 'Filo Marka Hakimiyeti',
            tier: 3,
            tierName: 'Altın Bröve',
            desc: 'Mercedes-Benz modelleriyle (O 403, Conecto, Tourismo, Travego) yolların hakimi olan marka sevdalılarına verilir.',
            requirement: 'Mercedes-Benz modelleriyle toplam en az 20 sefer tamamlayın.',
            grantedTitleId: 'title_yildizli_lider',
            getProgress: (stats) => {
                const cur = stats.mercedesTrips || 0;
                return { current: cur, target: 20, isCompleted: cur >= 20, percent: Math.min(100, Math.round((cur / 20) * 100)) };
            }
        },
        {
            id: 'brove_man_neoplan',
            title: 'Alman Aslanı ve Neoplan Hakimiyet Brövesi',
            icon: '🦁',
            category: 'filo',
            categoryName: 'Filo Marka Hakimiyeti',
            tier: 3,
            tierName: 'Altın Bröve',
            desc: 'MAN Lion’s Coach veya Neoplan Cityliner ile uzun yollarda fırtına gibi esen Alman mühendisliği ustalarına verilir.',
            requirement: 'MAN veya Neoplan modelleriyle toplam en az 10 sefer tamamlayın.',
            grantedTitleId: 'title_aslan_terbiyecisi',
            getProgress: (stats) => {
                const cur = stats.manNeoplanTrips || 0;
                return { current: cur, target: 10, isCompleted: cur >= 10, percent: Math.min(100, Math.round((cur / 10) * 100)) };
            }
        },
        {
            id: 'brove_filo_koleksiyoneri',
            title: 'Garaj Koleksiyoneri ve Filo Sahibi Brövesi',
            icon: '🚌',
            category: 'filo',
            categoryName: 'Filo & İktisat',
            tier: 4,
            tierName: 'Platin Bröve',
            desc: 'Ehliyet seviyesini yükselterek garajdaki araç filosunu zenginleştiren vizyoner filo yöneticilerine verilir.',
            requirement: 'Ehliyet seviyenizi yükselterek garajda en az 8 farklı otobüsün kilidini açın.',
            grantedTitleId: 'title_filo_koleksiyoneri',
            getProgress: (stats) => {
                const cur = stats.licenseLevel || 1;
                return { current: cur, target: 8, isCompleted: cur >= 8, percent: Math.min(100, Math.round((cur / 8) * 100)) };
            }
        },
        {
            id: 'brove_milyoner_patron',
            title: 'Milyoner Filo İmparatoru Brövesi',
            icon: '💼',
            category: 'filo',
            categoryName: 'Filo & İktisat',
            tier: 5,
            tierName: 'Elmas Bröve',
            desc: 'Sefer kazançları ve bilet gelirleriyle şirket kasasını zenginleştiren finansal deha kaptanlara verilir.',
            requirement: 'Toplamda en az 50.000 ₺ temiz bütçe biriktirin.',
            grantedTitleId: 'title_milyoner_patron',
            getProgress: (stats) => {
                const cur = stats.budgetEarned || 0;
                return { current: cur, target: 50000, isCompleted: cur >= 50000, percent: Math.min(100, Math.round((cur / 50000) * 100)) };
            }
        },
        {
            id: 'brove_emanet_muhafizi',
            title: 'Emanet Ehline Hürmet Brövesi',
            icon: '🎒',
            category: 'hizmet',
            categoryName: 'Yolcu Hizmeti & Dürüstlük',
            tier: 3,
            tierName: 'Altın Bröve',
            desc: 'Koltuk aralarında unutulan değerli eşyaları nizamına uygun teslim ederek yolcu güvenini kazananlara verilir.',
            requirement: 'Koltuk aralarında unutulan en az 10 kayıp eşyayı bularak teslim edin.',
            grantedTitleId: 'title_emanet_muhafizi',
            getProgress: (stats) => {
                const cur = stats.totalLostItemsFound || 0;
                return { current: cur, target: 10, isCompleted: cur >= 10, percent: Math.min(100, Math.round((cur / 10) * 100)) };
            }
        },
        {
            id: 'brove_engelsiz_ulasim',
            title: 'Engelsiz Ulaşım ve Şefkat Brövesi',
            icon: '♿',
            category: 'hizmet',
            categoryName: 'Yolcu Hizmeti & Saygı',
            tier: 2,
            tierName: 'Gümüş Bröve',
            desc: 'Engelli yolcular için engelli rampasını özenle açıp kapatan ve kamu hizmetini eksiksiz yerine getirenlere verilir.',
            requirement: 'Engelli yolcular için en az 5 kez engelli rampası açarak hizmet verin.',
            grantedTitleId: 'title_sefkat_rehberi',
            getProgress: (stats) => {
                const cur = stats.totalRampsUsed || 0;
                return { current: cur, target: 5, isCompleted: cur >= 5, percent: Math.min(100, Math.round((cur / 5) * 100)) };
            }
        },
        {
            id: 'brove_bin_yolcu',
            title: 'Halkın Hizmetkarı ve Şeref Madalyası',
            icon: '👥',
            category: 'hizmet',
            categoryName: 'Yolcu Hizmeti & Toplum',
            tier: 3,
            tierName: 'Altın Madalya',
            desc: 'Yüzlerce vatandaşı sevdiklerine, evlerine ve işlerine sağ salim kavuşturan emektar kaptanlara verilir.',
            requirement: 'Seferlerde toplam en az 250 yolcuyu güvenle gideceği durağa ulaştırın.',
            grantedTitleId: 'title_halkin_hizmetkari',
            getProgress: (stats) => {
                const cur = stats.totalPassengers || 0;
                return { current: cur, target: 250, isCompleted: cur >= 250, percent: Math.min(100, Math.round((cur / 250) * 100)) };
            }
        },
        {
            id: 'brove_altin_direksiyon',
            title: 'Mikyas Akademisi Altın Direksiyon Onur Brövesi',
            icon: '👑',
            category: 'hizmet',
            categoryName: 'Kariyer & Zirve Liyakat',
            tier: 5,
            tierName: 'Büyük Liyakat Nişanı',
            desc: 'Akademinin zorlu operasyonel intikal görevlerini tamamlayıp en üst şampiyonluk derecesine ulaşan seçkin ustalara verilir.',
            requirement: 'İlerleme modunda en az 15 operasyonel görevi tamamlayın veya ehliyet seviyenizi 10’a yükseltin.',
            grantedTitleId: 'title_altin_direksiyon_sovalyesi',
            getProgress: (stats) => {
                const cur = Math.max(stats.totalTrips || 0, stats.licenseLevel || 1);
                return { current: cur, target: 15, isCompleted: cur >= 15, percent: Math.min(100, Math.round((cur / 15) * 100)) };
            }
        }
    ],

    // --- 3. 1500 BAŞARI VERİTABANI BAĞLANTISI ---
    get badges() {
        if (typeof window !== 'undefined' && window.ACHIEVEMENTS_1500) {
            return window.ACHIEVEMENTS_1500;
        }
        if (typeof ACHIEVEMENTS_1500 !== 'undefined') {
            return ACHIEVEMENTS_1500;
        }
        return [];
    },

    // --- VERİ VE İSTATİSTİK YÖNETİMİ ---
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
        if (typeof Game !== 'undefined' && typeof Game.saveData === 'function') {
            Game.saveData();
        }
    },

    getLifetimeStats: function() {
        let stats = {
            routesStartedCount: 0,
            intercityStartsCount: 0,
            nightStartsCount: 0,
            rainSnowStartsCount: 0,
            cleanStartsCount: 0,
            fullFuelStartsCount: 0,
            airPressureFullStarts: 0,
            morningStartsCount: 0,
            midibusStartsCount: 0,
            soloStartsCount: 0,
            articulatedStartsCount: 0,
            coachStartsCount: 0,
            totalTrips: 0,
            totalPassengers: 0,
            totalXP: 0,
            totalComfortTrips: 0,
            totalPunctualTrips: 0,
            totalCleanTrips: 0,
            maxCleanStreak: 0,
            currentCleanStreak: 0,
            currentComfortStreak: 0,
            maxComfortStreak: 0,
            currentPunctualStreak: 0,
            maxPunctualStreak: 0,
            perfectTripsCount: 0,
            retarderUsesCount: 0,
            rainSnowTrips: 0,
            mountainTrips: 0,
            coastalTrips: 0,
            citiesVisitedCount: 1,
            midibusTrips: 0,
            soloTrips: 0,
            articulatedTrips: 0,
            vipIntercityTrips: 0,
            mercedesTrips: 0,
            manNeoplanTrips: 0,
            intercityTrips: 0,
            totalNightTrips: 0,
            totalRampsUsed: 0,
            stopsDiscovered: 0,
            budgetEarned: 0,
            totalDrivingMinutes: 0,
            totalKm: 0,
            totalLostItemsFound: 0,
            licenseLevel: 1,
            completedTasks: 0
        };

        let hasSaved = false;
        try {
            const saved = localStorage.getItem(this.STATS_KEY);
            if (saved) {
                stats = Object.assign(stats, JSON.parse(saved));
                hasSaved = true;
            }
        } catch(e) {}

        if (typeof Game !== 'undefined') {
            if (typeof Game.completedTasks === 'number') stats.completedTasks = Math.max(stats.completedTasks || 0, Game.completedTasks);
            if (!hasSaved && Game.completedTasks) stats.totalTrips = Math.max(stats.totalTrips, Game.completedTasks);
            if (Game.playerXP) stats.totalXP = Math.max(stats.totalXP, Game.playerXP);
            if (Game.licenseLevel) stats.licenseLevel = Math.max(stats.licenseLevel, Game.licenseLevel);
            if (Game.playerBudget) stats.budgetEarned = Math.max(stats.budgetEarned, Game.playerBudget);
            if (Game.unlockedCities && Array.isArray(Game.unlockedCities)) {
                stats.citiesVisitedCount = Math.max(stats.citiesVisitedCount, Game.unlockedCities.length);
            }
        }
        if (typeof StopDiscovery !== 'undefined' && StopDiscovery.getDiscoveredStops) {
            stats.stopsDiscovered = Math.max(stats.stopsDiscovered, StopDiscovery.getDiscoveredStops().length);
        }

        // Şirket Yönetimi İstatistikleri Entegrasyonu
        const compSys = (typeof CompanySystem !== 'undefined') ? CompanySystem : ((typeof window !== 'undefined' && window.CompanySystem) ? window.CompanySystem : null);
        if (compSys && compSys.data) {
            const cData = compSys.data;
            stats.companyLevel = Math.max(stats.companyLevel || 1, cData.companyLevel || 1);
            stats.companyTreasury = Math.max(stats.companyTreasury || 0, Math.max(0, cData.companyTreasury || 0));
            stats.companyTotalRevenue = Math.max(stats.companyTotalRevenue || 0, cData.totalRevenue || 0);
            stats.companyTripsCount = Math.max(stats.companyTripsCount || 0, cData.completedTripsCount || 0);
            stats.hiredDriversCount = Math.max(stats.hiredDriversCount || 0, Array.isArray(cData.hiredDrivers) ? cData.hiredDrivers.length : 0);

            let totalInst = 0;
            if (cData.institutions) {
                Object.values(cData.institutions).forEach(lvl => { totalInst += (lvl || 1); });
            }
            stats.companyTotalInstitutionLevels = Math.max(stats.companyTotalInstitutionLevels || 7, totalInst);

            let branchCount = 0;
            if (cData.terminalBranches) {
                Object.values(cData.terminalBranches).forEach(isOpen => { if (isOpen) branchCount++; });
            }
            stats.companyTerminalBranchesCount = Math.max(stats.companyTerminalBranchesCount || 1, branchCount);

            let hqCount = 0;
            if (cData.hqUpgrades) {
                Object.values(cData.hqUpgrades).forEach(hasUp => { if (hasUp) hqCount++; });
            }
            stats.companyHqUpgradesCount = Math.max(stats.companyHqUpgradesCount || 0, hqCount);

            stats.companyCateringVip = (cData.cateringPackage === 'vip' || cData.cateringPackage === 'standart') ? 1 : 0;
            stats.companyFacilityVip = (cData.facilityContract === 'vip' || cData.facilityContract === 'standart') ? 1 : 0;
            stats.companyContractsDone = (cData.specialContractsCompletedCount || (cData.specialContracts && cData.specialContracts.length) || 0);
            stats.companySatisfactionHighScore = (cData.satisfactionRating >= 4.8) ? 1 : 0;
            stats.companyMastery = (cData.companyLevel >= 5 && (cData.companyTreasury || 0) >= 50000000) ? 1 : 0;
        }

        return stats;
    },

    saveLifetimeStats: function(stats) {
        try {
            localStorage.setItem(this.STATS_KEY, JSON.stringify(stats));
        } catch(e) {}
        if (typeof Game !== 'undefined' && typeof Game.saveData === 'function') {
            Game.saveData();
        }
    },

    // --- KUŞANILAN AKTİF UNVAN YÖNETİMİ ---
    getEquippedTitleId: function() {
        try {
            return localStorage.getItem(this.TITLES_KEY) || 'title_cirak';
        } catch(e) {
            return 'title_cirak';
        }
    },

    getEquippedTitle: function() {
        const id = this.getEquippedTitleId();
        return this.CAPTAIN_TITLES.find(t => t.id === id) || this.CAPTAIN_TITLES[0];
    },

    equipTitle: function(titleId, announce = true) {
        const title = this.CAPTAIN_TITLES.find(t => t.id === titleId);
        if (!title) return false;

        if (!this.isTitleUnlocked(titleId)) {
            const msg = "Bu unvan henüz kilitli. Şartı: " + title.requirement;
            if (announce && typeof audio !== 'undefined' && audio.speak) audio.speak(msg);
            if (typeof UI !== 'undefined' && UI.showToast) UI.showToast(msg, 'warning');
            return false;
        }

        try {
            localStorage.setItem(this.TITLES_KEY, titleId);
        } catch(e) {}
        if (typeof Game !== 'undefined' && typeof Game.saveData === 'function') {
            Game.saveData();
        }

        if (typeof audio !== 'undefined' && typeof audio.playBadgeFanfare === 'function') {
            audio.playBadgeFanfare();
        }

        const successSpeech = "Tebrikler Kaptan! Yeni unvanınız başarıyla kuşanıldı: " + title.icon + " " + title.name + "!";
        if (announce && typeof audio !== 'undefined') {
            if (audio.speak) audio.speak(successSpeech);
            if (audio.updateNvdaLiveRegion) audio.updateNvdaLiveRegion(successSpeech);
        }
        if (typeof UI !== 'undefined' && UI.showToast) {
            UI.showToast("👑 Aktif Unvan Kuşanıldı: " + title.name, 'success');
        }

        this.syncHudTitle();
        this.renderModal();
        return true;
    },

    syncHudTitle: function() {
        const lvlEl = document.getElementById('ui-level');
        if (!lvlEl) return;
        const eq = this.getEquippedTitle();
        if (eq) {
            lvlEl.innerText = eq.icon + " " + eq.name;
            lvlEl.title = "Kuşanılan Unvan: " + eq.name + ". Değiştirmek için tıklayın.";
        }
    },

    // --- KİLİT VE AÇILMA KONTROLLERİ ---
    isBadgeUnlocked: function(badgeId) {
        const data = this.getBadgesData();
        return !!(data[badgeId] && data[badgeId].unlocked);
    },

    isTitleUnlocked: function(titleId) {
        const title = this.CAPTAIN_TITLES.find(t => t.id === titleId);
        if (!title) return false;
        if (title.id === 'title_cirak') return true;

        if (this.isBadgeUnlocked(titleId)) {
            return true;
        }

        if (title.badgeId && this.isBadgeUnlocked(title.badgeId)) {
            return true;
        }

        const stats = this.getLifetimeStats();
        const badgesData = this.getBadgesData();
        if (typeof title.unlockCondition === 'function') {
            return title.unlockCondition(stats, badgesData);
        }
        return false;
    },

    isUnlocked: function(achId) {
        const data = this.getBadgesData();
        return !!(data[achId] && data[achId].unlocked);
    },

    getUnlockedDate: function(id) {
        const data = this.getBadgesData();
        return (data[id] && data[id].date) ? data[id].date : null;
    },

    getUnlockedCount: function() {
        const data = this.getBadgesData();
        return this.badges.filter(b => data[b.id] && data[b.id].unlocked).length;
    },

    getUnlockedBrovelerCount: function() {
        const data = this.getBadgesData();
        return this.CAPTAIN_BADGES.filter(b => data[b.id] && data[b.id].unlocked).length;
    },

    getUnlockedTitlesCount: function() {
        return this.CAPTAIN_TITLES.filter(t => this.isTitleUnlocked(t.id)).length;
    },

    getTotalUnlockedAllCount: function() {
        const data = this.getBadgesData();
        return Object.values(data).filter(v => v && v.unlocked).length;
    },

    unlock: function(id, announceNow = true, customName = null) {
        const data = this.getBadgesData();
        if (data[id] && data[id].unlocked) return false;

        const now = new Date();
        const dateStr = now.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' }) + ' ' + 
                        now.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });

        data[id] = {
            unlocked: true,
            date: dateStr
        };
        this.saveBadgesData(data);

        let displayName = customName;
        if (!displayName) {
            const KNOWN_NAMES = {
                'mahalle_kasifi': 'Mahalle Kâşifi (5 Durak Keşfi)',
                'hat_hakimi': 'Hat Hâkimi (%80 Durak Keşfi)',
                'emektar_direksiyon': 'Emektar Direksiyon (30 Dakika Kesintisiz Sürüş)'
            };
            if (KNOWN_NAMES[id]) {
                displayName = KNOWN_NAMES[id];
            } else {
                const b = this.CAPTAIN_BADGES ? this.CAPTAIN_BADGES.find(x => x.id === id) : null;
                if (b) displayName = b.title;
                else {
                    const ach = this.badges ? this.badges.find(x => x.id === id) : null;
                    if (ach) displayName = ach.title;
                    else {
                        const t = this.CAPTAIN_TITLES ? this.CAPTAIN_TITLES.find(x => x.id === id) : null;
                        if (t) displayName = t.name;
                        else displayName = id;
                    }
                }
            }
        }

        if (announceNow) {
            if (typeof audio !== 'undefined' && typeof audio.playBadgeFanfare === 'function') {
                audio.playBadgeFanfare();
            }
            const msg = "Tebrikler Kaptan! Yeni bir başarı ve liyakat ödülü kazandınız: " + displayName + "!";
            if (typeof audio !== 'undefined' && audio.speak) audio.speak(msg);
            if (typeof audio !== 'undefined' && audio.updateNvdaLiveRegion) audio.updateNvdaLiveRegion(msg);
            if (typeof UI !== 'undefined' && UI.showToast) UI.showToast("🎖️ Yeni Başarı Açıldı: " + displayName, 'success');
        }

        return true;
    },

    unlockBadge: function(id, announceNow = true, customName = null) {
        return this.unlock(id, announceNow, customName);
    },

    // --- RASTGELE HEDEF SEÇİCİ ---
    pickRandomMysteryBadge: function(announce = false) {
        const data = this.getBadgesData();
        let locked = this.badges.filter(b => !(data[b.id] && data[b.id].unlocked));

        if (this.currentTier !== 'all') {
            const reqTier = parseInt(this.currentTier);
            locked = locked.filter(b => b.tier === reqTier);
        }

        if (locked.length === 0) {
            this.currentSuggestedBadge = null;
            return null;
        }

        const rand = locked[Math.floor(Math.random() * locked.length)];
        this.currentSuggestedBadge = rand;

        if (announce && typeof audio !== 'undefined') {
            if (typeof audio.playSwitchClick === 'function') audio.playSwitchClick();
            const msg = "Tavsiye edilen hedef: Başarı No " + rand.difficulty + ", " + rand.title + ". Şart: " + rand.requirement + ". Nasıl Yapılır: " + rand.desc;
            if (audio.speak) audio.speak(msg);
            if (audio.updateNvdaLiveRegion) audio.updateNvdaLiveRegion(msg);
        }

        return rand;
    },

    // --- BAŞARI VE ROZETLERİ ANLIK KONTROL ET (GENEL TETİKLEYİCİ) ---
    checkBadges: function(stats = {}) {
        let hasSaved = false;
        try {
            hasSaved = !!localStorage.getItem(this.STATS_KEY);
        } catch(e) {}
        const lifetime = this.getLifetimeStats();
        if (stats && typeof stats.completedTasks === 'number') lifetime.completedTasks = Math.max(lifetime.completedTasks || 0, stats.completedTasks);
        this.saveLifetimeStats(lifetime);

        const data = this.getBadgesData();
        const newlyUnlocked = [];

        // 1. KAPTAN BRÖVELERİNİ KONTROL ET
        this.CAPTAIN_BADGES.forEach(brove => {
            if (data[brove.id] && data[brove.id].unlocked) return;
            const prog = brove.getProgress(lifetime);
            if (prog && prog.isCompleted) {
                this.unlock(brove.id, false, brove.title);
                newlyUnlocked.push({ type: 'brove', item: brove });
            }
        });

        // 2. KAPTAN UNVANLARINI KONTROL ET
        this.CAPTAIN_TITLES.forEach(title => {
            if (title.id === 'title_cirak') return;
            if (data[title.id] && data[title.id].unlocked) return;
            if (this.isTitleUnlocked(title.id)) {
                this.unlock(title.id, false, title.name);
                newlyUnlocked.push({ type: 'title', item: title });
            }
        });

        // 3. 1600 BAŞARIYI KONTROL ET
        this.badges.forEach(b => {
            if (data[b.id] && data[b.id].unlocked) return;

            const currentStatVal = lifetime[b.stat] || 0;
            if (currentStatVal >= b.targetValue) {
                this.unlock(b.id, false, b.title);
                newlyUnlocked.push({ type: 'achievement', item: b });
            }
        });

        // 4. ANONS VE KUTLAMA
        if (newlyUnlocked.length > 0) {
            setTimeout(() => {
                if (typeof audio !== 'undefined' && typeof audio.playBadgeFanfare === 'function') {
                    audio.playBadgeFanfare();
                }
            }, 500);

            const count = newlyUnlocked.length;
            const first = newlyUnlocked[0].item;
            const titleMsg = (newlyUnlocked[0].type === 'brove') 
                ? "🎖️ Yeni Resmi Kaptan Brövesi Açıldı: " + first.title
                : ((newlyUnlocked[0].type === 'title')
                    ? "👑 Yeni Kaptan Unvanı Açıldı: " + first.name
                    : "🏆 Yeni Başarı Açıldı: " + first.title);

            const firstDisplayName = first.title || first.name || "Yeni Ödül";
            const announceText = count === 1
                ? "Tebrikler Kaptan! Yeni bir ödül kazandınız: " + firstDisplayName + "!"
                : "Tebrikler Kaptan! " + count + " adet yeni rozet ve unvan kazanıldı! İlk ödülünüz: " + firstDisplayName + ".";

            setTimeout(() => {
                if (typeof audio !== 'undefined' && audio.speak) audio.speak(announceText);
                if (typeof audio !== 'undefined' && audio.updateNvdaLiveRegion) audio.updateNvdaLiveRegion(announceText);
                if (typeof UI !== 'undefined' && UI.showToast) UI.showToast(titleMsg, 'success');
            }, 1600);
        }

        this.syncHudTitle();
        return newlyUnlocked;
    },

    // --- SEFER BAŞLAMA İSTATİSTİKLERİNİ VE BAŞARIMLARINI KAYDET ---
    recordRouteStart: function(gameInstance) {
        if (!gameInstance) return [];
        const lifetime = this.getLifetimeStats();

        lifetime.routesStartedCount = (lifetime.routesStartedCount || 0) + 1;

        const routeData = gameInstance.activeRouteData || null;
        if (routeData && routeData.isIntercity) {
            lifetime.intercityStartsCount = (lifetime.intercityStartsCount || 0) + 1;
        }

        if (gameInstance.isNight || (gameInstance.clockMinutes < 360 || gameInstance.clockMinutes >= 1140)) {
            lifetime.nightStartsCount = (lifetime.nightStartsCount || 0) + 1;
        }

        if (gameInstance.weather === 'rain' || gameInstance.weather === 'snow' || (typeof weatherSystem !== 'undefined' && (weatherSystem.current === 'rain' || weatherSystem.current === 'snow'))) {
            lifetime.rainSnowStartsCount = (lifetime.rainSnowStartsCount || 0) + 1;
        }

        if (gameInstance.busDamage && typeof gameInstance.busDamage.health === 'number' && gameInstance.busDamage.health >= 100) {
            lifetime.cleanStartsCount = (lifetime.cleanStartsCount || 0) + 1;
        }

        const fuelCap = (typeof gameInstance.getFuelCapacity === 'function') ? gameInstance.getFuelCapacity() : (gameInstance.fuelTankCapacity || 500);
        if (gameInstance.currentFuelLiters >= (fuelCap * 0.88)) {
            lifetime.fullFuelStartsCount = (lifetime.fullFuelStartsCount || 0) + 1;
        }

        if (gameInstance.airPressurePSI >= 115) {
            lifetime.airPressureFullStarts = (lifetime.airPressureFullStarts || 0) + 1;
        }

        if (gameInstance.clockMinutes >= 360 && gameInstance.clockMinutes <= 600) {
            lifetime.morningStartsCount = (lifetime.morningStartsCount || 0) + 1;
        }

        const curBus = (typeof BusFleet !== 'undefined' && typeof BusFleet.getSelectedBus === 'function') 
            ? BusFleet.getSelectedBus() 
            : (gameInstance.selectedBus || null);

        if (curBus) {
            const isArticulated = (curBus.category === 'koruklu' || (curBus.name && curBus.name.toLowerCase().includes('körüklü')));
            if (curBus.sizeTier === 1) {
                lifetime.midibusStartsCount = (lifetime.midibusStartsCount || 0) + 1;
            } else if (curBus.sizeTier === 2) {
                lifetime.soloStartsCount = (lifetime.soloStartsCount || 0) + 1;
            } else if (isArticulated) {
                lifetime.articulatedStartsCount = (lifetime.articulatedStartsCount || 0) + 1;
            } else if (curBus.sizeTier === 3) {
                lifetime.coachStartsCount = (lifetime.coachStartsCount || 0) + 1;
            }
        }

        this.saveLifetimeStats(lifetime);

        // Sefer başladığı an şartı sağlanan başarımları hemen aç ve oyuncuyu kutla
        const newlyUnlocked = [];
        const data = this.getBadgesData();

        this.badges.forEach(b => {
            if (data[b.id] && data[b.id].unlocked) return;
            const currentStatVal = lifetime[b.stat] || 0;
            if (currentStatVal >= b.targetValue) {
                this.unlock(b.id, false, b.title);
                newlyUnlocked.push({ type: 'achievement', item: b });
            }
        });

        if (newlyUnlocked.length > 0) {
            setTimeout(() => {
                if (typeof audio !== 'undefined' && typeof audio.playBadgeFanfare === 'function') {
                    audio.playBadgeFanfare();
                }
            }, 300);

            const first = newlyUnlocked[0].item;
            const announceText = `Tebrikler Kaptan! Sefer başlangıcında yeni bir başarı kazandınız: ${first.title}!`;
            setTimeout(() => {
                if (typeof audio !== 'undefined' && audio.speak) audio.speak(announceText);
                if (typeof UI !== 'undefined' && UI.showToast) UI.showToast(`🏆 Başarı Açıldı: ${first.title}`, 'success');
            }, 800);
        }

        return newlyUnlocked;
    },

    // --- SEFER SONU OTOMATİK DEĞERLENDİRME ---
    checkAfterRoute: function(stats) {
        if (!stats || !stats.isSuccess) return [];

        let hasSaved = false;
        try {
            hasSaved = !!localStorage.getItem(this.STATS_KEY);
        } catch(e) {}
        const lifetime = this.getLifetimeStats();

        // 1. Toplam Seferler & Kariyer Görevleri
        const gameTasks = (typeof Game !== 'undefined' && typeof Game.completedTasks === 'number') ? Game.completedTasks : ((stats && typeof stats.completedTasks === 'number') ? stats.completedTasks : 0);
        lifetime.completedTasks = Math.max(lifetime.completedTasks || 0, gameTasks);
        if (!hasSaved && gameTasks > 0) {
            lifetime.totalTrips = gameTasks;
        } else {
            lifetime.totalTrips = (lifetime.totalTrips || 0) + 1;
        }

        // 2. Taşınan Yolcular: Gerçek sefer verisi ve alighting sonrası sıfırlanma bugı onarıldı
        const carried = (typeof stats.passengersCarried === 'number')
            ? stats.passengersCarried
            : ((typeof Game !== 'undefined' && typeof Game.totalPassengersBoardedInRoute === 'number' && Game.totalPassengersBoardedInRoute > 0)
                ? Game.totalPassengersBoardedInRoute
                : ((typeof Game !== 'undefined' && typeof Game.passengersOnBoard === 'number' && Game.passengersOnBoard > 0) ? Game.passengersOnBoard : 15));
        lifetime.totalPassengers += carried;
        
        const xpEarned = (typeof stats.earnedXP === 'number') ? stats.earnedXP : 150;
        lifetime.totalXP = Math.max(lifetime.totalXP || 0, (typeof Game !== 'undefined' && Game.playerXP) ? Game.playerXP : ((lifetime.totalXP || 0) + xpEarned));

        const moneyEarned = (typeof stats.earnedMoney === 'number') ? stats.earnedMoney : 100;
        lifetime.budgetEarned += moneyEarned;

        const km = (typeof stats.routeDistanceKm === 'number') ? stats.routeDistanceKm : 8;
        lifetime.totalKm += km;

        const drivingSec = (typeof stats.totalDrivingSeconds === 'number') ? stats.totalDrivingSeconds : 180;
        lifetime.totalDrivingMinutes += Math.max(1, Math.round(drivingSec / 60));

        // Konfor ve Seri Kontrolü (Peş peşe %95 ve üzeri - 85-94 arası dondurma hatası onarıldı)
        if (typeof stats.passengerComfort === 'number' && stats.passengerComfort >= 90) {
            lifetime.totalComfortTrips += 1;
        }
        if (typeof stats.passengerComfort === 'number' && stats.passengerComfort >= 95) {
            lifetime.currentComfortStreak = (lifetime.currentComfortStreak || 0) + 1;
            if (lifetime.currentComfortStreak > (lifetime.maxComfortStreak || 0)) {
                lifetime.maxComfortStreak = lifetime.currentComfortStreak;
            }
        } else {
            lifetime.currentComfortStreak = 0;
        }

        // Dakiklik ve Seri Kontrolü (Peş peşe %95 ve üzeri - 85-94 arası dondurma hatası onarıldı)
        if (typeof stats.punctualityScore === 'number' && stats.punctualityScore >= 90) {
            lifetime.totalPunctualTrips += 1;
        }
        if (typeof stats.punctualityScore === 'number' && stats.punctualityScore >= 95) {
            lifetime.currentPunctualStreak = (lifetime.currentPunctualStreak || 0) + 1;
            if (lifetime.currentPunctualStreak > (lifetime.maxPunctualStreak || 0)) {
                lifetime.maxPunctualStreak = lifetime.currentPunctualStreak;
            }
        } else {
            lifetime.currentPunctualStreak = 0;
        }

        // Hasarsızlık ve Temiz Sürüş Serisi Kontrolü (%100 Kondisyon)
        if (typeof stats.busHealth === 'number' && stats.busHealth >= 100) {
            lifetime.totalCleanTrips += 1;
            lifetime.currentCleanStreak = (lifetime.currentCleanStreak || 0) + 1;
            if (lifetime.currentCleanStreak > (lifetime.maxCleanStreak || 0)) {
                lifetime.maxCleanStreak = lifetime.currentCleanStreak;
            }
        } else {
            lifetime.currentCleanStreak = 0;
        }

        // Kusursuz Sefer Kontrolü (%100 + %100 + %100)
        if (stats.passengerComfort >= 100 && stats.punctualityScore >= 100 && stats.busHealth >= 100) {
            lifetime.perfectTripsCount = (lifetime.perfectTripsCount || 0) + 1;
        }

        // Retarder Kontrolü (Sefer içi kullanım adedi doğru aktarılır)
        const retarderCount = (typeof stats.retarderUsesCount === 'number' && stats.retarderUsesCount > 0)
            ? stats.retarderUsesCount
            : (stats.retarderUsed ? 1 : 0);
        if (retarderCount > 0) {
            lifetime.retarderUsesCount = (lifetime.retarderUsesCount || 0) + retarderCount;
        }

        // Gece Seferi
        if (stats.isNight === true) {
            lifetime.totalNightTrips += 1;
        }

        // Engelli Rampası (Sefer içi kullanım adedi doğru aktarılır)
        const rampCount = (typeof stats.rampsUsedCount === 'number' && stats.rampsUsedCount > 0)
            ? stats.rampsUsedCount
            : (stats.rampUsed ? 1 : 0);
        if (rampCount > 0) {
            lifetime.totalRampsUsed = (lifetime.totalRampsUsed || 0) + rampCount;
        }

        // Kayıp Eşya
        if (stats.lostItemFound === true) {
            lifetime.totalLostItemsFound += 1;
        }

        // Hava Durumu (Yağmur / Kar)
        const isRainSnow = (stats.isRainOrSnow === true) || 
            (typeof Game !== 'undefined' && (Game.activeClimateRegime === 'yagmurlu' || Game.activeClimateRegime === 'karli' || Game.weather === 'rainy' || Game.weather === 'snowy'));
        if (isRainSnow) {
            lifetime.rainSnowTrips = (lifetime.rainSnowTrips || 0) + 1;
        }

        // Dağ / Viraj / Güzergah / Sahil
        if (typeof Game !== 'undefined' && Game.activeRouteData) {
            const rName = (Game.activeRouteData.name || '') + ' ' + (Game.activeRouteData.desc || '');
            if (rName.includes('Bolu') || rName.includes('Dağ') || rName.includes('Geçit') || rName.includes('Zigana') || rName.includes('Toros')) {
                lifetime.mountainTrips = (lifetime.mountainTrips || 0) + 1;
            }
            if (Game.activeRouteData.isIntercity) {
                lifetime.intercityTrips = (lifetime.intercityTrips || 0) + 1;
            }
            const rLower = rName.toLowerCase();
            if (rLower.includes('sahil') || rLower.includes('kıyı') || rLower.includes('kiyi') || rLower.includes('deniz') || rLower.includes('kordon') || Game.activeRouteData.isCoastal) {
                lifetime.coastalTrips = (lifetime.coastalTrips || 0) + 1;
            }
        }

        // Araç Sınıfı İstatistiği (Körüklü ve VIP modelleri hassas eşleşme)
        const bus = (stats.selectedBus) || (typeof Game !== 'undefined' ? Game.selectedBus : null);
        if (bus) {
            if (bus.sizeTier === 1 || bus.sizeClass === 'kucuk') lifetime.midibusTrips = (lifetime.midibusTrips || 0) + 1;
            if (bus.sizeTier === 2 || bus.sizeClass === 'orta') lifetime.soloTrips = (lifetime.soloTrips || 0) + 1;
            const isArticulated = bus.id && (bus.id.includes('articulated') || bus.id.includes('koruklu') || bus.id.includes('conecto_g') || (bus.model && bus.model.includes('Körüklü')));
            if (isArticulated) {
                lifetime.articulatedTrips = (lifetime.articulatedTrips || 0) + 1;
            }
            if (bus.sizeTier === 3 && !isArticulated) {
                lifetime.vipIntercityTrips = (lifetime.vipIntercityTrips || 0) + 1;
            }
            if (bus.brand && bus.brand.toLowerCase().includes('mercedes')) lifetime.mercedesTrips = (lifetime.mercedesTrips || 0) + 1;
            if (bus.brand && (bus.brand.toLowerCase().includes('man') || bus.brand.toLowerCase().includes('neoplan'))) lifetime.manNeoplanTrips = (lifetime.manNeoplanTrips || 0) + 1;
        }

        // Keşfedilen Duraklar ve Şehirler
        const stopsCount = (typeof stats.stopsDiscovered === 'number') ? stats.stopsDiscovered : (typeof StopDiscovery !== 'undefined' && StopDiscovery.getDiscoveredStops ? StopDiscovery.getDiscoveredStops().length : (lifetime.stopsDiscovered || 0));
        lifetime.stopsDiscovered = Math.max(lifetime.stopsDiscovered || 0, stopsCount);

        const citiesCount = (typeof stats.unlockedCitiesCount === 'number') ? stats.unlockedCitiesCount : (typeof Game !== 'undefined' && Game.unlockedCities ? Game.unlockedCities.length : (lifetime.citiesVisitedCount || 1));
        lifetime.citiesVisitedCount = Math.max(lifetime.citiesVisitedCount || 1, citiesCount);

        const licLevel = (typeof stats.licenseLevel === 'number') ? stats.licenseLevel : (typeof Game !== 'undefined' && Game.licenseLevel ? Game.licenseLevel : (lifetime.licenseLevel || 1));
        lifetime.licenseLevel = Math.max(lifetime.licenseLevel || 1, licLevel);

        // Şirket Yönetimi İstatistikleri Entegrasyonu
        const compSysForCheck = (typeof CompanySystem !== 'undefined') ? CompanySystem : ((typeof window !== 'undefined' && window.CompanySystem) ? window.CompanySystem : null);
        if (compSysForCheck && compSysForCheck.data) {
            const cData = compSysForCheck.data;
            lifetime.companyLevel = Math.max(lifetime.companyLevel || 1, cData.companyLevel || 1);
            lifetime.companyTreasury = Math.max(lifetime.companyTreasury || 0, Math.max(0, cData.companyTreasury || 0));
            lifetime.companyTotalRevenue = Math.max(lifetime.companyTotalRevenue || 0, cData.totalRevenue || 0);
            lifetime.companyTripsCount = Math.max(lifetime.companyTripsCount || 0, cData.completedTripsCount || 0);
            lifetime.hiredDriversCount = Math.max(lifetime.hiredDriversCount || 0, Array.isArray(cData.hiredDrivers) ? cData.hiredDrivers.length : 0);

            let totalInst = 0;
            if (cData.institutions) {
                Object.values(cData.institutions).forEach(lvl => { totalInst += (lvl || 1); });
            }
            lifetime.companyTotalInstitutionLevels = Math.max(lifetime.companyTotalInstitutionLevels || 7, totalInst);

            let branchCount = 0;
            if (cData.terminalBranches) {
                Object.values(cData.terminalBranches).forEach(isOpen => { if (isOpen) branchCount++; });
            }
            lifetime.companyTerminalBranchesCount = Math.max(lifetime.companyTerminalBranchesCount || 1, branchCount);

            let hqCount = 0;
            if (cData.hqUpgrades) {
                Object.values(cData.hqUpgrades).forEach(hasUp => { if (hasUp) hqCount++; });
            }
            lifetime.companyHqUpgradesCount = Math.max(lifetime.companyHqUpgradesCount || 0, hqCount);

            lifetime.companyCateringVip = (cData.cateringPackage === 'vip' || cData.cateringPackage === 'standart') ? 1 : 0;
            lifetime.companyFacilityVip = (cData.facilityContract === 'vip' || cData.facilityContract === 'standart') ? 1 : 0;
            lifetime.companyContractsDone = (cData.specialContractsCompletedCount || (cData.specialContracts && cData.specialContracts.length) || 0);
            lifetime.companySatisfactionHighScore = (cData.satisfactionRating >= 4.8) ? 1 : 0;
            lifetime.companyMastery = (cData.companyLevel >= 5 && (cData.companyTreasury || 0) >= 50000000) ? 1 : 0;
        }

        this.saveLifetimeStats(lifetime);

        const data = this.getBadgesData();
        const newlyUnlocked = [];

        // 1. KAPTAN BRÖVELERİNİ KONTROL ET
        this.CAPTAIN_BADGES.forEach(brove => {
            if (data[brove.id] && data[brove.id].unlocked) return;
            const prog = brove.getProgress(lifetime);
            if (prog && prog.isCompleted) {
                this.unlock(brove.id, false, brove.title);
                newlyUnlocked.push({ type: 'brove', item: brove });
            }
        });

        // 2. KAPTAN UNVANLARINI KONTROL ET
        this.CAPTAIN_TITLES.forEach(title => {
            if (title.id === 'title_cirak') return;
            if (data[title.id] && data[title.id].unlocked) return;
            if (this.isTitleUnlocked(title.id)) {
                this.unlock(title.id, false, title.name);
                newlyUnlocked.push({ type: 'title', item: title });
            }
        });

        // 3. 1500 BAŞARIYI KONTROL ET
        this.badges.forEach(b => {
            if (data[b.id] && data[b.id].unlocked) return;

            const currentStatVal = lifetime[b.stat] || 0;
            if (currentStatVal >= b.targetValue) {
                this.unlock(b.id, false, b.title);
                newlyUnlocked.push({ type: 'achievement', item: b });
            }
        });

        // 4. ANONS VE KUTLAMA
        if (newlyUnlocked.length > 0) {
            setTimeout(() => {
                if (typeof audio !== 'undefined' && typeof audio.playBadgeFanfare === 'function') {
                    audio.playBadgeFanfare();
                }
            }, 500);

            const count = newlyUnlocked.length;
            const first = newlyUnlocked[0].item;
            const titleMsg = (newlyUnlocked[0].type === 'brove') 
                ? "🎖️ Yeni Resmi Kaptan Brövesi Açıldı: " + first.title
                : ((newlyUnlocked[0].type === 'title')
                    ? "👑 Yeni Kaptan Unvanı Açıldı: " + first.name
                    : "🏆 Yeni Başarı Açıldı: " + first.title);

            const firstDisplayName = first.title || first.name || "Yeni Ödül";
            const announceText = count === 1
                ? "Tebrikler Kaptan! Sefer başarınızla yeni bir ödül kazandınız: " + firstDisplayName + "!"
                : "Tebrikler Kaptan! Sefer başarınızla " + count + " adet yeni rozet ve unvan kazanıldı! İlk ödülünüz: " + firstDisplayName + ".";

            setTimeout(() => {
                if (typeof audio !== 'undefined' && audio.speak) audio.speak(announceText);
                if (typeof audio !== 'undefined' && audio.updateNvdaLiveRegion) audio.updateNvdaLiveRegion(announceText);
                if (typeof UI !== 'undefined' && UI.showToast) UI.showToast(titleMsg, 'success');
            }, 1600);
        }

        this.syncHudTitle();
        return newlyUnlocked;
    },

    // --- MODAL VE ARAYÜZ YÖNETİMİ ---
    openModal: function(targetTab = null) {
        const modal = document.getElementById('driver-badges-modal');
        if (!modal) return;

        modal.classList.remove('hidden');

        if (targetTab && ['titles', 'broveler', 'achievements'].includes(targetTab)) {
            this.currentMainTab = targetTab;
        }

        this.currentPage = 1;
        this.renderModal();

        const currentTitle = this.getEquippedTitle();
        const unlTitles = this.getUnlockedTitlesCount();
        const unlBroves = this.getUnlockedBrovelerCount();
        const unlAchs = this.getUnlockedCount();

        let welcomeSpeech = "Liyakat ve Başarılar Paneli açıldı. Aktif unvanınız: " + currentTitle.name + ". Kazanılan Bröveler: 24 üzerinden " + unlBroves + ". Açılan Unvanlar: 28 üzerinden " + unlTitles + ". Tamamlanan Başarılar: " + unlAchs + ".";

        if (typeof audio !== 'undefined') {
            if (typeof audio.playSwitchClick === 'function') audio.playSwitchClick();
            if (typeof audio.speak === 'function') audio.speak(welcomeSpeech);
            if (typeof audio.updateNvdaLiveRegion === 'function') audio.updateNvdaLiveRegion(welcomeSpeech);
        }

        const activeMainBtn = document.getElementById("tab-main-" + this.currentMainTab);
        if (activeMainBtn) activeMainBtn.focus();

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

        const opener = document.getElementById('btn-open-badges') || document.getElementById('btn-view-badges-results') || document.getElementById('card-driver-title');
        if (opener) opener.focus();

        if (typeof KeyboardNav !== 'undefined' && KeyboardNav.initForScreen) {
            KeyboardNav.initForScreen();
        }
    },

    // --- MODAL RENDER MOTORU ---
    renderModal: function() {
        const listEl = document.getElementById('driver-badges-list');
        const summaryEl = document.getElementById('driver-badges-summary');
        const paginationBox = document.getElementById('badge-pagination-container');
        const filterControlsBox = document.getElementById('badge-filter-controls-container');
        const mysteryTargetBox = document.getElementById('random-mystery-target-box');
        const achSubTabsBox = document.getElementById('achievements-sub-tabs-container');

        const tabMainTitles = document.getElementById('tab-main-titles');
        const tabMainBroveler = document.getElementById('tab-main-broveler');
        const tabMain1500 = document.getElementById('tab-main-1500');

        if (!listEl) return;
        listEl.innerHTML = '';

        const unlTitles = this.getUnlockedTitlesCount();
        const totalTitles = this.CAPTAIN_TITLES.length;
        const unlBroves = this.getUnlockedBrovelerCount();
        const totalBroves = this.CAPTAIN_BADGES.length;
        const unlAchs = this.getUnlockedCount();
        const totalAchs = this.badges.length;

        // Sekme Butonlarının Metinleri ve İstatistikleri
        if (tabMainTitles) tabMainTitles.innerText = "👑 Kaptan Unvanları (" + unlTitles + "/" + totalTitles + ")";
        if (tabMainBroveler) tabMainBroveler.innerText = "🎖️ Resmi Bröveler (" + unlBroves + "/" + totalBroves + ")";
        if (tabMain1500) tabMain1500.innerText = "🏆 " + totalAchs + " Başarı (" + unlAchs + "/" + totalAchs + ")";

        // Sekme Vurgulama
        const tabs = [
            { id: 'titles', el: tabMainTitles, color: '#facc15', bg: 'rgba(250, 204, 21, 0.25)' },
            { id: 'broveler', el: tabMainBroveler, color: '#eab308', bg: 'rgba(234, 179, 8, 0.25)' },
            { id: 'achievements', el: tabMain1500, color: '#38bdf8', bg: 'rgba(56, 189, 248, 0.25)' }
        ];

        tabs.forEach(t => {
            if (!t.el) return;
            if (this.currentMainTab === t.id) {
                t.el.style.background = t.bg;
                t.el.style.borderColor = t.color;
                t.el.style.color = '#fff';
                t.el.style.boxShadow = "0 0 15px " + t.bg;
                t.el.style.fontWeight = 'bold';
            } else {
                t.el.style.background = 'rgba(255, 255, 255, 0.06)';
                t.el.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                t.el.style.color = '#94a3b8';
                t.el.style.boxShadow = 'none';
                t.el.style.fontWeight = 'normal';
            }
        });

        // 1. SEKME: KAPTAN UNVANLARI VE LİYAKAT
        if (this.currentMainTab === 'titles') {
            if (paginationBox) paginationBox.style.display = 'none';
            if (filterControlsBox) filterControlsBox.style.display = 'none';
            if (mysteryTargetBox) mysteryTargetBox.style.display = 'none';
            if (achSubTabsBox) achSubTabsBox.style.display = 'none';

            const equipped = this.getEquippedTitle();
            if (summaryEl) {
                summaryEl.innerHTML = 
                    '<div style="background: linear-gradient(135deg, rgba(234, 179, 8, 0.22), rgba(15, 23, 42, 0.85)); border: 2px solid #eab308; border-radius: 10px; padding: 12px 16px; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">' +
                        '<div>' +
                            '<span style="font-size: 0.85rem; color: #cbd5e1; text-transform: uppercase; letter-spacing: 0.5px;">👑 DİREKSİYONDAKİ AKTİF UNVANINIZ:</span><br>' +
                            '<span style="font-size: 1.35rem; font-weight: bold; color: #fef08a;">' + equipped.icon + ' ' + equipped.name + '</span>' +
                            '<span style="font-size: 0.85rem; color: #94a3b8; margin-left: 8px;">(' + (equipped.category || 'Genel Kademe') + ')</span>' +
                            '<div style="font-size: 0.85rem; color: #e2e8f0; margin-top: 4px;">' + equipped.desc + '</div>' +
                        '</div>' +
                        '<div>' +
                            '<span style="background: #eab308; color: #000; font-weight: bold; padding: 4px 10px; border-radius: 6px; font-size: 0.85rem;">KUŞANILDI</span>' +
                        '</div>' +
                    '</div>';
            }

            this.CAPTAIN_TITLES.forEach(title => {
                const isUn = this.isTitleUnlocked(title.id);
                const isEq = (title.id === equipped.id);

                const li = document.createElement('li');
                li.style.marginBottom = '10px';
                li.style.listStyle = 'none';

                const card = document.createElement('div');
                card.className = 'glass-panel';
                card.style.padding = '12px 16px';
                card.style.borderRadius = '8px';
                card.style.display = 'flex';
                card.style.justifyContent = 'space-between';
                card.style.alignItems = 'center';
                card.style.flexWrap = 'wrap';
                card.style.gap = '10px';

                if (isEq) {
                    card.style.border = '2px solid #eab308';
                    card.style.background = 'linear-gradient(135deg, rgba(234, 179, 8, 0.25), rgba(15, 23, 42, 0.85))';
                    card.style.boxShadow = '0 0 16px rgba(234, 179, 8, 0.2)';
                } else if (isUn) {
                    card.style.border = '1px solid rgba(34, 197, 94, 0.4)';
                    card.style.background = 'rgba(15, 23, 42, 0.8)';
                } else {
                    card.style.border = '1px solid rgba(255, 255, 255, 0.1)';
                    card.style.background = 'rgba(15, 23, 42, 0.5)';
                    card.style.opacity = '0.85';
                }

                let btnHtml = '';
                if (isEq) {
                    btnHtml = '<span style="color: #fef08a; font-weight: bold; font-size: 0.9rem; padding: 6px 12px; background: rgba(234, 179, 8, 0.2); border: 1px solid #eab308; border-radius: 6px;">🌟 Aktif Kuşanıldı</span>';
                } else if (isUn) {
                    btnHtml = '<button class="modern-btn nav-item btn-equip-title" data-id="' + title.id + '" style="padding: 7px 16px; background: #22c55e; color: #000; font-weight: bold; border-radius: 6px; cursor: pointer; border: none;" aria-label="' + title.name + ' unvanını kuşan">👑 Unvanı Kuşan</button>';
                } else {
                    btnHtml = '<span style="color: #94a3b8; font-size: 0.85rem; padding: 5px 10px; background: rgba(255,255,255,0.06); border-radius: 6px;">🔒 Kilitli</span>';
                }

                card.innerHTML = 
                    '<div style="flex: 1; min-width: 260px;">' +
                        '<div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">' +
                            '<span style="font-size: 1.4rem;" aria-hidden="true">' + title.icon + '</span>' +
                            '<span style="font-size: 1.1rem; font-weight: bold; color: ' + (isUn ? '#fff' : '#94a3b8') + ';">' + title.name + '</span>' +
                            '<span style="font-size: 0.75rem; padding: 2px 6px; border-radius: 4px; background: rgba(56, 189, 248, 0.15); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.3);">' + title.category + '</span>' +
                        '</div>' +
                        '<div style="font-size: 0.88rem; color: #cbd5e1; margin-bottom: 4px; line-height: 1.35;">' + title.desc + '</div>' +
                        '<div style="font-size: 0.82rem; color: ' + (isUn ? '#4ade80' : '#facc15') + ';">' +
                            '🎯 <strong>Şart:</strong> ' + title.requirement +
                        '</div>' +
                    '</div>' +
                    '<div>' + btnHtml + '</div>';

                li.appendChild(card);
                listEl.appendChild(li);
            });

            // Kuşan buton dinleyicileri
            document.querySelectorAll('.btn-equip-title').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const id = e.currentTarget.getAttribute('data-id');
                    this.equipTitle(id);
                });
            });

        // 2. SEKME: RESMİ KAPTAN BRÖVELERİ & NİŞANLAR
        } else if (this.currentMainTab === 'broveler') {
            if (paginationBox) paginationBox.style.display = 'none';
            if (filterControlsBox) filterControlsBox.style.display = 'none';
            if (mysteryTargetBox) mysteryTargetBox.style.display = 'none';
            if (achSubTabsBox) achSubTabsBox.style.display = 'none';

            if (summaryEl) {
                summaryEl.innerText = "🎖️ Resmi Kaptan Bröveleri: Toplam " + totalBroves + " Bröveden " + unlBroves + " Tanesi Hak Edildi.";
            }

            const stats = this.getLifetimeStats();

            this.CAPTAIN_BADGES.forEach(brove => {
                const isUn = this.isBadgeUnlocked(brove.id);
                const prog = brove.getProgress(stats);
                const dateStr = this.getUnlockedDate(brove.id);

                const li = document.createElement('li');
                li.style.marginBottom = '12px';
                li.style.listStyle = 'none';

                const card = document.createElement('div');
                card.className = 'glass-panel';
                card.style.padding = '14px 18px';
                card.style.borderRadius = '10px';
                card.style.transition = 'all 0.2s ease';

                if (isUn) {
                    card.style.border = '2px solid #eab308';
                    card.style.background = 'linear-gradient(135deg, rgba(234, 179, 8, 0.18), rgba(15, 23, 42, 0.9))';
                    card.style.boxShadow = '0 0 15px rgba(234, 179, 8, 0.15)';
                } else {
                    card.style.border = '1px solid rgba(56, 189, 248, 0.25)';
                    card.style.background = 'rgba(15, 23, 42, 0.8)';
                }

                const ariaLabel = "Bröve: " + brove.title + ". Seviye: " + brove.tierName + ". Kategori: " + brove.categoryName + ". Durum: " + (isUn ? 'Kazanıldı' : ("Devam ediyor, " + prog.current + " bölü " + prog.target)) + ". Şart: " + brove.requirement + ".";
                card.setAttribute('aria-label', ariaLabel);
                card.setAttribute('tabindex', '0');

                card.innerHTML = 
                    '<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">' +
                        '<div style="display: flex; align-items: center; gap: 10px;">' +
                            '<span style="font-size: 1.6rem;" aria-hidden="true">' + brove.icon + '</span>' +
                            '<div>' +
                                '<span style="font-size: 0.8rem; color: #eab308; font-weight: bold; text-transform: uppercase;">' + brove.tierName + ' • ' + brove.categoryName + '</span>' +
                                '<h3 style="font-size: 1.15rem; font-weight: bold; color: ' + (isUn ? '#fef08a' : '#fff') + '; margin: 2px 0 0 0;">' + brove.title + '</h3>' +
                            '</div>' +
                        '</div>' +
                        '<div>' +
                            (isUn 
                                ? '<span style="background: #eab308; color: #000; font-weight: bold; padding: 4px 10px; border-radius: 6px; font-size: 0.82rem;">🎖️ BRÖVE KAZANILDI</span>'
                                : ('<span style="background: rgba(148, 163, 184, 0.2); color: #94a3b8; font-weight: bold; padding: 4px 10px; border-radius: 6px; font-size: 0.82rem;">🔒 ' + prog.percent + '%</span>')
                            ) +
                        '</div>' +
                    '</div>' +

                    '<div style="font-size: 0.9rem; color: #e2e8f0; margin-bottom: 8px; line-height: 1.4;">' + brove.desc + '</div>' +

                    '<div style="margin-bottom: 8px;">' +
                        '<div style="display: flex; justify-content: space-between; font-size: 0.82rem; color: #cbd5e1; margin-bottom: 3px;">' +
                            '<span>🎯 <strong>Gereksinim:</strong> ' + brove.requirement + '</span>' +
                            '<span style="color: ' + (isUn ? '#4ade80' : '#38bdf8') + '; font-weight: bold;">' + prog.current + ' / ' + prog.target + ' (' + prog.percent + '%)</span>' +
                        '</div>' +
                        '<div style="width: 100%; height: 7px; background: rgba(255,255,255,0.1); border-radius: 4px; overflow: hidden;">' +
                            '<div style="width: ' + prog.percent + '%; height: 100%; background: ' + (isUn ? '#22c55e' : 'linear-gradient(90deg, #38bdf8, #818cf8)') + '; transition: width 0.3s ease;"></div>' +
                        '</div>' +
                    '</div>' +

                    '<div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.82rem; padding-top: 6px; border-top: 1px solid rgba(255,255,255,0.08);">' +
                        '<div style="color: #fde047;">' +
                            '👑 <strong>Açtığı Unvan:</strong> ' + (this.CAPTAIN_TITLES.find(t => t.id === brove.grantedTitleId)?.name || 'Kaptan Liyakati') +
                        '</div>' +
                        '<div style="color: #94a3b8; font-size: 0.8rem;">' +
                            (isUn ? ('📅 Kazanıldı: ' + (dateStr || 'Kayıtlı')) : '⏳ İlerleme Sürüyor') +
                        '</div>' +
                    '</div>';

                card.onclick = () => {
                    if (typeof audio !== 'undefined') {
                        if (isUn && audio.playBadgeFanfare) audio.playBadgeFanfare();
                        else if (audio.playSwitchClick) audio.playSwitchClick();
                        if (audio.speak) audio.speak(ariaLabel);
                        if (audio.updateNvdaLiveRegion) audio.updateNvdaLiveRegion(ariaLabel);
                    }
                };

                li.appendChild(card);
                listEl.appendChild(li);
            });

        // 3. SEKME: 1500 BAŞARI VERİTABANI
        } else {
            if (paginationBox) paginationBox.style.display = 'flex';
            if (filterControlsBox) filterControlsBox.style.display = 'flex';
            if (achSubTabsBox) achSubTabsBox.style.display = 'flex';

            const tabUnlockedBtn = document.getElementById('tab-badges-unlocked');
            const tabLockedBtn = document.getElementById('tab-badges-locked');
            const lockedCount = totalAchs - unlAchs;

            if (tabUnlockedBtn) tabUnlockedBtn.innerText = "🏆 Açılmış Başarılar (" + unlAchs + ")";
            if (tabLockedBtn) tabLockedBtn.innerText = "🔒 Açılmayan Başarılar (" + lockedCount + ")";

            if (this.currentAchSubTab === 'unlocked') {
                if (tabUnlockedBtn) {
                    tabUnlockedBtn.style.background = 'linear-gradient(135deg, rgba(234, 179, 8, 0.35), rgba(202, 138, 4, 0.2))';
                    tabUnlockedBtn.style.borderColor = '#eab308';
                    tabUnlockedBtn.style.color = '#fef08a';
                }
                if (tabLockedBtn) {
                    tabLockedBtn.style.background = 'rgba(255, 255, 255, 0.06)';
                    tabLockedBtn.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                    tabLockedBtn.style.color = '#94a3b8';
                }
                if (mysteryTargetBox) mysteryTargetBox.style.display = 'none';
            } else {
                if (tabLockedBtn) {
                    tabLockedBtn.style.background = 'linear-gradient(135deg, rgba(56, 189, 248, 0.3), rgba(30, 58, 138, 0.3))';
                    tabLockedBtn.style.borderColor = '#38bdf8';
                    tabLockedBtn.style.color = '#bae6fd';
                }
                if (tabUnlockedBtn) {
                    tabUnlockedBtn.style.background = 'rgba(255, 255, 255, 0.06)';
                    tabUnlockedBtn.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                    tabUnlockedBtn.style.color = '#94a3b8';
                }

                // Gizemli Hedef Kutusu
                if (mysteryTargetBox) {
                    if (!this.currentSuggestedBadge || this.isUnlocked(this.currentSuggestedBadge.id)) {
                        this.pickRandomMysteryBadge(false);
                    }

                    if (this.currentSuggestedBadge) {
                        const r = this.currentSuggestedBadge;
                        mysteryTargetBox.style.display = 'block';
                        mysteryTargetBox.innerHTML = 
                            '<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">' +
                                '<div style="display: flex; align-items: center; gap: 8px;">' +
                                    '<span style="font-size: 1.3rem;">🎯</span>' +
                                    '<span style="font-size: 1.05rem; font-weight: bold; color: #38bdf8;">Tavsiye Edilen Görev Hedefi</span>' +
                                '</div>' +
                                '<button id="btn-reroll-mystery-target" class="modern-btn nav-item" style="padding: 4px 10px; font-size: 0.85rem; background: rgba(56, 189, 248, 0.2); border: 1px solid #38bdf8; color: #bae6fd; cursor: pointer; border-radius: 6px;">🎲 Başka Hedef</button>' +
                            '</div>' +
                            '<div style="font-size: 0.95rem; color: #e2e8f0; margin-bottom: 4px;">' +
                                '<strong style="color: #38bdf8;">No #' + r.difficulty + ' • ' + r.tierName + ':</strong> ' +
                                '<span style="color: #fef08a; font-weight: bold;">' + r.title + '</span> ' +
                                '<span style="font-size: 0.8rem; padding: 2px 6px; border-radius: 4px; background: rgba(56, 189, 248, 0.15); color: #38bdf8; margin-left: 6px;">' + r.category + '</span>' +
                            '</div>' +
                            '<div style="font-size: 0.88rem; color: #cbd5e1; margin-bottom: 4px; line-height: 1.35;">📖 ' + r.desc + '</div>' +
                            '<div style="font-size: 0.85rem; color: #facc15; padding-top: 4px; border-top: 1px solid rgba(255,255,255,0.1);">🎯 <strong>Şart:</strong> ' + r.requirement + '</div>';

                        setTimeout(() => {
                            const btnReroll = document.getElementById('btn-reroll-mystery-target');
                            if (btnReroll) {
                                btnReroll.onclick = () => {
                                    this.pickRandomMysteryBadge(true);
                                    this.renderModal();
                                };
                            }
                        }, 50);
                    }
                }
            }

            // Filtreleme
            let filtered = this.badges.filter(b => {
                const isUn = this.isUnlocked(b.id);
                if (this.currentAchSubTab === 'unlocked' && !isUn) return false;
                if (this.currentAchSubTab === 'locked' && isUn) return false;

                if (this.currentTier !== 'all' && b.tier !== parseInt(this.currentTier)) {
                    return false;
                }

                if (this.searchQuery && this.searchQuery.trim() !== '') {
                    const q = this.searchQuery.toLocaleLowerCase('tr-TR').trim();
                    const matchTitle = (b.title || '').toLocaleLowerCase('tr-TR').includes(q);
                    const matchDesc = (b.desc || '').toLocaleLowerCase('tr-TR').includes(q);
                    const matchCat = (b.category || '').toLocaleLowerCase('tr-TR').includes(q);
                    const matchReq = (b.requirement || '').toLocaleLowerCase('tr-TR').includes(q);
                    if (!matchTitle && !matchDesc && !matchCat && !matchReq) return false;
                }

                return true;
            });

            const totalFiltered = filtered.length;
            const totalPages = Math.max(1, Math.ceil(totalFiltered / this.pageSize));
            if (this.currentPage > totalPages) this.currentPage = totalPages;
            if (this.currentPage < 1) this.currentPage = 1;

            if (summaryEl) {
                summaryEl.innerText = (this.currentAchSubTab === 'unlocked')
                    ? ("🏆 Açılmış Başarılar: Toplam " + unlAchs + " Başarı Kazanıldı (Filtrelenen: " + totalFiltered + ")")
                    : ("🔒 Açılmayan Başarılar: Toplam " + lockedCount + " Başarı Bekliyor (Filtrelenen: " + totalFiltered + ")");
            }

            const pageIndicatorEl = document.getElementById('badge-page-indicator');
            const btnPrev = document.getElementById('btn-badge-prev-page');
            const btnNext = document.getElementById('btn-badge-next-page');

            if (pageIndicatorEl) pageIndicatorEl.innerText = "Sayfa " + this.currentPage + " / " + totalPages + " (" + totalFiltered + " Başarı)";
            if (btnPrev) btnPrev.disabled = (this.currentPage <= 1);
            if (btnNext) btnNext.disabled = (this.currentPage >= totalPages);

            const startIndex = (this.currentPage - 1) * this.pageSize;
            const pageItems = filtered.slice(startIndex, startIndex + this.pageSize);

            if (pageItems.length === 0) {
                const emptyLi = document.createElement('li');
                emptyLi.style.padding = '30px 15px';
                emptyLi.style.textAlign = 'center';
                emptyLi.style.color = '#94a3b8';
                emptyLi.innerHTML = "Henüz bu filtreye uygun bir başarı bulunamadı.";
                listEl.appendChild(emptyLi);
                if (typeof KeyboardNav !== 'undefined' && KeyboardNav.initForScreen) {
                    KeyboardNav.initForScreen();
                }
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

                let tierColor = '#22c55e';
                if (badge.tier === 2) tierColor = '#eab308';
                else if (badge.tier === 3) tierColor = '#f97316';
                else if (badge.tier === 4) tierColor = '#ef4444';
                else if (badge.tier === 5) tierColor = '#a855f7';

                if (isUn) {
                    btn.style.border = '2px solid #eab308';
                    btn.style.background = 'linear-gradient(135deg, rgba(234, 179, 8, 0.18), rgba(202, 138, 4, 0.08))';
                    btn.innerHTML = 
                        '<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">' +
                            '<div style="display: flex; align-items: center; gap: 8px;">' +
                                '<span style="font-size: 1.35rem;">' + badge.icon + '</span>' +
                                '<div>' +
                                    '<span style="font-size: 0.8rem; color: ' + tierColor + '; font-weight: bold;">#' + badge.difficulty + ' • ' + badge.tierName + '</span>' +
                                    '<span style="font-size: 1.05rem; font-weight: bold; color: #fef08a; margin-left: 6px;">' + badge.title + '</span>' +
                                    '<span style="font-size: 0.75rem; padding: 1px 6px; border-radius: 4px; background: rgba(56, 189, 248, 0.15); color: #38bdf8; margin-left: 6px;">' + badge.category + '</span>' +
                                '</div>' +
                            '</div>' +
                            '<span style="background: #eab308; color: #000; font-weight: bold; padding: 2px 8px; border-radius: 4px; font-size: 0.8rem;">🎖️ KAZANILDI</span>' +
                        '</div>' +
                        '<div style="font-size: 0.9rem; color: #e2e8f0; margin-bottom: 6px;">📖 ' + badge.desc + '</div>' +
                        '<div style="display: flex; justify-content: space-between; font-size: 0.82rem; padding-top: 4px; border-top: 1px solid rgba(255,255,255,0.08);">' +
                            '<span style="color: #38bdf8;">🎯 <strong>Şart:</strong> ' + badge.requirement + '</span>' +
                            '<span style="color: #fde047;">📅 ' + (dateStr || 'Kayıtlı') + '</span>' +
                        '</div>';
                } else {
                    btn.style.border = '1px solid rgba(56, 189, 248, 0.25)';
                    btn.style.background = 'rgba(15, 23, 42, 0.75)';
                    btn.innerHTML = 
                        '<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">' +
                            '<div style="display: flex; align-items: center; gap: 8px;">' +
                                '<span style="font-size: 1.25rem;">' + badge.icon + '</span>' +
                                '<div>' +
                                    '<span style="font-size: 0.8rem; color: ' + tierColor + '; font-weight: bold;">#' + badge.difficulty + ' • ' + badge.tierName + '</span>' +
                                    '<span style="font-size: 1.05rem; font-weight: bold; color: #cbd5e1; margin-left: 6px;">' + badge.title + '</span>' +
                                    '<span style="font-size: 0.75rem; padding: 1px 6px; border-radius: 4px; background: rgba(56, 189, 248, 0.15); color: #38bdf8; margin-left: 6px;">' + badge.category + '</span>' +
                                '</div>' +
                            '</div>' +
                            '<span style="background: rgba(148, 163, 184, 0.2); color: #94a3b8; font-weight: bold; padding: 2px 8px; border-radius: 4px; font-size: 0.8rem;">🔒 KİLİTLİ</span>' +
                        '</div>' +
                        '<div style="font-size: 0.88rem; color: #cbd5e1; margin-bottom: 6px;">📖 ' + badge.desc + '</div>' +
                        '<div style="font-size: 0.82rem; color: #facc15; padding-top: 4px; border-top: 1px solid rgba(255,255,255,0.08);">' +
                            '🎯 <strong>Şart:</strong> ' + badge.requirement +
                        '</div>';
                }

                btn.onclick = () => {
                    const ariaTxt = badge.title + ". " + badge.desc + ". Şart: " + badge.requirement;
                    if (typeof audio !== 'undefined') {
                        if (isUn && audio.playBadgeFanfare) audio.playBadgeFanfare();
                        else if (audio.playSwitchClick) audio.playSwitchClick();
                        if (audio.speak) audio.speak(ariaTxt);
                        if (audio.updateNvdaLiveRegion) audio.updateNvdaLiveRegion(ariaTxt);
                    }
                };

                li.appendChild(btn);
                listEl.appendChild(li);
            });
        }

        if (typeof KeyboardNav !== 'undefined' && KeyboardNav.initForScreen) {
            KeyboardNav.initForScreen();
        }
    },

    nextPage: function() {
        this.currentPage++;
        this.renderModal();
        const notice = "Sayfa " + this.currentPage + " açıldı.";
        if (typeof audio !== 'undefined' && audio.updateNvdaLiveRegion) audio.updateNvdaLiveRegion(notice);
        const listEl = document.getElementById('driver-badges-list');
        if (listEl) listEl.scrollTop = 0;
    },

    prevPage: function() {
        if (this.currentPage > 1) {
            this.currentPage--;
        }
        this.renderModal();
        const notice = "Sayfa " + this.currentPage + " açıldı.";
        if (typeof audio !== 'undefined' && audio.updateNvdaLiveRegion) audio.updateNvdaLiveRegion(notice);
        const listEl = document.getElementById('driver-badges-list');
        if (listEl) listEl.scrollTop = 0;
    },

    init: function() {
        const btnOpen = document.getElementById('btn-open-badges');
        if (btnOpen) {
            btnOpen.addEventListener('click', () => this.openModal('titles'));
        }

        const btnOpenResults = document.getElementById('btn-view-badges-results');
        if (btnOpenResults) {
            btnOpenResults.addEventListener('click', () => this.openModal('broveler'));
        }

        const cardTitle = document.getElementById('card-driver-title');
        if (cardTitle) {
            cardTitle.addEventListener('click', () => this.openModal('titles'));
            cardTitle.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.openModal('titles');
                }
            });
        }

        const btnClose = document.getElementById('btn-badges-modal-close');
        if (btnClose) {
            btnClose.addEventListener('click', () => this.closeModal());
        }

        // Ana Sekmeler
        const tabTitles = document.getElementById('tab-main-titles');
        const tabBroveler = document.getElementById('tab-main-broveler');
        const tab1500 = document.getElementById('tab-main-1500');

        if (tabTitles) tabTitles.addEventListener('click', () => {
            this.currentMainTab = 'titles';
            this.renderModal();
            if (typeof audio !== 'undefined' && audio.speak) audio.speak("Kaptan unvanları ve liyakat sekmesine geçildi.");
        });

        if (tabBroveler) tabBroveler.addEventListener('click', () => {
            this.currentMainTab = 'broveler';
            this.renderModal();
            if (typeof audio !== 'undefined' && audio.speak) audio.speak("Resmi kaptan bröveleri ve nişanlar sekmesine geçildi.");
        });

        if (tab1500) tab1500.addEventListener('click', () => {
            this.currentMainTab = 'achievements';
            this.renderModal();
            if (typeof audio !== 'undefined' && audio.speak) audio.speak("1500 Şoför başarısı veritabanı sekmesine geçildi.");
        });

        // 1500 Başarı Alt Sekmeleri
        const tabUnlocked = document.getElementById('tab-badges-unlocked');
        const tabLocked = document.getElementById('tab-badges-locked');

        if (tabUnlocked) tabUnlocked.addEventListener('click', () => {
            this.currentAchSubTab = 'unlocked';
            this.currentPage = 1;
            this.renderModal();
            if (typeof audio !== 'undefined' && audio.speak) audio.speak("Açılmış başarılar alt sekmesine geçildi.");
        });

        if (tabLocked) tabLocked.addEventListener('click', () => {
            this.currentAchSubTab = 'locked';
            this.currentPage = 1;
            if (!this.currentSuggestedBadge || this.isUnlocked(this.currentSuggestedBadge.id)) {
                this.pickRandomMysteryBadge(false);
            }
            this.renderModal();
            if (typeof audio !== 'undefined' && audio.speak) audio.speak("Açılmayan başarılar alt sekmesine geçildi.");
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
            } else if (e.key === ']') {
                if (this.currentMainTab === 'achievements') this.nextPage();
            } else if (e.key === '[') {
                if (this.currentMainTab === 'achievements') this.prevPage();
            }
        });

        this.syncHudTitle();
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
