const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'js', 'squad.js');
let content = fs.readFileSync(filePath, 'utf8');

const oldVoiceLogicRegex = /\/\/ Spiker\/Sesli Rapor \(Doktorun Sesi\)[\s\S]*?\}, 1500\);/;

const newVoiceLogic = `
                // Spiker (Asistan) sadece doktordan gelen raporu haber verir
                voiceLines.push(\`Hocam, kulüp doktorumuzdan acil bir rapor ulaştı. \${p.name} sakatlanmış. Tıbbi raporu ekranınıza aktarıyorum.\`);
            });

            alert(msg);
            
            setTimeout(() => {
                if(typeof speak === 'function') {
                    if (newInjuries.length > 1) {
                        speak("Hocam, sağlık ekibinden flaş bir rapor geldi. Maalesef birden fazla oyuncumuzda ciddi sakatlık şüphesi var. Raporu ekranınıza iletiyorum.");
                    } else {
                        speak(voiceLines[0]);
                    }
                }
            }, 1500);
`;

content = content.replace(oldVoiceLogicRegex, newVoiceLogic.trim());
fs.writeFileSync(filePath, content, 'utf8');
console.log("Announcer logic fixed in squad.js");
