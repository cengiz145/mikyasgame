// story.js - Hikaye Modu, Yürüme Mekanikleri ve Kayıp Notalar

window.inStoryMode = false;
window.currentStoryIndex = 0;
window.isGridWalkingPhase = false;
window.stepIntervalId = null;
window.currentAutoWalkStep = 0;
window.isStoryModeWon = false;

window.quitStoryMode = function() {
    window.inStoryMode = false;
    window.isDialogPhase = false;
    window.isGridWalkingPhase = false;
    window.isStoryModeWon = false;
    window.isStoryModeFinishedWaitingForEnter = false;
    
    // Hafıza (Memory) Sızıntılarını ve Taşan Animasyonları Önle (Clear all timeouts)
    if (window.stepIntervalId) clearTimeout(window.stepIntervalId);
    if (window.storyAnimInterval1) clearInterval(window.storyAnimInterval1);
    if (window.storyAnimInterval2) clearInterval(window.storyAnimInterval2);
    if (window.storyAnimInterval3) clearInterval(window.storyAnimInterval3);
    if (window.storyAnimInterval4) clearInterval(window.storyAnimInterval4);
    if (window.storyAnimInterval5) clearInterval(window.storyAnimInterval5);
    if (window.storyAnimTimeout1) clearTimeout(window.storyAnimTimeout1);
    if (window.storyAnimTimeout2) clearTimeout(window.storyAnimTimeout2);
    if (window.storyAnimTimeout3) clearTimeout(window.storyAnimTimeout3);
    if (window.storyAnimTimeout4) clearTimeout(window.storyAnimTimeout4);
    if (window.storyAnimTimeout5) clearTimeout(window.storyAnimTimeout5);
    if (window.storyAnimTimeout6) clearTimeout(window.storyAnimTimeout6);
    if (window.storyAnimTimeout7) clearTimeout(window.storyAnimTimeout7);
    if (window.storyAnimTimeout8) clearTimeout(window.storyAnimTimeout8);
    if (window.storyWinTimeout) clearTimeout(window.storyWinTimeout);
    if (window.storyEntryTimeout) clearTimeout(window.storyEntryTimeout);

    // Ortam Seslerini Kes
    if (window.storyBGM && window.storyBGM.playing()) window.storyBGM.stop();
    if (window.mountainSound && window.mountainSound.playing()) window.mountainSound.stop();
    if (window.music272Sound && window.music272Sound.playing()) window.music272Sound.stop();
    if (window.house2Sound && window.house2Sound.playing()) window.house2Sound.stop();
};

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
    let finalHtml = window.localizeText ? window.localizeText(appendedText.replace("Devam etmek için entıra basın.", "<strong>Devam etmek için entıra basın.</strong>")) : appendedText;

    if (window.dado3Sound) window.dado3Sound.play();
    storyStatus.innerHTML = finalHtml;
    
    // Explicitly announce for screen readers
    if (window.announceToScreenReader) {
        window.announceToScreenReader(window.localizeText(appendedText), true);
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
        window.stepIntervalId = setTimeout(window.playAutomatedWalkingScene, 1000);
    }
};

