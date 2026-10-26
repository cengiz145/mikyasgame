// app.js - KalpKalbe Özel Görme Engelli Çift Etkileşim Motoru

// ==============================================================================
// 1. DURUM (STATE) VE BAŞLANGIÇ AYARLARI
// ==============================================================================
const FIREBASE_BASE = "https://bgt-game-63806-default-rtdb.firebaseio.com/kalp_kalbe/";

// Sabit Başlangıç Tarihi: 1 Ağustos 2026 saat 00:00
const START_DATE = new Date("2026-08-01T00:00:00");

let state = {
  pairCode: localStorage.getItem('kk_pair_code') || generateDefaultPairCode(),
  myName: localStorage.getItem('kk_my_name') || "",
  partnerName: localStorage.getItem('kk_partner_name') || "Aşkım",
  partnerPhone: localStorage.getItem('kk_partner_phone') || "",
  myPhone: localStorage.getItem('kk_my_phone') || "",
  partnerDevice: localStorage.getItem('kk_partner_device') || "",
  myDevice: "Akıllı Telefon",
  lastReceivedPokeId: 0,
  lastReceivedCallRequestId: 0,
  lastReceivedJoinId: 0,
  lastReceivedWalkieId: 0,
  vibrationEnabled: true,
  soundEnabled: true
};

function generateDefaultPairCode() {
  const code = "ASK" + Math.floor(100 + Math.random() * 900);
  localStorage.setItem('kk_pair_code', code);
  return code;
}

// Cihazın Kendine Özgü Tekil Kimliği (Aynı anda hem telefon hem bilgisayarın açık kalabilmesi için)
const CLIENT_ID = localStorage.getItem('kk_client_id') || ('c_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36));
localStorage.setItem('kk_client_id', CLIENT_ID);

function isSelfPacket(pkt) {
  if (!pkt) return true;
  if (pkt.senderClientId && pkt.senderClientId === CLIENT_ID) return true;
  return pkt.sender === "Ben";
}

// ==============================================================================
// 2. EKRAN OKUYUCU (TALKBACK / VOICEOVER / NVDA) CANLI DUYURU
// ==============================================================================
function announceToScreenReader(text) {
  const el = document.getElementById('sr-announcer');
  if (el) {
    el.innerText = '';
    setTimeout(() => {
      el.innerText = text;
    }, 60);
  }
}

// ==============================================================================
// 3. SES VE TİTREŞİM (HAPTİK) MOTORU
// ==============================================================================
let audioCtx = null;

function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

// Dürtme / Sevgi Çınlama Sesi (Tam 3.0 Saniye Süren Zengin, Yankılı Romantik Akor)
function playPokeTone() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    // Tam 3 saniye boyunca titreşime eşlik eden sıcak, melodik aşk çanı (C5 - E5 - G5 - C6)
    playTone(ctx, 523.25, now, 1.4, 0.25);
    playTone(ctx, 659.25, now + 0.3, 1.4, 0.25);
    playTone(ctx, 783.99, now + 0.65, 1.6, 0.28);
    playTone(ctx, 1046.50, now + 1.0, 2.0, 0.35);
  } catch (e) {
    console.warn("Ses çalınamadı:", e);
  }
}

// Telsiz Mandal Açılış / Kapanış (Roger) Bip Sesi
function playWalkieChirp(start) {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    if (start) {
      // Mandal basıldı: iki canlı yükselen bip
      playTone(ctx, 784, now, 0.05, 0.25);
      playTone(ctx, 1046, now + 0.05, 0.06, 0.3);
    } else {
      // Mandal bırakıldı: Roger Bip
      playTone(ctx, 523.25, now, 0.12, 0.25);
    }
  } catch (e) {}
}

function playTone(ctx, freq, startTime, duration, maxGain = 0.3) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(freq, startTime);
  gain.gain.setValueAtTime(0.01, startTime);
  gain.gain.linearRampToValueAtTime(maxGain, startTime + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(startTime);
  osc.stop(startTime + duration);
}

// Bilgisayarda titreşim motoru olmadığı için kulaklık/hoparlörden derin bas (sub-bass) kalp vuruşu simülasyonu
function playAcousticHeartbeat() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    // 55Hz - 50Hz derin kalp atışı ritmi (düm-düm)
    playTone(ctx, 58, now, 0.18, 0.45);
    playTone(ctx, 50, now + 0.22, 0.22, 0.4);
    playTone(ctx, 58, now + 0.8, 0.18, 0.45);
    playTone(ctx, 50, now + 1.02, 0.22, 0.4);
  } catch(e) {}
}

