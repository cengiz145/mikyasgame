const fs = require('fs');

let content = fs.readFileSync('js/menu.js', 'utf8');

// The string we previously injected for showing the container
const oldStr = `                    // Menajer profil seçimine git
                    window.tempFilteredTeams = filteredTeams;
                    if (typeof showContainer === 'function') {
                        showContainer('manager-profile-select-container');
                    }`;

const newStr = `                    // Menajer profilini tarafsız olarak başlatıp oyuna gir
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
                        startNewGame(filteredTeams); 
                    } else {
                        showContainer('main-menu-container');
                    }`;

content = content.replace(oldStr, newStr);

fs.writeFileSync('js/menu.js', content, 'utf8');
console.log('js/menu.js patched back to direct start with tarafsiz profile');
