const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'js', 'squad.js');
let content = fs.readFileSync(filePath, 'utf8');

// The English names need to be translated or removed:
const replacements = {
    "Hamstring (Arka Bacak) Yırtığı": "Arka Bacak (Hamstring) Yırtığı", // Although Hamstring is used in TR, "Arka Bacak Yırtığı" is clearer. Let's just use "Arka Bacak Yırtığı"
    "Quadriceps (Ön Üst Bacak) Yırtığı": "Ön Bacak Yırtığı",
    "Kalf (Baldır) Yırtığı": "Baldır Yırtığı",
    "Kasık Çekmesi (Groin Strain)": "Kasık Çekmesi",
    "İç Yan Bağ (MCL) Esnemesi": "İç Yan Bağ Esnemesi",
    "Menisküs Yırtığı": "Menisküs Yırtığı",
    "Ön Çapraz Bağ (ACL) Yırtığı": "Ön Çapraz Bağ Kopması",
    "Tarak Kemiği (Metatarsal) Kırığı": "Ayak Tarak Kemiği Kırığı",
    "Kaval Kemiği (Tibia) Kırığı": "Kaval Kemiği Kırığı",
    "Osteitis Pubis": "Kasık İltihabı (Pubis)", // Pubis is commonly used in Turkish sports media.
    "Aşil Tendiniti / Yırtığı": "Aşil Tendonu Kopması",
    "Patellar Tendinit (Sıçrayıcı Dizi)": "Diz Kapağı Tendonu İltihabı",
    "Shin Splints (Kaval Ağrısı)": "Kaval Kemiği Ağrısı",
    "El / Bilek / Parmak Kırığı": "El / Parmak Kırığı",
    "Omuz Çıkığı / Köprücük Kırığı": "Omuz Çıkığı / Köprücük Kemiği Kırığı",
    "Ölü Bacak (Dead Leg)": "Üst Bacak Ezilmesi",
    "Suni Çim Parmağı (Turf Toe)": "Ayak Başparmağı Burkulması",
    "Topuk Dikeni (Plantar Fasciitis)": "Topuk Dikeni",
    "Ayak Bileği Burkulması": "Ayak Bileği Burkulması",
    "Kafa Travması (Sarsıntı)": "Kafa Travması ve Sarsıntı"
};

// Also replace in the getW calls
// So it's better to just replace the definitions and getW calls via global replace.
// Wait, doing exact string replacements on the file:
let newContent = content;
newContent = newContent.replace(/Hamstring \(Arka Bacak\) Yırtığı/g, "Arka Bacak Yırtığı");
newContent = newContent.replace(/Quadriceps \(Ön Üst Bacak\) Yırtığı/g, "Ön Bacak Yırtığı");
newContent = newContent.replace(/Kalf \(Baldır\) Yırtığı/g, "Baldır Yırtığı");
newContent = newContent.replace(/Kasık Çekmesi \(Groin Strain\)/g, "Kasık Çekmesi");
newContent = newContent.replace(/İç Yan Bağ \(MCL\) Esnemesi/g, "İç Yan Bağ Esnemesi");
newContent = newContent.replace(/Menisküs Yırtığı/g, "Menisküs Yırtığı");
newContent = newContent.replace(/Ön Çapraz Bağ \(ACL\) Yırtığı/g, "Ön Çapraz Bağ Kopması");
newContent = newContent.replace(/Tarak Kemiği \(Metatarsal\) Kırığı/g, "Ayak Tarak Kemiği Kırığı");
newContent = newContent.replace(/Kaval Kemiği \(Tibia\) Kırığı/g, "Kaval Kemiği Kırığı");
newContent = newContent.replace(/Osteitis Pubis/g, "Kasık İltihabı (Pubis)");
newContent = newContent.replace(/Aşil Tendiniti \/ Yırtığı/g, "Aşil Tendonu Kopması");
newContent = newContent.replace(/Patellar Tendinit \(Sıçrayıcı Dizi\)/g, "Diz Kapağı İltihabı");
newContent = newContent.replace(/Shin Splints \(Kaval Ağrısı\)/g, "Kaval Kemiği Ağrısı");
newContent = newContent.replace(/El \/ Bilek \/ Parmak Kırığı/g, "El ve Parmak Kırığı");
newContent = newContent.replace(/Omuz Çıkığı \/ Köprücük Kırığı/g, "Omuz ve Köprücük Kemiği Kırığı");
newContent = newContent.replace(/Ölü Bacak \(Dead Leg\)/g, "Üst Bacak Ezilmesi");
newContent = newContent.replace(/Suni Çim Parmağı \(Turf Toe\)/g, "Ayak Başparmağı Burkulması");
newContent = newContent.replace(/Topuk Dikeni \(Plantar Fasciitis\)/g, "Topuk Dikeni");
newContent = newContent.replace(/Kafa Travması \(Sarsıntı\)/g, "Kafa Travması");

fs.writeFileSync(filePath, newContent, 'utf8');
console.log("English injury names removed from squad.js");