// Çift Bileklikleri Standardı Titreşim: Tam 3.0 saniye (3000ms) süren ikili kalp atışı + derin sıcak sarılma dalgası
const POKE_VIBRATION_PATTERN = [300, 150, 300, 250, 400, 200, 500, 200, 700];

function triggerHaptic(pattern = POKE_VIBRATION_PATTERN) {
  if (!state.vibrationEnabled) return;
  let didVibrate = false;
  if ('vibrate' in navigator && typeof navigator.vibrate === 'function') {
    try {
      didVibrate = navigator.vibrate(pattern);
    } catch(e) {}
  }
  // Bilgisayardaysa (PC) veya titreşim motoru yoksa kulaklıkta fiziksel kalp atışı hissi veren derin bas çalar
  if (!didVibrate) {
    playAcousticHeartbeat();
  }
}

// ==============================================================================
// 4. İLİŞKİ SAYACI (1 AĞUSTOS 2026 İTİBARIYLA CANLI HESAPLAMA)
// ==============================================================================
function initRelationshipCounter() {
  const counterEl = document.getElementById('live-counter-text');
  
  function updateCounter() {
    if (!counterEl) return;
    
    const now = new Date();
    const diffMs = now.getTime() - START_DATE.getTime();
    
    if (diffMs <= 0) {
      counterEl.innerText = "Yolculuğumuz başlıyor...";
      return;
    }
    
    const totalSeconds = Math.floor(diffMs / 1000);
    const days = Math.floor(totalSeconds / (3600 * 24));
    const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    // Kullanıcının istediği tam format:
    // "Şu an ise [X] gün, [Y] saat, [Z] dakikadır beraberiz."
    const timeText = `Şu an ise ${days} gün, ${hours} saat, ${minutes} dakikadır beraberiz. (${seconds} saniye)`;
    
    counterEl.innerText = timeText;
  }
  
  updateCounter();
  setInterval(updateCounter, 1000);
}

// ==============================================================================
// 5. CANLI ETKİLEŞİM VE FIREBASE HABERLEŞMESİ
// ==============================================================================
let eventSource = null;

function connectRealtime() {
  const url = `${FIREBASE_BASE}${state.pairCode}.json`;
  if (eventSource) eventSource.close();
  
  try {
    eventSource = new EventSource(url);
    eventSource.addEventListener('put', (e) => {
      try {
        const payload = JSON.parse(e.data);
        handleFirebaseData(payload);
      } catch(err) {}
    });
    eventSource.onerror = () => {
      setTimeout(connectRealtime, 4000);
    };
  } catch(e) {
    setInterval(pollFirebaseFallback, 3000);
  }
}

async function sendFirebasePacket(path, data) {
  try {
    const url = `${FIREBASE_BASE}${state.pairCode}/${path}.json`;
    await fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  } catch(err) {
    console.error("Firebase gönderim hatası:", err);
  }
}

