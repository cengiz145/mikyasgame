/**
 * Mikyas Studio — Erişilebilir Kamera, QR ve Hassas Sensör Asistanı (v2.0 Matematiksel Motor)
 * - Çoklu Kare Doğrulaması (Multi-Frame Consensus) ve EMA/Kalman El Titremesi Filtresi
 * - Von Kries Beyaz Dengesi + CIELAB (ΔE) Renk Uzayı + Sobel Kumaş Desen Analizörü
 * - Michelson Ters Işık (Silüet) Formülü + Kadraj Kesikliği + Sosyal Medya Mahremiyet Denetçisi
 * - Z-Skorlu (3.5σ) Zemin Kayıp Eşya Radarı (Desenli Halı Kilidi İle) + LED Frekans (Hz) Okuyucu
 * - Akustik Işık Metre (180Hz-980Hz) + Donanım Flaşı / Retina Ekran Flaşı + WhatsApp 15sn Ses Kilidi
 */
(function () {
    'use strict';

    // COCO-SSD 80 Nesne Sınıfının Türkçe Karşılıkları
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
        'book': 'Kitap / Evrak',
        'clock': 'Saat',
        'vase': 'Vazo',
        'scissors': 'Makas',
        'teddy bear': 'Oyuncak',
        'hair drier': 'Saç Kurutma Makinesi',
        'toothbrush': 'Diş Fırçası'
    };

    // Kalibre Edilmiş CIELAB (L*, a*, b*) Türkçe Renk Referans Tablosu
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

    // Uygulama Durumu
    const state = {
        isRunning: false,
        facingMode: 'environment',
        mode: 'qr_screen', // 'qr_screen' | 'portrait' | 'color_cloth' | 'anomaly_led' | 'light_meter' | 'explorer'
        targetFilter: 'auto',
        radarEnabled: true,
        autoCaptureEnabled: true,
        flashMode: 'auto', // 'auto' | 'on' | 'off'
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
        // Kalman / EMA ve Çoklu Kare Doğrulama Durumu
        kalmanBox: null,       // [x, y, w, h]
        kalmanClass: '',
        consensusFrames: 0,
        missedFrames: 0,
        // LED Frekans (Hz) Zaman Serisi Tamponu (Son 45 kare)
        ledHistory: [],
        // WhatsApp 15sn Arka Plan Ses Kilidi
        whatsappHoldTimer: null,
        whatsappHoldEnd: 0
    };

    // DOM Referansları
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
        srPolite: document.getElementById('sr-live-polite')
    };

    // =========================================================================
    // 1. MATEMATİKSEL RENK UZAYI (sRGB -> XYZ -> CIELAB ΔE) VE VON KRIES BEYAZ DENGESİ
    // =========================================================================
    function rgbToLab(r, g, b) {
        let rn = r / 255;
        let gn = g / 255;
        let bn = b / 255;

        rn = rn > 0.04045 ? Math.pow((rn + 0.055) / 1.055, 2.4) : rn / 12.92;
        gn = gn > 0.04045 ? Math.pow((gn + 0.055) / 1.055, 2.4) : gn / 12.92;
        bn = bn > 0.04045 ? Math.pow((bn + 0.055) / 1.055, 2.4) : bn / 12.92;

        // D65 Referans Beyazına Göre XYZ
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

    // =========================================================================
    // 2. KALMAN / ÜSTEL HAREKETLİ ORTALAMA (EMA) VE ÇOKLU KARE DOĞRULAYICI
    // =========================================================================
    /**
     * Tek karelik kamera gürültüsünü (false-positive) eler ve el titremesini
     * X̂_t = α·X_t + (1-α)·X̂_{t-1} formülüyle yumuşatır.
     */
    function updateKalmanTracker(rawBox, rawClass, requiredConsensus = 3) {
        const alpha = 0.30; // Yumuşatma katsayısı
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
    // 3. 3D WEB AUDIO NİŞANGÂH RADARI VE AKUSTİK IŞIK METRE
    // =========================================================================
    class AudioRadarEngine {
        constructor() {
            this.ctx = null;
            this.nextPulseTime = 0;
        }

        init() {
            if (!this.ctx) {
                const AudioCtx = window.AudioContext || window.webkitAudioContext;
                if (AudioCtx) {
                    this.ctx = new AudioCtx();
                }
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

        /**
         * Mod 5: Akustik Işık Metre — Parlaklığı (0..255) 180Hz..980Hz frekansa dönüştürür
         */
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

    // =========================================================================
    // 4. TÜRKÇE SESLİ REHBER (TTS + EKRAN OKUYUCU ARIA LIVE)
    // =========================================================================
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
    // 5. DERİN MATEMATİKSEL KARE ANALİZÖRÜ (BEYAZ DENGESİ, Z-SKOR, SOBEL, LED)
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

        // En parlak ışık kaynağı (Pencere / Lamba / LED) takibi
        let maxLum = 0, maxLumX = width / 2, maxLumY = height / 2;

        for (let gy = 0; gy < gh; gy++) {
            const y = gy * step;
            for (let gx = 0; gx < gw; gx++) {
                const x = gx * step;
                const idx = (y * width + x) * 4;
                const r = data[idx];
                const g = data[idx + 1];
                const b = data[idx + 2];
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

        // 1. VON KRIES / GRAY-WORLD BEYAZ DENGESİ KATSAYILARI (Sarı Işık Sapmasını Giderir)
        const grayRef = (avgR + avgG + avgB) / 3;
        const wbGainR = avgR > 15 ? Math.min(1.6, Math.max(0.65, grayRef / avgR)) : 1;
        const wbGainG = avgG > 15 ? Math.min(1.6, Math.max(0.65, grayRef / avgG)) : 1;
        const wbGainB = avgB > 15 ? Math.min(1.6, Math.max(0.65, grayRef / avgB)) : 1;

        // 2. MERKEZ BÖLGE (Kıyafet / Eşya) RENK VE SOBEL DESEN ANALİZİ
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

        // 3. LAPLACIAN KESKİNLİK VE PARLAK EKRAN KÜMESİ
        let edgeEnergy = 0;
        let brightWeightSum = 0, brightXSum = 0, brightYSum = 0;
        let minBX = width, maxBX = 0, minBY = height, maxBY = 0;
        const brightThreshold = Math.max(145, Math.min(220, avgBrightness + contrast * 0.65));

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
        if (brightWeightSum > 1800 && maxBX > minBX && maxBY > minBY) {
            const bw = maxBX - minBX;
            const bh = maxBY - minBY;
            const areaRatio = (bw * bh) / (width * height);
            const aspect = bw / Math.max(1, bh);
            if (areaRatio > 0.04 && areaRatio < 0.92 && aspect >= 0.4 && aspect <= 2.6) {
                brightCluster = {
                    cx: brightXSum / brightWeightSum,
                    cy: brightYSum / brightWeightSum,
                    bbox: [minBX, minBY, bw, bh],
                    areaRatio
                };
            }
        }

        // 4. 8x8 HÜCRELİ Z-SKOR (3.5σ) ZEMİN ANOMALİ VE KAYIP EŞYA ANALİZİ
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

        // Desenli halı kilidi: Eğer gridStd > 36 veya çok sayıda hücre aynı anda yüksekse zemin alacalıdır
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

        // 5. NOKTA KAYNAK LED IŞIĞI VE YANIP SÖNME (Hz) ANALİZİ
        let ledSource = null;
        if (maxLum >= 238 && avgBrightness < 165) {
            const pIdx = (Math.floor(maxLumY) * width + Math.floor(maxLumX)) * 4;
            // Çekirdeğin 12 piksel çevresindeki halkanın rengi ve parlaklığı
            let ringR = 0, ringG = 0, ringB = 0, ringLum = 0, rCnt = 0;
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
                    ringLum += 0.299 * data[rIdx] + 0.587 * data[rIdx + 1] + 0.114 * data[rIdx + 2];
                    rCnt++;
                }
            }
            ringR /= Math.max(1, rCnt);
            ringG /= Math.max(1, rCnt);
            ringB /= Math.max(1, rCnt);
            ringLum /= Math.max(1, rCnt);

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

        // LED Zaman Serisi (Yanıp Sönme Frekansı Hesabı)
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

    // =========================================================================
    // 6. MICHELSON TERS IŞIK (SİLÜET) VE SOSYAL MEDYA MAHREMİYET FORMÜLÜ
    // =========================================================================
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

        // Kadrajdan Baş / Çene / Omuz Kesilme Geometrisi
        const clippedParts = [];
        if (by <= frameH * 0.025) clippedParts.push('başın üst kısmı');
        if (by + bh >= frameH * 0.98 && bh < frameH * 0.85) clippedParts.push('alt/çene kısmı');
        if (bx <= frameW * 0.02) clippedParts.push('sol omuz');
        if (bx + bw >= frameW * 0.98) clippedParts.push('sağ omuz');

        // Arka Planda Yabancı Ekran / Kişi / Dağınıklık Denetimi
        const bgObjects = [];
        let extraPeople = 0;
        allPredictions.forEach(p => {
            if (p.bbox === personBox) return;
            if (p.class === 'person') {
                extraPeople++;
            } else {
                bgObjects.push(TR_LABELS[p.class] || p.class);
            }
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

    // =========================================================================
    // 7. HİZALAMA CÜMLESİ ÜRETİCİ
    // =========================================================================
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
            moveParts.push(offsetX > 0.45 ? 'sağa doğru çevirin' : 'biraz sağa kaydırın');
        }

        if (offsetY < -0.20 || (touchesTop && !touchesBottom)) {
            moveParts.push(offsetY < -0.45 ? 'yukarı kaldırın (şu an aşağıya tutuyorsunuz)' : 'biraz yukarı kaldırın');
        } else if (offsetY > 0.20 || (touchesBottom && !touchesTop)) {
            moveParts.push(offsetY > 0.45 ? 'aşağı indirin (şu an ekranın üstüne tutuyorsunuz)' : 'biraz aşağı indirin');
        }

        let distanceAdvice = '';
        let distanceStatus = 'İdeal (%' + Math.round(areaRatio * 100) + ')';
        if (areaRatio < idealMinArea) {
            distanceAdvice = 'Biraz daha yaklaşın';
            distanceStatus = 'Uzak (%' + Math.round(areaRatio * 100) + ')';
        } else if (areaRatio > idealMaxArea || (touchesLeft && touchesRight) || (touchesTop && touchesBottom)) {
            distanceAdvice = 'Çok yakınsınız, telefonu biraz geri çekin';
            distanceStatus = 'Çok Yakın (%' + Math.round(areaRatio * 100) + ')';
        }

        const isCentered = moveParts.length === 0 && !distanceAdvice;

        let sentence = '';
        if (isCentered) {
            sentence = `${labelTr} tam ortalandı! Lütfen telefonu sabit tutun.`;
        } else {
            const parts = [];
            if (moveParts.length > 0) {
                parts.push(`Telefonu ${moveParts.join(' ve ')}`);
            }
            if (distanceAdvice) {
                parts.push(distanceAdvice);
            }
            sentence = `${labelTr} doğrulandı: ${parts.join('. ')}.`;
        }

        const posLabel = isCentered
            ? 'Tam Merkezde (Doğrulandı)'
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
    // 8. GERÇEK ZAMANLI VİZÖR DÖNGÜSÜ
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

            // 1. Derin Matematiksel Kare Analizi
            const metrics = analyzeFrameMathematics(anCtx, anW, anH);
            updateTelemetryUI(metrics);

            // 2. Çift Motorlu QR ve Barkod Taraması (Yerleşik BarcodeDetector + jsQR)
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

            // 3. COCO-SSD Nesne Tespiti
            let predictions = [];
            if (state.cocoModel && state.mode !== 'light_meter') {
                try {
                    predictions = await state.cocoModel.detect(el.analysisCanvas, 8, 0.40);
                } catch (_) {
                    predictions = [];
                }
            }

            // 4. Seçili Moda Göre Matematiksel Yönlendirme
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
            ? (Math.abs(state.tiltRoll) <= 14 ? 'Düz' : `${state.tiltRoll > 0 ? 'Sola' : 'Sağa'} ${Math.abs(state.tiltRoll)}°`)
            : 'Düz';
        el.tColorTilt.textContent = `${metrics.centerColor.name} • ${tiltText}`;
    }

    function handleModeDispatch(anW, anH, vw, vh, metrics, qrDetection, predictions) {
        const ovCtx = el.overlayCanvas.getContext('2d');
        ovCtx.clearRect(0, 0, vw, vh);
        const scaleX = vw / anW;
        const scaleY = vh / anH;

        drawCrosshair(ovCtx, vw, vh);

        // Mod 5: Akustik Işık Metre (Karanlıkta da çalışmalıdır)
        if (state.mode === 'light_meter') {
            handleLightMeterMode(anW, anH, metrics);
            return;
        }

        // Otomatik Donanım Flaşı (Karanlıkta ve Otomatik Flaş açıksa)
        if (metrics.avgBrightness < 32 && state.flashMode === 'auto') {
            tryEnableHardwareTorch(true);
        }

        // Karanlık Ortam Kilidi (LED modu hariç)
        if (metrics.avgBrightness < 30 && state.mode !== 'anomaly_led') {
            el.tPosition.textContent = 'Ortam Karanlık';
            el.tDistance.textContent = 'Işık Yetersiz';
            announceGuidance('Ortam çok karanlık, lütfen ışığı veya flaş düğmesini açın.', {
                bannerState: 'warning',
                minIntervalMs: 4000
            });
            return;
        }

        // Özel Hedef Filtresi Seçiliyse
        if (state.targetFilter !== 'auto' && state.targetFilter !== 'screen_qr') {
            guideToSpecificObject(state.targetFilter, anW, anH, scaleX, scaleY, ovCtx, predictions);
            return;
        }

        if (state.mode === 'qr_screen' || state.targetFilter === 'screen_qr') {
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
    // MOD 1: WHATSAPP WEB / EKRAN & QR HİZALAMA (KALMAN DOĞRULAMALI)
    // -------------------------------------------------------------------------
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

    // -------------------------------------------------------------------------
    // MOD 2: PORTRE, SELFIE & SOSYAL MEDYA MAHREMİYET / TERS IŞIK KOÇU
    // -------------------------------------------------------------------------
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

        // 1. Önce Ters Işık (Silüet) Kontrolü
        if (audit.hasBacklight) {
            state.countdownStage = 0;
            announceGuidance('Ters ışık uyarısı: Arkanızda güçlü ışık var, yüzünüz karanlık silüet çıkıyor. Lütfen ışığı veya pencereyi karşınıza alın.', {
                bannerState: 'warning',
                minIntervalMs: 3200
            });
            return;
        }

        // 2. Kadrajdan Baş / Omuz Kesilme Kontrolü
        if (audit.clippedParts.length > 0 && !align.isCentered) {
            state.countdownStage = 0;
            announceGuidance(`Dikkat: Kadrajda ${audit.clippedParts.join(' ve ')} sınırda kesiliyor. ${align.sentence}`, {
                bannerState: 'warning',
                minIntervalMs: 2600
            });
            return;
        }

        // 3. Tam Ortalandıysa Mahremiyet Özeti + 3-2-1 Otomatik Çekim
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

    function handleAutoCaptureCountdown(privacyNote = '') {
        const now = performance.now();
        if (state.countdownStage === 0) {
            state.countdownStage = 3;
            state.lastCountdownTick = now;
            announceGuidance(`Tam ortalandı! ${privacyNote} Sabit tutun: 3`, { force: true, bannerState: 'centered' });
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

    // -------------------------------------------------------------------------
    // MOD 3: VON KRIES BEYAZ DENGELİ KIYAFET RENGİ, DESEN VE BANKNOT MODU
    // -------------------------------------------------------------------------
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

    // -------------------------------------------------------------------------
    // MOD 4: Z-SKORLU (3.5σ) KAYIP EŞYA RADARI VE LED FREKANS (Hz) OKUYUCU
    // -------------------------------------------------------------------------
    function handleAnomalyAndLedMode(anW, anH, scaleX, scaleY, ovCtx, metrics) {
        // 1. Öncelik: Parlak Nokta Kaynaklı Cihaz LED Işığı Varsa
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

        // 2. Zemin Alacalı / Desenli Halı İse Yanlış Alarmı Kesin Olarak Kilitle
        if (metrics.isSurfacePatterned) {
            el.tPosition.textContent = 'Desenli Zemin Kilidi';
            el.tDistance.textContent = `Varyans: ${Math.round(metrics.gridStd)} (Yüksek)`;
            announceGuidance('Zemin çok desenli veya alacalı olduğu için yanlış alarm vermemek adına halı deseni filtrelendi. Lütfen kamerayı yere daha yakın tutun veya parlak cisme odaklayın.', {
                bannerState: 'warning',
                minIntervalMs: 4200
            });
            return;
        }

        // 3. Düz Zeminde 3.25σ Üzeri Tekil Küçük Eşya Anomalisi
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

    // -------------------------------------------------------------------------
    // MOD 5: AKUSTİK IŞIK METRE (ODA LAMBALARI VE PENCERE PUSULASI)
    // -------------------------------------------------------------------------
    function handleLightMeterMode(anW, anH, metrics) {
        const lum = Math.round(metrics.avgBrightness);
        const hotOffsetX = (metrics.maxLumX - anW / 2) / (anW / 2);

        radar.playLightMeterTone(lum, hotOffsetX);

        let stateDesc = '';
        if (lum < 18) {
            stateDesc = 'Oda zifiri karanlık, tüm lambalar kapalı.';
        } else if (lum < 55) {
            stateDesc = 'Ortam loş; sadece küçük bir gece lambası veya ekran ışığı var.';
        } else if (lum < 145) {
            stateDesc = 'Oda aydınlık, lamba açık veya gündüz ışığı alıyor.';
        } else {
            stateDesc = 'Çok güçlü ışık kaynağı! Kameranız doğrudan açık bir lambaya veya pencereye bakıyor.';
        }

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

    // -------------------------------------------------------------------------
    // MOD 6: CANLI NESNE, İMZA ALANI VE BELGE TARAYICI
    // -------------------------------------------------------------------------
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
    // 9. FOTOĞRAF ÇEKİMİ, RETINA FLAŞ, MAHREMİYET DENETİMİ VE TÜRKÇE OCR / PARA TANIMA
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

    function detectTurkishBanknoteFromTextAndColor(ocrText, colorName) {
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
            : 'Kadrajda yakın plan yüzey veya belge alanı var.';

        const colorPart = `Merkez renk: ${metrics.centerColor.name} (${metrics.patternType}).`;

        let privacyPart = '';
        const mainPerson = preds.find(p => p.class === 'person');
        if (mainPerson) {
            const audit = evaluatePortraitPrivacyAndBacklight(mainPerson.bbox, metrics, preds, capCanvas.width, capCanvas.height);
            privacyPart = `${audit.hasBacklight ? 'Uyarı: Ters ışık var. ' : 'Işık yönü uygun. '}${audit.privacyReport}`;
        }

        const prefix = isAutoTriggered ? 'Otomatik fotoğraf çekildi!' : 'Fotoğraf çekildi!';
        const baseSummary = `${prefix} ${scenePart} ${colorPart} ${privacyPart}`.trim();

        showDetectedResult('Fotoğraf, Mahremiyet ve Metin Raporu', baseSummary + '\n\nÜzerindeki yazılar, imza alanı veya banknot bilgileri okunuyor...');
        announceGuidance(`${baseSummary} Şimdi fotoğraftaki yazılar okunuyor...`, {
            force: true,
            bannerState: 'centered'
        });

        if (typeof window.Tesseract !== 'undefined' && !state.isProcessingOcr) {
            state.isProcessingOcr = true;
            try {
                const ocrRes = await window.Tesseract.recognize(capCanvas, 'tur+eng');
                const rawText = (ocrRes && ocrRes.data && ocrRes.data.text) ? ocrRes.data.text.trim() : '';
                const cleanText = rawText.replace(/\s+/g, ' ').trim();

                const banknote = detectTurkishBanknoteFromTextAndColor(cleanText, metrics.centerColor.name);
                const hasSignatureKeyword = /imza|ad\s*soyad|teslim\s*alan|onay/i.test(cleanText);

                if (cleanText.length >= 3) {
                    const extraNotes = [];
                    if (banknote) extraNotes.push(`Tespit Edilen Banknot: ${banknote}!`);
                    if (hasSignatureKeyword) extraNotes.push('Evrak üzerinde İMZA / AD SOYAD alanı tespit edildi.');

                    const extraStr = extraNotes.length > 0 ? extraNotes.join(' ') + '\n\n' : '';
                    const finalReport = `${baseSummary}\n\n${extraStr}Okunan Metin:\n${cleanText}`;
                    showDetectedResult('Tam Analiz ve Okunan Metin', finalReport);
                    announceGuidance(`${extraNotes.join(' ')} Okunan metin: ${cleanText}`, {
                        force: true,
                        bannerState: 'centered'
                    });
                } else {
                    showDetectedResult('Fotoğraf ve Mahremiyet Raporu', `${baseSummary}\n\nFotoğraf üzerinde belirgin bir yazı algılanmadı.`);
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

    // =========================================================================
    // 10. WHATSAPP 15 SANİYE ARKA PLAN SES KİLİDİ VE DONANIM FLAŞI
    // =========================================================================
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

    // =========================================================================
    // 11. VİZÖR ÇİZİM VE KAMERA BAŞLATMA
    // =========================================================================
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
                el.aiStatusBadge.textContent = 'Yapay Zeka ve Matematik Motoru Yükleniyor...';
                state.cocoModel = await window.cocoSsd.load({ base: 'lite_mobilenet_v2' });
                el.aiStatusBadge.textContent = 'Matematiksel Motor & AI Hazır (%100 Doğrulamalı)';
                el.aiStatusBadge.classList.add('ready');
            }
        } catch (_) {
            el.aiStatusBadge.textContent = 'Matematiksel Sensör ve QR Motoru Hazır';
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
            announceGuidance(`${camName} ve matematiksel doğrulamalı 3 boyutlu sesli radar başlatıldı. Aktif mod: ${getActiveModeTitle()}.`, {
                force: true,
                bannerState: 'centered'
            });

            if (!state.cocoModel) {
                initAiModel();
            }

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

    function getActiveModeTitle() {
        const activeBtn = document.querySelector('.mode-card.active .mode-title');
        return activeBtn ? activeBtn.textContent : 'Ekran ve QR Hizalama';
    }

    function setMode(newMode) {
        state.mode = newMode;
        state.countdownStage = 0;
        state.kalmanBox = null;
        state.consensusFrames = 0;

        el.modeButtons.forEach(btn => {
            const isMatch = btn.getAttribute('data-mode') === newMode;
            btn.classList.toggle('active', isMatch);
            btn.setAttribute('aria-checked', isMatch ? 'true' : 'false');
        });

        const modeAnnouncement = {
            'qr_screen': 'Mod 1: WhatsApp Web, Bilgisayar Ekranı ve QR Kod Hizalama seçildi.',
            'portrait': 'Mod 2: Portre, Selfie ve Sosyal Medya Ters Işık / Mahremiyet Koçu seçildi.',
            'color_cloth': 'Mod 3: Beyaz Dengeli Kıyafet Rengi, Kumaş Deseni ve Para/Etiket Okuyucu seçildi.',
            'anomaly_led': 'Mod 4: Z-Skorlu Kayıp Eşya Radarı ve Cihaz LED / Şarj Işığı Frekans Okuyucu seçildi.',
            'light_meter': 'Mod 5: Akustik Işık Metre seçildi. Odadaki lambaların ve pencerelerin yönü ses frekansıyla bildiriliyor.',
            'explorer': 'Mod 6: Canlı Nesne, İmza Yeri ve Türkçe Belge Okuyucu seçildi.'
        }[newMode];

        if (modeAnnouncement) {
            announceGuidance(modeAnnouncement, { force: true, bannerState: 'normal' });
        }
    }

    // =========================================================================
    // 12. OLAY DİNLEYİCİLERİ VE KLAVYE KISAYOLLARI
    // =========================================================================
    window.addEventListener('deviceorientation', (ev) => {
        if (typeof ev.gamma === 'number' && typeof ev.beta === 'number') {
            state.hasOrientationSensor = true;
            state.tiltRoll = Math.round(ev.gamma);
            state.tiltPitch = Math.round(ev.beta);
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
        if (key === '1') setMode('qr_screen');
        else if (key === '2') setMode('portrait');
        else if (key === '3') setMode('color_cloth');
        else if (key === '4') setMode('anomaly_led');
        else if (key === '5') setMode('light_meter');
        else if (key === '6') setMode('explorer');
        else if (key === 'r') el.btnToggleRadar.click();
        else if (key === 'o') el.btnToggleAuto.click();
        else if (key === 'f' && !el.btnToggleFlash.disabled) el.btnToggleFlash.click();
        else if (key === 'w') startWhatsapp15SecAudioHold();
        else if (key === 'c' && !el.btnSwitchCam.disabled) el.btnSwitchCam.click();
        else if (key === 't') el.btnRepeat.click();
        else if (ev.code === 'Space') {
            ev.preventDefault();
            if (!state.isRunning) startCamera();
            else captureAndDescribePhoto(false);
        }
    });

    window.addEventListener('load', () => {
        setTimeout(initAiModel, 350);
    });
})();
