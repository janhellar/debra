import React, { ReactElement } from 'react';
import { Layout } from 'antd';

import './AppLayout.css';

const { Header, Content, Sider } = Layout;

interface AppLayoutProps {
  header: ReactElement;
  sider: ReactElement;
  content: ReactElement;
}

function AppLayout(props: AppLayoutProps) {
  const { header, sider, content } = props;

  return (
    <Layout className="AppLayout">
      <Header>
        {header}
      </Header>
      <Layout>
        <Sider width={300}>
          {sider}
        </Sider>
        <Layout>
          <Content>
            {content}
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
}

export default AppLayout;
