// story.js - Hikaye Modu, Yürüme Mekanikleri ve Kayıp Notalar

window.inStoryMode = false;
window.currentStoryIndex = 0;
window.isGridWalkingPhase = false;
window.stepIntervalId = null;
window.currentAutoWalkStep = 0;

window.playerX = 1;
window.mapLength = 30;
window.pianoX = 0;
window.notesOnMap = {};
window.notesInPiano = [];
window.MAX_NOTES = 7;

window.playCurrentStoryDialog = function() {
    const storyStatus = document.getElementById('story-status-text');
    if (!storyStatus) return;

    if (!window.missingNotesDialogues || !window.missingNotesDialogues[window.currentStoryIndex]) return;

    let appendedText = window.missingNotesDialogues[window.currentStoryIndex];

    storyStatus.innerHTML = window.localizeText(appendedText.replace("Devam etmek için entıra basın.", "<strong>Devam etmek için entıra basın.</strong>"));
    if (window.announceToScreenReader) {
        window.announceToScreenReader(appendedText);
    }
};

window.playAutomatedWalkingScene = function() {
    if (!window.inStoryMode) return;

    if (window.currentAutoWalkStep < 6) {
        if (window.snowStepSounds && window.snowStepSounds.length > 0) {
            const randomStep = window.snowStepSounds[Math.floor(Math.random() * window.snowStepSounds.length)];
            randomStep.play();
        }
        window.currentAutoWalkStep++;

        const nextWalkDelay = Math.floor(Math.random() * 200) + 200;
        window.stepIntervalId = setTimeout(window.playAutomatedWalkingScene, nextWalkDelay);
    }
};

window.triggerStoryAnimations = function(index) {
    if (index === 0) {
        let count = 0;
        window.storyAnimInterval1 = setInterval(() => {
            const keys = ['c', 'e', 'g', 'c', 'f', 'a', 'd', 'b', 'g'];
            const randomKey = keys[Math.floor(Math.random() * keys.length)];
            if (window.pianoNotes && window.pianoNotes[randomKey]) {
                window.pianoNotes[randomKey].volume(0.8);
                let sndId = window.pianoNotes[randomKey].play();
                window.pianoNotes[randomKey].seek(0.045, sndId);
            }
            count++;
            if (count > 6) clearInterval(window.storyAnimInterval1);
        }, 400);
    } else if (index === 1) {
        if (window.enterHouseSound) window.enterHouseSound.play();
        window.storyAnimTimeout1 = setTimeout(() => {
            let stepCount = 0;
            window.storyAnimInterval2 = setInterval(() => {
                if (window.carpetStepSounds && window.carpetStepSounds.length > 0) {
                    let s = window.carpetStepSounds[Math.floor(Math.random() * window.carpetStepSounds.length)];
                    s.volume(Math.min(1.0, 0.2 + (stepCount * 0.2)));
                    s.play();
                }
                stepCount++;
                if (stepCount > 5) {
                    clearInterval(window.storyAnimInterval2);
                    window.storyAnimTimeout2 = setTimeout(() => { if (window.doorCloseSound) window.doorCloseSound.play(); }, 200);
                }
            }, 220);
        }, 350);
    } else if (index === 7) {
        if (window.storyBGM) window.storyBGM.play();
        if (window.glasshitSound) window.glasshitSound.play();
        if (window.wrongSound) {
            window.wrongSound.volume(1.0);
            window.wrongSound.play();
        }
    } else if (index === 8) {
        window.storyAnimTimeout3 = setTimeout(() => {
            if (window.pianoNotes) {
                if (window.pianoNotes['c']) window.pianoNotes['c'].play();
                if (window.pianoNotes['d']) window.pianoNotes['d'].play();
                if (window.pianoNotes['e']) window.pianoNotes['e'].play();
            }
        }, 50);
        window.storyAnimTimeout4 = setTimeout(() => {
            if (window.doorCloseSound) {
                let sid = window.doorCloseSound.play();
                window.doorCloseSound.rate(1.5, sid);
                window.doorCloseSound.volume(0.6, sid);
            }
        }, 200);
    } else if (index === 14) {
        let stepCount = 0;
        window.storyAnimInterval3 = setInterval(() => {
            if (window.carpetStepSounds && window.carpetStepSounds.length > 0) {
                let s = window.carpetStepSounds[Math.floor(Math.random() * window.carpetStepSounds.length)];
                s.volume(Math.max(0.1, 1.0 - (stepCount * 0.15)));     
                s.play();
            }
            stepCount++;
            if (stepCount > 6) clearInterval(window.storyAnimInterval3);
        }, 220);
        window.storyAnimTimeout5 = setTimeout(() => { if (window.doorCloseSound) window.doorCloseSound.play(); }, 1400); 
    }
};

