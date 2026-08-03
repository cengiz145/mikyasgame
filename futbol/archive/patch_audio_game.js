const fs = require('fs');

const gameFile = 'C:\\Users\\Umit Ekrem Mikyas\\Downloads\\wep sitem\\futbol\\js\\game.js';
if (fs.existsSync(gameFile)) {
    let content = fs.readFileSync(gameFile, 'utf8');

    // 1. Audio Manager'ı ekleme (initGame'in dışına)
    const audioManagerCode = `
// --- AUDIO MANAGER ---
window.AudioManager = {
    ambiance: null,
    cheer: null,
    boo: null,
    isMuted: false,
    
    init: function() {
        if (!this.ambiance) {
            this.ambiance = new Audio('sounds/ambiance.ogg');
            this.ambiance.loop = true;
            this.ambiance.volume = 0.4; // Arka plan
        }
        if (!this.cheer) {
            this.cheer = new Audio('sounds/cheer.ogg');
            this.cheer.volume = 0.8;
        }
        if (!this.boo) {
            this.boo = new Audio('sounds/boo.ogg');
            this.boo.volume = 0.7;
        }
        
        // Mute butonunu ekle (Eğer yoksa)
        if (!document.getElementById('btn-mute')) {
            let muteBtn = document.createElement('button');
            muteBtn.id = 'btn-mute';
            muteBtn.innerHTML = '🔊';
            muteBtn.style.cssText = 'position:absolute; top:20px; right:20px; z-index:1000; font-size:2rem; background:transparent; border:none; cursor:pointer; outline:none; text-shadow: 0 0 10px rgba(0,0,0,0.5);';
            muteBtn.onclick = () => this.toggleMute();
            document.getElementById('game-container').appendChild(muteBtn);
        }
    },
    
    startAmbiance: function() {
        if (this.isMuted) return;
        if (this.ambiance) this.ambiance.play().catch(e => console.log("Audio play prevented:", e));
    },
    
    stopAmbiance: function() {
        if (this.ambiance) this.ambiance.pause();
    },
    
    playCheer: function() {
        if (this.isMuted) return;
        if (this.cheer) {
            this.cheer.currentTime = 0;
            this.cheer.play().catch(e => console.log(e));
            // Sesi geçici kıs
            if (this.ambiance) this.ambiance.volume = 0.1;
            setTimeout(() => { if (this.ambiance) this.ambiance.volume = 0.4; }, 4000);
        }
    },
    
    playBoo: function() {
        if (this.isMuted) return;
        if (this.boo) {
            this.boo.currentTime = 0;
            this.boo.play().catch(e => console.log(e));
            // Sesi geçici kıs
            if (this.ambiance) this.ambiance.volume = 0.1;
            setTimeout(() => { if (this.ambiance) this.ambiance.volume = 0.4; }, 4000);
        }
    },
    
    toggleMute: function() {
        this.isMuted = !this.isMuted;
        let btn = document.getElementById('btn-mute');
        if (this.isMuted) {
            this.stopAmbiance();
            if (btn) btn.innerHTML = '🔇';
        } else {
            this.startAmbiance();
            if (btn) btn.innerHTML = '🔊';
        }
    }
};
// --- AUDIO MANAGER SONU ---
`;

    if (!content.includes('window.AudioManager')) {
        content = audioManagerCode + "\n" + content;
    }

    // 2. initGame içine Audio Başlatma eklentisi
    const initGameRegex = /function initGame\(\) \{[\s\S]*?if \(typeof drawInterval !== 'undefined'\) clearInterval\(drawInterval\);/;
    const initGameReplacement = `function initGame() {
    // Sesleri başlat
    if (window.AudioManager) {
        window.AudioManager.init();
        window.AudioManager.startAmbiance();
    }
    
    // Önceki maçtan kalan timer'ları temizle`;
    content = content.replace(/function initGame\(\) \{/, initGameReplacement);

    // 3. checkGoal fonksiyonu içerisine Gol Sesi (Cheer) eklentisi
    // game.js'de genelde "GOL!" alert'i veya log'u atan bir yer vardır, 
    // Veya scoreA++ veya scoreB++ olan yerlere playCheer eklenebilir.
    // Replace "scoreA++" -> "scoreA++; if(window.AudioManager) window.AudioManager.playCheer();"
    content = content.replace(/scoreA\+\+;/g, "scoreA++; if(window.AudioManager) window.AudioManager.playCheer();");
    content = content.replace(/scoreB\+\+;/g, "scoreB++; if(window.AudioManager) window.AudioManager.playCheer();");

    // 4. Faul (foul), Out (out) veya Şut Kaçtı durumlarında Boo sesi
    // "executeShot" ve "foul" vb yerlere eklemek lazım
    // "hasBall = false;" veya "Top Dışarı Çıktı" loglarını arayıp playBoo koyabiliriz.
    // Ancak en güvenlisi "Kırmızı Kart" veya belirli foul alertlerine koymak.
    // "sar kart" veya "krmz kart"
    content = content.replace(/card === 'Red'/g, "card === 'Red'; if(window.AudioManager) window.AudioManager.playBoo();");
    content = content.replace(/Out!/g, "Out!; if(Math.random()<0.3 && window.AudioManager) window.AudioManager.playBoo();");

    fs.writeFileSync(gameFile, content, 'utf8');
    console.log("game.js - Audio Manager başarıyla eklendi ve bağlandı.");
} else {
    console.log("game.js bulunamadı!");
}
