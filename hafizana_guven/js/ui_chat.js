// --- CANLI SOHBET SÄ°STEMÄ° ARAYÃœZ MANTIÃ„ÂI ---
window.isChatOpen = false;

// --- ANLIK BÄ°LDÄ°RÄ°M (TOAST) FONKSÄ°YONU ---
window.showToastNotification = function(text) {
    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.setAttribute('aria-hidden', 'true');
    toast.innerText = text;
    document.body.appendChild(toast);
    
    // GÃ¶rÃ¼nÃ¼r yap
    setTimeout(() => toast.classList.add('show'), 50);

    // 3.5 saniye sonra kaldÄ±r
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300); // animasyon bekleme sÃ¼resi
    }, 3500);
};

document.addEventListener('DOMContentLoaded', () => {
    // NVDA Hayalet Ekran KorumasÄ±: Sayfa ilk aÃ§Ä±ldÄ±ÄŸÄ±nda kapalÄ± olan tÃ¼m menÃ¼leri "inert" yap
    document.querySelectorAll('.menu-container').forEach(menu => {
        if (menu.id !== 'main-menu-container') {
            menu.setAttribute('inert', '');
        }
    });

    const chatToggleBtn = document.getElementById('chat-toggle-btn');
    const chatPanel = document.getElementById('chat-panel');
    const chatCloseBtn = document.getElementById('chat-close-btn');
    const chatNicknameInput = document.getElementById('chat-nickname');

    if (chatToggleBtn) {
        // CanlÄ± Sohbet butonu oyun genelinde gÃ¶rÃ¼nsÃ¼n ama ilk aÃ§Ä±lÄ±ÅŸta okuyucu odaÄŸÄ±na takÄ±lmasÄ±n diye
        // Sadece PvP lobisi ve genel oyun odasÄ±nda aktif hale gelmeli
        chatToggleBtn.style.display = 'none';
        chatToggleBtn.setAttribute('inert', '');
        chatToggleBtn.setAttribute('aria-hidden', 'true');
        chatToggleBtn.addEventListener('click', () => window.toggleChat());
    }

    if (chatCloseBtn) {
        chatCloseBtn.addEventListener('click', () => window.toggleChat());
    }

    window.toggleChat = function() {
        if (!chatPanel) return;

        window.isChatOpen = !window.isChatOpen;

        if (window.isChatOpen) {
            history.pushState({ modalOpen: 'chat' }, "");
            window.lastFocusedElement = document.activeElement;
            chatPanel.style.display = 'flex';
            chatPanel.removeAttribute('aria-hidden');
            const activeContainerId = (window.currentActiveMenu || 'main') + '-menu-container';
            const activeContainer = document.getElementById(activeContainerId);
            if (activeContainer) activeContainer.setAttribute('aria-hidden', 'true');
            const chatMessageInputLocal = document.getElementById('chat-message-input');
            if (chatNicknameInput && chatNicknameInput.style.display !== 'none') {
                setTimeout(() => chatNicknameInput.focus(), 100);
            } else if (chatMessageInputLocal) {
                setTimeout(() => chatMessageInputLocal.focus(), 100);
            }
            // Sohbet aÃ§Ä±ldÄ±ÄŸÄ±nda geÃ§miÅŸ mesajlarÄ±n gÃ¶rÃ¼nmesi iÃ§in en alta kaydÄ±r
            const chatMessagesContainer = document.querySelector('.chat-messages-container');
            if (chatMessagesContainer) {
                setTimeout(() => {
                    chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
                }, 50);
            }
            if (window.announceToScreenReader) {
                if (chatNicknameInput && chatNicknameInput.style.display === 'none') {
                    window.announceToScreenReader('CanlÄ± sohbet aÃ§Ä±ldÄ±. MesajÄ±nÄ±zÄ± yazabilirsiniz.', false);
                } else {
                    window.announceToScreenReader('CanlÄ± sohbet aÃ§Ä±ldÄ±. Takma adÄ±nÄ±zÄ± girin.', false);
                }
            }

            // Presence AÅŸama 2: Ä°lk KatÄ±lÄ±m ve Ã‡Ä±kÄ±ÅŸ KancasÄ±
            if (window.hasJoinedChat === false && window.db) {
                window.hasJoinedChat = true;
                
                // Ä°lk katÄ±lÄ±m mesajÄ± (Sistem bildirimleri kalÄ±cÄ± olarak sohbete itilmeyecek)
                
                // BaÅŸlangÄ±Ã§ Ã‡Ä±kÄ±ÅŸ KancasÄ± (Sohbet kanalÄ±na "Ã§evrimdÄ±ÅŸÄ± oldu" spamlamasÄ±nÄ± kaldÄ±rdÄ±k)
                if (window.disconnectRef) { window.disconnectRef.onDisconnect().cancel(); }
                // disconnectRef artÄ±k sadece presence iÃ§in kullanÄ±lacak, messages kanalÄ±nÄ± kirletmeyecek.
            }
        } else {
            chatPanel.style.display = 'none';
            chatPanel.setAttribute('aria-hidden', 'true');
            const activeContainerId = (window.currentActiveMenu || 'main') + '-menu-container';
            const activeContainer = document.getElementById(activeContainerId);
            if (activeContainer) activeContainer.removeAttribute('aria-hidden');
            
            setTimeout(() => {
                if (window.lastFocusedElement) {
                    window.lastFocusedElement.focus();
                } else {
                    let startBtn = document.getElementById('start-game-btn');
                    if (startBtn) startBtn.focus();
                }
            }, 100);

            if (window.announceToScreenReader) window.announceToScreenReader('CanlÄ± sohbet kapatÄ±ldÄ±.', false);
        }
    };

    // Nokta (.) kÄ±sayolu, ESC tuÅŸu ve Ok TuÅŸlarÄ±yla Gezinme
    document.addEventListener('keydown', (e) => {
        // Nokta (.) tuÅŸuyla sohbeti SADECE aÃ§
        if (e.key === '.' && !window.isChatOpen && (!document.activeElement || (document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA' && document.activeElement.tagName !== 'SELECT'))) {
            window.toggleChat();
        }
        
        // ESC tuÅŸuyla sohbeti hÄ±zlÄ±ca kapat
        if (e.key === 'Escape' && window.isChatOpen) {
            window.toggleChat();
        }
        
        // Sohbet mesajlarÄ±nda YukarÄ±/AÅŸaÄŸÄ± ok tuÅŸu ile gezinme
        if (window.isChatOpen && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
            const chatMessages = document.querySelectorAll('#chat-messages li[tabindex="0"]');
            if (chatMessages.length > 0) {
                let currentIndex = Array.from(chatMessages).indexOf(document.activeElement);
                
                if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    if (currentIndex > 0) {
                        chatMessages[currentIndex - 1].focus();
                    } else if (currentIndex === -1) {
                        chatMessages[chatMessages.length - 1].focus();
                    }
                } else if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    if (currentIndex !== -1 && currentIndex < chatMessages.length - 1) {
                        chatMessages[currentIndex + 1].focus();
                    } else if (currentIndex !== -1 && currentIndex === chatMessages.length - 1) {
                        const chatInput = document.getElementById('chat-message-input');
                        if (chatInput) chatInput.focus();
                    } else if (currentIndex === -1) {
                        chatMessages[0].focus();
                    }
                }
            }
        }
    });

    // Mobil: Ä°ki Parmakla Ã‡ift Dokunma (2-Finger Double Tap) Jest AlgÄ±layÄ±cÄ±sÄ±
    let lastTwoFingerTap = 0;
    document.addEventListener('touchstart', (e) => {
        // EÄŸer focus input/textarea/select Ã¼zerindeyse yoksay (yazÄ±ÅŸmayÄ± bÃ¶lmesin)
        if (document.activeElement && (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA' || document.activeElement.tagName === 'SELECT')) {
            return;
        }

        // Tam olarak 2 parmak ekrandaysa
        if (e.touches.length === 2) {
            const currentTime = new Date().getTime();
            const tapLength = currentTime - lastTwoFingerTap;
            
            // EÄŸer Ã¶nce iki parmak dokunup hemen ardÄ±ndan tekrar 2 parmak dokunduysa (Ã‡ift DokunuÅŸ)
            // SÃ¼re aralÄ±ÄŸÄ± 400ms'den kÄ±sa olmalÄ± (mobil cihazlardaki tipik Ã§ift tÄ±klama hÄ±zÄ±)
            if (tapLength < 450 && tapLength > 0) {
                if (typeof window.toggleChat === 'function') {
                    window.toggleChat();
                    // Ekran okuyuculardan veya Safari'den varsayÄ±lan olay sÄ±zmasÄ±nÄ± engellemek
                    if (e.cancelable) {
                        e.preventDefault();
                    }
                }
            }
            lastTwoFingerTap = currentTime;
        }
    }, { passive: false });
});

// --- CANLI SOHBET SÄ°STEMÄ° VERÄ°TABANI (FÄ°REBASE) MANTIÃ„ÂI ---
document.addEventListener('DOMContentLoaded', () => {
    const chatNicknameInput = document.getElementById('chat-nickname');
    const chatMessageInput = document.getElementById('chat-message-input');
    const chatSendBtn = document.getElementById('chat-send-btn');
    const chatMessagesList = document.getElementById('chat-messages');
    const chatMessagesContainer = document.querySelector('.chat-messages-container');
    
    // Presence (Durum) DeÄŸiÅŸkenleri (Global olarak ayarlandÄ±)
    const savedNickname = localStorage.getItem('chatUsername') || sessionStorage.getItem('chatNickname');
    window.currentChatUser = savedNickname ? savedNickname : "Misafir";
    window.hasJoinedChat = false;

    // Firebase tanÄ±mlÄ± deÄŸilse veya arayÃ¼z yoksa dur
    if (!chatSendBtn || !chatMessagesList || !window.db) return;

    // Oturumda veya kalÄ±cÄ± hafÄ±zada daha Ã¶nce kaydedilmiÅŸ bir Takma Ad varsa onu otomatik yÃ¼kle ve kutuyu gizle
    if (savedNickname) {
        chatNicknameInput.value = savedNickname;
        chatNicknameInput.style.display = 'none'; // KullanÄ±cÄ± adÄ± bir kere girildikten sonra sekme kapanana kadar veya kalÄ±cÄ± olarak gizlenir
    }

    // Takma ad kutusundayken de Enter'a basÄ±lÄ±rsa mesaj gÃ¶nderilsin
    if (chatNicknameInput) {
        chatNicknameInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                sendMessage();
            }
        });
    }

    // GÃ¼venlik (XSS) KorumasÄ± (HTML etiketlerini etkisiz hale getir)
    function escapeHTML(str) {
        if (!str) return '';
        return str.toString().replace(/[&<>'"]/g, 
            tag => ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                "'": '&#39;',
                '"': '&quot;'
            }[tag] || tag)
        );
    }

    // Mesaj GÃ¶nderme Ä°ÅŸlevi
    function sendMessage() {
        let nickInput = document.getElementById('chat-nickname');
        let msgInput = document.getElementById('chat-message-input');

        // BoÅŸluklarÄ± tÄ±raÅŸla
        let nickVal = nickInput ? nickInput.value.trim() : "";
        let msgVal = msgInput ? msgInput.value.trim() : "";

        if (nickVal === "" || msgVal === "") {
            // Mesaj veya isim tamamen boÅŸluktan ibaretse veya boÅŸsa
            if (window.wrongSound) window.wrongSound.play();
            let uyari = "LÃ¼tfen geÃ§erli bir takma ad ve mesaj girin. BoÅŸ mesaj gÃ¶nderilemez.";
            if (window.announceToScreenReader) window.announceToScreenReader(uyari);
            
            // Ä°mleci eksik olan yere odakla
            if (nickVal === "" && nickInput) nickInput.focus();
            else if (msgInput) msgInput.focus();
            
            return; // GÃ¶nderimi iptal et ve sistemi koru!
        }

        const nickname = nickVal;
        const text = msgVal;

        // Firebase Yolu KuralÄ±: Ä°simlerde '.', '#', '$', '[', ']' veya '/' kullanÄ±lamaz. 
        // Aksi takdirde uygulama sessizce ve senkron olarak Ã§Ã¶ker.
        if (/[.#$\[\]\/]/.test(nickname)) {
            if (window.wrongSound) window.wrongSound.play();
            let uyari = "KullanÄ±cÄ± adÄ±nÄ±zda geÃ§ersiz karakterler bulunuyor. LÃ¼tfen nokta veya kÃ¶ÅŸeli parantez gibi hatalÄ± sembolleri silin.";
            if (window.announceToScreenReader) window.announceToScreenReader(uyari);
            if (nickInput) {
                // Temizleyerek otomatik dÃ¼zeltilmiÅŸ halini sun
                nickInput.value = nickname.replace(/[.#$\[\]\/]/g, '');
                nickInput.focus();
            }
            return; // Ã‡Ã¶kmesini Ã¶nle
        }

        // KULLANICI ADI GÃœVENLÄ°K (REGISTRATION) KONTROLÃœ
        let myDevId = localStorage.getItem('hafizaGuvenDeviceId');
        if (!myDevId) {
            myDevId = 'dev_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
            localStorage.setItem('hafizaGuvenDeviceId', myDevId);
        }

        window.db.ref('registeredUsers/' + nickname).once('value').then(snapshot => {
            const existingOwner = snapshot.val();
            
            // EÄŸer baÅŸkasÄ±na aitse durdur
            if (existingOwner && existingOwner !== myDevId) {
                if (window.wrongSound) window.wrongSound.play();
                let uyari = `"${nickname}" kullanÄ±cÄ± adÄ± daha Ã¶nce baÅŸkasÄ± tarafÄ±ndan alÄ±nmÄ±ÅŸ. LÃ¼tfen farklÄ± bir isim seÃ§in.`;
                if (window.announceToScreenReader) window.announceToScreenReader(uyari);
                let desc = document.getElementById('chat-desc') || document.getElementById('sr-chat-reader');
                if (desc) desc.textContent = "BaÄŸlantÄ± HatasÄ±: KullanÄ±cÄ± adÄ± kullanÄ±mda.";
                
                if (nickInput) {
                    nickInput.value = "";
                    nickInput.focus();
                }
                return;
            }

            // Yeni kullanÄ±cÄ± adÄ± ise benim adÄ±ma kaydet
            if (!existingOwner) {
                window.db.ref('registeredUsers/' + nickname).set(myDevId);
            }

            // ArtÄ±k nick bize ait. Uygulama hafÄ±zasÄ±na kalÄ±cÄ± kaydet.
            localStorage.setItem('chatUsername', nickname);
            window.currentChatUser = nickname;

            if (nickInput) {
                nickInput.style.display = 'none'; // BaÅŸarÄ±yla kilitlendi, bir daha sorma
            }

            // --- GÄ°ZLÄ° SOHBET KOMUTLARI (CLIENT-SIDE) ---
            if (text.startsWith('/')) {
                const args = text.split(' ');
                const command = args[0].toLowerCase();
                const chatMessagesListLocal = document.getElementById('chat-messages');
            const chatMessagesContainerLocal = document.querySelector('.chat-messages-container');
            const chatMessageInputLocal = document.getElementById('chat-message-input');
            
            // KullanÄ±cÄ± GeliÅŸtirici Mi KontrolÃ¼
            let cUserNick = window.currentChatUser || "";
            let nickInputTemp = document.getElementById('chat-nickname');
            if (nickInputTemp && nickInputTemp.value.trim() !== "") cUserNick = nickInputTemp.value.trim();
            let isDev = ['ekrem'].includes(cUserNick.toLowerCase());

            function addLocalSystemMessage(msgText) {
                // Sadece ekranda anlÄ±k (toast) gÃ¶sterip ekran okuyucuya okutuyoruz.
                // Chat listesini (DOM'u) kalÄ±cÄ± olarak iÅŸgal edip kalabalÄ±k yapmasÄ±nÄ± engelledik.
                if (window.showToastNotification) {
                    window.showToastNotification(msgText, "info");
                }
                if (window.announceToScreenReader) {
                    window.announceToScreenReader(msgText, false);
                }
            }

            if (command === '/temizle') {
                if (!isDev) { addLocalSystemMessage("Hata: Bu iÅŸlem iÃ§in 'GeliÅŸtirici' yetkiniz yok."); return; }
                if (chatMessagesListLocal) chatMessagesListLocal.innerHTML = '';
                addLocalSystemMessage("Sohbet geÃ§miÅŸiniz (sadece sizin ekranÄ±nÄ±zda) temizlendi.");
                
                // GÄ°ZLÄ° GLOBAL SIFIRLAMA KOMUTU
                if (window.db) {
                    window.db.ref('player_stats').remove();
                    window.db.ref('global_wipe_timestamp').set(firebase.database.ServerValue.TIMESTAMP);
                    addLocalSystemMessage("DÄ°KKAT: Global Wipe (KÃ¼resel SÄ±fÄ±rlama) Komutu Ã§alÄ±ÅŸtÄ±rÄ±ldÄ±! TÃ¼m oyuncularÄ±n istatistikleri ve Firebase bulut yedekleri siliniyor...");
                }
            } else if (command === '/saat' || command === '/zaman') {
                addLocalSystemMessage("Ã…Âu anki cihaz saati: " + new Date().toLocaleTimeString('tr-TR'));
            } else if (command === '/jeton' || command === '/bakiye') {
                const totalTokensLocal = parseInt(localStorage.getItem('hafizaGuvenTotalTokens')) || 0;
                addLocalSystemMessage(`CÃ¼zdanÄ±nÄ±zdaki mevcut bakiye: ${totalTokensLocal} jeton.`);
            } else if (command === '/bilet') {
                if (isDev) {
                    if (window.stopAdminAlert) window.stopAdminAlert('ticket');
                    addLocalSystemMessage("Sistemdeki tÃ¼m aÃ§Ä±k biletler (Geri bildirimler) taranÄ±yor...");
                    if (window.db) {
                        window.db.ref('feedbacks').once('value').then(snapshot => {
                            if (!snapshot.exists() || !snapshot.hasChildren()) {
                                addLocalSystemMessage("Sistemde aÃ§Ä±k hiÃ§bir bilet/geri bildirim bulunmuyor. Harika!");
                            } else {
                                let count = 0;
                                snapshot.forEach(child => {
                                    count++;
                                    let fb = child.val();
                                    addLocalSystemMessage(`AÃ§Ä±k Bilet #${count} [GÃ¶nderen: ${fb.nickname}] => ${fb.message}`);
                                });
                                addLocalSystemMessage(`Toplam ${count} adet aÃ§Ä±k bilet listelendi. YanÄ±tlamak ve Ã§Ã¶zmek iÃ§in: /Ã§Ã¶z <takma_ad> <mesajÄ±nÄ±z>`);
                            }
                        });
                    }
                } else {
                    let currentUser = window.currentChatUser;
                    let nickInputValue = chatMessageInputLocal && document.getElementById('chat-nickname') ? document.getElementById('chat-nickname').value.trim() : "";
                    if (nickInputValue !== "") currentUser = nickInputValue;
                    
                    if (!currentUser || currentUser === "Misafir") {
                        addLocalSystemMessage("Biletlerinizi sorgulamak iÃ§in bir takma ad belirlemiÅŸ olmanÄ±z gerekir.");
                    } else {
                        addLocalSystemMessage("Biletleriniz sorgulanÄ±yor, lÃ¼tfen bekleyin...");
                        if (window.db) {
                            let biletFound = false;
                            let count = 0;
                            
                            // 1. HenÃ¼z Ã§Ã¶zÃ¼lmemiÅŸ, gÃ¶nderilen aÃ§Ä±k biletleri kontrol et
                            window.db.ref('feedbacks').once('value').then(snapshot => {
                                if (snapshot.exists()) {
                                    snapshot.forEach(child => {
                                        let fb = child.val();
                                        if (fb.nickname && fb.nickname.toLowerCase() === currentUser.toLowerCase()) {
                                            count++;
                                            biletFound = true;
                                            addLocalSystemMessage(`Bilet #${count} | Durum: GeliÅŸtiriciye ulaÅŸtÄ±, inceleniyor Ã¢ÂÂ³ | Ã…Âikayetiniz: ${fb.message}`);
                                        }
                                    });
                                }
                                
                                // 2. Ã‡Ã¶zÃ¼lmÃ¼ÅŸ veya yÃ¶netici tarafÄ±ndan yanÄ±tlanmÄ±ÅŸ biletleri kontrol et
                                window.db.ref('biletler/' + currentUser).once('value').then(snap2 => {
                                    if (snap2.exists() && snap2.hasChildren()) {
                                        snap2.forEach(child => {
                                            count++;
                                            biletFound = true;
                                            let biletData = child.val();
                                            let mesaj = typeof biletData === 'string' ? biletData : (biletData.message || biletData.mesaj || "TanÄ±msÄ±z");
                                            
                                            addLocalSystemMessage(`Bilet #${count} | Durum: Ã‡Ã¶zÃ¼ldÃ¼ Ã¢Å“â€¦ (Otomatik silindi) | GeliÅŸtirici YanÄ±tÄ±: ${mesaj}`);
                                            child.ref.remove(); // OkunduÄŸu iÃ§in sil
                                        });
                                    }
                                    
                                    if (!biletFound) {
                                        addLocalSystemMessage("Ã…Âu anda adÄ±nÄ±za tanÄ±mlÄ± aÃ§Ä±k veya yeni Ã§Ã¶zÃ¼lmÃ¼ÅŸ hiÃ§bir bilet bulunamadÄ±.");
                                    } else {
                                        addLocalSystemMessage(`Toplam ${count} adet bilet-kayÄ±t listelendi.`);
                                    }
                                });
                            }).catch(err => {
                                addLocalSystemMessage("BaÄŸlantÄ± hatasÄ±: Bilet veritabanÄ±na ulaÅŸÄ±lamadÄ±.");
                            });
                        } else {
                            addLocalSystemMessage("VeritabanÄ± baÄŸlantÄ±sÄ± yok.");
                        }
                    }
                }
            } else if (command === '/yardim' || command === '/yardÄ±m') {
                addLocalSystemMessage("Mevcut komutlar: /temizle, /saat, /jeton, /bilet, /ziyaretci, /yardÄ±m.");
            } else if (command === '/ziyaretci' || command === '/ziyaretÃ§i') {
                if (!isDev) { 
                    addLocalSystemMessage("Hata: Bu komut sadece geliÅŸtiriciye Ã¶zeldir."); 
                } else {
                    addLocalSystemMessage("Site ziyaretÃ§i istatistikleri Ã§ekiliyor...");
                    if (window.db) {
                        window.db.ref('site_stats/total_visitors').once('value').then(snap => {
                            let total = snap.val() || 0;
                            addLocalSystemMessage(`Mikyas Studio Web Sitenizi Toplam Ziyaret Eden KiÅŸi SayÄ±sÄ±: ${total}`);
                        }).catch(() => addLocalSystemMessage("ZiyaretÃ§i sayacÄ± okunamadÄ±."));
                        
                        window.db.ref('site_visitors').orderByChild('timestamp').limitToLast(5).once('value').then(snap => {
                            if (snap.exists()) {
                                addLocalSystemMessage("Son 5 ziyaretÃ§inin giriÅŸ saatleri:");
                                let count = 0;
                                snap.forEach(child => {
                                    count++;
                                    let v = child.val();
                                    let dateStr = v.timestamp ? new Date(v.timestamp).toLocaleString('tr-TR') : "Bilinmeyen Tarih";
                                    addLocalSystemMessage(`[ZiyaretÃ§i ${count}] GiriÅŸ: ${dateStr}`);
                                });
                            }
                        });
                    }
                }
            } else {
                addLocalSystemMessage("Bilinmeyen komut. KomutlarÄ± Ã¶ÄŸrenmek iÃ§in /yardÄ±m yazabilirsiniz.");
            }

            if (chatMessageInputLocal) {
                chatMessageInputLocal.value = '';
                chatMessageInputLocal.focus();
            }
            return; // Firebase veritabanÄ±na gÃ¶ndermeden sadece oyuncunun ekranÄ±nda Ã§alÄ±ÅŸtÄ±r ve bitir!
        }

        // Spam KalkanÄ±: 2 Saniye Bekleme SÃ¼resi
        let now = Date.now();
        window.lastMessageTime = window.lastMessageTime || 0;

        if (now - window.lastMessageTime < 2000) {
            if (window.wrongSound) window.wrongSound.play();
            let spamUyari = "Ã‡ok hÄ±zlÄ± mesaj gÃ¶nderiyorsunuz. LÃ¼tfen biraz bekleyin.";
            if (window.announceToScreenReader) window.announceToScreenReader(spamUyari);
            return; // GÃ¶nderimi iptal et ve sistemi koru!
        }

        // SÃ¼re kuralÄ±na uyulduysa yeni zamanÄ± kaydet ve iÅŸleme devam et
        window.lastMessageTime = now;

        if (nickname.toLowerCase() === 'sistem') {
            if (window.announceToScreenReader) window.announceToScreenReader('Bu takma adÄ± kullanamazsÄ±nÄ±z.', false);
            chatNicknameInput.focus();
            return;
        }

        if (text === '') {
            if (window.announceToScreenReader) window.announceToScreenReader('LÃ¼tfen bir mesaj yazÄ±n.', false);
            chatMessageInput.focus();
            return;
        }

        if (text.toLowerCase().startsWith('/rutbe ') || text.toLowerCase().startsWith('/rÃ¼tbe ')) {
            let cUserNick = (nickname || "").toLowerCase();
            let isDev = ['ekrem'].includes(cUserNick) || (window.playerRanks && window.playerRanks[cUserNick] && window.playerRanks[cUserNick].toLowerCase() === 'tester');
            
            if (!isDev) {
                if (window.announceToScreenReader) window.announceToScreenReader("Bu komutu kullanma yetkiniz yok.", true);
                chatMessageInput.value = '';
                chatMessageInput.focus();
                return;
            }

            let parts = text.split(" ");
            if (parts.length >= 3) {
                let targetUser = parts[1].toLowerCase();
                let newRank = parts.slice(2).join(" ");
                window.fb_rutbeDegistir(targetUser, newRank).then(() => {
                    if (window.announceToScreenReader) window.announceToScreenReader(`${targetUser} kullanÄ±cÄ±sÄ±nÄ±n rÃ¼tbesi baÅŸarÄ±yla ${newRank} yapÄ±ldÄ±.`, true);
                    chatMessageInput.value = '';
                }).catch(err => {
                    if (window.announceToScreenReader) window.announceToScreenReader("RÃ¼tbe deÄŸiÅŸtirilirken bir hata oluÅŸtu.", true);
                });
            } else {
                if (window.announceToScreenReader) window.announceToScreenReader("KullanÄ±m: /rÃ¼tbe [kullanÄ±cÄ±_adÄ±] [yeni_rÃ¼tbe]", true);
            }
            return;
        }

        if (nickname !== '' && text !== '') {
            const messageData = {
                nickname: nickname,
                text: text,
                timestamp: firebase.database.ServerValue.TIMESTAMP
            };

            // Presence AÅŸama 2: Ä°sim GÃ¼ncelleme ve Kanca Yenileme
            if (nickname !== window.currentChatUser && nickname !== "Sistem") {
                window.currentChatUser = nickname;
                if (window.disconnectRef) {
                    window.disconnectRef.onDisconnect().cancel();
                    // Yeni bir mesaj hook'u eklemiyoruz ki sohbeti kirletmesin.
                }
            }

            window.fb_mesajGonder(messageData).then(() => {

                // BaÅŸarÄ±lÄ± gÃ¶nderim sonrasÄ± Takma AdÄ± oturuma VE KALICI DEPOLAMAYA kaydet
                localStorage.setItem('chatUsername', nickname);
                sessionStorage.setItem('chatNickname', nickname);
                chatNicknameInput.style.display = 'none';
                
                chatMessageInput.value = ''; // Mesaj formunu temizle
                
                // Oyuna hÄ±zlÄ±ca devam edilebilmesi iÃ§in sohbet penceresini otomatik kapat
                if (window.isChatOpen && typeof window.toggleChat === 'function') {
                    window.toggleChat();
                }

                // MesajÄ±n baÅŸarÄ±yla gÃ¶nderildiÄŸini bildir (pencere kapanma anonsu ile karÄ±ÅŸmamasÄ± iÃ§in 100ms gecikme)
                setTimeout(() => {
                    if (window.announceToScreenReader) {
                        window.announceToScreenReader('Mesaj gÃ¶nderildi.', false);
                    }
                }, 100);
            }).catch(error => {
                console.error("Mesaj gÃ¶nderilirken hata oluÅŸtu:", error);
                
                // Hata durumunda uyar
                if (window.announceToScreenReader) {
                    window.announceToScreenReader('Hata: Mesaj gÃ¶nderilemedi. LÃ¼tfen baÄŸlantÄ±nÄ±zÄ± kontrol edin.', true);
                }
            });
        }
        }); // END OF registeredUsers Check
    }

    // GÃ¶nder butonuna tÄ±klandÄ±ÄŸÄ±nda
    chatSendBtn.addEventListener('click', sendMessage);

    // Mesaj kutusundayken Enter'a basÄ±ldÄ±ÄŸÄ±nda
    chatMessageInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            sendMessage();
        }
    });

    // MesajlarÄ± Dinleme Ä°ÅŸlevi (Sadece son 50 mesaj)
    // Firebase push() anahtarlarÄ± zaten kronolojik olduÄŸu iÃ§in orderByChild'a gerek yoktur, bu sayede Index hatasÄ± vermez ve geÃ§miÅŸi kesin yÃ¼kler.
    
    window.playerRanks = {};
    window.db.ref('ranks').on('value', snap => {
        window.playerRanks = snap.val() || {};
        let myName = window.currentChatUser || localStorage.getItem('chatUsername') || sessionStorage.getItem('chatNickname') || localStorage.getItem('hafizaGuvenUserNickname') || "Bilinmeyen";
        if (myName !== "Bilinmeyen") {
            let myRank = "Oyuncu";
            let isimKucuk = myName.toLowerCase();
            if (['ekrem'].includes(isimKucuk)) {
                myRank = "GeliÅŸtirici";
            } else if (window.playerRanks && window.playerRanks[isimKucuk]) {
                myRank = window.playerRanks[isimKucuk];
            }
            let r_el = document.getElementById('profile-player-rank');
            if (r_el) r_el.innerText = myRank;
        }
    });

    const messagesRef = window.db.ref('messages').limitToLast(50);
    const chatLoadTime = Date.now();
    
    // VeritabanÄ± boÅŸsa "HiÃ§ mesaj yok" uyarÄ±sÄ± ekleme
    messagesRef.once('value', (snapshot) => {
        if (!snapshot.exists()) {
            const li = document.createElement('li');
            li.id = 'empty-chat-warning';
            li.classList.add('system-message');
            const srText = `<span style="position:absolute; width:1px; height:1px; overflow:hidden; clip:rect(0,0,0,0);">Sistem mesajÄ±: Bu sohbet kutusunda hiÃ§ mesaj yok. Ä°lk mesajÄ±nÄ±zÄ± gÃ¶ndermek iÃ§in gÃ¼zel bir zaman.</span>`;
            li.innerHTML = `${srText}<div class="wp-bubble" aria-hidden="true" style="opacity: 0.8;">Bu sohbet kutusunda hiÃ§ mesaj yok.<br>Ä°lk mesajÄ±nÄ±zÄ± gÃ¶ndermek iÃ§in gÃ¼zel bir zaman. ÄŸÅ¸â€˜â€¹</div>`;
            chatMessagesList.appendChild(li);
        }
    });

    messagesRef.on('child_added', (snapshot) => {
        // EÄŸer boÅŸ sohbet uyarÄ±sÄ± ekranda duruyorsa, ilk mesaj geldiÄŸinde onu sil!
        const emptyWarning = document.getElementById('empty-chat-warning');
        if (emptyWarning) {
            emptyWarning.remove();
        }

        const data = snapshot.val();
        if (!data) return;

        let mutedUsers = JSON.parse(localStorage.getItem('hafizaGuvenMutedUsers') || "[]");
        if (mutedUsers.includes(data.nickname)) return; // Sessize alÄ±nmÄ±ÅŸ kiÅŸinin mesajÄ±nÄ± engelledik
        
        let timeString = "";
        let timeRaw = "";
        let ts = data.timestamp;
        
        // Yerel itme anÄ±nda (Optimistic Render) TIMESTAMP obje veya hatalÄ± olabilir, bu durumda geÃ§ici yerel cihaz saati kullanÄ±lÄ±r
        if (typeof ts !== 'number') {
            ts = Date.now();
        }
        
        if (ts) {
            const dateObj = new Date(ts);
            const hours = dateObj.getHours().toString().padStart(2, '0');
            const minutes = dateObj.getMinutes().toString().padStart(2, '0');
            timeRaw = `${hours}:${minutes}`;
            timeString = `<span class="wp-time">${timeRaw}</span>`;
        }

        if (data.nickname === "Sistem") {
            // Sistem mesajlarÄ±nÄ± sohbet listesine (DOM'a) ekleme, anlÄ±k bildirim (toast) olarak yansÄ±t
            if (Date.now() - chatLoadTime > 2000) {
                if (window.showToastNotification) {
                    window.showToastNotification(data.text);
                }
            }
        } else {
            const li = document.createElement('li');
            li.setAttribute('tabindex', '0');
            
            // RÃ¼tbe Belirleme
            let isimKucuk = (data.nickname || "").toLowerCase();
            let isDevRender = ['ekrem'].includes(isimKucuk);
            let rutbe = "Oyuncu";
            if (isDevRender) {
                rutbe = "GeliÅŸtirici";
            } else if (window.playerRanks && window.playerRanks[isimKucuk]) {
                rutbe = window.playerRanks[isimKucuk];
            }
            
            // Benim gÃ¶nderdiÄŸim mesaj mÄ± yoksa baÅŸkasÄ±nÄ±n mÄ±?
            const isMe = data.nickname === chatNicknameInput.value.trim() && chatNicknameInput.value.trim() !== "";
            li.classList.add(isMe ? 'message-out' : 'message-in');
            
            li.setAttribute('aria-label', `[${timeRaw}] ${rutbe} ${escapeHTML(data.nickname)}: ${escapeHTML(data.text)}`);
            
            let rankColor = isDevRender ? '#ffaa00' : (rutbe.toLowerCase() === 'tester' ? '#ff55ff' : (rutbe !== 'Oyuncu' ? '#55aaff' : (isMe ? '#9bbca1' : '#88acb8')));
            
            // Whatsapp GÃ¶rsel Balonu
            li.innerHTML = `
                <div class="wp-bubble" aria-hidden="true">
                    ${!isMe ? `<div class="wp-sender"><span style="color:${rankColor}; font-size:0.85em;">[${rutbe}]</span> ${escapeHTML(data.nickname)}</div>` : `<div style="font-size: 0.75em; color:${rankColor}; margin-bottom: 3px;">[${rutbe}]</div>`}
                    <div class="wp-text">${escapeHTML(data.text)}</div>
                    ${timeString}
                </div>
            `;
            chatMessagesList.appendChild(li);
        }

        // Yeni mesaj gelince otomatik olarak en alta kaydÄ±r
        if (chatMessagesContainer && window.isChatOpen && data.nickname !== "Sistem") {
            // Sadece sohbet aÃ§Ä±ksa kaydÄ±r, deÄŸilse aÃ§Ä±ldÄ±ÄŸÄ±nda zaten aÅŸaÄŸÄ±da kalmasÄ± iÃ§in toggleChat iÃ§ine eklenecek
            setTimeout(() => {
                chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
            }, 10);
        }

        // --- NVDA iÃ§in Yeni MesajlarÄ± DoÄŸrudan Anons Etme ---
        const isMe = data.nickname === chatNicknameInput.value.trim() && chatNicknameInput.value.trim() !== "";
        let messageToRead = "";
        let isNewIncomingMessage = false;

        if (data.nickname === "Sistem") {
            messageToRead = `Sistem mesajÄ±: ${data.text}`;
        } else {
            let isimKucuk = (data.nickname || "").toLowerCase();
            let isDevRead = ['ekrem'].includes(isimKucuk);
            let rutbe = isDevRead ? "GeliÅŸtirici" : "Oyuncu";

            messageToRead = `${rutbe} ${data.nickname}: ${data.text}`;
            if (!isMe) {
                isNewIncomingMessage = true;
            }
        }
        
        // Sadece sayfa aÃ§Ä±lÄ±ÅŸÄ±ndaki geÃ§miÅŸ mesaj yÄ±ÄŸÄ±nÄ±nÄ± atlamak iÃ§in zamanÄ± kontrol ediyoruz
        if (Date.now() - chatLoadTime > 2000) {
            // BaÅŸkasÄ±ndan gelen mesaj ise ses Ã§al
            if (isNewIncomingMessage && window.chatReceiveSound) {
                window.chatReceiveSound.play();
            }
            
            // "BoÅŸ" (empty) bug'Ä±nÄ± ve PC NVDA sessizliÄŸini uyumlu ÅŸekilde bitirmek iÃ§in announceToScreenReader'Ä± kullanÄ±yoruz
            if (window.announceToScreenReader) {
                window.announceToScreenReader(messageToRead, false); // forceFocus = false
            }
        }
    });

    // Sohbet penceresi aÃ§Ä±ldÄ±ÄŸÄ±nda geÃ§miÅŸ mesajlarÄ±n en altÄ±na kaydÄ±rmayÄ± garantiye almak iÃ§in Observer ekleyelim
    // Veya toggleChat butonuna basÄ±ldÄ±ÄŸÄ±nda scrollTop tetiklenebilir.
});