function handleFirebaseData(payload) {
  if (!payload || !payload.data) return;
  const data = payload.path === "/" ? payload.data : { [payload.path.replace('/', '')]: payload.data };
  
  // 1. Dürtme (Seni Çok Özledim) Bildirimi Geldi mi?
  if (data.poke && data.poke.id > state.lastReceivedPokeId) {
    state.lastReceivedPokeId = data.poke.id;
    if (!isSelfPacket(data.poke)) {
      onIncomingPoke(data.poke);
    }
  }

  // 2. Arama Talebi Bildirimi Geldi mi?
  if (data.callRequest && data.callRequest.id > state.lastReceivedCallRequestId) {
    state.lastReceivedCallRequestId = data.callRequest.id;
    if (!isSelfPacket(data.callRequest)) {
      onIncomingCallRequest(data.callRequest);
    }
  }

  // 3. Karşı tarafın numara senkronizasyonu
  if (data.partnerPhoneInfo && !isSelfPacket(data.partnerPhoneInfo)) {
    if (data.partnerPhoneInfo.phone && !state.partnerPhone) {
      state.partnerPhone = data.partnerPhoneInfo.phone;
      localStorage.setItem('kk_partner_phone', state.partnerPhone);
      const input = document.getElementById('partner-phone-input');
      if (input) input.value = state.partnerPhone;
    }
  }

  // 4. Sevgilim odaya katıldı mı? (Katılım Bildirimi & Kutlama)
  if (data.partnerJoined && data.partnerJoined.id > state.lastReceivedJoinId) {
    state.lastReceivedJoinId = data.partnerJoined.id;
    if (!isSelfPacket(data.partnerJoined)) {
      onPartnerJoined();
    }
  }

  // 5. Sevgilinin Cihaz Bilgisi Geldi mi? (Marka ve Model Doğrulama)
  if (data.deviceInfo && !isSelfPacket(data.deviceInfo)) {
    if (data.deviceInfo.device && data.deviceInfo.device !== state.partnerDevice) {
      renderPartnerDevice(data.deviceInfo.device);
      announceToScreenReader(`Sevgilinizin cihazı bağlandı: ${data.deviceInfo.device}`);
    }
  }

  // 6. Sevgiliden Telsiz Mesajı Geldi mi?
  if (data.walkieTalkie && data.walkieTalkie.id > state.lastReceivedWalkieId) {
    state.lastReceivedWalkieId = data.walkieTalkie.id;
    if (!isSelfPacket(data.walkieTalkie)) {
      onIncomingWalkieTalkie(data.walkieTalkie);
    }
  }
}

function notifyIfBackground(title, body, vibratePattern) {
  if (document.hidden && 'Notification' in window && Notification.permission === 'granted') {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.ready.then(reg => {
        reg.showNotification(title, {
          body: body,
          icon: './icon-192.png',
          badge: './icon-192.png',
          vibrate: vibratePattern || [120, 60, 120, 60, 240],
          tag: 'kalpkalbe-alert',
          renotify: true
        });
      }).catch(() => {});
    } else {
      try {
        new Notification(title, { body: body, icon: './icon-192.png' });
      } catch (e) {}
    }
  }
}

function onIncomingWalkieTalkie(packet) {
  triggerHaptic([100, 60, 100]);
  playWalkieChirp(true);

  const caller = (packet.sender && packet.sender !== "Ben") ? packet.sender : (state.partnerName || "Aşkım");
  announceToScreenReader(`${caller} konuşuyor.`);
  showToast("🎙️", `${caller} konuşuyor.`);
  notifyIfBackground(`${caller} Sesini Duyurdu! 🎙️`, "Dinlemek için dokunun...");

  try {
    const audio = new Audio(packet.audio);
    audio.play().catch(() => {});
    audio.onended = () => {
      playWalkieChirp(false); // Roger Bip
      announceToScreenReader(`${caller} bitti.`);
      showToast("📻", `${caller} bitti.`);
    };
  } catch (e) {}
}

function renderPartnerDevice(device) {
  if (!device) return;
  state.partnerDevice = device;
  localStorage.setItem('kk_partner_device', device);

  const badge = document.getElementById('partner-device-badge');
  const text = document.getElementById('partner-device-text');
  const field = document.getElementById('partner-device-field');
  const detail = document.getElementById('partner-device-detail');

  if (badge && text) {
    text.innerText = `Sevgilinin Cihazı: ${device}`;
    badge.style.display = 'flex';
    badge.setAttribute('aria-label', `Sevgilinizin Doğrulanan Telefon Modeli: ${device}`);
  }

  if (field && detail) {
    detail.innerText = device;
    field.style.display = 'flex';
  }
}

function onPartnerJoined() {
  triggerHaptic([100, 50, 100, 50, 300]);
  playPokeTone();
  const devText = state.partnerDevice ? ` (${state.partnerDevice})` : '';
  const msg = `Müjde! Sevgilin odaya bağlandı${devText}, artık kalp kalbesiniz!`;
  announceToScreenReader(msg);
  showToast("🎉", msg);
}

async function pollFirebaseFallback() {
  try {
    const res = await fetch(`${FIREBASE_BASE}${state.pairCode}.json`);
    const data = await res.json();
    if (data) handleFirebaseData({ path: "/", data: data });
  } catch(e) {}
}

