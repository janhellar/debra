import React, { useState, useCallback, useEffect, useRef } from 'react';
import Editor, { OnMount, useMonaco, OnValidate } from "@monaco-editor/react";
import { readDir } from '../utils';

interface AppContentProps {
  projectPath: string;
  fileContent: string;
  filePath: string;
  onSave: (path: string, content: string) => void;
  onChange: () => void;
}

const editorSaveActionId = 'debra-save';
const editorCrtlCmdSCode = 2097;

function removePrefix(project: string, file: string) {
  // console.log(file.substring(project.length + 1));
  return file.substring(project.length + 1);
}

function AppContent(props: AppContentProps) {
  const { projectPath, fileContent, filePath, onSave, onChange } = props;

  const monaco = useMonaco();

  const editorRef = useRef<any>(null);

  // useEffect(() => {
    

  //   if (!monaco) return;

  //   console.log('NACITAM');

  //   const models = monaco.editor.getModels();

  //   const la = models.find(m => {
  //     console.log(m.uri.path, filePath);
  //     return m.uri.path === filePath;
  //   });

  //   console.log(la);
    
  //   editorRef.current.setModel(la);

  // }, [monaco, filePath, editorRef.current]);
  
  useEffect(() => {
    if (!monaco) return;

    // monaco.languages.typescript.javascriptDefaults.setEagerModelSync(true);
    // monaco.languages.typescript.typescriptDefaults.setEagerModelSync(true);
    monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
      jsx: 2,
      forceConsistentCasingInFileNames: true,
      skipLibCheck: true,
      esModuleInterop: true,
      strict: true,
      module: 1,
      target: 2,
      sourceMap: true,
      // typeRoots: ["node_modules/@types"]
    });
    monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: false,
      noSyntaxValidation: false
    })

    async function loadAll(ppath: string) {
      if (!monaco) return;

      const files = await window.electron.loadModules(projectPath);
      for (const file of files) {
        monaco.languages.typescript.typescriptDefaults.addExtraLib(file.content, 'file://' + file.path);
        // console.log('loaded');
      }

      const packageJson = await window.electron.readFile(projectPath + '/package.json');
      const packageLock = await window.electron.readFile(projectPath + '/package-lock.json');

      monaco.languages.typescript.typescriptDefaults.addExtraLib(packageJson, 'file://' + projectPath + '/package.json');
      monaco.languages.typescript.typescriptDefaults.addExtraLib(packageLock, 'file://' + projectPath + '/package-lock.json');

      const source = await window.electron.loadSource(projectPath);
      for (const file of source) {
        monaco.editor.createModel(file.content, undefined, monaco.Uri.parse(`file://${file.path}`));
        console.log('loaded');
      }

      console.log('done');

      // const entries = await readDir(ppath);

      // const tsFiles = entries
      //   .filter(e => e.isLeaf)
      //   .map(e => e.key.toString())
      //   .filter(e => e.endsWith('.ts') || e.endsWith('.json'));

      // tsFiles.forEach(async file => {
      //   const content = await window.electron.readFile(file);
      //   if (content) {
      //     // monaco.languages.typescript.typescriptDefaults.addExtraLib(content, 'file:///' + removePrefix(projectPath, file));
      //     // monaco.editor.createModel(content, 'typescript', monaco.Uri.parse(`file://${removePrefix(projectPath, file)}`));
      //     console.log('loaded');
      //   }
      // });

      // // for (const file of tsFiles) {
      // //   const content = await window.electron.readFile(file);
      // //   if (content) {
      // //     monaco.languages.typescript.typescriptDefaults.addExtraLib(content, 'file:///' + removePrefix(projectPath, file));
      // //     // monaco.editor.createModel(content, 'typescript', monaco.Uri.parse(`file://${removePrefix(projectPath, file)}`));
      // //     console.log('loaded');
      // //   }
      // // }

      // const folders = entries
      //   .filter(e => !e.isLeaf)
      //   .map(e => e.key.toString());
      
      // folders.forEach(loadAll);

      // // for (const folder of folders) {
      // //   await loadAll(folder);
      // // }
    }

    loadAll(`${projectPath}`);
  }, [projectPath, monaco]);

  const handleValidation = useCallback<OnValidate>(async markers => {
    if (!monaco) return;

    console.log(markers);

    for (const marker of markers.filter(m => m.message.startsWith('Cannot find module'))) {
      const moduleMatch = marker.message.match(/'(.*)'/);

      if (!moduleMatch) continue;

      const module = moduleMatch[1];

      if (!module.startsWith('./')) {
        const paths = [
          `${projectPath}/node_modules/${module}/index.ts`,
          `${projectPath}/node_modules/${module}/index.d.ts`,
          `${projectPath}/node_modules/@types/${module}/index.ts`,
          `${projectPath}/node_modules/@types/${module}/index.d.ts`,
        ];

        for (const path of paths) {
          try {
            const content = await window.electron.readFile(path);
            if (content) {
              monaco.languages.typescript.typescriptDefaults.addExtraLib(content, removePrefix(projectPath, path));
              monaco.editor.createModel(content, 'typescript', monaco.Uri.parse(`file://${removePrefix(projectPath, path)}`));
              console.log('loaded', path);
              break;
            }
          } catch (_) {
            console.log('miss', path);
          }
        }
      }
      
    }
  }, [projectPath, monaco])

  const addSaveAction: OnMount = editor => {
    if (editorRef) {
      editorRef.current = editor;
    }
    

    function save() {
      const path = editor.getModel()?.uri.path;
      const content = editor.getValue();
      
      path && onSave(path, content);
    }

    editor.addAction({
      id: editorSaveActionId,
      label: 'Save',
      keybindings: [editorCrtlCmdSCode],
      run: save
    });
  };

  console.log(removePrefix(projectPath, filePath));

  return (
    <Editor
      value={fileContent}
      path={removePrefix(projectPath, filePath)}
      options={{
        automaticLayout: true,
        // renderValidationDecorations: 'off',
        minimap: {
          enabled: false
        }
      }}
      theme="vs-dark"
      onMount={addSaveAction}
      onChange={value => value && onChange()}
      // onValidate={handleValidation}
    />
  );
}

export default AppContent;
