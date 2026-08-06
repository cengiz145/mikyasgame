const fs = require('fs');
const http = require('http');
const https = require('https');
const path = require('path');

const soundsDir = path.join(__dirname, 'sounds');

if (!fs.existsSync(soundsDir)) {
    fs.mkdirSync(soundsDir);
}

const downloads = [
    {
        url: 'http://userk.co.uk/download/sound/crowd.wav',
        filename: 'ambiance.ogg', // game.js ogg bekliyor, ismini ogg yapıp wav yazsak da browser okuyabilir ama mp3/wav yapmak daha sağlıklı
        protocol: http
    },
    {
        url: 'https://dn711103.ca.archive.org/0/items/CrowdCheer/Crowd%20Cheer.mp3',
        filename: 'cheer.ogg',
        protocol: https
    },
    {
        url: 'https://www.myinstants.com/media/sounds/boo.mp3',
        filename: 'boo.ogg',
        protocol: https
    }
];

downloads.forEach(file => {
    const filePath = path.join(soundsDir, file.filename);
    file.protocol.get(file.url, function(response) {
        if(response.statusCode === 200) {
            const fileStream = fs.createWriteStream(filePath);
            response.pipe(fileStream);
            fileStream.on('finish', () => {
                fileStream.close();
                console.log(file.filename + " başarıyla indirildi.");
            });
        } else {
            console.log("Hata:", file.filename, response.statusCode);
        }
    }).on('error', (err) => {
        console.log("Bağlantı hatası:", file.filename, err.message);
    });
});
