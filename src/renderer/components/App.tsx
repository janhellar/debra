import React, { useState } from 'react';

import Project from './Project';
import Projects from './Projects';

function App() {
  const [projectPath, setProjectPath] = useState<string>();

  if (projectPath) {
    return <Project projectPath={projectPath} />
  }

  return <Projects />;
}

export default App;
