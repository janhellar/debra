import { createContext, Dispatch } from 'react';
import { DataNode } from 'rc-tree/lib/interface';

import { Path, SelectedTab, Package } from './types';

interface CommonState {
  projectPath: Path;
}

interface MenuState {
  selectedTab: SelectedTab;
  running: boolean;
}

interface EditorState {
  fileTreeData: DataNode[];
  activeFile?: Path;
  changedFiles: Path[];
  loading: boolean;
}

interface DependenciesState {
  packages: Package[];
  installing: boolean;
}

interface LogsState {
  main: string;
  renderer: string;
  electron: string;
}

interface ProjectState {
  common: CommonState;
  menu: MenuState;
  editor: EditorState;
  dependencies: DependenciesState;
  logs: LogsState;
}

interface ProjectAction {
  section: keyof ProjectState;
  field: keyof (MenuState & EditorState & DependenciesState & LogsState);
  newValue: any;
}

export type ProjectReducer = (prevState: ProjectState, action: ProjectAction) => ProjectState;

export function projectReducer(prevState: ProjectState, action: ProjectAction): ProjectState {
  const { section, field, newValue } = action;

  const prevSection = prevState[section];

  let value: any;

  if (typeof newValue === 'function') {
    value = newValue(prevSection[field]);
  } else {
    value = newValue;
  }

  return {
    ...prevState,
    [section]: {
      ...prevSection,
      [field]: value
    }
  };
}

export function projectDefaultValue(projectPath: Path): ProjectState {
  return {
    common: {
      projectPath,
    },
    menu: {
      selectedTab: 'files',
      running: false,
    },
    editor: {
      fileTreeData: [],
      changedFiles: [],
      loading: false,
    },
    dependencies: {
      packages: [],
      installing: false,
    },
    logs: {
      main: '',
      renderer: '',
      electron: '',
    }
  };
};

export const ProjectStateContext = createContext<ProjectState>(null);
export const ProjectDispatchContext = createContext<Dispatch<ProjectAction>>(null);