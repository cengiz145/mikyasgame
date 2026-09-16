window.achievementsList = [
    {
        id: "easy_1",
        title: "Kolay Mod Çırak",
        description: "Kolay Modu 1 kez tamamla",
        checkCondition: function() { return window.gameModes && window.gameModes['easy'] && window.gameModes['easy'].completionCount >= 1; },
        progressText: function() { return "İlerleme: " + (window.gameModes && window.gameModes['easy'] ? window.gameModes['easy'].completionCount : 0) + "/1"; }
    },
    {
        id: "easy_5",
        title: "Kolay Mod Hevesli",
        description: "Kolay Modu 5 kez tamamla",
        checkCondition: function() { return window.gameModes && window.gameModes['easy'] && window.gameModes['easy'].completionCount >= 5; },
        progressText: function() { return "İlerleme: " + (window.gameModes && window.gameModes['easy'] ? window.gameModes['easy'].completionCount : 0) + "/5"; }
    },
    {
        id: "easy_10",
        title: "Kolay Mod Deneyimli",
        description: "Kolay Modu 10 kez tamamla",
        checkCondition: function() { return window.gameModes && window.gameModes['easy'] && window.gameModes['easy'].completionCount >= 10; },
        progressText: function() { return "İlerleme: " + (window.gameModes && window.gameModes['easy'] ? window.gameModes['easy'].completionCount : 0) + "/10"; }
    },
    {
        id: "easy_25",
        title: "Kolay Mod Uzman",
        description: "Kolay Modu 25 kez tamamla",
        checkCondition: function() { return window.gameModes && window.gameModes['easy'] && window.gameModes['easy'].completionCount >= 25; },
        progressText: function() { return "İlerleme: " + (window.gameModes && window.gameModes['easy'] ? window.gameModes['easy'].completionCount : 0) + "/25"; }
    },
    {
        id: "easy_50",
        title: "Kolay Mod Usta",
        description: "Kolay Modu 50 kez tamamla",
        checkCondition: function() { return window.gameModes && window.gameModes['easy'] && window.gameModes['easy'].completionCount >= 50; },
        progressText: function() { return "İlerleme: " + (window.gameModes && window.gameModes['easy'] ? window.gameModes['easy'].completionCount : 0) + "/50"; }
    },
    {
        id: "easy_100",
        title: "Kolay Mod Efsane",
        description: "Kolay Modu 100 kez tamamla",
        checkCondition: function() { return window.gameModes && window.gameModes['easy'] && window.gameModes['easy'].completionCount >= 100; },
        progressText: function() { return "İlerleme: " + (window.gameModes && window.gameModes['easy'] ? window.gameModes['easy'].completionCount : 0) + "/100"; }
    },
    {
        id: "medium_1",
        title: "Orta Mod Çırak",
        description: "Orta Modu 1 kez tamamla",
        checkCondition: function() { return window.gameModes && window.gameModes['medium'] && window.gameModes['medium'].completionCount >= 1; },
        progressText: function() { return "İlerleme: " + (window.gameModes && window.gameModes['medium'] ? window.gameModes['medium'].completionCount : 0) + "/1"; }
    },
    {
        id: "medium_5",
        title: "Orta Mod Hevesli",
        description: "Orta Modu 5 kez tamamla",
        checkCondition: function() { return window.gameModes && window.gameModes['medium'] && window.gameModes['medium'].completionCount >= 5; },
        progressText: function() { return "İlerleme: " + (window.gameModes && window.gameModes['medium'] ? window.gameModes['medium'].completionCount : 0) + "/5"; }
    },
    {
        id: "medium_10",
        title: "Orta Mod Deneyimli",
        description: "Orta Modu 10 kez tamamla",
        checkCondition: function() { return window.gameModes && window.gameModes['medium'] && window.gameModes['medium'].completionCount >= 10; },
        progressText: function() { return "İlerleme: " + (window.gameModes && window.gameModes['medium'] ? window.gameModes['medium'].completionCount : 0) + "/10"; }
    },
    {
        id: "medium_25",
        title: "Orta Mod Uzman",
        description: "Orta Modu 25 kez tamamla",
        checkCondition: function() { return window.gameModes && window.gameModes['medium'] && window.gameModes['medium'].completionCount >= 25; },
        progressText: function() { return "İlerleme: " + (window.gameModes && window.gameModes['medium'] ? window.gameModes['medium'].completionCount : 0) + "/25"; }
    },
    {
        id: "medium_50",
        title: "Orta Mod Usta",
        description: "Orta Modu 50 kez tamamla",
        checkCondition: function() { return window.gameModes && window.gameModes['medium'] && window.gameModes['medium'].completionCount >= 50; },
        progressText: function() { return "İlerleme: " + (window.gameModes && window.gameModes['medium'] ? window.gameModes['medium'].completionCount : 0) + "/50"; }
    },
    {
        id: "medium_100",
        title: "Orta Mod Efsane",
        description: "Orta Modu 100 kez tamamla",
        checkCondition: function() { return window.gameModes && window.gameModes['medium'] && window.gameModes['medium'].completionCount >= 100; },
        progressText: function() { return "İlerleme: " + (window.gameModes && window.gameModes['medium'] ? window.gameModes['medium'].completionCount : 0) + "/100"; }
    },
    {
        id: "hard_1",
        title: "Zor Mod Çırak",
        description: "Zor Modu 1 kez tamamla",
        checkCondition: function() { return window.gameModes && window.gameModes['hard'] && window.gameModes['hard'].completionCount >= 1; },
        progressText: function() { return "İlerleme: " + (window.gameModes && window.gameModes['hard'] ? window.gameModes['hard'].completionCount : 0) + "/1"; }
    },
    {
        id: "hard_5",
        title: "Zor Mod Hevesli",
        description: "Zor Modu 5 kez tamamla",
        checkCondition: function() { return window.gameModes && window.gameModes['hard'] && window.gameModes['hard'].completionCount >= 5; },
        progressText: function() { return "İlerleme: " + (window.gameModes && window.gameModes['hard'] ? window.gameModes['hard'].completionCount : 0) + "/5"; }
    },
    {
        id: "hard_10",
        title: "Zor Mod Deneyimli",
        description: "Zor Modu 10 kez tamamla",
        checkCondition: function() { return window.gameModes && window.gameModes['hard'] && window.gameModes['hard'].completionCount >= 10; },
        progressText: function() { return "İlerleme: " + (window.gameModes && window.gameModes['hard'] ? window.gameModes['hard'].completionCount : 0) + "/10"; }
    },
    {
        id: "hard_25",
        title: "Zor Mod Uzman",
        description: "Zor Modu 25 kez tamamla",
        checkCondition: function() { return window.gameModes && window.gameModes['hard'] && window.gameModes['hard'].completionCount >= 25; },
        progressText: function() { return "İlerleme: " + (window.gameModes && window.gameModes['hard'] ? window.gameModes['hard'].completionCount : 0) + "/25"; }
    },
    {
        id: "hard_50",
        title: "Zor Mod Usta",
        description: "Zor Modu 50 kez tamamla",
        checkCondition: function() { return window.gameModes && window.gameModes['hard'] && window.gameModes['hard'].completionCount >= 50; },
        progressText: function() { return "İlerleme: " + (window.gameModes && window.gameModes['hard'] ? window.gameModes['hard'].completionCount : 0) + "/50"; }
    },
    {
        id: "hard_100",
        title: "Zor Mod Efsane",
        description: "Zor Modu 100 kez tamamla",
        checkCondition: function() { return window.gameModes && window.gameModes['hard'] && window.gameModes['hard'].completionCount >= 100; },
        progressText: function() { return "İlerleme: " + (window.gameModes && window.gameModes['hard'] ? window.gameModes['hard'].completionCount : 0) + "/100"; }
    },
    {
        id: "missing_notes_1",
        title: "Kayıp Notalar Çırak",
        description: "Kayıp Notalaru 1 kez tamamla",
        checkCondition: function() { return window.gameModes && window.gameModes['missing_notes'] && window.gameModes['missing_notes'].completionCount >= 1; },
        progressText: function() { return "İlerleme: " + (window.gameModes && window.gameModes['missing_notes'] ? window.gameModes['missing_notes'].completionCount : 0) + "/1"; }
    },
    {
        id: "missing_notes_5",
        title: "Kayıp Notalar Hevesli",
        description: "Kayıp Notalaru 5 kez tamamla",
        checkCondition: function() { return window.gameModes && window.gameModes['missing_notes'] && window.gameModes['missing_notes'].completionCount >= 5; },
        progressText: function() { return "İlerleme: " + (window.gameModes && window.gameModes['missing_notes'] ? window.gameModes['missing_notes'].completionCount : 0) + "/5"; }
    },
    {
        id: "missing_notes_10",
        title: "Kayıp Notalar Deneyimli",
        description: "Kayıp Notalaru 10 kez tamamla",
        checkCondition: function() { return window.gameModes && window.gameModes['missing_notes'] && window.gameModes['missing_notes'].completionCount >= 10; },
        progressText: function() { return "İlerleme: " + (window.gameModes && window.gameModes['missing_notes'] ? window.gameModes['missing_notes'].completionCount : 0) + "/10"; }
    },
    {
        id: "missing_notes_25",
        title: "Kayıp Notalar Uzman",
        description: "Kayıp Notalaru 25 kez tamamla",
        checkCondition: function() { return window.gameModes && window.gameModes['missing_notes'] && window.gameModes['missing_notes'].completionCount >= 25; },
        progressText: function() { return "İlerleme: " + (window.gameModes && window.gameModes['missing_notes'] ? window.gameModes['missing_notes'].completionCount : 0) + "/25"; }
    },
    {
        id: "missing_notes_50",
        title: "Kayıp Notalar Usta",
        description: "Kayıp Notalaru 50 kez tamamla",
        checkCondition: function() { return window.gameModes && window.gameModes['missing_notes'] && window.gameModes['missing_notes'].completionCount >= 50; },
        progressText: function() { return "İlerleme: " + (window.gameModes && window.gameModes['missing_notes'] ? window.gameModes['missing_notes'].completionCount : 0) + "/50"; }
    },
    {
        id: "missing_notes_100",
        title: "Kayıp Notalar Efsane",
        description: "Kayıp Notalaru 100 kez tamamla",
        checkCondition: function() { return window.gameModes && window.gameModes['missing_notes'] && window.gameModes['missing_notes'].completionCount >= 100; },
        progressText: function() { return "İlerleme: " + (window.gameModes && window.gameModes['missing_notes'] ? window.gameModes['missing_notes'].completionCount : 0) + "/100"; }
    },
    {
        id: "rhythm_mode_1",
        title: "Ritim Avcısı Çırak",
        description: "Ritim Avcısıu 1 kez tamamla",
        checkCondition: function() { return window.gameModes && window.gameModes['rhythm_mode'] && window.gameModes['rhythm_mode'].completionCount >= 1; },
        progressText: function() { return "İlerleme: " + (window.gameModes && window.gameModes['rhythm_mode'] ? window.gameModes['rhythm_mode'].completionCount : 0) + "/1"; }
    },
    {
        id: "rhythm_mode_5",
        title: "Ritim Avcısı Hevesli",
        description: "Ritim Avcısıu 5 kez tamamla",
        checkCondition: function() { return window.gameModes && window.gameModes['rhythm_mode'] && window.gameModes['rhythm_mode'].completionCount >= 5; },
        progressText: function() { return "İlerleme: " + (window.gameModes && window.gameModes['rhythm_mode'] ? window.gameModes['rhythm_mode'].completionCount : 0) + "/5"; }
    },
    {
        id: "rhythm_mode_10",
        title: "Ritim Avcısı Deneyimli",
        description: "Ritim Avcısıu 10 kez tamamla",
        checkCondition: function() { return window.gameModes && window.gameModes['rhythm_mode'] && window.gameModes['rhythm_mode'].completionCount >= 10; },
        progressText: function() { return "İlerleme: " + (window.gameModes && window.gameModes['rhythm_mode'] ? window.gameModes['rhythm_mode'].completionCount : 0) + "/10"; }
    },
    {
        id: "rhythm_mode_25",
        title: "Ritim Avcısı Uzman",
        description: "Ritim Avcısıu 25 kez tamamla",
        checkCondition: function() { return window.gameModes && window.gameModes['rhythm_mode'] && window.gameModes['rhythm_mode'].completionCount >= 25; },
        progressText: function() { return "İlerleme: " + (window.gameModes && window.gameModes['rhythm_mode'] ? window.gameModes['rhythm_mode'].completionCount : 0) + "/25"; }
    },
    {
        id: "rhythm_mode_50",
        title: "Ritim Avcısı Usta",
        description: "Ritim Avcısıu 50 kez tamamla",
        checkCondition: function() { return window.gameModes && window.gameModes['rhythm_mode'] && window.gameModes['rhythm_mode'].completionCount >= 50; },
        progressText: function() { return "İlerleme: " + (window.gameModes && window.gameModes['rhythm_mode'] ? window.gameModes['rhythm_mode'].completionCount : 0) + "/50"; }
    },
    {
        id: "rhythm_mode_100",
        title: "Ritim Avcısı Efsane",
        description: "Ritim Avcısıu 100 kez tamamla",
        checkCondition: function() { return window.gameModes && window.gameModes['rhythm_mode'] && window.gameModes['rhythm_mode'].completionCount >= 100; },
        progressText: function() { return "İlerleme: " + (window.gameModes && window.gameModes['rhythm_mode'] ? window.gameModes['rhythm_mode'].completionCount : 0) + "/100"; }
    },
    {
        id: "flawless_1",
        title: "Kusursuz 1",
        description: "Toplam 1 kez hiçbir hata yapmadan oyunu tamamla",
        checkCondition: function() { let fw = parseInt(localStorage.getItem('hafizaGuvenFlawlessWins')) || 0; return fw >= 1; },
        progressText: function() { let fw = parseInt(localStorage.getItem('hafizaGuvenFlawlessWins')) || 0; return "İlerleme: " + fw + "/1"; }
    },
    {
        id: "flawless_5",
        title: "Kusursuz 5",
        description: "Toplam 5 kez hiçbir hata yapmadan oyunu tamamla",
        checkCondition: function() { let fw = parseInt(localStorage.getItem('hafizaGuvenFlawlessWins')) || 0; return fw >= 5; },
        progressText: function() { let fw = parseInt(localStorage.getItem('hafizaGuvenFlawlessWins')) || 0; return "İlerleme: " + fw + "/5"; }
    },
    {
        id: "flawless_10",
        title: "Kusursuz 10",
        description: "Toplam 10 kez hiçbir hata yapmadan oyunu tamamla",
        checkCondition: function() { let fw = parseInt(localStorage.getItem('hafizaGuvenFlawlessWins')) || 0; return fw >= 10; },
        progressText: function() { let fw = parseInt(localStorage.getItem('hafizaGuvenFlawlessWins')) || 0; return "İlerleme: " + fw + "/10"; }
    },
    {
        id: "flawless_25",
        title: "Kusursuz 25",
        description: "Toplam 25 kez hiçbir hata yapmadan oyunu tamamla",
        checkCondition: function() { let fw = parseInt(localStorage.getItem('hafizaGuvenFlawlessWins')) || 0; return fw >= 25; },
        progressText: function() { let fw = parseInt(localStorage.getItem('hafizaGuvenFlawlessWins')) || 0; return "İlerleme: " + fw + "/25"; }
    },
    {
        id: "flawless_50",
        title: "Kusursuz 50",
        description: "Toplam 50 kez hiçbir hata yapmadan oyunu tamamla",
        checkCondition: function() { let fw = parseInt(localStorage.getItem('hafizaGuvenFlawlessWins')) || 0; return fw >= 50; },
        progressText: function() { let fw = parseInt(localStorage.getItem('hafizaGuvenFlawlessWins')) || 0; return "İlerleme: " + fw + "/50"; }
    },
    {
        id: "flawless_75",
        title: "Kusursuz 75",
        description: "Toplam 75 kez hiçbir hata yapmadan oyunu tamamla",
        checkCondition: function() { let fw = parseInt(localStorage.getItem('hafizaGuvenFlawlessWins')) || 0; return fw >= 75; },
        progressText: function() { let fw = parseInt(localStorage.getItem('hafizaGuvenFlawlessWins')) || 0; return "İlerleme: " + fw + "/75"; }
    },
    {
        id: "flawless_100",
        title: "Kusursuz 100",
        description: "Toplam 100 kez hiçbir hata yapmadan oyunu tamamla",
        checkCondition: function() { let fw = parseInt(localStorage.getItem('hafizaGuvenFlawlessWins')) || 0; return fw >= 100; },
        progressText: function() { let fw = parseInt(localStorage.getItem('hafizaGuvenFlawlessWins')) || 0; return "İlerleme: " + fw + "/100"; }
    },
    {
        id: "flawless_150",
        title: "Kusursuz 150",
        description: "Toplam 150 kez hiçbir hata yapmadan oyunu tamamla",
        checkCondition: function() { let fw = parseInt(localStorage.getItem('hafizaGuvenFlawlessWins')) || 0; return fw >= 150; },
        progressText: function() { let fw = parseInt(localStorage.getItem('hafizaGuvenFlawlessWins')) || 0; return "İlerleme: " + fw + "/150"; }
    },
    {
        id: "flawless_200",
        title: "Kusursuz 200",
        description: "Toplam 200 kez hiçbir hata yapmadan oyunu tamamla",
        checkCondition: function() { let fw = parseInt(localStorage.getItem('hafizaGuvenFlawlessWins')) || 0; return fw >= 200; },
        progressText: function() { let fw = parseInt(localStorage.getItem('hafizaGuvenFlawlessWins')) || 0; return "İlerleme: " + fw + "/200"; }
    },
    {
        id: "flawless_250",
        title: "Kusursuz 250",
        description: "Toplam 250 kez hiçbir hata yapmadan oyunu tamamla",
        checkCondition: function() { let fw = parseInt(localStorage.getItem('hafizaGuvenFlawlessWins')) || 0; return fw >= 250; },
        progressText: function() { let fw = parseInt(localStorage.getItem('hafizaGuvenFlawlessWins')) || 0; return "İlerleme: " + fw + "/250"; }
    },
    {
        id: "buzsuz_3",
        title: "Sadık",
        description: "3 Gün boyunca seriyi bozmadan giriş yap",
        checkCondition: function() { let bg = parseInt(localStorage.getItem('hafizaGuvenBuzsuzGun')) || 0; return bg >= 3; },
        progressText: function() { let bg = parseInt(localStorage.getItem('hafizaGuvenBuzsuzGun')) || 0; return "İlerleme: " + bg + "/3"; }
    },
    {
        id: "buzsuz_7",
        title: "Haftalık Müzisyen",
        description: "7 Gün boyunca seriyi bozmadan giriş yap",
        checkCondition: function() { let bg = parseInt(localStorage.getItem('hafizaGuvenBuzsuzGun')) || 0; return bg >= 7; },
        progressText: function() { let bg = parseInt(localStorage.getItem('hafizaGuvenBuzsuzGun')) || 0; return "İlerleme: " + bg + "/7"; }
    },
    {
        id: "buzsuz_14",
        title: "İki Haftalık Maraton",
        description: "14 Gün boyunca seriyi bozmadan giriş yap",
        checkCondition: function() { let bg = parseInt(localStorage.getItem('hafizaGuvenBuzsuzGun')) || 0; return bg >= 14; },
        progressText: function() { let bg = parseInt(localStorage.getItem('hafizaGuvenBuzsuzGun')) || 0; return "İlerleme: " + bg + "/14"; }
    },
    {
        id: "buzsuz_30",
        title: "Aylık Usta",
        description: "30 Gün boyunca seriyi bozmadan giriş yap",
        checkCondition: function() { let bg = parseInt(localStorage.getItem('hafizaGuvenBuzsuzGun')) || 0; return bg >= 30; },
        progressText: function() { let bg = parseInt(localStorage.getItem('hafizaGuvenBuzsuzGun')) || 0; return "İlerleme: " + bg + "/30"; }
    },
    {
        id: "buzsuz_60",
        title: "İki Aylık İrade",
        description: "60 Gün boyunca seriyi bozmadan giriş yap",
        checkCondition: function() { let bg = parseInt(localStorage.getItem('hafizaGuvenBuzsuzGun')) || 0; return bg >= 60; },
        progressText: function() { let bg = parseInt(localStorage.getItem('hafizaGuvenBuzsuzGun')) || 0; return "İlerleme: " + bg + "/60"; }
    },
    {
        id: "buzsuz_100",
        title: "Yüzbaşı",
        description: "100 Gün boyunca seriyi bozmadan giriş yap",
        checkCondition: function() { let bg = parseInt(localStorage.getItem('hafizaGuvenBuzsuzGun')) || 0; return bg >= 100; },
        progressText: function() { let bg = parseInt(localStorage.getItem('hafizaGuvenBuzsuzGun')) || 0; return "İlerleme: " + bg + "/100"; }
    },
    {
        id: "buzsuz_180",
        title: "Yarım Yıl",
        description: "180 Gün boyunca seriyi bozmadan giriş yap",
        checkCondition: function() { let bg = parseInt(localStorage.getItem('hafizaGuvenBuzsuzGun')) || 0; return bg >= 180; },
        progressText: function() { let bg = parseInt(localStorage.getItem('hafizaGuvenBuzsuzGun')) || 0; return "İlerleme: " + bg + "/180"; }
    },
    {
        id: "buzsuz_365",
        title: "Yılların Sanatçısı",
        description: "365 Gün boyunca seriyi bozmadan giriş yap",
        checkCondition: function() { let bg = parseInt(localStorage.getItem('hafizaGuvenBuzsuzGun')) || 0; return bg >= 365; },
        progressText: function() { let bg = parseInt(localStorage.getItem('hafizaGuvenBuzsuzGun')) || 0; return "İlerleme: " + bg + "/365"; }
    },
    {
        id: "tokens_100",
        title: "Zenginliğe Doğru 100",
        description: "Toplam 100 Jeton topla (cüzdandaki miktar)",
        checkCondition: function() { let tk = parseInt(localStorage.getItem('hafizaGuvenTotalTokens')) || 0; return tk >= 100; },
        progressText: function() { let tk = parseInt(localStorage.getItem('hafizaGuvenTotalTokens')) || 0; return "İlerleme: " + tk + "/100"; }
    },
    {
        id: "tokens_500",
        title: "Zenginliğe Doğru 500",
        description: "Toplam 500 Jeton topla (cüzdandaki miktar)",
        checkCondition: function() { let tk = parseInt(localStorage.getItem('hafizaGuvenTotalTokens')) || 0; return tk >= 500; },
        progressText: function() { let tk = parseInt(localStorage.getItem('hafizaGuvenTotalTokens')) || 0; return "İlerleme: " + tk + "/500"; }
    },
    {
        id: "tokens_1000",
        title: "Zenginliğe Doğru 1000",
        description: "Toplam 1000 Jeton topla (cüzdandaki miktar)",
        checkCondition: function() { let tk = parseInt(localStorage.getItem('hafizaGuvenTotalTokens')) || 0; return tk >= 1000; },
        progressText: function() { let tk = parseInt(localStorage.getItem('hafizaGuvenTotalTokens')) || 0; return "İlerleme: " + tk + "/1000"; }
    },
    {
        id: "tokens_2500",
        title: "Zenginliğe Doğru 2500",
        description: "Toplam 2500 Jeton topla (cüzdandaki miktar)",
        checkCondition: function() { let tk = parseInt(localStorage.getItem('hafizaGuvenTotalTokens')) || 0; return tk >= 2500; },
        progressText: function() { let tk = parseInt(localStorage.getItem('hafizaGuvenTotalTokens')) || 0; return "İlerleme: " + tk + "/2500"; }
    },
    {
        id: "tokens_5000",
        title: "Zenginliğe Doğru 5000",
        description: "Toplam 5000 Jeton topla (cüzdandaki miktar)",
        checkCondition: function() { let tk = parseInt(localStorage.getItem('hafizaGuvenTotalTokens')) || 0; return tk >= 5000; },
        progressText: function() { let tk = parseInt(localStorage.getItem('hafizaGuvenTotalTokens')) || 0; return "İlerleme: " + tk + "/5000"; }
    },
    {
        id: "tokens_10000",
        title: "Zenginliğe Doğru 10000",
        description: "Toplam 10000 Jeton topla (cüzdandaki miktar)",
        checkCondition: function() { let tk = parseInt(localStorage.getItem('hafizaGuvenTotalTokens')) || 0; return tk >= 10000; },
        progressText: function() { let tk = parseInt(localStorage.getItem('hafizaGuvenTotalTokens')) || 0; return "İlerleme: " + tk + "/10000"; }
    },
    {
        id: "tokens_25000",
        title: "Zenginliğe Doğru 25000",
        description: "Toplam 25000 Jeton topla (cüzdandaki miktar)",
        checkCondition: function() { let tk = parseInt(localStorage.getItem('hafizaGuvenTotalTokens')) || 0; return tk >= 25000; },
        progressText: function() { let tk = parseInt(localStorage.getItem('hafizaGuvenTotalTokens')) || 0; return "İlerleme: " + tk + "/25000"; }
    },
    {
        id: "tokens_50000",
        title: "Zenginliğe Doğru 50000",
        description: "Toplam 50000 Jeton topla (cüzdandaki miktar)",
        checkCondition: function() { let tk = parseInt(localStorage.getItem('hafizaGuvenTotalTokens')) || 0; return tk >= 50000; },
        progressText: function() { let tk = parseInt(localStorage.getItem('hafizaGuvenTotalTokens')) || 0; return "İlerleme: " + tk + "/50000"; }
    },
    {
        id: "tokens_100000",
        title: "Zenginliğe Doğru 100000",
        description: "Toplam 100000 Jeton topla (cüzdandaki miktar)",
        checkCondition: function() { let tk = parseInt(localStorage.getItem('hafizaGuvenTotalTokens')) || 0; return tk >= 100000; },
        progressText: function() { let tk = parseInt(localStorage.getItem('hafizaGuvenTotalTokens')) || 0; return "İlerleme: " + tk + "/100000"; }
    },
    {
        id: "tokens_250000",
        title: "Zenginliğe Doğru 250000",
        description: "Toplam 250000 Jeton topla (cüzdandaki miktar)",
        checkCondition: function() { let tk = parseInt(localStorage.getItem('hafizaGuvenTotalTokens')) || 0; return tk >= 250000; },
        progressText: function() { let tk = parseInt(localStorage.getItem('hafizaGuvenTotalTokens')) || 0; return "İlerleme: " + tk + "/250000"; }
    },
    {
        id: "buy_mistake_shield",
        title: "İlk Koruma",
        description: "Mağazadan ilk Hata Korumasını satın al",
        checkCondition: function() { return (parseInt(localStorage.getItem('hafizaGuvenHataKorumasi')) || 0) > 0; }
    },
    {
        id: "buy_time_shield",
        title: "Zamana Karşı",
        description: "Mağazadan ilk Zaman Korumasını satın al",
        checkCondition: function() { return (parseInt(localStorage.getItem('hafizaGuvenZamanKorumasi')) || 0) > 0; }
    },
    {
        id: "buy_freeze",
        title: "Buz Tutucu",
        description: "Mağazadan ilk Seri Dondurmayı satın al",
        checkCondition: function() { return (parseInt(localStorage.getItem('hafizaGuvenSeriDondurma')) || 0) > 0; }
    },
    {
        id: "pack_hafizaGuvenBaglamaPack",
        title: "Bağlama Sesi",
        description: "Mağazadan Bağlama ses paketini al",
        checkCondition: function() { return localStorage.getItem('hafizaGuvenBaglamaPack') === 'true'; }
    },
    {
        id: "pack_hafizaGuvenKavalPack",
        title: "Kaval Sesi",
        description: "Mağazadan Kaval ses paketini al",
        checkCondition: function() { return localStorage.getItem('hafizaGuvenKavalPack') === 'true'; }
    },
    {
        id: "pack_hafizaGuvenFlutPack",
        title: "Flüt Sesi",
        description: "Mağazadan Flüt ses paketini al",
        checkCondition: function() { return localStorage.getItem('hafizaGuvenFlutPack') === 'true'; }
    },
    {
        id: "pack_hafizaGuvenKanunPack",
        title: "Kanun Sesi",
        description: "Mağazadan Kanun ses paketini al",
        checkCondition: function() { return localStorage.getItem('hafizaGuvenKanunPack') === 'true'; }
    },
    {
        id: "term_score_1",
        title: "Terminoloji Avcısı 1",
        description: "Terminoloji sınavında toplam 1 kez tam puan al",
        checkCondition: function() { let ts = parseInt(localStorage.getItem('hafizaGuvenTermFullScore')) || 0; return ts >= 1; },
        progressText: function() { let ts = parseInt(localStorage.getItem('hafizaGuvenTermFullScore')) || 0; return "İlerleme: " + ts + "/1"; }
    },
    {
        id: "term_score_5",
        title: "Terminoloji Avcısı 5",
        description: "Terminoloji sınavında toplam 5 kez tam puan al",
        checkCondition: function() { let ts = parseInt(localStorage.getItem('hafizaGuvenTermFullScore')) || 0; return ts >= 5; },
        progressText: function() { let ts = parseInt(localStorage.getItem('hafizaGuvenTermFullScore')) || 0; return "İlerleme: " + ts + "/5"; }
    },
    {
        id: "term_score_10",
        title: "Terminoloji Avcısı 10",
        description: "Terminoloji sınavında toplam 10 kez tam puan al",
        checkCondition: function() { let ts = parseInt(localStorage.getItem('hafizaGuvenTermFullScore')) || 0; return ts >= 10; },
        progressText: function() { let ts = parseInt(localStorage.getItem('hafizaGuvenTermFullScore')) || 0; return "İlerleme: " + ts + "/10"; }
    },
    {
        id: "term_score_20",
        title: "Terminoloji Avcısı 20",
        description: "Terminoloji sınavında toplam 20 kez tam puan al",
        checkCondition: function() { let ts = parseInt(localStorage.getItem('hafizaGuvenTermFullScore')) || 0; return ts >= 20; },
        progressText: function() { let ts = parseInt(localStorage.getItem('hafizaGuvenTermFullScore')) || 0; return "İlerleme: " + ts + "/20"; }
    },
    {
        id: "term_score_50",
        title: "Terminoloji Avcısı 50",
        description: "Terminoloji sınavında toplam 50 kez tam puan al",
        checkCondition: function() { let ts = parseInt(localStorage.getItem('hafizaGuvenTermFullScore')) || 0; return ts >= 50; },
        progressText: function() { let ts = parseInt(localStorage.getItem('hafizaGuvenTermFullScore')) || 0; return "İlerleme: " + ts + "/50"; }
    },
    {
        id: "term_learn_1",
        title: "Öğrenmeye Açık 1",
        description: "Öğrenme modunda 1 kez çalışma yap",
        checkCondition: function() { let ts = parseInt(localStorage.getItem('hafizaGuvenTermLearnCount')) || 0; return ts >= 1; },
        progressText: function() { let ts = parseInt(localStorage.getItem('hafizaGuvenTermLearnCount')) || 0; return "İlerleme: " + ts + "/1"; }
    },
    {
        id: "term_learn_5",
        title: "Öğrenmeye Açık 5",
        description: "Öğrenme modunda 5 kez çalışma yap",
        checkCondition: function() { let ts = parseInt(localStorage.getItem('hafizaGuvenTermLearnCount')) || 0; return ts >= 5; },
        progressText: function() { let ts = parseInt(localStorage.getItem('hafizaGuvenTermLearnCount')) || 0; return "İlerleme: " + ts + "/5"; }
    },
    {
        id: "term_learn_10",
        title: "Öğrenmeye Açık 10",
        description: "Öğrenme modunda 10 kez çalışma yap",
        checkCondition: function() { let ts = parseInt(localStorage.getItem('hafizaGuvenTermLearnCount')) || 0; return ts >= 10; },
        progressText: function() { let ts = parseInt(localStorage.getItem('hafizaGuvenTermLearnCount')) || 0; return "İlerleme: " + ts + "/10"; }
    },
    {
        id: "term_learn_25",
        title: "Öğrenmeye Açık 25",
        description: "Öğrenme modunda 25 kez çalışma yap",
        checkCondition: function() { let ts = parseInt(localStorage.getItem('hafizaGuvenTermLearnCount')) || 0; return ts >= 25; },
        progressText: function() { let ts = parseInt(localStorage.getItem('hafizaGuvenTermLearnCount')) || 0; return "İlerleme: " + ts + "/25"; }
    },
    {
        id: "term_learn_50",
        title: "Öğrenmeye Açık 50",
        description: "Öğrenme modunda 50 kez çalışma yap",
        checkCondition: function() { let ts = parseInt(localStorage.getItem('hafizaGuvenTermLearnCount')) || 0; return ts >= 50; },
        progressText: function() { let ts = parseInt(localStorage.getItem('hafizaGuvenTermLearnCount')) || 0; return "İlerleme: " + ts + "/50"; }
    },
    {
        id: "change_name",
        title: "Kimlik Arayışı",
        description: "Kullanıcı adını değiştir",
        checkCondition: function() { return localStorage.getItem('hafizaGuvenUserNickname') && localStorage.getItem('hafizaGuvenUserNickname') !== 'Bilinmeyen'; }
    },
    {
        id: "pvp_match_1",
        title: "Meydan Okuyan 1",
        description: "Toplam 1 çok oyunculu maça katıl",
        checkCondition: function() { let pm = parseInt(localStorage.getItem('hafizaGuvenPvpMatches')) || 0; return pm >= 1; },
        progressText: function() { let pm = parseInt(localStorage.getItem('hafizaGuvenPvpMatches')) || 0; return "İlerleme: " + pm + "/1"; }
    },
    {
        id: "pvp_match_5",
        title: "Meydan Okuyan 5",
        description: "Toplam 5 çok oyunculu maça katıl",
        checkCondition: function() { let pm = parseInt(localStorage.getItem('hafizaGuvenPvpMatches')) || 0; return pm >= 5; },
        progressText: function() { let pm = parseInt(localStorage.getItem('hafizaGuvenPvpMatches')) || 0; return "İlerleme: " + pm + "/5"; }
    },
    {
        id: "pvp_match_10",
        title: "Meydan Okuyan 10",
        description: "Toplam 10 çok oyunculu maça katıl",
        checkCondition: function() { let pm = parseInt(localStorage.getItem('hafizaGuvenPvpMatches')) || 0; return pm >= 10; },
        progressText: function() { let pm = parseInt(localStorage.getItem('hafizaGuvenPvpMatches')) || 0; return "İlerleme: " + pm + "/10"; }
    },
    {
        id: "pvp_match_25",
        title: "Meydan Okuyan 25",
        description: "Toplam 25 çok oyunculu maça katıl",
        checkCondition: function() { let pm = parseInt(localStorage.getItem('hafizaGuvenPvpMatches')) || 0; return pm >= 25; },
        progressText: function() { let pm = parseInt(localStorage.getItem('hafizaGuvenPvpMatches')) || 0; return "İlerleme: " + pm + "/25"; }
    },
    {
        id: "pvp_match_50",
        title: "Meydan Okuyan 50",
        description: "Toplam 50 çok oyunculu maça katıl",
        checkCondition: function() { let pm = parseInt(localStorage.getItem('hafizaGuvenPvpMatches')) || 0; return pm >= 50; },
        progressText: function() { let pm = parseInt(localStorage.getItem('hafizaGuvenPvpMatches')) || 0; return "İlerleme: " + pm + "/50"; }
    },
    {
        id: "pvp_match_100",
        title: "Meydan Okuyan 100",
        description: "Toplam 100 çok oyunculu maça katıl",
        checkCondition: function() { let pm = parseInt(localStorage.getItem('hafizaGuvenPvpMatches')) || 0; return pm >= 100; },
        progressText: function() { let pm = parseInt(localStorage.getItem('hafizaGuvenPvpMatches')) || 0; return "İlerleme: " + pm + "/100"; }
    },
    {
        id: "pvp_match_250",
        title: "Meydan Okuyan 250",
        description: "Toplam 250 çok oyunculu maça katıl",
        checkCondition: function() { let pm = parseInt(localStorage.getItem('hafizaGuvenPvpMatches')) || 0; return pm >= 250; },
        progressText: function() { let pm = parseInt(localStorage.getItem('hafizaGuvenPvpMatches')) || 0; return "İlerleme: " + pm + "/250"; }
    },
    {
        id: "pvp_win_1",
        title: "Arena Şampiyonu 1",
        description: "Toplam 1 çok oyunculu maç kazan",
        checkCondition: function() { let pw = parseInt(localStorage.getItem('hafizaGuvenPvpWins')) || 0; return pw >= 1; },
        progressText: function() { let pw = parseInt(localStorage.getItem('hafizaGuvenPvpWins')) || 0; return "İlerleme: " + pw + "/1"; }
    },
    {
        id: "pvp_win_5",
        title: "Arena Şampiyonu 5",
        description: "Toplam 5 çok oyunculu maç kazan",
        checkCondition: function() { let pw = parseInt(localStorage.getItem('hafizaGuvenPvpWins')) || 0; return pw >= 5; },
        progressText: function() { let pw = parseInt(localStorage.getItem('hafizaGuvenPvpWins')) || 0; return "İlerleme: " + pw + "/5"; }
    },
    {
        id: "pvp_win_10",
        title: "Arena Şampiyonu 10",
        description: "Toplam 10 çok oyunculu maç kazan",
        checkCondition: function() { let pw = parseInt(localStorage.getItem('hafizaGuvenPvpWins')) || 0; return pw >= 10; },
        progressText: function() { let pw = parseInt(localStorage.getItem('hafizaGuvenPvpWins')) || 0; return "İlerleme: " + pw + "/10"; }
    },
    {
        id: "pvp_win_25",
        title: "Arena Şampiyonu 25",
        description: "Toplam 25 çok oyunculu maç kazan",
        checkCondition: function() { let pw = parseInt(localStorage.getItem('hafizaGuvenPvpWins')) || 0; return pw >= 25; },
        progressText: function() { let pw = parseInt(localStorage.getItem('hafizaGuvenPvpWins')) || 0; return "İlerleme: " + pw + "/25"; }
    },
    {
        id: "pvp_win_50",
        title: "Arena Şampiyonu 50",
        description: "Toplam 50 çok oyunculu maç kazan",
        checkCondition: function() { let pw = parseInt(localStorage.getItem('hafizaGuvenPvpWins')) || 0; return pw >= 50; },
        progressText: function() { let pw = parseInt(localStorage.getItem('hafizaGuvenPvpWins')) || 0; return "İlerleme: " + pw + "/50"; }
    },
    {
        id: "pvp_win_100",
        title: "Arena Şampiyonu 100",
        description: "Toplam 100 çok oyunculu maç kazan",
        checkCondition: function() { let pw = parseInt(localStorage.getItem('hafizaGuvenPvpWins')) || 0; return pw >= 100; },
        progressText: function() { let pw = parseInt(localStorage.getItem('hafizaGuvenPvpWins')) || 0; return "İlerleme: " + pw + "/100"; }
    },
    {
        id: "pvp_win_250",
        title: "Arena Şampiyonu 250",
        description: "Toplam 250 çok oyunculu maç kazan",
        checkCondition: function() { let pw = parseInt(localStorage.getItem('hafizaGuvenPvpWins')) || 0; return pw >= 250; },
        progressText: function() { let pw = parseInt(localStorage.getItem('hafizaGuvenPvpWins')) || 0; return "İlerleme: " + pw + "/250"; }
    },
    {
        id: "mistakes_10",
        title: "Hatalar Eğitir 10",
        description: "Oyun boyunca toplam 10 kere yanlış notaya bas (Pes etme!)",
        checkCondition: function() { let tm = parseInt(localStorage.getItem('hafizaGuvenTotalMistakesAllTime')) || 0; return tm >= 10; },
        progressText: function() { let tm = parseInt(localStorage.getItem('hafizaGuvenTotalMistakesAllTime')) || 0; return "İlerleme: " + tm + "/10"; }
    },
    {
        id: "mistakes_50",
        title: "Hatalar Eğitir 50",
        description: "Oyun boyunca toplam 50 kere yanlış notaya bas (Pes etme!)",
        checkCondition: function() { let tm = parseInt(localStorage.getItem('hafizaGuvenTotalMistakesAllTime')) || 0; return tm >= 50; },
        progressText: function() { let tm = parseInt(localStorage.getItem('hafizaGuvenTotalMistakesAllTime')) || 0; return "İlerleme: " + tm + "/50"; }
    },
    {
        id: "mistakes_100",
        title: "Hatalar Eğitir 100",
        description: "Oyun boyunca toplam 100 kere yanlış notaya bas (Pes etme!)",
        checkCondition: function() { let tm = parseInt(localStorage.getItem('hafizaGuvenTotalMistakesAllTime')) || 0; return tm >= 100; },
        progressText: function() { let tm = parseInt(localStorage.getItem('hafizaGuvenTotalMistakesAllTime')) || 0; return "İlerleme: " + tm + "/100"; }
    },
    {
        id: "mistakes_500",
        title: "Hatalar Eğitir 500",
        description: "Oyun boyunca toplam 500 kere yanlış notaya bas (Pes etme!)",
        checkCondition: function() { let tm = parseInt(localStorage.getItem('hafizaGuvenTotalMistakesAllTime')) || 0; return tm >= 500; },
        progressText: function() { let tm = parseInt(localStorage.getItem('hafizaGuvenTotalMistakesAllTime')) || 0; return "İlerleme: " + tm + "/500"; }
    },
    {
        id: "mistakes_1000",
        title: "Hatalar Eğitir 1000",
        description: "Oyun boyunca toplam 1000 kere yanlış notaya bas (Pes etme!)",
        checkCondition: function() { let tm = parseInt(localStorage.getItem('hafizaGuvenTotalMistakesAllTime')) || 0; return tm >= 1000; },
        progressText: function() { let tm = parseInt(localStorage.getItem('hafizaGuvenTotalMistakesAllTime')) || 0; return "İlerleme: " + tm + "/1000"; }
    },
    {
        id: "total_score_1000",
        title: "Skor Makinesi 1000",
        description: "Kariyerin boyunca toplam 1000 puan topla",
        checkCondition: function() { let ts = parseInt(localStorage.getItem('hafizaGuvenLifetimeScore')) || 0; return ts >= 1000; },
        progressText: function() { let ts = parseInt(localStorage.getItem('hafizaGuvenLifetimeScore')) || 0; return "İlerleme: " + ts + "/1000"; }
    },
    {
        id: "total_score_5000",
        title: "Skor Makinesi 5000",
        description: "Kariyerin boyunca toplam 5000 puan topla",
        checkCondition: function() { let ts = parseInt(localStorage.getItem('hafizaGuvenLifetimeScore')) || 0; return ts >= 5000; },
        progressText: function() { let ts = parseInt(localStorage.getItem('hafizaGuvenLifetimeScore')) || 0; return "İlerleme: " + ts + "/5000"; }
    },
    {
        id: "total_score_10000",
        title: "Skor Makinesi 10000",
        description: "Kariyerin boyunca toplam 10000 puan topla",
        checkCondition: function() { let ts = parseInt(localStorage.getItem('hafizaGuvenLifetimeScore')) || 0; return ts >= 10000; },
        progressText: function() { let ts = parseInt(localStorage.getItem('hafizaGuvenLifetimeScore')) || 0; return "İlerleme: " + ts + "/10000"; }
    },
    {
        id: "total_score_50000",
        title: "Skor Makinesi 50000",
        description: "Kariyerin boyunca toplam 50000 puan topla",
        checkCondition: function() { let ts = parseInt(localStorage.getItem('hafizaGuvenLifetimeScore')) || 0; return ts >= 50000; },
        progressText: function() { let ts = parseInt(localStorage.getItem('hafizaGuvenLifetimeScore')) || 0; return "İlerleme: " + ts + "/50000"; }
    },
    {
        id: "total_score_100000",
        title: "Skor Makinesi 100000",
        description: "Kariyerin boyunca toplam 100000 puan topla",
        checkCondition: function() { let ts = parseInt(localStorage.getItem('hafizaGuvenLifetimeScore')) || 0; return ts >= 100000; },
        progressText: function() { let ts = parseInt(localStorage.getItem('hafizaGuvenLifetimeScore')) || 0; return "İlerleme: " + ts + "/100000"; }
    },
];

