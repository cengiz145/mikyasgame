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
        'toothbrush': 'Diş Fırçası'
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
        moneyLastDuplicateSerialWarnAt: 0
    };

    const el = {
        btnStart: document.getElementById('btn-start-camera'),
        btnSwitchCam: document.getElementById('btn-switch-camera'),
        btnToggleFlash: document.getElementById('btn-toggle-flash'),
        btnToggleRadar: document.getElementById('btn-toggle-radar'),
        btnToggleAuto: document.getElementById('btn-toggle-auto'),
        btnCaptureNow: document.getElementById('btn-capture-now'),
        btnUploadPhoto: document.getElementById('btn-upload-photo'),
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
    function applyBradleyRothShadowRemoval(sourceCanvas) {
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
        const tRatio = 0.87;

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
            // Yuvarlak içindeki A-E Unicode karakterlerini standartlaştır
            .replace(/[Ⓐⓐ]/g, ' A) ')
            .replace(/[Ⓑⓑ]/g, ' B) ')
            .replace(/[Ⓒⓒ]/g, ' C) ')
            .replace(/[Ⓓⓓ]/g, ' D) ')
            .replace(/[Ⓔⓔ]/g, ' E) ')
            // Satır başında daire yüzünden @), 8), 0) olarak bozulan şıkları bağlama göre düzelt
            .replace(/(^|\s)\(?([A-Ea-e])[\)\.\-]\s+/gm, (m, p1, letter) => `${p1}${letter.toUpperCase()}) `);

        // Birden fazla soru varsa soru numaralarından ("1.", "2.", "Soru 1") böl
        const questionBlocks = text.split(/(?=(?:^|\n)\s*(?:SORU\s*\d+|\d{1,2}\s*[\.\-\)]\s+[A-ZÇĞİÖŞÜ]))/i)
            .map(b => b.trim())
            .filter(b => b.length > 5);

        const blocksToParse = questionBlocks.length > 0 ? questionBlocks : [text];
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
                qObj.stem = block.slice(0, matches[0].startIndex).replace(/\s+/g, ' ').trim();
                for (let i = 0; i < matches.length; i++) {
                    const current = matches[i];
                    const nextStart = (i + 1 < matches.length) ? matches[i + 1].startIndex : block.length;
                    const optContent = block.slice(current.contentStart, nextStart).replace(/\s+/g, ' ').trim();
                    if (optContent && !qObj.options[current.letter]) {
                        qObj.options[current.letter] = optContent;
                    }
                }
            } else {
                qObj.stem = block.replace(/\s+/g, ' ').trim();
            }

            if (qObj.stem || qObj.options.A || qObj.options.B) {
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
        const msg = `Soru ${q.number}: ${q.stem || 'Soru metni okunamadı.'}. Toplam ${optCount} şık ayrıştırıldı. Şıkları tek tek dinlemek için A, B, C, D, E düğmelerine dokunun.`;
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
            if (text === state.lastSpokenPhrase && now - state.lastSpokenAt < 5200) return;
        }

        state.lastSpokenAt = now;
        state.lastSpokenPhrase = text;

        if (el.srAssertive) {
            el.srAssertive.textContent = '';
            setTimeout(() => {
                el.srAssertive.textContent = text;
            }, 25);
        }

        if ('speechSynthesis' in window) {
            try {
                if (force) {
                    window.speechSynthesis.cancel();
                } else if (window.speechSynthesis.speaking) {
                    return;
                }
                const utter = new SpeechSynthesisUtterance(text);
                utter.lang = 'tr-TR';
                utter.rate = 1.12;
                const voices = window.speechSynthesis.getVoices();
                const trVoice = voices.find(v => v.lang && v.lang.toLowerCase().startsWith('tr'));
                if (trVoice) utter.voice = trVoice;
                window.speechSynthesis.speak(utter);
            } catch (_) {}
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
                const z = Math.abs(cellMeans[cy * gridN + cx] - gridMean) / Math.max(4.5, gridStd);
                if (z > 2.9) anomalyCount++;
                if (z > maxZScore) {
                    maxZScore = z;
                    anomalyCellX = cx;
                    anomalyCellY = cy;
                }
            }
        }

        const isSurfacePatterned = gridStd > 36 || anomalyCount > 5;
        let floorAnomaly = null;
        if (!isSurfacePatterned && maxZScore >= 3.25 && anomalyCellX >= 0) {
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
        if (maxLum >= 238 && avgBrightness < 165) {
            let ringR = 0, ringG = 0, ringB = 0, rCnt = 0;
            const rad = 10;
            for (let dy = -rad; dy <= rad; dy += 4) {
                for (let dx = -rad; dx <= rad; dx += 4) {
                    if (dx === 0 && dy === 0) continue;
                    const rx = Math.min(width - 1, Math.max(0, Math.floor(maxLumX + dx)));
                    const ry = Math.min(height - 1, Math.max(0, Math.floor(maxLumY + dy)));
                    const rIdx = (ry * width + rx) * 4;
                    ringR += data[rIdx];
                    ringG += data[rIdx + 1];
                    ringB += data[rIdx + 2];
                    rCnt++;
                }
            }
            ringR /= Math.max(1, rCnt);
            ringG /= Math.max(1, rCnt);
            ringB /= Math.max(1, rCnt);

            const prominenceRatio = maxLum / Math.max(12, avgBrightness);
            if (prominenceRatio >= 2.15) {
                let ledColorName = 'Beyaz / Sarı';
                if (ringR > ringG * 1.35 && ringR > ringB * 1.35) ledColorName = 'Kırmızı';
                else if (ringG > ringR * 1.25 && ringG > ringB * 1.18) ledColorName = 'Yeşil';
                else if (ringB > ringR * 1.30 && ringB > ringG * 1.15) ledColorName = 'Mavi';
                else if (ringR > 180 && ringG > 110 && ringB < 90) ledColorName = 'Turuncu / Kehribar';

                ledSource = {
                    x: maxLumX,
                    y: maxLumY,
                    bbox: [Math.max(0, maxLumX - 22), Math.max(0, maxLumY - 22), 44, 44],
                    colorName: ledColorName,
                    peakLum: maxLum
                };
            }
        }

        state.ledHistory.push({
            t: performance.now(),
            active: Boolean(ledSource),
            lum: maxLum
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

        const moveParts = [];

        if (offsetX < -0.20 || (touchesLeft && !touchesRight)) {
            moveParts.push(offsetX < -0.45 ? 'sola doğru çevirin' : 'biraz sola kaydırın');
        } else if (offsetX > 0.20 || (touchesRight && !touchesLeft)) {
            moveParts.push(offsetX > 0.45 ? 'sağa doğru çevirin (sağdaki şıklar kesilebilir)' : 'biraz sağa kaydırın');
        }

        if (offsetY < -0.20 || (touchesTop && !touchesBottom)) {
            moveParts.push(offsetY < -0.45 ? 'yukarı kaldırın' : 'biraz yukarı kaldırın');
        } else if (offsetY > 0.20 || (touchesBottom && !touchesTop)) {
            moveParts.push(offsetY > 0.45 ? 'aşağı indirin' : 'biraz aşağı indirin');
        }

        let distanceAdvice = '';
        let distanceStatus = 'İdeal (%' + Math.round(areaRatio * 100) + ')';
        if (areaRatio < idealMinArea) {
            distanceAdvice = 'Biraz daha yaklaşın';
            distanceStatus = 'Uzak (%' + Math.round(areaRatio * 100) + ')';
        } else if (areaRatio > idealMaxArea || (touchesLeft && touchesRight) || (touchesTop && touchesBottom)) {
            distanceAdvice = 'Çok yakınsınız, tüm şıkların sığması için telefonu biraz yukarı/geri çekin';
            distanceStatus = 'Çok Yakın (%' + Math.round(areaRatio * 100) + ')';
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
            : `X: ${offsetX > 0 ? '+' : ''}${Math.round(offsetX * 100)}%, Y: ${offsetY > 0 ? '+' : ''}${Math.round(offsetY * 100)}%`;

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
    // 5. GERÇEK ZAMANLI VİZÖR DÖNGÜSÜ
    // =========================================================================
    async function processFrameLoop() {
        if (!state.isRunning) return;

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
            updateTelemetryUI(metrics);

            let qrDetection = null;
            if (state.mode === 'qr_screen' || state.mode === 'medicine_skt' || state.targetFilter === 'screen_qr') {
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
                    }
                }
            }

            let predictions = [];
            if (state.cocoModel && state.mode !== 'light_meter') {
                try {
                    predictions = await state.cocoModel.detect(el.analysisCanvas, 8, 0.40);
                } catch (_) {
                    predictions = [];
                }
            }

            handleModeDispatch(anW, anH, vw, vh, metrics, qrDetection, predictions);
        }

        if (state.isRunning) {
            requestAnimationFrame(processFrameLoop);
        }
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
        } else if (state.mode === 'social_presence') {
            handleSocialPresenceLiveMode(anW, anH, scaleX, scaleY, ovCtx, metrics, predictions);
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
        if (metrics.sharpness < 7.0) {
            state.countdownStage = 0;
            el.tPosition.textContent = 'Yazılar Bulanık';
            el.tDistance.textContent = 'Elinizi Sabitleyin';
            announceGuidance('Sınav kağıdı şu an bulanık görünüyor. Şıkların yanlış okunmaması için elinizi sabit tutun ve kağıda bir karıştan biraz yüksekten (25-30 santim) dik bakın.', {
                bannerState: 'warning',
                minIntervalMs: 3200
            });
            return;
        }

        const docPred = predictions.find(p => p.class === 'book' || p.class === 'tv' || p.class === 'laptop');
        const rawBox = docPred ? docPred.bbox : (metrics.brightCluster ? metrics.brightCluster.bbox : null);

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

        el.tPosition.textContent = 'Sayfa Hazır';
        el.tDistance.textContent = 'Okumaya Hazır';
        announceGuidance('Işık ve netlik sınav okumaya uygun. Soruyu ve şıkları okutmak için ekrana çift dokunun veya Boşluk tuşuna basın.', {
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
        } else if (metrics.brightCluster) {
            rawBox = metrics.brightCluster.bbox;
            targetName = 'Parlak Ekran Yüzeyi';
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
        const now = performance.now();
        if (state.countdownStage === 0) {
            state.countdownStage = 3;
            state.lastCountdownTick = now;
            announceGuidance(`${note} Sabit tutun: 3`, { force: true, bannerState: 'centered' });
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
                ledger: state.moneyLedger.slice(-50)
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
                state.moneyTotalKurus = state.moneyLedger.reduce((acc, item) => acc + (Number(item.kurus) || 0), 0);
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

    function addMoneyToRunningTotal(kurus, label, items = null, source = 'auto') {
        const cleanKurus = Math.round(Number(kurus) || 0);
        if (cleanKurus <= 0) return;

        radar.init();
        radar.playQrSuccessSound();
        if (navigator.vibrate) navigator.vibrate([70, 40, 110]);

        state.moneyTotalKurus += cleanKurus;
        state.moneyLedger.push({
            kurus: cleanKurus,
            label: label || formatTurkishKurusTotal(cleanKurus),
            items: Array.isArray(items) ? items : [{ valueKurus: cleanKurus, label: label || formatTurkishKurusTotal(cleanKurus), count: 1 }],
            source,
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
            announceGuidance('Geri alınacak bir para yok, sayaç şu an boş.', { force: true, bannerState: 'warning' });
            return;
        }
        const removed = state.moneyLedger.pop();
        state.moneyTotalKurus = Math.max(0, state.moneyTotalKurus - (Number(removed.kurus) || 0));
        state.moneyLastCommittedSignature = '';
        saveMoneyLedgerToStorage();
        updateMoneyCounterUI();

        const newTotalFormatted = formatTurkishKurusTotal(state.moneyTotalKurus);
        announceGuidance(`Son eklenen ${removed.label} geri alındı. Kalan toplam paranız: ${newTotalFormatted}.`, {
            force: true,
            bannerState: 'normal'
        });
    }

    function resetMoneyCounter() {
        state.moneyTotalKurus = 0;
        state.moneyLedger = [];
        state.moneyPendingSignature = '';
        state.moneyPendingFrames = 0;
        state.moneyLastCommittedSignature = '';
        state.moneyEmptyFramesSinceCommit = 0;
        if (state.moneySeenSerialNumbers) {
            state.moneySeenSerialNumbers.clear();
        }
        saveMoneyLedgerToStorage();
        updateMoneyCounterUI();

        announceGuidance('Para sayacı ve seri numarası hafızası sıfırlandı. Şimdi elinizdeki paraları baştan saymaya başlayabilirsiniz.', {
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
                if (aspect < 0.70 || aspect > 1.42) continue;

                // İdeal dairenin kutu doluluk oranı π/4 ≈ 0.785'tir. Dikdörtgen kutu/kağıtları elemek için:
                const boxFillRatio = areaCells / Math.max(1, bwCells * bhCells);
                if (boxFillRatio < 0.52 || boxFillRatio > 0.90) continue;

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
                if (innerDensity < 0.68 || cornerDensity > 0.38) continue;

                candidateCircles.push({
                    cx: ((sumX / areaCells) + 0.5) * step,
                    cy: ((sumY / areaCells) + 0.5) * step,
                    radius: diamPx * 0.5,
                    bbox: [minX * step, minY * step, bwPx, bhPx]
                });
            }
        }

        // 4. Tek Yakın Plan (Close-Up) Madeni Para Yedek Tespiti:
        // Kullanıcı tek bir demir parayı kameranın tam ortasına yaklaştırdıysa çember kenar gradyanını kontrol et
        if (candidateCircles.length === 0) {
            const centerX = width * 0.5;
            const centerY = height * 0.5;
            const testRadii = [
                Math.min(width, height) * 0.18,
                Math.min(width, height) * 0.24,
                Math.min(width, height) * 0.31
            ];
            let bestRimScore = 0;
            let bestRadius = 0;

            for (let rIdx = 0; rIdx < testRadii.length; rIdx++) {
                const R = testRadii[rIdx];
                let rimEdgeSum = 0;
                let rimSamples = 0;
                for (let deg = 0; deg < 360; deg += 10) {
                    const rad = deg * (Math.PI / 180);
                    const rxIn = Math.round((centerX + Math.cos(rad) * (R * 0.86)) / step);
                    const ryIn = Math.round((centerY + Math.sin(rad) * (R * 0.86)) / step);
                    const rxOut = Math.round((centerX + Math.cos(rad) * (R * 1.12)) / step);
                    const ryOut = Math.round((centerY + Math.sin(rad) * (R * 1.12)) / step);
                    if (rxOut >= 1 && rxOut < gw - 1 && ryOut >= 1 && ryOut < gh - 1 &&
                        rxIn >= 1 && rxIn < gw - 1 && ryIn >= 1 && ryIn < gh - 1) {
                        const idxIn = (ryIn * step * width + rxIn * step) * 4;
                        const idxOut = (ryOut * step * width + rxOut * step) * 4;
                        const labIn = rgbToLab(data[idxIn], data[idxIn + 1], data[idxIn + 2]);
                        const labOut = rgbToLab(data[idxOut], data[idxOut + 1], data[idxOut + 2]);
                        const dE = Math.hypot(labIn.L - labOut.L, labIn.a - labOut.a, labIn.b - labOut.b);
                        rimEdgeSum += dE;
                        rimSamples++;
                    }
                }
                const avgRimDeltaE = rimEdgeSum / Math.max(1, rimSamples);
                if (avgRimDeltaE > bestRimScore && avgRimDeltaE >= 15.5) {
                    bestRimScore = avgRimDeltaE;
                    bestRadius = R;
                }
            }

            if (bestRadius > 0) {
                candidateCircles.push({
                    cx: centerX,
                    cy: centerY,
                    radius: bestRadius,
                    bbox: [centerX - bestRadius, centerY - bestRadius, bestRadius * 2, bestRadius * 2]
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

            // Çok düz ve kabartmasız lekeleri (örneğin masa üzerindeki düz su damlası/bant) ele
            if (reliefScore < 6.2) continue;

            const coreChroma = Math.hypot(coreA, coreB);
            const ringChroma = Math.hypot(ringA, ringB);
            const deltaBRingCore = ringB - coreB;       // + ise dış halka sarı, - ise iç göbek sarı
            const deltaChroma = ringChroma - coreChroma;
            const meanA = 0.5 * (coreA + ringA);
            const meanB = 0.5 * (coreB + ringB);
            const meanChroma = Math.hypot(meanA, meanB);

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

        // 6. Çoklu Para Varsa Milimetrik Çap Kalibrasyonu (Darphane Standartları: 1 TL = 26.15mm, 50 Kr = 23.85mm)
        let refMmPerPx = null;
        const oneTlRef = analyzedCoins.find(c => c.deltaBRingCore >= 3.2 && c.ringB >= 7.5);
        const fiftyKrRef = analyzedCoins.find(c => c.deltaBRingCore <= -3.2 && c.coreB >= 7.5);
        if (oneTlRef) {
            refMmPerPx = 26.15 / (oneTlRef.radius * 2);
        } else if (fiftyKrRef) {
            refMmPerPx = 23.85 / (fiftyKrRef.radius * 2);
        } else if (analyzedCoins.length >= 2) {
            const maxRad = Math.max(...analyzedCoins.map(c => c.radius));
            refMmPerPx = 26.15 / (maxRad * 2);
        }

        const upperOcr = String(ocrText || '').toUpperCase();
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

            // Tek para varsa ve OCR rakamı net okuduysa çapraz doğrulama
            if (analyzedCoins.length === 1 && upperOcr.length > 0) {
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

            if (state.moneyAutoAccumulate && state.moneyPendingFrames >= 5 && isNewBatch) {
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

        // 2) Parayı kameraya sıfır yapıştırma / aşırı bulanık tutma uyarısı
        if (metrics.sharpness < 3.8 && metrics.contrast < 15) {
            if (el.moneyLiveSeen) {
                el.moneyLiveSeen.textContent = '⚠️ Çok Yakın / Bulanık Tutuş';
            }
            announceGuidance('Parayı kameraya çok yakın tutuyorsunuz, net görünmüyor. Lütfen elinizi telefondan bir karış kadar uzaklaştırıp sabit tutun.', {
                bannerState: 'warning',
                minIntervalMs: 3800
            });
            return;
        }

        // Kameranın önünde yazı/rakam dokusu olan net bir yüzey (kağıt para) varsa arka planda otomatik tanı ve cüzdana ekle!
        const nowMs = performance.now();
        if (state.moneyAutoAccumulate &&
            !state.moneyLiveOcrBusy &&
            !state.isProcessingOcr &&
            typeof window.Tesseract !== 'undefined' &&
            metrics.sharpness >= 5.5 &&
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
                                'live_banknote'
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

                announceGuidance(align.sentence, {
                    bannerState: align.isCentered ? 'centered' : 'normal',
                    minIntervalMs: 2300
                });
                return;
            }
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

        el.tPosition.textContent = `Parlaklık: %${Math.round((lum / 255) * 100)} (${lum}/255)`;
        el.tDistance.textContent = `En Güçlü Işık: ${dirHint}`;

        announceGuidance(`${stateDesc} En güçlü ışık kaynağı ${dirHint}.`, {
            bannerState: lum >= 55 ? 'centered' : 'warning',
            minIntervalMs: 3200
        });
    }

    function handleExplorerMode(anW, anH, scaleX, scaleY, ovCtx, predictions) {
        if (predictions.length === 0) {
            el.tPosition.textContent = 'Nesne Aranıyor';
            el.tDistance.textContent = 'Belirgin Nesne Yok';
            announceGuidance('Önünüzde belirgin bir nesne algılanmadı. Yazı veya belge okutmak için ekrana çift dokunabilirsiniz.', {
                bannerState: 'normal',
                minIntervalMs: 4200
            });
            return;
        }

        const sorted = [...predictions].sort((a, b) => a.bbox[0] - b.bbox[0]);
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

        const mainPred = predictions[0];
        const align = computeAlignmentInstruction(
            mainPred.bbox,
            anW,
            anH,
            TR_LABELS[mainPred.class] || mainPred.class
        );
        el.tPosition.textContent = align.posLabel;
        el.tDistance.textContent = `${predictions.length} Nesne Doğrulandı`;
        radar.updateRadar(align.offsetX, align.offsetY, align.isCentered);

        announceGuidance(`Kamera önünde: ${descriptions.join(', ')} var.`, {
            bannerState: 'centered',
            minIntervalMs: 3600
        });
    }

    function guideToSpecificObject(targetClass, anW, anH, scaleX, scaleY, ovCtx, predictions) {
        const matches = predictions.filter(p => {
            if (targetClass === 'door_table') return p.class === 'dining table' || p.class === 'bench' || p.class === 'couch';
            if (targetClass === 'cup') return p.class === 'cup' || p.class === 'bottle' || p.class === 'wine glass';
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
     * Mod 9: İlaç Kutusu, Dozaj (mg/ml), Barkod ve Son Kullanma Tarihi (SKT) Sıfır-Hata Çözümleyici
     */
    function parseMedicineAndExpiryZeroError(ocrText, liveBarcode = '') {
        const text = String(ocrText || '');
        const validBarcodes = [];

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

        let expMonth = null;
        let expYear = null;

        // 1. Öncelik: Açık SKT / EXP etiketi yanındaki tarih
        const labeledRegex = /(?:S\.?K\.?T\.?|SON\s*KULLAN(?:MA|IM)|EXP(?:IRY)?|T\.?E\.?T\.?T\.?)[\s:.\-]*(\d{1,2})[\s./\-](?:(\d{1,2})[\s./\-])?(20[2-3]\d|\d{2})\b/gi;
        let m = labeledRegex.exec(text);
        if (m) {
            const p1 = parseInt(m[1], 10);
            const p2 = m[2] ? parseInt(m[2], 10) : null;
            let yr = parseInt(m[3], 10);
            if (yr < 100) yr += 2000;
            const mo = p2 !== null ? p2 : p1;
            if (mo >= 1 && mo <= 12 && yr >= 2020 && yr <= 2038) {
                expMonth = mo;
                expYear = yr;
            }
        }

        // 2. Öncelik: Etiket silinmişse AA/20YY veya GG.AA.20YY formatı
        if (expYear === null) {
            const genericDateRegex = /\b(?:(\d{1,2})[./\-])?(0[1-9]|1[0-2])[./\-](20[2-3]\d)\b/g;
            let gm;
            while ((gm = genericDateRegex.exec(text)) !== null) {
                const mo = parseInt(gm[2], 10);
                const yr = parseInt(gm[3], 10);
                if (mo >= 1 && mo <= 12 && yr >= 2020 && yr <= 2038) {
                    expMonth = mo;
                    expYear = yr;
                    break;
                }
            }
        }

        let sktStatus = 'UNVERIFIED';
        let sktSpeech = 'Son kullanma tarihi bu açıdan kesin olarak doğrulanamadı. Yanlış bilgi vermemek için tahmin yürütmüyorum; lütfen kutunun yan kapağını veya kabartmalı yüzünü çevirip tekrar çekin.';
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
        const targetBox = barcodeBox || (boxPred ? boxPred.bbox : (metrics.brightCluster ? metrics.brightCluster.bbox : null));

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
        announceGuidance('İlaç kutusunu kameranın 20 santimetre önüne tutun. Barkodu, miligram dozajı ve Son Kullanma Tarihi (SKT) sıfır hatayla kontrol edilecektir.', {
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

        // 1. İmza Satırı / Kutusu Tespiti (Sayfanın alt %35..%82 bölgesinde yatay siyah çizgi / çerçeve)
        let bestLineScore = 0;
        let sigBox = [Math.round(anW * 0.36), Math.round(anH * 0.56), Math.round(anW * 0.32), Math.round(anH * 0.14)];

        for (let gy = Math.floor(gh * 0.35); gy < Math.floor(gh * 0.82); gy += 2) {
            let horizEdgeRun = 0;
            for (let gx = Math.floor(gw * 0.20); gx < Math.floor(gw * 0.80); gx++) {
                const dy = Math.abs(gray[(gy + 1) * gw + gx] - gray[(gy - 1) * gw + gx]);
                const dx = Math.abs(gray[gy * gw + (gx + 1)] - gray[gy * gw + (gx - 1)]);
                if (dy > 26 && dy > dx * 1.4) horizEdgeRun += dy;
            }
            if (horizEdgeRun > bestLineScore && horizEdgeRun > 420) {
                bestLineScore = horizEdgeRun;
                const boxY = Math.max(20, (gy * step) - Math.round(anH * 0.10));
                sigBox = [Math.round(anW * 0.32), boxY, Math.round(anW * 0.36), Math.round(anH * 0.14)];
            }
        }

        // 2. Parmak / El ve Kalem Ucu Tespiti (YCbCr Cilt Krominansı: 77<=Cb<=127, 133<=Cr<=173)
        let skinPixels = 0;
        let topSkinX = -1;
        let topSkinY = anH + 1;

        for (let gy = Math.floor(gh * 0.12); gy < gh - 1; gy++) {
            const py = gy * step;
            for (let gx = 2; gx < gw - 2; gx++) {
                const px = gx * step;
                const idx = (py * anW + px) * 4;
                const r = data[idx], g = data[idx + 1], b = data[idx + 2];
                const cb = 128 - 0.168736 * r - 0.331264 * g + 0.5 * b;
                const cr = 128 + 0.5 * r - 0.418688 * g - 0.081312 * b;

                if (r > 65 && g > 40 && b > 20 && r > b && cb >= 77 && cb <= 127 && cr >= 133 && cr <= 175) {
                    skinPixels++;
                    if (py < topSkinY) {
                        topSkinY = py;
                        topSkinX = px;
                    }
                }
            }
        }

        let penTip = null;
        if (skinPixels >= 18 && topSkinX >= 0) {
            // Parmağın ucundan yukarı doğru uzanan koyu kalem ucunu (24px'e kadar) tara
            let nibX = topSkinX;
            let nibY = topSkinY;
            const gx0 = Math.floor(topSkinX / step);
            const gy0 = Math.floor(topSkinY / step);
            for (let dy = 1; dy <= 6; dy++) {
                const ty = gy0 - dy;
                if (ty <= 1) break;
                if (gray[ty * gw + gx0] < 95) {
                    nibY = ty * step;
                }
            }
            penTip = { x: nibX, y: nibY, skinPixels };
        }

        return { sigBox, penTip };
    }

    function handleSignaturePenLiveMode(anW, anH, scaleX, scaleY, ovCtx, metrics) {
        const { sigBox, penTip } = detectSignatureBoxAndPenTip(metrics, anW, anH);
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
            el.tPosition.textContent = 'KALEM İMZA KUTUSUNDA!';
            el.tDistance.textContent = 'Şimdi İmzalayın';
            if (state.penInBoxFrames >= 2) {
                if (navigator.vibrate) navigator.vibrate([100, 50, 150]);
                announceGuidance('DURUN! Kaleminizin ucu tam imza kutusunun içinde! Elinizi kaydırmadan şimdi imzanızı atabilirsiniz.', {
                    bannerState: 'centered',
                    minIntervalMs: 2800
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
            el.tPosition.textContent = 'Bardak Aranıyor';
            el.tDistance.textContent = 'Kadrajda Bardak Yok';
            announceGuidance('Sıvı seviyesini ölçmek için lütfen bardağı veya kupayı kameranın tam karşısına, yandan görünecek şekilde koyun.', {
                bannerState: 'warning',
                minIntervalMs: 3600
            });
            return;
        }

        const [bx, by, bw, bh] = cupPred.bbox;
        drawTargetBox(ovCtx, cupPred.bbox, scaleX, scaleY, '#38bdf8', 'Bardak / Kupa');

        const { gray, gw, gh, step } = metrics;
        const gx0 = Math.max(1, Math.floor((bx + bw * 0.22) / step));
        const gx1 = Math.min(gw - 2, Math.floor((bx + bw * 0.78) / step));
        const gyTop = Math.max(2, Math.floor((by + bh * 0.10) / step));
        const gyBot = Math.min(gh - 3, Math.floor((by + bh * 0.90) / step));

        if (gyBot - gyTop < 8 || gx1 <= gx0) return;

        // Her satırın yatay medyan/ortalama parlaklığını ve dikey sıvı menisküs gradyanını (|∂L/∂y|) hesapla
        const rowLum = new Float32Array(gh);
        for (let gy = gyTop - 1; gy <= gyBot + 1; gy++) {
            let sum = 0;
            for (let gx = gx0; gx <= gx1; gx++) sum += gray[gy * gw + gx];
            rowLum[gy] = sum / Math.max(1, gx1 - gx0 + 1);
        }

        let maxMeniscusGrad = 0;
        let bestMeniscusGy = gyBot;
        for (let gy = gyTop + 1; gy < gyBot - 1; gy++) {
            const grad = Math.abs(rowLum[gy + 1] - rowLum[gy - 1]);
            if (grad > maxMeniscusGrad) {
                maxMeniscusGrad = grad;
                bestMeniscusGy = gy;
            }
        }

        // Eğer belirgin bir sıvı sınırı yoksa (< 8 luma farkı) bardak boş kabul edilir
        let rawFillPct = 0;
        if (maxMeniscusGrad >= 8.5) {
            rawFillPct = Math.round(((gyBot - bestMeniscusGy) / Math.max(1, gyBot - gyTop)) * 100);
            rawFillPct = Math.max(5, Math.min(98, rawFillPct));
        }

        state.liquidLevelHistory.push(rawFillPct);
        if (state.liquidLevelHistory.length > 5) state.liquidLevelHistory.shift();
        const sortedHist = [...state.liquidLevelHistory].sort((a, b) => a - b);
        const fillPct = sortedHist[Math.floor(sortedHist.length / 2)];

        // Menisküs çizgisini ekranda göster
        const meniscusY = (gyBot - (fillPct / 100) * (gyBot - gyTop)) * step;
        ovCtx.save();
        ovCtx.strokeStyle = fillPct >= 80 ? '#ef4444' : '#22c55e';
        ovCtx.lineWidth = 5;
        ovCtx.beginPath();
        ovCtx.moveTo(bx * scaleX, meniscusY * scaleY);
        ovCtx.lineTo((bx + bw) * scaleX, meniscusY * scaleY);
        ovCtx.stroke();
        ovCtx.restore();

        radar.playLiquidFillTone(fillPct);
        el.tPosition.textContent = `Bardak Doluluk: %${fillPct}`;
        el.tDistance.textContent = fillPct >= 80 ? 'TAŞMA SINIRI — DURDURUN!' : 'Güvenli Dolum Seviyesi';

        if (fillPct >= 80) {
            radar.playDangerAlarm();
            if (navigator.vibrate) navigator.vibrate([150, 50, 150]);
            announceGuidance(`DİKKAT DURDURUN! Bardak yüzde ${fillPct} doldu, dudak payına ulaştı! Taşmaması için akışı hemen kesin!`, {
                bannerState: 'warning',
                minIntervalMs: 1800
            });
        } else if (fillPct >= 15) {
            announceGuidance(`Bardak yüzde ${fillPct} dolu. Güvenle doldurmaya devam edebilirsiniz.`, {
                bannerState: 'centered',
                minIntervalMs: 2800
            });
        } else {
            announceGuidance('Bardak kilitlendi, şu an boş veya çok az sıvı var. Doldurmaya başlayabilirsiniz; yükselen ses tonuyla seviyeyi bildireceğim.', {
                bannerState: 'normal',
                minIntervalMs: 3600
            });
        }
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
        const { penTip } = detectSignatureBoxAndPenTip(metrics, anW, anH);
        const panelBox = metrics.brightCluster ? metrics.brightCluster.bbox : [anW * 0.20, anH * 0.20, anW * 0.60, anH * 0.60];

        drawTargetBox(ovCtx, panelBox, scaleX, scaleY, '#38bdf8', 'Kapı No / Asansör / LCD Ekran');
        const align = computeAlignmentInstruction(panelBox, anW, anH, 'Tuş Paneli veya Dijital Ekran', 0.05, 0.85);

        el.tPosition.textContent = penTip ? 'Parmak + Panel İzleniyor' : align.posLabel;
        el.tDistance.textContent = metrics.sharpness >= 6.8 ? 'Net (Okumaya Hazır)' : 'Sabitleyin';
        radar.updateRadar(align.offsetX, align.offsetY, align.isCentered);

        if (align.isCentered && metrics.sharpness >= 6.8 && state.autoCaptureEnabled && !state.isProcessingOcr) {
            handleAutoCaptureCountdown('Panel ve rakamlar netlendi, okunuyor!');
        } else {
            const fingerHint = penTip ? ' Parmağınız panel üzerinde algılandı.' : '';
            announceGuidance(`Kapı numarası, asansör kat tuşları veya çamaşır/klima dijital ekranı modundasınız.${fingerHint} Rakamları okutmak için Boşluk tuşuna basın veya ekrana çift dokunun.`, {
                bannerState: align.isCentered ? 'centered' : 'normal',
                minIntervalMs: 3200
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

        const allergenRules = [
            { name: 'Gluten / Buğday', regex: /GLUTEN|BUĞDAY|ÇAVDAR|ARPA|YULAF/i },
            { name: 'Süt / Laktoz', regex: /LAKTOZ|SÜT\s*TOZU|PEYNİR\s*ALTI\s*SUYU|KAZEİN|TEREYAĞ/i },
            { name: 'Yer Fıstığı', regex: /YER\s*FISTIĞ/i },
            { name: 'Kuruyemiş (Fındık/Badem/Ceviz/Antep Fıstığı)', regex: /FINDIK|BADEM|CEVİZ|ANTEP\s*FISTIĞ|KAJU/i },
            { name: 'Soya Lesitini / Soya', regex: /\bSOYA\b/i },
            { name: 'Yumurta', regex: /YUMURTA/i },
            { name: 'Susam', regex: /SUSAM/i },
            { name: 'Kükürt Dioksit / Sülfit', regex: /KÜKÜRT|SÜLFİT|E220/i },
            { name: 'Domuz Katkısı / Alkol / Karmin (E120) Uyarısı', regex: /DOMUZ|LARD|ALKOL|ETANOL|KARMİN|\bE120\b/i }
        ];

        allergenRules.forEach(rule => {
            if (rule.regex.test(upper)) {
                detectedAllergens.push(rule.name);
            }
        });

        const sktInfo = parseMedicineAndExpiryZeroError(text);
        return {
            allergens: detectedAllergens,
            sktInfo
        };
    }

    function handleFoodFreshnessLiveMode(anW, anH, scaleX, scaleY, ovCtx, metrics, predictions) {
        const foodCheck = analyzeFoodMoldAndFreshness(metrics, anW, anH);
        const roiBox = [anW * 0.25, anH * 0.25, anW * 0.50, anH * 0.50];

        if (foodCheck.hasAnomaly) {
            state.moldConsensusFrames++;
        } else {
            state.moldConsensusFrames = Math.max(0, state.moldConsensusFrames - 1);
        }

        const confirmedAnomaly = state.moldConsensusFrames >= 3;
        drawTargetBox(ovCtx, roiBox, scaleX, scaleY, confirmedAnomaly ? '#ef4444' : '#22c55e', confirmedAnomaly ? 'Küf / Çürük Anomalisi!' : 'Gıda / Paket Analiz Alanı');

        el.tPosition.textContent = confirmedAnomaly ? `Küf/Leke Riski (%${Math.max(foodCheck.moldRatio, foodCheck.rotRatio)})` : 'Yüzey Renk Dağılımı Normal';
        el.tDistance.textContent = `Merkez Renk: ${metrics.centerColor.name}`;

        if (confirmedAnomaly) {
            radar.playDangerAlarm();
            announceGuidance('UYARI: Yiyeceğin üzerinde küf veya çürük lekesi görünüyor! Paket üzerindeki içindekileri ve son tüketim tarihini okutmak için Boşluk tuşuna basabilirsiniz.', {
                bannerState: 'warning',
                minIntervalMs: 3200
            });
        } else {
            announceGuidance(`Yiyeceğin üzerinde küf veya bozulma lekesi görünmüyor (Rengi: ${metrics.centerColor.name}). Paketin içindekileri, alerji yapan maddeleri ve tarihini okutmak için Boşluk tuşuna basın veya ekrana çift dokunun.`, {
                bannerState: 'centered',
                minIntervalMs: 3800
            });
        }
    }

    /**
     * Mod 14: Sosyal İletişim, Toplantı Kişi Yönü ve Yüz Simetrisi / Bakış Asistanı
     */
    function estimatePersonGazeAndOrientation(personBox, metrics, anW, anH) {
        const [bx, by, bw, bh] = personBox;
        const { imageData, gray, gw, gh, step } = metrics;
        const data = imageData.data;

        // Baş bölgesi (Kişi kutusunun üst %28'lik kısmı, yatay orta %60'ı)
        const hx0 = Math.max(0, Math.floor(bx + bw * 0.20));
        const hx1 = Math.min(anW - 1, Math.floor(bx + bw * 0.80));
        const hy0 = Math.max(0, Math.floor(by + bh * 0.03));
        const hy1 = Math.min(anH - 1, Math.floor(by + bh * 0.30));

        let skinCount = 0;
        let totalCount = 0;
        let skinXSum = 0;

        for (let y = hy0; y <= hy1; y += 3) {
            for (let x = hx0; x <= hx1; x += 3) {
                const idx = (y * anW + x) * 4;
                const r = data[idx], g = data[idx + 1], b = data[idx + 2];
                const cb = 128 - 0.168736 * r - 0.331264 * g + 0.5 * b;
                const cr = 128 + 0.5 * r - 0.418688 * g - 0.081312 * b;
                totalCount++;
                if (r > 60 && g > 38 && b > 20 && r > b && cb >= 76 && cb <= 128 && cr >= 132 && cr <= 176) {
                    skinCount++;
                    skinXSum += (x - (hx0 + hx1) / 2) / Math.max(1, (hx1 - hx0) / 2);
                }
            }
        }

        const skinRatio = skinCount / Math.max(1, totalCount);
        const skinShiftX = skinCount > 0 ? (skinXSum / skinCount) : 0;

        // Yaklaşık mesafe (metre): Ortalama üst gövde/boy yüksekliğinin kadraj oranından
        const heightRatio = bh / Math.max(1, anH);
        const approxMeters = Number(Math.max(0.5, Math.min(6.0, 1.15 / Math.max(0.18, heightRatio))).toFixed(1));

        let gazeDesc = 'yüzü size doğru dönük (size bakıyor)';
        if (skinRatio < 0.11) {
            gazeDesc = 'arkası dönük veya yüzü kapalı';
        } else if (skinShiftX < -0.18) {
            gazeDesc = 'başını sola doğru çevirmiş (yan bakıyor)';
        } else if (skinShiftX > 0.18) {
            gazeDesc = 'başını sağa doğru çevirmiş (yan bakıyor)';
        }

        return { approxMeters, gazeDesc, isLookingAtUser: skinRatio >= 0.11 && Math.abs(skinShiftX) <= 0.18 };
    }

    function handleSocialPresenceLiveMode(anW, anH, scaleX, scaleY, ovCtx, metrics, predictions) {
        const people = predictions.filter(p => p.class === 'person');
        if (people.length === 0) {
            el.tPosition.textContent = 'Odada Kimse Yok';
            el.tDistance.textContent = '0 Kişi';
            announceGuidance('Şu an kameranın baktığı yönde kimse görünmüyor.', {
                bannerState: 'normal',
                minIntervalMs: 3800
            });
            return;
        }

        people.sort((a, b) => (b.bbox[2] * b.bbox[3]) - (a.bbox[2] * a.bbox[3]));
        const personReports = [];

        people.slice(0, 4).forEach((p, idx) => {
            const [bx, by, bw, bh] = p.bbox;
            const cxNorm = (bx + bw / 2) / anW;
            let clockDir = 'Saat 12 (tam karşınızda)';
            if (cxNorm < 0.25) clockDir = 'Saat 10 (solunuzda)';
            else if (cxNorm < 0.42) clockDir = 'Saat 11 (hafif solunuzda)';
            else if (cxNorm > 0.75) clockDir = 'Saat 2 (sağınızda)';
            else if (cxNorm > 0.58) clockDir = 'Saat 1 (hafif sağınızda)';

            const gaze = estimatePersonGazeAndOrientation(p.bbox, metrics, anW, anH);
            drawTargetBox(ovCtx, p.bbox, scaleX, scaleY, gaze.isLookingAtUser ? '#22c55e' : '#38bdf8', `${clockDir} • ${gaze.approxMeters}m`);
            personReports.push(`${clockDir} ${gaze.approxMeters} metre mesafede, ${gaze.gazeDesc}`);
        });

        const mainGaze = estimatePersonGazeAndOrientation(people[0].bbox, metrics, anW, anH);
        const mainAlign = computeAlignmentInstruction(people[0].bbox, anW, anH, 'Kişi');
        el.tPosition.textContent = `Toplam ${people.length} Kişi`;
        el.tDistance.textContent = `${mainGaze.approxMeters}m • ${mainGaze.isLookingAtUser ? 'Size Bakıyor' : 'Başka Yöne Bakıyor'}`;

        // KULAKLIKSIZ ORTAMDA MAHCUP ETMEMEK İÇİN AVUÇ İÇİ TİTREŞİM + KISIK TIK MODU:
        // Karşıdaki kişi size bakıyorsa avuç içinde çift tatlı titreşim verir; hoparlörden bağırmaz!
        const now = performance.now();
        if (mainGaze.isLookingAtUser) {
            if (navigator.vibrate && now - state.lastQiblaLockVibrate > 2200) {
                navigator.vibrate([70, 60, 110]);
                state.lastQiblaLockVibrate = now;
            }
            radar.playLockChord();
        }

        const summaryBanner = `Karşınızda ${people.length} kişi var: ${personReports.join('; ')}. (Odadakiler duymasın diye sessiz titreşim aktif; sesli dinlemek için ekrana çift dokunun).`;
        state.lastSpeechText = `Karşınızda ${people.length} kişi var: ${personReports.join('; ')}.`;
        if (el.liveDirectionBox) {
            el.liveDirectionBox.textContent = summaryBanner;
            el.liveDirectionBox.classList.toggle('centered', mainGaze.isLookingAtUser);
        }
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
        const hasBanknoteWords = (txt) => /TÜRK|TURK|LİRA|LIRA|MERKEZ|BANKA|CUMHURİYET|CUMHURIYET/i.test(txt || '');

        // 1. Düz (0°) kontrol et (Aynı anda ters rakam kalıplarını 002, 001, 05, 02, 01 de yakalar)
        const res0 = await window.Tesseract.recognize(sourceCanvas, 'tur+eng');
        const txt0 = (res0 && res0.data && res0.data.text) ? res0.data.text : '';
        const match0 = detectTurkishBanknoteDetailsFromText(txt0, centerColorName);
        if (match0) return match0;
        if (hasBanknoteWords(txt0)) sawBanknoteWordsWithoutNumber = true;

        // 2. Baş Aşağı Ters (180°) çevrilmiş kağıt para kontrolü
        const canvas180 = createRotatedCanvas(sourceCanvas, 180);
        const res180 = await window.Tesseract.recognize(canvas180, 'tur+eng');
        const txt180 = (res180 && res180.data && res180.data.text) ? res180.data.text : '';
        const match180 = detectTurkishBanknoteDetailsFromText(txt180, centerColorName);
        if (match180) return match180;
        if (hasBanknoteWords(txt180)) sawBanknoteWordsWithoutNumber = true;

        // 3. Sağa Dik / Yan (90°) tutulmuş kağıt para kontrolü
        const canvas90 = createRotatedCanvas(sourceCanvas, 90);
        const res90 = await window.Tesseract.recognize(canvas90, 'tur+eng');
        const txt90 = (res90 && res90.data && res90.data.text) ? res90.data.text : '';
        const match90 = detectTurkishBanknoteDetailsFromText(txt90, centerColorName);
        if (match90) return match90;
        if (hasBanknoteWords(txt90)) sawBanknoteWordsWithoutNumber = true;

        // 4. Sola Dik / Yan (270°) tutulmuş kağıt para kontrolü
        const canvas270 = createRotatedCanvas(sourceCanvas, 270);
        const res270 = await window.Tesseract.recognize(canvas270, 'tur+eng');
        const txt270 = (res270 && res270.data && res270.data.text) ? res270.data.text : '';
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

        // Arka yüz portre isimlerinden kesin kupür tespiti (Kullanıcıya asla söylenmez, sadece iç doğrulama!)
        const hasYunusEmre = /YUNUS\s*EMRE|SEVVELİM|SEVELIM/.test(clean);
        const hasItri = /ITR[İI]|BUHUR[İI]ZADE|MUSTAFA\s*EFEND/.test(clean);
        const hasFatmaAliye = /FATMA\s*AL[İI]YE/.test(clean);
        const hasKemaleddin = /KEMALEDD[İI]N|M[İI]MAR\s*KEMAL/.test(clean);
        const hasCahitArf = /CAH[İI]T\s*ARF|ARF\s*DEĞİŞMEZ/.test(clean);
        const hasAydinSayili = /AYDIN\s*SAYILI/.test(clean);

        // Baş aşağı (180 derece ters) tutulduğunda OCR'ın "002", "001", "05", "02", "01" okuma ihtimali
        const hasUpsideDown200 = /\b002\b|\b00Z\b/.test(clean);
        const hasUpsideDown100 = /\b001\b/.test(clean);
        const hasUpsideDown50 = /\b05\b/.test(clean) && (isOrangeYellow || clean.includes('TÜRK') || clean.includes('LİRA'));
        const hasUpsideDown20 = /\b02\b|\b0Z\b/.test(clean) && (isGreen || clean.includes('TÜRK') || clean.includes('LİRA'));
        const hasUpsideDown10 = /\b01\b/.test(clean) && (isRedPink || clean.includes('TÜRK') || clean.includes('LİRA'));

        const hasPortraitMatch = hasYunusEmre || hasItri || hasFatmaAliye || hasKemaleddin || hasCahitArf || hasAydinSayili;
        const hasUpsideDownMatch = hasUpsideDown200 || hasUpsideDown100 || hasUpsideDown50 || hasUpsideDown20 || hasUpsideDown10;
        const isMoneyContext = hasPortraitMatch || hasUpsideDownMatch ||
            clean.includes('TÜRK') || clean.includes('TURK') ||
            clean.includes('LİRA') || clean.includes('LIRA') ||
            clean.includes('MERKEZ') || clean.includes('BANKA') ||
            (state.mode === 'color_cloth' && /\b(?:200|100|50|20|10)\b/.test(clean));

        if (!isMoneyContext) return null;

        // TCMB E9 Seri Numarası Kalıbı (Örn: B14 582910 veya A09 1234567)
        let serialNumber = '';
        const serialMatch = clean.match(/\b([A-ZÇĞİÖŞÜ]\s*\d{2})\s*(\d{6,7})\b/);
        if (serialMatch) {
            serialNumber = (serialMatch[1] + serialMatch[2]).replace(/\s+/g, '');
        }

        const foundNotes = [];
        const pushNote = (kurus, label) => {
            if (!foundNotes.some(n => n.kurus === kurus)) {
                foundNotes.push({ kurus, label, count: 1 });
            }
        };

        if (hasYunusEmre || hasUpsideDown200 || /\b200\b|İKİ\s*YÜZ|IKI\s*YUZ/.test(clean)) {
            pushNote(20000, '200 Türk Lirası');
        }
        if (hasItri || hasUpsideDown100 || /\b100\b|\bYÜZ\s*(?:TÜRK|LİRA)|\bYUZ\s*(?:TURK|LIRA)/.test(clean)) {
            pushNote(10000, '100 Türk Lirası');
        }
        if (hasFatmaAliye || hasUpsideDown50 || /\b50\b|ELLİ\s*(?:TÜRK|LİRA)|ELLI\s*(?:TURK|LIRA)/.test(clean)) {
            pushNote(5000, '50 Türk Lirası');
        }
        if (hasKemaleddin || hasUpsideDown20 || /\b20\b|YİRMİ\s*(?:TÜRK|LİRA)|YIRMI\s*(?:TURK|LIRA)/.test(clean)) {
            // Eğer OCR parmak yüzünden 200'ün son sıfırını kaçırıp "20" okuduysa ama kağıt belirgin Mor/Eflatun ise ve Yeşil değilse:
            if (isPurple && !isGreen && !/YİRMİ|YIRMI/.test(clean) && !hasKemaleddin) {
                pushNote(20000, '200 Türk Lirası');
            } else {
                pushNote(2000, '20 Türk Lirası');
            }
        }
        if (hasCahitArf || hasUpsideDown10 || /\b10\b|\bON\s*(?:TÜRK|LİRA)|\bON\s*(?:TURK|LIRA)/.test(clean)) {
            // Eğer OCR parmak yüzünden 100'ün son sıfırını kaçırıp "10" okuduysa ama kağıt belirgin Mavi/Turkuaz ise ve Kırmızı değilse:
            if (isBlueCyan && !isRedPink && !/\bON\s*(?:TÜRK|LİRA|TURK|LIRA)/.test(clean) && !hasCahitArf) {
                pushNote(10000, '100 Türk Lirası');
            } else {
                pushNote(1000, '10 Türk Lirası');
            }
        }
        if (hasAydinSayili || /\b5\b\s*(?:TÜRK|TURK|LİRA|LIRA|TL)|BEŞ\s*(?:TÜRK|LİRA)|BES\s*(?:TURK|LIRA)/.test(clean)) {
            // Eğer 50 TL'nin sıfırı kapandıysa ama renk belirgin Turuncu/Sarı ise:
            if (isOrangeYellow && !/BEŞ|BES/.test(clean) && !hasAydinSayili) {
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

        // 1. Ortam Işığı, Netlik ve Arka Plan Atmosferi
        let lightDesc = 'aydınlık ve dengeli ışıklı';
        if (metrics.avgBrightness < 42) lightDesc = 'oldukça karanlık';
        else if (metrics.avgBrightness < 82) lightDesc = 'loş ışıklı';
        else if (metrics.avgBrightness > 205) lightDesc = 'bol ışıklı ve parlak';

        const sharpDesc = metrics.sharpness >= 7.0 ? 'net çıkmış' : 'biraz bulanık çıkmış';
        const topBg = measureRegionColorAndPattern(imgData, w, h, w * 0.15, h * 0.04, w * 0.70, h * 0.18);
        sentences.push(`Fotoğraf betimlemesi: ${lightDesc}, ${sharpDesc} bir görüntü; arka plan genel olarak ${topBg.colorName} tonlarında.`);

        // 2. İnsan Sayısı (Net Vurgu), Soldan Sağa Sıralama, Birbirine & Eşyalara Göre Konum ve Kıyafetleri
        const people = preds.filter(p => p.class === 'person' && (p.score || 0) >= 0.45);
        const otherObjs = preds.filter(p => p.class !== 'person');
        if (people.length === 0) {
            sentences.push('Kişi sayısı: Etrafta hiç kimse görünmüyor (0 kişi).');
        } else {
            // Soldan sağa doğru sırala (en soldaki 1. kişi, onun sağındaki 2. kişi...)
            people.sort((a, b) => (a.bbox[0] + a.bbox[2] / 2) - (b.bbox[0] + b.bbox[2] / 2));
            if (people.length === 1) {
                sentences.push('Kişi sayısı: Etrafta 1 kişi var.');
            } else {
                sentences.push(`Kişi sayısı: Etrafta soldan sağa doğru toplam ${people.length} kişi var.`);
            }

            const analyzedPhotoPeople = [];
            people.slice(0, 4).forEach((p, idx) => {
                const [bx, by, bw, bh] = p.bbox;
                const cx = (bx + bw / 2) / w;
                let posWord = 'ortadaki';
                if (cx < 0.36) posWord = 'soldaki';
                else if (cx > 0.64) posWord = 'sağdaki';

                const gaze = estimatePersonGazeAndOrientation(p.bbox, metrics, w, h);
                const torso = measureRegionColorAndPattern(
                    imgData, w, h,
                    bx + bw * 0.22,
                    by + bh * 0.32,
                    Math.max(12, bw * 0.56),
                    Math.max(12, bh * 0.38)
                );
                const anchorRel = findNearestObjectRelativePhrase(p.bbox, otherObjs, w, h);
                analyzedPhotoPeople.push({ p, cx, posWord, gaze, torso, anchorRel });
            });

            analyzedPhotoPeople.forEach((item, idx) => {
                const { p, posWord, gaze, torso, anchorRel } = item;
                let personTitle = '';
                if (analyzedPhotoPeople.length === 1) {
                    const anchorText = anchorRel ? ` (${anchorRel} kişi)` : '';
                    personTitle = `Görüntüdeki tek kişi (${posWord} kişi${anchorText})`;
                } else if (idx === 0) {
                    const nextPerson = analyzedPhotoPeople[1];
                    const relToNext = nextPerson ? `, ${nextPerson.torso.colorName.toLowerCase()} kıyafetli kişinin solundaki kişi` : '';
                    const anchorText = anchorRel ? `, ${anchorRel} kişi` : '';
                    personTitle = `En soldaki 1. kişi (${posWord}${relToNext}${anchorText})`;
                } else {
                    const prevPerson = analyzedPhotoPeople[idx - 1];
                    const orderLabel = (idx === analyzedPhotoPeople.length - 1 && analyzedPhotoPeople.length >= 2)
                        ? (analyzedPhotoPeople.length === 2 ? 'Sağdaki 2. kişi' : `En sağdaki ${idx + 1}. kişi`)
                        : `Ortadaki ${idx + 1}. kişi`;
                    const relToPrev = `${prevPerson.torso.colorName.toLowerCase()} kıyafetli kişinin sağındaki kişi`;
                    const anchorText = anchorRel ? `, ${anchorRel} kişi` : '';
                    personTitle = `${orderLabel} (${relToPrev}${anchorText})`;
                }

                sentences.push(
                    `${personTitle}: Yaklaşık ${gaze.approxMeters} metre mesafede duruyor ve ${gaze.gazeDesc}. ` +
                    `Üzerinde ${torso.colorName} renginde, ${torso.pattern} bir kıyafet var.`
                );

                if (idx === 0) {
                    const audit = evaluatePortraitPrivacyAndBacklight(p.bbox, metrics, preds, w, h);
                    if (audit.hasBacklight) {
                        sentences.push('Uyarı: Arkadan güçlü ışık vurduğu için yüzü biraz gölgede kalmış.');
                    } else if (audit.clippedParts.length > 0) {
                        sentences.push(`Kadraj notu: Kişinin ${audit.clippedParts.join(' ve ')} fotoğraf kenarına çok yakın.`);
                    } else {
                        sentences.push('Kişinin baş ve omuzları kesilmeden kadraja tam ve güzel yerleşmiş.');
                    }
                }
            });
        }

        // 3. Çevredeki Diğer Eşyalar ve Fotoğraftaki Konumları
        if (otherObjs.length > 0) {
            const itemPhrases = otherObjs.slice(0, 6).map(obj => {
                const [bx, by, bw, bh] = obj.bbox;
                const cx = (bx + bw / 2) / w;
                const cy = (by + bh / 2) / h;
                let loc = 'ortada';
                if (cx < 0.35 && cy < 0.45) loc = 'sol üstte';
                else if (cx < 0.35 && cy >= 0.45) loc = 'sol tarafta';
                else if (cx > 0.65 && cy < 0.45) loc = 'sağ üstte';
                else if (cx > 0.65 && cy >= 0.45) loc = 'sağ tarafta';
                else if (cy > 0.65) loc = 'alt kısımda';

                const objColor = measureRegionColorAndPattern(imgData, w, h, bx + bw * 0.2, by + bh * 0.2, bw * 0.6, bh * 0.6);
                const trName = TR_LABELS[obj.class] || obj.class;
                return `${loc} ${objColor.colorName} tonlarında ${trName}`;
            });
            sentences.push(`Çevredeki eşyalar: ${itemPhrases.join(', ')} görünüyor.`);
        } else if (people.length === 0) {
            // Hiç insan veya nesne yoksa yakın plan yüzey/manzara anlatımı
            const mid = measureRegionColorAndPattern(imgData, w, h, w * 0.25, h * 0.25, w * 0.50, h * 0.50);
            const bot = measureRegionColorAndPattern(imgData, w, h, w * 0.20, h * 0.68, w * 0.60, h * 0.24);
            sentences.push(`Fotoğrafın merkezinde ${mid.colorName} renginde (${mid.pattern}) bir yüzey veya alan yer alıyor; alt kısım ise ${bot.colorName} tonlarında.`);
        }

        // 4. Madeni (Demir) Paralar, Kağıt Para veya Yazı Özeti
        const coinScan = detectAndClassifyTurkishCoins(metrics, w, h, cleanText);
        if (coinScan.coins.length > 0) {
            sentences.push(coinScan.summarySpeech);
        }

        if (cleanText && cleanText.trim().length >= 3) {
            const banknote = detectTurkishBanknoteFromTextAndColor(cleanText);
            if (banknote) {
                sentences.push(`Fotoğrafta ${banknote} kağıt para görünüyor.`);
            }
            const shortText = cleanText.replace(/\s+/g, ' ').trim();
            sentences.push(`Fotoğrafın üzerindeki yazı: "${shortText}".`);
        }

        sentences.push('İpucu: Şimdi parmağınızı aşağıdaki fotoğrafın üzerinde gezdirerek dokunduğunuz her noktada ne olduğunu tek tek keşfedebilirsiniz.');
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

        // Nesneleri keşif haritası üzerinde de işaretle
        preds.forEach(p => {
            const trName = TR_LABELS[p.class] || p.class;
            drawTargetBox(ctx, p.bbox, scaleX, scaleY, p.class === 'person' ? '#22c55e' : '#38bdf8', trName);
        });

        // Madeni (demir) paraları keşif haritası üzerinde işaretle ve parmakla dokunma için kaydet
        const coinScan = detectAndClassifyTurkishCoins(metrics, capCanvas.width, capCanvas.height);
        coinScan.coins.forEach(coin => {
            drawCoinCircleOverlay(ctx, coin, scaleX, scaleY);
        });

        state.exploredPhoto = {
            width: capCanvas.width,
            height: capCanvas.height,
            imageData: metrics.imageData,
            preds,
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

        // 2. Öncelik: Parmağın altında okunan bir yazı satırı var mı?
        if (!hitDescription && ocrLines && ocrLines.length > 0) {
            for (let i = 0; i < ocrLines.length; i++) {
                const ln = ocrLines[i];
                if (ln.bbox && px >= ln.bbox.x0 && px <= ln.bbox.x1 && py >= ln.bbox.y0 && py <= ln.bbox.y1) {
                    const cleanLn = (ln.text || '').replace(/\s+/g, ' ').trim();
                    if (cleanLn.length >= 2) {
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
            radar.playLightMeterTone(patch.avgLum, (nx - 0.5) * 1.4);
            announceGuidance(hitDescription, {
                force: true,
                updateBanner: false,
                minIntervalMs: 350
            });
        }
    }

    async function captureAndDescribePhoto(isAutoTriggered = false) {
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
     * Hem kameradan çekilen fotoğrafı, hem Galeriden seçilen fotoğrafı, hem de WhatsApp'tan
     * "Paylaş -> Mikyas Kamera Asistanı" ile gönderilen fotoğrafı detaylı betimler ve okur.
     */
    async function analyzePhotoCanvasAndDescribe(capCanvas, sourceLabel = 'Fotoğraf') {
        const ctx = capCanvas.getContext('2d');
        state.lastCapturedDataUrl = capCanvas.toDataURL('image/jpeg', 0.92);
        el.btnDownloadPhoto.hidden = false;

        const metrics = analyzeFrameMathematics(ctx, capCanvas.width, capCanvas.height);
        let preds = [];
        if (!state.cocoModel && typeof window.cocoSsd !== 'undefined') {
            try {
                state.cocoModel = await window.cocoSsd.load({ base: 'lite_mobilenet_v2' });
            } catch (_) {}
        }
        if (state.cocoModel) {
            try {
                preds = await state.cocoModel.detect(capCanvas, 12, 0.32);
            } catch (_) {
                preds = [];
            }
        }

        // İlk anlık doğal Türkçe sahne betimlemesini hemen oluştur ve kullanıcıyı bekletmeden söyle!
        const initialStory = buildRichTurkishPhotoStory(capCanvas, metrics, preds, '');
        populatePhotoExplorerMap(capCanvas, metrics, preds, [], initialStory);

        showDetectedResult(`${sourceLabel} — Detaylı Türkçe Betimleme`, initialStory + '\n\n(Fotoğrafın üzerindeki yazılar ve şıklar okunuyor...)');
        announceGuidance(`${initialStory} Şimdi fotoğraftaki yazıları da kontrol ediyorum...`, {
            force: true,
            bannerState: 'centered'
        });

        if (typeof window.Tesseract !== 'undefined' && !state.isProcessingOcr) {
            state.isProcessingOcr = true;
            try {
                const binObj = applyBradleyRothShadowRemoval(capCanvas);
                const splitInfo = (state.mode === 'door_elevator_lcd')
                    ? { isTwoColumn: false, canvases: [preprocess7SegmentAndPanelCanvas(capCanvas)] }
                    : splitExamColumnsIfTwoColumn(binObj);

                let combinedText = '';
                let collectedLines = [];
                for (let i = 0; i < splitInfo.canvases.length; i++) {
                    const ocrRes = await window.Tesseract.recognize(splitInfo.canvases[i], 'tur+eng');
                    const partText = (ocrRes && ocrRes.data && ocrRes.data.text) ? ocrRes.data.text.trim() : '';
                    if (partText) {
                        combinedText += (combinedText ? '\n\n' : '') + partText;
                    }
                    if (ocrRes && ocrRes.data && Array.isArray(ocrRes.data.lines) && !splitInfo.isTwoColumn) {
                        collectedLines = ocrRes.data.lines;
                    }
                }

                if (combinedText.trim().length < 8) {
                    const fallbackRes = await window.Tesseract.recognize(capCanvas, 'tur+eng');
                    combinedText = (fallbackRes && fallbackRes.data && fallbackRes.data.text) ? fallbackRes.data.text.trim() : '';
                    if (fallbackRes && fallbackRes.data && Array.isArray(fallbackRes.data.lines)) {
                        collectedLines = fallbackRes.data.lines;
                    }
                }

                const cleanText = combinedText.trim();
                const fullStory = buildRichTurkishPhotoStory(capCanvas, metrics, preds, cleanText);
                populatePhotoExplorerMap(capCanvas, metrics, preds, collectedLines, fullStory);

                // ÖZEL MOD 9: İLAÇ KUTUSU, DOZAJ (mg), BARKOD VE SON KULLANMA TARİHİ (SKT) DENETÇİSİ
                if (state.mode === 'medicine_skt') {
                    const med = parseMedicineAndExpiryZeroError(cleanText, state.lastDetectedBarcode);
                    if (med.sktStatus === 'EXPIRED') {
                        radar.playDangerAlarm();
                        if (navigator.vibrate) navigator.vibrate([250, 80, 250, 80, 350]);
                    }
                    const dosageLine = med.dosages.length > 0 ? `İlaç Miktarı/Formu: ${med.dosages.join(', ')}.` : 'Miligram bilgisi bu yüzde görünmüyor.';
                    const usageLine = med.usageInstructions.length > 0 ? `Eczane Kullanım Tarifi: ${med.usageInstructions.join(', ')}.` : '';
                    const barcodeLine = med.barcodes.length > 0 ? `Doğrulanmış Barkod: ${med.barcodes.join(', ')}.` : '';
                    const medReport = `${med.sktSpeech}\n${dosageLine}\n${usageLine}\n${barcodeLine}\n\nKutuda Okunan Yazı:\n${cleanText || 'Yazı okunamadı.'}`.trim();

                    showDetectedResult('İlaç Kutusu ve Son Kullanma Tarihi Raporu', medReport);
                    announceGuidance(`${med.sktSpeech} ${dosageLine} ${usageLine} ${cleanText ? 'Kutu üzerindeki yazı: ' + cleanText.replace(/\s+/g, ' ') : ''}`, {
                        force: true,
                        bannerState: med.sktStatus === 'EXPIRED' ? 'warning' : 'centered'
                    });
                    return;
                }

                // ÖZEL MOD 13: GIDA TAZELİK / KÜF VE PAKET İÇERİĞİ DENETÇİSİ
                if (state.mode === 'food_freshness') {
                    const foodSurface = analyzeFoodMoldAndFreshness(metrics, capCanvas.width, capCanvas.height);
                    const pkg = parseFoodAllergensAndIngredients(cleanText);
                    const surfaceMsg = foodSurface.hasAnomaly
                        ? 'UYARI: Yiyeceğin üzerinde küf veya çürük lekesi görünüyor!'
                        : `Yiyeceğin üzerinde küf veya bozulma lekesi görünmüyor (Rengi: ${metrics.centerColor.name}).`;
                    const allergenMsg = pkg.allergens.length > 0
                        ? `DİKKAT ALERJİ UYARISI: Pakette ${pkg.allergens.join(', ')} var!`
                        : 'Okunan yazıda bilinen bir alerji maddesine rastlanmadı.';
                    const foodReport = `${surfaceMsg}\n${allergenMsg}\n${pkg.sktInfo.formattedDate !== 'Doğrulanamadı' ? pkg.sktInfo.sktSpeech : ''}\n\nPakette Okunan Yazı:\n${cleanText || 'Paket yazısı algılanmadı.'}`.trim();

                    if (foodSurface.hasAnomaly || pkg.sktInfo.sktStatus === 'EXPIRED') {
                        radar.playDangerAlarm();
                    }
                    showDetectedResult('Yiyecek Tazelik ve Paket İçeriği Raporu', foodReport);
                    announceGuidance(`${surfaceMsg} ${allergenMsg} ${pkg.sktInfo.formattedDate !== 'Doğrulanamadı' ? pkg.sktInfo.sktSpeech : ''}`, {
                        force: true,
                        bannerState: (foodSurface.hasAnomaly || pkg.sktInfo.sktStatus === 'EXPIRED') ? 'warning' : 'centered'
                    });
                    return;
                }

                // ÖZEL MOD 12: KAPI NUMARASI, ASANSÖR TUŞ PANELİ VE MAKİNE EKRANI OKUYUCU
                if (state.mode === 'door_elevator_lcd') {
                    const degMatches = cleanText.match(/\b\d{1,4}\s*(?:°\s*C|derece|devir|dk|dakika|kat|daire|no)\b/gi) || [];
                    const numTokens = cleanText.match(/\b(?:E\d{1,2}|F\d{1,2}|\d{1,4})\b/g) || [];
                    const summaryNums = degMatches.length > 0
                        ? `Okunan Değerler: ${degMatches.join(', ')}.`
                        : (numTokens.length > 0 ? `Okunan Numara / Tuşlar: ${[...new Set(numTokens)].slice(0, 8).join(', ')}.` : 'Rakam algılanamadı.');
                    const panelReport = `${summaryNums}\n\nEkran veya Kapı Yazısı:\n${cleanText || 'Rakam veya yazı okunamadı.'}`;
                    showDetectedResult('Kapı Numarası, Asansör & Makine Ekranı Raporu', panelReport);
                    announceGuidance(`${summaryNums} ${cleanText.replace(/\s+/g, ' ')}`, {
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
                    const posIban = processPosAmountAndIbanText(cleanText);
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

                // ÖZEL MOD 23: ERİŞİLEBİLİR YEMEK YAPMA REHBERİ (OCAK ATEŞİ, KIZARMIŞLIK VE ÇAY DEMİ KONTROLÜ)
                if (state.mode === 'cooking_guide') {
                    const cookCheck = analyzeStoveFlameAndFoodBrowning(capCanvas, metrics, cleanText);
                    showDetectedResult('👩‍🍳🔥 Ocak Ateşi, Kızarmışlık ve Dem Raporu', cookCheck.fullText);
                    announceGuidance(cookCheck.speechText, { force: true, bannerState: cookCheck.isBurntRisk ? 'warning' : 'centered' });
                    return;
                }

                // ÖZEL MOD 5 (PARA SAYMA): ÇEKİLEN FOTOĞRAFTA KAĞIT PARA VEYA DEMİR PARA VARSA OTOMATİK TOPLAMA EKLE
                const centerColName = metrics.centerColor ? metrics.centerColor.name : '';
                let banknoteDetails = detectTurkishBanknoteDetailsFromText(cleanText, centerColName);
                if (!banknoteDetails && state.mode === 'color_cloth') {
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
                const photoCoins = detectAndClassifyTurkishCoins(metrics, capCanvas.width, capCanvas.height, cleanText);
                if (banknoteDetails || (state.mode === 'color_cloth' && photoCoins.coins.length > 0)) {
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
                    addMoneyToRunningTotal(combinedKurus, fullAddedLabel, combinedItems, 'ocr_money');
                    const totalFormatted = formatTurkishKurusTotal(state.moneyTotalKurus);
                    const breakdown = computeMoneyBreakdownSummary();
                    showDetectedResult(
                        `💵🪙 ${fullAddedLabel} Eklendi — Toplam: ${totalFormatted}`,
                        `Eklenen Para: ${fullAddedLabel}\nŞu Anki Toplam Paranız: ${totalFormatted}\nSayılan Paralar: ${breakdown.spokenBreakdown}\n\n--- Detaylı Betimleme ---\n${fullStory}`
                    );
                    return;
                }

                const parsedQuestions = parseExamQuestionsAndOptions(cleanText);
                if (parsedQuestions.length > 0) {
                    state.examQuestions = parsedQuestions;
                    state.currentExamIndex = 0;
                    updateExamRemoteUI();
                }

                const firstQ = state.examQuestions[0];
                const hasOptions = firstQ && (firstQ.options.A || firstQ.options.B || firstQ.options.C);

                if (hasOptions) {
                    const colNote = splitInfo.isTwoColumn ? 'Yan yana iki sütunlu test kağıdı birbirine karışmadan ayrıldı.' : '';
                    const finalReport = `${colNote}\nToplam ${state.examQuestions.length} soru bulundu.\n\nSoru ${firstQ.number}: ${firstQ.stem}\n` +
                        ['A', 'B', 'C', 'D', 'E']
                            .filter(k => Boolean(firstQ.options[k]))
                            .map(k => `${k}) ${firstQ.options[k]}`)
                            .join('\n') + `\n\n--- Sahne Betimlemesi ---\n${fullStory}`;
                    showDetectedResult('Sınav Sorusu ve Şıklar', finalReport.trim());
                    speakCurrentQuestionStem();
                } else {
                    showDetectedResult(`${sourceLabel} — Detaylı Betimleme ve Yazılar`, fullStory);
                    announceGuidance(fullStory, {
                        force: true,
                        bannerState: 'centered'
                    });
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
     * SADECE gerçek harf/kelime içeren ve güven skoru yüksek olan gerçek ekran yazılarını döndürür.
     */
    function extractVerifiedRealTextFromOcrResult(ocrRes) {
        if (!ocrRes || !ocrRes.data) return '';
        const lines = Array.isArray(ocrRes.data.lines) ? ocrRes.data.lines : [];
        const verifiedLines = [];

        for (let i = 0; i < lines.length; i++) {
            const ln = lines[i];
            const conf = typeof ln.confidence === 'number' ? ln.confidence : (ocrRes.data.confidence || 0);
            if (conf < 56) continue;

            const raw = String(ln.text || '').replace(/\s+/g, ' ').trim();
            if (raw.length < 3) continue;

            // Gerçek harf veya rakam oranı kontrolü (yaprak/duvar dokusundan çıkan "| \ / _ ~" çöplerini reddet)
            const alphaNumMatches = raw.match(/[\p{L}\p{N}]/gu) || [];
            const alphaRatio = alphaNumMatches.length / raw.length;
            if (alphaNumMatches.length < 3 || alphaRatio < 0.62) continue;

            // En az bir anlamlı (2+ harfli) kelime veya 2+ haneli sayı içermeli
            if (!/[\p{L}]{2,}|\d{2,}/u.test(raw)) continue;

            verifiedLines.push(raw);
        }

        return verifiedLines.join(' — ');
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
    function analyzePersonAppearanceAndActionInFrame(p, allObjects, metrics, w, h, pixelMotion) {
        const [bx, by, bw, bh] = p.bbox;
        const imgData = metrics.imageData;
        const cxNorm = (bx + bw / 2) / w;
        const posWord = cxNorm < 0.35 ? 'soldaki' : (cxNorm > 0.65 ? 'sağdaki' : 'ortadaki');
        const anchorRel = findNearestObjectRelativePhrase(p.bbox, allObjects, w, h);

        // Çekim planı ve duruş (Yakın plan portre mi, bel üstü mü, boydan mı?)
        const heightRatio = bh / Math.max(1, h);
        const aspect = bh / Math.max(1, bw);
        let shotAndPosture = 'orta planda';
        if (heightRatio >= 0.68 && aspect < 1.55) {
            shotAndPosture = 'yakın planda (bel/göğüs üstü)';
        } else if (heightRatio >= 0.62 && aspect >= 1.65) {
            shotAndPosture = 'boydan';
        } else if (heightRatio < 0.38) {
            shotAndPosture = 'arka/uzak planda';
        }

        // Bakış yönü
        const gaze = estimatePersonGazeAndOrientation(p.bbox, metrics, w, h);

        // Üst kıyafet (Gövde: %26 - %60 arası)
        const upperCloth = measureRegionColorAndPattern(
            imgData, w, h,
            bx + bw * 0.22, by + bh * 0.26,
            Math.max(12, bw * 0.56), Math.max(12, bh * 0.34)
        );

        // Alt kıyafet (Eğer kişi boydan veya diz üstü görünüyorsa: %62 - %88 arası)
        let clothText = `üzerinde ${upperCloth.colorName} renginde ${upperCloth.pattern} bir üst kıyafet var`;
        if (heightRatio >= 0.55 && aspect >= 1.55 && (by + bh) <= h * 0.98) {
            const lowerCloth = measureRegionColorAndPattern(
                imgData, w, h,
                bx + bw * 0.24, by + bh * 0.62,
                Math.max(12, bw * 0.52), Math.max(12, bh * 0.26)
            );
            if (lowerCloth.colorName !== upperCloth.colorName) {
                clothText = `üstünde ${upperCloth.colorName} (${upperCloth.pattern}) kıyafet, altında ${lowerCloth.colorName} pantolon/alt kıyafet var`;
            }
        }

        // Kişinin eşyalarla gerçek geometrik etkileşimi (Ne yapıyor?)
        const actions = [];
        let isSittingOnFurniture = false;

        for (let i = 0; i < allObjects.length; i++) {
            const obj = allObjects[i];
            const [ox, oy, ow, oh] = obj.bbox;
            const ocx = ox + ow / 2;
            const ocy = oy + oh / 2;
            const trObj = TR_LABELS[obj.class] || obj.class;

            // Kişi kutusu ile nesne kutusu arasındaki yakınlık / kesişim kontrolü
            const horizOverlap = Math.max(0, Math.min(bx + bw, ox + ow) - Math.max(bx, ox));
            const vertOverlap = Math.max(0, Math.min(by + bh, oy + oh) - Math.max(by, oy));
            const isTouchingOrInside = (horizOverlap > 0 && vertOverlap > 0) ||
                (Math.abs(ocx - (bx + bw / 2)) <= bw * 0.75 && Math.abs(ocy - (by + bh / 2)) <= bh * 0.65);

            if (!isTouchingOrInside) continue;

            if (obj.class === 'chair' || obj.class === 'couch' || obj.class === 'bench') {
                isSittingOnFurniture = true;
                actions.push(`${trObj.toLowerCase()} üzerinde oturuyor`);
            } else if (obj.class === 'dining table') {
                actions.push('masanın başında bulunuyor');
            } else if (obj.class === 'cell phone') {
                actions.push('elinde cep telefonu tutuyor');
            } else if (obj.class === 'cup' || obj.class === 'wine glass' || obj.class === 'bottle') {
                actions.push(`elinde veya hemen önünde ${trObj.toLowerCase()} tutuyor`);
            } else if (obj.class === 'laptop' || obj.class === 'keyboard') {
                actions.push('önündeki bilgisayarla ilgileniyor');
            } else if (obj.class === 'book') {
                actions.push('elinde veya önünde kitap tutuyor');
            } else if (obj.class === 'backpack' || obj.class === 'handbag') {
                actions.push(`üzerinde/elinde ${trObj.toLowerCase()} taşıyor`);
            } else if (obj.class === 'umbrella') {
                actions.push('elinde şemsiye tutuyor');
            } else if (obj.class === 'fork' || obj.class === 'spoon' || obj.class === 'knife' || obj.class === 'bowl') {
                actions.push('yemek yiyor veya sofra gereci kullanıyor');
            }
        }

        // Eğer sandalye/koltuk görünmüyorsa bile kişinin en/boy ve kadraj konumundan duruşunu belirle
        if (!isSittingOnFurniture && actions.length === 0) {
            if (aspect >= 1.75) {
                actions.push('ayakta duruyor');
            } else {
                actions.push('bulunduğu yerde duruyor');
            }
        }

        // Kişinin bulunduğu bölgede aktif el/kol veya baş hareketi var mı?
        if (pixelMotion && pixelMotion.isSubjectMotion && pixelMotion.changedPct >= 5) {
            const mPx = pixelMotion.motionCx * w;
            const mPy = pixelMotion.motionCy * h;
            if (mPx >= bx - bw * 0.25 && mPx <= bx + bw * 1.25 && mPy >= by - bh * 0.15 && mPy <= by + bh * 1.15) {
                const relMotionY = (mPy - by) / Math.max(1, bh);
                if (relMotionY < 0.35) {
                    actions.push('başını hareket ettiriyor / konuşuyor');
                } else if (relMotionY < 0.78) {
                    actions.push('elini veya kolunu hareket ettiriyor');
                } else {
                    actions.push('adım atıyor / hareket ediyor');
                }
            }
        }

        const uniqueActions = [...new Set(actions)];
        return {
            posWord,
            anchorRel,
            shotAndPosture,
            gazeDesc: gaze.gazeDesc,
            clothText,
            upperColor: upperCloth.colorName,
            actionText: uniqueActions.join(', '),
            cxNorm,
            cyNorm: (by + bh / 2) / h,
            areaNorm: (bw * bh) / Math.max(1, w * h)
        };
    }

    function buildSingleKeyframeCompactSummary(frameAnalysis) {
        const { canvas, metrics, preds, pixelMotion } = frameAnalysis;
        const w = canvas.width;
        const h = canvas.height;
        const imgData = metrics.imageData;
        const parts = [];

        // SADECE yüksek güvenilirlikli (>= 0.52) nesne ve kişileri raporla; asla tahmin/uydurma yapma!
        const verifiedPreds = preds.filter(p => (p.score || 0) >= 0.52);
        // Kişileri soldan sağa doğru sırala (cx koordinatına göre) ki "soldaki kişi", "onun sağındaki kişi" çok net olsun!
        const people = verifiedPreds
            .filter(p => p.class === 'person')
            .sort((a, b) => (a.bbox[0] + a.bbox[2] / 2) - (b.bbox[0] + b.bbox[2] / 2));
        const objects = verifiedPreds
            .filter(p => p.class !== 'person')
            .sort((a, b) => (b.bbox[2] * b.bbox[3]) - (a.bbox[2] * a.bbox[3]));

        frameAnalysis.personCount = people.length;

        if (people.length === 0) {
            parts.push('Etrafta hiç kimse yok (0 kişi)');
        } else {
            const pInfos = people.map(p => analyzePersonAppearanceAndActionInFrame(p, objects, metrics, w, h, pixelMotion));
            frameAnalysis.primaryPersonInfo = pInfos[0];
            frameAnalysis.allPersonInfos = pInfos;

            if (pInfos.length === 1) {
                const p0 = pInfos[0];
                const relNote = p0.anchorRel ? ` (${p0.anchorRel} kişi)` : '';
                parts.push(
                    `Etrafta 1 kişi var: ${p0.posWord} kişi${relNote} ${p0.shotAndPosture} görünüyor; ${p0.clothText}, ${p0.gazeDesc} ve ${p0.actionText}`
                );
            } else {
                const personDescriptions = pInfos.slice(0, 4).map((pInfo, idx) => {
                    const anchorText = pInfo.anchorRel ? `, ${pInfo.anchorRel} kişi` : '';
                    let roleTitle = '';
                    if (idx === 0) {
                        const nextP = pInfos[1];
                        const relToNext = nextP ? `${nextP.upperColor.toLowerCase()} kıyafetli kişinin solundaki kişi` : pInfo.posWord;
                        roleTitle = `Soldaki 1. kişi (${relToNext}${anchorText})`;
                    } else if (idx === pInfos.length - 1) {
                        const prevP = pInfos[idx - 1];
                        const labelPrefix = pInfos.length === 2 ? 'Sağdaki 2. kişi' : `En sağdaki ${idx + 1}. kişi`;
                        roleTitle = `${labelPrefix} (${prevP.upperColor.toLowerCase()} kıyafetli kişinin sağındaki kişi${anchorText})`;
                    } else {
                        const prevP = pInfos[idx - 1];
                        const nextP = pInfos[idx + 1];
                        roleTitle = `Ortadaki ${idx + 1}. kişi (soldaki ${prevP.upperColor.toLowerCase()} kıyafetli kişinin sağındaki ve sağdaki ${nextP.upperColor.toLowerCase()} kıyafetli kişinin solundaki kişi${anchorText})`;
                    }
                    return `${roleTitle}: ${pInfo.shotAndPosture}, ${pInfo.clothText}, ${pInfo.gazeDesc} ve ${pInfo.actionText}`;
                });
                parts.push(`Etrafta soldan sağa toplam ${pInfos.length} kişi var — ${personDescriptions.join('; ')}`);
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
            parts.push(`Çevredeki eşyalar: ${objList.join(', ')}`);
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
                    objects: curr.preds.filter(p => p.class !== 'person' && (p.score || 0) >= 0.52).map(p => TR_LABELS[p.class] || p.class)
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
            } else if (dy >= 0.14) {
                narrativeEvents.push('Kişi eğiliyor veya aşağı doğru oturuyor.');
            } else if (dy <= -0.14) {
                narrativeEvents.push('Kişi bulunduğu yerden doğrulup ayağa kalkıyor.');
            }

            // Video sırasında eline yeni bir eşya aldı mı veya masaya bir şey koydu mu?
            const initialObjs = new Set(firstP.objects);
            for (let t = 1; t < personTimeline.length; t++) {
                const step = personTimeline[t];
                for (const objName of step.objects) {
                    if (!initialObjs.has(objName)) {
                        initialObjs.add(objName);
                        narrativeEvents.push(`${step.timeSec}. saniye civarında kişinin elinde veya önünde ${objName} beliriyor.`);
                    }
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
                    preds = await state.cocoModel.detect(f.canvas, 10, 0.50);
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
            const score = preds.length * 25 + metrics.sharpnessScore;
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
        showDetectedResult(`🎬 ${sourceLabel} (${durationSec} sn) — Gerçek Zaman Sıralı Video Analizi`, initialVideoStory + '\n\n(Videodaki tüm karelerde gerçek ekran yazısı ve altyazı kontrolü yapılıyor...)');
        announceGuidance(`${initialVideoStory} Şimdi videodaki karelerde geçen gerçek yazıları okuyorum...`, {
            force: true,
            bannerState: 'centered'
        });

        // OPTİMİZASYON 2: 2ms'lik Yazı-Kenarı (Text-Stroke) Ön Tarayıcı + Sadece Yazı Şeridini Kırparak Hızlı OCR
        if (typeof window.Tesseract !== 'undefined' && !state.isProcessingOcr) {
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
                    finalVideoStory += `\n\nVideoda Okunan Gerçek Yazılar / Altyazılar:\n${captionSpeech}.`;
                    showDetectedResult(`🎬 ${sourceLabel} (${durationSec} sn) — Video Analizi ve Okunan Yazılar`, finalVideoStory);
                    populatePhotoExplorerMap(bestFrame.canvas, bestFrame.metrics, bestFrame.preds, [], finalVideoStory);
                    announceGuidance(`Videoda ekranda şu yazılar yer alıyor: ${captionSpeech}.`, {
                        force: true,
                        bannerState: 'centered'
                    });
                } else {
                    finalVideoStory += '\n\nVideoda ekranda herhangi bir yazı veya altyazı yer almıyor.';
                    showDetectedResult(`🎬 ${sourceLabel} (${durationSec} sn) — Gerçek Zaman Sıralı Video Analizi`, finalVideoStory);
                    announceGuidance('Videoda ekranda herhangi bir yazı veya altyazı yer almıyor.', {
                        force: true,
                        bannerState: 'centered'
                    });
                }
            } catch (_) {
                showDetectedResult(`🎬 ${sourceLabel} (${durationSec} sn) — Gerçek Zaman Sıralı Video Analizi`, initialVideoStory);
            } finally {
                state.isProcessingOcr = false;
            }
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
            el.btnOpenLink.href = urlMatch[0];
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
                state.barcodeDetector = new window.BarcodeDetector({ formats: ['qr_code', 'ean_13', 'code_128'] });
            } catch (_) {}
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
        el.qiblaCitySelect.innerHTML = '<option value="">-- Şehir Seçin (Veya GPS Otomatik Bulur) --</option>';
        TURKEY_81_PROVINCES.forEach(([name, lat, lon]) => {
            const bearing = calculateQiblaBearing(lat, lon);
            const opt = document.createElement('option');
            opt.value = `${lat},${lon},${name}`;
            opt.textContent = `${name} (Kıble: ${bearing}°)`;
            el.qiblaCitySelect.appendChild(opt);
        });
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
    function calculateSolarAndPrayerTimes(lat, lon) {
        const now = new Date();
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

        const tzOffsetHours = -now.getTimezoneOffset() / 60; // Türkiye için +3
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

        const curMin = now.getHours() * 60 + now.getMinutes();
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
        if (!state.qiblaLocationVerified || state.qiblaTargetBearing === null) {
            announceGuidance('Oda Kıble hafızasını kaydetmek için önce konumunuzun doğrulanmış olması gerekir.', {
                force: true,
                bannerState: 'warning'
            });
            return;
        }
        const landmarks = state.lastSceneObstacles.length > 0
            ? state.lastSceneObstacles.join(', ')
            : 'açık alan / duvar';
        const profile = {
            city: state.qiblaLocationSource,
            bearing: state.qiblaTargetBearing,
            landmarks,
            savedAt: new Date().toLocaleDateString('tr-TR')
        };
        try {
            localStorage.setItem('mikyas_saved_room_qibla', JSON.stringify(profile));
        } catch (_) {}
        announceGuidance(`Bu odadaki Kıble yönünüz (${profile.bearing} derece, önünüzdeki referans: ${landmarks}) başarıyla hafızaya kaydedildi!`, {
            force: true,
            bannerState: 'centered'
        });
    }

    function getSavedRoomQiblaNote() {
        try {
            const raw = localStorage.getItem('mikyas_saved_room_qibla');
            if (!raw) return '';
            const p = JSON.parse(raw);
            return ` Kayıtlı oda hafızası: ${p.bearing}° yönünde (${p.landmarks}) olarak işaretlenmişti.`;
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

        fetch('https://ipwho.is/')
            .then(r => r.json())
            .then(data => {
                if (!state.qiblaLocationVerified && data && typeof data.latitude === 'number' && typeof data.longitude === 'number') {
                    state.userLat = data.latitude;
                    state.userLon = data.longitude;
                    const city = data.city || 'Otomatik Konum';
                    updateQiblaTargetDisplay(city);
                }
            })
            .catch(() => {});
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
                ? `TAM KIBLE HİZASINDA (Güven: %${confidencePct})`
                : `${Math.round(absDelta)}° ${deltaDeg > 0 ? 'Sağınızda' : 'Solunuzda'} (Güven: %${confidencePct})`;
            el.qiblaCurrentDeg.textContent = `Pusula: ${Math.round(state.compassHeading)}° • ${dirStr}`;
        }

        el.tPosition.textContent = `Pusula: ${Math.round(state.compassHeading)}° (Kıble: ${state.qiblaTargetBearing}°)`;
        el.tDistance.textContent = isAligned ? `Tam Kıble (%${confidencePct} Güven)` : `${Math.round(absDelta)}° ${deltaDeg > 0 ? 'Sağa' : 'Sola'} Dönün`;

        const panX = Math.max(-1, Math.min(1, deltaDeg / 75));
        radar.updateRadar(panX, 0, isAligned);

        if (isAligned) {
            const now = performance.now();
            if (state.qiblaStableSince === 0) state.qiblaStableSince = now;

            if (now - state.qiblaStableSince >= 1300) {
                if (navigator.vibrate && now - state.lastQiblaLockVibrate > 2500) {
                    navigator.vibrate([120, 60, 180]);
                    state.lastQiblaLockVibrate = now;
                }
                const uniqueObs = [...new Set(state.lastSceneObstacles)];
                const obstacleNote = uniqueObs.length > 0
                    ? ` Ancak kamerada önünüzde ${uniqueObs.join(', ')} görünüyor, secde alanı için 1 adım yana geçebilirsiniz.`
                    : ' Önünüzdeki secde alanı da açık görünüyor.';

                announceGuidance(`Yüzde ${confidencePct} güvenle doğrulandı: Tam Kıble yönündesiniz! (${state.qiblaLocationSource}, ${state.qiblaTargetBearing} derece Kâbe açısı).${obstacleNote}`, {
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
        if (!Array.isArray(midiNotes) || midiNotes.length < 5) return null;
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

        if (bestSong && bestScore >= 0.57) {
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
            for (let j = 0; j < newSize - i; j++) {
                sum += slice[j] * slice[j + i];
            }
            c[i] = sum;
        }

        let d = 0;
        while (d + 1 < newSize && c[d] > c[d + 1]) d++;
        let maxval = -1, maxpos = -1;
        for (let i = d; i < newSize; i++) {
            if (c[i] > maxval) {
                maxval = c[i];
                maxpos = i;
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
            stopSongListening();
            return;
        }

        stopSongPreviewPlayback();
        if ('speechSynthesis' in window) {
            try { window.speechSynthesis.cancel(); } catch (_) {}
        }

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

        // 1. Canlı Mikrofon Nota (Melodi), Akort (Cent), Makam ve Ritim (BPM) Analizörü
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
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
        const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
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
                    el.songHeardWords.textContent = `Mırıldanan Melodi (%${humMatch.confidencePct} uyum): ${notesSnapshot.slice(-6).join(' → ')}`;
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
            renderSongAlternatives(list.slice(0, 5), 'Kayıtlı Şarkılarınızdan Tek Dokunuşla Dinleyin:');
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
                ? `✅ Melodiden Bulundu (%${melodyConfidencePct})`
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
            ? `Mırıldandığınız melodiden yüzde ${melodyConfidencePct} uyumla bulundu! `
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
                if (idx === 0 && !foundTrack) {
                    foundTrack = cand;
                } else if (idx === 0 && foundTrack && cand.lyrics.length > (foundTrack.lyrics || '').length) {
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
        'all': 'Tümü (23 Özellik)',
        'mutfak': 'Mutfak ve Yemek Yapma Kategorisi',
        'ev': 'Ev Kategorisi',
        'is_egitim': 'İş ve Eğitim Kategorisi',
        'saglik': 'Sağlık Kategorisi',
        'navigasyon': 'Navigasyon Kategorisi',
        'gunluk_yasam': 'Günlük Yaşam Kategorisi'
    };

    function filterModesByLifeCategory(catId) {
        if (!el.categoryTabs || !el.modeButtons) return;
        el.categoryTabs.forEach(tab => {
            const isSel = tab.getAttribute('data-category') === catId;
            tab.classList.toggle('active-toggle', isSel);
            tab.setAttribute('aria-pressed', isSel ? 'true' : 'false');
        });
        let visibleCount = 0;
        let firstVisibleMode = null;
        el.modeButtons.forEach(btn => {
            const btnCat = btn.getAttribute('data-category') || 'all';
            const show = (catId === 'all' || btnCat === catId);
            btn.hidden = !show;
            btn.style.display = show ? '' : 'none';
            if (show) {
                visibleCount++;
                if (!firstVisibleMode) {
                    firstVisibleMode = btn.getAttribute('data-mode');
                }
            }
        });
        const label = LIFE_CATEGORY_LABELS[catId] || 'Seçili Kategori';
        announceGuidance(`${label} açıldı. Bu bölümde ${visibleCount} özellik listeleniyor.`, {
            force: true,
            bannerState: 'normal'
        });
    }

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
                announceGuidance('Karşıdan otobüs veya minibüs yaklaşıyor! Hat numarasını okumak için kamerayı aracın ön camına doğru sabit tutun veya Boşluk tuşuna basın.', {
                    bannerState: 'centered',
                    minIntervalMs: 3800
                });
                if (state.autoCaptureEnabled && !state.isProcessingOcr) {
                    captureAndDescribePhoto(true);
                }
                return;
            }
        }
        el.tPosition.textContent = 'Yol Taranıyor';
        el.tDistance.textContent = state.busTargetStop ? `Durak: ${state.busTargetStop.name}` : 'Otobüs Bekleniyor';
        announceGuidance('Kamerayı durağa yaklaşan otobüs yönüne tutun; araç göründüğünde hat numarasını sesli okuyacağım.', {
            bannerState: 'normal',
            minIntervalMs: 6500
        });
    }

    function processBusRouteOcrResult(cleanText, preds) {
        const upper = String(cleanText || '').toUpperCase();
        const routeMatches = upper.match(/\b(?:\d{1,3}[A-ZÇĞİÖŞÜ]{1,3}|[A-Z]{1,2}\d{1,3}|[1-9]\d{0,3})\b/g) || [];
        const filteredRoutes = [...new Set(routeMatches)].filter(tok => tok.length >= 2 && tok !== '2026');
        const hasBus = Array.isArray(preds) && preds.some(p => p.class === 'bus');
        const badgeEl = document.getElementById('bus-seen-number');

        if (filteredRoutes.length > 0) {
            const topRoute = filteredRoutes.slice(0, 3).join(', ');
            state.lastSeenBusRoute = topRoute;
            if (badgeEl) badgeEl.textContent = `${topRoute} Numaralı Hat`;
            if (navigator.vibrate) navigator.vibrate([180, 70, 220]);
            const speech = `Dikkat! Yaklaşan otobüs veya tabelada okunan hat numarası: ${topRoute}. ${cleanText.replace(/\s+/g, ' ').slice(0, 120)}`;
            return {
                speechText: speech,
                fullText: `Okunan Hat Numarası: ${topRoute}\nAraç Algılandı mı: ${hasBus ? 'Evet (Otobüs/Minibüs)' : 'Tabela / Ön Yazı'}\n\nTam Okunan Metin:\n${cleanText}`
            };
        }
        const fallbackSpeech = hasBus
            ? 'Otobüs algılandı ancak ön tabeladaki hat numarası tam seçilemedi, lütfen biraz daha yaklaşınca tekrar okutun.'
            : (cleanText ? `Durak veya tabela yazısı: ${cleanText.replace(/\s+/g, ' ')}` : 'Henüz otobüs hat numarası algılanmadı.');
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
        if (!target && typeof TURKEY_81_CITIES !== 'undefined') {
            for (const c of TURKEY_81_CITIES) {
                if (c[0].toLocaleLowerCase('tr-TR').includes(qLower)) {
                    target = { name: `${c[0]} Merkez`, lat: c[1], lon: c[2] };
                    break;
                }
            }
        }
        if (!target) {
            try {
                const url = `https://nominatim.openstreetmap.org/search?format=json&countrycodes=tr&limit=1&q=${encodeURIComponent(q)}`;
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
            radar.playLockedChime();
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
            announceGuidance(`Hazırlanın! İneceğiniz ${state.busTargetStop.name} durağına ${distM} metre kaldı. Kapıya doğru hazırlanabilirsiniz.`, {
                force: true,
                bannerState: 'warning'
            });
            return;
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
        try {
            localStorage.setItem('mikyas_saved_bus_stop', JSON.stringify(state.busTargetStop));
        } catch (_) {}
        announceGuidance(`Şu an bulunduğunuz konum "${customName}" olarak kaydedildi.`, { force: true, bannerState: 'centered' });
    }

    function cancelBusStopAlarm() {
        if (state.busStopWatchTimer) {
            clearInterval(state.busStopWatchTimer);
            state.busStopWatchTimer = null;
        }
        state.busTargetStop = null;
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

    function processPosAmountAndIbanText(cleanText) {
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

        // POS veya Fiş Tutarı Yakalama
        const amountMatches = text.match(/(?:TUTAR|TOPLAM|SATIŞ|ODEME|ÖDEME|NAKİT|KART|TL|₺)?\s*\b\d{1,6}(?:[.,]\d{2})?\s*(?:TL|₺|TÜRK LİRASI|LİRA)\b/gi)
            || text.match(/\b\d{1,5}[.,]\d{2}\b/g)
            || [];
        const cleanAmounts = [...new Set(amountMatches.map(a => a.trim()))];

        const posEl = document.getElementById('pos-detected-amount');
        const ibanEl = document.getElementById('pos-detected-iban');
        const speechParts = [];

        if (cleanAmounts.length > 0) {
            state.lastDetectedPosAmount = cleanAmounts[0];
            if (posEl) posEl.textContent = cleanAmounts.join(' / ');
            speechParts.push(`Ekranda okunan ödeme tutarı: ${cleanAmounts[0]}.`);
        }

        if (foundIbanObj) {
            state.lastDetectedIban = foundIbanObj.formatted;
            if (ibanEl) ibanEl.textContent = `${foundIbanObj.formatted} ${foundIbanObj.isValidChecksum ? '(Doğrulandı)' : '(Kontrol Edin)'}`;
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(foundIbanObj.iban).catch(() => {});
            }
            speechParts.push(`26 haneli IBAN numarası bulundu ve telefonunuzun panosuna otomatik kopyalandı: ${foundIbanObj.formatted}.`);
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
        if (navigator.clipboard && navigator.clipboard.writeText) {
            try {
                await navigator.clipboard.writeText(raw);
            } catch (_) {}
        }
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
            announceGuidance('Lütfen eşyanızın adını ve nereye koyduğunuzu yazın veya sesle söyleyin.', { force: true, bannerState: 'warning' });
            return;
        }
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

    function searchItemMemoryByQuery(queryText) {
        const q = String(queryText || '').trim().toLocaleLowerCase('tr-TR');
        if (!q) {
            announceGuidance('Aramak istediğiniz eşyanın adını söyleyin veya kutuya yazın.', { force: true, bannerState: 'warning' });
            return;
        }
        const words = q.replace(/\b(?:nerede|nereye|koydum|acaba|benim|hangi)\b/g, '').trim().split(/\s+/).filter(w => w.length >= 2);
        const matches = state.itemMemories.filter(item => {
            const hay = item.text.toLocaleLowerCase('tr-TR');
            return hay.includes(q) || words.some(w => hay.includes(w.slice(0, Math.max(3, w.length - 2))));
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

    function startVoiceItemMemoryCapture(modeType = 'save') {
        const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRec) {
            announceGuidance('Tarayıcınız doğrudan ses tanımayı desteklemiyor, lütfen eşya adını kutuya yazın.', { force: true, bannerState: 'warning' });
            return;
        }
        const promptMsg = modeType === 'save'
            ? 'Şimdi eşyanızı nereye koyduğunuzu söyleyin, örneğin: Yedek anahtarı vestiyerin üst çekmecesine koydum.'
            : 'Şimdi aradığınız eşyanın adını söyleyin, örneğin: Yedek anahtar nerede?';
        announceGuidance(promptMsg, { force: true });

        setTimeout(() => {
            try {
                const rec = new SpeechRec();
                rec.lang = 'tr-TR';
                rec.interimResults = false;
                rec.maxAlternatives = 1;
                rec.onresult = (ev) => {
                    const transcript = (ev.results && ev.results[0] && ev.results[0][0]) ? ev.results[0][0].transcript : '';
                    if (transcript) {
                        if (modeType === 'save') {
                            saveItemMemoryEntry(transcript);
                        } else if (modeType === 'bus_dest') {
                            const inp = document.getElementById('bus-dest-input');
                            if (inp) inp.value = transcript;
                            setBusDestinationStopAlarm(transcript);
                        } else {
                            searchItemMemoryByQuery(transcript);
                        }
                    }
                };
                rec.start();
            } catch (_) {}
        }, 1600);
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
        const col = (state.lastMetrics && state.lastMetrics.centerColor) ? state.lastMetrics.centerColor.name : 'genel renkli';
        saveItemMemoryEntry(`Etiketlenen Kavanoz/Kutu (${col}): ${label}`, col);
    }

    function matchOrDescribeJarAndMemoryItem(capCanvas, metrics, cleanText) {
        const col = (metrics && metrics.centerColor) ? metrics.centerColor.name : '';
        const jarMemories = state.itemMemories.filter(m => m.colorTag && m.colorTag === col);
        const jarNote = jarMemories.length > 0
            ? `Bu ${col} kavanoz/kutu için daha önce kaydettiğiniz etiket: ${jarMemories[0].text}.`
            : `Görünen kavanoz veya kutunun rengi: ${col}.`;
        const ocrNote = cleanText ? `Üzerinde okunan yazı: ${cleanText.replace(/\s+/g, ' ')}.` : '';
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
        } else {
            el.tPosition.textContent = 'TV Ekranına Tutun';
            el.tDistance.textContent = 'Altyazı & Skor';
        }
    }

    function processTvSubtitleAndScoreText(cleanText, isSilentAuto = false) {
        const raw = String(cleanText || '').trim();
        const subEl = document.getElementById('tv-last-subtitle');
        const scoreEl = document.getElementById('tv-last-score');

        const scoreRegex = /\b(?:[A-ZÇĞİÖŞÜ]{2,12}\s*\d{1,2}\s*[-:]\s*\d{1,2}\s*[A-ZÇĞİÖŞÜ]{2,12}|\d{1,2}\s*[-:]\s*\d{1,2}|\d{1,2}['’]\s*DK|\d{2}:\d{2})\b/gi;
        const scoreMatches = raw.match(scoreRegex) || [];
        const scoreStr = scoreMatches.length > 0 ? scoreMatches.slice(0, 3).join(' | ') : '';

        if (scoreStr && scoreEl) {
            scoreEl.textContent = scoreStr;
        }
        const cleanLines = raw.split(/\n+/).map(l => l.trim()).filter(l => l.length >= 3);
        const subtitleLine = cleanLines.slice(-2).join(' ');
        if (subtitleLine && subEl) {
            subEl.textContent = subtitleLine;
        }

        const spoken = `${scoreStr ? 'Maç Skoru / Süre: ' + scoreStr + '. ' : ''}${subtitleLine ? 'Altyazı: ' + subtitleLine : 'Televizyon ekranında şu an altyazı görünmüyor.'}`;
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
            const text = (ocrRes && ocrRes.data && ocrRes.data.text) ? ocrRes.data.text.trim() : '';
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
        el.tPosition.textContent = `Görünen Renk: ${col}`;
        el.tDistance.textContent = `Desen: ${metrics.patternType || 'Düz'}`;
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
            colorInfo: classifyTurkishColorName(avgR, avgG, avgB),
            stdDev,
            outlierRatio
        };
    }

    function analyzeSocksAndOutfitStains(capCanvas, metrics, cleanText) {
        const ctx = capCanvas.getContext('2d');
        const w = capCanvas.width;
        const h = capCanvas.height;

        const leftHalf = sampleRegionRgbAndContrast(ctx, w * 0.08, h * 0.2, w * 0.38, h * 0.6);
        const rightHalf = sampleRegionRgbAndContrast(ctx, w * 0.54, h * 0.2, w * 0.38, h * 0.6);

        const colorDist = Math.sqrt(
            Math.pow(leftHalf.r - rightHalf.r, 2) +
            Math.pow(leftHalf.g - rightHalf.g, 2) +
            Math.pow(leftHalf.b - rightHalf.b, 2)
        );
        const sameColorName = leftHalf.colorInfo.name === rightHalf.colorInfo.name;
        const isPairMatch = sameColorName || colorDist < 34;

        const sockMsg = isPairMatch
            ? `Çorap / Kıyafet Eşleşmesi: Sol taraf (${leftHalf.colorInfo.name}) ile sağ taraf (${rightHalf.colorInfo.name}) birbirinin EŞİ ve uyumlu!`
            : `DİKKAT EŞ DEĞİL: Sol taraftaki parça ${leftHalf.colorInfo.name}, sağ taraftaki parça ise ${rightHalf.colorInfo.name} görünüyor; birbirinden farklı!`;

        const centerSample = sampleRegionRgbAndContrast(ctx, w * 0.25, h * 0.25, w * 0.5, h * 0.5);
        const hasStain = centerSample.outlierRatio > 0.045 && centerSample.outlierRatio < 0.26 && centerSample.stdDev < 45;
        const stainMsg = hasStain
            ? 'Leke Kontrolü: Kumaşın orta kısmında ana renkten farklı bir leke veya iz görünüyor, kontrol etmeniz önerilir.'
            : `Leke Kontrolü: ${centerSample.colorInfo.name} kumaş yüzeyinde belirgin bir çay veya yemek lekesi görünmüyor, temiz.`;

        const sockEl = document.getElementById('sock-match-result');
        const stainEl = document.getElementById('outfit-stain-result');
        if (sockEl) sockEl.textContent = isPairMatch ? `EŞLEŞTİ (${leftHalf.colorInfo.name})` : `FARKLI (${leftHalf.colorInfo.name} / ${rightHalf.colorInfo.name})`;
        if (stainEl) stainEl.textContent = hasStain ? 'Leke / İz Şüphesi Var' : 'Temiz Görünüyor';

        const speech = `${sockMsg} ${stainMsg} ${cleanText ? 'Etiket yazısı: ' + cleanText.replace(/\s+/g, ' ') : ''}`;
        return {
            speechText: speech,
            fullText: `${sockMsg}\n${stainMsg}\n\nEtiket Yazısı:\n${cleanText || 'Etiket yazısı yok.'}`
        };
    }

    // --- MOD 21: "TAM OLARAK NEREDEYİM?" SOKAK + TABELA + WHATSAPP KONUM TARİFİ ---
    state.lastWhereAmISummary = '';

    async function announceWhereAmIFullAddressAndSignboard(optionalOcrText = '', optionalPreds = []) {
        const addrEl = document.getElementById('where-address-text');
        const signEl = document.getElementById('where-signboard-text');
        if (addrEl) addrEl.textContent = 'Açık adresiniz bulunuyor...';

        let addressDesc = state.qiblaLocationSource || 'Konum bilgisi alınıyor';
        if (state.userLat && state.userLon) {
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
                    } else if (data.display_name) {
                        addressDesc = data.display_name.split(',').slice(0, 4).join(', ');
                    }
                }
            } catch (_) {}
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

    function shareWhereAmIOnWhatsapp() {
        const mapLink = (state.userLat && state.userLon)
            ? `https://maps.google.com/?q=${state.userLat},${state.userLon}`
            : '';
        const textToShare = `${state.lastWhereAmISummary || 'Şu an bulunduğum konum:'} ${mapLink ? '\nHarita Konumum: ' + mapLink : ''}`.trim();
        const waUrl = `https://wa.me/?text=${encodeURIComponent(textToShare)}`;
        window.open(waUrl, '_blank', 'noopener');
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
        { keys: ['köfte', 'ızgara köfte', 'et', 'kebap', 'tavuk', 'balık'], name: '1 Porsiyon Et / Tavuk / Balık / Köfte', kcal: 260, benefit: 'Yüksek protein değeriyle dokuları yeniler ve enerji verir.' },
        { keys: ['makarna', 'mantı', 'börek'], name: '1 Porsiyon Makarna / Börek / Mantı', kcal: 290, benefit: 'Mutluluk hormonu salgılanmasına yardımcı olan doyurucu bir öğündür.' },
        { keys: ['salata', 'çoban salata', 'yeşillik', 'cacık', 'yoğurt', 'ayran'], name: '1 Kase Yoğurt / Ayran / Taze Salata', kcal: 95, benefit: 'Ferahlatıcıdır, vitamin ve probiyotik desteğiyle vücudu yeniler.' },
        { keys: ['elma', 'muz', 'portakal', 'mandalina', 'çilek', 'karpuz', 'meyve'], name: '1 Porsiyon Taze Meyve', kcal: 75, benefit: 'Doğal C vitamini ve antioksidan deposudur, cilde ve bağışıklığa çok iyi gelir.' },
        { keys: ['çay', 'türk kahvesi', 'kahve', 'ıhlamur', 'bitki çayı'], name: 'Şekersiz Çay / Türk Kahvesi', kcal: 5, benefit: 'Zihni açar, yorgunluğu alır ve neredeyse hiç kalorisi yoktur.' },
        { keys: ['baklava', 'sütlaç', 'tatlı', 'çikolata', 'kek', 'pasta', 'dondurma'], name: '1 Porsiyon Tatlı / Çikolata Keyfi', kcal: 250, benefit: 'Ruhu tatlandırır ve moral verir! Küçük bir yürüyüşle enerjisi keyfe dönüşür.' },
        { keys: ['ekmek', 'tam buğday', 'tost'], name: '1 Dilim Ekmek / Tost', kcal: 85, benefit: 'B vitaminleri içerir ve öğünlerinize doyuruculuk katar.' }
    ];

    function loadStepCalorieFromStorage() {
        try {
            const todayKey = new Date().toISOString().slice(0, 10);
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
            const todayKey = new Date().toISOString().slice(0, 10);
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
        if (delta > 3.1 && (now - state.lastStepPeakTime) > 340) {
            state.lastStepPeakTime = now;
            state.dailySteps++;
            saveStepCalorieToStorage();
            if (state.dailySteps > 0 && state.dailySteps % 100 === 0) {
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
        state.dailySteps = 0;
        state.dailyIntakeKcal = 0;
        saveStepCalorieToStorage();
        announceGuidance('Günlük adım ve enerji sayacınız sıfırlandı. Yeni ve sağlıklı bir güne merhaba!', { force: true });
    }

    function calculateAndSpeakFoodCalories(foodQuery) {
        const q = String(foodQuery || '').trim().toLocaleLowerCase('tr-TR');
        if (!q) {
            announceGuidance('Lütfen yediğiniz veya merak ettiğiniz yemeğin adını yazın ya da Yemeği Sesle Söyle düğmesine basın.', { force: true, bannerState: 'warning' });
            return;
        }
        let matched = null;
        for (const item of TURKISH_FOOD_NUTRITION_DB) {
            if (item.keys.some(k => q.includes(k) || k.includes(q))) {
                matched = item;
                break;
            }
        }
        const lastFoodEl = document.getElementById('calorie-last-food');
        const inp = document.getElementById('calorie-food-input');
        if (inp) inp.value = '';

        if (matched) {
            state.dailyIntakeKcal += matched.kcal;
            saveStepCalorieToStorage();
            if (lastFoodEl) lastFoodEl.textContent = `${matched.name} (${matched.kcal} kcal)`;
            announceGuidance(`Afiyet ve şifa olsun! ${matched.name} yaklaşık ${matched.kcal} kaloridir. ${matched.benefit} Günlük enerji toplamınız ${state.dailyIntakeKcal} kalori oldu.`, {
                force: true,
                bannerState: 'centered'
            });
        } else {
            const estKcal = 180;
            state.dailyIntakeKcal += estKcal;
            saveStepCalorieToStorage();
            if (lastFoodEl) lastFoodEl.textContent = `${foodQuery} (~${estKcal} kcal)`;
            announceGuidance(`Afiyet olsun! "${foodQuery}" için ortalama bir porsiyon değeri yaklaşık ${estKcal} kaloridir ve vücudunuza güzel bir enerji sağlar. Günlük toplamınız ${state.dailyIntakeKcal} kalori oldu.`, {
                force: true,
                bannerState: 'centered'
            });
        }
    }

    function parsePackageOrMenuCaloriesKind(cleanText) {
        const text = String(cleanText || '');
        const kcalMatches = text.match(/\b\d{1,4}\s*(?:kcal|kalori|cal)\b/gi) || [];
        const protMatches = text.match(/protein\s*[:\-]?\s*\d+(?:[.,]\d+)?\s*g/gi) || [];
        const carbMatches = text.match(/karbonhidrat\s*[:\-]?\s*\d+(?:[.,]\d+)?\s*g/gi) || [];
        const sugarMatches = text.match(/şeker\s*[:\-]?\s*\d+(?:[.,]\d+)?\s*g/gi) || [];

        const parts = [];
        if (kcalMatches.length > 0) parts.push(`Enerji Değeri: ${kcalMatches[0]}`);
        if (protMatches.length > 0) parts.push(protMatches[0]);
        if (carbMatches.length > 0) parts.push(carbMatches[0]);
        if (sugarMatches.length > 0) parts.push(sugarMatches[0]);

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
    state.cookingTimerInterval = null;
    state.cookingTimerRemainingSec = 0;

    const BLIND_ACCESSIBLE_RECIPES = [
        {
            id: 'mercimek_corbasi',
            title: 'Lokanta Usulü Süzme Mercimek Çorbası (4 Kişilik)',
            keywords: ['mercimek', 'çorba', 'kırmızı mercimek', 'soğan', 'havuç', 'patates'],
            ingredients: '1 su bardağı kırmızı mercimek, 1 adet orta boy kuru soğan (dörde bölünmüş), 1 yemek kaşığı un, 1 yemek kaşığı tereyağı, 2 yemek kaşığı sıvı yağ, 1 tatlı kaşığı tuz, yarım çay kaşığı karabiber ve zerdeçal, 6 su bardağı sıcak su.',
            steps: [
                {
                    text: '1. Adım (Hazırlık ve Yıkama): 1 su bardağı kırmızı mercimeği tel süzgece koyup musluk altında elinizle karıştırarak yıkayın; suyun kayganlığı gidip berraklaştığında süzgeci silkeleyin.',
                    timerMinutes: 0
                },
                {
                    text: '2. Adım (Kokuya ve Sese Göre Kavurma): Derin tencereye 2 yemek kaşığı sıvı yağ ve 1 yemek kaşığı tereyağı koyup orta ateşi açın. İri doğranmış 1 soğanı ekleyin. Yağdan "cızır cızır" ses gelmeye başladıktan sonra tahta kaşıkla 3 dakika çevirin; tatlımsı kavrulmuş soğan kokusu burnunuza geldiğinde 1 yemek kaşığı unu ekleyip 1 dakika daha karıştırın.',
                    timerMinutes: 3
                },
                {
                    text: '3. Adım (Su Ekleme ve Kaynatma): Yıkanmış mercimeği, 1 tatlı kaşığı tuzu ve 6 su bardağı suyu tencereye dikkatlice ekleyin. Kapağı hafif aralık bırakın. Fokurdama sesini duyduktan sonra ocağı kısığa alıp mercimekler tamamen yumuşayana kadar 20 dakika pişirin.',
                    timerMinutes: 20
                },
                {
                    text: '4. Adım (Kıvam ve Servis): Ocağı kapatın. El blenderını tencerenin tabanına dik oturtup dışarı sıçramaması için çalıştırmadan önce tamamen sıvının içine daldırın ve 1 dakika pürüzsüz olana kadar çekin. Mis gibi çorbanız servise hazır, ellerinize sağlık!',
                    timerMinutes: 1
                }
            ]
        },
        {
            id: 'tereyagli_pirinc_pilavi',
            title: 'Tane Tane Tereyağlı Şehriyeli Pirinç Pilavı',
            keywords: ['pilav', 'pirinç', 'pirinç pilavı', 'şehriye', 'tereyağı'],
            ingredients: '2 su bardağı baldo pirinç, 2 yemek kaşığı arpa şehriye, 2 dolu yemek kaşığı tereyağı, 1 yemek kaşığı sıvı yağ, 3 su bardağı sıcak su (1 bardak pirince 1 buçuk bardak su ölçüsü), 1 buçuk tatlı kaşığı tuz.',
            steps: [
                {
                    text: '1. Adım (Nişasta Akıtma): 2 su bardağı pirinci derin bir kaba alıp üzerini geçecek kadar ılık su ve 1 çay kaşığı tuz ekleyin. 15 dakika bekletip süzgeçte soğuk suyla yıkayın ve iyice süzün.',
                    timerMinutes: 15
                },
                {
                    text: '2. Adım (Şehriyeyi Kokusundan Anlama): Pilav tenceresine 1 yemek kaşığı sıvı yağ ve 2 yemek kaşığı tereyağını koyup orta ateşi açın. 2 yemek kaşığı arpa şehriyeyi ekleyin. Sürekli karıştırırken yaklaşık 2 dakika sonra fındıksı, kavruk ve sıcak bir koku burnunuza gelecek ve şehriyeler kaşığa daha sert çarpmaya başlayacak; işte tam o an şehriyeler altın rengi olmuştur.',
                    timerMinutes: 2
                },
                {
                    text: '3. Adım (Kaşık Direnciyle Pirinç Kavurma): Süzülmüş pirinçleri ekleyin. Kırmadan alttan üste doğru 3-4 dakika kavurun. Başta yumuşak dönen kaşık, pirinçler kavrulup şeffaflaştıkça birbirine tutunup kaşığa hafif ağırlaşarak direnç göstermeye başlayacak ve tıkır tıkır ses çıkaracaktır.',
                    timerMinutes: 4
                },
                {
                    text: '4. Adım (Pişirme ve Göz Göz Olma Sesi): 3 su bardağı sıcak suyu ve 1 buçuk tatlı kaşığı tuzu ekleyip sadece bir kez karıştırın, kapağı kapatın. Kaynama fokurtusunu duyunca ocağı en kısık ateşe alın. 12 dakika pişirin; tencereden gelen fokurtu sesi kesilip sadece ince bir "çıtır-pıtır" yağ sesi kaldığında suyunu tamamen çekmiş demektir.',
                    timerMinutes: 12
                },
                {
                    text: '5. Adım (Demlendirme): Ocağı kapatın, kapağın altına temiz bir kağıt havlu veya bez koyup kapağı kapatın ve 10 dakika hiç açmadan dinlendirin. Tane tane pilavınız hazır!',
                    timerMinutes: 10
                }
            ]
        },
        {
            id: 'anne_usulu_kuru_fasulye',
            title: 'Anne Usulü Lokum Gibi Kuru Fasulye',
            keywords: ['kuru fasulye', 'fasulye', 'salça', 'soğan', 'etli kuru fasulye'],
            ingredients: '2 su bardağı haşlanmış kuru fasulye, 1 adet orta boy kuru soğan, 1 yemek kaşığı domates salçası, 1 tatlı kaşığı biber salçası, 2 yemek kaşığı tereyağı, 3 buçuk su bardağı sıcak su, 1 tatlı kaşığı tuz, yarım çay kaşığı kimyon (gazını alır).',
            steps: [
                {
                    text: '1. Adım (Soğan ve Salça Kokusu): Tencereye 2 yemek kaşığı tereyağını alıp eritin. Küp doğranmış soğanı ekleyip cızırtı sesiyle birlikte 4 dakika yumuşayana kadar kavurun. Ardından 1 yemek kaşığı domates ve 1 tatlı kaşığı biber salçasını ekleyip salçanın ekşi çiğ kokusu gidip tatlı kavruk kokusu çıkana kadar 2 dakika karıştırın.',
                    timerMinutes: 6
                },
                {
                    text: '2. Adım (Fasulye ve Su): 2 su bardağı haşlanmış kuru fasulyeyi ekleyip 1 dakika salçayla harmanlayın. Üzerine 3 buçuk su bardağı sıcak su, 1 tatlı kaşığı tuz ve yarım çay kaşığı kimyon ekleyin.',
                    timerMinutes: 2
                },
                {
                    text: '3. Adım (Özleşme): Tencerenin kapağını kapatın, kaynama sesini duyunca kısık ateşe alın ve suyu koyulaşıp özleşene kadar 25 dakika pişirin. Lokum gibi kuru fasulyeniz hazır!',
                    timerMinutes: 25
                }
            ]
        },
        {
            id: 'tam_kivaminda_menemen',
            title: 'Tam Kıvamında Sulu ve Ekmek Banmalık Menemen',
            keywords: ['menemen', 'yumurta', 'domates', 'biber', 'kahvaltı'],
            ingredients: '3 adet orta boy olgun domates (rendelenmiş veya küp doğranmış), 2 adet yeşil biber, 3 adet yumurta, 2 yemek kaşığı tereyağı veya zeytinyağı, 1 çay kaşığı tuz, yarım çay kaşığı pul biber.',
            steps: [
                {
                    text: '1. Adım (Biber Kokusu Çıkana Kadar): Geniş tavaya 2 yemek kaşığı yağı ve ince doğranmış 2 yeşil biberi soğukken koyup orta ateşi açın (böylece yağ sıçramaz). Biberlerin cızırtısı ve mis gibi köz/biber kokusu yükselene kadar 3 dakika karıştırın.',
                    timerMinutes: 3
                },
                {
                    text: '2. Adım (Domatesin Suyunu Çekmesi): Doğranmış veya rendelenmiş 3 domatesi ve 1 çay kaşığı tuzu ekleyin. Domatesler başta sulu bir fokurtu sesi çıkarır; yaklaşık 6 dakika sonra fokurtu sesi toklaşır ve kaşık tavada iz bırakacak kadar koyulaşır.',
                    timerMinutes: 6
                },
                {
                    text: '3. Adım (Yumurtaları Kırma ve 90 Saniye Kuralı): 3 yumurtayı ayrı bir kaseye kırıp kabuk kaçmadığından emin olduktan sonra tavaya dökün. Kaşığın tersiyle hafifçe karıştırıp sadece 1 buçuk dakika (90 saniye) pişirin ve hemen ocağı kapatın ki menemeni kurutmasın. Ekmek banmalık menemeniniz hazır!',
                    timerMinutes: 2
                }
            ]
        },
        {
            id: 'sulu_patatesli_izmir_kofte',
            title: 'Tencerede veya Fırında Sulu Patatesli İzmir Köfte',
            keywords: ['köfte', 'kıyma', 'patates', 'izmir köfte', 'et'],
            ingredients: '400 gram kıyma, 1 adet rendelenmiş soğan, 3 yemek kaşığı galeta unu veya ufalanmış ekmek içi, 1 diş sarımsak, 1 çay kaşığı kimyon, 1 çay kaşığı karabiber, 1 tatlı kaşığı tuz. Sebzesi için: 3 adet patates, 1 yemek kaşığı salça, 2 su bardağı sıcak su.',
            steps: [
                {
                    text: '1. Adım (Dokunarak Köfte Yoğurma): Derin bir kapta 400 gram kıyma, rendelenmiş soğan, 3 yemek kaşığı galeta unu, tuz ve kimyonu elinizle 6-7 dakika yoğurun. Kıymanın elinize yapışmayı bırakıp oyun hamuru gibi tek parça toparlandığını hissettiğinizde kıvamı tamamdır. Ceviz büyüklüğünde parçalar koparıp avuç içinizde parmak boyunda yuvarlayın.',
                    timerMinutes: 7
                },
                {
                    text: '2. Adım (Geniş Tencerede Dizme): 3 adet patatesi elma dilimi doğrayın. Geniş yayvan bir tencerenin tabanına bir patates bir köfte olacak şekilde yan yana çember halinde dizin.',
                    timerMinutes: 0
                },
                {
                    text: '3. Adım (Salçalı Sos ve Pişirme): 1 yemek kaşığı salçayı 2 su bardağı sıcak su ve 3 yemek kaşığı zeytinyağı ile bir kasede çatal yardımıyla eritip köftelerin üzerine gezdirin. Kapağı kapatıp kısık ateşte patateslerin üzerine çatal batırdığınızda kolayca girene kadar 28 dakika pişirin.',
                    timerMinutes: 28
                }
            ]
        },
        {
            id: 'firinda_soslu_tavuk_patates',
            title: 'Yumuşacık Fırında (veya Tencerede) Soslu Tavuk ve Patates',
            keywords: ['tavuk', 'patates', 'fırında tavuk', 'baget', 'tavuk göğsü'],
            ingredients: '600 gram kuşbaşı veya baget tavuk eti, 3 adet patates, 2 yemek kaşığı yoğurt, 3 yemek kaşığı zeytinyağı, 1 tatlı kaşığı domates salçası, 1 tatlı kaşığı kekik, 1 tatlı kaşığı tuz.',
            steps: [
                {
                    text: '1. Adım (Elinizle Soslama): Derin bir kapta 2 yemek kaşığı yoğurt, 3 yemek kaşığı zeytinyağı, 1 tatlı kaşığı salça, tuz ve kekiği karıştırın. Tavukları ve iri doğranmış patatesleri içine atıp her yerine sos değecek şekilde elinizle harmanlayın.',
                    timerMinutes: 0
                },
                {
                    text: '2. Adım (Pişirme): Malzemeleri fırın tepsisine veya geniş kapaklı bir tencereye yayın. Fırında 200 derecede 35 dakika; tencerede ise yarım su bardağı su ilavesiyle kısık ateşte 30 dakika pişirin. Mis gibi kekik kokusu mutfağı sardığında yemeğiniz hazırdır!',
                    timerMinutes: 30
                }
            ]
        },
        {
            id: 'salcali_soslu_makarna',
            title: 'Süzmeden Tam Ölçülü Salçalı ve Peynirli Demleme Makarna (Yanma Riski Sıfır!)',
            keywords: ['makarna', 'spagetti', 'peynir', 'salçalı makarna', 'burgu makarna'],
            ingredients: 'Yarım paket (250 gram / yaklaşık 3 su bardağı) burgu veya kalem makarna, 1 yemek kaşığı tereyağı, 2 yemek kaşığı sıvı yağ, 1 dolu yemek kaşığı domates salçası, 1 tatlı kaşığı kuru nane veya kekik, 1 tatlı kaşığı tuz, tam 3 su bardağı sıcak su.',
            steps: [
                {
                    text: '1. Adım (Güvenli Demleme Yöntemi - Kaynar Su Süzme Tehlikesi Yok!): Görme engelli aşçılar için kaynar makarna suyunu lavaboda süzmek yerine çok daha lezzetli olan "demleme makarna" yöntemini kullanıyoruz. Tencereye yağları ve 1 yemek kaşığı salçayı koyup kokusu çıkana kadar 2 dakika kavurun.',
                    timerMinutes: 2
                },
                {
                    text: '2. Adım (Tam Ölçü Su ve Makarna): 3 su bardağı kuru makarnayı, 1 tatlı kaşığı tuzu, naneyi ve tam 3 su bardağı sıcak suyu tencereye ekleyin. Karıştırıp kapağını kapatın.',
                    timerMinutes: 0
                },
                {
                    text: '3. Adım (11 Dakika Kısık Ateş): Kaynama sesini duyunca ocağı kısığa alın ve arada bir karıştırarak 11 dakika pişirin. Makarna tüm soslu suyu içine çekip lokum gibi pişecektir; hiç süzmenize gerek kalmadan doğrudan tabağa alabilirsiniz!',
                    timerMinutes: 11
                }
            ]
        },
        {
            id: 'zeytinyagli_taze_fasulye',
            title: 'Susuz Kendi Buharında Pişen Zeytinyağlı Taze Fasulye',
            keywords: ['taze fasulye', 'zeytinyağlı', 'domates', 'fasulye'],
            ingredients: 'Yarım kilo taze fasulye (uçları kırılıp ikiye bölünmüş), 2 adet orta boy kuru soğan, 3 adet olgun domates, yarım çay bardağı zeytinyağı, 1 tatlı kaşığı toz şeker, 1 tatlı kaşığı tuz, yarım su bardağı sıcak su.',
            steps: [
                {
                    text: '1. Adım (Çiğden Kat Kat Dizme): Tencerenin en altına doğranmış soğanları, onun üzerine yıkanmış taze fasulyeleri, en üste ise küp doğranmış domatesleri yayın. Üzerine 1 tatlı kaşığı tuz, 1 tatlı kaşığı şeker, yarım çay bardağı zeytinyağı ve yarım su bardağı su gezdirin.',
                    timerMinutes: 0
                },
                {
                    text: '2. Adım (Kısık Ateşte 35 Dakika): Tencerenin kapağını kapatın, ilk 5 dakika orta ateşte fokurdama sesini duyduktan sonra en kısık ateşe alın ve 35 dakika pişirin. Çatalla kontrol ettiğinizde fasulyeler yumuşacıksa altını kapatıp soğumaya bırakın.',
                    timerMinutes: 35
                }
            ]
        },
        {
            id: 'kabaran_anne_keki',
            title: '3-2-1 Bardak Ölçülü Garantili Kabaran Anne Keki (Cevizli & Tarçınlı)',
            keywords: ['kek', 'tatlı', 'yumurta', 'ceviz', 'tarçın', 'anne keki', 'pasta'],
            ingredients: '3 adet yumurta, 1 su bardağı toz şeker, 1 su bardağı süt, yarım su bardağı sıvı yağ, 2 buçuk su bardağı un, 1 paket kabartma tozu, 1 paket vanilya, 1 tatlı kaşığı tarçın, yarım su bardağı kırılmış ceviz.',
            steps: [
                {
                    text: '1. Adım (Şeker Eriyene Kadar Çırpma): Derin çırpma kabına 3 yumurta ve 1 su bardağı şekeri koyun. Çırpma teli veya mikserle 4 dakika çırpın; kabın dibinde şeker tanelerinin çıtırtı sesi kesilip karışım köpük köpük olduğunda 1 su bardağı süt ve yarım su bardağı sıvı yağı ekleyin.',
                    timerMinutes: 4
                },
                {
                    text: '2. Adım (Un, Tarçın ve Ceviz): 2 buçuk su bardağı unu, 1 paket kabartma tozunu, vanilyayı, 1 tatlı kaşığı tarçını ve cevizi ekleyip 1 dakika daha karıştırın. Tereyağı ile yağlanmış kek kalıbına veya tepsiye dökün.',
                    timerMinutes: 1
                },
                {
                    text: '3. Adım (Kürdan ve Koku Testi): 180 derece fırında 35 dakika pişirin. 30. dakikadan itibaren evi mis gibi vanilya ve tarçın kokusu saracaktır. 35. dakikada kekin ortasına bir kürdan batırıp çıkarın; kürdanı dudağınıza veya parmak ucunuza dokundurduğunuzda ıslak hamur gelmiyorsa kekiniz mükemmel pişmiştir!',
                    timerMinutes: 35
                }
            ]
        },
        {
            id: 'tavsan_kani_cay_ve_turk_kahvesi',
            title: 'Tavşan Kanı Türk Çayı ve Bol Köpüklü Türk Kahvesi Ölçüsü',
            keywords: ['çay', 'kahve', 'türk kahvesi', 'demleme', 'içecek'],
            ingredients: 'Çay için: Her 1 su bardağı sıcak suya 1 tatlı kaşığı kuru çay. Türk Kahvesi için (1 Fincan): 1 kahve fincanı soğuk su, 2 çay kaşığı tepeleme Türk kahvesi, isteğe göre 1 veya 2 çay kaşığı şeker.',
            steps: [
                {
                    text: '1. Adım (Türk Kahvesi Sesli Köpük Takibi): Cezveye her fincan için 1 fincan soğuk su ve 2 çay kaşığı tepeleme kahve koyup ocağı açmadan önce 15 saniye iyice karıştırın. En kısık ateşe koyun ve bir daha karıştırmayın. Yaklaşık 2 buçuk dakika sonra cezvenin kenarlarından hafif bir "fısır-fısır" kabarma sesi duyacaksınız; tam kaynamadan hemen önce ocağı kapatıp fincana yavaşça dökün.',
                    timerMinutes: 3
                },
                {
                    text: '2. Adım (Tavşan Kanı Çay Demleme): Alt çaydanlıkta su kaynadığında, üst demliğe 4 yemek kaşığı kuru çay koyup üzerine 3 su bardağı kaynar suyu yavaşça gezdirin. Altını kısığa alıp 15 dakika demlendirin. Çayınız hazır!',
                    timerMinutes: 15
                }
            ]
        }
    ];

    function populateCookingRecipesSelect() {
        const sel = document.getElementById('cooking-recipe-select');
        if (!sel) return;
        sel.innerHTML = '';
        BLIND_ACCESSIBLE_RECIPES.forEach((rec, idx) => {
            const opt = document.createElement('option');
            opt.value = String(idx);
            opt.textContent = `${idx + 1}. ${rec.title}`;
            sel.appendChild(opt);
        });
        updateCookingGuideUI();
    }

    function updateCookingGuideUI() {
        const rec = BLIND_ACCESSIBLE_RECIPES[state.selectedRecipeIndex] || BLIND_ACCESSIBLE_RECIPES[0];
        if (!rec) return;
        const stepObj = rec.steps[state.currentCookingStepIndex] || rec.steps[0];
        const titleEl = document.getElementById('cooking-recipe-title');
        const stepEl = document.getElementById('cooking-step-text');
        const timerBtn = document.getElementById('btn-cooking-timer');

        if (titleEl) {
            titleEl.textContent = `${rec.title} — ${rec.ingredients}`;
        }
        if (stepEl && stepObj) {
            stepEl.textContent = `(${state.currentCookingStepIndex + 1}/${rec.steps.length}) ${stepObj.text}`;
        }
        if (timerBtn && stepObj && !state.cookingTimerInterval) {
            const mins = stepObj.timerMinutes || 3;
            timerBtn.textContent = `⏱️ Bu Adımın Pişme Süresini Başlat (${mins} Dakika Konuşan Saat)`;
        }
    }

    function selectCookingRecipe(index, speakNow = true) {
        const idx = Math.max(0, Math.min(BLIND_ACCESSIBLE_RECIPES.length - 1, Number(index) || 0));
        state.selectedRecipeIndex = idx;
        state.currentCookingStepIndex = 0;
        const sel = document.getElementById('cooking-recipe-select');
        if (sel) sel.value = String(idx);
        updateCookingGuideUI();
        if (speakNow) {
            const rec = BLIND_ACCESSIBLE_RECIPES[idx];
            announceGuidance(`Seçilen yemek: ${rec.title}. Gerekli malzemeler: ${rec.ingredients} Şimdi 1. adıma başlamak için Bu Adımı Oku düğmesine basabilirsiniz.`, {
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

    function stepCookingInstruction(delta) {
        const rec = BLIND_ACCESSIBLE_RECIPES[state.selectedRecipeIndex] || BLIND_ACCESSIBLE_RECIPES[0];
        if (!rec) return;
        if (delta < 0 && state.currentCookingStepIndex <= 0) {
            announceGuidance(`İlk adımdasınız. ${rec.steps[0].text}`, { force: true });
            return;
        }
        if (delta > 0 && state.currentCookingStepIndex >= rec.steps.length - 1) {
            announceGuidance(`Tebrikler, ${rec.title} tarifinin son adımındasınız! Yemeğiniz hazır, ellerinize sağlık ve afiyet olsun!`, {
                force: true,
                bannerState: 'centered'
            });
            return;
        }
        state.currentCookingStepIndex = Math.max(0, Math.min(rec.steps.length - 1, state.currentCookingStepIndex + delta));
        updateCookingGuideUI();
        const stepObj = rec.steps[state.currentCookingStepIndex];
        const timerHint = stepObj.timerMinutes > 0
            ? ` Bu adımın pişme süresi ${stepObj.timerMinutes} dakikadır; Konuşan Tencere Saatini Başlat düğmesine basarak süreyi başlatabilirsiniz.`
            : '';
        announceGuidance(`${stepObj.text}${timerHint}`, {
            force: true,
            bannerState: 'centered'
        });
    }

    function formatMinutesSecondsTurkish(totalSec) {
        const m = Math.floor(totalSec / 60);
        const s = totalSec % 60;
        if (m > 0 && s > 0) return `${m} dakika ${s} saniye`;
        if (m > 0) return `${m} dakika`;
        return `${s} saniye`;
    }

    function toggleCookingStepTimer() {
        const timerEl = document.getElementById('cooking-timer-display');
        const timerBtn = document.getElementById('btn-cooking-timer');
        const badgeEl = document.getElementById('cooking-status-badge');

        if (state.cookingTimerInterval) {
            clearInterval(state.cookingTimerInterval);
            state.cookingTimerInterval = null;
            state.cookingTimerRemainingSec = 0;
            if (timerEl) timerEl.textContent = 'Sayaç durduruldu';
            if (badgeEl) badgeEl.textContent = 'Mutfak Şefiniz Hazır';
            updateCookingGuideUI();
            announceGuidance('Konuşan tencere ve fırın saati durduruldu.', { force: true });
            return;
        }

        const rec = BLIND_ACCESSIBLE_RECIPES[state.selectedRecipeIndex] || BLIND_ACCESSIBLE_RECIPES[0];
        const stepObj = rec ? rec.steps[state.currentCookingStepIndex] : null;
        const minutes = (stepObj && stepObj.timerMinutes > 0) ? stepObj.timerMinutes : 3;
        state.cookingTimerRemainingSec = minutes * 60;

        if (timerBtn) {
            timerBtn.textContent = '⏹️ Konuşan Tencere Saatini Durdur';
        }
        if (badgeEl) {
            badgeEl.textContent = `⏱️ Pişiyor: ${minutes} dk`;
        }
        if (timerEl) {
            timerEl.textContent = `Kalan Süre: ${formatMinutesSecondsTurkish(state.cookingTimerRemainingSec)}`;
        }
        announceGuidance(`${minutes} dakikalık konuşan tencere saati başlatıldı! Her dakikada kalan süreyi size sesli bildireceğim ve süre bittiğinde alarm çalacağım.`, {
            force: true,
            bannerState: 'centered'
        });

        state.cookingTimerInterval = setInterval(() => {
            state.cookingTimerRemainingSec--;
            if (timerEl) {
                timerEl.textContent = `Kalan Süre: ${formatMinutesSecondsTurkish(Math.max(0, state.cookingTimerRemainingSec))}`;
            }

            if (state.cookingTimerRemainingSec <= 0) {
                clearInterval(state.cookingTimerInterval);
                state.cookingTimerInterval = null;
                radar.playLockedChime();
                if (navigator.vibrate) navigator.vibrate([300, 100, 300, 100, 400]);
                if (timerEl) timerEl.textContent = 'SÜRE DOLDU! Pişme tamamlandı!';
                if (badgeEl) badgeEl.textContent = '✅ Pişme Süresi Doldu!';
                updateCookingGuideUI();
                announceGuidance('DİKKAT SÜRE DOLDU! Tencere veya fırın saatiniz tamamlandı! Lütfen ocağı kontrol edin veya Sonraki Adım düğmesine geçin.', {
                    force: true,
                    bannerState: 'centered'
                });
                return;
            }

            if (state.cookingTimerRemainingSec === 30) {
                announceGuidance('Pişme süresinin bitmesine son 30 saniye kaldı.', { force: true });
            } else if (state.cookingTimerRemainingSec <= 5 && state.cookingTimerRemainingSec > 0) {
                announceGuidance(String(state.cookingTimerRemainingSec), { force: true });
            } else if (state.cookingTimerRemainingSec % 60 === 0) {
                const remMin = Math.round(state.cookingTimerRemainingSec / 60);
                announceGuidance(`Tencere saati bilgisi: Pişmenin tamamlanmasına ${remMin} dakika kaldı.`, { force: true });
            }
        }, 1000);
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
        const words = q.split(/[\s,;.]+/).filter(w => w.length >= 3);
        let bestIdx = -1;
        let bestScore = 0;

        BLIND_ACCESSIBLE_RECIPES.forEach((rec, idx) => {
            const hay = `${rec.title} ${rec.keywords.join(' ')} ${rec.ingredients}`.toLocaleLowerCase('tr-TR');
            let score = 0;
            if (hay.includes(q)) score += 5;
            words.forEach(w => {
                if (hay.includes(w)) score += 2;
            });
            if (score > bestScore) {
                bestScore = score;
                bestIdx = idx;
            }
        });

        if (bestIdx >= 0 && bestScore > 0) {
            selectCookingRecipe(bestIdx, false);
            const rec = BLIND_ACCESSIBLE_RECIPES[bestIdx];
            announceGuidance(`Söylediğiniz malzemelere en uygun yemek bulundu: ${rec.title}! Gerekli malzemeler: ${rec.ingredients} Şimdi 1. adımdan başlıyoruz: ${rec.steps[0].text}`, {
                force: true,
                bannerState: 'centered'
            });
        } else {
            announceGuidance(`"${queryText}" için tam eşleşen bir tarif bulunamadı, ancak listedeki 10 erişilebilir Türk yemeğinden dilediğinizi seçebilirsiniz.`, {
                force: true,
                bannerState: 'warning'
            });
        }
    }

    function speakBlindCookingSafetyTips() {
        const tips = 'Görme Engelli Aşçılar İçin 5 Altın Mutfak Püf Noktası: ' +
            '1: Soğan, sarımsak veya eti asla kızgın yağa atmayın; önce tavaya soğukken koyup ocağı sonra açın, böylece yağ elinize sıçramaz. ' +
            '2: Doğrama yaparken bıçağın ucu tahtadan hiç kalkmasın, sol elinizin parmak uçlarını içeri doğru "pençe" gibi kıvırarak sebzeyi tutun. ' +
            '3: Tencereyi ocağın tam ortasına oturttuğunuzdan emin olmak için ocağı yakmadan önce tencereyi ızgarada hafifçe sağa sola yoklayın ve sapını her zaman içe doğru çevirin ki kolunuz çarpmasın. ' +
            '4: Makarna yaparken kaynar su süzmek yerine tariflerimizdeki bire bir su ölçülü "demleme makarna" yöntemini kullanın. ' +
            '5: Yemeğin pişip pişmediğini anlamak için kameramızı tencereye veya ocağa tutup Ocak Ateşi ve Kızarmışlık Kontrolü düğmesine basabilirsiniz.';
        showDetectedResult('🛡️ Görme Engelli Aşçılar İçin Güvenli Mutfak Rehberi', tips);
        announceGuidance(tips, { force: true, bannerState: 'centered' });
    }

    function analyzeStoveFlameAndFoodBrowning(capCanvas, metrics, cleanText = '') {
        const ctx = capCanvas.getContext('2d');
        const w = capCanvas.width;
        const h = capCanvas.height;
        const img = ctx.getImageData(Math.floor(w * 0.15), Math.floor(h * 0.15), Math.floor(w * 0.7), Math.floor(h * 0.7));
        const d = img.data;

        let blueFlamePixels = 0;
        let orangeFlameGlowPixels = 0;
        let goldenBrownPixels = 0;
        let darkBurntPixels = 0;
        let total = 0;

        for (let i = 0; i < d.length; i += 16) {
            const r = d[i], g = d[i + 1], b = d[i + 2];
            total++;
            // Mavi doğalgaz/ocak alevi (Yüksek mavi/camgöbeği parlaklık)
            if (b > 175 && g > 110 && r < 120 && (b - r) > 65) {
                blueFlamePixels++;
            }
            // Turuncu/kırmızı ateş veya elektrikli ocak koru
            if (r > 215 && g > 85 && g < 185 && b < 70 && (r - b) > 140) {
                orangeFlameGlowPixels++;
            }
            // Altın sarısı / karamelize kızarmış yemek tonu (pilav şehriyesi, kek üstü, köfte, börek)
            if (r >= 135 && r <= 225 && g >= 75 && g <= 165 && b >= 20 && b <= 95 && (r - g) >= 30 && (g - b) >= 25) {
                goldenBrownPixels++;
            }
            // Çok koyu / yanmaya yüz tutmuş yüzey
            if (r < 36 && g < 32 && b < 30) {
                darkBurntPixels++;
            }
        }

        const blueRatio = blueFlamePixels / Math.max(1, total);
        const orangeRatio = orangeFlameGlowPixels / Math.max(1, total);
        const goldenRatio = goldenBrownPixels / Math.max(1, total);
        const burntRatio = darkBurntPixels / Math.max(1, total);

        const hasFlame = blueRatio > 0.008 || orangeRatio > 0.012;
        const flameMsg = hasFlame
            ? (blueRatio >= orangeRatio
                ? 'Ocak Ateşi Kontrolü: Ocak AÇIK, mavi doğalgaz alevi net olarak yanıyor.'
                : 'Ocak Ateşi Kontrolü: Ocak veya fırın rezistansı AÇIK, turuncu-kırmızı ateş/kor algılandı.')
            : 'Ocak Ateşi Kontrolü: Görüntüde açık bir mavi veya turuncu ocak alevi görünmüyor.';

        const colName = (metrics && metrics.centerColor) ? metrics.centerColor.name : 'Normal';
        let donenessMsg = '';
        let isBurntRisk = false;

        if (burntRatio > 0.32 && metrics.avgBrightness > 45) {
            donenessMsg = `DİKKAT YANMA UYARISI: Yemeğin veya tavanın orta kısmında koyu kararma (%${Math.round(burntRatio * 100)}) algılandı! Lütfen hemen ocağı kısın veya karıştırın!`;
            isBurntRisk = true;
        } else if (goldenRatio > 0.18) {
            donenessMsg = `Pişmişlik ve Kızarmışlık: Harika görünüyor! Yiyecek altın sarısı / kızarmış kıvama (%${Math.round(goldenRatio * 100)} karamelize ton, ${colName}) ulaşmış.`;
        } else {
            donenessMsg = `Yüzey ve Renk Durumu: Merkezdeki renk ${colName}. Yiyecek henüz açık renkte / pişme aşamasında, yanık izi yok.`;
        }

        const statusEl = document.getElementById('cooking-doneness-display');
        if (statusEl) {
            statusEl.textContent = `${hasFlame ? '🔥 Ocak Açık' : 'Ocak Alevi Yok'} | ${isBurntRisk ? '⚠️ Kararma/Yanık Riski' : (goldenRatio > 0.18 ? '✅ Altın Sarısı Kızarmış' : colName)}`;
        }

        const speech = `${flameMsg} ${donenessMsg} ${cleanText ? 'Okunan paket/fırın yazısı: ' + cleanText.replace(/\s+/g, ' ') : ''}`.trim();
        return {
            speechText: speech,
            fullText: `${flameMsg}\n${donenessMsg}\n\nOkunan Yazı / Derece:\n${cleanText || 'Yazı yok.'}`,
            isBurntRisk
        };
    }

    function handleCookingGuideLiveMode(anW, anH, scaleX, scaleY, ovCtx, metrics, predictions) {
        const col = metrics.centerColor ? metrics.centerColor.name : 'Bilinmiyor';
        el.tPosition.textContent = `Tencere / Ocak Rengi: ${col}`;
        el.tDistance.textContent = state.cookingTimerInterval
            ? `Sayaç: ${formatMinutesSecondsTurkish(state.cookingTimerRemainingSec)}`
            : 'Aşçı Rehberi Hazır';
    }

    function checkStoveFlameAndFoodDoneness() {
        if (!state.isRunning) {
            announceGuidance('Ocak ateşini ve yemeğin kızarmışlığını kontrol etmek için önce üstteki Kamerayı Başlat düğmesine basın, ardından kamerayı tencereye veya ocağa tutun.', {
                force: true,
                bannerState: 'warning'
            });
            return;
        }
        captureAndDescribePhoto(false);
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
    }

    function setMode(newMode) {
        state.mode = newMode;
        state.countdownStage = 0;
        state.kalmanBox = null;
        state.consensusFrames = 0;
        syncModePanelsVisibility(newMode);
        if (newMode === 'qibla_compass') {
            state.qiblaActive = true;
            radar.init();
            autoAcquireLocationAndWatch();
        } else {
            state.qiblaActive = false;
        }

        el.modeButtons.forEach(btn => {
            const isMatch = btn.getAttribute('data-mode') === newMode;
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
            'explorer': '8. Bölüm: Etrafımda Ne Var ve Evrak Okuyucu açıldı. Odanızdaki eşyaları söyler, çift dokunursanız elinizdeki kağıdı okur.',
            'medicine_skt': '9. Bölüm: İlaç Kutusu ve Son Kullanma Tarihi Kontrolü açıldı. İlacın adını, kaç miligram olduğunu ve tarihinin geçip geçmediğini kontrol etmek için kutuyu kameraya tutun.',
            'signature_pen': '10. Bölüm: İmza Atarken Kalem Yönlendirici açıldı. Evrakı masaya koyup kaleminizi kağıda yaklaştırın; kalemi nereye götüreceğinizi söyleyeceğim.',
            'liquid_level': '11. Bölüm: Bardağa Çay ve Su Doldurma Yardımcısı açıldı. Bardağı kameranın karşısına koyup doldurmaya başlayın; taşmadan önce durmanızı söyleyeceğim.',
            'door_elevator_lcd': '12. Bölüm: Kapı Numarası, Asansör Tuşu ve Makine Ekranı Okuyucu açıldı. Kapı numarasını, asansör tuşlarını veya çamaşır makinesi ekranını okutmak için Boşluk tuşuna basın.',
            'food_freshness': '13. Bölüm: Yiyecek Küflü mü ve Paket İçeriği Okuyucu açıldı. Ekmeği, meyveyi veya market paketini kameraya gösterin.',
            'social_presence': '14. Bölüm: Odada Kim Var ve Bana Bakıyor mu Yardımcısı açıldı. Kulaklık gerekmez; odadakiler duymasın diye karşınızdaki kişi size baktığında telefon avucunuzda çift titrer. Sesli söylemesini isterseniz ekrana çift dokunun veya T tuşuna basın.',
            'song_finder': '15. Bölüm: Bu Çalan Hangi Şarkı? Sesli Şarkı, Melodi ve Söz Bulucu açıldı; mikrofon otomatik olarak dinlemeye başlıyor.',
            'bus_stop_tracker': '16. Bölüm: Otobüs Numarası Yakalayıcı ve İneceğim Durağa Geldim mi Alarmı açıldı. Durakta yaklaşan otobüsün hat numarasını okumak için kamerayı yola tutun veya otobüsteyseniz aşağıdan ineceğiniz durağın alarmını kurun.',
            'pos_iban_reader': '17. Bölüm: POS Cihazı Tutarı Doğrulayıcı ve Tek Tuşla IBAN Kopyalayıcı açıldı. Kartınızı okutmadan önce POS ekranını veya faturadaki TR IBAN numarasını kameraya gösterip Boşluk tuşuna basın.',
            'item_memory': `18. Bölüm: Eşyamı Nereye Koydum Sesli Hafıza ve Kavanoz Tanıtıcı açıldı. Şu an hafızanızda ${state.itemMemories ? state.itemMemories.length : 0} eşya kayıtlı. Eşya Yeri Kaydet veya Eşyam Nerede Sor düğmelerini kullanabilirsiniz.`,
            'tv_subtitle_score': '19. Bölüm: Televizyon Altyazı Okuyucu ve Canlı Maç Skoru Spikeri açıldı. Telefonu televizyona doğru tutun ve Otomatik TV Spikerini Başlat düğmesine basın.',
            'sock_outfit_check': '20. Bölüm: Çorap Eşleştirici, Kıyafet Kombin Uyumu ve Leke Kontrolü açıldı. İki çorabı yan yana kameraya tutup Boşluk tuşuna basın; birbirinin eşi olup olmadığını ve leke durumunu söyleyeceğim.',
            'where_am_i': '21. Bölüm: Tam Olarak Neredeyim? Sokak, Bina, Tabela ve WhatsApp Konum Tarif Edici açıldı. Bulunduğunuz cadde ve sokağı hemen öğreniliyor.',
            'step_calorie_guide': `22. Bölüm: Sesli Adım Sayacı ve Sağlıklı Besin Rehberi açıldı. Bugün ${state.dailySteps || 0} adım attınız. Telefon cebinizde yürürken adımlarınızı sayarım; ayrıca yediğiniz yemeği söyleyip veya paketi kameraya gösterip besin değerini öğrenebilirsiniz.`,
            'cooking_guide': '23. Bölüm: Erişilebilir Yemek Yapma Rehberi ve Konuşan Aşçı açıldı. Tüm yemek tariflerimiz kokuya, cızırtı sesine, tam bardak ölçüsüne ve dakikaya göre hazırlanmıştır. İstediğiniz yemeği seçin veya evdeki malzemeleri söyleyin, adım adım birlikte pişirelim.'
        }[newMode];

        if (modeAnnouncement) {
            announceGuidance(modeAnnouncement, { force: true, bannerState: 'normal' });
        }

        if (newMode === 'where_am_i') {
            setTimeout(() => announceWhereAmIFullAddressAndSignboard('', []), 900);
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
    window.addEventListener('deviceorientationabsolute', (ev) => {
        if (typeof ev.alpha === 'number') {
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
        // SADECE Gerçek Mutlak Manyetik Kuzey (iOS webkitCompassHeading veya absolute === true) kabul edilir!
        if (typeof ev.webkitCompassHeading === 'number') {
            const acc = typeof ev.webkitCompassAccuracy === 'number' ? ev.webkitCompassAccuracy : 10;
            handleCompassHeadingEvent(ev.webkitCompassHeading, acc);
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
        el.photoExplorerCanvas.addEventListener('pointerdown', handlePhotoExplorerPointerEvent);
        el.photoExplorerCanvas.addEventListener('pointermove', (ev) => {
            if (ev.buttons > 0 || ev.pointerType === 'touch') {
                handlePhotoExplorerPointerEvent(ev);
            }
        });
        el.photoExplorerCanvas.addEventListener('touchstart', handlePhotoExplorerPointerEvent, { passive: false });
        el.photoExplorerCanvas.addEventListener('touchmove', handlePhotoExplorerPointerEvent, { passive: false });
    }
    el.btnWhatsappHold.addEventListener('click', startWhatsapp15SecAudioHold);
    el.btnRepeat.addEventListener('click', () => announceGuidance(state.lastSpeechText, { force: true }));

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
    const btnMemoryTagJar = document.getElementById('btn-memory-tag-jar');

    if (btnMemorySaveText && memoryNoteInput) {
        btnMemorySaveText.addEventListener('click', () => saveItemMemoryEntry(memoryNoteInput.value));
    }
    if (btnMemoryVoiceSave) btnMemoryVoiceSave.addEventListener('click', () => startVoiceItemMemoryCapture('save'));
    if (btnMemoryVoiceAsk) btnMemoryVoiceAsk.addEventListener('click', () => startVoiceItemMemoryCapture('ask'));
    if (btnMemorySearchText && memoryNoteInput) {
        btnMemorySearchText.addEventListener('click', () => searchItemMemoryByQuery(memoryNoteInput.value));
    }
    if (btnMemoryReadAll) btnMemoryReadAll.addEventListener('click', speakAllSavedItemMemories);
    if (btnMemoryTagJar) btnMemoryTagJar.addEventListener('click', tagVisibleJarInCamera);

    const btnTvAutoToggle = document.getElementById('btn-tv-auto-toggle');
    const btnTvReadNow = document.getElementById('btn-tv-read-now');
    if (btnTvAutoToggle) btnTvAutoToggle.addEventListener('click', toggleTvAutoSubtitleSpeaker);
    if (btnTvReadNow) btnTvReadNow.addEventListener('click', () => readTvScreenNow(false));

    const btnSockCompare = document.getElementById('btn-sock-compare');
    const btnOutfitStain = document.getElementById('btn-outfit-stain');
    if (btnSockCompare) btnSockCompare.addEventListener('click', () => captureAndDescribePhoto(false));
    if (btnOutfitStain) btnOutfitStain.addEventListener('click', () => captureAndDescribePhoto(false));

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
        btnCalorieVoice.addEventListener('click', () => {
            const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
            if (!SpeechRec) {
                announceGuidance('Lütfen yemeğin adını kutuya yazın.', { force: true });
                return;
            }
            announceGuidance('Şimdi yediğiniz veya merak ettiğiniz yemeğin adını söyleyin, örneğin: Mercimek çorbası veya 1 simit.', { force: true });
            setTimeout(() => {
                try {
                    const rec = new SpeechRec();
                    rec.lang = 'tr-TR';
                    rec.onresult = (ev) => {
                        const t = (ev.results && ev.results[0] && ev.results[0][0]) ? ev.results[0][0].transcript : '';
                        if (t) calculateAndSpeakFoodCalories(t);
                    };
                    rec.start();
                } catch (_) {}
            }, 1500);
        });
    }

    // 23. Erişilebilir Yemek Yapma Rehberi ve Konuşan Aşçı Düğmeleri
    const cookingRecipeSelect = document.getElementById('cooking-recipe-select');
    const cookingIngredientInput = document.getElementById('cooking-ingredient-input');
    const btnCookingFind = document.getElementById('btn-cooking-find');
    const btnCookingVoice = document.getElementById('btn-cooking-voice');
    const btnCookingIngredients = document.getElementById('btn-cooking-ingredients');
    const btnCookingPrev = document.getElementById('btn-cooking-prev');
    const btnCookingCurrent = document.getElementById('btn-cooking-current');
    const btnCookingNext = document.getElementById('btn-cooking-next');
    const btnCookingTimer = document.getElementById('btn-cooking-timer');
    const btnCookingCheckDoneness = document.getElementById('btn-cooking-check-doneness');
    const btnCookingSafetyTips = document.getElementById('btn-cooking-safety-tips');

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
        btnCookingVoice.addEventListener('click', () => {
            const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
            if (!SpeechRec) {
                announceGuidance('Lütfen evdeki malzemeleri veya yemek adını kutuya yazın.', { force: true });
                return;
            }
            announceGuidance('Evde hangi malzemeler var veya hangi yemeği yapmak istiyorsunuz? Şimdi söyleyin, örneğin: Patates ve kıyma var ya da pirinç pilavı.', { force: true });
            setTimeout(() => {
                try {
                    const rec = new SpeechRec();
                    rec.lang = 'tr-TR';
                    rec.onresult = (ev) => {
                        const t = (ev.results && ev.results[0] && ev.results[0][0]) ? ev.results[0][0].transcript : '';
                        if (t) {
                            if (cookingIngredientInput) cookingIngredientInput.value = t;
                            findRecipeByIngredientsOrName(t);
                        }
                    };
                    rec.start();
                } catch (_) {}
            }, 1600);
        });
    }
    if (btnCookingIngredients) btnCookingIngredients.addEventListener('click', speakCookingIngredients);
    if (btnCookingPrev) btnCookingPrev.addEventListener('click', () => stepCookingInstruction(-1));
    if (btnCookingCurrent) btnCookingCurrent.addEventListener('click', () => stepCookingInstruction(0));
    if (btnCookingNext) btnCookingNext.addEventListener('click', () => stepCookingInstruction(1));
    if (btnCookingTimer) btnCookingTimer.addEventListener('click', toggleCookingStepTimer);
    if (btnCookingCheckDoneness) btnCookingCheckDoneness.addEventListener('click', checkStoveFlameAndFoodDoneness);
    if (btnCookingSafetyTips) btnCookingSafetyTips.addEventListener('click', speakBlindCookingSafetyTips);

    el.touchZone.addEventListener('click', () => {
        const now = performance.now();
        if (now - state.lastTouchTime < 420) {
            captureAndDescribePhoto(false);
            state.lastTouchTime = 0;
        } else {
            state.lastTouchTime = now;
        }
    });

    el.btnCopyResult.addEventListener('click', async () => {
        const txt = el.resultText.textContent || '';
        if (txt && navigator.clipboard) {
            await navigator.clipboard.writeText(txt);
            announceGuidance('Rapor panoya kopyalandı.', { force: true });
        }
    });

    el.btnDownloadPhoto.addEventListener('click', () => {
        if (!state.lastCapturedDataUrl) return;
        const a = document.createElement('a');
        a.href = state.lastCapturedDataUrl;
        a.download = `mikyas-kamera-${Date.now()}.jpg`;
        a.click();
        announceGuidance('Fotoğraf cihazınıza indirildi.', { force: true });
    });

    window.addEventListener('keydown', (ev) => {
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
        else if (key === 'p') setMode('social_presence');
        else if (key === 'h') {
            setMode('song_finder');
            toggleSongListening();
        }
        else if (key === 'k') startQiblaCompassSensor();
        else if (key === 'v') speakPrayerTimesAndSolarValidation();
        else if (key === 's') speakCurrentQuestionStem();
        else if (key === 'a') speakSingleOption('A');
        else if (key === 'b') speakSingleOption('B');
        else if (key === 'c') speakSingleOption('C');
        else if (key === 'd') speakSingleOption('D');
        else if (key === 'e') speakSingleOption('E');
        else if (ev.key === 'ArrowLeft') el.btnExamPrev.click();
        else if (ev.key === 'ArrowRight') el.btnExamNext.click();
        else if (key === 'r') el.btnToggleRadar.click();
        else if (key === 'o') el.btnToggleAuto.click();
        else if (key === 'f' && !el.btnToggleFlash.disabled) el.btnToggleFlash.click();
        else if (key === 'w') startWhatsapp15SecAudioHold();
        else if (key === 'm' && el.photoFileInput) el.photoFileInput.click();
        else if (key === 't') el.btnRepeat.click();
        else if (key === 'n') speakHowMuchMoneyIHave();
        else if (key === 'z' || ev.key === '+') addCurrentlyVisibleMoneyManually();
        else if (ev.code === 'Space') {
            ev.preventDefault();
            if (!state.isRunning) startCamera();
            else captureAndDescribePhoto(false);
        }
    });

    window.addEventListener('load', () => {
        loadMoneyLedgerFromStorage();
        loadItemMemoriesFromStorage();
        loadStepCalorieFromStorage();
        populateCookingRecipesSelect();
        syncModePanelsVisibility(state.mode);
        autoAcquireLocationAndWatch();
        updateExamRemoteUI();
        setTimeout(initAiModel, 350);
    });
})();
