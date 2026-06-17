const fs = require('fs');
let content = fs.readFileSync('c:/Users/Umit Ekrem Mikyas/Downloads/hafÄ±zana gÃ¼ven/js/ui.js', 'utf8');

// 1. Add buyKanunPackBtn
content = content.replace(/const buyFlutPackBtn = document\.getElementById\('buy-flut-pack-btn'\);/,
    "const buyFlutPackBtn = document.getElementById('buy-flut-pack-btn');\n    const buyKanunPackBtn = document.getElementById('buy-kanun-pack-btn');"
);

// 2. Add volume control update
content = content.replace(/if \(window\.kavalNotes\) \{\s*for \(let k in window\.kavalNotes\) window\.kavalNotes\[k\]\.volume\(1\.0 \* scale\);\s*\}/g,
    "if (window.kavalNotes) { for (let k in window.kavalNotes) window.kavalNotes[k].volume(1.0 * scale); }\n            if (window.kanunNotes) { for (let k in window.kanunNotes) window.kanunNotes[k].volume(1.0 * scale); }"
);

// 3. Add to store menu switch
content = content.replace(/if \(buyFlutPackBtn\) \{[\s\S]*?if \(window\.announceToScreenReader\)/,
    match => {
        let replacement = match.replace(/if \(window\.announceToScreenReader\)/,
`
            if (buyKanunPackBtn) {
                let ownsKanun = localStorage.getItem('hafizaGuvenKanunPack') === 'true';
                if (ownsKanun) {
                    let isActive = localStorage.getItem('hafizaGuvenInstrument') === 'kanun';
                    buyKanunPackBtn.innerText = isActive ? "Kanun Ses Paketini Kapat" : "Kanun Ses Paketini EtkinleÅŸtir";
                    buyKanunPackBtn.setAttribute('aria-label', "Kanun Ses Paketi. " + (isActive ? "Kapatmak" : "EtkinleÅŸtirmek") + " iÃ§in tÄ±klayÄ±n.");
                } else {
                    buyKanunPackBtn.innerText = "Kanun Ses Paketi SatÄ±n Al (300 Jeton)";
                    buyKanunPackBtn.setAttribute('aria-label', "Kanun Ses Paketi. NotalarÄ± piyano yerine kanun ile duyarsÄ±nÄ±z. KalÄ±cÄ± olarak sahip olursunuz. Fiyat: 300 Jeton.");
                }
            }
            
            if (window.announceToScreenReader)`
        );
        return replacement;
    }
);

// 4. Add the button click handler for kanun just before 'if (btnAchievementsMain && achievementsBackBtn)'
content = content.replace(/(\s*\/\/ Achievements\s*if \(btnAchievementsMain && achievementsBackBtn\))/,
    match => {
        return `
    if (buyKanunPackBtn) {
        buyKanunPackBtn.addEventListener('click', () => {
            let ownsKanun = localStorage.getItem('hafizaGuvenKanunPack') === 'true';
            
            if (ownsKanun) {
                let isActive = localStorage.getItem('hafizaGuvenInstrument') === 'kanun';
                if (isActive) {
                    let wasPlaying = (window.bgMusic && window.bgMusic.playing());
                    if (window.bgMusic) window.bgMusic.stop();
                    localStorage.setItem('hafizaGuvenInstrument', 'piano');
                    window.activeInstrument = 'piano';
                    if (wasPlaying && window.bgMusic) window.bgMusic.play();

                    buyKanunPackBtn.innerText = "Kanun Ses Paketini EtkinleÅŸtir";
                    buyKanunPackBtn.setAttribute('aria-label', "Kanun Ses Paketi. EtkinleÅŸtirmek iÃ§in tÄ±klayÄ±n.");
                    if (window.menuEnterSound) window.menuEnterSound.play();
                    if (window.announceToScreenReader) window.announceToScreenReader("Kanun ses paketi kapatÄ±ldÄ±. Tekrar piyano sesleri aktif.");
                } else {
                    let wasPlaying = (window.bgMusic && window.bgMusic.playing());
                    if (window.bgMusic) window.bgMusic.stop();
                    localStorage.setItem('hafizaGuvenInstrument', 'kanun');
                    window.activeInstrument = 'kanun';
                    if (wasPlaying && window.bgMusic) window.bgMusic.play();

                    buyKanunPackBtn.innerText = "Kanun Ses Paketini Kapat";
                    buyKanunPackBtn.setAttribute('aria-label', "Kanun Ses Paketi. Kapatmak iÃ§in tÄ±klayÄ±n.");
                    if (window.menuEnterSound) window.menuEnterSound.play();
                    if (window.announceToScreenReader) window.announceToScreenReader("Kanun ses paketi etkinleÅŸtirildi!");
                    
                    if (buyBaglamaPackBtn && localStorage.getItem('hafizaGuvenBaglamaPack') === 'true') {
                        buyBaglamaPackBtn.innerText = "BaÄŸlama Ses Paketini EtkinleÅŸtir";
                        buyBaglamaPackBtn.setAttribute('aria-label', "BaÄŸlama Ses Paketi. EtkinleÅŸtirmek iÃ§in tÄ±klayÄ±n.");
                    }
                    if (buyKavalPackBtn && localStorage.getItem('hafizaGuvenKavalPack') === 'true') {
                        buyKavalPackBtn.innerText = "Kaval Ses Paketini EtkinleÅŸtir";
                        buyKavalPackBtn.setAttribute('aria-label', "Kaval Ses Paketi. EtkinleÅŸtirmek iÃ§in tÄ±klayÄ±n.");
                    }
                    if (buyFlutPackBtn && localStorage.getItem('hafizaGuvenFlutPack') === 'true') {
                        buyFlutPackBtn.innerText = "FlÃ¼t Ses Paketini EtkinleÅŸtir";
                        buyFlutPackBtn.setAttribute('aria-label', "FlÃ¼t Ses Paketi. EtkinleÅŸtirmek iÃ§in tÄ±klayÄ±n.");
                    }
                }
            } else {
                let totalTokens = parseInt(localStorage.getItem('hafizaGuvenTotalTokens')) || 0;
                if (totalTokens < 300) {
                    if (window.wrongSound) window.wrongSound.play();
                    let msg = "Yetersiz bakiye. Bu eÅŸya iÃ§in 300 jetona ihtiyacÄ±nÄ±z var.";
                    if (window.announceToScreenReader) window.announceToScreenReader(msg);
                    return;
                }
                
                totalTokens -= 300;
                localStorage.setItem('hafizaGuvenTotalTokens', totalTokens);
                localStorage.setItem('hafizaGuvenKanunPack', 'true');
                localStorage.setItem('hafizaGuvenInstrument', 'kanun');
                window.activeInstrument = 'kanun';
                
                buyKanunPackBtn.innerText = "Kanun Ses Paketini Kapat";
                buyKanunPackBtn.setAttribute('aria-label', "Kanun Ses Paketi. Kapatmak iÃ§in tÄ±klayÄ±n.");
                
                if (window.buySound) window.buySound.play();
                if (window.announceToScreenReader) window.announceToScreenReader(\`SatÄ±n alma baÅŸarÄ±lÄ±! Kanun ses paketi eklendi ve aktif edildi. Kalan jeton: \${totalTokens}\`);
                
                if (buyBaglamaPackBtn && localStorage.getItem('hafizaGuvenBaglamaPack') === 'true') {
                    buyBaglamaPackBtn.innerText = "BaÄŸlama Ses Paketini EtkinleÅŸtir";
                    buyBaglamaPackBtn.setAttribute('aria-label', "BaÄŸlama Ses Paketi. EtkinleÅŸtirmek iÃ§in tÄ±klayÄ±n.");
                }
                if (buyKavalPackBtn && localStorage.getItem('hafizaGuvenKavalPack') === 'true') {
                    buyKavalPackBtn.innerText = "Kaval Ses Paketini EtkinleÅŸtir";
                    buyKavalPackBtn.setAttribute('aria-label', "Kaval Ses Paketi. EtkinleÅŸtirmek iÃ§in tÄ±klayÄ±n.");
                }
                if (buyFlutPackBtn && localStorage.getItem('hafizaGuvenFlutPack') === 'true') {
                    buyFlutPackBtn.innerText = "FlÃ¼t Ses Paketini EtkinleÅŸtir";
                    buyFlutPackBtn.setAttribute('aria-label', "FlÃ¼t Ses Paketi. EtkinleÅŸtirmek iÃ§in tÄ±klayÄ±n.");
                }
            }
        });
    }
` + match;
    }
);

// 5. Inject kanun resets in existing instrument packs
content = content.replace(/if \(buyFlutPackBtn && localStorage\.getItem\('hafizaGuvenFlutPack'\) === 'true'\) \{[\s\S]*?buyFlutPackBtn\.setAttribute\('aria-label', "FlÃ¼t Ses Paketi\. EtkinleÅŸtirmek iÃ§in tÄ±klayÄ±n\."\);\s*\}/g,
    match => {
        return match + `
                    if (buyKanunPackBtn && localStorage.getItem('hafizaGuvenKanunPack') === 'true') {
                        buyKanunPackBtn.innerText = "Kanun Ses Paketini EtkinleÅŸtir";
                        buyKanunPackBtn.setAttribute('aria-label', "Kanun Ses Paketi. EtkinleÅŸtirmek iÃ§in tÄ±klayÄ±n.");
                    }`;
    }
);

fs.writeFileSync('c:/Users/Umit Ekrem Mikyas/Downloads/hafÄ±zana gÃ¼ven/js/ui.js', content, 'utf8');
console.log('Patched js/ui.js');
