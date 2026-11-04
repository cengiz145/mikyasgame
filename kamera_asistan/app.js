/**
 * Mikyas Studio — Erişilebilir Kamera, Fotoğraf ve QR Hizalama Asistanı
 * %100 Cihaz İçi Gerçek Zamanlı Görüntü İşleme, 3D Web Audio Nişangah Radarı ve Türkçe Sesli Rehber
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
        'book': 'Kitap / Belge',
        'clock': 'Saat',
        'vase': 'Vazo',
        'scissors': 'Makas',
        'teddy bear': 'Oyuncak',
        'hair drier': 'Saç Kurutma Makinesi',
        'toothbrush': 'Diş Fırçası'
    };

    // Uygulama Durumu
    const state = {
        isRunning: false,
        facingMode: 'environment', // 'environment' (Arka) veya 'user' (Ön/Selfie)
        mode: 'qr_screen',         // 'qr_screen' | 'portrait' | 'explorer' | 'document'
        targetFilter: 'auto',
        radarEnabled: true,
        autoCaptureEnabled: true,
        cocoModel: null,
        videoStream: null,
        lastSpeechText: 'Henüz yönlendirme başlamadı.',
        lastSpokenAt: 0,
        lastSpokenPhrase: '',
        centeredHoldFrames: 0,
        countdownStage: 0,
        lastCountdownTick: 0,
        lastQrCode: '',
        lastQrAt: 0,
        lastCapturedDataUrl: null,
        isProcessingOcr: false,
        tiltRoll: 0,
        tiltPitch: 0,
        hasOrientationSensor: false,
        lastTouchTime: 0
    };

    // DOM Referansları
    const el = {
        btnStart: document.getElementById('btn-start-camera'),
        btnSwitchCam: document.getElementById('btn-switch-camera'),
        btnToggleRadar: document.getElementById('btn-toggle-radar'),
        btnToggleAuto: document.getElementById('btn-toggle-auto'),
        btnCaptureNow: document.getElementById('btn-capture-now'),
        btnRepeat: document.getElementById('btn-repeat-guidance'),
        targetSelect: document.getElementById('target-object-select'),
        modeButtons: document.querySelectorAll('.mode-card'),
        aiStatusBadge: document.getElementById('ai-status-badge'),
        liveDirectionBox: document.getElementById('live-direction-box'),
        tPosition: document.getElementById('t-position'),
        tDistance: document.getElementById('t-distance'),
        tLighting: document.getElementById('t-lighting'),
        tTilt: document.getElementById('t-tilt'),
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
        srAssertive: document.getElementById('sr-live-assertive'),
        srPolite: document.getElementById('sr-live-polite')
    };

    // =========================================================================
    // 1. 3D WEB AUDIO NİŞANGÂH RADARI (STEREO PAN + PITCH + ONAY AKORU)
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

        /**
         * Hedefin merkezden sapmasına göre 3 boyutlu radar bip sesi üretir.
         * @param {number} offsetX -1.0 (Tam Sol) ile +1.0 (Tam Sağ) arası
         * @param {number} offsetY -1.0 (Tam Üst) ile +1.0 (Tam Alt) arası
         * @param {boolean} isCentered Hedef tam merkezde mi?
         */
        updateRadar(offsetX, offsetY, isCentered) {
            if (!state.radarEnabled || !this.ctx) return;
            const now = performance.now();
            const dist = Math.min(1.4, Math.hypot(offsetX, offsetY));

            // Merkeze yaklaştıkça bip aralığı kısalır (160ms - 680ms)
            const intervalMs = isCentered ? 420 : Math.max(150, Math.round(160 + dist * 460));
            if (now < this.nextPulseTime) return;
            this.nextPulseTime = now + intervalMs;

            if (isCentered) {
                this.playLockChord();
                return;
            }

            // Y ekseni: Hedef yukarıdaysa (offsetY < 0) daha ince ses (680Hz), aşağıdaysa kalın ses (260Hz)
            const freq = Math.max(200, Math.min(920, 480 - offsetY * 240));
            const pan = Math.max(-1, Math.min(1, offsetX * 1.25));
            this.playPannedTone(freq, pan, 0.065, 'sine', 0.16);
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
            } catch (_) {
                // Ses bağlamı henüz hazır değilse sessizce geç
            }
        }

        playLockChord() {
            // Hedef ortalandığında huzurlu 2 notalı onay tınısı (C5 - E5)
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
    // 2. TÜRKÇE SESLİ REHBER (TTS + EKRAN OKUYUCU ARIA LIVE)
    // =========================================================================
    function announceGuidance(text, options = {}) {
        const {
            force = false,
            minIntervalMs = 2600,
            updateBanner = true,
            bannerState = 'normal' // 'normal' | 'centered' | 'warning'
        } = options;

        const now = performance.now();
        state.lastSpeechText = text;

        if (updateBanner && el.liveDirectionBox) {
            el.liveDirectionBox.textContent = text;
            el.liveDirectionBox.classList.remove('centered', 'warning');
            if (bannerState === 'centered') el.liveDirectionBox.classList.add('centered');
            if (bannerState === 'warning') el.liveDirectionBox.classList.add('warning');
        }

        // Aynı cümleyi çok sık tekrarlamayı önle
        if (!force) {
            if (now - state.lastSpokenAt < minIntervalMs) return;
            if (text === state.lastSpokenPhrase && now - state.lastSpokenAt < 5200) return;
        }

        state.lastSpokenAt = now;
        state.lastSpokenPhrase = text;

        // Ekran Okuyucu (NVDA / TalkBack / VoiceOver) bildirimi
        if (el.srAssertive) {
            el.srAssertive.textContent = '';
            setTimeout(() => {
                el.srAssertive.textContent = text;
            }, 30);
        }

        // Tarayıcı yerleşik Türkçe TTS
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
            } catch (_) {
                // ARIA live region yedek olarak her zaman çalışır
            }
        }
    }

    // =========================================================================
    // 3. GÖRÜNTÜ KALİTESİ, PARLAK EKRAN (MONİTÖR) VE KESKİNLİK ANALİZÖRÜ
    // =========================================================================
    /**
     * Kamera karesinin parlaklık, kontrast, bulanıklık (Laplacian) ve
     * parlak bilgisayar ekranı / kağıt dörtgeni merkezini hesaplar.
     */
    function analyzeFramePixels(ctx, width, height) {
        const imgData = ctx.getImageData(0, 0, width, height);
        const data = imgData.data;

        let sumLum = 0;
        let sumSqLum = 0;
        let edgeEnergy = 0;
        let count = 0;

        // Parlak ekran/monitör veya beyaz belge tespiti için ağırlıklı merkez
        let brightWeightSum = 0;
        let brightXSum = 0;
        let brightYSum = 0;
        let minBX = width, maxBX = 0, minBY = height, maxBY = 0;

        const step = 4; // Hızlı 30 FPS analiz için örnekleme adımı
        const grayGridWidth = Math.floor(width / step);
        const grayGridHeight = Math.floor(height / step);
        const gray = new Float32Array(grayGridWidth * grayGridHeight);

        for (let gy = 0; gy < grayGridHeight; gy++) {
            const y = gy * step;
            for (let gx = 0; gx < grayGridWidth; gx++) {
                const x = gx * step;
                const idx = (y * width + x) * 4;
                const lum = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
                gray[gy * grayGridWidth + gx] = lum;
                sumLum += lum;
                sumSqLum += lum * lum;
                count++;
            }
        }

        const avgBrightness = sumLum / Math.max(1, count);
        const variance = (sumSqLum / Math.max(1, count)) - (avgBrightness * avgBrightness);
        const contrast = Math.sqrt(Math.max(0, variance));

        // Keskinlik (Kenar enerjisi) ve Parlak Bölge (Bilgisayar Ekranı / QR Alanı) Tespiti
        const brightThreshold = Math.max(145, Math.min(220, avgBrightness + contrast * 0.65));

        for (let gy = 1; gy < grayGridHeight - 1; gy++) {
            for (let gx = 1; gx < grayGridWidth - 1; gx++) {
                const c = gray[gy * grayGridWidth + gx];
                const lap = Math.abs(
                    4 * c -
                    gray[gy * grayGridWidth + (gx - 1)] -
                    gray[gy * grayGridWidth + (gx + 1)] -
                    gray[(gy - 1) * grayGridWidth + gx] -
                    gray[(gy + 1) * grayGridWidth + gx]
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

        const sharpness = edgeEnergy / Math.max(1, (grayGridWidth - 2) * (grayGridHeight - 2));

        let brightCluster = null;
        if (brightWeightSum > 1800 && maxBX > minBX && maxBY > minBY) {
            const bw = maxBX - minBX;
            const bh = maxBY - minBY;
            const areaRatio = (bw * bh) / (width * height);
            if (areaRatio > 0.04 && areaRatio < 0.92) {
                brightCluster = {
                    cx: brightXSum / brightWeightSum,
                    cy: brightYSum / brightWeightSum,
                    bbox: [minBX, minBY, bw, bh],
                    areaRatio
                };
            }
        }

        return {
            avgBrightness,
            contrast,
            sharpness,
            brightCluster,
            imageData: imgData
        };
    }

    // =========================================================================
    // 4. YÖN VE KONUM CÜMLESİ ÜRETİCİ (SAĞA / SOLA / YUKARI / AŞAĞI / MESAFE)
    // =========================================================================
    /**
     * Hedefin (x, y, w, h) kutusuna göre kullanıcının telefonu hangi yöne
     * hareket ettirmesi gerektiğini anlaşılır Türkçe ile hesaplar.
     */
    function computeAlignmentInstruction(targetBox, frameW, frameH, labelTr, idealMinArea = 0.10, idealMaxArea = 0.68) {
        const [bx, by, bw, bh] = targetBox;
        const cx = bx + bw / 2;
        const cy = by + bh / 2;

        // Ön kamerada (selfie) ayna etkisi olduğu için yatay ekseni ters çevir
        const rawOffsetX = (cx - frameW / 2) / (frameW / 2); // -1 (sol) .. +1 (sağ)
        const offsetX = state.facingMode === 'user' ? -rawOffsetX : rawOffsetX;
        const offsetY = (cy - frameH / 2) / (frameH / 2);    // -1 (üst) .. +1 (alt)
        const areaRatio = (bw * bh) / (frameW * frameH);

        // Kenardan taşma kontrolü
        const touchesLeft = bx <= frameW * 0.03;
        const touchesRight = (bx + bw) >= frameW * 0.97;
        const touchesTop = by <= frameH * 0.03;
        const touchesBottom = (by + bh) >= frameH * 0.97;

        const moveParts = [];

        // Yatay yönlendirme
        if (offsetX < -0.22 || (touchesLeft && !touchesRight)) {
            moveParts.push(offsetX < -0.48 ? 'sola doğru çevirin' : 'biraz sola kaydırın');
        } else if (offsetX > 0.22 || (touchesRight && !touchesLeft)) {
            moveParts.push(offsetX > 0.48 ? 'sağa doğru çevirin' : 'biraz sağa kaydırın');
        }

        // Dikey yönlendirme (Kullanıcının en çok sorduğu: Ekranın üstüne mi altına mı tutuyoruz?)
        if (offsetY < -0.22 || (touchesTop && !touchesBottom)) {
            moveParts.push(offsetY < -0.48 ? 'yukarı kaldırın (şu an aşağıya tutuyorsunuz)' : 'biraz yukarı kaldırın');
        } else if (offsetY > 0.22 || (touchesBottom && !touchesTop)) {
            moveParts.push(offsetY > 0.48 ? 'aşağı indirin (şu an ekranın üstüne tutuyorsunuz)' : 'biraz aşağı indirin');
        }

        // Mesafe yönlendirmesi
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
            sentence = `${labelTr} algılandı: ${parts.join('. ')}.`;
        }

        const posLabel = isCentered
            ? 'Tam Merkezde'
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
    // 5. GERÇEK ZAMANLI VİZÖR DÖNGÜSÜ (COCO-SSD + jsQR + MONİTÖR HİZALAMA)
    // =========================================================================
    async function processFrameLoop() {
        if (!state.isRunning) return;

        if (el.video.readyState >= 2 && el.video.videoWidth > 0) {
            const vw = el.video.videoWidth;
            const vh = el.video.videoHeight;

            // Analiz ve çizim kanvaslarını senkronize et
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

            // 1. Piksel, Işık, Keskinlik ve Parlak Monitör Analizi
            const metrics = analyzeFramePixels(anCtx, anW, anH);
            updateLightingTelemetry(metrics);

            // 2. QR Kod Taraması (Özellikle Mod 1 veya QR filtresinde her karede çalışır)
            let qrDetection = null;
            if (typeof window.jsQR === 'function' && (state.mode === 'qr_screen' || state.targetFilter === 'screen_qr')) {
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
                    const minX = Math.min(...xs);
                    const maxX = Math.max(...xs);
                    const minY = Math.min(...ys);
                    const maxY = Math.max(...ys);
                    qrDetection = {
                        data: code.data,
                        bbox: [minX, minY, Math.max(12, maxX - minX), Math.max(12, maxY - minY)]
                    };
                }
            }

            // 3. Yapay Zeka Nesne Tespiti (COCO-SSD)
            let predictions = [];
            if (state.cocoModel) {
                try {
                    predictions = await state.cocoModel.detect(el.analysisCanvas, 8, 0.38);
                } catch (_) {
                    predictions = [];
                }
            }

            // 4. Seçili Moda Göre Karar, 3D Sesli Radar ve Türkçe Yönlendirme
            handleModeLogic(anW, anH, vw, vh, metrics, qrDetection, predictions);
        }

        if (state.isRunning) {
            requestAnimationFrame(processFrameLoop);
        }
    }

    function updateLightingTelemetry(metrics) {
        let lightLabel = 'İyi';
        if (metrics.avgBrightness < 42) {
            lightLabel = 'Çok Karanlık (Işığı Açın)';
        } else if (metrics.avgBrightness < 75) {
            lightLabel = 'Loş Ortam';
        } else if (metrics.avgBrightness > 235) {
            lightLabel = 'Aşırı Parlak / Yansıma Var';
        }

        const blurLabel = metrics.sharpness < 7.5 ? 'Bulanık (Sabit Tutun)' : 'Net';
        el.tLighting.textContent = `${lightLabel} • ${blurLabel}`;
    }

    function handleModeLogic(anW, anH, vw, vh, metrics, qrDetection, predictions) {
        const ovCtx = el.overlayCanvas.getContext('2d');
        ovCtx.clearRect(0, 0, vw, vh);
        const scaleX = vw / anW;
        const scaleY = vh / anH;

        // Merkeze nişangah artısı çiz
        drawCrosshair(ovCtx, vw, vh);

        // Karanlık ortam uyarısı
        if (metrics.avgBrightness < 35) {
            el.tPosition.textContent = 'Ortam Karanlık';
            el.tDistance.textContent = 'Işık Yetersiz';
            announceGuidance('Ortam çok karanlık, kamera önünü göremiyor. Lütfen ışığı açın veya aydınlık yöne dönün.', {
                bannerState: 'warning',
                minIntervalMs: 4000
            });
            return;
        }

        // Telefon aşırı eğikse uyar
        if (state.hasOrientationSensor && Math.abs(state.tiltRoll) > 22) {
            const tiltDir = state.tiltRoll > 0 ? 'sola' : 'sağa';
            announceGuidance(`Telefon yan yatmış durumda, lütfen telefonu ${tiltDir} doğru düzeltin.`, {
                bannerState: 'warning',
                minIntervalMs: 3200
            });
        }

        // Özel hedef filtresi seçiliyse ve 'auto' değilse
        if (state.targetFilter !== 'auto' && state.targetFilter !== 'screen_qr') {
            guideToSpecificObject(state.targetFilter, anW, anH, scaleX, scaleY, ovCtx, predictions);
            return;
        }

        // MOD 1: WHATSAPP WEB / BİLGİSAYAR EKRANI & QR KOD HİZALAMA
        if (state.mode === 'qr_screen' || state.targetFilter === 'screen_qr') {
            handleQrAndScreenMode(anW, anH, scaleX, scaleY, ovCtx, metrics, qrDetection, predictions);
            return;
        }

        // MOD 2: PORTRE & SELFIE KADRAJ ASİSTANI
        if (state.mode === 'portrait') {
            handlePortraitMode(anW, anH, scaleX, scaleY, ovCtx, predictions);
            return;
        }

        // MOD 3: CANLI NESNE & ÇEVRE TARAYICI
        if (state.mode === 'explorer') {
            handleExplorerMode(anW, anH, scaleX, scaleY, ovCtx, predictions);
            return;
        }

        // MOD 4: BELGE / METİN OKUMA & FOTOĞRAF BETİMLEME
        if (state.mode === 'document') {
            handleDocumentMode(anW, anH, scaleX, scaleY, ovCtx, metrics, predictions);
        }
    }

    // -------------------------------------------------------------------------
    // MOD 1: WHATSAPP WEB / BİLGİSAYAR EKRANI VE QR KOD HİZALAMA
    // -------------------------------------------------------------------------
    function handleQrAndScreenMode(anW, anH, scaleX, scaleY, ovCtx, metrics, qrDetection, predictions) {
        // 1. Eğer QR kod doğrudan yakalandıysa:
        if (qrDetection) {
            drawTargetBox(ovCtx, qrDetection.bbox, scaleX, scaleY, '#22c55e', 'QR Kod: ' + qrDetection.data);
            const align = computeAlignmentInstruction(qrDetection.bbox, anW, anH, 'QR Kod', 0.02, 0.65);
            el.tPosition.textContent = align.posLabel;
            el.tDistance.textContent = align.distanceStatus;

            radar.updateRadar(align.offsetX, align.offsetY, true);

            const now = performance.now();
            if (qrDetection.data && (qrDetection.data !== state.lastQrCode || now - state.lastQrAt > 6000)) {
                state.lastQrCode = qrDetection.data;
                state.lastQrAt = now;
                radar.playQrSuccessSound();
                showDetectedResult('QR Kod Başarıyla Okundu', qrDetection.data);
                announceGuidance(`Harika! QR kod tam hizalandı ve okundu: ${qrDetection.data}. WhatsApp Web veya başka bir uygulama taraması yapıyorsanız telefonunuzu tam bu noktada sabit tutun!`, {
                    force: true,
                    bannerState: 'centered'
                });
            }
            return;
        }

        // 2. QR kod henüz okunmadıysa: Önce bilgisayar ekranını (tv / laptop / cell phone) bul
        const screenPreds = predictions.filter(p =>
            p.class === 'tv' || p.class === 'laptop' || p.class === 'cell phone' || p.class === 'book'
        );

        let targetBox = null;
        let targetName = 'Bilgisayar Ekranı';

        if (screenPreds.length > 0) {
            // En büyük ekranı seç
            screenPreds.sort((a, b) => (b.bbox[2] * b.bbox[3]) - (a.bbox[2] * a.bbox[3]));
            targetBox = screenPreds[0].bbox;
            targetName = TR_LABELS[screenPreds[0].class] || 'Ekran';
        } else if (metrics.brightCluster) {
            // COCO-SSD monitör çerçevesini kaçırsa bile parlak monitör ışığı kümesini yakala
            targetBox = metrics.brightCluster.bbox;
            targetName = 'Parlak Ekran Yüzeyi';
        }

        if (targetBox) {
            drawTargetBox(ovCtx, targetBox, scaleX, scaleY, '#38bdf8', targetName);
            const align = computeAlignmentInstruction(targetBox, anW, anH, targetName, 0.14, 0.78);
            el.tPosition.textContent = align.posLabel;
            el.tDistance.textContent = align.distanceStatus;

            radar.updateRadar(align.offsetX, align.offsetY, align.isCentered);

            if (align.isCentered) {
                announceGuidance(`${targetName} tam karşınızda ve ortalandı! WhatsApp Web QR kodunu okutmak için telefonu tam bu hizada sabit tutun veya çok hafif ileri geri oynatın.`, {
                    bannerState: 'centered',
                    minIntervalMs: 2800
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
            announceGuidance('Karşıda henüz bilgisayar ekranı veya QR kod görünmüyor. Telefonu bilgisayar ekranına doğru, yaklaşık bir kol boyu (30 santimetre) mesafede yavaşça gezdirin.', {
                bannerState: 'warning',
                minIntervalMs: 4200
            });
        }
    }

    // -------------------------------------------------------------------------
    // MOD 2: PORTRE VE SELFIE KADRAJ ASİSTANI (OTOMATİK 3-2-1 ÇEKİM)
    // -------------------------------------------------------------------------
    function handlePortraitMode(anW, anH, scaleX, scaleY, ovCtx, predictions) {
        const people = predictions.filter(p => p.class === 'person');

        if (people.length === 0) {
            state.centeredHoldFrames = 0;
            state.countdownStage = 0;
            el.tPosition.textContent = 'Kişi Aranıyor';
            el.tDistance.textContent = 'Kadraj Boş';
            announceGuidance('Kadrajda kimse görünmüyor. Kamerayı yüzünüze veya çekmek istediğiniz kişiye doğru çevirin.', {
                bannerState: 'warning',
                minIntervalMs: 3800
            });
            return;
        }

        // En öndeki / en büyük kişiyi hedef al
        people.sort((a, b) => (b.bbox[2] * b.bbox[3]) - (a.bbox[2] * a.bbox[3]));
        const mainPerson = people[0];
        const label = people.length > 1 ? `${people.length} Kişi (Ana Kişi)` : 'Kişi';

        drawTargetBox(ovCtx, mainPerson.bbox, scaleX, scaleY, '#38bdf8', label);
        const align = computeAlignmentInstruction(mainPerson.bbox, anW, anH, label, 0.12, 0.72);
        el.tPosition.textContent = align.posLabel;
        el.tDistance.textContent = align.distanceStatus;

        radar.updateRadar(align.offsetX, align.offsetY, align.isCentered);

        if (align.isCentered) {
            state.centeredHoldFrames++;
            if (state.autoCaptureEnabled) {
                handleAutoCaptureCountdown();
            } else {
                announceGuidance(`${label} tam ortalandı! Fotoğraf çekmek için ekrana çift dokunun veya Boşluk tuşuna basın.`, {
                    bannerState: 'centered',
                    minIntervalMs: 3000
                });
            }
        } else {
            state.centeredHoldFrames = 0;
            state.countdownStage = 0;
            announceGuidance(align.sentence, {
                bannerState: 'normal',
                minIntervalMs: 2400
            });
        }
    }

    function handleAutoCaptureCountdown() {
        const now = performance.now();
        if (state.countdownStage === 0) {
            state.countdownStage = 3;
            state.lastCountdownTick = now;
            announceGuidance('Tam ortalandı, sabit tutun: 3', { force: true, bannerState: 'centered' });
        } else if (now - state.lastCountdownTick >= 1050) {
            state.countdownStage--;
            state.lastCountdownTick = now;
            if (state.countdownStage > 0) {
                announceGuidance(String(state.countdownStage), { force: true, bannerState: 'centered' });
            } else {
                state.countdownStage = 0;
                state.centeredHoldFrames = 0;
                captureAndDescribePhoto(true);
            }
        }
    }

    // -------------------------------------------------------------------------
    // MOD 3: CANLI NESNE VE ÇEVRE TARAYICI
    // -------------------------------------------------------------------------
    function handleExplorerMode(anW, anH, scaleX, scaleY, ovCtx, predictions) {
        if (predictions.length === 0) {
            el.tPosition.textContent = 'Nesne Aranıyor';
            el.tDistance.textContent = 'Belirgin Nesne Yok';
            announceGuidance('Önünüzde belirgin bir nesne algılanmadı. Kamerayı yavaşça çevrede gezdirin.', {
                bannerState: 'normal',
                minIntervalMs: 4200
            });
            return;
        }

        // Nesneleri soldan sağa sırala ve yönleriyle söyle
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

        // En merkeze yakın nesne için 3D sesli radarı çalıştır
        const mainPred = predictions[0];
        const align = computeAlignmentInstruction(
            mainPred.bbox,
            anW,
            anH,
            TR_LABELS[mainPred.class] || mainPred.class
        );
        el.tPosition.textContent = align.posLabel;
        el.tDistance.textContent = `${predictions.length} Nesne Algılandı`;
        radar.updateRadar(align.offsetX, align.offsetY, align.isCentered);

        const summaryText = `Kamera önünde: ${descriptions.join(', ')} var.`;
        announceGuidance(summaryText, {
            bannerState: 'centered',
            minIntervalMs: 3600
        });
    }

    // -------------------------------------------------------------------------
    // MOD 4: BELGE / METİN OKUMA VE FOTOĞRAF BETİMLEME REHBERİ
    // -------------------------------------------------------------------------
    function handleDocumentMode(anW, anH, scaleX, scaleY, ovCtx, metrics, predictions) {
        const docPred = predictions.find(p => p.class === 'book' || p.class === 'tv' || p.class === 'laptop');
        const targetBox = docPred ? docPred.bbox : (metrics.brightCluster ? metrics.brightCluster.bbox : null);

        if (metrics.sharpness < 7.0) {
            el.tPosition.textContent = 'Görüntü Bulanık';
            el.tDistance.textContent = 'Sabitleyin';
            announceGuidance('Görüntü biraz bulanık, lütfen elinizi sabit tutun veya kamerayı belgeye 25 santimetre mesafede tutun.', {
                bannerState: 'warning',
                minIntervalMs: 3000
            });
            return;
        }

        if (targetBox) {
            drawTargetBox(ovCtx, targetBox, scaleX, scaleY, '#facc15', 'Belge / Metin Alanı');
            const align = computeAlignmentInstruction(targetBox, anW, anH, 'Belge veya Metin Alanı', 0.15, 0.85);
            el.tPosition.textContent = align.posLabel;
            el.tDistance.textContent = align.distanceStatus;
            radar.updateRadar(align.offsetX, align.offsetY, align.isCentered);

            if (align.isCentered) {
                announceGuidance('Belge ve ışık net görünüyor! Yazıları okutmak için ekrana çift dokunun veya Boşluk tuşuna basın.', {
                    bannerState: 'centered',
                    minIntervalMs: 3400
                });
            } else {
                announceGuidance(align.sentence, {
                    bannerState: 'normal',
                    minIntervalMs: 2500
                });
            }
        } else {
            el.tPosition.textContent = 'Işık ve Netlik Hazır';
            el.tDistance.textContent = 'Çekime Hazır';
            announceGuidance('Işık ve netlik uygun. Karşınızdaki yazıyı veya sahneyi fotoğraflayıp okutmak için ekrana çift dokunun ya da Boşluk tuşuna basın.', {
                bannerState: 'centered',
                minIntervalMs: 4200
            });
        }
    }

    // Özel Hedef Arama
    function guideToSpecificObject(targetClass, anW, anH, scaleX, scaleY, ovCtx, predictions) {
        const matches = predictions.filter(p => {
            if (targetClass === 'door_table') return p.class === 'dining table' || p.class === 'bench' || p.class === 'couch';
            if (targetClass === 'cup') return p.class === 'cup' || p.class === 'bottle' || p.class === 'wine glass';
            if (targetClass === 'keyboard') return p.class === 'keyboard' || p.class === 'mouse' || p.class === 'laptop';
            return p.class === targetClass;
        });

        const trTargetName = TR_LABELS[targetClass] || 'Seçili Hedef';

        if (matches.length === 0) {
            el.tPosition.textContent = `${trTargetName} Aranıyor`;
            el.tDistance.textContent = 'Kadrajda Yok';
            announceGuidance(`${trTargetName} henüz kadrajda değil, kamerayı yavaşça etrafta gezdirin.`, {
                bannerState: 'warning',
                minIntervalMs: 3500
            });
            return;
        }

        matches.sort((a, b) => (b.bbox[2] * b.bbox[3]) - (a.bbox[2] * a.bbox[3]));
        const best = matches[0];
        drawTargetBox(ovCtx, best.bbox, scaleX, scaleY, '#22c55e', trTargetName);

        const align = computeAlignmentInstruction(best.bbox, anW, anH, trTargetName, 0.05, 0.75);
        el.tPosition.textContent = align.posLabel;
        el.tDistance.textContent = align.distanceStatus;
        radar.updateRadar(align.offsetX, align.offsetY, align.isCentered);
        announceGuidance(align.sentence, {
            bannerState: align.isCentered ? 'centered' : 'normal',
            minIntervalMs: 2200
        });
    }

    // =========================================================================
    // 6. FOTOĞRAF ÇEKİMİ, SAHNE BETİMLEME VE TÜRKÇE OCR (METİN OKUMA)
    // =========================================================================
    async function captureAndDescribePhoto(isAutoTriggered = false) {
        if (!state.isRunning || el.video.readyState < 2) {
            announceGuidance('Önce kamerayı başlatmanız gerekiyor.', { force: true, bannerState: 'warning' });
            return;
        }

        radar.playShutterSound();

        const capCanvas = document.createElement('canvas');
        capCanvas.width = el.video.videoWidth;
        capCanvas.height = el.video.videoHeight;
        const ctx = capCanvas.getContext('2d');
        ctx.drawImage(el.video, 0, 0, capCanvas.width, capCanvas.height);

        state.lastCapturedDataUrl = capCanvas.toDataURL('image/jpeg', 0.92);
        el.btnDownloadPhoto.hidden = false;

        const metrics = analyzeFramePixels(ctx, capCanvas.width, capCanvas.height);
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
            ? `Kadrajda tespit edilenler: ${uniqueObjs.join(', ')}.`
            : 'Kadrajda yakın plan yüzey veya metin alanı var.';

        const lightPart = metrics.avgBrightness < 65
            ? 'Işık biraz loş.'
            : (metrics.avgBrightness > 215 ? 'Parlak bir ışık var.' : 'Işık dengesi ve netlik gayet iyi.');

        const prefix = isAutoTriggered ? 'Otomatik fotoğraf çekildi!' : 'Fotoğraf çekildi!';
        const baseSummary = `${prefix} ${scenePart} ${lightPart}`;

        showDetectedResult('Fotoğraf Özeti ve Metin Analizi', baseSummary + '\n\nÜzerindeki yazılar taranıyor, lütfen bekleyin...');
        announceGuidance(`${baseSummary} Şimdi fotoğraftaki yazılar okunuyor...`, {
            force: true,
            bannerState: 'centered'
        });

        // Tesseract.js ile Türkçe + İngilizce OCR
        if (typeof window.Tesseract !== 'undefined' && !state.isProcessingOcr) {
            state.isProcessingOcr = true;
            try {
                const ocrRes = await window.Tesseract.recognize(capCanvas, 'tur+eng');
                const rawText = (ocrRes && ocrRes.data && ocrRes.data.text) ? ocrRes.data.text.trim() : '';
                const cleanText = rawText.replace(/\s+/g, ' ').trim();

                if (cleanText.length >= 3) {
                    const finalReport = `${baseSummary}\n\nOkunan Metin:\n${cleanText}`;
                    showDetectedResult('Fotoğraf Betimlemesi ve Okunan Metin', finalReport);
                    announceGuidance(`Fotoğraf üzerindeki yazı okundu: ${cleanText}`, {
                        force: true,
                        bannerState: 'centered'
                    });
                } else {
                    const noTextReport = `${baseSummary}\n\nFotoğraf üzerinde belirgin bir yazı algılanmadı. İsterseniz fotoğrafı indirebilirsiniz.`;
                    showDetectedResult('Fotoğraf Betimlemesi', noTextReport);
                    if (state.mode === 'document') {
                        announceGuidance('Fotoğraf üzerinde okunabilir bir yazı bulunamadı. Belgeyi kameraya biraz daha yaklaştırıp tekrar deneyebilirsiniz.', {
                            force: true,
                            bannerState: 'warning'
                        });
                    }
                }
            } catch (_) {
                showDetectedResult('Fotoğraf Betimlemesi', baseSummary);
            } finally {
                state.isProcessingOcr = false;
            }
        }
    }

    function showDetectedResult(title, content) {
        el.resultPanel.hidden = false;
        el.resultTitle.textContent = title;
        el.resultText.textContent = content;

        // İçerik bir web bağlantısıysa "Bağlantıyı Aç" butonunu etkinleştir
        const urlMatch = content.match(/https?:\/\/[^\s]+/i);
        if (urlMatch) {
            el.btnOpenLink.href = urlMatch[0];
            el.btnOpenLink.hidden = false;
        } else {
            el.btnOpenLink.hidden = true;
        }
    }

    // =========================================================================
    // 7. VİZÖR ÇİZİM YARDIMCILARI
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
        ctx.fillRect(sx, Math.max(0, sy - 30), Math.min(sw, 260), 28);
        ctx.fillStyle = color;
        ctx.font = 'bold 16px sans-serif';
        ctx.fillText(label, sx + 8, Math.max(18, sy - 10));
        ctx.restore();
    }

    // =========================================================================
    // 8. KAMERA BAŞLATMA, DEĞİŞTİRME VE MODEL YÜKLEME
    // =========================================================================
    async function initAiModel() {
        try {
            if (typeof window.cocoSsd !== 'undefined' && !state.cocoModel) {
                el.aiStatusBadge.textContent = 'Yapay Zeka Modeli Yükleniyor...';
                state.cocoModel = await window.cocoSsd.load({ base: 'lite_mobilenet_v2' });
                el.aiStatusBadge.textContent = 'Yapay Zeka ve QR Motoru Hazır';
                el.aiStatusBadge.classList.add('ready');
            }
        } catch (_) {
            el.aiStatusBadge.textContent = 'QR ve Parlak Ekran Radarı Hazır';
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
            el.btnCaptureNow.disabled = false;

            const camName = state.facingMode === 'user' ? 'Ön selfie kamerası' : 'Arka kamera';
            announceGuidance(`${camName} ve 3 boyutlu sesli radar başlatıldı. Seçili mod: ${getActiveModeTitle()}.`, {
                force: true,
                bannerState: 'centered'
            });

            if (!state.cocoModel) {
                initAiModel();
            }

            requestAnimationFrame(processFrameLoop);
        } catch (err) {
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
        el.btnCaptureNow.disabled = true;
        announceGuidance('Kamera ve sesli radar durduruldu.', { force: true });
    }

    function getActiveModeTitle() {
        const activeBtn = document.querySelector('.mode-card.active .mode-title');
        return activeBtn ? activeBtn.textContent : 'Ekran ve QR Hizalama';
    }

    function setMode(newMode) {
        state.mode = newMode;
        state.centeredHoldFrames = 0;
        state.countdownStage = 0;

        el.modeButtons.forEach(btn => {
            const isMatch = btn.getAttribute('data-mode') === newMode;
            btn.classList.toggle('active', isMatch);
            btn.setAttribute('aria-checked', isMatch ? 'true' : 'false');
        });

        const modeAnnouncement = {
            'qr_screen': 'Mod 1: WhatsApp Web, Bilgisayar Ekranı ve QR Kod Hizalama modu seçildi. Telefonu bilgisayar ekranına doğru tutun.',
            'portrait': 'Mod 2: Portre ve Selfie Kadraj Asistanı seçildi. Kişi tam ortalandığında 3-2-1 sayarak otomatik fotoğraf çeker.',
            'explorer': 'Mod 3: Canlı Nesne ve Çevre Tarayıcı seçildi. Kameranın önündeki nesneler yönleriyle okunacak.',
            'document': 'Mod 4: Belge Okuma ve Fotoğraf Betimleme seçildi. Ekrana çift dokunarak veya Boşluk tuşuyla yazıları okutabilirsiniz.'
        }[newMode];

        if (modeAnnouncement) {
            announceGuidance(modeAnnouncement, { force: true, bannerState: 'normal' });
        }
    }

    // =========================================================================
    // 9. TELEFON EĞİM SENSÖRÜ VE ETKİLEŞİM OLAYLARI
    // =========================================================================
    window.addEventListener('deviceorientation', (ev) => {
        if (typeof ev.gamma === 'number' && typeof ev.beta === 'number') {
            state.hasOrientationSensor = true;
            state.tiltRoll = Math.round(ev.gamma);
            state.tiltPitch = Math.round(ev.beta);
            if (Math.abs(state.tiltRoll) <= 15) {
                el.tTilt.textContent = 'Düz Tutuluyor';
            } else {
                el.tTilt.textContent = `${state.tiltRoll > 0 ? 'Sola' : 'Sağa'} Eğik (${Math.abs(state.tiltRoll)}°)`;
            }
        }
    });

    el.btnStart.addEventListener('click', () => {
        if (state.isRunning) {
            stopCamera();
        } else {
            startCamera();
        }
    });

    el.btnSwitchCam.addEventListener('click', () => {
        state.facingMode = state.facingMode === 'environment' ? 'user' : 'environment';
        const label = state.facingMode === 'user' ? 'Ön Selfie' : 'Arka';
        el.btnSwitchCam.textContent = `🔄 Kamera Değiştir (${label})`;
        if (state.isRunning) {
            startCamera();
        }
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

    el.btnCaptureNow.addEventListener('click', () => {
        captureAndDescribePhoto(false);
    });

    el.btnRepeat.addEventListener('click', () => {
        announceGuidance(state.lastSpeechText, { force: true });
    });

    el.targetSelect.addEventListener('change', () => {
        state.targetFilter = el.targetSelect.value;
        const selectedText = el.targetSelect.options[el.targetSelect.selectedIndex].text;
        announceGuidance(`Radar hedefi değiştirildi: ${selectedText}`, { force: true });
    });

    el.modeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            setMode(btn.getAttribute('data-mode'));
        });
    });

    // Vizör alanında çift dokunuş (Double-Tap) ile anında çekim (TapTapSee ergonomisi)
    el.touchZone.addEventListener('click', () => {
        const now = performance.now();
        if (now - state.lastTouchTime < 420) {
            captureAndDescribePhoto(false);
            state.lastTouchTime = 0;
        } else {
            state.lastTouchTime = now;
        }
    });

    // Sonuç Kopyalama ve Fotoğraf İndirme
    el.btnCopyResult.addEventListener('click', async () => {
        const txt = el.resultText.textContent || '';
        if (txt && navigator.clipboard) {
            await navigator.clipboard.writeText(txt);
            announceGuidance('Metin panoya kopyalandı.', { force: true });
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

    // Klavye Kısayolları (NVDA / PC Erişilebilirliği)
    window.addEventListener('keydown', (ev) => {
        if (ev.target && (ev.target.tagName === 'INPUT' || ev.target.tagName === 'TEXTAREA' || ev.target.tagName === 'SELECT')) {
            return;
        }
        const key = ev.key.toLowerCase();
        if (key === '1') setMode('qr_screen');
        else if (key === '2') setMode('portrait');
        else if (key === '3') setMode('explorer');
        else if (key === '4') setMode('document');
        else if (key === 'r') el.btnToggleRadar.click();
        else if (key === 'o') el.btnToggleAuto.click();
        else if (key === 'c') {
            if (!el.btnSwitchCam.disabled) el.btnSwitchCam.click();
        } else if (key === 't') {
            el.btnRepeat.click();
        } else if (ev.code === 'Space') {
            ev.preventDefault();
            if (! state.isRunning) {
                startCamera();
            } else {
                captureAndDescribePhoto(false);
            }
        }
    });

    // Sayfa yüklendiğinde yapay zeka modelini arka planda hazırla
    window.addEventListener('load', () => {
        setTimeout(initAiModel, 400);
    });
})();
