// Erişilebilir Video Asistanı V3 (FFmpeg Core)

const { FFmpeg } = window.FFmpeg;
const { fetchFile } = window.FFmpegUtil;

let ffmpeg = null;

const state = {
    videoFile: null,
    audioFile: null,
    videoDuration: 0,
    cutStart: 0,
    cutEnd: 0,
    videoVolume: 100,
    audioVolume: 50
};

const DOM = {
    assistantMsg: document.getElementById('assistant-message'),
    step1: document.getElementById('step-1'),
    step2: document.getElementById('step-2'),
    step3: document.getElementById('step-3'),
    step4: document.getElementById('step-4'),
    
    videoUpload: document.getElementById('video-upload'),
    audioUpload: document.getElementById('audio-upload'),
    
    hiddenPlayer: document.getElementById('hidden-player'),
    videoInfo: document.getElementById('video-info'),
    audioInfo: document.getElementById('audio-info'),
    renderInfo: document.getElementById('render-info'),
    
    cutStart: document.getElementById('cut-start'),
    cutEnd: document.getElementById('cut-end'),
    btnCut: document.getElementById('btn-cut'),
    
    videoVolume: document.getElementById('video-volume'),
    audioVolume: document.getElementById('audio-volume'),
    btnToRender: document.getElementById('btn-to-render'),
    
    btnRenderDownload: document.getElementById('btn-render-download'),
    downloadArea: document.getElementById('download-area'),
    
    progressContainer: document.getElementById('progress-container'),
    progressBarFill: document.getElementById('progress-bar-fill')
};

// Sesli Okuma / Asistan Mesaj Güncelleme
function speak(message) {
    DOM.assistantMsg.textContent = message;
    setTimeout(() => {
        DOM.assistantMsg.focus();
    }, 100);
}

function showStep(stepNumber) {
    DOM.step1.classList.add('hidden');
    DOM.step2.classList.add('hidden');
    DOM.step3.classList.add('hidden');
    DOM.step4.classList.add('hidden');

    if (stepNumber === 1) DOM.step1.classList.remove('hidden');
    if (stepNumber === 2) { DOM.step2.classList.remove('hidden'); DOM.cutStart.focus(); }
    if (stepNumber === 3) { DOM.step3.classList.remove('hidden'); DOM.audioUpload.focus(); }
    if (stepNumber === 4) { DOM.step4.classList.remove('hidden'); DOM.btnRenderDownload.focus(); }
}

// FFmpeg Başlatma
async function loadFFmpeg() {
    if (ffmpeg === null) {
        speak("Sistem hazırlanıyor, lütfen birkaç saniye bekleyin...");
        ffmpeg = new FFmpeg();
        
        ffmpeg.on('progress', ({ progress, time }) => {
            const percent = Math.round(progress * 100);
            DOM.progressBarFill.style.width = `${percent}%`;
            // Sadece %25, %50, %75, %100 de konuşsun ki çok gürültü yapmasın
            if (percent === 25 || percent === 50 || percent === 75 || percent === 99) {
                speak(`İşlem yüzde ${percent} tamamlandı.`);
            }
        });

        await ffmpeg.load({
            coreURL: 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.js',
            wasmURL: 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.wasm'
        });
        speak("Sistem hazır. Lütfen videonuzu yükleyin.");
    }
}

// Başlangıçta FFmpeg'i yükle
window.onload = () => {
    loadFFmpeg();
};

// ADIM 1: Video Yükleme
DOM.videoUpload.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        state.videoFile = e.target.files[0];
        const url = URL.createObjectURL(state.videoFile);
        DOM.hiddenPlayer.src = url;
        
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

// ADIM 2: Kesme Onayı
DOM.btnCut.addEventListener('click', () => {
    const startVal = parseInt(DOM.cutStart.value);
    const endVal = parseInt(DOM.cutEnd.value);
    
    if (isNaN(startVal) || isNaN(endVal) || startVal >= endVal || endVal > state.videoDuration) {
        speak("Hatalı değer girdiniz. Başlangıç saniyesi bitişten küçük olmalıdır.");
        return;
    }
    
    state.cutStart = startVal;
    state.cutEnd = endVal;
    
    speak(`Kesme alanı ayarlandı. Adım 3'e geçiliyor. İsterseniz arka plan müziği ekleyebilirsiniz.`);
    showStep(3);
});

