const fs = require('fs');
let content = fs.readFileSync('js/game.js', 'utf8');

const replacement1 = let injuries = [
                                { reason: "ADALE ÇEKMESİ", msg: "Aman Allah'ım! " + p.name + " ani bir depara kalkmak isterken arka adalesini tuttu ve kendini yere bıraktı!" },
                                { reason: "DİZ DÖNMESİ", msg: "Eyvah eyvah! " + p.name + " yön değiştirirken dizi fena döndü! Acı içinde yerde kıvranıyor!" },
                                { reason: "ZEDELENME", msg: p.name + " ters bir hareket yaptı, kaslarında ciddi bir zedelenme var gibi duruyor. Sağlık ekipleri içeride!" }
                            ];
                            let randInj = injuries[Math.floor(Math.random() * injuries.length)];
                            haltReason = randInj.reason + " (" + p.name + ")";
                            if(typeof speak === 'function') speak(randInj.msg);;

content = content.replace(/haltReason = "ADALE[^"]+"\s*\+\s*p\.name\s*\+\s*"\)";\s*if\(typeof speak === 'function'\) speak\([^)]+\);/g, replacement1);

fs.writeFileSync('js/game.js', content, 'utf8');
console.log('Replaced');
