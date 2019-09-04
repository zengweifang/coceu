import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Table, Button, Popconfirm, message } from 'antd';
import Scrollbars from 'react-custom-scrollbars';
import { stampToDate } from 'utils';
import request from 'utils/request';
import { ToLogin, Loading, Empty } from 'components/Placeholder';
import { WS_PREFIX } from 'utils/constants';
import ReconnectingWebSocket from 'utils/ReconnectingWebSocket';

@connect(({ loading }) => ({
  loading: loading.effects['exchange/fetchOrders']
}))
class Orders extends PureComponent {
  state = {
    showCount: 5
  };

  componentDidMount() {
    const { isLogin, tradePair } = this.props;
    if (isLogin) {
      this.connectWebsocket();
      if (tradePair) {
        this.fetchOrder(1);
      }
    }
  }

  componentDidUpdate(prevProps) {
    const { isLogin, ordersType, tradePair, dispatch } = this.props;
    if (isLogin) {
      if (prevProps.ordersType !== ordersType) {
        this.fetchOrder();
      }
      if (prevProps.tradePair !== tradePair) {
        dispatch({
          type: 'exchange/save',
          payload: {
            pendingOrder: {
              list: [],
              total: 0,
              page: 1
            },
            completedOrder: {
              list: [],
              total: 0,
              page: 1
            }
          }
        });
        this.fetchOrder(1);
      }
    }
  }

  componentWillUnmount() {
    this.WebSocket && this.WebSocket.close();
    this.Timer && clearInterval(this.Timer);
  }

  // 获取订单列表
  fetchOrder = currentPage => {
    const { account, ordersType, tradePair } = this.props;
    const { showCount } = this.state;
    const [coinOther, coinMain] = tradePair.split('/');
    const userId = account.id;
    // status = 0 是我的挂单， status = 1 是成交历史
    const status = ordersType === 'pending' ? 0 : 1;
    if (!currentPage) currentPage = this.props[`${ordersType}Order`].page;
    this.props.dispatch({
      type: 'exchange/fetchOrders',
      payload: {
        status,
        userId,
        coinMain,
        coinOther,
        currentPage,
        showCount
      }
    });
  };

  // 撤单
  handleCancelTrade = orderNo => {
    const { localization } = this.props;
    request(`/trade/cancelTrade/${orderNo}`, {
      method: 'GET'
    }).then(json => {
      if (json.code === 10000000) {
        this.fetchOrder();
        message.success(localization['撤单成功']);
      }
    });
  };

  handleCancelAll = () => {
    const { localization, account, tradePair } = this.props;
    const userId = account.id;
    const [coinOther, coinMain] = tradePair.split('/');

    request(`/trade/batchCancelTrade`, {
      body: {
        userId,
        coinMain,
        coinOther
      }
    }).then(json => {
      if (json.code === 10000000) {
        this.fetchOrder();
        message.success(localization['批量撤单成功']);
      }
    });
  };

  // 用户挂单websocket
  connectWebsocket = () => {
    const { account, dispatch } = this.props;
    this.WebSocket = new ReconnectingWebSocket(`${WS_PREFIX}/userOrder?${account.id}`);

    this.Timer = setInterval(() => {
      if (this.WebSocket && this.WebSocket.readyState === 1) {
        this.WebSocket.send('ping');
      }
    }, 1000 * 30);

    this.WebSocket.onmessage = evt => {
      if (evt.data !== 'pong') {
        const { orderVo } = JSON.parse(evt.data);

        // 当推的数据是挂单，更新用户挂单列表
        let { list, total, page } = this.props.pendingOrder;
        if (orderVo && page === 1) {
          let isNewRecord = orderVo.status === 0; // 如果status等于0就是新记录
          total = total - list.length;
          list = list.filter(order => {
            if (order.orderNo === orderVo.orderNo) {
              isNewRecord = false; //如果有相同的orderNo就不是新的记录
              order.status = orderVo.status;
              if (order.status === 1) {
                order.successVolume = (Number(order.successVolume) + orderVo.successVolume).toFixed(
                  8
                );
              } else {
                order.price = orderVo.price;
                order.volume = orderVo.volume;
                order.successVolume = orderVo.successVolume;
              }
            }
            return order.status !== 2;
          });

          total = total + list.length;

          if (isNewRecord) {
            orderVo.key = orderVo.orderNo;
            orderVo.price = orderVo.price && orderVo.price.toFixed(8);
            orderVo.volume = orderVo.volume && orderVo.volume.toFixed(8);
            orderVo.successVolume = orderVo.successVolume && orderVo.successVolume.toFixed(8);
            list.unshift(orderVo);
            list = list.slice(0, this.state.showCount);
            total += 1;
          }

          dispatch({
            type: 'exchange/save',
            payload: {
              pendingOrder: { list, total, page }
            }
          });
        }
      }
    };
  };

