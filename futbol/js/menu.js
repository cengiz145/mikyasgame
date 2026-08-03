// menu.js - Restored Core UI & Kura Animations
function hideAllContainers() {
    const containers = document.querySelectorAll('.menu-container');
    containers.forEach(el => {
        el.style.display = 'none';
        el.setAttribute('aria-hidden', 'true');
        el.setAttribute('role', 'presentation');
    });
}

function showContainer(id) {
    hideAllContainers();
    let el = document.getElementById(id);
    if (el) {
        el.style.display = 'flex'
        el.removeAttribute('aria-hidden');
        el.removeAttribute('role');
        // Focus for NVDA
        let title = el.querySelector('h1, h2');
        if (title) {
            let devModal = document.getElementById('developer-intro-modal');
            if (devModal && devModal.style.display !== 'none') {
                let devTitle = document.getElementById('dev-intro-title');
                if (devTitle) setTimeout(() => devTitle.focus(), 100);
            } else {
                title.focus();
            }
        }
    }
    
    // Takvimi güncelle
    if (id === 'main-menu-container' && typeof window.updateCalendarUI === 'function') {
        window.updateCalendarUI();
    }
}

// Takvim UI'ını Güncelleme Fonksiyonu
window.updateCalendarUI = function() {
    let calEl = document.getElementById('calendar-display');
    if (!calEl) return;
    
    // Buton görünürlüğü (scout.js mantığı)
    let btnAdvance = document.getElementById('btn-advance-day');
    let btnPlay = document.getElementById('btn-play-match');
    let isClMatchDay = (window.currentDayOfWeek === 3 && window.championsLeague && window.championsLeague.hasMatchToday(window.myTeamId));
    
    if (!window.isPreSeason && window.currentDay && (window.currentDay % 7 === 0 || isClMatchDay)) {
        if(btnAdvance) btnAdvance.style.display = 'none';
        if(btnPlay) btnPlay.style.display = 'block';
    } else {
        if(btnAdvance) btnAdvance.style.display = 'block';
        if(btnPlay) btnPlay.style.display = 'none';
    }
    
    if (window.isPreSeason) {
        let text = `Sezon Öncesi Hazırlık Kampı - ${window.preSeasonDay}. Gün`;
        if (window.scheduledFriendly && window.scheduledFriendly.day === window.preSeasonDay) {
            text += " ⚠️ (Bugün Hazırlık Maçı Var!)";
        }
        calEl.innerHTML = text;
    } else {
        if (typeof formatDate === 'function') {
            calEl.innerHTML = `📅 Takvim: ${formatDate()}`;
        } else {
            let sezon = window.season || 1;
            let hafta = window.currentWeek || 1;
            let gun = window.currentDayOfWeek || 1;
            const daysOfWeek = ["", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"];
            let text = `Sezon ${sezon}. Hafta ${hafta}. - Gün: ${daysOfWeek[gun]}`;
            if (window.scheduledFriendly && window.scheduledFriendly.day === gun) {
                text += " ⚠️ (Bugün Hazırlık Maçı Var!)";
            }
            calEl.innerHTML = text;
        }
    }
    
    // Bütçeyi Güncelle
    if (typeof updateBudgetUI === 'function') updateBudgetUI();
    
    // [YENİ] Günlük Flaş Haber Güncellemesi
    let newsEl = document.getElementById('daily-news-text');
    if (newsEl && window.dailyNewsPool && window.dailyNewsPool.length > 0) {
        window.usedNews = window.usedNews || [];
        
        let availableNews = window.dailyNewsPool.filter(n => {
            if (window.usedNews.includes(n)) return false;
            
            let isTransferSeason = ((window.currentWeek <= 3) || (window.currentWeek >= 17 && window.currentWeek <= 19) || window.isPreSeason);
            let isDrawTime = window.pendingDrawNews || false;

            let text = n.toLowerCase();
            let isTransferNews = text.includes("transfer") || text.includes("bonservis") || text.includes("imza") || text.includes("sözleşme") || text.includes("kap");
            let isDrawNews = text.includes("kura") || text.includes("turnuva") || text.includes("eşleşme") || text.includes("milli");
            let isMatchNews = text.includes("maç") || text.includes("gol") || text.includes("şut") || text.includes("hakem") || text.includes("var") || text.includes("galibiyet") || text.includes("deplasman");

            if (isTransferNews && !isTransferSeason) return false;
            if (isMatchNews && isTransferSeason) return false;
            if (isDrawNews && !isDrawTime) return false;
            
            return true;
        });
        
        // Eğer filtrelenmiş haber kalmadıysa havuzu sıfırla
        if (availableNews.length === 0) {
            window.usedNews = [];
            availableNews = window.dailyNewsPool; // Fallback
        }
        
        let randomNews = availableNews[Math.floor(Math.random() * availableNews.length)];
        window.usedNews.push(randomNews);
    if (window.usedNews.length > 50) window.usedNews.shift();
        newsEl.textContent = randomNews;
    }
};

// Hazırlık Maçı Teklifi Sistemi
window.offerFriendlyMatch = function() {
    if (window.scheduledFriendly) return; // Zaten varsa sorma
    
    let isCloseToEnd = window.isPreSeason ? (window.preSeasonDay >= 14) : (window.currentDayOfWeek > 4);
    if (!window.leagueData || !window.leagueData.teams || isCloseToEnd) return;

    let myTeamId = window.league ? window.league.userTeamId : 'galatasaray';
    let availableTeams = window.leagueData.teams.filter(t => t.id !== myTeamId);
    if (availableTeams.length === 0) return;

    let oppTeam = availableTeams[Math.floor(Math.random() * availableTeams.length)];
    let matchDay = window.isPreSeason ? (window.preSeasonDay + 1) : (window.currentDayOfWeek + 1); // Yarın için teklif
    const daysOfWeek = ["", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"];
    
    let dayString = window.isPreSeason ? `${matchDay}. Gün` : daysOfWeek[matchDay];
    
    if (confirm(`�� HAZIRLIK MAÇI TEKLİFİ\n\n${oppTeam.name} takımı size yarın (${dayString}) için bir hazırlık maçı teklif ediyor. Kabul ediyor musunuz?\n\n(Not: Bu maç lig puanını etkilemez ancak oyuncuların kondisyonunu ve moralini etkiler.)`)) {
        window.scheduledFriendly = { teamId: oppTeam.id, day: matchDay };
        alert(`Anlaşma sağlandı! Yarın ${oppTeam.name} ile hazırlık maçına çıkacaksınız.`);
        if (typeof window.updateCalendarUI === 'function') window.updateCalendarUI();
    }
};

// President / Board Swiss Draw Animation
window.showPresidentSwissDraw = function(titleText, contentHtml) {
    let modal = document.createElement('div');
    modal.style.position = 'fixed';
    modal.style.top = '0'; modal.style.left = '0';
    modal.style.width = '100%'; modal.style.height = '100%';
    modal.style.background = 'rgba(0,0,0,0.95)';
    modal.style.zIndex = '100000';
    modal.style.display = 'flex'
    modal.style.justifyContent = 'center';
    modal.style.alignItems = 'center';
    modal.style.flexDirection = 'column';
    
    // Kura Çekimi Animasyonu
    let box = document.createElement('div');
    box.style.background = 'linear-gradient(135deg, #2c3e50, #000)';
    box.style.padding = '40px';
    box.style.borderRadius = '15px';
    box.style.border = '3px solid #f1c40f';
    box.style.maxWidth = '800px';
    box.style.textAlign = 'center';
    box.style.color = '#fff';
    box.style.boxShadow = '0 0 30px #f1c40f';
    
    let title = document.createElement('h1');
    title.style.color = '#f1c40f';
    title.textContent = "�� " + titleText + " Kura Çekimi ��";
    
    let content = document.createElement('div');
    content.style.fontSize = '1.3rem';
    content.style.lineHeight = '1.8';
    content.style.marginTop = '20px';
    content.style.textAlign = 'left';
    content.innerHTML = contentHtml; // Animated balls effect could be added here
    
    let btn = document.createElement('button');
    btn.className = 'menu-button';
    btn.style.marginTop = '30px';
    btn.style.background = '#e67e22';
    btn.textContent = "Başkanım, Hazırız!";
    btn.onclick = () => {
        modal.remove();
        if(typeof speak === 'function') speak("Avrupa kuraları çekildi, başarılar dileriz.");
        window.pendingDrawNews = true;
    };
    
    box.appendChild(title);
    box.appendChild(content);
    box.appendChild(btn);
    modal.appendChild(box);
    document.body.appendChild(modal);
    
    if(typeof speak === 'function') speak(titleText + " kuraları çekildi, rakiplerimiz belli oldu.");
    btn.focus();
};


window.checkBotRosters = function() {
    if (!window.leagueData || !window.leagueData.teams) return;
    
    window.leagueData.teams.forEach(team => {
        if (team.id === "free_agent") return;
        
        let players = window.leagueData.players.filter(p => p.teamId === team.id && !p.isRetired);
        
        // Eğer takımda 15'ten az oyuncu kaldıysa regen ekle
        while (players.length < 15) {
            let newRookie = {
                id: "regen_" + team.id + "_" + Date.now() + "_" + Math.floor(Math.random()*1000),
                name: "Altyapı Genci (" + team.id.substring(0,3).toUpperCase() + ")",
                teamId: team.id,
                position: ['KL', 'DEF', 'ORT', 'FOR'][Math.floor(Math.random()*4)],
                power: Math.floor(Math.random() * 15) + 35, // 35-50 arası
                speed: Math.floor(Math.random() * 3) + 2,
                tacticalRole: "classic",
                mentalTrait: "fragile",
                isListed: false,
                age: 17,
                condition: 100,
                morale: 75
            };
            window.leagueData.players.push(newRookie);
            players.push(newRookie);
        }
        
        // Otomatik kadroyu (formation) doldur
        if (typeof window.autoFillSquad === 'function') {
            window.autoFillSquad(team);
        }
    });
};

window.advanceWeek = function() {
    window.currentWeek = (window.currentWeek || 1) + 1; // Haftayı ilerlet

    // [YENİ] Bot Takımların Kendi Arasındaki Transferlerini Simüle Et
    if (typeof window.simulateBotTransfers === 'function') {
        window.simulateBotTransfers();
    }
        // [AUTO-INIT ŞAMPİYONLAR LİGİ]
    if (!window.isPreSeason && window.championsLeague && !window.championsLeague.isActive && window.leagueData && window.leagueData.teams) {
        window.championsLeague.init();
    }

    // Milli Takım Seçimi (10, 20 ve 30. haftalarda)
    if ((window.currentWeek === 10 || window.currentWeek === 20 || window.currentWeek === 30) && typeof window.simulateNationalTeamSelection === 'function') {
        let results = window.simulateNationalTeamSelection();
        if (results && (results.selected.length > 0 || results.snubbed.length > 0)) {
            let msg = "Milli takım kadroları açıklandı! Seçilen oyuncularınız kampa katıldı.<br><br>";
            if (results.selected.length > 0) {
                msg += "<strong>Seçilenler:</strong><br>";
                results.selected.forEach(p => msg += `- ${p.name} (${window.nationalities[p.nationality] ? window.nationalities[p.nationality].flag : "🏳️"} ${window.nationalities[p.nationality] ? window.nationalities[p.nationality].name : ""})<br>`);
                msg += "<br><em>(Milli maçlara gittikleri için kondisyonları düştü ancak piyasa değerleri ve moralleri arttı.)</em><br>";
            }
            if (results.snubbed.length > 0) {
                msg += "<br><strong>Kadro Dışı Kalan Yıldızlar (İsyan):</strong><br>";
                results.snubbed.forEach(p => msg += `- ${p.name} (Güç: ${p.power})<br>`);
                msg += "<br><em>(Bu oyuncular ağır bir travma yaşıyor, moralleri yerle bir oldu.)</em>";
            }
            window.eventQueue = window.eventQueue || [];
            window.eventQueue.push({
                title: "MİLLİ TAKIM KADROLARI AÇIKLANDI",
                message: msg
            });
            
            window.newspaperQueue = window.newspaperQueue || [];
            window.newspaperQueue.push({
                headline: "MİLLİ TAKIM KADROSU AÇIKLANDI!",
                subheadline: "Yıldız oyuncular ulusal görev için kampa çağrıldı.",
                article: "Milli takım teknik direktörü yaklaşan zorlu maçlar öncesi aday kadroyu kamuoyuna duyurdu. Seçilen oyuncuların form grafiği takdir toplarken, çağrılmayan bazı yetenekli isimlerin büyük bir hayal kırıklığı yaşadığı öğrenildi. Milli maç arası sonrası kulüplerin yorgunluk sorunuyla nasıl başa çıkacağı merak konusu.",
                color: "#2980b9",
                bgColor: "#fff",
                priority: 85
            });
        }
    }

    if (typeof window.generatePsychologyEvents === 'function') window.generatePsychologyEvents();

    // Menajer Kovulma Baskısı Haberleri
    if (window.presidentConfidence && window.presidentConfidence < 25) {
        if (Math.random() < 0.3) { // %30 ihtimalle her hafta başında çıksın ki spama dönmesin
            window.newspaperQueue = window.newspaperQueue || [];
            window.newspaperQueue.push({
                headline: "KOLTUĞU SALLANIYOR!",
                subheadline: "Kötü gidişatın faturası hocaya kesilecek! Yönetim kurulu hareketli saatler yaşıyor.",
                article: "Alınan hüsran verici sonuçların ardından takımda sular durulmuyor. Kulüp binasında gizli toplantılar yapıldığı ve yeni hoca arayışlarının şimdiden başladığı iddia edildi. Mevcut hocanın artık kredisi tamamen tükenmiş durumda.",
                color: "#c0392b",
                bgColor: "#1a0505",
                textColor: "#f5c6c6",
                priority: 95
            });
        }
    }

    // [YENİ] Taraftar Baskısı (Fan Pressure) Sistemi
    if (window.fanSupport !== undefined) {
        if (window.fanSupport < 15) {
            // Taraftar tesisi basıyor, istifa istiyor. Başkanın güveni sarsılır.
            if (window.presidentConfidence !== undefined) {
                window.presidentConfidence -= 5;
                if (window.presidentConfidence < 0) window.presidentConfidence = 0;
            }
            if (Math.random() < 0.4) {
                window.newspaperQueue = window.newspaperQueue || [];
                window.newspaperQueue.push({
                    headline: "TARAFTARDAN İSTİFA ÇAĞRISI!",
                    subheadline: "Stadyumda ve tesislerde büyük protestolar var.",
                    article: "Taraftarın sabrı tamamen taştı! Yönetime ve hocaya büyük bir öfke kusan binlerce taraftar tesislerin önünde toplandı. Kredi kartı iptalleri ve forma yakma eylemleri nedeniyle kulüp yönetimi çok zor durumda. Başkanın, hoca ile yolları ayırması an meselesi.",
                    color: "#e74c3c",
                    bgColor: "#fff",
                    priority: 90
                });
            }
        } else if (window.fanSupport >= 85) {
            // Taraftar çok mutlu, arkamızda duruyor. Başkanın güveni artar.
            if (window.presidentConfidence !== undefined) {
                window.presidentConfidence += 2;
                if (window.presidentConfidence > 100) window.presidentConfidence = 100;
            }
        }
    }
    
    if (typeof window.checkBotRosters === 'function') window.checkBotRosters();
};

window.addEventListener('DOMContentLoaded', () => {
    // BAŞLANGIÇ EKRANINI GÖSTER
    showContainer('intro-container');
    
    // KAYIT SİSTEMİ BAĞLANTILARI (SADECE BULUT)
    let loadBtn = document.getElementById('btn-continue');
    let startBtn = document.getElementById('btn-new-game');
    let settingsBtn = document.getElementById('btn-settings');
    
    // YENİ EKLENEN BULUT SİSTEMİ KONTROLÜ
    if (window.db && window.userId && loadBtn) {
        loadBtn.innerHTML = "☁️ Buluttan Yükleniyor...";
        loadBtn.style.display = 'block';
        loadBtn.disabled = true;
        
        window.db.ref('futbol_menajer/saves/' + window.userId).once('value').then(snap => {
            if (snap.exists()) {
                window.hasCloudSave = true;
                let dbData = snap.val();
                if (dbData.compressedFormat && dbData.compressed && typeof LZString !== 'undefined') {
                    window.cloudSaveDataString = LZString.decompressFromBase64(dbData.compressed);
                } else {
                    window.cloudSaveDataString = JSON.stringify(dbData);
                }
                loadBtn.innerHTML = "Kariyerime Devam Et (Bulut)";
                loadBtn.disabled = false;
            } else {
                loadBtn.style.display = 'none';
            }
        }).catch(err => {
            console.error(err);
            loadBtn.style.display = 'none';
        });
    } else if (loadBtn) {
        // Eğer Firebase'e bağlı değilse, yükleme yapamaz
        loadBtn.style.display = 'none';
    }
    
    loadBtn.addEventListener('click', () => {
        if (typeof loadGame === 'function') {
            if (loadGame()) {
                if (typeof window.assignNationalities === 'function') window.assignNationalities();
                if (typeof window.sanitizeAllPlayers === 'function') window.sanitizeAllPlayers();
                showContainer('main-menu-container');
            }
        }
    });
    
    if (settingsBtn) {
        settingsBtn.addEventListener('click', () => {
            document.getElementById('settings-modal').style.display = 'flex'; if(document.getElementById('settings-modal')) { let title = document.getElementById('settings-modal').querySelector('h1, h2'); if(title) title.focus(); else document.getElementById('settings-modal').focus(); };
        });
    }
    
    if (startBtn) {
        startBtn.addEventListener('click', () => {
            if (localStorage.getItem(saveKey)) {
                if (!confirm("Yeni bir kariyere başlarsanız eski kaydınız SİLİNECEK. Emin misiniz?")) {
                    return;
                }
                localStorage.removeItem(saveKey);
            }
            showContainer('continent-select-container');
            if(typeof speak === 'function') speak("Oynamak istediğiniz kıtayı seçin.");
        });
    }

    // Eski btn-new-career binding'ini siliyorum (start-intro-btn ile değiştirdik)
    // Basic Routing
    document.getElementById('btn-new-career')?.addEventListener('click', () => {
        if(typeof populateTeamSelect === 'function') populateTeamSelect();
        showContainer('team-select-container');
        if(typeof speak === 'function') speak("Takım seçimi ekranı.");
    });
    
    
    // --- YENİ UI ROUTING ---
    // Kıta Seçimi
    const openContinentCountries = (continentClass) => {
        showContainer('country-select-container');
        // Hide all countries first
        document.querySelectorAll('#country-select-container .menu-button').forEach(btn => {
            if (btn.id !== 'btn-back-country') {
                btn.style.display = 'none';
            }
        });
        // Show only those in selected continent
        document.querySelectorAll('#country-select-container .' + continentClass).forEach(btn => {
            btn.style.display = 'block';
        });
    };

    document.getElementById('btn-continent-europe')?.addEventListener('click', () => openContinentCountries('continent-europe'));
    document.getElementById('btn-continent-americas')?.addEventListener('click', () => openContinentCountries('continent-americas'));
    document.getElementById('btn-continent-asia')?.addEventListener('click', () => openContinentCountries('continent-asia'));

    document.getElementById('btn-back-continent')?.addEventListener('click', () => {
        showContainer('intro-container');
    });

    // Ülke Seçimi
    const openCountryLeagues = (countryId) => {
        showContainer('league-select-container');
        // Tüm alt lig listelerini gizle
        document.querySelectorAll('#league-select-container ul').forEach(ul => {
            ul.style.display = 'none';
        });
        // Sadece seçilen ülkenin liglerini göster
        const targetList = document.getElementById(countryId + '-leagues');
        if (targetList) {
            targetList.style.display = 'flex';
        }
    };

    document.getElementById('btn-country-tr')?.addEventListener('click', () => openCountryLeagues('tr'));
    document.getElementById('btn-country-eng')?.addEventListener('click', () => openCountryLeagues('eng'));
    document.getElementById('btn-country-it')?.addEventListener('click', () => openCountryLeagues('it'));
    document.getElementById('btn-country-es')?.addEventListener('click', () => openCountryLeagues('es'));
    document.getElementById('btn-country-de')?.addEventListener('click', () => openCountryLeagues('de'));
    document.getElementById('btn-country-fr')?.addEventListener('click', () => openCountryLeagues('fr'));
    document.getElementById('btn-country-nl')?.addEventListener('click', () => openCountryLeagues('nl'));
    document.getElementById('btn-country-br')?.addEventListener('click', () => openCountryLeagues('br'));
    document.getElementById('btn-country-pt')?.addEventListener('click', () => openCountryLeagues('pt'));
    document.getElementById('btn-country-usa')?.addEventListener('click', () => openCountryLeagues('usa'));
    document.getElementById('btn-country-saudi')?.addEventListener('click', () => openCountryLeagues('saudi'));
    document.getElementById('btn-back-country')?.addEventListener('click', () => {
        showContainer('continent-select-container');
    });

    // Lig Seçimi
    const selectLeagueFlow = (leagueId) => {
        window.selectedLeague = leagueId; // Global state for league
        
        // Yeni sistem: Tüm oyuncuların moralini başlat
        if (window.leagueData && window.leagueData.players) {
            window.leagueData.players.forEach(p => {
                if (p.morale === undefined) p.morale = 75;
            });
        }
        
        renderTeamSelectGrid(leagueId);
        showContainer('team-select-container');
        if(typeof speak === 'function') speak("Takımınızı seçin.");
    };

    document.getElementById('btn-league-superlig')?.addEventListener('click', () => selectLeagueFlow("superlig"));
    document.getElementById('btn-league-tff1')?.addEventListener('click', () => selectLeagueFlow("tff1"));
    document.getElementById('btn-league-tff2')?.addEventListener('click', () => selectLeagueFlow("tff2"));
    document.getElementById('btn-league-seriea')?.addEventListener('click', () => selectLeagueFlow("seriea"));
    document.getElementById('btn-league-serieb')?.addEventListener('click', () => selectLeagueFlow("serieb"));
    document.getElementById('btn-league-premier')?.addEventListener('click', () => selectLeagueFlow("premier"));
    document.getElementById('btn-league-laliga')?.addEventListener('click', () => selectLeagueFlow("laliga"));
    document.getElementById('btn-league-bundesliga')?.addEventListener('click', () => selectLeagueFlow("bundesliga"));
    document.getElementById('btn-league-ligue1')?.addEventListener('click', () => selectLeagueFlow("ligue1"));
    document.getElementById('btn-league-hollanda')?.addEventListener('click', () => selectLeagueFlow("hollanda"));
    document.getElementById('btn-league-mls')?.addEventListener('click', () => selectLeagueFlow("mls"));
    document.getElementById('btn-league-brezilya')?.addEventListener('click', () => selectLeagueFlow("brezilya"));
    document.getElementById('btn-league-portekiz')?.addEventListener('click', () => selectLeagueFlow("portekiz"));
    document.getElementById('btn-league-saudipro')?.addEventListener('click', () => selectLeagueFlow("saudipro"));

    document.getElementById('btn-back-league')?.addEventListener('click', () => {
        ['league-select-container', 'tr-leagues', 'eng-leagues', 'it-leagues', 'es-leagues', 'de-leagues', 'fr-leagues', 'nl-leagues', 'br-leagues', 'pt-leagues', 'usa-leagues', 'saudi-leagues'].forEach(id => { let el = document.getElementById(id); if (el) el.style.display = 'none'; });
        let csc = document.getElementById('country-select-container');
        if (csc) csc.style.display = 'flex';
    });
    
    document.getElementById('btn-back-team')?.addEventListener('click', () => {
        showContainer('league-select-container');
    });

    // Takım Seçim Grid Render
    window.renderTeamSelectGrid = function(leagueId) {
        const grid = document.getElementById('team-grid');
        if (!grid) return;
        grid.innerHTML = '';
        
        // Sadece o ligin takımlarını filtrele
        const filteredTeams = window.leagueData.teams.filter(t => t.leagueId === leagueId);
        
        filteredTeams.forEach(team => {
            const btn = document.createElement('button');
            btn.className = 'menu-button';
            btn.style.backgroundColor = team.color || '#333';
            btn.style.color = '#fff';
            btn.style.minHeight = '60px';
            btn.style.display = 'flex';
            btn.style.flexDirection = 'column';
            btn.style.alignItems = 'center';
            btn.style.justifyContent = 'center';
            btn.innerHTML = `<strong>${team.name}</strong><span style="font-size:0.8rem;">Bütçe: ${team.budget}M €</span>`;
            
            btn.addEventListener('click', () => {
                try {
                    // Seçilen takımı ata ve oyunu başlat
                    window.league = window.league || {};
                    window.league.userTeamId = team.id;
                    window.myTeamId = team.id; // CRITICAL FIX: Make myTeamId globally available
                    window.myTeam = team; // FIX: Assign myTeam correctly!
                    
                    // Otomatik Kadro Doldur
                    if (typeof autoFillSquad === 'function') {
                        autoFillSquad(window.myTeam);
                    }

                    // Menajer profilini tarafsız olarak başlatıp oyuna gir
                    window.managerProfile = 'tarafsiz';
                    if (!window.managerStats) {
                        window.managerStats = {
                            defensiveMinutes: 0,
                            passingMinutes: 0,
                            youngPlayerMinutes: 0,
                            comebackWins: 0,
                            crisisAvertedCount: 0
                        };
                    }
                    if (typeof startNewGame === 'function') {
                        if (typeof window.assignNationalities === 'function') window.assignNationalities();
                        if (typeof window.sanitizeAllPlayers === 'function') window.sanitizeAllPlayers();
                        startNewGame(filteredTeams); 
                    } else {
                        if (typeof window.assignNationalities === 'function') window.assignNationalities();
                        showContainer('main-menu-container');
                    }
                } catch(e) {
                    alert("Click Hatasi: " + e.message + "\nStack: " + e.stack);
                }
            });
            grid.appendChild(btn);
        });
    };
    
    // YENİ ANA MENÜ BUTON BAĞLANTILARI
    document.getElementById('btn-squad-view')?.addEventListener('click', () => {
        if(typeof loadManageScreen === 'function') loadManageScreen();
        showContainer('squad-container');
    });
    document.getElementById('btn-formation')?.addEventListener('click', () => {
        if(typeof loadManageScreen === 'function') loadManageScreen();
        showContainer('squad-container');
    });
    document.getElementById('btn-tactics')?.addEventListener('click', () => {
        if(typeof loadManageScreen === 'function') loadManageScreen();
        showContainer('squad-container');
    });
    document.getElementById('btn-training-facility')?.addEventListener('click', () => {
        showContainer('training-container');
    });
    document.getElementById('btn-academy')?.addEventListener('click', () => {
        if(typeof window.openAcademyFacility === 'function') window.openAcademyFacility();
    });
    document.getElementById('btn-back-academy')?.addEventListener('click', () => {
        showContainer('main-menu-container');
    });
    document.getElementById('btn-staff')?.addEventListener('click', () => {
        if(typeof window.openStaffFacility === 'function') window.openStaffFacility();
    });
    document.getElementById('btn-back-staff')?.addEventListener('click', () => {
        showContainer('main-menu-container');
    });
    document.getElementById('btn-medical-center')?.addEventListener('click', () => {
        if(typeof renderMedicalCenter === 'function') renderMedicalCenter();
        showContainer('medical-center-container');
    });
    // [YENİ] Basın Toplantısı Butonu
    document.getElementById('btn-press')?.addEventListener('click', () => {
        if(typeof window.openPreMatchPressConference === 'function') {
            window.openPreMatchPressConference();
        }
    });
    
    // Transfer Merkezi Butonu (Transfer Dönemi Kısıtlaması)
    document.getElementById('btn-transfer-center')?.addEventListener('click', () => {
        // Doğru hafta hesaplaması:
        let cw = window.currentWeek || 1;
        // Transfer dönemi: 1-3. haftalar (Yaz) veya 17-19. haftalar (Kış)
        let isWindowOpen = (cw <= 3) || (cw >= 17 && cw <= 19);
        
        if (isWindowOpen) {
            showContainer('transfer-center-container');
        } else {
            alert(`⛔ Transfer Dönemi Kapalı! (Şu an ${cw}. Haftadayız)\n\nYeni oyuncu alabilmek için devre arasını (17-19. Haftalar) veya sezon sonunu beklemelisiniz.`);
        }
    });
    
    document.getElementById('btn-standings')?.addEventListener('click', () => {
        if(typeof updateLeagueStandingsUI === 'function') updateLeagueStandingsUI();
        showContainer('standings-container');
    });
    document.getElementById('btn-world-ranking')?.addEventListener('click', () => {
        if(typeof updateWorldRankingUI === 'function') updateWorldRankingUI();
        showContainer('world-ranking-container');
    });

    document.getElementById('btn-hall-of-fame')?.addEventListener('click', () => {
        showContainer('hall-of-fame-container');
        if(typeof window.showHoFTab === 'function') window.showHoFTab('players');
    });
    
    document.getElementById('btn-back-hof')?.addEventListener('click', () => {
        showContainer('main-menu-container');
    });

    window.showHoFTab = function(tab) {
        const content = document.getElementById('hof-content');
        if (!content) return;
        
        let html = "";
        if (tab === 'players') {
            let hof = (window.leagueData && window.leagueData.hallOfFame) ? window.leagueData.hallOfFame : [];
            // Puana göre büyükten küçüğe sırala
            hof.sort((a, b) => b.score - a.score);
            
            html += `<h3 style="color:#f1c40f; text-align:center;">Kulüp Efsaneleri</h3>`;
            if (hof.length === 0) {
                html += `<p style="text-align:center; color:#bdc3c7;">Henüz şeref kürsüsüne çıkmayı başarmış bir efsane yok.</p>`;
            } else {
                html += `<table style="width:100%; text-align:left; color:white; border-collapse: collapse;">
                    <tr style="border-bottom: 2px solid #d4af37;">
                        <th>İsim</th><th>OVR</th><th>Maç</th><th>Gol</th><th>Asist</th><th>Efsane Skoru</th><th>Yıl</th>
                    </tr>`;
                hof.forEach(p => {
                    html += `<tr style="border-bottom: 1px solid #555;">
                        <td style="padding: 5px; color:#f1c40f; font-weight:bold;">${p.name}</td>
                        <td style="padding: 5px;">${p.ovr}</td>
                        <td style="padding: 5px;">${p.matches}</td>
                        <td style="padding: 5px;">${p.goals}</td>
                        <td style="padding: 5px;">${p.assists}</td>
                        <td style="padding: 5px; color:#e74c3c; font-weight:bold;">${p.score}</td>
                        <td style="padding: 5px;">${p.year}</td>
                    </tr>`;
                });
                html += `</table>`;
            }
        } else if (tab === 'seasons') {
            let archive = (window.leagueData && window.leagueData.seasonArchive) ? window.leagueData.seasonArchive : [];
            archive.sort((a, b) => b.year - a.year);
            
            html += `<h3 style="color:#3498db; text-align:center;">Geçmiş Sezonlar</h3>`;
            if (archive.length === 0) {
                html += `<p style="text-align:center; color:#bdc3c7;">Arşivde kayıtlı geçmiş sezon yok.</p>`;
            } else {
                html += `<table style="width:100%; text-align:left; color:white; border-collapse: collapse;">
                    <tr style="border-bottom: 2px solid #3498db;">
                        <th>Yıl</th><th>Şampiyon</th><th>Gol Kralı</th><th>Gol</th>
                    </tr>`;
                archive.forEach(s => {
                    html += `<tr style="border-bottom: 1px solid #555;">
                        <td style="padding: 5px; font-weight:bold;">${s.year}</td>
                        <td style="padding: 5px; color:#f1c40f; font-weight:bold;">${s.champion}</td>
                        <td style="padding: 5px;">${s.topScorer}</td>
                        <td style="padding: 5px;">${s.maxGoals}</td>
                    </tr>`;
                });
                html += `</table>`;
            }
        }
        content.innerHTML = html;
    };
    document.getElementById('btn-fixture')?.addEventListener('click', () => {
        if (window.isPreSeason) {
            alert("Sezon öncesi hazırlık kampındasınız. Lig kuraları henüz çekilmedi.");
            return;
        }
        if(typeof updateFixtureUI === 'function') updateFixtureUI();
        showContainer('fixture-container');
    });

    document.getElementById('btn-press-news')?.addEventListener('click', () => {
        if (typeof window.showNewspaper === 'function') {
            window.showNewspaper(true);
        }
    });
    
    // YENİ OYUN DÖNGÜSÜ BUTONU (Maça Geç / Devam Et)
    document.getElementById('btn-next-day')?.addEventListener('click', function() {
        if (window.isPreSeason) {
            window.preSeasonDay = window.preSeasonDay || 1;
            
            // Eğer hazırlık maçı günüyse maça geç
            if (window.scheduledFriendly && window.scheduledFriendly.day === window.preSeasonDay) {
                window.isFriendlyMatch = true;
                window.friendlyOpponentId = window.scheduledFriendly.teamId;
                window.scheduledFriendly = null;
                
                if (typeof window.initGame === 'function') {
                    hideAllContainers();
                    const gameContainer = document.getElementById('game-container');
                    if (gameContainer) gameContainer.style.display = 'block';
                    window.initGame();
                }
                return;
            }

            // Normal Pre-Season gün ilerlemesi
            if (typeof window.resolvePendingTransfers === 'function') window.resolvePendingTransfers();
            if (typeof window.checkIncomingOffers === 'function') window.checkIncomingOffers();
            if (typeof window.checkManagerEvolution === 'function') window.checkManagerEvolution();
            if (typeof window.checkManagerEvolution === 'function') window.checkManagerEvolution();
            if (!(window.scheduledFriendly && window.scheduledFriendly.day === window.preSeasonDay + 1)) {
                if (Math.random() < 0.35 && typeof window.triggerDynamicEvent === 'function') window.triggerDynamicEvent();
            }
            if (Math.random() < 0.15 && !window.scheduledFriendly && typeof window.offerFriendlyMatch === 'function') {
                window.offerFriendlyMatch();
            }

            window.preSeasonDay++;

            if (window.preSeasonDay > 15) {
                if (typeof window.drawFixtures === 'function') window.drawFixtures();
                this.innerHTML = "İlerle (Salı)";
            } else {
                if (window.scheduledFriendly && window.scheduledFriendly.day === window.preSeasonDay) {
                    this.innerHTML = `Hazırlık Maçına Çık (${window.preSeasonDay}. Gün)`;
                } else {
                    this.innerHTML = `İlerle (${window.preSeasonDay}. Gün)`;
                }
            }

            if (typeof window.updateCalendarUI === 'function') window.updateCalendarUI();
            if (typeof saveGame === 'function') saveGame(true);
            
            // Ekran okuyucu erişilebilirliği: Önce odakla, SONRA konuştur ki kesilmesin.
            let btn = this;
            btn.blur(); 
            btn.focus();
            
            setTimeout(() => {
                if(typeof speak === 'function') speak("Yeni güne geçildi.");
            }, 250);
            
            return;
        }

        // Scout ve Global Tarih İlerlemesi (Scout sisteminden entegre edildi)
        if (typeof window.advanceDateAndEvents === 'function') {
            if (!window.advanceDateAndEvents()) {
                return; // Bekleyen olaylar varsa günü atlamayı iptal et
            }
        }

        window.currentDayOfWeek = window.currentDayOfWeek || 1;
        const daysOfWeek = ["", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"];

        // Eğer hazırlık maçı günüyse veya Pazar değilse, sadece günü ilerlet
        if (window.currentDayOfWeek < 7 && !(window.scheduledFriendly && window.scheduledFriendly.day === window.currentDayOfWeek)) {
            // [YENİ] Günlük Transfer/Scout İşlemleri (Sadece normal günlerde çalışır, maç günleri hariç)
            if (typeof window.resolvePendingTransfers === 'function') {
                window.resolvePendingTransfers();
            }
            
            if (typeof window.checkIncomingOffers === 'function') {
                window.checkIncomingOffers();
            }
            
            // [YENİ] Yabancı Takımların Global Transferleri
            if (typeof window.simulateGlobalBotTransfers === 'function') {
                window.simulateGlobalBotTransfers();
            }
            
            // [YENİ] Dinamik Olay Tetikleyicisi (%35 ihtimal)
            // Sadece ertesi gün maç değilse (Cumartesi'den Pazar'a geçerken veya hazırlık maçına geçerken tetiklenme)
            if (window.currentDayOfWeek < 6 && !(window.scheduledFriendly && window.scheduledFriendly.day === window.currentDayOfWeek + 1)) {
                if (Math.random() < 0.35 && typeof window.triggerDynamicEvent === 'function') {
                    window.triggerDynamicEvent();
                }
            }
            
            // [YENİ] Hazırlık Maçı Tetikleyicisi (%15 ihtimal)
            if (Math.random() < 0.15 && !window.scheduledFriendly) {
                if (typeof window.offerFriendlyMatch === 'function') {
                    window.offerFriendlyMatch();
                }
            }

            // Eğer butona basılan gün hazırlık maçı günüyse maça geç
            if (window.scheduledFriendly && window.scheduledFriendly.day === window.currentDayOfWeek) {
                window.isFriendlyMatch = true;
                window.friendlyOpponentId = window.scheduledFriendly.teamId;
                window.scheduledFriendly = null; // Maça girerken temizle
                
                if (typeof window.initGame === 'function') {
                    hideAllContainers();
                    const gameContainer = document.getElementById('game-container');
                    if (gameContainer) gameContainer.style.display = 'block';
                    window.initGame();
                }
                return;
            }

            if (window.currentDayOfWeek === 3 && window.championsLeague && window.championsLeague.isActive && window.championsLeague.knockoutStage !== 'completed') {
                if (!window.championsLeague.hasMatchToday(window.myTeamId)) {
                    window.championsLeague.simulateBotMatches();
                    window.championsLeague.finishMatchDay();
                }
            }
            window.currentDayOfWeek++;
            
            if (window.currentDayOfWeek === 7) {
                this.innerHTML = "Maça Çık (Pazar)";
            } else if (window.currentDayOfWeek === 3 && window.championsLeague && window.championsLeague.hasMatchToday(window.myTeamId)) {
                this.innerHTML = "🌟 Avrupa Maçına Çık (Çarşamba)";
            } else if (window.scheduledFriendly && window.scheduledFriendly.day === window.currentDayOfWeek) {
                this.innerHTML = `Hazırlık Maçına Çık (${daysOfWeek[window.currentDayOfWeek]})`;
            } else {
                this.innerHTML = "İlerle (" + daysOfWeek[window.currentDayOfWeek] + ")";
            }
            
            if (typeof window.updateCalendarUI === 'function') window.updateCalendarUI();

            // Ekran okuyucu erişilebilirliği: Önce odakla, SONRA konuştur ki kesilmesin.
            let btn = this;
            btn.blur(); 
            btn.focus();
            
            setTimeout(() => {
                // Eğer ekranda 'Beklenmedik Olay' veya 'Gazete' çıktıysa 'Yeni güne geçildi' anonsunu yapma, çakışmasın.
                let eventModal = document.getElementById('dynamic-event-modal');
                let npModal = document.getElementById('newspaper-modal');
                if ((eventModal && eventModal.style.display === 'flex') || (npModal && npModal.style.display === 'flex')) {
                    return; 
                }
                if(typeof speak === 'function') speak("Yeni güne geçildi: " + daysOfWeek[window.currentDayOfWeek]);
            }, 250);

            return; // Maça geçişi engelle
        }

        // --- PAZAR (7. GÜN) İSE: HAFTALIK İŞLEMLER VE MAÇ ---
        // Eğer Pazarsa ve maç butonuna basıldıysa, maç önü konferansını/maçı başlat
        if ((window.currentDayOfWeek === 7 || (window.currentDayOfWeek === 3 && window.championsLeague && window.championsLeague.hasMatchToday(window.myTeamId))) && this.innerHTML.includes("Maça Çık")) {
            // [HATA DÜZELTME]: Eksik (null) İlk 11 kontrolü
            if (window.myTeam && window.myTeam.formation) {
                let nullCount = 0;
                for (let i = 0; i < 11; i++) {
                    if (window.myTeam.formation[i] === null) {
                        nullCount++;
                        // Kadrodan boşta olan en güçlü adamı bul
                        let availablePlayers = window.leagueData.players.filter(p => p.teamId === window.myTeam.id && !window.myTeam.formation.includes(p.id) && !window.myTeam.subs.includes(p.id) && (!p.injuredWeeks || p.injuredWeeks <= 0) && (!p.redCardWeeks || p.redCardWeeks <= 0));
                        availablePlayers.sort((a,b) => b.power - a.power);
                        
                        if (availablePlayers.length > 0) {
                            window.myTeam.formation[i] = availablePlayers[0].id;
                        } else {
                            // Yedeklerden çek (Çaresizlik)
                            let subPlayers = window.leagueData.players.filter(p => p.teamId === window.myTeam.id && window.myTeam.subs.includes(p.id));
                            if (subPlayers.length > 0) {
                                window.myTeam.formation[i] = subPlayers[0].id;
                                let subIdx = window.myTeam.subs.indexOf(subPlayers[0].id);
                                if (subIdx !== -1) window.myTeam.subs[subIdx] = null;
                            }
                        }
                    }
                }
                if (nullCount > 0) {
                    let warnMsg = "Kritik Uyarı: Takımınızdan ayrılan/isyan eden oyuncular yüzünden İlk 11'de eksiklikler vardı. Sistem sizin için en uygun oyuncuları sahaya sürdü. Lütfen bir dahaki maça kadronuzu kontrol edin.";
                    alert(warnMsg);
                    if(typeof speak === 'function') speak("Başkanım, İlk 11'de eksiklerimiz vardı. Maça çıkmadan önce yerlerine yedekleri yerleştirdim.");
                }
            }
            // Lig Maçına Geçiş
            if(typeof window.openPreMatchPressConference === 'function') {
                window.openPreMatchPressConference();
            } else if(typeof window.initGame === 'function') {
                hideAllContainers();
                const gameContainer = document.getElementById('game-container');
                if (gameContainer) gameContainer.style.display = 'block';
                window.initGame();
            }
            // Artık haftayı bitiriyoruz, butonu sıfırla ve günü Salı yap (Pazartesi boş gün gibi)
            window.currentDayOfWeek = 1;
            // Hafta ilerletme işlemleri (currentWeek++ vb.) maç sonrasında (Gazete kapanışında) advanceWeek() ile yapılacak.

            this.innerHTML = "İlerle (Salı)";
            if (typeof window.updateCalendarUI === 'function') window.updateCalendarUI();
            
            // Otomatik Kayıt - Kariyer Sıfırlanma Bugını Önlemek İçin
            if (typeof saveGame === 'function') saveGame(true);
            
            // Haftalık Sıfırlamalar
            window.pressConferenceDoneThisWeek = false; 
            window.complainingPlayerName = null; 
            window.financialCrisisEvent = null;
        }


        
        // [YENİ] Maaş Ödemeleri ve Finansal Kriz Taraması
        if (window.leagueData && window.leagueData.teams && window.leagueData.players) {
            window.leagueData.teams.forEach(t => {
                let teamPlayers = window.leagueData.players.filter(p => p.teamId === t.id);
                let weeklyWage = 0;
                teamPlayers.forEach(p => {
                    // Haftalık maaş hesabı: (Güç * Güç) / 100000 Milyon Euro
                    if (p && p.power !== undefined && !isNaN(p.power)) {
                        weeklyWage += (p.power * p.power) / 100000;
                    }
                });
                if (t.budget === undefined || isNaN(t.budget)) t.budget = 10;
                if (!isNaN(weeklyWage)) {
                    t.budget -= weeklyWage;
                }
                
                // Sadece bizim takım için Kriz mekaniği çalışsın (AI'yi zorlamayalım)
                if (t.id === window.myTeamId) {
                    if (t.budget < 0) {
                        t.weeksInDebt = (t.weeksInDebt || 0) + 1;
                    } else {
                        t.weeksInDebt = 0;
                    }
                    
                    if (t.weeksInDebt >= 3 && t.weeksInDebt < 5) {
                        if (typeof speak === 'function') speak("Kulüp finansal krizde! Maaşlar ödenmiyor, takımda huzursuzluk başladı!");
                    } else if (t.weeksInDebt === 5) {
                        window.financialCrisisEvent = "ihtarname";
                    } else if (t.weeksInDebt === 8) {
                        window.financialCrisisEvent = "uefa";
                    }
                }
            });
        }
        
        if (window.leagueData && window.leagueData.players) {
            let unhappyPlayers = [];
            window.leagueData.players.forEach(p => {
                p.trainingHoursLeft = 2;
                
                // YENİ: Elite Tesis Modülleri (Bilişsel Hız, Çevresel Simülasyon, Mimari Psikoloji)
                let myTeam = window.leagueData.teams.find(t => t.id === window.myTeamId);
                if (myTeam && p.teamId === window.myTeamId) {
                    let tLvl = myTeam.trainingLevel || 1;
                    
                    // Tesis seviyesine göre orantılı faydalar (Düşük seviyeler de az da olsa kazanım sağlar)
                    let moraleBoost = tLvl === 4 ? 3 : tLvl === 3 ? 2 : tLvl === 2 ? 1 : 0;
                    let conditionBoost = tLvl === 4 ? 5 : tLvl === 3 ? 3 : tLvl === 2 ? 1 : 0;
                    let formChance = tLvl * 0.025; // Lvl 1: 2.5%, Lvl 4: 10%
                    
                    // Mimari Psikoloji & Çevresel Simülasyon Orantılı Etkisi
                    if (moraleBoost > 0) p.morale = Math.min(100, (p.morale || 80) + moraleBoost);
                    if (conditionBoost > 0) p.condition = Math.min(100, (p.condition || 100) + conditionBoost);
                    
                    // Bilişsel Hız Orantılı Etkisi
                    if (Math.random() < formChance) {
                        p.form = Math.min(10, (p.form || 5) + 1);
                    }
                }
                
                // YENİ: Oyuncu Gelişimi (Player Growth) Sistemi & Antrenman Tesisleri Etkisi
                if (p.hiddenPotential && p.age <= 24) {
                    if (p.power < p.hiddenPotential) {
                        let myTeam = window.leagueData.teams.find(t => t.id === window.myTeamId);
                        let facilityBoost = 0;
                        if (myTeam && p.teamId === window.myTeamId && myTeam.trainingLevel) {
                            if (myTeam.trainingLevel === 2) facilityBoost = 0.05;
                            else if (myTeam.trainingLevel === 3) facilityBoost = 0.15;
                            else if (myTeam.trainingLevel === 4) facilityBoost = 0.30;
                        }
                        
                        // Normalde %10 ihtimal. Tesislerle %15 veya %25'e çıkar!
                        if (Math.random() < (0.10 + facilityBoost)) {
                            p.power += 1;
                        }
                    }
                } else if (p.age >= 31) {
                    // YENİ: Emeklilik ve Çöküş Mekaniği
                    let declineChance = (p.age - 30) * 0.05;
                    if (p.age >= 35) declineChance += 0.20; // 35+ yaşlılar çok hızlı çöker
                    
                    if (Math.random() < declineChance) {
                        p.power -= (p.age >= 35 ? Math.floor(Math.random() * 3) + 1 : 1);
                        
                        // İnatçı veya Erken Bırakan Özelliği
                        if (p.retirementThreshold === undefined) {
                            let r = Math.random();
                            if (r < 0.20) p.retirementThreshold = Math.floor(Math.random() * 10) + 35; // Erken Bırakan (35-45 arası bırakır)
                            else if (r < 0.40) p.retirementThreshold = Math.floor(Math.random() * 10); // İnatçı (0-10 arası bırakır)
                            else p.retirementThreshold = Math.floor(Math.random() * 15) + 15; // Normal (15-30 arası bırakır)
                        }

                        if (p.power <= p.retirementThreshold || p.power <= 0) {
                            p.power = 0;
                            p.isRetired = true;
                            
                            // YENİ: Pro Lisans Alma İhtimali (Karaktere Göre)
                            let proChance = 0.20;
                            if (p.mentalTrait === 'elite') proChance = 0.70; // Lider/elit oyuncular yüksek ihtimalle hoca olur
                            else if (p.mentalTrait === 'aggressive' || p.mentalTrait === 'creative') proChance = 0.40; // Hırslı ve yaratıcılar orta ihtimal
                            else if (p.mentalTrait === 'consistent') proChance = 0.15; // Standart oyuncular düşük ihtimal
                            else if (p.mentalTrait === 'fragile') proChance = 0.00; // Kırılgan/Utangaç oyuncular bu stresi kaldıramaz, hoca olmaz
                            
                            if (Math.random() < proChance) {
                                p.becomesManager = true;
                            }
                            
                            if (p.teamId === window.myTeamId) {
                                window.retiredPlayerName = p.name;
                                window.retiredPlayerBecomesManager = p.becomesManager;
                            }
                        }
                    }
                }

                // YENİ: Kiralık Oyuncu Hafta Düşüşü ve Geri Dönüşü
                if (p.isLoaned && p.teamId === window.myTeamId) {
                    if (p.loanWeeksLeft !== undefined) {
                        p.loanWeeksLeft--;
                        if (p.loanWeeksLeft <= 0) {
                            p.isLoaned = false;
                            p.teamId = p.originalTeamId;
                            delete p.originalTeamId;
                            delete p.loanWeeksLeft;
                            
                            if (!window.expiredLoanPlayers) window.expiredLoanPlayers = [];
                            window.expiredLoanPlayers.push(p.name);
                        }
                    }
                }
                
                if (p.loyalty !== undefined && !p.talkedThisWeek) {
                    p.loyalty -= 7;
                    if (p.loyalty < 0) p.loyalty = 0;
                }
                
                if (p.teamId === window.myTeamId && p.loyalty < 30) {
                    unhappyPlayers.push(p.name);
                }
                
                p.talkedThisWeek = false; 
            });
            
            // [YENİ] Finansal Kriz Sonuçlarını Uygula
            if (window.financialCrisisEvent === "uefa") {
                let myTeam = window.leagueData.teams.find(t => t.id === window.myTeamId);
                if (myTeam) {
                    if(window.leagueTable && window.leagueTable[window.myTeamId]) {
                        window.leagueTable[window.myTeamId].pts -= 3;
                    }
                    // En iyi oyuncuyu bul ve serbest bırak
                    let myPlayers = window.leagueData.players.filter(p => p.teamId === window.myTeamId);
                    myPlayers.sort((a,b) => b.power - a.power);
                    if (myPlayers.length > 0) {
                        let bestPlayer = myPlayers[0];
                        bestPlayer.teamId = 'free_agent';
                        bestPlayer.contractYears = 1;
                        if (typeof window.removePlayerFromTactics === 'function') window.removePlayerFromTactics(bestPlayer.id);
                        window.uefaFiredPlayer = bestPlayer.name;
                    }
                }
            } else if (window.financialCrisisEvent === "ihtarname") {
                 let myPlayers = window.leagueData.players.filter(p => p.teamId === window.myTeamId);
                 if(myPlayers.length > 0) {
                     window.ihtarnamePlayerName = myPlayers[Math.floor(Math.random() * myPlayers.length)].name;
                 }
            }
            
            // YENİ: Emekli olanları (Futbolu Bırakanları) sistemden sil
            window.leagueData.players = window.leagueData.players.filter(p => !p.isRetired);

            // Eğer mutsuz oyuncu varsa %50 ihtimalle medyaya sızdır
            if (unhappyPlayers.length > 0 && Math.random() < 0.5) {
                window.complainingPlayerName = unhappyPlayers[Math.floor(Math.random() * unhappyPlayers.length)];
            }
            
            // YENİ: Eğer bizim takımdan biri jübile yaptıysa gazeteyi tetikle
            if (window.retiredPlayerName && typeof window.showNewspaper === 'function') {
                window.showNewspaper(false);
            }

            // YENİ: Kiralık sözleşmesi bitenleri haber ver
            if (window.expiredLoanPlayers && window.expiredLoanPlayers.length > 0) {
                alert(`KİRALIK SÜRESİ DOLDU:\n\nŞu oyuncuların sözleşmesi bittiği için eski takımlarına döndüler:\n- ${window.expiredLoanPlayers.join('\n- ')}`);
                window.expiredLoanPlayers = [];
            }
            
            // YENİ: Rakip Takım Sert İstifa Haberi (AI Manager Resignation)
            if (Math.random() < 0.10 && !window.retiredPlayerName && !window.complainingPlayerName && !window.myBigTransferEvent) {
                let aiTeams = window.leagueData.teams.filter(t => t.id !== window.myTeamId && t.id !== 'free_agent');
                if (aiTeams.length > 0) {
                    let randomAiTeam = aiTeams[Math.floor(Math.random() * aiTeams.length)];
                    window.resignedManagerTeam = randomAiTeam.name;
                    if (typeof window.showNewspaper === 'function') {
                        window.showNewspaper(false);
                    }
                }
            }
        }
        
        if (typeof window.progressYouthAcademy === 'function') {
            window.progressYouthAcademy();
        }
        
        // O haftaki rakibi bul
        let isClMatch = (window.currentDayOfWeek === 3 && window.championsLeague && window.championsLeague.hasMatchToday(window.myTeamId));
        
        if (isClMatch) {
            let clOpp = window.championsLeague.getOpponent(window.myTeamId);
            if (clOpp) window.todayOpponent = clOpp.id;
            window.isHomeMatch = true; // For now
        } else if (typeof window.getNextOpponent === 'function') {
            window.todayOpponent = window.getNextOpponent();
        } else if (window.fixture && window.fixture[window.currentWeek - 1]) {
            let weekMatches = window.fixture[window.currentWeek - 1];
            let myMatch = weekMatches.find(m => m.home === window.myTeamId || m.away === window.myTeamId);
            if (myMatch) {
                window.todayOpponent = (myMatch.home === window.myTeamId) ? myMatch.away : myMatch.home;
                window.isHomeMatch = (myMatch.home === window.myTeamId);
            }
        }
        
        if (!window.todayOpponent) window.todayOpponent = "fenerbahce"; // Fallback
        
        // [YENİ] UEFA ve İhtarname Bildirimleri
        if (window.uefaFiredPlayer) {
            alert(`�� KULÜPTE DEPREM! ��\n\nUEFA, 8 haftadır maaşları ödeyemediğiniz için kulübünüze ceza kesti!\n\n❌ Lig tablosunda 3 puanınız silindi!\n❌ Takımın en değerli oyuncusu ${window.uefaFiredPlayer} sözleşmesini tek taraflı feshedip kulüpten ayrıldı!`);
            window.uefaFiredPlayer = null;
        } else if (window.ihtarnamePlayerName) {
            alert(`⚠️ AVUKATTAN İHTARNAME ⚠️\n\n5 haftadır maaş alamayan ${window.ihtarnamePlayerName}, avukatı aracılığıyla kulübe resmi ihtarname çekti.\n3 hafta içinde borçlar ödenmezse UEFA devreye girecek!`);
            window.ihtarnamePlayerName = null;
        }
        
        // [YENİ] Maça doğrudan geçmek yerine Maç Öncesi Basın Toplantısını aç
        if(typeof window.openPreMatchPressConference === 'function') {
            window.openPreMatchPressConference();
        } else if(typeof window.initGame === 'function') {
            hideAllContainers();
            const gameContainer = document.getElementById('game-container');
            if (gameContainer) gameContainer.style.display = 'block';
            window.initGame();
        } else {
            console.error("Maç Motoru (initGame) yüklenemedi.");
            alert("Maç motorunda hata oluştu!");
        }
    });

    // KAPTAN SECIM MODALI
    document.getElementById('btn-open-captain-modal')?.addEventListener('click', () => {
        let modal = document.getElementById('captain-selector-modal');
        let list = document.getElementById('captain-selector-list');
        list.innerHTML = '';
        if (!window.myTeamId && window.league && window.league.userTeamId) {
            window.myTeamId = window.league.userTeamId;
        }
        let squadPlayers = window.leagueData.players.filter(p => p.teamId === (window.myTeamId || "galatasaray"));
        
        // En yaşlıdan gence doğru
        squadPlayers.sort((a, b) => (b.age || 25) - (a.age || 25));
        
        squadPlayers.forEach(p => {
            let li = document.createElement('li');
            li.style.padding = '10px';
            li.style.borderBottom = '1px solid #555';
            li.style.cursor = 'pointer';
            li.style.color = p.isCaptain ? '#f1c40f' : 'white';
            li.innerHTML = `<strong>${p.name}</strong> - Yaş: ${p.age || 25} - Güç: ${p.power} ${p.isCaptain ? '(KAPTAN)' : ''}`;
            
            li.addEventListener('click', () => {
                squadPlayers.forEach(sp => sp.isCaptain = false);
                p.isCaptain = true;
                if(typeof speak === 'function') speak(`${p.name} takımın yeni kaptanı oldu.`);
                modal.style.display = 'none';
            });
            list.appendChild(li);
        });
        modal.style.display = 'flex'
    });
    
    document.getElementById('btn-close-captain')?.addEventListener('click', () => {
        if(document.getElementById('captain-selector-modal')) if(document.getElementById('captain-selector-modal')) document.getElementById('captain-selector-modal').style.display = 'none';
    });

    document.getElementById('btn-save-game')?.addEventListener('click', () => {
        if(typeof saveGame === 'function') {
            saveGame();
            if(typeof speak === 'function') speak("Kariyer başarıyla kaydedildi.");
            alert("Kariyer Kaydedildi!");
        }
    });
    
    window.triggerResignation = function() {
        if (!window.myTeamId) return;
        
        let confirmResign = confirm("DİKKAT: Gerçekten istifa edip HER ŞEYE SIFIRDAN başlamak istiyor musun?\n\nEvet dersen oyundaki bütün yıllar, geçmiş sezonlar, şeref kürsüsündeki efsaneler ve başardığın her şey SONSUZA DEK SİLİNECEK. Evren tamamen sıfırlanacak!");
        
        if (confirmResign) {
            // 1. Firebase (Bulut) Kaydını Sil
            if (window.db && window.userId) {
                window.db.ref('futbol_menajer/saves/' + window.userId).remove();
            }
            
            // 2. Yerel Kaydı Sil
            localStorage.removeItem(saveKey);
            
            // 3. Kullanıcıya haber ver ve sayfayı yenileyerek oyunu Fabrika Ayarlarına döndür
            alert("Tüm kayıtlar ve evren başarıyla silindi. Yeni bir efsane yazmaya hazırsın!");
            location.reload();
        }
    };

    document.getElementById('btn-resign')?.addEventListener('click', () => {
        window.triggerResignation();
    });

    // GERİ DÖN BUTONLARI (Alt Ekranlardan Ana Menüye Dönüş)
    const backBtnIds = ['btn-back-squad', 'btn-back-fixture', 'btn-back-cl', 'btn-back-standings', 'btn-back-training', 'btn-back-transfer', 'btn-back-medical', 'btn-back-world-ranking'];
    backBtnIds.forEach(id => {
        document.getElementById(id)?.addEventListener('click', () => {
            showContainer('main-menu-container');
        });
    });

    document.getElementById('btn-back-main')?.addEventListener('click', () => {
        showContainer('intro-container');
    });

    // --- KLAVYE İLE OK YÖNLENDİRMESİ (YUKARI/AŞAĞI) ---
    // NVDA Uygulama modunda ok tuşlarıyla gezinmeyi sağlamak için geri getirildi.
    document.addEventListener('keydown', (e) => {
        // TAB TUŞUNU TAMAMEN İPTAL ET (Kullanıcı talebi)
        if (e.key === 'Tab') {
            e.preventDefault();
            return;
        }

        if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
            // Sadece butonlarda ve input harici odaklanmalarda çalışsın
            if (document.activeElement && document.activeElement.tagName === 'INPUT') return;
            
            // Aktif olan container'ı bul (Öncelik modallarda)
            let activeContainer = Array.from(document.querySelectorAll('.modal, [id*="overlay"], [id*="-modal"]')).find(m => m.style.display !== 'none' && m.style.display !== '');
            if (!activeContainer) {
                activeContainer = Array.from(document.querySelectorAll('.menu-container')).find(c => c.style.display !== 'none' && c.getAttribute('aria-hidden') !== 'true');
            }
            if (!activeContainer) return;
            
            // Container içindeki görünür butonları ve başlıkları bul (Ok tuşuyla başlıklara da odaklanılabilsin ki okusunlar)
            let buttons = Array.from(activeContainer.querySelectorAll('button:not([disabled]), [role="button"], .interactive, h1, h2, h3, p[tabindex="0"]')).filter(b => b.style.display !== 'none');
            if (buttons.length === 0) return;
            
            let currentIndex = buttons.indexOf(document.activeElement);
            
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                let nextIndex = (currentIndex + 1) % buttons.length;
                buttons[nextIndex].focus();
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                // Eğer hiçbir şey seçili değilse sondan başla
                if (currentIndex === -1) currentIndex = 0;
                let prevIndex = (currentIndex - 1 + buttons.length) % buttons.length;
                buttons[prevIndex].focus();
            }
        }
    });

    document.getElementById('btn-continue-league')?.addEventListener('click', () => {
        // [YENİ] Ana menüye dönmeden önce otomatik kayıt (Oyuncu oyundan çıkarsa diye)
        if (typeof saveGame === 'function') saveGame(true);
        
        // [YENİ] Ana menüye dönmeden önce Maç Sonrası Basın Toplantısını aç
        if (typeof window.openPostMatchPressConference === 'function') {
            window.openPostMatchPressConference();
        } else {
            // Basın toplantısı yoksa doğrudan Gazete Manşetlerine geç
            if(typeof window.showNewspaper === 'function') {
                window.showNewspaper();
            } else {
                if(typeof window.advanceWeek === 'function') window.advanceWeek();
                if(typeof showContainer === 'function') showContainer('main-menu-container');
            }
        }
    });

});

// --- DİNAMİK OLAYLAR SİSTEMİ ---
window.dynamicEventsPool = [
    // --- [YENİ 10 OLAY] ---
    {
        type: "rpgMole",
        condition: () => Math.random() < 0.20,
        title: "�� Soyunma Odası Köstebeği!",
        desc: "Şok bir gelişme! Taktik tahtasında çizdiğiniz en gizli hücum organizasyonları yerel bir gazetede harfiyen yayımlandı. Takım içinde bir köstebek var!",
        options: [
            { text: "Cadı Avı Başlat (Tesisleri Kapat)", effect: { authority: 15, loyalty: -20, customAction: () => alert("Oyuncuların telefonlarını toplattın ve ağır sorgu yaptın. Otoriten arttı ama takım sana çok kırıldı.") } },
            { text: "Bırakın Yazsınlar (Umursama)", effect: { authority: -10, loyalty: 10, customAction: () => alert("Soğukkanlı kaldın, oyunculara güvendiğini söyledin. Takım içi bağlar güçlendi ama medya seninle dalga geçiyor.") } }
        ]
    },
    {
        type: "rpgYoungsterGaming",
        condition: () => Math.random() < 0.25,
        title: "�� Genç Yetenek Disiplinsizliği",
        desc: "Altyapıdan yeni çıkardığınız en potansiyelli genç oyuncunuz, sabah idmanına katılmadı. Sonradan ortaya çıktı ki gece boyu bir 'Valorant' e-spor turnuvasında oyun oynamış!",
        options: [
            { text: "A Takımdan Kov ve Altyapıya Yolla", effect: { authority: 20, president: -10, customAction: () => alert("Başkanın çok sevdiği genci cezalandırdın. Disiplin tavan yaptı ama başkan sana kızgın.") } },
            { text: "Ufak Bir Para Cezası Ver", effect: { authority: -5, loyalty: 5, customAction: () => alert("Gence babacan yaklaştın. Oyuncu hatasını anladı, takım bu hoşgörüyü sevdi.") } }
        ]
    },
    {
        type: "rpgAgentBlackmail",
        condition: () => Math.random() < 0.20,
        title: "�� Menajer Şantajı",
        desc: "Takımın en çok kazanan oyuncusunun menajeri aradı: 'Hocam benim oyuncumu son maçlarda yedek bıraktın. Eğer bu hafta ilk 11 oynamazsa basına takımda kriz var diye açıklama yaparım.'",
        options: [
            { text: "Tehdide Boyun Eğ (Oynat)", effect: { authority: -25, loyalty: -10, customAction: () => alert("Menajerin tehdidine boyun eğdin. Takımdaki diğer oyuncular senin zayıf olduğunu düşünüyor.") } },
            { text: "Menajeri Tesisten Kov!", effect: { authority: 30, president: -15, customAction: () => alert("Menajeri güvenlikle dışarı attırdın! Otoriten efsanevi boyutlara ulaştı ama yönetim bu krizden dolayı endişeli.") } }
        ]
    },
    {
        type: "rpgSocialMedia",
        condition: () => Math.random() < 0.30,
        title: "�� Sosyal Medya Fiyaskosu",
        desc: "Bir oyuncunuz, en büyük rakibinizin galibiyet gönderisini yanlışlıkla 'beğendi'. Taraftar sosyal medyada oyuncuyu linç ediyor, tesisleri basmakla tehdit ediyorlar!",
        options: [
            { text: "Oyuncuyu Medyanın Önüne At", effect: { authority: 10, loyalty: -30, fan: 20, customAction: () => alert("Taraftara şirin gözüktün ama oyuncunu sattın. Soyunma odasında kimse sana güvenmiyor artık.") } },
            { text: "Oyuncuma Sahip Çıkıyorum!", effect: { authority: 15, loyalty: 30, president: -10, customAction: () => alert("Tüm tepkileri üzerine çektin. Taraftar sana kızgın ama oyuncular senin gerçek bir lider olduğunu düşünüyor!") } }
        ]
    },
    {
        type: "rpgPitchRuined",
        condition: () => Math.random() < 0.20,
        title: "��️ Saha Zemini Rezayeti",
        desc: "Yönetim para kazanmak için stadyumu dün gece büyük bir rock konserine kiraladı. Konser sonrası saha zemini patates tarlasına dönmüş! Pas yapmak imkansız.",
        options: [
            { text: "Yönetimi Basına Şikayet Et", effect: { authority: 10, president: -40, customAction: () => alert("Medyaya 'Bu zeminde top oynanmaz, yönetimin vizyonu bu' dedin. Başkan deliye döndü, kovulman an meselesi!") } },
            { text: "Kendi Cebinden Çim Uzmanı Getir (-100.000 €)", effect: { budget: -0.1, president: 15, authority: 5, customAction: () => alert("Faturayı cebinden ödedin. Zemin maça yetişti, Başkan senin bu fedakarlığına bayıldı.") } }
        ]
    },
    {
        type: "rpgLegendVisit",
        condition: () => Math.random() < 0.25,
        title: "�� Efsanenin Ziyareti",
        desc: "Kulübün efsanevi eski kaptanlarından biri idmanı ziyarete geldi. Oyuncular ona hayranlıkla bakıyor. Size taktiksel bir tavsiyede bulunmak istiyor.",
        options: [
            { text: "Tavsiyesini Dinle ve Uygula", effect: { loyalty: 15, authority: -10, customAction: () => alert("Efsaneye saygı duydun. Takım çok mutlu oldu ama antrenörlük karizman hafif çizildi.") } },
            { text: "Teşekkür Et Ama Kendi Bildiğini Oku", effect: { authority: 20, loyalty: -5, customAction: () => alert("Efsaneye 'Devir değişti abi' dedin. Otoriteni net bir şekilde kanıtladın.") } }
        ]
    },
    {
        type: "rpgFanDinner",
        condition: () => Math.random() < 0.35,
        title: "�� Taraftar Derneği Gecesi",
        desc: "Şehrin en fanatik taraftar derneği, düzenledikleri dayanışma yemeğine sizi davet etti. Katılırsanız yüklü bir bağış yapmanız beklenecek.",
        options: [
            { text: "Katıl ve Derneğe Bağış Yap (-50.000 €)", effect: { budget: -0.05, authority: 15, president: 5, customAction: () => alert("Yemeğe katılıp gövde gösterisi yaptın. Taraftar artık senin için ölüme bile gider!") } },
            { text: "Yoğun Olduğunu Söyleyip Reddet", effect: { authority: -10, loyalty: 5, customAction: () => alert("Taraftarı ektin. 'Hoca bizi beğenmiyor' dedikoduları çıktı. Sadece işine odaklandığın için takımın formu etkilenmedi.") } }
        ]
    },
    {
        type: "rpgBoardVisit",
        condition: () => Math.random() < 0.25,
        title: "�� Yönetim Kurulu Baskını",
        desc: "Başkan ve 5 yönetim kurulu üyesi habersiz şekilde sabah antrenmanına geldi. Saha kenarında puro içerek idmanı izliyor ve sürekli yüksek sesle yorum yapıyorlar.",
        options: [
            { text: "İdmanı Durdurup Onlara Kahve İkram Et", effect: { president: 25, authority: -20, loyalty: -10, customAction: () => alert("Patronlara yaranmak için idmanı böldün. Yönetim seni çok sevdi ama oyuncular senin vizyonsuz olduğunu düşünüyor.") } },
            { text: "İdmanı Sertleştir, Onları Görmezden Gel", effect: { authority: 20, president: -15, loyalty: 10, customAction: () => alert("Yönetimi hiç takmadın, oyunculara 'Bana bakın!' diye bağırdın. Takım liderliğini hissetti ama patronlar bozuldu.") } }
        ]
    },
    {
        type: "rpgRefCall",
        condition: () => Math.random() < 0.20,
        title: "☎️ TFF'den Uyarı Telefonu",
        desc: "Geçen haftaki maçta hakeme yaptığınız itirazlar nedeniyle TFF yetkililerinden biri sizi gizlice aradı. 'Hocam biraz sakinleşin, yoksa hakemler size cephe alacak' dedi.",
        options: [
            { text: "Alttan Al ve Özür Dile", effect: { authority: -15, president: 10, customAction: () => alert("Politik davrandın. Federasyonla aranı düzelttin ama sahadaki 'Hırçın Hoca' imajın yıkıldı.") } },
            { text: "Gidin Hakemlerinizi Eğitin! (Telefonu Kapat)", effect: { authority: 30, president: -20, customAction: () => alert("Federasyona rest çektin! Otoriten zirvede ama hakem hataları ve federasyon cezaları yakındır.") } }
        ]
    },
    {
        type: "rpgMatchFixingRumor",
        condition: () => Math.random() < 0.15,
        title: "�� Şok İddia: Şike Dedikodusu!",
        desc: "Yerel bir internet sitesi, takımınızın son galibiyetinde şaibe olduğunu, hakemlere hediye gönderildiğini iddia eden yalan bir haber yaptı. Ortalık karıştı!",
        options: [
            { text: "Acil Basın Toplantısı Düzenle (Meydan Oku)", effect: { authority: 25, loyalty: 15, customAction: () => alert("Kameralar karşısına geçip masaya yumruğunu vurdun. 'Alnımız ak!' dedin. Otorite ve moral zirve yaptı!") } },
            { text: "Suskun Kal, Yönetim Halleder", effect: { authority: -20, president: 5, loyalty: -15, customAction: () => alert("Korkak davrandın. İddialar takımın üzerine yapıştı, moral ve motivasyonunuz ciddi zarar gördü.") } }
        ]
    },

    // --- [YENİ] HAFTA İÇİ İYİ OLAYLAR ---
    {
        type: "rpgSponsorSurprise",
        condition: () => Math.random() < 0.35, // Çıkma ihtimali
        title: "�� Beklenmedik Destek!",
        desc: "Şehrin önde gelen iş adamlarından biri tesisleri ziyaret etti. Takımın son haftalardaki mücadelesini çok beğendiğini söyleyerek kulübe 500.000 € bağış yapmak istiyor.",
        options: [
            { 
                text: "Teşekkür Et ve Kabul Et", 
                effect: { 
                    budget: 0.5, // 500 bin euro
                    president: 10, 
                    authority: 5,
                    customAction: () => alert("Bağış kulübün kasasına girdi! Başkan bu ekstra gelirden dolayı çok mutlu.")
                } 
            }
        ]
    },
    {
        type: "rpgTeamDinner",
        condition: () => Math.random() < 0.40,
        title: "��️ Takım Yemeği",
        desc: "Takım kaptanı yanınıza geldi: 'Hocam, hafta sonu maçı öncesi takımın moralini yükseltmek için dışarıda bir moral yemeği organize ettik. Sizin de katılmanızı çok isteriz.'",
        options: [
            { 
                text: "Katıl ve Hesabı Sen Öde (-50.000 €)", 
                effect: { 
                    budget: -0.05, 
                    loyalty: 25, 
                    president: 0,
                    customAction: () => alert("Yemekte oyuncularla harika vakit geçirdin ve hesabı ödeyerek büyük bir jest yaptın. Takımın sana olan sadakati ve morali tavan yaptı!")
                } 
            },
            { 
                text: "Siz Eğlenin, Benim Taktik Çalışmam Lazım", 
                effect: { 
                    authority: 15, 
                    loyalty: 5, 
                    customAction: () => alert("Yemeğe katılmadın ama takımın bu kaynaşma çabasını takdir ettin. İşkolik tavrın oyuncuların sana olan saygısını (Otoriteni) artırdı.")
                } 
            }
        ]
    },
    {
        type: "rpgFanLove",
        condition: () => Math.random() < 0.35,
        title: "❤️ Taraftarın Sevgisi",
        desc: "Antrenman çıkışında tesislerin kapısında bekleyen küçük bir taraftar grubu gördünüz. Ellerinde 'Sana İnanıyoruz Hocam!' yazılı bir pankart var ve saatlerdir sizi bekliyorlar.",
        options: [
            { 
                text: "Arabandan İn ve Onlarla Fotoğraf Çekil", 
                effect: { 
                    authority: 20, 
                    president: 5,
                    customAction: () => alert("Mütevazı tavrın sosyal medyada viral oldu! Taraftarın ve yönetimin gözündeki saygınlığın (Otoriten) inanılmaz arttı.")
                } 
            },
            { 
                text: "Onlara Kulüp Mağazasından Forma Hediye Et (-10.000 €)", 
                effect: { 
                    budget: -0.01,
                    authority: 10, 
                    loyalty: 10,
                    customAction: () => alert("Çocuklara yaptığın bu sürpriz herkesin içini ısıttı. Hem oyuncuların hem de taraftarın sana olan sevgisi pekişti.")
                } 
            }
        ]
    },

    // --- [YENİ] HAFTA İÇİ RPG OLAYLARI ---
    {
        type: "rpgNightclub",
        condition: () => Math.random() < 0.30, // %30 ihtimalle çıkabilir
        title: "�� Gece Kulübü Skandalı!",
        desc: "Yardımcı antrenör telaşla yanınıza gelir: 'Hocam, takımın en önemli oyuncularından biri dün gece geç saatlere kadar gece kulübünde eğlenirken yakalanmış. Görüntüler basına sızmak üzere, ne yapalım?'",
        options: [
            { 
                text: "Kadro Dışı Bırak ve Ceza Kes!", 
                effect: { 
                    authority: 15, 
                    loyalty: -15, 
                    president: 5,
                    customAction: () => alert("Oyuncuyu cezalandırdın! Otoriten pekişti ama oyuncu sana fena halde küstü. Takım içindeki huzur bozulabilir.")
                } 
            },
            { 
                text: "Üstünü Ört, Aramızda Kalsın", 
                effect: { 
                    authority: -15, 
                    loyalty: 20, 
                    president: -10,
                    customAction: () => alert("Skandalın üstünü örttün. Oyuncu sana sadakatle bağlandı ama otoriten sarsıldı, başkan ise bu durumdan pek hoşnut değil.")
                } 
            }
        ]
    },
    {
        type: "rpgPresidentTactic",
        condition: () => window.presidentConfidence > 30 && Math.random() < 0.25,
        title: "�� Başkanın Müdahalesi",
        desc: "Başkan sizi bizzat aradı: 'Hocam, hafta sonu oynayacağımız maç çok kritik. Medyaya söz verdim, sahaya çift forvet ve çok ofansif bir sistemle çıkmamız lazım. İstediğim kadroyu sahaya süreceksin değil mi?'",
        options: [
            { 
                text: "Tabii ki Başkanım, Emredersiniz", 
                effect: { 
                    president: 20, 
                    authority: -20, 
                    loyalty: -5,
                    customAction: () => alert("Başkana boyun eğdin! Başkanın güveni arttı ancak takım ve medya senin 'Başkanın Adamı' olduğunu konuşuyor. Otoriten sarsıldı.")
                } 
            },
            { 
                text: "Soyunma Odasının Anahtarı Bende!", 
                effect: { 
                    president: -25, 
                    authority: 25, 
                    loyalty: 10,
                    customAction: () => alert("Başkana rest çektin! 'Takıma ben karışırım' dedin. Otoriten tavan yaptı, oyuncular karakterine saygı duydu ancak Başkanla arandaki ipler gerildi.")
                } 
            }
        ]
    },
    {
        type: "rpgRivalProvocation",
        condition: () => Math.random() < 0.35,
        title: "⚔️ Rakip Hocadan Tahrik!",
        desc: "Hafta sonu oynayacağınız takımın hocası gazetelere flaş bir demeç verdi: 'Bizden korkuyorlar, sahaya çıkıp 90 dakika defans yapacaklar. Onları rahat yeneceğiz!'",
        options: [
            { 
                text: "Saha İçinde Cevap Vereceğiz (Sessiz Kal)", 
                effect: { 
                    authority: 5, 
                    president: 5,
                    customAction: () => alert("Profesyonelce davrandın. Takım sessizce maça odaklandı. Risk almadın.")
                } 
            },
            { 
                text: "Kimin Korkak Olduğunu Görecekler! (Agresif Yanıt)", 
                effect: { 
                    loyalty: 15, 
                    authority: 10, 
                    president: -5,
                    customAction: () => alert("Medyada büyük bir söz savaşı başlattın! Taraftar ve takım gaza geldi, motivasyon tavan yaptı ama üzerinizdeki baskı inanılmaz derecede arttı.")
                } 
            }
        ]
    },

    {
        type: "winGameTier3",
        condition: () => window.consecutiveWins >= 5 && window.managerAuthority >= 95 && window.presidentConfidence >= 95,
        title: "Avrupa'dan Dev Teklif! ����",
        desc: "Takımınızı adeta yenilmez bir makineye çevirdiniz. Mükemmel galibiyet serileriniz ve sarsılmaz otoriteniz Avrupa devlerinin dikkatinden kaçmadı. Menajeriniz odanıza gelip dudak uçuklatan bir teklif getirdi. Şampiyonlar Ligi'ni kazanacak bir dünya devi olmak ister misiniz?",
        options: [
            { text: "Teklifi Kabul Et (Kariyer Zirvesi - Oyunu Kazan)", effect: { winGameTier: 3 } },
            { text: "Reddet: Ben Bu Şehrin Çocuğuyum (Efsane Ol)", effect: { budget: 0, authority: 5, loyalty: 50, president: 5 } }
        ]
    },
    {
        type: "winGameTier2",
        condition: () => window.consecutiveWins >= 4 && window.managerAuthority >= 85 && window.presidentConfidence >= 85 && !(window.consecutiveWins >= 5 && window.managerAuthority >= 95 && window.presidentConfidence >= 95),
        title: "Köklü Bir Avrupa Devinden Teklif! ��",
        desc: "Taktiksel zekanız tüm kıtada konuşuluyor! Avrupa'nın köklü ve şampiyonluğa oynayan devleri (Dortmund, Juventus) sizi takımın başında görmek istiyor. Avrupa arenasına adım atmak ister misiniz?",
        options: [
            { text: "Teklifi Kabul Et (Yıldız Menajer - Oyunu Kazan)", effect: { winGameTier: 2 } },
            { text: "Reddet: Kulübüme Bağlıyım", effect: { budget: 0, authority: 5, loyalty: 25, president: 5 } }
        ]
    },
    {
        type: "winGameTier1",
        condition: () => window.consecutiveWins >= 3 && window.managerAuthority >= 75 && window.presidentConfidence >= 75 && !(window.consecutiveWins >= 4 && window.managerAuthority >= 85 && window.presidentConfidence >= 85),
        title: "Büyük Bir Kulüpten Teklif! ��",
        desc: "Takımınızla yakaladığınız çıkış gözlerden kaçmadı. Ligin şampiyonluğa oynayan devlerinden biri sizi takımın başına getirmek için astronomik bir teklif sundu. Sıçrama yapmak ister misiniz?",
        options: [
            { text: "Teklifi Kabul Et (Sıçrama - Oyunu Kazan)", effect: { winGameTier: 1 } },
            { text: "Reddet: Hedeflerim Var", effect: { budget: 0, authority: 5, loyalty: 20, president: 5 } }
        ]
    },
    {
        type: "starPlayerCrisis",
        condition: () => window.consecutiveWins >= 3 && Math.random() < 0.25,
        title: "Yıldız Oyuncu Krizi! ⭐��",
        desc: "Takımın formda olmasını fırsat bilen en iyi oyuncunuzun menajeri kapınızı çaldı. 'Bu takım müvekkilim sayesinde kazanıyor, sözleşmesine acilen 30 Milyon ₺ zam istiyoruz, yoksa idmanlara çıkmayız!' diyerek sizi tehdit ediyor.",
        options: [
            { 
                text: "Parayı Ver ve Sus (Talebi Kabul Et)", 
                effect: { 
                    budget: -30, 
                    authority: -10,
                    loyalty: -10, 
                    customAction: () => alert("Oyuncuya yüklü bir ödeme yapıldı. Takımda diğer oyuncuların bu haksız duruma bozulduğu dedikoduları dolaşıyor.")
                } 
            },
            { 
                text: "Sen Kimsin Beni Tehdit Ediyorsun! (Rest Çek)", 
                effect: { 
                    customAction: () => {
                        if (window.managerAuthority >= 70) {
                            alert("Otoriteniz karşısında menajer ve oyuncu korkup geri adım attı. 'Özür dileriz hocam, yanlış anlaşıldık' diyerek idmana döndüler. Otoriteniz daha da sağlamlaştı!");
                            window.managerAuthority += 15;
                            if(window.managerAuthority > 100) window.managerAuthority = 100;
                        } else {
                            alert("Otoriteniz zayıf olduğu için restiniz işe yaramadı! Oyuncu sinir krizi geçirdi, eşyalarını toplayıp tesisleri terk etti. Takımın ahengi tamamen bozuldu.");
                            window.managerAuthority -= 15;
                            window.teamConfidence = Math.max(0, (window.teamConfidence || 100) - 30);
                            
                            // En güçlü oyuncunun moralini sıfırla
                            let myTeamId = window.league ? window.league.userTeamId : 'galatasaray';
                            let myPlayers = window.leagueData.players.filter(p => p.teamId === myTeamId);
                            if (myPlayers.length > 0) {
                                myPlayers.sort((a,b) => b.power - a.power);
                                myPlayers[0].happiness = 'Öfkeli';
                                myPlayers[0].loyalty = 0;
                            }
                        }
                    }
                } 
            }
        ]
    },
    {
        type: "presidentNepotism",
        condition: () => Math.random() < 0.15,
        title: "Başkanın Torpili! ����",
        desc: "Kulüp başkanı sizi odasına çağırdı. Çok yakın bir sponsor dostunun oğlunu (Altyapıdan yeteneksiz bir genç) takıma kaydettirdiğini ve bu hafta sonu oynaması gerektiğini söyledi. 'Kırma beni hocam, sponsorluk gidiyor!' diye size baskı yapıyor.",
        options: [
            { 
                text: "Emredersiniz Başkanım (Torpili Kabul Et)", 
                effect: { 
                    president: 25, 
                    authority: -20,
                    loyalty: -20, 
                    customAction: () => {
                        alert("Torpilli oyuncu kadroya zorla dahil edildi. As formayı hak eden oyuncular size büyük tepki gösterdi!");
                        // Yeteneksiz oyuncu ekle
                        let myTeamId = window.league ? window.league.userTeamId : 'galatasaray';
                        window.leagueData.players.push({
                            id: "torpilli_oyuncu_" + Date.now(),
                            name: "Sponsor Çocuğu",
                            teamId: myTeamId,
                            position: "OOS",
                            power: 35,
                            speed: 40,
                            age: 18,
                            happiness: 'Çok Mutlu',
                            loyalty: 100
                        });
                    }
                } 
            },
            { 
                text: "Benim Takımıma Siyaset Giremez! (Rest Çek)", 
                effect: { 
                    president: -30, 
                    authority: 15,
                    loyalty: 15, 
                    customAction: () => alert("Oyuncuların gözünde efsaneleştiniz! Ancak başkanın odasından kapıyı çarparak çıkmanız yönetimi çok kızdırdı. Kovulmanıza an meselesi olabilir.")
                } 
            }
        ]
    },
    {
        type: "deadlineDayBargain",
        condition: () => (window.currentWeek === 3 || window.currentWeek === 19) && Math.random() < 0.6,
        title: "Transfer Tahtası Kapanıyor! ⏳✍️",
        desc: "Ünlü bir menajer ofisinizi aradı. 'Hocam elimde kulüpsüz kalmış, çok tecrübeli ama biraz yaşlı bir yıldız var. Değeri 20 Milyon ama transferin bitmesine saatler kaldığı için size 10 Milyona bırakırım!' diyor. Fırsatı değerlendirecek misiniz?",
        options: [
            { 
                text: "Riski Al ve İmzala (10 M₺ Öde)", 
                effect: { 
                    budget: -10, 
                    customAction: () => {
                        let myTeamId = window.league ? window.league.userTeamId : 'galatasaray';
                        let myTeam = window.leagueData.teams.find(t => t.id === myTeamId);
                        
                        if (myTeam.budget < 10) {
                            alert("Bütçeniz yetersiz olduğu için transfer son anda iptal oldu!");
                            window.budget += 10; // Bütçeyi geri ver (resolve içinde düştüğü için)
                            return;
                        }
                        
                        alert("Son Gün Fırsatı! Çok tecrübeli yıldız oyuncu kadroya katıldı. Taraftar bu son dakika transferinden çok memnun.");
                        window.leagueData.players.push({
                            id: "deadline_bargain_" + Date.now(),
                            name: "Fırsat Yıldızı",
                            teamId: myTeamId,
                            position: "OS",
                            power: 80,
                            speed: 65,
                            age: 33,
                            happiness: 'Mutlu',
                            loyalty: 80
                        });
                    }
                } 
            },
            { 
                text: "İlgilenmiyorum, Kadrom Yeterli", 
                effect: { 
                    customAction: () => alert("Transferi reddettiniz. Bütçeniz korundu.")
                } 
            }
        ]
    },
    {
        type: "winStreak",
        condition: () => window.consecutiveWins >= 3,
        title: "Şımarık Yıldız",
        desc: "Takımın formda olmasını fırsat bilen yıldız bir oyuncunuz odanıza girdi: 'Hocam, takım uçuyor ve benim payım büyük. Sözleşmeme acil zam istiyorum, yoksa idmana çıkmam!'",
        options: [
            { text: "Zam Yap (Bütçe -1M€, Sadakat +)", effect: { budget: -1000000, authority: -5, loyalty: 10 } },
            { text: "Kadro Dışı Bırak (Otorite +, Sadakat -)", effect: { budget: 0, authority: 10, loyalty: -20 } },
            { text: "Tatlı Dille İkna Et (%50 Şans)", effect: { budget: 0, authority: 0, loyalty: "random" } }
        ]
    },
    {
        type: "winStreak",
        condition: () => window.consecutiveWins >= 3,
        title: "Yeni Sponsor Teklifi",
        desc: "Takımın arka arkaya aldığı galibiyetler dev firmaların dikkatini çekti. Bir sponsor size 2.000.000€ teklif ediyor ancak bir şartları var: Bu hafta röportajlarda onların ürününü övmelisiniz.",
        options: [
            { text: "Kabul Et (Bütçe +2M€, Karizma -)", effect: { budget: 2000000, authority: -10, loyalty: 0 } },
            { text: "Reddet (Otorite +)", effect: { budget: 0, authority: 10, loyalty: 0 } }
        ]
    },
    {
        type: "loseStreak",
        condition: () => window.consecutiveLosses >= 3,
        title: "Taraftar Pususu",
        desc: "Antrenman çıkışında öfkeli bir taraftar grubu otobüsünüzün önünü kesti. 'Bu forma size ağır' diye bağırıyorlar ve otobüsü tekmeliyorlar!",
        options: [
            { text: "Aşağı İn ve Yüzleş (Otorite +, Başkan -)", effect: { budget: 0, authority: 15, loyalty: 5, president: -10 } },
            { text: "Şoföre 'Gaza Bas' De (Güvenlik)", effect: { budget: 0, authority: -15, loyalty: -10, president: 0 } }
        ]
    },
    {
        type: "loseStreak",
        condition: () => window.consecutiveLosses >= 2,
        title: "Yönetim Krizi",
        desc: "Kötü gidişatın ardından Başkan seni acil bir toplantıya çağırdı. Kapıyı sertçe kapatıp kükredi: 'Bak hoca! Sustum, sustum ama artık yeter! Sana güvendik, ilk 11'i sana özel kurduk. Al dediğin tüm oyuncuları aldım, gönder dediğin tüm oyuncuları gönderdim! Bu ne hal? Bu takım neden böyle?!'",
        options: [
            { text: "Süre İste (Politik)", effect: { budget: 0, authority: -5, loyalty: 0, president: -5 } },
            { text: "Hakemleri ve Fikstürü Suçla (Bahaneci)", effect: { budget: 0, authority: -10, loyalty: -5, president: -15 } },
            { text: "Benim İşim Sahada (Diklen)", effect: { budget: 0, authority: 10, loyalty: 0, president: -20 } }
        ]
    },
    {
        type: "random",
        condition: () => true,
        title: "Gece Kulübü Skandalı",
        desc: "Sabah gazetelerde bir haber: As oyuncularından biri dün gece lüks bir kulüpte sabaha kadar eğlenmiş ve idmana akşamdan kalma geldi.",
        options: [
            { text: "Para Cezası Ver (Bütçe +50K€, Sadakat -)", effect: { budget: 50000, authority: 5, loyalty: -10 } },
            { text: "Üstünü Ört (Sadakat +, Otorite -)", effect: { budget: 0, authority: -15, loyalty: 15 } }
        ]
    }
, 
    {
        type: "rpg30_01",
        condition: () => Math.random() < 0.25,
        title: "�� Sosyal Medya Çılgınlığı",
        desc: "Yıldız oyuncun maçtan bir gün önce ezeli rakibin logosunu beğenerek büyük bir kaos yarattı. Taraftarlar tesisleri basmak üzere!",
        options: [
            { text: 'Kadro Dışı Bırak', effect: { authority: 15, loyalty: -15, customAction: () => alert('Oyuncuyu cezalandırdın. Otoriten arttı ama takımın huzuru kaçtı.') } },
            { text: 'Hesabı Hacklenmiş Gibi Davran', effect: { authority: -10, loyalty: 10, president: 5, customAction: () => alert('Oyuncuyu korudun. Taraftar inandı ve kriz çözüldü.') } }
        ]
    },
    {
        type: "rpg30_02",
        condition: () => Math.random() < 0.25,
        title: "�� Prim Kavgası",
        desc: "Kaptan, yönetimden söz verilen galibiyet primlerinin yatmadığını söyleyerek antrenmana çıkmayı reddediyor.",
        options: [
            { text: 'Yönetime Baskı Yap', effect: { loyalty: 20, president: -20, customAction: () => alert('Başkanla kavga edip parayı kopardın. Takım sana tapıyor ama başkan sinirli.') } },
            { text: 'Oyuncuları Fırçala', effect: { authority: 20, loyalty: -20, customAction: () => alert('Para için mi oynuyorsunuz! diyerek idmanı başlattın. Moraller bozuk.') } }
        ]
    },
    {
        type: "rpg30_03",
        condition: () => Math.random() < 0.25,
        title: "��️ Rakip Takım Casusu",
        desc: "Tesislerin üzerinde uçan yabancı bir drone tespit edildi! Taktik idmanı gizlice kaydediyor olabilirler.",
        options: [
            { text: 'İdmanı Gizli Salona Al', effect: { authority: 5, president: 5, customAction: () => alert('Önlem aldın, casusluk girişimi boşa çıktı.') } },
            { text: 'Sahte Taktik Çalıştır', effect: { authority: 10, customAction: () => alert('Rakibi yanıltmak için bilerek yanlış diziliş çalıştın! Çok zekice.') } }
        ]
    },
    {
        type: "rpg30_04",
        condition: () => Math.random() < 0.20,
        title: "�� Diyetisyen Skandalı",
        desc: "Takımın en önemli iki oyuncusu gece yarısı gizlice dürümcüde yakalandı. Fotoğraflar basına sızdı.",
        options: [
            { text: 'Ağır Para Cezası Ver (Bütçe +20K)', effect: { budget: 20000, authority: 10, loyalty: -10 } },
            { text: 'Birlikte Yemeğe Gidin (PR Çalışması)', effect: { authority: -5, loyalty: 15, customAction: () => alert('Olayı şakaya vurup tüm takımı kebaba götürdün. Medya bu sempatik tavrı sevdi.') } }
        ]
    },
    {
        type: "rpg30_05",
        condition: () => Math.random() < 0.20,
        title: "Kavgal� Antrenman",
        desc: "�ift kale ma� s�ras�nda iki oyuncun birbirine girdi ve yumrukla�t�. Antrenman sahas�nda kan donduran bir gerilim var.",
        options: [
            { text: 'İkisini de Oyundan Al', effect: { authority: 20, loyalty: -15, customAction: () => alert('Taviz vermedin! Maçı kaybetme riskini aldın ama disiplini sağladın.') } },
            { text: 'Barıştır ve Sahaya Sür', effect: { authority: -10, loyalty: 10, customAction: () => alert('Zorla sarıldırıp sahaya gönderdin. Sorun şimdilik halının altına süpürüldü.') } }
        ]
    },
    {
        type: "rpg30_06",
        condition: () => Math.random() < 0.20,
        title: "�� Gece Yarısı Araması",
        desc: "Gece saat 03:00. Kulüp başkanı seni alkollü şekilde arayıp yarınki maçta hangi taktikle oynaman gerektiğini dikte ediyor.",
        options: [
            { text: 'Telefonu Yüzüne Kapat', effect: { authority: 15, president: -30, customAction: () => alert('Haddini bildirdin. Başkan ertesi gün bu durumu unutmayacak!') } },
            { text: 'Alttan Al ve Haklısın De', effect: { authority: -15, president: 20, customAction: () => alert('Gururunu hiçe sayıp başkanı pohpohladın. Koltuğun şimdilik güvende.') } }
        ]
    },
    {
        type: "rpg30_07",
        condition: () => Math.random() < 0.25,
        title: "��️ Çevirmen Krizi",
        desc: "Yabancı oyunculara taktiksel uyarılarda bulunurken, çevirmenin sözlerini yumuşatarak aktardığını fark ettin.",
        options: [
            { text: 'Çevirmeni Hemen Kov', effect: { authority: 20, loyalty: -5, customAction: () => alert('Otoriteni gösterdin ama yabancı oyuncularla iletişimin kısa süreliğine koptu.') } },
            { text: 'Çevirmeni Kenara Çek ve Uyar', effect: { authority: 5, loyalty: 5, customAction: () => alert('Krizi profesyonelce yönettin.') } }
        ]
    },
    {
        type: "rpg30_08",
        condition: () => Math.random() < 0.15,
        title: "⭐ VIP Davetiye Krizi",
        desc: "Yıldız oyuncular, derbi maçı için ailelerine ayrılan VIP bilet sayısının yetersiz olmasından dolayı isyan çıkardı.",
        options: [
            { text: 'Kendi Locanı Onlara Ver', effect: { authority: -10, loyalty: 20, customAction: () => alert('Büyük bir fedakarlık yaptın, oyuncular bu hareketini unutmayacak.') } },
            { text: 'Kulüp Kuralları Kesindir De', effect: { authority: 10, loyalty: -15, customAction: () => alert('Ayrıcalık yapmadın ama moraller fena bozuldu.') } }
        ]
    },
    {
        type: "rpg30_09",
        condition: () => window.managerAuthority < 40,
        title: "�� Forma Numarası Kavgası",
        desc: "Yeni transfer edilen yıldız oyuncu, takımın eski kaptanının giydiği 10 numaralı formayı istiyor. İkisi de geri adım atmıyor.",
        options: [
            { text: 'Kaptana Destek Ol', effect: { loyalty: 15, customAction: () => alert('Kaptanı korudun. Yeni transfer sana cephe aldı.') } },
            { text: 'Formayı Yeni Yıldıza Ver', effect: { authority: 10, loyalty: -20, customAction: () => alert('Otoriteni kullanarak kararı sen verdin ama takım içi hiyerarşiyi paramparça ettin.') } }
        ]
    },
    {
        type: "rpg30_10",
        condition: () => Math.random() < 0.20,
        title: "�� Sponsor Çekimi",
        desc: "Kulübün ana sponsoru, tam da taktik idmanının olduğu saatte tüm takımın reklam çekiminde olmasını dayatıyor.",
        options: [
            { text: 'İdmanı İptal Et (Bütçe +100K€)', effect: { budget: 100000, authority: -15, president: 15 } },
            { text: 'Sponsoru Reddet!', effect: { budget: -50000, authority: 20, president: -25, customAction: () => alert('Önce futbol dedin! Yönetim kriz geçirdi.') } }
        ]
    },
    {
        type: "rpg30_11",
        condition: () => Math.random() < 0.10,
        title: "�� Astroloji Çılgınlığı",
        desc: "Takımın en formda oyuncusu, Merkür Retrosu olduğu için bu hafta sahaya çıkarsa ayağının kırılacağına inanıyor.",
        options: [
            { text: 'Kadroya Alma', effect: { authority: -5, loyalty: 5, customAction: () => alert('Deliliğe boyun eğdin ama oyuncunu kaybetmedin.') } },
            { text: 'Zorla Oynat', effect: { authority: 15, loyalty: -10, customAction: () => alert('Batıl inançlara yer yok dedin. Oyuncu sahada korkudan titreyerek oynayacak.') } }
        ]
    },
    {
        type: "rpg30_12",
        condition: () => Math.random() < 0.20,
        title: "Antrenman �syan�",
        desc: "�ift kale idmanda oyuna almak istedi�in bir yedek oyuncu, 'Ben yedek tak�mla oynamam' diyerek �s�nmay� reddetti.",
        options: [
            { text: 'Süresiz Kadro Dışı Bırak', effect: { authority: 25, president: -5, customAction: () => alert('Taviz vermedin! Oyuncunun bileti kesildi.') } },
            { text: 'Maç Sonu Özel Olarak Görüş', effect: { authority: -10, loyalty: 10, customAction: () => alert('Krizi basının önünde büyütmedin ama diğer oyuncular zayıfladığını düşünüyor.') } }
        ]
    },
    {
        type: "rpg30_13",
        condition: () => Math.random() < 0.15,
        title: "�� Trafik Kazası",
        desc: "Genç yıldızınız gece geç saatlerde lüks aracıyla ufak bir kaza yaptı. Sağlığı iyi ama basın olayı abartıyor.",
        options: [
            { text: 'Arkasına Dur ve Savun', effect: { authority: -5, loyalty: 15, customAction: () => alert('Oyuncunu medyanın önüne atmadın.') } },
            { text: 'Para Cezası Ver (Bütçe +30K)', effect: { budget: 30000, authority: 15, loyalty: -15 } }
        ]
    },
    {
        type: "rpg30_14",
        condition: () => Math.random() < 0.15,
        title: "�� Eşler Arası Kavga",
        desc: "İki oyuncunun eşleri (WAGs) Instagram üzerinden birbirlerine ağır hakaretler etti. Bu durum saha içine de sıçradı.",
        options: [
            { text: 'Aileleri Topla ve Arabuluculuk Yap', effect: { authority: 5, loyalty: 10, customAction: () => alert('Terapist gibi davrandın ve takımın bağlarını güçlendirdin.') } },
            { text: 'Beni İlgilendirmez De', effect: { authority: -10, loyalty: -10, customAction: () => alert('Sorunu görmezden geldin, saha içinde paslaşmamaya başladılar.') } }
        ]
    },
    {
        type: "rpg30_15",
        condition: () => window.managerAuthority < 50,
        title: "�� Küfürlü Pankart",
        desc: "Bir grup taraftar, antrenman sahasının tellerine doğrudan sana yönelik hakaret içeren bir pankart astı.",
        options: [
            { text: 'Pankartı İndirt ve Dava Aç', effect: { authority: 15, president: -10, customAction: () => alert('Taraftarla savaşa girdin! Otoriten arttı ama camia ikiye bölündü.') } },
            { text: 'Görmezden Gel', effect: { authority: -15, customAction: () => alert('Pasif kaldın. Medya zayıflığını manşetlere taşıdı.') } }
        ]
    },
    {
        type: "rpg30_16",
        condition: () => Math.random() < 0.20,
        title: "�� Menajer Tehdidi",
        desc: "Yıldız bir oyuncunun menajeri odanı basıp, 'Oyuncumu her maç 90 dakika oynatmazsan onu sezon sonu bedavaya götürürüm' dedi.",
        options: [
            { text: 'Menajeri Odadan Kov!', effect: { authority: 20, president: -15, customAction: () => alert('Şantaja boyun eğmedin! Başkan finansal kayıp yaşanacağı için sinirli.') } },
            { text: 'Söz Ver ve Kabul Et', effect: { authority: -25, loyalty: -10, customAction: () => alert('Boyun eğdin. Takımdaki diğer oyuncular menajerlerin kulübü yönettiğini düşünüyor.') } }
        ]
    },
    {
        type: "rpg30_17",
        condition: () => Math.random() < 0.20,
        title: "�� Sahte Sakatlık İddiası",
        desc: "Sağlık ekibi, kritik maç öncesi oynamak istemeyen bir oyuncunun sakatlık numarası yaptığını raporladı.",
        options: [
            { text: 'Basına İfşa Et', effect: { authority: 20, loyalty: -25, customAction: () => alert('Oyuncuyu bitirdin! Disiplin sağlandı ama oyuncular sana güvenmiyor.') } },
            { text: 'Gizlice Para Cezası Kes', effect: { budget: 15000, authority: 5, loyalty: 5 } }
        ]
    },
    {
        type: "rpg30_18",
        condition: () => Math.random() < 0.15,
        title: "�� Gıda Zehirlenmesi",
        desc: "Deplasman kafilesindeki 3 as oyuncun otelde yedikleri tavuk yüzünden zehirlendi. Mide bulantısıyla oynayamazlar.",
        options: [
            { text: 'Oteli Mahkemeye Ver', effect: { authority: 10, president: 5, customAction: () => alert('Suçu otelde aradın. Olay medyatik oldu ama oyuncular hala eksik.') } },
            { text: 'Taktik Değiştirip Gençleri Sür', effect: { loyalty: 15, customAction: () => alert('Krizi fırsata çevirdin, gençler bu güvenini boşa çıkarmayacaktır.') } }
        ]
    },
    {
        type: "rpg30_19",
        condition: () => Math.random() < 0.10,
        title: "�� Kötü Şans Tılsımı",
        desc: "Üst üste alınan kötü sonuçlardan sonra oyuncular, soyunma odasında 'büyü' olduğuna inanıp bir Şaman çağırmak istiyor.",
        options: [
            { text: 'İzin Ver (Bütçe -5K€)', effect: { budget: -5000, authority: -10, loyalty: 15, customAction: () => alert('Soyunma odasında tütsüler yakıldı. Medyaya sızarsa dalga konusu olursun.') } },
            { text: 'Saçmalamayın! İdmana Çıkın!', effect: { authority: 15, loyalty: -15, customAction: () => alert('Bilimi savundun ama oyuncuların psikolojisi hala bozuk.') } }
        ]
    },
    {
        type: "rpg30_20",
        condition: () => Math.random() < 0.10,
        title: "�� Kumar Borcu",
        desc: "En iyi golcün, mafyaya olan yüklü kumar borcu yüzünden tehdit alıyor ve sahaya odaklanamıyor.",
        options: [
            { text: 'Borcu Kulüp Bütçesinden Öde (-200K€)', effect: { budget: -200000, loyalty: 30, president: -40, customAction: () => alert('Büyük risk aldın. Başkan çıldırdı ama oyuncu senin için canını verir.') } },
            { text: 'Kadro Dışı Bırak ve Polise Ver', effect: { authority: 20, loyalty: -10, customAction: () => alert('Temiz futbol dedin! Yıldızını kaybettin ama kulübü korudun.') } }
        ]
    },
    {
        type: "rpg30_21",
        condition: () => window.managerAuthority < 60,
        title: "�� Rakip Hocayla Söz Dalaşı",
        desc: "Rakip takımın teknik direktörü basın toplantısında senin taktik bilginle dalga geçip seni aşağıladı.",
        options: [
            { text: 'Sert Yanıt Ver (Polemik)', effect: { authority: 15, president: -5, customAction: () => alert('Savaş başlattın! Taraftar bu dik duruşunu sevdi.') } },
            { text: 'Cevabı Sahada Vereceğiz De', effect: { authority: -5, president: 10, customAction: () => alert('Polemiğe girmedin. Başkan bu klas tavrını takdir etti.') } }
        ]
    },
    {
        type: "rpg30_22",
        condition: () => Math.random() < 0.20,
        title: "�� Transfer Sızıntısı",
        desc: "Aylardır gizlice yürüttüğün yıldız transfer görüşmesi basına sızdı ve ezeli rakibin fiyat artırmak için devreye girdi.",
        options: [
            { text: 'Bütçeyi Zorla (Teklifi Artır)', effect: { budget: -300000, president: -15, customAction: () => alert('Kesenin ağzını açtın! Transfer büyük ihtimalle senin olacak ama başkan kızgın.') } },
            { text: 'Masadan Kalk', effect: { authority: 15, customAction: () => alert('Kimse bu kulüpten büyük değildir dedin ve transferden vazgeçtin.') } }
        ]
    },
    {
        type: "rpg30_23",
        condition: () => Math.random() < 0.15,
        title: "�� Gizli Parti Skandalı",
        desc: "Sokağa çıkma yasağı / kamp kuralları ihlal edilerek 5 oyuncunun lüks bir yatta parti yaptığı video internete düştü.",
        options: [
            { text: 'Hepsine Ağır Ceza (Bütçe +100K€)', effect: { budget: 100000, authority: 20, loyalty: -20 } },
            { text: 'Videoyu Yalanla (Medya Savaşı)', effect: { authority: -10, loyalty: 20, customAction: () => alert('Yalan söyledin ve oyuncularını korudun. Medya senin ipini çekmek için bekliyor olacak.') } }
        ]
    },
    {
        type: "rpg30_24",
        condition: () => window.presidentConfidence > 60,
        title: "�� Prim Bağışı Talebi",
        desc: "Takım, son galibiyet primini tamamıyla bir çocuk hastanesine bağışlamak istediklerini açıkladı.",
        options: [
            { text: 'Kulüp Olarak Destekle (Bütçe -50K€)', effect: { budget: -50000, loyalty: 20, president: 15, customAction: () => alert('Harika bir PR çalışması! Bütün ülke sizi konuşuyor.') } },
            { text: 'Kendi Paranızla Yapın De', effect: { authority: 10, loyalty: -15, customAction: () => alert('Soğuk bir tepki verdin. Medya bu tavrını acımasız buldu.') } }
        ]
    },
    {
        type: "rpg30_25",
        condition: () => Math.random() < 0.20,
        title: "��️ Özel Röportaj Krizi",
        desc: "Yedek kalan tecrübeli bir oyuncu, kendi ülkesinin basınına konuşarak senin adaletsiz bir teknik adam olduğunu söyledi.",
        options: [
            { text: 'Sözleşmesini Feshet! (Bütçe -150K€)', effect: { budget: -150000, authority: 25, president: -20, customAction: () => alert('Tazminatını ödeyip gönderdin! Kimse sana meydan okuyamaz.') } },
            { text: 'Kulübeye Hapset', effect: { authority: 10, loyalty: -10, customAction: () => alert('Maaşını ödemeye devam edip çürümeye bıraktın.') } }
        ]
    },
    {
        type: "rpg30_26",
        condition: () => Math.random() < 0.10,
        title: "⚖️ Şike İddiası",
        desc: "İsimsiz bir sosyal medya hesabı, son derbide oyuncularından birinin bilerek hata yaptığını ve şikeye karıştığını iddia etti.",
        options: [
            { text: 'Oyuncuyla Acil Toplantı Yap', effect: { authority: 10, loyalty: -5, customAction: () => alert('Sert bir dille sorguladın. Oyuncu yemin ederek reddetti.') } },
            { text: 'Hesabı Mahkemeye Ver', effect: { loyalty: 15, president: 10, customAction: () => alert('Camia kenetlendi, dış düşmanlara karşı savaş açıldı!') } }
        ]
    },
    {
        type: "rpg30_27",
        condition: () => Math.random() < 0.20,
        title: "✈️ Uçak Rötari",
        desc: "Kritik deplasman maçı öncesi havaalanında yoğun sis nedeniyle uçak 6 saat rötar yaptı. Oyuncular havalimanında perişan oldu.",
        options: [
            { text: 'Havalimanında Antrenman Yaptır', effect: { authority: 15, loyalty: -20, customAction: () => alert('Bekleme salonunda esneme hareketleri yaptırdın. Oyuncular senden nefret etti.') } },
            { text: 'Serbest Zaman Ver', effect: { authority: -5, loyalty: 10, customAction: () => alert('Oyuncular kafelerde dinlenip moral depoladı.') } }
        ]
    },
    {
        type: "rpg30_28",
        condition: () => Math.random() < 0.15,
        title: "Hakem Atamas� �syan�",
        desc: "Ba�kan hafta i�i yan�na gelerek: 'Bu hafta sonu ma��m�za o tetik�i hakemi atam��lar! Federasyonu bas�p ortal��� aya�a kald�raca��m!' diye ba��rd�.",
        options: [
            { text: 'Başkanı Fiziksel Olarak Engelle', effect: { authority: 20, president: -30, customAction: () => alert('Büyük skandalı önledin ama başkanla ilişkilerin koptu kopacak!') } },
            { text: 'Beraber Basalım Başkanım!', effect: { authority: -20, loyalty: 10, president: 30, customAction: () => alert('Eyyamın dibine vurdun! Hakem korkudan ikinci yarı eyyam yapacak.') } }
        ]
    },
    {
        type: "rpg30_29",
        condition: () => Math.random() < 0.20,
        title: "�� Yoga ve Meditasyon",
        desc: "Eski bir futbolcu olan ünlü bir yaşam koçu, takıma gönüllü olarak nefes ve meditasyon dersleri vermek istiyor.",
        options: [
            { text: 'Kabul Et (Takım İçi Uyum)', effect: { authority: -5, loyalty: 15, customAction: () => alert('Oyuncular çimlerde lotus duruşu yaparak stres attı.') } },
            { text: 'Futbol Sahasında Yoga Olmaz!', effect: { authority: 10, loyalty: -10, customAction: () => alert('Kovdun! Bizim işimiz savaşmak dedin.') } }
        ]
    },
    {
        type: "rpg30_30",
        condition: () => Math.random() < 0.25,
        title: "��️ Taraftar Tesis Basması",
        desc: "Son alınan kötü sonuçlardan dolayı maskeli bir grup taraftar tesislere girip meşalelerle antrenmanı böldü.",
        options: [
            { text: 'Polis Çağır', effect: { authority: 10, president: -10, customAction: () => alert('Taraftarları polise teslim ettin. Camianın ağır abileri bu kararını sevmedi.') } },
            { text: 'Karşılarına Çık ve Yüzleş', effect: { authority: 20, loyalty: 20, president: 10, customAction: () => alert('Korkusuzca aralarına girip onlara söz verdin. Liderliğini herkese kanıtladın!') } }
        ]
    }
];

window.currentDynamicEvent = null;

window.triggerDynamicEvent = function() {
    window.usedDynamicEvents = window.usedDynamicEvents || [];
    
    // Şartları sağlayan ve daha önce gösterilmemiş eventleri filtrele
    let availableEvents = window.dynamicEventsPool.filter(e => e.condition() && !window.usedDynamicEvents.includes(e.title));
    
    // Eğer tüm eventler tükendiyse veya uygun kalmadıysa havuzu sıfırla
    if (availableEvents.length === 0) {
        window.usedDynamicEvents = [];
        availableEvents = window.dynamicEventsPool.filter(e => e.condition());
        if (availableEvents.length === 0) return; // Hala şartı sağlayan yoksa çık
    }

    // Rastgele birini seç
    window.currentDynamicEvent = availableEvents[Math.floor(Math.random() * availableEvents.length)];
    window.usedDynamicEvents.push(window.currentDynamicEvent.title);
    if (window.usedDynamicEvents.length > 50) window.usedDynamicEvents.shift();
    
    // UI Güncelle
    if(document.getElementById('dynamic-event-title')) document.getElementById('dynamic-event-title').innerHTML = '<span aria-hidden="true">🚨</span> ' + window.currentDynamicEvent.title;
    if(typeof speak === 'function') setTimeout(() => speak("Beklenmedik Olay: " + window.currentDynamicEvent.title), 300);
    if(document.getElementById('dynamic-event-desc')) document.getElementById('dynamic-event-desc').innerHTML = "<p>" + window.currentDynamicEvent.desc + "</p>";
    
    let optionsContainer = document.getElementById('dynamic-event-options');
    optionsContainer.innerHTML = '';
    
    window.currentDynamicEvent.options.forEach((opt, index) => {
        let btn = document.createElement('button');
        btn.className = 'menu-button';
        btn.style.background = "#2980b9";
        btn.textContent = opt.text;
        btn.onclick = () => window.resolveDynamicEvent(index);
        optionsContainer.appendChild(btn);
    });

    // Modalı Göster
    document.getElementById('dynamic-event-modal').style.display = 'flex'; if(document.getElementById('dynamic-event-modal')) { let title = document.getElementById('dynamic-event-modal').querySelector('h1, h2'); if(title) title.focus(); else document.getElementById('dynamic-event-modal').focus(); };
};

window.resolveDynamicEvent = function(optIndex) {
    if (!window.currentDynamicEvent) return;
    
    let opt = window.currentDynamicEvent.options[optIndex];
    let eff = opt.effect;
    
    // [YENİ] Oyunu Kazanma Kontrolü (Kademeli)
    if (eff.winGameTier && typeof window.triggerGameWon === 'function') {
        if(document.getElementById('dynamic-event-modal')) document.getElementById('dynamic-event-modal').style.display = 'none';
        window.triggerGameWon(eff.winGameTier);
        window.currentDynamicEvent = null;
        return;
    }
    
    // Bütçe
    if (eff.budget && window.budget !== undefined) {
        if (isNaN(window.budget)) window.budget = 10;
        window.budget += eff.budget;
        if(window.budget < 0) window.budget = 0;
    }
    
    // Otorite ve Başkan
    if (eff.authority !== undefined && window.managerAuthority !== undefined) {
        if (isNaN(window.managerAuthority)) window.managerAuthority = 50;
        window.managerAuthority += eff.authority;
        if(window.managerAuthority > 100) window.managerAuthority = 100;
        if(window.managerAuthority < 0) window.managerAuthority = 0;
    }
    if (eff.president !== undefined && window.presidentConfidence !== undefined) {
        if (isNaN(window.presidentConfidence)) window.presidentConfidence = 50;
        window.presidentConfidence += eff.president;
        if(window.presidentConfidence > 100) window.presidentConfidence = 100;
        if(window.presidentConfidence < 0) window.presidentConfidence = 0;
    }
    
    // Sadakat (Rastgele durum için)
    let loyaltyChange = eff.loyalty;
    if (eff.loyalty === "random") {
        loyaltyChange = Math.random() < 0.5 ? 15 : -15; // Ya tutar ya ters teper
    }
    
    if (loyaltyChange !== 0 && window.leagueData && window.leagueData.players) {
        window.leagueData.players.forEach(p => {
            if (p.teamId === window.myTeamId) {
                if (p.loyalty === undefined) p.loyalty = 50;
                p.loyalty += loyaltyChange;
                if (p.loyalty > 100) p.loyalty = 100;
                if (p.loyalty < 0) p.loyalty = 0;
            }
        });
    }
    
    // [YENİ] Özel Aksiyon (Custom Action) Çalıştırma
    if (typeof eff.customAction === 'function') {
        eff.customAction();
    }
    
    if (typeof updateStatsUI === 'function') updateStatsUI();
    
    // Kapat
    if(document.getElementById('dynamic-event-modal')) document.getElementById('dynamic-event-modal').style.display = 'none';
    window.currentDynamicEvent = null;
};



window.checkManagerEvolution = function() {
    if (!window.managerStats) return;
    
    let stats = window.managerStats;
    let oldProfile = window.managerProfile;
    let newProfile = null;
    let title = "";
    let desc = "";

    // Evrim Şartları
    // Önceden "tarafsiz" şartı vardı, şimdi kaldırıldı. Sadece mevcut profilinden farklı bir şey baskınsa geçiş yapar.
    // Eşikleri her geçişte artırmak veya sayaçları sıfırlamak (Sıfırlamayı tercih edeceğiz)
    if (stats.comebackWins >= 2 && oldProfile !== 'motivasyon_ustasi') {
        newProfile = 'motivasyon_ustasi';
        title = "�� Yeni Tarz: Motivasyon Ustası!";
        desc = "Geriye düştüğün maçları çevirmekteki ustalığınla biliniyorsun. Basın artık sana 'Motivasyon Ustası' diyor!";
    } else if (stats.crisisAvertedCount >= 10 && oldProfile !== 'itfaiyeci') {
        newProfile = 'itfaiyeci';
        title = "�� Yeni Tarz: İtfaiyeci (Kriz Yöneticisi)!";
        desc = "Krizdeki bir takımı ipten almak senin işin. Basın sana 'İtfaiyeci' lakabını taktı!";
    } else if (stats.defensiveMinutes > 15000 && oldProfile !== 'pragmatist') {
        newProfile = 'pragmatist';
        title = "��️ Yeni Tarz: Pragmatist (Sonuç Odaklı)!";
        desc = "Savunma ve sertliğe verdiğin önem basının dikkatinden kaçmadı. Artık 'Pragmatist' olarak anılıyorsun.";
    } else if (stats.passingMinutes > 15000 && oldProfile !== 'taktik_deha') {
        newProfile = 'taktik_deha';
        title = "♟️ Yeni Tarz: Taktik Deha (Satranç Ustası)!";
        desc = "Ofansif ve paslı oyun tarzın seni bir 'Taktik Deha' yaptı.";
    } else if (stats.youngPlayerMinutes > 40000 && oldProfile !== 'proje_hocasi') {
        newProfile = 'proje_hocasi';
        title = "�� Yeni Tarz: Proje Hocası (Öğretmen)!";
        desc = "Gençlere verdiğin önem sayesinde 'Proje Hocası' unvanını aldın.";
    }

    if (newProfile && newProfile !== oldProfile) {
        window.managerProfile = newProfile;
        
        // Tarz değiştiğinde sayaçları %50 azalt ki sürekli git-gel yaşanmasın (Dinamik geçişin bedeli)
        window.managerStats.defensiveMinutes = Math.floor(window.managerStats.defensiveMinutes / 2);
        window.managerStats.passingMinutes = Math.floor(window.managerStats.passingMinutes / 2);
        window.managerStats.youngPlayerMinutes = Math.floor(window.managerStats.youngPlayerMinutes / 2);
        window.managerStats.comebackWins = 0;
        window.managerStats.crisisAvertedCount = 0;
        
        // Evrim tamamen sessiz gerçekleşir (Kullanıcı kendi tarzını biliyor)
        if (typeof saveGame === 'function') saveGame(true);
    }
};



// Eksik UI Fonksiyonları
window.updateLeagueStandingsUI = function() {
    const container = document.getElementById('standings-content');
    if (!container) return;
    
    if (!window.leagueTable) {
        container.innerHTML = "<p style='color:red;'>Lig henüz başlamadı.</p>";
        return;
    }
    
    let teams = Object.keys(window.leagueTable).map(tid => {
        let tData = window.leagueTable[tid];
        let tObj = window.leagueData.teams.find(t => t.id === tid);
        return {
            id: tid,
            name: tObj ? tObj.name : "Bilinmeyen Takım",
            p: tData.p || 0,
            w: tData.w || 0,
            d: tData.d || 0,
            l: tData.l || 0,
            gf: tData.gf || 0,
            ga: tData.ga || 0,
            gd: (tData.gf || 0) - (tData.ga || 0),
            pts: tData.pts || 0
        };
    });
    
    // Sıralama: Puan > Averaj > Atılan Gol
    teams.sort((a, b) => {
        if (b.pts !== a.pts) return b.pts - a.pts;
        if (b.gd !== a.gd) return b.gd - a.gd;
        return b.gf - a.gf;
    });
    
    let html = `
    <table style="width:100%; text-align:center; color:#fff; border-collapse: collapse;">
        <thead>
            <tr style="background:#2c3e50; color:#f1c40f;">
                <th style="padding:10px; text-align:left;">Sıra</th>
                <th style="padding:10px; text-align:left;">Takım</th>
                <th title="Oynanan" style="padding:10px;">O</th>
                <th title="Galibiyet" style="padding:10px;">G</th>
                <th title="Beraberlik" style="padding:10px;">B</th>
                <th title="Mağlubiyet" style="padding:10px;">M</th>
                <th title="Averaj" style="padding:10px;">AV</th>
                <th title="Puan" style="padding:10px;">P</th>
            </tr>
        </thead>
        <tbody>
    `;
    
    teams.forEach((t, i) => {
        let isMyTeam = (t.id === window.myTeamId);
        let rowStyle = isMyTeam ? "background:rgba(46, 204, 113, 0.2); font-weight:bold;" : "border-bottom: 1px solid rgba(255,255,255,0.1);";
        html += `
        <tr style="${rowStyle}">
            <td style="padding:10px; text-align:left;">${i+1}</td>
            <td style="padding:10px; text-align:left;">${t.name}</td>
            <td>${t.p}</td>
            <td>${t.w}</td>
            <td>${t.d}</td>
            <td>${t.l}</td>
            <td>${t.gd > 0 ? '+'+t.gd : t.gd}</td>
            <td style="color:#f1c40f;">${t.pts}</td>
        </tr>`;
    });
    
    html += `</tbody></table>`;
    container.innerHTML = html;
};

window.updateWorldRankingUI = function() {
    const container = document.getElementById('world-ranking-content');
    if (!container) return;
    
    if (!window.leagueData || !window.leagueData.teams) {
        container.innerHTML = "<p style='color:red;'>Veriler yüklenemedi.</p>";
        return;
    }
    
    let allTeams = [...window.leagueData.teams].filter(t => t.id !== "free_agent");
    allTeams.sort((a, b) => (b.power || 0) - (a.power || 0));
    
    let topTeams = allTeams.slice(0, 100);
    
    let html = `
    <table style="width:100%; text-align:left; color:#fff; border-collapse: collapse;">
        <thead>
            <tr style="background:#8e44ad; color:#fff;">
                <th style="padding:10px;">#</th>
                <th style="padding:10px;">Takım</th>
                <th style="padding:10px; text-align:center;">Güç</th>
                <th style="padding:10px; text-align:center;">Bütçe</th>
            </tr>
        </thead>
        <tbody>
    `;
    
    topTeams.forEach((t, i) => {
        let isMyTeam = (t.id === window.myTeamId);
        let rowStyle = isMyTeam ? "background:rgba(142, 68, 173, 0.4); font-weight:bold;" : "border-bottom: 1px solid rgba(255,255,255,0.1);";
        html += `
        <tr style="${rowStyle}">
            <td style="padding:10px;">${i+1}</td>
            <td style="padding:10px;">${t.name}</td>
            <td style="padding:10px; text-align:center;">${t.power}</td>
            <td style="padding:10px; text-align:center;">€${t.budget}M</td>
        </tr>`;
    });
    
    html += `</tbody></table>`;
    container.innerHTML = html;
};

window.updateFixtureUI = function() {
    const container = document.getElementById('fixture-content');
    if (!container) return;
    
    if (!window.fixture || window.fixture.length === 0) {
        container.innerHTML = "<p style='color:red;'>Fikstür bulunamadı veya henüz çekilmedi.</p>";
        return;
    }
    
    let weekIndex = (window.currentWeek || 1) - 1;
    if (weekIndex < 0) weekIndex = 0;
    if (weekIndex >= window.fixture.length) weekIndex = window.fixture.length - 1;
    
    let currentMatches = window.fixture[weekIndex];
    let html = `<h2 style="color:#e67e22; text-align:center; margin-bottom:20px;">Hafta ${weekIndex + 1}</h2>`;
    
    html += `<div style="display:flex; flex-direction:column; gap:10px;">`;
    
    currentMatches.forEach(m => {
        let hTeam = window.leagueData.teams.find(t => t.id === m.home);
        let aTeam = window.leagueData.teams.find(t => t.id === m.away);
        let hName = hTeam ? hTeam.name : "Bilinmiyor";
        let aName = aTeam ? aTeam.name : "Bilinmiyor";
        
        let hScoreStr = m.played ? m.homeScore : "-";
        let aScoreStr = m.played ? m.awayScore : "-";
        
        let isMyMatch = (m.home === window.myTeamId || m.away === window.myTeamId);
        let bg = isMyMatch ? "rgba(230, 126, 34, 0.2)" : "rgba(255,255,255,0.05)";
        let border = isMyMatch ? "1px solid #e67e22" : "1px solid rgba(255,255,255,0.1)";
        
        html += `
        <div style="display:flex; justify-content:space-between; align-items:center; background:${bg}; border:${border}; padding:15px; border-radius:8px;">
            <div style="flex:1; text-align:right; font-size:1.1rem; font-weight:${m.home === window.myTeamId ? 'bold' : 'normal'}; color:#fff;">${hName}</div>
            <div style="width:80px; text-align:center; font-size:1.4rem; font-weight:bold; background:#111; color:#f1c40f; padding:5px; border-radius:5px; margin:0 15px;">${hScoreStr} - ${aScoreStr}</div>
            <div style="flex:1; text-align:left; font-size:1.1rem; font-weight:${m.away === window.myTeamId ? 'bold' : 'normal'}; color:#fff;">${aName}</div>
        </div>`;
    });
    
    html += `</div>`;
    container.innerHTML = html;
};

