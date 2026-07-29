// scout.js - Takvim ve Gözlemci (Scout) Sistemi

window.currentDay = 1;
window.currentMonth = 8; // Ağustos (8. ay)
window.currentYear = 2026;

function formatDate() {
  const months = ["", "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
  return `Gün: ${window.currentDay} | ${window.currentDay} ${months[window.currentMonth]} ${window.currentYear}`;
}

// updateCalendarUI moved to menu.js to prevent overriding

window.eventQueue = window.eventQueue || [];

window.isEventModalOpen = false;

window.showNextEvent = function() {
    if (window.isEventModalOpen) return false; // Zaten açık modal var
    if (!window.eventQueue || window.eventQueue.length === 0) return false;

    window.isEventModalOpen = true;
    let event = window.eventQueue.shift();
    
    let overlay = document.createElement('div');
    overlay.role = "dialog";
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-labelledby", "event-modal-title");
    overlay.style.position = "fixed";
    overlay.style.top = "0";
    overlay.style.left = "0";
    overlay.style.width = "100%";
    overlay.style.height = "100%";
    overlay.style.background = "rgba(0,0,0,0.85)";
    overlay.style.zIndex = "99999";
    overlay.style.display = "flex";
    overlay.style.alignItems = "center";
    overlay.style.justifyContent = "center";
    
    let box = document.createElement('div');
    box.style.background = "#2c3e50";
    box.style.border = "3px solid #f1c40f";
    box.style.padding = "30px";
    box.style.color = "white";
    box.style.textAlign = "center";
    box.style.width = "450px";
    box.style.boxShadow = "0 0 20px rgba(0,0,0,0.8)";
    box.style.borderRadius = "10px";
    
    let title = document.createElement('h2');
    title.id = "event-modal-title";
    title.tabIndex = -1;
    title.style.outline = "none";
    title.innerHTML = "📨 " + event.title;
    title.style.color = "#f1c40f";
    
    let msg = document.createElement('p');
    msg.innerHTML = event.message;
    msg.style.margin = "20px 0";
    msg.style.fontSize = "1.1rem";
    
    let btn = document.createElement('button');
    btn.className = "menu-button";
    btn.style.width = "100%";
    btn.style.backgroundColor = "#27ae60";
    btn.innerText = event.actionText || "Tamam (Okudum)";
    btn.onclick = () => {
        document.body.removeChild(overlay);
        window.isEventModalOpen = false;
        
        if (event.actionCallback) event.actionCallback();
        
        // Zincirleme kontrol
        if (window.eventQueue && window.eventQueue.length > 0) {
            setTimeout(() => window.showNextEvent(), 100);
        } else {
            // Modal bittiyse İleri Sar butonuna odaklan (Oyun akışını bozmamak için)
            let advBtn = document.getElementById('btn-advance-day');
            if (advBtn && advBtn.style.display !== 'none') setTimeout(() => advBtn.focus(), 10);
        }
    };
    
    box.appendChild(title);
    box.appendChild(msg);
    box.appendChild(btn);
    overlay.appendChild(box);
    document.body.appendChild(overlay);
    
    // Tıklama problemi: Odak başlığa (title) geçmeli ki NVDA her şeyi okuyabilsin.
    setTimeout(() => {
        title.focus();
    }, 50);
    
    if(typeof speak === 'function') speak(event.title + ". " + event.message.replace(/<[^>]+>/g, ''));
    return true;
};



// [YENİ] Oyuncu İradesi ve İsyan Sistemi (Karakter Bazlı)
function processPlayerFreeWill() {
    if (!window.myRoster || window.myRoster.length === 0) return;
    
    let rosterCopy = [...window.myRoster];
    
    rosterCopy.forEach(p => {
        // 1. İSYAN VE SÖZLEŞME FESHİ
        if (p.happiness === "İsyan Etti 😡" || p.happiness === "İsyan Etti ??") {
            
            // Karakter Bazlı İsyan İhtimali
            let mutinyChance = 0.15; // Default (Kırılgan vb. için)
            
            if (p.mentalTrait === 'sadık') mutinyChance = 0.01;
            else if (p.mentalTrait === 'profesyonel') mutinyChance = 0.05;
            else if (p.mentalTrait === 'agresif') mutinyChance = 0.35;
            
            // Menajer (Bavulcu Menajer) Etkisi
            if (p.agentType === 'suitcase') {
                mutinyChance *= 2; // Bavulcu menajer kışkırtır
            }
            
            if (Math.random() < mutinyChance) {
                // Oyuncuyu kadrodan sil
                window.myRoster = window.myRoster.filter(player => player.id !== p.id);
                
                // İlk 11 veya yedeklerden çıkar
                if (typeof window.removePlayerFromTactics === 'function') {
                    window.removePlayerFromTactics(p.id);
                }
                
                // Serbest oyuncu yap
                p.teamId = 'free_agent';
                p.happiness = "Mutlu 😊"; // Kurtulduğu için mutlu
                p.benchedMatches = 0;
                
                let agentMsg = p.agentType === 'suitcase' ? " Menajerinin kışkırtmasıyla " : " ";
                let msg = "🚨 İSYAN VE FESİH! " + p.name + "," + agentMsg + "yönetimin kendisine olan tavrına daha fazla dayanamadı. Tesisleri terk ederek sözleşmesini tek taraflı feshetti ve serbest oyuncu oldu!";
                
                window.eventQueue = window.eventQueue || [];
                window.eventQueue.push({
                    title: "Sözleşme Feshedildi!",
                    message: msg
                });
                
                setTimeout(() => {
                    if(typeof speak === 'function') speak("Flaş haber! Takımımızın yıldızı " + p.name + ", isyan bayrağını çekti ve sözleşmesini yırtarak kulüpten ayrıldı!");
                }, 1000);
            }
        }
        
        // 2. EMEKLİLİK (Retirement)
        if (p.age >= 34 && p.injuredWeeks > 10) {
            if (Math.random() < 0.05) {
                window.myRoster = window.myRoster.filter(player => player.id !== p.id);
                // İlk 11 veya yedeklerden çıkar
                if (typeof window.removePlayerFromTactics === 'function') {
                    window.removePlayerFromTactics(p.id);
                }
                
                p.teamId = 'retired';
                let msg = "😢 EMEKLİLİK KARARI... " + p.name + " ağır sakatlığın ardından vücudunun artık futbolu kaldıramayacağını belirterek kramponlarını astığını açıkladı. Bir devir sona erdi.";
                
                window.eventQueue = window.eventQueue || [];
                window.eventQueue.push({
                    title: "Futbola Veda",
                    message: msg
                });
                
                setTimeout(() => {
                    if(typeof speak === 'function') speak("Üzücü bir haber. Usta krampon " + p.name + ", geçirdiği ağır sakatlığın ardından futbolu bıraktığını açıkladı.");
                }, 2000);
            }
        }
    });
}


window.advanceDateAndEvents = function() {

    // 1. Önce bekleyen olayları kontrol et
    if (window.eventQueue && window.eventQueue.length > 0) {
        if(typeof speak === 'function') speak("Hocam, kulüpte çözülmesi gereken işler var. Günü atlamadan önce bunları okumalısınız.");
        window.showNextEvent();
        return false; 
    }

    // 2. Olay yoksa günü atla
    window.totalDaysPassed = (window.totalDaysPassed || 0) + 1;
    window.currentDay = window.currentDay || 1;
    window.currentDay++;
    if (window.currentDay > 30) {
        window.currentDay = 1;
        window.currentMonth = window.currentMonth || 8;
        window.currentMonth++;
        if (window.currentMonth > 12) {
            window.currentMonth = 1;
            window.currentYear = window.currentYear || 2026;
            window.currentYear++;
        }
    }
    
    // 3. Yeni günde olan olayları tetikle
    if (typeof checkScoutArrivals === 'function') checkScoutArrivals();
    
    // Oyuncu İradesi Kontrolü (İsyan / Emeklilik)
    if (typeof processPlayerFreeWill === 'function') processPlayerFreeWill();
    
    // [YENİ] FFP ve İflas Kontrolü (Günlük)
    if (window.budget < 0) {
        window.bankruptcyDays = (window.bankruptcyDays || 0) + 1;
        if (window.bankruptcyDays === 3) {
            if(typeof speak === 'function') speak("Başkanım, kulübün kasası ekside! Bankalar Birliği ihtar çekti, acilen oyuncu satıp bütçeyi artıya geçirmezsek kulübe kayyım atanacak!");
            alert("⚠️ FFP İHTARI: Bütçeniz ekside! 4 gün içinde düzeltmezseniz en değerli oyuncunuz zorla satılacaktır.");
        } else if (window.bankruptcyDays >= 7) {
            // İFLAS: En değerli oyuncuyu zorla sat
            if (window.myRoster && window.myRoster.length > 0) {
                let bestPlayer = window.myRoster.reduce((prev, current) => (prev.power > current.power) ? prev : current);
                
                // Oyuncuyu listeden çıkar
                window.myRoster = window.myRoster.filter(p => p.id !== bestPlayer.id);
                if (window.myTeam) {
                    let formIdx = window.myTeam.formation.indexOf(bestPlayer.id);
                    if(formIdx !== -1) window.myTeam.formation[formIdx] = null;
                    let subIdx = window.myTeam.subs.indexOf(bestPlayer.id);
                    if(subIdx !== -1) window.myTeam.subs[subIdx] = null;
                }
                
                // Kulüpsüz (Free Agent) veya başka bir takıma yolla (Şimdilik free_agent)
                bestPlayer.teamId = 'free_agent';
                if (typeof window.removePlayerFromTactics === 'function') window.removePlayerFromTactics(bestPlayer.id);
                
                let forcedSaleValue = (bestPlayer.power > 80 ? 10 : 5); // Zorunlu satış ucuza gider
                window.budget += forcedSaleValue;
                window.bankruptcyDays = 0;
                
                let crisisMsg = "🚨 KAYYIM ATANDI! Kulüp borçlarını ödeyemediği için Bankalar Birliği duruma el koydu. Takımın en büyük yıldızı " + bestPlayer.name + ", " + forcedSaleValue + " Milyon Euro'ya acımasızca satıldı.";
                if(typeof speak === 'function') speak("Acil durum... Kulübe kayyım atandı! En büyük yıldızımızı borçlar yüzünden yok pahasına sattılar!");
                alert(crisisMsg);
                if(typeof updateBudgetUI === 'function') updateBudgetUI();
            }
        }
    } else {
        window.bankruptcyDays = 0; // Kasa artıdaysa tehlike yok
    }
    
    // 4. Eğer olay oluşmuşsa anında göster
    if (window.eventQueue && window.eventQueue.length > 0) {
        window.showNextEvent();
    }
    return true;
}

function getPlayerLocationInfo(p) {
  if (p.teamId === 'galatasaray' || p.teamId === 'fenerbahce') return { region: 'Türkiye', cost: 0, delay: 1 };
  if (p.teamId === 'free_agent') return { region: 'Güney Amerika', cost: 3, delay: 5 };
  return { region: 'Avrupa', cost: 1, delay: 3 }; // Diğer hepsi
}

function openScoutFacility() {
  let container = document.getElementById('scout-container') || document.getElementById('scout-container');
  let list = document.getElementById('scout-list');
  let budgetDisplay = document.getElementById('scout-budget-display');
  
  list.innerHTML = "";
  if (!window.myTeam) {
    if (window.leagueData && window.leagueData.teams) {
      window.myTeam = window.leagueData.teams[0]; 
    } else {
      return;
    }
  }

  budgetDisplay.textContent = `Bütçe: €${window.myTeam.budget}M`;
  
  let otherPlayers = window.leagueData.players.filter(p => p.teamId !== window.myTeam.id);
  
  otherPlayers.forEach(p => {
    let loc = getPlayerLocationInfo(p);
    
    let li = document.createElement('li');
    li.style.borderBottom = "1px solid #444";
    li.style.padding = "10px";
    li.style.display = "flex"; if(li) { let title = li.querySelector('h1, h2'); if(title) title.focus(); else li.focus(); };
    li.style.justifyContent = "space-between";
    li.style.alignItems = "center";
    
    let infoDiv = document.createElement('div');
    let reportHtml = "";
    
    if (p.scoutReportReady) {
      reportHtml = `<br><span style="color:#f1c40f; font-style:italic;">Gözlemci Raporu: "${p.scoutReportText}"</span>`;
    } else if (p.scoutArrivalDay) {
      let daysLeft = p.scoutArrivalDay - window.currentDay;
      reportHtml = `<br><span style="color:#e74c3c;">Rapor Bekleniyor... (${daysLeft} Gün Kaldı)</span>`;
    } else {
      reportHtml = `<br><span style="color:#7f8c8d;">Gözlemci Gönderilmedi.</span>`;
    }
    
    const mentalIcons = { "elite": "🧠 Lider", "aggressive": "⚔️ Agresif", "fragile": "🩹 Hassas" };
    const roleIcons = {
        "inside_forward": "⚡ Kat Eden", "poacher": "🎯 Fırsatçı", "target_man": "🗼 Pivot",
        "playmaker": "🎩 Oyun Kurucu", "maestro": "🎻 Şef", "box_to_box": "🏃 Dinamo",
        "anchor": "⚓ Çapa", "stopper": "🧱 Duvar", "sweeper": "🧹 Süpürücü",
        "classic": "🛡️ Klasik", "sweeper_keeper": "🦅 Uçan Kaleci", "false_9": "👻 Sahte 9", "regista": "🎯 Regista"
    };
    let mentalStr = mentalIcons[p.mentalTrait] || "👤 Standart";
    let roleStr = roleIcons[p.tacticalRole] || "⚽ Genel";

    infoDiv.innerHTML = `<strong style="font-size:1.2rem; color:#fff;">${p.name}</strong> <span style="color:#aaa;">(${p.age} Yaş - ${p.position}) | Takım: ${p.teamId}</span><br>
                         <small style="color:#3498db; font-style:italic;">${roleStr} | ${mentalStr}</small>${reportHtml}`;
    
    let actionsDiv = document.createElement('div');
    
    if (!p.scoutArrivalDay && !p.scoutReportReady) {
      let btnScout = document.createElement('button');
      btnScout.textContent = `Gözlemci Gönder (€${loc.cost}M - ${loc.region})`;
      btnScout.className = "menu-button";
      btnScout.style.padding = "5px 10px";
      btnScout.style.fontSize = "0.9rem";
      btnScout.style.backgroundColor = "#3498db";
      btnScout.onclick = () => sendScout(p, loc);
      actionsDiv.appendChild(btnScout);
    }
    
    li.appendChild(infoDiv);
    li.appendChild(actionsDiv);
    list.appendChild(li);
  });

  if (typeof showContainer === 'function') showContainer('scout-container'); else { container.style.display = 'block'; setTimeout(() => container.classList.add('active'), 10); }
}

function sendScout(p, loc) {
  if (window.myTeam.budget < loc.cost) {
    if(typeof speak === 'function') speak("Yeterli bütçeniz yok!");
    return;
  }
  
  window.myTeam.budget -= loc.cost;
  p.scoutArrivalDay = window.currentDay + loc.delay;
  
  if(typeof speak === 'function') speak(`${loc.region} bölgesine gözlemci gönderildi. Rapor ${loc.delay} gün sonra ulaşacak.`);
  openScoutFacility();
}

function checkScoutArrivals() {
  let reportsArrived = 0;
  window.leagueData.players.forEach(p => {
    if (p.scoutArrivalDay && window.currentDay >= p.scoutArrivalDay && !p.scoutReportReady) {
      p.scoutReportReady = true;
      p.scoutReportText = generateScoutReportText(p);
      reportsArrived++;
    }
  });
  
  if (reportsArrived > 0) {
    if(typeof speak === 'function') speak(`Masanızda yeni gözlemci raporları var! Transfer ve Gözlemci Ağına giderek inceleyebilirsiniz.`);
  }
}

function generateScoutReportText(p) {
  if (!window.scoutProfile) {
    window.scoutProfile = Math.random() < 0.5 ? "tribun_kurdu" : "veri_analisti";
  }
  let pot = p.hiddenPotential || p.power; 
  let diff = pot - p.power;
  let cat = "";

  if (p.age <= 24) {
    if (pot >= 90) cat = "wonderkid";
    else if (pot >= 80 && diff >= 10) cat = "high_pot";
    else if (pot >= 75 && diff >= 5) cat = "good_pot";
    else if (diff <= 3) cat = "capped_youth";
    else cat = "bad_youth";
  } else if (p.age <= 30) {
    if (p.power >= 85) cat = "prime_star";
    else if (p.power >= 75) cat = "prime_solid";
    else cat = "prime_average";
  } else {
    if (p.power >= 85) cat = "old_star";
    else cat = "old_declining";
  }

  const pool_tribun_kurdu = {
    wonderkid: {
      intro: ["Hocam, bu çocuğu yağmur çamur demeden izledim, yemin ederim onda o ışık var.", "Gözlerime inanamadım, elimdeki not defterini fırlatıp atasım geldi.", "Taktik maktik hikaye, bu çocukta efsane olacak bir yürek var."],
      mid: ["Topu kaybettiğindeki o hırsı, yüzündeki acı ifadeyi görmeliydin. Tam bir savaşçı.", "Rakiple girdiği ikili mücadelelerde gözünü budaktan sakınmıyor, karakteri çok sağlam.", "Maçtan önce saha kenarında tek başına ısınırken bile o aidiyeti ve ciddiyeti hissettiriyor."],
      outro: ["Eğer bu çocuğu kaçırırsak ben mesleği bırakırım hocam.", "Ne yapıp edip bu 'ruhu' takıma kazandırmalıyız, bilgisayardaki verileri boşverin.", "Maliyeti ne olursa olsun alın, bu çocuğun karakteri bize şampiyonluk getirir."]
    },
    high_pot: {
      intro: ["Çamurlu sahaların tozunu yutmuş, çok sağlam bir çocuk.", "Eski günlerdeki gibi, sahada forması terlemeden çıkmıyor.", "Oyun zekasını bilmem ama yüreğiyle oynayan bir genç buldum."],
      mid: ["Hakemle diyaloğu, arkadaşlarına olan tavrı tam bir lider gibi.", "Tekniği biraz eksik olabilir ama o açığı bitmek bilmeyen ciğeriyle kapatıyor.", "Sahada basmadık yer bırakmadı, tam bizim takımın aradığı ruh."],
      outro: ["Kadromuza katarsak formanın hakkını son damlasına kadar verir.", "Bilgisayardaki istatistiklerine bakmayın, çıplak gözle harika bir işçi.", "İleride çok büyük bir savaşçıya dönüşecek, yatırım yapılmalı."]
    },
    good_pot: {
      intro: ["İyi niyetli, sahada elinden geleni yapan bir çocuk.", "Gözüme çok batmadı ama mücadele gücü fena değil.", "Not defterime 'denenebilir' diye düştüm."],
      mid: ["Teknik kapasitesi sınırlı ama formaya küsmez.", "Yedek kalsa bile sorun çıkarmaz, antrenmanda aslan gibi çalışır.", "Maç içinde oyundan düştüğü oluyor ama hırsıyla tekrar toparlıyor."],
      outro: ["Rotasyonda görev adamı olarak işimizi görür.", "Çok büyük bir yıldız olmaz ama her hocanın isteyeceği bir asker.", "Uygun fiyata alınırsa takımın savaş gücünü artırır."]
    },
    capped_youth: {
      intro: ["Hocam çocuk genç ama gözlerinde o ateşi göremedim.", "Sahada var ama ruhu yok gibi.", "Bu çocuktan pek bir şey beklemiyorum."],
      mid: ["Topu kaybettiğinde geri dönmüyor, hemen hakeme itiraz ediyor.", "Yetenekli olabilir ama o kibirli tavrı beni çok rahatsız etti.", "Formanın değerini bilecek bir karaktere sahip değil."],
      outro: ["Bana sorarsanız bu topa hiç girmeyelim.", "İstatistikleri iyi olabilir ama benim defterimde sınıfta kaldı.", "Takımın ahengini bozar, hiç bulaşmayalım."]
    },
    bad_youth: {
      intro: ["İzlediğim maça yazık oldu hocam.", "Bu çocuğun futbolcu olması bile mucize.", "Not defterimi cebimden hiç çıkarmadım."],
      mid: ["Ne mücadele ediyor ne koşuyor. Tamamen ruhsuz.", "Karakter olarak da çok laubali, ısınırken bile ciddiyetsizdi.", "İkili mücadelelerden korkup ayağını çekiyor."],
      outro: ["Kesinlikle uzak duralım.", "Altyapıdaki çocuklarımızın hakkını yemeyelim, bu bize yaramaz.", "Üstünü kırmızı kalemle çizdim."]
    },
    prime_star: {
      intro: ["Hocam kelimeler yetmez, adam sahada general gibi.", "Yılların tecrübesi, duruşuyla bile rakibi titretiyor.", "Eski toprak bir yıldız, ruhuyla takımı şampiyon yapar."],
      mid: ["Sadece yetenek değil, adam soyunma odasının da lideri olur.", "Gençlere ağabeylik yapar, takımı etrafında toplar.", "Kriz anlarında sorumluluk almaktan asla kaçmaz."],
      outro: ["Ne istiyorsa verip alalım.", "Şampiyonluk istiyorsak bu komutanı takıma katmalıyız.", "Gözü kapalı imza attırılır."]
    },
    prime_solid: {
      intro: ["Görev adamı, formayı terden sırılsıklam yapıyor.", "Taktik falan bilmem ama adam sahada canını dişine takıyor.", "Çok güvenilir bir savaşçı."],
      mid: ["Ne ego yapıyor ne de mızmızlanıyor. Çıkıp işini yapıyor.", "Tekmelere kafa sokan cinsten, tam bir eski toprak.", "Hocasına ve takımına çok sadık bir karakteri var."],
      outro: ["Rotasyonun bel kemiği olur.", "Taraftar bu tarz savaşçıları çok sever, hemen alalım.", "Takımın savaş gücünü artırır, işimize çok yarar."]
    },
    prime_average: {
      intro: ["Ortalama bir işçi, ne eksiği var ne fazlası.", "Sahada pek göze batmıyor ama işini de aksatmıyor.", "Not defterimde ortalarda bir yerde kaldı."],
      mid: ["Ekstra bir liderlik veya savaşçılık göremedim ama kötü de değil.", "Bazen maçın içinde kayboluyor ama takımı da satmıyor.", "Rutin bir performansı var."],
      outro: ["Mecbur kalırsak alırız.", "Yedek kulübesi için düşünülebilir.", "Daha iyisini bulamazsak işimizi görür."]
    },
    old_star: {
      intro: ["Yaşına rağmen sahaya o karakteri koyuyor.", "Efsane bir isim, sadece varlığı bile rakibe korku verir.", "Ciğeri bitse bile tecrübesiyle oynamaya devam ediyor."],
      mid: ["Belki 90 dakika koşamaz ama son 20 dakikada maçı çözer.", "Soyunma odasında gençlere rehberlik yapar.", "Karakteri ve profesyonelliği takdire şayan."],
      outro: ["Son bir şarkı için takıma katılmalı.", "Tecrübesi bize çok maç kazandırır.", "Bu büyük ustayı kadromuza katalım."]
    },
    old_declining: {
      intro: ["Hocam artık ruhu sahada ama bedeni izin vermiyor.", "Eski günlerinden çok uzak, gözlerindeki o ateş sönmüş.", "Yazık, efsane ama artık bırakma vakti gelmiş."],
      mid: ["İkili mücadelelere giremiyor, eski cesareti kalmamış.", "Oyundan düşünce hemen hakeme sızlanmaya başlıyor.", "Saha içindeki varlığı takıma faydadan çok zarar veriyor."],
      outro: ["Geçmişine saygı duyuyorum ama takımımızda yeri yok.", "Bu transfer tamamen israf olur.", "Emekliliğinin tadını çıkarsın, bizden uzak dursun."]
    }
  };

  const pool_veri_analisti = {
    wonderkid: {
      intro: ["Hocam, Futbol Veri Ajansı raporlarını ve maç içi video kesitlerini detaylı analiz ettik. Algoritmalar yanılmaz.", "Bu oyuncunun 90 dakika başına Gol Beklentisi katkısı, kendi yaş grubunda Avrupa'da top %1'de.", "Ön Alan Pas verileri ve dar alandaki isabet oranı tam bir dahiye işaret ediyor."],
      mid: ["Topu üçüncü bölgeye taşıma becerisi muazzam, asimetrik pres karşısında bile pas isabeti %92.", "Gözle görülmeyen ama sistemin dişlilerini kusursuz çalıştıran bir veri harikası.", "Kilit Pas ortalaması elit seviyede, skor üretimimizi doğrudan artıracaktır."],
      outro: ["Veri departmanımızın kesin onayını almıştır. Yatırım getirisi çok yüksek olacaktır.", "Matematik yalan söylemez, sistemimize kusursuz entegre olur. Hemen alınmalı.", "Parametreleri bu kadar kusursuz bir profili kaçırmamalıyız, derhal imza attıralım."]
    },
    high_pot: {
      intro: ["Parametreleri çok dengeli, gelişime açık bir profil.", "Geniş veri havuzumuzda belirlediğimiz özel filtrelerden geçmeyi başaran nadir isimlerden.", "Özellikle Ön Alan Baskısı verilerinde elit bir seviyeye çıkma potansiyeli var."],
      mid: ["Taktiksel sadakati istatistiklere yansıyor, savunma geçişlerinde harika konumlanıyor.", "Zayıf ayağını kullanım oranı biraz düşük ama antrenman algoritmalarıyla düzeltilebilir.", "Sistemimize uyum sağladığında Verimliliği %30 oranında artacaktır."],
      outro: ["Uzun vadeli planlamamızda bize çok yüksek bir performans katkısı sağlayacak.", "İstatistiklerin işaret ettiği potansiyele ulaşırsa piyasa değeri tavan yapar.", "Veritabanımızdaki en mantıklı risk/ödül oranına sahip transfer hedeflerinden biri."]
    },
    good_pot: {
      intro: ["Sistemimize rotasyon parçası olarak uyum sağlayacak veriler sunuyor.", "Standart parametrelerin bir tık üzerinde, faydalı bir profil.", "Modellemelerimize göre takımın genel Gol Beklentisi üretimine olumlu katkı yapar."],
      mid: ["Gösterişsiz oynuyor ama top kaybı yüzdesi (Maç Başı Top Kaybı) çok düşük.", "Defansif istikrarı iyi, istatistik kağıdını doldurmasa da alanı iyi daraltıyor.", "Taktiksel antrenmanlarımızla verimliliğini belirli bir eşiğe kadar artırabiliriz."],
      outro: ["Maliyet/Performans analizi sonucunda yedek kulübemiz için onaylanmıştır.", "Düşük riskli, istatistiksel olarak tutarlı bir yedek oyuncu profili.", "Uygun bir bedelle rotasyonumuza veri derinliği katabilir."]
    },
    capped_youth: {
      intro: ["Veritabanımızda yaptığı hatalar çok net gözüküyor, algoritmalar onay vermedi.", "Isı haritası çok dağınık, oyunda kalma süresi (Oyunda Kalma Süresi) çok yetersiz.", "Kağıt üzerinde genç duruyor ancak verileri hiçbir gelişme trendi göstermiyor."],
      mid: ["İkili mücadele kazanma yüzdesi çok düşük, sistemimizin dayanıklılık testlerinden geçemez.", "Üçüncü bölgedeki karar verme mekanizması zayıf, pas hataları (Pas İsabet Düşüklüğü) takıma zarar verir.", "Gelişim eğrisi (Gelişim Eğrisi) düzleşmiş durumda, potansiyel tavanına şimdiden ulaşmış."],
      outro: ["Analiz departmanımız bu transfere kesinlikle ret oyu veriyor.", "İstatistiksel modelimiz bu oyuncunun takıma katkı sağlamayacağını gösteriyor.", "Zaman ve kaynak israfı olur, listeden çıkaralım."]
    },
    bad_youth: {
      intro: ["Hocam bu oyuncunun Veri Platformu analizlerine bakarken gözlerimiz kanadı.", "Hangi algoritmaya sokarsak sokalım sonuç 'Yetersiz' çıkıyor.", "Sahada kaldığı dakikalar boyunca takıma negatif (-) Gol Beklentisi katkısı yapıyor."],
      mid: ["Ne fiziksel dayanıklılık testlerinde ne de pas isabet yüzdesinde asgari şartları sağlıyor.", "Top kazanma parametreleri sıfıra yakın, pres sistemimizi tamamen çökertir.", "Sadece bizim ligimizde değil, hiçbir modern sistemde yeri yok."],
      outro: ["Bu dosyayı kalıcı olarak kapatalım.", "Parametreler bu kadar kötüyken bu transfere onay vermek veriye ihanet olur.", "Altyapımızdaki ortalama bir oyuncunun bile verileri bundan daha parlak."]
    },
    prime_star: {
      intro: ["Şu an kariyerinin pik noktasında, verileri Avrupa'nın en iyileriyle yarışıyor.", "Algoritmalarımız bu oyuncunun sisteme entegre olmasıyla Gol Beklentisi değerimizin %40 artacağını hesapladı.", "Sahanın her bölgesinde pozitif etki yaratan tam bir oyun makinesi."],
      mid: ["İleri uçtaki üretkenliği, pres şiddeti ve anahtar pas istatistikleri muazzam seviyede.", "Hiçbir zayıf verisi yok, standart sapması (Standart Sapma) sıfıra yakın.", "Sadece kendi pozisyonunun değil, etrafındaki oyuncuların da verimliliğini artırıyor (Takım Uyumu Etkisi)."],
      outro: ["Matematiksel olarak bu transferin bizi şampiyonluğa taşıma ihtimali %85.", "Bu verilere sahip bir oyuncu için bütçe sınırları zorlanmalıdır.", "Kulübümüzün seviyesini elit kategoriye çıkaracak kusursuz bir veri kümesi."]
    },
    prime_solid: {
      intro: ["Takımın omurgasını sağlamlaştıracak, verileri çok tutarlı bir isim.", "Gözlemcilerimiz belki heyecanlanmaz ama istatistikler bu adamın tam bir görev adamı olduğunu kanıtlıyor.", "Hata payı çok düşük, sahada ne yapacağı önceden tahmin edilebilen güvenilir bir profil."],
      mid: ["Top çalma (Top Çalma) ve pozisyon alma verileri sistemimiz için ideal seviyede.", "Skora doğrudan katkı yapmasa da takımın defansif parametrelerini (Yenilen Gol Beklentisi) ciddi oranda düşürür.", "Saha içi dayanıklılık (Saha İçi Dayanıklılık Puanı) puanı 90 dakikayı rahat çıkaracağını gösteriyor."],
      outro: ["Analiz raporları bu transferin 'Akıllı Yatırım' olduğunu belirtiyor.", "Takımın temel işleyişi için kesinlikle kadromuzda bulunması gereken bir dişli.", "Fiyat/Performans algoritmasında en üst sıralarda yer alıyor."]
    },
    prime_average: {
      intro: ["Veritabanımızdaki binlerce ortalama oyuncudan bir diğeri.", "İstatistikleri lig ortalamasında seyrediyor, ekstra bir katkı sunmuyor.", "Parametreleri stabil ama tavan noktası düşük."],
      mid: ["Geniş alanda fena değil ama dar alanda (Dar Alan) pas yüzdesi dramatik şekilde düşüyor.", "Taktiksel görevlerini ortalama bir başarıyla yerine getirir.", "Takımın ana sorunlarını çözemez, sadece sayısal bir eksikliği kapatır."],
      outro: ["Eğer elit bir hedef bulamazsak son çare olarak düşünebiliriz.", "Maliyetine göre değerlendirilmeli, yüksek bedeller ödenmemeli.", "Transfer modellemelerimizde 'zorunlu alternatif' olarak işaretlendi."]
    },
    old_star: {
      intro: ["Fiziksel parametrelerinde ciddi bir düşüş trendi var ama oyun zekası (Oyun Zekası) hala elit seviyede.", "Yaşına rağmen anahtar pas ve şans yaratma istatistiklerinde zirveyi zorluyor.", "Sprint mesafeleri kısalmış olsa da doğru konumlanarak (Pozisyon Alma) bu açığı kapatıyor."],
      mid: ["Top ayağındayken oyunun temposunu kendi algoritmasına göre harika dikte ediyor.", "Pres istatistikleri düşük olduğu için ona defansif yük bindirmeyen bir sistemde kullanılmalı.", "Maçın son 20 dakikasında oyuna girip kilidi açma (Maç Çeviren) metriği çok yüksek."],
      outro: ["Fiziksel düşüşünü göze alıyorsak, salt tecrübesi ve oyun aklı için alınabilir.", "Sahada kaldığı süre boyunca yaratacağı etki, aldığı süreye oranla çok karlı olacaktır.", "Kısa vadeli, hedef odaklı bir hamle."]
    },
    old_declining: {
      intro: ["Oyuncu İstatistikleri ve Fiziksel verileri maalesef alarm veriyor.", "Fiziksel parametreleri (Maç Başı Depar, İkili Mücadele Kazanma) dibe vurmuş durumda.", "Oyun zekası yerinde olsa da bedeni artık elit seviye futbola reaksiyon veremiyor."],
      mid: ["Defansif geçişlerdeki yavaşlığı (Geri Dönüş Hızı) yüzünden takımın Yenilen Gol Beklentisi oranını artırır.", "Sakattlık geçmişi ve kas yorgunluğu analizleri, sezonun %40'ını kaçıracağını gösteriyor.", "İstatistiksel olarak sahada durması takıma yarardan çok zarar veriyor."],
      outro: ["Adı ne kadar büyük olursa olsun, veriler bu transferi kesin bir dille veto ediyor.", "Geçmiş başarıları için kulübün parasını israf edemeyiz.", "Modern futbolun hızına ayak uyduramaz, listeden çıkarılmalı."]
    }
  };

  const pool = window.scoutProfile === "tribun_kurdu" ? pool_tribun_kurdu : 
         window.scoutProfile === "veri_analisti" ? pool_veri_analisti : {
    wonderkid: {
      intro: ["Bu çocukta inanılmaz bir cevher var.", "Gözlerime inanamadım, tam bir elmas bulduk.", "Raporları okuduğumda şok oldum, böyle bir yetenek nadir bulunur.", "Uzun zamandır bu kadar heyecan verici bir gence denk gelmedim.", "Altyapı maçlarında tek başına şov yapıyor."],
      mid: ["Top tekniği, oyun zekası ve vizyonu yaşıtlarının çok ötesinde.", "Eğer doğru yönlendirilir ve şans verilirse, takımın tüm çehresini değiştirir.", "Üzerine titrememiz gereken, özel yetenekleri olan bir oyuncu.", "Mevcut fiziksel dezavantajlarını kapatırsa durdurulamaz bir makineye dönüşür.", "Kulübü yıllarca sırtlayabilecek potansiyele sahip."],
      outro: ["Geleceğin dünya yıldızı olabilir, kesinlikle yatırım yapılmalı!", "Vakit kaybetmeden sözleşme imzalamalıyız.", "Bu transfer kaçarsa ileride çok pişman oluruz.", "Milyon Euro'luk satış potansiyeli var, kaçırmayalım.", "Scout ekibimiz bu oyuncuya kefildir, hemen alınmalı."]
    },
    high_pot: {
      intro: ["Çok iyi bir potansiyeli var.", "İzleme ekibimiz bu isimden çok etkilendi.", "Kesinlikle takipte kalmamız gereken yetenekli bir genç.", "Sahada duruşuyla 'ben futbolcuyum' diye bağırıyor.", "Gelişime son derece açık ve çalışkan bir yapısı var."],
      mid: ["Forma şansı buldukça kendini geliştirecek kapasiteye sahip.", "Özellikle birkaç temel eksiğini kapattığında bambaşka bir seviyeye çıkacak.", "Takım oyununa yatkın, taktiksel disiplini kavramış.", "Doğru bir idman programıyla harikalar yaratabilir.", "Hem teknik hem mental olarak umut vadediyor."],
      outro: ["Takımın değişilmezi olacaktır, yatırıma değer.", "Maliyetine göre harika bir hamle olur.", "Orta vadede bize çok şey kazandırır.", "Bence kadromuza katıp yavaş yavaş sisteme entegre etmeliyiz.", "Bu transferden zarar etme ihtimalimiz çok düşük."]
    },
    good_pot: {
      intro: ["İyi bir kumaşı var.", "Standartların biraz üzerinde, yetenekli bir genç.", "Belirli özellikleri çok göze batıyor, umut verici.", "Scout'larımız olumlu raporlar sundu.", "Geniş rotasyonda işimize yarayacak bir isim."],
      mid: ["Eğer disiplinli çalışırsa potansiyelini sahaya yansıtabilir.", "Bazı maçlarda parlıyor ama istikrara ihtiyacı var.", "Fiziksel olarak biraz zayıf kalsa da topla arası iyi.", "Temel yetenekleri sağlam, sadece profesyonel bir dokunuş gerekiyor.", "Taktik antrenmanlarla çok daha verimli olabilir."],
      outro: ["Rotasyon oyuncusu olarak başlayıp ileride ilk 11'e yerleşebilir.", "Maliyet uygunsa alternatif olarak düşünülebilir.", "Kulübede güvenebileceğimiz bir isim olabilir.", "Gelişimini yakından takip etmeli veya fırsat transferi yapmalıyız.", "Gelecek için iyi bir yedek güç planlaması olur."]
    },
    capped_youth: {
      intro: ["Yaşı genç olsa da...", "Kağıt üzerinde genç duruyor ama...", "İzlediğimiz maçlarda bizi pek etkileyemedi.", "Fiziksel olarak gelişmiş ancak oyun zekası oturmamış.", "Scout'larımız bu oyuncu hakkında ikiye bölündü."],
      mid: ["Mevcut yeteneğinin üzerine çok fazla koyamaz.", "Potansiyel tavanına şimdiden ulaşmış gibi görünüyor.", "Sahada çok çabalıyor ama kapasitesi belli.", "Özellikleri gelişmekten ziyade duraklama dönemine girmiş.", "Kritik anlarda sorumluluk almaktan kaçınıyor."],
      outro: ["Gelişimi büyük ölçüde tamamlanmış, beklentiyi düşük tutmalı.", "Bu transfer bizi bir üst seviyeye taşımaz.", "Geleceğe yatırım olarak düşünülmemeli.", "Sadece kısa vadeli ve ucuz bir çözümse alınabilir.", "Kadro kalabalığı yaratmamak adına pas geçebiliriz."]
    },
    bad_youth: {
      intro: ["Genç yaşına rağmen...", "Bu profilde çok fazla oyuncu gördük.", "Beklentilerin çok altında kalan bir yetenek.", "Saha içi aksiyonları yetersiz ve amatörce.", "Scout ekibimiz bu raporu verirken zorlanmadı."],
      mid: ["Potansiyeli çok sınırlı.", "Sahada varlık gösteremiyor, oyuna katkısı yok denecek kadar az.", "Ne fiziksel ne teknik olarak takımımızın seviyesinde değil.", "Baskı altında çok hata yapıyor.", "Oyun görüşü zayıf ve gelişime tamamen kapalı."],
      outro: ["Kendisinden büyük bir patlama beklememek lazım.", "Yatırım yapmaya kesinlikle değmez.", "Listemizden çıkarmamız takımın hayrına olur.", "Zaman ve bütçe kaybı olur, uzak duralım.", "Altyapımızdaki oyuncular bile bundan daha faydalı olur."]
    },
    prime_star: {
      intro: ["Şu an kariyerinin altın çağını yaşıyor.", "Ligi domine edecek kapasitede bir süper yıldız.", "Rakip takımların korkulu rüyası konumunda.", "Muazzam bir tecrübe ve yetenek birleşimi.", "Bu profilde oyuncu bulmak gerçekten zordur."],
      mid: ["Takımı tek başına sırtlayacak kapasitede.", "Hem saha içinde hem saha dışında tam bir lider.", "Top ayağındayken tribünleri heyecanlandıran bir yapısı var.", "Zorlu maçlarda kilidi açacak anahtar isim o.", "Hiçbir sistemde sırıtmıyor, formayı kendi hakkıyla alıyor."],
      outro: ["Bu fırsatı değerlendirirsek şampiyonluk yarışında seviye atlarız.", "Maliyeti ne olursa olsun alınmalı.", "Taraftarın sevgilisi olacak bir transfer hamlesi.", "Oyun sistemimizi onun üzerine bile kurabiliriz.", "Kulübün prestijini artıracak nokta bir atış."]
    },
    prime_solid: {
      intro: ["Takıma doğrudan katkı verecek tecrübeli bir isim.", "İş ahlakı yüksek, güvenilir bir asker.", "Görev adamı profiline birebir uyuyor.", "Her hocanın kadrosunda görmek isteyeceği tarzda.", "İstikrar abidesi diyebileceğimiz bir profil."],
      mid: ["Sahada ne yapması gerektiğini çok iyi biliyor.", "Verilen taktiğe sadık kalarak elinden geleni yapıyor.", "Gösterişsiz oynuyor ama çok kritik işlere imza atıyor.", "Kötü günü nadir olan, standart sapması düşük bir oyuncu.", "Hem defansif hem ofansif geçişlerde çok faydalı."],
      outro: ["Sezonun uzun maratonunda bizi hiç yarı yolda bırakmaz.", "Kadromuzdaki boşlukları doldurmak için ideal.", "Gönül rahatlığıyla rotasyonun önemli bir parçası yapılabilir.", "Parasını sonuna kadar hak edecek, faydalı bir transfer olur.", "İlk 11'i zorlar, yedek kalsa bile sorun yaratmaz."]
    },
    prime_average: {
      intro: ["Rotasyonda iş yapabilecek, standart bir oyuncu.", "Piyasadaki ortalama oyunculardan biri.", "Ne çok iyi ne çok kötü, tam ortada.", "Eksiği de yok fazlası da yok.", "Takımın temel dinamiklerini değiştirmeyecek bir ekleme."],
      mid: ["Takımın seviyesini atlatamaz ama idare eder.", "Zaman zaman iyi işler yapsa da sürekliliği eksik.", "Düşük tempolu maçlarda iş görür ama büyük maçlarda kayboluyor.", "Sakatlık krizlerinde sahaya sürülebilecek güvenilir ama yetersiz bir isim.", "Riske girilmeden oynatılabilecek sıradan bir profil."],
      outro: ["Bütçe kısıtlıysa kadro derinliği için alınabilir.", "Bizi kurtaracak adam bu değil.", "Sadece yama transferi olarak düşünülmeli.", "Daha iyi alternatiflerimiz olduğuna inanıyorum.", "Zorunlu kalınmadıkça tercih etmemeliyiz."]
    },
    old_star: {
      intro: ["Yaşına rağmen hala büyük bir yıldız.", "Kariyeri boyunca elde ettiği başarılar ortada.", "Klas geçici değil kalıcıdır, bunu kanıtlıyor.", "Tecrübesiyle gençlere örnek olacak bir figür.", "Topu ayağına aldığında hala büyüleyici olabiliyor."],
      mid: ["Sahada yürüyerek bile oyunu okuyabiliyor.", "Hızı eskisinden daha düşük ama zekasıyla bunu kapatıyor.", "Fiziksel düşüşü an meselesi, temposu bazen takıma yetmiyor.", "90 dakikayı çıkaramayabilir ama oynadığı sürede etkili olur.", "Büyük maçların stresini kaldırabilecek tecrübeye sahip."],
      outro: ["Kısa vadeli düşünülüyorsa iyi bir takviye olabilir.", "Uzun kontrat vermemek kaydıyla transfer edilebilir.", "Saha içi liderliği için 1-2 yıllık sözleşme yapılabilir.", "Büyük maaşlardan kaçınılmalı, sadece rotasyon için düşünülmeli.", "Yarım sezonluk şampiyonluk yolunda bize ivme kazandırabilir."]
    },
    old_declining: {
      intro: ["Kariyerinin son demlerinde.", "Eski günlerini mumla aratıyor.", "Yaşının getirdiği ağırlık sahada çok belli oluyor.", "Futbol hayatı adeta bitmek üzere.", "Bir zamanların iyi oyuncusundan eser kalmamış."],
      mid: ["Fiziksel olarak artık bu seviyeleri kaldırması imkansız.", "Sahada sürekli geç kalıyor ve takım savunmasını aksatıyor.", "Sakatlık riskleri çok yüksek, antrenmanlarda bile zorlanıyor.", "Tempolu lig maçlarında oynaması büyük risk.", "Tepki süresi iyice uzamış, refleksleri zayıflamış."],
      outro: ["Uzak durmakta büyük fayda var.", "Kesinlikle transfer listemizden çıkarmalıyız.", "Bize herhangi bir sportif katkısı olmaz.", "Sadece itibarını satmaya çalışıyor, kanmayalım.", "Eski başarılarına saygı duyuyoruz ama kulübümüze fayda sağlamaz."]
    }
  };

  let i = pool[cat].intro[Math.floor(Math.random() * pool[cat].intro.length)];
  let m = pool[cat].mid[Math.floor(Math.random() * pool[cat].mid.length)];
  let o = pool[cat].outro[Math.floor(Math.random() * pool[cat].outro.length)];

  const categoryTitles = {
    wonderkid: "🌟 [Süper Yıldız Adayı]",
    high_pot: "📈 [Yüksek Potansiyelli]",
    good_pot: "✅ [Gelişime Açık]",
    capped_youth: "⚠️ [Potansiyeli Sınırlı]",
    bad_youth: "❌ [Yetersiz Genç]",
    prime_star: "👑 [Dünya Yıldızı (Prime)]",
    prime_solid: "🛡️ [Görev Adamı / İlk 11]",
    prime_average: "🔄 [Sıradan / Rotasyon]",
    old_star: "👴 [Yaşlı Efsane]",
    old_declining: "📉 [Fiziksel Çöküşte]"
  };

  let title = categoryTitles[cat] ? `<strong>${categoryTitles[cat]}</strong><br>` : "";
  let scoutPrefix = window.scoutProfile === "tribun_kurdu" 
    ? "<span style='color:#e67e22;'>🎩 Tribün Kurdu:</span> " 
    : "<span style='color:#3498db;'>💻 Veri Analisti:</span> ";

  return title + scoutPrefix + i + " " + m + " " + o;
}

// Olay Dinleyicileri
document.addEventListener("DOMContentLoaded", () => {
  let btnAdvance = document.getElementById('btn-advance-day');
  let btnScoutNet = document.getElementById('btn-scout-network');
  let btnBackScout = document.getElementById('btn-back-scout');
  
  if (btnAdvance) {
    btnAdvance.addEventListener('click', advanceDay);
  }
  if (btnScoutNet) {
    btnScoutNet.addEventListener('click', openScoutFacility);
  }
  if (btnBackScout) {
    btnBackScout.addEventListener('click', () => {
      if (typeof showContainer === 'function') showContainer('main-menu-container'); else { let mm = document.getElementById('main-menu-container'); if(mm) { mm.style.display = 'block'; setTimeout(() => mm.classList.add('active'), 10); } }
    });
  }
  
  // BaYlang UI
  updateCalendarUI();
});
