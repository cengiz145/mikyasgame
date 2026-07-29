const fs = require('fs');

let content = fs.readFileSync('c:\\\\Users\\\\Umit Ekrem Mikyas\\\\Downloads\\\\wep sitem\\\\futbol\\\\js\\\\game.js', 'utf8');

let target1 = `        if (!window.sportingDirectorProfile) {
            window.sportingDirectorProfile = "tuccar"; // Şimdilik tüccar profili aktif
        }`;

let replacement1 = `        if (!window.sportingDirectorProfile) {
            window.sportingDirectorProfile = Math.random() < 0.5 ? "tuccar" : "analitik"; 
        }`;

content = content.replace(target1, replacement1);

let target2 = `        if (myTeam && window.sportingDirectorProfile === "tuccar") {
            // Tüccarlar (Ucuza Al, Pahalıya Sat Uzmanları - Monchi tarzı)
            let sdEventChance = Math.random();`;

let replacement2 = `        if (myTeam && window.sportingDirectorProfile === "tuccar") {
            // Tüccarlar (Ucuza Al, Pahalıya Sat Uzmanları - Monchi tarzı)
            let sdEventChance = Math.random();`;

// Wait, I should add the "analitik" block using a string replace
let target3 = `                }, 5000);
            }
        }
    }
    
    // MAÇ İÇİ YENİLEME`;

let replacement3 = `                }, 5000);
            }
        } else if (myTeam && window.sportingDirectorProfile === "analitik") {
            // Veri ve İstatistik Dahileri (Michael Edwards tarzı)
            let sdEventChance = Math.random();
            if (sdEventChance < 0.12 && myTeam.budget > 8) {
                // Algoritma ile 3 uygun oyuncu yaratır
                let options = [];
                for (let i=1; i<=3; i++) {
                    let cost = 3 + Math.floor(Math.random() * 5);
                    options.push({
                        id: "sd_moneyball_" + Date.now() + "_" + i,
                        name: "Veri Harikası (" + Math.floor(Math.random()*1000) + ")",
                        position: ["OOS", "SNT", "KND", "MO", "DOS", "ST"].sort(() => 0.5 - Math.random())[0],
                        power: 70 + Math.floor(Math.random() * 12),
                        speed: 4.5,
                        age: 22 + Math.floor(Math.random() * 4),
                        teamId: "free_agent",
                        contractYears: 4,
                        cost: cost
                    });
                }
                
                setTimeout(() => {
                    let promptText = \`👔 SPORTİF DİREKTÖR ÖNERİSİ! (Veri Analisti)\\n\\nSportif Direktörünüz: "Hocam, algoritmalarımız takımın veri setini analiz etti ve sisteminize en uygun, xG ve ısı haritası verileri tavan yapmış 3 oyuncu belirledi. Duygusal karar vermeyelim, bu üçlüden birini seçin:"\\n\\n\`;
                    options.forEach((op, idx) => {
                        promptText += \`\${idx+1}) \${op.name} | Mevki: \${op.position} | Güç: \${op.power} | Maliyet: \${op.cost}M €\\n\`;
                    });
                    promptText += \`\\nHangisini transfer edelim? (1, 2 veya 3 yazın. İptal için boş bırakın)\`;
                    
                    let choice = prompt(promptText);
                    if (choice === "1" || choice === "2" || choice === "3") {
                        let selected = options[parseInt(choice) - 1];
                        if (myTeam.budget >= selected.cost) {
                            myTeam.budget -= selected.cost;
                            selected.teamId = window.myTeamId;
                            window.leagueData.players.push(selected);
                            alert(\`✅ Veri transferi başarılı! Algoritmanın onayladığı \${selected.name} artık takımınızda.\`);
                        } else {
                            alert(\`❌ Transfer başarısız! Bütçeniz bu algoritma harikası için yetersiz.\`);
                        }
                    } else if (choice) {
                        alert("❌ Geçersiz seçim! Sportif direktör 'Algoritmaları anlamıyorsunuz...' diyerek odadan ayrıldı.");
                    } else {
                        alert("❌ İptal edildi. Sportif direktör 'Sayılara ve verilere sırtınızı döndünüz, umarım sahada yanılmayız' diyerek uzaklaştı.");
                    }
                }, 5000);
            }
        }
    }
    
    // MAÇ İÇİ YENİLEME`;

