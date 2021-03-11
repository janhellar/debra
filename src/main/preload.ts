import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld(
  'electron', {
    readDir: (dirPath: string) => ipcRenderer.invoke('read-dir', dirPath),
    readFile: (filePath: string) => ipcRenderer.invoke('read-file', filePath)
  }
);
