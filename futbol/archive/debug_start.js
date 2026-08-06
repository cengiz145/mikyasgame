const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    
    page.on('console', msg => console.log('BROWSER CONSOLE:', msg.type(), msg.text()));
    page.on('pageerror', err => console.log('BROWSER ERROR:', err.toString()));
    
    const fileUrl = 'file://' + path.join(__dirname, 'index.html');
    console.log("Loading", fileUrl);
    
    await page.goto(fileUrl, { waitUntil: 'networkidle2' });
    
    console.log("Page loaded. Body text:", await page.evaluate(() => document.body.innerText.substring(0, 100)));
    
    await browser.close();
})();
