import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { Result } from 'antd';
import { Helmet } from 'react-helmet';

import routes from './routers';

class App extends Component {
  state = {
    hasError: false,
  };

  static getDerivedStateFromError(error) {
    // 更新 state 使下一次渲染能够显示降级后的 UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // 你同样可以将错误日志上报给服务器
  }

  render() {
    if (this.state.hasError) {
      return (
        <Result
          status="500"
          title="系统发生了错误..."
          // subTitle="Sorry, something went wrong."
        />
      );
    }

    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          minHeight: '100vh',
        }}
      >
        <Helmet title="中山大学计算机竞赛网" />
        <Switch>
          {routes.map((route, index) => {
            if (route.exact) {
              return (
                <Route
                  key={index}
                  path={route.path}
                  exact
                  render={(props) => (
                    <route.component {...props} routes={route.routes} />
                  )}
                />
              );
            } else {
              return (
                <Route
                  key={index}
                  path={route.path}
                  render={(props) => (
                    <route.component {...props} routes={route.routes} />
                  )}
                ></Route>
              );
            }
          })}
        </Switch>
      </div>
    );
  }
}

export default App;
