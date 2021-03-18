import React from 'react';
import ReactDOM from 'react-dom';

import App from './components/App';

import 'antd/dist/antd.dark.css';

import './index.css';

declare global {
  interface Window {
    electron: any;
  }
}

ReactDOM.render(<App />, document.querySelector('#root'));
