const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');

function createWindow () {
  const mainWindow = new BrowserWindow({
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
  
  // Ana HTML oyun dosyasını yükle
  mainWindow.loadFile('index.html');
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
