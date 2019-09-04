import React, { PureComponent } from "react";
import { Pagination, Button } from "antd";
import classnames from "classnames";
import { isEmpty } from "lodash";
import { Loading, Empty } from "components/Placeholder";
import styles from "./index.less";

export default class Advert extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {};
  }

  handleTradeClick = (tradeType, item) => {
    const { tradeClick } = this.props;
    tradeClick && tradeClick(tradeType, item);
  };

  render() {
    const {
      advertLoading,
      advertList,
      currentCoin,
      tradeType,
      advertPage,
      advertTotal,
      advertPageChange,
      localization
    } = this.props;

    const pageProps = {
      current: advertPage,
      pageSize: 10,
      total: advertTotal,
      onChange: page => {
        advertPageChange(page);
      }
    };
    return (
      <div className={styles.advertWrap}>
        <div className={classnames({ [styles.advertHeader]: true, 'header-dark': true })}>
          <span className={styles.realName}>{localization["商家名称"]}</span>
          <span className={styles.volume}>{localization["挂单数量"]}</span>
          <span>{localization["限额"]}</span>
          <span>{localization["价格"]}</span>
          <span>{localization["金额"]}</span>
          <span>{localization["支付方式"]}</span>
          <span className={styles.operate}>{localization["操作"]}</span>
        </div>
        {/* <div className={styles.adDivide} /> */}

        {advertLoading ? (
          <Loading />
        ) : isEmpty(advertList) ? (
          <Empty {...{ localization }} />
        ) : (
              <ul className={styles.advertList}>
                {advertList.map((item, index) => {
                  let {
                    id,
                    realName,
                    volume,
                    successVolume,
                    lockVolume,
                    price,
                    totalPrice,
                    wechatNo,
                    alipayNo,
                    cardNo,
                    minExVolume
                  } = item;
                  const { pointVolume } = currentCoin;

                  if (!minExVolume) {
                    minExVolume = 0;
                  }

                  const limitVolume = (volume - lockVolume - successVolume).toFixed(
                    pointVolume
                  );

                  const myStyleIndex = id ? id.charAt(id.length - 1) : 0;
                  return (
                    <li key={id} className='item-dark'>
                      <span className={styles.realName}>
                        <div
                          className={classnames({
                            [styles[`real${myStyleIndex}`]]: true
                          })}
                        >
                          {realName && realName.charAt(0)}
                        </div>
                      </span>
                      <span>
                        <h4 className={classnames({[styles.mTitle]: true, 'c2c-my-title-dark': true})}>
                          {localization["挂单数量"]}:{" "}
                        </h4>
                        {volume}
                      </span>
                      <span>
                        <h4 className={classnames({[styles.mTitle]: true, 'c2c-my-title-dark': true})}>{localization["限额"]}: </h4>
                        {Number(minExVolume).toFixed(pointVolume)}~{limitVolume}
                      </span>
                      <span className={styles.priceLine}>
                        <h4 className={classnames({[styles.mTitle]: true, 'c2c-my-title-dark': true})}>{localization["价格"]}: </h4>
                        <span>{price}</span>
                      </span>
                      <span className={styles.totalPrice}>
                        <h4 className={classnames({[styles.mTitle]: true, 'c2c-my-title-dark': true})}>{localization["金额"]}: </h4>
                        {totalPrice}
                      </span>
                      <span className={styles.payStyle}>
                        <i
                          className={classnames({
                            "iconfont icon-yinhangqia": !!cardNo,
                            [styles.iconCard]: true
                          })}
                        />
                        <i
                          className={classnames({
                            "iconfont icon-zhifubao": !!alipayNo,
                            [styles.iconZhi]: true
                          })}
                        />
                        <i
                          className={classnames({
                            "iconfont icon-weixinzhifu": !!wechatNo,
                            [styles.iconWei]: true
                          })}
                        />
                      </span>
                      <span className={styles.operate}>
                        <Button
                          onClick={() => {
                            this.handleTradeClick(tradeType, item);
                          }}
                          className='btn-dark'
                        >
                          {tradeType === "buy"
                            ? `${localization["买入"]}${currentCoin.symbol}`
                            : `${localization["卖出"]}${currentCoin.symbol}`}
                        </Button>
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
        <div
          className={classnames({
            [styles.pageWrap]: true,
            "c2c-page-wrap": true
          })}
        >
          {advertTotal > 0 && <Pagination {...pageProps} />}
        </div>
      </div>
    );
  }
}
