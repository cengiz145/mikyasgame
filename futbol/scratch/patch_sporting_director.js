const fs = require('fs');

let content = fs.readFileSync('c:\\\\Users\\\\Umit Ekrem Mikyas\\\\Downloads\\\\wep sitem\\\\futbol\\\\js\\\\game.js', 'utf8');

let target = `                // Sadece kazanılınca veya büyük statta getiri çok olacağı için bütçeye ekle
                if (revenue > 0) {
                    myTeam.budget += revenue;
                    alert(\`ğŸ Ÿï¸  İÇ SAHA GİÅžE HASILATI ğŸ Ÿï¸ \\n\\nStadyumunuzdaki sadık taraftarlar sayesinde kulübün kasasına \${revenue.toFixed(2)} Milyon Euro bilet ve loca geliri eklendi!\`);
                }
            }
        }
    }`;

let replacement = `                // Sadece kazanılınca veya büyük statta getiri çok olacağı için bütçeye ekle
                if (revenue > 0) {
                    myTeam.budget += revenue;
                    alert(\`ğŸ Ÿï¸  İÇ SAHA GİÅžE HASILATI ğŸ Ÿï¸ \\n\\nStadyumunuzdaki sadık taraftarlar sayesinde kulübün kasasına \${revenue.toFixed(2)} Milyon Euro bilet ve loca geliri eklendi!\`);
                }
            }
        }
    }

    // AŞAMA YENİ: Sportif Direktör (Futbol Aklı) Olayları
    if (window.leagueData && window.myTeamId) {
        if (!window.sportingDirectorProfile) {
            window.sportingDirectorProfile = "tuccar"; // Şimdilik tüccar profili aktif
        }

        let myTeam = window.leagueData.teams.find(t => t.id === window.myTeamId);
        if (myTeam && window.sportingDirectorProfile === "tuccar") {
            // Tüccarlar (Ucuza Al, Pahalıya Sat Uzmanları - Monchi tarzı)
            let sdEventChance = Math.random();
            
            // 1. Oyuncu Satışı Vurgunu (%6 ihtimal)
            if (sdEventChance < 0.06 && myTeam.budget >= 0) {
                // Takımın en değerli genç potansiyelini bulur ve satar
                let myPlayers = window.leagueData.players.filter(p => p.teamId === window.myTeamId && p.age && p.age <= 23 && p.power >= 70);
                if (myPlayers.length > 0) {
                    let victim = myPlayers[Math.floor(Math.random() * myPlayers.length)];
                    let sellPrice = Math.floor(victim.power * 1.5) + Math.floor(Math.random() * 20); // Yüksek fiyata satar
                    myTeam.budget += sellPrice;
                    victim.teamId = "avrupa_devi"; // Gitti
                    victim.isListed = false;
                    setTimeout(() => alert(\`👔 SPORTİF DİREKTÖR VURGUNU! (Tüccar Akıl)\\n\\nSportif Direktörünüz kulübün "yetenek parlatma" felsefesi gereği \${victim.name} için gelen \${sellPrice}M €'luk dev teklifi size SORMADAN kabul etti!\\n\\n"Hocam kusura bakma, bu kulübün vizyonu ucuza alıp pahalıya satmaktır. Oyuncuyu okuttum, kasayı doldurdum."\`), 5000);
                }
            } 
            // 2. Gizli Yetenek Transferi (%8 ihtimal)
            else if (sdEventChance >= 0.06 && sdEventChance < 0.14 && myTeam.budget > 5) {
                let cost = 1 + Math.floor(Math.random() * 3);
                myTeam.budget -= cost;
                let newKid = {
                    id: "sd_regen_" + Date.now(),
                    name: "Scout Harikası Genç (" + Math.floor(Math.random()*1000) + ")",
                    position: ["OOS", "SNT", "KND", "MO", "SLB", "SGB"].sort(() => 0.5 - Math.random())[0],
                    power: 65 + Math.floor(Math.random() * 15), // 65-80 güç
                    speed: 4.5,
                    age: 18 + Math.floor(Math.random() * 2), // 18-19 yaş
                    teamId: window.myTeamId,
                    contractYears: 5
                };
                window.leagueData.players.push(newKid);
                setTimeout(() => alert(\`👔 SPORTİF DİREKTÖR KEŞFİ! (Tüccar Akıl)\\n\\nSportif Direktörünüz scout ağını kullanarak \${cost}M € gibi komik bir rakama henüz kimsenin tanımadığı \${newKid.name} adında \${newKid.age} yaşında bir genci takıma kattı!\\n\\n"Hocam, isimlere değil potansiyele yatırım yapıyoruz. Bu çocuğu takıma monte et, 2 seneye 40 milyona devlere satacağız!"\`), 5000);
            }
        }
    }`;

content = content.replace(target, replacement);

fs.writeFileSync('c:\\\\Users\\\\Umit Ekrem Mikyas\\\\Downloads\\\\wep sitem\\\\futbol\\\\js\\\\game.js', content, 'utf8');
console.log('Patch sporting director applied successfully.');
