import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Route } from 'dva/router';
import pathToRegexp from 'path-to-regexp';
import AccountBar from 'components/AccountBar';
import DocumentTitle from 'react-document-title';

import styles from './index.less';

@connect(({ account }) => ({ ...account }))
class Account extends PureComponent {
  // 异步加载组件
  asyncComponent = (loader, models) => this.props.asyncComponent(loader, models, false);

  state = {
    // 路由配置
    routerConfig: {
      '/account/assets': {
        title: '我的资产',
        component: this.asyncComponent(() => import('routes/Main/Account/Assets'))
      },
      '/account/finance': {
        title: '财务记录',
        component: this.asyncComponent(() => import('routes/Main/Account/Finance'))
      },
      '/account/address': {
        title: '地址管理',
        component: this.asyncComponent(() => import('routes/Main/Account/Address'))
      },
      '/account/exchange': {
        title: '币币交易',
        component: this.asyncComponent(() => import('routes/Main/Account/Exchange'))
      },
      '/account/c2c': {
        title: 'C2C交易',
        component: this.asyncComponent(() => import('routes/Main/Account/C2c'), ['c2c'])
      },
      '/account/profile': {
        title: '基本信息',
        component: this.asyncComponent(() => import('routes/Main/Account/Profile'))
      },
      '/account/payment': {
        title: '支付绑定',
        component: this.asyncComponent(() => import('routes/Main/Account/Payment'))
      },
      '/account/security': {
        title: '安全设置',
        component: this.asyncComponent(() => import('routes/Main/Account/Security'))
      },
      '/account/certification': {
        title: '实名认证',
        component: this.asyncComponent(() => import('routes/Main/Account/Certification'))
      },
      '/account/certification/region': {
        title: '实名认证',
        component: this.asyncComponent(() => import('routes/Main/Account/Certification/Region'))
      },
      '/account/certification/steps': {
        title: '实名认证',
        component: this.asyncComponent(() => import('routes/Main/Account/Certification/Steps'))
      },
      '/account/invite': {
        title: '我的邀请',
        component: this.asyncComponent(() => import('routes/Main/Account/Invite'))
      },
      '/account/status': {
        title: '提币状态',
        component: this.asyncComponent(() => import('routes/Main/Account/Status'))
      }
    }
  };

  static getDerivedStateFromProps = (props, state) => {
    // 匹配路由
    const { location, localization, history, isC2cVisible } = props;
    const { pathname } = location;
    const { routerConfig } = state;

    const menus = {
      资金管理: [
        {
          path: '/account/assets',
          name: '我的资产'
        },
        {
          path: '/account/finance',
          name: '财务记录'
        },
        {
          path: '/account/address',
          name: '地址管理'
        }
      ],
      我的交易: [
        {
          path: '/account/exchange',
          name: '币币交易'
        }
        // {
        //   path: '/account/c2c',
        //   name: 'C2C交易'
        // }
      ],
      个人信息: [
        {
          path: '/account/profile',
          name: '基本信息'
        },
        {
          path: '/account/payment',
          name: '支付绑定'
        }
      ],
      安全中心: [
        {
          path: '/account/security',
          name: '安全设置'
        }
        // {
        //   path: '/account/certification',
        //   name: '实名认证'
        // }
      ],
      我的推荐: [
        {
          path: '/account/invite',
          name: '我的邀请'
        }
      ]
    };
    let route = null;
    let toPath = pathname;
    if (routerConfig[pathname]) {
      route = routerConfig[pathname];
    } else {
      Object.keys(routerConfig).forEach(path => {
        if (pathToRegexp(path).test(pathname)) {
          route = routerConfig[path];
          toPath = path;
          return;
        }
      });
    }

    if (!route) {
      route = routerConfig['/account/assets'];
      history.replace('/account/assets');
    }

    return {
      menus,
      toPath,
      title: `${localization[route.title]}-${localization['用户中心']}-${
        localization['环球数字资产交易平台']
        }`,
      header: route.title,
      Component: route.component
    };
  };

  render() {
    const { localization, viewport } = this.props;
    const { menus, toPath, title, header, Component } = this.state;
    return (
      <DocumentTitle title={title}>
        <div className="container">
          <div className={styles.account}>
            {viewport.width > 767 && <AccountBar {...{ localization, viewport, menus }} />}
            <div className={styles.cont}>
              {viewport.width < 768 && (
                <header className={styles.header}>{localization[header]}</header>
              )}
              <Route
                path={toPath}
                render={props => <Component {...{ ...this.props, ...props, ...this.state }} />}
              />
            </div>
          </div>
        </div>
      </DocumentTitle>
    );
  }
}

export default Account;
