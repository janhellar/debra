import React, { useEffect, useState } from 'react';
import { Card, Layout, Button } from 'antd';
// import { DeleteOutlined } from '@ant-design/icons';

import './Projects.css';

const { Content } = Layout;

interface ProjectsProps {
  onProjectSelect: (projectPath: string) => void;
}

function Projects(props: ProjectsProps) {
  const { onProjectSelect } = props;

  const [projects, setProjects] = useState<string[]>([]);

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
      // extra={<Button icon={<DeleteOutlined key="setting" />} type="text" />}
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