window.initializeMissingNotesMap = function() {
    window.notesInPiano = [];
    const noteNames = ['c', 'd', 'e', 'f', 'g', 'a', 'b'];

    const availableX = [];
    for (let i = 1; i <= window.mapLength; i++) {
        availableX.push(i);
    }

    for (let i = availableX.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [availableX[i], availableX[j]] = [availableX[j], availableX[i]];
    }

    window.notesOnMap = {};
    for (let i = 0; i < noteNames.length; i++) {
        window.notesOnMap[availableX[i]] = noteNames[i];
    }

    window.playerX = availableX[7];

    if (window.announceToScreenReader) {
        window.announceToScreenReader(`Dışarıdasın. Kar üstünde rastgele bir noktaya ışınlandın. X konumun: ${window.playerX}. Piyanoya dönmek için X: 0 konumuna doğru yürümelisin. Etrafta rastgele yerleştirilmiş ${window.MAX_NOTES} adet nota var. Bir nota bulduğunda F tuşuna basarak onu alabilirsin. Tüm notaları sırasıyla (Do, Re, Mi, Fa, Sol, La, Si) piyanoya getirmelisin.`);
    }

    if (window.mountainSound) {
        window.mountainSound.volume(0.8);
        window.mountainSound.loop(true);
        window.mountainSound.play();
    }
};

