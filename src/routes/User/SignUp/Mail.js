import React, { PureComponent } from 'react';
import { Link } from 'dva/router';
import { Form, Input, Checkbox, Button, message } from 'antd';
// import NoCaptcha from 'components/NoCaptcha';
import { MAIL_REGEX, PWD_REGEX, appKey } from 'utils/constants.js';
import { isPC, getQueryString } from 'utils';
import request from 'utils/request';
import JSEncrypt from 'utils/jsencrypt.js';
import { PUBLI_KEY } from 'utils/constants';

import styles from './index.less';

const FormItem = Form.Item;

class Mail extends PureComponent {
  state = {
    registerType: 2,
    confirmDirty: false,
    disabled: false,
    number: 90,
    token: '',
    ncData: '',
    nc: '',
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
        const { mail, password, code, inviteCode, agreement } = values;
        const { registerType } = this.state;
        if (agreement) {
          const encrypt = new JSEncrypt();
          encrypt.setPublicKey(PUBLI_KEY);
          const enPassword = encrypt.encrypt(password);

          this.mailRegister({
            registerType,
            mail,
            enPassword,
            code,
            inviteCode
          });
        } else {
          const { localization } = this.props;
          message.warn(localization['请先同意服务条款']);
        }
      }
    });
  };

  mailRegister = ({ registerType, mail, enPassword, code, inviteCode }) => {
    request('/user/register', {
      body: {
        registerType,
        mail,
        password: enPassword,
        code,
        inviteCode
      }
    }).then(json => {
      if (json.code === 10000000) {
        const { localization } = this.props;
        message.success(localization['恭喜你,注册成功']);
        this.props.history.push('/login');
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

  getMailCode = () => {
    const { ncData, nc, disabled } = this.state;
    const { localization } = this.props;
    const mail = this.props.form.getFieldsValue().mail;
    if (MAIL_REGEX.test(mail)) {
      if (!disabled) {
        this.sendMailCode();
        this.countDown();
        // if (nc) {
        //   nc.reload();
        //   this.setState({ ncData: '' });
        // }
      }
    } else {
      this.props.form.setFields({
        mail: {
          errors: [new Error(localization['请输入正确的邮箱'])]
        }
      });
    }
  };

  sendMailCode = () => {
    // const { token, ncData, scene } = this.state;
    // const { csessionid, sig } = ncData;
    const mail = this.props.form.getFieldsValue().mail;
    request(`/mail/sendCode`, {
      body: {
        mail,
        type: 'register',
        source: 'pc',
        // appKey,
        // sessionId: csessionid,
        // sig,
        // vtoken: token,
        // scene
      }
    }).then(json => {
      if (json.code === 10000000) {
        message.success(json.msg);
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

  comparePassword = (rule, value, callback) => {
    const { localization } = this.props;
    const form = this.props.form;
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
    const { localization, form } = this.props;
    const { getFieldDecorator } = form;
    const { disabled, number, inviteCode, scene } = this.state;
    return (
      <Form onSubmit={this.handleSubmit}>
        <Input style={{ display: 'none' }} type="password" />
        <FormItem>
          <div className={styles.title}>{localization['邮箱']}</div>
          {getFieldDecorator('mail', {
            rules: [
              { required: true, message: localization['请输入邮箱'] },
              {
                pattern: MAIL_REGEX,
                message: localization['邮箱不正确']
              }
            ],
            validateTrigger: 'onBlur'
          })(<Input size="large" />)}
        </FormItem>
        {/* <FormItem>
          <div className={styles.title}>{localization['滑动验证']}</div>
          {getFieldDecorator('noCaptche')(
            <NoCaptcha
              domID="nc_register_mail"
              scene={scene}
              ncCallback={(appKey, token, ncData, nc) => {
                this.ncLoaded(appKey, token, ncData, nc);
              }}
            />
          )}
        </FormItem> */}
        <FormItem className={styles.codeForm}>
          <div className={styles.title}>{localization['邮箱验证码']}</div>
          {getFieldDecorator('code', {
            rules: [
              { required: true, message: localization['请输入邮箱验证码'] },
              {
                pattern: /^\d{6}$/,
                message: localization['请输入6位邮箱验证码']
              }
            ],
            validateTrigger: 'onBlur'
          })(
            <div className="form-code">
              <Input size="large" />
              <Button type="primary" size="large" disabled={disabled} onClick={this.getMailCode}>
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
              { required: true, message: localization['请输入确认密码'] },
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
        <Button
          type="primary"
          htmlType="submit"
          size="large"
          onClick={this.handleSubmit}
          style={{ width: '100%' }}
        >
          {localization['注册']}
        </Button>
      </Form>
    );
  }
}

export default Form.create()(Mail);
