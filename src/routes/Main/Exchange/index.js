import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import { Icon, Popover, Switch } from 'antd';
import { Responsive, WidthProvider } from 'react-grid-layout';
import classnames from 'classnames';
import { isEmpty, throttle } from 'lodash';
import { Loading } from 'components/Placeholder';
import DocumentTitle from 'react-document-title';

import Markets from './Markets';

import styles from './index.less';

const ResponsiveGridLayout = WidthProvider(Responsive);

@connect(({ exchange, markets }) => ({ ...exchange, ...markets }))
class Exchange extends PureComponent {
  state = {
    breakpoint: 'lg', // 当前布局等级
    currentTrade: {}, // 当前交易对信息
    showMarket: false, // 是否显示市场下拉框
    chartType: 'kline', // 当前图表显示的类型
    bookType: 'buyAndSell', // 当前orderBook显示列表的类型
    transactionType: 'buy', // 当前显示交易框类型
    ordersType: 'pending', // 当前显示订单列表类型
    scrollY: window.scrollY, // 滚动条垂直位置
    scrollDirection: 'none', // 滚动方向
    exhcangeFullscreen: false //是否全屏交易区
  };

  // 异步加载组件
  asyncComponent = (loader, models) =>
    this.props.asyncComponent(
      loader,
      models,
      <div className="box-loading">
        <Loading />
      </div>
    );

  widgets = {
    chart: {
      Component: this.asyncComponent(() => import('./Chart')),
      isCloseable: true,
      isMaximizeable: true
    },
    book: {
      Component: this.asyncComponent(() => import('./Book')),
      isCloseable: true,
      isMaximizeable: true
    },
    orders: {
      Component: this.asyncComponent(() => import('./Orders')),
      isCloseable: true,
      isMaximizeable: true
    },
    transaction: {
      Component: this.asyncComponent(() => import('./Transaction')),
      isCloseable: true,
      isMaximizeable: true
    },
    trades: {
      Component: this.asyncComponent(() => import('./Trades')),
      isCloseable: true,
      isMaximizeable: true
    }
  };

  componentDidMount() {
    this.props.dispatch({
      type: 'global/changeTheme',
      // payload: 'dark'
      //after modify
      payload:'light'
    });

    document.addEventListener('fullscreenchange', this.changeFullscreen);
    document.addEventListener('webkitfullscreenchange', this.changeFullscreen);
    document.addEventListener('mozfullscreenchange', this.changeFullscreen);
    document.addEventListener('MSFullscreenChange', this.changeFullscreen);
  }

  componentDidUpdate(prevProps, prevState) {
    const { viewport, layouts } = this.props;
    if (prevProps.viewport.width !== viewport.width) {
      this.handleLayoutChange(layouts[this.state.breakpoint]);
    }

    if (this.state.showMarket) {
      document.body.setAttribute('style', 'position: fixed; width: 100%; height: 100%');
    } else {
      document.body.removeAttribute('style');
    }

    let currentTrade = this.state.currentTrade;
    var test = ['分时','1m','5m','15m','30m','1H','2H','4H'];
    if(document.getElementsByTagName('iframe')[0]){
      var list = document.getElementsByTagName('iframe')[0].contentWindow.document.getElementsByClassName('resolution');
      if(currentTrade.key === 'MG/USDT'){
        for(let i=0; i<list.length; i++){
          if(test.includes(list[i].innerHTML)){
            list[i].style.display = 'none';
          }
        }
      }else{
        for(let i = 0; i<list.length; i++){
          list[i].style.display = 'block';
        }
      }
    }
  }

  static getDerivedStateFromProps(props) {
    const { marketData, tradePair } = props;
    const [coinOther, coinMain] = tradePair ? tradePair.split('/') : ['ETH', 'BTC'];
    let currentTrade = {
      coinMain,
      coinOther,
      dayCount: 0,
      firstPrice: 0,
      highestPrice: 0,
      latestPrice: 0,
      lowerPrice: 0,
      minuteTime: 0,
      pricePrecision: 2,
      rise: '0.00%',
      volumePercent: 50,
      volumePrecision: 2,
      trend: 'green'
    }; // 定义当前交易对默认数据
    let findTrade = {};
    if (!isEmpty(marketData)) {
      Object.values(marketData).find(
        marketList => (findTrade = marketList.find(pair => pair.key === tradePair))
      );
      currentTrade = {
        ...findTrade,
        trend: findTrade?.rise && /-/.test(findTrade.rise) ? 'red' : 'green'
      };
    }
    return { currentTrade };
  }

