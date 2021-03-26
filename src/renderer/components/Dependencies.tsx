import React, { useEffect, useState, useCallback, useContext } from 'react';
import { Layout, Table, Form, Input, Button, Space } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';

import { ProjectStateContext, ProjectDispatchContext } from '../contexts';

import './Dependencies.css';

const { Content } = Layout;

function Dependencies() {
  const projectState = useContext(ProjectStateContext);

  const { common, dependencies } = projectState;
  const { projectPath } = common;
  const { installing } = dependencies;

  const dispatch = useContext(ProjectDispatchContext);

  const [packages, setPackages] = useState<any[]>([]);
  const [installName, setInstallName] = useState('');

  const loadPackages = useCallback(async () => {
    const dependencies = await window.electron.loadDependencies(projectPath);

    const pkgs = Object.keys(dependencies).map((pkg, index) => ({
      pkg,
      version: dependencies[pkg],
      key: index
    }));

    setPackages(pkgs);
  }, [projectPath]);

  useEffect(() => {
    loadPackages();
  }, [projectPath]);

  const npm = useCallback(async (pkg: string, action = 'install') => {
    dispatch(['dependencies.installing', true]);
    await window.electron.npm({
      args: [action, '--save', pkg],
      projectPath
    })
    await loadPackages();
    dispatch(['dependencies.installing', false]);
  }, [projectPath]);

  const columns = [
    {
      title: 'Package',
      dataIndex: 'pkg',
      key: 'pkg',
    },
    {
      title: 'Version',
      dataIndex: 'version',
      key: 'version',
    },
    {
      title: 'Action',
      key: 'action',
      render: (_: any, record: any) => (
        <Button icon={<DeleteOutlined />} disabled={installing} onClick={() => npm(record.pkg, 'uninstall')} />
      ),
    },
  ];

  const installForm = (
    <Form
      layout="inline"
    >
      <Form.Item label="Install new package">
        <Input placeholder="package name" value={installName} onChange={e => setInstallName(e.target.value)} />
      </Form.Item>
      <Form.Item>
        <Button type="primary" onClick={() => npm(installName)} disabled={installing}>Install</Button>
      </Form.Item>
    </Form>
  );

  const table = (
    <Table
      showHeader={false}
      dataSource={packages}
      columns={columns}
      pagination={false}
      size="small"
    />
  );

  return (
    <Content className="Dependencies">
      <Space direction="vertical" size="middle">
        {installForm}
        {table}
      </Space>
    </Content>
  );
}

export default Dependencies;
