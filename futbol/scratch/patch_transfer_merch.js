const fs = require('fs');
const path = require('path');

const transferPath = path.join(__dirname, '..', 'js', 'transfer.js');
let content = fs.readFileSync(transferPath, 'utf8');

// Look for window.budget -= fee; 
// in window.buyPlayer function.
const buyPlayerRegex = /window\.budget -= fee;[\s\S]*?let t = window\.leagueData\.teams\.find\(x => x\.id === window\.myTeamId\);/m;

const buyPlayerRepl = `
            window.budget -= fee;
            
            // [YENİ] Forma Satışı ve Merchandising (Yıldız Etkisi)
            if (p.power >= 85) {
                let merchRevenue = (p.power - 80) * 0.5; // 88 gücünde biri (8) * 0.5 = 4 Milyon forma geliri
                merchRevenue = parseFloat(merchRevenue.toFixed(2));
                window.budget += merchRevenue;
                
                // Spiker anonsu
                setTimeout(() => {
                    let msg = p.name + " transferi dünyada yankı uyandırdı! Taraftar formalarına hücum etti, kulübün kasasına sadece forma satışlarından " + merchRevenue + " Milyon Euro girdi.";
                    alert("👕 FORMA SATIŞI REKORU\\n\\n" + msg);
                    if(typeof speak === 'function') speak("Başkanım, " + p.name + " transferinden sonra kulüp mağazasındaki formalar tükendi. İnanılmaz bir ticari başarı!");
                    if(typeof updateBudgetUI === 'function') updateBudgetUI();
                }, 2000);
            }

            let t = window.leagueData.teams.find(x => x.id === window.myTeamId);
`;

content = content.replace(buyPlayerRegex, buyPlayerRepl.trim());
fs.writeFileSync(transferPath, content, 'utf8');
console.log("transfer.js patched with Merchandising feature.");
