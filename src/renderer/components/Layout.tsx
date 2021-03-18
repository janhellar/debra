import React, { ReactElement } from 'react';
import { Layout as AntLayout } from 'antd';

import './Layout.css';

const { Header, Content, Sider } = AntLayout;

interface LayoutProps {
  header: ReactElement;
  sider: ReactElement;
  content: ReactElement;
}

function Layout(props: LayoutProps) {
  const { header, sider, content } = props;

  return (
    <AntLayout className="Layout">
      <Header>
        {header}
      </Header>
      <AntLayout>
        <Sider width={300}>
          {sider}
        </Sider>
        <AntLayout>
          <Content>
            {content}
          </Content>
        </AntLayout>
      </AntLayout>
    </AntLayout>
  );
}

export default Layout;
