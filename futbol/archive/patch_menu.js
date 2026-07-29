const fs = require('fs');

const menuFile = 'C:\\Users\\Umit Ekrem Mikyas\\Downloads\\wep sitem\\futbol\\js\\menu.js';
let content = fs.readFileSync(menuFile, 'utf8');

// 1. hideAllContainers'a yeni containerleri ekleyelim
content = content.replace(
    /'main-menu-container', 'team-select-container', 'manage-container',/,
    "'main-menu-container', 'country-select-container', 'league-select-container', 'team-select-container', 'manage-container',"
);

// 2. startBtn click handler'ı değiştirelim
const oldStartBtn = `        startBtn.addEventListener('click', () => {
            if (localStorage.getItem(saveKey)) {
                if (!confirm("Yeni bir kariyere başlarsanız eski kaydınız SİLİNECEK. Emin misiniz?")) {
                    return; // İptal ederse başlama
                }
                localStorage.removeItem(saveKey); // Eski kaydı sil
            }
            showContainer('team-select-container');
            if(typeof populateTeamSelect === 'function') populateTeamSelect();
        });`;

const newStartBtn = `        startBtn.addEventListener('click', () => {
            if (localStorage.getItem(saveKey)) {
                if (!confirm("Yeni bir kariyere başlarsanız eski kaydınız SİLİNECEK. Emin misiniz?")) {
                    return;
                }
                localStorage.removeItem(saveKey);
            }
            showContainer('country-select-container');
            if(typeof speak === 'function') speak("Oynamak istediğiniz ülkeyi seçin.");
        });`;

// Regex escape and replace
content = content.replace(/startBtn\.addEventListener\('click'[\s\S]*?\}\);/m, newStartBtn);

// 3. Add Event Listeners for Country, League and Team Selection UI
const newRoutingCode = `
    // --- YENİ UI ROUTING ---
    // Ülke Seçimi
    document.getElementById('btn-country-tr')?.addEventListener('click', () => {
        document.getElementById('tr-leagues').style.display = 'flex';
        document.getElementById('it-leagues').style.display = 'none';
        showContainer('league-select-container');
        if(typeof speak === 'function') speak("Lig seçimi.");
    });
    document.getElementById('btn-country-it')?.addEventListener('click', () => {
        document.getElementById('tr-leagues').style.display = 'none';
        document.getElementById('it-leagues').style.display = 'flex';
        showContainer('league-select-container');
        if(typeof speak === 'function') speak("İtalya ligini seçtiniz. Lütfen alt lig seçin.");
    });
    document.getElementById('btn-back-country')?.addEventListener('click', () => {
        showContainer('intro-screen');
    });

    // Lig Seçimi
    const selectLeagueFlow = (leagueId) => {
        window.selectedLeague = leagueId; // Global state for league
        renderTeamSelectGrid(leagueId);
        showContainer('team-select-container');
        if(typeof speak === 'function') speak("Takımınızı seçin.");
    };

    document.getElementById('btn-league-superlig')?.addEventListener('click', () => selectLeagueFlow('superlig'));
    document.getElementById('btn-league-tff1')?.addEventListener('click', () => selectLeagueFlow('tff1'));
    document.getElementById('btn-league-seriea')?.addEventListener('click', () => selectLeagueFlow('seriea'));
    document.getElementById('btn-league-serieb')?.addEventListener('click', () => {
        alert("Serie B çok yakında oyuna eklenecektir!");
        if(typeof speak === 'function') speak("Serie B çok yakında eklenecek.");
    });

    document.getElementById('btn-back-league')?.addEventListener('click', () => {
        showContainer('country-select-container');
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
            btn.innerHTML = \`<strong>\${team.name}</strong><span style="font-size:0.8rem;">Bütçe: \${team.budget}M €</span>\`;
            
            btn.addEventListener('click', () => {
                // Seçilen takımı ata ve oyunu başlat
                window.league = window.league || {};
                window.league.userTeamId = team.id;
                
                // Oyunu başlat (lig sistemini sadece filteredTeams'e göre başlat)
                if (typeof startNewGame === 'function') {
                    startNewGame(filteredTeams); 
                } else {
                    // Fallback
                    showContainer('main-menu-container');
                }
            });
            grid.appendChild(btn);
        });
    };
    // -----------------------
`;

// Insert the new routing code before document.getElementById('btn-back-team')?.addEventListener
content = content.replace(/document\.getElementById\('btn-back-team'\)\?\.addEventListener/m, newRoutingCode + "\n    // ESKİ btn-back-team kaldırıldı \n    //document.getElementById('btn-back-team')?.addEventListener");

fs.writeFileSync(menuFile, content, 'utf8');
console.log("menu.js güncellendi.");
