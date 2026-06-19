
    if (btnCancel) {
        btnCancel.addEventListener('click', handleCancel);
        btnCancel.addEventListener('pointerdown', handleCancel);
        btnCancel.addEventListener('touchstart', handleCancel, {passive: false});
    }
});


// Achievement Modal Logic
document.addEventListener('DOMContentLoaded', () => {
    const achievementModal = document.getElementById('achievement-modal');
    const btnAchCopy = document.getElementById('btn-ach-copy');
    const btnAchWhatsapp = document.getElementById('btn-ach-whatsapp');
    const btnAchTelegram = document.getElementById('btn-ach-telegram');
    const btnAchClose = document.getElementById('btn-ach-close');

    if (achievementModal) {
        btnAchClose.addEventListener('click', () => {
            if (window.previousMenuBeforeAch) {
                window.switchMenu(achievementModal, window.previousMenuBeforeAch, window.previousMenuBeforeAchName || 'main');
            } else {
                window.switchMenu(achievementModal, window.mainMenu, 'main');
            }
        });
    }

        window.showAchievementModal = function(achName) {
        let gameLink = "https://mikyasstudio.com.tr/hafizanaguven.html";
        let shareText = "Tebrikler! Hafizana Guven'de " + achName + " basarimini elde ettim! \n\nSen de benimle beraber bu basariyi yakalamak istiyorsan, haydi sen de oyna!\n\nOyunu Oyna: " + gameLink;
        
        let textElem = document.getElementById('achievement-modal-text');
        if (textElem) {
            textElem.textContent = "Tebrikler! " + achName + " basarimini elde ettiniz! Bunu arkadaslarinizla paylasabilirsiniz.";
            textElem.focus();
        }
        
        if (btnAchCopy) {
            btnAchCopy.onclick = () => {
                navigator.clipboard.writeText(shareText).then(() => {
                    if (window.announceToScreenReader) window.announceToScreenReader("Mesaj kopyalandÃƒâ€Â±!");
                    if (window.correctSound) window.correctSound.play();
                });
            };
        }
        if (btnAchWhatsapp) {
            btnAchWhatsapp.onclick = () => {
                window.open("https://wa.me/?text=" + encodeURIComponent(shareText), '_blank');
            };
        }
        if (btnAchTelegram) {
            btnAchTelegram.onclick = () => {
                window.open("https://t.me/share/url?url=" + encodeURIComponent(gameLink) + "&text=" + encodeURIComponent(shareText), '_blank');
            };
        }
        
        window.previousMenuBeforeAch = document.querySelector('.menu-container[style*="display: flex"]');
        window.previousMenuBeforeAchName = window.currentActiveMenu;
        
        if (window.previousMenuBeforeAch) {
            window.switchMenu(window.previousMenuBeforeAch, achievementModal, 'achievement_modal');
        } else {
            window.switchMenu(window.mainMenu, achievementModal, 'achievement_modal');
        }
        
        if (window.modeUnlockSound) window.modeUnlockSound.play();
    };
});



