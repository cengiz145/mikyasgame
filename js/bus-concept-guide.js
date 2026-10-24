/* ==========================================================================
   OTOBÜS İÇİ KAVRAMLAR, BAŞUCU SÖZLÜĞÜ VE EĞİTİCİ KAPTAN REHBERİ
   (BUS CONCEPT GUIDE & EDUCATIONAL ONBOARDING SYSTEM)
   - Hiç otobüs şoförlüğü tecrübesi olmayan herkes için her kavramı açıklar:
     * Ne işe yarar?
     * Neden var / Neden hayatidir?
     * Nasıl kullanılır?
   - F2 veya Shift + K: İnteraktif Otobüs Kavramları Sözlüğü (NVDA / JAWS Uyumlu)
   - Shift + O: Eğitici Kılavuz Modu Aç/Kapat (Açıp kapatırken detaylı anlatım)
   ========================================================================== */

(function(window) {
    'use strict';

    const BUS_CONCEPTS = [
        {
            id: "retarder",
            title: "Retarder (Voith & ZF Hidrolik Şanzıman Freni)",
            key: "B Tuşu (1-5 Kademe) | Shift + B (Sıfırla)",
            shortDesc: "Yokuş aşağı inerken balatalara dokunmadan otobüsü şanzımandan yavaşlatan aşınmasız yardımcı fren.",
            whatIs: "Retarder, ağır vasıtalarda tekerleklerdeki fren balatalarına hiç dokunmadan, şanzıman milindeki hidrolik yağ girdabıyla aracı içeriden yavaşlatan yardımcı bir hidrolik frendir.",
            whyExists: "15-18 tonluk bir otobüs dik bir dağdan (örneğin Tekirdağ Radar Tepesi veya Bolu Dağı) inerken sürekli ayak frenine basılırsa, balatalar 350-400 dereceye kadar ısınır. Buna 'fren şişmesi' denir; balata diske tutunamaz ve fren pedalı tamamen boşa düşer! Retarder işte bu faciayı önlemek için vardır; balataları sıfır sürtünmeyle buz gibi serin tutar.",
            howToUse: "Dik yokuş aşağı inerken B tuşuna basarak 1'den 5'e kadar kademe kademe çekiniz. Aracın yavaşladığını ve o meşhur tok 'Vuvvv' türbin sesini duyacaksınız. Düz yola çıkınca Shift + B ile kapatınız.",
            category: "fren"
        },
        {
            id: "kneeling",
            title: "Kneeling (Yana Yatma & Kaldırıma Alçalma)",
            key: "Ön Kapı açıldığında otomatik / K Tuşu",
            shortDesc: "Sağ taraftaki havalı körükleri indirerek otobüsü kaldırıma doğru 8-10 cm alçaltan konfor sistemi.",
            whatIs: "Kneeling (diz çökme), otobüsün sağ yanındaki pnömatik hava körüklerinin havasını tahliye ederek aracın sağ tarafını kaldırım hizasına kadar eğmesidir.",
            whyExists: "Şehir içi otobüslerde yaşlılar, çocuklar, pusetli anneler ve yürüme güçlüğü çeken vatandaşlar yüksek basamak tırmanamaz. Otobüs yana yattığında basamak yüksekliği neredeyse sıfıra iner ve yolcular sanki düz yolda yürür gibi biner.",
            howToUse: "Durağa yanaşıp durduğunuzda kapıyı açtığınızda sistem otomatik olarak yana yatar (tısss sesi duyulur). Yolcular bindikten sonra kapı kapanınca körükler tekrar şişerek otobüsü normal sürüş seviyesine kaldırır.",
            category: "konfor"
        },
        {
            id: "ramp",
            title: "Mekanik Engelli Rampası & Interlock Güvenlik Kilidi",
            key: "U Tuşu (Aç / Kapat)",
            shortDesc: "Tekerlekli sandalyeli yolcuların kaldırımdan otobüse girmesini sağlayan ve açıkken aracı kilitleyen alüminyum rampa.",
            whatIs: "Orta kapının zeminine gizlenmiş, menteşeli açılır-kapanır sağlam alüminyum bir köprüdür.",
            whyExists: "Tekerlekli sandalyeli vatandaşların toplu taşımaya engelsiz ve güvenli şekilde erişebilmesi için uluslararası standarttır. En hayati özelliği 'Interlock Güvenlik Kilidi'dir: Rampa açıkken kaptan gaza bassa bile otobüs hareket edemez; yolcunun düşmesi kesin olarak engellenir.",
            howToUse: "Durakta tekerlekli sandalyeli yolcu gördüğünüzde durun, orta kapıyı açın ve U tuşuna basarak rampayı açın. Yolcu bindikten sonra U tuşuna tekrar basarak rampayı kapatın ve seyre devam edin.",
            category: "erişilebilirlik"
        },
        {
            id: "air_brake",
            title: "Pnömatik (Havalı) Fren & Kompresör Sistemi",
            key: "S / Aşağı Ok (Fren) | Boşluk (İmdat)",
            shortDesc: "Binek araçlardaki hidrolik sıvısı yerine 8-12 bar basınçlı hava ile çalışan güçlü ağır vasıta freni.",
            whatIs: "Otobüslerde fren pedalı doğrudan tekerleğe değil, hava tanklarındaki yüksek basınçlı havayı fren körüklerine yönlendiren hava valflerine kumanda eder.",
            whyExists: "16 tonluk bir aracı hidrolik yağ borularıyla durduramazsınız; boru patlayabilir veya güç yetmez. Pnömatik sistemde hava motor kompresörü tarafından sürekli üretilir. Hava biterse güvenlik amacıyla yaylı imdat freni tekerlekleri otomatik olarak kilitler; araç asla frensiz kalmaz.",
            howToUse: "S tuşuyla frene basıldığında 'tısss' sesi duyulur. Sürekli pompalamak yerine kademeli ve yumuşak frenleme yapılmalıdır. Kompresör dolduğunda tahliye valfi 'çuf-tıss' sesiyle fazla havayı tahliye eder.",
            category: "fren"
        },
        {
            id: "handbrake",
            title: "İmdat Freni (Mekanik Park Freni - Maxi Brake)",
            key: "P Tuşu / Shift + Boşluk (Çek / Bırak)",
            shortDesc: "Arka dingildeki güçlü çelik helezon yaylarla aracı mekanik olarak kilitleyen park freni.",
            whatIs: "Hava basıncı kesildiğinde arka tekerlek fren körüklerindeki dev çelik yayların disklere kilitlenmesini sağlayan emniyet frenidir.",
            whyExists: "Otobüs dik bir rampada park edildiğinde veya motor durduğunda aracın geriye kayıp faciaya yol açmasını engeller. Tamamen mekanik kilitlendiği için hava kaçsa bile araç milim kıpırdamaz.",
            howToUse: "Son durakta, otogarda veya dik bir yokuşta yolcu indirirken P tuşuna basarak imdatı çekiniz. Kalkış yapmadan önce tekrar P tuşuyla imdatı bırakınız.",
            category: "fren"
        },
        {
            id: "doors_interlock",
            title: "Kapı Güvenlik Kilidi (Interlock Sistemi)",
            key: "E (Ön Kapı) | Q (Arka Kapı)",
            shortDesc: "Kapılardan biri bile açıkken motorun gaz yemesini engelleyen güvenlik kilidi.",
            whatIs: "Kapı mekanizmasına bağlı elektronik bir güvenlik devresidir. Kapı açık kaldığı sürece motor gaz pedalı devreden çıkarılır.",
            whyExists: "Geçmişte kapı kapanmadan hareket eden otobüslerden yolcuların düşüp yaralanması sebebiyle tüm modern belediye otobüslerinde yasal zorunluluk haline getirilmiştir.",
            howToUse: "Durağa tam yanaşıp durduktan sonra E veya Q ile kapıları açınız. Tüm yolcular binip inene kadar bekleyiniz. Kapıları kapattıktan sonra gaz vererek hareket ediniz.",
            category: "güvenlik"
        },
        {
            id: "radiator_fan",
            title: "Motor Harareti & Hidrostatik Radyatör Fanı",
            key: "Otomatik (98°C Eşiğinde Açılır)",
            shortDesc: "Motor harareti 98°C'ye ulaştığında devreye giren güçlü türbin soğutma fanı.",
            whatIs: "Otobüsün motor kompartımanındaki dev radyatörü soğutan hidrolik tahrikli devasa bir hava emiş fanıdır.",
            whyExists: "Dizel ağır vasıta motorları dik rampalarda ve sıcak havalarda aşırı ısınır. Hararet 105°C'yi aşarsa silindir kapak contası yanar ve motor kilitlenir. Fan, 98°C'de devreye girip güçlü bir türbin uğultusuyla motoru hızla 88°C'ye soğutur.",
            howToUse: "Dik rampalarda aşırı gaza basmamak ve uygun vitesle tırmanmak harareti dengede tutar. Fan devreye girdiğinde çıkan derin hava emiş sesini dinleyiniz.",
            category: "motor"
        },
        {
            id: "rush_hour",
            title: "Canlı Zirve Saatler (Rush Hour AI)",
            key: "Shift + R (Zirve Saat & Telemetri Durumu)",
            shortDesc: "Sabah 07:00-09:00 ve akşam 17:00-19:30 saatlerinde yolcu talebinin 3 katına çıktığı dinamik sistem.",
            whatIs: "Gerçek hayattaki iş ve okul çıkış saatlerini simüle eden dinamik yolcu akış matrisidir.",
            whyExists: "Gerçek hayatta duraklar her saat aynı kalabalıkta olmaz. Sabah mesaisinde duraklar tıka basa dolarken, gece yarısı yollar tenha olur. Oyunun yaşayan bir şehir olduğunu hissettirir.",
            howToUse: "Zirve saatlerde duraklara erken yanaşınız; otobüsün ağırlığı 16 tona kadar çıkacağı için fren mesafesini iki katına çıkarınız.",
            category: "trafik"
        },
        {
            id: "radio_dispatch",
            title: "UKOME / TEKULAŞ Dispeçer Telsizi",
            key: "T Tuşu (Telsiz Dinle) | Shift + T (Hava & Saat)",
            shortDesc: "Belediye Ulaşım Koordinasyon Merkezi ile kaptan arasındaki canlı telsiz haberleşmesi.",
            whatIs: "Otobüs filo takip merkezi ile sürücü arasındaki kurumsal analog/sayısal telsiz ağıdır.",
            whyExists: "Kaptana hatta oluşan kaza, yol yapımı, aşırı yolcu yoğunluğu veya sefer gecikmeleri hakkında anında bilgi vermek için kullanılır.",
            howToUse: "T tuşuna basarak telsiz mandal sesini açıp merkezin anonslarını dinleyebilirsiniz.",
            category: "haberleşme"
        }
    ];

    const BusConceptGuide = {
        isEducationalMode: true, // Varsayılan: Açıp kapatırken detaylı eğitici anlatım
        concepts: BUS_CONCEPTS,
        activeFilter: "all",

        /**
         * Eğitici Modu Aç / Kapat (Shift + O)
         */
        toggleEducationalMode: function() {
            this.isEducationalMode = !this.isEducationalMode;
            const modeText = this.isEducationalMode 
                ? "Eğitici Kaptan Modu AÇIK. Tuşlara bastığınızda kavramların ne işe yaradığı detaylıca seslendirilir." 
                : "Hızlı Kaptan Modu AÇIK. Kısaltılmış durum bildirimleri devrede.";
            
            if (typeof audio !== 'undefined' && typeof audio.speak === 'function') {
                audio.speak(modeText);
            }
            if (typeof audio !== 'undefined' && typeof audio.updateNvdaLiveRegion === 'function') {
                audio.updateNvdaLiveRegion("🎓 " + modeText);
            }
            if (typeof UI !== 'undefined' && typeof UI.showToast === 'function') {
                UI.showToast(this.isEducationalMode ? "🎓 Eğitici Kılavuz Modu Açık" : "⚡ Hızlı Pro Mod Açık", "info");
            }
            return this.isEducationalMode;
        },

        /**
         * Eylem Gerçekleştiğinde Eğitici Açıklama Seslendir
         */
        announceAction: function(actionKey, isEngaged, details = {}) {
            if (!this.isEducationalMode) {
                // Kısa mod: Sadece temel bildirim
                return false;
            }

            let text = "";
            switch(actionKey) {
                case "retarder":
                    if (isEngaged) {
                        text = `Retarder Kademe ${details.level || 1}. Yokuş iniş şanzıman frenidir. Balatalara dokunmadan şanzıman yağı direnciyle otobüsü yavaşlatır; balataların ısınıp frenin şişmesini önler.`;
                    } else {
                        text = "Retarder kapatıldı. Şanzıman serbest akışta.";
                    }
                    break;

                case "kneeling":
                    if (isEngaged) {
                        text = "Kneeling devrede: Otobüs sağ körük havasını tahliye ederek kaldırıma doğru 8 santim yattı. Yaşlı, çocuk ve engelli yolcuların rahatça binmesini sağlar.";
                    } else {
                        text = "Kneeling kapatıldı. Havalı körükler şişirildi, otobüs normal sürüş seviyesine yükseldi.";
                    }
                    break;

                case "ramp":
                    if (isEngaged) {
                        text = "Engelli Rampası açıldı. Güvenlik kilidi devrede; rampa açıkken otobüs hareket edemez. Yolcu binişi bitince U tuşuyla kapatınız.";
                    } else {
                        text = "Engelli Rampası kapatıldı ve kilitlendi. Güvenlik kilidi açıldı, sürüşe hazır.";
                    }
                    break;

                case "front_door":
                    if (isEngaged) {
                        text = "Ön Kapı açıldı. Kapı güvenlik kilidi devrede, araç hareket etmez. Yolcular kart basarak ön kapıdan biner.";
                    } else {
                        text = "Ön Kapı kapandı ve kilitlendi. Hareket edebilirsiniz.";
                    }
                    break;

                case "rear_door":
                    if (isEngaged) {
                        text = "Arka iniş kapısı açıldı. Yolcular iniyor; kapı açıkken gaz pedalı emniyet için devreden çıkar.";
                    } else {
                        text = "Arka Kapı kapandı. Yolcu inişleri tamamlandı.";
                    }
                    break;

                case "handbrake":
                    if (isEngaged) {
                        text = "İmdat park freni çekildi. Arka dingil yayları kilitlendi; araç dik yokuşta dahi kaymaz.";
                    } else {
                        text = "İmdat freni bırakıldı. Basınçlı hava körükleri açtı, tekerlekler serbest.";
                    }
                    break;

                case "ac":
                    if (isEngaged) {
                        text = "Klima ve kabin havalandırması açıldı. Yolcu nefesinden camların buğulanmasını önler ve kabin havasını tazeler.";
                    } else {
                        text = "Klima kapatıldı.";
                    }
                    break;

                case "wipers":
                    if (isEngaged) {
                        text = "Cam silecekleri çalışıyor. Yağmur ve kar suyunu tahliye ederek ön cam görüş netliğini sağlar.";
                    } else {
                        text = "Silecekler durduruldu.";
                    }
                    break;

                case "headlights":
                    if (isEngaged) {
                        text = "Farlar açıldı. Tünellerde ve karanlıkta yolu aydınlatır, diğer araçların otobüsü fark etmesini sağlar.";
                    } else {
                        text = "Farlar kapatıldı.";
                    }
                    break;
            }

            if (text) {
                if (typeof audio !== 'undefined' && typeof audio.speak === 'function') {
                    audio.speak(text);
                }
                if (typeof audio !== 'undefined' && typeof audio.updateNvdaLiveRegion === 'function') {
                    audio.updateNvdaLiveRegion(text);
                }
                if (typeof UI !== 'undefined' && typeof UI.showToast === 'function') {
                    UI.showToast(text, "info");
                }
                return true;
            }
            return false;
        },

        /**
         * F2 / Shift + K İnteraktif Kavramlar Sözlüğü Modalını Aç
         */
        openModal: function() {
            let modal = document.getElementById('bus-concept-modal');
            if (!modal) {
                this.createModalDOM();
                modal = document.getElementById('bus-concept-modal');
            }
            if (modal) {
                modal.classList.remove('hidden');
                modal.style.display = 'flex';
                this.renderConceptList('all');

                const introSpeech = "Otobüs Kavramları ve Kaptan Başucu Sözlüğü açıldı. Yukarı ve aşağı yön tuşlarıyla kavramlar arasında gezinebilir, Enter ile kavramın ne işe yaradığını dinleyebilirsiniz. Kapatmak için Escape tuşuna basınız.";
                if (typeof audio !== 'undefined' && typeof audio.speak === 'function') {
                    audio.speak(introSpeech);
                }
                if (typeof audio !== 'undefined' && typeof audio.updateNvdaLiveRegion === 'function') {
                    audio.updateNvdaLiveRegion("📖 " + introSpeech);
                }
                const firstBtn = modal.querySelector('button.nav-item');
                if (firstBtn) firstBtn.focus();
            }
        },

        /**
         * Modalı Kapat
         */
        closeModal: function() {
            const modal = document.getElementById('bus-concept-modal');
            if (modal) {
                modal.classList.add('hidden');
                modal.style.display = 'none';
                if (typeof audio !== 'undefined' && typeof audio.speak === 'function') {
                    audio.speak("Kavramlar kılavuzu kapatıldı, kokpite dönüldü.");
                }
            }
        },

        /**
         * Modal DOM İskeletini Oluştur
         */
        createModalDOM: function() {
            if (document.getElementById('bus-concept-modal')) return;

            const modalHtml = `
            <div id="bus-concept-modal" class="modal-overlay modal hidden" role="dialog" aria-modal="true" aria-labelledby="concept-modal-title" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.88); z-index: 9000; display: none; align-items: center; justify-content: center; backdrop-filter: blur(8px);">
                <div class="glass-panel" style="max-width: 860px; width: 94%; padding: 24px 28px; text-align: left; max-height: 92vh; overflow-y: auto; background: #0f172a; border: 2px solid #38bdf8; border-radius: 14px; box-shadow: 0 10px 30px rgba(0,0,0,0.8);">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                        <h2 id="concept-modal-title" style="font-size: 1.7rem; margin: 0; color: #38bdf8;">📖 Otobüs İçi Kavramlar & Kaptan Başucu Sözlüğü</h2>
                        <button id="btn-concept-modal-close" class="modern-btn nav-item" style="padding: 6px 14px; background: rgba(239,68,68,0.2); border: 1.5px solid #ef4444; color: #ef4444; font-size: 1.1rem; cursor: pointer; border-radius: 6px;" aria-label="Kavramlar kılavuzunu kapat">✕ Kapat</button>
                    </div>
                    <p style="color: #cbd5e1; font-size: 0.95rem; margin-bottom: 16px; line-height: 1.5;">
                        Hiç otobüs şoförlüğü tecrübesi olmayan herkes için otobüsteki her bir donanımın <strong>ne işe yaradığını, neden var olduğunu ve nasıl kullanılacağını</strong> sade bir dille anlatır.
                    </p>

                    <!-- Kategori Filtreleri -->
                    <div style="display: flex; gap: 8px; margin-bottom: 16px; flex-wrap: wrap;">
                        <button class="modern-btn nav-item btn-concept-tab" data-filter="all" style="padding: 8px 14px; background: #0284c7; color: #fff; border: none; border-radius: 6px; cursor: pointer; font-weight: bold;">Tümü (${BUS_CONCEPTS.length})</button>
                        <button class="modern-btn nav-item btn-concept-tab" data-filter="fren" style="padding: 8px 14px; background: rgba(255,255,255,0.08); color: #cbd5e1; border: 1px solid #475569; border-radius: 6px; cursor: pointer;">Frenler & Retarder</button>
                        <button class="modern-btn nav-item btn-concept-tab" data-filter="erişilebilirlik" style="padding: 8px 14px; background: rgba(255,255,255,0.08); color: #cbd5e1; border: 1px solid #475569; border-radius: 6px; cursor: pointer;">Rampa & Kneeling</button>
                        <button class="modern-btn nav-item btn-concept-tab" data-filter="güvenlik" style="padding: 8px 14px; background: rgba(255,255,255,0.08); color: #cbd5e1; border: 1px solid #475569; border-radius: 6px; cursor: pointer;">Kapı Kilidi & Motor</button>
                    </div>

                    <!-- Kavram Kartları Listesi -->
                    <div id="concept-cards-container" style="display: flex; flex-direction: column; gap: 14px;"></div>
                </div>
            </div>`;

            document.body.insertAdjacentHTML('beforeend', modalHtml);

            // Kapatma butonu dinleyicisi
            document.getElementById('btn-concept-modal-close').addEventListener('click', () => this.closeModal());

            // Sekme filtreleri dinleyicisi
            document.querySelectorAll('.btn-concept-tab').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const filter = e.target.getAttribute('data-filter');
                    document.querySelectorAll('.btn-concept-tab').forEach(b => {
                        b.style.background = 'rgba(255,255,255,0.08)';
                        b.style.color = '#cbd5e1';
                        b.style.border = '1px solid #475569';
                    });
                    e.target.style.background = '#0284c7';
                    e.target.style.color = '#fff';
                    e.target.style.border = 'none';
                    this.renderConceptList(filter);
                });
            });

            // Escape ile kapatma
            window.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    const modal = document.getElementById('bus-concept-modal');
                    if (modal && !modal.classList.contains('hidden')) {
                        e.preventDefault();
                        this.closeModal();
                    }
                }
            });
        },

        /**
         * Kavram Listesini Ekrana Bas
         */
        renderConceptList: function(filter = 'all') {
            const container = document.getElementById('concept-cards-container');
            if (!container) return;

            const filtered = (filter === 'all') 
                ? BUS_CONCEPTS 
                : BUS_CONCEPTS.filter(c => c.category === filter);

            container.innerHTML = filtered.map((c, idx) => `
                <div class="glass-panel" style="background: rgba(30, 41, 59, 0.7); border: 1.5px solid rgba(56, 189, 248, 0.3); border-radius: 10px; padding: 16px 20px;">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px; flex-wrap: wrap; gap: 8px;">
                        <div>
                            <h3 style="margin: 0; color: #38bdf8; font-size: 1.25rem;">${idx + 1}. ${c.title}</h3>
                            <span style="display: inline-block; background: #0369a1; color: #f0f9ff; padding: 2px 8px; border-radius: 4px; font-size: 0.85rem; font-weight: bold; margin-top: 4px;">🎮 Kısayol: ${c.key}</span>
                        </div>
                        <button class="modern-btn nav-item btn-read-concept" data-id="${c.id}" style="padding: 6px 12px; background: rgba(34, 197, 94, 0.2); border: 1px solid #22c55e; color: #4ade80; font-weight: bold; border-radius: 6px; cursor: pointer;" aria-label="${c.title} sesli dinle">
                            🔊 Sesli Dinle
                        </button>
                    </div>
                    
                    <div style="color: #f1f5f9; font-size: 0.95rem; line-height: 1.5; margin-bottom: 8px;">
                        <strong style="color: #facc15;">Ne İşe Yarar?</strong> ${c.whatIs}
                    </div>
                    <div style="color: #f1f5f9; font-size: 0.95rem; line-height: 1.5; margin-bottom: 8px;">
                        <strong style="color: #f87171;">Neden Var / Neden Hayatidir?</strong> ${c.whyExists}
                    </div>
                    <div style="color: #f1f5f9; font-size: 0.95rem; line-height: 1.5;">
                        <strong style="color: #4ade80;">Nasıl Kullanılır?</strong> ${c.howToUse}
                    </div>
                </div>
            `).join("");

            // Sesli dinle butonları
            container.querySelectorAll('.btn-read-concept').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const id = e.currentTarget.getAttribute('data-id');
                    this.speakConcept(id);
                });
            });
        },

        /**
         * Seçilen Kavramı Baştan Sona Detaylı Seslendir
         */
        speakConcept: function(conceptId) {
            const concept = BUS_CONCEPTS.find(c => c.id === conceptId);
            if (!concept) return;

            const fullText = `${concept.title}. Kısayol: ${concept.key}. Ne işe yarar: ${concept.whatIs}. Neden var: ${concept.whyExists}. Nasıl kullanılır: ${concept.howToUse}`;

            if (typeof audio !== 'undefined' && typeof audio.speak === 'function') {
                audio.speak(fullText);
            }
            if (typeof audio !== 'undefined' && typeof audio.updateNvdaLiveRegion === 'function') {
                audio.updateNvdaLiveRegion("📖 " + fullText);
            }
            if (typeof UI !== 'undefined' && typeof UI.showToast === 'function') {
                UI.showToast(`📖 ${concept.title}`, "info");
            }
        }
    };

    // Global nesneye bağla
    window.BusConceptGuide = BusConceptGuide;

})(typeof window !== 'undefined' ? window : globalThis);
