import { DataNode } from 'rc-tree/lib/interface';

export type Path = string;

export type SelectedTab = 'files' | 'dependencies' | 'logs';

export interface Package {
  name: string;
  version: string;
}

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

export interface ProjectState {
  common: CommonState;
  menu: MenuState;
  editor: EditorState;
  dependencies: DependenciesState;
  logs: LogsState;
}

type PathImpl<T, K extends keyof T> =
  K extends string
  ? T[K] extends Record<string, any>
    ? T[K] extends ArrayLike<any>
      ? K | `${K}.${PathImpl<T[K], Exclude<keyof T[K], keyof any[]>>}`
      : K | `${K}.${PathImpl<T[K], keyof T[K]>}`
    : K
  : never;

type TPath<T> = PathImpl<T, keyof T> | keyof T;

type PathValue<T, P extends TPath<T>> =
  P extends `${infer K}.${infer Rest}`
  ? K extends keyof T
    ? Rest extends TPath<T[K]>
      ? PathValue<T[K], Rest>
      : never
    : never
  : P extends keyof T
    ? T[P]
    : never;

type TProjectAction<T, P extends TPath<T>> = { [A in P]: [
  A,
  PathValue<T, A> | ((prevValue: PathValue<T, A>) => PathValue<T, A>),
] }[P];

export type ProjectAction = TProjectAction<ProjectState, TPath<ProjectState>>;
