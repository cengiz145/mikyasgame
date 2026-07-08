// Erişilebilir Video Asistanı Core Logic

const state = {
    currentStep: 1,
    videoFile: null,
    videoUrl: null,
    videoDuration: 0,
    clips: [] // { id, start, end }
};

const DOM = {
    assistantMsg: document.getElementById('assistant-message'),
    step1: document.getElementById('step-1'),
    step2: document.getElementById('step-2'),
    step3: document.getElementById('step-3'),
    uploadInput: document.getElementById('video-upload'),
    hiddenPlayer: document.getElementById('hidden-player'),
    videoInfo: document.getElementById('video-info'),
    cutStart: document.getElementById('cut-start'),
    cutEnd: document.getElementById('cut-end'),
    btnCut: document.getElementById('btn-cut'),
    clipList: document.getElementById('clip-list'),
    btnPreviewAll: document.getElementById('btn-preview-all')
};

// Sesli Okuma / Asistan Mesaj Güncelleme
function speak(message) {
    DOM.assistantMsg.textContent = message;
    // Ekran okuyucuların politle özelliğini tetiklemek için ufak bir gecikmeyle odaklanıyoruz
    setTimeout(() => {
        DOM.assistantMsg.focus();
    }, 100);
}

function showStep(stepNumber) {
    DOM.step1.classList.add('hidden');
    DOM.step2.classList.add('hidden');
    DOM.step3.classList.add('hidden');

    if (stepNumber === 1) {
        DOM.step1.classList.remove('hidden');
    } else if (stepNumber === 2) {
        DOM.step2.classList.remove('hidden');
        DOM.cutStart.focus();
    } else if (stepNumber === 3) {
        DOM.step3.classList.remove('hidden');
        DOM.btnPreviewAll.focus();
    }
}

// ADIM 1: Video Yükleme
DOM.uploadInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        state.videoFile = e.target.files[0];
        state.videoUrl = URL.createObjectURL(state.videoFile);
        DOM.hiddenPlayer.src = state.videoUrl;
        
        speak("Video yükleniyor, lütfen bekleyin.");
        
        DOM.hiddenPlayer.onloadedmetadata = () => {
            state.videoDuration = Math.floor(DOM.hiddenPlayer.duration);
            DOM.videoInfo.textContent = `Toplam Video Süresi: ${state.videoDuration} saniye.`;
            DOM.cutEnd.value = state.videoDuration;
            DOM.cutEnd.max = state.videoDuration;
            DOM.cutStart.max = state.videoDuration - 1;
            
            speak(`Video başarıyla yüklendi. Toplam süresi ${state.videoDuration} saniye. Lütfen videoyu kesmek istediğiniz başlangıç ve bitiş saniyelerini girin.`);
            showStep(2);
        };
    }
});

// ADIM 2: Kesme İşlemi
DOM.btnCut.addEventListener('click', () => {
    const startVal = parseInt(DOM.cutStart.value);
    const endVal = parseInt(DOM.cutEnd.value);
    
    if (isNaN(startVal) || isNaN(endVal)) {
        speak("Lütfen geçerli rakamlar girin.");
        return;
    }
    
    if (startVal >= endVal) {
        speak("Hata! Başlangıç saniyesi, bitiş saniyesinden küçük olmalıdır.");
        return;
    }
    
    if (endVal > state.videoDuration) {
        speak(`Hata! Bitiş saniyesi videonun toplam süresinden (${state.videoDuration}) büyük olamaz.`);
        return;
    }

    const newClip = {
        id: Date.now().toString(),
        start: startVal,
        end: endVal,
        duration: endVal - startVal
    };
    
    state.clips.push(newClip);
    
    speak(`Kesme işlemi başarılı. ${startVal} ile ${endVal} saniyeleri arası kesildi. Parça uzunluğu ${newClip.duration} saniye. Adım 3'e geçiliyor.`);
    renderClips();
    showStep(3);
});

// ADIM 3: Parçaları Gösterme
function renderClips() {
    DOM.clipList.innerHTML = '';
    
    if (state.clips.length === 0) {
        DOM.clipList.innerHTML = '<p tabindex="0">Henüz kesilmiş parça yok.</p>';
        return;
    }
    
    state.clips.forEach((clip, index) => {
        const div = document.createElement('div');
        div.className = 'clip-item';
        div.innerHTML = `
            <div class="clip-title" tabindex="0">Parça ${index + 1}</div>
            <div class="clip-details" tabindex="0">Başlangıç: ${clip.start}. saniye. Bitiş: ${clip.end}. saniye. Uzunluk: ${clip.duration} saniye.</div>
            <div class="clip-actions">
                <button class="btn btn-primary" onclick="playClip('${clip.id}')" aria-label="Parça ${index + 1}'i dinle">Dinle</button>
                <button class="btn btn-danger" onclick="deleteClip('${clip.id}')" aria-label="Parça ${index + 1}'i sil">Sil</button>
            </div>
        `;
        DOM.clipList.appendChild(div);
    });
    
    // Geri dönüp yeni parça kesmek için buton
    const backBtn = document.createElement('button');
    backBtn.className = 'btn btn-warning';
    backBtn.textContent = 'Yeni Parça Kes (Geri Dön)';
    backBtn.onclick = () => {
        speak("Adım 2'ye geri dönüldü. Lütfen yeni kesme noktalarını girin.");
        showStep(2);
    };
    DOM.clipList.appendChild(backBtn);
}

// Global Actions for inline HTML
window.playClip = function(id) {
    const clip = state.clips.find(c => c.id === id);
    if(clip) {
        speak(`Parça oynatılıyor. ${clip.duration} saniye sürecek.`);
        DOM.hiddenPlayer.currentTime = clip.start;
        DOM.hiddenPlayer.play();
        
        // Stop playing when clip ends
        const checkEnd = setInterval(() => {
            if(DOM.hiddenPlayer.currentTime >= clip.end) {
                DOM.hiddenPlayer.pause();
                clearInterval(checkEnd);
                speak("Parça oynatımı tamamlandı.");
            }
        }, 100);
    }
};

window.deleteClip = function(id) {
    state.clips = state.clips.filter(c => c.id !== id);
    speak("Parça silindi.");
    renderClips();
    
    if(state.clips.length === 0) {
        speak("Tüm parçalar silindi. Adım 2'ye geri dönülüyor.");
        showStep(2);
    }
};

// Tüm Parçaları Oynat (Sırayla)
DOM.btnPreviewAll.addEventListener('click', () => {
    if(state.clips.length === 0) return;
    
    speak(`Toplam ${state.clips.length} parça sırayla oynatılıyor.`);
    
    let currentClipIndex = 0;
    
    function playNextClip() {
        if (currentClipIndex >= state.clips.length) {
            speak("Tüm montaj oynatımı bitti.");
            return;
        }
        
        const clip = state.clips[currentClipIndex];
        DOM.hiddenPlayer.currentTime = clip.start;
        DOM.hiddenPlayer.play();
        
        const checkEnd = setInterval(() => {
            if(DOM.hiddenPlayer.currentTime >= clip.end) {
                DOM.hiddenPlayer.pause();
                clearInterval(checkEnd);
                currentClipIndex++;
                playNextClip();
            }
        }, 100);
    }
    
    playNextClip();
});

// İlk yüklendiğinde asistan mesajına odaklan (Ekran okuyucu için)
window.onload = () => {
    DOM.assistantMsg.focus();
};
