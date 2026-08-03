// --- CANLI SOHBET SİSTEMİ ARAYÜZ MANTIÃ„ÂI ---
window.isChatOpen = false;

// --- ANLIK BİLDİRİM (TOAST) FONKSİYONU ---
window.showToastNotification = function(text) {
    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.setAttribute('aria-hidden', 'true');
    toast.innerText = text;
    document.body.appendChild(toast);
    
    // Görünür yap
    setTimeout(() => toast.classList.add('show'), 50);

    // 3.5 saniye sonra kaldır
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300); // animasyon bekleme süresi
    }, 3500);
};

document.addEventListener('DOMContentLoaded', () => {
    // NVDA Hayalet Ekran Koruması: Sayfa ilk açıldığında kapalı olan tüm menüleri "inert" yap
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
        // Canlı Sohbet butonu oyun genelinde görünsün ama ilk açılışta okuyucu odağına takılmasın diye
        // Sadece PvP lobisi ve genel oyun odasında aktif hale gelmeli
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
            // Sohbet açıldığında geçmiş mesajların görünmesi için en alta kaydır
            const chatMessagesContainer = document.querySelector('.chat-messages-container');
            if (chatMessagesContainer) {
                setTimeout(() => {
                    chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
                }, 50);
            }
            if (window.announceToScreenReader) {
                if (chatNicknameInput && chatNicknameInput.style.display === 'none') {
                    window.announceToScreenReader('Canlı sohbet açıldı. Mesajınızı yazabilirsiniz.', false);
                } else {
                    window.announceToScreenReader('Canlı sohbet açıldı. Takma adınızı girin.', false);
                }
            }

            // Presence Aşama 2: İlk Katılım ve Çıkış Kancası
            if (window.hasJoinedChat === false && window.db) {
                window.hasJoinedChat = true;
                
                // İlk katılım mesajı (Sistem bildirimleri kalıcı olarak sohbete itilmeyecek)
                
                // Başlangıç Çıkış Kancası (Sohbet kanalına "çevrimdışı oldu" spamlamasını kaldırdık)
                if (window.disconnectRef) { window.disconnectRef.onDisconnect().cancel(); }
                // disconnectRef artık sadece presence için kullanılacak, messages kanalını kirletmeyecek.
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

            if (window.announceToScreenReader) window.announceToScreenReader('Canlı sohbet kapatıldı.', false);
        }
    };

    // Nokta (.) kısayolu, ESC tuşu ve Ok Tuşlarıyla Gezinme
    document.addEventListener('keydown', (e) => {
        // Nokta (.) tuşuyla sohbeti SADECE aç
        if (e.key === '.' && !window.isChatOpen && (!document.activeElement || (document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA' && document.activeElement.tagName !== 'SELECT'))) {
            window.toggleChat();
        }
        
        // ESC tuşuyla sohbeti hızlıca kapat
        if (e.key === 'Escape' && window.isChatOpen) {
            window.toggleChat();
        }
        
        // Sohbet mesajlarında Yukarı/Aşağı ok tuşu ile gezinme
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

    // Mobil: İki Parmakla Çift Dokunma (2-Finger Double Tap) Jest Algılayıcısı
    let lastTwoFingerTap = 0;
    document.addEventListener('touchstart', (e) => {
        // Eğer focus input/textarea/select üzerindeyse yoksay (yazışmayı bölmesin)
        if (document.activeElement && (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA' || document.activeElement.tagName === 'SELECT')) {
            return;
        }

        // Tam olarak 2 parmak ekrandaysa
        if (e.touches.length === 2) {
            const currentTime = new Date().getTime();
            const tapLength = currentTime - lastTwoFingerTap;
            
            // Eğer önce iki parmak dokunup hemen ardından tekrar 2 parmak dokunduysa (Çift Dokunuş)
            // Süre aralığı 400ms'den kısa olmalı (mobil cihazlardaki tipik çift tıklama hızı)
            if (tapLength < 450 && tapLength > 0) {
                if (typeof window.toggleChat === 'function') {
                    window.toggleChat();
                    // Ekran okuyuculardan veya Safari'den varsayılan olay sızmasını engellemek
                    if (e.cancelable) {
                        e.preventDefault();
                    }
                }
            }
            lastTwoFingerTap = currentTime;
        }
    }, { passive: false });
});

// --- CANLI SOHBET SİSTEMİ VERİTABANI (FİREBASE) MANTIÃ„ÂI ---
document.addEventListener('DOMContentLoaded', () => {
    const chatNicknameInput = document.getElementById('chat-nickname');
    const chatMessageInput = document.getElementById('chat-message-input');
    const chatSendBtn = document.getElementById('chat-send-btn');
    const chatMessagesList = document.getElementById('chat-messages');
    const chatMessagesContainer = document.querySelector('.chat-messages-container');
    
    // Presence (Durum) Değişkenleri (Global olarak ayarlandı)
    const savedNickname = localStorage.getItem('chatUsername') || sessionStorage.getItem('chatNickname');
    window.currentChatUser = savedNickname ? savedNickname : "Misafir";
    window.hasJoinedChat = false;

    // Firebase tanımlı değilse veya arayüz yoksa dur
    if (!chatSendBtn || !chatMessagesList || !window.db) return;

    // Oturumda veya kalıcı hafızada daha önce kaydedilmiş bir Takma Ad varsa onu otomatik yükle ve kutuyu gizle
    if (savedNickname) {
        chatNicknameInput.value = savedNickname;
        chatNicknameInput.style.display = 'none'; // Kullanıcı adı bir kere girildikten sonra sekme kapanana kadar veya kalıcı olarak gizlenir
    }

    // Takma ad kutusundayken de Enter'a basılırsa mesaj gönderilsin
    if (chatNicknameInput) {
        chatNicknameInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                sendMessage();
            }
        });
    }

    // Güvenlik (XSS) Koruması (HTML etiketlerini etkisiz hale getir)
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

    // Mesaj Gönderme İşlevi
    function sendMessage() {
        let nickInput = document.getElementById('chat-nickname');
        let msgInput = document.getElementById('chat-message-input');

        // Boşlukları tıraşla
        let nickVal = nickInput ? nickInput.value.trim() : "";
        let msgVal = msgInput ? msgInput.value.trim() : "";

        if (nickVal === "" || msgVal === "") {
            // Mesaj veya isim tamamen boşluktan ibaretse veya boşsa
            if (window.wrongSound) window.wrongSound.play();
            let uyari = "Lütfen geçerli bir takma ad ve mesaj girin. Boş mesaj gönderilemez.";
            if (window.announceToScreenReader) window.announceToScreenReader(uyari);
            
            // İmleci eksik olan yere odakla
            if (nickVal === "" && nickInput) nickInput.focus();
            else if (msgInput) msgInput.focus();
            
            return; // Gönderimi iptal et ve sistemi koru!
        }

        const nickname = nickVal;
        const text = msgVal;

        // Firebase Yolu Kuralı: İsimlerde '.', '#', '$', '[', ']' veya '/' kullanılamaz. 
        // Aksi takdirde uygulama sessizce ve senkron olarak çöker.
        if (/[.#$\[\]\/]/.test(nickname)) {
            if (window.wrongSound) window.wrongSound.play();
            let uyari = "Kullanıcı adınızda geçersiz karakterler bulunuyor. Lütfen nokta veya köşeli parantez gibi hatalı sembolleri silin.";
            if (window.announceToScreenReader) window.announceToScreenReader(uyari);
            if (nickInput) {
                // Temizleyerek otomatik düzeltilmiş halini sun
                nickInput.value = nickname.replace(/[.#$\[\]\/]/g, '');
                nickInput.focus();
            }
            return; // Çökmesini önle
        }

        // KULLANICI ADI GÜVENLİK (REGISTRATION) KONTROLÜ
        let myDevId = localStorage.getItem('hafizaGuvenDeviceId');
        if (!myDevId) {
            myDevId = 'dev_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
            localStorage.setItem('hafizaGuvenDeviceId', myDevId);
        }

        window.db.ref('registeredUsers/' + nickname).once('value').then(snapshot => {
            const existingOwner = snapshot.val();
            
            // Eğer başkasına aitse durdur
            if (existingOwner && existingOwner !== myDevId) {
                if (window.wrongSound) window.wrongSound.play();
                let uyari = `"${nickname}" kullanıcı adı daha önce başkası tarafından alınmış. Lütfen farklı bir isim seçin.`;
                if (window.announceToScreenReader) window.announceToScreenReader(uyari);
                let desc = document.getElementById('chat-desc') || document.getElementById('sr-chat-reader');
                if (desc) desc.textContent = "Bağlantı Hatası: Kullanıcı adı kullanımda.";
                
                if (nickInput) {
                    nickInput.value = "";
                    nickInput.focus();
                }
                return;
            }

            // Yeni kullanıcı adı ise benim adıma kaydet
            if (!existingOwner) {
                window.db.ref('registeredUsers/' + nickname).set(myDevId);
            }

            // Artık nick bize ait. Uygulama hafızasına kalıcı kaydet.
            localStorage.setItem('chatUsername', nickname);
            window.currentChatUser = nickname;

            if (nickInput) {
                nickInput.style.display = 'none'; // Başarıyla kilitlendi, bir daha sorma
            }

            // --- GİZLİ SOHBET KOMUTLARI (CLIENT-SIDE) ---
            if (text.startsWith('/')) {
                const args = text.split(' ');
                const command = args[0].toLowerCase();
                const chatMessagesListLocal = document.getElementById('chat-messages');
            const chatMessagesContainerLocal = document.querySelector('.chat-messages-container');
            const chatMessageInputLocal = document.getElementById('chat-message-input');
            
            // Kullanıcı Geliştirici Mi Kontrolü
            let cUserNick = window.currentChatUser || "";
            let nickInputTemp = document.getElementById('chat-nickname');
            if (nickInputTemp && nickInputTemp.value.trim() !== "") cUserNick = nickInputTemp.value.trim();
            let isDev = ['ekrem'].includes(cUserNick.toLowerCase());

            function addLocalSystemMessage(msgText) {
                // Sadece ekranda anlık (toast) gösterip ekran okuyucuya okutuyoruz.
                // Chat listesini (DOM'u) kalıcı olarak işgal edip kalabalık yapmasını engelledik.
                if (window.showToastNotification) {
                    window.showToastNotification(msgText, "info");
                }
                if (window.announceToScreenReader) {
                    window.announceToScreenReader(msgText, false);
                }
            }

            if (command === '/temizle') {
                if (!isDev) { addLocalSystemMessage("Hata: Bu işlem için 'Geliştirici' yetkiniz yok."); return; }
                if (chatMessagesListLocal) chatMessagesListLocal.innerHTML = '';
                addLocalSystemMessage("Sohbet geçmişiniz (sadece sizin ekranınızda) temizlendi.");
                
                // GİZLİ GLOBAL SIFIRLAMA KOMUTU
                if (window.db) {
                    window.db.ref('player_stats').remove();
                    window.db.ref('global_wipe_timestamp').set(firebase.database.ServerValue.TIMESTAMP);
                    addLocalSystemMessage("DİKKAT: Global Wipe (Küresel Sıfırlama) Komutu çalıştırıldı! Tüm oyuncuların istatistikleri ve Firebase bulut yedekleri siliniyor...");
                }
            } else if (command === '/saat' || command === '/zaman') {
                addLocalSystemMessage("Ã…Âu anki cihaz saati: " + new Date().toLocaleTimeString('tr-TR'));
            } else if (command === '/jeton' || command === '/bakiye') {
                const totalTokensLocal = parseInt(localStorage.getItem('hafizaGuvenTotalTokens')) || 0;
                addLocalSystemMessage(`Cüzdanınızdaki mevcut bakiye: ${totalTokensLocal} jeton.`);
            } else if (command === '/bilet') {
                if (isDev) {
                    if (window.stopAdminAlert) window.stopAdminAlert('ticket');
                    addLocalSystemMessage("Sistemdeki tüm açık biletler (Geri bildirimler) taranıyor...");
                    if (window.db) {
                        window.db.ref('feedbacks').once('value').then(snapshot => {
                            if (!snapshot.exists() || !snapshot.hasChildren()) {
                                addLocalSystemMessage("Sistemde açık hiçbir bilet/geri bildirim bulunmuyor. Harika!");
                            } else {
                                let count = 0;
                                snapshot.forEach(child => {
                                    count++;
                                    let fb = child.val();
                                    addLocalSystemMessage(`Açık Bilet #${count} [Gönderen: ${fb.nickname}] => ${fb.message}`);
                                });
                                addLocalSystemMessage(`Toplam ${count} adet açık bilet listelendi. Yanıtlamak ve çözmek için: /çöz <takma_ad> <mesajınız>`);
                            }
                        });
                    }
                } else {
                    let currentUser = window.currentChatUser;
                    let nickInputValue = chatMessageInputLocal && document.getElementById('chat-nickname') ? document.getElementById('chat-nickname').value.trim() : "";
                    if (nickInputValue !== "") currentUser = nickInputValue;
                    
                    if (!currentUser || currentUser === "Misafir") {
                        addLocalSystemMessage("Biletlerinizi sorgulamak için bir takma ad belirlemiş olmanız gerekir.");
                    } else {
                        addLocalSystemMessage("Biletleriniz sorgulanıyor, lütfen bekleyin...");
                        if (window.db) {
                            let biletFound = false;
                            let count = 0;
                            
                            // 1. Henüz çözülmemiş, gönderilen açık biletleri kontrol et
                            window.db.ref('feedbacks').once('value').then(snapshot => {
                                if (snapshot.exists()) {
                                    snapshot.forEach(child => {
                                        let fb = child.val();
                                        if (fb.nickname && fb.nickname.toLowerCase() === currentUser.toLowerCase()) {
                                            count++;
                                            biletFound = true;
                                            addLocalSystemMessage(`Bilet #${count} | Durum: Geliştiriciye ulaştı, inceleniyor âÂÂ³ | Ã…Âikayetiniz: ${fb.message}`);
                                        }
                                    });
                                }
                                
                                // 2. Çözülmüş veya yönetici tarafından yanıtlanmış biletleri kontrol et
                                window.db.ref('biletler/' + currentUser).once('value').then(snap2 => {
                                    if (snap2.exists() && snap2.hasChildren()) {
                                        snap2.forEach(child => {
                                            count++;
                                            biletFound = true;
                                            let biletData = child.val();
                                            let mesaj = typeof biletData === 'string' ? biletData : (biletData.message || biletData.mesaj || "Tanımsız");
                                            
                                            addLocalSystemMessage(`Bilet #${count} | Durum: Çözüldü âÅ“â€¦ (Otomatik silindi) | Geliştirici Yanıtı: ${mesaj}`);
                                            child.ref.remove(); // Okunduğu için sil
                                        });
                                    }
                                    
                                    if (!biletFound) {
                                        addLocalSystemMessage("Ã…Âu anda adınıza tanımlı açık veya yeni çözülmüş hiçbir bilet bulunamadı.");
                                    } else {
                                        addLocalSystemMessage(`Toplam ${count} adet bilet-kayıt listelendi.`);
                                    }
                                });
                            }).catch(err => {
                                addLocalSystemMessage("Bağlantı hatası: Bilet veritabanına ulaşılamadı.");
                            });
                        } else {
                            addLocalSystemMessage("Veritabanı bağlantısı yok.");
                        }
                    }
                }
            } else if (command === '/yardim' || command === '/yardım') {
                addLocalSystemMessage("Mevcut komutlar: /temizle, /saat, /jeton, /bilet, /ziyaretci, /yardım.");
            } else if (command === '/ziyaretci' || command === '/ziyaretçi') {
                if (!isDev) { 
                    addLocalSystemMessage("Hata: Bu komut sadece geliştiriciye özeldir."); 
                } else {
                    addLocalSystemMessage("Site ziyaretçi istatistikleri çekiliyor...");
                    if (window.db) {
                        window.db.ref('site_stats/total_visitors').once('value').then(snap => {
                            let total = snap.val() || 0;
                            addLocalSystemMessage(`Mikyas Studio Web Sitenizi Toplam Ziyaret Eden Kişi Sayısı: ${total}`);
                        }).catch(() => addLocalSystemMessage("Ziyaretçi sayacı okunamadı."));
                        
                        window.db.ref('site_visitors').orderByChild('timestamp').limitToLast(5).once('value').then(snap => {
                            if (snap.exists()) {
                                addLocalSystemMessage("Son 5 ziyaretçinin giriş saatleri:");
                                let count = 0;
                                snap.forEach(child => {
                                    count++;
                                    let v = child.val();
                                    let dateStr = v.timestamp ? new Date(v.timestamp).toLocaleString('tr-TR') : "Bilinmeyen Tarih";
                                    addLocalSystemMessage(`[Ziyaretçi ${count}] Giriş: ${dateStr}`);
                                });
                            }
                        });
                    }
                }
            } else {
                addLocalSystemMessage("Bilinmeyen komut. Komutları öğrenmek için /yardım yazabilirsiniz.");
            }

            if (chatMessageInputLocal) {
                chatMessageInputLocal.value = '';
                chatMessageInputLocal.focus();
            }
            return; // Firebase veritabanına göndermeden sadece oyuncunun ekranında çalıştır ve bitir!
        }

        // Spam Kalkanı: 2 Saniye Bekleme Süresi
        let now = Date.now();
        window.lastMessageTime = window.lastMessageTime || 0;

        if (now - window.lastMessageTime < 2000) {
            if (window.wrongSound) window.wrongSound.play();
            let spamUyari = "Çok hızlı mesaj gönderiyorsunuz. Lütfen biraz bekleyin.";
            if (window.announceToScreenReader) window.announceToScreenReader(spamUyari);
            return; // Gönderimi iptal et ve sistemi koru!
        }

        // Süre kuralına uyulduysa yeni zamanı kaydet ve işleme devam et
        window.lastMessageTime = now;

        if (nickname.toLowerCase() === 'sistem') {
            if (window.announceToScreenReader) window.announceToScreenReader('Bu takma adı kullanamazsınız.', false);
            chatNicknameInput.focus();
            return;
        }

        if (text === '') {
            if (window.announceToScreenReader) window.announceToScreenReader('Lütfen bir mesaj yazın.', false);
            chatMessageInput.focus();
            return;
        }

        if (text.toLowerCase().startsWith('/rutbe ') || text.toLowerCase().startsWith('/rütbe ')) {
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
                    if (window.announceToScreenReader) window.announceToScreenReader(`${targetUser} kullanıcısının rütbesi başarıyla ${newRank} yapıldı.`, true);
                    chatMessageInput.value = '';
                }).catch(err => {
                    if (window.announceToScreenReader) window.announceToScreenReader("Rütbe değiştirilirken bir hata oluştu.", true);
                });
            } else {
                if (window.announceToScreenReader) window.announceToScreenReader("Kullanım: /rütbe [kullanıcı_adı] [yeni_rütbe]", true);
            }
            return;
        }

        if (nickname !== '' && text !== '') {
            const messageData = {
                nickname: nickname,
                text: text,
                timestamp: firebase.database.ServerValue.TIMESTAMP
            };

            // Presence Aşama 2: İsim Güncelleme ve Kanca Yenileme
            if (nickname !== window.currentChatUser && nickname !== "Sistem") {
                window.currentChatUser = nickname;
                if (window.disconnectRef) {
                    window.disconnectRef.onDisconnect().cancel();
                    // Yeni bir mesaj hook'u eklemiyoruz ki sohbeti kirletmesin.
                }
            }

            window.fb_mesajGonder(messageData).then(() => {

                // Başarılı gönderim sonrası Takma Adı oturuma VE KALICI DEPOLAMAYA kaydet
                localStorage.setItem('chatUsername', nickname);
                sessionStorage.setItem('chatNickname', nickname);
                chatNicknameInput.style.display = 'none';
                
                chatMessageInput.value = ''; // Mesaj formunu temizle
                
                // Oyuna hızlıca devam edilebilmesi için sohbet penceresini otomatik kapat
                if (window.isChatOpen && typeof window.toggleChat === 'function') {
                    window.toggleChat();
                }

                // Mesajın başarıyla gönderildiğini bildir (pencere kapanma anonsu ile karışmaması için 100ms gecikme)
                setTimeout(() => {
                    if (window.announceToScreenReader) {
                        window.announceToScreenReader('Mesaj gönderildi.', false);
                    }
                }, 100);
            }).catch(error => {
                console.error("Mesaj gönderilirken hata oluştu:", error);
                
                // Hata durumunda uyar
                if (window.announceToScreenReader) {
                    window.announceToScreenReader('Hata: Mesaj gönderilemedi. Lütfen bağlantınızı kontrol edin.', true);
                }
            });
        }
        }); // END OF registeredUsers Check
    }

    // Gönder butonuna tıklandığında
    chatSendBtn.addEventListener('click', sendMessage);

    // Mesaj kutusundayken Enter'a basıldığında
    chatMessageInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            sendMessage();
        }
    });

    // Mesajları Dinleme İşlevi (Sadece son 50 mesaj)
    // Firebase push() anahtarları zaten kronolojik olduğu için orderByChild'a gerek yoktur, bu sayede Index hatası vermez ve geçmişi kesin yükler.
    
    window.playerRanks = {};
    window.db.ref('ranks').on('value', snap => {
        window.playerRanks = snap.val() || {};
        let myName = window.currentChatUser || localStorage.getItem('chatUsername') || sessionStorage.getItem('chatNickname') || localStorage.getItem('hafizaGuvenUserNickname') || "Bilinmeyen";
        if (myName !== "Bilinmeyen") {
            let myRank = "Oyuncu";
            let isimKucuk = myName.toLowerCase();
            if (['ekrem'].includes(isimKucuk)) {
                myRank = "Geliştirici";
            } else if (window.playerRanks && window.playerRanks[isimKucuk]) {
                myRank = window.playerRanks[isimKucuk];
            }
            let r_el = document.getElementById('profile-player-rank');
            if (r_el) r_el.innerText = myRank;
        }
    });

    const messagesRef = window.db.ref('messages').limitToLast(50);
    const chatLoadTime = Date.now();
    let isChatHistoryLoaded = false;
    
    // Veritabanı boşsa "Hiç mesaj yok" uyarısı ekleme
    messagesRef.once('value', (snapshot) => {
        isChatHistoryLoaded = true;
        if (!snapshot.exists()) {
            const li = document.createElement('li');
            li.id = 'empty-chat-warning';
            li.classList.add('system-message');
            const srText = `<span style="position:absolute; width:1px; height:1px; overflow:hidden; clip:rect(0,0,0,0);">Sistem mesajı: Bu sohbet kutusunda hiç mesaj yok. İlk mesajınızı göndermek için güzel bir zaman.</span>`;
            li.innerHTML = `${srText}<div class="wp-bubble" aria-hidden="true" style="opacity: 0.8;">Bu sohbet kutusunda hiç mesaj yok.<br>İlk mesajınızı göndermek için güzel bir zaman. ğÅ¸â€˜â€¹</div>`;
            chatMessagesList.appendChild(li);
        }
    });

    messagesRef.on('child_added', (snapshot) => {
        // Eğer boş sohbet uyarısı ekranda duruyorsa, ilk mesaj geldiğinde onu sil!
        const emptyWarning = document.getElementById('empty-chat-warning');
        if (emptyWarning) {
            emptyWarning.remove();
        }

        const data = snapshot.val();
        if (!data) return;

        let mutedUsers = JSON.parse(localStorage.getItem('hafizaGuvenMutedUsers') || "[]");
        if (mutedUsers.includes(data.nickname)) return; // Sessize alınmış kişinin mesajını engelledik
        
        let timeString = "";
        let timeRaw = "";
        let ts = data.timestamp;
        
        // Yerel itme anında (Optimistic Render) TIMESTAMP obje veya hatalı olabilir, bu durumda geçici yerel cihaz saati kullanılır
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
            // Sistem mesajlarını sohbet listesine (DOM'a) ekleme, anlık bildirim (toast) olarak yansıt
            if (isChatHistoryLoaded) {
                if (window.showToastNotification) {
                    window.showToastNotification(data.text);
                }
            }
        } else {
            const li = document.createElement('li');
            li.setAttribute('tabindex', '0');
            
            // Rütbe Belirleme
            let isimKucuk = (data.nickname || "").toLowerCase();
            let isDevRender = ['ekrem'].includes(isimKucuk);
            let rutbe = "Oyuncu";
            if (isDevRender) {
                rutbe = "Geliştirici";
            } else if (window.playerRanks && window.playerRanks[isimKucuk]) {
                rutbe = window.playerRanks[isimKucuk];
            }
            
            // Benim gönderdiğim mesaj mı yoksa başkasının mı?
            const isMe = data.nickname === chatNicknameInput.value.trim() && chatNicknameInput.value.trim() !== "";
            li.classList.add(isMe ? 'message-out' : 'message-in');
            
            li.setAttribute('aria-label', `[${timeRaw}] ${rutbe} ${escapeHTML(data.nickname)}: ${escapeHTML(data.text)}`);
            
            let rankColor = isDevRender ? '#ffaa00' : (rutbe.toLowerCase() === 'tester' ? '#ff55ff' : (rutbe !== 'Oyuncu' ? '#55aaff' : (isMe ? '#9bbca1' : '#88acb8')));
            
            // Whatsapp Görsel Balonu
            li.innerHTML = `
                <div class="wp-bubble" aria-hidden="true">
                    ${!isMe ? `<div class="wp-sender"><span style="color:${rankColor}; font-size:0.85em;">[${rutbe}]</span> ${escapeHTML(data.nickname)}</div>` : `<div style="font-size: 0.75em; color:${rankColor}; margin-bottom: 3px;">[${rutbe}]</div>`}
                    <div class="wp-text">${escapeHTML(data.text)}</div>
                    ${timeString}
                </div>
            `;
            chatMessagesList.appendChild(li);
        }

        // Yeni mesaj gelince otomatik olarak en alta kaydır
        if (chatMessagesContainer && window.isChatOpen && data.nickname !== "Sistem") {
            // Sadece sohbet açıksa kaydır, değilse açıldığında zaten aşağıda kalması için toggleChat içine eklenecek
            setTimeout(() => {
                chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
            }, 10);
        }

        // --- NVDA için Yeni Mesajları Doğrudan Anons Etme ---
        const isMe = data.nickname === chatNicknameInput.value.trim() && chatNicknameInput.value.trim() !== "";
        let messageToRead = "";
        let isNewIncomingMessage = false;

        if (data.nickname === "Sistem") {
            messageToRead = `Sistem mesajı: ${data.text}`;
        } else {
            let isimKucuk = (data.nickname || "").toLowerCase();
            let isDevRead = ['ekrem'].includes(isimKucuk);
            let rutbe = isDevRead ? "Geliştirici" : "Oyuncu";

            messageToRead = `${rutbe} ${data.nickname}: ${data.text}`;
            if (!isMe) {
                isNewIncomingMessage = true;
            }
        }
        
        // Sadece sayfa açılışındaki geçmiş mesaj yığınını atlamak için zamanı kontrol ediyoruz
        if (isChatHistoryLoaded) {
            // Başkasından gelen mesaj ise ses çal
            if (isNewIncomingMessage && window.chatReceiveSound) {
                window.chatReceiveSound.play();
            }
            
            // "Boş" (empty) bug'ını ve PC NVDA sessizliğini uyumlu şekilde bitirmek için announceToScreenReader'ı kullanıyoruz
            if (window.announceToScreenReader) {
                window.announceToScreenReader(messageToRead, false); // forceFocus = false
            }
        }
    });

    // Sohbet penceresi açıldığında geçmiş mesajların en altına kaydırmayı garantiye almak için Observer ekleyelim
    // Veya toggleChat butonuna basıldığında scrollTop tetiklenebilir.
});

