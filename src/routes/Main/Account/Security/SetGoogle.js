import React, { PureComponent } from 'react';
import { Input, Button, Icon, message } from 'antd';
import classnames from 'classnames';
import QRCode from 'qrcode.react';
import { setLocalStorage } from 'utils';
import request from 'utils/request';

import styles from './setGoogle.less';

class SetGoogle extends PureComponent {
  state = {
    qrcodeContent: '',
    secret: '',
    type: '',
    code: '',
    errorTip: '',
    disabled: false,
    number: 59,
    smsCode: ''
  };

  componentDidMount() {
    if (!this.props.account.googleAuth) {
      this.createGoogleCode();
    }
  }

  inputValue = e => {
    this.setState({ [e.target.id]: e.target.value });
  };

  createGoogleCode = () => {
    request('/user/createGoogleSecret').then(json => {
      if (json.code === 10000000) {
        const { qrcodeContent, secret, type } = json.data;
        this.setState({ qrcodeContent, secret, type });
      } else {
        message.error(json.msg);
      }
    });
  };

  countDown = () => {
    this.setState({
      disabled: true
    });
    this.timer = setInterval(() => {
      let { number } = this.state;
      if (number === 0) {
        clearInterval(this.timer);
        this.setState({
          number: 59,
          disabled: false
        });
      } else {
        this.setState({ number: number - 1 });
      }
    }, 1000);
  };

  submit = () => {
    const { localization, account, dispatch } = this.props;
    const { secret, code, smsCode } = this.state;
    if (/^\d{6}$/.test(code) && /^\d{6}$/.test(smsCode)) {
      request('/user/googleBinder', {
        body: { secret, code, smsCode }
      }).then(json => {
        if (json.code === 10000000) {
          message.success(localization['谷歌认证成功']);
          account.googleAuth = secret;
          dispatch({
            type: 'global/save',
            payload: { account }
          });
          setLocalStorage('account', account);
          this.props.onFold();
        } else {
          message.error(json.msg);
        }
      });
    } else {
      message.warn(localization['请输入6位数字谷歌验证码和短信验证码']);
    }
  };

  //获取验证码
  getCaptcha = () => {
    const { localization } = this.props;
    const { type } = this.state;
    //发送验证码
    request(`/user/${type === 1 ? 'mobile/sendMobileSms' : 'mail/sendMail'}`, {
      method: 'POST',
      body: {
        smsType: 'bander_google'
      }
    }).then(json => {
      if (json.code === 10000000) {
        message.success(localization['验证码发送成功']);
        this.countDown();
      }
    });
  };

  render() {
    const { localization } = this.props;
    const { qrcodeContent, secret, type, errorTip, code, smsCode, disabled, number } = this.state;
    return (
      <div className={styles.google}>
        <div className={styles.steps}>
          <h3 className={styles.title}>
            <strong>{localization['第一步']}: </strong> {localization['下载并安装谷歌验证器APP']}
          </h3>
          <div className={styles.content}>
            <a
              href="https://itunes.apple.com/us/app/google-authenticator/id388497605?mt=8"
              className={classnames(styles.downBtn, styles.apple)}
              target="_blank"
              rel="noopener noreferrer"
            >
              APP STORE
            </a>
            <a
              href="http://sj.qq.com/myapp/detail.htm?apkName=com.google.android.apps.authenticator2"
              className={classnames(styles.downBtn, styles.google)}
              target="_blank"
              rel="noopener noreferrer"
            >
              GOOGLE PLAY
            </a>
          </div>
        </div>
        <div className={styles.steps}>
          <h3 className={styles.title}>
            <strong>{localization['第二步']}: </strong> {localization['扫描二维码']}
          </h3>
          <div className={styles.content}>
            <div className={styles.qrcodeBox}>
              {qrcodeContent && (
                <QRCode
                  value={qrcodeContent}
                  size={110}
                  bgColor={'#ffffff'}
                  fgColor={'#000000'}
                  level={'L'}
                />
              )}
              <p>{localization['使用谷歌验证器APP扫描该二维码']}</p>
            </div>
            <div className={styles.qrcodeText}>
              <span className={styles.qrcodeNum}>{secret}</span>
              <p>
                {localization['如果您无法扫描二维码']}，<br />{' '}
                {localization['可以将该16位密钥手动输入到谷歌验证APP中']}
              </p>
            </div>
          </div>
        </div>
        <div className={styles.steps}>
          <h3 className={styles.title}>
            <strong>{localization['第三步']}: </strong> {localization['备份密钥']}
          </h3>
          <div className={styles.content}>
            <div className={styles.keyBox}>
              <Icon type="key" theme="outlined" />
              {secret}
            </div>
            <div className={styles.keyText}>
              <p>
                {localization['请将16位密钥记录在纸上，并保存在安全的地方']}。<br />
                {localization['如遇手机丢失，你可以通过该密钥恢复你的谷歌验证']}。
              </p>
              <p>
                <Icon type="exclamation-circle" theme="outlined" className="font-color-red" />
                <span
                  dangerouslySetInnerHTML={{
                    __html:
                      localization[
                        `通过人工客服重置你的谷歌验证需提交工单，可能需要<strong>至少7天</strong>时间来处理。`
                      ]
                  }}
                />
              </p>
            </div>
          </div>
        </div>
        <div className={styles.steps}>
          <h3 className={styles.title}>
            <strong>{localization['第四步']}: </strong> {localization['开启谷歌验证']}
          </h3>
          <div className={styles.content}>
            <p className={styles.errorTip}>
              {errorTip && <i className="iconfont icon-zhuyishixiang" />}
              {errorTip}
            </p>
            <ul className={styles.form}>
              <li>
                <Icon type="key" theme="outlined" />
                <Input
                  type="primary"
                  size="large"
                  value={secret}
                  placeholder={localization['16位秘钥']}
                  disabled
                />
              </li>
              <li>
                <Icon type="google" theme="outlined" />
                <Input
                  type="primary"
                  size="large"
                  id="code"
                  value={code}
                  onChange={this.inputValue}
                  placeholder={localization['谷歌验证码']}
                />
              </li>
              <li>
                <Input
                  id="smsCode"
                  size="large"
                  value={smsCode}
                  className={styles.code}
                  placeholder={localization[`${type === 1 ? '短信' : '邮箱'}验证码`]}
                  onChange={this.inputValue}
                />
                <Button
                  type="primary"
                  size="large"
                  disabled={disabled}
                  className={styles.get}
                  onClick={this.getCaptcha}
                >
                  {!disabled ? localization['获取验证码'] : number + 's'}
                </Button>
              </li>
            </ul>
            <div className={styles.direction}>
              <Button type="primary" size="large" onClick={this.submit}>
                {localization['提交']}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default SetGoogle;
