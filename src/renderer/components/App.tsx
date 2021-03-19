import React, { useCallback, useEffect, useState } from 'react';
import { DataNode } from 'rc-tree/lib/interface';

import Layout from './Layout';
import Menu from './Menu';
import FileTree from './FileTree';
import Editor from './Editor';
import { readDir } from '../utils';

function App() {
  const [projectPath, setProjectPath] = useState('/Users/jan.hellar/doma/debra-test');
  const [directoryEntries, setDirectoryEntries] = useState<DataNode[]>([]);
  const [selectedFile, setSelectedFile] = useState<string>('');
  const [edited, setEdited] = useState<string[]>([]);

  const refreshDirTree = useCallback(async (dirPath: string) => {
    setDirectoryEntries(await readDir(dirPath));
  }, []);

  useEffect(() => {
    refreshDirTree(`${projectPath}/src`);
  }, [projectPath]);

  const saveFile = useCallback(async (path: string, content: string) => {
    await window.electron.saveFile(path, content);
    setEdited(files => {
      const index = files.indexOf(path);
      return [
        ...files.slice(0, index),
        ...files.slice(index + 1)
      ];
    });
  }, []);

  const header = (
    <Menu
      fileChanged={edited.length > 0}
    />
  );

  const sider = (
    <FileTree
      directoryEntries={directoryEntries}
      editedFiles={edited}
      onFileSelected={setSelectedFile}
    />
  );

  const content = (
    <Editor
      projectPath={projectPath}
      filePath={selectedFile}
      onSave={saveFile}
      onChange={file => !edited.includes(file) && setEdited(files => [...files, file])}
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
