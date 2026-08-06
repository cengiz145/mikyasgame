const fs = require('fs');

let content = fs.readFileSync('js/dialogue.js', 'utf8');

const newListener = `
// NVDA ve Klavye Ok Tuşları İçin Özel Navigasyon Sistemi
window.addEventListener('keydown', (e) => {
    if (!isDialogueActive) return;

    const validKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter'];
    if (!validKeys.includes(e.key)) return;

    // Sayfanın kaymasını veya menülerin tepki vermesini engelle
    e.preventDefault();
    e.stopPropagation();

    // Odaklanılabilir tüm öğeleri topla: 1. Baloncuklar, 2. Butonlar
    const bubbles = Array.from(document.querySelectorAll('#chat-history > div[role="document"]'));
    
    let actions = [];
    const btnNext = document.getElementById('btn-dialogue-next');
    if (btnNext && btnNext.style.display !== 'none' && !btnNext.classList.contains('hidden')) {
        actions.push(btnNext);
    } else {
        const choices = Array.from(document.querySelectorAll('#dialogue-choices button'));
        actions = actions.concat(choices);
    }

    const focusableItems = [...bubbles, ...actions];
    if (focusableItems.length === 0) return;

    let currentIndex = focusableItems.indexOf(document.activeElement);

    if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        if (currentIndex > 0) {
            focusableItems[currentIndex - 1].focus();
        } else if (currentIndex === -1) {
            // Hiçbir şeye odaklanılmamışsa en sondakine (butonlara) odaklan
            focusableItems[focusableItems.length - 1].focus();
        } else {
            // En üstteyse en alta geç
            focusableItems[focusableItems.length - 1].focus();
        }
    } else if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        if (currentIndex < focusableItems.length - 1 && currentIndex !== -1) {
            focusableItems[currentIndex + 1].focus();
        } else {
            // En alttaysa en üste (eski mesajlara) geç
            focusableItems[0].focus();
        }
    } else if (e.key === 'Enter') {
        // Eğer odaklanılan öğe bir butonsa (Seçenek veya Devam) onu tıkla
        if (document.activeElement.tagName === 'BUTTON') {
            document.activeElement.click();
        } else if (document.activeElement.getAttribute('role') === 'document') {
            // Eğer bir mesaj baloncuğunu okuyorken Enter'a basarsa ve sadece 'Devam Et' varsa onu tıkla
            if (actions.length === 1 && actions[0].id === 'btn-dialogue-next') {
                actions[0].click();
            }
        }
    }
}, true); // Yakalama (Capture) aşamasında diğer eventleri ezmek için
`;

// Sadece bir kez eklemek için kontrol
if (!content.includes('// NVDA ve Klavye Ok Tuşları İçin Özel Navigasyon Sistemi')) {
    fs.writeFileSync('js/dialogue.js', content + '\\n' + newListener, 'utf8');
    console.log("Dialogue navigation logic appended.");
} else {
    console.log("Navigation logic already exists.");
}
