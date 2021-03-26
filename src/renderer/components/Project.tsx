import React, { ReactElement, useReducer, useEffect } from 'react';
import { Layout } from 'antd';
import { useMonaco } from "@monaco-editor/react";

import Menu from './Menu';
import Files from './Files';
import Dependencies from './Dependencies';
import Logs from './Logs';
import {
  ProjectStateContext,
  ProjectDispatchContext,
  projectReducer,
  projectDefaultValue
} from '../contexts';

import './Project.css';

const { Header } = Layout;

interface ProjectProps {
  projectPath: string;
  onOpenProjects: () => void;
}

function Project(props: ProjectProps) {
  const { projectPath, onOpenProjects } = props;

  const [state, dispatch] = useReducer(projectReducer, projectDefaultValue(projectPath));

  const monaco = useMonaco();
  
  useEffect(() => {
    if (!monaco) return;

    let canceled = false;

    monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
      jsx: 2,
      forceConsistentCasingInFileNames: true,
      skipLibCheck: true,
      esModuleInterop: true,
      strict: true,
      module: 1
    });

    async function loadAll() {
      if (!monaco) return;

      dispatch(['editor.loading', true]);

      const source = await window.electron.loadSource(projectPath);
      for (const file of source) {
        monaco.editor.createModel(file.content, undefined, monaco.Uri.parse(`file://${file.path}`));
      }

      const files = (await window.electron.loadModules(projectPath)).map((file: {
        content: string;
        path: string;
      }) => ({
        content: file.content,
        filePath: `file://${file.path}`
      }));
      monaco.languages.typescript.typescriptDefaults.setExtraLibs(files);
      // for (const file of files) {
      //   monaco.languages.typescript.typescriptDefaults.addExtraLib(file.content, 'file://' + file.path);
      //   // TODO: use setExtraLibs instead of ^
        
      // }

      !canceled && dispatch(['editor.loading', false]);
    }

    loadAll();

    return () => {
      canceled = true;

      monaco.editor.getModels().forEach(model => model.dispose());
      monaco.languages.typescript.typescriptDefaults.setExtraLibs([]);
    }
  }, [projectPath, monaco]);

  const menu = (
    <Menu
      onProjectsClick={onOpenProjects}
    />
  );

  const files = (
    <Files
    />
  );

  const dependencies = (
    <Dependencies
    />
  );

  const logs = (
    <Logs
    />
  );

  let content: ReactElement;

  switch (state.menu.selectedTab) {
    case 'files':
      content = files;
      break;
    case 'dependencies':
      content = dependencies;
      break;
    case 'logs':
      content = logs;
      break;
    default:
      content = files;
  }

  const layout = (
    <Layout className="Project">
      <Header>
        {menu}
      </Header>
      <Layout>
        {content}
      </Layout>
    </Layout>
  );

  return (
    <ProjectStateContext.Provider value={state}>
      <ProjectDispatchContext.Provider value={dispatch}>
        {layout}
      </ProjectDispatchContext.Provider>
    </ProjectStateContext.Provider>
  );
}

export default Project;
