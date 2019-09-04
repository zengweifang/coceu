import React, { PureComponent } from "react";
import { Button, Pagination } from "antd";
import { stampToDate } from "utils";
import { isEmpty } from "lodash";
import classnames from "classnames";
import { Loading, Empty } from "components/Placeholder";
import styles from "./my.less";

export default class MyAppeal extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      currentId: ""
    };
  }
  render() {
    const {
      localization,
      myAppealList,
      myAppealPage,
      myAppealTotal,
      myAppealLoading,
      cancelAppealLoading,
      onCancelAppeal,
      pageChange
    } = this.props;

    const pageProps = {
      current: myAppealPage,
      pageSize: 10,
      total: myAppealTotal,
      onChange: page => {
        pageChange(page);
      }
    };

    const { currentId } = this.state;

    return (
      <div className={styles.myWrap}>
        <div
          className={classnames({
            [styles.myHeader]: true,
            "account-c2c-header": true,
            'header-dark': true
          })}
        >
          <span className={styles.first}>{localization["订单号"]}</span>
          <span>{localization["时间"]}</span>
          <span>{localization["申诉类型"]}</span>
          <span>{localization["申诉理由"]}</span>
          <span className={styles.last}>{localization["操作"]}</span>
        </div>
        {myAppealLoading ? (
          <Loading />
        ) : isEmpty(myAppealList) ? (
          <Empty {...{ localization }} />
        ) : (
              <ul className={styles.myList}>
                {myAppealList.map(advert => {
                  const { id, createDate, appealType, reason, status } = advert;

                  let statusMap = {
                    1: localization["已发布"],
                    2: localization["客服已处理完"],
                    3: localization["已撤销"]
                  };
                  let action = "----";
                  if (status === "1") {
                    action = (
                      <Button
                        className='btn-dark'
                        disabled={id === currentId && cancelAppealLoading}
                        onClick={() => {
                          this.setState({ currentId: id });
                          onCancelAppeal(id);
                        }}
                      >
                        {localization["撤销申诉"]}
                      </Button>
                    );
                  } else {
                    action = statusMap[status];
                  }

                  return (
                    <li key={advert.id} className={classnames({ [styles.appealItem]: true, 'item-dark': true })}>
                      <div
                        className={classnames({
                          [styles.orderLine]: true,
                          [styles.first]: true
                        })}
                      >
                        <span className={styles.myTitle}>
                          {localization["订单号"]}:{" "}
                        </span>
                        {id}
                      </div>
                      <div className={styles.timeLine}>
                        <span className={styles.myTitle}>
                          {localization["时间"]}:{" "}
                        </span>
                        {stampToDate(Number(createDate), "YYYY-MM-DD hh:mm:ss")}
                      </div>
                      <div>
                        <span className={styles.myTitle}>
                          {localization["申诉类型"]}:{" "}
                        </span>
                        {appealType}
                      </div>
                      <div className={styles.reasonLine}>
                        <span className={styles.myTitle}>
                          {localization["申诉理由"]}:{" "}
                        </span>
                        {reason}
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
          {myAppealTotal > 0 && <Pagination {...pageProps} />}
        </div>
      </div>
    );
  }
}
