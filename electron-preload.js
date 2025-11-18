// electron-preload.js
const { contextBridge, ipcRenderer } = require('electron');

/**
 * Expose a tiny safe API to the renderer (your React app).
 * You can expand the allowed channels if you need more desktop features.
 */
contextBridge.exposeInMainWorld('electronAPI', {
  send: (channel, data) => {
    const valid = ['toMain'];
    if (valid.includes(channel)) ipcRenderer.send(channel, data);
  },
  receive: (channel, func) => {
    const valid = ['fromMain'];
    if (valid.includes(channel)) ipcRenderer.on(channel, (event, ...args) => func(...args));
  }
});

contextBridge.exposeInMainWorld('database', {
  getWords: () => ipcRenderer.invoke('get-words')
});