window.triggerStoryAnimations = function(index) {
    if (index === 0) {
        let count = 0;
        window.storyAnimInterval1 = setInterval(() => {
            const keys = ['c', 'e', 'g', 'c', 'f', 'a', 'd', 'b', 'g'];
            const randomKey = keys[Math.floor(Math.random() * keys.length)];
            if (window.activeNotes && window.activeNotes[randomKey]) {
                window.activeNotes[randomKey].volume(0.8);
                let sndId = window.activeNotes[randomKey].play();
                window.activeNotes[randomKey].seek(0.045, sndId);
            }
            count++;
            if (count > 6) clearInterval(window.storyAnimInterval1);
        }, 400);

        window.storyAnimTimeout1 = setTimeout(() => {
            if (window.enterHouseSound) window.enterHouseSound.play();
            let stepCount = 0;
            window.storyAnimInterval2 = setInterval(() => {
                if (window.carpetStepSounds && window.carpetStepSounds.length > 0) {
                    let s = window.carpetStepSounds[Math.floor(Math.random() * window.carpetStepSounds.length)];
                    s.volume(Math.min(1.0, 0.2 + (stepCount * 0.2)));
                    s.play();
                }
                stepCount++;
                if (stepCount > 3) {
                    clearInterval(window.storyAnimInterval2);
                    window.storyAnimTimeout2 = setTimeout(() => { if (window.doorCloseSound) window.doorCloseSound.play(); }, 500);
                }
            }, 800);
        }, 1200);

    } else if (index === 7) {
        if (window.storyBGM) window.storyBGM.play();
        if (window.glasshitSound) window.glasshitSound.play();
        if (window.wrongSound) {
            window.wrongSound.volume(1.0);
            window.wrongSound.play();
        }
    } else if (index === 8) {
        window.storyAnimTimeout3 = setTimeout(() => {
            if (window.activeNotes) {
                if (window.activeNotes['c']) window.activeNotes['c'].play();
                if (window.activeNotes['d']) window.activeNotes['d'].play();
                if (window.activeNotes['e']) window.activeNotes['e'].play();
            }
        }, 50);
        window.storyAnimTimeout4 = setTimeout(() => {
            if (window.doorCloseSound) {
                let sid = window.doorCloseSound.play();
                window.doorCloseSound.rate(1.5, sid);
                window.doorCloseSound.volume(0.6, sid);
            }
        }, 200);
    } else if (index === 13) {
        let stepCount = 0;
        window.storyAnimInterval3 = setInterval(() => {
            if (window.carpetStepSounds && window.carpetStepSounds.length > 0) {
                let s = window.carpetStepSounds[Math.floor(Math.random() * window.carpetStepSounds.length)];
                s.volume(Math.max(0.1, 1.0 - (stepCount * 0.2)));
                s.play();
            }
            stepCount++;
            if (stepCount > 4) {
                clearInterval(window.storyAnimInterval3);
                window.storyAnimTimeout5 = setTimeout(() => { if (window.doorCloseSound) window.doorCloseSound.play(); }, 200); 
            }
        }, 400); 
    } else if (index === 14) {
        if (window.storyBGM && window.storyBGM.playing()) window.storyBGM.stop();
        if (window.enterHouseSound) window.enterHouseSound.play();
        window.storyAnimTimeout6 = setTimeout(() => { if (window.doorCloseSound) window.doorCloseSound.play(); }, 1500);
        
        window.storyAnimTimeout7 = setTimeout(() => {
            let stepCount = 0;
            window.storyAnimInterval4 = setInterval(() => {
                if (window.snowStepSounds && window.snowStepSounds.length > 0) {
                    let s = window.snowStepSounds[Math.floor(Math.random() * window.snowStepSounds.length)];
                    s.volume(0.8);
                    s.play();
                }
                stepCount++;
                if (stepCount > 4) clearInterval(window.storyAnimInterval4);
            }, 800); 
        }, 2000);
    } else if (index === 15) {
        if (window.correctSound) window.correctSound.play();
        window.storyAnimTimeout8 = setTimeout(() => {
            const keys = ['g', 'e', 'c', 'f'];
            let kIdx = 0;
            window.storyAnimInterval5 = setInterval(() => {
                let note = keys[kIdx];
                if (window.activeNotes && window.activeNotes[note]) {
                    window.activeNotes[note].volume(0.6);
                    window.activeNotes[note].play();
                }
                kIdx++;
                if (kIdx >= keys.length) clearInterval(window.storyAnimInterval5);
            }, 300);
        }, 1000);
    } else if (index === 16) {
        if (window.successSound) {
            window.successSound.volume(0.7);
            window.successSound.play();
        }
    }
};

window.initializeMissingNotesMap = function() {
    window.notesInPiano = [];
    window.carryingNote = null;
    window.isStoryModeWon = false;
    window.isStoryModeFinishedWaitingForEnter = false;
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

    if (window.mountainSound && !window.mountainSound.playing()) {
        window.mountainSound.volume(0.4);
        window.mountainSound.loop(true);
        window.mountainSound.play();
    }

    // music272Sound removed to prevent 2 tracks playing simultaneously in mountain map
};