  componentWillUnmount() {
    this.props.dispatch({
      type: 'global/changeTheme',
      payload: 'light'
    });
    document.body.removeAttribute('style');

    document.removeEventListener('fullscreenchange', this.changeFullscreen);
    document.removeEventListener('webkitfullscreenchange', this.changeFullscreen);
    document.removeEventListener('mozfullscreenchange', this.changeFullscreen);
    document.removeEventListener('MSFullscreenChange', this.changeFullscreen);
  }

  // 滚动条操作
  handleScroll = throttle(() => {
    const { scrollY } = this.state;
    const scrollDirection = scrollY > window.scrollY ? 'up' : 'down';
    this.setState({ scrollY: window.scrollY, scrollDirection });
  }, 200);

  handleVisibilityMarket = showMarket => {
    this.setState({ showMarket });
  };

  handleLayoutChange = layout => {
    const newLayouts = { ...this.props.layouts, [this.state.breakpoint]: layout };
    this.props.dispatch({
      type: 'exchange/setLayouts',
      payload: newLayouts
    });
  };

  handleBreakpointChange = breakpoint => {
    this.setState({ breakpoint });
  };

  lanchFullscreen(element) {
    if (element.requestFullscreen) {
      element.requestFullscreen();
    } else if (element.mozRequestFullScreen) {
      element.mozRequestFullScreen();
    } else if (element.msRequestFullscreen) {
      element.msRequestFullscreen();
    } else if (element.webkitRequestFullscreen) {
      element.webkitRequestFullScreen();
    }
  }

