import React, { useCallback, useContext } from 'react';
import { Dropdown, Menu as AntMenu, Button, Radio, Badge, Spin, Space } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

import { ProjectStateContext, ProjectDispatchContext } from '../contexts';

import './Menu.css';

interface MenuProps {
  // fileChanged: boolean;
  // editorLoading: boolean;
  onProjectsClick: () => void;
  // tab: SelectedTab;
  // onTabSelected: (tab: SelectedTab) => void;
  // projectPath: string;
}

const loadIcon = <LoadingOutlined spin />;

function Menu(props: MenuProps) {
  const { onProjectsClick } = props;
  // const [debugging, setDebugging] = useState(false);

  const projectState = useContext(ProjectStateContext);
  
  const { common, menu, editor } = projectState;
  const { projectPath } = common;
  const { selectedTab, running } = menu;

  const dispatch = useContext(ProjectDispatchContext);

  // const setDebugging = useCallback((running: boolean) => dispatch({
  //   section: 'menu',
  //   field: 'running',
  //   newValue: running
  // }), [dispatch]);

  const debug = useCallback(async () => {
    dispatch(['menu.running', true]);
    // dispatch(['set', 'menu', '', true]); // setDebugging(true);
    window.electron.compile(projectPath, 'main');
    window.electron.compile(projectPath, 'renderer');
    window.electron.compile(projectPath, 'electron');
  }, [projectPath]);

  const stopDebug = useCallback(async () => {
    window.electron.kill();
    dispatch(['menu.running', false])
    // setDebugging(false);
  }, []);

  // const handleTabSelected = useCallback((value: string) => dispatch({
  //   section: 'menu',
  //   field: 'selectedTab',
  //   newValue: value
  // }), [dispatch]);

  const rightMenu = (
    <AntMenu>
      <AntMenu.Item key="1">Install</AntMenu.Item>
      <AntMenu.Item key="2">Publish</AntMenu.Item>
    </AntMenu>
  );

  return (
    <div className="Menu">
      <Button size="middle" onClick={onProjectsClick}>Projects</Button>

      <Radio.Group value={selectedTab} onChange={e => dispatch(['menu.selectedTab', e.target.value])} buttonStyle="outline" style={{ verticalAlign: 20 }} size="middle">
        <Radio.Button value="files">
          <Space>
            {editor.loading && <Spin indicator={loadIcon} size="small" />}
            <Badge style={{ backgroundColor: 'rgba(255, 255, 255, 0.85)' }} dot={editor.changedFiles.length > 0}>
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
        onClick={() => running ? stopDebug() : debug()}>
          {running ? 'Stop' : 'Run'}
      </Dropdown.Button>
    </div>
  );
}

export default Menu;