// Oyuncu oyundan çıkarken/sayfa kapanırken tüm sohbeti kalıcı olarak sıfırla (0'la)
// KRİTİK HATA DÜZELTMESİ: remove() fonksiyonu herhangi bir kullanıcı oyundan çıktığında, 
// odayı kullanan TÜM diğer oyuncuların da canlı sohbet geçmişini veritabanından kalıcı olarak silmesine (wipe) yol açıyordu! 
// Bu nedenle küresel temizlik fonsiyonu iptal edildi.
// window.addEventListener('beforeunload', () => {
//     if (window.db) {
//         window.db.ref('messages').remove();
//     }
// });

// --- GÖREV 1 Kaldırıldı (Tab yönetimi game.js'deki exception'lar ile yapılıyor) ---

// --- ÖZEL MESAJLAÃ…ÂMA (PRIVATE CHAT) VE KULLANICI İÃ…ÂLEM MENÜSÜ ---
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

        if (actionTitle) actionTitle.innerText = playerName + " İşlemleri";
        if (btnMute) {
            btnMute.innerText = isMuted ? "Susturmayı Kaldır" : "Kullanıcıyı Sustur";
            btnMute.setAttribute('aria-label', isMuted ? "Kullanıcının susturmasını kaldır" : "Kullanıcıyı sustur");
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
                window.announceToScreenReader(playerName + " detayları açıldı. Özel mesaj gönderebilir veya susturabilirsiniz.", true);
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
                if (window.announceToScreenReader) window.announceToScreenReader(window.selectedSocialPlayer + " artık size mesaj gönderebilecek.");
                if (window.showToastNotification) window.showToastNotification(window.selectedSocialPlayer + " susturması kaldırıldı.");
            } else {
                mutedUsers.push(window.selectedSocialPlayer);
                if (window.announceToScreenReader) window.announceToScreenReader(window.selectedSocialPlayer + " susturuldu. Hem özel hem global mesajları engellendi.");
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
            let msg = prompt("Bu oyuncuya iletilecek bilet çözüm mesajını girin:");
            if (msg && msg.trim() !== "" && window.db) {
                let targetUser = window.selectedSocialPlayer;
                window.fb_biletCoz(targetUser, msg);
                alert("Bilet çözüldü olarak işaretlendi ve oyuncuya iletildi.");
            }
            window.closeSocialActionModal();
        });
    }

    if (btnBan) {
        btnBan.addEventListener('click', () => {
            if (confirm(`${window.selectedSocialPlayer} adlı oyuncuyu oyundan yasaklamak istediğinize emin misiniz?`)) {
                if (window.db) {
                    window.fb_oyuncuYasakla(window.selectedSocialPlayer).then(() => {
                        alert(`${window.selectedSocialPlayer} yasaklandı.`);
                    });
                }
            }
            window.closeSocialActionModal();
        });
    }

    if (btnUnban) {
        btnUnban.addEventListener('click', () => {
            if (confirm(`${window.selectedSocialPlayer} adlı oyuncunun yasağını kaldırmak istediğinize emin misiniz?`)) {
                if (window.db) {
                    window.fb_yasakKaldir(window.selectedSocialPlayer).then(() => {
                        alert(`${window.selectedSocialPlayer} kullanıcısının yasağı kaldırıldı.`);
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
            if (window.announceToScreenReader) window.announceToScreenReader("Özel mesajlaşmak için Küresel Sohbet menüsü üzerinden onaylı bir takma ad belirlemelisiniz.", true);
            if (window.showToastNotification) window.showToastNotification("Önce Sohbet'ten takma ad alın!");
            return;
        }

        currentPrivateRecipient = recipientName;
        window.isPrivateChatOpen = true;

        if (privateChatTitle) privateChatTitle.innerText = `${recipientName} ile Özel Sohbet`;
        
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
                    liveAnnouncer.innerText = `Özel mesaj: ${msg.sender} ${msg.text} yazdı.`;
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
                        if (window.showToastNotification) window.showToastNotification(`ğÅ¸â€™Â¬ ${notif.from} size bir özel mesaj gönderdi.`);
                        if (window.announceToScreenReader) window.announceToScreenReader(`${notif.from} kullanıcısından yeni bir özel mesajınız var. Sosyal sekmesinden veya ona tıklayarak ulaşabilirsiniz.`);
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
                if (window.announceToScreenReader) window.announceToScreenReader(`Siz yokken şu kişilerden özel mesaj geldi: ${senders}`, true);
                if (window.showToastNotification) window.showToastNotification(`Kaçırdığınız mesajlar var: ${senders}`, 'info');
            }
        }, 3000);
    };

    setTimeout(() => {
        if(window.db) initInboxListener();
    }, 2500);
});

