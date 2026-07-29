const fs = require('fs');
const https = require('https');
const path = require('path');

const soundsDir = path.join(__dirname, 'sounds');

if (!fs.existsSync(soundsDir)) {
    fs.mkdirSync(soundsDir);
}

const downloads = [
    {
        url: 'https://actions.google.com/sounds/v1/crowds/stadium_crowd_murmur.ogg',
        filename: 'ambiance.ogg'
    },
    {
        url: 'https://actions.google.com/sounds/v1/crowds/crowd_cheer.ogg',
        filename: 'cheer.ogg'
    },
    {
        url: 'https://actions.google.com/sounds/v1/crowds/large_crowd_reacts_to_something.ogg',
        filename: 'boo.ogg'
    }
];

downloads.forEach(file => {
    const filePath = path.join(soundsDir, file.filename);
    const request = https.get(file.url, function(response) {
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
    });
});
