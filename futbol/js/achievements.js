const achievementsData = [];
const categories = [
    { id: 'match', name: 'Maç & Galibiyet', icon: '⚽' },
    { id: 'goal', name: 'Goller & Hücum', icon: '🥅' },
    { id: 'finance', name: 'Finans & Bütçe', icon: '💰' },
    { id: 'transfer', name: 'Transfer & Kadro', icon: '🤝' },
    { id: 'trophy', name: 'Kupa & Şampiyonluk', icon: '🏆' }
];

// Generate 100 achievements (20 per category)
const generateAchievements = () => {
    let idCounter = 1;
    
    // 1. Maç & Galibiyet (20)
    const matchTargets = [1, 5, 10, 25, 50, 75, 100, 150, 200, 250, 300, 400, 500, 600, 700, 800, 900, 1000, 1500, 2000];
    for (let i = 0; i < 20; i++) {
        achievementsData.push({
            id: idCounter++,
            category: 'match',
            title: `Galibiyet Serüveni ${i+1}`,
            description: `Toplamda ${matchTargets[i]} maç kazan. (Gereken: ${matchTargets[i]} Galibiyet)`,
            target: matchTargets[i],
            current: Math.floor(Math.random() * matchTargets[i])
        });
    }

    // 2. Goller & Hücum (20)
    const goalTargets = [1, 10, 50, 100, 200, 300, 400, 500, 750, 1000, 1250, 1500, 1750, 2000, 2500, 3000, 4000, 5000, 7500, 10000];
    for (let i = 0; i < 20; i++) {
        achievementsData.push({
            id: idCounter++,
            category: 'goal',
            title: `Gol Makinesi ${i+1}`,
            description: `Kariyerin boyunca toplam ${goalTargets[i]} gol at. (Gereken: ${goalTargets[i]} Gol)`,
            target: goalTargets[i],
            current: Math.floor(Math.random() * goalTargets[i])
        });
    }

    // 3. Finans (20)
    const financeTargets = [1, 5, 10, 25, 50, 75, 100, 150, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 1500, 2000, 5000];
    for (let i = 0; i < 20; i++) {
        achievementsData.push({
            id: idCounter++,
            category: 'finance',
            title: `Milyonerler Kulübü ${i+1}`,
            description: `Kulüp bütçesini ${financeTargets[i]} Milyon € seviyesine çıkar. (Gereken: ${financeTargets[i]}M €)`,
            target: financeTargets[i],
            current: Math.floor(Math.random() * (financeTargets[i] / 2))
        });
    }

    // 4. Transfer (20)
    const transferTargets = [1, 5, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 120, 140, 160, 180, 200, 250, 300, 500];
    for (let i = 0; i < 20; i++) {
        achievementsData.push({
            id: idCounter++,
            category: 'transfer',
            title: `Pazarlık Ustası ${i+1}`,
            description: `Toplamda ${transferTargets[i]} oyuncu transfer et. (Gereken: ${transferTargets[i]} Transfer)`,
            target: transferTargets[i],
            current: Math.floor(Math.random() * transferTargets[i])
        });
    }

    // 5. Kupa (20)
    const trophyTargets = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 15, 18, 20, 25, 30, 35, 40, 50, 100];
    for (let i = 0; i < 20; i++) {
        achievementsData.push({
            id: idCounter++,
            category: 'trophy',
            title: `Kupa Avcısı ${i+1}`,
            description: `Kariyerin boyunca ${trophyTargets[i]} kez kupa kaldır. (Gereken: ${trophyTargets[i]} Kupa)`,
            target: trophyTargets[i],
            current: Math.floor(Math.random() * trophyTargets[i])
        });
    }
};

let achievementsVisible = 20;
const INITIAL_LOAD = 20;

function renderAchievements() {
    const container = document.getElementById('achievements-list');
    if (!container) return;
    
    container.innerHTML = '';
    
    const visibleData = achievementsData.slice(0, achievementsVisible);
    
    visibleData.forEach(ach => {
        const cat = categories.find(c => c.id === ach.category);
        const percent = Math.min(100, Math.round((ach.current / ach.target) * 100));
        const isCompleted = percent >= 100;
        
        const itemHTML = `
            <div class="achievement-item" style="background: #2c3e50; padding: 15px; margin-bottom: 15px; border-radius: 8px; border-left: 5px solid ${isCompleted ? '#27ae60' : '#f39c12'}; display: flex; flex-direction: column; gap: 8px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
                    <div style="font-weight: bold; font-size: 1.1em; color: white;">${cat.icon} ${ach.title}</div>
                    <div style="color: ${isCompleted ? '#2ecc71' : '#f39c12'}; font-weight: bold; background: rgba(0,0,0,0.3); padding: 3px 8px; border-radius: 4px;">%${percent}</div>
                </div>
                <div style="font-size: 0.9em; color: #bdc3c7; margin-bottom: 5px;">${ach.description}</div>
                
                <div class="progress-bar-container" style="background: #1a252f; border-radius: 10px; height: 12px; overflow: hidden; position: relative;">
                    <div class="progress-bar-fill" style="background: ${isCompleted ? '#27ae60' : 'linear-gradient(90deg, #f39c12, #e67e22)'}; width: ${percent}%; height: 100%; transition: width 0.5s ease-in-out;"></div>
                </div>
                <div style="text-align: right; font-size: 0.8em; color: #7f8c8d;">
                    ${ach.current} / ${ach.target}
                </div>
            </div>
        `;
        container.insertAdjacentHTML('beforeend', itemHTML);
    });
    
    const loadMoreBtn = document.getElementById('btn-load-more-achievements');
    if (loadMoreBtn) {
        if (achievementsVisible >= achievementsData.length) {
            loadMoreBtn.style.display = 'none';
        } else {
            loadMoreBtn.style.display = 'inline-block';
        }
    }
}

function loadMoreAchievements() {
    achievementsVisible = achievementsData.length;
    renderAchievements();
}

function initAchievementsUI() {
    if (achievementsData.length === 0) {
        generateAchievements();
    }
    
    const btnOpen = document.getElementById('btn-achievements');
    if (btnOpen) {
        btnOpen.addEventListener('click', () => {
            document.querySelectorAll('.menu-container').forEach(c => c.style.display = 'none');
            const cont = document.getElementById('achievements-container');
            if (cont) {
                cont.style.display = 'block';
            }
            
            achievementsVisible = INITIAL_LOAD;
            renderAchievements();
            if(typeof speak === 'function') speak("Başarılar menüsü açıldı.");
        });
    }
    
    const btnClose = document.getElementById('btn-back-achievements');
    if (btnClose) {
        btnClose.addEventListener('click', () => {
            document.getElementById('achievements-container').style.display = 'none';
            document.getElementById('main-menu-container').style.display = 'block';
        });
    }
    
    const btnLoadMore = document.getElementById('btn-load-more-achievements');
    if (btnLoadMore) {
        btnLoadMore.addEventListener('click', loadMoreAchievements);
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAchievementsUI);
} else {
    initAchievementsUI();
}

window.initAchievementsUI = initAchievementsUI;
