        // Mobil Cihaz Tespiti
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 800;
        window.isMobileDevice = isMobile;

        // --- OTOMATİK GÜNCELLEME KONTROL SİSTEMİ ---
        let mevcutSurum = null;
        let globalChangelogVersion = null;
        let globalChangelogMessage = null;

        function guncellemeKontrolEt(isManual = false) {
            if (isManual && typeof announceToScreenReader === 'function') {
                announceToScreenReader('Güncellemeler denetleniyor...');
            }

            // Tarayıcı hafızasını atlamak için zaman damgası ekliyoruz
            fetch('version.json?t=' + new Date().getTime())
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json();
                })
                .then(data => {
                    // Ekranda (Mikyas Studio/Intro) versiyon bilgisini göster (Kullanıcı bu kısmı sormuştu)
                    const visualVersion = document.getElementById("intro-version-display");
                    if (visualVersion) visualVersion.textContent = "Sürüm: " + data.version;

                    globalChangelogVersion = data.version;
                    if(data.changelog) {
                        globalChangelogMessage = data.changelog;
                        const smt = document.getElementById('server-message-text');
                        if(smt) smt.innerText = data.changelog;
                    }

                    let currentMsg = 'Oyununuz güncel.';
                    if (data.buildId) {
                        const dateObj = new Date(data.buildId * 1000);
                        currentMsg += ' En son ' + dateObj.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }) + ' tarihinde güncellenmiş.';
                    }

                    if (!mevcutSurum) {
                        // Sayfa ilk yüklendiğinde mevcut sürümü kaydet (Örn: "1.2")
                        mevcutSurum = data.version;
                        if (isManual && typeof announceToScreenReader === 'function') {
                            announceToScreenReader(currentMsg);
                        }
                    } else if (data.version !== mevcutSurum) {
                        // Sürüm numarası değiştiyse GÜNCELLEME ZORUNLU
                        mevcutSurum = data.version;
                        const uyariMesaji = "Oyuna zorunlu bir güncelleme geldi! Eski sürümle oynamaya devam edemezsiniz. Lütfen Tamam'a basarak sayfayı yenileyin.";

                        // Oyunu anında dondur
                        gameIsActive = false;
                        if (typeof Howler !== 'undefined') {
                            Howler.stop(); // Tüm sesleri kes
                        }

                        // Ekranı tamamen kapatan bir blok at (Eski sürümle hiçbir şekilde oynanamasın)
                        document.body.innerHTML = "";
                        document.body.style.backgroundColor = "#111";

                        const updateSound = new Howl({ src: ['sounds/update.ogg'], volume: 1.0, html5: true });
                        updateSound.play();

                        const updateMsg = document.createElement("h1");
                        updateMsg.textContent = "Zorunlu Güncelleme: Eski sürüm devre dışı bırakıldı.";
                        updateMsg.style.color = "#ffb703";
                        updateMsg.style.textAlign = "center";
                        updateMsg.style.marginTop = "20vh";
                        document.body.appendChild(updateMsg);

                        setTimeout(() => {
                            alert(uyariMesaji);

                            // Ortak (Hem PC Hem Mobil İçin) Devasa Odaklanmış Yenile Butonu Çıkart
                            const refreshBtn = document.createElement("button");
                            refreshBtn.textContent = "YENİ SÜRÜME GEÇ (SAYFAYI YENİLE)";
                            refreshBtn.style.position = "fixed";
                            refreshBtn.style.top = "50%";
                            refreshBtn.style.left = "50%";
                            refreshBtn.style.transform = "translate(-50%, -50%)";
                            refreshBtn.style.zIndex = "999999";
                            refreshBtn.style.padding = "30px 40px";
                            refreshBtn.style.fontSize = "1.5rem";
                            refreshBtn.style.fontWeight = "bold";
                            refreshBtn.style.backgroundColor = "#ffb703";
                            refreshBtn.style.color = "#000";
                            refreshBtn.style.border = "none";
                            refreshBtn.style.borderRadius = "15px";
                            refreshBtn.style.boxShadow = "0 0 20px rgba(0,0,0,0.8)";
                            refreshBtn.setAttribute("aria-label", "Yeni sürüme geçmek zorunludur. Lütfen sayfayı yenileyin.");
                            refreshBtn.onclick = () => {
                                window.location.href = window.location.pathname + "?v=" + new Date().getTime();
                            };
                            document.body.appendChild(refreshBtn);

                            setTimeout(() => refreshBtn.focus(), 100);

                            // Otomatik yenileme kaldırıldı, sen tekrar girene (butona/F5 basana) kadar güncellenmeyecek
                        }, 500);
                    } else {
                        if (isManual && typeof announceToScreenReader === 'function') {
                            announceToScreenReader(currentMsg);
                        }
                    }
                })
                .catch(err => {
                    console.log("Güncelleme kontrolü başarısız oldu veya version.json bulunamadı.", err);
                    if (isManual && typeof announceToScreenReader === 'function') {
                        announceToScreenReader('Güncelleme kontrolü başarısız oldu.');
                    }
                });
        }

        // Güncellemeleri Denetle butonu için event listener
        document.addEventListener('DOMContentLoaded', () => {
            const checkUpdatesBtn = document.getElementById('check-updates-btn');
            if (checkUpdatesBtn) {
                checkUpdatesBtn.addEventListener('click', () => {
                    // Tıklandığında ana menü müziğini vs bozmadan direkt API check
                    guncellemeKontrolEt(true);
                });
            }
        });

        // Oyun açıldığında (çok az gecikmeli biçimde) ilk kontrolü yap
        setTimeout(() => guncellemeKontrolEt(false), 2000);

        // Tarayıcı sekmesine/pencereye geri dönüldüğünde hemen kontrol et (süper agresif)
        window.addEventListener('focus', () => guncellemeKontrolEt(false));

        // Her 30 saniyede bir (ideal agresiflikte) arka planda sessizce kontrol etmeye devam et
        setInterval(() => guncellemeKontrolEt(false), 30000);

        // Klavye komutlarını mobil dokunmatik ekran komutlarına çevir
        window.localizeText = function (text) {
            if (!window.isMobileDevice || !text) return text;
            return text
                .replace(/entıra veya ekrana çift dokunun/gi, "ekrana çift dokunun")
                .replace(/entıra veya /gi, "")
                .replace(/entıra basın/gi, "ekrana çift dokunun")
                .replace(/enter'a basın/gi, "ekrana çift dokunun")
                .replace(/enter tuşuna basın/gi, "ekrana çift dokunun")
                .replace(/entır tuşuna basın/gi, "ekrana çift dokunun")
                .replace(/entır tuşunu kullanabilirsiniz/gi, "ekrana çift dokunabilirsiniz")
                .replace(/entır tuşu ile/gi, "ekrana çift dokunarak")
                .replace(/entır tuşuna bastığınızda/gi, "ekrana çift dokunduğunuzda")
                .replace(/entıra,/gi, "ekrana çift dokunarak,")
                // Fallbacks:
                .replace(/entıra/gi, "ekrana çift dokunmaya")
                .replace(/entır tuşu/gi, "ekrana çift dokunma")
                .replace(/entır/gi, "ekrana çift dokunmak")
                .replace(/enter/gi, "ekrana çift dokunmak")
                // Navigations:
                .replace(/sağ ve sol ok tuşlarına basın/gi, "parmağınızı sağa veya sola süpürme hareketi yapın")
                .replace(/sağ sol ok tuşlarına basın/gi, "parmağınızı sağa veya sola süpürme hareketi yapın")
                .replace(/sağ ve sol ok tuşlarıyla gezinebilirsiniz/gi, "parmağınızı sağa veya sola süpürerek gezinebilirsiniz")
                .replace(/sağ ve sol ok tuşlarıyla gezinebilir/gi, "parmağınızı sağa veya sola süpürerek gezinebilir")
                .replace(/sayfa yukarı ve sayfa aşağı tuşuna basın/gi, "telefonunuzun ses tuşlarına basın")
                .replace(/Page Up ve Page Down tuşlarıyla/gi, "telefonunuzun ses tuşlarıyla")
                .replace(/m tuşuna basın/gi, "sessize alma düğmesini kullanın")
                .replace(/S tuşu ile skorunuzu, T tuşu ile kalan sürenizi öğrenebilir, boşluk tuşu ile bir saniye ceza karşılığında ses dizisini tekrar dinleyebilirsiniz\./gi, "")
                .replace(/<strong>S tuşu<\/strong> ile skorunuzu, <strong>T tuşu<\/strong> ile kalan sürenizi öğrenebilir, <strong>Boşluk tuşu<\/strong> ile bir saniye ceza karşılığında ses dizisini tekrar dinleyebilirsiniz\./gi, "")
                .replace(/ok tuşlarını kullanın/gi, "parmağınızı sağa veya sola süpürün");
        };

        // Tüm statik Aria Labelleri ve içerikleri mobil cihazsa çevir
        document.addEventListener('DOMContentLoaded', () => {
            if (window.isMobileDevice) {
                document.querySelectorAll('[aria-label]').forEach(el => {
                    let oldLabel = el.getAttribute('aria-label');
                    if (oldLabel) el.setAttribute('aria-label', window.localizeText(oldLabel));
                });
                
                document.querySelectorAll('.localize-inner').forEach(el => {
                    el.innerHTML = window.localizeText(el.innerHTML);
                });
            }
        });

        // Dinleyiciyi (Kullanıcı) (0,0,0) merkez noktasına koyalım.
        // Kulaklarımız x ekseni üzerinde yatay (sağ-sol) hizalı duruyor.
        Howler.pos(0, 0, 0);
        Howler.orientation(0, 0, -1, 0, 1, 0);
        const introScreen = document.getElementById('intro-screen');
        const mainMenu = document.getElementById('main-menu-container');
        const scoreboardMenu = document.getElementById('scoreboard-menu-container');
        const difficultyMenu = document.getElementById('difficulty-menu-container');
        const practiceMenu = document.getElementById('practice-menu-container'); // Alıştırma Modu Container
        const statsMenu = document.getElementById('stats-menu-container'); // İstatistikler Modu Container
        const storeMenu = document.getElementById('store-menu-container'); // Mağaza Menüsü Container
        const feedbackMenu = document.getElementById('feedback-menu-container'); // Geri Bildirim Menüsü Container
        const serverMessageMenu = document.getElementById('server-message-container'); // Sunucu Mesajı Container
        const achievementsMenu = document.getElementById('achievements-menu-container'); // Başarılar Menüsü Container
        const gameMenu = document.getElementById('game-menu-container'); // Ana Oyun Container
        const storyMenu = document.getElementById('story-menu-container'); // Hikaye Modu Container

        // Hikaye modu değişkenleri
        let inStoryMode = false;
        let currentStoryIndex = 0;

        // Mağaza satın alma değişkenleri
        let currentBuyType = '';
        let currentBuyPrice = 0;
        let currentBuyName = '';
        let currentBuyQuantity = 1;

        // Howler.js ile ses nesnelerini oluşturuyoruz
        const bgMusic = new Howl({
            src: ['sounds/menu-music.mp3'],
            loop: true,
            volume: 1.0,
            html5: false // 3D (Spatial) Positional ses için html5 zorunlu olarak false olmalıdır.
        });

        const hoverSound = new Howl({
            src: ['sounds/menu-dolas.ogg'],
            volume: 0.5
        });

        const clickSound = new Howl({
            src: ['sounds/menu-tikla.ogg'],
            volume: 0.5
        });

        // Mobil cihazlarda menü seslerini devre dışı bırak
        if (window.isMobileDevice) {
            hoverSound.play = function () { };
            clickSound.play = function () { };
        }

        const correctSound = new Howl({
            src: ['sounds/dogru.ogg'],
            volume: 1.0
        });

        const wrongSound = new Howl({
            src: ['sounds/yanlis.ogg'],
            volume: 1.0,
            onplay: function () {
                if (window.isMobileDevice && navigator.vibrate) {
                    navigator.vibrate(1000); // 1 saniye (1000ms) kesintisiz titreşim
                }
            }
        });

        const glasshitSound = new Howl({
            src: ['sounds/glasshit1.ogg'],
            volume: 1.0
        });

        const gameOverSound = new Howl({
            src: ['sounds/newmotd2.ogg'],
            volume: 1.0
        });

        const modeUnlockSound = new Howl({
            src: ['sounds/newmotd1.ogg'],
            volume: 1.0
        });

        const storyBGM = new Howl({
            src: ['sounds/menumus31.ogg'],
            loop: true,
            volume: 0.5, // Fadesiz başlatıyoruz, Howler hatasına karşı
            html5: false
        });

        const house2Sound = new Howl({
            src: ['sounds/house2.ogg'],
            loop: true,
            volume: 0.8
        });

        const mountainSound = new Howl({
            src: ['sounds/mountain.ogg'],
            loop: true,
            volume: 0.0
        });

        const snowStepSounds = [
            new Howl({ src: ['sounds/snow_wetstep1.ogg'], volume: 1.0 }),
            new Howl({ src: ['sounds/snow_wetstep2.ogg'], volume: 1.0 }),
            new Howl({ src: ['sounds/snow_wetstep3.ogg'], volume: 1.0 }),
            new Howl({ src: ['sounds/snow_wetstep4.ogg'], volume: 1.0 }),
            new Howl({ src: ['sounds/snow_wetstep5.ogg'], volume: 1.0 })
        ];

        const carpetStepSounds = [
            new Howl({ src: ['sounds/carpet7step1.ogg'], volume: 1.0 }),
            new Howl({ src: ['sounds/carpet7step2.ogg'], volume: 1.0 }),
            new Howl({ src: ['sounds/carpet7step3.ogg'], volume: 1.0 }),
            new Howl({ src: ['sounds/carpet7step4.ogg'], volume: 1.0 }),
            new Howl({ src: ['sounds/carpet7step5.ogg'], volume: 1.0 })
        ];

        const enterHouseSound = new Howl({
            src: ['sounds/entering_house1.ogg'],
            volume: 1.0
        });

        const doorCloseSound = new Howl({
            src: ['sounds/doorclose6.ogg'],
            volume: 1.0
        });

        // 7 Muffled note sounds for the story cinematic
        const storyNoteSounds = [
            new Howl({ src: ['sounds/a.ogg'], volume: 0.15, stereo: -0.8 }),
            new Howl({ src: ['sounds/b.ogg'], volume: 0.15, stereo: 0.5 }),
            new Howl({ src: ['sounds/c.ogg'], volume: 0.15, stereo: -0.2 }),
            new Howl({ src: ['sounds/d.ogg'], volume: 0.15, stereo: 0.9 }),
            new Howl({ src: ['sounds/e.ogg'], volume: 0.15, stereo: -0.6 }),
            new Howl({ src: ['sounds/f.ogg'], volume: 0.15, stereo: 0.2 }),
            new Howl({ src: ['sounds/g.ogg'], volume: 0.15, stereo: 0.7 })
        ];

        let isGridWalkingPhase = false;
        let stepIntervalId = null;
        let currentAutoWalkStep = 0;

        // Oyundan Çık butonunu geciktirmek için zamanlayıcı değişkeni
        let mobileExitBtnTimeout = null;

        // Missing Notes Oyun Değişkenleri
        let playerX = 1;
        let mapLength = 30; // 1'den 30'a kadar yatay düzlem
        let pianoX = 0; // Piyano en sola (0) sabitlendi.
        let notesOnMap = {};     // Örn: { 5: 'A', 12: 'B', ... }
        let notesInPiano = [];   // Piyanoya eklenen notalar
        const MAX_NOTES = 7;

        // Spatial Ping Zamanlayıcısı
        let notePingInterval = null;

        const buySound = new Howl({
            src: ['sounds/buy.ogg'],
            volume: 1.0
        });

        const seconsSound = new Howl({
            src: ['sounds/secons.ogg'],
            volume: 1.0
        });

        const secons2Sound = new Howl({
            src: ['sounds/secons2.ogg'],
            volume: 1.0
        });

        const clockTickSound = new Howl({
            src: ['sounds/clock_tick1.ogg'],
            volume: 0.5,
            loop: true
        });

        const dado3Sound = new Howl({
            src: ['sounds/dado3.ogg'],
            volume: 0.8
        });

        const achievementSound = new Howl({
            src: ['sounds/dlg_open.ogg'],
            volume: 1.0
        });

        const getCoinsSound = new Howl({
            src: ['sounds/getcoins.ogg'],
            volume: 1.0
        });

        let achievementsAnnouncements = [];
        let currentAchIndex = 0;

        const allMenuButtons = Array.from(document.querySelectorAll('.menu-button'));

        let currentFocusIndex = 0;
        let isStarted = false;
        let currentActiveMenu = 'main'; // 'main', 'scoreboard', 'practice', 'game'

        // --- Ana Oyun Değişkenleri --- //
        let gameTimer = 30;
        let gameScore = 0;
        let gameMistakes = 0;
        let gameInterval = null;
        let gameSequence = [];
        let playerInputIndex = 0;
        let isComputerPlaying = false;
        let gameIsActive = false;
        let sessionTokens = 0;
        let turnStartTime = 0;

        // --- Mağaza ve Öğeler --- //
        let hataKorumasiCount = parseInt(localStorage.getItem('hafizaGuvenHataKorumasi')) || 0;
        let zamanKorumasiCount = parseInt(localStorage.getItem('hafizaGuvenZamanKorumasi')) || 0;

        // Üst üste çalınma sorununu çözmek için bilgisayar oynatma timeout ID'sini tutarız
        let sequenceTimeoutId = null;

        const practiceTargets = [
            { key: 'c', noteName: 'Do' },
            { key: 'd', noteName: 'Re' },
            { key: 'e', noteName: 'Mi' },
            { key: 'f', noteName: 'Fa' },
            { key: 'g', noteName: 'Sol' },
            { key: 'a', noteName: 'La' },
            { key: 'b', noteName: 'Si' }
        ];

        let currentDialogIndex = 0;
        let isDialogPhase = false;

        let practiceTargetIndex = 0;
        let practicePressCount = 0;
        let inPracticeTutorial = false;

        function playCurrentDialog() {
            const practiceStatus = document.getElementById('practice-status-text');
            if (!practiceStatus) return;

            practiceStatus.innerHTML = window.localizeText(practiceDialogues[currentDialogIndex].replace("Devam etmek için entıra basın.", "<strong>Devam etmek için entıra basın.</strong>"));
            announceToScreenReader(practiceDialogues[currentDialogIndex]);
        }

        function playCurrentStoryDialog() {
            const storyStatus = document.getElementById('story-status-text');
            if (!storyStatus) return;

            let appendedText = missingNotesDialogues[currentStoryIndex];

            storyStatus.innerHTML = window.localizeText(appendedText.replace("Devam etmek için entıra basın.", "<strong>Devam etmek için entıra basın.</strong>"));
            announceToScreenReader(appendedText);
        }

        function playAutomatedWalkingScene() {
            if (!inStoryMode) return;

            if (currentAutoWalkStep < 6) {
                // Play a random step
                const randomStep = snowStepSounds[Math.floor(Math.random() * snowStepSounds.length)];
                randomStep.play();
                currentAutoWalkStep++;

                const nextWalkDelay = Math.floor(Math.random() * 200) + 200; // 400-1000ms yerine 200-400ms arasına indirildi.
                stepIntervalId = setTimeout(playAutomatedWalkingScene, nextWalkDelay);
            }
        }

        function triggerStoryAnimations(index) {
            if (index === 0) {
                // Pan practicing piano: Play C E G randomly 4-5 times
                let count = 0;
                let pId = setInterval(() => {
                    const keys = ['c', 'e', 'g', 'c', 'f', 'a', 'd', 'b', 'g'];
                    const randomKey = keys[Math.floor(Math.random() * keys.length)];
                    // Yalnızca ses için playPianoNoteSingle mantığıyla ama Howl kullanarak çalalım, çünkü playPianoNoteSingle diğerlerini durduruyor.
                    if (pianoNotes[randomKey]) {
                        pianoNotes[randomKey].volume(0.8);
                        let sndId = pianoNotes[randomKey].play();
                        pianoNotes[randomKey].seek(0.045, sndId);
                    }
                    count++;
                    if (count > 6) clearInterval(pId);
                }, 400);
            } else if (index === 1) {
                // Bili enters (Kapı açılır, adımlar, kapı kapanır)
                enterHouseSound.play();
                setTimeout(() => {
                    let stepCount = 0;
                    let sId = setInterval(() => {
                        let s = carpetStepSounds[Math.floor(Math.random() * carpetStepSounds.length)];
                        // Yaklaşma efekti için sesi kademeli olarak artırıyoruz (fade-in)
                        s.volume(Math.min(1.0, 0.2 + (stepCount * 0.2)));
                        s.play();
                        stepCount++;
                        if (stepCount > 5) {
                            clearInterval(sId);
                            setTimeout(() => { doorCloseSound.play(); }, 200);
                        }
                    }, 220); // Sesler arasındaki boşluğu azalttık (300 -> 220 ms)
                }, 350); // Kapı sesi ile adımlar arası bekleme
            } else if (index === 7) {
                // "O sırada çat diye..." ifadesinde piyano kırılışı ("çat") sesi çalınır, arka planda hikaye müziği başlar
                storyBGM.play();
                glasshitSound.play();
                wrongSound.volume(1.0);
                wrongSound.play();
            } else if (index === 8) {
                // "Pan: Bili! Sen! Sen!..." ifadesinde kırılmanın ardından kopan dissonant tuşlara seri basılma hissi
                // Dissonant tuşlara hızlıca basılması hissi
                setTimeout(() => {
                    if (pianoNotes['c']) pianoNotes['c'].play();
                    if (pianoNotes['d']) pianoNotes['d'].play();
                    if (pianoNotes['e']) pianoNotes['e'].play();
                }, 50);
                setTimeout(() => {
                    doorCloseSound.rate(1.5);
                    doorCloseSound.volume(0.6);
                    doorCloseSound.play();
                    setTimeout(() => doorCloseSound.rate(1.0), 1000);
                }, 200);
            } else if (index === 14) {
                // Bili runs away -> Bili'nin parçalarını toplarsın cümlesi 14'te.
                let stepCount = 0;
                let sId = setInterval(() => {
                    let s = carpetStepSounds[Math.floor(Math.random() * carpetStepSounds.length)];
                    s.volume(Math.max(0.1, 1.0 - (stepCount * 0.15))); // fade out      
                    s.play();
                    stepCount++;
                    if (stepCount > 6) clearInterval(sId);
                }, 220); // Sesler arasındaki boşluğu azalttık (250 -> 220 ms)
                setTimeout(() => { doorCloseSound.play(); }, 1400); // Adımlar hızlandığı için kapı kapanma süresi de kısaltıldı (1500 -> 1400)
            }
        }

        function initializeMissingNotesMap() {
            // Notalar: C (Do), D (Re), E (Mi), F (Fa), G (Sol), A (La), B (Si)
            const noteNames = ['c', 'd', 'e', 'f', 'g', 'a', 'b'];

            // 1 ile 30 arasındaki koordinatları seçip karıştırıyoruz
            const availableX = [];
            for (let i = 1; i <= mapLength; i++) {
                availableX.push(i);
            }

            // Fisher-Yates shuffle ile karıştırıp rastgele pozisyonları alalım
            for (let i = availableX.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [availableX[i], availableX[j]] = [availableX[j], availableX[i]];
            }

            for (let i = 0; i < noteNames.length; i++) {
                notesOnMap[availableX[i]] = noteNames[i];
            }

            // İlk 7 alanı notalara ayırdığımız için 8. rastgele alanı (notesuz boş bir alan) oyuncuya ayırabiliriz
            playerX = availableX[7];

            // Oynatıcı başlangıç konumunu NVDA ile bildir
            announceToScreenReader(`Dışarıdasın. Kar üstünde rastgele bir noktaya ışınlandın. X konumun: ${playerX}. Piyanoya dönmek için X: 0 konumuna doğru yürümelisin. Etrafta rastgele yerleştirilmiş ${MAX_NOTES} adet nota var. Bir nota bulduğunda F tuşuna basarak onu alabilirsin. Tüm notaları sırasıyla (Do, Re, Mi, Fa, Sol, La, Si) piyanoya getirmelisin.`);

            mountainSound.volume(0.8);
            mountainSound.loop(true);
            mountainSound.play();
        }

        function updatePracticeUI(state) {
            const practiceStatus = document.getElementById('practice-status-text');
            if (!practiceStatus) return;

            if (practiceTargetIndex >= practiceTargets.length) {
                let hasCompletedPracticeBefore = false;
                try {
                    hasCompletedPracticeBefore = localStorage.getItem('hafizaGuvenPracticeCompleted') === 'true';
                } catch (e) { }

                let completionMessage = "Tebrikler. Bu modu başarılı bir şekilde tamamladınız. Oyuna geri dönmek için entıra basın.";
                let isFirstTimeWin = false;

                if (!hasCompletedPracticeBefore) {
                    try {
                        localStorage.setItem('hafizaGuvenPracticeCompleted', 'true');
                        let totalTokens = parseInt(localStorage.getItem('hafizaGuvenTotalTokens')) || 0;
                        totalTokens += 100;
                        localStorage.setItem('hafizaGuvenTotalTokens', totalTokens);
                    } catch (e) { }

                    completionMessage = "Tebrikler. Bu modu başarılı bir şekilde tamamladınız. İlk deneyiminiz olduğu için 100 jeton kazandınız! Oyuna geri dönmek için entıra basın.";
                    isFirstTimeWin = true;
                }

                practiceStatus.innerHTML = `<span style="color: #4CAF50;">${completionMessage.replace('100 jeton kazandınız!', '<strong>100 jeton kazandınız!</strong>')}</span>`;

                if (state !== 'init') {
                    if (isFirstTimeWin) {
                        // Jeton kazanıldıysa, sesi çal ve ardından anons yap
                        let playedCount = 0;
                        let currentRate = 1.0;
                        const maxSoundPlays = 15;
                        let delay = 200;

                        function playNextCoinForPractice() {
                            if (playedCount < maxSoundPlays) {
                                getCoinsSound.rate(currentRate);
                                getCoinsSound.play();

                                currentRate += 0.1;
                                playedCount++;
                                delay = Math.max(40, delay - 20); // her defasında hızlandır

                                setTimeout(playNextCoinForPractice, delay);
                            } else {
                                setTimeout(() => {
                                    announceToScreenReader(completionMessage);
                                }, 400);
                            }
                        }
                        playNextCoinForPractice();
                    } else {
                        announceToScreenReader(completionMessage);
                    }
                }

                const practiceMenuDOM = document.getElementById('practice-menu-container');
                if (practiceMenuDOM) {
                    practiceMenuDOM.dataset.isPracticeOver = "true";
                }
                return;
            }

            const currentTarget = practiceTargets[practiceTargetIndex];
            const pressesNeeded = 3 - practicePressCount;

            if (state === 'init') {
                practiceStatus.innerHTML = `Haydi, şimdi ilk olarak Do sesi için C tuşuna 3 defa basmayı dener misiniz?`;
                announceToScreenReader("İlk pratik başlıyor. Haydi, şimdi ilk olarak Do sesi için C tuşuna 3 defa basmayı dener misiniz?");
            } else if (state === 'wrong') {
                const randomWrong = practiceWrongMessages[Math.floor(Math.random() * practiceWrongMessages.length)];
                practiceStatus.innerHTML = `<span style="color: #ff4d4d;">${randomWrong}</span> Lütfen ${currentTarget.noteName} sesi için <strong>${currentTarget.key.toUpperCase()}</strong> tuşuna basın. (${pressesNeeded} defa kaldı)`;
                announceToScreenReader(`${randomWrong} Lütfen ${currentTarget.noteName} sesi için ${currentTarget.key.toUpperCase()} tuşuna basın.`);
            } else if (state === 'correct') {
                const randomCorrect = practiceCorrectMessages[Math.floor(Math.random() * practiceCorrectMessages.length)];
                practiceStatus.innerHTML = `<span style="color: #4CAF50;">${randomCorrect}</span> Lütfen ${currentTarget.noteName} sesi için <strong>${currentTarget.key.toUpperCase()}</strong> tuşuna basmaya devam edin. (${pressesNeeded} defa kaldı)`;
                announceToScreenReader(`${randomCorrect} Lütfen ${currentTarget.noteName} sesi için ${currentTarget.key.toUpperCase()} tuşuna basmaya devam edin.`);
            } else if (state === 'next') {
                const randomCorrect = practiceCorrectMessages[Math.floor(Math.random() * practiceCorrectMessages.length)];
                practiceStatus.innerHTML = `<span style="color: #ffb703;">${randomCorrect}</span> Şimdi sıra <strong>${currentTarget.noteName}</strong> sesinde. Lütfen <strong>${currentTarget.key.toUpperCase()}</strong> tuşuna 3 defa basın.`;
                // Ekran okuyucusunda son kısmı atlıyor ve noktalama ile kesin bir şekilde ayırıyoruz.
                announceToScreenReader(`${randomCorrect} Şimdi sıra ${currentTarget.noteName} sesinde. Lütfen ${currentTarget.key.toUpperCase()} tuşuna 3 defa basın.`);
            }
        }

        function getActiveButtons() {
            let buttons = [];
            if (currentActiveMenu === 'main') {
                buttons = Array.from(mainMenu.querySelectorAll('.menu-button'));
            } else if (currentActiveMenu === 'scoreboard') {
                buttons = Array.from(scoreboardMenu.querySelectorAll('.menu-button'));
            } else if (currentActiveMenu === 'difficulty') {
                buttons = Array.from(difficultyMenu.querySelectorAll('.menu-button'));
            } else if (currentActiveMenu === 'practice') {
                buttons = Array.from(practiceMenu.querySelectorAll('.menu-button'));
            } else if (currentActiveMenu === 'story') {
                buttons = Array.from(storyMenu.querySelectorAll('.menu-button'));
            } else if (currentActiveMenu === 'stats') {
                buttons = Array.from(statsMenu.querySelectorAll('.menu-button'));
            } else if (currentActiveMenu === 'store') {
                buttons = Array.from(storeMenu.querySelectorAll('.menu-button'));
            } else if (currentActiveMenu === 'achievements') {
                buttons = Array.from(achievementsMenu.querySelectorAll('.menu-button'));
            } else if (currentActiveMenu === 'feedback') {
                buttons = Array.from(feedbackMenu.querySelectorAll('.menu-button'));
            } else if (currentActiveMenu === 'server-message') {
                buttons = Array.from(serverMessageMenu.querySelectorAll('.menu-button'));
            } else if (currentActiveMenu === 'game') {
                buttons = Array.from(gameMenu.querySelectorAll('.menu-button'));
            }

            // Sağ/sol ok ile dolaşırken görünmez olan (.style.display = 'none') öğelere odaklanmayı engelle
            return buttons.filter(btn => {
                const li = btn.closest('li');
                if (li && li.style.display === 'none') {
                    return false;
                }
                return true;
            });
        }

        let gameModes = {
            easy: { name: "Kolay", completionCount: 0, isUnlocked: true, requiredToUnlock: 0 },
            medium: { name: "Orta", completionCount: 0, isUnlocked: false, requiredToUnlock: 1 },
            hard: { name: "Zor", completionCount: 0, isUnlocked: false, requiredToUnlock: 5 },
            missing_notes: { name: "Kayıp Notalar", completionCount: 0, isUnlocked: false, requiredToUnlock: 5 }
        };

        let userAchievements = {
            hafizam_gucleniyor: false // Kolay mod 2 defa oynandığında
        };

        // localStorage'dan kayıt verilerini al
        const savedModes = localStorage.getItem('hafizaGuvenModes');
        if (savedModes) {
            try {
                // Sadece var olan özellikleri güncelle (önceki veriler bozuksa oyunu patlatmamak için)
                const parsedModes = JSON.parse(savedModes);
                for (const key in parsedModes) {
                    if (gameModes[key]) {
                        gameModes[key].completionCount = parsedModes[key].completionCount || 0;
                    }
                }
            } catch (e) {
                console.error("Mod verileri okunamadı", e);
            }
        }

        const savedAchievements = localStorage.getItem('hafizaGuvenAchievements');
        if (savedAchievements) {
            try {
                const parsedAchievements = JSON.parse(savedAchievements);
                for (const key in parsedAchievements) {
                    if (userAchievements.hasOwnProperty(key)) {
                        userAchievements[key] = parsedAchievements[key];
                    }
                }
            } catch (e) {
                console.error("Başarı verileri okunamadı", e);
            }
        }

        function updateScoreboardLocks() {
            if (gameModes.easy.completionCount >= gameModes.medium.requiredToUnlock) {
                gameModes.medium.isUnlocked = true;
            }
            if (gameModes.medium.completionCount >= gameModes.hard.requiredToUnlock) {
                gameModes.hard.isUnlocked = true;
            }
            if (gameModes.hard.completionCount >= gameModes.missing_notes.requiredToUnlock) {
                gameModes.missing_notes.isUnlocked = true;
            }

            const btnMedium = document.getElementById('btn-score-medium');
            const btnHard = document.getElementById('btn-score-hard');
            const btnMissingNotes = document.getElementById('btn-score-missing-notes');

            updateButtonUI(btnMedium, gameModes.medium, "Orta moddaki en yüksek skoru görüntüle", "Kolay modu 1 kez tamamla");
            updateButtonUI(btnHard, gameModes.hard, "Zor moddaki yüksek skoru görüntüle", "Orta modu 5 kez tamamla");
            updateButtonUI(btnMissingNotes, gameModes.missing_notes, "Kayıp notalar modu için yüksek skoru görüntüle", "Zor modu 5 kez tamamla");
        }

        function updateButtonUI(btnElement, modeData, unlockedLabel, lockReason) {
            if (!btnElement) return;

            if (modeData.isUnlocked) {
                btnElement.removeAttribute('aria-disabled');
                btnElement.classList.remove('locked-btn');
                btnElement.innerHTML = modeData.name + " Mod";
                btnElement.setAttribute('aria-label', unlockedLabel);
            } else {
                btnElement.setAttribute('aria-disabled', 'true');
                btnElement.classList.add('locked-btn');
                const displayName = modeData.name === "Hayatta Kalma" ? modeData.name : modeData.name + " Mod";
                btnElement.innerHTML = displayName + " 🔒";
                btnElement.setAttribute('aria-label', `${modeData.name} modu kilitli. Açmak için ${lockReason}.`);
            }
        }

        // Başlangıçta kilitleri hesapla ve arayüzü güncelle
        updateScoreboardLocks();

        // Seslerin seviyesini ayarlıyoruz
        if (hoverSound) {
            hoverSound.volume = 0.5;
        }
        if (clickSound) {
            clickSound.volume = 0.5;
        }

        // Howler.js ile pan (sağa-sola ses yöneltme) işlemini 3D pos ile yapıyoruz
        function updatePan(index, total) {
            // total 1 ise merkezde (0) kalsın, aksi halde menü uzunluğuna göre -1 ile +1 arası değer bulalım.
            let xPos = 0;
            if (total > 1) {
                xPos = (index / (total - 1)) * 2 - 1;
            }

            // Mobil uyumluluk için pos(x,0,-0.5) yerine Z eksenini 0 yapıyoruz.
            // Veya daha iyisi stereo panner kullanabiliriz.
            hoverSound.stereo ? hoverSound.stereo(xPos) : hoverSound.pos(xPos, 0, 0);
            clickSound.stereo ? clickSound.stereo(xPos) : clickSound.pos(xPos, 0, 0);
        }

        // Web Audio API'nin mobil tarayıcılarda uyku modundan çıkmasını (resume) garanti altına almak
        const ensureAudioUnlock = () => {
            if (typeof Howler !== 'undefined' && Howler.ctx && Howler.ctx.state === 'suspended') {
                Howler.ctx.resume();
            }
        };

        // Belgedeki ilk dokunuşta sesi aç
        document.addEventListener('touchstart', ensureAudioUnlock, { passive: true });
        document.addEventListener('pointerdown', ensureAudioUnlock, { passive: true });

        // Butonların üzerine fare ile gelince veya klavye ile odaklanınca dolaş sesi çal
        allMenuButtons.forEach((button) => {
            const playHover = () => {
                ensureAudioUnlock();
                // Menü sesleri artık isStarted bayrağına bakmaksızın (intro ekranı hariç) çalmalı
                if (currentActiveMenu !== 'none') {
                    hoverSound.play();
                }
            };

            button.addEventListener('mouseenter', () => {
                const activeButtons = getActiveButtons();
                const index = activeButtons.indexOf(button);
                if (index !== -1) {
                    currentFocusIndex = index;
                    updatePan(currentFocusIndex, activeButtons.length);
                }
                playHover();
            });
            button.addEventListener('focus', () => {
                const activeButtons = getActiveButtons();
                const index = activeButtons.indexOf(button);
                if (index !== -1) {
                    currentFocusIndex = index;
                    updatePan(currentFocusIndex, activeButtons.length);
                }
                playHover();
            });

            // Mobil touch keşifleri ve normal dokunmalar için
            button.addEventListener('pointerdown', () => {
                const activeButtons = getActiveButtons();
                const index = activeButtons.indexOf(button);
                if (index !== -1) {
                    currentFocusIndex = index;
                    updatePan(currentFocusIndex, activeButtons.length);
                }
                playHover();
            });

            button.addEventListener('touchstart', () => {
                const activeButtons = getActiveButtons();
                const index = activeButtons.indexOf(button);
                if (index !== -1) {
                    currentFocusIndex = index;
                    updatePan(currentFocusIndex, activeButtons.length);
                }
                playHover();
            }, { passive: true });

            button.addEventListener('click', (event) => {
                ensureAudioUnlock();
                // Eğer buton aria-disabled='true' ise (kilitliyse) hiçbir işlem yapma
                if (button.getAttribute('aria-disabled') === 'true') {
                    event.preventDefault();
                    event.stopPropagation();
                    return;
                }
                const activeButtons = getActiveButtons();
                const index = activeButtons.indexOf(button);
                if (index !== -1) {
                    updatePan(index, activeButtons.length);
                }
                if (isStarted) {
                    clickSound.play();
                }
            });
        });

        const serverMessageContinueBtn = document.getElementById('server-message-continue-btn');
        if (serverMessageContinueBtn) {
            serverMessageContinueBtn.addEventListener('click', () => {
                localStorage.setItem('lastSeenChangelogVersion', globalChangelogVersion);
                
                switchMenu(serverMessageMenu, mainMenu, 'main');
                
                setTimeout(() => {

                    const firstButton = mainMenu.querySelector('.menu-button');
                    if (firstButton) firstButton.focus();
                    announceToScreenReader("Yeni güncellemeleri anladım, oyuna devam et. " + window.localizeText('Hafızana güven oyununa hoş geldiniz. Öğeler arasında dolaşmak için sağ sol ok tuşlarına basın. Müzik sesini açıp kısmak için, sayfa yukarı ve sayfa aşağı tuşuna basın. Müziği susturmak için m tuşuna basın.'));
                }, 50);
            });
        }

        const scoreboardBtnMain = document.getElementById('scoreboard-btn-main');
        const scoreboardBackBtn = document.getElementById('scoreboard-back-btn');

        const practiceBtnMain = document.getElementById('practice-mode-btn');
        const practiceBackBtn = document.getElementById('practice-back-btn');

        const statsBtnMain = document.getElementById('stats-btn-main'); // Skor Tablosu yerine geçen İstatistikler butonu
        const statsBackBtn = document.getElementById('stats-back-btn');
        const storeBtnMain = document.getElementById('store-btn-main'); // Mağaza Butonu
        const storeBackBtn = document.getElementById('store-back-btn'); // Mağaza Geri Butonu

        const feedbackBtnMain = document.getElementById('feedback-btn-main'); // Geri Bildirim Butonu
        const feedbackBackBtn = document.getElementById('feedback-back-btn');
        const feedbackSubmitBtn = document.getElementById('feedback-submit-btn');

        if (feedbackBtnMain && feedbackBackBtn) {
            feedbackBtnMain.addEventListener('click', () => {
                switchMenu(mainMenu, feedbackMenu, 'feedback');
                setTimeout(() => {
                    announceToScreenReader("Geri bildirim menüsü açıldı. Bu oyun hakkındaki hata ve önerilerinizi tab tuşuyla form alanlarında dolaşarak yazabilirsiniz.");
                    const firstInput = document.getElementById('feedback-name');
                    if (firstInput) firstInput.focus();
                }, 400);
            });

            feedbackBackBtn.addEventListener('click', () => {
                switchMenu(feedbackMenu, mainMenu, 'main');
            });

            if (feedbackSubmitBtn) {
                feedbackSubmitBtn.addEventListener('click', () => {
                    const feedbackName = document.getElementById('feedback-name');
                    const feedbackText = document.getElementById('feedback-text');
                    const feedbackCategory = document.getElementById('feedback-category');
                    
                    if (feedbackText && feedbackText.value.trim() === '') {
                        wrongSound.play();
                        announceToScreenReader("Lütfen göndermeden önce geçerli bir mesaj yazın.");
                        feedbackText.focus();
                        return;
                    }

                    // Google Forms entegrasyonu
                    const googleFormUrl = "https://docs.google.com/forms/d/e/1FAIpQLScI4OEbaxgBs1MEDFmAKk9C5rKWuCdrcrIn4ZGcncsk6Cuj6Q/formResponse";
                    const formData = new FormData();
                    formData.append("entry.1166239628", feedbackName ? feedbackName.value : "");
                    formData.append("entry.1001484363", feedbackCategory ? feedbackCategory.value : "");
                    formData.append("entry.150314719", feedbackText ? feedbackText.value : "");
                    fetch(googleFormUrl, { method: "POST", mode: "no-cors", body: formData }).catch(e => console.error(e));

                    // Formu sıfırla ve başarılı anonsu geç
                    if(feedbackName) feedbackName.value = '';
                    if(feedbackText) feedbackText.value = '';
                    if(feedbackCategory) feedbackCategory.selectedIndex = 0;
                    
                    modeUnlockSound.play();
                    announceToScreenReader("Geri bildiriminiz başarıyla iletilmiştir. Harika öneri ve bildirimleriniz oyunu geliştirmek için kullanılacaktır. Teşekkürler. Ana menüye dönülüyor.");
                    
                    setTimeout(() => {
                        switchMenu(feedbackMenu, mainMenu, 'main');
                    }, 2500);
                });
            }
        }

        const startGameBtn = document.getElementById('start-game-btn');
        const gameBackBtn = document.getElementById('game-back-btn');

        const btnDiffEasy = document.getElementById('btn-diff-easy');
        const btnDiffMedium = document.getElementById('btn-diff-medium');
        const liDiffMedium = document.getElementById('li-diff-medium');
        const btnDiffHard = document.getElementById('btn-diff-hard');
        const liDiffHard = document.getElementById('li-diff-hard');
        const btnDiffMissingNotes = document.getElementById('btn-diff-missing-notes');
        const liDiffMissingNotes = document.getElementById('li-diff-missing-notes');
        const difficultyBackBtn = document.getElementById('difficulty-back-btn');

        if (startGameBtn) {
            startGameBtn.addEventListener('click', () => {
                // Ana menüden zorluk seçimi menüsüne geç
                switchMenu(mainMenu, difficultyMenu, 'difficulty');
                updateDifficultyMenuLocks();
            });
        }

        if (difficultyBackBtn) {
            difficultyBackBtn.addEventListener('click', () => {
                switchMenu(difficultyMenu, mainMenu, 'main');
            });
        }

        if (btnDiffEasy && gameBackBtn) {
            btnDiffEasy.addEventListener('click', () => {
                // Zorluk seçimi menüsünden oyuna geç
                switchMenu(difficultyMenu, gameMenu, 'game');
                startMainGame('easy'); // Oyunu fiilen başlat
            });

            if (btnDiffMedium) {
                btnDiffMedium.addEventListener('click', () => {
                    switchMenu(difficultyMenu, gameMenu, 'game');
                    startMainGame('medium');
                });
            }

            if (btnDiffHard) {
                btnDiffHard.addEventListener('click', () => {
                    switchMenu(difficultyMenu, gameMenu, 'game');
                    startMainGame('hard');
                });
            }

            if (btnDiffMissingNotes) {
                btnDiffMissingNotes.addEventListener('click', () => {
                    if (window.isMobileDevice) {
                        alert("Bu mod telefonlar için uyumlu olmadığından devre dışı bırakılmıştır.");
                        if (typeof announceToScreenReader === 'function') announceToScreenReader("Bu mod telefonlar için uyumlu olmadığından devre dışı bırakılmıştır.");
                        return;
                    }
                    switchMenu(difficultyMenu, storyMenu, 'story');

                    if (bgMusic.playing()) {
                        bgMusic.pause();
                    }
                    if (mountainSound.playing()) {
                        mountainSound.stop();
                    }
                    if (doorCloseSound.playing()) {
                        doorCloseSound.stop();
                    }
                    clearTimeout(stepIntervalId);

                    if (!house2Sound.playing()) {
                        house2Sound.volume(0.8);
                        house2Sound.play();
                    }

                    inStoryMode = true;
                    currentStoryIndex = 0;
                    setTimeout(() => {
                        playCurrentStoryDialog();
                        triggerStoryAnimations(0);
                    }, 350);
                });
            }

            gameBackBtn.addEventListener('click', () => {
                endMainGame(false, false, true); // Kullanıcı kendi isteğiyle oyunu bitirdi (isUserExit = true)

                // Ana menüye dönüş yapıldığında müziği baştan oynat
                if (house2Sound.playing()) {
                    house2Sound.stop();
                }
                if (mountainSound.playing()) {
                    mountainSound.stop();
                }
                if (doorCloseSound.playing()) {
                    doorCloseSound.stop();
                }
                clearTimeout(stepIntervalId);
                if (bgMusic.playing()) {
                    bgMusic.stop();
                }
                bgMusic.play();
            });

            const mobileGameBackBtn = document.getElementById('mobile-game-back-btn');
            if (mobileGameBackBtn) {
                mobileGameBackBtn.addEventListener('pointerdown', (e) => {
                    e.preventDefault();
                    gameBackBtn.click(); // Masaüstü butonun tıklama olayını tetikle
                });
            }

            const mobileReplayBtn = document.getElementById('mobile-replay-btn');
            if (mobileReplayBtn) {
                mobileReplayBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    // Space/boşluk tuşunun yaptığı işi simüle et (Tekrar oynat)
                    const ev = new KeyboardEvent('keydown', { key: ' ' });
                    document.dispatchEvent(ev);
                });
            }
        }

        // Zorluk menüsü buton etiketlerini güncelleyen fonksiyon
        function updateDifficultyMenuLocks() {
            if (!btnDiffEasy) return;

            const winsEasy = gameModes.easy.completionCount;
            const reqMedium = gameModes.medium.requiredToUnlock;

            const winsMedium = gameModes.medium.completionCount;
            const reqHard = gameModes.hard.requiredToUnlock;

            let announcementText = "Lütfen bir mod seçin. ";

            // --- KOLAY MOD KONTROLÜ ---
            if (winsEasy < reqMedium) {
                const remainingEasy = reqMedium - winsEasy;
                btnDiffEasy.innerHTML = `Kolay Mod (${winsEasy}/${reqMedium} Tamamlandı)`;
                btnDiffEasy.setAttribute('aria-label', `Kolay mod. Orta modu açmak için ${remainingEasy} kez daha kolay modu tamamlamanız gerekiyor. Sizin tamamladığınız tur sayısı: ${winsEasy}. Seçmek için enter'a basın.`);

                if (liDiffMedium) liDiffMedium.style.display = 'none';
                if (liDiffHard) liDiffHard.style.display = 'none';
            } else {
                btnDiffEasy.innerHTML = `Kolay Mod (Tamamlandı)`;
                btnDiffEasy.setAttribute('aria-label', `Kolay mod tamamlandı.`);

                if (liDiffMedium) liDiffMedium.style.display = 'block';

                // --- ORTA MOD KONTROLÜ ---
                if (winsMedium < reqHard) {
                    const remainingMedium = reqHard - winsMedium;
                    if (btnDiffMedium) {
                        btnDiffMedium.innerHTML = `Orta Mod (${winsMedium}/${reqHard} Tamamlandı)`;
                        btnDiffMedium.setAttribute('aria-label', `Orta mod. Hedef 5 soru. Zor modu açmak için ${remainingMedium} kez daha bu modu tamamlamanız gerekiyor. Sizin tamamladığınız tur sayısı: ${winsMedium}. Seçmek için enter'a basın.`);
                    }

                    if (liDiffHard) liDiffHard.style.display = 'none';
                } else {
                    if (btnDiffMedium) {
                        btnDiffMedium.innerHTML = `Orta Mod (Tamamlandı)`;
                        btnDiffMedium.setAttribute('aria-label', `Orta mod tamamlandı.`);
                    }

                    // Orta mod tamamlandıysa Zor mod'u göster
                    if (liDiffHard) liDiffHard.style.display = 'block';

                    // --- ZOR MOD KONTROLÜ ---
                    if (btnDiffHard) {
                        if (gameModes.hard.completionCount < gameModes.missing_notes.requiredToUnlock) {
                            btnDiffHard.innerHTML = `Zor Mod (${gameModes.hard.completionCount}/${gameModes.missing_notes.requiredToUnlock} Tamamlandı)`;
                            btnDiffHard.setAttribute('aria-label', `Zor mod. Hedef 10 soru. Kayıp Notalar modunu açmak için ${gameModes.missing_notes.requiredToUnlock - gameModes.hard.completionCount} kez daha bu modu tamamlamanız gerekiyor. Sizin tamamladığınız tur sayısı: ${gameModes.hard.completionCount}. Seçmek için enter'a basın.`);
                        } else {
                            btnDiffHard.innerHTML = `Zor Mod (Tamamlandı)`;
                            btnDiffHard.setAttribute('aria-label', `Zor mod tamamlandı.`);

                            // Zor mod tamamlandıysa Kayıp Notalar'ı göster
                            if (liDiffMissingNotes) liDiffMissingNotes.style.display = 'block';
                            if (btnDiffMissingNotes) {
                                btnDiffMissingNotes.innerHTML = `Kayıp Notalar (${gameModes.missing_notes.completionCount} Tamamlandı)`;
                                btnDiffMissingNotes.setAttribute('aria-label', `Kayıp Notalar Modu. Bili'nin gizlediği notayı bul. ${gameModes.missing_notes.completionCount} kez tamamlandı. Seçmek için enter'a basın.`);
                            }
                        }
                    }
                }
            }

            // Sadece kısa bir başlık okut (Eski uzun metin yerine)
            setTimeout(() => {
                announceToScreenReader("Zorluk seçimi ekranı.");
            }, 400); // Menü geçiş animasyonunun (300ms) bitmesini bekler
        }

        if (practiceBtnMain && practiceBackBtn) {
            practiceBtnMain.addEventListener('click', () => {
                switchMenu(mainMenu, practiceMenu, 'practice');

                // Alıştırma moduna girildiğinde menü müziğini durdur
                if (bgMusic.playing()) {
                    bgMusic.pause();
                }

                practiceTargetIndex = 0;
                practicePressCount = 0;
                inPracticeTutorial = false; // until dialog finishes
                isDialogPhase = true;
                currentDialogIndex = 0;

                const practiceNav = document.getElementById('practice-nav');
                if (practiceNav) practiceNav.style.display = 'none';

                const practiceMenuDOM = document.getElementById('practice-menu-container');
                if (practiceMenuDOM) practiceMenuDOM.dataset.isPracticeOver = "false";

                setTimeout(() => playCurrentDialog(), 350);
            });

            practiceBackBtn.addEventListener('click', () => {
                switchMenu(practiceMenu, mainMenu, 'main');
                inPracticeTutorial = false;

                // Alıştırma modundan çıkıldığında menü müziğini devam ettir
                if (!bgMusic.playing()) {
                    bgMusic.play();
                }
            });
        }

        const btnAchievementsMain = document.getElementById('btn-achievements-main');
        const achievementsBackBtn = document.getElementById('achievements-back-btn');

        if (btnAchievementsMain && achievementsBackBtn) {
            btnAchievementsMain.addEventListener('click', () => {
                const achievementsContent = document.getElementById('achievements-content');

                let totalAch = 0;
                let completedAch = 0;
                let htmlContent = "";
                let srText = "Başarılar ekranı. ";

                achievementsAnnouncements = [];
                currentAchIndex = 0;

                // userAchievements objesindeki başarıları dolaşıp kontrol
                for (const [key, isCompleted] of Object.entries(userAchievements)) {
                    totalAch++;

                    // İleride daha fazla başarı eklenirse burayı object data üzerinden (isim ve açıklama) almak daha temiz olur
                    let achName = "Hafızam güçleniyor";
                    let description = "Kolay Modda 2 defa oyunu tamamla.";

                    if (isCompleted) {
                        completedAch++;
                        htmlContent += `<p style="margin-bottom:15px; color:#4CAF50;"><strong>${achName} (Kazanıldı):</strong> <span style="color:#ddd">${description}</span></p>`;
                    } else {
                        htmlContent += `<p style="margin-bottom:15px; color:#ff4d4d;"><strong>${achName} (Kilitli):</strong> <span style="color:#ddd">${description}</span></p>`;
                    }

                    achievementsAnnouncements.push(`${achName}. Durum: ${isCompleted ? 'Kazanıldı' : 'Kilitli'}. Açıklaması: ${description}`);
                }

                // Sağ/Sol ok ile dolaşırken "Geri" butonuna da gelindiğini ve çıkılabileceğini bildirmek için listeye ekliyoruz.
                achievementsAnnouncements.push("Geri düğmesi. Ana menüye dönmek için entıra veya ekrana çift dokunun.");

                const progressPercent = totalAch > 0 ? Math.floor((completedAch / totalAch) * 100) : 0;

                htmlContent = `<p style="margin-bottom: 20px; font-size:1.2rem; color:#ffb703;">Tamamlanma Yüzdesi: <strong>%${progressPercent}</strong> (${completedAch}/${totalAch})</p>` + htmlContent;

                srText += `Toplam ${totalAch} başarının ${completedAch} tanesini tamamladınız. Yüzde ${progressPercent} tamamlandı. İçerikler arasında dolaşmak için ok tuşlarını kullanın. Geri dönmek için entıra basın.`;

                if (achievementsContent) {
                    achievementsContent.innerHTML = htmlContent;
                }

                switchMenu(mainMenu, achievementsMenu, 'achievements');
                setTimeout(() => announceToScreenReader(srText), 400);
            });

            achievementsBackBtn.addEventListener('click', () => {
                switchMenu(achievementsMenu, mainMenu, 'main');
            });
        }

        if (statsBtnMain && statsBackBtn) {
            statsBtnMain.addEventListener('click', () => {
                updateStatsDisplay(); // İstatistikleri güncelle ve menüye geç
                switchMenu(mainMenu, statsMenu, 'stats');
            });

            statsBackBtn.addEventListener('click', () => {
                switchMenu(statsMenu, mainMenu, 'main');
            });
        }

        const buyShieldBtn = document.getElementById('buy-shield-btn');

        function updateStoreUI(skipAriaUpdate = false) {
            const storeContent = document.getElementById('store-content');
            let totalTokens = parseInt(localStorage.getItem('hafizaGuvenTotalTokens')) || 0;
            hataKorumasiCount = parseInt(localStorage.getItem('hafizaGuvenHataKorumasi')) || 0;
            zamanKorumasiCount = parseInt(localStorage.getItem('hafizaGuvenZamanKorumasi')) || 0;

            if (storeContent) {
                storeContent.innerHTML = `
                        <p style="margin-bottom: 10px;"><strong>Toplam Jetonunuz:</strong> ${totalTokens}</p>
                        <p style="margin-bottom: 10px;"><strong>Hata Koruması:</strong> ${hataKorumasiCount} Adet</p>
                        <p style="font-size: 0.9rem; margin-bottom: 15px;">Hata koruması: Hata yaptığınızda sürenizden gitmez ve size 5 saniye ek süre kazandırır. Dikkatli olmanız gereken şey ise, bunun tek kullanımlık olmasıdır. Dikkatli harcayın. Fiyat: 50 Jeton.</p>
                        <p style="margin-bottom: 10px;"><strong>Zaman Koruması:</strong> ${zamanKorumasiCount} Adet</p>
                        <p style="font-size: 0.9rem;">Zaman koruması: Süreniz bittiğinde oyun anında bitmez, sizi kurtararak tek seferlik 15 saniye ek süre kazandırır. Fiyat: 30 Jeton.</p>
                    `;
            }

            if (!skipAriaUpdate) {
                if (buyShieldBtn) {
                    buyShieldBtn.removeAttribute('aria-disabled');
                    buyShieldBtn.classList.remove('locked-btn');
                    buyShieldBtn.setAttribute('aria-label', `Hata Koruması. Hata yaptığınızda sürenizden gitmez ve size 5 saniye ek süre kazandırır. Fiyat: 50 Jeton. Mevcut Jetonunuz: ${totalTokens}`);
                }

                const buyTimeShieldBtn = document.getElementById('buy-time-shield-btn');
                if (buyTimeShieldBtn) {
                    buyTimeShieldBtn.removeAttribute('aria-disabled');
                    buyTimeShieldBtn.classList.remove('locked-btn');
                    buyTimeShieldBtn.setAttribute('aria-label', `Zaman Koruması. Süreniz bittiğinde oyun bitmez, tek seferlik 15 saniye ek süre kazanırsınız. Fiyat: 30 Jeton. Mevcut Jetonunuz: ${totalTokens}`);
                }
            }

            return `Mağazaya hoş geldiniz. Burası oyun içi öğeleri satın alabileceğiniz yerdir. Öğeler arasında dolaşmak için yukarı ve aşağı oklara basabilirsiniz. Önce öğenin adı ve ne işe yaradığı, sonra da ne kadar jeton tuttuğu, ve son olarak sizin ne kadar jetonunuz olduğunu duyacaksınız. Almak istediğiniz öğenin üzerinde entır tuşuna bastığınızda, miktar sormadan direkt bir adet satın alınacaktır.`;
        }

        if (storeBtnMain && storeBackBtn) {
            storeBtnMain.addEventListener('click', () => {
                switchMenu(mainMenu, storeMenu, 'store');
                const srText = updateStoreUI();
                setTimeout(() => announceToScreenReader(srText), 400);
            });

            storeBackBtn.addEventListener('click', () => {
                const qtyContainer = document.getElementById('store-buy-quantity-container');
                if (qtyContainer && qtyContainer.style.display === 'block') {
                    // Seçim ekranından çıkış
                    qtyContainer.style.display = 'none';
                    const storeBtnList = document.getElementById('store-button-list');
                    if (storeBtnList) storeBtnList.style.display = 'block';

                    // Odaklamayı satın almaktan vazgeçtiği butona geri getir
                    currentFocusIndex = currentBuyType === 'shield' ? 0 : 1;
                    const activeBtns = getActiveButtons();
                    if (activeBtns[currentFocusIndex]) activeBtns[currentFocusIndex].focus();

                    announceToScreenReader("Satın alma iptal edildi.");
                } else {
                    switchMenu(storeMenu, mainMenu, 'main');
                }
            });

            function executePurchase() {
                let totalTokens = parseInt(localStorage.getItem('hafizaGuvenTotalTokens')) || 0;
                const totalCost = currentBuyPrice * currentBuyQuantity;

                if (totalTokens < totalCost) {
                    wrongSound.play();
                    announceToScreenReader(`Yetersiz jeton. ${currentBuyQuantity} adet ${currentBuyName} için ${totalCost} jeton gerekiyor. Mevcut jetonunuz: ${totalTokens}`);
                    return;
                }

                totalTokens -= totalCost;

                if (currentBuyType === 'shield') {
                    hataKorumasiCount += currentBuyQuantity;
                    localStorage.setItem('hafizaGuvenHataKorumasi', hataKorumasiCount);
                } else if (currentBuyType === 'time') {
                    zamanKorumasiCount += currentBuyQuantity;
                    localStorage.setItem('hafizaGuvenZamanKorumasi', zamanKorumasiCount);
                }

                localStorage.setItem('hafizaGuvenTotalTokens', totalTokens);
                buySound.play();

                const qtyContainer = document.getElementById('store-buy-quantity-container');
                if (qtyContainer) qtyContainer.style.display = 'none';
                const storeBtnList = document.getElementById('store-button-list');
                if (storeBtnList) storeBtnList.style.display = 'block';

                updateStoreUI(true);
                announceToScreenReader(`${currentBuyQuantity} adet ${currentBuyName} başarıyla alındı. Kalan jeton: ${totalTokens}`);

                setTimeout(() => {
                    updateStoreUI(false);
                    currentFocusIndex = currentBuyType === 'shield' ? 0 : 1;
                    const activeBtns = getActiveButtons();
                    if (activeBtns[currentFocusIndex]) activeBtns[currentFocusIndex].focus();
                }, 5000);
            }

            function openQuantitySelector(type, price, name) {
                currentBuyType = type;
                currentBuyPrice = price;
                currentBuyName = name;
                currentBuyQuantity = 1;

                const qtyContainer = document.getElementById('store-buy-quantity-container');
                const storeBtnList = document.getElementById('store-button-list');
                const qtyDisplay = document.getElementById('store-buy-quantity-display');

                if (storeBtnList) storeBtnList.style.display = 'none';
                if (qtyContainer) {
                    qtyContainer.style.display = 'block';
                    if (qtyDisplay) {
                        qtyDisplay.textContent = currentBuyQuantity;
                        qtyDisplay.setAttribute('aria-valuenow', currentBuyQuantity);
                        qtyDisplay.setAttribute('aria-label', `Miktar: ${currentBuyQuantity}`);
                        qtyDisplay.focus();
                    }
                }
                announceToScreenReader(`Kaç adet ${name} satın almak istiyorsunuz? Miktar: 1. Artırmak için sağ, azaltmak için sol ok, onaylamak için entır tuşuna basın veya iptal etmek için geri çıkın.`);
            }

            if (buyShieldBtn) {
                buyShieldBtn.addEventListener('click', () => {
                    openQuantitySelector('shield', 50, 'Hata Koruması');
                });
            }

            const buyTimeShieldBtn = document.getElementById('buy-time-shield-btn');
            if (buyTimeShieldBtn) {
                buyTimeShieldBtn.addEventListener('click', () => {
                    openQuantitySelector('time', 30, 'Zaman Koruması');
                });
            }
        }

        function updateStatsDisplay() {
            const statsContent = document.getElementById('stats-content');
            if (!statsContent) return;

            let totalTokens = parseInt(localStorage.getItem('hafizaGuvenTotalTokens')) || 0;

            let easyWins = gameModes.easy.completionCount || 0;
            let mediumWins = gameModes.medium.completionCount || 0;
            let hardWins = gameModes.hard.completionCount || 0;
            let missingNotesWins = gameModes.missing_notes ? (gameModes.missing_notes.completionCount || 0) : 0;

            let htmlContent = `
                    <p style="margin-bottom: 10px;"><strong>Toplam Kazanılan Jeton:</strong> ${totalTokens}</p>
                    <p style="margin-bottom: 10px;"><strong>Kolay Mod Tamamlama:</strong> ${easyWins}</p>
                `;

            let srText = `İstatistikler ekranı. Toplam kazanılan jeton: ${totalTokens}. Kolay mod tamamlama: ${easyWins}. `;

            if (gameModes.medium.isUnlocked) {
                htmlContent += `<p style="margin-bottom: 10px;"><strong>Orta Mod Tamamlama:</strong> ${mediumWins}</p>\n`;
                srText += `Orta mod tamamlama: ${mediumWins}. `;
            }

            if (gameModes.hard.isUnlocked) {
                htmlContent += `<p style="margin-bottom: 10px;"><strong>Zor Mod Tamamlama:</strong> ${hardWins}</p>\n`;
                srText += `Zor mod tamamlama: ${hardWins}. `;
            }

            if (gameModes.missing_notes && gameModes.missing_notes.isUnlocked) {
                htmlContent += `<p style="margin-bottom: 10px;"><strong>Kayıp Notalar Tamamlama:</strong> ${missingNotesWins}</p>\n`;
                srText += `Kayıp Notalar Tamamlama: ${missingNotesWins}. `;
            }

            srText += `Geri dönmek için entır tuşuna basın.`;

            statsContent.innerHTML = htmlContent;
            setTimeout(() => announceToScreenReader(srText), 400); // animasyon geçişini bekleyip okur
        }

        function updateMobileKeysVisibility() {
            const mobilePiano = document.getElementById('mobile-piano-container');
            const mobileEnter = document.getElementById('mobile-enter-container');

            document.body.classList.remove('show-mobile-keys', 'show-mobile-enter');

            // Varsayılan olarak ikisini de SR'dan gizle
            if (mobilePiano) mobilePiano.setAttribute('aria-hidden', 'true');
            if (mobileEnter) mobileEnter.setAttribute('aria-hidden', 'true');

            if (currentActiveMenu === 'game') {
                if (typeof gameIsActive !== 'undefined' && !gameIsActive) {
                    document.body.classList.add('show-mobile-enter');
                    if (mobileEnter) mobileEnter.removeAttribute('aria-hidden');
                } else {
                    document.body.classList.add('show-mobile-keys');
                    if (mobilePiano) mobilePiano.removeAttribute('aria-hidden');
                }
            } else if (currentActiveMenu === 'practice') {
                if (typeof isDialogPhase !== 'undefined' && isDialogPhase) {
                    document.body.classList.add('show-mobile-enter');
                    if (mobileEnter) mobileEnter.removeAttribute('aria-hidden');
                } else {
                    document.body.classList.add('show-mobile-keys');
                    if (mobilePiano) mobilePiano.removeAttribute('aria-hidden');
                }
            } else if (currentActiveMenu === 'story') {
                if (typeof inStoryMode !== 'undefined' && inStoryMode && !isGridWalkingPhase) {
                    document.body.classList.add('show-mobile-enter');
                    if (mobileEnter) mobileEnter.removeAttribute('aria-hidden');
                } else {
                    document.body.classList.add('show-mobile-keys');
                    if (mobilePiano) mobilePiano.removeAttribute('aria-hidden');
                }
            }
        }

        function switchMenu(hideMenu, showMenu, newActiveMenuName) {
            hideMenu.style.opacity = '0';

            setTimeout(() => {
                hideMenu.style.display = 'none';
                hideMenu.setAttribute('aria-hidden', 'true');

                showMenu.style.display = 'flex';
                showMenu.removeAttribute('aria-hidden');

                setTimeout(() => {
                    showMenu.style.opacity = '1';
                    currentActiveMenu = newActiveMenuName;
                    updateMobileKeysVisibility();
                    currentFocusIndex = 0;
                    const firstBtn = showMenu.querySelector('.menu-button');
                    if (firstBtn) firstBtn.focus();
                }, 50);
            }, 300); // 300ms CSS transition süresi ile uyumlu
        }

        let introPlayed = false;
        let introReadyToStartGame = false;
        let currentLogoSound = null;

        // Ekran yüklendiğinde ekran okuyucuyu girişi başlatma butonuna odakla ve tam ekranı ayarla
        window.addEventListener('load', () => {
            const startIntroBtn = document.getElementById('start-intro-btn');

            if (sessionStorage.getItem('skipIntro') === 'true') {
                sessionStorage.removeItem('skipIntro');
                isStarted = true;
                const srcIntro = document.getElementById('intro-screen');
                if (srcIntro) {
                    srcIntro.style.display = 'none';
                    srcIntro.setAttribute('aria-hidden', 'true');
                }
                const mMenu = document.getElementById('main-menu-container');
                if (mMenu) {
                    mMenu.style.display = 'flex';
                    mMenu.style.opacity = '1';
                }

                // Müziği gecikmeli başlat ki okuyucu karışmasın
                setTimeout(() => { if (!bgMusic.playing()) bgMusic.play(); }, 1000);
                setTimeout(() => {
                    const activeButtons = getActiveButtons();
                    if (activeButtons.length > 0) activeButtons[0].focus();
                }, 500);
            } else {
                if (startIntroBtn) {
                    startIntroBtn.focus();
                }
            }

            // Sadece üst ekranı (durum çubuğunu) gizle, alt gezinme tuşlarını bırak (navigationUI: "show")
            const requestFullScreenOnce = () => {
                if (!document.fullscreenElement && document.body.requestFullscreen) {
                    document.body.requestFullscreen({ navigationUI: "show" }).then(() => {
                        // Tarayıcının 'Tam ekrandan çıkmak için Esc tuşuna basın' uyarısını ezmek (interrupt) için Focus Hack
                        const versionHack = document.createElement("div");
                        versionHack.tabIndex = -1;
                        versionHack.setAttribute("role", "alertdialog");
                        versionHack.setAttribute("aria-modal", "true");
                        versionHack.setAttribute("aria-label", "Hafızana Güven Yeni Sürüm");
                        versionHack.setAttribute("aria-live", "assertive");
                        versionHack.style.position = "absolute";
                        versionHack.style.opacity = "0";
                        document.body.appendChild(versionHack);

                        // Anında odağı buraya çekerek uyarıyı sustur
                        versionHack.focus();

                        // Okuma bittikten sonra fazlalığı temizle ve odağı asıl butona geri ver
                        setTimeout(() => {
                            if (document.body.contains(versionHack)) document.body.removeChild(versionHack);
                            const startBtn = document.getElementById('start-intro-btn');
                            if (startBtn) startBtn.focus();
                        }, 2500);

                    }).catch(err => {
                        console.log(`Tam ekran yapılamadı: ${err.message}`);
                    });
                }
                // Sadece ilk dokunuşta/tıklamada çalışsın, sonra dinleyiciyi kaldır
                document.removeEventListener('click', requestFullScreenOnce);
                document.removeEventListener('pointerdown', requestFullScreenOnce);
            };

            document.addEventListener('click', requestFullScreenOnce);
            document.addEventListener('pointerdown', requestFullScreenOnce);

            // Mobil Enter tuşu için event listener (Diyalogları geçmek için Enter'ı simüle eder)
            const mobileEnterBtn = document.getElementById('mobile-enter-btn');
            if (mobileEnterBtn) {
                mobileEnterBtn.addEventListener('pointerdown', (e) => {
                    e.preventDefault();
                    mobileEnterBtn.focus(); // Odak sürekli butonda kalsın
                    const simulatedEnter = new KeyboardEvent('keydown', {
                        key: 'Enter',
                        code: 'Enter',
                        keyCode: 13,
                        which: 13,
                        bubbles: true,
                        cancelable: true
                    });
                    document.dispatchEvent(simulatedEnter);
                });
            }

            // Mobil tuşlar için event listener
            document.querySelectorAll('.mobile-piano-key').forEach(button => {
                button.addEventListener('pointerdown', (e) => {
                    e.preventDefault(); // Odaklanmayı/çift tıklamayı engelle
                    button.focus();     // Ekran okuyucu odağını bu tuşa zorla
                    const noteKey = button.getAttribute('data-key');

                    // Oyun içi anonsların odağı çalmasını engellemek için geçici bir flag setle
                    window.isMobilePianokeyPressed = true;

                    // Sanal bir klavye eventi fırlat - böylece mevcut oyun mantığı aynen çalışır
                    const simulatedEvent = new KeyboardEvent('keydown', {
                        key: noteKey,
                        code: 'Key' + noteKey.toUpperCase(),
                        bubbles: true,
                        cancelable: true
                    });
                    document.dispatchEvent(simulatedEvent);

                    // Buton animasyonu için
                    button.style.backgroundColor = 'var(--focus-color)';
                    button.style.color = '#000';

                    // Event işlendikten sonra flag'i kaldır ama odağı butonda tut
                    setTimeout(() => {
                        button.style.backgroundColor = '';
                        button.style.color = '';
                        window.isMobilePianokeyPressed = false;
                        button.focus(); // Odağı sıkıca kilitle
                    }, 100);
                });
            });
        });

        function playIntro() {
            if (introPlayed) return;
            introPlayed = true;

            // --- MOBİL GÜVENLİK İÇİN SENKRON SES BAŞLATMA ---
            // Tarayıcıların (özellikle iOS) otomatik ses engellemelerine takılmamak için 
            // --- MOBİL GÜVENLİK İÇİN SENKRON SES BAŞLATMA GÜÇLENDİRİLDİ ---
            // Howler.js'nin dahili Web Audio API engellerine (%100) takılmamak adına tamamen saf 
            // HTML5 Audio objesini tıklama fonksiyonunun callstack'i içinde tetikliyoruz.
            const randomLogoNum = Math.floor(Math.random() * 5) + 1;
            const audio = new window.Audio(`sounds/logo${randomLogoNum}.wav`);
            audio.onended = () => startGame();
            audio.onerror = () => startGame();
            audio.play().catch(e => {
                console.warn("Logo autoplay blocked by strict mobile browser policy", e);
                startGame();
            });

            // Oyun başlarsa Stop() komutu hata vermesi diye Howler.js yapısını sahte nesne (mock) ile koruyoruz.
            currentLogoSound = {
                stop: () => {
                    audio.pause();
                    audio.currentTime = 0;
                }
            };
            // ---------------------------------------------------

            const startIntroBtn = document.getElementById('start-intro-btn');
            if (startIntroBtn) startIntroBtn.style.display = 'none';

            // Aşama 1'i gizle
            const phase1 = document.getElementById('intro-phase-1');
            if (phase1) {
                phase1.style.opacity = '0';
                setTimeout(() => {
                    phase1.style.display = 'none';
                    phase1.setAttribute('aria-hidden', 'true');

                    // Aşama 2'yi göster ve logo çal
                    const phase2 = document.getElementById('intro-phase-2');
                    if (phase2) {
                        phase2.style.display = 'flex';

                        setTimeout(() => {
                            phase2.style.opacity = '1';

                            // Başlığı ekran okuyucuya okutma (versionHack zaten okuyor)

                            setTimeout(() => {
                                introReadyToStartGame = true; // Mobil çift dokunmanın 2. dokunuşunu sönümlemek için 1000ms geciktiriyoruz
                            }, 1000);
                        }, 50);
                    }
                }, 500); // Fade-out süresi
            }
        }

        function startGame() {
            if (isStarted) return;
            isStarted = true;

            if (currentLogoSound) {
                currentLogoSound.stop();
            }

            // Müziği döngüsel olarak başlat
            if (!bgMusic.playing()) {
                bgMusic.play();
            }

            // Başlangıç ekranını yumuşakça tamamen gizle (Fade-out efekti)
            introScreen.style.opacity = '0';

            setTimeout(() => {
                // Intro ekranını DOM'dan gizle ve erişilebilirlik ağacından çıkar
                introScreen.style.display = 'none';
                introScreen.setAttribute('aria-hidden', 'true');

                // Ana menüyü göster (Fade-in efekti)
                mainMenu.style.display = 'flex';
                
                const lastSeenVersion = localStorage.getItem('lastSeenChangelogVersion');
                if (globalChangelogVersion && lastSeenVersion !== globalChangelogVersion && globalChangelogMessage) {
                    switchMenu(mainMenu, serverMessageMenu, 'server-message');
                    setTimeout(() => {
                        const firstBtn = document.getElementById('server-message-continue-btn');
                        if(firstBtn) firstBtn.focus();
                        announceToScreenReader("Sunucu Mesajı: " + globalChangelogMessage + " Devam etmek için butona basın.");
                    }, 400);
                } else {
                    mainMenu.removeAttribute('aria-hidden');
                    // Render'ın tamamlanması için çok kısa bir gecikme
                    setTimeout(() => {
                        mainMenu.style.opacity = '1';

                        // Odaklanmayı ilk butona ver (Erişilebilirlik ve klavye kullanımı için iyi bir pratik)
                        const firstButton = mainMenu.querySelector('.menu-button');
                        if (firstButton) firstButton.focus();
                        announceToScreenReader(window.localizeText('Hafızana güven oyununa hoş geldiniz. Öğeler arasında dolaşmak için sağ sol ok tuşlarına basın. Müzik sesini açıp kısmak için, sayfa yukarı ve sayfa aşağı tuşuna basın. Müziği susturmak için m tuşuna basın.'));
                    }, 50);
                }
            }, 1000); // 1000ms = 1 saniye geçiş süresi
        }

        // Kullanıcı sayfaya tıkladığında veya Enter ile giriş yaptığında
        document.addEventListener('click', function (event) {
            if (!introPlayed) {
                playIntro();
            } else if (introReadyToStartGame && !isStarted) {
                startGame();
            } else if (isStarted) {
                // Menüdeyken boş bir alana tıklanırsa odağı aktif menünün ilk butonuna al
                if (!event.target.closest('.menu-button')) {
                    const activeMenuContainer = currentActiveMenu === 'main' ? mainMenu : scoreboardMenu;
                    const firstButton = activeMenuContainer.querySelector('.menu-button');
                    if (firstButton) firstButton.focus();
                }
            }
        });

        // --- PİYANO NOTALARI (A, B, C, D, E, F, G) -- //
        const pianoNotes = {
            'a': new Howl({ src: ['sounds/a.ogg'], volume: 1.0 }),
            'b': new Howl({ src: ['sounds/b.ogg'], volume: 1.0 }),
            'c': new Howl({ src: ['sounds/c.ogg'], volume: 1.0 }),
            'd': new Howl({ src: ['sounds/d.ogg'], volume: 1.0 }),
            'e': new Howl({ src: ['sounds/e.ogg'], volume: 1.0 }),
            'f': new Howl({ src: ['sounds/f.ogg'], volume: 1.0 }),
            'g': new Howl({ src: ['sounds/g.ogg'], volume: 1.0 })
        };

        // Seslerin (piyano vb.) üst üste binmesini engelleyen fonksiyon
        function playPianoNoteSingle(key) {
            // Herhangi bir nota çalmadan önce diğer tüm notaları durdur (örnek 2 sn'lik uzun bir notaysa anında kesilsin)
            for (let k in pianoNotes) {
                pianoNotes[k].stop();
            }
            if (pianoNotes[key]) {
                // Sesin kodlanmasından kaynaklı baştaki milisaniyelik (padding) sessizliği atlamak için ileri alıyoruz.
                // Web Audio API limitleri yüzünden önce sesin başlaması, sonra seek yapılması gerekiyor.
                let sndId = pianoNotes[key].play();
                pianoNotes[key].seek(0.045, sndId);
            }
        }

        // --- NVDA İÇİN KESİN OKUMA FONKSİYONU (FOCUS HACK) --- //
        function announceToScreenReader(text, forceFocus = true) {
            text = window.localizeText(text); // Mobil cihaz ise metinleri otomatik çevirir

            // Önceki odakta kalan okuyucuyu temizle
            let oldAnnouncer = document.getElementById('sr-focus-announcer');
            if (oldAnnouncer) {
                oldAnnouncer.remove();
            }

            // Agresif Yöntem: NVDA focus aldığında elementin türünü ("bölüm", "metin" vs.) okumasın diye;
            let announcerDiv = document.createElement('div');
            announcerDiv.id = 'sr-focus-announcer';

            // focus alabilmesi için
            announcerDiv.setAttribute('tabindex', '-1');

            // Ekranda yer kaplamasını engelle
            announcerDiv.style.position = 'absolute';
            announcerDiv.style.left = '-9999px';
            announcerDiv.style.width = '1px';
            announcerDiv.style.height = '1px';
            announcerDiv.style.overflow = 'hidden';

            // Modifikasyon: Eğer aktif olarak mobil piyano tuşuna basılıyorsa, fokus hırsızlığını iptal et 
            // ve aria-live ile okut, böylece tuş üzerindeki SR focusu kaybolmaz.
            if (!forceFocus || window.isMobilePianokeyPressed) {
                announcerDiv.setAttribute('aria-live', 'assertive');
                announcerDiv.innerText = text;
                document.body.appendChild(announcerDiv);
            } else {
                // Metni yerleştir
                announcerDiv.innerText = text;
                document.body.appendChild(announcerDiv);
                // span'a odaklanıyoruz. NVDA bu değişikliği anında algılayıp metni okumaya başlar.
                announcerDiv.focus();
            }
        }

        // --- ANA OYUN MANTIĞI --- //
        // Hangi modda oynadığımızı takip etmek için
        let activeDifficulty = 'easy';

        function startMainGame(difficulty = 'easy') {
            if (bgMusic.playing()) bgMusic.pause();

            // Hikaye modundan kalan başlıkları ve ari-label'ları varsayılana çevir
            const gameMenuContainer = document.getElementById('game-menu-container');
            if (gameMenuContainer) gameMenuContainer.setAttribute('aria-label', 'Oyun Alanı');

            const gameMenuTitle = document.getElementById('game-menu-title');
            if (gameMenuTitle) gameMenuTitle.textContent = 'Hafızana Güven';

            activeDifficulty = difficulty;

            // Zor modda başlangıç süresi 45 saniye, diğerlerinde 30 saniye
            if (difficulty === 'hard') {
                gameTimer = 45;
            } else {
                gameTimer = 30;
            }

            gameScore = 0;
            gameMistakes = 0;
            gameIsActive = true;
            gameSequence = [];
            playerInputIndex = 0;
            isComputerPlaying = false;
            sessionTokens = 0;
            turnStartTime = 0;

            // Yeni mobil çıkış butonu başlangıçta gizli
            const mobileExitBtn = document.getElementById('mobile-game-back-btn');
            if (mobileExitBtn) {
                mobileExitBtn.style.display = 'none';
                mobileExitBtn.setAttribute('aria-hidden', 'true');
            }
            if (mobileExitBtnTimeout) {
                clearTimeout(mobileExitBtnTimeout);
            }

            // 10 saniye sonra butonu görünür yap ve ekran okuyucuya çok kısa şekilde bildir
            mobileExitBtnTimeout = setTimeout(() => {
                if (currentActiveMenu === 'game' && gameIsActive && !isGridWalkingPhase) {
                    if (mobileExitBtn) {
                        mobileExitBtn.style.display = 'block';
                        mobileExitBtn.removeAttribute('aria-hidden');
                        // Sadece bildirim, oyun durum yazısını (endMessage vb) değiştirmeyecek
                        // Yazı okumasın gizli bir "bip" tarzı bildirim veya sadece kısa bir aria-live
                        // announceToScreenReader("Çıkış tuşu belirdi.", false);
                    }
                }
            }, 10000);

            updateGameUI();

            hataKorumasiCount = parseInt(localStorage.getItem('hafizaGuvenHataKorumasi')) || 0;
            zamanKorumasiCount = parseInt(localStorage.getItem('hafizaGuvenZamanKorumasi')) || 0;

            const gameStatus = document.getElementById('game-status-text');
            if (gameStatus) {
                gameStatus.textContent = `Oyun 3 saniye içinde başlıyor... ${hataKorumasiCount} Hata Koruması, ${zamanKorumasiCount} Zaman Koruması. İlk notayı dinleyin!`;
                gameStatus.setAttribute('aria-live', 'assertive');
            }
            setTimeout(() => {
                announceToScreenReader(`Oyun 3 saniye içinde başlıyor. ${hataKorumasiCount} Hata Koruması ve ${zamanKorumasiCount} Zaman Korumasına sahipsiniz. İlk notayı dinleyin!`);
            }, 400);

            // Saat tik tak sesini varsayılan hızında başlat (Manuel döngü ile)
            if (clockTickSound.playing()) clockTickSound.stop();
            clockTickSound.rate(1.0);
            // Oyun döngüsü başlayana (player inputa kadar) beklemesi için burada başlatmıyoruz, sıra oyuncuya geçince başlayacak.

            clearInterval(gameInterval);
            // İlk notayı biraz bekleyip çalalım ki kullanıcı hazırlansın
            setTimeout(() => {
                if (!gameIsActive) return;
                addNewNoteAndPlaySequence();

                // Zamanlayıcıyı başlat
                gameInterval = setInterval(() => {
                    if (!gameIsActive) {
                        clearInterval(gameInterval);
                        return;
                    }
                    // Süre sadece şu durumlarda geriye doğru akar:
                    // 1. Bilgisayar notaları çalmıyorsa (Sıra oyuncudaysa)
                    // 2. Oyuncu henüz bir harfe basmamışsa (Düşünme/Hatırlama aşamasındaysa)
                    // Eğer oyuncu harflere girmeye başlamışsa (playerInputIndex > 0) Puan kaybetmemesi için süresi durur.
                    if (!isComputerPlaying && playerInputIndex === 0) {
                        gameTimer--;
                        updateGameUI();

                        // 20 Saniye uyarısı
                        if (gameTimer === 20) {
                            secons2Sound.play();
                            announceToScreenReader("Son 20 saniye.", false);
                        }

                        // 10 Saniye uyarısı (sadece 10 olduğunda 1 kez okur)
                        if (gameTimer === 10) {
                            announceToScreenReader("Son 10 saniye.", false);
                        }

                        // 10 saniye ve altındayken her saniye secons.ogg uyarı sesini çal
                        if (gameTimer <= 10 && gameTimer > 0) {
                            seconsSound.stop(); // Önceki saniyeden kalan sesi kes (üst üste binmeyi önler)
                            seconsSound.play();
                        } else if (gameTimer > 10 && seconsSound.playing()) {
                            seconsSound.stop(); // Süre kazanıp 10 saniyenin üstüne çıkarsa sesi durdur
                        }

                        // Her saniye saatin tik tak sesini %1 hızlandır
                        let currentRate = clockTickSound.rate();
                        clockTickSound.rate(currentRate * 1.01);

                        if (gameTimer <= 0) {
                            if (zamanKorumasiCount > 0) {
                                // Zaman koruması kullan
                                zamanKorumasiCount--;
                                gameTimer = 15; // 15 Saniye ek süre
                                localStorage.setItem('hafizaGuvenZamanKorumasi', zamanKorumasiCount);

                                // Sesi ve bildirimi ayarla
                                seconsSound.stop();
                                announceToScreenReader(`Zaman koruması kullanıldı! Süreniz bitmedi, 15 saniye ek süre kazandınız. Kalan zaman koruması: ${zamanKorumasiCount}`);
                                updateGameUI();
                            } else {
                                endMainGame(true, false); // Süre bitti
                            }
                        }
                    }
                }, 1000);
            }, 3000);
        }

        function addNewNoteAndPlaySequence() {
            if (!gameIsActive) return;
            const noteKeys = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];
            const randomNote = noteKeys[Math.floor(Math.random() * noteKeys.length)];

            // Rastgele yeni bir nota ekle
            gameSequence.push(randomNote);
            playerInputIndex = 0;

            playGameSequence();
        }

        function playGameSequence() {
            if (!gameIsActive) return;
            isComputerPlaying = true; // Dinlemeyi kilitler

            const gameStatus = document.getElementById('game-status-text');
            const replayBtn = document.getElementById('mobile-replay-btn');
            if (gameStatus) {
                gameStatus.style.display = 'block';
                gameStatus.textContent = window.isMobileDevice ? "Lütfen dinleyin." : "Bilgisayar çalıyor... Lütfen dinleyin.";
            }
            if (replayBtn) replayBtn.style.display = 'none';

            let noteIndex = 0;

            // Oyun ilerledikçe (dizi uzadıkça) hızlanması için dinamik zamanlama
            // 1. seviyede 600ms, her yeni seviyede 50ms daha hızlı. En fazla 200ms'ye düşer.
            // Not: Milisaniyelik sessizliği ve bekleme boşluklarını minimuma indirmek için süreler kısaltıldı.
            const speedMs = Math.max(200, 600 - ((gameSequence.length - 1) * 50));

            function playNextSeqNote() {
                if (!gameIsActive) return;
                if (noteIndex < gameSequence.length) {
                    // Bilgisayar çalarken saati durdur ki karışmasın
                    if (clockTickSound.playing()) clockTickSound.pause();

                    const noteToPlay = gameSequence[noteIndex];
                    if (pianoNotes[noteToPlay]) {
                        playPianoNoteSingle(noteToPlay);
                    }
                    noteIndex++;
                    // Dinamik hesaplanan hıza göre Notalar arası bekleme süresi
                    clearTimeout(sequenceTimeoutId); // Var olan timeout temizlenir
                    sequenceTimeoutId = setTimeout(playNextSeqNote, speedMs);
                } else {
                    // Bilgisayarın dizisi bitti, kilit açılır
                    isComputerPlaying = false;

                    // Bilgisayar susunca saat sesini devam ettir
                    if (!clockTickSound.playing()) clockTickSound.play();

                    turnStartTime = Date.now();
                    const gameStatus = document.getElementById('game-status-text');
                    const replayBtn = document.getElementById('mobile-replay-btn');

                    if (gameStatus) {
                        gameStatus.style.display = 'block';
                        gameStatus.textContent = "Sıra sizde!";
                    }
                    if (replayBtn) replayBtn.style.display = 'none';

                    announceToScreenReader("Sıra sizde");

                    // Birkaç saniye bekle, sonra 'Sıra sizde' yazısını gizle, yerine 'Tekrar Dinle' butonu gelsin (Mobilde)
                    clearTimeout(window.replayBtnTimeout);
                    window.replayBtnTimeout = setTimeout(() => {
                        if (gameIsActive && !isComputerPlaying) {
                            if (gameStatus) gameStatus.style.display = 'none';
                            if (replayBtn && window.isMobileDevice) {
                                replayBtn.style.display = 'block';
                            }
                        }
                    }, 2500);
                }
            }

            clearTimeout(sequenceTimeoutId); // Geçmişten kalan oynatmayı sıfırla ki çakışma olmasın
            playNextSeqNote();
        }

        function endMainGame(isTimeOut, isWin, isUserExit = false) {
            gameIsActive = false;
            updateMobileKeysVisibility();
            clearInterval(gameInterval);
            if (mobileExitBtnTimeout) clearTimeout(mobileExitBtnTimeout);

            // localStorage'dan mevcut total jetonları oku
            let totalTokens = 0;
            try {
                totalTokens = parseInt(localStorage.getItem('hafizaGuvenTotalTokens')) || 0;
            } catch (e) { }

            // Hard modunu tamamladıysa 300 jeton ekle, diğer modlarlar her tur eklendiği için direkt sessionTokens kullanılıyor
            if (activeDifficulty === 'hard' && isWin) {
                sessionTokens = 300;
            }

            // Bu el kazanılanı toplam tutara ekle (0'ın altına düşmesin)
            sessionTokens = Math.max(0, sessionTokens);
            totalTokens += sessionTokens;

            // Yeni totali geri kaydet
            try {
                localStorage.setItem('hafizaGuvenTotalTokens', totalTokens);
            } catch (e) { }

            // Oyunu bitirme ekranındayız (bekliyor)
            let endMessage = "";
            let baseMessage = "";

            // Kayıp Notalar modundan (Dağ Haritası) çıkış yapıldığında isimlerin ve yürüme etkileşiminin sıfırlanması
            isGridWalkingPhase = false;
            const gameMenuContainer = document.getElementById('game-menu-container');
            if (gameMenuContainer) gameMenuContainer.setAttribute('aria-label', 'Oyun Alanı');
            const gameMenuTitle = document.getElementById('game-menu-title');
            if (gameMenuTitle) gameMenuTitle.textContent = 'Hafızana Güven';

            let playUnlockSound = false;

            if (isUserExit) {
                for (let k in pianoNotes) pianoNotes[k].stop();
                if (seconsSound.playing()) seconsSound.stop();
                if (clockTickSound.playing()) clockTickSound.stop();
                if (mountainSound.playing()) mountainSound.stop();
                if (house2Sound.playing()) house2Sound.stop();
                if (notePingInterval) { clearInterval(notePingInterval); notePingInterval = null; }

                switchMenu(document.getElementById('game-menu-container'), mainMenu, 'main');

                endMessage = `Oyundan çıkıldı. Bu oyunda toplam ${sessionTokens} jeton kazandınız. Toplam jetonunuz ${totalTokens}. Ana menüye dönüldü.`;
                announceToScreenReader(endMessage);
                return;
            }

            if (isWin) {
                baseMessage = `Tebrikler! Zamanında tüm notaları tamamladınız.`;

                // Zafer sayacını artır (Hangi moddaysa)
                if (gameModes[activeDifficulty]) {
                    gameModes[activeDifficulty].completionCount += 1;
                }

                // Veriyi tarayıcı hafızasına kaydet (kilitleri açmak için)
                try {
                    localStorage.setItem('hafizaGuvenModes', JSON.stringify(gameModes));
                } catch (e) { /* Hata yoksay */ }

                // Modlar için ekstra tebrik bildirimleri
                if (activeDifficulty === 'easy' && gameModes.easy.completionCount === gameModes.medium.requiredToUnlock) {
                    baseMessage += " Tebrikler, ORTA MOD kilitlerini açtınız!";
                    playUnlockSound = true;
                } else if (activeDifficulty === 'medium' && gameModes.medium.completionCount === gameModes.hard.requiredToUnlock) {
                    baseMessage += " İnanılmaz, ZOR MOD kilitlerini açtınız!";
                    playUnlockSound = true;
                } else if (activeDifficulty === 'hard' && gameModes.hard.completionCount === gameModes.survival.requiredToUnlock) {
                    baseMessage += " Efsane! HAYATTA KALMA modu açıldı!";
                    playUnlockSound = true;
                }

                // --- BAŞARILAR (ACHIEVEMENTS) KONTROLÜ ---
                if (activeDifficulty === 'easy' && gameModes.easy.completionCount >= 2 && !userAchievements.hafizam_gucleniyor) {
                    userAchievements.hafizam_gucleniyor = true;
                    try {
                        localStorage.setItem('hafizaGuvenAchievements', JSON.stringify(userAchievements));
                    } catch (e) { }

                    // Oyun sonu anonsunun bitmesini bekleyip, ardından yeni başarı anonsunu yapması için setTimeout kullanıyoruz.
                    setTimeout(() => {
                        if (achievementSound) achievementSound.play();
                        announceToScreenReader("Yeni Bir Başarım Kazandınız! İlk başarınızı elde ettiniz: Hafızam güçleniyor.");
                    }, 4000); // endMessage anonsunun uzunluğuna göre yaklaşık 4 saniye sonra okutturulur.
                }
            } else if (isTimeOut) {
                baseMessage = `Süre bitti!`;
            } else if (gameMistakes >= 3) {
                baseMessage = `3 hakkınız bitti!`;
            } else {
                baseMessage = `Oyundan çıkıldı.`;
            }

            // Ana mesajın sonuna skorları birleştir
            endMessage = `${baseMessage} Bu oyunda toplam ${sessionTokens} jeton kazandınız. Toplam jetonunuz ${totalTokens}. Ana menüye dönmek için entır tuşuna basın.`;

            // Ekrandaki yazıyı da güncelliyoruz
            const gameStatus = document.getElementById('game-status-text');
            if (gameStatus) {
                gameStatus.textContent = endMessage;
            }

            // Oyun bittiyse ve jeton kazanıldıysa bu sesi çal ve ardından anonsu yap
            if (sessionTokens > 0 && (isWin || !isWin)) {
                // NVDA okumaya hazır, ama önce paralar çalsın
                let coinsToPlay = sessionTokens;

                // Çok fazla jeton kazanıldığında sonsuza kadar çalmasını önle
                const maxSoundPlays = Math.min(coinsToPlay, 15);
                let playedCount = 0;
                let currentRate = 1.0;
                let delay = 200;

                function playNextCoin() {
                    if (playedCount < maxSoundPlays) {
                        getCoinsSound.rate(currentRate); // Giderek inceltir
                        getCoinsSound.play();

                        currentRate += 0.1; // Bir sonraki çalmada sesi biraz daha incelt/hızlandır
                        playedCount++;
                        delay = Math.max(40, delay - 20); // Her defasında daha hızlı (sıkışsın)

                        setTimeout(playNextCoin, delay);
                    } else {
                        // Jeton sesleri tamamen bittikten hemen sonra anonsu yap
                        setTimeout(() => {
                            announceToScreenReader(endMessage);
                        }, 400);
                    }
                }

                // Zinciri başlat
                playNextCoin();
            } else {
                // Jeton kazanılmadıysa direkt anons yap
                announceToScreenReader(endMessage);
            }

            // Ses efektlerini çal
            for (let k in pianoNotes) pianoNotes[k].stop();
            if (seconsSound.playing()) seconsSound.stop();
            if (clockTickSound.playing()) clockTickSound.stop();
            if (mountainSound.playing()) mountainSound.stop();
            if (house2Sound.playing()) house2Sound.stop();
            if (notePingInterval) { clearInterval(notePingInterval); notePingInterval = null; }

            if (playUnlockSound) {
                modeUnlockSound.play();
            } else {
                gameOverSound.play();
            }
        }

        function updateGameUI() {
            const scoreDisplay = document.getElementById('game-score-display');
            const timerDisplay = document.getElementById('game-timer-display');
            const livesDisplay = document.getElementById('game-lives-display');
            const hudContainer = document.getElementById('game-hud-container');

            // Modun maksimum uzunluğunu bul (Arayüzde göstermek için, hayatta kalma vb. hariç)
            let maxLen = 10;
            if (activeDifficulty === 'easy') maxLen = 2;
            if (activeDifficulty === 'medium') maxLen = 5;
            if (activeDifficulty === 'hard') maxLen = 10;

            const scoreText = `Tur: ${gameScore} / ${maxLen} | Jeton: ${sessionTokens}`;
            if (scoreDisplay) scoreDisplay.textContent = scoreText;

            const displayTime = gameTimer < 0 ? 0 : gameTimer;
            const timeText = `Süre: ${displayTime}`;
            if (timerDisplay) timerDisplay.textContent = timeText;

            const livesLeft = 3 - gameMistakes;
            const livesText = `Hak: ${livesLeft < 0 ? 0 : livesLeft}`;
            if (livesDisplay) livesDisplay.textContent = livesText;

            if (hudContainer) hudContainer.setAttribute('aria-label', `${scoreText}, ${timeText}, ${livesText}`);
        }

        function handleGameInput(key) {
            if (!gameIsActive || isComputerPlaying) return; // Bilgisayar dizesini çalarken klavye girdisini yok say

            const validKeys = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];
            if (!validKeys.includes(key)) return;

            const expectedNote = gameSequence[playerInputIndex];

            if (key === expectedNote) {
                // DOĞRU BİLME DURUMU
                playPianoNoteSingle(key); // Basılan tuşun sesini de çaldır ki hissi versin (öncekini susturur)
                playerInputIndex++; // Sıradaki notaya geç

                if (playerInputIndex >= gameSequence.length) {
                    // Turdaki tüm diziyi doğru sırayla bildi!
                    correctSound.play();

                    // Jeton hesaplama mantığı (Hard modda tamamen oyun sonunda 100 jeton verilir)
                    if (activeDifficulty !== 'hard') {
                        let turnTime = (Date.now() - turnStartTime) / 1000;
                        let baseTokens = 0;

                        if (activeDifficulty === 'easy') {
                            baseTokens = Math.floor(Math.random() * 10) + 1; // 1-10 arası
                        } else if (activeDifficulty === 'medium') {
                            baseTokens = Math.floor(Math.random() * 11) + 10; // 10-20 arası
                        } else {
                            baseTokens = Math.floor(Math.random() * 11) + 10; // Hayatta kalma vb.
                        }

                        // Düşünme süresi cezası: Nota başına ortalama 0.5s veriyoruz, aşarsa ceza başlar
                        let thinkingTime = Math.max(0, turnTime - (gameSequence.length * 0.5));
                        let penalty = Math.floor(thinkingTime * 2);

                        // Hata Başına Ceza: Her yanlış nota 5 jeton kaybettirir
                        penalty += (gameMistakes * 5);

                        let earnedTokens = Math.max(1, baseTokens - penalty);

                        if (activeDifficulty === 'survival') earnedTokens = Math.floor(earnedTokens * 2.5);

                        sessionTokens += earnedTokens;
                    }

                    gameTimer += 2; // Tüm seriyi kusursuz yaparsa +2 sn ver
                    gameScore += 1; // Tur bittiğine göre skor(tur) sayısını 1 artırıyoruz
                    gameMistakes = 0; // Hata sayacını sıfırla
                    updateGameUI();

                    const gameStatus = document.getElementById('game-status-text');

                    // Kazanma Kriterini Belirle
                    let winTarget = 10; // Default (Survival vb.)
                    if (activeDifficulty === 'easy') winTarget = 2;
                    if (activeDifficulty === 'medium') winTarget = 5;
                    if (activeDifficulty === 'hard') winTarget = 10;

                    if (gameScore >= winTarget) {
                        // HEDEFE ULAŞTI VE OYUNU KAZANDI
                        if (gameStatus) gameStatus.textContent = "Harika!";
                        endMainGame(false, true); // (timeout=false, isWin=true)
                    } else {
                        // YENİ TURA GEÇ - MOTİVASYON MESAJI SEÇİMİ
                        let motivMsg = "";
                        if (gameScore >= 1 && gameScore <= 4) {
                            motivMsg = msg1to4[Math.floor(Math.random() * msg1to4.length)];
                        } else if (gameScore === 5) {
                            motivMsg = msg5[Math.floor(Math.random() * msg5.length)];
                        } else if (gameScore >= 6 && gameScore <= 9) {
                            motivMsg = msg6to9[Math.floor(Math.random() * msg6to9.length)];
                        } else {
                            motivMsg = msg1to4[Math.floor(Math.random() * msg1to4.length)]; // Fallback
                        }

                        if (gameStatus) gameStatus.textContent = `${motivMsg} (+2 saniye)`;
                        announceToScreenReader(motivMsg);

                        // Mesajın karakter uzunluğuna göre okunma süresini dinamik hesapla
                        const readTimeMs = Math.max(1500, (motivMsg.length * 65) + 800);

                        // Seri bitti. Kısa bir süre sonra yeni nota vererek seriyi uzat
                        setTimeout(() => {
                            addNewNoteAndPlaySequence();
                        }, readTimeMs);
                    }
                } else {
                    // Dizi bitmedi, bir sonraki doğru harfe basılmasını bekliyor
                    // Sadece sessizce kullanıcının doğru gidişini izliyoruz.
                }

            } else {
                // YANLIŞ BİLME DURUMU
                for (let k in pianoNotes) pianoNotes[k].stop(); // Yanlış sinyali karışmasın diye piyanoyu sustur

                if (hataKorumasiCount > 0) {
                    // HATA KORUMASI DEVREDE
                    hataKorumasiCount--;
                    localStorage.setItem('hafizaGuvenHataKorumasi', hataKorumasiCount);

                    wrongSound.play(); // Uçtan uca hissetmesi için yanlışı çal

                    const gameStatus = document.getElementById('game-status-text');
                    if (gameStatus) gameStatus.textContent = "Hata koruması kullanıldı! Ceza Yok. Dizi tekrar çalınıyor.";

                    announceToScreenReader("Hata koruması kullanıldı! Hak veya süre kaybı yok. Tekrar deniyoruz.");
                    playerInputIndex = 0;

                    setTimeout(() => {
                        if (gameIsActive) {
                            playGameSequence();
                        }
                    }, 1200);

                } else {
                    // NORMAL CEZA
                    wrongSound.play();
                    gameTimer -= 5;
                    gameMistakes += 1;

                    updateGameUI();

                    const gameStatus = document.getElementById('game-status-text');
                    if (gameStatus) gameStatus.textContent = "Yanlış! -5 saniye. Dizi tekrar çalınıyor.";

                    if (gameMistakes >= 3 || gameTimer <= 0) {
                        setTimeout(() => {
                            endMainGame(gameTimer <= 0, false); // Süre bitimi mi yoksa 3 hata mı ona göre bitir
                        }, 500);
                    } else {
                        // Yanlış bilirse (ama henüz hakları var), diziyi başa sarmalı ve tekrar çaldırmalı.
                        playerInputIndex = 0; // Tur içinde baştan başla, ancak var olan gameSequence silinmez

                        setTimeout(() => {
                            if (gameIsActive) {
                                announceToScreenReader("Tekrar deniyoruz.");
                                playGameSequence(); // Diziyi baştan oynatır
                            }
                        }, 1200);
                    }
                }
            }
        }

        document.addEventListener('keydown', function (event) {
            // Tab (Sekme) tuşuyla menüler arası dolaşmayı/odaklanmayı engelle - Geri Bildirim ve Sunucu Mesajı menüsü hariç
            if (event.key === 'Tab') {
                if (currentActiveMenu === 'feedback' || currentActiveMenu === 'server-message') {
                    // Forms/Dialog modu için Focus geçişine izin ver
                } else {
                    event.preventDefault();
                    return;
                }
            }

            // Geri Bildirim menüsü formlarındayken (TextArea veya Select içindeyken) sağ/sol/aşağı/yukarı vb. tuşlara izin ver (oyun klavye komutlarını ezmesin)
            if (currentActiveMenu === 'feedback') {
                if (document.activeElement && (document.activeElement.tagName === 'TEXTAREA' || document.activeElement.tagName === 'SELECT' || document.activeElement.tagName === 'INPUT')) {
                    // Space veya ok tuşlarının normal form fonksiyonlarında kullanılmasına izin ver
                    if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' ', 'Enter', 'Escape'].includes(event.key)) {
                        if (event.key === 'Escape') document.activeElement.blur(); // Escape ile odaktan çıkabilme şansı
                        return; // Erken dönüş yaparak form elementinin nativ event'ine bırakıyoruz
                    }
                }
            }

            // Alıştırma modundayken A,B,C,D,E,F,G harflerine basıldığında piyano çal
            if (isStarted && currentActiveMenu === 'practice') {
                const key = event.key.toLowerCase();
                const validKeys = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];
                if (validKeys.includes(key) && !event.repeat) {
                    playPianoNoteSingle(key);

                    if (inPracticeTutorial) {
                        if (practiceTargetIndex < practiceTargets.length) {
                            if (key === practiceTargets[practiceTargetIndex].key) {
                                practicePressCount++;
                                if (practicePressCount >= 3) {
                                    practiceTargetIndex++;
                                    practicePressCount = 0;
                                    updatePracticeUI('next');
                                } else {
                                    updatePracticeUI('correct');
                                }
                            } else {
                                updatePracticeUI('wrong');
                            }
                        }
                    }
                }
            }

            // Ana Oyun modundayken
            if (isStarted && currentActiveMenu === 'game') {
                const key = event.key.toLowerCase();

                // Kayıp notalar (Yürüme) modundaysak, klasik oyun tuşları (S, T, Space) çalışmasın
                if (!isGridWalkingPhase) {
                    if (key === 's') {
                        event.preventDefault();
                        // Skoru okut
                        announceToScreenReader(`Geçilen tur: ${gameScore}. Kazanılan jeton: ${sessionTokens}.`);
                    } else if (key === 't') {
                        event.preventDefault();
                        // Kalan zamanı okut
                        const displayTime = gameTimer < 0 ? 0 : gameTimer;
                        announceToScreenReader(`Kalan süre: ${displayTime} saniye.`);
                    } else if (key === ' ') {
                        event.preventDefault();
                        // Boşluk tuşu - Diziyi tekrar oynat
                        if (!isComputerPlaying && gameSequence.length > 0) {
                            announceToScreenReader("Dizi tekrar ediliyor. Saniye eksi bir.");
                            gameTimer = Math.max(0, gameTimer - 1);
                            updateGameUI();
                            playerInputIndex = 0;
                            playGameSequence();
                        }
                    } else if (!event.repeat) {
                        // A, B, C vb. nota tuşlarına basıldığında da tarayıcı/okuyucu sekmesini engelle
                        const validKeys = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];
                        if (validKeys.includes(key)) {
                            event.preventDefault();
                            handleGameInput(key);
                        }
                    }
                }
            }

            // Müzik sesini artırma ve azaltma (Page Up / Page Down) basılı tutmaya izin ver
            if (event.key === 'PageUp') {
                event.preventDefault(); // Sayfanın kaymasını engelle
                let currentVolume = bgMusic.volume();
                bgMusic.volume(Math.min(1.0, currentVolume + 0.01));
                return;
            }
            if (event.key === 'PageDown') {
                event.preventDefault(); // Sayfanın kaymasını engelle
                let currentVolume = bgMusic.volume();
                bgMusic.volume(Math.max(0.0, currentVolume - 0.01));
                return;
            }

            if (event.key.toLowerCase() === 'm' && currentActiveMenu === 'main') {
                const isMuted = bgMusic.mute();
                if (!isMuted) {
                    bgMusic.mute(true);
                    announceToScreenReader('Müzik sessize alındı.');
                } else {
                    bgMusic.mute(false);
                    announceToScreenReader('Müzik sesi açıldı.');
                }
                return;
            }

            // Tuşa basılı tutulduğunda oluşan spam'ı (tekrarlamayı) engelle
            // (PageUp ve PageDown hariç, onlara yukarıda izin verdik)
            if (event.repeat) {
                // Kayıp notalar modundayken ok tuşlarına basılı tutarak akıcı yürümeye izin ver
                if (isGridWalkingPhase && (event.key === 'ArrowLeft' || event.key === 'ArrowRight' || event.key === 'ArrowUp' || event.key === 'ArrowDown')) {
                    // İzin ver, rate limiter içeride halledecek
                } else {
                    if (event.key === 'Enter' || event.key === 'ArrowLeft' || event.key === 'ArrowRight' || event.key === ' ') {
                        event.preventDefault();
                    }
                    return;
                }
            }

            // Enter'a basıldığında duruma göre işlem yap
            if (event.key === 'Enter') {
                const qtyContainer = document.getElementById('store-buy-quantity-container');
                const isBuyingActive = (currentActiveMenu === 'store' && qtyContainer && qtyContainer.style.display === 'block');
                if (isBuyingActive) {
                    if (typeof executePurchase === 'function') {
                        executePurchase();
                    }
                    return;
                }

                if (currentActiveMenu === 'achievements') {
                    clickSound.play();
                    switchMenu(achievementsMenu, mainMenu, 'main');
                    return;
                }

                // Oyun bitiş ekranındayken (Oyun aktif değil ama oyun menüsündeyiz) Enter'a basınca ana menüye dön
                if (!gameIsActive && currentActiveMenu === 'game') {
                    clickSound.play();
                    switchMenu(document.getElementById('game-menu-container'), mainMenu, 'main');
                    return;
                }

                // Hikaye Modu diyalog aşaması mı?
                if (isStarted && currentActiveMenu === 'story' && inStoryMode) {
                    if (isGridWalkingPhase) {
                        // Kullanıcı Enter'a bassa bile otomatik sahne bitmediği için engelleyelim.
                        return;
                    }

                    dado3Sound.play(); // Diyalog geçiş efekti
                    currentStoryIndex++;
                    if (currentStoryIndex < 17) {
                        if (currentStoryIndex === 14) {
                            // 15. cümle: "Pan dışarı çıkar, ... yürümeye başladı"
                            house2Sound.fade(0.8, 0, 1000);
                            storyBGM.fade(0.5, 0, 1000);
                            setTimeout(() => {
                                house2Sound.stop();
                                storyBGM.stop();
                            }, 1000);

                            doorCloseSound.play();
                            doorCloseSound.once('end', () => {
                                currentAutoWalkStep = 0;
                                playAutomatedWalkingScene();
                            });
                        } else if (currentStoryIndex === 15) {
                            // 16. cümle: "Bir anda notaların konuştuğunu ve müzik yaptıklarını duyar"
                            isGridWalkingPhase = true; // Enter basımını 10 saniye kilitle

                            // 10 saniye boyunca rastgele ve sesi giderek artan bir müzik çal
                            let melodyCount = 0;
                            let melodyVolume = 0.1;
                            const melodyInterval = setInterval(() => {
                                const keys = ['c', 'd', 'e', 'f', 'g', 'a', 'b'];
                                const randomKey = keys[Math.floor(Math.random() * keys.length)];

                                if (pianoNotes[randomKey]) {
                                    pianoNotes[randomKey].volume(melodyVolume);
                                    let sndId = pianoNotes[randomKey].play();
                                    pianoNotes[randomKey].seek(0.045, sndId);
                                }

                                melodyVolume = Math.min(1.0, melodyVolume + 0.03); // Sesi yavaşça artır
                                melodyCount++;

                                if (melodyCount >= 30) { // Yaklaşık 10 saniye (30 * 333ms) bittiğinde
                                    clearInterval(melodyInterval);
                                }
                            }, 333);

                            // Müzik bitince (10 sn) veya okuma bitince ortalama sürede enter serbest bırakılsın
                            setTimeout(() => {
                                isGridWalkingPhase = false;
                            }, 10000); // 10 saniyede aç
                        }

                        playCurrentStoryDialog();
                        triggerStoryAnimations(currentStoryIndex);
                    } else if (currentStoryIndex === 17 && !isGridWalkingPhase) {
                        // "Hikaye sona erdi, oyuna başlamak için entır tuşuna basın." komutunu kabul et
                        inStoryMode = false;
                        isGridWalkingPhase = true; // Oyun içi yürüme tekrar aktif
                        updateMobileKeysVisibility();

                        // Play the 7 muffled scattered sounds
                        storyNoteSounds.forEach((snd, idx) => {
                            setTimeout(() => snd.play(), idx * 200 + Math.random() * 100);
                        });

                        setTimeout(() => {
                            const gameMenuContainer = document.getElementById('game-menu-container');
                            gameMenuContainer.setAttribute('aria-label', 'Dağ Haritası');

                            const gameMenuTitle = document.getElementById('game-menu-title');
                            if (gameMenuTitle) gameMenuTitle.textContent = 'Dağ Haritası';

                            switchMenu(document.getElementById('story-menu-container'), gameMenuContainer, 'game');
                            const scoreDisplay = document.getElementById('game-score-display');
                            const timerDisplay = document.getElementById('game-timer-display');
                            const livesDisplay = document.getElementById('game-lives-display');
                            if (scoreDisplay) scoreDisplay.style.display = 'none';
                            if (timerDisplay) timerDisplay.style.display = 'none';
                            if (livesDisplay) livesDisplay.style.display = 'none';

                            const gameStatus = document.getElementById('game-status-text');
                            if (gameStatus) gameStatus.textContent = "Soğuk bir rüzgar esiyor... Yerdeki karlar ayak seslerinizle eziliyor.";

                            // NVDA odağı çalınmasın diye switchMenu animasyonunu (350ms) bekleyip öyle başlatıyoruz
                            setTimeout(() => {
                                initializeMissingNotesMap();
                            }, 400);
                        }, 800);
                    }
                    return;
                }

                // Alıştırma modu diyalog aşaması mı?
                if (isStarted && currentActiveMenu === 'practice' && isDialogPhase) {
                    dado3Sound.play(); // Diyalog geçiş efekti
                    currentDialogIndex++;
                    if (currentDialogIndex < practiceDialogues.length) {
                        playCurrentDialog();
                    } else {
                        // Diyalog bitti, pratik başlasın
                        isDialogPhase = false;
                        updateMobileKeysVisibility();
                        inPracticeTutorial = true;
                        const practiceNav = document.getElementById('practice-nav');
                        if (practiceNav) practiceNav.style.display = 'flex'; // Geri dön butonu görünür olur
                        updatePracticeUI('init');
                    }
                    return;
                }

                // Alıştırma modu pratik bitiş durumu mu?
                const practiceMenuDOM = document.getElementById('practice-menu-container');
                if (practiceMenuDOM && practiceMenuDOM.dataset.isPracticeOver === "true") {
                    practiceMenuDOM.dataset.isPracticeOver = "false"; // Durumu sıfırla

                    if (!bgMusic.playing()) {
                        bgMusic.play();
                    }

                    switchMenu(practiceMenu, mainMenu, 'main');
                    inPracticeTutorial = false;
                    return;
                }



                if (!introPlayed) {
                    playIntro();
                    return;
                }
                if (introReadyToStartGame && !isStarted) {
                    startGame();
                    return;
                }
            }

            // Menü açıldıktan ve diyalog yönetimi için ok tuşlarını dinle
            if (isStarted) {
                if (currentActiveMenu === 'achievements') {
                    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
                        event.preventDefault();
                        if (achievementsAnnouncements.length > 0) {
                            currentAchIndex = (currentAchIndex + 1) % achievementsAnnouncements.length;
                            announceToScreenReader(achievementsAnnouncements[currentAchIndex]);
                            hoverSound.play();
                        }
                    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
                        event.preventDefault();
                        if (achievementsAnnouncements.length > 0) {
                            currentAchIndex = (currentAchIndex - 1 + achievementsAnnouncements.length) % achievementsAnnouncements.length;
                            announceToScreenReader(achievementsAnnouncements[currentAchIndex]);
                            hoverSound.play();
                        }
                    }
                    return;
                }

                // Kayıp Notalar yürüme hız sınırlayıcısı
                if (typeof window.lastStepTime === 'undefined') {
                    window.lastStepTime = 0;
                }

                if (currentActiveMenu === 'practice' || (currentActiveMenu === 'story' && inStoryMode) || (currentActiveMenu === 'game' && isGridWalkingPhase)) {
                    // Yürüme modundayken ArrowLeft, ArrowRight, ArrowUp, ArrowDown, C ve F tuşlarını dinle
                    if (isGridWalkingPhase && gameModes['missing_notes'] && gameModes['missing_notes'].isUnlocked) {
                        const localNoteNamesTr = { 'c': 'Do', 'd': 'Re', 'e': 'Mi', 'f': 'Fa', 'g': 'Sol', 'a': 'La', 'b': 'Si' };
                        if (event.key === 'ArrowLeft' || event.key === 'ArrowRight' || event.key === 'ArrowDown') {
                            event.preventDefault(); // Butonlara odaklanmayı/kaymayı kesin olarak engelle
                            event.stopImmediatePropagation();

                            // if (document.activeElement) {
                            //     document.activeElement.blur(); // Odaktaki düğmeyi bırak   
                            // }

                            // Hareket hız sınırlayıcı (150ms) - Sadece yön tuşları için
                            if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
                                let now = Date.now();
                                if (now - window.lastStepTime < 150) {
                                    return; // 150ms den erken basıldıysa hareket etme (akıcı yürüme sınırı)
                                }
                                window.lastStepTime = now;
                            }

                            if (event.key === 'ArrowLeft') {
                                if (playerX > 0) {
                                    playerX--;
                                    snowStepSounds[Math.floor(Math.random() * snowStepSounds.length)].play();
                                    // Piyanoya varıldığında uyar
                                    if (playerX === pianoX) {
                                        announceToScreenReader("Piyanonun yanındasın.");
                                    } else if (notesOnMap[playerX]) {
                                        let noteKey = notesOnMap[playerX];
                                        if (pianoNotes[noteKey]) {
                                            pianoNotes[noteKey].volume(0.4);
                                            pianoNotes[noteKey].play();
                                        }
                                        announceToScreenReader(`Ayağının altında ${localNoteNamesTr[noteKey]} notası var. Almak için F tuşuna bas.`);
                                    }
                                } else {
                                    announceToScreenReader("Daha fazla sola gidemezsin. Piyanonun yanındasın.");
                                }
                            } else if (event.key === 'ArrowRight') {
                                if (playerX < mapLength) {
                                    playerX++;
                                    snowStepSounds[Math.floor(Math.random() * snowStepSounds.length)].play();
                                    // Nota varsa uyar
                                    if (notesOnMap[playerX]) {
                                        let noteKey = notesOnMap[playerX];
                                        if (pianoNotes[noteKey]) {
                                            pianoNotes[noteKey].volume(0.4);
                                            pianoNotes[noteKey].play();
                                        }
                                        announceToScreenReader(`Ayağının altında ${localNoteNamesTr[noteKey]} notası var. Almak için F tuşuna bas.`);
                                    }
                                } else {
                                    announceToScreenReader("Dağın kenarındasın. Daha fazla sağa gidemezsin.");
                                }
                            } else {
                                // Sadece Yukarı/Aşağı okuna basıldığında konum söylesin
                                let readText = `Konum: ${playerX}.`;
                                if (playerX === pianoX) readText += " Piyanonun yanındasın.";
                                else if (notesOnMap[playerX]) {
                                    let noteKey = notesOnMap[playerX];
                                    if (pianoNotes[noteKey]) {
                                        pianoNotes[noteKey].volume(0.4);
                                        pianoNotes[noteKey].play();
                                    }
                                    readText += ` Ayağının altında ${localNoteNamesTr[noteKey]} notası var.`;
                                }
                                readText += ` ${carriedNotes.length} nota taşıyorsun. Toplam ${notesInPiano.length} bölü ${MAX_NOTES}.`;
                                announceToScreenReader(readText);
                            }
                            return;
                        }

                        // 'C' tuşu koordinat bildirme
                        if (event.key.toLowerCase() === 'c') {
                            event.preventDefault();
                            event.stopImmediatePropagation();
                            let readText = `Şu an ki X Konumun: ${playerX}.`;
                            if (playerX === pianoX) readText += " Piyanonun hemen eşiğindesin.";
                            else if (notesOnMap[playerX]) {
                                let noteKey = notesOnMap[playerX];
                                if (pianoNotes[noteKey]) {
                                    pianoNotes[noteKey].volume(0.4);
                                    pianoNotes[noteKey].play();
                                }
                                readText += ` Ayaklarının dibinde alınabilecek ${localNoteNamesTr[noteKey]} notası var.`;
                            }
                            readText += ` Taşıdığın nota sayısı: ${carriedNotes.length}. Piyanodaki nota sayısı ${notesInPiano.length} bölü ${MAX_NOTES}.`;
                            announceToScreenReader(readText);
                            return;
                        }
                    }

                    // Menü diyalog tekrarlama (Yürüme modunda değilse)
                    if (event.key === 'ArrowUp' || event.key === 'ArrowDown' || event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
                        if (!isGridWalkingPhase) {
                            if (currentActiveMenu === 'story' && inStoryMode) {
                                event.preventDefault();
                                playCurrentStoryDialog();
                            } else if (currentActiveMenu === 'practice' && isDialogPhase) {
                                event.preventDefault();
                                playCurrentDialog();
                            } else if (currentActiveMenu === 'practice' && inPracticeTutorial) {
                                event.preventDefault();
                                const statusElem = document.getElementById('practice-status-text');
                                if (statusElem) announceToScreenReader(statusElem.textContent);
                            }
                        }
                        return;
                    }

                    // Interaction Key 'F'
                    if (event.key.toLowerCase() === 'f' && isGridWalkingPhase) {
                        event.preventDefault(); // NVDA Form Alanı Zıplamasını ve Odak Kaybını Engelle
                        event.stopImmediatePropagation(); // Diğer üst elementlere sekmesini engelle

                        // if (document.activeElement) {
                        //     document.activeElement.blur(); // Odaktaki gereksiz UI elementlerini bırak
                        // }

                        // carriedNotes global olarak ilk kullanıldığında tanımlı olmayabilir
                        if (typeof window.carriedNotes === 'undefined') {
                            window.carriedNotes = [];
                        }

                        if (playerX === pianoX) {
                            // Drop notes to piano
                            if (window.carriedNotes.length > 0) {
                                // Sadece tek nota taşıdığımız kabul ediliyor
                                let droppedNote = window.carriedNotes[0];
                                const requiredSequence = ['c', 'd', 'e', 'f', 'g', 'a', 'b'];
                                const noteNamesTr = { 'c': 'Do', 'd': 'Re', 'e': 'Mi', 'f': 'Fa', 'g': 'Sol', 'a': 'La', 'b': 'Si' };

                                let expectedNote = requiredSequence[notesInPiano.length];

                                if (droppedNote === expectedNote) {
                                    notesInPiano.push(droppedNote);
                                    window.carriedNotes = []; // empty inventory
                                    correctSound.play();

                                    if (notesInPiano.length >= MAX_NOTES) {
                                        // Oyun Bitti
                                        announceToScreenReader(`Tüm notaları piyanoya ekledin! Kayıp Notalar modunu başarıyla tamamladın.`);
                                        setTimeout(() => {
                                            // Kazanma Ekranına Geç (500 Puan Ekleyerek Bitir)
                                            sessionTokens += 500;
                                            endMainGame(false, true); // End main game calls win logic and UI update

                                            // UI Cleanups
                                            const scoreDisplay = document.getElementById('game-score-display');
                                            const timerDisplay = document.getElementById('game-timer-display');
                                            const livesDisplay = document.getElementById('game-lives-display');
                                            if (scoreDisplay) scoreDisplay.style.display = 'block';
                                            if (timerDisplay) timerDisplay.style.display = 'block';
                                            if (livesDisplay) livesDisplay.style.display = 'block';
                                        }, 1500);
                                    } else {
                                        announceToScreenReader(`${noteNamesTr[droppedNote]} notasını piyanoya başarıyla yerleştirdin. Toplam yerleştirilen nota sayısı: ${notesInPiano.length} bölü ${MAX_NOTES}. Sıradaki beklenen nota: ${noteNamesTr[requiredSequence[notesInPiano.length]]}.`);
                                    }
                                } else {
                                    // Yanlış sıra, notayı yere geri bırak (elinden çıkart)
                                    wrongSound.play();
                                    window.carriedNotes = []; // empty inventory
                                    notesOnMap[playerX] = droppedNote; // notayı geri yere koy
                                    announceToScreenReader(`Getirdiğin nota ${noteNamesTr[droppedNote]}, ancak piyanoya yerleştirilmesi gereken sıradaki nota ${noteNamesTr[expectedNote]} olmalı! Nota elinden düştü ve X 0 konumunda yerde kaldı.`);
                                }
                            } else {
                                // Üzerinde nota yok, o halde F tuşuyla genel durumu oku
                                const requiredSequence = ['c', 'd', 'e', 'f', 'g', 'a', 'b'];
                                const noteNamesTr = { 'c': 'Do', 'd': 'Re', 'e': 'Mi', 'f': 'Fa', 'g': 'Sol', 'a': 'La', 'b': 'Si' };

                                if (notesInPiano.length === 0) {
                                    announceToScreenReader(`Piyanoda henüz hiç nota yok. İlk olarak ${noteNamesTr[requiredSequence[0]]} notasını bulmalısın.`);
                                } else {
                                    let currNotesStr = notesInPiano.map(n => noteNamesTr[n]).join(', ');
                                    let expectedNote = requiredSequence[notesInPiano.length];
                                    announceToScreenReader(`Şu ana kadar piyanoya yerleştirdiğin notalar: ${currNotesStr}. Sıradaki bulman gereken nota: ${noteNamesTr[expectedNote]}.`);
                                }
                            }
                        } else {
                            // Pick up note
                            if (notesOnMap[playerX]) {
                                if (window.carriedNotes.length === 0) {
                                    let taken = notesOnMap[playerX];
                                    window.carriedNotes.push(taken);
                                    delete notesOnMap[playerX];
                                    let tempDogru = new Howl({ src: ['sounds/dogru.ogg'], volume: 1.0 }); // Özel oynatma
                                    tempDogru.play();

                                    // Nota teşekkür mesajı ekleyelim (yardim.js'ten missingNotesHappyMessages)
                                    let happyMsg = "";
                                    if (typeof missingNotesHappyMessages !== 'undefined' && missingNotesHappyMessages.length > 0) {
                                        happyMsg = " " + missingNotesHappyMessages[Math.floor(Math.random() * missingNotesHappyMessages.length)];
                                    }

                                    const localNoteNamesTr = { 'c': 'Do', 'd': 'Re', 'e': 'Mi', 'f': 'Fa', 'g': 'Sol', 'a': 'La', 'b': 'Si' };
                                    if (pianoNotes[taken]) {
                                        pianoNotes[taken].volume(0.8);
                                        pianoNotes[taken].play();
                                    }
                                    announceToScreenReader(`${localNoteNamesTr[taken]} notasını buldun ve aldın.${happyMsg} Üzerinde sadece bir nota taşıyabilirsin. Hemen X 0 konumundaki piyanoya geri dönüp F tuşuyla notayı piyanoya yerleştir.`);
                                } else {
                                    const localNoteNamesTr = { 'c': 'Do', 'd': 'Re', 'e': 'Mi', 'f': 'Fa', 'g': 'Sol', 'a': 'La', 'b': 'Si' };
                                    let heldNote = window.carriedNotes[0];
                                    wrongSound.play();
                                    announceToScreenReader(`Zaten elinde ${localNoteNamesTr[heldNote]} notası var! Önce elindeki notayı X 0 konumundaki piyanoya yerleştirmelisin.`);
                                }
                            } else {
                                if (window.carriedNotes.length > 0) {
                                    const localNoteNamesTr = { 'c': 'Do', 'd': 'Re', 'e': 'Mi', 'f': 'Fa', 'g': 'Sol', 'a': 'La', 'b': 'Si' };
                                    let heldNote = window.carriedNotes[0];
                                    announceToScreenReader(`Şuan ${localNoteNamesTr[heldNote]} tuşunu elinizde tutuyorsunuz.`);
                                } else {
                                    announceToScreenReader("Bu konumda alınacak hiç nota yok.");
                                }
                            }
                        }
                    }
                }

                const qtyContainer = document.getElementById('store-buy-quantity-container');
                const isBuyingActive = (currentActiveMenu === 'store' && qtyContainer && qtyContainer.style.display === 'block');

                if (isBuyingActive) {
                    if (event.key === 'Escape' || event.key === 'Backspace') {
                        event.preventDefault();
                        qtyContainer.style.display = 'none';
                        const storeBtnList = document.getElementById('store-button-list');
                        if (storeBtnList) storeBtnList.style.display = 'block';

                        // Odaklamayı satın almaktan vazgeçtiği butona geri getir
                        currentFocusIndex = currentBuyType === 'shield' ? 0 : 1;
                        const activeBtns = getActiveButtons();
                        if (activeBtns[currentFocusIndex]) activeBtns[currentFocusIndex].focus();

                        announceToScreenReader("Satın alma iptal edildi.");
                        return;
                    }

                    if (event.key === 'ArrowRight' || event.key === 'ArrowUp') {
                        event.preventDefault();
                        if (currentBuyQuantity < 99) {
                            currentBuyQuantity++;
                            hoverSound.play();
                            const qtyDisplay = document.getElementById('store-buy-quantity-display');
                            if (qtyDisplay) {
                                qtyDisplay.textContent = currentBuyQuantity;
                                qtyDisplay.setAttribute('aria-valuenow', currentBuyQuantity);
                                qtyDisplay.setAttribute('aria-label', `Miktar: ${currentBuyQuantity}`);
                            }
                            announceToScreenReader(`${currentBuyQuantity}`);
                        }
                    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') {
                        event.preventDefault();
                        if (currentBuyQuantity > 1) {
                            currentBuyQuantity--;
                            hoverSound.play();
                            const qtyDisplay = document.getElementById('store-buy-quantity-display');
                            if (qtyDisplay) {
                                qtyDisplay.textContent = currentBuyQuantity;
                                qtyDisplay.setAttribute('aria-valuenow', currentBuyQuantity);
                                qtyDisplay.setAttribute('aria-label', `Miktar: ${currentBuyQuantity}`);
                            }
                            announceToScreenReader(`${currentBuyQuantity}`);
                        }
                    }
                    return;
                }

                const activeButtons = getActiveButtons();
                if (activeButtons.length > 0 && !isBuyingActive) {
                    // Grid oyunundayken (Kayıp Notalarda yürüyüş) normal menü gezinmesini ve odaklanmasını engelle!
                    if (currentActiveMenu === 'game' && isGridWalkingPhase) {
                        // if (document.activeElement) document.activeElement.blur(); // Odaktaki düğmeyi bırak
                        return; // Yön tuşlarının butonlara focus atmasını bu modda engelle
                    }

                    if (event.key === 'ArrowRight' || (event.key === 'ArrowDown' && currentActiveMenu !== 'main')) {
                        // Mağazada düğmeler arası gezinirken sağ/sol okları devre dışı bırak
                        if (currentActiveMenu === 'store' && event.key === 'ArrowRight') {
                            return;
                        }
                        event.preventDefault(); // Sayfanın kaymasını engelle
                        currentFocusIndex = (currentFocusIndex + 1) % activeButtons.length;
                        activeButtons[currentFocusIndex].focus();
                    }
                    else if (event.key === 'ArrowLeft' || (event.key === 'ArrowUp' && currentActiveMenu !== 'main')) {
                        // Mağazada düğmeler arası gezinirken sağ/sol okları devre dışı bırak
                        if (currentActiveMenu === 'store' && event.key === 'ArrowLeft') {
                            return;
                        }
                        event.preventDefault();
                        currentFocusIndex = (currentFocusIndex - 1 + activeButtons.length) % activeButtons.length;
                        activeButtons[currentFocusIndex].focus();
                    }
                }
            }
        });

        // Çıkış butonu işlevi eklendi
        const exitBtn = document.getElementById('exit-btn');
        if (exitBtn) {
            exitBtn.addEventListener('click', function () {
                clickSound.play();
                announceToScreenReader('Oyundan çıkış yapılıyor.');

                setTimeout(() => {
                    // Tarayıcı sekmesi kendi açmadığı için window.close() reddedebilir.
                    window.close();
                    // Eğer close() işe yaramazsa, sayfayı boş bir adrese veya geri yönlendir:
                    window.location.href = "about:blank";
                }, 1000);
            });
        }               
