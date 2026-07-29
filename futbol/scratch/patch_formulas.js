const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'js', 'squad.js');
let content = fs.readFileSync(filePath, 'utf8');

// The block we injected earlier was:
/*
if (Math.random() < injuryRisk) {
                    // Detaylı Sakatlık Motoru
                    let randType = Math.random();
...
                    newInjuries.push(p);
                }
*/

const oldLogicRegex = /if\s*\(Math\.random\(\)\s*<\s*injuryRisk\)\s*\{\s*\/\/\s*Detaylı Sakatlık Motoru[\s\S]*?newInjuries\.push\(p\);\s*\}/;

const newLogic = `if (Math.random() < injuryRisk) {
                    // Formül Tabanlı Sakatlık Motoru
                    
                    // Ağırlıklar (Başlangıç)
                    let wHamstring = 10;
                    let wKalf = 10;
                    let wQuad = 10;
                    let wGroin = 10;

                    // 1. Hamstring Formülü (Depar, Yaşlılık, Yorgunluk)
                    if (p.age > 28) wHamstring += 15;
                    if (p.condition < 30) wHamstring += 25; // Çok yorgun
                    if (p.position.includes("Açık") || p.position.includes("Bek")) wHamstring += 20;

                    // 2. Kalf (Baldır) Formülü (Sıçrama)
                    if (p.position === "Stoper" || p.position === "Santrafor") wKalf += 20;

                    // 3. Quadriceps Formülü (Şut)
                    if (p.position === "10 Numara" || p.position === "Santrafor") wQuad += 20;

                    // 4. Kasık (Ani Dönüş) - Gençlerde ve orta sahalarda daha standart
                    if (p.age <= 24) wGroin += 10;
                    if (p.position.includes("Orta Saha") || p.position.includes("Ön Libero")) wGroin += 15;

                    // Ağırlıklı Rastgele Seçim (Weighted Random)
                    let totalWeight = wHamstring + wKalf + wQuad + wGroin;
                    let r = Math.random() * totalWeight;

                    if (r < wHamstring) {
                        p.injuryType = "Hamstring (Arka Bacak) Yırtığı";
                        p.injuredWeeks = Math.floor(Math.random() * 5) + 4; // 4-8 hafta
                    } else if (r < wHamstring + wKalf) {
                        p.injuryType = "Kalf (Baldır) Yırtığı";
                        p.injuredWeeks = Math.floor(Math.random() * 3) + 3; // 3-5 hafta
                    } else if (r < wHamstring + wKalf + wQuad) {
                        p.injuryType = "Quadriceps (Ön Üst Bacak) Yırtığı";
                        p.injuredWeeks = Math.floor(Math.random() * 3) + 2; // 2-4 hafta
                    } else {
                        p.injuryType = "Kasık Çekmesi (Groin Strain)";
                        p.injuredWeeks = Math.floor(Math.random() * 3) + 1; // 1-3 hafta
                    }
                    
                    newInjuries.push(p);
                }`;

content = content.replace(oldLogicRegex, newLogic);

fs.writeFileSync(filePath, content, 'utf8');
console.log("Injury formulas applied to squad.js");
