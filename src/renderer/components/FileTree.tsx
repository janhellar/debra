import React, { useCallback, useRef, ReactElement, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { Tree, Menu, Dropdown } from 'antd';
import { DataNode } from 'rc-tree/lib/interface';

import './FileTree.css';

const { DirectoryTree } = Tree;

interface FileTreeProps {
  directoryEntries: DataNode[];
  onFileSelected: (fileName: string) => void;
}

const menu = (
  <Menu>
    <Menu.Item>New File</Menu.Item>
    <Menu.Item>New Folder</Menu.Item>
    <Menu.Divider />
    <Menu.Item>Rename</Menu.Item>
    <Menu.Item>Delete</Menu.Item>
  </Menu>
);

function ContextMenu(props: any) {
  const { info, ...menuProps } = props;

  return (
    <Menu {...menuProps}>
      <Menu.Item>New File</Menu.Item>
      <Menu.Item>New Folder</Menu.Item>
      {info.node && (
        <>
          <Menu.Divider />
          <Menu.Item>Rename</Menu.Item>
          <Menu.Item>Delete</Menu.Item>
        </>
      )}
    </Menu>
  );
}

function ContextDropdown(props: any) {
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
}

function FileTree(props: FileTreeProps) {
  const { directoryEntries, onFileSelected } = props;

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

  return (
    <div className="FileTree">
      <DirectoryTree
        treeData={directoryEntries}
        onSelect={selected => onFileSelected(selected[0].toString())}
        onRightClick={renderContextMenu}
      />
      <div className="context-menu-handler" onContextMenu={event => renderContextMenu({ event })} />
    </div>
  );
}

export default FileTree;
