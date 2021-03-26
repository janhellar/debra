import React, { useEffect, useState } from 'react';
import { Card, Layout, Button } from 'antd';
import { useMonaco } from '@monaco-editor/react'

import './Projects.css';

const { Content } = Layout;

interface ProjectsProps {
  onProjectSelect: (projectPath: string) => void;
}

function Projects(props: ProjectsProps) {
  const { onProjectSelect } = props;

  const [projects, setProjects] = useState<string[]>([]);

  const monaco = useMonaco();
  
  useEffect(() => {
    if (!monaco) return;

    monaco.editor.defineTheme('dark-theme', {
      base: 'vs-dark',
      inherit: true,
      rules: [],
      colors: {
        'editor.background': '#000000',
        'minimap.background': '#000000'
      },
    });
  }, [monaco]);

  useEffect(() => {
    async function load() {
      setProjects(await window.electron.loadProjects());
    }
    
    load();
  }, []);

  const card = (project: any) => (
    <Card
      key={project.name}
      hoverable
      title={project.name}
      className="card"
      onClick={() => onProjectSelect(project.path)}
    >
      Created: 2021/03/18<br />
      Last edited: 2021/03/19
    </Card>
  );

  const content = (
    <div className="content">
      <Button type="dashed" className="card">New Project</Button>
      {projects.map(project => (card(project)))}
    </div>
  );

  return (
    <Layout className="Projects">
      <Content>
        {content}
      </Content>
    </Layout>
  );
}

export default Projects;
