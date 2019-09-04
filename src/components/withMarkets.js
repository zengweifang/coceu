import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { isEmpty } from 'lodash';
import { setLocalStorage } from 'utils';
import { WS_PREFIX } from 'utils/constants';
import ReconnectingWebSocket from 'utils/ReconnectingWebSocket';

function widthMarkets(WrappedComponent) {
  @connect(({ markets, loading }) => ({
    ...markets,
    marketsLoading: loading.effects['markets/fetchMarketData']
  }))
  class Markets extends PureComponent {
    marketKeys = Object.keys(this.props.marketData);
    state = {
      sorter: {},
      searchValue: '',
      marketList: [],
      marketName: this.props.tradePair.split('/')[1] || this.marketKeys[0] || 'Favorites',
      marketKeys: ['Favorites', ...this.marketKeys]
    };

    static getDerivedStateFromProps(props, state) {
      const { marketData, favoriteCoins } = props;
      const { searchValue, marketName, sorter } = state;

      let marketList = [];

      // 按市场名筛选
      if (!isEmpty(marketData)) {
        if (marketName === 'Favorites') {
          Object.keys(marketData).forEach(key => {
            marketData[key].forEach(item => {
              if (favoriteCoins.includes(item.key)) {
                marketList.push(item);
              }
            });
          });
        } else {
          marketList = marketData[marketName];
        }
      }

      // 按搜索关键字筛选
      if (searchValue) {
        marketList = marketList.filter(item => {
          return !item.title && item.coinOther.indexOf(searchValue.toLocaleUpperCase()) !== -1;
        });
      }

      // 根据选择的字段和排序方式排序
      if (Object.keys(sorter).length > 0) {
        let sorterKey, sorterType;
        Object.keys(sorter).forEach(key => {
          sorterKey = key;
          sorterType = sorter[key];
        });
        marketList = marketList.sort((a, b) => {
          const aKey = /[A-Z]+/.test(a[sorterKey])
            ? a[sorterKey].charCodeAt()
            : String(a[sorterKey]).replace('%', '') * 1;
          const bKey = /[A-Z]+/.test(b[sorterKey])
            ? b[sorterKey].charCodeAt()
            : String(b[sorterKey]).replace('%', '') * 1;
          if (sorterType === 'up') {
            return aKey - bKey;
          } else {
            return bKey - aKey;
          }
        });
      }

      return { marketList };
    }

    componentDidMount() {
      this.props.dispatch({ type: 'markets/fetchMarketData' });
      this.connectWebsocket();
    }

    componentDidUpdate(prevProps) {
      const { marketData } = this.props;
      if (isEmpty(prevProps.marketData) && !isEmpty(marketData)) {
        const marketKeys = Object.keys(marketData);
        this.setState({
          marketName: this.props.tradePair.split('/')[1] || marketKeys[0],
          marketKeys: ['Favorites', ...marketKeys]
        });
      }
    }

    componentWillUnmount() {
      this.WebSocket && this.WebSocket.close();
      this.Timer && clearInterval(this.Timer);
    }

    //收藏币种
    handleCollect = (record, event) => {
      event.stopPropagation();
      this.props.dispatch({
        type: 'markets/collectCoin',
        payload: record
      });
    };

    // 切换市场
    handleSwitchMarkets = marketName => {
      this.setState({ marketName, sorter: {} });
    };

    // 搜索币
    handleSearch = event => {
      this.setState({ searchValue: event.target.value });
    };

    // 币种根据key排序
    handleSort = key => {
      const { sorter } = this.state;
      const sortType = sorter[key] ? (sorter[key] === 'up' ? 'down' : 'up') : 'up';
      this.setState({
        sorter: { [key]: sortType }
      });
    };

    // 选择交易对
    handleSelectPair = pair => {
      setLocalStorage('tradePair', pair.key);
      this.props.dispatch({
        type: 'markets/saveTradePair',
        payload: pair.key
      });
    };

    // 市场websocket
    connectWebsocket = () => {
      this.WebSocket = new ReconnectingWebSocket(`${WS_PREFIX}/plat`);

      this.Timer = setInterval(() => {
        if (this.marketWS && this.WebSocket.readyState === 1) {
          this.WebSocket.send('ping');
        }
      }, 1000 * 30);

      this.WebSocket.onmessage = evt => {
        if (evt.data === 'pong') {
          return;
        }

        const marketData = {};
        Object.keys(JSON.parse(evt.data)).forEach((marketName, marketIndex) => {
          marketData[marketName] = JSON.parse(evt.data)[marketName].map((pair, pairIndex) => {
            const key = `${pair.coinOther}/${pair.coinMain}`;
            return { ...pair, key, rise: pair.rise || '0.00%' };
          });
        });

        // 如果有推送就更新
        this.props.dispatch({
          type: 'markets/save',
          payload: { marketData }
        });
      };
    };

    render() {
      const {
        props,
        state,
        handleCollect,
        handleSearch,
        handleSort,
        handleSelectPair,
        handleSwitchMarkets
      } = this;

      return (
        <WrappedComponent
          {...{
            ...props,
            ...state,
            handleCollect,
            handleSearch,
            handleSort,
            handleSelectPair,
            handleSwitchMarkets
          }}
        />
      );
    }
  }

  return Markets;
}

export default widthMarkets;
