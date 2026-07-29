const fs = require('fs');

// --- MANAGER.JS PATCH (Medical Profile / Koruyucu Hekim) ---
let managerContent = fs.readFileSync('c:\\\\Users\\\\Umit Ekrem Mikyas\\\\Downloads\\\\wep sitem\\\\futbol\\\\js\\\\manager.js', 'utf8');

let targetManager = `function selectPlayerForSlot(playerId) {
    // 1. Önce oyuncu başka bir slotta varsa ordan sil (Duble olmasın)
    let oldFormIdx = window.myTeam.formation.indexOf(playerId);`;

let replaceManager = `function selectPlayerForSlot(playerId) {
    if (!window.medicalProfile) {
        window.medicalProfile = Math.random() < 0.5 ? "koruyucu" : "geleneksel";
    }

    let p = getPlayerById(playerId);

    if (!isSelectingForSub && window.medicalProfile === 'koruyucu' && p.stamina < 65) {
        let warnMsg = "⚕️ KORUYUCU HEKİM UYARISI:\\n\\nHocam, " + p.name + " isimli oyuncunun kan değerleri ve uyku kalitesi alarm veriyor. Kas yorgunluğu sınırda (Kondisyon: %" + Math.floor(p.stamina) + ").\\n\\nEğer onu bugün ilk 11'e koyarsan kası her an yırtılabilir. Riske girmek istediğine emin misin?";
        if (!confirm(warnMsg)) {
            if(typeof speak === 'function') speak("Doktorun tavsiyesine uyarak oyuncuyu dinlendirme kararı aldınız.");
            return;
        } else {
            if(typeof speak === 'function') speak("Sağlık ekibini dinlemeyip büyük bir risk aldınız!");
        }
    }

    // 1. Önce oyuncu başka bir slotta varsa ordan sil (Duble olmasın)
    let oldFormIdx = window.myTeam.formation.indexOf(playerId);`;

managerContent = managerContent.replace(targetManager, replaceManager);
fs.writeFileSync('c:\\\\Users\\\\Umit Ekrem Mikyas\\\\Downloads\\\\wep sitem\\\\futbol\\\\js\\\\manager.js', managerContent, 'utf8');

// --- PSYCHOLOGIST.JS PATCH (Mental Coach) ---
let psychContent = fs.readFileSync('c:\\\\Users\\\\Umit Ekrem Mikyas\\\\Downloads\\\\wep sitem\\\\futbol\\\\js\\\\psychologist.js', 'utf8');

let targetPsych = `        if (isApproved) {
            p.happiness = "Umutlu 😊";
            p.emotions.happiness = 100; p.emotions.sadness = 0; p.emotions.fear = 0; p.emotions.anger = 0;
            p.bio.cortisol = 0; p.bio.dopamine = 100;

            if (request.type === 'kinesio') {`;

let replacePsych = `        if (!window.mentalCoachProfile) {
            window.mentalCoachProfile = Math.random() < 0.5 ? "modern_koc" : "geleneksel";
        }

        if (isApproved) {
            p.happiness = "Umutlu 😊";
            p.emotions.happiness = 100; p.emotions.sadness = 0; p.emotions.fear = 0; p.emotions.anger = 0;
            p.bio.cortisol = 0; p.bio.dopamine = 100;

            // Eğer "Modern Mental Koç" ise seanslar çok daha güçlü ve agresif etki yaratır
            if (window.mentalCoachProfile === 'modern_koc') {
                p.happiness = "Ateşli 🔥";
                p.bio.testosterone = 100; // Sahada canavar kesilir
            }

            if (request.type === 'kinesio') {`;

let targetPsychMsg = `            if(typeof speak === 'function') speak(\`Terapi başarılı. \${p.name} çok daha iyi hissediyor.\`);
        } else {`;

let replacePsychMsg = `            if (window.mentalCoachProfile === 'modern_koc') {
                msg += " (Mental Koçun muazzam seansı sayesinde oyuncunun zihni adeta yeniden programlandı!)";
            }
            if(typeof speak === 'function') speak(\`Terapi başarılı. \${p.name} çok daha iyi hissediyor.\`);
        } else {`;

psychContent = psychContent.replace(targetPsych, replacePsych);
psychContent = psychContent.replace(targetPsychMsg, replacePsychMsg);

fs.writeFileSync('c:\\\\Users\\\\Umit Ekrem Mikyas\\\\Downloads\\\\wep sitem\\\\futbol\\\\js\\\\psychologist.js', psychContent, 'utf8');

console.log('Patch health teams applied successfully.');
