const fs = require('fs');
const path = require('path');

const squadPath = path.join(__dirname, '..', 'js', 'squad.js');
let squadContent = fs.readFileSync(squadPath, 'utf8');

// The block to replace:
// "                            // Yeni eklenen sakatlık şartları
//                             getW("Sporcu Fıtığı").weight += 10;
//                             getW("IT Bant Sendromu").weight += 15;
//                             getW("Bel Spazmı").weight += 20;"

const oldBlockRegex = /\/\/ Yeni eklenen sakatlık şartları[\s\S]*?getW\("Bel Spazmı"\)\.weight \+= 20;/;

const newFormulas = `// --- GELİŞMİŞ SAKATLIK FORMÜLLERİ (KOMPLEKS VE KRONİK) ---
                            // 1. Sporcu Fıtığı: Patlayıcı koşu yapan açıklar/forvetler yorulunca risk katlanarak artar.
                            if (p.condition < 65 && (p.position.includes("Açık") || p.position.includes("Forvet") || p.position === "Santrafor")) {
                                getW("Sporcu Fıtığı").weight += (65 - p.condition) * 0.8; 
                            }
                            
                            // 2. IT Bant Sendromu: Kanat oyuncularının (Bek/Açık) koşu mekaniği yıpranması
                            if (p.condition < 70 && (p.position.includes("Bek") || p.position.includes("Açık"))) {
                                getW("IT Bant Sendromu").weight += (70 - p.condition) * 0.5;
                            }
                            
                            // 3. Bel Spazmı & Bel Fıtığı: Stoperler ve forvetlerin hava topu sıçramaları ve yaş faktörü
                            if (p.position === "Stoper" || p.position === "Santrafor") {
                                getW("Bel Spazmı").weight += 10 + ((100 - p.condition) * 0.2);
                                if (p.age > 29) {
                                    getW("Bel Fıtığı").weight += (p.age - 29) * 2.5; // Yaşlandıkça disk kayma riski katlanır
                                }
                            }
                            
                            // 4. Leğen Kemiği Ezilmesi (Hip Pointer): Sert müdahalelere maruz kalan/yapanlar
                            if (p.position === "Defansif Orta Saha" || p.position === "Stoper") {
                                getW("Leğen Kemiği Ezilmesi").weight += 12;
                            }
                            
                            // 5. Kıkırdak Yumuşaması ve Diz Kapağı Çıkığı: Diz eklemi yaşa bağlı yıpranma formülü
                            if (p.age > 26) {
                                getW("Kıkırdak Yumuşaması").weight += (p.age - 26) * 1.8;
                                getW("Diz Kapağı Çıkığı").weight += (p.age - 25) * 1.2;
                            }
                            
                            // 6. Yüzeyel Yaralanmalar: Agresif oyun karakteri ve defansif rol
                            if (p.mentalTrait === "agresif" || p.trait === "aggressive" || p.trait === "stopper") {
                                getW("Krampon Kesiği").weight += 15 + (Math.random() * 10);
                                getW("Çim Yanığı").weight += 15 + (Math.random() * 10);
                            }`;

squadContent = squadContent.replace(oldBlockRegex, newFormulas);

fs.writeFileSync(squadPath, squadContent, 'utf8');
console.log("Injury formulas patch applied successfully.");
