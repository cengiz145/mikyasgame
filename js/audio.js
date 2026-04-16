// audio.js - Ses Tanımlamaları ve İşlevleri

// Dinleyiciyi (Kullanıcı) (0,0,0) merkez noktasına koyalım.
Howler.pos(0, 0, 0);
Howler.orientation(0, 0, -1, 0, 1, 0);

window.currentLogoSound = null;

window.bgMusic = new Howl({
    src: ['sounds/menu-music.mp3'],
    loop: true,
    volume: 1.0,
    html5: false
});

window.hoverSound = new Howl({
    src: ['sounds/menu-dolas.ogg'],
    volume: 0.5
});

window.clickSound = new Howl({
    src: ['sounds/menu-tikla.ogg'],
    volume: 0.5
});

// Mobil cihazlarda menü seslerini devre dışı bırak
const isMobileLocal = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 800;
if (isMobileLocal) {
    window.hoverSound.volume(0);
    window.clickSound.volume(0);
}

window.correctSound = new Howl({
    src: ['sounds/dogru.ogg'],
    volume: 1.0
});

window.wrongSound = new Howl({
    src: ['sounds/yanlis.ogg'],
    volume: 1.0,
    onplay: function () {
        if (window.isMobileDevice && navigator.vibrate) {
            navigator.vibrate(1000);
        }
    }
});

window.glasshitSound = new Howl({
    src: ['sounds/glasshit1.ogg'],
    volume: 1.0
});

window.gameOverSound = new Howl({
    src: ['sounds/newmotd2.ogg'],
    volume: 1.0
});

window.music60Sound = new Howl({
    src: ['sounds/music60.ogg'],
    loop: true,
    volume: 0.5
});

window.modeUnlockSound = new Howl({
    src: ['sounds/newmotd1.ogg'],
    volume: 1.0
});

window.storyBGM = new Howl({
    src: ['sounds/menumus31.ogg'],
    loop: true,
    volume: 0.5,
    html5: false
});

window.house2Sound = new Howl({
    src: ['sounds/house2.ogg'],
    loop: true,
    volume: 0.8
});

window.mountainSound = new Howl({
    src: ['sounds/mountain.ogg'],
    loop: true,
    volume: 0.4 // Dağ rüzgarı sesi dengelendi
});

window.music272Sound = new Howl({
    src: ['sounds/music272.ogg'],
    loop: true,
    volume: 0.4
});

window.music117Sound = new Howl({
    src: ['sounds/music117.ogg'],
    loop: true,
    volume: 0.7
});

window.music38Sound = new Howl({
    src: ['sounds/music38.ogg'],
    loop: true,
    volume: 0.7
});

window.music25Sound = new Howl({
    src: ['sounds/music25.ogg'],
    loop: true,
    volume: 0.7
});

window.snowStepSounds = [
    new Howl({ src: ['sounds/snow_wetstep1.ogg'], volume: 1.0 }),
    new Howl({ src: ['sounds/snow_wetstep2.ogg'], volume: 1.0 }),
    new Howl({ src: ['sounds/snow_wetstep3.ogg'], volume: 1.0 }),
    new Howl({ src: ['sounds/snow_wetstep4.ogg'], volume: 1.0 }),
    new Howl({ src: ['sounds/snow_wetstep5.ogg'], volume: 1.0 })
];

window.carpetStepSounds = [
    new Howl({ src: ['sounds/carpet7step1.ogg'], volume: 1.0 }),
    new Howl({ src: ['sounds/carpet7step2.ogg'], volume: 1.0 }),
    new Howl({ src: ['sounds/carpet7step3.ogg'], volume: 1.0 }),
    new Howl({ src: ['sounds/carpet7step4.ogg'], volume: 1.0 }),
    new Howl({ src: ['sounds/carpet7step5.ogg'], volume: 1.0 })
];

window.enterHouseSound = new Howl({
    src: ['sounds/entering_house1.ogg'],
    volume: 1.0
});

window.doorCloseSound = new Howl({
    src: ['sounds/doorclose6.ogg'],
    volume: 1.0
});

