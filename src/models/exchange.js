import request from 'utils/request';
import { cloneDeep } from 'lodash';
import { getLocalStorage, setLocalStorage, getSessionStorage, setSessionStorage } from 'utils';

// 默认layouts 配置
const defaultLayouts = {
  lg: [
    { i: 'chart', x: 0, y: 0, w: 19, h: 15, minW: 12, maxW: 24, maxH: 24 },
    { i: 'book', x: 19, y: 0, w: 5, h: 15, minW: 5, maxW: 24, maxH: 24 },
    { i: 'orders', x: 0, y: 15, w: 13, h: 9, minW: 10, maxW: 24, maxH: 24 },
    { i: 'transaction', x: 13, y: 15, w: 6, h: 9, minW: 5, maxW: 24, maxH: 24 },
    { i: 'trades', x: 19, y: 15, w: 5, h: 9, minW: 5, maxW: 24, maxH: 24 }
  ],
  md: [
    { i: 'chart', x: 0, y: 0, w: 18, h: 15, minW: 12, maxW: 24, maxH: 24 },
    { i: 'book', x: 18, y: 0, w: 6, h: 15, minW: 5, maxW: 24, maxH: 24 },
    { i: 'orders', x: 0, y: 15, w: 11, h: 9, minW: 10, maxW: 24, maxH: 24 },
    { i: 'transaction', x: 11, y: 15, w: 7, h: 9, minW: 5, maxW: 24, maxH: 24 },
    { i: 'trades', x: 18, y: 15, w: 6, h: 9, minW: 5, maxW: 24, maxH: 24 }
  ],
  sm: [
    { i: 'chart', x: 0, y: 0, w: 17, h: 15, minW: 12, maxW: 24, maxH: 24 },
    { i: 'book', x: 17, y: 0, w: 7, h: 15, minW: 5, maxW: 24, maxH: 24 },
    { i: 'orders', x: 0, y: 15, w: 10, h: 9, minW: 10, maxW: 24, maxH: 24 },
    { i: 'transaction', x: 10, y: 15, w: 7, h: 9, minW: 5, maxW: 24, maxH: 24 },
    { i: 'trades', x: 17, y: 15, w: 7, h: 9, minW: 5, maxW: 24, maxH: 24 }
  ],
  xs: [
    { i: 'chart', x: 0, y: 0, w: 24, h: 15 },
    { i: 'transaction', x: 0, y: 10, w: 24, h: 10 },
    { i: 'book', x: 0, y: 19, w: 24, h: 15 },
    { i: 'orders', x: 0, y: 34, w: 24, h: 9 },
    { i: 'trades', x: 0, y: 43, w: 24, h: 9 }
  ]
};

const layouts = getLocalStorage('layouts') || cloneDeep(defaultLayouts);

