// pvp.js - 1v1 Çok Oyunculu Eşleştirme ve Oyun Motoru

window.PvP = {
    matchId: null,
    isHost: false,
    opponentId: null,
    opponentName: null,
    queueRef: null,
    myQueueId: null,
    isSearching: false,

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
        if (this.queueRef) this.queueRef.off();
        if (this.myQueueId) window.db.ref('pvp_queue/' + this.myQueueId).remove();

        const btn = document.getElementById('pvp-play-btn');
        if (btn) {
            btn.innerHTML = 'Birebir Rakiple Oyna';
            btn.setAttribute('aria-label', 'Birebir Rakiple Oyna. Eşleştirme iptal edildi.');
        }
        if (window.announceToScreenReader) window.announceToScreenReader("Eşleştirme iptal edildi.");
    },

    enterMatchRoom: function(mappedMatchId, oppName) {
        if (window.correctSound) window.correctSound.play();
        if (window.announceToScreenReader) window.announceToScreenReader(`Eşleşme bulundu! Rakibiniz: ${oppName}. Karşılaşma birazdan başlayacak.`);
        
        const btn = document.getElementById('pvp-play-btn');
        if (btn) {
            btn.innerHTML = `Eşleşti: ${oppName}!`;
            btn.setAttribute('aria-label', 'Eşleşme bulundu. Maça geçiliyor...');
        }

        // Kısa süre sonra oyunu başlat
        setTimeout(() => {
            if (btn) btn.innerHTML = 'Birebir Rakiple Oyna';
            if (window.switchMenu && window.multiplayerSelectMenu && window.gameMenu) {
                window.switchMenu(window.multiplayerSelectMenu, window.gameMenu, 'game');
            }
            this.startPvPGame();
        }, 3000);
    },

    startPvPGame: function() {
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
        if (window.announceToScreenReader) window.announceToScreenReader("Kural 2 devrede: Rakipler birbirinin notalarını duyamaz ve bilemez. Oyun başladı. 60 saniyeniz var. Bol şans!");

        const matchNode = window.db.ref('matches/' + this.matchId);
        
        // Host ve Client oyuna aynı anda başlar (Kural 2: Herkese aynı anda çalacak)
        // Ancak notalar tamamen yerel ve bağımsız üretilir (Kural 2: Kimse rakibin notasını bilemeyecek)
        if (this.isHost) {
            matchNode.update({ status: 'playing' });
        }
        
        // Ortak oyun seyrini (sadece puanları) dinle
        const listener = matchNode.on('value', snap => {
            const val = snap.val();
            if (val) {
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
        
        // İlk notayı çalmaya başla (Tamamen yerel rastgele)
        setTimeout(() => {
            if (window.addNewNoteAndPlaySequence) window.addNewNoteAndPlaySequence();
        }, 1000);
        
        
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

    onPlayerCorrectSequence: function() {
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
        // Kural 1 Gereği Süreyi Sıfırlama!
        // (Aşağıda monkey patch ile korunan gameTimer devam edecek)
    },

    finishMatchTimeUp: function() {
        if (!window.gameIsActive) return;
        window.gameIsActive = false;
        
        const matchNode = window.db.ref('matches/' + this.matchId);
        let updateData = { status: 'finished' };
        if (this.isHost) updateData.hostFinished = true;
        else updateData.clientFinished = true;
        
        matchNode.update(updateData);
    },
    
    endPvPGame: function(matchData) {
        clearInterval(this.pvpInterval);
        window.gameIsActive = false;
        
        let myScore = this.isHost ? (matchData.hostScore || 0) : (matchData.clientScore || 0);
        let oppScore = this.isHost ? (matchData.clientScore || 0) : (matchData.hostScore || 0);
        
        let msg = `Oyun Bitti! Senin Puanın: ${myScore}, Rakibin Puanı: ${oppScore}. `;
        if (myScore > oppScore) msg += "Kazandın!";
        else if (myScore < oppScore) msg += "Kaybettin!";
        else msg += "Berabere!";
        
        if (window.announceToScreenReader) window.announceToScreenReader(msg);
        
        setTimeout(() => {
            if (window.endMainGame) window.endMainGame(true, myScore > oppScore, false);
            this.matchId = null; // Sıfırla
        }, 4000);
    }
};

// --- GÜVENLİ KANCALAR (MONKEY PATCHING) ---
// game.js içerisindeki orijinal çevrimdışı (offline) fonksiyonları bozmadan PVP Kurallarını (Özellikle Kural 1: 60 Saniye) dayatıyoruz.

const originalCheckPlayerInput = window.checkPlayerInput;
window.checkPlayerInput = function(key) {
    if (window.PvP && window.PvP.matchId) {
        let cachedTimer = window.gameTimer; // KURAL 1: 60 saniyelik zamanı korumaya al (Offline oyun her doğru tuşta 30sn'ye sıfırlar, bunu engelliyoruz)
        originalCheckPlayerInput(key); 
        window.gameTimer = cachedTimer; // Offline resetini zorla ez ve Kural 1'i koru!
    } else {
        originalCheckPlayerInput(key);
    }
};

const originalAddNewNote = window.addNewNoteAndPlaySequence;
window.addNewNoteAndPlaySequence = function () {
    if (window.PvP && window.PvP.matchId) {
        window.PvP.onPlayerCorrectSequence(); 
        originalAddNewNote(); // Orijinal offline notayı çağırıp lokal rastgele nota üret (Kural 2: Bağımsız gizli notalar)
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
