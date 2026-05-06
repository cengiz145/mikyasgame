// story.js - Hikaye Modu, Yürüme Mekanikleri ve Kayıp Notalar

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

    // Çalan kısa efekt seslerini ve notaları durdur (hızlı atlama sırasında birbirine girmemesi için)
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
    
    // Zamanlayıcıyı Temizle
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
    let finalHtml = window.localizeText ? window.localizeText(appendedText.replace("Devam etmek için entıra basın.", "<strong>Devam etmek için entıra basın.</strong>")) : appendedText;

    if (window.dado3Sound) window.dado3Sound.play();
    storyStatus.innerHTML = finalHtml;
    storyStatus.blur();
    setTimeout(() => storyStatus.focus(), 10);
    
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
    window.clearStoryAnimations(); // Önceki sahneden kalanları temizle ve çalan sesleri kes

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
            window.wrongSound.volume(1.0);
            window.wrongSound.play();
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

    // Zamanlayıcıyı başlat (220 saniye)
    if (window.storyTimerIntervalId) clearInterval(window.storyTimerIntervalId);
    window.storyTimerValue = 220;
    
    window.storyTimerIntervalId = setInterval(() => {
        if (window.isStoryModeWon || (window.notesInPiano && window.notesInPiano.length >= window.MAX_NOTES)) {
            clearInterval(window.storyTimerIntervalId);
            return;
        }
        
        window.storyTimerValue--;
        
        if (window.storyTimerValue === 180) {
            if (window.announceToScreenReader) window.announceToScreenReader("3 dakika kaldı.");
        } else if (window.storyTimerValue === 120) {
            if (window.announceToScreenReader) window.announceToScreenReader("2 dakika kaldı.");
        } else if (window.storyTimerValue === 60) {
            if (window.announceToScreenReader) window.announceToScreenReader("1 dakika kaldı.");
        } else if (window.storyTimerValue === 30) {
            if (window.announceToScreenReader) window.announceToScreenReader("Son 30 saniye kaldı.");
        }
        
        if (window.storyTimerValue <= 30 && window.storyTimerValue > 0) {
            // Son 30 saniyede her saniye heyecan artırıcı sesi çal
            if (window.seconsSound) window.seconsSound.play();
        }
        
        if (window.storyTimerValue <= 0) {
            clearInterval(window.storyTimerIntervalId);
            window.quitStoryMode();
            
            if (window.wrongSound) window.wrongSound.play();
            if (window.announceToScreenReader) {
                window.announceToScreenReader("Süre doldu! Soğuktan donmak üzereyken kurtarma ekipleri seni buldu. Kayıp Notalar modunu tamamlayamadın. Ana menüye dönülüyor.", true);
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

    if (window.isStoryModeWon && key !== 'Enter') {
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
                let placedCount = window.notesInPiano.length;
                let remainingCount = window.MAX_NOTES - placedCount;
                
                let msg = `Harika! ${trNames[droppedNote]} notasını piyanoya yerleştirdiniz. Toplam ${placedCount} nota yerleştirdik, geriye ${remainingCount} nota kaldı. `;
                
                if (placedCount === window.MAX_NOTES) {
                    msg += "Bütün notalar piyanoya yerleştirildi. Oyunu kazanmak için Onay (Enter) tuşuna basın.";
                } else {
                    const expectedOrder = ['c', 'd', 'e', 'f', 'g', 'a', 'b'];
                    msg += `Sırada ${trNames[expectedOrder[placedCount]]} notası var. Kayıp notalar etrafta. Aramaya devam et.`;
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
                    window.hgfzZamanlayici.setTimeout(() => {
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
            if (window.isSoundPacksUnlockDialogWaitingForEnter) {
                window.isSoundPacksUnlockDialogWaitingForEnter = false;
                window.isGridWalkingPhase = false;
                window.inStoryMode = false;
                
                if (window.storyBGM && window.storyBGM.playing()) window.storyBGM.stop();
                if (window.switchMenu && window.storyMenu && window.mainMenu) {
                    window.switchMenu(window.storyMenu, window.mainMenu, 'main');
                }
                if (window.updateInstrumentBtnText) window.updateInstrumentBtnText();
                
                if (window.bgMusic && !window.bgMusic.playing()) {
                    window.bgMusic.play();
                }
                return;
            }

            if (window.isStoryModeFinishedWaitingForEnter || window.isStoryModeWon) {
                window.isStoryModeFinishedWaitingForEnter = false;
                if (window.storyWinTimeout) clearTimeout(window.storyWinTimeout);
                
                if (window.gameModes && window.gameModes.missing_notes) {
                    window.gameModes.missing_notes.completionCount += 1;
                    try { localStorage.setItem('hafizaGuvenModes', JSON.stringify(window.gameModes)); } catch(e){}
                }
                
                let easyCount = (window.gameModes && window.gameModes.easy) ? window.gameModes.easy.completionCount : 0;
                let mediumCount = (window.gameModes && window.gameModes.medium) ? window.gameModes.medium.completionCount : 0;
                let hardCount = (window.gameModes && window.gameModes.hard) ? window.gameModes.hard.completionCount : 0;
                let storyCount = (window.gameModes && window.gameModes.missing_notes) ? window.gameModes.missing_notes.completionCount : 0;
                let isPacksUnlocked = localStorage.getItem('hafizaGuvenSoundPacksUnlocked') === 'true';

                if (!isPacksUnlocked && easyCount >= 5 && mediumCount >= 5 && hardCount >= 5 && storyCount >= 1) {
                    localStorage.setItem('hafizaGuvenSoundPacksUnlocked', 'true');
                    window.isSoundPacksUnlockDialogWaitingForEnter = true;
                    
                    if (window.successSound) {
                        window.successSound.volume(0.8);
                        window.successSound.play();
                    }
                    if (window.applauseSound) window.applauseSound.play();
                    
                    let unlockMsg = "Tebrikler. Bütün seslerin hakimi olmayı başardığınız için size bir ödül olarak farklı ses paketlerinin kilidi açıldı. Bunları mağazadan satın alabilirsiniz. Keyifli oyunlar dileriz. Ana menüye dönmek için entıra basın.";
                    
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
                window.successSound.volume(0.8);
                window.successSound.play();
            }
            if (window.applauseSound) window.applauseSound.play();
            
            let totalTokens = parseInt(localStorage.getItem('hafizaGuvenTotalTokens')) || 0;
            let reward = 300;
            let eventMsg = "";
            if (window.isWeekendDoubleCoins && window.isWeekendDoubleCoins()) { reward *= 2; eventMsg = " (Çift Jeton Etkinliği!)"; }
            totalTokens += reward;
            try { localStorage.setItem('hafizaGuvenTotalTokens', totalTokens); } catch(e){}
            
            let winMsg = `Tebrikler! Tüm notaları sırasıyla topladın ve piyanoyu onardın. Kayıp Notalar modunu başarıyla tamamladın! Bu hikaye için ${reward} jeton kazandınız${eventMsg}. Toplam jetonunuz ${totalTokens}.`;
            if (window.announceToScreenReader) window.announceToScreenReader(winMsg, true);
            
            const storyStatus = document.getElementById('story-status-text');
            if (storyStatus) {
                storyStatus.innerHTML = winMsg;
                storyStatus.blur();
                setTimeout(() => storyStatus.focus(), 10);
            }
            
            window.storyWinTimeout = window.hgfzZamanlayici.setTimeout(() => {
                window.isStoryModeFinishedWaitingForEnter = true;
                if (window.announceToScreenReader) {
                    window.announceToScreenReader("Ana menüye dönmek için entıra basın.", true);
                }
                if (storyStatus) {
                    storyStatus.innerHTML += "<br><br>Ana menüye dönmek için entıra basın.";
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
            finalMsg = "Piyanodasın. ";
        }
        
        if (window.notesOnMap && window.notesOnMap[window.playerX]) {
            hasNoteOrPiano = true;
            const foundNote = window.notesOnMap[window.playerX];
            const trNames = { 'c': 'Do', 'd': 'Re', 'e': 'Mi', 'f': 'Fa', 'g': 'Sol', 'a': 'La', 'b': 'Si' };
            const noteName = trNames[foundNote];
            
            finalMsg += `Ayağına sert bir şey takıldı. Burada ${noteName} notası var!`;

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


