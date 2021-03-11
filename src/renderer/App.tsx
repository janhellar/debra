import React, { useCallback, useEffect, useState } from 'react';
import { Button, Tree } from 'antd';
import Editor from "@monaco-editor/react";

import './App.css';

const { DirectoryTree } = Tree;

const testPath = '/home/jan/Projekty/debra-editor';

export default function App() {
  const [directoryEntries, setDirectoryEntries] = useState<any[]>([]);
  const [selectedFile, setSelectedFile] = useState<string>();
  const [expandedDirectories, setExpandedDirecotires] = useState<string[]>([]);
  const [fileContent, setFileContent] = useState<string>('');

  useEffect(() => {
    async function readDir(dirPath: string): Promise<string[]> {
      const entries = await window.electron.readDir(dirPath);

      const result = [];

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

      return result;
    }

    async function getDirectoryEntries() {
      setDirectoryEntries(await readDir(testPath));
    }

    getDirectoryEntries();
  }, []);

  useEffect(() => {
    async function getFileContent() {
      setFileContent(await window.electron.readFile(selectedFile));
    }

    selectedFile && getFileContent();
  }, [selectedFile]);

  // const handleDirectoryExpand = useCallback(async (expanded: string[]) => {
  //   const expandedDirectory = expanded.find(dir => !expandedDirectories.includes(dir));

  //   if (!expandedDirectory) {
  //     return;
  //   }

  //   const pathParts = expandedDirectory.split('/');
  //   let dir = { children: directoryEntries };

  //   while (pathParts.length) {
  //     const pathPart = pathParts.shift();
  //     dir = directoryEntries.find(entry => entry.name === pathPart);
  //   }

  //   if (dir.children) {
  //     return;
  //   }

  //   const entries = await window.electron.readDir(expandedDirectory);
  //   dir.children = entries.map(entry => ({
  //     title: entry.name,
  //     key: `${expandedDirectory}/${entry.name}`,
  //     isLeaf: !entry.directory,
  //   }));

  //   setDirectoryEntries(directoryEntries);
  // }, []);

  return (
    <div className="app">
      <div className="header">
        <Button size="small">Debug</Button>
        <Button size="small">Build</Button>
      </div>
      <div className="content">
        <div className="directory-tree">
          <DirectoryTree
            multiple
            defaultExpandAll
            treeData={directoryEntries}
            onSelect={selected => selected.length === 1 && setSelectedFile(selected[0].toString())}
            // onExpand={expanded => expanded.length && setExpandedDirecotires(expanded.map(e => e.toString()))}
          />
        </div>
        <div className="editor">
          <Editor
            path={`${testPath}/${selectedFile}`}
            value={fileContent}
            options={{
              automaticLayout: true,
              renderValidationDecorations: 'off'
            }}
          />
        </div>
      </div>
    </div>
  );
}
