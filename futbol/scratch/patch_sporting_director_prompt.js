const fs = require('fs');

let content = fs.readFileSync('c:\\\\Users\\\\Umit Ekrem Mikyas\\\\Downloads\\\\wep sitem\\\\futbol\\\\js\\\\game.js', 'utf8');

// 1. Sell prompt modification
let target1 = `                    let victim = myPlayers[Math.floor(Math.random() * myPlayers.length)];
                    let sellPrice = Math.floor(victim.power * 1.5) + Math.floor(Math.random() * 20); // Yüksek fiyata satar
                    myTeam.budget += sellPrice;
                    victim.teamId = "avrupa_devi"; // Gitti
                    victim.isListed = false;
                    setTimeout(() => alert(\`👔 SPORTİF DİREKTÖR VURGUNU! (Tüccar Akıl)\\n\\nSportif Direktörünüz kulübün "yetenek parlatma" felsefesi gereği \${victim.name} için gelen \${sellPrice}M €'luk dev teklifi size SORMADAN kabul etti!\\n\\n"Hocam kusura bakma, bu kulübün vizyonu ucuza alıp pahalıya satmaktır. Oyuncuyu okuttum, kasayı doldurdum."\`), 5000);
                }`;

let replacement1 = `                    let victim = myPlayers[Math.floor(Math.random() * myPlayers.length)];
                    let sellPrice = Math.floor(victim.power * 1.5) + Math.floor(Math.random() * 20); // Yüksek fiyata satar
                    setTimeout(() => {
                        let isAccepted = confirm(\`👔 SPORTİF DİREKTÖR SATIŞ ÖNERİSİ! (Tüccar Akıl)\\n\\nSportif Direktörünüz kulübün felsefesi gereği yetenekli oyuncunuz \${victim.name} için \${sellPrice}M €'luk dev bir teklif getirdi.\\n\\n"Hocam vizyonumuz ucuza alıp pahalıya satmaktır. Bu rakama bu oyuncuyu hemen satmalıyız. Onaylıyor musunuz?"\`);
                        if (isAccepted) {
                            myTeam.budget += sellPrice;
                            victim.teamId = "avrupa_devi"; // Gitti
                            victim.isListed = false;
                            alert(\`Satış onaylandı! \${victim.name} kulüpten ayrıldı, kasaya \${sellPrice}M € girdi.\`);
                        } else {
                            alert(\`Satış iptal edildi! Sportif direktör "Sen bilirsin hocam ama bu fırsat bir daha gelmezdi" diyerek uzaklaştı.\`);
                        }
                    }, 5000);
                }`;

content = content.replace(target1, replacement1);

// 2. Buy prompt modification
let target2 = `            // 2. Gizli Yetenek Transferi (%8 ihtimal)
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
            }`;

let replacement2 = `            // 2. Gizli Yetenek Transferi (%8 ihtimal)
            else if (sdEventChance >= 0.06 && sdEventChance < 0.14 && myTeam.budget > 5) {
                let cost = 1 + Math.floor(Math.random() * 3);
                let newKid = {
                    id: "sd_regen_" + Date.now(),
                    name: "Scout Harikası Genç (" + Math.floor(Math.random()*1000) + ")",
                    position: ["OOS", "SNT", "KND", "MO", "SLB", "SGB"].sort(() => 0.5 - Math.random())[0],
                    power: 65 + Math.floor(Math.random() * 15), // 65-80 güç
                    speed: 4.5,
                    age: 18 + Math.floor(Math.random() * 2), // 18-19 yaş
                    teamId: "free_agent",
                    contractYears: 5
                };
                setTimeout(() => {
                    let isAccepted = confirm(\`👔 SPORTİF DİREKTÖR OYUNCU ÖNERİSİ! (Tüccar Akıl)\\n\\nSportif Direktörünüz scout ağını kullanarak henüz kimsenin tanımadığı \${newKid.name} adında \${newKid.age} yaşında (\${newKid.power} Güç, \${newKid.position}) bir genci buldu. Maliyeti sadece \${cost}M €.\\n\\n"Hocam, potansiyele yatırım yapmalıyız. Bu çocuğu alırsak 2 seneye 40 milyona satarız. Transferi onaylıyor musunuz?"\`);
                    if (isAccepted) {
                        if (myTeam.budget >= cost) {
                            myTeam.budget -= cost;
                            newKid.teamId = window.myTeamId;
                            window.leagueData.players.push(newKid);
                            alert(\`Transfer onaylandı! \${newKid.name} artık takımınızda.\`);
                        } else {
                            alert(\`Transfer başarısız! Bütçeniz yetersiz.\`);
                        }
                    } else {
                        alert(\`Transfer reddedildi. Sportif direktör "Büyük bir yeteneği elimizden kaçırdık" diyerek sitem etti.\`);
                    }
                }, 5000);
            }`;

content = content.replace(target2, replacement2);

fs.writeFileSync('c:\\\\Users\\\\Umit Ekrem Mikyas\\\\Downloads\\\\wep sitem\\\\futbol\\\\js\\\\game.js', content, 'utf8');
console.log('Patch sporting director prompt applied successfully.');
