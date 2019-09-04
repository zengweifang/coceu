import request from 'utils/request';
import { routerRedux } from 'dva/router';
import store from '../index';
import { isPC, setLocalStorage } from 'utils';

const scene = isPC() ? 'nc_register' : 'nc_register_h5';

export default {
  namespace: 'login',

  state: {
    scene,
    username: '',
    password: '',
    errorTip: '',
    disabled: false,
    requireCaptcha: false,
    appKey: '',
    token: '',
    ncData: '',
    nc: null
  },

  subscriptions: {
    setup({ dispatch, history }) {
      console.log('login');
    }
  },

  effects: {
    *login({ payload }, { call, put }) {
      yield put({
        type: 'save',
        payload: {
          disabled: true
        }
      });

      const requireUser = () =>
        request('/user/login', {
          body: payload,
          customMsg: true
        });

      // const imReguster = () => request('/easemob/register', { customMsg: true });

      try {
        const response = yield call(requireUser);

        let errorTip = '';
        let requireCaptcha = false;

        if (response.code === 10000000) {
          let account = response.data;
          setLocalStorage('account', account);

          const { isRegisteredCs } = account;
          // if (isRegisteredCs === '0') {
          //   // 注册客服
          //   const imJson = yield call(imReguster);
          //   if (imJson.code === 10000000) {
          //     account.isRegisteredCs = '1';
          //     setLocalStorage('account', account);
          //   }
          // }

          const historyNum = isPC() ? 2 : 1;
          if (window.history.length > historyNum) {
            store.dispatch(routerRedux.goBack());
          } else {
            store.dispatch(routerRedux.push('/'));
          }
          yield put({
            type: 'global/save',
            payload: {
              account,
              isLogin: true
            }
          });
          yield put({ type: 'clear' });
        } else {
          if (response.code === 10001001) {
            // requireCaptcha = true;
            if (response.msg === 'Invalid Credentials' || response.msg === '用户不存在') {
              errorTip = '用户名或密码不正确';
            } else {
              errorTip = response.msg;
            }
          } else if (response.code === 10001000) {
            errorTip = '用户名或密码不正确';
          } else if (response.code === 10004007) {
            errorTip = '用户名或密码不正确';
          } else {
            if (response.msg === 'Invalid Credentials') {
              errorTip = '用户名或密码不正确';
            } else {
              errorTip = response.msg;
            }
          }

          yield put({
            type: 'save',
            payload: {
              errorTip,
              requireCaptcha,
              disabled: false,
              ncData: ''
            }
          });
        }
      } catch (error) { }
    }
  },

  reducers: {
    // 保存数据
    save(state, { payload }) {
      return { ...state, ...payload };
    },

    // 清空数据
    clear() {
      return {
        scene,
        username: '',
        password: '',
        errorTip: '',
        disabled: false,
        requireCaptcha: false,
        appKey: '',
        token: '',
        ncData: '',
        nc: null
      };
    }
  }
};
