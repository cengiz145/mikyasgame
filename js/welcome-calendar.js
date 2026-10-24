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
        "title": "1. Gün: Büyük Hoş Geldin Başlangıç Paketi",
        "icon": "🎉",
        "tier": 1,
        "cash": 2500,
        "xp": 250,
        "treasury": 5000,
        "fuel": 25,
        "hgs": 100,
        "desc": "Kişisel cüzdana +2.500 ₺, +250 XP, şirket kasasına +5.000 ₺, +25 L mazot ve +100 ₺ HGS otoyol bakiyesi.",
        "isMilestone": false
    },
    {
        "day": 2,
        "title": "2. Gün Hoş Geldin Hediyesi",
        "icon": "🎁",
        "tier": 1,
        "cash": 1800,
        "xp": 200,
        "treasury": 4500,
        "fuel": 18,
        "hgs": 70,
        "desc": "Kişisel cüzdana +1.800 ₺, +200 XP, şirket kasasına +4.500 ₺, +18 L mazot ve +70 ₺ HGS otoyol bakiyesi.",
        "isMilestone": false
    },
    {
        "day": 3,
        "title": "3. Gün Hoş Geldin Hediyesi",
        "icon": "🎁",
        "tier": 1,
        "cash": 2200,
        "xp": 250,
        "treasury": 5500,
        "fuel": 19,
        "hgs": 80,
        "desc": "Kişisel cüzdana +2.200 ₺, +250 XP, şirket kasasına +5.500 ₺, +19 L mazot ve +80 ₺ HGS otoyol bakiyesi.",
        "isMilestone": false
    },
    {
        "day": 4,
        "title": "4. Gün Hoş Geldin Hediyesi",
        "icon": "🎁",
        "tier": 1,
        "cash": 2600,
        "xp": 300,
        "treasury": 6500,
        "fuel": 21,
        "hgs": 90,
        "desc": "Kişisel cüzdana +2.600 ₺, +300 XP, şirket kasasına +6.500 ₺, +21 L mazot ve +90 ₺ HGS otoyol bakiyesi.",
        "isMilestone": false
    },
    {
        "day": 5,
        "title": "5. Gün Hoş Geldin Hediyesi",
        "icon": "🎁",
        "tier": 1,
        "cash": 3000,
        "xp": 350,
        "treasury": 7500,
        "fuel": 22,
        "hgs": 100,
        "desc": "Kişisel cüzdana +3.000 ₺, +350 XP, şirket kasasına +7.500 ₺, +22 L mazot ve +100 ₺ HGS otoyol bakiyesi.",
        "isMilestone": false
    },
    {
        "day": 6,
        "title": "6. Gün Hoş Geldin Hediyesi",
        "icon": "🎁",
        "tier": 1,
        "cash": 3400,
        "xp": 400,
        "treasury": 8500,
        "fuel": 24,
        "hgs": 110,
        "desc": "Kişisel cüzdana +3.400 ₺, +400 XP, şirket kasasına +8.500 ₺, +24 L mazot ve +110 ₺ HGS otoyol bakiyesi.",
        "isMilestone": false
    },
    {
        "day": 7,
        "title": "7. Gün 1. Hafta Kaptanlık Bonusu",
        "icon": "👑",
        "tier": 1,
        "cash": 10000,
        "xp": 1000,
        "treasury": 25000,
        "fuel": 50,
        "hgs": 250,
        "desc": "Kişisel cüzdana +10.000 ₺, +1.000 XP, şirket kasasına +25.000 ₺, +50 L mazot ve +250 ₺ HGS otoyol bakiyesi.",
        "isMilestone": true
    },
    {
        "day": 8,
        "title": "8. Gün Hoş Geldin Hediyesi",
        "icon": "🎁",
        "tier": 1,
        "cash": 4200,
        "xp": 500,
        "treasury": 10500,
        "fuel": 27,
        "hgs": 130,
        "desc": "Kişisel cüzdana +4.200 ₺, +500 XP, şirket kasasına +10.500 ₺, +27 L mazot ve +130 ₺ HGS otoyol bakiyesi.",
        "isMilestone": false
    },
    {
        "day": 9,
        "title": "9. Gün Hoş Geldin Hediyesi",
        "icon": "🎁",
        "tier": 1,
        "cash": 4600,
        "xp": 550,
        "treasury": 11500,
        "fuel": 28,
        "hgs": 140,
        "desc": "Kişisel cüzdana +4.600 ₺, +550 XP, şirket kasasına +11.500 ₺, +28 L mazot ve +140 ₺ HGS otoyol bakiyesi.",
        "isMilestone": false
    },
    {
        "day": 10,
        "title": "10. Gün Hoş Geldin Hediyesi",
        "icon": "🎁",
        "tier": 1,
        "cash": 5000,
        "xp": 600,
        "treasury": 12500,
        "fuel": 30,
        "hgs": 150,
        "desc": "Kişisel cüzdana +5.000 ₺, +600 XP, şirket kasasına +12.500 ₺, +30 L mazot ve +150 ₺ HGS otoyol bakiyesi.",
        "isMilestone": false
    },
    {
        "day": 11,
        "title": "11. Gün Gelişme Bonusu",
        "icon": "💼",
        "tier": 1,
        "cash": 6200,
        "xp": 680,
        "treasury": 17500,
        "fuel": 32,
        "hgs": 160,
        "desc": "Kişisel cüzdana +6.200 ₺, +680 XP, şirket kasasına +17.500 ₺, +32 L mazot ve +160 ₺ HGS otoyol bakiyesi.",
        "isMilestone": false
    },
    {
        "day": 12,
        "title": "12. Gün Gelişme Bonusu",
        "icon": "💼",
        "tier": 1,
        "cash": 7400,
        "xp": 760,
        "treasury": 20000,
        "fuel": 34,
        "hgs": 170,
        "desc": "Kişisel cüzdana +7.400 ₺, +760 XP, şirket kasasına +20.000 ₺, +34 L mazot ve +170 ₺ HGS otoyol bakiyesi.",
        "isMilestone": false
    },
    {
        "day": 13,
        "title": "13. Gün Gelişme Bonusu",
        "icon": "💼",
        "tier": 1,
        "cash": 8600,
        "xp": 840,
        "treasury": 22500,
        "fuel": 36,
        "hgs": 180,
        "desc": "Kişisel cüzdana +8.600 ₺, +840 XP, şirket kasasına +22.500 ₺, +36 L mazot ve +180 ₺ HGS otoyol bakiyesi.",
        "isMilestone": false
    },
    {
        "day": 14,
        "title": "14. Gün Özel Kaptan Primi",
        "icon": "🎖️",
        "tier": 1,
        "cash": 20000,
        "xp": 2000,
        "treasury": 50000,
        "fuel": 60,
        "hgs": 350,
        "desc": "Kişisel cüzdana +20.000 ₺, +2.000 XP, şirket kasasına +50.000 ₺, +60 L mazot ve +350 ₺ HGS otoyol bakiyesi.",
        "isMilestone": true
    },
    {
        "day": 15,
        "title": "15. Gün Gelişme Bonusu",
        "icon": "💼",
        "tier": 1,
        "cash": 11000,
        "xp": 1000,
        "treasury": 27500,
        "fuel": 40,
        "hgs": 200,
        "desc": "Kişisel cüzdana +11.000 ₺, +1.000 XP, şirket kasasına +27.500 ₺, +40 L mazot ve +200 ₺ HGS otoyol bakiyesi.",
        "isMilestone": false
    },
    {
        "day": 16,
        "title": "16. Gün Gelişme Bonusu",
        "icon": "💼",
        "tier": 1,
        "cash": 12200,
        "xp": 1080,
        "treasury": 30000,
        "fuel": 42,
        "hgs": 210,
        "desc": "Kişisel cüzdana +12.200 ₺, +1.080 XP, şirket kasasına +30.000 ₺, +42 L mazot ve +210 ₺ HGS otoyol bakiyesi.",
        "isMilestone": false
    },
    {
        "day": 17,
        "title": "17. Gün Gelişme Bonusu",
        "icon": "💼",
        "tier": 1,
        "cash": 13400,
        "xp": 1160,
        "treasury": 32500,
        "fuel": 44,
        "hgs": 220,
        "desc": "Kişisel cüzdana +13.400 ₺, +1.160 XP, şirket kasasına +32.500 ₺, +44 L mazot ve +220 ₺ HGS otoyol bakiyesi.",
        "isMilestone": false
    },
    {
        "day": 18,
        "title": "18. Gün Gelişme Bonusu",
        "icon": "💼",
        "tier": 1,
        "cash": 14600,
        "xp": 1240,
        "treasury": 35000,
        "fuel": 46,
        "hgs": 230,
        "desc": "Kişisel cüzdana +14.600 ₺, +1.240 XP, şirket kasasına +35.000 ₺, +46 L mazot ve +230 ₺ HGS otoyol bakiyesi.",
        "isMilestone": false
    },
    {
        "day": 19,
        "title": "19. Gün Gelişme Bonusu",
        "icon": "💼",
        "tier": 1,
        "cash": 15800,
        "xp": 1320,
        "treasury": 37500,
        "fuel": 48,
        "hgs": 240,
        "desc": "Kişisel cüzdana +15.800 ₺, +1.320 XP, şirket kasasına +37.500 ₺, +48 L mazot ve +240 ₺ HGS otoyol bakiyesi.",
        "isMilestone": false
    },
    {
        "day": 20,
        "title": "20. Gün Gelişme Bonusu",
        "icon": "💼",
        "tier": 1,
        "cash": 17000,
        "xp": 1400,
        "treasury": 40000,
        "fuel": 50,
        "hgs": 250,
        "desc": "Kişisel cüzdana +17.000 ₺, +1.400 XP, şirket kasasına +40.000 ₺, +50 L mazot ve +250 ₺ HGS otoyol bakiyesi.",
        "isMilestone": false
    },
    {
        "day": 21,
        "title": "21. Gün Özel Kaptan Primi",
        "icon": "🎖️",
        "tier": 2,
        "cash": 35000,
        "xp": 3000,
        "treasury": 75000,
        "fuel": 60,
        "hgs": 350,
        "desc": "Kişisel cüzdana +35.000 ₺, +3.000 XP, şirket kasasına +75.000 ₺, +60 L mazot ve +350 ₺ HGS otoyol bakiyesi.",
        "isMilestone": true
    },
    {
        "day": 22,
        "title": "22. Gün Gelişme Bonusu",
        "icon": "💼",
        "tier": 2,
        "cash": 19400,
        "xp": 1560,
        "treasury": 45000,
        "fuel": 54,
        "hgs": 270,
        "desc": "Kişisel cüzdana +19.400 ₺, +1.560 XP, şirket kasasına +45.000 ₺, +54 L mazot ve +270 ₺ HGS otoyol bakiyesi.",
        "isMilestone": false
    },
    {
        "day": 23,
        "title": "23. Gün Gelişme Bonusu",
        "icon": "💼",
        "tier": 2,
        "cash": 20600,
        "xp": 1640,
        "treasury": 47500,
        "fuel": 56,
        "hgs": 280,
        "desc": "Kişisel cüzdana +20.600 ₺, +1.640 XP, şirket kasasına +47.500 ₺, +56 L mazot ve +280 ₺ HGS otoyol bakiyesi.",
        "isMilestone": false
    },
    {
        "day": 24,
        "title": "24. Gün Gelişme Bonusu",
        "icon": "💼",
        "tier": 2,
        "cash": 21800,
        "xp": 1720,
        "treasury": 50000,
        "fuel": 58,
        "hgs": 290,
        "desc": "Kişisel cüzdana +21.800 ₺, +1.720 XP, şirket kasasına +50.000 ₺, +58 L mazot ve +290 ₺ HGS otoyol bakiyesi.",
        "isMilestone": false
    },
    {
        "day": 25,
        "title": "25. Gün Gelişme Bonusu",
        "icon": "💼",
        "tier": 2,
        "cash": 23000,
        "xp": 1800,
        "treasury": 52500,
        "fuel": 60,
        "hgs": 300,
        "desc": "Kişisel cüzdana +23.000 ₺, +1.800 XP, şirket kasasına +52.500 ₺, +60 L mazot ve +300 ₺ HGS otoyol bakiyesi.",
        "isMilestone": false
    },
    {
        "day": 26,
        "title": "26. Gün Usta Kaptan Hediyesi",
        "icon": "⭐",
        "tier": 2,
        "cash": 28000,
        "xp": 2150,
        "treasury": 67500,
        "fuel": 52,
        "hgs": 315,
        "desc": "Kişisel cüzdana +28.000 ₺, +2.150 XP, şirket kasasına +67.500 ₺, +52 L mazot ve +315 ₺ HGS otoyol bakiyesi.",
        "isMilestone": false
    },
    {
        "day": 27,
        "title": "27. Gün Usta Kaptan Hediyesi",
        "icon": "⭐",
        "tier": 2,
        "cash": 31000,
        "xp": 2300,
        "treasury": 75000,
        "fuel": 54,
        "hgs": 330,
        "desc": "Kişisel cüzdana +31.000 ₺, +2.300 XP, şirket kasasına +75.000 ₺, +54 L mazot ve +330 ₺ HGS otoyol bakiyesi.",
        "isMilestone": false
    },
    {
        "day": 28,
        "title": "28. Gün Usta Kaptan Hediyesi",
        "icon": "⭐",
        "tier": 2,
        "cash": 34000,
        "xp": 2450,
        "treasury": 82500,
        "fuel": 56,
        "hgs": 345,
        "desc": "Kişisel cüzdana +34.000 ₺, +2.450 XP, şirket kasasına +82.500 ₺, +56 L mazot ve +345 ₺ HGS otoyol bakiyesi.",
        "isMilestone": false
    },
    {
        "day": 29,
        "title": "29. Gün Usta Kaptan Hediyesi",
        "icon": "⭐",
        "tier": 2,
        "cash": 37000,
        "xp": 2600,
        "treasury": 90000,
        "fuel": 58,
        "hgs": 360,
        "desc": "Kişisel cüzdana +37.000 ₺, +2.600 XP, şirket kasasına +90.000 ₺, +58 L mazot ve +360 ₺ HGS otoyol bakiyesi.",
        "isMilestone": false
    },
    {
        "day": 30,
        "title": "30. Gün 1. Ay Sadakat Paketi",
        "icon": "🏆",
        "tier": 2,
        "cash": 100000,
        "xp": 5000,
        "treasury": 250000,
        "fuel": 100,
        "hgs": 500,
        "desc": "Kişisel cüzdana +100.000 ₺, +5.000 XP, şirket kasasına +250.000 ₺, +100 L mazot ve +500 ₺ HGS otoyol bakiyesi.",
        "isMilestone": true
    },
    {
        "day": 31,
        "title": "31. Gün Usta Kaptan Hediyesi",
        "icon": "⭐",
        "tier": 2,
        "cash": 43000,
        "xp": 2900,
        "treasury": 105000,
        "fuel": 62,
        "hgs": 390,
        "desc": "Kişisel cüzdana +43.000 ₺, +2.900 XP, şirket kasasına +105.000 ₺, +62 L mazot ve +390 ₺ HGS otoyol bakiyesi.",
        "isMilestone": false
    },
    {
        "day": 32,
        "title": "32. Gün Usta Kaptan Hediyesi",
        "icon": "⭐",
        "tier": 2,
        "cash": 46000,
        "xp": 3050,
        "treasury": 112500,
        "fuel": 64,
        "hgs": 405,
        "desc": "Kişisel cüzdana +46.000 ₺, +3.050 XP, şirket kasasına +112.500 ₺, +64 L mazot ve +405 ₺ HGS otoyol bakiyesi.",
        "isMilestone": false
    },
    {
        "day": 33,
        "title": "33. Gün Usta Kaptan Hediyesi",
        "icon": "⭐",
        "tier": 2,
        "cash": 49000,
        "xp": 3200,
        "treasury": 120000,
        "fuel": 66,
        "hgs": 420,
        "desc": "Kişisel cüzdana +49.000 ₺, +3.200 XP, şirket kasasına +120.000 ₺, +66 L mazot ve +420 ₺ HGS otoyol bakiyesi.",
        "isMilestone": false
    },
    {
        "day": 34,
        "title": "34. Gün Usta Kaptan Hediyesi",
        "icon": "⭐",
        "tier": 2,
        "cash": 52000,
        "xp": 3350,
        "treasury": 127500,
        "fuel": 68,
        "hgs": 435,
        "desc": "Kişisel cüzdana +52.000 ₺, +3.350 XP, şirket kasasına +127.500 ₺, +68 L mazot ve +435 ₺ HGS otoyol bakiyesi.",
        "isMilestone": false
    },
    {
        "day": 35,
        "title": "35. Gün Usta Kaptan Hediyesi",
        "icon": "⭐",
        "tier": 2,
        "cash": 55000,
        "xp": 3500,
        "treasury": 135000,
        "fuel": 70,
        "hgs": 450,
        "desc": "Kişisel cüzdana +55.000 ₺, +3.500 XP, şirket kasasına +135.000 ₺, +70 L mazot ve +450 ₺ HGS otoyol bakiyesi.",
        "isMilestone": false
    },
    {
        "day": 36,
        "title": "36. Gün Usta Kaptan Hediyesi",
        "icon": "⭐",
        "tier": 2,
        "cash": 58000,
        "xp": 3650,
        "treasury": 142500,
        "fuel": 72,
        "hgs": 465,
        "desc": "Kişisel cüzdana +58.000 ₺, +3.650 XP, şirket kasasına +142.500 ₺, +72 L mazot ve +465 ₺ HGS otoyol bakiyesi.",
        "isMilestone": false
    },
    {
        "day": 37,
        "title": "37. Gün Usta Kaptan Hediyesi",
        "icon": "⭐",
        "tier": 2,
        "cash": 61000,
        "xp": 3800,
        "treasury": 150000,
        "fuel": 74,
        "hgs": 480,
        "desc": "Kişisel cüzdana +61.000 ₺, +3.800 XP, şirket kasasına +150.000 ₺, +74 L mazot ve +480 ₺ HGS otoyol bakiyesi.",
        "isMilestone": false
    },
    {
        "day": 38,
        "title": "38. Gün Usta Kaptan Hediyesi",
        "icon": "⭐",
        "tier": 2,
        "cash": 64000,
        "xp": 3950,
        "treasury": 157500,
        "fuel": 76,
        "hgs": 495,
        "desc": "Kişisel cüzdana +64.000 ₺, +3.950 XP, şirket kasasına +157.500 ₺, +76 L mazot ve +495 ₺ HGS otoyol bakiyesi.",
        "isMilestone": false
    },
    {
        "day": 39,
        "title": "39. Gün Usta Kaptan Hediyesi",
        "icon": "⭐",
        "tier": 2,
        "cash": 67000,
        "xp": 4100,
        "treasury": 165000,
        "fuel": 78,
        "hgs": 510,
        "desc": "Kişisel cüzdana +67.000 ₺, +4.100 XP, şirket kasasına +165.000 ₺, +78 L mazot ve +510 ₺ HGS otoyol bakiyesi.",
        "isMilestone": false
    },
    {
        "day": 40,
        "title": "40. Gün Usta Kaptan Hediyesi",
        "icon": "⭐",
        "tier": 2,
        "cash": 70000,
        "xp": 4250,
        "treasury": 172500,
        "fuel": 80,
        "hgs": 525,
        "desc": "Kişisel cüzdana +70.000 ₺, +4.250 XP, şirket kasasına +172.500 ₺, +80 L mazot ve +525 ₺ HGS otoyol bakiyesi.",
        "isMilestone": false
    },
    {
        "day": 41,
        "title": "41. Gün Usta Kaptan Hediyesi",
        "icon": "⭐",
        "tier": 3,
        "cash": 73000,
        "xp": 4400,
        "treasury": 180000,
        "fuel": 82,
        "hgs": 540,
        "desc": "Kişisel cüzdana +73.000 ₺, +4.400 XP, şirket kasasına +180.000 ₺, +82 L mazot ve +540 ₺ HGS otoyol bakiyesi.",
        "isMilestone": false
    },
    {
        "day": 42,
        "title": "42. Gün Usta Kaptan Hediyesi",
        "icon": "⭐",
        "tier": 3,
        "cash": 76000,
        "xp": 4550,
        "treasury": 187500,
        "fuel": 84,
        "hgs": 555,
        "desc": "Kişisel cüzdana +76.000 ₺, +4.550 XP, şirket kasasına +187.500 ₺, +84 L mazot ve +555 ₺ HGS otoyol bakiyesi.",
        "isMilestone": false
    },
    {
        "day": 43,
        "title": "43. Gün Usta Kaptan Hediyesi",
        "icon": "⭐",
        "tier": 3,
        "cash": 79000,
        "xp": 4700,
        "treasury": 195000,
        "fuel": 86,
        "hgs": 570,
        "desc": "Kişisel cüzdana +79.000 ₺, +4.700 XP, şirket kasasına +195.000 ₺, +86 L mazot ve +570 ₺ HGS otoyol bakiyesi.",
        "isMilestone": false
    },
    {
        "day": 44,
        "title": "44. Gün Usta Kaptan Hediyesi",
        "icon": "⭐",
        "tier": 3,
        "cash": 82000,
        "xp": 4850,
        "treasury": 202500,
        "fuel": 88,
        "hgs": 585,
        "desc": "Kişisel cüzdana +82.000 ₺, +4.850 XP, şirket kasasına +202.500 ₺, +88 L mazot ve +585 ₺ HGS otoyol bakiyesi.",
        "isMilestone": false
    },
    {
        "day": 45,
        "title": "45. Gün Usta Kaptan Hediyesi",
        "icon": "⭐",
        "tier": 3,
        "cash": 85000,
        "xp": 5000,
        "treasury": 210000,
        "fuel": 90,
        "hgs": 600,
        "desc": "Kişisel cüzdana +85.000 ₺, +5.000 XP, şirket kasasına +210.000 ₺, +90 L mazot ve +600 ₺ HGS otoyol bakiyesi.",
        "isMilestone": false
    },
    {
        "day": 46,
        "title": "46. Gün Usta Kaptan Hediyesi",
        "icon": "⭐",
        "tier": 3,
        "cash": 88000,
        "xp": 5150,
        "treasury": 217500,
        "fuel": 92,
        "hgs": 615,
        "desc": "Kişisel cüzdana +88.000 ₺, +5.150 XP, şirket kasasına +217.500 ₺, +92 L mazot ve +615 ₺ HGS otoyol bakiyesi.",
        "isMilestone": false
    },
    {
        "day": 47,
        "title": "47. Gün Usta Kaptan Hediyesi",
        "icon": "⭐",
        "tier": 3,
        "cash": 91000,
        "xp": 5300,
        "treasury": 225000,
        "fuel": 94,
        "hgs": 630,
        "desc": "Kişisel cüzdana +91.000 ₺, +5.300 XP, şirket kasasına +225.000 ₺, +94 L mazot ve +630 ₺ HGS otoyol bakiyesi.",
        "isMilestone": false
    },
    {
        "day": 48,
        "title": "48. Gün Usta Kaptan Hediyesi",
        "icon": "⭐",
        "tier": 3,
        "cash": 94000,
        "xp": 5450,
        "treasury": 232500,
        "fuel": 96,
        "hgs": 645,
        "desc": "Kişisel cüzdana +94.000 ₺, +5.450 XP, şirket kasasına +232.500 ₺, +96 L mazot ve +645 ₺ HGS otoyol bakiyesi.",
        "isMilestone": false
    },
    {
        "day": 49,
        "title": "49. Gün Usta Kaptan Hediyesi",
        "icon": "⭐",
        "tier": 3,
        "cash": 97000,
        "xp": 5600,
        "treasury": 240000,
        "fuel": 98,
        "hgs": 660,
        "desc": "Kişisel cüzdana +97.000 ₺, +5.600 XP, şirket kasasına +240.000 ₺, +98 L mazot ve +660 ₺ HGS otoyol bakiyesi.",
        "isMilestone": false
    },
    {
        "day": 50,
        "title": "50. Gün Yarı Yol Zirvesi",
        "icon": "🏆",
        "tier": 3,
        "cash": 250000,
        "xp": 10000,
        "treasury": 500000,
        "fuel": 100,
        "hgs": 500,
        "desc": "Kişisel cüzdana +250.000 ₺, +10.000 XP, şirket kasasına +500.000 ₺, +100 L mazot ve +500 ₺ HGS otoyol bakiyesi.",
        "isMilestone": true
    },
    {
        "day": 51,
        "title": "51. Gün Filo Büyüme Ödülü",
        "icon": "🔥",
        "tier": 3,
        "cash": 116000,
        "xp": 6500,
        "treasury": 280000,
        "fuel": 78,
        "hgs": 625,
        "desc": "Kişisel cüzdana +116.000 ₺, +6.500 XP, şirket kasasına +280.000 ₺, +78 L mazot ve +625 ₺ HGS otoyol bakiyesi.",
        "isMilestone": false
    },
    {
        "day": 52,
        "title": "52. Gün Filo Büyüme Ödülü",
        "icon": "🔥",
        "tier": 3,
        "cash": 132000,
        "xp": 7000,
        "treasury": 310000,
        "fuel": 81,
        "hgs": 650,
        "desc": "Kişisel cüzdana +132.000 ₺, +7.000 XP, şirket kasasına +310.000 ₺, +81 L mazot ve +650 ₺ HGS otoyol bakiyesi.",
        "isMilestone": false
    },
    {
        "day": 53,
        "title": "53. Gün Filo Büyüme Ödülü",
        "icon": "🔥",
        "tier": 3,
        "cash": 148000,
        "xp": 7500,
        "treasury": 340000,
        "fuel": 84,
        "hgs": 675,
        "desc": "Kişisel cüzdana +148.000 ₺, +7.500 XP, şirket kasasına +340.000 ₺, +84 L mazot ve +675 ₺ HGS otoyol bakiyesi.",
        "isMilestone": false
    },
    {
        "day": 54,
        "title": "54. Gün Filo Büyüme Ödülü",
        "icon": "🔥",
        "tier": 3,
        "cash": 164000,
        "xp": 8000,
        "treasury": 370000,
        "fuel": 87,
        "hgs": 700,
        "desc": "Kişisel cüzdana +164.000 ₺, +8.000 XP, şirket kasasına +370.000 ₺, +87 L mazot ve +700 ₺ HGS otoyol bakiyesi.",
        "isMilestone": false
    },
    {
        "day": 55,
        "title": "55. Gün Filo Büyüme Ödülü",
        "icon": "🔥",
        "tier": 3,
        "cash": 180000,
        "xp": 8500,
        "treasury": 400000,
        "fuel": 90,
        "hgs": 725,
        "desc": "Kişisel cüzdana +180.000 ₺, +8.500 XP, şirket kasasına +400.000 ₺, +90 L mazot ve +725 ₺ HGS otoyol bakiyesi.",
        "isMilestone": false
    },
    {
        "day": 56,
        "title": "56. Gün Filo Büyüme Ödülü",
        "icon": "🔥",
        "tier": 3,
        "cash": 196000,
        "xp": 9000,
        "treasury": 430000,
        "fuel": 93,
        "hgs": 750,
        "desc": "Kişisel cüzdana +196.000 ₺, +9.000 XP, şirket kasasına +430.000 ₺, +93 L mazot ve +750 ₺ HGS otoyol bakiyesi.",
        "isMilestone": false
    },
    {
        "day": 57,
        "title": "57. Gün Filo Büyüme Ödülü",
        "icon": "🔥",
        "tier": 3,
        "cash": 212000,
        "xp": 9500,
        "treasury": 460000,
        "fuel": 96,
        "hgs": 775,
        "desc": "Kişisel cüzdana +212.000 ₺, +9.500 XP, şirket kasasına +460.000 ₺, +96 L mazot ve +775 ₺ HGS otoyol bakiyesi.",
        "isMilestone": false
    },
    {
        "day": 58,
        "title": "58. Gün Filo Büyüme Ödülü",
        "icon": "🔥",
        "tier": 3,
        "cash": 228000,
        "xp": 10000,
        "treasury": 490000,
        "fuel": 99,
        "hgs": 800,
        "desc": "Kişisel cüzdana +228.000 ₺, +10.000 XP, şirket kasasına +490.000 ₺, +99 L mazot ve +800 ₺ HGS otoyol bakiyesi.",
        "isMilestone": false
    },
    {
        "day": 59,
        "title": "59. Gün Filo Büyüme Ödülü",
        "icon": "🔥",
        "tier": 3,
        "cash": 244000,
        "xp": 10500,
        "treasury": 520000,
        "fuel": 102,
        "hgs": 825,
        "desc": "Kişisel cüzdana +244.000 ₺, +10.500 XP, şirket kasasına +520.000 ₺, +102 L mazot ve +825 ₺ HGS otoyol bakiyesi.",
        "isMilestone": false
    },
    {
        "day": 60,
        "title": "60. Gün Filo Büyüme Ödülü",
        "icon": "🔥",
        "tier": 3,
        "cash": 260000,
        "xp": 11000,
        "treasury": 550000,
        "fuel": 105,
        "hgs": 850,
        "desc": "Kişisel cüzdana +260.000 ₺, +11.000 XP, şirket kasasına +550.000 ₺, +105 L mazot ve +850 ₺ HGS otoyol bakiyesi.",
        "isMilestone": false
    },
    {
        "day": 61,
        "title": "61. Gün Filo Büyüme Ödülü",
        "icon": "🔥",
        "tier": 4,
        "cash": 276000,
        "xp": 11500,
        "treasury": 580000,
        "fuel": 108,
        "hgs": 875,
        "desc": "Kişisel cüzdana +276.000 ₺, +11.500 XP, şirket kasasına +580.000 ₺, +108 L mazot ve +875 ₺ HGS otoyol bakiyesi.",
        "isMilestone": false
    },
    {
        "day": 62,
        "title": "62. Gün Filo Büyüme Ödülü",
        "icon": "🔥",
        "tier": 4,
        "cash": 292000,
        "xp": 12000,
        "treasury": 610000,
        "fuel": 111,
        "hgs": 900,
        "desc": "Kişisel cüzdana +292.000 ₺, +12.000 XP, şirket kasasına +610.000 ₺, +111 L mazot ve +900 ₺ HGS otoyol bakiyesi.",
        "isMilestone": false
    },
    {
        "day": 63,
        "title": "63. Gün Filo Büyüme Ödülü",
        "icon": "🔥",
        "tier": 4,
        "cash": 308000,
        "xp": 12500,
        "treasury": 640000,
        "fuel": 114,
        "hgs": 925,
        "desc": "Kişisel cüzdana +308.000 ₺, +12.500 XP, şirket kasasına +640.000 ₺, +114 L mazot ve +925 ₺ HGS otoyol bakiyesi.",
        "isMilestone": false
    },
    {
        "day": 64,
        "title": "64. Gün Filo Büyüme Ödülü",
        "icon": "🔥",
        "tier": 4,
        "cash": 324000,
        "xp": 13000,
        "treasury": 670000,
        "fuel": 117,
        "hgs": 950,
        "desc": "Kişisel cüzdana +324.000 ₺, +13.000 XP, şirket kasasına +670.000 ₺, +117 L mazot ve +950 ₺ HGS otoyol bakiyesi.",
        "isMilestone": false
    },
    {
        "day": 65,
        "title": "65. Gün Filo Büyüme Ödülü",
        "icon": "🔥",
        "tier": 4,
        "cash": 340000,
        "xp": 13500,
        "treasury": 700000,
        "fuel": 120,
        "hgs": 975,
        "desc": "Kişisel cüzdana +340.000 ₺, +13.500 XP, şirket kasasına +700.000 ₺, +120 L mazot ve +975 ₺ HGS otoyol bakiyesi.",
        "isMilestone": false
    },
    {
        "day": 66,
        "title": "66. Gün Filo Büyüme Ödülü",
        "icon": "🔥",
        "tier": 4,
        "cash": 356000,
        "xp": 14000,
        "treasury": 730000,
        "fuel": 123,
        "hgs": 1000,
        "desc": "Kişisel cüzdana +356.000 ₺, +14.000 XP, şirket kasasına +730.000 ₺, +123 L mazot ve +1000 ₺ HGS otoyol bakiyesi.",
        "isMilestone": false
    },
    {
        "day": 67,
        "title": "67. Gün Filo Büyüme Ödülü",
        "icon": "🔥",
        "tier": 4,
        "cash": 372000,
        "xp": 14500,
        "treasury": 760000,
        "fuel": 126,
        "hgs": 1025,
        "desc": "Kişisel cüzdana +372.000 ₺, +14.500 XP, şirket kasasına +760.000 ₺, +126 L mazot ve +1025 ₺ HGS otoyol bakiyesi.",
        "isMilestone": false
    },
    {
        "day": 68,
        "title": "68. Gün Filo Büyüme Ödülü",
        "icon": "🔥",
        "tier": 4,
        "cash": 388000,
        "xp": 15000,
        "treasury": 790000,
        "fuel": 129,
        "hgs": 1050,
        "desc": "Kişisel cüzdana +388.000 ₺, +15.000 XP, şirket kasasına +790.000 ₺, +129 L mazot ve +1050 ₺ HGS otoyol bakiyesi.",
        "isMilestone": false
    },
    {
        "day": 69,
        "title": "69. Gün Filo Büyüme Ödülü",
        "icon": "🔥",
        "tier": 4,
        "cash": 404000,
        "xp": 15500,
        "treasury": 820000,
        "fuel": 132,
        "hgs": 1075,
        "desc": "Kişisel cüzdana +404.000 ₺, +15.500 XP, şirket kasasına +820.000 ₺, +132 L mazot ve +1075 ₺ HGS otoyol bakiyesi.",
        "isMilestone": false
    },
    {
        "day": 70,
        "title": "70. Gün Filo Büyüme Ödülü",
        "icon": "🔥",
        "tier": 4,
        "cash": 420000,
        "xp": 16000,
        "treasury": 850000,
        "fuel": 135,
        "hgs": 1100,
        "desc": "Kişisel cüzdana +420.000 ₺, +16.000 XP, şirket kasasına +850.000 ₺, +135 L mazot ve +1100 ₺ HGS otoyol bakiyesi.",
        "isMilestone": false
    },
    {
        "day": 71,
        "title": "71. Gün Filo Büyüme Ödülü",
        "icon": "🔥",
        "tier": 4,
        "cash": 436000,
        "xp": 16500,
        "treasury": 880000,
        "fuel": 138,
        "hgs": 1125,
        "desc": "Kişisel cüzdana +436.000 ₺, +16.500 XP, şirket kasasına +880.000 ₺, +138 L mazot ve +1125 ₺ HGS otoyol bakiyesi.",
        "isMilestone": false
    },
    {
        "day": 72,
        "title": "72. Gün Filo Büyüme Ödülü",
        "icon": "🔥",
        "tier": 4,
        "cash": 452000,
        "xp": 17000,
        "treasury": 910000,
        "fuel": 141,
        "hgs": 1150,
        "desc": "Kişisel cüzdana +452.000 ₺, +17.000 XP, şirket kasasına +910.000 ₺, +141 L mazot ve +1150 ₺ HGS otoyol bakiyesi.",
        "isMilestone": false
    },
    {
        "day": 73,
        "title": "73. Gün Filo Büyüme Ödülü",
        "icon": "🔥",
        "tier": 4,
        "cash": 468000,
        "xp": 17500,
        "treasury": 940000,
        "fuel": 144,
        "hgs": 1175,
        "desc": "Kişisel cüzdana +468.000 ₺, +17.500 XP, şirket kasasına +940.000 ₺, +144 L mazot ve +1175 ₺ HGS otoyol bakiyesi.",
        "isMilestone": false
    },
    {
        "day": 74,
        "title": "74. Gün Filo Büyüme Ödülü",
        "icon": "🔥",
        "tier": 4,
        "cash": 484000,
        "xp": 18000,
        "treasury": 970000,
        "fuel": 147,
        "hgs": 1200,
        "desc": "Kişisel cüzdana +484.000 ₺, +18.000 XP, şirket kasasına +970.000 ₺, +147 L mazot ve +1200 ₺ HGS otoyol bakiyesi.",
        "isMilestone": false
    },
    {
        "day": 75,
        "title": "75. Gün Karayolları Lideri Paketi",
        "icon": "🌟",
        "tier": 4,
        "cash": 750000,
        "xp": 25000,
        "treasury": 1500000,
        "fuel": 150,
        "hgs": 1000,
        "desc": "Kişisel cüzdana +750.000 ₺, +25.000 XP, şirket kasasına +1.500.000 ₺, +150 L mazot ve +1000 ₺ HGS otoyol bakiyesi.",
        "isMilestone": true
    },
    {
        "day": 76,
        "title": "76. Gün Holding Desteği",
        "icon": "⚡",
        "tier": 4,
        "cash": 540000,
        "xp": 21000,
        "treasury": 1120000,
        "fuel": 124,
        "hgs": 1240,
        "desc": "Kişisel cüzdana +540.000 ₺, +21.000 XP, şirket kasasına +1.120.000 ₺, +124 L mazot ve +1240 ₺ HGS otoyol bakiyesi.",
        "isMilestone": false
    },
    {
        "day": 77,
        "title": "77. Gün Holding Desteği",
        "icon": "⚡",
        "tier": 4,
        "cash": 580000,
        "xp": 22000,
        "treasury": 1240000,
        "fuel": 128,
        "hgs": 1280,
        "desc": "Kişisel cüzdana +580.000 ₺, +22.000 XP, şirket kasasına +1.240.000 ₺, +128 L mazot ve +1280 ₺ HGS otoyol bakiyesi.",
        "isMilestone": false
    },
    {
        "day": 78,
        "title": "78. Gün Holding Desteği",
        "icon": "⚡",
        "tier": 4,
        "cash": 620000,
        "xp": 23000,
        "treasury": 1360000,
        "fuel": 132,
        "hgs": 1320,
        "desc": "Kişisel cüzdana +620.000 ₺, +23.000 XP, şirket kasasına +1.360.000 ₺, +132 L mazot ve +1320 ₺ HGS otoyol bakiyesi.",
        "isMilestone": false
    },
    {
        "day": 79,
        "title": "79. Gün Holding Desteği",
        "icon": "⚡",
        "tier": 4,
        "cash": 660000,
        "xp": 24000,
        "treasury": 1480000,
        "fuel": 136,
        "hgs": 1360,
        "desc": "Kişisel cüzdana +660.000 ₺, +24.000 XP, şirket kasasına +1.480.000 ₺, +136 L mazot ve +1360 ₺ HGS otoyol bakiyesi.",
        "isMilestone": false
    },
    {
        "day": 80,
        "title": "80. Gün Holding Desteği",
        "icon": "⚡",
        "tier": 4,
        "cash": 700000,
        "xp": 25000,
        "treasury": 1600000,
        "fuel": 140,
        "hgs": 1400,
        "desc": "Kişisel cüzdana +700.000 ₺, +25.000 XP, şirket kasasına +1.600.000 ₺, +140 L mazot ve +1400 ₺ HGS otoyol bakiyesi.",
        "isMilestone": false
    },
    {
        "day": 81,
        "title": "81. Gün Holding Desteği",
        "icon": "⚡",
        "tier": 5,
        "cash": 740000,
        "xp": 26000,
        "treasury": 1720000,
        "fuel": 144,
        "hgs": 1440,
        "desc": "Kişisel cüzdana +740.000 ₺, +26.000 XP, şirket kasasına +1.720.000 ₺, +144 L mazot ve +1440 ₺ HGS otoyol bakiyesi.",
        "isMilestone": false
    },
    {
        "day": 82,
        "title": "82. Gün Holding Desteği",
        "icon": "⚡",
        "tier": 5,
        "cash": 780000,
        "xp": 27000,
        "treasury": 1840000,
        "fuel": 148,
        "hgs": 1480,
        "desc": "Kişisel cüzdana +780.000 ₺, +27.000 XP, şirket kasasına +1.840.000 ₺, +148 L mazot ve +1480 ₺ HGS otoyol bakiyesi.",
        "isMilestone": false
    },
    {
        "day": 83,
        "title": "83. Gün Holding Desteği",
        "icon": "⚡",
        "tier": 5,
        "cash": 820000,
        "xp": 28000,
        "treasury": 1960000,
        "fuel": 152,
        "hgs": 1520,
        "desc": "Kişisel cüzdana +820.000 ₺, +28.000 XP, şirket kasasına +1.960.000 ₺, +152 L mazot ve +1520 ₺ HGS otoyol bakiyesi.",
        "isMilestone": false
    },
    {
        "day": 84,
        "title": "84. Gün Holding Desteği",
        "icon": "⚡",
        "tier": 5,
        "cash": 860000,
        "xp": 29000,
        "treasury": 2080000,
        "fuel": 156,
        "hgs": 1560,
        "desc": "Kişisel cüzdana +860.000 ₺, +29.000 XP, şirket kasasına +2.080.000 ₺, +156 L mazot ve +1560 ₺ HGS otoyol bakiyesi.",
        "isMilestone": false
    },
    {
        "day": 85,
        "title": "85. Gün Holding Desteği",
        "icon": "⚡",
        "tier": 5,
        "cash": 900000,
        "xp": 30000,
        "treasury": 2200000,
        "fuel": 160,
        "hgs": 1600,
        "desc": "Kişisel cüzdana +900.000 ₺, +30.000 XP, şirket kasasına +2.200.000 ₺, +160 L mazot ve +1600 ₺ HGS otoyol bakiyesi.",
        "isMilestone": false
    },
    {
        "day": 86,
        "title": "86. Gün Holding Desteği",
        "icon": "⚡",
        "tier": 5,
        "cash": 940000,
        "xp": 31000,
        "treasury": 2320000,
        "fuel": 164,
        "hgs": 1640,
        "desc": "Kişisel cüzdana +940.000 ₺, +31.000 XP, şirket kasasına +2.320.000 ₺, +164 L mazot ve +1640 ₺ HGS otoyol bakiyesi.",
        "isMilestone": false
    },
    {
        "day": 87,
        "title": "87. Gün Holding Desteği",
        "icon": "⚡",
        "tier": 5,
        "cash": 980000,
        "xp": 32000,
        "treasury": 2440000,
        "fuel": 168,
        "hgs": 1680,
        "desc": "Kişisel cüzdana +980.000 ₺, +32.000 XP, şirket kasasına +2.440.000 ₺, +168 L mazot ve +1680 ₺ HGS otoyol bakiyesi.",
        "isMilestone": false
    },
    {
        "day": 88,
        "title": "88. Gün Holding Desteği",
        "icon": "⚡",
        "tier": 5,
        "cash": 1020000,
        "xp": 33000,
        "treasury": 2560000,
        "fuel": 172,
        "hgs": 1720,
        "desc": "Kişisel cüzdana +1.020.000 ₺, +33.000 XP, şirket kasasına +2.560.000 ₺, +172 L mazot ve +1720 ₺ HGS otoyol bakiyesi.",
        "isMilestone": false
    },
    {
        "day": 89,
        "title": "89. Gün Holding Desteği",
        "icon": "⚡",
        "tier": 5,
        "cash": 1060000,
        "xp": 34000,
        "treasury": 2680000,
        "fuel": 176,
        "hgs": 1760,
        "desc": "Kişisel cüzdana +1.060.000 ₺, +34.000 XP, şirket kasasına +2.680.000 ₺, +176 L mazot ve +1760 ₺ HGS otoyol bakiyesi.",
        "isMilestone": false
    },
    {
        "day": 90,
        "title": "90. Gün Holding Desteği",
        "icon": "⚡",
        "tier": 5,
        "cash": 1100000,
        "xp": 35000,
        "treasury": 2800000,
        "fuel": 180,
        "hgs": 1800,
        "desc": "Kişisel cüzdana +1.100.000 ₺, +35.000 XP, şirket kasasına +2.800.000 ₺, +180 L mazot ve +1800 ₺ HGS otoyol bakiyesi.",
        "isMilestone": false
    },
    {
        "day": 91,
        "title": "91. Gün Holding Desteği",
        "icon": "⚡",
        "tier": 5,
        "cash": 1140000,
        "xp": 36000,
        "treasury": 2920000,
        "fuel": 184,
        "hgs": 1840,
        "desc": "Kişisel cüzdana +1.140.000 ₺, +36.000 XP, şirket kasasına +2.920.000 ₺, +184 L mazot ve +1840 ₺ HGS otoyol bakiyesi.",
        "isMilestone": false
    },
    {
        "day": 92,
        "title": "92. Gün Holding Desteği",
        "icon": "⚡",
        "tier": 5,
        "cash": 1180000,
        "xp": 37000,
        "treasury": 3040000,
        "fuel": 188,
        "hgs": 1880,
        "desc": "Kişisel cüzdana +1.180.000 ₺, +37.000 XP, şirket kasasına +3.040.000 ₺, +188 L mazot ve +1880 ₺ HGS otoyol bakiyesi.",
        "isMilestone": false
    },
    {
        "day": 93,
        "title": "93. Gün Holding Desteği",
        "icon": "⚡",
        "tier": 5,
        "cash": 1220000,
        "xp": 38000,
        "treasury": 3160000,
        "fuel": 192,
        "hgs": 1920,
        "desc": "Kişisel cüzdana +1.220.000 ₺, +38.000 XP, şirket kasasına +3.160.000 ₺, +192 L mazot ve +1920 ₺ HGS otoyol bakiyesi.",
        "isMilestone": false
    },
    {
        "day": 94,
        "title": "94. Gün Holding Desteği",
        "icon": "⚡",
        "tier": 5,
        "cash": 1260000,
        "xp": 39000,
        "treasury": 3280000,
        "fuel": 196,
        "hgs": 1960,
        "desc": "Kişisel cüzdana +1.260.000 ₺, +39.000 XP, şirket kasasına +3.280.000 ₺, +196 L mazot ve +1960 ₺ HGS otoyol bakiyesi.",
        "isMilestone": false
    },
    {
        "day": 95,
        "title": "95. Gün Holding Desteği",
        "icon": "⚡",
        "tier": 5,
        "cash": 1300000,
        "xp": 40000,
        "treasury": 3400000,
        "fuel": 200,
        "hgs": 2000,
        "desc": "Kişisel cüzdana +1.300.000 ₺, +40.000 XP, şirket kasasına +3.400.000 ₺, +200 L mazot ve +2000 ₺ HGS otoyol bakiyesi.",
        "isMilestone": false
    },
    {
        "day": 96,
        "title": "96. Gün Holding Desteği",
        "icon": "⚡",
        "tier": 5,
        "cash": 1340000,
        "xp": 41000,
        "treasury": 3520000,
        "fuel": 204,
        "hgs": 2040,
        "desc": "Kişisel cüzdana +1.340.000 ₺, +41.000 XP, şirket kasasına +3.520.000 ₺, +204 L mazot ve +2040 ₺ HGS otoyol bakiyesi.",
        "isMilestone": false
    },
    {
        "day": 97,
        "title": "97. Gün Holding Desteği",
        "icon": "⚡",
        "tier": 5,
        "cash": 1380000,
        "xp": 42000,
        "treasury": 3640000,
        "fuel": 208,
        "hgs": 2080,
        "desc": "Kişisel cüzdana +1.380.000 ₺, +42.000 XP, şirket kasasına +3.640.000 ₺, +208 L mazot ve +2080 ₺ HGS otoyol bakiyesi.",
        "isMilestone": false
    },
    {
        "day": 98,
        "title": "98. Gün Holding Desteği",
        "icon": "⚡",
        "tier": 5,
        "cash": 1420000,
        "xp": 43000,
        "treasury": 3760000,
        "fuel": 212,
        "hgs": 2120,
        "desc": "Kişisel cüzdana +1.420.000 ₺, +43.000 XP, şirket kasasına +3.760.000 ₺, +212 L mazot ve +2120 ₺ HGS otoyol bakiyesi.",
        "isMilestone": false
    },
    {
        "day": 99,
        "title": "99. Gün Holding Desteği",
        "icon": "⚡",
        "tier": 5,
        "cash": 1460000,
        "xp": 44000,
        "treasury": 3880000,
        "fuel": 216,
        "hgs": 2160,
        "desc": "Kişisel cüzdana +1.460.000 ₺, +44.000 XP, şirket kasasına +3.880.000 ₺, +216 L mazot ve +2160 ₺ HGS otoyol bakiyesi.",
        "isMilestone": false
    },
    {
        "day": 100,
        "title": "100. Gün EFSANE KAPTAN ŞAMPİYONLUK PAKETİ",
        "icon": "👑",
        "tier": 5,
        "cash": 2500000,
        "xp": 50000,
        "treasury": 5000000,
        "fuel": 300,
        "hgs": 2500,
        "desc": "Kişisel cüzdana +2.500.000 ₺, +50.000 XP, şirket kasasına +5.000.000 ₺, +300 L mazot ve +2500 ₺ HGS otoyol bakiyesi.",
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
                const alreadyMsg = "Bugünkü hoş geldin hediyenizi zaten aldınız! Yeni ödülünüz yarın 00:00'da hazır olacak.";
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
                            <div style="padding: 8px 18px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.15); color: #94a3b8; font-weight: bold; border-radius: 8px; font-size: 0.9rem;">
                                ⏳ Bugünkü Ödül Alındı (Yarın ${nextDay}. Gün)
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
                    } else {
                        statusBadge = '<span style="color: #64748b; font-size: 0.8rem; font-weight: bold; background: rgba(255, 255, 255, 0.05); padding: 3px 8px; border-radius: 6px;">🔒 Kilitli</span>';
                    }

                    if (item.isMilestone) {
                        borderStyle = (status === 'claimed') ? '2px solid #eab308' : ((status === 'ready') ? '2px solid #f59e0b' : '1.5px solid rgba(234, 179, 8, 0.4)');
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
                            <span style="font-size: 0.78rem; color: #94a3b8;">
                                ${item.isMilestone ? '⭐ Özel Dönüm Noktası' : 'Günlük Ödül'}
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
