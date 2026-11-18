const { app, BrowserWindow, Menu, ipcMain, shell } = require('electron');
const path = require('path');

// Seslerin kullanıcı etkileşimi beklemeden çalabilmesi ve ekran okuyucu uyumu
app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');

const LIVE_URL = 'https://mikyasstudio.com.tr/hafizana_guven/index.html';
const BACKUP_URL = 'https://cengiz145.github.io/mikyasgame/hafizana_guven/index.html';

let mainWindow = null;
let triedBackup = false;
let loadedFallback = false;

function loadLocalFallback() {
    if (!mainWindow || loadedFallback) return;
    loadedFallback = true;
    mainWindow.loadFile(path.join(__dirname, 'index.html')).catch(() => {});
}

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1024,
        height: 768,
        fullscreen: true,
        backgroundColor: '#000000',
        title: 'Hafızana Güven',
        icon: path.join(__dirname, 'icon.ico'),
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true,
            sandbox: false,
            spellcheck: false
        }
    });

    Menu.setApplicationMenu(null);

    // F11 ile tam ekran aç/kapat desteği
    mainWindow.webContents.on('before-input-event', (event, input) => {
        if (input.type === 'keyDown' && input.key === 'F11') {
            mainWindow.setFullScreen(!mainWindow.isFullScreen());
            event.preventDefault();
        }
    });

    // Telegram, WhatsApp gibi dış bağlantıları varsayılan tarayıcıda aç
    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        if (url && /^https?:\/\//i.test(url)) {
            shell.openExternal(url).catch(() => {});
        }
        return { action: 'deny' };
    });

    mainWindow.webContents.on('will-navigate', (event, url) => {
        if (!url) return;
        const isAllowedAppUrl =
            url.startsWith('file://') ||
            url.includes('mikyasstudio.com.tr/hafizana_guven') ||
            url.includes('cengiz145.github.io/mikyasgame/hafizana_guven');
        if (!isAllowedAppUrl && /^https?:\/\//i.test(url)) {
            event.preventDefault();
            shell.openExternal(url).catch(() => {});
        }
    });

    // İnternet yoksa veya sunucuya ulaşılamazsa anında yerel çevrimdışı pakete geç
    mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL, isMainFrame) => {
        if (!isMainFrame) return;
        if (!triedBackup) {
            triedBackup = true;
            mainWindow.loadURL(BACKUP_URL).catch(() => loadLocalFallback());
        } else {
            loadLocalFallback();
        }
    });

    // Önce canlı HTTPS sürümünü dene (böylece portatif uygulama her zaman güncel kalır), hata varsa yerel dosyayı aç
    mainWindow.loadURL(LIVE_URL).catch(() => {
        triedBackup = true;
        loadLocalFallback();
    });

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

ipcMain.on('hg-quit-app', () => {
    app.quit();
});

app.whenReady().then(() => {
    // NVDA ve JAWS ekran okuyucular için tam erişilebilirlik ağacını zorunlu aç
    try {
        app.setAccessibilitySupportEnabled(true);
    } catch (e) {}

    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});
