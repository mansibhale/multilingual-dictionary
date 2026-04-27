console.log("Electron starting...");
const path = require('path');
const { app, BrowserWindow, ipcMain } = require('electron');

const isDev = process.env.ELECTRON_START_URL !== undefined || process.env.NODE_ENV === 'development';

function createWindow() {
  const win = new BrowserWindow({
    width: 1000,
    height: 700,
    webPreferences: {
      preload: path.join(__dirname, 'electron-preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  win.setMenuBarVisibility(false);
  win.setMenu(null);

  if (isDev) {
    const url = process.env.ELECTRON_START_URL || 'http://localhost:3000';
    win.loadURL(url);
  } else {
    win.loadFile(path.join(__dirname, 'index.html'));
  }
}

const db = require('./db');

ipcMain.handle('get-words', async () => {
  return new Promise((resolve, reject) => {
    db.getWords((err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});