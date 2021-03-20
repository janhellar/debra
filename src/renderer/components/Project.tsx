import React, { ReactElement, useState } from 'react';
import { Layout } from 'antd';

import Menu, { SelectedTab } from './Menu';
import Files from './Files';
import Dependencies from './Dependencies';
import Logs from './Logs';

import './Project.css';

const { Header } = Layout;

interface ProjectProps {
  projectPath: string;
  onOpenProjects: () => void;
}

function Project(props: ProjectProps) {
  const { projectPath, onOpenProjects } = props;

  const [edited, setEdited] = useState<string[]>([]);
  const [editorLoading, setEditorLoading] = useState(false);
  const [tab, setTab] = useState<SelectedTab>('files');
  const [installing, setInstalling] = useState(false);

  const header = (
    <Menu
      fileChanged={edited.length > 0}
      editorLoading={editorLoading}
      onProjectsClick={onOpenProjects}
      tab={tab}
      onTabSelected={setTab}
      projectPath={projectPath}
    />
  );

  const files = (
    <Files
      projectPath={projectPath}
      onEditorLoading={setEditorLoading}
      edited={edited}
      onEdited={setEdited}
    />
  );

  const dependencies = (
    <Dependencies
      projectPath={projectPath}
      onInstall={setInstalling}
      installing={installing}
    />
  );

  const logs = (
    <Logs
      projectPath={projectPath}
    />
  );

  let content: ReactElement;

  switch (tab) {
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

  return (
    <Layout className="Project">
      <Header>
        {header}
      </Header>
      <Layout>
        {content}
      </Layout>
    </Layout>
  );
}

export default Project;
