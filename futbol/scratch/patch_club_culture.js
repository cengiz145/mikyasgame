const fs = require('fs');

// --- 1. TRANSFER.JS PATCH (Yeni Oyuncu Katılımı) ---
let transferContent = fs.readFileSync('c:\\\\Users\\\\Umit Ekrem Mikyas\\\\Downloads\\\\wep sitem\\\\futbol\\\\js\\\\transfer.js', 'utf8');

let targetTransfer = `                p.teamId = task.teamId;
                p.contractYears = Math.floor(Math.random() * 3) + 2; // 2-4 Yıl yeni sözleşme
                reports.push(\`💰 BAŞARILI: \${p.name} için yapılan \${task.price} Milyon Euro'luk teklif kabul edildi. Oyuncu takımınıza katıldı!\`);`;

let replaceTransfer = `                p.teamId = task.teamId;
                p.contractYears = Math.floor(Math.random() * 3) + 2;

                if (!window.clubCultureProfile) {
                    window.clubCultureProfile = Math.random() < 0.5 ? "emektar_malzemeci" : "sosyal_medya_admini";
                }

                if (window.clubCultureProfile === 'sosyal_medya_admini') {
                    reports.push(\`🔥 GECE YARISI OPERASYONU! Sosyal Medya Ekibimiz Hollywood fragmanlarını aratmayan bir video yayınladı: "Şehrin yeni sahibi \${p.name}!". Rakip takım taraftarları çıldırıyor, kendi taraftarımızın aidiyeti tavan yaptı!\`);
                } else if (window.clubCultureProfile === 'emektar_malzemeci') {
                    reports.push(\`👕 \${p.name} tesislere adımını atar atmaz Emektar Malzemecimiz onu karşıladı. Odasını gösterdi, ona şehri anlattı. Oyuncu kendisini 10 yıldır bu kulüpteymiş gibi güvende hissediyor.\`);
                    p.loyalty = 100; // Emektar malzemeci aidiyeti fuller
                } else {
                    reports.push(\`💰 BAŞARILI: \${p.name} için yapılan \${task.price} Milyon Euro'luk teklif kabul edildi. Oyuncu takımınıza katıldı!\`);
                }`;

transferContent = transferContent.replace(targetTransfer, replaceTransfer);
fs.writeFileSync('c:\\\\Users\\\\Umit Ekrem Mikyas\\\\Downloads\\\\wep sitem\\\\futbol\\\\js\\\\transfer.js', transferContent, 'utf8');

// --- 2. PSYCHOLOGIST.JS PATCH (Malzemecinin Dert Dinlemesi) ---
let psychContent = fs.readFileSync('c:\\\\Users\\\\Umit Ekrem Mikyas\\\\Downloads\\\\wep sitem\\\\futbol\\\\js\\\\psychologist.js', 'utf8');

let targetPsych = `            // 2. Takım Dinamiği (Bench Rebellion) Talebi
            if (p.benchedMatches > 2 && p.happiness !== "Mutlu 😊" && p.happiness !== "Umutlu 😊") {
                psychologyQueue.push({`;

let replacePsych = `            // 2. Takım Dinamiği (Bench Rebellion) Talebi
            if (p.benchedMatches > 2 && p.happiness !== "Mutlu 😊" && p.happiness !== "Umutlu 😊") {
                if (window.clubCultureProfile === 'emektar_malzemeci' && Math.random() < 0.5) {
                    p.happiness = "Umutlu 😊";
                    p.benchedMatches = 0; // Süreyya abi onu sakinleştirdi
                    if(typeof speak === 'function') speak(\`Kulübün hafızası Emektar Malzemecimiz, \${p.name} ile bir çay içip dertleşti. Oyuncunun size ve formaya olan küskünlüğü son buldu!\`);
                    return; // Kuyruğa girmez, sorun çözüldü
                }
                
                psychologyQueue.push({`;

psychContent = psychContent.replace(targetPsych, replacePsych);
fs.writeFileSync('c:\\\\Users\\\\Umit Ekrem Mikyas\\\\Downloads\\\\wep sitem\\\\futbol\\\\js\\\\psychologist.js', psychContent, 'utf8');

// --- 3. GAME.JS PATCH (Derbi Galibiyeti Admin Etkisi) ---
let gameContent = fs.readFileSync('c:\\\\Users\\\\Umit Ekrem Mikyas\\\\Downloads\\\\wep sitem\\\\futbol\\\\js\\\\game.js', 'utf8');

let targetGame = `        if (isWin) trustChange = isDerby ? 8 : 4;
        else if (isLoss) trustChange = isDerby ? -10 : -5;
        else trustChange = isDerby ? 0 : -1;`;

let replaceGame = `        if (isWin) trustChange = isDerby ? 8 : 4;
        else if (isLoss) trustChange = isDerby ? -10 : -5;
        else trustChange = isDerby ? 0 : -1;

        if (!window.clubCultureProfile) {
            window.clubCultureProfile = Math.random() < 0.5 ? "emektar_malzemeci" : "sosyal_medya_admini";
        }

        if (isWin && isDerby && window.clubCultureProfile === 'sosyal_medya_admini') {
            setTimeout(() => {
                if(typeof speak === 'function') speak("Derbi galibiyetinin ardından Sosyal Medya Adminimiz gece yarısı rakip takıma inanılmaz zekice bir gönderme (Tweet) attı! Paylaşım 1 milyon beğeni aldı, kulübün marka değeri ve yönetimin size olan güveni arttı!");
            }, 3000); // Maç sonu anonslarından hemen sonra
            trustChange += 5; // Ekstra güven kazanımı
        }`;

gameContent = gameContent.replace(targetGame, replaceGame);
fs.writeFileSync('c:\\\\Users\\\\Umit Ekrem Mikyas\\\\Downloads\\\\wep sitem\\\\futbol\\\\js\\\\game.js', gameContent, 'utf8');

console.log('Patch club culture applied successfully.');
