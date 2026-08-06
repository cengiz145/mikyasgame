const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'js', 'psychologist.js');
let content = fs.readFileSync(filePath, 'utf8');

const oldRegex = /<span style="color: #ecf0f1; font-size: 0\.95rem;"><strong>💉 Uygulanan Tedavi Süreci:<\/strong> \$\{treatmentMethod\}<\/span>[\s\S]*?<\/div>/m;

const newLogic = `
                        <span style="color: #ecf0f1; font-size: 0.95rem;"><strong>💉 Uygulanan Tedavi:</strong> \${treatmentMethod}</span>
                    </div>
                    <div style="margin-top: 5px; padding: 10px; background: rgba(52, 152, 219, 0.1); border-left: 4px solid #3498db; border-radius: 4px;">
                        <span style="color: #ecf0f1; font-size: 0.95rem;"><strong>⏳ Güncel Aşama (\${p.injuredWeeks} Hafta Kaldı):</strong> \${getTreatmentStage(injuryDesc, p.injuredWeeks)}</span>
                    </div>
`;

// We also need to add the getTreatmentStage function outside renderMedicalCenter
const stageFunc = `
    function getTreatmentStage(desc, weeksLeft) {
        if (desc.includes("Çapraz Bağ") || desc.includes("Aşil")) {
            if (weeksLeft > 20) return "Ameliyat tamamlandı. Atel/Alçı ile mutlak istirahat ve yatak istirahati evresi.";
            if (weeksLeft > 12) return "Atel çıkarıldı. Kinesiyoterapi ve su içi düşük ağırlıklı yürüyüşlere başlandı.";
            if (weeksLeft > 6) return "İzokinetik makine testleri ve düz zemin hafif tempolu koşular.";
            if (weeksLeft > 2) return "Topsuz bireysel antrenmanlar ve yön değiştirme testleri yapılıyor.";
            return "Takımla birlikte kontrollü top çalışmalarına (ısınma bölümü) katılıyor. Yakında sahada.";
        }
        else if (desc.includes("Kırığı")) {
            if (weeksLeft > 10) return "Kemik kaynama süreci bekleniyor. Tam alçı/atel sabitlemesi.";
            if (weeksLeft > 4) return "Alçı alındı, kemik yoğunluğu test ediliyor. Hafif yük bindirmeler başladı.";
            if (weeksLeft > 1) return "Fizik tedavi eşliğinde eklem açma egzersizleri ve kondisyon bisikleti.";
            return "Kemiğin tamamen kaynadığı doğrulandı. Takımla çalışmalara başladı.";
        }
        else if (desc.includes("Menisküs") || desc.includes("Pubis")) {
            if (weeksLeft > 8) return "Cerrahi müdahale sonrası yoğun ödem atma ve buz tedavisi aşaması.";
            if (weeksLeft > 4) return "Ödem tamamen indi. Esneklik kazanma ve core (merkez) kasları güçlendirme.";
            if (weeksLeft > 1) return "Tesislerde bireysel koşular ve kondisyoner eşliğinde dayanıklılık antrenmanı.";
            return "Tam kapasite idmanlara çıkmaya hazır.";
        }
        else {
            // Standart kas yırtıkları ve burkulmalar
            if (weeksLeft > 4) return "Yoğun PRP iğneleri ve derin doku ultrasonik tedavisi devam ediyor.";
            if (weeksLeft > 2) return "Masaj terapisi ve düz koşular başladı. Temposu yavaş yavaş artırılıyor.";
            if (weeksLeft > 1) return "Toplu çalışmalara (dar alan pas) dahil edilmeye başlandı.";
            return "Ağrıları tamamen geçti, doktor maç eksiğini kapatması için onay verdi.";
        }
    }

    window.renderMedicalCenter = function() {
`;

content = content.replace(oldRegex, newLogic.trim());
content = content.replace('window.renderMedicalCenter = function() {', stageFunc);

fs.writeFileSync(filePath, content, 'utf8');
console.log("Psychologist.js updated for dynamic treatment stages.");
