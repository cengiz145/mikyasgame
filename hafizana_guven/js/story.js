// story.js - Hikaye Modu, Yürüme Mekanikleri ve Kayıp Notalar

window.inStoryMode = false;
window.currentStoryIndex = 0;
window.isGridWalkingPhase = false;
window.stepIntervalId = null;
window.currentAutoWalkStep = 0;
window.isStoryModeWon = false;
window.isStoryModeFinishedWaitingForEnter = false;
window.isRhythmUnlockDialogWaitingForEnter = false;
window.isSoundPacksUnlockDialogWaitingForEnter = false;
window.storyWinAchievementsChecked = false;
window.currentStoryVoiceAudio = null;
window.storyVoicePausedByMenu = false;

window.stopStoryVoiceover = function () {
    window.storyVoicePausedByMenu = false;
    if (window.currentStoryVoiceAudio) {
        try {
            window.currentStoryVoiceAudio.onended = null;
            window.currentStoryVoiceAudio.onerror = null;
            window.currentStoryVoiceAudio.pause();
            window.currentStoryVoiceAudio.currentTime = 0;
        } catch (e) {}
        window.currentStoryVoiceAudio = null;
    }
};

window.getSfxScale = function () {
    let saved = localStorage.getItem('hafizaGuvenSfxVolume');
    if (saved !== null) {
        let parsed = parseInt(saved, 10);
        if (!isNaN(parsed)) return Math.max(0, Math.min(1, parsed / 100));
    }
    return 1.0;
};

window.getMusicScale = function () {
    let saved = localStorage.getItem('hafizaGuvenMusicVolume');
    if (saved !== null) {
        let parsed = parseInt(saved, 10);
        if (!isNaN(parsed)) return Math.max(0, Math.min(1, parsed / 100));
    }
    return 0.5;
};

function clearStoryTimeoutSafe(id) {
    if (!id) return;
    if (window.hgfzZamanlayici && window.hgfzZamanlayici.clearTimeout) {
        window.hgfzZamanlayici.clearTimeout(id);
    } else {
        clearTimeout(id);
    }
}

function clearStoryIntervalSafe(id) {
    if (!id) return;
    if (window.hgfzZamanlayici && window.hgfzZamanlayici.clearInterval) {
        window.hgfzZamanlayici.clearInterval(id);
    } else {
        clearInterval(id);
    }
}

