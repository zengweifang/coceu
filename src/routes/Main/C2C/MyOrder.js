import React, { PureComponent } from "react";
import { Pagination, Button } from "antd";
import { Link } from "react-router-dom";
import { stampToDate } from "utils";
import classnames from "classnames";
import { isEmpty } from "lodash";
import { Loading, Empty } from "components/Placeholder";

import styles from "./my.less";

export default class MyOrder extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const {
      localization,
      myOrderList,
      myOrderPage,
      myOrderTotal,
      myOrderLoading,
      pageChange
    } = this.props;

    const pageProps = {
      current: myOrderPage,
      pageSize: 10,
      total: myOrderTotal,
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
          <span className={styles.first}>{localization["类型"]}</span>
          <span>{localization["订单号"]}</span>
          <span>{localization["价格"]}</span>
          <span>{localization["数量"]}</span>
          <span>{localization["总额"]}</span>
          <span>{localization["状态"]}</span>
          <span>{localization["下单时间"]}</span>
          <span className={styles.last}>{localization["操作"]}</span>
        </div>
        {myOrderLoading ? (
          <Loading />
        ) : isEmpty(myOrderList) ? (
          <Empty {...{ localization }} />
        ) : (
          <ul className={styles.myList}>
            {myOrderList.map(item => {
              let {
                id,
                remarks,
                subOrderId,
                price,
                volume,
                totalPrice,
                status,
                createDate,
                symbol
              } = item;
              let statusMap = {
                0: localization["已下单"],
                1: localization["已付款"],
                2: localization["已完成"],
                3: localization["确认没收到款"],
                4: localization["申诉"],
                5: localization["仲裁结束"],
                9: localization["已取消"]
              };

              if (!createDate) {
                createDate = new Date().getTime();
              }

              return (
                <li key={item.id} className='item-dark'>
                  <div className={styles.first}>
                    <span className={styles.myTitle}>
                      {localization["类型"]}:{" "}
                    </span>
                    {remarks === "buy" ? (
                      <span className={styles.buyText}>
                        {localization["买入"]} {symbol}
                      </span>
                    ) : (
                      <span className={styles.sellText}>
                        {localization["卖出"]} {symbol}
                      </span>
                    )}
                  </div>
                  <div className={styles.orderLine}>
                    <span className={styles.myTitle}>
                      {localization["订单号"]}:{" "}
                    </span>
                    {subOrderId}
                  </div>
                  <div>
                    <span className={styles.myTitle}>
                      {localization["价格"]}:{" "}
                    </span>{" "}
                    {price}
                  </div>
                  <div>
                    <span className={styles.myTitle}>
                      {localization["数量"]}:{" "}
                    </span>
                    {volume}
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
                  <div className={styles.createDateLine}>
                    <span className={styles.myTitle}>
                      {localization["下单时间"]}:{" "}
                    </span>
                    {stampToDate(Number(createDate), "YYYY-MM-DD hh:mm:ss")}
                  </div>
                  <div className={styles.actionLine}>
                    <span className={styles.myTitle}>
                      {localization["操作"]}:{" "}
                    </span>

                    <Link
                      to={{
                        pathname: "/c2c/order",
                        search: `?orderId=${id}`
                      }}
                    >
                      <Button className='btn-dark'>{localization["订单详情"]}</Button>
                    </Link>
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
          {myOrderTotal > 0 && <Pagination {...pageProps} />}
        </div>
      </div>
    );
  }
}
