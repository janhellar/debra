import { app, BrowserWindow } from 'electron';
import path from 'path';
import { ipcMain } from 'electron';
import { promises as fsPromises } from 'fs';

const { readdir, readFile } = fsPromises;

const testProject = path.resolve(__dirname, '../renderer/index.html');

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.resolve(__dirname, 'preload.js')
    },
    autoHideMenuBar: true
  });

  win.loadFile(testProject);
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

ipcMain.handle('read-dir', async (_, dirPath) => {
  const entries = await readdir(dirPath, { withFileTypes: true });
  return entries.map(entry => ({
    name: entry.name,
    directory: entry.isDirectory()
  }));
});

ipcMain.handle('read-file', async (_, filePath) => {
  return await readFile(filePath, 'utf-8');
});