window.clearStoryAnimations = function () {
    clearStoryTimeoutSafe(window.stepIntervalId);
    clearStoryIntervalSafe(window.storyAnimInterval1);
    clearStoryIntervalSafe(window.storyAnimInterval2);
    clearStoryIntervalSafe(window.storyAnimInterval3);
    clearStoryIntervalSafe(window.storyAnimInterval4);
    clearStoryIntervalSafe(window.storyAnimInterval5);
    clearStoryTimeoutSafe(window.storyAnimTimeout1);
    clearStoryTimeoutSafe(window.storyAnimTimeout2);
    clearStoryTimeoutSafe(window.storyAnimTimeout3);
    clearStoryTimeoutSafe(window.storyAnimTimeout4);
    clearStoryTimeoutSafe(window.storyAnimTimeout5);
    clearStoryTimeoutSafe(window.storyAnimTimeout6);
    clearStoryTimeoutSafe(window.storyAnimTimeout7);
    clearStoryTimeoutSafe(window.storyAnimTimeout8);
    clearStoryTimeoutSafe(window.storyWinTimeout);
    clearTimeout(window.storyEntryTimeout);

    window.stepIntervalId = null;

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

window.quitStoryMode = function () {
    const shouldCheckAch = window.isStoryModeWon && !window.storyWinAchievementsChecked;

    window.inStoryMode = false;
    window.isDialogPhase = false;
    window.isGridWalkingPhase = false;
    window.isStoryModeWon = false;
    window.isStoryModeFinishedWaitingForEnter = false;
    window.isRhythmUnlockDialogWaitingForEnter = false;
    window.isSoundPacksUnlockDialogWaitingForEnter = false;
    window.carryingNote = null;
    window.gameIsPaused = false;
    window.stopStoryVoiceover();

    // Zamanlayıcıyı temizle (oyun genelindeki diğer zamanlayıcıları bozmadan)
    if (window.storyTimerIntervalId) {
        clearInterval(window.storyTimerIntervalId);
        window.storyTimerIntervalId = null;
    }

    window.clearStoryAnimations();

    // Ortam ve geri sayım seslerini kes
    if (window.storyBGM && window.storyBGM.playing()) window.storyBGM.stop();
    if (window.mountainSound && window.mountainSound.playing()) window.mountainSound.stop();
    if (window.music272Sound && window.music272Sound.playing()) window.music272Sound.stop();
    if (window.house2Sound && window.house2Sound.playing()) window.house2Sound.stop();
    if (window.seconsSound && window.seconsSound.playing()) window.seconsSound.stop();
    if (window.successSound && window.successSound.playing()) window.successSound.stop();
    if (window.applauseSound && window.applauseSound.playing()) window.applauseSound.stop();

    if (window.updateMobileKeysVisibility) window.updateMobileKeysVisibility();

    if (shouldCheckAch) {
        window.storyWinAchievementsChecked = true;
        setTimeout(() => {
            if (window.checkAllAchievements) window.checkAllAchievements();
        }, 500);
    }
};

window.playerX = 1;
window.mapLength = 30;
window.pianoX = 0;
window.notesOnMap = {};
window.notesInPiano = [];
window.MAX_NOTES = 7;

window.playCurrentStoryDialog = function () {
    const storyStatus = document.getElementById('story-status-text');
    if (!storyStatus) return;

    if (!window.missingNotesDialogues || !window.missingNotesDialogues[window.currentStoryIndex]) return;

    window.stopStoryVoiceover();

    const sceneIdx = window.currentStoryIndex;
    let appendedText = window.missingNotesDialogues[sceneIdx];
    let formattedText = appendedText.replace(
        /(Devam etmek için (?:entıra|Enter'a|Enter tuşuna) basın\.|Hikaye sona erdi, oyuna başlamak için Enter tuşuna basın\.)/gi,
        "<strong>$1</strong>"
    );
    let finalHtml = window.localizeText ? window.localizeText(formattedText) : formattedText;
    let localizedPlain = window.localizeText ? window.localizeText(appendedText) : appendedText;
    const useVoiceover = localStorage.getItem('hafizaGuvenDisableStoryVoice') !== 'true';

    if (window.dado3Sound) {
        let sid = window.dado3Sound.play();
        window.dado3Sound.volume((useVoiceover ? 0.35 : 0.8) * window.getSfxScale(), sid);
    }
    storyStatus.innerHTML = finalHtml;

    if (useVoiceover && sceneIdx >= 0 && sceneIdx <= 16) {
        const padIdx = String(sceneIdx).padStart(2, '0');
        const voiceAudio = new window.Audio(`sounds/story/story_${padIdx}.mp3`);
        voiceAudio.volume = Math.max(0, Math.min(1, window.getSfxScale()));
        window.currentStoryVoiceAudio = voiceAudio;

        const fallbackToSR = () => {
            if (window.currentStoryVoiceAudio === voiceAudio) {
                window.currentStoryVoiceAudio = null;
            }
            if (window.announceToScreenReader) {
                window.announceToScreenReader(localizedPlain, true);
            }
        };

        voiceAudio.onerror = fallbackToSR;
        voiceAudio.onended = () => {
            if (window.currentStoryVoiceAudio === voiceAudio) {
                window.currentStoryVoiceAudio = null;
            }
            if (!window.inStoryMode || window.isGridWalkingPhase || window.currentStoryIndex !== sceneIdx) return;
            if (sceneIdx === 0 && window.announceToScreenReader) {
                const hint = window.localizeText ? window.localizeText("Devam etmek için Enter tuşuna basın.") : "Devam etmek için Enter tuşuna basın.";
                window.announceToScreenReader(hint, false);
            } else if (sceneIdx === 16 && window.announceToScreenReader) {
                const endHint = window.localizeText ? window.localizeText("Hikaye sona erdi, oyuna başlamak için Enter tuşuna basın.") : "Hikaye sona erdi, oyuna başlamak için Enter tuşuna basın.";
                window.announceToScreenReader(endHint, false);
            }
        };

        const p = voiceAudio.play();
        if (p !== undefined) {
            p.catch(() => fallbackToSR());
        }
    } else {
        if (window.announceToScreenReader) {
            window.announceToScreenReader(localizedPlain, true);
        }
    }
};

window.playAutomatedWalkingScene = function () {
    if (!window.inStoryMode) return;

    if (window.currentAutoWalkStep < 6) {
        if (window.snowStepSounds && window.snowStepSounds.length > 0) {
            const randomStep = window.snowStepSounds[Math.floor(Math.random() * window.snowStepSounds.length)];
            let sid = randomStep.play();
            randomStep.volume(0.85 * window.getSfxScale(), sid);
        }
        window.currentAutoWalkStep++;
        const setTimer = (window.hgfzZamanlayici && window.hgfzZamanlayici.setTimeout)
            ? window.hgfzZamanlayici.setTimeout.bind(window.hgfzZamanlayici)
            : setTimeout;
        window.stepIntervalId = setTimer(window.playAutomatedWalkingScene, 1000);
    }
};

window.triggerStoryAnimations = function (index) {
    window.clearStoryAnimations();
    const sfxScale = window.getSfxScale();
    const setTimer = (window.hgfzZamanlayici && window.hgfzZamanlayici.setTimeout)
        ? window.hgfzZamanlayici.setTimeout.bind(window.hgfzZamanlayici)
        : setTimeout;
    const setLoop = (window.hgfzZamanlayici && window.hgfzZamanlayici.setInterval)
        ? window.hgfzZamanlayici.setInterval.bind(window.hgfzZamanlayici)
        : setInterval;

    const useVoiceover = localStorage.getItem('hafizaGuvenDisableStoryVoice') !== 'true';

    if (index === 0) {
        let count = 0;
        const noteVolFactor = useVoiceover ? 0.32 : 0.8;
        const doorVolFactor = useVoiceover ? 0.45 : 1.0;
        window.storyAnimInterval1 = setLoop(() => {
            const keys = ['c', 'e', 'g', 'c', 'f', 'a', 'd', 'b', 'g'];
            const randomKey = keys[Math.floor(Math.random() * keys.length)];
            if (window.activeNotes && window.activeNotes[randomKey]) {
                let sndId = window.activeNotes[randomKey].play();
                window.activeNotes[randomKey].volume(noteVolFactor * sfxScale, sndId);
                window.activeNotes[randomKey].seek(0.045, sndId);
            }
            count++;
            if (count > 6) clearStoryIntervalSafe(window.storyAnimInterval1);
        }, 400);

        window.storyAnimTimeout1 = setTimer(() => {
            if (window.enterHouseSound) {
                let eid = window.enterHouseSound.play();
                window.enterHouseSound.volume(doorVolFactor * sfxScale, eid);
            }
            let stepCount = 0;
            window.storyAnimInterval2 = setLoop(() => {
                if (window.carpetStepSounds && window.carpetStepSounds.length > 0) {
                    let s = window.carpetStepSounds[Math.floor(Math.random() * window.carpetStepSounds.length)];
                    let sid = s.play();
                    s.volume(Math.min(doorVolFactor, 0.15 + (stepCount * 0.12)) * sfxScale, sid);
                }
                stepCount++;
                if (stepCount > 3) {
                    clearStoryIntervalSafe(window.storyAnimInterval2);
                    window.storyAnimTimeout2 = setTimer(() => {
                        if (window.doorCloseSound) {
                            let did = window.doorCloseSound.play();
                            window.doorCloseSound.rate(1.0, did);
                            window.doorCloseSound.volume(doorVolFactor * sfxScale, did);
                        }
                    }, 500);
                }
            }, 800);
        }, 1200);

    } else if (index === 7) {
        if (window.storyBGM) {
            let isMuted = localStorage.getItem('hafizaGuvenMusicMuted') === 'true';
            window.storyBGM.mute(isMuted);
            window.storyBGM.volume((useVoiceover ? 0.25 : 0.5) * window.getMusicScale());
            if (!window.storyBGM.playing()) window.storyBGM.play();
        }
        const playCrash = () => {
            if (window.glasshitSound) {
                let gid = window.glasshitSound.play();
                window.glasshitSound.volume(1.0 * sfxScale, gid);
            }
            if (window.wrongSound) {
                let wid = window.wrongSound.play();
                window.wrongSound.volume(0.85 * sfxScale, wid);
            }
        };
        if (useVoiceover) {
            window.storyAnimTimeout3 = setTimer(playCrash, 950);
        } else {
            playCrash();
        }
    } else if (index === 8) {
        window.storyAnimTimeout3 = setTimer(() => {
            if (window.activeNotes) {
                ['c', 'd', 'e'].forEach(k => {
                    if (window.activeNotes[k]) {
                        let nid = window.activeNotes[k].play();
                        window.activeNotes[k].volume(0.9 * sfxScale, nid);
                    }
                });
            }
        }, 50);
        window.storyAnimTimeout4 = setTimer(() => {
            if (window.doorCloseSound) {
                let sid = window.doorCloseSound.play();
                window.doorCloseSound.rate(1.5, sid);
                window.doorCloseSound.volume(0.6 * sfxScale, sid);
            }
        }, 200);
    } else if (index === 13) {
        let stepCount = 0;
        window.storyAnimInterval3 = setLoop(() => {
            if (window.carpetStepSounds && window.carpetStepSounds.length > 0) {
                let s = window.carpetStepSounds[Math.floor(Math.random() * window.carpetStepSounds.length)];
                let sid = s.play();
                s.volume(Math.max(0.1, 1.0 - (stepCount * 0.2)) * sfxScale, sid);
            }
            stepCount++;
            if (stepCount > 4) {
                clearStoryIntervalSafe(window.storyAnimInterval3);
                window.storyAnimTimeout5 = setTimer(() => {
                    if (window.doorCloseSound) {
                        let did = window.doorCloseSound.play();
                        window.doorCloseSound.rate(1.0, did);
                        window.doorCloseSound.volume(1.0 * sfxScale, did);
                    }
                }, 200);
            }
        }, 400);
    } else if (index === 14) {
        if (window.storyBGM && window.storyBGM.playing()) window.storyBGM.stop();
        if (window.enterHouseSound) {
            let eid = window.enterHouseSound.play();
            window.enterHouseSound.volume(1.0 * sfxScale, eid);
        }
        window.storyAnimTimeout6 = setTimer(() => {
            if (window.doorCloseSound) {
                let did = window.doorCloseSound.play();
                window.doorCloseSound.rate(1.0, did);
                window.doorCloseSound.volume(1.0 * sfxScale, did);
            }
        }, 1500);

        window.storyAnimTimeout7 = setTimer(() => {
            let stepCount = 0;
            window.storyAnimInterval4 = setLoop(() => {
                if (window.snowStepSounds && window.snowStepSounds.length > 0) {
                    let s = window.snowStepSounds[Math.floor(Math.random() * window.snowStepSounds.length)];
                    let sid = s.play();
                    s.volume(0.8 * sfxScale, sid);
                }
                stepCount++;
                if (stepCount > 4) clearStoryIntervalSafe(window.storyAnimInterval4);
            }, 800);
        }, 2000);
    } else if (index === 15) {
        if (window.correctSound) {
            let cid = window.correctSound.play();
            window.correctSound.volume(1.0 * sfxScale, cid);
        }
        window.storyAnimTimeout8 = setTimer(() => {
            const keys = ['g', 'e', 'c', 'f'];
            let kIdx = 0;
            window.storyAnimInterval5 = setLoop(() => {
                let note = keys[kIdx];
                if (window.activeNotes && window.activeNotes[note]) {
                    let nid = window.activeNotes[note].play();
                    window.activeNotes[note].volume(0.6 * sfxScale, nid);
                }
                kIdx++;
                if (kIdx >= keys.length) clearStoryIntervalSafe(window.storyAnimInterval5);
            }, 300);
        }, 1000);
    } else if (index === 16) {
        if (window.successSound) {
            let sid = window.successSound.play();
            window.successSound.volume(0.7 * sfxScale, sid);
        }
    }
};

window.startStoryTimer = function (initialSeconds) {
    if (window.storyTimerIntervalId) {
        clearInterval(window.storyTimerIntervalId);
        window.storyTimerIntervalId = null;
    }
    window.storyTimerValue = typeof initialSeconds === 'number' ? initialSeconds : 220;

    window.storyTimerIntervalId = setInterval(() => {
        if (window.gameIsPaused) return;

        if (!window.inStoryMode || window.isStoryModeWon || (window.notesInPiano && window.notesInPiano.length >= window.MAX_NOTES)) {
            clearInterval(window.storyTimerIntervalId);
            window.storyTimerIntervalId = null;
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
            if (window.seconsSound) {
                let sid = window.seconsSound.play();
                window.seconsSound.volume(1.0 * window.getSfxScale(), sid);
            }
        }

        if (window.storyTimerValue <= 0) {
            clearInterval(window.storyTimerIntervalId);
            window.storyTimerIntervalId = null;
            window.quitStoryMode();

            if (window.wrongSound) {
                let wid = window.wrongSound.play();
                window.wrongSound.volume(1.0 * window.getSfxScale(), wid);
            }
            if (window.announceToScreenReader) {
                window.announceToScreenReader("Süre doldu! Soğuktan donmak üzereyken kurtarma ekipleri seni buldu. Kayıp Notalar modunu tamamlayamadın. Ana menüye dönülüyor.", true);
            }

            let currentContainer = window.storyMenu;
            if (window.switchMenu && currentContainer && window.mainMenu) {
                window.switchMenu(currentContainer, window.mainMenu, 'main');
            }

            if (window.bgMusic && !window.bgMusic.playing()) {
                window.bgMusic.play();
            }
        }
    }, 1000);
};

window.initializeMissingNotesMap = function () {
    window.stopStoryVoiceover();
    window.notesInPiano = [];
    window.carryingNote = null;
    window.isStoryModeWon = false;
    window.isStoryModeFinishedWaitingForEnter = false;
    window.isRhythmUnlockDialogWaitingForEnter = false;
    window.isSoundPacksUnlockDialogWaitingForEnter = false;
    window.storyWinAchievementsChecked = false;
    window.storyStartTime = Date.now();

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

    const storyStatus = document.getElementById('story-status-text');
    let skipStoryDialogues = localStorage.getItem('hafizaGuvenDisableStoryMode') === 'true';
    let walkHint = window.playerX >= window.mapLength
        ? "Haritanın en sağ ucundasın; sol ok tuşuyla karlı zeminde yürüyebilirsin."
        : "Sağ ve sol ok tuşlarıyla karlı zeminde yürüyebilirsin.";

    let introMsg = skipStoryDialogues
        ? `Dışarıdasın. X konumun: ${window.playerX}. ${walkHint} Konum için C, süre için T, notayı almak ve X: 0'daki piyanoya bırakmak için F tuşunu kullan.`
        : `Dışarıdasın. Kar üstünde rastgele bir noktaya ışınlandın. X konumun: ${window.playerX}. ${walkHint} Piyano X: 0 konumunda. Etrafta rastgele yerleştirilmiş ${window.MAX_NOTES} adet nota var. Bir nota bulduğunda F tuşuna basarak alabilir, C ile konumunu, T ile kalan süreni öğrenebilirsin. Tüm notaları sırasıyla (Do, Re, Mi, Fa, Sol, La, Si) piyanoya getirmelisin.`;

    if (storyStatus) {
        storyStatus.innerHTML = window.localizeText ? window.localizeText(introMsg) : introMsg;
    }

    if (window.announceToScreenReader) {
        window.announceToScreenReader(introMsg, true);
    }

    if (window.mountainSound) {
        let isMuted = localStorage.getItem('hafizaGuvenMusicMuted') === 'true';
        window.mountainSound.loop(true);
        window.mountainSound.mute(isMuted);
        if (!window.mountainSound.playing()) {
            let mid = window.mountainSound.play();
            window.mountainSound.volume(0.4 * window.getMusicScale(), mid);
        }
    }

    window.startStoryTimer(220);
};

window.finishStoryAndReturnMain = function () {
    const needsAchCheck = !window.storyWinAchievementsChecked;
    window.storyWinAchievementsChecked = true;

    window.quitStoryMode();

    let currentContainer = window.storyMenu;
    if (window.switchMenu && currentContainer && window.mainMenu) {
        window.switchMenu(currentContainer, window.mainMenu, 'main');
    }
    if (window.updateInstrumentBtnText) {
        window.updateInstrumentBtnText();
    }

    if (window.bgMusic && !window.bgMusic.playing()) {
        window.bgMusic.play();
    }

    if (needsAchCheck) {
        setTimeout(() => {
            if (window.checkAllAchievements) window.checkAllAchievements();
        }, 500);
    }
};

window.handleStoryWalking = function (key) {
    if (!window.isGridWalkingPhase) return;
    if (window.gameIsPaused) return;

    if ((window.isStoryModeWon || (window.notesInPiano && window.notesInPiano.length >= window.MAX_NOTES)) && key !== 'Enter') {
        return;
    }

    const sfxScale = window.getSfxScale();
    const setTimer = (window.hgfzZamanlayici && window.hgfzZamanlayici.setTimeout)
        ? window.hgfzZamanlayici.setTimeout.bind(window.hgfzZamanlayici)
        : setTimeout;

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
            if (window.announceToScreenReader) window.announceToScreenReader("Haritanın sonundasın. Daha fazla sağa gidemezsin.", false);
        }
    } else if (key === 'ArrowLeft') {
        if (window.playerX > 0) {
            window.playerX--;
            playRandomSnowStep();
            updateStoryStatus();
        } else {
            if (window.announceToScreenReader) window.announceToScreenReader("Piyanodasın. Daha fazla sola gidemezsin.", false);
        }
    } else if (key === 'ArrowUp' || key === 'ArrowDown') {
        window.handleStoryWalking('c');
    } else if (key.toLowerCase() === 'f') {
        if (window.playerX === window.pianoX) {
            if (window.carryingNote) {
                window.stopStoryVoiceover();
                window.notesInPiano.push(window.carryingNote);
                let droppedNote = window.carryingNote;
                window.carryingNote = null;

                if (window.correctSound) {
                    let cid = window.correctSound.play();
                    window.correctSound.volume(1.0 * sfxScale, cid);
                }
                const trNames = { 'c': 'Do', 'd': 'Re', 'e': 'Mi', 'f': 'Fa', 'g': 'Sol', 'a': 'La', 'b': 'Si' };
                let placedCount = window.notesInPiano.length;
                let remainingCount = window.MAX_NOTES - placedCount;

                if (placedCount === window.MAX_NOTES) {
                    setTimer(() => {
                        if (window.handleStoryWalking) window.handleStoryWalking('Enter');
                    }, 500);
                } else {
                    let msg = `Harika! ${trNames[droppedNote]} notasını piyanoya yerleştirdiniz. Toplam ${placedCount} nota yerleştirdik, geriye ${remainingCount} nota kaldı. `;
                    const expectedOrder = ['c', 'd', 'e', 'f', 'g', 'a', 'b'];
                    msg += `Sırada ${trNames[expectedOrder[placedCount]]} notası var. Kayıp notalar etrafta. Aramaya devam et.`;
                    const storyStatus = document.getElementById('story-status-text');
                    if (storyStatus) storyStatus.innerHTML = msg;
                    if (window.announceToScreenReader) window.announceToScreenReader(msg);
                }
            } else {
                if (window.notesInPiano.length === window.MAX_NOTES) {
                    if (window.announceToScreenReader) window.announceToScreenReader("Piyano zaten tamamlandı. Onay tuşuna basarak bitirebilirsin.");
                } else {
                    const trNames = { 'c': 'Do', 'd': 'Re', 'e': 'Mi', 'f': 'Fa', 'g': 'Sol', 'a': 'La', 'b': 'Si' };
                    const expectedOrder = ['c', 'd', 'e', 'f', 'g', 'a', 'b'];
                    const nextNote = trNames[expectedOrder[window.notesInPiano.length]];
                    if (window.announceToScreenReader) window.announceToScreenReader(`Piyanodasın. Şu an piyanoda ${window.notesInPiano.length} nota var. Sıradaki aranan nota: ${nextNote}.`);
                }
            }
        } else {
            if (window.notesOnMap[window.playerX]) {
                if (window.carryingNote) {
                    if (window.wrongSound) {
                        let wid = window.wrongSound.play();
                        window.wrongSound.volume(1.0 * sfxScale, wid);
                    }
                    if (window.announceToScreenReader) window.announceToScreenReader("Zaten elinizde bir nota var! Önce onu X: 0 konumundaki piyanoya bırakmalısınız.");
                    return;
                }
                const foundNote = window.notesOnMap[window.playerX];
                const expectedOrder = ['c', 'd', 'e', 'f', 'g', 'a', 'b'];
                if (window.notesInPiano.length === expectedOrder.indexOf(foundNote)) {
                    window.carryingNote = foundNote;
                    delete window.notesOnMap[window.playerX];

                    if (window.activeNotes && window.activeNotes[foundNote]) {
                        let nid = window.activeNotes[foundNote].play();
                        window.activeNotes[foundNote].volume(1.0 * sfxScale, nid);
                    }
                    if (window.correctSound) {
                        let cid = window.correctSound.play();
                        window.correctSound.volume(1.0 * sfxScale, cid);
                    }

                    let baseMsg = "Notayı yerden aldınız. Şimdi X: 0 konumundaki piyanoya bırakmanız gerekiyor.";
                    let disableMotivation = localStorage.getItem('hafizaGuvenDisableMotivation') === 'true';
                    let useVoiceover = localStorage.getItem('hafizaGuvenDisableStoryVoice') !== 'true';
                    const noteIdx = window.notesInPiano.length;
                    if (!disableMotivation && window.missingNotesHappyMessages && window.missingNotesHappyMessages.length > noteIdx) {
                        baseMsg = window.missingNotesHappyMessages[noteIdx] + " Şimdi onu X: 0 konumundaki piyanoya götürmelisin.";
                    }

                    const storyStatus = document.getElementById('story-status-text');
                    if (storyStatus) storyStatus.innerHTML = baseMsg;

                    if (!disableMotivation && useVoiceover && noteIdx >= 0 && noteIdx < 10) {
                        window.stopStoryVoiceover();
                        const padNote = String(noteIdx).padStart(2, '0');
                        const happyAudio = new window.Audio(`sounds/story/happy_${padNote}.mp3`);
                        happyAudio.volume = Math.max(0, Math.min(1, sfxScale));
                        window.currentStoryVoiceAudio = happyAudio;

                        happyAudio.onerror = () => {
                            if (window.currentStoryVoiceAudio === happyAudio) window.currentStoryVoiceAudio = null;
                            if (window.announceToScreenReader) window.announceToScreenReader(baseMsg);
                        };
                        happyAudio.onended = () => {
                            if (window.currentStoryVoiceAudio === happyAudio) window.currentStoryVoiceAudio = null;
                            if (window.inStoryMode && window.isGridWalkingPhase && window.carryingNote === foundNote && window.announceToScreenReader) {
                                window.announceToScreenReader("Şimdi onu X: 0 konumundaki piyanoya götürmelisin.", false);
                            }
                        };
                        const hp = happyAudio.play();
                        if (hp !== undefined) {
                            hp.catch(() => {
                                if (window.currentStoryVoiceAudio === happyAudio) window.currentStoryVoiceAudio = null;
                                if (window.announceToScreenReader) window.announceToScreenReader(baseMsg);
                            });
                        }
                    } else {
                        if (window.announceToScreenReader) window.announceToScreenReader(baseMsg);
                    }

                } else {
                    if (window.activeNotes && window.activeNotes[foundNote]) {
                        let nid = window.activeNotes[foundNote].play();
                        window.activeNotes[foundNote].volume(1.0 * sfxScale, nid);
                    }
                    const trNames = { 'c': 'Do', 'd': 'Re', 'e': 'Mi', 'f': 'Fa', 'g': 'Sol', 'a': 'La', 'b': 'Si' };
                    const foundName = trNames[foundNote];
                    const neededName = trNames[expectedOrder[window.notesInPiano.length]];
                    setTimer(() => {
                        if (window.wrongSound) {
                            let wid = window.wrongSound.play();
                            window.wrongSound.volume(1.0 * sfxScale, wid);
                        }
                        if (window.announceToScreenReader) window.announceToScreenReader(`Burada ${foundName} notası var ama sırası değil! Önce ${neededName} notasını bulmalısınız.`);
                    }, 400);
                }
            } else {
                if (window.wrongSound) {
                    let wid = window.wrongSound.play();
                    window.wrongSound.volume(1.0 * sfxScale, wid);
                }
                if (window.announceToScreenReader) window.announceToScreenReader("Burada hiçbir şey yok. Aramaya devam et.");
            }
        }
    } else if (key.toLowerCase() === 'c') {
        const trNames = { 'c': 'Do', 'd': 'Re', 'e': 'Mi', 'f': 'Fa', 'g': 'Sol', 'a': 'La', 'b': 'Si' };
        const expectedOrder = ['c', 'd', 'e', 'f', 'g', 'a', 'b'];
        let msg = `X Konumunuz: ${window.playerX}. `;
        if (window.carryingNote) {
            msg += `Elinizde ${trNames[window.carryingNote]} notası var. Onu X: 0 konumundaki piyanoya götürmelisiniz. `;
        }
        if (window.playerX === window.pianoX) {
            msg += "Şu an piyanodasın. ";
            if (window.notesInPiano.length === window.MAX_NOTES) {
                msg += "Bütün notalar piyanoya yerleştirildi. Oyunu kazanmak için entıra basın.";
            } else {
                const nextNote = trNames[expectedOrder[window.notesInPiano.length]];
                msg += `Piyanodaki nota sayısı: ${window.notesInPiano.length} / ${window.MAX_NOTES}. Sıradaki aranan nota: ${nextNote}.`;
            }
        } else if (window.notesOnMap[window.playerX]) {
            const noteName = trNames[window.notesOnMap[window.playerX]];
            msg += `Ayağına sert bir şey takıldı. Burada ${noteName} notası var! Almak için F tuşuna bas.`;
        } else {
            msg += "Burası karlı boş bir alan.";
        }

        const storyStatus = document.getElementById('story-status-text');
        if (storyStatus) {
            storyStatus.innerHTML = window.localizeText ? window.localizeText(msg) : msg;
        }
        if (window.announceToScreenReader) window.announceToScreenReader(msg, false);
    } else if (key.toLowerCase() === 't') {
        const displayTime = window.storyTimerValue < 0 ? 0 : window.storyTimerValue;
        let msg = `Kalan süre: ${displayTime} saniye.`;

        const storyStatus = document.getElementById('story-status-text');
        if (storyStatus) {
            storyStatus.innerHTML = msg;
        }
        if (window.announceToScreenReader) window.announceToScreenReader(msg, true);
    } else if (key === 'Enter') {
        if (window.notesInPiano.length === window.MAX_NOTES && !window.carryingNote) {
            if (window.isStoryModeWon && !window.isStoryModeFinishedWaitingForEnter && !window.isRhythmUnlockDialogWaitingForEnter && !window.isSoundPacksUnlockDialogWaitingForEnter) return;

            if (window.isSoundPacksUnlockDialogWaitingForEnter) {
                window.isSoundPacksUnlockDialogWaitingForEnter = false;
                window.finishStoryAndReturnMain();
                return;
            }

            if (window.isRhythmUnlockDialogWaitingForEnter) {
                window.isRhythmUnlockDialogWaitingForEnter = false;
                window.isSoundPacksUnlockDialogWaitingForEnter = true;

                if (window.successSound) {
                    let sid2 = window.successSound.play();
                    window.successSound.volume(0.8 * sfxScale, sid2);
                }
                if (window.applauseSound) {
                    let aid = window.applauseSound.play();
                    window.applauseSound.volume(0.8 * sfxScale, aid);
                }

                let packsMsg = "Ayrıca harika bir haberimiz daha var! Artık diğer ses paketlerini de oynayabileceksiniz. Tüm enstrümanları seçebilme seçeneği ana menüye eklendi ve mağazada yeni enstrüman paketleri ortaya çıktı! Ana menüye dönmek için entıra basın.";

                const storyStatus = document.getElementById('story-status-text');
                if (storyStatus) storyStatus.innerHTML = window.localizeText ? window.localizeText(packsMsg) : packsMsg;

                if (window.announceToScreenReader) {
                    window.announceToScreenReader(packsMsg);
                }
                return;
            }

            if (window.isStoryModeFinishedWaitingForEnter) {
                window.isStoryModeFinishedWaitingForEnter = false;
                clearStoryTimeoutSafe(window.storyWinTimeout);

                let firstCelebrationDone = localStorage.getItem('hafizaGuvenStoryFirstWinCelebrated') === 'true';

                if (!firstCelebrationDone) {
                    localStorage.setItem('hafizaGuvenStoryFirstWinCelebrated', 'true');
                    localStorage.setItem('hafizaGuvenSoundPacksUnlocked', 'true');
                    window.isRhythmUnlockDialogWaitingForEnter = true;

                    if (window.successSound) {
                        let sid2 = window.successSound.play();
                        window.successSound.volume(0.8 * sfxScale, sid2);
                    }
                    if (window.applauseSound) {
                        let aid = window.applauseSound.play();
                        window.applauseSound.volume(0.8 * sfxScale, aid);
                    }

                    let unlockMsg = "Tebrikler. Kayıp Notalar modunu tamamladınız ve Ritim Avcısı oyun modunu açtınız! İletişim kutusunu geçmek için entıra basın.";

                    const storyStatus = document.getElementById('story-status-text');
                    if (storyStatus) storyStatus.innerHTML = window.localizeText ? window.localizeText(unlockMsg) : unlockMsg;

                    if (window.announceToScreenReader) {
                        window.announceToScreenReader(unlockMsg);
                    }
                    return;
                }

                window.finishStoryAndReturnMain();
                return;
            }

            // Zafer anı: İlerlemeyi, en iyi süreyi, jetonu ve XP'yi anında kaydet!
            window.isStoryModeWon = true;
            window.isDialogPhase = false;

            if (window.storyTimerIntervalId) {
                clearInterval(window.storyTimerIntervalId);
                window.storyTimerIntervalId = null;
            }

            if (window.mountainSound && window.mountainSound.playing()) window.mountainSound.stop();
            if (window.music272Sound && window.music272Sound.playing()) window.music272Sound.stop();
            if (window.seconsSound && window.seconsSound.playing()) window.seconsSound.stop();

            if (window.successSound) {
                let sid3 = window.successSound.play();
                window.successSound.volume(0.8 * sfxScale, sid3);
            }
            if (window.applauseSound) {
                let aid = window.applauseSound.play();
                window.applauseSound.volume(0.8 * sfxScale, aid);
            }

            if (window.gameModes && window.gameModes.missing_notes) {
                window.gameModes.missing_notes.completionCount += 1;
                if (window.gameModes.rhythm_mode) {
                    window.gameModes.rhythm_mode.isUnlocked = true;
                }
                try { localStorage.setItem('hafizaGuvenModes', JSON.stringify(window.gameModes)); } catch (e) {}
            }

            let elapsedSec = Math.max(1, 220 - (window.storyTimerValue || 0));
            let prevBest = parseInt(localStorage.getItem('hafizaGuvenStoryBestTime'), 10);
            if (isNaN(prevBest) || prevBest <= 0 || elapsedSec < prevBest) {
                try { localStorage.setItem('hafizaGuvenStoryBestTime', String(elapsedSec)); } catch (e) {}
            }

            let totalTokens = parseInt(localStorage.getItem('hafizaGuvenTotalTokens'), 10) || 0;
            let reward = 300;
            let eventMsg = "";
            if (window.isWeekendDoubleCoins && window.isWeekendDoubleCoins()) {
                reward *= 2;
                eventMsg = " (Çift Jeton Etkinliği!)";
            }
            totalTokens += reward;
            try { localStorage.setItem('hafizaGuvenTotalTokens', totalTokens); } catch (e) {}

            if (window.addXP) {
                window.addXP(75);
            }

            if (window.updateMobileKeysVisibility) {
                window.updateMobileKeysVisibility();
            }

            let winMsg = `Tebrikler! Tüm notaları sırasıyla topladın ve piyanoyu ${elapsedSec} saniyede onardın. Kayıp Notalar modunu başarıyla tamamladın! Bu hikaye için ${reward} jeton kazandınız${eventMsg}. Toplam jetonunuz ${totalTokens}.`;
            if (window.announceToScreenReader) window.announceToScreenReader(winMsg, true);

            const storyStatus = document.getElementById('story-status-text');
            if (storyStatus) {
                storyStatus.innerHTML = winMsg;
            }

            window.storyWinTimeout = setTimer(() => {
                window.isStoryModeFinishedWaitingForEnter = true;
                const promptText = "Ana menüye dönmek için entıra basın.";
                if (window.announceToScreenReader) {
                    window.announceToScreenReader(promptText, true);
                }
                if (storyStatus) {
                    const localizedPrompt = window.localizeText ? window.localizeText(promptText) : promptText;
                    storyStatus.innerHTML += "<br><br><strong>" + localizedPrompt + "</strong>";
                }
            }, 3000);
        }
    }

    function playRandomSnowStep() {
        if (window.snowStepSounds && window.snowStepSounds.length > 0) {
            const s = window.snowStepSounds[Math.floor(Math.random() * window.snowStepSounds.length)];
            let sid = s.play();
            s.volume(1.0 * window.getSfxScale(), sid);
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

            finalMsg += `Ayağına sert bir şey takıldı. Burada ${noteName} notası var! Almak için F tuşuna bas.`;

            if (window.activeNotes && window.activeNotes[foundNote]) {
                let nid = window.activeNotes[foundNote].play();
                window.activeNotes[foundNote].volume(1.0 * window.getSfxScale(), nid);
            }
        }

        if (hasNoteOrPiano) {
            storyStatus.innerHTML = finalMsg;
            if (window.announceToScreenReader) window.announceToScreenReader(finalMsg, false);
        } else {
            storyStatus.innerHTML = `X Konumu: ${window.playerX}`;
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    const storyStatus = document.getElementById('story-status-text');
    if (storyStatus) {
        let lastClickTime = 0;
        const handleStoryTextClick = () => {
            const now = Date.now();
            if (now - lastClickTime < 300) return;
            lastClickTime = now;

            if (window.inStoryMode && !window.isGridWalkingPhase) {
                const enterEvent = new KeyboardEvent('keydown', {
                    key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true
                });
                document.dispatchEvent(enterEvent);
            } else if (window.inStoryMode && window.isGridWalkingPhase) {
                if (window.isStoryModeWon) {
                    if (window.handleStoryWalking) window.handleStoryWalking('Enter');
                } else {
                    if (window.handleStoryWalking) window.handleStoryWalking('c');
                }
            }
        };
        storyStatus.addEventListener('click', handleStoryTextClick);
    }
});

document.addEventListener('touchstart', (e) => {
    if (e.touches && e.touches.length === 2) {
        if (window.inStoryMode && window.isGridWalkingPhase && !window.isStoryModeWon) {
            e.preventDefault();
            if (window.handleStoryWalking) window.handleStoryWalking('f');
        }
    }
}, { passive: false });
