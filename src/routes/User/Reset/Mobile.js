import React, { PureComponent } from 'react';
import { withRouter } from 'react-router-dom';
import { Form, Input, Button, message } from 'antd';
import JSEncrypt from 'utils/jsencrypt.js';
import NoCaptcha from 'components/NoCaptcha';
import { isPC } from 'utils';
import request from 'utils/request';
import { PUBLI_KEY, PWD_REGEX, MOBILE_REGEX } from 'utils/constants';

import styles from './index.less';

const FormItem = Form.Item;

class Mobile extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      popup: '',
      confirmDirty: false,
      disabled: false,
      number: 90,
      appKey: '',
      token: '',
      ncData: '',
      nc: '',
      scene: isPC() ? 'nc_register' : 'nc_register_h5',
      mobile:''
    };
  }

  componentWillUnmount() {
    clearInterval(this.timer);
  }

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

  closeModal = () => {
    this.setState({ popup: '' });
  };

  sendMobileCode = () => {
    const { localization } = this.props;
    const { appKey, token, ncData, scene } = this.state;
    const { csessionid, sig } = ncData;
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
            type: 'reset',
            source: 'pc',
            appKey,
            sessionId: csessionid,
            sig,
            vtoken: token,
            scene,
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

  //获取手机验证码
  getMobileCode = () => {
    const { localization } = this.props;
    const { mobile } = this.props.form.getFieldsValue();
    const { ncData, nc, disabled } = this.state;
    if (MOBILE_REGEX.test(mobile)) {
      if (!disabled) {
        this.sendMobileCode();
        this.countDown();
        if (nc) {
          nc.reload();
          this.setState({ ncData: '' });
        }
      }
    } else {
      const { localization } = this.props;
      this.props.form.setFields({
        mobile: {
          errors: [new Error(localization['请输入正确的手机号'])]
        }
      });
    }
  };

  //滑动验证
  ncLoaded = (appKey, token, ncData, nc) => {
    if (ncData) {
      this.setState({ appKey, token, ncData, nc });
      this.props.form.setFields({
        noCaptche: {
          errors: null
        }
      });
    }
  };

  //重置密码
  resetPwd = (mobile, password, code) => {
    const { localization } = this.props;
    request('/user/mobile/resetpwd', {
      body: {
        mobile,
        password,
        code
      }
    }).then(json => {
      if (json.code === 10000000) {
        message.success(localization[json.msg]);
        if (window.JSCall) {
          window.JSCall.jumpToLogin(mobile, password);
        } else {
          this.props.history.push('/login');
        }
      }
    });
  };

  handleSubmit = e => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        let { mobile, password, code } = values;
        let encrypt = new JSEncrypt();
        encrypt.setPublicKey(PUBLI_KEY);
        const enPassword = encrypt.encrypt(password);
        this.resetPwd(mobile, enPassword, code);
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

  inputValue = e => {
    this.setState({
      mobile: e.target.value
    })
  };

  render() {
    const { localization, form, location } = this.props;
    const { getFieldDecorator } = form;
    const { disabled, number, scene, ncData, mobile } = this.state;

    let mobileValue = '';
    if (location.search) {
      mobileValue = location.search.substr(1).split('=')[1];
    }

    return (
      <Form onSubmit={this.handleSubmit}>
        <Input style={{ display: 'none' }} type="password" />
        <FormItem>
          <div className={styles.title}>{localization['手机号']}</div>
          {getFieldDecorator('mobile', {
            rules: [
              { required: true, message: localization['请输入手机号'] },
              { pattern: MOBILE_REGEX, message: localization['手机号不正确'] }
            ],
            validateTrigger: 'onBlur',
            initialValue: mobileValue
          })(<Input size="large" onChange={this.inputValue}/>)}
        </FormItem>
        <FormItem>
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
        </FormItem>
        <FormItem>
          <div className={styles.title}>{localization['手机验证码']}</div>
          {getFieldDecorator('code', {
            rules: [
              { required: true, message: localization['请输入手机验证码'] },
              { pattern: /^\d{6}$/, message: localization['请输入6位手机验证码'] }
            ],
            validateTrigger: 'onBlur'
          })(
            <div className="form-code">
              <Input size="large" />
              <Button type="primary" size="large" disabled={disabled || !ncData || !mobile} onClick={this.getMobileCode}>
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
        <Button type="primary" htmlType="submit" size="large" style={{ width: '100%' }}>
          {localization['确定']}
        </Button>
      </Form>
    );
  }
}

export default withRouter(Form.create()(Mobile));
