import request from 'utils/request';

export default {
  namespace: 'c2c',

  state: {
    coinList: [],
    tradeType: 'buy',
    currentCoin: '',

    advertList: [],
    advertPage: 1,
    advertTotal: 0,

    myAdvertList: [],
    myAdvertPage: 1,
    myAdvertTotal: 0,

    myAppealList: [],
    myAppealPage: 1,
    myAppealTotal: 0,

    myOrderList: [],
    myOrderPage: 1,
    myOrderTotal: 0
  },

  subscriptions: {
    setup({ dispatch, history }) {}
  },

  effects: {
    *fetchCoins(_, { call, put }) {
      const queryCoins = () =>
        request('/offline/coin/list', {
          method: 'GET'
        });
      try {
        const json = yield call(queryCoins);
        if (json.code === 10000000) {
          //保存币种以及选中币种
          yield put({
            type: 'save',
            payload: {
              coinList: json.data,
              currentCoin: json.data[0]
            }
          });
          //获取广告
          yield put({
            type: 'fetchAdvert',
            payload: {
              tradeType: 'buy',
              currentCoin: json.data[0],
              currentPage: 1
            }
          });
        }
      } catch (error) {}
    },
    *fetchAdvert({ payload }, { call, put }) {
      // 广告
      const { tradeType, currentCoin, currentPage } = payload;
      const showCount = 10;
      const exType = tradeType === 'buy' ? 1 : 0;
      const queryAdvert = () =>
        request('/offline/gadvert/list', {
          body: {
            exType,
            coinId: currentCoin ? currentCoin.coinId : '',
            currentPage,
            showCount
          }
        });

      try {
        const json = yield call(queryAdvert);
        const advertList = json.data.list.map(item => {
          item.key = item.id;
          return item;
        });
        yield put({
          type: 'save',
          payload: {
            advertList,
            advertTotal: json.data.count,
            advertPage: currentPage
          }
        });
      } catch (error) {}
    },
    *checkPublish({ payload, callback }, { call, put }) {
      //检查是否可发广告
      const queryPublish = () =>
        request('/offline/topublish', {
          method: 'GET',
          customMsg: true
        });
      try {
        const json = yield call(queryPublish);
        callback(json);
      } catch (error) {}
    },
    *buyPublish({ payload, callback }, { call }) {
      // 发买入广告
      const submitPublish = () =>
        request('/offline/publish', {
          body: {
            ...payload
          },
          customMsg: true
        });
      try {
        const json = yield call(submitPublish);
        callback(json);
      } catch (error) {}
    },
    *sellPublish({ payload, callback }, { call }) {
      // 发卖出广告
      const submitPublish = () =>
        request('/offline/publish', {
          body: {
            ...payload
          },
          customMsg: true
        });
      try {
        const json = yield call(submitPublish);
        callback(json);
      } catch (error) {}
    },
    *offlineBuy({ payload, callback }, { call }) {
      // 买入
      const submitBuy = () =>
        request('/offline/buy', {
          body: {
            ...payload
          },
          customMsg: true
        });
      try {
        const json = yield call(submitBuy);
        callback(json);
      } catch (error) {}
    },
    *offlineSell({ payload, callback }, { call }) {
      // 卖出
      const submitBuy = () =>
        request('/offline/sell', {
          body: {
            ...payload
          },
          customMsg: true
        });
      try {
        const json = yield call(submitBuy);
        callback(json);
      } catch (error) {}
    },
    *fetchMyAdvert({ payload }, { call, put }) {
      // 我的广告
      const { currentPage, showCount } = payload;
      const queryMyAdvert = () =>
        request('/offline/myAdvert/list', {
          body: {
            currentPage,
            showCount
          }
        });

      try {
        const json = yield call(queryMyAdvert);
        const myAdvertList = json.data.list.map(item => {
          item.key = item.id;
          return item;
        });
        yield put({
          type: 'save',
          payload: {
            myAdvertList,
            myAdvertTotal: json.data.count
          }
        });
      } catch (error) {}
    },
    *fetchMyOrder({ payload }, { call, put }) {
      // 我的订单
      const { currentPage, showCount, status } = payload;
      const queryMyOrder = () =>
        request('/offline/myOrderDetail/list', {
          body: {
            currentPage,
            showCount,
            status
          }
        });
      try {
        const json = yield call(queryMyOrder);
        const myOrderList = json.data.list.map(item => {
          item.key = item.id;
          return item;
        });
        yield put({
          type: 'save',
          payload: {
            myOrderList,
            myOrderTotal: json.data.count
          }
        });
      } catch (error) {}
    },
    *cancelAdvert({ payload, callback }, { call }) {
      // 撤销广告
      const { orderId } = payload;
      const cancelSubmit = () =>
        request(`/offline/gadvert/cancel`, {
          body: {
            orderId
          }
        });
      try {
        const json = yield call(cancelSubmit);
        callback(json);
      } catch (error) {}
    },
    *cancelAppeal({ payload, callback }, { call }) {
      // 撤销申诉
      const { appealId } = payload;
      const cancelSubmit = () =>
        request(`/offline/appeal/cancel`, {
          body: {
            appealId
          }
        });
      try {
        const json = yield call(cancelSubmit);
        callback(json);
      } catch (error) {}
    },
    *fetchMyAppeal({ payload }, { call, put }) {
      // 我的申诉
      const queryMyAppeal = () =>
        request('/offline/appeal/findall', {
          method: 'GET',
          body: {
            ...payload
          }
        });
      try {
        const json = yield call(queryMyAppeal);
        let myAppealList = [];
        if (json.data.list) {
          myAppealList = json.data.list.map(item => {
            item.key = item.id;
            return item;
          });
        }
        yield put({
          type: 'save',
          payload: {
            myAppealList,
            myAppealTotal: json.data.count
          }
        });
      } catch (error) {}
    },
    *confirmPay({ payload, callback }, { call }) {
      // 我已付款给商家
      const { orderId, subOrderId } = payload;
      const pay = () =>
        request(`/offline/buy/confirm`, {
          body: {
            orderId,
            subOrderId
          }
        });
      try {
        const json = yield call(pay);
        callback(json);
      } catch (error) {}
    },
    *confirmReceipt({ payload, callback }, { call }) {
      // 确认收款
      const { orderId, subOrderId } = payload;
      const receipt = () =>
        request(`/offline/sell/confirm`, {
          body: {
            orderId,
            subOrderId
          }
        });
      try {
        const json = yield call(receipt);
        callback(json);
      } catch (error) {}
    },
    *cancelOrder({ payload, callback }, { call }) {
      // 确认收款
      const { orderId, subOrderId } = payload;
      const cancel = () =>
        request(`/offline/detail/cancel`, {
          body: {
            orderId,
            subOrderId
          }
        });
      try {
        const json = yield call(cancel);
        callback(json);
      } catch (error) {}
    }
  },

  reducers: {
    save(state, { payload }) {
      return { ...state, ...payload };
    },
    clear(state) {
      return {
        ...state,
        // coinList: [],
        tradeType: 'buy',
        currentCoin: '',

        // advertList: [],
        // advertPage: 1,
        // advertTotal: 0,

        myAdvertList: [],
        myAdvertPage: 1,
        myAdvertTotal: 0,

        myAppealList: [],

        myOrderList: [],
        myOrderPage: 1,
        myOrderTotal: 0
      };
    }
  }
};
