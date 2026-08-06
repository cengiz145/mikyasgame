document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('stone-container');
    const modal = document.getElementById('word-modal');
    const modalEn = document.getElementById('modal-en');
    const modalTr = document.getElementById('modal-tr');
    
    const btnLearned = document.getElementById('btn-learned');
    const btnConfused = document.getElementById('btn-confused');
    const btnExample = document.getElementById('btn-example');
    const quitBtn = document.getElementById('modal-quit-btn');
    
    const exampleContainer = document.getElementById('example-container');
    const exampleEn = document.getElementById('example-en');
    const exampleTr = document.getElementById('example-tr');
    
    // Sınav DOM Elemanları
    const examContainer = document.getElementById('exam-container');
    const examTitle = document.getElementById('exam-title');
    const examQuestionBox = document.getElementById('exam-question-box');
    const examWord = document.getElementById('exam-word');
    const examOptionsContainer = document.getElementById('exam-options');
    const stoneContainer = document.getElementById('stone-container');
    const gameIntro = document.getElementById('game-intro');

    const announcer = document.getElementById('sr-announcer');
    const floorDisplay = document.getElementById('floor-display');
    
    const gameOverScreen = document.getElementById('game-over-screen');
    const gameOverStats = document.getElementById('game-over-stats');

    let stones = [];
    let currentFocusIndex = -1;
    let lastActiveStone = null;
    
    let currentFloor = 1;
    const MAX_FLOORS = 120;
    const STONES_PER_FLOOR = 5;
    
    let wordsFoundOnFloor = 0;
    let totalWordsFound = 0;

    // Akıllı Öğrenme Sistemi
    let activePool = [];
    let learnedWords = JSON.parse(localStorage.getItem('wh_learned_words')) || [];
    let wordErrors = JSON.parse(localStorage.getItem('wh_word_errors')) || {};
    let currentActiveWord = null;
    let currentFloorWords = [];
    
    // Sınav State
    let examQuestions = [];
    let currentExamIndex = 0;
    let currentExamOptions = [];
    let examNumOptions = 4;

    // Başlangıçta havuzu oluştur
    function buildActivePool() {
        activePool = wordList.filter(word => !learnedWords.includes(word.en));
        // Eğer tüm kelimeleri öğrendiyse, havuzu sıfırla (tekrar oynamak için)
        if (activePool.length < STONES_PER_FLOOR) {
            announce("Tebrikler! Tüm kelimeleri öğrendiniz. Havuz sıfırlanıyor...");
            learnedWords = [];
            localStorage.setItem('wh_learned_words', JSON.stringify(learnedWords));
            activePool = [...wordList];
        }
    }

    // Ses Efektleri
    function playBreakSound() {
        // Gelecekte eklenebilir
    }

    function announce(message) {
        announcer.textContent = message;
        setTimeout(() => { announcer.textContent = ''; }, 3000);
    }

    async function playTTS(text, lang = "en") {
        const apiKey = "AIzaSyAMgbeG7kuhowlmPKh2nsgm_vYzL6lpgHs";
        const cacheKey = `wh_tts_${lang}_${text.toLowerCase().replace(/[^a-z0-9ğüşöçİI]/g, '')}`;
        
        let voiceParams = { languageCode: "en-US", name: "en-US-Journey-F" };
        if (lang === "tr") {
            voiceParams = { languageCode: "tr-TR", name: "tr-TR-Wavenet-A" };
        }

        try {
            const cachedAudio = localStorage.getItem(cacheKey);
            if (cachedAudio) {
                const ttsAudio = new Audio("data:audio/mp3;base64," + cachedAudio);
                ttsAudio.play().catch(e => { /* Ignore */ });
                return;
            }
        } catch (e) { console.log(e); }

        try {
            const response = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    input: { text: text },
                    voice: voiceParams,
                    audioConfig: { audioEncoding: "MP3" }
                })
            });

            if (!response.ok) {
                throw new Error("Google TTS API Hatası");
            }

            const data = await response.json();
            
            try {
                localStorage.setItem(cacheKey, data.audioContent);
            } catch (e) {
                console.warn("Storage full, not caching TTS.");
            }

            const ttsAudio = new Audio("data:audio/mp3;base64," + data.audioContent);
            ttsAudio.play().catch(e => { /* Ignore */ });
            
        } catch (error) {
            console.error("Google TTS çalışmadı, tarayıcı sesine geçiliyor:", error);
            const fallbackVoice = new SpeechSynthesisUtterance(text);
            fallbackVoice.lang = lang === "tr" ? 'tr-TR' : 'en-US';
            fallbackVoice.rate = 1.0;
            window.speechSynthesis.speak(fallbackVoice);
        }
    }

    async function handleExampleSentence() {
        if (!currentActiveWord) return;
        
        const wordEn = currentActiveWord.en;
        const cacheKey = 'wh_sentence_' + wordEn.toLowerCase().replace(/[^a-z0-9]/g, '');
        
        exampleContainer.style.display = 'block';
        exampleEn.textContent = "Örnek cümle aranıyor...";
        exampleTr.textContent = "";
        announce("Örnek cümle aranıyor, lütfen bekleyin...");

        let result = null;

        try {
            const cached = localStorage.getItem(cacheKey);
            if (cached) {
                result = JSON.parse(cached);
            }
        } catch(e){}

        if (!result) {
            try {
                // Free Dictionary API
                const dictRes = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(wordEn)}`);
                if (!dictRes.ok) throw new Error("Not found");
                const data = await dictRes.json();
                
                let sentenceEn = "";
                outerLoop: for(let meaning of data[0].meanings) {
                    for(let def of meaning.definitions) {
                        if(def.example) {
                            sentenceEn = def.example;
                            break outerLoop;
                        }
                    }
                }
                if(!sentenceEn) {
                    sentenceEn = `This is a sentence with the word ${wordEn}.`;
                }

                // Free Translation API (MyMemory)
                const trRes = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(sentenceEn)}&langpair=en|tr`);
                const trData = await trRes.json();
                const sentenceTr = trData.responseData.translatedText;

                result = { en: sentenceEn, tr: sentenceTr };
                localStorage.setItem(cacheKey, JSON.stringify(result));

            } catch(e) {
                console.error(e);
                result = { en: `This is a sentence with the word ${wordEn}.`, tr: `Bu, ${wordEn} kelimesini içeren bir cümledir.` };
            }
        }

        exampleEn.textContent = result.en;
        exampleTr.textContent = result.tr;
        
        announce(`Örnek cümle bulundu: ${result.en}. Anlamı: ${result.tr}`);
        
        setTimeout(() => {
            playTTS(result.en, "en");
            exampleEn.focus();
        }, 800);
    }

    // Etkileşimli Dinleme Olayları
    modalEn.addEventListener('click', () => {
        if (currentActiveWord) playTTS(currentActiveWord.en, "en");
    });
    modalEn.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            if (currentActiveWord) playTTS(currentActiveWord.en, "en");
        }
    });

    modalTr.addEventListener('click', () => {
        if (currentActiveWord) playTTS(currentActiveWord.tr, "tr");
    });
    modalTr.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            if (currentActiveWord) playTTS(currentActiveWord.tr, "tr");
        }
    });

    // Örnek Cümle Olayları
    btnExample.addEventListener('click', handleExampleSentence);
    btnExample.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleExampleSentence();
        }
    });

    exampleEn.addEventListener('click', () => {
        if (exampleEn.textContent && exampleEn.textContent !== "Örnek cümle aranıyor...") playTTS(exampleEn.textContent, "en");
    });
    exampleEn.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            if (exampleEn.textContent && exampleEn.textContent !== "Örnek cümle aranıyor...") playTTS(exampleEn.textContent, "en");
        }
    });

    exampleTr.addEventListener('click', () => {
        if (exampleTr.textContent) playTTS(exampleTr.textContent, "tr");
    });
    exampleTr.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            if (exampleTr.textContent) playTTS(exampleTr.textContent, "tr");
        }
    });

    // Rastgele kelimeler seç (Akıllı Ağırlıklı Sistem)
    function pickRandomWords(count, pool) {
        if (!pool) pool = activePool;
        let picked = [];
        let available = [...pool];
        
        for(let i=0; i<count; i++) {
            if(available.length === 0) break;
            
            // Toplam ağırlığı hesapla
            let totalWeight = 0;
            let weights = available.map(word => {
                let w = 1 + (wordErrors[word.en] || 0) * 3; // Hata çarpanı
                totalWeight += w;
                return w;
            });
            
            let r = Math.random() * totalWeight;
            let cumulative = 0;
            let selectedIndex = 0;
            for(let j=0; j<weights.length; j++) {
                cumulative += weights[j];
                if(r <= cumulative) {
                    selectedIndex = j;
                    break;
                }
            }
            
            picked.push(available[selectedIndex]);
            available.splice(selectedIndex, 1); // Aynı katta aynı kelime çıkmasın
        }
        return picked;
    }

    // Taşları Oluştur
    function generateFloor() {
        container.innerHTML = '';
        stones = [];
        wordsFoundOnFloor = 0;
        
        floorDisplay.textContent = `Maden Katı: ${currentFloor} / 120`;
        announce(`${currentFloor}. kata ulaştınız.`);

        const bossFloors = [15, 30, 60, 120];
        if (bossFloors.includes(currentFloor)) {
            stoneContainer.style.display = 'none';
            gameIntro.style.display = 'none';
            startExam();
            return;
        } else {
            stoneContainer.style.display = 'flex';
            gameIntro.style.display = 'block';
            examContainer.style.display = 'none';
        }

        currentFloorWords = pickRandomWords(STONES_PER_FLOOR);
        
        // %30 ihtimalle Hatırlatma Taşı (Leitner Sistemi)
        let reviewIndex = -1;
        if (learnedWords.length > 0 && Math.random() < 0.3) {
            reviewIndex = Math.floor(Math.random() * currentFloorWords.length);
            const randomLearnedEn = learnedWords[Math.floor(Math.random() * learnedWords.length)];
            const fullWord = wordList.find(w => w.en === randomLearnedEn);
            if (fullWord) {
                currentFloorWords[reviewIndex] = { ...fullWord, isReview: true };
            }
        }

        currentFloorWords.forEach((wordObj, index) => {
            const stone = document.createElement('div');
            const requiredHits = Math.floor(Math.random() * 8) + 3; 

            stone.className = 'stone';
            stone.setAttribute('role', 'button');
            stone.setAttribute('tabindex', '0');
            stone.setAttribute('aria-label', `Taş ${index + 1}. Kazmaya başlamak için enter tuşuna basın.`);
            stone.textContent = "Taş";
            stone.dataset.index = index;
            stone.dataset.broken = "false";
            stone.dataset.hitsLeft = requiredHits;

            stone.addEventListener('click', () => hitStone(index, stone));
            
            stone.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    hitStone(index, stone);
                } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                    e.preventDefault();
                    moveFocus(index + 1);
                } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                    e.preventDefault();
                    moveFocus(index - 1);
                }
            });

            stones.push(stone);
            container.appendChild(stone);
        });
        
        if(stones.length > 0) {
            setTimeout(() => stones[0].focus(), 100);
        }
    }

    // Harf/Ses benzerliği hesaplama (Levenshtein)
    function levenshtein(a, b) {
        a = a.toLowerCase();
        b = b.toLowerCase();
        if(a.length === 0) return b.length;
        if(b.length === 0) return a.length;
        let matrix = [];
        for(let i = 0; i <= b.length; i++){ matrix[i] = [i]; }
        for(let j = 0; j <= a.length; j++){ matrix[0][j] = j; }
        for(let i = 1; i <= b.length; i++){
            for(let j = 1; j <= a.length; j++){
                if(b.charAt(i-1) == a.charAt(j-1)){
                    matrix[i][j] = matrix[i-1][j-1];
                } else {
                    matrix[i][j] = Math.min(matrix[i-1][j-1] + 1, Math.min(matrix[i][j-1] + 1, matrix[i-1][j] + 1));
                }
            }
        }
        return matrix[b.length][a.length];
    }

    // --- Sınav (Boss Level) Mantığı ---
    function startExam() {
        examContainer.style.display = 'flex';
        examQuestions = [];
        currentExamIndex = 0;
        examNumOptions = 4; // Her zaman 4 şık olacak
        
        let availableLearned = wordList.filter(w => learnedWords.includes(w.en));
        
        if (currentFloor === 15) {
            availableLearned.sort(() => Math.random() - 0.5);
        } else if (currentFloor === 30) {
            availableLearned.sort((a, b) => {
                let errA = wordErrors[a.en] || 0;
                let errB = wordErrors[b.en] || 0;
                if (errA > 0 && errB === 0) return -1;
                if (errB > 0 && errA === 0) return 1;
                return Math.random() - 0.5;
            });
        } else if (currentFloor === 60) {
            availableLearned.sort((a, b) => (wordErrors[b.en] || 0) - (wordErrors[a.en] || 0));
        } else if (currentFloor === 120) {
            let allWordsSorted = [...wordList].sort((a, b) => (wordErrors[b.en] || 0) - (wordErrors[a.en] || 0));
            availableLearned = allWordsSorted;
        }
        
        for (let i = 0; i < 5; i++) {
            if (i < availableLearned.length) {
                examQuestions.push(availableLearned[i]);
            } else {
                let r = Math.floor(Math.random() * wordList.length);
                examQuestions.push(wordList[r]);
            }
        }
        
        loadExamQuestion();
    }

    function loadExamQuestion() {
        if (currentExamIndex >= 5) {
            announce(`Sınavı tamamladınız! Harika iş çıkardınız. Sonraki kata geçiliyor...`);
            setTimeout(() => {
                currentFloor++;
                generateFloor();
            }, 3000);
            return;
        }

        const qWord = examQuestions[currentExamIndex];
        examTitle.textContent = `Sınav Katı: Soru ${currentExamIndex + 1} / 5`;
        examWord.textContent = qWord.en;
        examQuestionBox.setAttribute('aria-label', `İngilizce kelime: ${qWord.en}. Kendi sesinle okumak veya harflerini incelemek için buradasın. Orijinal telaffuzu tekrar dinlemek için enter'a bas.`);
        
        currentExamOptions = [qWord];
        let poolForDistractors = wordList.filter(w => w.en !== qWord.en);
        
        if (currentFloor < 30) {
            // 15. Kat: Tamamen rastgele çeldiriciler
            poolForDistractors.sort(() => Math.random() - 0.5);
            currentExamOptions.push(...poolForDistractors.slice(0, 3));
        } else if (currentFloor < 60) {
            // 30. Kat: Uzunlukları benzer kelimeler arasından rastgele
            let similarLength = poolForDistractors.filter(w => Math.abs(w.en.length - qWord.en.length) <= 1);
            if (similarLength.length < 3) similarLength = poolForDistractors;
            similarLength.sort(() => Math.random() - 0.5);
            currentExamOptions.push(...similarLength.slice(0, 3));
        } else if (currentFloor < 120) {
            // 60. Kat: En çok benzeyen ilk 15 kelime arasından rastgele 3 tanesi
            poolForDistractors.sort((a, b) => levenshtein(qWord.en, a.en) - levenshtein(qWord.en, b.en));
            let top15 = poolForDistractors.slice(0, 15);
            top15.sort(() => Math.random() - 0.5);
            currentExamOptions.push(...top15.slice(0, 3));
        } else {
            // 120. Kat: Kesinlikle okunuşu/yazılışı EN ÇOK benzeyen ilk 3 kelime!
            poolForDistractors.sort((a, b) => levenshtein(qWord.en, a.en) - levenshtein(qWord.en, b.en));
            currentExamOptions.push(...poolForDistractors.slice(0, 3));
        }
        
        currentExamOptions.sort(() => Math.random() - 0.5);
        
        examOptionsContainer.innerHTML = '';
        const labels = ['A', 'B', 'C', 'D'];
        
        currentExamOptions.forEach((opt, index) => {
            const btn = document.createElement('button');
            btn.className = 'exam-option-btn close-btn';
            btn.style.cssText = 'background-color: #2a9d8f; font-size: 1.5rem; padding: 20px;';
            btn.textContent = `${labels[index]}) ${opt.tr}`;
            btn.setAttribute('tabindex', '0');
            
            btn.addEventListener('click', () => handleExamAnswer(index));
            btn.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleExamAnswer(index);
                }
            });
            
            examOptionsContainer.appendChild(btn);
        });
        
        announce(`Soru ${currentExamIndex + 1}. İngilizce kelime: ${qWord.en}. Anlamı nedir?`);
        examTitle.focus();
        
        setTimeout(() => {
            playTTS(qWord.en, "en");
        }, 800);
    }

    examQuestionBox.addEventListener('click', () => {
        if (examWord.textContent) playTTS(examWord.textContent, "en");
    });
    examQuestionBox.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            if (examWord.textContent) playTTS(examWord.textContent, "en");
        }
    });

    function handleExamAnswer(selectedIndex) {
        const qWord = examQuestions[currentExamIndex];
        const selectedWord = currentExamOptions[selectedIndex];
        
        if (selectedWord.en === qWord.en) {
            playBreakSound();
            // Hatayı sıfırla
            if (wordErrors[qWord.en]) {
                delete wordErrors[qWord.en];
                localStorage.setItem('wh_word_errors', JSON.stringify(wordErrors));
            }
            announce("Doğru cevap! Harikasın.");
        } else {
            // Yanlış cevap cezası
            learnedWords = learnedWords.filter(en => en !== qWord.en);
            localStorage.setItem('wh_learned_words', JSON.stringify(learnedWords));
            
            // Sınav hatası daha ağır cezalandırılır (+2 ağırlık)
            wordErrors[qWord.en] = (wordErrors[qWord.en] || 0) + 2;
            localStorage.setItem('wh_word_errors', JSON.stringify(wordErrors));
            
            // activePool'da yoksa geri ekle
            const inPool = activePool.find(w => w.en === qWord.en);
            if (!inPool) {
                const fullWord = wordList.find(w => w.en === qWord.en);
                if (fullWord) activePool.push(fullWord);
            }
            
            announce(`Yanlış! Doğru cevap: ${qWord.tr}. Bu kelimeyi unuttuğun için havuza geri eklendi.`);
        }
        
        // Şıkları kilitle, 2 saniye sonra yeni soru
        const allBtns = document.querySelectorAll('.exam-option-btn');
        allBtns.forEach(b => b.disabled = true);
        setTimeout(() => {
            allBtns.forEach(b => b.disabled = false);
            currentExamIndex++;
            loadExamQuestion();
        }, 2500);
    }

    // --- Sınav Mantığı Sonu ---

    function moveFocus(newIndex) {
        if (newIndex >= 0 && newIndex < stones.length) {
            stones[newIndex].focus();
        }
    }

    function hitStone(index, stoneElement) {
        if (stoneElement.dataset.broken === "true") {
            announce("Bu taş zaten kırılmış. İçi boş.");
            return;
        }

        let hitsLeft = parseInt(stoneElement.dataset.hitsLeft);
        hitsLeft--;
        stoneElement.dataset.hitsLeft = hitsLeft;

        if (hitsLeft > 0) {
            announce("Kazılıyor...");
            stoneElement.style.transform = "scale(0.9)";
            setTimeout(() => { stoneElement.style.transform = "scale(1)"; }, 100);
            return;
        }

        stoneElement.dataset.broken = "true";
        stoneElement.classList.add('broken');
        stoneElement.setAttribute('aria-label', `Kırık taş ${index + 1}.`);
        stoneElement.textContent = "Kırık";
        lastActiveStone = stoneElement;

        playBreakSound();
        wordsFoundOnFloor++;
        totalWordsFound++;

        currentActiveWord = currentFloorWords[index];
        modalEn.textContent = currentActiveWord.en;
        modalTr.textContent = ""; 
        
        if (currentActiveWord.isReview) {
            announce(`Hatırlatma Taşı! Bu kelimeyi daha önce öğrenmiştiniz. Hala hatırlıyor musunuz? Kelime: ${currentActiveWord.en}. Anlamı: ${currentActiveWord.tr}.`);
            document.getElementById('main-title').textContent = "Hatırlatma Taşı!";
        } else {
            announce(`Taş kırıldı! Yeni Kelime: ${currentActiveWord.en}. Anlamı: ${currentActiveWord.tr}. Bu kelimeyi öğrendiniz mi, yoksa karıştırıyor musunuz?`);
            document.getElementById('main-title').textContent = "Kelime Bulundu!";
        }
        
        setTimeout(() => {
            modalTr.textContent = currentActiveWord.tr;
        }, 1000);

        modal.classList.add('active');
        modal.setAttribute('aria-hidden', 'false');
        
        setTimeout(() => {
            btnLearned.focus();
        }, 100);
    }

    function processWordDecision(isLearned) {
        if (isLearned) {
            if (!learnedWords.includes(currentActiveWord.en)) {
                learnedWords.push(currentActiveWord.en);
                localStorage.setItem('wh_learned_words', JSON.stringify(learnedWords));
            }
            // Kelimeyi havuzdan çıkar
            activePool = activePool.filter(w => w.en !== currentActiveWord.en);
            
            // Eğer isReview ise hatasını sıfırla/azalt
            if (wordErrors[currentActiveWord.en]) {
                delete wordErrors[currentActiveWord.en];
                localStorage.setItem('wh_word_errors', JSON.stringify(wordErrors));
            }
            
            announce("Harika! Bu kelimeyi öğrendikleriniz arasına ekledim.");
        } else {
            // Hata algoritması: Hata sayısını artır
            wordErrors[currentActiveWord.en] = (wordErrors[currentActiveWord.en] || 0) + 1;
            localStorage.setItem('wh_word_errors', JSON.stringify(wordErrors));
            
            // Öğrenilenlerden geri düştüyse havuza at
            if (learnedWords.includes(currentActiveWord.en)) {
                learnedWords = learnedWords.filter(w => w !== currentActiveWord.en);
                localStorage.setItem('wh_learned_words', JSON.stringify(learnedWords));
                
                const fullWord = wordList.find(w => w.en === currentActiveWord.en);
                if (fullWord) activePool.push(fullWord);
            }
            
            announce("Sorun değil, bu kelimeyi daha sonra tekrar karşına çıkaracağım.");
        }
        
        closeModalAndCheckFloor();
    }

    function closeModalAndCheckFloor() {
        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');
        currentActiveWord = null;
        exampleContainer.style.display = 'none';
        exampleEn.textContent = '';
        exampleTr.textContent = '';
        
        if (wordsFoundOnFloor >= STONES_PER_FLOOR) {
            if (currentFloor < MAX_FLOORS) {
                currentFloor++;
                announce(`Kattaki tüm kelimeleri buldunuz. ${currentFloor}. kata iniliyor...`);
                setTimeout(() => {
                    initStones();
                }, 1500);
            } else {
                endGame(true);
            }
        } else {
            if (lastActiveStone) {
                lastActiveStone.focus();
                // announce("Taş alanına geri dönüldü.");
            }
        }
    }

    function endGame(isVictory = false) {
        modal.classList.remove('active');
        container.style.display = 'none';
        floorDisplay.style.display = 'none';
        
        document.getElementById('main-title').style.display = 'none';
        
        gameOverScreen.classList.remove('sr-only');
        gameOverScreen.style.position = 'relative';
        
        let msg = `Oyundan çıktınız. Toplam ${currentFloor} kat indiniz ve ${totalWordsFound} kelime keşfettiniz! (Tamamen öğrendiğiniz kelime sayısı: ${learnedWords.length})`;
        if(isVictory) {
            msg = `TEBRİKLER! Tüm 120 katı tamamladınız. Öğrendiğiniz kelime sayısı: ${learnedWords.length}`;
            document.querySelector('#game-over-screen h2').textContent = "Tebrikler!";
        }
        
        gameOverStats.textContent = msg;
        announce(msg);
        
        setTimeout(() => {
            document.querySelector('#game-over-screen button').focus();
        }, 500);
    }

    btnLearned.addEventListener('click', () => processWordDecision(true));
    btnConfused.addEventListener('click', () => processWordDecision(false));
    quitBtn.addEventListener('click', () => endGame(false));

    [btnLearned, btnConfused, quitBtn].forEach(btn => {
        btn.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                processWordDecision(false); // Varsayılan olarak karıştırıyorum de ve çık
            }
        });
    });

    generateFloor();
});
