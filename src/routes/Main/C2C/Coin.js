import React, { PureComponent } from "react";
import classnames from "classnames";
import { isEmpty } from "lodash";
import { Radio, Button } from "antd";
import Setting from './Setting';
import styles from "./index.less";

export default class Coin extends PureComponent {
  mHandleChangeCoin = e => {
    const { coinList, changeCoin } = this.props;
    const tradeType = e.target.value;
    const currentCoin = isEmpty(coinList) ? "" : coinList[0];

    changeCoin(tradeType, currentCoin);
  };

  mCoinClick = (tradeType, currentCoin) => {
    const { changeCoin } = this.props;
    changeCoin(tradeType, currentCoin);
  };

  render() {
    const {
      coinList,
      tradeType,
      currentCoin,
      changeCoin,
      localization,
      publishLoading,
      handleTransfer,
      handlePublish,
      theme,
      changeTheme
    } = this.props;

    const settingProps = {
      theme,
      changeTheme
    }

    let buyProps = {};
    let sellProps = {};
    if (theme === 'dark') {
      if (tradeType === 'buy') {
        sellProps.className = 'radio-btn-dark';
      } else {
        buyProps.className = 'radio-btn-dark'
      }
    }

    return (
      <div className={styles.coinWrap}>
        <ul className={styles.pcHeader}>
          <li className={styles.buy}>
            <h4 className="text-dark">{localization["买入"]}</h4>
            <div>
              {coinList &&
                coinList.map(item => {
                  return (
                    <span
                      key={item.coinId}
                      className={classnames({
                        [styles.coinItem]: true,
                        [styles.coinActive]:
                          tradeType === "buy" &&
                          item.symbol === currentCoin.symbol,
                      })}
                      onClick={() => {
                        changeCoin("buy", item);
                      }}
                    >
                      <div>{item.symbol}</div>
                    </span>
                  );
                })}
            </div>
          </li>
          <li className={classnames({ [styles.sell]: true, 'sell-dark': true })}>
            <h4 className="text-dark">{localization["卖出"]}</h4>
            <div>
              {coinList &&
                coinList.map(item => {
                  return (
                    <span
                      key={item.coinId}
                      className={classnames({
                        [styles.coinItem]: true,
                        [styles.coinActive]:
                          tradeType === "sell" &&
                          item.symbol === currentCoin.symbol,
                      })}
                      onClick={() => {
                        changeCoin("sell", item);
                      }}
                    >
                      <div>{item.symbol}</div>
                    </span>
                  );
                })}
            </div>
          </li>
        </ul>
        <div
          className={classnames({
            [styles.mobileHeader]: true,
            "m-c2c-header": true
          })}
        >
          <div className={styles.mNav}>
            <Radio.Group
              value={tradeType}
              buttonStyle="solid"
              onChange={this.mHandleChangeCoin}
            >
              <Radio.Button {...buyProps} value="buy">{localization["买入"]}</Radio.Button>
              <Radio.Button {...sellProps} value="sell">{localization["卖出"]}</Radio.Button>
            </Radio.Group>
          </div>
          <div className={styles.mCoinList}>
            {coinList &&
              coinList.map(item => {
                return (
                  <span
                    key={item.coinId}
                    className={classnames({
                      [styles.mCoinItem]: true,
                      [styles.mCoinActive]: item.symbol === currentCoin.symbol
                    })}
                    onClick={() => {
                      this.mCoinClick(tradeType, item);
                    }}
                  >
                    {item.symbol}
                  </span>
                );
              })}
          </div>
        </div>

        <div className={styles.publish}>
          <Setting {...settingProps} />
          <div className={styles.btnWrap}>
            <Button onClick={handleTransfer} className='btn-dark'>
              {localization["资产互转"]}
            </Button>
            <Button disabled={publishLoading} onClick={handlePublish} className='btn-dark'>
              {localization["发布广告"]}
            </Button>
          </div>
        </div>
      </div>
    );
  }
}