// Sevgiliden Gelen "Seni Çok Özledim" Dürtmesi
function onIncomingPoke(packet) {
  triggerHaptic(POKE_VIBRATION_PATTERN);
  playPokeTone();
  
  const sender = (packet && packet.sender && packet.sender !== "Ben") ? packet.sender : (state.partnerName || "Sevgilin");
  const announceMsg = `Seni çok özledim! ${sender} seni çok özledi.`;
  
  announceToScreenReader(announceMsg);
  showToast("💓", "Seni Çok Özledim!", `${sender} seni çok özledi.`);
  notifyIfBackground("Seni Çok Özledim! 💓", `${sender} seni çok özledi!`, POKE_VIBRATION_PATTERN);
}

// Sevgiliden Gelen Arama Talebi Bildirimi
function onIncomingCallRequest(packet) {
  triggerHaptic([120, 80, 120, 80, 300]);
  playPokeTone();
  
  const partnerTitle = state.partnerName || "Aşkım";
  const typeText = packet.type === 'whatsapp' ? "WhatsApp'tan" : "normal hattan";
  const message = `${partnerTitle} senin ${typeText} aramanı veya ulaşmanı bekliyor!`;
  
  announceToScreenReader(message);
  showToast("📞", "Ulaşma İsteği", message);
  notifyIfBackground(`${partnerTitle} Ulaşmanı Bekliyor! 📞`, message);
}

function showToast(icon, titleOrText, message) {
  const toast = document.getElementById('live-touch-toast');
  const toastIcon = document.getElementById('toast-icon');
  const toastTitle = document.getElementById('toast-title');
  const toastMsg = document.getElementById('toast-message');
  if (!toast) return;

  if (toastIcon) toastIcon.innerText = icon || "💓";

  if (message !== undefined) {
    if (toastTitle) {
      toastTitle.innerText = titleOrText;
      toastTitle.style.display = 'block';
    }
    if (toastMsg) toastMsg.innerText = message;
  } else {
    if (toastTitle) toastTitle.style.display = 'none';
    if (toastMsg) toastMsg.innerText = titleOrText;
  }

  toast.style.display = 'flex';

  if (window.toastTimeout) clearTimeout(window.toastTimeout);
  window.toastTimeout = setTimeout(() => {
    toast.style.display = 'none';
  }, 7000);
}

// ==============================================================================
// 6. EYLEM BUTONLARI ETKİLEŞİMİ
// ==============================================================================

// Telefon numarasını temizler (sadece rakamlar)
function sanitizePhoneNumber(phone) {
  if (!phone) return "";
  let cleaned = phone.replace(/[^0-9]/g, '');
  // Eğer 0 ile başlıyorsa (örn: 0555...), 90 formatına çevir
  if (cleaned.startsWith('0') && cleaned.length === 11) {
    cleaned = '9' + cleaned;
  } else if (!cleaned.startsWith('90') && cleaned.length === 10) {
    cleaned = '90' + cleaned;
  }
  return cleaned;
}

