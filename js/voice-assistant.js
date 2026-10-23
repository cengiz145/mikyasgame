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

        // 4 Aşamada Toplam 12 Sade ve Pratik Sürüş Dersi (Tamamen Oyuncuya Oyunu Anlatan Dil)
        this.tutorialLessons = [
            // 1. BÖLÜM: DİREKSİYON BAŞINA GEÇİŞ
            {
                id: 'driving',
                soundDesc: '🔑 Marş, Dizel Rölanti, Gaza Basma ve Havalı Fren',
                soundIcon: '🔑',
                stage: 1,
                stageName: '1. Bölüm: Direksiyon Başına Geçiş',
                title: '1. Motoru Çalıştırma, Gaz ve Fren',
                keys: 'M veya Boşluk (Motor), W (Gaz), S (Fren), A ve D (Direksiyon), R (Hız)',
                tip: 'Kontağı açmak için M tuşuna bas, sonra W ile gaza basıp ilerle.',
                speech: 'Otobüsü sürmek çok kolay! Önce M veya Boşluk tuşuna basarak motoru çalıştırırsın. W tuşuna basılı tuttuğunda gaza basarsın ve otobüs hızlanır. Durmak veya yavaşlamak için S tuşuna basarsın. A tuşu sola, D tuşu sağa döner. Ne kadar hızlı gittiğini öğrenmek için de R tuşuna basabilirsin.'
            },
            {
                id: 'stops',
                soundDesc: '🚪 Pnömatik Kapılar ve 💳 Akbil Kart Okuma',
                soundIcon: '🚪',
                stage: 1,
                stageName: '1. Bölüm: Direksiyon Başına Geçiş',
                title: '2. Duraklarda Yolcu Alma ve İndirme',
                keys: '1 (Ön Kapı), 2 (Arka Kapı)',
                tip: 'Durakta tam durduktan sonra 1 ile ön kapıyı, 2 ile arka kapıyı aç.',
                speech: 'Durağa geldiğinde S tuşuna basıp tam dur. 1 tuşuna basarak ön kapıyı aç, yeni binen yolcular kartlarını okutsun. 2 tuşuna basarak arka kapıyı aç, inecek yolcular insin. Herkes binip indikten sonra yine 1 ve 2 tuşlarıyla kapıları kapat. Kapılar açıkken otobüs gitmez, kapıları kapatıp gaza basabilirsin.'
            },
            {
                id: 'compass',
                soundDesc: '🧭 Pusula ve Yön Bildirim Çanı',
                soundIcon: '🧭',
                stage: 1,
                stageName: '1. Bölüm: Direksiyon Başına Geçiş',
                title: '3. Yönünü Bulma ve Pusula',
                keys: 'Y (Hangi Yöne Gidiyorum?), Shift + Ok Tuşları (Yön Değiştir)',
                tip: 'Nereye gittiğini merak ettiğinde Y tuşuna basarak yönünü öğrenebilirsin.',
                speech: 'Nereye doğru gittiğini öğrenmek için Y tuşuna bas. Oyun sana Kuzey, Güney, Doğu veya Batı diye sesli söyler. Dönüş yapacağın zaman Shift tuşuyla birlikte Yön Oklarına basarak otobüsün yönünü çevirebilirsin.'
            },

            {
                id: 'cockpit_navigation',
                soundDesc: '🔔 Üç Tonlu Durak Anons Gongu',
                soundIcon: '🔔',
                stage: 1,
                stageName: '1. Bölüm: Direksiyon Başına Geçiş',
                title: '3.1. Akıllı Hat ve Durak Navigasyonu',
                keys: 'N (Sıradaki Durak), Ctrl + N / Shift + N (Sefer Sonu & Toplam Kalan Hat)',
                tip: 'N ile sıradaki durağı, Ctrl+N ile son durağı ve toplam kalan mesafeyi dinle.',
                speech: 'Sürüş sırasında dilediğin an N tuşuna basarak sıradaki durağın adını, kalan mesafeyi, tahmini varış süresini ve yönünü öğrenebilirsin. Ctrl ve N veya Shift ve N tuşlarına basarak da seferin son durağını, kalan toplam hat kilometresini, kalan durak sayısını ve toplam tahmini varış süresini dinleyebilirsin.'
            },

            // 2. BÖLÜM: YOLCULARIMIZ VE DURAKLAR
            {
                id: 'ramp',
                soundDesc: '🦼 Yana Yatma (Kneeling) ve 🛹 Freesound Engelli Rampası',
                soundIcon: '🛹',
                stage: 2,
                stageName: '2. Bölüm: Yolcularımız ve Duraklar',
                title: '4. Tekerlekli Sandalyeli Yolcular ve Rampa',
                keys: 'K (Otobüsü Sağa Yatır), U veya R (Engelli Rampası)',
                tip: 'Tekerlekli sandalyeli yolcu görünce rampayı aç, yolcu binince kapat.',
                speech: 'Durakta tekerlekli sandalyeli veya yaşlı bir yolcumuz bekliyorsa oyun sana haber verir. Durup kapıyı açtıktan sonra K tuşuna basarak otobüsü kaldırıma doğru eğebilirsin. U veya R tuşuna basınca rampa açılır ve yolcumuz biner. Yolcumuz binince tekrar U veya R tuşuna basıp rampayı kapatırsın ve yola devam edersin.'
            },
            {
                id: 'bumps',
                soundDesc: '⚡ Kasis Darbe Sesi ve 🎶 Voith Retarder Düdüğü',
                soundIcon: '⚡',
                stage: 2,
                stageName: '2. Bölüm: Yolcularımız ve Duraklar',
                title: '5. Tümsekler ve Yolcu Memnuniyeti',
                keys: 'S (Tümsekte Yavaşla), C (Yolcu Memnuniyeti)',
                tip: 'Kasis görünce hızını 30 km/s altına düşür ki yolcular sarsılmasın.',
                speech: 'Yolda kasis veya tümsek uyarısı duyduğunda S tuşuna basarak hızını 30 un altına düşür. Çok hızlı geçersen yolcular sarsılır ve puan kaybedersin! Yolcuların senden ne kadar memnun olduğunu görmek için C tuşuna basabilirsin.'
            },
            {
                id: 'comfort_ac',
                soundDesc: '🪟 Freesound Elektrikli Cam Açma & Kapatma',
                soundIcon: '🪟',
                stage: 2,
                stageName: '2. Bölüm: Yolcularımız ve Duraklar',
                title: '6. Klima ve Şoför Camı',
                keys: 'K (Klima), Home (Cam Aç), End (Cam Kapat)',
                tip: 'Home ile camı aç, End ile kapat. Temiz hava kokpite dolar.',
                speech: 'Sıcak yaz günlerinde veya kış soğuğunda yolcuların üşümemesi ya da bunalmaması için K tuşuna basarak klimayı açıp kapatabilirsin. Temiz hava almak istediğinde Home tuşuna basarak şoför camını açabilir, End tuşuna basarak kapatabilirsin.'
            },

            // 3. BÖLÜM: GECE, YAĞMUR VE SEFER KURALLARI
            {
                id: 'lights_weather',
                soundDesc: '💡 Kokpit Far Anahtarı ve 🌧️ Silecek Süpürme',
                soundIcon: '💡',
                stage: 3,
                stageName: '3. Bölüm: Gece, Yağmur ve Sefer Kuralları',
                title: '7. Farlar, Yağmur ve Silecekler',
                keys: 'F (Farlar), Shift + W (Silecek), Shift + T (Saat ve Hava)',
                tip: 'Karanlıkta F ile farları yak, yağmurda Shift+W ile silecekleri çalıştır.',
                speech: 'Akşam olduğunda, tünellere girdiğinde veya hava karardığında F tuşuna basarak farlarını yak. Yağmurlu ve karlı havalarda önünü rahat görebilmek için Shift ve W tuşlarına basarak silecekleri çalıştır. Saati ve dışarıdaki hava durumunu öğrenmek için de Shift ve T tuşlarına bas.'
            },
            {
                id: 'timetable',
                soundDesc: '⏱️ Takograf / Hat Ekranı Dijital Bildirim',
                soundIcon: '⏱️',
                stage: 3,
                stageName: '3. Bölüm: Gece, Yağmur ve Sefer Kuralları',
                title: '8. Saate Bakma ve Ön Tabela',
                keys: 'Z (Geç mi Kaldım?), I (Ön Tabela)',
                tip: 'Zamana bakmak için Z tuşuna, ön tabelayı dinlemek için I tuşuna bas.',
                speech: 'Seferde geç mi kaldın yoksa erken mi gidiyorsun öğrenmek için Z tuşuna bas. Otobüsün önündeki ışıklı tabelada hangi hatta gittiğin yazar; tabelada ne yazdığını dinlemek için de I tuşuna basabilirsin.'
            },
            {
                id: 'lost_found',
                soundDesc: '🪙 Bahşiş ve Ödül Şıngırtısı',
                soundIcon: '🪙',
                stage: 3,
                stageName: '3. Bölüm: Gece, Yağmur ve Sefer Kuralları',
                title: '9. Son Durak ve Unutulan Eşyalar',
                keys: 'J (Otobüse Göz At)',
                tip: 'Son durakta herkes indikten sonra koltukları kontrol edip eşyaları topla.',
                speech: 'Hattın son durağına gelip tüm yolcular indikten sonra seferin tamamlanır. Seferi bitirmeden önce J tuşuna basarak koltukların arasına bak. Yolcuların unuttuğu telefon veya çantaları bulursan ekstra puan ve bahşiş kazanırsın!'
            },

            // 4. BÖLÜM: UZUN YOL VE USTA ŞOFÖRLÜK
            {
                id: 'luggage',
                soundDesc: '🧳 Havalı Bagaj Kapağı Pnömatik Açılış & Kapanış',
                soundIcon: '🧳',
                stage: 4,
                stageName: '4. Bölüm: Uzun Yol ve Usta Şoförlük',
                title: '10. Şehirlerarası Sefer ve Valizler',
                keys: 'P (Bagaj Kapağı)',
                tip: 'Yolcuların valizleri için durakta P tuşuna basıp bagajı aç.',
                speech: 'Şehirlerarası sefere çıktığında yolcuların büyük valizleri olur. Durakta durunca P tuşuna basarak bagaj kapağını açarsın. Valizler yerleşince tekrar P tuşuna basarak kapağı kapatırsın.'
            },
            {
                id: 'badges_collection',
                soundDesc: '🏆 Madalya & Kupa Zafer Fanfarı',
                soundIcon: '🏆',
                stage: 4,
                stageName: '4. Bölüm: Uzun Yol ve Usta Şoförlük',
                title: '11. 1500 Başarı ve Keşfedilen Duraklar',
                keys: 'Menüde Başarılar Sekmesi, K (Keşfedilen Duraklar)',
                tip: '1500 farklı göreve bakarak sıradaki hedefini seçebilirsin.',
                speech: 'Oyunda tam 1500 farklı görev ve madalya seni bekliyor! Menüden Başarılar sekmesine girip sıradaki görevini görebilir veya rastgele bir hedef seçtirebilirsin. Yolda giderken K tuşuna basarak şu ana kadar kaç farklı durak keşfettiğini de öğrenebilirsin.'
            },
            {
                id: 'voice_guide',
                soundDesc: '🎙️ Telsiz Bas-Konuş ve Mandal Sesi',
                soundIcon: '🎙️',
                stage: 4,
                stageName: '4. Bölüm: Uzun Yol ve Usta Şoförlük',
                title: '12. Sesli Asistanla Konuşma',
                keys: 'V (Mikrofon)',
                tip: 'Direksiyonu bırakmadan sesli olarak soru sorabilir ve komut verebilirsin.',
                speech: 'Sürüş sırasında elini klavyeden kaldırmadan V tuşuna basarak benimle doğrudan konuşabilirsin. Hızım kaç, neredeyiz, farları yak, klimayı aç veya nasıl oynanır demen yeterlidir.'
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
                    if (typeof Multiplayer !== 'undefined' && typeof Multiplayer.startVoiceRadio === 'function') {
                        Multiplayer.startVoiceRadio();
                    } else {
                        this.toggleListening();
                    }
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

        const welcomeMsg = "Otobüs Sürüş Rehberi açıldı. Hiç zor değil; adım adım tuşlara basarak otobüsü çalıştırmayı ve sürmeyi birlikte öğreneceğiz. Şimdi birinci adımla başlayalım.";
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
            audio.speak("Sürüş rehberi kapatıldı.");
        }
        if (typeof KeyboardNav !== 'undefined' && KeyboardNav.initForScreen) {
            KeyboardNav.initForScreen();
        }
    }

    setAcademyTab(tabId) {
        this.currentStageFilter = tabId;
        this.renderTutorialContent();
    }

    renderTutorialContent() {
        const listEl = document.getElementById('tutorial-lessons-list');
        const seruvenContainer = document.getElementById('tutorial-seruven-container') || document.getElementById('tutorial-karne-container');
        const labContainer = document.getElementById('tutorial-lab-container');
        const compContainer = document.getElementById('tutorial-company-container');
        if (!listEl) return;

        // Sekme butonlarının aktiflik stilini güncelle
        const tabs = ['company', 'lab', 'all', 'stage1', 'stage2', 'stage3', 'stage4', 'seruven', 'karne'];
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

        // 0. ŞİRKET YÖNETİMİ, 6 YASAL BİNA VE ÖN MUHASEBE REHBERİ
        if (this.currentStageFilter === 'company') {
            if (labContainer) labContainer.style.display = 'none';
            if (seruvenContainer) seruvenContainer.style.display = 'none';
            listEl.style.display = 'none';
            if (compContainer) {
                compContainer.style.display = 'block';
                this.renderCompanyGuide();
            }
            return;
        } else {
            if (compContainer) compContainer.style.display = 'none';
        }
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

            btn.setAttribute('aria-label', `${lesson.stageName}. ${lesson.title}. Tuşlar: ${lesson.keys}. İpucu: ${lesson.tip}. Dinlemek için Enter'a basınız.`);

            btn.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
                    <div>
                        <span style="font-size: 0.78rem; color: #a7f3d0; text-transform: uppercase; letter-spacing: 1px; display: block;">${lesson.stageName}</span>
                        <strong style="color: #34d399; font-size: 1.1rem;">${lesson.title}</strong>
                    </div>
                    <span style="font-size: 0.85rem; color: #a7f3d0; background: rgba(16, 185, 129, 0.2); padding: 4px 10px; border-radius: 4px;">▶ Dinle</span>
                </div>
                <div style="background: rgba(15, 23, 42, 0.6); border-left: 3px solid #38bdf8; padding: 6px 10px; border-radius: 4px; font-size: 0.86rem; color: #38bdf8;">
                    💡 <strong>Oyun İpucu:</strong> ${lesson.tip}
                </div>
                <div style="font-size: 0.88rem; color: #fde047;"><strong>Tuşlar:</strong> ${lesson.keys}</div>

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
    // ADIM ADIM REHBERLİ SÜRÜŞ EĞİTİMİ (TERİMSİZ, EN ANLAŞILIR OYUN DİLİ)
    // =========================================================================

    renderCompanyGuide() {
        const container = document.getElementById('tutorial-company-container');
        if (!container) return;

        container.innerHTML = `
        <div style="background: linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.95)); border: 2px solid #ca8a04; border-radius: 12px; padding: 18px 22px; color: #fff;">
            
            <!-- BAŞLIK -->
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1.5px solid rgba(250, 204, 21, 0.3); padding-bottom: 12px; margin-bottom: 16px; flex-wrap: wrap; gap: 10px;">
                <div>
                    <h3 style="margin: 0; color: #facc15; font-size: 1.35rem; display: flex; align-items: center; gap: 8px;">
                        <span>🏢</span> <span>Şirket Yönetimi ve 7 Temel Tesis Rehberi</span>
                    </h3>
                    <p style="margin: 4px 0 0 0; color: #94a3b8; font-size: 0.88rem;">
                        Şirketin operasyonel maliyetlerini düşüren, kapasitesini artıran ve gelirini katlayan 7 temel bina ve tesisin işlevleri.
                    </p>
                </div>
                <button class="modern-btn btn-read-section nav-item" data-text="Şirket Yönetimi, 7 Temel Tesis ve Kâr Etme Rehberi. Bu kılavuzda şirket kurmanın neden hayati olduğunu, pasif gelirle kâr etmenin 5 kısayolunu, 7 temel tesis binasını ve başarılı filo yönetimi taktiklerini öğreneceksiniz." style="padding: 8px 16px; background: linear-gradient(135deg, #059669, #047857); border: 1.5px solid #10b981; color: #fff; font-weight: bold; border-radius: 8px; cursor: pointer;">
                    ▶️ Tüm Bölümü Sesli Dinle
                </button>
            </div>

            <!-- ÖNEMLİ KURAL NOTU -->
            <div style="background: rgba(202, 138, 4, 0.15); border: 1.5px solid #ca8a04; border-radius: 8px; padding: 12px 16px; margin-bottom: 16px; color: #fef08a; font-size: 0.9rem;">
                💡 <strong>Önemli Kural:</strong> Şirket Yönetimine <strong>sadece Ana Menü'deki 5. buton ("🏢 Şirket Yönetimi")</strong> üzerinden erişebilirsiniz. Sürüş güvenliği ve odaklanmanız için sefer esnasında şirket menüsü açılamaz; tüm kararlarınızı ana menüde sakin bir şekilde alabilirsiniz.
            </div>

            <!-- BÖLÜM 1: ŞİRKET NEDEN ÖNEMLİ VE NEDEN KURMALIYIM? -->
            <div style="background: linear-gradient(135deg, rgba(202, 138, 4, 0.2), rgba(15, 23, 42, 0.85)); border: 1.5px solid #eab308; border-radius: 10px; padding: 16px; margin-bottom: 16px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                    <h4 style="color: #facc15; margin: 0; font-size: 1.2rem; display: flex; align-items: center; gap: 8px;">
                        <span>👑</span> <span>1. Şirket Neden Önemli ve Neden Şirket Kurmalıyım?</span>
                    </h4>
                    <button class="modern-btn btn-read-section nav-item" data-text="Şirket neden önemlidir ve neden şirket kurmalısınız? Tek başınıza kaptanlık yaparsanız yalnızca direksiyon başındayken para kazanırsınız, mazotu ve tamiri piyasa fiyatından ödersiniz. Şirket sahibi olduğunuzda ise dört büyük güce sahip olursunuz. Birincisi pasif gelir: İşe aldığınız şoförler siz dinlenirken bile arka planda durmaksızın sefer yapar ve şirket kasanıza para akıtır. İkincisi giderleri sıfırlama gücü: Kendi akaryakıt istasyonunuzla depoyu bedavaya doldurur, kendi tamirhanenizle masrafları yüzde altmış beş düşürürsünüz. Üçüncüsü tavan bilet ve kargo geliri: Yazıhaneleriniz sayesinde biletleri yüzde otuz daha pahalıya satar ve bagaj kargosundan binlerce lira ek temettü alırsınız. Dördüncüsü holdingleşme: Şirketiniz büyüdükçe seviyeniz artar ve kazancınız katlanır." style="padding: 6px 12px; background: rgba(234,179,8,0.25); border: 1px solid #eab308; color: #fef08a; font-size: 0.85rem; border-radius: 6px; cursor: pointer;">
                        ▶ Neden Şirket? Dinle
                    </button>
                </div>
                <div style="color: #cbd5e1; font-size: 0.88rem; line-height: 1.55;">
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 12px; margin-top: 8px;">
                        <div style="background: rgba(0,0,0,0.4); padding: 12px; border-radius: 8px; border-left: 3px solid #ef4444;">
                            <strong style="color: #fca5a5;">❌ Tek Başına (Bireysel) Kaptan Olmak:</strong><br>
                            Yalnızca kendi sürdüğünüz sefer kadar para kazanırsınız. Direksiyon başında değilseniz geliriniz <strong>0 ₺</strong>'dir. Mazotu, bakımı ve araç yıkamasını piyasadaki en yüksek fiyattan cepten ödersiniz.
                        </div>
                        <div style="background: rgba(0,0,0,0.4); padding: 12px; border-radius: 8px; border-left: 3px solid #22c55e;">
                            <strong style="color: #4ade80;">✅ Şirket Sahibi (Patron) Olmanın 4 Gücü:</strong><br>
                            • <strong>1. Pasif Gelir (Otomatik Hasılat):</strong> İstihdam ettiğiniz kaptanlar siz dinlenirken veya başka bir hatta sürüş yaparken arka planda kesintisiz sefer icra eder ve şirket kasanıza düzenli gelir aktarır.<br>
                            • <strong>2. Giderleri Sıfırlama Gücü:</strong> Kendi tesisleriniz sayesinde akaryakıt ikmalini <strong>0 ₺ (Bedelsiz)</strong> yapar, bakım masraflarını %65 oranında düşürürsünüz.<br>
                            • <strong>3. Tavan Bilet & Emanet Kargo Geliri:</strong> Terminal yazıhaneleriniz sayesinde biletleri tavan fiyattan (%30 daha yüksek) satar, bagaj kargo taşımacılığından sefer başı binlerce lira ek gelir sağlarsınız.<br>
                            • <strong>4. Holding Olma:</strong> Şirket seviyeniz arttıkça piyasa itibarınız ve gelir çarpanlarınız katlanır.
                        </div>
                    </div>
                </div>
            </div>

            <!-- BÖLÜM 2: ŞİRKET KURMA VE ÇALIŞMA MODELLERİ -->
            <div style="background: rgba(0,0,0,0.3); border-radius: 10px; padding: 14px; margin-bottom: 16px; border: 1px solid rgba(255,255,255,0.08);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                    <h4 style="color: #38bdf8; margin: 0; font-size: 1.1rem;">2. Şirket Kurma ve Çalışma Modelleri</h4>
                    <button class="modern-btn btn-read-section nav-item" data-text="Şirket Kurma ve Çalışma Modelleri. Oyunda iki farklı çalışma şekli bulunur. İsterseniz kendi otobüs firmanızı kurup araç ve şoför yönetebilir, sefer gelirlerini toplayabilirsiniz. İsterseniz mevcut kurumsal firmalara katılarak sabit günlük maaş ve sefer primi karşılığında kaptan şoför olarak görev yapabilirsiniz." style="padding: 4px 10px; background: rgba(56,189,248,0.2); border: 1px solid #38bdf8; color: #7dd3fc; font-size: 0.8rem; border-radius: 6px; cursor: pointer;">▶ Dinle</button>
                </div>
                <div style="color: #cbd5e1; font-size: 0.88rem; line-height: 1.5; margin: 0;">
                    • <strong>Kendi Şirketinizi Kurmak:</strong> Kendi otobüs firmanızı açarak filo kurabilir, şoför istihdam edebilir ve sefer gelirlerini yönetebilirsiniz. Bilet hasılatını şirket kasası ile kişisel bütçeniz arasında belirlediğiniz oranda paylaştırabilirsiniz (Örnek: %50 / %50).<br>
                    • <strong>Bağımsız Serbest Kaptan Olarak Çalışmak:</strong> Şirket kurma veya şirket işletme riski almadan; bağımsız bir şoför olarak kendi aracınızla serbest seferler yapabilir, kazandığınız tüm bilet hasılatını (%100) kesintisiz olarak kendi şahsi cüzdanınıza alabilirsiniz. Oyunda telif hakkı olan gerçek ticari markalar yer almaz; dilerseniz topluluk bünyesindeki kaptan şirketlerinde de maaşlı çalışabilirsiniz.
                </div>
            </div>

            <!-- BÖLÜM 2: 7 TEMEL TESİS VE KAZANDIRDIKLARI -->
            <div style="margin-bottom: 16px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                    <h4 style="color: #facc15; margin: 0; font-size: 1.15rem;">3. Şirketin 7 Temel Tesis Binası ve Kazandırdıkları</h4>
                    <button class="modern-btn btn-read-section nav-item" data-text="Şirketin 7 temel tesisi şunlardır. Garaj ve Filo Sahası araç kapasitesini artırır ve yıpranmayı azaltır. Bakım ve Onarım Atölyesi dış servis masraflarını yüzde 65 ucuzlatır ve tamir süresini kısaltır. Otobüs Yıkama İstasyonu memnuniyeti hızla toparlar ve bekleme süresini sıfırlar. Şirket Akaryakıt İstasyonu toptan mazot tasarrufu ve ücretsiz akaryakıt sağlar. Otogar Yazıhaneleri ve Bekleme Salonları talep çarpanını artırır ve tavan bilet fiyatı hakkı verir. Personel Dinlenme Tesisi şoförlerin yorgunluk ve stresini hızla sıfırlar. Lojistik ve İkram Deposu ise ikram maliyetini düşürür ve ek kargo geliri kazandırır." style="padding: 4px 10px; background: rgba(250,204,21,0.2); border: 1px solid #facc15; color: #fef08a; font-size: 0.8rem; border-radius: 6px; cursor: pointer;">▶ 7 Binayı Sesli Dinle</button>
                </div>

                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 12px;">
                    
                    <!-- BİNA 1 -->
                    <div style="background: rgba(15,23,42,0.7); border: 1.5px solid #22c55e; border-radius: 10px; padding: 12px;">
                        <strong style="color: #4ade80; font-size: 0.95rem;">🅿️ 1. Garaj ve Filo Sahası (Depot / Garage)</strong>
                        <p style="color: #cbd5e1; font-size: 0.84rem; margin: 6px 0 0 0; line-height: 1.45;">
                            • <strong>Nasıl Geliştirilir?</strong> Seviye 1 (küçük otopark) halinden kademe kademe büyütülür (Seviye 2, Seviye 3...).<br>
                            • <strong>Ne Kazandırır?</strong> Barındırabileceğiniz maksimum otobüs ve istihdam edebileceğiniz şoför kapasitesini artırır. İleri seviyelerde garaja kapalı hangarlar, güvenlik kameraları ve çevre aydınlatması eklenerek araçların yıpranma oranı düşürülür (%50 azalma).
                        </p>
                    </div>

                    <!-- BİNA 2 -->
                    <div style="background: rgba(15,23,42,0.7); border: 1.5px solid #f97316; border-radius: 10px; padding: 12px;">
                        <strong style="color: #fb923c; font-size: 0.95rem;">🛠️ 2. Bakım ve Onarım Atölyesi (Kademe / Service Workshop)</strong>
                        <p style="color: #cbd5e1; font-size: 0.84rem; margin: 6px 0 0 0; line-height: 1.45;">
                            • <strong>Nasıl Geliştirilir?</strong> Garajın içine basit bir tamir kanalı olarak kurulur; sonrasında gelişmiş liftler, diagnostik bilgisayarları ve boyahane eklenir.<br>
                            • <strong>Ne Kazandırır?</strong> Dışarıdaki tamircilere ödenen yüksek servis ve parça faturalarını %40–50 oranında (Seviye 3'te %65) ucuzlatır. Seferden hasarlı dönen araçların hatta geri dönme süresini (tamir süresini) ciddi oranda kısaltır (%50 daha hızlı).
                        </p>
                    </div>

                    <!-- BİNA 3 -->
                    <div style="background: rgba(15,23,42,0.7); border: 1.5px solid #38bdf8; border-radius: 10px; padding: 12px;">
                        <strong style="color: #38bdf8; font-size: 0.95rem;">🧼 3. Otobüs Yıkama İstasyonu (Bus Wash)</strong>
                        <p style="color: #cbd5e1; font-size: 0.84rem; margin: 6px 0 0 0; line-height: 1.45;">
                            • <strong>Nasıl Geliştirilir?</strong> Elle yıkama hortumundan başlayıp otomatik fırçalı yıkama tüneline ve kurutma sistemlerine terfi ettirilir.<br>
                            • <strong>Ne Kazandırır?</strong> Araçlar seferden kirlendikçe düşen yolcu memnuniyetini ve bilet talebini hızla toparlar. Otomatik sistemler sayesinde araç başına yıkama maliyeti ve bekleme süresi sıfıra yaklaşır.
                        </p>
                    </div>

                    <!-- BİNA 4 -->
                    <div style="background: rgba(15,23,42,0.7); border: 1.5px solid #eab308; border-radius: 10px; padding: 12px;">
                        <strong style="color: #fde047; font-size: 0.95rem;">⛽ 4. Şirket Akaryakıt İstasyonu (Fuel Depot)</strong>
                        <p style="color: #cbd5e1; font-size: 0.84rem; margin: 6px 0 0 0; line-height: 1.45;">
                            • <strong>Nasıl Geliştirilir?</strong> Küçük bir yer altı yakıt deposu ve tek pompayla başlar; dev tanklara ve çoklu dolum adalarına dönüştürülür.<br>
                            • <strong>Ne Kazandırır?</strong> Yol üstündeki normal istasyonlara kıyasla mazotu toptan fiyata getirerek firmanın en büyük gideri olan akaryakıt masrafını doğrudan aşağı çeker (Seviye 3'te tüm filoya %100 ÜCRETSİZ MAZOT).
                        </p>
                    </div>

                    <!-- BİNA 5 -->
                    <div style="background: rgba(15,23,42,0.7); border: 1.5px solid #a855f7; border-radius: 10px; padding: 12px;">
                        <strong style="color: #c084fc; font-size: 0.95rem;">🏢 5. Otogar / Terminal Yazıhaneleri ve Bekleme Salonları</strong>
                        <p style="color: #cbd5e1; font-size: 0.84rem; margin: 6px 0 0 0; line-height: 1.45;">
                            • <strong>Nasıl Geliştirilir?</strong> Basit bir bilet gişesinden başlanıp klima, konforlu koltuklar, ücretsiz çay-kahve otomatları, Wi-Fi ve VIP yolcu bekleme salonuna dönüştürülür.<br>
                            • <strong>Ne Kazandırır?</strong> O şehirdeki/duraktaki yolcu çekme kapasitesini (talep çarpanını) artırır. Yolcular daha lüks karşılandığı için bilet fiyatlarını tavan fiyata çekmenize (+%30 tavan bilet primi) ve sefer başı +3.500 ₺ pasif gelir elde etmenize imkân tanır.
                        </p>
                    </div>

                    <!-- BİNA 6 -->
                    <div style="background: rgba(15,23,42,0.7); border: 1.5px solid #ec4899; border-radius: 10px; padding: 12px;">
                        <strong style="color: #f472b6; font-size: 0.95rem;">🛏️ 6. Personel Sosyal Tesisleri ve Dinlenme Odaları (Staff Lounge)</strong>
                        <p style="color: #cbd5e1; font-size: 0.84rem; margin: 6px 0 0 0; line-height: 1.45;">
                            • <strong>Nasıl Geliştirilir?</strong> Basit bir sandalyeli dinlenme odasından; televizyon, mutfak, oyun masaları ve otel konforunda yatakhanelere yükseltilir.<br>
                            • <strong>Ne Kazandırır?</strong> Şoförlerin yorgunluk ve stres seviyelerini çok daha hızlı sıfırlar (%75 dinlenme hızı). Şoförlerin kaza yapma, seferi aksatma veya istifa etme riskini en aza indirir.
                        </p>
                    </div>

                    <!-- BİNA 7 -->
                    <div style="background: rgba(15,23,42,0.7); border: 1.5px solid #06b6d4; border-radius: 10px; padding: 12px;">
                        <strong style="color: #22d3ee; font-size: 0.95rem;">📦 7. Lojistik ve İkram Deposu (Catering & Cargo Hub)</strong>
                        <p style="color: #cbd5e1; font-size: 0.84rem; margin: 6px 0 0 0; line-height: 1.45;">
                            • <strong>Nasıl Geliştirilir?</strong> Küçük bir koli deposundan profesyonel soğuk hava depolu ve yükleme rampalı lojistik merkezine çevrilir.<br>
                            • <strong>Ne Kazandırır?</strong> Yolculara sunulan ikramların (kek, meşrubat vb.) birim maliyetini %40–70 düşürür. Otobüs bagajında taşınan ücretli kargo hacmini büyüterek sefer başına koli başı 140 ₺'den düzenli ek gelir sağlar.
                        </p>
                    </div>

                </div>
            </div>

            <!-- BÖLÜM 3: OTOGAR YAZIHANESİ İŞLETME MODELLERİ -->
            <div style="background: rgba(0,0,0,0.35); border-radius: 10px; padding: 14px; margin-bottom: 16px; border: 1px solid rgba(255,255,255,0.08);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                    <h4 style="color: #34d399; margin: 0; font-size: 1.1rem;">4. Otogar Yazıhanesi İşletme Modelleri & Paket Kargo</h4>
                    <button class="modern-btn btn-read-section nav-item" data-text="Otogar yazıhaneleri iki farklı modelle işletilebilir. Şirket Öz Şubesi modelinde kirayı şirketiniz öder; bilet ve kargo gelirinin tamamı kasanıza kalır. Acentelik Bayiliği modelinde ise açılış maliyeti yoktur. İşletmeyi yerel esnaf yürütür; hasılatın yüzde 88 i şirketinize gelir, yüzde 12 si bayiye komisyon kalır. Ayrıca açık yazıhaneler otobüs bagajında koli kabul ederek sefer başına parça başı 140 lira ek gelir sağlar." style="padding: 4px 10px; background: rgba(52,211,153,0.2); border: 1px solid #34d399; color: #a7f3d0; font-size: 0.8rem; border-radius: 6px; cursor: pointer;">▶ Dinle</button>
                </div>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 10px; margin-top: 8px;">
                    <div style="background: rgba(22,163,74,0.15); border-left: 3px solid #22c55e; padding: 10px; border-radius: 6px;">
                        <strong style="color: #4ade80;">🏢 Model A: Şirket Öz Şubesi</strong><br>
                        <span style="font-size: 0.84rem; color: #cbd5e1;">Kirasını ve masraflarını şirketiniz öder. Bilet ve kargo gelirlerinin <strong>%100'ü doğrudan şirket kasanıza</strong> aktarılır.</span>
                    </div>
                    <div style="background: rgba(2,132,199,0.15); border-left: 3px solid #38bdf8; padding: 10px; border-radius: 6px;">
                        <strong style="color: #38bdf8;">🤝 Model B: Acentelik Bayiliği (Ücretsiz Açılış)</strong><br>
                        <span style="font-size: 0.84rem; color: #cbd5e1;"><strong>0 ₺ Masraf (Açılış bedelsizdir).</strong> İşletmeyi yerel bayi yürütür. Bilet hasılatının <strong>%88'i şirketinize</strong> gelir, %12'si bayiye komisyon olarak verilir.</span>
                    </div>
                </div>
                <div style="margin-top: 10px; font-size: 0.84rem; color: #fde047;">
                    📦 <strong>Paket Kargo Taşımacılığı:</strong> Açık yazıhaneler otobüs bagajına emanet koli kabul eder. Her seferde 4-8 koli taşınır ve koli başına <strong>140 ₺ ek net gelir</strong> elde edilir.
                </div>
            </div>

            <!-- BÖLÜM 4: FİNANSAL AKIŞ VE KASA DEFTERİ TAKİBİ -->
            <div style="background: rgba(0,0,0,0.3); border-radius: 10px; padding: 14px; margin-bottom: 16px; border: 1px solid rgba(255,255,255,0.08);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                    <h4 style="color: #facc15; margin: 0; font-size: 1.1rem;">5. Finansal Akış ve Kasa Defteri Takibi</h4>
                    <button class="modern-btn btn-read-section nav-item" data-text="Finansal Akış ve Kasa Defteri Takibi. Gerçekleşen tüm bilet satışları, kargo gelirleri, akaryakıt harcamaları ve servis masrafları sisteme anlık olarak kaydedilir. Şirket Menüsü altındaki Kasa Defteri sekmesinden toplam gelirinizi, toplam giderinizi ve net şirket kârınızı detaylı olarak inceleyebilirsiniz. Manuel hesaplama yapmanıza gerek kalmadan tüm finansal durum açık bir şekilde listelenir." style="padding: 4px 10px; background: rgba(250,204,21,0.2); border: 1px solid #facc15; color: #fef08a; font-size: 0.8rem; border-radius: 6px; cursor: pointer;">▶ Dinle</button>
                </div>
                <p style="color: #cbd5e1; font-size: 0.88rem; line-height: 1.5; margin: 0;">
                    Tüm bilet satışları, emanet kargo gelirleri, akaryakıt harcamaları ve bakım masrafları sisteme anlık olarak kaydedilir. Şirket Menüsü'ndeki <strong>📊 Kasa Defteri & Muhasebe</strong> sekmesinden toplam gelirinizi, masraf kalemlerinizi ve net şirket kârınızı canlı olarak takip edebilirsiniz; manuel hesaplama yapmanıza gerek yoktur.
                </p>
            </div>

            <!-- BÖLÜM 6: ŞİRKET KÂRLILIĞINI VE SERMAYE BÜYÜMESİNİ ARTIRMANIN 5 TEMEL STRATEJİSİ -->
            <div style="background: linear-gradient(135deg, rgba(22, 101, 52, 0.25), rgba(15, 23, 42, 0.9)); border: 1.5px solid #22c55e; border-radius: 10px; padding: 16px; margin-bottom: 16px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; border-bottom: 1px solid rgba(34, 197, 94, 0.2); padding-bottom: 8px;">
                    <div>
                        <h4 style="color: #4ade80; margin: 0; font-size: 1.2rem; display: flex; align-items: center; gap: 8px;">
                            <span>📈</span> <span>6. Şirket Kârlılığını ve Sermaye Büyümesini Artırmanın 5 Temel Stratejisi</span>
                        </h4>
                        <span style="font-size: 0.82rem; color: #86efac;">İşletme kârını azami düzeye taşımak ve filoyu büyütmek için uygulanacak resmi yönetim ilkeleri.</span>
                    </div>
                    <button class="modern-btn btn-read-section nav-item" data-text="Şirket kârlılığını ve sermaye büyümesini artırmanın beş temel stratejisi şunlardır. Birincisi Kaptan İstihdamı ile Çift Yönlü Nakit Akışı: Şirketteki tüm şoförler bizzat tarafınızdan istihdam edilir. Şirket kasasındaki başlangıç sermayesiyle Şoför Pazarından uygun bir kaptan transfer edip sefere çıkarınız; siz de başka bir hatta sürüş yaparak aynı anda iki ayrı seferin gelirini şirkete kazandırınız. İkincisi Başharekât Akıllı Sefer Dağıtım Sistemi: Ana Menüye her dönüldüğünde bu butonu kullanarak boşta bekleyen kaptanları en karlı hatlara tek işlemle atayınız. Üçüncüsü Akaryakıt Maliyetinin Sıfırlanması: Şirket Akaryakıt İstasyonunu Seviye üçe yükselterek yakıtı tamamen bedelsiz hale getiriniz. Dördüncüsü İkram Hizmeti ve Paket Kargo Taşımacılığı: Seferde ı tuşuyla ikram dağıtıp bahşiş gelirini yükseltiniz, sefer varışında açık yazıhaneler üzerinden bagaj kargo gelirini tahsil ediniz. Beşincisi Sermaye Transferi: Şirket kasasında biriken kâr paylarını Cüzdana Para Çek butonuyla şahsi hesabınıza aktararak yeni otobüs yatırımları gerçekleştiriniz." style="padding: 6px 12px; background: rgba(34,197,94,0.2); border: 1px solid #22c55e; color: #86efac; font-size: 0.85rem; border-radius: 6px; cursor: pointer;">
                        ▶ Stratejileri Dinle
                    </button>
                </div>

                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 12px;">
                    
                    <!-- STRATEJİ 1 -->
                    <div style="background: rgba(15, 23, 42, 0.75); border-left: 3px solid #22c55e; padding: 12px; border-radius: 8px;">
                        <strong style="color: #4ade80; font-size: 0.95rem;">📊 1. Kaptan İstihdamı ile Çift Yönlü Nakit Akışı</strong>
                        <p style="color: #cbd5e1; font-size: 0.84rem; margin: 6px 0 0 0; line-height: 1.45;">
                            Şirket bünyesindeki <strong>tüm şoförler bizzat sizin tarafınızdan istihdam edilir</strong>. Şirket kuruluşunda sağlanan 50.000 ₺ sermaye ile Şoför Pazarı'ndan ilk kaptanınızı transfer ederek derhal sefere görevlendiriniz. Siz kendi aracınızla hatta devam ederken diğer kaptanın da sefer tamamlaması sayesinde <strong>eş zamanlı olarak çift sefer hasılatı</strong> elde edilir.
                        </p>
                    </div>

                    <!-- STRATEJİ 2 -->
                    <div style="background: rgba(15, 23, 42, 0.75); border-left: 3px solid #38bdf8; padding: 12px; border-radius: 8px;">
                        <strong style="color: #38bdf8; font-size: 0.95rem;">🎯 2. Başharekât (Akıllı Sefer Dağıtım Sistemi)</strong>
                        <p style="color: #cbd5e1; font-size: 0.84rem; margin: 6px 0 0 0; line-height: 1.45;">
                            Her sefer sonrasında Ana Menü'de Şirket Yönetimi ekranına girerek sağ üstte bulunan <strong>"📋 Akıllı Sefer Dağıtımı"</strong> fonksiyonunu çalıştırınız. Sistem, filoda atıl bekleyen tüm kaptan şoförleri bölgesel borsa talebi en yüksek ve kârlılığı azami olan güzergâhlara otomatik olarak sevk eder.
                        </p>
                    </div>

                    <!-- STRATEJİ 3 -->
                    <div style="background: rgba(15, 23, 42, 0.75); border-left: 3px solid #eab308; padding: 12px; border-radius: 8px;">
                        <strong style="color: #fde047; font-size: 0.95rem;">⛽ 3. Akaryakıt İşletme Giderlerinin Sıfırlanması (Bina 4)</strong>
                        <p style="color: #cbd5e1; font-size: 0.84rem; margin: 6px 0 0 0; line-height: 1.45;">
                            Karayolu yolcu taşımacılığındaki en yüksek işletme maliyeti akaryakıt tüketimidir. Elde edilen ilk ticari kârlar ile <strong>Şirket Akaryakıt İstasyonu</strong> Seviye 3 kademesine terfi ettirilmelidir. Bu aşamada filonun yakıt ikmali <strong>0 ₺ (tamamen bedelsiz)</strong> hale gelir ve bilet gelirinin tamamı net kâr hanesine yazılır.
                        </p>
                    </div>

                    <!-- STRATEJİ 4 -->
                    <div style="background: rgba(15, 23, 42, 0.75); border-left: 3px solid #a855f7; padding: 12px; border-radius: 8px;">
                        <strong style="color: #c084fc; font-size: 0.95rem;">📦 4. İkram Memnuniyeti ve Emanet Kargo Taşımacılığı</strong>
                        <p style="color: #cbd5e1; font-size: 0.84rem; margin: 6px 0 0 0; line-height: 1.45;">
                            Sefer esnasında klavyeden <strong>I tuşu</strong> ile ikram dağıtımı yapılarak yolcu memnuniyeti ve sefer sonu bahşiş primi artırılır. Sefer varışında ise açık yazıhaneler üzerinden bagajda kabul edilen koli emanetlerinden (parça başı 140–160 ₺) <strong>2.000 – 3.500 ₺ ek operasyonel gelir</strong> tahsil edilir.
                        </p>
                    </div>

                    <!-- STRATEJİ 5 -->
                    <div style="background: rgba(15, 23, 42, 0.75); border-left: 3px solid #ec4899; padding: 12px; border-radius: 8px;">
                        <strong style="color: #f472b6; font-size: 0.95rem;">💰 5. Sermaye Transferi ve Üst Segment Filo Yatırımı</strong>
                        <p style="color: #cbd5e1; font-size: 0.84rem; margin: 6px 0 0 0; line-height: 1.45;">
                            Şirket kasasında biriken kâr payları, panel üzerindeki <strong>"Cüzdana Para Çek"</strong> fonksiyonu ile şahsi hesaba aktarılır. Bu sermaye ile araç galerisinden yüksek yolcu kapasiteli, lüks seyahat otobüsleri peşin bedelle satın alınarak filonun pazar payı genişletilir.
                        </p>
                    </div>

                </div>
            </div>

            <!-- BÖLÜM 5: BAŞARILI ŞİRKET YÖNETİMİ İÇİN TEMEL İPUÇLARI VE ALTIN TAKTİKLER -->
            <div style="background: linear-gradient(135deg, rgba(30, 41, 59, 0.8), rgba(15, 23, 42, 0.9)); border: 1.5px solid #38bdf8; border-radius: 10px; padding: 16px; margin-bottom: 16px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; border-bottom: 1px solid rgba(56, 189, 248, 0.2); padding-bottom: 8px;">
                    <div>
                        <h4 style="color: #38bdf8; margin: 0; font-size: 1.2rem; display: flex; align-items: center; gap: 8px;">
                            <span>💡</span> <span>7. Başarılı Şirket Yönetimi İçin Temel İpuçları (Altın Kurallar)</span>
                        </h4>
                        <span style="font-size: 0.82rem; color: #94a3b8;">Şirketinizi karlı tutmak, filonuzu büyütmek ve iflas etmemek için uygulamanız gereken 6 temel taktik.</span>
                    </div>
                    <button class="modern-btn btn-read-section nav-item" data-text="Şirket yönetiminde başarılı olmanın 6 altın kuralı şunlardır. Bir: Başlangıçta şirket kurduğunuzda elli bin lira hazır kasa kazanırsınız ve şirketin tüm şoförlerini Şoför Pazarından siz kendiniz seçip işe alırsınız. İki: Hasılat paylaşım oranını yüzde elli şirket yüzde elli kaptan olarak dengede tutun. Üç: Tesisleri doğru sırayla geliştirin; önce garaj kapasitesi, ardından bakım atölyesi ve akaryakıt istasyonuna öncelik verin. Dört: Şoförleri tek tek seçmekle uğraşmamak için Başharekât Akıllı Sefer Dağıtımı butonunu kullanın. Beş: Şirket kasasında para bittiğinde cüzdandan kasaya, şirket zenginleştiğinde ise kasadan cüzdana dilediğiniz tutarda para aktarın. Altı: Şirket yönetimi sadece Ana Menüden yapılır; sefer esnasında sürüşünüze odaklanın." style="padding: 6px 12px; background: rgba(56,189,248,0.2); border: 1px solid #38bdf8; color: #7dd3fc; font-size: 0.85rem; border-radius: 6px; cursor: pointer;">
                        ▶ İpuçlarını Sesli Dinle
                    </button>
                </div>

                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 12px;">
                    
                    <!-- İPUCU 1 -->
                    <div style="background: rgba(15, 23, 42, 0.7); border-left: 3px solid #facc15; padding: 12px; border-radius: 8px;">
                        <strong style="color: #fde047; font-size: 0.95rem;">🎯 1. Başlangıç Taktigi: Şirket Kurmak mı, Maaşlı Başlamak mı?</strong>
                        <p style="color: #cbd5e1; font-size: 0.84rem; margin: 6px 0 0 0; line-height: 1.45;">
                            Kendi şirketinizi kurduğunuzda sistem size <strong>50.000 ₺ hazır şirket kasası</strong> verir. Şirketinizin <strong>tüm şoförlerini Şoför Pazarı'ndan tecrübesine ve maaşına göre siz kendiniz seçip işe alırsınız.</strong> Eğer şirket kurmadan önce sermaye biriktirmek isterseniz, bağımsız serbest kaptan olarak çalışıp tüm sefer gelirini (%100) doğrudan kendi cebinize koyarak cepten sıfır masrafla ve telif riski olmadan nakit biriktirebilirsiniz.
                        </p>
                    </div>

                    <!-- İPUCU 2 -->
                    <div style="background: rgba(15, 23, 42, 0.7); border-left: 3px solid #22c55e; padding: 12px; border-radius: 8px;">
                        <strong style="color: #4ade80; font-size: 0.95rem;">⚖️ 2. Hasılat Paylaşım Oranı (%50 / %50 Dengesi)</strong>
                        <p style="color: #cbd5e1; font-size: 0.84rem; margin: 6px 0 0 0; line-height: 1.45;">
                            Kendi kullandığınız otobüsle bitirdiğiniz seferlerin bilet gelirini Şirket Kasası ile Kişisel Cüzdanınız arasında dilediğiniz oranda paylaştırabilirsiniz. <strong>Tavsiye:</strong> Başlangıçta <strong>%50 Şirket / %50 Kaptan</strong> dengesi en idealidir. Böylece hem kişisel otobüs satın alma bütçeniz hem de bina geliştirme kasanız aynı anda büyür.
                        </p>
                    </div>

                    <!-- İPUCU 3 -->
                    <div style="background: rgba(15, 23, 42, 0.7); border-left: 3px solid #f97316; padding: 12px; border-radius: 8px;">
                        <strong style="color: #fb923c; font-size: 0.95rem;">🏗️ 3. Binaları Hangi Sırayla Geliştirmelisiniz?</strong>
                        <p style="color: #cbd5e1; font-size: 0.84rem; margin: 6px 0 0 0; line-height: 1.45;">
                            • <strong>1. Garaj Sahası:</strong> Filodaki 5 araç/şoför sınırına yaklaştıkça ilk olarak garajı Seviye 2'ye yükseltin (Sınır 15'e çıkar ve araç yıpranması %25 azalır).<br>
                            • <strong>2. Bakım Atölyesi:</strong> Tamir masraflarını erken dönemde %45-65 ucuzlatmak için erkenden terfi ettirin.<br>
                            • <strong>3. Akaryakıt İstasyonu:</strong> Seviye 3'e ulaştığınızda tüm filoya <strong>ücretsiz mazot</strong> sağlayarak şirketin en büyük giderini sıfırlayın.
                        </p>
                    </div>

                    <!-- İPUCU 4 -->
                    <div style="background: rgba(15, 23, 42, 0.7); border-left: 3px solid #38bdf8; padding: 12px; border-radius: 8px;">
                        <strong style="color: #38bdf8; font-size: 0.95rem;">📋 4. Başharekât (Akıllı Sefer Dağıtımı) ile Zahmetsiz Yönetim</strong>
                        <p style="color: #cbd5e1; font-size: 0.84rem; margin: 6px 0 0 0; line-height: 1.45;">
                            Şirket ekranının sağ üst köşesindeki <strong>"📋 Akıllı Sefer Dağıtımı"</strong> butonuna tıkladığınızda, sistem boşta ve dinlenmiş tüm şoförlerinizi o an piyasada en çok kazandıran rotalara ve uygun otobüslere tek tıkla otomatik olarak atar. Tek tek şoför seçmekle vakit kaybetmezsiniz.
                        </p>
                    </div>

                    <!-- İPUCU 5 -->
                    <div style="background: rgba(15, 23, 42, 0.7); border-left: 3px solid #a855f7; padding: 12px; border-radius: 8px;">
                        <strong style="color: #c084fc; font-size: 0.95rem;">💰 5. Kasa, Cüzdan ve -1.000.000 ₺ İflas & Tasfiye Protokolü</strong>
                        <p style="color: #cbd5e1; font-size: 0.84rem; margin: 6px 0 0 0; line-height: 1.45;">
                            Şirket kasasında nakit azaldığında ticari borca girebilirsiniz. Kasa eksiye düştüğünde -250.000 ₺ ve -750.000 ₺ seviyelerinde banka ve mahkeme uyarı alarmları çalar. Şirket borcu <strong>-1.000.000 ₺</strong> sınırına ulaşırsa <strong>T.C. Asliye Ticaret Mahkemesi</strong> kararıyla şirket <strong>RESMEN İFLAS EDER VE TASFİYE EDİLİR</strong>. Tasfiye protokolüyle 1 milyon liralık şirket borcu sıfırlanır, şoförler serbest kalır ve binalar Seviye 1'e döner. <strong>Şahsi ehliyetiniz, araçlarınız ve cüzdanınız kanunen HACZEDİLEMEZ ve aynen korunur.</strong> İflastan kaçınmak için tehlike anında <strong>"Kasaya Para Yatır"</strong> butonuyla şahsi cüzdanınızdan şirkete sermaye aktarabilirsiniz.
                        </p>
                    </div>

                    <!-- İPUCU 6 -->
                    <div style="background: rgba(15, 23, 42, 0.7); border-left: 3px solid #ec4899; padding: 12px; border-radius: 8px;">
                        <strong style="color: #f472b6; font-size: 0.95rem;">🏢 6. Yönetim Masası Sadece Ana Menüdedir</strong>
                        <p style="color: #cbd5e1; font-size: 0.84rem; margin: 6px 0 0 0; line-height: 1.45;">
                            Şirket Yönetimine <strong>sadece Ana Menü'deki 5. buton</strong> üzerinden erişebilirsiniz. Sefer sürüşü esnasında dikkat dağınıklığını ve kaza riskini önlemek için panel sürüş sırasında kapalıdır. Direksiyon başında sadece yolunuza odaklanın, sefer bitince ana menüye dönüp şirketinizi rahatça büyütün.
                        </p>
                    </div>

                </div>
            </div>

            <!-- BÖLÜM 6: SIKÇA SORULAN SORULAR VE CEVAPLARI (S.S.S) -->
            <div style="background: rgba(0,0,0,0.35); border-radius: 10px; padding: 14px; border: 1px solid rgba(255,255,255,0.08);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                    <h4 style="color: #facc15; margin: 0; font-size: 1.15rem; display: flex; align-items: center; gap: 8px;">
                        <span>❓</span> <span>8. Sıkça Sorulan Sorular ve Hızlı Cevaplar</span>
                    </h4>
                    <button class="modern-btn btn-read-section nav-item" data-text="Şirket yönetimi hakkında en çok merak edilen sorular. Bir: Şoförlerim neden sefere çıkmıyor? Seferden yorgun dönmüşlerdir. Personel Sosyal Tesisini geliştirerek dinlenme sürelerini dört kat hızlandırabilirsiniz. İki: Şirket kasasındaki parayla otobüs alabilir miyim? Evet, Cüzdana Para Çek butonuna basıp kasadaki parayı cüzdanınıza aktarın, ardından otobüs galerisinden dilediğiniz aracı satın alın. Üç: Neden yeni şoför alamıyorum? Garaj kapasiteniz dolmuştur, Garaj ve Filo Sahasını Seviye ikiye yükselterek sınırı on beşe çıkarın. Dört: Bilet fiyatlarını nasıl yükseltirim? Otogar Yazıhanelerini geliştirerek tavan bilet fiyatı çarpanını aktif edin. Beş: Şirketim iflas edebilir mi? Evet, şirket borcu eksi bir milyon liraya ulaşırsa mahkeme tasfiye kararı verir ve borç sıfırlanır. Ehliyetiniz, araçlarınız ve kişisel cüzdanınız kanunen korunur." style="padding: 4px 10px; background: rgba(250,204,21,0.2); border: 1px solid #facc15; color: #fef08a; font-size: 0.8rem; border-radius: 6px; cursor: pointer;">▶ S.S.S Dinle</button>
                </div>

                <div style="display: flex; flex-direction: column; gap: 8px; font-size: 0.86rem; color: #cbd5e1;">
                    <div style="background: rgba(255,255,255,0.03); padding: 8px 12px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.05);">
                        <strong style="color: #38bdf8;">Soru: Şoförlerim bazen sefere çıkmıyor, neden?</strong><br>
                        <span style="color: #94a3b8;">Cevap:</span> Şoförler uzun seferlerden sonra yorulur ve dinlenme moduna geçerler. Dinlenmelerini hızlandırmak için <strong>Personel Sosyal Tesisleri (Bina 6)</strong> seviyesini yükseltin; şoförler 4 kat daha hızlı dinlenip hemen yeni sefere hazır olurlar.
                    </div>

                    <div style="background: rgba(255,255,255,0.03); padding: 8px 12px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.05);">
                        <strong style="color: #38bdf8;">Soru: Şirket kasasında biriken parayla şahsi otobüs satın alabilir miyim?</strong><br>
                        <span style="color: #94a3b8;">Cevap:</span> Evet! Şirket panosundaki <strong>"Cüzdana Para Çek"</strong> butonuna basın ve istediğiniz tutarı şahsi cüzdanınıza aktarın. Ardından Ana Menü'deki Galeri'den dilediğiniz otobüsü satın alabilirsiniz.
                    </div>

                    <div style="background: rgba(255,255,255,0.03); padding: 8px 12px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.05);">
                        <strong style="color: #38bdf8;">Soru: Yeni bir şoför veya otobüs alamıyorum, buton pasif?</strong><br>
                        <span style="color: #94a3b8;">Cevap:</span> Garajınızın kontenjanı dolmuştur (Başlangıçta 5 araç/şofördür). Tesisler sekmesinden <strong>Garaj ve Filo Sahası'nı Seviye 2'ye</strong> yükselterek kapasiteyi 15 araca çıkarabilirsiniz.
                    </div>

                    <div style="background: rgba(255,255,255,0.03); padding: 8px 12px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.05);">
                        <strong style="color: #38bdf8;">Soru: Bilet fiyatlarını ve yolcu kazancımı nasıl artırabilirim?</strong><br>
                        <span style="color: #94a3b8;">Cevap:</span> <strong>Otogar Yazıhaneleri ve Bekleme Salonları'nı (Bina 5)</strong> yükseltin. Seviye 2'de bilet fiyatları %15, Seviye 3'te ise tavan fiyattan %30 daha pahalıya satılır ve her sefer sonu binlerce lira pasif temettü kazanırsınız.
                    </div>

                    <div style="background: rgba(239,68,68,0.08); padding: 10px 14px; border-radius: 6px; border: 1.5px solid rgba(239,68,68,0.35);">
                        <strong style="color: #f87171;">⚖️ Soru: Şirketim iflas edebilir mi? İflas edince ne olur?</strong><br>
                        <span style="color: #fca5a5;">Cevap:</span> Evet! Şirket borcu <strong>-1.000.000 ₺</strong> sınırına ulaştığında T.C. Asliye Ticaret Mahkemesi iflas ve tasfiye kararı verir. Tasfiye masası şirketin 1 milyon liralık borcunu tamamen siler, şoförler serbest kalır ve binalar Seviye 1'e döner. <strong>En önemli güvence:</strong> Şahsi ehliyetiniz, garajınızdaki otobüsleriniz ve kişisel cüzdanınız kanunen <strong>HACZEDİLEMEZ</strong> ve aynen korunur. Böylece sıfır borçla temiz bir sayfa açarak dilerseniz bağımsız serbest kaptan olarak çalışıp tüm geliri doğrudan cüzdanınıza aktarabilir, dilerseniz diğer kaptanların şirketlerinde maaşlı görev alabilirsiniz, dilerseniz şirketinizi yeniden ayağa kaldırabilirsiniz.
                    </div>
                </div>
            </div>

            <!-- BÖLÜM 9: EKRAN OKUYUCU (NVDA) KULLANAN KAPTANLAR İÇİN ADIM ADIM KLAVYE VE MENÜ NAVİGASYON REHBERİ -->
            <div style="background: linear-gradient(135deg, rgba(30, 58, 138, 0.35), rgba(15, 23, 42, 0.95)); border: 1.5px solid #60a5fa; border-radius: 10px; padding: 16px; margin-top: 16px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; border-bottom: 1px solid rgba(96, 165, 250, 0.25); padding-bottom: 8px;">
                    <div>
                        <h4 style="color: #93c5fd; margin: 0; font-size: 1.2rem; display: flex; align-items: center; gap: 8px;">
                            <span>⌨️</span> <span>9. Ekran Okuyucu ve Görme Engelli Kaptanlar İçin Adım Adım Klavye Rehberi</span>
                        </h4>
                        <span style="font-size: 0.82rem; color: #bfdbfe;">Menüleri ezberlemenize gerek kalmadan Sağ/Sol oklar, formlarda Tab, müzik sesi için Sayfa Yukarı/Aşağı (PageUp/PageDown), oyun sesi için Home/End tuşları ile tam kontrol adımları.</span>
                    </div>
                    <button class="modern-btn btn-read-section nav-item" data-text="Ekran okuyucu ve görme engelli kaptanlar için adım adım klavye navigasyonu. Bir: Ana menüdeyken Tab veya Aşağı Ok tuşuna dört kez basarak beşinci sıradaki Şirket Yönetimi seçeneğine gelip Enter tuşuna basınız. İki: Şirket menüsü açıldığında Tab tuşu ile üstteki Akıllı Sefer Dağıtımı ve Kapat butonlarını, ardından Cüzdana Para Çek ve Kasaya Para Yatır butonlarını gezebilirsiniz. Üç: Şoför kiralamak için Tab ile Şoför Pazarı sekmesine gelip Enter a basınız; ardından Tab ile şoför listesine inip Transfer Et butonunda Enter a basınız. Dört: Boşta bekleyen tüm şoförleri tek tıkla sefere yollamak için Shift Tab ile en üstteki Akıllı Sefer Dağıtımı butonuna gelip Enter a basınız. Beş: Binaları geliştirmek için Yasal Binalar sekmesine girip dilediğiniz binanın altındaki Geliştir butonunda Enter a basınız. Altı: İşleminiz bittiğinde klavyeden Escape tuşuna basarak şirket menüsünü kapatıp doğrudan ana menüye dönünüz." style="padding: 6px 12px; background: rgba(59,130,246,0.25); border: 1px solid #60a5fa; color: #bfdbfe; font-size: 0.85rem; border-radius: 6px; cursor: pointer;">
                        ▶ Adım Adım Klavye Rehberini Dinle
                    </button>
                </div>

                <div style="display: flex; flex-direction: column; gap: 10px; font-size: 0.86rem; color: #cbd5e1; line-height: 1.5;">
                    
                    <div style="background: rgba(0,0,0,0.35); padding: 12px; border-radius: 8px; border-left: 3px solid #38bdf8;">
                        <strong style="color: #7dd3fc; font-size: 0.92rem;">1. Adım: Ana Menüden Şirket Yönetimine Giriş</strong><br>
                        • Ana Menü'deyken <strong>Sağ Ok</strong> tuşuna basarak ögeler arasında ilerleyiniz.<br>
                        • Sıralama şöyledir: 1. Şehir İçi Seferler ➜ 2. Şehirlerarası Seyahat ➜ 3. Garajım ➜ 4. Yeni Otobüsler Satın Al ➜ <strong>5. Şirket Yönetimi</strong>.<br>
                        • Ekran okuyucunuz <em>'Şirket Yönetimi, düğme'</em> dediğinde <strong>Enter</strong> tuşuna basınız. Şirket yönetim paneli açılır ve sesli bilgilendirme yapılır.
                    </div>

                    <div style="background: rgba(0,0,0,0.35); padding: 12px; border-radius: 8px; border-left: 3px solid #facc15;">
                        <strong style="color: #fde047; font-size: 0.92rem;">2. Adım: Şirket Paneli İçinde Sekmelerde Gezinme</strong><br>
                        • Panel açıldığında <strong>Tab</strong> tuşuna basarak sırayla ilerleyebilirsiniz.<br>
                        • İlk odak: <strong>📋 Akıllı Sefer Dağıtımı</strong> ve <strong>✕ Kapat (Esc)</strong> butonlarıdır.<br>
                        • Tab ile devam ettiğinizde şirket kasanız okunur; hemen ardından <strong>'Cüzdana Para Çek'</strong> ve <strong>'Kasaya Para Yatır'</strong> butonları gelir.<br>
                        • Bir sonraki Tab basışlarında menü sekmeleri gelir: <em>1. Kendi Filom & Şoförlerim, 2. Yasal Binalar & Garaj, 3. Var Olan Şirkete Katıl, 4. Sefer Borsası, 5. Şoför Pazarı & Transfer, 9. Kasa Defteri</em>.<br>
                        • Hangi sekmeyi açmak istiyorsanız o sekmenin üzerindeyken <strong>Enter</strong> tuşuna basınız.
                    </div>

                    <div style="background: rgba(0,0,0,0.35); padding: 12px; border-radius: 8px; border-left: 3px solid #22c55e;">
                        <strong style="color: #4ade80; font-size: 0.92rem;">3. Adım: Şoför Pazarından İlk Kaptanı İşe Alma</strong><br>
                        • Tab tuşuyla <strong>'👨‍✈️ Şoför Pazarı & Transfer'</strong> sekmesine gelip <strong>Enter</strong>'a basınız.<br>
                        • Tab tuşuna basarak listelenen kaptanların isimlerini, maaşlarını ve özelliklerini dinleyiniz.<br>
                        • Örneğin Murat Çırak veya Mehmet Kaptan'ın altındaki <strong>'Transfer Et'</strong> düğmesine geldiğinizde <strong>Enter</strong>'a basınız. Kaptan başarıyla filonuza katılır.
                    </div>

                    <div style="background: rgba(0,0,0,0.35); padding: 12px; border-radius: 8px; border-left: 3px solid #a855f7;">
                        <strong style="color: #c084fc; font-size: 0.92rem;">4. Adım: Kaptanları Tek Tuşla Sefere Yollama (Başharekât)</strong><br>
                        • Şirket panelinin herhangi bir yerindeyken <strong>Shift + Tab</strong> yaparak en üstteki <strong>'📋 Akıllı Sefer Dağıtımı'</strong> butonuna geri dönünüz.<br>
                        • <strong>Enter</strong> tuşuna basınız. Sistem filoda bekleyen tüm kaptanlarınızı en karlı rotalara otomatik olarak sevk eder.
                    </div>

                    <div style="background: rgba(0,0,0,0.35); padding: 12px; border-radius: 8px; border-left: 3px solid #ec4899;">
                        <strong style="color: #f472b6; font-size: 0.92rem;">5. Adım: Binaları Yükseltme (Akaryakıtı Bedava Yapma)</strong><br>
                        • Tab tuşuyla <strong>'🏛️ Yasal Binalar & Garaj'</strong> sekmesine gelip <strong>Enter</strong>'a basınız.<br>
                        • Tab ile binalar arasında ilerleyip <strong>'Şirket Akaryakıt İstasyonu'</strong> başlığı altındaki <strong>'Geliştir'</strong> butonuna gelip <strong>Enter</strong>'a basınız. Seviye 3'e ulaştığınızda mazot tamamen ücretsiz olur.
                    </div>

                    <div style="background: rgba(0,0,0,0.35); padding: 12px; border-radius: 8px; border-left: 3px solid #eab308;">
                        <strong style="color: #fde047; font-size: 0.92rem;">6. Adım: Şirket Menüsünü Kapatma ve Seferinize Başlama</strong><br>
                        • İşlemlerinizi tamamladığınızda klavyeden <strong>Esc (Escape)</strong> tuşuna basınız. Şirket paneli kapanır ve otomatik olarak Ana Menü'ye dönersiniz.<br>
                        • Ana Menü'de <strong>Sol Ok</strong> tuşuna basarak 1. sıradaki <strong>'Şehir İçi Seferler'</strong> veya 2. sıradaki <strong>'Şehirlerarası Seyahat'</strong> butonuna gelip <strong>Enter</strong>'a basarak kendi seferinizi başlatınız.
                    </div>

                </div>
            </div>

        </div>
        `;

        // Sesli okuma butonları
        container.querySelectorAll('.btn-read-section').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const text = e.currentTarget.getAttribute('data-text');
                if (text && typeof audio !== 'undefined' && audio.speak) {
                    audio.speak(text);
                }
            });
        });
    }

    initGuidedLab() {
        if (typeof this.guidedStep === 'undefined') this.guidedStep = 1;
        if (typeof this.labSpeed === 'undefined') this.labSpeed = 0;
        if (typeof this.labEngineRunning === 'undefined') this.labEngineRunning = false;
        if (typeof this.labKneeling === 'undefined') this.labKneeling = false;
        if (typeof this.labRampOpen === 'undefined') this.labRampOpen = false;
        if (typeof this.labFrontDoor === 'undefined') this.labFrontDoor = false;
        if (typeof this.labRearDoor === 'undefined') this.labRearDoor = false;
        if (typeof this.labRetarderActive === 'undefined') this.labRetarderActive = false;
        this.guidedFeedbackText = "";
        this.guidedFeedbackType = "info";

        this.guidedSteps = [
            {
                step: 1,
                title: "1. Adım: Motoru Çalıştırma (Kontağı Açalım)",
                tip: "Otobüsün hareket etmesi için önce motoru çalıştırmalıyız.",
                instruction: "Otobüsümüzü çalıştırmak için klavyeden M tuşuna basınız veya aşağıdaki 'Marşa Bas' butonuna tıklayınız.",
                targetKey: "m",
                soundName: "🔑 Marş Motoru ve Dizel Rölanti",
                playSound: () => {
                    if (typeof audio !== 'undefined') {
                        if (audio.playEngineStartPreview) audio.playEngineStartPreview(3.2);
                        else if (audio.sounds && audio.sounds.start) audio.sounds.start.play();
                    }
                },
                actionBtnText: "🔑 Motoru Çalıştır (M)",
                actionBtnStyle: "background: linear-gradient(135deg, #0284c7, #0369a1); border: 1.5px solid #38bdf8;",
                successFeedback: "Aferin, çok güzel! Motor çalıştı, dizel rölanti sesini duyduk. Şimdi gaza basıp yola çıkalım.",
                failFeedback: "Motoru çalıştırmak için lütfen sadece M tuşuna basınız. Başarabilirsin, tekrar dene!",
                execute: () => {
                    const s = this.guidedSteps[0];
                    if (s && s.playSound) s.playSound();
                    this.labEngineRunning = true;
                }
            },
            {
                step: 2,
                title: "2. Adım: Gaza Basma (Yola Çıkalım)",
                tip: "Otobüsü hızlandırmak için gaza basıyoruz.",
                instruction: "Otobüsü sürmek ve hızlanmak için klavyeden W tuşuna (veya Yukarı Ok tuşuna) basınız.",
                targetKey: "w",
                altTargetKey: "arrowup",
                soundName: "🟢 Dizel Devirlenme & Hızlanma",
                playSound: () => {
                    if (typeof audio !== 'undefined' && audio.playAcceleration) {
                        audio.playAcceleration(2.8);
                    }
                },
                actionBtnText: "🟢 Gaza Bas ve Hızlan (W / Yukarı Ok)",
                actionBtnStyle: "background: linear-gradient(135deg, #16a34a, #15803d); border: 1.5px solid #4ade80;",
                successFeedback: "Harika gidiyorsun, tebrikler! Otobüsümüz motor devriyle hızlandı, ilk durağımıza doğru gidiyoruz.",
                failFeedback: "Hızlanmak için lütfen W tuşuna veya Yukarı Ok tuşuna basınız. Tekrar deneyiniz!",
                execute: () => {
                    const s = this.guidedSteps[1];
                    if (s && s.playSound) s.playSound();
                    this.labSpeed = 50;
                }
            },
            {
                step: 3,
                title: "3. Adım: Yumuşakça Durma (Fren Yapalım)",
                tip: "Durağa yaklaşınca yolcular sarsılmasın diye frene yumuşakça basıyoruz.",
                instruction: "Durağa geldik! Yolcuları sarsmadan durmak için lütfen klavyeden S tuşuna (veya Aşağı Ok tuşuna) basınız.",
                targetKey: "s",
                altTargetKey: "arrowdown",
                soundName: "💨 Havalı Fren Pnömatik Tahliyesi",
                playSound: () => {
                    if (typeof audio !== 'undefined' && audio.playAirBrake) {
                        audio.playAirBrake();
                    }
                },
                actionBtnText: "✨ Frene Bas ve Dur (S / Aşağı Ok)",
                actionBtnStyle: "background: linear-gradient(135deg, #059669, #047857); border: 1.5px solid #10b981;",
                successFeedback: "Mükemmel bir duruş, tebrikler! Havalı fren tıslamasıyla çok yumuşak durdun, yolcular hiç sarsılmadı.",
                failFeedback: "Durmak için lütfen S tuşuna veya Aşağı Ok tuşuna basınız. Tekrar dene!",
                execute: () => {
                    const s = this.guidedSteps[2];
                    if (s && s.playSound) s.playSound();
                    this.labSpeed = 0;
                }
            },
            {
                step: 4,
                title: "4. Adım: Otobüsü Sağa Eğme (Kaldırıma Yaklaştırma)",
                tip: "Yaşlı ve engelli yolcular basamağa rahat çıksın diye otobüsü sağa eğiyoruz.",
                instruction: "Durakta yaşlı bir yolcumuz bekliyor. Otobüsü kaldırıma doğru eğmek için klavyeden K tuşuna basınız.",
                targetKey: "k",
                soundName: "🦼 Kneeling Süspansiyon Yana Yatış Tıslaması",
                playSound: () => {
                    if (typeof audio !== 'undefined') {
                        if (audio.playKneeling) audio.playKneeling(true);
                        else if (audio.playKneelingSound) audio.playKneelingSound();
                    }
                },
                actionBtnText: "⬇️ Otobüsü Sağa Eğ (K)",
                actionBtnStyle: "background: linear-gradient(135deg, #0284c7, #0369a1); border: 1.5px solid #38bdf8;",
                successFeedback: "Aferin çok doğru! Hava körükleri tıslayarak otobüs yana yattı, basamak kaldırım seviyesine indi.",
                failFeedback: "Otobüsü eğmek için lütfen K tuşuna basınız. Tekrar dene!",
                execute: () => {
                    const s = this.guidedSteps[3];
                    if (s && s.playSound) s.playSound();
                    this.labKneeling = true;
                }
            },
            {
                step: 5,
                title: "5. Adım: Engelli Rampasını Açma",
                tip: "Tekerlekli sandalyeli yolcumuzun binmesi için rampayı açıyoruz.",
                instruction: "Tekerlekli sandalyeli yolcumuzun rahatça binmesi için klavyeden R tuşuna (veya U) basarak rampayı açınız.",
                targetKey: "r",
                altTargetKey: "u",
                soundName: "🛹 Freesound Hidrolik Rampa İniş & Kaldırım Klankı",
                playSound: () => {
                    if (typeof audio !== 'undefined') {
                        if (audio.playRampDeploy) audio.playRampDeploy();
                        else if (audio.playRamp) audio.playRamp(true);
                    }
                },
                actionBtnText: "🛹 Engelli Rampasını Aç (R veya U)",
                actionBtnStyle: "background: linear-gradient(135deg, #d97706, #b45309); border: 1.5px solid #facc15;",
                successFeedback: "Harikasın! Rampa hidrolik sesle indi ve kaldırıma kilitlendi. Yolcumuz bindi: Çok teşekkür ederim kaptanım!",
                failFeedback: "Rampayı açmak için lütfen R veya U tuşuna basınız.",
                execute: () => {
                    const s = this.guidedSteps[4];
                    if (s && s.playSound) s.playSound();
                    this.labRampOpen = true;
                }
            },
            {
                step: 6,
                title: "6. Adım: Rampayı Geri Kapatma",
                tip: "Yolcumuz bindi, sefere devam etmek için rampayı geri topluyoruz.",
                instruction: "Yolcumuz bindi. Tekrar yola çıkabilmek için lütfen tekrar R tuşuna (veya U) basarak rampayı kapatınız.",
                targetKey: "r",
                altTargetKey: "u",
                soundName: "⬆️ Freesound Rampa Toplanma & Şasi Kilidi",
                playSound: () => {
                    if (typeof audio !== 'undefined') {
                        if (audio.playRampRetract) audio.playRampRetract();
                        else if (audio.playRamp) audio.playRamp(false);
                    }
                },
                actionBtnText: "⬆️ Rampayı Kapat ve Otobüsü Doğrult (R veya U)",
                actionBtnStyle: "background: linear-gradient(135deg, #475569, #334155); border: 1.5px solid #94a3b8;",
                successFeedback: "Çok güzel! Rampa motorla toplanıp şasiye kilitlendi ve körükler otobüsü doğrulttu.",
                failFeedback: "Rampayı kapatmak için lütfen tekrar R veya U tuşuna basınız.",
                execute: () => {
                    const s = this.guidedSteps[5];
                    if (s && s.playSound) s.playSound();
                    this.labRampOpen = false;
                    this.labKneeling = false;
                }
            },
            {
                step: 7,
                title: "7. Adım: Ön Kapıyı Açma (Yolcuları Alma)",
                tip: "Durakta bekleyen diğer yolcuların binmesi için ön kapıyı açıyoruz.",
                instruction: "Duraktaki diğer yolcuların binmesi için klavyeden 1 tuşuna basarak ön kapıyı açınız.",
                targetKey: "1",
                soundName: "🚪 Ön Kapı Pnömatik Açılışı & 💳 Akbil Bip Sesi",
                playSound: () => {
                    if (typeof audio !== 'undefined') {
                        if (audio.playDoorOpenWithAkbil) audio.playDoorOpenWithAkbil();
                        else {
                            if (audio.playDoorOpen) audio.playDoorOpen();
                            setTimeout(() => { if (audio.playAkbilTam) audio.playAkbilTam(); }, 750);
                        }
                    }
                },
                actionBtnText: "🚪 Ön Kapıyı Aç (1)",
                actionBtnStyle: "background: linear-gradient(135deg, #7c3aed, #6d28d9); border: 1.5px solid #a78bfa;",
                successFeedback: "Aferin doğru yaptın! Pnömatik kapı açıldı, yolcular kartlarını okutup bindi.",
                failFeedback: "Ön kapıyı açmak için lütfen 1 tuşuna basınız.",
                execute: () => {
                    const s = this.guidedSteps[6];
                    if (s && s.playSound) s.playSound();
                    this.labFrontDoor = true;
                }
            },
            {
                step: 8,
                title: "8. Adım: Ön Kapıyı Kapatma",
                tip: "Yolcular bindi, güvenle sürmek için kapıyı kapatıyoruz.",
                instruction: "Yolcular bindi. Yola çıkmak için lütfen tekrar 1 tuşuna basarak kapıyı kapatınız.",
                targetKey: "1",
                soundName: "🔒 Ön Kapı Pnömatik Kapanış & Kauçuk Fitil",
                playSound: () => {
                    if (typeof audio !== 'undefined' && audio.playDoorClose) {
                        audio.playDoorClose();
                    }
                },
                actionBtnText: "🔒 Ön Kapıyı Kapat (1)",
                actionBtnStyle: "background: linear-gradient(135deg, #475569, #334155); border: 1.5px solid #94a3b8;",
                successFeedback: "Tebrikler! Kapılar hava sesiyle kapandı ve kilitlendi, artık güvenle sürebilirsin.",
                failFeedback: "Kapıyı kapatmak için lütfen 1 tuşuna basınız.",
                execute: () => {
                    const s = this.guidedSteps[7];
                    if (s && s.playSound) s.playSound();
                    this.labFrontDoor = false;
                }
            },
            {
                step: 9,
                title: "9. Adım: Yokuş Aşağı İniş Freni (Retarder)",
                tip: "Yokuş inerken normal fren balataları ısınmasın diye motor frenini çekiyoruz.",
                instruction: "Son olarak, dik yokuş inerken otobüsü yavaşlatmak için Boşluk (Space) tuşuna basarak yokuş frenini çekiniz.",
                targetKey: " ",
                soundName: "🎶 Voith / ZF Hidrolik Retarder Düdüğü & Yavaşlama",
                playSound: () => {
                    if (typeof audio !== 'undefined' && audio.playRetarder) {
                        audio.playRetarder(3.5, 65);
                    }
                },
                actionBtnText: "⚡ Yokuş Frenini Çek (Boşluk / Space)",
                actionBtnStyle: "background: linear-gradient(135deg, #ea580c, #c2410c); border: 1.5px solid #f97316;",
                successFeedback: "Muhteşem! Retarder ıslık çalarak otobüsü yavaşlattı. Bütün kontrolleri ve akustikleri başarıyla öğrendin!",
                failFeedback: "Yokuş freni için lütfen Boşluk (Space) tuşuna basınız.",
                execute: () => {
                    const s = this.guidedSteps[8];
                    if (s && s.playSound) s.playSound();
                    this.labRetarderActive = true;
                }
            },
            {
                step: 10,
                title: "🎉 Tebrikler! Eğitimi Başarıyla Bitirdin",
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

        if (isGraduation) {
            // MEZUNİYET EKRANI (TAMAMEN SAMİMİ VE EĞLENCELİ)
            if (typeof Game !== 'undefined' && typeof Game.completeAcademy === 'function') {
                Game.completeAcademy();
            }
            if (typeof audio !== 'undefined' && audio.playSuccess) audio.playSuccess();

            labContainer.innerHTML = `
                <div style="background: linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(2, 132, 199, 0.35)); border: 2px solid #38bdf8; border-radius: 14px; padding: 26px; text-align: center; box-shadow: 0 0 30px rgba(56, 189, 248, 0.25);">
                    <div style="font-size: 3.8rem; margin-bottom: 8px;">🏆</div>
                    <span style="font-size: 0.9rem; color: #38bdf8; text-transform: uppercase; letter-spacing: 2px; font-weight: bold;">TEBRİKLER ŞOFÖR KARDEŞİM!</span>
                    <h3 style="color: #ffffff; font-size: 1.8rem; margin: 6px 0 12px 0;">🎉 Bütün Kontrolleri Öğrendin!</h3>
                    
                    <div style="background: rgba(56, 189, 248, 0.12); border: 1.5px solid #38bdf8; border-radius: 10px; padding: 16px; margin: 16px auto; max-width: 580px; text-align: left;">
                        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 6px;">
                            <span style="font-size: 2rem;">🚍</span>
                            <div>
                                <strong style="color: #38bdf8; font-size: 1.15rem; display: block;">Artık Gerçek Bir Otobüs Şoförüsün!</strong>
                                <span style="color: #cbd5e1; font-size: 0.9rem;">Motoru çalıştırmayı, yumuşak durmayı, kapıları ve engelli rampasını öğrendin.</span>
                            </div>
                        </div>
                        <p style="color: #f1f5f9; font-size: 0.95rem; line-height: 1.5; margin: 8px 0 0 0;">
                            Yolcularımız durakta seni bekliyor. Hemen ilk seferine çık ve şehrin caddelerinde keyifle sür!
                        </p>
                    </div>

                    <button id="btn-lab-start-first-mission" class="modern-btn nav-item" style="padding: 14px 30px; font-size: 1.2rem; background: linear-gradient(135deg, #0284c7, #0369a1); border: 2px solid #38bdf8; color: #ffffff; font-weight: bold; border-radius: 10px; cursor: pointer; margin-top: 10px; box-shadow: 0 0 20px rgba(56, 189, 248, 0.4);" aria-label="İlk Seferime Başla. 1. Göreve Git">
                        🚍 İlk Seferime Başla (1. Göreve Git)
                    </button>
                </div>
            `;

            const btnStart = document.getElementById('btn-lab-start-first-mission');
            if (btnStart) {
                btnStart.onclick = () => {
                    if (typeof audio !== 'undefined' && audio.playSelect) audio.playSelect();
                    if (typeof Game !== 'undefined' && Game.completeAcademy) Game.completeAcademy();
                    this.closeTutorialModal();
                    document.dispatchEvent(new CustomEvent('go-to-route-screen', { detail: { city: "Tekirdağ" } }));
                };
            }

            if (typeof KeyboardNav !== 'undefined' && KeyboardNav.initForScreen) {
                KeyboardNav.initForScreen();
            }
            return;
        }

        // AKTİF ADIM EKRANI (TERİMSİZ, EN ANLAŞILIR VE NET)
        labContainer.innerHTML = `
            <div style="background: rgba(15, 23, 42, 0.85); border: 1.5px solid #38bdf8; border-radius: 12px; padding: 20px; margin-bottom: 16px;">
                <!-- Adım Başlığı -->
                <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(56, 189, 248, 0.3); padding-bottom: 10px; margin-bottom: 14px;">
                    <div>
                        <span style="font-size: 0.8rem; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px;">Sürüşü Öğreniyoruz</span>
                        <h3 style="color: #38bdf8; font-size: 1.35rem; margin: 2px 0 0 0;">${currentStep.title}</h3>
                    </div>
                    <span style="background: rgba(56, 189, 248, 0.2); color: #38bdf8; padding: 6px 14px; border-radius: 20px; font-weight: bold; font-size: 0.95rem;">
                        Adım ${this.guidedStep} / 9
                    </span>
                </div>

                <!-- Otobüsün Durumu (Çok Basit ve Net) -->
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 8px; margin-bottom: 16px;">
                    <div style="background: rgba(0,0,0,0.4); padding: 8px 10px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.08); text-align: center;">
                        <span style="color: #94a3b8; font-size: 0.78rem; display: block;">MOTOR</span>
                        <strong style="color: ${this.labEngineRunning ? '#4ade80' : '#f87171'}; font-size: 1rem;">${this.labEngineRunning ? '🟢 Çalışıyor' : '🔴 Kapalı'}</strong>
                    </div>
                    <div style="background: rgba(0,0,0,0.4); padding: 8px 10px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.08); text-align: center;">
                        <span style="color: #94a3b8; font-size: 0.78rem; display: block;">HIZ</span>
                        <strong style="color: #facc15; font-size: 1rem;">${this.labSpeed} km/s</strong>
                    </div>
                    <div style="background: rgba(0,0,0,0.4); padding: 8px 10px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.08); text-align: center;">
                        <span style="color: #94a3b8; font-size: 0.78rem; display: block;">ENGELLİ RAMPASI</span>
                        <strong style="color: #38bdf8; font-size: 1rem;">${this.labRampOpen ? '🛹 Açık' : (this.labKneeling ? '🦼 Yana Yatık' : '⚪ Kapalı')}</strong>
                    </div>
                    <div style="background: rgba(0,0,0,0.4); padding: 8px 10px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.08); text-align: center;">
                        <span style="color: #94a3b8; font-size: 0.78rem; display: block;">KAPILAR</span>
                        <strong style="color: ${this.labFrontDoor || this.labRearDoor ? '#f87171' : '#4ade80'}; font-size: 1rem;">${this.labFrontDoor || this.labRearDoor ? '🚪 Açık' : '🔒 Kapalı'}</strong>
                    </div>
                </div>

                <!-- Basit İpucu Kutusu -->
                <div style="background: rgba(56, 189, 248, 0.1); border-left: 4px solid #38bdf8; padding: 10px 14px; border-radius: 0 6px 6px 0; margin-bottom: 14px; font-size: 0.92rem; color: #e0f2fe;">
                    💡 <strong>İpucu:</strong> ${currentStep.tip}
                </div>

                <!-- Ne Yapılacağını Anlatan Talimat Kutusu -->
                <div style="background: rgba(30, 41, 59, 0.7); border: 1.5px solid rgba(56, 189, 248, 0.4); border-radius: 10px; padding: 16px; margin-bottom: 18px;">
                    <div style="font-weight: bold; color: #38bdf8; margin-bottom: 6px; font-size: 1.05rem;">📢 Şimdi Ne Yapıyoruz?</div>
                    <p style="color: #f8fafc; font-size: 1.1rem; line-height: 1.5; margin: 0; font-weight: 500;">${currentStep.instruction}</p>
                </div>

                <!-- TEK VE NET BASILACAK BUTON -->
                <div style="text-align: center; margin-bottom: 18px;">
                    <button id="btn-guided-action" class="modern-btn nav-item" style="padding: 16px 36px; font-size: 1.3rem; font-weight: bold; border-radius: 10px; cursor: pointer; color: #ffffff; ${currentStep.actionBtnStyle} box-shadow: 0 0 20px rgba(56, 189, 248, 0.35);" aria-label="${currentStep.actionBtnText}">
                        ${currentStep.actionBtnText}
                    </button>
                </div>

                <!-- GERİ BİLDİRİM / TEBRİK YA DA YOL GÖSTERME KUTUSU -->
                <div id="guided-feedback-box" style="display: ${this.guidedFeedbackText ? 'block' : 'none'}; padding: 14px 18px; border-radius: 8px; margin-bottom: 14px; font-size: 1rem; font-weight: bold; ${this.guidedFeedbackType === 'success' ? 'background: rgba(34, 197, 94, 0.2); border: 1.5px solid #22c55e; color: #4ade80;' : 'background: rgba(234, 179, 8, 0.2); border: 1.5px solid #eab308; color: #fde047;'}">
                    ${this.guidedFeedbackText}
                </div>

                <!-- Alt Yardımcı Butonlar -->
                <div style="display: flex; gap: 10px; justify-content: space-between; align-items: center; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 12px;">
                    <button id="btn-guided-replay-audio" class="modern-btn nav-item" style="padding: 8px 14px; font-size: 0.9rem; background: rgba(56, 189, 248, 0.15); border: 1px solid #38bdf8; color: #38bdf8; border-radius: 6px; cursor: pointer;" aria-label="Talimatı Sesli Tekrar Dinle">
                        🔊 Ne Yapacağımı Tekrar Söyle
                    </button>
                    ${this.guidedStep > 1 ? '<button id="btn-guided-prev-step" class="modern-btn nav-item" style="padding: 8px 14px; font-size: 0.9rem; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.2); color: #cbd5e1; border-radius: 6px; cursor: pointer;">⬅️ Önceki Adıma Dön</button>' : ''}
                </div>
            </div>
        `;

        // Buton Olayları
        const btnAction = document.getElementById('btn-guided-action');
        if (btnAction) {
            btnAction.onclick = () => {
                this.executeGuidedSuccess();
            };
        }



        const btnReplay = document.getElementById('btn-guided-replay-audio');
        if (btnReplay) {
            btnReplay.onclick = () => {
                if (typeof audio !== 'undefined' && audio.speak) {
                    audio.speak(currentStep.instruction);
                }
            };
        }

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

        // Adımın mekanik sesi hemen çalsın
        if (currentStep.execute) currentStep.execute();

        this.guidedFeedbackText = "🎉 " + currentStep.successFeedback;
        this.guidedFeedbackType = "success";

        if (typeof audio !== 'undefined') {
            // Mekanik sesin rahatça duyulabilmesi için tebrik mesajını 500ms sonraya zamanla
            setTimeout(() => {
                if (audio.speak) audio.speak(currentStep.successFeedback);
                if (audio.updateNvdaLiveRegion) audio.updateNvdaLiveRegion(currentStep.successFeedback);
            }, 550);
        }
        if (typeof UI !== 'undefined' && UI.showToast) {
            UI.showToast("Aferin! Doğru yaptınız. Sıradaki adıma geçiliyor...", "success");
        }

        // Sıradaki adıma yumuşak geçiş
        setTimeout(() => {
            this.guidedStep++;
            this.guidedFeedbackText = "";
            this.renderInteractiveLab();
            const nextStep = this.guidedSteps[this.guidedStep - 1];
            if (nextStep && !nextStep.isGraduation && typeof audio !== 'undefined' && audio.speak) {
                setTimeout(() => {
                    audio.speak(nextStep.instruction);
                }, 600);
            }
        }, 2200);
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
    // ŞOFÖRLÜK DURUMUM (TAMAMEN SAMİMİ VE EĞLENCELİ, SIFIR STRES)
    // =========================================================================
    renderKaptanlikSeruveni() {
        const seruvenContainer = document.getElementById('tutorial-seruven-container') || document.getElementById('tutorial-karne-container');
        if (!seruvenContainer) return;

        const level = (typeof Game !== 'undefined' && Game.licenseLevel) ? Game.licenseLevel : 1;
        const xp = (typeof Game !== 'undefined' && Game.playerXP) ? Game.playerXP : 0;
        const tasks = (typeof Game !== 'undefined' && Game.completedTasks) ? Game.completedTasks : 0;
        const title = (typeof Game !== 'undefined' && typeof Game.getLicenseTitle === 'function') ? Game.getLicenseTitle() : 'Stajyer Şoför';
        const nextXP = (typeof Game !== 'undefined' && typeof Game.getNextLevelXP === 'function') ? Game.getNextLevelXP(level) : 250;
        const unlockTeaser = (typeof Game !== 'undefined' && typeof Game.getUnlockTeaser === 'function') ? Game.getUnlockTeaser(level) : "Seviye 3'te yeni otobüs açılacak!";

        let advice = "";
        if (level < 3) {
            advice = "Harika gidiyorsun! Şu an başlangıç aşamasındasın. Duraklara yumuşak yanaşıp yolcuları güler yüzle aldıkça tecrübe kazanacaksın. Yeni otobüsler yakında açılacak!";
        } else if (level < 6) {
            advice = "Direksiyonun çok iyi! Engelli rampasını açman ve kasislerde yavaşlaman yolcuları çok mutlu etti. Şehir içi hatların sevilen şoförü oldun!";
        } else if (level < 10) {
            advice = "Artık usta bir şehir içi şoförüsün! Körüklü otobüste çok başarılısın. Çok yakında şehirlerarası yollara çıkacaksın!";
        } else {
            advice = "Efsane bir Kaptansın! Şehirlerarası uzun yollarda tecrübenle parlıyorsun. Tüm otobüsler emrinde!";
        }

        const xpPercent = Math.min(100, Math.round((xp / nextXP) * 100));

        seruvenContainer.innerHTML = `
            <div style="background: linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(2, 132, 199, 0.35)); border: 2px solid #38bdf8; border-radius: 12px; padding: 22px;">
                <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(56, 189, 248, 0.3); padding-bottom: 12px; margin-bottom: 16px;">
                    <div>
                        <span style="font-size: 0.85rem; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px;">Şoförlük Bilgilerin</span>
                        <h3 style="color: #38bdf8; font-size: 1.55rem; margin: 4px 0 0 0;">🌟 Seviye ${level} - ${title}</h3>
                    </div>
                    <button id="btn-seruven-read-speech" class="modern-btn nav-item" style="padding: 10px 18px; background: linear-gradient(135deg, #0284c7, #0369a1); border: 1.5px solid #38bdf8; color: #ffffff; font-weight: bold; border-radius: 8px; cursor: pointer;" aria-label="Şoförlük durumumu dinle">
                        🔊 Durumumu Dinle
                    </button>
                </div>

                <!-- Tecrübe Çubuğu -->
                <div style="margin-bottom: 18px;">
                    <div style="display: flex; justify-content: space-between; font-size: 0.95rem; margin-bottom: 6px; color: #e2e8f0;">
                        <span>Kazanılan Tecrübe Puanı: <strong>${xp} / ${nextXP} Puan</strong></span>
                        <span style="color: #38bdf8; font-weight: bold;">%${xpPercent}</span>
                    </div>
                    <div style="height: 12px; background: rgba(0,0,0,0.5); border-radius: 6px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1);">
                        <div style="height: 100%; width: ${xpPercent}%; background: linear-gradient(90deg, #38bdf8, #4ade80); transition: width 0.3s ease;"></div>
                    </div>
                </div>

                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 18px;">
                    <div style="background: rgba(0,0,0,0.3); padding: 12px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.08);">
                        <span style="color: #94a3b8; font-size: 0.85rem; display: block;">Tamamlanan Seferler</span>
                        <strong style="color: #4ade80; font-size: 1.3rem;">${tasks} Sefer</strong>
                    </div>
                    <div style="background: rgba(0,0,0,0.3); padding: 12px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.08);">
                        <span style="color: #94a3b8; font-size: 0.85rem; display: block;">Sıradaki Otobüs Açılışı</span>
                        <strong style="color: #38bdf8; font-size: 1rem;">${unlockTeaser}</strong>
                    </div>
                </div>

                <!-- Samimi Tavsiye Kutusu -->
                <div style="background: rgba(56, 189, 248, 0.12); border-left: 4px solid #38bdf8; padding: 14px 16px; border-radius: 0 8px 8px 0;">
                    <div style="font-weight: bold; color: #38bdf8; margin-bottom: 4px; font-size: 1rem;">💬 Ümit Kaptan'dan Tavsiyeler:</div>
                    <p style="color: #f1f5f9; font-size: 0.95rem; line-height: 1.5; margin: 0;">${advice}</p>
                </div>
            </div>
        `;

        const btnRead = document.getElementById('btn-seruven-read-speech');
        if (btnRead) {
            btnRead.addEventListener('click', () => {
                const speechText = `Şoförlük durumunuz. Seviyeniz ${level}, ${title}. Toplam tecrübeniz ${xp} puan. Gelecek seviye için ${nextXP} puan gerekiyor. Tamamlanan sefer sayısı ${tasks}. ${unlockTeaser}. ${advice}`;
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


    // --- EĞİTİMDE TARİF EDİLEN SESLERİ BİREBİR ÇALMA SİSTEMİ ---
    playLessonSoundEffect(lessonId) {
        if (typeof audio === 'undefined') return;
        switch(lessonId) {
            case 'driving':
                // 1. Motor marş + rölanti, ardından gaz ve fren
                if (audio.playEngineStartPreview) audio.playEngineStartPreview(2.4);
                setTimeout(() => {
                    if (audio.playAcceleration) audio.playAcceleration(2.0);
                }, 2500);
                setTimeout(() => {
                    if (audio.playAirBrake) audio.playAirBrake();
                }, 4600);
                break;
            case 'stops':
                // 2. Havalı kapı açılışı, Akbil kart okutma ve kapı kapanışı
                if (audio.playDoorOpen) audio.playDoorOpen();
                setTimeout(() => {
                    if (audio.playAkbilTam) audio.playAkbilTam();
                }, 1000);
                setTimeout(() => {
                    if (audio.playDoorClose) audio.playDoorClose();
                }, 2200);
                break;
            case 'compass':
                // 3. Yön & pusula akustik çanı
                if (audio.playStopRequestBell) audio.playStopRequestBell();
                break;
            case 'cockpit_navigation':
                // 3.1 Üç tonlu durak/istasyon gong anonsu
                if (audio.playTerminalChime) audio.playTerminalChime();
                break;
            case 'ramp':
                // 4. Kaldırıma yatma (kneeling), Freesound rampa iniş ve toplanma
                if (audio.playKneeling) audio.playKneeling(true);
                setTimeout(() => {
                    if (audio.playRampDeploy) audio.playRampDeploy();
                }, 1200);
                setTimeout(() => {
                    if (audio.playRampRetract) audio.playRampRetract();
                }, 5200);
                break;
            case 'bumps':
                // 5. Kasis darbe sesi ve retarder yavaşlama düdüğü
                if (audio.playRoadBump) audio.playRoadBump();
                setTimeout(() => {
                    if (audio.playRetarder) audio.playRetarder(3.0, 45);
                }, 600);
                break;
            case 'comfort_ac':
                // 6. Freesound sol cam açılma ve fitil kapanma
                if (audio.playWindowSound) audio.playWindowSound(true);
                setTimeout(() => {
                    if (audio.playWindowSound) audio.playWindowSound(false);
                }, 2500);
                break;
            case 'lights_weather':
                // 7. Kokpit far anahtarı, yağmur ve silecek süpürme
                if (audio.playSwitchClick) audio.playSwitchClick();
                setTimeout(() => {
                    if (audio.playWiperCycle) audio.playWiperCycle();
                }, 600);
                break;
            case 'timetable':
                // 8. Takograf ve hat tabelası dijital bildirim sesi
                if (audio.playTachographBeep) audio.playTachographBeep();
                break;
            case 'lost_found':
                // 9. Bahşiş ve eşya bulma şıngırtısı
                if (audio.playCoinSound) audio.playCoinSound();
                break;
            case 'luggage':
                // 10. Havalı bagaj kapağı açılma ve kapanma
                if (audio.playLuggageBays) audio.playLuggageBays(true);
                setTimeout(() => {
                    if (audio.playLuggageBays) audio.playLuggageBays(false);
                }, 2200);
                break;
            case 'badges_collection':
                // 11. Madalya / kupa zafer melodisi
                if (audio.playSuccess) audio.playSuccess();
                break;
            case 'voice_guide':
                // 12. Telsiz bas-konuş ve mandal bırakma sesi
                if (audio.playRadioTalk) audio.playRadioTalk(true);
                setTimeout(() => {
                    if (audio.playRadioTalk) audio.playRadioTalk(false);
                }, 1200);
                break;
            default:
                if (audio.playSelect) audio.playSelect();
                break;
        }
    }

    playLesson(lessonId) {
        const lesson = this.tutorialLessons.find(l => l.id === lessonId);
        if (!lesson) return;
        if (typeof audio !== 'undefined') {
            audio.stopSpeech();
            this.playLessonSoundEffect(lessonId);
            const fullText = `${lesson.stageName}. ${lesson.title}. ${lesson.speech}`;
            // Ses efektinin girişiyle birlikte anlatım başlasın
            setTimeout(() => {
                audio.speak(fullText);
            }, 300);
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
            "Sürüş eğitimi başlatılıyor. Otobüsü nasıl süreceğinizi ve tüm tuşları adım adım anlatıyorum."
        ];
        this.tutorialLessons.forEach(l => {
            sequence.push(l.stageName + ". " + l.title + ". " + l.speech);
        });
        sequence.push("Tüm sürüş adımlarını öğrendiniz! Artık direksiyon başına geçip yolcularınızı taşımaya başlayabilirsiniz. İyi sürüşler dilerim!");

        audio.speakSequence(sequence);
        if (typeof UI !== 'undefined' && UI.showToast) {
            UI.showToast("▶️ Sesli Sürüş Eğitimi Başlatıldı", "success");
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
            audio.speak(`Şoförlük durumunuz açıldı. Şu an Seviye ${level}, ${title} durumundasınız. Toplam tecrübeniz ${xp} puandır.`);
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
        if (command.includes("403") || command.includes("o403") || command.includes("efsane")) {
            if (typeof BusFleet !== 'undefined') {
                BusFleet.selectBus("mercedes_o403_rhd");
                return;
            }
        }
        if (command.includes("safir") || command.includes("temsa")) {
            if (typeof BusFleet !== 'undefined') {
                BusFleet.selectBus("temsa_safir_plus");
                return;
            }
        }
        if (command.includes("isuzu") || command.includes("novo") || command.includes("midibüs")) {
            if (typeof BusFleet !== 'undefined') {
                BusFleet.selectBus("isuzu_novo_lux");
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
        if (command.includes("saray") && (command.includes("sefer") || command.includes("şehir içi") || command.includes("sehir ici") || command.includes("hastane") || command.includes("çarşı") || command.includes("otogar") || command.includes("kampüs"))) {
            if (typeof SarayNavigasyon !== 'undefined') {
                const toTarget = command.includes("hastane") ? "Saray Devlet Hastanesi" :
                                 (command.includes("kampüs") ? "Saray Fakülte Kampüsü" :
                                 (command.includes("çarşı") ? "Ayaspaşa Çarşı" : "Saray Devlet Hastanesi"));
                audio.speak("Saray içi Otogardan " + toTarget + " durağına belediye ring seferi başlatılıyor.");
                SarayNavigasyon.baslat("Saray Otogarı", toTarget);
                return;
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

                                                                                                // --- TÜRKİYE DENİZLERİ SESLİ BİLGİLENDİRME VE REHBERLİK ---
        if (command.includes("denizler") || command.includes("türkiyenin denizleri") || command.includes("kaç deniz") || command.includes("denizlerimiz")) {
            audio.speak("Türkiye üç tarafı denizlerle çevrili bir yarımadadır: Kuzeyde 1695 kilometre kıyısıyla Karadeniz, batıda girintili çıkıntılı koylarıyla Ege Denizi, güneyde en sıcak ve en tuzlu denizimiz Akdeniz ve tamamı sınırlarımızda olan iç denizimiz Marmara Denizi yer alır. Ayrıca Doğu Anadolu'da yöre halkının deniz olarak andığı Van Gölü bulunur.");
            return;
        }

        if (command.includes("karadeniz")) {
            audio.speak("Karadeniz, Türkiye'nin kuzey sınırını oluşturan en uzun kıyı şeridine sahip denizimizdir. Kıyı uzunluğu 1695 kilometredir. Binde 18 ile Türkiye'nin en az tuzlu denizidir. D-010 Karadeniz Sahil Yolu ile Artvin'den Kırklareli'ye kadar uzanır. En kuzey noktası Sinop İnceburun'dur.");
            return;
        }

        if (command.includes("marmara")) {
            audio.speak("Marmara Denizi, tamamı Türkiye sınırları içinde yer alan iç denizimizdir. 927 kilometre kıyı şeridine sahiptir. İstanbul ve Çanakkale Boğazları ile Karadeniz ve Ege'yi birbirine bağlar. Kıyılarında Tekirdağ, İstanbul, Kocaeli, Yalova, Bursa, Balıkesir ve Çanakkale yer alır.");
            return;
        }

        if (command.includes("ege denizi") || (command.includes("ege") && (command.includes("sahil") || command.includes("deniz") || command.includes("kıyı")))) {
            audio.speak("Ege Denizi, Türkiye'nin batısında dağların denize dik uzanmasıyla oluşan binlerce koy, körfez ve yarımadaya sahiptir. Çanakkale, Balıkesir, İzmir, Aydın ve Muğla kıyılarını yıkar. Antik kentleri ve zeytinlikleriyle ünlüdür.");
            return;
        }

        if (command.includes("akdeniz")) {
            audio.speak("Akdeniz, Türkiye'nin güney sınırında yer alan, güneşlenme süresi en yüksek, suyu en sıcak ve tuzluluk oranı binde 38 ile en yüksek denizimizdir. Muğla, Antalya, Mersin, Adana ve Hatay kıyılarını kapsar. Efsanevi D-400 Sahil Yolu boyunca Toroslar eşliğinde uzanır.");
            return;
        }

        if (command.includes("van denizi") || command.includes("van gölü")) {
            audio.speak("Van Gölü, 3713 kilometrekarelik alanıyla Türkiye'nin en büyük gölü olup yöre halkı tarafından 'Van Denizi' olarak anılır. Suları sodalı ve tuzludur. Tatvan ile Van arasında tren feribotu seferleri yapılmaktadır.");
            return;
        }

        if (command.includes("sinop")) {
            if (command.includes("kaç km") || command.includes("mesafe") || command.includes("ne kadar")) {
                audio.speak("Tekirdağ ile Sinop arası resmi karayolu mesafesi 810 kilometredir. Gerede, Ilgaz, Boyabat veya Samsun sahil yolu üzerinden ulaşılmaktadır.");
                return;
            }
            audio.speak("Sinop, Karadeniz Bölgesi'nde Boztepe Yarımadası üzerinde yer alır ve Türkiye'nin en kuzey noktası İnceburun'a ev sahipliği yapar. Koordinatları 42 derece 1 dakika Kuzey, 35 derece 9 dakika Doğudur. Kara komşuları Kastamonu, Çorum ve Samsun'dur.");
            return;
        }

                                                                                if (command.includes("yalova")) {
            if (command.includes("kaç km") || command.includes("mesafe") || command.includes("ne kadar")) {
                audio.speak("Tekirdağ ile Yalova arası resmi karayolu mesafesi Osmangazi Köprüsü üzerinden 220 kilometredir.");
                return;
            }
            audio.speak("Yalova, Marmara Bölgesi'nin güneyinde Samanlı Dağları eteklerinde yer alır. Atatürk'ün Yürüyen Köşkü, şifalı Termal kaplıcaları ve Osmangazi Köprüsüyle ünlüdür. Koordinatları 40 derece 39 dakika Kuzey, 29 derece 16 dakika Doğudur. Kara komşuları Kocaeli ve Bursa'dır. Kuzey ve batısında Marmara Denizi yer alır.");
            return;
        }

                                                                if (command.includes("gümüşhane") || command.includes("gumushane")) {
                if (command.includes("mesafe") || command.includes("kaç km") || command.includes("uzaklık")) {
                    audio.speak("Tekirdağ ile Gümüşhane arası resmi karayolu mesafesi Kuzey Marmara Otoyolu, Bolu, Amasya, Erzincan ve Kelkit aksı üzerinden 1140 kilometredir.");
                    return;
                }
                audio.speak("Gümüşhane, Doğu Karadeniz'in iç kesiminde Harşit Vadisi boyunca uzanan dağlar arasındaki tarihi maden ve kültür kentimizdir. 14.5 kilometrelik Yeni Zigana Tüneli, Karaca Mağarası, Tomara Şelalesi, Torul Kalesi Cam Terası, meşhur pestili ve kömesiyle tanınır. Koordinatları 40 derece 27 dakika Kuzey, 39 derece 28 dakika Doğudur. Komşuları Trabzon, Bayburt, Erzincan ve Giresun'dur.");
                return;
            }
                        if (command.includes("tesis") || command.includes("mola") || command.includes("dinlenme tesisi") || command.includes("çorba") || command.includes("tost")) {
                            if (command.includes("rol yapma") || command.includes("kolonya") || command.includes("ikram") || command.includes("polis") || command.includes("takograf")) {
                if (typeof RoleplaySystem !== 'undefined') {
                    RoleplaySystem.openModal();
                }
                return;
            }
            if (typeof HighwayFacilities !== 'undefined') {
                    HighwayFacilities.openFacilityModal();
                }
                return;
            }
            if (command.includes("hgs") || command.includes("gişe") || command.includes("otoyol ücreti") || command.includes("bakiye")) {
                if (typeof HighwayFacilities !== 'undefined') {
                    HighwayFacilities.openHgsModal();
                }
                return;
            }
            if (command.includes("giresun")) {
                if (command.includes("mesafe") || command.includes("kaç km") || command.includes("uzaklık")) {
                    audio.speak("Tekirdağ ile Giresun arası resmi karayolu mesafesi Kuzey Marmara Otoyolu, Bolu Dağı, Samsun ve Karadeniz Sahil Yolu üzerinden 1050 kilometredir.");
                    return;
                }
                audio.speak("Giresun, Doğu Karadeniz Bölgesi'nde yemyeşil fındık bahçeleri ve masmavi Karadeniz kıyısında kurulu tarihi sahil kentimizdir. Tarihi Giresun Kalesi, Karadeniz'in tek yaşanabilir adası olan Giresun Adası, Kümbet Yaylası, dünyaca meşhur tombul fındığı, Görele pidesi ve kemençesiyle ünlüdür. Koordinatları 40 derece 55 dakika Kuzey, 38 derece 23 dakika Doğudur. Komşuları Trabzon, Gümüşhane, Erzincan, Sivas ve Ordu'dur.");
                return;
            }
            if (command.includes("gaziantep") || command.includes("antep")) {
                if (command.includes("mesafe") || command.includes("kaç km") || command.includes("uzaklık")) {
                    audio.speak("Tekirdağ ile Gaziantep arası resmi karayolu mesafesi Kuzey Marmara, O-4, Ankara Niğde Otoyolu ve TAG Otoyolu üzerinden 1260 kilometredir.");
                    return;
                }
                audio.speak("Gaziantep, Güneydoğu Anadolu Bölgesi'nde yer alan kadim gastronomi ve sanayi metropolümüzdür. UNESCO tescilli mutfağı, Zeugma Mozaik Müzesi, Çingene Kızı mozaiği, Antep Kalesi, Bakırcılar Çarşısı, Rumkale, fıstık ve baklavasıyla dünyaca ünlüdür. Koordinatları 37 derece 4 dakika Kuzey, 37 derece 23 dakika Doğudur. Komşuları Adıyaman, Şanlıurfa, Kilis, Hatay, Osmaniye ve Kahramanmaraş'tır.");
                return;
            }
            if (command.includes("eskişehir") || command.includes("eskisehir")) {
                if (command.includes("mesafe") || command.includes("kaç km") || command.includes("uzaklık")) {
                    audio.speak("Tekirdağ ile Eskişehir arası resmi karayolu mesafesi Osmangazi Köprüsü, Bursa ve Bozüyük aksı üzerinden 430 kilometredir.");
                    return;
                }
                audio.speak("Eskişehir, İç Anadolu Bölgesi'nde Porsuk Çayı kıyısında yer alan modern bir üniversite ve kültür şehridir. Tarihi Odunpazarı Evleri, Sazova Parkı, Masal Şatosu, lületaşı, çibörek, met helvası ve Frig Vadisiyle ünlüdür. Koordinatları 39 derece 46 dakika Kuzey, 30 derece 31 dakika Doğudur. Komşuları Bilecik, Bolu, Ankara, Konya, Afyonkarahisar ve Kütahya'dır.");
                return;
            }
            if (command.includes("erzurum")) {
            if (command.includes("kaç km") || command.includes("mesafe") || command.includes("ne kadar")) {
                audio.speak("Tekirdağ ile Erzurum arası resmi karayolu mesafesi Kuzey Marmara Otoyolu, D-100 ve Erzincan Aşkale aksı üzerinden 1360 kilometredir.");
                return;
            }
            audio.speak("Erzurum, Doğu Anadolu Bölgesi'nde Palandöken Dağları eteklerinde yer alır. Çifte Minareli Medrese, Palandöken Kayak Merkezi, Tortum Şelalesi ve cağ kebabıyla ünlüdür. Koordinatları 39 derece 54 dakika Kuzey, 41 derece 16 dakika Doğudur. Komşuları Artvin, Rize, Bayburt, Erzincan, Bingöl, Muş, Ağrı, Kars ve Ardahan'dır.");
            return;
        }

        if (command.includes("konya")) {
            if (command.includes("kaç km") || command.includes("mesafe") || command.includes("ne kadar")) {
                audio.speak("Tekirdağ ile Konya arası resmi karayolu mesafesi Kuzey Marmara Otoyolu, Sakarya ve Afyonkarahisar Akşehir D-300 aksı üzerinden 700 kilometredir.");
                return;
            }
            audio.speak("Konya, İç Anadolu Bölgesi'nde yer alan Türkiye'nin yüzölçümü en büyük ilidir. Selçuklu başkenti, Hz. Mevlana'nın türbesi ve UNESCO Çatalhöyük antik kentiyle tanınır. Koordinatları 37 derece 52 dakika Kuzey, 32 derece 29 dakika Doğudur. Komşuları Ankara, Aksaray, Niğde, Karaman, Mersin, Antalya, Isparta, Afyonkarahisar ve Eskişehir'dir.");
            return;
        }

        if (command.includes("erzincan")) {
            if (command.includes("kaç km") || command.includes("mesafe") || command.includes("ne kadar")) {
                audio.speak("Tekirdağ ile Erzincan arası resmi karayolu mesafesi Kuzey Marmara Otoyolu, D-100 ve Refahiye Kızıldağ Geçidi aksı üzerinden 1170 kilometredir.");
                return;
            }
            audio.speak("Erzincan, Doğu Anadolu Bölgesi'nde Karasu Fırat Vadisi'nde yer alır. Girlevik Şelalesi, Ergan Dağı Kayak Merkezi, Kemaliye Karanlık Kanyonu ve tulum peyniriyle ünlüdür. Koordinatları 39 derece 45 dakika Kuzey, 39 derece 29 dakika Doğudur. Komşuları Sivas, Gümüşhane, Bayburt, Erzurum, Tunceli, Bingöl, Elazığ, Malatya ve Giresun'dur.");
            return;
        }

        if (command.includes("elazığ") || command.includes("elazig")) {
            if (command.includes("kaç km") || command.includes("mesafe") || command.includes("ne kadar")) {
                audio.speak("Tekirdağ ile Elazığ arası resmi karayolu mesafesi Kuzey Marmara Otoyolu, Malatya Kömürhan Köprüsü ve D-300 aksı üzerinden 1350 kilometredir.");
                return;
            }
            audio.speak("Elazığ, Doğu Anadolu Bölgesi'nin Yukarı Fırat Bölümü'nde Keban ve Hazar Gölleri arasında yer alır. Tarihi Harput Kalesi, Hazarbaba Kayak Merkezi ve Çayda Çıra kültürüyle ünlüdür. Koordinatları 38 derece 40 dakika Kuzey, 39 derece 13 dakika Doğudur. Komşuları Tunceli, Bingöl, Diyarbakır, Malatya ve Erzincan'dır.");
            return;
        }

        if (command.includes("bayburt")) {
            if (command.includes("kaç km") || command.includes("mesafe") || command.includes("ne kadar")) {
                audio.speak("Tekirdağ ile Bayburt arası resmi karayolu mesafesi Kuzey Marmara Otoyolu ve Kop Dağı Erzurum aksı üzerinden 1265 kilometredir.");
                return;
            }
            audio.speak("Bayburt, Doğu Karadeniz Bölgesi'nin iç kesiminde Çoruh Nehri kıyısında yer alır. Tarihi Bayburt Kalesi, Dede Korkut Türbesi, Baksı Müzesi ve Saat Kulesiyle ünlüdür. Koordinatları 40 derece 15 dakika Kuzey, 40 derece 13 dakika Doğudur. Komşuları Trabzon, Rize, Erzurum, Erzincan ve Gümüşhane'dir.");
            return;
        }

        if (command.includes("diyarbakır") || command.includes("diyarbakir")) {
            if (command.includes("kaç km") || command.includes("mesafe") || command.includes("ne kadar")) {
                audio.speak("Tekirdağ ile Diyarbakır arası resmi karayolu mesafesi Anadolu Otoyolu, Adana Gaziantep Otoyolu ve Şanlıurfa üzerinden 1560 kilometredir.");
                return;
            }
            audio.speak("Diyarbakır, Güneydoğu Anadolu Bölgesi'nde Dicle Nehri kıyısında yer alır. UNESCO Dünya Mirası Diyarbakır Surları, Hevsel Bahçeleri ve Ulu Camisiyle ünlüdür. Koordinatları 37 derece 55 dakika Kuzey, 40 derece 14 dakika Doğudur. Komşuları Elazığ, Bingöl, Muş, Batman, Mardin, Şanlıurfa, Adıyaman ve Malatya'dır.");
            return;
        }

        if (command.includes("çorum") || command.includes("corum")) {
            if (command.includes("kaç km") || command.includes("mesafe") || command.includes("ne kadar")) {
                audio.speak("Tekirdağ ile Çorum arası resmi karayolu mesafesi Kuzey Marmara Otoyolu, Gerede ve Sungurlu D-200 aksı üzerinden 745 kilometredir.");
                return;
            }
            audio.speak("Çorum, Orta Karadeniz Bölgesi'nin iç kesiminde yer alır. Hitit İmparatorluğu'nun başkenti Hattuşa'ya ev sahipliği yapar ve dünyaca ünlü Çorum leblebisiyle tanınır. Koordinatları 40 derece 33 dakika Kuzey, 34 derece 57 dakika Doğudur. Komşuları Sinop, Samsun, Amasya, Yozgat, Kırıkkale, Çankırı ve Kastamonu'dur.");
            return;
        }

        if (command.includes("çankırı") || command.includes("cankiri")) {
            if (command.includes("kaç km") || command.includes("mesafe") || command.includes("ne kadar")) {
                audio.speak("Tekirdağ ile Çankırı arası resmi karayolu mesafesi Kuzey Marmara Otoyolu ve Gerede Çerkeş D-100 hattı üzerinden 550 kilometredir.");
                return;
            }
            audio.speak("Çankırı, İç Anadolu Bölgesi'nin kuzeyinde Ilgaz Dağları eteklerinde yer alır. Kaya tuzu mağarası, Selçuklu eseri Taş Mescit ve Ilgaz Kayak Merkeziyle ünlüdür. Koordinatları 40 derece 36 dakika Kuzey, 33 derece 37 dakika Doğudur. Komşuları Bolu, Karabük, Kastamonu, Çorum, Kırıkkale ve Ankara'dır.");
            return;
        }

        if (command.includes("bursa")) {
            if (command.includes("kaç km") || command.includes("mesafe") || command.includes("ne kadar")) {
                audio.speak("Tekirdağ ile Bursa arası resmi karayolu mesafesi 1915 Çanakkale Köprüsü üzerinden 275 kilometre, Osmangazi Köprüsü üzerinden 350 kilometredir.");
                return;
            }
            audio.speak("Bursa, Marmara Bölgesi'nin güneyinde, Uludağ eteklerinde yer alır. Osmanlı Devleti'nin ilk başkentlerindendir. Koordinatları 40 derece 11 dakika Kuzey, 29 derece 4 dakika Doğudur. Komşuları Yalova, Kocaeli, Sakarya, Bilecik, Kütahya ve Balıkesir'dir. Kuzeyinde Marmara Denizi yer alır.");
            return;
        }

        if (command.includes("burdur")) {
            if (command.includes("kaç km") || command.includes("mesafe") || command.includes("ne kadar")) {
                audio.speak("Tekirdağ ile Burdur arası resmi karayolu mesafesi 710 kilometredir. Afyonkarahisar ve Sandıklı üzerinden D-650 karayoluyla Göller Yöresi'ne ulaşılmaktadır.");
                return;
            }
            audio.speak("Burdur, Akdeniz Bölgesi'nin Göller Yöresi'nde yer alır. Koordinatları 37 derece 43 dakika Kuzey, 30 derece 17 dakika Doğudur. Komşuları Afyonkarahisar, Isparta, Antalya, Muğla ve Denizli'dir.");
            return;
        }

        if (command.includes("bolu")) {
            if (command.includes("kaç km") || command.includes("mesafe") || command.includes("ne kadar")) {
                audio.speak("Tekirdağ ile Bolu arası resmi karayolu mesafesi 395 kilometredir. Kuzey Marmara Otoyolu, Sakarya, Düzce ve Bolu Dağı Tüneli üzerinden ulaşılmaktadır.");
                return;
            }
            audio.speak("Bolu, Karadeniz Bölgesi'nin batısında, İstanbul ile Ankara arasındaki en önemli geçiş güzergahında yer alır. Koordinatları 40 derece 44 dakika Kuzey, 31 derece 36 dakika Doğudur. Komşuları Düzce, Sakarya, Bilecik, Eskişehir, Ankara, Çankırı, Karabük ve Zonguldak'tır.");
            return;
        }

        if (command.includes("bitlis")) {
            if (command.includes("kaç km") || command.includes("mesafe") || command.includes("ne kadar")) {
                audio.speak("Tekirdağ ile Bitlis arası resmi karayolu mesafesi 1520 kilometredir. Ankara, Malatya, Elazığ, Bingöl ve Muş üzerinden D-300 karayoluyla Van Gölü havzasına ulaşılmaktadır.");
                return;
            }
            audio.speak("Bitlis, Doğu Anadolu Bölgesi'nde Van Gölü'nün batısında yer alır. Koordinatları 38 derece 24 dakika Kuzey, 42 derece 6 dakika Doğudur. Komşuları Van, Ağrı, Muş, Batman ve Siirt'tir.");
            return;
        }

        if (command.includes("bingöl") || command.includes("bingol")) {
            if (command.includes("kaç km") || command.includes("mesafe") || command.includes("ne kadar")) {
                audio.speak("Tekirdağ ile Bingöl arası resmi karayolu mesafesi 1425 kilometredir. Ankara, Sivas, Erzincan ya da Elazığ üzerinden D-300 karayoluyla ulaşılmaktadır.");
                return;
            }
            audio.speak("Bingöl, Doğu Anadolu Bölgesi'nde Yukarı Fırat ve Murat havzasında yer alır. Koordinatları 38 derece 53 dakika Kuzey, 40 derece 30 dakika Doğudur. Komşuları Erzurum, Erzincan, Muş, Diyarbakır, Elazığ ve Tunceli'dir.");
            return;
        }

        if (command.includes("bilecik")) {
            if (command.includes("kaç km") || command.includes("mesafe") || command.includes("ne kadar")) {
                audio.speak("Tekirdağ ile Bilecik arası resmi karayolu mesafesi 380 kilometredir. Kuzey Marmara Otoyolu, Sakarya ve D-650 karayolu üzerinden ulaşılmaktadır.");
                return;
            }
            audio.speak("Bilecik, Marmara Bölgesi'nin güneydoğusunda, Osmanlı Devleti'nin kurulduğu topraklarda yer alır. Koordinatları 40 derece 8 dakika Kuzey, 29 derece 58 dakika Doğudur. Komşuları Sakarya, Bursa, Bolu, Eskişehir ve Kütahya'dır.");
            return;
        }

        if (command.includes("balıkesir") || command.includes("balikesir")) {
            if (command.includes("kaç km") || command.includes("mesafe") || command.includes("ne kadar")) {
                audio.speak("Tekirdağ ile Balıkesir arası resmi karayolu mesafesi 295 kilometredir. 1915 Çanakkale Köprüsü veya Bandırma deniz/kara hattı üzerinden ulaşılmaktadır.");
                return;
            }
            audio.speak("Balıkesir, Marmara Bölgesi'nin güneyinde, hem Marmara hem de Ege Denizi'ne kıyısı olan kavşak bir ildir. Koordinatları 39 derece 39 dakika Kuzey, 27 derece 53 dakika Doğudur. Komşuları Çanakkale, Bursa, Kütahya, Manisa ve İzmir'dir.");
            return;
        }

        if (command.includes("aydın") || command.includes("aydin")) {
            if (command.includes("kaç km") || command.includes("mesafe") || command.includes("ne kadar")) {
                audio.speak("Tekirdağ ile Aydın arası resmi karayolu mesafesi 630 kilometredir. Çanakkale Köprüsü, Balıkesir, Manisa, İzmir ve O-31 Otoyolu güzergahı kullanılır.");
                return;
            }
            audio.speak("Aydın, Ege Bölgesi'nde Büyük Menderes Havzası'nda yer alır. Koordinatları 37 derece 51 dakika Kuzey, 27 derece 51 dakika Doğudur. Komşuları İzmir, Manisa, Denizli ve Muğla'dır. Batısında Ege Denizi uzanır.");
            return;
        }

        if (command.includes("artvin")) {
            if (command.includes("kaç km") || command.includes("mesafe") || command.includes("ne kadar")) {
                audio.speak("Tekirdağ ile Artvin arası resmi karayolu mesafesi 1440 kilometredir. Güzergah Karadeniz Sahil Yolu, Hopa ve Cankurtaran Tüneli üzerinden Çoruh Vadisi'ne uzanmaktadır.");
                return;
            }
            audio.speak("Artvin, Doğu Karadeniz Bölgesi'nde Çoruh Vadisi yamaçlarında yer alır. Koordinatları 41 derece 11 dakika Kuzey, 41 derece 49 dakika Doğudur. Komşuları Rize, Erzurum ve Ardahan'dır. Kuzeyinde Gürcistan sınırı ve Karadeniz bulunur.");
            return;
        }

        if (command.includes("çanakkale") || command.includes("canakkale")) {
            if (command.includes("kaç km") || command.includes("mesafe") || command.includes("ne kadar")) {
                audio.speak("Tekirdağ ile Çanakkale arası resmi karayolu mesafesi 170 kilometredir. Malkara ve Keşan üzerinden Gelibolu ve 1915 Çanakkale Köprüsü güzergahı kullanılır.");
                return;
            }
            audio.speak("Çanakkale, Marmara Bölgesi'nin güneybatısında, Çanakkale Boğazı'nın iki yakasında yer alır. Koordinatları 40 derece 9 dakika Kuzey, 26 derece 24 dakika Doğudur. Komşuları Tekirdağ, Edirne ve Balıkesir'dir.");
            return;
        }

        if (command.includes("koordinat") || command.includes("konum") || command.includes("tekirdağ nerede") || command.includes("nerede")) {
            audio.speak("Tekirdağ, Türkiye'nin kuzeybatısında Trakya yakasında yer alır. Koordinatları: 40 derece 59 dakika Kuzey, 27 derece 31 dakika Doğudur. Doğuda İstanbul, batıda Edirne ve Çanakkale, kuzeyde Kırklareli, güneyde Marmara Denizi ile çevrilidir.");
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
            if (command.includes("kaç derece") || command.includes("sıcaklık") || command.includes("hava") || command.includes("yağmur") || command.includes("yağış")) {
                let durum = (Game.weather === 'sunny') 
                    ? (Game.isNight ? 'açık gece' : 'güneşli') 
                    : (Game.weather === 'rainy' ? `yağmurlu, saatte ${Game.rainMmPerHour || 5} milimetre yağış var` : 'karlı');
                audio.speak(`Dış sıcaklık ${Game.temperature} derece, araç içi ${Math.floor(Game.busTemperature)} derece. Hava ${durum}. ${Game.isACOn ? "Klima açık." : "Klima kapalı."}`);
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
        audio.speak("Anlayamadım. Oyunu ve tuşları öğrenmek için 'yardım' diyebilir veya klavyeden F1 tuşuna basabilirsiniz.");
    }
}

// Global olarak başlat
document.addEventListener('DOMContentLoaded', () => {
    window.voiceAssistant = new VoiceAssistant();
    if (window.voiceAssistant.initTutorialUI) {
        window.voiceAssistant.initTutorialUI();
    }
});
