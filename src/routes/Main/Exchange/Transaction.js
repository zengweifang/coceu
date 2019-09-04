import React, { PureComponent } from 'react';
import TransactionForm from './TransactionForm';
import { WS_PREFIX } from 'utils/constants';
import ReconnectingWebSocket from 'utils/ReconnectingWebSocket';

import styles from './transaction.less';

class Transaction extends PureComponent {
  componentDidMount() {
    const { isLogin, dispatch, tradePair } = this.props;
    if (isLogin && tradePair) {
      const [coinName, marketName] = tradePair.split('/');
      dispatch({
        type: 'exchange/fetchVolume',
        payload: {
          volumeType: 'mainVolume',
          symbol: marketName
        }
      });
      dispatch({
        type: 'exchange/fetchVolume',
        payload: {
          volumeType: 'coinVolume',
          symbol: coinName
        }
      });
      this.connectWebsocket();
    }
  }

  componentDidUpdate(prevProps) {
    const { isLogin, dispatch, tradePair } = this.props;
    if (isLogin && tradePair) {
      const [coinName, marketName] = this.props.tradePair.split('/');
      const [prevCoinName, prevMarketName] = prevProps.tradePair.split('/');
      if (marketName !== prevMarketName) {
        dispatch({
          type: 'exchange/fetchVolume',
          payload: {
            volumeType: 'mainVolume',
            symbol: marketName
          }
        });
      }
      if (coinName !== prevCoinName) {
        dispatch({
          type: 'exchange/fetchVolume',
          payload: {
            volumeType: 'coinVolume',
            symbol: coinName
          }
        });
      }
    }
  }

  componentWillUnmount() {
    this.WebSocket && this.WebSocket.close();
    this.Timer && clearInterval(this.Timer);
  }

  // 用户资产socket
  connectWebsocket = () => {
    const { account, dispatch } = this.props;
    const { id } = account;
    this.WebSocket = new ReconnectingWebSocket(`${WS_PREFIX}/userVolume?${id}`);

    this.Timer = setInterval(() => {
      if (this.WebSocket && this.WebSocket.readyState === 1) {
        this.WebSocket.send(`${this.props.tradePair.replace('/', '_')}_${id}`);
      }
    }, 1000 * 3);

    this.WebSocket.onmessage = evt => {
      if (evt.data !== 'pong') {
        const { coinMainVolume, coinOtherVolume } = JSON.parse(evt.data);

        const { mainVolume, coinVolume } = this.props;
        // 当推的数据有主币而且跟当前不相等，就更新主币资产
        if (coinMainVolume && coinMainVolume.volume !== mainVolume) {
          dispatch({
            type: 'exchange/save',
            payload: { mainVolume: coinMainVolume.volume }
          });
        }

        // 当推的数据有副币而且跟当前不相等，就更新副币资产
        if (coinOtherVolume && coinOtherVolume.volume !== coinVolume) {
          dispatch({
            type: 'exchange/save',
            payload: { coinVolume: coinOtherVolume.volume }
          });
        }
      }
    };
  };

  render() {
    const { localization, tradePair, transactionType, mainVolume, coinVolume } = this.props;
    const [coinName, marketName] = tradePair.split('/');

    return (
      <div className={styles.transaction}>
        <div className={styles.available}>
          <span>
            {marketName} {localization['可用']} <strong>{Number(mainVolume).toFixed(8)}</strong>
          </span>
          <span>
            {coinName} {localization['可用']} <strong>{Number(coinVolume).toFixed(8)}</strong>
          </span>
        </div>
        {['buy', 'sell'].map(type => {
          const typeToText = {
            buy: '买',
            sell: '卖'
          };
          const passProps = {
            key: type,
            transactionType: type,
            text: typeToText[type]
          };
          if (type === transactionType) passProps.className = styles.active;
          return <TransactionForm {...this.props} {...passProps}  />;
        })}
      </div>
    );
  }
}

export default Transaction;
