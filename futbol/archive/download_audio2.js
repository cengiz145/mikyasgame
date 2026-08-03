const fs = require('fs');
const https = require('https');
const path = require('path');

const soundsDir = path.join(__dirname, 'sounds');

if (!fs.existsSync(soundsDir)) {
    fs.mkdirSync(soundsDir);
}

const downloads = [
    {
        url: 'https://upload.wikimedia.org/wikipedia/commons/a/af/Crowd_noise.ogg',
        filename: 'ambiance.ogg'
    },
    {
        url: 'https://upload.wikimedia.org/wikipedia/commons/b/b3/Crowd_cheering.ogg',
        filename: 'cheer.ogg'
    },
    {
        url: 'https://upload.wikimedia.org/wikipedia/commons/d/df/Booing.ogg',
        filename: 'boo.ogg'
    }
];

const options = {
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
    }
};

downloads.forEach(file => {
    const filePath = path.join(soundsDir, file.filename);
    https.get(file.url, options, function(response) {
        if(response.statusCode === 200 || response.statusCode === 302 || response.statusCode === 301) {
            // Handle redirects if any
            let targetUrl = file.url;
            if (response.statusCode !== 200 && response.headers.location) {
                targetUrl = response.headers.location;
            }
            https.get(targetUrl, options, function(res) {
                if (res.statusCode === 200) {
                    const fileStream = fs.createWriteStream(filePath);
                    res.pipe(fileStream);
                    fileStream.on('finish', () => {
                        fileStream.close();
                        console.log(file.filename + " başarıyla indirildi.");
                    });
                } else {
                    console.log("Hata (Redirect sonrası):", file.filename, res.statusCode);
                }
            });
        } else {
            console.log("Hata:", file.filename, response.statusCode);
        }
    });
});