function initActionButtons() {
  const btnMissYou = document.getElementById('btn-miss-you');
  const btnWhatsApp = document.getElementById('btn-whatsapp');
  const btnCall = document.getElementById('btn-call');
  
  // 1. "Seni Çok Özledim" Düğmesi
  if (btnMissYou) {
    btnMissYou.addEventListener('click', (e) => {
      e.preventDefault();
      
      // Kendi telefonunda tatlı çınlama ve titreşim
      triggerHaptic([60, 40, 90]);
      playPokeTone();
      
      // Karşı tarafa Firebase üzerinden canlı dürtme paketi yolla
      const packet = {
        id: Date.now(),
        sender: state.myName || "Ben",
        senderClientId: CLIENT_ID,
        timestamp: new Date().toISOString()
      };
      state.lastReceivedPokeId = packet.id;
      sendFirebasePacket('poke', packet);
      
      const partnerTitle = state.partnerName || "sevgiline";
      const message = `Seni çok özledim mesajı ve titreşimi ${partnerTitle} iletildi!`;
      announceToScreenReader(message);
      showToast("💓", "Seni Çok Özledim!", `Mesajın ve titreşimin ${partnerTitle} iletildi.`);
    });
  }

  // 2. "Bana WhatsApp'tan Ulaş" Düğmesi
  if (btnWhatsApp) {
    btnWhatsApp.addEventListener('click', (e) => {
      e.preventDefault();
      
      if (!state.partnerPhone) {
        announceToScreenReader("Lütfen önce Ayarlar butonundan sevgilinizin telefon numarasını girin.");
        openSettingsModal();
        return;
      }
      
      const cleanPhone = sanitizePhoneNumber(state.partnerPhone);
      
      // Karşı tarafa anında "WhatsApp'tan arama isteği" bildirimi gönder
      sendFirebasePacket('callRequest', {
        id: Date.now(),
        type: 'whatsapp',
        sender: state.myName || "Ben",
        senderClientId: CLIENT_ID
      });
      
      announceToScreenReader("WhatsApp açılıyor...");
      
      // Doğrudan temiz WhatsApp sohbetini aç (hazır metin olmadan, kullanıcı dilediğini yazsın)
      const waUrl = `https://wa.me/${cleanPhone}`;
      window.location.href = waUrl;
    });
  }

  // 3. "Bana Normalden Ulaş" Düğmesi
  if (btnCall) {
    btnCall.addEventListener('click', (e) => {
      e.preventDefault();
      
      if (!state.partnerPhone) {
        announceToScreenReader("Lütfen önce Ayarlar butonundan sevgilinizin telefon numarasını girin.");
        openSettingsModal();
        return;
      }
      
      // Karşı tarafa anında "Normal arama isteği" bildirimi gönder
      sendFirebasePacket('callRequest', {
        id: Date.now(),
        type: 'normal',
        sender: state.myName || "Ben",
        senderClientId: CLIENT_ID
      });
      
      announceToScreenReader("Telefon araması başlatılıyor...");
      
      // Normal telefon aramasını başlat
      window.location.href = `tel:${state.partnerPhone}`;
    });
  }

  // 4. "Sevgilime Kolay Davet Gönder" Düğmesi (Magic Link)
  const btnMagicInvite = document.getElementById('btn-magic-invite');
  if (btnMagicInvite) {
    btnMagicInvite.addEventListener('click', (e) => {
      e.preventDefault();
      
      const baseUrl = window.location.href.split('?')[0];
      const inviteUrl = `${baseUrl}?oda=${state.pairCode}${state.myPhone ? '&tel=' + encodeURIComponent(state.myPhone) : ''}`;
      const inviteMessage = `Birtanem, KalpKalbe uygulamamıza katılmak için bu bağlantıya dokunman yeterli:\n${inviteUrl}\n\nKod yazmana gerek kalmadan doğrudan bağlanacaksın ❤️`;
      
      triggerHaptic([60, 40, 60]);
      playPokeTone();
      
      // WhatsApp üzerinden gönder
      const waUrl = `https://wa.me/?text=${encodeURIComponent(inviteMessage)}`;
      
      if (navigator.clipboard) {
        navigator.clipboard.writeText(inviteUrl).catch(() => {});
      }
      
      announceToScreenReader("Sevgiliniz için tek tıkla bağlanma bağlantısı hazırlandı. WhatsApp açılıyor...");
      showToast("🔗", "Davet bağlantısı hazırlandı!");
      
      setTimeout(() => {
        window.location.href = waUrl;
      }, 600);
    });
  }
}

// ==============================================================================
// 6.1. BAS-KONUŞ AŞK TELSİZİ MOTORU (PUSH-TO-TALK)
// ==============================================================================
let walkieRecorder = null;
let walkieChunks = [];
let isWalkieRecording = false;

