/**
 * welcome-calendar.js - 100 Günlük Hoş Geldin Takvimi ve Günlük Ödül Merkezi
 * Her gün artan nakit, XP, şirket kasası, akaryakıt ve HGS ödülleri
 * %100 Ekran Okuyucu (NVDA) Uyumlu, Sesli Anonslu, Web Audio Destekli
 * Geliştirici: Ümit Ekrem Mikyas
 */

(function () {
    'use strict';

    const WelcomeCalendar = {
        STORAGE_KEY: 'otobus_welcome_calendar_v1',
        currentPage: 1, // 1: 1-20, 2: 21-40, 3: 41-60, 4: 61-80, 5: 81-100
        pageSize: 20,

        data: {
            claimedDays: {},      // dayNum -> timestamp
            lastClaimDate: null,  // 'YYYY-MM-DD'
            claimedCount: 0,
            totalClaimedCash: 0,
            totalClaimedXP: 0,
            totalClaimedTreasury: 0
        },

        // 100 GÜNLÜK ÖDÜL VERİTABANI
        DAYS: [
    {
        "day": 1,
        "title": "1. Gün: Kaptan Harcırahı & İlk Sefer Desteği",
        "icon": "🌱",
        "tier": 1,
        "cash": 1000,
        "xp": 100,
        "treasury": 2500,
        "fuel": 20,
        "hgs": 50,
        "desc": "Kişisel cüzdana +1.000 ₺, +100 XP, şirket kasasına +2.500 ₺, +20 L mazot ve +50 ₺ HGS gişe bakiyesi.",
        "isMilestone": false
    },
    {
        "day": 2,
        "title": "2. Gün Kaptan Sefer Takviyesi",
        "icon": "💵",
        "tier": 1,
        "cash": 600,
        "xp": 60,
        "treasury": 1200,
        "fuel": 15,
        "hgs": 25,
        "desc": "+600 ₺ cüzdan harcırahı, +60 XP, +1.200 ₺ şirket kasası, +15 L mazot ve +25 ₺ HGS gişe bakiyesi.",
        "isMilestone": false
    },
    {
        "day": 3,
        "title": "3. Gün Kaptan Sefer Takviyesi",
        "icon": "🛣️",
        "tier": 1,
        "cash": 700,
        "xp": 70,
        "treasury": 1400,
        "fuel": 15,
        "hgs": 25,
        "desc": "+700 ₺ cüzdan harcırahı, +70 XP, +1.400 ₺ şirket kasası, +15 L mazot ve +25 ₺ HGS gişe bakiyesi.",
        "isMilestone": false
    },
    {
        "day": 4,
        "title": "4. Gün Kaptan Sefer Takviyesi",
        "icon": "💵",
        "tier": 1,
        "cash": 800,
        "xp": 80,
        "treasury": 1600,
        "fuel": 15,
        "hgs": 25,
        "desc": "+800 ₺ cüzdan harcırahı, +80 XP, +1.600 ₺ şirket kasası, +15 L mazot ve +25 ₺ HGS gişe bakiyesi.",
        "isMilestone": false
    },
    {
        "day": 5,
        "title": "5. Gün Kaptan Sefer Takviyesi",
        "icon": "⛽",
        "tier": 1,
        "cash": 900,
        "xp": 90,
        "treasury": 1800,
        "fuel": 15,
        "hgs": 25,
        "desc": "+900 ₺ cüzdan harcırahı, +90 XP, +1.800 ₺ şirket kasası, +15 L mazot ve +25 ₺ HGS gişe bakiyesi.",
        "isMilestone": false
    },
    {
        "day": 6,
        "title": "6. Gün Kaptan Sefer Takviyesi",
        "icon": "💵",
        "tier": 1,
        "cash": 1000,
        "xp": 100,
        "treasury": 2000,
        "fuel": 15,
        "hgs": 25,
        "desc": "+1.000 ₺ cüzdan harcırahı, +100 XP, +2.000 ₺ şirket kasası, +15 L mazot ve +25 ₺ HGS gişe bakiyesi.",
        "isMilestone": false
    },
    {
        "day": 7,
        "title": "7. Gün (1. Hafta): 1. Sınıf Stajyer Brövesi İkramiyesi",
        "icon": "⭐",
        "tier": 1,
        "cash": 3500,
        "xp": 300,
        "treasury": 7500,
        "fuel": 35,
        "hgs": 100,
        "desc": "Haftalık sadakat bonusu: +3.500 ₺ cüzdan, +300 XP, +7.500 ₺ kasa, +35 L mazot ve +100 ₺ HGS.",
        "isMilestone": true
    },
    {
        "day": 8,
        "title": "8. Gün Kaptan Sefer Takviyesi",
        "icon": "💵",
        "tier": 1,
        "cash": 1150,
        "xp": 115,
        "treasury": 2350,
        "fuel": 18,
        "hgs": 30,
        "desc": "+1.150 ₺ cüzdan harcırahı, +115 XP, +2.350 ₺ şirket kasası, +18 L mazot ve +30 ₺ HGS gişe bakiyesi.",
        "isMilestone": false
    },
    {
        "day": 9,
        "title": "9. Gün Kaptan Sefer Takviyesi",
        "icon": "🛣️",
        "tier": 1,
        "cash": 1300,
        "xp": 130,
        "treasury": 2700,
        "fuel": 18,
        "hgs": 30,
        "desc": "+1.300 ₺ cüzdan harcırahı, +130 XP, +2.700 ₺ şirket kasası, +18 L mazot ve +30 ₺ HGS gişe bakiyesi.",
        "isMilestone": false
    },
    {
        "day": 10,
        "title": "10. Gün Kaptan Sefer Takviyesi",
        "icon": "⛽",
        "tier": 1,
        "cash": 1450,
        "xp": 145,
        "treasury": 3050,
        "fuel": 18,
        "hgs": 30,
        "desc": "+1.450 ₺ cüzdan harcırahı, +145 XP, +3.050 ₺ şirket kasası, +18 L mazot ve +30 ₺ HGS gişe bakiyesi.",
        "isMilestone": false
    },
    {
        "day": 11,
        "title": "11. Gün Kaptan Sefer Takviyesi",
        "icon": "🛣️",
        "tier": 1,
        "cash": 1600,
        "xp": 160,
        "treasury": 3400,
        "fuel": 18,
        "hgs": 30,
        "desc": "+1.600 ₺ cüzdan harcırahı, +160 XP, +3.400 ₺ şirket kasası, +18 L mazot ve +30 ₺ HGS gişe bakiyesi.",
        "isMilestone": false
    },
    {
        "day": 12,
        "title": "12. Gün Kaptan Sefer Takviyesi",
        "icon": "💵",
        "tier": 1,
        "cash": 1750,
        "xp": 175,
        "treasury": 3750,
        "fuel": 18,
        "hgs": 30,
        "desc": "+1.750 ₺ cüzdan harcırahı, +175 XP, +3.750 ₺ şirket kasası, +18 L mazot ve +30 ₺ HGS gişe bakiyesi.",
        "isMilestone": false
    },
    {
        "day": 13,
        "title": "13. Gün Kaptan Sefer Takviyesi",
        "icon": "🛣️",
        "tier": 1,
        "cash": 1900,
        "xp": 190,
        "treasury": 4100,
        "fuel": 18,
        "hgs": 30,
        "desc": "+1.900 ₺ cüzdan harcırahı, +190 XP, +4.100 ₺ şirket kasası, +18 L mazot ve +30 ₺ HGS gişe bakiyesi.",
        "isMilestone": false
    },
    {
        "day": 14,
        "title": "14. Gün (2. Hafta): Bölge Kaptanı Teşviği",
        "icon": "🎖️",
        "tier": 1,
        "cash": 6000,
        "xp": 500,
        "treasury": 12500,
        "fuel": 40,
        "hgs": 150,
        "desc": "İki haftalık istikrar primi: +6.000 ₺ cüzdan, +500 XP, +12.500 ₺ kasa, +40 L mazot ve +150 ₺ HGS.",
        "isMilestone": true
    },
    {
        "day": 15,
        "title": "15. Gün Kaptan Sefer Takviyesi",
        "icon": "⛽",
        "tier": 1,
        "cash": 2250,
        "xp": 200,
        "treasury": 4500,
        "fuel": 20,
        "hgs": 40,
        "desc": "+2.250 ₺ cüzdan harcırahı, +200 XP, +4.500 ₺ şirket kasası, +20 L mazot ve +40 ₺ HGS gişe bakiyesi.",
        "isMilestone": false
    },
    {
        "day": 16,
        "title": "16. Gün Kaptan Sefer Takviyesi",
        "icon": "💵",
        "tier": 1,
        "cash": 2500,
        "xp": 220,
        "treasury": 5000,
        "fuel": 20,
        "hgs": 40,
        "desc": "+2.500 ₺ cüzdan harcırahı, +220 XP, +5.000 ₺ şirket kasası, +20 L mazot ve +40 ₺ HGS gişe bakiyesi.",
        "isMilestone": false
    },
    {
        "day": 17,
        "title": "17. Gün Kaptan Sefer Takviyesi",
        "icon": "🛣️",
        "tier": 1,
        "cash": 2750,
        "xp": 240,
        "treasury": 5500,
        "fuel": 20,
        "hgs": 40,
        "desc": "+2.750 ₺ cüzdan harcırahı, +240 XP, +5.500 ₺ şirket kasası, +20 L mazot ve +40 ₺ HGS gişe bakiyesi.",
        "isMilestone": false
    },
    {
        "day": 18,
        "title": "18. Gün Kaptan Sefer Takviyesi",
        "icon": "💵",
        "tier": 1,
        "cash": 3000,
        "xp": 260,
        "treasury": 6000,
        "fuel": 20,
        "hgs": 40,
        "desc": "+3.000 ₺ cüzdan harcırahı, +260 XP, +6.000 ₺ şirket kasası, +20 L mazot ve +40 ₺ HGS gişe bakiyesi.",
        "isMilestone": false
    },
    {
        "day": 19,
        "title": "19. Gün Kaptan Sefer Takviyesi",
        "icon": "🛣️",
        "tier": 1,
        "cash": 3250,
        "xp": 280,
        "treasury": 6500,
        "fuel": 20,
        "hgs": 40,
        "desc": "+3.250 ₺ cüzdan harcırahı, +280 XP, +6.500 ₺ şirket kasası, +20 L mazot ve +40 ₺ HGS gişe bakiyesi.",
        "isMilestone": false
    },
    {
        "day": 20,
        "title": "20. Gün Kaptan Sefer Takviyesi",
        "icon": "⛽",
        "tier": 1,
        "cash": 3500,
        "xp": 300,
        "treasury": 7000,
        "fuel": 20,
        "hgs": 40,
        "desc": "+3.500 ₺ cüzdan harcırahı, +300 XP, +7.000 ₺ şirket kasası, +20 L mazot ve +40 ₺ HGS gişe bakiyesi.",
        "isMilestone": false
    },
    {
        "day": 21,
        "title": "21. Gün (3. Hafta): Sefer Maratonu Kutusu",
        "icon": "🏆",
        "tier": 2,
        "cash": 10000,
        "xp": 800,
        "treasury": 20000,
        "fuel": 50,
        "hgs": 200,
        "desc": "Üç haftalık kıdem primi: +10.000 ₺ cüzdan, +800 XP, +20.000 ₺ kasa, +50 L mazot ve +200 ₺ HGS.",
        "isMilestone": true
    },
    {
        "day": 22,
        "title": "22. Gün Kaptan Sefer Takviyesi",
        "icon": "💵",
        "tier": 2,
        "cash": 3850,
        "xp": 330,
        "treasury": 7800,
        "fuel": 25,
        "hgs": 50,
        "desc": "+3.850 ₺ cüzdan harcırahı, +330 XP, +7.800 ₺ şirket kasası, +25 L mazot ve +50 ₺ HGS gişe bakiyesi.",
        "isMilestone": false
    },
    {
        "day": 23,
        "title": "23. Gün Kaptan Sefer Takviyesi",
        "icon": "🛣️",
        "tier": 2,
        "cash": 4200,
        "xp": 360,
        "treasury": 8600,
        "fuel": 25,
        "hgs": 50,
        "desc": "+4.200 ₺ cüzdan harcırahı, +360 XP, +8.600 ₺ şirket kasası, +25 L mazot ve +50 ₺ HGS gişe bakiyesi.",
        "isMilestone": false
    },
    {
        "day": 24,
        "title": "24. Gün Kaptan Sefer Takviyesi",
        "icon": "💵",
        "tier": 2,
        "cash": 4550,
        "xp": 390,
        "treasury": 9400,
        "fuel": 25,
        "hgs": 50,
        "desc": "+4.550 ₺ cüzdan harcırahı, +390 XP, +9.400 ₺ şirket kasası, +25 L mazot ve +50 ₺ HGS gişe bakiyesi.",
        "isMilestone": false
    },
    {
        "day": 25,
        "title": "25. Gün Kaptan Sefer Takviyesi",
        "icon": "⛽",
        "tier": 2,
        "cash": 4900,
        "xp": 420,
        "treasury": 10200,
        "fuel": 25,
        "hgs": 50,
        "desc": "+4.900 ₺ cüzdan harcırahı, +420 XP, +10.200 ₺ şirket kasası, +25 L mazot ve +50 ₺ HGS gişe bakiyesi.",
        "isMilestone": false
    },
    {
        "day": 26,
        "title": "26. Gün Kaptan Sefer Takviyesi",
        "icon": "💵",
        "tier": 2,
        "cash": 5250,
        "xp": 450,
        "treasury": 11000,
        "fuel": 25,
        "hgs": 50,
        "desc": "+5.250 ₺ cüzdan harcırahı, +450 XP, +11.000 ₺ şirket kasası, +25 L mazot ve +50 ₺ HGS gişe bakiyesi.",
        "isMilestone": false
    },
    {
        "day": 27,
        "title": "27. Gün Kaptan Sefer Takviyesi",
        "icon": "🛣️",
        "tier": 2,
        "cash": 5600,
        "xp": 480,
        "treasury": 11800,
        "fuel": 25,
        "hgs": 50,
        "desc": "+5.600 ₺ cüzdan harcırahı, +480 XP, +11.800 ₺ şirket kasası, +25 L mazot ve +50 ₺ HGS gişe bakiyesi.",
        "isMilestone": false
    },
    {
        "day": 28,
        "title": "28. Gün Kaptan Sefer Takviyesi",
        "icon": "💵",
        "tier": 2,
        "cash": 5950,
        "xp": 510,
        "treasury": 12600,
        "fuel": 25,
        "hgs": 50,
        "desc": "+5.950 ₺ cüzdan harcırahı, +510 XP, +12.600 ₺ şirket kasası, +25 L mazot ve +50 ₺ HGS gişe bakiyesi.",
        "isMilestone": false
    },
    {
        "day": 29,
        "title": "29. Gün Kaptan Sefer Takviyesi",
        "icon": "🛣️",
        "tier": 2,
        "cash": 6300,
        "xp": 540,
        "treasury": 13400,
        "fuel": 25,
        "hgs": 50,
        "desc": "+6.300 ₺ cüzdan harcırahı, +540 XP, +13.400 ₺ şirket kasası, +25 L mazot ve +50 ₺ HGS gişe bakiyesi.",
        "isMilestone": false
    },
    {
        "day": 30,
        "title": "30. Gün (1. Ay): Usta Kaptan Ay Dönümü Sandığı",
        "icon": "🌟",
        "tier": 2,
        "cash": 20000,
        "xp": 1500,
        "treasury": 40000,
        "fuel": 60,
        "hgs": 250,
        "desc": "İlk ayını deviren kaptana: +20.000 ₺ cüzdan, +1.500 XP, +40.000 ₺ kasa, +60 L mazot ve +250 ₺ HGS.",
        "isMilestone": true
    },
    {
        "day": 31,
        "title": "31. Gün Kaptan Sefer Takviyesi",
        "icon": "🛣️",
        "tier": 2,
        "cash": 7450,
        "xp": 540,
        "treasury": 14900,
        "fuel": 30,
        "hgs": 65,
        "desc": "+7.450 ₺ cüzdan harcırahı, +540 XP, +14.900 ₺ şirket kasası, +30 L mazot ve +65 ₺ HGS gişe bakiyesi.",
        "isMilestone": false
    },
    {
        "day": 32,
        "title": "32. Gün Kaptan Sefer Takviyesi",
        "icon": "💵",
        "tier": 2,
        "cash": 7900,
        "xp": 580,
        "treasury": 15800,
        "fuel": 30,
        "hgs": 65,
        "desc": "+7.900 ₺ cüzdan harcırahı, +580 XP, +15.800 ₺ şirket kasası, +30 L mazot ve +65 ₺ HGS gişe bakiyesi.",
        "isMilestone": false
    },
    {
        "day": 33,
        "title": "33. Gün Kaptan Sefer Takviyesi",
        "icon": "🛣️",
        "tier": 2,
        "cash": 8350,
        "xp": 620,
        "treasury": 16700,
        "fuel": 30,
        "hgs": 65,
        "desc": "+8.350 ₺ cüzdan harcırahı, +620 XP, +16.700 ₺ şirket kasası, +30 L mazot ve +65 ₺ HGS gişe bakiyesi.",
        "isMilestone": false
    },
    {
        "day": 34,
        "title": "34. Gün Kaptan Sefer Takviyesi",
        "icon": "💵",
        "tier": 2,
        "cash": 8800,
        "xp": 660,
        "treasury": 17600,
        "fuel": 30,
        "hgs": 65,
        "desc": "+8.800 ₺ cüzdan harcırahı, +660 XP, +17.600 ₺ şirket kasası, +30 L mazot ve +65 ₺ HGS gişe bakiyesi.",
        "isMilestone": false
    },
    {
        "day": 35,
        "title": "35. Gün Kaptan Sefer Takviyesi",
        "icon": "⛽",
        "tier": 2,
        "cash": 9250,
        "xp": 700,
        "treasury": 18500,
        "fuel": 30,
        "hgs": 65,
        "desc": "+9.250 ₺ cüzdan harcırahı, +700 XP, +18.500 ₺ şirket kasası, +30 L mazot ve +65 ₺ HGS gişe bakiyesi.",
        "isMilestone": false
    },
    {
        "day": 36,
        "title": "36. Gün Kaptan Sefer Takviyesi",
        "icon": "💵",
        "tier": 2,
        "cash": 9700,
        "xp": 740,
        "treasury": 19400,
        "fuel": 30,
        "hgs": 65,
        "desc": "+9.700 ₺ cüzdan harcırahı, +740 XP, +19.400 ₺ şirket kasası, +30 L mazot ve +65 ₺ HGS gişe bakiyesi.",
        "isMilestone": false
    },
    {
        "day": 37,
        "title": "37. Gün Kaptan Sefer Takviyesi",
        "icon": "🛣️",
        "tier": 2,
        "cash": 10150,
        "xp": 780,
        "treasury": 20300,
        "fuel": 30,
        "hgs": 65,
        "desc": "+10.150 ₺ cüzdan harcırahı, +780 XP, +20.300 ₺ şirket kasası, +30 L mazot ve +65 ₺ HGS gişe bakiyesi.",
        "isMilestone": false
    },
    {
        "day": 38,
        "title": "38. Gün Kaptan Sefer Takviyesi",
        "icon": "💵",
        "tier": 2,
        "cash": 10600,
        "xp": 820,
        "treasury": 21200,
        "fuel": 30,
        "hgs": 65,
        "desc": "+10.600 ₺ cüzdan harcırahı, +820 XP, +21.200 ₺ şirket kasası, +30 L mazot ve +65 ₺ HGS gişe bakiyesi.",
        "isMilestone": false
    },
    {
        "day": 39,
        "title": "39. Gün Kaptan Sefer Takviyesi",
        "icon": "🛣️",
        "tier": 2,
        "cash": 11050,
        "xp": 860,
        "treasury": 22100,
        "fuel": 30,
        "hgs": 65,
        "desc": "+11.050 ₺ cüzdan harcırahı, +860 XP, +22.100 ₺ şirket kasası, +30 L mazot ve +65 ₺ HGS gişe bakiyesi.",
        "isMilestone": false
    },
    {
        "day": 40,
        "title": "40. Gün Kaptan Sefer Takviyesi",
        "icon": "⛽",
        "tier": 2,
        "cash": 11500,
        "xp": 900,
        "treasury": 23000,
        "fuel": 30,
        "hgs": 65,
        "desc": "+11.500 ₺ cüzdan harcırahı, +900 XP, +23.000 ₺ şirket kasası, +30 L mazot ve +65 ₺ HGS gişe bakiyesi.",
        "isMilestone": false
    },
    {
        "day": 41,
        "title": "41. Gün Kaptan Sefer Takviyesi",
        "icon": "🛣️",
        "tier": 3,
        "cash": 11950,
        "xp": 940,
        "treasury": 23900,
        "fuel": 30,
        "hgs": 65,
        "desc": "+11.950 ₺ cüzdan harcırahı, +940 XP, +23.900 ₺ şirket kasası, +30 L mazot ve +65 ₺ HGS gişe bakiyesi.",
        "isMilestone": false
    },
    {
        "day": 42,
        "title": "42. Gün Kaptan Sefer Takviyesi",
        "icon": "💵",
        "tier": 3,
        "cash": 12400,
        "xp": 980,
        "treasury": 24800,
        "fuel": 30,
        "hgs": 65,
        "desc": "+12.400 ₺ cüzdan harcırahı, +980 XP, +24.800 ₺ şirket kasası, +30 L mazot ve +65 ₺ HGS gişe bakiyesi.",
        "isMilestone": false
    },
    {
        "day": 43,
        "title": "43. Gün Kaptan Sefer Takviyesi",
        "icon": "🛣️",
        "tier": 3,
        "cash": 12850,
        "xp": 1020,
        "treasury": 25700,
        "fuel": 30,
        "hgs": 65,
        "desc": "+12.850 ₺ cüzdan harcırahı, +1020 XP, +25.700 ₺ şirket kasası, +30 L mazot ve +65 ₺ HGS gişe bakiyesi.",
        "isMilestone": false
    },
    {
        "day": 44,
        "title": "44. Gün Kaptan Sefer Takviyesi",
        "icon": "💵",
        "tier": 3,
        "cash": 13300,
        "xp": 1060,
        "treasury": 26600,
        "fuel": 30,
        "hgs": 65,
        "desc": "+13.300 ₺ cüzdan harcırahı, +1060 XP, +26.600 ₺ şirket kasası, +30 L mazot ve +65 ₺ HGS gişe bakiyesi.",
        "isMilestone": false
    },
    {
        "day": 45,
        "title": "45. Gün Kaptan Sefer Takviyesi",
        "icon": "⛽",
        "tier": 3,
        "cash": 13750,
        "xp": 1100,
        "treasury": 27500,
        "fuel": 30,
        "hgs": 65,
        "desc": "+13.750 ₺ cüzdan harcırahı, +1100 XP, +27.500 ₺ şirket kasası, +30 L mazot ve +65 ₺ HGS gişe bakiyesi.",
        "isMilestone": false
    },
    {
        "day": 46,
        "title": "46. Gün Kaptan Sefer Takviyesi",
        "icon": "💵",
        "tier": 3,
        "cash": 14200,
        "xp": 1140,
        "treasury": 28400,
        "fuel": 30,
        "hgs": 65,
        "desc": "+14.200 ₺ cüzdan harcırahı, +1140 XP, +28.400 ₺ şirket kasası, +30 L mazot ve +65 ₺ HGS gişe bakiyesi.",
        "isMilestone": false
    },
    {
        "day": 47,
        "title": "47. Gün Kaptan Sefer Takviyesi",
        "icon": "🛣️",
        "tier": 3,
        "cash": 14650,
        "xp": 1180,
        "treasury": 29300,
        "fuel": 30,
        "hgs": 65,
        "desc": "+14.650 ₺ cüzdan harcırahı, +1180 XP, +29.300 ₺ şirket kasası, +30 L mazot ve +65 ₺ HGS gişe bakiyesi.",
        "isMilestone": false
    },
    {
        "day": 48,
        "title": "48. Gün Kaptan Sefer Takviyesi",
        "icon": "💵",
        "tier": 3,
        "cash": 15100,
        "xp": 1220,
        "treasury": 30200,
        "fuel": 30,
        "hgs": 65,
        "desc": "+15.100 ₺ cüzdan harcırahı, +1220 XP, +30.200 ₺ şirket kasası, +30 L mazot ve +65 ₺ HGS gişe bakiyesi.",
        "isMilestone": false
    },
    {
        "day": 49,
        "title": "49. Gün Kaptan Sefer Takviyesi",
        "icon": "🛣️",
        "tier": 3,
        "cash": 15550,
        "xp": 1260,
        "treasury": 31100,
        "fuel": 30,
        "hgs": 65,
        "desc": "+15.550 ₺ cüzdan harcırahı, +1260 XP, +31.100 ₺ şirket kasası, +30 L mazot ve +65 ₺ HGS gişe bakiyesi.",
        "isMilestone": false
    },
    {
        "day": 50,
        "title": "50. Gün (Yarım Asır): Filo Sadakat Ödülü",
        "icon": "💎",
        "tier": 3,
        "cash": 45000,
        "xp": 3000,
        "treasury": 90000,
        "fuel": 80,
        "hgs": 400,
        "desc": "50 günlük yol arkadaşlığına: +45.000 ₺ cüzdan, +3.000 XP, +90.000 ₺ kasa, +80 L mazot ve +400 ₺ HGS.",
        "isMilestone": true
    },
    {
        "day": 51,
        "title": "51. Gün Kaptan Sefer Takviyesi",
        "icon": "🛣️",
        "tier": 3,
        "cash": 16650,
        "xp": 1260,
        "treasury": 33200,
        "fuel": 35,
        "hgs": 80,
        "desc": "+16.650 ₺ cüzdan harcırahı, +1260 XP, +33.200 ₺ şirket kasası, +35 L mazot ve +80 ₺ HGS gişe bakiyesi.",
        "isMilestone": false
    },
    {
        "day": 52,
        "title": "52. Gün Kaptan Sefer Takviyesi",
        "icon": "💵",
        "tier": 3,
        "cash": 17300,
        "xp": 1320,
        "treasury": 34400,
        "fuel": 35,
        "hgs": 80,
        "desc": "+17.300 ₺ cüzdan harcırahı, +1320 XP, +34.400 ₺ şirket kasası, +35 L mazot ve +80 ₺ HGS gişe bakiyesi.",
        "isMilestone": false
    },
    {
        "day": 53,
        "title": "53. Gün Kaptan Sefer Takviyesi",
        "icon": "🛣️",
        "tier": 3,
        "cash": 17950,
        "xp": 1380,
        "treasury": 35600,
        "fuel": 35,
        "hgs": 80,
        "desc": "+17.950 ₺ cüzdan harcırahı, +1380 XP, +35.600 ₺ şirket kasası, +35 L mazot ve +80 ₺ HGS gişe bakiyesi.",
        "isMilestone": false
    },
    {
        "day": 54,
        "title": "54. Gün Kaptan Sefer Takviyesi",
        "icon": "💵",
        "tier": 3,
        "cash": 18600,
        "xp": 1440,
        "treasury": 36800,
        "fuel": 35,
        "hgs": 80,
        "desc": "+18.600 ₺ cüzdan harcırahı, +1440 XP, +36.800 ₺ şirket kasası, +35 L mazot ve +80 ₺ HGS gişe bakiyesi.",
        "isMilestone": false
    },
    {
        "day": 55,
        "title": "55. Gün Kaptan Sefer Takviyesi",
        "icon": "⛽",
        "tier": 3,
        "cash": 19250,
        "xp": 1500,
        "treasury": 38000,
        "fuel": 35,
        "hgs": 80,
        "desc": "+19.250 ₺ cüzdan harcırahı, +1500 XP, +38.000 ₺ şirket kasası, +35 L mazot ve +80 ₺ HGS gişe bakiyesi.",
        "isMilestone": false
    },
    {
        "day": 56,
        "title": "56. Gün Kaptan Sefer Takviyesi",
        "icon": "💵",
        "tier": 3,
        "cash": 19900,
        "xp": 1560,
        "treasury": 39200,
        "fuel": 35,
        "hgs": 80,
        "desc": "+19.900 ₺ cüzdan harcırahı, +1560 XP, +39.200 ₺ şirket kasası, +35 L mazot ve +80 ₺ HGS gişe bakiyesi.",
        "isMilestone": false
    },
    {
        "day": 57,
        "title": "57. Gün Kaptan Sefer Takviyesi",
        "icon": "🛣️",
        "tier": 3,
        "cash": 20550,
        "xp": 1620,
        "treasury": 40400,
        "fuel": 35,
        "hgs": 80,
        "desc": "+20.550 ₺ cüzdan harcırahı, +1620 XP, +40.400 ₺ şirket kasası, +35 L mazot ve +80 ₺ HGS gişe bakiyesi.",
        "isMilestone": false
    },
    {
        "day": 58,
        "title": "58. Gün Kaptan Sefer Takviyesi",
        "icon": "💵",
        "tier": 3,
        "cash": 21200,
        "xp": 1680,
        "treasury": 41600,
        "fuel": 35,
        "hgs": 80,
        "desc": "+21.200 ₺ cüzdan harcırahı, +1680 XP, +41.600 ₺ şirket kasası, +35 L mazot ve +80 ₺ HGS gişe bakiyesi.",
        "isMilestone": false
    },
    {
        "day": 59,
        "title": "59. Gün Kaptan Sefer Takviyesi",
        "icon": "🛣️",
        "tier": 3,
        "cash": 21850,
        "xp": 1740,
        "treasury": 42800,
        "fuel": 35,
        "hgs": 80,
        "desc": "+21.850 ₺ cüzdan harcırahı, +1740 XP, +42.800 ₺ şirket kasası, +35 L mazot ve +80 ₺ HGS gişe bakiyesi.",
        "isMilestone": false
    },
    {
        "day": 60,
        "title": "60. Gün Kaptan Sefer Takviyesi",
        "icon": "⛽",
        "tier": 3,
        "cash": 22500,
        "xp": 1800,
        "treasury": 44000,
        "fuel": 35,
        "hgs": 80,
        "desc": "+22.500 ₺ cüzdan harcırahı, +1800 XP, +44.000 ₺ şirket kasası, +35 L mazot ve +80 ₺ HGS gişe bakiyesi.",
        "isMilestone": false
    },
    {
        "day": 61,
        "title": "61. Gün Kaptan Sefer Takviyesi",
        "icon": "🛣️",
        "tier": 4,
        "cash": 23150,
        "xp": 1860,
        "treasury": 45200,
        "fuel": 35,
        "hgs": 80,
        "desc": "+23.150 ₺ cüzdan harcırahı, +1860 XP, +45.200 ₺ şirket kasası, +35 L mazot ve +80 ₺ HGS gişe bakiyesi.",
        "isMilestone": false
    },
    {
        "day": 62,
        "title": "62. Gün Kaptan Sefer Takviyesi",
        "icon": "💵",
        "tier": 4,
        "cash": 23800,
        "xp": 1920,
        "treasury": 46400,
        "fuel": 35,
        "hgs": 80,
        "desc": "+23.800 ₺ cüzdan harcırahı, +1920 XP, +46.400 ₺ şirket kasası, +35 L mazot ve +80 ₺ HGS gişe bakiyesi.",
        "isMilestone": false
    },
    {
        "day": 63,
        "title": "63. Gün Kaptan Sefer Takviyesi",
        "icon": "🛣️",
        "tier": 4,
        "cash": 24450,
        "xp": 1980,
        "treasury": 47600,
        "fuel": 35,
        "hgs": 80,
        "desc": "+24.450 ₺ cüzdan harcırahı, +1980 XP, +47.600 ₺ şirket kasası, +35 L mazot ve +80 ₺ HGS gişe bakiyesi.",
        "isMilestone": false
    },
    {
        "day": 64,
        "title": "64. Gün Kaptan Sefer Takviyesi",
        "icon": "💵",
        "tier": 4,
        "cash": 25100,
        "xp": 2040,
        "treasury": 48800,
        "fuel": 35,
        "hgs": 80,
        "desc": "+25.100 ₺ cüzdan harcırahı, +2040 XP, +48.800 ₺ şirket kasası, +35 L mazot ve +80 ₺ HGS gişe bakiyesi.",
        "isMilestone": false
    },
    {
        "day": 65,
        "title": "65. Gün Kaptan Sefer Takviyesi",
        "icon": "⛽",
        "tier": 4,
        "cash": 25750,
        "xp": 2100,
        "treasury": 50000,
        "fuel": 35,
        "hgs": 80,
        "desc": "+25.750 ₺ cüzdan harcırahı, +2100 XP, +50.000 ₺ şirket kasası, +35 L mazot ve +80 ₺ HGS gişe bakiyesi.",
        "isMilestone": false
    },
    {
        "day": 66,
        "title": "66. Gün Kaptan Sefer Takviyesi",
        "icon": "💵",
        "tier": 4,
        "cash": 26400,
        "xp": 2160,
        "treasury": 51200,
        "fuel": 35,
        "hgs": 80,
        "desc": "+26.400 ₺ cüzdan harcırahı, +2160 XP, +51.200 ₺ şirket kasası, +35 L mazot ve +80 ₺ HGS gişe bakiyesi.",
        "isMilestone": false
    },
    {
        "day": 67,
        "title": "67. Gün Kaptan Sefer Takviyesi",
        "icon": "🛣️",
        "tier": 4,
        "cash": 27050,
        "xp": 2220,
        "treasury": 52400,
        "fuel": 35,
        "hgs": 80,
        "desc": "+27.050 ₺ cüzdan harcırahı, +2220 XP, +52.400 ₺ şirket kasası, +35 L mazot ve +80 ₺ HGS gişe bakiyesi.",
        "isMilestone": false
    },
    {
        "day": 68,
        "title": "68. Gün Kaptan Sefer Takviyesi",
        "icon": "💵",
        "tier": 4,
        "cash": 27700,
        "xp": 2280,
        "treasury": 53600,
        "fuel": 35,
        "hgs": 80,
        "desc": "+27.700 ₺ cüzdan harcırahı, +2280 XP, +53.600 ₺ şirket kasası, +35 L mazot ve +80 ₺ HGS gişe bakiyesi.",
        "isMilestone": false
    },
    {
        "day": 69,
        "title": "69. Gün Kaptan Sefer Takviyesi",
        "icon": "🛣️",
        "tier": 4,
        "cash": 28350,
        "xp": 2340,
        "treasury": 54800,
        "fuel": 35,
        "hgs": 80,
        "desc": "+28.350 ₺ cüzdan harcırahı, +2340 XP, +54.800 ₺ şirket kasası, +35 L mazot ve +80 ₺ HGS gişe bakiyesi.",
        "isMilestone": false
    },
    {
        "day": 70,
        "title": "70. Gün Kaptan Sefer Takviyesi",
        "icon": "⛽",
        "tier": 4,
        "cash": 29000,
        "xp": 2400,
        "treasury": 56000,
        "fuel": 35,
        "hgs": 80,
        "desc": "+29.000 ₺ cüzdan harcırahı, +2400 XP, +56.000 ₺ şirket kasası, +35 L mazot ve +80 ₺ HGS gişe bakiyesi.",
        "isMilestone": false
    },
    {
        "day": 71,
        "title": "71. Gün Kaptan Sefer Takviyesi",
        "icon": "🛣️",
        "tier": 4,
        "cash": 29650,
        "xp": 2460,
        "treasury": 57200,
        "fuel": 35,
        "hgs": 80,
        "desc": "+29.650 ₺ cüzdan harcırahı, +2460 XP, +57.200 ₺ şirket kasası, +35 L mazot ve +80 ₺ HGS gişe bakiyesi.",
        "isMilestone": false
    },
    {
        "day": 72,
        "title": "72. Gün Kaptan Sefer Takviyesi",
        "icon": "💵",
        "tier": 4,
        "cash": 30300,
        "xp": 2520,
        "treasury": 58400,
        "fuel": 35,
        "hgs": 80,
        "desc": "+30.300 ₺ cüzdan harcırahı, +2520 XP, +58.400 ₺ şirket kasası, +35 L mazot ve +80 ₺ HGS gişe bakiyesi.",
        "isMilestone": false
    },
    {
        "day": 73,
        "title": "73. Gün Kaptan Sefer Takviyesi",
        "icon": "🛣️",
        "tier": 4,
        "cash": 30950,
        "xp": 2580,
        "treasury": 59600,
        "fuel": 35,
        "hgs": 80,
        "desc": "+30.950 ₺ cüzdan harcırahı, +2580 XP, +59.600 ₺ şirket kasası, +35 L mazot ve +80 ₺ HGS gişe bakiyesi.",
        "isMilestone": false
    },
    {
        "day": 74,
        "title": "74. Gün Kaptan Sefer Takviyesi",
        "icon": "💵",
        "tier": 4,
        "cash": 31600,
        "xp": 2640,
        "treasury": 60800,
        "fuel": 35,
        "hgs": 80,
        "desc": "+31.600 ₺ cüzdan harcırahı, +2640 XP, +60.800 ₺ şirket kasası, +35 L mazot ve +80 ₺ HGS gişe bakiyesi.",
        "isMilestone": false
    },
    {
        "day": 75,
        "title": "75. Gün: Şehirlerarası Hat Kıdemi",
        "icon": "🔥",
        "tier": 4,
        "cash": 80000,
        "xp": 5000,
        "treasury": 160000,
        "fuel": 100,
        "hgs": 600,
        "desc": "Yolların tecrübeli ustasına: +80.000 ₺ cüzdan, +5.000 XP, +160.000 ₺ kasa, +100 L mazot ve +600 ₺ HGS.",
        "isMilestone": true
    },
    {
        "day": 76,
        "title": "76. Gün Kaptan Sefer Takviyesi",
        "icon": "💵",
        "tier": 4,
        "cash": 33200,
        "xp": 2600,
        "treasury": 67500,
        "fuel": 40,
        "hgs": 100,
        "desc": "+33.200 ₺ cüzdan harcırahı, +2600 XP, +67.500 ₺ şirket kasası, +40 L mazot ve +100 ₺ HGS gişe bakiyesi.",
        "isMilestone": false
    },
    {
        "day": 77,
        "title": "77. Gün Kaptan Sefer Takviyesi",
        "icon": "🛣️",
        "tier": 4,
        "cash": 34400,
        "xp": 2700,
        "treasury": 70000,
        "fuel": 40,
        "hgs": 100,
        "desc": "+34.400 ₺ cüzdan harcırahı, +2700 XP, +70.000 ₺ şirket kasası, +40 L mazot ve +100 ₺ HGS gişe bakiyesi.",
        "isMilestone": false
    },
    {
        "day": 78,
        "title": "78. Gün Kaptan Sefer Takviyesi",
        "icon": "💵",
        "tier": 4,
        "cash": 35600,
        "xp": 2800,
        "treasury": 72500,
        "fuel": 40,
        "hgs": 100,
        "desc": "+35.600 ₺ cüzdan harcırahı, +2800 XP, +72.500 ₺ şirket kasası, +40 L mazot ve +100 ₺ HGS gişe bakiyesi.",
        "isMilestone": false
    },
    {
        "day": 79,
        "title": "79. Gün Kaptan Sefer Takviyesi",
        "icon": "🛣️",
        "tier": 4,
        "cash": 36800,
        "xp": 2900,
        "treasury": 75000,
        "fuel": 40,
        "hgs": 100,
        "desc": "+36.800 ₺ cüzdan harcırahı, +2900 XP, +75.000 ₺ şirket kasası, +40 L mazot ve +100 ₺ HGS gişe bakiyesi.",
        "isMilestone": false
    },
    {
        "day": 80,
        "title": "80. Gün Kaptan Sefer Takviyesi",
        "icon": "⛽",
        "tier": 4,
        "cash": 38000,
        "xp": 3000,
        "treasury": 77500,
        "fuel": 40,
        "hgs": 100,
        "desc": "+38.000 ₺ cüzdan harcırahı, +3000 XP, +77.500 ₺ şirket kasası, +40 L mazot ve +100 ₺ HGS gişe bakiyesi.",
        "isMilestone": false
    },
    {
        "day": 81,
        "title": "81. Gün Kaptan Sefer Takviyesi",
        "icon": "🛣️",
        "tier": 5,
        "cash": 39200,
        "xp": 3100,
        "treasury": 80000,
        "fuel": 40,
        "hgs": 100,
        "desc": "+39.200 ₺ cüzdan harcırahı, +3100 XP, +80.000 ₺ şirket kasası, +40 L mazot ve +100 ₺ HGS gişe bakiyesi.",
        "isMilestone": false
    },
    {
        "day": 82,
        "title": "82. Gün Kaptan Sefer Takviyesi",
        "icon": "💵",
        "tier": 5,
        "cash": 40400,
        "xp": 3200,
        "treasury": 82500,
        "fuel": 40,
        "hgs": 100,
        "desc": "+40.400 ₺ cüzdan harcırahı, +3200 XP, +82.500 ₺ şirket kasası, +40 L mazot ve +100 ₺ HGS gişe bakiyesi.",
        "isMilestone": false
    },
    {
        "day": 83,
        "title": "83. Gün Kaptan Sefer Takviyesi",
        "icon": "🛣️",
        "tier": 5,
        "cash": 41600,
        "xp": 3300,
        "treasury": 85000,
        "fuel": 40,
        "hgs": 100,
        "desc": "+41.600 ₺ cüzdan harcırahı, +3300 XP, +85.000 ₺ şirket kasası, +40 L mazot ve +100 ₺ HGS gişe bakiyesi.",
        "isMilestone": false
    },
    {
        "day": 84,
        "title": "84. Gün Kaptan Sefer Takviyesi",
        "icon": "💵",
        "tier": 5,
        "cash": 42800,
        "xp": 3400,
        "treasury": 87500,
        "fuel": 40,
        "hgs": 100,
        "desc": "+42.800 ₺ cüzdan harcırahı, +3400 XP, +87.500 ₺ şirket kasası, +40 L mazot ve +100 ₺ HGS gişe bakiyesi.",
        "isMilestone": false
    },
    {
        "day": 85,
        "title": "85. Gün Kaptan Sefer Takviyesi",
        "icon": "⛽",
        "tier": 5,
        "cash": 44000,
        "xp": 3500,
        "treasury": 90000,
        "fuel": 40,
        "hgs": 100,
        "desc": "+44.000 ₺ cüzdan harcırahı, +3500 XP, +90.000 ₺ şirket kasası, +40 L mazot ve +100 ₺ HGS gişe bakiyesi.",
        "isMilestone": false
    },
    {
        "day": 86,
        "title": "86. Gün Kaptan Sefer Takviyesi",
        "icon": "💵",
        "tier": 5,
        "cash": 45200,
        "xp": 3600,
        "treasury": 92500,
        "fuel": 40,
        "hgs": 100,
        "desc": "+45.200 ₺ cüzdan harcırahı, +3600 XP, +92.500 ₺ şirket kasası, +40 L mazot ve +100 ₺ HGS gişe bakiyesi.",
        "isMilestone": false
    },
    {
        "day": 87,
        "title": "87. Gün Kaptan Sefer Takviyesi",
        "icon": "🛣️",
        "tier": 5,
        "cash": 46400,
        "xp": 3700,
        "treasury": 95000,
        "fuel": 40,
        "hgs": 100,
        "desc": "+46.400 ₺ cüzdan harcırahı, +3700 XP, +95.000 ₺ şirket kasası, +40 L mazot ve +100 ₺ HGS gişe bakiyesi.",
        "isMilestone": false
    },
    {
        "day": 88,
        "title": "88. Gün Kaptan Sefer Takviyesi",
        "icon": "💵",
        "tier": 5,
        "cash": 47600,
        "xp": 3800,
        "treasury": 97500,
        "fuel": 40,
        "hgs": 100,
        "desc": "+47.600 ₺ cüzdan harcırahı, +3800 XP, +97.500 ₺ şirket kasası, +40 L mazot ve +100 ₺ HGS gişe bakiyesi.",
        "isMilestone": false
    },
    {
        "day": 89,
        "title": "89. Gün Kaptan Sefer Takviyesi",
        "icon": "🛣️",
        "tier": 5,
        "cash": 48800,
        "xp": 3900,
        "treasury": 100000,
        "fuel": 40,
        "hgs": 100,
        "desc": "+48.800 ₺ cüzdan harcırahı, +3900 XP, +100.000 ₺ şirket kasası, +40 L mazot ve +100 ₺ HGS gişe bakiyesi.",
        "isMilestone": false
    },
    {
        "day": 90,
        "title": "90. Gün Kaptan Sefer Takviyesi",
        "icon": "⛽",
        "tier": 5,
        "cash": 50000,
        "xp": 4000,
        "treasury": 102500,
        "fuel": 40,
        "hgs": 100,
        "desc": "+50.000 ₺ cüzdan harcırahı, +4000 XP, +102.500 ₺ şirket kasası, +40 L mazot ve +100 ₺ HGS gişe bakiyesi.",
        "isMilestone": false
    },
    {
        "day": 91,
        "title": "91. Gün Kaptan Sefer Takviyesi",
        "icon": "🛣️",
        "tier": 5,
        "cash": 51200,
        "xp": 4100,
        "treasury": 105000,
        "fuel": 40,
        "hgs": 100,
        "desc": "+51.200 ₺ cüzdan harcırahı, +4100 XP, +105.000 ₺ şirket kasası, +40 L mazot ve +100 ₺ HGS gişe bakiyesi.",
        "isMilestone": false
    },
    {
        "day": 92,
        "title": "92. Gün Kaptan Sefer Takviyesi",
        "icon": "💵",
        "tier": 5,
        "cash": 52400,
        "xp": 4200,
        "treasury": 107500,
        "fuel": 40,
        "hgs": 100,
        "desc": "+52.400 ₺ cüzdan harcırahı, +4200 XP, +107.500 ₺ şirket kasası, +40 L mazot ve +100 ₺ HGS gişe bakiyesi.",
        "isMilestone": false
    },
    {
        "day": 93,
        "title": "93. Gün Kaptan Sefer Takviyesi",
        "icon": "🛣️",
        "tier": 5,
        "cash": 53600,
        "xp": 4300,
        "treasury": 110000,
        "fuel": 40,
        "hgs": 100,
        "desc": "+53.600 ₺ cüzdan harcırahı, +4300 XP, +110.000 ₺ şirket kasası, +40 L mazot ve +100 ₺ HGS gişe bakiyesi.",
        "isMilestone": false
    },
    {
        "day": 94,
        "title": "94. Gün Kaptan Sefer Takviyesi",
        "icon": "💵",
        "tier": 5,
        "cash": 54800,
        "xp": 4400,
        "treasury": 112500,
        "fuel": 40,
        "hgs": 100,
        "desc": "+54.800 ₺ cüzdan harcırahı, +4400 XP, +112.500 ₺ şirket kasası, +40 L mazot ve +100 ₺ HGS gişe bakiyesi.",
        "isMilestone": false
    },
    {
        "day": 95,
        "title": "95. Gün Kaptan Sefer Takviyesi",
        "icon": "⛽",
        "tier": 5,
        "cash": 56000,
        "xp": 4500,
        "treasury": 115000,
        "fuel": 40,
        "hgs": 100,
        "desc": "+56.000 ₺ cüzdan harcırahı, +4500 XP, +115.000 ₺ şirket kasası, +40 L mazot ve +100 ₺ HGS gişe bakiyesi.",
        "isMilestone": false
    },
    {
        "day": 96,
        "title": "96. Gün Kaptan Sefer Takviyesi",
        "icon": "💵",
        "tier": 5,
        "cash": 57200,
        "xp": 4600,
        "treasury": 117500,
        "fuel": 40,
        "hgs": 100,
        "desc": "+57.200 ₺ cüzdan harcırahı, +4600 XP, +117.500 ₺ şirket kasası, +40 L mazot ve +100 ₺ HGS gişe bakiyesi.",
        "isMilestone": false
    },
    {
        "day": 97,
        "title": "97. Gün Kaptan Sefer Takviyesi",
        "icon": "🛣️",
        "tier": 5,
        "cash": 58400,
        "xp": 4700,
        "treasury": 120000,
        "fuel": 40,
        "hgs": 100,
        "desc": "+58.400 ₺ cüzdan harcırahı, +4700 XP, +120.000 ₺ şirket kasası, +40 L mazot ve +100 ₺ HGS gişe bakiyesi.",
        "isMilestone": false
    },
    {
        "day": 98,
        "title": "98. Gün Kaptan Sefer Takviyesi",
        "icon": "💵",
        "tier": 5,
        "cash": 59600,
        "xp": 4800,
        "treasury": 122500,
        "fuel": 40,
        "hgs": 100,
        "desc": "+59.600 ₺ cüzdan harcırahı, +4800 XP, +122.500 ₺ şirket kasası, +40 L mazot ve +100 ₺ HGS gişe bakiyesi.",
        "isMilestone": false
    },
    {
        "day": 99,
        "title": "99. Gün Kaptan Sefer Takviyesi",
        "icon": "🛣️",
        "tier": 5,
        "cash": 60800,
        "xp": 4900,
        "treasury": 125000,
        "fuel": 40,
        "hgs": 100,
        "desc": "+60.800 ₺ cüzdan harcırahı, +4900 XP, +125.000 ₺ şirket kasası, +40 L mazot ve +100 ₺ HGS gişe bakiyesi.",
        "isMilestone": false
    },
    {
        "day": 100,
        "title": "100. Gün: EFSANE KAPTAN BÜYÜK ŞAMPİYONLUK TAÇI",
        "icon": "👑",
        "tier": 5,
        "cash": 200000,
        "xp": 10000,
        "treasury": 400000,
        "fuel": 150,
        "hgs": 1000,
        "desc": "100 günlük büyük sadakat zaferi: +200.000 ₺ cüzdan, +10.000 XP, +400.000 ₺ şirket kasası, +150 L mazot ve +1.000 ₺ HGS.",
        "isMilestone": true
    }
],

        // Bugünün Tarih Dizgisi (YYYY-MM-DD)
        getTodayDateString: function () {
            try {
                const now = new Date();
                const y = now.getFullYear();
                const m = String(now.getMonth() + 1).padStart(2, '0');
                const d = String(now.getDate()).padStart(2, '0');
                return `${y}-${m}-${d}`;
            } catch (e) {
                return "2026-10-24";
            }
        },

        // 00:00 Gece Yarısına Kalan Süre Hesabı
        getTimeUntilMidnight: function () {
            try {
                const now = new Date();
                const nextMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0, 0);
                const diffMs = Math.max(0, nextMidnight.getTime() - now.getTime());
                const totalSeconds = Math.floor(diffMs / 1000);
                const hours = Math.floor(totalSeconds / 3600);
                const minutes = Math.floor((totalSeconds % 3600) / 60);
                const seconds = totalSeconds % 60;
                const hh = String(hours).padStart(2, '0');
                const mm = String(minutes).padStart(2, '0');
                const ss = String(seconds).padStart(2, '0');
                return {
                    diffMs: diffMs,
                    totalSeconds: totalSeconds,
                    hours: hours,
                    minutes: minutes,
                    seconds: seconds,
                    formatted: `${hh}:${mm}:${ss}`,
                    text: `${hours} saat ${minutes} dakika ${seconds} saniye`
                };
            } catch (e) {
                return {
                    diffMs: 0,
                    totalSeconds: 0,
                    hours: 0,
                    minutes: 0,
                    seconds: 0,
                    formatted: "00:00:00",
                    text: "0 saat 0 dakika"
                };
            }
        },

        // Saat 00:00'da Günün Sıfırlanması ve Yeni Günün Açılması
        onMidnightReset: function () {
            this.currentActiveDate = this.getTodayDateString();
            this.updateBadge();
            
            const nextDay = this.getNextClaimableDay();
            const resetMsg = `⏰ SAAT 00:00: Yeni gün başladı ve hoş geldin takvimi sıfırlandı! ${nextDay}. Gün ödülünüz hazır!`;
            
            if (typeof audio !== 'undefined') {
                if (typeof audio.playSuccess === 'function') {
                    try { audio.playSuccess(); } catch (e) {}
                }
                if (typeof audio.speak === 'function') {
                    audio.speak(`Saat 00:00 oldu! Yeni gün başladı. ${nextDay}. gün hoş geldin ödülünüz açıldı.`);
                }
                if (typeof audio.updateNvdaLiveRegion === 'function') {
                    audio.updateNvdaLiveRegion(resetMsg);
                }
            }

            if (typeof UI !== 'undefined' && typeof UI.showToast === 'function') {
                UI.showToast(resetMsg, "info");
            }

            // Açık modal varsa anında canlı olarak yeniden çiz
            const modal = (typeof document !== 'undefined') ? document.getElementById('welcome-calendar-modal') : null;
            if (modal && !modal.classList.contains('hidden')) {
                this.renderModal();
            }
        },

        // Gece Yarısı Geçiş Kontrolü (00:00 Tetikleyicisi)
        checkMidnightReset: function (force = false) {
            const todayStr = this.getTodayDateString();
            if (force || (this.currentActiveDate && this.currentActiveDate !== todayStr)) {
                this.currentActiveDate = todayStr;
                this.onMidnightReset();
                return true;
            }
            return false;
        },

        // 1 Saniyelik Canlı Saat ve 00:00 Nöbetçisi
        startMidnightWatcher: function () {
            if (this._midnightInterval) {
                clearInterval(this._midnightInterval);
            }
            this.currentActiveDate = this.getTodayDateString();

            if (typeof setInterval !== 'undefined') {
                this._midnightInterval = setInterval(() => {
                    const todayStr = this.getTodayDateString();
                    if (this.currentActiveDate && this.currentActiveDate !== todayStr) {
                        this.onMidnightReset();
                    }

                    // Modal açıksa canlı geri sayım sayacını saniyelik güncelle
                    if (typeof document !== 'undefined') {
                        const timerEl = document.getElementById('welcome-countdown-timer');
                        const timerSubEl = document.getElementById('welcome-claim-cooldown-text');
                        if (timerEl || timerSubEl) {
                            const remaining = this.getTimeUntilMidnight();
                            if (timerEl) timerEl.innerText = remaining.formatted;
                            if (timerSubEl) timerSubEl.innerText = `${remaining.hours}s ${remaining.minutes}d ${remaining.seconds}sn`;
                        }
                    }
                }, 1000);
            }
        },

        // Verileri Yükle
        loadData: function () {
            try {
                const raw = localStorage.getItem(this.STORAGE_KEY);
                if (raw) {
                    const parsed = JSON.parse(raw);
                    this.data = Object.assign(this.data, parsed);
                    this.data.claimedDays = this.data.claimedDays || {};
                    this.data.claimedCount = Object.keys(this.data.claimedDays).length;
                }
            } catch (e) {
                console.warn("[WelcomeCalendar] Veri yükleme hatası:", e);
            }
        },

        // Verileri Kaydet
        saveData: function () {
            try {
                localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.data));
            } catch (e) {
                console.warn("[WelcomeCalendar] Veri kaydetme hatası:", e);
            }
            if (typeof Game !== 'undefined' && typeof Game.saveData === 'function') {
                Game.saveData();
            }
        },

        // Sıfırlama (Yeni Kariyer veya Tüm Verileri Sıfırla)
        resetData: function () {
            this.data = {
                claimedDays: {},
                lastClaimDate: null,
                claimedCount: 0,
                totalClaimedCash: 0,
                totalClaimedXP: 0,
                totalClaimedTreasury: 0
            };
            try {
                localStorage.removeItem(this.STORAGE_KEY);
            } catch (e) {}
            this.updateBadge();
            return true;
        },

        // Bir sonraki alınabilir gün numarası (1 - 100)
        getNextClaimableDay: function () {
            return Math.min(100, (this.data.claimedCount || 0) + 1);
        },

        // Bugün ödül alınabilir mi?
        isTodayClaimable: function () {
            if (this.data.claimedCount >= 100) return false;
            const todayStr = this.getTodayDateString();
            return this.data.lastClaimDate !== todayStr;
        },

        // Belirli bir günün durumu: 'claimed', 'ready', 'locked'
        getDayStatus: function (dayNum) {
            if (this.data.claimedDays && this.data.claimedDays[dayNum]) {
                return 'claimed';
            }
            const nextDay = this.getNextClaimableDay();
            if (dayNum === nextDay && this.isTodayClaimable()) {
                return 'ready';
            }
            return 'locked';
        },

        // Bugünün Ödülünü Al
        claimToday: function () {
            if (!this.isTodayClaimable()) {
                const rem = this.getTimeUntilMidnight();
                const alreadyMsg = `Bugünkü hoş geldin hediyenizi zaten aldınız! Yeni ödülünüz gece saat 00:00'da (${rem.hours} saat ${rem.minutes} dakika sonra) sıfırlanıp hazır olacak.`;
                if (typeof audio !== 'undefined' && audio.speak) audio.speak(alreadyMsg);
                if (typeof UI !== 'undefined' && UI.showToast) UI.showToast("⏳ " + alreadyMsg, "warning");
                return false;
            }

            const nextDayNum = this.getNextClaimableDay();
            const reward = this.DAYS.find(d => d.day === nextDayNum);
            if (!reward) return false;

            const now = Date.now();
            const todayStr = this.getTodayDateString();

            // 1. Durumu Güncelle
            this.data.claimedDays[nextDayNum] = now;
            this.data.lastClaimDate = todayStr;
            this.data.claimedCount = Object.keys(this.data.claimedDays).length;
            this.data.totalClaimedCash = (this.data.totalClaimedCash || 0) + reward.cash;
            this.data.totalClaimedXP = (this.data.totalClaimedXP || 0) + reward.xp;
            this.data.totalClaimedTreasury = (this.data.totalClaimedTreasury || 0) + reward.treasury;

            // 2. Oyun Kaynaklarını Ekle
            if (typeof Game !== 'undefined') {
                Game.playerBudget = (Game.playerBudget || 0) + reward.cash;
                Game.playerXP = (Game.playerXP || 0) + reward.xp;
                
                // Seviye hesaplama ve atlama kontrolü
                if (typeof Game.calculateLevelFromXP === 'function') {
                    const newLvl = Game.calculateLevelFromXP(Game.playerXP);
                    if (newLvl > Game.licenseLevel) {
                        Game.licenseLevel = newLvl;
                    }
                }
                
                // Akaryakıt bonusu
                if (reward.fuel && typeof Game.fuel === 'number') {
                    Game.fuel = Math.min(100, Game.fuel + reward.fuel);
                }

                if (typeof UI !== 'undefined' && typeof UI.updatePlayerStats === 'function') {
                    const title = (typeof Game.getLicenseTitle === 'function') ? Game.getLicenseTitle() : 'Kaptan';
                    UI.updatePlayerStats(Game.licenseLevel, Game.completedTasks, Game.playerBudget, title);
                }
            }

            // Şirket Kasasına Ekle
            const compSys = (typeof CompanySystem !== 'undefined') ? CompanySystem : ((typeof window !== 'undefined' && window.CompanySystem) ? window.CompanySystem : null);
            if (compSys && compSys.data) {
                compSys.data.companyTreasury = (compSys.data.companyTreasury || 0) + reward.treasury;
                compSys.saveData();
            }

            // HGS Bakiyesine Ekle
            const hwyObj = (typeof HighwayFacilities !== 'undefined') ? HighwayFacilities : ((typeof window !== 'undefined' && window.HighwayFacilities) ? window.HighwayFacilities : null);
            if (hwyObj && hwyObj.data) {
                hwyObj.data.hgsBalance = (hwyObj.data.hgsBalance || 0) + (reward.hgs || 0);
                hwyObj.saveData();
            }

            // Kaydet
            this.saveData();
            this.updateBadge();

            // Ses ve Kutlama
            if (typeof audio !== 'undefined') {
                if (typeof audio.playCash === 'function') audio.playCash();
                if (typeof audio.playBadgeFanfare === 'function') {
                    setTimeout(() => audio.playBadgeFanfare(), 400);
                }
            }

            const celebrationMsg = `🎉 ${reward.title} ALINDI! Cüzdanınıza +${reward.cash.toLocaleString('tr-TR')} ₺, +${reward.xp.toLocaleString('tr-TR')} XP, Şirket Kasasına +${reward.treasury.toLocaleString('tr-TR')} ₺, +${reward.fuel} L Mazot ve +${reward.hgs} ₺ HGS eklendi!`;
            if (typeof audio !== 'undefined') {
                if (audio.speak) audio.speak(`Tebrikler Kaptan! ${reward.title} hesabınıza yüklendi. Cüzdanınıza ${reward.cash.toLocaleString('tr-TR')} lira ve şirketinize ${reward.treasury.toLocaleString('tr-TR')} lira aktarıldı.`);
                if (audio.updateNvdaLiveRegion) audio.updateNvdaLiveRegion(celebrationMsg);
            }

            if (typeof UI !== 'undefined' && UI.showToast) {
                UI.showToast(celebrationMsg, "success");
            }

            // Modalı yeniden çiz
            this.renderModal();
            return true;
        },

        // Ana Menü Buton Rozetini Güncelle
        updateBadge: function () {
            const badgeEl = document.getElementById('welcome-calendar-badge');
            if (!badgeEl) return;

            if (this.isTodayClaimable()) {
                const nextDay = this.getNextClaimableDay();
                badgeEl.style.display = 'inline-block';
                badgeEl.innerText = `${nextDay}. Gün Hazır!`;
                badgeEl.style.background = '#ec4899';
            } else if (this.data.claimedCount >= 100) {
                badgeEl.style.display = 'inline-block';
                badgeEl.innerText = '100 Gün Tamamlandı!';
                badgeEl.style.background = '#22c55e';
            } else {
                badgeEl.style.display = 'none';
            }
        },

        // Modal DOM'unu Oluştur
        createModal: function () {
            if (document.getElementById('welcome-calendar-modal')) return;

            const modal = document.createElement('div');
            modal.id = 'welcome-calendar-modal';
            modal.className = 'modal-overlay modal hidden';
            modal.setAttribute('role', 'dialog');
            modal.setAttribute('aria-modal', 'true');
            modal.setAttribute('aria-labelledby', 'welcome-modal-title');
            modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.92); z-index: 8700; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(10px); padding: 15px; box-sizing: border-box;';

            modal.innerHTML = `
            <div style="background: linear-gradient(145deg, #111827, #1f2937); border: 2px solid #ec4899; border-radius: 16px; width: 100%; max-width: 980px; max-height: 92vh; display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 10px 40px rgba(236, 72, 153, 0.35);">
                <!-- MODAL BAŞLIĞI -->
                <div style="padding: 16px 24px; background: rgba(236, 72, 153, 0.12); border-bottom: 1.5px solid rgba(236, 72, 153, 0.3); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <span style="font-size: 2.2rem; line-height: 1;">🎁</span>
                        <div>
                            <h2 id="welcome-modal-title" style="font-size: 1.6rem; margin: 0; color: #f472b6; font-weight: 800; display: flex; align-items: center; gap: 8px;">
                                100 Günlük Hoş Geldin Takvimi
                            </h2>
                            <p style="margin: 2px 0 0 0; color: #cbd5e1; font-size: 0.88rem;">
                                Her gün giriş yaparak artan kişisel nakit, XP, şirket kasası, akaryakıt ve HGS ödüllerinizi toplayın!
                            </p>
                        </div>
                    </div>
                    <button id="btn-close-welcome-modal" class="modern-btn nav-item" style="padding: 8px 16px; background: rgba(239, 68, 68, 0.2); border: 1.5px solid #ef4444; color: #fca5a5; font-weight: bold; cursor: pointer; border-radius: 8px; font-size: 0.95rem;" aria-label="Hoş geldin takvimini kapat (Esc)">
                        ✕ Kapat
                    </button>
                </div>

                <!-- DURUM VE BUGÜNÜ AL ÇUBUĞU -->
                <div id="welcome-header-summary" style="padding: 14px 24px; background: rgba(15, 23, 42, 0.9); border-bottom: 1px solid rgba(255,255,255,0.08); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
                    <!-- JS İLE DOLDURULUR -->
                </div>

                <!-- SAYFA VE KADEME SEÇİCİ -->
                <div style="padding: 10px 24px; background: rgba(0,0,0,0.3); border-bottom: 1px solid rgba(255,255,255,0.06); display: flex; gap: 8px; overflow-x: auto; align-items: center;">
                    <button class="nav-item modern-btn btn-welcome-page" data-page="1" style="padding: 6px 14px; font-size: 0.88rem; font-weight: bold; border-radius: 6px; cursor: pointer;">1 - 20. Gün</button>
                    <button class="nav-item modern-btn btn-welcome-page" data-page="2" style="padding: 6px 14px; font-size: 0.88rem; font-weight: bold; border-radius: 6px; cursor: pointer;">21 - 40. Gün</button>
                    <button class="nav-item modern-btn btn-welcome-page" data-page="3" style="padding: 6px 14px; font-size: 0.88rem; font-weight: bold; border-radius: 6px; cursor: pointer;">41 - 60. Gün</button>
                    <button class="nav-item modern-btn btn-welcome-page" data-page="4" style="padding: 6px 14px; font-size: 0.88rem; font-weight: bold; border-radius: 6px; cursor: pointer;">61 - 80. Gün</button>
                    <button class="nav-item modern-btn btn-welcome-page" data-page="5" style="padding: 6px 14px; font-size: 0.88rem; font-weight: bold; border-radius: 6px; cursor: pointer;">81 - 100. Gün (Final)</button>
                </div>

                <!-- 20'LİK GÜN KARTLARI IZGARASI -->
                <div id="welcome-cards-container" style="flex: 1; overflow-y: auto; padding: 20px 24px; display: grid; grid-template-columns: repeat(auto-fill, minmax(210px, 1fr)); gap: 14px;">
                    <!-- JS İLE DOLDURULUR -->
                </div>
            </div>
            `;

            document.body.appendChild(modal);

            // Kapat Butonu
            const btnClose = modal.querySelector('#btn-close-welcome-modal');
            if (btnClose) {
                btnClose.addEventListener('click', () => this.closeModal());
            }

            // Sayfa Değiştirme Butonları
            const pageBtns = modal.querySelectorAll('.btn-welcome-page');
            pageBtns.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const p = parseInt(e.currentTarget.getAttribute('data-page'));
                    if (p && p >= 1 && p <= 5) {
                        this.currentPage = p;
                        this.renderModal();
                    }
                });
            });

            // Global ESC Dinleyici
            window.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
                    this.closeModal();
                }
            });
        },

        // Modalı Aç
        openModal: function (targetPage = null) {
            this.createModal();
            const modal = document.getElementById('welcome-calendar-modal');
            if (!modal) return;

            // Otomatik olarak mevcut aktif güne ait sayfayı aç
            if (targetPage) {
                this.currentPage = targetPage;
            } else {
                const nextDay = this.getNextClaimableDay();
                this.currentPage = Math.min(5, Math.max(1, Math.ceil(nextDay / this.pageSize)));
            }

            modal.classList.remove('hidden');
            this.renderModal();

            if (typeof audio !== 'undefined' && audio.speak) {
                const nextDay = this.getNextClaimableDay();
                const claimStatus = this.isTodayClaimable() 
                    ? `Bugün ${nextDay}. gün ödülü alınmaya hazır!` 
                    : `Bugünkü ödülü aldınız, toplam ${this.data.claimedCount} gün tamamlandı.`;
                audio.speak(`100 Günlük Hoş Geldin Takvimi açıldı. ${claimStatus}`);
            }

            if (typeof KeyboardNav !== 'undefined' && KeyboardNav.initForScreen) {
                KeyboardNav.initForScreen();
            }
        },

        // Modalı Kapat
        closeModal: function () {
            const modal = document.getElementById('welcome-calendar-modal');
            if (modal) {
                modal.classList.add('hidden');
            }
            const openBtn = document.getElementById('btn-open-welcome-calendar');
            if (openBtn) openBtn.focus();
        },

        // Modalı Render Et
        renderModal: function () {
            this.loadData();
            const modal = document.getElementById('welcome-calendar-modal');
            if (!modal || modal.classList.contains('hidden')) return;

            const nextDay = this.getNextClaimableDay();
            const isReady = this.isTodayClaimable();
            const claimedCount = this.data.claimedCount || 0;

            // 1. Özet & Bugün Al Butonu
            const summaryBox = modal.querySelector('#welcome-header-summary');
            if (summaryBox) {
                const remTime = this.getTimeUntilMidnight();
                summaryBox.innerHTML = `
                    <div style="display: flex; gap: 20px; align-items: center; flex-wrap: wrap;">
                        <div>
                            <div style="font-size: 0.8rem; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px;">Giriş Serisi</div>
                            <div style="font-size: 1.25rem; font-weight: 800; color: #f472b6;">
                                ${claimedCount} / 100 Gün Tamamlandı
                            </div>
                        </div>
                        <div style="border-left: 1px solid rgba(255,255,255,0.1); padding-left: 16px;">
                            <div style="font-size: 0.8rem; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px;">Kazanılan Toplamlar</div>
                            <div style="font-size: 0.95rem; font-weight: bold; color: #38bdf8;">
                                ${(this.data.totalClaimedCash || 0).toLocaleString('tr-TR')} ₺ Cüzdan | ${(this.data.totalClaimedTreasury || 0).toLocaleString('tr-TR')} ₺ Kasa
                            </div>
                        </div>
                        <div style="background: rgba(236, 72, 153, 0.15); border: 1.5px solid rgba(236, 72, 153, 0.4); padding: 6px 14px; border-radius: 8px; display: flex; align-items: center; gap: 10px;">
                            <span style="font-size: 1.2rem; line-height: 1;">⏰</span>
                            <div>
                                <div style="font-size: 0.72rem; color: #fbcfe8; text-transform: uppercase; font-weight: bold; letter-spacing: 0.5px;">Sıfırlanma (00:00)</div>
                                <div id="welcome-countdown-timer" style="font-family: monospace; font-size: 1.05rem; font-weight: 800; color: #f472b6;">
                                    ${remTime.formatted}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div>
                        ${isReady ? `
                            <button id="btn-claim-today-welcome" class="modern-btn nav-item" style="padding: 10px 24px; font-size: 1.05rem; font-weight: 800; background: linear-gradient(135deg, #ec4899, #be185d); color: #fff; border: none; border-radius: 8px; cursor: pointer; box-shadow: 0 4px 15px rgba(236, 72, 153, 0.45); display: flex; align-items: center; gap: 8px;">
                                🎁 ${nextDay}. Gün Ödülünü Al
                            </button>
                        ` : (claimedCount >= 100 ? `
                            <div style="padding: 8px 18px; background: rgba(34, 197, 94, 0.2); border: 1px solid #22c55e; color: #4ade80; font-weight: bold; border-radius: 8px;">
                                👑 100 Günün Tamamı Tamamlandı!
                            </div>
                        ` : `
                            <div style="padding: 8px 18px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.15); color: #cbd5e1; font-weight: bold; border-radius: 8px; font-size: 0.88rem; display: flex; align-items: center; gap: 6px;">
                                <span>⏳ Bugünkü Ödül Alındı • </span>
                                <span style="color: #fb7185;">00:00'da Sıfırlanacak (<span id="welcome-claim-cooldown-text">${remTime.hours}s ${remTime.minutes}d ${remTime.seconds}sn</span>)</span>
                            </div>
                        `)}
                    </div>
                `;

                const btnClaim = summaryBox.querySelector('#btn-claim-today-welcome');
                if (btnClaim) {
                    btnClaim.addEventListener('click', () => {
                        this.claimToday();
                    });
                }
            }

            // 2. Sayfa Butonlarını Vurgula
            const pageBtns = modal.querySelectorAll('.btn-welcome-page');
            pageBtns.forEach(btn => {
                const p = parseInt(btn.getAttribute('data-page'));
                if (p === this.currentPage) {
                    btn.style.background = 'rgba(236, 72, 153, 0.35)';
                    btn.style.borderColor = '#ec4899';
                    btn.style.color = '#fbcfe8';
                } else {
                    btn.style.background = 'rgba(255,255,255,0.06)';
                    btn.style.borderColor = 'rgba(255,255,255,0.15)';
                    btn.style.color = '#94a3b8';
                }
            });

            // 3. Gün Kartlarını Çiz (Mevcut Sayfa: 20 Gün)
            const cardsContainer = modal.querySelector('#welcome-cards-container');
            if (cardsContainer) {
                cardsContainer.innerHTML = '';
                const startIdx = (this.currentPage - 1) * this.pageSize;
                const endIdx = startIdx + this.pageSize;
                const pageDays = this.DAYS.slice(startIdx, endIdx);

                pageDays.forEach(item => {
                    const status = this.getDayStatus(item.day);
                    const isNextWaiting = (status === 'locked' && item.day === nextDay && !isReady);
                    const card = document.createElement('div');
                    card.className = 'welcome-day-card nav-item';
                    card.setAttribute('tabindex', '0');

                    let borderStyle = '1.5px solid rgba(255,255,255,0.1)';
                    let bgStyle = 'linear-gradient(145deg, rgba(30, 41, 59, 0.6), rgba(15, 23, 42, 0.7))';
                    let statusBadge = '';

                    if (status === 'claimed') {
                        borderStyle = '1.5px solid #22c55e';
                        bgStyle = 'linear-gradient(145deg, rgba(20, 83, 45, 0.25), rgba(15, 23, 42, 0.7))';
                        statusBadge = '<span style="color: #4ade80; font-size: 0.8rem; font-weight: bold; background: rgba(34, 197, 94, 0.2); padding: 3px 8px; border-radius: 6px;">✓ Alındı</span>';
                    } else if (status === 'ready') {
                        borderStyle = '2px solid #ec4899';
                        bgStyle = 'linear-gradient(145deg, rgba(236, 72, 153, 0.25), rgba(190, 24, 93, 0.2))';
                        statusBadge = '<span style="color: #fbcfe8; font-size: 0.8rem; font-weight: 800; background: #ec4899; padding: 3px 8px; border-radius: 6px; box-shadow: 0 0 10px rgba(236, 72, 153, 0.6);">🎁 HAZIR</span>';
                    } else if (isNextWaiting) {
                        borderStyle = '1.5px solid rgba(251, 113, 133, 0.5)';
                        bgStyle = 'linear-gradient(145deg, rgba(244, 63, 94, 0.12), rgba(15, 23, 42, 0.7))';
                        statusBadge = '<span style="color: #fb7185; font-size: 0.8rem; font-weight: bold; background: rgba(244, 63, 94, 0.2); padding: 3px 8px; border-radius: 6px; border: 1px solid rgba(244, 63, 94, 0.3);">⏳ 00:00\'da Açılacak</span>';
                    } else {
                        statusBadge = '<span style="color: #64748b; font-size: 0.8rem; font-weight: bold; background: rgba(255, 255, 255, 0.05); padding: 3px 8px; border-radius: 6px;">🔒 Kilitli</span>';
                    }

                    if (item.isMilestone) {
                        borderStyle = (status === 'claimed') ? '2px solid #eab308' : ((status === 'ready') ? '2px solid #f59e0b' : (isNextWaiting ? '2px solid #fb7185' : '1.5px solid rgba(234, 179, 8, 0.4)'));
                    }

                    card.style.cssText = `background: ${bgStyle}; border: ${borderStyle}; border-radius: 12px; padding: 14px; display: flex; flex-direction: column; justify-content: space-between; box-shadow: 0 4px 12px rgba(0,0,0,0.3); position: relative;`;

                    card.innerHTML = `
                        <div>
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                                <span style="font-size: 1.1rem; font-weight: 800; color: ${item.isMilestone ? '#facc15' : '#f472b6'};">
                                    ${item.day}. Gün
                                </span>
                                ${statusBadge}
                            </div>
                            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                                <span style="font-size: 1.6rem;">${item.icon}</span>
                                <div style="font-size: 0.95rem; font-weight: bold; color: #fff; line-height: 1.2;">
                                    ${item.title}
                                </div>
                            </div>
                            <div style="font-size: 0.82rem; color: #cbd5e1; margin-bottom: 10px; line-height: 1.35;">
                                ${item.desc}
                            </div>
                        </div>

                        <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid rgba(255,255,255,0.08); display: flex; justify-content: space-between; align-items: center;">
                            <span style="font-size: 0.78rem; color: ${isNextWaiting ? '#fb7185' : '#94a3b8'};">
                                ${isNextWaiting ? '⏰ Gece 00:00\'da Sıfırlanır' : (item.isMilestone ? '⭐ Özel Dönüm Noktası' : 'Günlük Ödül')}
                            </span>
                            ${status === 'ready' ? `
                                <button class="modern-btn btn-card-claim" style="padding: 5px 12px; font-size: 0.82rem; font-weight: bold; background: #ec4899; color: #fff; border: none; border-radius: 6px; cursor: pointer;">
                                    Hemen Al
                                </button>
                            ` : ''}
                        </div>
                    `;

                    if (status === 'ready') {
                        const btnCardClaim = card.querySelector('.btn-card-claim');
                        if (btnCardClaim) {
                            btnCardClaim.addEventListener('click', (e) => {
                                e.stopPropagation();
                                this.claimToday();
                            });
                        }
                        card.style.cursor = 'pointer';
                        card.addEventListener('click', () => this.claimToday());
                        card.addEventListener('keydown', (e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                this.claimToday();
                            }
                        });
                    }

                    cardsContainer.appendChild(card);
                });
            }

            if (typeof KeyboardNav !== 'undefined' && KeyboardNav.initForScreen) {
                KeyboardNav.initForScreen();
            }
        },

        // Sistemi Başlat
        init: function () {
            this.loadData();
            this.createModal();
            this.updateBadge();
            this.startMidnightWatcher();

            // Menü Butonunu Bağla
            const btnOpen = document.getElementById('btn-open-welcome-calendar');
            if (btnOpen) {
                btnOpen.addEventListener('click', () => {
                    this.openModal();
                });
            }

            // İlk Açılış Hoş Geldin Bildirimi
            if (this.isTodayClaimable() && this.data.claimedCount === 0) {
                setTimeout(() => {
                    if (typeof UI !== 'undefined' && UI.showToast) {
                        UI.showToast("🎁 1. Gün Hoş Geldin Hediyeniz Hazır! Menüden hemen alabilirsiniz.", "info");
                    }
                }, 2000);
            }

            console.log("[WelcomeCalendar] 100 Günlük Hoş Geldin Takvimi hazır. Mevcut seri:", this.data.claimedCount);
        }
    };

    if (typeof window !== 'undefined') {
        window.WelcomeCalendar = WelcomeCalendar;
    }
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = WelcomeCalendar;
    }

    if (typeof document !== 'undefined') {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => WelcomeCalendar.init());
        } else {
            WelcomeCalendar.init();
        }
    }
})();
