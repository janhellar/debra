import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld(
  'electron', {
    readDir: (dirPath: string) => ipcRenderer.invoke('read-dir', dirPath),
    readFile: (filePath: string) => ipcRenderer.invoke('read-file', filePath),
    saveFile: (filePath: string, fileContent: string) => ipcRenderer.invoke('save-file', filePath, fileContent),
    npm: (options: any) => ipcRenderer.invoke('npm', options),
    kill: () => ipcRenderer.invoke('kill'),
    tsBuild: (tsConfigFilePath: string) => ipcRenderer.invoke('ts-build', tsConfigFilePath),
    npmInstall: (projectPath: string) => ipcRenderer.invoke('npm-install', projectPath),
    openDir: () => ipcRenderer.invoke('open-dir'),
    loadModules: (projectPath: string) => ipcRenderer.invoke('load-modules', projectPath),
    loadSource: (projectPath: string) => ipcRenderer.invoke('load-source', projectPath)
  }
);
