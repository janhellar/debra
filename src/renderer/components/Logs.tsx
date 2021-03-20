import React, { useCallback, useEffect, useState, Dispatch, SetStateAction } from 'react';
import { Layout, Tabs } from 'antd';

import './Logs.css';

const { Content } = Layout;
const { TabPane } = Tabs;

interface LogsProps {
  projectPath: string;
}

function Logs(props: LogsProps) {
  const [mainLogs, setMainLogs] = useState('');
  const [rendererLogs, setRendererLogs] = useState('');
  const [electronLogs, setElectronLogs] = useState('');

  const watchLogs = useCallback((source: string, setFunc: Dispatch<SetStateAction<string>>) => {
    window.electron.logs(source, (log: string) => setFunc(prev => prev + log));
  }, []);

  useEffect(() => {
    watchLogs('main', setMainLogs);
    watchLogs('renderer', setRendererLogs);
    watchLogs('electron', setElectronLogs);
  }, []);

  const pre = (text: string) => (
    <samp>
      <pre>
        {text}
      </pre>
    </samp>
  );

  const content = (
    <Tabs defaultActiveKey="1">
      <TabPane tab="Main" key="1">
        {pre(mainLogs)}
      </TabPane>
      <TabPane tab="Renderer" key="2">
        {pre(rendererLogs)}
      </TabPane>
      <TabPane tab="Electron" key="3">
        {pre(electronLogs)}
      </TabPane>
    </Tabs>
  );

  return (
    <Content className="Logs">
      {content}
    </Content>
  );
}

export default Logs;
