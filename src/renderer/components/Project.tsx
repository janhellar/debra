import React, { ReactElement, useReducer, useEffect } from 'react';
import { Layout } from 'antd';
import MonacoEditor, { OnMount, useMonaco } from "@monaco-editor/react";

import Menu from './Menu';
import Files from './Files';
import Dependencies from './Dependencies';
import Logs from './Logs';
import {
  // ProjectReducer,
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
      // onEditorLoading(true);

      const source = await window.electron.loadSource(projectPath);
      for (const file of source) {
        monaco.editor.createModel(file.content, undefined, monaco.Uri.parse(`file://${file.path}`));
      }

      const files = await window.electron.loadModules(projectPath);
      for (const file of files) {
        monaco.languages.typescript.typescriptDefaults.addExtraLib(file.content, 'file://' + file.path);
        // TODO: use setExtraLibs instead of ^
        // monaco.languages.typescript.typescriptDefaults.setExtraLibs(...)
      }

      !canceled && dispatch(['editor.loading', false]);
    }

    loadAll();

    return () => {
      canceled = true;

      monaco.editor.getModels().forEach(model => model.dispose());
      monaco.languages.typescript.typescriptDefaults.setExtraLibs([]);
    }
  }, [projectPath, monaco]);

  // const [edited, setEdited] = useState<string[]>([]);
  // const [editorLoading, setEditorLoading] = useState(false);
  // const [tab, setTab] = useState<SelectedTab>('files');
  // const [installing, setInstalling] = useState(false);

  const menu = (
    <Menu
      // fileChanged={edited.length > 0}
      // editorLoading={editorLoading}
      onProjectsClick={onOpenProjects}
      // tab={tab}
      // onTabSelected={setTab}
      // projectPath={projectPath}
    />
  );

  const files = (
    <Files
      // projectPath={projectPath}
      // onEditorLoading={setEditorLoading}
      // edited={edited}
      // onEdited={setEdited}
    />
  );

  const dependencies = (
    <Dependencies
      // projectPath={projectPath}
      // onInstall={setInstalling}
      // installing={installing}
    />
  );

  const logs = (
    <Logs
      // projectPath={projectPath}
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
