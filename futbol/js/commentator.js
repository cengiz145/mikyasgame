window.generateCommentatorQuote = function(result, scoreDiff) {
    let pool = {
        heavy_win: {
            intro: [
                "Ben böyle bir futbol görmedim kardeşim!", 
                "Tarihi bir şov izledik bu gece.", 
                "Rüya gibi bir maçtı, gözlerimin pası silindi.", 
                "İşte şampiyon takım böyle oynar!", 
                "Muazzam bir performans, tek kelimeyle harika.", 
                "Büyük takımlar böyle oynar, rakibe acımazlar.", 
                "Statta olanlar çok şanslıydı, bir futbol resitali izledik.", 
                "Tüm hafta bu maçı bekledik, değdi doğrusu.", 
                "Kim derdi ki bu kadar rahat geçecek?", 
                "Hocaya helal olsun, takımı bir makineye dönüştürmüş."
            ],
            mid: [
                "Sahada yürümediler, uçtular resmen!", 
                "Rakibe nefes aldırmadılar, ezip geçtiler.", 
                "Taktik olarak rakibi sahadan sildiler.", 
                "Hocanın sistemi tıkır tıkır işledi.", 
                "Her hattan ayrı bir yıldız çıktı bugün.", 
                "Rakip kaleciyi adeta topa tuttular.", 
                "Fizik olarak rakiplerini ezdiler, tempo hiç düşmedi.", 
                "Orta sahayı ele geçirdiler, maçı kopardılar.", 
                "Pas trafiği o kadar hızlıydı ki rakibin başı döndü.", 
                "Bitiricilik konusunda bugün yüzde yüzle oynadılar."
            ],
            outro: [
                "Bu takım bu sene şampiyon olur, net söylüyorum.", 
                "Rakiplerin işi çok zor, bu takımı kimse durduramaz.", 
                "Kupa şimdiden hayırlı olsun, boşuna oynamasınlar.", 
                "Böyle oynamaya devam etsinler, destan yazarlar.", 
                "Yönetimi ve hocayı tebrik etmekten başka diyecek söz yok.", 
                "Bu form grafiği rakiplerin uykusunu kaçıracak.", 
                "Tribünler mest oldu, bu takım alkışı sonuna kadar hak ediyor.", 
                "Bugünkü oyun sadece 3 puan değil, bir gövde gösterisidir.", 
                "Ligin sefiri kim, dosta düşmana gösterdiler.", 
                "Bundan sonra her maçları şölen havasında geçer."
            ]
        },
        win: {
            intro: [
                "Çok net bir galibiyet almasalar da 3 puan 3 puandır.", 
                "Kazanmak bir alışkanlıktır, bugün bunu gördük.", 
                "Zor bir maç oldu ama önemli olan 3 puandı.", 
                "Maçın hakkı buydu, daha fazlası da olabilirdi.", 
                "İzleyenleri tam tatmin etmese de kazanmayı bildiler.", 
                "Bu tür maçları kazanmak şampiyonluk yolunda kritiktir.", 
                "Zaman zaman zorlandılar ama kalitelerini konuşturdular.", 
                "Kilidi açmak kolay olmadı ama becerdiler.", 
                "Gerekeni yaptılar ve istediklerini aldılar.", 
                "Kötü oynarken bile kazanmak büyük takım refleksidir."
            ],
            mid: [
                "Hocanın oyun plan genel hatlarıyla işledi.", 
                "Oraya buraya yatmadılar, aslanlar gibi oynayıp kazandılar.", 
                "Savunmada çok hata yapmadılar, hücumda da fırsatları değerlendirdiler.", 
                "Ortada geçen kısımlar oldu ama tecrübe farkı ortaya çıktı.", 
                "Bireysel yetenekler kilidi açtı.", 
                "Oyunun kontrolünü tam alamasalar da skoru korumayı bildiler.", 
                "Birkaç kritik kurtarış maçın dönüm noktasıydı.", 
                "Hocanın kenardan müdahaleleri zamanında ve yerindeydi.", 
                "Fırsatını bulduklarında cezayı kestiler.", 
                "Rölantide oynayıp istediklerini aldılar."
            ],
            outro: [
                "Önemli olan yola kayıpsız devam etmektir.", 
                "Oyun gelişir ama giden puan geri gelmez, tebrikler.", 
                "Eksikleri hocanın göreceğine eminim, galibiyet güzeldir.", 
                "Bu seri böyle devam ederse şampiyonluk şarkıları başlar.", 
                "Yarın herkes sadece alınan 3 puanı konuşacak.", 
                "Haftayı karlı kapatmak takımın moralini zirveye taşıyacak.", 
                "Eksikler var evet ama kazanan her zaman haklıdır.", 
                "Biraz daha tempoyu artırırlarsa ligi süpürürler.", 
                "Önümüzdeki maçlar için umut veren bir galibiyet.", 
                "Taraftarın yüzü gülüyor, önemli olan da bu."
            ]
        },
        heavy_loss: {
            intro: [
                "Rezillik! Kepazelik!", 
                "Ben bu yaştayım böyle ruhsuz bir takım izlemedim.", 
                "Maçı izlerken saç baş yoldum.", 
                "Böyle bir hezimet kabul edilemez, tam bir skandal!", 
                "Tarihi bir utanç gecesi yaşadık.", 
                "Kelimelerin kifayetsiz kaldığı bir rezalet izledik.", 
                "Büyük takım böyle aciz durumlara düşmez.", 
                "Bu gece ekranda futbol değil, bir korku filmi vardı.", 
                "Yazıklar olsun, o formayı hak etmeyen çok isim var.", 
                "Söylenecek çok şey var ama insan tutulup kalıyor."
            ],
            mid: [
                "Forma ağırlığının farkında değiller, sahada resmen yürüdüler.", 
                "Hoca sınıfta kaldı. Takımı tamamen yanlış hazırlamış.", 
                "Defans evlere şenlik, hücum desen felaket.", 
                "Rakip adeta antrenman maçı yaptı bunlara karşı.", 
                "Ne bir reaksiyon var, ne bir hırs. Tamamen teslim olmuşlar.", 
                "Sahada liderlik yapacak bir tane bile yürekli oyuncu yok.", 
                "Taktik disiplin tamamen kaybolmuş, halı saha takımı gibiler.", 
                "İlk golden sonra takım mental olarak tamamen çöktü.", 
                "Rakibe o kadar boş alan verdiler ki izlerken utandım.", 
                "Hocanın yanlış tercihleri sahada pahalıya patladı."
            ],
            outro: [
                "Bu gece uyku haram bize, utanç verici bir tablo.", 
                "Hoca için tehlike çanları değil, sirenler çalıyor.", 
                "Bu zihniyetle bırakın şampiyonluğu kümeye düşerler.", 
                "Yönetim acil olağanüstü toplanıp hesap sormalı.", 
                "Taraftardan özür dilenmeli, bu skorun bahanesi olmaz.", 
                "Bu enkazı kaldırmak çok zaman alacak.", 
                "Artık kelimelerin bittiği yerdeyiz, radikal kararlar şart.", 
                "Bu hezimet sezonun geri kalanı için büyük bir travma yaratır.", 
                "Hoca yarın istifasını sunarsa kimse şaşırmaz.", 
                "Böyle oynarsanız taraftar sizi o statta yuhalar, kimse kusura bakmasın."
            ]
        },
        loss: {
            intro: [
                "Yazık oldu... Biraz daha gayret etseler puan çıkarırlardı.", 
                "Bugün şans yanımızda değildi ama oynanan futbol da tatmin etmedi.", 
                "Bu mağlubiyet beklenmiyordu, soğuk duş etkisi yarattı.", 
                "Kritik bir virajı dönemediler, üzücü bir kayıp.", 
                "Oyuncuların isteksizliği mağlubiyeti getirdi.", 
                "Puan tablosunda ağır bir yara aldılar.", 
                "Kazanmayı çok da hak edecek bir oyun oynamadılar.", 
                "Beklentilerin altında bir performans sergilediler.", 
                "Ufak tefek hatalar büyük sonuca mal oldu.", 
                "Taraftarı hayal kırıklığına uğratan bir akşam."
            ],
            mid: [
                "Hocanın hamleleri yetersiz kaldı.", 
                "Hücumda çok kısır kaldılar, üretkenlik sıfırdı.", 
                "Savunmadaki bir anlık konsantrasyon kaybı pahalıya patladı.", 
                "Ortada giden maçı kendi hatalarıyla rakibe hediye ettiler.", 
                "Rakip onlardan daha çok istedi ve aldı.", 
                "Son vuruşlardaki beceriksizlik saç baş yoldurdu.", 
                "Taktiksel olarak rakibin planına boyun eğdiler.", 
                "Kanatları hiç kullanamadılar, oyun çok sıkıştı.", 
                "Reaksiyon göstermekte çok geç kaldılar.", 
                "Maç boyu silik bir görüntü çizdiler."
            ],
            outro: [
                "Şapkamızı önümüze koyup düşünme vakti.", 
                "Bu mağlubiyetten ders çıkarmazlarsa işleri zor.", 
                "Hocanın artık mazeret üretmeyi bırakıp çözüm bulması lazım.", 
                "Telafisi olan bir maç ama bu futbol umut vermiyor.", 
                "Kredilerini tüketiyorlar, artık hata yapma lüksleri kalmadı.", 
                "Yönetimin ve hocanın bir durum değerlendirmesi yapması şart.", 
                "Bu geceki oyunla hedefe yürümek çok zor.", 
                "Taraftar sabırlı olur ama sahada mücadele görmek ister.", 
                "Kötü futbolun cezası kesildi, yapacak bir şey yok.", 
                "Artık önümüzdeki maçlara bakıp bu durumu unutturmalılar."
            ]
        },
        draw: {
            intro: [
                "İki takım da korkak oynadı. Ben izlerken uykum geldi.", 
                "Ortada geçen bir maçtı. Ne şiş yandı ne kebap.", 
                "Heyecanı düşük, kısır bir 90 dakika geride kaldı.", 
                "Kimsenin kimseyi yenmeyi hak etmediği bir maçtı.", 
                "Dağ fare doğurdu, büyük beklentiler hüsranla bitti.", 
                "Maçtan ziyade taktik savaşı izledik ama kazanan çıkmadı.", 
                "Golsüz veya sönük geçen bu maç taraftarı sıktı.", 
                "Futbolseverler adına pek keyifli bir akşam olmadı.", 
                "Puanları kardeş payı yaptılar.", 
                "Oyunun hakkı zaten tam olarak beraberlikti."
            ],
            mid: [
                "Biraz risk alın kardeşim, futbol bu!", 
                "İki taraf da önce kaybetmemeyi düşündü.", 
                "Risk almaktan o kadar korktular ki hücuma çıkamadılar.", 
                "Savunmalar sağlam durdu ama hücumcular gününde değildi.", 
                "Ortada bir top dolandı durdu, üretkenlik yoktu.", 
                "Ne bir sürpriz hamle, ne bir heyecan verici şut gördük.", 
                "Tempo o kadar düşüktü ki izlerken sıkıntıdan patladık.", 
                "İki hocanın da birbirini kilitlediği bir satranç maçı oldu.", 
                "Galibiyeti getirecek o ekstra çabayı kimsede göremedik.", 
                "Pozisyon kısırlığı hat safhadaydı."
            ],
            outro: [
                "Bu puan ne uzatır ne kısaltır.", 
                "İki takım da evine 1 puanla dönmekten memnun gibi.", 
                "Bu tür maçları kazanacak bir kilidi açıcı oyuncu şart.", 
                "Haftanın en sıkıcı maçıydı, net.", 
                "Zaman kaybı bir 90 dakika oldu maalesef.", 
                "Böyle maçları kazanmak şampiyonluk yolunda fark yaratır, ikisi de başaramadı.", 
                "Hocalar 1 puanı ceplerine koydu ama futbol adına sıfır çektiler.", 
                "Biraz cesaretli olan bu maçı çok rahat alırdı.", 
                "Taraftar bu futbolu izlemek için o kadar para veriyor, yazık.", 
                "Umarız haftaya daha iştahlı bir futbol izleriz."
            ]
        }
    };
    
    let cat = 'draw';
    if (result === 'win') {
        cat = scoreDiff >= 3 ? 'heavy_win' : 'win';
    } else if (result === 'loss') {
        cat = scoreDiff <= -3 ? 'heavy_loss' : 'loss';
    }
    
    let parts = pool[cat];
    let i = parts.intro[Math.floor(Math.random() * parts.intro.length)];
    let m = parts.mid[Math.floor(Math.random() * parts.mid.length)];
    let o = parts.outro[Math.floor(Math.random() * parts.outro.length)];
    
    return i + " " + m + " " + o;
};

