import React, { PureComponent, Fragment } from 'react';
import { Link } from 'dva/router';
import { Form, Input, Checkbox, Button, Modal, Icon, message } from 'antd';
// import NoCaptcha from 'components/NoCaptcha';
import { MOBILE_REGEX, PWD_REGEX, appKey } from 'utils/constants.js';
import { isPC, getQueryString } from 'utils';
import request from 'utils/request';
import JSEncrypt from 'utils/jsencrypt.js';
import { PUBLI_KEY } from 'utils/constants';

import styles from './index.less';

const FormItem = Form.Item;

class Mobile extends PureComponent {
  state = {
    registerType: 1,
    confirmDirty: false,
    disabled: false,
    number: 90,
    token: '',
    ncData: '',
    nc: '',
    popupVisible: false,
    inviteCode: getQueryString('inviteCode'),
    scene: isPC() ? 'nc_register' : 'nc_register_h5'
  };

  componentDidMount() {
    clearInterval(this.timer);
  }

  handleSubmit = e => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        const { mobile, password, code, inviteCode, agreement } = values;
        const { registerType } = this.state;
        if (agreement) {
          const encrypt = new JSEncrypt();
          encrypt.setPublicKey(PUBLI_KEY);
          const enPassword = encrypt.encrypt(password);

          this.register({ registerType, mobile, enPassword, code, inviteCode });
        } else {
          const { localization } = this.props;
          message.warn(localization['请先同意服务条款']);
        }
      }
    });
  };

  countDown = () => {
    this.setState({ disabled: true });
    this.timer = setInterval(() => {
      let { number } = this.state;
      if (number === 0) {
        clearInterval(this.timer);
        this.setState({
          number: 90,
          disabled: false
        });
      } else {
        this.setState({ number: number - 1 });
      }
    }, 1000);
  };

  getMobileCode = () => {
    const { disabled } = this.state;
    const { localization } = this.props;
    const mobile = this.props.form.getFieldsValue().mobile;
    if (MOBILE_REGEX.test(mobile)) {
      if (!disabled) {
        this.sendMobileCode();
        this.countDown();

      }
    } else {
      this.props.form.setFields({
        mobile: {
          errors: [new Error(localization['请输入正确的手机号'])]
        }
      });
    }
  };

  sendMobileCode = () => {
    const { localization } = this.props;
    // const { token, ncData, scene } = this.state;
    // const { csessionid, sig } = ncData;
    const mobile = this.props.form.getFieldsValue().mobile;
    request('/user/vaildCode/numRandom',{
      method: 'GET'
    }).then(res => {
      if (res.code === 10000000) {
        var numCode = res.data.numCode;
        var key  = numCode+'QsRA!2586@FdkG';
        let encrypt = new JSEncrypt();
        encrypt.setPublicKey(PUBLI_KEY);
        let vaildCodeKey = encrypt.encrypt(key);
        request(`/mobile/sendCode`, {
          body: {
            mobile,
            type: 'register',
            source: 'pc',
            // appKey,
            // sessionId: csessionid,
            // sig,
            // vtoken: token,
            // scene
            vaildCodeKey: vaildCodeKey
          }
        }).then(json => {
          if (json.code === 10000000) {
            message.success(localization[json.msg]);
          }
        });
      }
    });    
  };

  //滑动验证
  ncLoaded = (appKey, token, ncData, nc) => {
    if (ncData) {
      this.setState({ token, ncData, nc });
      this.props.form.setFields({
        noCaptche: {
          errors: null
        }
      });
    }
  };

  register = ({ registerType, mobile, enPassword, code, inviteCode }) => {
    request('/user/register', {
      body: {
        registerType,
        mobile,
        password: enPassword,
        code,
        inviteCode
      }
    }).then(json => {
      if (json.code === 10000000) {
        const { localization } = this.props;
        message.success(localization['恭喜你,注册成功']);
        if (window.JSCall) {
          window.JSCall.jumpToLogin(mobile, enPassword);
        } else if (getQueryString('inviteCode')) {
          this.setState({ popupVisible: true });
        } else {
          this.props.history.push('/login');
        }
      }
    });
  };

  comparePassword = (rule, value, callback) => {
    const { localization, form } = this.props;
    if (value && value !== form.getFieldValue('password')) {
      callback(localization['两次密码不一致']);
    } else {
      callback();
    }
  };

  handleConfirmBlur = e => {
    const value = e.target.value;
    this.setState({ confirmDirty: this.state.confirmDirty || !!value });
  };

  validateToNextPassword = (rule, value, callback) => {
    const form = this.props.form;
    if (value && this.state.confirmDirty) {
      form.validateFields(['confirm'], { force: true });
    }
    callback();
  };

  render() {
    const { localization, form, history } = this.props;
    const { getFieldDecorator } = form;
    const { disabled, number, inviteCode, scene, popupVisible } = this.state;
    return (
      <Fragment>
        <Form onSubmit={this.handleSubmit}>
          <Input style={{ display: 'none' }} type="password" />
          <FormItem>
            <div className={styles.title}>{localization['手机号']}</div>
            {getFieldDecorator('mobile', {
              rules: [
                { required: true, message: localization['请输入手机号'] },
                {
                  pattern: MOBILE_REGEX,
                  message: localization['手机号不正确']
                }
              ],
              validateTrigger: 'onBlur'
            })(<Input size="large" />)}
          </FormItem>
          {/* <FormItem>
            <div className={styles.title}>{localization['滑动验证']}</div>
            {getFieldDecorator('noCaptche')(
              <NoCaptcha
                domID="nc_register_mobile"
                scene={scene}
                ncCallback={(appKey, token, ncData, nc) => {
                  this.ncLoaded(appKey, token, ncData, nc);
                }}
              />
            )}
          </FormItem> */}
          <FormItem className={styles.codeForm}>
            <div className={styles.title}>{localization['手机验证码']}</div>
            {getFieldDecorator('code', {
              rules: [
                { required: true, message: localization['请输入手机验证码'] },
                {
                  pattern: /^\d{6}$/,
                  message: localization['请输入6位数字手机验证码']
                }
              ],
              validateTrigger: 'onBlur'
            })(
              <div className="form-code">
                <Input size="large" />
                <Button
                  type="primary"
                  size="large"
                  disabled={disabled}
                  onClick={this.getMobileCode}
                >
                  {!disabled ? localization['获取验证码'] : number + 'S'}
                </Button>
              </div>
            )}
          </FormItem>
          <FormItem>
            <div className={styles.title}>{localization['密码']}</div>
            {getFieldDecorator('password', {
              rules: [
                { required: true, message: localization['请输入密码'] },
                {
                  pattern: PWD_REGEX,
                  message: localization['输入8-20位密码包含数字,字母']
                },
                { validator: this.validateToNextPassword }
              ],
              validateTrigger: 'onBlur'
            })(<Input size="large" type="password" />)}
          </FormItem>
          <FormItem>
            <div className={styles.title}>{localization['确认密码']}</div>
            {getFieldDecorator('confirm', {
              rules: [
                { required: true, message: localization['请再次输入密码'] },
                { validator: this.comparePassword }
              ],
              validateTrigger: 'onBlur'
            })(<Input size="large" type="password" onBlur={this.handleConfirmBlur} />)}
          </FormItem>
          <FormItem className="signup-last-form-item">
            <div hidden={getQueryString('inviteCode')}>
              <div className={styles.title}>{localization['邀请码']}</div>
              {getFieldDecorator('inviteCode', {
                initialValue: inviteCode,
                rules: [{ pattern: /^\d+$/, message: localization['请输入数字邀请码'] }],
                validateTrigger: 'onBlur'
              })(<Input size="large" />)}
            </div>
          </FormItem>
          <FormItem>
            {getFieldDecorator('agreement', {
              valuePropName: 'checked',
              initialValue: true
            })(<Checkbox className="agree-text">{localization['我已阅读并同意']}</Checkbox>)}
            <Link to="/link/agreement" className="link-agree" target="_blank">
              {localization['服务条款']}
            </Link>
          </FormItem>
          <Button type="primary" htmlType="submit" size="large" style={{ width: '100%' }}>
            {localization['注册']}
          </Button>
        </Form>
        <Modal centered footer={null} closable={false} maskClosable={false} visible={popupVisible}>
          <div className={styles.guideDownload}>
            <Icon type="check-circle" theme="filled" />
            <h3>{localization['注册成功']}</h3>
            <div className={styles.operation}>
              <Button
                type="primary"
                size="large"
                onClick={() => {
                  history.push('/login');
                }}
              >
                {localization['马上登录']}
              </Button>
              <Button
                type="primary"
                size="large"
                className={styles.download}
                onClick={() => {
                  history.push('/download');
                }}
              >
                {localization['下载']}&nbsp;mgex APP
              </Button>
            </div>
          </div>
        </Modal>
      </Fragment>
    );
  }
}

export default Form.create()(Mobile);