export default {
  namespace: 'exchange',

  state: {
    layouts, // widget布局信息
    isDraggable: true, // 是否可拖拽
    isResizable: true, // 是否可以调整尺寸
    localLayouts: layouts, // 本地保存的layouts配置
    bookData: {
      sellOrderVOList: [],
      buyOrderVOList: []
    }, // 买卖盘数据
    pendingOrder: {
      list: [],
      total: 0,
      page: 1
    }, // 挂单列表
    completedOrder: {
      list: [],
      total: 0,
      page: 1
    }, // 历史列表
    tradeList: [], // 最新成交列表
    mainVolume: 0, // 主币资产
    coinVolume: 0, // 辅币资产
    transactionAble: true, // 是否可交易
    coinInformation: {} //币种资料
  },

  subscriptions: {
    // 初始化
    setup({ dispatch, history }) {}
  },

  effects: {
    // 获取最新成交
    *fetchTradeList({ payload }, { call, put }) {
      const queryTradeList = () =>
        request('/index/findMatchStream', {
          method: 'GET',
          body: payload
        });

      try {
        const response = yield call(queryTradeList);

        yield put({
          type: 'save',
          payload: {
            tradeList: response.data
              ? response.data.map(item => ({ ...item, key: Math.random() * 10 ** 18 }))
              : []
          }
        });
      } catch (error) {}
    },

    // 根据币种名称获取资产
    *fetchVolume({ payload }, { call, put }) {
      const { volumeType, symbol } = payload;

      const queryVolume = () =>
        request(`/coin/volume/symbol/${symbol}`, {
          method: 'GET'
        });

      try {
        const response = yield call(queryVolume);
        yield put({
          type: 'save',
          payload: {
            [volumeType]: response.data && response.data.volume
          }
        });
      } catch (error) {}
    },

    *transaction({ payload, callback }, { call, put }) {
      // 上锁交易按钮
      yield put({
        type: 'save',
        payload: { transactionAble: false }
      });

      const fetchOrderNo = () => request('/trade/getOrderNo');

      try {
        const response = yield call(fetchOrderNo);
        let errorMsg = '';

        if (response.code === 10000000) {
          const { orderNo } = response.data;
          const { userId, volume, price, coinMain, coinOther, transactionType } = payload;
          const mapTypeToAction = { buy: 'buyIn', sell: 'sellOut' };

          const transaction = () =>
            request(`/trade/${mapTypeToAction[transactionType]}`, {
              body: { orderNo, userId, volume, price, coinMain, coinOther },
              customMsg: true
            });

          const res = yield call(transaction);

          if (res.code === 10000000) {
            // 挂单成功提示
            yield put({
              type: 'global/save',
              payload: { successMsg: '挂单成功' }
            });
            callback();
          } else if (response.code !== -9) {
            errorMsg = res.msg;
          }
        } else if (response.code !== -9) {
          errorMsg = response.msg;
        }

        // 解锁交易按钮
        yield put({
          type: 'save',
          payload: { transactionAble: true }
        });
        if (errorMsg) {
          yield put({
            type: 'global/save',
            payload: { errorMsg }
          });
          callback();
        }
      } catch (error) {}
    },

    // 获取订单列表
    *fetchOrders({ payload }, { call, put }) {
      const { status, currentPage } = payload;
      const queryOrders = () =>
        request('/order/findOrderProposeList', {
          body: payload
        });

      try {
        const json = yield call(queryOrders);
        if (json.code === 10000000) {
          if (currentPage > 1 && (!json.data.list || json.data.list.length === 0)) {
            return yield put({
              type: 'fetchOrders',
              payload: {
                ...payload,
                currentPage: 1
              }
            });
          }
          const ordersType = status === 0 ? 'pending' : 'completed';
          if (json.data.list?.length > 0) {
            const orderList = json.data.list.map(order => {
              order.key = order.orderNo;
              order.price = order.price.toFixed(8);
              order.volume = order.volume.toFixed(8);
              order.successVolume = order.successVolume.toFixed(8);
              return order;
            });

            yield put({
              type: 'save',
              payload: {
                [`${ordersType}Order`]: {
                  list: orderList,
                  total: json.data.count,
                  page: currentPage
                }
              }
            });
          } else {
            yield put({
              type: 'save',
              payload: {
                [`${ordersType}Order`]: {
                  list: [],
                  total: 0,
                  page: currentPage
                }
              }
            });
          }
        }
      } catch (error) {}
    },

    // 获取币种详情
    *fetchCoinInformation({ payload }, { call, put }) {
      const { coinName } = payload;
      const coinInformationMap = getSessionStorage('coinInformationMap') || {};

      if (coinInformationMap[coinName]) {
        yield put({
          type: 'save',
          payload: { coinInformation: coinInformationMap[coinName] }
        });
      } else {
        const queryCoinInformation = () =>
          request(`/coin/detail/${coinName}`, {
            method: 'GET'
          });
        try {
          const json = yield call(queryCoinInformation);

          yield put({
            type: 'save',
            payload: { coinInformation: json.data }
          });
          coinInformationMap[coinName] = json.data;
          setSessionStorage('coinInformationMap', coinInformationMap);
        } catch (error) {}
      }
    }
  },

  reducers: {
    // 保存数据
    save(state, { payload }) {
      return { ...state, ...payload };
    },

    clear(state) {
      return {
        ...state,
        pendingOrder: {
          list: [],
          total: 0,
          page: 1
        }, // 挂单列表
        completedOrder: {
          list: [],
          total: 0,
          page: 1
        }, // 历史列表
        mainVolume: 0, // 主币资产
        coinVolume: 0, // 辅币资产
        transactionAble: true // 是否可交易
      };
    },

    // 关闭widget
    closeWidget(state, { payload }) {
      const { layouts } = state;
      const newLayouts = {};
      Object.keys(layouts).forEach(key => {
        newLayouts[key] = layouts[key].filter(item => {
          return item.i !== payload;
        });
      });
      setLocalStorage('layouts', newLayouts);
      return {
        ...state,
        layouts: cloneDeep(newLayouts),
        localLayouts: cloneDeep(newLayouts)
      };
    },

    // 最大化widget
    fullScreenWidget(state, { payload }) {
      const { layouts } = state;
      const newLayouts = {};
      Object.keys(layouts).forEach(key => {
        newLayouts[key] = layouts[key].filter(item => {
          if (item.i === payload) {
            item.w = 24;
            item.h = 24;
          }
          return item.i === payload;
        });
      });
      return {
        ...state,
        isDraggable: false,
        isResizable: false,
        layouts: newLayouts
      };
    },

    // 复原layouts
    restoreLayouts(state) {
      return {
        ...state,
        isDraggable: true,
        isResizable: true,
        layouts: cloneDeep(state.localLayouts)
      };
    },

    // 设置layouts
    setLayouts(state, { payload }) {
      setLocalStorage('layouts', payload);
      return {
        ...state,
        localLayouts: cloneDeep(payload),
        layouts: cloneDeep(payload)
      };
    },

    // 重置layouts
    resetLayouts(state) {
      setLocalStorage('layouts', defaultLayouts);
      return {
        ...state,
        localLayouts: cloneDeep(defaultLayouts),
        layouts: cloneDeep(defaultLayouts)
      };
    },

    // 开关widget
    switchWidget(state, { payload }) {
      const { name, checked } = payload;
      const { layouts } = state;
      const newLayouts = {};
      if (checked) {
        Object.keys(layouts).forEach(key => {
          newLayouts[key] = [...layouts[key]];
          const widget = defaultLayouts[key].find(point => point.i === name);
          if (!layouts[key].some(point => point.i === name)) {
            newLayouts[key].push(widget);
          }
        });
      } else {
        Object.keys(layouts).forEach(key => {
          newLayouts[key] = layouts[key].filter(point => point.i !== name);
        });
      }
      setLocalStorage('layouts', newLayouts);
      return {
        ...state,
        layouts: cloneDeep(newLayouts),
        localLayouts: cloneDeep(newLayouts)
      };
    }
  }
};
