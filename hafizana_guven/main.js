const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');

// Pencere nesnesini global referansta tutuyoruz.
// Aksi halde JavaScript Ã‡Ã¶p ToplayÄ±cÄ±sÄ± (Garbage Collector) fonksiyon bitince pencereyi rastgele kapatabilir.
let mainWindow;

function createWindow () {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    fullscreen: true, // Native EXE formatÄ±nÄ± yansÄ±tmak iÃ§in pencere tam ekran aÃ§Ä±lÄ±r
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  // Ãœst menÃ¼ Ã§ubuÄŸunu tamamen kaldÄ±rarak web / tarayÄ±cÄ± hissini yok et.
  Menu.setApplicationMenu(null);
  
  // Ana HTML oyun dosyasÄ±nÄ± her ortamda Ã§alÄ±ÅŸmasÄ± iÃ§in path.join ile gÃ¼venli olarak yÃ¼kle
  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  mainWindow.on('closed', function () {
    mainWindow = null; // KapatÄ±lÄ±nca bellek sÄ±zÄ±ntÄ±sÄ±nÄ± Ã¶nlemek iÃ§in boÅŸalt
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
