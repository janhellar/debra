import React, { useCallback, useEffect, useContext } from 'react';
import { Layout } from 'antd';

import FileTree from './FileTree';
import Editor from './Editor';
import { readDir } from '../utils';
import { ProjectStateContext, ProjectDispatchContext } from '../contexts';

const { Content, Sider } = Layout;

function Files() {
  const projectState = useContext(ProjectStateContext);

  const { common } = projectState;
  const { projectPath } = common;

  const dispatch = useContext(ProjectDispatchContext);

  const refreshDirTree = useCallback(async (dirPath: string) => {
    const fileTreeData = await readDir(dirPath);

    dispatch(['editor.fileTreeData', fileTreeData]);
  }, []);

  useEffect(() => {
    refreshDirTree(`${projectPath}/src`);
  }, [projectPath]);

  const saveFile = useCallback(async (path: string, content: string) => {
    await window.electron.saveFile(path, content);

    dispatch(['editor.changedFiles',
      (prevValue: string[]) => {
        const index = prevValue.indexOf(path);
        return [
          ...prevValue.slice(0, index),
          ...prevValue.slice(index + 1)
        ];
      }
    ]);
  }, []);

  const sider = (
    <FileTree
      onFileChange={() => refreshDirTree(`${projectPath}/src`)}
    />
  );

  const content = (
    <Editor
      onSave={saveFile}
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
