/* ==========================================================================
   MİKYAS KAPTANLIK AKADEMİSİ - PEDAGOJİK SÜRÜŞ REHBERİ (VOICE-ASSISTANT.JS)
   Mikyas Simülasyon Dünyası - Öğretmen Vizyonuyla Geliştirilmiş Sesli Koç
   %100 Ekran Okuyucu (NVDA) Uyumlu, F1 Kısayollu, Gelişim Karnesi Entegreli
   ========================================================================== */

class VoiceAssistant {
    constructor() {
        this.recognition = null;
        this.isListening = false;
        this.isCopilotEnabled = (localStorage.getItem('copilot_enabled') !== 'false');
        this.currentStageFilter = 'lab'; // 'all', 1, 2, 3, 4, 'karne'

        // 4 Pedagojik Gelişim Aşamasına Ayrılmış 12 Eğitim Modülü
        this.tutorialLessons = [
            // 1. AŞAMA: TEMEL SÜRÜŞ VE ARAÇ HAKİMİYETİ (BAŞLANGIÇ)
            {
                id: 'driving',
                stage: 1,
                stageName: '1. Aşama: Temel Sürüş ve Araç Hakimiyeti',
                title: '1. Temel Sürüş ve Araç Kontrolleri',
                keys: 'W (Gaz), S (Fren), A (Sol), D (Sağ), Boşluk (Motor), R (Hız)',
                speech: 'Temel Sürüş ve Araç Kontrolleri: Boşluk tuşuna basarak motoru çalıştırınız veya durdurunuz. W tuşuna basılı tutarak araca gaz verip hızlanınız. S tuşu servis frenidir; durağa veya kasise yaklaşırken aracı yavaşlatır ve durdurur. A ve D tuşları direksiyonu sola ve sağa çevirir. R tuşuna basarak anlık hızınızı kilometre cinsinden öğrenebilirsiniz.'
            },
            {
                id: 'stops',
                stage: 1,
                stageName: '1. Aşama: Temel Sürüş ve Araç Hakimiyeti',
                title: '2. Duraklar ve Kapı İşlemleri',
                keys: '1 (Ön Kapı), 2 (Arka Kapı)',
                speech: 'Duraklar ve Yolcu İndirme-Bindirme: Durağa ulaşıp tam olarak durduktan sonra 1 tuşuna basarak ön kapıyı, 2 tuşuna basarak arka kapıyı açınız. Ön kapıdan yeni yolcular biner, arka kapıdan inen yolcular tahliye edilir. Tüm yolcular indikten ve bindikten sonra aynı tuşlarla kapıları kapatınız. Güvenlik kilidi devrede olduğu için kapılar açıkken araç hareket etmez.'
            },
            {
                id: 'compass',
                stage: 1,
                stageName: '1. Aşama: Temel Sürüş ve Araç Hakimiyeti',
                title: '3. Pusula ve İstikamet Yönlendirme',
                keys: 'Y (Pusula), Shift + Ok Tuşları (Yön Değiştir)',
                speech: 'Pusula ve Yön Bulma Sistemi: Y tuşuna basarak otobüsünüzün mevcut istikametini Kuzey, Güney, Doğu veya Batı olarak dinleyebilirsiniz. Güzergah dönüşlerinde Shift tuşu ile birlikte Yukarı, Aşağı, Sol veya Sağ yön oklarına basarak aracınızın pusula yönünü değiştirebilirsiniz.'
            },

            // 2. AŞAMA: SOSYAL DUYARLILIK VE YOLCU GÜVENLİĞİ (GELİŞME)
            {
                id: 'ramp',
                stage: 2,
                stageName: '2. Aşama: Sosyal Duyarlılık ve Yolcu Güvenliği',
                title: '4. Engelli Yolcular ve Rampa Sistemi',
                keys: 'U (Engelli Rampası)',
                speech: 'Engelli Yolcular ve Rampa Sistemi: Durakta tekerlekli sandalyeli bir yolcu beklediğinde asistan sesli uyarı verir. Durup kapıları açtıktan sonra U tuşuna basarak pnömatik engelli rampasını indiriniz. Yolcu araca güvenle bindikten sonra tekrar U tuşuna basarak rampayı kapatınız. Rampa toplanmadan araç güvenlik kilidini çözmez.'
            },
            {
                id: 'bumps',
                stage: 2,
                stageName: '2. Aşama: Sosyal Duyarlılık ve Yolcu Güvenliği',
                title: '5. Hız Kasisleri ve Konfor Endeksi',
                keys: 'S (Fren ile 30 km/s altı), C (Konfor Endeksi)',
                speech: 'Hız Kasisleri ve Konfor Endeksi: Seyir halindeyken yolda hız kasisi tespit edildiğinde asistan kasis uyarısı yapar. S tuşuna basarak hızınızı saatte 30 kilometrenin altına düşürünüz. Kasis üzerinden 30\'un üzerinde bir hızla geçmek yolcu konfor puanını ve araç mekanik sağlığını düşürür. C tuşuna basarak yolcu konfor yüzdesini öğrenebilirsiniz.'
            },
            {
                id: 'comfort_ac',
                stage: 2,
                stageName: '2. Aşama: Sosyal Duyarlılık ve Yolcu Güvenliği',
                title: '6. Klima, Havalandırma ve Cam Kontrolleri',
                keys: 'K (Klima Aç/Kapat), O (Kaptan Camı)',
                speech: 'Klima ve Cam Kontrolleri: Sıcak yaz veya soğuk kış günlerinde K tuşuna basarak kabin klimasını açıp kapatabilirsiniz. O tuşuna basarak kaptan sol camını açıp kapatabilir, içeriye temiz hava alabilirsiniz.'
            },

            // 3. AŞAMA: ZAMAN YÖNETİMİ VE ZOR KOŞULLAR (İLERİ DÜZEY)
            {
                id: 'lights_weather',
                stage: 3,
                stageName: '3. Aşama: Zaman Yönetimi ve Zor Koşullar',
                title: '7. Farlar, Silecekler ve Hava Koşulları',
                keys: 'F (Farlar), Shift + W (Silecek), Shift + T (Saat/Hava)',
                speech: 'Farlar ve Hava Şartları: Akşam saatlerinde, tünellerde veya gece seferlerinde F tuşuna basarak farlarınızı yakınız. Yağmurlu veya karlı havalarda görüşü korumak için Shift ve W tuşlarına basarak silecekleri devreye alınız. Shift ve T tuşlarına basarak güncel oyun saatini, dış sıcaklığı ve hava durumunu dinleyebilirsiniz.'
            },
            {
                id: 'timetable',
                stage: 3,
                stageName: '3. Aşama: Zaman Yönetimi ve Zor Koşullar',
                title: '8. Dakiklik, Sefer Çizelgesi ve IBIS Bilgisayarı',
                keys: 'Z (Dakiklik Raporu), I (IBIS Bilgisayarı)',
                speech: 'Dakiklik ve IBIS Bilgisayarı: Z tuşuna basarak resmi sefer saatine göre erken mi yoksa rötarlı mı gittiğinizi kontrol edebilirsiniz. I tuşuna basarak IBIS hat bilgisayarını ve otobüsün dış LED tabelasındaki güzergah senkronizasyonunu dinleyebilirsiniz.'
            },
            {
                id: 'lost_found',
                stage: 3,
                stageName: '3. Aşama: Zaman Yönetimi ve Zor Koşullar',
                title: '9. Sefer Sonu ve Kayıp Eşya Kontrolü',
                keys: 'J (Kabin Teftişi)',
                speech: 'Sefer Sonu ve Kayıp Eşya Kontrolü: Hattın son durağına ulaşıp tüm yolcular tahliye edildikten sonra seyahat tamamlanır. Sefere son vermeden önce J tuşuna basarak kabin teftişi yapınız. Koltuklarda unutulan telefon, cüzdan veya çantaları tespit edip emanet bürosuna teslim ederek tecrübe puanı ve bahşiş kazanabilirsiniz.'
            },

            // 4. AŞAMA: USTA KAPTANLIK VE ŞEHİRLERARASI SEFERLER (USTALIK)
            {
                id: 'luggage',
                stage: 4,
                stageName: '4. Aşama: Usta Kaptanlık ve Şehirlerarası Seferler',
                title: '10. Bagaj Kapakları ve Şehirlerarası Seferler',
                keys: 'P (Alt Bagaj Kapakları)',
                speech: 'Bagaj Kapakları ve Uzun Yol: Şehirlerarası ve ilçe hatlarında yolcuların bavul ve valizlerini alabilmek için durakta P tuşuna basarak alt bagaj kapaklarını açınız. Yükleme tamamlandıktan sonra tekrar P tuşuna basarak kapakları kilitleyiniz.'
            },
            {
                id: 'badges_collection',
                stage: 4,
                stageName: '4. Aşama: Usta Kaptanlık ve Şehirlerarası Seferler',
                title: '11. 1500 Başarı ve Durak Hafızası',
                keys: 'K (Durak Albümü), Menü Rozetler Sekmesi',
                speech: '1500 Başarı ve Durak Hafızası: Menüdeki Kaptan Liyakat Rozetleri bölümünden 1\'den 1500\'e kadar sıralı resmi görevleri inceleyebilir, rastgele hedef önerisi alabilirsiniz. Sürüş sırasında K tuşuna basarak o ana kadar keşfettiğiniz şehir duraklarının koleksiyonunu ve kazandığınız keşif primlerini dinleyebilirsiniz.'
            },
            {
                id: 'voice_guide',
                stage: 4,
                stageName: '4. Aşama: Usta Kaptanlık ve Şehirlerarası Seferler',
                title: '12. Sesli Asistan ve Sesle Yönetim',
                keys: 'V (Mikrofon / Sesli Asistan)',
                speech: 'Sesli Seyir Asistanı: Sürüş halindeyken V tuşuna basarak asistana sesli komut verebilirsiniz. Hızım kaç, neredeyiz, sonraki durak, pusula, farları yak, klimayı aç, 48 numaralı hat, Saray seferi veya nasıl sürülür gibi sorularınızı doğrudan konuşarak iletebilirsiniz.'
            }
        ];

        // Tarayıcı desteği kontrolü
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            this.recognition = new SpeechRecognition();
            this.recognition.lang = 'tr-TR';
            this.recognition.continuous = false;
            this.recognition.interimResults = false;

            this.recognition.onstart = () => {
                this.isListening = true;
                if (typeof audio !== 'undefined' && audio.sounds && audio.sounds.select) {
                    audio.sounds.select.play();
                }
                console.log("Sesli Asistan: Dinliyor...");
            };

            this.recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript.toLowerCase();
                console.log("Sesli Asistan Anladı: ", transcript);
                this.processCommand(transcript);
            };

