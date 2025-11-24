// electron-main.js
const path = require('path');
const { app, BrowserWindow } = require('electron');

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
    win.loadFile(path.join(__dirname, 'build', 'index.html'));
  }
}


const { ipcMain } = require('electron');
const db = require('./db');  // Import our db helper

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
  // On macOS typical behavior is to keep app open until user quits explicitly
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  // Recreate a window on macOS when the dock icon is clicked
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
