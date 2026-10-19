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
        this.currentStageFilter = 'all'; // 'all', 1, 2, 3, 4, 'karne'

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

        const welcomeMsg = "Mikyas Kaptanlık Akademisi ve Pedagojik Sürüş Rehberi açıldı. 4 gelişim aşaması ve Kaptanlık Karneniz hazır. Dersleri ve terfi hedeflerinizi dinlemek için yön tuşlarıyla gezinebilirsiniz. Kapatmak için Esc veya F1 tuşuna basınız.";
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

    renderTutorialContent() {
        const listEl = document.getElementById('tutorial-lessons-list');
        const karneContainer = document.getElementById('tutorial-karne-container');
        if (!listEl) return;

        // Sekme butonlarının aktiflik stilini güncelle
        const tabs = ['all', 'stage1', 'stage2', 'stage3', 'stage4', 'karne'];
        tabs.forEach(t => {
            const btn = document.getElementById(`tab-acad-${t}`);
            if (btn) {
                const isActive = (this.currentStageFilter === t);
                btn.style.background = isActive ? 'rgba(16, 185, 129, 0.35)' : 'rgba(255, 255, 255, 0.08)';
                btn.style.borderColor = isActive ? '#10b981' : 'rgba(255, 255, 255, 0.2)';
                btn.style.color = isActive ? '#34d399' : '#cbd5e1';
                btn.style.fontWeight = isActive ? 'bold' : 'normal';
            }
        });

        if (this.currentStageFilter === 'karne') {
            listEl.style.display = 'none';
            if (karneContainer) {
                karneContainer.style.display = 'block';
                this.renderGelisimKarnesi();
            }
            return;
        }

        listEl.style.display = 'block';
        if (karneContainer) karneContainer.style.display = 'none';
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
            btn.style.padding = '12px 16px';
            btn.style.display = 'flex';
            btn.style.flexDirection = 'column';
            btn.style.gap = '4px';
            btn.style.borderRadius = '8px';
            btn.style.border = '1px solid rgba(16, 185, 129, 0.35)';
            btn.style.background = 'rgba(6, 78, 59, 0.25)';
            btn.style.cursor = 'pointer';

            btn.setAttribute('aria-label', `${lesson.stageName}. ${lesson.title}. Tuşlar: ${lesson.keys}. Dinlemek için Enter'a basınız.`);

            btn.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
                    <div>
                        <span style="font-size: 0.78rem; color: #a7f3d0; text-transform: uppercase; letter-spacing: 1px; display: block;">${lesson.stageName}</span>
                        <span style="font-weight: bold; color: #34d399; font-size: 1.05rem;">${lesson.title}</span>
                    </div>
                    <span style="font-size: 0.85rem; color: #a7f3d0; background: rgba(16, 185, 129, 0.2); padding: 4px 10px; border-radius: 4px;">▶ Dinle</span>
                </div>
                <div style="font-size: 0.88rem; color: #fde047; margin-top: 2px;"><strong>Tuşlar / Aksiyon:</strong> ${lesson.keys}</div>
                <div style="font-size: 0.84rem; color: #cbd5e1; line-height: 1.35; margin-top: 2px;">${lesson.speech}</div>
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

    renderGelisimKarnesi() {
        const karneContainer = document.getElementById('tutorial-karne-container');
        if (!karneContainer) return;

        const level = (typeof Game !== 'undefined' && Game.licenseLevel) ? Game.licenseLevel : 1;
        const xp = (typeof Game !== 'undefined' && Game.playerXP) ? Game.playerXP : 0;
        const tasks = (typeof Game !== 'undefined' && Game.completedTasks) ? Game.completedTasks : 0;
        const title = (typeof Game !== 'undefined' && typeof Game.getLicenseTitle === 'function') ? Game.getLicenseTitle() : 'Stajyer';
        const nextXP = (typeof Game !== 'undefined' && typeof Game.getNextLevelXP === 'function') ? Game.getNextLevelXP(level) : 250;
        const unlockTeaser = (typeof Game !== 'undefined' && typeof Game.getUnlockTeaser === 'function') ? Game.getUnlockTeaser(level) : "Seviye 3'te BMC Neocity 10M açılacak!";

        // Pedagojik Öğretmen Değerlendirmesi
        let teacherFeedback = "";
        if (level < 3) {
            teacherFeedback = "Öğretmen Değerlendirmesi: Sevgili Kaptanım, sürüş yolculuğunuzun başındasınız. Mahalle hatlarında duraklara yumuşak yanaşmaya, kapı kontrollerine ve pusulaya odaklanınız. Sebat ve gayretiniz sizi büyük bir kaptan yapacaktır.";
        } else if (level < 6) {
            teacherFeedback = "Öğretmen Değerlendirmesi: Temel sürüş refleksleriniz çok iyi gelişiyor. Engelli rampasını özenle kullanmanız ve kasislerde hızınızı 30'un altına düşürmeniz yolcu memnuniyetini zirveye taşıyor.";
        } else if (level < 10) {
            teacherFeedback = "Öğretmen Değerlendirmesi: Artık deneyimli bir şehir içi kaptanısınız! Körüklü otobüs ve zorlu ring hatlarında dakikliği koruyarak yakında Şehirlerarası Uzun Yol ve Mercedes Travego brövesini almaya hak kazanacaksınız.";
        } else {
            teacherFeedback = "Öğretmen Değerlendirmesi: Tebrikler Usta Kaptan! Şehirlerarası uzun yol etapları ve Türkiye Turnesi koridorlarında örnek bir kaptanlık sergiliyorsunuz. Tüm araç filosu emrinizde.";
        }

        const xpPercent = Math.min(100, Math.round((xp / nextXP) * 100));

        karneContainer.innerHTML = `
            <div style="background: linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(6, 78, 59, 0.4)); border: 2px solid #10b981; border-radius: 12px; padding: 20px; box-shadow: 0 0 20px rgba(16, 185, 129, 0.2);">
                <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(16, 185, 129, 0.3); padding-bottom: 12px; margin-bottom: 16px;">
                    <div>
                        <span style="font-size: 0.85rem; color: #a7f3d0; text-transform: uppercase; letter-spacing: 1px;">Mikyas Akademi Şoförlük Karnesi</span>
                        <h3 style="color: #34d399; font-size: 1.5rem; margin: 4px 0 0 0;">🎖️ Seviye ${level} - ${title}</h3>
                    </div>
                    <button id="btn-karne-read-speech" class="modern-btn nav-item" style="padding: 10px 16px; background: linear-gradient(135deg, #059669, #047857); border: 1.5px solid #34d399; color: #ffffff; font-weight: bold; border-radius: 8px; cursor: pointer;" aria-label="Gelişim karnemi ve öğretmen değerlendirmesini sesli dinle">
                        🔊 Karnemi Sesli Dinle
                    </button>
                </div>

                <!-- İlerleme Çubukları -->
                <div style="margin-bottom: 16px;">
                    <div style="display: flex; justify-content: space-between; font-size: 0.95rem; margin-bottom: 6px; color: #e2e8f0;">
                        <span>Kazanılan Tecrübe (XP): <strong>${xp} / ${nextXP} XP</strong></span>
                        <span style="color: #38bdf8; font-weight: bold;">%${xpPercent}</span>
                    </div>
                    <div style="height: 12px; background: rgba(0,0,0,0.5); border-radius: 6px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1);">
                        <div style="height: 100%; width: ${xpPercent}%; background: linear-gradient(90deg, #10b981, #38bdf8); transition: width 0.3s ease;"></div>
                    </div>
                </div>

                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 18px;">
                    <div style="background: rgba(0,0,0,0.3); padding: 12px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.08);">
                        <span style="color: #94a3b8; font-size: 0.85rem; display: block;">Tamamlanan Seferler</span>
                        <strong style="color: #facc15; font-size: 1.3rem;">${tasks} Sefer</strong>
                    </div>
                    <div style="background: rgba(0,0,0,0.3); padding: 12px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.08);">
                        <span style="color: #94a3b8; font-size: 0.85rem; display: block;">Gelecek Aşama Kilidi</span>
                        <strong style="color: #38bdf8; font-size: 1rem;">${unlockTeaser}</strong>
                    </div>
                </div>

                <!-- Öğretmen Tavsiyesi Kutusu -->
                <div style="background: rgba(16, 185, 129, 0.12); border-left: 4px solid #10b981; padding: 14px 16px; border-radius: 0 8px 8px 0; margin-bottom: 8px;">
                    <div style="font-weight: bold; color: #a7f3d0; margin-bottom: 4px; font-size: 0.95rem;">👨‍🏫 Öğretmen Vizyonu ve Pedagojik Rehberlik:</div>
                    <p style="color: #e2e8f0; font-size: 0.92rem; line-height: 1.45; margin: 0;">${teacherFeedback}</p>
                </div>
            </div>
        `;

        const btnReadKarne = document.getElementById('btn-karne-read-speech');
        if (btnReadKarne) {
            btnReadKarne.addEventListener('click', () => {
                const speechKarne = `Mikyas Kaptanlık Akademisi Gelişim Karneniz. Mevcut seviyeniz ${level}, unvanınız ${title}. Toplam tecrübeniz ${xp} puan. Gelecek seviye için gereken puan ${nextXP}. Tamamlanan sefer sayısı ${tasks}. ${unlockTeaser}. ${teacherFeedback}`;
                if (typeof audio !== 'undefined' && audio.speak) {
                    audio.stopSpeech();
                    audio.speak(speechKarne);
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

        const tabKarne = document.getElementById('tab-acad-karne');
        if (tabKarne) tabKarne.addEventListener('click', () => this.setAcademyTab('karne'));

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

        // --- ŞEHİR İÇİ ANA ARTER HATTI (HAT 2/7) ---
        if (command.includes("2/7") || command.includes("iki yedi") || command.includes("yüzüncü yıl") || command.includes("tepekent") || command.includes("araştırma hastane")) {
            const isDonus = command.includes("dönüş") || command.includes("geri");
            const targetId = isDonus ? "tekulas_152_2_7_donus" : "tekulas_152_2_7";
            const r2_7 = (typeof routesData !== 'undefined' && routesData[targetId]) || (typeof window !== 'undefined' && window.getTekulasLineById && window.getTekulasLineById(targetId));
            if (r2_7) {
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
