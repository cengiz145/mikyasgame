const fs = require('fs');
const path = require('path');

const announcerPath = path.join(__dirname, '..', 'js', 'announcer.js');
let content = fs.readFileSync(announcerPath, 'utf8');

const aiLogic = `
// [YENİ] Spiker Yapay Zeka Çipi (Donanım Yükseltmesi)
function processAICommentary(text) {
    // Maçta mıyız kontrolü
    if (typeof window.matchMinute === 'undefined' || window.matchMinute === null || window.matchMinute === 0) {
        return text; // Maçta değilsek normal metni oku
    }
    
    let minute = window.matchMinute;
    let pScore = window.playerScore || 0;
    let eScore = window.enemyScore || 0;
    
    let isGoal = text.includes("GOOOOL") || text.includes("top ağlarımızda") || text.includes("golü buldu");
    let isMiss = text.includes("dışarı çıktı") || text.includes("auta çıktı") || text.includes("direkten döndü");
    
    let aiCommentary = "";

    if (isGoal) {
        let isPlayerGoal = text.includes("GOOOOL") && !text.includes("top ağlarımızda") && !text.includes("golü buldu");
        let isEnemyGoal = text.includes("top ağlarımızda") || text.includes("golü buldu");
        
        // Skor bağlamı
        if (pScore === eScore) {
            aiCommentary += " Ve maça denge geldi! Gerçekten inanılmaz bir mücadele! ";
        } else if (Math.abs(pScore - eScore) >= 3) {
            aiCommentary += " Fark giderek açılıyor, sahada adeta tek taraflı bir resital var! ";
        } else if (Math.abs(pScore - eScore) === 1 && minute > 75) {
            aiCommentary += " Son anlara girilirken gelen bu gol, skoru çok kritik bir noktaya taşıdı! ";
        }
        
        // Dakika bağlamı (Son dakika golleri)
        if (minute >= 88) {
            aiCommentary += " Doksanıncı dakika! Kalpler duracak gibi! Bu anı unutmak mümkün değil! ";
        }
    } else if (isMiss && minute > 85 && pScore === eScore) {
        aiCommentary += " Son anlarda böyle bir gol kaçar mı? Taraftar saç baş yoluyor! ";
    }
    
    return aiCommentary + text; // Önce yorum, sonra asıl maç metni
}
`;

const oldSpeakRegex = /window\.speak = function\(text, priority = false\) \{[\s\S]*?if \(!text\) return;/m;

const newSpeakLogic = `
${aiLogic}

window.speak = function(text, priority = false) {
    if (!text) return;
    
    // AI Çipinden Geçir
    text = processAICommentary(text);
`;

content = content.replace(oldSpeakRegex, newSpeakLogic.trim());
fs.writeFileSync(announcerPath, content, 'utf8');
console.log("Announcer AI chip injected into announcer.js");
