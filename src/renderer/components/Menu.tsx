import React, { useCallback, useState } from 'react';
import { Dropdown, Menu as AntMenu, Button, Radio, Badge, Spin, Space } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

import './Menu.css';

export type SelectedTab = 'files' | 'dependencies' | 'logs';

interface MenuProps {
  fileChanged: boolean;
  editorLoading: boolean;
  onProjectsClick: () => void;
  tab: SelectedTab;
  onTabSelected: (tab: SelectedTab) => void;
  projectPath: string;
}

const loadIcon = <LoadingOutlined spin />;

function Menu(props: MenuProps) {
  const { fileChanged, editorLoading, onProjectsClick, tab, onTabSelected, projectPath } = props;
  const [debugging, setDebugging] = useState(false);

  const debug = useCallback(async () => {
    setDebugging(true);
    window.electron.compile(projectPath, 'main');
    window.electron.compile(projectPath, 'renderer');
    window.electron.compile(projectPath, 'electron');
  }, [projectPath]);

  const stopDebug = useCallback(async () => {
    window.electron.kill();
    setDebugging(false);
  }, []);

  const rightMenu = (
    <AntMenu>
      <AntMenu.Item key="1">Install</AntMenu.Item>
      <AntMenu.Item key="2">Publish</AntMenu.Item>
    </AntMenu>
  );

  return (
    <div className="Menu">
      <Button size="middle" onClick={onProjectsClick}>Projects</Button>

      <Radio.Group value={tab} onChange={e => onTabSelected(e.target.value)} buttonStyle="outline" style={{ verticalAlign: 20 }} size="middle">
        <Radio.Button value="files">
          <Space>
            {editorLoading && <Spin indicator={loadIcon} size="small" />}
            <Badge style={{ backgroundColor: 'rgba(255, 255, 255, 0.85)' }} dot={fileChanged}>
              Files
            </Badge>
          </Space>
        </Radio.Button>
        <Radio.Button value="dependencies">Dependencies</Radio.Button>
        <Radio.Button value="logs">Logs</Radio.Button>
      </Radio.Group>

      
      <Dropdown.Button
        overlay={rightMenu}
        trigger={['click']}
        size="middle"
        onClick={() => debugging ? stopDebug() : debug()}>
          {debugging ? 'Stop' : 'Run'}
      </Dropdown.Button>
    </div>
  );
}

export default Menu;
