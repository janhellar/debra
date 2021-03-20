import React, { useState } from 'react';

import Project from './Project';
import Projects from './Projects';

function App() {
  const [projectPath, setProjectPath] = useState<string | null>();

  if (projectPath) {
    return <Project projectPath={projectPath} onOpenProjects={() => setProjectPath(null)} />
  }

  return <Projects onProjectSelect={setProjectPath} />;
}

export default App;
