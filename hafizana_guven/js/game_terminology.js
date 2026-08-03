document.addEventListener('DOMContentLoaded', () => {
    const btnTerminologyMain = document.getElementById('btn-terminology-main');
    const terminologyCategoriesContainer = document.getElementById('terminology-categories-container');
    const terminologyCategoriesBackBtn = document.getElementById('terminology-categories-back-btn');
    
    const terminologyMenuContainer = document.getElementById('terminology-menu-container');
    const terminologyBackBtn = document.getElementById('terminology-back-btn');
    const terminologyList = document.getElementById('terminology-list');
    
    const btnTerminologyLearn = document.getElementById('btn-terminology-learn');
    const learningModeContainer = document.getElementById('learning-mode-container');
    const learningBackBtn = document.getElementById('learning-back-btn');
    const btnLearningNext = document.getElementById('btn-learning-next');
    const btnLearningPrev = document.getElementById('btn-learning-prev');
    const learningCardTerm = document.getElementById('learning-card-term');
    const learningCardMeaning = document.getElementById('learning-card-meaning');
    const learningCardCategory = document.getElementById('learning-card-category');
    const learningCard = document.getElementById('learning-card');

    let currentLearnIndex = 0;
    let currentCategoryFilter = "Tümü";
    let filteredMusicTerminology = [];

    // Filter Terminology Data
    function updateFilteredData() {
        if (!musicTerminology) return;
        if (currentCategoryFilter === "Tümü") {
            filteredMusicTerminology = [...musicTerminology];
        } else {
            filteredMusicTerminology = musicTerminology.filter(item => item.category === currentCategoryFilter);
        }
    }

    // Populate Dictionary
    function renderTerminology() {
        terminologyList.innerHTML = '';
        updateFilteredData();
        
        if (filteredMusicTerminology && filteredMusicTerminology.length > 0) {
            filteredMusicTerminology.forEach((item, index) => {
                const li = document.createElement('li');
                li.style.padding = '10px';
                li.style.borderBottom = '1px solid #444';
                li.style.marginBottom = '5px';
                li.style.cursor = 'pointer';
                li.tabIndex = 0;
                
                // For Screen Readers
                li.setAttribute('aria-label', `${item.term}. Anlamı: ${item.meaning}. Kategori: ${item.category}.`);
                
                li.innerHTML = `
                    <div style="font-size: 1.2rem; color: #e9c46a; font-weight: bold;">${item.term}</div>
                    <div style="font-size: 1rem; color: #fff;">${item.meaning}</div>
                    <div style="font-size: 0.8rem; color: #888; font-style: italic;">${item.category}</div>
                `;

                // Add sound effect when clicked/focused
                li.addEventListener('click', () => {
                    if (window.menuEnterSound) window.menuEnterSound.play();
                    if (window.announceToScreenReader) {
                        window.announceToScreenReader(`${item.term}. Anlamı: ${item.meaning}.`);
                    }
                });
                
                li.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter') {
                        li.click();
                    }
                });

                terminologyList.appendChild(li);
            });
        }
    }

    // Enter Category Selection Menu
    if (btnTerminologyMain && terminologyCategoriesContainer) {
        btnTerminologyMain.addEventListener('click', () => {
            if (window.menuEnterSound) window.menuEnterSound.play();
            window.switchMenu(window.difficultyMenu, terminologyCategoriesContainer, 'terminology_categories');
            if (window.announceToScreenReader) window.announceToScreenReader("Müzik Terminolojisi kategorileri açıldı. Lütfen çalışmak istediğiniz kategoriyi seçin.");
        });
    }

    // Go back from Category Menu to Difficulty Menu
    if (terminologyCategoriesBackBtn) {
        terminologyCategoriesBackBtn.addEventListener('click', () => {
            if (window.menuCloseSound) window.menuCloseSound.play();
            window.switchMenu(terminologyCategoriesContainer, window.difficultyMenu, 'difficulty');
        });
    }

    // Category Button Click Listeners
    const categoryButtons = document.querySelectorAll('.btn-category');
    categoryButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            if (window.menuEnterSound) window.menuEnterSound.play();
            currentCategoryFilter = e.target.getAttribute('data-category');
            renderTerminology();
            
            // Set header title based on category
            const titleEl = document.getElementById('terminology-menu-title');
            if (titleEl) {
                titleEl.textContent = currentCategoryFilter === "Tümü" ? "Tüm Müzik Terimleri" : `${currentCategoryFilter} Terimleri`;
            }

            window.switchMenu(terminologyCategoriesContainer, terminologyMenuContainer, 'terminology');
            
            if (window.announceToScreenReader) {
                window.announceToScreenReader(`${currentCategoryFilter} kategorisi açıldı. Aşağı ok tuşlarıyla terimleri inceleyebilirsiniz.`);
            }
            setTimeout(() => {
                const firstItem = terminologyList.querySelector('li');
                if (firstItem) firstItem.focus();
            }, 300);
        });
    });

    // Go back to Category Selection from Dictionary
    if (terminologyBackBtn) {
        terminologyBackBtn.addEventListener('click', () => {
            if (window.menuCloseSound) window.menuCloseSound.play();
            window.switchMenu(terminologyMenuContainer, terminologyCategoriesContainer, 'terminology_categories');
        });
    }

    function showLearningCard(index) {
        if (!filteredMusicTerminology || filteredMusicTerminology.length === 0) return;
        
        const item = filteredMusicTerminology[index];
        learningCardTerm.textContent = item.term;
        learningCardMeaning.textContent = item.meaning;
        learningCardCategory.textContent = `Kategori: ${item.category}`;

        // Screen reader announcement
        const announcement = `${item.term}. Anlamı: ${item.meaning}.`;
        learningCard.setAttribute('aria-label', announcement);
        
        if (window.announceToScreenReader) {
            window.announceToScreenReader(announcement);
        }
        
        if (window.menuEnterSound) window.menuEnterSound.play();
    }

    // Enter Learning Mode
    if (btnTerminologyLearn && learningModeContainer) {
        btnTerminologyLearn.addEventListener('click', () => {
            currentLearnIndex = 0;
            updateFilteredData();
            showLearningCard(currentLearnIndex);
            window.switchMenu(terminologyMenuContainer, learningModeContainer, 'learning');
            setTimeout(() => {
                learningCard.focus();
            }, 300);
        });
    }

    // Go back to Dictionary from Learning Mode
    if (learningBackBtn) {
        learningBackBtn.addEventListener('click', () => {
            if (window.menuCloseSound) window.menuCloseSound.play();
            window.switchMenu(learningModeContainer, terminologyMenuContainer, 'terminology');
        });
    }

    // Next Card
    if (btnLearningNext) {
        btnLearningNext.addEventListener('click', () => {
            currentLearnIndex++;
            if (currentLearnIndex >= filteredMusicTerminology.length) {
                currentLearnIndex = 0; // Loop back to start
            }
            showLearningCard(currentLearnIndex);
            learningCard.focus();
        });
    }

    // Prev Card
    if (btnLearningPrev) {
        btnLearningPrev.addEventListener('click', () => {
            currentLearnIndex--;
            if (currentLearnIndex < 0) {
                currentLearnIndex = filteredMusicTerminology.length - 1; // Loop back to end
            }
            showLearningCard(currentLearnIndex);
            learningCard.focus();
        });
    }

    // Keyboard navigation for learning mode
    document.addEventListener('keydown', (e) => {
        // Only active if learning mode is currently displayed
        if (learningModeContainer && learningModeContainer.style.display !== 'none' && learningModeContainer.style.opacity === '1') {
            if (e.key === 'ArrowRight' || e.key === 'Enter') {
                btnLearningNext.click();
            } else if (e.key === 'ArrowLeft') {
                btnLearningPrev.click();
            }
        }
    });

    // --- EXAM MODE (HAFIZA KARTLARI EŞLEŞTİRME) LOGIC ---
    const btnTerminologyExam = document.getElementById('btn-terminology-exam');
    const terminologyExamContainer = document.getElementById('terminology-exam-container');
    const btnTerminologyExamQuit = document.getElementById('btn-terminology-exam-quit');
    
    const examGrid = document.getElementById('terminology-exam-grid');
    const examStatusBar = document.getElementById('terminology-exam-status-bar');
    const btnTerminologyReady = document.getElementById('btn-terminology-ready');
    const examFeedbackEl = document.getElementById('terminology-exam-feedback');

    let examCards = [];
    let examPhase = 'memorize'; // 'memorize' or 'match'
    let openedCardsCount = 0;
    let selectedCards = [];
    let matchedPairs = 0;

    if (btnTerminologyExam && terminologyExamContainer) {
        btnTerminologyExam.addEventListener('click', () => {
            if (window.menuEnterSound) window.menuEnterSound.play();
            updateFilteredData();
            
            if (filteredMusicTerminology.length < 4) {
                alert("Bu kategoride eşleştirme yapabilmek için en az 4 terim olmalıdır.");
                return;
            }

            initMemoryMatchGame();
            window.switchMenu(terminologyMenuContainer, terminologyExamContainer, 'exam');
        });
    }

    if (btnTerminologyExamQuit) {
        btnTerminologyExamQuit.addEventListener('click', () => {
            if (window.menuCloseSound) window.menuCloseSound.play();
            window.switchMenu(terminologyExamContainer, terminologyMenuContainer, 'terminology');
        });
    }

    if (btnTerminologyReady) {
        btnTerminologyReady.addEventListener('click', () => {
            startMatchingPhase();
        });
    }

    function initMemoryMatchGame() {
        examPhase = 'memorize';
        openedCardsCount = 0;
        selectedCards = [];
        matchedPairs = 0;
        examFeedbackEl.textContent = "";
        examStatusBar.textContent = "Kartları açarak ezberleyin...";
        btnTerminologyReady.style.display = 'none';
        
        // Pick 4 random terms
        let shuffledTerms = [...filteredMusicTerminology].sort(() => Math.random() - 0.5);
        let selectedTerms = shuffledTerms.slice(0, 4);

        // Create 8 cards
        examCards = [];
        selectedTerms.forEach((item, index) => {
            examCards.push({ id: index, type: 'term', content: item.term, isFlipped: false, isMatched: false });
            examCards.push({ id: index, type: 'meaning', content: item.meaning, isFlipped: false, isMatched: false });
        });

        // Shuffle cards
        examCards.sort(() => Math.random() - 0.5);

        renderGrid();
        if (window.announceToScreenReader) window.announceToScreenReader("Eşleştirme oyunu başladı. 8 kapalı kart var. Tüm kartları açıp yerlerini ezberleyin.");
    }

    function renderGrid() {
        examGrid.innerHTML = '';
        examCards.forEach((card, index) => {
            const btn = document.createElement('button');
            btn.className = 'menu-button';
            btn.style.width = '100%';
            btn.style.height = '120px';
            btn.style.fontSize = '1.2rem';
            btn.style.padding = '10px';
            btn.style.display = 'flex';
            btn.style.alignItems = 'center';
            btn.style.justifyContent = 'center';
            btn.style.textAlign = 'center';
            btn.style.transition = 'all 0.3s ease';
            
            // A11y
            btn.setAttribute('aria-label', `Kart ${index + 1}, ${card.isFlipped ? card.content + ' açık' : 'Kapalı'}`);

            if (card.isMatched) {
                btn.style.visibility = 'hidden'; // Hide matched cards but keep space
                btn.setAttribute('aria-hidden', 'true');
            } else if (card.isFlipped) {
                btn.textContent = card.content;
                btn.style.backgroundColor = card.type === 'term' ? '#e9c46a' : '#2a9d8f';
                btn.style.color = '#111';
            } else {
                btn.textContent = "?";
                btn.style.backgroundColor = '#333';
                btn.style.color = '#fff';
            }

            btn.addEventListener('click', () => handleCardClick(index));
            examGrid.appendChild(btn);
        });
    }

    function handleCardClick(index) {
        const card = examCards[index];
        if (card.isMatched || card.isFlipped) return;

        if (examPhase === 'memorize') {
            card.isFlipped = true;
            openedCardsCount++;
            if (window.menuEnterSound) window.menuEnterSound.play();
            if (window.announceToScreenReader) window.announceToScreenReader(`Kart ${index + 1} açıldı: ${card.content}.`);
            
            renderGrid();

            if (openedCardsCount === 8) {
                examStatusBar.textContent = "Tüm kartlar açıldı. Hazır olduğunuzda butona basın!";
                btnTerminologyReady.style.display = 'inline-block';
                btnTerminologyReady.focus();
                if (window.announceToScreenReader) window.announceToScreenReader("Tüm kartlar açıldı. Ezberledikten sonra Hazırım butonuna basın.");
            }
        } 
        else if (examPhase === 'match') {
            if (selectedCards.length >= 2) return; // Wait for animation
            
            card.isFlipped = true;
            selectedCards.push({ cardObj: card, index: index });
            if (window.menuEnterSound) window.menuEnterSound.play();
            
            renderGrid();

            if (selectedCards.length === 1) {
                if (window.announceToScreenReader) window.announceToScreenReader(`Kart açıldı: ${card.content}. Eşini bulun.`);
            } else if (selectedCards.length === 2) {
                checkMatch();
            }
        }
    }

    function startMatchingPhase() {
        if (window.menuCloseSound) window.menuCloseSound.play();
        examPhase = 'match';
        btnTerminologyReady.style.display = 'none';
        examStatusBar.textContent = "Eşleşmeleri Bulun!";
        
        // Flip all cards face down
        examCards.forEach(c => c.isFlipped = false);
        renderGrid();
        
        if (window.announceToScreenReader) window.announceToScreenReader("Kartlar kapandı. Eşleştirme aşaması başladı.");
    }

    function checkMatch() {
        const c1 = selectedCards[0].cardObj;
        const c2 = selectedCards[1].cardObj;

        if (c1.id === c2.id && c1.type !== c2.type) {
            // Match!
            examFeedbackEl.textContent = "Doğru Eşleşme!";
            examFeedbackEl.style.color = '#2a9d8f';
            if (window.successSound) window.successSound.play();
            if (window.announceToScreenReader) window.announceToScreenReader(`Doğru eşleşme: ${c1.content} ve ${c2.content}. Kartlar silindi.`);
            
            setTimeout(() => {
                c1.isMatched = true;
                c2.isMatched = true;
                matchedPairs++;
                selectedCards = [];
                renderGrid();
                examFeedbackEl.textContent = "";
                
                if (matchedPairs === 4) {
                    examStatusBar.textContent = "Tebrikler! Tüm kartları eşleştirdiniz.";
                    if (window.successSound) window.successSound.play();
                    if (window.announceToScreenReader) window.announceToScreenReader("Tebrikler, oyunu başarıyla tamamladınız.");
                    setTimeout(() => {
                        window.switchMenu(terminologyExamContainer, terminologyMenuContainer, 'terminology');
                    }, 3000);
                }
            }, 1000);

        } else {
            // Wrong
            examFeedbackEl.textContent = "Yanlış Eşleşme!";
            examFeedbackEl.style.color = '#e76f51';
            if (window.errorSound) window.errorSound.play();
            if (window.announceToScreenReader) window.announceToScreenReader("Yanlış eşleşme. Kartlar kapanıyor.");
            
            setTimeout(() => {
                c1.isFlipped = false;
                c2.isFlipped = false;
                selectedCards = [];
                renderGrid();
                examFeedbackEl.textContent = "";
            }, 1500);
        }
    }
});
