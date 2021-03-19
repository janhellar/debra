import React, { useEffect, useRef } from 'react';
import MonacoEditor, { OnMount, useMonaco } from "@monaco-editor/react";

interface EditorProps {
  projectPath: string;
  filePath: string;
  onSave: (path: string, content: string) => void;
  onChange: (path: string) => void;
  onEditorLoading: (loading: boolean) => void;
}

const editorSaveActionId = 'debra-save';
const editorCrtlCmdSCode = 2097;

function removePrefix(project: string, file: string) {
  return file.substring(project.length + 1);
}

function Editor(props: EditorProps) {
  const { projectPath, filePath, onSave, onChange, onEditorLoading } = props;

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

      onEditorLoading(true);

      const source = await window.electron.loadSource(projectPath);
      for (const file of source) {
        monaco.editor.createModel(file.content, undefined, monaco.Uri.parse(`file://${file.path}`));
      }

      const files = await window.electron.loadModules(projectPath);
      for (const file of files) {
        monaco.languages.typescript.typescriptDefaults.addExtraLib(file.content, 'file://' + file.path);
      }

      onEditorLoading(false);
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
      
      path && onSave(projectPath + path, content);
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
      path={removePrefix(projectPath, filePath)}
      options={{
        automaticLayout: true,
        minimap: {
          enabled: false
        }
      }}
      theme="vs-dark"
      onMount={addSaveAction}
      onChange={value => value && onChange(filePath)}
    />
  );
}

export default Editor;
