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
                stage: 1,
                stageName: '1. Bölüm: Direksiyon Başına Geçiş',
                title: '1. Motoru Çalıştırma, Gaz ve Fren',
                keys: 'M veya Boşluk (Motor), W (Gaz), S (Fren), A ve D (Direksiyon), R (Hız)',
                tip: 'Kontağı açmak için M tuşuna bas, sonra W ile gaza basıp ilerle.',
                speech: 'Otobüsü sürmek çok kolay! Önce M veya Boşluk tuşuna basarak motoru çalıştırırsın. W tuşuna basılı tuttuğunda gaza basarsın ve otobüs hızlanır. Durmak veya yavaşlamak için S tuşuna basarsın. A tuşu sola, D tuşu sağa döner. Ne kadar hızlı gittiğini öğrenmek için de R tuşuna basabilirsin.'
            },
            {
                id: 'stops',
                stage: 1,
                stageName: '1. Bölüm: Direksiyon Başına Geçiş',
                title: '2. Duraklarda Yolcu Alma ve İndirme',
                keys: '1 (Ön Kapı), 2 (Arka Kapı)',
                tip: 'Durakta tam durduktan sonra 1 ile ön kapıyı, 2 ile arka kapıyı aç.',
                speech: 'Durağa geldiğinde S tuşuna basıp tam dur. 1 tuşuna basarak ön kapıyı aç, yeni binen yolcular kartlarını okutsun. 2 tuşuna basarak arka kapıyı aç, inecek yolcular insin. Herkes binip indikten sonra yine 1 ve 2 tuşlarıyla kapıları kapat. Kapılar açıkken otobüs gitmez, kapıları kapatıp gaza basabilirsin.'
            },
            {
                id: 'compass',
                stage: 1,
                stageName: '1. Bölüm: Direksiyon Başına Geçiş',
                title: '3. Yönünü Bulma ve Pusula',
                keys: 'Y (Hangi Yöne Gidiyorum?), Shift + Ok Tuşları (Yön Değiştir)',
                tip: 'Nereye gittiğini merak ettiğinde Y tuşuna basarak yönünü öğrenebilirsin.',
                speech: 'Nereye doğru gittiğini öğrenmek için Y tuşuna bas. Oyun sana Kuzey, Güney, Doğu veya Batı diye sesli söyler. Dönüş yapacağın zaman Shift tuşuyla birlikte Yön Oklarına basarak otobüsün yönünü çevirebilirsin.'
            },

            {
                id: 'cockpit_navigation',
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
                stage: 2,
                stageName: '2. Bölüm: Yolcularımız ve Duraklar',
                title: '4. Tekerlekli Sandalyeli Yolcular ve Rampa',
                keys: 'K (Otobüsü Sağa Yatır), U veya R (Engelli Rampası)',
                tip: 'Tekerlekli sandalyeli yolcu görünce rampayı aç, yolcu binince kapat.',
                speech: 'Durakta tekerlekli sandalyeli veya yaşlı bir yolcumuz bekliyorsa oyun sana haber verir. Durup kapıyı açtıktan sonra K tuşuna basarak otobüsü kaldırıma doğru eğebilirsin. U veya R tuşuna basınca rampa açılır ve yolcumuz biner. Yolcumuz binince tekrar U veya R tuşuna basıp rampayı kapatırsın ve yola devam edersin.'
            },
            {
                id: 'bumps',
                stage: 2,
                stageName: '2. Bölüm: Yolcularımız ve Duraklar',
                title: '5. Tümsekler ve Yolcu Memnuniyeti',
                keys: 'S (Tümsekte Yavaşla), C (Yolcu Memnuniyeti)',
                tip: 'Kasis görünce hızını 30 km/s altına düşür ki yolcular sarsılmasın.',
                speech: 'Yolda kasis veya tümsek uyarısı duyduğunda S tuşuna basarak hızını 30 un altına düşür. Çok hızlı geçersen yolcular sarsılır ve puan kaybedersin! Yolcuların senden ne kadar memnun olduğunu görmek için C tuşuna basabilirsin.'
            },
            {
                id: 'comfort_ac',
                stage: 2,
                stageName: '2. Bölüm: Yolcularımız ve Duraklar',
                title: '6. Klima ve Şoför Camı',
                keys: 'K (Klima Aç/Kapat), O (Şoför Camı)',
                tip: 'Hava çok sıcak veya soğuksa klimayı aç, ferahlamak için camı aç.',
                speech: 'Sıcak yaz günlerinde veya kış soğuğunda yolcuların üşümemesi ya da bunalmaması için K tuşuna basarak klimayı açıp kapatabilirsin. Temiz hava almak istediğinde de O tuşuna basarak şoför camını açıp kapatabilirsin.'
            },

            // 3. BÖLÜM: GECE, YAĞMUR VE SEFER KURALLARI
            {
                id: 'lights_weather',
                stage: 3,
                stageName: '3. Bölüm: Gece, Yağmur ve Sefer Kuralları',
                title: '7. Farlar, Yağmur ve Silecekler',
                keys: 'F (Farlar), Shift + W (Silecek), Shift + T (Saat ve Hava)',
                tip: 'Karanlıkta F ile farları yak, yağmurda Shift+W ile silecekleri çalıştır.',
                speech: 'Akşam olduğunda, tünellere girdiğinde veya hava karardığında F tuşuna basarak farlarını yak. Yağmurlu ve karlı havalarda önünü rahat görebilmek için Shift ve W tuşlarına basarak silecekleri çalıştır. Saati ve dışarıdaki hava durumunu öğrenmek için de Shift ve T tuşlarına bas.'
            },
            {
                id: 'timetable',
                stage: 3,
                stageName: '3. Bölüm: Gece, Yağmur ve Sefer Kuralları',
                title: '8. Saate Bakma ve Ön Tabela',
                keys: 'Z (Geç mi Kaldım?), I (Ön Tabela)',
                tip: 'Zamana bakmak için Z tuşuna, ön tabelayı dinlemek için I tuşuna bas.',
                speech: 'Seferde geç mi kaldın yoksa erken mi gidiyorsun öğrenmek için Z tuşuna bas. Otobüsün önündeki ışıklı tabelada hangi hatta gittiğin yazar; tabelada ne yazdığını dinlemek için de I tuşuna basabilirsin.'
            },
            {
                id: 'lost_found',
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
                stage: 4,
                stageName: '4. Bölüm: Uzun Yol ve Usta Şoförlük',
                title: '10. Şehirlerarası Sefer ve Valizler',
                keys: 'P (Bagaj Kapağı)',
                tip: 'Yolcuların valizleri için durakta P tuşuna basıp bagajı aç.',
                speech: 'Şehirlerarası sefere çıktığında yolcuların büyük valizleri olur. Durakta durunca P tuşuna basarak bagaj kapağını açarsın. Valizler yerleşince tekrar P tuşuna basarak kapağı kapatırsın.'
            },
            {
                id: 'badges_collection',
                stage: 4,
                stageName: '4. Bölüm: Uzun Yol ve Usta Şoförlük',
                title: '11. 1500 Başarı ve Keşfedilen Duraklar',
                keys: 'Menüde Başarılar Sekmesi, K (Keşfedilen Duraklar)',
                tip: '1500 farklı göreve bakarak sıradaki hedefini seçebilirsin.',
                speech: 'Oyunda tam 1500 farklı görev ve madalya seni bekliyor! Menüden Başarılar sekmesine girip sıradaki görevini görebilir veya rastgele bir hedef seçtirebilirsin. Yolda giderken K tuşuna basarak şu ana kadar kaç farklı durak keşfettiğini de öğrenebilirsin.'
            },
            {
                id: 'voice_guide',
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
        const tabs = ['lab', 'all', 'stage1', 'stage2', 'stage3', 'stage4', 'seruven', 'karne', 'company'];
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
        const compContainer = document.getElementById('tutorial-company-container');
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

        // 1. İNTERAKTİF SÜRÜŞ ATÖLYESİ (CANLI FORMÜL PRATİĞİ)
        if (this.currentStageFilter === 'lab') {
            if (labContainer) {
                labContainer.style.display = 'block';
                this.renderCompanyGuide() {
        const container = document.getElementById('tutorial-company-container');
        if (!container) return;

        container.innerHTML = `
        <div style="background: linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.95)); border: 2px solid #ca8a04; border-radius: 12px; padding: 18px 22px; color: #fff;">
            
            <!-- BAŞLIK -->
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1.5px solid rgba(250, 204, 21, 0.3); padding-bottom: 12px; margin-bottom: 16px; flex-wrap: wrap; gap: 10px;">
                <div>
                    <h3 style="margin: 0; color: #facc15; font-size: 1.4rem; display: flex; align-items: center; gap: 8px;">
                        <span>🏢</span> <span>Şirket Yönetimi & 6 Yasal Bina Rehberi (B1 Yetki Belgesi)</span>
                    </h3>
                    <p style="margin: 4px 0 0 0; color: #94a3b8; font-size: 0.9rem;">
                        T.C. Ulaştırma ve Altyapı Bakanlığı Karayolu Taşıma Yönetmeliği uyarınca bir otobüs şirketi nasıl kurulur, binalar ne işe yarar ve para akışı nasıl takip edilir?
                    </p>
                </div>
                <button class="modern-btn btn-read-section nav-item" data-text="Şirket Yönetimi ve 6 Yasal Bina Rehberi. Bu rehberde şirket kurmayı, genel müdürlük, garaj, otogar yazıhaneleri, kademe tamirhanesi, kaptan lojmanı ve şehir içi servis acentelerini öğreneceksiniz." style="padding: 8px 16px; background: linear-gradient(135deg, #059669, #047857); border: 1.5px solid #10b981; color: #fff; font-weight: bold; border-radius: 8px; cursor: pointer;">
                    ▶️ Bu Bölümü Sesli Dinle
                </button>
            </div>

            <!-- BÖLÜM 1: ŞİRKET KURMA VEYA MAAŞLI ÇALIŞMA -->
            <div style="background: rgba(0,0,0,0.3); border-radius: 10px; padding: 14px; margin-bottom: 16px; border: 1px solid rgba(255,255,255,0.08);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                    <h4 style="color: #38bdf8; margin: 0; font-size: 1.1rem;">1. Şirket Kurmak veya Bir Şirkette Çalışmak</h4>
                    <button class="modern-btn btn-read-section nav-item" data-text="Şirket Kurmak veya Bir Şirkette Çalışmak. Oyunda iki yolunuz vardır. İster kendi otobüs firmanızı kurup şoför ve filo yönetebilir, bilet hasılatını toplayabilirsiniz. İsterseniz köklü firmalara katılıp günlük garanti maaş ve sefer primleriyle maaşlı kaptanlık yapabilirsiniz." style="padding: 4px 10px; background: rgba(56,189,248,0.2); border: 1px solid #38bdf8; color: #7dd3fc; font-size: 0.8rem; border-radius: 6px; cursor: pointer;">▶ Dinle</button>
                </div>
                <p style="color: #cbd5e1; font-size: 0.88rem; line-height: 1.5; margin: 0;">
                    • <strong>Kendi Şirketinizi Yönetin:</strong> Şirketinizin adını tescilleyin, filo kurun, şoför istihdam edin ve bilet hasılatını cüzdanınız ile şirket kasası arasında dilediğiniz oranda bölüştürün (%50 / %50 önerilir).<br>
                    • <strong>Kurumsal Firmada Maaşlı Kaptan Olun:</strong> Metro, Pamukkale, Kamil Koç veya Tekulaş gibi şirketlerde günlük garanti maaş ve sefer primleriyle çalışın.
                </p>
            </div>

            <!-- BÖLÜM 2: 6 YASAL BİNA VE GÖREVLERİ -->
            <div style="margin-bottom: 16px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                    <h4 style="color: #facc15; margin: 0; font-size: 1.15rem;">2. Şirketinizin 6 Yasal Binası & Kazandırdıkları</h4>
                    <button class="modern-btn btn-read-section nav-item" data-text="Şirketinizin 6 yasal binası vardır. Genel müdürlük hat izinlerini yönetir ve marka primi verir. Filo garajı araç kapasitesini belirler ve yıpranmayı yarıya indirir. Otogar yazıhaneleri pasif kâr ve bedava mazot sağlar. Kademe atölyesi tamir masrafını yüzde 65 ucuzlatır ve süreyi yarıya indirir. Kaptan lojmanı dinlenme süresini yüzde 75 kısaltır. Şehir içi acenteler ise yolcuları ücretsiz servisle toplayıp bilet gelirini yüzde 50 artırır." style="padding: 4px 10px; background: rgba(250,204,21,0.2); border: 1px solid #facc15; color: #fef08a; font-size: 0.8rem; border-radius: 6px; cursor: pointer;">▶ 6 Binayı Sesli Dinle</button>
                </div>

                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 12px;">
                    
                    <!-- BİNA 1 -->
                    <div style="background: rgba(15,23,42,0.7); border: 1.5px solid #38bdf8; border-radius: 10px; padding: 12px;">
                        <strong style="color: #38bdf8; font-size: 0.95rem;">🏛️ 1. Genel Müdürlük (Şirket Beyni)</strong>
                        <p style="color: #cbd5e1; font-size: 0.84rem; margin: 6px 0 0 0; line-height: 1.45;">
                            • <strong>Görevi:</strong> Karayolu Taşıma Kanunu'na göre şirket açmak için zorunlu tescilli adres.<br>
                            • <strong>Nasıl Büyütülür?</strong> Bağımsız Ofis ➔ Plaza İdari Katı ➔ Holding Genel Müdürlüğü.<br>
                            • <strong>Kazancı:</strong> Sefer izin harçlarını ucuzlatır, idari cezaları sıfırlar ve bilet hasılatına <strong>+%30 marka primi</strong> kazandırır.
                        </p>
                    </div>

                    <!-- BİNA 2 -->
                    <div style="background: rgba(15,23,42,0.7); border: 1.5px solid #22c55e; border-radius: 10px; padding: 12px;">
                        <strong style="color: #4ade80; font-size: 0.95rem;">🅿️ 2. Garaj ve Filo Sahası (Depot)</strong>
                        <p style="color: #cbd5e1; font-size: 0.84rem; margin: 6px 0 0 0; line-height: 1.45;">
                            • <strong>Görevi:</strong> Otobüslerin gece uyuduğu ve beklediği resmi park alanı.<br>
                            • <strong>Nasıl Büyütülür?</strong> Açık Saha (5 Araç) ➔ Güvenlikli Asfalt Garaj (15 Araç) ➔ Kapalı Hangar (Sınırsız).<br>
                            • <strong>Kazancı:</strong> Filo kapasitenizi ve şoför kotanızı artırır. Kapalı hangar sayesinde araçların <strong>yıpranma ve hasar oranı %50 yarı yarıya düşer</strong>!
                        </p>
                    </div>

                    <!-- BİNA 3 -->
                    <div style="background: rgba(15,23,42,0.7); border: 1.5px solid #eab308; border-radius: 10px; padding: 12px;">
                        <strong style="color: #fde047; font-size: 0.95rem;">🏢 3. Otogar Yazıhaneleri & Peron Ağı</strong>
                        <p style="color: #cbd5e1; font-size: 0.84rem; margin: 6px 0 0 0; line-height: 1.45;">
                            • <strong>Görevi:</strong> Şehir terminallerinde yasal yolcu bindirme ve peron hakkı.<br>
                            • <strong>Nasıl Büyütülür?</strong> Merkez Gişe ➔ Büyükşehir Peronları ➔ Ulusal Otogar Konsorsiyumu.<br>
                            • <strong>Kazancı:</strong> Korsan duraklama cezasını önler, sefer başı <strong>+3.500 ₺ pasif kâr</strong> ve Seviye 3'te tüm araçlarınıza <strong>%100 BEDAVA MAZOT</strong> sağlar!
                        </p>
                    </div>

                    <!-- BİNA 4 -->
                    <div style="background: rgba(15,23,42,0.7); border: 1.5px solid #f97316; border-radius: 10px; padding: 12px;">
                        <strong style="color: #fb923c; font-size: 0.95rem;">🛠️ 4. Kademe Binası (Tamirhane & Yıkama)</strong>
                        <p style="color: #cbd5e1; font-size: 0.84rem; margin: 6px 0 0 0; line-height: 1.45;">
                            • <strong>Görevi:</strong> Şirket içi hidrolik liftler, diagnostik bilgisayarları ve boyahane.<br>
                            • <strong>Nasıl Büyütülür?</strong> Kanal Çukuru ➔ Hidrolik Liftler & Diagnostik ➔ Mega Revizyon Üssü.<br>
                            • <strong>Kazancı:</strong> Dış tamir faturalarını <strong>%65 ucuzlatır</strong>, tamir süresini yarı yarıya kısaltır ve fırçalı dış yıkama ile yolcu memnuniyet bahşişlerini artırır.
                        </p>
                    </div>

                    <!-- BİNA 5 -->
                    <div style="background: rgba(15,23,42,0.7); border: 1.5px solid #ec4899; border-radius: 10px; padding: 12px;">
                        <strong style="color: #f472b6; font-size: 0.95rem;">🛏️ 5. Kaptan Lojmanı (Personel Dinlenme)</strong>
                        <p style="color: #cbd5e1; font-size: 0.84rem; margin: 6px 0 0 0; line-height: 1.45;">
                            • <strong>Görevi:</strong> Şoförlerin yasal takograf molalarında uyuyup duş aldığı dinlenme evi.<br>
                            • <strong>Nasıl Büyütülür?</strong> Şoför Odası ➔ Müstakil Lojman ➔ 5 Yıldızlı Kaptan Oteli & Kampüs.<br>
                            • <strong>Kazancı:</strong> Dinlenme süresini <strong>%75 kısaltır</strong>, kaza ve ceza riskini sıfırlar, kaptanların sefer verimini x2.0 katına çıkarır.
                        </p>
                    </div>

                    <!-- BİNA 6 -->
                    <div style="background: rgba(15,23,42,0.7); border: 1.5px solid #a855f7; border-radius: 10px; padding: 12px;">
                        <strong style="color: #c084fc; font-size: 0.95rem;">🏬 6. Şehir İçi Acenteler & Servis Ağı</strong>
                        <p style="color: #cbd5e1; font-size: 0.84rem; margin: 6px 0 0 0; line-height: 1.45;">
                            • <strong>Görevi:</strong> Çarşı merkezindeki bilet gişeleri ve yolcuları otogara taşıyan ücretsiz servis minibüsleri.<br>
                            • <strong>Nasıl Büyütülür?</strong> Cadde Gişesi ➔ Acente & Shuttle Filosu ➔ Ulusal Acente & VIP Transfer.<br>
                            • <strong>Kazancı:</strong> Otobüslerin boş kalkmasını engeller, koltukları doldurur ve bilet hasılatına kalıcı <strong>+%50 prim</strong> sağlar.
                        </p>
                    </div>

                </div>
            </div>

            <!-- BÖLÜM 3: OTOGAR YAZIHANESİ İŞLETME MODELLERİ -->
            <div style="background: rgba(0,0,0,0.35); border-radius: 10px; padding: 14px; margin-bottom: 16px; border: 1px solid rgba(255,255,255,0.08);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                    <h4 style="color: #34d399; margin: 0; font-size: 1.1rem;">3. Otogar Yazıhanesi Modelleri & 4 Günlük Görev</h4>
                    <button class="modern-btn btn-read-section nav-item" data-text="Otogar yazıhaneleri iki modelle açılır. Öz şubede kirayı ödersiniz, gelirin tamamı şirkete kalır. F1 acentelik bayiliğinde sıfır lira masrafla yerel esnaf dükkanı açar, hasılatın yüzde 88 i şirketinize gelir. Ayrıca her yazıhane peron anonsu yapar, yolcu manifestosu tanzim eder, bagaj fişler ve her seferde 4 ila 8 adet emanet paket kargo teslim ederek ek para kazandırır." style="padding: 4px 10px; background: rgba(52,211,153,0.2); border: 1px solid #34d399; color: #a7f3d0; font-size: 0.8rem; border-radius: 6px; cursor: pointer;">▶ Dinle</button>
                </div>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 10px; margin-top: 8px;">
                    <div style="background: rgba(22,163,74,0.15); border-left: 3px solid #22c55e; padding: 10px; border-radius: 6px;">
                        <strong style="color: #4ade80;">🏢 Model A: Şirket Öz Şubesi</strong><br>
                        <span style="font-size: 0.84rem; color: #cbd5e1;">Kirasını şirket öder, kendi bordrolu personeli çalışır. Bilet ve kargo gelirinin <strong>%100'ü doğrudan kasaya</strong> kalır.</span>
                    </div>
                    <div style="background: rgba(2,132,199,0.15); border-left: 3px solid #38bdf8; padding: 10px; border-radius: 6px;">
                        <strong style="color: #38bdf8;">🤝 Model B: F1 Acente Bayiliği</strong><br>
                        <span style="font-size: 0.84rem; color: #cbd5e1;"><strong>0 ₺ Masraf (Bedava Açılış)!</strong> Yerel esnaf işletir. Hasılatın <strong>%88'i şirkete</strong> gelir, %12'si bayiye komisyon kalır.</span>
                    </div>
                </div>
                <div style="margin-top: 10px; font-size: 0.84rem; color: #fde047;">
                    📦 <strong>Emanet & Paket Kargo Geliri:</strong> Açık yazıhaneler otobüs bagajına koli kabul eder. Her seferde 4-8 koli taşınır ve koli başı 140 ₺ ekstra net kazanç sağlar!
                </div>
            </div>

            <!-- BÖLÜM 4: CANLI KASA DEFTERİ VE ÖN MUHASEBE -->
            <div style="background: rgba(0,0,0,0.3); border-radius: 10px; padding: 14px; border: 1px solid rgba(255,255,255,0.08);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                    <h4 style="color: #facc15; margin: 0; font-size: 1.1rem;">4. Para Akışı & Canlı Kasa Defteri (Ön Muhasebe)</h4>
                    <button class="modern-btn btn-read-section nav-item" data-text="Para akışı nasıl hesaplanır? Oyuncunun oturup matematik yapmasına gerek yoktur. Oyun her bilet gelirini, kargo kazancını, mazot giderini ve tamir faturasını saniyesi saniyesine Kasa Defteri'ne işler. Tek tıkla toplam geliri, toplam gideri ve net şirket kârınızı anlık olarak görebilirsiniz." style="padding: 4px 10px; background: rgba(250,204,21,0.2); border: 1px solid #facc15; color: #fef08a; font-size: 0.8rem; border-radius: 6px; cursor: pointer;">▶ Dinle</button>
                </div>
                <p style="color: #cbd5e1; font-size: 0.88rem; line-height: 1.5; margin: 0;">
                    Oyuncunun kağıt kalemle hesap tutmasına gerek yoktur. Şirket Menüsü'ndeki <strong>📊 Kasa Defteri & Muhasebe</strong> sekmesi tüm para giriş ve çıkışlarını canlı banka ekstresi gibi listeler. Toplam gelirinizi, masraflarınızı, net şirket kârınızı ve en çok nereye para harcadığınızı tek ekranda görebilirsiniz.
                </p>
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

    renderInteractiveLab();
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
                actionBtnText: "🔑 Motoru Çalıştır (M)",
                actionBtnStyle: "background: linear-gradient(135deg, #0284c7, #0369a1); border: 1.5px solid #38bdf8;",
                successFeedback: "Aferin, çok güzel! Motor çalıştı, sesini duyduk. Şimdi gaza basıp yola çıkalım.",
                failFeedback: "Motoru çalıştırmak için lütfen sadece M tuşuna basınız. Başarabilirsin, tekrar dene!",
                execute: () => {
                    if (typeof audio !== 'undefined' && audio.sounds && audio.sounds.start) {
                        try { audio.sounds.start.play(); } catch(e) {}
                    }
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
                actionBtnText: "🟢 Gaza Bas ve Hızlan (W / Yukarı Ok)",
                actionBtnStyle: "background: linear-gradient(135deg, #16a34a, #15803d); border: 1.5px solid #4ade80;",
                successFeedback: "Harika gidiyorsun, tebrikler! Otobüsümüz hızlandı, ilk durağımıza doğru gidiyoruz.",
                failFeedback: "Hızlanmak için lütfen W tuşuna veya Yukarı Ok tuşuna basınız. Tekrar deneyiniz!",
                execute: () => {
                    if (typeof audio !== 'undefined' && audio.playSelect) audio.playSelect();
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
                actionBtnText: "✨ Frene Bas ve Dur (S / Aşağı Ok)",
                actionBtnStyle: "background: linear-gradient(135deg, #059669, #047857); border: 1.5px solid #10b981;",
                successFeedback: "Mükemmel bir duruş, tebrikler! Çok yumuşak durdun, yolcular hiç sarsılmadı.",
                failFeedback: "Durmak için lütfen S tuşuna veya Aşağı Ok tuşuna basınız. Tekrar dene!",
                execute: () => {
                    if (typeof audio !== 'undefined' && audio.playAirBrake) audio.playAirBrake();
                    this.labSpeed = 0;
                }
            },
            {
                step: 4,
                title: "4. Adım: Otobüsü Sağa Eğme (Kaldırıma Yaklaştırma)",
                tip: "Yaşlı ve engelli yolcular basamağa rahat çıksın diye otobüsü sağa eğiyoruz.",
                instruction: "Durakta yaşlı bir yolcumuz bekliyor. Otobüsü kaldırıma doğru eğmek için klavyeden K tuşuna basınız.",
                targetKey: "k",
                actionBtnText: "⬇️ Otobüsü Sağa Eğ (K)",
                actionBtnStyle: "background: linear-gradient(135deg, #0284c7, #0369a1); border: 1.5px solid #38bdf8;",
                successFeedback: "Aferin çok doğru! Otobüs yana yattı, basamak kaldırım seviyesine indi.",
                failFeedback: "Otobüsü eğmek için lütfen K tuşuna basınız. Tekrar dene!",
                execute: () => {
                    if (typeof audio !== 'undefined' && audio.playKneeling) audio.playKneeling();
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
                actionBtnText: "🛹 Engelli Rampasını Aç (R veya U)",
                actionBtnStyle: "background: linear-gradient(135deg, #d97706, #b45309); border: 1.5px solid #facc15;",
                successFeedback: "Harikasın! Rampa açıldı, yolcumuz bindi ve teşekkür etti: İyi ki varsın kaptan!",
                failFeedback: "Rampayı açmak için lütfen R veya U tuşuna basınız.",
                execute: () => {
                    if (typeof audio !== 'undefined' && audio.playRamp) audio.playRamp();
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
                actionBtnText: "⬆️ Rampayı Kapat ve Otobüsü Doğrult (R veya U)",
                actionBtnStyle: "background: linear-gradient(135deg, #475569, #334155); border: 1.5px solid #94a3b8;",
                successFeedback: "Çok güzel! Rampa kapandı ve otobüsümüz doğruldu.",
                failFeedback: "Rampayı kapatmak için lütfen tekrar R veya U tuşuna basınız.",
                execute: () => {
                    if (typeof audio !== 'undefined' && audio.playRamp) audio.playRamp();
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
                actionBtnText: "🚪 Ön Kapıyı Aç (1)",
                actionBtnStyle: "background: linear-gradient(135deg, #7c3aed, #6d28d9); border: 1.5px solid #a78bfa;",
                successFeedback: "Aferin doğru yaptın! Kapı açıldı, yolcular kartlarını basıp bindi.",
                failFeedback: "Ön kapıyı açmak için lütfen 1 tuşuna basınız.",
                execute: () => {
                    if (typeof audio !== 'undefined' && audio.playDoorOpen) audio.playDoorOpen();
                    this.labFrontDoor = true;
                }
            },
            {
                step: 8,
                title: "8. Adım: Ön Kapıyı Kapatma",
                tip: "Yolcular bindi, güvenle sürmek için kapıyı kapatıyoruz.",
                instruction: "Yolcular bindi. Yola çıkmak için lütfen tekrar 1 tuşuna basarak kapıyı kapatınız.",
                targetKey: "1",
                actionBtnText: "🔒 Ön Kapıyı Kapat (1)",
                actionBtnStyle: "background: linear-gradient(135deg, #475569, #334155); border: 1.5px solid #94a3b8;",
                successFeedback: "Tebrikler! Kapılar kapandı, artık güvenle sürebilirsin.",
                failFeedback: "Kapıyı kapatmak için lütfen 1 tuşuna basınız.",
                execute: () => {
                    if (typeof audio !== 'undefined' && audio.playDoorClose) audio.playDoorClose();
                    this.labFrontDoor = false;
                }
            },
            {
                step: 9,
                title: "9. Adım: Yokuş Aşağı İniş Freni (Retarder)",
                tip: "Yokuş inerken normal fren balataları ısınmasın diye motor frenini çekiyoruz.",
                instruction: "Son olarak, dik yokuş inerken otobüsü yavaşlatmak için Boşluk (Space) tuşuna basarak yokuş frenini çekiniz.",
                targetKey: " ",
                actionBtnText: "⚡ Yokuş Frenini Çek (Boşluk / Space)",
                actionBtnStyle: "background: linear-gradient(135deg, #ea580c, #c2410c); border: 1.5px solid #f97316;",
                successFeedback: "Muhteşem! Yokuş frenini çektin, otobüs yavaşladı. Bütün kontrolleri başarıyla öğrendin!",
                failFeedback: "Yokuş freni için lütfen Boşluk (Space) tuşuna basınız.",
                execute: () => {
                    if (typeof audio !== 'undefined' && audio.playSelect) audio.playSelect();
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
