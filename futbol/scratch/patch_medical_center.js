const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'js', 'psychologist.js');
let content = fs.readFileSync(filePath, 'utf8');

const oldRevirRegex = /window\.renderMedicalCenter = function\(\) \{[\s\S]*?\}\s*\};\s*document\.getElementById/m;

const newRevirLogic = `
    window.renderMedicalCenter = function() {
        const list = document.getElementById('injured-players-list');
        if (!list) return;
        
        let myTeamId = window.myTeamId || (window.league ? window.league.userTeamId : "galatasaray");
        let injured = window.leagueData.players.filter(p => p.teamId === myTeamId && (p.isInjured || p.isKinesiophobic));
        
        list.innerHTML = "";
        
        if (injured.length === 0) {
            list.innerHTML = "<li style='color: #2ecc71; padding: 10px;'>Şu an takımda sakat veya fiziksel travma yaşayan oyuncu yok.</li>";
            if(typeof speak === 'function') speak("Hocam revirimiz bomboş. Takımın maşallahı var.");
        } else {
            let voiceLines = [];
            injured.forEach(p => {
                let injuryDesc = p.injuryType || "Bilinmeyen bir sakatlık";
                let isHealing = p.injuredWeeks === 0 && p.isKinesiophobic;
                let docComment = "";
                
                if (isHealing) {
                    docComment = "Fiziksel olarak iyileşti ancak sahaya çıkmaktan korkuyor (Kinesiofobi). Psikolojik destek alması şart.";
                    voiceLines.push(\`\${p.name} fiziksel olarak iyileşti ancak sahaya çıkmaktan korkuyor.\`);
                } else {
                    if (injuryDesc.includes("Çapraz Bağ")) docComment = "Hocam durum çok ciddi, ameliyat olması şart. Maalesef sezonu kapattı diyebiliriz.";
                    else if (injuryDesc.includes("Aşil")) docComment = "Kötü haber... Aşil tendonunda kopma var. Bu yaştaki bir oyuncu için dönüşü çok zor olacak.";
                    else if (injuryDesc.includes("Kaval") || injuryDesc.includes("Kırığı")) docComment = "Kemikte kırık tespit ettik. Alçıya alıp uzun süre beklemek zorundayız.";
                    else if (injuryDesc.includes("Hamstring") || injuryDesc.includes("Arka Bacak")) docComment = "Aşırı depar ve yorgunluktan arka bacak kası yırtılmış. MR sonuçlarına göre haftalarca bizden uzak kalacak.";
                    else if (injuryDesc.includes("Kasık")) docComment = "Kasıklarında zorlanma ve çekme var. Bir süre dinlendirmemiz şart, yoksa kronikleşebilir.";
                    else if (injuryDesc.includes("Kafa Travması") || injuryDesc.includes("Sarsıntı")) docComment = "Hava topunda kötü çarpıştı. Beyin sarsıntısı şüphesiyle protokol gereği bir süre kesinlikle oynamaması gerekiyor.";
                    else if (injuryDesc.includes("Pubis")) docComment = "Hocam oyuncuda kronik pubis başlangıcı var. Aşırı yüklenmeden kaynaklı. Uzun bir tedavi süreci bizi bekliyor.";
                    else if (injuryDesc.includes("Topuk") || injuryDesc.includes("Başparmağı")) docComment = "Zeminden ve krampondan kaynaklı bir zedelenme. Üzerine basmakta çok zorlanıyor.";
                    else if (injuryDesc.includes("Menisküs")) docComment = "Diz kapağındaki kıkırdakta yırtık tespit ettik. Dinlenmesi gerekiyor.";
                    else docComment = "Ufak bir zedelenme, ancak risk almamak için tedavisini başlattım.";
                    
                    voiceLines.push(\`\${p.name} için MR sonuçları şöyle: \${injuryDesc} tespit ettik. \${p.injuredWeeks} hafta sahalardan uzak kalacak.\`);
                }
                
                let statusText = isHealing ? "⚕️ Kinesiofobi (Fiziksel Temas Korkusu)" : \`🚑 \${injuryDesc} (\${p.injuredWeeks} Hafta)\`;
                
                let li = document.createElement("li");
                li.style.padding = "15px";
                li.style.borderBottom = "1px solid #c0392b";
                li.style.backgroundColor = "rgba(0, 0, 0, 0.2)";
                li.style.borderRadius = "8px";
                li.style.marginBottom = "10px";
                
                li.innerHTML = \`
                    <strong style="color: #ff7675; font-size: 1.1rem;">\${p.name}</strong> - <span style="color: #fdcb6e;">\${statusText}</span><br>
                    <span style="color: #ecf0f1; font-size: 0.95rem; font-style: italic;">🩺 Kulüp Doktoru Yorumu: "\${docComment}"</span>
                \`;
                list.appendChild(li);
            });
            
            // Speak the doctor's diagnosis for the first injured player, or a general summary if many
            if(typeof speak === 'function') {
                if (voiceLines.length > 2) {
                    speak("Hocam revir çok kalabalık. Birden fazla oyuncumuzun tedavisi sürüyor. Dosyaları ekranınıza yansıtıyorum.");
                } else {
                    speak(voiceLines[0]); // İlk oyuncunun detayını okur
                }
            }
        }
    };

    document.getElementById`;

content = content.replace(oldRevirRegex, newRevirLogic.trim());
fs.writeFileSync(filePath, content, 'utf8');
console.log("Psychologist.js updated for doctor AI UI and voice.");