            this.recognition.onerror = (event) => {
                console.error("Sesli Asistan Hatası:", event.error);
                this.isListening = false;
                if (event.error === 'not-allowed') {
                    if (typeof UI !== 'undefined') UI.showToast("Mikrofon izni reddedildi.", "error");
                }
            };

            this.recognition.onend = () => {
                this.isListening = false;
                console.log("Sesli Asistan: Dinleme bitti.");
            };
        } else {
            console.error("Web Speech API bu tarayıcıda desteklenmiyor.");
        }

        // Global Klavye Kısayolları (V tuşu ve F1 Öğretici / Akademi tuşu)
        window.addEventListener('keydown', (e) => {
            if (e.key === 'F1') {
                e.preventDefault();
                this.toggleTutorialModal();
                return;
            }

            // Atölye açıkken hedef adıma göre doğru/yanlış tuş kontrolü
            if (this.isTutorialModalOpen() && this.currentStageFilter === 'lab') {
                const currentStep = (this.guidedSteps && this.guidedSteps[this.guidedStep - 1]) ? this.guidedSteps[this.guidedStep - 1] : null;
                if (currentStep && !currentStep.isGraduation) {
                    const k = e.key.toLowerCase();
                    const isTarget = (k === currentStep.targetKey) || (currentStep.altTargetKey && k === currentStep.altTargetKey);
                    
                    // Tab, Shift, Alt, Ctrl gibi gezinme tuşlarına dokunma
                    if (['tab', 'shift', 'control', 'alt', 'escape', 'f1', 'enter'].includes(k)) {
                        return;
                    }

                    e.preventDefault();
                    if (isTarget) {
                        this.executeGuidedSuccess();
                    } else {
                        this.executeGuidedFail(k);
                    }
                    return;
                }
            }

            if (e.key.toLowerCase() === 'v' && !e.repeat && !e.altKey && !e.ctrlKey) {
                if (typeof Game !== 'undefined' && Game.isDriving) {
                    this.toggleListening();
                }
            }

            if (e.key === 'Escape') {
                if (this.isTutorialModalOpen()) {
                    e.preventDefault();
                    this.closeTutorialModal();
                }
            }
        });
    }

    isTutorialModalOpen() {
        const modal = document.getElementById('tutorial-assistant-modal');
        return modal && !modal.classList.contains('hidden');
    }

    toggleTutorialModal() {
        if (this.isTutorialModalOpen()) {
            this.closeTutorialModal();
        } else {
            this.openTutorialModal();
        }
    }

    openTutorialModal() {
        const modal = document.getElementById('tutorial-assistant-modal');
        if (!modal) return;
        this.renderTutorialContent();
        modal.classList.remove('hidden');
        this.updateCopilotButtonText();

        const welcomeMsg = "Mikyas Kaptanlık Akademisi ve İnteraktif Sürüş Atölyesi açıldı. Not stresi ve sınav korkusu olmadan formülleri canlı deneyebileceğiniz atölye istasyonlarımız hazır. Yön tuşlarıyla pratik butonlarına geçebilir veya F1 tuşuyla atölyeyi kapatabilirsiniz.";
        if (typeof audio !== 'undefined' && audio.speak) {
            audio.speak(welcomeMsg);
        }
        if (typeof KeyboardNav !== 'undefined' && KeyboardNav.initForScreen) {
            KeyboardNav.initForScreen();
        }
    }

    closeTutorialModal() {
        const modal = document.getElementById('tutorial-assistant-modal');
        if (modal) modal.classList.add('hidden');
        this.stopTutorialSpeech();
        if (typeof audio !== 'undefined' && audio.speak) {
            audio.speak("Akademi rehberi kapatıldı.");
        }
        if (typeof KeyboardNav !== 'undefined' && KeyboardNav.initForScreen) {
            KeyboardNav.initForScreen();
        }
    }

    setAcademyTab(tabId) {
        this.currentStageFilter = tabId;
        this.renderTutorialContent();
    }

    setAcademyTab(tabId) {
        this.currentStageFilter = tabId;
        this.renderTutorialContent();
    }

    renderTutorialContent() {
        const listEl = document.getElementById('tutorial-lessons-list');
        const seruvenContainer = document.getElementById('tutorial-seruven-container') || document.getElementById('tutorial-karne-container');
        const labContainer = document.getElementById('tutorial-lab-container');
        if (!listEl) return;

        // Sekme butonlarının aktiflik stilini güncelle
        const tabs = ['lab', 'all', 'stage1', 'stage2', 'stage3', 'stage4', 'seruven', 'karne'];
        tabs.forEach(t => {
            const btn = document.getElementById(`tab-acad-${t}`);
            if (btn) {
                const isActive = (this.currentStageFilter === t) || (t === 'seruven' && this.currentStageFilter === 'karne');
                btn.style.background = isActive ? 'rgba(16, 185, 129, 0.4)' : 'rgba(255, 255, 255, 0.08)';
                btn.style.borderColor = isActive ? '#10b981' : 'rgba(255, 255, 255, 0.2)';
                btn.style.color = isActive ? '#34d399' : '#cbd5e1';
                btn.style.fontWeight = isActive ? 'bold' : 'normal';
            }
        });

        // 1. İNTERAKTİF SÜRÜŞ ATÖLYESİ (CANLI FORMÜL PRATİĞİ)
        if (this.currentStageFilter === 'lab') {
            if (labContainer) {
                labContainer.style.display = 'block';
                this.renderInteractiveLab();
            }
            if (seruvenContainer) seruvenContainer.style.display = 'none';
            listEl.style.display = 'none';
            return;
        }

        // 2. KAPTANLIK SERÜVENİ & YOL ARKADAŞI (NOT STRESİ YOK!)
        if (this.currentStageFilter === 'seruven' || this.currentStageFilter === 'karne') {
            if (labContainer) labContainer.style.display = 'none';
            listEl.style.display = 'none';
            if (seruvenContainer) {
                seruvenContainer.style.display = 'block';
                this.renderKaptanlikSeruveni();
            }
            return;
        }

        // 3. TEORİK DERSLER LİSTESİ
        if (labContainer) labContainer.style.display = 'none';
        if (seruvenContainer) seruvenContainer.style.display = 'none';
        listEl.style.display = 'block';
        listEl.innerHTML = '';

        let filtered = this.tutorialLessons;
        if (this.currentStageFilter === 'stage1') filtered = this.tutorialLessons.filter(l => l.stage === 1);
        else if (this.currentStageFilter === 'stage2') filtered = this.tutorialLessons.filter(l => l.stage === 2);
        else if (this.currentStageFilter === 'stage3') filtered = this.tutorialLessons.filter(l => l.stage === 3);
        else if (this.currentStageFilter === 'stage4') filtered = this.tutorialLessons.filter(l => l.stage === 4);

        filtered.forEach((lesson) => {
            const li = document.createElement('li');
            li.style.marginBottom = '10px';

            const btn = document.createElement('button');
            btn.className = 'menu-btn nav-item';
            btn.style.width = '100%';
            btn.style.textAlign = 'left';
            btn.style.padding = '14px 18px';
            btn.style.display = 'flex';
            btn.style.flexDirection = 'column';
            btn.style.gap = '6px';
            btn.style.borderRadius = '8px';
            btn.style.border = '1px solid rgba(16, 185, 129, 0.35)';
            btn.style.background = 'rgba(6, 78, 59, 0.25)';
            btn.style.cursor = 'pointer';

            btn.setAttribute('aria-label', `${lesson.stageName}. ${lesson.title}. Formül: ${lesson.formula}. Tuşlar: ${lesson.keys}. Dinlemek için Enter'a basınız.`);

            btn.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
                    <div>
                        <span style="font-size: 0.78rem; color: #a7f3d0; text-transform: uppercase; letter-spacing: 1px; display: block;">${lesson.stageName}</span>
                        <strong style="color: #34d399; font-size: 1.1rem;">${lesson.title}</strong>
                    </div>
                    <span style="font-size: 0.85rem; color: #a7f3d0; background: rgba(16, 185, 129, 0.2); padding: 4px 10px; border-radius: 4px;">▶ Dinle</span>
                </div>
                <div style="background: rgba(15, 23, 42, 0.6); border-left: 3px solid #38bdf8; padding: 6px 10px; border-radius: 4px; font-size: 0.86rem; color: #38bdf8;">
                    📐 <strong>Formül:</strong> ${lesson.formula}
                </div>
                <div style="font-size: 0.88rem; color: #fde047;"><strong>Tuşlar / Aksiyon:</strong> ${lesson.keys}</div>
                <div style="font-size: 0.84rem; color: #cbd5e1; line-height: 1.4;">${lesson.speech}</div>
            `;

            btn.addEventListener('click', () => {
                this.playLesson(lesson.id);
            });

            li.appendChild(btn);
            listEl.appendChild(li);
        });

        if (typeof KeyboardNav !== 'undefined' && KeyboardNav.initForScreen) {
            KeyboardNav.initForScreen();
        }
    }

    // =========================================================================
    // ADIM ADIM KILAVUZLU İNTERAKTİF SÜRÜŞ ATÖLYESİ (ÖĞRETMEN DİSİPLİNİ & SIFIR STRES)
    // =========================================================================
    initGuidedLab() {
        if (typeof this.guidedStep === 'undefined') this.guidedStep = 1;
        if (typeof this.labSpeed === 'undefined') this.labSpeed = 0;
        if (typeof this.labPressure === 'undefined') this.labPressure = 0;
        if (typeof this.labComfort === 'undefined') this.labComfort = 100;
        if (typeof this.labEngineRunning === 'undefined') this.labEngineRunning = false;
        if (typeof this.labKneeling === 'undefined') this.labKneeling = false;
        if (typeof this.labRampOpen === 'undefined') this.labRampOpen = false;
        if (typeof this.labFrontDoor === 'undefined') this.labFrontDoor = false;
        if (typeof this.labRearDoor === 'undefined') this.labRearDoor = false;
        if (typeof this.labRetarderActive === 'undefined') this.labRetarderActive = false;
        this.guidedFeedbackText = "";
        this.guidedFeedbackType = "info"; // "success" | "warning" | "info"

        this.guidedSteps = [
            {
                step: 1,
                title: "1. Adım: Motor Marşı ve Pnömatik Basınç",
                formula: "Hava Basıncı ≥ 85 PSI ➔ İmdat Frenleri Çözülür",
                instruction: "Sevgili Kaptan Adayım, otobüsümüzü sefere hazırlamak için önce motoru çalıştırmalıyız. Lütfen klavyenizden M tuşuna basınız veya aşağıdaki 'Marşa Bas' butonuna tıklayınız.",
                targetKey: "m",
                actionBtnText: "🔑 Kontağı Aç & Marşa Bas (M)",
                actionBtnStyle: "background: linear-gradient(135deg, #0284c7, #0369a1); border: 1.5px solid #38bdf8;",
                successFeedback: "Aferin, çok güzel yaptınız! 12 litrelik dizel motor çalıştı ve hava tüpleri 120 PSI basınca ulaştı. İmdat frenleri çözüldü. Şimdi ikinci adıma geçelim.",
                failFeedback: "Henüz doğru tuşa basmadınız kaptanım. Motoru çalıştırmak için lütfen sadece M tuşuna basınız. Başarabilirsin, tekrar dene!",
                execute: () => {
                    if (typeof audio !== 'undefined' && audio.sounds && audio.sounds.start) {
                        try { audio.sounds.start.play(); } catch(e) {}
                    }
                    this.labEngineRunning = true;
                    this.labPressure = 120;
                }
            },
            {
                step: 2,
                title: "2. Adım: Gaza Basıp Hızlanma",
                formula: "v = a · t ➔ Ağır Tonaj Hızlanma Dinamiği",
                instruction: "Motorumuz çalışıyor. Şimdi aracı hareket ettirmek ve hızlanmak için klavyeden W tuşuna (veya Yukarı Ok) basınız.",
                targetKey: "w",
                altTargetKey: "arrowup",
                actionBtnText: "🟢 Gaza Bas: 50 km/s (W / Yukarı Ok)",
                actionBtnStyle: "background: linear-gradient(135deg, #16a34a, #15803d); border: 1.5px solid #4ade80;",
                successFeedback: "Harika gidiyorsun, tebrikler! Otobüsümüz hareket etti ve saatte 50 kilometre hıza ulaştı. İleride ilk durağımız görünüyor.",
                failFeedback: "Hızlanmak için lütfen W tuşuna veya Yukarı Ok tuşuna basınız. Tekrar deneyiniz kaptanım!",
                execute: () => {
                    if (typeof audio !== 'undefined' && audio.playSelect) audio.playSelect();
                    this.labSpeed = 50;
                }
            },
            {
                step: 3,
                title: "3. Adım: İpek Fren ile Yumuşak Duruş",
                formula: "Duruş Mesafesi: d = v² / 200 | Konfor = %100",
                instruction: "Durağa yaklaşıyoruz! Yolcuları sarsmamak için yumuşak bir ipek fren yapmalıyız. Lütfen klavyeden S tuşuna (veya Aşağı Ok) basınız.",
                targetKey: "s",
                altTargetKey: "arrowdown",
                actionBtnText: "✨ İpek Fren Yap ve Dur (S / Aşağı Ok)",
                actionBtnStyle: "background: linear-gradient(135deg, #059669, #047857); border: 1.5px solid #10b981;",
                successFeedback: "Mükemmel bir duruş, tebrikler! Gazı erkenden kesip ipek gibi durdun. Yolcular ayakta bile sarsılmadı, konfor puanımız yüzde yüz!",
                failFeedback: "Durağa yumuşak yanaşmak ve durmak için lütfen S tuşuna veya Aşağı Ok tuşuna basınız. Başaracaksın, bir kez daha dene!",
                execute: () => {
                    if (typeof audio !== 'undefined' && audio.playAirBrake) audio.playAirBrake();
                    this.labSpeed = 0;
                    this.labComfort = 100;
                }
            },
            {
                step: 4,
                title: "4. Adım: Otobüsü Sağa Yatırma (Kneeling)",
                formula: "Kneeling (%15 Eğim) ➔ Kaldırım Hizalama",
                instruction: "Durakta yaşlı ve engelli yolcularımız bekliyor. Otobüsün basamak yüksekliğini kaldırım seviyesine indirmek için klavyeden K tuşuna basınız.",
                targetKey: "k",
                actionBtnText: "⬇️ Otobüsü Sağa Yatır (K)",
                actionBtnStyle: "background: linear-gradient(135deg, #0284c7, #0369a1); border: 1.5px solid #38bdf8;",
                successFeedback: "Aferin, çok doğru yaptınız! Otobüs sağ körüklerini indirerek kaldırım hizasına eğildi. İşte sosyal duyarlılık ve usta kaptanlık budur!",
                failFeedback: "Otobüsü kaldırım seviyesine eğmek için lütfen K tuşuna basınız. Tekrar dene kaptanım!",
                execute: () => {
                    if (typeof audio !== 'undefined' && audio.playKneeling) audio.playKneeling();
                    this.labKneeling = true;
                }
            },
            {
                step: 5,
                title: "5. Adım: Engelli Rampasını Açma",
                formula: "1:12 Eğim Standardı ➔ Engelsiz Erişim",
                instruction: "Tekerlekli sandalyeli yolcumuzun rahatça binebilmesi için klavyeden R tuşuna (veya U) basarak engelli rampasını açınız.",
                targetKey: "r",
                altTargetKey: "u",
                actionBtnText: "🛹 Engelli Rampasını Aç (R veya U)",
                actionBtnStyle: "background: linear-gradient(135deg, #d97706, #b45309); border: 1.5px solid #facc15;",
                successFeedback: "Harikasınız, tebrikler! Rampa açıldı ve yolcumuz araca güvenle bindi. Yolcumuz sesleniyor: Çok teşekkür ederim kaptanım, iyi ki varsınız!",
                failFeedback: "Engelli rampasını açmak için lütfen R veya U tuşuna basınız. Hadi bir kez daha deneyelim!",
                execute: () => {
                    if (typeof audio !== 'undefined' && audio.playRamp) audio.playRamp();
                    this.labRampOpen = true;
                }
            },
            {
                step: 6,
                title: "6. Adım: Rampayı Kapatma ve Doğrultma",
                formula: "Rampa Kilitli ➔ Sürüş İzni Çözülür",
                instruction: "Yolcumuz bindi. Güvenlik gereği rampa açıkken araç hareket etmez. Rampayı kapatmak için tekrar R tuşuna (veya U) basınız.",
                targetKey: "r",
                altTargetKey: "u",
                actionBtnText: "⬆️ Rampayı Kapat ve Doğrult (R veya U)",
                actionBtnStyle: "background: linear-gradient(135deg, #475569, #334155); border: 1.5px solid #94a3b8;",
                successFeedback: "Çok güzel, tebrikler! Rampa emniyetle toplandı ve otobüsümüz normal sürüş yüksekliğine döndü.",
                failFeedback: "Rampayı kapatmak için lütfen tekrar R veya U tuşuna basınız.",
                execute: () => {
                    if (typeof audio !== 'undefined' && audio.playRamp) audio.playRamp();
                    this.labRampOpen = false;
                    this.labKneeling = false;
                }
            },
            {
                step: 7,
                title: "7. Adım: Ön Kapıyı Açma (Yolcu Binişi)",
                formula: "Yolcu Akışı ➔ Ön Kapı Biniş (1)",
                instruction: "Durakta bekleyen diğer yolcuları almak için klavyeden 1 tuşuna basarak ön kapıyı açınız.",
                targetKey: "1",
                actionBtnText: "🚪 Ön Kapıyı Aç (1)",
                actionBtnStyle: "background: linear-gradient(135deg, #7c3aed, #6d28d9); border: 1.5px solid #a78bfa;",
                successFeedback: "Aferin doğru yaptınız! Ön kapı açıldı ve yolcularımız kartlarını basarak bindi: Bip bip, kolay gelsin kaptan!",
                failFeedback: "Yolcuları almak için ön kapıyı açmalıyız; lütfen klavyeden 1 tuşuna basınız.",
                execute: () => {
                    if (typeof audio !== 'undefined' && audio.playDoorOpen) audio.playDoorOpen();
                    this.labFrontDoor = true;
                }
            },
            {
                step: 8,
                title: "8. Adım: Kapıları Kapatma ve Güvenlik Kilidi",
                formula: "Kapılar Kapalı ➔ Gaz Emniyet Kilidi Çözülür",
                instruction: "Tüm yolcular bindi. Sürüş güvenlik kilidini çözmek için lütfen tekrar 1 tuşuna basarak ön kapıyı kapatınız.",
                targetKey: "1",
                actionBtnText: "🔒 Ön Kapıyı Kapat (1)",
                actionBtnStyle: "background: linear-gradient(135deg, #475569, #334155); border: 1.5px solid #94a3b8;",
                successFeedback: "Tebrikler, kapılar emniyetle kapandı ve gaz güvenlik kilidi çözüldü! Artık güvenle yola çıkabiliriz.",
                failFeedback: "Kapıyı kapatmak için lütfen tekrar 1 tuşuna basınız.",
                execute: () => {
                    if (typeof audio !== 'undefined' && audio.playDoorClose) audio.playDoorClose();
                    this.labFrontDoor = false;
                }
            },
            {
                step: 9,
                title: "9. Adım: Manyetik Retarder (Yokuş Freni)",
                formula: "Ağır Tonaj + Dik İniş ➔ Manyetik Retarder (Space)",
                instruction: "Son olarak, dik yokuşlarda balataları yakmadan motor gücüyle yavaşlamak için Boşluk (Space) tuşuna basarak manyetik retarderi çekiniz.",
                targetKey: " ",
                actionBtnText: "⚡ Manyetik Retarderi Çek (Space / Boşluk)",
                actionBtnStyle: "background: linear-gradient(135deg, #ea580c, #c2410c); border: 1.5px solid #f97316;",
                successFeedback: "Muhteşem! Manyetik retarder devrede, balatalar aşınmadan güvenle yavaşladık! Bütün temel aşamaları tamamladınız!",
                failFeedback: "Manyetik retarderi devreye sokmak için lütfen Boşluk (Space) tuşuna basınız.",
                execute: () => {
                    if (typeof audio !== 'undefined' && audio.playSelect) audio.playSelect();
                    this.labRetarderActive = true;
                }
            },
            {
                step: 10,
                title: "🎓 Akademi Mezuniyeti & Resmi Kaptanlık Brövesi",
                isGraduation: true
            }
        ];
    }

    renderInteractiveLab() {
        this.initGuidedLab();
        const labContainer = document.getElementById('tutorial-lab-container');
        if (!labContainer) return;

        const currentStep = this.guidedSteps[this.guidedStep - 1] || this.guidedSteps[0];
        const isGraduation = !!currentStep.isGraduation;
        const progressPct = Math.round(((this.guidedStep - 1) / 9) * 100);

        if (isGraduation) {
            // MEZUNİYET EKRANI
            if (typeof Game !== 'undefined' && typeof Game.completeAcademy === 'function') {
                Game.completeAcademy();
            }
            if (typeof audio !== 'undefined' && audio.playSuccess) audio.playSuccess();

            labContainer.innerHTML = `
                <div style="background: linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(6, 78, 59, 0.5)); border: 2px solid #eab308; border-radius: 14px; padding: 26px; text-align: center; box-shadow: 0 0 30px rgba(234, 179, 8, 0.3);">
                    <div style="font-size: 3.8rem; margin-bottom: 10px;">🏆</div>
                    <span style="font-size: 0.88rem; color: #fde047; text-transform: uppercase; letter-spacing: 2px; font-weight: bold;">MİKYAS KAPTANLIK AKADEMİSİ MEZUNİYETİ</span>
                    <h3 style="color: #facc15; font-size: 1.8rem; margin: 6px 0 12px 0;">🎉 TEBRİKLER KAPTANIM!</h3>
                    
                    <div style="background: rgba(234, 179, 8, 0.15); border: 1.5px solid #eab308; border-radius: 10px; padding: 16px; margin: 16px auto; max-width: 600px; text-align: left;">
                        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
                            <span style="font-size: 2rem;">🎖️</span>
                            <div>
                                <strong style="color: #fef08a; font-size: 1.15rem; display: block;">Resmî Şehir İçi Sefer Kaptanı Brövesi Verildi</strong>
                                <span style="color: #cbd5e1; font-size: 0.9rem;">Öğrencilik aşaması tamamlandı, Süleymanpaşa hatları emrinizde!</span>
                            </div>
                        </div>
                        <p style="color: #f1f5f9; font-size: 0.94rem; line-height: 1.5; margin: 8px 0 0 0;">
                            Motor marşını, ipek freni, engelli rampası sevgi protokolünü ve kapı emniyetini üstün başarıyla kavradınız. Artık yolcularımızı güvenle ve konforla taşıyabilirsiniz.
                        </p>
                    </div>

                    <button id="btn-lab-start-first-mission" class="modern-btn nav-item" style="padding: 14px 28px; font-size: 1.15rem; background: linear-gradient(135deg, #059669, #047857); border: 2px solid #34d399; color: #ffffff; font-weight: bold; border-radius: 10px; cursor: pointer; margin-top: 10px; box-shadow: 0 0 16px rgba(52, 211, 153, 0.4);" aria-label="İlk Seferime Başla. 1. Seviye Görevini Aç">
                        🚍 İlk Seferime Başla (Görev 1: Süleymanpaşa)
                    </button>
                </div>
            `;

            const btnStart = document.getElementById('btn-lab-start-first-mission');
            if (btnStart) {
                btnStart.onclick = () => {
                    if (typeof audio !== 'undefined' && audio.playSelect) audio.playSelect();
                    this.closeTutorialModal();
                    // Görev seçim ekranına git
                    document.dispatchEvent(new CustomEvent('go-to-route-screen', { detail: { city: "Tekirdağ" } }));
                };
            }

            if (typeof KeyboardNav !== 'undefined' && KeyboardNav.initForScreen) {
                KeyboardNav.initForScreen();
            }
            return;
        }

        // AKTİF REHBERLİ ADIM EKRANI
        labContainer.innerHTML = `
            <div style="background: rgba(15, 23, 42, 0.85); border: 1.5px solid #10b981; border-radius: 12px; padding: 20px; margin-bottom: 16px;">
                <!-- Başlık ve İlerleme -->
                <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(16, 185, 129, 0.3); padding-bottom: 10px; margin-bottom: 14px;">
                    <div>
                        <span style="font-size: 0.8rem; color: #a7f3d0; text-transform: uppercase; letter-spacing: 1px;">Adım Adım İnteraktif Sürüş Eğitimi</span>
                        <h3 style="color: #34d399; font-size: 1.35rem; margin: 2px 0 0 0;">${currentStep.title}</h3>
                    </div>
                    <span style="background: rgba(16, 185, 129, 0.25); color: #34d399; padding: 6px 14px; border-radius: 20px; font-weight: bold; font-size: 0.9rem;">
                        Adım ${this.guidedStep} / 9 (%${progressPct})
                    </span>
                </div>

                <!-- Gösterge Paneli (CANLI SİMÜLASYON VERİLERİ) -->
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 8px; margin-bottom: 16px;">
                    <div style="background: rgba(0,0,0,0.4); padding: 8px 10px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.08); text-align: center;">
                        <span style="color: #94a3b8; font-size: 0.75rem; display: block;">MOTOR DURUMU</span>
                        <strong style="color: ${this.labEngineRunning ? '#4ade80' : '#f87171'}; font-size: 0.95rem;">${this.labEngineRunning ? '🟢 Çalışıyor' : '🔴 Kapalı'}</strong>
                    </div>
                    <div style="background: rgba(0,0,0,0.4); padding: 8px 10px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.08); text-align: center;">
                        <span style="color: #94a3b8; font-size: 0.75rem; display: block;">HAVA BASINCI</span>
                        <strong style="color: #38bdf8; font-size: 0.95rem;">${this.labPressure} PSI</strong>
                    </div>
                    <div style="background: rgba(0,0,0,0.4); padding: 8px 10px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.08); text-align: center;">
                        <span style="color: #94a3b8; font-size: 0.75rem; display: block;">HIZ GÖSTERGESİ</span>
                        <strong style="color: #facc15; font-size: 0.95rem;">${this.labSpeed} km/s</strong>
                    </div>
                    <div style="background: rgba(0,0,0,0.4); padding: 8px 10px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.08); text-align: center;">
                        <span style="color: #94a3b8; font-size: 0.75rem; display: block;">YOLCU KONFORU</span>
                        <strong style="color: #4ade80; font-size: 0.95rem;">%${this.labComfort}</strong>
                    </div>
                    <div style="background: rgba(0,0,0,0.4); padding: 8px 10px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.08); text-align: center;">
                        <span style="color: #94a3b8; font-size: 0.75rem; display: block;">RAMPA & KÖYÜK</span>
                        <strong style="color: #38bdf8; font-size: 0.95rem;">${this.labRampOpen ? '🛹 Rampa Açık' : (this.labKneeling ? '🦼 Yana Yatık' : '⚪ Normal')}</strong>
                    </div>
                    <div style="background: rgba(0,0,0,0.4); padding: 8px 10px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.08); text-align: center;">
                        <span style="color: #94a3b8; font-size: 0.75rem; display: block;">KAPILAR</span>
                        <strong style="color: ${this.labFrontDoor || this.labRearDoor ? '#f87171' : '#4ade80'}; font-size: 0.95rem;">${this.labFrontDoor || this.labRearDoor ? '🚪 Açık (Gaz Kilitli)' : '🔒 Kapalı'}</strong>
                    </div>
                </div>

                <!-- Formül Kutusu -->
                <div style="background: rgba(56, 189, 248, 0.1); border-left: 4px solid #38bdf8; padding: 10px 14px; border-radius: 0 6px 6px 0; margin-bottom: 14px; font-size: 0.9rem; color: #38bdf8;">
                    📐 <strong>Pedagojik Formül:</strong> ${currentStep.formula}
                </div>

                <!-- Talimat Kutusu -->
                <div style="background: rgba(6, 78, 59, 0.35); border: 1.5px solid rgba(16, 185, 129, 0.4); border-radius: 10px; padding: 16px; margin-bottom: 16px;">
                    <div style="font-weight: bold; color: #a7f3d0; margin-bottom: 6px; font-size: 1rem;">📢 Öğretmen Talimatı (Şimdi Ne Yapmalısınız?):</div>
                    <p style="color: #f1f5f9; font-size: 1.05rem; line-height: 1.5; margin: 0;">${currentStep.instruction}</p>
                </div>

                <!-- TEK VE NET HEDEF AKSİYON BUTONU (KULLANICININ KAFASI KARIŞMAZ) -->
                <div style="text-align: center; margin-bottom: 16px;">
                    <button id="btn-guided-action" class="modern-btn nav-item" style="padding: 16px 32px; font-size: 1.25rem; font-weight: bold; border-radius: 10px; cursor: pointer; color: #ffffff; ${currentStep.actionBtnStyle} box-shadow: 0 0 20px rgba(56, 189, 248, 0.3);" aria-label="${currentStep.actionBtnText}">
                        ${currentStep.actionBtnText}
                    </button>
                </div>

                <!-- GERİ BİLDİRİM / MOTİVASYON VE TELKİN ALANI -->
                <div id="guided-feedback-box" style="display: ${this.guidedFeedbackText ? 'block' : 'none'}; padding: 12px 16px; border-radius: 8px; margin-bottom: 14px; font-size: 0.95rem; font-weight: bold; ${this.guidedFeedbackType === 'success' ? 'background: rgba(34, 197, 94, 0.2); border: 1.5px solid #22c55e; color: #4ade80;' : 'background: rgba(234, 179, 8, 0.2); border: 1.5px solid #eab308; color: #fde047;'}">
                    ${this.guidedFeedbackText}
                </div>

                <!-- Yardımcı Butonlar: Sesli Dinle ve Önceki Adım -->
                <div style="display: flex; gap: 10px; justify-content: space-between; align-items: center; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 12px;">
                    <button id="btn-guided-replay-audio" class="modern-btn nav-item" style="padding: 8px 14px; font-size: 0.88rem; background: rgba(56, 189, 248, 0.15); border: 1px solid #38bdf8; color: #38bdf8; border-radius: 6px; cursor: pointer;" aria-label="Talimatı Sesli Tekrar Dinle">
                        🔊 Talimatı Tekrar Dinle
                    </button>
                    ${this.guidedStep > 1 ? '<button id="btn-guided-prev-step" class="modern-btn nav-item" style="padding: 8px 14px; font-size: 0.88rem; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.2); color: #cbd5e1; border-radius: 6px; cursor: pointer;">⬅️ Önceki Adım</button>' : ''}
                </div>
            </div>
        `;

        // Aksiyon Butonu Dinleyicisi
        const btnAction = document.getElementById('btn-guided-action');
        if (btnAction) {
            btnAction.onclick = () => {
                this.executeGuidedSuccess();
            };
        }

        // Sesli Tekrar Dinle
        const btnReplay = document.getElementById('btn-guided-replay-audio');
        if (btnReplay) {
            btnReplay.onclick = () => {
                if (typeof audio !== 'undefined' && audio.speak) {
                    audio.speak(currentStep.instruction);
                }
            };
        }

        // Önceki Adım
        const btnPrev = document.getElementById('btn-guided-prev-step');
        if (btnPrev) {
            btnPrev.onclick = () => {
                if (this.guidedStep > 1) {
                    this.guidedStep--;
                    this.guidedFeedbackText = "";
                    this.renderInteractiveLab();
                    const prevStep = this.guidedSteps[this.guidedStep - 1];
                    if (typeof audio !== 'undefined' && audio.speak) audio.speak(prevStep.instruction);
                }
            };
        }

        if (typeof KeyboardNav !== 'undefined' && KeyboardNav.initForScreen) {
            KeyboardNav.initForScreen();
        }
    }

    // Doğru Tuşa Basıldığında veya Doğru Butona Tıklandığında
    executeGuidedSuccess() {
        const currentStep = this.guidedSteps[this.guidedStep - 1];
        if (!currentStep) return;

        if (currentStep.execute) currentStep.execute();

        this.guidedFeedbackText = "🎉 " + currentStep.successFeedback;
        this.guidedFeedbackType = "success";

        if (typeof audio !== 'undefined') {
            if (audio.playSuccess) audio.playSuccess();
            if (audio.speak) audio.speak(currentStep.successFeedback);
            if (audio.updateNvdaLiveRegion) audio.updateNvdaLiveRegion(currentStep.successFeedback);
        }
        if (typeof UI !== 'undefined' && UI.showToast) {
            UI.showToast("Aferin! Doğru yaptınız. Sıradaki adıma geçiliyor...", "success");
        }

        // 1.8 saniye sonra sıradaki adıma yumuşak geçiş
        setTimeout(() => {
            this.guidedStep++;
            this.guidedFeedbackText = "";
            this.renderInteractiveLab();
            const nextStep = this.guidedSteps[this.guidedStep - 1];
            if (nextStep && !nextStep.isGraduation && typeof audio !== 'undefined' && audio.speak) {
                setTimeout(() => audio.speak(nextStep.instruction), 600);
            }
        }, 1800);
    }

    // Yanlış Tuşa Basıldığında Nazik ve Teşvik Edici Telkin
    executeGuidedFail(pressedKey) {
        const currentStep = this.guidedSteps[this.guidedStep - 1];
        if (!currentStep || currentStep.isGraduation) return;

        this.guidedFeedbackText = "💡 " + currentStep.failFeedback;
        this.guidedFeedbackType = "warning";

        if (typeof audio !== 'undefined') {
            if (audio.playWarning) {
                try { audio.playWarning(); } catch(e) {}
            }
            if (audio.speak) audio.speak(currentStep.failFeedback);
            if (audio.updateNvdaLiveRegion) audio.updateNvdaLiveRegion(currentStep.failFeedback);
        }
        if (typeof UI !== 'undefined' && UI.showToast) {
            UI.showToast("Tekrar deneyiniz: " + currentStep.failFeedback, "warning");
        }

        // Ekrandaki feedback kutusunu güncelle
        const fBox = document.getElementById('guided-feedback-box');
        if (fBox) {
            fBox.style.display = 'block';
            fBox.style.background = 'rgba(234, 179, 8, 0.2)';
            fBox.style.border = '1.5px solid #eab308';
            fBox.style.color = '#fde047';
            fBox.innerText = this.guidedFeedbackText;
        }
    }


    // =========================================================================
    // KAPTANLIK SERÜVENİ & YOL ARKADAŞI (NOT KORKUSU VE SINAV STRESİ YOK!)
    // =========================================================================
    renderKaptanlikSeruveni() {
        const seruvenContainer = document.getElementById('tutorial-seruven-container') || document.getElementById('tutorial-karne-container');
        if (!seruvenContainer) return;

        const level = (typeof Game !== 'undefined' && Game.licenseLevel) ? Game.licenseLevel : 1;
        const xp = (typeof Game !== 'undefined' && Game.playerXP) ? Game.playerXP : 0;
        const tasks = (typeof Game !== 'undefined' && Game.completedTasks) ? Game.completedTasks : 0;
        const title = (typeof Game !== 'undefined' && typeof Game.getLicenseTitle === 'function') ? Game.getLicenseTitle() : 'Stajyer Sürücü';
        const nextXP = (typeof Game !== 'undefined' && typeof Game.getNextLevelXP === 'function') ? Game.getNextLevelXP(level) : 250;
        const unlockTeaser = (typeof Game !== 'undefined' && typeof Game.getUnlockTeaser === 'function') ? Game.getUnlockTeaser(level) : "Seviye 3'te BMC Neocity 10M açılacak!";

        // Sıcak, samimi, cesaretlendirici yol arkadaşı mentor tavsiyeleri (Sınav veya not dili YOK)
        let companionAdvice = "";
        if (level < 3) {
            companionAdvice = "Kaptanım harika gidiyorsun! Şu an yolculuğunun en keyifli keşif dönemindesin. Duraklara tatlı bir süzülüşle yanaşman ve yolcuları güler yüzle karşılaman tam bir centilmenlik örneği. Sebatla sürdükçe yeni araçlar filona katılacak!";
        } else if (level < 6) {
            companionAdvice = "Direksiyon hakimiyetin göz dolduruyor kaptan! Engelli rampasını özenle açman ve kasislerde ipek fren yapman yolcuların gönlünde taht kurdu. Şehir içi hatların aranan kaptanı oldun!";
        } else if (level < 10) {
            companionAdvice = "Vay be, artık tecrübeli bir şehir içi başkaptanı oldun! Körüklü otobüste gösterdiğin ustalık takdire şayan. Çok yakında otoyollara çıkacak ve Mercedes Travego'nun direksiyonuna geçeceksin!";
        } else {
            companionAdvice = "Efsane bir Usta Kaptansın! Şehirlerarası uzun yol koridorlarında ve Türkiye Turnesi rotalarında tecrübenle parlıyorsun. Tüm yollar, duraklar ve filodaki dev otobüsler seninle gurur duyuyor!";
        }

        const xpPercent = Math.min(100, Math.round((xp / nextXP) * 100));

        seruvenContainer.innerHTML = `
            <div style="background: linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(6, 78, 59, 0.45)); border: 2px solid #eab308; border-radius: 12px; padding: 22px; box-shadow: 0 0 24px rgba(234, 179, 8, 0.2);">
                <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(234, 179, 8, 0.3); padding-bottom: 12px; margin-bottom: 16px;">
                    <div>
                        <span style="font-size: 0.82rem; color: #fde047; text-transform: uppercase; letter-spacing: 1px;">Mikyas Akademi Yol Arkadaşı & Macera Günlüğü</span>
                        <h3 style="color: #facc15; font-size: 1.55rem; margin: 4px 0 0 0;">🌟 Seviye ${level} - ${title}</h3>
                    </div>
                    <button id="btn-seruven-read-speech" class="modern-btn nav-item" style="padding: 10px 18px; background: linear-gradient(135deg, #d97706, #b45309); border: 1.5px solid #facc15; color: #ffffff; font-weight: bold; border-radius: 8px; cursor: pointer;" aria-label="Kaptanlık serüvenimi ve yol arkadaşı tavsiyelerini sesli dinle">
                        🔊 Serüvenimi Dinle
                    </button>
                </div>

                <!-- Tecrübe ve İlerleme Çubuğu -->
                <div style="margin-bottom: 18px;">
                    <div style="display: flex; justify-content: space-between; font-size: 0.95rem; margin-bottom: 6px; color: #e2e8f0;">
                        <span>Kazanılan Tecrübe & Keşif: <strong>${xp} / ${nextXP} XP</strong></span>
                        <span style="color: #facc15; font-weight: bold;">%${xpPercent}</span>
                    </div>
                    <div style="height: 12px; background: rgba(0,0,0,0.5); border-radius: 6px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1);">
                        <div style="height: 100%; width: ${xpPercent}%; background: linear-gradient(90deg, #eab308, #38bdf8); transition: width 0.3s ease;"></div>
                    </div>
                </div>

                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 18px;">
                    <div style="background: rgba(0,0,0,0.3); padding: 12px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.08);">
                        <span style="color: #94a3b8; font-size: 0.85rem; display: block;">Başarıyla Tamamlanan Seferler</span>
                        <strong style="color: #4ade80; font-size: 1.3rem;">${tasks} Sefer</strong>
                    </div>
                    <div style="background: rgba(0,0,0,0.3); padding: 12px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.08);">
                        <span style="color: #94a3b8; font-size: 0.85rem; display: block;">Sıradaki Otobüs / Hat Keşfi</span>
                        <strong style="color: #38bdf8; font-size: 1rem;">${unlockTeaser}</strong>
                    </div>
                </div>

                <!-- Samimi Yol Arkadaşı Kutusu (Sınav veya not dili YOK) -->
                <div style="background: rgba(234, 179, 8, 0.12); border-left: 4px solid #eab308; padding: 14px 16px; border-radius: 0 8px 8px 0;">
                    <div style="font-weight: bold; color: #fde047; margin-bottom: 4px; font-size: 1rem;">👨‍✈️ Ümit Kaptan'dan Yol Arkadaşı Tavsiyeleri:</div>
                    <p style="color: #f1f5f9; font-size: 0.94rem; line-height: 1.5; margin: 0;">${companionAdvice}</p>
                </div>
            </div>
        `;

        const btnRead = document.getElementById('btn-seruven-read-speech');
        if (btnRead) {
            btnRead.addEventListener('click', () => {
                const speechText = `Kaptanlık Serüveniniz ve Macera Günlüğünüz. Mevcut dereceniz Seviye ${level}, ${title}. Toplam tecrübeniz ${xp} puan. Gelecek seviye için ${nextXP} puan gerekiyor. Tamamlanan sefer sayısı ${tasks}. ${unlockTeaser}. ${companionAdvice}`;
                if (typeof audio !== 'undefined' && audio.speak) {
                    audio.stopSpeech();
                    audio.speak(speechText);
                }
            });
        }

        if (typeof KeyboardNav !== 'undefined' && KeyboardNav.initForScreen) {
            KeyboardNav.initForScreen();
        }
    }

    playLesson(lessonId) {
        const lesson = this.tutorialLessons.find(l => l.id === lessonId);
        if (!lesson) return;
        if (typeof audio !== 'undefined') {
            if (audio.playSelect) audio.playSelect();
            audio.stopSpeech();
            const fullText = `${lesson.stageName}. ${lesson.title}. ${lesson.speech}`;
            audio.speak(fullText);
            if (typeof UI !== 'undefined' && UI.showToast) {
                UI.showToast(`🔊 ${lesson.title}`, 'info');
            }
        }
    }

    playFullTutorial() {
        if (typeof audio === 'undefined') return;
        if (audio.playSelect) audio.playSelect();
        audio.stopSpeech();

        const sequence = [
            "Mikyas Kaptanlık Akademisi Pedagojik Sürüş Eğitimi başlatılıyor. 4 gelişim aşamasındaki tüm dersler sırasıyla aktarılacaktır."
        ];
        this.tutorialLessons.forEach(l => {
            sequence.push(l.stageName + ". " + l.title + ". " + l.speech);
        });
        sequence.push("Tüm akademi dersleri tamamlandı. Öğrendiklerinizi sahada uygulayarak usta kaptanlığa terfi edebilirsiniz. Başarılar dilerim!");

        audio.speakSequence(sequence);
        if (typeof UI !== 'undefined' && UI.showToast) {
            UI.showToast("▶️ Pedagojik Sesli Eğitim Başlatıldı", "success");
        }
    }

    stopTutorialSpeech() {
        if (typeof audio !== 'undefined' && audio.stopSpeech) {
            audio.stopSpeech();
            if (typeof UI !== 'undefined' && UI.showToast) {
                UI.showToast("⏹️ Ses Susturuldu", "info");
            }
        }
    }

    toggleCopilot() {
        this.isCopilotEnabled = !this.isCopilotEnabled;
        try {
            localStorage.setItem('copilot_enabled', this.isCopilotEnabled ? 'true' : 'false');
        } catch(e) {}
        this.updateCopilotButtonText();

        const statusMsg = this.isCopilotEnabled 
            ? "Canlı Seyir Koçu ipuçları açıldı. Seyir esnasında asistan durak, kasis ve yolcu durumlarını sesli hatırlatacaktır."
            : "Canlı Seyir Koçu ipuçları kapatıldı. Seyir sırasında sadece kendi tecrübenizle ilerleyeceksiniz.";
        
        if (typeof audio !== 'undefined' && audio.speak) {
            audio.speak(statusMsg);
        }
        if (typeof UI !== 'undefined' && UI.showToast) {
            UI.showToast(this.isCopilotEnabled ? "🔔 Canlı Seyir Koçu Açık" : "🔕 Canlı Seyir Koçu Kapalı", "info");
        }
    }

    updateCopilotButtonText() {
        const btn = document.getElementById('btn-tutorial-toggle-copilot');
        if (btn) {
            btn.innerText = this.isCopilotEnabled ? "🔔 Canlı Seyir Koçu: Açık" : "🔕 Canlı Seyir Koçu: Kapalı";
            btn.style.color = this.isCopilotEnabled ? "#38bdf8" : "#94a3b8";
            btn.style.borderColor = this.isCopilotEnabled ? "#38bdf8" : "rgba(255,255,255,0.2)";
        }
    }

    initTutorialUI() {
        const btnOpen = document.getElementById('btn-open-tutorial');
        if (btnOpen) {
            btnOpen.addEventListener('click', () => this.openTutorialModal());
        }

        const btnHud = document.getElementById('btn-hud-tutorial');
        if (btnHud) {
            btnHud.addEventListener('click', () => this.openTutorialModal());
        }

        const btnClose = document.getElementById('btn-tutorial-modal-close');
        if (btnClose) {
            btnClose.addEventListener('click', () => this.closeTutorialModal());
        }

        const btnPlayAll = document.getElementById('btn-tutorial-play-all');
        if (btnPlayAll) {
            btnPlayAll.addEventListener('click', () => this.playFullTutorial());
        }

        const btnStop = document.getElementById('btn-tutorial-stop-speech');
        if (btnStop) {
            btnStop.addEventListener('click', () => this.stopTutorialSpeech());
        }

        const btnToggleCopilot = document.getElementById('btn-tutorial-toggle-copilot');
        if (btnToggleCopilot) {
            btnToggleCopilot.addEventListener('click', () => this.toggleCopilot());
        }

        // Akademi Sekmeleri Dinleyicileri
        const tabAll = document.getElementById('tab-acad-all');
        if (tabAll) tabAll.addEventListener('click', () => this.setAcademyTab('all'));

        const tabS1 = document.getElementById('tab-acad-stage1');
        if (tabS1) tabS1.addEventListener('click', () => this.setAcademyTab('stage1'));

        const tabS2 = document.getElementById('tab-acad-stage2');
        if (tabS2) tabS2.addEventListener('click', () => this.setAcademyTab('stage2'));

        const tabS3 = document.getElementById('tab-acad-stage3');
        if (tabS3) tabS3.addEventListener('click', () => this.setAcademyTab('stage3'));

        const tabS4 = document.getElementById('tab-acad-stage4');
        if (tabS4) tabS4.addEventListener('click', () => this.setAcademyTab('stage4'));

        const tabLab = document.getElementById('tab-acad-lab');
        if (tabLab) tabLab.addEventListener('click', () => this.setAcademyTab('lab'));

        const tabKarne = document.getElementById('tab-acad-karne') || document.getElementById('tab-acad-seruven');
        if (tabKarne) tabKarne.addEventListener('click', () => this.setAcademyTab('seruven'));

        const tabSeruven = document.getElementById('tab-acad-seruven');
        if (tabSeruven) tabSeruven.addEventListener('click', () => this.setAcademyTab('seruven'));

        this.updateCopilotButtonText();
    }

    toggleListening() {
        if (!this.recognition) {
            if (typeof UI !== 'undefined') UI.showToast("Tarayıcınız sesli asistanı desteklemiyor.", "error");
            return;
        }

        if (this.isListening) {
            this.recognition.stop();
        } else {
            try {
                this.recognition.start();
            } catch (e) {
                console.error("Asistan başlatılamadı:", e);
            }
        }
    }

    processCommand(command) {
        if (typeof Game === 'undefined' || typeof audio === 'undefined') return;

        // --- SESLİ ÖĞRETİCİ VE AKADEMİ KOMUTLARI ---
        if (command.includes("öğretici") || command.includes("nasıl oynanır") || command.includes("eğitim") || command.includes("yardım") || command.includes("rehber") || command.includes("oyunu öğret") || command.includes("dersler") || command.includes("tuşlar") || command.includes("kontroller") || command.includes("kurallar") || command.includes("akademi")) {
            if (command.includes("tüm") || command.includes("baştan sona") || command.includes("hepsini")) {
                this.playFullTutorial();
                return;
            }
            this.openTutorialModal();
            return;
        }

        // Kaptanlık Karnesi ve Seviye Sorgusu
        if (command.includes("karne") || command.includes("seviyem kaç") || command.includes("durumum ne") || command.includes("terfi") || command.includes("gelişim")) {
            this.openTutorialModal();
            this.setAcademyTab('karne');
            const level = Game.licenseLevel || 1;
            const xp = Game.playerXP || 0;
            const title = (typeof Game.getLicenseTitle === 'function') ? Game.getLicenseTitle() : 'Stajyer';
            audio.speak(`Kaptanlık gelişim karneniz açıldı. Mevcut dereceniz Seviye ${level}, ${title}. Toplam ${xp} tecrübe puanınız var.`);
            return;
        }

        // Seyir Koçu İpuçları Aç / Kapat
        if (command.includes("koç") || command.includes("rehberlik") || command.includes("asistan ipucu") || command.includes("ipuçları")) {
            if (command.includes("kapat") || command.includes("durdur") || command.includes("sustur")) {
                if (this.isCopilotEnabled) this.toggleCopilot();
                else audio.speak("Canlı Seyir Koçu zaten kapalı.");
                return;
            }
            if (command.includes("aç") || command.includes("etkinleştir") || command.includes("çalıştır")) {
                if (!this.isCopilotEnabled) this.toggleCopilot();
                else audio.speak("Canlı Seyir Koçu zaten açık.");
                return;
            }
        }

        // Bireysel Mekanik ve Kural Soruları
        if (command.includes("nasıl sürülür") || command.includes("araba nasıl sürülür") || command.includes("gaz nasıl") || command.includes("fren nasıl") || command.includes("direksiyon")) {
            this.playLesson('driving');
            return;
        }
        if (command.includes("kapı nasıl") || command.includes("kapılar nasıl") || command.includes("yolcu nasıl") || command.includes("durak işlemi")) {
            this.playLesson('stops');
            return;
        }
        if (command.includes("rampa nasıl") || command.includes("engelli") || command.includes("tekerlekli sandalye")) {
            this.playLesson('ramp');
            return;
        }
        if (command.includes("kasis") || command.includes("tümsek") || command.includes("hız sınırı")) {
            this.playLesson('bumps');
            return;
        }
        if (command.includes("farlar nasıl") || command.includes("far nasıl") || command.includes("gece sürüşü") || command.includes("silecekler nasıl")) {
            this.playLesson('lights_weather');
            return;
        }
        if (command.includes("kayıp eşya") || command.includes("teftiş") || command.includes("unutulan eşya")) {
            this.playLesson('lost_found');
            return;
        }
        if (command.includes("bagaj nasıl") || command.includes("valiz")) {
            this.playLesson('luggage');
            return;
        }
        if (command.includes("dakiklik") || command.includes("tarife") || command.includes("ibis nedir")) {
            this.playLesson('timetable');
            return;
        }
        if (command.includes("konfor nedir") || command.includes("konfor puanı")) {
            this.playLesson('comfort_ac');
            return;
        }
        if (command.includes("başarılar nedir") || command.includes("1500 başarı") || command.includes("rozetler nedir") || command.includes("durak albümü")) {
            this.playLesson('badges_collection');
            return;
        }

        // --- PUSULA VE YÖN SORGUSU ---
        if (command.includes("pusula") || command.includes("istikamet") || command.includes("hangi yön") || command.includes("yönüm")) {
            if (typeof CompassSystem !== 'undefined' && typeof CompassSystem.queryCompass === 'function') {
                CompassSystem.queryCompass();
            } else {
                const currentDir = (typeof CompassNav !== 'undefined') ? CompassNav.currentDirection : "Kuzey";
                audio.speak("Mevcut istikametiniz " + currentDir + ". Yön sorgulamak için Y tuşuna, yön değiştirmek için Shift ve Ok tuşlarına basabilirsiniz.");
            }
            return;
        }

        // --- SEFER MODLARI (ŞEHİR İÇİ & ŞEHİRLER ARASI BİRLEŞİK SEFERLER) ---
        if (command.includes("sefer") || command.includes("şehir içi") || command.includes("belediye") || command.includes("tekulaş") || command.includes("şehirlerarası") || command.includes("turne")) {
            audio.speak("Sefer güzergahları açılıyor.");
            if (document.getElementById('btn-start-city')) {
                document.getElementById('btn-start-city').click();
            }
            return;
        }

        // --- OTOBÜS GARAJI VE ARAÇ SEÇİMİ ---
        if (command.includes("garaj") || command.includes("otobüsler") || command.includes("filo") || command.includes("otobüs seç")) {
            if (typeof BusFleet !== 'undefined' && BusFleet.openModal) {
                BusFleet.openModal();
                return;
            }
        }
        if (command.includes("travego")) {
            if (typeof BusFleet !== 'undefined') {
                BusFleet.selectBus("mercedes_travego_16shd");
                return;
            }
        }
        if (command.includes("tourismo")) {
            if (typeof BusFleet !== 'undefined') {
                BusFleet.selectBus("mercedes_tourismo_16rhd");
                return;
            }
        }
        if (command.includes("setra")) {
            if (typeof BusFleet !== 'undefined') {
                BusFleet.selectBus("setra_topclass_s516");
                return;
            }
        }
        if (command.includes("körüklü") || command.includes("körük")) {
            if (typeof BusFleet !== 'undefined') {
                BusFleet.selectBus("mercedes_conecto_g");
                return;
            }
        }
        if (command.includes("conecto")) {
            if (typeof BusFleet !== 'undefined') {
                BusFleet.selectBus("mercedes_conecto_12m");
                return;
            }
        }
        if (command.includes("otokar") || command.includes("kent")) {
            if (typeof BusFleet !== 'undefined') {
                BusFleet.selectBus("otokar_kent_lf");
                return;
            }
        }
        if (command.includes("man") || command.includes("lions coach")) {
            if (typeof BusFleet !== 'undefined') {
                BusFleet.selectBus("man_lions_coach");
                return;
            }
        }
        if (command.includes("neoplan") || command.includes("cityliner")) {
            if (typeof BusFleet !== 'undefined') {
                BusFleet.selectBus("neoplan_cityliner");
                return;
            }
        }

        // --- AKILLI ROTA SİSTEMİ (NEREDEN ➔ NEREYE) ---
        if (command.includes("akıllı rota") || command.includes("nereden nereye") || command.includes("rota hesapla") || command.includes("hedef seç")) {
            if (typeof AkilliRotaSistemi !== 'undefined' && AkilliRotaSistemi.openModal) {
                AkilliRotaSistemi.openModal();
                return;
            }
        }

        // Akıllı Sistem (Doğal Dil & Popüler Merkezler & Sefer Önerisi)
        if (typeof AkilliSistem !== 'undefined' && AkilliSistem.smartTripRequest) {
            const handled = AkilliSistem.smartTripRequest(command);
            if (handled) return;
        }

        // Doğrudan sesle kalkış ve varış söyleme: "spor salonundan tepekente git", "valilikten yüzüncü yıla" vb.
        const smartMatch = command.match(/(?:nereden\s+)?(.+?)(?:'dan|'den|'tan|'ten|dan|den|tan|ten)\s+(?:nereye\s+)?(.+?)(?:'ya|'ye|'a|'e|ya|ye|a|e)\s*(?:git|sefer|sur|sür)?$/i);
        if (smartMatch && smartMatch[1] && smartMatch[2] && !command.includes("seviye") && !command.includes("motor")) {
            const fromQuery = smartMatch[1].trim();
            const toQuery = smartMatch[2].trim();
            if (fromQuery.length > 2 && toQuery.length > 2) {
                if (typeof AkilliRotaSistemi !== 'undefined' && AkilliRotaSistemi.baslat) {
                    const started = AkilliRotaSistemi.baslat(fromQuery, toQuery);
                    if (started) return;
                }
            }
        }

        // PEDAGOJİK SEVİYE KONTROLÜ HELPER
        const checkVoiceRouteAccess = (routeId) => {
            if (typeof Game !== 'undefined' && typeof Game.isRouteAccessible === 'function') {
                const res = Game.isRouteAccessible(routeId);
                if (!res.allowed) {
                    if (typeof audio !== 'undefined' && audio.playWarning) {
                        try { audio.playWarning(); } catch(e) {}
                    }
                    if (typeof audio !== 'undefined' && audio.speak) {
                        audio.speak(res.reason);
                    }
                    if (typeof UI !== 'undefined' && UI.showToast) {
                        UI.showToast(res.reason, "warning");
                    }
                    return false;
                }
            }
            return true;
        };

        // --- ŞEHİR İÇİ ANA ARTER HATTI (HAT 2/7) ---
        if (command.includes("2/7") || command.includes("iki yedi") || command.includes("yüzüncü yıl") || command.includes("tepekent") || command.includes("araştırma hastane")) {
            const isDonus = command.includes("dönüş") || command.includes("geri");
            const targetId = isDonus ? "tekulas_152_2_7_donus" : "tekulas_152_2_7";
            const r2_7 = (typeof routesData !== 'undefined' && routesData[targetId]) || (typeof window !== 'undefined' && window.getTekulasLineById && window.getTekulasLineById(targetId));
            if (r2_7) {
                if (!checkVoiceRouteAccess(r2_7.id)) return;
                if (typeof routesData !== 'undefined') routesData[r2_7.id] = r2_7;
                audio.speak("TEKULAŞ Hat 2/7 " + (isDonus ? "Tepekent Yüzüncü Yıl dönüş" : "Yüzüncü Yıl Tepekent gidiş") + " ana arter hattı başlatılıyor. 43 duraklık güzergah devrede.");
                Game.startRoute(r2_7.id);
                return;
            }
        }

        // --- İLÇE HATLARI (ÇETİN SOKAK, 48 VE 26 NUMARALI HATLARI) ---
        if (command.includes("süleymanpaşa") || command.includes("suleymanpasa") || command.includes("kampüs") || command.includes("değirmenaltı")) {
            if (typeof SuleymanpasaNavigasyon !== 'undefined') {
                if (command.includes("otogar") || command.includes("terminal")) {
                    audio.speak("Süleymanpaşa Değirmenaltı Kampüs'ten Yeni Otogar Terminaline formüle bağlı şehir içi sefer başlatılıyor.");
                    SuleymanpasaNavigasyon.baslat("kampus", "otogar");
                    return;
                }
                if (command.includes("hastane") || command.includes("şehir hastanesi")) {
                    audio.speak("Süleymanpaşa Tarihi Merkez Çarşı'dan Şehir Hastanesine sefer başlatılıyor.");
                    SuleymanpasaNavigasyon.baslat("hukumet caddesi", "sehir hastanesi");
                    return;
                }
            }
        }
        if (command.includes("çetin sokak") || command.includes("cetin sokak")) {
            if (typeof VelimeseNavigasyon !== 'undefined') {
                if (command.includes("toki") || command.includes("meydan") || command.includes("istasyon") || command.includes("çarşı")) {
                    const toTarget = command.includes("toki") ? "Velimeşe TOKİ 233. Sokak" : 
                                     (command.includes("istasyon") ? "Velimeşe TCDD Tren İstasyonu" : 
                                     (command.includes("çarşı") ? "Çarşı Caddesi" : "Velimeşe Merkez Meydanı"));
                    audio.speak("Velimeşe içi Çetin Sokak'tan " + toTarget + " noktasına 100 sokak seferi başlatılıyor.");
                    VelimeseNavigasyon.baslat("Çetin Sokak", toTarget);
                    return;
                }
            }
            audio.speak("TEKULAŞ Hat 48/R Velimeşe Çetin Sokak Mahalle Ring Hattı devreye alınıyor.");
            if (typeof ilceRotalari !== 'undefined' && ilceRotalari["Tekirdağ"]) {
                const rRing = ilceRotalari["Tekirdağ"].find(r => r.id === "hat_velimese_cetin_ring");
                if (rRing) {
                    routesData[rRing.id] = rRing;
                    Game.startRoute(rRing.id);
                    return;
                }
            }
        }
        if (command.includes("velimeşe çorlu") || command.includes("48") || command.includes("kırk sekiz")) {
            audio.speak("TEKULAŞ 48 numaralı Velimeşe Çorlu hattı devreye alınıyor.");
            if (typeof ilceRotalari !== 'undefined' && ilceRotalari["Tekirdağ"]) {
                const r48 = ilceRotalari["Tekirdağ"].find(r => r.hatNo === "48");
                if (r48) {
                    if (!checkVoiceRouteAccess(r48.id)) return;
                    routesData[r48.id] = r48;
                    Game.startRoute(r48.id);
                    return;
                }
            }
        }
        if (command.includes("80") || command.includes("seksen") || command.includes("hat 80")) {
            audio.speak("80 numaralı hat sistemden ve seferlerden tamamen kaldırılmıştır. Süleymanpaşa Saray seferi için 26 numaralı hat başlatılıyor.");
            if (typeof ilceRotalari !== 'undefined' && ilceRotalari["Tekirdağ"]) {
                const r26 = ilceRotalari["Tekirdağ"].find(r => r.hatNo === "26");
                if (r26) {
                    if (!checkVoiceRouteAccess(r26.id)) return;
                    routesData[r26.id] = r26;
                    routesData["hat_26_suleymanpasa_saray"] = r26;
                    Game.startRoute(r26.id);
                    return;
                }
            }
        }
        if (command.includes("saray içi") || command.includes("saray ring") || command.includes("hat 35") || command.includes("otuz beş") || command.includes("saray mahalle")) {
            audio.speak("Hat 35 Saray Şehir İçi 25 duraklık belediye ring seferi başlatılıyor.");
            if (typeof Game !== 'undefined' && Game.startRoute) {
                Game.startRoute("hat_35_saray_ici");
                return;
            }
        }
        if (command.includes("saray ekspres") || command.includes("ekspres saray") || command.includes("62") || command.includes("altmış iki") || command.includes("direkt saray")) {
            audio.speak("Süleymanpaşa Saray 62 kilometre direkt ekspres seferi başlatılıyor.");
            if (typeof Game !== 'undefined' && Game.startRoute) {
                if (!checkVoiceRouteAccess("hat_saray_ekspres")) return;
                Game.startRoute("hat_saray_ekspres");
                return;
            }
        }
        if (command.includes("saray") || command.includes("26") || command.includes("yirmi altı") || command.includes("226") || command.includes("iki yüz yirmi altı")) {
            audio.speak("TEKULAŞ 26 numaralı Süleymanpaşa Saray hattı devreye alınıyor.");
            if (typeof ilceRotalari !== 'undefined' && ilceRotalari["Tekirdağ"]) {
                const r26 = ilceRotalari["Tekirdağ"].find(r => r.hatNo === "26" || r.hatNo === "226");
                if (r26) {
                    routesData[r26.id] = r26;
                    routesData["hat_26_suleymanpasa_saray"] = r26;
                    routesData["hat_226_suleymanpasa_saray"] = r26;
                    Game.startRoute(r26.id);
                    return;
                }
            }
        }
        
        // --- ARAÇ KONTROLÜ ---
        if (command.includes("motor") || command.includes("çalıştır") || command.includes("kontak")) {
            if (!audio.isEngineRunning) {
                const btn = document.getElementById('start-engine-btn');
                if (btn) btn.click();
            } else {
                audio.speak("Motor zaten çalışıyor.");
            }
            return;
        }

        if (command.includes("silecek") || command.includes("camı sil") || command.includes("camları sil")) {
            audio.toggleWipers();
            return;
        }

        if (command.includes("korna") || command.includes("düt")) {
            audio.playHorn();
            setTimeout(() => { if (audio.stopHorn) audio.stopHorn(); }, 1500);
            return;
        }

        if (command.includes("ön kapı") || command.includes("önü aç")) {
            Game.toggleFrontDoor();
            return;
        }

        if (command.includes("arka kapı") || command.includes("arkayı aç")) {
            Game.toggleRearDoor();
            return;
        }

        if (command.includes("kapı") && (command.includes("aç") || command.includes("kapat")) && !command.includes("bagaj")) {
            Game.toggleFrontDoor();
            setTimeout(() => Game.toggleRearDoor(), 500);
            return;
        }

        // --- NAVİGASYON BİLGİSİ ---
        if (command.includes("hız") || command.includes("kaçla") || command.includes("yavaş mı")) {
            audio.speak(`Şu anki hızımız saatte ${Math.floor(Game.speed)} kilometre.`);
            return;
        }

        if (command.includes("neredeyiz") || command.includes("mesafe") || command.includes("ne kadar kaldı")) {
            let distance = Math.floor(Game.currentDistanceToNext);
            let unit = "metre";
            if (distance > 1000) {
                distance = (distance / 1000).toFixed(1);
                unit = "kilometre";
            }
            audio.speak(`Hedefe ${distance} ${unit} kaldı.`);
            return;
        }

        if (command.includes("durak") || command.includes("nereye") || command.includes("hedef")) {
            if (Game.activeRouteData && Game.activeRouteData.stops && Game.activeRouteData.stops[Game.currentStopIndex]) {
                const stopName = Game.activeRouteData.stops[Game.currentStopIndex].name;
                audio.speak(`Sıradaki hedefimiz: ${stopName}.`);
            } else {
                audio.speak("Şu an aktif bir rotada değiliz.");
            }
            return;
        }
        
        if (command.includes("zaman") || command.includes("saat")) {
            const h = Math.floor(Game.clockMinutes / 60).toString().padStart(2, '0');
            const m = Math.floor(Game.clockMinutes % 60).toString().padStart(2, '0');
            audio.speak(`Oyun saati şu an ${h}:${m}.`);
            return;
        }

        // --- KLİMA KONTROLÜ ---
        if (command.includes("klima") || command.includes("sıcak") || command.includes("soğuk") || command.includes("üşü") || command.includes("yan")) {
            if (command.includes("kaç derece") || command.includes("sıcaklık ne") || command.includes("durumu")) {
                const msg = `Dış sıcaklık ${Game.temperature} derece, otobüs içi ${Math.floor(Game.busTemperature)} derece. ${Game.isACOn ? "Klima açık." : "Klima kapalı."}`;
                audio.speak(msg);
                return;
            }

            if (command.includes("aç") || command.includes("çalıştır") || command.includes("sıcak") || command.includes("soğuk") || command.includes("üşü") || command.includes("yan")) {
                if (!Game.isACOn) {
                    Game.isACOn = true;
                    audio.speak("Klima açıldı. Hedef sıcaklık 22 derece.");
                    if (typeof UI !== 'undefined') UI.showToast("Klima Açıldı", "info");
                } else {
                    audio.speak("Klima zaten açık.");
                }
                return;
            }

            if (command.includes("kapat") || command.includes("durdur")) {
                if (Game.isACOn) {
                    Game.isACOn = false;
                    audio.speak("Klima kapatıldı.");
                    if (typeof UI !== 'undefined') UI.showToast("Klima Kapatıldı", "info");
                } else {
                    audio.speak("Klima zaten kapalı.");
                }
                return;
            }
        }

        // Anlaşılamadı
        audio.speak("Anlayamadım. Kaptanlık Akademisi ve kurallar için 'akademi' diyebilir veya F1 tuşuna basabilirsiniz.");
    }
}

// Global olarak başlat
document.addEventListener('DOMContentLoaded', () => {
    window.voiceAssistant = new VoiceAssistant();
    if (window.voiceAssistant.initTutorialUI) {
        window.voiceAssistant.initTutorialUI();
    }
});
