const fs = require('fs');
const path = require('path');

const scoutPath = path.join(__dirname, '..', 'js', 'scout.js');
let content = fs.readFileSync(scoutPath, 'utf8');

const oldFuncRegex = /\/\/ \[YENİ\] Oyuncu İradesi ve İsyan Sistemi[\s\S]*?\}\);[\s\n]*\}/m;

const newFuncLogic = `
// [YENİ] Oyuncu İradesi ve İsyan Sistemi (Karakter Bazlı)
function processPlayerFreeWill() {
    if (!window.myRoster || window.myRoster.length === 0) return;
    
    let rosterCopy = [...window.myRoster];
    
    rosterCopy.forEach(p => {
        // 1. İSYAN VE SÖZLEŞME FESHİ
        if (p.happiness === "İsyan Etti 😡" || p.happiness === "İsyan Etti ??") {
            
            // Karakter Bazlı İsyan İhtimali
            let mutinyChance = 0.15; // Default (Kırılgan vb. için)
            
            if (p.mentalTrait === 'sadık') mutinyChance = 0.01;
            else if (p.mentalTrait === 'profesyonel') mutinyChance = 0.05;
            else if (p.mentalTrait === 'agresif') mutinyChance = 0.35;
            
            // Menajer (Bavulcu Menajer) Etkisi
            if (p.agentType === 'suitcase') {
                mutinyChance *= 2; // Bavulcu menajer kışkırtır
            }
            
            if (Math.random() < mutinyChance) {
                // Oyuncuyu kadrodan sil
                window.myRoster = window.myRoster.filter(player => player.id !== p.id);
                
                // İlk 11 veya yedeklerden çıkar
                if (window.myTeam) {
                    let formIdx = window.myTeam.formation.indexOf(p.id);
                    if(formIdx !== -1) window.myTeam.formation[formIdx] = null;
                    let subIdx = window.myTeam.subs.indexOf(p.id);
                    if(subIdx !== -1) window.myTeam.subs[subIdx] = null;
                }
                
                // Serbest oyuncu yap
                p.teamId = 'free_agent';
                p.happiness = "Mutlu 😊"; // Kurtulduğu için mutlu
                p.benchedMatches = 0;
                
                let agentMsg = p.agentType === 'suitcase' ? " Menajerinin kışkırtmasıyla " : " ";
                let msg = "🚨 İSYAN VE FESİH! " + p.name + "," + agentMsg + "yönetimin kendisine olan tavrına daha fazla dayanamadı. Tesisleri terk ederek sözleşmesini tek taraflı feshetti ve serbest oyuncu oldu!";
                
                window.eventQueue = window.eventQueue || [];
                window.eventQueue.push({
                    title: "Sözleşme Feshedildi!",
                    message: msg
                });
                
                setTimeout(() => {
                    if(typeof speak === 'function') speak("Flaş haber! Takımımızın yıldızı " + p.name + ", isyan bayrağını çekti ve sözleşmesini yırtarak kulüpten ayrıldı!");
                }, 1000);
            }
        }
        
        // 2. EMEKLİLİK (Retirement)
        if (p.age >= 34 && p.injuredWeeks > 10) {
            if (Math.random() < 0.05) {
                window.myRoster = window.myRoster.filter(player => player.id !== p.id);
                
                if (window.myTeam) {
                    let formIdx = window.myTeam.formation.indexOf(p.id);
                    if(formIdx !== -1) window.myTeam.formation[formIdx] = null;
                    let subIdx = window.myTeam.subs.indexOf(p.id);
                    if(subIdx !== -1) window.myTeam.subs[subIdx] = null;
                }
                
                p.teamId = 'retired';
                let msg = "😢 EMEKLİLİK KARARI... " + p.name + " ağır sakatlığın ardından vücudunun artık futbolu kaldıramayacağını belirterek kramponlarını astığını açıkladı. Bir devir sona erdi.";
                
                window.eventQueue = window.eventQueue || [];
                window.eventQueue.push({
                    title: "Futbola Veda",
                    message: msg
                });
                
                setTimeout(() => {
                    if(typeof speak === 'function') speak("Üzücü bir haber. Usta krampon " + p.name + ", geçirdiği ağır sakatlığın ardından futbolu bıraktığını açıkladı.");
                }, 2000);
            }
        }
    });
}
`;

content = content.replace(oldFuncRegex, newFuncLogic.trim());
fs.writeFileSync(scoutPath, content, 'utf8');
console.log("scout.js updated with Trait-based Rebellion logic.");
