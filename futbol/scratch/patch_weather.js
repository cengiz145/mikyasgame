const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'js', 'game.js');
let content = fs.readFileSync(filePath, 'utf8');

// Hava durumu başlatma kodunu initGame fonksiyonunun başına ekleyelim
const initWeatherCode = `
    // YENİ: Hava Durumu Sistemi
    const weathers = [
        { type: 'sunny', icon: 'fa-sun', name: 'Güneşli' },
        { type: 'rainy', icon: 'fa-cloud-rain', name: 'Yağmurlu' },
        { type: 'snowy', icon: 'fa-snowflake', name: 'Karlı' },
        { type: 'foggy', icon: 'fa-smog', name: 'Sisli' }
    ];
    let wRand = Math.random();
    let w;
    if (wRand < 0.6) w = weathers[0]; // 60% Güneşli
    else if (wRand < 0.8) w = weathers[1]; // 20% Yağmurlu
    else if (wRand < 0.9) w = weathers[2]; // 10% Karlı
    else w = weathers[3]; // 10% Sisli
    
    window.currentWeather = w;
    
    let weatherIcon = document.getElementById('weather-icon');
    if (weatherIcon) {
        weatherIcon.innerHTML = \`<i class="fas \${w.icon}"></i>\`;
        weatherIcon.title = "Hava Durumu: " + w.name;
        weatherIcon.style.color = w.type === 'snowy' ? '#ecf0f1' : (w.type === 'rainy' ? '#3498db' : (w.type === 'foggy' ? '#95a5a6' : '#f1c40f'));
        weatherIcon.style.borderColor = weatherIcon.style.color;
    }
    
    let weatherAnnounce = "";
    if (w.type === 'sunny') weatherAnnounce = "Stadyumda harika, güneşli bir hava var. Futbol oynamak için mükemmel bir zemin!";
    else if (w.type === 'rainy') weatherAnnounce = "Şu an sağanak yağmur altındayız. Zemin kaygan, oyuncular pas yaparken çok dikkatli olmalı.";
    else if (w.type === 'snowy') weatherAnnounce = "Stadyum bembeyaz! Yoğun kar yağışı oyunu zorlaştıracak gibi duruyor. Topu kontrol etmek çok güç.";
    else if (w.type === 'foggy') weatherAnnounce = "Sahaya yoğun bir sis çöktü. Göz gözü görmüyor sayın seyirciler, kalecilerin işi çok zor.";
    
    setTimeout(() => { if(typeof speak === 'function') speak(weatherAnnounce); }, 3500);
`;

content = content.replace(/function initGame\(\) \{/, `function initGame() {\n${initWeatherCode}`);

// Now modify playTick or match tick to add physics effects.
// Let's find where ball velocity is updated and where pass accuracy is calculated.
// For now, let's just do a simple pass accuracy modifier.
// In game.js we have a function passBall() or similar? Wait, the game logic is inside playTick.
// Let's just modify the `if (Math.random() < successChance)` logic inside the script. We can find 'successChance'
content = content.replace(/let successChance = baseChance \+ powerDiff \+ staminaFactor;/, `let successChance = baseChance + powerDiff + staminaFactor;
        
        // HAVA DURUMU ETKİSİ
        if (window.currentWeather) {
            if (window.currentWeather.type === 'snowy') {
                successChance -= 0.05; // Karda pas hatası artar
            } else if (window.currentWeather.type === 'rainy') {
                successChance -= 0.02; // Yağmurda top kayar
            } else if (window.currentWeather.type === 'foggy') {
                successChance -= 0.03; // Siste görüş düşer
            }
        }`);

fs.writeFileSync(filePath, content, 'utf8');
console.log("Weather patch applied successfully to game.js.");
