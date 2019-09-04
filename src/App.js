import React, { Fragment } from 'react';
import { connect } from 'dva';
import { Route, Redirect } from 'dva/router';
import Loadable from 'react-loadable';
import { ScaleLoader } from 'react-spinners';
import DocumentTitle from 'react-document-title';
import pathToRegexp from 'path-to-regexp';
import { debounce } from 'lodash';
import { message } from 'antd';
import ClipboardJS from 'clipboard';

// 容器组件
import Main from 'routes/Main';
const Mobile = ({ children, history }) => {
  // document.querySelector('#easemobimBtn').style.display = 'none';
  return <div className="mobile">{children}</div>;
};

message.config({
  top: 200,
  duration: 2,
  maxCount: 1
});

@connect(({ global }) => ({ ...global }))
class App extends React.Component {
  // 异步加载组件
  asyncComponent = (loader, models, loading) => {
    const { app } = this.props;
    return Loadable({
      loader,
      loading: () => {
        if (models && models.length > 0) {
          models.forEach(model => {
            const isModelExist = app._models.some(({ namespace }) => namespace === model);
            if (!isModelExist) {
              app.model(require(`models/${model}`).default);
            }
          });
        }
        return loading ? (
          loading
        ) : loading === false ? null : (
          <div className="page-loading">
            <ScaleLoader height={100} width={6} margin="6px" radius={6} loading />
          </div>
        );
      }
    });
  };

  state = {
    // 视口尺寸和设备像素比，用于响应式布局
    viewport: {
      width: window.innerWidth,
      height: window.innerHeight,
      dpr: window.devicePixelRatio
    },
    // 路由配置
    routerConfig: {
      '/': {
        title: '首页',
        containers: [Main],
        component: this.asyncComponent(() => import('routes/Main/Home'), ['markets'])
      },
      '/exchange': {
        title: '币币交易',
        containers: [Main],
        component: this.asyncComponent(() => import('routes/Main/Exchange'), [
          'markets',
          'exchange'
        ])
      },
      '/c2c': {
        title: 'C2C交易',
        containers: [Main],
        component: this.asyncComponent(() => import('routes/Main/C2C'), ['c2c'])
      },
      '/c2c/order': {
        title: 'C2C订单',
        containers: [Main],
        component: this.asyncComponent(() => import('routes/Main/C2C/Order'), ['c2c'])
      },
      '/mining': {
        title: '挖矿',
        containers: [Main],
        component: this.asyncComponent(() => import('routes/Main/Mining'))
      },
      '/rank': {
        title: '百团大战',
        containers: [Main],
        component: this.asyncComponent(() => import('routes/Main/Rank'))
      },
      '/superBook': {
        title: '超级账本',
        containers: [Main],
        component: this.asyncComponent(() => import('routes/Main/SuperBook'))
      },
      '/help/:id?': {
        title: '帮助中心',
        containers: [Main],
        component: this.asyncComponent(() => import('routes/Main/Help'))
      },
      '/notice/:id?': {
        title: '公告中心',
        containers: [Main],
        component: this.asyncComponent(() => import('routes/Main/Notice'))
      },
      '/link/:id?': {
        title: '',
        containers: [Main],
        component: this.asyncComponent(() => import('routes/Main/Link'))
      },
      '/download': {
        title: 'APP下载',
        containers: [Main],
        component: this.asyncComponent(() => import('routes/Main/Dowload'))
      },
      '/account': {
        title: '用户中心',
        containers: [Main],
        component: this.asyncComponent(() => import('routes/Main/Account'))
      },
      '/login': {
        title: '登录',
        containers: [Main],
        component: this.asyncComponent(() => import('routes/User/LogIn'), ['login'])
      },
      '/signup': {
        title: '注册',
        containers: [Main],
        component: this.asyncComponent(() => import('routes/User/SignUp'))
      },
      '/reset': {
        title: '找回密码',
        containers: [Main],
        component: this.asyncComponent(() => import('routes/User/Reset'))
      },
      '/reset/mail': {
        title: '找回密码',
        containers: [Main],
        component: this.asyncComponent(() => import('routes/User/Reset/Mail'))
      },
      '/mobile/login': {
        title: '用户登录',
        containers: [Mobile],
        component: this.asyncComponent(() => import('routes/User/LogIn'), ['login'])
      },
      '/mobile/signup': {
        title: '用户注册',
        containers: [Mobile],
        component: this.asyncComponent(() => import('routes/User/SignUp/Mobile'))
      },
      '/mobile/reset': {
        title: '重置密码',
        containers: [Mobile],
        component: this.asyncComponent(() => import('routes/User/Reset/Mobile'))
      },
      '/mobile/superBook': {
        title: '超级账本',
        containers: [Mobile],
        component: this.asyncComponent(() => import('routes/Main/SuperBook'))
      },
      '/mobile/share': {
        title: '邀请注册',
        containers: [Mobile],
        component: this.asyncComponent(() => import('routes/Mobile/Share'))
      },
      '/mobile/redpacket/:id': {
        title: '领取红包',
        containers: [Mobile],
        component: this.asyncComponent(() => import('routes/Mobile/RedPacket'))
      },
      '/mobile/redpacket/:id/detail': {
        title: '红包详情',
        containers: [Mobile],
        component: this.asyncComponent(() => import('routes/Mobile/RedPacket/Detail'))
      },
      '/404': {
        title: '未找到页面',
        component: this.asyncComponent(() => import('routes/Exception/404'))
      },
      '/clickfarm': {
        title: '挖矿',
        containers: [Main],
        component: this.asyncComponent(() => import('routes/Main/ClickFarm'))
      },
    }
  };

