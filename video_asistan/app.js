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
    cutMode: 'keep', // 'keep' or 'remove'
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
    modeKeep: document.getElementById('mode-keep'),
    modeRemove: document.getElementById('mode-remove'),
    lblCutStart: document.getElementById('lbl-cut-start'),
    
    videoVolume: document.getElementById('video-volume'),
    audioVolume: document.getElementById('audio-volume'),
    btnToRender: document.getElementById('btn-to-render'),
    
    btnRenderDownload: document.getElementById('btn-render-download'),
    btnRenderMp3: document.getElementById('btn-render-mp3'),
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
    const mode = DOM.modeRemove.checked ? 'remove' : 'keep';
    
    if (isNaN(startVal) || isNaN(endVal) || startVal >= endVal || endVal > state.videoDuration) {
        speak("Hatalı değer girdiniz. Başlangıç saniyesi bitişten küçük olmalıdır.");
        return;
    }
    
    state.cutStart = startVal;
    state.cutEnd = endVal;
    state.cutMode = mode;
    
    const modeText = mode === 'remove' ? "çıkarılacak" : "saklanacak";
    speak(`Kesme alanı ayarlandı. Seçtiğiniz ${startVal} ile ${endVal} saniyeleri arası ${modeText}. Adım 3'e geçiliyor. İsterseniz arka plan müziği ekleyebilirsiniz.`);
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

// Sürgü (Slider) Güncellemeleri
DOM.videoVolume.addEventListener('input', (e) => {
    const val = e.target.value;
    const textSpan = document.getElementById('video-volume-text');
    textSpan.textContent = `%${val}`;
    e.target.setAttribute('aria-valuenow', val);
    e.target.setAttribute('aria-valuetext', `Yüzde ${val}`);
});