window.handleStoryWalking = function(key) {
    if (!window.isGridWalkingPhase) return;

    if (key === 'ArrowRight') {
        if (window.playerX < window.mapLength) {
            window.playerX++;
            playRandomSnowStep();
            updateStoryStatus();
        } else {
            if (window.wrongSound) window.wrongSound.play();
            if (window.announceToScreenReader) window.announceToScreenReader("Haritanın sonundasın. Daha fazla sağa gidemezsin.");
        }
    } else if (key === 'ArrowLeft') {
        if (window.playerX > 0) {
            window.playerX--;
            playRandomSnowStep();
            updateStoryStatus();
        } else {
            if (window.wrongSound) window.wrongSound.play();
            if (window.announceToScreenReader) window.announceToScreenReader("Piyanodasın. Daha fazla sola gidemezsin.");
        }
    } else if (key.toLowerCase() === 'f') {
        if (window.playerX === window.pianoX) {
            if (window.notesInPiano.length === window.MAX_NOTES) {
                if (window.announceToScreenReader) window.announceToScreenReader("Piyano zaten tamamlandı.");
            } else {
                if (window.announceToScreenReader) window.announceToScreenReader(`Piyanodasın. Şu an piyanoda ${window.notesInPiano.length} nota var.`);
            }
        } else {
            if (window.notesOnMap[window.playerX]) {
                const foundNote = window.notesOnMap[window.playerX];
                if (window.notesInPiano.length === Object.keys(window.pianoNotes).indexOf(foundNote)) {
                    window.notesInPiano.push(foundNote);
                    delete window.notesOnMap[window.playerX];

                    if (window.correctSound) window.correctSound.play();
                    
                    const trNames = { 'c': 'Do', 'd': 'Re', 'e': 'Mi', 'f': 'Fa', 'g': 'Sol', 'a': 'La', 'b': 'Si' };
                    let msg = `Harika! ${trNames[foundNote]} notasını buldunuz ve çantaya attınız. `;

                    if (window.notesInPiano.length === window.MAX_NOTES) {
                        msg += "Tüm notaları topladınız! Şimdi X: 0 konumuna (Piyanoya) dönerek notaları yerleştirin.";
                    } else {
                        msg += `Sırada ${Object.values(trNames)[window.notesInPiano.length]} notası var. Kayıp notalar etrafta. Aramaya devam et.`;
                    }
                    if (window.announceToScreenReader) window.announceToScreenReader(msg);

                } else {
                    if (window.wrongSound) window.wrongSound.play();
                    if (window.announceToScreenReader) window.announceToScreenReader("Bir nota buldunuz ama sırası değil! Notaları doğru sırayla toplamalısınız.");
                }
            } else {
                if (window.wrongSound) window.wrongSound.play();
                if (window.announceToScreenReader) window.announceToScreenReader("Burada hiçbir şey yok. Aramaya devam et.");
            }
        }
    } else if (key.toLowerCase() === 'c') {
        let msg = `X Konumunuz: ${window.playerX}. `;
        if (window.playerX === window.pianoX) {
            msg += `Şu an piyanodasın. `;
            if (window.notesInPiano.length === window.MAX_NOTES) {
                msg += "Bütün notalar piyanoya yerleştirilmeye hazır. Oyunu kazanmak için entıra basın.";
            } else {
                msg += `Piyanodaki nota sayısı: ${window.notesInPiano.length} / ${window.MAX_NOTES}. Daha fazla nota bulmalısın.`;
            }
        } else if (window.notesOnMap[window.playerX]) {
            msg += "Ayağına sert bir şey takıldı. Burada bir nota olabilir! Almak için F tuşuna bas.";
        } else {
            msg += "Burası karlı boş bir alan.";
        }
        if (window.announceToScreenReader) window.announceToScreenReader(msg);
    } else if (key === 'Enter') {
        if (window.playerX === window.pianoX && window.notesInPiano.length === window.MAX_NOTES) {
            if (window.mountainSound && window.mountainSound.playing()) window.mountainSound.stop();
            if (window.modeUnlockSound) window.modeUnlockSound.play();
            
            if (window.announceToScreenReader) window.announceToScreenReader("Tebrikler! Tüm notaları sırasıyla topladın ve piyanoyu onardın. Kayıp Notalar modunu başarıyla tamamladın!");
            
            setTimeout(() => {
                if (window.gameModes && window.gameModes.missing_notes) {
                    window.gameModes.missing_notes.completionCount += 1;
                    try { localStorage.setItem('hafizaGuvenModes', JSON.stringify(window.gameModes)); } catch(e){}
                }
                
                window.isGridWalkingPhase = false;
                window.inStoryMode = false;
                
                if (window.storyBGM && window.storyBGM.playing()) window.storyBGM.stop();
                if (window.switchMenu && window.storyMenu && window.mainMenu) {
                    window.switchMenu(window.storyMenu, window.mainMenu, 'main');
                }
                
                if (window.bgMusic && !window.bgMusic.playing()) {
                    window.bgMusic.play();
                }
            }, 6000);
        }
    }

    function playRandomSnowStep() {
        if (window.snowStepSounds && window.snowStepSounds.length > 0) {
            const s = window.snowStepSounds[Math.floor(Math.random() * window.snowStepSounds.length)];
            s.volume(1.0);
            s.play();
        }
    }

    function updateStoryStatus() {
        const storyStatus = document.getElementById('story-status-text');
        if (!storyStatus) return;

        if (window.playerX === window.pianoX) {
            storyStatus.innerHTML = `Piyanodasın.`;
            if (window.announceToScreenReader) window.announceToScreenReader("Piyanodasın.");
        } else {
            storyStatus.innerHTML = `X Konumu: ${window.playerX}`;
            if (window.announceToScreenReader) window.announceToScreenReader(`Koordinat: ${window.playerX}`);
        }
    }
};
