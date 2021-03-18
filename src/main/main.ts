import { app, BrowserWindow } from 'electron';
import path from 'path';
import { ipcMain, dialog } from 'electron';
import { promises as fsPromises, existsSync } from 'fs';
import { spawn, ChildProcess } from 'child_process';
import { Project } from 'ts-morph';
import npm from 'npm';
import { platform } from 'os';
import kill from 'tree-kill';

const { readdir, readFile, writeFile } = fsPromises;

const appRootPath = path.resolve(__dirname, '../..');
const resourcesPath = path.resolve(appRootPath, '..');
const asar = path.resolve(resourcesPath, 'app.asar');
const nodePath = path.resolve(
  existsSync(asar) ? resourcesPath : appRootPath,
  `bin/${platform()}/node/bin`
);
const PATH = process.env.PATH;
process.env.PATH = `${nodePath}:${PATH}`;

const runningCommands: ChildProcess[] = [];

let win: BrowserWindow;

function createWindow() {
  win = new BrowserWindow({
    width: 1280,
    height: 960,
    webPreferences: {
      preload: path.resolve(__dirname, 'preload.js'),
    },
    autoHideMenuBar: true,
    icon: path.resolve(__dirname, 'icon.png')
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

ipcMain.handle('save-file', async (_, filePath, fileContent) => {
  return await writeFile(filePath, fileContent);
});

ipcMain.handle('npm', (_, options) => {
  const { args, projectPath } = options;

  return new Promise<void>(resolve => {
    const command = spawn('npm', args.split(' '), {
      cwd: projectPath,
      shell: true,
      windowsHide: true
    });

    runningCommands.push(command);

    command.on('close', () => {
      const index = runningCommands.indexOf(command);
      runningCommands.splice(index, 1);
      resolve();
    });

    command.stdout.on('data', data => console.log(data.toString()));
    command.stderr.on('data', data => console.log(data.toString()));
  }).catch(console.log);
});

ipcMain.handle('kill', () => {
  runningCommands.forEach(command => {
    try {
      kill(command.pid, 'SIGKILL');
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

ipcMain.handle('load-modules', async (_, projectPath: string) => {
  const results: any[] = [];

  async function loadDir(dir: string) {
    const entries = await readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.isDirectory()) {
        await loadDir(`${dir}/${entry.name}`)
        
      } else if (entry.name.endsWith('.ts') || entry.name.endsWith('.json')) {
        const filePath = `${dir}/${entry.name}`;
        const content = await readFile(filePath, 'utf-8');
        results.push({
          content,
          path: filePath.substring(projectPath.length)
        });
      }
    }
  }
  
  await loadDir(`${projectPath}/node_modules`);
  return results;
});

ipcMain.handle('load-source', async (_, projectPath: string) => {
  const results: any[] = [];

  async function loadDir(dir: string) {
    const entries = await readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.isDirectory()) {
        await loadDir(`${dir}/${entry.name}`);
      } else {
        const filePath = `${dir}/${entry.name}`;
        const content = await readFile(filePath, 'utf-8');
        results.push({
          content,
          path: filePath.substring(projectPath.length)
        });
      }
    }
  }
  
  await loadDir(`${projectPath}/src`);
  return results;
});