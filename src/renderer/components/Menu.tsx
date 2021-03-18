import React from 'react';
import { Dropdown, Menu as AntMenu, Button, Radio, Badge } from 'antd';

import './Menu.css';

interface MenuProps {
  fileChanged: boolean;
}

function Menu(props: MenuProps) {
  const { fileChanged } = props;

  const rightMenu = (
    <AntMenu>
      <AntMenu.Item key="1">Install</AntMenu.Item>
      <AntMenu.Item key="2">Publish</AntMenu.Item>
    </AntMenu>
  );

  return (
    <div className="Menu">
      <Button size="middle">Projects</Button>

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

export default Menu;
