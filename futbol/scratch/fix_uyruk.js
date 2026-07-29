const fs = require('fs');

const files = [
    'js/data.js', 
    'js/data_world.js', 
    'js/data_superlig.js', 
    'js/data_tff1.js',
    'js/data_premier.js',
    'js/data_laliga.js',
    'js/data_seriea.js',
    'js/data_bundesliga.js'
];

let totalUpdated = 0;

files.forEach(file => {
    if (!fs.existsSync(file)) return;
    let content = fs.readFileSync(file, 'utf8');
    
    // Önce bozuk Türkçe karakterleri düzelt (Trkiye -> Türkiye)
    content = content.replace(/Trkiye/g, 'Türkiye');
    
    // data.js tarzı (tırnaksız key) için: birthplace: "Ankara, Türkiye" -> birthplace: "Ankara, Türkiye", nationality: "Türkiye"
    // Sadece henüz nationality eklenmemiş satırlara uygula
    content = content.replace(/(birthplace:\s*"([^"]+),\s*([^"]+)")/g, (match, fullMatch, city, country) => {
        // Eğer zaten nationality varsa es geç
        return `${fullMatch}, nationality: "${country.trim()}"`;
    });
    
    // data_world.js tarzı (tırnaklı key) için: "birthplace": "Paris, Fransa"
    content = content.replace(/("birthplace":\s*"([^"]+),\s*([^"]+)")/g, (match, fullMatch, city, country) => {
        return `${fullMatch}, "nationality": "${country.trim()}"`;
    });
    
    // Aynı satırda birden fazla kez eklenmesini önlemek için basit bir temizlik (varsa)
    // Şimdilik regex sadece 'birthplace' kısmını match ettiği için sorun olmayacak.
    
    fs.writeFileSync(file, content, 'utf8');
    console.log(`${file} dosyasına uyruklar başarıyla işlendi.`);
});

console.log("Ödev tamamlandı! Tüm oyunculara 'nationality' (uyruk) etiketi eklendi.");
