// psychologist.js - Otonom Spor Psikoloğu ve Revir İşlemleri

document.addEventListener("DOMContentLoaded", () => {
    let psychologyQueue = [];

    // Revir ekranını açarken doktor verilerini yükleme
    
    function getTreatmentStage(desc, weeksLeft) {
        if (desc.includes("Çapraz Bağ") || desc.includes("Aşil")) {
            if (weeksLeft > 20) return "Ameliyat tamamlandı. Atel/Alçı ile mutlak istirahat ve yatak istirahati evresi.";
            if (weeksLeft > 12) return "Atel çıkarıldı. Kinesiyoterapi ve su içi düşük ağırlıklı yürüyüşlere başlandı.";
            if (weeksLeft > 6) return "İzokinetik makine testleri ve düz zemin hafif tempolu koşular.";
            if (weeksLeft > 2) return "Topsuz bireysel antrenmanlar ve yön değiştirme testleri yapılıyor.";
            return "Takımla birlikte kontrollü top çalışmalarına (ısınma bölümü) katılıyor. Yakında sahada.";
        }
        else if (desc.includes("Kırığı")) {
            if (weeksLeft > 10) return "Kemik kaynama süreci bekleniyor. Tam alçı/atel sabitlemesi.";
            if (weeksLeft > 4) return "Alçı alındı, kemik yoğunluğu test ediliyor. Hafif yük bindirmeler başladı.";
            if (weeksLeft > 1) return "Fizik tedavi eşliğinde eklem açma egzersizleri ve kondisyon bisikleti.";
            return "Kemiğin tamamen kaynadığı doğrulandı. Takımla çalışmalara başladı.";
        }
        else if (desc.includes("Menisküs") || desc.includes("Pubis")) {
            if (weeksLeft > 8) return "Cerrahi müdahale sonrası yoğun ödem atma ve buz tedavisi aşaması.";
            if (weeksLeft > 4) return "Ödem tamamen indi. Esneklik kazanma ve core (merkez) kasları güçlendirme.";
            if (weeksLeft > 1) return "Tesislerde bireysel koşular ve kondisyoner eşliğinde dayanıklılık antrenmanı.";
            return "Tam kapasite idmanlara çıkmaya hazır.";
        }
        else {
            // Standart kas yırtıkları ve burkulmalar
            if (weeksLeft > 4) return "Yoğun PRP iğneleri ve derin doku ultrasonik tedavisi devam ediyor.";
            if (weeksLeft > 2) return "Masaj terapisi ve düz koşular başladı. Temposu yavaş yavaş artırılıyor.";
            if (weeksLeft > 1) return "Toplu çalışmalara (dar alan pas) dahil edilmeye başlandı.";
            return "Ağrıları tamamen geçti, doktor maç eksiğini kapatması için onay verdi.";
        }
    }

    window.renderMedicalCenter = function() {

        const list = document.getElementById('injured-players-list');
        if (!list) return;
        
        let myTeamId = window.myTeamId || (window.league ? window.league.userTeamId : "galatasaray");
        let injured = window.leagueData.players.filter(p => p.teamId === myTeamId && (p.isInjured || p.isKinesiophobic));
        
        list.innerHTML = "";
        
        if (injured.length === 0) {
            list.innerHTML = "<li style='color: #2ecc71; padding: 10px;'>Şu an takımda sakat veya fiziksel travma yaşayan oyuncu yok.</li>";
            if(typeof speak === 'function') speak("Hocam revirimiz bomboş. Takımın maşallahı var.");
        } else {
            let voiceLines = [];
            injured.forEach(p => {
                let injuryDesc = p.injuryType || "Bilinmeyen bir sakatlık";
                let isHealing = p.injuredWeeks === 0 && p.isKinesiophobic;
                let docComment = "";
                let treatmentMethod = "";
                
                if (isHealing) {
                    docComment = "Fiziksel olarak iyileşti ancak sahaya çıkmaktan korkuyor (Kinesiofobi). Psikolojik destek alması şart.";
                    treatmentMethod = "Bilişsel Davranışçı Terapi (CBT) ve korkuyla yüzleşme seansları uygulanıyor.";
                    voiceLines.push(`${p.name} fiziksel olarak iyileşti ancak sahaya çıkmaktan korkuyor.`);
                } else {
                    if (injuryDesc.includes("Çapraz Bağ")) {
                        docComment = "Hocam durum çok ciddi, ameliyat olması şart. Maalesef sezonu kapattı diyebiliriz.";
                        treatmentMethod = "Açık Diz Cerrahisi (Bağ Rekonstrüksiyonu), ardından 6 ay yoğun fizyoterapi ve su içi yürüyüş antrenmanları.";
                    } else if (injuryDesc.includes("Aşil")) {
                        docComment = "Kötü haber... Aşil tendonunda kopma var. Bu yaştaki bir oyuncu için dönüşü çok zor olacak.";
                        treatmentMethod = "Tendon onarım ameliyatı. İlk 8 hafta alçı ve atel kullanımı, sonrasında izokinetik kas güçlendirme.";
                    } else if (injuryDesc.includes("Kaval") || injuryDesc.includes("Kırığı")) {
                        docComment = "Kemikte kırık tespit ettik. Alçıya alıp uzun süre beklemek zorundayız.";
                        treatmentMethod = "Kemiğin titanyum vida/plak ile sabitlenmesi (Osteosentez). Kalsiyum destekli özel beslenme ve alçı istirahati.";
                    } else if (injuryDesc.includes("Hamstring") || injuryDesc.includes("Arka Bacak") || injuryDesc.includes("Ön Bacak") || injuryDesc.includes("Baldır") || injuryDesc.includes("Kasık")) {
                        docComment = "Aşırı depar ve yorgunluktan kas yırtılması oluşmuş. MR sonuçlarına göre haftalarca bizden uzak kalacak.";
                        treatmentMethod = "PRP (Trombositten Zengin Plazma) enjeksiyonları, derin doku masajı, ultrasonik dalga tedavisi ve tam istirahat.";
                    } else if (injuryDesc.includes("Kafa Travması") || injuryDesc.includes("Sarsıntı")) {
                        docComment = "Hava topunda kötü çarpıştı. Beyin sarsıntısı şüphesiyle protokol gereği bir süre kesinlikle oynamaması gerekiyor.";
                        treatmentMethod = "Karanlık oda istirahati. Ekran/telefon yasağı ve düzenli nörolojik refleks testleri.";
                    } else if (injuryDesc.includes("Pubis")) {
                        docComment = "Hocam oyuncuda kronik pubis başlangıcı var. Aşırı yüklenmeden kaynaklı. Uzun bir tedavi süreci bizi bekliyor.";
                        treatmentMethod = "Kortizon iğneleri, osteopatik pelvis hizalama ve karın/kasığı bağlayan core bölgesi güçlendirmeleri.";
                    } else if (injuryDesc.includes("Topuk") || injuryDesc.includes("Başparmağı") || injuryDesc.includes("Burkulması")) {
                        docComment = "Zeminden ve krampondan kaynaklı bağ zedelenmesi. Üzerine basmakta çok zorlanıyor.";
                        treatmentMethod = "Günde 3 kez kriyoterapi (buz banyosu), özel tabanlık kullanımı ve anti-inflamatuar ilaç tedavisi.";
                    } else if (injuryDesc.includes("Menisküs")) {
                        docComment = "Diz kapağındaki kıkırdakta yırtık tespit ettik. Dinlenmesi gerekiyor.";
                        treatmentMethod = "Artroskopik (kapalı) diz ameliyatı ile kıkırdak temizliği ve sonrasında CPM cihazı ile pasif hareket egzersizleri.";
                    } else if (injuryDesc.includes("Ezilmesi")) {
                        docComment = "Kemiğe kadar inen çok sert bir darbe almış. Ağır kas ezilmesi mevcut.";
                        treatmentMethod = "Kanamanın durması için kompresyon bandajı, elektrostimülasyon (TENS cihazı) ve ağrı kesici blokaj.";
                    } else {
                        docComment = "Ufak bir zedelenme, ancak risk almamak için tedavisini başlattım.";
                        treatmentMethod = "Rutin masaj, sıcak-soğuk pres ve düşük tempolu bireysel bisiklet antrenmanı.";
                    }
                    
                    // YENİ: Oyuncuya "Tesisleri Geliştir" ipucunu veren Doktor Notu
                    let myTeam = window.leagueData.teams.find(t => t.id === window.myTeamId);
                    if (myTeam) {
                        let medLvl = myTeam.medicalLevel || 1;
                        if (medLvl < 4) {
                            docComment += `<br><br><span style="color:#e74c3c;"><strong>⚠️ Doktorun Notu:</strong> Hocam, bu tür sakatlıkların önüne geçmek ve toparlanma süresini kısaltmak için <strong>Sağlık Tesislerimizi</strong> acilen bir üst seviyeye (Şu anki Seviye: ${medLvl}) geliştirmeliyiz! Bütçe ayırın lütfen.</span>`;
                        }
                    }
                    
                    voiceLines.push(`${p.name} için MR sonuçları şöyle: ${injuryDesc} tespit ettik. ${p.injuredWeeks} hafta sahalardan uzak kalacak.`);
                }
                
                let statusText = isHealing ? "⚕️ Kinesiofobi (Fiziksel Temas Korkusu)" : `🚑 ${injuryDesc} (${p.injuredWeeks} Hafta)`;
                
                let li = document.createElement("li");
                li.style.padding = "15px";
                li.style.borderBottom = "1px solid #34495e";
                li.style.backgroundColor = "rgba(0, 0, 0, 0.3)";
                li.style.borderRadius = "8px";
                li.style.marginBottom = "10px";
                
                li.innerHTML = `
                    <strong style="color: #ff7675; font-size: 1.2rem;">${p.name}</strong> - <span style="color: #fdcb6e;">${statusText}</span>
                    <div style="margin-top: 10px; padding: 10px; background: rgba(155, 89, 182, 0.1); border-left: 4px solid #9b59b6; border-radius: 4px;">
                        <span style="color: #ecf0f1; font-size: 0.95rem; font-style: italic;"><strong>🩺 Doktor Yorumu:</strong> "${docComment}"</span>
                    </div>
                    <div style="margin-top: 5px; padding: 10px; background: rgba(39, 174, 96, 0.1); border-left: 4px solid #27ae60; border-radius: 4px;">
                        <span style="color: #ecf0f1; font-size: 0.95rem;"><strong>💉 Uygulanan Tedavi:</strong> ${treatmentMethod}</span>
                    </div>
                    <div style="margin-top: 5px; padding: 10px; background: rgba(52, 152, 219, 0.1); border-left: 4px solid #3498db; border-radius: 4px;">
                        <span style="color: #ecf0f1; font-size: 0.95rem;"><strong>⏳ Güncel Aşama (${p.injuredWeeks} Hafta Kaldı):</strong> ${getTreatmentStage(injuryDesc, p.injuredWeeks)}</span>
                    </div>
                `;
                list.appendChild(li);
            });
            
            // Speak the doctor's diagnosis for the first injured player, or a general summary if many
            if(typeof speak === 'function') {
                if (voiceLines.length > 2) {
                    speak("Hocam revir çok kalabalık. Birden fazla oyuncumuzun tedavisi sürüyor. Dosyaları ekranınıza yansıtıyorum.");
                } else {
                    speak(voiceLines[0]); // İlk oyuncunun detayını okur
                }
            }
        }
    };

    document.getElementById('btn-start-psychology-sessions')?.addEventListener('click', () => {
        startPsychologistSessions();
    });

    function startPsychologistSessions() {
        let myTeamId = window.myTeamId || (window.league ? window.league.userTeamId : "galatasaray");
        let myRoster = window.leagueData.players.filter(p => p.teamId === myTeamId);
        
        psychologyQueue = [];

        myRoster.forEach(p => {
            // 5. Medya Linci / Özgüven Çöküşü Talebi
            if (p.psy && p.psy.selfEfficacy < 50 && Math.random() < 0.8) {
                psychologyQueue.push({
                    player: p,
                    type: 'confidence',
                    title: "Medya Baskısı ve Özgüven Çöküşü",
                    message: `Hocam dünkü televizyon yayınlarını ve sosyal medyadaki linçleri gördünüz mü? Herkes üzerime geliyor, yorumcular taktiği ve benim performansımı yerden yere vurdu. Sahaya çıkıp top oynamaktan korkar hale geldim. Terapiste ihtiyacım var.`
                });
            }

            // 1. Kinesiofobi Talebi
            if (p.isKinesiophobic) {
                psychologyQueue.push({
                    player: p,
                    type: 'kinesio',
                    title: "Sakatlık Korkusu (Kinesiofobi)",
                    message: `Hocam... Sakatlığım geçti ama sahaya her çıktığımda o anı tekrar yaşıyorum. İkili mücadelelere girmekten çok korkuyorum. Lütfen psikologdan destek alayım.`
                });
            }
            
            // 2. Takım Dinamiği (Bench Rebellion) Talebi
            if (p.benchedMatches > 2 && p.happiness !== "Mutlu 😊" && p.happiness !== "Umutlu 😊") {
                if (window.clubCultureProfile === 'emektar_malzemeci' && Math.random() < 0.5) {
                    p.happiness = "Umutlu 😊";
                    p.benchedMatches = 0; // Süreyya abi onu sakinleştirdi
                    if(typeof speak === 'function') speak(`Kulübün hafızası Emektar Malzemecimiz, ${p.name} ile bir çay içip dertleşti. Oyuncunun size ve formaya olan küskünlüğü son buldu!`);
                    return; // Kuyruğa girmez, sorun çözüldü
                }
                
                psychologyQueue.push({
                    player: p,
                    type: 'bench',
                    title: "Formaya Küsmek",
                    message: `Hocam haftalardır kulübedeyim. Bu takımın bir parçası gibi hissetmiyorum. Kendimi mental olarak çok kötü hissediyorum, konuşmaya ihtiyacım var.`
                });
            }

            // 3. Penaltı Sendromu (Rastgele veya stresi yüksek)
            if (!p.hasPenaltyRoutine && p.power > 75 && Math.random() < 0.1) {
                psychologyQueue.push({
                    player: p,
                    type: 'penalty',
                    title: "Penaltı Sendromu",
                    message: `Son günlerde uyku uyuyamıyorum. Maçta penaltı noktasına yürürken kalbim yerinden çıkacak gibi oluyor. Zihinsel bir rutine ihtiyacım var hocam.`
                });
            }

            // 4. Akış (The Zone) İmgelemesi (Yıldızlar)
            if (!p.hasFlowTraining && p.power >= 82 && Math.random() < 0.1) {
                psychologyQueue.push({
                    player: p,
                    type: 'flow',
                    title: "Akış (The Zone) İsteği",
                    message: `Hocam sahada odaklanma problemi yaşıyorum. Maçın kritik anlarında eski soğukkanlılığım yok. İmgeleme (Görselleştirme) seanslarına girmek istiyorum.`
                });
            }

            // 6. Yıldızların Ego Savaşı
            let otherStars = myRoster.filter(star => star.id !== p.id && star.power >= 84);
            if (p.power >= 85 && otherStars.length > 0 && Math.random() < 0.15) {
                let rival = otherStars[Math.floor(Math.random() * otherStars.length)];
                // Aynı ikiliyi iki kez kuyruğa atmamak için ufak bir kontrol
                if (!psychologyQueue.find(req => req.type === 'ego_war' && req.rival.id === p.id)) {
                    psychologyQueue.push({
                        player: p,
                        type: 'ego_war',
                        rival: rival,
                        title: "Yıldızların Ego Savaşı",
                        message: `Hocam, ${rival.name} ile aynı sahada oynamak artık işkence. Her topu kendi istiyor, soyunma odasında sürekli bana laf sokuyor. Ya o, ya ben! İkimizden birini seçeceksin ya da psikoloğa gidip bu işi profesyonelce çözeceğiz.`
                    });
                }
            }

            // 7. Milli Takımdan Kesilme (National Snub)
            if (p.isNationalSnub) {
                if (!psychologyQueue.find(req => req.type === 'national_snub' && req.player.id === p.id)) {
                    psychologyQueue.push({
                        player: p,
                        type: 'national_snub',
                        title: "Milli Takım Yıkımı",
                        message: `Hocam, milli takım kadrosu açıklandı ve adım yok! Bütün ülke benden bahsediyordu ama kadroya giremedim. Formum düştüğü için beni suçluyorlar. Tüm motivasyonum sıfır, artık sahaya çıkacak gücü bulamıyorum.`
                    });
                }
            }
        });

        if (psychologyQueue.length === 0) {
            alert("Şu an ofis kapısında bekleyen hiçbir oyuncu yok. Takımın mental sağlığı yerinde!");
        } else {
            showNextPsychologyRequest();
        }
    }

    function showNextPsychologyRequest() {
        if (psychologyQueue.length === 0) {
            alert("Psikolog ofisindeki tüm görüşmeleri tamamladınız.");
            renderMedicalCenter(); // Listeyi güncelle
            return;
        }

        let request = psychologyQueue.shift();
        let p = request.player;

        const modal = document.createElement('div');
        modal.style.position = "fixed";
        modal.style.top = "50%";
        modal.style.left = "50%";
        modal.style.transform = "translate(-50%, -50%)";
        modal.style.background = "#2c3e50";
        modal.style.border = "3px solid #3498db";
        modal.style.padding = "30px";
        modal.style.zIndex = "9999";
        modal.style.color = "white";
        modal.style.boxShadow = "0 0 20px rgba(0,0,0,0.8)";
        modal.style.borderRadius = "10px";
        modal.style.textAlign = "center";
        modal.style.width = "450px";

        let title = document.createElement('h2');
        title.innerHTML = `🚪 Ofisteki Oyuncu: ${p.name}`;
        title.style.color = "#3498db";
        
        let subtitle = document.createElement('h4');
        subtitle.innerHTML = `Mesele: ${request.title}`;
        subtitle.style.color = "#f1c40f";

        let text = document.createElement('p');
        text.innerHTML = `<i>"${request.message}"</i>`;
        text.style.margin = "20px 0";
        text.style.fontSize = "1.1rem";
        
        // Seçenekler
        let btnApprove = document.createElement('button');
        btnApprove.className = "menu-button";
        btnApprove.style.display = "block"; btnApprove.style.width = "100%"; btnApprove.style.margin = "10px 0"; btnApprove.style.background = "#27ae60";
        btnApprove.innerHTML = "✅ Onayla (Psikoloğa Gönder)";
        btnApprove.onclick = () => { 
            document.body.removeChild(modal); 
            handlePsychologyResult(request, true); 
        };

        let btnReject = document.createElement('button');
        btnReject.className = "menu-button";
        btnReject.style.display = "block"; btnReject.style.width = "100%"; btnReject.style.margin = "10px 0"; btnReject.style.background = "#c0392b";
        btnReject.innerHTML = "❌ Reddet (Kendin Çöz!)";
        btnReject.onclick = () => { 
            document.body.removeChild(modal); 
            handlePsychologyResult(request, false); 
        };

        modal.appendChild(title);
        modal.appendChild(subtitle);
        modal.appendChild(text);
        modal.appendChild(btnApprove);
        modal.appendChild(btnReject);
        
        document.body.appendChild(modal);
        setTimeout(() => { if (btnApprove) btnApprove.focus(); }, 50);
        if(typeof speak === 'function') speak(`${p.name} odanıza girdi.`);
    }

    function handlePsychologyResult(request, isApproved) {
        let p = request.player;
        let msg = "";

        // Duygu (Emotions) ve Biyokimya (Bio) matrisini oluştur/hazırla
        if (!p.emotions) p.emotions = { happiness: 50, sadness: 0, fear: 0, anger: 0, surprise: 0, disgust: 0 };
        if (!p.bio) p.bio = { cortisol: 50, dopamine: 50, testosterone: 50 };

        if (!window.mentalCoachProfile) {
            window.mentalCoachProfile = Math.random() < 0.5 ? "modern_koc" : "geleneksel";
        }

        if (isApproved) {
            p.happiness = "Umutlu 😊";
            p.emotions.happiness = 100; p.emotions.sadness = 0; p.emotions.fear = 0; p.emotions.anger = 0;
            p.bio.cortisol = 0; p.bio.dopamine = 100;

            // Eğer "Modern Mental Koç" ise seanslar çok daha güçlü ve agresif etki yaratır
            if (window.mentalCoachProfile === 'modern_koc') {
                p.happiness = "Ateşli 🔥";
                p.bio.testosterone = 100; // Sahada canavar kesilir
            }

            if (request.type === 'kinesio') {
                p.isKinesiophobic = false;
                p.aggression = p.baseAggression || (p.aggression + 20);
                p.bio.testosterone = 100; // Agresiflik geri geldi
                msg = `${p.name} psikologdan ağlayarak çıktı ama omuzlarından büyük bir yük kalktı. Artık ikili mücadelelerde ayağını sakınmayacak!`;
            } else if (request.type === 'penalty') {
                p.hasPenaltyRoutine = true;
                msg = `${p.name} penaltı sendromuna karşı zihinsel olarak eğitildi. Artık o noktaya yürürken kalbi hızlanmayacak.`;
            } else if (request.type === 'flow') {
                p.hasFlowTraining = true;
                msg = `${p.name} ile görselleştirme seansı yapıldı. Kritik anlarda Akış (The Zone) durumuna girebilecek.`;
            } else if (request.type === 'bench') {
                p.benchedMatches = 1;
                p.promisedNextMatch = false;
                msg = `${p.name} psikolog terapisiyle egolarından arındı ve takıma küsmekten vazgeçti.`;
            } else if (request.type === 'confidence') {
                if(p.psy && p.psy.selfEfficacy !== undefined) {
                    if (isNaN(p.psy.selfEfficacy)) p.psy.selfEfficacy = 50;
                    p.psy.selfEfficacy = Math.min(100, p.psy.selfEfficacy + 40);
                }
                msg = `${p.name} spor psikoloğu sayesinde medyanın ve yorumcuların yarattığı linç baskısından tamamen arındı. Özgüveni geri geldi ve sahaya çıkmaya hazır!`;
            } else if (request.type === 'ego_war') {
                p.happiness = "Ateşli 🔥";
                request.rival.happiness = "Ateşli 🔥";
                p.aggression = Math.min(100, (p.aggression || 50) + 10);
                request.rival.aggression = Math.min(100, (request.rival.aggression || 50) + 10);
                msg = `Psikolog, ${p.name} ve ${request.rival.name} ile harika bir yüzleşme seansı yaptı. Kavga etmek yerine aralarındaki bu yüksek egolu rekabeti sahaya yansıtmaya karar verdiler. İkisi de birbiriyle yarışmak için hırs küpüne dönüştü!`;
            } else if (request.type === 'national_snub') {
                p.isNationalSnub = false; // Temizle
                p.morale = Math.min(100, (p.morale || 0) + 50); // Moralini düzelt
                p.happiness = "Hırslı 😤";
                msg = `Psikolog, ${p.name} ile yaptığı görüşmede odaklanması gereken tek yerin kendi kulübü olduğuna ikna etti. Oyuncu milli takımdan kesildiği için isyan etmek yerine formasına sarılıp onlara bir cevap vermek için antrenmanlara ekstra asılmaya başladı.`;
            }
            if (window.mentalCoachProfile === 'modern_koc') {
                msg += " (Mental Koçun muazzam seansı sayesinde oyuncunun zihni adeta yeniden programlandı!)";
            }
            if(typeof speak === 'function') speak(`Terapi başarılı. ${p.name} çok daha iyi hissediyor.`);
        } else {
            p.happiness = "Mutsuz 😡";
            p.emotions.happiness = 0; p.emotions.sadness = 100; p.emotions.anger = 100; p.emotions.fear = 50;
            p.bio.cortisol = 100; p.bio.dopamine = 0;

            msg = `Senin bu sert tavrın ${p.name} isimli oyuncuyu yıktı. Kendini tamamen dışlanmış hissediyor ve morali dibe vurdu.`;
            
            // Reddedilmenin cezaları
            if (request.type === 'bench') {
                p.benchedMatches += 2; // İsyanı hızlandır
            } else if (request.type === 'kinesio') {
                p.speed = Math.max(1, p.speed - 2); // Daha da yavaşlar
            } else if (request.type === 'ego_war') {
                p.power = Math.max(10, p.power - 5);
                request.rival.power = Math.max(10, request.rival.power - 5);
                p.happiness = "İsyan Etti 🤬";
                request.rival.happiness = "İsyan Etti 🤬";
                msg = `Senin bu krizle ilgilenmemen yüzünden kavga soyunma odasına taştı! ${p.name} ve ${request.rival.name} antrenmanda birbirine girdi. İkisinin de formu yerle bir oldu ve takımı ikiye böldüler!`;
            } else if (request.type === 'national_snub') {
                p.power = Math.max(10, p.power - 3); // Oynamadığı için geriliyor
                p.condition = 0; // Oynamak istemiyor
                p.happiness = "Yıkılmış 😭";
                msg = `Senin duyarsızlığın oyuncuyu tamamen bitirdi. Milli takımdan kesilmenin üstüne kulübünden de destek göremeyen ${p.name}, formayı yere fırlatıp idmanı terk etti!`;
            }
            if(typeof speak === 'function') speak(`Oyuncuyu odadan kovdunuz. ${p.name} çok mutsuz.`);
        }

        setTimeout(() => {
            alert(msg);
            showNextPsychologyRequest(); // Sonraki oyuncuya geç
        }, 500);
    }
});

