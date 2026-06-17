// story.js - Hikaye Modu, YÃ¼rÃ¼me Mekanikleri ve KayÄ±p Notalar

window.inStoryMode = false;
window.currentStoryIndex = 0;
window.isGridWalkingPhase = false;
window.stepIntervalId = null;
window.currentAutoWalkStep = 0;
window.isStoryModeWon = false;

window.clearStoryAnimations = function() {
    if (window.stepIntervalId) clearInterval(window.stepIntervalId);
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

    // Ã‡alan kÄ±sa efekt seslerini ve notalarÄ± durdur (hÄ±zlÄ± atlama sÄ±rasÄ±nda birbirine girmemesi iÃ§in)
    if (window.enterHouseSound && window.enterHouseSound.playing()) window.enterHouseSound.stop();
    if (window.doorCloseSound && window.doorCloseSound.playing()) window.doorCloseSound.stop();
    if (window.glasshitSound && window.glasshitSound.playing()) window.glasshitSound.stop();
    if (window.dado3Sound && window.dado3Sound.playing()) window.dado3Sound.stop();
    
    if (window.carpetStepSounds) {
        window.carpetStepSounds.forEach(s => { if (s && s.playing()) s.stop(); });
    }
    if (window.snowStepSounds) {
        window.snowStepSounds.forEach(s => { if (s && s.playing()) s.stop(); });
    }
    if (window.activeNotes) {
        Object.values(window.activeNotes).forEach(n => { if (n && n.playing()) n.stop(); });
    }
};

window.quitStoryMode = function() {
    window.hgfzZamanlayici.hepsiniImhaEt();
    window.inStoryMode = false;
    window.isDialogPhase = false;
    window.isGridWalkingPhase = false;
    window.isStoryModeWon = false;
    window.isStoryModeFinishedWaitingForEnter = false;
    
    // ZamanlayÄ±cÄ±yÄ± Temizle
    if (window.storyTimerIntervalId) clearInterval(window.storyTimerIntervalId);
    
    window.clearStoryAnimations();

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
    let finalHtml = window.localizeText ? window.localizeText(appendedText.replace("Devam etmek iÃ§in entÄ±ra basÄ±n.", "<strong>Devam etmek iÃ§in entÄ±ra basÄ±n.</strong>")) : appendedText;

    if (window.dado3Sound) window.dado3Sound.play();
    storyStatus.innerHTML = finalHtml;
    storyStatus.blur();
    window.hgfzZamanlayici.setTimeout(() => storyStatus.focus(), 10);
    
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
        window.stepIntervalId = window.hgfzZamanlayici.setTimeout(window.playAutomatedWalkingScene, 1000);
    }
};