window.addEventListener('offline', () => {
    if (window.announceToScreenReader) {
        window.announceToScreenReader("Uyarı: İnternet bağlantınız koptu. Çok oyunculu özellikler ve sohbet şu an kullanılamaz. Çevrimdışı modda oynamaya devam edebilirsiniz.", true);
    }
    if (window.showToastNotification) {
        window.showToastNotification("İnternet bağlantısı koptu!");
    }
});

window.addEventListener('online', () => {
    if (window.announceToScreenReader) {
        window.announceToScreenReader("İnternet bağlantısı tekrar sağlandı. Sunucuya yeniden bağlanılıyor.", true);
    }
    if (window.showToastNotification) {
        window.showToastNotification("İnternet geri geldi!");
    }
});

// --- NVDA İÇİN MESAJ KUYRUÃ„ÂU SİSTEMİ ---
if (!window.orijinalAnnounce) {
    window.orijinalAnnounce = window.announceToScreenReader;
    window.srMesajKuyrugu = [];
    window.srOkuyorMu = false;
    
    window.announceToScreenReader = function(text, forceFocus = false) {
        window.srMesajKuyrugu.push({ text: text, forceFocus: forceFocus });
        window.srKuyruguIslet();
    };
    
    window.srKuyruguIslet = function() {
        // Eğer okuma devam ediyorsa veya kuyruk boşsa dur
        if (window.srOkuyorMu || window.srMesajKuyrugu.length === 0) return;
        
        window.srOkuyorMu = true;
        const siradaki = window.srMesajKuyrugu.shift(); // Kuyruktan ilk mesajı al
        
        // Orijinal okuma fonksiyonunu çağır
        window.orijinalAnnounce(siradaki.text, siradaki.forceFocus);
        
        // Okuma süresi tahmini: Harf başına ortalama 70ms + 1 saniye bekleme payı
        const okumaSuresi = Math.max(1500, (siradaki.text.length * 70) + 1000);
        
        // Aşama 1'de kurduğumuz ajan zamanlayıcısını kullanarak sıradaki mesaja geç
        window.hgfzZamanlayici.setTimeout(() => {
            window.srOkuyorMu = false;
            window.srKuyruguIslet(); // Kuyrukta bekleyen varsa devam et
        }, okumaSuresi);
    };
}