  exitFullscreen() {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    } else if (document.webkitCancelFullScreen) {
      document.webkitCancelFullScreen();
    }
  }

  resetLayouts = () => {
    this.props.dispatch({
      type: 'exchange/resetLayouts'
    });
  };

  handleFullScreen = () => {
    if (this.state.exhcangeFullscreen) {
      this.exitFullscreen();
    } else {
      this.lanchFullscreen(this.exchangeContainer);
    }
  };

  changeFullscreen = () => {
    this.setState({ exhcangeFullscreen: !this.state.exhcangeFullscreen });
  };

  handleMaximize = widget => {
    this.props.dispatch({
      type: 'exchange/fullScreenWidget',
      payload: widget.i
    });
  };

  handleRestore = widget => {
    this.props.dispatch({
      type: 'exchange/restoreLayouts',
      payload: widget.i
    });
  };

  handleClose = widget => {
    this.props.dispatch({
      type: 'exchange/closeWidget',
      payload: widget.i
    });
  };

  handleSwitchTabs = ({ type, key }, e) => {
    e.stopPropagation();
    this.setState({ [`${type}Type`]: key });
  };

  handleWidgetSwitch = (name, checked) => {
    this.props.dispatch({
      type: 'exchange/switchWidget',
      payload: { name, checked }
    });
  };

  render() {
    const {
      localization,
      tradePair,
      transferToCNY,
      viewport,
      layouts,
      isDraggable,
      isResizable
    } = this.props;
    const {
      showMarket,
      breakpoint,
      currentTrade,
      bookType,
      chartType,
      ordersType,
      transactionType,
      exhcangeFullscreen
    } = this.state;

    const gridHeight = exhcangeFullscreen
      ? viewport.height - 160
      : Math.max(viewport.height - 220, 700);
    const exchangeHeight = exhcangeFullscreen ? viewport.height : viewport.height - 55;

    const assignWidgetsTitle = {
      trades: <strong>{localization['最新成交']}</strong>
    };

    const assignWidgetsTabs = {
      chart: (
        <ul className={styles.tabs}>
          {[{ key: 'kline', text: 'K线' }, { key: 'information', text: '币种资料' }].map(
            ({ key, text }) => {
              return (
                <li
                  key={key}
                  className={classnames({ [styles.active]: key === chartType })}
                  onClick={this.handleSwitchTabs.bind(this, { type: 'chart', key })}
                >
                  {localization[text]}
                </li>
              );
            }
          )}
        </ul>
      ),
      book: (
        <ul className={classnames(styles.bookTabs, styles[bookType])}>
          {['buyAndSell', 'buy', 'sell'].map(key => {
            return (
              <li
                key={key}
                className={styles[key]}
                onClick={this.handleSwitchTabs.bind(this, { type: 'book', key })}
              >
                <span />
              </li>
            );
          })}
        </ul>
      ),
      transaction: (
        <ul className={styles.tabs}>
          {[{ key: 'buy', text: '买' }, { key: 'sell', text: '卖' }].map(({ key, text }) => {
            return (
              <li
                key={key}
                className={classnames({ [styles.active]: key === transactionType })}
                onClick={this.handleSwitchTabs.bind(this, { type: 'transaction', key })}
              >
                {localization[text]}
              </li>
            );
          })}
        </ul>
      ),
      orders: (
        <ul className={styles.tabs}>
          {[{ key: 'pending', text: '我的挂单' }, { key: 'completed', text: '成交历史' }].map(
            ({ key, text }) => {
              return (
                <li
                  key={key}
                  className={classnames({ [styles.active]: key === ordersType })}
                  onClick={this.handleSwitchTabs.bind(this, { type: 'orders', key })}
                >
                  {localization[text]}
                </li>
              );
            }
          )}
        </ul>
      )
    };

    const customize = (
      <ul className={styles.customize}>
        {[
          { name: 'chart', text: '图表资料' },
          { name: 'book', text: '委托列表' },
          { name: 'trades', text: '最新成交' },
          { name: 'transaction', text: '限价交易' },
          { name: 'orders', text: '我的委托' }
        ].map(item => {
          const checked = layouts[breakpoint].some(point => point.i === item.name);
          return (
            <li key={item.name}>
              {localization[item.text]}
              <Switch checked={checked} onChange={this.handleWidgetSwitch.bind(this, item.name)} />
            </li>
          );
        })}
      </ul>
    );

    return (
      <DocumentTitle
        title={`${currentTrade.latestPrice} ${tradePair}-${localization['币币交易']}-${
          localization['环球数字资产交易平台']
        }`}
      >
        <div
          className={styles.exchange}
          style={{ minHeight: exchangeHeight }}
          ref={exchangeContainer => {
            this.exchangeContainer = exchangeContainer;
          }}
        >
          <div className={styles.topBar}>
            <div
              className={classnames({ [styles.tradePair]: true, [styles.unfold]: showMarket })}
              onClick={this.handleVisibilityMarket.bind(this, !showMarket)}
            >
              {tradePair}
              <Icon type="caret-down" className={styles.triangle} />
              <Markets
                {...{
                  viewport,
                  showMarket,
                  localization,
                  transferToCNY,
                  tradePairClassName: styles.tradePair,
                  handleVisibilityMarket: this.handleVisibilityMarket
                }}
              />
            </div>
            {currentTrade && (
              <ul className={styles.currentTrade}>
                <li
                  className={styles.latestPrice}
                  dangerouslySetInnerHTML={{
                    __html: `<span class=${`font-color-${
                      currentTrade.trend
                    }`} style="font-size: 1rem;">${Number(currentTrade.latestPrice).toFixed(
                      currentTrade.pricePrecision
                    )}</span>&asymp;￥${transferToCNY(
                      currentTrade.latestPrice,
                      currentTrade.coinMain
                    )}`
                  }}
                />
                <li className={styles.highestPrice}>
                  <span>{localization['最高价']}</span>
                  {currentTrade.highestPrice}
                </li>
                <li className={styles.lowerPrice}>
                  <span>{localization['最低价']}</span>
                  {currentTrade.lowerPrice}
                </li>
                <li className={styles.volume}>
                  <span>{localization['成交量']}</span>
                  {currentTrade.dayCount}
                </li>
                <li className={styles.change}>
                  <span>{localization['涨跌幅']}</span>
                  <span className={`font-color-${currentTrade.trend}`}>{currentTrade.rise}</span>
                </li>
              </ul>
            )}
            <div className={styles.setting}>
              <Popover
                trigger="click"
                content={customize}
                title={
                  <Fragment>
                    {localization['设置']}
                    <i
                      className="iconfont icon-reset"
                      title={localization['重置']}
                      onClick={this.resetLayouts}
                    />
                  </Fragment>
                }
                getPopupContainer={() => document.querySelector(`.${styles.setting}`)}
              >
                <Icon type="setting" theme="outlined" title={localization['设置']} />
              </Popover>
              <Icon
                type={exhcangeFullscreen ? 'fullscreen-exit' : 'fullscreen'}
                theme="outlined"
                title={exhcangeFullscreen ? localization['退出全屏'] : localization['全屏']}
                onClick={this.handleFullScreen}
              />
            </div>
          </div>
          <ResponsiveGridLayout
            margin={[5, 5]}
            layouts={layouts}
            className={styles.container}
            rowHeight={gridHeight / 24}
            ref={grid => (this.grid = grid)}
            draggableHandle={`.${styles.title}`}
            cols={{ lg: 24, md: 24, sm: 24, xs: 24 }}
            onDragStop={this.handleLayoutChange}
            onResizeStop={this.handleLayoutChange}
            onBreakpointChange={this.handleBreakpointChange}
            isDraggable={isDraggable && viewport.width > 767}
            isResizable={isResizable && viewport.width > 767}
            breakpoints={{ lg: 1600, md: 1200, sm: 768, xs: 480 }}
          >
            {layouts[breakpoint].map(widget => {
              const { Component, isCloseable, isMaximizeable, isMinmizeable } = this.widgets[
                widget.i
              ];
              const maxmize =
                layouts[breakpoint].length === 1 &&
                layouts[breakpoint][0].w === 24 &&
                layouts[breakpoint][0].h === 24;
              const widgetOptions = {
                maxmize,
                localization,
                title: assignWidgetsTitle[widget.i],
                tabs: assignWidgetsTabs[widget.i],
                handleClose:
                  isCloseable && viewport.width > 767 && this.handleClose.bind(this, widget),
                handleMaximize:
                  isMaximizeable && viewport.width > 767 && this.handleMaximize.bind(this, widget),
                handleRestore: isMaximizeable && this.handleRestore.bind(this, widget),
                handleMinmize: isMinmizeable && this.handleMinmize.bind(this, widget)
              };

              return (
                <div key={widget.i} className={styles.widget}>
                  <Widget {...widgetOptions}>
                    {Component && <Component {...this.props} {...this.state} />}
                  </Widget>
                </div>
              );
            })}
          </ResponsiveGridLayout>
        </div>
      </DocumentTitle>
    );
  }
}

export default Exchange;

const Widget = ({
  tabs,
  title,
  maxmize,
  children,
  handleClose,
  localization,
  handleRestore,
  handleMaximize
}) => {
  return (
    <section key="markets" className={styles.widget}>
      <header className={styles.header}>
        {tabs}
        <div className={classnames({ [styles.title]: true, [styles.dragger]: !maxmize })}>
          {title}
        </div>
        <div className={styles.controls}>
          {handleMaximize && !maxmize && (
            <Icon
              type="arrows-alt"
              theme="outlined"
              title={localization['最大化']}
              onClick={handleMaximize}
            />
          )}
          {handleRestore && maxmize && (
            <Icon
              type="shrink"
              theme="outlined"
              title={localization['复原']}
              onClick={handleRestore}
            />
          )}
          {handleClose && !maxmize && (
            <Icon
              type="close"
              theme="outlined"
              title={localization['关闭']}
              onClick={handleClose}
            />
          )}
        </div>
      </header>
      <main className={styles.body}>{children}</main>
    </section>
  );
};
