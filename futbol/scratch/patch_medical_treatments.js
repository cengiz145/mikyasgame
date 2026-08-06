const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'js', 'psychologist.js');
let content = fs.readFileSync(filePath, 'utf8');

// The block we want to update is inside renderMedicalCenter
const oldRegex = /let docComment = "";[\s\S]*?let statusText = isHealing \? "⚕️ Kinesiofobi \(Fiziksel Temas Korkusu\)" : `🚑 \$\{injuryDesc\} \(\$\{p\.injuredWeeks\} Hafta\)`;[\s\S]*?li\.innerHTML = `[\s\S]*?`;/m;

const newLogic = `
                let docComment = "";
                let treatmentMethod = "";
                
                if (isHealing) {
                    docComment = "Fiziksel olarak iyileşti ancak sahaya çıkmaktan korkuyor (Kinesiofobi). Psikolojik destek alması şart.";
                    treatmentMethod = "Bilişsel Davranışçı Terapi (CBT) ve korkuyla yüzleşme seansları uygulanıyor.";
                    voiceLines.push(\`\${p.name} fiziksel olarak iyileşti ancak sahaya çıkmaktan korkuyor.\`);
                } else {
                    if (injuryDesc.includes("Çapraz Bağ")) {
                        docComment = "Hocam durum çok ciddi, ameliyat olması şart. Maalesef sezonu kapattı diyebiliriz.";
                        treatmentMethod = "Açık Diz Cerrahisi (Bağ Rekonstrüksiyonu), ardından 6 ay yoğun fizyoterapi ve su içi yürüyüş antrenmanları.";
                    } else if (injuryDesc.includes("Aşil")) {
                        docComment = "Kötü haber... Aşil tendonunda kopma var. Bu yaştaki bir oyuncu için dönüşü çok zor olacak.";
                        treatmentMethod = "Tendon onarım ameliyatı. İlk 8 hafta alçı ve atel kullanımı, sonrasında izokinetik kas güçlendirme.";
                    } else if (injuryDesc.includes("Kaval") || injuryDesc.includes("Kırığı")) {
                        docComment = "Kemikte kırık tespit ettik. Alçıya alıp uzun süre beklemek zorundayız.";
                        treatmentMethod = "Kemiğin titanyum vida/plak ile sabitlenmesi (Osteosentez). Kalsiyum destekli özel beslenme ve alçı istirahati.";
                    } else if (injuryDesc.includes("Hamstring") || injuryDesc.includes("Arka Bacak") || injuryDesc.includes("Ön Bacak") || injuryDesc.includes("Baldır") || injuryDesc.includes("Kasık")) {
                        docComment = "Aşırı depar ve yorgunluktan kas yırtılması oluşmuş. MR sonuçlarına göre haftalarca bizden uzak kalacak.";
                        treatmentMethod = "PRP (Trombositten Zengin Plazma) enjeksiyonları, derin doku masajı, ultrasonik dalga tedavisi ve tam istirahat.";
                    } else if (injuryDesc.includes("Kafa Travması") || injuryDesc.includes("Sarsıntı")) {
                        docComment = "Hava topunda kötü çarpıştı. Beyin sarsıntısı şüphesiyle protokol gereği bir süre kesinlikle oynamaması gerekiyor.";
                        treatmentMethod = "Karanlık oda istirahati. Ekran/telefon yasağı ve düzenli nörolojik refleks testleri.";
                    } else if (injuryDesc.includes("Pubis")) {
                        docComment = "Hocam oyuncuda kronik pubis başlangıcı var. Aşırı yüklenmeden kaynaklı. Uzun bir tedavi süreci bizi bekliyor.";
                        treatmentMethod = "Kortizon iğneleri, osteopatik pelvis hizalama ve karın/kasığı bağlayan core bölgesi güçlendirmeleri.";
                    } else if (injuryDesc.includes("Topuk") || injuryDesc.includes("Başparmağı") || injuryDesc.includes("Burkulması")) {
                        docComment = "Zeminden ve krampondan kaynaklı bağ zedelenmesi. Üzerine basmakta çok zorlanıyor.";
                        treatmentMethod = "Günde 3 kez kriyoterapi (buz banyosu), özel tabanlık kullanımı ve anti-inflamatuar ilaç tedavisi.";
                    } else if (injuryDesc.includes("Menisküs")) {
                        docComment = "Diz kapağındaki kıkırdakta yırtık tespit ettik. Dinlenmesi gerekiyor.";
                        treatmentMethod = "Artroskopik (kapalı) diz ameliyatı ile kıkırdak temizliği ve sonrasında CPM cihazı ile pasif hareket egzersizleri.";
                    } else if (injuryDesc.includes("Ezilmesi")) {
                        docComment = "Kemiğe kadar inen çok sert bir darbe almış. Ağır kas ezilmesi mevcut.";
                        treatmentMethod = "Kanamanın durması için kompresyon bandajı, elektrostimülasyon (TENS cihazı) ve ağrı kesici blokaj.";
                    } else {
                        docComment = "Ufak bir zedelenme, ancak risk almamak için tedavisini başlattım.";
                        treatmentMethod = "Rutin masaj, sıcak-soğuk pres ve düşük tempolu bireysel bisiklet antrenmanı.";
                    }
                    
                    voiceLines.push(\`\${p.name} için MR sonuçları şöyle: \${injuryDesc} tespit ettik. \${p.injuredWeeks} hafta sahalardan uzak kalacak.\`);
                }
                
                let statusText = isHealing ? "⚕️ Kinesiofobi (Fiziksel Temas Korkusu)" : \`🚑 \${injuryDesc} (\${p.injuredWeeks} Hafta)\`;
                
                let li = document.createElement("li");
                li.style.padding = "15px";
                li.style.borderBottom = "1px solid #34495e";
                li.style.backgroundColor = "rgba(0, 0, 0, 0.3)";
                li.style.borderRadius = "8px";
                li.style.marginBottom = "10px";
                
                li.innerHTML = \`
                    <strong style="color: #ff7675; font-size: 1.2rem;">\${p.name}</strong> - <span style="color: #fdcb6e;">\${statusText}</span>
                    <div style="margin-top: 10px; padding: 10px; background: rgba(155, 89, 182, 0.1); border-left: 4px solid #9b59b6; border-radius: 4px;">
                        <span style="color: #ecf0f1; font-size: 0.95rem; font-style: italic;"><strong>🩺 Doktor Yorumu:</strong> "\${docComment}"</span>
                    </div>
                    <div style="margin-top: 5px; padding: 10px; background: rgba(39, 174, 96, 0.1); border-left: 4px solid #27ae60; border-radius: 4px;">
                        <span style="color: #ecf0f1; font-size: 0.95rem;"><strong>💉 Uygulanan Tedavi Süreci:</strong> \${treatmentMethod}</span>
                    </div>
                \`;
`;

content = content.replace(oldRegex, newLogic.trim());
fs.writeFileSync(filePath, content, 'utf8');
console.log("Psychologist.js updated for treatment methods UI.");
