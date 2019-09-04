import store from '../index';
import request from 'utils/request';
import { getLocalStorage, isEmpty } from 'utils';

const language = getLocalStorage('language') || 'zh_CN';
const localization = require(`languages/${language}`).default;
const account = getLocalStorage('account') || {};

export default {
  namespace: 'global',

  state: {
    hideMainHeaderBgColor: false,
    account,
    language,
    localization,
    theme: 'light',
    isLogin: !isEmpty(account),
    isC2cVisible: false,
    isRankVisible: false,
    // usdtToCnyRate: 6.8,
    usdtToCnyRate: 7,
    rateInfo: {}, // 汇率信息 { btcLastPrice, ethLastPrice, cnbBtcLastPrice, cnbEthLastPrice }
    successMsg: '',
    errorMsg: '',
    infoMsg: '',
    warnMsg: ''
  },

  subscriptions: {
    setup({ dispatch, history }) {
      console.log('global');
      dispatch({ type: 'fetchRate' });
      dispatch({ type: 'decideShowC2c' });
      // dispatch({ type: 'decideShowRank' });
    }
  },

  effects: {
    // 判断是否显示c2c
    *decideShowC2c(_, { call, put }) {
      const queryC2cVisibility = () =>
        request('/index/sys/config', {
          method: 'GET'
        });

      try {
        const response = yield call(queryC2cVisibility);
        if (response.code === 10000000 && response.data?.offlineOnOff === '0') {
          yield put({
            type: 'save',
            payload: {
              isC2cVisible: true
            }
          });
        }
      } catch (error) {}
    },

    //判断是否显示百团大战
    *decideShowRank(_, { call, put }) {
      const queryRankVisibility = () =>
        request('/mk2/teammining/conf', {
          method: 'GET'
        });

      try {
        const response = yield call(queryRankVisibility);
        if (response.code === 10000000 && response.data.show === '1') {
          yield put({
            type: 'save',
            payload: {
              isRankVisible: true
            }
          });
        }
      } catch (error) {}
    },

    // 获取汇率
    *fetchRate(_, { call, put }) {
      const queryRate = () =>
        request('/index/lastPrice', {
          method: 'GET'
        });

      try {
        const response = yield call(queryRate);
        yield put({
          type: 'save',
          payload: {
            rateInfo: response.data
          }
        });
      } catch (error) {}
    },

    *logout(_, { call, put }) {
      // 清空sessionStorage
      localStorage.removeItem('account');

      // 清空models状态
      const models = store.getState();
      for (let model in models) {
        if (models[model] && model !== 'routing') {
          yield put({ type: `${model}/clear` });
        }
      }

      // 发送退出请求
      try {
        const requestLogout = () => request('/user/logout');
        yield call(requestLogout);
      } catch (error) {}
    },
    // 改变头部颜色
    *changeMainHeaderBgColor({ payload }, { put }) {
      yield put({
        type: 'save',
        payload: {
          hideMainHeaderBgColor: payload
        }
      })
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
        account: {},
        isLogin: false,
        rateInfo: {}, // 汇率信息 { btcLastPrice, ethLastPrice, cnbBtcLastPrice, cnbEthLastPrice }
        successMsg: '',
        errorMsg: '',
        infoMsg: '',
        warnMsg: ''
      };
    },

    // 更新rateInfo汇率
    updateRateInfo(state, { payload }) {
      return {
        ...state,
        rateInfo: {
          ...state.rateInfo,
          ...payload
        }
      };
    },

    // 切换语言
    switchLanguage(state, { payload }) {
      const { language } = payload;
      const { zE } = window;
      const localization = require(`languages/${language}`).default; // 根据language加载相应的语言包
      localStorage.setItem('language', language); // 保存语言到localstorage
      zE && zE.setLocale && zE.setLocale(language); //zendesk 语言切换
      return { ...state, language, localization };
    },

    // 修改主题
    changeTheme(state, { payload }) {
      return {
        ...state,
        theme: payload
      };
    }
  }
};
