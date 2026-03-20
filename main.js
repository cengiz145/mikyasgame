const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');

// Pencere nesnesini global referansta tutuyoruz.
// Aksi halde JavaScript Çöp Toplayıcısı (Garbage Collector) fonksiyon bitince pencereyi rastgele kapatabilir.
let mainWindow;

function createWindow () {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    fullscreen: true, // Native EXE formatını yansıtmak için pencere tam ekran açılır
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  // Üst menü çubuğunu tamamen kaldırarak web / tarayıcı hissini yok et.
  Menu.setApplicationMenu(null);
  
  // Ana HTML oyun dosyasını her ortamda çalışması için path.join ile güvenli olarak yükle
  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  mainWindow.on('closed', function () {
    mainWindow = null; // Kapatılınca bellek sızıntısını önlemek için boşalt
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});
