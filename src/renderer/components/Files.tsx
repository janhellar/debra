import React, { useCallback, useEffect, useState } from 'react';
import { DataNode } from 'rc-tree/lib/interface';
import { Layout } from 'antd';

import FileTree from './FileTree';
import Editor from './Editor';
import { readDir } from '../utils';

const { Content, Sider } = Layout;

interface FilesProps {
  projectPath: string;
  onEditorLoading: (loading: boolean) => void;
  onEdited: (set: (files: string[]) => string[]) => void;
  edited: string[];
}

function Files(props: FilesProps) {
  const { projectPath, onEditorLoading, onEdited, edited } = props;
  
  const [directoryEntries, setDirectoryEntries] = useState<DataNode[]>([]);
  const [selectedFile, setSelectedFile] = useState<string>('');

  const refreshDirTree = useCallback(async (dirPath: string) => {
    setDirectoryEntries(await readDir(dirPath));
  }, []);

  useEffect(() => {
    refreshDirTree(`${projectPath}/src`);
  }, [projectPath]);

  const saveFile = useCallback(async (path: string, content: string) => {
    await window.electron.saveFile(path, content);
    onEdited(files => {
      const index = files.indexOf(path);
      return [
        ...files.slice(0, index),
        ...files.slice(index + 1)
      ];
    });
  }, []);

  const sider = (
    <FileTree
      directoryEntries={directoryEntries}
      editedFiles={edited}
      onFileSelected={setSelectedFile}
      onFileChange={() => refreshDirTree(`${projectPath}/src`)}
    />
  );

  const content = (
    <Editor
      projectPath={projectPath}
      filePath={selectedFile}
      onSave={saveFile}
      onChange={file => !edited.includes(file) && onEdited(files => [...files, file])}
      onEditorLoading={onEditorLoading}
    />
  );

  return (
    <>
      <Sider width={300}>
        {sider}
      </Sider>
      <Layout>
        <Content>
          {content}
        </Content>
      </Layout>
    </>
  );
}

export default Files;
