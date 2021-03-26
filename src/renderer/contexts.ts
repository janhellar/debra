import { createContext, Dispatch, Context } from 'react';
import { DataNode } from 'rc-tree/lib/interface';
import cloneDeep from 'lodash/cloneDeep';
import set from 'lodash/set';
import get from 'lodash/get';
import isFunction from 'lodash/isFunction';

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

// type TTProjectAction<Section extends keyof ProjectState, Field extends keyof (ProjectState[Section])> = {
//   // 'set',
//   section: Section,
//   field: Field,
//   // ProjectState[Section][Field] | ((prevValue: ProjectState[Section][Field]) => ProjectState[Section][Field]),
// };

// type TTProjectAction<Section extends keyof ProjectState> = {
//   // 'set',
//   section: Key in keyof ProjectState;
//   field: Field,
//   // ProjectState[Section][Field] | ((prevValue: ProjectState[Section][Field]) => ProjectState[Section][Field]),
// };

// type PathsToStringProps<T> = T extends string ? [] : {
//   [K in Extract<keyof T, string>]: [K, ...PathsToStringProps<T[K]>]
// }[Extract<keyof T, string>];

// type Join<T extends string[], D extends string> =
//     T extends [] ? never :
//     T extends [infer F] ? F :
//     T extends [infer F, ...infer R] ?
//     F extends string ? 
//     `${F}${D}${Join<Extract<R, string[]>, D>}` : never : string; 

// type ProjectAction = Join<PathsToStringProps<ProjectState>, ".">;

// export type DeepDotKey<T> = {
//   [P in keyof T]: DeepDotKey<T[P]>;
// } & (() => string | number);

// export function deepDotKey<T>(prev?: string | number): DeepDotKey<T> {
//   return new Proxy<any>(() => prev, {
//       get: (_, next) => {
//           if (typeof next === "symbol") {
//               throw new Error("Cannot use symbols with deepDotKey.");
//           }
//           return deepDotKey(prev ? `${prev}.${next}` : next);
//       },
//   });
// }

// const b = deepDotKey<ProjectState>().common.projectPath

// const a: A = ;


type PathImpl<T, K extends keyof T> =
  K extends string
  ? T[K] extends Record<string, any>
    ? T[K] extends ArrayLike<any>
      ? K | `${K}.${PathImpl<T[K], Exclude<keyof T[K], keyof any[]>>}`
      : K | `${K}.${PathImpl<T[K], keyof T[K]>}`
    : K
  : never;

type TPath<T> = PathImpl<T, keyof T> | keyof T;


// type PathImpl<T, K extends keyof T> =
//   K extends string
//   ? T[K] extends Record<string, any>
//     ? T[K] extends ArrayLike<any>
//       ? K | `${K}.${PathImpl<T[K], Exclude<keyof T[K], keyof any[]>>}`
//       : K | `${K}.${PathImpl<T[K], keyof T[K]>}`
//     : K
//   : never;

// type TPath<T> = PathImpl<T, keyof T> | keyof T;

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



// const b: PathValue<ProjectState, 'menu.running'>

// type Moje = Path<ProjectState>;

// type a = Moje<ProjectState>;

type TProjectAction<T, P extends TPath<T>> = { [A in P]: [
  A,
  PathValue<T, A> | ((prevValue: PathValue<T, A>) => PathValue<T, A>),
] }[P];

// type TProjectAction<T, P extends TPath<T>> = [
//   P,
//   PathValue<T, P>// | ((prevValue: PathValue<T, P>) => PathValue<T, P>),
// ];

// type ProjectAction = [
//   'set', ''
// ]

// const a: ProjectAction = ['set', 'menu.running', { asdf: 'afsd ' }];


// get<ProjectState, Path<ProjectState>>('')

// type ProjectAction = { [Section in keyof ProjectState]: [
//   Section + keyof ProjectState[Section],
//   // { [Field in keyof ProjectState[Section]]: ProjectState[Section][Field] }[keyof ProjectState[Section]]
// ] }[keyof ProjectState];
// // type ProjectAction = ["common", "projectPath", string] | ["menu", keyof MenuState, boolean | SelectedTab] | ["editor", keyof EditorState, string | boolean | DataNode[] | string[]];

// const a: ProjectAction = ['menu', 'activeFile', 5]

// const a: TTProjectAction<'menu', keyof ProjectState['menu']> = ['set', 'menu', 'running', true];
// const a: TTProjectAction<'menu', keyof ProjectState['menu']> = { section: 'menu', field: 'running' };

// type TProjectAction<Section extends keyof ProjectState> = TTProjectAction<Section, keyof (ProjectState[Section])>;

// // const b: TProjectAction<'menu'> = ['set', 'menu', 'running', true];
// const b: TProjectAction<'menu'> = { section: 'menu', field: 'running' };

// type ProjectAction = TProjectAction<keyof ProjectState>;

// // const c: ProjectAction = ['set', 'menu', 'running', true];
// const c: ProjectAction = { section: 'menu', field: 'running' };

type ProjectAction = TProjectAction<ProjectState, TPath<ProjectState>>;

// const a: ProjectAction = ['common.projectPath', false];

// export type ProjectReducer = (prevState: ProjectState, action: ProjectAction) => ProjectState;

// declare function get<T, P extends TPath<T>>(obj: T, path: P): PathValue<T, P>;

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
