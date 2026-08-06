const SAVE_KEY = 'futbol_manager_save_v1';

// Oyunu Kaydet
function saveGame(autoSave = false) {
    if (!window.league) return;

    try {
        const saveData = {
            teams: window.league.teams,
            leagueTable: window.leagueTable,
            fixture: window.fixture,
            currentMatchIndex: window.league.currentMatchIndex,
            userTeamId: window.league.userTeamId,
            consecutiveLosses: window.consecutiveLosses || 0,
            consecutiveWins: window.consecutiveWins || 0,
            teamConfidence: window.teamConfidence !== undefined ? window.teamConfidence : 100,
            players: window.leagueData.players, // BÜTÜN OYUNCU BİLGİLERİ (GELİŞİMLER, TRANSFERLER)
            leagueDataTeams: window.leagueData.teams,
            boardTrust: window.boardTrust,
            seasonObjective: window.seasonObjective,
            currentFormation: window.currentFormation,
            cornerStrategy: window.cornerStrategy || 'auto',
            freekickStrategy: window.freekickStrategy || 'auto',
            cornerDefenseStrategy: window.cornerDefenseStrategy || 'auto',
            throwinStrategy: window.throwinStrategy || 'auto',
            
            // --- EKLENEN ZAMAN (TAKVİM) DEĞİŞKENLERİ ---
            currentWeek: window.currentWeek,
            currentTimestamp: window.currentTimestamp,
            currentMonth: window.currentMonth,
            currentDay: window.currentDay,
            currentYear: window.currentYear,
            currentDayOfWeek: window.currentDayOfWeek,
            totalDaysPassed: window.totalDaysPassed,
            isPreSeason: window.isPreSeason,
            season: window.season || 1,
            eventQueue: window.eventQueue || [],
            newspaperQueue: window.newspaperQueue || [],
            psychologyQueue: window.psychologyQueue || [],
            pendingDrawNews: window.pendingDrawNews || false,
            financialCrisisEvent: window.financialCrisisEvent || null,
            pressConferenceDoneThisWeek: window.pressConferenceDoneThisWeek || false,
            preSeasonDay: window.preSeasonDay,
            
            pendingTransfers: window.pendingTransfers || [],
            scheduledFriendly: window.scheduledFriendly || null,
            presidentProfile: window.presidentProfile || 'project',
            presidentConfidence: window.presidentConfidence !== undefined ? window.presidentConfidence : 50,
            fanSupport: window.fanSupport !== undefined ? window.fanSupport : 50,
            bankruptcyDays: window.bankruptcyDays || 0,
            managerAuthority: window.managerAuthority !== undefined ? window.managerAuthority : 50,
            managerProfile: window.managerProfile || 'tarafsiz',
            managerStats: window.managerStats || { defensiveMinutes: 0, passingMinutes: 0, youngPlayerMinutes: 0, comebackWins: 0, crisisAvertedCount: 0 },
            usedNews: window.usedNews || [],
            usedDynamicEvents: window.usedDynamicEvents || [],
            scoutProfile: window.scoutProfile || null,
            fitnessCoachProfile: window.fitnessCoachProfile || null,
            medicalProfile: window.medicalProfile || null,
            mentalCoachProfile: window.mentalCoachProfile || null,
            clubCultureProfile: window.clubCultureProfile || null,
            myYouthCoach: window.myYouthCoach || null,
            youthAcademy: window.youthAcademy || [],
            graduatedPlayers: window.graduatedPlayers || [],
            coachesPool: window.coachesPool || [],
            championsLeague: window.championsLeague ? {
                isActive: window.championsLeague.isActive,
                isGroupStageFinished: window.championsLeague.isGroupStageFinished,
                leagueTable: window.championsLeague.leagueTable,
                fixtures: window.championsLeague.fixtures,
                currentMatchDay: window.championsLeague.currentMatchDay,
                knockoutStage: window.championsLeague.knockoutStage,
                knockoutFixtures: window.championsLeague.knockoutFixtures,
                knockoutWinners: window.championsLeague.knockoutWinners,
                championId: window.championsLeague.championId
            } : null
        };
        const jsonString = JSON.stringify(saveData);
        window.cloudSaveDataString = jsonString;
        window.hasCloudSave = true;

        if (window.db && window.userId) {
            let uploadData;
            // Eğer lz-string yüklendiyse SIKIŞTIR
            if (typeof LZString !== 'undefined') {
                const compressed = LZString.compressToBase64(jsonString);
                uploadData = { compressed: compressed, timestamp: Date.now(), compressedFormat: true };
            } else {
                uploadData = saveData; // Yüklenmediyse normal kaydet (fallback)
            }

            window.db.ref('futbol_menajer/saves/' + window.userId).set(uploadData).then(() => {
                if (!autoSave) {
                    if(typeof playSound === 'function' && typeof enterSound !== 'undefined') playSound(enterSound);
                    if(typeof speak === 'function') speak("Kariyeriniz buluta başarıyla kaydedildi.");
                }
            }).catch(e => {
                console.error("Bulut kayıt hatası:", e);
                if (!autoSave) alert("Buluta kaydedilemedi. İnternet bağlantınızı kontrol edin.");
                if(typeof speak === 'function' && !autoSave) speak("Buluta kaydedilemedi. İnternet bağlantınızı kontrol edin.");
            });
        } else {
            if (!autoSave) {
                alert("Bulut bağlantısı yok! Lütfen internetinizi kontrol edip tekrar deneyin.");
                if(typeof speak === 'function') speak("Bulut bağlantısı yok! İnternetinizi kontrol edin.");
            }
        }
        
    } catch (e) {
        console.error("Kayıt verisi oluşturma hatası:", e);
        if (!autoSave) alert("Kaydedilemedi: " + e.message);
        if (typeof speak === 'function' && !autoSave) speak("Oyun kaydedilirken bir hata oluştu.");
    }
}

