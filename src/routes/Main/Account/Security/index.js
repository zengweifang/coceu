import React, { PureComponent } from 'react';
import { Button, message, Icon } from 'antd';
import ModifyPassword from './ModifyPassword';
import BindMobile from './BindMobile';
import ModifyMobile from './ModifyMobile';
import SetGoogle from './SetGoogle';
import classnames from 'classnames';
import EditMail from './EditMail';
import EditExPassword from './EditExPassword';
import EditTradeVerify from './EditTradeVerify';
import request from 'utils/request';
import UserCounterInfo  from './UserCounterInfo';

import styles from './index.less';

class Security extends PureComponent {
  state = {
    unfoldType: ''
  };

  componentDidMount(){
    this.getUserCounterInfo();
    this.getCounterInfo();
  }

  handleUnfold = unfoldType => {
    // const { localization, account } = this.props;
    // if (!account.mobile && unfoldType === 'exPassword') {
    //   return message.warn(localization['请先绑定手机号']);
    // }
    this.setState({ unfoldType });
  };

  // 获取国家和区号
  getCounterInfo = () => {
    request('/user/sysdict/countryCode', {
      method: 'GET'
    }).then(json => {
      if (json.code === 10000000) {
        localStorage.setItem('countryCode', JSON.stringify(json.data));
      }
    });
  };

  // 获取当前用户国家和区号
  getUserCounterInfo = () => {
    request('/user/sysdict/userCountryInfo', {
      method: 'GET'
    }).then(json => {
      if (json.code === 10000000) {
        var userCountryInfo = json.data;
        localStorage.setItem('countrySysname', userCountryInfo.countrySysname);
        localStorage.setItem('countrySyscode', userCountryInfo.countrySyscode);
      }
    });
  };

  render() {
    const { account, localization, viewport, dispatch } = this.props;

    const { mobile, mail, googleAuth, exValidType, exPassword } = account;
    const { unfoldType } = this.state;
    const onFold = this.handleUnfold.bind(this, '');
    const exValidText = {
      1: '谷歌验证',
      3: '手机验证',
      4: '邮箱验证'
    };

    var countrySysname = localStorage.getItem('countrySysname')!=='null' ? localStorage.getItem('countrySysname') : '--',
        countrySyscode = localStorage.getItem('countrySyscode')!=='null' ? localStorage.getItem('countrySyscode') : '--';


    return (
      <ul className={styles.security}>
        {/* {['mobile', 'mail', 'password', 'exPassword', 'c2cValid', 'google'].map(type => { */}
          {['mobile', 'mail', 'password', 'exPassword', 'userCountryInfo'].map(type => {
          const item = {
            mobile: {
              icon: type,
              text: `${localization['手机号']}: ${mobile || ''}`,
              btnText: localization[`${mobile ? '修改' : '绑定'}`],
              isShowBtn: true,
              component: mobile ? (
                <ModifyMobile {...{ localization, viewport, account, dispatch, onFold }} />
              ) : (
                <BindMobile {...{ localization, viewport, account, dispatch, onFold }} />
              )
            },
            mail: {
              icon: type,
              text: `${localization['邮箱']}: ${mail || ''}`,
              btnText: localization[`${mail ? '修改' : '绑定'}`],
              isShowBtn: !mail,
              component: <EditMail {...{ localization, viewport, account, dispatch, onFold }} />
            },
            password: {
              icon: 'key',
              text: `${localization['密码']}: ********`,
              btnText: localization['修改'],
              isShowBtn: true,
              component: <ModifyPassword {...{ localization, viewport, account, onFold }} />
            },
            exPassword: {
              icon: 'key',
              text: `${localization['资金密码']}: ********`,
              btnText: localization[`${exPassword ? '修改' : '设置'}`],
              isShowBtn: true,
              component: <EditExPassword {...{ localization, viewport, account, onFold }} />
            },
            userCountryInfo: {
              type: 'userCountryInfo',
              icon: 'key',
              text: `${countrySysname}［电话区号］${countrySyscode}`,
              btnText: localization[`${exPassword ? '修改' : '设置'}`],
              isShowBtn: false,
              component: <UserCounterInfo {...{ localization, viewport, account, onFold }} />
            },
            // c2cValid: {
            //   icon: 'lock',
            //   text: `${localization['交易验证方式']}: ${
            //     exValidType ? localization[exValidText[exValidType]] : ''
            //   }`,
            //   btnText: localization[`${exValidType ? '修改' : '设置'}`],
            //   isShowBtn: true,
            //   component: (
            //     <EditTradeVerify
            //       {...{ localization, viewport, account, exValidText, dispatch, onFold }}
            //     />
            //   )
            // },
            // google: {
            //   icon: type,
            //   text: `${localization['谷歌认证']} : ${googleAuth ? localization['已认证'] : ''}`,
            //   btnText: localization['认证'],
            //   isShowBtn: !googleAuth,
            //   component: <SetGoogle {...{ localization, viewport, account, dispatch, onFold }} />
            // }
          };
          return (
            <li
              key={type}
              className={classnames({
                [styles.card]: true,
                [styles.unfold]: unfoldType === type
              })}
            >
              <div className={styles.header}>
                <div className={styles.title}>
                  <Icon type={item[type].icon} theme="outlined" />
                  {item[type].text}
                </div>
                {item[type].isShowBtn && (
                  <Button
                    onClick={this.handleUnfold.bind(this, unfoldType === type ? '' : type)}
                    type="primary"
                  >
                    {unfoldType === type ? localization['取消'] : item[type].btnText}
                  </Button>
                )}
                {item[type].type === 'userCountryInfo' && 
                  (<div>
                  <Button
                  onClick={this.handleUnfold.bind(this, unfoldType === type ? '' : type)}
                  type="primary"
                  >
                  {unfoldType === type ? localization['取消'] : item[type].btnText}
                  </Button>
                  </div>)
                }
              </div>
              <div className={styles.action}>{unfoldType === type && item[type].component}</div>
            </li>
          );
        })}
      </ul>
    );
  }
}

export default Security;