window.storyNoteSounds = [
    (() => { let h = new Howl({ src: ['sounds/a.ogg'], volume: 0.15 }); h.stereo(-0.8); return h; })(),
    (() => { let h = new Howl({ src: ['sounds/b.ogg'], volume: 0.15 }); h.stereo(0.5); return h; })(),
    (() => { let h = new Howl({ src: ['sounds/c.ogg'], volume: 0.15 }); h.stereo(-0.2); return h; })(),
    (() => { let h = new Howl({ src: ['sounds/d.ogg'], volume: 0.15 }); h.stereo(0.9); return h; })(),
    (() => { let h = new Howl({ src: ['sounds/e.ogg'], volume: 0.15 }); h.stereo(-0.6); return h; })(),
    (() => { let h = new Howl({ src: ['sounds/f.ogg'], volume: 0.15 }); h.stereo(0.2); return h; })(),
    (() => { let h = new Howl({ src: ['sounds/g.ogg'], volume: 0.15 }); h.stereo(0.7); return h; })()
];

window.buySound = new Howl({
    src: ['sounds/buy.ogg'],
    volume: 1.0
});

window.seconsSound = new Howl({
    src: ['sounds/secons.ogg'],
    volume: 1.0
});

window.secons2Sound = new Howl({
    src: ['sounds/secons2.ogg'],
    volume: 1.0
});

window.clockTickSound = new Howl({
    src: ['sounds/clock_tick1.ogg'],
    volume: 0.5,
    loop: true
});

window.dado3Sound = new Howl({
    src: ['sounds/dado3.ogg'],
    volume: 0.8
});

window.chatReceiveSound = new Howl({
    src: ['sounds/chat12.ogg'],
    volume: 1.0
});

window.achievementSound = new Howl({
    src: ['sounds/dlg_open.ogg'],
    volume: 1.0
});

window.getCoinsSound = new Howl({
    src: ['sounds/getcoins.ogg'],
    volume: 1.0
});

// PİYANO NOTALARI (A, B, C, D, E, F, G)
window.pianoNotes = {
    'a': new Howl({ src: ['sounds/a.ogg'], volume: 1.0 }),
    'b': new Howl({ src: ['sounds/b.ogg'], volume: 1.0 }),
    'c': new Howl({ src: ['sounds/c.ogg'], volume: 1.0 }),
    'd': new Howl({ src: ['sounds/d.ogg'], volume: 1.0 }),
    'e': new Howl({ src: ['sounds/e.ogg'], volume: 1.0 }),
    'f': new Howl({ src: ['sounds/f.ogg'], volume: 1.0 }),
    'g': new Howl({ src: ['sounds/g.ogg'], volume: 1.0 })
};

// Web Audio API'nin mobil tarayıcılarda uyku modundan çıkmasını (resume) garanti altına almak
window.ensureAudioUnlock = () => {
    if (typeof Howler !== 'undefined' && Howler.ctx && Howler.ctx.state === 'suspended') {
        Howler.ctx.resume();
    }
};
document.addEventListener('touchstart', window.ensureAudioUnlock, { passive: true });
document.addEventListener('pointerdown', window.ensureAudioUnlock, { passive: true });

window.updatePan = function (index, total) {
    let xPos = 0;
    if (total > 1) {
        xPos = (index / (total - 1)) * 2 - 1;
    }
    window.hoverSound.stereo ? window.hoverSound.stereo(xPos) : window.hoverSound.pos(xPos, 0, 0);
    window.clickSound.stereo ? window.clickSound.stereo(0) : window.clickSound.pos(0, 0, 0); // Tıklama sesi her zaman merkezde sabitlendi
};

window.playPianoNoteSingle = function (key) {
    for (let k in window.pianoNotes) {
        window.pianoNotes[k].stop();
    }
    if (window.pianoNotes[key]) {
        let soundId = window.pianoNotes[key].play();
        window.pianoNotes[key].seek(0.045, soundId);
    }
};

let isAudioUnlocked = false;
function unlockMobileAudio() {
    if (isAudioUnlocked) return;
    const ctx = window.audioCtx || (window.AudioContext ? new window.AudioContext() : new window.webkitAudioContext());
    if (ctx && ctx.state === 'suspended') {
        ctx.resume();
    }
    // Sessiz frekans ile kilidi aç
    if (ctx) {
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        gainNode.gain.value = 0; 
        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);
        oscillator.start(0);
        oscillator.stop(0.001);
    }
    isAudioUnlocked = true;
}
// Sadece ilk etkileşimde çalışıp kendini imha etsin
document.addEventListener('touchstart', unlockMobileAudio, { once: true });
document.addEventListener('click', unlockMobileAudio, { once: true });
