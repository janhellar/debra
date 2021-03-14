import React, { useCallback, useEffect, useState } from 'react';
import { Button, Tree } from 'antd';
import Editor from "@monaco-editor/react";
import { CaretRightOutlined } from '@ant-design/icons';

import './App.css';

const { DirectoryTree } = Tree;

// const testPath = '/home/jan/Projekty/debra-test-project';
// const testPath = '/home/debra/debra-test-project';

declare global {
  interface Window {
    electron: any;
  }
}

export default function App() {
  const [projectPath, setProjectPath] = useState('');
  const [directoryEntries, setDirectoryEntries] = useState<any[]>([]);
  const [selectedFile, setSelectedFile] = useState<string>();
  const [fileContent, setFileContent] = useState<string>('');
  const [building, setBuilding] = useState(false);
  const [debugging, setDebugging] = useState(false);

  const refreshDirTree = useCallback(async (dirPath: string) => {
    async function readDir(dirPath: string): Promise<any[]> {
      const entries = await window.electron.readDir(dirPath);

      const result = [];

      for (const entry of entries) {
        const entryPath = `${dirPath}/${entry.name}`;

        if (entry.directory) {
          const subdirEntries = await readDir(entryPath);

          result.push({
            title: entry.name,
            key: entryPath,
            children: subdirEntries
          });
        } else {
          result.push({
            title: entry.name,
            key: entryPath,
            isLeaf: !entry.directory,
          });
        }
      }

      return result;
    }

    setDirectoryEntries(await readDir(dirPath));
  }, []);

  useEffect(() => {
    refreshDirTree(projectPath);
  }, [projectPath]);

  useEffect(() => {
    async function getFileContent() {
      setFileContent(await window.electron.readFile(selectedFile));
    }

    selectedFile && getFileContent();
  }, [selectedFile]);

  const build = useCallback(async () => {
    setBuilding(true);
    await window.electron.npm({
      args: 'run build:main',
      projectPath: projectPath
    });
    // await window.electron.tsBuild(`${testPath}/config/main/tsconfig.json`);
    setBuilding(false);
  }, [projectPath]);

  const debug = useCallback(async () => {
    setDebugging(true);
    await window.electron.npm({ args: 'run build:main', projectPath: projectPath });
    await window.electron.npm({ args: 'run build:renderer', projectPath: projectPath });
    window.electron.npm({ args: 'run start:electron', projectPath: projectPath });
    window.electron.npm({ args: 'run start:renderer', projectPath: projectPath });
  }, [projectPath]);

  const stopDebug = useCallback(async () => {
    window.electron.kill();
    setDebugging(false);
  }, []);

  const npmInstall = useCallback(async () => {
    // const data = await window.electron.npmInstall(testPath);
    await window.electron.npm({ args: 'install', projectPath: projectPath });
    // console.log(data);
  }, [projectPath]);

  const openProject = useCallback(async () => {
    const result = await window.electron.openDir();
    if (result.filePaths.length > 0) {
      setProjectPath(result.filePaths[0]);
    }
    

    console.log(result);
  }, []);

  return (
    <div className="app">
      <div className="header">
        <Button size="small" onClick={() => refreshDirTree(projectPath)}>Refresh</Button>
        <Button size="small" onClick={openProject}>Open</Button>
        <Button size="small" icon={<CaretRightOutlined />} disabled={building} onClick={debugging ? stopDebug : debug}>{debugging ? 'Stop debug' : 'Debug'}</Button>
        <Button size="small" disabled={building || debugging} onClick={build} loading={building}>Build</Button>
        <Button size="small" onClick={npmInstall}>npm install</Button>
      </div>
      <div className="content">
        <div className="directory-tree">
          <DirectoryTree
            multiple
            defaultExpandAll
            treeData={directoryEntries}
            onSelect={selected => selected.length === 1 && setSelectedFile(selected[0].toString())}
          />
        </div>
        <div className="editor">
          <Editor
            path={`${projectPath}/${selectedFile}`}
            value={fileContent}
            options={{
              automaticLayout: true,
              renderValidationDecorations: 'off'
            }}
          />
        </div>
      </div>
    </div>
  );
}
