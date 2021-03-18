import React from 'react';
import { Dropdown, Menu, Alert, Button, Radio, Badge } from 'antd';
import { EllipsisOutlined } from '@ant-design/icons';

import './AppHeader.css';

interface AppHeaderProps {
  fileChanged: boolean;
}

function AppHeader(props: AppHeaderProps) {
  const { fileChanged } = props;

  const leftMenu = (
    <Menu>
      <Menu.Item key="1">New Project</Menu.Item>
      <Menu.Item key="2">Open Project</Menu.Item>
    </Menu>
  );

  const rightMenu = (
    <Menu>
      <Menu.Item key="1">Install</Menu.Item>
      <Menu.Item key="2">Publish</Menu.Item>
    </Menu>
  );

  return (
    <div className="AppHeader">
      {/* <div className="left-section"> */}
        {/* <Dropdown overlay={leftMenu} placement="bottomLeft">
          <Button icon={<EllipsisOutlined />} />
        </Dropdown> */}
        <Button size="middle">Projects</Button>
        
      {/* </div> */}
      {/* <Alert message="Success Tips" type="success" /> */}

      <Radio.Group defaultValue="b" buttonStyle="outline" style={{ verticalAlign: 20 }} size="middle">
          <Radio.Button value="b"><Badge style={{ backgroundColor: 'rgba(255, 255, 255, 0.85)' }} dot={fileChanged}>Files</Badge></Radio.Button>
          <Radio.Button value="c">Dependencies</Radio.Button>
          <Radio.Button value="d">Logs</Radio.Button>
        </Radio.Group>

      
      <Dropdown.Button
        overlay={rightMenu}
        trigger={['click']}
        size="middle"
      >
        Run
      </Dropdown.Button>
    </div>
  );
}

export default AppHeader;
