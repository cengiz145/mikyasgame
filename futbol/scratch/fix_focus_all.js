const fs = require('fs');

// --- TRANSFER.JS ---
let transferPath = 'c:\\\\Users\\\\Umit Ekrem Mikyas\\\\Downloads\\\\wep sitem\\\\futbol\\\\js\\\\transfer.js';
if (fs.existsSync(transferPath)) {
    let content = fs.readFileSync(transferPath, 'utf8');

    // Fix openNegotiation modal focus
    let target1 = `    document.body.appendChild(overlay);
    if(typeof speak === 'function') speak(player.name + " için transfer masasına oturuldu.");
};`;
    let replace1 = `    document.body.appendChild(overlay);
    setTimeout(() => { if (btnBaseOffer) btnBaseOffer.focus(); }, 50);
    if(typeof speak === 'function') speak(player.name + " için transfer masasına oturuldu.");
};`;
    content = content.replace(target1, replace1);

    // Fix showIncomingOfferModal focus
    let target2 = `    overlay.appendChild(modalBox);
    document.body.appendChild(overlay);
};`;
    let replace2 = `    overlay.appendChild(modalBox);
    document.body.appendChild(overlay);
    setTimeout(() => { if (btnAccept) btnAccept.focus(); }, 50);
};`;
    content = content.replace(target2, replace2);

    fs.writeFileSync(transferPath, content, 'utf8');
}


// --- MANAGER.JS ---
let managerPath = 'c:\\\\Users\\\\Umit Ekrem Mikyas\\\\Downloads\\\\wep sitem\\\\futbol\\\\js\\\\manager.js';
if (fs.existsSync(managerPath)) {
    let content = fs.readFileSync(managerPath, 'utf8');

    let target1 = `    modal.style.display = 'flex'; if(modal) { let title = modal.querySelector('h1, h2'); if(title) title.focus(); else modal.focus(); };
    if(typeof speak === 'function') speak(\`\${posName} seçimi açıldı. \${window.showAllPlayersInSelector ? 'Tüm oyuncular listelendi.' : 'Sadece uygun mevkiler listelendi.'}\`);
    
    if(list.firstChild) list.firstChild.focus();
}`;
    let replace1 = `    modal.style.display = 'flex'; 
    if(typeof speak === 'function') speak(\`\${posName} seçimi açıldı. \${window.showAllPlayersInSelector ? 'Tüm oyuncular listelendi.' : 'Sadece uygun mevkiler listelendi.'}\`);
    
    setTimeout(() => {
        if(list.firstChild && list.firstChild.firstChild) {
            list.firstChild.firstChild.focus();
        } else {
            let btnClose = document.getElementById('btn-close-selector');
            if (btnClose) btnClose.focus();
        }
    }, 50);
}`;
    content = content.replace(target1, replace1);

    fs.writeFileSync(managerPath, content, 'utf8');
}


// --- PSYCHOLOGIST.JS ---
let psychPath = 'c:\\\\Users\\\\Umit Ekrem Mikyas\\\\Downloads\\\\wep sitem\\\\futbol\\\\js\\\\psychologist.js';
if (fs.existsSync(psychPath)) {
    let content = fs.readFileSync(psychPath, 'utf8');

    let target1 = `        modal.appendChild(btnReject);
        
        document.body.appendChild(modal);
        if(typeof speak === 'function') speak(\`\${p.name} odanıza girdi.\`);
    }

    function handlePsychologyResult`;
    let replace1 = `        modal.appendChild(btnReject);
        
        document.body.appendChild(modal);
        setTimeout(() => { if (btnApprove) btnApprove.focus(); }, 50);
        if(typeof speak === 'function') speak(\`\${p.name} odanıza girdi.\`);
    }

    function handlePsychologyResult`;
    content = content.replace(target1, replace1);

    fs.writeFileSync(psychPath, content, 'utf8');
}

console.log('Focus fixes applied to all relevant files.');
