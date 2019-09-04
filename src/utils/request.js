/*
 * @author William Cui
 * @description 使用Promise封装接口请求方法
 * @param url {String} 请求地址 【必填】
 * @param method {String} 请求方式 【选填】 默认POST
 * @param headers {Object} 请求头对象 【选填】
 * @param body {Object} 请求参数对象 【选填】
 * @param timeout {Number} 请求超时时间 【选填】 默认60s
 * @return Promise 对象
 * @date 2017-08-25
 */

import store from '../index';
import fetch from 'dva/fetch';
import { getLocalStorage } from 'utils';
import VerifyPopup from 'components/VerifyPopup';
import { render, unmountComponentAtNode } from 'react-dom';
import GoogleVerifyPopup from 'components/GoogleVerifyPopup';
import CaptchaVerifyPopup from 'components/CaptchaVerifyPopup';

const Popup = document.querySelector('#popup');
function closePopup() {
  unmountComponentAtNode(Popup);
}

const codeMessage = {
  200: '服务器成功返回请求的数据。',
  201: '新建或修改数据成功。',
  202: '一个请求已经进入后台排队（异步任务）。',
  204: '删除数据成功。',
  400: '发出的请求有错误，服务器没有进行新建或修改数据的操作。',
  401: '用户没有权限（令牌、用户名、密码错误）。',
  403: '用户得到授权，但是访问是被禁止的。',
  404: '发出的请求针对的是不存在的记录，服务器没有进行操作。',
  406: '请求的格式不可得。',
  410: '请求的资源被永久删除，且不会再得到的。',
  422: '当创建一个对象时，发生一个验证错误。',
  500: '服务器发生错误，请检查服务器。',
  502: '网关错误。',
  503: '服务不可用，服务器暂时过载或维护。',
  504: '网关超时。'
};

function request(
  url,
  { method = 'POST', headers, body, timeout = 1000 * 60, customMsg = false } = {}
) {
  //键值对转换为字符串
  function params(body) {
    var arr = [];
    Object.keys(body).forEach((key, index) => {
      arr.push(encodeURIComponent(key) + '=' + encodeURIComponent(body[key]));
    });
    return arr.join('&');
  }

  const requestPromise = new Promise((resolve, reject) => {
    const opts = {
      method,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        ...headers
      }
    };

    var test = 1;
    if(test === 2){
      switch(url){
        case '/balance/volume/list':
          url = '/mock/volumelist.json';
          break;
        case '/balance/volume/rank':
          url = '/mock/volumerank.json';
          break;
        case '/user/invotes':
          url = '/mock/userinvotes.json';
          break;
        case '/balance/volume/inviteUserList':
              url = '/mock/volumeinviteuserlist.json';
              break;
        case '/balance/volume/change':
            url = '/mock/volumechange.json';
            break;  
        case '/balance/volume/financeDetails':
            url = '/mock/volumefinancedetails.json';
            break;
        case '/balance/volume/accessList':
            url = '/mock/accessList.json';
            break;  
        case '/coin/list':
            url = '/mock/coinlist.json';
            break;
        case '/balance/volume/add':
            url = '/mock/volumeadd.json';
            break;
        case '/balance/volume/takeOutIncome':
            url = '/mock/volumetakeoutincome.json';
            break;
        case '/balance/volume/countNum':
            url = '/mock/countnum.json';
            break;  
      case '/balance/volume/userChange':
              url = '/mock/volumeuserchange.json';
              break;  
        default:
          break;
      }
    }

    if (body) {
      if (method === 'POST') {
        opts.body = params(body);
      } else {
        url = `${url}?${params(body)}`;
      }
    }

    //如果已经登录了要把stoken放入headers
    const account = getLocalStorage('account');
    if (account) {
      opts.headers['stoken'] = account.token;
    }

    fetch(`/biao${url}`, opts)//代理链接使用这个
    // var coceu = 'http://www.coceu.com';
    // fetch(coceu+'/biao'+url,opts)
    // fetch(url, opts)
      .then(response => {
        if (response.ok) {
          if (response.headers.get('Content-Length') === '0') {
            return { code: -5 }; // 用户登录失效
          } else {
            return response.status === 200 ? response.json() : { status: response.status };
          }
        } else {
          reject({
            status: response.status,
            msg: codeMessage[response.status]
          });
        }
      })
      .then(json => {
        let errorMsg;
        let PopupComponent;
        const { dispatch } = store;
        const models = store.getState();
        const { localization, account } = models.global;

        if (!json) errorMsg = '处理失败';

        if (json.code === -5 || json.code === -8) {
          // 登录失效，清空account
          localStorage.removeItem('account');

          // 给出失效提示
          const warnMsg = json.code === -5 ? '用户登录失效' : '用户被挤出';
          dispatch({
            type: 'global/save',
            payload: { warnMsg }
          });

          // 清空models状态
          for (let model in models) {
            if (models[model] && model !== 'routing') {
              dispatch({ type: `${model}/clear` });
            }
          }
        } else if (json.code === -9) {
          const { exValidType } = account;
          if (exValidType) {
            // 如果已经已经设置 验证方式
            // 谷歌1, 手机 3, 邮箱 4
            if (exValidType === 1) {
              // 如果已经谷歌绑定了，去输入谷歌验证码
              PopupComponent = GoogleVerifyPopup;
            } else {
              // 输入手机或邮箱验证码
              PopupComponent = CaptchaVerifyPopup;
            }
          } else {
            // 去绑定交易验证方式
            PopupComponent = VerifyPopup;
          }
        } else if (json.code === 10005049) {
          // 去绑定交易验证方式
          PopupComponent = VerifyPopup;
        } else if (json.code !== 10000000 && !customMsg) {
          errorMsg = json.msg;
        }

        if (PopupComponent) {
          render(<PopupComponent {...{ closePopup, localization, dispatch, account }} />, Popup);
        } else if (errorMsg) {
          // 显示错误信息
          dispatch({ type: 'global/save', payload: { errorMsg: json.msg } });
        }

        resolve(json);
      })
      .catch(errorMsg => {
        console.log('catch errorMsg: ', errorMsg);
        reject(errorMsg);
      });
  });

  const timeoutPromise = new Promise((resolve, reject) => {
    setTimeout(function() {
      reject('请求超时!');
    }, timeout);
  });

  return Promise.race([requestPromise, timeoutPromise]);
}

export default request;
