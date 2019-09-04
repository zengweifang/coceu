import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Link } from 'dva/router';
import { Input, Icon, Button, message } from 'antd';
// import NoCaptcha from 'components/NoCaptcha';
import JSEncrypt from 'utils/jsencrypt.js';
import { PUBLI_KEY } from 'utils/constants';

import styles from './index.less';

@connect(({ login }) => ({ ...login }))
class LogIn extends PureComponent {
  inputValue = e => {
    this.props.dispatch({
      type: 'login/save',
      payload: { [e.target.id]: e.target.value }
    });
  };

  handleSubmit = () => {
    this.props.dispatch({
      type: 'login/save',
      payload: { disabled: true }
    });
    const { username, password, appKey, token, ncData, scene, nc } = this.props;
    const { csessionid, sig } = ncData;
    let encrypt = new JSEncrypt();
    encrypt.setPublicKey(PUBLI_KEY);
    let enPassword = encrypt.encrypt(password);

    if (username && password) {
      const ncParams = ncData
        ? {
          appKey,
          sessionId: csessionid,
          sig,
          vtoken: token,
          scene
        }
        : {};

      this.props.dispatch({
        type: 'login/login',
        payload: {
          username,
          password: enPassword,
          source: 'pc',
          // ...ncParams
        }
      });

      // nc && nc.reload(); //如果有验证滑块就要重新加载
    }
  };

  handleFastSubmit = e => {
    if (e.which === 13) {
      this.handleSubmit();
    }
  };

  render() {
    const {
      localization,
      username,
      password,
      errorTip,
      requireCaptcha,
      disabled,
      ncData,
      scene,
      match
    } = this.props;
    const ok = username && password && (!requireCaptcha || (requireCaptcha && ncData));
    const [matchPath] = /\/mobile/.exec(match.url) || [''];

    return (
      <div className={styles.wrap}>
        <h2>{localization['用户登录']}</h2>
        {errorTip && (
          <div className={styles.errorTxt}>
            <Icon type="info-circle" theme="outlined" />
            {localization[errorTip]}
          </div>
        )}
        <div>
          <p>{localization['手机/邮箱']}</p>
          <Input size="large" id="username" onChange={this.inputValue} />
        </div>
        <div className={styles.pwd}>
          <p>{localization['密码']}</p>
          <Input
            size="large"
            id="password"
            type="password"
            onChange={this.inputValue}
            onKeyUp={this.handleFastSubmit}
          />
        </div>
        {/* {requireCaptcha && (
          <div className={styles.slider}>
            <p>{localization['滑动验证']}</p>
            <NoCaptcha
              scene={scene}
              ncCallback={(appKey, token, ncData, nc) => {
                if (ncData) {
                  this.props.dispatch({
                    type: 'login/save',
                    payload: { appKey, token, ncData, nc }
                  });
                } else {
                  message.destroy();
                  message.error('请先进行验证', 1);
                }
              }}
            />
          </div>
        )} */}
        <Button
          size="large"
          type="primary"
          className={styles.btn}
          disabled={!ok || disabled}
          onClick={this.handleSubmit}
        >
          {localization['登录']}
        </Button>
        <ul className={styles.links}>
          <li>
            <Link to={`${matchPath}/reset`}>{localization['忘记密码']} ?</Link>
          </li>
          <li>
            {localization['还没账号']} ?{' '}
            <Link to={`${matchPath}/signup`}>{localization['立即注册']}</Link>
          </li>
        </ul>
        <p className="font-color-red">
          {localization['请不要透露密码、短信和谷歌验证码予任何人，包括UES工作人员。']}
        </p>
      </div>
    );
  }
}
export default LogIn;
