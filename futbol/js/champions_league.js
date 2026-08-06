// champions_league.js
// Şampiyonlar Ligi İsviçre Sistemi ve Eleme Turları (Knockout) Motoru

window.championsLeague = {
    isActive: false,
    isGroupStageFinished: false,
    leagueTable: [], // 36 Takım
    fixtures: [], // 8 haftalık maçlar (İsviçre Sistemi)
    currentMatchDay: 0,
    
    // Yabancı Devasa Takımlar
    eliteTeams: [
        { id: 'cl_rm', name: 'Real Madrid', power: 95, logo: '🛡️', budget: 500000000 },
        { id: 'cl_mci', name: 'Manchester City', power: 94, logo: '🦅', budget: 800000000 },
        { id: 'cl_bay', name: 'Bayern Munich', power: 92, logo: '🦁', budget: 400000000 },
        { id: 'cl_psg', name: 'PSG', power: 91, logo: '🗼', budget: 600000000 },
        { id: 'cl_liv', name: 'Liverpool', power: 90, logo: '🔴', budget: 300000000 },
        { id: 'cl_ars', name: 'Arsenal', power: 89, logo: '🔫', budget: 250000000 },
        { id: 'cl_bar', name: 'Barcelona', power: 88, logo: '🔵', budget: 150000000 },
        { id: 'cl_juv', name: 'Juventus', power: 87, logo: '🦓', budget: 200000000 },
        { id: 'cl_atm', name: 'Atletico Madrid', power: 86, logo: '🪓', budget: 150000000 },
        { id: 'cl_dor', name: 'Dortmund', power: 85, logo: '🐝', budget: 120000000 },
        { id: 'cl_int', name: 'Inter Milan', power: 88, logo: '🐍', budget: 180000000 },
        { id: 'cl_mil', name: 'AC Milan', power: 86, logo: '😈', budget: 160000000 },
        { id: 'cl_nap', name: 'Napoli', power: 85, logo: '🌋', budget: 140000000 },
        { id: 'cl_tot', name: 'Tottenham', power: 85, logo: '🐓', budget: 200000000 },
        { id: 'cl_che', name: 'Chelsea', power: 87, logo: '🦁', budget: 400000000 },
        { id: 'cl_mun', name: 'Man United', power: 86, logo: '😈', budget: 350000000 }
    ],

    // --- ELEME (KNOCKOUT) DEĞİŞKENLERİ ---
    knockoutStage: 'none', // none, playoff, round16, quarter, semi, final, completed
    knockoutFixtures: {}, // { playoff: [...], round16: [...], quarter: [...], semi: [...], final: [...] }
    knockoutWinners: {}, // Tur atlayan takımların ID'leri
    championId: null,

    init: function() {
        if (!window.leagueData || !window.myTeamId) return;
        
        let localTeams = [...window.leagueData.teams].sort((a,b) => b.power - a.power);
        let myTeam = localTeams.find(t => t.id === window.myTeamId);
        let participants = [myTeam];
        
        this.eliteTeams.forEach(t => {
            if (!window.leagueData.teams.find(lt => lt.id === t.id)) {
                window.leagueData.teams.push(t);
            }
            participants.push(t);
        });
        
        for (let i = 0; i < localTeams.length; i++) {
            if (participants.length >= 36) break;
            if (localTeams[i].id !== myTeam.id) {
                participants.push(localTeams[i]);
            }
        }
        
        let count = 36 - participants.length;
        for(let i=0; i<count; i++) {
            let bot = { id: 'cl_bot_'+i, name: 'Avrupa Rakibi '+i, power: 75 + Math.floor(Math.random()*15), logo: '⚔️', budget: 50000000 };
            window.leagueData.teams.push(bot);
            participants.push(bot);
        }

        this.leagueTable = participants.map(t => ({
            id: t.id, name: t.name, power: t.power || 70,
            points: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, gd: 0
        }));

        this.generateSwissFixtures();
        this.isActive = true;
        this.currentMatchDay = 0;
        this.isGroupStageFinished = false;
        
        // Reset Knockouts
        this.knockoutStage = 'none';
        this.knockoutFixtures = {};
        this.knockoutWinners = {};
        this.championId = null;
        
        if(typeof speak === 'function') speak("Şampiyonlar Ligi İsviçre Sistemi kuraları çekildi! 36 takımlık devler ligi maceramız başlıyor!");
        window.pendingDrawNews = true;
        this.renderUI();
    },

    generateSwissFixtures: function() {
        this.fixtures = [[], [], [], [], [], [], [], []]; // 8 Hafta
        let sortedTeams = [...this.leagueTable].sort((a,b) => b.power - a.power);
        let pot1 = sortedTeams.slice(0, 9);
        let pot2 = sortedTeams.slice(9, 18);
        let pot3 = sortedTeams.slice(18, 27);
        let pot4 = sortedTeams.slice(27, 36);
        
        let userOpponents = [];
        let pullFromPot = (pot, count) => {
            let available = pot.filter(t => t.id !== window.myTeamId);
            available.sort(() => Math.random() - 0.5);
            return available.slice(0, count);
        };
        
        userOpponents.push(...pullFromPot(pot1, 2));
        userOpponents.push(...pullFromPot(pot2, 2));
        userOpponents.push(...pullFromPot(pot3, 2));
        userOpponents.push(...pullFromPot(pot4, 2));
        userOpponents.sort(() => Math.random() - 0.5); 
        
        let userMatchDays = [];
        for (let i = 0; i < 8; i++) {
            let opp = userOpponents[i];
            let isHome = (i % 2 === 0);
            if (isHome) {
                this.fixtures[i].push({ h: window.myTeamId, a: opp.id, played: false });
            } else {
                this.fixtures[i].push({ h: opp.id, a: window.myTeamId, played: false });
            }
            userMatchDays.push(opp.id);
        }
        
        for (let w = 0; w < 8; w++) {
            let busyInWeek = [window.myTeamId, userMatchDays[w]];
            let availableBots = this.leagueTable.filter(t => !busyInWeek.includes(t.id));
            availableBots.sort(() => Math.random() - 0.5);
            for (let i = 0; i < availableBots.length; i += 2) {
                if (i + 1 < availableBots.length) {
                    this.fixtures[w].push({ h: availableBots[i].id, a: availableBots[i+1].id, played: false });
                }
            }
        }
    },

    // --- KNOCKOUT (ELEME) JENERATÖRLERİ ---
    
    // İsviçre tablosundan Play-Off kurasını çeker
    generatePlayoffs: function() {
        this.leagueTable.sort((a,b) => b.points - a.points || b.gd - a.gd || b.gf - a.gf);
        let playoffTeams = this.leagueTable.slice(8, 24); // 9th to 24th (16 teams)
        
        let seeded = playoffTeams.slice(0, 8); // 9-16
        let unseeded = playoffTeams.slice(8, 16); // 17-24
        unseeded.sort(() => Math.random() - 0.5);
        
        this.knockoutFixtures['playoff'] = [];
        for(let i=0; i<8; i++) {
            // Seeded takımlar ev sahibi olur (veya rastgele)
            this.knockoutFixtures['playoff'].push({ h: seeded[i].id, a: unseeded[i].id, played: false });
        }
        this.knockoutStage = 'playoff';
        if(typeof speak === 'function') speak("Şampiyonlar Ligi'nde lig aşaması bitti! 9 ile 24. sıra arasındaki takımlar için Ölüm Kalım Play-Off kuraları çekildi.");
        window.pendingDrawNews = true;
    },
    
    // Playoff kazananları ile İlk 8'i eşleştirir
    generateRound16: function() {
        this.leagueTable.sort((a,b) => b.points - a.points || b.gd - a.gd || b.gf - a.gf);
        let top8 = this.leagueTable.slice(0, 8); // 1-8
        let playoffWinners = this.knockoutWinners['playoff'] || [];
        
        // Dacă takım elenirse, id listesinden bulalım
        let unseeded = playoffWinners.map(id => this.leagueTable.find(t=>t.id === id));
        unseeded.sort(() => Math.random() - 0.5);
        
        this.knockoutFixtures['round16'] = [];
        for(let i=0; i<8; i++) {
            let opp = unseeded[i] ? unseeded[i].id : 'cl_bot_0';
            this.knockoutFixtures['round16'].push({ h: top8[i].id, a: opp, played: false });
        }
        this.knockoutStage = 'round16';
        if(typeof speak === 'function') speak("Son 16 kuraları çekildi! Devler arenaya iniyor.");
        window.pendingDrawNews = true;
    },
    
    // Kalan takımları eşleştirir
    generateGenericKnockout: function(nextStageStr, prevStageStr) {
        let prevWinners = this.knockoutWinners[prevStageStr] || [];
        let teams = prevWinners.map(id => this.leagueTable.find(t=>t.id === id)).filter(x=>x);
        teams.sort(() => Math.random() - 0.5);
        
        this.knockoutFixtures[nextStageStr] = [];
        for(let i=0; i<teams.length; i+=2) {
            if(teams[i+1]) {
                this.knockoutFixtures[nextStageStr].push({ h: teams[i].id, a: teams[i+1].id, played: false });
            }
        }
        this.knockoutStage = nextStageStr;
        if(typeof speak === 'function') {
            if(nextStageStr === 'quarter') speak("Çeyrek Final eşleşmeleri belli oldu! Kupa çok yakın.");
            else if(nextStageStr === 'semi') speak("Yarı Final! Sadece 4 büyük takım hayatta kaldı.");
            else if(nextStageStr === 'final') speak("BÜYÜK FİNAL! Şampiyonlar Ligi kupası sahibini buluyor!");
            window.pendingDrawNews = true;
        }
    },

    // --- MAÇ GÜNÜ KONTROLLERİ ---
    
    getCurrentMatches: function() {
        if (!this.isActive) return [];
        if (!this.isGroupStageFinished) return this.fixtures[this.currentMatchDay];
        if (this.knockoutStage !== 'none' && this.knockoutStage !== 'completed') {
            return this.knockoutFixtures[this.knockoutStage];
        }
        return [];
    },

    hasMatchToday: function(teamId) {
        let matches = this.getCurrentMatches();
        return matches.some(m => m.h === teamId || m.a === teamId);
    },

    getOpponent: function(teamId) {
        let matches = this.getCurrentMatches();
        let match = matches.find(m => m.h === teamId || m.a === teamId);
        if (!match) return null;
        let oppId = (match.h === teamId) ? match.a : match.h;
        return window.leagueData.teams.find(t => t.id === oppId);
    },

    // --- SİMÜLASYON VE SKOR GÜNCELLEMELERİ ---

    simulateBotMatches: function() {
        let matches = this.getCurrentMatches();
        matches.forEach(m => {
            if (m.h === window.myTeamId || m.a === window.myTeamId) return; // Player plays their own match
            
            let hTeam = window.leagueData.teams.find(t=>t.id === m.h);
            let aTeam = window.leagueData.teams.find(t=>t.id === m.a);
            if(!hTeam || !aTeam) return;

            let hScore = Math.floor(Math.random() * 4);
            let aScore = Math.floor(Math.random() * 3);
            
            if(hTeam.power > aTeam.power + 5) hScore += 1;
            if(aTeam.power > hTeam.power + 5) aScore += 1;
            
            // Eğer Eleme Turuysa ve berabereyse penaltılarla birini kazandır
            if (this.isGroupStageFinished) {
                if(hScore === aScore) {
                    if(Math.random() > 0.5) hScore++; else aScore++;
                }
            }
            
            this.updateStandings(m.h, m.a, hScore, aScore);
        });
    },

    updateStandings: function(homeId, awayId, hScore, aScore) {
        if (!this.isGroupStageFinished) {
            // Lig Tablosu Güncellemesi
            let ht = this.leagueTable.find(t => t.id === homeId);
            let at = this.leagueTable.find(t => t.id === awayId);
            
            if (ht && at) {
                ht.gf += hScore; ht.ga += aScore; ht.gd = ht.gf - ht.ga;
                at.gf += aScore; at.ga += hScore; at.gd = at.gf - at.ga;
                
                if (hScore > aScore) { ht.points += 3; ht.w++; at.l++; }
                else if (hScore < aScore) { at.points += 3; at.w++; ht.l++; }
                else { ht.points += 1; ht.d++; at.points += 1; at.d++; }
            }
        } else {
            // Eleme Turu Güncellemesi (Turu atlayanı belirle)
            if (!this.knockoutWinners[this.knockoutStage]) this.knockoutWinners[this.knockoutStage] = [];
            
            let winnerId = (hScore > aScore) ? homeId : awayId;
            if (hScore === aScore) {
                // Beraberlikte (Penaltılarda) oyuncuyu koru ya da rastgele
                winnerId = (homeId === window.myTeamId) ? homeId : (awayId === window.myTeamId ? awayId : (Math.random()>0.5?homeId:awayId));
            }
            if(!this.knockoutWinners[this.knockoutStage].includes(winnerId)) {
                this.knockoutWinners[this.knockoutStage].push(winnerId);
            }
        }
    },

    finishMatchDay: function() {
        if (!this.isGroupStageFinished) {
            this.currentMatchDay++;
            if (this.currentMatchDay >= 8) {
                this.isGroupStageFinished = true;
                this.generatePlayoffs();
            }
        } else {
            // İlerleyen turlar
            if (this.knockoutStage === 'playoff') this.generateRound16();
            else if (this.knockoutStage === 'round16') this.generateGenericKnockout('quarter', 'round16');
            else if (this.knockoutStage === 'quarter') this.generateGenericKnockout('semi', 'quarter');
            else if (this.knockoutStage === 'semi') this.generateGenericKnockout('final', 'semi');
            else if (this.knockoutStage === 'final') {
                this.knockoutStage = 'completed';
                this.championId = this.knockoutWinners['final'][0];
                let champTeam = window.leagueData.teams.find(t=>t.id === this.championId);
                if (this.championId === window.myTeamId) {
                    if(typeof speak === 'function') speak("TARİH YAZDIK! AVRUPA'NIN EN BÜYÜĞÜ BİZİZ! ŞAMPİYONLAR LİGİ KUPASI MÜZEMİZDE!");
                    alert(`🏆 AVRUPA ŞAMPİYONU! 🏆\n\nTebrikler Başkanım! Takımınız ${champTeam.name} Şampiyonlar Ligi'ni kazandı!\n\nKupa primi olarak kasanıza 10.000.000 € yattı!`);
                    window.budget = (window.budget || 0) + 10000000;
                } else {
                    if(typeof speak === 'function') speak(`Şampiyonlar Ligi tamamlandı. Kupayı ${champTeam?champTeam.name:'Bir Takım'} kazandı.`);
                }
            }
        }
        this.renderUI();
    },

    renderUI: function() {
        const wrapper = document.getElementById('cl-groups-wrapper');
        const status = document.getElementById('cl-status-text');
        if (!wrapper) return;
        
        wrapper.innerHTML = '';
        if (!this.isActive) {
            status.textContent = "Avrupa Ligi'ne katılmadınız veya kuralar henüz çekilmedi.";
            return;
        }
        
        if (!this.isGroupStageFinished) {
            status.textContent = `Avrupa Ligi (İsviçre Sistemi) - Hafta ${this.currentMatchDay + 1} / 8`;
            this.leagueTable.sort((a,b) => b.points - a.points || b.gd - a.gd || b.gf - a.gf);
            
            let html = `
            <div style="background: #34495e; padding: 20px; border-radius: 8px; width: 100%; max-width: 800px; margin: 0 auto; box-shadow: 0 5px 15px rgba(0,0,0,0.5);">
                <table style="width: 100%; color: white; border-collapse: collapse; text-align: center;">
                    <tr style="border-bottom: 2px solid #f1c40f;">
                        <th style="padding: 10px; text-align: left;">Sıra</th>
                        <th style="text-align: left;">Takım</th>
                        <th>O</th><th>G</th><th>B</th><th>M</th><th>Av.</th><th>P</th>
                    </tr>`;
                    
            this.leagueTable.forEach((t, i) => {
                let isMyTeam = (t.id === window.myTeamId);
                let color = isMyTeam ? '#2ecc71' : 'white';
                let fw = isMyTeam ? 'bold' : 'normal';
                
                let bg = 'transparent';
                let statusIcon = '';
                if (i < 8) { bg = 'rgba(46, 204, 113, 0.2)'; statusIcon = '✈️'; } 
                else if (i < 24) { bg = 'rgba(243, 156, 18, 0.2)'; statusIcon = '⚔️'; } 
                else { bg = 'rgba(231, 76, 60, 0.2)'; statusIcon = '❌'; }
                if (isMyTeam) bg = 'rgba(52, 152, 219, 0.4)';
                
                html += `
                    <tr style="color: \${color}; font-weight: \${fw}; background: \${bg}; border-bottom: 1px solid rgba(255,255,255,0.1);">
                        <td style="padding: 8px; text-align: left;">\${i + 1}. \${statusIcon}</td>
                        <td style="text-align: left;">\${t.name.substring(0,15)}</td>
                        <td>\${t.w + t.d + t.l}</td>
                        <td>\${t.w}</td>
                        <td>\${t.d}</td>
                        <td>\${t.l}</td>
                        <td>\${t.gd > 0 ? '+'+t.gd : t.gd}</td>
                        <td style="font-weight: bold; font-size: 1.1rem;">\${t.points}</td>
                    </tr>
                `;
            });
            html += `</table>
            <div style="margin-top: 15px; font-size: 0.9rem; text-align: left; color: #bdc3c7;">
                <strong>✈️ 1-8:</strong> Doğrudan Son 16 Turu &nbsp;|&nbsp; <strong>⚔️ 9-24:</strong> Play-Off Turu &nbsp;|&nbsp; <strong>❌ 25-36:</strong> Elenme
            </div></div>`;
            wrapper.innerHTML = html;
        } else {
            // KNOCKOUT STAGE UI
            let stageNames = {
                'playoff': 'Ölüm Kalım Play-Off Turu',
                'round16': 'Son 16 Turu',
                'quarter': 'Çeyrek Final',
                'semi': 'Yarı Final',
                'final': '🏆 BÜYÜK FİNAL 🏆',
                'completed': 'Sezon Tamamlandı'
            };
            status.textContent = `Avrupa Ligi Eleme Turları - \${stageNames[this.knockoutStage]}`;
            
            let html = `<div style="background: #2c3e50; padding: 20px; border-radius: 8px; max-width: 600px; margin: 0 auto;">`;
            
            if (this.knockoutStage === 'completed') {
                let champ = window.leagueData.teams.find(t=>t.id === this.championId);
                html += `<div style="text-align: center; color: #f1c40f; font-size: 2rem;">🏆 ŞAMPİYON: \${champ?champ.name:'Bilinmiyor'} 🏆</div>`;
            } else {
                html += `<h3 style="color:#e74c3c; text-align:center;">Güncel Eşleşmeler</h3>`;
                let currentFix = this.knockoutFixtures[this.knockoutStage] || [];
                currentFix.forEach(m => {
                    let hTeam = window.leagueData.teams.find(t=>t.id === m.h);
                    let aTeam = window.leagueData.teams.find(t=>t.id === m.a);
                    if(hTeam && aTeam) {
                        let isMyMatch = (m.h === window.myTeamId || m.a === window.myTeamId);
                        let border = isMyMatch ? 'border: 2px solid #2ecc71;' : 'border: 1px solid rgba(255,255,255,0.1);';
                        html += `
                        <div style="background: rgba(0,0,0,0.3); margin-bottom: 10px; padding: 10px; border-radius: 5px; display: flex; justify-content: space-between; align-items: center; \${border}">
                            <div style="color: \${m.h === window.myTeamId ? '#2ecc71' : 'white'}; flex: 1; text-align: right; font-weight: bold;">\${hTeam.name}</div>
                            <div style="color: #f1c40f; padding: 0 15px; font-size: 1.2rem;">VS</div>
                            <div style="color: \${m.a === window.myTeamId ? '#2ecc71' : 'white'}; flex: 1; text-align: left; font-weight: bold;">\${aTeam.name}</div>
                        </div>`;
                    }
                });
            }
            html += `</div>`;
            wrapper.innerHTML = html;
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    let clBtn = document.getElementById('btn-europe');
    if (clBtn) {
        clBtn.addEventListener('click', () => {
            if (!window.championsLeague.isActive && window.leagueData && window.leagueData.teams) {
                window.championsLeague.init();
            }
            window.championsLeague.renderUI();
            if(typeof hideAllContainers === 'function') hideAllContainers();
            if(document.getElementById('europe-container')) if(document.getElementById('europe-container')) document.getElementById('europe-container').style.display = 'block';
        });
    }
});
