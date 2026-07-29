// announcer.js
// Grme engelliler iin optimize edilmi 0 Hata (Zero-Crash) Spiker Yapay Zekas

// Global speak fonksiyonu (Görme engelliler için erişilebilirlik garantili)
if (typeof window.speechEnabled === 'undefined') {
    window.speechEnabled = true;
}

// [YENİ] Spiker Yapay Zeka Çipi (Donanım Yükseltmesi)
function processAICommentary(text) {
    // Maçta mıyız kontrolü
    if (typeof window.matchMinute === 'undefined' || window.matchMinute === null || window.matchMinute === 0) {
        return text; // Maçta değilsek normal metni oku
    }
    
    let minute = window.matchMinute;
    let pScore = window.playerScore || 0;
    let eScore = window.enemyScore || 0;
    
    let isGoal = text.includes("GOOOOL") || text.includes("top ağlarımızda") || text.includes("golü buldu");
    let isMiss = text.includes("dışarı çıktı") || text.includes("auta çıktı") || text.includes("direkten döndü");
    
    let aiCommentary = "";

    if (isGoal) {
        let isPlayerGoal = text.includes("GOOOOL") && !text.includes("top ağlarımızda") && !text.includes("golü buldu");
        let isEnemyGoal = text.includes("top ağlarımızda") || text.includes("golü buldu");
        
        // Skor bağlamı
        if (pScore === eScore) {
            aiCommentary += " Ve maça denge geldi! Gerçekten inanılmaz bir mücadele! ";
        } else if (Math.abs(pScore - eScore) >= 3) {
            aiCommentary += " Fark giderek açılıyor, sahada adeta tek taraflı bir resital var! ";
        } else if (Math.abs(pScore - eScore) === 1 && minute > 75) {
            aiCommentary += " Son anlara girilirken gelen bu gol, skoru çok kritik bir noktaya taşıdı! ";
        }
        
        // Dakika bağlamı (Son dakika golleri)
        if (minute >= 88) {
            aiCommentary += " Doksanıncı dakika! Kalpler duracak gibi! Bu anı unutmak mümkün değil! ";
        }
    } else if (isMiss && minute > 85 && pScore === eScore) {
        aiCommentary += " Son anlarda böyle bir gol kaçar mı? Taraftar saç baş yoluyor! ";
    }
    
    return aiCommentary + text; // Önce yorum, sonra asıl maç metni
}


window.speechQueue = [];
window.isSpeakingNow = false;
window.activeUtterance = null; // GC Bug fix

window.speak = function(text, priority = false) {
    if (!text) return;
    text = processAICommentary(text);

    try {
        const uiText = document.getElementById('announcer-text');
        if (uiText) uiText.textContent = text;
        const liveRegion = document.getElementById('live-announcer');
        if (liveRegion) liveRegion.textContent = text;

        if (window.speechEnabled && 'speechSynthesis' in window) { 
            if(priority) {
                window.speechSynthesis.cancel(); 
                window.speechQueue = [];
                window.isSpeakingNow = false;
            }
            
            // Text Chunking (Uzun metinlerde Chrome Spikerinin susmasını/bozulmasını engeller)
            const chunks = text.match(/[^.!?]+[.!?]+/g) || [text];
            chunks.forEach(chunk => {
                if (chunk.trim()) window.speechQueue.push(chunk.trim());
            });
            
            processSpeechQueue();
        }
    } catch (e) {
        console.error("Spiker motorunda hata:", e);
    }
};

function processSpeechQueue() {
    if (window.isSpeakingNow || window.speechQueue.length === 0) return;
    
    let nextText = window.speechQueue.shift();
    window.isSpeakingNow = true;
    
    let utterance = new SpeechSynthesisUtterance(nextText); 
    window.activeUtterance = utterance; // GC referans kaybetme hatasını önlemek için globale alıyoruz
    utterance.lang = 'tr-TR'; 
    utterance.rate = 1.1; 
    let voices = window.speechSynthesis.getVoices(); 
    let trVoice = voices.find(v => v.lang === 'tr-TR'); 
    if(trVoice) utterance.voice = trVoice; 
    
    utterance.onend = function() {
        window.isSpeakingNow = false;
        processSpeechQueue();
    };
    
    utterance.onerror = function() {
        window.isSpeakingNow = false;
        processSpeechQueue();
    };
    
    window.speechSynthesis.speak(utterance); 
}

// Spikerin Sahay� �zleyen Beyni
class AnnouncerBrain {
    constructor() {
        this.lastSpeakTime = 0;
        this.cooldown = 3500; // Her c�mleden sonra 3.5 saniye sus (throttle)
        this.memory = {
            lastPlayerWithBall: null,
            shotsMissed: 0,
            consecutivePasses: 0,
            lastEvent: null
        };
    }

    // Zamanlay�c� kontrol� (Spiker nefes als�n)
    canSpeak(override = false) {
        if (override) return true;
        const now = Date.now();
        if (now - this.lastSpeakTime > this.cooldown) {
            return true;
        }
        return false;
    }

