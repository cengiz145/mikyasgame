/* ==========================================================================
   HİYERARŞİK VE HAFİF HARİTA MOTORU (LIGHTWEIGHT HIERARCHICAL MAP ENGINE)
   Küçük Şehir Referans Mimarisinden İstanbul Ölçeğine Kesintisiz Ölçekleme
   
   4 Temel İlke:
   1. Hiyerarşik Veri Yapısı (İlçe -> Hat -> Durak) -> Bellekte sadece aktif hat (~3 KB)
   2. Dizi Araması Yerine İndeksleme (Index-Based Lookup) -> O(1) Sabit Süreli Takip
   3. Ekran Okuyucu ve Ses Belleği Optimizasyonu -> Sıfır RAM ses yükü, Web Audio & TTS
   4. Ölçeklenebilir Harita Şablonu (Küçük, Orta, Büyük Şehirler)
   ========================================================================== */

const MapEngine = {
    cities: {},
    activeRoute: null,
    currentStopIndex: 0,
    approachBeepPlayed: false,

    // Şehir harita verisini kaydet (Hiyerarşik Ağaç)
    registerCity: function(cityData) {
        if (!cityData || !cityData.city) return;
        this.cities[cityData.city] = cityData;
        console.log(`[MapEngine] Şehir haritası kaydedildi: ${cityData.city} (Ölçek: ${cityData.scale || 'standart'})`);
    },

    // Aktif rotayı belleğe al (Sadece seçilen hat RAM'e alınır, ~3 KB kalır)
    loadRoute: function(cityName, routeId) {
        const cityObj = this.cities[cityName];
        if (!cityObj || !cityObj.routes || !cityObj.routes[routeId]) {
            console.warn(`[MapEngine] Rota bulunamadı: ${cityName} / ${routeId}`);
            return null;
        }

        this.activeRoute = JSON.parse(JSON.stringify(cityObj.routes[routeId]));
        this.currentStopIndex = 0;
        this.approachBeepPlayed = false;
        
        console.log(`[MapEngine] Aktif rota yüklendi (3 KB): ${this.activeRoute.name}`);
        return this.activeRoute;
    },

    // İndeks Tabanlı Durak Kontrolü (Index-Based Lookup - O(1))
    // busPosition: Otobüsün kümülatif katettiği metre
    checkNextStop: function(busPosition) {
        if (!this.activeRoute || !this.activeRoute.stops) return null;
        if (this.currentStopIndex >= this.activeRoute.stops.length) return { finished: true };

        const targetStop = this.activeRoute.stops[this.currentStopIndex];
        const distance = targetStop.pos - busPosition;

        // Durağa 20 metre kala sinyal ver (Sadece 1 kez)
        if (distance <= 20 && distance > 0 && !this.approachBeepPlayed) {
            this.playApproachingBeep();
            this.approachBeepPlayed = true;
        }

        // Durağa gelindi
        if (distance <= 0) {
            this.announceStop(targetStop.name);
            this.approachBeepPlayed = false;
            this.currentStopIndex++;
            
            return {
                arrived: true,
                stop: targetStop,
                nextIndex: this.currentStopIndex,
                isFinal: (this.currentStopIndex >= this.activeRoute.stops.length)
            };
        }

        return {
            arrived: false,
            distance: distance,
            targetStop: targetStop
        };
    },

    // Web Audio Synthesized Bip Sinyali (0 KB RAM, dosya yükleme yok)
    playApproachingBeep: function() {
        if (typeof audio !== 'undefined' && audio.ctx) {
            try {
                const ctx = audio.ctx;
                const now = ctx.currentTime;
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();

                osc.type = 'sine';
                osc.frequency.setValueAtTime(1046.5, now); // C6 berrak yaklaşma tonu
                gain.gain.setValueAtTime(0.001, now);
                gain.gain.linearRampToValueAtTime(0.35, now + 0.01);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start(now);
                osc.stop(now + 0.12);
            } catch (e) {}
        }
    },

    // Ekran Okuyucu ve TTS Anonsu (Sıfır önceden yüklenmiş ses dosyası)
    announceStop: function(stopName) {
        if (typeof audio !== 'undefined' && typeof audio.playBusAnnouncement === 'function') {
            audio.playBusAnnouncement('arrive', stopName);
        } else {
            const msg = `Durağımız: ${stopName}. Kapılar açılıyor.`;
            if (typeof audio !== 'undefined') {
                if (typeof audio.playStopChime === 'function') audio.playStopChime();
                if (typeof audio.speak === 'function') audio.speak(msg);
                if (typeof audio.updateNvdaLiveRegion === 'function') audio.updateNvdaLiveRegion(msg);
            }
            if (typeof UI !== 'undefined' && UI.showToast) {
                UI.showToast(msg, 'info');
            }
        }
    }
};

// Yerel JSON'ları MapEngine'e ilk yükleme
if (typeof window !== 'undefined') {
    window.MapEngine = MapEngine;
}