window.userAchievements = {
    "easy_1": false,
    "easy_5": false,
    "easy_10": false,
    "easy_25": false,
    "easy_50": false,
    "easy_100": false,
    "medium_1": false,
    "medium_5": false,
    "medium_10": false,
    "medium_25": false,
    "medium_50": false,
    "medium_100": false,
    "hard_1": false,
    "hard_5": false,
    "hard_10": false,
    "hard_25": false,
    "hard_50": false,
    "hard_100": false,
    "missing_notes_1": false,
    "missing_notes_5": false,
    "missing_notes_10": false,
    "missing_notes_25": false,
    "missing_notes_50": false,
    "missing_notes_100": false,
    "rhythm_mode_1": false,
    "rhythm_mode_5": false,
    "rhythm_mode_10": false,
    "rhythm_mode_25": false,
    "rhythm_mode_50": false,
    "rhythm_mode_100": false,
    "flawless_1": false,
    "flawless_5": false,
    "flawless_10": false,
    "flawless_25": false,
    "flawless_50": false,
    "flawless_75": false,
    "flawless_100": false,
    "flawless_150": false,
    "flawless_200": false,
    "flawless_250": false,
    "buzsuz_3": false,
    "buzsuz_7": false,
    "buzsuz_14": false,
    "buzsuz_30": false,
    "buzsuz_60": false,
    "buzsuz_100": false,
    "buzsuz_180": false,
    "buzsuz_365": false,
    "tokens_100": false,
    "tokens_500": false,
    "tokens_1000": false,
    "tokens_2500": false,
    "tokens_5000": false,
    "tokens_10000": false,
    "tokens_25000": false,
    "tokens_50000": false,
    "tokens_100000": false,
    "tokens_250000": false,
    "buy_mistake_shield": false,
    "buy_time_shield": false,
    "buy_freeze": false,
    "pack_hafizaGuvenBaglamaPack": false,
    "pack_hafizaGuvenKavalPack": false,
    "pack_hafizaGuvenFlutPack": false,
    "pack_hafizaGuvenKanunPack": false,
    "term_score_1": false,
    "term_score_5": false,
    "term_score_10": false,
    "term_score_20": false,
    "term_score_50": false,
    "term_learn_1": false,
    "term_learn_5": false,
    "term_learn_10": false,
    "term_learn_25": false,
    "term_learn_50": false,
    "change_name": false,
    "pvp_match_1": false,
    "pvp_match_5": false,
    "pvp_match_10": false,
    "pvp_match_25": false,
    "pvp_match_50": false,
    "pvp_match_100": false,
    "pvp_match_250": false,
    "pvp_win_1": false,
    "pvp_win_5": false,
    "pvp_win_10": false,
    "pvp_win_25": false,
    "pvp_win_50": false,
    "pvp_win_100": false,
    "pvp_win_250": false,
    "mistakes_10": false,
    "mistakes_50": false,
    "mistakes_100": false,
    "mistakes_500": false,
    "mistakes_1000": false,
    "total_score_1000": false,
    "total_score_5000": false,
    "total_score_10000": false,
    "total_score_50000": false,
    "total_score_100000": false,
};
