import React, { PureComponent } from "react";
import { Pagination, Button } from "antd";
import classnames from "classnames";
import { stampToDate } from "utils";
import { isEmpty } from "lodash";
import { Loading, Empty } from "components/Placeholder";
import styles from "./my.less";

export default class MyAdvert extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      currentId: ""
    };
  }
  render() {
    const {
      localization,
      myAdvertList,
      myAdvertPage,
      myAdvertTotal,
      pageChange,
      myAdvertLoading,
      onCancelAdvert,
      cancelAdvertLoading
    } = this.props;

    const { currentId } = this.state;

    const pageProps = {
      current: myAdvertPage,
      pageSize: 10,
      total: myAdvertTotal,
      onChange: page => {
        pageChange(page);
      }
    };
    return (
      <div className={styles.myWrap}>
        <div
          className={classnames({
            [styles.myHeader]: true,
            "account-c2c-header": true,
            'header-dark': true
          })}
        >
          <span className={styles.first}>{localization["创建时间"]}</span>
          <span>{localization["类型"]}</span>
          <span>{localization["价格"]}</span>
          <span>{localization["币种"]}</span>
          <span>{localization["挂单数量"]}</span>
          <span>{localization["成交数量"]}</span>
          <span>{localization["锁定数量"]}</span>
          <span>{localization["最小成交数量"]}</span>
          <span>{localization["总额"]}</span>
          <span>{localization["状态"]}</span>
          <span className={styles.last}>{localization["操作"]}</span>
        </div>
        {myAdvertLoading ? (
          <Loading />
        ) : isEmpty(myAdvertList) ? (
          <Empty {...{ localization }} />
        ) : (
          <ul className={styles.myList}>
            {myAdvertList.map(advert => {
              const {
                id,
                createDate,
                exType,
                price,
                symbol,
                volume,
                successVolume,
                lockVolume,
                totalPrice,
                status,
                minExVolume
              } = advert;

              let statusMap = {
                0: localization["已发布"],
                1: localization["已完成"],
                2: localization["部分成交"],
                3: localization["部分取消"],
                9: localization["取消"]
              };
              let action = "----";
              if (status === 0 || status === 2) {
                action = (
                  <Button
                    className='btn-dark'
                    disabled={id === currentId && cancelAdvertLoading}
                    onClick={() => {
                      this.setState({ currentId: id });
                      onCancelAdvert(id);
                    }}
                  >
                    {localization["撤销"]}
                  </Button>
                );
              }

              let exTypeText =
                exType === 0 ? (
                  <span className={styles.buyText}>{localization["买入"]}</span>
                ) : (
                  <span className={styles.sellText}>
                    {localization["卖出"]}
                  </span>
                );
              return (
                <li key={advert.id} className='item-dark'>
                  <div
                    className={classnames({
                      [styles.createDateLine]: true,
                      [styles.first]: true
                    })}
                  >
                    <span className={styles.myTitle}>
                      {localization["创建时间"]}:{" "}
                    </span>
                    {stampToDate(Number(createDate), "YYYY-MM-DD hh:mm:ss")}
                  </div>
                  <div>
                    <span className={styles.myTitle}>
                      {localization["类型"]}:{" "}
                    </span>
                    {exTypeText}
                  </div>
                  <div>
                    <span className={styles.myTitle}>
                      {localization["价格"]}:{" "}
                    </span>
                    {price}
                  </div>
                  <div>
                    <span className={styles.myTitle}>
                      {localization["币种"]}:{" "}
                    </span>
                    {symbol}
                  </div>
                  <div>
                    <span className={styles.myTitle}>
                      {localization["挂单数量"]}:{" "}
                    </span>
                    {volume}
                  </div>
                  <div>
                    <span className={styles.myTitle}>
                      {localization["成交数量"]}:{" "}
                    </span>
                    {successVolume}
                  </div>
                  <div>
                    <span className={styles.myTitle}>
                      {localization["锁定数量"]}:{" "}
                    </span>
                    {lockVolume}
                  </div>
                  <div>
                    <span className={styles.myTitle}>
                      {localization["最小成交数量"]}:{" "}
                    </span>
                    {minExVolume}
                  </div>
                  <div className={styles.totalPriceLine}>
                    <span className={styles.myTitle}>
                      {localization["总额"]}:{" "}
                    </span>
                    {totalPrice}
                  </div>
                  <div>
                    <span className={styles.myTitle}>
                      {localization["状态"]}:{" "}
                    </span>
                    {statusMap[status]}
                  </div>
                  <div className={styles.actionLine}>
                    <span className={styles.myTitle}>
                      {localization["操作"]}:{" "}
                    </span>
                    {action}
                  </div>
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
          {myAdvertTotal > 0 && <Pagination {...pageProps} />}
        </div>
      </div>
    );
  }
}
