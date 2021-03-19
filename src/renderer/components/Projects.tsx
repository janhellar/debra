import React from 'react';
import { Card, Layout, Space } from 'antd';
import { DeleteOutlined, EditOutlined, EllipsisOutlined } from '@ant-design/icons';

import './Projects.css';

const { Content } = Layout;

function Projects() {
  const content = (
    <div className="content">
      <Card
        hoverable
        size="small"
        title="Small size card"
        extra={<a href="#">More</a>}
        actions={[
          <DeleteOutlined key="setting" />,
          <EditOutlined key="edit" />,
          <EllipsisOutlined key="ellipsis" />,
        ]}
      >
        <p>Card content</p>
        <p>Card content</p>
        <p>Card content</p>
      </Card>
      <Card hoverable bordered={false} size="small" title="Small size card" extra={<a href="#">More</a>}>
        <p>Card content</p>
        <p>Card content</p>
        <p>Card content</p>
      </Card>
      <Card bordered={false} size="small" title="Small size card" extra={<a href="#">More</a>}>
        <p>Card content</p>
        <p>Card content</p>
        <p>Card content</p>
      </Card>
      <Card hoverable bordered={false} size="small" title="Small size card" extra={<a href="#">More</a>}>
        <p>Card content</p>
        <p>Card content</p>
        <p>Card content</p>
      </Card>
      <Card bordered={false} size="small" title="Small size card" extra={<a href="#">More</a>}>
        <p>Card content</p>
        <p>Card content</p>
        <p>Card content</p>
      </Card>
      <Card hoverable bordered={false} size="small" title="Small size card" extra={<a href="#">More</a>}>
        <p>Card content</p>
        <p>Card content</p>
        <p>Card content</p>
      </Card>
      <Card bordered={false} size="small" title="Small size card" extra={<a href="#">More</a>}>
        <p>Card content</p>
        <p>Card content</p>
        <p>Card content</p>
      </Card>
    </div>
  );

  return (
    <Layout className="Projects">
      <Content>
        {content}
      </Content>
    </Layout>
  );
}

export default Projects;
