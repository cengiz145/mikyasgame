const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'js', 'squad.js');
let content = fs.readFileSync(filePath, 'utf8');

const oldMsgRegex = /\/\/ Doktor Yapay Zeka Çipi - Dinamik ve Detaylı Tıbbi Raporlama[\s\S]*?\}, 1500\);/m;

const newMsgLogic = `
            // Doktor Yapay Zeka Çipi - Sesi Kısıldı, Sadece Veritabanına Yazıyor
            // Kullanıcı revire gittiğinde doktorla yüz yüze görüşecek.
            if (newInjuries.length > 0) {
                // Sadece ufak bir bilgilendirme bildirimi (Alert veya spiker yok)
                console.log(newInjuries.length + " yeni sakatlık tespit edildi. Revire gidip doktor raporunu alabilirsiniz.");
            }
`;

content = content.replace(oldMsgRegex, newMsgLogic.trim());
fs.writeFileSync(filePath, content, 'utf8');
console.log("squad.js updated to remove post-match alert and voice.");
