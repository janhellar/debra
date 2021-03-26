import React, { useCallback, useEffect, useContext, Dispatch, SetStateAction } from 'react';
import { Layout, Tabs } from 'antd';

import { ProjectStateContext, ProjectDispatchContext } from '../contexts';

import './Logs.css';

const { Content } = Layout;
const { TabPane } = Tabs;

function Logs() {
  const projectState = useContext(ProjectStateContext);

  const { logs } = projectState;
  const { main, electron, renderer } = logs;

  const dispatch = useContext(ProjectDispatchContext);

  const watchLogs = useCallback((source: string, setFunc: Dispatch<SetStateAction<string>>) => {
    window.electron.logs(source, (log: string) => setFunc(prev => prev + log));
  }, []);

  useEffect(() => {
    watchLogs('main', (setFn) => dispatch(['logs.main', setFn]));
    watchLogs('renderer', (setFn) => dispatch(['logs.renderer', setFn]));
    watchLogs('electron', (setFn) => dispatch(['logs.electron', setFn]));
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
        {pre(main)}
      </TabPane>
      <TabPane tab="Renderer" key="2">
        {pre(renderer)}
      </TabPane>
      <TabPane tab="Electron" key="3">
        {pre(electron)}
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
