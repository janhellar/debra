import React, { useCallback, useEffect, useState } from 'react';
import { DataNode } from 'rc-tree/lib/interface';

import Layout from './Layout';
import Menu from './Menu';
import FileTree from './FileTree';
import Editor from './Editor';
import { readDir } from '../utils';

function App() {
  const [projectPath, setProjectPath] = useState('/home/jan/Projekty/debra-test-project');
  const [directoryEntries, setDirectoryEntries] = useState<DataNode[]>([]);
  const [selectedFile, setSelectedFile] = useState<string>('');
  const [fileContent, setFileContent] = useState<string>('');
  const [edited, setEdited] = useState(false);

  const refreshDirTree = useCallback(async (dirPath: string) => {
    setDirectoryEntries(await readDir(dirPath));
  }, []);

  useEffect(() => {
    refreshDirTree(projectPath);
    async function b() {
      const a = await window.electron.loadModules(projectPath);
    }
    b();
  }, [projectPath]);

  const getFileContent = useCallback(async () => {
    const content = await window.electron.readFile(selectedFile);
    setFileContent(content);
  }, [selectedFile]);

  useEffect(() => {
    selectedFile && getFileContent();
  }, [selectedFile]);

  const saveFile = useCallback(async (path: string, content: string) => {
    await window.electron.saveFile(path, content);
    setEdited(false);
  }, []);

  const header = (
    <Menu
      fileChanged={edited}
    />
  );

  const sider = (
    <FileTree
      directoryEntries={directoryEntries}
      onFileSelected={setSelectedFile}
    />
  );

  const content = (
    <Editor
      projectPath={projectPath}
      fileContent={fileContent}
      filePath={selectedFile}
      onSave={saveFile}
      onChange={() => !edited && setEdited(true)}
    />
  );

  return (
    <Layout
      header={header}
      sider={sider}
      content={content}
    />
  );
}

export default App;
