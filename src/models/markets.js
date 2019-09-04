import request from 'utils/request';
import { isEmpty } from 'lodash';
import { getLocalStorage } from 'utils';

const favoriteCoins = getLocalStorage('favoriteCoins') || [];

export default {
  namespace: 'markets',

  state: {
    favoriteCoins,
    tradePair: '',
    marketData: {}
  },

  subscriptions: {
    setup({ dispatch, _ }) {
      console.log('markets');
    }
  },

  effects: {
    // 获取市场数据
    *fetchMarketData(_, { call, put }) {
      const queryMakets = async () =>
        request('/index/allTradeExpair', {
          method: 'GET'
        });

      try {
        const response = yield call(queryMakets);

        const marketData = {};
        let tradePair = '';
        Object.keys(response.data).forEach((marketName, marketIndex) => {
          marketData[marketName] = response.data[marketName].map((pair, pairIndex) => {
            const key = `${pair.coinOther}/${pair.coinMain}`;
            if ((marketIndex === 0 && pairIndex === 0) || getLocalStorage('tradePair') === key)
              tradePair = key;
            return { ...pair, key, rise: pair.rise || '0.00%' };
          });
        });

        yield put({
          type: 'save',
          payload: {
            tradePair,
            marketData: isEmpty(marketData) ? {} : marketData
          }
        });
      } catch (error) {}
    }
  },

  reducers: {
    // 保存市场数据
    save(state, { payload }) {
      return {
        ...state,
        ...payload
      };
    },

    clear(state) {
      return {
        ...state
      };
    },

    // 保存交易对
    saveTradePair(state, { payload }) {
      return {
        ...state,
        tradePair: payload
      };
    },

    // 收藏交易对
    collectCoin(state, { payload }) {
      let { favoriteCoins } = state;
      const record = payload;
      if (favoriteCoins.includes(record.key)) {
        favoriteCoins = favoriteCoins.filter(key => key !== record.key);
      } else {
        favoriteCoins = [...favoriteCoins, record.key];
      }
      localStorage.setItem('favoriteCoins', JSON.stringify(favoriteCoins));
      return {
        ...state,
        favoriteCoins
      };
    }
  }
};
