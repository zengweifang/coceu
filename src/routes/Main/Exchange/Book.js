import React, { PureComponent, Fragment } from 'react';
import { Menu, Dropdown, Icon } from 'antd';
import Scrollbars from 'react-custom-scrollbars';
import classnames from 'classnames';
import { isEmpty } from 'lodash';
import { WS_PREFIX } from 'utils/constants';
import ReconnectingWebSocket from 'utils/ReconnectingWebSocket';
import { Loading, Empty } from 'components/Placeholder';

import styles from './book.less';

class Book extends PureComponent {
  state = {
    mergeNumber: 8,
    loading: true
  };

  componentDidMount() {
    this.connectWebsocket();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.bookType !== this.props.bookType) {
      if (this.props.bookType === 'sell') {
        if (this.sellScroller) {
          this.sellScroller.scrollToBottom();
        }
      } else if (this.props.bookType === 'buy') {
        if (this.buyScroller) {
          this.buyScroller.scrollToTop();
        }
      }
    }
    if (prevProps.tradePair !== this.props.tradePair) {
      this.setState({ loading: true });
    }
  }

  componentWillUnmount() {
    this.WebSocket && this.WebSocket.close();
    this.Timer && clearInterval(this.Timer);
  }

  // 买卖盘连接websocket
  connectWebsocket = () => {
    this.WebSocket = new ReconnectingWebSocket(`${WS_PREFIX}/buyAndSell`);
    const sendMessage = () => {
      if (this.WebSocket && this.WebSocket.readyState === 1) {
        const tradePair = this.props.tradePair.replace('/', '_');
        const { mergeNumber } = this.state;
        this.WebSocket.send(`${tradePair}_${mergeNumber}`);
      }
    };

    sendMessage();
    this.Timer = setInterval(sendMessage, 1000);
    this.WebSocket.onmessage = evt => {
      if (evt.data) {
        this.setState({ loading: false });
        this.props.dispatch({
          type: 'exchange/save',
          payload: {
            bookData: {
              sellOrderVOList: JSON.parse(evt.data).sellOrderVOList || [],
              buyOrderVOList: JSON.parse(evt.data).buyOrderVOList || []
            }
          }
        });
      }
    };
  };

  handleChangeMergeNumber = mergeNumber => {
    this.setState({ mergeNumber });
  };

  handlePickPrice = pickPrice => {
    this.props.dispatch({
      type: 'exchange/save',
      payload: { pickPrice }
    });
  };

  render() {
    const { localization, transferToCNY, bookType, tradePair, currentTrade, bookData } = this.props;
    const [coinName, marketName] = tradePair.split('/');
    const { pricePrecision, volumePrecision, volumePercent } = currentTrade;
    const { sellOrderVOList, buyOrderVOList } = bookData;
    const { mergeNumber, loading } = this.state;
    const Wrapper = bookType === 'buyAndSell' ? Fragment : Scrollbars;
    const sellScrollbarProps =
      bookType === 'sell' ? { ref: sellScroller => (this.sellScroller = sellScroller) } : {};
    const buyScrollbarProps =
      bookType === 'buy' ? { ref: buyScroller => (this.buyScroller = buyScroller) } : {};

    return (
      <div className={styles.book}>
        <div className={styles.title}>
          <span className={styles.type}>{localization['类型']}</span>
          <span className={styles.price}>
            {localization['价格']}
            {`(${marketName})`}
          </span>
          <span className={styles.volume}>
            {localization['数量']}
            {`(${coinName})`}
          </span>
        </div>
        <div className={classnames(styles.wrap, styles[bookType])}>
          <section className={styles.sell}>
            {loading ? (
              <Loading />
            ) : sellOrderVOList.length > 0 ? (
              <Wrapper {...sellScrollbarProps}>
                <ul>
                  {[...Array(30).fill({}), ...sellOrderVOList].map((record, index, arr) => {
                    const visibleLength = arr.length < 30 ? arr.length : 30;
                    const startIndex = arr.length - visibleLength;
                    return (
                      index > startIndex - 1 && (
                        <Record
                          {...{
                            record,
                            mergeNumber,
                            volumePercent,
                            volumePrecision,
                            key: record.price || index,
                            type: 'sell',
                            text: localization['卖'],
                            number: visibleLength - index + startIndex,
                            handlePickPrice: this.handlePickPrice.bind(this, record.price)
                          }}
                        />
                      )
                    );
                  })}
                </ul>
              </Wrapper>
            ) : (
              <Empty {...{ localization }} />
            )}
          </section>
          <div className={styles.toolBar}>
            {currentTrade && (
              <div className={styles.latestPrice}>
                <strong className={`font-color-${currentTrade.trend}`}>
                  {Number(currentTrade.latestPrice).toFixed(pricePrecision)}
                </strong>
                ≈ ￥{transferToCNY(currentTrade.latestPrice, marketName)}
              </div>
            )}
            <div className={styles.depth}>
              {localization['深度']}{' '}
              <Dropdown
                getPopupContainer={() => document.querySelector(`.${styles.toolBar}`)}
                overlay={
                  <Menu>
                    {[8, 6, 4].map(number => {
                      return (
                        <Menu.Item
                          key={number}
                          onClick={this.handleChangeMergeNumber.bind(this, number)}
                        >
                          {number}
                          {localization['位小数']}
                        </Menu.Item>
                      );
                    })}
                  </Menu>
                }
                trigger={['click']}
              >
                <a className="ant-dropdown-link" href="">
                  {mergeNumber}
                  {localization['位小数']} <Icon type="down" />
                </a>
              </Dropdown>
            </div>
          </div>
          <section className={styles.buy}>
            {loading ? (
              <Loading />
            ) : buyOrderVOList.length > 0 ? (
              <Wrapper {...buyScrollbarProps}>
                <ul>
                  {[...buyOrderVOList, ...Array(30).fill({})].map((record, index) => {
                    return (
                      index < 30 && (
                        <Record
                          {...{
                            record,
                            mergeNumber,
                            volumePercent,
                            volumePrecision,
                            key: record.price || index,
                            type: 'buy',
                            number: index + 1,
                            text: localization['买'],
                            handlePickPrice: this.handlePickPrice.bind(this, record.price)
                          }}
                        />
                      )
                    );
                  })}
                </ul>
              </Wrapper>
            ) : (
              <Empty {...{ localization }} />
            )}
          </section>
        </div>
      </div>
    );
  }
}

export default Book;

function Record({
  record,
  number,
  type,
  text,
  mergeNumber,
  volumePrecision,
  volumePercent,
  handlePickPrice
}) {
  const color = type === 'buy' ? 'green' : 'red';
  const percent = `${isEmpty(record) ? 0 : (record.volume / volumePercent) * 100}%`;
  return (
    <li style={{ '--percent': percent }} onClick={handlePickPrice}>
      <span className={styles.type}>
        {text}
        {number}
      </span>
      <span className={classnames(styles.price, `font-color-${color}`)}>
        {isEmpty(record) ? '----' : Number(record.price).toFixed(mergeNumber)}
      </span>
      <span>{isEmpty(record) ? '----' : Number(record.volume).toFixed(volumePrecision)}</span>
    </li>
  );
}