window.generatePsychologyEvents = function() {
    let myTeamId = window.myTeamId || (window.league ? window.league.userTeamId : "galatasaray");
    if (!window.leagueData || !window.leagueData.players) return;
    
    let myRoster = window.leagueData.players.filter(p => p.teamId === myTeamId);
    window.eventQueue = window.eventQueue || [];

    myRoster.forEach(p => {
        // Yedek isyanı her gün %10 ihtimalle patlayabilir
        if (p.benchedMatches > 2 && p.happiness !== "Mutlu 😊" && p.happiness !== "Umutlu 😊" && Math.random() < 0.1) {
            
            if (window.clubCultureProfile === 'emektar_malzemeci' && Math.random() < 0.5) {
                p.happiness = "Umutlu 😊";
                p.benchedMatches = 0; 
                window.eventQueue.push({
                    title: "Malzemeci Krizi Çözdü",
                    message: `Kulübün hafızası Emektar Malzemecimiz, yedek kalmaktan şikayetçi olan <strong>${p.name}</strong> ile bir çay içip dertleşti. Oyuncunun size ve formaya olan küskünlüğü son buldu!`
                });
            } else {
                window.eventQueue.push({
                    title: "Kadro Dışı Kriz Riski",
                    message: `<strong>${p.name}</strong> haftalardır yedek kalmaktan çok rahatsız. Odasını toplarken görüntülendi. Acilen Psikolog Ofisi'ne gidip onunla görüşmelisiniz!`
                });
            }
        }
    });
};
