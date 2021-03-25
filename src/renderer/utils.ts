import { DataNode } from 'rc-tree/lib/interface';

export async function readDir(dirPath: string): Promise<DataNode[]> {
  const entries = await window.electron.readDir(dirPath);

  const result: DataNode[] = [];

  for (const entry of entries) {
    const entryPath = `${dirPath}/${entry.name}`;

    if (entry.directory) {
      const subdirEntries = await readDir(entryPath);

      result.push({
        title: entry.name,
        key: entryPath,
        children: subdirEntries
      });
    } else {
      result.push({
        title: entry.name,
        key: entryPath,
        isLeaf: !entry.directory,
      });
    }
  }

  result.sort((a, b) => a.isLeaf === b.isLeaf ? 0 : a.isLeaf ? 1 : -1);

  return result;
}
