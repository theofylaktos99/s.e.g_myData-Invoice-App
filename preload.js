const { contextBridge, ipcMain } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  getVersion: () => ipcMain.invoke('get-version'),
  getPlatform: () => ipcMain.invoke('get-platform'),
});
