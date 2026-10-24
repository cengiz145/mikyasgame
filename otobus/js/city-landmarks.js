/* ==========================================================================
   81 İL ŞEHİR ÖNEMLİ SİMGE NOKTALARI MOTORU (CITY LANDMARKS & POI ENGINE)
   Körler ve Ekran Okuyucu (NVDA / JAWS) İçin Sade ve Net Simge Noktalar
   - Kural: Sadece durağa/noktaya gelince ekran okuyucu sesli okur (Bilgi/ders vermez)
   - 81 İl ve Tekirdağ 11 İlçesinin Hastane, Üniversite, Gar, Liman ve Meydanları
   - Shift + P Kısayolu: Yakındaki simge noktanın adını anında tek kelime/cümleyle oku
   ========================================================================== */

(function(window) {
    'use strict';

    // 81 İL VE TEKİRDAĞ ÖNEMLİ SİMGE NOKTALAR LİSTESİ
    const CITY_LANDMARKS = [
        // --- TEKİRDAĞ VE 11 İLÇESİ ---
        { id: "tk_sehir_hastane", name: "Tekirdağ Şehir Hastanesi", city: "Tekirdağ", district: "Süleymanpaşa", keywords: ["şehir hastanesi", "sehir hastane"] },
        { id: "tk_nku_kampus", name: "Namık Kemal Üniversitesi Kampüsü", city: "Tekirdağ", district: "Süleymanpaşa", keywords: ["üniversite", "nkü", "değirmenaltı", "fakülte"] },
        { id: "tk_valilik", name: "Tekirdağ Valiliği ve Hükümet Konağı", city: "Tekirdağ", district: "Süleymanpaşa", keywords: ["valilik", "hükümet caddesi", "hükümet konağı"] },
        { id: "tk_liman", name: "Ceyport Tekirdağ Uluslararası Limanı", city: "Tekirdağ", district: "Süleymanpaşa", keywords: ["liman", "iskele", "yat limanı"] },
        { id: "tk_otogar", name: "Tekirdağ Şehirlerarası Otobüs Terminali", city: "Tekirdağ", district: "Süleymanpaşa", keywords: ["otogar", "terminal", "otobüs terminali"] },
        { id: "tk_namik_kemal_ev", name: "Namık Kemal Evi", city: "Tekirdağ", district: "Süleymanpaşa", keywords: ["namık kemal", "namık kemal evi"] },
        
        // Çorlu
        { id: "corlu_tren_gar", name: "Çorlu Tarihi Tren Garı", city: "Tekirdağ", district: "Çorlu", keywords: ["tren garı", "istasyon", "gar"] },
        { id: "corlu_devlet_hastane", name: "Çorlu Devlet Hastanesi", city: "Tekirdağ", district: "Çorlu", keywords: ["devlet hastanesi", "çorlu hastane"] },
        { id: "corlu_havalimani", name: "Tekirdağ Çorlu Atatürk Havalimanı", city: "Tekirdağ", district: "Çorlu", keywords: ["havalimanı", "havaalanı", "terminal"] },
        { id: "corlu_belediye_meydan", name: "Çorlu Atatürk Meydanı", city: "Tekirdağ", district: "Çorlu", keywords: ["atatürk meydanı", "çorlu belediye", "kumyol"] },
        { id: "corlu_otogar", name: "Çorlu Şehirlerarası Otogarı", city: "Tekirdağ", district: "Çorlu", keywords: ["çorlu otogar", "otogar 1"] },

        // Çerkezköy & Kapaklı
        { id: "cerkez_organize", name: "Çerkezköy Organize Sanayi Bölgesi", city: "Tekirdağ", district: "Çerkezköy", keywords: ["organize sanayi", "çosb", "sanayi"] },
        { id: "cerkez_istasyon", name: "Çerkezköy Hızlı Tren İstasyonu", city: "Tekirdağ", district: "Çerkezköy", keywords: ["istasyon", "çerkezköy gar"] },
        { id: "kapakli_meydan", name: "Kapaklı Kent Meydanı", city: "Tekirdağ", district: "Kapaklı", keywords: ["kapaklı meydan", "pınarça"] },

        // Ergene & Velimeşe
        { id: "velimese_sanayi", name: "Velimeşe Sanayi Meydanı", city: "Tekirdağ", district: "Ergene", keywords: ["velimeşe", "bozacı", "sağlık mah"] },
        
        // Şarköy, Malkara, Saray, Muratlı, Hayrabolu, Marmaraereğlisi
        { id: "sarkoy_iskele", name: "Şarköy Tarihi Sahil İskelesi", city: "Tekirdağ", district: "Şarköy", keywords: ["şarköy iskele", "sahil", "kordon"] },
        { id: "malkara_meydan", name: "Malkara Hükümet Meydanı", city: "Tekirdağ", district: "Malkara", keywords: ["malkara meydan", "hükümet"] },
        { id: "saray_carsi", name: "Saray Tarihi Çarşısı", city: "Tekirdağ", district: "Saray", keywords: ["saray çarşı", "çamlık", "büyükyoncalı"] },
        { id: "muratli_gar", name: "Muratlı Tren İstasyonu", city: "Tekirdağ", district: "Muratlı", keywords: ["muratlı gar", "muratlı istasyon"] },
        { id: "hayrabolu_kopru", name: "Tarihi Hayrabolu Köprüsü", city: "Tekirdağ", district: "Hayrabolu", keywords: ["hayrabolu", "köprü"] },
        { id: "eregli_perinthos", name: "Marmaraereğlisi Perinthos Antik Limanı", city: "Tekirdağ", district: "Marmaraereğlisi", keywords: ["ereğli", "perinthos", "antik liman"] },

        // --- TÜRKİYE'NİN 81 İLİ SİMGE NOKTALARI ---
        { id: "ada_taskopru", name: "Adana Tarihi Taşköprü", city: "Adana", keywords: ["taşköprü", "seyhan"] },
        { id: "adi_nemrut", name: "Nemrut Dağı Milli Parkı Yolu", city: "Adıyaman", keywords: ["nemrut", "kahta"] },
        { id: "afy_kale", name: "Afyonkarahisar Kalesi Meydanı", city: "Afyonkarahisar", keywords: ["kale", "zafer meydanı"] },
        { id: "agr_ishakpasa", name: "İshak Paşa Sarayı Yolu", city: "Ağrı", keywords: ["ishak paşa", "doğubayazıt"] },
        { id: "ama_kralkaya", name: "Amasya Kral Kaya Mezarları", city: "Amasya", keywords: ["kral kaya", "yeşilırmak", "şehzadeler"] },
        { id: "ank_anitkabir", name: "Anıtkabir", city: "Ankara", keywords: ["anıtkabir", "tandoğan", "çankaya"] },
        { id: "ank_kizilay", name: "Kızılay Meydanı", city: "Ankara", keywords: ["kızılay", "güvenpark"] },
        { id: "ank_asti", name: "AŞTİ Şehirlerarası Otobüs Terminali", city: "Ankara", keywords: ["aşti", "terminal", "mevlana bulvarı"] },
        { id: "ant_kaleici", name: "Antalya Tarihi Kaleiçi ve Yat Limanı", city: "Antalya", keywords: ["kaleiçi", "yat limanı", "üçkapılar"] },
        { id: "art_coruh", name: "Artvin Çoruh Park", city: "Artvin", keywords: ["çoruh", "kafkasör"] },
        { id: "ayd_kusadasi", name: "Kuşadası Sahil Kordonu", city: "Aydın", keywords: ["kuşadası", "sahil", "efes"] },
        { id: "bal_saatkulesi", name: "Balıkesir Saat Kulesi", city: "Balıkesir", keywords: ["saat kulesi", "millikuvvetler"] },
        { id: "bil_seyhedebali", name: "Şeyh Edebali Türbesi Meydanı", city: "Bilecik", keywords: ["şeyh edebali", "türbe"] },
        { id: "bin_yuzenada", name: "Bingöl Yüzen Adalar Yolu", city: "Bingöl", keywords: ["yüzen ada", "solhan"] },
        { id: "bit_kale", name: "Tarihi Bitlis Kalesi", city: "Bitlis", keywords: ["bitlis kalesi", "beş minare"] },
        { id: "bol_abant", name: "Bolu Abant Yolu ve Meydanı", city: "Bolu", keywords: ["abant", "izzet baysal"] },
        { id: "bur_salda", name: "Burdur Salda Gölü Yolu", city: "Burdur", keywords: ["salda", "saat kulesi"] },
        { id: "brs_ulucami", name: "Bursa Tarihi Ulu Cami ve Heykel", city: "Bursa", keywords: ["ulu cami", "heykel", "zafer plaza"] },
        { id: "can_aynalicarsi", name: "Çanakkale Tarihi Aynalı Çarşı", city: "Çanakkale", keywords: ["aynalı çarşı", "kordon", "iskele"] },
        { id: "cnk_tuzmagara", name: "Çankırı Tarihi Tuz Mağarası Yolu", city: "Çankırı", keywords: ["tuz mağarası", "çarşı"] },
        { id: "crm_saatkule", name: "Çorum Saat Kulesi", city: "Çorum", keywords: ["saat kulesi", "hitit"] },
        { id: "den_pamukkale", name: "Pamukkale Travertenleri Yolu", city: "Denizli", keywords: ["pamukkale", "çınar"] },
        { id: "diy_surlar", name: "Diyarbakır Tarihi Surları ve Dağkapı", city: "Diyarbakır", keywords: ["dağkapı", "sur", "hevsel"] },
        { id: "edr_selimiye", name: "Tarihi Selimiye Camii", city: "Edirne", keywords: ["selimiye", "saraçlar", "meriç"] },
        { id: "ela_harput", name: "Tarihi Harput Kalesi Meydanı", city: "Elazığ", keywords: ["harput", "kale"] },
        { id: "erz_kanyon", name: "Kemaliye Karanlık Kanyon Yolu", city: "Erzincan", keywords: ["kemaliye", "dörtyol", "bakırcılar"] },
        { id: "erz_cifteminare", name: "Erzurum Tarihi Çifte Minareli Medrese", city: "Erzurum", keywords: ["çifte minare", "havuzbaşı", "yakutiye"] },
        { id: "esk_odunpazari", name: "Eskişehir Tarihi Odunpazarı Evleri", city: "Eskişehir", keywords: ["odunpazarı", "porsuk", "adalar"] },
        { id: "gaz_bakircilar", name: "Gaziantep Tarihi Bakırcılar Çarşısı", city: "Gaziantep", keywords: ["bakırcılar", "gaziantep kalesi", "maanoğlu"] },
        { id: "gir_kale", name: "Tarihi Giresun Kalesi", city: "Giresun", keywords: ["giresun kalesi", "meydan"] },
        { id: "gum_zigana", name: "Tarihi Zigana Geçidi Yolu", city: "Gümüşhane", keywords: ["zigana", "kuşakkaya"] },
        { id: "hak_sumbul", name: "Hakkari Sümbül Dağı Geçidi", city: "Hakkari", keywords: ["sümbül", "zap"] },
        { id: "hat_uzuncarsi", name: "Antakya Tarihi Uzun Çarşı", city: "Hatay", keywords: ["uzun çarşı", "habib-i neccar", "asi"] },
        { id: "isp_kaymakkapi", name: "Isparta Kaymakkapı Meydanı", city: "Isparta", keywords: ["kaymakkapı", "gül"] },
        { id: "mer_marina", name: "Mersin Marina Sahil Şeridi", city: "Mersin", keywords: ["marina", "sahil", "atatürk parkı"] },
        { id: "ist_bogazici", name: "15 Temmuz Şehitler Köprüsü", city: "İstanbul", keywords: ["boğaziçi", "köprü", "ortaköy"] },
        { id: "ist_esenler", name: "Büyük İstanbul Otogarı", city: "İstanbul", keywords: ["esenler", "büyük otogar", "otogar"] },
        { id: "ist_taksim", name: "Taksim Meydanı", city: "İstanbul", keywords: ["taksim", "istiklal"] },
        { id: "izm_kordon", name: "İzmir Kordon Sahili ve Alsancak", city: "İzmir", keywords: ["kordon", "alsancak"] },
        { id: "izm_saatkulesi", name: "Tarihi Konak Saat Kulesi", city: "İzmir", keywords: ["saat kulesi", "konak", "kemeraltı", "meydan"] },
        { id: "kar_kale", name: "Tarihi Kars Kalesi Meydanı", city: "Kars", keywords: ["kars kalesi", "ani"] },
        { id: "kas_nasrullah", name: "Kastamonu Nasrullah Meydanı", city: "Kastamonu", keywords: ["nasrullah", "saat kulesi"] },
        { id: "kay_cumhuriyet", name: "Kayseri Cumhuriyet Meydanı", city: "Kayseri", keywords: ["cumhuriyet meydanı", "kayseri kalesi", "erciyes"] },
        { id: "kik_vilayet", name: "Kırklareli Vilayet Meydanı", city: "Kırklareli", keywords: ["vilayet", "istasyon parkı"] },
        { id: "kir_ahievran", name: "Ahi Evran Meydanı", city: "Kırşehir", keywords: ["ahi evran", "cacabey"] },
        { id: "koc_sekapark", name: "Kocaeli Sekapark Sahil Alanı", city: "Kocaeli", keywords: ["sekapark", "saat kulesi", "izmit"] },
        { id: "kon_mevlana", name: "Tarihi Mevlana Meydanı", city: "Konya", keywords: ["mevlana", "alaaddin", "zafer"] },
        { id: "kut_vazo", name: "Kütahya Tarihi Vazo Meydanı", city: "Kütahya", keywords: ["vazo", "kütahya kale"] },
        { id: "mal_kernek", name: "Malatya Kernek Meydanı", city: "Malatya", keywords: ["kernek", "hükümet konağı"] },
        { id: "man_sehzadeler", name: "Manisa Şehzadeler Parkı", city: "Manisa", keywords: ["şehzadeler", "spil", "sultan camii"] },
        { id: "kma_kapalicarsi", name: "Kahramanmaraş Tarihi Kapalı Çarşı", city: "Kahramanmaraş", keywords: ["kapalı çarşı", "trabzon caddesi"] },
        { id: "mar_cumhuriyet", name: "Tarihi Mardin Cumhuriyet Meydanı", city: "Mardin", keywords: ["cumhuriyet meydanı", "eski mardin", "midyat"] },
        { id: "mug_bodrum", name: "Bodrum Tarihi Kalesi ve Limanı", city: "Muğla", keywords: ["bodrum", "marmaris", "kordon"] },
        { id: "mus_muratkopru", name: "Tarihi Murat Köprüsü Yolu", city: "Muş", keywords: ["murat köprüsü", "istasyon"] },
        { id: "nev_goreme", name: "Göreme Peri Bacaları Yolu", city: "Nevşehir", keywords: ["göreme", "peri bacaları", "avanos"] },
        { id: "nig_saatkule", name: "Niğde Tarihi Saat Kulesi", city: "Niğde", keywords: ["saat kulesi", "hükümet meydanı"] },
        { id: "ord_boztepe", name: "Boztepe Teleferik Meydanı", city: "Ordu", keywords: ["boztepe", "teleferik", "kordon"] },
        { id: "riz_kale", name: "Tarihi Rize Kalesi", city: "Rize", keywords: ["rize kalesi", "çaykur", "meydan"] },
        { id: "sak_cark", name: "Sakarya Tarihi Çark Caddesi", city: "Sakarya", keywords: ["çark caddesi", "kent meydanı", "adapazarı"] },
        { id: "sam_bandirma", name: "Tarihi Bandırma Vapuru Meydanı", city: "Samsun", keywords: ["bandırma vapuru", "ilkadım", "saathane"] },
        { id: "sii_veyselkarani", name: "Siirt Veysel Karani Meydanı", city: "Siirt", keywords: ["veysel karani", "saat kulesi"] },
        { id: "sin_cezaevi", name: "Tarihi Sinop Cezaevi ve Limanı", city: "Sinop", keywords: ["sinop cezaevi", "liman", "kordon"] },
        { id: "siv_cifteminare", name: "Sivas Tarihi Çifte Minareli Medrese", city: "Sivas", keywords: ["çifte minare", "buruciye", "istasyon"] },
        { id: "tok_tashan", name: "Tokat Tarihi Taşhan", city: "Tokat", keywords: ["taşhan", "saat kulesi"] },
        { id: "tra_meydan", name: "Trabzon Atatürk Alanı Meydan Parkı", city: "Trabzon", keywords: ["meydan parkı", "atatürk alanı", "boztepe"] },
        { id: "tun_munzur", name: "Munzur Vadisi Girişi", city: "Tunceli", keywords: ["munzur", "seyit rıza"] },
        { id: "san_balikli", name: "Tarihi Balıklıgöl Meydanı", city: "Şanlıurfa", keywords: ["balıklıgöl", "dergah", "haşimiye"] },
        { id: "usa_gar", name: "Uşak Tarihi Tren Garı", city: "Uşak", keywords: ["tren garı", "ismet paşa"] },
        { id: "van_kale", name: "Tarihi Van Kalesi ve İskelesi", city: "Van", keywords: ["van kalesi", "beşyol", "iskele"] },
        { id: "yoz_saatkule", name: "Yozgat Tarihi Saat Kulesi", city: "Yozgat", keywords: ["saat kulesi", "çamlık"] },
        { id: "zon_maden", name: "Zonguldak Maden Müzesi ve Fener Sahili", city: "Zonguldak", keywords: ["maden müzesi", "fener", "sahil"] },
        { id: "aks_egriminare", name: "Aksaray Tarihi Eğri Minare", city: "Aksaray", keywords: ["eğri minare", "hükümet meydanı"] },
        { id: "bay_kale", name: "Tarihi Bayburt Kalesi", city: "Bayburt", keywords: ["bayburt kalesi", "saat kulesi"] },
        { id: "krm_aktekke", name: "Karaman Tarihi Aktekke Meydanı", city: "Karaman", keywords: ["aktekke", "yunus emre"] },
        { id: "krk_cumhuriyet", name: "Kırıkkale Cumhuriyet Meydanı", city: "Kırıkkale", keywords: ["cumhuriyet meydanı", "mke"] },
        { id: "bat_malabadi", name: "Tarihi Malabadi Köprüsü Yolu", city: "Batman", keywords: ["malabadi", "hasankeyf", "turgut özal"] },
        { id: "sir_cudi", name: "Cudi Dağı Seyir Meydanı", city: "Şırnak", keywords: ["cudi", "cumhuriyet meydanı"] },
        { id: "bar_amasra", name: "Tarihi Amasra Kalesi ve Çarşısı", city: "Bartın", keywords: ["amasra", "çekiciler çarşısı", "liman"] },
        { id: "ard_kale", name: "Tarihi Ardahan Kalesi", city: "Ardahan", keywords: ["ardahan kalesi", "kura nehri"] },
        { id: "igd_anit", name: "Iğdır Tarihi Kılıçlar Meydanı", city: "Iğdır", keywords: ["kılıçlar", "hükümet meydanı", "ağrı dağı"] },
        { id: "yal_yuruyenkosk", name: "Tarihi Yürüyen Köşk ve İskele", city: "Yalova", keywords: ["yürüyen köşk", "iskele", "cumhuriyet meydanı"] },
        { id: "kbb_safranbolu", name: "Tarihi Safranbolu Çarşısı", city: "Karabük", keywords: ["safranbolu", "hıdırlık", "çarşı"] },
        { id: "kls_ravanda", name: "Tarihi Ravanda Kalesi Meydanı", city: "Kilis", keywords: ["ravanda", "cumhuriyet meydanı"] },
        { id: "osm_karatepe", name: "Tarihi Karatepe Aslantaş Yolu", city: "Osmaniye", keywords: ["karatepe", "devlet bahçeli meydanı"] },
        { id: "duz_akcakoca", name: "Akçakoca Sahil Meydanı", city: "Düzce", keywords: ["akçakoca", "anıtpark", "sahil"] }
    ];

    const CityLandmarksEngine = {
        lastAnnouncedId: null,
        currentNearby: null,

        /**
         * Durağa henüz yaklaşırken rota hazırlığında çağrılır (SESLENDİRME YAPMAZ, sessizce hafızaya alır)
         */
        prepareStop: function(cityName, districtName, stopName) {
            this.currentNearby = this.matchLandmark(cityName, districtName, stopName);
        },

        /**
         * Yalnızca durağa tam varılınca (arriveAtStop anında) çağrılır
         * Kural: Sadece yerin adını ekran okuyucu sesli okur. Bilgi/ders vermez.
         */
        onArriveAtStop: function(cityName, districtName, stopName) {
            const matched = this.matchLandmark(cityName, districtName, stopName);
            this.currentNearby = matched;

            if (matched && matched.id !== this.lastAnnouncedId) {
                this.lastAnnouncedId = matched.id;
                this.announceLandmark(matched);
            }
        },

        /**
         * Geriye uyumluluk için durak kontrol fonksiyonu
         */
        checkStopForLandmark: function(cityName, districtName, stopName) {
            this.onArriveAtStop(cityName, districtName, stopName);
        },

        /**
         * İl, ilçe ve durak adına göre simge noktayı eşleştirir
         */
        matchLandmark: function(cityName, districtName, stopName) {
            const city = cityName || "Tekirdağ";
            const dist = (districtName || "").toLowerCase();
            const sName = (stopName || "").toLowerCase();

            let matched = null;
            // 1. Şehir + İlçe eşleşmesi
            for (let l of CITY_LANDMARKS) {
                if (l.city && l.city !== city) continue;
                if (l.district && dist && l.district.toLowerCase() !== dist) continue;

                if (l.keywords && l.keywords.some(k => sName.includes(k))) {
                    matched = l;
                    break;
                }
            }

            // 2. Şehir bazlı genel eşleşme
            if (!matched) {
                for (let l of CITY_LANDMARKS) {
                    if (l.city && l.city !== city) continue;
                    if (l.keywords && l.keywords.some(k => sName.includes(k))) {
                        matched = l;
                        break;
                    }
                }
            }

            // 3. İsim içinde doğrudan il/nokta geçiyorsa
            if (!matched) {
                for (let l of CITY_LANDMARKS) {
                    if (sName.includes(l.name.toLowerCase())) {
                        matched = l;
                        break;
                    }
                }
            }

            return matched;
        },

        /**
         * Kullanıcı kuralı: "Sadece gelince oraları ekran okuyucu sesli okusun. Bilgi vermesin."
         * Sadece yerin temiz adını anons eder; ansiklopedik rehberlik/bilgi vermez.
         */
        announceLandmark: function(landmark) {
            if (!landmark) return;

            const cleanName = landmark.name;

            // Ekran okuyucu canlı alanı (NVDA / JAWS)
            if (typeof audio !== 'undefined' && typeof audio.updateNvdaLiveRegion === 'function') {
                audio.updateNvdaLiveRegion("📍 " + cleanName);
            }

            // Sesli okuma (TTS)
            if (typeof audio !== 'undefined' && typeof audio.speak === 'function') {
                audio.speak(cleanName);
            }

            // Görsel HUD Toast bildirimi
            if (typeof UI !== 'undefined' && typeof UI.showToast === 'function') {
                UI.showToast("📍 " + cleanName, "info");
            }
        },

        /**
         * Shift + P Kısayolu: Kaptan istediğinde yakındaki simge noktayı tek net isimle bildirir
         */
        speakNearbyLandmark: function(game) {
            if (this.currentNearby) {
                const cleanName = this.currentNearby.name;
                if (typeof audio !== 'undefined' && typeof audio.speak === 'function') {
                    audio.speak(cleanName);
                }
                if (typeof audio !== 'undefined' && typeof audio.updateNvdaLiveRegion === 'function') {
                    audio.updateNvdaLiveRegion("📍 " + cleanName);
                }
                if (typeof UI !== 'undefined' && typeof UI.showToast === 'function') {
                    UI.showToast("📍 " + cleanName, 'info');
                }
            } else {
                const msg = "Yakında simge nokta bulunmuyor.";
                if (typeof audio !== 'undefined' && typeof audio.speak === 'function') {
                    audio.speak(msg);
                }
                if (typeof audio !== 'undefined' && typeof audio.updateNvdaLiveRegion === 'function') {
                    audio.updateNvdaLiveRegion(msg);
                }
            }
        }
    };

    window.CityLandmarksEngine = CityLandmarksEngine;

})(typeof window !== 'undefined' ? window : globalThis);