window.generateMatchCommentary = function(eventType) {
    let pool = {
        objection_warning: {
            intro: [
                "Saha kenarında tansiyon yükseldi,", 
                "Menajer adeta çıldırdı,", 
                "Yedek kulübesi ayakta,",
                "Hoca çizgiyi terk edip isyan etti,"
            ],
            mid: [
                "dördüncü hakem araya girmek zorunda kaldı.", 
                "hakem parmağıyla 'yerine geç' işareti yaptı.", 
                "ancak hakem sadece sözlü olarak uyarmayı tercih etti.",
                "orta hakem oyunu durdurup kenara kadar geldi."
            ],
            outro: [
                "Bir dahakine kart çıkabilir!", 
                "Şimdilik ucuz atlattılar.", 
                "Tansiyonun düşmesi lazım.",
                "Oyun kaldığı yerden devam ediyor."
            ]
        },
        objection_yellow: {
            intro: [
                "İtirazlar haddini aştı,", 
                "Saha kenarındaki öfke patlaması pahalıya mal oldu,", 
                "Hakemin sabrı taştı,"
            ],
            mid: [
                "ve hakem tereddütsüz sarı kartını çıkardı.", 
                "kenara gelerek hocaya sarı kart gösterdi.", 
                "dördüncü hakemin uyarısıyla sarı kart geldi."
            ],
            outro: [
                "Artık çok daha dikkatli olmaları lazım.", 
                "Sınırda dolaşıyorlar, bir sonraki hamle kırmızı olabilir.", 
                "Umarım bu kart teknik heyeti biraz sakinleştirir."
            ]
        },
        objection_red: {
            intro: [
                "İnanılmaz anlar yaşanıyor!", 
                "Saha kenarı adeta savaş alanına döndü!", 
                "Skandal bir an!"
            ],
            mid: [
                "Hakem direkt kırmızı kartını çıkardı ve hocayı tribüne gönderdi!", 
                "İpler tamamen koptu, kırmızı kart çıktı!", 
                "Hakem acımadı, kırmızı kartla menajeri cezalandırdı."
            ],
            outro: [
                "Takım artık başkansız, işleri çok zor.", 
                "Bu ceza sadece maçı değil, kulübün kasasını da etkileyecek.", 
                "Oyun disiplini tamamen kaybolabilir."
            ]
        },
        var_cancel: {
            intro: [
                "Şiddetli itirazlar sonuç verdi!", 
                "Ortalık karıştı, hakem VAR'a gitti!", 
                "VAR odasından uyarı geldi!"
            ],
            mid: [
                "Monitörde izledikten sonra golü iptal etti!", 
                "Golden önceki faulü tespit etti ve golü geçersiz saydı!", 
                "Büyük bir hatadan dönüldü, gol iptal!"
            ],
            outro: [
                "Taraftar adeta çıldırdı, muazzam bir sevinç var!", 
                "Hocanın itirazı maçın kaderini değiştirdi.", 
                "Bu karar maça yeni bir heyecan getirecek."
            ]
        },
        var_reject: {
            intro: [
                "İtirazlar üzerine VAR kontrolü yapıldı,", 
                "Hakem telsizden uzun süre dinledi,", 
                "VAR odasıyla kısa bir görüşme gerçekleşti,"
            ],
            mid: [
                "ancak karar değişmedi, gol geçerli.", 
                "ve hakem santrayı gösterdi, itirazlar yersiz.", 
                "görünüşe göre hakemin kararı doğru."
            ],
            outro: [
                "Buna rağmen itirazlar bitmek bilmiyor.", 
                "Hoca bu karara çok sinirlendi ama yapacak bir şey yok.", 
                "Oyun bu golden sonra çok farklı bir hal alacak."
            ]
        },
        team_motivated: {
            intro: [
                "Saha kenarındaki bu hırs", 
                "Hocanın kendisini feda etmesi", 
                "Menajerin bu agresif tavrı"
            ],
            mid: [
                "takım oyuncularına ilham verdi!", 
                "sahadaki futbolcuları adeta uyandırdı!", 
                "takımı bir anda ateşledi!"
            ],
            outro: [
                "Şimdi sahada çok daha motive bir takım göreceğiz.", 
                "Bu bir taktik miydi bilinmez ama işe yaradığı kesin.", 
                "Futbolcular şimdi hocaları için savaşacak."
            ]
        },
        cooldown: {
            intro: [
                "Hoca yine itiraz ediyor ama", 
                "Saha kenarından sesler yükseliyor fakat", 
                "Yine bir gerginlik var ama"
            ],
            mid: [
                "hakem oralı bile olmadı.", 
                "şu an kimse onu dinlemiyor.", 
                "dördüncü hakem yüzünü çevirdi."
            ],
            outro: [
                "Sürekli itiraz etmek de bir yere kadar.", 
                "Biraz sakinleşmesi gerekiyor.", 
                "Hakemin de bir sabrı var."
            ]
        }
    };

    if (!pool[eventType]) return "Bilinmeyen bir maç olayı yaşandı.";

    let parts = pool[eventType];
    let i = parts.intro[Math.floor(Math.random() * parts.intro.length)];
    let m = parts.mid[Math.floor(Math.random() * parts.mid.length)];
    let o = parts.outro[Math.floor(Math.random() * parts.outro.length)];
    
    return i + " " + m + " " + o;
};

