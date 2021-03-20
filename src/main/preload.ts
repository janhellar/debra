import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld(
  'electron', {
    readDir: (dirPath: string) => ipcRenderer.invoke('read-dir', dirPath),
    readFile: (filePath: string) => ipcRenderer.invoke('read-file', filePath),
    saveFile: (filePath: string, fileContent: string) => ipcRenderer.invoke('save-file', filePath, fileContent),
    npm: (options: any) => ipcRenderer.invoke('npm', options),
    kill: () => ipcRenderer.invoke('kill'),
    tsBuild: (tsConfigFilePath: string) => ipcRenderer.invoke('ts-build', tsConfigFilePath),
    npmInstall: (projectPath: string, pkg: string) => ipcRenderer.invoke('npm-install', projectPath, pkg),
    openDir: () => ipcRenderer.invoke('open-dir'),
    loadModules: (projectPath: string) => ipcRenderer.invoke('load-modules', projectPath),
    loadSource: (projectPath: string) => ipcRenderer.invoke('load-source', projectPath),
    loadProjects: () => ipcRenderer.invoke('load-projects'),
    loadDependencies: (projectPath: string) => ipcRenderer.invoke('load-dependencies', projectPath),
    test: () => ipcRenderer.invoke('test'),
    logs: (component: string, func: (log: string) => void) => {
      ipcRenderer.on(`logs-${component}`, (_, log: string) => func(log))
    },
    compile: (projectPath: string, component: string) => ipcRenderer.invoke('compile', projectPath, component)
  }
);

// contextBridge.exposeInMainWorld(
//   "api", {
//       send: (channel, data) => {
//           // whitelist channels
//           let validChannels = ["toMain"];
//           if (validChannels.includes(channel)) {
//               ipcRenderer.send(channel, data);
//           }
//       },
//       receive: (channel, func) => {
//           let validChannels = ["fromMain"];
//           if (validChannels.includes(channel)) {
//               // Deliberately strip event as it includes `sender` 
//               ipcRenderer.on(channel, (event, ...args) => func(...args));
//           }
//       }
//   }
// );
// TODO: use ^