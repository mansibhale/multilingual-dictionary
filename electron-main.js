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

  if (isDev) {
    const url = process.env.ELECTRON_START_URL || 'http://localhost:3000';
    win.loadURL(url);
    // optionally open devtools while developing
    win.webContents.openDevTools();
  } else {
    win.loadFile(path.join(__dirname, 'build', 'index.html'));
  }
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  // On macOS typical behavior is to keep app open until user quits explicitly
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  // Recreate a window on macOS when the dock icon is clicked
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
