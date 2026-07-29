const fs = require('fs');
let content = fs.readFileSync('js/menu.js', 'utf8');

const targetStr = `                    // Oyunu başlat (lig sistemini sadece filteredTeams'e göre başlat)
                    if (typeof startNewGame === 'function') {
                        startNewGame(filteredTeams); 
                    } else {
                        // Fallback
                        showContainer('main-menu-container');
                    }`;

const replacementStr = `                    // Menajer profil seçimine git
                    window.tempFilteredTeams = filteredTeams;
                    if (typeof showContainer === 'function') {
                        showContainer('manager-profile-select-container');
                    }`;

content = content.replace(targetStr, replacementStr);

// Add listener logic for manager profile select
// I will append it near the end of DOMContentLoaded block or anywhere safe.
// It's better to just inject it before the final `});` of `document.addEventListener('DOMContentLoaded'`
const eventListenerInject = `
    // Menajer Profil Seçimi Butonları
    document.querySelectorAll('.btn-profile').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const profile = e.currentTarget.getAttribute('data-profile');
            window.managerProfile = profile;
            
            // Profil Başlangıç Bonusları
            if (profile === 'motivasyon_ustasi') {
                window.loyalty = 100;
                window.managerAuthority = 80;
            } else if (profile === 'eski_efsane') {
                window.managerAuthority = 100;
                window.presidentConfidence = 80;
            } else if (profile === 'proje_hocasi') {
                window.presidentConfidence = 100;
            } else if (profile === 'itfaiyeci') {
                window.presidentConfidence = 90;
            } else if (profile === 'taktik_deha') {
                // Taktik deha başlar başlamaz bir etkiye sahip değil, maç motorunda etkisi var
            } else if (profile === 'pragmatist') {
                // Pragmatist de maç motorunda etkiye sahip
            }
            
            if (typeof speak === 'function') {
                speak("Profil seçildi: " + profile);
            }

            if (typeof startNewGame === 'function' && window.tempFilteredTeams) {
                startNewGame(window.tempFilteredTeams);
                window.tempFilteredTeams = null;
            } else {
                showContainer('main-menu-container');
            }
        });
    });
`;

const domReadyEndStr = `    // Modal kapatma olayları vb. en sona eklenebilir`;
content = content.replace(domReadyEndStr, eventListenerInject + "\n" + domReadyEndStr);

fs.writeFileSync('js/menu.js', content, 'utf8');
console.log('menu.js patched with Manager Profile flow!');
