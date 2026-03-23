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

    // Eşleştirme sırasına gir (Rakip Arama)
    joinQueue: function() {
        if (!window.db) {
            if (window.announceToScreenReader) window.announceToScreenReader("Bağlantı hatası. Veritabanı ulaşılamıyor.");
            return;
        }

        let deviceId = localStorage.getItem('hafizaGuvenDeviceId');
        if (!deviceId) return; // Güvenli oturum yoksa başlatma

        let myName = window.currentChatUser || localStorage.getItem('chatUsername') || sessionStorage.getItem('chatNickname');
        if (!myName || myName.trim() === "") {
            if (window.wrongSound) window.wrongSound.play();
            if (window.announceToScreenReader) window.announceToScreenReader("PvP oynamak için önce canlı sohbete bir kez katılarak bir takma ad seçmelisiniz.");
            return;
        }

        // Temiz isim
        myName = myName.replace(/[.#$\[\]\/]/g, '_');

        // Eski modların sızıntı yapmasını engellemek için parametreleri sıfırla
        this.isBotMode = false;
        this.matchId = null;
        this.myQueueId = deviceId;
        this.isSearching = true;

        const queueNode = window.db.ref('pvp_queue/' + this.myQueueId);
        queueNode.set({
            name: myName,
            timestamp: firebase.database.ServerValue.TIMESTAMP,
            matchedWith: null
        });

        // Bağlantı koparsa sıradan düşür
        queueNode.onDisconnect().remove();

        const btn = document.getElementById('pvp-play-btn');
        if (btn) {
            btn.innerHTML = 'Aranıyor... Kapatmak için tıklayın';
            btn.setAttribute('aria-label', 'Rakip aranıyor. İptal etmek için tekrar tıklayın.');
        }

        if (window.announceToScreenReader) window.announceToScreenReader("Rakip aranıyor. Lütfen bekleyin.");

        // Sırayı Dinle
        this.queueRef = window.db.ref('pvp_queue');
        
        // Host (Kurucu) Algoritması: Eğer sırada başka biri varsa ve onun tarihi eskiyse o host olur, 
        // ben sonradan geldiysem ben ona katılırım veya ben eskiysem ve o geldiyse ben host olup maçı başlatırım.
        
        this.queueRef.on('value', (snapshot) => {
            if (!this.isSearching) return;
            const players = snapshot.val();
            if (!players) return;

            // Kendi verim
            const myData = players[this.myQueueId];
            if (!myData) return; // Belki sırada değilim

            // Eğer birisi beni eşleştirdiyse (Ben İstemciysem / Client)
            if (myData.matchedWith) {
                this.isSearching = false;
                this.matchId = myData.matchedWith;
                this.isHost = false;
                this.queueRef.off();
                queueNode.remove(); // Sıradan çık
                this.enterMatchRoom(this.matchId, myData.hostName);
                return;
            }

            // Eğer eşleştirilmemişsem, başkası var mı diye bak (Ben Sunucuyam / Host adayı)
            let possibleOpponents = [];
            for (let id in players) {
                if (id !== this.myQueueId && !players[id].matchedWith) {
                    possibleOpponents.push({ id: id, data: players[id] });
                }
            }

            // Karşıma rakip çıktıysa ve benim timestamp'im ondan daha eskiyse BİRLEŞTİR (Host benim)
            // Eğer onunki daha eskiyse, O'nun beni birleştirmesini bekle.
            if (possibleOpponents.length > 0) {
                let opponent = possibleOpponents[0]; // Sadece ilk geleni al

                if (myData.timestamp <= opponent.data.timestamp) {
                    // BEN HOST'UM. Maçı kuruyorum.
                    this.isSearching = false;
                    this.isHost = true;
                    this.matchId = 'match_' + this.myQueueId + '_' + Date.now();
                    this.opponentId = opponent.id;
                    this.opponentName = opponent.data.name;

                    this.queueRef.off();

                    // Maç veritabanını oluştur
                    const matchNode = window.db.ref('matches/' + this.matchId);
                    
                    // Ben eğer düşersem/çıkarsam odanın statüsünü direkt bitir ve temizle
                    matchNode.onDisconnect().update({ status: 'finished', hostFinished: true });

                    matchNode.set({
                        host: this.myQueueId,
                        hostName: myName,
                        client: this.opponentId,
                        clientName: this.opponentName,
                        status: 'waiting_for_client',
                        createdAt: firebase.database.ServerValue.TIMESTAMP
                    }).then(() => {
                        // Rakibi bu maça çek
                        window.db.ref('pvp_queue/' + this.opponentId).update({
                            matchedWith: this.matchId,
                            hostName: myName
                        });
                        queueNode.remove(); // Kendimi sıradan çıkar
                        
                        this.enterMatchRoom(this.matchId, this.opponentName);
                    });
                }
            }
        });
    },

    cancelQueue: function() {
        this.isSearching = false;
        
        if (this.botQueueTimer) {
            clearTimeout(this.botQueueTimer);
            this.botQueueTimer = null;
        }

        if (this.lobbyWaitTimer) {
            clearTimeout(this.lobbyWaitTimer);
            this.lobbyWaitTimer = null;
        }

        if (this.matchId) {
            window.db.ref('matches/' + this.matchId).update({ status: 'finished', hostFinished: true, clientFinished: true });
            if (this.isBotMode) window.db.ref('matches/' + this.matchId).remove();
            this.matchId = null;
        }

        if (this.queueRef && !this.isBotMode) this.queueRef.off();
        if (this.myQueueId && !this.isBotMode) window.db.ref('pvp_queue/' + this.myQueueId).remove();
        
        this.isBotMode = false;
        
        const btn = document.getElementById('pvp-play-btn');
        if (btn) {
            btn.innerHTML = 'Birebir Rakiple Oyna';
            btn.setAttribute('aria-label', 'Birebir Rakiple Oyna. Eşleştirme iptal edildi.');
        }
        
        const botBtn = document.getElementById('pve-bot-play-btn');
        if (botBtn) {
            botBtn.innerHTML = 'Bota Karşı Oyna';
            botBtn.setAttribute('aria-label', 'Bota Karşı Oyna. Eşleştirme iptal edildi.');
        }

        if (window.announceToScreenReader) window.announceToScreenReader("Eşleştirme iptal edildi.");
    },

    enterMatchRoom: function(mappedMatchId, oppName) {
        // İstemci isek sunucudaki odayı güvenceye alalım
        if (!this.isHost && !this.isBotMode) {
            window.db.ref('matches/' + this.matchId).onDisconnect().update({ status: 'finished', clientFinished: true });
        }

        if (window.correctSound) window.correctSound.play();
        
        let anonsMesaji = this.isBotMode ? 
            "Bot lobiye giriş yaptı. Kısa süre sonra oyuna başlayacaksınız." : 
            `Oyuncu oyuna giriş yaptı. Eşleşme bulundu! Rakibiniz: ${oppName}. Kısa süre sonra oyuna başlayacaksınız.`;

        if (window.announceToScreenReader) window.announceToScreenReader(anonsMesaji, true);
        
        const btn = this.isBotMode ? document.getElementById('pve-bot-play-btn') : document.getElementById('pvp-play-btn');
        if (btn) {
            btn.innerHTML = `Eşleşti: ${oppName}!`;
            btn.setAttribute('aria-label', anonsMesaji);
        }

        // 10 Saniye boyunca 'Lobi' ekranında bekletip oyunu başlat
        this.lobbyWaitTimer = setTimeout(() => {
            if (!this.matchId) return; // İşlem kullanıcı tarafından iptal edildiyse dur
            const resetBtn = document.getElementById('pvp-play-btn');
            if (resetBtn) resetBtn.innerHTML = 'Birebir Rakiple Oyna';
            const resetBotBtn = document.getElementById('pve-bot-play-btn');
            if (resetBotBtn) resetBotBtn.innerHTML = 'Bota Karşı Oyna';
            
            if (window.switchMenu && window.multiplayerSelectMenu && window.gameMenu) {
                window.switchMenu(window.multiplayerSelectMenu, window.gameMenu, 'game');
            }
            this.startPvPGame();
        }, 10000);
    },

    // BOTA KARŞI OYNA (YAPAY ZEKA) BAŞLANGICI
    startBotMatch: function() {
        let deviceId = localStorage.getItem('hafizaGuvenDeviceId') || 'guest_' + Date.now();
        let myName = window.currentChatUser || localStorage.getItem('chatUsername') || "Sen";
        
        this.isSearching = true; // Bot arıyormuş gibi hissettir
        this.isHost = true; 
        this.isBotMode = true; 
        
        // UI Bildirimleri
        const botBtn = document.getElementById('pve-bot-play-btn');
        if (botBtn) {
            botBtn.innerHTML = 'Aranıyor... İptal için tıklayın';
            botBtn.setAttribute('aria-label', 'Uygun bir yapay zeka rakibi aranıyor. İptal etmek için tekrar tıklayın.');
        }
        if (window.announceToScreenReader) window.announceToScreenReader("Uygun bir yapay zeka rakibi aranıyor. Lütfen bekleyin.");

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

    simulateBotTurn: function(turnIndex) {
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

    startPvPGame: function() {
        if (!this.matchId) return;
        console.log("PvP Modu: 60 saniye başladı!");
        
        window.isStarted = true;
        window.gameIsActive = true;
        window.isComputerPlaying = true;
        window.gameSequence = [];
        window.playerSequence = [];
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
                let oppScore = 0;
                if (this.isHost && val.clientScore) oppScore = val.clientScore;
                if (!this.isHost && val.hostScore) oppScore = val.hostScore;
                // HUD Güncelle
                const scoreDisplay = document.getElementById('game-score-display');
                if (scoreDisplay) scoreDisplay.innerHTML = `Sen: ${window.pvpScore} | Rakip: ${oppScore}`;
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

    playNextPvPRound: function() {
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

    onPlayerCorrectSequence: function() {
        if (!this.matchId) return;
        const turnIndex = this.currentPvPTurn;
        
        // Hız Yarışı Doğrulaması (Kural: Kim hızlıysa puanı o alır)
        const turnRef = window.db.ref(`matches/${this.matchId}/turns/${turnIndex}`);
        
        turnRef.transaction((currentData) => {
            if (currentData === null) {
                // Bu turu (turnIndex) henüz kimse geçmemiş, benim adıma yaz
                return { 
                    winner: this.isHost ? 'host' : 'client', 
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
                if (this.isHost) updateData.hostScore = window.pvpScore;
                else updateData.clientScore = window.pvpScore;
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

    finishMatchTimeUp: function() {
        if (!window.gameIsActive || !this.matchId || this.gameEndingBlock) return;
        window.gameIsActive = false;
        
        const matchNode = window.db.ref('matches/' + this.matchId);
        let updateData = { status: 'finished' };
        if (this.isHost) updateData.hostFinished = true;
        else updateData.clientFinished = true;
        
        matchNode.update(updateData);
    },
    gameEndingBlock: false,
    
    endPvPGame: function(matchData) {
        if (!this.matchId || this.gameEndingBlock) return; // Çift ödül zaafiyetini engelle
        this.gameEndingBlock = true;
        
        clearInterval(this.pvpInterval);
        if (this.botTimeout) clearTimeout(this.botTimeout);
        window.gameIsActive = false;
        
        let myScore = this.isHost ? (matchData.hostScore || 0) : (matchData.clientScore || 0);
        let oppScore = this.isHost ? (matchData.clientScore || 0) : (matchData.hostScore || 0);
        
        let msg = `Oyun Bitti! Senin Puanın: ${myScore}, Rakibin Puanı: ${oppScore}. `;
        let isWinner = false;
        
        if (myScore > oppScore) {
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
        } else if (myScore < oppScore) {
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
        }, 6000);
    }
};

// --- GÜVENLİ KANCALAR (MONKEY PATCHING) ---
// game.js içerisindeki orijinal çevrimdışı (offline) fonksiyonları bozmadan PVP Kurallarını (Özellikle Kural 1: 60 Saniye) dayatıyoruz.

const originalHandleGameInput = window.handleGameInput;
window.handleGameInput = function(key) {
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
window.endMainGame = function(isTimeUp = false, isWin = false, isUserExit = false) {
    if (window.PvP && window.PvP.matchId) {
        window.PvP.finishMatchTimeUp(); // Sunucuya öldüğümüzü / bittiğini haber ver
        window.PvP.matchId = null; 
    }
    if (originalEndMainGame) originalEndMainGame(isTimeUp, isWin, isUserExit);
};
