import React, { ReactElement, useReducer } from 'react';
import { Layout } from 'antd';

import Menu from './Menu';
import Files from './Files';
import Dependencies from './Dependencies';
import Logs from './Logs';
import {
  ProjectReducer,
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

  const [state, dispatch] = useReducer<ProjectReducer>(projectReducer, projectDefaultValue(projectPath));

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
