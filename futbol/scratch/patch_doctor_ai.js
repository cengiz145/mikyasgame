const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'js', 'squad.js');
let content = fs.readFileSync(filePath, 'utf8');

// The block we want to update is the injury alert msg formatting
const oldMsgRegex = /let msg = "⚠️ SAKATLIK ŞOKU!\\n\\n";\s*newInjuries\.forEach\(p => \{\s*msg \+= `- \$\{p\.name\} sakatlandı! \\n   Sakatlık: \$\{p\.injuryType \|\| "Bilinmiyor"\} \(\$\{p\.injuredWeeks\} hafta yok\)\\n`;\s*\}\);\s*alert\(msg\);\s*setTimeout\(\(\) => \{\s*if\(typeof speak === 'function'\) speak\("Hocam kötü haber! Maçta sakatlanan oyuncularımız var\."\);\s*\}, 1500\);/;

const newMsgLogic = `
            // Doktor Yapay Zeka Çipi - Dinamik ve Detaylı Tıbbi Raporlama
            let msg = "⚠️ KULÜP DOKTORU RAPORU\\n\\n";
            let voiceLines = [];
            
            newInjuries.forEach(p => {
                let injuryDesc = p.injuryType || "Bilinmeyen bir sakatlık";
                
                // Doktorun teşhis ve açıklama yorumları (Yapay Zeka Çipi)
                let docComment = "";
                if (injuryDesc.includes("Çapraz Bağ")) docComment = "Hocam durum çok ciddi, ameliyat olması şart. Maalesef sezonu kapattı diyebiliriz.";
                else if (injuryDesc.includes("Aşil")) docComment = "Kötü haber... Aşil tendonunda kopma var. Bu yaştaki bir oyuncu için dönüşü çok zor olacak.";
                else if (injuryDesc.includes("Kaval") || injuryDesc.includes("Kırığı")) docComment = "Kemikte kırık tespit ettik. Alçıya alıp uzun süre beklemek zorundayız.";
                else if (injuryDesc.includes("Hamstring") || injuryDesc.includes("Arka Bacak")) docComment = "Aşırı depar ve yorgunluktan arka bacak kası yırtılmış. MR sonuçlarına göre haftalarca bizden uzak kalacak.";
                else if (injuryDesc.includes("Kasık")) docComment = "Kasıklarında zorlanma ve çekme var. Bir süre dinlendirmemiz şart, yoksa kronikleşebilir.";
                else if (injuryDesc.includes("Kafa Travması")) docComment = "Hava topunda kötü çarpıştı. Beyin sarsıntısı şüphesiyle protokol gereği bir süre kesinlikle oynamaması gerekiyor.";
                else if (injuryDesc.includes("Pubis")) docComment = "Hocam oyuncuda kronik pubis başlangıcı var. Aşırı yüklenmeden kaynaklı. Uzun bir tedavi süreci bizi bekliyor.";
                else if (injuryDesc.includes("Topuk") || injuryDesc.includes("Başparmağı")) docComment = "Zeminden ve krampondan kaynaklı bir zedelenme. Üzerine basmakta çok zorlanıyor.";
                else if (injuryDesc.includes("Menisküs")) docComment = "Diz kapağındaki kıkırdakta yırtık tespit ettik. Dinlenmesi gerekiyor.";
                else docComment = "Ufak bir zedelenme, ancak risk almamak için tedavisini başlattım.";
                
                msg += \`- \${p.name}: \${injuryDesc} (\${p.injuredWeeks} Hafta)\\n   Doktor Notu: "\${docComment}"\\n\\n\`;
                
                // Spiker/Sesli Rapor (Doktorun Sesi)
                voiceLines.push(\`\${p.name} için MR sonuçları çıktı hocam. \${injuryDesc} tespit ettik. Yaklaşık \${p.injuredWeeks} hafta sahalardan uzak kalacak.\`);
            });

            alert(msg);
            
            setTimeout(() => {
                if(typeof speak === 'function') {
                    if (newInjuries.length > 1) {
                        speak("Hocam sağlık merkezinden kötü haberler var. Birden fazla oyuncumuzda ciddi sakatlıklar tespit ettik.");
                    } else {
                        speak(voiceLines[0]);
                    }
                }
            }, 1500);
`;

content = content.replace(oldMsgRegex, newMsgLogic.trim());
fs.writeFileSync(filePath, content, 'utf8');
console.log("Doctor AI Chip applied to squad.js");
