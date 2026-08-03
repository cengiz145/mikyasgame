// İletişim Kutusu (Chat) Sistemi

let dialogueQueue = [];
let onDialogueComplete = null;
let isDialogueActive = false;

// Dışarıdan çağrılacak ana fonksiyon
// messages formatı: [{sender: "Başkan", text: "Hoşgeldin..."}, ...]
function showDialogue(messages, onCompleteCallback) {
    if (!messages || messages.length === 0) {
        if (onCompleteCallback) onCompleteCallback();
        return;
    }

    dialogueQueue = [...messages]; // Kopyala
    onDialogueComplete = onCompleteCallback;
    isDialogueActive = true;

    // Arayüzü göster
    const overlay = document.getElementById('dialogue-overlay');
    overlay.style.display = 'flex'; if(overlay) { let title = overlay.querySelector('h1, h2'); if(title) title.focus(); else overlay.focus(); };
    overlay.setAttribute('aria-modal', 'true');
    
    // Geçmişi temizle
    const chatHistory = document.getElementById('chat-history');
    if (chatHistory) {
        chatHistory.innerHTML = '';
        chatHistory.setAttribute('aria-live', 'polite'); // NVDA için
    }
    
    // Klavye odağını iletişim kutusuna hapset
    const btnNext = document.getElementById('btn-dialogue-next');
    if(btnNext) btnNext.focus();

    // İlk mesajı bas
    renderNextDialogue();
}

function appendBubble(sender, text, isUser) {
    const chatHistory = document.getElementById('chat-history');
    if (!chatHistory) return;

    const bubbleContainer = document.createElement('div');
    bubbleContainer.style.display = 'flex'; if(bubbleContainer) { let title = bubbleContainer.querySelector('h1, h2'); if(title) title.focus(); else bubbleContainer.focus(); };
    bubbleContainer.style.flexDirection = 'column';
    bubbleContainer.style.alignItems = isUser ? 'flex-end' : 'flex-start';
    bubbleContainer.style.animation = 'fadeInUp 0.3s ease forwards';
    bubbleContainer.style.marginBottom = '10px';
    // Erişilebilirlik için
    bubbleContainer.tabIndex = 0;
    bubbleContainer.setAttribute('role', 'document');
    bubbleContainer.setAttribute('aria-label', `${sender} mesajı: ${text}`);
    
    const senderName = document.createElement('span');
    senderName.style.color = isUser ? '#bdc3c7' : '#f1c40f';
    senderName.style.fontSize = '0.85rem';
    senderName.style.marginBottom = '4px';
    senderName.style.marginLeft = '10px';
    senderName.style.marginRight = '10px';
    senderName.style.fontWeight = 'bold';
    senderName.setAttribute('aria-hidden', 'true'); // Container'da okunduğu için bunu gizle
    senderName.innerText = sender;

    const bubble = document.createElement('div');
    bubble.style.padding = '12px 18px';
    bubble.style.borderRadius = '20px';
    bubble.style.maxWidth = '85%';
    bubble.style.fontSize = '1.05rem';
    bubble.style.lineHeight = '1.4';
    bubble.style.color = 'white';
    bubble.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
    bubble.setAttribute('aria-hidden', 'true'); // Container okuyor
    
    if (isUser) {
        bubble.style.background = '#27ae60'; // Yeşil (Kullanıcı)
        bubble.style.borderBottomRightRadius = '5px';
    } else {
        bubble.style.background = '#34495e'; // Koyu Mavi (NPC)
        bubble.style.borderBottomLeftRadius = '5px';
    }
    
    bubble.innerText = text;
    
    bubbleContainer.appendChild(senderName);
    bubbleContainer.appendChild(bubble);
    chatHistory.appendChild(bubbleContainer);
    
    // Auto scroll
    chatHistory.scrollTop = chatHistory.scrollHeight;
}

