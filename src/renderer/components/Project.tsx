import React, { useCallback, useEffect, useState } from 'react';
import { DataNode } from 'rc-tree/lib/interface';

import Layout from './Layout';
import Menu from './Menu';
import FileTree from './FileTree';
import Editor from './Editor';
import { readDir } from '../utils';

interface ProjectProps {
  projectPath: string;
}

function Project(props: ProjectProps) {
  const { projectPath } = props;
  
  const [directoryEntries, setDirectoryEntries] = useState<DataNode[]>([]);
  const [selectedFile, setSelectedFile] = useState<string>('');
  const [edited, setEdited] = useState<string[]>([]);
  const [editorLoading, setEditorLoading] = useState(false);

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
      editorLoading={editorLoading}
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
      onEditorLoading={setEditorLoading}
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

export default Project;