// Oyuncu oyundan Ã§Ä±karken/sayfa kapanÄ±rken tÃ¼m sohbeti kalÄ±cÄ± olarak sÄ±fÄ±rla (0'la)
// KRÄ°TÄ°K HATA DÃœZELTMESÄ°: remove() fonksiyonu herhangi bir kullanÄ±cÄ± oyundan Ã§Ä±ktÄ±ÄŸÄ±nda, 
// odayÄ± kullanan TÃœM diÄŸer oyuncularÄ±n da canlÄ± sohbet geÃ§miÅŸini veritabanÄ±ndan kalÄ±cÄ± olarak silmesine (wipe) yol aÃ§Ä±yordu! 
// Bu nedenle kÃ¼resel temizlik fonsiyonu iptal edildi.
// window.addEventListener('beforeunload', () => {
//     if (window.db) {
//         window.db.ref('messages').remove();
//     }
// });

// --- GÃ–REV 1 KaldÄ±rÄ±ldÄ± (Tab yÃ¶netimi game.js'deki exception'lar ile yapÄ±lÄ±yor) ---

// --- Ã–ZEL MESAJLAÃ…ÂMA (PRIVATE CHAT) VE KULLANICI Ä°Ã…ÂLEM MENÃœSÃœ ---
document.addEventListener('DOMContentLoaded', () => {
    const actionModal = document.getElementById('social-action-modal');
    const actionTitle = document.getElementById('social-action-title');
    const btnPm = document.getElementById('social-btn-pm');
    const btnMute = document.getElementById('social-btn-mute');
    const btnCancel = document.getElementById('social-btn-cancel');
    const btnResolve = document.getElementById('social-btn-resolve');
    const btnBan = document.getElementById('social-btn-ban');
    const btnUnban = document.getElementById('social-btn-unban');

    const privateChatPanel = document.getElementById('private-chat-panel');
    const privateChatTitle = document.getElementById('private-chat-title');
    const privateChatCloseBtn = document.getElementById('private-chat-close-btn');
    const privateChatMessages = document.getElementById('private-chat-messages');
    const privateChatMessageInput = document.getElementById('private-chat-message-input');
    const privateChatSendBtn = document.getElementById('private-chat-send-btn');

    let currentPrivateRecipient = null;
    let privateChatListenerRef = null;
    window.isPrivateChatOpen = false;

    const getMutedUsers = () => JSON.parse(localStorage.getItem('hafizaGuvenMutedUsers') || "[]");
    
    window.openSocialActionModal = function(playerName) {
        if (!playerName || !actionModal) return;
        window.selectedSocialPlayer = playerName;
        
        let isMuted = getMutedUsers().includes(playerName);

        if (actionTitle) actionTitle.innerText = playerName + " Ä°ÅŸlemleri";
        if (btnMute) {
            btnMute.innerText = isMuted ? "SusturmayÄ± KaldÄ±r" : "KullanÄ±cÄ±yÄ± Sustur";
            btnMute.setAttribute('aria-label', isMuted ? "KullanÄ±cÄ±nÄ±n susturmasÄ±nÄ± kaldÄ±r" : "KullanÄ±cÄ±yÄ± sustur");
        }

        let cUserNick = window.currentChatUser || localStorage.getItem('chatUsername') || sessionStorage.getItem('chatNickname') || localStorage.getItem('hafizaGuvenUserNickname') || "Misafir";
        let isDev = ['ekrem'].includes(cUserNick.toLowerCase());

        const devBtns = actionModal.querySelectorAll('.dev-only-action');
        devBtns.forEach(b => {
            b.style.display = isDev ? 'list-item' : 'none';
        });

        if (window.menuEnterSound) window.menuEnterSound.play();
        actionModal.style.display = 'flex';
        actionModal.removeAttribute('aria-hidden');
        setTimeout(() => {
            actionModal.style.opacity = '1';
            window.previousMenuBeforeModal = window.currentActiveMenu;
            window.currentActiveMenu = 'social-action';
            window.currentFocusIndex = 0;
            if (btnPm) btnPm.focus();
            if (window.announceToScreenReader) {
                window.announceToScreenReader(playerName + " detaylarÄ± aÃ§Ä±ldÄ±. Ã–zel mesaj gÃ¶nderebilir veya susturabilirsiniz.", true);
            }
        }, 50);
    };

    window.closeSocialActionModal = function() {
        if (!actionModal) return;
        if (window.menuEnterSound) window.menuEnterSound.play();
        actionModal.style.opacity = '0';
        setTimeout(() => {
            actionModal.style.display = 'none';
            actionModal.setAttribute('aria-hidden', 'true');
            if (window.previousMenuBeforeModal) {
                window.currentActiveMenu = window.previousMenuBeforeModal;
                setTimeout(() => {
                    const mBtn = document.getElementById('nav-btn-social');
                    if (mBtn) mBtn.focus();
                }, 50);
            }
        }, 300);
    };

    if (btnCancel) btnCancel.addEventListener('click', window.closeSocialActionModal);

    if (btnMute) {
        btnMute.addEventListener('click', () => {
            if (!window.selectedSocialPlayer) return;
            let mutedUsers = getMutedUsers();
            let isMuted = mutedUsers.includes(window.selectedSocialPlayer);
            
            if (isMuted) {
                mutedUsers = mutedUsers.filter(u => u !== window.selectedSocialPlayer);
                if (window.announceToScreenReader) window.announceToScreenReader(window.selectedSocialPlayer + " artÄ±k size mesaj gÃ¶nderebilecek.");
                if (window.showToastNotification) window.showToastNotification(window.selectedSocialPlayer + " susturmasÄ± kaldÄ±rÄ±ldÄ±.");
            } else {
                mutedUsers.push(window.selectedSocialPlayer);
                if (window.announceToScreenReader) window.announceToScreenReader(window.selectedSocialPlayer + " susturuldu. Hem Ã¶zel hem global mesajlarÄ± engellendi.");
                if (window.showToastNotification) window.showToastNotification(window.selectedSocialPlayer + " susturuldu.");
            }
            localStorage.setItem('hafizaGuvenMutedUsers', JSON.stringify(mutedUsers));
            window.closeSocialActionModal();
        });
    }

    if (btnPm) {
        btnPm.addEventListener('click', () => {
            window.closeSocialActionModal();
            setTimeout(() => {
                if (window.openPrivateChat) window.openPrivateChat(window.selectedSocialPlayer);
            }, 300);
        });
    }

    if (btnResolve) {
        btnResolve.addEventListener('click', () => {
            let msg = prompt("Bu oyuncuya iletilecek bilet Ã§Ã¶zÃ¼m mesajÄ±nÄ± girin:");
            if (msg && msg.trim() !== "" && window.db) {
                let targetUser = window.selectedSocialPlayer;
                window.fb_biletCoz(targetUser, msg);
                alert("Bilet Ã§Ã¶zÃ¼ldÃ¼ olarak iÅŸaretlendi ve oyuncuya iletildi.");
            }
            window.closeSocialActionModal();
        });
    }

    if (btnBan) {
        btnBan.addEventListener('click', () => {
            if (confirm(`${window.selectedSocialPlayer} adlÄ± oyuncuyu oyundan yasaklamak istediÄŸinize emin misiniz?`)) {
                if (window.db) {
                    window.fb_oyuncuYasakla(window.selectedSocialPlayer).then(() => {
                        alert(`${window.selectedSocialPlayer} yasaklandÄ±.`);
                    });
                }
            }
            window.closeSocialActionModal();
        });
    }

    if (btnUnban) {
        btnUnban.addEventListener('click', () => {
            if (confirm(`${window.selectedSocialPlayer} adlÄ± oyuncunun yasaÄŸÄ±nÄ± kaldÄ±rmak istediÄŸinize emin misiniz?`)) {
                if (window.db) {
                    window.fb_yasakKaldir(window.selectedSocialPlayer).then(() => {
                        alert(`${window.selectedSocialPlayer} kullanÄ±cÄ±sÄ±nÄ±n yasaÄŸÄ± kaldÄ±rÄ±ldÄ±.`);
                    });
                }
            }
            window.closeSocialActionModal();
        });
    }

    function getPrivateRoomId(user1, user2) { return [user1, user2].sort().join('_'); }

    window.openPrivateChat = function(recipientName) {
        if (window.stopAdminAlert) window.stopAdminAlert('message');
        if (!privateChatPanel || !recipientName) return;
        
        let myName = window.currentChatUser || localStorage.getItem('chatUsername') || sessionStorage.getItem('chatNickname') || localStorage.getItem('hafizaGuvenUserNickname');
        if (!myName || myName === "Misafir") {
            if (window.announceToScreenReader) window.announceToScreenReader("Ã–zel mesajlaÅŸmak iÃ§in KÃ¼resel Sohbet menÃ¼sÃ¼ Ã¼zerinden onaylÄ± bir takma ad belirlemelisiniz.", true);
            if (window.showToastNotification) window.showToastNotification("Ã–nce Sohbet'ten takma ad alÄ±n!");
            return;
        }

        currentPrivateRecipient = recipientName;
        window.isPrivateChatOpen = true;

        if (privateChatTitle) privateChatTitle.innerText = `${recipientName} ile Ã–zel Sohbet`;
        
        if (privateChatListenerRef && window.db) privateChatListenerRef.off();

        privateChatMessages.innerHTML = '';
        privateChatPanel.style.display = 'flex';
        privateChatPanel.removeAttribute('aria-hidden');
        history.pushState({ modalOpen: 'private-chat' }, "");

        if (privateChatMessageInput) {
            privateChatMessageInput.disabled = false;
            privateChatSendBtn.disabled = false;
            setTimeout(() => privateChatMessageInput.focus(), 100);
        }
        
        let roomId = getPrivateRoomId(myName, currentPrivateRecipient);
        privateChatListenerRef = window.db.ref(`privateChats/${roomId}`);

        if (window.menuEnterSound) window.menuEnterSound.play();

        privateChatListenerRef.on('child_added', (snapshot) => {
            let msg = snapshot.val();
            if (!msg) return;
            
            let isMe = (msg.sender === myName);
            if (!isMe && getMutedUsers().includes(msg.sender)) return;

            let li = document.createElement('li');
            li.tabIndex = 0;
            li.style.marginBottom = '10px';
            li.style.padding = '8px';
            li.style.borderRadius = '8px';
            li.style.backgroundColor = isMe ? 'rgba(255, 183, 3, 0.1)' : 'rgba(0, 168, 132, 0.1)';
            li.style.borderLeft = isMe ? '4px solid #ffb703' : '4px solid #00a884';
            
            let color = isMe ? '#ffb703' : '#00a884';
            
            // XSS Protection
            const sanitize = window.sanitizeHTML || (str => str ? str.toString().replace(/[&<>'"]/g, t => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[t] || t)) : '');

            li.innerHTML = `<strong style="color: ${color};">${sanitize(msg.sender)}:</strong> ${sanitize(msg.text)}`;
            li.setAttribute('aria-label', `${msg.sender}: ${msg.text}`);
            privateChatMessages.appendChild(li);
            
            const pContainer = document.querySelector('#private-chat-panel .chat-messages-container');
            if (pContainer) pContainer.scrollTop = pContainer.scrollHeight;
            
            if (!isMe && window.isPrivateChatOpen) {
                if (window.chatReceiveSound) window.chatReceiveSound.play();
                const liveAnnouncer = document.getElementById('sr-chat-reader');
                if (liveAnnouncer) {
                    liveAnnouncer.innerText = `Ã–zel mesaj: ${msg.sender} ${msg.text} yazdÄ±.`;
                }
            }
        });
    };

    window.closePrivateChat = function() {
        if (!privateChatPanel) return;
        window.isPrivateChatOpen = false;
        privateChatPanel.style.display = 'none';
        privateChatPanel.setAttribute('aria-hidden', 'true');
        if (privateChatListenerRef) {
            privateChatListenerRef.off();
            privateChatListenerRef = null;
        }
        currentPrivateRecipient = null;
        if (window.menuEnterSound) window.menuEnterSound.play();
    };

    if (privateChatCloseBtn) privateChatCloseBtn.addEventListener('click', window.closePrivateChat);

    const sendPrivateMessage = () => {
        let myName = window.currentChatUser || localStorage.getItem('chatUsername') || sessionStorage.getItem('chatNickname') || localStorage.getItem('hafizaGuvenUserNickname');
        if (!myName || !window.db || !privateChatMessageInput || !currentPrivateRecipient) return;

        let text = privateChatMessageInput.value.trim();
        if (text.length > 0) {
            if (text.length > 150) text = text.substring(0, 150);

            let roomId = getPrivateRoomId(myName, currentPrivateRecipient);
            window.fb_ozelMesajGonder(roomId, myName, currentPrivateRecipient, text);

            privateChatMessageInput.value = '';
            privateChatMessageInput.focus();
        }
    };

    if (privateChatSendBtn) privateChatSendBtn.addEventListener('click', sendPrivateMessage);
    if (privateChatMessageInput) {
        privateChatMessageInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') { e.preventDefault(); sendPrivateMessage(); }
        });
    }

    const initInboxListener = () => {
        let myName = window.currentChatUser || localStorage.getItem('chatUsername') || sessionStorage.getItem('chatNickname') || localStorage.getItem('hafizaGuvenUserNickname');
        if (!myName || !window.db || myName === "Misafir") return;
        
        let initialInboxLoad = true;
        let missedSenders = new Set();

        window.db.ref(`inbox/${myName}`).on('child_added', (snapshot) => {
            let notif = snapshot.val();
            if (!notif) return;

            if (initialInboxLoad) {
                if (!getMutedUsers().includes(notif.from)) {
                    missedSenders.add(notif.from);
                }
            } else {
                if (!getMutedUsers().includes(notif.from)) {
                    if (!window.isPrivateChatOpen || currentPrivateRecipient !== notif.from) {
                        if (window.startAdminAlert) window.startAdminAlert('message');
                        if (window.chatReceiveSound) window.chatReceiveSound.play();
                        if (window.showToastNotification) window.showToastNotification(`ÄŸÅ¸â€™Â¬ ${notif.from} size bir Ã¶zel mesaj gÃ¶nderdi.`);
                        if (window.announceToScreenReader) window.announceToScreenReader(`${notif.from} kullanÄ±cÄ±sÄ±ndan yeni bir Ã¶zel mesajÄ±nÄ±z var. Sosyal sekmesinden veya ona tÄ±klayarak ulaÅŸabilirsiniz.`);
                    }
                }
            }
            snapshot.ref.remove(); 
        });

        setTimeout(() => { 
            initialInboxLoad = false; 
            if (missedSenders.size > 0) {
                let senders = Array.from(missedSenders).join(", ");
                if (window.startAdminAlert) window.startAdminAlert('message');
                if (window.announceToScreenReader) window.announceToScreenReader(`Siz yokken ÅŸu kiÅŸilerden Ã¶zel mesaj geldi: ${senders}`, true);
                if (window.showToastNotification) window.showToastNotification(`KaÃ§Ä±rdÄ±ÄŸÄ±nÄ±z mesajlar var: ${senders}`, 'info');
            }
        }, 3000);
    };

    setTimeout(() => {
        if(window.db) initInboxListener();
    }, 2500);
});

window.addEventListener('offline', () => {
    if (window.announceToScreenReader) {
        window.announceToScreenReader("UyarÄ±: Ä°nternet baÄŸlantÄ±nÄ±z koptu. Ã‡ok oyunculu Ã¶zellikler ve sohbet ÅŸu an kullanÄ±lamaz. Ã‡evrimdÄ±ÅŸÄ± modda oynamaya devam edebilirsiniz.", true);
    }
    if (window.showToastNotification) {
        window.showToastNotification("Ä°nternet baÄŸlantÄ±sÄ± koptu!");
    }
});

window.addEventListener('online', () => {
    if (window.announceToScreenReader) {
        window.announceToScreenReader("Ä°nternet baÄŸlantÄ±sÄ± tekrar saÄŸlandÄ±. Sunucuya yeniden baÄŸlanÄ±lÄ±yor.", true);
    }
    if (window.showToastNotification) {
        window.showToastNotification("Ä°nternet geri geldi!");
    }
});

// --- NVDA Ä°Ã‡Ä°N MESAJ KUYRUÃ„ÂU SÄ°STEMÄ° ---
if (!window.orijinalAnnounce) {
    window.orijinalAnnounce = window.announceToScreenReader;
    window.srMesajKuyrugu = [];
    window.srOkuyorMu = false;
    
    window.announceToScreenReader = function(text, forceFocus = false) {
        window.srMesajKuyrugu.push({ text: text, forceFocus: forceFocus });
        window.srKuyruguIslet();
    };
    
    window.srKuyruguIslet = function() {
        // EÄŸer okuma devam ediyorsa veya kuyruk boÅŸsa dur
        if (window.srOkuyorMu || window.srMesajKuyrugu.length === 0) return;
        
        window.srOkuyorMu = true;
        const siradaki = window.srMesajKuyrugu.shift(); // Kuyruktan ilk mesajÄ± al
        
        // Orijinal okuma fonksiyonunu Ã§aÄŸÄ±r
        window.orijinalAnnounce(siradaki.text, siradaki.forceFocus);
        
        // Okuma sÃ¼resi tahmini: Harf baÅŸÄ±na ortalama 70ms + 1 saniye bekleme payÄ±
        const okumaSuresi = Math.max(1500, (siradaki.text.length * 70) + 1000);
        
        // AÅŸama 1'de kurduÄŸumuz ajan zamanlayÄ±cÄ±sÄ±nÄ± kullanarak sÄ±radaki mesaja geÃ§
        window.hgfzZamanlayici.setTimeout(() => {
            window.srOkuyorMu = false;
            window.srKuyruguIslet(); // Kuyrukta bekleyen varsa devam et
        }, okumaSuresi);
    };
}

