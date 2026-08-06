const fs = require('fs');

const gameFile = 'C:\\Users\\Umit Ekrem Mikyas\\Downloads\\wep sitem\\futbol\\js\\game.js';
if (fs.existsSync(gameFile)) {
    let content = fs.readFileSync(gameFile, 'utf8');

    const hook = /let msgs = \[\s*\{ t: 0, text: "[^"]+", ui: "[^"]+" \},\s*\{ t: 6000, text: "[^"]+" \+ gk\.name \+ "[^"]+" \+ def1\.name \+ "[^"]+" \+ def2\.name \+ "[^"]+", ui: "[^"]+" \},\s*\{ t: 14000, text: "[^"]+" \+ striker\.name \+ "[^"]+", ui: "[^"]+" \},\s*\{ t: 20000, text: "[^"]+", ui: "[^"]+" \},\s*\{ t: 25000, text: "[^"]+", ui: "[^"]+" \},\s*\{ t: 32000, text: "[^"]+", ui: "[^"]+" \},\s*\{ t: 35000, text: "[^"]+", ui: "" \}\s*\];\s*msgs\.forEach\(msg => \{\s*setTimeout\(\(\) => \{\s*if\(typeof speak === 'function'\) speak\(msg\.text\);\s*if\(typeof announcerText !== 'undefined' && msg\.ui\) announcerText\.textContent = msg\.ui;\s*if \(msg\.t === 32000\) \{\s*homePlayers\.forEach\(p => \{ p\.x = p\.targetX; p\.y = p\.targetY; p\.speed = p\.baseSpeed; \}\);\s*awayPlayers\.forEach\(p => \{ p\.x = p\.targetX; p\.y = p\.targetY; p\.speed = p\.baseSpeed; \}\);\s*\}\s*if \(msg\.t === 35000\) \{\s*window\.isPreMatch = false;\s*\}\s*\}, msg\.t\);\s*\}\);/g;

    const newLogic = `let msgs = [
                { t: 0, text: "Ekranları başındaki futbolseverler, herkese iyi akşamlar! Futbolun sadece futbol olmadığı o büyük gecelerden birindeyiz...", ui: "MAÇ ÖNCESİ SEREMONİSİ" },
                { t: 12000, text: "Kalede güven veren elleriyle " + gk.name + " var. Defans hattında " + def1.name + " ve " + def2.name + " görev yapacak.", ui: "İLK 11'LER OKUNUYOR" },
                { t: 25000, text: "İleri uçta ise takımın en büyük gol umudu, " + striker.name + " ağları havalandırmak için sahada!", ui: "İLK 11'LER OKUNUYOR" },
                { t: 38000, text: "Hocanın bugün dengeli bir taktikle sahaya çıktığını görüyoruz.", ui: "TAKTİK ANALİZ" },
                { t: 48000, text: "Rakip takım ise kudurmuş bir yapıyla oynayacak. Galiba bizi çok gollü ve açık bir maç bekliyor!", ui: "TAKTİK ANALİZ" },
                { t: 55000, text: "Oyuncular sahadaki yerlerini alıyor...", ui: "DÜDÜK BEKLENİYOR" },
                { t: 60000, text: "Ve hakemin ilk düdüğüyle maç başlıyor!", ui: "" }
            ];
            
            msgs.forEach(msg => {
                setTimeout(() => {
                    if(typeof speak === 'function') speak(msg.text);
                    if(typeof announcerText !== 'undefined' && msg.ui) announcerText.textContent = msg.ui;
                    
                    if (msg.t === 55000) {
                        homePlayers.forEach(p => { p.x = p.targetX; p.y = p.targetY; p.speed = p.baseSpeed; });
                        awayPlayers.forEach(p => { p.x = p.targetX; p.y = p.targetY; p.speed = p.baseSpeed; });
                    }
                    if (msg.t === 60000) {
                        window.isPreMatch = false; 
                    }
                }, msg.t);
            });`;

    // Regex eşleşmeme ihtimaline karşı replaceALL tarzı basit string replace de deneyelim
    if (content.includes('{ t: 35000, text: "Ve hakemin ilk düdüğüyle maç başlıyor!", ui: "" }')) {
        content = content.replace('{ t: 35000, text: "Ve hakemin ilk düdüğüyle maç başlıyor!", ui: "" }', '{ t: 60000, text: "Ve hakemin ilk düdüğüyle maç başlıyor!", ui: "" }');
        content = content.replace('{ t: 32000, text: "Oyuncular sahadaki yerlerini alıyor...", ui: "DÜDÜK BEKLENİYOR" }', '{ t: 55000, text: "Oyuncular sahadaki yerlerini alıyor...", ui: "DÜDÜK BEKLENİYOR" }');
        content = content.replace('{ t: 25000, text: "Rakip takım ise kudurmuş bir yapıyla oynayacak. Galiba bizi çok gollü ve açık bir maç bekliyor!", ui: "TAKTİK ANALİZ" }', '{ t: 48000, text: "Rakip takım ise kudurmuş bir yapıyla oynayacak. Galiba bizi çok gollü ve açık bir maç bekliyor!", ui: "TAKTİK ANALİZ" }');
        content = content.replace('{ t: 20000, text: "Hocanın bugün dengeli bir taktikle sahaya çıktığını görüyoruz.", ui: "TAKTİK ANALİZ" }', '{ t: 38000, text: "Hocanın bugün dengeli bir taktikle sahaya çıktığını görüyoruz.", ui: "TAKTİK ANALİZ" }');
        content = content.replace('{ t: 14000, text: "İleri uçta ise takımın en büyük gol umudu, " + striker.name + " ağları havalandırmak için sahada!", ui: "İLK 11\'LER OKUNUYOR" }', '{ t: 25000, text: "İleri uçta ise takımın en büyük gol umudu, " + striker.name + " ağları havalandırmak için sahada!", ui: "İLK 11\'LER OKUNUYOR" }');
        content = content.replace('{ t: 6000, text: "Kalede güven veren elleriyle " + gk.name + " var. Defans hattında " + def1.name + " ve " + def2.name + " görev yapacak.", ui: "İLK 11\'LER OKUNUYOR" }', '{ t: 12000, text: "Kalede güven veren elleriyle " + gk.name + " var. Defans hattında " + def1.name + " ve " + def2.name + " görev yapacak.", ui: "İLK 11\'LER OKUNUYOR" }');
        
        content = content.replace('if (msg.t === 32000)', 'if (msg.t === 55000)');
        content = content.replace('if (msg.t === 35000)', 'if (msg.t === 60000)');
        
        fs.writeFileSync(gameFile, content, 'utf8');
        console.log("game.js - Seremoni süreleri 1 dakikaya çıkarıldı.");
    } else {
        console.log("Seremoni satırları bulunamadı (Encoding problemi olabilir).");
    }
}