    setSpeakTime() {
        this.lastSpeakTime = Date.now();
    }

    // Saha taramas� (Her kareden de�il, saniyede birka� kez �a�r�labilir)
    watchPitch(activePlayer, ball, isHomeTeamAttack) {
        if (!activePlayer || !ball) return;
        if (!this.canSpeak(false)) return; // Sessizlik s�resi dolmad�ysa konu�ma

        const x = activePlayer.x;
        // Saha X: 0 (Ev Sahibi Kale), X: 800 (Deplasman Kale)
        
        let distanceToTargetGoal;
        if (isHomeTeamAttack) {
            distanceToTargetGoal = 800 - x;
        } else {
            distanceToTargetGoal = x - 0;
        }

        // Oyuncu topu yeni ald�ysa
        if (this.memory.lastPlayerWithBall !== activePlayer.name) {
            this.memory.lastPlayerWithBall = activePlayer.name;
            
            // E�er kaleye �ok yak�nsa heyecanl� anons yap
            if (distanceToTargetGoal < 200) {
                window.speak(`${activePlayer.name} ceza sahas� yak�nlar�nda topla bulu�tu! Tehlikeli b�lge!`, true);
                this.setSpeakTime();
                return;
            } else if (distanceToTargetGoal > 600) {
                // Kendi yar sahasnda
                window.speak(`${activePlayer.name} kendi yar alanndan topla kyor.`);
                this.setSpeakTime();
                return;
            } else {
                // Orta sahada
                window.speak(`Top şimdi ${activePlayer.name} isimli oyuncuda.`);
                this.setSpeakTime();
                return;
            }
        }
    }

    onInjury(player, severity, injuryName) {
        this.memory.consecutivePasses = 0;
        if (severity === 3) {
            window.speak(`Eyvah eyvah! Stadyumda inanılmaz bir sessizlik var. Çok kötü bir kırılma sesi geldi! ${player.name} acı içinde kıvranıyor!`, true);
        } else if (severity === 2) {
            window.speak(`Aman Allah'ım, ${player.name}'in dizi çok kötü döndü! Sağlık görevlileri hemen sahaya giriyor!`, true);
        } else {
            window.speak(`Sert bir müdahale, ${player.name} için ufak bir zedelenme gibi duruyor.`, true);
        }
        this.setSpeakTime();
    }

    // Özel Olaylar (Şut, Pas, Gol, Kafa)
    onPass(fromPlayer, toPlayer, distance) {
        this.memory.consecutivePasses++;
        if (distance > 300) {
            window.speak(`${fromPlayer.name}'den harika bir uzun top!`, true);
            this.setSpeakTime();
            return;
        }
        
        if (this.memory.consecutivePasses >= 4 && this.canSpeak()) {
            window.speak("Takım çok iyi organize oldu, üst üste seri ve isabetli paslar yapıyorlar!");
            this.setSpeakTime();
        } else if (this.canSpeak()) {
            window.speak(`${fromPlayer.name} pas verdi.`);
            this.setSpeakTime();
        }
    }

    onIntercept(interceptingPlayer) {
        this.memory.consecutivePasses = 0; // Pas serisi bozuldu
        if (this.canSpeak(true)) {
            window.speak(`Araya giren isim ${interceptingPlayer.name}! Savunmada çok kritik bir müdahale!`, true);
            this.setSpeakTime();
        }
    }

    onShot(shooter, distance, speed) {
        this.memory.consecutivePasses = 0;
        
        if (speed >= 25) {
            window.speak(`${shooter.name} inanılmaz sert vurdu! Korkunç bir füze!`, true);
        } else if (speed < 16) {
            window.speak(`${shooter.name} kaleyi gördü ama cılız bir vuruş geldi.`, true);
        } else if (distance > 300) {
            window.speak(`${shooter.name} çok uzaklardan kaleyi denedi! İnanılmaz cesur bir şut!`, true);
        } else {
            window.speak(`${shooter.name} kaleyi gördü ve çok sert vuruyor!`, true);
        }
        this.setSpeakTime();
    }

    onHeader(shooter, distance) {
        this.memory.consecutivePasses = 0;
        if (distance > 200) {
            window.speak(`${shooter.name} ceza sahası dışından inanılmaz bir kafa vuruşu deniyor!`, true);
        } else {
            window.speak(`${shooter.name} yükseldi ve kafa vuruşunu yaptı!`, true);
        }
        this.setSpeakTime();
    }

    onMiss(shooter) {
        this.memory.shotsMissed++;
        if (this.memory.shotsMissed > 2) {
            window.speak(`${shooter.name} bu ma�ta �anss�zl�k ya��yor, yine ka��rd�!`, true);
            this.memory.shotsMissed = 0; // S�f�rla
        } else {
            window.speak("Top az farkla d��ar� ��k�yor! Savunma derin bir nefes ald�.", true);
        }
        this.setSpeakTime();
    }
}

// Global beyin objesini olu�tur
window.announcerBrain = new AnnouncerBrain();