window.generateAssistantAnalysis = function(minute, diff, psych) {
    let intros = [];
    let mids = [];
    let outros = [];

    // 1. Zaman (Intro)
    if (minute <= 15) {
        intros = [
            "Hocam henüz maçın başlarındayız,",
            "Karşılaşmaya yeni başladık,",
            "Daha takımlar birbirini tartıyor,",
            "Henüz yorulmadık, enerjimiz yerinde,"
        ];
    } else if (minute <= 45) {
        intros = [
            "İlk yarının ortalarını geçiyoruz,",
            "Devre arası yaklaşırken,",
            "İlk yarıda oyun yavaş yavaş şekilleniyor,",
            "Hocam ilk yarının bitmesine az kaldı,"
        ];
    } else if (minute <= 75) {
        intros = [
            "İkinci yarıdayız, zaman daralıyor,",
            "Maçın son bölümüne doğru yaklaşıyoruz,",
            "Artık yorgunluk belirtileri başlamış olabilir,",
            "Hocam kritik dakikalara giriyoruz,"
        ];
    } else {
        intros = [
            "Maçta artık son anlar!",
            "Son düdük gelmek üzere,",
            "Uzatmalara yaklaşırken nefesler tutuldu,",
            "Hocam artık köprüden önceki son çıkış,"
        ];
    }

    // 2. Skor Farkı (Mid)
    if (diff > 1) {
        mids = [
            "skor avantajımız çok net, rahat bir oyun sergiliyoruz.",
            "rakibi adeta sahadan sildik, işler tıkırında.",
            "iki farklı öndeyiz, rölantiye alıp top çevirebiliriz.",
            "rahat bir skorla öndeyiz, rakip iyice oyundan düştü."
        ];
    } else if (diff === 1) {
        mids = [
            "öndeyiz ama tek farklı skor her zaman tehlikelidir.",
            "avantaj bizde ancak rakip her an beraberliği bulabilir.",
            "skoru koruyoruz fakat biraz daha gol arayıp fişi çekmeliyiz.",
            "üstünüz ama bir gol daha bulursak çok rahatlayacağız."
        ];
    } else if (diff === 0) {
        mids = [
            "durum berabere, maç adeta ortada geçiyor.",
            "henüz eşitlik bozulmadı, ilk golü atan büyük avantaj sağlar.",
            "skor dengede, ufak bir taktik değişiklikle kilidi açabiliriz.",
            "beraberlik sürüyor, iki takım da risk almaktan kaçınıyor."
        ];
    } else if (diff === -1) {
        mids = [
            "gerideyiz, beraberlik golü için daha fazla baskı yapmalıyız.",
            "bir gol gerideyiz ama oyunu çevirecek gücümüz var.",
            "maalesef mağlup durumdayız, biraz daha risk alma vakti geldi.",
            "skor aleyhimize ancak hala maça ortak olabiliriz."
        ];
    } else { // diff < -1
        mids = [
            "farklı gerideyiz, işimiz gerçekten mucizelere kaldı.",
            "rakip bizi adeta bozguna uğratıyor, toparlanmamız çok zor.",
            "fark çok açıldı, bari onurumuz için bir gol bulalım.",
            "çok kötü durumdayız, sistem tamamen çökmüş gibi."
        ];
    }

    // 3. Moral (Outro)
    if (psych === 'motivated') {
        outros = [
            "Ayrıca çocukların hırsı gözlerinden okunuyor, harika bir reaksiyon gösteriyorlar!",
            "Takımın morali zirvede, bu inançla her şeyi yapabilirler.",
            "Oyuncuların sahadaki motivasyonu çok iyi, hocaları için savaşıyorlar adeta.",
            "Mücadele güçleri çok yüksek, takımdaki bu enerjiye güvenebiliriz."
        ];
    } else if (psych === 'chaos') {
        outros = [
            "Ancak takımın psikolojisi çökmüş durumda, sahada panik havası var, acil müdahale şart!",
            "Ne yazık ki oyuncuların morali çok bozuk, adeta maçı kafada bitirmişler.",
            "Takım içi kaos var, birbirlerine bağırıyorlar, kenardan onları toparlaman lazım!",
            "Sahada disiplin tamamen kayboldu, psikolojik olarak bitik durumdayız."
        ];
    } else { // neutral or undefined
        outros = [
            "Takımın morali şimdilik stabil, ne çok coşkulu ne de panik halindeler.",
            "Oyuncular oyun planına sadık kalmaya çalışıyor, ekstra bir reaksiyon yok.",
            "Duygusal anlamda nötr durumdayız, kenardan vereceğiniz tepkiler onları ateşleyebilir.",
            "Fiziksel olarak sahadalar ama biraz daha agresifliğe ihtiyacımız olabilir."
        ];
    }

    let i = intros[Math.floor(Math.random() * intros.length)];
    let m = mids[Math.floor(Math.random() * mids.length)];
    let o = outros[Math.floor(Math.random() * outros.length)];

    return i + " " + m + " " + o;
};
