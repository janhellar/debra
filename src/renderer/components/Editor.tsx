import React, { useEffect, useRef, useContext, useCallback } from 'react';
import MonacoEditor, { OnMount, useMonaco } from "@monaco-editor/react";

import { ProjectStateContext, ProjectDispatchContext } from '../contexts';

interface EditorProps {
  // projectPath: string;
  // filePath: string;
  onSave: (path: string, content: string) => void;
  // onChange: (path: string) => void;
  // onEditorLoading: (loading: boolean) => void;
}

const editorSaveActionId = 'debra-save';
const editorCrtlCmdSCode = 2097;

function removePrefix(project: string, file: string) {
  return file.substring(project.length + 1);
}

function Editor(props: EditorProps) {
  // const { projectPath, filePath, onSave, onChange, onEditorLoading } = props;
  const { onSave } = props;

  const projectState = useContext(ProjectStateContext);

  const { common, editor } = projectState;
  const { projectPath } = common;
  const { activeFile, changedFiles } = editor;

  const dispatch = useContext(ProjectDispatchContext);

  const editorRef = useRef<any>(null);

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

  const handleChange = useCallback(() => {

    if (activeFile && !changedFiles.includes(activeFile)) {
      dispatch([
        'editor.changedFiles',
        (files: string[]) => {
          return [...files, activeFile];
        }
      ]); //onEdited(files => [...files, file])
    }
  }, [activeFile, changedFiles]);

  return (
    <MonacoEditor
      path={activeFile && removePrefix(projectPath, activeFile)}
      options={{
        automaticLayout: true
      }}
      theme="dark-theme"
      onMount={addSaveAction}
      onChange={value => value && handleChange()}//onChange(activeFile)}
    />
  );
}

export default Editor;
