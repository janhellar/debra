import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld(
  'electron', {
    readDir: (dirPath: string) => ipcRenderer.invoke('read-dir', dirPath),
    readFile: (filePath: string) => ipcRenderer.invoke('read-file', filePath),
    npm: (options: any) => ipcRenderer.invoke('npm', options),
    kill: () => ipcRenderer.invoke('kill'),
    tsBuild: (tsConfigFilePath: string) => ipcRenderer.invoke('ts-build', tsConfigFilePath),
    npmInstall: (projectPath: string) => ipcRenderer.invoke('npm-install', projectPath),
    openDir: () => ipcRenderer.invoke('open-dir')
  }
);
