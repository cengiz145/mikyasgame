// pvp.js - 1v1 Çok Oyunculu Eşleştirme ve Oyun Motoru

window.PvP = {
    matchId: null,
    isHost: false,
    opponentId: null,
    opponentName: null,
    queueRef: null,
    myQueueId: null,
    isSearching: false,
    isBotMode: false, // Ghost Bot sızıntısını engellemek için ana bayrak tanımlandı!

    // Maç Kur (Lobi Oluşturma)
    createMatch: function () {
        if (!window.db) {
            if (window.announceToScreenReader) window.announceToScreenReader("Bağlantı hatası. Veritabanı ulaşılamıyor.");
            return;
        }

        let deviceId = localStorage.getItem('hafizaGuvenDeviceId');
        if (!deviceId) {
            deviceId = 'dev_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
            localStorage.setItem('hafizaGuvenDeviceId', deviceId);
        }

        let myName = window.currentChatUser || localStorage.getItem('chatUsername') || sessionStorage.getItem('chatNickname') || "Misafir";
        myName = myName.replace(/[.#$\[\]\/]/g, '_');

        this.isBotMode = false;
        this.myQueueId = deviceId;
        this.matchId = 'match_' + this.myQueueId + '_' + Date.now();
        this.isSearching = true; // Sadece arayüzde iptal edilebilirlik sağlamak için
        this.isHost = true;
        
        // --- YENİ: Rastgele 4 Haneli Oda Kodu ---
        this.roomCode = Math.floor(1000 + Math.random() * 9000).toString();

        // Odaya katılanları saymak için yerel değişken
        this.lastClientCount = 0;

        const queueNode = window.db.ref('pvp_queue/' + this.roomCode);
        queueNode.set({
            name: myName,
            hostId: this.myQueueId,
            matchId: this.matchId,
            timestamp: firebase.database.ServerValue.TIMESTAMP
        }).catch(err => {
            console.error("Firebase PvP Queue Set Error:", err);
            alert("Sunucuya bağlanılamadı veya eşleştirme kuralları bunu engelledi. (Firebase Rules Error)");
            this.cancelQueue();
        });

        // Bağlantı koparsa lobi listeden düşsün
        queueNode.onDisconnect().remove();

        const matchNode = window.db.ref('matches/' + this.matchId);
        matchNode.set({
            host: this.myQueueId,
            hostName: myName,
            status: 'waiting_for_client',
            createdAt: firebase.database.ServerValue.TIMESTAMP,
            clients: {} // Çoklu oyuncu altyapısı (Maks 4)
        }).catch(err => console.error("Firebase Match Set Error:", err));
        
        matchNode.onDisconnect().update({ status: 'finished', hostFinished: true });

        const btn = document.getElementById('pvp-play-btn');
        if (btn) {
            btn.innerHTML = 'İptal Et / Çıkış';
        }

        if (window.switchMenu && window.multiplayerSelectMenu && window.pvpLobbyMenu) {
            window.switchMenu(window.multiplayerSelectMenu, window.pvpLobbyMenu, 'pvp-lobby');
            const statusText = document.getElementById('pvp-lobby-status-text');
            const infoText = document.getElementById('pvp-lobby-info-text');
            const codeDisplay = document.getElementById('pvp-lobby-code-display');
            const startBtn = document.getElementById('pvp-lobby-start-btn');
            
            if (codeDisplay) codeDisplay.innerText = this.roomCode;
            if (statusText) statusText.innerText = "Oda Kuruldu";
            if (infoText) infoText.innerText = "Oda Numaranızı paylaşın. Oyuncular bekleniyor...";
            if (startBtn) startBtn.style.display = 'none'; // Gizle, kimse yok
        }

        if (window.announceToScreenReader) window.announceToScreenReader("Oda kuruldu. Oda numaranız: " + this.roomCode + " . Oyuncular aranıyor.");

        if (window.bgMusic && window.bgMusic.playing()) window.bgMusic.pause();
        if (window.music38Sound && !window.music38Sound.playing()) window.music38Sound.play();

        // Odaya biri katıldı mı diye dinle
        this.matchRef = window.db.ref('matches/' + this.matchId);
        this.matchRef.on('value', (snapshot) => {
            if (!this.isSearching) return;
            const matchData = snapshot.val();
            if (!matchData) return;

            // Gelen oyuncu varsa listele
            if (matchData.clients) {
                const clientKeys = Object.keys(matchData.clients);
                
                if (clientKeys.length > 0 && matchData.status === 'waiting_for_client') {
                    const statusText = document.getElementById('pvp-lobby-status-text');
                    const infoText = document.getElementById('pvp-lobby-info-text');
                    const startBtn = document.getElementById('pvp-lobby-start-btn');
                    
                    if (statusText) statusText.innerText = `Bağlananlar (${clientKeys.length}/4)`;
                    let katilanlar = clientKeys.map(k => matchData.clients[k].name).join(', ');
                    if (infoText) infoText.innerText = "Odadakiler: " + katilanlar;
                    
                    if (startBtn && startBtn.style.display === 'none') {
                        startBtn.style.display = 'inline-block';
                        setTimeout(() => startBtn.focus(), 100);
                    }
                    
                    if (clientKeys.length > this.lastClientCount) {
                        this.lastClientCount = clientKeys.length;
                        if (window.announceToScreenReader) window.announceToScreenReader("Yeni oyuncu katıldı. Odadakiler: " + katilanlar);
                    }
                }
            }
            
            // Host maçı manuel başlattıktan sonra starting aşamasını yakala
            if (matchData.status === 'starting') {
                this.isSearching = false;
                this.matchRef.off();
                // Rakip adını jenerik olarak belirt (hepsini yazmak sığmayabilir)
                let oppNameStr = matchData.clients ? Object.keys(matchData.clients).length + ' Oyuncu' : 'Rakipler';
                this.enterMatchRoom(this.matchId, oppNameStr);
            }
        });
    },

    // MAÇI BAŞLAT BUTONU (Sadece Host basabilir)
    startMatchManually: function() {
        if (!this.isHost || !this.matchId) return;
        
        const startBtn = document.getElementById('pvp-lobby-start-btn');
        if (startBtn) {
            startBtn.innerText = "Başlatılıyor...";
            startBtn.style.pointerEvents = 'none';
        }
        
        // Ortak maç durumunu başlatılıyor yap ve aramayı durdurmak için pvp_queue'yi sil
        if (this.roomCode) window.db.ref('pvp_queue/' + this.roomCode).remove();
        window.db.ref('matches/' + this.matchId).update({ status: 'starting' });
    },

    // KODA GÖRE MAÇA KATIL (Client)
    joinExistingMatchByCode: function (code) {
        if (!window.db) {
            if (window.announceToScreenReader) window.announceToScreenReader("Bağlantı hatası.");
            return;
        }

        const btn = document.getElementById('pvp-join-submit-btn');
        if (btn) {
            btn.innerHTML = 'Aranıyor...';
            btn.style.pointerEvents = 'none';
        }

        // Pvp_queue'dan odayı kod ile ara
        window.db.ref('pvp_queue/' + code).once('value').then((snapshot) => {
            const data = snapshot.val();
            if (!data || !data.matchId) {
                if (window.wrongSound) window.wrongSound.play();
                alert("Bu koda ait aktif bir oda bulunamadı veya maç başlamış!");
                if (window.announceToScreenReader) window.announceToScreenReader("Bu koda ait açık bir oda bulunamadı.", false);
                if (btn) {
                    btn.innerHTML = 'Katıl';
                    btn.style.pointerEvents = 'auto';
                }
                return;
            }

            const targetMatchId = data.matchId;
            const hostId = data.hostId;
            const hostName = data.name;

            let deviceId = localStorage.getItem('hafizaGuvenDeviceId');
            if (!deviceId) {
                deviceId = 'dev_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
                localStorage.setItem('hafizaGuvenDeviceId', deviceId);
            }

            let myName = window.currentChatUser || localStorage.getItem('chatUsername') || sessionStorage.getItem('chatNickname') || "Misafir";
            myName = myName.replace(/[.#$\[\]\/]/g, '_');

            // Maça katılma işlemi (Get & Update)
            const matchNode = window.db.ref('matches/' + targetMatchId);

            matchNode.get().then((matchSnap) => {
                const currentData = matchSnap.val();
                if (!currentData) {
                    if (window.wrongSound) window.wrongSound.play();
                    alert("Oda kapanmış! (Host çıkmış veya bağlantısı kopmuş)");
                    if (btn) {
                        btn.innerHTML = 'Katıl';
                        btn.style.pointerEvents = 'auto';
                    }
                    return;
                }
                
                if (currentData.status === 'finished' || currentData.status === 'starting' || currentData.status === 'playing') {
                    if (window.wrongSound) window.wrongSound.play();
                    alert("Maç çoktan başlamış veya bitmiş!");
                    if (btn) {
                        btn.innerHTML = 'Katıl';
                        btn.style.pointerEvents = 'auto';
                    }
                    return;
                }

                // Odadaki kişi sayısını kontrol et
                const existingClients = currentData.clients || {};
                const clientKeys = Object.keys(existingClients);
                
                // Müşterinin önceden katılıp katılmadığını kontrol et
                if (!existingClients[deviceId]) {
                    if (clientKeys.length >= 4) {
                        if (window.wrongSound) window.wrongSound.play();
                        alert("Oda kapasitesi dolu! (Maksimum 4 kişi katılabilir)");
                        if (btn) {
                            btn.innerHTML = 'Katıl';
                            btn.style.pointerEvents = 'auto';
                        }
                        return;
                    }
                }

                // Odaya kendimizi ekleyelim
                let updates = {};
                updates[`clients/${deviceId}`] = {
                    name: myName,
                    score: 0
                };
                updates['status'] = 'waiting_for_client'; // Hala beklemedeyiz, host başlatacak

                return matchNode.update(updates).then(() => {
                    // İŞLEM BAŞARILI!
                    // Not: pvp_queue'dan silmiyoruz ki 2., 3. kişiler de girebilsin. Host başlatırken silecek.

                    this.isSearching = false;
                    this.isBotMode = false;
                    this.isHost = false;
                    this.matchId = targetMatchId;
                    this.myQueueId = deviceId;
                    this.opponentId = hostId; // Ana ev sahibi
                    this.opponentName = hostName; // Ana ev sahibi 

                    if (window.switchMenu && window.pvpRoomsMenu && window.pvpLobbyMenu) {
                        window.switchMenu(window.pvpRoomsMenu, window.pvpLobbyMenu, 'pvp-lobby');
                    }

                    const statusText = document.getElementById('pvp-lobby-status-text');
                    const infoText = document.getElementById('pvp-lobby-info-text');
                    const codeDisplay = document.getElementById('pvp-lobby-code-display');
                    
                    if (codeDisplay) codeDisplay.innerText = code;
                    if (statusText) statusText.innerText = "Bağlanıldı!";
                    if (infoText) infoText.innerText = "Siz ve diğer oyuncular... Kurucunun maçı başlatması bekleniyor.";

                    if (btn) {
                        btn.innerHTML = 'Katıl';
                        btn.style.pointerEvents = 'auto';
                    }
                    
                    if (window.announceToScreenReader) window.announceToScreenReader("Odaya bağlanıldı. Oda kurucusunun maçı başlatması bekleniyor.");

                    // Kurucunun maçı "starting" yapmasını dinle
                    this.matchRef = window.db.ref('matches/' + this.matchId);
                    this.matchRef.on('value', snap => {
                        const mData = snap.val();
                        if (mData && mData.status === 'starting') {
                            this.matchRef.off();
                            
                            // Diğer katılımcıların sayısını hesapla
                            let katilanSayisi = mData.clients ? Object.keys(mData.clients).length : 1;
                            let oppText = `Kurucu: ${hostName} ve ${katilanSayisi - 1} Rakip`;
                            this.enterMatchRoom(this.matchId, oppText);
                        }
                    });
                });
            }).catch(err => {
                alert("Bağlantı sırasında hata oluştu!");
                if (btn) {
                    btn.innerHTML = 'Katıl';
                    btn.style.pointerEvents = 'auto';
                }
            });

        }).catch(err => {
            console.error(err);
            alert("Sunucuya erişilemiyor veya yetkiniz yok!\nFirebase Hatası: " + err.message + "\nLütfen Firebase Konsolu'ndan 'Realtime Database -> Rules' sekmesine girip read ve write izinlerini true yapın.");
            if (btn) {
                btn.innerHTML = 'Katıl';
                btn.style.pointerEvents = 'auto';
            }
        });
    },

    cancelQueue: function () {
        this.isSearching = false;

        if (window.music38Sound && window.music38Sound.playing()) window.music38Sound.stop();
        if (window.bgMusic && !window.bgMusic.playing() && window.currentActiveMenu !== 'game' && window.currentActiveMenu !== 'story') window.bgMusic.play();

        if (this.botQueueTimer) {
            clearTimeout(this.botQueueTimer);
            this.botQueueTimer = null;
        }

        if (this.lobbyWaitTimer) {
            clearTimeout(this.lobbyWaitTimer);
            this.lobbyWaitTimer = null;
        }

        // --- YENİ EKLENEN KİLİT: PvP Zamanlayıcısını Güvenle Kapat ---
        if (this.pvpInterval) {
            clearInterval(this.pvpInterval);
            this.pvpInterval = null;
        }
        // -------------------------------------------------------------

        if (this.matchId) {
            window.db.ref('matches/' + this.matchId).update({ status: 'finished', hostFinished: true, clientFinished: true });
            if (this.isBotMode) window.db.ref('matches/' + this.matchId).remove();
            this.matchId = null;
        }

        if (this.matchRef && !this.isBotMode) this.matchRef.off();
        if (this.myQueueId && !this.isBotMode) window.db.ref('pvp_queue/' + this.myQueueId).remove();

        this.isBotMode = false;
        this.matchStarted = false;

        const btn = document.getElementById('pvp-play-btn');
        if (btn) {
            btn.innerHTML = 'Maç Oluştur';
            btn.setAttribute('aria-label', 'Maç Oluştur. İşlem iptal edildi.');
            btn.style.pointerEvents = 'auto'; // Re-enable pointer events
        }

        const botBtn = document.getElementById('pve-bot-play-btn');
        if (botBtn) {
            botBtn.innerHTML = 'Bota Karşı Oyna';
            botBtn.setAttribute('aria-label', 'Bota Karşı Oyna. Eşleştirme iptal edildi.');
            botBtn.style.pointerEvents = 'auto'; // Re-enable pointer events
        }

        const cancelBtn = document.getElementById('pvp-lobby-cancel-btn');
        if (cancelBtn) cancelBtn.style.pointerEvents = 'auto';

        if (window.announceToScreenReader) window.announceToScreenReader("Eşleştirme iptal edildi.");
    },

    enterMatchRoom: function (mappedMatchId, oppName) {
        // İstemci isek sunucudaki odayı güvenceye alalım
        if (!this.isHost && !this.isBotMode) {
            window.db.ref('matches/' + this.matchId).onDisconnect().update({ status: 'finished', clientFinished: true });
        }

        if (window.music38Sound && window.music38Sound.playing()) window.music38Sound.stop();
        if (window.correctSound) window.correctSound.play();

        let anonsMesaji = this.isBotMode ?
            "Bot lobiye giriş yaptı. Kısa süre sonra oyuna başlayacaksınız." :
            `Oyuncu oyuna giriş yaptı. Eşleşme bulundu! Rakibiniz: ${oppName}. Kısa süre sonra oyuna başlayacaksınız.`;

        if (window.announceToScreenReader) window.announceToScreenReader(anonsMesaji, true);

        const statusText = document.getElementById('pvp-lobby-status-text');
        const infoText = document.getElementById('pvp-lobby-info-text');
        if (statusText) statusText.innerText = "Eşleşme Bulundu!";
        if (infoText) infoText.innerText = anonsMesaji;
        
        const btn = document.getElementById('pvp-lobby-cancel-btn');
        if (btn) btn.style.pointerEvents = 'none'; // Prevent cancelling when starting

        // 10 Saniye boyunca 'Lobi' ekranında bekletip oyunu başlat
        this.lobbyWaitTimer = setTimeout(() => {
            if (!this.matchId) return; // İşlem kullanıcı tarafından iptal edildiyse dur
            const resetBtn = document.getElementById('pvp-play-btn');
            if (resetBtn) {
                resetBtn.innerHTML = 'Maç Oluştur';
                resetBtn.style.pointerEvents = 'auto';
            }
            const resetBotBtn = document.getElementById('pve-bot-play-btn');
            if (resetBotBtn) {
                resetBotBtn.innerHTML = 'Bota Karşı Oyna';
                resetBotBtn.style.pointerEvents = 'auto';
            }

            if (window.switchMenu && window.gameMenu) {
                let activeMultiMenu = window.pvpLobbyMenu;
                window.switchMenu(activeMultiMenu, window.gameMenu, 'game');
            }
            this.startPvPGame();
        }, 10000);
    },

    // BOTA KARŞI OYNA (YAPAY ZEKA) BAŞLANGICI
    startBotMatch: function () {
        let deviceId = localStorage.getItem('hafizaGuvenDeviceId') || 'guest_' + Date.now();
        let myName = window.currentChatUser || localStorage.getItem('chatUsername') || "Sen";

        this.isSearching = true; // Bot arıyormuş gibi hissettir
        this.isHost = true;
        this.isBotMode = true;

        if (window.switchMenu && window.multiplayerSelectMenu && window.pvpLobbyMenu) {
            window.switchMenu(window.multiplayerSelectMenu, window.pvpLobbyMenu, 'pvp-lobby');
            const statusText = document.getElementById('pvp-lobby-status-text');
            const infoText = document.getElementById('pvp-lobby-info-text');
            if (statusText) statusText.innerText = "Bot Aranıyor...";
            if (infoText) infoText.innerText = "Uygun bir yapay zeka rakibi aranıyor. Lütfen bekleyin.";
        }
        if (window.announceToScreenReader) window.announceToScreenReader("Uygun bir yapay zeka rakibi aranıyor. Lütfen bekleyin.");

        if (window.bgMusic && window.bgMusic.playing()) window.bgMusic.pause();
        if (window.music38Sound && !window.music38Sound.playing()) window.music38Sound.play();

        // Ortalama 12-16 saniye arası yapay bekleme süresi
        let waitTime = Math.floor(Math.random() * 4000) + 12000;

        this.botQueueTimer = setTimeout(() => {
            if (!this.isSearching) return; // Kullanıcı beklerken odayı terkettiyse işlemi kes

            this.isSearching = false;
            this.matchId = 'bot_match_' + deviceId + '_' + Date.now();
            this.opponentId = 'ai_bot';
            this.opponentName = 'Yapay Zeka (Bot)';
            this.botScore = 0;

            const matchNode = window.db.ref('matches/' + this.matchId);
            matchNode.set({
                host: deviceId,
                hostName: myName,
                client: this.opponentId,
                clientName: this.opponentName,
                status: 'waiting_for_client',
                createdAt: firebase.database.ServerValue.TIMESTAMP
            }).then(() => {
                this.enterMatchRoom(this.matchId, this.opponentName);
            });
        }, waitTime);
    },

    simulateBotTurn: function (turnIndex) {
        if (!this.isBotMode || !window.gameIsActive || !this.matchId) return;

        // Ortalama Zeka Denklemi: Notaları Dinleme Süresi (turnIndex * 1000) + Notalara Basma Süresi (turnIndex * 400) + Reaksiyon Gecikmesi (500-2500ms arası)
        const reactTime = (turnIndex * 1000) + (turnIndex * 400) + (Math.floor(Math.random() * 2000) + 500);

        this.botTimeout = setTimeout(() => {
            if (!window.gameIsActive || !this.matchId) return;

            // %15 İhtimalle Bot Hata Yapar (Kafası Karışır / Yavaşlar)
            if (Math.random() < 0.15) {
                // Şaşkınlık yaşasın, puanı alamasın, ancak bir süre sonra toparlanıp sonraki tura geçsin.
                setTimeout(() => { if (window.gameIsActive) this.simulateBotTurn(turnIndex + 1); }, 2500);
                return;
            }

            // Bot hız testini kazandı mı diye Firebase'e istek at (İnsanın karşısına rakip çıkıyor)
            const turnRef = window.db.ref(`matches/${this.matchId}/turns/${turnIndex}`);
            turnRef.transaction((currentData) => {
                if (currentData === null) {
                    return { winner: 'client', timestamp: firebase.database.ServerValue.TIMESTAMP }; // Bot her zaman client listesinde
                }
                return; // Tur çoktan insan tarafından kapılmış 
            }, (error, committed, snapshot) => {
                if (committed) {
                    // Bot bu turun puanını aldı
                    this.botScore += 10;
                    window.db.ref('matches/' + this.matchId).update({ clientScore: this.botScore });
                }
                // İnsan kazanmış da olsa, Bot kazanmış da olsa Bot oyuna devam eder ve sonraki turu dinlemeye başlar
                this.simulateBotTurn(turnIndex + 1);
            });

        }, reactTime);
    },

    startPvPGame: function () {
        if (!this.matchId) return;
        console.log("PvP Modu: 60 saniye başladı!");

        window.isStarted = true;
        window.gameIsActive = true;
        window.isComputerPlaying = true;
        window.gameSequence = [];
        window.playerSequence = [];
        this.matchStarted = true;

        if (window.bgMusic && window.bgMusic.playing()) {
            window.bgMusic.pause();
        }
        window.pvpScore = 0;
        window.lives = 3;

        // KURAL 1: Süre 60 saniye olacak. (Offline resetlemeleri önlemek için özel bayrak kullanacağız)
        window.gameTimer = 60;
        if (window.updateGameUI) window.updateGameUI();
        if (window.announceToScreenReader) window.announceToScreenReader("Oyun başladı. Kural 1: Süreniz 60 saniye! Birebir modda süreniz her tur yenilenmez. Notalar aynıdır, rakip duyulmaz. Bol şans!");

        const matchNode = window.db.ref('matches/' + this.matchId);

        // Host ve Client oyuna aynı anda başlar (Kural 2: Herkese aynı anda tam olarak aynı dizi gidecek)
        if (this.isHost) {
            const notes = ['c', 'd', 'e', 'f', 'g', 'a', 'b'];
            let fullSeq = [];
            for (let i = 0; i < 100; i++) fullSeq.push(notes[Math.floor(Math.random() * notes.length)]);
            matchNode.update({ fullSequence: fullSeq, status: 'playing' });
        }

        // Ortak oyun seyrini ve ortak diziyi dinle
        const listener = matchNode.on('value', snap => {
            const val = snap.val();
            if (val) {
                // Eğer tam dizi (fullSequence) geldiyse al ve ilk raundu başlat
                if (val.fullSequence && !this.fullSequence) {
                    this.fullSequence = val.fullSequence;
                    this.currentPvPTurn = 1;

                    // İlk raundu başlat
                    if (window.gameSequence.length === 0) {
                        this.playNextPvPRound();
                        if (this.isBotMode) {
                            this.simulateBotTurn(1); // Botun zeka döngüsünü 1. turdan tetikle
                        }
                    }
                }

                // Karşı tarafın puanını ekrana yansıtmak için
                let myScoreStr = `Sen: ${window.pvpScore}`;
                let oppScoreStr = ` | Rakipler: `;
                
                let dId = localStorage.getItem('hafizaGuvenDeviceId');

                if (this.isHost) {
                    if (this.isBotMode) {
                        oppScoreStr += `Yapay Zeka: ${val.clientScore || 0}`;
                    } else if (val.clients) {
                        let ops = Object.keys(val.clients).map(k => `${val.clients[k].name}: ${val.clients[k].score || 0}`).join(', ');
                        oppScoreStr += ops || 'Yok';
                    } else {
                        oppScoreStr += 'Yok';
                    }
                } else {
                    oppScoreStr += `(Kurucu) ${val.hostName}: ${val.hostScore || 0}`;
                    if (val.clients) {
                        let ops = Object.keys(val.clients).filter(k => k !== dId).map(k => `${val.clients[k].name}: ${val.clients[k].score || 0}`).join(', ');
                        if (ops) oppScoreStr += ', ' + ops;
                    }
                }
                
                // HUD Güncelle
                const scoreDisplay = document.getElementById('game-score-display');
                if (scoreDisplay) {
                    scoreDisplay.style.fontSize = '1.0rem'; // Çoklu isimler sığsın
                    scoreDisplay.innerHTML = `${myScoreStr}${oppScoreStr}`;
                }
            }

            if (val && val.status === 'finished') {
                this.endPvPGame(val);
                matchNode.off('value', listener);
            }
        });


        // 60 Saniyelik Katı Kronometre
        this.pvpInterval = setInterval(() => {
            window.gameTimer--;
            if (window.gameTimer <= 0) {
                window.gameTimer = 0;
                clearInterval(this.pvpInterval);
                this.finishMatchTimeUp();
            }
            if (window.updateGameUI) window.updateGameUI();
        }, 1000);
    },

    playNextPvPRound: function () {
        if (!window.gameIsActive) return;
        window.playerSequence = [];
        window.isComputerPlaying = true;

        // Ortak notaları kes (Firebase'den alınan 100'lük seed'den yararlanır)
        window.gameSequence = this.fullSequence.slice(0, this.currentPvPTurn);

        const gameStatus = document.getElementById('game-status-text');
        if (gameStatus) gameStatus.textContent = "Dinleyin...";

        setTimeout(() => {
            if (window.playGameSequence) window.playGameSequence();
        }, 1000);
    },

    onPlayerCorrectSequence: function () {
        if (!this.matchId) return;
        const turnIndex = this.currentPvPTurn;
        let dId = localStorage.getItem('hafizaGuvenDeviceId');

        // Hız Yarışı Doğrulaması (Kural: Kim hızlıysa puanı o alır)
        const turnRef = window.db.ref(`matches/${this.matchId}/turns/${turnIndex}`);

        turnRef.transaction((currentData) => {
            if (currentData === null) {
                // Bu turu (turnIndex) henüz kimse geçmemiş, benim adıma yaz
                return {
                    winner: this.isHost ? 'host' : dId,
                    timestamp: firebase.database.ServerValue.TIMESTAMP
                };
            }
            // Tur daha önce kapılmış! İşlemi iptal et (puan yok)
            return;
        }, (error, committed, snapshot) => {
            if (error) {
                console.log("Turn transaction failed", error);
            } else if (committed) {
                // Puan kazandık (Turun ilk bitireni biziz)
                window.pvpScore += 10;
                if (window.announceToScreenReader) window.announceToScreenReader("Puan senin!");

                // Skor güncellemesini sunucuya gönder
                const matchNode = window.db.ref('matches/' + this.matchId);
                let updateData = {};
                if (this.isHost) {
                    updateData.hostScore = window.pvpScore;
                } else {
                    updateData[`clients/${dId}/score`] = window.pvpScore;
                }
                matchNode.update(updateData);
            } else {
                // Çok geç kaldık, rakip turu daha önce bitirmiş!
                if (window.announceToScreenReader) window.announceToScreenReader("Geç kaldın, rakip aldı!");
            }
        });

        this.currentPvPTurn++;
        this.playNextPvPRound();
        // Kural 1 Gereği Süreyi Sıfırlama!
        // (Aşağıda monkey patch ile korunan gameTimer devam edecek)
    },

    finishMatchTimeUp: function () {
        if (!window.gameIsActive || !this.matchId || this.gameEndingBlock) return;
        window.gameIsActive = false;

        const matchNode = window.db.ref('matches/' + this.matchId);
        let updateData = { status: 'finished' };
        if (this.isHost) updateData.hostFinished = true;
        else updateData.clientFinished = true;

        matchNode.update(updateData);
    },
    gameEndingBlock: false,

    endPvPGame: function (matchData) {
        if (!this.matchId || this.gameEndingBlock) return; // Çift ödül zaafiyetini engelle
        this.gameEndingBlock = true;

        clearInterval(this.pvpInterval);
        if (this.botTimeout) clearTimeout(this.botTimeout);

        // Eğer oyun henüz başlamadan iptal edildiyse (10 sn lobi sırasında), ödül sistemini atla
        if (!this.matchStarted) {
            if (this.lobbyWaitTimer) {
                clearTimeout(this.lobbyWaitTimer);
                this.lobbyWaitTimer = null;
            }
            if (window.bgMusic && !window.bgMusic.playing() && window.currentActiveMenu !== 'game' && window.currentActiveMenu !== 'story') window.bgMusic.play();

            const btn = document.getElementById('pvp-play-btn');
            if (btn) {
                btn.innerHTML = 'Maç Oluştur';
                btn.style.pointerEvents = 'auto';
            }

            this.matchId = null;
            this.isBotMode = false;
            this.matchStarted = false;
            this.gameEndingBlock = false;
            if (window.announceToScreenReader) window.announceToScreenReader("Rakip lobiden ayrıldı, maç iptal edildi.");

            // Eğer lobide veya multiplayer menülerindeyse, ana menüye atmak için tetikleyici
            if (window.switchMenu && window.mainMenu) {
                let currentMenu = document.querySelector('.menu-container:not([style*="display: none"])');
                if (currentMenu && (currentMenu.id === 'pvp-rooms-menu-container' || currentMenu.id === 'multiplayer-select-menu-container' || currentMenu.id === 'pvp-lobby-menu-container')) {
                    const backbtn = document.getElementById('pvp-lobby-cancel-btn') || document.getElementById('multiplayer-select-back-btn') || document.getElementById('pvp-rooms-back-btn');
                    if (backbtn) backbtn.click();
                }
            }
            return;
        }

        window.gameIsActive = false;

        let dId = localStorage.getItem('hafizaGuvenDeviceId');
        let myScore = 0;
        let highestOppScore = 0;

        if (this.isHost) {
            myScore = matchData.hostScore || 0;
            if (this.isBotMode) {
                highestOppScore = matchData.clientScore || 0;
            } else if (matchData.clients) {
                Object.keys(matchData.clients).forEach(k => {
                    let s = matchData.clients[k].score || 0;
                    if (s > highestOppScore) highestOppScore = s;
                });
            }
        } else {
            myScore = (matchData.clients && matchData.clients[dId]) ? (matchData.clients[dId].score || 0) : 0;
            highestOppScore = matchData.hostScore || 0;
            if (matchData.clients) {
                Object.keys(matchData.clients).forEach(k => {
                    if (k !== dId) {
                        let s = matchData.clients[k].score || 0;
                        if (s > highestOppScore) highestOppScore = s;
                    }
                });
            }
        }

        let msg = `Oyun Bitti! Senin Puanın: ${myScore}, En Yüksek Rakip Puanı: ${highestOppScore}. `;
        let isWinner = false;

        if (myScore > highestOppScore) {
            isWinner = true;
            msg += "Kazandın! ";

            // Kazanan için Rastgele Ödül Çekilişi (3 İhtimal)
            const rewardRNG = Math.floor(Math.random() * 3);
            if (rewardRNG === 0) {
                let zk = parseInt(localStorage.getItem('hafizaGuvenZamanKorumasi')) || 0;
                localStorage.setItem('hafizaGuvenZamanKorumasi', zk + 2);
                msg += "Büyük Ödül: 2 Zaman Koruması kazandın!";
            } else if (rewardRNG === 1) {
                let hk = parseInt(localStorage.getItem('hafizaGuvenHataKorumasi')) || 0;
                localStorage.setItem('hafizaGuvenHataKorumasi', hk + 2);
                msg += "Büyük Ödül: 2 Hata Koruması kazandın!";
            } else {
                let coins = parseInt(localStorage.getItem('hafizaGuvenTotalTokens')) || 0;
                localStorage.setItem('hafizaGuvenTotalTokens', coins + 100);
                msg += "Büyük Ödül: 100 Hafıza Jetonu kazandın!";
            }
        } else if (myScore < highestOppScore) {
            msg += "Kaybettin. ";
            let coins = parseInt(localStorage.getItem('hafizaGuvenTotalTokens')) || 0;
            localStorage.setItem('hafizaGuvenTotalTokens', coins + 20);
            msg += "Teselli Ödülü: 20 Hafıza Jetonu kazandın.";
        } else {
            msg += "Berabere! ";
            let coins = parseInt(localStorage.getItem('hafizaGuvenTotalTokens')) || 0;
            localStorage.setItem('hafizaGuvenTotalTokens', coins + 20);
            msg += "Teselli Ödülü: 20 Hafıza Jetonu kazandın.";
        }

        if (window.announceToScreenReader) window.announceToScreenReader(msg);

        setTimeout(() => {
            // PVP'DE ÇİFTE ÖDÜL ENFLASYONUNU ENGELLEME KİLİDİ
            window.sessionTokens = 0;

            if (window.endMainGame) window.endMainGame(true, isWinner, false);

            // Veritabanı Şişmesini (Database Spam) Engellemek İçin Bot Maçlarını Sil
            if (this.isBotMode && this.matchId) {
                window.db.ref('matches/' + this.matchId).remove();
            }

            this.matchId = null; // Sıfırla
            this.isBotMode = false;
            this.gameEndingBlock = false;
            this.matchStarted = false;
        }, 6000);
    }
};

// --- GÜVENLİ KANCALAR (MONKEY PATCHING) ---
// game.js içerisindeki orijinal çevrimdışı (offline) fonksiyonları bozmadan PVP Kurallarını (Özellikle Kural 1: 60 Saniye) dayatıyoruz.

const originalHandleGameInput = window.handleGameInput;
window.handleGameInput = function (key) {
    if (window.PvP && window.PvP.matchId) {
        let cachedTimer = window.gameTimer; // KURAL 1: 60 saniyelik zamanı korumaya al (Offline oyun her doğru tuşta 30sn'ye sıfırlar, bunu engelliyoruz)
        originalHandleGameInput(key);
        window.gameTimer = cachedTimer; // Offline resetini zorla ez ve Kural 1'i koru!
    } else {
        originalHandleGameInput(key);
    }
};

const originalAddNewNote = window.addNewNoteAndPlaySequence;
window.addNewNoteAndPlaySequence = function () {
    if (window.PvP && window.PvP.matchId) {
        window.PvP.onPlayerCorrectSequence();
        // Ortak dizilim (fullSequence) kullanıldığı için offline nota üreticisini kullanmıyoruz
    } else {
        originalAddNewNote();
    }
};

const originalEndMainGame = window.endMainGame;
window.endMainGame = function (isTimeUp = false, isWin = false, isUserExit = false) {
    // SADECE kullanıcı çıkışı (UserExit) ise maçı bitirme sinyali yolla, aksi halde PvP sonu (timeUp) normal akışında halledilsin
    if (window.PvP && window.PvP.matchId && isUserExit) {
        window.PvP.finishMatchTimeUp(); // Sunucuya öldüğümüzü / bittiğini haber ver
    }
    if (originalEndMainGame) originalEndMainGame(isTimeUp, isWin, isUserExit);
};


