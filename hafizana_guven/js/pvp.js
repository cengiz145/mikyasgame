// pvp.js - 1v1 Ã‡ok Oyunculu EÅŸleÅŸtirme ve Oyun Motoru

window.PvP = {
    matchId: null,
    isHost: false,
    opponentId: null,
    opponentName: null,
    queueRef: null,
    myQueueId: null,
    isSearching: false,
    isBotMode: false, // Ghost Bot sÄ±zÄ±ntÄ±sÄ±nÄ± engellemek iÃ§in ana bayrak tanÄ±mlandÄ±!

    // MaÃ§ Kur (Lobi OluÅŸturma)
    createMatch: function () {
        if (!window.db) {
            if (window.announceToScreenReader) window.announceToScreenReader("BaÄŸlantÄ± hatasÄ±. VeritabanÄ± ulaÅŸÄ±lamÄ±yor.");
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
        window.isComputerPlaying = false;
        this.myQueueId = deviceId;
        this.matchId = 'match_' + this.myQueueId + '_' + Date.now();
        this.isSearching = true; // Sadece arayÃ¼zde iptal edilebilirlik saÄŸlamak iÃ§in
        this.isHost = true;
        
        // --- YENÄ°: Rastgele 5 Haneli Oda Kodu ---
        this.roomCode = Math.floor(10000 + Math.random() * 90000).toString();

        // Odaya katÄ±lanlarÄ± saymak iÃ§in yerel deÄŸiÅŸken
        this.lastClientCount = 0;

        const queueNode = window.db.ref('pvp_queue/' + this.roomCode);
        queueNode.set({
            name: myName,
            hostId: this.myQueueId,
            matchId: this.matchId,
            timestamp: firebase.database.ServerValue.TIMESTAMP
        }).catch(err => {
            console.error("Firebase PvP Queue Set Error:", err);
            if (window.showToastNotification) window.showToastNotification("Sunucuya baÄŸlanÄ±lamadÄ± veya eÅŸleÅŸtirme kurallarÄ± bunu engelledi.");
            if (window.announceToScreenReader) window.announceToScreenReader("Sunucuya baÄŸlanÄ±lamadÄ± veya eÅŸleÅŸtirme kurallarÄ± bunu engelledi.", true);
            this.cancelQueue();
        });

        // BaÄŸlantÄ± koparsa lobi listeden dÃ¼ÅŸsÃ¼n
        queueNode.onDisconnect().remove();

        const matchNode = window.db.ref('matches/' + this.matchId);
        matchNode.set({
            host: this.myQueueId,
            hostName: myName,
            status: 'waiting_for_client',
            mode: 'individual',
            createdAt: firebase.database.ServerValue.TIMESTAMP,
            clients: {} // Ã‡oklu oyuncu altyapÄ±sÄ± (Maks 4)
        }).catch(err => console.error("Firebase Match Set Error:", err));
        
        matchNode.onDisconnect().update({ status: 'finished', hostFinished: true });

        const btn = document.getElementById('pvp-play-btn');
        if (btn) {
            btn.innerHTML = 'Ä°ptal Et / Ã‡Ä±kÄ±ÅŸ';
            btn.setAttribute('aria-label', 'Ä°ptal Et veya Ã‡Ä±kÄ±ÅŸ Yap');
        }

        if (window.switchMenu && window.multiplayerSelectMenu && window.pvpLobbyMenu) {
            window.switchMenu(window.multiplayerSelectMenu, window.pvpLobbyMenu, 'pvp-lobby');
            const statusText = document.getElementById('pvp-lobby-status-text');
            const infoText = document.getElementById('pvp-lobby-info-text');
            const codeDisplay = document.getElementById('pvp-lobby-code-display');
            const startBtn = document.getElementById('pvp-lobby-start-btn');
            
            if (codeDisplay) {
                codeDisplay.innerText = this.roomCode;
                let kodOkunusu = this.roomCode.split('').join(' ');
                codeDisplay.setAttribute('aria-label', "Oda Kodunuz: " + kodOkunusu);
            }
            if (statusText) statusText.innerText = "Oda Kuruldu";
            if (infoText) infoText.innerText = "Oda NumaranÄ±zÄ± paylaÅŸÄ±n. Oyuncular bekleniyor...";
            if (startBtn) startBtn.style.display = 'none'; // Gizle, kimse yok
            
            const modeContainer = document.getElementById('pvp-lobby-mode-container');
            if (modeContainer) modeContainer.style.display = 'block';
            window.PvP.matchMode = 'individual';
            const btnInd = document.getElementById('pvp-mode-individual-btn');
            const btnTeam = document.getElementById('pvp-mode-team-btn');
            if (btnInd) { btnInd.style.background = '#ffb703'; btnInd.style.color = '#000'; }
            if (btnTeam) { btnTeam.style.background = ''; btnTeam.style.color = ''; }
        }

        if (window.arenaJoinSound) window.arenaJoinSound.play();
        if (window.announceToScreenReader) {
            let kodOkunusu = this.roomCode.split('').join(' ');
            window.announceToScreenReader("Oda kuruldu. Oda numaranÄ±z: " + kodOkunusu + " . Oyuncular aranÄ±yor.");
        }

        if (window.bgMusic && window.bgMusic.playing()) window.bgMusic.pause();
        if (window.music38Sound && !window.music38Sound.playing()) window.music38Sound.play();

        // Odaya biri katÄ±ldÄ± mÄ± diye dinle
        this.lastLobbyPlayers = {};
        this.matchRef = window.db.ref('matches/' + this.matchId);
        this.matchRef.on('value', (snapshot) => {
            if (!this.isSearching) return;
            const matchData = snapshot.val();
            if (!matchData) return;

            let currentPlayers = {};
            if (matchData.hostName) currentPlayers[matchData.host] = matchData.hostName;
            if (matchData.clients) {
                Object.keys(matchData.clients).forEach(k => {
                    currentPlayers[k] = matchData.clients[k].name;
                });
            }

            let currentKeys = Object.keys(currentPlayers);
            let lastKeys = Object.keys(this.lastLobbyPlayers);

            if (lastKeys.length > 0) {
                currentKeys.forEach(id => {
                    if (!this.lastLobbyPlayers[id]) {
                        let msg = `${currentPlayers[id]} lobiye katÄ±ldÄ±.`;
                        if (window.announceToScreenReader) window.announceToScreenReader(msg, true);
                        if (window.showToastNotification) window.showToastNotification(msg);
                        if (window.arenaJoinSound) window.arenaJoinSound.play();
                    }
                });
                lastKeys.forEach(id => {
                    if (!currentPlayers[id]) {
                        let msg = `${this.lastLobbyPlayers[id]} lobiden ayrÄ±ldÄ±.`;
                        if (window.announceToScreenReader) window.announceToScreenReader(msg, true);
                        if (window.showToastNotification) window.showToastNotification(msg);
                        if (window.arenaLeaveSound) window.arenaLeaveSound.play();
                    }
                });
            }
            this.lastLobbyPlayers = currentPlayers;

            const statusText = document.getElementById('pvp-lobby-status-text');
            const infoText = document.getElementById('pvp-lobby-info-text');
            const startBtn = document.getElementById('pvp-lobby-start-btn');
            
            if (matchData.status === 'waiting_for_client') {
                let pNames = Object.values(currentPlayers).join(', ');
                if (statusText) statusText.innerText = `Odadakiler (${currentKeys.length}/4)`;
                if (infoText) infoText.innerText = "Oyuncular: " + pNames;
                
                if (currentKeys.length > 1 && startBtn && startBtn.style.display === 'none') {
                    startBtn.style.display = 'inline-block';
                    setTimeout(() => startBtn.focus(), 100);
                } else if (currentKeys.length <= 1 && startBtn) {
                    startBtn.style.display = 'none';
                }
            }

            if (matchData.status === 'starting') {
                this.isSearching = false;
                this.matchRef.off();
                let oppNameStr = (currentKeys.length - 1) + ' Rakip';
                this.enterMatchRoom(this.matchId, oppNameStr);
            }
        });
    },

    // MAÃ‡I BAÅLAT BUTONU (Sadece Host basabilir)
    startMatchManually: function() {
        if (!this.isHost || !this.matchId) return;
        
        const startBtn = document.getElementById('pvp-lobby-start-btn');
        if (startBtn) {
            startBtn.innerText = "BaÅŸlatÄ±lÄ±yor...";
            startBtn.style.pointerEvents = 'none';
        }
        
        // Ortak maÃ§ durumunu baÅŸlatÄ±lÄ±yor yap ve aramayÄ± durdurmak iÃ§in pvp_queue'yi sil
        if (this.roomCode) window.db.ref('pvp_queue/' + this.roomCode).remove();
        window.db.ref('matches/' + this.matchId).update({ status: 'starting' });
    },

    // KODA GÃ–RE MAÃ‡A KATIL (Client)
    joinExistingMatchByCode: function (code) {
        if (!window.db) {
            if (window.announceToScreenReader) window.announceToScreenReader("BaÄŸlantÄ± hatasÄ±.");
            return;
        }

        const btn = document.getElementById('pvp-join-submit-btn');
        if (btn) {
            btn.innerHTML = 'AranÄ±yor...';
            btn.style.pointerEvents = 'none';
        }

        // Pvp_queue'dan odayÄ± kod ile ara
        window.db.ref('pvp_queue/' + code).once('value').then((snapshot) => {
            const data = snapshot.val();
            if (!data || !data.matchId) {
                if (window.wrongSound) window.wrongSound.play();
                if (window.showToastNotification) window.showToastNotification("Bu koda ait aktif bir oda bulunamadÄ± veya maÃ§ baÅŸlamÄ±ÅŸ!");
                if (window.announceToScreenReader) window.announceToScreenReader("Bu koda ait aÃ§Ä±k bir oda bulunamadÄ±.", true);
                if (btn) {
                    btn.innerHTML = 'KatÄ±l';
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
            window.isComputerPlaying = false;

            // MaÃ§a katÄ±lma iÅŸlemi (Get & Update)
            const matchNode = window.db.ref('matches/' + targetMatchId);

            matchNode.get().then((matchSnap) => {
                const currentData = matchSnap.val();
                if (!currentData) {
                    if (window.wrongSound) window.wrongSound.play();
                    if (window.showToastNotification) window.showToastNotification("Oda kapanmÄ±ÅŸ! (Host Ã§Ä±kmÄ±ÅŸ veya baÄŸlantÄ±sÄ± kopmuÅŸ)");
                    if (window.announceToScreenReader) window.announceToScreenReader("Oda kapanmÄ±ÅŸ! Host Ã§Ä±kmÄ±ÅŸ veya baÄŸlantÄ±sÄ± kopmuÅŸ.", true);
                    if (btn) {
                        btn.innerHTML = 'KatÄ±l';
                        btn.style.pointerEvents = 'auto';
                    }
                    return;
                }
                
                if (currentData.status === 'finished' || currentData.status === 'starting' || currentData.status === 'playing') {
                    if (window.wrongSound) window.wrongSound.play();
                    if (window.showToastNotification) window.showToastNotification("MaÃ§ Ã§oktan baÅŸlamÄ±ÅŸ veya bitmiÅŸ!");
                    if (window.announceToScreenReader) window.announceToScreenReader("MaÃ§ Ã§oktan baÅŸlamÄ±ÅŸ veya bitmiÅŸ!", true);
                    if (btn) {
                        btn.innerHTML = 'KatÄ±l';
                        btn.style.pointerEvents = 'auto';
                    }
                    return;
                }

                // Odadaki kiÅŸi sayÄ±sÄ±nÄ± kontrol et
                const existingClients = currentData.clients || {};
                const clientKeys = Object.keys(existingClients);
                
                // MÃ¼ÅŸterinin Ã¶nceden katÄ±lÄ±p katÄ±lmadÄ±ÄŸÄ±nÄ± kontrol et
                if (!existingClients[deviceId]) {
                    if (clientKeys.length >= 4) {
                        if (window.wrongSound) window.wrongSound.play();
                        if (window.showToastNotification) window.showToastNotification("Oda kapasitesi dolu! Maksimum 4 kiÅŸi katÄ±labilir.");
                        if (window.announceToScreenReader) window.announceToScreenReader("Oda kapasitesi dolu! Maksimum 4 kiÅŸi katÄ±labilir.", true);
                        if (btn) {
                            btn.innerHTML = 'KatÄ±l';
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
                updates['status'] = 'waiting_for_client'; // Hala beklemedeyiz, host baÅŸlatacak

                return matchNode.update(updates).then(() => {
                    // Ä°ÅLEM BAÅARILI!
                    // Not: pvp_queue'dan silmiyoruz ki 2., 3. kiÅŸiler de girebilsin. Host baÅŸlatÄ±rken silecek.

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
                    
                    if (codeDisplay) {
                        codeDisplay.innerText = code;
                        let kodOkunusu = code.split('').join(' ');
                        codeDisplay.setAttribute('aria-label', "BaÄŸlanÄ±lan Oda Kodu: " + kodOkunusu);
                    }
                    if (statusText) statusText.innerText = "BaÄŸlanÄ±ldÄ±!";
                    if (infoText) infoText.innerText = "Siz ve diÄŸer oyuncular... Kurucunun maÃ§Ä± baÅŸlatmasÄ± bekleniyor.";
                    
                    const modeContainer = document.getElementById('pvp-lobby-mode-container');
                    if (modeContainer) modeContainer.style.display = 'none';

                    if (window.arenaJoinSound) window.arenaJoinSound.play();
                    if (btn) {
                        btn.innerHTML = 'KatÄ±l';
                        btn.style.pointerEvents = 'auto';
                    }
                    
                    if (window.announceToScreenReader) window.announceToScreenReader("Odaya baÄŸlanÄ±ldÄ±. Oda kurucusunun maÃ§Ä± baÅŸlatmasÄ± bekleniyor.");

                    // Kurucunun maÃ§Ä± "starting" yapmasÄ±nÄ± dinle ve lobi deÄŸiÅŸimlerini takip et
                    this.lastLobbyPlayers = {};
                    this.matchRef = window.db.ref('matches/' + this.matchId);
                    this.matchRef.on('value', snap => {
                        const mData = snap.val();
                        if (!mData) return;

                        let currentPlayers = {};
                        if (mData.hostName) currentPlayers[mData.host] = mData.hostName;
                        if (mData.clients) {
                            Object.keys(mData.clients).forEach(k => {
                                currentPlayers[k] = mData.clients[k].name;
                            });
                        }

                        let currentKeys = Object.keys(currentPlayers);
                        let lastKeys = Object.keys(this.lastLobbyPlayers);

                        if (lastKeys.length > 0) {
                            currentKeys.forEach(id => {
                                if (!this.lastLobbyPlayers[id]) {
                                    let msg = `${currentPlayers[id]} lobiye katÄ±ldÄ±.`;
                                    if (window.announceToScreenReader) window.announceToScreenReader(msg, true);
                                    if (window.showToastNotification) window.showToastNotification(msg);
                                    if (window.arenaJoinSound) window.arenaJoinSound.play();
                                }
                            });
                            lastKeys.forEach(id => {
                                if (!currentPlayers[id]) {
                                    let msg = `${this.lastLobbyPlayers[id]} lobiden ayrÄ±ldÄ±.`;
                                    if (window.announceToScreenReader) window.announceToScreenReader(msg, true);
                                    if (window.showToastNotification) window.showToastNotification(msg);
                                    if (window.arenaLeaveSound) window.arenaLeaveSound.play();
                                }
                            });
                        }
                        this.lastLobbyPlayers = currentPlayers;

                        const statusText = document.getElementById('pvp-lobby-status-text');
                        const infoText = document.getElementById('pvp-lobby-info-text');
                        
                        // EÄŸer kurucu odayÄ± kapattÄ±ysa (Ä°ptal ettiyse) istemcileri gÃ¼venlice Ã§Ä±kar
                        if (mData.status === 'finished') {
                             if (window.wrongSound) window.wrongSound.play();
                             if (window.announceToScreenReader) window.announceToScreenReader("Kurucu odayÄ± kapattÄ±.", true);
                             this.cancelQueue();
                             return;
                        }

                        if (mData.status === 'waiting_for_client') {
                            let pNames = Object.values(currentPlayers).join(', ');
                            if (statusText) statusText.innerText = `Odadakiler (${currentKeys.length}/4)`;
                            if (infoText) infoText.innerText = "Oyuncular: " + pNames;
                        }

                        if (mData.status === 'starting') {
                            this.matchRef.off();
                            let oppText = `Kurucu: ${mData.hostName} ve ${currentKeys.length - 2 > 0 ? currentKeys.length - 2 : 0} Rakip`;
                            this.enterMatchRoom(this.matchId, oppText);
                        }
                    });
                });
            }).catch(err => {
                if (window.showToastNotification) window.showToastNotification("BaÄŸlantÄ± sÄ±rasÄ±nda hata oluÅŸtu!");
                if (window.announceToScreenReader) window.announceToScreenReader("BaÄŸlantÄ± sÄ±rasÄ±nda hata oluÅŸtu!", true);
                if (btn) {
                    btn.innerHTML = 'KatÄ±l';
                    btn.style.pointerEvents = 'auto';
                }
            });

        }).catch(err => {
            console.error(err);
            if (window.showToastNotification) window.showToastNotification("Sunucuya eriÅŸilemiyor veya yetkiniz yok!");
            if (window.announceToScreenReader) window.announceToScreenReader("Sunucuya eriÅŸilemiyor veya yetkiniz yok!", true);
            if (btn) {
                btn.innerHTML = 'KatÄ±l';
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

        // --- YENÄ° EKLENEN KÄ°LÄ°T: PvP ZamanlayÄ±cÄ±sÄ±nÄ± GÃ¼venle Kapat ---
        if (this.pvpInterval) {
            clearInterval(this.pvpInterval);
            this.pvpInterval = null;
        }
        // -------------------------------------------------------------

        if (this.matchId) {
            if (window.arenaLeaveSound) window.arenaLeaveSound.play();
            if (this.isHost) {
                // Kurucu Ã§Ä±karsa odayÄ± tamamen kapat
                window.db.ref('matches/' + this.matchId).update({ status: 'finished', hostFinished: true, clientFinished: true });
                if (this.isBotMode) window.db.ref('matches/' + this.matchId).remove();
            } else {
                // Ä°stemci Ã§Ä±karsa sadece kendini odadan sil (DiÄŸerleri oynamaya devam edebilsin)
                window.db.ref('matches/' + this.matchId + '/clients/' + this.myQueueId).remove();
            }
            this.matchId = null;
        }

        if (this.matchRef && !this.isBotMode) this.matchRef.off();
        if (this.myQueueId && !this.isBotMode) window.db.ref('pvp_queue/' + this.myQueueId).remove();

        this.isBotMode = false;
        this.matchStarted = false;

        const btn = document.getElementById('pvp-play-btn');
        if (btn) {
            btn.innerHTML = 'MaÃ§ OluÅŸtur';
            btn.setAttribute('aria-label', 'MaÃ§ OluÅŸtur. Ä°ÅŸlem iptal edildi.');
            btn.style.pointerEvents = 'auto'; // Re-enable pointer events
        }

        const botBtn = document.getElementById('pve-bot-play-btn');
        if (botBtn) {
            botBtn.innerHTML = 'Bota KarÅŸÄ± Oyna';
            botBtn.setAttribute('aria-label', 'Bota KarÅŸÄ± Oyna. EÅŸleÅŸtirme iptal edildi.');
            botBtn.style.pointerEvents = 'auto'; // Re-enable pointer events
        }

        const cancelBtn = document.getElementById('pvp-lobby-cancel-btn');
        if (cancelBtn) cancelBtn.style.pointerEvents = 'auto';

        if (window.announceToScreenReader) window.announceToScreenReader("EÅŸleÅŸtirme iptal edildi.");
    },

    enterMatchRoom: function (mappedMatchId, oppName) {
        // Ä°stemci isek sunucudaki odayÄ± gÃ¼venceye alalÄ±m
        if (!this.isHost && !this.isBotMode) {
            window.db.ref('matches/' + this.matchId).onDisconnect().update({ status: 'finished', clientFinished: true });
        }

        if (window.music38Sound && window.music38Sound.playing()) window.music38Sound.stop();
        if (window.correctSound) window.correctSound.play();

        let anonsMesaji = this.isBotMode ?
            "Bot lobiye giriÅŸ yaptÄ±. KÄ±sa sÃ¼re sonra oyuna baÅŸlayacaksÄ±nÄ±z." :
            `Oyuncu oyuna giriÅŸ yaptÄ±. EÅŸleÅŸme bulundu! Rakibiniz: ${oppName}. KÄ±sa sÃ¼re sonra oyuna baÅŸlayacaksÄ±nÄ±z.`;

        if (window.announceToScreenReader) window.announceToScreenReader(anonsMesaji, true);

        const statusText = document.getElementById('pvp-lobby-status-text');
        const infoText = document.getElementById('pvp-lobby-info-text');
        if (statusText) statusText.innerText = "EÅŸleÅŸme Bulundu!";
        if (infoText) infoText.innerText = anonsMesaji;
        
        const btn = document.getElementById('pvp-lobby-cancel-btn');
        if (btn) btn.style.pointerEvents = 'none'; // Prevent cancelling when starting
        
        let secondsLeft = 3;
        if (statusText) statusText.innerText = "MaÃ§ BaÅŸlÄ±yor: " + secondsLeft;
        
        let countdownTimer = setInterval(() => {
            secondsLeft--;
            if (secondsLeft > 0) {
                if (statusText) statusText.innerText = "MaÃ§ BaÅŸlÄ±yor: " + secondsLeft;
            } else {
                clearInterval(countdownTimer);
            }
        }, 1000);

        // Bekletip oyunu baÅŸlat
        this.lobbyWaitTimer = setTimeout(() => {
            if (!this.matchId) return; // Ä°ÅŸlem kullanÄ±cÄ± tarafÄ±ndan iptal edildiyse dur
            const resetBtn = document.getElementById('pvp-play-btn');
            if (resetBtn) {
                resetBtn.innerHTML = 'MaÃ§ OluÅŸtur';
                resetBtn.setAttribute('aria-label', 'MaÃ§ OluÅŸtur');
                resetBtn.style.pointerEvents = 'auto';
            }
            const resetBotBtn = document.getElementById('pve-bot-play-btn');
            if (resetBotBtn) {
                resetBotBtn.innerHTML = 'Bota KarÅŸÄ± Oyna';
                resetBotBtn.setAttribute('aria-label', 'Bota KarÅŸÄ± Oyna');
                resetBotBtn.style.pointerEvents = 'auto';
            }

            if (window.switchMenu && window.gameMenu) {
                let activeMultiMenu = window.pvpLobbyMenu;
                window.switchMenu(activeMultiMenu, window.gameMenu, 'game');
            }
            this.startPvPGame();
            this.lobbyWaitTimer = null;
        }, 3000);
    },

    // BOTA KARÅI OYNA (YAPAY ZEKA) BAÅLANGICI
    startBotMatch: function () {
        let deviceId = localStorage.getItem('hafizaGuvenDeviceId') || 'guest_' + Date.now();
        let myName = window.currentChatUser || localStorage.getItem('chatUsername') || "Sen";

        this.isSearching = true; // Bot arÄ±yormuÅŸ gibi hissettir
        this.isHost = true;
        this.isBotMode = true;

        if (window.switchMenu && window.multiplayerSelectMenu && window.pvpLobbyMenu) {
            window.switchMenu(window.multiplayerSelectMenu, window.pvpLobbyMenu, 'pvp-lobby');
            const statusText = document.getElementById('pvp-lobby-status-text');
            const infoText = document.getElementById('pvp-lobby-info-text');
            if (statusText) statusText.innerText = "Bot AranÄ±yor...";
            if (infoText) infoText.innerText = "Uygun bir yapay zeka rakibi aranÄ±yor. LÃ¼tfen bekleyin.";
            const modeContainer = document.getElementById('pvp-lobby-mode-container');
            if (modeContainer) modeContainer.style.display = 'none';
        }
        if (window.announceToScreenReader) window.announceToScreenReader("Uygun bir yapay zeka rakibi aranÄ±yor. LÃ¼tfen bekleyin.");

        if (window.bgMusic && window.bgMusic.playing()) window.bgMusic.pause();
        if (window.music38Sound && !window.music38Sound.playing()) window.music38Sound.play();

        // Ortalama 12-16 saniye arasÄ± yapay bekleme sÃ¼resi
        let waitTime = Math.floor(Math.random() * 4000) + 12000;

        this.botQueueTimer = setTimeout(() => {
            if (!this.isSearching) return; // KullanÄ±cÄ± beklerken odayÄ± terkettiyse iÅŸlemi kes

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

        // Ortalama Zeka Denklemi: NotalarÄ± Dinleme SÃ¼resi (turnIndex * 1000) + Notalara Basma SÃ¼resi (turnIndex * 400) + Reaksiyon Gecikmesi (500-2500ms arasÄ±)
        const reactTime = (turnIndex * 1000) + (turnIndex * 400) + (Math.floor(Math.random() * 2000) + 500);

        this.botTimeout = setTimeout(() => {
            if (!window.gameIsActive || !this.matchId) return;

            // %15 Ä°htimalle Bot Hata Yapar (KafasÄ± KarÄ±ÅŸÄ±r / YavaÅŸlar)
            if (Math.random() < 0.15) {
                // ÅaÅŸkÄ±nlÄ±k yaÅŸasÄ±n, puanÄ± alamasÄ±n, ancak bir sÃ¼re sonra toparlanÄ±p sonraki tura geÃ§sin.
                setTimeout(() => { if (window.gameIsActive) this.simulateBotTurn(turnIndex + 1); }, 2500);
                return;
            }

            // Bot hÄ±z testini kazandÄ± mÄ± diye Firebase'e istek at (Ä°nsanÄ±n karÅŸÄ±sÄ±na rakip Ã§Ä±kÄ±yor)
            const turnRef = window.db.ref(`matches/${this.matchId}/turns/${turnIndex}`);
            turnRef.transaction((currentData) => {
                if (currentData === null) {
                    return { winner: 'client', timestamp: firebase.database.ServerValue.TIMESTAMP }; // Bot her zaman client listesinde
                }
                return; // Tur Ã§oktan insan tarafÄ±ndan kapÄ±lmÄ±ÅŸ 
            }, (error, committed, snapshot) => {
                if (committed) {
                    // Bot bu turun puanÄ±nÄ± aldÄ±
                    this.botScore += 10;
                    window.db.ref('matches/' + this.matchId).update({ clientScore: this.botScore });
                }
                // Ä°nsan kazanmÄ±ÅŸ da olsa, Bot kazanmÄ±ÅŸ da olsa Bot oyuna devam eder ve sonraki turu dinlemeye baÅŸlar
                this.simulateBotTurn(turnIndex + 1);
            });

        }, reactTime);
    },

    startPvPGame: function () {
        if (!this.matchId) return;
        console.log("PvP Modu: 60 saniye baÅŸladÄ±!");

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

        // KURAL 1: SÃ¼re 60 saniye olacak. (Offline resetlemeleri Ã¶nlemek iÃ§in Ã¶zel bayrak kullanacaÄŸÄ±z)
        window.gameTimer = 60;
        if (window.updateGameUI) window.updateGameUI();
        if (window.announceToScreenReader) window.announceToScreenReader("Oyun baÅŸladÄ±. Kural 1: SÃ¼reniz 60 saniye! Birebir modda sÃ¼reniz her tur yenilenmez. Notalar aynÄ±dÄ±r, rakip duyulmaz. Bol ÅŸans!");

        const matchNode = window.db.ref('matches/' + this.matchId);

        // Host ve Client oyuna aynÄ± anda baÅŸlar (Kural 2: Herkese aynÄ± anda tam olarak aynÄ± dizi gidecek)
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
                // EÄŸer tam dizi (fullSequence) geldiyse al ve ilk raundu baÅŸlat
                if (val.fullSequence && !this.fullSequence) {
                    this.fullSequence = val.fullSequence;
                    this.currentPvPTurn = 1;

                    // Ä°lk raundu baÅŸlat
                    if (window.gameSequence.length === 0) {
                        this.playNextPvPRound();
                        if (this.isBotMode) {
                            this.simulateBotTurn(1); // Botun zeka dÃ¶ngÃ¼sÃ¼nÃ¼ 1. turdan tetikle
                        }
                    }
                }

                // KarÅŸÄ± tarafÄ±n puanÄ±nÄ± ekrana yansÄ±tmak iÃ§in
                let myScoreStr = "";
                let oppScoreStr = "";
                let dId = localStorage.getItem('hafizaGuvenDeviceId');
                this.matchMode = val.mode || 'individual';

                if (this.matchMode === 'team') {
                    if (this.isHost) {
                        this.myTeam = 'team_a';
                    } else {
                        if (val.clients) {
                            let sortedClients = Object.keys(val.clients).sort();
                            let idx = sortedClients.indexOf(dId);
                            this.myTeam = (idx % 2 === 0) ? 'team_b' : 'team_a';
                        } else {
                            this.myTeam = 'team_b';
                        }
                    }
                    let tAScore = val.team_aScore || 0;
                    let tBScore = val.team_bScore || 0;
                    let myTeamScore = this.myTeam === 'team_a' ? tAScore : tBScore;
                    let oppTeamScore = this.myTeam === 'team_a' ? tBScore : tAScore;
                    
                    myScoreStr = `TakÄ±mÄ±n: ${myTeamScore}`;
                    oppScoreStr = ` | KarÅŸÄ± TakÄ±m: ${oppTeamScore}`;
                } else {
                    myScoreStr = `Sen: ${window.pvpScore}`;
                    oppScoreStr = ` | Rakipler: `;
                    
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
                }
                
                // HUD GÃ¼ncelle
                const scoreDisplay = document.getElementById('game-score-display');
                if (scoreDisplay) {
                    scoreDisplay.style.fontSize = '1.0rem'; // Ã‡oklu isimler sÄ±ÄŸsÄ±n
                    scoreDisplay.innerHTML = `${myScoreStr}${oppScoreStr}`;
                }

                // SÃ¼reyi Hosttan Al (Ä°stemci Senkronizasyonu)
                if (val && val.timeLeft !== undefined && !this.isHost) {
                    window.gameTimer = val.timeLeft;
                    if (window.updateGameUI) window.updateGameUI();
                    if (window.gameTimer <= 0) {
                        this.finishMatchTimeUp();
                    }
                }
            }

            if (val && val.status === 'finished') {
                this.endPvPGame(val);
                matchNode.off('value', listener);
            }
        });


        // 60 Saniyelik KatÄ± Kronometre
        if (this.isHost) {
            this.pvpInterval = window.hgfzZamanlayici.setInterval(() => {
                window.gameTimer--;
                window.db.ref('matches/' + this.matchId).update({ timeLeft: window.gameTimer });
                
                if (window.gameTimer <= 0) {
                    window.gameTimer = 0;
                    clearInterval(this.pvpInterval);
                    this.finishMatchTimeUp();
                }
                if (window.updateGameUI) window.updateGameUI();
            }, 1000);
        }
    },

    playNextPvPRound: function () {
        if (!window.gameIsActive) return;
        window.playerSequence = [];
        window.isComputerPlaying = true;

        // Ortak notalarÄ± kes (Firebase'den alÄ±nan 100'lÃ¼k seed'den yararlanÄ±r)
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

        // HÄ±z YarÄ±ÅŸÄ± DoÄŸrulamasÄ± (Kural: Kim hÄ±zlÄ±ysa puanÄ± o alÄ±r)
        const turnRef = window.db.ref(`matches/${this.matchId}/turns/${turnIndex}`);

        turnRef.transaction((currentData) => {
            if (currentData === null) {
                // Bu turu (turnIndex) henÃ¼z kimse geÃ§memiÅŸ, benim adÄ±ma yaz
                return {
                    winner: this.isHost ? 'host' : dId,
                    team: this.matchMode === 'team' ? (this.myTeam || 'none') : 'individual',
                    timestamp: firebase.database.ServerValue.TIMESTAMP
                };
            }
            // Tur daha Ã¶nce kapÄ±lmÄ±ÅŸ! Ä°ÅŸlemi iptal et (puan yok)
            return;
        }, (error, committed, snapshot) => {
            if (error) {
                console.log("Turn transaction failed", error);
            } else if (committed) {
                if (this.matchMode === 'team') {
                    const matchNode = window.db.ref('matches/' + this.matchId);
                    matchNode.child(this.myTeam + 'Score').transaction(s => (s || 0) + 10);
                    if (window.announceToScreenReader) window.announceToScreenReader("TakÄ±mÄ±nÄ±za 10 puan kazandÄ±rdÄ±nÄ±z!");
                } else {
                    window.pvpScore += 10;
                    if (window.announceToScreenReader) window.announceToScreenReader("Puan senin!");

                    const matchNode = window.db.ref('matches/' + this.matchId);
                    let updateData = {};
                    if (this.isHost) {
                        updateData.hostScore = window.pvpScore;
                    } else {
                        updateData[`clients/${dId}/score`] = window.pvpScore;
                    }
                    matchNode.update(updateData);
                }
            } else {
                if (window.announceToScreenReader) window.announceToScreenReader("GeÃ§ kaldÄ±n, puanÄ± baÅŸkasÄ± aldÄ±!");
            }
        });

        this.currentPvPTurn++;
        this.playNextPvPRound();
        // Kural 1 GereÄŸi SÃ¼reyi SÄ±fÄ±rlama!
        // (AÅŸaÄŸÄ±da monkey patch ile korunan gameTimer devam edecek)
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
        if (!this.matchId || this.gameEndingBlock) return; // Ã‡ift Ã¶dÃ¼l zaafiyetini engelle
        this.gameEndingBlock = true;

        clearInterval(this.pvpInterval);
        if (this.botTimeout) clearTimeout(this.botTimeout);

        // EÄŸer oyun henÃ¼z baÅŸlamadan iptal edildiyse (10 sn lobi sÄ±rasÄ±nda), Ã¶dÃ¼l sistemini atla
        if (!this.matchStarted) {
            if (this.lobbyWaitTimer) {
                clearTimeout(this.lobbyWaitTimer);
                this.lobbyWaitTimer = null;
            }
            if (window.bgMusic && !window.bgMusic.playing() && window.currentActiveMenu !== 'game' && window.currentActiveMenu !== 'story') window.bgMusic.play();

            const btn = document.getElementById('pvp-play-btn');
            if (btn) {
                btn.innerHTML = 'MaÃ§ OluÅŸtur';
                btn.style.pointerEvents = 'auto';
            }

            this.matchId = null;
            this.isBotMode = false;
            this.matchStarted = false;
            this.gameEndingBlock = false;
            if (window.announceToScreenReader) window.announceToScreenReader("Rakip lobiden ayrÄ±ldÄ±, maÃ§ iptal edildi.");

            // EÄŸer lobide veya multiplayer menÃ¼lerindeyse, ana menÃ¼ye atmak iÃ§in tetikleyici
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

        if (matchData.mode === 'team' && this.myTeam) {
            myScore = matchData[this.myTeam + 'Score'] || 0;
            let oppTeam = this.myTeam === 'team_a' ? 'team_b' : 'team_a';
            highestOppScore = matchData[oppTeam + 'Score'] || 0;
        } else {
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
        }

        let msg = `Oyun Bitti! Senin PuanÄ±n: ${myScore}, En YÃ¼ksek Rakip PuanÄ±: ${highestOppScore}. `;
        let isWinner = false;

        if (myScore > highestOppScore) {
            isWinner = true;
            msg += "KazandÄ±n! ";

            // Kazanan iÃ§in Rastgele Ã–dÃ¼l Ã‡ekiliÅŸi (3 Ä°htimal)
            const rewardRNG = Math.floor(Math.random() * 3);
            if (rewardRNG === 0) {
                let zk = parseInt(localStorage.getItem('hafizaGuvenZamanKorumasi')) || 0;
                localStorage.setItem('hafizaGuvenZamanKorumasi', zk + 2);
                msg += "BÃ¼yÃ¼k Ã–dÃ¼l: 2 Zaman KorumasÄ± kazandÄ±n!";
            } else if (rewardRNG === 1) {
                let hk = parseInt(localStorage.getItem('hafizaGuvenHataKorumasi')) || 0;
                localStorage.setItem('hafizaGuvenHataKorumasi', hk + 2);
                msg += "BÃ¼yÃ¼k Ã–dÃ¼l: 2 Hata KorumasÄ± kazandÄ±n!";
            } else {
                let coins = parseInt(localStorage.getItem('hafizaGuvenTotalTokens')) || 0;
                let reward = 100;
                if (window.isWeekendDoubleCoins && window.isWeekendDoubleCoins()) { reward *= 2; msg += " (Ã‡ift Jeton EtkinliÄŸi!) "; }
                localStorage.setItem('hafizaGuvenTotalTokens', coins + reward);
                msg += `BÃ¼yÃ¼k Ã–dÃ¼l: ${reward} HafÄ±za Jetonu kazandÄ±n!`;
            }
        } else if (myScore < highestOppScore) {
            msg += "Kaybettin. ";
            let coins = parseInt(localStorage.getItem('hafizaGuvenTotalTokens')) || 0;
            let reward = 20;
            if (window.isWeekendDoubleCoins && window.isWeekendDoubleCoins()) { reward *= 2; msg += " (Ã‡ift Jeton!) "; }
            localStorage.setItem('hafizaGuvenTotalTokens', coins + reward);
            msg += `Teselli Ã–dÃ¼lÃ¼: ${reward} HafÄ±za Jetonu kazandÄ±n.`;
        } else {
            msg += "Berabere! ";
            let coins = parseInt(localStorage.getItem('hafizaGuvenTotalTokens')) || 0;
            let reward = 20;
            if (window.isWeekendDoubleCoins && window.isWeekendDoubleCoins()) { reward *= 2; msg += " (Ã‡ift Jeton!) "; }
            localStorage.setItem('hafizaGuvenTotalTokens', coins + reward);
            msg += `Teselli Ã–dÃ¼lÃ¼: ${reward} HafÄ±za Jetonu kazandÄ±n.`;
        }

        if (window.announceToScreenReader) window.announceToScreenReader(msg);

        setTimeout(() => {
            // PVP'DE Ã‡Ä°FTE Ã–DÃœL ENFLASYONUNU ENGELLEME KÄ°LÄ°DÄ°
            window.sessionTokens = 0;

            if (window.endMainGame) window.endMainGame(true, isWinner, false);

            // VeritabanÄ± ÅiÅŸmesini (Database Spam) Engellemek Ä°Ã§in Bot MaÃ§larÄ±nÄ± Sil
            if (this.isBotMode && this.matchId) {
                window.db.ref('matches/' + this.matchId).remove();
            }

            this.matchId = null; // SÄ±fÄ±rla
            this.isBotMode = false;
            this.gameEndingBlock = false;
            this.matchStarted = false;
            this.isSearching = false;
            this.isHost = false;
            
            const resetBtn = document.getElementById('pvp-play-btn');
            if (resetBtn) resetBtn.setAttribute('aria-label', 'MaÃ§ OluÅŸtur');
            const resetBotBtn = document.getElementById('pve-bot-play-btn');
            if (resetBotBtn) resetBotBtn.setAttribute('aria-label', 'Bota KarÅŸÄ± Oyna');
        }, 6000);
    }
};

// --- GÃœVENLÄ° KANCALAR (MONKEY PATCHING) ---
// game.js iÃ§erisindeki orijinal Ã§evrimdÄ±ÅŸÄ± (offline) fonksiyonlarÄ± bozmadan PVP KurallarÄ±nÄ± (Ã–zellikle Kural 1: 60 Saniye) dayatÄ±yoruz.

const originalHandleGameInput = window.handleGameInput;
window.handleGameInput = function (key) {
    if (window.PvP && window.PvP.matchId) {
        let cachedTimer = window.gameTimer; // KURAL 1: 60 saniyelik zamanÄ± korumaya al (Offline oyun her doÄŸru tuÅŸta 30sn'ye sÄ±fÄ±rlar, bunu engelliyoruz)
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
        // Ortak dizilim (fullSequence) kullanÄ±ldÄ±ÄŸÄ± iÃ§in offline nota Ã¼reticisini kullanmÄ±yoruz
    } else {
        originalAddNewNote();
    }
};

const originalEndMainGame = window.endMainGame;
window.endMainGame = function (isTimeUp = false, isWin = false, isUserExit = false) {
    if (window.PvP && window.PvP.matchId && isUserExit) {
        window.PvP.finishMatchTimeUp(); // Sunucuya Ã¶ldÃ¼ÄŸÃ¼mÃ¼zÃ¼ / bittiÄŸini haber ver
    }
    if (originalEndMainGame) originalEndMainGame(isTimeUp, isWin, isUserExit);
};

document.addEventListener('DOMContentLoaded', () => {
    const btnInd = document.getElementById('pvp-mode-individual-btn');
    const btnTeam = document.getElementById('pvp-mode-team-btn');
    
    if (btnInd) {
        btnInd.addEventListener('click', () => {
            if (!window.PvP || !window.PvP.isHost || !window.PvP.matchId) return;
            window.PvP.matchMode = 'individual';
            btnInd.style.background = '#ffb703'; btnInd.style.color = '#000';
            btnTeam.style.background = ''; btnTeam.style.color = '';
            window.db.ref('matches/' + window.PvP.matchId).update({ mode: 'individual' });
            if (window.announceToScreenReader) window.announceToScreenReader("Oyun Modu: Bireysel olarak ayarlandÄ±.");
        });
    }
    
    if (btnTeam) {
        btnTeam.addEventListener('click', () => {
            if (!window.PvP || !window.PvP.isHost || !window.PvP.matchId) return;
            window.PvP.matchMode = 'team';
            btnTeam.style.background = '#ffb703'; btnTeam.style.color = '#000';
            btnInd.style.background = ''; btnInd.style.color = '';
            window.db.ref('matches/' + window.PvP.matchId).update({ mode: 'team' });
            if (window.announceToScreenReader) window.announceToScreenReader("Oyun Modu: TakÄ±m Modu olarak ayarlandÄ±.");
        });
    }
});
