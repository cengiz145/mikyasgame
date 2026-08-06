const fs = require('fs');

let content = fs.readFileSync('c:\\\\Users\\\\Umit Ekrem Mikyas\\\\Downloads\\\\wep sitem\\\\futbol\\\\js\\\\transfer.js', 'utf8');

let target = `    let isSuperAgent = player.power >= 87 && Math.random() < 0.6;
    let isFamilyAgent = !isSuperAgent && Math.random() < 0.25; // %25 ihtimalle Aile Üyesi (Baba/Eş) Menajer
    let isCorporateAgent = !isSuperAgent && !isFamilyAgent && Math.random() < 0.40; // %40 Kurumsal Ajans
    
    // Keşif Menajeri: Sadece genç oyuncular (21 yaş altı veya düşük güç)
    let isScoutAgent = !isSuperAgent && !isFamilyAgent && !isCorporateAgent && (player.power < 75 || (player.age && player.age <= 21)) && Math.random() < 0.50;
    
    // Çantacı Menajer: Serbest oyuncular veya yaşlı/vasat oyuncular
    let isSuitcaseAgent = !isSuperAgent && !isFamilyAgent && !isCorporateAgent && !isScoutAgent && (player.teamId === 'free_agent' || player.power < 83) && Math.random() < 0.50;

    window.isSuperAgentNegotiation = isSuperAgent;
    window.isFamilyAgentNegotiation = isFamilyAgent;
    window.isCorporateAgentNegotiation = isCorporateAgent;
    window.isScoutAgentNegotiation = isScoutAgent;
    window.isSuitcaseAgentNegotiation = isSuitcaseAgent;`;

let replacement = `    // Eğer oyuncunun henüz atanmış kalıcı bir menajeri yoksa, bir defaya mahsus belirle
    if (!player.agentType) {
        let isSuperAgent = player.power >= 87 && Math.random() < 0.6;
        let isFamilyAgent = !isSuperAgent && Math.random() < 0.25; 
        let isCorporateAgent = !isSuperAgent && !isFamilyAgent && Math.random() < 0.40; 
        let isScoutAgent = !isSuperAgent && !isFamilyAgent && !isCorporateAgent && (player.power < 75 || (player.age && player.age <= 21)) && Math.random() < 0.50;
        let isSuitcaseAgent = !isSuperAgent && !isFamilyAgent && !isCorporateAgent && !isScoutAgent && (player.teamId === 'free_agent' || player.power < 83) && Math.random() < 0.50;
        
        if (isSuperAgent) player.agentType = 'super';
        else if (isFamilyAgent) player.agentType = 'family';
        else if (isCorporateAgent) player.agentType = 'corporate';
        else if (isScoutAgent) player.agentType = 'scout';
        else if (isSuitcaseAgent) player.agentType = 'suitcase';
        else player.agentType = 'normal';
    }

    let isSuperAgent = player.agentType === 'super';
    let isFamilyAgent = player.agentType === 'family';
    let isCorporateAgent = player.agentType === 'corporate';
    let isScoutAgent = player.agentType === 'scout';
    let isSuitcaseAgent = player.agentType === 'suitcase';

    window.isSuperAgentNegotiation = isSuperAgent;
    window.isFamilyAgentNegotiation = isFamilyAgent;
    window.isCorporateAgentNegotiation = isCorporateAgent;
    window.isScoutAgentNegotiation = isScoutAgent;
    window.isSuitcaseAgentNegotiation = isSuitcaseAgent;`;

content = content.replace(target, replacement);

fs.writeFileSync('c:\\\\Users\\\\Umit Ekrem Mikyas\\\\Downloads\\\\wep sitem\\\\futbol\\\\js\\\\transfer.js', content, 'utf8');
console.log('Patch persistent agents applied successfully.');
