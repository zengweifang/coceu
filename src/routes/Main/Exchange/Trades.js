import React, { PureComponent } from 'react';
import { connect } from 'dva';
import Scrollbars from 'react-custom-scrollbars';
import classnames from 'classnames';
import { stampToDate } from 'utils';
import { WS_PREFIX } from 'utils/constants';
import ReconnectingWebSocket from 'utils/ReconnectingWebSocket';
import { Loading, Empty } from 'components/Placeholder';

import styles from './trades.less';

@connect(({ loading }) => ({
  loading: loading.effects['exchange/fetchTradeList']
}))
class Trades extends PureComponent {
  componentDidMount() {
    const { tradePair } = this.props;
    if (tradePair) {
      const [coinOther, coinMain] = tradePair.split('/');
      this.props.dispatch({
        type: 'exchange/fetchTradeList',
        payload: { coinOther, coinMain }
      });
    }
    this.connectWebsocket();
  }

  componentDidUpdate(prevProps, prevState) {
    const { tradePair } = this.props;
    if (tradePair !== prevProps.tradePair) {
      const [coinOther, coinMain] = tradePair.split('/');
      this.props.dispatch({
        type: 'exchange/fetchTradeList',
        payload: { coinOther, coinMain }
      });

      // 最新成交websocket 重新发送交易对
      if (this.WebSocket && this.WebSocket.readyState === 1) {
        this.WebSocket.send(tradePair.replace('/', '_'));
      }
    }
  }

  componentWillUnmount() {
    this.WebSocket && this.WebSocket.close();
    this.Timer && clearInterval(this.Timer);
  }

  // 最新成交连接websocket
  connectWebsocket = () => {
    this.WebSocket = new ReconnectingWebSocket(`${WS_PREFIX}/flowingWater`);

    this.Timer = setInterval(() => {
      if (this.WebSocket && this.WebSocket.readyState === 1) {
        this.WebSocket.send('ping');
      }
    }, 1000 * 30);

    this.WebSocket.onopen = evt => {
      const { tradePair } = this.props;
      if (tradePair && this.WebSocket && this.WebSocket.readyState === 1) {
        this.WebSocket.send(tradePair.replace('/', '_'));
      }
    };

    this.WebSocket.onmessage = evt => {
      if (evt.data === 'pong') {
        return;
      }

      const { matchStreamVO, ...rateInfo } = JSON.parse(evt.data);

      const { tradePair, bookData, marketData, tradeList } = this.props;
      const [coinName, marketName] = tradePair.split('/');
      let newTradeList = tradeList;

      if (matchStreamVO) {
        // 当流水的交易对跟当前交易对相等时
        const { coinOther, coinMain, price, volume } = matchStreamVO;
        if (coinMain === marketName && coinOther === coinName) {
          marketData[coinMain] = marketData[coinMain].map(pair => {
            if (pair.coinOther === coinOther) {
              if (!pair.firstPrice) {
                pair.firstPrice = pair.latestPrice;
              }
              pair.latestPrice = price;
              let rise = '0.00%';
              if (pair.firstPrice > 0) {
                rise = ((pair.latestPrice - pair.firstPrice) / pair.firstPrice) * 100;
                rise = rise.toFixed(2) + '%';
              }
              pair.rise = rise;
            }
            return pair;
          });

          bookData.buyOrderVOList = bookData.buyOrderVOList.filter(item => {
            if (item.price === price) {
              item.volume -= volume;
            }
            return item.volume > 0;
          });

          bookData.sellOrderVOList = bookData.sellOrderVOList.filter(item => {
            if (item.price === price) {
              item.volume -= volume;
            }
            return item.volume > 0;
          });

          if (tradeList) {
            tradeList.unshift({ ...matchStreamVO, key: Math.random() * 10 ** 18 });
            newTradeList = tradeList.slice(0, 30);
          }

          for (const key in rateInfo) {
            if (!rateInfo[key]) {
              delete rateInfo[key];
            }
          }

          this.props.dispatch({
            type: 'markets/save',
            payload: { marketData }
          });

          this.props.dispatch({
            type: 'global/updateRateInfo',
            payload: rateInfo
          });

          this.props.dispatch({
            type: 'exchange/save',
            payload: { bookData, tradeList: newTradeList }
          });
        }
      }
    };
  };

  handlePickPrice = pickPrice => {
    this.props.dispatch({
      type: 'exchange/save',
      payload: { pickPrice }
    });
  };

  render() {
    const { localization, tradePair, tradeList, currentTrade, loading } = this.props;
    const { pricePrecision, volumePrecision } = currentTrade;
    const [coinName, marketName] = tradePair.split('/');

    return (
      <div className={styles.trades}>
        <div className={styles.title}>
          <span className={styles.date}>{localization['时间']}</span>
          <span className={styles.price}>
            {localization['价格']}({marketName})
          </span>
          <span className={styles.volume}>
            {localization['数量']}({coinName})
          </span>
        </div>
        {loading ? (
          <Loading />
        ) : tradeList?.length > 0 ? (
          <Scrollbars>
            <ul className={styles.list}>
              {tradeList.map((record, index) => {
                return (
                  <Record
                    {...{
                      ...record,
                      pricePrecision,
                      volumePrecision,
                      handlePickPrice: this.handlePickPrice.bind(this, record.price)
                    }}
                  />
                );
              })}
            </ul>
          </Scrollbars>
        ) : (
          <Empty {...{ localization }} />
        )}
      </div>
    );
  }
}

export default Trades;

function Record({ type, date, price, volume, pricePrecision, volumePrecision, handlePickPrice }) {
  const color = Number(type) === 0 ? 'green' : 'red';
  return (
    <li onClick={handlePickPrice}>
      <span className={styles.date}>{stampToDate(Number(date), 'hh:mm:ss')}</span>
      <span className={classnames(styles.price, `font-color-${color}`)}>
        {Number(price).toFixed(pricePrecision)}
      </span>
      <span className={styles.volume}>{Number(volume).toFixed(volumePrecision)}</span>
    </li>
  );
}