function initWalkieTalkie() {
  const btn = document.getElementById('btn-walkie-talkie');
  const title = document.getElementById('walkie-title');
  const desc = document.getElementById('walkie-desc');
  const icon = document.getElementById('walkie-icon');

  if (!btn) return;

  async function startWalkie() {
    if (isWalkieRecording) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      walkieChunks = [];
      walkieRecorder = new MediaRecorder(stream);

      walkieRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) walkieChunks.push(e.data);
      };

      walkieRecorder.onstop = async () => {
        stream.getTracks().forEach(t => t.stop());
        const blob = new Blob(walkieChunks, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = async () => {
          const base64Audio = reader.result;
          state.lastReceivedWalkieId = Date.now();
          await sendFirebasePacket('walkieTalkie', {
            id: state.lastReceivedWalkieId,
            sender: state.myName || "Ben",
            senderClientId: CLIENT_ID,
            audio: base64Audio,
            timestamp: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
          });
          announceToScreenReader("İletildi.");
          showToast("🎙️", "İletildi.");
        };
      };

      walkieRecorder.start();
      isWalkieRecording = true;
      btn.classList.add('recording');
      
      const target = state.partnerName || "Aşkım";
      if (icon) icon.innerText = "🔴";
      if (title) title.innerText = `🔴 ${target} Dinliyor...`;
      if (desc) desc.innerText = "Bırakınca sesin gidecek";

      playWalkieChirp(true);
      triggerHaptic([50]);
      announceToScreenReader(`${target} dinliyor, konuş.`);
    } catch (err) {
      console.warn("Mikrofon izni alınamadı:", err);
      announceToScreenReader("Mikrofon izni gerekli.");
    }
  }

  function stopWalkie() {
    if (!isWalkieRecording) return;
    isWalkieRecording = false;
    btn.classList.remove('recording');
    if (icon) icon.innerText = "🎙️";
    if (title) title.innerText = "Sesimi Duyur";
    if (desc) desc.innerText = "Basılı tut konuş, bırak sevgilinde çalsın";

    playWalkieChirp(false);
    triggerHaptic([70]);

    if (walkieRecorder && walkieRecorder.state !== 'inactive') {
      walkieRecorder.stop();
    }
  }

  // Mobil Dokunmatik ve Masaüstü Olayları
  btn.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    startWalkie();
  });

  btn.addEventListener('pointerup', (e) => {
    e.preventDefault();
    stopWalkie();
  });

  btn.addEventListener('pointercancel', stopWalkie);
  btn.addEventListener('pointerleave', () => {
    if (isWalkieRecording) stopWalkie();
  });

  // Bilgisayarda Klavyeyle Kullanım (Boşluk / Space Tuşuna Basılı Tut Konuş, Bırak Gönder)
  btn.addEventListener('keydown', (e) => {
    if ((e.code === 'Space' || e.key === ' ') && !isWalkieRecording) {
      e.preventDefault();
      startWalkie();
    }
  });

  btn.addEventListener('keyup', (e) => {
    if (e.code === 'Space' || e.key === ' ') {
      e.preventDefault();
      stopWalkie();
    }
  });

  // Bilgisayar (PC) NVDA Hızlı Klavye Kısayolları (1: Özledim, 3: WhatsApp, 4: Normal Arama)
  window.addEventListener('keydown', (e) => {
    if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;
    if (e.key === '1' || (e.altKey && e.key.toLowerCase() === 'o')) {
      const b = document.getElementById('btn-miss-you');
      if (b) b.click();
    } else if (e.key === '3' || (e.altKey && e.key.toLowerCase() === 'w')) {
      const b = document.getElementById('btn-whatsapp');
      if (b) b.click();
    } else if (e.key === '4' || (e.altKey && e.key.toLowerCase() === 'n')) {
      const b = document.getElementById('btn-call');
      if (b) b.click();
    }
  });
}

// ==============================================================================
// 7. AYARLAR VE EŞLEŞME MODALI
// ==============================================================================
function updatePairBadge() {
  const badge = document.getElementById('pair-status-badge');
  if (badge) {
    badge.innerText = `🟢 ${state.pairCode}`;
    badge.setAttribute('aria-label', `Eşleşilen Oda: ${state.pairCode}`);
  }
}