// Kaydı Yükle
function loadGame() {
    try {
        let savedDataString = window.cloudSaveDataString;
        if (savedDataString) {
            const savedData = JSON.parse(savedDataString);
            
            // Eğer league.js içindeki objemiz yoksa oluşturalım
            if (!window.league) window.league = {};
            
            window.league.teams = savedData.teams;
            window.leagueTable = savedData.leagueTable || window.leagueTable;
            window.fixture = savedData.fixture || window.fixture;
            window.league.currentMatchIndex = savedData.currentMatchIndex;
            window.league.userTeamId = savedData.userTeamId;
            window.consecutiveLosses = savedData.consecutiveLosses;
            window.teamConfidence = savedData.teamConfidence;
            
            // Oyuncuları veri tabanına yaz
            if (!window.leagueData) window.leagueData = { teams: [], players: [] };
            if (savedData.players) {
                window.leagueData.players = savedData.players;
                // Yeni sistem: Yüklenen oyuncularda morale yoksa varsayılan 75 ver
                window.leagueData.players.forEach(p => {
                    if (p.morale === undefined) p.morale = 75;
                });
            }
            if (savedData.leagueDataTeams) {
                window.leagueData.teams = savedData.leagueDataTeams;
            }
            
            // Anti-NaN Save Sanitizer (Bozuk none/NaN bütçe ve güçleri düzeltir)
            if (window.leagueData && window.leagueData.teams) {
                window.leagueData.teams.forEach(t => {
                    if (isNaN(t.budget) || t.budget === null || t.budget === undefined) t.budget = Math.floor(Math.random() * 20000000) + 10000000;
                });
            }
            if (window.leagueData && window.leagueData.players) {
                window.leagueData.players.forEach(p => {
                    if (isNaN(p.power) || p.power === null || p.power === undefined) p.power = 75;
                });
            }

            // --- ZAMAN (TAKVİM) DEĞİŞKENLERİNİ YÜKLE ---
            // Geriye dönük uyumluluk: Eğer yeni değişkende yoksa, window.league (eski save) objesinden bak, o da yoksa 1 yap
            window.currentWeek = savedData.currentWeek !== undefined ? savedData.currentWeek : (window.league.currentWeek || 1);
            
            if (savedData.currentTimestamp !== undefined) window.currentTimestamp = savedData.currentTimestamp;
            if (savedData.currentMonth !== undefined) window.currentMonth = savedData.currentMonth;
            if (savedData.currentDay !== undefined) window.currentDay = savedData.currentDay;
            if (savedData.currentYear !== undefined) window.currentYear = savedData.currentYear;
            if (savedData.currentDayOfWeek !== undefined) window.currentDayOfWeek = savedData.currentDayOfWeek;
            if (savedData.totalDaysPassed !== undefined) window.totalDaysPassed = savedData.totalDaysPassed;
            
            if (savedData.isPreSeason !== undefined) window.isPreSeason = savedData.isPreSeason;
            if (savedData.season !== undefined) window.season = savedData.season;
            if (savedData.eventQueue !== undefined) window.eventQueue = savedData.eventQueue;
            if (savedData.newspaperQueue !== undefined) window.newspaperQueue = savedData.newspaperQueue;
            if (savedData.psychologyQueue !== undefined) window.psychologyQueue = savedData.psychologyQueue;
            if (savedData.pendingDrawNews !== undefined) window.pendingDrawNews = savedData.pendingDrawNews;
            if (savedData.financialCrisisEvent !== undefined) window.financialCrisisEvent = savedData.financialCrisisEvent;
            if (savedData.pressConferenceDoneThisWeek !== undefined) window.pressConferenceDoneThisWeek = savedData.pressConferenceDoneThisWeek;
            if (savedData.preSeasonDay !== undefined) window.preSeasonDay = savedData.preSeasonDay;
            if (savedData.boardTrust !== undefined) window.boardTrust = savedData.boardTrust;
            if (savedData.seasonObjective) window.seasonObjective = savedData.seasonObjective;
            if (savedData.currentFormation) window.currentFormation = savedData.currentFormation || '4-4-2';
            
            window.cornerStrategy = savedData.cornerStrategy || 'auto';
            window.freekickStrategy = savedData.freekickStrategy || 'auto';
            window.cornerDefenseStrategy = savedData.cornerDefenseStrategy || 'auto';
            window.throwinStrategy = savedData.throwinStrategy || 'auto';
            
            if (savedData.pendingTransfers) window.pendingTransfers = savedData.pendingTransfers;
            if (savedData.scheduledFriendly !== undefined) window.scheduledFriendly = savedData.scheduledFriendly;
            
            if (savedData.presidentProfile) window.presidentProfile = savedData.presidentProfile;
            if (savedData.presidentConfidence !== undefined) window.presidentConfidence = savedData.presidentConfidence;
            if (savedData.fanSupport !== undefined) window.fanSupport = savedData.fanSupport;
            if (savedData.bankruptcyDays !== undefined) window.bankruptcyDays = savedData.bankruptcyDays;
            if (savedData.managerAuthority !== undefined) window.managerAuthority = savedData.managerAuthority;
            if (savedData.managerProfile) window.managerProfile = savedData.managerProfile;
            if (savedData.managerStats) window.managerStats = savedData.managerStats;
            else window.managerStats = { defensiveMinutes: 0, passingMinutes: 0, youngPlayerMinutes: 0, comebackWins: 0, crisisAvertedCount: 0 };
            if (savedData.usedNews) window.usedNews = savedData.usedNews;
            else window.usedNews = [];
            if (savedData.usedDynamicEvents) window.usedDynamicEvents = savedData.usedDynamicEvents;
            else window.usedDynamicEvents = [];
            
            if (savedData.scoutProfile) window.scoutProfile = savedData.scoutProfile;
            if (savedData.fitnessCoachProfile) window.fitnessCoachProfile = savedData.fitnessCoachProfile;
            if (savedData.medicalProfile) window.medicalProfile = savedData.medicalProfile;
            if (savedData.mentalCoachProfile) window.mentalCoachProfile = savedData.mentalCoachProfile;
            if (savedData.clubCultureProfile) window.clubCultureProfile = savedData.clubCultureProfile;
            
            if (savedData.myYouthCoach) window.myYouthCoach = savedData.myYouthCoach;
            if (savedData.youthAcademy) window.youthAcademy = savedData.youthAcademy;
            if (savedData.graduatedPlayers) window.graduatedPlayers = savedData.graduatedPlayers;
            if (savedData.coachesPool) window.coachesPool = savedData.coachesPool;
            
            if (savedData.championsLeague && window.championsLeague) {
                window.championsLeague.isActive = savedData.championsLeague.isActive;
                window.championsLeague.isGroupStageFinished = savedData.championsLeague.isGroupStageFinished;
                window.championsLeague.leagueTable = savedData.championsLeague.leagueTable || [];
                window.championsLeague.fixtures = savedData.championsLeague.fixtures || [];
                window.championsLeague.currentMatchDay = savedData.championsLeague.currentMatchDay || 0;
            }
            
            // Global değişkenleri ve referansları yeniden bağla
            window.myTeamId = window.league.userTeamId;
            if (window.leagueData) {
                window.leagueData.userTeamId = window.myTeamId;
            }
            window.myTeam = window.leagueData.teams.find(t => t.id === window.myTeamId);
            
            // Bütçe Senkronizasyonu (Genel kasa ile kulüp kasasını eşitle)
            if (window.myTeam) {
                window.budget = window.myTeam.budget;
            } else {
                window.budget = 0;
            }
            
            // Transfer UI ID'sini de güncelle
            if (typeof userTeamIdForTransfer !== 'undefined') {
                userTeamIdForTransfer = window.myTeamId;
            }
            
            // UI Güncellemeleri
            if (typeof updateBudgetUI === 'function') updateBudgetUI();
            if (typeof renderStandings === 'function') renderStandings();
            
            if(typeof playSound === 'function' && typeof enterSound !== 'undefined') playSound(enterSound);
            if(typeof speak === 'function') speak("Kariyerinize kaldığınız yerden devam ediyorsunuz.");
            
            // Ana menüye atla
            if(typeof showContainer === 'function') showContainer('main-menu-container');
            
            return true;
        } else {
            alert("Herhangi bir kayıtlı kariyer bulunamadı! Lütfen 'Yeni Kariyer' butonuna tıklayarak yeni bir oyuna başlayın.");
            return false;
        }
    } catch (e) {
        console.error("Yükleme hatası:", e);
        // Hatayı otomatik olarak panoya kopyala
        if (navigator && navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText("Kariyer Yükleme Hatası: " + e.message + "\nStack: " + e.stack).catch(err => console.log("Kopyalama başarısız", err));
        }
        alert("Yükleme hatası oluştu. Hata detayı otomatik olarak panoya kopyalandı! Lütfen bana yapıştırın.\n\nHata: " + e.message);
        if(typeof speak === 'function') speak("Kayıt dosyası bozuk veya bulunamadı! Hata detayı panoya kopyalandı.");
    }
    return false;
}

// Kariyeri Sıfırla
function resetGame() {
    if(typeof playSound === 'function' && typeof enterSound !== 'undefined') playSound(enterSound);
    
    if (confirm("Kariyeriniz silinecek ve en baştan başlayacaksınız. Emin misiniz?")) {
        localStorage.removeItem(SAVE_KEY);
        if(typeof speak === 'function') speak("Kariyeriniz silindi. Oyun yeniden başlatılıyor.");
        setTimeout(() => {
            window.location.reload();
        }, 2000);
    }
}
