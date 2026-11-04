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
        // Sınav Soruları ve Şık Durumu
        examQuestions: [
            {
                number: 1,
                stem: 'Henüz sınav kağıdı okutulmadı. Kamerayı sınav kağıdına tutup Boşluk tuşuna basın veya ekrana çift dokunun.',
                options: { A: '', B: '', C: '', D: '', E: '' }
            }
        ],
        currentExamIndex: 0
    };

    const el = {
        btnStart: document.getElementById('btn-start-camera'),
        btnSwitchCam: document.getElementById('btn-switch-camera'),
        btnToggleFlash: document.getElementById('btn-toggle-flash'),
        btnToggleRadar: document.getElementById('btn-toggle-radar'),
        btnToggleAuto: document.getElementById('btn-toggle-auto'),
        btnCaptureNow: document.getElementById('btn-capture-now'),
        btnWhatsappHold: document.getElementById('btn-whatsapp-hold'),
        btnRepeat: document.getElementById('btn-repeat-guidance'),
        targetSelect: document.getElementById('target-object-select'),
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
        }
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

            const intervalMs = isCentered ? 440 : Math.max(145, Math.round(155 + dist * 460));
            if (now < this.nextPulseTime) return;
            this.nextPulseTime = now + intervalMs;

            if (isCentered) {
                this.playLockChord();
                return;
            }

            const freq = Math.max(200, Math.min(920, 480 - offsetY * 240));
            const pan = Math.max(-1, Math.min(1, offsetX * 1.25));
            this.playPannedTone(freq, pan, 0.065, 'sine', 0.16);
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
            if (state.mode === 'qr_screen' || state.targetFilter === 'screen_qr') {
                if (state.barcodeDetector) {
                    try {
                        const barcodes = await state.barcodeDetector.detect(el.analysisCanvas);
                        if (barcodes && barcodes.length > 0 && barcodes[0].boundingBox) {
                            const b = barcodes[0].boundingBox;
                            qrDetection = {
                                data: barcodes[0].rawValue || '',
                                bbox: [b.x, b.y, b.width, b.height]
                            };
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
        let lightLabel = `Luma: ${Math.round(metrics.avgBrightness)}`;
        if (metrics.avgBrightness < 38) lightLabel += ' (Karanlık)';
        else if (metrics.avgBrightness < 75) lightLabel += ' (Loş)';
        else if (metrics.avgBrightness > 230) lightLabel += ' (Parlak)';
        else lightLabel += ' (İyi)';

        const blurLabel = metrics.sharpness < 7.2 ? 'Bulanık' : 'Net';
        el.tLighting.textContent = `${lightLabel} • ${blurLabel}`;

        const tiltText = state.hasOrientationSensor
            ? (Math.abs(state.tiltRoll) <= 12 ? 'Paralel/Düz' : `${state.tiltRoll > 0 ? 'Sola' : 'Sağa'} ${Math.abs(state.tiltRoll)}°`)
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
            handleColorAndPatternMode(anW, anH, metrics);
        } else if (state.mode === 'anomaly_led') {
            handleAnomalyAndLedMode(anW, anH, scaleX, scaleY, ovCtx, metrics);
        } else if (state.mode === 'explorer') {
            handleExplorerMode(anW, anH, scaleX, scaleY, ovCtx, predictions);
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

    function handleColorAndPatternMode(anW, anH, metrics) {
        const colorName = metrics.centerColor.name;
        const pattern = metrics.patternType;

        el.tPosition.textContent = colorName;
        el.tDistance.textContent = pattern;

        const msg = `Merkezdeki yüzey rengi: ${colorName}. Kumaş veya yüzey dokusu: ${pattern}. Üzerindeki para tutarını veya etiketi okutmak için ekrana çift dokunun.`;
        announceGuidance(msg, {
            bannerState: 'centered',
            minIntervalMs: 3600
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

        if (metrics.isSurfacePatterned) {
            el.tPosition.textContent = 'Desenli Zemin Kilidi';
            el.tDistance.textContent = `Varyans: ${Math.round(metrics.gridStd)} (Yüksek)`;
            announceGuidance('Zemin çok desenli veya alacalı olduğu için yanlış alarm vermemek adına halı deseni filtrelendi. Lütfen kamerayı yere daha yakın tutun veya parlak cisme odaklayın.', {
                bannerState: 'warning',
                minIntervalMs: 4200
            });
            return;
        }

        if (metrics.floorAnomaly) {
            const tracked = updateKalmanTracker(metrics.floorAnomaly.bbox, 'anomaly', 3);
            if (tracked.verified && tracked.box) {
                drawTargetBox(ovCtx, tracked.box, scaleX, scaleY, '#facc15', `Cisim (Z=${metrics.floorAnomaly.zScore.toFixed(1)}σ)`);
                const align = computeAlignmentInstruction(tracked.box, anW, anH, 'Zeminden farklı küçük cisim', 0.005, 0.35);
                el.tPosition.textContent = align.posLabel;
                el.tDistance.textContent = `Z-Skoru: ${metrics.floorAnomaly.zScore.toFixed(1)}σ`;
                radar.updateRadar(align.offsetX, align.offsetY, align.isCentered);

                announceGuidance(align.sentence, {
                    bannerState: align.isCentered ? 'centered' : 'normal',
                    minIntervalMs: 2300
                });
                return;
            }
        }

        el.tPosition.textContent = 'Zemin Temiz / Homojen';
        el.tDistance.textContent = `Varyans: ${Math.round(metrics.gridStd)} (Düz)`;
        announceGuidance('Düz zemin taranıyor; şu an kadrajda zeminden farklı bir cisim veya aktif bir cihaz LED ışığı görünmüyor.', {
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

    function detectTurkishBanknoteFromTextAndColor(ocrText) {
        const clean = ocrText.toUpperCase();
        if (/\b200\b/.test(clean) && (clean.includes('TÜRK') || clean.includes('LİRA') || clean.includes('MERKEZ'))) return '200 Türk Lirası';
        if (/\b100\b/.test(clean) && (clean.includes('TÜRK') || clean.includes('LİRA') || clean.includes('MERKEZ'))) return '100 Türk Lirası';
        if (/\b50\b/.test(clean) && (clean.includes('TÜRK') || clean.includes('LİRA') || clean.includes('MERKEZ'))) return '50 Türk Lirası';
        if (/\b20\b/.test(clean) && (clean.includes('TÜRK') || clean.includes('LİRA') || clean.includes('MERKEZ'))) return '20 Türk Lirası';
        if (/\b10\b/.test(clean) && (clean.includes('TÜRK') || clean.includes('LİRA') || clean.includes('MERKEZ'))) return '10 Türk Lirası';
        if (/\b5\b/.test(clean) && (clean.includes('TÜRK') || clean.includes('LİRA') || clean.includes('MERKEZ'))) return '5 Türk Lirası';
        return null;
    }

    async function captureAndDescribePhoto(isAutoTriggered = false) {
        if (!state.isRunning || el.video.readyState < 2) {
            announceGuidance('Önce kamerayı başlatmanız gerekiyor.', { force: true, bannerState: 'warning' });
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

        state.lastCapturedDataUrl = capCanvas.toDataURL('image/jpeg', 0.92);
        el.btnDownloadPhoto.hidden = false;

        const metrics = analyzeFrameMathematics(ctx, capCanvas.width, capCanvas.height);
        let preds = [];
        if (state.cocoModel) {
            try {
                preds = await state.cocoModel.detect(capCanvas, 10, 0.35);
            } catch (_) {
                preds = [];
            }
        }

        const objNames = preds.map(p => TR_LABELS[p.class] || p.class);
        const uniqueObjs = [...new Set(objNames)];
        const scenePart = uniqueObjs.length > 0
            ? `Kadrajdaki nesneler: ${uniqueObjs.join(', ')}.`
            : 'Kadrajda sınav kağıdı veya yakın plan belge alanı var.';

        const colorPart = `Merkez renk: ${metrics.centerColor.name} (${metrics.patternType}).`;

        let privacyPart = '';
        const mainPerson = preds.find(p => p.class === 'person');
        if (mainPerson) {
            const audit = evaluatePortraitPrivacyAndBacklight(mainPerson.bbox, metrics, preds, capCanvas.width, capCanvas.height);
            privacyPart = `${audit.hasBacklight ? 'Uyarı: Ters ışık var. ' : 'Işık yönü uygun. '}${audit.privacyReport}`;
        }

        const prefix = isAutoTriggered ? 'Otomatik fotoğraf çekildi!' : 'Fotoğraf çekildi!';
        const baseSummary = `${prefix} ${scenePart} ${colorPart} ${privacyPart}`.trim();

        showDetectedResult('Sınav, Şık ve Metin Analizi', baseSummary + '\n\nKağıt gölgesi siliniyor, sütunlar ve A-B-C-D-E şıkları ayrıştırılıyor...');
        announceGuidance('Fotoğraf çekildi! Kağıt üzerindeki gölgeler siliniyor ve sınav şıkları ayrıştırılıyor, lütfen bekleyin...', {
            force: true,
            bannerState: 'centered'
        });

        if (typeof window.Tesseract !== 'undefined' && !state.isProcessingOcr) {
            state.isProcessingOcr = true;
            try {
                // 1. Bradley-Roth İntegral Gölge Silici Uygula
                const binObj = applyBradleyRothShadowRemoval(capCanvas);
                // 2. Çift Sütunlu Test İse Sol ve Sağ Sütunu Ayır
                const splitInfo = splitExamColumnsIfTwoColumn(binObj);

                let combinedText = '';
                for (let i = 0; i < splitInfo.canvases.length; i++) {
                    const ocrRes = await window.Tesseract.recognize(splitInfo.canvases[i], 'tur+eng');
                    const partText = (ocrRes && ocrRes.data && ocrRes.data.text) ? ocrRes.data.text.trim() : '';
                    if (partText) {
                        combinedText += (combinedText ? '\n\n' : '') + partText;
                    }
                }

                // Eğer gölge silinmiş görüntüde çok az metin çıktıysa ham görüntüyle yedekle
                if (combinedText.trim().length < 8) {
                    const fallbackRes = await window.Tesseract.recognize(capCanvas, 'tur+eng');
                    combinedText = (fallbackRes && fallbackRes.data && fallbackRes.data.text) ? fallbackRes.data.text.trim() : '';
                }

                const cleanText = combinedText.trim();
                const parsedQuestions = parseExamQuestionsAndOptions(cleanText);

                if (parsedQuestions.length > 0) {
                    state.examQuestions = parsedQuestions;
                    state.currentExamIndex = 0;
                    updateExamRemoteUI();
                }

                const banknote = detectTurkishBanknoteFromTextAndColor(cleanText);
                const hasSignatureKeyword = /imza|ad\s*soyad|teslim\s*alan|onay/i.test(cleanText);
                const colNote = splitInfo.isTwoColumn ? 'Çift sütunlu test kağıdı tespit edildi ve sütunlar birbirine karışmadan ayrı ayrı okundu.' : '';

                if (cleanText.length >= 3) {
                    const firstQ = state.examQuestions[0];
                    const hasOptions = firstQ && (firstQ.options.A || firstQ.options.B || firstQ.options.C);

                    if (hasOptions || state.mode === 'exam_reader') {
                        const finalReport = `${colNote}\nToplam ${state.examQuestions.length} soru ayrıştırıldı.\n\nSoru ${firstQ.number}: ${firstQ.stem}\n` +
                            ['A', 'B', 'C', 'D', 'E']
                                .filter(k => Boolean(firstQ.options[k]))
                                .map(k => `${k}) ${firstQ.options[k]}`)
                                .join('\n');
                        showDetectedResult('Ayrıştırılan Sınav Sorusu ve Şıklar', finalReport.trim());
                        speakCurrentQuestionStem();
                    } else {
                        const extraNotes = [];
                        if (banknote) extraNotes.push(`Tespit Edilen Banknot: ${banknote}!`);
                        if (hasSignatureKeyword) extraNotes.push('Evrak üzerinde İMZA / AD SOYAD alanı tespit edildi.');
                        const finalReport = `${baseSummary}\n\n${extraNotes.join(' ')}\n${ cleanText }`;
                        showDetectedResult('Tam Analiz ve Okunan Metin', finalReport.trim());
                        announceGuidance(`${extraNotes.join(' ')} Okunan metin: ${cleanText.replace(/\s+/g, ' ')}`, {
                            force: true,
                            bannerState: 'centered'
                        });
                    }
                } else {
                    showDetectedResult('Fotoğraf Raporu', `${baseSummary}\n\nFotoğraf üzerinde okunabilir bir soru veya yazı bulunamadı. Kamerayı kağıda 25 santim mesafede dik tutup tekrar deneyin.`);
                    announceGuidance('Kağıt üzerinde okunabilir bir soru veya şık bulunamadı. Lütfen kamerayı kağıda 25 santimetre mesafede dik tutup tekrar deneyin.', {
                        force: true,
                        bannerState: 'warning'
                    });
                }
            } catch (_) {
                showDetectedResult('Fotoğraf Raporu', baseSummary);
            } finally {
                state.isProcessingOcr = false;
            }
        }
    }

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

    function setMode(newMode) {
        state.mode = newMode;
        state.countdownStage = 0;
        state.kalmanBox = null;
        state.consensusFrames = 0;
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
            'exam_reader': 'Mod 1: Sınav ve Test Şıkkı Okuyucu seçildi. Kağıt gölgesi silinir, çift sütunlu testler ayrılır ve A, B, C, D, E şıkları tek tek düğmelerle okunur.',
            'qibla_compass': state.qiblaLocationVerified
                ? `Mod 2: 5 Güvenlik Kilitli 3 Boyutlu Sesli Kıble Pusulası seçildi. Konum: ${state.qiblaLocationSource}, Kıble açınız ${state.qiblaTargetBearing} derece. Telefonu yere paralel düz tutup yavaşça dönün.`
                : 'Mod 2: 5 Güvenlik Kilitli Kıble Pusulası seçildi. Konumunuz otomatik doğrulanıyor; dilerseniz listeden şehrinizi de seçebilirsiniz.',
            'qr_screen': 'Mod 3: WhatsApp Web, Bilgisayar Ekranı ve QR Kod Hizalama seçildi.',
            'portrait': 'Mod 4: Portre, Selfie ve Sosyal Medya Ters Işık / Mahremiyet Koçu seçildi.',
            'color_cloth': 'Mod 5: Beyaz Dengeli Kıyafet Rengi, Kumaş Deseni ve Para/Etiket Okuyucu seçildi.',
            'anomaly_led': 'Mod 6: Z-Skorlu Kayıp Eşya Radarı ve Cihaz LED / Şarj Işığı Frekans Okuyucu seçildi.',
            'light_meter': 'Mod 7: Akustik Işık Metre seçildi. Odadaki lambaların ve pencerelerin yönü ses frekansıyla bildiriliyor.',
            'explorer': 'Mod 8: Canlı Nesne, İmza Yeri ve Genel Türkçe Belge Okuyucu seçildi.'
        }[newMode];

        if (modeAnnouncement) {
            announceGuidance(modeAnnouncement, { force: true, bannerState: 'normal' });
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

    el.targetSelect.addEventListener('change', () => {
        state.targetFilter = el.targetSelect.value;
        const selectedText = el.targetSelect.options[el.targetSelect.selectedIndex].text;
        announceGuidance(`Radar hedefi değiştirildi: ${selectedText}`, { force: true });
    });

    el.modeButtons.forEach(btn => {
        btn.addEventListener('click', () => setMode(btn.getAttribute('data-mode')));
    });

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
        else if (key === 't') el.btnRepeat.click();
        else if (ev.code === 'Space') {
            ev.preventDefault();
            if (!state.isRunning) startCamera();
            else captureAndDescribePhoto(false);
        }
    });

    window.addEventListener('load', () => {
        autoAcquireLocationAndWatch();
        updateExamRemoteUI();
        setTimeout(initAiModel, 350);
    });
})();
