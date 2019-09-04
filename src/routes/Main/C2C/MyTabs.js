import React, { PureComponent } from "react";
import { connect } from "dva";
import classnames from "classnames";
import { isArray } from "lodash";
import ReconnectingWebSocket from "utils/ReconnectingWebSocket";
import { WS_PREFIX } from "utils/constants.js";
import { Tabs, message, Select } from "antd";
import { getLocalStorage } from "utils";

import MyAdvert from "./MyAdvert";
import MyOrder from "./MyOrder";
import MyAppeal from "./MyAppeal";

import styles from "./my.less";

const TabPane = Tabs.TabPane;
const Option = Select.Option;

@connect(({ c2c, loading }) => ({
  ...c2c,
  myAdvertLoading: loading.effects["c2c/fetchMyAdvert"],
  cancelAdvertLoading: loading.effects["c2c/cancelAdvert"],
  myAppealLoading: loading.effects["c2c/fetchMyAppeal"],
  cancelAppealLoading: loading.effects["c2c/cancelAppeal"],
  myOrderLoading: loading.effects["c2c/fetchMyOrder"]
}))
class MyTabs extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      currentTab: "order",
      currentOrderStatus: "0" // "0" 进行中 "2" 已完成 "9" 已取消
    };
  }

  componentDidMount() {
    const account = getLocalStorage("account");
    if (account) {
      const { currentOrderStatus } = this.state;
      this.getMyOrder({ page: 1, status: currentOrderStatus });

      const { id } = account;
      this.connectMyOrderSocket(id);
    }
  }

  // 订单 socket
  connectMyOrderSocket = userId => {
    const { currentOrderStatus } = this.state;
    this.myOrderSocket = new ReconnectingWebSocket(
      `${WS_PREFIX}/c2cUser?${userId}`
    );
    this.myOrderSocket.onopen = () => {
      if (this.myOrderSocket.readyState === 1) {
        this.myOrderSocket.send("ping");
      }
    };
    this.myOrderIntervsal = setInterval(() => {
      if (this.myOrderSocket.readyState === 1) {
        this.myOrderSocket.send("ping");
      }
    }, 1000 * 10);

    this.myOrderSocket.onmessage = evt => {
      if (evt.data === "pong") {
        return;
      }
      // 如果  进行中
      if (currentOrderStatus === "0") {
        const record = JSON.parse(evt.data);
        let { myOrderList, myOrderTotal, dispatch } = this.props;
        if (isArray(myOrderList)) {
          const has = myOrderList.some(item => {
            return item.subOrderId === record.subOrderId;
          });
          if (!has) {
            myOrderList.unshift(record);

            dispatch({
              type: "c2c/save",
              payload: {
                myOrderList,
                myOrderTotal: myOrderTotal * 1 + 1
              }
            });
          }
        }
      }
    };
  };

  componentWillUnmount() {
    const { dispatch } = this.props;
    dispatch({
      type: "c2c/clear"
    });
    clearInterval(this.myOrderIntervsal);
    this.myOrderSocket && this.myOrderSocket.close();
  }
  // 我的订单 onChange
  myOrderPageChange = page => {
    const { currentOrderStatus } = this.state;
    this.getMyOrder({ page, status: currentOrderStatus });
  };

  // 我的订单
  getMyOrder = ({ page, status }) => {
    const { dispatch } = this.props;
    dispatch({
      type: "c2c/save",
      payload: {
        myOrderPage: page
      }
    });
    dispatch({
      type: "c2c/fetchMyOrder",
      payload: {
        currentPage: page,
        showCount: 10,
        status
      }
    });
  };

  // 我的广告 onChange
  myAdvertPageChange = page => {
    const { dispatch } = this.props;
    dispatch({
      type: "c2c/save",
      payload: {
        myAdvertPage: page
      }
    });
    dispatch({
      type: "c2c/fetchMyAdvert",
      payload: {
        currentPage: page,
        showCount: 10
      }
    });
  };

  //我的申诉
  myAppealPageChange = page => {
    const { dispatch } = this.props;
    dispatch({
      type: "c2c/save",
      payload: {
        myAppealPage: page
      }
    });
    dispatch({
      type: "c2c/fetchMyAppeal",
      payload: {
        currentPage: page,
        showCount: 10
      }
    });
  };

  //撤销广告
  onCancelAdvert = id => {
    const { dispatch, myAdvertPage } = this.props;
    dispatch({
      type: "c2c/cancelAdvert",
      payload: {
        orderId: id
      },
      callback: json => {
        if (json.code === 10000000) {
          // 刷新我的广告列表
          message.success("取消成功");
          this.myAdvertPageChange(myAdvertPage);
        }
      }
    });
  };
  // 撤销申诉
  onCancelAppeal = id => {
    const { dispatch, myAppealPage } = this.props;
    dispatch({
      type: "c2c/cancelAppeal",
      payload: {
        appealId: id
      },
      callback: json => {
        if (json.code === 10000000) {
          // 刷新申诉列表
          message.success("取消成功");
          this.myAppealPageChange(myAppealPage);
        }
      }
    });
  };

  // tab change
  tabChange = activeKey => {
    const { localization } = this.props;
    const account = getLocalStorage("account");
    if (account) {
      // 登录之后
      this.setState({ currentTab: activeKey });

      if (activeKey === "order") {
        const { currentOrderStatus } = this.state;
        this.getMyOrder({ page: 1, status: currentOrderStatus });
      } else if (activeKey === "myAdvert") {
        this.myAdvertPageChange(1);
      } else if (activeKey === "appeal") {
        this.myAppealPageChange(1);
      }
    } else {
      message.error(localization["请先登录"]);
    }
  };

  // search Onchang
  searchOrderChange = key => {
    this.setState({ currentOrderStatus: key });

    this.getMyOrder({ page: 1, status: key });
  };

  render() {
    const { currentTab, currentOrderStatus } = this.state;
    const {
      theme,
      isLogin,
      localization,
      myAdvertList,
      myAdvertPage,
      myAdvertTotal,
      myAdvertLoading,
      cancelAdvertLoading,
      myAppealList,
      myAppealPage,
      myAppealTotal,
      myAppealLoading,
      cancelAppealLoading,
      myOrderList,
      myOrderPage,
      myOrderTotal,
      myOrderLoading
    } = this.props;

    const myAdvertProps = {
      localization,
      myAdvertList,
      myAdvertPage,
      myAdvertTotal,
      myAdvertLoading,
      cancelAdvertLoading,
      pageChange: this.myAdvertPageChange,
      onCancelAdvert: this.onCancelAdvert
    };

    const myAppealProps = {
      localization,
      myAppealList,
      myAppealPage,
      myAppealTotal,
      myAppealLoading,
      cancelAppealLoading,
      pageChange: this.myAppealPageChange,
      onCancelAppeal: this.onCancelAppeal
    };

    const myOrderProps = {
      localization,
      myOrderList,
      myOrderPage,
      myOrderTotal,
      myOrderLoading,
      pageChange: this.myOrderPageChange
    };

    let selectProps = {};
    if (theme === 'dark') {
      selectProps.dropdownClassName = 'c2c-my-select-dark';
    }

    return (
      <div
        className={classnames({
          [styles.myTabsWrap]: true,
          "c2c-tabs-wrap": true
        })}
      >
        {isLogin && currentTab === "order" && (
          <div className={styles.orderSearch}>
            <Select
              value={currentOrderStatus}
              onChange={this.searchOrderChange}
              {...selectProps}
            >
              <Option value="0">{localization["进行中"]}</Option>
              <Option value="2">{localization["已完成"]}</Option>
              <Option value="9">{localization["已取消"]}</Option>
            </Select>
          </div>
        )}
        <Tabs activeKey={currentTab} onChange={this.tabChange}>
          <TabPane tab={localization["我的订单"]} key="order">
            <MyOrder {...myOrderProps} />
          </TabPane>
          <TabPane tab={localization["我的广告"]} key="myAdvert">
            <MyAdvert {...myAdvertProps} />
          </TabPane>
          <TabPane tab={localization["我的申诉"]} key="appeal">
            <MyAppeal {...myAppealProps} />
          </TabPane>
        </Tabs>
      </div>
    );
  }
}
export default MyTabs;