  render() {
    const { isLogin, localization, currentTrade, ordersType, loading } = this.props;
    const { showCount } = this.state;
    const { pricePrecision, volumePrecision } = currentTrade;
    const columns = [
      {
        title: localization['委托时间'],
        dataIndex: 'time',
        key: 'time',
        fixed: 'left',
        width: 100,
        render: (text, record) => stampToDate(Number(text))
      },
      {
        title: localization['方向'],
        dataIndex: 'exType',
        key: 'exType',
        render: (text, record) => {
          if (text === 0) {
            return <span className="font-color-green">{localization['买入']}</span>;
          } else {
            return <span className="font-color-red">{localization['卖出']}</span>;
          }
        }
      },
      {
        title: localization['委托价格'],
        dataIndex: 'price',
        key: 'price',
        render: (text, record) => Number(text).toFixed(pricePrecision)
      },
      {
        title: localization['委托数量'],
        dataIndex: 'volume',
        key: 'volume',
        render: (text, record) => Number(text).toFixed(volumePrecision)
      },
      {
        title: localization['委托金额'],
        dataIndex: 'amount',
        key: 'amount',
        render: (text, record) => (record.price * record.volume).toFixed(pricePrecision)
      },
      {
        title: localization['成交量'],
        dataIndex: 'successVolume',
        key: 'successVolume',
        render: (text, record) =>
          `${Number(text).toFixed(volumePrecision)}${
            record.status === 1 ? `(${localization['部分成交']})` : ''
          }`
      },
      {
        title: `${localization['状态']}/${localization['操作']}`,
        dataIndex: 'status',
        key: 'status',
        render: (text, record) => {
          if (record.status === 2 || record.status === 3) {
            return (
              <Button
                size="small"
                type="primary"
                onClick={() => {
                  this.props.history.push(`/account/exchange?orderNo=${record.orderNo}`);
                }}
              >
                {localization['详情']}
              </Button>
            );
          } else if (record.status === 0 || record.status === 1) {
            return (
              <Button
                size="small"
                type="primary"
                onClick={this.handleCancelTrade.bind(this, record.orderNo)}
              >
                {localization['撤单']}
              </Button>
            );
          } else {
            return '--';
          }
        }
      }
    ];

    const orderData = this.props[`${ordersType}Order`];
    let tableProps = {
      columns,
      size: 'small',
      dataSource: orderData.list,
      scroll: { x: 800, y: 0 },
      loading: {
        spinning: isLogin && loading,
        indicator: <Loading />
      },
      locale: {
        emptyText: isLogin ? <Empty {...{ localization }} /> : <ToLogin {...{ localization }} />
      },
      pagination: {
        defaultCurrent: 1,
        total: orderData.total,
        current: orderData.page,
        pageSize: showCount,
        onChange: this.fetchOrder
      }
    };

    return (
      <Scrollbars>
        <Table {...tableProps} />
        {ordersType === 'pending' && orderData.list.length > 0 && (
          <div style={{ marginTop: '-40px', marginLeft: '10px' }}>
            <Popconfirm
              okType="danger"
              placement="topLeft"
              okText={localization['确定']}
              onConfirm={this.handleCancelAll}
              cancelText={localization['取消']}
              title={`${localization['您将撤销当前交易对下的所有委托订单']}？`}
            >
              <Button type="danger">{localization['撤销全部']}</Button>
            </Popconfirm>
          </div>
        )}
      </Scrollbars>
    );
  }
}

export default Orders;
