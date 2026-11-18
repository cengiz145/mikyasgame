const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('AndroidAppBridge', {
    closeApp: () => {
        ipcRenderer.send('hg-quit-app');
    }
});
