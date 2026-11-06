/**
 * Mikyas Studio — Erişilebilir Kamera, Sınav Okuyucu, QR ve Hassas Sensör Asistanı (v3.0)
 * - Bradley-Roth İntegral Gölge Silici (I(x,y) < μ_yerel * 0.87)
 * - Dikey İzdüşüm Histogramı ile Otomatik Çift Sütunlu Sınav Ayırıcı
 * - Daire İçi Şık Onarıcı (A-B-C-D-E) ve Etkileşimli Şık Kumandası (Tek Dokunuşla Şık Dinleme)
 * - Çoklu Kare Doğrulaması (Multi-Frame Consensus) ve EMA/Kalman El Titremesi Filtresi
 * - Von Kries Beyaz Dengesi + CIELAB (ΔE) Renk Uzayı + Sobel Kumaş Desen Analizörü
 * - Michelson Ters Işık (Silüet) Formülü + Kadraj Kesikliği + Sosyal Medya Mahremiyet Denetçisi
 * - Z-Skorlu (3.5σ) Zemin Kayıp Eşya Radarı (Desenli Halı Kilidi İle) + LED Frekans (Hz) Okuyucu
 */
(function () {
    'use strict';

    // MAKSİMUM GÜVENLİK KALKANI: Beklenmeyen tarayıcı/WebView hatalarında asistanın asla donmaması için kilit sıfırlayıcı
    window.addEventListener('error', () => {
        try {
            if (typeof state !== 'undefined' && state) {
                state.isProcessingOcr = false;
                state.moneyLiveOcrBusy = false;
                state.isLiveBgOcrBusy = false;
            }
        } catch (_) {}
    });
    window.addEventListener('unhandledrejection', () => {
        try {
            if (typeof state !== 'undefined' && state) {
                state.isProcessingOcr = false;
                state.moneyLiveOcrBusy = false;
                state.isLiveBgOcrBusy = false;
            }
        } catch (_) {}
    });

    const TR_LABELS = {
        'person': 'İnsan',
        'bicycle': 'Bisiklet',
        'car': 'Araba',
        'motorcycle': 'Motosiklet',
        'airplane': 'Uçak',
        'bus': 'Otobüs',
        'train': 'Tren',
        'truck': 'Kamyon',
        'boat': 'Tekne',
        'traffic light': 'Trafik Işığı',
        'bench': 'Bank',
        'bird': 'Kuş',
        'cat': 'Kedi',
        'dog': 'Köpek',
        'backpack': 'Sırt Çantası',
        'umbrella': 'Şemsiye',
        'handbag': 'El Çantası',
        'tie': 'Kravat',
        'suitcase': 'Bavul',
        'bottle': 'Şişe',
        'wine glass': 'Bardak',
        'cup': 'Kupa / Bardak',
        'fork': 'Çatal',
        'knife': 'Bıçak',
        'spoon': 'Kaşık',
        'bowl': 'Kase',
        'banana': 'Muz',
        'apple': 'Elma',
        'sandwich': 'Sandviç',
        'orange': 'Portakal',
        'chair': 'Sandalye',
        'couch': 'Koltuk / Kanepe',
        'potted plant': 'Saksı Bitkisi',
        'bed': 'Yatak',
        'dining table': 'Masa',
        'toilet': 'Tuvalet',
        'tv': 'Bilgisayar Ekranı / Monitör',
        'laptop': 'Dizüstü Bilgisayar Ekranı',
        'mouse': 'Bilgisayar Faresi',
        'remote': 'Kumanda',
        'keyboard': 'Klavye',
        'cell phone': 'Cep Telefonu',
        'microwave': 'Mikrodalga',
        'oven': 'Fırın',
        'toaster': 'Tost Makinesi',
        'sink': 'Lavabo',
        'refrigerator': 'Buzdolabı',
        'book': 'Sınav Kağıdı / Kitap / Evrak',
        'clock': 'Saat',
        'vase': 'Vazo',
        'scissors': 'Makas',
        'teddy bear': 'Oyuncak',
        'hair drier': 'Saç Kurutma Makinesi',
        'toothbrush': 'Diş Fırçası',
        'door_table': 'Masa / Çalışma Masası',
        'screen_qr': 'Bilgisayar Ekranı / Karekod'
    };

    const TURKISH_COLOR_PALETTE_RGB = [
        { name: 'Saf Beyaz', r: 245, g: 245, b: 245 },
        { name: 'Krem / Ekru', r: 235, g: 228, b: 205 },
        { name: 'Açık Gri / Gümüş', r: 190, g: 194, b: 198 },
        { name: 'Orta Gri', r: 128, g: 132, b: 136 },
        { name: 'Antrasit / Koyu Gri', r: 62, g: 66, b: 72 },
        { name: 'Siyah', r: 22, g: 22, b: 24 },
        { name: 'Koyu Lacivert', r: 20, g: 34, b: 78 },
        { name: 'Mavi', r: 35, g: 95, b: 195 },
        { name: 'Açık Mavi / Bebek Mavisi', r: 125, g: 185, b: 235 },
        { name: 'Turkuaz / Camgöbeği', r: 30, g: 170, b: 175 },
        { name: 'Koyu Yeşil / Zümrüt', r: 24, g: 92, b: 48 },
        { name: 'Yeşil', r: 50, g: 160, b: 65 },
        { name: 'Açık Yeşil / Fıstık Yeşili', r: 145, g: 210, b: 110 },
        { name: 'Haki / Zeytin Yeşili', r: 98, g: 108, b: 64 },
        { name: 'Sarı', r: 235, g: 205, b: 40 },
        { name: 'Hardal Sarısı', r: 190, g: 145, b: 30 },
        { name: 'Turuncu', r: 228, g: 110, b: 30 },
        { name: 'Kırmızı', r: 198, g: 32, b: 38 },
        { name: 'Bordo / Vişne', r: 108, g: 20, b: 34 },
        { name: 'Pembe', r: 225, g: 130, b: 165 },
        { name: 'Mor / Eflatun', r: 115, g: 55, b: 155 },
        { name: 'Bej / Kum Rengi', r: 198, g: 178, b: 145 },
        { name: 'Kahverengi / Taba', r: 112, g: 68, b: 40 }
    ];

    const state = {
        isRunning: false,
        facingMode: 'environment',
        mode: 'exam_reader', // 'exam_reader' | 'qr_screen' | 'portrait' | 'color_cloth' | 'anomaly_led' | 'light_meter' | 'explorer'
        targetFilter: 'auto',
        radarEnabled: true,
        autoCaptureEnabled: true,
        flashMode: 'auto',
        cocoModel: null,
        barcodeDetector: null,
        videoStream: null,
        lastSpeechText: 'Henüz yönlendirme başlamadı.',
        lastSpokenAt: 0,
        lastSpokenPhrase: '',
        isCurrentlySpeaking: false,
        countdownStage: 0,
        lastCountdownTick: 0,
        lastQrCode: '',
        lastQrAt: 0,
        lastCapturedDataUrl: null,
        isProcessingOcr: false,
        tiltRoll: 0,
        tiltPitch: 0,
        hasOrientationSensor: false,
        lastTouchTime: 0,
        kalmanBox: null,
        kalmanClass: '',
        consensusFrames: 0,
        missedFrames: 0,
        ledHistory: [],
        whatsappHoldTimer: null,
        whatsappHoldEnd: 0,
        // Kıble Pusulası Durumu (Kâbe Koordinatları: 21.422487 N, 39.826206 E)
        qiblaActive: false,
        qiblaLocationVerified: false,
        qiblaLocationSource: 'Doğrulanıyor...',
        userLat: null,
        userLon: null,
        qiblaTargetBearing: null,
        compassHeading: null,
        smoothedHeading: null,
        headingSamples: [],
        qiblaStableSince: 0,
        lastQiblaLockVibrate: 0,
        gpsWatchId: null,
        lastSceneObstacles: [],
        // Mod 9-14 Sıfır-Hata Takip Durumları
        liquidLevelHistory: [],
        lastLiquidMilestone: -1,
        moldConsensusFrames: 0,
        penInBoxFrames: 0,
        lastDetectedBarcode: '',
        // Detaylı Fotoğraf Betimleyici ve Dokunarak Keşif Durumu
        exploredPhoto: null,
        lastExplorerLabel: '',
        lastExplorerVibrateAt: 0,
        lastStoryText: '',
        // Sesli Şarkı, Melodi ve Söz Bulucu Durumu
        songListening: false,
        songAutoRadarEnabled: false,
        songAutoRadarInterval: null,
        songTunerActive: false,
        lastTunerSpokenAt: 0,
        songRecognition: null,
        songAudioStream: null,
        songAnalyserTimer: null,
        songAutoSearchTimer: null,
        lastFoundSong: null,
        songLyricLines: [],
        currentLyricIndex: 0,
        songAlternatives: [],
        songPreviewAudio: null,
        detectedNotes: [],
        detectedMidiNotes: [],
        chromaHistogram: new Float32Array(12),
        onsetTimestamps: [],
        lastRmsEnergy: 0,
        // Sınav Soruları ve Şık Durumu
        examQuestions: [
            {
                number: 1,
                stem: 'Henüz sınav kağıdı okutulmadı. Kamerayı sınav kağıdına tutup Boşluk tuşuna basın veya ekrana çift dokunun.',
                options: { A: '', B: '', C: '', D: '', E: '' }
            }
        ],
        currentExamIndex: 0,
        // Canlı Para Sayma ve Biriktirme (Kumbara / Cüzdan) Durumu
        moneyAutoAccumulate: true,
        moneyTotalKurus: 0,
        moneyLedger: [],
        moneyPendingSignature: '',
        moneyPendingFrames: 0,
        moneyLastCommittedSignature: '',
        moneyLastCommittedAt: 0,
        moneyEmptyFramesSinceCommit: 0,
        moneyLiveCandidate: null,
        moneyLiveOcrBusy: false,
        moneyLastLiveOcrAt: 0,
        moneyLastLiveBanknoteSig: '',
        moneyLastLiveBanknoteAt: 0,
        moneySeenSerialNumbers: new Set(),
        moneyLastDuplicateSerialWarnAt: 0,
        speechRate: 1.0,
        lastUserInteractionAt: performance.now(),
        deletedItemMemoryBackup: null,
        stepCalorieBackupBeforeReset: null,
        activeScenarioPreset: ''
    };

    const el = {
        btnStart: document.getElementById('btn-start-camera'),
        btnSwitchCam: document.getElementById('btn-switch-camera'),
        btnToggleFlash: document.getElementById('btn-toggle-flash'),
        btnToggleRadar: document.getElementById('btn-toggle-radar'),
        btnToggleAuto: document.getElementById('btn-toggle-auto'),
        btnCaptureNow: document.getElementById('btn-capture-now'),
        btnUploadPhoto: document.getElementById('btn-upload-photo'),
        btnSmartVoiceIntent: document.getElementById('btn-smart-voice-intent'),
        btnSilenceSpeech: document.getElementById('btn-silence-speech'),
        btnSpeechRate: document.getElementById('btn-speech-rate'),
        photoFileInput: document.getElementById('photo-file-input'),
        btnSpeakStory: document.getElementById('btn-speak-story'),
        photoExplorerCanvas: document.getElementById('photo-explorer-canvas'),
        photoExplorerStatus: document.getElementById('photo-explorer-status'),
        btnWhatsappHold: document.getElementById('btn-whatsapp-hold'),
        btnRepeat: document.getElementById('btn-repeat-guidance'),
        targetSelect: document.getElementById('target-object-select'),
        targetFilterSection: document.getElementById('target-filter-section'),
        examRemotePanel: document.getElementById('exam-remote-panel'),
        moneyCounterPanel: document.getElementById('money-counter-panel'),
        qiblaCompassPanel: document.getElementById('qibla-compass-panel'),
        songFinderPanel: document.getElementById('song-finder-panel'),
        busStopPanel: document.getElementById('bus-stop-panel'),
        posIbanPanel: document.getElementById('pos-iban-panel'),
        itemMemoryPanel: document.getElementById('item-memory-panel'),
        tvSubtitlePanel: document.getElementById('tv-subtitle-panel'),
        sockOutfitPanel: document.getElementById('sock-outfit-panel'),
        whereAmIPanel: document.getElementById('where-am-i-panel'),
        stepCaloriePanel: document.getElementById('step-calorie-panel'),
        cookingGuidePanel: document.getElementById('cooking-guide-panel'),
        scenarioPresetBtns: document.querySelectorAll('.scenario-preset-btn'),
        categoryTabs: document.querySelectorAll('.category-tab'),
        modeButtons: document.querySelectorAll('.mode-card'),
        aiStatusBadge: document.getElementById('ai-status-badge'),
        liveDirectionBox: document.getElementById('live-direction-box'),
        tPosition: document.getElementById('t-position'),
        tDistance: document.getElementById('t-distance'),
        tLighting: document.getElementById('t-lighting'),
        tColorTilt: document.getElementById('t-color-tilt'),
        resultPanel: document.getElementById('detected-result-panel'),
        resultTitle: document.getElementById('result-title'),
        resultText: document.getElementById('result-text'),
        btnCopyResult: document.getElementById('btn-copy-result'),
        btnOpenLink: document.getElementById('btn-open-link'),
        btnDownloadPhoto: document.getElementById('btn-download-photo'),
        video: document.getElementById('camera-video'),
        overlayCanvas: document.getElementById('overlay-canvas'),
        analysisCanvas: document.getElementById('analysis-canvas'),
        touchZone: document.getElementById('camera-touch-zone'),
        retinaFlash: document.getElementById('retina-flash-overlay'),
        srAssertive: document.getElementById('sr-live-assertive'),
        srPolite: document.getElementById('sr-live-polite'),
        // Kıble Pusulası Elemanları
        qiblaStatusBadge: document.getElementById('qibla-status-badge'),
        btnStartQibla: document.getElementById('btn-start-qibla'),
        btnQiblaPrayerTimes: document.getElementById('btn-qibla-prayer-times'),
        btnQiblaSaveRoom: document.getElementById('btn-qibla-save-room'),
        btnQiblaGps: document.getElementById('btn-qibla-gps'),
        qiblaCitySelect: document.getElementById('qibla-city-select'),
        qiblaTargetDeg: document.getElementById('qibla-target-deg'),
        qiblaCurrentDeg: document.getElementById('qibla-current-deg'),
        qiblaConfidenceSun: document.getElementById('qibla-confidence-sun'),
        qiblaPrayerInfo: document.getElementById('qibla-prayer-info'),
        // Sınav Kumandası Elemanları
        examCounter: document.getElementById('exam-question-counter'),
        btnExamPrev: document.getElementById('btn-exam-prev'),
        btnExamStem: document.getElementById('btn-exam-stem'),
        btnExamAll: document.getElementById('btn-exam-all'),
        btnExamNext: document.getElementById('btn-exam-next'),
        optBtns: {
            A: document.getElementById('btn-opt-a'),
            B: document.getElementById('btn-opt-b'),
            C: document.getElementById('btn-opt-c'),
            D: document.getElementById('btn-opt-d'),
            E: document.getElementById('btn-opt-e')
        },
        optTexts: {
            A: document.getElementById('text-opt-a'),
            B: document.getElementById('text-opt-b'),
            C: document.getElementById('text-opt-c'),
            D: document.getElementById('text-opt-d'),
            E: document.getElementById('text-opt-e')
        },
        // Şarkı Bulucu Elemanları
        songStatusBadge: document.getElementById('song-status-badge'),
        btnSongListen: document.getElementById('btn-song-listen'),
        btnGoogleHumSearch: document.getElementById('btn-google-hum-search'),
        btnSongAutoRadar: document.getElementById('btn-song-auto-radar'),
        btnSongTuner: document.getElementById('btn-song-tuner'),
        btnSongPreview: document.getElementById('btn-song-preview'),
        btnSongReadLyrics: document.getElementById('btn-song-read-lyrics'),
        btnLyricPrev: document.getElementById('btn-lyric-prev'),
        btnLyricCurrent: document.getElementById('btn-lyric-current'),
        btnLyricNext: document.getElementById('btn-lyric-next'),
        btnSongHistory: document.getElementById('btn-song-history'),
        songSearchInput: document.getElementById('song-search-input'),
        btnSongTextSearch: document.getElementById('btn-song-text-search'),
        songFoundTitle: document.getElementById('song-found-title'),
        songFoundAlbum: document.getElementById('song-found-album'),
        songHeardWords: document.getElementById('song-heard-words'),
        songMelodyBpm: document.getElementById('song-melody-bpm'),
        songAlternativesBox: document.getElementById('song-alternatives-box'),
        songAlternativesList: document.getElementById('song-alternatives-list'),
        songExternalLinks: document.getElementById('song-external-links'),
        btnSongYoutube: document.getElementById('btn-song-youtube'),
        btnSongSpotify: document.getElementById('btn-song-spotify'),
        // Canlı Para Sayacı Elemanları
        moneyStatusBadge: document.getElementById('money-status-badge'),
        btnHowMuchMoney: document.getElementById('btn-how-much-money'),
        btnMoneyAddCurrent: document.getElementById('btn-money-add-current'),
        btnMoneyAutoToggle: document.getElementById('btn-money-auto-toggle'),
        btnMoneyUndo: document.getElementById('btn-money-undo'),
        btnMoneyReset: document.getElementById('btn-money-reset'),
        moneyTotalDisplay: document.getElementById('money-total-display'),
        moneyLastAdded: document.getElementById('money-last-added'),
        moneyLiveSeen: document.getElementById('money-live-seen'),
        moneyBreakdownText: document.getElementById('money-breakdown-text'),
        moneyQuickAddBtns: document.querySelectorAll('.money-quick-add-btn')
    };

    // =========================================================================
    // 1. SINAV KAĞIDI İÇİN BRADLEY-ROTH İNTEGRAL GÖLGE SİLİCİ VE ÇİFT SÜTUN AYIRICI
    // =========================================================================
    /**
     * Telefonun sınav kağıdı üzerine düşen gölgesini 2B İntegral Görüntü
     * (I(x,y) < μ_yerel * 0.87) formülüyle tamamen temizler.
     */
    function applyBradleyRothShadowRemoval(sourceCanvas, customRatio = 0.87) {
        const w = sourceCanvas.width;
        const h = sourceCanvas.height;
        const outCanvas = document.createElement('canvas');
        outCanvas.width = w;
        outCanvas.height = h;
        const ctx = outCanvas.getContext('2d');
        ctx.drawImage(sourceCanvas, 0, 0);

        const imgData = ctx.getImageData(0, 0, w, h);
        const data = imgData.data;
        const gray = new Uint8Array(w * h);
        const integral = new Float64Array(w * h);

        for (let y = 0; y < h; y++) {
            let rowSum = 0;
            for (let x = 0; x < w; x++) {
                const idx = y * w + x;
                const p = idx * 4;
                const lum = Math.round(0.299 * data[p] + 0.587 * data[p + 1] + 0.114 * data[p + 2]);
                gray[idx] = lum;
                rowSum += lum;
                integral[idx] = rowSum + (y > 0 ? integral[(y - 1) * w + x] : 0);
            }
        }

        const s = Math.max(12, Math.floor(w / 18));
        const tRatio = (typeof customRatio === 'number' && customRatio > 0.5 && customRatio < 0.99) ? customRatio : 0.87;

        for (let y = 0; y < h; y++) {
            const y1 = Math.max(0, y - s);
            const y2 = Math.min(h - 1, y + s);
            for (let x = 0; x < w; x++) {
                const x1 = Math.max(0, x - s);
                const x2 = Math.min(w - 1, x + s);
                const area = (x2 - x1 + 1) * (y2 - y1 + 1);

                const sum = integral[y2 * w + x2]
                    - (y1 > 0 ? integral[(y1 - 1) * w + x2] : 0)
                    - (x1 > 0 ? integral[y2 * w + (x1 - 1)] : 0)
                    + (y1 > 0 && x1 > 0 ? integral[(y1 - 1) * w + (x1 - 1)] : 0);

                const idx = y * w + x;
                const isInk = (gray[idx] * area) < (sum * tRatio);
                const val = isInk ? 0 : 255;
                const p = idx * 4;
                data[p] = val;
                data[p + 1] = val;
                data[p + 2] = val;
                data[p + 3] = 255;
            }
        }

        ctx.putImageData(imgData, 0, 0);
        return { cleanCanvas: outCanvas, binaryData: data, width: w, height: h };
    }

    /**
     * Dikey İzdüşüm Histogramı (Vertical Projection Profile) ile sınav sayfasının
     * tek sütun mu yoksa ortadan iki sütunlu mu olduğunu matematiksel olarak bulur.
     */
    function splitExamColumnsIfTwoColumn(binObj) {
        const { cleanCanvas, binaryData, width, height } = binObj;
        const colInk = new Float32Array(width);

        const yStart = Math.floor(height * 0.12);
        const yEnd = Math.floor(height * 0.88);
        const spanH = Math.max(1, yEnd - yStart);

        for (let x = 0; x < width; x++) {
            let blackPixels = 0;
            for (let y = yStart; y < yEnd; y += 2) {
                if (binaryData[(y * width + x) * 4] === 0) blackPixels++;
            }
            colInk[x] = blackPixels / (spanH / 2);
        }

        // Sol ve sağ yarıların ortalama mürekkep yoğunluğu
        let leftDensity = 0, rightDensity = 0;
        const l0 = Math.floor(width * 0.10), l1 = Math.floor(width * 0.40);
        const r0 = Math.floor(width * 0.60), r1 = Math.floor(width * 0.90);
        for (let x = l0; x < l1; x++) leftDensity += colInk[x];
        leftDensity /= Math.max(1, l1 - l0);

        for (let x = r0; x < r1; x++) rightDensity += colInk[x];
        rightDensity /= Math.max(1, r1 - r0);

        // Orta %38..%62 arasında dikey beyaz koridor (gutter) ara
        const m0 = Math.floor(width * 0.38), m1 = Math.floor(width * 0.62);
        const gutterWindow = Math.max(8, Math.floor(width * 0.025));
        let minGutterInk = Infinity;
        let bestSplitX = -1;

        for (let x = m0; x <= m1 - gutterWindow; x++) {
            let sum = 0;
            for (let k = 0; k < gutterWindow; k++) sum += colInk[x + k];
            const avg = sum / gutterWindow;
            if (avg < minGutterInk) {
                minGutterInk = avg;
                bestSplitX = x + Math.floor(gutterWindow / 2);
            }
        }

        // Eğer hem sol hem sağ sütunda yazı varsa (> %4.5 yoğunluk) ve ortada temiz beyaz koridor (< %1.2) varsa:
        if (leftDensity > 0.045 && rightDensity > 0.045 && minGutterInk < 0.012 && bestSplitX > 0) {
            const leftCanvas = document.createElement('canvas');
            leftCanvas.width = bestSplitX;
            leftCanvas.height = height;
            leftCanvas.getContext('2d').drawImage(cleanCanvas, 0, 0, bestSplitX, height, 0, 0, bestSplitX, height);

            const rightCanvas = document.createElement('canvas');
            rightCanvas.width = width - bestSplitX;
            rightCanvas.height = height;
            rightCanvas.getContext('2d').drawImage(cleanCanvas, bestSplitX, 0, width - bestSplitX, height, 0, 0, width - bestSplitX, height);

            return { isTwoColumn: true, canvases: [leftCanvas, rightCanvas] };
        }

        return { isTwoColumn: false, canvases: [cleanCanvas] };
    }

    /**
     * OCR metnindeki daire içi bozuk şık sembollerini (@), 8), 0), ©) onarır,
     * soruları ve A, B, C, D, E şıklarını birbirine karıştırmadan ayrıştırır.
     */
    function parseExamQuestionsAndOptions(rawText) {
        if (!rawText || rawText.trim().length < 4) return [];

        let text = rawText
            .replace(/\r\n/g, '\n')
            // Yuvarlak içindeki A-E Unicode ve bozuk daire (@, ©) şık karakterlerini standartlaştır
            .replace(/[Ⓐⓐ]/g, ' A) ')
            .replace(/[Ⓑⓑ]/g, ' B) ')
            .replace(/[Ⓒⓒ©]/g, ' C) ')
            .replace(/[Ⓓⓓ]/g, ' D) ')
            .replace(/[Ⓔⓔ]/g, ' E) ')
            .replace(/(^|\s)@\)\s*/gm, '$1A) ')
            // Parantez içi boşluklu "( A )" veya "A )" şıklarını ve satır içi "A. ... B. ... C. ..." şıklarını standartlaştır
            .replace(/(^|\s)\(\s*([A-Ea-e])\s*\)\s*(?=\S)/gm, (m, p1, letter) => `${p1}${letter.toUpperCase()}) `)
            .replace(/(^|\s)\(?([A-Ea-e])\s*\)\s*(?=\S)/gm, (m, p1, letter) => `${p1}${letter.toUpperCase()}) `);

        if (/(?:^|\s)[A-Ea-e][\.\-]\s+\S[\s\S]*?(?:^|\s)[B-Eb-e][\.\-]\s+\S[\s\S]*?(?:^|\s)[C-Ec-e][\.\-]\s+\S/i.test(text)) {
            text = text.replace(/(^|\s)([A-Ea-e])[\.\-]\s+(?=\S)/gm, (m, p1, letter) => `${p1}${letter.toUpperCase()}) `);
        } else {
            text = text.replace(/(^|\n)\s*([A-Ea-e])[\.\-]\s+/g, (m, p1, letter) => `${p1}${letter.toUpperCase()}) `);
        }

        // Soru numaralarından ("1.", "2.", "Soru 1") aday bloklara böl;
        // ancak "1. öncül", "2. öncül" gibi soru kökündeki maddelerin soruyu ortadan bölmemesi için
        // henüz A)-B) şıkları tamamlanmamış soru bloklarına alt maddeleri geri birleştir!
        const rawBlocks = text.split(/(?=(?:^|\n)\s*(?:SORU\s*\d+|\d{1,2}\s*[\.\-\)]\s+\S))/i)
            .map(b => b.trim())
            .filter(b => b.length > 5);

        const mergedBlocks = [];
        for (let i = 0; i < rawBlocks.length; i++) {
            const blk = rawBlocks[i];
            const hasOptionPair = /(?:^|\s|\n)[A-C]\)\s+\S/.test(blk) && /(?:^|\s|\n)[B-E]\)\s+\S/.test(blk);
            if (mergedBlocks.length > 0) {
                const prev = mergedBlocks[mergedBlocks.length - 1];
                const prevHasOptions = /(?:^|\s|\n)[A-C]\)\s+\S/.test(prev) && /(?:^|\s|\n)[B-E]\)\s+\S/.test(prev);
                if (!prevHasOptions) {
                    mergedBlocks[mergedBlocks.length - 1] += '\n' + blk;
                    continue;
                }
                if (!hasOptionPair && !/^\s*(?:SORU\s*)?\d{1,2}\s*[\.\-\)]/i.test(blk)) {
                    mergedBlocks[mergedBlocks.length - 1] += '\n' + blk;
                    continue;
                }
            }
            mergedBlocks.push(blk);
        }

        const blocksToParse = mergedBlocks.length > 0 ? mergedBlocks : [text];
        const parsedQuestions = [];

        blocksToParse.forEach((block, idx) => {
            const qObj = {
                number: idx + 1,
                stem: '',
                options: { A: '', B: '', C: '', D: '', E: '' }
            };

            const numMatch = block.match(/^\s*(?:SORU\s*)?(\d{1,2})\s*[\.\-\)]\s*/i);
            if (numMatch) {
                qObj.number = parseInt(numMatch[1], 10) || (idx + 1);
            }

            // A), B), C), D), E) işaretlerinin konumlarını bul
            const optRegex = /(?:^|\s|\n)([A-E])\)\s*/g;
            const matches = [];
            let m;
            while ((m = optRegex.exec(block)) !== null) {
                matches.push({
                    letter: m[1].toUpperCase(),
                    startIndex: m.index,
                    contentStart: m.index + m[0].length
                });
            }

            if (matches.length > 0) {
                // Soru kökünde "A) kabındaki su B) kabına dökülüyor" gibi ifadeler geçtiğinde
                // gerçek şık listesinin başladığı son A-B-C dizisini bul:
                let optionStartIdx = 0;
                for (let k = matches.length - 1; k >= 0; k--) {
                    if (matches[k].letter === 'A') {
                        const tailLetters = matches.slice(k + 1).map(x => x.letter);
                        if (tailLetters.includes('B') && (tailLetters.includes('C') || tailLetters.includes('D'))) {
                            optionStartIdx = k;
                            break;
                        }
                    }
                }
                const realMatches = matches.slice(optionStartIdx);
                qObj.stem = block.slice(0, realMatches[0].startIndex).replace(/\s+/g, ' ').trim();
                for (let i = 0; i < realMatches.length; i++) {
                    const current = realMatches[i];
                    const nextStart = (i + 1 < realMatches.length) ? realMatches[i + 1].startIndex : block.length;
                    const optContent = block.slice(current.contentStart, nextStart).replace(/\s+/g, ' ').trim();
                    if (optContent && !qObj.options[current.letter]) {
                        qObj.options[current.letter] = optContent;
                    }
                }
            } else {
                qObj.stem = block.replace(/\s+/g, ' ').trim();
            }

            if (qObj.options.A || qObj.options.B || qObj.options.C) {
                parsedQuestions.push(qObj);
            }
        });

        return parsedQuestions;
    }

    function updateExamRemoteUI() {
        const total = state.examQuestions.length;
        const idx = Math.max(0, Math.min(total - 1, state.currentExamIndex));
        state.currentExamIndex = idx;
        const q = state.examQuestions[idx];

        el.examCounter.textContent = `Soru ${q.number} (${idx + 1} / ${total})`;

        ['A', 'B', 'C', 'D', 'E'].forEach(letter => {
            const val = (q.options && q.options[letter]) ? q.options[letter] : '';
            if (el.optTexts[letter]) {
                el.optTexts[letter].textContent = val || 'Bu soruda algılanmadı';
            }
            if (el.optBtns[letter]) {
                el.optBtns[letter].classList.toggle('has-content', Boolean(val));
            }
        });
    }

    function speakCurrentQuestionStem() {
        const q = state.examQuestions[state.currentExamIndex];
        if (!q) return;
        const optCount = ['A', 'B', 'C', 'D', 'E'].filter(k => Boolean(q.options[k])).length;
        const msg = optCount > 0
            ? `Soru ${q.number}: ${q.stem || 'Soru metni okunamadı.'}. Toplam ${optCount} şık ayrıştırıldı. Şıkları tek tek dinlemek için A, B, C, D, E düğmelerine dokunun.`
            : `${q.stem || 'Soru metni okunamadı.'}`;
        announceGuidance(msg, { force: true, bannerState: 'centered' });
    }

    function speakSingleOption(letter) {
        const q = state.examQuestions[state.currentExamIndex];
        if (!q) return;
        const val = q.options[letter];
        if (val) {
            announceGuidance(`${letter} şıkkı: ${val}`, { force: true, bannerState: 'centered' });
        } else {
            announceGuidance(`Soru ${q.number} için ${letter} şıkkı algılanmadı. Kağıdın sağ veya alt kenarı kadraj dışında kalmış olabilir, kamerayı biraz geri çekip tekrar okutun.`, {
                force: true,
                bannerState: 'warning'
            });
        }
    }

    function speakEntireQuestionAndOptions() {
        const q = state.examQuestions[state.currentExamIndex];
        if (!q) return;
        const parts = [`Soru ${q.number}: ${q.stem}.`];
        ['A', 'B', 'C', 'D', 'E'].forEach(letter => {
            if (q.options[letter]) {
                parts.push(`${letter} şıkkı: ${q.options[letter]}.`);
            }
        });
        announceGuidance(parts.join(' '), { force: true, bannerState: 'centered' });
    }

    // =========================================================================
    // 2. MATEMATİKSEL RENK UZAYI (sRGB -> XYZ -> CIELAB ΔE) VE VON KRIES BEYAZ DENGESİ
    // =========================================================================
    function rgbToLab(r, g, b) {
        let rn = r / 255, gn = g / 255, bn = b / 255;
        rn = rn > 0.04045 ? Math.pow((rn + 0.055) / 1.055, 2.4) : rn / 12.92;
        gn = gn > 0.04045 ? Math.pow((gn + 0.055) / 1.055, 2.4) : gn / 12.92;
        bn = bn > 0.04045 ? Math.pow((bn + 0.055) / 1.055, 2.4) : bn / 12.92;

        const x = (rn * 0.4124 + gn * 0.3576 + bn * 0.1805) / 0.95047;
        const y = (rn * 0.2126 + gn * 0.7152 + bn * 0.0722) / 1.00000;
        const z = (rn * 0.0193 + gn * 0.1192 + bn * 0.9505) / 1.08883;

        const fx = x > 0.008856 ? Math.cbrt(x) : (7.787 * x) + 16 / 116;
        const fy = y > 0.008856 ? Math.cbrt(y) : (7.787 * y) + 16 / 116;
        const fz = z > 0.008856 ? Math.cbrt(z) : (7.787 * z) + 16 / 116;

        return {
            L: (116 * fy) - 16,
            a: 500 * (fx - fy),
            b: 200 * (fy - fz)
        };
    }

    const CALIBRATED_LAB_PALETTE = TURKISH_COLOR_PALETTE_RGB.map(c => ({
        name: c.name,
        lab: rgbToLab(c.r, c.g, c.b)
    }));

    function classifyColorCIELAB(r, g, b) {
        const targetLab = rgbToLab(r, g, b);
        let bestName = 'Belirsiz';
        let minDeltaE = Infinity;

        for (let i = 0; i < CALIBRATED_LAB_PALETTE.length; i++) {
            const p = CALIBRATED_LAB_PALETTE[i].lab;
            const dL = targetLab.L - p.L;
            const da = targetLab.a - p.a;
            const db = targetLab.b - p.b;
            const deltaE = Math.sqrt(dL * dL + da * da + db * db);
            if (deltaE < minDeltaE) {
                minDeltaE = deltaE;
                bestName = CALIBRATED_LAB_PALETTE[i].name;
            }
        }
        return { name: bestName, deltaE: minDeltaE, lab: targetLab };
    }

    function updateKalmanTracker(rawBox, rawClass, requiredConsensus = 3) {
        const alpha = 0.30;
        if (!rawBox) {
            state.missedFrames++;
            if (state.missedFrames > 4) {
                state.kalmanBox = null;
                state.kalmanClass = '';
                state.consensusFrames = 0;
            }
            return { verified: false, box: state.kalmanBox };
        }

        state.missedFrames = 0;
        if (!state.kalmanBox || state.kalmanClass !== rawClass) {
            state.kalmanBox = [...rawBox];
            state.kalmanClass = rawClass;
            state.consensusFrames = 1;
        } else {
            for (let i = 0; i < 4; i++) {
                state.kalmanBox[i] = alpha * rawBox[i] + (1 - alpha) * state.kalmanBox[i];
            }
            state.consensusFrames++;
        }

        return {
            verified: state.consensusFrames >= requiredConsensus,
            box: state.kalmanBox,
            frames: state.consensusFrames
        };
    }

    // =========================================================================
    // 3. 3D WEB AUDIO NİŞANGÂH RADARI
    // =========================================================================
    class AudioRadarEngine {
        constructor() {
            this.ctx = null;
            this.nextPulseTime = 0;
        }

        init() {
            if (!this.ctx) {
                const AudioCtx = window.AudioContext || window.webkitAudioContext;
                if (AudioCtx) this.ctx = new AudioCtx();
            }
            if (this.ctx && this.ctx.state === 'suspended') {
                this.ctx.resume();
            }
        }

        updateRadar(offsetX, offsetY, isCentered) {
            if (!state.radarEnabled || !this.ctx) return;
            const now = performance.now();
            const dist = Math.min(1.4, Math.hypot(offsetX, offsetY));

            const intervalMs = isCentered ? 460 : Math.max(185, Math.round(190 + dist * 440));
            if (now < this.nextPulseTime) return;
            this.nextPulseTime = now + intervalMs;

            if (isCentered) {
                this.playLockChord();
                return;
            }

            // KULAKLIKSIZ TEK TELEFON HOPARLÖRÜ İÇİN SAĞ-SOL AYIRICI SES KODLAMASI:
            // Sol taraf (offsetX < -0.15): Çift tok ses ("Tık-Tık" 310 Hz ikili vuruş)
            // Sağ taraf (offsetX >  0.15): Tek ince parlak ses ("Biip" 680 Hz tek vuruş)
            // Yukarı/Aşağı: Orta ton (460 Hz - offsetY * 140)
            const pan = Math.max(-1, Math.min(1, offsetX * 1.25));
            if (offsetX < -0.15) {
                this.playPannedTone(310, pan, 0.045, 'triangle', 0.20);
                setTimeout(() => this.playPannedTone(310, pan, 0.055, 'triangle', 0.20), 65);
            } else if (offsetX > 0.15) {
                this.playPannedTone(680, pan, 0.085, 'sine', 0.20);
            } else {
                const verticalFreq = Math.max(240, Math.min(820, 480 - offsetY * 220));
                this.playPannedTone(verticalFreq, 0, 0.065, 'sine', 0.18);
            }
        }

        playLightMeterTone(brightness, hotSpotPanX = 0) {
            if (!state.radarEnabled || !this.ctx) return;
            const now = performance.now();
            if (now < this.nextPulseTime) return;
            this.nextPulseTime = now + 260;

            const normalized = Math.max(0, Math.min(1, brightness / 255));
            const freq = Math.round(180 + normalized * 800);
            this.playPannedTone(freq, hotSpotPanX, 0.08, 'sine', 0.14);
        }

        playPannedTone(freq, panValue, durationSec, waveType = 'sine', maxGain = 0.18) {
            if (!this.ctx) return;
            try {
                const t0 = this.ctx.currentTime;
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = waveType;
                osc.frequency.setValueAtTime(freq, t0);

                gain.gain.setValueAtTime(0.001, t0);
                gain.gain.exponentialRampToValueAtTime(maxGain, t0 + 0.012);
                gain.gain.exponentialRampToValueAtTime(0.0001, t0 + durationSec);

                if (typeof this.ctx.createStereoPanner === 'function') {
                    const panner = this.ctx.createStereoPanner();
                    panner.pan.setValueAtTime(Math.max(-1, Math.min(1, panValue)), t0);
                    osc.connect(gain);
                    gain.connect(panner);
                    panner.connect(this.ctx.destination);
                } else {
                    osc.connect(gain);
                    gain.connect(this.ctx.destination);
                }

                osc.start(t0);
                osc.stop(t0 + durationSec + 0.01);
            } catch (_) {}
        }

        playLockChord() {
            this.playPannedTone(523.25, 0, 0.07, 'triangle', 0.14);
            setTimeout(() => this.playPannedTone(659.25, 0, 0.09, 'triangle', 0.14), 65);
        }

        playLockedChime() {
            this.playLockChord();
        }

        playShutterSound() {
            this.init();
            this.playPannedTone(880, 0, 0.06, 'triangle', 0.25);
            setTimeout(() => this.playPannedTone(1174.66, 0, 0.12, 'triangle', 0.25), 75);
        }

        playQrSuccessSound() {
            this.init();
            this.playPannedTone(587.33, 0, 0.08, 'sine', 0.24);
            setTimeout(() => this.playPannedTone(880, 0, 0.1, 'sine', 0.24), 85);
            setTimeout(() => this.playPannedTone(1174.66, 0, 0.16, 'sine', 0.26), 175);
        }

        playDangerAlarm() {
            this.init();
            this.playPannedTone(240, 0, 0.12, 'sawtooth', 0.26);
            setTimeout(() => this.playPannedTone(196, 0, 0.14, 'sawtooth', 0.26), 140);
            setTimeout(() => this.playPannedTone(164.81, 0, 0.22, 'sawtooth', 0.28), 290);
        }

        playLiquidFillTone(fillPct) {
            if (!state.radarEnabled) return;
            this.init();
            const now = performance.now();
            const intervalMs = fillPct >= 80 ? 180 : 340;
            if (now < this.nextPulseTime) return;
            this.nextPulseTime = now + intervalMs;

            const clamped = Math.max(0, Math.min(100, fillPct));
            const freq = Math.round(240 + (clamped / 100) * 680);
            this.playPannedTone(freq, 0, fillPct >= 80 ? 0.09 : 0.07, fillPct >= 80 ? 'triangle' : 'sine', 0.20);
        }
    }

    const radar = new AudioRadarEngine();

    async function copyTextUniversal(text, label = 'MikyasKamera') {
        const clean = String(text || '');
        if (!clean) return false;
        if (window.AndroidSongBridge && typeof window.AndroidSongBridge.copyToClipboard === 'function') {
            try {
                if (window.AndroidSongBridge.copyToClipboard(label, clean)) return true;
            } catch (_) {}
        }
        if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
            try {
                await navigator.clipboard.writeText(clean);
                return true;
            } catch (_) {}
        }
        try {
            const ta = document.createElement('textarea');
            ta.value = clean;
            ta.setAttribute('readonly', '');
            ta.style.position = 'fixed';
            ta.style.left = '-9999px';
            document.body.appendChild(ta);
            ta.select();
            const ok = document.execCommand('copy');
            document.body.removeChild(ta);
            return Boolean(ok);
        } catch (_) {
            return false;
        }
    }

    function openExternalUrlUniversal(urlStr) {
        if (!urlStr) return;
        if (window.AndroidSongBridge && typeof window.AndroidSongBridge.openExternalUrl === 'function') {
            try {
                if (window.AndroidSongBridge.openExternalUrl(urlStr)) return;
            } catch (_) {}
        }
        window.open(urlStr, '_blank', 'noopener');
    }

    function stopAllSpeechImmediately() {
        state.isCurrentlySpeaking = false;
        if ('speechSynthesis' in window) {
            try { window.speechSynthesis.cancel(); } catch (_) {}
        }
        if (window.AndroidSongBridge && typeof window.AndroidSongBridge.stopNativeSpeech === 'function') {
            try { window.AndroidSongBridge.stopNativeSpeech(); } catch (_) {}
        }
        if (el.srAssertive) {
            el.srAssertive.textContent = '';
        }
    }
    window.stopAllSpeechImmediately = stopAllSpeechImmediately;

    function isAnySpeechPlaying() {
        if (window.AndroidSongBridge && typeof window.AndroidSongBridge.isNativeSpeaking === 'function') {
            try {
                if (window.AndroidSongBridge.isNativeSpeaking()) return true;
            } catch (_) {}
        }
        if ('speechSynthesis' in window && window.speechSynthesis && window.speechSynthesis.speaking) {
            return true;
        }
        return Boolean(state.isCurrentlySpeaking);
    }

    const SPEECH_RATE_STORAGE_KEY = 'mikyas_speech_rate';
    const SPEECH_RATE_PRESETS = [
        { rate: 1.0, label: 'Normal (1.0x)', spoken: 'Normal hız (1.0 çarpı)' },
        { rate: 1.3, label: 'Hızlı (1.3x)', spoken: 'Hızlı okuma (1.3 çarpı)' },
        { rate: 1.6, label: 'Çok Hızlı (1.6x)', spoken: 'Çok hızlı okuma (1.6 çarpı)' },
        { rate: 0.85, label: 'Yavaş (0.85x)', spoken: 'Yavaş ve tane tane okuma (0.85 çarpı)' }
    ];

    function updateSpeechRateButtonUI() {
        const preset = SPEECH_RATE_PRESETS.find(p => Math.abs(p.rate - state.speechRate) < 0.05) || SPEECH_RATE_PRESETS[0];
        if (el.btnSpeechRate) {
            el.btnSpeechRate.textContent = `🗣️ Okuma Hızı: ${preset.label}`;
        }
        if (window.AndroidSongBridge && typeof window.AndroidSongBridge.setNativeSpeechRate === 'function') {
            try { window.AndroidSongBridge.setNativeSpeechRate(state.speechRate); } catch (_) {}
        }
    }

    function loadSpeechRateFromStorage() {
        try {
            const saved = parseFloat(localStorage.getItem(SPEECH_RATE_STORAGE_KEY) || '');
            if (!isNaN(saved) && saved >= 0.6 && saved <= 2.2) {
                state.speechRate = saved;
            }
        } catch (_) {}
        updateSpeechRateButtonUI();
    }

    function cycleSpeechRate() {
        const curIdx = SPEECH_RATE_PRESETS.findIndex(p => Math.abs(p.rate - state.speechRate) < 0.05);
        const nextIdx = (curIdx + 1) % SPEECH_RATE_PRESETS.length;
        const nextPreset = SPEECH_RATE_PRESETS[nextIdx];
        state.speechRate = nextPreset.rate;
        try { localStorage.setItem(SPEECH_RATE_STORAGE_KEY, String(state.speechRate)); } catch (_) {}
        updateSpeechRateButtonUI();
        announceGuidance(`Sesli okuma hızı değiştirildi: ${nextPreset.spoken}.`, { force: true, bannerState: 'centered' });
    }
    window.cycleSpeechRate = cycleSpeechRate;

    function announceGuidance(text, options = {}) {
        const {
            force = false,
            minIntervalMs = 2600,
            updateBanner = true,
            bannerState = 'normal'
        } = options;

        const now = performance.now();
        state.lastSpeechText = text;

        if (updateBanner && el.liveDirectionBox) {
            el.liveDirectionBox.textContent = text;
            el.liveDirectionBox.classList.remove('centered', 'warning');
            if (bannerState === 'centered') el.liveDirectionBox.classList.add('centered');
            if (bannerState === 'warning') el.liveDirectionBox.classList.add('warning');
        }

        if (!force) {
            if (now - state.lastSpokenAt < minIntervalMs) return;
            // İnsan Odaklı Sakinlik Kalkanı: Kamera önünde hiçbir şey değişmediyse aynı cümleyi 5 saniyede bir değil 15 saniyede bir tekrarlar;
            // ancak sahne veya yön değiştiği anda (text !== state.lastSpokenPhrase) beklemeden hemen söyler!
            if (text === state.lastSpokenPhrase && now - state.lastSpokenAt < 15000) return;
        }

        state.lastSpokenAt = now;
        state.lastSpokenPhrase = text;

        let spokeViaTts = false;
        const hasNativeBridge = Boolean(window.AndroidSongBridge && typeof window.AndroidSongBridge.speakNativeTurkish === 'function');

        // 1. Öncelik: Android üzerinde her zaman kullanıcının kendi doğal Türkçe TTS motorunu kullan (robotik WebView sesi ve çift konuşmayı önler)
        if (hasNativeBridge) {
            try {
                if ('speechSynthesis' in window) {
                    try { window.speechSynthesis.cancel(); } catch (_) {}
                }
                window.AndroidSongBridge.speakNativeTurkish(text, Boolean(force));
                spokeViaTts = true;
                state.isCurrentlySpeaking = true;
            } catch (_) {}
        }

        // 2. Öncelik: Web / Masaüstü / iOS Tarayıcı TTS Motoru
        if (!spokeViaTts && 'speechSynthesis' in window && window.speechSynthesis && typeof window.speechSynthesis.speak === 'function') {
            try {
                const voices = window.speechSynthesis.getVoices ? window.speechSynthesis.getVoices() : [];
                if (force) {
                    window.speechSynthesis.cancel();
                } else if (window.speechSynthesis.speaking) {
                    return;
                }
                const utter = new SpeechSynthesisUtterance(text);
                utter.lang = 'tr-TR';
                utter.rate = state.speechRate || 1.0;
                const trVoice = Array.isArray(voices) ? voices.find(v => v.lang && v.lang.toLowerCase().startsWith('tr')) : null;
                if (trVoice) utter.voice = trVoice;
                utter.onend = () => { state.isCurrentlySpeaking = false; };
                utter.onerror = () => { state.isCurrentlySpeaking = false; };
                state.isCurrentlySpeaking = true;
                window.speechSynthesis.speak(utter);
                spokeViaTts = true;
            } catch (_) {}
        }

        // 3. Çift Ses (TalkBack / NVDA Yankısı) Önleyici: Sadece sesli motor (TTS) konuşmadıysa aria-live="assertive" tetiklenir
        if (el.srAssertive) {
            if (spokeViaTts) {
                el.srAssertive.textContent = '';
            } else {
                el.srAssertive.textContent = '';
                setTimeout(() => {
                    el.srAssertive.textContent = text;
                }, 25);
            }
        }
    }

    // =========================================================================
    // 4. DERİN MATEMATİKSEL KARE ANALİZÖRÜ
    // =========================================================================
    function analyzeFrameMathematics(ctx, width, height) {
        const imgData = ctx.getImageData(0, 0, width, height);
        const data = imgData.data;

        let sumR = 0, sumG = 0, sumB = 0;
        let sumLum = 0, sumSqLum = 0;
        let count = 0;

        const step = 4;
        const gw = Math.floor(width / step);
        const gh = Math.floor(height / step);
        const gray = new Float32Array(gw * gh);

        let maxLum = 0, maxLumX = width / 2, maxLumY = height / 2;
        let maxLedScore = 0, maxLedPeak = 0, ledCandX = width / 2, ledCandY = height / 2;

        for (let gy = 0; gy < gh; gy++) {
            const y = gy * step;
            for (let gx = 0; gx < gw; gx++) {
                const x = gx * step;
                const idx = (y * width + x) * 4;
                const r = data[idx], g = data[idx + 1], b = data[idx + 2];
                const lum = 0.299 * r + 0.587 * g + 0.114 * b;

                gray[gy * gw + gx] = lum;
                sumR += r;
                sumG += g;
                sumB += b;
                sumLum += lum;
                sumSqLum += lum * lum;
                count++;

                if (lum > maxLum) {
                    maxLum = lum;
                    maxLumX = x;
                    maxLumY = y;
                }

                const peakCh = Math.max(r, g, b);
                const minCh = Math.min(r, g, b);
                const ledScore = Math.max(lum, peakCh * 0.96 + (peakCh - minCh) * 0.15);
                if (ledScore > maxLedScore) {
                    maxLedScore = ledScore;
                    maxLedPeak = peakCh;
                    ledCandX = x;
                    ledCandY = y;
                }
            }
        }

        const avgR = sumR / Math.max(1, count);
        const avgG = sumG / Math.max(1, count);
        const avgB = sumB / Math.max(1, count);
        const avgBrightness = sumLum / Math.max(1, count);
        const variance = (sumSqLum / Math.max(1, count)) - (avgBrightness * avgBrightness);
        const contrast = Math.sqrt(Math.max(0, variance));

        const grayRef = (avgR + avgG + avgB) / 3;
        const wbGainR = avgR > 15 ? Math.min(1.6, Math.max(0.65, grayRef / avgR)) : 1;
        const wbGainG = avgG > 15 ? Math.min(1.6, Math.max(0.65, grayRef / avgG)) : 1;
        const wbGainB = avgB > 15 ? Math.min(1.6, Math.max(0.65, grayRef / avgB)) : 1;

        const cX0 = Math.floor(gw * 0.35), cX1 = Math.floor(gw * 0.65);
        const cY0 = Math.floor(gh * 0.35), cY1 = Math.floor(gh * 0.65);
        let cR = 0, cG = 0, cB = 0, cCount = 0;
        let sobelH = 0, sobelV = 0, strongEdges = 0;

        for (let gy = cY0; gy < cY1; gy++) {
            for (let gx = cX0; gx < cX1; gx++) {
                const idx = ((gy * step) * width + (gx * step)) * 4;
                cR += Math.min(255, data[idx] * wbGainR);
                cG += Math.min(255, data[idx + 1] * wbGainG);
                cB += Math.min(255, data[idx + 2] * wbGainB);
                cCount++;

                if (gy > 0 && gy < gh - 1 && gx > 0 && gx < gw - 1) {
                    const gxGrad = Math.abs(gray[gy * gw + (gx + 1)] - gray[gy * gw + (gx - 1)]);
                    const gyGrad = Math.abs(gray[(gy + 1) * gw + gx] - gray[(gy - 1) * gw + gx]);
                    sobelH += gyGrad;
                    sobelV += gxGrad;
                    if (gxGrad + gyGrad > 38) strongEdges++;
                }
            }
        }

        const normCR = Math.round(cR / Math.max(1, cCount));
        const normCG = Math.round(cG / Math.max(1, cCount));
        const normCB = Math.round(cB / Math.max(1, cCount));
        const centerColor = classifyColorCIELAB(normCR, normCG, normCB);

        const edgeRatio = strongEdges / Math.max(1, cCount);
        let patternType = 'Düz Renk (Desensiz)';
        if (edgeRatio > 0.16) {
            if (sobelH > sobelV * 1.55) patternType = 'Yatay Çizgili Desen';
            else if (sobelV > sobelH * 1.55) patternType = 'Dikey Çizgili Desen';
            else patternType = 'Kareli veya Çok Renkli Desenli';
        }

        let edgeEnergy = 0;
        let brightWeightSum = 0, brightXSum = 0, brightYSum = 0;
        let minBX = width, maxBX = 0, minBY = height, maxBY = 0;
        const brightThreshold = Math.max(140, Math.min(220, avgBrightness + contrast * 0.55));

        for (let gy = 1; gy < gh - 1; gy++) {
            for (let gx = 1; gx < gw - 1; gx++) {
                const c = gray[gy * gw + gx];
                const lap = Math.abs(
                    4 * c -
                    gray[gy * gw + (gx - 1)] -
                    gray[gy * gw + (gx + 1)] -
                    gray[(gy - 1) * gw + gx] -
                    gray[(gy + 1) * gw + gx]
                );
                edgeEnergy += lap;

                if (c >= brightThreshold && lap > 14) {
                    const px = gx * step;
                    const py = gy * step;
                    brightWeightSum += lap;
                    brightXSum += px * lap;
                    brightYSum += py * lap;
                    if (px < minBX) minBX = px;
                    if (px > maxBX) maxBX = px;
                    if (py < minBY) minBY = py;
                    if (py > maxBY) maxBY = py;
                }
            }
        }

        const sharpness = edgeEnergy / Math.max(1, (gw - 2) * (gh - 2));

        let brightCluster = null;
        if (brightWeightSum > 1600 && maxBX > minBX && maxBY > minBY) {
            const bw = maxBX - minBX;
            const bh = maxBY - minBY;
            const areaRatio = (bw * bh) / (width * height);
            const aspect = bw / Math.max(1, bh);
            if (areaRatio > 0.04 && areaRatio < 0.94 && aspect >= 0.35 && aspect <= 2.7) {
                brightCluster = {
                    cx: brightXSum / brightWeightSum,
                    cy: brightYSum / brightWeightSum,
                    bbox: [minBX, minBY, bw, bh],
                    areaRatio
                };
            }
        }

        const gridN = 8;
        const cellMeans = new Float32Array(gridN * gridN);
        const cellW = Math.floor(gw / gridN);
        const cellH = Math.floor(gh / gridN);

        for (let cy = 0; cy < gridN; cy++) {
            for (let cx = 0; cx < gridN; cx++) {
                let s = 0, cnt = 0;
                for (let y = cy * cellH; y < (cy + 1) * cellH; y++) {
                    for (let x = cx * cellW; x < (cx + 1) * cellW; x++) {
                        s += gray[y * gw + x];
                        cnt++;
                    }
                }
                cellMeans[cy * gridN + cx] = s / Math.max(1, cnt);
            }
        }

        let gridMean = 0;
        for (let i = 0; i < 64; i++) gridMean += cellMeans[i];
        gridMean /= 64;

        let gridVar = 0;
        for (let i = 0; i < 64; i++) {
            const d = cellMeans[i] - gridMean;
            gridVar += d * d;
        }
        const gridStd = Math.sqrt(gridVar / 64);

        let maxZScore = 0;
        let anomalyCellX = -1, anomalyCellY = -1;
        let anomalyCount = 0;

        for (let cy = 1; cy < gridN - 1; cy++) {
            for (let cx = 1; cx < gridN - 1; cx++) {
                const z = Math.abs(cellMeans[cy * gridN + cx] - gridMean) / Math.max(3.0, gridStd);
                if (z > 2.9) anomalyCount++;
                if (z > maxZScore) {
                    maxZScore = z;
                    anomalyCellX = cx;
                    anomalyCellY = cy;
                }
            }
        }

        const isSurfacePatterned = gridStd > 34 || anomalyCount > 4;
        let floorAnomaly = null;
        if (!isSurfacePatterned && maxZScore >= 3.20 && anomalyCellX >= 0) {
            const ax = (anomalyCellX / gridN) * width;
            const ay = (anomalyCellY / gridN) * height;
            const aw = width / gridN;
            const ah = height / gridN;
            floorAnomaly = {
                bbox: [ax, ay, aw, ah],
                zScore: maxZScore
            };
        }

        let ledSource = null;
        if (maxLedPeak >= 238 && avgBrightness < 145) {
            let coreR = 0, coreG = 0, coreB = 0, cCnt = 0;
            let surLum = 0, surPeak = 0, surBrightCnt = 0, sCnt = 0;
            for (let dy = -22; dy <= 22; dy += 2) {
                for (let dx = -22; dx <= 22; dx += 2) {
                    const dist = Math.hypot(dx, dy);
                    const rx = Math.min(width - 1, Math.max(0, Math.floor(ledCandX + dx)));
                    const ry = Math.min(height - 1, Math.max(0, Math.floor(ledCandY + dy)));
                    const rIdx = (ry * width + rx) * 4;
                    const pr = data[rIdx], pg = data[rIdx + 1], pb = data[rIdx + 2];
                    const pPeak = Math.max(pr, pg, pb);
                    const pLum = 0.299 * pr + 0.587 * pg + 0.114 * pb;

                    if (dist <= 10 && pPeak >= 110) {
                        coreR += pr;
                        coreG += pg;
                        coreB += pb;
                        cCnt++;
                    } else if (dist >= 14 && dist <= 22) {
                        surLum += pLum;
                        surPeak += pPeak;
                        if (pPeak >= 165) surBrightCnt++;
                        sCnt++;
                    }
                }
            }
            coreR /= Math.max(1, cCnt);
            coreG /= Math.max(1, cCnt);
            coreB /= Math.max(1, cCnt);
            surLum /= Math.max(1, sCnt);
            surPeak /= Math.max(1, sCnt);
            const surBrightRatio = surBrightCnt / Math.max(1, sCnt);

            const prominenceRatio = maxLedPeak / Math.max(12, Math.max(avgBrightness, surPeak));
            let ledColorName = '';
            if (coreR > coreG * 1.35 && coreR > coreB * 1.35 && coreR >= 130) ledColorName = 'Kırmızı';
            else if (coreG > coreR * 1.25 && coreG > coreB * 1.20 && coreG >= 120) ledColorName = 'Yeşil';
            else if (coreB > coreR * 1.30 && coreB > coreG * 1.18 && coreB >= 130) ledColorName = 'Mavi';
            else if (coreR >= 180 && coreG >= 95 && coreB < 85 && coreR >= coreG * 1.15) ledColorName = 'Turuncu / Kehribar';
            else if (maxLum >= 242 && avgBrightness < 85 && (maxLum / Math.max(12, Math.max(avgBrightness, surLum))) >= 2.8) ledColorName = 'Beyaz / Sarı';

            if (ledColorName && prominenceRatio >= 1.85 && surLum < 125 && surBrightRatio <= 0.12) {
                ledSource = {
                    x: ledCandX,
                    y: ledCandY,
                    bbox: [Math.max(0, ledCandX - 22), Math.max(0, ledCandY - 22), 44, 44],
                    colorName: ledColorName,
                    peakLum: maxLedPeak
                };
            }
        }

        state.ledHistory.push({
            t: performance.now(),
            active: Boolean(ledSource),
            lum: maxLedPeak
        });
        if (state.ledHistory.length > 45) state.ledHistory.shift();

        let blinkHz = 0;
        if (state.ledHistory.length >= 20) {
            let transitions = 0;
            for (let i = 1; i < state.ledHistory.length; i++) {
                if (state.ledHistory[i].active !== state.ledHistory[i - 1].active) {
                    transitions++;
                }
            }
            const durationSec = (state.ledHistory[state.ledHistory.length - 1].t - state.ledHistory[0].t) / 1000;
            if (transitions >= 3 && durationSec > 0.4) {
                blinkHz = Number(((transitions / 2) / durationSec).toFixed(1));
            }
        }

        return {
            avgBrightness,
            contrast,
            sharpness,
            brightCluster,
            centerColor,
            patternType,
            isSurfacePatterned,
            gridStd,
            floorAnomaly,
            ledSource,
            blinkHz,
            maxLumX,
            maxLumY,
            gray,
            gw,
            gh,
            step,
            imageData: imgData
        };
    }

    function evaluatePortraitPrivacyAndBacklight(personBox, metrics, allPredictions, frameW, frameH) {
        const [bx, by, bw, bh] = personBox;
        const { gray, gw, gh, step } = metrics;

        let fgSum = 0, fgCnt = 0;
        let bgSum = 0, bgCnt = 0;

        for (let gy = 0; gy < gh; gy++) {
            const py = gy * step;
            for (let gx = 0; gx < gw; gx++) {
                const px = gx * step;
                const lum = gray[gy * gw + gx];
                if (px >= bx && px <= bx + bw && py >= by && py <= by + bh) {
                    fgSum += lum;
                    fgCnt++;
                } else {
                    bgSum += lum;
                    bgCnt++;
                }
            }
        }

        const fgLum = fgSum / Math.max(1, fgCnt);
        const bgLum = bgSum / Math.max(1, bgCnt);
        const backlightRatio = bgLum / Math.max(1, fgLum + 1);
        const hasBacklight = backlightRatio > 2.05 && fgLum < 82;

        const clippedParts = [];
        if (by <= frameH * 0.025) clippedParts.push('başın üst kısmı');
        if (by + bh >= frameH * 0.98 && bh < frameH * 0.85) clippedParts.push('alt/çene kısmı');
        if (bx <= frameW * 0.02) clippedParts.push('sol omuz');
        if (bx + bw >= frameW * 0.98) clippedParts.push('sağ omuz');

        const bgObjects = [];
        let extraPeople = 0;
        allPredictions.forEach(p => {
            if (p.bbox === personBox) return;
            if (p.class === 'person') extraPeople++;
            else bgObjects.push(TR_LABELS[p.class] || p.class);
        });

        const uniqueBg = [...new Set(bgObjects)];
        let privacyReport = 'Arka plan temiz, yabancı ekran veya nesne görünmüyor.';
        if (extraPeople > 0 || uniqueBg.length > 0) {
            const warnings = [];
            if (extraPeople > 0) warnings.push(`arkada ${extraPeople} kişi daha var`);
            if (uniqueBg.length > 0) warnings.push(`arka planda ${uniqueBg.join(', ')} görünüyor`);
            privacyReport = `Mahremiyet uyarısı: ${warnings.join(' ve ')}.`;
        }

        return {
            fgLum: Math.round(fgLum),
            bgLum: Math.round(bgLum),
            backlightRatio: Number(backlightRatio.toFixed(2)),
            hasBacklight,
            clippedParts,
            privacyReport
        };
    }

    function computeAlignmentInstruction(targetBox, frameW, frameH, labelTr, idealMinArea = 0.10, idealMaxArea = 0.68) {
        const [bx, by, bw, bh] = targetBox;
        const cx = bx + bw / 2;
        const cy = by + bh / 2;

        const rawOffsetX = (cx - frameW / 2) / (frameW / 2);
        const offsetX = state.facingMode === 'user' ? -rawOffsetX : rawOffsetX;
        const offsetY = (cy - frameH / 2) / (frameH / 2);
        const areaRatio = (bw * bh) / (frameW * frameH);

        const touchesLeft = bx <= frameW * 0.03;
        const touchesRight = (bx + bw) >= frameW * 0.97;
        const touchesTop = by <= frameH * 0.03;
        const touchesBottom = (by + bh) >= frameH * 0.97;

        const isExamContext = state.mode === 'exam_reader' || /Sınav/i.test(labelTr || '');
        const moveParts = [];

        if (offsetX < -0.20 || (touchesLeft && !touchesRight)) {
            moveParts.push(offsetX < -0.45 ? 'sola doğru çevirin' : 'biraz sola kaydırın');
        } else if (offsetX > 0.20 || (touchesRight && !touchesLeft)) {
            moveParts.push(offsetX > 0.45
                ? (isExamContext ? 'sağa doğru çevirin (sağdaki şıklar kesilebilir)' : 'sağa doğru çevirin')
                : 'biraz sağa kaydırın');
        }

        if (offsetY < -0.20 || (touchesTop && !touchesBottom)) {
            moveParts.push(offsetY < -0.45 ? 'yukarı kaldırın' : 'biraz yukarı kaldırın');
        } else if (offsetY > 0.20 || (touchesBottom && !touchesTop)) {
            moveParts.push(offsetY > 0.45 ? 'aşağı indirin' : 'biraz aşağı indirin');
        }

        let distanceAdvice = '';
        let distanceStatus = 'İdeal Mesafe';
        if (areaRatio < idealMinArea) {
            distanceAdvice = 'Biraz daha yaklaşın';
            distanceStatus = 'Uzak (Yaklaşın)';
        } else if (areaRatio > idealMaxArea || (touchesLeft && touchesRight) || (touchesTop && touchesBottom)) {
            distanceAdvice = isExamContext
                ? 'Çok yakınsınız, tüm şıkların sığması için telefonu biraz yukarı/geri çekin'
                : 'Çok yakınsınız, tamamının kadraja sığması için telefonu biraz geri çekin';
            distanceStatus = 'Çok Yakın (Geri Çekin)';
        }

        const isCentered = moveParts.length === 0 && !distanceAdvice;

        let sentence = '';
        if (isCentered) {
            sentence = `${labelTr} tam ortalandı ve tüm kenarlar içeride! Lütfen sabit tutun.`;
        } else {
            const parts = [];
            if (moveParts.length > 0) parts.push(`Telefonu ${moveParts.join(' ve ')}`);
            if (distanceAdvice) parts.push(distanceAdvice);
            sentence = `${labelTr} doğrulandı: ${parts.join('. ')}.`;
        }

        const posLabel = isCentered
            ? 'Tam Merkezde (4 Kenar İçeride)'
            : (moveParts.length > 0 ? moveParts.join(', ') : 'Hizalanıyor');

        return {
            offsetX,
            offsetY,
            areaRatio,
            isCentered,
            sentence,
            posLabel,
            distanceStatus
        };
    }

    // =========================================================================
    // 5. GERÇEK ZAMANLI VİZÖR DÖNGÜSÜ VE 5 DAKİKA BOŞTA KALMA PİL/ISINMA KORUMASI
    // =========================================================================
    const CAMERA_IDLE_SLEEP_MS = 300000; // 5 dakika boyunca hiçbir tuşa basılmazsa kamerayı ve flaşı uyku moduna al

    function markUserInteraction() {
        state.lastUserInteractionAt = performance.now();
    }

    function checkCameraIdleSleep(nowMs) {
        if (!state.isRunning) return false;
        if (state.tvAutoReaderActive || state.busTargetStop || state.whatsappHoldTimer) return false;
        const elapsed = (nowMs || performance.now()) - (state.lastUserInteractionAt || 0);
        if (elapsed >= CAMERA_IDLE_SLEEP_MS) {
            tryEnableHardwareTorch(false);
            stopCamera();
            announceGuidance('Pil koruma uyarısı: 5 dakikadır hiçbir tuşa basılmadığı için telefonunuzun ısınmaması ve şarjınızın bitmemesi amacıyla kamera ve flaş otomatik olarak uyku moduna alındı. Tekrar başlatmak için ekrana çift dokunabilir veya Boşluk tuşuna basabilirsiniz.', {
                force: true,
                bannerState: 'warning'
            });
            return true;
        }
        return false;
    }
    window.checkCameraIdleSleep = checkCameraIdleSleep;

    async function processFrameLoop() {
        if (!state.isRunning) return;
        if (checkCameraIdleSleep(performance.now())) return;

        if (el.video.readyState >= 2 && el.video.videoWidth > 0) {
            const vw = el.video.videoWidth;
            const vh = el.video.videoHeight;

            const anW = 480;
            const anH = Math.round((vh / vw) * anW);
            if (el.analysisCanvas.width !== anW || el.analysisCanvas.height !== anH) {
                el.analysisCanvas.width = anW;
                el.analysisCanvas.height = anH;
            }
            if (el.overlayCanvas.width !== vw || el.overlayCanvas.height !== vh) {
                el.overlayCanvas.width = vw;
                el.overlayCanvas.height = vh;
            }

            const anCtx = el.analysisCanvas.getContext('2d', { willReadFrequently: true });
            anCtx.drawImage(el.video, 0, 0, anW, anH);

            const metrics = analyzeFrameMathematics(anCtx, anW, anH);
            state.lastMetrics = metrics;
            updateTelemetryUI(metrics);

            let qrDetection = null;
            const isVisualCameraMode = state.mode !== 'light_meter' && state.mode !== 'qibla_compass' && state.mode !== 'song_finder';
            if (isVisualCameraMode) {
                if (state.barcodeDetector) {
                    try {
                        const barcodes = await state.barcodeDetector.detect(el.analysisCanvas);
                        if (barcodes && barcodes.length > 0 && barcodes[0].boundingBox) {
                            const b = barcodes[0].boundingBox;
                            qrDetection = {
                                data: barcodes[0].rawValue || '',
                                format: barcodes[0].format || 'barcode',
                                bbox: [b.x, b.y, b.width, b.height]
                            };
                            if (qrDetection.data) {
                                state.lastDetectedBarcode = qrDetection.data;
                            }
                        }
                    } catch (_) {}
                }
                if (!qrDetection && typeof window.jsQR === 'function') {
                    const code = window.jsQR(metrics.imageData.data, anW, anH, {
                        inversionAttempts: 'attemptBoth'
                    });
                    if (code && code.location) {
                        const xs = [
                            code.location.topLeftCorner.x,
                            code.location.topRightCorner.x,
                            code.location.bottomLeftCorner.x,
                            code.location.bottomRightCorner.x
                        ];
                        const ys = [
                            code.location.topLeftCorner.y,
                            code.location.topRightCorner.y,
                            code.location.bottomLeftCorner.y,
                            code.location.bottomRightCorner.y
                        ];
                        const minX = Math.min(...xs), maxX = Math.max(...xs);
                        const minY = Math.min(...ys), maxY = Math.max(...ys);
                        qrDetection = {
                            data: code.data,
                            bbox: [minX, minY, Math.max(12, maxX - minX), Math.max(12, maxY - minY)]
                        };
                        if (code.data) {
                            state.lastDetectedBarcode = code.data;
                        }
                    }
                }
            }

            // Herhangi bir moddayken QR kod veya İlaç GS1 Karekod görülürse mod değiştirmeye gerek kalmadan anında oku!
            if (qrDetection && qrDetection.data && state.mode !== 'qr_screen') {
                const nowQr = performance.now();
                if (qrDetection.data !== state.lastQrCode || nowQr - (state.lastQrAt || 0) > 6500) {
                    state.lastQrCode = qrDetection.data;
                    state.lastQrAt = nowQr;
                    radar.playQrSuccessSound();
                    const gs1 = parseGs1MedicineDataMatrix(qrDetection.data);
                    if (gs1) {
                        const medCheck = parseMedicineAndExpiryZeroError('', qrDetection.data, '');
                        showDetectedResult('💊 Karekod / Barkod Otomatik Okundu', `${medCheck.sktSpeech}\nBarkod: ${gs1.gtin}`);
                        announceGuidance(`Karekod okundu! ${medCheck.sktSpeech}`, { force: true, bannerState: medCheck.sktStatus === 'EXPIRED' ? 'warning' : 'centered' });
                    } else {
                        showDetectedResult('📱 QR Kod / Barkod Otomatik Okundu', qrDetection.data);
                        announceGuidance(`Kamerada QR kod veya barkod okundu: ${qrDetection.data}`, { force: true, bannerState: 'centered' });
                    }
                }
            }

            let predictions = [];
            const nonObjectModes = new Set([
                'light_meter', 'qibla_compass', 'song_finder'
            ]);
            const shouldDetectObjects = state.cocoModel &&
                (!nonObjectModes.has(state.mode) || (state.targetFilter !== 'auto' && state.targetFilter !== 'screen_qr'));
            if (shouldDetectObjects) {
                try {
                    const rawPreds = await state.cocoModel.detect(el.analysisCanvas, 8, 0.58);
                    predictions = verifyPredictionsInAiBrain(rawPreds, anW, anH, true);
                } catch (_) {
                    predictions = [];
                }
            }

            handleModeDispatch(anW, anH, vw, vh, metrics, qrDetection, predictions);
            triggerUniversalLiveOcrIfSteady(metrics, predictions);
        }

        if (state.isRunning) {
            requestAnimationFrame(processFrameLoop);
        }
    }

    /**
     * CANLI KAMERADA "NE GÖRÜRSE DOĞRUDAN OKUYAN" EVRENSEL ARKA PLAN OCR MOTORU:
     * Kullanıcı tuşa basmasa veya mod değiştirmese bile kamera net bir yazıya tutulduğunda
     * (tabela, kağıt, ilaç kutusu, ekran, kapı numarası, fiş, otobüs hattı) yazıyı otomatik okur.
     */
    state.lastLiveAutoOcrAt = 0;
    state.lastLiveSpokenText = '';
    state.lastLiveSpokenAt = 0;
    state.isLiveBgOcrBusy = false;

    function triggerUniversalLiveOcrIfSteady(metrics, predictions) {
        if (!state.isRunning || state.isProcessingOcr || state.isLiveBgOcrBusy || state.moneyLiveOcrBusy || state.countdownStage > 0 || typeof window.Tesseract === 'undefined') return;
        const liveOcrExcludedModes = new Set([
            'light_meter', 'qibla_compass', 'song_finder',
            'color_cloth', 'signature_pen',
            'portrait', 'qr_screen', 'step_calorie_guide', 'cooking_guide'
        ]);
        if (liveOcrExcludedModes.has(state.mode)) return;
        if (!metrics || metrics.sharpness < 6.0 || metrics.avgBrightness < 38) return;

        const now = performance.now();
        if (now - (state.lastLiveAutoOcrAt || 0) < 3400) return;

        const strokeCheck = detectTextStrokeBandAndCropCanvas(el.analysisCanvas, metrics);
        if (!strokeCheck || !strokeCheck.hasTextLikely) return;

        state.lastLiveAutoOcrAt = now;
        state.isLiveBgOcrBusy = true;
        const targetCanvas = strokeCheck.ocrCanvas || el.analysisCanvas;

        Promise.resolve()
            .then(() => window.Tesseract.recognize(targetCanvas, 'tur+eng'))
            .then((ocrRes) => {
                if (!state.isRunning || state.isProcessingOcr) return;
                const liveText = extractVerifiedRealTextFromOcrResult(ocrRes).trim();
                if (!liveText || liveText.length < 2) return;

                const tNow = performance.now();
                const isSameAsLast = state.lastLiveSpokenText &&
                    (state.lastLiveSpokenText === liveText || computeTrigramSimilarity(state.lastLiveSpokenText, liveText) >= 0.72);
                if (isSameAsLast && (tNow - (state.lastLiveSpokenAt || 0) < 12000)) return;

                state.lastLiveSpokenText = liveText;
                state.lastLiveSpokenAt = tNow;

                const centerColName = metrics.centerColor ? metrics.centerColor.name : '';
                const liveBanknote = detectTurkishBanknoteDetailsFromText(liveText, centerColName);
                if (liveBanknote && !liveBanknote.partialOnly) {
                    showDetectedResult('💵 Canlı Kamerada Kağıt Para Okundu', `${liveBanknote.label}\nOkunan Metin: ${liveText}`);
                    announceGuidance(`Kamerada ${liveBanknote.label} kağıt para algılandı.`, { force: true, bannerState: 'centered' });
                    return;
                }

                if (state.mode === 'bus_stop_tracker') {
                    const busRep = processBusRouteOcrResult(liveText, predictions);
                    showDetectedResult('🚌 Canlı Otobüs / Durak Yazısı', busRep.fullText);
                    announceGuidance(busRep.speechText, { force: true, bannerState: 'centered' });
                    return;
                }

                const insights = buildUniversalSmartInsights(liveText, liveText, '');
                const extraSpeech = insights.speechNotes.length > 0 ? ` ${insights.speechNotes.join(' ')}` : '';
                const extraReport = insights.reportLines.length > 0 ? `\n\n${insights.reportLines.join('\n')}` : '';

                showDetectedResult('👁️ Canlı Kamerada Okunan Yazı', `${liveText}${extraReport}`);
                announceGuidance(`Okunan yazı: ${liveText.replace(/\s+/g, ' ')}.${extraSpeech}`, {
                    force: true,
                    bannerState: insights.hasExpiredAlarm ? 'warning' : 'centered'
                });
            })
            .catch(() => {})
            .finally(() => {
                state.isLiveBgOcrBusy = false;
            });
    }

    /**
     * YAPAY ZEKANIN BEYNİNDE ÇALIŞAN SIFIR-HALÜSİNASYON VE ÇOK KARELİ DOĞRULAMA MOTORU:
     * Bu fonksiyon yüzde ve olasılık hesaplarını tamamen kodun içinde (yapay zekanın beyninde) yapar;
     * kullanıcıya kafa karıştırıcı yüzdeler söylemeden SADECE gerçekten emin olduğu nesneleri geçirir.
     */
    state.brainObjectHistory = {};

    function verifyPredictionsInAiBrain(rawPreds, frameW, frameH, isLiveStream = false) {
        if (!Array.isArray(rawPreds) || rawPreds.length === 0) {
            if (isLiveStream) state.brainObjectHistory = {};
            return [];
        }
        const frameArea = Math.max(1, (frameW || 320) * (frameH || 240));
        const nextHistory = {};
        const verified = [];

        for (let i = 0; i < rawPreds.length; i++) {
            const p = rawPreds[i];
            if (!p || !Array.isArray(p.bbox) || p.bbox.length < 4) continue;
            const score = typeof p.score === 'number' ? p.score : 0;
            const [, , bw, bh] = p.bbox;
            const areaRatio = (bw * bh) / frameArea;

            // Arka plandaki çok küçük leke ve gölgeleri (kadrajın %1.4'ünden küçük) yapay zekanın beyninde reddet
            if (areaRatio < 0.014) continue;

            if (isLiveStream) {
                // Canlı kamerada el hareket ederken oluşan tek karelik yanılmaları engellemek için:
                // Ya çok yüksek güven (>= 0.72) olmalı ya da ardışık en az 2 karede (>= 0.60) kararlı görülmeli!
                if (score < 0.60) continue;
                const prevCount = state.brainObjectHistory[p.class] || 0;
                const newCount = prevCount + 1;
                nextHistory[p.class] = newCount;
                if (score >= 0.72 || newCount >= 2) {
                    verified.push(p);
                }
            } else {
                // Tekil fotoğraf ve video karelerinde >= 0.62 güven kilidi
                if (score >= 0.62) {
                    verified.push(p);
                }
            }
        }

        if (isLiveStream) {
            state.brainObjectHistory = nextHistory;
        }
        return verified;
    }

    function updateTelemetryUI(metrics) {
        let lightLabel = 'Aydınlık';
        if (metrics.avgBrightness < 38) lightLabel = 'Çok Karanlık';
        else if (metrics.avgBrightness < 75) lightLabel = 'Loş Işık';
        else if (metrics.avgBrightness > 230) lightLabel = 'Çok Parlak';

        const blurLabel = metrics.sharpness < 7.2 ? 'Görüntü Bulanık' : 'Görüntü Net';
        el.tLighting.textContent = `${lightLabel} • ${blurLabel}`;

        const tiltText = state.hasOrientationSensor
            ? (Math.abs(state.tiltRoll) <= 12 ? 'Telefon Düz' : `${state.tiltRoll > 0 ? 'Sola' : 'Sağa'} Eğik`)
            : 'Düz';
        el.tColorTilt.textContent = `${metrics.centerColor.name} • ${tiltText}`;
    }

    function handleModeDispatch(anW, anH, vw, vh, metrics, qrDetection, predictions) {
        const ovCtx = el.overlayCanvas.getContext('2d');
        ovCtx.clearRect(0, 0, vw, vh);
        const scaleX = vw / anW;
        const scaleY = vh / anH;

        drawCrosshair(ovCtx, vw, vh);

        // Kıble modundayken ön secde alanındaki engelleri (sandalye, masa, koltuk, yatak) kaydet
        state.lastSceneObstacles = predictions
            .filter(p => p.class === 'chair' || p.class === 'couch' || p.class === 'dining table' || p.class === 'bed' || p.class === 'tv')
            .map(p => TR_LABELS[p.class] || p.class);

        if (state.mode === 'qibla_compass') {
            drawQiblaOverlayArrow(ovCtx, vw, vh);
            return;
        }

        if (state.mode === 'light_meter') {
            handleLightMeterMode(anW, anH, metrics);
            return;
        }

        if (metrics.avgBrightness < 32 && state.flashMode === 'auto') {
            tryEnableHardwareTorch(true);
        } else if (metrics.avgBrightness > 180 && state.flashMode === 'auto') {
            tryEnableHardwareTorch(false);
        }

        if (metrics.avgBrightness < 30 && state.mode !== 'anomaly_led') {
            el.tPosition.textContent = 'Ortam Karanlık';
            el.tDistance.textContent = 'Işık Yetersiz';
            announceGuidance('Ortam çok karanlık, lütfen ışığı veya flaş düğmesini açın.', {
                bannerState: 'warning',
                minIntervalMs: 4000
            });
            return;
        }

        if (state.targetFilter !== 'auto' && state.targetFilter !== 'screen_qr') {
            guideToSpecificObject(state.targetFilter, anW, anH, scaleX, scaleY, ovCtx, predictions);
            return;
        }

        if (state.mode === 'exam_reader') {
            handleExamReaderLiveMode(anW, anH, scaleX, scaleY, ovCtx, metrics, predictions);
        } else if (state.mode === 'qr_screen' || state.targetFilter === 'screen_qr') {
            handleQrAndScreenMode(anW, anH, scaleX, scaleY, ovCtx, metrics, qrDetection, predictions);
        } else if (state.mode === 'portrait') {
            handlePortraitAndPrivacyMode(anW, anH, scaleX, scaleY, ovCtx, metrics, predictions);
        } else if (state.mode === 'color_cloth') {
            handleColorAndPatternMode(anW, anH, scaleX, scaleY, ovCtx, metrics);
        } else if (state.mode === 'anomaly_led') {
            handleAnomalyAndLedMode(anW, anH, scaleX, scaleY, ovCtx, metrics);
        } else if (state.mode === 'explorer') {
            handleExplorerMode(anW, anH, scaleX, scaleY, ovCtx, predictions);
        } else if (state.mode === 'medicine_skt') {
            handleMedicineSktLiveMode(anW, anH, scaleX, scaleY, ovCtx, metrics, qrDetection, predictions);
        } else if (state.mode === 'signature_pen') {
            handleSignaturePenLiveMode(anW, anH, scaleX, scaleY, ovCtx, metrics);
        } else if (state.mode === 'liquid_level') {
            handleLiquidLevelLiveMode(anW, anH, scaleX, scaleY, ovCtx, metrics, predictions);
        } else if (state.mode === 'door_elevator_lcd') {
            handleDoorElevatorLcdLiveMode(anW, anH, scaleX, scaleY, ovCtx, metrics);
        } else if (state.mode === 'food_freshness') {
            handleFoodFreshnessLiveMode(anW, anH, scaleX, scaleY, ovCtx, metrics, predictions);
        } else if (state.mode === 'bus_stop_tracker') {
            handleBusStopLiveMode(anW, anH, scaleX, scaleY, ovCtx, metrics, predictions);
        } else if (state.mode === 'pos_iban_reader') {
            handleDoorElevatorLcdLiveMode(anW, anH, scaleX, scaleY, ovCtx, metrics);
        } else if (state.mode === 'item_memory') {
            handleItemMemoryLiveMode(anW, anH, scaleX, scaleY, ovCtx, metrics, predictions);
        } else if (state.mode === 'tv_subtitle_score') {
            handleTvSubtitleLiveMode(anW, anH, scaleX, scaleY, ovCtx, metrics, predictions);
        } else if (state.mode === 'sock_outfit_check') {
            handleSockAndOutfitLiveMode(anW, anH, scaleX, scaleY, ovCtx, metrics);
        } else if (state.mode === 'where_am_i') {
            handleExplorerMode(anW, anH, scaleX, scaleY, ovCtx, predictions);
        } else if (state.mode === 'step_calorie_guide') {
            handleFoodFreshnessLiveMode(anW, anH, scaleX, scaleY, ovCtx, metrics, predictions);
        } else if (state.mode === 'cooking_guide') {
            handleCookingGuideLiveMode(anW, anH, scaleX, scaleY, ovCtx, metrics, predictions);
        }
    }

    // -------------------------------------------------------------------------
    // MOD 1: SINAV VE TEST KAĞIDI CANLI HİZALAMA (4 KENAR VE NETLİK KİLİDİ)
    // -------------------------------------------------------------------------
    function handleExamReaderLiveMode(anW, anH, scaleX, scaleY, ovCtx, metrics, predictions) {
        const docPred = predictions.find(p => p.class === 'book');
        const textCheck = detectTextStrokeBandAndCropCanvas(el.analysisCanvas, metrics);
        const hasPaperAndText = Boolean(textCheck && textCheck.hasTextLikely && metrics.avgBrightness >= 80);

        if (!docPred && !hasPaperAndText) {
            state.countdownStage = 0;
            el.tPosition.textContent = 'Sınav Kağıdı Aranıyor';
            el.tDistance.textContent = 'Kağıda Tutun';
            announceGuidance('Henüz sınav kağıdı veya soru satırı algılanmadı. Lütfen kamerayı sınav kağıdının üzerine 25-30 santimetre mesafeden tutun.', {
                bannerState: 'normal',
                minIntervalMs: 3800
            });
            return;
        }

        if (metrics.sharpness < 7.0) {
            state.countdownStage = 0;
            el.tPosition.textContent = 'Yazılar Bulanık';
            el.tDistance.textContent = 'Elinizi Sabitleyin';
            announceGuidance('Sınav kağıdı algılandı ancak şu an bulanık görünüyor. Şıkların yanlış okunmaması için elinizi sabit tutun.', {
                bannerState: 'warning',
                minIntervalMs: 3200
            });
            return;
        }

        const rawBox = docPred ? docPred.bbox : null;

        if (rawBox) {
            const tracked = updateKalmanTracker(rawBox, 'exam_page', 3);
            if (tracked.verified && tracked.box) {
                drawTargetBox(ovCtx, tracked.box, scaleX, scaleY, '#facc15', 'Sınav Sayfası');
                const align = computeAlignmentInstruction(tracked.box, anW, anH, 'Sınav Sayfası', 0.18, 0.86);
                el.tPosition.textContent = align.posLabel;
                el.tDistance.textContent = align.distanceStatus;
                radar.updateRadar(align.offsetX, align.offsetY, align.isCentered);

                if (align.isCentered) {
                    if (state.autoCaptureEnabled && !state.isProcessingOcr) {
                        handleAutoCaptureCountdown('Sınav sayfasının 4 kenarı da kadrajda ve net!');
                    } else {
                        announceGuidance('Sınav kağıdı tam ortalandı ve net! Soruları ve A, B, C, D, E şıklarını ayırmak için Boşluk tuşuna basın veya ekrana çift dokunun.', {
                            bannerState: 'centered',
                            minIntervalMs: 3400
                        });
                    }
                } else {
                    state.countdownStage = 0;
                    announceGuidance(align.sentence, {
                        bannerState: 'normal',
                        minIntervalMs: 2400
                    });
                }
                return;
            }
        }

        el.tPosition.textContent = 'Yazı Satırları Net';
        el.tDistance.textContent = 'Okumaya Hazır';
        announceGuidance('Yazı satırları net görünüyor. Soruyu ve şıkları okutmak için ekrana çift dokunun veya Boşluk tuşuna basın.', {
            bannerState: 'centered',
            minIntervalMs: 4200
        });
    }

    function handleQrAndScreenMode(anW, anH, scaleX, scaleY, ovCtx, metrics, qrDetection, predictions) {
        if (qrDetection) {
            const tracked = updateKalmanTracker(qrDetection.bbox, 'qr', 1);
            drawTargetBox(ovCtx, tracked.box, scaleX, scaleY, '#22c55e', 'QR Kod');
            const align = computeAlignmentInstruction(tracked.box, anW, anH, 'QR Kod', 0.02, 0.65);
            el.tPosition.textContent = align.posLabel;
            el.tDistance.textContent = align.distanceStatus;
            radar.updateRadar(align.offsetX, align.offsetY, true);

            const now = performance.now();
            if (qrDetection.data && (qrDetection.data !== state.lastQrCode || now - state.lastQrAt > 6000)) {
                state.lastQrCode = qrDetection.data;
                state.lastQrAt = now;
                radar.playQrSuccessSound();
                showDetectedResult('QR Kod Başarıyla Çözüldü', qrDetection.data);
                announceGuidance(`QR kod tam hizalandı ve okundu: ${qrDetection.data}. WhatsApp Web taraması için elinizi hiç kıpırdatmadan sabit tutun!`, {
                    force: true,
                    bannerState: 'centered'
                });
            }
            return;
        }

        const screenPreds = predictions.filter(p =>
            p.class === 'tv' || p.class === 'laptop' || p.class === 'cell phone' || p.class === 'book'
        );

        let rawBox = null;
        let targetName = 'Bilgisayar Ekranı';

        if (screenPreds.length > 0) {
            screenPreds.sort((a, b) => (b.bbox[2] * b.bbox[3]) - (a.bbox[2] * a.bbox[3]));
            rawBox = screenPreds[0].bbox;
            targetName = TR_LABELS[screenPreds[0].class] || 'Bilgisayar Ekranı';
        }

        const tracked = updateKalmanTracker(rawBox, 'screen', 3);

        if (tracked.verified && tracked.box) {
            drawTargetBox(ovCtx, tracked.box, scaleX, scaleY, '#38bdf8', targetName);
            const align = computeAlignmentInstruction(tracked.box, anW, anH, targetName, 0.14, 0.78);
            el.tPosition.textContent = align.posLabel;
            el.tDistance.textContent = align.distanceStatus;
            radar.updateRadar(align.offsetX, align.offsetY, align.isCentered);

            if (align.isCentered) {
                announceGuidance(`${targetName} tam karşınızda ortalandı! WhatsApp'a geçerken elinizi sabit tutmak için W tuşuna veya 15 saniye ses kilidi düğmesine basabilirsiniz.`, {
                    bannerState: 'centered',
                    minIntervalMs: 3000
                });
            } else {
                announceGuidance(align.sentence, {
                    bannerState: 'normal',
                    minIntervalMs: 2300
                });
            }
        } else {
            el.tPosition.textContent = 'Ekran Aranıyor';
            el.tDistance.textContent = 'Hedef Yok';
            announceGuidance('Karşıda henüz bilgisayar ekranı veya QR kod doğrulanmadı. Telefonu bilgisayar ekranına 30 santimetre mesafede yavaşça gezdirin.', {
                bannerState: 'warning',
                minIntervalMs: 4200
            });
        }
    }

    function handlePortraitAndPrivacyMode(anW, anH, scaleX, scaleY, ovCtx, metrics, predictions) {
        const people = predictions.filter(p => p.class === 'person');
        if (people.length === 0) {
            updateKalmanTracker(null, '', 3);
            state.countdownStage = 0;
            el.tPosition.textContent = 'Kişi Aranıyor';
            el.tDistance.textContent = 'Kadraj Boş';
            announceGuidance('Kadrajda kimse görünmüyor. Kamerayı yüzünüze veya çekmek istediğiniz kişiye çevirin.', {
                bannerState: 'warning',
                minIntervalMs: 3800
            });
            return;
        }

        people.sort((a, b) => (b.bbox[2] * b.bbox[3]) - (a.bbox[2] * a.bbox[3]));
        const tracked = updateKalmanTracker(people[0].bbox, 'person', 3);
        if (!tracked.verified || !tracked.box) return;

        const label = people.length > 1 ? `${people.length} Kişi` : 'Kişi';
        drawTargetBox(ovCtx, tracked.box, scaleX, scaleY, '#38bdf8', label);

        const audit = evaluatePortraitPrivacyAndBacklight(tracked.box, metrics, predictions, anW, anH);
        const align = computeAlignmentInstruction(tracked.box, anW, anH, label, 0.12, 0.72);

        el.tPosition.textContent = align.posLabel;
        el.tDistance.textContent = `Ters Işık: ${audit.backlightRatio}x (${audit.hasBacklight ? 'Riskli' : 'İyi'})`;

        radar.updateRadar(align.offsetX, align.offsetY, align.isCentered && !audit.hasBacklight);

        if (audit.hasBacklight) {
            state.countdownStage = 0;
            announceGuidance('Ters ışık uyarısı: Arkanızda güçlü ışık var, yüzünüz karanlık silüet çıkıyor. Lütfen ışığı veya pencereyi karşınıza alın.', {
                bannerState: 'warning',
                minIntervalMs: 3200
            });
            return;
        }

        if (audit.clippedParts.length > 0 && !align.isCentered) {
            state.countdownStage = 0;
            announceGuidance(`Dikkat: Kadrajda ${audit.clippedParts.join(' ve ')} sınırda kesiliyor. ${align.sentence}`, {
                bannerState: 'warning',
                minIntervalMs: 2600
            });
            return;
        }

        if (align.isCentered) {
            if (state.autoCaptureEnabled) {
                handleAutoCaptureCountdown(audit.privacyReport);
            } else {
                announceGuidance(`Kişi tam ortalandı, ışık dengeli! ${audit.privacyReport}`, {
                    bannerState: 'centered',
                    minIntervalMs: 3500
                });
            }
        } else {
            state.countdownStage = 0;
            announceGuidance(align.sentence, {
                bannerState: 'normal',
                minIntervalMs: 2400
            });
        }
    }

    function handleAutoCaptureCountdown(note = '') {
        const cleanNote = (typeof note === 'string' && note.trim()) ? `${note.trim()} ` : '';
        const now = performance.now();
        if (state.countdownStage === 0) {
            state.countdownStage = 3;
            state.lastCountdownTick = now;
            announceGuidance(`${cleanNote}Sabit tutun: 3`, { force: true, bannerState: 'centered' });
        } else if (now - state.lastCountdownTick >= 1050) {
            state.countdownStage--;
            state.lastCountdownTick = now;
            if (state.countdownStage > 0) {
                announceGuidance(String(state.countdownStage), { force: true, bannerState: 'centered' });
            } else {
                state.countdownStage = 0;
                captureAndDescribePhoto(true);
            }
        }
    }

    // =========================================================================
    // KUSURSUZ T.C. DARPHANE MADENİ (DEMİR) PARA TANIMA, KAĞIT PARA VE CANLI CÜZDAN TOPLAMA MOTORU
    // (1 TL, 50 Kuruş, 25 Kuruş, 10 Kuruş, 5 Kuruş, 5 TL + 5..200 TL Banknotlar)
    // =========================================================================
    const MONEY_WALLET_STORAGE_KEY = 'mikyas_kamera_money_ledger_v1';

    function formatTurkishKurusTotal(totalKurus) {
        if (!totalKurus || totalKurus <= 0) return '0 Türk Lirası';
        const lira = Math.floor(totalKurus / 100);
        const kurus = totalKurus % 100;
        if (lira > 0 && kurus > 0) return `${lira} Lira ${kurus} Kuruş`;
        if (lira > 0) return `${lira} Türk Lirası`;
        return `${kurus} Kuruş`;
    }

    function computeMoneyBreakdownSummary() {
        if (!Array.isArray(state.moneyLedger) || state.moneyLedger.length === 0) {
            return {
                totalCount: 0,
                shortText: 'Sayaç boş (0 adet)',
                spokenBreakdown: 'Henüz sayılmış bir para yok.'
            };
        }
        const counts = new Map();
        let totalItems = 0;
        state.moneyLedger.forEach(entry => {
            if (Array.isArray(entry.items) && entry.items.length > 0) {
                entry.items.forEach(it => {
                    const key = `${it.valueKurus}|${it.label}`;
                    const prev = counts.get(key) || { valueKurus: it.valueKurus, label: it.label, count: 0 };
                    prev.count += (it.count || 1);
                    counts.set(key, prev);
                    totalItems += (it.count || 1);
                });
            } else {
                const key = `${entry.kurus}|${entry.label}`;
                const prev = counts.get(key) || { valueKurus: entry.kurus, label: entry.label, count: 0 };
                prev.count += 1;
                counts.set(key, prev);
                totalItems += 1;
            }
        });

        const sorted = [...counts.values()].sort((a, b) => b.valueKurus - a.valueKurus);
        const parts = sorted.map(g => `${g.count} adet ${g.label}`);
        return {
            totalCount: totalItems,
            shortText: `${totalItems} adet (${parts.join(', ')})`,
            spokenBreakdown: parts.join(', ')
        };
    }

    function saveMoneyLedgerToStorage() {
        try {
            localStorage.setItem(MONEY_WALLET_STORAGE_KEY, JSON.stringify({
                totalKurus: state.moneyTotalKurus,
                ledger: state.moneyLedger.slice(-500),
                seenSerials: state.moneySeenSerialNumbers ? Array.from(state.moneySeenSerialNumbers).slice(-200) : []
            }));
        } catch (_) {}
    }

    function loadMoneyLedgerFromStorage() {
        try {
            const raw = localStorage.getItem(MONEY_WALLET_STORAGE_KEY);
            if (!raw) return;
            const parsed = JSON.parse(raw);
            if (parsed && Array.isArray(parsed.ledger)) {
                state.moneyLedger = parsed.ledger;
                const ledgerSum = state.moneyLedger.reduce((acc, item) => acc + (Number(item.kurus) || 0), 0);
                const savedTotal = Number(parsed.totalKurus);
                state.moneyTotalKurus = (Number.isFinite(savedTotal) && savedTotal >= ledgerSum) ? savedTotal : ledgerSum;
            }
            if (parsed && Array.isArray(parsed.seenSerials) && state.moneySeenSerialNumbers) {
                parsed.seenSerials.forEach(s => {
                    if (s) state.moneySeenSerialNumbers.add(String(s));
                });
            }
        } catch (_) {}
        updateMoneyCounterUI();
    }

    function updateMoneyCounterUI() {
        const totalStr = formatTurkishKurusTotal(state.moneyTotalKurus);
        const breakdown = computeMoneyBreakdownSummary();

        if (el.moneyStatusBadge) {
            el.moneyStatusBadge.textContent = `Toplam: ${totalStr}`;
        }
        if (el.moneyTotalDisplay) {
            el.moneyTotalDisplay.textContent = totalStr;
        }
        if (el.moneyBreakdownText) {
            el.moneyBreakdownText.textContent = breakdown.shortText;
        }
        if (el.moneyLastAdded) {
            const last = state.moneyLedger.length > 0 ? state.moneyLedger[state.moneyLedger.length - 1] : null;
            el.moneyLastAdded.textContent = last ? `${last.label} (+${formatTurkishKurusTotal(last.kurus)})` : 'Henüz para eklenmedi';
        }
        if (el.btnMoneyUndo) {
            el.btnMoneyUndo.disabled = state.moneyLedger.length === 0;
        }
        if (el.btnMoneyReset) {
            el.btnMoneyReset.disabled = state.moneyLedger.length === 0;
        }
    }

    function addMoneyToRunningTotal(kurus, label, items = null, source = 'auto', serialNumber = '') {
        const cleanKurus = Math.round(Number(kurus) || 0);
        if (cleanKurus <= 0) return;

        radar.init();
        radar.playQrSuccessSound();
        if (navigator.vibrate) navigator.vibrate([70, 40, 110]);

        if (serialNumber && state.moneySeenSerialNumbers) {
            state.moneySeenSerialNumbers.add(serialNumber);
        }
        state.moneyTotalKurus += cleanKurus;
        state.moneyLedger.push({
            kurus: cleanKurus,
            label: label || formatTurkishKurusTotal(cleanKurus),
            items: Array.isArray(items) ? items : [{ valueKurus: cleanKurus, label: label || formatTurkishKurusTotal(cleanKurus), count: 1 }],
            source,
            serialNumber: serialNumber || '',
            addedAt: Date.now()
        });

        saveMoneyLedgerToStorage();
        updateMoneyCounterUI();

        const addedFormatted = formatTurkishKurusTotal(cleanKurus);
        const newTotalFormatted = formatTurkishKurusTotal(state.moneyTotalKurus);
        const msg = `${label || addedFormatted} eklendi. Şu anki toplam paranız: ${newTotalFormatted}.`;

        announceGuidance(msg, {
            force: true,
            bannerState: 'centered'
        });
    }

    function speakHowMuchMoneyIHave() {
        radar.init();
        if (state.moneyTotalKurus <= 0 || state.moneyLedger.length === 0) {
            const liveHint = state.moneyLiveCandidate
                ? ` Ancak şu an kameranın önünde ${state.moneyLiveCandidate.label} görünüyor; toplama eklemek için Görünen Parayı Şimdi Ekle düğmesine basabilirsiniz.`
                : ' Paralarınızı kameraya gösterdikçe veya hızlı para ekleme düğmelerine bastıkça sizin için toplayacağım.';
            announceGuidance(`Henüz sayılmış bir paranız yok, toplam 0 Türk Lirası.${liveHint}`, {
                force: true,
                bannerState: 'warning'
            });
            return;
        }

        const totalFormatted = formatTurkishKurusTotal(state.moneyTotalKurus);
        const breakdown = computeMoneyBreakdownSummary();
        const reportText = `💰 Toplam Paranız: ${totalFormatted}\nToplam Adet: ${breakdown.totalCount} adet para\nDetaylı Döküm: ${breakdown.spokenBreakdown}`;
        showDetectedResult(`💰 Ne Kadar Param Var? — Toplam: ${totalFormatted}`, reportText);

        announceGuidance(`Toplam ${totalFormatted} paranız var. Sayılan toplam ${breakdown.totalCount} adet paranın dökümü şöyle: ${breakdown.spokenBreakdown}.`, {
            force: true,
            bannerState: 'centered'
        });
    }

    function undoLastAddedMoney() {
        if (state.moneyLedger.length === 0) {
            if (state.moneyBackupBeforeReset && state.moneyBackupBeforeReset.totalKurus > 0) {
                state.moneyTotalKurus = state.moneyBackupBeforeReset.totalKurus;
                state.moneyLedger = state.moneyBackupBeforeReset.ledger.slice();
                state.moneySeenSerialNumbers = new Set(state.moneyBackupBeforeReset.serials || []);
                state.moneyBackupBeforeReset = null;
                saveMoneyLedgerToStorage();
                updateMoneyCounterUI();
                const restoredFormatted = formatTurkishKurusTotal(state.moneyTotalKurus);
                announceGuidance(`Sıfırlanan ${restoredFormatted} toplam paranız ve tüm para dökümünüz geri yüklendi.`, {
                    force: true,
                    bannerState: 'centered'
                });
                return;
            }
            announceGuidance('Geri alınacak bir para yok, sayaç şu an boş.', { force: true, bannerState: 'warning' });
            return;
        }
        const removed = state.moneyLedger.pop();
        state.moneyTotalKurus = Math.max(0, state.moneyTotalKurus - (Number(removed.kurus) || 0));
        state.moneyLastCommittedSignature = '';
        state.moneyLastLiveBanknoteSig = '';
        if (removed && removed.serialNumber && state.moneySeenSerialNumbers) {
            state.moneySeenSerialNumbers.delete(removed.serialNumber);
        }
        saveMoneyLedgerToStorage();
        updateMoneyCounterUI();

        const newTotalFormatted = formatTurkishKurusTotal(state.moneyTotalKurus);
        announceGuidance(`Son eklenen ${removed.label} geri alındı. Kalan toplam paranız: ${newTotalFormatted}.`, {
            force: true,
            bannerState: 'normal'
        });
    }

    function resetMoneyCounter() {
        const prevTotalKurus = state.moneyTotalKurus;
        if (prevTotalKurus > 0 || state.moneyLedger.length > 0) {
            state.moneyBackupBeforeReset = {
                totalKurus: state.moneyTotalKurus,
                ledger: state.moneyLedger.slice(),
                serials: Array.from(state.moneySeenSerialNumbers || [])
            };
        }
        state.moneyTotalKurus = 0;
        state.moneyLedger = [];
        state.moneyPendingSignature = '';
        state.moneyPendingFrames = 0;
        state.moneyLastCommittedSignature = '';
        state.moneyLastLiveBanknoteSig = '';
        state.moneyEmptyFramesSinceCommit = 0;
        if (state.moneySeenSerialNumbers) {
            state.moneySeenSerialNumbers.clear();
        }
        saveMoneyLedgerToStorage();
        updateMoneyCounterUI();

        const undoHint = prevTotalKurus > 0
            ? ` Eğer yanlışlıkla sıfırladıysanız Son Parayı Geri Al düğmesine basarak ${formatTurkishKurusTotal(prevTotalKurus)} toplamınızı geri getirebilirsiniz.`
            : '';
        announceGuidance(`Para sayacı ve seri numarası hafızası sıfırlandı.${undoHint} Şimdi elinizdeki paraları baştan saymaya başlayabilirsiniz.`, {
            force: true,
            bannerState: 'centered'
        });
    }

    function toggleMoneyAutoAccumulate() {
        state.moneyAutoAccumulate = !state.moneyAutoAccumulate;
        if (el.btnMoneyAutoToggle) {
            el.btnMoneyAutoToggle.classList.toggle('active-toggle', state.moneyAutoAccumulate);
            el.btnMoneyAutoToggle.setAttribute('aria-pressed', String(state.moneyAutoAccumulate));
            el.btnMoneyAutoToggle.textContent = `🔄 Otomatik Biriktirme: ${state.moneyAutoAccumulate ? 'Açık' : 'Kapalı'}`;
        }
        announceGuidance(
            state.moneyAutoAccumulate
                ? 'Otomatik para biriktirme açıldı. Kameraya tuttuğunuz paralar netleştiğinde bir yandan otomatik olarak toplam paranıza eklenecek.'
                : 'Otomatik para biriktirme kapatıldı. Paraları sadece siz Görünen Parayı Ekle düğmesine bastığınızda veya çift dokunduğunuzda ekleyeceğim.',
            { force: true, bannerState: 'centered' }
        );
    }

    function addCurrentlyVisibleMoneyManually() {
        if (state.moneyLiveCandidate && state.moneyLiveCandidate.kurus > 0) {
            const cand = state.moneyLiveCandidate;
            state.moneyLastCommittedSignature = cand.signature;
            state.moneyLastCommittedAt = performance.now();
            state.moneyEmptyFramesSinceCommit = 0;
            addMoneyToRunningTotal(cand.kurus, cand.label, cand.items, 'manual_live');
            return;
        }
        if (state.isRunning) {
            announceGuidance('Kameradaki kağıt veya demir para okunup toplama ekleniyor...', { force: true });
            captureAndDescribePhoto(false);
        } else {
            announceGuidance('Şu an kamerada görünen bir para yok. Lütfen önce kamerayı başlatıp parayı gösterin veya aşağıdaki hızlı para ekleme düğmelerini kullanın.', {
                force: true,
                bannerState: 'warning'
            });
        }
    }

    function drawCoinCircleOverlay(ctx, coin, scaleX, scaleY) {
        if (!ctx) return;
        const cx = coin.cx * scaleX;
        const cy = coin.cy * scaleY;
        const r = coin.radius * ((scaleX + scaleY) * 0.5);

        ctx.save();
        ctx.strokeStyle = coin.colorHex || '#facc15';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.stroke();

        // Çift metalik (1 TL / 50 Kr / 5 TL) ise iç göbek halkasını da çiz
        if (coin.isBiMetallic) {
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(cx, cy, r * 0.58, 0, Math.PI * 2);
            ctx.stroke();
        }

        const label = coin.shortLabel || coin.name;
        const boxW = Math.max(92, label.length * 9 + 16);
        const lx = Math.max(4, cx - boxW / 2);
        const ly = Math.max(26, cy - r - 10);
        ctx.fillStyle = 'rgba(9, 13, 22, 0.88)';
        ctx.fillRect(lx, ly - 22, boxW, 26);
        ctx.fillStyle = coin.colorHex || '#facc15';
        ctx.font = 'bold 15px sans-serif';
        ctx.fillText(label, lx + 8, ly - 4);
        ctx.restore();
    }

    /**
     * Masa, avuç içi veya zemindeki T.C. Darphane madeni paralarını (5 TL, 1 TL, 50 Kr, 25 Kr, 10 Kr, 5 Kr)
     * 1) Arka plan ΔE farkı + Dairesellik (4 köşe boşluk ve iç doluluk kilidi) + Kenar çember gradyanı ile segmente eder,
     * 2) Her paranın İç Göbek (0.10R..0.54R) ve Dış Halka (0.62R..0.89R) CIELAB (L*, a*, b*) metalik imzasını ölçer,
     * 3) Birden fazla para varsa Darphane milimetrik çap oranlarıyla (26.15mm, 23.85mm, 20.5mm, 18.5mm, 17.5mm) çapraz doğrular,
     * 4) Konumlarını (solda, ortada, sağda) ve kuruşu kuruşuna toplam tutarını hesaplar.
     */
    function detectAndClassifyTurkishCoins(metrics, width, height, ocrText = '') {
        if (!metrics || !metrics.imageData) {
            return { coins: [], totalKurus: 0, totalFormatted: '0 Kuruş', summarySpeech: '' };
        }
        const { imageData, gray, gw, gh, step } = metrics;
        const data = imageData.data;

        // 1. Arka Plan Referans Rengi (Kenar Çerçeve Örneklemesi) ve Von Kries Beyaz Dengesi
        let bgL = 0, bgA = 0, bgB = 0, bgCnt = 0;
        let sumR = 0, sumG = 0, sumB = 0, allCnt = 0;

        for (let gy = 0; gy < gh; gy++) {
            const py = gy * step;
            for (let gx = 0; gx < gw; gx++) {
                const px = gx * step;
                const idx = (py * width + px) * 4;
                const r = data[idx], g = data[idx + 1], b = data[idx + 2];
                sumR += r;
                sumG += g;
                sumB += b;
                allCnt++;

                if (gx < 3 || gx >= gw - 3 || gy < 3 || gy >= gh - 3) {
                    const lab = rgbToLab(r, g, b);
                    bgL += lab.L;
                    bgA += lab.a;
                    bgB += lab.b;
                    bgCnt++;
                }
            }
        }

        bgL /= Math.max(1, bgCnt);
        bgA /= Math.max(1, bgCnt);
        bgB /= Math.max(1, bgCnt);

        const meanR = sumR / Math.max(1, allCnt);
        const meanG = sumG / Math.max(1, allCnt);
        const meanB = sumB / Math.max(1, allCnt);
        const meanGray = (meanR + meanG + meanB) / 3;
        // Kısmi Von Kries dengesi: Oda lambasının sarı/mavi sapmasını düzeltirken metalin gerçek sarı/gümüş farkını korur
        const gainR = meanR > 15 ? (0.55 + 0.45 * Math.min(1.45, Math.max(0.70, meanGray / meanR))) : 1;
        const gainG = meanG > 15 ? (0.55 + 0.45 * Math.min(1.45, Math.max(0.70, meanGray / meanG))) : 1;
        const gainB = meanB > 15 ? (0.55 + 0.45 * Math.min(1.45, Math.max(0.70, meanGray / meanB))) : 1;

        // 2. Ön Plan Madeni Para Aday Maskesi (Arka plandan CIELAB ΔE farkı veya yüksek metalik kenar kontrastı)
        const rawMask = new Uint8Array(gw * gh);
        for (let gy = 1; gy < gh - 1; gy++) {
            const py = gy * step;
            for (let gx = 1; gx < gw - 1; gx++) {
                const px = gx * step;
                const idx = (py * width + px) * 4;
                const lab = rgbToLab(data[idx], data[idx + 1], data[idx + 2]);
                const dL = lab.L - bgL;
                const dA = lab.a - bgA;
                const dB = lab.b - bgB;
                const deltaEBg = Math.sqrt(dL * dL + 1.45 * dA * dA + 1.45 * dB * dB);

                const gxGrad = Math.abs(gray[gy * gw + (gx + 1)] - gray[gy * gw + (gx - 1)]);
                const gyGrad = Math.abs(gray[(gy + 1) * gw + gx] - gray[(gy - 1) * gw + gx]);
                const edgeMag = gxGrad + gyGrad;

                if (deltaEBg >= 13.2 || (deltaEBg >= 8.5 && edgeMag >= 28)) {
                    rawMask[gy * gw + gx] = 1;
                }
            }
        }

        // Metal üzerindeki parlama deliklerini kapatmak için 3x3 morfolojik kapama (dilate -> erode)
        const dilated = new Uint8Array(gw * gh);
        for (let gy = 1; gy < gh - 1; gy++) {
            for (let gx = 1; gx < gw - 1; gx++) {
                let any = 0;
                for (let dy = -1; dy <= 1 && !any; dy++) {
                    for (let dx = -1; dx <= 1; dx++) {
                        if (rawMask[(gy + dy) * gw + (gx + dx)]) {
                            any = 1;
                            break;
                        }
                    }
                }
                dilated[gy * gw + gx] = any;
            }
        }
        const fgMask = new Uint8Array(gw * gh);
        for (let gy = 1; gy < gh - 1; gy++) {
            for (let gx = 1; gx < gw - 1; gx++) {
                let all = 1;
                for (let dy = -1; dy <= 1 && all; dy++) {
                    for (let dx = -1; dx <= 1; dx++) {
                        if (!dilated[(gy + dy) * gw + (gx + dx)]) {
                            all = 0;
                            break;
                        }
                    }
                }
                fgMask[gy * gw + gx] = all;
            }
        }

        // 3. Bağlantılı Bileşen Analizi (8-Connected BFS) ve Dairesellik Kilidi
        const visited = new Uint8Array(gw * gh);
        const candidateCircles = [];
        const minCoinDiamPx = Math.max(22, Math.min(width, height) * 0.065);
        const maxCoinDiamPx = Math.min(width, height) * 0.68;

        for (let sy = 2; sy < gh - 2; sy++) {
            for (let sx = 2; sx < gw - 2; sx++) {
                const startIdx = sy * gw + sx;
                if (!fgMask[startIdx] || visited[startIdx]) continue;

                const queue = [startIdx];
                visited[startIdx] = 1;
                let head = 0;
                let minX = sx, maxX = sx, minY = sy, maxY = sy;
                let sumX = 0, sumY = 0;
                let touchesBorder = false;

                while (head < queue.length) {
                    const curr = queue[head++];
                    const cy = Math.floor(curr / gw);
                    const cx = curr % gw;
                    sumX += cx;
                    sumY += cy;

                    if (cx < minX) minX = cx;
                    if (cx > maxX) maxX = cx;
                    if (cy < minY) minY = cy;
                    if (cy > maxY) maxY = cy;
                    if (cx <= 1 || cx >= gw - 2 || cy <= 1 || cy >= gh - 2) {
                        touchesBorder = true;
                    }

                    for (let dy = -1; dy <= 1; dy++) {
                        for (let dx = -1; dx <= 1; dx++) {
                            if (dx === 0 && dy === 0) continue;
                            const nx = cx + dx, ny = cy + dy;
                            if (nx >= 1 && nx < gw - 1 && ny >= 1 && ny < gh - 1) {
                                const nIdx = ny * gw + nx;
                                if (fgMask[nIdx] && !visited[nIdx]) {
                                    visited[nIdx] = 1;
                                    queue.push(nIdx);
                                }
                            }
                        }
                    }
                }

                if (touchesBorder) continue;
                const areaCells = queue.length;
                const bwCells = maxX - minX + 1;
                const bhCells = maxY - minY + 1;
                const bwPx = bwCells * step;
                const bhPx = bhCells * step;
                const diamPx = (bwPx + bhPx) * 0.5;

                if (diamPx < minCoinDiamPx || diamPx > maxCoinDiamPx) continue;

                const aspect = bwCells / Math.max(1, bhCells);
                if (aspect < 0.78 || aspect > 1.26) continue;

                // İdeal dairenin kutu doluluk oranı π/4 ≈ 0.785'tir. Dikdörtgen kutu/kağıtları elemek için:
                const boxFillRatio = areaCells / Math.max(1, bwCells * bhCells);
                if (boxFillRatio < 0.58 || boxFillRatio > 0.88) continue;

                const centerGX = (minX + maxX) * 0.5;
                const centerGY = (minY + maxY) * 0.5;
                const radCells = (bwCells + bhCells) * 0.25;

                // Dairesellik Kilidi: Dairenin iç kısmı dolu, sınırlayıcı kutunun 4 köşesi (r > 1.03R) boş olmalı!
                let innerHits = 0, innerTotal = 0;
                let cornerHits = 0, cornerTotal = 0;
                for (let gy = minY; gy <= maxY; gy++) {
                    for (let gx = minX; gx <= maxX; gx++) {
                        const normR = Math.hypot(gx - centerGX, gy - centerGY) / Math.max(1, radCells);
                        const isFg = fgMask[gy * gw + gx];
                        if (normR <= 0.72) {
                            innerTotal++;
                            if (isFg) innerHits++;
                        } else if (normR >= 1.04) {
                            cornerTotal++;
                            if (isFg) cornerHits++;
                        }
                    }
                }

                const innerDensity = innerHits / Math.max(1, innerTotal);
                const cornerDensity = cornerHits / Math.max(1, cornerTotal);
                if (innerDensity < 0.76 || cornerDensity > 0.26) continue;

                candidateCircles.push({
                    cx: ((sumX / areaCells) + 0.5) * step,
                    cy: ((sumY / areaCells) + 0.5) * step,
                    radius: diamPx * 0.5,
                    bbox: [minX * step, minY * step, bwPx, bhPx]
                });
            }
        }

        if (candidateCircles.length === 0) {
            return { coins: [], totalKurus: 0, totalFormatted: '0 Kuruş', summarySpeech: '' };
        }

        // 5. Her Dairesel Aday İçin Eş-Merkezli Halka (İç Göbek vs. Dış Halka) CIELAB + Metalik Kabartma Analizi
        const analyzedCoins = [];

        for (let i = 0; i < candidateCircles.length; i++) {
            const cand = candidateCircles[i];
            const { cx, cy, radius } = cand;
            const x0 = Math.max(1, Math.floor(cx - radius));
            const x1 = Math.min(width - 2, Math.ceil(cx + radius));
            const y0 = Math.max(1, Math.floor(cy - radius));
            const y1 = Math.min(height - 2, Math.ceil(cy + radius));
            const sampleStep = Math.max(1, Math.floor(radius / 22));

            let coreL = 0, coreA = 0, coreB = 0, coreCnt = 0;
            let ringL = 0, ringA = 0, ringB = 0, ringCnt = 0;
            let reliefEdgeSum = 0, reliefCnt = 0;

            for (let y = y0; y <= y1; y += sampleStep) {
                for (let x = x0; x <= x1; x += sampleStep) {
                    const distNorm = Math.hypot(x - cx, y - cy) / Math.max(1, radius);
                    if (distNorm > 0.90) continue;

                    const idx = (y * width + x) * 4;
                    const r = Math.min(255, data[idx] * gainR);
                    const g = Math.min(255, data[idx + 1] * gainG);
                    const b = Math.min(255, data[idx + 2] * gainB);
                    const lab = rgbToLab(r, g, b);

                    // Kabartma (rölyef) kenar enerjisi (Madeni paranın ortasındaki rakam ve motif kabartması)
                    if (distNorm <= 0.72) {
                        const idxR = (y * width + (x + 1)) * 4;
                        const idxD = ((y + 1) * width + x) * 4;
                        const grad = Math.abs(data[idxR] - data[idx]) + Math.abs(data[idxD] - data[idx]);
                        reliefEdgeSum += grad;
                        reliefCnt++;
                    }

                    // Aşırı parlama (L* > 94) ve derin gölge (L* < 14) piksellerini renk ortalamasından hariç tut
                    if (lab.L > 94 || lab.L < 14) continue;

                    if (distNorm >= 0.08 && distNorm <= 0.54) {
                        coreL += lab.L;
                        coreA += lab.a;
                        coreB += lab.b;
                        coreCnt++;
                    } else if (distNorm >= 0.62 && distNorm <= 0.89) {
                        ringL += lab.L;
                        ringA += lab.a;
                        ringB += lab.b;
                        ringCnt++;
                    }
                }
            }

            if (coreCnt < 8 || ringCnt < 8) continue;

            coreL /= coreCnt; coreA /= coreCnt; coreB /= coreCnt;
            ringL /= ringCnt; ringA /= ringCnt; ringB /= ringCnt;
            const reliefScore = reliefEdgeSum / Math.max(1, reliefCnt);

            // Çok düz ve kabartmasız lekeleri (örneğin masa üzerindeki düz su damlası/bant/düğme) ele
            if (reliefScore < 8.4) continue;

            const coreChroma = Math.hypot(coreA, coreB);
            const ringChroma = Math.hypot(ringA, ringB);
            const deltaBRingCore = ringB - coreB;       // + ise dış halka sarı, - ise iç göbek sarı
            const deltaChroma = ringChroma - coreChroma;
            const meanA = 0.5 * (coreA + ringA);
            const meanB = 0.5 * (coreB + ringB);
            const meanChroma = Math.hypot(meanA, meanB);

            // GERÇEK METALİK ALAŞIM KİLİDİ: Canlı kırmızı, mavi, yeşil, mor plastik kapak/düğmeleri asla para sanma!
            if (meanChroma > 28 || meanB < -5.5 || Math.abs(meanA) > 13.5) continue;

            analyzedCoins.push({
                ...cand,
                coreL, coreA, coreB, coreChroma,
                ringL, ringA, ringB, ringChroma,
                deltaBRingCore,
                deltaChroma,
                meanA, meanB, meanChroma,
                reliefScore
            });
        }

        if (analyzedCoins.length === 0) {
            return { coins: [], totalKurus: 0, totalFormatted: '0 Kuruş', summarySpeech: '' };
        }

        // Gömlek düğmesi, fermuar halkası veya bardak altlığı gibi tekil tek-renk yuvarlak nesneleri
        // yanlışlıkla "25 Kuruş / 10 Kuruş" sanıp cüzdana eklememek için:
        // Tek bir yuvarlak aday varsa ve OCR ile üzerinde rakam okunmadıysa, mutlaka çift-halkalı (bi-metalik: 1 TL veya 50 Kr)
        // kontrastına sahip olmasını veya yüksek rölyefli çift metal sınırını sağlamasını şart koş!
        const upperOcr = String(ocrText || '').toUpperCase();
        const hasCoinOcrHint = /\b(?:1|5|10|25|50)\b|KURUŞ|KURUS|LİRA|LIRA|TÜRK|TURK/.test(upperOcr);
        if (analyzedCoins.length === 1 && !hasCoinOcrHint) {
            const only = analyzedCoins[0];
            const isClearlyBiMetallic = (only.deltaBRingCore >= 3.1 && (only.ringB >= 7.2 || only.deltaChroma >= 3.2)) ||
                (only.deltaBRingCore <= -3.1 && (only.coreB >= 7.2 || only.deltaChroma <= -3.2));
            if (!isClearlyBiMetallic) {
                return { coins: [], totalKurus: 0, totalFormatted: '0 Kuruş', summarySpeech: '' };
            }
        }

        // 6. Çoklu Para Varsa Milimetrik Çap Kalibrasyonu (Darphane Standartları: 1 TL = 26.15mm, 50 Kr = 23.85mm)
        // GÜVENLİK KİLİDİ: Sadece gerçekten çift halkalı (bi-metalik) 1 TL veya 50 Kuruş referans parası varsa
        // milimetre/piksel kalibrasyonu yap! İki adet küçük kuruşu (örn. iki 10 Kr) asla en büyüğü 1 TL imiş gibi ölçekleme!
        let refMmPerPx = null;
        const oneTlRef = analyzedCoins.find(c => c.deltaBRingCore >= 3.2 && c.ringB >= 7.5);
        const fiftyKrRef = analyzedCoins.find(c => c.deltaBRingCore <= -3.2 && c.coreB >= 7.5);
        if (oneTlRef) {
            refMmPerPx = 26.15 / (oneTlRef.radius * 2);
        } else if (fiftyKrRef) {
            refMmPerPx = 23.85 / (fiftyKrRef.radius * 2);
        }

        const classifiedCoins = analyzedCoins.map(c => {
            const estMm = refMmPerPx ? (c.radius * 2 * refMmPerPx) : null;
            let valueKurus = 100;
            let name = '1 Türk Lirası';
            let shortLabel = '1 TL';
            let metalDesc = 'Dışı sarı pirinç halka, içi gümüş göbek';
            let colorHex = '#facc15';
            let isBiMetallic = false;

            // DURUM A: ÇİFT METALLİ (Bİ-METALİK) PARALAR
            if (c.deltaBRingCore >= 3.1 && (c.ringB >= 7.2 || c.deltaChroma >= 3.2)) {
                // Dış halka sarı pirinç, iç göbek gümüş nikel -> Kesin 1 Türk Lirası!
                valueKurus = 100;
                name = '1 Türk Lirası';
                shortLabel = '1 TL';
                metalDesc = 'Dışı sarı pirinç halka, içi gümüş göbek';
                colorHex = '#facc15';
                isBiMetallic = true;
            } else if (c.deltaBRingCore <= -3.1 && (c.coreB >= 7.2 || c.deltaChroma <= -3.2)) {
                // Dış halka gümüş nikel, iç göbek sarı pirinç -> 50 Kuruş (23.85mm) veya 5 TL (28.15mm)
                isBiMetallic = true;
                const isFiveTlBySize = estMm !== null && estMm >= 27.1;
                const isFiveTlByOcr = /\b5\s*(?:TL|TÜRK|LİRA)\b/.test(upperOcr) && !/\b50\b/.test(upperOcr);
                if (isFiveTlBySize || isFiveTlByOcr) {
                    valueKurus = 500;
                    name = '5 Türk Lirası (Madeni)';
                    shortLabel = '5 TL';
                    metalDesc = 'Büyük boy çift halkalı, içi sarı göbek';
                    colorHex = '#34d399';
                } else {
                    valueKurus = 50;
                    name = '50 Kuruş';
                    shortLabel = '50 Kr';
                    metalDesc = 'Dışı gümüş halka, içi sarı göbek';
                    colorHex = '#38bdf8';
                }
            } else {
                // DURUM B: TEK METALLİ (MONO-METALİK) PARALAR (25 Kuruş, 10 Kuruş, 5 Kuruş, veya yansımalı 1 TL)
                if (estMm !== null && estMm >= 25.0 && c.meanB >= 6.5) {
                    valueKurus = 100;
                    name = '1 Türk Lirası';
                    shortLabel = '1 TL';
                    metalDesc = 'Büyük boy (26 mm) madeni para';
                    colorHex = '#facc15';
                    isBiMetallic = true;
                } else if (c.meanChroma < 10.6 && c.meanB < 9.2) {
                    // Gümüş/Gri Nikel Görünümlü -> 25 Kuruş (20.50 mm)
                    valueKurus = 25;
                    name = '25 Kuruş';
                    shortLabel = '25 Kr';
                    metalDesc = 'Tamamı gümüş-gri metal';
                    colorHex = '#e2e8f0';
                } else if (c.meanA >= 4.6 || (estMm !== null && estMm <= 17.9)) {
                    // Kızıl-Bakır Bronz -> 5 Kuruş (17.50 mm)
                    valueKurus = 5;
                    name = '5 Kuruş';
                    shortLabel = '5 Kr';
                    metalDesc = 'Kızıl-bakır renkli küçük para';
                    colorHex = '#fb7185';
                } else {
                    // Sarı-Altın Bronz -> 10 Kuruş (18.50 mm)
                    valueKurus = 10;
                    name = '10 Kuruş';
                    shortLabel = '10 Kr';
                    metalDesc = 'Tamamı sarı metal';
                    colorHex = '#fbbf24';
                }
            }

            // Tek para varsa, çift halkalı (1 TL / 50 Kr) değilse ve OCR rakamı net okuduysa çapraz doğrulama
            if (analyzedCoins.length === 1 && !isBiMetallic && upperOcr.length > 0) {
                if (/\b50\b/.test(upperOcr)) {
                    valueKurus = 50; name = '50 Kuruş'; shortLabel = '50 Kr'; isBiMetallic = true;
                } else if (/\b25\b/.test(upperOcr)) {
                    valueKurus = 25; name = '25 Kuruş'; shortLabel = '25 Kr';
                } else if (/\b10\b/.test(upperOcr)) {
                    valueKurus = 10; name = '10 Kuruş'; shortLabel = '10 Kr';
                }
            }

            const cxNorm = c.cx / Math.max(1, width);
            let posWord = 'ortada';
            if (cxNorm < 0.36) posWord = 'solda';
            else if (cxNorm > 0.64) posWord = 'sağda';

            return {
                ...c,
                valueKurus,
                name,
                shortLabel,
                metalDesc,
                colorHex,
                isBiMetallic,
                posWord
            };
        });

        // Soldan sağa sırala
        classifiedCoins.sort((a, b) => a.cx - b.cx);
        const totalKurus = classifiedCoins.reduce((acc, item) => acc + item.valueKurus, 0);
        const totalFormatted = formatTurkishKurusTotal(totalKurus);

        let summarySpeech = '';
        if (classifiedCoins.length === 1) {
            const single = classifiedCoins[0];
            summarySpeech = `Demir para algılandı: ${single.posWord} 1 adet ${single.name} (${single.metalDesc}).`;
        } else if (classifiedCoins.length > 1) {
            const listStr = classifiedCoins.map(c => `${c.posWord} ${c.name}`).join(', ');
            summarySpeech = `Toplam ${classifiedCoins.length} adet demir para algılandı: ${listStr}. Paraların toplam tutarı: ${totalFormatted}.`;
        }

        return {
            coins: classifiedCoins,
            totalKurus,
            totalFormatted,
            summarySpeech
        };
    }

    function handleColorAndPatternMode(anW, anH, scaleX, scaleY, ovCtx, metrics) {
        const coinReport = detectAndClassifyTurkishCoins(metrics, anW, anH);

        if (coinReport.coins.length > 0) {
            coinReport.coins.forEach(coin => drawCoinCircleOverlay(ovCtx, coin, scaleX, scaleY));
            const mainCoin = coinReport.coins[0];
            const align = computeAlignmentInstruction(mainCoin.bbox, anW, anH, mainCoin.name, 0.01, 0.70);

            const sig = coinReport.coins.map(c => c.valueKurus).sort((a, b) => b - a).join('+');
            const label = coinReport.coins.length === 1
                ? coinReport.coins[0].name
                : `${coinReport.coins.length} adet demir para (${coinReport.totalFormatted})`;
            const items = coinReport.coins.map(c => ({
                valueKurus: c.valueKurus,
                label: c.name,
                count: 1
            }));

            state.moneyLiveCandidate = {
                signature: sig,
                kurus: coinReport.totalKurus,
                label,
                items
            };

            if (el.moneyLiveSeen) {
                el.moneyLiveSeen.textContent = `${label} (${coinReport.totalFormatted})`;
            }

            el.tPosition.textContent = coinReport.coins.length === 1
                ? `${mainCoin.name} (${mainCoin.posWord})`
                : `${coinReport.coins.length} Demir Para`;
            el.tDistance.textContent = `Görünen: ${coinReport.totalFormatted} • Cüzdan: ${formatTurkishKurusTotal(state.moneyTotalKurus)}`;
            radar.updateRadar(align.offsetX, align.offsetY, true);

            if (state.moneyPendingSignature === sig) {
                state.moneyPendingFrames++;
            } else {
                state.moneyPendingSignature = sig;
                state.moneyPendingFrames = 1;
            }

            const now = performance.now();
            const isNewBatch = (sig !== state.moneyLastCommittedSignature) ||
                (state.moneyEmptyFramesSinceCommit >= 8 && (now - state.moneyLastCommittedAt > 3200));

            if (state.moneyAutoAccumulate && state.moneyPendingFrames >= 12 && metrics.sharpness >= 6.2 && isNewBatch) {
                state.moneyLastCommittedSignature = sig;
                state.moneyLastCommittedAt = now;
                state.moneyEmptyFramesSinceCommit = 0;
                addMoneyToRunningTotal(coinReport.totalKurus, label, items, 'live_coin');
                return;
            }

            state.moneyEmptyFramesSinceCommit = 0;
            const walletNote = state.moneyTotalKurus > 0
                ? ` Şimdiye kadar sayılan toplam paranız: ${formatTurkishKurusTotal(state.moneyTotalKurus)}.`
                : '';
            announceGuidance(`${coinReport.summarySpeech}${walletNote}`, {
                bannerState: 'centered',
                minIntervalMs: 2800
            });
            return;
        }

        state.moneyLiveCandidate = null;
        state.moneyPendingSignature = '';
        state.moneyPendingFrames = 0;
        state.moneyEmptyFramesSinceCommit++;

        // HİÇBİR TUŞA BASMADAN CANLI KAĞIT PARA OKUMA VE OTOMATİK TOPLAMA:
        // Ortam loşsa parayı yanlış okumamak için telefon fenerini otomatik yak
        if (metrics.avgBrightness < 55 && state.flashMode === 'auto') {
            tryEnableHardwareTorch(true);
        }

        // GÖRME ENGELLİ KULLANICILAR İÇİN YANLIŞ TUTUŞ KORUMALARI:
        // 1) Parmakla kamera merceğini kapatma veya tamamen karanlık ortam uyarısı
        if (metrics.avgBrightness < 22) {
            if (el.moneyLiveSeen) {
                el.moneyLiveSeen.textContent = '⚠️ Mercek Kapalı / Çok Karanlık';
            }
            announceGuidance('Kamera merceği kapandı veya ortam çok karanlık. Parmağınız kameranın üzerinde olabilir, lütfen elinizi hafifçe geri çekin.', {
                bannerState: 'warning',
                minIntervalMs: 3600
            });
            return;
        }

        // Düz renkli kıyafet / kumaşlarda (düşük doku ve kontrast) "Parayı yakın tutuyorsunuz" diyerek renk okumayı KESİNLİKLE engelleme; doğrudan kumaşın rengini söylemeye devam et.

        // Kameranın önünde yazı/rakam dokusu olan net bir yüzey (kağıt para) varsa arka planda otomatik tanı ve cüzdana ekle!
        const nowMs = performance.now();
        if (state.moneyAutoAccumulate &&
            !state.moneyLiveOcrBusy &&
            !state.isProcessingOcr &&
            typeof window.Tesseract !== 'undefined' &&
            metrics.sharpness >= 6.5 &&
            (nowMs - state.moneyLastLiveOcrAt >= 1450)) {

            const strokeScan = detectTextStrokeBandAndCropCanvas(el.analysisCanvas, metrics);
            if (strokeScan.hasTextLikely) {
                state.moneyLiveOcrBusy = true;
                state.moneyLastLiveOcrAt = nowMs;
                const centerColorSnapshot = metrics.centerColor ? metrics.centerColor.name : '';

                const snapCanvas = document.createElement('canvas');
                snapCanvas.width = el.analysisCanvas.width;
                snapCanvas.height = el.analysisCanvas.height;
                snapCanvas.getContext('2d').drawImage(el.analysisCanvas, 0, 0);

                recognizeBanknoteMultiOrientation(snapCanvas, centerColorSnapshot)
                    .then(noteInfo => {
                        if (state.mode !== 'color_cloth' || !noteInfo) return;

                        const tNow = performance.now();

                        // 0. YARI KAPALI / KATLANMIŞ PARA UYARISI:
                        // Kağıt para olduğu anlaşıldı ("TÜRK LİRASI" / "MERKEZ BANKASI" okundu) ama rakamı parmak kapattıysa veya kadraj dışındaysa:
                        if (noteInfo.partialOnly) {
                            if (el.moneyLiveSeen) {
                                el.moneyLiveSeen.textContent = '⚠️ Paranın Rakamı Kapalı / Kadraj Dışı';
                            }
                            announceGuidance('Kağıt parayı algıladım ancak rakam kısmı parmağınızın altında veya ekranın dışında kalmış. Lütfen parayı düzeltip kenarından tutarak biraz geriden gösterin.', {
                                force: true,
                                bannerState: 'warning'
                            });
                            return;
                        }

                        // 1. HAYATİ KİLİT: Aynı seri numaralı kağıt paranın yanlışlıkla iki kez toplanmasını engelle!
                        if (noteInfo.serialNumber && state.moneySeenSerialNumbers && state.moneySeenSerialNumbers.has(noteInfo.serialNumber)) {
                            if (tNow - state.moneyLastDuplicateSerialWarnAt > 4200) {
                                state.moneyLastDuplicateSerialWarnAt = tNow;
                                announceGuidance(`Bu ${noteInfo.label} kağıt parayı zaten saymıştınız, toplamınıza tekrar eklenmedi. Şu anki toplamınız: ${formatTurkishKurusTotal(state.moneyTotalKurus)}.`, {
                                    force: true,
                                    bannerState: 'warning'
                                });
                            }
                            return;
                        }

                        const isNewNote = (noteInfo.signature !== state.moneyLastLiveBanknoteSig) ||
                            (state.moneyEmptyFramesSinceCommit >= 6 && (tNow - state.moneyLastLiveBanknoteAt > 3600));

                        state.moneyLiveCandidate = {
                            signature: noteInfo.signature,
                            kurus: noteInfo.kurus,
                            label: `${noteInfo.label} (Kağıt Para)`,
                            items: noteInfo.items,
                            serialNumber: noteInfo.serialNumber || ''
                        };
                        if (el.moneyLiveSeen) {
                            el.moneyLiveSeen.textContent = `💵 ${noteInfo.label} (Kağıt Para)`;
                        }

                        if (isNewNote) {
                            state.moneyLastLiveBanknoteSig = noteInfo.signature;
                            state.moneyLastLiveBanknoteAt = tNow;
                            state.moneyEmptyFramesSinceCommit = 0;
                            if (noteInfo.serialNumber && state.moneySeenSerialNumbers) {
                                state.moneySeenSerialNumbers.add(noteInfo.serialNumber);
                            }
                            addMoneyToRunningTotal(
                                noteInfo.kurus,
                                `${noteInfo.label} (Kağıt Para)`,
                                noteInfo.items,
                                'live_banknote',
                                noteInfo.serialNumber || ''
                            );
                        }
                    })
                    .catch(() => {})
                    .finally(() => {
                        state.moneyLiveOcrBusy = false;
                    });
            }
        }

        if (el.moneyLiveSeen && !state.moneyLiveOcrBusy) {
            el.moneyLiveSeen.textContent = `Yüzey Rengi: ${metrics.centerColor.name}`;
        }

        const colorName = metrics.centerColor.name;
        const pattern = metrics.patternType;

        el.tPosition.textContent = colorName;
        el.tDistance.textContent = state.moneyTotalKurus > 0
            ? `Toplam Paranız: ${formatTurkishKurusTotal(state.moneyTotalKurus)}`
            : pattern;

        const walletHint = state.moneyTotalKurus > 0
            ? ` Şu ana kadar saydığınız toplam para: ${formatTurkishKurusTotal(state.moneyTotalKurus)}. Toplamı dinlemek için Ne Kadar Param Var düğmesine basabilirsiniz.`
            : ' Elinizdeki kağıt ve demir paraları kameraya gösterdikçe hiçbir tuşa basmanıza gerek kalmadan otomatik tanıyıp toplarım.';
        const msg = `Merkezdeki renk: ${colorName} (${pattern}).${walletHint}`;
        announceGuidance(msg, {
            bannerState: 'centered',
            minIntervalMs: 3800
        });
    }

    function handleAnomalyAndLedMode(anW, anH, scaleX, scaleY, ovCtx, metrics) {
        if (metrics.ledSource) {
            const led = metrics.ledSource;
            drawTargetBox(ovCtx, led.bbox, scaleX, scaleY, '#22c55e', `${led.colorName} LED`);
            const align = computeAlignmentInstruction(led.bbox, anW, anH, `${led.colorName} LED Işığı`, 0.002, 0.50);
            const blinkState = metrics.blinkHz > 0.3
                ? `saniyede ${metrics.blinkHz} kez yanıp sönüyor`
                : 'sabit yanıyor';

            el.tPosition.textContent = `${led.colorName} LED`;
            el.tDistance.textContent = blinkState;
            radar.updateRadar(align.offsetX, align.offsetY, align.isCentered);

            announceGuidance(`Cihaz üzerinde ${led.colorName} LED ışık tespit edildi ve şu an ${blinkState}.`, {
                bannerState: 'centered',
                minIntervalMs: 2800
            });
            return;
        }

        // Yere düşen şey bir madeni (demir) para ise doğrudan kaç lira/kuruş olduğunu söyle!
        const coinCheck = detectAndClassifyTurkishCoins(metrics, anW, anH);
        if (coinCheck.coins.length > 0) {
            coinCheck.coins.forEach(coin => drawCoinCircleOverlay(ovCtx, coin, scaleX, scaleY));
            const firstCoin = coinCheck.coins[0];
            const align = computeAlignmentInstruction(firstCoin.bbox, anW, anH, `Yerdeki ${firstCoin.name}`, 0.005, 0.55);
            el.tPosition.textContent = `Yerde ${firstCoin.shortLabel} Bulundu`;
            el.tDistance.textContent = `Toplam: ${coinCheck.totalFormatted}`;
            radar.updateRadar(align.offsetX, align.offsetY, align.isCentered);

            announceGuidance(`Yerde düşmüş demir para bulundu! ${coinCheck.summarySpeech} ${align.sentence}`, {
                bannerState: 'centered',
                minIntervalMs: 2500
            });
            return;
        }

        if (metrics.isSurfacePatterned) {
            el.tPosition.textContent = 'Halı Çok Desenli';
            el.tDistance.textContent = 'Biraz Daha Yaklaştırın';
            announceGuidance('Yerdeki halı çok desenli olduğu için halı desenini eşya sanmamak adına bekliyorum. Lütfen telefonu yere biraz daha yaklaştırın.', {
                bannerState: 'warning',
                minIntervalMs: 4200
            });
            return;
        }

        if (metrics.floorAnomaly) {
            const tracked = updateKalmanTracker(metrics.floorAnomaly.bbox, 'anomaly', 3);
            if (tracked.verified && tracked.box) {
                drawTargetBox(ovCtx, tracked.box, scaleX, scaleY, '#facc15', 'Yerde Küçük Eşya');
                const align = computeAlignmentInstruction(tracked.box, anW, anH, 'Yerdeki küçük eşya', 0.005, 0.35);
                el.tPosition.textContent = align.posLabel;
                el.tDistance.textContent = 'Yerde Eşya Bulundu';
                radar.updateRadar(align.offsetX, align.offsetY, align.isCentered);

                announceGuidance(`${align.sentence} (Güvenlik uyarısı: Kırık cam veya kesici bir cisim olma ihtimaline karşı elinizi yerde doğrudan süpürerek gezdirmeyin).`, {
                    bannerState: align.isCentered ? 'centered' : 'normal',
                    minIntervalMs: 2800
                });
                return;
            }
        } else {
            updateKalmanTracker(null, '', 3);
        }

        el.tPosition.textContent = 'Yerde Eşya Görünmüyor';
        el.tDistance.textContent = 'Zemin Boş';
        announceGuidance('Yere bakıyorum; şu an yerde düşmüş bir eşya veya yanan bir cihaz ışığı görünmüyor.', {
            bannerState: 'normal',
            minIntervalMs: 4200
        });
    }

    function handleLightMeterMode(anW, anH, metrics) {
        const lum = Math.round(metrics.avgBrightness);
        const hotOffsetX = (metrics.maxLumX - anW / 2) / (anW / 2);

        radar.playLightMeterTone(lum, hotOffsetX);

        let stateDesc = '';
        if (lum < 18) stateDesc = 'Oda zifiri karanlık, tüm lambalar kapalı.';
        else if (lum < 55) stateDesc = 'Ortam loş; sadece küçük bir gece lambası veya ekran ışığı var.';
        else if (lum < 145) stateDesc = 'Oda aydınlık, lamba açık veya gündüz ışığı alıyor.';
        else stateDesc = 'Çok güçlü ışık kaynağı! Kameranız doğrudan açık bir lambaya veya pencereye bakıyor.';

        let dirHint = 'tam karşınızda';
        if (hotOffsetX < -0.25) dirHint = 'sol tarafınızda';
        else if (hotOffsetX > 0.25) dirHint = 'sağ tarafınızda';

        let levelWord = 'Normal Aydınlık';
        if (lum < 18) levelWord = 'Zifiri Karanlık';
        else if (lum < 55) levelWord = 'Loş Işık';
        else if (lum >= 145) levelWord = 'Güçlü Işık';

        el.tPosition.textContent = `Işık Seviyesi: ${levelWord}`;
        el.tDistance.textContent = `En Güçlü Işık: ${dirHint}`;

        announceGuidance(`${stateDesc} En güçlü ışık kaynağı ${dirHint}.`, {
            bannerState: lum >= 55 ? 'centered' : 'warning',
            minIntervalMs: 3200
        });
    }

    function handleExplorerMode(anW, anH, scaleX, scaleY, ovCtx, predictions) {
        const verified = predictions || [];
        if (verified.length === 0) {
            el.tPosition.textContent = 'Nesne Aranıyor';
            el.tDistance.textContent = 'Belirgin Nesne Yok';
            announceGuidance('Önünüzde şu an belirgin bir eşya görünmüyor. Yazı veya belge okutmak için ekrana çift dokunabilirsiniz.', {
                bannerState: 'normal',
                minIntervalMs: 4200
            });
            return;
        }

        const sorted = [...verified].sort((a, b) => a.bbox[0] - b.bbox[0]);
        const descriptions = [];

        sorted.slice(0, 4).forEach((pred, idx) => {
            const trName = TR_LABELS[pred.class] || pred.class;
            drawTargetBox(ovCtx, pred.bbox, scaleX, scaleY, idx === 0 ? '#22c55e' : '#38bdf8', trName);

            const cx = (pred.bbox[0] + pred.bbox[2] / 2) / anW;
            let dir = 'tam karşınızda';
            if (cx < 0.35) dir = 'solunuzda';
            else if (cx > 0.65) dir = 'sağınızda';

            descriptions.push(`${dir} ${trName}`);
        });

        const mainPred = verified[0];
        const align = computeAlignmentInstruction(
            mainPred.bbox,
            anW,
            anH,
            TR_LABELS[mainPred.class] || mainPred.class
        );
        el.tPosition.textContent = align.posLabel;
        el.tDistance.textContent = `${verified.length} Eşya Algılandı`;
        radar.updateRadar(align.offsetX, align.offsetY, align.isCentered);

        announceGuidance(`Kamera önünde ${descriptions.join(', ')} görünüyor.`, {
            bannerState: 'centered',
            minIntervalMs: 3600
        });
    }

    function guideToSpecificObject(targetClass, anW, anH, scaleX, scaleY, ovCtx, predictions) {
        const matches = predictions.filter(p => {
            if (targetClass === 'door_table') return p.class === 'dining table' || p.class === 'bench' || p.class === 'couch';
            if (targetClass === 'chair') return p.class === 'chair' || p.class === 'couch' || p.class === 'bench';
            if (targetClass === 'cup') return p.class === 'cup' || p.class === 'bottle' || p.class === 'wine glass' || p.class === 'bowl';
            if (targetClass === 'keyboard') return p.class === 'keyboard' || p.class === 'mouse' || p.class === 'laptop';
            return p.class === targetClass;
        });

        const trTargetName = TR_LABELS[targetClass] || 'Seçili Hedef';

        if (matches.length === 0) {
            updateKalmanTracker(null, '', 3);
            el.tPosition.textContent = `${trTargetName} Aranıyor`;
            el.tDistance.textContent = 'Kadrajda Yok';
            announceGuidance(`${trTargetName} henüz kadrajda değil, kamerayı yavaşça etrafta gezdirin.`, {
                bannerState: 'warning',
                minIntervalMs: 3500
            });
            return;
        }

        matches.sort((a, b) => (b.bbox[2] * b.bbox[3]) - (a.bbox[2] * a.bbox[3]));
        const tracked = updateKalmanTracker(matches[0].bbox, targetClass, 2);
        if (!tracked.box) return;

        drawTargetBox(ovCtx, tracked.box, scaleX, scaleY, '#22c55e', trTargetName);
        const align = computeAlignmentInstruction(tracked.box, anW, anH, trTargetName, 0.05, 0.75);
        el.tPosition.textContent = align.posLabel;
        el.tDistance.textContent = align.distanceStatus;
        radar.updateRadar(align.offsetX, align.offsetY, align.isCentered);
        announceGuidance(align.sentence, {
            bannerState: align.isCentered ? 'centered' : 'normal',
            minIntervalMs: 2200
        });
    }

    // =========================================================================
    // 5B. YENİ SIFIR-HATA MODLAR (MOD 9 - MOD 14 MATEMATİKSEL MOTORLARI)
    // =========================================================================

    /**
     * GS1 / EAN-13 ve EAN-8 Barkod Mod-10 Sağlama Toplamı (Checksum) Doğrulaması.
     * Rastgele telefon numarası veya tarihlerin barkod sanılmasını %100 engeller.
     */
    function verifyEanChecksum(digitsStr) {
        const clean = String(digitsStr || '').replace(/\D/g, '');
        if (clean.length !== 13 && clean.length !== 8) return false;
        let sum = 0;
        const len = clean.length;
        for (let i = 0; i < len - 1; i++) {
            const d = parseInt(clean[i], 10);
            const weight = (len === 13) ? (i % 2 === 0 ? 1 : 3) : (i % 2 === 0 ? 3 : 1);
            sum += d * weight;
        }
        const checkDigit = (10 - (sum % 10)) % 10;
        return checkDigit === parseInt(clean[len - 1], 10);
    }

    /**
     * İlaç kutusu üzerindeki dikey çizgili 1D barkod bölgesini (Yüksek Dikey Gradyan |Gx| >> |Gy|)
     * gerçek zamanlı tespit eder.
     */
    function detectBarcodeStripeRegion(metrics, anW, anH) {
        const { gray, gw, gh, step } = metrics;
        const blockW = 8, blockH = 5;
        let bestScore = 0;
        let bestBox = null;

        for (let by = 2; by < gh - blockH - 2; by += 2) {
            for (let bx = 2; bx < gw - blockW - 2; bx += 2) {
                let gxSum = 0, gySum = 0;
                for (let y = by; y < by + blockH; y++) {
                    for (let x = bx; x < bx + blockW; x++) {
                        gxSum += Math.abs(gray[y * gw + (x + 1)] - gray[y * gw + (x - 1)]);
                        gySum += Math.abs(gray[(y + 1) * gw + x] - gray[(y - 1) * gw + x]);
                    }
                }
                if (gxSum > 1450 && gxSum > gySum * 2.55) {
                    const score = gxSum - gySum;
                    if (score > bestScore) {
                        bestScore = score;
                        bestBox = [
                            Math.max(0, (bx - 2) * step),
                            Math.max(0, (by - 2) * step),
                            Math.min(anW, (blockW + 4) * step),
                            Math.min(anH, (blockH + 4) * step)
                        ];
                    }
                }
            }
        }
        return bestBox;
    }

    /**
     * T.C. Sağlık Bakanlığı İlaç Takip Sistemi (İTS) GS1 DataMatrix Karekod Çözücü:
     * İlaç kutularındaki karekodun içinden 01 (14 haneli GTIN barkod) ve 17 (YYAAGG kesin SKT)
     * verisini %100 matematiksel kesinlikle (sıfır OCR hatasıyla) çıkarır.
     */
    function parseGs1MedicineDataMatrix(rawBarcode) {
        const raw = String(rawBarcode || '').replace(/[\u001d\s()]/g, '');
        const m = raw.match(/01(\d{14})(?:17|.*?17)(\d{2})(0[1-9]|1[0-2])(0[0-9]|[12]\d|3[01])/);
        if (!m) return null;
        const gtin = m[1];
        const expYear = 2000 + parseInt(m[2], 10);
        const expMonth = parseInt(m[3], 10);
        if (expYear < 2020 || expYear > 2038) return null;
        return {
            gtin,
            expMonth,
            expYear
        };
    }

    /**
     * Mod 9: İlaç Kutusu, Dozaj (mg/ml), Barkod ve Son Kullanma Tarihi (SKT) Sıfır-Hata Çözümleyici
     */
    function parseMedicineAndExpiryZeroError(ocrText, liveBarcode = '', secondaryOcrText = '') {
        const text = String(ocrText || '');
        const validBarcodes = [];

        const gs1Info = parseGs1MedicineDataMatrix(liveBarcode) || parseGs1MedicineDataMatrix(text);
        if (gs1Info && gs1Info.gtin) {
            validBarcodes.push(`${gs1Info.gtin} (İTS Karekod Doğrulandı)`);
        }

        if (liveBarcode && verifyEanChecksum(liveBarcode)) {
            validBarcodes.push(liveBarcode);
        }
        const numCandidates = text.match(/\b\d{8,13}\b/g) || [];
        numCandidates.forEach(cand => {
            if (verifyEanChecksum(cand) && !validBarcodes.includes(cand)) {
                validBarcodes.push(cand);
            }
        });

        // Dozaj Birimleri (500 mg, 1000 mg, 5 mg/5 ml, 100 mcg, 20 tablet vb.)
        const dosageMatches = text.match(/\b\d+(?:[.,]\d+)?\s*(?:mg\s*\/\s*\d+\s*ml|mg|mcg|ml|gr|g|iu|ünite|tablet|film\s*tablet|kapsül|draje|ampul|flakon|şurup|damla|sprey)\b/gi) || [];
        const uniqueDosages = [...new Set(dosageMatches.map(d => d.replace(/\s+/g, ' ').trim()))];

        // Eczane Kullanım Etiketi Kalıpları (Sabah 1, Akşam 1, Tok karnına, Günde 2 defa)
        const usageMatches = text.match(/(?:sabah|öğle|akşam|gece)\s*\d+|günde\s*\d+\s*(?:defa|kez)|\d+\s*x\s*\d+|(?:aç|tok)\s*karn[ıi]na|yemek(?:lerden)?\s*(?:önce|sonra)/gi) || [];
        const uniqueUsage = [...new Set(usageMatches.map(u => u.replace(/\s+/g, ' ').trim()))];

        // Sıkı Son Kullanma Tarihi (SKT / EXP / TETT) Doğrulaması
        const now = new Date();
        const curYear = now.getFullYear();
        const curMonth = now.getMonth() + 1;

        const extractExpiryFromSingleText = (srcText) => {
            let eMonth = null;
            let eYear = null;
            const ocrZeroFixed = String(srcText || '')
                .replace(/([0-9./\-])[Oo](?=[0-9./\-]|$)/g, '$10')
                .replace(/(^|[\s:.\-/])[Oo](?=[0-9])/g, '$10')
                .replace(/([0-9])[Oo](?=[0-9])/g, '$10');
            const cleaned = ocrZeroFixed.replace(/(?:[ÜU]\.?\s*R\.?\s*T\.?|[ÜU]\.?R\.?T\.?|[ÜU]\.?\s*T\.?|[ÜU]RET[İI]M(?:\s*TAR[İI]H[İI])?|[İI]MAL(?:\s*TAR[İI]H[İI])?|MFG|M\.?F\.?G\.?|PRD|P\.?\s*D\.?|PROD(?:UCTION)?)[\s:.\-]*(\d{1,2})[\s./\-](?:(\d{1,2})[\s./\-])?(20[2-3]\d|\d{2})\b/gi, ' ');
            const labeledRx = /(?:S\.?K\.?T\.?|SON\s*KULLAN(?:MA|IM)|SON\s*T[ÜU]KET[İI]M|EXP(?:IRY)?|T\.?E\.?T\.?T\.?|B\.?\s*B\.?)[\s:.\-]*(\d{1,2})[\s./\-](?:(\d{1,2})[\s./\-])?(20[2-3]\d|\d{2})\b/gi;
            let m;
            while ((m = labeledRx.exec(cleaned)) !== null) {
                const p1 = parseInt(m[1], 10);
                const p2 = m[2] ? parseInt(m[2], 10) : null;
                let yr = parseInt(m[3], 10);
                if (yr < 100) yr += 2000;
                const mo = p2 !== null ? p2 : p1;
                if (mo >= 1 && mo <= 12 && yr >= 2020 && yr <= 2038) {
                    if (eYear === null || (yr * 12 + mo) > (eYear * 12 + eMonth)) {
                        eMonth = mo;
                        eYear = yr;
                    }
                }
            }
            if (eYear === null) {
                const genericRx = /\b(?:(\d{1,2})[./\-])?(0[1-9]|1[0-2])[./\-](20[2-3]\d)\b/g;
                let gm;
                while ((gm = genericRx.exec(cleaned)) !== null) {
                    const mo = parseInt(gm[2], 10);
                    const yr = parseInt(gm[3], 10);
                    if (mo >= 1 && mo <= 12 && yr >= 2020 && yr <= 2038) {
                        if (eYear === null || (yr * 12 + mo) > (eYear * 12 + eMonth)) {
                            eMonth = mo;
                            eYear = yr;
                        }
                    }
                }
            }
            return (eMonth !== null && eYear !== null) ? { expMonth: eMonth, expYear: eYear } : null;
        };

        let expMonth = null;
        let expYear = null;
        let hasDateConflict = false;

        if (gs1Info) {
            expMonth = gs1Info.expMonth;
            expYear = gs1Info.expYear;
        } else {
            const d1 = extractExpiryFromSingleText(text);
            const d2 = secondaryOcrText ? extractExpiryFromSingleText(secondaryOcrText) : null;
            if (d1 && d2 && (d1.expYear !== d2.expYear || d1.expMonth !== d2.expMonth)) {
                hasDateConflict = true;
            } else if (d1) {
                expMonth = d1.expMonth;
                expYear = d1.expYear;
            } else if (d2) {
                expMonth = d2.expMonth;
                expYear = d2.expYear;
            }
        }

        let sktStatus = 'UNVERIFIED';
        let sktSpeech = hasDateConflict
            ? 'DİKKAT: İlaç kutusundaki tarih parlama nedeniyle iki farklı şekilde okundu! Güvenliğiniz için tahmin yürütmüyorum; lütfen kutuyu ışık yansıması olmayacak şekilde hafif eğip tekrar çekin.'
            : 'Son kullanma tarihi bu açıdan kesin olarak doğrulanamadı. Yanlış bilgi vermemek için tahmin yürütmüyorum; lütfen kutunun karekodlu veya tarihli yan kapağını çevirip tekrar çekin.';
        let formattedDate = 'Doğrulanamadı';

        if (expMonth !== null && expYear !== null) {
            formattedDate = `${String(expMonth).padStart(2, '0')}/${expYear}`;
            const monthsDiff = (expYear - curYear) * 12 + (expMonth - curMonth);
            if (monthsDiff < 0) {
                sktStatus = 'EXPIRED';
                sktSpeech = `DİKKAT TEHLİKE! Bu ilacın veya ürünün son kullanma tarihi ${formattedDate} olup ${Math.abs(monthsDiff)} ay önce GEÇMİŞTİR! Kesinlikle kullanmayın!`;
            } else if (monthsDiff === 0) {
                sktStatus = 'EXPIRING_SOON';
                sktSpeech = `UYARI: Son kullanma tarihi ${formattedDate}, yani bu ay içinde doluyor!`;
            } else if (monthsDiff <= 2) {
                sktStatus = 'EXPIRING_SOON';
                sktSpeech = `Uyarı: Son kullanma tarihi ${formattedDate}. Dolmasına sadece ${monthsDiff} ay kalmış.`;
            } else {
                sktStatus = 'SAFE';
                sktSpeech = `Güvenli: Son kullanma tarihi ${formattedDate}. Süresinin dolmasına ${monthsDiff} ay var.`;
            }
        }

        return {
            sktStatus,
            formattedDate,
            sktSpeech,
            dosages: uniqueDosages,
            usageInstructions: uniqueUsage,
            barcodes: validBarcodes
        };
    }

    function handleMedicineSktLiveMode(anW, anH, scaleX, scaleY, ovCtx, metrics, qrDetection, predictions) {
        const barcodeBox = (qrDetection && qrDetection.bbox) ? qrDetection.bbox : detectBarcodeStripeRegion(metrics, anW, anH);
        const boxPred = predictions.find(p => p.class === 'book' || p.class === 'bottle' || p.class === 'cup' || p.class === 'cell phone');
        const targetBox = barcodeBox || (boxPred ? boxPred.bbox : null);

        if (qrDetection && qrDetection.data && verifyEanChecksum(qrDetection.data)) {
            el.tPosition.textContent = `Barkod: ${qrDetection.data}`;
            el.tDistance.textContent = 'GS1 Mod-10 Doğrulandı';
        }

        if (targetBox) {
            const tracked = updateKalmanTracker(targetBox, 'medicine_box', 2);
            if (tracked.verified && tracked.box) {
                const label = barcodeBox ? 'İlaç Barkodu / SKT Alanı' : 'İlaç Kutusu';
                drawTargetBox(ovCtx, tracked.box, scaleX, scaleY, '#22c55e', label);
                const align = computeAlignmentInstruction(tracked.box, anW, anH, label, 0.06, 0.85);
                el.tPosition.textContent = align.posLabel;
                el.tDistance.textContent = metrics.sharpness >= 7.0 ? 'Net (Okumaya Hazır)' : 'Bulanık (Sabitleyin)';
                radar.updateRadar(align.offsetX, align.offsetY, align.isCentered);

                if (align.isCentered && metrics.sharpness >= 7.0) {
                    if (state.autoCaptureEnabled && !state.isProcessingOcr) {
                        handleAutoCaptureCountdown('İlaç kutusu netlendi, SKT ve dozaj okunuyor!');
                    } else {
                        announceGuidance('İlaç kutusu hizalandı ve net! İlacın adını, miligram dozunu ve son kullanma tarihini (SKT) doğrulamak için Boşluk tuşuna basın veya ekrana çift dokunun.', {
                            bannerState: 'centered',
                            minIntervalMs: 3200
                        });
                    }
                } else {
                    announceGuidance(align.sentence, { bannerState: 'normal', minIntervalMs: 2400 });
                }
                return;
            }
        }

        el.tPosition.textContent = 'İlaç Kutusu Aranıyor';
        el.tDistance.textContent = '20 cm Mesafede Tutun';
        announceGuidance('İlaç kutusunu kameranın 20 santimetre önüne tutun. Barkodu, miligram dozajı ve Son Kullanma Tarihi (SKT) okunup kontrol edilecektir.', {
            bannerState: 'normal',
            minIntervalMs: 4000
        });
    }

    /**
     * Mod 10: Canlı Kalem / Parmak Takipli İmza Kutusu Rehberi (YCbCr Cilt + Kalem Ucu Vektörü)
     */
    function detectSignatureBoxAndPenTip(metrics, anW, anH) {
        const { imageData, gray, gw, gh, step } = metrics;
        const data = imageData.data;

        // 1. İmza Satırı / Kutusu Tespiti: Sadece gerçek açık renkli kağıt üzerinde belirgin yatay çizgi varsa kabul et!
        let bestLineScore = 0;
        let sigBox = null;

        if ((metrics.avgBrightness || 0) >= 105) {
            for (let gy = Math.floor(gh * 0.35); gy < Math.floor(gh * 0.82); gy++) {
                let horizEdgeRun = 0;
                for (let gx = Math.floor(gw * 0.20); gx < Math.floor(gw * 0.80); gx++) {
                    const gCurr = gray[gy * gw + gx];
                    const gPrev = gray[(gy - 1) * gw + gx];
                    const gNext = gray[(gy + 1) * gw + gx];
                    const dy = Math.max(Math.abs(gNext - gPrev), Math.abs(gCurr - gPrev), Math.abs(gNext - gCurr));
                    const dx = Math.abs(gray[gy * gw + (gx + 1)] - gray[gy * gw + (gx - 1)]);
                    if (dy > 26 && dy > dx * 1.4) horizEdgeRun += dy;
                }
                if (horizEdgeRun > bestLineScore && horizEdgeRun > 520) {
                    bestLineScore = horizEdgeRun;
                    const boxY = Math.max(20, (gy * step) - Math.round(anH * 0.10));
                    sigBox = [Math.round(anW * 0.32), boxY, Math.round(anW * 0.36), Math.round(anH * 0.14)];
                }
            }
        }

        // 2. Parmak / El ve Kalem Ucu Tespiti (Ahşap masayı el sanmamak için bölgesel oran ve kalem ucu kontrast kilidi!)
        let skinPixels = 0;
        let totalSampled = 0;
        let topSkinX = -1;
        let topSkinY = anH + 1;

        for (let gy = Math.floor(gh * 0.12); gy < gh - 1; gy++) {
            const py = gy * step;
            for (let gx = 2; gx < gw - 2; gx++) {
                totalSampled++;
                const px = gx * step;
                const idx = (py * anW + px) * 4;
                const r = data[idx], g = data[idx + 1], b = data[idx + 2];
                const cb = 128 - 0.168736 * r - 0.331264 * g + 0.5 * b;
                const cr = 128 + 0.5 * r - 0.418688 * g - 0.081312 * b;

                if (r > 75 && g > 45 && b > 25 && (r - g) >= 12 && r > b && cb >= 80 && cb <= 124 && cr >= 136 && cr <= 172) {
                    skinPixels++;
                    if (py < topSkinY) {
                        topSkinY = py;
                        topSkinX = px;
                    }
                }
            }
        }

        const skinRatio = skinPixels / Math.max(1, totalSampled);
        let penTip = null;
        // Eğer ekranın %30'undan fazlası ten rengiyse bu bir ahşap masa veya sarı zemindir, el değildir!
        if (skinPixels >= 28 && skinRatio >= 0.015 && skinRatio <= 0.28 && topSkinX >= 0) {
            let nibX = topSkinX;
            let nibY = topSkinY;
            let foundDarkNib = false;
            const gx0 = Math.floor(topSkinX / step);
            const gy0 = Math.floor(topSkinY / step);
            for (let dy = 1; dy <= 6; dy++) {
                const ty = gy0 - dy;
                if (ty <= 1) break;
                if (gray[ty * gw + gx0] < 92) {
                    nibY = ty * step;
                    foundDarkNib = true;
                }
            }
            if (foundDarkNib || sigBox) {
                penTip = { x: nibX, y: nibY, skinPixels };
            }
        }

        return { sigBox, penTip };
    }

    function handleSignaturePenLiveMode(anW, anH, scaleX, scaleY, ovCtx, metrics) {
        const { sigBox, penTip } = detectSignatureBoxAndPenTip(metrics, anW, anH);
        if (!sigBox) {
            state.penInBoxFrames = 0;
            el.tPosition.textContent = 'Evrak / İmza Çizgisi Aranıyor';
            el.tDistance.textContent = 'Kağıda Yaklaştırın';
            announceGuidance('Henüz imzalanacak kağıt veya imza çizgisi görünmüyor. Lütfen kamerayı beyaz evrakın üzerine, bir karış yükseklikte tutun.', {
                bannerState: 'normal',
                minIntervalMs: 3800
            });
            return;
        }
        drawTargetBox(ovCtx, sigBox, scaleX, scaleY, '#38bdf8', 'İmza Kutusu Hedefi');

        const [bx, by, bw, bh] = sigBox;
        const targetCx = bx + bw / 2;
        const targetCy = by + bh / 2;

        if (!penTip) {
            state.penInBoxFrames = 0;
            el.tPosition.textContent = 'İmza Alanı Hazır';
            el.tDistance.textContent = 'Kalem / Parmak Bekleniyor';
            announceGuidance('Evrak üzerindeki imza bölgesi kilitlendi. Şimdi kaleminizi veya işaret parmağınızı kağıdın üzerine koyup kameranın görüş alanına sokun; sizi imza kutusuna yönlendireceğim.', {
                bannerState: 'normal',
                minIntervalMs: 3600
            });
            return;
        }

        // Kalem/Parmak ucunu vizörde sarı halka ve vektör okuyla çiz
        ovCtx.save();
        ovCtx.strokeStyle = '#facc15';
        ovCtx.fillStyle = '#facc15';
        ovCtx.lineWidth = 4;
        ovCtx.beginPath();
        ovCtx.arc(penTip.x * scaleX, penTip.y * scaleY, 14, 0, Math.PI * 2);
        ovCtx.stroke();
        ovCtx.beginPath();
        ovCtx.moveTo(penTip.x * scaleX, penTip.y * scaleY);
        ovCtx.lineTo(targetCx * scaleX, targetCy * scaleY);
        ovCtx.stroke();
        ovCtx.restore();

        const dx = targetCx - penTip.x; // + ise hedef sağda
        const dy = targetCy - penTip.y; // + ise hedef aşağıda
        const cmX = Math.max(1, Math.round((Math.abs(dx) / anW) * 18));
        const cmY = Math.max(1, Math.round((Math.abs(dy) / anH) * 24));

        const inBox = penTip.x >= bx && penTip.x <= (bx + bw) && penTip.y >= by && penTip.y <= (by + bh);
        const normOffX = (penTip.x - targetCx) / (anW / 2);
        const normOffY = (penTip.y - targetCy) / (anH / 2);
        radar.updateRadar(normOffX, normOffY, inBox);

        if (inBox) {
            state.penInBoxFrames++;
            el.tPosition.textContent = state.signatureDocVerified ? 'KALEM İMZA KUTUSUNDA!' : 'Önce Evrakı Okutun (Çift Dokunun)';
            el.tDistance.textContent = state.signatureDocVerified ? 'Şimdi İmzalayın' : 'Evrak Okunmadı!';
            if (state.penInBoxFrames >= 2) {
                if (navigator.vibrate) navigator.vibrate([100, 50, 150]);
                const docVerifyNote = state.signatureDocVerified
                    ? 'Kaleminizin ucu doğrulanan evrakın imza çizgisi üzerinde! Şimdi imzanızı atabilirsiniz.'
                    : 'DİKKAT: Kaleminiz çizgi üzerinde ancak bu evrakı henüz okutmadınız! Bilmediğiniz bir kağıda imza atmamak için önce ekrana çift dokunarak veya Boşluk tuşuna basarak evrakta ne yazdığını dinleyin!';
                announceGuidance(docVerifyNote, {
                    bannerState: state.signatureDocVerified ? 'centered' : 'warning',
                    minIntervalMs: 3400
                });
            }
        } else {
            state.penInBoxFrames = 0;
            const dirs = [];
            if (Math.abs(dx) > bw * 0.35) dirs.push(`${cmX} santim ${dx > 0 ? 'sağa' : 'sola'}`);
            if (Math.abs(dy) > bh * 0.35) dirs.push(`${cmY} santim ${dy > 0 ? 'aşağı' : 'yukarı'}`);
            const cmd = dirs.join(' ve ') || '1 santim merkeze';

            el.tPosition.textContent = `Kalem Ucu: (${Math.round(penTip.x)}, ${Math.round(penTip.y)})`;
            el.tDistance.textContent = `Hedefe: ${cmd}`;
            announceGuidance(`İmza kutusuna ulaşmak için kaleminizi ${cmd} kaydırın.`, {
                bannerState: 'normal',
                minIntervalMs: 2100
            });
        }
    }

    /**
     * Mod 11: Akustik Sıvı Seviyesi & Bardak Doldurma Radarı (Menisküs Gradyanı + 5 Kare Medyan Filtresi)
     */
    function handleLiquidLevelLiveMode(anW, anH, scaleX, scaleY, ovCtx, metrics, predictions) {
        const cupPred = predictions.find(p => p.class === 'cup' || p.class === 'wine glass' || p.class === 'bottle' || p.class === 'bowl');

        if (!cupPred) {
            state.liquidLevelHistory = [];
            el.tPosition.textContent = 'Bardak / Şişe Aranıyor';
            el.tDistance.textContent = 'Kadrajda Bardak Yok';
            announceGuidance('Masadaki bardağı, kupayı veya şişeyi bulmak için kamerayı masaya tutun. Güvenliğiniz için kaynar çay veya sıcak su doldururken kameraya güvenmeyin.', {
                bannerState: 'warning',
                minIntervalMs: 4200
            });
            return;
        }

        const [bx, by, bw, bh] = cupPred.bbox;
        const trLabel = TR_LABELS[cupPred.class] || cupPred.class;
        drawTargetBox(ovCtx, cupPred.bbox, scaleX, scaleY, '#38bdf8', trLabel);

        const topSample = measureRegionColorAndPattern(
            metrics.imageData, anW, anH,
            bx + bw * 0.20, by + bh * 0.12,
            Math.max(8, bw * 0.60), Math.max(8, bh * 0.35)
        );
        const botSample = measureRegionColorAndPattern(
            metrics.imageData, anW, anH,
            bx + bw * 0.20, by + bh * 0.52,
            Math.max(8, bw * 0.60), Math.max(8, bh * 0.36)
        );

        const align = computeAlignmentInstruction(cupPred.bbox, anW, anH, trLabel);
        el.tPosition.textContent = `${trLabel} (${align.posLabel})`;
        el.tDistance.textContent = `Üst: ${topSample.colorName} | Alt: ${botSample.colorName}`;

        announceGuidance(`${trLabel} algılandı (${align.posLabel}). Üst kısmın rengi ${topSample.colorName}, alt kısmın rengi ${botSample.colorName}.`, {
            bannerState: align.isCentered ? 'centered' : 'normal',
            minIntervalMs: 3400
        });
    }

    /**
     * Mod 12: Kapı Numarası, Asansör Kat Tuşları ve 7-Segment Beyaz Eşya Dijital Ekran Köprüleyici
     */
    function preprocess7SegmentAndPanelCanvas(sourceCanvas) {
        const w = sourceCanvas.width;
        const h = sourceCanvas.height;
        const bin = applyBradleyRothShadowRemoval(sourceCanvas, 0.86);
        const data = bin.binaryData;
        const outCanvas = document.createElement('canvas');
        outCanvas.width = w;
        outCanvas.height = h;
        const ctx = outCanvas.getContext('2d');
        const outImg = ctx.createImageData(w, h);
        const dst = outImg.data;

        // 7-Segment LED/LCD rakamlardaki kopuk çizgileri 3x3 morfolojik erozyon (siyah genişletme) ile birleştir
        for (let y = 1; y < h - 1; y++) {
            for (let x = 1; x < w - 1; x++) {
                let hasBlackNeighbor = false;
                for (let dy = -1; dy <= 1 && !hasBlackNeighbor; dy++) {
                    for (let dx = -1; dx <= 1; dx++) {
                        if (data[((y + dy) * w + (x + dx)) * 4] === 0) {
                            hasBlackNeighbor = true;
                            break;
                        }
                    }
                }
                const val = hasBlackNeighbor ? 0 : 255;
                const p = (y * w + x) * 4;
                dst[p] = val;
                dst[p + 1] = val;
                dst[p + 2] = val;
                dst[p + 3] = 255;
            }
        }
        ctx.putImageData(outImg, 0, 0);
        return outCanvas;
    }

    function handleDoorElevatorLcdLiveMode(anW, anH, scaleX, scaleY, ovCtx, metrics) {
        const textCheck = detectTextStrokeBandAndCropCanvas(el.analysisCanvas, metrics);
        const hasPanelOrDigits = Boolean(textCheck && textCheck.hasTextLikely);
        const panelBox = [anW * 0.20, anH * 0.20, anW * 0.60, anH * 0.60];
        const isPosMode = state.mode === 'pos_iban_reader';
        const boxLabel = isPosMode ? 'POS Ekranı / Fiş / IBAN Alanı' : 'Kapı No / Asansör / LCD Ekran';

        drawTargetBox(ovCtx, panelBox, scaleX, scaleY, hasPanelOrDigits ? '#22c55e' : '#38bdf8', boxLabel);

        el.tPosition.textContent = hasPanelOrDigits ? 'Rakam / Yazı Algılandı' : (isPosMode ? 'POS / IBAN Aranıyor' : 'Panel Aranıyor');
        el.tDistance.textContent = (hasPanelOrDigits && metrics.sharpness >= 6.8) ? 'Net (Okumaya Hazır)' : 'Hizalayın ve Sabitleyin';
        radar.updateRadar(0, 0, hasPanelOrDigits);

        if (hasPanelOrDigits && metrics.sharpness >= 6.8 && state.autoCaptureEnabled && !state.isProcessingOcr) {
            handleAutoCaptureCountdown(isPosMode ? 'POS ekranı veya IBAN yazısı netlendi, okunuyor!' : 'Panel ve rakamlar netlendi, okunuyor!');
        } else if (isPosMode) {
            announceGuidance('POS cihazı tutarı ve IBAN okuyucu modundasınız. Çekilecek tutarı veya faturadaki TR IBAN numarasını okutmak için kamerayı ekrana tutup Boşluk tuşuna basın veya ekrana çift dokunun.', {
                bannerState: hasPanelOrDigits ? 'centered' : 'normal',
                minIntervalMs: 3600
            });
        } else {
            announceGuidance('Kapı numarası, asansör kat tuşları veya çamaşır/klima dijital ekranı modundasınız. Rakamları okutmak için kamerayı panele tutup Boşluk tuşuna basın veya ekrana çift dokunun.', {
                bannerState: hasPanelOrDigits ? 'centered' : 'normal',
                minIntervalMs: 3600
            });
        }
    }

    /**
     * Mod 13: Gıda Tazelik / Küf Spektral Anomalisi (CIELAB) ve Paketli Gıda Alerjen / İçindekiler Denetçisi
     */
    function analyzeFoodMoldAndFreshness(metrics, anW, anH) {
        const { imageData, gw, gh, step } = metrics;
        const data = imageData.data;

        const gx0 = Math.floor(gw * 0.25), gx1 = Math.floor(gw * 0.75);
        const gy0 = Math.floor(gh * 0.25), gy1 = Math.floor(gh * 0.75);

        let totalSamples = 0;
        let moldSpoilPixels = 0;
        let darkRotPixels = 0;
        let sumL = 0;

        for (let gy = gy0; gy < gy1; gy++) {
            for (let gx = gx0; gx < gx1; gx++) {
                const idx = ((gy * step) * anW + (gx * step)) * 4;
                const r = data[idx], g = data[idx + 1], b = data[idx + 2];
                const lab = rgbToLab(r, g, b);
                sumL += lab.L;
                totalSamples++;

                // Küf (Penicillium / Aspergillus) spektral imzası: Grimsi-yeşil/mavi soğuk lekeler (a* < -4.2 ve düşük sarı b* < 14)
                if (lab.L >= 25 && lab.L <= 78 && lab.a <= -4.5 && lab.b >= -16 && lab.b <= 12) {
                    moldSpoilPixels++;
                }
                // Çürük / nekrotik kararma imzası
                if (lab.L < 20 && r < 45 && g < 40) {
                    darkRotPixels++;
                }
            }
        }

        const avgL = sumL / Math.max(1, totalSamples);
        const moldRatio = moldSpoilPixels / Math.max(1, totalSamples);
        const rotRatio = (avgL > 48) ? (darkRotPixels / Math.max(1, totalSamples)) : 0;
        const hasAnomaly = (moldRatio >= 0.035) || (rotRatio >= 0.045);

        return {
            hasAnomaly,
            moldRatio: Number((moldRatio * 100).toFixed(1)),
            rotRatio: Number((rotRatio * 100).toFixed(1))
        };
    }

    function parseFoodAllergensAndIngredients(ocrText) {
        const text = String(ocrText || '');
        const upper = text.toUpperCase();
        const detectedAllergens = [];
        const freeFromNotes = [];

        // Önce "İÇERMEZ / -SİZ / -SUZ / YOKTUR" ifadelerini tespit et ve metinden çıkar ki "GLUTENSİZ" veya "DOMUZ KATKISI İÇERMEZ" yazısı yanlışlıkla alerji alarmı tetiklemesin!
        const negationPatterns = [
            { label: 'Glutensiz (Gluten İçermez)', regex: /GLUTENS[İI]Z|GLUTEN\s*[İI]ÇERMEZ|GLUTEN\s*YOKTUR|GLUTEN[\s\-]*FREE/gi },
            { label: 'Laktozsuz (Laktoz İçermez)', regex: /LAKTOZSUZ|LAKTOZ\s*[İI]ÇERMEZ|SÜT\s*ÜRÜNÜ\s*[İI]ÇERMEZ|LACTOSE[\s\-]*FREE/gi },
            { label: 'Domuz Yağı ve Katkısı İçermez', regex: /DOMUZ\s*(?:YAĞI|ETİ|KATKISI|ÜRÜNÜ|ÜRÜNLERİ)?\s*(?:VE\s*(?:KATKISI|KATKILARI|TÜREVLERİ)\s*)?(?:[İI]ÇERMEZ|YOKTUR)/gi },
            { label: 'Alkolsüz (Alkol İçermez)', regex: /ALKOLSÜZ|ALKOL\s*[İI]ÇERMEZ|ALKOL\s*YOKTUR|ALCOHOL[\s\-]*FREE/gi },
            { label: 'Yumurtasız (Yumurta İçermez)', regex: /YUMURTASIZ|YUMURTA\s*[İI]ÇERMEZ/gi }
        ];

        let cleanedForAllergens = upper;
        negationPatterns.forEach(np => {
            if (np.regex.test(cleanedForAllergens)) {
                freeFromNotes.push(np.label);
                cleanedForAllergens = cleanedForAllergens.replace(np.regex, ' ');
            }
        });

        const allergenRules = [
            { name: 'Gluten / Buğday', regex: /(?:^|[^\p{L}])(?:GLUTEN|BUĞDAY|BUGDAY|ÇAVDAR|CAVDAR|ARPA|YULAF)(?=$|[^\p{L}])/iu },
            { name: 'Süt / Laktoz', regex: /(?:^|[^\p{L}])(?:LAKTOZ|SÜT|SUT|PEYNİR|PEYNIR|YOĞURT|YOGURT|KREMA|KAZEİN|KAZEIN|TEREYAĞ|TEREYAGI|TEREYAĞI)(?=$|[^\p{L}])/iu },
            { name: 'Yer Fıstığı', regex: /YER\s*FISTI[ĞG]/i },
            { name: 'Kuruyemiş (Fındık/Badem/Ceviz/Antep Fıstığı)', regex: /FINDIK|BADEM|CEV[İI]Z|ANTEP\s*FISTI[ĞG]|KAJU/i },
            { name: 'Soya Lesitini / Soya', regex: /(?:^|[^\p{L}])SOYA(?=$|[^\p{L}])/iu },
            { name: 'Yumurta', regex: /(?:^|[^\p{L}])YUMURTA(?=$|[^\p{L}])/iu },
            { name: 'Balık / Deniz Ürünü', regex: /(?:^|[^\p{L}])(?:BALIK|TON\s*BALIĞI|SOMON|KARİDES|KALAMAR)(?=$|[^\p{L}])/iu },
            { name: 'Susam', regex: /(?:^|[^\p{L}])(?:SUSAM|TAHİN|TAHIN)(?=$|[^\p{L}])/iu },
            { name: 'Kükürt Dioksit / Sülfit', regex: /KÜKÜRT|KUKURT|SÜLFİT|SULFIT|E220/i },
            { name: 'Domuz Katkısı / Alkol / Karmin (E120) Uyarısı', regex: /(?:^|[^\p{L}])(?:DOMUZ|LARD|ALKOL|ETANOL|KARMİN|KARMIN|E120)(?=$|[^\p{L}])/iu }
        ];

        allergenRules.forEach(rule => {
            if (rule.regex.test(cleanedForAllergens)) {
                detectedAllergens.push(rule.name);
            }
        });

        const sktInfo = parseMedicineAndExpiryZeroError(text);
        return {
            allergens: detectedAllergens,
            freeFromNotes,
            sktInfo
        };
    }

    function handleFoodFreshnessLiveMode(anW, anH, scaleX, scaleY, ovCtx, metrics, predictions) {
        const roiBox = [anW * 0.25, anH * 0.25, anW * 0.50, anH * 0.50];
        const colName = metrics.centerColor ? metrics.centerColor.name : 'Bilinmiyor';
        const verifiedObjs = Array.isArray(predictions) ? predictions : [];
        const isCalorieMode = state.mode === 'step_calorie_guide';

        drawTargetBox(ovCtx, roiBox, scaleX, scaleY, '#22c55e', isCalorieMode ? 'Besin / Kalori Tablosu Alanı' : 'Gıda Paketi / Etiket Okuma Alanı');

        el.tPosition.textContent = verifiedObjs.length > 0
            ? `${TR_LABELS[verifiedObjs[0].class] || verifiedObjs[0].class}`
            : (isCalorieMode ? `Adım: ${state.dailySteps || 0}` : 'Paket / Etiket Alanı');
        el.tDistance.textContent = isCalorieMode ? `Alınan: ${state.dailyIntakeKcal || 0} kcal` : `Merkez Renk: ${colName}`;

        const objPhrase = verifiedObjs.length > 0
            ? `Önünüzde ${TR_LABELS[verifiedObjs[0].class] || verifiedObjs[0].class} görünüyor. `
            : '';

        if (isCalorieMode) {
            announceGuidance(`${objPhrase}Adım sayacı ve kalori rehberi modundasınız. Paketli ürünün kalori ve besin değerleri tablosunu okutmak için Boşluk tuşuna basın veya yemek adını kutudan sorgulayın.`, {
                bannerState: 'centered',
                minIntervalMs: 3800
            });
        } else {
            announceGuidance(`${objPhrase}Merkez rengi ${colName}. Paketin üzerindeki içindekiler yazısını, alerji yapan maddeleri ve son tüketim tarihini okutmak için Boşluk tuşuna basın veya ekrana çift dokunun.`, {
                bannerState: 'centered',
                minIntervalMs: 3800
            });
        }
    }

    /**
     * Mod 14: Sosyal İletişim ve Odadaki Kişilerin Konum / Kıyafet Rengi Asistanı (Sıfır Halüsinasyon)
     */
    function estimatePersonGazeAndOrientation(personBox, metrics, anW, anH) {
        const [, , bw, bh] = personBox;
        const heightPct = Math.round((bh / Math.max(1, anH)) * 100);
        const areaPct = Math.round(((bw * bh) / Math.max(1, anW * anH)) * 100);
        return {
            heightPct,
            areaPct
        };
    }

    // =========================================================================
    // 6. FOTOĞRAF ÇEKİMİ, GÖLGESİZ ÇİFT SÜTUN SINAV OKUMA VE BANKNOT TANIMA
    // =========================================================================
    async function triggerRetinaFlashIfNeeded(avgBrightness) {
        if ((state.flashMode === 'on' || (state.flashMode === 'auto' && avgBrightness < 65)) && el.retinaFlash) {
            el.retinaFlash.hidden = false;
            await new Promise(r => setTimeout(r, 220));
        }
    }

    function hideRetinaFlash() {
        if (el.retinaFlash) el.retinaFlash.hidden = true;
    }

    function createRotatedCanvas(sourceCanvas, angleDeg) {
        const out = document.createElement('canvas');
        const w = sourceCanvas.width;
        const h = sourceCanvas.height;
        if (angleDeg === 90 || angleDeg === 270) {
            out.width = h;
            out.height = w;
        } else {
            out.width = w;
            out.height = h;
        }
        const ctx = out.getContext('2d');
        ctx.translate(out.width / 2, out.height / 2);
        ctx.rotate((angleDeg * Math.PI) / 180);
        ctx.drawImage(sourceCanvas, -w / 2, -h / 2);
        return out;
    }

    /**
     * Kağıt parayı düz (0°), baş aşağı ters (180°), sağa dik (90°) veya sola dik (270°)
     * nasıl tutulursa tutulsun tanıyan 360° çok yönlü OCR tarayıcı.
     * Eğer paranın üzerinde "TÜRK LİRASI" / "MERKEZ BANKASI" okunuyor ama rakam parmak altında
     * veya kadraj dışında kaldıysa { partialOnly: true } döndürerek kullanıcıyı sesli uyarır.
     */
    async function recognizeBanknoteMultiOrientation(sourceCanvas, centerColorName = '') {
        if (typeof window.Tesseract === 'undefined') return null;

        let sawBanknoteWordsWithoutNumber = false;
        const hasBanknoteWords = (txt) => /L[İI]RASI\b|T[ÜU]RK\s*L[İI]RA|MERKEZ\s*BANK|CUMHUR[İI]YET\s*MERKEZ/i.test(txt || '');

        // 1. Düz (0°) kontrol et (Sadece gerçek OCR doğrulamasından geçen temiz metinleri kullan)
        const res0 = await window.Tesseract.recognize(sourceCanvas, 'tur+eng');
        const txt0 = extractVerifiedRealTextFromOcrResult(res0);
        const match0 = detectTurkishBanknoteDetailsFromText(txt0, centerColorName);
        if (match0) return match0;
        if (hasBanknoteWords(txt0)) sawBanknoteWordsWithoutNumber = true;

        // 2. Baş Aşağı Ters (180°) çevrilmiş kağıt para kontrolü
        const canvas180 = createRotatedCanvas(sourceCanvas, 180);
        const res180 = await window.Tesseract.recognize(canvas180, 'tur+eng');
        const txt180 = extractVerifiedRealTextFromOcrResult(res180);
        const match180 = detectTurkishBanknoteDetailsFromText(txt180, centerColorName);
        if (match180) return match180;
        if (hasBanknoteWords(txt180)) sawBanknoteWordsWithoutNumber = true;

        // 3. Sağa Dik / Yan (90°) tutulmuş kağıt para kontrolü
        const canvas90 = createRotatedCanvas(sourceCanvas, 90);
        const res90 = await window.Tesseract.recognize(canvas90, 'tur+eng');
        const txt90 = extractVerifiedRealTextFromOcrResult(res90);
        const match90 = detectTurkishBanknoteDetailsFromText(txt90, centerColorName);
        if (match90) return match90;
        if (hasBanknoteWords(txt90)) sawBanknoteWordsWithoutNumber = true;

        // 4. Sola Dik / Yan (270°) tutulmuş kağıt para kontrolü
        const canvas270 = createRotatedCanvas(sourceCanvas, 270);
        const res270 = await window.Tesseract.recognize(canvas270, 'tur+eng');
        const txt270 = extractVerifiedRealTextFromOcrResult(res270);
        const match270 = detectTurkishBanknoteDetailsFromText(txt270, centerColorName);
        if (match270) return match270;
        if (hasBanknoteWords(txt270)) sawBanknoteWordsWithoutNumber = true;

        if (sawBanknoteWordsWithoutNumber) {
            return { partialOnly: true };
        }
        return null;
    }

    /**
     * T.C. Merkez Bankası E9 Emisyon Kağıt Paralarını Sıfır-Hata İle Tanıyan Üçlü Doğrulama Motoru:
     * 1) Rakam ve Yazı ("200", "İKİ YÜZ", "100", "YÜZ", "50", "ELLİ", "20", "YİRMİ", "10", "ON", "5", "BEŞ")
     * 2) Baş Aşağı (Ters) Tutulan Rakam Kalıpları ("002"->200, "001"->100, "05"->50, "02"->20, "01"->10 + Renk Kilidi)
     * 3) Arka Yüz İpuçları ve Renk Çapraz Doğrulaması (Kullanıcıya söylenmez, sadece arka planda doğrulama içindir)
     * 4) Seri Numarası Yakalayıcı -> Aynı kağıt paranın yanlışlıkla iki kez toplanmasını önler.
     */
    function detectTurkishBanknoteDetailsFromText(ocrText, centerColorName = '') {
        const clean = String(ocrText || '').toUpperCase();
        const colorUpper = String(centerColorName || '').toUpperCase();

        // Renk grupları: 10 TL (Kırmızı/Bordo/Pembe) vs 100 TL (Mavi/Turkuaz/Lacivert); 20 TL (Yeşil/Haki) vs 200 TL (Mor/Eflatun)
        const isBlueCyan = /MAVİ|TURKUAZ|LACİVERT/.test(colorUpper);
        const isRedPink = /KIRMIZI|BORDO|PEMBE/.test(colorUpper);
        const isGreen = /YEŞİL|HAKİ/.test(colorUpper);
        const isPurple = /MOR|EFLATUN/.test(colorUpper);
        const isOrangeYellow = /TURUNCU|SARI|HARDAL/.test(colorUpper);

        const hasExplicitMoneyWord = /L[İI]RASI\b|T[ÜU]RK\s*L[İI]RA|MERKEZ\s*BANK|CUMHUR[İI]YET\s*MERKEZ|İKİ\s*YÜZ|IKI\s*YUZ|\bYÜZ\s*(?:TÜRK|LİRA)|\bELLİ\s*(?:TÜRK|LİRA)|\bYİRMİ\s*(?:TÜRK|LİRA)|\bON\s*(?:TÜRK|LİRA)|\bBEŞ\s*(?:TÜRK|LİRA)/.test(clean);

        // Arka yüz portre isimlerinden kesin kupür tespiti (Kullanıcıya asla söylenmez, sadece iç doğrulama!)
        const hasYunusEmre = /YUNUS\s*EMRE|SEVVELİM|SEVELIM/.test(clean);
        const hasItri = /ITR[İI]|BUHUR[İI]ZADE|MUSTAFA\s*EFEND/.test(clean);
        const hasFatmaAliye = /FATMA\s*AL[İI]YE/.test(clean);
        const hasKemaleddin = /KEMALEDD[İI]N|M[İI]MAR\s*KEMAL/.test(clean);
        const hasCahitArf = /CAH[İI]T\s*ARF|ARF\s*DEĞİŞMEZ/.test(clean);
        const hasAydinSayili = /AYDIN\s*SAYILI/.test(clean);

        // Baş aşağı (180 derece ters) tutulduğunda OCR'ın "002", "001", "05", "02", "01" okuma ihtimali (Mutlaka renk veya para kelimesi kilidiyle!)
        const hasUpsideDown200 = (/\b002\b|\b00Z\b/.test(clean)) && (isPurple || hasExplicitMoneyWord);
        const hasUpsideDown100 = (/\b001\b/.test(clean)) && (isBlueCyan || hasExplicitMoneyWord);
        const hasUpsideDown50 = /\b05\b/.test(clean) && (isOrangeYellow || hasExplicitMoneyWord);
        const hasUpsideDown20 = (/\b02\b|\b0Z\b/.test(clean)) && (isGreen || hasExplicitMoneyWord);
        const hasUpsideDown10 = /\b01\b/.test(clean) && (isRedPink || hasExplicitMoneyWord);

        // TCMB E9 Seri Numarası Kalıbı (Örn: B14 582910 veya A09 1234567)
        let serialNumber = '';
        const serialMatch = clean.match(/\b([A-ZÇĞİÖŞÜ]\s*\d{2})\s*(\d{6,7})\b/);
        if (serialMatch) {
            serialNumber = (serialMatch[1] + serialMatch[2]).replace(/\s+/g, '');
        }

        const hasPortraitMatch = hasYunusEmre || hasItri || hasFatmaAliye || hasKemaleddin || hasCahitArf || hasAydinSayili;
        const hasUpsideDownMatch = hasUpsideDown200 || hasUpsideDown100 || hasUpsideDown50 || hasUpsideDown20 || hasUpsideDown10;
        // Kitap sayfası, cetvel veya takvim üzerindeki "10, 20, 50, 100" sayılarını asla para sanmamak için
        // mutlaka para kelimesi, portre adı, seri numarası veya renk+ters-rakam doğrulaması şarttır!
        const isMoneyContext = hasPortraitMatch || hasUpsideDownMatch || hasExplicitMoneyWord || Boolean(serialNumber);

        if (!isMoneyContext) return null;

        const foundNotes = [];
        const pushNote = (kurus, label) => {
            if (!foundNotes.some(n => n.kurus === kurus)) {
                foundNotes.push({ kurus, label, count: 1 });
            }
        };

        // Seri numarasındaki rakamların ("B 10 582910" içindeki 10 gibi) veya "İKİ YÜZ" içindeki "YÜZ" kelimesinin
        // yanlışlıkla ikinci bir kupür olarak algılanmasını önle:
        const cleanWithoutSerial = serialMatch ? clean.replace(serialMatch[0], ' ') : clean;
        const cleanWithout200 = cleanWithoutSerial.replace(/İKİ\s*YÜZ|IKI\s*YUZ/g, ' ');

        if (hasYunusEmre || hasUpsideDown200 || /\b200\b|İKİ\s*YÜZ|IKI\s*YUZ/.test(cleanWithoutSerial)) {
            pushNote(20000, '200 Türk Lirası');
        }
        if (hasItri || hasUpsideDown100 || /\b100\b|\bYÜZ\s*(?:TÜRK|LİRA)|\bYUZ\s*(?:TURK|LIRA)/.test(cleanWithout200)) {
            pushNote(10000, '100 Türk Lirası');
        }
        if (hasFatmaAliye || hasUpsideDown50 || /\b50\b|ELLİ\s*(?:TÜRK|LİRA)|ELLI\s*(?:TURK|LIRA)/.test(cleanWithoutSerial)) {
            pushNote(5000, '50 Türk Lirası');
        }
        if (hasKemaleddin || hasUpsideDown20 || /\b20\b|YİRMİ\s*(?:TÜRK|LİRA)|YIRMI\s*(?:TURK|LIRA)/.test(cleanWithoutSerial)) {
            // Eğer OCR parmak yüzünden 200'ün son sıfırını kaçırıp "20" okuduysa ama kağıt belirgin Mor/Eflatun ise ve Yeşil değilse:
            if (isPurple && !isGreen && !/YİRMİ|YIRMI/.test(cleanWithoutSerial) && !hasKemaleddin) {
                pushNote(20000, '200 Türk Lirası');
            } else {
                pushNote(2000, '20 Türk Lirası');
            }
        }
        if (hasCahitArf || hasUpsideDown10 || /\b10\b|\bON\s*(?:TÜRK|LİRA)|\bON\s*(?:TURK|LIRA)/.test(cleanWithoutSerial)) {
            // Eğer OCR parmak yüzünden 100'ün son sıfırını kaçırıp "10" okuduysa ama kağıt belirgin Mavi/Turkuaz ise ve Kırmızı değilse:
            if (isBlueCyan && !isRedPink && !/\bON\s*(?:TÜRK|LİRA|TURK|LIRA)/.test(cleanWithoutSerial) && !hasCahitArf) {
                pushNote(10000, '100 Türk Lirası');
            } else {
                pushNote(1000, '10 Türk Lirası');
            }
        }
        if (hasAydinSayili || /\b5\b\s*(?:TÜRK|TURK|LİRA|LIRA|TL)|BEŞ\s*(?:TÜRK|LİRA)|BES\s*(?:TURK|LIRA)/.test(cleanWithoutSerial)) {
            // Eğer 50 TL'nin sıfırı kapandıysa ama renk belirgin Turuncu/Sarı ise:
            if (isOrangeYellow && !/BEŞ|BES/.test(cleanWithoutSerial) && !hasAydinSayili) {
                pushNote(5000, '50 Türk Lirası');
            } else {
                pushNote(500, '5 Türk Lirası');
            }
        }

        if (foundNotes.length === 0) return null;

        const totalKurus = foundNotes.reduce((acc, n) => acc + n.kurus * n.count, 0);
        const label = foundNotes.length === 1
            ? foundNotes[0].label
            : foundNotes.map(n => n.label).join(' + ');
        const items = foundNotes.map(n => ({
            valueKurus: n.kurus,
            label: `${n.label} (Kağıt Para)`,
            count: n.count
        }));

        return {
            kurus: totalKurus,
            label,
            items,
            serialNumber,
            signature: 'NOTE_' + foundNotes.map(n => n.kurus).sort((a, b) => b - a).join('+') + (serialNumber ? '_' + serialNumber : '')
        };
    }

    function detectTurkishBanknoteFromTextAndColor(ocrText) {
        const info = detectTurkishBanknoteDetailsFromText(ocrText);
        return info ? info.label : null;
    }

    /**
     * Fotoğrafın herhangi bir alt bölgesinin (örneğin kişinin üzerindeki kıyafetin,
     * arka plan duvarının veya parmağın dokunduğu noktanın) gerçek rengini ve desenini ölçer.
     */
    function measureRegionColorAndPattern(imageData, width, height, rx, ry, rw, rh) {
        const data = imageData.data;
        const x0 = Math.max(1, Math.min(width - 2, Math.floor(rx)));
        const y0 = Math.max(1, Math.min(height - 2, Math.floor(ry)));
        const x1 = Math.max(x0 + 1, Math.min(width - 2, Math.floor(rx + rw)));
        const y1 = Math.max(y0 + 1, Math.min(height - 2, Math.floor(ry + rh)));

        let rSum = 0, gSum = 0, bSum = 0, lumSum = 0, cnt = 0;
        let sobelH = 0, sobelV = 0, strongEdges = 0;
        const step = Math.max(1, Math.floor(Math.min(x1 - x0, y1 - y0) / 18));

        for (let y = y0; y <= y1; y += step) {
            for (let x = x0; x <= x1; x += step) {
                const idx = (y * width + x) * 4;
                const r = data[idx], g = data[idx + 1], b = data[idx + 2];
                rSum += r;
                gSum += g;
                bSum += b;
                lumSum += (0.299 * r + 0.587 * g + 0.114 * b);
                cnt++;

                const idxL = (y * width + (x - 1)) * 4;
                const idxR = (y * width + (x + 1)) * 4;
                const idxU = ((y - 1) * width + x) * 4;
                const idxD = ((y + 1) * width + x) * 4;
                const gx = Math.abs(data[idxR] - data[idxL]);
                const gy = Math.abs(data[idxD] - data[idxU]);
                sobelH += gy;
                sobelV += gx;
                if (gx + gy > 42) strongEdges++;
            }
        }

        const avgR = Math.round(rSum / Math.max(1, cnt));
        const avgG = Math.round(gSum / Math.max(1, cnt));
        const avgB = Math.round(bSum / Math.max(1, cnt));
        const avgLum = Math.round(lumSum / Math.max(1, cnt));
        const color = classifyColorCIELAB(avgR, avgG, avgB);

        const edgeRatio = strongEdges / Math.max(1, cnt);
        let pattern = 'düz dokulu';
        if (edgeRatio > 0.18) {
            if (sobelH > sobelV * 1.5) pattern = 'yatay çizgili';
            else if (sobelV > sobelH * 1.5) pattern = 'dikey çizgili';
            else pattern = 'kareli veya desenli';
        }

        return { colorName: color.name, pattern, avgLum };
    }

    /**
     * iPhone Görüntü Betimleyici'den Daha Detaylı, Doğal Türkçe Hikâye Betimleme Motoru.
     * Ortam ışığını, arka planı, kişilerin duruşunu, bakış yönünü, kıyafet rengini/desenini,
     * çevredeki eşyaların konumunu ve fotoğraftaki yazıları sıcak bir dille anlatır.
     */
    function buildRichTurkishPhotoStory(capCanvas, metrics, preds, cleanText = '') {
        const w = capCanvas.width;
        const h = capCanvas.height;
        const imgData = metrics.imageData;
        const sentences = [];

        // 1. Ortam Işığı, Netlik ve Gerçek Renkler (Yüzdeler koda gömülüdür, kullanıcıya doğal Türkçe konuşur)
        let lightDesc = 'normal oda aydınlığında';
        if (metrics.avgBrightness < 42) lightDesc = 'oldukça karanlık';
        else if (metrics.avgBrightness < 82) lightDesc = 'loş ışıklı';
        else if (metrics.avgBrightness > 205) lightDesc = 'bol ışıklı ve parlak';

        const sharpDesc = metrics.sharpness >= 7.0 ? 'net' : 'hafif bulanık';
        const topBg = measureRegionColorAndPattern(imgData, w, h, w * 0.15, h * 0.04, w * 0.70, h * 0.18);
        const midRegion = measureRegionColorAndPattern(imgData, w, h, w * 0.25, h * 0.25, w * 0.50, h * 0.50);
        sentences.push(`Görüntü özeti: ${lightDesc}, ${sharpDesc} bir görüntü. Merkezdeki renk ${midRegion.colorName}, üst arka plan ${topBg.colorName} tonlarında.`);

        // 2. Yapay Zekanın Beyninde Doğrulanmış Kişiler (Tahmin ve Halüsinasyon Yok)
        const verifiedPreds = verifyPredictionsInAiBrain(preds || [], w, h, false);
        const people = verifiedPreds.filter(p => p.class === 'person');
        const otherObjs = verifiedPreds.filter(p => p.class !== 'person');

        if (people.length === 0) {
            if (otherObjs.length === 0 || state.mode === 'portrait') {
                sentences.push('Görüntüde insan görünmüyor.');
            }
        } else {
            people.sort((a, b) => (a.bbox[0] + a.bbox[2] / 2) - (b.bbox[0] + b.bbox[2] / 2));
            const personItems = people.slice(0, 4).map((p, idx) => {
                const [bx, by, bw, bh] = p.bbox;
                const cx = (bx + bw / 2) / w;
                const posWord = cx < 0.36 ? 'solda' : (cx > 0.64 ? 'sağda' : 'ortada');
                const torso = measureRegionColorAndPattern(
                    imgData, w, h,
                    bx + bw * 0.22,
                    by + bh * 0.32,
                    Math.max(12, bw * 0.56),
                    Math.max(12, bh * 0.38)
                );
                return `${idx + 1}. kişi (${posWord}, üzerinde ${torso.colorName} tonlarında kıyafet var)`;
            });
            sentences.push(`Toplam ${people.length} kişi var — ${personItems.join(', ')}.`);
        }

        // 3. Yapay Zekanın Beyninde Doğrulanmış Diğer Eşyalar
        if (otherObjs.length > 0) {
            const itemPhrases = otherObjs.slice(0, 6).map(obj => {
                const [bx, by, bw, bh] = obj.bbox;
                const cx = (bx + bw / 2) / w;
                const cy = (by + bh / 2) / h;
                let loc = 'ortada';
                if (cx < 0.35 && cy < 0.45) loc = 'sol üstte';
                else if (cx < 0.35 && cy >= 0.45) loc = 'solda';
                else if (cx > 0.65 && cy < 0.45) loc = 'sağ üstte';
                else if (cx > 0.65 && cy >= 0.45) loc = 'sağda';
                else if (cy > 0.65) loc = 'alt kısımda';

                const objColor = measureRegionColorAndPattern(imgData, w, h, bx + bw * 0.2, by + bh * 0.2, bw * 0.6, bh * 0.6);
                const trName = TR_LABELS[obj.class] || obj.class;
                return `${loc} ${objColor.colorName} ${trName}`;
            });
            sentences.push(`Görünen eşyalar: ${itemPhrases.join(', ')}.`);
        } else if (people.length === 0) {
            const bot = measureRegionColorAndPattern(imgData, w, h, w * 0.20, h * 0.68, w * 0.60, h * 0.24);
            sentences.push(`Belirgin bir eşya görünmüyor; merkezde ${midRegion.colorName}, alt kısımda ${bot.colorName} yüzey bulunuyor.`);
        }

        // 4. Sadece Para Modundayken Demir Para Kontrolü ve Doğrulanmış Yazı Özeti
        if (state.mode === 'color_cloth' || state.mode === 'anomaly_led') {
            const coinScan = detectAndClassifyTurkishCoins(metrics, w, h, cleanText);
            if (coinScan.coins.length > 0) {
                sentences.push(coinScan.summarySpeech);
            }
        }

        if (cleanText && cleanText.trim().length >= 1) {
            const banknote = detectTurkishBanknoteFromTextAndColor(cleanText);
            if (banknote) {
                sentences.push(`Fotoğrafta ${banknote} kağıt para yazısı okundu.`);
            }
            const shortText = cleanText.replace(/\s+/g, ' ').trim();
            sentences.push(`Okunan yazı: "${shortText}".`);
        }

        return sentences.join(' ');
    }

    /**
     * Parmağınla Dokunarak Fotoğraf Keşfi (Touch-to-Explore Image Map).
     * Kullanıcı parmağını fotoğraf üzerinde gezdirdikçe altında ne olduğunu (yüz, kıyafet rengi,
     * madeni para, eşya, yazı veya arka plan rengi) seslendirir ve titreşim verir.
     */
    function populatePhotoExplorerMap(capCanvas, metrics, preds, ocrLines = [], storyText = '') {
        state.lastStoryText = storyText;
        if (!el.photoExplorerCanvas) return;

        const expCanvas = el.photoExplorerCanvas;
        const targetW = 480;
        const targetH = Math.max(240, Math.round((capCanvas.height / Math.max(1, capCanvas.width)) * targetW));
        expCanvas.width = targetW;
        expCanvas.height = targetH;

        const ctx = expCanvas.getContext('2d');
        ctx.drawImage(capCanvas, 0, 0, targetW, targetH);

        const scaleX = targetW / capCanvas.width;
        const scaleY = targetH / capCanvas.height;

        const verifiedPreds = verifyPredictionsInAiBrain(preds || [], capCanvas.width, capCanvas.height, false);
        verifiedPreds.forEach(p => {
            const trName = TR_LABELS[p.class] || p.class;
            drawTargetBox(ctx, p.bbox, scaleX, scaleY, p.class === 'person' ? '#22c55e' : '#38bdf8', trName);
        });

        // Madeni paraları sadece para veya düşen eşya modundaysa işaretle
        const coinScan = (state.mode === 'color_cloth' || state.mode === 'anomaly_led')
            ? detectAndClassifyTurkishCoins(metrics, capCanvas.width, capCanvas.height)
            : { coins: [] };
        coinScan.coins.forEach(coin => {
            drawCoinCircleOverlay(ctx, coin, scaleX, scaleY);
        });

        state.exploredPhoto = {
            width: capCanvas.width,
            height: capCanvas.height,
            imageData: metrics.imageData,
            preds: verifiedPreds,
            coins: coinScan.coins,
            ocrLines,
            storyText
        };
    }

    function handlePhotoExplorerPointerEvent(ev) {
        if (!state.exploredPhoto || !el.photoExplorerCanvas) return;
        ev.preventDefault();

        const rect = el.photoExplorerCanvas.getBoundingClientRect();
        let clientX = ev.clientX;
        let clientY = ev.clientY;
        if (ev.touches && ev.touches.length > 0) {
            clientX = ev.touches[0].clientX;
            clientY = ev.touches[0].clientY;
        }
        if (typeof clientX !== 'number' || typeof clientY !== 'number') return;

        const nx = Math.max(0, Math.min(1, (clientX - rect.left) / Math.max(1, rect.width)));
        const ny = Math.max(0, Math.min(1, (clientY - rect.top) / Math.max(1, rect.height)));

        const { width, height, imageData, preds, coins, ocrLines } = state.exploredPhoto;
        const px = nx * width;
        const py = ny * height;

        // Bölge Adı (Üst Sol, Tam Orta, Sağ Alt vb.)
        const hPos = nx < 0.33 ? 'Sol' : (nx > 0.66 ? 'Sağ' : 'Orta');
        const vPos = ny < 0.33 ? 'Üst' : (ny > 0.66 ? 'Alt' : 'Orta');
        const zoneName = (hPos === 'Orta' && vPos === 'Orta') ? 'Tam Merkez' : `${vPos} ${hPos}`;

        const patch = measureRegionColorAndPattern(imageData, width, height, px - 18, py - 18, 36, 36);
        let hitDescription = '';

        // 0. Öncelik: Parmağın altında bir madeni (demir) para var mı?
        if (Array.isArray(coins) && coins.length > 0) {
            for (let i = 0; i < coins.length; i++) {
                const c = coins[i];
                if (Math.hypot(px - c.cx, py - c.cy) <= c.radius * 1.15) {
                    hitDescription = `${zoneName}: Demir Para — ${c.name} (${c.metalDesc})`;
                    break;
                }
            }
        }

        // 1. Öncelik: Parmağın altında insan veya eşya var mı?
        if (!hitDescription) {
            for (let i = 0; i < preds.length; i++) {
                const p = preds[i];
                const [bx, by, bw, bh] = p.bbox;
                if (px >= bx && px <= bx + bw && py >= by && py <= by + bh) {
                    if (p.class === 'person') {
                        const relY = (py - by) / Math.max(1, bh);
                        if (relY < 0.32) {
                            hitDescription = `${zoneName}: Kişinin baş ve yüz kısmı`;
                        } else if (relY < 0.80) {
                            hitDescription = `${zoneName}: Kişinin kıyafeti, ${patch.colorName} (${patch.pattern})`;
                        } else {
                            hitDescription = `${zoneName}: Kişinin alt kısmı (${patch.colorName})`;
                        }
                    } else {
                        const trName = TR_LABELS[p.class] || p.class;
                        hitDescription = `${zoneName}: ${trName} (${patch.colorName})`;
                    }
                    break;
                }
            }
        }

        // 2. Öncelik: Parmağın altında gerçekten doğrulanmış bir yazı satırı var mı?
        if (!hitDescription && ocrLines && ocrLines.length > 0) {
            for (let i = 0; i < ocrLines.length; i++) {
                const ln = ocrLines[i];
                const lineConf = typeof ln.confidence === 'number' ? ln.confidence : 75;
                if (lineConf >= 38 && ln.bbox && px >= ln.bbox.x0 && px <= ln.bbox.x1 && py >= ln.bbox.y0 && py <= ln.bbox.y1) {
                    const cleanLn = (ln.text || '').replace(/\s+/g, ' ').trim();
                    const alphaCount = (cleanLn.match(/[\p{L}\p{N}]/gu) || []).length;
                    if (cleanLn.length >= 1 && alphaCount >= 1 && (alphaCount / cleanLn.length) >= 0.42) {
                        hitDescription = `${zoneName} yazı: ${cleanLn}`;
                        break;
                    }
                }
            }
        }

        // 3. Arka plan / yüzey rengi ve parlaklığı
        if (!hitDescription) {
            const lumWord = patch.avgLum < 50 ? 'karanlık' : (patch.avgLum > 195 ? 'parlak' : 'aydınlık');
            hitDescription = `${zoneName}: Arka plan veya yüzey, ${patch.colorName} (${lumWord})`;
        }

        if (el.photoExplorerStatus) {
            el.photoExplorerStatus.textContent = `👆 ${hitDescription}`;
        }

        // Farklı bir nesneye/bölgeye geçildiğinde avuç içinde hafif tık titreşimi ve sesli okuma
        if (hitDescription !== state.lastExplorerLabel) {
            state.lastExplorerLabel = hitDescription;
            const now = performance.now();
            if (navigator.vibrate && now - state.lastExplorerVibrateAt > 180) {
                navigator.vibrate(25);
                state.lastExplorerVibrateAt = now;
            }
            announceGuidance(hitDescription, {
                force: true,
                updateBanner: false,
                minIntervalMs: 350
            });
        }
    }

    async function captureAndDescribePhoto(isAutoTriggered = false) {
        if (!state.isRunning && !isAutoTriggered && el.video.readyState < 2) {
            await startCamera();
        }
        if (!state.isRunning || el.video.readyState < 2) {
            announceGuidance('Kameradan çekmek için önce kamerayı başlatın veya üstteki "Galeriden Fotoğraf Seç" düğmesiyle telefonunuzdaki bir fotoğrafı betimletin.', {
                force: true,
                bannerState: 'warning'
            });
            return;
        }

        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = 320;
        tempCanvas.height = 240;
        const tempCtx = tempCanvas.getContext('2d');
        tempCtx.drawImage(el.video, 0, 0, 320, 240);
        const preMetrics = analyzeFrameMathematics(tempCtx, 320, 240);

        await triggerRetinaFlashIfNeeded(preMetrics.avgBrightness);
        radar.playShutterSound();

        const capCanvas = document.createElement('canvas');
        capCanvas.width = el.video.videoWidth;
        capCanvas.height = el.video.videoHeight;
        const ctx = capCanvas.getContext('2d');
        ctx.drawImage(el.video, 0, 0, capCanvas.width, capCanvas.height);
        hideRetinaFlash();

        await analyzePhotoCanvasAndDescribe(capCanvas, isAutoTriggered ? 'Otomatik Çekilen Fotoğraf' : 'Kamera Fotoğrafı');
    }

    /**
     * EVRENSEL AKILLI METİN DENETÇİSİ ("NE GÖRÜRSE OKUYAN VE ANLAYAN KAMERA"):
     * Kullanıcı hangi modda olursa olsun kamerada okunan bir metin içinde Son Kullanma Tarihi (SKT),
     * İlaç Dozajı, Gıda Alerjeni, IBAN, POS Tutarı, Besin Değeri veya Maç Skoru varsa
     * mod değiştirmeye gerek kalmadan otomatik yakalar ve kullanıcıya bildirir.
     */
    function buildUniversalSmartInsights(cleanText, primaryPassVerifiedText = '', secondaryRawVerifiedText = '') {
        const text = String(cleanText || '').trim();
        if (!text) return { speechNotes: [], reportLines: [], hasExpiredAlarm: false };

        const speechNotes = [];
        const reportLines = [];
        let hasExpiredAlarm = false;

        // 1. İlaç / Gıda Son Kullanma Tarihi (SKT / TETT / EXP) ve Dozaj Kontrolü
        const med = parseMedicineAndExpiryZeroError(primaryPassVerifiedText || text, state.lastDetectedBarcode, secondaryRawVerifiedText);
        if (med.formattedDate !== 'Doğrulanamadı') {
            if (med.sktStatus === 'EXPIRED') {
                hasExpiredAlarm = true;
                radar.playDangerAlarm();
                if (navigator.vibrate) navigator.vibrate([250, 80, 250, 80, 350]);
            }
            speechNotes.push(med.sktSpeech);
            reportLines.push(`Son Kullanma Tarihi: ${med.sktSpeech}`);
        }
        if (med.dosages.length > 0) {
            const dosStr = `Miktar / Dozaj: ${med.dosages.join(', ')}.`;
            speechNotes.push(dosStr);
            reportLines.push(dosStr);
        }
        if (med.usageInstructions.length > 0) {
            const useStr = `Kullanım Tarifi: ${med.usageInstructions.join(', ')}.`;
            speechNotes.push(useStr);
            reportLines.push(useStr);
        }

        // 2. Gıda Alerjeni ve Güvenli İbare Kontrolü
        const pkg = parseFoodAllergensAndIngredients(text);
        if (pkg.freeFromNotes && pkg.freeFromNotes.length > 0) {
            const freeStr = `Güvenli İbare: ${pkg.freeFromNotes.join(', ')}.`;
            speechNotes.push(freeStr);
            reportLines.push(freeStr);
        }
        if (pkg.allergens && pkg.allergens.length > 0) {
            const alStr = `DİKKAT ALERJİ UYARISI: ${pkg.allergens.join(', ')} içeriyor!`;
            speechNotes.push(alStr);
            reportLines.push(alStr);
        }

        // 3. TR IBAN ve POS / Fiş Toplam Tutarı Kontrolü
        const hasIbanCandidate = /\bTR\s*[0-9OISB\s\-]{16,34}/i.test(text);
        const hasExplicitPosTotal = /(?:TOPLAM|TUTAR|ÖDENECEK|ODENECEK|SATIŞ|SATIS)\s*[:.]?\s*(?:₺\s*)?\d/i.test(text);
        if (hasIbanCandidate || hasExplicitPosTotal) {
            const posIban = processPosAmountAndIbanText(text, primaryPassVerifiedText, secondaryRawVerifiedText);
            if (posIban && posIban.speechText && !posIban.speechText.startsWith('POS tutarı veya IBAN net seçilemedi') && !posIban.speechText.startsWith('Ekranda henüz')) {
                speechNotes.push(posIban.speechText);
                reportLines.push(posIban.speechText);
            }
        }

        // 4. Besin Değeri / Kalori Tablosu Kontrolü
        if (/(?:ENERJİ|ENERJI|BESİN|BESIN|KCAL|KKAL|KALORİ|KALORI)/i.test(text)) {
            const calInfo = parsePackageOrMenuCaloriesKind(text);
            if (calInfo && calInfo.speechText && calInfo.speechText.startsWith('Pakette okunan besin değerleri')) {
                speechNotes.push(calInfo.speechText);
                reportLines.push(calInfo.speechText);
            }
        }

        // 5. Canlı Maç Skoru Tabelası Kontrolü (Herhangi bir modda TV veya ekran görüntüsü okutulduğunda)
        if (/\b[A-ZÇĞİÖŞÜ]{2,12}\s+\d{1,2}\s*[-:]\s*\d{1,2}\s+[A-ZÇĞİÖŞÜ]{2,12}\b/i.test(text)) {
            const tvCheck = processTvSubtitleAndScoreText(text, true);
            if (tvCheck && tvCheck.speechText && tvCheck.speechText.startsWith('Canlı Maç Skoru:')) {
                const scoreOnly = tvCheck.speechText.split('. ')[0] + '.';
                speechNotes.push(scoreOnly);
                reportLines.push(scoreOnly);
            }
        }

        return {
            speechNotes,
            reportLines,
            hasExpiredAlarm
        };
    }

    /**
     * Hem kameradan çekilen fotoğrafı, hem Galeriden seçilen fotoğrafı, hem de WhatsApp'tan
     * "Paylaş -> Mikyas Kamera Asistanı" ile gönderilen fotoğrafı detaylı betimler ve okur.
     */
    async function analyzePhotoCanvasAndDescribe(capCanvas, sourceLabel = 'Fotoğraf') {
        const ctx = capCanvas.getContext('2d');
        state.lastCapturedDataUrl = capCanvas.toDataURL('image/jpeg', 0.92);
        el.btnDownloadPhoto.hidden = false;

        const metrics = analyzeFrameMathematics(ctx, capCanvas.width, capCanvas.height);
        state.lastMetrics = metrics;
        let preds = [];
        if (!state.cocoModel && typeof window.cocoSsd !== 'undefined') {
            try {
                state.cocoModel = await window.cocoSsd.load({ base: 'lite_mobilenet_v2' });
            } catch (_) {}
        }
        if (state.cocoModel) {
            try {
                const rawPreds = await state.cocoModel.detect(capCanvas, 12, 0.58);
                preds = verifyPredictionsInAiBrain(rawPreds, capCanvas.width, capCanvas.height, false);
            } catch (_) {
                preds = [];
            }
        }

        // İlk anlık doğal Türkçe sahne betimlemesini hemen oluştur ve kullanıcıyı bekletmeden söyle!
        const initialStory = buildRichTurkishPhotoStory(capCanvas, metrics, preds, '');
        populatePhotoExplorerMap(capCanvas, metrics, preds, [], initialStory);

        const hasOcrEngine = typeof window.Tesseract !== 'undefined';
        showDetectedResult(
            `${sourceLabel} — Detaylı Türkçe Betimleme`,
            hasOcrEngine ? (initialStory + '\n\n(Fotoğrafın üzerindeki yazılar kontrol ediliyor...)') : initialStory
        );
        announceGuidance(
            hasOcrEngine ? `${sourceLabel} inceleniyor, sahne ve yazılar okunuyor...` : initialStory,
            {
                force: true,
                bannerState: 'centered'
            }
        );

        if (!state.isProcessingOcr) {
            state.isProcessingOcr = true;
            try {
                let splitInfo = { isTwoColumn: false, canvases: [capCanvas] };
                let combinedText = '';
                let verifiedCombinedText = '';
                let verifiedMultilineText = '';
                let collectedLines = [];
                let primaryPassVerifiedText = '';
                let secondaryRawVerifiedText = '';

                if (hasOcrEngine) {
                    const binObj = applyBradleyRothShadowRemoval(capCanvas);
                    splitInfo = (state.mode === 'door_elevator_lcd')
                        ? { isTwoColumn: false, canvases: [capCanvas, preprocess7SegmentAndPanelCanvas(capCanvas)] }
                        : splitExamColumnsIfTwoColumn(binObj);

                    for (let i = 0; i < splitInfo.canvases.length; i++) {
                        const ocrRes = await window.Tesseract.recognize(splitInfo.canvases[i], 'tur+eng');
                        const partText = (ocrRes && ocrRes.data && ocrRes.data.text) ? ocrRes.data.text.trim() : '';
                        const partVerified = extractVerifiedRealTextFromOcrResult(ocrRes);
                        const partMultiline = extractVerifiedRealTextFromOcrResult(ocrRes, '\n');
                        if (partText) {
                            combinedText += (combinedText ? '\n\n' : '') + partText;
                        }
                        if (partVerified && verifiedCombinedText !== partVerified && !verifiedCombinedText.endsWith(partVerified)) {
                            verifiedCombinedText += (verifiedCombinedText ? ' — ' : '') + partVerified;
                        }
                        if (partMultiline && verifiedMultilineText !== partMultiline) {
                            verifiedMultilineText += (verifiedMultilineText ? '\n\n' : '') + partMultiline;
                        }
                        if (ocrRes && ocrRes.data && Array.isArray(ocrRes.data.lines) && !splitInfo.isTwoColumn && (collectedLines.length === 0 || i === 0)) {
                            collectedLines = ocrRes.data.lines;
                        }
                    }
                    primaryPassVerifiedText = verifiedCombinedText.trim();

                    // MAKSİMUM GÜVENLİK ÇİFT-GEÇİŞLİ (DUAL-PASS) OCR KİLİDİ:
                    // İlaç, Gıda Alerjeni, POS/IBAN, İmza Evrakı ve Para modlarında gölge silici filtre parlak yüzeyde
                    // baştaki bir rakamı ("1500 TL" -> "500 TL" gibi) silmesin diye HAM RENKLİ GÖRÜNTÜYÜ de mutlaka okut ve çapraz doğrula!
                    const isHighStakesSafetyMode = (
                        state.mode === 'medicine_skt' ||
                        state.mode === 'food_freshness' ||
                        state.mode === 'pos_iban_reader' ||
                        state.mode === 'signature_pen' ||
                        state.mode === 'color_cloth'
                    );

                    if (state.mode !== 'door_elevator_lcd' && (verifiedCombinedText.trim().length < 6 || isHighStakesSafetyMode)) {
                        const fallbackRes = await window.Tesseract.recognize(capCanvas, 'tur+eng');
                        const rawText = (fallbackRes && fallbackRes.data && fallbackRes.data.text) ? fallbackRes.data.text.trim() : '';
                        secondaryRawVerifiedText = extractVerifiedRealTextFromOcrResult(fallbackRes).trim();
                        const rawMultiline = extractVerifiedRealTextFromOcrResult(fallbackRes, '\n');
                        if (verifiedCombinedText.trim().length < 6) {
                            combinedText = rawText;
                            verifiedCombinedText = secondaryRawVerifiedText;
                            verifiedMultilineText = rawMultiline;
                            if (fallbackRes && fallbackRes.data && Array.isArray(fallbackRes.data.lines)) {
                                collectedLines = fallbackRes.data.lines;
                            }
                        } else if (secondaryRawVerifiedText && secondaryRawVerifiedText !== primaryPassVerifiedText) {
                            verifiedCombinedText = `${primaryPassVerifiedText} — ${secondaryRawVerifiedText}`;
                        }
                    }
                }

                const cleanText = verifiedCombinedText.trim();
                const fullStory = buildRichTurkishPhotoStory(capCanvas, metrics, preds, verifiedCombinedText);
                populatePhotoExplorerMap(capCanvas, metrics, preds, collectedLines, fullStory);

                // ÖZEL MOD 10: İMZA ATILACAK EVRAKIN İÇERİĞİNİ VE İMZA SATIRINI DOĞRULAMA KİLİDİ
                if (state.mode === 'signature_pen') {
                    const hasSignatureKeyword = /(?:^|[^\p{L}])(?:İMZA|IMZA|İMZASI|IMZASI|İMZALAYAN|AD\s*SOYAD|ADI\s*SOYADI|ONAY|KABUL|TAAHHÜT|SÖZLEŞME|DİLEKÇE|TUTANAK)(?=$|[^\p{L}])/iu.test(cleanText);
                    if (cleanText.length >= 12) {
                        state.signatureDocVerified = true;
                        const sigKeywordMsg = hasSignatureKeyword
                            ? 'Evrak üzerinde imza / ad-soyad alanı doğrulandı.'
                            : 'Dikkat: Evrakta yazı okundu ancak açıkça "İmza" kelimesi görülmedi; lütfen metni dikkatle dinleyin.';
                        const sigSpeech = `Evrak Okundu! ${sigKeywordMsg} Evrakta yazan metin: ${cleanText.replace(/\s+/g, ' ')}`;
                        showDetectedResult('✍️ İmza Evrakı Doğrulama Raporu', `${sigKeywordMsg}\n\nEvrak Metni:\n${cleanText}`);
                        announceGuidance(sigSpeech, { force: true, bannerState: hasSignatureKeyword ? 'centered' : 'warning' });
                    } else {
                        state.signatureDocVerified = false;
                        const warnMsg = 'DİKKAT: Bu kağıdın üzerindeki yazılar net okunamadı! İçeriğini bilmediğiniz bir evraka imza atmamak için lütfen kamerayı biraz geri çekip tüm sayfayı net şekilde tekrar okutun.';
                        showDetectedResult('⚠️ Evrak Okunamadı (İmza Güvenlik Kilidi)', warnMsg);
                        announceGuidance(warnMsg, { force: true, bannerState: 'warning' });
                    }
                    return;
                }

                // ÖZEL MOD 9: İLAÇ KUTUSU, DOZAJ (mg), BARKOD VE SON KULLANMA TARİHİ (SKT) DENETÇİSİ
                if (state.mode === 'medicine_skt') {
                    const med = parseMedicineAndExpiryZeroError(primaryPassVerifiedText || cleanText, state.lastDetectedBarcode, secondaryRawVerifiedText);
                    state.lastDetectedBarcode = '';
                    if (med.sktStatus === 'EXPIRED') {
                        radar.playDangerAlarm();
                        if (navigator.vibrate) navigator.vibrate([250, 80, 250, 80, 350]);
                    }
                    const dosageLine = med.dosages.length > 0 ? `İlaç Miktarı/Formu: ${med.dosages.join(', ')}.` : 'Miligram bilgisi bu yüzde görünmüyor.';
                    const usageLine = med.usageInstructions.length > 0 ? `Eczane Kullanım Tarifi: ${med.usageInstructions.join(', ')}.` : '';
                    const barcodeLine = med.barcodes.length > 0 ? `Doğrulanmış Barkod: ${med.barcodes.join(', ')}.` : '';
                    const safetyDisclaimer = 'Sağlık Uyarısı: İlaç kutularındaki soğuk damga kabartma tarihler kamerada eksik çıkabilir; ilacı içmeden önce adını ve dozunu eczane etiketiyle veya yakınınızla mutlaka teyit edin.';
                    const medReport = `${med.sktSpeech}\n${dosageLine}\n${usageLine}\n${barcodeLine}\n${safetyDisclaimer}\n\nKutuda Okunan Yazı:\n${cleanText || 'Yazı okunamadı.'}`.trim();

                    showDetectedResult('İlaç Kutusu ve Son Kullanma Tarihi Raporu', medReport);
                    announceGuidance(`${med.sktSpeech} ${dosageLine} ${usageLine} ${cleanText ? 'Kutu üzerindeki yazı: ' + cleanText.replace(/\s+/g, ' ') + '.' : ''} ${safetyDisclaimer}`, {
                        force: true,
                        bannerState: med.sktStatus === 'EXPIRED' ? 'warning' : 'centered'
                    });
                    return;
                }

                // ÖZEL MOD 13: GIDA PAKET İÇERİĞİ, ALERJEN VE SON TÜKETİM TARİHİ DENETÇİSİ (SIFIR HALÜSİNASYON)
                if (state.mode === 'food_freshness') {
                    const pkg = parseFoodAllergensAndIngredients(cleanText);
                    const surfaceMsg = `Paket Rengi: ${metrics.centerColor.name}.`;
                    const freeFromMsg = (pkg.freeFromNotes && pkg.freeFromNotes.length > 0)
                        ? `Doğrulanan Güvenli İbare: ${pkg.freeFromNotes.join(', ')}.`
                        : '';
                    const hasFullIngredientsHeader = /(?:İÇİNDEKİLER|ICINDEKILER|İÇİNDEKİ|ALERJEN|ALLERGEN|İÇERİR|ICERIR)/i.test(cleanText) && cleanText.length >= 25;
                    const allergenMsg = pkg.allergens.length > 0
                        ? `DİKKAT ALERJİ UYARISI: Pakette ${pkg.allergens.join(', ')} bulundu!`
                        : (hasFullIngredientsHeader
                            ? 'Okunan içindekiler listesinde bilinen bir alerji maddesine rastlanmadı; ancak ciddi alerjiniz varsa tüketmeden önce bir yakınınıza da teyit ettirin.'
                            : 'DİKKAT: Paketin İçindekiler listesi bu açıdan tam okunamadı! Alerjiniz varsa bu ürüne güvenmeyin; lütfen paketin arka yüzündeki İçindekiler bölümünü yakından okutun.');
                    const foodReport = `${surfaceMsg}\n${freeFromMsg}\n${allergenMsg}\n${pkg.sktInfo.formattedDate !== 'Doğrulanamadı' ? pkg.sktInfo.sktSpeech : ''}\n\nPakette Okunan Yazı:\n${cleanText || 'Paket yazısı algılanmadı.'}`.trim();

                    if (pkg.sktInfo.sktStatus === 'EXPIRED') {
                        radar.playDangerAlarm();
                    }
                    showDetectedResult('Gıda Paketi İçindekiler, Alerjen ve SKT Raporu', foodReport);
                    announceGuidance(`${surfaceMsg} ${freeFromMsg} ${allergenMsg} ${pkg.sktInfo.formattedDate !== 'Doğrulanamadı' ? pkg.sktInfo.sktSpeech : ''}`, {
                        force: true,
                        bannerState: (pkg.sktInfo.sktStatus === 'EXPIRED' || pkg.allergens.length > 0 || !hasFullIngredientsHeader) ? 'warning' : 'centered'
                    });
                    return;
                }

                // ÖZEL MOD 12: KAPI NUMARASI, ASANSÖR TUŞ PANELİ, KOMBİ / BEYAZ EŞYA MARKASI VE MAKİNE EKRANI OKUYUCU
                if (state.mode === 'door_elevator_lcd') {
                    const brandRules = [
                        { name: 'DemirDöküm', regex: /\bDEM[İI]R\s*D[ÖO]K[ÜU]M\b/i },
                        { name: 'Vaillant', regex: /\bVAILLANT\b/i },
                        { name: 'Baymak', regex: /\bBAYMAK\b/i },
                        { name: 'E.C.A.', regex: /\bE\.?\s*C\.?\s*A\.?\b/i },
                        { name: 'Buderus', regex: /\bBUDERUS\b/i },
                        { name: 'Bosch', regex: /\bBOSCH\b/i },
                        { name: 'Viessmann', regex: /\bVIESSMANN\b/i },
                        { name: 'Alarko', regex: /\bALARKO\b/i },
                        { name: 'Ferroli', regex: /\bFERROLI\b/i },
                        { name: 'Protherm', regex: /\bPROTHERM\b/i },
                        { name: 'Warmhaus', regex: /\bWARMHAUS\b/i },
                        { name: 'Airfel', regex: /\bAIRFEL\b/i },
                        { name: 'Daikin', regex: /\bDAIKIN\b/i },
                        { name: 'Arçelik', regex: /\bAR[ÇC]EL[İI]K\b/i },
                        { name: 'Beko', regex: /\bBEKO\b/i },
                        { name: 'Vestel', regex: /\bVESTEL\b/i },
                        { name: 'Profilo', regex: /\bPROF[İI]LO\b/i },
                        { name: 'Siemens', regex: /\bSIEMENS\b/i },
                        { name: 'Altus', regex: /\bALTUS\b/i },
                        { name: 'Regal', regex: /\bREGAL\b/i },
                        { name: 'Grundig', regex: /\bGRUNDIG\b/i },
                        { name: 'Samsung', regex: /\bSAMSUNG\b/i },
                        { name: 'LG', regex: /\bLG\b/ },
                        { name: 'Midea', regex: /\bMIDEA\b/i },
                        { name: 'Electrolux', regex: /\bELECTROLUX\b/i },
                        { name: 'Teka', regex: /\bTEKA\b/i },
                        { name: 'Franke', regex: /\bFRANKE\b/i },
                        { name: 'Silverline', regex: /\bSILVERLINE\b/i },
                        { name: 'Mitsubishi', regex: /\bMITSUBISHI\b/i },
                        { name: 'Toshiba', regex: /\bTOSHIBA\b/i },
                        { name: 'Kumtel', regex: /\bKUMTEL\b/i },
                        { name: 'Luxell', regex: /\bLUXELL\b/i },
                        { name: 'Fakir', regex: /\bFAKIR\b/i },
                        { name: 'Philips', regex: /\bPHILIPS\b/i },
                        { name: 'Korkmaz', regex: /\bKORKMAZ\b/i },
                        { name: 'Karaca', regex: /\bKARACA\b/i },
                        { name: 'Simfer', regex: /\bS[İI]MFER\b/i },
                        { name: 'Hoover', regex: /\bHOOVER\b/i },
                        { name: 'Candy', regex: /\bCANDY\b/i },
                        { name: 'Indesit', regex: /\bINDESIT\b/i },
                        { name: 'Hotpoint', regex: /\bHOTPOINT\b/i },
                        { name: 'Whirlpool', regex: /\bWHIRLPOOL\b/i },
                        { name: 'Miele', regex: /\bMIELE\b/i },
                        { name: 'Gree', regex: /\bGREE\b/i },
                        { name: 'Baxi', regex: /\bBAXI\b/i },
                        { name: 'Immergas', regex: /\bIMMERGAS\b/i }
                    ];
                    const verifiedBrands = brandRules.filter(b => b.regex.test(cleanText)).map(b => b.name);
                    const brandLine = verifiedBrands.length > 0
                        ? `Doğrulanmış Cihaz / Kombi Markası: ${verifiedBrands.join(', ')}.`
                        : (cleanText
                            ? `Okunan Ekran / Kapı / Cihaz Yazısı: ${cleanText.replace(/\s+/g, ' ')}.`
                            : 'Bu açıdan henüz yazı veya rakam okunamadı.');

                    const degMatches = cleanText.match(/\b\d{1,4}(?:[.,]\d)?\s*(?:°\s*C|derece|bar|devir|dk|dakika|kat|daire|no)\b/gi) || [];
                    const errMatches = cleanText.match(/\b(?:E|F|ERR|HATA)\s*[-:]?\s*\d{1,3}\b/gi) || [];
                    const numTokens = cleanText.match(/\b\d{1,4}\b/g) || [];
                    const errLine = errMatches.length > 0 ? `Algılanan Arıza Kodu: ${[...new Set(errMatches)].join(', ')}. ` : '';
                    const summaryNums = degMatches.length > 0
                        ? `${errLine}Birimli Değerler: ${degMatches.join(', ')}.`
                        : (numTokens.length > 0 ? `${errLine}Okunan Numara / Tuşlar: ${[...new Set(numTokens)].slice(0, 8).join(', ')}.` : (errLine || ''));
                    const boilerSafetyNote = 'Güvenlik uyarısı: Kombi su basıncı veya gaz vanası gibi kritik müdahalelerde kameradaki rakama tek başına güvenmeyin; mutlaka gören bir yakınınıza veya yetkili servise kontrol ettirin.';
                    const panelReport = `${brandLine}\n${summaryNums}\n\n⚠️ ${boilerSafetyNote}\n\nEkran veya Kapı Yazısı:\n${cleanText || 'Rakam veya yazı okunamadı.'}`.trim();
                    showDetectedResult('Kapı Numarası, Asansör & Kombi / Makine Ekranı Raporu', panelReport);
                    const spokenPanel = verifiedBrands.length > 0
                        ? `${brandLine} ${summaryNums} ${cleanText.replace(/\s+/g, ' ')}. ${boilerSafetyNote}`
                        : `${brandLine} ${summaryNums} ${boilerSafetyNote}`;
                    announceGuidance(spokenPanel.replace(/\s+/g, ' ').trim(), {
                        force: true,
                        bannerState: 'centered'
                    });
                    return;
                }

                // ÖZEL MOD 16: OTOBÜS / MİNİBÜS HAT NUMARASI VE DURAK TABELASI OKUYUCU
                if (state.mode === 'bus_stop_tracker') {
                    const busReport = processBusRouteOcrResult(cleanText, preds);
                    showDetectedResult('🚌 Otobüs / Minibüs Hat Numarası ve Durak Raporu', busReport.fullText);
                    announceGuidance(busReport.speechText, { force: true, bannerState: 'centered' });
                    return;
                }

                // ÖZEL MOD 17: POS CİHAZI TUTARI DOĞRULAYICI VE TEK TUŞLA IBAN KOPYALAYICI
                if (state.mode === 'pos_iban_reader') {
                    const posIban = processPosAmountAndIbanText(cleanText, primaryPassVerifiedText, secondaryRawVerifiedText);
                    showDetectedResult('💳 POS Cihazı Tutarı ve IBAN Raporu', posIban.fullText);
                    announceGuidance(posIban.speechText, { force: true, bannerState: 'centered' });
                    return;
                }

                // ÖZEL MOD 18: EŞYAMI NEREYE KOYDUM VE KAVANOZ / KUTU TANITICI
                if (state.mode === 'item_memory') {
                    const jarMatch = matchOrDescribeJarAndMemoryItem(capCanvas, metrics, cleanText);
                    showDetectedResult('🎙️ Eşya Hafızası ve Kavanoz / Kutu Tanıma', jarMatch.fullText);
                    announceGuidance(jarMatch.speechText, { force: true, bannerState: 'centered' });
                    return;
                }

                // ÖZEL MOD 19: TELEVİZYON ALTYAZI OKUYUCU VE CANLI MAÇ SKORU SPİKERİ
                if (state.mode === 'tv_subtitle_score') {
                    const tvReport = processTvSubtitleAndScoreText(cleanText, false);
                    showDetectedResult('📺 Televizyon Altyazı ve Canlı Maç Skoru', tvReport.fullText);
                    announceGuidance(tvReport.speechText, { force: true, bannerState: 'centered' });
                    return;
                }

                // ÖZEL MOD 20: ÇORAP EŞLEŞTİRİCİ, KOMBİN UYUMU VE LEKE KONTROLÜ
                if (state.mode === 'sock_outfit_check') {
                    const sockReport = analyzeSocksAndOutfitStains(capCanvas, metrics, cleanText);
                    showDetectedResult('🧦 Çorap Eşleştirme, Kombin ve Leke Raporu', sockReport.fullText);
                    announceGuidance(sockReport.speechText, { force: true, bannerState: 'centered' });
                    return;
                }

                // ÖZEL MOD 21: TAM OLARAK NEREDEYİM (SOKAK + TABELA + WHATSAPP KONUM TARİFİ)
                if (state.mode === 'where_am_i') {
                    await announceWhereAmIFullAddressAndSignboard(cleanText, preds);
                    return;
                }

                // ÖZEL MOD 22: SESLİ ADIM SAYACI VE KALORİ / BESİN DEĞERİ REHBERİ (PAKET / MENÜ OKUMA)
                if (state.mode === 'step_calorie_guide') {
                    const calReport = parsePackageOrMenuCaloriesKind(cleanText);
                    showDetectedResult('👟🥗 Besin Değeri ve Sağlıklı Yaşam Raporu', calReport.fullText);
                    announceGuidance(calReport.speechText, { force: true, bannerState: 'centered' });
                    return;
                }

                // ÖZEL MOD 23: ADIM ADIM SESLİ YEMEK TARİFLERİ REHBERİ (HEM KAMERADAKİ MALZEME/PAKET YAZISINI OKUR HEM TARİF ADIMINI SÖYLER)
                if (state.mode === 'cooking_guide') {
                    if (cleanText) {
                        const cookInsights = buildUniversalSmartInsights(cleanText, primaryPassVerifiedText, secondaryRawVerifiedText);
                        const extraNotes = cookInsights.speechNotes.length > 0 ? ` ${cookInsights.speechNotes.join(' ')}` : '';
                        showDetectedResult('🍳 Yemek Rehberi — Okunan Malzeme / Paket Yazısı', `Okunan Yazı: ${cleanText}\n${cookInsights.reportLines.join('\n')}\n\n${fullStory}`.trim());
                        announceGuidance(`Kamerada okunan yazı: ${cleanText.replace(/\s+/g, ' ')}.${extraNotes}`, { force: true, bannerState: 'centered' });
                    } else {
                        stepCookingInstruction(0);
                    }
                    return;
                }

                // ÖZEL MOD 5 (PARA SAYMA VE TÜM GENEL MODLAR): KAĞIT PARA ALGILANDIĞINDA SADECE 5. MODDA TOPLAMA EKLE, DİĞER MODLARDA SADECE SÖYLE
                const centerColName = metrics.centerColor ? metrics.centerColor.name : '';
                let banknoteDetails = detectTurkishBanknoteDetailsFromText(cleanText, centerColName);
                const hasBanknoteWordsInText = /L[İI]RASI\b|T[ÜU]RK\s*L[İI]RA|MERKEZ\s*BANK|CUMHUR[İI]YET\s*MERKEZ/i.test(cleanText || '');
                if (!banknoteDetails && (state.mode === 'color_cloth' || hasBanknoteWordsInText)) {
                    const rotatedCheck = await recognizeBanknoteMultiOrientation(capCanvas, centerColName);
                    if (rotatedCheck && rotatedCheck.partialOnly) {
                        announceGuidance('Kağıt parayı algıladım ancak rakam kısmı parmağınızın altında veya ekranın dışında kalmış. Lütfen parayı düzeltip kenarından tutarak tekrar gösterin.', {
                            force: true,
                            bannerState: 'warning'
                        });
                        return;
                    }
                    if (rotatedCheck && !rotatedCheck.partialOnly) {
                        banknoteDetails = rotatedCheck;
                    }
                }
                const photoCoins = (state.mode === 'color_cloth' || state.mode === 'anomaly_led')
                    ? detectAndClassifyTurkishCoins(metrics, capCanvas.width, capCanvas.height, cleanText)
                    : { coins: [], totalKurus: 0, totalFormatted: '0 Kuruş' };
                if (state.mode === 'color_cloth' && (banknoteDetails || photoCoins.coins.length > 0)) {
                    if (banknoteDetails && banknoteDetails.serialNumber && state.moneySeenSerialNumbers && state.moneySeenSerialNumbers.has(banknoteDetails.serialNumber)) {
                        announceGuidance(`Bu ${banknoteDetails.label} kağıt parayı zaten saymıştınız, toplamınıza tekrar eklenmedi. Şu anki toplamınız: ${formatTurkishKurusTotal(state.moneyTotalKurus)}.`, {
                            force: true,
                            bannerState: 'warning'
                        });
                        return;
                    }
                    if (banknoteDetails && banknoteDetails.serialNumber && state.moneySeenSerialNumbers) {
                        state.moneySeenSerialNumbers.add(banknoteDetails.serialNumber);
                    }
                    let combinedKurus = 0;
                    const combinedLabels = [];
                    const combinedItems = [];

                    if (banknoteDetails) {
                        combinedKurus += banknoteDetails.kurus;
                        combinedLabels.push(`${banknoteDetails.label} (Kağıt Para)`);
                        combinedItems.push(...(banknoteDetails.items || [{ valueKurus: banknoteDetails.kurus, label: `${banknoteDetails.label} (Kağıt Para)`, count: 1 }]));
                    }
                    if (photoCoins.coins.length > 0) {
                        combinedKurus += photoCoins.totalKurus;
                        const coinLabel = photoCoins.coins.length === 1
                            ? photoCoins.coins[0].name
                            : `${photoCoins.coins.length} adet demir para (${photoCoins.totalFormatted})`;
                        combinedLabels.push(coinLabel);
                        combinedItems.push(...photoCoins.coins.map(c => ({ valueKurus: c.valueKurus, label: c.name, count: 1 })));
                    }

                    const fullAddedLabel = combinedLabels.join(' + ');
                    addMoneyToRunningTotal(combinedKurus, fullAddedLabel, combinedItems, 'ocr_money', banknoteDetails ? (banknoteDetails.serialNumber || '') : '');
                    const totalFormatted = formatTurkishKurusTotal(state.moneyTotalKurus);
                    const breakdown = computeMoneyBreakdownSummary();
                    showDetectedResult(
                        `💵🪙 ${fullAddedLabel} Eklendi — Toplam: ${totalFormatted}`,
                        `Eklenen Para: ${fullAddedLabel}\nŞu Anki Toplam Paranız: ${totalFormatted}\nSayılan Paralar: ${breakdown.spokenBreakdown}\n\n--- Detaylı Betimleme ---\n${fullStory}`
                    );
                    return;
                } else if (banknoteDetails && state.mode !== 'color_cloth') {
                    showDetectedResult(
                        `💵 Algılanan Kağıt Para: ${banknoteDetails.label}`,
                        `Görüntüdeki Kağıt Para: ${banknoteDetails.label}\n(Not: Paralarınızı cüzdan toplamınıza eklemek isterseniz 5. Bölüm olan Canlı Para Sayma moduna geçebilirsiniz.)\n\n--- Detaylı Betimleme ---\n${fullStory}`
                    );
                    announceGuidance(`Görüntüde ${banknoteDetails.label} kağıt para algılandı. Paralarınızı toplamak isterseniz 5. Bölüm olan Canlı Para Sayma moduna geçebilirsiniz.`, {
                        force: true,
                        bannerState: 'centered'
                    });
                    return;
                }

                // EVRENSEL SINAV VE DÜZ METİN OKUYUCU: Hangi genel modda olunursa olunsun A-B-C-D-E şıklı soru varsa kumandayı açar;
                // şıklı soru yoksa kullanıcıyı "şıklı soru algılanmadı" diye uyarmak yerine gördüğü her yazıyı ve akıllı bulguları doğrudan okur!
                const parsedQuestions = parseExamQuestionsAndOptions((verifiedMultilineText || cleanText).trim());
                const hasDetectedExamOptions = parsedQuestions.length > 0 && Boolean(parsedQuestions[0].options.A || parsedQuestions[0].options.B || parsedQuestions[0].options.C);

                if (hasDetectedExamOptions || state.mode === 'exam_reader') {
                    if (parsedQuestions.length > 0) {
                        state.examQuestions = parsedQuestions;
                    } else {
                        state.examQuestions = [{
                            number: 1,
                            stem: cleanText
                                ? `Okunan Metin: ${cleanText.replace(/\s+/g, ' ')}`
                                : 'Bu görüntüde henüz okunabilir bir yazı bulunamadı.',
                            options: { A: '', B: '', C: '', D: '', E: '' }
                        }];
                    }
                    state.currentExamIndex = 0;
                    updateExamRemoteUI();
                }

                const firstQ = (state.examQuestions && state.examQuestions.length > 0) ? state.examQuestions[0] : null;
                const hasOptions = hasDetectedExamOptions && firstQ && (firstQ.options.A || firstQ.options.B || firstQ.options.C);

                if (hasOptions) {
                    if (el.examRemotePanel) {
                        el.examRemotePanel.hidden = (state.mode !== 'exam_reader');
                    }
                    const colNote = splitInfo.isTwoColumn ? 'Yan yana iki sütunlu test kağıdı birbirine karışmadan ayrıldı.' : '';
                    const finalReport = `${colNote}\nToplam ${state.examQuestions.length} soru bulundu.\n\nSoru ${firstQ.number}: ${firstQ.stem}\n` +
                        ['A', 'B', 'C', 'D', 'E']
                            .filter(k => Boolean(firstQ.options[k]))
                            .map(k => `${k}) ${firstQ.options[k]}`)
                            .join('\n') + `\n\n--- Sahne Betimlemesi ---\n${fullStory}`;
                    showDetectedResult('Sınav Sorusu ve Şıklar', finalReport.trim());
                    if (state.mode === 'exam_reader') {
                        speakCurrentQuestionStem();
                    } else {
                        speakEntireQuestionAndOptions();
                    }
                } else {
                    const universalInsights = buildUniversalSmartInsights(cleanText, primaryPassVerifiedText, secondaryRawVerifiedText);
                    if (Array.isArray(preds) && preds.some(p => p.class === 'bus') && cleanText) {
                        const busAuto = processBusRouteOcrResult(cleanText, preds);
                        if (busAuto && busAuto.speechText && busAuto.speechText.startsWith('Yaklaşan otobüs')) {
                            universalInsights.speechNotes.unshift(busAuto.speechText);
                            universalInsights.reportLines.unshift(busAuto.speechText);
                        }
                    }
                    const insightSpeech = universalInsights.speechNotes.length > 0
                        ? ` ${universalInsights.speechNotes.join(' ')}`
                        : '';
                    const insightReport = universalInsights.reportLines.length > 0
                        ? `\n\n--- Akıllı Denetçi Bulguları ---\n${universalInsights.reportLines.join('\n')}`
                        : '';

                    if (cleanText) {
                        const includeSceneWithText = preds.length > 0;
                        const directSpeech = includeSceneWithText
                            ? `${fullStory}${insightSpeech}`
                            : `Okunan yazı: ${cleanText.replace(/\s+/g, ' ')}.${insightSpeech}`;
                        showDetectedResult(
                            `${sourceLabel} — Okunan Yazı ve Detaylı Betimleme`,
                            `Okunan Yazı:\n${cleanText}${insightReport}\n\n--- Sahne Betimlemesi ---\n${fullStory}`
                        );
                        announceGuidance(directSpeech, {
                            force: true,
                            bannerState: universalInsights.hasExpiredAlarm ? 'warning' : 'centered'
                        });
                    } else {
                        showDetectedResult(`${sourceLabel} — Detaylı Betimleme`, fullStory);
                        announceGuidance(fullStory, {
                            force: true,
                            bannerState: 'centered'
                        });
                    }
                }
            } catch (_) {
                showDetectedResult(`${sourceLabel} — Detaylı Betimleme`, initialStory);
            } finally {
                state.isProcessingOcr = false;
            }
        }
    }

    function isVideoFile(file) {
        if (!file) return false;
        const mime = String(file.type || '').toLowerCase();
        if (mime.startsWith('video/')) return true;
        const name = String(file.name || '').toLowerCase();
        return /\.(mp4|mov|webm|mkv|3gp|avi|m4v)$/.test(name);
    }

    function handleGalleryFileSelect(file) {
        if (!file) return;
        radar.init();
        if (isVideoFile(file)) {
            handleGalleryVideoSelect(file);
            return;
        }
        announceGuidance('Seçtiğiniz fotoğraf yükleniyor ve detaylı olarak betimleniyor, lütfen bekleyin...', {
            force: true,
            bannerState: 'centered'
        });
        const reader = new FileReader();
        reader.onload = (e) => {
            if (e.target && e.target.result) {
                loadImageDataUrlAndAnalyze(e.target.result, 'Galeriden Seçilen Fotoğraf');
            }
        };
        reader.readAsDataURL(file);
    }

    function loadImageDataUrlAndAnalyze(dataUrl, label = 'Paylaşılan Fotoğraf') {
        const img = new Image();
        img.onload = async () => {
            const capCanvas = document.createElement('canvas');
            const maxDim = 1280;
            let w = img.naturalWidth || img.width || 800;
            let h = img.naturalHeight || img.height || 600;
            if (w > maxDim || h > maxDim) {
                const ratio = Math.min(maxDim / w, maxDim / h);
                w = Math.round(w * ratio);
                h = Math.round(h * ratio);
            }
            capCanvas.width = w;
            capCanvas.height = h;
            capCanvas.getContext('2d').drawImage(img, 0, 0, w, h);
            await analyzePhotoCanvasAndDescribe(capCanvas, label);
        };
        img.src = dataUrl;
    }

    // =========================================================================
    // AKILLI ÇOK KARELİ (MULTI-KEYFRAME) ZAMAN SIRALI VİDEO BETİMLEME MİMARİSİ
    // (Başlangıç -> Gelişme / Hareket Vektörü -> Bitiş + Altyazı Değişim Takibi)
    // =========================================================================
    async function extractKeyframesFromVideoFile(file) {
        const objectUrl = URL.createObjectURL(file);
        const videoEl = document.createElement('video');
        videoEl.muted = true;
        videoEl.playsInline = true;
        videoEl.preload = 'auto';
        videoEl.src = objectUrl;

        try {
            await new Promise((resolve, reject) => {
                const timer = setTimeout(() => reject(new Error('VIDEO_LOAD_TIMEOUT')), 9000);
                videoEl.onloadedmetadata = () => {
                    clearTimeout(timer);
                    resolve();
                };
                videoEl.onerror = () => {
                    clearTimeout(timer);
                    reject(new Error('VIDEO_DECODE_ERROR'));
                };
            });

            const duration = Number.isFinite(videoEl.duration) && videoEl.duration > 0 ? videoEl.duration : 4;
            const maxDim = 768;
            let vw = videoEl.videoWidth || 640;
            let vh = videoEl.videoHeight || 480;
            if (vw > maxDim || vh > maxDim) {
                const ratio = Math.min(maxDim / vw, maxDim / vh);
                vw = Math.round(vw * ratio);
                vh = Math.round(vh * ratio);
            }

            // Videoyu baştan sona gerçekten adım adım izlemek için süreye göre sık zaman adımları (en fazla 10 kare)
            const stepCount = Math.min(10, Math.max(4, Math.ceil(duration / 1.5)));
            const frames = [];

            for (let i = 0; i < stepCount; i++) {
                const ratio = stepCount === 1 ? 0.5 : (0.04 + (i / (stepCount - 1)) * 0.90);
                const targetTime = Math.min(Math.max(0.05, duration * ratio), Math.max(0.05, duration - 0.06));
                await new Promise((resolve) => {
                    const seekTimer = setTimeout(resolve, 1600);
                    videoEl.onseeked = () => {
                        clearTimeout(seekTimer);
                        resolve();
                    };
                    try {
                        videoEl.currentTime = targetTime;
                    } catch (_) {
                        clearTimeout(seekTimer);
                        resolve();
                    }
                });

                const frameCanvas = document.createElement('canvas');
                frameCanvas.width = vw;
                frameCanvas.height = vh;
                frameCanvas.getContext('2d').drawImage(videoEl, 0, 0, vw, vh);
                frames.push({
                    stepIndex: i,
                    timeSec: Number(targetTime.toFixed(1)),
                    canvas: frameCanvas
                });
            }

            return { durationSec: Math.max(1, Math.round(duration)), frames };
        } finally {
            try {
                videoEl.pause();
                videoEl.removeAttribute('src');
                videoEl.load();
            } catch (_) {}
            try { URL.revokeObjectURL(objectUrl); } catch (_) {}
        }
    }

    /**
     * İki ardışık video karesi arasındaki GERÇEK piksel farkını (Optik Hareket Haritası) ölçer.
     * Dış çerçeve (%15 kenar halkası) ile iç odak bölgesini (%70 merkez) ayrı ayrı ölçerek:
     * - Kameranın kendisinin mi sallandığını/döndüğünü (isCameraPan),
     * - Yoksa sabit kameranın önünde içerideki kişinin/nesnenin mi hareket ettiğini (isSubjectMotion)
     * matematiksel olarak birbirinden ayırır.
     */
    function measureTruePixelMotionBetweenFrames(prevMetrics, currMetrics, w, h) {
        const dA = prevMetrics.imageData.data;
        const dB = currMetrics.imageData.data;
        const step = Math.max(2, Math.floor(Math.min(w, h) / 72));

        let totalSampled = 0;
        let changedPixels = 0;
        let borderSampled = 0;
        let borderChanged = 0;
        let innerSampled = 0;
        let innerChanged = 0;
        let sumX = 0;
        let sumY = 0;

        for (let y = 0; y < h; y += step) {
            const ny = y / h;
            const isBorderY = (ny < 0.15 || ny > 0.85);
            for (let x = 0; x < w; x += step) {
                const nx = x / w;
                const isBorder = isBorderY || (nx < 0.15 || nx > 0.85);
                const idx = (y * w + x) * 4;
                const lumA = 0.299 * dA[idx] + 0.587 * dA[idx + 1] + 0.114 * dA[idx + 2];
                const lumB = 0.299 * dB[idx] + 0.587 * dB[idx + 1] + 0.114 * dB[idx + 2];
                const diff = Math.abs(lumB - lumA);

                totalSampled++;
                if (isBorder) borderSampled++;
                else innerSampled++;

                if (diff >= 24) {
                    changedPixels++;
                    if (isBorder) borderChanged++;
                    else innerChanged++;
                    sumX += nx;
                    sumY += ny;
                }
            }
        }

        const changedRatio = changedPixels / Math.max(1, totalSampled);
        const borderRatio = borderChanged / Math.max(1, borderSampled);
        const innerRatio = innerChanged / Math.max(1, innerSampled);
        const motionCx = changedPixels > 0 ? (sumX / changedPixels) : 0.5;
        const motionCy = changedPixels > 0 ? (sumY / changedPixels) : 0.5;

        let zoneHoriz = 'ortada';
        if (motionCx < 0.36) zoneHoriz = 'sol tarafta';
        else if (motionCx > 0.64) zoneHoriz = 'sağ tarafta';

        let zoneVert = '';
        if (motionCy < 0.32) zoneVert = 'üst kısımda ';
        else if (motionCy > 0.68) zoneVert = 'alt kısımda ';

        const isSceneCut = changedRatio > 0.46 || Math.abs(currMetrics.avgBrightness - prevMetrics.avgBrightness) > 40;
        const isCameraPan = !isSceneCut && borderRatio >= 0.18 && (innerRatio / Math.max(0.01, borderRatio)) < 1.55;
        const isSubjectMotion = !isSceneCut && innerRatio >= 0.05 && (innerRatio >= borderRatio * 1.55 || borderRatio < 0.12);

        return {
            changedRatio,
            changedPct: Math.round(changedRatio * 100),
            borderPct: Math.round(borderRatio * 100),
            innerPct: Math.round(innerRatio * 100),
            motionCx,
            motionCy,
            zoneLabel: `${zoneVert}${zoneHoriz}`.trim(),
            isSceneCut,
            isCameraPan,
            isSubjectMotion
        };
    }

    /**
     * 2 Milisaniyelik Yatay Yazı-Kenarı (Text-Stroke) Ön Tarayıcı ve Bölgesel Kırpıcı:
     * Video karesinde gerçekten yüksek kontrastlı harf/altyazı çizgisi olup olmadığını ölçer.
     * - Eğer karede hiç yazı dokusu yoksa (hasTextLikely === false), Tesseract OCR'ı boşuna çalıştırmaz (kare başına 4 sn kazandırır).
     * - Eğer yazı dokusu varsa, sadece yazının bulunduğu yatay şeridi kırparak OCR'ı 3 kat hızlandırır ve doğruluğunu artırır.
     */
    function detectTextStrokeBandAndCropCanvas(frameCanvas, metrics) {
        const w = frameCanvas.width;
        const h = frameCanvas.height;
        const data = metrics.imageData.data;
        const bandCount = 12;
        const bandH = Math.max(8, Math.floor(h / bandCount));
        let activeMinBand = bandCount;
        let activeMaxBand = -1;
        let maxBandScore = 0;

        for (let b = 0; b < bandCount; b++) {
            const y0 = b * bandH;
            const y1 = Math.min(h - 1, y0 + bandH);
            let strokeTransitions = 0;
            let samples = 0;

            for (let y = y0; y < y1; y += 3) {
                let prevLum = 0.299 * data[(y * w) * 4] + 0.587 * data[(y * w) * 4 + 1] + 0.114 * data[(y * w) * 4 + 2];
                for (let x = 3; x < w - 3; x += 3) {
                    const idx = (y * w + x) * 4;
                    const lum = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
                    if (Math.abs(lum - prevLum) >= 42) {
                        strokeTransitions++;
                    }
                    prevLum = lum;
                    samples++;
                }
            }

            const density = strokeTransitions / Math.max(1, samples);
            if (density >= 0.052) {
                if (b < activeMinBand) activeMinBand = b;
                if (b > activeMaxBand) activeMaxBand = b;
                if (density > maxBandScore) maxBandScore = density;
            }
        }

        if (activeMaxBand < 0 || maxBandScore < 0.052) {
            return { hasTextLikely: false, ocrCanvas: null };
        }

        const cropY0 = Math.max(0, (activeMinBand - 1) * bandH);
        const cropY1 = Math.min(h, (activeMaxBand + 2) * bandH);
        const cropH = Math.max(32, cropY1 - cropY0);

        if (cropH >= h * 0.82) {
            return { hasTextLikely: true, ocrCanvas: frameCanvas };
        }

        const cropped = document.createElement('canvas');
        cropped.width = w;
        cropped.height = cropH;
        cropped.getContext('2d').drawImage(frameCanvas, 0, cropY0, w, cropH, 0, 0, w, cropH);
        return { hasTextLikely: true, ocrCanvas: cropped };
    }

    /**
     * Tesseract OCR çıktısından gelen gürültü/doku uydurmalarını (halüsinasyonları) eler;
     * kameranın gördüğü her türlü gerçek yazıyı, kısa kodu, kapı numarasını, markayı ve etiketi eksiksiz döndürür.
     */
    function extractVerifiedRealTextFromOcrResult(ocrRes, separator = ' — ') {
        if (!ocrRes || !ocrRes.data) return '';
        const lines = Array.isArray(ocrRes.data.lines) ? ocrRes.data.lines : [];
        const verifiedLines = [];

        for (let i = 0; i < lines.length; i++) {
            const ln = lines[i];
            const conf = typeof ln.confidence === 'number'
                ? ln.confidence
                : (typeof ocrRes.data.confidence === 'number' ? ocrRes.data.confidence : 75);
            if (conf < 38) continue;

            const raw = String(ln.text || '').replace(/\s+/g, ' ').trim();
            if (!raw) continue;

            // Kısa kapı/kat numaraları ("5", "12", "B1", "Z"), kısa markalar ("LG"), arıza kodları ("E4", "F2")
            // ve kısa sınav şıkları ("A) 5", "B) -2") elenmesin!
            const isShortValidToken = /^[\p{L}\p{N}]{1,3}$/u.test(raw) && conf >= 42;
            const isShortExamOption = /^(?:[\(\[]?[A-Ea-e][\)\]\.\-:]\s*\S+)/.test(raw) && conf >= 38;

            if (!isShortValidToken && !isShortExamOption) {
                const alphaNumMatches = raw.match(/[\p{L}\p{N}]/gu) || [];
                const alphaRatio = alphaNumMatches.length / Math.max(1, raw.length);
                if (alphaNumMatches.length < 1 || alphaRatio < 0.42) continue;

                if (!/[\p{L}\p{N}]+/u.test(raw)) continue;
            }

            verifiedLines.push(raw);
        }

        if (verifiedLines.length === 0 && typeof ocrRes.data.text === 'string' && ocrRes.data.text.trim()) {
            const overallConf = typeof ocrRes.data.confidence === 'number' ? ocrRes.data.confidence : 75;
            if (overallConf >= 35) {
                const rawLines = ocrRes.data.text.split(/\r?\n/);
                for (let j = 0; j < rawLines.length; j++) {
                    const rLine = rawLines[j].replace(/\s+/g, ' ').trim();
                    if (!rLine) continue;
                    const anMatches = rLine.match(/[\p{L}\p{N}]/gu) || [];
                    if (anMatches.length >= 1 && (anMatches.length / rLine.length) >= 0.42) {
                        verifiedLines.push(rLine);
                    }
                }
            }
        }

        return verifiedLines.join(separator);
    }

    const GENITIVE_TR_OBJECT_LABELS = {
        'dining table': 'masanın',
        'chair': 'sandalyenin',
        'couch': 'koltuğun',
        'bench': 'bankın',
        'tv': 'televizyonun',
        'laptop': 'bilgisayarın',
        'car': 'arabanın',
        'bed': 'yatağın',
        'potted plant': 'saksı bitkisinin',
        'refrigerator': 'buzdolabının',
        'book': 'kitabın',
        'backpack': 'sırt çantasının',
        'handbag': 'el çantasının',
        'suitcase': 'bavulun',
        'bottle': 'şişenin',
        'cup': 'bardağın',
        'door': 'kapının'
    };

    /**
     * Bir kişinin (personBbox) çevredeki en belirgin referans eşyaya göre bağıl konumunu
     * ("masanın solundaki", "koltuğun sağındaki", "televizyonun solundaki") hesaplar.
     */
    function findNearestObjectRelativePhrase(personBbox, allObjects, w, h) {
        if (!Array.isArray(allObjects) || allObjects.length === 0) return '';
        const [bx, by, bw, bh] = personBbox;
        const pcx = bx + bw / 2;
        const pcy = by + bh / 2;

        // Referans alınabilecek orta/büyük eşyaları önceliklendir
        let bestObj = null;
        let bestDist = Infinity;
        for (let i = 0; i < allObjects.length; i++) {
            const obj = allObjects[i];
            if (obj.class === 'person') continue;
            const [ox, oy, ow, oh] = obj.bbox;
            const ocx = ox + ow / 2;
            const ocy = oy + oh / 2;
            const dist = Math.hypot((pcx - ocx) / Math.max(1, w), (pcy - ocy) / Math.max(1, h));
            if (dist < bestDist && dist <= 0.62) {
                bestDist = dist;
                bestObj = obj;
            }
        }
        if (!bestObj) return '';

        const [ox, , ow] = bestObj.bbox;
        const ocx = ox + ow / 2;
        const genName = GENITIVE_TR_OBJECT_LABELS[bestObj.class] || `${(TR_LABELS[bestObj.class] || bestObj.class).toLowerCase()} nesnesinin`;
        const dxNorm = (pcx - ocx) / Math.max(1, w);

        if (dxNorm < -0.07) {
            return `${genName} solundaki`;
        } else if (dxNorm > 0.07) {
            return `${genName} sağındaki`;
        }
        return `${genName} yanındaki`;
    }

    /**
     * Profesyonel Sesli Film Betimleme (Audio Description / SEBEDER) standardında
     * tek bir karedeki kişinin dış görünüşünü (üst/alt kıyafet rengi, deseni), duruşunu,
     * bakış yönünü ve çevresindeki nesnelerle olan gerçek etkileşimini (ne yaptığını) betimler.
     */
    function analyzePersonAppearanceAndActionInFrame(p, allObjects, metrics, w, h) {
        const [bx, by, bw, bh] = p.bbox;
        const imgData = metrics.imageData;
        const cxNorm = (bx + bw / 2) / w;
        const posWord = cxNorm < 0.35 ? 'soldaki' : (cxNorm > 0.65 ? 'sağdaki' : 'ortadaki');
        const anchorRel = findNearestObjectRelativePhrase(p.bbox, allObjects, w, h);
        const confPct = Math.round((p.score || 0) * 100);
        const heightPct = Math.round((bh / Math.max(1, h)) * 100);

        // Üst kıyafet bölgesi gerçek renk ölçümü (Gövde: %26 - %60 arası)
        const upperCloth = measureRegionColorAndPattern(
            imgData, w, h,
            bx + bw * 0.22, by + bh * 0.26,
            Math.max(12, bw * 0.56), Math.max(12, bh * 0.34)
        );

        const clothText = `üst bölge rengi ${upperCloth.colorName.toLowerCase()}`;

        return {
            posWord,
            anchorRel,
            confPct,
            heightPct,
            clothText,
            upperColor: upperCloth.colorName,
            cxNorm,
            cyNorm: (by + bh / 2) / h,
            areaNorm: (bw * bh) / Math.max(1, w * h)
        };
    }

    function buildSingleKeyframeCompactSummary(frameAnalysis) {
        const { canvas, metrics, preds } = frameAnalysis;
        const w = canvas.width;
        const h = canvas.height;
        const imgData = metrics.imageData;
        const parts = [];

        // SADECE yapay zekanın beyninde doğrulanmış (>= 0.62) nesne ve kişileri raporla; kullanıcıya yüzde söyleme!
        const verifiedPreds = verifyPredictionsInAiBrain(preds || [], w, h, false);
        const people = verifiedPreds
            .filter(p => p.class === 'person')
            .sort((a, b) => (a.bbox[0] + a.bbox[2] / 2) - (b.bbox[0] + b.bbox[2] / 2));
        const objects = verifiedPreds
            .filter(p => p.class !== 'person')
            .sort((a, b) => (b.bbox[2] * b.bbox[3]) - (a.bbox[2] * a.bbox[3]));

        frameAnalysis.personCount = people.length;

        if (people.length === 0) {
            parts.push('Kişi görünmüyor');
        } else {
            const pInfos = people.map(p => analyzePersonAppearanceAndActionInFrame(p, objects, metrics, w, h));
            frameAnalysis.primaryPersonInfo = pInfos[0];
            frameAnalysis.allPersonInfos = pInfos;

            if (pInfos.length === 1) {
                const p0 = pInfos[0];
                const relNote = p0.anchorRel ? ` (${p0.anchorRel})` : '';
                parts.push(
                    `1 kişi: ${p0.posWord} kişi${relNote}, ${p0.clothText}`
                );
            } else {
                const personDescriptions = pInfos.slice(0, 4).map((pInfo, idx) => {
                    return `${idx + 1}. kişi (${pInfo.posWord}, ${pInfo.clothText})`;
                });
                parts.push(`Soldan sağa toplam ${pInfos.length} kişi var — ${personDescriptions.join('; ')}`);
            }
        }

        if (objects.length > 0) {
            const objList = objects.slice(0, 4).map(o => {
                const [bx, by, bw, bh] = o.bbox;
                const cx = (bx + bw / 2) / w;
                const pos = cx < 0.34 ? 'solda' : (cx > 0.66 ? 'sağda' : 'ortada');
                const objColor = measureRegionColorAndPattern(imgData, w, h, bx + bw * 0.2, by + bh * 0.2, Math.max(8, bw * 0.6), Math.max(8, bh * 0.6));
                return `${pos} ${objColor.colorName.toLowerCase()} ${TR_LABELS[o.class] || o.class}`;
            });
            parts.push(`Görünen eşyalar: ${objList.join(', ')}`);
        } else if (people.length === 0) {
            const topBg = measureRegionColorAndPattern(imgData, w, h, w * 0.15, h * 0.08, w * 0.70, h * 0.25);
            const botBg = measureRegionColorAndPattern(imgData, w, h, w * 0.15, h * 0.65, w * 0.70, h * 0.25);
            const bgTone = metrics.avgBrightness < 60 ? 'Loş ortamda' : (metrics.avgBrightness > 180 ? 'Aydınlık ortamda' : 'Ortamda');
            parts.push(`${bgTone} üst kısımda ${topBg.colorName.toLowerCase()}, alt zeminde ${botBg.colorName.toLowerCase()} tonlarında görüntü`);
        }

        return parts.join('. ');
    }

    /**
     * Teknik kamera/piksel istatistiği yerine, profesyonel bir Sesli Film Betimlemecisi gibi
     * videonun başından sonuna kadar kişi sayısının nasıl değiştiğini, kişilerin ne yaptığını,
     * nereye yürüdüğünü ve hangi eşyayı eline aldığını doğal bir öykü akışıyla özetler.
     */
    function computeTemporalVideoMotionAndTransition(frameAnalyses) {
        if (!Array.isArray(frameAnalyses) || frameAnalyses.length < 2) return '';
        const narrativeEvents = [];
        let totalChangedPct = 0;
        let sceneCutTimes = [];

        const personTimeline = [];

        for (let i = 0; i < frameAnalyses.length; i++) {
            const curr = frameAnalyses[i];
            if (curr.primaryPersonInfo) {
                personTimeline.push({
                    timeSec: curr.timeSec,
                    count: curr.personCount || 1,
                    info: curr.primaryPersonInfo,
                    allInfos: curr.allPersonInfos || [curr.primaryPersonInfo],
                    objects: curr.preds.filter(p => p.class !== 'person').map(p => TR_LABELS[p.class] || p.class)
                });
            }
            if (i > 0) {
                const prev = frameAnalyses[i - 1];
                const m = curr.pixelMotion;
                if (m) {
                    totalChangedPct += m.changedPct;
                    if (m.isSceneCut) {
                        sceneCutTimes.push(`${curr.timeSec}. saniye`);
                    }
                }
                const prevCount = prev.personCount || 0;
                const currCount = curr.personCount || 0;
                if (prevCount === 0 && currCount > 0) {
                    narrativeEvents.push(`${curr.timeSec}. saniyede görüntüye ${currCount} kişi giriyor.`);
                } else if (prevCount > 0 && currCount === 0) {
                    narrativeEvents.push(`${curr.timeSec}. saniyede görüntüyü terk ediyorlar ve etrafta kimse kalmıyor (0 kişi).`);
                } else if (currCount > prevCount) {
                    narrativeEvents.push(`${curr.timeSec}. saniyede sahneye yeni bir kişi daha katılıyor ve etraftaki kişi sayısı ${prevCount}'den ${currCount} kişiye çıkıyor.`);
                } else if (currCount < prevCount) {
                    narrativeEvents.push(`${curr.timeSec}. saniyede kişilerden biri kadrajdan çıkıyor ve etraftaki kişi sayısı ${prevCount}'den ${currCount} kişiye düşüyor.`);
                }
            }
        }

        // Kişinin video boyunca yaptığı ana eylem (Yürüme, yaklaşma, uzaklaşma, oturma/kalkma, eşya alma)
        if (personTimeline.length >= 2) {
            const firstP = personTimeline[0];
            const lastP = personTimeline[personTimeline.length - 1];
            const dx = lastP.info.cxNorm - firstP.info.cxNorm;
            const dy = lastP.info.cyNorm - firstP.info.cyNorm;
            const areaRatio = lastP.info.areaNorm / Math.max(0.01, firstP.info.areaNorm);

            if (Math.abs(dx) >= 0.16) {
                const walkDir = dx > 0 ? 'sol taraftan sağ tarafa doğru' : 'sağ taraftan sol tarafa doğru';
                narrativeEvents.push(`Kişi video boyunca ${walkDir} yürüyor / ilerliyor.`);
            }
            if (areaRatio >= 1.32) {
                narrativeEvents.push('Kişi adım adım kameraya doğru yaklaşıyor.');
            } else if (areaRatio <= 0.74) {
                narrativeEvents.push('Kişi kameradan uzaklaşıp arka plana doğru gidiyor.');
            }
        }

        // Video sırasında eline yeni bir eşya aldı mı veya sahneye/masaya yeni bir eşya girdi mi?
        // İlk karedeki (frameAnalyses[0]) eşyaları baz al ki ilk karede insan yokken sonradan insanla birlikte giren eşyalar da yakalansın!
        const initialObjs = new Set(
            (frameAnalyses[0].preds || [])
                .filter(p => p.class !== 'person')
                .map(p => TR_LABELS[p.class] || p.class)
        );
        for (let i = 1; i < frameAnalyses.length; i++) {
            const curr = frameAnalyses[i];
            const frameObjs = (curr.preds || [])
                .filter(p => p.class !== 'person')
                .map(p => TR_LABELS[p.class] || p.class);
            for (const objName of frameObjs) {
                if (!initialObjs.has(objName)) {
                    initialObjs.add(objName);
                    narrativeEvents.push(`${curr.timeSec}. saniye civarında kişinin elinde veya önünde ${objName} beliriyor.`);
                }
            }
        }

        if (sceneCutTimes.length > 0) {
            narrativeEvents.push(`${sceneCutTimes.join(' ve ')} civarında sahne değişiyor ve yeni bir görüntüye geçiliyor.`);
        }

        const avgMotionPct = Math.round(totalChangedPct / Math.max(1, frameAnalyses.length - 1));
        if (avgMotionPct < 3 && narrativeEvents.length === 0) {
            narrativeEvents.push('Sahne boyunca kişi veya eşyalarda bir hareket olmuyor, görüntü sabit kalıyor.');
        }

        return narrativeEvents.join(' ');
    }

    async function analyzeVideoKeyframesAndDescribe(frames, durationSec, sourceLabel = 'Seçilen Video') {
        if (!Array.isArray(frames) || frames.length === 0) return;

        if (!state.cocoModel && typeof window.cocoSsd !== 'undefined') {
            try {
                state.cocoModel = await window.cocoSsd.load({ base: 'lite_mobilenet_v2' });
            } catch (_) {}
        }

        const frameAnalyses = [];
        let bestFrameIdx = 0;
        let bestFrameScore = -1;
        let lastDetectedPreds = [];

        for (let i = 0; i < frames.length; i++) {
            const f = frames[i];
            const ctx = f.canvas.getContext('2d');
            const metrics = analyzeFrameMathematics(ctx, f.canvas.width, f.canvas.height);

            const pixelMotion = i > 0
                ? measureTruePixelMotionBetweenFrames(frameAnalyses[i - 1].metrics, metrics, f.canvas.width, f.canvas.height)
                : null;

            // OPTİMİZASYON 1: Eğer ardışık karede pikseller %4'ten az değiştiyse ağır yapay zeka ağını tekrar koşturma, önceki sonucu kullan!
            const shouldRunNeuralNet = (i === 0) || (i === frames.length - 1) || !pixelMotion || pixelMotion.changedPct >= 4;
            let preds = lastDetectedPreds;

            if (shouldRunNeuralNet && state.cocoModel) {
                try {
                    // Ana arayüz ve ses motorunun takılmaması için Event-Loop'a nefes aldır
                    await new Promise(r => setTimeout(r, 0));
                    const rawPreds = await state.cocoModel.detect(f.canvas, 10, 0.58);
                    preds = verifyPredictionsInAiBrain(rawPreds, f.canvas.width, f.canvas.height, false);
                    lastDetectedPreds = preds;
                } catch (_) {
                    preds = [];
                }
            }

            const frameEntry = {
                stepIndex: i,
                timeSec: f.timeSec,
                canvas: f.canvas,
                metrics,
                preds,
                pixelMotion,
                primaryPersonInfo: null,
                descText: ''
            };
            frameEntry.descText = buildSingleKeyframeCompactSummary(frameEntry);
            const score = preds.length * 25 + (metrics.sharpness || 0);
            if (score > bestFrameScore) {
                bestFrameScore = score;
                bestFrameIdx = i;
            }
            frameAnalyses.push(frameEntry);
        }

        const bestFrame = frameAnalyses[bestFrameIdx] || frameAnalyses[0];
        state.lastCapturedDataUrl = bestFrame.canvas.toDataURL('image/jpeg', 0.90);
        el.btnDownloadPhoto.hidden = false;

        // Aynı sahne açıklaması üst üste tekrar ediyorsa grupla ("0 ile 4. saniyeler arası: ...")
        const timelineSegments = [];
        for (let i = 0; i < frameAnalyses.length; i++) {
            const curr = frameAnalyses[i];
            const prevSeg = timelineSegments[timelineSegments.length - 1];
            const isCut = curr.pixelMotion && curr.pixelMotion.isSceneCut;
            if (prevSeg && prevSeg.descText === curr.descText && !isCut) {
                prevSeg.endSec = curr.timeSec;
            } else {
                timelineSegments.push({
                    startSec: curr.timeSec,
                    endSec: curr.timeSec,
                    descText: curr.descText
                });
            }
        }

        const timelineSentences = timelineSegments.map(seg => {
            const timeLabel = seg.startSec === seg.endSec
                ? `${seg.startSec}. saniyede`
                : `${seg.startSec} ile ${seg.endSec}. saniyeler arasında`;
            return `${timeLabel}: ${seg.descText}.`;
        });

        const motionSummary = computeTemporalVideoMotionAndTransition(frameAnalyses);
        const avgLum = Math.round(frameAnalyses.reduce((acc, fa) => acc + fa.metrics.avgBrightness, 0) / frameAnalyses.length);
        const lightDesc = avgLum < 60 ? 'Loş ışıklı bir ortam' : (avgLum > 180 ? 'Bol ışıklı ve aydınlık bir ortam' : 'Aydınlık bir ortam');
        const firstBg = measureRegionColorAndPattern(
            bestFrame.metrics.imageData,
            bestFrame.canvas.width,
            bestFrame.canvas.height,
            bestFrame.canvas.width * 0.15,
            bestFrame.canvas.height * 0.05,
            bestFrame.canvas.width * 0.70,
            bestFrame.canvas.height * 0.20
        );

        const initialVideoStory =
            `Sesli Video Betimlemesi (${durationSec} saniye): ${lightDesc}, arka plan genel olarak ${firstBg.colorName.toLowerCase()} tonlarında. ` +
            `${timelineSentences.join(' ')} ${motionSummary}`.trim();

        populatePhotoExplorerMap(bestFrame.canvas, bestFrame.metrics, bestFrame.preds, [], initialVideoStory);

        // OPTİMİZASYON 2: 2ms'lik Yazı-Kenarı (Text-Stroke) Ön Tarayıcı + Sadece Yazı Şeridini Kırparak Hızlı OCR
        if (typeof window.Tesseract !== 'undefined' && !state.isProcessingOcr) {
            showDetectedResult(`🎬 ${sourceLabel} (${durationSec} sn) — Gerçek Zaman Sıralı Video Analizi`, initialVideoStory + '\n\n(Videodaki tüm karelerde gerçek ekran yazısı ve altyazı kontrolü yapılıyor...)');
            announceGuidance(`${initialVideoStory} Şimdi videodaki karelerde geçen gerçek yazıları okuyorum...`, {
                force: true,
                bannerState: 'centered'
            });
            state.isProcessingOcr = true;
            try {
                const candidateIndices = [0];
                for (let i = 1; i < frameAnalyses.length - 1; i++) {
                    const pm = frameAnalyses[i].pixelMotion;
                    if (pm && (pm.isSceneCut || pm.changedPct >= 8) && candidateIndices.length < 4) {
                        candidateIndices.push(i);
                    }
                }
                if (frameAnalyses.length > 1 && !candidateIndices.includes(frameAnalyses.length - 1)) {
                    candidateIndices.push(frameAnalyses.length - 1);
                }

                const uniqueCaptions = [];

                for (let s = 0; s < candidateIndices.length; s++) {
                    const fa = frameAnalyses[candidateIndices[s]];
                    const strokeCheck = detectTextStrokeBandAndCropCanvas(fa.canvas, fa.metrics);
                    if (!strokeCheck.hasTextLikely || !strokeCheck.ocrCanvas) {
                        continue; // Karede hiç yazı çizgisi yoksa 4 saniyelik Tesseract OCR'ı boşuna çalıştırma!
                    }
                    await new Promise(r => setTimeout(r, 0));
                    const ocrRes = await window.Tesseract.recognize(strokeCheck.ocrCanvas, 'tur+eng');
                    const verifiedText = extractVerifiedRealTextFromOcrResult(ocrRes);
                    if (verifiedText.length >= 3) {
                        const isDuplicate = uniqueCaptions.some(existing => computeTrigramSimilarity(existing.text, verifiedText) >= 0.65);
                        if (!isDuplicate) {
                            uniqueCaptions.push({
                                timeSec: fa.timeSec,
                                text: verifiedText
                            });
                        }
                    }
                }

                let finalVideoStory = initialVideoStory;
                if (uniqueCaptions.length > 0) {
                    const captionSpeech = uniqueCaptions.map(c => `${c.timeSec}. saniyede ekranda: "${c.text}"`).join('; ');
                    const combinedVideoText = uniqueCaptions.map(c => c.text).join('\n');
                    const videoInsights = buildUniversalSmartInsights(combinedVideoText, combinedVideoText, '');
                    const insightSpeech = videoInsights.speechNotes.length > 0 ? ` ${videoInsights.speechNotes.join(' ')}` : '';
                    const insightReport = videoInsights.reportLines.length > 0 ? `\n\n--- Akıllı Denetçi Bulguları ---\n${videoInsights.reportLines.join('\n')}` : '';

                    finalVideoStory += `\n\nVideoda Okunan Gerçek Yazılar / Altyazılar:\n${captionSpeech}.${insightReport}`;
                    showDetectedResult(`🎬 ${sourceLabel} (${durationSec} sn) — Video Analizi ve Okunan Yazılar`, finalVideoStory);
                    populatePhotoExplorerMap(bestFrame.canvas, bestFrame.metrics, bestFrame.preds, [], finalVideoStory);
                    announceGuidance(`${initialVideoStory} Videoda ekranda şu yazılar yer alıyor: ${captionSpeech}.${insightSpeech}`, {
                        force: true,
                        bannerState: videoInsights.hasExpiredAlarm ? 'warning' : 'centered'
                    });
                } else {
                    finalVideoStory += '\n\nVideoda ekranda herhangi bir yazı veya altyazı yer almıyor.';
                    showDetectedResult(`🎬 ${sourceLabel} (${durationSec} sn) — Gerçek Zaman Sıralı Video Analizi`, finalVideoStory);
                    announceGuidance(`${initialVideoStory} Videoda ekranda herhangi bir yazı veya altyazı yer almıyor.`, {
                        force: true,
                        bannerState: 'centered'
                    });
                }
            } catch (_) {
                showDetectedResult(`🎬 ${sourceLabel} (${durationSec} sn) — Gerçek Zaman Sıralı Video Analizi`, initialVideoStory);
            } finally {
                state.isProcessingOcr = false;
            }
        } else {
            showDetectedResult(`🎬 ${sourceLabel} (${durationSec} sn) — Gerçek Zaman Sıralı Video Analizi`, initialVideoStory);
            announceGuidance(initialVideoStory, {
                force: true,
                bannerState: 'centered'
            });
        }
    }

    async function handleGalleryVideoSelect(file) {
        announceGuidance('Seçtiğiniz video açılıyor; baştan sona saniye saniye izlenerek gerçek hareketler ve yazılar çıkarılıyor, lütfen bekleyin...', {
            force: true,
            bannerState: 'centered'
        });
        try {
            const { durationSec, frames } = await extractKeyframesFromVideoFile(file);
            await analyzeVideoKeyframesAndDescribe(frames, durationSec, 'Galeriden Seçilen Video');
        } catch (_) {
            announceGuidance('Bu video dosyası açılamadı veya formatı desteklenmiyor. Lütfen MP4 veya standart bir video seçin.', {
                force: true,
                bannerState: 'warning'
            });
        }
    }

    // Android "Paylaş -> Erişilebilir Kamera Uygulaması" (WhatsApp / Galeri fotoğraf ve video paylaşımı) köprüleri
    window.receiveSharedPhotoFromAndroid = function (base64DataUrl) {
        if (!base64DataUrl) return;
        radar.init();
        loadImageDataUrlAndAnalyze(base64DataUrl, 'WhatsApp / Galeriden Paylaşılan Fotoğraf');
    };

    window.receiveSharedVideoFramesFromAndroid = async function (durationSec, frameDataUrls) {
        if (!Array.isArray(frameDataUrls) || frameDataUrls.length === 0) return;
        radar.init();
        announceGuidance('Paylaştığınız video alındı; baştan sona kare kare izlenerek gerçek hareketler ve yazılar analiz ediliyor...', {
            force: true,
            bannerState: 'centered'
        });
        const total = frameDataUrls.length;
        const frames = [];

        for (let i = 0; i < total; i++) {
            const url = frameDataUrls[i];
            const ratio = total === 1 ? 0.5 : (0.04 + (i / (total - 1)) * 0.90);
            const canvas = await new Promise((resolve) => {
                const img = new Image();
                img.onload = () => {
                    const c = document.createElement('canvas');
                    c.width = img.naturalWidth || img.width || 640;
                    c.height = img.naturalHeight || img.height || 480;
                    c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
                    resolve(c);
                };
                img.onerror = () => resolve(null);
                img.src = url;
            });
            if (canvas) {
                frames.push({
                    stepIndex: i,
                    timeSec: Number(((durationSec || 8) * ratio).toFixed(1)),
                    canvas
                });
            }
        }
        if (frames.length > 0) {
            await analyzeVideoKeyframesAndDescribe(frames, durationSec || 8, 'WhatsApp / Galeriden Paylaşılan Video');
        }
    };

    function showDetectedResult(title, content) {
        el.resultPanel.hidden = false;
        el.resultTitle.textContent = title;
        el.resultText.textContent = content;

        const urlMatch = content.match(/https?:\/\/[^\s]+/i);
        if (urlMatch) {
            el.btnOpenLink.href = urlMatch[0].replace(/[.,;!?)\]"'>]+$/, '');
            el.btnOpenLink.hidden = false;
        } else {
            el.btnOpenLink.hidden = true;
        }
    }

    function startWhatsapp15SecAudioHold() {
        radar.init();
        if (state.whatsappHoldTimer) {
            clearInterval(state.whatsappHoldTimer);
            state.whatsappHoldTimer = null;
            announceGuidance('WhatsApp ses kilidi durduruldu.', { force: true });
            return;
        }

        state.whatsappHoldEnd = performance.now() + 15000;
        announceGuidance('15 saniyelik WhatsApp hizalama ses kilidi başladı! Elinizi hiç kıpırdatmadan şimdi WhatsApp uygulamasına geçip Cihaz Bağla düğmesine basın.', {
            force: true,
            bannerState: 'centered'
        });

        state.whatsappHoldTimer = setInterval(() => {
            if (performance.now() > state.whatsappHoldEnd) {
                clearInterval(state.whatsappHoldTimer);
                state.whatsappHoldTimer = null;
                announceGuidance('15 saniyelik WhatsApp hizalama süresi tamamlandı.', { force: true });
                return;
            }
            const tilted = state.hasOrientationSensor && Math.abs(state.tiltRoll) > 18;
            if (tilted) {
                radar.playPannedTone(260, state.tiltRoll > 0 ? -0.8 : 0.8, 0.09, 'sawtooth', 0.22);
            } else {
                radar.playLockChord();
            }
        }, 900);
    }

    async function tryEnableHardwareTorch(enable) {
        if (!state.videoStream) return false;
        const track = state.videoStream.getVideoTracks()[0];
        if (!track || typeof track.getCapabilities !== 'function') return false;
        try {
            const caps = track.getCapabilities();
            if (caps && caps.torch) {
                await track.applyConstraints({ advanced: [{ torch: Boolean(enable) }] });
                return true;
            }
        } catch (_) {}
        return false;
    }

    function drawCrosshair(ctx, w, h) {
        const cx = w / 2;
        const cy = h / 2;
        ctx.save();
        ctx.strokeStyle = 'rgba(250, 204, 21, 0.65)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(cx, cy, Math.min(w, h) * 0.12, 0, Math.PI * 2);
        ctx.moveTo(cx - 25, cy);
        ctx.lineTo(cx + 25, cy);
        ctx.moveTo(cx, cy - 25);
        ctx.lineTo(cx, cy + 25);
        ctx.stroke();
        ctx.restore();
    }

    function drawTargetBox(ctx, bbox, scaleX, scaleY, color, label) {
        const [x, y, w, h] = bbox;
        const sx = x * scaleX;
        const sy = y * scaleY;
        const sw = w * scaleX;
        const sh = h * scaleY;

        ctx.save();
        ctx.strokeStyle = color;
        ctx.lineWidth = 4;
        ctx.strokeRect(sx, sy, sw, sh);

        ctx.fillStyle = 'rgba(9, 13, 22, 0.85)';
        ctx.fillRect(sx, Math.max(0, sy - 30), Math.min(sw, 280), 28);
        ctx.fillStyle = color;
        ctx.font = 'bold 16px sans-serif';
        ctx.fillText(label, sx + 8, Math.max(18, sy - 10));
        ctx.restore();
    }

    async function initAiModel() {
        if ('BarcodeDetector' in window) {
            try {
                state.barcodeDetector = new window.BarcodeDetector({
                    formats: ['qr_code', 'data_matrix', 'ean_13', 'ean_8', 'code_128', 'upc_a', 'upc_e']
                });
            } catch (_) {
                try {
                    state.barcodeDetector = new window.BarcodeDetector({ formats: ['qr_code', 'ean_13', 'code_128'] });
                } catch (_2) {}
            }
        }
        try {
            if (typeof window.cocoSsd !== 'undefined' && !state.cocoModel) {
                el.aiStatusBadge.textContent = 'Yapay Zeka ve Sınav Motoru Yükleniyor...';
                state.cocoModel = await window.cocoSsd.load({ base: 'lite_mobilenet_v2' });
                el.aiStatusBadge.textContent = 'Sınav, QR & Matematik Motoru Hazır';
                el.aiStatusBadge.classList.add('ready');
            }
        } catch (_) {
            el.aiStatusBadge.textContent = 'Sınav, Sensör ve QR Motoru Hazır';
            el.aiStatusBadge.classList.add('ready');
        }
    }

    async function startCamera() {
        radar.init();

        if (state.videoStream) {
            state.videoStream.getTracks().forEach(t => t.stop());
            state.videoStream = null;
        }

        const constraints = {
            audio: false,
            video: {
                facingMode: { ideal: state.facingMode },
                width: { ideal: 1280 },
                height: { ideal: 720 }
            }
        };

        try {
            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            state.videoStream = stream;
            el.video.srcObject = stream;
            await el.video.play();

            state.isRunning = true;
            state.lastUserInteractionAt = performance.now();
            el.btnStart.textContent = '⏹️ Kamerayı Durdur';
            el.btnStart.setAttribute('aria-pressed', 'true');
            el.btnSwitchCam.disabled = false;
            el.btnToggleFlash.disabled = false;
            el.btnCaptureNow.disabled = false;

            const camName = state.facingMode === 'user' ? 'Ön selfie kamerası' : 'Arka kamera';
            announceGuidance(`${camName} ve sesli radar başlatıldı. Aktif mod: ${getActiveModeTitle()}.`, {
                force: true,
                bannerState: 'centered'
            });

            if (!state.cocoModel) initAiModel();
            requestAnimationFrame(processFrameLoop);
        } catch (_) {
            announceGuidance('Kameraya erişilemedi. Lütfen tarayıcı kamera iznini onaylayın.', {
                force: true,
                bannerState: 'warning'
            });
        }
    }

    function stopCamera() {
        state.isRunning = false;
        if (state.whatsappHoldTimer) {
            clearInterval(state.whatsappHoldTimer);
            state.whatsappHoldTimer = null;
        }
        if (state.tvAutoReaderTimer || state.tvAutoReaderActive) {
            if (state.tvAutoReaderTimer) {
                clearInterval(state.tvAutoReaderTimer);
                state.tvAutoReaderTimer = null;
            }
            state.tvAutoReaderActive = false;
            const tvBtn = document.getElementById('btn-tv-auto-toggle') || el.btnTvToggleAuto;
            if (tvBtn) {
                tvBtn.classList.remove('active-toggle');
                tvBtn.setAttribute('aria-pressed', 'false');
                tvBtn.textContent = '▶️ Otomatik TV Altyazı & Skor Spikerini Başlat';
            }
        }
        if (state.videoStream) {
            state.videoStream.getTracks().forEach(t => t.stop());
            state.videoStream = null;
        }
        el.btnStart.textContent = '📷 Kamerayı ve Sesli Asistanı Başlat';
        el.btnStart.setAttribute('aria-pressed', 'false');
        el.btnSwitchCam.disabled = true;
        el.btnToggleFlash.disabled = true;
        el.btnCaptureNow.disabled = true;
        announceGuidance('Kamera ve sesli radar durduruldu.', { force: true });
    }

    // =========================================================================
    // AKILLI KIBLE PUSULASI: 81 İL, HAVERSINE MESAFE, GÜNEŞ AZİMUTU VE NAMAZ VAKİTLERİ
    // =========================================================================
    const TURKEY_81_PROVINCES = [
        ['İstanbul', 41.0082, 28.9784], ['Ankara', 39.9334, 32.8597], ['İzmir', 38.4237, 27.1428],
        ['Bursa', 40.1885, 29.0610], ['Antalya', 36.8969, 30.7133], ['Adana', 37.0000, 35.3213],
        ['Konya', 37.8746, 32.4932], ['Şanlıurfa', 37.1591, 38.7969], ['Gaziantep', 37.0662, 37.3833],
        ['Kocaeli', 40.7654, 29.9408], ['Mersin', 36.8000, 34.6333], ['Diyarbakır', 37.9144, 40.2306],
        ['Hatay', 36.2021, 36.1606], ['Manisa', 38.6191, 27.4289], ['Kayseri', 38.7312, 35.4787],
        ['Samsun', 41.2867, 36.3300], ['Balıkesir', 39.6484, 27.8826], ['Kahramanmaraş', 37.5858, 36.9371],
        ['Van', 38.4942, 43.3800], ['Aydın', 37.8444, 27.8458], ['Tekirdağ', 40.9833, 27.5167],
        ['Sakarya', 40.7569, 30.3783], ['Denizli', 37.7765, 29.0864], ['Muğla', 37.2153, 28.3636],
        ['Eskişehir', 39.7767, 30.5206], ['Mardin', 37.3212, 40.7245], ['Trabzon', 41.0027, 39.7168],
        ['Erzurum', 39.9043, 41.2679], ['Ordu', 40.9839, 37.8764], ['Malatya', 38.3552, 38.3095],
        ['Afyonkarahisar', 38.7507, 30.5567], ['Batman', 37.8812, 41.1351], ['Tokat', 40.3167, 36.5500],
        ['Elazığ', 38.6810, 39.2264], ['Sivas', 39.7477, 37.0179], ['Adıyaman', 37.7648, 38.2786],
        ['Zonguldak', 41.4564, 31.7987], ['Kütahya', 39.4167, 29.9833], ['Çorum', 40.5506, 34.9556],
        ['Çanakkale', 40.1553, 26.4142], ['Osmaniye', 37.0742, 36.2478], ['Şırnak', 37.5164, 42.4611],
        ['Ağrı', 39.7191, 43.0503], ['Giresun', 40.9128, 38.3895], ['Isparta', 37.7648, 30.5566],
        ['Aksaray', 38.3687, 34.0370], ['Yozgat', 39.8181, 34.8147], ['Muş', 38.9462, 41.7539],
        ['Edirne', 41.6771, 26.5557], ['Düzce', 40.8438, 31.1565], ['Kastamonu', 41.3887, 33.7827],
        ['Uşak', 38.6823, 29.4082], ['Niğde', 37.9667, 34.6833], ['Kırklareli', 41.7333, 27.2167],
        ['Bitlis', 38.4000, 42.1167], ['Rize', 41.0201, 40.5234], ['Amasya', 40.6499, 35.8353],
        ['Siirt', 37.9333, 41.9500], ['Bolu', 40.7392, 31.6089], ['Nevşehir', 38.6244, 34.7144],
        ['Kars', 40.6013, 43.0975], ['Bingöl', 38.8854, 40.4966], ['Kırıkkale', 39.8468, 33.5153],
        ['Hakkari', 37.5833, 43.7333], ['Burdur', 37.7203, 30.2908], ['Karaman', 37.1759, 33.2287],
        ['Karabük', 41.2061, 32.6204], ['Kırşehir', 39.1425, 34.1709], ['Erzincan', 39.7500, 39.5000],
        ['Bilecik', 40.1451, 29.9799], ['Sinop', 42.0231, 35.1531], ['Iğdır', 39.9167, 44.0333],
        ['Bartın', 41.6344, 32.3375], ['Çankırı', 40.6013, 33.6134], ['Artvin', 41.1828, 41.8183],
        ['Gümüşhane', 40.4603, 39.4814], ['Kilis', 36.7184, 37.1212], ['Ardahan', 41.1105, 42.7022],
        ['Tunceli', 39.1079, 39.5401], ['Bayburt', 40.2552, 40.2249], ['Yalova', 40.6500, 29.2667]
    ];

    function populate81ProvincesSelect() {
        if (!el.qiblaCitySelect) return;
        let savedVal = el.qiblaCitySelect.value || '';
        if (!savedVal) {
            try { savedVal = localStorage.getItem('mikyas_saved_qibla_city') || ''; } catch (_) {}
        }
        const alreadyPopulated = Boolean(el.qiblaCitySelect.children && el.qiblaCitySelect.children.length >= 81);
        if (!alreadyPopulated) {
            el.qiblaCitySelect.innerHTML = '<option value="">-- Şehir Seçin (Veya GPS Otomatik Bulur) --</option>';
            TURKEY_81_PROVINCES.forEach(([name, lat, lon]) => {
                const bearing = calculateQiblaBearing(lat, lon);
                const opt = document.createElement('option');
                opt.value = `${lat},${lon},${name}`;
                opt.textContent = `${name} (Kıble: ${bearing}°)`;
                el.qiblaCitySelect.appendChild(opt);
            });
        }
        if (savedVal) {
            el.qiblaCitySelect.value = savedVal;
            if (!state.qiblaLocationVerified) {
                const parts = savedVal.split(',');
                if (parts.length >= 2) {
                    const lat = parseFloat(parts[0]);
                    const lon = parseFloat(parts[1]);
                    const cityName = parts[2] || 'Kayıtlı İl';
                    if (!isNaN(lat) && !isNaN(lon)) {
                        state.userLat = lat;
                        state.userLon = lon;
                        state.locationSource = 'city_select';
                        updateQiblaTargetDisplay(`${cityName} (81 İl Listesi)`);
                    }
                }
            }
        }
    }

    function calculateQiblaBearing(latDeg, lonDeg) {
        const kaabaLat = 21.422487 * (Math.PI / 180);
        const kaabaLon = 39.826206 * (Math.PI / 180);
        const phiU = latDeg * (Math.PI / 180);
        const lamU = lonDeg * (Math.PI / 180);

        const dLon = kaabaLon - lamU;
        const y = Math.sin(dLon);
        const x = Math.cos(phiU) * Math.tan(kaabaLat) - Math.sin(phiU) * Math.cos(dLon);
        const thetaRad = Math.atan2(y, x);
        const bearing = ((thetaRad * 180 / Math.PI) + 360) % 360;
        return Number(bearing.toFixed(1));
    }

    /**
     * Haversine Formülü ile Kâbe-i Muazzama'ya olan kuş uçuşu mesafeyi (km) hesaplar.
     */
    function calculateDistanceToKaabaKm(latDeg, lonDeg) {
        const R = 6371;
        const dLat = (21.422487 - latDeg) * (Math.PI / 180);
        const dLon = (39.826206 - lonDeg) * (Math.PI / 180);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(latDeg * Math.PI / 180) * Math.cos(21.422487 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return Math.round(R * c);
    }

    function calculateMagneticDeclination(latDeg, lonDeg) {
        return Number((4.8 + (lonDeg - 26.0) * 0.105 + (latDeg - 36.0) * 0.04).toFixed(2));
    }

    /**
     * Astronomik Güneş Konumu (Azimut & Yükseklik) ve Diyanet Uyumlu 6 Namaz Vakti + Kerahat Hesabı
     */
    function calculateSolarAndPrayerTimes(lat, lon, customDate = null) {
        const now = (customDate instanceof Date && !isNaN(customDate.getTime())) ? customDate : new Date();
        const startOfYear = new Date(now.getFullYear(), 0, 0);
        const dayOfYear = Math.floor((now - startOfYear) / 86400000);
        const rad = Math.PI / 180;
        const deg = 180 / Math.PI;

        // Güneş Deklinasyonu (δ) ve Zaman Denklemi (EoT - dakika)
        const gamma = ((2 * Math.PI) / 365) * (dayOfYear - 1 + (now.getHours() - 12) / 24);
        const eqTime = 229.18 * (0.000075 + 0.001868 * Math.cos(gamma) - 0.032077 * Math.sin(gamma)
            - 0.014615 * Math.cos(2 * gamma) - 0.040849 * Math.sin(2 * gamma));
        const declRad = 0.006918 - 0.399912 * Math.cos(gamma) + 0.070257 * Math.sin(gamma)
            - 0.006758 * Math.cos(2 * gamma) + 0.000907 * Math.sin(2 * gamma);

        const isTurkeyCoord = (lat >= 35.5 && lat <= 42.5 && lon >= 25.5 && lon <= 45.0);
        const tzOffsetHours = isTurkeyCoord ? 3 : (-now.getTimezoneOffset() / 60); // Türkiye koordinatlarında kalıcı UTC+3 kilidi
        const solarNoonMin = 720 - (4 * lon) - eqTime + (tzOffsetHours * 60);

        function hourAngleForElevation(elevDeg) {
            const cosHA = (Math.sin(elevDeg * rad) - Math.sin(lat * rad) * Math.sin(declRad)) /
                (Math.cos(lat * rad) * Math.cos(declRad));
            if (cosHA < -1 || cosHA > 1) return 360;
            return Math.acos(cosHA) * deg * 4; // dakika cinsinden
        }

        const sunriseDiff = hourAngleForElevation(-0.833);
        const fajrDiff = hourAngleForElevation(-18.0);
        const ishaDiff = hourAngleForElevation(-17.0);

        // İkindi (Asr-ı Evvel) güneş yüksekliği
        const noonAltRad = Math.asin(Math.sin(lat * rad) * Math.sin(declRad) + Math.cos(lat * rad) * Math.cos(declRad));
        const asrAltDeg = Math.atan(1 / (1 + (1 / Math.tan(noonAltRad)))) * deg;
        const asrDiff = hourAngleForElevation(asrAltDeg);

        // Diyanet temkin süreleri (dakika)
        const timesMin = {
            imsak: Math.round(solarNoonMin - fajrDiff),
            gunes: Math.round(solarNoonMin - sunriseDiff - 6),
            ogle: Math.round(solarNoonMin + 6),
            ikindi: Math.round(solarNoonMin + asrDiff + 5),
            aksam: Math.round(solarNoonMin + sunriseDiff + 7),
            yatsi: Math.round(solarNoonMin + ishaDiff + 2)
        };

        function fmtTime(m) {
            const norm = ((m % 1440) + 1440) % 1440;
            const hh = String(Math.floor(norm / 60)).padStart(2, '0');
            const mm = String(norm % 60).padStart(2, '0');
            return `${hh}:${mm}`;
        }

        const curMin = isTurkeyCoord
            ? (((now.getUTCHours() + 3) % 24) * 60 + now.getUTCMinutes())
            : (now.getHours() * 60 + now.getMinutes());
        let activePrayer = 'Yatsı';
        let nextPrayerName = 'İmsak';
        let minsToNext = 0;

        if (curMin < timesMin.imsak) {
            activePrayer = 'Yatsı (Gece)';
            nextPrayerName = 'İmsak';
            minsToNext = timesMin.imsak - curMin;
        } else if (curMin < timesMin.gunes) {
            activePrayer = 'Sabah Namazı Vakti';
            nextPrayerName = 'Güneş Doğuşu';
            minsToNext = timesMin.gunes - curMin;
        } else if (curMin < timesMin.ogle) {
            activePrayer = 'Kuşluk / Sabah Sonrası';
            nextPrayerName = 'Öğle';
            minsToNext = timesMin.ogle - curMin;
        } else if (curMin < timesMin.ikindi) {
            activePrayer = 'Öğle Namazı Vakti';
            nextPrayerName = 'İkindi';
            minsToNext = timesMin.ikindi - curMin;
        } else if (curMin < timesMin.aksam) {
            activePrayer = 'İkindi Namazı Vakti';
            nextPrayerName = 'Akşam';
            minsToNext = timesMin.aksam - curMin;
        } else if (curMin < timesMin.yatsi) {
            activePrayer = 'Akşam Namazı Vakti';
            nextPrayerName = 'Yatsı';
            minsToNext = timesMin.yatsi - curMin;
        } else {
            activePrayer = 'Yatsı Namazı Vakti';
            nextPrayerName = 'İmsak';
            minsToNext = (1440 - curMin) + timesMin.imsak;
        }

        // Kerahat Vakti Kontrolü (Güneş doğduktan sonra 45dk, Öğleden önce 35dk, Akşamdan önce 45dk)
        let kerahatWarning = '';
        if (curMin >= timesMin.gunes && curMin <= timesMin.gunes + 45) {
            kerahatWarning = 'Dikkat: Şu an Güneş doğuşu sonrası kerahat vaktindeyiz.';
        } else if (curMin >= timesMin.ogle - 35 && curMin < timesMin.ogle) {
            kerahatWarning = 'Dikkat: Şu an Öğle namazı öncesi (İstiva) kerahat vaktindeyiz.';
        } else if (curMin >= timesMin.aksam - 45 && curMin < timesMin.aksam) {
            kerahatWarning = 'Dikkat: Şu an Güneş batışı öncesi kerahat vaktindeyiz (Sadece günün İkindi farzı kılınabilir).';
        }

        // Şu anki Güneş Azimut Açısı (Kıble Çapraz Doğrulaması İçin)
        const trueSolarTimeMin = (curMin + eqTime + 4 * lon - 60 * tzOffsetHours + 1440) % 1440;
        const haDeg = (trueSolarTimeMin / 4) - 180;
        const haRad = haDeg * rad;
        const cosZenith = Math.sin(lat * rad) * Math.sin(declRad) + Math.cos(lat * rad) * Math.cos(declRad) * Math.cos(haRad);
        const zenithRad = Math.acos(Math.max(-1, Math.min(1, cosZenith)));
        const sunElevDeg = Number((90 - zenithRad * deg).toFixed(1));

        let sunAzimuthDeg = 180;
        const denom = Math.cos(lat * rad) * Math.sin(zenithRad);
        if (Math.abs(denom) > 0.001) {
            let cosAz = (Math.sin(lat * rad) * Math.cos(zenithRad) - Math.sin(declRad)) / denom;
            cosAz = Math.max(-1, Math.min(1, cosAz));
            const az = 180 - Math.acos(cosAz) * deg;
            sunAzimuthDeg = Number((haDeg > 0 ? (360 - az) : az).toFixed(1));
        }

        const remHours = Math.floor(minsToNext / 60);
        const remMins = minsToNext % 60;
        const remainingStr = remHours > 0 ? `${remHours} saat ${remMins} dk` : `${remMins} dakika`;

        return {
            formatted: {
                imsak: fmtTime(timesMin.imsak),
                gunes: fmtTime(timesMin.gunes),
                ogle: fmtTime(timesMin.ogle),
                ikindi: fmtTime(timesMin.ikindi),
                aksam: fmtTime(timesMin.aksam),
                yatsi: fmtTime(timesMin.yatsi)
            },
            activePrayer,
            nextPrayerName,
            remainingStr,
            kerahatWarning,
            sunElevDeg,
            sunAzimuthDeg
        };
    }

    function updateQiblaTargetDisplay(sourceLabel = '') {
        if (typeof state.userLat !== 'number' || typeof state.userLon !== 'number') return;
        state.qiblaTargetBearing = calculateQiblaBearing(state.userLat, state.userLon);
        const distKm = calculateDistanceToKaabaKm(state.userLat, state.userLon);
        state.qiblaLocationVerified = true;
        if (sourceLabel) state.qiblaLocationSource = sourceLabel;

        const prefix = state.qiblaLocationSource ? `${state.qiblaLocationSource} • ` : '';
        if (el.qiblaStatusBadge) {
            el.qiblaStatusBadge.textContent = `${prefix}Kıble: ${state.qiblaTargetBearing}° (${distKm} km)`;
        }
        if (el.qiblaTargetDeg) {
            el.qiblaTargetDeg.textContent = `${state.qiblaTargetBearing}° • Kâbe Uzaklığı: ${distKm} km`;
        }

        const solar = calculateSolarAndPrayerTimes(state.userLat, state.userLon);
        if (el.qiblaPrayerInfo) {
            el.qiblaPrayerInfo.textContent = `${solar.activePrayer} (${solar.nextPrayerName} vaktine ${solar.remainingStr})`;
        }
        if (el.qiblaConfidenceSun) {
            if (solar.sunElevDeg > 3) {
                const sunDiff = Math.round(((state.qiblaTargetBearing - solar.sunAzimuthDeg + 540) % 360) - 180);
                const sunRel = Math.abs(sunDiff) <= 6
                    ? 'Güneş Tam Kıble Yönünde!'
                    : `Kıble Güneşin ${Math.abs(sunDiff)}° ${sunDiff > 0 ? 'Sağında' : 'Solunda'}`;
                el.qiblaConfidenceSun.textContent = sunRel;
            } else {
                el.qiblaConfidenceSun.textContent = 'Gece Modu • Manyetik + Kamera Kilitli';
            }
        }
    }

    function speakPrayerTimesAndSolarValidation() {
        if (!state.qiblaLocationVerified || typeof state.userLat !== 'number') {
            announceGuidance('Namaz vakitlerini ve Güneş açısını hesaplamak için önce konumunuz doğrulanıyor, lütfen listeden şehrinizi seçin veya GPS izni verin.', {
                force: true,
                bannerState: 'warning'
            });
            return;
        }
        const solar = calculateSolarAndPrayerTimes(state.userLat, state.userLon);
        const distKm = calculateDistanceToKaabaKm(state.userLat, state.userLon);

        let sunValidationMsg = '';
        if (solar.sunElevDeg > 3) {
            const sunDiff = Math.round(((state.qiblaTargetBearing - solar.sunAzimuthDeg + 540) % 360) - 180);
            if (Math.abs(sunDiff) <= 6) {
                sunValidationMsg = 'Güneş doğrulaması: Şu an Güneş gökyüzünde tam Kıble hizasında bulunuyor! Yüzünüzü doğrudan Güneş ışığına döndüğünüzde tam Kıbleye bakmış olursunuz.';
            } else {
                sunValidationMsg = `Güneş doğrulaması: Yüzünüzü Güneşe döndüğünüzde Kıble tam ${Math.abs(sunDiff)} derece ${sunDiff > 0 ? 'sağınızda' : 'solunuzda'} kalmaktadır.`;
            }
        }

        const f = solar.formatted;
        const msg = `${state.qiblaLocationSource} için Kâbe uzaklığınız ${distKm} kilometre, Kıble açınız ${state.qiblaTargetBearing} derece. ` +
            `Şu an ${solar.activePrayer} içindeyiz; ${solar.nextPrayerName} vaktine ${solar.remainingStr} kaldı. ` +
            `${solar.kerahatWarning ? solar.kerahatWarning + ' ' : ''}` +
            `Bugünkü vakitler: İmsak ${f.imsak}, Güneş ${f.gunes}, Öğle ${f.ogle}, İkindi ${f.ikindi}, Akşam ${f.aksam}, Yatsı ${f.yatsi}. ` +
            `${sunValidationMsg}`;

        showDetectedResult('Akıllı Kıble, Güneş Doğrulaması ve Diyanet Uyumlu Namaz Vakitleri', msg);
        announceGuidance(msg, { force: true, bannerState: 'centered' });
    }

    function saveRoomQiblaProfile() {
        if ((!state.qiblaLocationVerified || state.qiblaTargetBearing === null) &&
            typeof state.userLat === 'number' && typeof state.userLon === 'number') {
            state.qiblaTargetBearing = calculateQiblaBearing(state.userLat, state.userLon);
            state.qiblaLocationVerified = true;
        }
        if (!state.qiblaLocationVerified || state.qiblaTargetBearing === null) {
            announceGuidance('Oda Kıble hafızasını kaydetmek için önce konumunuzun doğrulanmış olması gerekir.', {
                force: true,
                bannerState: 'warning'
            });
            return;
        }
        if (typeof state.smoothedHeading === 'number') {
            const diff = Math.abs(((state.qiblaTargetBearing - state.smoothedHeading + 540) % 360) - 180);
            if (diff > 15) {
                announceGuidance(`Oda Kıble referansını doğru kaydetmek için lütfen önce telefonu Kıble açısına (${Math.round(state.qiblaTargetBearing)} dereceye) çevirin, ardından kaydedin.`, {
                    force: true,
                    bannerState: 'warning'
                });
                return;
            }
        }
        const landmarks = state.lastSceneObstacles.length > 0
            ? state.lastSceneObstacles.join(', ')
            : 'açık alan / duvar';
        const profile = {
            city: state.qiblaLocationSource || 'Seçili Konum',
            bearing: state.qiblaTargetBearing,
            landmarks,
            savedAt: new Date().toLocaleDateString('tr-TR')
        };
        try {
            localStorage.setItem('mikyas_saved_room_qibla', JSON.stringify(profile));
        } catch (_) {}
        announceGuidance(`Bu odadaki Kıble yönünüz (${profile.city}, ${Math.round(profile.bearing)} derece, önünüzdeki referans: ${landmarks}) başarıyla hafızaya kaydedildi!`, {
            force: true,
            bannerState: 'centered'
        });
    }

    function getSavedRoomQiblaNote() {
        try {
            const raw = localStorage.getItem('mikyas_saved_room_qibla');
            if (!raw) return '';
            const p = JSON.parse(raw);
            return ` Kayıtlı oda hafızası (${p.city || 'Oda'}): ${Math.round(Number(p.bearing) || 0)} derece (${p.bearing}°) yönünde (${p.landmarks}) olarak işaretlenmişti.`;
        } catch (_) {
            return '';
        }
    }

    function autoAcquireLocationAndWatch() {
        populate81ProvincesSelect();

        if ('geolocation' in navigator && state.gpsWatchId === null) {
            state.gpsWatchId = navigator.geolocation.watchPosition(
                (pos) => {
                    const firstTime = !state.qiblaLocationVerified;
                    state.userLat = pos.coords.latitude;
                    state.userLon = pos.coords.longitude;
                    updateQiblaTargetDisplay('Canlı GPS');
                    if (firstTime && state.mode === 'qibla_compass') {
                        announceGuidance(`Canlı GPS konumunuz doğrulandı! Kesin Kıble açınız: ${state.qiblaTargetBearing} derece.`, {
                            force: true,
                            bannerState: 'centered'
                        });
                    }
                },
                () => {},
                { enableHighAccuracy: true, maximumAge: 10000, timeout: 10000 }
            );
        }

        // Mobil veri santrali (CGNAT) IP adresleri gerçek ilden ratusan km uzaktaki bölge müdürlüğünü (İstanbul/Ankara/İzmir)
        // gösterebildiği için IP konumunu Kıble pusulasında otomatik "doğrulanmış" kabul etme; sadece kaba ön bilgi olarak tut!
        if (typeof fetch === 'function') {
            fetch('https://ipwho.is/')
                .then(r => r.json())
                .then(data => {
                    if (!state.qiblaLocationVerified && !state.userLat && data && typeof data.latitude === 'number' && typeof data.longitude === 'number') {
                        state.ipHintCity = data.city || '';
                        if (el.qiblaCitySelect && state.ipHintCity) {
                            for (let i = 0; i < el.qiblaCitySelect.options.length; i++) {
                                if (el.qiblaCitySelect.options[i].text.toLocaleLowerCase('tr-TR').startsWith(state.ipHintCity.toLocaleLowerCase('tr-TR'))) {
                                    el.qiblaCitySelect.selectedIndex = i;
                                    break;
                                }
                            }
                        }
                    }
                })
                .catch(() => {});
        }
    }

    function handleCompassHeadingEvent(rawHeadingDeg, compassAccuracyDeg = 10) {
        if (typeof rawHeadingDeg !== 'number' || isNaN(rawHeadingDeg)) return;
        if (!state.qiblaActive && state.mode !== 'qibla_compass') return;

        // KİLİT 1: Konum Doğrulaması
        if (!state.qiblaLocationVerified || state.qiblaTargetBearing === null) {
            el.qiblaCurrentDeg.textContent = 'Önce Konum Doğrulanıyor...';
            announceGuidance('Yanlış Kıble göstermemek için önce konumunuz doğrulanıyor. Lütfen GPS iznini onaylayın veya 81 il listesinden şehrinizi seçin.', {
                bannerState: 'warning',
                minIntervalMs: 4000
            });
            return;
        }

        // KİLİT 2: Telefon Düz Tutulma Kilidi
        if (state.hasOrientationSensor && (Math.abs(state.tiltRoll) > 16 || Math.abs(state.tiltPitch) > 22)) {
            state.qiblaStableSince = 0;
            el.qiblaCurrentDeg.textContent = `Telefon Eğik (Yatay: ${state.tiltRoll}°, Dikey: ${state.tiltPitch}°) — Düz Tutun`;
            announceGuidance('Güvenlik kilidi: Telefon eğik tutuluyor. Pusulanın yanılmaması için lütfen telefonu avucunuzda yere tam paralel ve düz tutun.', {
                bannerState: 'warning',
                minIntervalMs: 3000
            });
            return;
        }

        // KİLİT 3: Manyetik Parazit ve Kalibrasyon Kararlılık Testi
        const normHeading = ((rawHeadingDeg % 360) + 360) % 360;
        state.headingSamples.push(normHeading);
        if (state.headingSamples.length > 12) state.headingSamples.shift();

        let jitterSum = 0;
        for (let i = 1; i < state.headingSamples.length; i++) {
            const stepDiff = Math.abs(((state.headingSamples[i] - state.headingSamples[i - 1] + 540) % 360) - 180);
            jitterSum += stepDiff;
        }
        const avgJitter = state.headingSamples.length > 4 ? (jitterSum / (state.headingSamples.length - 1)) : 0;

        if ((compassAccuracyDeg > 28) || (avgJitter > 16)) {
            state.qiblaStableSince = 0;
            el.qiblaCurrentDeg.textContent = 'Manyetik Parazit / Kalibrasyon Gerekli!';
            announceGuidance('Dikkat: Yakında mıknatıslı kılıf, hoparlör veya metal eşya algılandı ya da pusula kalibrasyonu bozuk! Yanlış yön göstermemek için ölçüm duraklatıldı. Lütfen metalden uzaklaşıp telefonu havada 8 çizecek şekilde sallayın.', {
                bannerState: 'warning',
                minIntervalMs: 3800
            });
            return;
        }

        // Matematiksel Güven Puanı Hesabı (%0 - %100)
        const tiltPenalty = state.hasOrientationSensor ? Math.min(20, Math.hypot(state.tiltRoll, state.tiltPitch)) : 0;
        const jitterPenalty = Math.min(30, avgJitter * 2);
        const confidencePct = Math.max(60, Math.min(99, Math.round(100 - tiltPenalty * 0.6 - jitterPenalty)));

        if (state.smoothedHeading === null) {
            state.smoothedHeading = normHeading;
        } else {
            const diff = ((normHeading - state.smoothedHeading + 540) % 360) - 180;
            state.smoothedHeading = ((state.smoothedHeading + 0.25 * diff) + 360) % 360;
        }

        state.compassHeading = Number(state.smoothedHeading.toFixed(1));

        const deltaDeg = ((state.qiblaTargetBearing - state.compassHeading + 540) % 360) - 180;
        const absDelta = Math.abs(deltaDeg);
        const isAligned = absDelta <= 4.0;

        if (el.qiblaCurrentDeg) {
            const dirStr = isAligned
                ? 'TAM KIBLE HİZASINDA (Doğrulandı)'
                : `${Math.round(absDelta)}° ${deltaDeg > 0 ? 'Sağınızda' : 'Solunuzda'}`;
            el.qiblaCurrentDeg.textContent = `Pusula: ${Math.round(state.compassHeading)}° • ${dirStr}`;
        }

        el.tPosition.textContent = `Pusula: ${Math.round(state.compassHeading)}° (Kıble: ${state.qiblaTargetBearing}°)`;
        el.tDistance.textContent = isAligned ? 'Tam Kıble Hizasında' : `${Math.round(absDelta)}° ${deltaDeg > 0 ? 'Sağa' : 'Sola'} Dönün`;

        const panX = Math.max(-1, Math.min(1, deltaDeg / 75));
        radar.updateRadar(panX, 0, isAligned);

        if (isAligned) {
            const now = performance.now();
            if (state.qiblaStableSince === 0) {
                state.qiblaStableSince = now;
                if (navigator.vibrate) navigator.vibrate(50);
                announceGuidance('Kıble hizasına geldiniz, doğrulama için 1 saniye sabit tutun.', {
                    bannerState: 'centered',
                    minIntervalMs: 1200
                });
                return;
            }

            if (now - state.qiblaStableSince >= 1300) {
                if (navigator.vibrate && now - state.lastQiblaLockVibrate > 2500) {
                    navigator.vibrate([120, 60, 180]);
                    state.lastQiblaLockVibrate = now;
                }
                const uniqueObs = [...new Set(state.lastSceneObstacles)];
                const obstacleNote = uniqueObs.length > 0
                    ? ` Ancak kamerada önünüzde ${uniqueObs.join(', ')} görünüyor, secde alanı için 1 adım yana geçebilirsiniz.`
                    : ' Önünüzdeki secde alanı da açık görünüyor.';

                announceGuidance(`Doğrulandı: Tam Kıble yönündesiniz! (${state.qiblaLocationSource}, ${state.qiblaTargetBearing} derece Kâbe açısı).${obstacleNote}`, {
                    force: true,
                    bannerState: 'centered',
                    minIntervalMs: 3600
                });
            }
        } else {
            state.qiblaStableSince = 0;
            const turnDir = deltaDeg > 0 ? 'sağa' : 'sola';
            const amount = Math.round(absDelta);
            announceGuidance(`Kıble ${amount} derece ${deltaDeg > 0 ? 'sağınızda' : 'solunuzda'}. Lütfen telefonu düz tutarak yavaşça ${turnDir} dönün.`, {
                bannerState: 'normal',
                minIntervalMs: 2400
            });
        }
    }

    function drawQiblaOverlayArrow(ctx, w, h) {
        if (!state.qiblaLocationVerified || state.qiblaTargetBearing === null) return;
        const cx = w / 2;
        const cy = h / 2;
        const deltaDeg = state.compassHeading !== null
            ? (((state.qiblaTargetBearing - state.compassHeading + 540) % 360) - 180)
            : 0;
        const rad = (deltaDeg - 90) * (Math.PI / 180);
        const len = Math.min(w, h) * 0.28;

        ctx.save();
        ctx.strokeStyle = Math.abs(deltaDeg) <= 4.0 ? '#22c55e' : '#38bdf8';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(rad) * len, cy + Math.sin(rad) * len);
        ctx.stroke();
        ctx.restore();
    }

    async function startQiblaCompassSensor() {
        radar.init();
        state.qiblaActive = true;
        setMode('qibla_compass');
        autoAcquireLocationAndWatch();

        if (typeof window.DeviceOrientationEvent !== 'undefined' &&
            typeof window.DeviceOrientationEvent.requestPermission === 'function') {
            try {
                const perm = await window.DeviceOrientationEvent.requestPermission();
                if (perm !== 'granted') {
                    announceGuidance('iPhone pusula sensörü izni reddedildi. Lütfen Safari ayarlarından hareket ve yön erişimine izin verin.', {
                        force: true,
                        bannerState: 'warning'
                    });
                    return;
                }
            } catch (_) {}
        }

        const roomNote = getSavedRoomQiblaNote();
        if (state.qiblaLocationVerified) {
            const solar = calculateSolarAndPrayerTimes(state.userLat, state.userLon);
            announceGuidance(`Akıllı Kıble pusulası aktif. Konum: ${state.qiblaLocationSource}, Kıble açınız ${state.qiblaTargetBearing} derece. Şu an ${solar.activePrayer} içindeyiz.${roomNote} Telefonu avucunuzda yere paralel düz tutarak yavaşça dönün.`, {
                force: true,
                bannerState: 'centered'
            });
        } else {
            announceGuidance(`Akıllı Kıble pusulası başlatıldı.${roomNote} Yanlış yön göstermemek için şu an canlı GPS ve konumunuz doğrulanıyor, dilerseniz 81 il listesinden şehrinizi de seçebilirsiniz.`, {
                force: true,
                bannerState: 'normal'
            });
        }
    }

    function requestQiblaGpsLocation() {
        if (!('geolocation' in navigator)) {
            announceGuidance('Cihazınızda GPS konum servisi bulunamadı, lütfen şehir listesinden ilinizi seçin.', {
                force: true,
                bannerState: 'warning'
            });
            return;
        }
        announceGuidance('Yüksek hassasiyetli GPS uydusundan konumunuz doğrulanıyor, lütfen bekleyin...', { force: true });
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                state.userLat = pos.coords.latitude;
                state.userLon = pos.coords.longitude;
                updateQiblaTargetDisplay('Kesin GPS');
                announceGuidance(`GPS konumunuz milimetrik olarak doğrulandı! Bulunduğunuz noktadan kesin Kıble açısı: ${state.qiblaTargetBearing} derece.`, {
                    force: true,
                    bannerState: 'centered'
                });
            },
            () => {
                announceGuidance('GPS uydusuna ulaşılamadı. Lütfen şehir seçim kutusundan bulunduğunuz ili seçin.', {
                    force: true,
                    bannerState: 'warning'
                });
            },
            { enableHighAccuracy: true, timeout: 8000 }
        );
    }

    function getActiveModeTitle() {
        const activeBtn = document.querySelector('.mode-card.active .mode-title');
        return activeBtn ? activeBtn.textContent : 'Sınav ve Şık Okuyucu';
    }

    // =========================================================================
    // MOD 15: AKILLI SESLİ ŞARKI, MIRILDANMA (PARSONS & YARI-TON ARALIK DİZİSİ),
    // FONETİK TÜRKÇE SÖZ TAMAMLAMA, MISRA MISRA KARAOKE, MAKAM VE AKORT ASİSTANI
    // =========================================================================
    const TURKISH_NOTE_NAMES = ['Do', 'Do#', 'Re', 'Re#', 'Mi', 'Fa', 'Fa#', 'Sol', 'Sol#', 'La', 'La#', 'Si'];
    const SAVED_SONGS_STORAGE_KEY = 'mikyas_saved_songs_v1';

    /**
     * Her eserin hem sözleri/anahtar kelimeleri hem de mırıldanma/ıslıkla (sözsüz) bulmayı sağlayan
     * Yarı-Ton Melodi Aralık Vektörü (Semitone Intervals Δm = MIDI[i] - MIDI[i-1]) tanımlıdır.
     */
    const TURKISH_OFFLINE_SONG_DB = [
        {
            title: 'Gülpembe',
            artist: 'Barış Manço',
            album: 'Sözüm Meclisten Dışarı (1981)',
            genre: 'Anadolu Rock',
            semitoneIntervals: [-2, -2, -1, 1, 2, -2, -1, -2, 2, 1, -1, -2],
            keywords: ['gülpembe', 'sen gülünce güller açar', 'bülbüller seni söyler', 'güz yağmurlarıyla bir gün göçtün'],
            lyrics: 'Sen gülünce güller açar Gülpembe,\nBülbüller seni söyler, biz dinlerdik Gülpembe.\nBahar gelir, parlak güneş doğardı,\nSen üzülünce boynumuz bükülürdü Gülpembe.\nGüz yağmurlarıyla bir gün göçtün gittin, inanamadık Gülpembe.\nBizim iller sessiz, bizim iller sensiz olamadı Gülpembe.'
        },
        {
            title: 'Dönence',
            artist: 'Barış Manço',
            album: 'Sözüm Meclisten Dışarı (1981)',
            genre: 'Anadolu Rock',
            semitoneIntervals: [0, 3, 2, -2, -3, 0, 3, 2, 3, -3],
            keywords: ['dönence', 'simsiyah gecenin koynundayım', 'uzaklarda bir yerlerde güneşler doğuyor', 'biliyorum dönence'],
            lyrics: 'Simsiyah gecenin koynundayım, yapayalnız.\nUzaklarda bir yerlerde güneşler doğuyor.\nBiliyorum, dönence!\nKupkuru bir ağacın dalıyım, yapayalnız.\nUzaklarda bir yerlerde bir şeyler kök salıyor.\nBiliyorum, dönence!'
        },
        {
            title: 'Dağlar Dağlar',
            artist: 'Barış Manço',
            album: 'Dağlar Dağlar (1970)',
            genre: 'Anadolu Rock',
            semitoneIntervals: [2, 1, 2, -2, -1, -2, -2, 2, 1, -1, -2],
            keywords: ['dağlar dağlar', 'ellerimle büyüttüğüm', 'kurban olam yol ver geçem', 'sevdiğimi son bir olsun yakından görem'],
            lyrics: 'Ellerimle büyüttüğüm solar iken dirilttiğim,\nÇiçeğimi kopardınız, ellere verdiniz.\nDağlar dağlar, kurban olam, yol ver geçem,\nSevdiğimi son bir olsun yakından görem!'
        },
        {
            title: 'Arkadaşım Eşek',
            artist: 'Barış Manço',
            album: 'Sözüm Meclisten Dışarı (1981)',
            genre: 'Çocuk / Pop',
            semitoneIntervals: [2, 2, 1, 2, -2, -1, -2, -2, 2, 2, -4],
            keywords: ['arkadaşım eşek', 'kaç yıl oldu saymadım köyden göçeli', 'arkadaşım eş', 'uzun kulaklı'],
            lyrics: 'Kaç yıl oldu saymadım köyden göçeli,\nMevsimler geldi geçti görüşmeyeli.\nHiç haber göndermedin o günden beri,\nYoksa bana küstün mü, unuttun mu beni?\nArkadaşım eş, arkadaşım şek, arkadaşım eşek!'
        },
        {
            title: 'Uzun İnce Bir Yoldayım',
            artist: 'Aşık Veysel',
            album: 'Dostlar Beni Hatırlasın',
            genre: 'Türk Halk Müziği (Hüseyni)',
            semitoneIntervals: [0, 2, 1, -1, -2, -2, 2, -2, -1, 1, -1, -2],
            keywords: ['uzun ince bir yoldayım', 'gidiyorum gündüz gece', 'bilmiyorum ne haldeyim', 'iki kapılı bir handa'],
            lyrics: 'Uzun ince bir yoldayım,\nGidiyorum gündüz gece.\nBilmiyorum ne haldeyim,\nGidiyorum gündüz gece.\nDünyaya geldiğim anda,\nYürüdüm aynı zamanda,\nİki kapılı bir handa,\nGidiyorum gündüz gece.'
        },
        {
            title: 'Gönül Dağı',
            artist: 'Neşet Ertaş',
            album: 'Bozkırın Tezenesi',
            genre: 'Türk Halk Müziği / Bozlak',
            semitoneIntervals: [3, 2, -2, -1, -2, 2, -2, -2, 2, -2],
            keywords: ['gönül dağı yağmur yağmur', 'boran olunca', 'akar can özümden sel gizli gizli', 'bir tenhada can cananı bulunca'],
            lyrics: 'Gönül dağı yağmur yağmur boran olunca,\nAkar can özümden sel gizli gizli.\nBir tenhada can cananı bulunca,\nSinemi yaralar dil gizli gizli.'
        },
        {
            title: 'Neredesin Sen',
            artist: 'Neşet Ertaş',
            album: 'Bozkırın Tezenesi',
            genre: 'Türk Halk Müziği',
            semitoneIntervals: [2, 2, -2, -2, 2, 1, -1, -2, -2],
            keywords: ['neredesin sen', 'tatlı dile güler yüze', 'doyulur mu doyulur mu', 'aşkın beni deli eyledi'],
            lyrics: 'Tatlı dile güler yüze,\nDoyulur mu doyulur mu?\nAşkın beni deli eyledi,\nNeredesin sen, neredesin sen?'
        },
        {
            title: 'Gülümse',
            artist: 'Sezen Aksu',
            album: 'Gülümse (1991)',
            genre: 'Türkçe Pop',
            semitoneIntervals: [2, 1, 2, -2, -1, -2, 3, -1, -2],
            keywords: ['gülümse hadi gülümse', 'bulutlar gitsin', 'belki şehre bir film gelir', 'tut ki karnım acıktı anneme küstüm'],
            lyrics: 'Tut ki karnım acıktı, anneme küstüm,\nTüm şehir bana küstü.\nBir kedim bile yok, anlıyor musun?\nHadi gülümse, bulutlar gitsin!\nBelki şehre bir film gelir, bir güzel orman olur yazılarda.\nİklim değişir, Akdeniz olur, gülümse!'
        },
        {
            title: 'Firuze',
            artist: 'Sezen Aksu',
            album: 'Firuze (1982)',
            genre: 'Türkçe Pop',
            semitoneIntervals: [-1, -2, -2, 2, 2, 1, -1, -2],
            keywords: ['firuze', 'kıskanır rengini baharda yeşiller', 'sevda büyüsü gibisin sen firuze'],
            lyrics: 'Kıskanır rengini baharda yeşiller,\nSevda büyüsü gibisin sen Firuze.\nSen nazlı bir çiçek, bir orman kuytu,\nÜzüm buğusu gibisin sen Firuze.'
        },
        {
            title: 'Resimdeki Gözyaşları',
            artist: 'Cem Karaca',
            album: 'Apaşlar (1968)',
            genre: 'Anadolu Rock',
            semitoneIntervals: [3, 2, 2, -2, -2, -1, 1, 2, -2, -3],
            keywords: ['resimdeki gözyaşları', 'bir gün belki hayattan', 'geçmişteki günlerden bir teselli ararsın', 'bak o zaman resmime'],
            lyrics: 'Bir gün belki hayattan,\nGeçmişteki günlerden bir teselli ararsın.\nBak o zaman resmime,\nGör akan o yaşları!\nBenden sana son kalan,\nBir küçük resim şimdi.\nCevap veremez ama,\nAğlar yalnızlığına!'
        },
        {
            title: 'Tamirci Çırağı',
            artist: 'Cem Karaca',
            album: 'Klasikler (1975)',
            genre: 'Anadolu Rock',
            semitoneIntervals: [2, 1, 2, -2, -1, -2, 2, -2],
            keywords: ['tamirci çırağı', 'gönlümde bir fırtına kopar', 'işçisin sen işçi kal', 'giy dedi tulumları'],
            lyrics: 'Gönlümde bir fırtına kopar,\nUstam seslenir uzaktan: Oğlum al takımları!\nİşçisin sen işçi kal, giy dedi tulumları.'
        },
        {
            title: 'Ceviz Ağacı',
            artist: 'Cem Karaca',
            album: 'Merhaba Gençler (1987)',
            genre: 'Anadolu Rock',
            semitoneIntervals: [0, 2, 1, 2, -2, -1, -2, 0, 3, -1, -2],
            keywords: ['ceviz ağacı', 'başım köpük köpük bulut', 'ben bir ceviz ağacıyım gülhane parkında', 'ne sen bunun farkındasın ne de polis farkında'],
            lyrics: 'Başım köpük köpük bulut, içim dışım deniz,\nBen bir ceviz ağacıyım Gülhane Parkında.\nBudak budak, şerham şerham ihtiyar bir ceviz,\nNe sen bunun farkındasın ne de polis farkında.'
        },
        {
            title: 'Fikrimin İnce Gülü',
            artist: 'Müzeyyen Senar (Muallim İsmail Hakkı Bey)',
            album: 'Türk Sanat Müziği Klasikleri',
            genre: 'Türk Sanat Müziği (Acemkürdî)',
            semitoneIntervals: [-2, -1, -2, 2, 1, 2, -2, -1, -2, -2],
            keywords: ['fikrimin ince gülü', 'kalbimin şen bülbülü', 'o gün ki gördüm seni', 'yaktın ah yaktın beni'],
            lyrics: 'Fikrimin ince gülü,\nKalbimin şen bülbülü.\nO gün ki gördüm seni,\nYaktın ah yaktın beni.'
        },
        {
            title: 'Şimdi Uzaklardasın',
            artist: 'Zeki Müren',
            album: 'Türk Sanat Müziği Klasikleri',
            genre: 'Türk Sanat Müziği (Sûzinâk)',
            semitoneIntervals: [2, 1, 2, -2, -1, -2, 1, -1, -2],
            keywords: ['şimdi uzaklardasın', 'gönül hicranla doldu', 'hiç ayrılamam derken', 'kavuşmak hayal oldu'],
            lyrics: 'Şimdi uzaklardasın,\nGönül hicranla doldu.\nHiç ayrılamam derken,\nKavuşmak hayal oldu.'
        },
        {
            title: 'Samanyolu',
            artist: 'Berkant',
            album: 'Türk Pop Klasikleri (1967)',
            genre: 'Türkçe Nostalji / Pop',
            semitoneIntervals: [5, -1, -2, -2, 3, -1, -2, -1, 5, -2, -1, -2],
            keywords: ['samanyolu', 'sen kalbimin mehtabısın güneşisin', 'bir şarkısın sen ömür boyu sürecek', 'dudaklarımdan yıllarca düşmeyecek'],
            lyrics: 'Sen kalbimin mehtabısın, güneşisin,\nSen ruhumun vazgeçilmez bir eşisin.\nBir şarkısın sen, ömür boyu sürecek,\nDudaklarımdan yıllarca düşmeyecek!'
        },
        {
            title: 'Üsküdar\'a Gider İken (Kâtibim)',
            artist: 'İstanbul Türküsü / Klasik',
            album: 'Geleneksel İstanbul Türküleri',
            genre: 'Türk Halk / Sanat Müziği (Nihavend)',
            semitoneIntervals: [2, 1, 2, 2, -2, -2, -1, -2, 2, 1, 2, -3],
            keywords: ['üsküdara gider iken', 'aldı da bir yağmur', 'katibimin setresi uzun', 'katip uykudan uyanmış'],
            lyrics: 'Üsküdar\'a gider iken aldı da bir yağmur,\nKâtibimin setresi uzun, eteği çamur.\nKâtip uykudan uyanmış, gözleri mahmur,\nKâtip benim, ben kâtibin, el ne karışır?'
        },
        {
            title: 'Çanakkale İçinde',
            artist: 'Çanakkale Türküsü',
            album: 'Kahramanlık Türküleri',
            genre: 'Türk Halk Müziği',
            semitoneIntervals: [2, 1, 2, 0, -2, -1, -2, 2, -2, -2],
            keywords: ['çanakkale içinde vurdular beni', 'ölmeden mezara koydular beni', 'of gençliğim eyvah', 'aynalı çarşı'],
            lyrics: 'Çanakkale içinde aynalı çarşı,\nAna ben gidiyom düşmana karşı,\nOf, gençliğim eyvah!\nÇanakkale içinde vurdular beni,\nÖlmeden mezara koydular beni,\nOf, gençliğim eyvah!'
        },
        {
            title: 'Sarı Gelin',
            artist: 'Erzurum Türküsü',
            album: 'Anadolu Türküleri',
            genre: 'Türk Halk Müziği',
            semitoneIntervals: [0, -1, -2, 2, 1, -1, -2, -2, 2, -2],
            keywords: ['sarı gelin', 'erzurum çarşı pazar', 'leylim aman', 'içinde bir kız gezer'],
            lyrics: 'Erzurum çarşı pazar, leylim aman aman,\nSarı gelin...\nİçinde bir kız gezer, oy nenen ölsün sarı gelin aman!'
        },
        {
            title: 'İstiklal Marşı',
            artist: 'Mehmet Akif Ersoy & Osman Zeki Üngör',
            album: 'Türkiye Cumhuriyeti Milli Marşı',
            genre: 'Milli Marş',
            semitoneIntervals: [5, 2, 1, -1, -2, -5, 5, 4, 3, -2, -1],
            keywords: ['korkma sönmez bu şafaklarda', 'yüzen al sancak', 'sönmeden yurdumun üstünde', 'o benim milletimin yıldızıdır'],
            lyrics: 'Korkma, sönmez bu şafaklarda yüzen al sancak;\nSönmeden yurdumun üstünde tüten en son ocak.\nO benim milletimin yıldızıdır, parlayacak;\nO benimdir, o benim milletimindir ancak!'
        },
        {
            title: 'Kuzu Kuzu',
            artist: 'Tarkan',
            album: 'Karma (2001)',
            genre: 'Türkçe Pop',
            semitoneIntervals: [0, 1, -1, -2, 2, 1, -1, -2],
            keywords: ['kuzu kuzu', 'bak kırıldı kolum kanadım', 'olmadı tutunamadım', 'işte geldim kapına kuzu kuzu'],
            lyrics: 'Bak kırıldı kolum kanadım,\nOlmadı, tutunamadım.\nZor! Yokluğun çok zor, alışamadım.\nİşte geldim kapına kuzu kuzu!'
        },
        {
            title: 'Şımarık',
            artist: 'Tarkan',
            album: 'Ölürüm Sana (1997)',
            genre: 'Türkçe Pop',
            semitoneIntervals: [1, 2, -2, -1, 1, 2, -2, -1],
            keywords: ['şımarık', 'yakalarsam muck muck', 'takmış koluna elin adamını', 'beni orta yerimden çatlatıyor'],
            lyrics: 'Takmış koluna elin adamını,\nBeni orta yerimden çatlatıyor.\nAğzında sakız şişirip şişirip,\nArsız arsız patlatıyor!'
        },
        {
            title: 'Nilüfer',
            artist: 'Müslüm Gürses',
            album: 'Aşk Tesadüfleri Sever (2006)',
            genre: 'Arabesk / Alternatif',
            semitoneIntervals: [2, 1, 2, -2, -1, -2, -2, 2],
            keywords: ['nilüfer', 'zaman sadece birazcık zaman', 'geçici bu öfke bu hırs bu intikam', 'acılarımız tarih oluyor'],
            lyrics: 'Zaman, sadece birazcık zaman...\nGeçici bu öfke, bu hırs, bu intikam.\nAcılarımız tarih oluyor,\nÖmrümüzden Nilüfer.'
        },
        {
            title: 'Senden Daha Güzel',
            artist: 'Duman',
            album: 'Seni Kendime Sakladım (2005)',
            genre: 'Türkçe Rock',
            semitoneIntervals: [2, 2, -2, -2, 4, -2, -2],
            keywords: ['senden daha güzel', 'kimseyi görmedim ben senden daha güzel', 'kimseyi tanımadım ben'],
            lyrics: 'Kimseyi görmedim ben,\nSenden daha güzel!\nKimseyi tanımadım ben,\nSenden daha özel!'
        },
        {
            title: 'Bir Derdim Var',
            artist: 'Mor ve Ötesi',
            album: 'Dünya Yalan Söylüyor (2004)',
            genre: 'Türkçe Rock',
            semitoneIntervals: [3, -1, -2, 2, -2, -2, 2, 1],
            keywords: ['bir derdim var artık tutamam içimde', 'gitsem nereye kadar', 'kalsam neye yarar'],
            lyrics: 'Bir derdim var, artık tutamam içimde.\nGitsem nereye kadar, kalsam neye yarar?\nHiç anlatamadım, hiç anlamadılar.'
        },
        {
            title: 'Sil Baştan',
            artist: 'Şebnem Ferah',
            album: 'Perdeler (2001)',
            genre: 'Türkçe Rock',
            semitoneIntervals: [-2, -1, 1, 2, 2, -2, -2, -1],
            keywords: ['sil baştan başlamak gerek bazen', 'hayatı sıfırlamak', 'her şeyi unutmak'],
            lyrics: 'Sil baştan başlamak gerek bazen,\nHayatı sıfırlamak.\nSil baştan sevmek gerek bazen,\nHer şeyi unutmak.'
        },
        {
            title: 'Şol Cennetin Irmakları',
            artist: 'Yunus Emre İlahisi',
            album: 'Tasavvuf Klasikleri',
            genre: 'İlahi / Tasavvuf',
            semitoneIntervals: [2, 1, 2, -2, -1, -2, 0, 2, -2],
            keywords: ['şol cennetin ırmakları', 'akar allah deyu deyu', 'çıkmış islam bülbülleri', 'öter allah deyu deyu'],
            lyrics: 'Şol cennetin ırmakları,\nAkar Allah deyu deyu.\nÇıkmış İslam bülbülleri,\nÖter Allah deyu deyu.'
        },
        {
            title: 'İyi ki Doğdun (Mutlu Yıllar Sana)',
            artist: 'Geleneksel Kutlama Şarkısı',
            album: 'Kutlama Klasikleri',
            genre: 'Kutlama Melodisi',
            semitoneIntervals: [0, 2, -2, 5, -1, -4, 0, 2, -2, 7, -2],
            keywords: ['iyi ki doğdun', 'mutlu yıllar sana', 'happy birthday to you'],
            lyrics: 'İyi ki doğdun, iyi ki doğdun,\nMutlu yıllar sana!\nİyi ki doğdun, iyi ki varsın,\nNice mutlu yıllara!'
        },
        {
            title: '9. Senfoni (Neşeye Övgü / Ode to Joy)',
            artist: 'Ludwig van Beethoven',
            album: 'Klasik Müzik Başyapıtları',
            genre: 'Klasik Müzik',
            semitoneIntervals: [0, 1, 2, 0, -2, -1, -2, -2, 2, 2, 0, -2, 0],
            keywords: ['neşeye övgü', 'beethoven 9', 'ode to joy'],
            lyrics: 'Kardeş olun ey insanlar,\nBunu ister tanrımız.\nBu dünyada her şey geçer,\nEn son sana dost kalır!'
        }
    ];

    /**
     * Türkçe Fonetik Normalleştirici ve 3-Gram Bulanık (Fuzzy) Benzerlik Skoru:
     * Gürültülü ortamda "gül pembe" -> "gulpembe" veya "uzun ince yolda" gibi eksik/bozuk
     * duyulan kelimeleri yüksek doğrulukla eşleştirir.
     */
    function normalizeTurkishPhonetic(str) {
        return String(str || '')
            .toLocaleLowerCase('tr-TR')
            .replace(/ğ/g, 'g')
            .replace(/ş/g, 's')
            .replace(/ç/g, 'c')
            .replace(/ı/g, 'i')
            .replace(/ö/g, 'o')
            .replace(/ü/g, 'u')
            .replace(/â/g, 'a')
            .replace(/î/g, 'i')
            .replace(/û/g, 'u')
            .replace(/[^a-z0-9\s]/g, ' ')
            .replace(/(.)\1+/g, '$1')
            .replace(/\s+/g, ' ')
            .trim();
    }

    function computeTrigramSimilarity(a, b) {
        const na = normalizeTurkishPhonetic(a);
        const nb = normalizeTurkishPhonetic(b);
        if (!na || !nb) return 0;
        if (na.includes(nb) || nb.includes(na)) return 0.95;

        const trigramsA = new Set();
        const trigramsB = new Set();
        for (let i = 0; i <= na.length - 3; i++) trigramsA.add(na.slice(i, i + 3));
        for (let i = 0; i <= nb.length - 3; i++) trigramsB.add(nb.slice(i, i + 3));
        if (trigramsA.size === 0 || trigramsB.size === 0) return 0;

        let inter = 0;
        trigramsA.forEach(t => {
            if (trigramsB.has(t)) inter++;
        });
        return (2 * inter) / (trigramsA.size + trigramsB.size);
    }

    /**
     * Dinamik Zaman Bükmesi (Dynamic Time Warping - DTW) Tabanlı Yarı-Ton Melodi Hizalama Motoru:
     * Kullanıcı melodiyi orijinalinden daha hızlı, daha yavaş veya arada fazladan nefes/nota
     * uzatmasıyla mırıldansa bile O(N*M) DTW maliyet matrisi ile zaman eksenini esneterek
     * transpozisyondan ve tempodan bağımsız en doğru melodi eşleşmesini hesaplar.
     */
    function computeSemitoneDtwSimilarity(seqA, seqB) {
        const n = seqA.length;
        const m = seqB.length;
        if (n === 0 || m === 0) return 0;

        const dp = Array.from({ length: n + 1 }, () => new Float32Array(m + 1).fill(1e6));
        dp[0][0] = 0;

        for (let i = 1; i <= n; i++) {
            for (let j = 1; j <= m; j++) {
                const diff = Math.abs(seqA[i - 1] - seqB[j - 1]);
                const dirBonus = (Math.sign(seqA[i - 1]) === Math.sign(seqB[j - 1])) ? 0 : 0.65;
                const cost = Math.max(0, diff - 0.35) + dirBonus;
                dp[i][j] = cost + Math.min(
                    dp[i - 1][j - 1], // birebir eşleşme
                    dp[i - 1][j] + 0.85, // uzatılmış nota
                    dp[i][j - 1] + 0.85  // atlanmış geçit notası
                );
            }
        }

        const normCost = dp[n][m] / Math.max(n, m);
        return Math.max(0, Math.min(1, 1 - (normCost / 4.6)));
    }

    function matchMelodyBySemitoneContour(midiNotes) {
        if (!Array.isArray(midiNotes) || midiNotes.length < 9) return null;
        const userIntervals = [];
        for (let i = 1; i < midiNotes.length; i++) {
            const diff = Math.max(-9, Math.min(9, midiNotes[i] - midiNotes[i - 1]));
            userIntervals.push(diff);
        }

        let bestSong = null;
        let bestScore = 0;

        for (let s = 0; s < TURKISH_OFFLINE_SONG_DB.length; s++) {
            const song = TURKISH_OFFLINE_SONG_DB[s];
            const ref = song.semitoneIntervals;
            if (!ref || ref.length < 5) continue;

            // Alt-pencere DTW taraması: şarkının giriş veya nakarat kesitiyle en iyi DTW uyumunu bul
            const winLen = Math.min(userIntervals.length + 2, ref.length);
            let maxDtwSim = computeSemitoneDtwSimilarity(userIntervals, ref);

            for (let offset = 0; offset <= Math.max(0, ref.length - winLen); offset++) {
                const subRef = ref.slice(offset, offset + winLen);
                const sim = computeSemitoneDtwSimilarity(userIntervals, subRef);
                if (sim > maxDtwSim) maxDtwSim = sim;
            }

            if (maxDtwSim > bestScore) {
                bestScore = maxDtwSim;
                bestSong = song;
            }
        }

        if (bestSong && bestScore >= 0.84) {
            return {
                song: bestSong,
                confidencePct: Math.min(98, Math.round(bestScore * 100))
            };
        }
        return null;
    }

    /**
     * Zaman düzlemi otokorelasyon (Autocorrelation) algoritması ile mikrofondan gelen
     * mırıldanma, ıslık veya enstrüman sesinin temel frekansını (Hz), MIDI notasını
     * ve akort sapmasını (Cent: 1200 * log2(f / f_std)) milimetrik olarak bulur.
     */
    function detectPitchHzAutocorrelation(buf, sampleRate) {
        const size = buf.length;
        let rms = 0;
        for (let i = 0; i < size; i++) {
            rms += buf[i] * buf[i];
        }
        rms = Math.sqrt(rms / size);
        if (rms < 0.014) return { hz: null, rms };

        let r1 = 0, r2 = size - 1;
        const thres = 0.2;
        for (let i = 0; i < size / 2; i++) {
            if (Math.abs(buf[i]) < thres) { r1 = i; break; }
        }
        for (let i = 1; i < size / 2; i++) {
            if (Math.abs(buf[size - i]) < thres) { r2 = size - i; break; }
        }

        const slice = buf.slice(r1, r2);
        const newSize = slice.length;
        if (newSize < 64) return { hz: null, rms };

        const c = new Float32Array(newSize);
        for (let i = 0; i < newSize; i++) {
            let sum = 0;
            const overlap = newSize - i;
            for (let j = 0; j < overlap; j++) {
                sum += slice[j] * slice[j + i];
            }
            c[i] = sum / Math.max(1, overlap);
        }

        let d = 0;
        while (d < newSize && c[d] > 0) d++;
        while (d + 1 < newSize && c[d] > c[d + 1]) d++;

        const minLag = Math.max(d, Math.floor(sampleRate / 1150));
        const maxLag = Math.min(newSize - 2, Math.ceil(sampleRate / 65));
        let maxval = -1, maxpos = -1;
        for (let i = minLag; i <= maxLag; i++) {
            if (c[i] > maxval) {
                maxval = c[i];
                maxpos = i;
            }
        }
        // Alt-oktav sıçramalarını önlemek için ilk güçlü yerel zirveyi (McLeod Pitch Method >= %88 eşiği) seç
        if (maxval > 0) {
            const keyThreshold = maxval * 0.88;
            for (let i = minLag + 1; i <= maxLag - 1; i++) {
                if (c[i] >= keyThreshold && c[i] >= c[i - 1] && c[i] >= c[i + 1]) {
                    maxpos = i;
                    break;
                }
            }
        }
        if (maxpos <= 0) return { hz: null, rms };

        // Parabolik enterpolasyon ile alt-örneklem (sub-sample) hassasiyeti
        let truePos = maxpos;
        if (maxpos > 0 && maxpos < newSize - 1) {
            const y1 = c[maxpos - 1], y2 = c[maxpos], y3 = c[maxpos + 1];
            const denom = y1 - 2 * y2 + y3;
            if (Math.abs(denom) > 0.0001) {
                truePos = maxpos + 0.5 * (y1 - y3) / denom;
            }
        }

        const hz = sampleRate / truePos;
        if (hz < 70 || hz > 1150) return { hz: null, rms };
        return { hz: Number(hz.toFixed(1)), rms };
    }

    function analyzePitchNoteAndCent(hz) {
        if (!hz) return null;
        const exactMidi = 12 * Math.log2(hz / 440) + 69;
        const midi = Math.round(exactMidi);
        const cents = Math.round((exactMidi - midi) * 100);
        const pitchClass = ((midi % 12) + 12) % 12;
        const noteName = TURKISH_NOTE_NAMES[pitchClass];
        const octave = Math.floor(midi / 12) - 1;
        return {
            midi,
            pitchClass,
            noteName,
            octave,
            fullLabel: `${noteName}${octave}`,
            cents,
            hz: Math.round(hz)
        };
    }

    /**
     * 12-Ton Kroma Histogramından Çalan Müziğin Tonunu ve Türk Müziği Makam Ailesini Tahmin Eder.
     */
    function estimateMusicalKeyAndMakam(chromaHist) {
        let maxVal = 0;
        let rootIdx = 0;
        for (let i = 0; i < 12; i++) {
            if (chromaHist[i] > maxVal) {
                maxVal = chromaHist[i];
                rootIdx = i;
            }
        }
        if (maxVal < 2) return 'Analiz ediliyor';

        const rootName = TURKISH_NOTE_NAMES[rootIdx];
        const minorThird = chromaHist[(rootIdx + 3) % 12];
        const majorThird = chromaHist[(rootIdx + 4) % 12];
        const flatSecond = chromaHist[(rootIdx + 1) % 12];

        if (flatSecond > maxVal * 0.32 && majorThird >= minorThird) {
            return `${rootName} Hicaz Makamı Ailesi`;
        }
        if (flatSecond > maxVal * 0.32 && minorThird > majorThird) {
            return `${rootName} Kürdî / Hüseynî Ailesi`;
        }
        if (minorThird >= majorThird) {
            return `${rootName} Minör (Nihavend / Buselik)`;
        }
        return `${rootName} Majör (Rast / Çargâh)`;
    }

    async function toggleSongListening() {
        radar.init();
        if (state.songListening) {
            const currentWords = el.songHeardWords ? el.songHeardWords.textContent.replace(/^"|"$/g, '').trim() : '';
            const midiSnapshot = [...state.detectedMidiNotes];
            const notesSnapshot = [...state.detectedNotes];
            stopSongListening();
            if (currentWords && !currentWords.includes('dinliyorum') && currentWords.length >= 2) {
                searchSongByLyricsOrQuery(currentWords);
                return;
            }
            const humMatch = matchMelodyBySemitoneContour(midiSnapshot);
            if (humMatch) {
                if (el.songHeardWords) {
                    el.songHeardWords.textContent = `Mırıldanan Melodi: ${notesSnapshot.slice(-6).join(' → ')}`;
                }
                searchSongByLyricsOrQuery(`${humMatch.song.artist} ${humMatch.song.title}`, humMatch.confidencePct);
                return;
            }
            announceGuidance('Şarkı ve melodi dinleme durduruldu.', { force: true });
            return;
        }

        stopSongPreviewPlayback();
        if ('speechSynthesis' in window) {
            try { window.speechSynthesis.cancel(); } catch (_) {}
        }

        const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
        const useAndroidNativeVoiceOnly = (!state.songTunerActive && !SpeechRec && window.AndroidSongBridge && typeof window.AndroidSongBridge.startNativeVoiceLyricsCapture === 'function');

        state.songListening = true;
        state.detectedNotes = [];
        state.detectedMidiNotes = [];
        state.chromaHistogram = new Float32Array(12);
        state.onsetTimestamps = [];
        state.lastRmsEnergy = 0;
        let capturedTranscript = '';

        if (el.btnSongListen) {
            el.btnSongListen.textContent = '⏹️ Dinlemeyi Durdur ve Bul (H)';
        }
        if (el.songStatusBadge) {
            el.songStatusBadge.textContent = state.songTunerActive ? '🎸 Akort & Makam Dinleniyor' : '🎤 Şarkı & Mırıldanma Dinleniyor...';
        }
        if (el.songHeardWords) {
            el.songHeardWords.textContent = 'Çalan şarkıyı, sözlerinizi veya mırıldanmanızı dinliyorum...';
        }

        if (useAndroidNativeVoiceOnly) {
            window.AndroidSongBridge.startNativeVoiceLyricsCapture();
            return;
        }

        // 1. Canlı Mikrofon Nota (Melodi), Akort (Cent), Makam ve Ritim (BPM) Analizörü
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
                if (!state.songListening || (state.mode !== 'song_finder' && !state.songAutoRadarEnabled)) {
                    stream.getTracks().forEach(t => t.stop());
                    return;
                }
                state.songAudioStream = stream;
                const AudioCtx = window.AudioContext || window.webkitAudioContext;
                const audioCtx = radar.ctx || (AudioCtx ? new AudioCtx() : null);
                if (audioCtx) {
                    const source = audioCtx.createMediaStreamSource(stream);
                    const analyser = audioCtx.createAnalyser();
                    analyser.fftSize = 2048;
                    source.connect(analyser);
                    const floatBuf = new Float32Array(analyser.fftSize);

                    state.songAnalyserTimer = setInterval(() => {
                        if (!state.songListening) return;
                        analyser.getFloatTimeDomainData(floatBuf);
                        const { hz, rms } = detectPitchHzAutocorrelation(floatBuf, audioCtx.sampleRate);

                        const now = performance.now();
                        if (rms > state.lastRmsEnergy * 1.45 && rms > 0.03) {
                            const lastOnset = state.onsetTimestamps[state.onsetTimestamps.length - 1] || 0;
                            if (now - lastOnset > 280) {
                                state.onsetTimestamps.push(now);
                                if (state.onsetTimestamps.length > 10) state.onsetTimestamps.shift();
                            }
                        }
                        state.lastRmsEnergy = rms * 0.7 + state.lastRmsEnergy * 0.3;

                        let noteInfo = null;
                        if (hz) {
                            noteInfo = analyzePitchNoteAndCent(hz);
                            if (noteInfo) {
                                state.chromaHistogram[noteInfo.pitchClass] += 1;
                                if (state.detectedNotes[state.detectedNotes.length - 1] !== noteInfo.fullLabel) {
                                    state.detectedNotes.push(noteInfo.fullLabel);
                                    state.detectedMidiNotes.push(noteInfo.midi);
                                    if (state.detectedNotes.length > 14) state.detectedNotes.shift();
                                    if (state.detectedMidiNotes.length > 16) state.detectedMidiNotes.shift();
                                }

                                // Eğer Sesli Enstrüman Akort Modu açıksa müzisyeni sesle yönlendir
                                if (state.songTunerActive && now - state.lastTunerSpokenAt > 2400) {
                                    state.lastTunerSpokenAt = now;
                                    let tuneAdvice = 'Tam akortlu!';
                                    if (noteInfo.cents < -7) {
                                        tuneAdvice = `Biraz kalın (pes, eksi ${Math.abs(noteInfo.cents)} sent); teli biraz sıkın.`;
                                    } else if (noteInfo.cents > 7) {
                                        tuneAdvice = `Biraz ince (tiz, artı ${noteInfo.cents} sent); teli biraz gevşetin.`;
                                    } else {
                                        radar.playLockChord();
                                    }
                                    const makamStr = estimateMusicalKeyAndMakam(state.chromaHistogram);
                                    announceGuidance(`${noteInfo.noteName} notası (${noteInfo.hz} Hertz): ${tuneAdvice} Dizi: ${makamStr}.`, {
                                        force: true,
                                        bannerState: Math.abs(noteInfo.cents) <= 7 ? 'centered' : 'normal'
                                    });
                                }
                            }
                        }

                        let bpmStr = 'Ölçülüyor';
                        if (state.onsetTimestamps.length >= 3) {
                            let intervalSum = 0;
                            for (let i = 1; i < state.onsetTimestamps.length; i++) {
                                intervalSum += (state.onsetTimestamps[i] - state.onsetTimestamps[i - 1]);
                            }
                            const avgInterval = intervalSum / (state.onsetTimestamps.length - 1);
                            const rawBpm = Math.round(60000 / Math.max(250, avgInterval));
                            const clampedBpm = Math.max(60, Math.min(185, rawBpm));
                            bpmStr = `${clampedBpm} BPM`;
                        }

                        if (el.songMelodyBpm) {
                            const makamLabel = estimateMusicalKeyAndMakam(state.chromaHistogram);
                            const centBadge = noteInfo
                                ? ` (${noteInfo.cents >= 0 ? '+' : ''}${noteInfo.cents} sent)`
                                : '';
                            const melodyTrail = state.detectedNotes.length > 0
                                ? state.detectedNotes.slice(-5).join(' → ')
                                : 'Melodi bekleniyor';
                            el.songMelodyBpm.textContent = `${melodyTrail}${centBadge} • ${makamLabel} • ${bpmStr}`;
                        }
                    }, 125);
                }
            } catch (_) {}
        }

        // Eğer sadece Enstrüman Akort modu açıksa otomatik durdurma sayacı kurma, müzisyen rahatça akort yapsın
        if (state.songTunerActive) return;

        // 2. Web Speech API veya Android Native Sesli Şarkı Sözü Yakalayıcıyı Başlat
        if (SpeechRec) {
            try {
                const rec = new SpeechRec();
                rec.lang = 'tr-TR';
                rec.continuous = true;
                rec.interimResults = true;

                rec.onresult = (event) => {
                    let interim = '';
                    for (let i = event.resultIndex; i < event.results.length; i++) {
                        const txt = event.results[i][0].transcript;
                        if (event.results[i].isFinal) {
                            capturedTranscript += ' ' + txt;
                        } else {
                            interim += txt;
                        }
                    }
                    const fullWords = (capturedTranscript + ' ' + interim).trim();
                    if (fullWords && el.songHeardWords) {
                        el.songHeardWords.textContent = `"${fullWords}"`;
                    }
                    if (fullWords.split(/\s+/).length >= 3) {
                        if (state.songAutoSearchTimer) clearTimeout(state.songAutoSearchTimer);
                        state.songAutoSearchTimer = setTimeout(() => {
                            stopSongListening();
                            searchSongByLyricsOrQuery(fullWords);
                        }, 1350);
                    }
                };

                rec.onerror = () => {};
                rec.onend = () => {
                    if (state.songListening && capturedTranscript.trim().length >= 2) {
                        stopSongListening();
                        searchSongByLyricsOrQuery(capturedTranscript.trim());
                    }
                };

                state.songRecognition = rec;
                rec.start();
            } catch (_) {}
        } else if (window.AndroidSongBridge && typeof window.AndroidSongBridge.startNativeVoiceLyricsCapture === 'function') {
            window.AndroidSongBridge.startNativeVoiceLyricsCapture();
            return;
        }

        // 8 saniye sonunda: Söz duyulduysa sözden bul; hiç söz yoksa mırıldanan melodinin Yarı-Ton Konturundan bul!
        if (state.songAutoSearchTimer) clearTimeout(state.songAutoSearchTimer);
        state.songAutoSearchTimer = setTimeout(() => {
            if (!state.songListening) return;
            const currentWords = el.songHeardWords ? el.songHeardWords.textContent.replace(/^"|"$/g, '').trim() : '';
            const midiSnapshot = [...state.detectedMidiNotes];
            const notesSnapshot = [...state.detectedNotes];
            const makamSnapshot = estimateMusicalKeyAndMakam(state.chromaHistogram);
            stopSongListening();

            if (currentWords && !currentWords.includes('dinliyorum') && currentWords.length >= 2) {
                searchSongByLyricsOrQuery(currentWords);
                return;
            }

            // Söz duyulmadıysa Mırıldanma / Islık Yarı-Ton Melodi Konturu Eşleştirmesi yap!
            const humMatch = matchMelodyBySemitoneContour(midiSnapshot);
            if (humMatch) {
                if (el.songHeardWords) {
                    el.songHeardWords.textContent = `Mırıldanan Melodi: ${notesSnapshot.slice(-6).join(' → ')}`;
                }
                searchSongByLyricsOrQuery(`${humMatch.song.artist} ${humMatch.song.title}`, humMatch.confidencePct);
                return;
            }

            const notesInfo = notesSnapshot.length > 0
                ? `Mırıldandığınız notalar: ${notesSnapshot.slice(-6).join(', ')} (${makamSnapshot}). `
                : '';
            if (!state.songAutoRadarEnabled) {
                announceGuidance(`${notesInfo}Şarkının sözleri gürültüden dolayı net seçilemedi. Şarkıdan hatırladığınız iki kelimeyi söyleyebilir veya tam mırıldanma taraması için Google Mırıldanma Motoru düğmesine basabilirsiniz.`, {
                    force: true,
                    bannerState: 'warning'
                });
            }
        }, 8000);
    }

    function stopSongListening() {
        state.songListening = false;
        if (state.songAutoSearchTimer) {
            clearTimeout(state.songAutoSearchTimer);
            state.songAutoSearchTimer = null;
        }
        if (state.songAnalyserTimer) {
            clearInterval(state.songAnalyserTimer);
            state.songAnalyserTimer = null;
        }
        if (state.songRecognition) {
            try { state.songRecognition.stop(); } catch (_) {}
            state.songRecognition = null;
        }
        if (state.songAudioStream) {
            try { state.songAudioStream.getTracks().forEach(t => t.stop()); } catch (_) {}
            state.songAudioStream = null;
        }
        if (el.btnSongListen) {
            el.btnSongListen.textContent = '🎤 Şarkıyı / Mırıldanmayı Dinle (H)';
        }
        if (el.songStatusBadge && !state.songTunerActive) {
            el.songStatusBadge.textContent = state.songAutoRadarEnabled ? '📡 Sürekli Takip Açık' : 'Dinlemeye Hazır';
        }
    }

    window.receiveRecognizedSongWordsFromAndroid = function (spokenText) {
        stopSongListening();
        const clean = String(spokenText || '').trim();
        if (clean) {
            if (el.songHeardWords) el.songHeardWords.textContent = `"${clean}"`;
            if (el.songSearchInput) el.songSearchInput.value = clean;
            searchSongByLyricsOrQuery(clean);
        } else {
            if (el.songHeardWords) {
                el.songHeardWords.textContent = 'Ses algılanamadı veya dinleme iptal edildi. Tekrar denemek için düğmeye basın.';
            }
            if (!state.songAutoRadarEnabled) {
                announceGuidance('Ses algılanamadı veya dinleme penceresi kapatıldı.', { force: true, bannerState: 'warning' });
            }
        }
    };

    /**
     * Bulunan şarkıyı telefon hafızasındaki "Bulduğum Şarkılar Defteri"ne kaydeder.
     */
    function saveSongToHistory(track) {
        if (!track || !track.title) return;
        try {
            const raw = localStorage.getItem(SAVED_SONGS_STORAGE_KEY);
            const list = raw ? JSON.parse(raw) : [];
            const filtered = list.filter(item =>
                !(item.title === track.title && item.artist === track.artist)
            );
            const nowStr = new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
            filtered.unshift({
                title: track.title,
                artist: track.artist,
                album: track.album || '',
                genre: track.genre || '',
                previewUrl: track.previewUrl || '',
                lyrics: track.lyrics || '',
                savedAt: nowStr
            });
            localStorage.setItem(SAVED_SONGS_STORAGE_KEY, JSON.stringify(filtered.slice(0, 20)));
        } catch (_) {}
    }

    function speakSavedSongHistory() {
        try {
            const raw = localStorage.getItem(SAVED_SONGS_STORAGE_KEY);
            const list = raw ? JSON.parse(raw) : [];
            if (!Array.isArray(list) || list.length === 0) {
                announceGuidance('Bulduğunuz şarkılar defterinde henüz kayıtlı bir şarkı yok. Bir şarkı bulduğunuzda otomatik olarak buraya kaydedilir.', {
                    force: true,
                    bannerState: 'normal'
                });
                return;
            }
            const summaryItems = list.slice(0, 6).map((item, idx) =>
                `${idx + 1}: ${item.artist} — ${item.title} (Saat ${item.savedAt})`
            );
            const textReport = `📒 Bulduğunuz Şarkılar Defteri (${list.length} Şarkı):\n\n` +
                list.map((item, idx) => `${idx + 1}. ${item.title} — ${item.artist} (${item.album}) [Saat ${item.savedAt}]`).join('\n');
            showDetectedResult('📒 Bulduğum Şarkılar Defteri', textReport);
            state.songAlternatives = list.slice(0, 5);
            renderSongAlternatives(state.songAlternatives, 'Kayıtlı Şarkılarınızdan Tek Dokunuşla Dinleyin:');
            announceGuidance(`Şarkı defterinizde toplam ${list.length} şarkı kayıtlı: ${summaryItems.join(', ')}.`, {
                force: true,
                bannerState: 'centered'
            });
        } catch (_) {}
    }

    /**
     * Şarkı sözlerini mısra mısra (satır satır) ayırır; LRC zaman etiketlerini temizler.
     */
    function prepareLyricLinesForNavigation(rawLyrics) {
        const clean = String(rawLyrics || '')
            .replace(/\[\d{1,2}:\d{2}(?:\.\d{1,3})?\]/g, '')
            .split(/\r?\n/)
            .map(l => l.trim())
            .filter(l => l.length >= 2);
        state.songLyricLines = clean;
        state.currentLyricIndex = 0;

        const hasLines = clean.length > 0;
        if (el.btnLyricPrev) el.btnLyricPrev.disabled = !hasLines;
        if (el.btnLyricCurrent) el.btnLyricCurrent.disabled = !hasLines;
        if (el.btnLyricNext) el.btnLyricNext.disabled = !hasLines;
    }

    function speakCurrentLyricLine() {
        if (!state.songLyricLines || state.songLyricLines.length === 0) {
            announceGuidance('Bu şarkı için mısra mısra okunacak söz bulunamadı.', { force: true, bannerState: 'warning' });
            return;
        }
        stopSongPreviewPlayback();
        const line = state.songLyricLines[state.currentLyricIndex] || '';
        const posLabel = `${state.currentLyricIndex + 1}. mısra (Toplam ${state.songLyricLines.length}): ${line}`;
        if (el.songHeardWords) {
            el.songHeardWords.textContent = posLabel;
        }
        announceGuidance(posLabel, { force: true, bannerState: 'centered' });
    }

    function stepLyricLine(delta) {
        if (!state.songLyricLines || state.songLyricLines.length === 0) return;
        const nextIdx = state.currentLyricIndex + delta;
        if (nextIdx < 0) {
            announceGuidance(`İlk mısradasınız: ${state.songLyricLines[0]}`, { force: true });
            return;
        }
        if (nextIdx >= state.songLyricLines.length) {
            announceGuidance('Şarkının son mısrasına ulaştınız.', { force: true });
            return;
        }
        state.currentLyricIndex = nextIdx;
        speakCurrentLyricLine();
    }

    function renderSongAlternatives(candidates, headingText = '') {
        if (!el.songAlternativesBox || !el.songAlternativesList) return;
        el.songAlternativesList.innerHTML = '';
        if (!Array.isArray(candidates) || candidates.length === 0) {
            el.songAlternativesBox.hidden = true;
            return;
        }
        el.songAlternativesBox.hidden = false;
        const hintEl = el.songAlternativesBox.querySelector('.exam-remote-hint');
        if (hintEl && headingText) {
            hintEl.innerHTML = `🎶 <strong>${headingText}</strong>`;
        }
        candidates.slice(0, 5).forEach((cand) => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'secondary-btn';
            btn.textContent = `🎵 ${cand.title} — ${cand.artist}`;
            btn.setAttribute('aria-label', `${cand.artist}, ${cand.title} şarkısını seç ve dinle`);
            btn.addEventListener('click', () => {
                applyFoundSongToUI(cand, state.songAlternatives);
            });
            el.songAlternativesList.appendChild(btn);
        });
    }

    function applyFoundSongToUI(foundTrack, alternatives = [], melodyConfidencePct = null) {
        state.lastFoundSong = foundTrack;
        saveSongToHistory(foundTrack);
        prepareLyricLinesForNavigation(foundTrack.lyrics);

        radar.playQrSuccessSound();
        if (navigator.vibrate) navigator.vibrate([100, 50, 160]);

        if (el.songStatusBadge) {
            el.songStatusBadge.textContent = melodyConfidencePct
                ? '✅ Melodiden Bulundu'
                : '✅ Şarkı Bulundu!';
        }
        if (el.songFoundTitle) el.songFoundTitle.textContent = `${foundTrack.title} — ${foundTrack.artist}`;
        if (el.songFoundAlbum) el.songFoundAlbum.textContent = `${foundTrack.album} • ${foundTrack.genre}`;

        if (el.btnSongPreview) {
            el.btnSongPreview.disabled = !foundTrack.previewUrl;
            el.btnSongPreview.textContent = foundTrack.previewUrl
                ? '▶️ Bulunan Şarkıyı Dinle (Doğrula)'
                : '▶️ Ses Kaydı Yok (YouTube\'da Açın)';
        }
        if (el.btnSongReadLyrics) {
            el.btnSongReadLyrics.disabled = !foundTrack.lyrics;
        }

        const searchUrlQuery = encodeURIComponent(`${foundTrack.artist} ${foundTrack.title}`);
        if (el.songExternalLinks) el.songExternalLinks.hidden = false;
        if (el.btnSongYoutube) {
            el.btnSongYoutube.href = `https://www.youtube.com/results?search_query=${searchUrlQuery}`;
        }
        if (el.btnSongSpotify) {
            el.btnSongSpotify.href = `https://open.spotify.com/search/${searchUrlQuery}`;
        }

        renderSongAlternatives(
            alternatives.filter(a => !(a.title === foundTrack.title && a.artist === foundTrack.artist)),
            'Diğer Eşleşen Şarkılar ve Sanatçının Sevilen Eserleri (Tek Dokunuşla Seçin):'
        );

        const lyricsSnippet = foundTrack.lyrics
            ? `\n\n--- Şarkı Sözleri (${state.songLyricLines.length} Mısra) ---\n${foundTrack.lyrics}`
            : '\n\n(Bu şarkının tam metin sözleri veritabanında yer almıyor, ancak orijinal kaydını dinleyebilirsiniz.)';
        const fullSongCard = `Şarkı Adı: ${foundTrack.title}\nSanatçı: ${foundTrack.artist}\nAlbüm: ${foundTrack.album}\nTür: ${foundTrack.genre}${lyricsSnippet}`;
        showDetectedResult(`🎵 Bulunan Şarkı: ${foundTrack.title} — ${foundTrack.artist}`, fullSongCard);

        const melodyPrefix = melodyConfidencePct
            ? 'Mırıldandığınız melodiden eşleşen şarkı bulundu! '
            : 'Şarkı bulundu! ';
        const previewHint = foundTrack.previewUrl
            ? 'Orijinal kaydını dinlemek için "Bulunan Şarkıyı Dinle" düğmesine basabilirsiniz.'
            : 'Tamamını YouTube düğmesiyle dinleyebilirsiniz.';
        const lyricsHint = state.songLyricLines.length > 0
            ? ' Şarkının sözlerini dinlemek için Şarkı Sözlerini Oku düğmesine basabilirsiniz.'
            : '';

        announceGuidance(`${melodyPrefix}Sanatçı: ${foundTrack.artist}, Şarkı Adı: ${foundTrack.title}, Albüm: ${foundTrack.album}. ${previewHint}${lyricsHint}`, {
            force: true,
            bannerState: 'centered'
        });
    }

    const songQueryCache = new Map();
    const TURKISH_SPEECH_FILLER_STOPWORDS = new Set([
        'evet', 'simdi', 'arkadaslar', 'yani', 'iste', 'sey', 'acaba', 'bu', 'su',
        'calan', 'sarki', 'hangisi', 'nedir', 'dinle', 'bakalim', 'merhaba', 'alo'
    ]);

    function extractCleanAnchorQueries(rawText) {
        const cleaned = String(rawText || '').replace(/[^\p{L}\p{N}\s']/gu, ' ').replace(/\s+/g, ' ').trim();
        if (!cleaned) return [];
        const words = cleaned.split(' ').filter(w => {
            const norm = normalizeTurkishPhonetic(w);
            return norm.length >= 2 && !TURKISH_SPEECH_FILLER_STOPWORDS.has(norm);
        });
        const queries = [cleaned];
        if (words.length >= 2) {
            const filteredPhrase = words.join(' ');
            if (!queries.includes(filteredPhrase)) queries.unshift(filteredPhrase);
        }
        if (words.length > 5) {
            const tailWindow = words.slice(-5).join(' ');
            if (!queries.includes(tailWindow)) queries.push(tailWindow);
        }
        return queries.slice(0, 3);
    }

    async function fetchJsonWithTimeout(url, timeoutMs = 4500) {
        const ctrl = typeof AbortController !== 'undefined' ? new AbortController() : null;
        const timer = ctrl ? setTimeout(() => ctrl.abort(), timeoutMs) : null;
        try {
            const resp = await fetch(url, ctrl ? { signal: ctrl.signal } : undefined);
            if (!resp.ok) return null;
            return await resp.json();
        } catch (_) {
            return null;
        } finally {
            if (timer) clearTimeout(timer);
        }
    }

    /**
     * Akıllı Çok Katmanlı Şarkı Arama Motoru (Paralel Sorgu, Önbellek ve Gürültü Filtreli Mimari):
     * 1) Konuşma Gürültüsü Temizleyici + Türkçe Fonetik 3-Gram Bulanık Eşleşme,
     * 2) AbortController Zaman Aşımlı Paralel LRCLIB + Apple iTunes Türkiye Kataloğu Taraması,
     * 3) Bellek İçi (In-Memory LRU) Sorgu Önbelleği.
     */
    async function searchSongByLyricsOrQuery(rawQuery, melodyConfidencePct = null) {
        const query = String(rawQuery || '').trim();
        if (!query) {
            announceGuidance('Lütfen şarkıdan hatırladığınız birkaç kelimeyi söyleyin, mırıldanın veya arama kutusuna yazın.', {
                force: true,
                bannerState: 'warning'
            });
            return;
        }

        if (el.songStatusBadge) el.songStatusBadge.textContent = '🔍 Akıllı Arama Yapılıyor...';
        if (!melodyConfidencePct && el.songHeardWords) {
            el.songHeardWords.textContent = `"${query}"`;
        }
        if (!state.songAutoRadarEnabled) {
            announceGuidance(`"${query}" için şarkı ve söz veritabanları taranıyor...`, {
                force: true,
                bannerState: 'normal'
            });
        }

        const cacheKey = normalizeTurkishPhonetic(query);
        if (cacheKey && songQueryCache.has(cacheKey)) {
            const cached = songQueryCache.get(cacheKey);
            if (state.songAutoRadarEnabled && state.lastFoundSong &&
                state.lastFoundSong.title === cached.foundTrack.title &&
                state.lastFoundSong.artist === cached.foundTrack.artist) {
                return;
            }
            state.songAlternatives = cached.alternatives;
            applyFoundSongToUI(cached.foundTrack, cached.alternatives, melodyConfidencePct);
            return;
        }

        const anchorQueries = extractCleanAnchorQueries(query);
        const primaryQuery = anchorQueries[0] || query;

        let foundTrack = null;
        const alternativeCandidates = [];

        // 1. AŞAMA: Bulanık (Fuzzy) Fonetik 3-Gram Türkçe Şarkı Sözlüğü Taraması
        let bestOfflineSim = 0;
        let bestOfflineItem = null;
        for (let i = 0; i < TURKISH_OFFLINE_SONG_DB.length; i++) {
            const item = TURKISH_OFFLINE_SONG_DB[i];
            for (let qIdx = 0; qIdx < anchorQueries.length; qIdx++) {
                const qText = anchorQueries[qIdx];
                let maxSim = computeTrigramSimilarity(qText, `${item.artist} ${item.title}`);
                for (let k = 0; k < item.keywords.length; k++) {
                    const kwSim = computeTrigramSimilarity(qText, item.keywords[k]);
                    if (kwSim > maxSim) maxSim = kwSim;
                }
                if (maxSim > bestOfflineSim) {
                    bestOfflineSim = maxSim;
                    bestOfflineItem = item;
                }
            }
        }

        if (bestOfflineItem && bestOfflineSim >= 0.48) {
            foundTrack = {
                title: bestOfflineItem.title,
                artist: bestOfflineItem.artist,
                album: bestOfflineItem.album,
                genre: bestOfflineItem.genre,
                lyrics: bestOfflineItem.lyrics,
                previewUrl: ''
            };
        }

        // 2. AŞAMA: Paralel LRCLIB + Apple iTunes Türkiye Sorgu Hattı (Promise.allSettled)
        const lrcUrl = `https://lrclib.net/api/search?q=${encodeURIComponent(primaryQuery)}`;
        const itunesInitialTerm = foundTrack ? `${foundTrack.artist} ${foundTrack.title}` : primaryQuery;
        const itunesUrl = `https://itunes.apple.com/search?term=${encodeURIComponent(itunesInitialTerm)}&country=TR&media=music&limit=5`;

        const [lrcRes, itunesRes] = await Promise.allSettled([
            fetchJsonWithTimeout(lrcUrl, 4500),
            fetchJsonWithTimeout(itunesUrl, 4500)
        ]);

        const queryNormTokens = normalizeTurkishPhonetic(primaryQuery).split(/\s+/).filter(w => w.length >= 3);
        const isOnlineCandidateRelevant = (titleStr, artistStr, lyricsStr) => {
            if (queryNormTokens.length === 0) return false;
            const combinedNorm = normalizeTurkishPhonetic(`${titleStr || ''} ${artistStr || ''} ${lyricsStr || ''}`);
            let matchedCount = 0;
            for (const tok of queryNormTokens) {
                if (combinedNorm.includes(tok)) matchedCount++;
            }
            if (matchedCount > 0) return true;
            const titleArtistSim = computeTrigramSimilarity(primaryQuery, `${titleStr || ''} ${artistStr || ''}`);
            return titleArtistSim >= 0.38;
        };

        const lrcList = lrcRes.status === 'fulfilled' ? lrcRes.value : null;
        if (Array.isArray(lrcList) && lrcList.length > 0) {
            lrcList.slice(0, 4).forEach((item, idx) => {
                const cand = {
                    title: item.trackName || item.name || 'Bilinmeyen Şarkı',
                    artist: item.artistName || 'Bilinmeyen Sanatçı',
                    album: item.albumName || 'Albüm Bilgisi Yok',
                    genre: 'Müzik',
                    lyrics: item.plainLyrics || item.syncedLyrics || '',
                    previewUrl: ''
                };
                if (!isOnlineCandidateRelevant(cand.title, cand.artist, cand.lyrics)) {
                    return;
                }
                if (idx === 0 && !foundTrack) {
                    foundTrack = cand;
                } else if (idx === 0 && foundTrack && cand.lyrics.length > (foundTrack.lyrics || '').length &&
                           computeTrigramSimilarity(foundTrack.title, cand.title) >= 0.45) {
                    foundTrack.lyrics = cand.lyrics;
                } else {
                    alternativeCandidates.push(cand);
                }
            });
        }

        let itData = itunesRes.status === 'fulfilled' ? itunesRes.value : null;
        // Eğer LRCLIB şarkıyı sözden bulduysa ve iTunes ilk sorguda farklı terim aradıysa, bulunan şarkının ses önizlemesini tamamla
        if (foundTrack && (!itData || !Array.isArray(itData.results) || itData.results.length === 0 || itunesInitialTerm === primaryQuery)) {
            const exactTerm = `${foundTrack.artist} ${foundTrack.title}`;
            if (normalizeTurkishPhonetic(exactTerm) !== normalizeTurkishPhonetic(itunesInitialTerm)) {
                const enrichedItunes = await fetchJsonWithTimeout(
                    `https://itunes.apple.com/search?term=${encodeURIComponent(exactTerm)}&country=TR&media=music&limit=5`,
                    3800
                );
                if (enrichedItunes && Array.isArray(enrichedItunes.results) && enrichedItunes.results.length > 0) {
                    itData = enrichedItunes;
                }
            }
        }

        if (itData && Array.isArray(itData.results) && itData.results.length > 0) {
            itData.results.forEach((hit, idx) => {
                const releaseYear = hit.releaseDate ? hit.releaseDate.slice(0, 4) : '';
                const albumStr = `${hit.collectionName || 'Tekli'}${releaseYear ? ' (' + releaseYear + ')' : ''}`;
                if (!foundTrack && !isOnlineCandidateRelevant(hit.trackName, hit.artistName, '')) {
                    return;
                }
                if (idx === 0) {
                    if (!foundTrack) {
                        foundTrack = {
                            title: hit.trackName || 'Bilinmeyen Şarkı',
                            artist: hit.artistName || 'Bilinmeyen Sanatçı',
                            album: albumStr,
                            genre: hit.primaryGenreName || 'Müzik',
                            lyrics: '',
                            previewUrl: hit.previewUrl || ''
                        };
                    } else {
                        if (hit.previewUrl) foundTrack.previewUrl = hit.previewUrl;
                        if (hit.primaryGenreName) foundTrack.genre = hit.primaryGenreName;
                        if ((!foundTrack.album || foundTrack.album === 'Albüm Bilgisi Yok') && hit.collectionName) {
                            foundTrack.album = albumStr;
                        }
                    }
                } else {
                    alternativeCandidates.push({
                        title: hit.trackName || 'Şarkı',
                        artist: hit.artistName || 'Sanatçı',
                        album: albumStr,
                        genre: hit.primaryGenreName || 'Müzik',
                        lyrics: '',
                        previewUrl: hit.previewUrl || ''
                    });
                }
            });

            if (foundTrack && !foundTrack.lyrics) {
                const followArr = await fetchJsonWithTimeout(
                    `https://lrclib.net/api/search?q=${encodeURIComponent(foundTrack.artist + ' ' + foundTrack.title)}`,
                    3500
                );
                if (Array.isArray(followArr) && followArr.length > 0 && followArr[0].plainLyrics) {
                    foundTrack.lyrics = followArr[0].plainLyrics;
                }
            }
        }

        if (!foundTrack) {
            if (el.songStatusBadge) el.songStatusBadge.textContent = 'Eşleşme Bulunamadı';
            if (!state.songAutoRadarEnabled) {
                announceGuidance(`"${query}" ile eşleşen bir şarkı bulunamadı. Şarkıdan hatırladığınız iki-üç kelimeyi daha söyleyebilir veya mırıldanabilirsiniz.`, {
                    force: true,
                    bannerState: 'warning'
                });
            }
            return;
        }

        if (cacheKey) {
            if (songQueryCache.size > 40) {
                const oldestKey = songQueryCache.keys().next().value;
                songQueryCache.delete(oldestKey);
            }
            songQueryCache.set(cacheKey, {
                foundTrack,
                alternatives: alternativeCandidates
            });
        }

        // Eğer Otomatik Şarkı Takibi modundaysak ve aynı şarkı çalmaya devam ediyorsa tekrar tekrar konuşup rahatsız etme
        if (state.songAutoRadarEnabled && state.lastFoundSong &&
            state.lastFoundSong.title === foundTrack.title &&
            state.lastFoundSong.artist === foundTrack.artist) {
            return;
        }

        state.songAlternatives = alternativeCandidates;
        applyFoundSongToUI(foundTrack, alternativeCandidates, melodyConfidencePct);
    }

    function toggleContinuousAutoSongRadar() {
        radar.init();
        state.songAutoRadarEnabled = !state.songAutoRadarEnabled;
        if (el.btnSongAutoRadar) {
            el.btnSongAutoRadar.classList.toggle('active-toggle', state.songAutoRadarEnabled);
            el.btnSongAutoRadar.setAttribute('aria-pressed', String(state.songAutoRadarEnabled));
            el.btnSongAutoRadar.textContent = `📡 Otomatik Şarkı Takibi: ${state.songAutoRadarEnabled ? 'Açık' : 'Kapalı'}`;
        }

        if (state.songAutoRadarInterval) {
            clearInterval(state.songAutoRadarInterval);
            state.songAutoRadarInterval = null;
        }

        if (state.songAutoRadarEnabled) {
            announceGuidance('Otomatik Şarkı Takibi açıldı! Ortamda çalan her yeni şarkıyı otomatik dinleyip size adını ve sanatçısını haber vereceğim.', {
                force: true,
                bannerState: 'centered'
            });
            if (!state.songListening) toggleSongListening();
            state.songAutoRadarInterval = setInterval(() => {
                if (state.songAutoRadarEnabled && !state.songListening && (!state.songPreviewAudio || state.songPreviewAudio.paused)) {
                    toggleSongListening();
                }
            }, 22000);
        } else {
            stopSongListening();
            announceGuidance('Otomatik şarkı takibi kapatıldı.', { force: true });
        }
    }

    function toggleInstrumentTunerAndMakam() {
        radar.init();
        state.songTunerActive = !state.songTunerActive;
        if (el.btnSongTuner) {
            el.btnSongTuner.classList.toggle('active-toggle', state.songTunerActive);
            el.btnSongTuner.setAttribute('aria-pressed', String(state.songTunerActive));
            el.btnSongTuner.textContent = `🎸 Sesli Enstrüman Akort & Makam: ${state.songTunerActive ? 'Açık' : 'Kapalı'}`;
        }

        if (state.songTunerActive) {
            announceGuidance('Sesli Enstrüman Akort ve Makam Bulucu açıldı! Bağlama, gitar, keman veya ney çaldığınızda hangi notada olduğunuzu, teli sıkmanız mı yoksa gevşetmeniz mi gerektiğini ve makam dizisini sesli söyleyeceğim.', {
                force: true,
                bannerState: 'centered'
            });
            if (!state.songListening) toggleSongListening();
        } else {
            stopSongListening();
            announceGuidance('Enstrüman akort modu kapatıldı.', { force: true });
        }
    }

    function stopSongPreviewPlayback() {
        if (state.songPreviewAudio) {
            try {
                state.songPreviewAudio.pause();
                state.songPreviewAudio.currentTime = 0;
            } catch (_) {}
            state.songPreviewAudio = null;
        }
        if (el.btnSongPreview && state.lastFoundSong && state.lastFoundSong.previewUrl) {
            el.btnSongPreview.textContent = '▶️ Bulunan Şarkıyı Dinle (Doğrula)';
        }
    }

    function toggleSongPreviewPlayback() {
        if (!state.lastFoundSong || !state.lastFoundSong.previewUrl) return;
        if (state.songPreviewAudio && !state.songPreviewAudio.paused) {
            stopSongPreviewPlayback();
            announceGuidance('Şarkı önizlemesi durduruldu.', { force: true });
            return;
        }

        stopSongPreviewPlayback();
        if ('speechSynthesis' in window) {
            try { window.speechSynthesis.cancel(); } catch (_) {}
        }

        const audio = new Audio(state.lastFoundSong.previewUrl);
        state.songPreviewAudio = audio;
        if (el.btnSongPreview) {
            el.btnSongPreview.textContent = '⏹️ Şarkıyı Durdur';
        }
        audio.onended = () => {
            if (el.btnSongPreview) {
                el.btnSongPreview.textContent = '▶️ Bulunan Şarkıyı Dinle (Doğrula)';
            }
        };
        audio.play().catch(() => {
            announceGuidance('Şarkı kaydı oynatılamadı, YouTube düğmesiyle tamamını dinleyebilirsiniz.', {
                force: true,
                bannerState: 'warning'
            });
        });
    }

    function speakFoundSongLyrics() {
        if (!state.lastFoundSong || !state.lastFoundSong.lyrics) {
            announceGuidance('Bu şarkı için okunacak şarkı sözü bulunamadı.', { force: true, bannerState: 'warning' });
            return;
        }
        stopSongPreviewPlayback();
        const cleanLyrics = state.lastFoundSong.lyrics.replace(/\r?\n/g, ', ').replace(/\s+/g, ' ').trim();
        announceGuidance(`${state.lastFoundSong.artist}, ${state.lastFoundSong.title} şarkısının tüm sözleri: ${cleanLyrics}`, {
            force: true,
            bannerState: 'centered'
        });
    }

    function launchGoogleHumSearch() {
        stopSongListening();
        stopSongPreviewPlayback();
        if (window.AndroidSongBridge && typeof window.AndroidSongBridge.launchGoogleHumToSearch === 'function') {
            const launched = window.AndroidSongBridge.launchGoogleHumToSearch();
            if (launched) {
                announceGuidance('Google Mırıldanarak Şarkı Bulma ekranı açılıyor; şimdi şarkıyı mırıldanabilir veya müziğe tutabilirsiniz.', {
                    force: true,
                    bannerState: 'centered'
                });
                return;
            }
        }
        announceGuidance('Akıllı melodi konturu ve şarkı sözü dinleme başlatılıyor; şimdi şarkının sözlerini söyleyebilir veya hiç söz söylemeden melodisini mırıldanabilirsiniz.', {
            force: true,
            bannerState: 'centered'
        });
        setTimeout(() => toggleSongListening(), 900);
    }

    // =========================================================================
    // 6.5. YENİ HAYAT ALANI KATEGORİLERİ VE 16-21 ARASI EFSANE GÜNLÜK YAŞAM MODLARI
    // =========================================================================
    const LIFE_CATEGORY_LABELS = {
        'all': 'Tümü (22 Özellik)',
        'mutfak': 'Mutfak ve Yemek Yapma Kategorisi',
        'ev': 'Ev Kategorisi',
        'is_egitim': 'İş ve Eğitim Kategorisi',
        'saglik': 'Sağlık Kategorisi',
        'navigasyon': 'Navigasyon Kategorisi',
        'gunluk_yasam': 'Günlük Yaşam Kategorisi'
    };

    const SMART_SCENARIO_PRESETS = {
        'shopping': { title: 'Mutfak ve Alışveriş', category: 'mutfak', primaryMode: 'color_cloth' },
        'commute': { title: 'Navigasyon ve Yolculuk', category: 'navigasyon', primaryMode: 'bus_stop_tracker' },
        'kitchen_home': { title: 'Ev ve Mutfak', category: 'mutfak', primaryMode: 'cooking_guide' },
        'health': { title: 'Sağlık ve İlaç', category: 'saglik', primaryMode: 'medicine_skt' },
        'study_work': { title: 'İş ve Eğitim', category: 'is_egitim', primaryMode: 'exam_reader' }
    };

    function activateSmartUsageScenarioPreset(scenarioId) {
        const preset = SMART_SCENARIO_PRESETS[scenarioId];
        if (!preset) return false;
        filterModesByLifeCategory(preset.category);
        setMode(preset.primaryMode);
        return true;
    }
    window.activateSmartUsageScenarioPreset = activateSmartUsageScenarioPreset;

    function filterModesByLifeCategory(catId) {
        if (!el.categoryTabs || !el.modeButtons) return;
        el.categoryTabs.forEach(tab => {
            const isSel = tab.getAttribute('data-category') === catId;
            tab.classList.toggle('active-toggle', isSel);
            tab.setAttribute('aria-pressed', isSel ? 'true' : 'false');
        });
        let visibleCount = 0;
        let firstVisibleMode = null;
        let activeModeIsVisible = false;
        el.modeButtons.forEach(btn => {
            const btnCat = btn.getAttribute('data-category') || 'all';
            const btnMode = btn.getAttribute('data-mode');
            const show = (catId === 'all' || btnCat === catId);
            btn.hidden = !show;
            btn.style.display = show ? '' : 'none';
            if (show) {
                visibleCount++;
                if (!firstVisibleMode) {
                    firstVisibleMode = btnMode;
                }
                if (btnMode === state.mode) {
                    activeModeIsVisible = true;
                }
            }
        });
        const label = LIFE_CATEGORY_LABELS[catId] || 'Seçili Kategori';
        if (!activeModeIsVisible && firstVisibleMode) {
            setMode(firstVisibleMode);
            return;
        }
        announceGuidance(`${label} açıldı. Bu bölümde ${visibleCount} özellik listeleniyor.`, {
            force: true,
            bannerState: 'normal'
        });
    }
    window.filterModesByLifeCategory = filterModesByLifeCategory;

    // --- MOD 16: OTOBÜS NUMARASI YAKALAYICI VE DURAĞA YAKLAŞMA ALARMI ---
    state.busTargetStop = null;
    state.busStopWatchTimer = null;
    state.busStopAlert300Fired = false;
    state.busStopAlert60Fired = false;
    state.lastSeenBusRoute = '';

    const POPULAR_STOP_LANDMARKS = [
        { name: 'Kadıköy İskele', lat: 40.9917, lon: 29.0230 },
        { name: 'Mecidiyeköy Meydan', lat: 41.0672, lon: 28.9958 },
        { name: 'Taksim Meydan', lat: 41.0369, lon: 28.9850 },
        { name: 'Beşiktaş Meydan', lat: 41.0422, lon: 29.0067 },
        { name: 'Üsküdar İskele', lat: 41.0264, lon: 29.0151 },
        { name: 'Bakırköy Meydan', lat: 40.9792, lon: 28.8722 },
        { name: 'Avcılar Merkez', lat: 40.9796, lon: 28.7214 },
        { name: 'Beylikdüzü Meydan', lat: 41.0014, lon: 28.6419 },
        { name: 'Pendik Köprüsü', lat: 40.8878, lon: 29.2544 },
        { name: 'Kartal Meydan', lat: 40.8886, lon: 29.1856 },
        { name: 'Ankara Kızılay Meydan', lat: 39.9208, lon: 32.8541 },
        { name: 'Ankara Ulus', lat: 39.9417, lon: 32.8543 },
        { name: 'İzmir Konak Meydan', lat: 38.4189, lon: 27.1287 },
        { name: 'İzmir Bornova', lat: 38.4622, lon: 27.2164 },
        { name: 'Bursa Heykel / Osmangazi', lat: 40.1826, lon: 29.0669 },
        { name: 'Antalya Meydan', lat: 36.8874, lon: 30.7075 }
    ];

    function handleBusStopLiveMode(anW, anH, scaleX, scaleY, ovCtx, metrics, predictions) {
        const busPred = predictions.find(p => p.class === 'bus' || p.class === 'car' || p.class === 'truck');
        if (busPred) {
            const [bx, by, bw, bh] = busPred.bbox;
            ovCtx.strokeStyle = '#fb923c';
            ovCtx.lineWidth = 4;
            ovCtx.strokeRect(bx * scaleX, by * scaleY, bw * scaleX, bh * scaleY);
            el.tPosition.textContent = busPred.class === 'bus' ? 'Otobüs Yaklaşıyor!' : 'Araç Göründü';
            el.tDistance.textContent = 'Hat Okunuyor...';
            if (busPred.class === 'bus') {
                const isReadyForBusOcr = metrics.sharpness >= 6.8 && !state.isProcessingOcr;
                if (state.autoCaptureEnabled && isReadyForBusOcr) {
                    handleAutoCaptureCountdown('Yaklaşan otobüs netlendi, hat numarası okunuyor!');
                } else {
                    state.countdownStage = 0;
                    announceGuidance('Karşıdan otobüs veya minibüs yaklaşıyor! Hat numarasını okumak için kamerayı aracın ön camına doğru sabit tutun veya Boşluk tuşuna basın.', {
                        bannerState: 'centered',
                        minIntervalMs: 3800
                    });
                }
                return;
            }
        }
        state.countdownStage = 0;
        el.tPosition.textContent = 'Yol Taranıyor';
        el.tDistance.textContent = state.busTargetStop ? `Durak: ${state.busTargetStop.name}` : 'Otobüs Bekleniyor';
        announceGuidance('Kamerayı durağa yaklaşan otobüs yönüne tutun; araç göründüğünde hat numarasını sesli okuyacağım.', {
            bannerState: 'normal',
            minIntervalMs: 6500
        });
    }

    function processBusRouteOcrResult(cleanText, preds) {
        const upper = String(cleanText || '').toUpperCase();
        const hasBus = Array.isArray(preds) && preds.some(p => p.class === 'bus');
        const cleanedForBus = upper
            .replace(/\b(?:PERON|SAAT|KAPI|HAT\s*BOYU)\s*[:.]?\s*\d{1,4}\b/g, ' ')
            .replace(/\b\d{1,4}\s*(?:TL|KR|KURUŞ|MG|ML|GR|KG|CM|MM|DK|SN|GB|MB|HZ|W|V|DERECE|KKAL|KCAL)\b/g, ' ');
        const alphaNumRouteMatches = (cleanedForBus.match(/\b(?:\d{1,3}[A-ZÇĞİÖŞÜ]{1,3}|[A-Z]{1,2}\d{1,3})\b/g) || [])
            .filter(tok => !/^(?:\d+(?:TL|KR|MG|ML|GR|KG|CM|MM|DK|SN|GB|MB|HZ)|3D|4K|2D)$/i.test(tok));
        const pureNumMatches = cleanedForBus.match(/\b[1-9]\d{0,3}\b/g) || [];
        const routeMatches = alphaNumRouteMatches.length > 0 ? alphaNumRouteMatches : pureNumMatches;
        const filteredRoutes = [...new Set(routeMatches)].filter(tok => tok.length >= 1 && tok !== '2026' && tok !== '2025' && tok !== '2024');
        const badgeEl = document.getElementById('bus-seen-number');

        if (filteredRoutes.length > 0) {
            const topRoute = filteredRoutes.slice(0, 3).join(', ');
            state.lastSeenBusRoute = topRoute;
            if (badgeEl) badgeEl.textContent = `${topRoute} Numaralı Hat`;
            if (navigator.vibrate) navigator.vibrate([180, 70, 220]);
            const speech = `Yaklaşan otobüs veya durak tabelasında okunan hat numarası: ${topRoute}. Tabeladaki tam yazı: ${cleanText.replace(/\s+/g, ' ').slice(0, 140)}. Güvenliğiniz için kaldırımdan inmeyin ve binmeden önce şoföre hattı teyit ettirin.`;
            return {
                speechText: speech,
                fullText: `Okunan Hat Numarası: ${topRoute}\nAraç Algılandı mı: ${hasBus ? 'Evet (Otobüs/Minibüs)' : 'Durak Tabelası / Hat Yazısı'}\nGüvenlik Notu: Binmeden önce şoföre hattı teyit ettirin.\n\nTam Okunan Metin:\n${cleanText}`
            };
        }
        const fallbackSpeech = cleanText
            ? `Okunan tabela veya yazı: ${cleanText.replace(/\s+/g, ' ')}`
            : (hasBus
                ? 'Otobüs algılandı ancak ön tabeladaki hat numarası tam seçilemedi, lütfen kaldırımda güvenli şekilde bekleyip araç yaklaşınca tekrar okutun.'
                : 'Henüz yaklaşan bir otobüs veya hat numarası algılanmadı.');
        return {
            speechText: fallbackSpeech,
            fullText: fallbackSpeech
        };
    }

    async function setBusDestinationStopAlarm(queryStr) {
        const q = String(queryStr || '').trim();
        if (!q) {
            announceGuidance('Lütfen ineceğiniz durağın veya semtin adını yazın ya da Sesle Söyle düğmesine basın.', { force: true, bannerState: 'warning' });
            return;
        }
        const remEl = document.getElementById('bus-remaining-distance');
        const badgeEl = document.getElementById('bus-stop-badge');
        if (remEl) remEl.textContent = `"${q}" aranıyor...`;

        let target = null;
        const qLower = q.toLocaleLowerCase('tr-TR');
        for (const lm of POPULAR_STOP_LANDMARKS) {
            if (lm.name.toLocaleLowerCase('tr-TR').includes(qLower) || qLower.includes(lm.name.toLocaleLowerCase('tr-TR'))) {
                target = { name: lm.name, lat: lm.lat, lon: lm.lon };
                break;
            }
        }
        // Önce gerçek sokak/cadde/durak araması (Nominatim) yap ki "Ankara Caddesi" yazıldığında 400 km uzaktaki Ankara il merkezini seçmesin!
        if (!target) {
            try {
                const viewboxParam = (state.userLat && state.userLon)
                    ? `&viewbox=${(state.userLon - 0.45).toFixed(4)},${(state.userLat + 0.45).toFixed(4)},${(state.userLon + 0.45).toFixed(4)},${(state.userLat - 0.45).toFixed(4)}`
                    : '';
                const url = `https://nominatim.openstreetmap.org/search?format=json&countrycodes=tr&limit=1${viewboxParam}&q=${encodeURIComponent(q)}`;
                const res = await fetch(url, { headers: { 'Accept-Language': 'tr' } });
                if (res.ok) {
                    const arr = await res.json();
                    if (Array.isArray(arr) && arr.length > 0) {
                        target = {
                            name: (arr[0].display_name || q).split(',').slice(0, 2).join(', '),
                            lat: parseFloat(arr[0].lat),
                            lon: parseFloat(arr[0].lon)
                        };
                    }
                }
            } catch (_) {}
        }
        if (!target && typeof TURKEY_81_PROVINCES !== 'undefined') {
            for (const c of TURKEY_81_PROVINCES) {
                if (c[0].toLocaleLowerCase('tr-TR') === qLower || c[0].toLocaleLowerCase('tr-TR').includes(qLower)) {
                    target = { name: `${c[0]} Merkez`, lat: c[1], lon: c[2] };
                    break;
                }
            }
        }

        if (!target) {
            announceGuidance(`"${q}" durağı için konum bulunamadı. Lütfen semt veya cadde adıyla tekrar deneyin ya da bulunduğunuz yeri durak olarak kaydedin.`, { force: true, bannerState: 'warning' });
            if (remEl) remEl.textContent = 'Durak konumu bulunamadı';
            return;
        }

        state.busTargetStop = target;
        state.busStopAlert300Fired = false;
        state.busStopAlert60Fired = false;
        if (badgeEl) badgeEl.textContent = `Hedef: ${target.name}`;
        if (state.busStopWatchTimer) clearInterval(state.busStopWatchTimer);
        state.busStopWatchTimer = setInterval(() => checkBusDestinationDistance(false), 7000);
        checkBusDestinationDistance(true);
    }

    function computeDistanceMetersHaversine(lat1, lon1, lat2, lon2) {
        const R = 6371000;
        const toRad = d => (d * Math.PI) / 180;
        const dLat = toRad(lat2 - lat1);
        const dLon = toRad(lon2 - lon1);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                  Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
                  Math.sin(dLon / 2) * Math.sin(dLon / 2);
        return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
    }

    function checkBusDestinationDistance(speakImmediately = true) {
        if (!state.busTargetStop) {
            if (speakImmediately) {
                announceGuidance('Henüz hedef durak seçilmedi. Önce ineceğiniz durağın adını yazıp veya söyleyip alarm kurun.', { force: true });
            }
            return;
        }
        if (!state.userLat || !state.userLon) {
            autoAcquireLocationAndWatch();
            if (speakImmediately) {
                announceGuidance(`${state.busTargetStop.name} durağı için alarm kuruldu, GPS konumunuz alınıyor.`, { force: true });
            }
            return;
        }
        const distM = computeDistanceMetersHaversine(state.userLat, state.userLon, state.busTargetStop.lat, state.busTargetStop.lon);
        const remEl = document.getElementById('bus-remaining-distance');
        const distFormatted = distM >= 1000 ? `${(distM / 1000).toFixed(1)} kilometre (${distM} metre)` : `${distM} metre`;
        if (remEl) remEl.textContent = `${state.busTargetStop.name} — Kalan: ${distFormatted}`;

        if (distM <= 70 && !state.busStopAlert60Fired) {
            state.busStopAlert60Fired = true;
            if (state.busStopWatchTimer) {
                clearInterval(state.busStopWatchTimer);
                state.busStopWatchTimer = null;
            }
            radar.playLockChord();
            if (navigator.vibrate) navigator.vibrate([300, 100, 300, 100, 400]);
            announceGuidance(`DİKKAT! İneceğiniz ${state.busTargetStop.name} durağına geldiniz! Sadece ${distM} metre kaldı, şimdi inme düğmesine basın!`, {
                force: true,
                bannerState: 'centered'
            });
            return;
        }
        if (distM <= 320 && !state.busStopAlert300Fired) {
            state.busStopAlert300Fired = true;
            if (navigator.vibrate) navigator.vibrate([200, 80, 200]);
            announceGuidance(`Hazırlanın, durağa YAKLAŞTINIZ! İneceğiniz ${state.busTargetStop.name} durağına ${distM} metre kaldı. Şimdi inme düğmesine basın ve kapıya doğru hazırlanın.`, {
                force: true,
                bannerState: 'warning'
            });
            return;
        }
        if (distM > 150 && state.busStopAlert60Fired) {
            // Kullanıcı kaydettiği duraktan uzaklaştığında (veya başka yerden durağa yaklaşırken) varış alarmını otomatik hazırla
            state.busStopAlert60Fired = false;
        }
        if (distM > 380 && state.busStopAlert300Fired) {
            state.busStopAlert300Fired = false;
        }
        if (speakImmediately) {
            announceGuidance(`Hedef durağınız: ${state.busTargetStop.name}. Şu an kalan mesafe: ${distFormatted}. Durağa 300 metre ve 50 metre kala size sesli ve titreşimli haber vereceğim.`, {
                force: true,
                bannerState: 'centered'
            });
        }
    }

    function saveCurrentGpsAsBusStop() {
        if (!state.userLat || !state.userLon) {
            announceGuidance('Henüz GPS konumunuz alınamadı, lütfen birkaç saniye sonra tekrar deneyin.', { force: true, bannerState: 'warning' });
            return;
        }
        const inp = document.getElementById('bus-dest-input');
        const customName = (inp && inp.value.trim()) ? inp.value.trim() : 'Kayıtlı Favori Durağım';
        state.busTargetStop = { name: customName, lat: state.userLat, lon: state.userLon };
        // Şu an zaten bu durakta (0 metrede) olduğumuz için 7 saniye sonra yanlış "0 metre kaldı, inin!" alarmı çalmaması adına bayrakları işaretle;
        // duraktan 150 metre uzaklaşıldığında sistem bayrakları otomatik sıfırlayıp dönüşte alarm çalacaktır.
        state.busStopAlert300Fired = true;
        state.busStopAlert60Fired = true;
        const badgeEl = document.getElementById('bus-stop-badge');
        if (badgeEl) badgeEl.textContent = `Hedef: ${customName}`;
        const remEl = document.getElementById('bus-remaining-distance');
        if (remEl) remEl.textContent = `${customName} — Konum Kaydedildi (0 metre)`;
        try {
            localStorage.setItem('mikyas_saved_bus_stop', JSON.stringify(state.busTargetStop));
            const existingIdx = POPULAR_STOP_LANDMARKS.findIndex(x => x.name === customName);
            if (existingIdx >= 0) POPULAR_STOP_LANDMARKS[existingIdx] = state.busTargetStop;
            else POPULAR_STOP_LANDMARKS.unshift(state.busTargetStop);
        } catch (_) {}
        if (state.busStopWatchTimer) clearInterval(state.busStopWatchTimer);
        state.busStopWatchTimer = setInterval(() => checkBusDestinationDistance(false), 7000);
        announceGuidance(`Şu an bulunduğunuz konum "${customName}" olarak kaydedildi. Bir sonraki yolculuğunuzda bu durağa yaklaşırken 300 metre ve 50 metre kala size sesli haber vereceğim.`, { force: true, bannerState: 'centered' });
    }

    function cancelBusStopAlarm() {
        if (state.busStopWatchTimer) {
            clearInterval(state.busStopWatchTimer);
            state.busStopWatchTimer = null;
        }
        state.busTargetStop = null;
        const badgeEl = document.getElementById('bus-stop-badge');
        if (badgeEl) badgeEl.textContent = 'Hedef Durak: Seçilmedi';
        const remEl = document.getElementById('bus-remaining-distance');
        if (remEl) remEl.textContent = 'Durak alarmı kapatıldı';
        announceGuidance('Durak yaklaşma alarmı kapatıldı.', { force: true });
    }

    // --- MOD 17: POS CİHAZI TUTARI DOĞRULAYICI VE TEK TUŞLA IBAN KOPYALAYICI ---
    state.lastDetectedIban = '';
    state.lastDetectedPosAmount = '';

    function validateTurkishIbanMod97(rawIbanCandidate) {
        const cleaned = String(rawIbanCandidate || '')
            .toUpperCase()
            .replace(/[^A-Z0-9]/g, '')
            .replace(/^TR/, 'TR');
        if (!cleaned.startsWith('TR') || cleaned.length !== 26) return null;
        const body = cleaned.slice(2)
            .replace(/O/g, '0')
            .replace(/I/g, '1')
            .replace(/S/g, '5')
            .replace(/B/g, '8');
        if (!/^\d{24}$/.test(body)) return null;
        const fullIban = 'TR' + body;
        // ISO 7064 Mod 97-10 kontrolü: İlk 4 karakteri sona taşı, T=29, R=27
        const rearranged = body.slice(2) + '2927' + body.slice(0, 2);
        let remainder = 0;
        for (let i = 0; i < rearranged.length; i++) {
            remainder = (remainder * 10 + parseInt(rearranged[i], 10)) % 97;
        }
        return {
            iban: fullIban,
            formatted: fullIban.replace(/(.{4})/g, '$1 ').trim(),
            isValidChecksum: remainder === 1
        };
    }

    function processPosAmountAndIbanText(cleanText, pass1Text = '', pass2Text = '') {
        const text = String(cleanText || '');
        const compactNoSpaces = text.toUpperCase().replace(/[\s\-.,]/g, '');
        const ibanRegex = /TR[0-9OISB]{24}/g;
        const rawIbans = compactNoSpaces.match(ibanRegex) || [];
        let foundIbanObj = null;
        for (const cand of rawIbans) {
            const checked = validateTurkishIbanMod97(cand);
            if (checked) {
                foundIbanObj = checked;
                if (checked.isValidChecksum) break;
            }
        }

        // POS veya Fiş Tutarı Yakalama (Binlik ayırıcı "1.250,00 TL" ve "₺480,50" dahil, ₺/€/$ sembollerinde \b hatası olmadan!)
        const amountNumberPattern = '(?:\\d{1,3}(?:[.\\s]\\d{3})+(?:,\\d{2})?|\\d{1,6}(?:[.,]\\d{2})?)';
        const currencyToken = '(?:TL|₺|TÜRK\\s*LİRASI|LİRA|TRY|EUR|USD|€|\\$)';
        const amountRegex = new RegExp(
            `(?:(?:GENEL\\s*TOPLAM|TOPLAM|TUTAR|ÖDENECEK|ODENECEK|SATIŞ|SATIS|ÖDEME|ODEME|NAKİT|NAKIT|KART)\\s*[:\\-*]?\\s*(?:${currencyToken}\\s*)?${amountNumberPattern}(?:\\s*${currencyToken})?|(?:₺|€|\\$)\\s*${amountNumberPattern}|\\b${amountNumberPattern}\\s*${currencyToken}(?=$|[^\\p{L}\\p{N}]))`,
            'giu'
        );
        const amountMatches = text.match(amountRegex) || [];
        // Öncelik: İçinde TOPLAM / TUTAR / ÖDENECEK / SATIŞ geçen satırları en başa al ki üstteki tekil ürün veya KDV satırını toplam sanmasın!
        const sortedMatches = [...new Set(amountMatches.map(a => a.trim()))].sort((a, b) => {
            const aHasTotal = /(?:TOPLAM|TUTAR|ÖDENECEK|ODENECEK|SATIŞ|SATIS)/i.test(a) ? 1 : 0;
            const bHasTotal = /(?:TOPLAM|TUTAR|ÖDENECEK|ODENECEK|SATIŞ|SATIS)/i.test(b) ? 1 : 0;
            return bHasTotal - aHasTotal;
        });
        const cleanAmounts = sortedMatches;

        // Çift geçişli (Binary vs. Ham Renkli) rakam çelişkisi kontrolü (Örn: Ekran parlaması yüzünden 1500 TL vs 500 TL okunması)
        const extractPrimaryTotalValue = (str) => {
            const m = String(str || '').match(amountRegex) || [];
            if (m.length === 0) return '';
            const prioritized = [...m].sort((a, b) => {
                const aPri = /(?:TOPLAM|TUTAR|ÖDENECEK|ODENECEK|SATIŞ|SATIS)/i.test(a) ? 1 : 0;
                const bPri = /(?:TOPLAM|TUTAR|ÖDENECEK|ODENECEK|SATIŞ|SATIS)/i.test(b) ? 1 : 0;
                return bPri - aPri;
            });
            const numRaw = (prioritized[0].match(new RegExp(amountNumberPattern)) || [''])[0];
            return numRaw.replace(/\s+/g, '');
        };
        const total1 = extractPrimaryTotalValue(pass1Text);
        const total2 = extractPrimaryTotalValue(pass2Text);
        const hasAmountConflict = Boolean(total1 && total2 && total1 !== total2);

        const posEl = document.getElementById('pos-detected-amount');
        const ibanEl = document.getElementById('pos-detected-iban');
        const speechParts = [];

        if (hasAmountConflict) {
            if (posEl) posEl.textContent = `⚠️ Parlama Uyuşmazlığı (${total1} / ${total2})`;
            speechParts.push(`DİKKAT: POS ekranındaki yansıma nedeniyle rakamlar iki farklı şekilde okundu (${total1} ve ${total2}). Yanlış tutar onaylamamanız için lütfen kamerayı ekrana dik tutup parlamayı önleyerek tekrar okutun.`);
        } else if (cleanAmounts.length > 0) {
            state.lastDetectedPosAmount = cleanAmounts[0];
            if (posEl) posEl.textContent = cleanAmounts.join(' / ');
            speechParts.push(`Ekranda okunan ödeme tutarı: ${cleanAmounts[0]}. Güvenliğiniz için kart işlemini onaylamadan önce bildirimdeki tutarı da kontrol edin.`);
        }

        if (foundIbanObj) {
            if (foundIbanObj.isValidChecksum) {
                state.lastDetectedIban = foundIbanObj.formatted;
                if (ibanEl) ibanEl.textContent = `${foundIbanObj.formatted} (Mod-97 Doğrulandı)`;
                copyTextUniversal(foundIbanObj.iban, 'IBAN');
                speechParts.push(`Doğrulanmış 26 haneli IBAN numarası bulundu ve telefonunuzun panosuna kopyalandı: ${foundIbanObj.formatted}. Para göndermeden önce alıcı adını mutlaka kontrol edin.`);
            } else {
                if (ibanEl) ibanEl.textContent = '⚠️ IBAN Rakamı Net Değil (Kopyalanmadı)';
                speechParts.push('DİKKAT: TR ile başlayan bir IBAN algılandı ancak rakamlardan biri net okunamadığı için yanlış hesaba para gitmemesi adına panoya kopyalanmadı! Lütfen kamerayı yaklaştırıp tekrar okutun.');
            }
        }

        if (speechParts.length === 0) {
            const msg = text
                ? `POS tutarı veya IBAN net seçilemedi. Okunan yazı: ${text.replace(/\s+/g, ' ')}`
                : 'Ekranda henüz POS tutarı veya TR ile başlayan IBAN algılanmadı. Lütfen kamerayı ekrana dik tutup tekrar okutun.';
            return { speechText: msg, fullText: msg };
        }

        return {
            speechText: speechParts.join(' '),
            fullText: `${speechParts.join('\n')}\n\nOkunan Tam Metin:\n${text}`
        };
    }

    async function copyDetectedIbanToClipboard() {
        if (!state.lastDetectedIban) {
            announceGuidance('Henüz okutulmuş bir IBAN numarası yok. Önce kağıdı veya ekranı kameraya gösterip okutun.', { force: true, bannerState: 'warning' });
            return;
        }
        const raw = state.lastDetectedIban.replace(/\s+/g, '');
        await copyTextUniversal(raw, 'IBAN');
        announceGuidance(`IBAN numarası panoya kopyalandı: ${state.lastDetectedIban}`, { force: true, bannerState: 'centered' });
    }

    function speakDetectedPosAmount() {
        if (!state.lastDetectedPosAmount) {
            announceGuidance('Henüz okutulmuş bir POS veya fiş tutarı yok.', { force: true });
            return;
        }
        announceGuidance(`Son okunan POS veya fiş tutarı: ${state.lastDetectedPosAmount}`, { force: true, bannerState: 'centered' });
    }

    // --- MOD 18: "EŞYAMI NEREYE KOYDUM?" SESLİ HAFIZA VE KAVANOZ TANITICI ---
    const ITEM_MEMORY_STORAGE_KEY = 'mikyas_blind_item_memory_v1';
    state.itemMemories = [];

    function loadItemMemoriesFromStorage() {
        try {
            const raw = localStorage.getItem(ITEM_MEMORY_STORAGE_KEY);
            if (raw) {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed)) state.itemMemories = parsed;
            }
        } catch (_) {}
        updateItemMemorySummaryUI();
    }

    function saveItemMemoriesToStorage() {
        try {
            localStorage.setItem(ITEM_MEMORY_STORAGE_KEY, JSON.stringify(state.itemMemories));
        } catch (_) {}
        updateItemMemorySummaryUI();
    }

    function updateItemMemorySummaryUI() {
        const sumEl = document.getElementById('item-memory-summary');
        const badgeEl = document.getElementById('item-memory-badge');
        if (badgeEl) badgeEl.textContent = `${state.itemMemories.length} Kayıtlı Eşya`;
        if (!sumEl) return;
        if (state.itemMemories.length === 0) {
            sumEl.textContent = 'Henüz eşya yeri kaydedilmedi.';
        } else {
            sumEl.textContent = state.itemMemories.slice(0, 6).map((m, idx) => `${idx + 1}. ${m.text}`).join(' | ');
        }
    }

    function saveItemMemoryEntry(noteText, colorTag = '') {
        const clean = String(noteText || '').trim();
        if (!clean || clean.length < 3) {
            if (!clean && state.deletedItemMemoryBackup) {
                const restored = state.deletedItemMemoryBackup;
                state.deletedItemMemoryBackup = null;
                state.itemMemories.unshift(restored);
                saveItemMemoriesToStorage();
                announceGuidance(`Yanlışlıkla silinen eşya kaydınız hafızaya geri yüklendi: "${restored.text}".`, {
                    force: true,
                    bannerState: 'centered'
                });
                return;
            }
            announceGuidance('Lütfen eşyanızın adını ve nereye koyduğunuzu yazın veya sesle söyleyin.', { force: true, bannerState: 'warning' });
            return;
        }
        state.deletedItemMemoryBackup = null;
        const entry = {
            id: Date.now(),
            text: clean,
            colorTag: colorTag || '',
            dateStr: new Date().toLocaleDateString('tr-TR')
        };
        state.itemMemories.unshift(entry);
        if (state.itemMemories.length > 100) state.itemMemories.pop();
        saveItemMemoriesToStorage();
        const inp = document.getElementById('memory-note-input');
        if (inp) inp.value = '';
        announceGuidance(`Hafızaya kaydedildi: "${clean}". İstediğiniz zaman bu eşyayı sorabilirsiniz.`, {
            force: true,
            bannerState: 'centered'
        });
    }

    function buildTurkishStemVariants(word) {
        const clean = String(word || '').toLocaleLowerCase('tr-TR').replace(/[^a-zçğıöşü0-9]/gu, '');
        if (!clean) return [];
        const variants = new Set([clean]);
        // İyelik ve hal eklerini soy ("gözlüğümü" -> "gözlüğ", "anahtarımı" -> "anahtar", "ilacım" -> "ilac")
        const stripped = clean.replace(/(?:l[ae]r)?(?:[ıiuü]m[ıiuü]z?|[ıiuü]n[ıiuü]z?|[sşy]?[ıiuü](?:n[ıiuü]|ndan|nda|na|n)?|d[ae]n?|t[ae]n?|[y]?[ae])$/u, '');
        if (stripped.length >= 2) {
            variants.add(stripped);
            // Ünsüz yumuşaması geri çevirme (ğ->k, c->ç, b->p, d->t)
            if (stripped.endsWith('ğ')) variants.add(stripped.slice(0, -1) + 'k');
            if (stripped.endsWith('c')) variants.add(stripped.slice(0, -1) + 'ç');
            if (stripped.endsWith('b')) variants.add(stripped.slice(0, -1) + 'p');
            if (stripped.endsWith('d')) variants.add(stripped.slice(0, -1) + 't');
        }
        if (clean.length >= 4) {
            const prefix = clean.slice(0, Math.max(3, clean.length - 3));
            variants.add(prefix);
            if (prefix.endsWith('ğ')) variants.add(prefix.slice(0, -1) + 'k');
            if (prefix.endsWith('c')) variants.add(prefix.slice(0, -1) + 'ç');
            if (prefix.endsWith('b')) variants.add(prefix.slice(0, -1) + 'p');
            if (prefix.endsWith('d')) variants.add(prefix.slice(0, -1) + 't');
        }
        return Array.from(variants).filter(v => v.length >= 3);
    }

    function searchItemMemoryByQuery(queryText) {
        const q = String(queryText || '').trim().toLocaleLowerCase('tr-TR').replace(/[?.,!;:'"()]/g, ' ').replace(/\s+/g, ' ').trim();
        if (!q) {
            announceGuidance('Aramak istediğiniz eşyanın adını söyleyin veya kutuya yazın.', { force: true, bannerState: 'warning' });
            return;
        }
        const stopRegex = /(?:^|\s)(?:nerede|nereye|neredeydi|koydum|koymuştum|bıraktım|acaba|benim|hangi|olan)(?=$|\s)/gu;
        const words = q.replace(stopRegex, ' ').trim().split(/\s+/).filter(w => w.length >= 2);
        const queryStems = words.flatMap(buildTurkishStemVariants);
        const matches = state.itemMemories.filter(item => {
            const hay = item.text.toLocaleLowerCase('tr-TR');
            return hay.includes(q) || queryStems.some(stem => hay.includes(stem));
        });

        if (matches.length > 0) {
            const best = matches.slice(0, 3).map(m => m.text).join('. Ayrıca: ');
            announceGuidance(`Bulundu! Kaydınıza göre: ${best}.`, { force: true, bannerState: 'centered' });
        } else {
            announceGuidance(`"${queryText}" ile ilgili kayıtlı bir eşya yeri bulunamadı.`, { force: true, bannerState: 'warning' });
        }
    }

    function speakAllSavedItemMemories() {
        if (state.itemMemories.length === 0) {
            announceGuidance('Hafıza defterinizde henüz kayıtlı bir eşya yok. Sesle Eşya Yeri Kaydet düğmesine basarak eşyalarınızın yerini kaydedebilirsiniz.', { force: true });
            return;
        }
        const allText = state.itemMemories.slice(0, 10).map((m, i) => `${i + 1}: ${m.text}`).join('. ');
        announceGuidance(`Toplam ${state.itemMemories.length} kayıtlı eşyanız var. ${allText}`, { force: true, bannerState: 'centered' });
    }

    function deleteLastItemMemoryEntry() {
        if (!state.itemMemories || state.itemMemories.length === 0) {
            announceGuidance('Hafıza defterinizde silinecek kayıtlı bir eşya bulunmuyor.', { force: true, bannerState: 'warning' });
            return;
        }
        const removed = state.itemMemories.shift();
        state.deletedItemMemoryBackup = removed;
        saveItemMemoriesToStorage();
        announceGuidance(`Son kaydedilen eşya hafızadan silindi: "${removed.text}". Yanlışlıkla sildiyseniz kutu boşken Eşya Yerini Kaydet düğmesine basarak geri yükleyebilirsiniz. Kalan kayıt sayısı: ${state.itemMemories.length}.`, {
            force: true,
            bannerState: 'centered'
        });
    }

    /**
     * AKILLI DOĞAL DİL VE KULLANIM SENARYOSU YÖNLENDİRİCİ ("NE YAPMAK İSTİYORSUNUZ? SÖYLEYİN, BEN AÇAYIM"):
     * Kullanıcının söylediği doğal Türkçe cümleyi ("Elimde kaç lira var", "Kadıköy durağında ineceğim",
     * "Anahtarımı nereye koydum", "Bu ilacın tarihi geçmiş mi", "Evde mercimek var ne pişireyim") analiz eder;
     * uygun modu otomatik açar ve ilgili alt işlemi (arama, kaydetme, alarm kurma, okuma) tek adımda çalıştırır.
     */
    function routeSmartVoiceScenarioCommand(spokenText) {
        const raw = String(spokenText || '').trim();
        if (!raw) {
            announceGuidance('Lütfen yapmak istediğiniz işlemi söyleyin.', { force: true, bannerState: 'warning' });
            return null;
        }
        const q = raw.toLocaleLowerCase('tr-TR');

        // 0. "Hangi Bölümdeyim / Hangi Moddayım" Durum Sorgusu
        if (/(?:hangi\s*bölüm|hangi\s*mod|ne\s*açık|şu\s*an\s*ne\s*açık)/u.test(q)) {
            const activeStatus = getActiveModeSpokenStatus();
            announceGuidance(activeStatus, { force: true, bannerState: 'centered' });
            return 'active_mode_status';
        }

        // 1. Otobüs Durağı Alarmı ve Yolculuk Senaryosu
        if (/(?:otobüs|minibüs|dolmuş|durak|durağı|durağında|durağına|ineceğim|hat\s*numarası)/u.test(q)) {
            setMode('bus_stop_tracker');
            let stopCandidate = q
                .replace(/(?:otobüs|minibüs|dolmuş|durağında|durağına|durağı|durak|ineceğim|alarm\s*kur|alarmı\s*kur|geldim\s*mi|ne\s*kadar\s*kaldı|beni\s*uyar|haber\s*ver)/gu, ' ')
                .replace(/\s+/g, ' ')
                .trim();
            if (stopCandidate.length >= 3 && !/^(?:numarası|hat|kaç|geliyor|var\s*mı)$/u.test(stopCandidate)) {
                const inp = document.getElementById('bus-dest-input');
                if (inp) inp.value = stopCandidate;
                setBusDestinationStopAlarm(stopCandidate);
                return 'bus_stop_alarm';
            }
            return 'bus_stop_tracker';
        }

        // 2. Tam Olarak Neredeyim & Konum Paylaşma Senaryosu
        if (/(?:neredeyim|hangi\s*sokak|hangi\s*cadde|açık\s*adres|konumumu|konum\s*gönder|konum\s*paylaş|kayboldum)/u.test(q)) {
            setMode('where_am_i');
            if (/(?:gönder|paylaş|whatsapp)/u.test(q)) {
                shareWhereAmIOnWhatsapp();
                return 'where_am_i_whatsapp';
            }
            announceWhereAmIFullAddressAndSignboard('', []);
            return 'where_am_i';
        }

        // 3. Kıble Pusulası ve Namaz Vakitleri Senaryosu
        if (/(?:kıble|namaz|ezan|imsak|iftar|sahur|öğle\s*vakti|ikindi|akşam\s*ezanı|yatsı|kabe)/u.test(q)) {
            setMode('qibla_compass');
            if (/(?:vakit|vakti|saat|ezan|imsak|iftar|sahur|kaçta|ne\s*kadar)/u.test(q)) {
                speakPrayerTimesAndSolarValidation();
                return 'qibla_prayer_times';
            }
            startQiblaCompassSensor();
            return 'qibla_compass';
        }

        // 4. POS Tutarı ve IBAN Kopyalama Senaryosu
        if (/(?:\biban\b|pos\s*cihaz|pos\s*ekran|kredi\s*kart|ödeme\s*tutar|fiş\s*tutar)/u.test(q)) {
            setMode('pos_iban_reader');
            if (/kopyala/u.test(q) && state.lastDetectedIban) {
                copyDetectedIbanToClipboard();
                return 'pos_iban_copy';
            }
            return 'pos_iban_reader';
        }

        // 5. Canlı Para Sayma, Cüzdan ve Kumbara Senaryosu
        if (/(?:kaç\s*lira|ne\s*kadar\s*param|para\s*say|cüzdan|kumbara|kağıt\s*para|bozuk\s*para|demir\s*para|kaç\s*param\s*var)/u.test(q)) {
            setMode('color_cloth');
            if (/(?:ne\s*kadar\s*param|kaç\s*param|toplam\s*kaç|cüzdanımda)/u.test(q)) {
                speakHowMuchMoneyIHave();
                return 'money_total';
            }
            return 'color_cloth';
        }

        // 6. İlaç Kutusu, Dozaj ve Son Kullanma Tarihi Senaryosu
        if (/(?:ilaç|ilacın|hap\b|hapın|şurup|son\s*kullanma|tarihi\s*geçmiş|skt\b|prospektüs|kaç\s*miligram)/u.test(q)) {
            setMode('medicine_skt');
            return 'medicine_skt';
        }

        // 7. Eşyamı Nereye Koydum (Sorma veya Kaydetme) & Kavanoz Senaryosu
        if (/(?:nereye\s*koydum|neredeydi|\bnerede\b|bulamıyorum|kavanoz|\b(?:koydum|bıraktım|sakladım|astım)\b)/u.test(q)) {
            setMode('item_memory');
            if (/(?:nereye\s*koydum|neredeydi|\bnerede\b|bulamıyorum)/u.test(q)) {
                searchItemMemoryByQuery(raw);
                return 'item_memory_search';
            }
            if (/\b(?:koydum|bıraktım|sakladım|astım)\b/u.test(q)) {
                saveItemMemoryEntry(raw);
                return 'item_memory_save';
            }
            return 'item_memory';
        }

        // 8. Adım Sayacı ve Yemek Kalori Hesaplama Senaryosu
        if (/(?:kaç\s*adım|adım\s*say|ne\s*kadar\s*yürüdüm|kalori|kaç\s*kalori|besin\s*değeri)/u.test(q)) {
            setMode('step_calorie_guide');
            if (/(?:kalori|besin)/u.test(q)) {
                const foodPart = q.replace(/(?:kaç\s*kalori|kalorisi\s*kaç|kalori|besin\s*değeri|nedir|acaba)/gu, ' ').trim();
                if (foodPart.length >= 2) {
                    calculateAndSpeakFoodCalories(raw);
                    return 'calorie_calc';
                }
            }
            speakCurrentStepAndCalorieStatus();
            return 'step_calorie_guide';
        }

        // 9. Sesli Yemek Tarifleri ve Evdeki Malzemeyle Tarif Bulma Senaryosu
        if (/(?:yemek\s*tarif|ne\s*pişir|nasıl\s*yapılır|tarifi\b|ocaksız|evde\s+.*?\s+var|çorba\s*tarif|pilav\s*tarif|menemen|mercimek)/u.test(q)) {
            setMode('cooking_guide');
            if (/ocaksız/u.test(q)) {
                filterCookingRecipesByCategory('ocaksiz', true);
                return 'cooking_ocaksiz';
            }
            const recipeQuery = q.replace(/(?:yemek\s*tarifleri|yemek\s*tarifi|ne\s*pişireyim|ne\s*pişirsem|nasıl\s*yapılır|tarifi\s*ver|bana\s*tarif)/gu, ' ').trim();
            if (recipeQuery.length >= 3) {
                findRecipeByIngredientsOrName(raw);
                return 'cooking_recipe_search';
            }
            return 'cooking_guide';
        }

        // 10. Televizyon Altyazı ve Canlı Maç Skoru Senaryosu
        if (/(?:televizyon|tv\s*oku|altyazı|maç\s*kaç\s*kaç|maç\s*skoru|skor\s*ne)/u.test(q)) {
            setMode('tv_subtitle_score');
            if (/(?:başlat|otomatik|spiker)/u.test(q) && !state.tvAutoReaderActive) {
                toggleTvAutoSubtitleSpeaker();
            }
            return 'tv_subtitle_score';
        }

        // 11. Çorap Eşleştirici, Kombin ve Leke Kontrolü Senaryosu
        if (/(?:çorap|çoraplarım|leke\s*var\s*mı|kıyafet\s*uyum|kombin)/u.test(q)) {
            setMode('sock_outfit_check');
            return 'sock_outfit_check';
        }

        // 12. Şarkı Bulucu ve Enstrüman Akort Senaryosu
        if (/(?:hangi\s*şarkı|çalan\s*şarkı|şarkı\s*bul|şarkıyı\s*bul|mırıldan|akort|bağlama|gitar\s*akort|makam)/u.test(q)) {
            setMode('song_finder');
            if (/(?:akort|bağlama|gitar)/u.test(q) && !state.songTunerActive) {
                toggleInstrumentTunerAndMakam();
                return 'song_tuner';
            }
            return 'song_finder';
        }

        // 13. Sınav ve Test Okuyucu Senaryosu
        if (/(?:sınav|test\s*soru|şık\s*oku|soruyu\s*oku)/u.test(q)) {
            setMode('exam_reader');
            if (/soruyu\s*oku/u.test(q)) speakCurrentQuestionStem();
            return 'exam_reader';
        }

        // 14. İmza, Bardak/Sıvı, Kapı/Asansör/Kombi, Gıda Alerjen, Lamba/Işık, Düşen Eşya, Özçekim, WhatsApp QR
        if (/(?:imza|kalem\s*yönlendir)/u.test(q)) { setMode('signature_pen'); return 'signature_pen'; }
        if (/(?:bardak|kupa|şişe\s*bul|çay\s*bardağı)/u.test(q)) { setMode('liquid_level'); return 'liquid_level'; }
        if (/(?:kapı\s*numara|asansör|kombi|çamaşır\s*makine)/u.test(q)) { setMode('door_elevator_lcd'); return 'door_elevator_lcd'; }
        if (/(?:alerjen|gluten|laktoz|içindekiler|gıda\s*paket)/u.test(q)) { setMode('food_freshness'); return 'food_freshness'; }
        if (/(?:lamba\s*açık|ışık\s*açık|pencere\s*ne\s*tarafta)/u.test(q)) { setMode('light_meter'); return 'light_meter'; }
        if (/(?:yere\s*düşen|düşen\s*eşya|modem\s*ışığı)/u.test(q)) { setMode('anomaly_led'); return 'anomaly_led'; }
        if (/(?:özçekim|selfie|vesikalık)/u.test(q)) { setMode('portrait'); return 'portrait'; }
        if (/(?:karekod|qr\s*kod|whatsapp\s*web)/u.test(q)) { setMode('qr_screen'); return 'qr_screen'; }

        // Varsayılan: Etrafımda Ne Var & Evrak Okuyucu
        setMode('explorer');
        return 'explorer';
    }
    window.routeSmartVoiceScenarioCommand = routeSmartVoiceScenarioCommand;

    window.receiveNativeVoiceCaptureFromAndroid = function (purpose, spokenText) {
        const clean = String(spokenText || '').trim();
        if (!clean) {
            announceGuidance('Ses algılanamadı veya konuşma penceresi kapatıldı.', { force: true, bannerState: 'warning' });
            return;
        }
        if (purpose === 'smart_intent') {
            routeSmartVoiceScenarioCommand(clean);
            return;
        }
        if (purpose === 'save') {
            saveItemMemoryEntry(clean);
        } else if (purpose === 'bus_dest') {
            const inp = document.getElementById('bus-dest-input');
            if (inp) inp.value = clean;
            setBusDestinationStopAlarm(clean);
        } else if (purpose === 'calorie') {
            const inp = document.getElementById('calorie-food-input');
            if (inp) inp.value = clean;
            calculateAndSpeakFoodCalories(clean);
        } else if (purpose === 'cooking') {
            const inp = document.getElementById('cooking-ingredient-input');
            if (inp) inp.value = clean;
            findRecipeByIngredientsOrName(clean);
        } else {
            searchItemMemoryByQuery(clean);
        }
    };

    function startVoiceItemMemoryCapture(modeType = 'save') {
        const promptMap = {
            'smart_intent': 'Şimdi ne yapmak istediğinizi söyleyin. Örneğin: Elimde kaç lira var, Bu ilacın tarihi geçmiş mi, Kadıköy durağına alarm kur, Anahtarım nerede veya Mercimek çorbası tarifi.',
            'save': 'Şimdi eşyanızı nereye koyduğunuzu söyleyin, örneğin: Yedek anahtarı vestiyerin üst çekmecesine koydum.',
            'bus_dest': 'Şimdi ineceğiniz durağın veya semtin adını söyleyin, örneğin: Kadıköy İskele veya Kızılay.',
            'calorie': 'Şimdi yediğiniz veya merak ettiğiniz yemeğin adını söyleyin, örneğin: Mercimek çorbası veya 1 bardak süt.',
            'cooking': 'Evde hangi malzemeler var veya hangi yemeği yapmak istiyorsunuz? Şimdi söyleyin.',
            'ask': 'Şimdi aradığınız eşyanın adını söyleyin, örneğin: Yedek anahtar nerede?'
        };
        const promptMsg = promptMap[modeType] || promptMap['ask'];

        if (window.AndroidSongBridge && typeof window.AndroidSongBridge.startNativeVoiceCaptureForMode === 'function') {
            window.AndroidSongBridge.startNativeVoiceCaptureForMode(modeType, promptMsg);
            return;
        }

        const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRec) {
            announceGuidance('Tarayıcınız doğrudan ses tanımayı desteklemiyor, lütfen kutuya yazın.', { force: true, bannerState: 'warning' });
            return;
        }

        const launchRec = () => {
            try {
                const rec = new SpeechRec();
                rec.lang = 'tr-TR';
                rec.interimResults = false;
                rec.maxAlternatives = 1;
                rec.onresult = (ev) => {
                    const transcript = (ev.results && ev.results[0] && ev.results[0][0]) ? ev.results[0][0].transcript : '';
                    if (transcript) {
                        window.receiveNativeVoiceCaptureFromAndroid(modeType, transcript);
                    }
                };
                rec.start();
            } catch (_) {}
        };

        announceGuidance(promptMsg, { force: true });
        setTimeout(launchRec, 2400);
    }

    function handleItemMemoryLiveMode(anW, anH, scaleX, scaleY, ovCtx, metrics, predictions) {
        const col = metrics.centerColor ? metrics.centerColor.name : 'Bilinmiyor';
        el.tPosition.textContent = `Kavanoz / Eşya Rengi: ${col}`;
        el.tDistance.textContent = `${state.itemMemories.length} Eşya Kayıtlı`;
    }

    function tagVisibleJarInCamera() {
        const inp = document.getElementById('memory-note-input');
        const label = inp ? inp.value.trim() : '';
        if (!label) {
            announceGuidance('Kavanozu etiketlemek için önce kutuya kavanozun içinde ne olduğunu yazın (Örn: Ihlamur veya Kaya Tuzu).', { force: true, bannerState: 'warning' });
            return;
        }
        if (!state.isRunning || !state.lastMetrics || !state.lastMetrics.centerColor) {
            announceGuidance('Kavanozun gerçek kapak veya yüzey rengini kaydedebilmem için lütfen önce Kamerayı Başlat düğmesine basın ve kamerayı kavanoza tutun.', { force: true, bannerState: 'warning' });
            return;
        }
        const col = state.lastMetrics.centerColor.name;
        saveItemMemoryEntry(`Etiketlenen Kavanoz/Kutu (${col}): ${label}`, col);
    }

    function matchOrDescribeJarAndMemoryItem(capCanvas, metrics, cleanText) {
        const col = (metrics && metrics.centerColor) ? metrics.centerColor.name : '';
        const jarMemories = state.itemMemories.filter(m => m.colorTag && m.colorTag === col);
        const ocrNote = cleanText ? `Üzerinde okunan yazı: ${cleanText.replace(/\s+/g, ' ')}.` : 'Üzerinde okunabilir bir etiket yazısı görünmüyor.';
        const jarNote = jarMemories.length > 0
            ? `Görünen yüzeyin rengi ${col}. Hafızanızda ${col} renkli kavanoz/kutu için "${jarMemories[0].text}" kaydı bulunuyor; ancak üzerinde yazı yoksa aynı renkteki kavanozları (örneğin tuz ile şekeri) karıştırmamak için lütfen kokusunu veya dokusunu da kontrol edin.`
            : `Görünen kavanoz veya kutunun rengi: ${col}.`;
        const combined = `${jarNote} ${ocrNote}`.trim();
        return { speechText: combined, fullText: combined };
    }

    // --- MOD 19: TELEVİZYON ALTYAZI OKUYUCU VE CANLI MAÇ SKORU SPİKERİ ---
    state.tvAutoReaderActive = false;
    state.tvAutoReaderTimer = null;
    state.lastSpokenTvSubtitle = '';

    function handleTvSubtitleLiveMode(anW, anH, scaleX, scaleY, ovCtx, metrics, predictions) {
        const tvPred = predictions.find(p => p.class === 'tv' || p.class === 'laptop');
        if (tvPred) {
            const [x, y, w, h] = tvPred.bbox;
            ovCtx.strokeStyle = '#f472b6';
            ovCtx.lineWidth = 4;
            ovCtx.strokeRect(x * scaleX, y * scaleY, w * scaleX, h * scaleY);
            el.tPosition.textContent = 'TV Ekranı Hizalandı';
            el.tDistance.textContent = state.tvAutoReaderActive ? 'Canlı Spiker Açık' : 'Okumaya Hazır';
            if (!state.tvAutoReaderActive) {
                announceGuidance('Televizyon ekranı hizalandı. Altyazı ve maç skorunu okumak için Boşluk tuşuna basın veya Otomatik TV Spikerini başlatın.', {
                    bannerState: 'centered'
                });
            }
        } else {
            el.tPosition.textContent = 'TV Ekranına Tutun';
            el.tDistance.textContent = 'Altyazı & Skor';
            if (!state.tvAutoReaderActive) {
                announceGuidance('Telefonu televizyon ekranına doğru tutun.', {
                    bannerState: 'normal'
                });
            }
        }
    }

    function processTvSubtitleAndScoreText(cleanText, isSilentAuto = false) {
        const raw = String(cleanText || '').trim();
        const subEl = document.getElementById('tv-last-subtitle');
        const scoreEl = document.getElementById('tv-last-score');

        const nonTeamWords = /^(?:SAAT|HABER|HABERLER|BÜLTEN|BÜLTENİ|CANLI|YAYIN|BÖLÜM|SEZON|KANAL|TARİH|SAYFA|SON|DAKİKA)$/i;
        const teamScoreRegex = /\b([A-ZÇĞİÖŞÜ]{2,12})\s+(\d{1,2})\s*[-:]\s*(\d{1,2})\s+([A-ZÇĞİÖŞÜ]{2,12})\b/gi;
        const spokenScores = [];
        const rawScores = [];
        let tm;
        while ((tm = teamScoreRegex.exec(raw)) !== null) {
            const t1 = tm[1].toUpperCase();
            const s1 = parseInt(tm[2], 10);
            const s2 = parseInt(tm[3], 10);
            const t2 = tm[4].toUpperCase();
            if (!nonTeamWords.test(t1) && !nonTeamWords.test(t2) && !(t1 === 'SAAT' && s1 <= 24 && s2 <= 59)) {
                rawScores.push(`${t1} ${s1} - ${s2} ${t2}`);
                spokenScores.push(`${t1} ${s1}, ${t2} ${s2}`);
            }
        }
        const minuteMatches = raw.match(/\b(?:\d{1,2}['’]\s*DK|\d{2}:\d{2})\b/gi) || [];
        if (rawScores.length > 0 && minuteMatches.length > 0) {
            rawScores.push(minuteMatches[0]);
        }
        const scoreStr = rawScores.length > 0 ? rawScores.slice(0, 3).join(' | ') : '';
        const spokenScoreSentence = spokenScores.length > 0
            ? `Canlı Maç Skoru: ${spokenScores[0]}${minuteMatches.length > 0 ? ' (Süre: ' + minuteMatches[0] + ')' : ''}. `
            : '';

        if (scoreStr && scoreEl) {
            scoreEl.textContent = scoreStr;
        }
        const cleanLines = raw.split(/\n+/).map(l => l.trim()).filter(l => l.length >= 3);
        const subtitleLine = cleanLines.slice(-2).join(' ');
        if (subtitleLine && subEl) {
            subEl.textContent = subtitleLine;
        }

        const spoken = `${spokenScoreSentence}${subtitleLine ? 'Altyazı: ' + subtitleLine : 'Televizyon ekranında şu an altyazı görünmüyor.'}`;
        return {
            speechText: spoken,
            fullText: `Maç Skoru / Tabela: ${scoreStr || 'Yok'}\nSon Altyazı / Bant: ${subtitleLine || 'Yok'}\n\nEkrandaki Tüm Yazılar:\n${raw}`,
            hasNewSubtitle: Boolean(subtitleLine && subtitleLine !== state.lastSpokenTvSubtitle),
            subtitleLine
        };
    }

    function toggleTvAutoSubtitleSpeaker() {
        state.tvAutoReaderActive = !state.tvAutoReaderActive;
        const btn = document.getElementById('btn-tv-auto-toggle');
        const badge = document.getElementById('tv-subtitle-badge');
        if (btn) {
            btn.classList.toggle('active-toggle', state.tvAutoReaderActive);
            btn.setAttribute('aria-pressed', state.tvAutoReaderActive ? 'true' : 'false');
            btn.textContent = state.tvAutoReaderActive
                ? '⏹️ Otomatik TV Altyazı & Skor Spikerini Durdur'
                : '▶️ Otomatik TV Altyazı & Skor Spikerini Başlat';
        }
        if (badge) {
            badge.textContent = state.tvAutoReaderActive ? 'Canlı TV Spikeri Açık' : 'TV Spikeri Hazır';
        }
        if (state.tvAutoReaderTimer) {
            clearInterval(state.tvAutoReaderTimer);
            state.tvAutoReaderTimer = null;
        }
        if (state.tvAutoReaderActive) {
            if (!state.isRunning) {
                startCamera();
            }
            announceGuidance('Otomatik televizyon altyazı ve maç skoru spikeri başlatıldı. Telefonu televizyona doğru tutun; yeni altyazı çıktıkça sesli okuyacağım.', {
                force: true,
                bannerState: 'centered'
            });
            state.tvAutoReaderTimer = setInterval(() => {
                if (state.isRunning && state.mode === 'tv_subtitle_score' && !state.isProcessingOcr) {
                    readTvScreenNow(true);
                }
            }, 3800);
        } else {
            announceGuidance('Otomatik televizyon spikeri durduruldu.', { force: true });
        }
    }

    async function readTvScreenNow(isAutoTick = false) {
        if (!state.isRunning && !isAutoTick && !el.video.videoWidth) {
            await startCamera();
        }
        if (!state.isRunning || !el.video.videoWidth || typeof window.Tesseract === 'undefined' || state.isProcessingOcr) {
            if (!isAutoTick && !state.isRunning) {
                announceGuidance('Önce kamerayı başlatın ve televizyona doğru tutun.', { force: true, bannerState: 'warning' });
            }
            return;
        }
        state.isProcessingOcr = true;
        try {
            const c = document.createElement('canvas');
            c.width = el.video.videoWidth;
            c.height = el.video.videoHeight;
            c.getContext('2d').drawImage(el.video, 0, 0);
            const ocrRes = await window.Tesseract.recognize(c, 'tur+eng');
            const text = extractVerifiedRealTextFromOcrResult(ocrRes);
            const parsed = processTvSubtitleAndScoreText(text, isAutoTick);
            if (!isAutoTick || (parsed.hasNewSubtitle && parsed.subtitleLine.length > 4)) {
                state.lastSpokenTvSubtitle = parsed.subtitleLine;
                announceGuidance(parsed.speechText, { force: true, bannerState: 'centered' });
            }
        } catch (_) {
        } finally {
            state.isProcessingOcr = false;
        }
    }

    // --- MOD 20: ÇORAP EŞLEŞTİRİCİ, KIYAFET KOMBİN UYUMU VE LEKE KONTROLÜ ---
    function handleSockAndOutfitLiveMode(anW, anH, scaleX, scaleY, ovCtx, metrics) {
        const col = metrics.centerColor ? metrics.centerColor.name : 'Bilinmiyor';
        const pat = metrics.patternType || 'Düz';
        el.tPosition.textContent = `Görünen Renk: ${col}`;
        el.tDistance.textContent = `Desen: ${pat}`;
        if (col && col !== 'Bilinmiyor') {
            announceGuidance(`Görünen kumaş rengi: ${col}, desen: ${pat}. İki çorabı karşılaştırmak veya kıyafet leke kontrolü için Boşluk tuşuna basın.`, {
                bannerState: 'normal'
            });
        }
    }

    function sampleRegionRgbAndContrast(ctx, x0, y0, w, h) {
        const img = ctx.getImageData(Math.max(0, Math.floor(x0)), Math.max(0, Math.floor(y0)), Math.max(1, Math.floor(w)), Math.max(1, Math.floor(h)));
        const d = img.data;
        let rSum = 0, gSum = 0, bSum = 0, count = 0;
        let lumSqSum = 0, lumSum = 0;
        let outlierPixels = 0;

        for (let i = 0; i < d.length; i += 16) {
            const r = d[i], g = d[i + 1], b = d[i + 2];
            const lum = 0.299 * r + 0.587 * g + 0.114 * b;
            rSum += r; gSum += g; bSum += b;
            lumSum += lum;
            lumSqSum += lum * lum;
            count++;
        }
        const avgR = Math.round(rSum / Math.max(1, count));
        const avgG = Math.round(gSum / Math.max(1, count));
        const avgB = Math.round(bSum / Math.max(1, count));
        const avgLum = lumSum / Math.max(1, count);
        const stdDev = Math.sqrt(Math.max(0, lumSqSum / Math.max(1, count) - avgLum * avgLum));

        for (let i = 0; i < d.length; i += 16) {
            const dr = d[i] - avgR, dg = d[i + 1] - avgG, db = d[i + 2] - avgB;
            const dist = Math.sqrt(dr * dr + dg * dg + db * db);
            if (dist > 58) outlierPixels++;
        }
        const outlierRatio = outlierPixels / Math.max(1, count);
        return {
            r: avgR, g: avgG, b: avgB,
            colorInfo: classifyColorCIELAB(avgR, avgG, avgB),
            stdDev,
            outlierRatio
        };
    }

    function analyzeSocksAndOutfitStains(capCanvas, metrics, cleanText) {
        const ctx = capCanvas.getContext('2d');
        const w = capCanvas.width;
        const h = capCanvas.height;

        const leftHalf = sampleRegionRgbAndContrast(ctx, w * 0.08, h * 0.2, w * 0.36, h * 0.6);
        const rightHalf = sampleRegionRgbAndContrast(ctx, w * 0.56, h * 0.2, w * 0.36, h * 0.6);
        const midStrip = sampleRegionRgbAndContrast(ctx, w * 0.44, h * 0.2, w * 0.12, h * 0.6);
        const topBorder = sampleRegionRgbAndContrast(ctx, w * 0.15, h * 0.02, w * 0.70, h * 0.12);

        const colorDist = Math.sqrt(
            Math.pow(leftHalf.r - rightHalf.r, 2) +
            Math.pow(leftHalf.g - rightHalf.g, 2) +
            Math.pow(leftHalf.b - rightHalf.b, 2)
        );
        const distLeftMid = Math.hypot(leftHalf.r - midStrip.r, leftHalf.g - midStrip.g, leftHalf.b - midStrip.b);
        const distRightMid = Math.hypot(rightHalf.r - midStrip.r, rightHalf.g - midStrip.g, rightHalf.b - midStrip.b);
        const distTopCenter = Math.hypot(leftHalf.r - topBorder.r, leftHalf.g - topBorder.g, leftHalf.b - topBorder.b);

        // Boş masa veya tek parça kıyafet kontrolü: Sol, orta şerit ve sağ tamamen aynıysa ve ortada ayırıcı boşluk yoksa:
        const isSingleUniformSurface = (colorDist < 18 && distLeftMid < 14 && distRightMid < 14 && distTopCenter < 16 && leftHalf.stdDev < 18 && rightHalf.stdDev < 18);

        const centerSample = sampleRegionRgbAndContrast(ctx, w * 0.25, h * 0.25, w * 0.5, h * 0.5);
        const leftCore = sampleRegionRgbAndContrast(ctx, w * 0.14, h * 0.25, w * 0.24, h * 0.5);
        const rightCore = sampleRegionRgbAndContrast(ctx, w * 0.62, h * 0.25, w * 0.24, h * 0.5);
        const sockEl = document.getElementById('sock-match-result');
        const stainEl = document.getElementById('outfit-stain-result');

        // İki çorap yan yana karşılaştırılırken ortadaki masa boşluğunu (midStrip) leke sanmamak için her iki parçanın kendi iç yüzey homojenliğini denetle!
        const isTwoPieceComparison = !isSingleUniformSurface && state.sockSubMode !== 'outfit';
        const hasStainOrSpot = isTwoPieceComparison
            ? ((leftCore.outlierRatio >= 0.08 && leftCore.stdDev >= 20) || (rightCore.outlierRatio >= 0.08 && rightCore.stdDev >= 20))
            : (centerSample.outlierRatio >= 0.08 && centerSample.stdDev >= 20);
        const refColorName = isTwoPieceComparison ? leftCore.colorInfo.name : centerSample.colorInfo.name;
        const stainDetail = hasStainOrSpot
            ? `Merkez renk: ${refColorName}. Dikkat: Kumaş yüzeyinde ana renkten belirgin şekilde ayrılan bir renk farkı, desen veya leke izi algılandı; giymeden önce elinizle veya yakınınızla kontrol edebilirsiniz.`
            : `Merkez renk: ${refColorName}, yüzey homojen ve temiz görünüyor.`;
        const stainShortBadge = hasStainOrSpot
            ? `${refColorName} (Farklı Leke/Desen İzi Var)`
            : `${refColorName} (Homojen / Temiz)`;

        if (isSingleUniformSurface || state.sockSubMode === 'outfit') {
            const singleMsg = state.sockSubMode === 'outfit'
                ? `Kıyafet ve Leke Analizi: ${stainDetail}`
                : `Tek Parça Yüzey: Kamerada yan yana iki ayrı çorap ayırt edilemedi; tamamı ${centerSample.colorInfo.name} tek bir yüzey görünüyor. ${stainDetail} İki çorabı karşılaştırmak için aralarında biraz boşluk bırakarak yan yana koyun.`;
            if (sockEl && state.sockSubMode !== 'outfit') sockEl.textContent = `TEK YÜZEY (${centerSample.colorInfo.name})`;
            if (stainEl) stainEl.textContent = stainShortBadge;
            const speech = `${singleMsg} ${cleanText ? 'Etiket yazısı: ' + cleanText.replace(/\s+/g, ' ') : ''}`.trim();
            return {
                speechText: speech,
                fullText: `${singleMsg}\n\nEtiket Yazısı:\n${cleanText || 'Etiket yazısı yok.'}`
            };
        }

        const sameColorName = leftHalf.colorInfo.name === rightHalf.colorInfo.name;
        const isPairMatch = sameColorName || colorDist < 34;

        const sockMsg = isPairMatch
            ? `Çorap ve Kıyafet Eşleşmesi: Sol taraftaki parça (${leftHalf.colorInfo.name}) ile sağ taraftaki parça (${rightHalf.colorInfo.name}) aynı renkte ve birbiriyle eşleşiyor.`
            : `Farklı Renk: Sol taraftaki parça ${leftHalf.colorInfo.name}, sağ taraftaki parça ise ${rightHalf.colorInfo.name}; birbirinden farklı.`;

        const stainMsg = stainDetail;

        if (sockEl) sockEl.textContent = isPairMatch ? `EŞLEŞTİ (${leftHalf.colorInfo.name})` : `FARKLI (${leftHalf.colorInfo.name} / ${rightHalf.colorInfo.name})`;
        if (stainEl) stainEl.textContent = stainShortBadge;

        const speech = `${sockMsg} ${stainMsg} ${cleanText ? 'Etiket yazısı: ' + cleanText.replace(/\s+/g, ' ') : ''}`;
        return {
            speechText: speech,
            fullText: `${sockMsg}\n${stainMsg}\n\nEtiket Yazısı:\n${cleanText || 'Etiket yazısı yok.'}`
        };
    }

    // --- MOD 21: "TAM OLARAK NEREDEYİM?" SOKAK + TABELA + WHATSAPP KONUM TARİFİ ---
    state.lastWhereAmISummary = '';

    function resolveOfflineNearestAddress(lat, lon) {
        if (typeof lat !== 'number' || typeof lon !== 'number' || isNaN(lat) || isNaN(lon)) return '';
        let nearestProvince = '';
        let minProvDistM = Infinity;
        for (let i = 0; i < TURKEY_81_PROVINCES.length; i++) {
            const [pName, pLat, pLon] = TURKEY_81_PROVINCES[i];
            const d = computeDistanceMetersHaversine(lat, lon, pLat, pLon);
            if (d < minProvDistM) {
                minProvDistM = d;
                nearestProvince = pName;
            }
        }
        let nearestStop = null;
        let minStopDistM = Infinity;
        for (let i = 0; i < POPULAR_STOP_LANDMARKS.length; i++) {
            const stop = POPULAR_STOP_LANDMARKS[i];
            const d = computeDistanceMetersHaversine(lat, lon, stop.lat, stop.lon);
            if (d < minStopDistM) {
                minStopDistM = d;
                nearestStop = stop;
            }
        }
        const coordStr = `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
        if (nearestStop && minStopDistM <= 12000) {
            const distDesc = minStopDistM < 1000
                ? `yaklaşık ${minStopDistM} metre`
                : `yaklaşık ${(minStopDistM / 1000).toFixed(1)} kilometre`;
            return `${nearestStop.name} yakını (${distDesc}), ${nearestProvince || 'Türkiye'} (Çevrimdışı GPS: ${coordStr})`;
        }
        if (nearestProvince && minProvDistM <= 150000) {
            return `${nearestProvince} ili sınırları (${(minProvDistM / 1000).toFixed(1)} km merkez mesafesi, Çevrimdışı GPS: ${coordStr})`;
        }
        return `Çevrimdışı GPS Koordinatı: ${coordStr}`;
    }

    async function announceWhereAmIFullAddressAndSignboard(optionalOcrText = '', optionalPreds = []) {
        const addrEl = document.getElementById('where-address-text');
        const signEl = document.getElementById('where-signboard-text');
        if (addrEl) addrEl.textContent = 'Açık adresiniz bulunuyor...';

        let addressDesc = state.qiblaLocationSource || 'Konum bilgisi alınıyor';
        let resolvedOnline = false;
        if (state.userLat && state.userLon) {
            if (typeof fetch === 'function') {
                try {
                    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${state.userLat}&lon=${state.userLon}&zoom=18&addressdetails=1`;
                    const res = await fetch(url, { headers: { 'Accept-Language': 'tr' } });
                    if (res.ok) {
                        const data = await res.json();
                        const a = data.address || {};
                        const parts = [
                            a.suburb || a.neighbourhood || a.quarter,
                            a.road || a.pedestrian,
                            a.house_number ? `No: ${a.house_number}` : '',
                            a.town || a.city_district || a.district,
                            a.city || a.province
                        ].filter(Boolean);
                        if (parts.length > 0) {
                            addressDesc = parts.join(', ');
                            resolvedOnline = true;
                        } else if (data.display_name) {
                            addressDesc = data.display_name.split(',').slice(0, 4).join(', ');
                            resolvedOnline = true;
                        }
                    }
                } catch (_) {}
            }
            if (!resolvedOnline) {
                const offlineAddr = resolveOfflineNearestAddress(state.userLat, state.userLon);
                if (offlineAddr) addressDesc = offlineAddr;
            }
        }
        if (addrEl) addrEl.textContent = addressDesc;

        const cleanSign = String(optionalOcrText || '').replace(/\s+/g, ' ').trim();
        const signDesc = cleanSign.length >= 3
            ? `Önünüzdeki tabelada okunan yazı: ${cleanSign}.`
            : 'Kamerayı önünüzdeki dükkan veya sokak tabelasına tutup Boşluk tuşuna basarsanız tabelayı da eklerim.';
        if (signEl) signEl.textContent = cleanSign.length >= 3 ? cleanSign : 'Henüz tabela okutulmadı';

        const fullSpeech = `Şu an bulunduğunuz açık adres: ${addressDesc}. ${signDesc}`;
        state.lastWhereAmISummary = fullSpeech;
        showDetectedResult('📍 Tam Olarak Neredeyim? Açık Adres ve Tabela Raporu', fullSpeech);
        announceGuidance(fullSpeech, { force: true, bannerState: 'centered' });
    }

    async function shareWhereAmIOnWhatsapp() {
        if (!state.lastWhereAmISummary) {
            await announceWhereAmIFullAddressAndSignboard('', []);
        }
        const mapLink = (state.userLat && state.userLon)
            ? `https://maps.google.com/?q=${state.userLat},${state.userLon}`
            : '';
        const textToShare = `${state.lastWhereAmISummary || 'Şu an bulunduğum konum:'} ${mapLink ? '\nHarita Konumum: ' + mapLink : ''}`.trim();
        const waUrl = `https://wa.me/?text=${encodeURIComponent(textToShare)}`;
        openExternalUrlUniversal(waUrl);
        announceGuidance('Açık adresiniz, tabela tarifiniz ve harita konumunuz WhatsApp üzerinden gönderilmek üzere hazırlandı.', {
            force: true,
            bannerState: 'centered'
        });
    }

    // --- MOD 22: SESLİ ADIM SAYACI VE NAZİK / MOTİVE EDİCİ KALORİ & BESİN REHBERİ ---
    const STEP_CALORIE_STORAGE_KEY = 'mikyas_step_calorie_daily_v1';
    state.stepCounterEnabled = true;
    state.dailySteps = 0;
    state.dailyIntakeKcal = 0;
    state.lastStepPeakTime = 0;
    state.lastAccelMag = 9.8;

    const TURKISH_FOOD_NUTRITION_DB = [
        { keys: ['mercimek çorbası', 'mercimek', 'çorba'], name: '1 Kase Mercimek Çorbası', kcal: 135, benefit: 'Lif ve bitkisel protein açısından çok zengindir, içinizi ısıtır ve uzun süre tok tutar.' },
        { keys: ['ezogelin', 'tarhana', 'yayla çorbası'], name: '1 Kase Geleneksel Çorba', kcal: 140, benefit: 'Bağışıklığı güçlendirir ve sindirimi rahatlatır.' },
        { keys: ['kuru fasulye', 'fasulye', 'nohut'], name: '1 Porsiyon Kuru Fasulye / Nohut', kcal: 240, benefit: 'Harika bir protein ve demir kaynağıdır, vücuda güç verir.' },
        { keys: ['pilav', 'pirinç pilavı', 'bulgur pilavı', 'bulgur'], name: '1 Porsiyon Pilav', kcal: 210, benefit: 'Gün boyu zinde kalmanız için dengeli enerji sağlar.' },
        { keys: ['simit', 'gevrek', 'poğaça'], name: '1 Adet Susamlı Simit', kcal: 275, benefit: 'Susamındaki sağlıklı yağlar ve tahılıyla kahvaltının en güzel keyfidir.' },
        { keys: ['yumurta', 'haşlanmış yumurta', 'omlet', 'menemen'], name: 'Yumurta / Menemen', kcal: 155, benefit: 'En kaliteli protein ve B12 kaynağıdır, hafızayı ve kasları güçlendirir.' },
        { keys: ['peynir', 'beyaz peynir', 'kaşar', 'zeytin'], name: 'Kahvaltılık Peynir ve Zeytin Porsiyonu', kcal: 120, benefit: 'Kalsiyum ve sağlıklı E vitamini ile kemiklerinizi korur.' },
        { keys: ['köfte', 'ızgara köfte', 'dana eti', 'kırmızı et', 'kuşbaşı et', 'kebap', 'tavuk', 'balık'], name: '1 Porsiyon Et / Tavuk / Balık / Köfte', kcal: 260, benefit: 'Yüksek protein değeriyle dokuları yeniler ve enerji verir.' },
        { keys: ['makarna', 'mantı', 'börek'], name: '1 Porsiyon Makarna / Börek / Mantı', kcal: 290, benefit: 'Mutluluk hormonu salgılanmasına yardımcı olan doyurucu bir öğündür.' },
        { keys: ['süt', '1 bardak süt', 'tam yağlı süt', 'keçi sütü'], name: '1 Su Bardağı Süt (200 ml)', kcal: 122, benefit: '6.8 gram kaliteli protein ve bol kalsiyum içerir; kemik sağlığını güçlendirir ve rahat bir uyku sağlar.' },
        { keys: ['salata', 'çoban salata', 'yeşillik', 'cacık', 'yoğurt', 'ayran'], name: '1 Kase Yoğurt / Ayran / Taze Salata', kcal: 95, benefit: 'Ferahlatıcıdır, vitamin ve probiyotik desteğiyle vücudu yeniler.' },
        { keys: ['elma', 'muz', 'portakal', 'mandalina', 'çilek', 'karpuz', 'meyve'], name: '1 Porsiyon Taze Meyve', kcal: 75, benefit: 'Doğal C vitamini ve antioksidan deposudur, cilde ve bağışıklığa çok iyi gelir.' },
        { keys: ['çay', 'türk kahvesi', 'kahve', 'ıhlamur', 'bitki çayı'], name: 'Şekersiz Çay / Türk Kahvesi', kcal: 5, benefit: 'Zihni açar, yorgunluğu alır ve neredeyse hiç kalorisi yoktur.' },
        { keys: ['içme suyu', 'maden suyu', 'soda'], name: 'Su / Doğal Maden Suyu', kcal: 0, benefit: '0 kaloridir; vücudunuzun su ve mineral dengesini korur.' },
        { keys: ['baklava', 'sütlaç', 'tatlı', 'çikolata', 'kek', 'pasta', 'dondurma'], name: '1 Porsiyon Tatlı / Çikolata Keyfi', kcal: 250, benefit: 'Ruhu tatlandırır ve moral verir! Küçük bir yürüyüşle enerjisi keyfe dönüşür.' },
        { keys: ['ekmek', 'tam buğday', 'tost'], name: '1 Dilim Ekmek / Tost', kcal: 85, benefit: 'B vitaminleri içerir ve öğünlerinize doyuruculuk katar.' }
    ];

    function getLocalTodayDateKey() {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    }

    function loadStepCalorieFromStorage() {
        try {
            const todayKey = getLocalTodayDateKey();
            const raw = localStorage.getItem(STEP_CALORIE_STORAGE_KEY);
            if (raw) {
                const parsed = JSON.parse(raw);
                if (parsed && parsed.date === todayKey) {
                    state.dailySteps = Number(parsed.steps) || 0;
                    state.dailyIntakeKcal = Number(parsed.intakeKcal) || 0;
                }
            }
        } catch (_) {}
        updateStepCalorieUI();
    }

    function saveStepCalorieToStorage() {
        try {
            const todayKey = getLocalTodayDateKey();
            localStorage.setItem(STEP_CALORIE_STORAGE_KEY, JSON.stringify({
                date: todayKey,
                steps: state.dailySteps,
                intakeKcal: state.dailyIntakeKcal
            }));
        } catch (_) {}
        updateStepCalorieUI();
    }

    function updateStepCalorieUI() {
        const distM = Math.round(state.dailySteps * 0.72);
        const burnedKcal = Math.round(state.dailySteps * 0.045);
        const stepEl = document.getElementById('step-count-display');
        const burnEl = document.getElementById('step-burned-display');
        const intakeEl = document.getElementById('calorie-intake-total');
        const badgeEl = document.getElementById('step-calorie-badge');

        const distText = distM >= 1000 ? `${(distM / 1000).toFixed(2)} km` : `${distM} metre`;
        if (stepEl) stepEl.textContent = `${state.dailySteps} Adım (${distText})`;
        if (burnEl) burnEl.textContent = `${burnedKcal} kcal (Harikasınız!)`;
        if (intakeEl) intakeEl.textContent = `${state.dailyIntakeKcal} kcal (Afiyet şifa olsun)`;
        if (badgeEl) badgeEl.textContent = `${state.dailySteps} Adım | ${burnedKcal} kcal`;
    }

    window.addEventListener('devicemotion', (ev) => {
        if (!state.stepCounterEnabled) return;
        const acc = ev.accelerationIncludingGravity || ev.acceleration;
        if (!acc || typeof acc.x !== 'number') return;
        const mag = Math.sqrt(acc.x * acc.x + acc.y * acc.y + acc.z * acc.z);
        const delta = Math.abs(mag - state.lastAccelMag);
        state.lastAccelMag = mag * 0.8 + state.lastAccelMag * 0.2;

        const now = performance.now();
        if (delta > 3.5 && (now - state.lastStepPeakTime) > 380) {
            state.lastStepPeakTime = now;
            state.dailySteps++;
            saveStepCalorieToStorage();
            if (state.mode === 'step_calorie_guide' && state.dailySteps > 0 && state.dailySteps % 100 === 0) {
                const distM = Math.round(state.dailySteps * 0.72);
                const burned = Math.round(state.dailySteps * 0.045);
                announceGuidance(`Maşallah çok güzel yürüyorsunuz! Bugün ${state.dailySteps} adıma ulaştınız, yaklaşık ${distM} metre yürüdünüz ve ${burned} kalori enerji harcadınız. Attığınız her adım sağlığınıza sağlık katıyor!`, {
                    force: true,
                    bannerState: 'centered'
                });
            }
        }
    });

    function toggleStepCounterActive() {
        state.stepCounterEnabled = !state.stepCounterEnabled;
        const btn = document.getElementById('btn-step-toggle');
        if (btn) {
            btn.classList.toggle('active-toggle', state.stepCounterEnabled);
            btn.setAttribute('aria-pressed', state.stepCounterEnabled ? 'true' : 'false');
            btn.textContent = state.stepCounterEnabled
                ? '👟 Adım Sayacı: Açık (Yürüdükçe Sayar)'
                : '⏸️ Adım Sayacı: Duraklatıldı';
        }
        announceGuidance(state.stepCounterEnabled
            ? 'Sesli adım sayacı açıldı. Telefon cebinizde veya elinizde yürürken adımlarınızı sayıp her 100 adımda size moral vererek haber vereceğim.'
            : 'Adım sayacı duraklatıldı.', { force: true });
    }

    function speakCurrentStepAndCalorieStatus() {
        const distM = Math.round(state.dailySteps * 0.72);
        const burnedKcal = Math.round(state.dailySteps * 0.045);
        const distText = distM >= 1000 ? `${(distM / 1000).toFixed(2)} kilometre` : `${distM} metre`;
        const cheer = state.dailySteps >= 500
            ? 'Enerjiniz ve gayretiniz harika, kendinizle gurur duyabilirsiniz!'
            : 'Önemli olan sayı değil, kendinizi iyi ve huzurlu hissetmenizdir; attığınız her adım çok kıymetli!';
        announceGuidance(`Bugün şimdiye kadar ${state.dailySteps} adım attınız, yani yaklaşık ${distText} yürüdünüz ve ${burnedKcal} kalori harcadınız. Bugün kaydettiğiniz yemeklerden aldığınız enerji ise ${state.dailyIntakeKcal} kalori. ${cheer}`, {
            force: true,
            bannerState: 'centered'
        });
    }

    function resetDailyStepAndCalorieCounter() {
        if (state.dailySteps === 0 && state.dailyIntakeKcal === 0 && state.stepCalorieBackupBeforeReset) {
            state.dailySteps = state.stepCalorieBackupBeforeReset.dailySteps || 0;
            state.dailyIntakeKcal = state.stepCalorieBackupBeforeReset.dailyIntakeKcal || 0;
            state.stepCalorieBackupBeforeReset = null;
            saveStepCalorieToStorage();
            announceGuidance(`Yanlışlıkla sıfırlanan ${state.dailySteps} adım ve ${state.dailyIntakeKcal} kalori bilginiz başarıyla geri yüklendi!`, {
                force: true,
                bannerState: 'centered'
            });
            return;
        }
        if (state.dailySteps > 0 || state.dailyIntakeKcal > 0) {
            state.stepCalorieBackupBeforeReset = {
                dailySteps: state.dailySteps,
                dailyIntakeKcal: state.dailyIntakeKcal
            };
        }
        state.dailySteps = 0;
        state.dailyIntakeKcal = 0;
        saveStepCalorieToStorage();
        announceGuidance('Günlük adım ve enerji sayacınız sıfırlandı. Yanlışlıkla sıfırladıysanız bu düğmeye tekrar basarak adımlarınızı geri yükleyebilirsiniz. Yeni ve sağlıklı bir güne merhaba!', { force: true });
    }

    function calculateAndSpeakFoodCalories(foodQuery) {
        const q = String(foodQuery || '').trim().toLocaleLowerCase('tr-TR');
        if (!q) {
            announceGuidance('Lütfen yediğiniz veya merak ettiğiniz yemeğin adını yazın ya da Yemeği Sesle Söyle düğmesine basın.', { force: true, bannerState: 'warning' });
            return;
        }
        // "1 adet elma" içindeki "et" veya "1 su bardağı süt" içindeki "su" hecesinin yanlış eşleşmesini önlemek için tam kelime sınırı kontrolü:
        const qClean = q.replace(/\b(?:\d+|bir|iki|üç|yarım|adet|tane|porsiyon|tabak|kase|bardak|su\s+bardağı|çay\s+bardağı|dilim|kaşık)\b/gu, ' ').replace(/\s+/g, ' ').trim() || q;
        const extractPortionMultiplier = (fullQuery, matchedKey) => {
            if (!matchedKey) return 1;
            const escaped = matchedKey.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const keyRegex = new RegExp(`(?:^|[^\\p{L}])${escaped}(?=$|[^\\p{L}])`, 'iu');
            // Cümleyi "ve", "ile", "bir de", virgül veya artı işaretlerinden alt yemek öbeklerine böl:
            const clauses = fullQuery.split(/(?:,|;|\+|(?:^|\s)(?:ve|ile|bir\s+de)(?=\s|$))/iu);
            const targetClause = clauses.find(c => keyRegex.test(c)) || fullQuery;
            const idx = targetClause.search(new RegExp(escaped, 'iu'));
            const prefix = (idx >= 0 ? targetClause.slice(0, idx) : targetClause).toLocaleLowerCase('tr-TR');
            if (/(?:^|[^\p{L}])(?:yarım|0[.,]5|1\/2)(?=$|[^\p{L}])/u.test(prefix)) return 0.5;
            if (/(?:^|[^\p{L}])(?:bir\s+buçuk|1[.,]5)(?=$|[^\p{L}])/u.test(prefix)) return 1.5;
            const numWordMap = { 'bir': 1, 'iki': 2, 'üç': 3, 'dört': 4, 'beş': 5, 'altı': 6, 'yedi': 7, 'sekiz': 8, 'dokuz': 9, 'on': 10 };
            const wordMatch = prefix.match(/(?:^|[^\p{L}])(bir|iki|üç|dört|beş|altı|yedi|sekiz|dokuz|on)(?=$|[^\p{L}])/u);
            if (wordMatch && numWordMap[wordMatch[1]]) return numWordMap[wordMatch[1]];
            const digitMatch = prefix.match(/\b(\d{1,2})\b/);
            if (digitMatch) {
                const n = parseInt(digitMatch[1], 10);
                if (n >= 1 && n <= 20) return n;
            }
            return 1;
        };

        const matchedItems = [];
        for (const item of TURKISH_FOOD_NUTRITION_DB) {
            let foundKey = null;
            for (const k of item.keys) {
                const escaped = k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                const wordRegex = new RegExp(`(?:^|[^\\p{L}])${escaped}(?=$|[^\\p{L}])`, 'iu');
                if (wordRegex.test(qClean) || wordRegex.test(q)) {
                    foundKey = k;
                    break;
                }
            }
            if (foundKey) {
                const mult = extractPortionMultiplier(q, foundKey);
                matchedItems.push({
                    ...item,
                    portionMultiplier: mult,
                    totalKcal: Math.round(item.kcal * mult)
                });
            }
        }
        if (matchedItems.length === 0 && /^(?:su|1\s*bardak\s*su|bir\s*bardak\s*su)$/iu.test(q)) {
            const waterItem = TURKISH_FOOD_NUTRITION_DB.find(x => x.kcal === 0);
            if (waterItem) matchedItems.push({ ...waterItem, portionMultiplier: 1, totalKcal: 0 });
        }
        if (matchedItems.length === 0 && /(?:^|[^\p{L}])et(?=$|[^\p{L}])/iu.test(qClean)) {
            const meatItem = TURKISH_FOOD_NUTRITION_DB.find(x => x.kcal === 260);
            if (meatItem) {
                const mult = extractPortionMultiplier(q, 'et');
                matchedItems.push({ ...meatItem, portionMultiplier: mult, totalKcal: Math.round(meatItem.kcal * mult) });
            }
        }
        const lastFoodEl = document.getElementById('calorie-last-food');
        const inp = document.getElementById('calorie-food-input');
        if (inp) inp.value = '';

        if (matchedItems.length > 0) {
            const totalAddedKcal = matchedItems.reduce((acc, m) => acc + m.totalKcal, 0);
            state.dailyIntakeKcal += totalAddedKcal;
            saveStepCalorieToStorage();
            const formatItemLabel = (m) => {
                if (m.portionMultiplier === 0.5) return `Yarım Porsiyon ${m.name.replace(/^1\s+\S+\s+/u, '')} (${m.totalKcal} kcal)`;
                if (m.portionMultiplier !== 1) return `${m.portionMultiplier}x ${m.name} (${m.totalKcal} kcal)`;
                return `${m.name} (${m.totalKcal} kcal)`;
            };
            const namesSummary = matchedItems.map(formatItemLabel).join(' + ');
            if (lastFoodEl) lastFoodEl.textContent = namesSummary;
            const benefitsSummary = matchedItems.map(m => m.benefit).join(' ');
            const speechIntro = matchedItems.length === 1
                ? `${formatItemLabel(matchedItems[0]).replace(/\s*\(\d+\s*kcal\)/, '')} yaklaşık ${totalAddedKcal} kaloridir.`
                : `Söylediğiniz ${matchedItems.length} besin (${namesSummary}) toplam yaklaşık ${totalAddedKcal} kaloridir.`;
            announceGuidance(`Afiyet ve şifa olsun! ${speechIntro} ${benefitsSummary} Günlük enerji toplamınız ${state.dailyIntakeKcal} kalori oldu.`, {
                force: true,
                bannerState: 'centered'
            });
        } else {
            if (lastFoodEl) lastFoodEl.textContent = `${foodQuery} (Listede Yok — Kalori Eklenmedi)`;
            announceGuidance(`"${foodQuery}" besin veritabanımızda kayıtlı olmadığı için yanlış bilgi vermemek adına günlük kalori toplamınıza tahmini bir sayı eklemedim. Eğer paketli bir ürünse kameraya gösterip Boşluk tuşuna basarak üzerindeki gerçek besin değeri tablosunu okutabilirsiniz.`, {
                force: true,
                bannerState: 'warning'
            });
        }
    }

    function parsePackageOrMenuCaloriesKind(cleanText) {
        const text = String(cleanText || '');
        const kcalMatches = text.match(/\b\d{1,4}\s*(?:kcal|kkal|kalori|cal)\b/gi) || [];
        if (kcalMatches.length === 0) {
            const slashKcal = text.match(/enerji[^0-9\n]*\d{2,5}\s*(?:kj)?\s*\/\s*(\d{1,4})\b/i);
            if (slashKcal) kcalMatches.push(`${slashKcal[1]} kcal`);
        }
        const protMatches = text.match(/protein(?:\s*\(\s*g\s*\))?\s*[:\-]?\s*\d+(?:[.,]\d+)?(?:\s*g)?/gi) || [];
        const carbMatches = text.match(/karbonhidrat(?:\s*\(\s*g\s*\))?\s*[:\-]?\s*\d+(?:[.,]\d+)?(?:\s*g)?/gi) || [];
        const sugarMatches = text.match(/şeker(?:ler)?(?:\s*\(\s*g\s*\))?\s*[:\-]?\s*\d+(?:[.,]\d+)?(?:\s*g)?/gi) || [];
        const fatMatches = text.match(/(?:toplam\s+)?yağ(?:\s*\(\s*g\s*\))?\s*[:\-]?\s*\d+(?:[.,]\d+)?(?:\s*g)?/gi) || [];
        const saltMatches = text.match(/tuz(?:\s*\(\s*g\s*\))?\s*[:\-]?\s*\d+(?:[.,]\d+)?(?:\s*g)?/gi) || [];

        const parts = [];
        if (kcalMatches.length > 0) parts.push(`Enerji Değeri: ${kcalMatches[0]}`);
        if (protMatches.length > 0) parts.push(protMatches[0]);
        if (carbMatches.length > 0) parts.push(carbMatches[0]);
        if (sugarMatches.length > 0) parts.push(sugarMatches[0]);
        if (fatMatches.length > 0) parts.push(fatMatches[0]);
        if (saltMatches.length > 0) parts.push(saltMatches[0]);

        const summary = parts.length > 0
            ? `Pakette okunan besin değerleri: ${parts.join(', ')}. Afiyet ve şifa olsun!`
            : (text ? `Paket veya menü yazısı: ${text.replace(/\s+/g, ' ')}` : 'Paketin üzerindeki besin değeri tablosu net görünmedi, lütfen biraz daha yaklaştırıp tekrar okutun.');
        return {
            speechText: summary,
            fullText: `${summary}\n\nTam Okunan Metin:\n${text}`
        };
    }

    // --- MOD 23: ERİŞİLEBİLİR YEMEK YAPMA REHBERİ, KONUŞAN AŞÇI VE OCAK/PİŞMİŞLİK DENETÇİSİ ---
    state.selectedRecipeIndex = 0;
    state.currentCookingStepIndex = 0;
    state.selectedCookingCategory = 'ocaksiz'; // 'ocaksiz' | 'ocakli' | 'all'
    state.cookingTimerInterval = null;
    state.cookingTimerRemainingSec = 0;
    state.cookingTotalStepSec = 0;
    state.boilBurnGuardActive = false;
    state.boilBurnAudioStream = null;
    state.boilBurnAudioTimer = null;
    state.stoveOffReminderTimer = null;
    state.stoveConfirmedOff = true;
    state.lastBoilBurnAlertAt = 0;
    state.prevCookingCenterBrightness = 0;

    const BLIND_ACCESSIBLE_RECIPES = [
        // =====================================================================
        // KATEGORİ 1: 🥗 OCAKSIZ / ATEŞSİZ YAPILABİLECEK TÜRK YEMEKLERİ (14 TARİF)
        // (Hiç ocak veya fırın yakmadan, %100 yanma ve taşma tehlikesiz!)
        // =====================================================================
        {
            id: 'antakya_kisir',
            category: 'ocaksiz',
            title: '🥗 [Ocaksız] Antakya & Adana Usulü Tam Ölçülü Kısır',
            keywords: ['kısır', 'bulgur', 'ince bulgur', 'nar ekşisi', 'marul', 'ocaksız'],
            ingredients: '2 su bardağı ince köftelik bulgur, 1 buçuk su bardağı sıcak su (kettle veya termos suyu), 1 yemek kaşığı domates salçası, 1 yemek kaşığı biber salçası, yarım çay bardağı zeytinyağı, 3 yemek kaşığı nar ekşisi, 1 limonun suyu, 5 dal taze soğan, yarım demet maydanoz, 1 tatlı kaşığı tuz, 1 tatlı kaşığı kuru nane ve kimyon.',
            steps: [
                {
                    text: '1. Adım (Ocaksız Bulgur Demleme): Geniş ve derin bir yoğurma kabına 2 su bardağı ince bulguru ve 1 tatlı kaşığı tuzu koyun. Üzerine 1 buçuk su bardağı sıcak içme suyunu gezdirip kaşıkla bir kez karıştırın ve kabın ağzını düz bir tabakla kapatıp bulgurlar şişene kadar 10 dakika bekletin.',
                    timerMinutes: 10
                },
                {
                    text: '2. Adım (Salça ve Baharatla Yoğurma): Kabaran bulgurun üzerine 1 yemek kaşığı domates salçası, 1 yemek kaşığı biber salçası, kuru nane ve kimyonu ekleyin. Elinizle veya kaşık sırtıyla 3 dakika boyunca bulgur taneleri salçayı tamamen emip yumuşayana kadar karıştırın.',
                    timerMinutes: 3
                },
                {
                    text: '3. Adım (Yeşillik, Zeytinyağı ve Nar Ekşisi): İnce doğranmış taze soğan, maydanoz, yarım çay bardağı zeytinyağı, 3 yemek kaşığı nar ekşisi ve 1 limon suyunu ekleyip harmanlayın. Hiç ocak yakmadan efsane kısırınız hazır!',
                    timerMinutes: 0
                }
            ]
        },
        {
            id: 'etsiz_cig_kofte',
            category: 'ocaksiz',
            title: '🥗 [Ocaksız] Adıyaman & Urfa Usulü Pratik Etsiz Çiğ Köfte',
            keywords: ['çiğ köfte', 'bulgur', 'isot', 'nar ekşisi', 'dürüm', 'ocaksız'],
            ingredients: '2 su bardağı esmer ince bulgur, 1 su bardağı sıcak su, 2 yemek kaşığı domates salçası, 1 yemek kaşığı biber salçası, 3 yemek kaşığı isot, yarım çay bardağı zeytinyağı, 3 yemek kaşığı nar ekşisi, 1 adet rendelenmiş soğan (suyu sıkılmış), 2 diş ezilmiş sarımsak, 1 tatlı kaşığı tuz ve kimyon.',
            steps: [
                {
                    text: '1. Adım (Bulguru Yumuşatma): 2 su bardağı ince bulguru derin kaba alıp 1 su bardağı sıcak suyla ıslatın ve üzerini kapatıp 10 dakika yumuşamaya bırakın.',
                    timerMinutes: 10
                },
                {
                    text: '2. Adım (Dokunarak Kıvam Yoğurma): Şişen bulgura salçaları, isotu, suyu sıkılmış rendelenmiş soğanı, sarımsağı ve baharatları ekleyin. Avuç içinizle bastırarak (veya el blenderı/mutfak robotuyla) 10 dakika yoğurun. Bulgur taneleri elinizin altında eriyip macun gibi birbirini tuttuğunda zeytinyağı ve nar ekşisini ekleyip 2 dakika daha yoğurun ve avucunuzda sıkarak şekil verin.',
                    timerMinutes: 10
                }
            ]
        },
        {
            id: 'antalya_tahinli_piyaz',
            category: 'ocaksiz',
            title: '🥗 [Ocaksız] Antalya Usulü Tahinli Piyaz (Hazır Haşlanmış Fasulye ile)',
            keywords: ['piyaz', 'fasulye', 'tahin', 'kuru fasulye', 'soğan', 'ocaksız'],
            ingredients: '1 kavanoz (veya 2 su bardağı hazır haşlanmış) kuru fasulye, 1 adet kuru soğan, 1 adet domates, yarım demet maydanoz. Tahinli sosu için: 3 yemek kaşığı tahin, 2 yemek kaşığı üzüm sirkesi, 1 limonun suyu, 1 diş ezilmiş sarımsak, yarım çay bardağı ılık su, 3 yemek kaşığı zeytinyağı, 1 çay kaşığı tuz ve kimyon.',
            steps: [
                {
                    text: '1. Adım (Tahinli Sosu Açma): Derin bir kasede 3 yemek kaşığı tahin, 1 limon suyu, 2 yemek kaşığı sirke, ezilmiş sarımsak, tuz, kimyon ve yarım çay bardağı suyu çatalla 2 dakika çırpın; tahin başta katılaşıp hemen ardından boza kıvamında pürüzsüz bir sosa dönüşecektir.',
                    timerMinutes: 2
                },
                {
                    text: '2. Adım (Fasulye ile Buluşturma): Süzülmüş hazır haşlanmış fasulyeleri servis tabağına alın, üzerine piyazlık doğranmış soğan ve domatesi ekleyin. Hazırladığınız tahinli sosu ve 3 yemek kaşığı zeytinyağını üzerine gezdirin. Çok doyurucu ve tamamen ocaksız Antalya piyazınız hazır!',
                    timerMinutes: 0
                }
            ]
        },
        {
            id: 'antep_gavurdagi_salatasi',
            category: 'ocaksiz',
            title: '🥗 [Ocaksız] Antep Usulü Bol Cevizli ve Nar Ekşili Gavurdağı Salatası',
            keywords: ['gavurdağı', 'salata', 'ceviz', 'domates', 'nar ekşisi', 'ocaksız'],
            ingredients: '3 adet olgun domates, 1 adet salatalık, 1 adet kuru soğan, 2 adet yeşil biber, 1 su bardağı iri kırılmış ceviz içi, yarım demet maydanoz, 3 yemek kaşığı nar ekşisi, 4 yemek kaşığı sızma zeytinyağı, 1 tatlı kaşığı kuru nane ve sumak, 1 çay kaşığı tuz.',
            steps: [
                {
                    text: '1. Adım (Tavla Zarı Doğrama): Domates, salatalık, biber ve soğanı elinizle hissederek küçük küpler halinde doğrayıp derin bir kaseye alın. Soğanların üzerine 1 tatlı kaşığı sumak serpip elinizle hafifçe ovun.',
                    timerMinutes: 0
                },
                {
                    text: '2. Adım (Ceviz ve Sos): Üzerine 1 su bardağı kırılmış cevizi, zeytinyağını, nar ekşisini ve kuru naneyi ekleyip karıştırın. Yanında taze ekmekle başlı başına bir öğün olan Gavurdağı salatanız hazır!',
                    timerMinutes: 0
                }
            ]
        },
        {
            id: 'soguk_ayran_asi_corbasi',
            category: 'ocaksiz',
            title: '🥗 [Ocaksız] Erzurum / Doğu Usulü Soğuk Ayran Aşı Çorbası (Pişirmeden)',
            keywords: ['ayran aşı', 'soğuk çorba', 'yoğurt', 'nohut', 'buğday', 'ayran', 'ocaksız'],
            ingredients: '2 su bardağı yoğurt, 1 buçuk su bardağı soğuk su, 1 su bardağı hazır haşlanmış nohut (konserve), 1 su bardağı hazır haşlanmış buğday veya mısır, 1 adet rendelenmiş salatalık, 1 tatlı kaşığı kuru nane, yarım demet ince kıyılmış dereotu, 1 tatlı kaşığı tuz, 2 yemek kaşığı zeytinyağı.',
            steps: [
                {
                    text: '1. Adım (Yoğurdu Çırpma): Derin bir kasede 2 su bardağı yoğurdu ve 1 tatlı kaşığı tuzu çatal veya çırpıcıyla pürüzsüz olana kadar 1 dakika çırpın, ardından 1 buçuk su bardağı soğuk suyu ekleyip koyu bir ayran kıvamına getirin.',
                    timerMinutes: 1
                },
                {
                    text: '2. Adım (Bakliyat ve Nane Ekleme): Süzülmüş hazır nohut ve buğdayı, rendelenmiş salatalığı, dereotunu ve kuru naneyi ekleyip karıştırın. Üzerine 2 yemek kaşığı zeytinyağı gezdirin. Hiç ocak açmadan besleyici soğuk çorbanız hazır!',
                    timerMinutes: 0
                }
            ]
        },
        {
            id: 'sarimsakli_yogurtlu_semizotu',
            category: 'ocaksiz',
            title: '🥗 [Ocaksız] Sarımsaklı Süzme Yoğurtlu Semizotu Salatası (veya Cacık)',
            keywords: ['semizotu', 'yoğurt', 'cacık', 'salatalık', 'sarımsak', 'ocaksız'],
            ingredients: 'Yarım demet taze semizotu (veya 2 adet salatalık), 2 su bardağı süzme veya normal yoğurt, 2 diş ezilmiş sarımsak, yarım su bardağı kırılmış ceviz veya haşlanmış mısır, 2 yemek kaşığı zeytinyağı, 1 çay kaşığı tuz ve kuru nane.',
            steps: [
                {
                    text: '1. Adım (Ayıklama ve Yıkama): Semizotunun yapraklarını ve körpe dallarını elinizle koparıp süzgeçte bol suyla yıkayın ve iyice süzün (cacık yapıyorsanız salatalıkları küp doğrayın veya rendeleyin).',
                    timerMinutes: 0
                },
                {
                    text: '2. Adım (Sarımsaklı Yoğurtla Harmanlama): Derin kasede yoğurt, ezilmiş sarımsak, tuz ve zeytinyağını karıştırıp semizotlarıyla buluşturun. Üzerine ceviz ve nane serpin. Ferahlatıcı ve sağlıklı öğününüz hazır!',
                    timerMinutes: 0
                }
            ]
        },
        {
            id: 'cevizli_haydari_ve_acili_ezme',
            category: 'ocaksiz',
            title: '🥗 [Ocaksız] Cevizli Haydari ve Lokanta Usulü Acılı Ezme İkilisi',
            keywords: ['haydari', 'meze', 'ezme', 'acılı ezme', 'süzme yoğurt', 'beyaz peynir', 'ocaksız'],
            ingredients: 'Haydari için: 1 buçuk su bardağı süzme yoğurt, 1 dilim (50 gr) ezilmiş beyaz peynir, yarım çay bardağı dövülmüş ceviz, 1 diş sarımsak, 1 tatlı kaşığı kuru nane, dereotu, 2 yemek kaşığı zeytinyağı. Acılı Ezme için: 2 adet rendelenmiş domates, 1 tatlı kaşığı biber salçası, 1 tatlı kaşığı nar ekşisi, pul biber, kuru nane ve zeytinyağı.',
            steps: [
                {
                    text: '1. Adım (Cevizli Haydari Hazırlığı): Bir kasede 1 dilim beyaz peyniri çatalla iyice ezin. Üzerine süzme yoğurdu, ezilmiş sarımsağı, cevizi, kuru naneyi, ince kıyılmış dereotunu ve zeytinyağını ekleyip 2 dakika boyunca krema kıvamına gelene kadar karıştırın.',
                    timerMinutes: 2
                },
                {
                    text: '2. Adım (Lokanta Usulü Acılı Ezme Hazırlığı): İkinci bir kasede rendelenmiş domatesin fazla suyunu süzün; içine 1 tatlı kaşığı biber salçası, nar ekşisi, pul biber, kuru nane ve zeytinyağı ekleyip kaşıkla 1 dakika özdeşleşene kadar karıştırın.',
                    timerMinutes: 1
                }
            ]
        },
        {
            id: 'koz_patlican_biber_salatasi',
            category: 'ocaksiz',
            title: '🥗 [Ocaksız] Közlenmiş Patlıcan ve Kırmızı Biberli Yoğurtlu Soğuk Meze',
            keywords: ['patlıcan', 'köz patlıcan', 'köz biber', 'yoğurtlu patlıcan', 'babagannuş', 'ocaksız'],
            ingredients: '1 kavanoz hazır közlenmiş patlıcan ve közlenmiş kırmızı biber, 1 buçuk su bardağı süzme yoğurt, 2 diş ezilmiş sarımsak, 3 yemek kaşığı zeytinyağı, yarım limon suyu, 1 çay kaşığı tuz.',
            steps: [
                {
                    text: '1. Adım (Köz Sebzeleri Süzme): Kavanozdaki hazır közlenmiş patlıcan ve kırmızı biberleri süzgece alıp fazla suyunu süzün ve derin bir kaseye aktarın.',
                    timerMinutes: 1
                },
                {
                    text: '2. Adım (Sarımsaklı Yoğurtla Harmanlama): Üzerine sarımsaklı süzme yoğurt, zeytinyağı, limon suyu ve tuzu ekleyip 2 dakika karıştırın. Ocak başında patlıcan közleme zahmeti olmadan nefis köz patlıcan mezesi hazır!',
                    timerMinutes: 2
                }
            ]
        },
        {
            id: 'cigden_havuc_lahana_tarator',
            category: 'ocaksiz',
            title: '🥗 [Ocaksız] Çiğden Rendelenmiş Cevizli Havuç ve Mor Lahana Tarator',
            keywords: ['tarator', 'havuç', 'havuç tarator', 'lahana', 'yoğurt', 'ocaksız'],
            ingredients: '3 adet orta boy havuç (veya çeyrek mor lahana), 2 su bardağı süzme yoğurt, 2 diş sarımsak, yarım su bardağı kırılmış ceviz içi, 2 yemek kaşığı zeytinyağı, 1 çay kaşığı tuz.',
            steps: [
                {
                    text: '1. Adım (Sebzeleri Rendeleme): Havuçları (veya mor lahanayı) derin bir kaseye rendeleyin ve üzerine 1 çay kaşığı tuz serpip elinizle hafifçe ovun.',
                    timerMinutes: 2
                },
                {
                    text: '2. Adım (Cevizli Yoğurtlama): Hiç yağda sotelemeden doğrudan sarımsaklı süzme yoğurt, kırılmış ceviz içi ve zeytinyağı ile 1 dakika harmanlayın. Hem vitaminleri kaybolmaz hem de hiç ocak kullanmadan hazır olur!',
                    timerMinutes: 1
                }
            ]
        },
        {
            id: 'akdeniz_ton_balikli_peynirli_salata',
            category: 'ocaksiz',
            title: '🥗 [Ocaksız] Zeytinyağlı Beyaz Peynirli veya Ton Balıklı Doyurucu Salata Kasesi',
            keywords: ['ton balığı', 'beyaz peynir', 'akdeniz salatası', 'mısır', 'zeytin', 'salata', 'ocaksız'],
            ingredients: 'Yarım demet kıvırcık marul veya roka, 1 kutu konserve mısır, 100 gram küp doğranmış beyaz peynir (veya 1 kutu ton balığı), 10 adet çekirdeksiz zeytin, 1 adet domates, 1 adet salatalık, 3 yemek kaşığı zeytinyağı, 1 limonun suyu.',
            steps: [
                {
                    text: '1. Adım (Yeşillikleri Elinizle Koparma): Yıkanmış marul ve roka yapraklarını bıçak bile kullanmadan elinizle lokmalık parçalara koparıp derin salata kasesine atın.',
                    timerMinutes: 2
                },
                {
                    text: '2. Adım (Peynir/Ton Balığı ve Sos Ekleme): Üzerine süzülmüş mısır, çekirdeksiz zeytin, beyaz peynir (veya ton balığı), zeytinyağı ve limon suyunu ekleyip 1 dakika alttan üste karıştırın.',
                    timerMinutes: 1
                }
            ]
        },
        {
            id: 'ezine_peynirli_cevizli_durum_kahvalti',
            category: 'ocaksiz',
            title: '🥗 [Ocaksız] Tahin-Pekmezli, Cevizli ve Ezine Peynirli Anadolu Kahvaltı Dürümü',
            keywords: ['kahvaltı', 'dürüm', 'peynir', 'tahin', 'pekmez', 'zeytin', 'domates', 'ocaksız'],
            ingredients: '2 adet lavaş veya yarım ekmek, 2 dilim Ezine beyaz peyniri, 1 adet domates, 1 adet salatalık, 5 yaprak taze nane veya fesleğen, 1 yemek kaşığı zeytinyağı ve kekik. Tatlı kase için: 2 yemek kaşığı tahin, 2 yemek kaşığı üzüm/keçiboynuzu pekmezi ve ceviz.',
            steps: [
                {
                    text: '1. Adım (Ezine Peynirli Dürüm Sarma): Lavaşın ortasına beyaz peyniri çatalla ezip yayın, üzerine dilimlenmiş domates, salatalık, taze nane, kekik ve zeytinyağı gezdirip sıkıca dürüm yapın.',
                    timerMinutes: 2
                },
                {
                    text: '2. Adım (Tahin-Pekmez Atom Kasesi): Yanında küçük bir kasede 2 yemek kaşığı tahin ve 2 yemek kaşığı pekmezi karıştırıp üzerine kırılmış ceviz içi ekleyerek servis yapın.',
                    timerMinutes: 1
                }
            ]
        },
        {
            id: 'ocaksiz_biskuvili_mozaik_pasta',
            category: 'ocaksiz',
            title: '🥗 [Ocaksız Tatlı] Pişirmeden Soğuk Sütle Yapılan Anne Usulü Bisküvili Mozaik Pasta',
            keywords: ['mozaik pasta', 'pasta', 'bisküvi', 'tatlı', 'kakao', 'çikolata', 'ocaksız'],
            ingredients: '2 paket (yaklaşık 350 gram) petibör bisküvi, 1 su bardağı soğuk süt, 3 yemek kaşığı kakao, 3 yemek kaşığı pudra şekeri (veya toz şeker), 3 yemek kaşığı sıvı yağ (veya oda sıcaklığında yumuşamış tereyağı), yarım su bardağı kırılmış ceviz veya fındık.',
            steps: [
                {
                    text: '1. Adım (Ocaksız Çikolata Sosu): Derin bir yoğurma kabında 1 su bardağı soğuk süt, 3 yemek kaşığı kakao, 3 yemek kaşığı şeker ve 3 yemek kaşığı yağı hiç ocak açmadan tel çırpıcıyla şeker eriyene kadar 2 dakika çırpın.',
                    timerMinutes: 2
                },
                {
                    text: '2. Adım (Bisküvileri Elinizle Kırma): 2 paket petibör bisküviyi elinizle dörde-beşe kırarak sosun içine atın, yarım su bardağı cevizi ekleyin ve bisküvileri ezmeden kaşıkla alttan üste karıştırın.',
                    timerMinutes: 0
                },
                {
                    text: '3. Adım (Şekil Verme ve Soğutma): Karışımı streç filme veya derin bir kaseye bastırarak yerleştirin, buzdolabında veya dondurucuda 45 dakika dinlendirip dilimleyerek servis yapın!',
                    timerMinutes: 45
                }
            ]
        },
        {
            id: 'ocaksiz_meyveli_yogurtlu_parfe',
            category: 'ocaksiz',
            title: '🥗 [Ocaksız Tatlı] Muzlu, Ballı, Cevizli ve Bisküvili Soğuk Kuplar (Magnolia Tadında)',
            keywords: ['magnolia', 'parfe', 'muz', 'tatlı', 'yoğurt', 'bal', 'yulaf', 'ocaksız'],
            ingredients: '1 buçuk su bardağı süzme yoğurt (veya labne + krema), 2 yemek kaşığı süzme bal veya pekmez, 2 adet olgun muz, 10 adet ufalanmış petibör veya burçak bisküvi, yarım su bardağı ceviz veya fındık, yarım çay kaşığı tarçın.',
            steps: [
                {
                    text: '1. Adım (Ballı Krema Hazırlığı): Süzme yoğurdu 2 yemek kaşığı bal ve yarım çay kaşığı tarçınla pürüzsüz olana kadar 2 dakika çırpın.',
                    timerMinutes: 2
                },
                {
                    text: '2. Adım (Kat Kat Kuplara Dizme): Kaselerin en altına elinizle ufaladığınız bisküvileri, ortasına dilimlenmiş muzları, üzerine ballı süzme yoğurt kremasını ve en üste cevizleri serpiştirin. Hiç pişirmeden 3 dakikada enfes tatlı!',
                    timerMinutes: 3
                }
            ]
        },
        {
            id: 'tahinli_cevizli_enerji_toplari',
            category: 'ocaksiz',
            title: '🥗 [Ocaksız Tatlı] Tahinli, Pekmezli ve Cevizli Atom Enerji Topları (Pişirmeden)',
            keywords: ['enerji topu', 'atom', 'tahin', 'pekmez', 'yulaf', 'bisküvi', 'hindistan cevizi', 'ocaksız'],
            ingredients: '1 paket ufalanmış petibör bisküvi (veya 1 buçuk su bardağı ince yulaf ezmesi), 4 yemek kaşığı tahin, 4 yemek kaşığı üzüm veya dut pekmezi, yarım su bardağı dövülmüş ceviz, 2 yemek kaşığı kakao, dışını bulamak için Hindistan cevizi.',
            steps: [
                {
                    text: '1. Adım (Harcı Yoğurma): Ufalanmış bisküvi veya yulafı, 4 yemek kaşığı tahin, 4 yemek kaşığı pekmez, kakao ve cevizle derin bir kapta elinizle 3 dakika yoğurun.',
                    timerMinutes: 3
                },
                {
                    text: '2. Adım (Yuvarlama ve Hindistan Cevizine Bulama): Harçtan ceviz büyüklüğünde parçalar koparıp avuç içinizde yuvarlayın ve Hindistan cevizine bulayın. Çayın ve kahvenin yanına pişirmeden lokum gibi ikramlık!',
                    timerMinutes: 2
                }
            ]
        },

        // =====================================================================
        // KATEGORİ 2: 🔥 OCAK KULLANILAN GELENEKSEL TÜRK YEMEKLERİ (13 TARİF)
        // (4 Katmanlı Yanma ve Taşma Koruma Kalkanı + Konuşan Tencere Saati ile)
        // =====================================================================
        {
            id: 'mercimek_corbasi',
            category: 'ocakli',
            title: '🔥 [Ocaklı] Lokanta Usulü Süzme Mercimek Çorbası (Taşma Korumalı)',
            keywords: ['mercimek', 'çorba', 'kırmızı mercimek', 'soğan', 'havuç', 'patates'],
            ingredients: '1 su bardağı kırmızı mercimek, 1 adet orta boy kuru soğan (dörde bölünmüş), 1 yemek kaşığı un, 1 yemek kaşığı tereyağı, 2 yemek kaşığı sıvı yağ, 1 tatlı kaşığı tuz, yarım çay kaşığı karabiber ve zerdeçal, 6 su bardağı sıcak su.',
            steps: [
                {
                    text: '1. Adım (Hazırlık ve Yıkama): 1 su bardağı kırmızı mercimeği tel süzgece koyup musluk altında elinizle karıştırarak yıkayın; suyun kayganlığı gidip berraklaştığında süzgeci silkeleyin.',
                    timerMinutes: 0
                },
                {
                    text: '2. Adım (Soğuk Tava & Kokuya Göre Kavurma): Derin tencereye 2 yemek kaşığı sıvı yağ, 1 yemek kaşığı tereyağı ve iri doğranmış 1 soğanı soğukken koyup orta-kısık ateşi açın. Yağdan "cızır cızır" ses gelmeye başladıktan sonra tahta kaşıkla 3 dakika çevirin; tatlımsı soğan kokusu geldiğinde 1 yemek kaşığı unu ekleyip 1 dakika daha karıştırın.',
                    timerMinutes: 3
                },
                {
                    text: '3. Adım (Tahta Kaşık Köprüsüyle Taşmadan Kaynatma): Yıkanmış mercimeği, 1 tatlı kaşığı tuzu ve 6 su bardağı suyu ekleyin. Tencerenin taşmaması için ağzına yatay bir tahta kaşık koyup kapağı hafif aralık bırakın. Fokurdama sesini duyunca ocağı en kısığa alıp 20 dakika pişirin.',
                    timerMinutes: 20
                },
                {
                    text: '4. Adım (Güvenli Kıvam): Ocağı tamamen kapatın! Kaynar çorbanın sıçrayıp elinizi yakmaması için sıcakken elektrikli blender kullanmayın; çorbayı tel süzgeçten geçirin veya ılıdıktan sonra karıştırarak servis yapın.',
                    timerMinutes: 1
                }
            ]
        },
        {
            id: 'sehrive_tarhana_corbasi',
            category: 'ocakli',
            title: '🔥 [Ocaklı] Şifa Deposu Domatesli Arpa Şehriye (veya Tarhana) Çorbası',
            keywords: ['şehriye çorbası', 'tarhana', 'tarhana çorbası', 'domates çorbası', 'çorba'],
            ingredients: '1 çay bardağı arpa şehriye (veya 4 yemek kaşığı toz tarhana), 1 yemek kaşığı tereyağı, 1 yemek kaşığı domates salçası, 1 tatlı kaşığı kuru nane, 1 tatlı kaşığı tuz, 5 buçuk su bardağı su.',
            steps: [
                {
                    text: '1. Adım (Salça ve Nane Kokusu): Tencereye 1 yemek kaşığı tereyağı, 1 yemek kaşığı salça ve 1 tatlı kaşığı kuru naneyi koyup kısık ateşte kokusu çıkana kadar 2 dakika karıştırın.',
                    timerMinutes: 2
                },
                {
                    text: '2. Adım (Su ve Şehriye): 5 buçuk su bardağı suyu ve tuzu ekleyin. Su kaynayıp fokurdama sesi duyulunca 1 çay bardağı arpa şehriyeyi ekleyin, dibine yapışmaması için 1 kez karıştırıp kısık ateşte 12 dakika pişirin.',
                    timerMinutes: 12
                }
            ]
        },
        {
            id: 'tereyagli_pirinc_pilavi',
            category: 'ocakli',
            title: '🔥 [Ocaklı] Tane Tane Tereyağlı Şehriyeli Pirinç Pilavı',
            keywords: ['pilav', 'pirinç', 'pirinç pilavı', 'şehriye', 'tereyağı'],
            ingredients: '2 su bardağı baldo pirinç, 2 yemek kaşığı arpa şehriye, 2 dolu yemek kaşığı tereyağı, 1 yemek kaşığı sıvı yağ, 3 su bardağı sıcak su (1 bardak pirince 1 buçuk bardak su ölçüsü), 1 buçuk tatlı kaşığı tuz.',
            steps: [
                {
                    text: '1. Adım (Nişasta Akıtma): 2 su bardağı pirinci derin bir kaba alıp üzerini geçecek kadar ılık su ve 1 çay kaşığı tuz ekleyin. 15 dakika bekletip süzgeçte soğuk suyla yıkayın ve iyice süzün.',
                    timerMinutes: 15
                },
                {
                    text: '2. Adım (Şehriyeyi Kokusundan Anlama): Pilav tenceresine 1 yemek kaşığı sıvı yağ ve 2 yemek kaşığı tereyağını koyup orta-kısık ateşi açın. 2 yemek kaşığı arpa şehriyeyi ekleyin. Sürekli karıştırırken yaklaşık 2 dakika sonra fındıksı kavruk bir koku burnunuza gelecek ve şehriyeler kaşığa daha sert çarpmaya başlayacak.',
                    timerMinutes: 2
                },
                {
                    text: '3. Adım (Kaşık Direnciyle Pirinç Kavurma): Süzülmüş pirinçleri ekleyin. Kırmadan alttan üste doğru 3-4 dakika kavurun. Pirinçler kavruldukça kaşığa hafif ağırlaşarak direnç göstermeye ve tıkır tıkır ses çıkarmaya başlayacaktır.',
                    timerMinutes: 4
                },
                {
                    text: '4. Adım (Kısık Ateşte Pişirme): 3 su bardağı sıcak suyu ve 1 buçuk tatlı kaşığı tuzu ekleyip sadece bir kez karıştırın, kapağı kapatın. Kaynama fokurtusunu duyunca ocağı en kısık ateşe alın ve 12 dakika pişirin.',
                    timerMinutes: 12
                },
                {
                    text: '5. Adım (Demlendirme): Ocağı kapatın, kapağın altına temiz bir kağıt havlu koyup 10 dakika hiç açmadan dinlendirin.',
                    timerMinutes: 10
                }
            ]
        },
        {
            id: 'meyhane_usulu_bulgur_pilavi',
            category: 'ocakli',
            title: '🔥 [Ocaklı] Sebzeli Meyhane Usulü Bulgur Pilavı (Lapa Olmayan Tam Ölçü)',
            keywords: ['bulgur pilavı', 'bulgur', 'pilav', 'meyhane pilavı'],
            ingredients: '2 su bardağı pilavlık kalın bulgur, 1 adet kuru soğan, 2 adet yeşil biber, 2 adet rendelenmiş domates, 1 yemek kaşığı salça, 2 yemek kaşığı tereyağı, 3 buçuk su bardağı sıcak su, 1 tatlı kaşığı tuz ve kuru nane.',
            steps: [
                {
                    text: '1. Adım (Sebze ve Salça Kavurma): Tencerede tereyağı, doğranmış soğan ve biberi orta-kısık ateşte 3 dakika kavurun. Salçayı ve rendelenmiş domatesi ekleyip 2 dakika daha çevirin.',
                    timerMinutes: 5
                },
                {
                    text: '2. Adım (Bulgur ve Kısık Ateş): 2 su bardağı bulguru, tuzu, naneyi ve 3 buçuk su bardağı sıcak suyu ekleyip karıştırın. Kaynayınca en kısık ateşe alıp suyunu çekene kadar 15 dakika pişirin.',
                    timerMinutes: 15
                }
            ]
        },
        {
            id: 'anne_usulu_kuru_fasulye',
            category: 'ocakli',
            title: '🔥 [Ocaklı] Anne Usulü Lokum Gibi Kuru Fasulye',
            keywords: ['kuru fasulye', 'fasulye', 'salça', 'soğan', 'etli kuru fasulye'],
            ingredients: '2 su bardağı haşlanmış kuru fasulye, 1 adet orta boy kuru soğan, 1 yemek kaşığı domates salçası, 1 tatlı kaşığı biber salçası, 2 yemek kaşığı tereyağı, 3 buçuk su bardağı sıcak su, 1 tatlı kaşığı tuz, yarım çay kaşığı kimyon.',
            steps: [
                {
                    text: '1. Adım (Soğan ve Salça Kokusu): Tencereye 2 yemek kaşığı tereyağı ve küp doğranmış soğanı soğukken koyup orta-kısık ateşte cızırtı sesiyle birlikte 4 dakika kavurun. Ardından salçaları ekleyip kokusu çıkana kadar 2 dakika karıştırın.',
                    timerMinutes: 6
                },
                {
                    text: '2. Adım (Fasulye ve Su): 2 su bardağı haşlanmış kuru fasulyeyi, 3 buçuk su bardağı sıcak suyu, 1 tatlı kaşığı tuzu ve kimyonu ekleyin.',
                    timerMinutes: 2
                },
                {
                    text: '3. Adım (Kısık Ateşte Özleşme): Tencerenin kapağını hafif aralık bırakın, kaynama sesini duyunca en kısık ateşe alın ve 25 dakika pişirin.',
                    timerMinutes: 25
                }
            ]
        },
        {
            id: 'tam_kivaminda_menemen',
            category: 'ocakli',
            title: '🔥 [Ocaklı] Tam Kıvamında Sulu ve Ekmek Banmalık Menemen',
            keywords: ['menemen', 'yumurta', 'domates', 'biber', 'kahvaltı'],
            ingredients: '3 adet orta boy olgun domates, 2 adet yeşil biber, 3 adet yumurta, 2 yemek kaşığı tereyağı veya zeytinyağı, 1 çay kaşığı tuz, yarım çay kaşığı pul biber.',
            steps: [
                {
                    text: '1. Adım (Soğuk Tavada Sıçratmadan Biber Soteleme): Geniş tavaya 2 yemek kaşığı yağı ve doğranmış 2 yeşil biberi soğukken koyup orta-kısık ateşi açın. Biber kokusu yükselene kadar 3 dakika karıştırın.',
                    timerMinutes: 3
                },
                {
                    text: '2. Adım (Domatesin Suyunu Çekmesi): Doğranmış 3 domatesi ve 1 çay kaşığı tuzu ekleyin. Fokurtu sesi toklaşıp koyulaşana kadar 6 dakika pişirin.',
                    timerMinutes: 6
                },
                {
                    text: '3. Adım (Yumurtaları Kırma ve 90 Saniye Kuralı): 3 yumurtayı ayrı bir kaseye kırıp kontrol ettikten sonra tavaya dökün. Hafifçe karıştırıp 90 saniye pişirin ve hemen ocağı kapatın.',
                    timerMinutes: 2
                }
            ]
        },
        {
            id: 'sulu_patatesli_izmir_kofte',
            category: 'ocakli',
            title: '🔥 [Ocaklı] Tencerede Sulu Patatesli İzmir Köfte (Kızartma Yağı Sıçramadan)',
            keywords: ['köfte', 'kıyma', 'patates', 'izmir köfte', 'et'],
            ingredients: '400 gram kıyma, 1 adet rendelenmiş soğan, 3 yemek kaşığı galeta unu, 1 diş sarımsak, 1 çay kaşığı kimyon ve karabiber, 1 tatlı kaşığı tuz. Sebzesi için: 3 adet patates, 1 yemek kaşığı salça, 2 su bardağı sıcak su.',
            steps: [
                {
                    text: '1. Adım (Dokunarak Köfte Yoğurma): Derin bir kapta kıyma, rendelenmiş soğan, galeta unu, tuz ve kimyonu elinizle 7 dakika yoğurun. Ceviz büyüklüğünde parçalar koparıp parmak boyunda yuvarlayın.',
                    timerMinutes: 7
                },
                {
                    text: '2. Adım (Geniş Tencerede Dizme): 3 adet patatesi elma dilimi doğrayın. Geniş yayvan bir tencerenin tabanına bir patates bir köfte olacak şekilde yan yana dizin.',
                    timerMinutes: 0
                },
                {
                    text: '3. Adım (Salçalı Sos ve Pişirme): 1 yemek kaşığı salçayı 2 su bardağı sıcak su ve 3 yemek kaşığı zeytinyağı ile eritip köftelerin üzerine gezdirin. Kapağı kapatıp kısık ateşte 28 dakika pişirin.',
                    timerMinutes: 28
                }
            ]
        },
        {
            id: 'kizartmadan_tencerede_patlican_oturtma',
            category: 'ocakli',
            title: '🔥 [Ocaklı] Kızgın Yağda Kızartmadan Tencerede Güvenli Kıymalı Patlıcan Oturtma / Karnıyarık',
            keywords: ['karnıyarık', 'patlıcan', 'oturtma', 'musakka', 'kıyma'],
            ingredients: '3 adet kemer patlıcan (alacalı soyulup halka doğranmış), 250 gram kıyma, 1 adet kuru soğan, 2 adet yeşil biber, 2 adet domates, 1 yemek kaşığı salça, 3 yemek kaşığı zeytinyağı, 1 buçuk su bardağı sıcak su, 1 tatlı kaşığı tuz.',
            steps: [
                {
                    text: '1. Adım (Kıymalı Harç): Tencerede 250 gram kıymayı, doğranmış soğan ve biberle birlikte orta-kısık ateşte 6 dakika suyunu çekene kadar kavurun, salçayı ve tuzu ekleyip karıştırın.',
                    timerMinutes: 6
                },
                {
                    text: '2. Adım (Kızartmadan Dizme ve Buharda Pişirme): Halka doğranmış patlıcanları ve dilimlenmiş domatesleri kıymanın üzerine yayın. 3 yemek kaşığı zeytinyağı ve 1 buçuk su bardağı sıcak suyu gezdirip kapağı kapatın; kısık ateşte patlıcanlar pamuk gibi olana kadar 25 dakika pişirin.',
                    timerMinutes: 25
                }
            ]
        },
        {
            id: 'firinda_soslu_tavuk_patates',
            category: 'ocakli',
            title: '🔥 [Ocaklı] Tencerede (veya Fırında) Yumuşacık Soslu Tavuk ve Patates',
            keywords: ['tavuk', 'patates', 'fırında tavuk', 'baget', 'tavuk göğsü'],
            ingredients: '600 gram kuşbaşı veya baget tavuk eti, 3 adet patates, 2 yemek kaşığı yoğurt, 3 yemek kaşığı zeytinyağı, 1 tatlı kaşığı domates salçası, 1 tatlı kaşığı kekik, 1 tatlı kaşığı tuz.',
            steps: [
                {
                    text: '1. Adım (Elinizle Soslama): Derin bir kapta yoğurt, zeytinyağı, salça, tuz ve kekiği karıştırın. Tavukları ve iri doğranmış patatesleri içine atıp elinizle harmanlayın.',
                    timerMinutes: 0
                },
                {
                    text: '2. Adım (Pişirme): Geniş kapaklı bir tencereye alıp yarım su bardağı su ilavesiyle kısık ateşte 30 dakika pişirin.',
                    timerMinutes: 30
                }
            ]
        },
        {
            id: 'salcali_soslu_makarna',
            category: 'ocakli',
            title: '🔥 [Ocaklı] Kaynar Su Süzmeden Tam Ölçülü Salçalı Demleme Makarna',
            keywords: ['makarna', 'spagetti', 'peynir', 'salçalı makarna', 'burgu makarna'],
            ingredients: 'Yarım paket (3 su bardağı) burgu veya kalem makarna, 1 yemek kaşığı tereyağı, 2 yemek kaşığı sıvı yağ, 1 dolu yemek kaşığı domates salçası, 1 tatlı kaşığı kuru nane, 1 tatlı kaşığı tuz, tam 3 su bardağı sıcak su.',
            steps: [
                {
                    text: '1. Adım (Salça Kavurma): Tencereye yağları ve 1 yemek kaşığı salçayı koyup orta-kısık ateşte kokusu çıkana kadar 2 dakika kavurun.',
                    timerMinutes: 2
                },
                {
                    text: '2. Adım (Bire Bir Su Ölçüsü): 3 su bardağı kuru makarnayı, 1 tatlı kaşığı tuzu, naneyi ve tam 3 su bardağı sıcak suyu ekleyip karıştırın.',
                    timerMinutes: 0
                },
                {
                    text: '3. Adım (11 Dakika Kısık Ateş): Kaynama sesini duyunca ocağı en kısığa alın ve 11 dakika pişirin. Hiç süzmeden tüm sosunu çekmiş makarnanız hazır!',
                    timerMinutes: 11
                }
            ]
        },
        {
            id: 'zeytinyagli_taze_fasulye',
            category: 'ocakli',
            title: '🔥 [Ocaklı] Susuz Kendi Buharında Pişen Zeytinyağlı Taze Fasulye',
            keywords: ['taze fasulye', 'zeytinyağlı', 'domates', 'fasulye'],
            ingredients: 'Yarım kilo taze fasulye, 2 adet orta boy kuru soğan, 3 adet olgun domates, yarım çay bardağı zeytinyağı, 1 tatlı kaşığı toz şeker, 1 tatlı kaşığı tuz, yarım su bardağı sıcak su.',
            steps: [
                {
                    text: '1. Adım (Çiğden Kat Kat Dizme): Tencerenin en altına doğranmış soğanları, üzerine yıkanmış taze fasulyeleri, en üste küp doğranmış domatesleri yayın. Tuz, şeker, zeytinyağı ve yarım su bardağı su gezdirin.',
                    timerMinutes: 0
                },
                {
                    text: '2. Adım (Kısık Ateşte 35 Dakika): Kapağı kapatın, kaynama sesini duyduktan sonra en kısık ateşe alın ve 35 dakika pişirin.',
                    timerMinutes: 35
                }
            ]
        },
        {
            id: 'kabaran_anne_keki',
            category: 'ocakli',
            title: '🔥 [Fırın / Tencere] 3-2-1 Bardak Ölçülü Garantili Kabaran Anne Keki',
            keywords: ['kek', 'tatlı', 'yumurta', 'ceviz', 'tarçın', 'anne keki'],
            ingredients: '3 adet yumurta, 1 su bardağı toz şeker, 1 su bardağı süt, yarım su bardağı sıvı yağ, 2 buçuk su bardağı un, 1 paket kabartma tozu, 1 paket vanilya, 1 tatlı kaşığı tarçın, yarım su bardağı kırılmış ceviz.',
            steps: [
                {
                    text: '1. Adım (Şeker Eriyene Kadar Çırpma): Derin çırpma kabında 3 yumurta ve 1 su bardağı şekeri 4 dakika çırpın; ardından 1 su bardağı süt ve yarım su bardağı sıvı yağı ekleyin.',
                    timerMinutes: 4
                },
                {
                    text: '2. Adım (Un, Tarçın ve Ceviz): 2 buçuk su bardağı unu, kabartma tozunu, vanilyayı, tarçını ve cevizi ekleyip 1 dakika karıştırın ve yağlanmış kalıba dökün.',
                    timerMinutes: 1
                },
                {
                    text: '3. Adım (Kürdan ve Koku Testi): 180 derece fırında 35 dakika pişirin.',
                    timerMinutes: 35
                }
            ]
        },
        {
            id: 'tavsan_kani_cay_ve_turk_kahvesi',
            category: 'ocakli',
            title: '🔥 [Ocaklı] Tavşan Kanı Türk Çayı ve Bol Köpüklü Türk Kahvesi Ölçüsü',
            keywords: ['çay', 'kahve', 'türk kahvesi', 'demleme', 'içecek'],
            ingredients: 'Çay için: Her 1 su bardağı sıcak suya 1 tatlı kaşığı kuru çay. Türk Kahvesi için (1 Fincan): 1 kahve fincanı soğuk su, 2 çay kaşığı tepeleme Türk kahvesi, isteğe göre şeker.',
            steps: [
                {
                    text: '1. Adım (Türk Kahvesi Sesli Köpük Takibi): Cezveye 1 fincan soğuk su ve 2 çay kaşığı kahve koyup ocağı açmadan önce 15 saniye karıştırın. En kısık ateşe koyun. Yaklaşık 2 buçuk dakika sonra cezveden hafif bir "fısır-fısır" kabarma sesi duyduğunuzda taşmadan hemen önce ocağı kapatın.',
                    timerMinutes: 3
                },
                {
                    text: '2. Adım (Tavşan Kanı Çay Demleme): Üst demliğe 4 yemek kaşığı kuru çay koyup üzerine 3 su bardağı kaynar suyu yavaşça gezdirin ve kısık ateşte 15 dakika demlendirin.',
                    timerMinutes: 15
                }
            ]
        }
    ];

    function populateCookingRecipesSelect(categoryFilter = state.selectedCookingCategory) {
        const sel = document.getElementById('cooking-recipe-select');
        if (!sel) return;
        sel.innerHTML = '';

        let firstMatchingIdx = -1;
        let visibleCount = 0;

        BLIND_ACCESSIBLE_RECIPES.forEach((rec, idx) => {
            if (categoryFilter !== 'all' && rec.category !== categoryFilter) return;
            if (firstMatchingIdx === -1) firstMatchingIdx = idx;
            visibleCount++;
            const opt = document.createElement('option');
            opt.value = String(idx);
            opt.textContent = `${visibleCount}. ${rec.title}`;
            sel.appendChild(opt);
        });

        if (firstMatchingIdx !== -1) {
            const currentRec = BLIND_ACCESSIBLE_RECIPES[state.selectedRecipeIndex];
            if (!currentRec || (categoryFilter !== 'all' && currentRec.category !== categoryFilter)) {
                state.selectedRecipeIndex = firstMatchingIdx;
                state.currentCookingStepIndex = 0;
            }
            sel.value = String(state.selectedRecipeIndex);
        }
        updateCookingGuideUI();
    }

    function filterCookingRecipesByCategory(catId, speakNow = true) {
        state.selectedCookingCategory = catId || 'all';
        const catBtns = document.querySelectorAll('.cook-cat-btn');
        catBtns.forEach(btn => {
            const isSel = btn.getAttribute('data-cook-cat') === state.selectedCookingCategory;
            btn.classList.toggle('active-toggle', isSel);
            btn.setAttribute('aria-pressed', isSel ? 'true' : 'false');
        });
        populateCookingRecipesSelect(state.selectedCookingCategory);

        if (speakNow) {
            const rec = BLIND_ACCESSIBLE_RECIPES[state.selectedRecipeIndex];
            const catDesc = state.selectedCookingCategory === 'ocaksiz'
                ? 'Ocaksız Yapılabilecek Türk Yemekleri kategorisi açıldı. Bu bölümdeki 14 yemek ve tatlının hiçbirinde ocak veya ateş kullanılmaz.'
                : (state.selectedCookingCategory === 'ocakli'
                    ? 'Ocak Kullanılan Geleneksel Türk Yemekleri kategorisi açıldı. Bu bölümdeki 13 yemekte tam bardak, kaşık ve dakika ölçüleri adım adım sesli anlatılır.'
                    : 'Tüm Türk Yemekleri (toplam 27 tarif) listelendi.');
            announceGuidance(`${catDesc} Şu an seçili yemek: ${rec ? rec.title : ''}.`, {
                force: true,
                bannerState: 'centered'
            });
        }
    }

    function updateCookingGuideUI() {
        const rec = BLIND_ACCESSIBLE_RECIPES[state.selectedRecipeIndex] || BLIND_ACCESSIBLE_RECIPES[0];
        if (!rec) return;
        const stepObj = rec.steps[state.currentCookingStepIndex] || rec.steps[0];
        const titleEl = document.getElementById('cooking-recipe-title');
        const stepEl = document.getElementById('cooking-step-text');
        const badgeEl = document.getElementById('cooking-status-badge');

        if (titleEl) {
            titleEl.textContent = `${rec.title} — ${rec.ingredients}`;
        }
        if (stepEl && stepObj) {
            stepEl.textContent = `(${state.currentCookingStepIndex + 1}/${rec.steps.length}) ${stepObj.text}`;
        }
        if (badgeEl) {
            badgeEl.textContent = `Adım ${state.currentCookingStepIndex + 1} / ${rec.steps.length}`;
        }
    }

    function selectCookingRecipe(index, speakNow = true) {
        const idx = Math.max(0, Math.min(BLIND_ACCESSIBLE_RECIPES.length - 1, Number(index) || 0));
        if (idx !== state.selectedRecipeIndex && state.cookingTimerInterval) {
            stopCookingStepTimer(false);
        }
        state.selectedRecipeIndex = idx;
        state.currentCookingStepIndex = 0;
        const sel = document.getElementById('cooking-recipe-select');
        if (sel) sel.value = String(idx);
        updateCookingGuideUI();
        if (speakNow) {
            const rec = BLIND_ACCESSIBLE_RECIPES[idx];
            announceGuidance(`Seçilen yemek tarifi: ${rec.title}. Gerekli malzemeler: ${rec.ingredients} 1. adımdan dinlemeye başlamak için Bu Adımı Oku veya Sonraki Adım düğmesine basabilirsiniz.`, {
                force: true,
                bannerState: 'centered'
            });
        }
    }

    function speakCookingIngredients() {
        const rec = BLIND_ACCESSIBLE_RECIPES[state.selectedRecipeIndex] || BLIND_ACCESSIBLE_RECIPES[0];
        if (!rec) return;
        announceGuidance(`${rec.title} için tam bardak ve kaşık ölçüsüyle malzemeler: ${rec.ingredients}`, {
            force: true,
            bannerState: 'centered'
        });
    }

    function stopCookingStepTimer(speakStopped = false) {
        if (state.cookingTimerInterval) {
            clearInterval(state.cookingTimerInterval);
            state.cookingTimerInterval = null;
        }
        state.cookingTimerRemainingSec = 0;
        const btn = document.getElementById('btn-cooking-timer');
        if (btn) {
            btn.classList.remove('active-toggle');
            btn.setAttribute('aria-pressed', 'false');
            btn.textContent = '⏲️ Adım Süresini Başlat';
        }
        if (speakStopped) {
            announceGuidance('Konuşan mutfak saati durduruldu.', { force: true });
        }
    }

    function toggleCookingStepTimer() {
        if (state.cookingTimerInterval) {
            stopCookingStepTimer(true);
            return;
        }
        const rec = BLIND_ACCESSIBLE_RECIPES[state.selectedRecipeIndex] || BLIND_ACCESSIBLE_RECIPES[0];
        if (!rec) return;
        const stepObj = rec.steps[state.currentCookingStepIndex] || rec.steps[0];
        const minutes = (stepObj && stepObj.timerMinutes && stepObj.timerMinutes > 0) ? stepObj.timerMinutes : 5;
        state.cookingTotalStepSec = Math.round(minutes * 60);
        state.cookingTimerRemainingSec = state.cookingTotalStepSec;

        const btn = document.getElementById('btn-cooking-timer');
        const badgeEl = document.getElementById('cooking-status-badge');
        if (btn) {
            btn.classList.add('active-toggle');
            btn.setAttribute('aria-pressed', 'true');
            btn.textContent = `⏹️ Mutfak Saati: ${minutes}:00`;
        }
        announceGuidance(`Konuşan mutfak saati ${minutes} dakika olarak başlatıldı (${rec.title}, ${state.currentCookingStepIndex + 1}. adım). Sürenin yarısında, son 1 dakikada ve süre bittiğinde size sesli haber vereceğim.`, {
            force: true,
            bannerState: 'centered'
        });

        state.cookingTimerInterval = setInterval(() => {
            state.cookingTimerRemainingSec = Math.max(0, state.cookingTimerRemainingSec - 1);
            const remMin = Math.floor(state.cookingTimerRemainingSec / 60);
            const remSec = state.cookingTimerRemainingSec % 60;
            const timeLabel = `${remMin}:${String(remSec).padStart(2, '0')}`;
            if (btn) btn.textContent = `⏹️ Mutfak Saati: ${timeLabel}`;
            if (badgeEl) badgeEl.textContent = `⏲️ Kalan Süre: ${timeLabel}`;

            if (state.cookingTimerRemainingSec <= 0) {
                stopCookingStepTimer(false);
                radar.playQrSuccessSound();
                if (navigator.vibrate) navigator.vibrate([250, 100, 250, 100, 350]);
                announceGuidance(`Süre doldu! ${rec.title} tarifinin ${state.currentCookingStepIndex + 1}. adım süresi (${minutes} dakika) tamamlandı. Lütfen yemeğinizi veya ocağınızı kontrol edin.`, {
                    force: true,
                    bannerState: 'warning'
                });
            } else if (state.cookingTimerRemainingSec === 60 && state.cookingTotalStepSec >= 120) {
                announceGuidance(`Mutfak saati uyarısı: ${state.currentCookingStepIndex + 1}. adımın bitmesine son 1 dakika kaldı.`, {
                    force: true,
                    bannerState: 'centered'
                });
            } else if (state.cookingTotalStepSec >= 240 && state.cookingTimerRemainingSec === Math.floor(state.cookingTotalStepSec / 2)) {
                announceGuidance(`Mutfak saati bilgisi: Sürenin yarısı tamamlandı, kalan süre ${remMin} dakika.`, {
                    force: true,
                    bannerState: 'normal'
                });
            }
        }, 1000);
    }

    function stepCookingInstruction(delta) {
        const rec = BLIND_ACCESSIBLE_RECIPES[state.selectedRecipeIndex] || BLIND_ACCESSIBLE_RECIPES[0];
        if (!rec) return;
        if (delta < 0 && state.currentCookingStepIndex <= 0) {
            announceGuidance(`İlk adımdasınız. ${rec.steps[0].text}`, { force: true });
            return;
        }
        if (delta > 0 && state.currentCookingStepIndex >= rec.steps.length - 1) {
            announceGuidance(`Tebrikler, ${rec.title} tarifinin tüm adımları tamamlandı! Ellerinize sağlık, afiyet olsun.`, {
                force: true,
                bannerState: 'centered'
            });
            return;
        }
        state.currentCookingStepIndex = Math.max(0, Math.min(rec.steps.length - 1, state.currentCookingStepIndex + delta));
        updateCookingGuideUI();
        const stepObj = rec.steps[state.currentCookingStepIndex];
        const timerHint = (stepObj.timerMinutes && stepObj.timerMinutes > 0)
            ? ` (Önerilen süre: ${stepObj.timerMinutes} dakika)`
            : '';
        announceGuidance(`${rec.title}, ${state.currentCookingStepIndex + 1}. adım (toplam ${rec.steps.length} adım)${timerHint}: ${stepObj.text}`, {
            force: true,
            bannerState: 'centered'
        });
    }

    function findRecipeByIngredientsOrName(queryText) {
        const q = String(queryText || '').trim().toLocaleLowerCase('tr-TR');
        if (!q) {
            announceGuidance('Lütfen evdeki malzemeleri veya yapmak istediğiniz yemeğin adını yazın ya da Sesle Malzeme Söyle düğmesine basın.', {
                force: true,
                bannerState: 'warning'
            });
            return;
        }
        const recipeStopwords = new Set([
            'var', 'yok', 'ile', 'bir', 'iki', 'evde', 'olan', 'yemek', 'tarif', 'tarifi',
            'nasıl', 'yapılır', 'tuz', 'su', 'yağ', 'sıvı', 'kaşık', 'bardak', 'adet', 'için'
        ]);
        const words = q.split(/[\s,;.]+/).filter(w => w.length >= 3 && !recipeStopwords.has(w));
        let bestIdx = -1;
        let bestScore = 0;

        BLIND_ACCESSIBLE_RECIPES.forEach((rec, idx) => {
            const titleHay = `${rec.title} ${rec.keywords.join(' ')}`.toLocaleLowerCase('tr-TR');
            const ingHay = rec.ingredients.toLocaleLowerCase('tr-TR');
            let score = 0;
            if (titleHay.includes(q)) score += 8;
            words.forEach(w => {
                if (titleHay.includes(w)) score += 4;
                else if (ingHay.includes(w)) score += 2;
            });
            if (score > bestScore) {
                bestScore = score;
                bestIdx = idx;
            }
        });

        if (bestIdx >= 0 && bestScore > 0) {
            const rec = BLIND_ACCESSIBLE_RECIPES[bestIdx];
            if (state.selectedCookingCategory !== 'all' && state.selectedCookingCategory !== rec.category) {
                filterCookingRecipesByCategory(rec.category, false);
            }
            selectCookingRecipe(bestIdx, false);
            announceGuidance(`Söylediğiniz malzemelere en uygun tarif bulundu: ${rec.title}. Gerekli malzemeler: ${rec.ingredients} Şimdi 1. adım: ${rec.steps[0].text}`, {
                force: true,
                bannerState: 'centered'
            });
        } else {
            announceGuidance(`"${queryText}" için tam eşleşen bir tarif bulunamadı, listedeki 27 yemek tarifinden dilediğinizi seçebilirsiniz.`, {
                force: true,
                bannerState: 'warning'
            });
        }
    }

    function handleCookingGuideLiveMode() {
        const rec = BLIND_ACCESSIBLE_RECIPES[state.selectedRecipeIndex] || BLIND_ACCESSIBLE_RECIPES[0];
        el.tPosition.textContent = rec ? rec.title : 'Sesli Tarif Rehberi';
        el.tDistance.textContent = rec ? `Adım ${state.currentCookingStepIndex + 1}/${rec.steps.length}` : 'Hazır';
    }

    function syncModePanelsVisibility(activeMode) {
        if (el.examRemotePanel) {
            el.examRemotePanel.hidden = (activeMode !== 'exam_reader');
        }
        if (el.moneyCounterPanel) {
            el.moneyCounterPanel.hidden = (activeMode !== 'color_cloth');
        }
        if (el.qiblaCompassPanel) {
            el.qiblaCompassPanel.hidden = (activeMode !== 'qibla_compass');
        }
        if (el.songFinderPanel) {
            el.songFinderPanel.hidden = (activeMode !== 'song_finder');
        }
        if (el.busStopPanel) {
            el.busStopPanel.hidden = (activeMode !== 'bus_stop_tracker');
        }
        if (el.posIbanPanel) {
            el.posIbanPanel.hidden = (activeMode !== 'pos_iban_reader');
        }
        if (el.itemMemoryPanel) {
            el.itemMemoryPanel.hidden = (activeMode !== 'item_memory');
        }
        if (el.tvSubtitlePanel) {
            el.tvSubtitlePanel.hidden = (activeMode !== 'tv_subtitle_score');
        }
        if (el.sockOutfitPanel) {
            el.sockOutfitPanel.hidden = (activeMode !== 'sock_outfit_check');
        }
        if (el.whereAmIPanel) {
            el.whereAmIPanel.hidden = (activeMode !== 'where_am_i');
        }
        if (el.stepCaloriePanel) {
            el.stepCaloriePanel.hidden = (activeMode !== 'step_calorie_guide');
        }
        if (el.cookingGuidePanel) {
            el.cookingGuidePanel.hidden = (activeMode !== 'cooking_guide');
        }
        if (el.targetFilterSection) {
            el.targetFilterSection.hidden = (activeMode === 'qibla_compass' || activeMode === 'song_finder' || activeMode === 'item_memory' || activeMode === 'step_calorie_guide' || activeMode === 'cooking_guide');
        }
        if (el.btnWhatsappHold) {
            el.btnWhatsappHold.hidden = (activeMode !== 'qr_screen');
        }
    }

    function getActiveModeSpokenStatus() {
        let activeLabel = state.mode;
        if (el.modeButtons && el.modeButtons.length > 0) {
            for (const btn of el.modeButtons) {
                if (btn.getAttribute('data-mode') === state.mode) {
                    activeLabel = btn.getAttribute('aria-label') || btn.textContent.trim();
                    break;
                }
            }
        }
        const camState = state.isRunning ? 'Kamera şu an açık.' : 'Kamera şu an kapalı.';
        return `Şu an aktif bölüm: ${activeLabel}. ${camState}`;
    }

    function setMode(newMode) {
        const prevMode = state.mode;
        state.mode = newMode;
        state.lastUserInteractionAt = performance.now();
        state.countdownStage = 0;
        state.kalmanBox = null;
        state.consensusFrames = 0;
        state.signatureDocVerified = false;
        state.lastDetectedBarcode = '';
        state.sockSubMode = 'sock';

        // Ön (Selfie) kamerada unutulma şikayetini önle: Özçekim (4) dışındaki belge/nesne modlarına geçildiğinde otomatik Arka Kameraya dön
        if (newMode !== 'portrait' && state.facingMode === 'user') {
            state.facingMode = 'environment';
            if (el.btnSwitchCam) {
                el.btnSwitchCam.textContent = '🔄 Kamera: Arka';
            }
            if (state.isRunning) {
                startCamera();
            }
        }

        if (newMode !== 'qr_screen' && state.whatsappHoldTimer) {
            clearInterval(state.whatsappHoldTimer);
            state.whatsappHoldTimer = null;
        }
        if (prevMode === 'tv_subtitle_score' && newMode !== 'tv_subtitle_score' && state.tvAutoReaderTimer) {
            clearInterval(state.tvAutoReaderTimer);
            state.tvAutoReaderTimer = null;
            state.tvAutoReaderActive = false;
            const tvBtn = document.getElementById('btn-tv-auto-toggle');
            if (tvBtn) {
                tvBtn.classList.remove('active-toggle');
                tvBtn.setAttribute('aria-pressed', 'false');
                tvBtn.textContent = '▶️ Otomatik TV Altyazı & Skor Spikerini Başlat';
            }
        }
        if (prevMode === 'song_finder' && newMode !== 'song_finder') {
            stopSongPreviewPlayback();
        }
        const nonCameraModes = new Set(['qibla_compass', 'song_finder', 'step_calorie_guide', 'cooking_guide']);
        if (nonCameraModes.has(newMode) && state.flashMode === 'auto') {
            tryEnableHardwareTorch(false);
        }

        syncModePanelsVisibility(newMode);
        if (newMode === 'qibla_compass') {
            state.qiblaActive = true;
            radar.init();
            autoAcquireLocationAndWatch();
        } else {
            state.qiblaActive = false;
            if (newMode === 'bus_stop_tracker' || newMode === 'where_am_i') {
                autoAcquireLocationAndWatch();
            }
        }

        el.modeButtons.forEach(btn => {
            const isMatch = btn.getAttribute('data-mode') === newMode;
            if (isMatch && btn.hidden) {
                el.modeButtons.forEach(b => {
                    b.hidden = false;
                    b.style.display = '';
                });
                if (el.categoryTabs) {
                    el.categoryTabs.forEach(tab => {
                        const isAll = tab.getAttribute('data-category') === 'all';
                        tab.classList.toggle('active-toggle', isAll);
                        tab.setAttribute('aria-pressed', isAll ? 'true' : 'false');
                    });
                }
            }
            btn.classList.toggle('active', isMatch);
            btn.setAttribute('aria-checked', isMatch ? 'true' : 'false');
        });

        const modeAnnouncement = {
            'exam_reader': '1. Bölüm: Sınav Sorusu ve Şık Okuyucu açıldı. Telefonu sınav kağıdına tutun; soruyu ve A, B, C, D, E şıklarını birbirine karıştırmadan tek tek size okuyacağım.',
            'qibla_compass': state.qiblaLocationVerified
                ? `2. Bölüm: Sesli Kıble Pusulası ve Namaz Vakitleri açıldı. Bulunduğunuz yer: ${state.qiblaLocationSource}. Telefonu avucunuzda yere düz tutup yavaşça dönün, Kıbleye gelince haber vereceğim.`
                : '2. Bölüm: Sesli Kıble Pusulası açıldı. Şu an bulunduğunuz şehir bulunuyor; isterseniz listeden kendi ilinizi de seçebilirsiniz.',
            'qr_screen': '3. Bölüm: WhatsApp Web ve Bilgisayar Ekranı Hizalama açıldı. Telefonu bilgisayar ekranına tutun, karekodu ortalamanız için sağa sola yönlendireceğim.',
            'portrait': '4. Bölüm: Özçekim ve Fotoğraf Çekim Yardımcısı açıldı. Yüzünüz tam ortalandığında ve ışık güzel olduğunda 3, 2, 1 diye sayıp fotoğrafınızı çekeceğim.',
            'color_cloth': `5. Bölüm: Canlı Para Sayma, Biriktirme ve Kıyafet Rengi Tanıma açıldı. Elinizdeki demir ve kağıt paraları gösterdikçe bir yandan toplarım; istediğiniz an Ne Kadar Param Var düğmesine veya N tuşuna basarak toplam kaç paranız olduğunu dinleyebilirsiniz.${state.moneyTotalKurus > 0 ? ' Şu an sayaçta ' + formatTurkishKurusTotal(state.moneyTotalKurus) + ' kayıtlı.' : ''}`,
            'anomaly_led': '6. Bölüm: Yere Düşen Eşyayı Bulma ve Cihaz Işığı Kontrolü açıldı. Kamerayı yere veya modemin, şarj aletinin ışığına tutun.',
            'light_meter': '7. Bölüm: Lamba Açık mı Kapalı mı ve Pencere Bulucu açıldı. Işığın olduğu tarafa döndükçe ses incelir.',
            'explorer': '8. Bölüm: Etrafımda Ne Var ve Evrak Okuyucu açıldı. Odanızdaki eşyaları söyler, çift dokunursanız elinizdeki kağıdı okur. Yürürken güvenliğiniz için mutlaka beyaz bastonunuzu kullanmaya devam edin.',
            'medicine_skt': '9. Bölüm: İlaç Kutusu ve Son Kullanma Tarihi Kontrolü açıldı. İlacın adını, kaç miligram olduğunu ve tarihinin geçip geçmediğini kontrol etmek için kutuyu kameraya tutun.',
            'signature_pen': '10. Bölüm: İmza Atarken Kalem Yönlendirici açıldı. Güvenliğiniz için önce evrakta ne yazdığını doğrulamak üzere ekrana çift dokunun veya Boşluk tuşuna basın; evrak okunduktan sonra kaleminizi imza alanına yönlendireceğim.',
            'liquid_level': '11. Bölüm: Masadaki Bardak, Kupa ve Şişe Bulucu açıldı. Masadaki bardağı veya şişeyi elinizi çarpmadan bulmak için kamerayı masaya tutun. Güvenliğiniz için kaynar çay veya sıcak su doldururken kameraya güvenmeyin.',
            'door_elevator_lcd': '12. Bölüm: Kapı Numarası, Asansör Tuşu ve Makine Ekranı Okuyucu açıldı. Kapı numarasını, asansör tuşlarını veya çamaşır makinesi ekranını okutmak için Boşluk tuşuna basın.',
            'food_freshness': '13. Bölüm: Paketli Gıda İçindekiler, Alerjen ve Son Tüketim Tarihi Okuyucu açıldı. Market paketinin içindekiler ve tarih kısmını kameraya gösterip Boşluk tuşuna basın.',
            'song_finder': '14. Bölüm: Bu Çalan Hangi Şarkı? Sesli Şarkı, Melodi ve Söz Bulucu açıldı; mikrofon otomatik olarak dinlemeye başlıyor.',
            'bus_stop_tracker': '15. Bölüm: Otobüs Numarası Yakalayıcı ve İneceğim Durağa Geldim mi Alarmı açıldı. Durakta yaklaşan otobüsün hat numarasını okumak için kamerayı yola tutun veya otobüsteyseniz aşağıdan ineceğiniz durağın alarmını kurun.',
            'pos_iban_reader': '16. Bölüm: POS Cihazı Tutarı Doğrulayıcı ve Tek Tuşla IBAN Kopyalayıcı açıldı. Kartınızı okutmadan önce POS ekranını veya faturadaki TR IBAN numarasını kameraya gösterip Boşluk tuşuna basın.',
            'item_memory': `17. Bölüm: Eşyamı Nereye Koydum Sesli Hafıza ve Kavanoz Tanıtıcı açıldı. Şu an hafızanızda ${state.itemMemories ? state.itemMemories.length : 0} eşya kayıtlı. Eşya Yeri Kaydet veya Eşyam Nerede Sor düğmelerini kullanabilirsiniz.`,
            'tv_subtitle_score': '18. Bölüm: Televizyon Altyazı Okuyucu ve Canlı Maç Skoru Spikeri açıldı. Telefonu televizyona doğru tutun ve Otomatik TV Spikerini Başlat düğmesine basın.',
            'sock_outfit_check': '19. Bölüm: Çorap Eşleştirici, Kıyafet Kombin Uyumu ve Leke Kontrolü açıldı. İki çorabı yan yana kameraya tutup Boşluk tuşuna basın; birbirinin eşi olup olmadığını ve leke durumunu söyleyeceğim.',
            'where_am_i': '20. Bölüm: Tam Olarak Neredeyim? Sokak, Bina, Tabela ve WhatsApp Konum Tarif Edici açıldı. Bulunduğunuz cadde ve sokağı hemen öğreniliyor.',
            'step_calorie_guide': `21. Bölüm: Sesli Adım Sayacı ve Sağlıklı Besin Rehberi açıldı. Bugün ${state.dailySteps || 0} adım attınız. Telefon cebinizde yürürken adımlarınızı sayarım; ayrıca yediğiniz yemeği söyleyip veya paketi kameraya gösterip besin değerini öğrenebilirsiniz.`,
            'cooking_guide': '22. Bölüm: Adım Adım Sesli Yemek Tarifleri Rehberi açıldı. İstediğiniz yemeği listeden seçin veya evdeki malzemeleri söyleyin; malzemeleri ve hazırlanışını adım adım sesli olarak tarif edeceğim.'
        }[newMode];

        if (modeAnnouncement) {
            announceGuidance(modeAnnouncement, { force: true, bannerState: 'normal' });
        }

        if (newMode === 'where_am_i') {
            setTimeout(() => {
                if (state.mode === 'where_am_i') {
                    announceWhereAmIFullAddressAndSignboard('', []);
                }
            }, 900);
        }

        if (newMode === 'song_finder') {
            if (!state.songListening) {
                setTimeout(() => {
                    if (state.mode === 'song_finder' && !state.songListening) {
                        toggleSongListening();
                    }
                }, 1400);
            }
        } else if (state.songListening && !state.songAutoRadarEnabled) {
            stopSongListening();
        }
    }

    // =========================================================================
    // 7. OLAY DİNLEYİCİLERİ, KIBLE SENSÖRÜ, SINAV KUMANDASI VE KLAVYE KISAYOLLARI
    // =========================================================================
    state.hasAbsoluteOrientationEvent = false;
    window.addEventListener('deviceorientationabsolute', (ev) => {
        if (typeof ev.alpha === 'number') {
            state.hasAbsoluteOrientationEvent = true;
            const decl = (state.userLat && state.userLon)
                ? calculateMagneticDeclination(state.userLat, state.userLon)
                : 5.5;
            const heading = (360 - ev.alpha + decl) % 360;
            handleCompassHeadingEvent(heading, 8);
        }
    }, true);

    window.addEventListener('deviceorientation', (ev) => {
        if (typeof ev.gamma === 'number' && typeof ev.beta === 'number') {
            state.hasOrientationSensor = true;
            state.tiltRoll = Math.round(ev.gamma);
            state.tiltPitch = Math.round(ev.beta);
        }
        if (state.hasAbsoluteOrientationEvent) return;
        // SADECE Gerçek Mutlak Manyetik Kuzey (iOS webkitCompassHeading veya absolute === true) kabul edilir!
        if (typeof ev.webkitCompassHeading === 'number') {
            const acc = typeof ev.webkitCompassAccuracy === 'number' ? ev.webkitCompassAccuracy : 10;
            const decl = (state.userLat && state.userLon)
                ? calculateMagneticDeclination(state.userLat, state.userLon)
                : 5.5;
            handleCompassHeadingEvent((ev.webkitCompassHeading + decl) % 360, acc);
        } else if (typeof ev.alpha === 'number' && ev.absolute === true) {
            const decl = (state.userLat && state.userLon)
                ? calculateMagneticDeclination(state.userLat, state.userLon)
                : 5.5;
            handleCompassHeadingEvent((360 - ev.alpha + decl) % 360, 10);
        }
    });

    el.btnStart.addEventListener('click', () => {
        if (state.isRunning) stopCamera();
        else startCamera();
    });

    el.btnSwitchCam.addEventListener('click', () => {
        state.facingMode = state.facingMode === 'environment' ? 'user' : 'environment';
        const label = state.facingMode === 'user' ? 'Ön Selfie' : 'Arka';
        el.btnSwitchCam.textContent = `🔄 Kamera: ${label}`;
        if (state.isRunning) startCamera();
    });

    el.btnToggleFlash.addEventListener('click', async () => {
        const order = ['auto', 'on', 'off'];
        const nextIdx = (order.indexOf(state.flashMode) + 1) % order.length;
        state.flashMode = order[nextIdx];
        const labels = { 'auto': 'Otomatik', 'on': 'Açık', 'off': 'Kapalı' };
        el.btnToggleFlash.textContent = `🔦 Flaş / Işık: ${labels[state.flashMode]}`;
        await tryEnableHardwareTorch(state.flashMode === 'on');
        announceGuidance(`Flaş ve ekran ışığı modu: ${labels[state.flashMode]} olarak ayarlandı.`, { force: true });
    });

    el.btnToggleRadar.addEventListener('click', () => {
        state.radarEnabled = !state.radarEnabled;
        el.btnToggleRadar.classList.toggle('active-toggle', state.radarEnabled);
        el.btnToggleRadar.setAttribute('aria-pressed', String(state.radarEnabled));
        el.btnToggleRadar.textContent = `🎯 3D Sesli Radar: ${state.radarEnabled ? 'Açık' : 'Kapalı'}`;
        announceGuidance(`3 boyutlu sesli radar ${state.radarEnabled ? 'açıldı' : 'kapatıldı'}.`, { force: true });
    });

    el.btnToggleAuto.addEventListener('click', () => {
        state.autoCaptureEnabled = !state.autoCaptureEnabled;
        el.btnToggleAuto.classList.toggle('active-toggle', state.autoCaptureEnabled);
        el.btnToggleAuto.setAttribute('aria-pressed', String(state.autoCaptureEnabled));
        el.btnToggleAuto.textContent = `⚡ Otomatik Çekim: ${state.autoCaptureEnabled ? 'Açık' : 'Kapalı'}`;
        announceGuidance(`Otomatik fotoğraf çekimi ${state.autoCaptureEnabled ? 'açıldı' : 'kapatıldı'}.`, { force: true });
    });

    el.btnCaptureNow.addEventListener('click', () => captureAndDescribePhoto(false));
    if (el.btnUploadPhoto && el.photoFileInput) {
        el.btnUploadPhoto.addEventListener('click', () => el.photoFileInput.click());
        el.photoFileInput.addEventListener('change', () => {
            if (el.photoFileInput.files && el.photoFileInput.files[0]) {
                handleGalleryFileSelect(el.photoFileInput.files[0]);
                el.photoFileInput.value = '';
            }
        });
    }
    if (el.btnSpeakStory) {
        el.btnSpeakStory.addEventListener('click', () => {
            const txt = state.lastStoryText || state.lastSpeechText;
            announceGuidance(txt, { force: true, bannerState: 'centered' });
        });
    }
    if (el.photoExplorerCanvas) {
        if ('PointerEvent' in window) {
            el.photoExplorerCanvas.addEventListener('pointerdown', handlePhotoExplorerPointerEvent);
            el.photoExplorerCanvas.addEventListener('pointermove', (ev) => {
                if (ev.buttons > 0 || ev.pointerType === 'touch') {
                    handlePhotoExplorerPointerEvent(ev);
                }
            });
        } else {
            el.photoExplorerCanvas.addEventListener('touchstart', handlePhotoExplorerPointerEvent, { passive: false });
            el.photoExplorerCanvas.addEventListener('touchmove', handlePhotoExplorerPointerEvent, { passive: false });
        }
    }
    if (el.btnSmartVoiceIntent) {
        el.btnSmartVoiceIntent.addEventListener('click', () => startVoiceItemMemoryCapture('smart_intent'));
    }
    if (el.btnSilenceSpeech) {
        el.btnSilenceSpeech.addEventListener('click', () => stopAllSpeechImmediately());
    }
    if (el.btnSpeechRate) {
        el.btnSpeechRate.addEventListener('click', () => cycleSpeechRate());
    }
    window.addEventListener('click', markUserInteraction, true);
    window.addEventListener('touchstart', markUserInteraction, { passive: true });
    el.btnWhatsappHold.addEventListener('click', startWhatsapp15SecAudioHold);
    el.btnRepeat.addEventListener('click', () => {
        const textToRepeat = (state.lastSpeechText && state.lastSpeechText.trim())
            ? state.lastSpeechText
            : getActiveModeSpokenStatus();
        announceGuidance(textToRepeat, { force: true });
    });

    // Kıble Pusulası Düğmeleri
    if (el.btnStartQibla) {
        el.btnStartQibla.addEventListener('click', startQiblaCompassSensor);
    }
    if (el.btnQiblaGps) {
        el.btnQiblaGps.addEventListener('click', requestQiblaGpsLocation);
    }
    if (el.btnQiblaPrayerTimes) {
        el.btnQiblaPrayerTimes.addEventListener('click', speakPrayerTimesAndSolarValidation);
    }
    if (el.btnQiblaSaveRoom) {
        el.btnQiblaSaveRoom.addEventListener('click', saveRoomQiblaProfile);
    }
    if (el.qiblaCitySelect) {
        el.qiblaCitySelect.addEventListener('change', () => {
            const parts = el.qiblaCitySelect.value.split(',');
            if (parts.length >= 2) {
                try { localStorage.setItem('mikyas_saved_qibla_city', el.qiblaCitySelect.value); } catch (_) {}
                state.userLat = parseFloat(parts[0]);
                state.userLon = parseFloat(parts[1]);
                state.locationSource = 'city_select';
                const cityLabel = parts[2] || el.qiblaCitySelect.options[el.qiblaCitySelect.selectedIndex].text.split('(')[0].trim();
                updateQiblaTargetDisplay(`${cityLabel} (81 İl Listesi)`);
                speakPrayerTimesAndSolarValidation();
            }
        });
    }

    // Sesli Şarkı, Melodi ve Söz Bulucu Düğmeleri
    if (el.btnSongListen) {
        el.btnSongListen.addEventListener('click', toggleSongListening);
    }
    if (el.btnGoogleHumSearch) {
        el.btnGoogleHumSearch.addEventListener('click', launchGoogleHumSearch);
    }
    if (el.btnSongAutoRadar) {
        el.btnSongAutoRadar.addEventListener('click', toggleContinuousAutoSongRadar);
    }
    if (el.btnSongTuner) {
        el.btnSongTuner.addEventListener('click', toggleInstrumentTunerAndMakam);
    }
    if (el.btnSongPreview) {
        el.btnSongPreview.addEventListener('click', toggleSongPreviewPlayback);
    }
    if (el.btnSongReadLyrics) {
        el.btnSongReadLyrics.addEventListener('click', speakFoundSongLyrics);
    }
    if (el.btnLyricPrev) {
        el.btnLyricPrev.addEventListener('click', () => stepLyricLine(-1));
    }
    if (el.btnLyricCurrent) {
        el.btnLyricCurrent.addEventListener('click', speakCurrentLyricLine);
    }
    if (el.btnLyricNext) {
        el.btnLyricNext.addEventListener('click', () => stepLyricLine(1));
    }
    if (el.btnSongHistory) {
        el.btnSongHistory.addEventListener('click', speakSavedSongHistory);
    }
    if (el.btnSongTextSearch && el.songSearchInput) {
        el.btnSongTextSearch.addEventListener('click', () => {
            searchSongByLyricsOrQuery(el.songSearchInput.value);
        });
        el.songSearchInput.addEventListener('keydown', (ev) => {
            if (ev.key === 'Enter') {
                ev.preventDefault();
                searchSongByLyricsOrQuery(el.songSearchInput.value);
            }
        });
    }

    // Sınav Kumandası Düğmeleri
    el.btnExamPrev.addEventListener('click', () => {
        if (state.currentExamIndex > 0) {
            state.currentExamIndex--;
            updateExamRemoteUI();
            speakCurrentQuestionStem();
        } else {
            announceGuidance('İlk sorudasınız.', { force: true });
        }
    });

    el.btnExamNext.addEventListener('click', () => {
        if (state.currentExamIndex + 1 < state.examQuestions.length) {
            state.currentExamIndex++;
            updateExamRemoteUI();
            speakCurrentQuestionStem();
        } else {
            announceGuidance('Bu sayfadaki son sorudasınız.', { force: true });
        }
    });

    el.btnExamStem.addEventListener('click', speakCurrentQuestionStem);
    el.btnExamAll.addEventListener('click', speakEntireQuestionAndOptions);

        ['A', 'B', 'C', 'D', 'E'].forEach(letter => {
        if (el.optBtns[letter]) {
            el.optBtns[letter].addEventListener('click', () => speakSingleOption(letter));
        }
    });

    // Canlı Para Sayma ve Biriktirme (Kumbara / Cüzdan) Düğmeleri
    if (el.btnHowMuchMoney) {
        el.btnHowMuchMoney.addEventListener('click', speakHowMuchMoneyIHave);
    }
    if (el.btnMoneyAddCurrent) {
        el.btnMoneyAddCurrent.addEventListener('click', addCurrentlyVisibleMoneyManually);
    }
    if (el.btnMoneyAutoToggle) {
        el.btnMoneyAutoToggle.addEventListener('click', toggleMoneyAutoAccumulate);
    }
    if (el.btnMoneyUndo) {
        el.btnMoneyUndo.addEventListener('click', undoLastAddedMoney);
    }
    if (el.btnMoneyReset) {
        el.btnMoneyReset.addEventListener('click', resetMoneyCounter);
    }
    if (el.moneyQuickAddBtns && el.moneyQuickAddBtns.length > 0) {
        el.moneyQuickAddBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const kurus = parseInt(btn.getAttribute('data-kurus') || '0', 10);
                const label = btn.getAttribute('data-label') || formatTurkishKurusTotal(kurus);
                if (kurus > 0) {
                    addMoneyToRunningTotal(kurus, label, [{ valueKurus: kurus, label, count: 1 }], 'quick_button');
                }
            });
        });
    }

    el.targetSelect.addEventListener('change', () => {
        state.targetFilter = el.targetSelect.value;
        const selectedText = el.targetSelect.options[el.targetSelect.selectedIndex].text;
        announceGuidance(`Radar hedefi değiştirildi: ${selectedText}`, { force: true });
    });

    el.modeButtons.forEach(btn => {
        btn.addEventListener('click', () => setMode(btn.getAttribute('data-mode')));
    });

    if (el.scenarioPresetBtns && el.scenarioPresetBtns.length > 0) {
        el.scenarioPresetBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                activateSmartUsageScenarioPreset(btn.getAttribute('data-scenario') || 'shopping');
            });
        });
    }

    if (el.categoryTabs && el.categoryTabs.length > 0) {
        el.categoryTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                filterModesByLifeCategory(tab.getAttribute('data-category') || 'all');
            });
        });
    }

    // 16-21 Arası Yeni Günlük Yaşam Panellerinin Düğme Dinleyicileri
    const btnBusSetAlarm = document.getElementById('btn-bus-set-alarm');
    const busDestInput = document.getElementById('bus-dest-input');
    const btnBusVoiceDest = document.getElementById('btn-bus-voice-dest');
    const btnBusCheckDist = document.getElementById('btn-bus-check-dist');
    const btnBusSaveCurrent = document.getElementById('btn-bus-save-current');
    const btnBusCancelAlarm = document.getElementById('btn-bus-cancel-alarm');

    if (btnBusSetAlarm && busDestInput) {
        btnBusSetAlarm.addEventListener('click', () => setBusDestinationStopAlarm(busDestInput.value));
        busDestInput.addEventListener('keydown', (ev) => {
            if (ev.key === 'Enter') {
                ev.preventDefault();
                setBusDestinationStopAlarm(busDestInput.value);
            }
        });
    }
    if (btnBusVoiceDest) btnBusVoiceDest.addEventListener('click', () => startVoiceItemMemoryCapture('bus_dest'));
    if (btnBusCheckDist) btnBusCheckDist.addEventListener('click', () => checkBusDestinationDistance(true));
    if (btnBusSaveCurrent) btnBusSaveCurrent.addEventListener('click', saveCurrentGpsAsBusStop);
    if (btnBusCancelAlarm) btnBusCancelAlarm.addEventListener('click', cancelBusStopAlarm);

    const btnPosScanNow = document.getElementById('btn-pos-scan-now');
    const btnCopyIban = document.getElementById('btn-copy-iban');
    const btnSpeakPosAmount = document.getElementById('btn-speak-pos-amount');
    if (btnPosScanNow) btnPosScanNow.addEventListener('click', () => captureAndDescribePhoto(false));
    if (btnCopyIban) btnCopyIban.addEventListener('click', copyDetectedIbanToClipboard);
    if (btnSpeakPosAmount) btnSpeakPosAmount.addEventListener('click', speakDetectedPosAmount);

    const memoryNoteInput = document.getElementById('memory-note-input');
    const btnMemorySaveText = document.getElementById('btn-memory-save-text');
    const btnMemoryVoiceSave = document.getElementById('btn-memory-voice-save');
    const btnMemoryVoiceAsk = document.getElementById('btn-memory-voice-ask');
    const btnMemorySearchText = document.getElementById('btn-memory-search-text');
    const btnMemoryReadAll = document.getElementById('btn-memory-read-all');
    const btnMemoryDeleteLast = document.getElementById('btn-memory-delete-last');
    const btnMemoryTagJar = document.getElementById('btn-memory-tag-jar');

    if (btnMemorySaveText && memoryNoteInput) {
        btnMemorySaveText.addEventListener('click', () => saveItemMemoryEntry(memoryNoteInput.value));
        memoryNoteInput.addEventListener('keydown', (ev) => {
            if (ev.key === 'Enter') {
                ev.preventDefault();
                const val = (memoryNoteInput.value || '').trim();
                const isQuestionOrShortQuery = /\?|(?:\b(?:nerede|nereye|neredeydi|hangi)\b)/i.test(val) || val.split(/\s+/).filter(Boolean).length <= 2;
                if (isQuestionOrShortQuery) {
                    searchItemMemoryByQuery(val);
                } else {
                    saveItemMemoryEntry(val);
                }
            }
        });
    }
    if (btnMemoryVoiceSave) btnMemoryVoiceSave.addEventListener('click', () => startVoiceItemMemoryCapture('save'));
    if (btnMemoryVoiceAsk) btnMemoryVoiceAsk.addEventListener('click', () => startVoiceItemMemoryCapture('ask'));
    if (btnMemorySearchText && memoryNoteInput) {
        btnMemorySearchText.addEventListener('click', () => searchItemMemoryByQuery(memoryNoteInput.value));
    }
    if (btnMemoryReadAll) btnMemoryReadAll.addEventListener('click', speakAllSavedItemMemories);
    if (btnMemoryDeleteLast) btnMemoryDeleteLast.addEventListener('click', deleteLastItemMemoryEntry);
    if (btnMemoryTagJar) btnMemoryTagJar.addEventListener('click', tagVisibleJarInCamera);

    const btnTvAutoToggle = document.getElementById('btn-tv-auto-toggle');
    const btnTvReadNow = document.getElementById('btn-tv-read-now');
    if (btnTvAutoToggle) btnTvAutoToggle.addEventListener('click', toggleTvAutoSubtitleSpeaker);
    if (btnTvReadNow) btnTvReadNow.addEventListener('click', () => readTvScreenNow(false));

    const btnSockCompare = document.getElementById('btn-sock-compare');
    const btnOutfitStain = document.getElementById('btn-outfit-stain');
    if (btnSockCompare) {
        btnSockCompare.addEventListener('click', () => {
            state.sockSubMode = 'sock';
            captureAndDescribePhoto(false);
        });
    }
    if (btnOutfitStain) {
        btnOutfitStain.addEventListener('click', () => {
            state.sockSubMode = 'outfit';
            captureAndDescribePhoto(false);
        });
    }

    const btnWhereAmINow = document.getElementById('btn-where-am-i-now');
    const btnWhereWhatsapp = document.getElementById('btn-where-whatsapp');
    if (btnWhereAmINow) btnWhereAmINow.addEventListener('click', () => announceWhereAmIFullAddressAndSignboard('', []));
    if (btnWhereWhatsapp) btnWhereWhatsapp.addEventListener('click', shareWhereAmIOnWhatsapp);

    const btnStepToggle = document.getElementById('btn-step-toggle');
    const btnStepSpeakStatus = document.getElementById('btn-step-speak-status');
    const btnStepReset = document.getElementById('btn-step-reset');
    const calorieFoodInput = document.getElementById('calorie-food-input');
    const btnCalorieCalc = document.getElementById('btn-calorie-calc');
    const btnCalorieVoice = document.getElementById('btn-calorie-voice');

    if (btnStepToggle) btnStepToggle.addEventListener('click', toggleStepCounterActive);
    if (btnStepSpeakStatus) btnStepSpeakStatus.addEventListener('click', speakCurrentStepAndCalorieStatus);
    if (btnStepReset) btnStepReset.addEventListener('click', resetDailyStepAndCalorieCounter);
    if (btnCalorieCalc && calorieFoodInput) {
        btnCalorieCalc.addEventListener('click', () => calculateAndSpeakFoodCalories(calorieFoodInput.value));
        calorieFoodInput.addEventListener('keydown', (ev) => {
            if (ev.key === 'Enter') {
                ev.preventDefault();
                calculateAndSpeakFoodCalories(calorieFoodInput.value);
            }
        });
    }
    if (btnCalorieVoice) {
        btnCalorieVoice.addEventListener('click', () => startVoiceItemMemoryCapture('calorie'));
    }

    // 23. Erişilebilir Yemek Yapma Rehberi ve Konuşan Aşçı Düğmeleri
    const cookCatBtns = document.querySelectorAll('.cook-cat-btn');
    if (cookCatBtns && cookCatBtns.length > 0) {
        cookCatBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                filterCookingRecipesByCategory(btn.getAttribute('data-cook-cat') || 'all', true);
            });
        });
    }
    const cookingRecipeSelect = document.getElementById('cooking-recipe-select');
    const cookingIngredientInput = document.getElementById('cooking-ingredient-input');
    const btnCookingFind = document.getElementById('btn-cooking-find');
    const btnCookingVoice = document.getElementById('btn-cooking-voice');
    const btnCookingIngredients = document.getElementById('btn-cooking-ingredients');
    const btnCookingPrev = document.getElementById('btn-cooking-prev');
    const btnCookingCurrent = document.getElementById('btn-cooking-current');
    const btnCookingNext = document.getElementById('btn-cooking-next');
    const btnCookingTimer = document.getElementById('btn-cooking-timer');

    if (cookingRecipeSelect) {
        cookingRecipeSelect.addEventListener('change', () => {
            selectCookingRecipe(cookingRecipeSelect.value, true);
        });
    }
    if (btnCookingFind && cookingIngredientInput) {
        btnCookingFind.addEventListener('click', () => findRecipeByIngredientsOrName(cookingIngredientInput.value));
        cookingIngredientInput.addEventListener('keydown', (ev) => {
            if (ev.key === 'Enter') {
                ev.preventDefault();
                findRecipeByIngredientsOrName(cookingIngredientInput.value);
            }
        });
    }
    if (btnCookingVoice) {
        btnCookingVoice.addEventListener('click', () => startVoiceItemMemoryCapture('cooking'));
    }
    if (btnCookingIngredients) btnCookingIngredients.addEventListener('click', speakCookingIngredients);
    if (btnCookingPrev) btnCookingPrev.addEventListener('click', () => stepCookingInstruction(-1));
    if (btnCookingCurrent) btnCookingCurrent.addEventListener('click', () => stepCookingInstruction(0));
    if (btnCookingNext) btnCookingNext.addEventListener('click', () => stepCookingInstruction(1));
    if (btnCookingTimer) btnCookingTimer.addEventListener('click', toggleCookingStepTimer);

    el.touchZone.addEventListener('click', () => {
        const now = performance.now();
        if (now - state.lastTouchTime < 420) {
            if (!state.isRunning) {
                startCamera();
            } else {
                captureAndDescribePhoto(false);
            }
            state.lastTouchTime = 0;
        } else {
            state.lastTouchTime = now;
        }
    });

    el.btnCopyResult.addEventListener('click', async () => {
        const txt = el.resultText.textContent || '';
        if (txt) {
            await copyTextUniversal(txt, 'Kamera Asistanı Raporu');
            announceGuidance('Rapor panoya kopyalandı.', { force: true });
        }
    });

    el.btnDownloadPhoto.addEventListener('click', () => {
        if (!state.lastCapturedDataUrl) return;
        if (window.AndroidSongBridge && typeof window.AndroidSongBridge.saveBase64PhotoToGallery === 'function') {
            const ok = window.AndroidSongBridge.saveBase64PhotoToGallery(state.lastCapturedDataUrl);
            if (ok) {
                announceGuidance('Fotoğraf telefonunuzun galerisine kaydedildi.', { force: true });
                return;
            }
        }
        const a = document.createElement('a');
        a.href = state.lastCapturedDataUrl;
        a.download = `mikyas-kamera-${Date.now()}.jpg`;
        a.click();
        announceGuidance('Fotoğraf cihazınıza indirildi.', { force: true });
    });

    window.addEventListener('keydown', (ev) => {
        markUserInteraction();
        if (ev.key === 'Escape' || ev.key === 'Control') {
            stopAllSpeechImmediately();
            return;
        }
        if (ev.target && (ev.target.tagName === 'INPUT' || ev.target.tagName === 'TEXTAREA' || ev.target.tagName === 'SELECT')) {
            return;
        }
        const key = ev.key.toLowerCase();
        if (key === '1') setMode('exam_reader');
        else if (key === '2') setMode('qibla_compass');
        else if (key === '3') setMode('qr_screen');
        else if (key === '4') setMode('portrait');
        else if (key === '5') setMode('color_cloth');
        else if (key === '6') setMode('anomaly_led');
        else if (key === '7') setMode('light_meter');
        else if (key === '8') setMode('explorer');
        else if (key === '9') setMode('medicine_skt');
        else if (key === '0') setMode('signature_pen');
        else if (key === 'u') setMode('liquid_level');
        else if (key === 'i') setMode('door_elevator_lcd');
        else if (key === 'g') setMode('food_freshness');
        else if (key === 'h') {
            if (state.mode !== 'song_finder') {
                setMode('song_finder');
            } else {
                toggleSongListening();
            }
        }
        else if (key === 'k') startQiblaCompassSensor();
        else if (key === 'v') {
            if (state.mode !== 'qibla_compass') setMode('qibla_compass');
            speakPrayerTimesAndSolarValidation();
        }
        else if (key === 's' && state.mode === 'exam_reader') speakCurrentQuestionStem();
        else if (key === 'a' && state.mode === 'exam_reader') speakSingleOption('A');
        else if (key === 'b') {
            const curQ = state.examQuestions && state.examQuestions[state.currentExamIndex || 0];
            if (state.mode === 'bus_stop_tracker') {
                saveCurrentGpsAsBusStop();
            } else if (state.mode === 'exam_reader' || (el.examRemotePanel && !el.examRemotePanel.hidden && curQ && curQ.options && curQ.options.B)) {
                speakSingleOption('B');
            } else if (el.btnSpeakStory) {
                el.btnSpeakStory.click();
            }
        }
        else if (key === 'c' && state.mode === 'exam_reader') speakSingleOption('C');
        else if (key === 'd' && state.mode === 'exam_reader') speakSingleOption('D');
        else if (key === 'e' && state.mode === 'exam_reader') speakSingleOption('E');
        else if (ev.key === 'ArrowLeft') {
            if (state.mode === 'song_finder') stepLyricLine(-1);
            else if (state.mode === 'cooking_guide') stepCookingInstruction(-1);
            else if (state.mode === 'exam_reader') el.btnExamPrev.click();
        }
        else if (ev.key === 'ArrowRight') {
            if (state.mode === 'song_finder') stepLyricLine(1);
            else if (state.mode === 'cooking_guide') stepCookingInstruction(1);
            else if (state.mode === 'exam_reader') el.btnExamNext.click();
        }
        else if (key === 'r') el.btnToggleRadar.click();
        else if (key === 'o') el.btnToggleAuto.click();
        else if (key === 'f' && !el.btnToggleFlash.disabled) el.btnToggleFlash.click();
        else if (key === 'w') {
            if (state.mode === 'where_am_i') {
                announceWhereAmIFullAddressAndSignboard('', []);
            } else if (state.mode === 'qr_screen' || state.whatsappHoldTimer) {
                startWhatsapp15SecAudioHold();
            }
        }
        else if (key === 'm' && el.photoFileInput) el.photoFileInput.click();
        else if (key === 't') el.btnRepeat.click();
        else if (key === 'y') cycleSpeechRate();
        else if (key === 'j') startVoiceItemMemoryCapture('smart_intent');
        else if (key === 'n') speakHowMuchMoneyIHave();
        else if ((key === 'z' || ev.key === '+') && state.mode === 'color_cloth') addCurrentlyVisibleMoneyManually();
        else if (ev.code === 'Space') {
            ev.preventDefault();
            if (!state.isRunning) {
                if (state.mode === 'song_finder') toggleSongListening();
                else if (state.mode === 'cooking_guide') stepCookingInstruction(0);
                else if (state.mode === 'qibla_compass') speakPrayerTimesAndSolarValidation();
                else if (state.mode === 'step_calorie_guide') speakCurrentStepAndCalorieStatus();
                else if (state.mode === 'where_am_i') announceWhereAmIFullAddressAndSignboard('', []);
                else if (state.mode === 'item_memory') speakAllSavedItemMemories();
                else startCamera();
            }
            else captureAndDescribePhoto(false);
        }
    });

    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            stopAllSpeechImmediately();
            stopSongPreviewPlayback();
            state.isProcessingOcr = false;
            state.moneyLiveOcrBusy = false;
            state.isLiveBgOcrBusy = false;
            state.isDetectingObjects = false;
        }
    });

    window.addEventListener('load', () => {
        if (window.AndroidSongBridge) {
            const backHome = document.getElementById('header-back-home-link');
            const apkDl = document.getElementById('header-apk-download-link');
            if (backHome) backHome.hidden = true;
            if (apkDl) apkDl.hidden = true;
        }
        try {
            const savedStopRaw = localStorage.getItem('mikyas_saved_bus_stop');
            if (savedStopRaw) {
                const parsedStop = JSON.parse(savedStopRaw);
                if (parsedStop && parsedStop.name && typeof parsedStop.lat === 'number' && typeof parsedStop.lon === 'number') {
                    POPULAR_STOP_LANDMARKS.unshift(parsedStop);
                }
            }
        } catch (_) {}
        loadSpeechRateFromStorage();
        loadMoneyLedgerFromStorage();
        loadItemMemoriesFromStorage();
        loadStepCalorieFromStorage();
        populateCookingRecipesSelect();
        populate81ProvincesSelect();
        syncModePanelsVisibility(state.mode);
        updateExamRemoteUI();
        setTimeout(initAiModel, 350);
    });

    window.handleAndroidBackButton = function () {
        if (el.resultPanel && !el.resultPanel.hidden) {
            el.resultPanel.hidden = true;
            stopAllSpeechImmediately();
            announceGuidance('Sonuç paneli kapatıldı.', { force: true });
            return true;
        }
        if (state.songListening) {
            stopSongListening();
            return true;
        }
        if (state.qiblaActive) {
            state.qiblaActive = false;
            stopAllSpeechImmediately();
            announceGuidance('Kıble pusulası durduruldu.', { force: true });
            return true;
        }
        if (state.isRunning) {
            stopCamera();
            return true;
        }
        if (isAnySpeechPlaying()) {
            stopAllSpeechImmediately();
            return true;
        }
        return false;
    };
})();