// ADIM 3: Müzik Yükleme ve Ayarlar
DOM.audioUpload.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        state.audioFile = e.target.files[0];
        DOM.audioInfo.textContent = `Seçilen Müzik: ${state.audioFile.name}`;
        DOM.audioInfo.classList.remove('hidden');
        speak(`Müzik başarıyla yüklendi. Adı: ${state.audioFile.name}. Lütfen ses seviyelerini ayarlayın.`);
    }
});

DOM.btnToRender.addEventListener('click', () => {
    state.videoVolume = parseInt(DOM.videoVolume.value) || 100;
    state.audioVolume = parseInt(DOM.audioVolume.value) || 50;
    
    speak("Ayarlar kaydedildi. Dışa aktarma adımına geçiliyor.");
    showStep(4);
});

// ADIM 4: FFmpeg Render
DOM.btnRenderDownload.addEventListener('click', async () => {
    if (!ffmpeg || !ffmpeg.loaded) {
        speak("Sistem henüz yüklenmedi, lütfen bekleyin.");
        return;
    }
    
    DOM.btnRenderDownload.disabled = true;
    DOM.progressContainer.classList.remove('hidden');
    speak("Birleştirme işlemi başladı. Lütfen bekleyin. Bu işlem videonun boyutuna göre birkaç dakika sürebilir.");
    
    try {
        const videoName = 'input.mp4';
        const audioName = state.audioFile ? 'audio.mp3' : null;
        const outName = 'output.mp4';
        
        // 1. Write video file
        await ffmpeg.writeFile(videoName, await fetchFile(state.videoFile));
        
        let command = [];
        
        // 2. Prepare command
        if (state.audioFile) {
            // Write audio file
            await ffmpeg.writeFile(audioName, await fetchFile(state.audioFile));
            
            const vVol = state.videoVolume / 100;
            const aVol = state.audioVolume / 100;
            
            // Complex FFmpeg command for mixing audio and cutting
            command = [
                '-ss', state.cutStart.toString(),
                '-to', state.cutEnd.toString(),
                '-i', videoName,
                '-i', audioName,
                '-filter_complex', `[0:a]volume=${vVol}[a1];[1:a]volume=${aVol}[a2];[a1][a2]amix=inputs=2:duration=first:dropout_transition=2[a]`,
                '-map', '0:v',
                '-map', '[a]',
                '-c:v', 'copy', // copy video stream directly (fast!)
                '-c:a', 'aac',
                '-y', outName
            ];
        } else {
            // Sadece kesme ve ses ayarı
            const vVol = state.videoVolume / 100;
            
            command = [
                '-ss', state.cutStart.toString(),
                '-to', state.cutEnd.toString(),
                '-i', videoName,
                '-filter:a', `volume=${vVol}`,
                '-c:v', 'copy',
                '-c:a', 'aac',
                '-y', outName
            ];
        }
        
        // 3. Execute
        await ffmpeg.exec(command);
        
        // 4. Read result
        const data = await ffmpeg.readFile(outName);
        
        // 5. Create download link
        const blob = new Blob([data.buffer], { type: 'video/mp4' });
        const url = URL.createObjectURL(blob);
        
        DOM.downloadArea.innerHTML = `
            <a href="${url}" download="Mikyas_Montaj_${Date.now()}.mp4" class="btn btn-primary btn-large" tabindex="0">
                Oluşturulan Videoyu İndir
            </a>
        `;
        
        speak("İşlem başarıyla tamamlandı! Oluşturulan videoyu indir butonuna basarak indirebilirsiniz.");
        DOM.progressContainer.classList.add('hidden');
        DOM.downloadArea.querySelector('a').focus();
        
    } catch (error) {
        console.error(error);
        speak("İşlem sırasında bir hata oluştu. Lütfen sayfayı yenileyip tekrar deneyin.");
        DOM.btnRenderDownload.disabled = false;
        DOM.progressContainer.classList.add('hidden');
    }
});
