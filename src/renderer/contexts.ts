import { createContext, Dispatch } from 'react';
import cloneDeep from 'lodash/cloneDeep';
import set from 'lodash/set';
import get from 'lodash/get';
import isFunction from 'lodash/isFunction';

import { Path, ProjectAction, ProjectState } from './types';

export function projectReducer(prevState: ProjectState, action: ProjectAction): ProjectState {
  const [path, newValue] = action;

  const prevValue = get(prevState, path);

  const value = isFunction(newValue) ? (newValue as any)(prevValue) : newValue;

  const newState = cloneDeep(prevState);

  set(newState, path, value);

  return newState;
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

export const ProjectStateContext = createContext<ProjectState>(projectDefaultValue(''));
export const ProjectDispatchContext = createContext<Dispatch<ProjectAction>>(() => {});
