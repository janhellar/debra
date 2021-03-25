export type Path = string;

export type SelectedTab = 'files' | 'dependencies' | 'logs';

export interface Package {
  name: string;
  version: string;
}