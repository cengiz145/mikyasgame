/* ==========================================================================
   SARAY İLÇE VE MAHALLELERİ NAVİGASYON MOTORU
   Saray Merkez, Ayaspaşa, Pazarcık, Yeni Mahalle, Kemalpaşa,
   Büyükyoncalı ve Çukuryurt sokakları arasında akıllı formülsel rota motoru.
   ========================================================================== */

const SarayNavigasyon = {
    sokaklar: [
        // --- AYASPAŞA MAHALLESİ (SARAY ÇARŞI / MERKEZ) ---
        { name: "Saray Belediyesi (Cumhuriyet Meydanı)", mahalle: "Ayaspaşa", lat: 41.4422, lon: 27.9204, cat: "İlçe Merkezi", id: "saray_sk_1", anons: "Saray Belediyesi Cumhuriyet Meydanı durağındayız." },
        { name: "Atatürk Caddesi Çarşı", mahalle: "Ayaspaşa", lat: 41.4411, lon: 27.9199, cat: "Ana Cadde", id: "saray_sk_2", anons: "Sonraki durak: Atatürk Caddesi Çarşı." },
        { name: "Cumhuriyet Caddesi Çarşı", mahalle: "Ayaspaşa", lat: 41.4463, lon: 27.9109, cat: "Ana Cadde", id: "saray_sk_3", anons: "Sonraki durak: Cumhuriyet Caddesi Çarşı." },
        { name: "Cumhuriyet Caddesi Park Mevkii", mahalle: "Ayaspaşa", lat: 41.4452, lon: 27.9131, cat: "Cadde", id: "saray_sk_4", anons: "Sonraki durak: Cumhuriyet Caddesi Park Mevkii." },
        { name: "Cumhuriyet Caddesi Trafo", mahalle: "Ayaspaşa", lat: 41.4432, lon: 27.9164, cat: "Cadde", id: "saray_sk_5", anons: "Sonraki durak: Cumhuriyet Caddesi Trafo." },
        { name: "Uğur Mumcu Caddesi", mahalle: "Ayaspaşa", lat: 41.4443, lon: 27.9178, cat: "Ana Cadde", id: "saray_sk_6", anons: "Sonraki durak: Uğur Mumcu Caddesi." },
        { name: "Saray Hükümet Caddesi (İlçe Meydanı)", mahalle: "Ayaspaşa", lat: 41.4435, lon: 27.9190, cat: "Merkez", id: "saray_sk_7", anons: "Sonraki durak: Saray Hükümet Caddesi İlçe Meydanı." },
        { name: "Vatan Caddesi", mahalle: "Ayaspaşa", lat: 41.4450, lon: 27.9185, cat: "Cadde", id: "saray_sk_8", anons: "Sonraki durak: Vatan Caddesi." },
        { name: "Gazi Caddesi", mahalle: "Ayaspaşa", lat: 41.4440, lon: 27.9215, cat: "Cadde", id: "saray_sk_9", anons: "Sonraki durak: Gazi Caddesi." },
        { name: "Namık Kemal Caddesi", mahalle: "Ayaspaşa", lat: 41.4418, lon: 27.9220, cat: "Cadde", id: "saray_sk_10", anons: "Sonraki durak: Namık Kemal Caddesi." },
        { name: "Mithatpaşa Caddesi", mahalle: "Ayaspaşa", lat: 41.4430, lon: 27.9200, cat: "Cadde", id: "saray_sk_11", anons: "Sonraki durak: Mithatpaşa Caddesi." },
        { name: "Bülbül Sokak", mahalle: "Ayaspaşa", lat: 41.4425, lon: 27.9180, cat: "Sokak", id: "saray_sk_12", anons: "Sonraki durak: Bülbül Sokak." },

        // --- PAZARCIK MAHALLESİ (OTOGAR & KUZEY AKS) ---
        { name: "Saray Otogar 1 (Giriş Peronu)", mahalle: "Pazarcık", lat: 41.4408, lon: 27.9211, cat: "Terminal", id: "saray_sk_13", anons: "Saray Otogar 1 Giriş Peronundayız." },
        { name: "Saray Otogar 2 (Çıkış Peronu)", mahalle: "Pazarcık", lat: 41.4409, lon: 27.9214, cat: "Terminal", id: "saray_sk_14", anons: "Sonraki durak: Saray Otogar 2 Çıkış Peronu." },
        { name: "Pazarcık Sağlık Ocağı", mahalle: "Pazarcık", lat: 41.4499, lon: 27.9320, cat: "Sağlık", id: "saray_sk_15", anons: "Sonraki durak: Pazarcık Sağlık Ocağı." },
        { name: "Ayvacık Caddesi 1", mahalle: "Pazarcık", lat: 41.4512, lon: 27.9287, cat: "Cadde", id: "saray_sk_16", anons: "Sonraki durak: Ayvacık Caddesi 1." },
        { name: "Ayvacık Caddesi 2", mahalle: "Pazarcık", lat: 41.4529, lon: 27.9295, cat: "Cadde", id: "saray_sk_17", anons: "Sonraki durak: Ayvacık Caddesi 2." },
        { name: "Türkan Bebek Parkı", mahalle: "Pazarcık", lat: 41.4531, lon: 27.9274, cat: "Park / Meydan", id: "saray_sk_18", anons: "Sonraki durak: Türkan Bebek Parkı." },
        { name: "Depo Caddesi 1", mahalle: "Pazarcık", lat: 41.4424, lon: 27.9239, cat: "Cadde", id: "saray_sk_19", anons: "Sonraki durak: Depo Caddesi 1." },
        { name: "Depo Caddesi 2", mahalle: "Pazarcık", lat: 41.4397, lon: 27.9259, cat: "Cadde", id: "saray_sk_20", anons: "Sonraki durak: Depo Caddesi 2." },
        { name: "Midye Caddesi 1", mahalle: "Pazarcık", lat: 41.4474, lon: 27.9293, cat: "Cadde", id: "saray_sk_21", anons: "Sonraki durak: Midye Caddesi 1." },
        { name: "Midye Sokak 2", mahalle: "Pazarcık", lat: 41.4516, lon: 27.9345, cat: "Sokak", id: "saray_sk_22", anons: "Sonraki durak: Midye Sokak 2." },
        { name: "İstanbul Caddesi 1", mahalle: "Pazarcık", lat: 41.4447, lon: 27.9259, cat: "Ana Arter", id: "saray_sk_23", anons: "Sonraki durak: İstanbul Caddesi 1." },
        { name: "İstanbul Caddesi 2", mahalle: "Pazarcık", lat: 41.4464, lon: 27.9279, cat: "Ana Arter", id: "saray_sk_24", anons: "Sonraki durak: İstanbul Caddesi 2." },
        { name: "Saray Asayiş Parkı", mahalle: "Pazarcık", lat: 41.4438, lon: 27.9252, cat: "Merkez", id: "saray_sk_25", anons: "Sonraki durak: Saray Asayiş Parkı." },

        // --- YENİ MAHALLE (DEVLET HASTANESİ & FAKÜLTE AKS) ---
        { name: "Saray Devlet Hastanesi Ana Giriş", mahalle: "Yeni Mahalle", lat: 41.4380, lon: 27.9307, cat: "Sağlık", id: "saray_sk_26", anons: "Sonraki durak: Saray Devlet Hastanesi Ana Giriş." },
        { name: "Saray Devlet Hastanesi Acil", mahalle: "Yeni Mahalle", lat: 41.4375, lon: 27.9312, cat: "Sağlık", id: "saray_sk_27", anons: "Sonraki durak: Saray Devlet Hastanesi Acil Servis." },
        { name: "Millet Caddesi 1", mahalle: "Yeni Mahalle", lat: 41.4455, lon: 27.9229, cat: "Cadde", id: "saray_sk_28", anons: "Sonraki durak: Millet Caddesi 1." },
        { name: "Millet Caddesi 2", mahalle: "Yeni Mahalle", lat: 41.4439, lon: 27.9249, cat: "Cadde", id: "saray_sk_29", anons: "Sonraki durak: Millet Caddesi 2." },
        { name: "Saray Meslek Yüksekokulu (Fakülte Kampüs)", mahalle: "Yeni Mahalle", lat: 41.4365, lon: 27.9270, cat: "Eğitim Kampüsü", id: "saray_sk_30", anons: "Sonraki durak: Saray Meslek Yüksekokulu Fakülte Kampüsü." },
        { name: "Mehmet Uygun İlköğretim Okulu", mahalle: "Yeni Mahalle", lat: 41.4512, lon: 27.9249, cat: "Okul", id: "saray_sk_31", anons: "Sonraki durak: Mehmet Uygun İlköğretim Okulu." },
        { name: "Saray Caddesi 1", mahalle: "Yeni Mahalle", lat: 41.4495, lon: 27.9236, cat: "Cadde", id: "saray_sk_32", anons: "Sonraki durak: Saray Caddesi 1." },
        { name: "Orkide Caddesi 1", mahalle: "Yeni Mahalle", lat: 41.4475, lon: 27.9218, cat: "Cadde", id: "saray_sk_33", anons: "Sonraki durak: Orkide Caddesi 1." },
        { name: "Güneş Sokak", mahalle: "Yeni Mahalle", lat: 41.4460, lon: 27.9240, cat: "Sokak", id: "saray_sk_34", anons: "Sonraki durak: Güneş Sokak." },
        { name: "Karanfil Sokak", mahalle: "Yeni Mahalle", lat: 41.4480, lon: 27.9260, cat: "Sokak", id: "saray_sk_35", anons: "Sonraki durak: Karanfil Sokak." },

        // --- KEMALPAŞA MAHALLESİ (BATI VE GÜNEY BÖLGESİ) ---
        { name: "100. Yıl Atatürk Caddesi 1", mahalle: "Kemalpaşa", lat: 41.4367, lon: 27.9157, cat: "Cadde", id: "saray_sk_36", anons: "Sonraki durak: 100. Yıl Atatürk Caddesi 1." },
        { name: "100. Yıl Atatürk Caddesi 2", mahalle: "Kemalpaşa", lat: 41.4353, lon: 27.9138, cat: "Cadde", id: "saray_sk_37", anons: "Sonraki durak: 100. Yıl Atatürk Caddesi 2." },
        { name: "100. Yıl Atatürk Caddesi 3", mahalle: "Kemalpaşa", lat: 41.4340, lon: 27.9124, cat: "Cadde", id: "saray_sk_38", anons: "Sonraki durak: 100. Yıl Atatürk Caddesi 3." },
        { name: "Ladin Sokak Parkı", mahalle: "Kemalpaşa", lat: 41.4325, lon: 27.9109, cat: "Sokak", id: "saray_sk_39", anons: "Sonraki durak: Ladin Sokak Parkı." },
        { name: "Mezarlık Caddesi 1", mahalle: "Kemalpaşa", lat: 41.4388, lon: 27.9167, cat: "Cadde", id: "saray_sk_40", anons: "Sonraki durak: Mezarlık Caddesi 1." },
        { name: "Mezarlık Caddesi 2", mahalle: "Kemalpaşa", lat: 41.4417, lon: 27.9124, cat: "Cadde", id: "saray_sk_41", anons: "Sonraki durak: Mezarlık Caddesi 2." },
        { name: "Mezarlık Caddesi 3", mahalle: "Kemalpaşa", lat: 41.4457, lon: 27.9088, cat: "Cadde", id: "saray_sk_42", anons: "Sonraki durak: Mezarlık Caddesi 3." },
        { name: "Saray Hastane Caddesi 1", mahalle: "Kemalpaşa", lat: 41.4423, lon: 27.9103, cat: "Cadde", id: "saray_sk_43", anons: "Sonraki durak: Saray Hastane Caddesi 1." },
        { name: "Hastane Caddesi 2", mahalle: "Kemalpaşa", lat: 41.4427, lon: 27.9069, cat: "Cadde", id: "saray_sk_44", anons: "Sonraki durak: Hastane Caddesi 2." },
        { name: "Hastane Caddesi 3", mahalle: "Kemalpaşa", lat: 41.4433, lon: 27.9036, cat: "Cadde", id: "saray_sk_45", anons: "Sonraki durak: Hastane Caddesi 3." },
        { name: "Remzi Saker Parkı", mahalle: "Kemalpaşa", lat: 41.4451, lon: 27.9056, cat: "Park", id: "saray_sk_46", anons: "Sonraki durak: Remzi Saker Parkı." },
        { name: "Şehit Mustafa Öğden Caddesi", mahalle: "Kemalpaşa", lat: 41.4430, lon: 27.9080, cat: "Cadde", id: "saray_sk_47", anons: "Sonraki durak: Şehit Mustafa Öğden Caddesi." },

        // --- BÜYÜKYONCALI VE ÇEVRE MAHALLELER ---
        { name: "Büyükyoncalı Giriş Kavşağı", mahalle: "Büyükyoncalı", lat: 41.3850, lon: 27.9550, cat: "Kavşak", id: "saray_sk_48", anons: "Sonraki durak: Büyükyoncalı Giriş Kavşağı." },
        { name: "Büyükyoncalı Merkez (Belediye Binası)", mahalle: "Büyükyoncalı", lat: 41.3800, lon: 27.9620, cat: "Meydan", id: "saray_sk_49", anons: "Sonraki durak: Büyükyoncalı Merkez Belediye Meydanı." },
        { name: "Büyükyoncalı 1. Hat Meydan", mahalle: "Büyükyoncalı", lat: 41.3820, lon: 27.9640, cat: "Durak", id: "saray_sk_50", anons: "Sonraki durak: Büyükyoncalı 1. Hat Meydan." },
        { name: "Yeniköy Kavşağı (Yoncalı)", mahalle: "Büyükyoncalı", lat: 41.3980, lon: 27.9450, cat: "Kavşak", id: "saray_sk_51", anons: "Sonraki durak: Yeniköy Kavşağı." },
        { name: "Saray Çukuryurt Sapağı", mahalle: "Çukuryurt", lat: 41.4200, lon: 27.9350, cat: "Kavşak", id: "saray_sk_52", anons: "Sonraki durak: Saray Çukuryurt Sapağı." },
        { name: "Çukuryurt Köy Meydanı", mahalle: "Çukuryurt", lat: 41.4150, lon: 27.9400, cat: "Köy İçi", id: "saray_sk_53", anons: "Sonraki durak: Çukuryurt Köy Meydanı." },
        { name: "Beyazköy Sapağı", mahalle: "Beyazköy", lat: 41.4050, lon: 27.9250, cat: "Kavşak", id: "saray_sk_54", anons: "Sonraki durak: Beyazköy Sapağı." },
        { name: "Edirköy Bağlantısı", mahalle: "Edirköy", lat: 41.4550, lon: 27.9100, cat: "Kırsal Aks", id: "saray_sk_55", anons: "Sonraki durak: Edirköy Bağlantısı." }
    ],

    _otherDistrictTokens: [
        'suleymanpasa', 'corlu', 'cerkezkoy', 'kapakli', 'malkara',
        'muratli', 'hayrabolu', 'sarkoy', 'marmaraereglisi', 'ergene',
        'velimese', 'kumbağ', 'kumbag', 'degirmenalti', 'namik kemal universitesi'
    ],

    _genericStopWords: new Set([
        'cadde', 'caddesi', 'sokak', 'sokagi', 'bulvar', 'bulvari',
        'mahalle', 'mahallesi', 'park', 'parki', 'meydan', 'meydani',
        'kavsak', 'kavsagi', 'durak', 'duragi', 'merkez', 'merkezi',
        'ilce', 'sehir', 'ici', 'ana', 'giris', 'cikis', 'peron', 'peronu'
    ]),

    normalizeText: function(text) {
        if (text === null || text === undefined) return '';
        return String(text).replace(/İ/g, 'i').replace(/I/g, 'i').replace(/ı/g, 'i').toLowerCase()
            .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's').replace(/ö/g, 'o').replace(/ç/g, 'c')
            .replace(/[^a-z0-9]/g, ' ').replace(/\s+/g, ' ').trim();
    },

    stemWord: function(w) {
        if (!w || w.length < 5) return w;
        return w.replace(/(lari|leri|sini|sine|sinda|ndan|nden|nin|nun|dan|den|si|su|yi|yu|i|u)$/, '');
    },

    findSokak: function(query) {
        if (!query) return null;
        const qNorm = this.normalizeText(query);
        if (!qNorm) return null;

        // Başka bir ilçe açıkça yazılmışsa Saray durağı ile yanlış eşleştirme yapma!
        if (!qNorm.includes('saray')) {
            for (let i = 0; i < this._otherDistrictTokens.length; i++) {
                if (qNorm.includes(this._otherDistrictTokens[i])) return null;
            }
        }

        // ID ile doğrudan eşleşme desteği
        const byId = this.sokaklar.find(s => s.id === query || this.normalizeText(s.id) === qNorm);
        if (byId) return byId;

        // 1. Tam isim eşleşmesi
        let matched = this.sokaklar.find(s => this.normalizeText(s.name) === qNorm);
        if (matched) return matched;

        const qWords = qNorm.split(' ').filter(w => w.length > 0);
        const significantWords = qWords.filter(w => w.length > 1 && !this._genericStopWords.has(w));
        if (significantWords.length === 0) return null;

        const hasExplicitSarayContext = qNorm.includes('saray') ||
            qNorm.includes('buyukyoncali') || qNorm.includes('yoncali') ||
            qNorm.includes('cukuryurt') || qNorm.includes('ayaspasa') ||
            qNorm.includes('pazarcik') || (typeof Game !== 'undefined' && Game.activeDistrict === 'Saray');

        const wordMatchesTarget = (w, targetNorm) => {
            if (targetNorm.includes(w)) return true;
            const stem = this.stemWord(w);
            return Boolean(stem && stem.length >= 4 && targetNorm.includes(stem));
        };

        if (qNorm.includes("100 yil") && (hasExplicitSarayContext || qNorm.includes("parklar"))) {
            const m100 = this.sokaklar.find(s => s.id === "saray_sk_36" || s.name.includes("100. Yıl"));
            if (m100) return m100;
        }

        // 2. Tüm sorgu kelimelerinin (nitelik kelimeleri dahil: "Büyükyoncalı Merkez", "Otogar 2 Çıkış" vb.) tam eşleşmesi, ardından anlamlı kelime eşleşmesi
        matched = this.sokaklar.find(s => {
            const fullTarget = this.normalizeText(s.name + ' ' + (s.mahalle || ''));
            return qWords.every(w => wordMatchesTarget(w, fullTarget));
        }) || this.sokaklar.find(s => {
            const fullTarget = this.normalizeText(s.name + ' ' + (s.mahalle || ''));
            return significantWords.every(w => wordMatchesTarget(w, fullTarget));
        });
        if (matched) {
            // Eğer sorguda Saray bağlamı yoksa, sadece diğer ilçelerde de yaygın olan genel tek kelimeleri ("otogar", "hastane", "ataturk", "cumhuriyet") Saray'a kaçırma!
            const nonSaraySpecific = new Set(['otogar', 'otogari', 'hastane', 'hastanesi', 'devlet', 'ataturk', 'cumhuriyet', 'hukumet', 'belediye', 'belediyesi', 'vatan', 'gazi', 'millet', 'mezarlik', 'okul', 'fakulte', 'kampus']);
            const hasUniqueSarayStreet = significantWords.some(w => !nonSaraySpecific.has(w));
            if (hasExplicitSarayContext || hasUniqueSarayStreet) {
                return matched;
            }
            return null;
        }

        // 3. Kontrollü puanlamalı kısmi eşleşme (Yalnızca açık Saray bağlamı varsa veya Saray'a özgü özel isim geçiyorsa!)
        if (!hasExplicitSarayContext) return null;

        const nonDistrictWords = significantWords.filter(w => w !== 'saray');
        if (nonDistrictWords.length === 0) {
            return this.sokaklar[0]; // Sadece "Saray" denirse Saray Belediyesi (Cumhuriyet Meydanı)
        }

        let bestSokak = null;
        let bestScore = 0;
        for (let i = 0; i < this.sokaklar.length; i++) {
            const s = this.sokaklar[i];
            const fullTarget = this.normalizeText(s.name + ' ' + (s.mahalle || ''));
            let score = 0;
            for (let j = 0; j < nonDistrictWords.length; j++) {
                const w = nonDistrictWords[j];
                if (w.length >= 3 && wordMatchesTarget(w, fullTarget)) {
                    score += (w.length >= 5 ? 3 : 2);
                }
            }
            if (score > bestScore) {
                bestScore = score;
                bestSokak = s;
            }
        }
        return bestScore > 0 ? bestSokak : null;
    },

    haversine: function(lat1, lon1, lat2, lon2) {
        const R = 6371; // km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                  Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                  Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    },

    rotaOlustur: function(kalkisSorgu, varisSorgu) {
        const kalkis = this.findSokak(kalkisSorgu);
        const varis = this.findSokak(varisSorgu);

        if (!kalkis || !varis) {
            return {
                success: false,
                message: "Saray içinde belirtilen durak veya sokak bulunamadı."
            };
        }

        if (kalkis.id === varis.id) {
            return {
                success: false,
                message: "Kalkış ve varış noktaları aynı olamaz."
            };
        }

        // Kuş uçuşu mesafe
        const directDist = this.haversine(kalkis.lat, kalkis.lon, varis.lat, varis.lon);

        // Güzergâh üzerindeki ara durakları koridor ve ilerleme sırasına göre seç (kümelenme ve geri dönüşleri önle)
        const candidates = this.sokaklar.filter(s => s.id !== kalkis.id && s.id !== varis.id);
        const corridor = [];

        candidates.forEach(s => {
            const d1 = this.haversine(kalkis.lat, kalkis.lon, s.lat, s.lon);
            const d2 = this.haversine(s.lat, s.lon, varis.lat, varis.lon);
            if (d1 >= 0.15 && d2 >= 0.15 && (d1 + d2 <= Math.max(directDist * 1.38, directDist + 0.45))) {
                corridor.push({ sokak: s, d1: d1 });
            }
        });

        corridor.sort((a, b) => a.d1 - b.d1);

        const maxIntermediates = Math.min(6, Math.max(1, Math.round(directDist / 0.45)));
        const selectedIntermediates = [];
        if (corridor.length > 0) {
            for (let k = 1; k <= maxIntermediates; k++) {
                const targetD1 = (directDist * k) / (maxIntermediates + 1);
                let bestItem = null;
                let bestDiff = Infinity;
                for (let i = 0; i < corridor.length; i++) {
                    const cand = corridor[i].sokak;
                    if (selectedIntermediates.includes(cand)) continue;
                    const prevPicked = selectedIntermediates.length > 0 ? selectedIntermediates[selectedIntermediates.length - 1] : kalkis;
                    if (corridor[i].d1 <= (selectedIntermediates.length > 0 ? this.haversine(kalkis.lat, kalkis.lon, prevPicked.lat, prevPicked.lon) : 0)) continue;
                    if (this.haversine(prevPicked.lat, prevPicked.lon, cand.lat, cand.lon) < 0.18) continue;
                    const diff = Math.abs(corridor[i].d1 - targetD1);
                    if (diff < bestDiff) {
                        bestDiff = diff;
                        bestItem = cand;
                    }
                }
                if (bestItem) selectedIntermediates.push(bestItem);
            }
        }

        // Tam durak listesi
        const fullStops = [kalkis, ...selectedIntermediates, varis];
        const routeStops = [];

        for (let i = 0; i < fullStops.length; i++) {
            const curr = fullStops[i];
            const next = fullStops[i + 1];
            let segDist = 0;
            if (next) {
                segDist = Math.max(0.4, Math.round(this.haversine(curr.lat, curr.lon, next.lat, next.lon) * 1.25 * 10) / 10);
            }

            const isFirst = i === 0;
            const isLast = i === fullStops.length - 1;

            let anons = "Sonraki durak: " + curr.name + ".";
            if (isFirst) {
                anons = curr.name + " durağındayız. Saray içi sefer başlıyor.";
            } else if (isLast) {
                anons = "Son durak: " + curr.name + ". Seferimiz tamamlanmıştır. Lütfen eşyalarınızı unutmayınız.";
            }

            const catLower = (curr.cat || '').toLowerCase();
            const yolcuTipi = (catLower.includes('okul') || catLower.includes('eğitim') || catLower.includes('kampüs'))
                ? "Öğrenci"
                : (catLower.includes('sağlık') ? "Yaşlı" : "Sivil");

            routeStops.push({
                name: curr.name,
                mahalle: curr.mahalle || "Saray Merkez",
                cat: curr.cat || "Durak",
                yolcuTipi: yolcuTipi,
                anons: anons,
                bekleyenYolcu: isFirst ? 10 : (isLast ? 0 : (((i * 3 + 2) % 6) + 2)),
                inenYolcu: isFirst ? 0 : (isLast ? 10 : (((i * 2 + 1) % 4) + 1)),
                garajMesafeKm: isFirst ? 0.85 : undefined,
                gercekMesafeSonraki: segDist,
                lat: curr.lat,
                lon: curr.lon
            });
        }

        const calculatedKm = routeStops.reduce((sum, s) => sum + (s.gercekMesafeSonraki || 0), 0);
        const finalKm = Math.max(1.0, Math.round(calculatedKm * 10) / 10);
        const seferDk = Math.max(6, Math.round((finalKm / 28) * 60 + routeStops.length * 1.2));

        const routeId = "saray_nav_" + kalkis.id + "_" + varis.id;
        const route = {
            id: routeId,
            hatNo: "Saray İçi",
            name: "Saray İçi: " + kalkis.name + " ➔ " + varis.name,
            rawName: "Saray Şehir İçi Ulaşım (" + (kalkis ? kalkis.name : 'Kalkış') + " - " + (varis ? varis.name : 'Varış') + ")",
            district: "Saray",
            ilce: "Saray",
            originDistrict: "Saray",
            destDistrict: "Saray",
            isDistrict: false,
            isCity: true,
            licenseLevel: 2,
            sehir: "Tekirdağ",
            color: "#0284c7",
            startStop: kalkis.name,
            endStop: varis.name,
            intermediateStops: routeStops.slice(1, -1).map(s => s.name),
            totalKm: finalKm,
            totalDistanceKm: finalKm,
            seferSuresiDk: seferDk,
            biletFiyat: 18,
            biletFiyatMultiplier: 1.0,
            otobusKapasitesi: 32,
            terrain: "mahalle_asfalt",
            desc: "Saray Şehir İçi Ulaşım: " + kalkis.name + " ➔ " + varis.name + ". Toplam " + routeStops.length + " durak, " + finalKm + " km. Tahmini süre: " + seferDk + " dakika.",
            speechBriefing: "Saray şehir içi seferi oluşturuldu. " + kalkis.name + " durağından " + varis.name + " durağına hareket ediliyor. Güzergâh boyunca " + routeStops.length + " durakta durulacaktır. Toplam " + finalKm + " kilometre.",
            detailedInstructions: "Saray Şehir İçi Seferi\n" +
                routeStops.map((s, idx) => (idx + 1) + ". Adım: " + s.name + (idx === routeStops.length - 1 ? " (Son Durak)" : "")).join('\n'),
            stops: routeStops
        };

        if (typeof routesData !== 'undefined') {
            routesData[routeId] = route;
        }
        if (typeof sehirRotalari !== 'undefined' && sehirRotalari["Tekirdağ"]) {
            if (!Array.isArray(sehirRotalari["Tekirdağ"].routes)) {
                sehirRotalari["Tekirdağ"].routes = [];
            }
            if (!sehirRotalari["Tekirdağ"].routes.includes(routeId)) {
                sehirRotalari["Tekirdağ"].routes.push(routeId);
            }
        }

        return {
            success: true,
            route: route,
            kalkis: kalkis,
            varis: varis,
            totalKm: finalKm,
            stopsCount: routeStops.length
        };
    },

    baslat: function(kalkisSorgu, varisSorgu) {
        if (typeof Game !== 'undefined' && typeof Game.hasPassedLevel10 === 'function' && !Game.hasPassedLevel10() && Game.playMode !== 'free_drive') {
            const lockMsg = "Saray ilçe içi seferlerine geçebilmek için önce Süleymanpaşa başlangıç etabındaki 10 görevi tamamlamalısınız.";
            if (typeof audio !== 'undefined' && audio.speak) audio.speak(lockMsg);
            if (typeof UI !== 'undefined' && UI.showToast) UI.showToast("🔒 " + lockMsg, "warning");
            return false;
        }

        const res = this.rotaOlustur(kalkisSorgu, varisSorgu);
        if (!res.success) {
            if (typeof audio !== 'undefined' && audio.speak) audio.speak(res.message);
            if (typeof UI !== 'undefined' && UI.showToast) UI.showToast(res.message, "warning");
            return false;
        }

        if (typeof Game !== 'undefined' && typeof Game.startRoute === 'function') {
            const prevDistrict = Game.activeDistrict;
            Game.currentCity = "Tekirdağ";
            Game.activeDistrict = "Saray";
            const started = Game.startRoute(res.route.id);
            if (started === false) {
                Game.activeDistrict = prevDistrict;
                return false;
            }
            if (typeof UI !== 'undefined' && UI.showToast) {
                UI.showToast("🏘️ Saray Şehir İçi Sefer: " + res.kalkis.name + " ➔ " + res.varis.name, "success");
            }
            return true;
        }
        return false;
    }
};

// Global erişim
if (typeof window !== 'undefined') {
    window.SarayNavigasyon = SarayNavigasyon;
}