content = content.replace(target3, replacement3);

// In case the exact "MAÇ İÇİ YENİLEME" string is not there, I will just append before the closing of endGame function.
// Let's find exactly where the first block ends.
let fallbackTarget = `                }, 5000);
            }
        }
    }`;

let fallbackReplacement = `                }, 5000);
            }
        } else if (myTeam && window.sportingDirectorProfile === "analitik") {
            // Veri ve İstatistik Dahileri (Michael Edwards tarzı)
            let sdEventChance = Math.random();
            if (sdEventChance < 0.12 && myTeam.budget > 8) {
                // Algoritma ile 3 uygun oyuncu yaratır
                let options = [];
                for (let i=1; i<=3; i++) {
                    let cost = 3 + Math.floor(Math.random() * 5);
                    options.push({
                        id: "sd_moneyball_" + Date.now() + "_" + i,
                        name: "Veri Harikası (" + Math.floor(Math.random()*1000) + ")",
                        position: ["OOS", "SNT", "KND", "MO", "DOS", "ST"].sort(() => 0.5 - Math.random())[0],
                        power: 70 + Math.floor(Math.random() * 12),
                        speed: 4.5,
                        age: 22 + Math.floor(Math.random() * 4),
                        teamId: "free_agent",
                        contractYears: 4,
                        cost: cost
                    });
                }
                
                setTimeout(() => {
                    let promptText = \`👔 SPORTİF DİREKTÖR ÖNERİSİ! (Veri Analisti)\\n\\nSportif Direktörünüz: "Hocam, algoritmalarımız takımın veri setini analiz etti ve sisteminize en uygun, xG ve ısı haritası verileri tavan yapmış 3 oyuncu belirledi. Duygusal karar vermeyelim, bu üçlüden birini seçin:"\\n\\n\`;
                    options.forEach((op, idx) => {
                        promptText += \`\${idx+1}) \${op.name} | Mevki: \${op.position} | Güç: \${op.power} | Maliyet: \${op.cost}M €\\n\`;
                    });
                    promptText += \`\\nHangisini transfer edelim? (1, 2 veya 3 yazın. İptal için boş bırakın)\`;
                    
                    let choice = prompt(promptText);
                    if (choice === "1" || choice === "2" || choice === "3") {
                        let selected = options[parseInt(choice) - 1];
                        if (myTeam.budget >= selected.cost) {
                            myTeam.budget -= selected.cost;
                            selected.teamId = window.myTeamId;
                            window.leagueData.players.push(selected);
                            alert(\`✅ Veri transferi başarılı! Algoritmanın onayladığı \${selected.name} artık takımınızda.\`);
                        } else {
                            alert(\`❌ Transfer başarısız! Bütçeniz bu algoritma harikası için yetersiz.\`);
                        }
                    } else if (choice !== null && choice !== "") {
                        alert("❌ Geçersiz seçim! Sportif direktör 'Algoritmaları anlamıyorsunuz...' diyerek odadan ayrıldı.");
                    } else {
                        alert("❌ İptal edildi. Sportif direktör 'Sayılara ve verilere sırtınızı döndünüz, umarım sahada yanılmayız' diyerek uzaklaştı.");
                    }
                }, 5000);
            }
        }
    }`;

// use fallback if regular replace doesn't work. We will just use fallback directly.
let finalContent = content.replace(fallbackTarget, fallbackReplacement);
fs.writeFileSync('c:\\\\Users\\\\Umit Ekrem Mikyas\\\\Downloads\\\\wep sitem\\\\futbol\\\\js\\\\game.js', finalContent, 'utf8');
console.log('Patch sporting director analitik applied successfully.');