window.triggerStoryAnimations = function(index) {
    window.clearStoryAnimations(); // Ã–nceki sahneden kalanlarÄ± temizle ve Ã§alan sesleri kes

    if (index === 0) {
        let count = 0;
        window.storyAnimInterval1 = window.hgfzZamanlayici.setInterval(() => {
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

        window.storyAnimTimeout1 = window.hgfzZamanlayici.setTimeout(() => {
            if (window.enterHouseSound) window.enterHouseSound.play();
            let stepCount = 0;
            window.storyAnimInterval2 = window.hgfzZamanlayici.setInterval(() => {
                if (window.carpetStepSounds && window.carpetStepSounds.length > 0) {
                    let s = window.carpetStepSounds[Math.floor(Math.random() * window.carpetStepSounds.length)];
                    s.volume(Math.min(1.0, 0.2 + (stepCount * 0.2)));
                    s.play();
                }
                stepCount++;
                if (stepCount > 3) {
                    clearInterval(window.storyAnimInterval2);
                    window.storyAnimTimeout2 = window.hgfzZamanlayici.setTimeout(() => { if (window.doorCloseSound) window.doorCloseSound.play(); }, 500);
                }
            }, 800);
        }, 1200);

    } else if (index === 7) {
        if (window.storyBGM) window.storyBGM.play();
        if (window.glasshitSound) window.glasshitSound.play();
        if (window.wrongSound) {
            let wid = window.wrongSound.play();
            window.wrongSound.volume(1.0, wid);
        }
    } else if (index === 8) {
        window.storyAnimTimeout3 = window.hgfzZamanlayici.setTimeout(() => {
            if (window.activeNotes) {
                if (window.activeNotes['c']) window.activeNotes['c'].play();
                if (window.activeNotes['d']) window.activeNotes['d'].play();
                if (window.activeNotes['e']) window.activeNotes['e'].play();
            }
        }, 50);
        window.storyAnimTimeout4 = window.hgfzZamanlayici.setTimeout(() => {
            if (window.doorCloseSound) {
                let sid = window.doorCloseSound.play();
                window.doorCloseSound.rate(1.5, sid);
                window.doorCloseSound.volume(0.6, sid);
            }
        }, 200);
    } else if (index === 13) {
        let stepCount = 0;
        window.storyAnimInterval3 = window.hgfzZamanlayici.setInterval(() => {
            if (window.carpetStepSounds && window.carpetStepSounds.length > 0) {
                let s = window.carpetStepSounds[Math.floor(Math.random() * window.carpetStepSounds.length)];
                s.volume(Math.max(0.1, 1.0 - (stepCount * 0.2)));
                s.play();
            }
            stepCount++;
            if (stepCount > 4) {
                clearInterval(window.storyAnimInterval3);
                window.storyAnimTimeout5 = window.hgfzZamanlayici.setTimeout(() => { if (window.doorCloseSound) window.doorCloseSound.play(); }, 200); 
            }
        }, 400); 
    } else if (index === 14) {
        if (window.storyBGM && window.storyBGM.playing()) window.storyBGM.stop();
        if (window.enterHouseSound) window.enterHouseSound.play();
        window.storyAnimTimeout6 = window.hgfzZamanlayici.setTimeout(() => { if (window.doorCloseSound) window.doorCloseSound.play(); }, 1500);
        
        window.storyAnimTimeout7 = window.hgfzZamanlayici.setTimeout(() => {
            let stepCount = 0;
            window.storyAnimInterval4 = window.hgfzZamanlayici.setInterval(() => {
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
        window.storyAnimTimeout8 = window.hgfzZamanlayici.setTimeout(() => {
            const keys = ['g', 'e', 'c', 'f'];
            let kIdx = 0;
            window.storyAnimInterval5 = window.hgfzZamanlayici.setInterval(() => {
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
            let sid = window.successSound.play();
            window.successSound.volume(0.7, sid);
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

    let skipStoryDialogues = localStorage.getItem('hafizaGuvenDisableStoryMode') === 'true';
    if (window.announceToScreenReader) {
        if (skipStoryDialogues) {
            window.announceToScreenReader(`DÄ±ÅŸarÄ±dasÄ±n. X konumun: ${window.playerX}.`);
        } else {
            window.announceToScreenReader(`DÄ±ÅŸarÄ±dasÄ±n. Kar Ã¼stÃ¼nde rastgele bir noktaya Ä±ÅŸÄ±nlandÄ±n. X konumun: ${window.playerX}. Piyanoya dÃ¶nmek iÃ§in X: 0 konumuna doÄŸru yÃ¼rÃ¼melisin. Etrafta rastgele yerleÅŸtirilmiÅŸ ${window.MAX_NOTES} adet nota var. Bir nota bulduÄŸunda F tuÅŸuna basarak onu alabilirsin. TÃ¼m notalarÄ± sÄ±rasÄ±yla (Do, Re, Mi, Fa, Sol, La, Si) piyanoya getirmelisin.`);
        }
    }

    if (window.mountainSound && !window.mountainSound.playing()) {
        window.mountainSound.loop(true);
        let mid = window.mountainSound.play();
        window.mountainSound.volume(0.4, mid);
    }

    // ZamanlayÄ±cÄ±yÄ± baÅŸlat (220 saniye)
    if (window.storyTimerIntervalId) clearInterval(window.storyTimerIntervalId);
    window.storyTimerValue = 220;
    
    window.storyTimerIntervalId = setInterval(() => {
        if (window.isStoryModeWon || (window.notesInPiano && window.notesInPiano.length >= window.MAX_NOTES)) {
            clearInterval(window.storyTimerIntervalId);
            return;
        }
        
        window.storyTimerValue--;
        
        if (window.storyTimerValue === 180) {
            if (window.announceToScreenReader) window.announceToScreenReader("3 dakika kaldÄ±.");
        } else if (window.storyTimerValue === 120) {
            if (window.announceToScreenReader) window.announceToScreenReader("2 dakika kaldÄ±.");
        } else if (window.storyTimerValue === 60) {
            if (window.announceToScreenReader) window.announceToScreenReader("1 dakika kaldÄ±.");
        } else if (window.storyTimerValue === 30) {
            if (window.announceToScreenReader) window.announceToScreenReader("Son 30 saniye kaldÄ±.");
        }
        
        if (window.storyTimerValue <= 30 && window.storyTimerValue > 0) {
            // Son 30 saniyede her saniye heyecan artÄ±rÄ±cÄ± sesi Ã§al
            if (window.seconsSound) window.seconsSound.play();
        }
        
        if (window.storyTimerValue <= 0) {
            clearInterval(window.storyTimerIntervalId);
            window.quitStoryMode();
            
            if (window.wrongSound) window.wrongSound.play();
            if (window.announceToScreenReader) {
                window.announceToScreenReader("SÃ¼re doldu! SoÄŸuktan donmak Ã¼zereyken kurtarma ekipleri seni buldu. KayÄ±p Notalar modunu tamamlayamadÄ±n. Ana menÃ¼ye dÃ¶nÃ¼lÃ¼yor.", true);
            }
            
            if (window.switchMenu && window.storyMenu && window.mainMenu) {
                window.switchMenu(window.storyMenu, window.mainMenu, 'main');
            }
            
            if (window.bgMusic && !window.bgMusic.playing()) {
                window.bgMusic.play();
            }
        }
    }, 1000);
};

window.handleStoryWalking = function(key) {
    if (!window.isGridWalkingPhase) return;

    if ((window.isStoryModeWon || (window.notesInPiano && window.notesInPiano.length >= window.MAX_NOTES)) && key !== 'Enter') {
        return;
    }

    if (key === 'ArrowRight' || key === 'ArrowLeft') {
        const now = Date.now();
        if (window.lastStoryWalkTime && now - window.lastStoryWalkTime < 200) {
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
            if (window.announceToScreenReader) window.announceToScreenReader("HaritanÄ±n sonundasÄ±n. Daha fazla saÄŸa gidemezsin.");
        }
    } else if (key === 'ArrowLeft') {
        if (window.playerX > 0) {
            window.playerX--;
            playRandomSnowStep();
            updateStoryStatus();
        } else {
            if (window.announceToScreenReader) window.announceToScreenReader("PiyanodasÄ±n. Daha fazla sola gidemezsin.");
        }
    } else if (key.toLowerCase() === 'f') {
        if (window.playerX === window.pianoX) {
            if (window.carryingNote) {
                window.notesInPiano.push(window.carryingNote);
                let droppedNote = window.carryingNote;
                window.carryingNote = null;
                
                if (window.correctSound) window.correctSound.play();
                const trNames = { 'c': 'Do', 'd': 'Re', 'e': 'Mi', 'f': 'Fa', 'g': 'Sol', 'a': 'La', 'b': 'Si' };
                let placedCount = window.notesInPiano.length;
                let remainingCount = window.MAX_NOTES - placedCount;
                
                if (placedCount === window.MAX_NOTES) {
                    window.hgfzZamanlayici.setTimeout(() => {
                        if (window.handleStoryWalking) window.handleStoryWalking('Enter');
                    }, 500);
                } else {
                    let msg = `Harika! ${trNames[droppedNote]} notasÄ±nÄ± piyanoya yerleÅŸtirdiniz. Toplam ${placedCount} nota yerleÅŸtirdik, geriye ${remainingCount} nota kaldÄ±. `;
                    const expectedOrder = ['c', 'd', 'e', 'f', 'g', 'a', 'b'];
                    msg += `SÄ±rada ${trNames[expectedOrder[placedCount]]} notasÄ± var. KayÄ±p notalar etrafta. Aramaya devam et.`;
                    if (window.announceToScreenReader) window.announceToScreenReader(msg);
                }
            } else {
                if (window.notesInPiano.length === window.MAX_NOTES) {
                    if (window.announceToScreenReader) window.announceToScreenReader("Piyano zaten tamamlandÄ±. Onay tuÅŸuna basarak bitirebilirsin.");
                } else {
                    if (window.announceToScreenReader) window.announceToScreenReader(`PiyanodasÄ±n. Åu an piyanoda ${window.notesInPiano.length} nota var.`);
                }
            }
        } else {
            if (window.notesOnMap[window.playerX]) {
                if (window.carryingNote) {
                    if (window.wrongSound) window.wrongSound.play();
                    if (window.announceToScreenReader) window.announceToScreenReader("Zaten elinizde bir nota var! Ã–nce onu X: 0 konumundaki piyanoya bÄ±rakmalÄ±sÄ±nÄ±z.");
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
                    
                    let baseMsg = "NotayÄ± yerden aldÄ±nÄ±z. Åimdi piyanoya bÄ±rakmanÄ±z gerekiyor.";
                    let disableMotivation = localStorage.getItem('hafizaGuvenDisableMotivation') === 'true';
                    if (!disableMotivation && window.missingNotesHappyMessages && window.missingNotesHappyMessages.length > window.notesInPiano.length) {
                        baseMsg = window.missingNotesHappyMessages[window.notesInPiano.length] + " Åimdi onu piyanoya gÃ¶tÃ¼rmelisin.";
                    }
                    
                    if (window.announceToScreenReader) window.announceToScreenReader(baseMsg);

                } else {
                    if (window.activeNotes && window.activeNotes[foundNote]) {
                        window.activeNotes[foundNote].volume(1.0);
                        window.activeNotes[foundNote].play();
                    }
                    const trNames = { 'c': 'Do', 'd': 'Re', 'e': 'Mi', 'f': 'Fa', 'g': 'Sol', 'a': 'La', 'b': 'Si' };
                    const foundName = trNames[foundNote];
                    window.hgfzZamanlayici.setTimeout(() => {
                        if (window.wrongSound) window.wrongSound.play();
                        if (window.announceToScreenReader) window.announceToScreenReader(`Burada ${foundName} notasÄ± var ama sÄ±rasÄ± deÄŸil! NotalarÄ± doÄŸru sÄ±rayla toplamalÄ±sÄ±nÄ±z.`);
                    }, 400);
                }
            } else {
                if (window.wrongSound) window.wrongSound.play();
                if (window.announceToScreenReader) window.announceToScreenReader("Burada hiÃ§bir ÅŸey yok. Aramaya devam et.");
            }
        }
    } else if (key.toLowerCase() === 'c') {
        let msg = `X Konumunuz: ${window.playerX}. `;
        if (window.carryingNote) {
            msg += "Elinizde bir nota var. Onu X: 0 konumundaki piyanoya gÃ¶tÃ¼rmelisiniz. ";
        }
        if (window.playerX === window.pianoX) {
            msg += `Åu an piyanodasÄ±n. `;
            if (window.notesInPiano.length === window.MAX_NOTES) {
                msg += "BÃ¼tÃ¼n notalar piyanoya yerleÅŸtirildi. Oyunu kazanmak iÃ§in entÄ±ra basÄ±n.";
            } else {
                msg += `Piyanodaki nota sayÄ±sÄ±: ${window.notesInPiano.length} / ${window.MAX_NOTES}. Daha fazla nota bulmalÄ±sÄ±n.`;
            }
        } else if (window.notesOnMap[window.playerX]) {
            const trNames = { 'c': 'Do', 'd': 'Re', 'e': 'Mi', 'f': 'Fa', 'g': 'Sol', 'a': 'La', 'b': 'Si' };
            const noteName = trNames[window.notesOnMap[window.playerX]];
            msg += `AyaÄŸÄ±na sert bir ÅŸey takÄ±ldÄ±. Burada ${noteName} notasÄ± var! Almak iÃ§in F tuÅŸuna bas.`;
        } else {
            msg += "BurasÄ± karlÄ± boÅŸ bir alan.";
        }
        
        const storyStatus = document.getElementById('story-status-text');
        if (storyStatus) {
            storyStatus.innerHTML = msg;
            storyStatus.blur();
            window.hgfzZamanlayici.setTimeout(() => storyStatus.focus(), 10);
        }
        if (window.announceToScreenReader) window.announceToScreenReader(msg);
    } else if (key.toLowerCase() === 't') {
        const displayTime = window.storyTimerValue < 0 ? 0 : window.storyTimerValue;
        let msg = `Kalan sÃ¼re: ${displayTime} saniye.`;
        
        const storyStatus = document.getElementById('story-status-text');
        if (storyStatus) {
            storyStatus.innerHTML = msg;
            storyStatus.blur();
            window.hgfzZamanlayici.setTimeout(() => storyStatus.focus(), 10);
        }
        if (window.announceToScreenReader) window.announceToScreenReader(msg, true);
    } else if (key === 'Enter') {
        if (window.notesInPiano.length === window.MAX_NOTES && !window.carryingNote) {
            if (window.isStoryModeWon && !window.isStoryModeFinishedWaitingForEnter && !window.isRhythmUnlockDialogWaitingForEnter && !window.isSoundPacksUnlockDialogWaitingForEnter) return;
            
            if (window.isSoundPacksUnlockDialogWaitingForEnter) {
                window.isSoundPacksUnlockDialogWaitingForEnter = false;
                window.isGridWalkingPhase = false;
                window.inStoryMode = false;
                
                if (window.storyBGM && window.storyBGM.playing()) window.storyBGM.stop();
                if (window.switchMenu && window.storyMenu && window.mainMenu) {
                    window.switchMenu(window.storyMenu, window.mainMenu, 'main');
                }
                if (window.updateInstrumentBtnText) window.updateInstrumentBtnText();
                
                let changeBtn = document.getElementById('btn-change-instrument');
                if (changeBtn) changeBtn.click();
                
                if (window.bgMusic && !window.bgMusic.playing()) {
                    window.bgMusic.play();
                }
                return;
            }

            if (window.isRhythmUnlockDialogWaitingForEnter) {
                window.isRhythmUnlockDialogWaitingForEnter = false;
                window.isSoundPacksUnlockDialogWaitingForEnter = true;

                if (window.successSound) {
                    let sid2 = window.successSound.play();
                    window.successSound.volume(0.8, sid2);
                }
                if (window.applauseSound) window.applauseSound.play();
                
                let packsMsg = "AyrÄ±ca harika bir haberimiz daha var! ArtÄ±k diÄŸer ses paketlerini de oynayabileceksiniz. TÃ¼m enstrÃ¼manlarÄ± seÃ§ebilme seÃ§eneÄŸi ana menÃ¼ye eklendi ve maÄŸazada yeni enstrÃ¼man paketleri ortaya Ã§Ä±ktÄ±! Ana menÃ¼ye dÃ¶nmek iÃ§in entÄ±ra basÄ±n.";
                
                const storyStatus = document.getElementById('story-status-text');
                if (storyStatus) storyStatus.innerHTML = packsMsg;
                
                if (window.announceToScreenReader) {
                    window.announceToScreenReader(packsMsg);
                }
                return;
            }

            if (window.isStoryModeFinishedWaitingForEnter) {
                window.isStoryModeFinishedWaitingForEnter = false;
                if (window.storyWinTimeout) clearTimeout(window.storyWinTimeout);
                
                if (window.gameModes && window.gameModes.missing_notes) {
                    window.gameModes.missing_notes.completionCount += 1;
                    try { localStorage.setItem('hafizaGuvenModes', JSON.stringify(window.gameModes)); } catch(e){}
                }
                
                let isPacksUnlocked = localStorage.getItem('hafizaGuvenSoundPacksUnlocked') === 'true';

                if (!isPacksUnlocked) {
                    localStorage.setItem('hafizaGuvenSoundPacksUnlocked', 'true');
                    window.isRhythmUnlockDialogWaitingForEnter = true;
                    
                    if (window.successSound) {
                        let sid2 = window.successSound.play();
                        window.successSound.volume(0.8, sid2);
                    }
                    if (window.applauseSound) window.applauseSound.play();
                    
                    let unlockMsg = "Tebrikler. KayÄ±p notalar modunu tamamladÄ±nÄ±z. Ritim avcÄ±sÄ± yeni oyun modunu aÃ§tÄ±nÄ±z. Ä°letiÅŸim kutusunu geÃ§mek iÃ§in entÄ±ra basÄ±n.";
                    
                    const storyStatus = document.getElementById('story-status-text');
                    if (storyStatus) storyStatus.innerHTML = unlockMsg;
                    
                    if (window.announceToScreenReader) {
                        window.announceToScreenReader(unlockMsg);
                    }
                    return;
                }
                
                window.isGridWalkingPhase = false;
                window.inStoryMode = false;
                
                if (window.storyBGM && window.storyBGM.playing()) window.storyBGM.stop();
                if (window.switchMenu && window.storyMenu && window.mainMenu) {
                    window.switchMenu(window.storyMenu, window.mainMenu, 'main');
                }
                
                let changeBtn = document.getElementById('btn-change-instrument');
                if (changeBtn) changeBtn.click();
                
                if (window.bgMusic && !window.bgMusic.playing()) {
                    window.bgMusic.play();
                }
                return;
            }

            window.isStoryModeWon = true;
            window.isDialogPhase = false;

            if (window.mountainSound && window.mountainSound.playing()) window.mountainSound.stop();
            if (window.music272Sound && window.music272Sound.playing()) window.music272Sound.stop();
            
            if (window.successSound) {
                let sid3 = window.successSound.play();
                window.successSound.volume(0.8, sid3);
            }
            if (window.applauseSound) window.applauseSound.play();
            
            let totalTokens = parseInt(localStorage.getItem('hafizaGuvenTotalTokens')) || 0;
            let reward = 300;
            let eventMsg = "";
            if (window.isWeekendDoubleCoins && window.isWeekendDoubleCoins()) { reward *= 2; eventMsg = " (Ã‡ift Jeton EtkinliÄŸi!)"; }
            totalTokens += reward;
            try { localStorage.setItem('hafizaGuvenTotalTokens', totalTokens); } catch(e){}
            
            let winMsg = `Tebrikler! TÃ¼m notalarÄ± sÄ±rasÄ±yla topladÄ±n ve piyanoyu onardÄ±n. KayÄ±p Notalar modunu baÅŸarÄ±yla tamamladÄ±n! Bu hikaye iÃ§in ${reward} jeton kazandÄ±nÄ±z${eventMsg}. Toplam jetonunuz ${totalTokens}.`;
            if (window.announceToScreenReader) window.announceToScreenReader(winMsg, true);
            
            const storyStatus = document.getElementById('story-status-text');
            if (storyStatus) {
                storyStatus.innerHTML = winMsg;
                storyStatus.blur();
                window.hgfzZamanlayici.setTimeout(() => storyStatus.focus(), 10);
            }
            
            window.storyWinTimeout = window.hgfzZamanlayici.setTimeout(() => {
                window.isStoryModeFinishedWaitingForEnter = true;
                if (window.announceToScreenReader) {
                    window.announceToScreenReader("Ana menÃ¼ye dÃ¶nmek iÃ§in entÄ±ra basÄ±n.", true);
                }
                if (storyStatus) {
                    storyStatus.innerHTML += "<br><br>Ana menÃ¼ye dÃ¶nmek iÃ§in entÄ±ra basÄ±n.";
                }
            }, 3000);
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

        let hasNoteOrPiano = false;
        let finalMsg = "";
        
        if (window.playerX === window.pianoX) {
            hasNoteOrPiano = true;
            finalMsg = "PiyanodasÄ±n. ";
        }
        
        if (window.notesOnMap && window.notesOnMap[window.playerX]) {
            hasNoteOrPiano = true;
            const foundNote = window.notesOnMap[window.playerX];
            const trNames = { 'c': 'Do', 'd': 'Re', 'e': 'Mi', 'f': 'Fa', 'g': 'Sol', 'a': 'La', 'b': 'Si' };
            const noteName = trNames[foundNote];
            
            finalMsg += `AyaÄŸÄ±na sert bir ÅŸey takÄ±ldÄ±. Burada ${noteName} notasÄ± var!`;

            if (window.activeNotes && window.activeNotes[foundNote]) {
                window.activeNotes[foundNote].volume(1.0);
                window.activeNotes[foundNote].play();
            }
        }

        if (hasNoteOrPiano) {
            storyStatus.innerHTML = finalMsg;
        } else {
            storyStatus.innerHTML = " ";
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    const storyStatus = document.getElementById('story-status-text');
    if (storyStatus) {
        const handleStoryTextClick = () => {
            if (window.inStoryMode && !window.isGridWalkingPhase) {
                // Enter tuÅŸunu simÃ¼le ederek hikayeyi atlat (Ekran okuyucu Ã§ift dokunuÅŸu 'click' olarak algÄ±lar)
                const enterEvent = new KeyboardEvent('keydown', {
                    key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true
                });
                document.dispatchEvent(enterEvent);
            } else if (window.inStoryMode && window.isGridWalkingPhase) {
                // YÃ¼rÃ¼me modunda sadece mevcut koordinatÄ± oku (C tuÅŸu simÃ¼lasyonu)
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
            // EÄŸer oyun oynanÄ±yor ve daÄŸ haritasÄ±nda yÃ¼rÃ¼nÃ¼yorsa 2 parmakla dokunmayÄ± F tuÅŸu olarak algÄ±la.
            e.preventDefault();
            if (window.handleStoryWalking) window.handleStoryWalking('f');
        }
    }
}, { passive: false });


