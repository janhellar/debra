import React from 'react';
import ReactDOM from 'react-dom';

import App from './App';

import 'antd/dist/antd.css';

declare global {
  interface Window {
    electron: any;
  }
}

ReactDOM.render(<App />, document.querySelector('#root'));
