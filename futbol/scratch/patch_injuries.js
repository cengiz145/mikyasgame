const fs = require('fs');
const path = require('path');

// 1. Update squad.js
const squadPath = path.join(__dirname, '..', 'js', 'squad.js');
let squadContent = fs.readFileSync(squadPath, 'utf8');

// Insert new injuries
const injuryInsertion = `
                        // 8. KOMPLEKS VE KRONİK SAKATLIKLAR
                        { type: "Sporcu Fıtığı", weight: 0, min: 4, max: 12 },
                        { type: "Diz Kapağı Çıkığı", weight: 0, min: 6, max: 10 },
                        { type: "Kıkırdak Yumuşaması", weight: 0, min: 4, max: 8 },
                        { type: "Bel Spazmı", weight: 5, min: 1, max: 3 },
                        { type: "Bel Fıtığı", weight: 0, min: 12, max: 24 },
                        { type: "Leğen Kemiği Ezilmesi", weight: 2, min: 2, max: 5 },
                        { type: "IT Bant Sendromu", weight: 0, min: 3, max: 6 },
                        
                        // 9. YÜZEYEL YARALANMALAR
                        { type: "Çim Yanığı", weight: 8, min: 1, max: 2 },
                        { type: "Krampon Kesiği", weight: 4, min: 1, max: 3 },
                        
                        // 7. DİĞER`;

squadContent = squadContent.replace('// 7. DİĞER', injuryInsertion);

// Insert conditions
const conditionInsertion = `
                            // Yeni eklenen sakatlık şartları
                            getW("Sporcu Fıtığı").weight += 10;
                            getW("IT Bant Sendromu").weight += 15;
                            getW("Bel Spazmı").weight += 20;

                            // Overuse
`;
squadContent = squadContent.replace('// Overuse', conditionInsertion);

const oldAgeInsertion = `
                        if (p.age > 28 && p.condition < 50) {
                            getW("Aşil Tendonu Kopması").weight += 15; // Yaşlı ve yorgunlarda Aşil kopması!
                            getW("Kıkırdak Yumuşaması").weight += 20; // Yılların yıpranması
                            getW("Bel Fıtığı").weight += 10;
                        }
`;
squadContent = squadContent.replace(/if \(p\.age > 28 && p\.condition < 50\) \{[\s\S]*?\}/, oldAgeInsertion);

const aggressiveInsertion = `
                        if (p.trait === "aggressive" || p.trait === "stopper") {
                            getW("Kaval Kemiği Kırığı").weight += 10; 
                            getW("Ön Çapraz Bağ Kopması").weight += 5;    
                            getW("Krampon Kesiği").weight += 15; // Sert müdahaleler
                            getW("Çim Yanığı").weight += 10; // Kayarak müdahale
                        }
`;
squadContent = squadContent.replace(/if \(p\.trait === "aggressive" \|\| p\.trait === "stopper"\) \{[\s\S]*?\}/, aggressiveInsertion);

fs.writeFileSync(squadPath, squadContent, 'utf8');


// 2. Update psychologist.js
const psychPath = path.join(__dirname, '..', 'js', 'psychologist.js');
let psychContent = fs.readFileSync(psychPath, 'utf8');

const psychInsertion = `
                    } else if (injuryDesc.includes("Kaval") || injuryDesc.includes("Kırığı")) {
                        treatment = "Alçı/Atel, Kemik İyileşme Terapisi";
                        cause = "Sert darbe veya aşırı yorgunluk kaynaklı stres";
                    } else if (injuryDesc.includes("Sporcu Fıtığı") || injuryDesc.includes("Fıtık")) {
                        treatment = "Cerrahi Müdahale veya Konservatif Rehab";
                        cause = "Ani hızlanma ve ters dönüşler";
                    } else if (injuryDesc.includes("Kıkırdak") || injuryDesc.includes("IT Bant")) {
                        treatment = "PRP, Dinlenme ve Fizik Tedavi";
                        cause = "Sürekli tekrarlayan koşu mekaniği yıpranması";
                    } else if (injuryDesc.includes("Spazm") || injuryDesc.includes("Yanığı") || injuryDesc.includes("Kesiği") || injuryDesc.includes("Ezilmesi")) {
                        treatment = "Buz Tedavisi, Pansuman ve Dinlenme";
                        cause = "Yüzeysel veya kas içi küçük travmalar";
`;
psychContent = psychContent.replace(/\} else if \(injuryDesc\.includes\("Kaval"\) \|\| injuryDesc\.includes\("Kırığı"\)\) \{[\s\S]*?cause = "Sert darbe veya aşırı yorgunluk kaynaklı stres";/, psychInsertion);

fs.writeFileSync(psychPath, psychContent, 'utf8');


// 3. Update game.js
const gamePath = path.join(__dirname, '..', 'js', 'game.js');
let gameContent = fs.readFileSync(gamePath, 'utf8');

const gameFatigueInjuries = `
                let fatigueInjuries = [
                    { reason: "BİTKİNLİK", msg: "Eyvah! " + p.name + " yorgunluğa dayanamadı ve kendini yere bıraktı. Oyun durdu, sağlık görevlileri sahada!" },
                    { reason: "KIRIK ŞÜPHESİ", msg: "Aman tanrım! " + p.name + " bitkin düştüğü anda ters bastı! Kırık şüphesiyle sağlık görevlileri hemen müdahale ediyor!" },
                    { reason: "LİF KOPMASI", msg: p.name + " adeta tükendi, koşarken bir anda lifi koptu! Oyuna devam etmesi imkansız!" },
                    { reason: "KAS ÇEKİLMESİ", msg: p.name + " depar atarken bir anda belini tuttu! Kas çekilmesi yaşıyor, çok acı çekiyor." }
                ];
`;
gameContent = gameContent.replace(/let fatigueInjuries = \[[\s\S]*?\];/, gameFatigueInjuries);

const gameCollisionInjuries = `
                            let injuries = [
                                { reason: "ZEDELENME", severity: 1, msg: p.name + " ikili mücadelede ufak bir darbe aldı. Zedelenme olabilir!" },
                                { reason: "DİZ DÖNMESİ", severity: 2, msg: "Eyvah eyvah! " + p.name + " yön değiştirirken dizi fena döndü! Acı içinde yerde kıvranıyor!" },
                                { reason: "KIRILMA", severity: 3, msg: "Aman Allah'ım! Çok kötü bir kırılma sesi geldi! " + p.name + " için oyun muhtemelen uzun bir süre bitti!" },
                                { reason: "KRAMPON DARBESİ", severity: 1, msg: "Sert bir müdahale! " + p.name + " bacağında kanama ile yerde kaldı. Kötü bir krampon kesiği olabilir!" }
                            ];
`;
gameContent = gameContent.replace(/let injuries = \[[\s\S]*?\];/, gameCollisionInjuries);

fs.writeFileSync(gamePath, gameContent, 'utf8');

console.log("Injury patch applied successfully.");