window.handleStoryWalking = function(key) {
    if (!window.isGridWalkingPhase) return;

    if (window.isStoryModeWon && key !== 'Enter') {
        return;
    }

    if (key === 'ArrowRight' || key === 'ArrowLeft') {
        const now = Date.now();
        if (window.lastStoryWalkTime && now - window.lastStoryWalkTime < 300) {
            return;
        }
        window.lastStoryWalkTime = now;
    }

    if (key === 'ArrowRight') {
        if (window.playerX < window.mapLength) {
            window.playerX++;
            playRandomSnowStep();
            updateStoryStatus();
        } else {
            if (window.announceToScreenReader) window.announceToScreenReader("Haritanın sonundasın. Daha fazla sağa gidemezsin.");
        }
    } else if (key === 'ArrowLeft') {
        if (window.playerX > 0) {
            window.playerX--;
            playRandomSnowStep();
            updateStoryStatus();
        } else {
            if (window.announceToScreenReader) window.announceToScreenReader("Piyanodasın. Daha fazla sola gidemezsin.");
        }
    } else if (key.toLowerCase() === 'f') {
        if (window.playerX === window.pianoX) {
            if (window.carryingNote) {
                window.notesInPiano.push(window.carryingNote);
                let droppedNote = window.carryingNote;
                window.carryingNote = null;
                
                if (window.correctSound) window.correctSound.play();
                const trNames = { 'c': 'Do', 'd': 'Re', 'e': 'Mi', 'f': 'Fa', 'g': 'Sol', 'a': 'La', 'b': 'Si' };
                let msg = `Harika! ${trNames[droppedNote]} notasını piyanoya yerleştirdiniz. `;
                
                if (window.notesInPiano.length === window.MAX_NOTES) {
                    msg += "Bütün notalar piyanoya yerleştirildi. Oyunu kazanmak için Onay (Enter) tuşuna basın.";
                } else {
                    const expectedOrder = ['c', 'd', 'e', 'f', 'g', 'a', 'b'];
                    msg += `Sırada ${trNames[expectedOrder[window.notesInPiano.length]]} notası var. Kayıp notalar etrafta. Aramaya devam et.`;
                }
                if (window.announceToScreenReader) window.announceToScreenReader(msg);
            } else {
                if (window.notesInPiano.length === window.MAX_NOTES) {
                    if (window.announceToScreenReader) window.announceToScreenReader("Piyano zaten tamamlandı. Onay tuşuna basarak bitirebilirsin.");
                } else {
                    if (window.announceToScreenReader) window.announceToScreenReader(`Piyanodasın. Şu an piyanoda ${window.notesInPiano.length} nota var.`);
                }
            }
        } else {
            if (window.notesOnMap[window.playerX]) {
                if (window.carryingNote) {
                    if (window.wrongSound) window.wrongSound.play();
                    if (window.announceToScreenReader) window.announceToScreenReader("Zaten elinizde bir nota var! Önce onu X: 0 konumundaki piyanoya bırakmalısınız.");
                    return;
                }
                const foundNote = window.notesOnMap[window.playerX];
                const expectedOrder = ['c', 'd', 'e', 'f', 'g', 'a', 'b'];
                if (window.notesInPiano.length === expectedOrder.indexOf(foundNote)) {
                    window.carryingNote = foundNote;
                    delete window.notesOnMap[window.playerX];

                    if (window.activeNotes && window.activeNotes[foundNote]) {
                        window.activeNotes[foundNote].volume(1.0);
                        window.activeNotes[foundNote].play();
                    }
                    if (window.correctSound) window.correctSound.play();
                    
                    let baseMsg = "Notayı yerden aldınız. Şimdi piyanoya bırakmanız gerekiyor.";
                    if (window.missingNotesHappyMessages && window.missingNotesHappyMessages.length > window.notesInPiano.length) {
                        baseMsg = window.missingNotesHappyMessages[window.notesInPiano.length] + " Şimdi onu piyanoya götürmelisin.";
                    }
                    
                    if (window.announceToScreenReader) window.announceToScreenReader(baseMsg);

                } else {
                    if (window.activeNotes && window.activeNotes[foundNote]) {
                        window.activeNotes[foundNote].volume(1.0);
                        window.activeNotes[foundNote].play();
                    }
                    setTimeout(() => {
                        if (window.wrongSound) window.wrongSound.play();
                        if (window.announceToScreenReader) window.announceToScreenReader("Bir nota buldunuz ama sırası değil! Notaları doğru sırayla toplamalısınız.");
                    }, 400);
                }
            } else {
                if (window.wrongSound) window.wrongSound.play();
                if (window.announceToScreenReader) window.announceToScreenReader("Burada hiçbir şey yok. Aramaya devam et.");
            }
        }
    } else if (key.toLowerCase() === 'c') {
        let msg = `X Konumunuz: ${window.playerX}. `;
        if (window.carryingNote) {
            msg += "Elinizde bir nota var. Onu X: 0 konumundaki piyanoya götürmelisiniz. ";
        }
        if (window.playerX === window.pianoX) {
            msg += `Şu an piyanodasın. `;
            if (window.notesInPiano.length === window.MAX_NOTES) {
                msg += "Bütün notalar piyanoya yerleştirildi. Oyunu kazanmak için entıra basın.";
            } else {
                msg += `Piyanodaki nota sayısı: ${window.notesInPiano.length} / ${window.MAX_NOTES}. Daha fazla nota bulmalısın.`;
            }
        } else if (window.notesOnMap[window.playerX]) {
            const trNames = { 'c': 'Do', 'd': 'Re', 'e': 'Mi', 'f': 'Fa', 'g': 'Sol', 'a': 'La', 'b': 'Si' };
            const noteName = trNames[window.notesOnMap[window.playerX]];
            msg += `Ayağına sert bir şey takıldı. Burada ${noteName} notası var! Almak için F tuşuna bas.`;
        } else {
            msg += "Burası karlı boş bir alan.";
        }
        if (window.announceToScreenReader) window.announceToScreenReader(msg);
    } else if (key === 'Enter') {
        if (window.playerX === window.pianoX && window.notesInPiano.length === window.MAX_NOTES && !window.carryingNote) {
            if (window.isStoryModeFinishedWaitingForEnter) {
                window.isStoryModeFinishedWaitingForEnter = false;
                if (window.storyWinTimeout) clearTimeout(window.storyWinTimeout);
                
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
                return;
            }

            // Hızlıca (spam) basarak sonsuz tamamlama (completionCount) hilesini engelle
            if (window.isStoryModeWon) return; 
            window.isStoryModeWon = true;
            window.isDialogPhase = false;

            if (window.mountainSound && window.mountainSound.playing()) window.mountainSound.stop();
            if (window.music272Sound && window.music272Sound.playing()) window.music272Sound.stop();
            
            if (window.successSound) {
                window.successSound.volume(0.8);
                window.successSound.play();
            }
            if (window.applauseSound) window.applauseSound.play();
            
            let totalTokens = parseInt(localStorage.getItem('hafizaGuvenTotalTokens')) || 0;
            totalTokens += 300;
            try { localStorage.setItem('hafizaGuvenTotalTokens', totalTokens); } catch(e){}
            
            let winMsg = `Tebrikler! Tüm notaları sırasıyla topladın ve piyanoyu onardın. Kayıp Notalar modunu başarıyla tamamladın! Bu hikaye için 300 jeton kazandınız. Toplam jetonunuz ${totalTokens}.`;
            if (window.announceToScreenReader) window.announceToScreenReader(winMsg);
            
            window.storyWinTimeout = setTimeout(() => {
                window.isStoryModeFinishedWaitingForEnter = true;
                if (window.announceToScreenReader) {
                    window.announceToScreenReader("Ana menüye dönmek için entıra basın.");
                }
            }, 13000);
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

        let statusString = "";
        let srString = "";
        
        if (window.playerX === window.pianoX) {
            statusString = `Piyanodasın.`;
            srString = "Piyanodasın.";
        } else {
            statusString = `X Konumu: ${window.playerX}`;
            srString = `Koordinat: ${window.playerX}`;
        }
        
        if (window.notesOnMap && window.notesOnMap[window.playerX]) {
            const foundNote = window.notesOnMap[window.playerX];
            const trNames = { 'c': 'Do', 'd': 'Re', 'e': 'Mi', 'f': 'Fa', 'g': 'Sol', 'a': 'La', 'b': 'Si' };
            const noteName = trNames[foundNote];
            
            statusString += ` (Burada ${noteName} notası var!)`;

            if (window.activeNotes && window.activeNotes[foundNote]) {
                window.activeNotes[foundNote].volume(1.0);
                window.activeNotes[foundNote].play();
            }
        }

        storyStatus.innerHTML = statusString;
    }
};

document.addEventListener('DOMContentLoaded', () => {
    const storyStatus = document.getElementById('story-status-text');
    if (storyStatus) {
        const handleStoryTextClick = () => {
            if (window.inStoryMode && !window.isGridWalkingPhase) {
                // Enter tuşunu simüle ederek hikayeyi atlat (Ekran okuyucu çift dokunuşu 'click' olarak algılar)
                const enterEvent = new KeyboardEvent('keydown', {
                    key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true
                });
                document.dispatchEvent(enterEvent);
            } else if (window.inStoryMode && window.isGridWalkingPhase) {
                // Yürüme modunda sadece mevcut koordinatı oku (C tuşu simülasyonu)
                if (window.handleStoryWalking) window.handleStoryWalking('c');
            }
        };
        storyStatus.addEventListener('click', handleStoryTextClick);
        storyStatus.addEventListener('dblclick', handleStoryTextClick);
    }
});

document.addEventListener('touchstart', (e) => {
    if (e.touches && e.touches.length === 2) {
        if (window.inStoryMode && window.isGridWalkingPhase) {
            // Eğer oyun oynanıyor ve dağ haritasında yürünüyorsa 2 parmakla dokunmayı F tuşu olarak algıla.
            e.preventDefault();
            if (window.handleStoryWalking) window.handleStoryWalking('f');
        }
    }
}, { passive: false });


