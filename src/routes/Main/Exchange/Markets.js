import React, { PureComponent, Fragment } from 'react';
import { Tabs, Input, Icon } from 'antd';
import classnames from 'classnames';
import Scrollbars from 'react-custom-scrollbars';
import withMarkets from 'components/withMarkets';
import { isEmpty } from 'lodash';
import { Loading, Empty } from 'components/Placeholder';

import styles from './markets.less';

const TabPane = Tabs.TabPane;
const Search = Input.Search;

@withMarkets
class Market extends PureComponent {
  state = { showCNY: false };

  componentDidMount() {
    document.addEventListener('click', this.onSwitchVisibleMarket);
  }

  componentWillUnmount() {
    document.removeEventListener('click', this.onSwitchVisibleMarket);
  }

  handleTransferCNY = () => {
    this.setState({ showCNY: !this.state.showCNY });
  };

  onSwitchVisibleMarket = event => {
    event.stopPropagation();
    const { handleVisibilityMarket, tradePairClassName, handleSearch } = this.props;
    const tradePair = document.querySelector(`.${tradePairClassName}`);
    const List = document.querySelector(`.${styles.list}`);

    // 切换市场框显示状态
    if (event.target !== tradePair) {
      handleVisibilityMarket(
        (tradePair.contains(event.target) && (!List || !List.contains(event.target))) ||
          /anticon-star/.test(event.target.className) ||
          /areaTitle/.test(event.target.className) ||
          /areaTitle/.test(event.target.parentNode.className)
      );
    }

    // 清空搜索关键字
    if (
      !tradePair.contains(event.target) ||
      (List && List.contains(event.target)) ||
      event.target === tradePair
    ) {
      handleSearch({ target: { value: '' } });
    }
  };

  // 切换交易对
  handleSwitchTradePair = pair => {
    // var test = ['分时','1m','5m','15m','30m','1H','2H','4H'];
    // var list = document.getElementsByTagName('iframe')[0].contentWindow.document.getElementsByClassName('resolution');
    // if(pair.key === 'MG/USDT'){
    //   for(let i=0; i<list.length; i++){
    //     if(test.includes(list[i].innerHTML)){
    //       list[i].style.display = 'none';
    //     }
    //   }
    // }else{
    //   for(let i = 0; i<list.length; i++){
    //     list[i].style.display = 'block';
    //   }
    // }
    if (!pair.title) {
      this.props.handleSelectPair(pair);
      this.props.handleVisibilityMarket(false);
      const { key, pricePrecision, volumePrecision } = pair;
      window.tvWidget && window.tvWidget.chart().setSymbol(key);
      sessionStorage.setItem('pricePrecision', pricePrecision);
      sessionStorage.setItem('volumePrecision', volumePrecision);
    }
  };

  render() {
    let {
      sorter,
      tradePair,
      handleSort,
      marketName,
      marketKeys,
      marketList,
      showMarket,
      searchValue,
      localization,
      handleSearch,
      favoriteCoins,
      handleCollect,
      transferToCNY,
      marketsLoading,
      handleSwitchMarkets
    } = this.props;
    const { showCNY } = this.state;

    return (
      <div className={classnames({ [styles.markets]: true, [styles.show]: showMarket })}>
        <header className={styles.header}>
          <div className={styles.search}>
            <Search
              size="small"
              value={searchValue}
              placeholder={localization['查询']}
              onChange={handleSearch}
            />
          </div>
          <div
            className={classnames({ [styles.transfer]: true, [styles.active]: showCNY })}
            onClick={this.handleTransferCNY}
          >
            <Icon type="swap" /> CNY
          </div>
        </header>
        <div className={styles.title}>
          <span className={styles.coin}>{localization['币种']}</span>
          <span
            className={classnames(styles.price, styles.sorter)}
            onClick={handleSort.bind(this, 'latestPrice')}
          >
            {localization['最新价']}
            <span
              className={classnames({
                [styles.sortMark]: true,
                [styles[sorter['latestPrice']]]: !!sorter['latestPrice']
              })}
            >
              <Icon type="caret-up" className={classnames(styles.icon, styles.up)} />
              <Icon type="caret-down" className={classnames(styles.icon, styles.down)} />
            </span>
          </span>
          <span
            className={classnames(styles.change, styles.sorter)}
            onClick={handleSort.bind(this, 'rise')}
          >
            {localization['涨跌幅']}
            <span
              className={classnames({
                [styles.sortMark]: true,
                [styles[sorter['rise']]]: !!sorter['rise']
              })}
            >
              <Icon type="caret-up" className={classnames(styles.icon, styles.up)} />
              <Icon type="caret-down" className={classnames(styles.icon, styles.down)} />
            </span>
          </span>
        </div>
        <Tabs activeKey={marketName} onChange={handleSwitchMarkets}>
          {marketKeys.map(marketKey => (
            <TabPane
              tab={
                marketKey === 'Favorites' ? (
                  <Fragment>
                    <Icon
                      type="star"
                      className={marketName === 'Favorites' ? 'collected' : ''}
                      theme={marketName === 'Favorites' ? 'filled' : 'outlined'}
                    />
                    {localization['自选']}
                  </Fragment>
                ) : (
                  marketKey
                )
              }
              key={marketKey}
            >
              {marketKey === marketName ? (
                marketsLoading ? (
                  <Loading />
                ) : isEmpty(marketList) ? (
                  <Empty {...{ localization }} />
                ) : (
                  <Scrollbars>
                    <ul
                      className={classnames({
                        [styles.list]: true
                      })}
                    >
                      {marketList.map(pair =>
                        pair.title ? (
                          <li className={styles.areaTitle}>
                            <div>{localization[pair.title]}</div>
                          </li>
                        ) : (
                          <li
                            key={pair.key}
                            className={classnames({
                              [styles.active]: pair.key === tradePair
                            })}
                            onClick={this.handleSwitchTradePair.bind(this, pair)}
                          >
                            <Icon
                              type="star"
                              onClick={handleCollect.bind(this, pair)}
                              className={favoriteCoins.includes(pair.key) ? 'collected' : ''}
                              theme={favoriteCoins.includes(pair.key) ? 'filled' : 'outlined'}
                            />
                            <span className={styles.coin}>
                              {pair.coinOther}/{pair.coinMain}
                            </span>
                            <span className={styles.price}>
                              {showCNY
                                ? `￥${Number(
                                    transferToCNY(pair.latestPrice, pair.coinMain)
                                  ).toFixed(pair.pricePrecision) * 1}`
                                : pair.latestPrice.toFixed(pair.pricePrecision)}
                            </span>
                            <span
                              className={classnames(
                                styles.change,
                                `font-color-${/-/.test(pair.rise) ? 'red' : 'green'}`
                              )}
                            >
                              {pair.rise}
                            </span>
                          </li>
                        )
                      )}
                    </ul>
                  </Scrollbars>
                )
              ) : null}
            </TabPane>
          ))}
        </Tabs>
      </div>
    );
  }
}

export default Market;
