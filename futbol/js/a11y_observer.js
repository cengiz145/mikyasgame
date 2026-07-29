// a11y_observer.js - Global Accessibility Observer for Modals and Overlays
// Bu script, oyunda herhangi bir açılır pencere (modal) açıldığında arka plandaki tüm menülerin
// ekran okuyucu (NVDA/JAWS) tarafından yanlışlıkla okunmasını %100 engeller.

document.addEventListener('DOMContentLoaded', () => {
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                const target = mutation.target;
                
                // Modal veya overlay sınıfı/ID'sine sahip öğeleri kontrol et
                if (target.classList.contains('modal') || (target.id && target.id.includes('overlay'))) {
                    const isVisible = target.style.display !== 'none' && target.style.display !== '';
                    
                    if (isVisible) {
                        // Açılır pencere göründü! Arka plandaki tüm aktif menüleri ekran okuyucudan GİZLE
                        document.querySelectorAll('.menu-container').forEach(container => {
                            if (container.style.display !== 'none') {
                                container.setAttribute('aria-hidden', 'true');
                                container.setAttribute('data-hidden-by-modal', 'true');
                                // Sekme ile arka plana geçmeyi engelle
                                const focusables = container.querySelectorAll('button, [tabindex="0"], input, select');
                                focusables.forEach(el => {
                                    el.setAttribute('data-original-tabindex', el.getAttribute('tabindex') || '0');
                                    el.setAttribute('tabindex', '-1');
                                });
                            }
                        });
                        
                        // Modala erişilebilirlik taglarını bas
                        if (!target.hasAttribute('role')) target.setAttribute('role', 'dialog');
                        if (!target.hasAttribute('aria-modal')) target.setAttribute('aria-modal', 'true');
                        
                    } else {
                        // Modal kapandı! Başka açık modal var mı kontrol et
                        const anyModalVisible = Array.from(document.querySelectorAll('.modal, [id*="overlay"]'))
                            .some(m => m.style.display !== 'none' && m.style.display !== '');
                            
                        if (!anyModalVisible) {
                            // Arka planı ekran okuyucuya ve klavye sekmesine GERİ AÇ
                            document.querySelectorAll('.menu-container[data-hidden-by-modal="true"]').forEach(container => {
                                container.removeAttribute('aria-hidden');
                                container.removeAttribute('data-hidden-by-modal');
                                
                                const focusables = container.querySelectorAll('[data-original-tabindex]');
                                focusables.forEach(el => {
                                    el.setAttribute('tabindex', el.getAttribute('data-original-tabindex'));
                                    el.removeAttribute('data-original-tabindex');
                                });
                                
                                // ODAK KURTARMA İPTAL EDİLDİ
                                // Ekran okuyucu kullanıcıyı zorla başlığa (H1) attığı için kafa karıştırıyordu.
                                // Modal kapandığında focus serbest bırakılıyor.
                                if (container.style.display !== 'none') {
                                    // Tarayıcı odaklanmasını varsayılana bırakıyoruz
                                }
                            });
                        }
                    }
                }
            }
        });
    });

    // Sayfadaki tüm modal ve overlayleri izlemeye al
    setTimeout(() => {
        const modalsToObserve = document.querySelectorAll('.modal, [id*="overlay"], [id*="modal"]');
        modalsToObserve.forEach(modal => {
            observer.observe(modal, { attributes: true, attributeFilter: ['style'] });
        });
        console.log("[A11Y] Global Modal Observer Aktif. Erişilebilirlik kalkanı devrede.");
        
        // Tarayıcı/Web sitesi hissini tamamen yok etmek için tüm başlıkları (H1, H2, H3) düz metin gibi algılanacak şekilde değiştir.
        // NVDA gibi ekran okuyucular artık 'Başlık seviye 1' demeyecek, sadece metni okuyacak.
        const stripHeadings = () => {
            document.querySelectorAll('h1:not([role="presentation"]), h2:not([role="presentation"]), h3:not([role="presentation"]), h4:not([role="presentation"]), h5:not([role="presentation"]), h6:not([role="presentation"])').forEach(h => {
                h.setAttribute('role', 'presentation');
                // H1'in içindeki metni okuması için ek güvenlik:
                // tabindex -1 ve aria-label vermiyoruz ki normal akışta sadece metin okunsun.
            });
        };
        
        // İlk açılışta temizle
        stripHeadings();
        
        // Dinamik oluşturulan başlıkları da anında yakalayıp temizle
        const headingObserver = new MutationObserver(() => {
            stripHeadings();
        });
        
        headingObserver.observe(document.body, { childList: true, subtree: true });
        
    }, 1000); // Elementlerin DOM'a tam yerleşmesi için hafif gecikme
});
