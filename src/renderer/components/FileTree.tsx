import React, { useCallback, useRef, ReactElement, useEffect, useState, KeyboardEvent } from 'react';
import ReactDOM from 'react-dom';
import { Tree, Menu, Dropdown, Input } from 'antd';
import { DataNode } from 'rc-tree/lib/interface';

import './FileTree.css';

const { DirectoryTree } = Tree;

interface FileTreeProps {
  directoryEntries: DataNode[];
  editedFiles: string[];
  onFileSelected: (fileName: string) => void;
  onFileChange: () => void;
  projectPath: string;
}

function highlightEditedFiles(entries: DataNode[], edited: string[]): DataNode[] {
  return entries.map(entry => {
    if (entry.isLeaf) {
      return {
        ...entry,
        title: edited.includes(entry.key.toString()) ? (
          <span style={{ fontWeight: 'bold', fontStyle: 'italic' }}>
            {entry.title}
          </span>
        ) : entry.title
      };
    } else {
      return {
        ...entry,
        children: entry.children && highlightEditedFiles(entry.children, edited)
      };
    }
  });
}

function FileTree(props: FileTreeProps) {
  const { directoryEntries, editedFiles, onFileSelected, onFileChange, projectPath } = props;

  const [renaming, setRenaming] = useState<string | null>();
  const [newName, setNewName] = useState('');

  const contextMenuContainer = useRef<HTMLDivElement | null>();

  useEffect(() => {
    contextMenuContainer.current = document.createElement('div');
    document.body.appendChild(contextMenuContainer.current);

    return () => {
      if (!contextMenuContainer.current) return;

      ReactDOM.unmountComponentAtNode(contextMenuContainer.current);
      document.body.removeChild(contextMenuContainer.current);
      contextMenuContainer.current = null;
    };
  }, [contextMenuContainer]);

  const contextMenu = useRef<ReactElement | null>();

  const ContextMenu = useCallback((props: any) => {
    const { info, ...menuProps } = props;

    return (
      <Menu {...menuProps}>
        <Menu.Item>New File</Menu.Item>
        <Menu.Item>New Folder</Menu.Item>
        {info.node && (
          <>
            <Menu.Divider />
            <Menu.Item onClick={() => {
              setNewName(info.node.title.toString());
              setRenaming(info.node.key);
            }}>Rename</Menu.Item>
            <Menu.Item>Delete</Menu.Item>
          </>
        )}
      </Menu>
    );
  }, [setRenaming, setNewName, projectPath]);

  const ContextDropdown = useCallback((props: any) => {
    const { info } = props;

    const spanRef = useRef<HTMLSpanElement>(null);

    useEffect(() => {
      if (spanRef && spanRef.current) {
        spanRef.current.click();
      }
    }, [spanRef.current]);

    return (
      <Dropdown
        overlay={<ContextMenu info={info} />}
        trigger={['click']}
      >
        <span ref={spanRef} />
      </Dropdown>
    );
  }, []);

  const renderContextMenu = useCallback((info: any) => {
    if (!contextMenuContainer.current) return;

    if (contextMenu.current) {
      ReactDOM.unmountComponentAtNode(contextMenuContainer.current);
      contextMenu.current = null;
    }
    contextMenu.current = (
      <ContextDropdown info={info} />
    );

    Object.assign(contextMenuContainer.current.style, {
      position: 'absolute',
      left: `${info.event.pageX}px`,
      top: `${info.event.pageY}px`,
    });

    ReactDOM.render(contextMenu.current, contextMenuContainer.current);
  }, []);

  const entries = highlightEditedFiles(directoryEntries, editedFiles);

  const handleRenaming = useCallback(async (e: KeyboardEvent<HTMLInputElement>, filePath: string) => {
    if (e.key === 'Enter') {
      await window.electron.rename(filePath, newName);
      setRenaming(null);
      onFileChange();
    } else if (e.key === 'Escape') {
      setRenaming(null);
    }
  }, [setRenaming, newName]);

  return (
    <div className="FileTree">
      <DirectoryTree
        treeData={entries}
        onSelect={selected => onFileSelected(selected[0].toString())}
        onRightClick={renderContextMenu}
        titleRender={node => {
          if (renaming && node.key === renaming) {
            return (
              <Input
                size="small"
                bordered={false}
                value={newName}
                onChange={e => setNewName(e.target.value)}
                onKeyDown={e => handleRenaming(e, node.key.toString())}
                autoFocus
              />
            );
          }

          return node.title;
        }}
        showIcon={false}
      />
      <div className="context-menu-handler" onContextMenu={event => renderContextMenu({ event })} />
    </div>
  );
}

export default FileTree;
