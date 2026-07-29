const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'js', 'squad.js');
let content = fs.readFileSync(filePath, 'utf8');

// We need to replace the previous "Dev Tıbbi Simülasyon" logic we injected.
const oldLogicRegex = /\/\/ Dev Tıbbi Simülasyon: Adaleler, Bağlar, Kırıklar ve Travmalar[\s\S]*?break;\s*\}\s*\}/;

const newLogic = `// Dev Tıbbi Simülasyon v2: Overuse ve Kaleci Eklentileri
                    
                    let weights = [
                        // 1. ADALE (KAS) YIRTIKLARI
                        { type: "Hamstring (Arka Bacak) Yırtığı", weight: 20, min: 4, max: 8 },
                        { type: "Quadriceps (Ön Üst Bacak) Yırtığı", weight: 15, min: 2, max: 4 },
                        { type: "Kalf (Baldır) Yırtığı", weight: 15, min: 3, max: 5 },
                        { type: "Kasık Çekmesi (Groin Strain)", weight: 25, min: 1, max: 3 },
                        
                        // 2. DİZ BAĞLARI VE MENİSKÜS
                        { type: "İç Yan Bağ (MCL) Esnemesi", weight: 5, min: 4, max: 6 },
                        { type: "Menisküs Yırtığı", weight: 3, min: 8, max: 12 },
                        { type: "Ön Çapraz Bağ (ACL) Yırtığı", weight: 1, min: 24, max: 36 },
                        
                        // 3. KIRIKLAR
                        { type: "Tarak Kemiği (Metatarsal) Kırığı", weight: 4, min: 6, max: 10 },
                        { type: "Kaval Kemiği (Tibia) Kırığı", weight: 1, min: 16, max: 24 },
                        
                        // 4. AŞIRI KULLANIM (OVERUSE) & TENDİNİTLER
                        { type: "Osteitis Pubis", weight: 0, min: 8, max: 16 },
                        { type: "Aşil Tendiniti / Yırtığı", weight: 0, min: 20, max: 30 },
                        { type: "Patellar Tendinit (Sıçrayıcı Dizi)", weight: 0, min: 4, max: 8 },
                        { type: "Shin Splints (Kaval Ağrısı)", weight: 0, min: 2, max: 4 },
                        
                        // 5. ÜST VÜCUT & KALECİ
                        { type: "El / Bilek / Parmak Kırığı", weight: 0, min: 4, max: 8 },
                        { type: "Omuz Çıkığı / Köprücük Kırığı", weight: 0, min: 6, max: 12 },
                        
                        // 6. KONTÜZYON & AYAK
                        { type: "Ölü Bacak (Dead Leg)", weight: 5, min: 1, max: 2 },
                        { type: "Suni Çim Parmağı (Turf Toe)", weight: 2, min: 2, max: 4 },
                        { type: "Topuk Dikeni (Plantar Fasciitis)", weight: 2, min: 3, max: 6 },
                        
                        // 7. DİĞER
                        { type: "Ayak Bileği Burkulması", weight: 15, min: 2, max: 4 },
                        { type: "Kafa Travması (Sarsıntı)", weight: 0, min: 1, max: 2 }
                    ];

                    let getW = (t) => weights.find(w => w.type === t);

                    // --- FORMÜLLER VE ŞARTLAR ---
                    
                    // Kaleci Özel Sakatlıkları
                    if (p.position === "Kaleci") {
                        getW("El / Bilek / Parmak Kırığı").weight += 30; // Sadece kalecilere has
                        getW("Omuz Çıkığı / Köprücük Kırığı").weight += 10;
                        getW("Hamstring (Arka Bacak) Yırtığı").weight = 0; // Kaleciler nadir yaşar
                        getW("Kafa Travması (Sarsıntı)").weight += 5; // Direk dibine çarpma
                    } else {
                        // Saha Oyuncusu Şartları
                        if (p.condition < 40) {
                            getW("Hamstring (Arka Bacak) Yırtığı").weight += 25; 
                            getW("Tarak Kemiği (Metatarsal) Kırığı").weight += 15; 
                            
                            // Overuse
                            getW("Osteitis Pubis").weight += 15;
                            getW("Shin Splints (Kaval Ağrısı)").weight += 10;
                            getW("Topuk Dikeni (Plantar Fasciitis)").weight += 10;
                        }

                        if (p.age > 28 && p.condition < 50) {
                            getW("Aşil Tendiniti / Yırtığı").weight += 15; // Yaşlı ve yorgunlarda Aşil kopması!
                        }
                        
                        if (p.age > 28) {
                            getW("Hamstring (Arka Bacak) Yırtığı").weight += 15;
                            getW("Menisküs Yırtığı").weight += 10;
                            getW("Ön Çapraz Bağ (ACL) Yırtığı").weight += 2; 
                        }

                        if (p.position.includes("Açık") || p.position.includes("Bek")) {
                            getW("Hamstring (Arka Bacak) Yırtığı").weight += 20; 
                            getW("Ayak Bileği Burkulması").weight += 10;     
                            getW("Suni Çim Parmağı (Turf Toe)").weight += 10; // Depar
                        }
                        
                        if (p.position === "10 Numara" || p.position === "Santrafor") {
                            getW("Quadriceps (Ön Üst Bacak) Yırtığı").weight += 20; 
                        }

                        if (p.position === "Stoper" || p.position === "Santrafor") {
                            getW("Kalf (Baldır) Yırtığı").weight += 15;         
                            getW("Kafa Travması (Sarsıntı)").weight += 20;   
                            getW("Patellar Tendinit (Sıçrayıcı Dizi)").weight += 10; // Sıçrama stresi
                            getW("Omuz Çıkığı / Köprücük Kırığı").weight += 5; // Ters düşme
                            getW("Ölü Bacak (Dead Leg)").weight += 15; // Sert darbe
                        }

                        if (p.trait === "aggressive" || p.trait === "stopper") {
                            getW("Kaval Kemiği (Tibia) Kırığı").weight += 10; 
                            getW("Ön Çapraz Bağ (ACL) Yırtığı").weight += 5;    
                        }
                    }

                    // --- AĞIRLIKLI RASTGELE SEÇİM ---
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
console.log("Catastrophic injury v2 formulas applied to squad.js");
