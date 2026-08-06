const fs = require('fs');

let content = fs.readFileSync('js/menu.js', 'utf8');

// Replace Pre-Season trigger
const preSeasonOld = `            if (Math.random() < 0.35 && typeof window.triggerDynamicEvent === 'function') window.triggerDynamicEvent();`;
const preSeasonNew = `            if (!(window.scheduledFriendly && window.scheduledFriendly.day === window.preSeasonDay + 1)) {
                if (Math.random() < 0.35 && typeof window.triggerDynamicEvent === 'function') window.triggerDynamicEvent();
            }`;

content = content.replace(preSeasonOld, preSeasonNew);

// Replace Normal Season trigger
const normalSeasonOld = `            // [YENİ] Dinamik Olay Tetikleyicisi (%25 ihtimal)
            if (Math.random() < 0.35 && typeof window.triggerDynamicEvent === 'function') {
                window.triggerDynamicEvent();
            }`;
const normalSeasonNew = `            // [YENİ] Dinamik Olay Tetikleyicisi (%35 ihtimal)
            // Sadece ertesi gün maç değilse (Cumartesi'den Pazar'a geçerken veya hazırlık maçına geçerken tetiklenme)
            if (window.currentDayOfWeek < 6 && !(window.scheduledFriendly && window.scheduledFriendly.day === window.currentDayOfWeek + 1)) {
                if (Math.random() < 0.35 && typeof window.triggerDynamicEvent === 'function') {
                    window.triggerDynamicEvent();
                }
            }`;

content = content.replace(normalSeasonOld, normalSeasonNew);

fs.writeFileSync('js/menu.js', content, 'utf8');
console.log('Fixed RPG triggers to not overlap with match days.');
