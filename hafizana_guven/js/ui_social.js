// --- PRESENCE (VARLIK) & SOSYAL LİSTE SİSTEMİ ---
window.initPresenceSystem = function() {
    const checkDb = setInterval(() => {
        if (window.db) {
            clearInterval(checkDb);

            // --- Geliştirici Bilet (Geri Bildirim) Bildirimleri ---
            let devNameForTickets = window.currentChatUser || localStorage.getItem('chatUsername') || sessionStorage.getItem('chatNickname') || localStorage.getItem('hafizaGuvenUserNickname') || "";
            if (['ekrem'].includes(devNameForTickets.toLowerCase())) {
                let isInitialFbLoad = true;
                window.db.ref('feedbacks').on('child_added', (snapshot) => {
                    if (!isInitialFbLoad) {
                        let fb = snapshot.val();
                        if (window.startAdminAlert) window.startAdminAlert('ticket');
                        let msg = `YENİ BİLET GELDİ! Gönderen: ${fb.name || fb.nickname || "Bilinmiyor"}. Okumak için sohbete /bilet yazın.`;
                        if (window.announceToScreenReader) window.announceToScreenReader(msg, true);
                        if (window.showToastNotification) window.showToastNotification(msg, "warning");
                    }
                });
                
                window.db.ref('feedbacks').once('value').then(snapshot => {
                    isInitialFbLoad = false;
                    if (snapshot.exists() && snapshot.hasChildren()) {
                        let totalTickets = snapshot.numChildren();
                        setTimeout(() => {
                            if (window.startAdminAlert) window.startAdminAlert('ticket');
                            let msg = `Sistemde bekleyen ${totalTickets} adet açık bilet (geri bildirim) var. İncelemek için sohbete /bilet yazın.`;
                            if (window.announceToScreenReader) window.announceToScreenReader(msg, false);
                            if (window.showToastNotification) window.showToastNotification(msg, "info");
                        }, 6000);
                    }
                });
            }
            // ----------------------------------------------------

            window.db.ref('.info/serverTimeOffset').on('value', snap => {
                window.serverTimeOffset = snap.val() || 0;
            });

            const connectedRef = window.db.ref('.info/connected');
            
            let wasConnected = false;
            let initialConnectionDone = false;
            connectedRef.on('value', (snap) => {
                let myName = window.currentChatUser || localStorage.getItem('chatUsername') || sessionStorage.getItem('chatNickname') || localStorage.getItem('hafizaGuvenUserNickname');
                if (!myName || myName.trim() === '' || myName === "Misafir") return;

                let safeId = myName.replace(/[.#$\[\]\/]/g, '_');
                let presenceRef = window.db.ref('presence/' + safeId);
                
                if (snap.val() === true) {
                    if (wasConnected === false && initialConnectionDone) {
                        if (window.announceToScreenReader) window.announceToScreenReader("Sunucuya yeniden bağlandı.", true);
                    }
                    wasConnected = true;
                    initialConnectionDone = true;
                    presenceRef.onDisconnect().set({ 
                        state: 'disconnected', 
                        name: myName,
                        last_changed: firebase.database.ServerValue.TIMESTAMP 
                    }).then(() => {
                        presenceRef.set({ 
                            state: 'online', 
                            name: myName,
                            last_changed: firebase.database.ServerValue.TIMESTAMP 
                        });
                    });
                } else {
                    if (wasConnected) {
                        if (window.announceToScreenReader) window.announceToScreenReader("Sunucu bağlantınız kesildi.", true);
                        wasConnected = false;
                    }
                }
            });

            window.addEventListener('beforeunload', () => {
                let myName = window.currentChatUser || localStorage.getItem('chatUsername') || sessionStorage.getItem('chatNickname') || localStorage.getItem('hafizaGuvenUserNickname');
                if (myName && myName !== "Misafir" && window.db) {
                    let safeId = myName.replace(/[.#$\[\]\/]/g, '_');
                    window.db.ref('presence/' + safeId).set({ 
                        state: 'offline', 
                        name: myName,
                        last_changed: firebase.database.ServerValue.TIMESTAMP 
                    });
                }
            });

            let isFirstPresenceLoad = true;
            window.db.ref('presence').on('value', (snap) => {
                let newData = snap.val() || {};
                let oldData = window.lastPresenceData || {};
                let myName = window.currentChatUser || localStorage.getItem('chatUsername') || sessionStorage.getItem('chatNickname') || localStorage.getItem('hafizaGuvenUserNickname');
                
                let currentServerTime = Date.now() + (window.serverTimeOffset || 0);

                if (!isFirstPresenceLoad) {
                    for (let k in newData) {
                        let newP = newData[k];
                        let oldP = oldData[k];
                        if (newP.name && newP.name !== myName && newP.name !== "Misafir") {
                            // Spam Koruması: Sadece son 15 saniye içindeki olayları anons et (Oyuna ilk girişteki birikmiş spam mesajlarını engeller)
                            let isRecent = newP.last_changed ? (currentServerTime - newP.last_changed < 15000) : false;
                            let disableOnlineStatus = localStorage.getItem('hafizaGuvenDisableOnlineStatus') === 'true';
                            
                            if (isRecent && !disableOnlineStatus) {
                                if (newP.state === 'online' && (!oldP || oldP.state !== 'online')) {
                                    if (window.playerOnlineSound) window.playerOnlineSound.play();
                                    if (window.announceToScreenReader) window.announceToScreenReader(`${newP.name} çevrimiçi.`);
                                    if (window.showToastNotification) window.showToastNotification(`${newP.name} çevrimiçi.`, 'info');
                                } else if (newP.state === 'offline' && (oldP && oldP.state === 'online')) {
                                    if (window.playerOfflineSound) window.playerOfflineSound.play();
                                    if (window.announceToScreenReader) window.announceToScreenReader(`${newP.name} çevrimdışı.`);
                                    if (window.showToastNotification) window.showToastNotification(`${newP.name} çevrimdışı.`, 'info');
                                } else if (newP.state === 'disconnected' && (oldP && oldP.state === 'online')) {
                                    if (window.serverDisconnectSound) window.serverDisconnectSound.play();
                                    if (window.announceToScreenReader) window.announceToScreenReader(`${newP.name} bağlantısı koptu.`);
                                    if (window.showToastNotification) window.showToastNotification(`${newP.name} bağlantısı koptu.`, 'warning');
                                }
                            }
                        }
                    }
                    for (let k in oldData) {
                        if (!newData[k] && oldData[k].name !== myName && oldData[k].name !== "Misafir" && oldData[k].state === 'online') {
                            let disableOnlineStatus = localStorage.getItem('hafizaGuvenDisableOnlineStatus') === 'true';
                            if (!disableOnlineStatus) {
                                if (window.serverDisconnectSound) window.serverDisconnectSound.play();
                                if (window.announceToScreenReader) window.announceToScreenReader(`${oldData[k].name} bağlantısı koptu.`);
                                if (window.showToastNotification) window.showToastNotification(`${oldData[k].name} bağlantısı koptu.`, 'warning');
                            }
                        }
                    }
                }

                window.lastPresenceData = newData;
                isFirstPresenceLoad = false;

                if (window.currentActiveMenu === 'social') {
                    if (window.renderSocialList) window.renderSocialList();
                }
            });
        }
    }, 1000);
};

window.renderSocialList = function() {
    const listEl = document.getElementById('social-player-list');
    if (!listEl) return;

    let myName = window.currentChatUser || localStorage.getItem('chatUsername') || sessionStorage.getItem('chatNickname') || localStorage.getItem('hafizaGuvenUserNickname') || "Misafir";

    const emptyHtml = '<li tabindex="0" aria-label="Senden başka kimse yok.">Senden başka kimse yok.</li>';

    if (!window.lastPresenceData || Object.keys(window.lastPresenceData).length === 0) {
        listEl.innerHTML = '';
        
        const titleEl = document.getElementById('social-menu-title');
        const navBtnSocial = document.getElementById('nav-btn-social');
        let meCount = (myName !== "Misafir" && myName.trim() !== "") ? 1 : 0;
        
        if (titleEl) {
            titleEl.innerText = `Sosyal (${meCount} Kişi Çevrimiçi)`;
            titleEl.setAttribute('aria-label', `Sosyal ve oyuncu menüsü. Ã…Âuan toplam ${meCount} kişi çevrimiçi. Yön tuşlarıyla gezinebilirsiniz.`);
        }
        
        if (navBtnSocial) {
            navBtnSocial.innerText = `Sosyal (${meCount})`;
            navBtnSocial.setAttribute('aria-label', `Sosyal Menü. ${meCount} kişi çevrimiçi.`);
        }

        if (myName !== "Misafir" && myName.trim() !== "") {
            let meLi = document.createElement('li');
            meLi.style.padding = "10px";
            meLi.style.borderRadius = "8px";
            meLi.style.marginBottom = "8px";
            meLi.style.backgroundColor = "rgba(0, 168, 132, 0.15)";
            meLi.style.borderLeft = "4px solid #00a884";
            meLi.style.display = "flex";
            meLi.style.justifyContent = "space-between";
            meLi.style.alignItems = "center";
            meLi.setAttribute('aria-label', `Sadece sen varsın. ${myName} olarak çevrimiçisin.`);
            meLi.setAttribute('tabindex', '0');
            meLi.innerHTML = `<span style="font-weight: bold; color: #e9edef;">${myName} (Sen)</span><span style="font-size: 0.9rem; font-weight: bold; color: #00a884;">Çevrimiçi</span>`;
            listEl.appendChild(meLi);
        } else {
            listEl.innerHTML = emptyHtml;
        }
        return;
    }

    let players = Object.values(window.lastPresenceData).filter(p => p.state === 'online' && p.name && p.name !== "Misafir");
    
    const titleEl = document.getElementById('social-menu-title');
    const navBtnSocial = document.getElementById('nav-btn-social');
    
    let totalCount = players.length;
    if (myName !== "Misafir" && myName.trim() !== "") totalCount += 1;

    if (titleEl) {
        titleEl.innerText = `Sosyal (${totalCount} Kişi Çevrimiçi)`;
        titleEl.setAttribute('aria-label', `Sosyal ve oyuncu menüsü. Ã…Âuan toplam ${totalCount} kişi çevrimiçi. Yön tuşlarıyla gezinebilirsiniz.`);
    }
    
    if (navBtnSocial) {
        navBtnSocial.innerText = `Sosyal (${totalCount})`;
        navBtnSocial.setAttribute('aria-label', `Sosyal Menü. ${totalCount} kişi çevrimiçi.`);
    }

    if (players.length === 0) {
        listEl.innerHTML = emptyHtml;
        return;
    }

    players.sort((a, b) => {
        if (a.state === 'online' && b.state !== 'online') return -1;
        if (a.state !== 'online' && b.state === 'online') return 1;
        return (a.name || '').localeCompare(b.name || '');
    });

    listEl.innerHTML = '';
    
    // Kullanıcının kendisini HER ZAMAN listenin en başına ekle
    if (myName !== "Misafir" && myName.trim() !== "") {
        let meLi = document.createElement('li');
        meLi.style.padding = "10px";
        meLi.style.borderRadius = "8px";
        meLi.style.marginBottom = "8px";
        meLi.style.backgroundColor = "rgba(0, 168, 132, 0.15)";
        meLi.style.borderLeft = "4px solid #00a884";
        meLi.style.display = "flex";
        meLi.style.justifyContent = "space-between";
        meLi.style.alignItems = "center";
        meLi.setAttribute('aria-label', `Sen. ${myName} olarak çevrimiçisin.`);
        meLi.setAttribute('tabindex', '0');
        meLi.innerHTML = `<span style="font-weight: bold; color: #e9edef;">${myName} (Sen)</span><span style="font-size: 0.9rem; font-weight: bold; color: #00a884;">Çevrimiçi</span>`;
        listEl.appendChild(meLi);
    }
    
    let foundAny = false;

    players.forEach(p => {
        if (!p.name || p.name === myName) return; // Kendini listede gösterme
        foundAny = true;
        let isOnline = (p.state === 'online');
        
        let li = document.createElement('li');
        li.style.padding = "10px";
        li.style.borderRadius = "8px";
        li.style.marginBottom = "8px";
        li.style.backgroundColor = isOnline ? "rgba(0, 168, 132, 0.15)" : "rgba(80, 80, 80, 0.15)";
        li.style.borderLeft = isOnline ? "4px solid #00a884" : "4px solid #555";
        li.style.display = "flex";
        li.style.justifyContent = "space-between";
        li.style.alignItems = "center";
        li.style.cursor = "pointer";

        let nameSpan = document.createElement('span');
        nameSpan.style.fontWeight = "bold";
        nameSpan.style.color = isOnline ? "#e9edef" : "#aaaaaa";
        nameSpan.innerText = p.name;

        let statusSpan = document.createElement('span');
        statusSpan.style.fontSize = "0.9rem";
        statusSpan.style.fontWeight = "bold";
        statusSpan.style.color = isOnline ? "#00a884" : "#888888";
        statusSpan.innerText = isOnline ? "Çevrimiçi" : "Çevrimdışı";

        li.setAttribute('aria-label', `${p.name} kullanıcısı şuan ${isOnline ? "çevrimiçi" : "çevrimdışı"}. İşlem yapmak için tıklayın veya Enter'a basın.`);
        li.setAttribute('tabindex', '0');

        const triggerAction = () => {
            if (window.openSocialActionModal) window.openSocialActionModal(p.name);
        };
        
        li.addEventListener('click', triggerAction);
        li.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                triggerAction();
            }
        });

        li.appendChild(nameSpan);
        li.appendChild(statusSpan);
        listEl.appendChild(li);
    });

    if (!foundAny && (myName === "Misafir" || myName.trim() === "")) {
        listEl.innerHTML = emptyHtml;
    }
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', window.initPresenceSystem);
} else {
    window.initPresenceSystem();
}

