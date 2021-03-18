import React, { useEffect, useRef } from 'react';
import MonacoEditor, { OnMount, useMonaco } from "@monaco-editor/react";

interface EditorProps {
  projectPath: string;
  fileContent: string;
  filePath: string;
  onSave: (path: string, content: string) => void;
  onChange: () => void;
}

const editorSaveActionId = 'debra-save';
const editorCrtlCmdSCode = 2097;

function removePrefix(project: string, file: string) {
  return file.substring(project.length + 1);
}

function Editor(props: EditorProps) {
  const { projectPath, fileContent, filePath, onSave, onChange } = props;

  const monaco = useMonaco();

  const editorRef = useRef<any>(null);
  
  useEffect(() => {
    if (!monaco) return;

    monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
      jsx: 2,
      forceConsistentCasingInFileNames: true,
      skipLibCheck: true,
      esModuleInterop: true,
      strict: true,
      module: 1
    });

    async function loadAll() {
      if (!monaco) return;

      const files = await window.electron.loadModules(projectPath);
      for (const file of files) {
        monaco.languages.typescript.typescriptDefaults.addExtraLib(file.content, 'file://' + file.path);
      }

      const source = await window.electron.loadSource(projectPath);
      for (const file of source) {
        monaco.editor.createModel(file.content, undefined, monaco.Uri.parse(`file://${file.path}`));
      }
    }

    loadAll();
  }, [projectPath, monaco]);

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

  return (
    <MonacoEditor
      value={fileContent}
      path={removePrefix(projectPath, filePath)}
      options={{
        automaticLayout: true,
        minimap: {
          enabled: false
        }
      }}
      theme="vs-dark"
      onMount={addSaveAction}
      onChange={value => value && onChange()}
    />
  );
}

export default Editor;
