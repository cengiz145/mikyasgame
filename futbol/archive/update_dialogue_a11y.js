const fs = require('fs');

const content = `// İletişim Kutusu (Chat) Sistemi

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
    overlay.style.display = 'flex';
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
    bubbleContainer.style.display = 'flex';
    bubbleContainer.style.flexDirection = 'column';
    bubbleContainer.style.alignItems = isUser ? 'flex-end' : 'flex-start';
    bubbleContainer.style.animation = 'fadeInUp 0.3s ease forwards';
    bubbleContainer.style.marginBottom = '10px';
    // Erişilebilirlik için
    bubbleContainer.tabIndex = 0;
    bubbleContainer.setAttribute('role', 'document');
    bubbleContainer.setAttribute('aria-label', \`\${sender} mesajı: \${text}\`);
    
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
        speak(\`\${currentMessage.sender} diyor ki: \${currentMessage.text}\`);
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
            btn.setAttribute('aria-label', \`Seçenek \${index + 1}: \${choice.text}\`);
            btn.innerText = "➤ " + choice.text;
            
            btn.onclick = () => {
                if(typeof playSound === 'function' && typeof selectSound !== 'undefined') playSound(selectSound);
                
                // Seçilen cevabı baloncuk olarak sağa ekle
                appendBubble("Sen", choice.text, true);
                
                // NVDA'ya verdiğin cevabı söyle
                if(typeof speak === 'function') {
                    speak(\`Sen diyorsun ki: \${choice.text}\`);
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
    style.innerHTML = \`
        @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        /* Odaklanılan chat baloncuğunu belirginleştir (erişilebilirlik) */
        #chat-history div:focus {
            outline: 2px solid #f1c40f;
            outline-offset: 2px;
        }
    \`;
    document.head.appendChild(style);
});
`;

fs.writeFileSync('js/dialogue.js', content, 'utf8');
console.log("js/dialogue.js accessibility updated!");