function initSettings() {
  const openBtn = document.getElementById('open-settings-btn');
  const closeBtn = document.getElementById('close-settings-btn');
  const modal = document.getElementById('settings-modal');
  const saveBtn = document.getElementById('save-settings-btn');
  const copyBtn = document.getElementById('copy-code-btn');
  const joinBtn = document.getElementById('join-code-btn');
  
  const pairCodeEl = document.getElementById('pair-code-display');
  const partnerPhoneInput = document.getElementById('partner-phone-input');
  const myPhoneInput = document.getElementById('my-phone-input');
  const myNameInput = document.getElementById('my-name-input');
  const partnerNameInput = document.getElementById('partner-name-input');
  const customCodeInput = document.getElementById('custom-code-input');

  updatePairBadge();

  // Mevcut değerleri doldur
  if (pairCodeEl) pairCodeEl.innerText = state.pairCode;
  if (partnerPhoneInput) partnerPhoneInput.value = state.partnerPhone;
  if (myPhoneInput) myPhoneInput.value = state.myPhone;
  if (myNameInput) myNameInput.value = state.myName;
  if (partnerNameInput) partnerNameInput.value = state.partnerName;

  if (openBtn) {
    openBtn.addEventListener('click', openSettingsModal);
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', closeSettingsModal);
  }

  if (saveBtn) {
    saveBtn.addEventListener('click', () => {
      if (partnerPhoneInput) state.partnerPhone = partnerPhoneInput.value.trim();
      if (myPhoneInput) state.myPhone = myPhoneInput.value.trim();
      if (myNameInput) state.myName = myNameInput.value.trim();
      if (partnerNameInput) state.partnerName = partnerNameInput.value.trim() || "Aşkım";

      localStorage.setItem('kk_partner_phone', state.partnerPhone);
      localStorage.setItem('kk_my_phone', state.myPhone);
      localStorage.setItem('kk_my_name', state.myName);
      localStorage.setItem('kk_partner_name', state.partnerName);

      // Kendi numaramızı Firebase'e ilet (sevgilimiz eşleştiğinde otomatik görsün)
      if (state.myPhone) {
        sendFirebasePacket('partnerPhoneInfo', {
          phone: state.myPhone,
          sender: state.myName || "Ben",
          senderClientId: CLIENT_ID
        });
      }

      announceToScreenReader("Ayarlar ve telefon numaraları başarıyla kaydedildi.");
      closeSettingsModal();
    });
  }

  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(state.pairCode).then(() => {
        announceToScreenReader(`Çift kodu ${state.pairCode} panoya kopyalandı.`);
        copyBtn.innerText = "Kopyalandı! ✓";
        setTimeout(() => { copyBtn.innerText = "Kopyala"; }, 2000);
      });
    });
  }

  if (joinBtn) {
    joinBtn.addEventListener('click', () => {
      const newCode = customCodeInput.value.trim().toUpperCase();
      if (newCode) {
        state.pairCode = newCode;
        localStorage.setItem('kk_pair_code', newCode);
        if (pairCodeEl) pairCodeEl.innerText = newCode;
        updatePairBadge();
        connectRealtime();
        announceToScreenReader(`Yeni odaya başarıyla bağlanıldı: ${newCode}`);
        closeSettingsModal();
      }
    });
  }

  const testVibeBtn = document.getElementById('test-vibration-btn');
  if (testVibeBtn) {
    testVibeBtn.addEventListener('click', () => {
      announceToScreenReader("3 saniyelik çift bilekliği titreşimi başlatıldı.");
      triggerHaptic(POKE_VIBRATION_PATTERN);
      playPokeTone();
    });
  }
}

function openSettingsModal() {
  const modal = document.getElementById('settings-modal');
  if (modal) {
    modal.style.display = 'flex';
    announceToScreenReader("Ayarlar penceresi açıldı. Telefon numaralarınızı girebilir veya çift kodunuza bakabilirsiniz.");
  }
}

function closeSettingsModal() {
  const modal = document.getElementById('settings-modal');
  if (modal) {
    modal.style.display = 'none';
    announceToScreenReader("Ayarlar penceresi kapatıldı.");
  }
}

function checkMagicLinkParams() {
  const searchParams = new URLSearchParams(window.location.search);
  const hashParams = new URLSearchParams(window.location.hash.replace('#', '?'));
  const roomCode = (searchParams.get('oda') || hashParams.get('oda') || '').trim().toUpperCase();
  const partnerTel = (searchParams.get('tel') || hashParams.get('tel') || '').trim();

  if (roomCode) {
    state.pairCode = roomCode;
    localStorage.setItem('kk_pair_code', roomCode);
    
    if (partnerTel) {
      state.partnerPhone = partnerTel;
      localStorage.setItem('kk_partner_phone', partnerTel);
    }
    
    // Firebase'e katılım bildirim paketi gönder
    setTimeout(() => {
      sendFirebasePacket('partnerJoined', {
        id: Date.now(),
        sender: state.myName || "Partner",
        senderClientId: CLIENT_ID,
        timestamp: new Date().toISOString()
      });
      triggerHaptic([100, 50, 100, 50, 250]);
      playPokeTone();
      updatePairBadge();
      announceToScreenReader(`Harika haber! Aşkının odasına tek tıkla bağlandın: ${state.pairCode}. Bütün ayarlar otomatik yapıldı.`);
      showToast("🎉", "Aşkının odasına bağlandın!");
    }, 1000);
    
    // Adres çubuğunu temizle
    try {
      window.history.replaceState({}, document.title, window.location.pathname);
    } catch(e) {}
  }
}