function renderNextDialogue() {
    if (dialogueQueue.length === 0) {
        closeDialogue();
        return;
    }

    const currentMessage = dialogueQueue.shift();
    const btnNext = document.getElementById('btn-dialogue-next');
    const choicesContainer = document.getElementById('dialogue-choices');

    // Baloncuğu ekle
    const isUserMessage = (currentMessage.sender === "Sen" || currentMessage.sender === "Ben" || currentMessage.sender === "Menajeriniz" || currentMessage.isUser);
    appendBubble(currentMessage.sender, currentMessage.text, isUserMessage);

    // NVDA ile seslendir
    if(typeof speak === 'function') {
        speak(`${currentMessage.sender} diyor ki: ${currentMessage.text}`);
    }

    // Seçenekleri Temizle
    choicesContainer.innerHTML = '';

    if (currentMessage.choices && currentMessage.choices.length > 0) {
        btnNext.style.display = 'none'; // Normal devam tuşunu gizle
        
        currentMessage.choices.forEach((choice, index) => {
            const btn = document.createElement('button');
            btn.className = 'menu-button';
            btn.style.width = '100%';
            btn.style.textAlign = 'left';
            btn.style.padding = '10px 15px';
            btn.style.fontSize = '1rem';
            btn.style.background = 'rgba(255,255,255,0.1)';
            btn.style.border = '1px solid rgba(255,255,255,0.2)';
            
            // Erişilebilirlik: Seçeneği NVDA'ya okutmak için aria-label ekle
            btn.setAttribute('aria-label', `Seçenek ${index + 1}: ${choice.text}`);
            btn.innerText = "➤ " + choice.text;
            
            btn.onclick = () => {
                if(typeof playSound === 'function' && typeof selectSound !== 'undefined') playSound(selectSound);
                
                // Seçilen cevabı baloncuk olarak sağa ekle
                appendBubble("Sen", choice.text, true);
                
                // NVDA'ya verdiğin cevabı söyle
                if(typeof speak === 'function') {
                    speak(`Sen diyorsun ki: ${choice.text}`);
                }
                
                // Seçenekleri temizle ki tekrar basılamasın
                choicesContainer.innerHTML = '';
                
                // Küçük bir gecikme ile (gerçekçilik) işleme devam et
                setTimeout(() => {
                    if (choice.onSelect) {
                        choice.onSelect();
                    } else {
                        renderNextDialogue();
                    }
                }, 500);
            };
            choicesContainer.appendChild(btn);
        });

        // İlk seçeneğe odaklan
        setTimeout(() => {
            if(choicesContainer.children.length > 0) choicesContainer.children[0].focus();
        }, 50);

    } else {
        btnNext.style.display = 'block'; // Normal devam tuşunu göster
        setTimeout(() => {
            btnNext.focus();
        }, 50);
    }
}

function closeDialogue() {
    const overlay = document.getElementById('dialogue-overlay');
    if (overlay) {
        overlay.style.display = 'none';
        overlay.removeAttribute('aria-modal');
    }
    isDialogueActive = false;

    if (onDialogueComplete) {
        onDialogueComplete();
        onDialogueComplete = null;
    }
}

// Buton tetikleyicisi
window.addEventListener('DOMContentLoaded', () => {
    const btnNext = document.getElementById('btn-dialogue-next');
    if (btnNext) {
        btnNext.addEventListener('click', () => {
            if(typeof playSound === 'function' && typeof selectSound !== 'undefined') playSound(selectSound);
            renderNextDialogue();
        });
    }
    
    // CSS Animasyonu ekleyelim (Fade in up)
    const style = document.createElement('style');
    style.innerHTML = `
        @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        /* Odaklanılan chat baloncuğunu belirginleştir (erişilebilirlik) */
        #chat-history div:focus {
            outline: 2px solid #f1c40f;
            outline-offset: 2px;
        }
    `;
    document.head.appendChild(style);
});

// NVDA ve Klavye Ok Tuşları İçin Özel Navigasyon Sistemi
window.addEventListener('keydown', (e) => {
    if (!isDialogueActive) return;

    // TAB TUŞUNU TAMAMEN İPTAL ET (Kullanıcı talebi)
    if (e.key === 'Tab') {
        e.preventDefault();
        return;
    }

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
    }
    
    const choices = Array.from(document.querySelectorAll('#dialogue-choices button'));
    actions = actions.concat(choices);

    const focusables = bubbles.concat(actions);
    if (focusables.length === 0) return;

    let currentIndex = focusables.indexOf(document.activeElement);

    if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        if (currentIndex === -1) currentIndex = focusables.length;
        let nextIndex = currentIndex - 1;
        if (nextIndex < 0) nextIndex = focusables.length - 1;
        focusables[nextIndex].focus();
    } else if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        let nextIndex = currentIndex + 1;
        if (nextIndex >= focusables.length) nextIndex = 0;
        focusables[nextIndex].focus();
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
