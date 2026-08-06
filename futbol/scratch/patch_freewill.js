const fs = require('fs');
const path = require('path');

const scoutPath = path.join(__dirname, '..', 'js', 'scout.js');
let content = fs.readFileSync(scoutPath, 'utf8');

const processFreeWillLogic = `
// [YENİ] Oyuncu İradesi ve İsyan Sistemi
function processPlayerFreeWill() {
    if (!window.myRoster || window.myRoster.length === 0) return;
    
    // Geçici bir dizi oluştur ki döngü sırasında silme yapabilelim
    let rosterCopy = [...window.myRoster];
    
    rosterCopy.forEach(p => {
        // 1. İSYAN VE SÖZLEŞME FESHİ
        if (p.happiness === "İsyan Etti 😡" || p.happiness === "İsyan Etti ??") {
            // Her gün %15 ihtimalle sabrı taşar
            if (Math.random() < 0.15) {
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
                
                let msg = "🚨 İSYAN VE FESİH! " + p.name + " yönetimin kendisine olan tavrına daha fazla dayanamadı. Tesisleri terk ederek sözleşmesini tek taraflı feshetti ve serbest oyuncu oldu. Kulüp bedavaya büyük bir yıldız kaybetti!";
                
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
        // Eğer 34 yaş üstüyse ve çok ağır sakatsa (%10)
        if (p.age >= 34 && p.injuredWeeks > 10) {
            if (Math.random() < 0.05) {
                // Emekli ol
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

const checkScoutRegex = /\/\/ 3\. Yeni günde olan olayları tetikle[\s\S]*?if \(typeof checkScoutArrivals === 'function'\) checkScoutArrivals\(\);/m;
const checkScoutRepl = `
    // 3. Yeni günde olan olayları tetikle
    if (typeof checkScoutArrivals === 'function') checkScoutArrivals();
    
    // Oyuncu İradesi Kontrolü (İsyan / Emeklilik)
    if (typeof processPlayerFreeWill === 'function') processPlayerFreeWill();
`;

// Inject the function before window.advanceDateAndEvents
const advanceFuncRegex = /window\.advanceDateAndEvents = function\(\) \{/m;
const advanceFuncRepl = `
${processFreeWillLogic}

window.advanceDateAndEvents = function() {
`;

content = content.replace(advanceFuncRegex, advanceFuncRepl);
content = content.replace(checkScoutRegex, checkScoutRepl.trim());

fs.writeFileSync(scoutPath, content, 'utf8');
console.log("scout.js patched with Player Free Will logic.");