DOM.audioVolume.addEventListener('input', (e) => {
    const val = e.target.value;
    const textSpan = document.getElementById('audio-volume-text');
    textSpan.textContent = `%${val}`;
    e.target.setAttribute('aria-valuenow', val);
    e.target.setAttribute('aria-valuetext', `Yüzde ${val}`);
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
        
        let sourceVideoName = videoName;

        // EĞER "SİL (Ortayı Çıkar)" modundaysak, önce iki parçayı bölüp birleştiriyoruz.
        if (state.cutMode === 'remove') {
            speak("Önce istenmeyen bölüm çıkarılıyor, lütfen bekleyin...");
            await ffmpeg.exec(['-ss', '0', '-to', state.cutStart.toString(), '-i', videoName, '-c', 'copy', 'part1.mp4']);
            await ffmpeg.exec(['-ss', state.cutEnd.toString(), '-to', state.videoDuration.toString(), '-i', videoName, '-c', 'copy', 'part2.mp4']);
            await ffmpeg.writeFile('concat.txt', "file 'part1.mp4'\nfile 'part2.mp4'");
            await ffmpeg.exec(['-f', 'concat', '-safe', '0', '-i', 'concat.txt', '-c', 'copy', 'concat_output.mp4']);
            sourceVideoName = 'concat_output.mp4';
        }
        
        let command = [];
        
        // 2. Prepare command
        if (state.audioFile) {
            // Write audio file
            await ffmpeg.writeFile(audioName, await fetchFile(state.audioFile));
            
            const vVol = state.videoVolume / 100;
            const aVol = state.audioVolume / 100;
            
            // Eğer "remove" moduysa zaten kesilmiş dosyayı (sourceVideoName) kullanıyoruz, ss ve to eklemiyoruz
            if (state.cutMode === 'remove') {
                command = [
                    '-i', sourceVideoName,
                    '-i', audioName,
                    '-filter_complex', `[0:a]volume=${vVol}[a1];[1:a]volume=${aVol}[a2];[a1][a2]amix=inputs=2:duration=first:dropout_transition=2[a]`,
                    '-map', '0:v',
                    '-map', '[a]',
                    '-c:v', 'copy',
                    '-c:a', 'aac',
                    '-y', outName
                ];
            } else {
                command = [
                    '-ss', state.cutStart.toString(),
                    '-to', state.cutEnd.toString(),
                    '-i', sourceVideoName,
                    '-i', audioName,
                    '-filter_complex', `[0:a]volume=${vVol}[a1];[1:a]volume=${aVol}[a2];[a1][a2]amix=inputs=2:duration=first:dropout_transition=2[a]`,
                    '-map', '0:v',
                    '-map', '[a]',
                    '-c:v', 'copy',
                    '-c:a', 'aac',
                    '-y', outName
                ];
            }
        } else {
            const vVol = state.videoVolume / 100;
            
            if (state.cutMode === 'remove') {
                command = [
                    '-i', sourceVideoName,
                    '-filter:a', `volume=${vVol}`,
                    '-c:v', 'copy',
                    '-c:a', 'aac',
                    '-y', outName
                ];
            } else {
                command = [
                    '-ss', state.cutStart.toString(),
                    '-to', state.cutEnd.toString(),
                    '-i', sourceVideoName,
                    '-filter:a', `volume=${vVol}`,
                    '-c:v', 'copy',
                    '-c:a', 'aac',
                    '-y', outName
                ];
            }
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

// ADIM 4: FFmpeg SADECE SES (MP3) RENDER
DOM.btnRenderMp3.addEventListener('click', async () => {
    if (!ffmpeg || !ffmpeg.loaded) {
        speak("Sistem henüz yüklenmedi, lütfen bekleyin.");
        return;
    }
    
    DOM.btnRenderMp3.disabled = true;
    DOM.btnRenderDownload.disabled = true;
    DOM.progressContainer.classList.remove('hidden');
    speak("Sadece ses (MP3) çıkarma işlemi başladı. Lütfen bekleyin. Bu işlem videonuzdan görüntüyü silip sadece sesleri birleştirecektir.");
    
    try {
        const videoName = 'input.mp4';
        const audioName = state.audioFile ? 'audio.mp3' : null;
        const outName = 'output.mp3'; // Çıktı MP3
        
        await ffmpeg.writeFile(videoName, await fetchFile(state.videoFile));
        
        let sourceVideoName = videoName;

        // EĞER "SİL (Ortayı Çıkar)" modundaysak, önce iki parçayı bölüp birleştiriyoruz.
        if (state.cutMode === 'remove') {
            speak("Önce istenmeyen bölüm çıkarılıyor, lütfen bekleyin...");
            await ffmpeg.exec(['-ss', '0', '-to', state.cutStart.toString(), '-i', videoName, '-c', 'copy', 'part1.mp4']);
            await ffmpeg.exec(['-ss', state.cutEnd.toString(), '-to', state.videoDuration.toString(), '-i', videoName, '-c', 'copy', 'part2.mp4']);
            await ffmpeg.writeFile('concat.txt', "file 'part1.mp4'\nfile 'part2.mp4'");
            await ffmpeg.exec(['-f', 'concat', '-safe', '0', '-i', 'concat.txt', '-c', 'copy', 'concat_output.mp4']);
            sourceVideoName = 'concat_output.mp4';
        }
        
        let command = [];
        
        if (state.audioFile) {
            await ffmpeg.writeFile(audioName, await fetchFile(state.audioFile));
            const vVol = state.videoVolume / 100;
            const aVol = state.audioVolume / 100;
            
            if (state.cutMode === 'remove') {
                command = [
                    '-i', sourceVideoName,
                    '-i', audioName,
                    '-filter_complex', `[0:a]volume=${vVol}[a1];[1:a]volume=${aVol}[a2];[a1][a2]amix=inputs=2:duration=first:dropout_transition=2[a]`,
                    '-map', '[a]',
                    '-vn',
                    '-c:a', 'libmp3lame',
                    '-q:a', '2',
                    '-y', outName
                ];
            } else {
                command = [
                    '-ss', state.cutStart.toString(),
                    '-to', state.cutEnd.toString(),
                    '-i', sourceVideoName,
                    '-i', audioName,
                    '-filter_complex', `[0:a]volume=${vVol}[a1];[1:a]volume=${aVol}[a2];[a1][a2]amix=inputs=2:duration=first:dropout_transition=2[a]`,
                    '-map', '[a]',
                    '-vn',
                    '-c:a', 'libmp3lame',
                    '-q:a', '2',
                    '-y', outName
                ];
            }
        } else {
            const vVol = state.videoVolume / 100;
            
            if (state.cutMode === 'remove') {
                command = [
                    '-i', sourceVideoName,
                    '-filter:a', `volume=${vVol}`,
                    '-vn',
                    '-c:a', 'libmp3lame',
                    '-q:a', '2',
                    '-y', outName
                ];
            } else {
                command = [
                    '-ss', state.cutStart.toString(),
                    '-to', state.cutEnd.toString(),
                    '-i', sourceVideoName,
                    '-filter:a', `volume=${vVol}`,
                    '-vn',
                    '-c:a', 'libmp3lame',
                    '-q:a', '2',
                    '-y', outName
                ];
            }
        }
        
        await ffmpeg.exec(command);
        const data = await ffmpeg.readFile(outName);
        
        const blob = new Blob([data.buffer], { type: 'audio/mpeg' });
        const url = URL.createObjectURL(blob);
        
        DOM.downloadArea.innerHTML = `
            <a href="${url}" download="Mikyas_Ses_${Date.now()}.mp3" class="btn btn-warning btn-large" tabindex="0">
                Oluşturulan MP3 Dosyasını İndir
            </a>
        `;
        
        speak("İşlem başarıyla tamamlandı! Oluşturulan MP3 ses dosyasını indir butonuna basarak dinleyebilirsiniz.");
        DOM.progressContainer.classList.add('hidden');
        DOM.downloadArea.querySelector('a').focus();
        
    } catch (error) {
        console.error(error);
        speak("İşlem sırasında bir hata oluştu. Lütfen videonuzun ses formatının desteklendiğinden emin olun.");
        DOM.btnRenderMp3.disabled = false;
        DOM.btnRenderDownload.disabled = false;
        DOM.progressContainer.classList.add('hidden');
    }
});

// ==========================================
// V4: İNTERAKTİF AKILLI ASİSTAN (NLP & SES)
// ==========================================
const btnAskText = document.getElementById('btn-ask-text');
const btnAskVoice = document.getElementById('btn-ask-voice');
const assistantInput = document.getElementById('assistant-input');
const voiceStatus = document.getElementById('voice-status');

// Basit Intent (Niyet) Okuma Motoru
function analyzeUserQuestion(question) {
    const q = question.toLowerCase();
    
    // Niyet: Hata - Kesemiyorum, yapamıyorum
    if (q.includes("kesemiyorum") || q.includes("yapamıyorum") || q.includes("ilerleyemiyorum") || q.includes("hata")) {
        if (!state.videoFile) {
            return "Şu an takıldığınızı anlıyorum. Ancak henüz sisteme bir video yüklememişsiniz. Lütfen Adım 1'den bir video seçerek işe başlayın.";
        }
        if (state.cutStart >= state.cutEnd) {
            return "Kesme saniyelerinde hata yapmış olabilirsiniz. Başlangıç saniyeniz, bitiş saniyenizden büyük veya ona eşit olamaz. Lütfen Adım 2'deki saniyeleri düzeltin.";
        }
        return "Sistemi kontrol ettim, şu an bir hata görünmüyor. Hangi adımda olduğunuzu kontrol edip işleminize devam edebilirsiniz.";
    }
    
    // Niyet: Müzik - Ses çıkmıyor, müzik ekleyemedim
    if (q.includes("müzik") || q.includes("ses") || q.includes("şarkı") || q.includes("duyamıyorum")) {
        if (!state.videoFile) return "Henüz video yüklemediniz.";
        if (!state.audioFile) {
            return "Arka plana bir müzik eklemediğinizi görüyorum. Adım 3'ten bir MP3 dosyası seçerek müzik ekleyebilirsiniz.";
        }
        if (state.videoVolume === 0 && state.audioVolume === 0) {
            return "Hem videonun hem de müziğin sesini sıfıra indirmişsiniz. Bu yüzden ses duyamazsınız. Lütfen sürgüleri yukarı kaydırarak sesi açın.";
        }
        return "Ses ayarlarınız gayet normal görünüyor. Sorun devam ediyorsa cihazınızın kendi sesini açmayı deneyin.";
    }
    
    // Niyet: İndirme - İndiremiyorum, kaydetmiyor, render
    if (q.includes("indir") || q.includes("kaydet") || q.includes("render") || q.includes("kaydedemiyorum")) {
        if (!state.videoFile) return "İndirecek bir video yok. Önce video yüklemelisiniz.";
        if (DOM.btnRenderDownload.disabled) {
            return "Şu anda birleştirme (render) işlemi arka planda devam ediyor olabilir. Lütfen işlemin %100 olmasını bekleyin.";
        }
        return "İndirme işlemi için Adım 4'e gelip 'Videoyu Birleştir ve İndir' butonuna basmanız yeterlidir. İşlem biraz sürebilir.";
    }
    
    // Varsayılan Yanıt
    return "Sorunuzu anladım ancak şu anki durumda teknik bir sorun göremiyorum. İşlemleri sırasıyla 1, 2, 3, 4 şeklinde takip ettiğinizden emin olun.";
}

// Metinle Sorma
btnAskText.addEventListener('click', () => {
    const question = assistantInput.value.trim();
    if (!question) {
        speak("Lütfen önce metin kutusuna bir soru yazın.");
        return;
    }
    const answer = analyzeUserQuestion(question);
    speak(answer);
    assistantInput.value = ''; // Kutuyu temizle
});

// Mikrofonla (Sesle) Sorma
btnAskVoice.addEventListener('click', () => {
    // Tarayıcının Ses Tanıma (Speech API) desteğini kontrol et
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        speak("Üzgünüm, tarayıcınız mikrofonla sesli komut özelliğini desteklemiyor. Lütfen sorunuzu yazarak sorun.");
        return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'tr-TR';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
        voiceStatus.textContent = "Sizi dinliyorum, lütfen konuşun...";
        btnAskVoice.style.backgroundColor = "var(--accent-danger)"; // Kırmızıya dön (kayıt)
    };

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        assistantInput.value = transcript;
        voiceStatus.textContent = `Bunu dediniz: ${transcript}`;
        
        // Asistan soruyu analiz etsin
        const answer = analyzeUserQuestion(transcript);
        speak(`Sorduğunuz soru: ${transcript}. Cevabım: ${answer}`);
    };

    recognition.onerror = (event) => {
        speak("Sizi tam olarak duyamadım veya mikrofon izni vermediniz. Lütfen tekrar deneyin.");
    };

    recognition.onend = () => {
        btnAskVoice.style.backgroundColor = "var(--accent-warning)"; // Eski haline dön
    };

    recognition.start();
});
