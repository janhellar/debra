import { app, BrowserWindow } from 'electron';
import path from 'path';
import { ipcMain, dialog } from 'electron';
import { promises as fsPromises, existsSync, writeFileSync } from 'fs';
import { spawn, ChildProcess, exec } from 'child_process';
import { Project } from 'ts-morph';
import npm from 'npm';
import { platform } from 'os';
import kill from 'tree-kill';

const { readdir, readFile } = fsPromises;

const appRootPath = path.resolve(__dirname, '../..');
const resourcesPath = path.resolve(appRootPath, '..');
const asar = path.resolve(resourcesPath, 'app.asar');
const nodePath = path.resolve(
  existsSync(asar) ? resourcesPath : appRootPath,
  `bin/${platform()}/node/bin`
);
const PATH = process.env.PATH;
process.env.PATH = `${nodePath}:${PATH}`;

console.log(process.env.PATH);
// writeFileSync('/tmp/test.txt', process.env.PATH);

const runningCommands: ChildProcess[] = [];

let win: BrowserWindow;

function createWindow() {
  win = new BrowserWindow({
    width: 1280,
    height: 960,
    webPreferences: {
      preload: path.resolve(__dirname, 'preload.js'),
    },
    autoHideMenuBar: true
  });

  win.loadFile(path.resolve(__dirname, '../renderer/index.html'));
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

ipcMain.handle('npm', (_, options) => {
  const { args, projectPath } = options;

  // const npm = path.resolve(__dirname, '../../node_modules/.bin/npm');

  return new Promise<void>(resolve => {
    const command = spawn('npm', args.split(' '), {
      cwd: projectPath,
      // detached: true,
      // env: process.env,
      // stdio: 'inherit'
      shell: true,
      windowsHide: true
    });

    runningCommands.push(command);

    command.on('close', () => {
      const index = runningCommands.indexOf(command);
      runningCommands.splice(index, 1);
      resolve();
    });

    // command.stdout.on('data', data => win.webContents.send(commandName, data));
    // command.stderr.on('data', data => win.webContents.send(commandName, data));

    command.stdout.on('data', data => console.log(data.toString()));
    command.stderr.on('data', data => console.log(data.toString()));
  }).catch(console.log);
});

ipcMain.handle('kill', () => {
  runningCommands.forEach((command, index) => {
    console.log(index, command.pid);
    try {
      kill(command.pid, 'SIGKILL');
      // if (platform() === 'win32') {
      //   exec(`taskkill /pid ${command.pid} /T /F`);
      // } else {
      //   // process.kill(-command.pid, 'SIGKILL');
      //   command.kill('SIGKILL');
      // }
      
      // command.kill('SIGKILL')
    } catch (error) {
      console.log(error);
    }
  });
});

ipcMain.handle('ts-build', async (_, tsConfigFilePath) => {
  const project = new Project({ tsConfigFilePath });
  await project.emit();
});

ipcMain.handle('npm-install', async (_, projectPath) => {
  await new Promise<void>((resolve, reject) => {
    npm.load({}, error => {
      if (error) return reject(error);
      resolve();
    });
  });

  npm.on('log', console.log);

  npm.prefix = projectPath;

  await new Promise<void>((resolve, reject) => {
    npm.commands.install([], (error, data) => {
      if (error) return reject(error);
      resolve(data);
    });
  });
});

ipcMain.handle('open-dir', () => {
  return dialog.showOpenDialog(win, { properties: ['openDirectory'] });
});