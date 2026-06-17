$ErrorActionPreference = "Stop"
$path = ".\js\ui.js"
$content = Get-Content $path -Raw -Encoding UTF8

$index = $content.IndexOf("// Achievement Modal Logic")
if ($index -ge 0) {
    $content = $content.Substring(0, $index)
}

$appendCode = @"
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
        let shareText = `Tebrikler! HafÄ±zana GÃ¼ven'de "` + achName + `" baÅŸarÄ±mÄ±nÄ± elde ettim! ğŸ†\n\nSen de benimle beraber bu baÅŸarÄ±yÄ± yakalamak istiyorsan, haydi sen de oyna!\n\nOyunu Oyna: ` + gameLink;
        
        let textElem = document.getElementById('achievement-modal-text');
        if (textElem) {
            textElem.textContent = `Tebrikler! "` + achName + `" baÅŸarÄ±mÄ±nÄ± elde ettiniz! Bunu arkadaÅŸlarÄ±nÄ±zla paylaÅŸabilirsiniz.`;
            textElem.focus();
        }
        
        if (btnAchCopy) {
            btnAchCopy.onclick = () => {
                navigator.clipboard.writeText(shareText).then(() => {
                    if (window.announceToScreenReader) window.announceToScreenReader("Mesaj kopyalandÄ±!");
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
"@

Set-Content -Path $path -Value ($content + $appendCode) -Encoding UTF8
Write-Host "Fixed ui.js!"