// Cihaz Marka ve Model Tespiti
async function detectMyDevice() {
  let modelName = "Akıllı Telefon";
  try {
    if (navigator.userAgentData && navigator.userAgentData.getHighEntropyValues) {
      const hints = await navigator.userAgentData.getHighEntropyValues(['model', 'platform']);
      if (hints.model) {
        let brand = "Android";
        const m = hints.model.toUpperCase();
        if (m.startsWith('SM-') || m.includes('SAMSUNG')) brand = "Samsung Galaxy";
        else if (m.includes('REDMI') || m.includes('XIAOMI') || m.includes('POCO')) brand = "Xiaomi";
        else if (m.includes('PIXEL')) brand = "Google Pixel";
        else if (m.includes('HUAWEI')) brand = "Huawei";
        else if (m.includes('CPH') || m.includes('OPPO')) brand = "Oppo";
        modelName = `${brand} (${hints.model})`;
      }
    }
  } catch (e) {}

  if (modelName === "Akıllı Telefon") {
    const ua = navigator.userAgent;
    if (/iPhone/i.test(ua)) modelName = "Apple iPhone";
    else if (/iPad/i.test(ua)) modelName = "Apple iPad";
    else {
      const match = ua.match(/Android [^;]+;\s*([^;)]+)\)/i);
      if (match && match[1]) {
        const raw = match[1].trim();
        let brand = "";
        const m = raw.toUpperCase();
        if (m.startsWith('SM-') || m.includes('SAMSUNG')) brand = "Samsung ";
        else if (m.includes('REDMI') || m.includes('XIAOMI')) brand = "Xiaomi ";
        else if (m.includes('PIXEL')) brand = "Google Pixel ";
        modelName = `${brand}${raw}`;
      } else if (/Windows/i.test(ua)) {
        modelName = "Windows Bilgisayar";
      }
    }
  }

  state.myDevice = modelName;
  return modelName;
}

// Arka Planda Bildirim ve Servis Çalışanı (Tamamen Otomatik)
function initNotifications() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  }

  // İlk dokunuşta veya sayfa yüklenişinde arka plan bildirim ve titreşim izinlerini otomatik al
  async function autoEnableNotifications() {
    if ('Notification' in window) {
      if (Notification.permission === 'default') {
        try {
          const perm = await Notification.requestPermission();
          if (perm === 'granted') {
            triggerHaptic([60, 40, 100]);
          }
        } catch(e) {}
      }
    }
  }

  // Hem doğrudan açılışta hem de ekrana ilk dokunulduğunda sessizce ve otomatik olarak devreye sok
  autoEnableNotifications();
  document.body.addEventListener('click', autoEnableNotifications, { once: true });
  document.body.addEventListener('touchstart', autoEnableNotifications, { once: true });
}

// ==============================================================================
// 8. BAŞLATICI (INITIALIZATION)
// ==============================================================================
document.addEventListener('DOMContentLoaded', () => {
  checkMagicLinkParams();
  initRelationshipCounter();
  initActionButtons();
  initWalkieTalkie();
  initSettings();
  initNotifications();
  connectRealtime();

  // Sevgilinin önceden kaydedilmiş cihazı varsa göster
  if (state.partnerDevice) {
    renderPartnerDevice(state.partnerDevice);
  }

  // Kendi cihazımızı tespit et ve odaya bildir
  detectMyDevice().then((myDev) => {
    sendFirebasePacket('deviceInfo', {
      device: myDev,
      sender: state.myName || "Ben",
      senderClientId: CLIENT_ID,
      timestamp: new Date().toISOString()
    });
  });

  // İlk yüklemede ekran okuyucu selamlama duyurusu
  setTimeout(() => {
    announceToScreenReader("KalpKalbe uygulamasına hoş geldiniz. Seni çok özledim, WhatsApp ve normal arama düğmeleriniz hazır.");
  }, 500);

  // Sayfa üzerinde ilk dokunuşta ses motorunu hazırla
  document.body.addEventListener('click', () => {
    getAudioContext();
  }, { once: true });
});
