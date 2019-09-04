import React from 'react';
import { Router, Route } from 'dva/router';
import App from './App';

export default function RouterConfig({ history, app }) {
  return (
    <Router history={history}>
      <Route render={props => <App {...props} app={app} />} />
    </Router>
  );
}
