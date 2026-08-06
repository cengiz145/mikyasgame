const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'js', 'squad.js');
let content = fs.readFileSync(filePath, 'utf8');

// The block we injected earlier was:
/*
// Formül Tabanlı Sakatlık Motoru
                    
                    // Ağırlıklar (Başlangıç)
                    let wHamstring = 10;
...
                        p.injuredWeeks = Math.floor(Math.random() * 3) + 1; // 1-3 hafta
                    }
*/

const oldLogicRegex = /\/\/ Formül Tabanlı Sakatlık Motoru[\s\S]*?p\.injuredWeeks = Math\.floor\(Math\.random\(\) \* 3\) \+ 1; \/\/ 1-3 hafta\s*\}/;

const newLogic = `// Dev Tıbbi Simülasyon: Adaleler, Bağlar, Kırıklar ve Travmalar
                    
                    // 1. ADALE (KAS) YIRTIKLARI (Sık Görülür)
                    let wHamstring = 20; // Arka Üst Bacak
                    let wQuad = 15;      // Ön Üst Bacak
                    let wKalf = 15;      // Baldır
                    let wGroin = 25;     // Kasık (En Sık)
                    
                    // 2. DİZ BAĞLARI VE MENİSKÜS (Nadir ama Uzun Süreli)
                    let wMCL = 5;        // İç Yan Bağ
                    let wMeniscus = 3;   // Menisküs
                    let wACL = 1;        // Ön Çapraz Bağ (Çok Nadir, Sezon Kapatır)
                    
                    // 3. KIRIKLAR
                    let wMetatarsal = 4; // Tarak Kemiği
                    let wTibia = 1;      // Kaval Kemiği Kırığı (Çok Nadir, Yıkıcı)
                    
                    // 4. DİĞER
                    let wAnkle = 15;     // Ayak Bileği Burkulması
                    let wConcussion = 0; // Kafa Travması (Sadece belli şartlarda)

                    // --- FORMÜLLER VE ŞARTLAR ---
                    
                    // Yorgunluk (Düşük Kondisyon) her türlü kas ve stres kırığını tetikler
                    if (p.condition < 30) {
                        wHamstring += 25; 
                        wMetatarsal += 15; // Stres kırığı riski
                    }
                    
                    // Yaş Faktörü (Bağların ve kasların esnekliğini yitirmesi)
                    if (p.age > 28) {
                        wHamstring += 15;
                        wMeniscus += 10;
                        wACL += 2; // Yaşlı oyuncularda ACL kopma riski daha fazla
                    }

                    // Mevki Faktörleri
                    if (p.position.includes("Açık") || p.position.includes("Bek")) {
                        wHamstring += 20; // Depar
                        wAnkle += 10;     // Hızlı yön değiştirirken bilek dönmesi
                    }
                    
                    if (p.position === "10 Numara" || p.position === "Santrafor") {
                        wQuad += 20; // Şut çekerken ön bacak zorlanması
                    }

                    if (p.position === "Stoper" || p.position === "Santrafor") {
                        wKalf += 15;         // Sıçrama
                        wConcussion += 20;   // Kafa Topu Çarpışmaları (Sarsıntı)
                    }

                    // Oyuncu Karakteri (Trait)
                    if (p.trait === "aggressive" || p.trait === "stopper") {
                        wTibia += 10; // Sert giren oyuncularda bacak kırılması ihtimali
                        wACL += 5;    // Sert dönüşlerde bağ kopması
                    }

                    // --- AĞIRLIKLI RASTGELE SEÇİM ---
                    let weights = [
                        { type: "Kasık Çekmesi (Groin Strain)", weight: wGroin, min: 1, max: 3 },
                        { type: "Ayak Bileği Burkulması", weight: wAnkle, min: 2, max: 4 },
                        { type: "Kafa Travması (Sarsıntı)", weight: wConcussion, min: 1, max: 2 },
                        { type: "Quadriceps (Ön Üst Bacak) Yırtığı", weight: wQuad, min: 2, max: 4 },
                        { type: "Kalf (Baldır) Yırtığı", weight: wKalf, min: 3, max: 5 },
                        { type: "İç Yan Bağ (MCL) Esnemesi", weight: wMCL, min: 4, max: 6 },
                        { type: "Tarak Kemiği (Metatarsal) Kırığı", weight: wMetatarsal, min: 6, max: 10 },
                        { type: "Hamstring (Arka Bacak) Yırtığı", weight: wHamstring, min: 4, max: 8 },
                        { type: "Menisküs Yırtığı", weight: wMeniscus, min: 8, max: 12 },
                        { type: "Kaval Kemiği (Tibia) Kırığı", weight: wTibia, min: 16, max: 24 },
                        { type: "Ön Çapraz Bağ (ACL) Yırtığı", weight: wACL, min: 24, max: 36 }
                    ];

                    let totalWeight = weights.reduce((sum, w) => sum + w.weight, 0);
                    let r = Math.random() * totalWeight;
                    
                    let currentSum = 0;
                    for (let w of weights) {
                        currentSum += w.weight;
                        if (r <= currentSum) {
                            p.injuryType = w.type;
                            p.injuredWeeks = Math.floor(Math.random() * (w.max - w.min + 1)) + w.min;
                            break;
                        }
                    }`;

content = content.replace(oldLogicRegex, newLogic);

fs.writeFileSync(filePath, content, 'utf8');
console.log("Catastrophic injury formulas applied to squad.js");