  componentDidMount() {
    const { localization } = this.props;

    window.addEventListener('resize', this.updateViewport);

    // copy 插件设置
    const clipboard = new ClipboardJS('.copy-btn');
    clipboard.on('success', function(e) {
      message.success(localization['复制成功']);
    });
    clipboard.on('error', function(e) {
      message.error(
        localization['您的浏览器版本较低，请升级浏览器或者使用chrome和firefox等浏览器重试！']
      );
    });
  }

  componentDidUpdate(prevProps, prevState) {
    // 监听全局的消息
    ['success', 'error', 'info', 'warn'].forEach(status => {
      const msg = this.props[`${status}Msg`];
      if (msg) {
        message[status](
          this.props.localization[msg] || msg + '...',
          this.clearMsg.bind(this, status)
        );
      }
    });
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.updateViewport);
  }

  // 输入价格和主币兑换人民币
  transferToCNY = (latestPrice, marketName) => {
    const { usdtToCnyRate, rateInfo } = this.props;
    const {
      btcLastPrice,
      ethLastPrice,
      cnbBtcLastPrice,
      cnbEthLastPrice,
      cnbEosLastPrice
    } = rateInfo;
    const mapToCNY = {
      BTC: latestPrice * (cnbBtcLastPrice ? cnbBtcLastPrice : btcLastPrice * usdtToCnyRate),
      ETH: latestPrice * (cnbEthLastPrice ? cnbEthLastPrice : ethLastPrice * usdtToCnyRate),
      CNB: latestPrice * 1,
      EUC: latestPrice * 7.88,
      VRT: latestPrice * 1,
      EOS: latestPrice * cnbEosLastPrice
    };
    const toCNY = mapToCNY[marketName] || latestPrice * usdtToCnyRate; //当前最新价的折合人民币
    return toCNY > 1 ? toCNY.toFixed(2) : toCNY.toFixed(6);
  };

  // 清空消息
  clearMsg = status => {
    this.props.dispatch({
      type: 'global/save',
      payload: { [`${status}Msg`]: '' }
    });
  };

  // 更新viewport
  updateViewport = debounce(() => {
    this.setState({
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
        dpr: window.devicePixelRatio
      }
    });
  }, 200);

  // 匹配路由
  static getDerivedStateFromProps = (props, state) => {
    const { location, localization } = props;
    const { pathname } = location;
    const { routerConfig } = state;

    let route = routerConfig['/404'];
    let toPath = pathname;
    if (routerConfig[pathname]) {
      route = routerConfig[pathname];
    } else if (/\/account/.test(pathname)) {
      route = routerConfig['/account'];
    } else {
      Object.keys(routerConfig).forEach(path => {
        if (pathToRegexp(path).test(pathname)) {
          route = routerConfig[path];
          toPath = path;
          return;
        }
      });
    }

    return {
      toPath,
      title: `${localization[route.title]}-${localization['环球数字资产交易平台']}`,
      Container: route.containers
        ? route.containers.reduce((A, B) => {
            return props => (
              <A {...props}>
                <B {...props}>{props.children}</B>
              </A>
            );
          })
        : Fragment,
      Component: route.component
    };
  };

  render() {
    const { isLogin } = this.props;
    const { toPath, title, Container, Component } = this.state;

    return (
      <DocumentTitle title={title}>
        <Container {...this.props} {...this.state}>
          <Route
            path={toPath}
            render={props => {
              if (!isLogin && /\/account/.test(toPath)) {
                return <Redirect to="/login" />;
              } else if (
                isLogin &&
                ['/login', '/signup', '/reset', '/reset/mail'].includes(toPath)
              ) {
                return <Redirect to="/" />;
              } else {
                return (
                  <Component
                    {...{
                      ...this.props,
                      ...props,
                      ...this.state,
                      transferToCNY: this.transferToCNY,
                      asyncComponent: this.asyncComponent
                    }}
                  />
                );
              }
            }}
          />
        </Container>
      </DocumentTitle>
    );
  }
}

export default App;
